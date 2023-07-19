<template>
  <main class="mt-3">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"
      integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous" />
    <div class="container">
      <table class="table caption-top userlist-table">
        <caption>
          <div class="list-title">
            <h2>회원 관리</h2><br>
            <div class="list-title2">
              <div class="search_bar">
                <input v-model="keyword" class="form-control me-2" type="text" placeholder="email 검색"
                  @keyup.enter="getUserList()">
                <button class="btn btn-secondary" type="submit" @click="getUserList()"><i
                    class="fa fa-search"></i></button>
              </div>
              <div class="btn-area">
                <button class="btn btn-success" type="button" @click="getExcel()">엑셀 다운로드</button>
              </div>
            </div>

          </div>
        </caption>
        <thead class="table-light">
          <tr>
            <th scope="col">번호</th>
            <th scope="col">아이디</th>
            <th scope="col">닉네임</th>
            <th scope="col">이메일</th>
            <th scope="col">적립금</th>
            <th scope="col">가입타입</th>
            <th scope="col">가입일</th>
            <th scope="col">고양이정보</th>
            <th scope="col"> </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, i) in pageUserList" :key="i">
            <th scope="row">{{ pageNum * onePageCnt + i + 1 }}</th>
            <td>{{ formatLongID(user.user_id) }}</td>
            <td>{{ user.user_nick }}</td>
            <td>{{ user.user_email }}</td>
            <td>{{ user.user_point }}</td>
            <td>{{ getSocialType(user.user_social_tp) }}</td>
            <td>{{ formatDateTime(user.user_create_dt) }}</td>
            <td>
              <template v-if="user.user_cat === 0">
                -
              </template>
              <template v-else-if="user.user_cat === 1">
                <button type="button" class="btn btn-outline-primary" data-bs-toggle="modal"
                  data-bs-target="#exampleModal" @click="viewPetInfo(user)">
                  고양이 정보
                </button>
                <!-- 모달 -->
                <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel"
                  aria-hidden="true">
                  <div class="modal-dialog">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h1 class="modal-title fs-5" id="exampleModalLabel" style="color:#FFAF7D;">고양이 정보 확인</h1>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                        <div class="modal-body">
                          <div class="card mb-3" style="max-width: 540px;">
                            <div class="row g-0">
                              <div v-if="cat.cat_img" class="col-md-4">
                                <img :src="require(`../../../node-back/uploads/uploadCat/${cat.cat_img}`)" alt="..."
                                  style="max-width: 100%; margin: 20px 0px 20px 10px; border-radius:100%">
                              </div>
                              <div v-else class="col-md-4">
                                <img src="../assets/imgempty.png" class="img-fluid rounded-start" alt="..."
                                  style="max-width: 100%; margin: 20px 0px 20px 10px">
                              </div>
                              <div class="col-md-8">
                                <div class="card-body">
                                  <p class="card-text">고양이 이름: {{ cat.cat_name }}</p>
                                  <p class="card-text">고양이 종류: {{ cat.cat_breed }}</p>
                                  <p class="card-text">고양이 생일: {{ cat.cat_birth }}</p>
                                  <p class="card-text">고양이 성별: {{ getCatSex(cat.cat_sex) }}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
                <!-- 모달끝! -->
              </template>
            </td>
            <td><button type="button" class="btn btn-outline-danger" @click="confirmDeleteUser(user)">삭제</button></td>
          </tr>
        </tbody>
      </table>
      <nav aria-label="Page navigation example">
        <ul class="pagination justify-content-center">
          <ul v-for="i in pageCnt" :key="i" class="pagination justify-content-center">
            <a href="#top" style="text-decoration: none;">
              <li v-if="i != pageNum + 1" class="page-item page-link" @click="setPage(i)">{{ i }}</li>
              <li v-else class="page-item page-link active" @click="setPage(i)">{{ i }}</li>
            </a>
          </ul>
        </ul>
      </nav>
    </div>
  </main>
</template>

