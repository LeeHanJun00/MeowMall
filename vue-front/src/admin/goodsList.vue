<template>
    <main class="mt-3">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"
            integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous" />
        <div class="container">
            <table class="table caption-top goodslist-table">
                <caption>
                    <div class="list-title">
                        <h2>상품 관리</h2>
                        <div class="search_bar">
                            <input v-model="keyword" class="form-control me-2" type="text" placeholder="검색"
                                @keyup.enter="getGoodsList(sortCase)">
                            <button class="btn btn-secondary" type="submit" @click="getGoodsList(sortCase)"><i
                                    class="fa fa-search"></i></button>
                        </div>
                        <div class="list-title2">
                            <div class="dropdown">
                                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1"
                                    data-bs-toggle="dropdown" aria-expanded="false" style="border: none;"> {{ sortCase }}
                                </button>
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                    <li><a class="dropdown-item" href="#" @click="sortList(0)">오래된 순</a></li>
                                    <li><a class="dropdown-item" href="#" @click="sortList(1)">최근 순</a></li>
                                    <li><a class="dropdown-item" href="#" @click="sortList(2)">가격 낮은 순</a></li>
                                    <li><a class="dropdown-item" href="#" @click="sortList(3)">가격 높은 순</a></li>
                                    <li><a class="dropdown-item" href="#" @click="sortList(4)">이름 순</a></li>
                                </ul>
                            </div>
                            <div class="btn-area">
                                <button class="btn btn-primary" type="button" @click="goToAddGoods()">상품 등록</button>
                                <button class="btn btn-success" type="button" @click="getExcel()">엑셀 다운로드</button>
                            </div>
                        </div>
                    </div>
                </caption>
                <thead class="table-light">
                    <tr>
                        <th scope="col">번호</th>
                        <th scope="col">이미지</th>
                        <th scope="col">상품명</th>
                        <th scope="col">카테고리</th>
                        <th scope="col">가격</th>
                        <th scope="col">해시태그</th>
                        <th scope="col">재고</th>
                        <th scope="col"> </th>
                        <th scope="col"> </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(goods, i) in pageGoodsList" :key="i">
                        <th scope="row">{{ pageNum * 15 + i + 1 }}</th>
                        <td class="goToDetail" @click="goToDetail(goods.goods_no)"><img :height="50"
                                :src="require(`../../../node-back/uploads/uploadGoods/${goods.goods_img}`)" alt="상품 이미지">
                        </td>
                        <td class="goToDetail" @click="goToDetail(goods.goods_no)">{{ goods.goods_nm }}</td>
                        <td>{{ categoryType(goods.goods_category) }}</td>
                        <td>{{ formatPrice(goods.goods_price) }}</td>
                        <td v-if="!goods.goods_hashtag2">
                            {{ goods.goods_hashtag1 }}
                        </td>
                        <td v-else-if="!goods.goods_hashtag3">
                            {{ goods.goods_hashtag1 }}<br>
                            {{ goods.goods_hashtag2 }}</td>
                        <td v-else>
                            {{ goods.goods_hashtag1 }}<br>
                            {{ goods.goods_hashtag2 }}<br>
                            {{ goods.goods_hashtag3 }}
                        </td>
                        <td>{{ goods.goods_cnt }}</td>
                        <td><button class="btn btn-light" @click="goToUpdateGoods(goods.goods_no)">수정</button></td>
                        <td><button class="btn btn-outline-danger" @click="deleteGoods(goods.goods_no)">삭제</button></td>
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
            goodsList: [],
            sortCase: "오래된 순",
            keyword: '',
            pageGoodsList: [],  // 한 페이지에 보여줄 굿즈 리스트를 잘라 담을 새 리스트
            pageNum: 0,
            pageCnt: 0,
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        },
    },
    mounted() {
        if (this.user.user_no == '') {
            // 일단은 로그인 상태 체크 
            this.$swal("관리자 외 접근제한 페이지입니다.");
            this.$router.push({ path: '/login' });
        } else {
            axios({
                url: "http://localhost:3000/auth/admin_check",
                method: "POST",
                data: {
                    user_no: this.user.user_no,
                },
            }).then(res => {
                if (res.data.message == 'user') {
                    this.$swal("관리자 외 접근제한 페이지입니다.");
                    this.$router.push({ path: '/' });
                }
            }).catch(() => {
                this.$swal("접속 오류");
            });
        }
    },
    created() {
        this.getGoodsList(0);
    },
    methods: {
        async getExcel() {
            // workbook(엑셀 파일 하나를 구성하는 여러 시트로 이루어진 단위) 생성
            const workbook = new ExcelJS.Workbook();
            // sheet 생성
            const worksheet = workbook.addWorksheet('goodsList_Excel');

            const columns = Object.keys(this.goodsList[0]);

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
            worksheet.insertRows(2, this.goodsList);

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), '상품 목록.xlsx');

        },
        setPage(page) {
            this.pageGoodsList = []
            this.pageNum = page - 1;
            this.sliceList()
        },
        sliceList() {
            const start = 0 + this.pageNum * 15
            this.pageGoodsList = this.goodsList.slice(start, start + 15);
        },
        sortList(sortNum) {
            if (sortNum == 0) {
                this.sortCase = "오래된 순"
            } else if (sortNum == 1) {
                this.sortCase = "최근 순"
            }
            else if (sortNum == 2) {
                this.sortCase = "가격 낮은 순"
            }
            else if (sortNum == 3) {
                this.sortCase = "가격 높은 순"
            }
            else {
                this.sortCase = "이름 순"
            }
            this.getGoodsList(sortNum)
                .then(() => {
                    this.$router.push({ path: '/admin/goodsList' });
                })
        },
        async getGoodsList(sortCaseNum) {
            let keyword = this.keyword;
            try {
                if (this.keyword == '') {
                    keyword = "none"
                }
                const response = await axios.get(`http://localhost:3000/goods/admin/goodslist/${sortCaseNum}/${keyword}`);
                this.goodsList = response.data;
                this.pageCnt = Math.ceil(this.goodsList.length / 15)
                this.setPage(1)
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
        formatPrice(price) {
            const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return `${formattedPrice} 원`;
        },
        goToAddGoods() {
            this.$swal({
                title: `상품을 등록 하시겠습니까?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '등록',
                cancelButtonText: '취소',
                reverseButtons: true
            }).then(result => {
                if (result.value) {
                    this.$router.push({ path: '/admin/goodsAdd' });
                }
            });
        },
        goToUpdateGoods(goodsno) {
            window.location.href = `http://localhost:8080/admin/goodsUpdate/${goodsno}`;
            // this.$router.push({ path: `/admin/goodsUpdate/${goodsno}` });
            // 아래 걸로 했더니 스크롤 초기화가 안 됨
        },
        goToDetail(goodsno) {
            window.location.href = `http://localhost:8080/goodsDetail/${goodsno}`;
        },
        deleteGoods(goodsno) {
            this.$swal({
                title: `정말로 상품을 삭제하시겠습니까?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '삭제',
                cancelButtonText: '취소',
                reverseButtons: true,
            }).then(result => {
                if (result.value) {
                    axios({
                        url: `http://localhost:3000/goods/admin/delete_goods`,
                        method: "POST",
                        data: {
                            goods_no: goodsno
                        },
                    }).then(res => {
                        if (res.data.message == 'delete_complete') {
                            this.$swal("상품이 삭제되었습니다.");
                            window.location.href = `http://localhost:8080/admin/goodslist`;
                        }
                    }).catch(() => {
                        this.$swal("오류 발생");
                    });
                }
            });
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

.goodslist-table {
    font-family: ONE-Mobile-Regular;
}

th,
td {
    vertical-align: middle;
    font-size: 15.5px;
}

img {
    border-radius: 10%;
    background-color: #eeeeee;
}

img:hover {
    transform: scale(1.12);
    transition: all 0.07s linear;
    background-color: #FFAF7D;
}

img:not(:hover) {
    transform: scale(1.0);
    transition: all 0.07s linear;
}

.goToDetail {
    cursor: pointer;
}


.goToDetail:hover {
    color: #FFAF7D;
    font-weight: bold;
    font-size: 16.5px;
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

.dropdown {
    margin: 0px 2px;
}

.btn-area button {
    margin: 0px 2px;
}

.search_bar {
    margin: auto;
    display: flex;
}
</style>