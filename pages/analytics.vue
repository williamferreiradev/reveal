<script setup lang="ts">
import { 
  Users, 
  UserPlus, 
  FileText, 
  Heart, 
  MessageCircle,
  Activity,
  Calendar
} from 'lucide-vue-next'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'vue-chartjs'

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

definePageMeta({
  title: 'Analytics',
  layout: 'default'
})

// Data Refs
const timeFilter = ref('all')
const { getAnalyticsData } = useDashboardData()
const stats = ref<any>(null)
const userGrowth = ref<any[]>([])
const matchesHistory = ref<Record<string, number>>({})
const likesHistory = ref<Record<string, number>>({})
const contentDist = ref<any>({ image: 0, video: 0, text: 0 })
const isLoading = ref(true)

// Fetch Data
const fetchData = async () => {
    isLoading.value = true
    try {
        const startDate = computeStartDate()
        const data = await getAnalyticsData(startDate)
        if (data) {
            stats.value = data.stats
            userGrowth.value = data.userGrowth
            matchesHistory.value = data.matchesHistory
            likesHistory.value = data.likesHistory
            contentDist.value = data.contentDistribution
            
            // Re-fetch posts activity for "Posts Criados" graph
            // Note: getAnalyticsData returns some data, but Matches vs Posts chart relies on getPostsActivity structure?
            // Actually analytics.vue uses matchesVsPostsData which joins matchesHistory and postsActivity.
            // We need to fetch postsActivity with filter too.
            await fetchPostsActivity(startDate)
        }
    } finally {
        isLoading.value = false
    }
}

const computeStartDate = () => {
    const now = new Date()
    if (timeFilter.value === 'day') {
        const d = new Date()
        d.setHours(0,0,0,0)
        return d.toISOString()
    } else if (timeFilter.value === 'month') {
        const d = new Date(now.getFullYear(), now.getMonth(), 1)
        return d.toISOString()
    } else if (timeFilter.value === 'year') {
        const d = new Date(now.getFullYear(), 0, 1) // Jan 1st
        return d.toISOString()
    } else if (timeFilter.value === 'all') {
        // "Todo o Período" - let's set a far back date, e.g., 2024-01-01 or just undefined if we want default?
        // But backend default is 30 days. Let's make 'all' = 365 days for now to be safe on performance
        const d = new Date()
        d.setDate(d.getDate() - 365)
        return d.toISOString()
    }
    return undefined
}

watch(timeFilter, () => fetchData())

// Fix: Add getPostsActivity call
const postsActivity = ref<any[]>([])
const fetchPostsActivity = async (startDate?: string) => {
    const { getPostsActivity } = useDashboardData() 
    const data = await getPostsActivity(startDate)
    if (data) postsActivity.value = data
}

onMounted(() => {
    fetchData()
})

// Process Chart Data
// Helper to generate keys between start date and now
const dateKeys = computed(() => {
    const now = new Date()
    let start = new Date(computeStartDate() || new Date().setDate(now.getDate() - 30))
    if (timeFilter.value === 'day') {
        // For 'Today', maybe show hours? But backend returns 'YYYY-MM-DD'.
        // If backend sums by day, 'Today' will be a single point.
        // Let's show last 24h or just Today.
        start = new Date()
        start.setHours(0,0,0,0)
    }

    const keys = []
    const labels = []
    // Iterate from start to now
    let current = new Date(start)
    while (current <= now) {
        const iso = current.toISOString().split('T')[0]
        keys.push(iso)
        labels.push(current.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
        current.setDate(current.getDate() + 1)
    }
    // Ensure at least one point (today) if empty
    if (keys.length === 0) {
        const iso = now.toISOString().split('T')[0]
        keys.push(iso)
        labels.push('Hoje')
    }
    return { keys, labels }
})


// 1. User Growth (Line)
const userGrowthData = computed(() => {
    const { keys, labels } = dateKeys.value
    const dataPoints = keys.map(k => {
        const entry = userGrowth.value.find(u => u.date === k)
        return entry ? entry.count : 0
    })

    return {
        labels,
        datasets: [{
            label: 'Novos Usuários',
            borderColor: '#FF6F00',
            backgroundColor: 'rgba(255, 111, 0, 0.1)',
            data: dataPoints,
            fill: true,
            tension: 0.4
        }]
    }
})

// 2. New Users (Bar)
const newUsersData = computed(() => {
    const { keys, labels } = dateKeys.value
    return {
        labels,
        datasets: [{
            label: 'Novos Usuários',
            backgroundColor: '#4CAF50',
            data: keys.map(k => {
                const entry = userGrowth.value.find(u => u.date === k)
                return entry ? entry.count : 0
            }),
            borderRadius: 4
        }]
    }
})

// 3. Engagement: Likes vs Comments (Double Line)
const engagementData = computed(() => {
    const { keys, labels } = dateKeys.value
    return {
        labels,
        datasets: [
            {
                label: 'Curtidas',
                borderColor: '#FF4081',
                backgroundColor: 'transparent',
                data: keys.map(k => likesHistory.value[k] || 0),
                tension: 0.4
            }
        ]
    }
})

// 4. Content Type Distribution (Doughnut)
const contentData = computed(() => ({
  labels: ['Imagens', 'Textos', 'Vídeos'],
  datasets: [{
    backgroundColor: ['#FF6F00', '#9E9E9E', '#FFB74D'],
    borderColor: '#1E1E1E',
    data: [contentDist.value.image, contentDist.value.text, contentDist.value.video]
  }]
}))

// 5. Matches vs Posts
const matchesVsPostsData = computed(() => {
  const { keys, labels } = dateKeys.value
  return {
    labels,
    datasets: [
        {
        label: 'Matches',
        backgroundColor: '#E91E63',
        data: keys.map(k => matchesHistory.value[k] || 0),
        borderRadius: 4
        },
        {
        label: 'Posts Criados',
        backgroundColor: '#FFA726',
        data: keys.map(k => {
            const entry = postsActivity.value.find(p => p.date === k)
            return entry ? entry.count : 0
        }),
        borderRadius: 4
        }
    ]
  }
})


// Chart Options Reactive
const { isDark } = useTheme()

const chartColors = computed(() => ({
  text: isDark.value ? '#9CA3AF' : '#4B5563', // gray-400 vs gray-600
  grid: isDark.value ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  doughnutBorder: isDark.value ? '#1E1E1E' : '#FFFFFF'
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: chartColors.value.text }, position: 'top' as const },
    tooltip: { mode: 'index' as const, intersect: false }
  },
  scales: {
    y: {
      grid: { color: chartColors.value.grid },
      ticks: { color: chartColors.value.text }
    },
    x: {
      grid: { display: false },
      ticks: { color: chartColors.value.text }
    }
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false
  }
}))