<script>
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default {
  data() {
    return {
      userList: [],
      cat: [],
      keyword: '',
      pageUserList: [],
      pageNum: 0,
      pageCnt: 0,
      onePageCnt: 10,
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    }
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
      }).then(res => {
        if (res.data.message == 'admin') {
          console.log(res.data.message);
        }
        else if (res.data.message == 'user') {
          this.$swal("관리자 외 접근제한 페이지입니다.");
          this.$router.push({ path: '/' });
        }
      }).catch(() => {
        this.$swal("접속 오류");
      })
    }
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getExcel() {
      // workbook(엑셀 파일 하나를 구성하는 여러 시트로 이루어진 단위) 생성
      const workbook = new ExcelJS.Workbook();
      // sheet 생성
      const worksheet = workbook.addWorksheet('userList_Excel');

      const columns = Object.keys(this.userList[0]);

      // worksheet에 컬럼에 대한 정보를 줌
      // 맨 첫 번째 줄에 컬럼들이 삽입됨
      worksheet.columns = columns.map((column) => ({
        header: column, // 컬럼 이름
        key: column, // data에서 컬럼의 값을 구분하기 위한 key
        width: 18,
        style: {
          font: {
            size: 12
          },
          alignment: {
            vertical: 'middle',
          }
        }
      }));

      // 두 번째 줄부터 데이터 행들을 한꺼번에 입력
      worksheet.insertRows(2, this.userList);

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), '회원 목록.xlsx');

    },
    setPage(page) {
      this.pageGoodsList = []
      this.pageNum = page - 1;
      this.sliceList()
    },
    sliceList() {
      const start = 0 + this.pageNum * this.onePageCnt
      this.pageUserList = this.userList.slice(start, start + this.onePageCnt);
    },
    async getUserList() {
      let keyword = 'none'

      if (this.keyword != '') {
        keyword = this.keyword;
      }
      try {
        const response = await axios.get(`http://localhost:3000/auth/admin/userlist/${keyword}`);
        this.userList = response.data;
        this.pageCnt = Math.ceil(this.userList.length / this.onePageCnt)
        this.setPage(1)

      } catch (error) {
        console.error(error);
      }
    },
    getSocialType(socialType) {
      if (socialType === 0) {
        return 'Local';
      } else if (socialType === 1) {
        return 'Kakao';
      } else if (socialType === 2) {
        return 'Naver';
      } else {
        return 'null';
      }
    },
    formatDateTime(dateTime) {
      const date = new Date(dateTime);
      const formattedDateTime = date.toLocaleString('ko-KR');
      return formattedDateTime;
    },
    confirmDeleteUser(user) {
      this.$swal({
        title: `${user.user_nick} 회원을 삭제하시겠습니까?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        reverseButtons: true
      }).then(result => {
        if (result.value) {
          this.deleteUser(user);
          this.$swal({
            position: 'top',
            icon: 'success',
            title: '삭제되었습니다',
            showConfirmButton: false,
            timer: 1500
          });
        }
      });
    },
    getCatSex(cat) {
      if (cat === 1) {
        return '남아';
      } else {
        return '여아';
      }
    },
    async deleteUser(user) {
      console.log('삭제 버튼 클릭 - 사용자 정보:', user);
      try {
        const response = await axios.delete(`http://localhost:3000/auth/admin/userlist/${user.user_no}`);
        console.log('사용자 삭제 성공:', response.data);
        this.userList = this.userList.filter(u => u.user_no !== user.user_no);
      } catch (error) {
        console.error('사용자 삭제 실패:', error);
      }
    },
    async viewPetInfo(user) {
      console.log(user);
      try {
        const response = await axios.get(`http://localhost:3000/auth/admin/getCatData/${user.user_no}`);
        console.log('고양이 데이터:', response.data);
        this.cat = response.data[0];
      } catch (error) {
        console.error('데이터 가져오기실패:', error);
      }
    },
    formatLongID(id){
      if (id.length > 10){
        let shortId = id.substr(0, 10);
        shortId += '...';
        return shortId;
      }
      return id;
    }
  }
};
</script>

<style scoped>
@font-face {
  font-family: 'ONE-Mobile-Regular';
  src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/ONE-Mobile-Regular.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

.userlist-table {
  font-family: ONE-Mobile-Regular;
}

th,
td {
  text-align: center;
  vertical-align: middle;
}
.list-title {
    margin: 13px 0px;
    display: flex;
    justify-content: space-between;
}

.list-title2 {
    vertical-align: middle;
    display: inline-flex;
    margin: auto 0px;
}

.btn-area button {
    margin: 0px 2px;
}

.search_bar {
  display: flex;
  margin: 0px 2px;
}
</style>