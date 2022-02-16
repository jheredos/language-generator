<template lang="pug">
article.card.section-card
  h5.card-title Consonant Inventory
  h6.card-subtitle.mb-2.text-muted The consonant phonemes that your language will have
  .card-body
    // Controls
    .input-group.mb-3
      div
        button.btn.btn-outline-secondary.dropdown-toggle(
          type='button' data-toggle='dropdown' 
          aria-haspopup='true' aria-expanded='false'
          ) Templates
        .dropdown-menu
          a.dropdown-item(
            v-for='(tmp, name) in templates' :key='name' 
            @click='applyConsonantTemplate(name)'
            ) {{ name }}
        button.btn.btn-outline-secondary(
          @click='resetConsonants()'
          ) Reset
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
            button.btn.phoneme-btn.ipa(
              v-for='(phoneme, k) in consonantTable[i][j]' 
              :key='k' @click='phoneme.selected = !phoneme.selected' 
              :class="{'btn-outline-primary': !phoneme.selected, 'btn-primary': phoneme.selected, 'hidden-phoneme': !phoneme.selected && phoneme.hidden}" 
              data-toggle='tooltip' data-placement='top' :title='phoneme.description'
              ) {{ phoneme.ipa }}
    .input-group.continue-btn
      button.btn.btn-outline-secondary(
        @click='advance()'
        ) Continue without Saving
      button.btn.btn-primary(
        @click='submitConsonants()'
        ) Save and Continue
</template>

<script lang="coffee">
allTemplates = require "../assets/templates.json"

export default
  name: "ConsonantPicker"
  emits: ['newConsonantInventory']

  data: -> 
    places: ["bilabial", "labio-dental", "dental", "alveolar", "post-alveolar", "retroflex", "palatal", "velar", "uvular", "pharyngeal", "glottal"]
    manners: ["nasal", "stop", "affricate", "fricative", "approximant", "tap", "trill", "click"]
    consonantTable: []
    templates: {}
    display: 
      aspirated: false
      nonpulmonic: false
      vclsSon: false

  computed:
    allConsonants: -> this.$store.getters.allConsonants
    selection: -> this.$store.getters.getConsonants

  watch:
    selection: 
      handler: -> this.$forceUpdate()
      deep: true

  methods: 
    updateDisplay: ->
      for c in this.allConsonants
        if c.selected
          c.hidden = false
        else if ['nasal', 'approximant', 'tap', 'trill'].includes(c.manner) and !c.voiced
          c.hidden = !this.display.vclsSon
        else if c.aspirated
          c.hidden = !this.display.aspirated
        else if c.nonpulmonic != 'pulmonic'
          c.hidden = !this.display.nonpulmonic
        else
          c.hidden = false

    submitConsonants: ->
      inventory = this.allConsonants.filter (c) => c.selected
      console.log "from ConsonantPicker: ", inventory.map (ph) => ph.ipa
      this.$store.dispatch "updateConsonants", inventory

    resetConsonants: ->
      (c.selected = false) for c in this.allConsonants
      this.updateDisplay()
      this.$forceUpdate()

    applyConsonantTemplate: (t) ->
      this.resetConsonants()
      (c.selected = true) for c in this.templates[t]

    advance: ->
      this.$store.dispatch "advanceProgress"

  beforeMount: ->
    # populate phoneme matrix
    for manner, i in this.manners
      this.consonantTable.push []
      for place, j in this.places
        this.consonantTable[i].push this.allConsonants.filter (c) => c.manner == this.manners[i] and c.place == this.places[j]
    this.updateDisplay()

    # populate templates
    for t of allTemplates
      this.templates[t] = this.allConsonants.filter (c) => allTemplates[t].consonants.includes c.ipa

</script>


<style scoped>
  table {
    font-size: small;
  }

  .hidden-phoneme {
    display: none;
  }
</style>