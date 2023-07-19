<template>
    <div v-if="goods">
        <div class="product-details">
            <div class="product-image">
                <img :width="520"
                    :src="goods.goods_img ? require(`../../../node-back/uploads/uploadGoods/${goods.goods_img}`) : '/goodsempty.jpg'"
                    alt="상품 이미지">
            </div>
            <div class="product-info">
                <div class="category">
                    {{ categoryType(goods.goods_category) }}
                </div>
                <div class="header">
                    <h2>{{ goods.goods_nm }}</h2>
                    <button v-if="user.user_no === ''" class="heart-button" @click="likeInsert">
                        <i class="far fa-heart heart-icon"></i>
                    </button>
                    <button v-else-if="!isLiked" class="heart-button" @click="likeInsert">
                        <i class="far fa-heart heart-icon"></i>
                    </button>
                    <button v-else class="heart-button" @click="likeDelete">
                        <i class="fas fa-heart like-heart-icon"></i>
                    </button>
                    <h4>{{ like }}</h4>
                </div>
                <div class="star-rating">
                    <div class="star" v-for="score in 5" :key="score">
                        <span v-if="score < totalScore + 1"><i class="fa fa-star"></i></span>
                        <span v-if="score >= totalScore + 1"><i class="far fa-star"></i></span>
                    </div>
                    <span style="padding-left: 5px;">({{ reviewCnt }}개)</span>
                </div>
                <div class="hashtags">
                    <span class="hashtag">{{ goods.goods_hashtag1 }}</span>
                    <span class="hashtag" v-if="goods.goods_hashtag2 !== null && goods.goods_hashtag2 !== ''">{{
                        goods.goods_hashtag2 }}</span>
                    <span class="hashtag" v-if="goods.goods_hashtag3 !== null && goods.goods_hashtag3 !== ''">{{
                        goods.goods_hashtag3 }}</span>
                </div>
                <h2>{{ formatPrice(goods.goods_price) }}</h2>
                <hr>
                <div class="quantity-section">
                    <h3> 수량 :</h3>
                    <button class="quantity" @click="minus">-</button>
                    <input class="quantity_num" type="number" v-model="quantity" min="1" />
                    <button class="quantity" @click="plus(goods.goods_cnt)">+</button>
                    <p style="font-size: small;"> 재고 : {{ goods.goods_cnt }} 개</p>
                </div>

                <h4>총 가격: {{ formatPrice(goods.goods_price * quantity) }}</h4>
                <p> 예상 적립금 : {{ formatPrice(goods.goods_price * quantity * 0.03) }}</p>
                <br>
                <div class="buttons">
                    <button class="add-to-cart" @click="addToCart()">장바구니</button>
                    <button class="buy-now" @click="goToBuy(goods.goods_no)">구매하기</button>
                </div>
            </div>
        </div>
        <hr class="separator">
        <div class="teb">
            <div id="de" role="tab" @click="handleTabClick('de')" :class="{ active: isTabActive('de') }">제품 상세 내용</div>
            <div id="re" role="tab" @click="handleTabClick('re')" :class="{ active: isTabActive('re') }">리뷰</div>
        </div>

        <div class="section1" v-show="isTabActive('de')">
            <hr class="separator">
            <div class="image-container" :style="{ height: showFullImage ? 'auto' : '800px' }">
                <img class="showstep1"
                    :src="goods.goods_content ? require(`../../../node-back/uploads/uploadGoods/${goods.goods_content}`) : '/goodsempty.jpg'"
                    alt="상품 이미지">
            </div>

            <div class="op">
                <a href="#" class="btn_open" @click.prevent="showFullImage = true" v-show="!showFullImage">더보기</a>
                <a href="#" class="btn_close hide" @click.prevent="showFullImage = false" v-show="showFullImage">접기</a>
            </div>
        </div>

        <div class="section2" v-show="isTabActive('re')">
            <hr class="separator">
            <div style="padding: 16px">
                <div class="total_review">
                    <div style="padding: 40px">
                        <h4>전체 평점</h4>
                        <div class="total_score">
                            <h1>{{ totalScoreDem }}</h1>
                            <p>({{ reviewCnt }}개)</p>
                        </div>
                        <div class="total_review_star">
                            <div class="star" v-for="score in 5" :key="score">
                                <span v-if="score < totalScore + 1"><i class="fa fa-star"></i></span>
                                <span v-if="score >= totalScore + 1"><i class="far fa-star"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="review">
                    <hr style="margin: 15px 0px">
                    <div v-for="(review) in reviewList" :key="review">
                        <div class="review_header">
                            <div class="cat_img">
                                <img v-if="review.CAT_IMG"
                                    :src="require(`../../../node-back/uploads/uploadCat/${review.CAT_IMG}`)" alt="...">
                                <img v-else src="../assets/emptyCat.png" alt="...">
                            </div>
                            <div class="review_profile">
                                <div class="review_star">
                                    <div class="star" v-for="score in 5" :key="score">
                                        <span v-if="score < review.REVIEW_SCORE + 1"><i class="fa fa-star"></i></span>
                                        <span v-if="score >= review.REVIEW_SCORE + 1"><i class="far fa-star"></i></span>
                                    </div>
                                    ({{ review.REVIEW_SCORE }})
                                </div>
                                <div class="review_user_info">
                                    <p v-if="review.CAT_ID">{{ review.USER_NICK }} | {{
                                        formatDateTime(review.REVIEW_CREATE_DT) }} | {{ review.CAT_BREED }} </p>
                                    <p v-else>{{ review.USER_NICK }} | {{ formatDateTime(review.REVIEW_CREATE_DT) }} </p>
                                    <p>
                                    <pre> </pre>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="review_body">
                            <div v-if="review.REVIEW_IMG" style="display: flex;">
                                <div class="review_img" @click="showImg(review.REVIEW_IMG)">
                                    <img :src="require(`../../../node-back/uploads/uploadReview/${review.REVIEW_IMG}`)"
                                        alt="...">
                                </div>
                                <!-- 이미지 크게 보기 용도 모달 -->
                                <div class="wrapper" v-if="showModal === true">
                                    <div class="review_img_large">
                                        <button @click="closeImg()" class="closeBtn"><i class="fa fa-times"></i></button>
                                        <img :src="require(`../../../node-back/uploads/uploadReview/${largeImg}`)"
                                            :width="300" alt="...">
                                    </div>
                                </div>
                                <div class="review_content">
                                    <p>{{ review.REVIEW_CON }}</p>
                                </div>
                            </div>
                            <div v-else>
                                <div class="review_content2">
                                    <p>{{ review.REVIEW_CON }}</p>
                                </div>
                            </div>
                        </div>
                        <hr style="margin-top: 15px">
                    </div>
                </div>
            </div>
        </div>
        <div id="top_btn">
            <a href="#top" v-if="showTopButton" class="show-top-button">
                <img src="../assets/top.png" alt="Top">
            </a>
        </div>
    </div>
    <div v-else>
        로딩 중...
    </div>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            activeTab: 'de',
            goods: {},
            quantity: 1,
            isLiked: false,
            like: 0,
            reviewList: [],
            totalScore: 0,
            totalScoreDem: 0,
            reviewCnt: 0,
            showTopButton: false,
            showFullImage: false,
            showModal: false, // 추가
            largeImg: '',
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        }
    },
    created() {
        this.getGoods();
        this.getLike();
        this.likeCheck();
        this.getReviewList();
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        // 이미지 함수 둘 추가
        showImg(imgSrc) {
            this.largeImg = imgSrc;
            this.showModal = true;
        },
        closeImg() {
            this.showModal = false;
        },
        handleTabClick(tab) {
            this.activeTab = tab;
        },
        isTabActive(tab) {
            return this.activeTab === tab;
        },
        plus(cnt) {
            if (this.quantity + 1 <= cnt) {
                this.quantity++;
            } else if (this.quantity + 1 > cnt) {
                this.$swal('구매가능수량을 초과했습니다');
            }

        },
        minus() {
            if (this.quantity > 1) {
                this.quantity--;
            }
        },
        calTotalScore() {
            if (this.reviewList.length > 0) {
                this.reviewList.forEach((review) => {
                    this.totalScoreDem += review.REVIEW_SCORE;
                    this.reviewCnt++;
                });
                this.totalScoreDem /= this.reviewCnt;
                this.totalScoreDem = this.totalScoreDem.toFixed(1);
                this.totalScore = Math.round(this.totalScoreDem)
            }
        },
        async getReviewList() {
            try {
                const goodsno = this.$route.params.goodsno;
                const response = await axios.get(`http://localhost:3000/goods/getReview/${goodsno}`);
                this.reviewList = response.data;
                this.calTotalScore();
            } catch (error) {
                console.error(error);
            }
        }, // 리뷰 불러오기 추가
        async likeCheck() {
            const user_no = this.user.user_no || null;
            const response = await axios.post(`http://localhost:3000/goods/likeCheck/${this.$route.params.goodsno}/${user_no}`);
            if (response.data.message === 'complete') {
                this.isLiked = response.data.isLiked;
            } else {
                this.isLiked = false;
            }
        },
        async likeInsert() {
            if (this.user.user_no === '') {
                this.$swal('로그인해주세요');
                this.$router.push({ path: '/login' });
            } else {
                await axios.post(`http://localhost:3000/goods/likeInsert/${this.$route.params.goodsno}/${this.user.user_no}`);
                this.isLiked = true;
                await this.getLike();
            }
        },
        async likeDelete() {
            if (this.user.user_no === '') {
                this.$swal('로그인해주세요');
                this.$router.push({ path: '/login' });
            } else {
                await axios.post(`http://localhost:3000/goods/likeDelete/${this.$route.params.goodsno}/${this.user.user_no}`);
                this.isLiked = false;
                await this.getLike();
            }
        },
        async getGoods() {
            try {
                const goodsno = this.$route.params.goodsno;
                const response = await axios.get(`http://localhost:3000/goods/goodsDetail/${goodsno}`);
                this.goods = response.data[0];
            } catch (error) {
                console.error(error);
            }
        },
        async getLike() {
            try {
                const goodsno = this.$route.params.goodsno;
                const response = await axios.get(`http://localhost:3000/goods/likeCount/${goodsno}`);
                this.like = response.data;
                if (this.like === null) {
                    this.like = 0;
                }
            } catch (error) {
                console.error(error);
            }
        },
        categoryType(socialType) {
            if (socialType === 1) {
                return '사료';
            } else if (socialType === 2) {
                return '간식';
            } else if (socialType === 3) {
                return '용품';
            } else if (socialType === 4) {
                return '의류';
            } else {
                return 'null';
            }
        },
        async addToCart() {
            if (this.user.user_no === '') {
                this.$swal('로그인해주세요');
                this.$router.push({ path: '/login' });
            } else {
                axios({
                    url: "http://localhost:3000/goods/basketInsert",
                    method: "POST",
                    data: {
                        user_no: this.user.user_no,
                        basket_goods_price: this.goods.goods_price,
                        basket_goods_count: this.quantity,
                        basket_goods_nm: this.goods.goods_nm,
                        basket_goods_img: this.goods.goods_img,
                        basket_goods_no: this.goods.goods_no,
                    },
                })
                    .then(res => {
                        if (res.data.message == 'check_error') {
                            this.$swal("이미 장바구니에 담긴 상품입니다")
                        }
                        else {
                            this.$swal({
                                title: '상품이 장바구니에 담겼습니다.',
                                showDenyButton: true,
                                confirmButtonText: '장바구니로 이동',
                                denyButtonText: `계속 쇼핑하기`,
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    location.href = "http://localhost:8080/basket"
                                } else if (result.isDenied) {
                                    location.reload();
                                }
                            })
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }
        },
        goToBuy(goodsno) {
            if (this.user.user_no === '') {
                this.$swal('로그인해주세요');
                this.$router.push({ path: '/login' });
            } else {
                const quantity = this.quantity; // 선택된 수량 사용                
                this.$router.push(`/orderpayment/0/${goodsno}/${quantity}`);
            }
        },
        formatPrice(price) {
            if (price !== undefined) {
                const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return `${formattedPrice} 원`;
            }
            return "";
        },
        formatDateTime(dateTime) {
            const date = new Date(dateTime);
            const options = {
                year: "numeric",
                month: "long",
                day: "numeric",
            };
            const formattedDateTime = date.toLocaleDateString("ko-KR", options);
            return formattedDateTime;
        }, // 추가
        handleScroll() {
            if (window.pageYOffset > 600) {
                this.showTopButton = true;
            } else {
                this.showTopButton = false;
            }
        },
    },
};
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
}

