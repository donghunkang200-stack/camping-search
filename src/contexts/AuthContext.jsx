import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/**
 * 사용자 인증 상태를 관리하는 Context입니다.
 * 프로젝트 전체에서 로그인 여부, 토큰, 사용자 정보를 참조할 수 있게 합니다.
 */
export const AuthProvider = ({ children }) => {
	// 초기 상태 설정: 로컬 스토리지에 토큰이 있으면 로그인된 것으로 간주합니다.
	const [state, setState] = useState({
		user: null,
		token: localStorage.getItem('auth_token'),
		isAuthenticated: !!localStorage.getItem('auth_token'),
	});

	/**
	 * 앱이 처음 실행될 때(또는 새로고침 시) 호출됩니다.
	 * 브라우저 저장소(localStorage)에 저장된 사용자 정보를 다시 불러와 상태를 복구합니다.
	 */
	useEffect(() => {
		const savedToken = localStorage.getItem('auth_token');
		const savedUser = localStorage.getItem('auth_user');
		if (savedToken && savedUser) {
			setState({
				token: savedToken,
				user: JSON.parse(savedUser),
				isAuthenticated: true,
			});
		}
	}, []);

	/**
	 * 로그인 성공 시 인증 정보를 상태와 로컬 스토리지에 저장합니다.
	 * @param {string} token - 서버에서 발급한 JWT 토큰
	 * @param {string} username - 사용자 아이디
	 */
	const login = (token, username) => {
		const user = { username };
		localStorage.setItem('auth_token', token);
		localStorage.setItem('auth_user', JSON.stringify(user));
		setState({ token, user, isAuthenticated: true });
	};

	/**
	 * 로그아웃 시 모든 인증 정보를 삭제하고 초기화합니다.
	 */
	const logout = () => {
		localStorage.removeItem('auth_token');
		localStorage.removeItem('auth_user');
		setState({ token: null, user: null, isAuthenticated: false });
	};

	return (
		<AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error('AuthProvider 안에서 사용해야 합니다.');
	return context;
};
