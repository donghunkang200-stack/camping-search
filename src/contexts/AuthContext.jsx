import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [state, setState] = useState({
		user: null,
		token: localStorage.getItem('auth_token'),
		isAuthenticated: !!localStorage.getItem('auth_token'),
	});

	// 앱이 시작될 때 브라우저 저장소(localStorage)에서 로그인 정보를 가져옵니다.
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

	// 로그인 성공 시 호출
	const login = (token, username) => {
		const user = { username };
		localStorage.setItem('auth_token', token);
		localStorage.setItem('auth_user', JSON.stringify(user));
		setState({ token, user, isAuthenticated: true });
	};

	// 로그아웃 시 호출
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
