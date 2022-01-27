<template lang="pug">
article.card.section-card
  h5.card-title Vowel Inventory
  h6.card-subtitle.mb-2.text-muted The vowel phonemes that your language will have
  .card-body
    // Controls
    .input-group.mb-3
      div
        button.btn.btn-primary(@click='submitVowels()') Submit
        button.btn.btn-outline-secondary(@click='resetVowels()') Reset
        button.btn.btn-outline-secondary.dropdown-toggle(type='button' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false') Templates
        .dropdown-menu
          a.dropdown-item(v-for='(tmp, name) in templates' :key='name' @click='applyVowelTemplate(name)') {{ name }}
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
            .table-cell(v-if='selection[i][j][0].length')
              .table-sub-cell
                button.btn.phoneme-btn(v-for='(phoneme, k) in selection[i][j][0]' :key='k' @click='phoneme.selected = !phoneme.selected' :class="{'btn-outline-primary': !phoneme.selected, 'btn-primary': phoneme.selected, 'hidden-phoneme': phoneme.hidden}" data-toggle='tooltip' data-placement='top' :title='phoneme.description') {{ phoneme.ipa }}
              span(v-if='selection[i][j][0].length && selection[i][j][1].length')  &bull; 
              .table-sub-cell(v-if='selection[i][j][1].length')
                button.btn.phoneme-btn(v-for='(phoneme, k) in selection[i][j][1]' :key='k' @click='phoneme.selected = !phoneme.selected' :class="{'btn-outline-primary': !phoneme.selected, 'btn-primary': phoneme.selected, 'hidden-phoneme': phoneme.hidden}" data-toggle='tooltip' data-placement='top' :title='phoneme.description') {{ phoneme.ipa }}

</template>

<script>
const allVowels = require("../assets/vowels.json")
const allTemplates = require("../assets/templates.json")

export default {
  name: "VowelPicker",
  emits: ['newVowelInventory'],
  data() {
    return {
      frontnesses: ["front", "central", "back"],
      heights: ["close", "near-close", "close-mid", "mid", "open-mid", "near-open", "open"],
      selection: [],
      templates: {},
      display: {
        long: false,
        nasal: false,
      }
    }
  },
  methods: {
    updateDisplay() {
      allVowels.forEach(v => {
        if(v.selected) {
          v.hidden = false
        } else if(v.long && v.nasal) {
          v.hidden = !(this.display.long && this.display.nasal)
        } else if(v.long) {
          v.hidden = !this.display.long
        } else if(v.nasal) {
          v.hidden = !this.display.nasal
        } else {
          v.hidden = false
        }
      })
    },
    submitVowels() {
      let inventory = allVowels.filter(v => v.selected)
      console.log("from VowelPicker: ", inventory.map(v => v.ipa))
      this.$emit('newVowelInventory', inventory)
    },
    resetVowels() {
      allVowels.forEach(v => v.selected = false)
      this.updateDisplay()
      this.$forceUpdate()
      // this.$emit('newVowelInventory', [])
    },
    applyVowelTemplate(t) {
      this.resetVowels()
      this.templates[t].forEach(v => v.selected = true)
    }
  },
  beforeMount() {
    console.log(allVowels)
    const describeVowel = (v) => {
      let desc = ""
      desc += v.long ? "long " : ""
      desc += v.nasal ? "nasal " : ""
      desc += v.height + " "
      desc += v.frontness + " "
      desc += v.rounding ? "rounded " : "unrounded "
      desc += "vowel"
      // desc[0] = desc[0].toUpperCase()
      return desc
    }
    for(let i = 0; i < this.heights.length; i++) {
      this.selection.push([])
      for(let j = 0; j < this.frontnesses.length; j++) {
        this.selection[i].push([])
        this.selection[i][j].push(
          allVowels.filter(v => v.height == this.heights[i] && v.frontness == this.frontnesses[j] && !v.rounding)
        )
        this.selection[i][j].push(
          allVowels.filter(v => v.height == this.heights[i] && v.frontness == this.frontnesses[j] && v.rounding)
        )
      }
    }
    allVowels.forEach(v => {
      v.description = describeVowel(v)
      v.selected = false
    })
    this.updateDisplay()
    for(let t in allTemplates) {
      this.templates[t] = allVowels.filter(v => allTemplates[t].vowels.includes(v.ipa))
    }
  }
}
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