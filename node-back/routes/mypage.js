var express = require('express');
const router = express.Router();
var db = require('../db.js');
var sql = require('../sql.js');
const fs = require('fs');
const path = require("path");
const multer = require('multer');
const bcrypt = require('bcrypt');

// 이미지 업로더 
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'uploads/');
        },
        filename(req, file, cb) {
            cb(null, file.originalname);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

// 고양이 이미지 등록
router.post('/cat/upload_img', upload.single('img'), (request, response) => {

    setTimeout(() => {
        return response.status(200).json({
            message: 'success'
        })
    }, 1500);

})

// 고양이 이미지 제거
router.post('/cat/delete_img', (request, response) => {

    const pastname = request.body.pastname;
    try {
        if (pastname != "" && fs.existsSync(path.normalize(`${__dirname}../../uploads/${pastname}`))) {
            fs.unlinkSync(path.normalize(`${__dirname}../../uploads/${pastname}`))
        }
    }
    catch (error) {
        console.log(error)
    }
})

// 고양이 정보 등록
router.post('/catCreate', function (request, response) {
    const cat = request.body;

    // 고양이 등록 여부 확인
    db.query(sql.cat_check, [cat.user_no], function (error, results, fields) {
        if (results[0].user_cat === 0) {

            // 이미지를 제외한 고양이 정보 먼저 입력
            db.query(sql.cat_insert, [cat.user_no, cat.cat_name, cat.cat_breed, cat.cat_birth, cat.cat_sex], function (error, results, fields) {
                if (error) {
                    console.error(error)
                    return response.status(500).json({
                        message: 'DB_error'
                    });
                }

                // 유저의 캣 유무 정보 확인
                const user_no = cat.user_no;
                db.query(sql.usercattp_update, [user_no], function (error, results, fields) {
                    if (error) {
                        console.error(error)

                        return response.status(500).json({
                            message: 'DB_error'
                        });
                    }

                });

                // 고양이 번호 확인
                db.query(sql.get_cat_id, [user_no], function (error, results, fields) {
                    const filename = results[0].cat_id

                    const pastDir = `${__dirname}` + `../../uploads/` + cat.cat_img;
                    const newDir = `${__dirname}` + `../../uploads/uploadCat/`;

                    const extension = cat.cat_img.substring(cat.cat_img.lastIndexOf('.'))

                    fs.rename(pastDir, newDir + filename + extension, (err) => {
                        if (err) {
                            console.error(err)
                            return response.status(500).json();
                        }
                    });

                    db.query(sql.cat_img_insert, [filename + extension, user_no], function (error, results, fields) {
                        if (error) {
                            console.error(error)

                            return response.status(500).json();
                        }

                        return response.status(200).json({
                            message: 'cat_complete'
                        });
                    })
                })
            });
        } else {
            // user_cat이 1인 경우
            return response.status(200).json({
                message: 'usercat_error'
            });
        }

    });
});

// 고양이 정보 수정
router.post('/catUpdate', function (request, response, next) {
    const cat = request.body;

    // 이미지 변경
    db.query(sql.get_cat_id, [cat.user_no], function (error, results, fields) {
        const filename = results[0].cat_id

        const pastDir = `${__dirname}` + `../../uploads/` + cat.cat_img;
        const newDir = `${__dirname}` + `../../uploads/uploadCat/`;

        const extension = cat.cat_img.substring(cat.cat_img.lastIndexOf('.'))

        fs.rename(pastDir, newDir + filename + extension, (err) => { });

        db.query(sql.cat_update, [cat.cat_name, cat.cat_breed, cat.cat_birth, cat.cat_sex, filename + extension, cat.user_no], function (error, result, fields) {
            if (error) {
                console.error(error);
                return response.status(500).json({ error: 'cat_update_error' });
            }
            return response.status(200).json({ message: 'cat_update' });
        });
    })
});

// 고양이 정보
router.get('/getCatData/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.cat_info, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '고양이정보에러' });
        }
        response.json(results);
    });
});

// 마이페이지
router.get('/mypage/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.get_user_info, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원에러' });
        }
        response.json(results);
    });
});

// 마이페이지 배송 중 개수 (추가)
router.post('/deliveryCount/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.get_delivery_count, [user_no], function (error, results, fields) {
        if (error) {
            return response.status(500).json({ error: '에러' });
        }
        response.json(results[0].cnt);
    });
});

// 회원 탈퇴
router.delete('/mypage/user/:user_no', function (request, response, next) {
    const userNo = request.params.user_no;

    db.query(sql.deleteUser, [userNo], function (error, result, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원탈퇴에러' });
        }
        return response.status(200).json({ message: '회원탈퇴성공' });
    });
});

// 정보 수정
router.post('/mypageupdate', function (request, response, next) {
    const user = request.body;

    db.query(sql.mypage_update, [user.user_id, user.user_nick, user.user_email, user.user_mobile, user.user_zipcode, user.user_adr1, user.user_adr2, user.user_no], function (error, result, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: 'mypage_update_error' });
        }
        return response.status(200).json({ message: 'mypage_update' });
    });
});

// 정보
router.get('/getUserData', function (request, response, next) {
    const user_no = request.query.user_no;

    db.query(sql.user_info, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '정보에러' });
        }
        response.json(results);
    });
});

// 비밀번호 변경
router.post('/pass_process', function (request, response) {
    const pass = request.body;

    db.query(sql.get_password, [pass.user_no], function (error, results, fields) {
        if (results.length <= 0) {
            if (error) {
                return response.status(500).json({
                    message: 'DB_error'
                });
            }
        } else {
            const same = bcrypt.compareSync(pass.user_pw, results[0].user_pw);

            if (!same) {    // 비밀번호 체크
                return response.status(200).json({
                    message: 'pw_ck'
                });
            }
            const encryptedNewPW = bcrypt.hashSync(pass.user_npw, 10); // 새 비밀번호 암호화

            db.query(sql.pass_update, [encryptedNewPW, pass.user_no], function (error, results, fields) {
                if (error) {
                    return response.status(500).json({
                        message: 'DB_error'
                    });
                }

                return response.status(200).json({
                    message: 'pass_update'
                });
            });
        }
    });
});

// 찜 리스트
router.post('/likeList/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.like_list, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '에러' });
        }
        return response.status(200).json(results);
    });
});

// 내 리뷰 불러오기
router.get('/getMyReview/:user_no', function (request, response, next) {
    const user_no = request.params.user_no;

    db.query(sql.get_my_review, [user_no], function (error, results, fields) {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: '회원에러' });
        }
        response.json(results);
    });
})

module.exports = router;