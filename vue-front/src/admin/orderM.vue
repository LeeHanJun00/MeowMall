<template>
    <main class="mt-3">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"
            integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous" />
        <div class="container">
            <table class="table caption-top goodslist-table">
                <caption>
                    <div class="list-title">
                        <h2>주문 관리</h2>
                        <button class="btn btn-success" type="button" @click="getExcel()">엑셀 다운로드</button>
                    </div>
                    <div class="list-title2">
                        <div class="dropdown">
                            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1"
                                data-bs-toggle="dropdown" aria-expanded="false" style="border: none;"> {{ sortCase }}
                            </button>
                            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                <li><a class="dropdown-item" href="#" @click="sortList()">전체</a></li>
                                <li><a class="dropdown-item" href="#" @click="sortList(0)">결제완료</a></li>
                                <li><a class="dropdown-item" href="#" @click="sortList(1)">배송중</a></li>
                                <li><a class="dropdown-item" href="#" @click="sortList(2)">배송완료</a></li>
                                <li><a class="dropdown-item" href="#" @click="sortList(3)">구매확정</a></li>
                                <li><a class="dropdown-item" href="#" @click="sortList(9)">취소</a></li>
                            </ul>
                        </div>
                        <div class="btn-area">
                            <button class="btn btn-primary" @click="updateOrders">배송중 처리</button>
                            <button class="btn btn-primary" @click="updateCompleteOrders">배송완료 처리</button>
                        </div>
                    </div>
                </caption>
                <thead class="table-light">
                    <tr>
                        <th scope="col">결제일</th>
                        <th scope="col">주문번호</th>
                        <th scope="col">주문자</th>
                        <th scope="col">상품명</th>
                        <th scope="col">총 상품 금액</th>
                        <th scope="col">실 결제 금액</th>
                        <th scope="col">결제상태</th>
                        <th scope="col"> 전체선택 <input type="checkbox" v-model="allSelected" /> </th>
                        <th scope="col">취소여부</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(order, i) in pageOrderList" :key="i">
                        <td>{{ formatDateTime(order.ORDER_CREATE_DT) }}</td>
                        <td>{{ order.ORDER_TRADE_NO }} </td>
                        <td>{{ order.ORDER_NM }} </td>
                        <td>{{ order.ORDER_GOODS_NM }} </td>
                        <td>{{ formatPrice(order.ORDER_GOODS_PRICE * order.ORDER_GOODS_CNT) }} </td>
                        <td>{{ formatPrice(order.ORDER_TOTAL) }} </td>
                        <td>{{ statusType(order.ORDER_STATUS) }} </td>
                        <td style="text-align: center">
                            <input type="checkbox" :value="order.ORDER_TRADE_NO" v-model="selectedOrders" />
                        </td>
                        <td> </td>
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
            orderList: [],
            sortCase: "전체",
            selectedOrders: [], // 추가: 선택된 주문들을 저장하는 배열
            pageOrderList: [],
            pageNum: 0,
            pageCnt: 0,
            onePageCnt: 10,
        };
    },
    computed: {
        user() {
            return this.$store.state.user;
        },
        allSelected: {
            get() {
                return this.selectedOrders.length === this.orderList.length;
            },
            set(value) {
                if (value) {
                    this.selectedOrders = this.orderList.map(order => order.ORDER_TRADE_NO);
                } else {
                    this.selectedOrders = [];
                }
            }
        }
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
        this.getOrderList();
    },
    methods: {
        async getExcel() {
            // workbook(엑셀 파일 하나를 구성하는 여러 시트로 이루어진 단위) 생성
            const workbook = new ExcelJS.Workbook();
            // sheet 생성
            const worksheet = workbook.addWorksheet('orderList_Excel');

            const columns = Object.keys(this.orderList[0]);

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
            worksheet.insertRows(2, this.orderList);

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), '주문 목록.xlsx');

        },
        setPage(page) {
            this.pageOrderList = []
            this.pageNum = page - 1;
            this.sliceList()
        },
        sliceList() {
            const start = 0 + this.pageNum * this.onePageCnt
            this.pageOrderList = this.orderList.slice(start, start + this.onePageCnt);
        },
        sortList(sortNum) {
            if (sortNum == 0) {
                this.sortCase = "결제완료"
            } else if (sortNum == 1) {
                this.sortCase = "배송중"
            }
            else if (sortNum == 2) {
                this.sortCase = "배송완료"
            }
            else if (sortNum == 3) {
                this.sortCase = "구매확정"
            }
            else if (sortNum == 9) {
                this.sortCase = "취소"
            }
            else {
                this.sortCase = "전체"
            }

            // 선택된 주문들을 서버 요청에 포함시키지 않음
            this.getOrderList(sortNum)
                .then(() => {
                    this.$router.push({ path: '/admin/order' });
                })
        },
        async getOrderList(sortCaseNum) {
            try {
                const response = await axios.get(`http://localhost:3000/goods/admin/orderM/${sortCaseNum}`);
                this.orderList = response.data;
                this.pageCnt = parseInt(this.orderList.length / this.onePageCnt) + 1
                this.setPage(1)

            } catch (error) {
                console.error(error);
            }
        },
        statusType(socialType) {
            if (socialType === 0) {
                return '결제완료';
            } else if (socialType === 1) {
                return '배송중';
            } else if (socialType === 2) {
                return '배송완료';
            } else if (socialType === 3) {
                return '구매확정';
            } else if (socialType === 9) {
                return '취소';
            } else {
                return 'null';
            }
        },
        formatPrice(price) {
            const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return `${formattedPrice} 원`;
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
        async updateOrders() {
            if (this.selectedOrders.length === 0) {
                this.$swal("변경할 내용을 선택해주세요");
                return;
            }

            // order.ORDER_STATUS가 0인 경우에만 실행
            const selectedOrdersWithStatus0 = this.selectedOrders.filter(orderTradeNo => {
                const order = this.orderList.find(order => order.ORDER_TRADE_NO === orderTradeNo);
                return order && order.ORDER_STATUS === 0;
            });

            if (selectedOrdersWithStatus0.length !== this.selectedOrders.length) {
                this.$swal("결제완료 상태에만 변경 가능합니다");
                return;
            }

            try {
                this.$swal({
                    title: `배송중으로 등록 하시겠습니까?`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: '등록',
                    cancelButtonText: '취소',
                    reverseButtons: true,
                    timer: 5000,
                    timerProgressBar: true
                }).then(result => {
                    if (result.value) {
                        axios({
                            url: `http://localhost:3000/goods/admin/updateStatus`,
                            method: "POST",
                            data: {
                                status: 1,
                                orderTradeNos: selectedOrdersWithStatus0
                            },
                        }).then(res => {
                            if (res.data.message == 'complete') {
                                this.$swal("변경되었습니다.");
                                window.location.href = `http://localhost:8080/admin/order`;
                            }
                        }).catch(() => {
                            this.$swal("에러");
                        });
                    }
                });
            } catch (error) {
                console.error(error);
                // 오류 처리
            }
        },
        async updateCompleteOrders() {
            if (this.selectedOrders.length === 0) {
                this.$swal("변경할 내용을 선택해주세요");
                return;
            }

            // order.ORDER_STATUS가 1인 경우에만 실행
            const selectedOrdersWithStatus1 = this.selectedOrders.filter(orderTradeNo => {
                const order = this.orderList.find(order => order.ORDER_TRADE_NO === orderTradeNo);
                return order && order.ORDER_STATUS === 1;
            });

            if (selectedOrdersWithStatus1.length !== this.selectedOrders.length) {
                this.$swal("배송 중 상태에만 변경 가능합니다");
                return;
            }

            try {
                this.$swal({
                    title: `배송완료로 등록 하시겠습니까?`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: '등록',
                    cancelButtonText: '취소',
                    reverseButtons: true,
                    timer: 5000,
                    timerProgressBar: true
                }).then(result => {
                    if (result.value) {
                        axios({
                            url: `http://localhost:3000/goods/admin/updateStatus`,
                            method: "POST",
                            data: {
                                status: 2,
                                orderTradeNos: selectedOrdersWithStatus1
                            },
                        }).then(res => {
                            if (res.data.message == 'complete') {
                                this.$swal("변경되었습니다.");
                                window.location.href = `http://localhost:8080/admin/order`;
                            }
                        }).catch(() => {
                            this.$swal("에러");
                        });
                    }
                });
            } catch (error) {
                console.error(error);
            }
        },
    },
};
</script>

<style scoped>
@font-face {
    font-family: 'ONE-Mobile-Regular';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/ONE-Mobile-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

* {
    padding: 0;
    margin: 0;
}

.goodslist-table {
    font-family: ONE-Mobile-Regular;
}

th,
td {
    vertical-align: middle;
    font-size: 15.5px;
}

caption {
    padding: 8px 0px;
}

.list-title {
    margin: 13px 0px;
    display: flex;
    justify-content: space-between;
}

.list-title2 {
    vertical-align: middle;
    display: flex;
    justify-content: space-between;
}

.btn-area button {
    margin: 0px 3px;
}
</style>