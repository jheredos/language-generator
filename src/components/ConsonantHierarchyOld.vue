<template>
  <article class="card section-card">
    <h5 class="card-title">Sonority Hierarchy: <b>{{ position }}</b></h5>
    <h6 v-if="position == 'Onset'" class="card-subtitle mb-2 text-muted">Lower numbered levels are more likely to begin a consonant cluster</h6>
    <h6 v-if="position == 'Coda'" class="card-subtitle mb-2 text-muted">Higher numbered levels are more likely to begin a consonant cluster</h6>
    <!-- Control -->
    <div class="card-body">
      <div class="input-group mb-3">
        <button 
          class="btn btn-primary" 
          @click="submitHierarchy()">Submit</button>
        <button 
          class="btn btn-outline-secondary" 
          @click="resetHierarchy()">Reset</button>
        <button 
          class="btn btn-outline-secondary dropdown-toggle" 
          type="button" data-toggle="dropdown" 
          aria-haspopup="true" 
          aria-expanded="false">Templates</button>
        <div class="dropdown-menu">
          <a class="dropdown-item" 
            v-for="(tmp, name) in templateHierarchies" :key="name"
            @click="applyHierarchyTemplate(name)">{{ name }}</a>
        </div>
      </div>
      <div class="hierarchy-table-container">
      <!-- Table -->
      <table class="table-bordered hierarchy-table">
        <thead>
          <tr>
            <th style="width: 2rem;">Level</th>
            <th>Phonemes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              <button 
                class="btn btn-outline-secondary add-level-btn"
                @click="levels.length < maxLevels ? levels.unshift([]) : null"
                :disabled="levels.length >= maxLevels">Add level above</button>
            </th>
            <td></td>
          </tr>
          <tr 
            v-for="(level, i) in levels" :key="i"
            class="hierarchy-table-row"
            :class="{ 'table-primary': selectedLevel == i }"
            @click="selectedLevel = i">
            <th>{{ i + 1 }}</th>
            <td>
              <button 
                v-for="(phoneme, j) in level"
                :key="j"
                class="btn btn-primary phoneme-btn"
                @click="unassignPhoneme(phoneme)">{{ phoneme }}</button>
            </td>
          </tr>
          <tr>
            <th>
              <button 
                class="btn btn-outline-secondary add-level-btn"
                @click="levels.length < maxLevels ? levels.push([]) : null"
                :disabled="levels.length >= maxLevels">Add level below</button>
            </th>
            <td></td>
          </tr>
          <!-- No Cluster -->
          <tr>
            <th colspan="2"></th>
          </tr>
          <tr
            :class="{ 'table-primary': selectedLevel == -1 }"
            @click="selectedLevel = -1">
            <th>Does not occur in clusters</th>
            <td>
              <button 
                v-for="(phoneme, j) in noCluster"
                :key="j"
                class="btn btn-primary phoneme-btn"
                @click="unassignPhoneme(phoneme)">{{ phoneme }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Unassigned phonemes -->
      <div class="card phoneme-menu-container">
        <div class="card-body">
          <h6 v-if="position != 'Nucleus'" class="text-muted">Leave a phoneme out of the hierarchy to disallow it in the {{position}}</h6>
          <button 
            v-for="(phoneme, i) in unassigned()"
            :key="i"
            class="btn btn-primary phoneme-btn"
            @click="assignPhoneme(phoneme)">{{ phoneme }}</button>
        </div>
      </div>
      </div>
      <!-- Examples -->
      <div class="examples-container">
        <h6 class="text-muted"
          >Examples: 
            <span v-for="(x, i) in generateExampleClusters()" :key="i">
              {{x}}{{ generateExampleClusters().length - 1 > i ? ", " : null }}
            </span>
        </h6>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: 'ConsonantHierarchy',
  props: {
    phonemes: Array,
    position: String,
  },
  data() {
    return {
      levels: [[],[]],
      selectedLevel: 0,
      templateHierarchies: {},
      noCluster: [],
    }
  },
  computed: {
    maxLevels() {
      if(this.position == 'Nucleus') return 3;
      return 5;
    }
  },
  methods: {
    submitHierarchy() {

    },
    resetHierarchy() {
      this.levels = [[],[]]
      this.noCluster = []
      this.selectedLevel = 0
    },
    updateInventory() {

    },
    generateExampleClusters() {
      if(this.levels.flat().length < 3) return [];

      const randMember = arr => arr[Math.floor(Math.random() * arr.length)]

      let examples = [];
      const possibilities = this.levels.reduce((prod, lvl) => prod * Math.max(1, lvl.length), 1);
      const alreadyUsed = [];

      while(examples.length < 10 && examples.length < possibilities * .8) {

        let example = this.levels.reduce((ex, lvl) => {
          return ex + (lvl.length && Math.random(1) > 0.5 ? randMember(lvl) : "")
        }, "/") + "/"

        if(example.length > 2 && !alreadyUsed.includes(example)) {
          examples.push(example);
          alreadyUsed.push(example)
        }
      }

      return examples
    },
    assignPhoneme(p) {
      if(this.selectedLevel >= 0) this.levels[this.selectedLevel].push(p);
      if(this.selectedLevel == -1) this.noCluster.push(p);
    },
    unassignPhoneme(p) {
      this.levels = this.levels.map(l => {
        return l.filter(ph => ph != p)
      })
      this.noCluster = this.noCluster.filter(ph => ph != p);
    },
    unassigned() {
      return this.phonemes.filter(p => this.levels.flat().indexOf(p) < 0 && this.noCluster.indexOf(p) < 0);
    }
  }
}
</script>

<style scoped>

  .examples-container {
    float: left;
    margin: 1rem;
  }

  .add-level-btn {
    width: 100%;
  }

  .phoneme-btn {
    margin: .2rem;
  }
</style>