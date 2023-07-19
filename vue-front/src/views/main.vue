<template>
    <div>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"
            integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous" />
        <div id="mainslider">
            <splide :options="options">
                <splide-slide>
                    <img class="slider-image" src="../assets/banner1.png" alt="main1" />
                </splide-slide>
                <splide-slide>
                    <img class="slider-image" src="../assets/banner2.png" alt="main2" />
                </splide-slide>
            </splide>
        </div>
        <div class="content cate-list">
            <h2 class="home_title">사료 BEST</h2>
            <div class="s1" style="height: 230px;">
                <div class="card" style="width: 20rem; height: 360px; border: none; margin: 0 1%;"
                    v-for="(goods, index) in filteredGoodsList(1).slice(0, 4)" :key="index">
                    
                    <span class="rank-badge"><i v-if="!index" class="fas fa-crown crown"></i><strong>{{ index + 1 }}</strong> 위</span>
                    <a :href="'http://localhost:8080/goodsDetail/' + goods.GOODS_NO" class="imgSpace">
                        <img :width="230"
                            :src="goods.GOODS_IMG ? require(`../../../node-back/uploads/uploadGoods/${goods.GOODS_IMG}`) : '/goodsempty.jpg'"
                            alt="상품 이미지" />
                    </a>
                    <div class="card-body" style="padding: 1px;">
                        <p class="card-text align-left goods-nm" @click="goToDetail(goods.GOODS_NO)">
                            {{ goods.GOODS_NM }}
                        </p>
                        <p class="card-text align-left goods-price">{{ formatPrice(goods.GOODS_PRICE) }}</p>
                        <p class="card-text align-left" style="margin: 0;">
                            <span class="badge text-bg-light">{{ goods.GOODS_HASHTAG1 }}</span>
                            <span class="badge text-bg-light">{{ goods.GOODS_HASHTAG2 }}</span>
                            <span class="badge text-bg-light">{{ goods.GOODS_HASHTAG3 }}</span>
                        </p>
                    </div>
                </div>
            </div>

            <h2 class="home_title">간식 BEST</h2>
            <div class="s1" style="height: 230px;">
                <div class="card" style="width: 20rem; height: 360px; border: none; margin: 0 1%;"
                    v-for="(goods, index) in filteredGoodsList(2).slice(0, 4)" :key="index">
                    <span class="rank-badge"><i v-if="!index" class="fas fa-crown crown"></i><strong>{{ index + 1 }}</strong> 위</span>
                    <a :href="'http://localhost:8080/goodsDetail/' + goods.GOODS_NO" class="imgSpace">
                        <img :width="230"
                            :src="goods.GOODS_IMG ? require(`../../../node-back/uploads/uploadGoods/${goods.GOODS_IMG}`) : '/goodsempty.jpg'"
                            alt="상품 이미지" />
                    </a>
                    <div class="card-body" style="padding: 1px;">
                        <p class="card-text align-left goods-nm" @click="goToDetail(goods.GOODS_NO)">
                            {{ goods.GOODS_NM }}
                        </p>
                        <p class="card-text align-left goods-price">{{ formatPrice(goods.GOODS_PRICE) }}</p>
                        <p class="card-text align-left" style="margin: 0;">
                            <span class="badge text-bg-light">{{ goods.GOODS_HASHTAG1 }}</span>
                            <span class="badge text-bg-light">{{ goods.GOODS_HASHTAG2 }}</span>
                            <span class="badge text-bg-light">{{ goods.GOODS_HASHTAG3 }}</span>
                        </p>
                    </div>
                </div>
            </div>

            <h2 class="home_title">용품 BEST</h2>
            <div class="s1" style="height: 230px;">
                <div class="card" style="width: 20rem; height: 360px; border: none; margin: 0 1%;"
                    v-for="(goods, index) in filteredGoodsList(3).slice(0, 4)" :key="index">
                    <span class="rank-badge"><i v-if="!index" class="fas fa-crown crown"></i><strong>{{ index + 1 }}</strong> 위</span>
                    <a :href="'http://localhost:8080/goodsDetail/' + goods.GOODS_NO" class="imgSpace">
                        <img :width="230"
                            :src="goods.GOODS_IMG ? require(`../../../node-back/uploads/uploadGoods/${goods.GOODS_IMG}`) : '/goodsempty.jpg'"
                            alt="상품 이미지" />
                    </a>
                    <div class="card-body" style="padding: 1px;">
                        <p class="card-text align-left goods-nm" @click="goToDetail(goods.GOODS_NO)">
                            {{ goods.GOODS_NM }}
                        </p>
                        <p class="card-text align-left goods-price">{{ formatPrice(goods.GOODS_PRICE) }}</p>
                        <p class="card-text align-left" style="margin: 0;">
                            <span class="badge text-bg-light">{{ goods.GOODS_HASHTAG1 }}</span>
                            <span class="badge text-bg-light">{{ goods.GOODS_HASHTAG2 }}</span>
                            <span class="badge text-bg-light">{{ goods.GOODS_HASHTAG3 }}</span>
                        </p>
                    </div>
                </div>
            </div>

            <h2 class="home_title">의류 BEST</h2>
            <div class="s1" style="height: 230px;">
                <div class="card" style="width: 20rem; height: 360px; border: none; margin: 0 1%;"
                    v-for="(goods, index) in filteredGoodsList(4).slice(0, 4)" :key="index">
                    <span class="rank-badge"><i v-if="!index" class="fas fa-crown crown"></i><strong>{{ index + 1 }}</strong> 위</span>
                    <a :href="'http://localhost:8080/goodsDetail/' + goods.GOODS_NO" class="imgSpace">
                        <img :width="230"
                            :src="goods.GOODS_IMG ? require(`../../../node-back/uploads/uploadGoods/${goods.GOODS_IMG}`) : '/goodsempty.jpg'"
                            alt="상품 이미지" />
                    </a>
                    <div class="card-body" style="padding: 1px;">
                        <p class="card-text align-left goods-nm" @click="goToDetail(goods.GOODS_NO)">
                            {{ goods.GOODS_NM }}
                        </p>
                        <p class="card-text align-left goods-price">{{ formatPrice(goods.GOODS_PRICE) }}</p>
                        <p class="card-text align-left" style="margin: 0;">
                            <span class="badge text-bg-light">{{ goods.GOODS_HASHTAG1 }}</span>
                            <span class="badge text-bg-light">{{ goods.GOODS_HASHTAG2 }}</span>
                            <span class="badge text-bg-light">{{ goods.GOODS_HASHTAG3 }}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
