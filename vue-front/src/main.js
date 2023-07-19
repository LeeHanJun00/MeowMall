import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import mixins from './mixins'
import store from './store'
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';



// 레이아웃
import defaultLayout from './layouts/defaultLayout.vue'
import adminLayout from './layouts/adminLayout.vue'
import mypageLayout from './layouts/mypageLayout.vue'

// 유저 페이지
import MainPage from './views/main'
import JoinSelect from './views/joinSelect.vue'
import JoinPage from './views/join.vue'
import LoginPage from './views/login.vue'
import GoodsCatePage from './views/goodsCate.vue'
import GoodsDetailPage from './views/goodsDetail.vue'
import OrderPaymentPage from './views/orderPayment.vue'
import GoodsSearchPage from './views/goodsSearch.vue'
import FindPage from './views/find.vue'    //0710
import BasketPage from './views/basket.vue'

// 마이 페이지
import CatAddPage from './mypage/catAdd.vue'
import CatUpdatePage from './mypage/catUpdate.vue'
import MypagePage from './mypage/mypage.vue'
import MypageUpdatePage from './mypage/mypageUpdate.vue'
import OrderListPage from './mypage/orderList.vue'
import OrderDetailPage from './mypage/orderDetail.vue'
import PassPage from './mypage/pass.vue'    //0707
import MyLikePage from './mypage/myLike.vue'
import MyReview from './mypage/myReview.vue'
import MyQna from './mypage/myQna.vue'

// 관리자 페이지
import GoodsList from './admin/goodsList.vue'
import GoodsAdd from './admin/goodsAdd.vue'
import GoodsUpdate from './admin/goodsUpdate.vue'
import UserInfo from './admin/userInfo.vue'
import OrderManagement from './admin/orderM.vue'

//QNA
import QnaMain from './admin/qnaMain.vue'
import QnaContent from './admin/qnaContent.vue'
import WriteA from './admin/qnaAnswer.vue'

//QNA페이지
import qnaMain from './views/qnaMain.vue'
import qnaWrite from './views/qnaWrite.vue'
import qnaContent from './views/qnaContent'

const routes = [
    {
        path: '/',
        name: 'defaultLayout',
        component: defaultLayout,
        children: [
            {
                path: '/',
                component: MainPage,
            },
            {
                path: '/join',
                component: JoinPage,
            },
            {
                path: '/login',
                component: LoginPage,
            },
            {
                path: '/goodsCate/:category',
                name: 'goodsCate',
                component: GoodsCatePage,
            },
            {
                path: '/goodsDetail/:goodsno',
                name: 'goodsDetail',
                component: GoodsDetailPage,
            },
            {
                path: '/orderPayment/:ordertp/:goodsno/:quantity',
                name: 'orderPayment',
                component: OrderPaymentPage,
            },
            {
                path: '/goodsSearch',
                name: 'goodsSearch',
                component: GoodsSearchPage,
            },
            {
                path: '/find',
                component: FindPage,
            },
            {
                path: '/qnamain',
                component: qnaMain,
            },
            {
                path: '/qnawrite',
                component: qnaWrite,
            },
            {
                path: '/qnamain/qnacontent',
                component:qnaContent,
            },
            {
                path: '/basket',
                component: BasketPage,
            },
            {
                path: '/joinselect',
                component:JoinSelect
            },
        ]
    },
    {
        path: '/admin/',
        name: 'adminLayout',
        component: adminLayout,
        children: [
            {
                path: 'goodsList',
                component: GoodsList,
            },
            {
                path: 'goodsAdd',
                component: GoodsAdd,
            },
            {
                path: 'userlist',
                component: UserInfo,
            },
            {
                path: 'goodsUpdate/:goodsno',
                name: 'goodsUpdate',
                component: GoodsUpdate,
            },
            {
                path: 'order',
                component: OrderManagement,
            },
            {
                path:'qna',
                component: QnaMain,
            },
            {
                path:'qna/qnacontent',
                component:QnaContent
            },
            {
                path:'qna/qnacontent/write',
                component:WriteA
            }
        ]
    },
    {
        path: '/mypage/',
        name: 'mypageLayout',
        component: mypageLayout,
        children: [
            {
                path: '',
                component: MypagePage,
            },
            {
                path: 'update',
                component: MypageUpdatePage,
            },
            {
                path: 'catAdd',
                component: CatAddPage,
            },
            {
                path: 'catUpdate',
                component: CatUpdatePage,
            },
            {
                path: 'orderList',
                component: OrderListPage,
            },
            {
                path: 'orderDetail/:orderno',
                name: 'orderDetail',
                component: OrderDetailPage,
            },
            {
                path: 'pass',
                component: PassPage,
            },
            {
                path: 'myLike',
                component: MyLikePage,
            },
            {
                path: 'myReview',
                component: MyReview
            },
            {
                path: 'myQna',
                component: MyQna
            }
        ]
    }
]

// 직접 본인 카카오 디벨로퍼에 등록해야 사용 가능!!!
window.Kakao.init('e9641a4d39bd4ad7aca3d61ef10430f3');

const router = createRouter({
    history: createWebHistory(),
    routes
});

const app = createApp(App)
app.use(router);
app.mixin(mixins);
app.use(store);
app.use(VueSweetalert2);
app.mount('#app')