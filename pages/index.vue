<script setup lang="ts">
import { 
  Users, 
  Heart, 
  FileText, 
  UserPlus 
} from 'lucide-vue-next'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar } from 'vue-chartjs'

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

definePageMeta({
  title: 'Home',
  layout: 'default'
})


const { getStats, getUserGrowth, getPostsActivity } = useDashboardData()

// Reactive Chart Data with Types
const userGrowthData = ref({
  labels: [] as string[],
  datasets: [{
    label: 'Novos Usuários',
    backgroundColor: 'rgba(255, 111, 0, 0.2)',
    borderColor: '#FF6F00',
    pointBackgroundColor: '#FF6F00',
    borderWidth: 2,
    fill: true,
    data: [] as number[],
    tension: 0.4
  }]
})

const matchData = ref({
  labels: [] as string[],
  datasets: [
    { label: 'Matches', backgroundColor: '#FF4081', data: [] as number[], borderRadius: 6 },
    { label: 'Posts', backgroundColor: '#29B6F6', data: [] as number[], borderRadius: 6 }
  ]
})


const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#9CA3AF' } // gray-400
    }
  },
  scales: {
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#9CA3AF' }
    },
    x: {
      grid: { display: false },
      ticks: { color: '#9CA3AF' }
    }
  }
}

const stats = ref([
    { title: 'Total de Usuários', value: '...', icon: Users, trend: '+0%', trendLabel: 'vs mês anterior', isPositive: true, iconClass: 'bg-primary' },
    { title: 'Matches', value: '...', icon: Heart, trend: '--', trendLabel: 'vs mês anterior', isPositive: true, iconClass: 'bg-pink-500' },
    { title: 'Posts Criados', value: '...', icon: FileText, trend: '--', trendLabel: 'vs mês anterior', isPositive: true, iconClass: 'bg-blue-500' },
    { title: 'Novos Usuários (Mês)', value: '...', icon: UserPlus, trend: '--', trendLabel: 'últimos 30 dias', isPositive: true, iconClass: 'bg-green-500' },
])

const filterRange = ref('7d')

const computeStartDate = () => {
    const now = new Date()
    if (filterRange.value === '7d') {
        const d = new Date()
        d.setDate(d.getDate() - 7)
        return d.toISOString()
    } else if (filterRange.value === 'month') {
        const d = new Date(now.getFullYear(), now.getMonth(), 1)
        return d.toISOString()
    } else if (filterRange.value === 'year') {
        const d = new Date(now.getFullYear(), 0, 1) // Jan 1st
        return d.toISOString()
    }
    return undefined
}

const fetchData = async () => {
    const startDate = computeStartDate()
    
    // 1. Load Stats
    const statsData = await getStats(startDate)
    if (statsData) {
        stats.value[0].value = statsData.total_users?.toLocaleString() || '0'
        stats.value[1].value = statsData.total_matches?.toLocaleString() || '0'
        stats.value[2].value = statsData.total_posts?.toLocaleString() || '0'
        stats.value[3].value = statsData.new_users_month?.toLocaleString() || '0'
    }

    // 2. Load Growth Chart
    const growth = await getUserGrowth(startDate)
    if (growth) {
        userGrowthData.value = {
            labels: growth.map((g: any) => new Date(g.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })),
            datasets: [{ ...userGrowthData.value.datasets[0], data: growth.map((g: any) => g.count) }]
        }
    }

    // 3. Load Activity Chart
    const postsActivity = await getPostsActivity(startDate)
    if (postsActivity) {
        matchData.value = {
            labels: postsActivity.map((p: any) => new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })),
            datasets: [
                { ...matchData.value.datasets[0], data: [] }, // Matches not in activity chart endpoint currently
                { ...matchData.value.datasets[1], data: postsActivity.map((p: any) => p.count) }
            ]
        }
    }
}

watch(filterRange, () => {
    fetchData()
})

onMounted(() => {
    fetchData()
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Bem-vindo, Admin! 👋</h1>
        <p class="text-gray-500 dark:text-gray-400">Aqui está o resumo do que está acontecendo no Reveal.</p>
      </div>
      <div class="flex gap-2">
         <!-- Date Filter Placeholder -->
         <select 
            v-model="filterRange"
            class="bg-white dark:bg-surface border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-600 dark:text-gray-300 outline-none focus:border-primary"
         >
            <option value="7d">Últimos 7 dias</option>
            <option value="month">Este Mês</option>
            <option value="year">Este Ano</option>
         </select>
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        v-for="(stat, index) in stats"
        :key="index"
        :title="stat.title" 
        :value="stat.value" 
        :trend="stat.trend" 
        :trendLabel="stat.trendLabel" 
        :isPositive="stat.isPositive"
        :icon="stat.icon"
        :iconColorClass="stat.iconClass"
      />
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Line Chart -->
      <div class="bg-white dark:bg-surface p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Crescimento de Usuários</h3>
        <div class="h-72">
          <Line :data="userGrowthData" :options="chartOptions" />
        </div>
      </div>

      <!-- Bar Chart -->
      <div class="bg-white dark:bg-surface p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Engajamento (Matches vs Posts)</h3>
        <div class="h-72">
          <Bar :data="matchData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>
