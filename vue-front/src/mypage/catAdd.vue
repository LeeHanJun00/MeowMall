<template>
    <main>
        <div class="container">


            <h2>고양이 등록</h2>
            <div class="img_form">
                <div class="img_box">
                    <label for="input-file" v-if="!cat.cat_img">
                        <img class="img_preview" src="../assets/imgempty.png" alt="...">
                    </label>
                    <label for="input-file" v-if="cat.cat_img">
                        <img class="img_preview" :src="require(`../../../node-back/uploads/${cat.cat_img}`)" alt="...">
                    </label>
                </div>

                <input type="file" id="input-file" class="form-control" accept="image/png,image/jpeg"
                    @change="uploadFile($event.target.files)" style="display: none;">
            </div>

            <div class="form">
                <label class="te">이름</label>
                <div class="col-md-9">
                    <input type="text" class="form-control" v-model="cat.cat_name">
                </div>
            </div>

            <div class="form">
                <label class="te">품종</label>
                <div class="col-md-9">
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" v-model="cat.cat_breed">
                    </div>
                </div>
            </div>

            <div class="form">
                <label class="te">생년월일</label>
                <p><input type="date" v-model="cat.cat_birth"></p>
            </div>

            <fieldset class="form2">
                <legend class="te">성별</legend>
                <div id="formcheck" class="cat.cat_sex">
                    <div class="check">
                        <input class="form-check-input" type="radio" v-model="cat.cat_sex" value="1" id="man" />
                        <label class="form-check-label" for="man">수컷</label>
                    </div>

                    <div class="check">
                        <input class="form-check-input" type="radio" v-model="cat.cat_sex" value="2" id="woman" />
                        <label class="form-check-label" for="woman">암컷</label>
                    </div>
                </div>
            </fieldset>


            <div class="form3">
                <div class="">
                    <button type="submit" class="btn_confirm" @click="onSubmitForm">등록</button>
                </div>
                <div class="">
                    <button type="button" class="btn_Cancel" @click="goToList">취소</button>
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
            cat: {
                cat_name: "",
                cat_breed: "",
                cat_birth: "",
                cat_sex: "",
                cat_img: "",
            },
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        }
    }, mounted() {
        if (this.user.user_no == '') {
            alert('로그인해주세요');
            this.$router.push({ path: '/login' });
        }
    },
    methods: {
        async uploadFile(file) {

            let name = "";
            let pastname = this.cat.cat_img;

            if (file) {
                name = file[0].name;
            }
            else {
                return;     // 파일 미선택 시 반환
            }

            const formData = new FormData();
            formData.append('img', file[0]);

            try {
                axios({
                    url: `http://localhost:3000/mypage/cat/upload_img`,
                    method: 'POST',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    data: formData
                })
                    .then((res) => {
                        if (res.data.message == 'success') {
                            this.cat.cat_img = name;
                            axios({
                                url: `http://localhost:3000/mypage/cat/delete_img`,
                                method: 'POST',
                                data: {
                                    pastname: pastname
                                }
                            })
                        }
                        else {
                            this.$swal("DB 에러");
                        }
                    })
                    .catch(e => {
                        console.log(e);
                    })
                return true;

            } catch (err) {
                console.log(err);
                return false;
            }

        },

        onSubmitForm() {
            if (this.cat.cat_name === "" || this.cat.cat_breed === "" || this.cat.cat_birth === "" || this.cat.cat_sex === "") {
                this.$swal("모든 항목을 입력하세요.");
            } else {
                axios({
                    url: "http://localhost:3000/mypage/catCreate",
                    method: "POST",
                    data: {
                        user_no: this.user.user_no,
                        cat_name: this.cat.cat_name,
                        cat_breed: this.cat.cat_breed,
                        cat_birth: this.cat.cat_birth,
                        cat_sex: this.cat.cat_sex,
                        cat_img: this.cat.cat_img
                    },
                }).then(res => {
                    if (res.data.message == 'usercat_error') {
                        this.$swal({
                            title: '등록된 고양이가 있습니다. 수정하시겠습니까?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: '수정',
                            cancelButtonText: '취소',
                            reverseButtons: true
                        }).then(result => {
                            if (result.value) {
                                this.$router.push({ path: '/catUpdate' });
                            } else {
                                this.$router.push({ path: '/' });
                            }
                        });
                    } else if (res.data.message == 'cat_complete') {
                        this.$swal("등록 되었습니다.");// 홈 화면으로 이동
                        this.$router.push({ path: '/' });
                    }
                }).catch(err => {
                    console.log(err);
                });
            }
        }
    }
}
</script>
  