ul,
li {
    list-style: none;
}

a {
    text-decoration: none;
}

@font-face {
    font-family: 'GmarketSansMedium';
    font-family: 'GmarketSansBold';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

/* ________________________________리뷰 시작 ________________________________ */

.wrapper {
    background-color: rgba(96, 96, 96, 0.1);
    position: fixed;
    width: 100%;
    height: 100%;
    margin-top: 35px;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.review_img_large {
    background: #fff;
    border-radius: 5px;
    justify-content: center;
    align-items: center;
    padding: 10px;
    padding-bottom: 3px;
}

.closeBtn {
    position: absolute;
    height: 31px;
    margin-left: 273px;
    padding: 5px;
    font-size: 25px;
    color: #cc8c00;
    border: none;
    font-family: GmarketSansMedium;
}

.total_review {
    font-family: 'GmarketSansMedium';
    max-width: 900px;
    margin: auto;
    font-size: 20px;
    vertical-align: middle;
    background-color: #FFF6EC;
    border-radius: 20px;
}

.total_score {
    margin: auto;
    display: flex;
}

.total_score p {
    font-size: 15px;
    margin: 23px 0px 0px 3px
}

.total_review_star {
    display: flex;
    color: #FFAF7D;
}


.review {
    font-family: 'GmarketSansMedium';
    margin: auto;
    max-width: 900px;
    padding: 15px;
}

.review_header {
    display: flex;
    padding: 10px 10px 0px 10px;
}

.cat_img {
    width: 70px;
    height: 70px;
    overflow: hidden;
    border-radius: 70%;

}

.cat_img img {
    width: 70px;
}

.review_profile {
    display: inline;
    padding-left: 8px;
}

.review_star {
    display: flex;
    font-size: 16px;
    margin: 6px;
    color: #FFAF7D;
}

.review_user_info {
    margin: 6px;
}

.review_user_info p {
    margin: 0px;
}

.review_body {
    display: flex;
}

.review_img {
    height: 130px;
    width: 130px;
    min-width: 130px;
    overflow: hidden;
    border-radius: 3px;
    margin: 0px 10px 10px 10px;
}

.review_img :hover {
    cursor: pointer;
}


.review_img img {
    object-fit: cover;
    width: 130px;
}

.review_content {
    margin: 0px 10px 10px 0px;
}

.review_content p {
    margin: 0px;
    font-size: 14px;
    color: black;
}

.review_content2 p {
    margin: 0px 10px;
    font-size: 14px;
    color: black;
}

/* ________________________________리뷰 끝 ________________________________ */

.product-details {
    font-family: GmarketSansMedium;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 10%;
}

.product-image {
    display: inline;
    width: 50%;
    max-width: 560px;
    text-align: center;
    margin-right: 60px;
}

.product-image img {
    max-width: 100%;
    border-radius: 40px;
    background-color: #eee;
}

.product-info {
    display: inline;
    max-width: 800px;
    max-height: 560px;
    /* border: 1px solid rgb(0, 200, 130); */
}

.product-info h2 {
    font-size: 2vw;
    margin-bottom: 10px;
}

.product-info .category {
    font-size: 1rem;
    padding-bottom: 2px;
    color: #aaa;
}

.star-rating {
    display: flex;
    font-size: 16px;
    margin-bottom: 10px;
    color: #FFAF7D;
}

.hashtags {
    margin-bottom: 20px;
    font-size: 14px;
}

.hashtag {
    display: inline-block;
    text-align: center;
    color: #f4790d;
    background-color: #f2f2f2;
    border-radius: 5px;
    padding: 8px 14px;
    margin-right: 8px;
}

p {
    margin: 20px 0 4px 0;
}

hr {
    border: 1px solid #f0f0f0;
}

.buttons {
    display: flex;
}

.add-to-cart {
    margin-right: 5%;
}

.add-to-cart,
.buy-now {
    width: 19.9vw;
    padding: 1vw 2vw;
    font-size: 1rem;
    font-family: GmarketSansMedium;
    background-color: #f2f2f2;
    border: 2px solid #ccc;
    border-radius: 10px;
    cursor: pointer;
}

.add-to-cart:hover,
.buy-now:hover {
    background-color: #e6e6e6;
}

.quantity-section h3 {
    margin-right: 10px;
}

.quantity-section {
    display: flex;
    font-size: 1vw;
    margin-top: 1vw;
    margin-bottom: 6vw;
}

.quantity-section .quantity {
    width: 4vw;
    font-size: 2vw;
    max-width: 3.6vw;
    height: 4vw;
    max-height: 3.6vw;
    text-align: center;
    border-radius: 4px;
    border: 2px solid #eee;
}

.quantity-section .quantity_num {
    font-size: 1vw;
    width: 4vw;
    height: 2.8vw;
    text-align: center;
    margin-right: 4px;
    font-family: GmarketSansBold;
    border: 2px solid #eee;
    border-radius: 4px;
    margin-left: 4px;
}

.quantity-section input:focus {
    outline: none;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* --------------------------------------------------상세페이지 */
/* 상단탭 */
.teb {
    display: flex;
    height: 80px;
    width: 100%;
    font-size: 1.2rem;
    font-family: GmarketSansBold;
}

.teb #de {
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-right: 1px solid #e6e6e6;
    cursor: pointer;
    /* margin-left: 10vw; */
}

.teb #re {
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    cursor: pointer;
    /* margin-right: 10vw; */
}

#de.active,
#re.active {
    /* 활성화된 탭 아이템 스타일 */
    color: #cc8c00;
    background-color: #ffffff;
}

