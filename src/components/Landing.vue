<template lang="pug">
article.card.section-card
  h3.card-title.ipa /ˈwɛl.kəm/!
  p
    | This application walks you through the steps of creating a constructed 
    | language, from the sound system to grammar to word order.
  p
    | It's an active work-in-progress, and it's still in its early stages.
    | Current functionality will take you through the selection of a sound
    | system up to generating word stems. Future features will not only allow 
    | more control over phonology and phonotactics, but will also allow 
    | customization of morphology, syntax, and lexicon. It will also include 
    | a login function to allow you save your languages.
  p
    | To get started, click the "Create New Language" button below. If you 
    | copy and paste the ID that it produces, you will be able to load and 
    | edit the language later. 

  div
    .input-group
      input(v-model="loadID")
      button.btn.btn-primary(@click="loadLanguage()") Load a Language
    b OR
    .input-group
      button.btn.btn-primary(@click="newLanguage()") Create New Language
  
</template>

<script lang="coffee">
export default 
  name: "Landing"
  data: ->
    loadID: ""

  methods:
    newLanguage: ->
      this.$store.dispatch "createNewLanguage"

    loadLanguage: ->
      this.$store.dispatch "loadLanguage", this.loadID
      this.loadID = ""

</script>

<style scoped>
.input-group {
  display: block;
  margin: 2rem auto;
  max-width: 60%;
}

p {
  margin: 0.5rem 2rem;
}
</style>