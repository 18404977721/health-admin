<template>
  <div>
    <index-chart></index-chart>
  </div>
</template>

<script>
  import IndexChart from './IndexChart'

  export default {
    name: "Analysis",
    components: {
      IndexChart,
    },
    data() {
      return {
      }
    },
    created() {
      this.$store.dispatch('ToggleTheme', "light")
      this.$store.dispatch('ToggleLayoutMode', "sidemenu")
      this.$store.dispatch('ToggleFixSiderbar', false)
    },
    methods: {

    }
  }
</script>