.image-container {
    overflow: hidden;
}

.section1 img {
    width: 80vw;
    max-width: 900px;
    margin: 30px auto 0;
    display: flex;
    margin-bottom: 60px;
}

/* top_btn */
.show-top-button {
    display: scroll;
    width: 40px;
    height: 32px;
    text-align: center;
    font-size: 12px;
    font-family: GmarketSansMedium;
    position: fixed;
    bottom: 60px;
    right: 4%;
    padding-top: 8px;
    cursor: pointer;
    border-radius: 20px;
    background-color: rgba(255, 201, 37, 0.5);
    z-index: 1;
}

.show-top-button img {
    scale: 80%;
    /* overflow: scroll; */
    position: relative;
    bottom: 8px;
    vertical-align: middle;
    cursor: pointer;
}

.op {
    position: relative;
    top: -140px;
    align-items: center;
    width: 100%;
    height: 120px;
    background: linear-gradient(to bottom,
            rgba(255, 255, 255, 0)10%,
            rgba(255, 255, 255, 0.5)25%,
            rgba(255, 255, 255, 0.6)35%,
            rgba(255, 255, 255, 0.7)40%,
            rgba(255, 255, 255, 0.8)50%,
            rgba(255, 255, 255, 1)75%,
            rgba(255, 255, 255, 1)100%);
}

