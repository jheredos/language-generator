<template lang="pug">
article.card.section-card
  h5.card-title Vowel Inventory
  h6.card-subtitle.mb-2.text-muted The vowel phonemes that your language will have
  .card-body
    // Controls
    .input-group.mb-3
      div
        button.btn.btn-outline-secondary.dropdown-toggle(type='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false') Templates
        .dropdown-menu
          a.dropdown-item(v-for='(tmp, name) in templates' :key='name' @click='applyVowelTemplate(name)') {{ name }}
        button.btn.btn-outline-secondary(@click='resetVowels()') Reset
      .input-group
        .form-check
          input#showNonpulmonicCheckbox.form-check-input(type='checkbox' value='' v-model='display.long' :change='updateDisplay()')
          label.form-check-label(for='showLongCheckbox')
            | Show Long Vowels
        .form-check
          input#showNonpulmonicCheckbox.form-check-input(type='checkbox' value='' v-model='display.nasal' :change='updateDisplay()')
          label.form-check-label(for='showNasalCheckbox')
            | Show Nasal Vowels
    // Vowel Table
    table.table-bordered(style='font-size: small;')
      thead
        tr
          th(scope='col')
          th(scope='col' v-for='(frontness, i) in frontnesses' :key='i')
            b {{ frontness.toUpperCase() }}
      tbody
        tr(v-for='(height, i) in heights' :key='i')
          th.row-header
            b {{ height.toUpperCase() }}
          td(v-for='(frontness, j) in frontnesses' :key='j')
            .table-cell(v-if='vowelTable[i][j][0].length || vowelTable[i][j][1].length')
              .table-sub-cell(v-if='vowelTable[i][j][0].length')
                button.btn.phoneme-btn.ipa(v-for='(phoneme, k) in vowelTable[i][j][0]' :key='k' 
                  @click='phoneme.selected = !phoneme.selected' 
                  :class="{'btn-outline-primary': !phoneme.selected, 'btn-primary': phoneme.selected, 'hidden-phoneme': !phoneme.selected && phoneme.hidden}" 
                  data-toggle='tooltip' data-placement='top' 
                  :title='phoneme.description') 
                  | {{ phoneme.ipa }}
              span(v-if='vowelTable[i][j][0].length && vowelTable[i][j][1].length')  &bull; 
              .table-sub-cell(v-if='vowelTable[i][j][1].length')
                button.btn.phoneme-btn.ipa(v-for='(phoneme, k) in vowelTable[i][j][1]' :key='k' 
                  @click='phoneme.selected = !phoneme.selected' 
                  :class="{'btn-outline-primary': !phoneme.selected, 'btn-primary': phoneme.selected, 'hidden-phoneme': !phoneme.selected && phoneme.hidden}" 
                  data-toggle='tooltip' data-placement='top' 
                  :title='phoneme.description') 
                  | {{ phoneme.ipa }}
    .input-group.continue-btn
      button.btn.btn-outline-secondary(
        @click='advance()'
        ) Continue without Saving
      button.btn.btn-primary(
        @click='submitVowels()'
        ) Save and Continue
</template>

<script lang="coffee">
allTemplates = require "../assets/templates.json"

export default
  name: "VowelPicker",
  emits: ['newVowelInventory']
  data: ->
    frontnesses: ["front", "central", "back"]
    heights: ["close", "near-close", "close-mid", "mid", "open-mid", "near-open", "open"]
    vowelTable: []
    templates: {}
    display: 
      long: false
      nasal: false

  computed:
    allVowels: -> this.$store.getters.allVowels
    selection: -> this.$store.getters.getVowels

  watch:
    selection: 
      handler: -> this.$forceUpdate()
      deep: true

  methods:
    updateDisplay: ->
      for v in this.allVowels
        if v.selected
          v.hidden = false
        else if v.long and v.nasal
          v.hidden = !(this.display.long and this.display.nasal)
        else if v.long
          v.hidden = !this.display.long
        else if v.nasal
          v.hidden = !this.display.nasal
        else
          v.hidden = false

    submitVowels: ->
      inventory = this.allVowels.filter (v) => v.selected
      console.log "from VowelPicker: #{inventory.map (v) => v.ipa}"
      # this.$emit 'newVowelInventory', inventory
      this.$store.dispatch "updateVowels", inventory

    resetVowels: ->
      (v.selected = false) for v in this.allVowels
      this.updateDisplay()
      this.$forceUpdate()
      # this.$emit 'newVowelInventory', []

    applyVowelTemplate: (t) ->
      this.resetVowels()
      (v.selected = true) for v in this.templates[t]

    advance: ->
      this.$store.dispatch "advanceProgress"

  beforeMount: ->
    for height, i in this.heights
      this.vowelTable.push []
      for frontness, j in this.frontnesses
        this.vowelTable[i].push []
        this.vowelTable[i][j].push this.allVowels.filter (v) => v.height == this.heights[i] and v.frontness == this.frontnesses[j] and !v.rounding
        this.vowelTable[i][j].push this.allVowels.filter (v) => v.height == this.heights[i] and v.frontness == this.frontnesses[j] and v.rounding
    
    (v.selected = false) for v in this.allVowels
    this.updateDisplay()

    for t of allTemplates
      this.templates[t] = this.allVowels.filter (v) => allTemplates[t].vowels.includes v.ipa
</script>

<style scoped>
  .form-check {
    margin: 1rem;
  }

  .hidden-phoneme {
    display: none;
  }
  
  table {
    width: 100%;
  }

  .table-cell {
    display: flex;
    min-width: 100%;
    line-height: 2rem;
  }
  
  .table-sub-cell {
    display: block;
    margin: auto;
  }

  .row-header {
    width: 20%;
  }
</style>