import { Splide, SplideSlide } from '@splidejs/vue-splide';
import '@splidejs/splide/dist/css/themes/splide-default.min.css';
import axios from 'axios';

export default {
    name: 'MainSlider',
    components: {
        Splide,
        SplideSlide,
    },
    data() {
        return {
            goodsList: [],
            options: {
                type: 'fade',
                rewind: true,
                perPage: 1,
                autoplay: true,
                interval: 3000,
                pauseOnHover: false,
                arrows: false,
                dots: true,
                animatedDots: true,
                transition: 'fade',
                speed: 800,
            },
        };
    },
    mounted() {
        this.getGoodsList();
    },
    methods: {
        async getGoodsList() {
            try {
                const response = await axios.get('http://localhost:3000/goods/maingoods');
                this.goodsList = response.data;
            } catch (error) {
                console.error(error);
            }
        },
        goToDetail(goodsno) {
            window.location.href = `http://localhost:8080/goodsDetail/${goodsno}`;
        },
        formatPrice(price) {
            if (price !== undefined) {
                const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                return `${formattedPrice} 원`;
            }
            return '';
        },
        filteredGoodsList(category) {
            return this.goodsList.filter((goods) => goods.GOODS_CATEGORY === category);
        },
    },
};
</script>
  
  
<style scoped>
.slider-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
}

@media screen and (max-width: 768px) {
    .slider-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
    }

    img {
        width: auto;
        height: 200px;
        /* object-fit: contain; 이미지 비율 */
    }
}

@font-face {
    font-family: 'ONE-Mobile-Regular';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/ONE-Mobile-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

.cate-list {
    font-family: ONE-Mobile-Regular;
}

.goods-nm {
    font-size: 14px;
    color: black;
    font-weight: bold;
}

.goods-nm:hover {
    color: #FFAF7D;
    cursor: pointer;
}

.goods-price {
    font-size: 13px;
}

.cate-header {
    display: flex;
    justify-content: space-between;
}

.cate-header .h6 {
    font-size: 14px;
    margin: auto;
}

.crown {
    padding-right: 5px;
}

/* 이미지 확대 */
.imgSpace {
    max-width: 230px;
    max-height: 230px;
    min-width: 100px;
    min-height: 100px;
    overflow: hidden;
    padding: auto;
    border-radius: 15%;
    background-color: #eeeeee;
}

a img {
    margin: auto;
    width: 100%;
    height: 100%;

}

a:hover img {
    transform: scale(1.12);
    transition: all 0.1s linear;
}

a:not(:hover) img {
    transform: scale(1.0);
    transition: all 0.1s linear;
}

/* ----------------------------- */

.card-text {
    margin: 3px;
    margin-top: 5px;
}

.card-text.align-left {
    text-align: left;
}

.card {
    flex-direction: column;
    flex-wrap: wrap;
}

.s1 {
    display: flex;
    margin-bottom: 150px;
}

.content {
    max-width: 1040px;
    width: 80%;
    margin: auto;
    padding-top: 30px;

}

.home_title {
    margin: 40px 0px 20px 0px;
    text-align: center;
}

@media screen and (max-width: 768px) {

    img {
        width: auto;
        height: 200px;
        /* object-fit: contain; 이미지 비율 */
    }
}
</style>