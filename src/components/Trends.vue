<template lang="pug">
article.card.section-card
  h5.card-title Phonotactic Trends
  .card-body
    table.table
      tr(v-for="(preset, j) in presets")
        th.preset-header {{ preset.title }}
          br
          small.text-muted {{ preset.description }}
        td(v-for="(frequency, i) in frequencies")
          .form-check.form-check-inline
            .radio-container
              label.form-check-label(:for="preset.id + i") {{ frequency }}
            .radio-container
              input.form-check-input(
                :name="'freqRadios' + preset.id" 
                type="radio" :id="preset.id + i" 
                v-model="preset.rule.frequency"
                :value="frequency"
                @change="test(preset)")

    .table-container
      table.table-bordered.rules-table
        thead
          tr
            th.freq-col(scope="col") Frequency
            th.phoneme-col(scope="col") Phoneme
              sub 1
            th.boundary-col(scope="col") 
              small Syllable Boundary
            th.phoneme-col(scope="col") Phoneme
              sub 2
        tbody
          tr(v-for="(rule, i) in rules" :key="i")
            // Frequency
            td 
              button.btn.btn-outline-primary.dropdown-toggle(
                type="button" data-toggle="dropdown" 
                aria-haspopup='true' aria-expanded='false')
                | {{ rule.frequency }}
              .dropdown-menu
                a.dropdown-item(
                  v-for="(freq, j) in frequencies" :key="j"
                  @click="rule.frequency = freq")
                  | {{ freq }}
            // Phoneme 1
            td
              PhonemeSelector(
                :vowels='vowels' :consonants="consonants" 
                :phoneme="rule.first" position="target")
            // Syllable Boundary
            td 
              button.btn.btn-outline-primary(@click="toggleBoundary(rule)")
                h2 {{ rule.boundary }}
            //  Phoneme 2
            td
              PhonemeSelector(
                :vowels='vowels' :consonants="consonants" 
                :phoneme="rule.second" position="target")
          tr
            td(colspan="4")
              button.btn.btn-outline-secondary.add-rule-button(@click="addNewRule()" :disabled="rules.length >= 15") 
                  strong ADD A RULE +

</template>

<script lang="coffee">
import PhonemeSelector from './PhonemeSelector.vue'

export default
  name: "Trends"
  props:
    vowels: Array
    consonants: Array
  emits: ["newTrends"]
  components: {
    PhonemeSelector
  }
  
  data: ->
    frequencies: ['never', 'rarely', 'less often', 'sometimes', 'more often', 'very often']
    boundaryTypes: ['.', '(.)', '∅']
    contexts: ['onset', 'nucleus', 'coda', 'word boundary', 'across syllables']
    rules2: [{
      phonemeA:
        type: 'consonant'
        phoneme: {}
      phonemeB:
        type: 'consonant'
        phoneme: {}
      frequency:
      contexts: []
    }]
    rules: [{
      first:
        type: 'C'
        features: {}
      second:
        type: 'C'
        features: {}
      boundary: '(.)'
      frequency: 'sometimes'
    }]

    presets: [
      {
        id: '1'
        title: 'Diphthongs'
        description: "How often diphthongs and triphthongs form the nucleus vs. monophthongs"
        rule:
          first:
            type: 'V'
            features: {}
          second:
            type: 'V'
            features: {}
          boundary: '∅'
          frequency: ''
      } 
      {
        id: '2'
        title: 'Consonant clusters'
        description: "How often consonant clusters occur within a syllable"
        rule:
          first:
            type: 'C'
            features: {}
          second:
            type: 'C'
            features: {}
          boundary: '∅'
          frequency: ''
      }
      {
        id: '3'
        title: 'Word-initial null onset'
        description: "How often a word begins with a vowel"
        rule:
          first:
            type: '#'
            features: {}
          second:
            type: 'V'
            features: {}
          boundary: '∅'
          frequency: ''
      } 
      {
        id: '4'
        title: 'Word-final null coda'
        description: "How often a word ends in a vowel"
        rule:
          first:
            type: 'V'
            features: {}
          second:
            type: '#'
            features: {}
          boundary: '∅'
          frequency: ''
      } 
      {
        id: '5'
        title: 'Open syllables'
        description: "How often a syllable ends in a vowel"
        rule:
          first:
            type: 'V'
            features: {}
          second:
            type: 'C'
            features: {}
          boundary: '.'
          frequency: ''
      } 
      {
        id: '6'
        title: 'Word-internal null onset (Hiatus)'
        description: "How often a syllable starts with a vowel"
        rule:
          first:
            type: 'V'
            features: {}
          second:
            type: 'V'
            features: {}
          boundary: '.'
          frequency: ''
      }
    ]

  methods:
    submitTrends: ->
      trends =
        rules: this.rules
      this.presets.forEach (pre) => if pre.rule.frequency.length then this.rules.push pre.rule
      this.$emit "newTrends", trends

    addNewRule: ->
      unless this.rules.length >= 15
        this.rules.push {
          first:
            type: 'C'
            features: {}
          second:
            type: 'C'
            features: {}
          boundary: '(.)'
          frequency: 'sometimes'
        }
      

    toggleBoundary: (rule) ->
      i = this.boundaryTypes.indexOf rule.boundary
      rule.boundary = this.boundaryTypes[(i + 1) % this.boundaryTypes.length]

    test: (x) -> console.log x
</script>

<style scoped>
  .preset-header {
    width: 20%;
  }

  .rules-table {
    width: 100%;
  }

  .freq-col {
    max-width: 15%
  }

  .phoneme-col {
    width: 40%;
  }

  .boundary-col {
    width: 5%;
  }

  .add-rule-button {
    width: 100%;
  }

  .form-check-inline {
    display: inline;
    margin: auto;
  }
</style>