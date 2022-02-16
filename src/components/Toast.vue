<template lang="pug">
.toast-container(
  :class="{ 'active': toast.active }")
  .alert.ipa(
    role="alert"
    :class="{'alert-success': toast.type != 'error', 'alert-danger': toast.type != 'success'}")
    h5.alert-heading {{ toast.type == 'success' ? '/sʌkˈsɛs/' : '/ˈʌʔoʊ/' }}!  
    span {{ toast.message }}
</template>

<script lang="coffee">
export default
  name: 'Toast'
  computed:
    toast: -> this.$store.getters.getToast
</script>

<style scoped>
  .toast-container {
    display: block;
    position: fixed;
    z-index: 100;
    margin: 0rem auto;
    width: 100%;
    bottom: -10rem;
    -webkit-transition: bottom 0.7s cubic-bezier(1, -0.3, 0.3, 1.3);
    transition: bottom 0.7s cubic-bezier(1, -0.3, 0.3, 1.3);
  }

  .toast-container.active {
    bottom: 0rem;
  }

  .toast-container .alert {
    min-width: 18rem;
    height: fit-content;
    box-shadow: 3px 4px 6px rgba(0, 0, 0, 0.2);
    display: inline-block;
    text-align: left;
  }

  .toast-container .alert .alert-heading {
    font-weight: bold;
  }
</style>