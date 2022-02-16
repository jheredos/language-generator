<template lang="pug">
.selector-container
  button.btn.btn-outline-primary.phoneme-type-button(
    type='button' data-toggle='dropdown' 
    aria-haspopup='true' aria-expanded='false'
    :class="{'compact': !Object.keys(phoneme.features).length, 'with-features': Object.keys(phoneme.features).length}")
    h2.phoneme-type-symbol.ipa(v-if="!phoneme.features.ipa") {{ phoneme.type }}
    h2.phoneme-type-symbol.ipa(v-else) /{{ phoneme.features.ipa }}/
    .feature-container(v-if="!phoneme.features.ipa")
      .feature-item(v-for="(options, feature) in phoneme.features" :key="feature" @click="removeFeature(feature)")
        small [{{ formatFeature(feature) }}]
  .dropdown-menu(v-if="position == 'target'")
    a.dropdown-item(
      v-for='(desc, symbol) in targetTypes' 
      :key='symbol' @click='changePhonemeType(symbol)')
      b {{ symbol }}
      |  - {{ desc }}
  .dropdown-menu(v-if="position == 'result'")
    a.dropdown-item(
      v-for='(desc, symbol) in resultTypes' 
      :key='symbol' @click='changePhonemeType(symbol)')
      b {{ symbol }}
      |  - {{ desc }}
  .dropdown-menu(v-else)
    a.dropdown-item(
      v-for='(desc, symbol) in phonemeTypes' 
      :key='symbol' @click='changePhonemeType(symbol)')
      b {{ symbol }}
      |  - {{ desc }}
  
  .menus-container
    .button-container           
      button.btn.btn-outline-primary(
        v-if="phoneme.type == 'C' || phoneme.type == 'V'"
        :disabled="phoneme.features.ipa" 
        type='button' data-toggle='dropdown' 
        aria-haspopup='true' aria-expanded='false')
        small Add a feature +
      .dropdown-menu
        // Consonant features
        .feature-menu(v-if="phoneme.type == 'C'")
          strong(
            v-for='(options, feature) in consonantFeatures' :key='feature')
            b(v-if="options.length") {{ feature.toUpperCase() }}{{ ['manners', 'places'].includes(feature) ? " OF ARTICULATION" : "" }}:
            a.dropdown-item(
              v-for="(option, i) in options" :key="i"
              @click='addFeature(feature, option)') 
              | {{ option }}
        // Vowel features
        .feature-menu(v-if="phoneme.type == 'V'")
          strong(
            v-for='(options, feature) in vowelFeatures' :key='feature')
            b(v-if="options.length") {{ feature.toUpperCase() }}:
            a.dropdown-item(
              v-for="(option, i) in options" :key="i" 
              @click='addFeature(feature, option)') 
              | {{ option }}

    .button-container
      button.btn.btn-outline-primary.dropdown-toggle(
        v-if="phoneme.type == 'C' || phoneme.type == 'V'"
        type='button' data-toggle='dropdown' 
        aria-haspopup='true' aria-expanded='false')
        small Select a {{ phoneme.type == 'C' ? 'consonant' : 'vowel' }}
      .dropdown-menu
        // Phonological inventory
        .phoneme-menu(v-if="phoneme.type == 'C'")
          button.btn.btn-primary.phoneme-btn.ipa(
            v-for="(c, i) in consonants" :key="i"
            @click="phoneme.features = {...c}")
            | {{ c.ipa }}
        .phoneme-menu(v-if="phoneme.type == 'V'")
          button.btn.btn-primary.phoneme-btn.ipa(
            v-for="(v, i) in vowels" :key="i"
            @click="phoneme.features = {...v}")
            | {{ v.ipa }}
</template>

