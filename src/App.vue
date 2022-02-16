<template lang="pug">
Toast
nav.navbar.sticky-top.navbar-expand-lg.navbar-dark.bg-dark
  a.navbar-brand(href='#' @click='goBack()') The Language Generator
  ul.navbar-nav
    li.nav-item(:class="{'text-white': progress == 0, 'text-muted': progress != 0}") Start 
    li.nav-item.text-muted &nbsp; &gt; &nbsp;
    li.nav-item(:class="{'text-white': [1,2].includes(progress), 'text-muted': ![1,2].includes(progress)}") Phonemes 
    li.nav-item.text-muted &nbsp; &gt; &nbsp;
    li.nav-item(:class="{'text-white': [3,4,5].includes(progress), 'text-muted': ![3,4,5].includes(progress)}") Phonotactics 
    li.nav-item.text-muted &nbsp; &gt; &nbsp;
    li.nav-item(:class="{'text-white': progress == 6, 'text-muted': progress != 6}") Generate
.lang-id-container.mt-2.mb-3
  span.text-muted(v-if="langID != ''") Language ID: {{ langID }}

.step-container(v-if="progress == 0")
  Landing

.step-container(v-else-if="progress == 1")
  h3 Phonemic Inventory
  ConsonantPicker

.step-container(v-else-if="progress == 2")
  h3 Phonemic Inventory
  VowelPicker

.step-container(v-else-if="progress == 3")
  h3 Phonotactics
  ConsonantHierarchy(position='Onset')

.step-container(v-else-if="progress == 4")
  h3 Phonotactics
  NucleusHierarchy

.step-container(v-else-if="progress == 5")
  h3 Phonotactics
  ConsonantHierarchy(position='Coda')

.step-container(v-else-if="progress == 6")
  h3 Lexicon
  article.card.section-card
    .card-body
      button.btn.btn-primary(@click="generateWords()") Generate New Words
      .word-list
        ul(v-for="(n, i) in [0,1,2]" :key="i")
          li.ipa(v-for="(word, j) in words.slice(i * 10, (i+1) * 10)" :key="j") /{{ word }}/
      hr
      .coming-soon.mb-4
        h4 Coming soon:
        h5 Phonology and Phonotactics
        ul
          li Stress and tone
          li Customize phonotactic patterns
          li Allophony and sound changes
        h5 Morphology
        ul
          li Generate fusional and agglutinative languages
          li Select grammatical categories like case, number, and class
          li Mark categories through affixes, tone shifts, reduplication, and more
          li Derivational morphology and compounds
        h5 Syntax
        ul
          li Customize word order, prefixes/postfixes, head/dependent-marking, etc.
          li Generate language samples according to your choices in all the above categories
        h5 Lexicon
        ul
          li Generate whole dictionaries
          li Borrow words from other languages
          li Evolve your language with sound changes and semantic shifts
          li Create entire families of languages

        

</template>

<script lang="coffee">
allConsonants = require "./assets/consonants.json"
allVowels = require "./assets/vowels.json"

import _ from 'lodash'
import axios from 'axios'
import Landing from './components/Landing.vue'
import ConsonantPicker from './components/ConsonantPicker.vue'
import VowelPicker from './components/VowelPicker.vue'
import ConsonantHierarchy from './components/ConsonantHierarchy.vue'
import NucleusHierarchy from './components/NucleusHierarchy.vue'
# import Trends from './components/Trends.vue'
import Toast from './components/Toast.vue'

export default
  name: 'App'
  components: {
    Landing
    ConsonantPicker
    VowelPicker
    ConsonantHierarchy
    NucleusHierarchy
    # Trends
    Toast
  }

  data: ->
    consonants: []
    vowels: []

  computed:
    langID: ->
      this.$store.getters.getLanguageID

    progress: ->
      this.$store.getters.getProgress

    words: ->
      this.$store.getters.getWords

  methods:
    goBack: ->
      if this.langID.length
        this.$store.dispatch "advanceProgress", 1
      else
        this.$store.dispatch "advanceProgress", 0

    getInventory: ->
      this.$store.dispatch "getInventory"

    generateWords: ->
      this.$store.dispatch "getWords"
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

.continue-btn {
  margin: 2rem 1rem;
  margin-left: 65%;
}

.hierarchy-table-container {
  display: flex;
  cursor: pointer;
  width: 100%;
}

.hierarchy-table {
  min-width: 60%;
}

.table-container {
    display: flex;
    padding: .4rem;
  }

.phoneme-menu-container {
  min-width: 40%;
  margin: 0 .5rem;
  padding: 2rem;
}

  
.form-check {
  margin: 1rem;
}

.word-list {
  display: flex;
  margin: 3rem auto;
}

.word-list ul {
  width: 30%;
  margin: auto;
  list-style: outside none none;
}

.word-list ul li {
  margin: .8rem auto;
}

.coming-soon ul {
  width: 60%;
  margin: auto;
  text-align: left;
}

.coming-soon h5 {
  margin-top: 2rem;
}

.ipa {
  font-family: sans-serif;
}
</style>
