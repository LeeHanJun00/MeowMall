<template>
    <main class="mt-3">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"
            integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">

        <div class="container goods_update">
            <h2 class="text-center" style="margin: 30px">제품 수정</h2>
            <div class="goods_content">

                <div v-if="goods.goods_img">
                    <img :height="200" :src="require(`../../../node-back/uploads/uploadGoods/` + `${goods.goods_img}`)"
                        alt="상품 이미지">
                </div>

                <div>
                    <div class="mb-3 row">
                        <label class="col-md-3 col-form-label">제품명 *</label>
                        <div class="col-md-9">
                            <input type="text" class="form-control" v-model="goods.goods_nm">
                        </div>
                    </div>
                    <div class="mb-3 row">
                        <label class="col-md-3 col-form-label">카테고리 *</label>
                        <div class="col-md-9 inputRadio">
                            <div class="form-radio">
                                <input class="form-radio-input" type="radio" v-model="goods.goods_category" value="1"
                                    id="cate1">
                                <label class="form-radio-label" for="cate1">사료</label>
                            </div>
                            <div class="form-radio ms-4">
                                <input class="form-radio-input" type="radio" v-model="goods.goods_category" value="2"
                                    id="cate2">
                                <label class="form-check-label" for="cate2">간식</label>
                            </div>
                            <div class="form-check ms-1">
                                <input class="form-radio-input" type="radio" v-model="goods.goods_category" value="3"
                                    id="cate3">
                                <label class="form-check-label" for="cate3">용품</label>
                            </div>
                            <div class="form-check ms-1">
                                <input class="form-radio-input" type="radio" v-model="goods.goods_category" value="4"
                                    id="cate4">
                                <label class="form-check-label" for="cate4">의류</label>
                            </div>
                        </div>
                    </div>

                    <div class="mb-3 row">
                        <label class="col-md-3 col-form-label">제품 가격 *</label>
                        <div class="col-md-9">
                            <div class="input-group mb-3">
                                <input type="number" class="form-control" v-model="goods.goods_price">
                                <span class="input-group-text">원</span>
                            </div>
                        </div>
                    </div>

                    <div class="mb-3 row">
                        <label class="col-md-3 col-form-label">해시태그 1 *</label>
                        <div class="col-md-9">
                            <input type="text" class="form-control" v-model="goods.goods_hashtag1">
                        </div>
                    </div>

                    <div class="mb-3 row">
                        <label class="col-md-3 col-form-label">해시태그 2</label>
                        <div class="col-md-9">
                            <input type="text" class="form-control" v-model="goods.goods_hashtag2">
                        </div>
                    </div>

                    <div class="mb-3 row">
                        <label class="col-md-3 col-form-label">해시태그 3</label>
                        <div class="col-md-9">
                            <input type="text" class="form-control" v-model="goods.goods_hashtag3">
                        </div>
                    </div>

                    <div class="mb-3 row">
                        <label class="col-md-3 col-form-label">재고 *</label>
                        <div class="col-md-9">
                            <div class="input-group mb-3">
                                <input type="number" class="form-control" v-model="goods.goods_cnt">
                                <span class="input-group-text">개</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
        <div class="mb-3 row">
            <div class="col-6 d-grid p-1">
                <button type="button" class="btn btn-lg btn-light" @click="goToList">취소하기</button>
            </div>
            <div class="col-6 d-grid p-1">
                <button type="button" class="btn btn-lg btn-danger" @click="goodsUpdate">저장하기</button>
            </div>
        </div>
    </main>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            goods: {},
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        },
    },
    created() {
        this.getGoodsInfo();
    },
    mounted() {
        if (this.user.user_no == '') {
            // 일단은 로그인 상태 체크 
            this.$swal("관리자 외 접근제한 페이지입니다.");
            this.$router.push({ path: '/login' });
        }
        else {
            axios({
                url: "http://localhost:3000/auth/admin_check",
                method: "POST",
                data: {
                    user_no: this.user.user_no,
                },
            })
                .then(res => {
                    if (res.data.message == 'user') {
                        this.$swal("관리자 외 접근제한 페이지입니다.");
                        this.$router.push({ path: '/' });
                    }
                })
                .catch(() => {
                    this.$swal("접속 오류");
                })
        }

    },
    methods: {
        getGoodsInfo() {
            // 굿즈 정보 가져오기
            const goodsno = this.$route.params.goodsno;

            axios({
                url: `http://localhost:3000/goods/admin/get_goods_info`,
                method: "POST",
                data: {
                    goodsno
                }
            })
                .then((res) => {
                    this.goods = res.data[0];
                    console.log(this.goods.goods_img);
                })
                .catch((err) => {
                    console.log(err);
                })
        },
        goodsUpdate() {
            if (!this.validationCheck()) {
                return;
            }
            else {
                axios({
                    url: "http://localhost:3000/goods/update_goods",
                    method: "POST",
                    data: {
                        goods_no: this.goods.goods_no,
                        goods_nm: this.goods.goods_nm,
                        goods_category: this.goods.goods_category,
                        goods_price: this.goods.goods_price,
                        goods_hashtag1: this.goods.goods_hashtag1,
                        goods_hashtag2: this.goods.goods_hashtag2,
                        goods_hashtag3: this.goods.goods_hashtag3,
                        goods_cnt: this.goods.goods_cnt,
                    },
                })
                    .then((res) => {
                        if (res.data.message == 'update_complete') {
                            this.$swal({
                                position: 'top',
                                icon: 'success',
                                title: '제품 수정 성공!',
                                showConfirmButton: false,
                                timer: 1000
                            })
                                .then(() => {
                                    window.location.href = "http://localhost:8080/admin/goodslist";
                                })
                        }
                        else {
                            this.$swal("제품 수정 실패");
                        }
                    })
                    .catch(() => {
                        this.$swal("오류 발생")
                    })
            }
        },
        validationCheck() {
            if (this.goods.goods_nm == "") {
                this.$swal("제품명은 필수 입력값입니다.");
                return false;
            }
            if (this.goods.goods_price == "" || this.goods.goods_price == 0) {
                this.$swal("제품 가격을 입력하세요.");
                return false;
            }
            if (this.goods.goods_hashtag1 == "") {
                this.$swal("태그를 한 개 이상 입력해주세요.");
                return false;
            }
            return true;
        },
        goToList() {
            this.$swal({
                title: '제품 수정을 취소하겠습니까?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '확인',
                cancelButtonText: '취소',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
            })
                .then((result) => {
                    if (result.isConfirmed) {
                        this.$router.push({ path: '/admin/goodslist' });
                        // 나중엔 제품 목록 리스트로 돌아가게 수정하기
                    }
                })
        },

    }
}
</script>

<style scoped>
@font-face {
    font-family: 'ONE-Mobile-Regular';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/ONE-Mobile-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

.goods_update {
    font-family: ONE-Mobile-Regular;
    
}

.inputRadio {
    display: flex;
}

.goods_content{
    /* display: flex; */
}

img {
    border-radius: 10px;
}
</style>