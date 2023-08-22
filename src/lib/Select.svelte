<script lang="ts">
  export let id
  export let options
  export let label
  export let handleChange
  export let value
</script>

<label>
  {label}
  <select {id} on:input={handleChange} {value}>
    {#each options as opt}
      <option value={opt.id}>{opt.label}</option>
    {/each}
  </select>
</label>
