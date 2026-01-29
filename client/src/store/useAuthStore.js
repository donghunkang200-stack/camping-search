import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Zustand를 사용한 전역 인증 스토어입니다.
 * 사용자 정보, 토큰, 인증 상태를 전역적으로 관리하며 로컬 스토리지와 자동 동기화됩니다.
 */
export const useAuthStore = create(
    persist(
        (set) => ({
            // 초기 상태 값
            user: null,
            token: null,
            isAuthenticated: false,

            /**
             * 로그인 성공 시 인증 정보를 상태에 저장합니다.
             * persist 미들웨어에 의해 localStorage에도 자동으로 저장됩니다.
             * @param {string} token - 서버에서 발급한 JWT 토큰
             * @param {string} username - 사용자 아이디
             */
            login: (token, username) => {
                const user = { username };
                // 하위 호환성 및 외부 스크립트 참조를 위해 기존 키에도 저장
                localStorage.setItem('auth_token', token);
                localStorage.setItem('auth_user', JSON.stringify(user));
                set({
                    token,
                    user,
                    isAuthenticated: true,
                });
            },

            /**
             * 로그아웃 시 모든 인증 정보를 초기화합니다.
             * localStorage에서도 자동으로 관련 데이터가 삭제되거나 업데이트됩니다.
             */
            logout: () => {
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                });
                // 수동으로 이전 방식의 데이터도 정리 (하위 호환성)
                localStorage.removeItem('auth_user');
                localStorage.removeItem('auth_token');
            },
        }),
        {
            // persist 설정 개체
            name: 'auth_storage', // localStorage에 저장될 키 이름
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }), // 저장할 상태만 선택 (옵션)
        }
    )
);
