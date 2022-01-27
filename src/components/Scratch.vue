<template lang="pug">
article.card.section-card
  h1.card-title(@click="sayHey()") {{ blurb }}
  button.btn.btn-primary(@click="logIt()") Log it!
</template>

<script lang="coffee">
export default
  name: "Scratch"
  data: () ->
    blurb: "hey hey hey"
  methods:
    sayHey: () ->
      this.blurb += " hey"
    logIt: () ->
      console.log "hey"
</script>

<style scoped>  

</style>