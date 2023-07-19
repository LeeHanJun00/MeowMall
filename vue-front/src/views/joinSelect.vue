<template>
    <div class="contain">

        <div class="generalJoin">
            <span class="textGeneral">일반 회원가입</span>
            <p><a><img src="../assets/user_img.png" class="btn_general" @click="generalJoin"></a></p>
        </div>

        <div class="socialJoin">
            <span class="textSocial">간편 회원가입</span>
            <div class="socialImg">
                <p><a><img src="../assets/btn_kakao.png" class="btn_kakao" @click="kakaoLogin"></a></p>
                <!-- <p><a ><img src="../assets/btn_naver.png"   class="btn_naver" @click="naverlogin"></a></p> -->
                <div id="naverIdLogin" @click="naverlogin" img src="../assets/naver.png"></div>
            </div>
        </div>

    </div>
</template>

<style scoped>
@font-face {
    font-family: 'GmarketSansMedium';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

.contain {
    height: 500px;
    display: flex;
    /*div박스 나란히 */
    align-items: center;
    justify-content: center;
    font-family: 'GmarketSansMedium';
    position: relative;
    left: 5px;
}

.generalJoin {
    margin: 0 100px;


}

.btn_general {
    width: 140px;
    text-align: center;
}

.textGeneral {
    position: relative;
    bottom: 25px;
    font-size: 30px;
    right: -12px;
}

.textSocial {
    position: relative;
    bottom: 30px;
    font-size: 30px;

}

.socialJoin {
    margin: 0 90px;
    text-align: center;

}

.socialImg {
    display: flex;
    margin-right: 50px;

}

.btn_naver {
    width: 130px;
    text-align: center;
}

.btn_kakao {
    width: 130px;
    text-align: center;
}

p {
    margin: 10px 30px;

}

#naverIdLogin {
    left: 10px;
    top: 14px;
    position: relative;
}
</style>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            naverLogin: [],
        }
    },
    computed: {
        user() {
            return this.$store.state.user; // 로그인 확인
        }
    },

    mounted() {
        this.naverLogin = new window.naver.LoginWithNaverId({
            clientId: "qwyajCzxKvMqShbX_X8A",
            callbackUrl: "http://localhost:8080/login",
            isPopup: false,
            loginButton: {
                color: "green", type: 1, height: 115
            },
        });
        this.naverLogin.init();
    },

    methods: {
        generalJoin() {
            this.$router.push({ path: '/join' });
        },
        kakaoLogin() {
            window.Kakao.Auth.login({
                scope: "profile_nickname, account_email",
                success: this.getKakaoAccount,
            });
        },
        getKakaoAccount() {
            window.Kakao.API.request({
                url: "/v2/user/me",
                success: (res) => {
                    const kakao_account = res.kakao_account;
                    const email = kakao_account.email; //카카오 이메일
                    const nickname = kakao_account.profile.nickname;
                    // this.user_id = email

                    axios({
                        url: "http://localhost:3000/auth/kakaoJoinProcess",
                        method: "POST",
                        data: {
                            user_id: email,
                            user_nick: nickname
                        },
                    }).then(res => {
                        if (res.data.message == '저장완료') {
                            this.$swal({
                                position: 'top',
                                icon: 'success',
                                title: '회원가입 성공!',
                                showConfirmButton: false,
                                timer: 1000
                            })

                        }
                        else {
                            this.$swal({
                                position: 'top',
                                title: '이미 생성된 계정이 있습니다.',
                                showConfirmButton: false,
                                timer: 1000
                            })
                        }
                        this.$router.push("/login");

                    })
                        .catch(err => {
                            console.log(err);
                        })
                },
                fail: (error) => {
                    console.log(error);
                },
            });

        },
        naverlogin() {
            // 네이버 로그인 상태를 확인한 후 회원 정보 저장
            this.naverLogin.getLoginStatus((status) => {
                if (status) {

                    var email = this.naverLogin.user.getEmail();
                    if (email === undefined || email === null) {
                        alert("이메일은 필수임");
                        this.naverLogin.reprompt();
                        return;
                    }

                    // 회원 정보 저장
                    axios({
                        url: "http://localhost:3000/auth/naverlogin",
                        method: "POST",
                        data: {
                            naverlogin: this.naverLogin.user,
                        },
                    })
                        .then(res => {
                            if (res.data.message == '저장완료') {
                                this.$swal({
                                    position: 'top',
                                    icon: 'success',
                                    title: '회원가입 성공!',
                                    showConfirmButton: false,
                                    timer: 1000
                                });
                            } else {
                                this.$swal({
                                    position: 'top',
                                    title: '이미 생성된 계정이 있습니다.',
                                    showConfirmButton: false,
                                    timer: 1000
                                });
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        });
                } else {
                    console.log("callback 처리 실패");
                }
            });
        },
    }
}

</script>