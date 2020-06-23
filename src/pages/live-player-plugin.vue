<template>
  <div class="home">

  </div>
</template>

<script>
export default {
  onShow() {
      const room_id = this.$mp.query.room_id
      wx.redirectTo({
        url: 'plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?a=1&room_id='+room_id
      })
  }
};
</script>

