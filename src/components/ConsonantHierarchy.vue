<template lang="pug">
article.card.section-card
  h5.card-title
    b {{ position }}
    | : Consonant Clusters
  .card-body
    // Control
    .input-group.mb-3
      button.btn.btn-outline-secondary(@click='reset()') Reset
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
    .table-container
      table.table-bordered.no-cluster-table
        thead
          tr
            th Does not occur in {{ position }} clusters
        tbody
          tr
            draggable.dnd-area(tag='td' :list='noCluster' :group="'consonants' + position" item-key="id")
              template(#item='{ element }')
                button.btn.btn-primary.phoneme-btn.ipa
                  | {{ element.ipa }}
      table.table-bordered.no-cluster-table
        thead
          tr
            th Does not occur in {{ position }}
        tbody
          tr
            draggable.dnd-area(tag='td' :list='neverInPos' :group="'consonants' + position" item-key="id")
              template(#item='{ element }')
                button.btn.btn-primary.phoneme-btn.ipa
                  | {{ element.ipa }}
    .table-container
      table.table-bordered.cluster-table
        thead
          th.nucleus-col(v-if="position != 'Onset'" colspan='1') Syllable nucleus
          th(:colspan='tiers.length + 2') {{ position }} clusters
          th.nucleus-col(v-if="position == 'Onset'" colspan='1') Syllable nucleus
        tbody
          tr
            td.table-secondary(v-if="position != 'Onset'" rowspan='2')
              h5 V
            td.add-tier-col(rowspan='2' @click='addTier(false)')
              button.btn.btn-outline-primary.add-tier-btn
                h5 +
            td(v-for='(c, i) in tiers' :key='i')
              h5
                | C
                sub {{ i + 1 }}
            td.add-tier-col(rowspan='2' @click='addTier(true)')
              button.btn.btn-outline-primary.add-tier-btn
                h5 +
            td.table-secondary(v-if="position == 'Onset'" rowspan='2')
              h5 V
          tr(style='height: 8rem;')
            draggable.dnd-area(v-for='(tier, i) in tiers' :key='i' tag='td' :style="{'width': 100 / tiers.length + '%'}" :list='tier' :group="'consonants' + position" item-key="id")
              template(#item='{ element }')
                button.btn.btn-primary.phoneme-btn.ipa
                  | {{ element.ipa }}
    .table-container
      table.table-bordered.examples-table
        tr
          th Examples
          td.ipa {{ exampleClusters }}
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
  name: 'ConsonantHierarchy'
  props:
    position: String
  emits: ["newConsonantHierarchy"]
  components: {
    draggable
  }

  data: ->
    templateHierarchies: []
    showHelp: false
    tiers: [[],[]]
    noCluster: []
    neverInPos: []

  computed:
    consonants: ->
      this.tiers = [[],[]]
      this.neverInPos = []
      cs = _.cloneDeep this.$store.getters.getConsonants
      this.noCluster = cs
      cs

    exampleClusters: ->
      randMember = (arr) -> arr[Math.floor Math.random() * arr.length]
      possibilities = this.tiers.reduce ((poss, t) => (t.length or 1) * poss), 1
      if possibilities < 5 then return ''

      examples = []
      for i in [0..10]
        example = this.tiers.reduce ((x, t) => 
          ph = if t.length and Math.random(1) > 0.4 then randMember(t).ipa else ""
          if ph.length then x.concat [ph] else x), []
        exStr = example.reduce ((st, ph) => st + ph), ""
        unless example.length < 2 or exStr in examples
          examples.push exStr

      this.formatExampleList examples

  watch:
    consonants: 
      handler: -> this.$forceUpdate()
      deep: true

  methods:
    reset: ->
      for tier in this.tiers
        this.noCluster = this.noCluster.concat tier
      this.noCluster = this.noCluster.concat this.neverInPos
      this.tiers = [[], []]
      this.neverInPos = []

    submitHierarchy: ->
      hierarchy =
        onset: this.position == "Onset"
        noCluster: this.noCluster
        tiers: this.tiers
      this.$store.dispatch "updateConsonantHierarchy", hierarchy
      # this.$emit "newConsonantHierarchy", hierarchy

    applyHierarchyTemplate: ->

    addTier: (before) ->
      if this.tiers.length > 4 then return
      if before 
        this.tiers = this.tiers.concat [[]]
      else 
        this.tiers = [[]].concat this.tiers
    
    formatExampleList: (arr) ->
      arr.reduce ((list, x, i) => 
        list + 
        '/' + (if this.position == 'Onset' then '' else '-') +
        x + (if this.position == 'Onset' then '-' else '') +
        '/' + (if i < arr.length - 1 then ', ' else '')), ''
    
    advance: ->
      this.$store.dispatch "advanceProgress"

    # these methods have to be included to make drag-and-drop work
    add: ->
    replace: ->
    clone: ->
    log: ->

  beforeMount: ->
    this.noCluster = this.consonants
</script>

<style scoped>
  .no-cluster-table {
    width: 49%;
    margin: auto;
    min-height: 10rem;
  }

  .no-cluster-table tbody {
    height: 100%;
  }

  .cluster-table {
    padding-top: 1rem;
    width: 100%;
  }

  .nucleus-col {
    max-width: 20%;
  }

  .add-tier-col {
    width: 1.6rem;
  }

  .add-tier-btn {
    margin: 0;
    min-height: 10rem;
    max-height: 100%;
  }

  .phoneme-btn {
    margin: .1rem;
  }

  .dnd-area {
    min-width: 100%;
    min-height: 100%;
  }

  .examples-table {
    width: 100%;
    line-height: 3;
  }

  .examples-table th {
    width: 15%;
  }

  .examples-table td {
    text-align: left;
    padding-left: 2rem;
  }
</style>