<script lang="coffee">
export default
  name: "PhonemeSelector"
  props:
    phoneme: Object
    position: String
    consonants: Array
    vowels: Array

  data: ->
    phonemeTypes: 
      "*": "Anything"
      "C": "A consonant phoneme"
      "V": "A vowel phoneme"
      "#": "Word start or word end"

    targetTypes:
      "C": "A consonant phoneme"
      "V": "A vowel phoneme"
      "#": "Word start or word end"

    resultTypes:
      "C": "A consonant phoneme"
      "V": "A vowel phoneme"
      "∅": "Nothing"

    consonantFeatures:
      places: []
      manners: []
      voiced: []
      aspirated: []
      sibilant: []
      lateral: []
      nonpulmonic: []

    vowelFeatures:
      frontnesses: []
      heights: []
      long: []
      nasal: []
    
  methods:
    changePhonemeType: (newType) ->
      unless newType == this.phoneme.type
        this.phoneme.type = newType
        this.phoneme.features = {}

    addFeature: (feature, option) ->
      if feature in ['places', 'manners', 'nonpulmonic', 'frontnesses', 'heights']
        this.phoneme.features[feature] = [] unless feature of this.phoneme.features
        this.phoneme.features[feature].push option unless option in this.phoneme.features[feature]
      else 
        this.phoneme.features[feature] = option

    removeFeature: (feature) -> delete this.phoneme.features[feature]

    formatFeature: (feature) ->
      if feature in ['places', 'manners', 'nonpulmonic', 'frontnesses', 'heights']
        this.phoneme.features[feature].reduce ((list, feat, i) => list + (if i then ', ' else '') + '+' + feat), ''
      else
        (if this.phoneme.features[feature] then '+' else '-') + feature

  beforeMount: ->
    this.phoneme.type = if this.position in ['target', 'result'] then 'C' else '*'

    # set up consonant features for given inventory
    allPlaces = ["bilabial", "labio-dental", "dental", "alveolar", "post-alveolar", "retroflex", "palatal", "velar", "uvular", "pharyngeal", "glottal"]
    allManners = ["nasal", "stop", "affricate", "fricative", "approximant", "tap", "trill", "click"]
    allAirflows = ["ejective", "implosive", "velaric"]

    this.consonantFeatures.places = allPlaces.filter (p) => _.some this.consonants, (c) => c.place == p
    this.consonantFeatures.manners = allManners.filter (m) => _.some this.consonants, (c) => c.manner == m
    this.consonantFeatures.nonpulmonic = allAirflows.filter (a) => _.some this.consonants, (c) => c.nonpulmonic == a
    this.consonantFeatures.nonpulmonic.unshift "pulmonic" if this.consonantFeatures.nonpulmonic.length > 0

    bothExist = (list, feature) -> if (_.some list, (p) => p[feature]) and (_.some list, (p) => not p[feature]) then [true, false] else []
    this.consonantFeatures[feature] = bothExist this.consonants, feature for feature in ['voiced', 'aspirated', 'sibilant', 'lateral']
    
    # set up vowel features for given inventory
    allFrontnesses = ["front", "central", "back"]
    allHeights = ["close", "near-close", "close-mid", "mid", "open-mid", "near-open", "open"]

    this.vowelFeatures.frontnesses = allFrontnesses.filter (f) => _.some this.vowels, (v) => v.frontness == f
    this.vowelFeatures.heights = allHeights.filter (h) => _.some this.vowels, (v) => v.height == h

    this.vowelFeatures[feature] = bothExist this.vowels, feature for feature in ['nasal', 'long']

</script>

<style scoped>
  .selector-container {
    display: flex;
    margin: auto;
  }

  .phoneme-type-button {
    margin: .2rem;
    max-width: 70%;
  }

  .phoneme-type-button.compact {
    width: 3.2rem;
    height: 3.2rem;
  }

  .phoneme-type-button.with-features {
    line-height: .9;
    display: flex;
  }

  .phoneme-type-symbol {
    margin: auto;
  }

  .feature-container {
    margin: auto .5rem;
    overflow: auto;
  }

  .feature-item {
    cursor: pointer;
  }

  .menus-container {
    min-width: 30%;
    margin: 0;
    margin-left: auto;
  }

  .button-container .btn {
    width: 100%;
    padding: .2rem;
  }

  .dropdown-menu {
    max-height: 50%;
    padding: 1rem;
    overflow: scroll;
  }

  .phoneme-btn {
    max-width: 2rem;
    margin: .1rem;
  }
</style>