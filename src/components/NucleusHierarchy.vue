<template lang="pug">
article.card.section-card
  h5.card-title 
    b Nucleus 
    | : Diphthongs and Triphthongs
  .card-body
    // Control
    .input-group.mb-3
      button.btn.btn-outline-secondary.dropdown-toggle(
        type='button' data-toggle='dropdown' 
        aria-haspopup='true' aria-expanded='false')
        | Templates
      .dropdown-menu
        a.dropdown-item(v-for="i in 3") TODO
        a.dropdown-item(
          v-for='(tmp, name) in templateHierarchies' 
          :key='name' @click='applyHierarchyTemplate(name)')
          | {{ name }}
      button.btn.btn-outline-secondary(@click='reset()') Reset
    .table-container
      table.table-bordered.all-vowel-table
        thead
          tr
            th All vowels
        tbody
          tr
            draggable.dnd-area(
              tag='td' 
              :list='vowels' 
              :group="{name: 'vowels', pull: 'clone', put: false}"
              item-key="id")
              template(#item='{ element }')
                button.btn.btn-primary.phoneme-btn.ipa {{ element.ipa }}
    .table-container
      table.table-bordered.cluster-table
        thead
          th.edge-col Onset
          th.cluster-col Onglides
          th.cluster-col Nucleus
          th.cluster-col Offglides
          th.edge-col Coda
        tbody
          tr
            td.table-secondary.edge-col
              h5 C
            draggable.cluster-col.dnd-area(
              v-for="(pos, i) in [onglides, nuclei, offglides]" 
              :key="i" 
              tag="td" 
              :list='pos' 
              :group="{name: 'vowels'}" 
              @change="uniq()"
              item-key="id")
              template(#item='{ element }')
                button.btn.btn-primary.phoneme-btn.ipa(@click="remove(i, element)") 
                  | {{ element.ipa }}             
            td.table-secondary.edge-col
              h5 C
    .table-container
      table.table-bordered.examples-table
        tr
          th Examples
          td.ipa {{ exampleClusters }}

    .input-group
      .form-check
        input#allowSyllabicConsonantsCheckbox.form-check-input(
          type='checkbox' value='' 
          v-model='allowSyllabicConsonants')
        label.form-check-label(for='allowSyllabicConsonantsCheckbox')
          | Allow Syllabic Consonants
    .table-container(v-if="allowSyllabicConsonants")
      table.table-bordered.syllabic-cons-table
        tr
          th Non-syllabic consonants
          draggable.dnd-area(tag='td' :list='possibleSyllabicConsonants' group='nucleusConsonants' item-key='id')
            template(#item='{ element }')
              button.btn.btn-primary.phoneme-btn.ipa
                | {{ element.ipa }}
      table.table-bordered.syllabic-cons-table
        tr
          th Syllabic consonants
          draggable.dnd-area(tag='td' :list='syllabicConsonants' group='nucleusConsonants' item-key='id')
            template(#item='{ element }')
              button.btn.btn-primary.phoneme-btn.ipa
                | {{ element.ipa }}
    .input-group.continue-btn
      button.btn.btn-outline-secondary(
        @click='advance()'
        ) Continue without Saving
      button.btn.btn-primary(
        @click='submitHierarchy()'
        ) Save and Continue
</template>

<script lang="coffee">
import draggable from "vuedraggable"

export default
  name: "NucleusHierarchy"
  emits: ["newNucleusHierarchy"]
  components: {
    draggable
  }

  data: ->
    templateHierarchies: []
    nuclei: []
    onglides: []
    offglides: []
    allowSyllabicConsonants: false
    syllabicConsonants: []
    possibleSyllabicConsonants: []

  computed:
    vowels: ->
      this.nuclei = []
      this.onglides = []
      this.offglides = []
      this.$store.getters.getVowels

    consonants: -> 
      this.syllabicConsonants = []
      cs = _.cloneDeep this.$store.getters.getConsonants
      this.possibleSyllabicConsonants = cs.filter (c) => c.manner in ['nasal', 'fricative', 'approximant', 'trill'] and c.nonpulmonic == 'pulmonic' and c.voiced
      cs

    exampleClusters: ->
      possibilities = (this.onglides.length or 1) * this.nuclei.length * (this.offglides.length or 1)
      if possibilities < 2 then return ''

      randMember = (arr) -> arr[Math.floor Math.random() * arr.length]
      examples = []
      for i in [1..10]
        example = []
        example.push randMember(this.onglides).ipa + '\u032F' if this.onglides.length and Math.random(1) > 0.4
        example.push randMember(this.nuclei).ipa
        example.push randMember(this.offglides).ipa + '\u032F' if this.offglides.length and Math.random(1) > 0.4
        exStr = example.reduce ((st, ph) => st + ph), ""
        unless example.length < 2 or exStr in examples
          examples.push exStr

      examples.reduce ((xs, x, i) => xs + (if i then ', ' else '') + '/' + x + '/'), ''

  watch:
    consonants:
      handler: -> this.$forceUpdate()
      deep: true

  methods:
    reset: ->
      this.nuclei = []
      this.onglides = []
      this.offglides = []
      this.possibleSyllabicConsonants = this.possibleSyllabicConsonants.concat this.syllabicConsonants
      this.syllabicConsonants = []

    submitHierarchy: ->
      hierarchy =
        onglides: this.onglides
        nuclei: this.nuclei
        offglides: this.offglides
        monophthongs: this.vowels
        consonants: this.syllabicConsonants
      this.$store.dispatch "updateVowelHierarchy", hierarchy
      # this.$emit "newNucleusHierarchy", hierarchy

    applyHierarchyTemplate: ->

    advance: ->
      this.$store.dispatch "advanceProgress"

    # these methods have to be included to make drag-and-drop work
    add: -> 
    replace: -> 
    clone: -> 
    log: -> 

    remove: (i, vwl) -> 
      pos =  ['onglides', 'nuclei', 'offglides']
      this[pos[i]] = this[pos[i]].filter (v) => v.id != vwl.id

    uniq: ->
      this.onglides = _.uniqBy this.onglides, (v) => v.id
      this.nuclei = _.uniqBy this.nuclei, (v) => v.id
      this.offglides = _.uniqBy this.offglides, (v) => v.id
</script>

<style scoped>
  .all-vowel-table {
    width: 100%;
    margin: auto;
    min-height: 8rem;
  }

  .cluster-table {
    width: 100%;
    padding-top: 1rem;
    margin: auto;
    min-height: 12rem;
  }

  .phoneme-btn {
    margin: .1rem;
  }

  .dnd-area {
    padding: 1rem;
    min-width: 100%;
    min-height: 100%;
  }

  .examples-table {
    width: 100%;
  }

  .examples-table th {
    width: 15%;
  }

  .examples-table td {
    line-height: 2.5rem;
    text-align: left;
    padding-left: 2rem;
  }

  .cluster-col {
    width: 25%;
  }

  .edge-col {
    width: 10%;
  }

  .syllabic-cons-table {
    width: 50%;
    margin: .5rem;
    min-height: 2rem;
  }

  .syllabic-cons-table th {
    width: 20%;
  }
</style>