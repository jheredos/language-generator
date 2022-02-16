<template lang="pug">
article.card.section-card
  h5.card-title Allophones and Sound Changes
  .card-body
    // Control
    .input-group.mb-3
      button.btn.btn-primary(@click='submitAllophones()') Submit
      button.btn.btn-outline-secondary(@click='reset()') Reset
      button.btn.btn-outline-secondary.dropdown-toggle(
        type='button' data-toggle='dropdown' 
        aria-haspopup='true' aria-expanded='false')
        | Templates
      .dropdown-menu
        a.dropdown-item(
          v-for='(tmp, name) in templateHierarchies' 
          :key='name' @click='applyAllophonyTemplate(name)')
          | {{ name }}
    .table-container
      table.table-bordered
        thead
          tr
            th.phoneme-col(scope="col") Preceding phoneme
            th.divider-col(scope="col") 
              small Syllable boundary
            th.phoneme-col(scope="col") Target phoneme
            th.divider-col(scope="col") 
              small Syllable boundary
            th.phoneme-col(scope="col") Following phoneme
            th.divider-col(scope="col")
            th.phoneme-col(scope="col") Result
        tbody
          tr(v-for="(rule, i) in rules" :key="i")
            td
              // Preceding
              PhonemeSelector(:vowels='vowels' :consonants="consonants" :phoneme="rule.preceding" position="preceding")
            td 
              | (.)
            td
              // Target
              PhonemeSelector(:vowels='vowels' :consonants="consonants" :phoneme="rule.target" position="target")
            td 
              | (.)
            td
              // Following
              PhonemeSelector(:vowels='vowels' :consonants="consonants" :phoneme="rule.following" position="following")
            td 
              | =>
            td
              // Result
              PhonemeSelector(:vowels='vowels' :consonants="consonants" :phoneme="rule.result" position="result")
          tr
            td(colspan="7")
              button.btn.btn-outline-secondary.add-rule-button(@click="addRule()") 
                strong ADD A RULE +
</template>

<script lang="coffee">
# This component requires some more advanced skills than the rest of the app.
# It should probably be an optional step, though expanding the scope more
# toward sound changes than allophony could eventually add a lot of historic
# depth, even language families...
#
# Todo for this component:
#   - Result should mirror target
#       - Should users be able to select any specific phoneme as result? UI would get messy...
#       - Could user reference features from target and environment in result? 
#         e.g. assimilation to following phoneme's place of articulation? If so, how?
#       - Generate examples for each rule? 
#   - How to handle templates/presets?
#       - Offer example sound changes? Vowel reduction, nasal assimilation, lenition 
#         of intervocalic obstruents?
#   - Handle syllable boundaries
#   - Emit event and handle at App level (and figure out to deal with rules on the backend)

import PhonemeSelector from './PhonemeSelector.vue'

export default
  name: "AllophonyList"
  props:
    consonants: Array
    vowels: Array
  components: {
    PhonemeSelector
  }

  data: ->
    rules: [{
        preceding:
          features: {}
        target:
          features: {}
        following:
          features: {}
        result:
          features: {}
    }]

  methods: 
    reset: ->
      this.rules = [{
        preceding:
          features: {}
        target:
          features: {}
        following:
          features: {}
        result:
          features: {}
      }]

    addRule: ->
      this.rules.push {
        preceding:
          features: {}
        target:
          features: {}
        following:
          features: {}
        result:
          features: {}
      }

    test: ->
      console.log this.rules
</script>

<style scoped>
  table {
    width: 100%;
  }

  .add-rule-button {
    width: 100%;
  }

  .divider-col {
    width: 3%;
  }

  .phoneme-col {
    width: 20%;
  }
</style>