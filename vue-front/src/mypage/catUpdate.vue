<template>
    <main>

        <div class="container">
            <h2>고양이 정보 수정</h2>

            <div class="img_form">
                <div class="img_box">
                    <label for="input-file" v-if="!cat.cat_img">
                        <img class="img_preview" src="../assets/imgempty.png" alt="...">
                    </label>
                    <label for="input-file" v-else-if="img_change == 0">
                        <img class="img_preview" :src="require(`../../../node-back/uploads/uploadCat/${cat.cat_img}`)" alt="...">
                    </label>
                    <label for="input-file" v-else-if="img_change == 1">
                        <img class="img_preview" :src="require(`../../../node-back/uploads/${cat.cat_img}`)" alt="...">
                    </label>
                </div>

                <input type="file" id="input-file" class="form-control" accept="image/png,image/jpeg"
                    @change="uploadFile($event.target.files)" style="display: none;">
            </div>

            <div class="form">
                <label class="te">고양이 이름</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" v-model="cat.cat_name" />
                </div>
            </div>

            <div class="form">
                <label class="te">고양이 종류</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" v-model="cat.cat_breed" />
                </div>
            </div>

            <div class="form">
                <label class="te">생년월일</label>
                <div class="date">
                    <input type="date" class="form-control" v-model="cat.cat_birth" />
                </div>
            </div>

            <fieldset class="form2">
                <legend class="te">성별</legend>
                <div class="formcheck">
                    <div class="check">
                        <input class="form-check-input" type="radio" name="gridRadios" id="gridRadios1"
                            v-model="cat.cat_sex" value="1" />
                        <label class="form-check-label" for="gridRadios1">수컷</label>
                    </div>

                    <div class="check">
                        <input class="form-check-input" type="radio" name="gridRadios" id="gridRadios2"
                            v-model="cat.cat_sex" value="2" />
                        <label class="form-check-label" for="gridRadios2">암컷</label>
                    </div>
                </div>
            </fieldset>

            <div class="form">
                <button type="submit" class="btn btn-primary" @click="onSubmitForm">수정하기</button>
            </div>
        </div>
    </main>
</template>
  
<script>
import axios from 'axios';

export default {
    data() {
        return {
            cat: {},
            img_change: 0,
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        }
    },
    mounted() {
        if (this.user.user_no === '') {
            this.$swal('로그인해주세요');
            this.$router.push({ path: '/login' });
        } else {
            axios.get(`http://localhost:3000/mypage/getCatData/${this.user.user_no}`)
                .then((res) => {
                    if (res.data.length > 0) {
                        this.cat = res.data[0];
                        console.log(this.cat)
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    },
    created() {
        this.viewPetInfo();
    },
    methods: {
        async viewPetInfo() {
            try {
                const response = await axios.get(`http://localhost:3000/mypage/getCatData/${this.user.user_no}`);
                this.cat = response.data[0];
            } catch (error) {
                console.error('데이터 가져오기실패:', error);
            }
        },
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
                            this.img_change = 1;
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
                this.$swal("모든 항목을 입력해주세요");
            } else {
                axios
                    .post('http://localhost:3000/mypage/catUpdate', {
                        user_no: this.user.user_no,
                        cat_name: this.cat.cat_name,
                        cat_breed: this.cat.cat_breed,
                        cat_birth: this.cat.cat_birth,
                        cat_sex: this.cat.cat_sex,
                        cat_img: this.cat.cat_img
                    })
                    .then((res) => {
                        if (res.data.message === 'cat_update') {
                            this.$swal("수정이 완료되었습니다");
                            this.$router.push({ path: '/mypage' });
                        } else {
                            this.$swal("수정에 실패했습니다.");
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        this.$swal("수정에 실패했습니다.");
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

ul,
li {
    list-style: none;
}

a {
    text-decoration: none;
}

@font-face {
    font-family: 'GmarketSansMedium';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

.img_form {
    max-width: 560px;
}
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

.form .date input {
    width: 380px;
}

.form .date [type="date"] {
    padding-right: 20px;
}
.form2 {
    display: flex;
    border-style: none;
}

.formcheck {
    position: relative;
    display: flex;
    top: -20px;
    left: 140px;
}

.formcheck .check {
    margin-right: 60px;
}

.formcheck .check .form-check-input {
    vertical-align: middle;
    height: 20px;
    width: 20px;
    margin-right: 10px;
}

.formcheck .check .form-check-input:focus {
    outline: none;
}

/* .form2 .formcheck .check .form-check-input[type="radio"], 
.form2 .formcheck .check .form-check-input[type="radio"]:checked {
    color: #ffbc2b;
    border: 1px solid red;
} */

.form button {
    width: 564px;
    height: 50px;
    margin: 60px 0;
    font-family: GmarketSansMedium;
    font-size: 18px;
    color: #cc8c00;
    border: 2px solid #ffbc2b;
    background-color: #fff2c9;
    border-radius: 10px;
    cursor: pointer;
}

.form button:hover {
    color: #fff2c9;
    border: 2px solid #ffbc2b;
    background-color: #ffbc2b;
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

    .form button {
        width: 424px;
        height: 50px;
        margin: 60px 0;
        font-family: GmarketSansMedium;
        font-size: 18px;
        color: #cc8c00;
        border: 2px solid #ffbc2b;
        background-color: #fff2c9;
        border-radius: 10px;
        cursor: pointer;
    }

}
</style>