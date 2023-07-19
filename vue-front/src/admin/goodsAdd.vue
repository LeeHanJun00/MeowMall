<template>
    <main class="mt-3">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">

        <div class="container goods_add">
            <h2 class="text-center"  style="margin: 30px">제품 등록</h2>

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
                        <input class="form-radio-input" type="radio" v-model="cate_check" value="사료" id="cate1" checked>
                        <label class="form-radio-label" for="cate1">사료</label>
                    </div>
                    <div class="form-radio ms-4">
                        <input class="form-radio-input" type="radio" v-model="cate_check" value="간식" id="cate2">
                        <label class="form-check-label" for="cate2">간식</label>
                    </div>
                    <div class="form-check ms-1">
                        <input class="form-radio-input" type="radio" v-model="cate_check" value="용품" id="cate3">
                        <label class="form-check-label" for="cate3">용품</label>
                    </div>
                    <div class="form-check ms-1">
                        <input class="form-radio-input" type="radio" v-model="cate_check" value="의류" id="cate4">
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

            <div class="mb-3 row">
                <label class="col-md-3 col-form-label">메인 이미지 * </label>
                <div class="col-md-9">
                    <div class="row">
                    </div>
                    <input type="file" class="form-control" accept="image/png,image/jpeg" @change="uploadFile($event.target.files, 0)"> <!-- type 0 메인-->
                    <div class="alert alert-secondary" role="alert">
                        <ul>
                            <li>이미지 사이즈 : 700*700</li>
                            <li>파일 사이즈 : 1M 이하</li>
                            <li>파일 확장자 : png, jpg만 가능</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="mb-3 row">
                <label class="col-md-3 col-form-label">설명 이미지 *</label>
                <div class="col-md-9">
                    <input type="file" class="form-control" accept="image/png,image/jpeg" @change="uploadFile($event.target.files, 1)"> <!-- type 1 상세-->
                    <div class="alert alert-secondary" role="alert">
                        <ul>
                            <li>파일 사이즈 : 5M 이하</li>
                            <li>파일 확장자 : png, jpg만 가능</li>
                        </ul>
                    </div>
                </div>
            </div>

        </div>
        <div class="mb-3 row">
            <div class="col-6 d-grid p-1">
                <button type="button" class="btn btn-lg btn-light" @click="goToList">취소하기</button>
            </div>
            <div class="col-6 d-grid p-1">
                <button type="button" class="btn btn-lg btn-danger" @click="goodsInsert">저장하기</button>
            </div>
        </div> 
    </main>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            goods:{
                goods_nm: "",
                goods_category: 1,  // 1: 사료 2: 간식 3: 용품
                goods_price: 0,
                goods_hashtag1: "",
                goods_hashtag2: "",
                goods_hashtag3: "",
                goods_cnt: 100,

                // 이미지 파일명만 저장할 변수 
                goods_img: "",
                goods_content: "",
            },
            cate_check: "",
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        }
    },
    mounted() {
        if(this.user.user_no == ''){
            // 일단은 로그인 상태 체크 
            this.$swal("관리자 외 접근제한 페이지입니다.");
            this.$router.push({path:'/login'});
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
                    if (res.data.message=='admin'){
                        console.log(res.data.message);
                    }
                    else if (res.data.message=='user'){
                        this.$swal("관리자 외 접근제한 페이지입니다.");
                        this.$router.push({path:'/'});
                    }
            })
                .catch(() => {
                    this.$swal("접속 오류");
                })    
        }
    },
    methods: {
        async uploadFile(file, type){

            let name = "";
            if (file) {
                name = file[0].name;
            }
            else {
                return;     // 파일 미선택 시 반환
            }

            const formData = new FormData();
            
            formData.append('img', file[0]);

            for (let key of formData.keys()) {
                console.log(key, ":", formData.get(key));
            }

            try {
                axios({
                    url: `http://localhost:3000/goods/upload_img`,
                    method: 'POST',
                    headers: {'Content-Type': 'multipart/form-data'},
                    data: formData
                })
                    .then ((res) => {
                        if (res.data.message == 'success'){
                            if (type == 0){
                                this.goods.goods_img = name;
                            }
                            else if (type == 1){
                                this.goods.goods_content = name;
                            }
                        }
                        else {
                            this.$swal("DB 에러");
                        }
                    })
                    .catch(e => {
                        console.log(e);
                    })
                return true;

            } catch(err){
                console.log(err);
                return false;
            }

        },
        goodsInsert(){
            if (!this.validationCheck()) {
                return;
            }
            else {
                axios({
                    url: "http://localhost:3000/goods/add_goods",
                    method: "POST", 
                    data: { 
                        goods_nm: this.goods.goods_nm,
                        goods_category: this.goods.goods_category,
                        goods_price: this.goods.goods_price,
                        goods_hashtag1: this.goods.goods_hashtag1,
                        goods_hashtag2: this.goods.goods_hashtag2,
                        goods_hashtag3: this.goods.goods_hashtag3,
                        goods_cnt: this.goods.goods_cnt,

                        goods_img: this.goods.goods_img,
                        goods_content: this.goods.goods_content,
                    },
                })
                    .then((res) => {
                        if(res.data.message=='add_complete'){
                            this.$swal({
                                position: 'top',
                                icon: 'success',
                                title: '제품 등록 성공!',
                                showConfirmButton: false,
                                timer: 1000
                            })
                            .then(() => {
                                window.location.href = "http://localhost:8080/admin/goodslist";
                            })
                        } else if (res.data.message == 'already_exist_goods'){
                            this.$swal("이미 등록된 제품입니다.");
                        }
                        else if (res.data.message == '파일 변경 실패'){
                            this.$swal("파일 변경 실패");
                        }
                        else {
                            this.$swal("제품 등록 실패");
                        }
                })
                    .catch(() => {
                        this.$swal("오류 발생")
                    })
            }
        },
        validationCheck() {
            if (this.goods.goods_nm == ""){
                this.$swal("제품명은 필수 입력값입니다.");
                return false;
            }
            if (this.cate_check == '간식'){
                this.goods.goods_category = 2;
            }
            else if (this.cate_check == '용품'){
                this.goods.goods_category = 3;
            }
            else if (this.cate_check == '의류'){
                this.goods.goods_category = 4;
            }
            if (this.goods.goods_price == "" || this.goods.goods_price == 0){
                this.$swal("제품 가격을 입력하세요.");
                return false;
            }
            if (this.goods.goods_hashtag1 == ""){
                this.$swal("태그를 한 개 이상 입력해주세요.");
                return false;
            }
            if (this.goods.goods_img == ""){
                this.$swal("제품 메인 이미지를 등록해주세요.");
                return false;
            }
            if (this.goods.goods_content == ""){
                this.$swal("제품 상세 이미지를 등록해주세요.");
                return false;
            }
            return true;
        },
        goToList(){
            this.$swal({
                title: '제품 등록을 취소하겠습니까?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '확인',
                cancelButtonText: '취소',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                })
                    .then((result) => {
                        if (result.isConfirmed) {
                            this.$router.push({path:'/admin/goodslist'});
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
.goods_add {
    font-family: ONE-Mobile-Regular;
}
.inputCheck {
    display: flex;
}

.inputRadio {
    display: flex;
}

</style>