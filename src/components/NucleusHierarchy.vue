<template lang="pug">
article.card.section-card
  h5.card-title Nucleus Phonotactics
  .card-body
    // Control
    .input-group.mb-3
      button.btn.btn-primary(@click='submitHierarchy()') Submit
      button.btn.btn-outline-secondary(@click='resetHierarchy()') Reset
      button.btn.btn-outline-secondary.dropdown-toggle(type='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false') Templates
      .dropdown-menu
        a.dropdown-item(v-for='(tmp, name) in templateHierarchies' :key='name' @click='applyHierarchyTemplate(name)') {{ name }}
      .form-check
        input#defaultCheck1.form-check-input(type='checkbox' value='' v-model='showConsonants')
        label.form-check-label(for='defaultCheck1')
          | Show syllabic consonants
    .hierarchy-table-container
      // Table
      table.table-bordered.hierarchy-table
        thead
          tr
            th
            th Phonemes
        tbody
          tr(@click='selected = name' v-for='(name, i) in positionNames' :key='i' :class="{ 'table-primary': selected == name }")
            th {{ name }}
            td
              button.btn.btn-primary.phoneme-btn(v-for='(phoneme, j) in hierarchy[positions[name]]' :key='j' @click='unassignPhoneme(phoneme)')
                | {{ phoneme }}
          tr(v-if='showConsonants')
            th(colspan='2')
          tr(v-if='showConsonants' @click="selected = 'Syllabic Consonants'" :class="{ 'table-primary': selected == 'Syllabic Consonants' }")
            th Syllabic Consonants
            td
              button.btn.btn-primary.phoneme-btn(v-for="(phoneme, j) in hierarchy['consonants']" :key='j')
                | {{ phoneme }}
      .card.phoneme-menu-container
        .card-body
          button.btn.btn-primary.phoneme-btn(v-for='(phoneme, i) in vowels' :key='i' @click='assignPhoneme(phoneme)') {{ phoneme }}
    .examples-container
      h6.text-muted
        | Examples: 
        span(v-for='(x, i) in generateExampleClusters()' :key='i') {{x}}{{ generateExampleClusters().length - 1 &gt; i ? &quot;, &quot; : null }}
</template>

<script>
export default {
  name: 'NucleusHierarchy',
  props: {
    vowels: Array,
  },
  data() {
    return {
      positionNames: ["Monophthongs only", "Onglides", "Nuclei", "Offglides"],
      positions: {
        "Onglides": "onglides",
        "Nuclei": "nuclei",
        "Offglides": "offglides",
        "Monophthongs only": "monophthongs",
        "Syllabic consonants": "consonants",
      },
      hierarchy: {
        onglides: [],
        offglides: [],
        nuclei: [],
        monophthongs: [],
        consonants: [],
      },
      showConsonants: false,
      selected: "Monophthongs only",
    }
  },
  methods: {
    submitHierarchy() {

    },
    assignPhoneme(p) {
      let pos = this.positions[this.selected]
      if(!this.hierarchy[pos].includes(p)) this.hierarchy[pos].push(p);
      // vowel cannot be in "monophthongs only" and "nuclei"
      if(this.selected == "Monophthongs only") {
        this.hierarchy.nuclei = this.hierarchy.nuclei.filter(ph => ph != p)
        this.hierarchy.onglides = this.hierarchy.onglides.filter(ph => ph != p)
        this.hierarchy.offglides = this.hierarchy.offglides.filter(ph => ph != p)
      } else {
        this.hierarchy.monophthongs = this.hierarchy.monophthongs.filter(ph => ph != p)
      }
    },
    unassignPhoneme(p) {
      let pos = this.positions[this.selected]
      this.hierarchy[pos] = this.hierarchy[pos].filter(ph => p != ph)
    },
    unassigned() {
      return this.vowels.filter(v => {
        return !this.hierarchy.onglides.includes(v) &&
        !this.hierarchy.offglides.includes(v) &&
        !this.hierarchy.nuclei.includes(v)
      })
    },
    generateExampleClusters() {
      if((this.hierarchy.onglides.length + 1) * (this.hierarchy.offglides.length + 1) * this.hierarchy.nuclei.length < 3) return [];

      const randMember = arr => arr[Math.floor(Math.random() * arr.length)]

      let examples = [];
      let i = 0;
      while(examples.length < 7 && i < 10) {
        let example = '/';
        example += (this.hierarchy.onglides.length ? randMember(this.hierarchy.onglides.concat([''])) : '');
        example += randMember(this.hierarchy.nuclei);
        example += (this.hierarchy.offglides.length ? randMember(this.hierarchy.offglides.concat([''])) : '');
        example += '/';
        examples.includes(example) ? null : examples.push(example)
        i++
      }
      console.log(this.hierarchy)
      console.log(examples)
      return examples
    }
  },
  created() {
    this.hierarchy.monophthongs = this.vowels;
  },
}

// type NucleusHierarchyIPA struct {
// 	LanguageID   string   `json:"lang_id" bson:"lang_id"`
// 	Onglides     []string `json:"onglides" bson:"onglides"`
// 	Nuclei       []string `json:"nuclei" bson:"nuclei"`
// 	Offglides    []string `json:"offglides" bson:"offglides"`
// 	Monophthongs []string `json:"monophthongs" bson:"monophthongs"`
// 	Consonants   []string `json:"consonants" bson:"consonants"`
// }
</script>

<style scoped>
  .form-check {
    padding: .5rem;
    padding-left: 2rem;
  }
</style>