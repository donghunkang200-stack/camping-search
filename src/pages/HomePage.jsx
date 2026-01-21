import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="home-deco">🏕️</div>
      <h1 className="home-title">
        캠핑가고 싶을 때는
        <br />
        <span>캠핑가자!</span>
      </h1>
      <p className="home-subtitle">
        전국의 3,000여 개 캠핑장을 한눈에 확인하고
        <br />
        나에게 딱 맞는 힐링 장소를 찾아보세요.
      </p>

      <div className="home-btn-group">
        <Link to="/register" className="btn-primary">
          무료로 시작하기
        </Link>
        <Link to="/login" className="btn-secondary">
          기존 계정으로 로그인
        </Link>
      </div>
    </div>
  );
};
export default HomePage;
