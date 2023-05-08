<script setup>
import { GameSessionStore } from '../../stores/GameSessionStore'
import { GameDefaults } from '../../GameDefaults'
</script>

<template>
  <div class="about-page">
    <div class="game-logo">
      <img
        src="@/assets/svg/moderator-mayhem.svg"
        alt="the moderator mayhem game logo"
      />
    </div>
    <div class="engine-logo">
      <a href="https://engine.is" target="_blank">
        <img src="@/assets/logos/logo-engine.png" alt="the engine logo" />
      </a>
    </div>
    <div class="game-info">
      A game exploring the difficult choices and tradeoffs involved in content
      moderation.
      <a :href="GameDefaults.infoURL" target="_blank"
        >Learn more about why we created Moderator Mayhem &raquo;</a
      >
    </div>
    <div class="developer-info">
      <p>
        Built by
        <a href="https://copia.is/gaming/" title="Copia Gaming" target="_blank"
          ><strong>Copia Gaming</strong></a
        >
        and
        <a
          href="https://leveragedplay.com/"
          title="Leveraged Play"
          target="_blank"
          ><strong>Leveraged Play</strong></a
        ><br />
      </p>
      <p>
        Written &amp; developed by <strong>Mike Masnick</strong>,<br /><strong
          >Randy Lubin</strong
        >, and <strong>Leigh Beadon</strong>
      </p>
      <div class="logo-pair">
        <div class="copia">
          <a
            href="https://copia.is/gaming/"
            title="Copia Gaming"
            target="_blank"
            ><img src="@/assets/logos/logo-copia.svg" alt="Copia Gaming"
          /></a>
        </div>
        <div class="leveraged-play">
          <a
            href="https://leveragedplay.com/"
            title="Leveraged Play"
            target="_blank"
            ><img src="@/assets/logos/logo-lp.svg" alt="Leveraged Play"
          /></a>
        </div>
      </div>
    </div>
    <button class="btn-basic" @click="GameSessionStore.showAbout = false">
      Close
    </button>
  </div>
</template>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
  padding: 2rem 3rem;

  background: var(--modal-bg-color);
  overflow: hidden;
}

.game-logo {
  width: 65%;
  padding-bottom: 2rem;
  border-bottom: 0.2rem solid rgba(255, 255, 255, 0.4);
  margin: 0 auto 2rem;
  flex-shrink: 3;
}

.game-logo img {
  display: block;
  height: 8vh;
  min-height: 55px;
  max-height: 70px;
  margin: 0 auto;
}

.engine-logo img {
  display: block;
  height: 8vh;
  min-height: 45px;
  max-height: 60px;
  margin: 0 auto;
}

div.game-info {
  margin-top: 3rem;
  font-size: 1.8rem;
  font-weight: 300;
}

div.game-info a {
  font-weight: 600;
}

div.developer-info {
  font-size: 1.4rem;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border: 0.2rem solid var(--card-outershadow-color);
  border-radius: 1.5rem;
}

div.developer-info p {
  margin-top: 0;
}
div.logo-pair {
  display: flex;
  align-items: center;
  width: 80%;
  margin: 1.5rem auto 0;
}

div.logo-pair > div.copia {
  width: 35%;
  margin-right: 15%;
}

div.logo-pair > div.leveraged-play {
  width: 50%;
}

div.logo-pair > div img {
  display: block;
  width: 100%;
}
</style>