const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: chartColors.value.text }, position: 'right' as const }
  },
  elements: {
    arc: {
        borderColor: chartColors.value.doughnutBorder
    }
  }
}))


</script>

<template>
  <div class="space-y-6">
    <!-- Header & Filter -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Analytics Completo</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Dados detalhados para investidores e análise estratégica.</p>
        </div>
        
        <div class="bg-white dark:bg-surface p-1 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center shadow-sm">
            <button 
                v-for="filter in [
                  { id: 'all', label: 'Todo o Período' }, 
                  { id: 'year', label: 'Este Ano' }, 
                  { id: 'month', label: 'Este Mês' }, 
                  { id: 'day', label: 'Hoje' }
                ]"
                :key="filter.id"
                @click="timeFilter = filter.id"
                class="px-4 py-2 rounded-md text-sm font-medium transition-all"
                :class="timeFilter === filter.id 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-lighter'"
            >
                {{ filter.label }}
            </button>
        </div>
    </header>

    <!-- Key Metrics Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            title="Total de Usuários" 
            :value="stats?.total_users?.toLocaleString() || '...'" 
            trend="+12%" 
            trendLabel="crescimento" 
            :isPositive="true"
            :icon="Users"
            iconColorClass="bg-primary"
        />
         <StatCard 
            title="Novos Usuários (30d)" 
            :value="stats?.new_users_month?.toLocaleString() || '...'" 
            trend="+5%" 
            trendLabel="aquisição" 
            :isPositive="true"
            :icon="UserPlus"
            iconColorClass="bg-green-500"
        />
         <StatCard 
            title="Total de Matches" 
            :value="stats?.total_matches?.toLocaleString() || '...'" 
            trend="+1.2%" 
            trendLabel="conexões" 
            :isPositive="true"
            :icon="Heart"
            iconColorClass="bg-purple-500"
        />
         <StatCard 
            title="Total de Posts" 
            :value="stats?.total_posts?.toLocaleString() || '...'" 
            trend="+8%" 
            trendLabel="atividade" 
            :isPositive="true"
            :icon="FileText"
            iconColorClass="bg-blue-500"
        />
    </div>

    <!-- Main Growth Chart -->
    <div class="bg-white dark:bg-surface p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Users :size="20" class="text-primary" />
            Evolução da Base de Usuários
        </h3>
        <div class="h-80">
            <Line :data="userGrowthData" :options="chartOptions" />
        </div>
    </div>

    <!-- Grid Layout for Detailed Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Engagement Chart -->
        <div class="bg-white dark:bg-surface p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Heart :size="20" class="text-pink-500" />
                Curtidas (Últimos 30 dias)
            </h3>
            <div class="h-72">
                <Line :data="engagementData" :options="chartOptions" />
            </div>
        </div>

        <!-- New Users Bar Chart -->
        <div class="bg-white dark:bg-surface p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <UserPlus :size="20" class="text-green-500" />
                Novos Usuários (Últimos 30 dias)
            </h3>
            <div class="h-72">
                <Bar :data="newUsersData" :options="chartOptions" />
            </div>
        </div>

        <!-- Matches vs Posts -->
        <div class="bg-white dark:bg-surface p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
             <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Activity :size="20" class="text-orange-500" />
                Atividade (Matches vs Posts)
            </h3>
            <div class="h-72">
                <Bar :data="matchesVsPostsData" :options="chartOptions" />
            </div>
        </div>

        <!-- Content Type Doughnut -->
        <div class="bg-white dark:bg-surface p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
             <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText :size="20" class="text-gray-500" />
                Distribuição de Conteúdo
            </h3>
            <div class="h-72 flex justify-center">
                <div class="w-full max-w-sm">
                    <Doughnut :data="contentData" :options="doughnutOptions" />
                </div>
            </div>
        </div>

    </div>
  </div>
</template>
