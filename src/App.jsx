import { useState } from 'react';

import axios from 'axios';
import './assets/style.css';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  //登入狀態管理(控制顯示登入或產品頁)
  const [isAuth, setIsAuth] = useState(false);

  // 產品資料列表的API狀態
  const [products, setProducts] = useState([]);
  // 目前選中的產品
  const [tempProduct, setTempProduct] = useState();

  //表單輸入處理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);//測試用
    setFormData((preData) => ({
      ...preData, //保留原有屬性
      [name]: value, //更新特定屬性
    }));
  };

  // 設定取得產品資料API
  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`,
      );
      setProducts(response.data.products);
    } catch (error) {
      console.log(error.response);
    }
  };

  //串接API
  const onSubmit = async (e) => {
    try {
      //登入成功
      e.preventDefault(); //停止onSubmit的預設事件，為避免原生的預設事件發生
      //串接API
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      // console.log(response.data);
      // 設定cookie
      const { token, expired } = response.data;
      //儲存Token到Cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // 登入成功後，請將 Token 設定到 axios 的預設 Header，之後所有 API 請求都會自動帶上 Token
      axios.defaults.headers.common['Authorization'] = token;

      getProducts(); //登入成功後，進入產品列表頁，呼叫函式，取得產品列表的資料
      setIsAuth(true); //登入成功，設定控制畫面參數為TRUE
    } catch (error) {
      setIsAuth(false); //登入失敗，設定控制畫面參數為false
      console.log(error.response);
    }
  };

  // 登入驗證
  const checkLogin = async () => {
    try {
      // 取得Token
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('hexToken='))
        ?.split('=')[1];
      // 登入成功後，請將 Token 設定到 axios 的預設 Header，之後所有 API 請求都會自動帶上 Token
      // 修改實體建立時所指派的預設配置
      axios.defaults.headers.common['Authorization'] = token;
      const response = await axios.post(`${API_BASE}/api/user/check`);
      console.log(response.data);
    } catch (error) {
      console.log(error.response?.data.message);
    }
  };

  return (
    <>
      {/* 登入表單頁面 */}
      {!isAuth ? (
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8"></div>
            <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="username"
                  name="username"
                  placeholder="name@example.com"
                  value={formData.username}
                  onChange={(e) => handleInputChange(e)}
                  required
                  autoFocus
                />
                <label htmlFor="username">Email address</label>
              </div>
              <div className="form-floating">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="password">Password</label>
              </div>
              <button
                type="submit"
                className="btn btn-lg btn-primary w-100 mt-3"
              >
                登入
              </button>
            </form>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      ) : (
        <div className="container">
          <div className="row mt-2">
            <div className="col-md-6">
              {/* 功能按鈕 */}
              <button
                className="btn btn-danger mb-5"
                type="button"
                onClick={() => checkLogin()}
              >
                確認是否登入
              </button>
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id}>
                      <th scope="row">{item.title}</th>
                      <td>{item.origin_price}</td>
                      <td>{item.price}</td>
                      <td>{item.is_enabled ? '啟用' : '未啟用'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setTempProduct(item)}
                        >
                          查看細節
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    alt="主圖"
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      元 / {tempProduct.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          style={{ height: '150px', margin: ' 5px' }}
                          alt="其他圖片"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
