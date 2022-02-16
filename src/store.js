
import { createStore } from 'vuex'
import axios from 'axios'

const allConsonants = require('./assets/consonants.json')
const allVowels = require('./assets/vowels.json')

const api = axios.create({
  // baseURL: "http://localhost:3000",
  baseURL: "https://langgen-api.herokuapp.com",
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
})

const selectConsonant = (c) => {
  const features = ['aspirated', 'lateral', 'manner', 'nonpulmonic', 'place', 'sibilant', 'voiced'];
  const found = allConsonants.find(cc => {
    return features.reduce((match, feat) => {
      return match && c[feat] == cc[feat]
    }, true)
  }) || {};
  found.selected = true;
  return found
}

const selectVowel = (v) => {
  const features = ['frontness', 'height', 'long', 'nasal', 'rounding'];
  const found = allVowels.find(vv => {
    return features.reduce((match, feat) => {
      return match && v[feat] == vv[feat]
    }, true)
  }) || {};
  found.selected = true;
  return found
}

const store = createStore({
  state() {
    return {
      progress: 0, // start: 0, phonology: 1-2, phonotactics: 3-5, words: 6
      consonants: [],
      vowels: [],
      languageID: "",
      words: [],
      toast: {
        type: null,
        message: null,
        active: false
      }
    }
  },
  mutations: { 
    setLanguageID(state, payload) {
      console.log("New language ID:", payload)
      state.languageID = payload
    },
    advanceProgress(state, payload) {
      if(payload != null) {
        state.progress = payload % 7
      } else {
        state.progress = (state.progress + 1) % 7
      }
      window.scrollTo(0, 0)
    },
    updateConsonants(state, payload) {
      state.consonants = payload
      console.log("updated consonants", payload)
    },
    updateVowels(state, payload) {
      state.vowels = payload
      console.log("updated vowels", payload)
    },
    setWords(state, payload) {
      state.words = payload
    },
    successToast(state, payload) {
      state.toast = {
        type: 'success',
        message: payload,
        active: true
      }
    },
    errorToast(state, payload) {
      state.toast = {
        type: 'error',
        message: payload,
        active: true
      }
    },
    stopToast(state) {
      state.toast.active = false
    }
  },
  actions: { 
    ping(context) {
      console.log("dispatching ping...")
      api.get("/ping")
      .then(response => {
        context.dispatch("successToast", "Successfully pinged server")
        console.log(response)
      })
      .catch(err => {
        context.dispatch("errorToast", err)
      })
    },
    createNewLanguage(context) {
      api.get("/")
      .then(res => {
        if(res.status == 200) {
          context.commit('setLanguageID', res.data)
          context.commit('updateConsonants', [])
          context.commit('updateVowels', [])
          context.commit('advanceProgress')
          context.dispatch("successToast", "Created new language: " + res.data)
        }
      })
      .catch(err => {
        context.dispatch("errorToast", err)
      })
    },
    loadLanguage(context, payload) {
      api.get("/phonology/" + payload)
      .then(res => {
        console.log("Inventory: ", res)
        context.commit('setLanguageID', payload)
        context.commit('updateConsonants', res.data.consonants.map(selectConsonant))
        context.commit('updateVowels', res.data.vowels.map(selectVowel))
        context.commit('advanceProgress')
        context.dispatch("successToast", "Successfully fetched phonemic inventory")
      })
      .catch(err => {
        context.dispatch("errorToast", err)
      })
    },
    advanceProgress(context, payload) {
      context.commit('advanceProgress', payload)
    },
    // Phonology
    updateConsonants(context, payload) {
      api.post("/phonology/consonants", {id: context.getters.getLanguageID, data: payload})
      .then(res => {
        if(res.status == 200) {
          context.commit('updateConsonants', payload)
          context.dispatch("successToast", "Successfully updated consonant inventory")
          context.commit('advanceProgress')
        }
      })
      .catch(err => {
        context.dispatch("errorToast", err)
      })
    },
    updateVowels(context, payload) {
      api.post("/phonology/vowels", {id: context.getters.getLanguageID, data: payload})
      .then(res => {
        if(res.status == 200) {
          context.commit('updateVowels', payload)
          context.dispatch("successToast", "Successfully updated vowel inventory")
          context.commit('advanceProgress')
        }
      })
      .catch(err => {
        context.dispatch("errorToast", err)
      })
    },
    // Phonotactics
    updateConsonantHierarchy(context, payload) {
      api.post("/phonotactics/consonant-hierarchy", {id: context.getters.getLanguageID, data: payload})
      .then(res => {
        if(res.status == 200) {
          context.dispatch("successToast", "Successfully updated consonant clusters")
          context.commit('advanceProgress')
        }
      })
      .catch(err => {
        context.dispatch("errorToast", err)
      })
    },   
    updateVowelHierarchy(context, payload) {
      api.post("/phonotactics/nucleus-hierarchy", {id: context.getters.getLanguageID, data: payload})
      .then(res => {
        if(res.status == 200) {
          context.dispatch("successToast", "Successfully updated nucleus clusters")
          context.commit('advanceProgress')
        }
      })
      .catch(err => {
        context.dispatch("errorToast", err)
      })
    },
    // Lexicon
    getWords(context) {
      api.get("/lexicon/new-words/" + context.getters.getLanguageID)
      .then(res => {
        if(res.status == 200) {
          context.commit('setWords', res.data)
          context.dispatch("successToast", "Successfully generated words")
        }
      })
      .catch(err => {
        context.dispatch("errorToast", err)
      })
    },
    // Toast
    successToast(context, payload) {
      console.log("Success: ", payload)
      context.commit('successToast', payload)
      setTimeout(() => {
        context.commit('stopToast')
      }, 2500)
    },
    errorToast(context, payload) {
      console.error("Error: ", payload)
      context.commit('errorToast', payload)
      setTimeout(() => {
        context.commit('stopToast')
      }, 2500)
    }
  },
  getters: { 
    getProgress(state) {
      return state.progress
    },
    getLanguageID(state) {
      return state.languageID
    },
    getWords(state) {
      return state.words
    },
    getToast(state) {
      return state.toast
    },
    getConsonants(state) {
      return state.consonants
    },
    getVowels(state) {
      return state.vowels
    },
    allConsonants() {
      return allConsonants
    },
    allVowels() {
      return allVowels
    }
}
})

export default store