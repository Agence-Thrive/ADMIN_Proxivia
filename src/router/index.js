import Vue from "vue";
import VueRouter from "vue-router";
import Admin from "../views/Admin";
import Login from "../views/Login";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Admin",
        component: Admin,
        meta: {
            title: "Admin",
		public: false,
        },
    },
    {
        path: "/login",
        name: "Login",
        component: Login,
        meta: {
            title: "Se connecter",
        },
    },
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes,
});

export default router;
