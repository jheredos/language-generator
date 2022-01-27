<template lang="pug">
article.card.section-card
  h5.card-title Consonant Inventory
  h6.card-subtitle.mb-2.text-muted The consonant phonemes that your language will have
  .card-body
    // Controls
    .input-group.mb-3
      div
        button.btn.btn-primary(
          @click='submitConsonants()'
          ) Submit
        button.btn.btn-outline-secondary(
          @click='resetConsonants()'
          ) Reset
        button.btn.btn-outline-secondary.dropdown-toggle(
          type='button' data-toggle='dropdown' 
          aria-haspopup='true' aria-expanded='false'
          ) Templates
        .dropdown-menu
          a.dropdown-item(
            v-for='(tmp, name) in templates' :key='name' 
            @click='applyConsonantTemplate(name)'
            ) {{ name }}
      .input-group
        .form-check
          input#showAspiratedCheckbox.form-check-input(
            type='checkbox' value='' 
            v-model='display.aspirated' 
            :change='updateDisplay()')
          label.form-check-label(for='showAspiratedCheckbox')
            | Show Aspirated Consonants
        .form-check
          input#showNonpulmonicCheckbox.form-check-input(
            type='checkbox' value='' 
            v-model='display.nonpulmonic' 
            :change='updateDisplay()')
          label.form-check-label(for='showNonpulmonicCheckbox')
            | Show Non-Pulmonic Consonants
        .form-check
          input#showVoicelessSonorantsCheckbox.form-check-input(
            type='checkbox' value='' 
            v-model='display.vclsSon' 
            :change='updateDisplay()')
          label.form-check-label(for='showVoicelessSonorantsCheckbox')
            | Show Voiceless Sonorants
    // Consonant Table
    table.table-bordered
      thead
        tr
          th(scope='col')
          th(scope='col' v-for='(place, i) in places' :key='i')
            b {{ place.toUpperCase() }}
      tbody
        tr(v-for='(manner, i) in manners' :key='i')
          th
            b {{ manner.toUpperCase() }}
          td(v-for='(place, j) in places' :key='j')
            button.btn.phoneme-btn(
              v-for='(phoneme, k) in selection[i][j]' 
              :key='k' @click='phoneme.selected = !phoneme.selected' 
              :class="{'btn-outline-primary': !phoneme.selected, 'btn-primary': phoneme.selected, 'hidden-phoneme': phoneme.hidden}" 
              data-toggle='tooltip' data-placement='top' :title='phoneme.description'
              ) {{ phoneme.ipa }}
</template>

<script>
const allConsonants = require("../assets/consonants.json")
const allTemplates = require("../assets/templates.json")

export default {
  name: "ConsonantPicker",
  emits: ['newConsonantInventory'],
  data() {
    return {
      places: ["bilabial", "labio-dental", "dental", "alveolar", "post-alveolar", "retroflex", "palatal", "velar", "uvular", "pharyngeal", "glottal"],
      manners: ["nasal", "stop", "affricate", "fricative", "approximant", "tap", "trill", "click"],
      selection: [],
      templates: {},
      display: {
        aspirated: true,
        nonpulmonic: false,
        vclsSon: false,
      },
    }
  },
  methods: {
    updateDisplay() {
      allConsonants.forEach(c => {
        if(c.selected) {
          c.hidden = false
        } else if(['nasal', 'approximant', 'tap', 'trill'].includes(c.manner) && !c.voiced) {
          c.hidden = !this.display.vclsSon
        } else if(c.aspirated) {
          c.hidden = !this.display.aspirated
        } else if(c.nonpulmonic != '') {
          c.hidden = !this.display.nonpulmonic
        } else {
          c.hidden = false
        }
      })
    },
    submitConsonants() {
      let inventory = allConsonants.filter(c => c.selected)
      console.log("from ConsonantPicker: ", inventory.map(ph => ph.ipa))
      this.$emit('newConsonantInventory', inventory)
    },
    resetConsonants() {
      allConsonants.forEach(c => c.selected = false)
      this.updateDisplay()
      this.$forceUpdate()
      // this.$emit('newConsonantInventory', [])
    },
    applyConsonantTemplate(t) {
      this.resetConsonants()
      this.templates[t].forEach(c => c.selected = true)
    }
  },
  beforeMount() {
    const describeConsonant = (ph) => {
      let desc = ""
      desc += (ph.voiced ? "Voiced " : "Voiceless ")
      desc += (ph.aspirated ? "aspirated " : "")
      desc += ph.place + " "
      desc += (ph.sibilant ? "sibilant " : "")
      desc += (ph.lateral ? "lateral " : "")
      desc += (ph.nonpulmonic ? ph.nonpulmonic + " " : "")
      desc += ph.manner
      return desc
    }
    // populate phoneme matrix
    for(let i = 0; i < this.manners.length; i++) {
      this.selection.push([])
      for(let j = 0; j < this.places.length; j++) {
        this.selection[i].push(
          allConsonants.filter(c => c.manner == this.manners[i] && c.place == this.places[j])
        )
      }
    }
    allConsonants.forEach(c => {
      c.description = describeConsonant(c)
      c.selected = false
    })
    this.updateDisplay()
    // populate templates
    for(let t in allTemplates) {
      this.templates[t] = allConsonants.filter(c => allTemplates[t].consonants.includes(c.ipa))
    }
  }
}
</script>


<style scoped>
  table {
    font-size: small;
  }
  
  .form-check {
    margin: 1rem;
  }

  .hidden-phoneme {
    display: none;
  }
</style>