<style scoped>
* {
    margin: 0;
    padding: 0;
}

ul, li { list-style: none; }

a { text-decoration: none; }

@font-face {
    font-family: 'GmarketSansMedium';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

.img_form { max-width: 560px; }

.img_box {
    margin-bottom: 40px;
    width: 120px;
    height: 120px;
    border-radius: 70%;
    overflow: hidden;
    background-color: #e8e8e8;
}

.img_preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    align-items: center;
}

/* input {} */
input:focus {
    outline: 2px solid #ffc905;
}

.container {
    margin: 40px 30px;
    font-family: GmarketSansMedium;
}

h2 {
    margin: 20px 0 40px 0;
}

/* form */
.form {
    margin-bottom: 20px;
    display: flex;
}

.form .te {
    width: 120px;
    vertical-align: middle;
    padding: 10px 0;
    margin-right: 20px;
}

.form input {
    display: flex;
    align-items: center;
    width: 400px;
    height: 40px;
    font-size: 1rem;
    font-family: GmarketSansMedium;
    padding-left: 20px;
    color: rgb(137, 137, 137);
    border: 2px solid rgb(221, 221, 221);
    border-radius: 10px;
}

.form .date {
    display: inline-block;
    padding: 10px 0;
}

.form p input {
    width: 380px;
}

.form p [type="date"] {
    padding-right: 20px;
}
.form2 {
    display: flex;
    border-style: none;
}

.form2 #formcheck {
    position: relative;
    display: flex;
    top: -20px;
    left: 140px;
}

#formcheck .check {
    margin-right: 60px;
}

#formcheck .check .form-check-input {
    vertical-align: middle;
    height: 20px;
    width: 20px;
    margin-right: 10px;
}

#formcheck .check .form-check-input:focus {
    outline: none;
}

.form3 button {
    float: left;
    /* display: flex; */
    width: 274px;
    height: 50px;
    vertical-align: middle;
    font-family: GmarketSansMedium;
    font-size: 18px;
    color: #cc8c00;
    border: 2px solid #ffbc2b;
    background-color: #fff2c9;
    border-radius: 10px;
    cursor: pointer;
}

.form3 .btn_confirm{ 
    margin: 80px 20px 30px 0;
}
.form3 .btn_confirm:hover {
    color: #fff2c9;
    border: 2px solid #ffbc2b;
    background-color: #ffbc2b;
    border-radius: 10px;
    cursor: pointer;
}
.form3 .btn_Cancel{
    color: #888;
    margin: 80px 0 30px 0;
    background-color: #f2f2f2;
    border: 2px solid rgb(221, 221, 221);
}
.form3 .btn_Cancel:hover {
    color: #888;
    background-color: #e6e6e6;
    border: 2px solid rgb(221, 221, 221);
    border-radius: 10px;
    cursor: pointer;
}


@media screen and (max-width: 768px) {

    .img_form {
    width: 50%;
    min-width: 420px;
    /* border: 1px solid red; */
    }
    .img_box {
        margin: 0 auto;
        margin-bottom: 30px;
        width: 120px;
        height: 120px;
        border-radius: 70%;
        overflow: hidden;
        background-color: #e8e8e8;
        /* border: 1px solid red; */
    }

    .form {
        margin-bottom: 20px;
        display: grid;
    }

    .form2 {
        display: grid;
    }

    .formcheck .check {
        margin-right: 60px;
    }

    .form3 button {
        width: 420px;
        height: 50px;
        font-family: GmarketSansMedium;
        font-size: 18px;
        color: #cc8c00;
        border: 2px solid #ffbc2b;
        background-color: #fff2c9;
        border-radius: 10px;
        cursor: pointer;
    }

.form3 .btn_Cancel{
    color: #888;
    margin: 0px;
    background-color: #f2f2f2;
    border: 2px solid rgb(221, 221, 221);
}

}
</style>