<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>
<script>
    export default {
        mounted(){
            let loading = document.querySelector('#loading')
            loading.style.opacity = 0
            loading.style.transform = 'scale(5)'

            let app = document.querySelector('#app')
            app.style.opacity = 1
            setTimeout(() => loading.remove(),500)
        }
    }
</script>
<style>
    html,body{
        height: 100%
    }
    #app{
        opacity: 0;
        transition: all 1s;
        height: 100%;
    }
</style>
