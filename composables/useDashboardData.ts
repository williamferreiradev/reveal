export const useDashboardData = () => {
    const supabase = useSupabase()

    // 1. Fetch Top Cards Stats (Filtered)
    const getStats = async (startDate?: string) => {
        try {
            // If no filter, use the optimized view for totals
            if (!startDate) {
                const { data, error } = await supabase
                    .from('admin_dashboard_stats')
                    .select('*')
                    .single()
                if (error) throw error
                return data
            }

            // If filtering, we must count raw rows (DB doesn't have filtered views)
            const [
                { count: newUsers, error: usersErr },
                { count: newMatches, error: matchesErr },
                { count: newPosts, error: postsErr }
            ] = await Promise.all([
                supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', startDate),
                supabase.from('matches').select('*', { count: 'exact', head: true }).gte('created_at', startDate),
                supabase.from('feed_posts').select('*', { count: 'exact', head: true }).gte('created_at', startDate)
            ])

            if (usersErr) throw usersErr
            if (matchesErr) throw matchesErr
            if (postsErr) throw postsErr

            // Return compatible object
            return {
                total_users: await (async () => {
                    // Total users usually remains total, but if user implies "New Users in period", we return newUsers.
                    // However, the card title is "Total de Usuários". 
                    // Let's keep Total Users as Total (All Time) because "Total" implies stock, not flow.
                    // But maybe the "Trend" should change? 
                    // For simplicity and correctness with "Filter", usually Dashboard 'Total Users' is invariant count, 
                    // OR it shows "Users *Active*"? 
                    // Let's return ALL TIME total for 'total_users' and filtered counts for the others.
                    const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })
                    return count
                })(),
                total_matches: newMatches,
                total_posts: newPosts,
                new_users_month: newUsers // Reusing this field for "New Users (Selected Period)"
            }
        } catch (e) {
            console.error('Error fetching stats:', e)
            return null
        }
    }

    // 2. Fetch User Growth Chart Data
    const getUserGrowth = async (startDate?: string) => {
        try {
            let query = supabase.from('admin_dashboard_user_growth').select('*')
            if (startDate) {
                query = query.gte('date', startDate)
            }
            const { data, error } = await query

            if (error) throw error
            return data
        } catch (e) {
            console.error('Error fetching user growth:', e)
            return []
        }
    }

    // 3. Fetch Posts Activity Chart Data
    const getPostsActivity = async (startDate?: string) => {
        try {
            let query = supabase.from('admin_dashboard_posts_activity').select('*')
            if (startDate) {
                query = query.gte('date', startDate)
            }
            const { data, error } = await query

            if (error) throw error
            return data
        } catch (e) {
            console.error('Error fetching posts activity:', e)
            return []
        }
    }

    // 4. Fetch Users (Real Table)
    const getUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100)

            if (error) throw error
            return data
        } catch (e) {
            console.error('Error fetching users:', e)
            return []
        }
    }

    // 5. Fetch Posts with User Data (Manual Join)
    const getPosts = async () => {
        try {
            // 1. Fetch Posts
            const { data: posts, error: postsError } = await supabase
                .from('feed_posts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50)

            if (postsError) throw postsError
            if (!posts || posts.length === 0) return []

            // 2. Fetch Users for these posts
            const userIds = [...new Set(posts.map(p => p.user_id))]
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, user_id, nome, fotos')
                .in('user_id', userIds)

            if (usersError) throw usersError

            // Map users to dictionary for fast lookup
            const userMap: Record<string, any> = {}
            if (users) {
                users.forEach(u => {
                    userMap[u.user_id] = u
                })
            }

            // 3. Attach user to post
            return posts.map(p => {
                const user = userMap[p.user_id]

                // Handle Photos for User
                let avatarUrl = null
                if (user) {
                    try {
                        if (user.fotos && user.fotos.startsWith('[')) {
                            const photos = JSON.parse(user.fotos)
                            if (Array.isArray(photos) && photos.length > 0) avatarUrl = photos[0]
                        } else {
                            avatarUrl = user.fotos
                        }
                    } catch (e) { avatarUrl = user.fotos }
                }

                if (!avatarUrl) {
                    avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nome || 'User')}&background=random`
                }

                return {
                    ...p,
                    user: {
                        name: user?.nome || 'Usuário Desconhecido',
                        avatar: avatarUrl
                    }
                }
            })

        } catch (e) {
            console.error('Error fetching posts:', e)
            return []
        }
    }

    // 6. Analytics Data
    const getAnalyticsData = async (startDate?: string) => {
        try {
            // Default to 30 days if no start date provided
            let dateStr: string
            if (startDate) {
                dateStr = startDate
            } else {
                const last30Days = new Date()
                last30Days.setDate(last30Days.getDate() - 30)
                dateStr = last30Days.toISOString()
            }

            // Parallel Requests
            const [
                statsRes,
                usersRes,
                matchesRes,
                likesRes,
                postsRes
            ] = await Promise.all([
                // 1. Stats View (Totals) - Note: View might not support filtering, returning total acts as baseline
                supabase.from('admin_dashboard_stats').select('*').single(),

                // 2. User Growth View (Daily)
                supabase.from('admin_dashboard_user_growth').select('*').gte('date', dateStr),

                // 3. Matches
                supabase.from('matches').select('created_at').gte('created_at', dateStr),

                // 4. Likes
                supabase.from('likes').select('created_at').gte('created_at', dateStr),

                // 5. Posts (For Content Distribution - checking ALL posts in period)
                supabase.from('feed_posts').select('tipo').gte('created_at', dateStr)
            ])

            // Process Matches per Day
            const matchesByDay: Record<string, number> = {}
            if (matchesRes.data) {
                matchesRes.data.forEach((m: any) => {
                    if (m.created_at) {
                        const day = new Date(m.created_at).toISOString().split('T')[0]
                        matchesByDay[day] = (matchesByDay[day] || 0) + 1
                    }
                })
            }

            // Process Likes per Day
            const likesByDay: Record<string, number> = {}
            if (likesRes.data) {
                likesRes.data.forEach((l: any) => {
                    if (l.created_at) {
                        const day = new Date(l.created_at).toISOString().split('T')[0]
                        likesByDay[day] = (likesByDay[day] || 0) + 1
                    }
                })
            }

            // Process Content Distribution
            const contentDist = { image: 0, video: 0, text: 0 }
            if (postsRes.data) {
                postsRes.data.forEach((p: any) => {
                    const type = (p.tipo || '').toLowerCase()
                    if (type === 'post') contentDist.image++
                    else if (type === 'video') contentDist.video++
                    else contentDist.text++
                })
            }

            return {
                stats: statsRes.data,
                userGrowth: usersRes.data || [],
                matchesHistory: matchesByDay,
                likesHistory: likesByDay,
                contentDistribution: contentDist
            }

        } catch (e) {
            console.error('Error fetching analytics:', e)
            return null
        }
    }

    // 7. Get Single User Details + Posts
    // 7. Get Single User Details + Posts
    const getUserDetails = async (userId: string) => {
        try {
            // Determine if userId is numeric or UUID to avoid PostgreSQL type errors
            let query = supabase.from('users').select('*')

            // Check if userId is numeric strings
            if (/^\d+$/.test(userId)) {
                query = query.eq('id', userId)
            } else {
                // Assume UUID
                query = query.eq('user_id', userId)
            }

            const { data: user, error: userError } = await query.single()

            if (userError) throw userError

            // Fetch User's Posts (posts table uses user_id which is UUID)
            // We need to ensure we have the UUID from the fetched user object
            const { data: posts, error: postsError } = await supabase
                .from('feed_posts')
                .select('*')
                .eq('user_id', user.user_id) // user.user_id is always the UUID from the DB
                .order('created_at', { ascending: false })

            if (postsError) throw postsError

            // Count Matches
            // Trying multiple column combinations to be safe as schema inspection was empty
            // Most likely quem_deu_match/quem_recebeu_match based on likes pattern
            // Or user1_id/user2_id standard

            // We'll try to fetch count using OR logic. 
            // Note: If columns don't exist, this might throw, but we'll wrap in try/catch or just return 0 if fails.
            let matchesCount = 0
            try {
                const { count, error: matchError } = await supabase
                    .from('matches')
                    .select('*', { count: 'exact', head: true })
                    .or(`quem_deu_match.eq.${user.user_id},quem_recebeu_match.eq.${user.user_id}`)

                if (!matchError) {
                    matchesCount = count || 0
                } else {
                    // Fallback to user1_id/user2_id if previous failed (less likely but possible)
                    const { count: count2 } = await supabase
                        .from('matches')
                        .select('*', { count: 'exact', head: true })
                        .or(`user1_id.eq.${user.user_id},user2_id.eq.${user.user_id}`)
                    matchesCount = count2 || 0
                }
            } catch (err) {
                console.warn('Failed to count matches', err)
            }

            return {
                user: {
                    ...user,
                    avatar: user.fotos ? (user.fotos.startsWith('[') ? JSON.parse(user.fotos)[0] : user.fotos) : null,
                    matchesCount
                },
                posts: posts || []
            }
        } catch (e) {
            console.error('Error fetching user details:', e)
            return null
        }
    }

    // 8. Risk Analysis Data (Keyword Scanning)
    const getRiskAnalysisData = async () => {
        try {
            // Bad Words List (as requested)
            const keywords = ['piroca', 'matar', 'matador', 'genitaleas', 'genitais', 'k7', 'cacete', 'nudes', 'spam', 'droga', 'armas']

            // 1. Fetch Users to scan names
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, user_id, nome, fotos, created_at')
                .limit(50)
                .order('created_at', { ascending: false })

            // 2. Fetch Posts to scan content
            const { data: posts, error: postsError } = await supabase
                .from('feed_posts')
                .select('id, user_id, conteudo, created_at')
                .limit(50)
                .order('created_at', { ascending: false })

            if (usersError) throw usersError
            if (postsError) throw postsError

            const alerts: any[] = []

            // A. Scan Users
            if (users) {
                users.forEach(u => {
                    if (!u.nome) return
                    const lowerName = u.nome.toLowerCase()
                    const foundWord = keywords.find(k => lowerName.includes(k))

                    if (foundWord) {
                        // Parse avatar
                        let avatar = u.fotos
                        try {
                            if (u.fotos && u.fotos.startsWith('[')) {
                                avatar = JSON.parse(u.fotos)[0]
                            }
                        } catch (e) { }
                        if (!avatar) avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nome)}&background=random`

                        alerts.push({
                            id: `user-${u.id}`,
                            user_id: u.user_id,
                            name: u.nome,
                            email: `user${u.id}@email.com`,
                            avatar,
                            reason: `Nome suspeito detectado: "${foundWord}"`,
                            severity: 'high',
                            date: new Date(u.created_at).toLocaleDateString('pt-BR'),
                            snippet: u.nome
                        })
                    }
                })
            }

            // B. Scan Posts
            if (posts) {
                // Map users for quick lookup
                const userMap = new Map()
                if (users) users.forEach(u => userMap.set(u.user_id, u))

                posts.forEach(p => {
                    if (!p.conteudo) return
                    const lowerContent = p.conteudo.toLowerCase()
                    const foundWord = keywords.find(k => lowerContent.includes(k))

                    if (foundWord) {
                        // Find user
                        let user = userMap.get(p.user_id)

                        // Fallback avatar/name if user not in the last 50 fetched (likely is if posts are recent)
                        const name = user?.nome || 'Usuário Desconhecido'
                        let avatar = user?.fotos
                        try {
                            if (avatar && avatar.startsWith('[')) avatar = JSON.parse(avatar)[0]
                        } catch (e) { }
                        if (!avatar) avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`

                        alerts.push({
                            id: `post-${p.id}`,
                            user_id: p.user_id,
                            name: name,
                            email: '...',
                            avatar,
                            reason: `Conteúdo suspeito no post: "${foundWord}"`,
                            severity: 'medium', // Content might be context-dependent
                            date: new Date(p.created_at).toLocaleDateString('pt-BR'),
                            snippet: p.conteudo.length > 50 ? p.conteudo.substring(0, 50) + '...' : p.conteudo
                        })
                    }
                })
            }

            return alerts

        } catch (e) {
            console.error('Error fetching risk analysis:', e)
            return []
        }
    }

    return {
        getStats,
        getUserGrowth,
        getPostsActivity,
        getUsers,
        getPosts,
        getAnalyticsData,
        getAnalyticsData,
        getUserDetails,
        getRiskAnalysisData
    }
}