.op .btn_open {
    position: relative;
    bottom: -80px;
    text-align: center;
    display: grid;
    margin: 30px auto;
    width: 300px;
    max-width: 900px;
    padding: 15px 30px 15px 30px;
    font-size: 1rem;
    font-family: GmarketSansMedium;
    border-radius: 50px;
    color: #333;
    background: #ffd745;
}

.op .btn_close {
    text-align: center;
    display: grid;
    margin: 60px auto 0px;
    width: 300px;
    max-width: 900px;
    padding: 15px 30px 15px 30px;
    font-size: 1rem;
    font-family: GmarketSansMedium;
    border-radius: 50px;
    color: #333;
    background: #ffd745;
}

/* ------------------------------------------------------------------리뷰 */
.quantity-section {
    display: flex;
    font-size: 1rem;
    margin-top: 1rem;
    margin-bottom: 2rem;
    align-items: center;
}

.quantity-section button {
    font-size: 1rem;
    padding: 0.3rem 0.6rem;
    margin: 0 0.3rem;
    border: none;
    background-color: #f2f2f2;
    border-radius: 5px;
    cursor: pointer;
}

.quantity-section input {
    width: 5rem;
    padding: 0.3rem 0.5rem;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.product-name {
    display: flex;
    align-items: center;
}

.product-name h2 {
    font-size: 2vw;
    margin-bottom: 10px;
}

.product-name button {
    margin-left: 10px;
    font-size: 1.5vw;
    background-color: transparent;
    border: none;
    cursor: pointer;
}

.heart-icon {
    font-size: 2em;
}

.like-heart-icon {
    font-size: 2em;
    color: red;
}

.product-info .header {
    display: flex;
    align-items: center;
}

.product-info .header h2 {
    font-size: 2vw;
    margin-bottom: 10px;
    margin-right: 10px;
}

.product-info .header i {
    font-size: 2em;
}

.header {
    display: flex;
    align-items: center;
}

.header h2 {
    font-size: 2vw;
    margin-bottom: 10px;
    margin-right: 10px;
}

.header button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.header button i {
    font-size: 2em;
    margin-right: 5px;
}

.header button span {
    font-size: 1em;
}</style>