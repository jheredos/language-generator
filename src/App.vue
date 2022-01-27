<template lang="pug">
nav.navbar.navbar-expand-lg.navbar-dark.bg-dark
  a.navbar-brand(href='#' @click='pingAPI()') The Language Generator
h3 Phonemic Inventory
//- Scratch
ConsonantPicker(@newconsonantinventory='updateConsonantInventory')
VowelPicker(@newvowelinventory='updateVowelInventory')
hr
h3 Phonotactics
ConsonantHierarchy(:phonemes='consonants' position='Onset')
ConsonantHierarchy(:phonemes='consonants' position='Coda')
NucleusHierarchy(:vowels='vowels')
</template>

<script>
import axios from 'axios'
import ConsonantPicker from './components/ConsonantPicker.vue'
import VowelPicker from './components/VowelPicker.vue'
import ConsonantHierarchy from './components/ConsonantHierarchy.vue'
import NucleusHierarchy from './components/NucleusHierarchy.vue'
// import Scratch from './components/Scratch.vue'

export default {
  name: 'App',
  components: {
    ConsonantPicker,
    VowelPicker,
    ConsonantHierarchy,
    NucleusHierarchy,
    // Scratch,
  },
  data() {
    return {
      consonants: ['m', 'n', 'b', 'p', 't', 'd', 'g', 'k', 'ɢ', 'ʔ', 'v', 'f', 'z', 's', 'ʒ', 'ʃ', 'ʁ', 'χ', 'h', 'l', 'j', 'ɾ', 'r', 'tʃ', 'dʒ'],
      vowels: ["a", "i" ,"u", "e", "o"],
    }
  },
  methods: {
    updateConsonantInventory(inventory) {
      this.consonants = inventory
      // axios.post("http://localhost:3000/phonology/consonants", {

      // })
    },
    updateVowelInventory(inventory) {
      this.vowels = inventory
    },
    pingAPI() {
      console.log("pinging API...")
      axios.get("http://localhost:3000/ping", {
        withCredentials: true,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
      })
      .then(response => console.log(response))
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.section-card {
  width: 80%;
  margin: 2rem auto;
  display: flex;
}

.card-title {
  margin-top: 1rem;
}

.phoneme-btn {
  font-size: small;
}

.dropdown-item {
  cursor: pointer;
}

  .hierarchy-table-container {
    display: flex;
    cursor: pointer;
    width: 100%;
  }

  .hierarchy-table {
    min-width: 60%;
  }

  .phoneme-menu-container {
    min-width: 40%;
    margin: 0 .5rem;
    padding: 2rem;
  }
</style>
