<template>
    <div id="app">
        <md-app>
            <md-app-toolbar md-elevation="0" class="background-primary">
                <div class="md-toolbar-row">
                    <span class="proxivia-title">
                        Pro<span style="color: var(--color-secondary);">x</span
                        >ivia
                    </span>
                    <div class="md-toolbar-section-end">
                        <a class="website-link" href="#"
                            >Accéder à my.proxivia-viager.fr</a
                        >
                    </div>
                </div>

                <div class="md-toolbar-row">
                    <h4 style="color: white">{{ $route.meta.title }}</h4>
                </div>
            </md-app-toolbar>

            <md-app-content class="margin-minus">
                <router-view />
            </md-app-content>
        </md-app>
    </div>
</template>

<style>
#app {
    min-height: 100vh;
}

.md-app {
    min-height: 100vh !important;
}

.background-primary {
    background: var(--color-primary) !important;
    padding-top: 10px !important;
    padding-bottom: 30px !important;
    z-index: -2 !important;
}

span.proxivia-title {
    font-weight: 500;
    color: white;
    font-size: 34px;
}

.margin-minus {
    margin-top: -35px;
}

a.website-link {
    color: white !important;
}

a.nav-link,
a.nav-link:hover {
    color: var(--color-primary);
    text-decoration: none !important;
}
</style>
