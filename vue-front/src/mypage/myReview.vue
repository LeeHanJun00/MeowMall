<template>
    <main class="mt-3">
        <div class="container">
            <div class="myinfo">
                <div>
                    <h2>나의 리뷰</h2>
                </div>
                <div class="empty" v-if="reviewList.length == 0">
                    <p>아직 작성한 리뷰가 없습니다. <br>
                        주문 내역에서 리뷰를 작성해주세요. </p>
                </div>
                <div v-else class="cardList">
                    <div v-for="(review, index) in reviewList" :key="index">
                        <div class="card" @click="goToDetail(review.GOODS_NO)">
                            <div class="card-body">
                                <div class="card-header">
                                    <img v-if="!review.REVIEW_IMG" src="../assets/imgEmptyInput.png" alt="...">
                                    <img v-else
                                        :src="require(`../../../node-back/uploads/uploadReview/${review.REVIEW_IMG}`)"
                                        alt="..." :width="300">
                                </div>
                                <div class="card-body-header">
                                    <h1>{{ review.GOODS_NM }}</h1>
                                    <div class="star-rating">
                                        <div class="star" v-for="score in 5" :key="score">
                                            <span v-if="score < review.REVIEW_SCORE + 1"><i class="fa fa-star"></i></span>
                                            <span v-if="score >= review.REVIEW_SCORE + 1"><i
                                                    class="fa fa-star-o"></i></span>
                                        </div>
                                        <span style="padding-left: 5px;">({{ review.REVIEW_SCORE }})</span>
                                    </div>
                                </div>
                                <div class="card-body-description">
                                    <p>{{ review.REVIEW_CON }}</p>
                                </div>
                                <div class="card-body-footer">
                                    <i class="reg_date"> {{ formatDateTime(review.REVIEW_CREATE_DT) }} </i>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            loginUser: {},
            reviewList: [],
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        }
    },
    created() {
        this.getReviewList();
    },
    methods: {
        goToDetail(goods_no){
            window.location.href = `http://localhost:8080/goodsDetail/${goods_no}`;
        },
        async getReviewList() {
            try {
                const response = await axios.get(`http://localhost:3000/mypage/getMyReview/${this.user.user_no}`);
                this.reviewList = response.data;
                console.log(this.reviewList);
            } catch (error) {
                console.error(error);
            }
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
        },
    },
};
</script>
  
<style scoped>
* {
    margin: 0;
    padding: 0;
}

@font-face {
    font-family: 'GmarketSansMedium';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

.empty {
    max-width: 1200px;
    background-color: #f9f9f9;
    border-radius: 10px;
    height: 400px;
}

.empty p {
    color: black;
    font-size: 16px;
    text-align: center;
    padding-top: 180px;
}

.cardList {
    margin: -40px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.card {
    height: 500px;
    width: 300px;
    border-radius: 15px;
    display: inline-block;
    position: relative;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    overflow: hidden;
    scale: 0.8;
}

.card:hover {
    transform: scale(1.04);
    transition: all 0.06s linear;
}

.card-header {
    transition: 0.5s;
    width: 100%;
    height: 300px;
    border-radius: 15px 15px 0 0;
    background-size: 100% 280px;
    background-repeat: no-repeat;
}

.card-header img {
    height: 300px;
    object-fit: cover;
}

h1 {
    font-size: 22px;
    font-weight: bold;
}

.card-body-header {
    line-height: 25px;
    margin: 10px 20px 0px 20px;
}

.card-body-header h1 {
    font-size: 19px;
}

.star-rating {
    display: flex;
    padding-top: 9px;
    font-size: 20px;
    color: #FFAF7D;
}

.card-body-description {
    margin: 5px 20px;
    font-size: 14px;
    overflow: hidden;
    max-height: 70px;
}

.card-body-description p {
    font-size: 13px;
}

.card-body-footer {
    position: absolute;
    margin-top: 15px;
    margin-bottom: 6px;
    bottom: 0;
    left: 160px;
    width: 314px;
    font-size: 14px;
    color: #9FA5A8;
    padding: 0 15px;
}

.card img {
    max-width: 300px;
}

.container {
    margin: 40px 30px;
    font-family: GmarketSansMedium;
}

h2 {
    margin: 20px 0;
}

.myinfo {
    margin-top: 30px;
}
</style>
