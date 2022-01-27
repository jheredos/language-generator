<template lang="pug">
article.card.section-card
  h5.card-title
    | Consonant Clusters: 
    b {{ position }}
  .card-body
    // Control
    .input-group.mb-3
      button.btn.btn-primary(@click='submitHierarchy()') Submit
      button.btn.btn-outline-secondary(@click='reset()') Reset
      button.btn.btn-outline-secondary.dropdown-toggle(
        type='button' data-toggle='dropdown' 
        aria-haspopup='true' aria-expanded='false')
        | Templates
      .dropdown-menu
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
            draggable.dnd-area(tag='td' :list='neverInCluster' group='phonemes')
              template(#item='{ element }')
                button.btn.btn-primary.phoneme-btn
                  | {{ element.value }}
      table.table-bordered.no-cluster-table
        thead
          tr
            th Does not occur in {{ position }}
        tbody
          tr
            draggable.dnd-area(tag='td' :list='neverInPos' group='phonemes')
              template(#item='{ element }')
                button.btn.btn-primary.phoneme-btn
                  | {{ element.value }}
    .table-container
      table.table-bordered.cluster-table
        thead
          th.nucleus-col(v-if="position != 'Onset'" colspan='1') Syllable nucleus
          th(:colspan='tiers.length + 2') {{ position }} clusters
          th.nucleus-col(v-if="position == 'Onset'" colspan='1') Syllable nucleus
        tbody
          tr
            td(v-if="position != 'Onset'" rowspan='2')
              h5 V
            td.add-tier-col.table-secondary(rowspan='2' @click='addTier(false)')
              h5 +
            td(v-for='(c, i) in tiers' :key='i')
              h5
                | C
                sub {{ i + 1 }}
            td.add-tier-col.table-secondary(rowspan='2' @click='addTier(true)')
              h5 +
            td(v-if="position == 'Onset'" rowspan='2')
              h5 V
          tr(style='height: 8rem;')
            draggable.dnd-area(v-for='(tier, i) in tiers' :key='i' tag='td' :style="{'width': 100 / tiers.length + '%'}" :list='tier' group='phonemes')
              template(#item='{ element }')
                button.btn.btn-primary.phoneme-btn
                  | {{ element.value }}
    .table-container
      table.table-bordered.examples-table
        tr
          th Examples
          td {{ generateExamples() }}
</template>

<script>
import draggable from "vuedraggable";

export default {
  name: 'ConsonantHierarchy',
  props: {
    phonemes: Array,
    position: String,
  },
  components: {
    draggable
  },
  data() {
    return {
      showHelp: false,
      tiers: [[],[]],
      neverInCluster: [],
      neverInPos: [],
    }
  },
  methods: {
    reset() {
      this.neverInCluster = this.phonemes.map(p => {
        return {value: p, id: Math.floor(Math.random(1) * 10000)}
      });
      this.tiers = [[], []];
      this.neverInPos = [];
    },
    addTier(before) {
      if(this.tiers.length > 4) return;
      if(before) this.tiers = this.tiers.concat([[]]);
      else this.tiers = [[]].concat(this.tiers)
    },
    generateExamples() {
      const randMember = arr => arr[Math.floor(Math.random() * arr.length)];
      let possibilities = this.tiers.reduce((poss, t) => Math.max(t.length, 1) * poss, 1);
      if(possibilities < 5) return '';

      let examples = [];
      while(examples.length < 10 && examples.length < possibilities * .8) {
        let example = this.tiers.reduce((x, t) => {
          return x + (t.length && Math.random(1) > 0.5 ? randMember(t).value : "")
        }, '')
        if(example.length > 1 && !examples.includes(example)) {
          examples.push(example)
        }
      }

      return this.formatExampleList(examples)
    },
    formatExampleList(arr) {
      return arr.reduce((list, x, i) => {
        return list + 
        '/' + (this.position == 'Onset' ? '' : '-') +
        x + (this.position == 'Onset' ? '-' : '') +
        '/' + (i < arr.length - 1 ? ', ' : '')
      }, '')
    },
    add() {}, // these methods have to be included to make drag-and-drop work
    replace() {},
    clone() {},
    log() {},
  },
  beforeMount() {
    this.neverInCluster = this.phonemes.map(p => {
      return {value: p, id: Math.floor(Math.random(1) * 10000)}
    });
  }
}
</script>

<style scoped>
  .table-container {
    display: flex;
    padding: .4rem;
  }

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
    cursor: pointer;
  }

  .add-tier-btn {
    margin: 0;
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