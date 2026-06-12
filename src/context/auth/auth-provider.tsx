// LOGIN
const login = useCallback(
    async (username: string, password: string, remember: boolean) => {
        try {
            const response = await axios.post('/api/auth/login', {
                login: username,
                password
            });

            const { token, username: user, balance } = response.data;

            setSession(token);
            dispatch(loginAction({ user: { username: user, balance }, accessToken: token }));
            dispatch(balanceAction({ balance }));
        } catch (error: any) {
            throw new Error(error?.response?.data?.error || 'Login failed');
        }
    },
    [dispatch]
);
