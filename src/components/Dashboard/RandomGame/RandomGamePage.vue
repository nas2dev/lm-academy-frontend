<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Axios from '@/utils/axios'
import Swal from 'sweetalert2'
import { useToast } from 'vue-toastification'
import { useUserStore } from '@/stores/useUserStore'
import { vConfetti } from '@neoconfetti/vue'
import DiceIcon from '@/assets/images/icons/dice.svg?url'

const toast = useToast()
const userStore = useUserStore()

const lists = ref([])
const selectedListId = ref(null)
const selectedListUsers = ref([])
const selectedListName = ref('')
const luckyPoolEmails = ref('')
const recentWinners = ref([])
const loading = ref(false) // For picking winner
const loadingLists = ref(false) // For loading lists dropdown
const loadingListUsers = ref(false) // For loading users when selecting a list
const showConfetti = ref(false)
const suspenseAudio = ref(null)

const STORAGE_KEY = 'randomGameRecentWinners'
const MAX_RECENT_WINNERS = 20

// Load recent winners from localStorage
const loadRecentWinners = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Convert to simple email array format for display
      recentWinners.value = parsed.map((w) => w.email || w)
    }
  } catch (error) {
    console.error('Error loading recent winners:', error)
  }
}

// Save recent winners to localStorage
const saveRecentWinners = () => {
  try {
    const toSave = recentWinners.value.map((email) => ({
      email,
      timestamp: new Date().toISOString(),
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (error) {
    console.error('Error saving recent winners:', error)
  }
}

// Add winner to recent winners (allow duplicates to show multiple wins)
const addToRecentWinners = (winner) => {
  const winnerEmail = winner.email
  // Always add the winner (allow duplicates to show multiple wins)
  recentWinners.value.unshift(winnerEmail)
  if (recentWinners.value.length > MAX_RECENT_WINNERS) {
    recentWinners.value = recentWinners.value.slice(0, MAX_RECENT_WINNERS)
  }
  saveRecentWinners()
}

// Group recent winners by email and count wins
const groupedRecentWinners = computed(() => {
  const grouped = {}

  // Count wins and track first occurrence index (most recent = lower index since we use unshift)
  recentWinners.value.forEach((email, index) => {
    if (!grouped[email]) {
      grouped[email] = { email, count: 0, firstIndex: index }
    }
    grouped[email].count++
  })

  // Convert to array and sort by first occurrence index (most recent first)
  // Lower index = more recent (because we use unshift to add to beginning)
  return Object.values(grouped).sort((a, b) => a.firstIndex - b.firstIndex)
})

// Clear recent winners
const clearRecentWinners = () => {
  recentWinners.value = []
  localStorage.removeItem(STORAGE_KEY)
  toast.success('Recent winners cleared')
}

// Load all lists
const loadLists = async () => {
  loadingLists.value = true
  try {
    const response = await Axios.get('/lists')
    if (response.data.success) {
      lists.value = response.data.lists.data || []
    } else {
      throw new Error(response.data.message || 'Failed to load lists')
    }
  } catch (error) {
    console.error('Error loading lists:', error)
    toast.error(error.response?.data?.message || 'Failed to load lists')
  } finally {
    loadingLists.value = false
  }
}

// Handle list selection change
const onListChange = async (listId) => {
  if (!listId) {
    selectedListUsers.value = []
    selectedListName.value = ''
    luckyPoolEmails.value = ''
    return
  }

  loadingListUsers.value = true
  try {
    const response = await Axios.get(`/lists/${listId}/users`)
    if (response.data.success) {
      selectedListUsers.value = response.data.users_list?.users || []
      selectedListName.value = response.data.users_list?.list_name || ''
      // Keep manually added emails, just update the list users
    } else {
      throw new Error(response.data.message || 'Failed to load list users')
    }
  } catch (error) {
    console.error('Error loading list users:', error)
    toast.error(error.response?.data?.message || 'Failed to load list users')
    selectedListUsers.value = []
    selectedListName.value = ''
    luckyPoolEmails.value = ''
  } finally {
    loadingListUsers.value = false
  }
}

// Get list emails
const getListEmails = computed(() => {
  return selectedListUsers.value.map((user) => user.email)
})

// Get manually added emails (not in list) from textarea
const getManuallyAddedEmails = computed(() => {
  const listEmails = getListEmails.value
  const textareaContent = luckyPoolEmails.value
    .split(',')
    .map((email) => email.trim())
    .filter((email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return email && emailRegex.test(email) && !listEmails.includes(email)
    })
  return textareaContent
})

// Get all emails (list + manually added) for display and validation
const getAllEmails = computed(() => {
  return [...getListEmails.value, ...getManuallyAddedEmails.value]
})

// Textarea value (combines list emails + manually added)
const textareaValue = computed({
  get() {
    const listEmails = getListEmails.value.join(', ')
    const manualEmails = luckyPoolEmails.value.trim()

    if (!manualEmails) {
      return listEmails
    }

    // Combine list emails and manually added, separated by comma
    return listEmails ? `${listEmails}, ${manualEmails}` : manualEmails
  },
  set(newValue) {
    // Parse the textarea content
    const listEmails = getListEmails.value
    const allEmails = newValue
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0)

    // Extract only emails that are NOT in the list (manually added)
    const manuallyAdded = allEmails.filter((email) => !listEmails.includes(email))

    // Update luckyPoolEmails with manually added emails
    luckyPoolEmails.value = manuallyAdded.join(', ')
  },
})

// Check if pick winner button should be disabled
const canPickWinner = computed(() => {
  // Only check if a list is selected, let backend handle validation for minimum users
  return selectedListId.value && getAllEmails.value.length > 0
})

// Pick random winner
const pickWinner = async () => {
  if (!canPickWinner.value) {
    toast.error('Please select a list')
    return
  }

  loading.value = true

  // Play suspense sound
  if (suspenseAudio.value) {
    try {
      suspenseAudio.value.currentTime = 0 // Reset to start
      await suspenseAudio.value.play()
    } catch (error) {
      // Audio play might fail if user hasn't interacted with page yet
      console.log('Audio play failed (user interaction required):', error)
    }
  }

  try {
    // Add suspense delay (3-4 seconds) to match audio length
    const delay = Math.floor(Math.random() * 1000) + 3000 // Random delay between 3-4 seconds

    // Get manually added emails (not in list) to send to backend
    const additionalEmails = getManuallyAddedEmails.value

    // Debug logging
    console.log('List users:', getListEmails.value)
    console.log('Manually added emails:', additionalEmails)
    console.log('Total emails:', getAllEmails.value)

    // Make API call with POST and additional emails in body
    // Always send additional_emails array (even if empty) so backend knows to check
    const requestBody = {
      additional_emails: additionalEmails,
    }

    const responsePromise = Axios.post(
      `/lists/${selectedListId.value}/pick-random-winner`,
      requestBody,
    )

    // Wait for both API call and delay
    const [response] = await Promise.all([
      responsePromise,
      new Promise((resolve) => setTimeout(resolve, delay)),
    ])

    if (response.data.success && response.data.winner_user) {
      const winner = response.data.winner_user

      // Stop audio and loading before showing the result
      if (suspenseAudio.value) {
        suspenseAudio.value.pause()
        suspenseAudio.value.currentTime = 0
      }
      loading.value = false

      // Add to recent winners
      addToRecentWinners(winner)

      // Show confetti
      showConfetti.value = true
      setTimeout(() => {
        showConfetti.value = false
      }, 2000)

      // Show winner in SweetAlert
      // Don't show warnings on success - if we have 2+ valid participants, just show the winner
      let htmlContent = `
        <div class="text-center">
          <p class="text-lg font-semibold mb-2">${winner.first_name} ${winner.last_name}</p>
          <p class="text-gray-600">${winner.email}</p>
        </div>
      `

      await Swal.fire({
        title: '🎉 Winner Selected!',
        html: htmlContent,
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'bg-swalConfirm text-white hover:bg-swalConfirm/80',
        },
      })
    } else {
      throw new Error(response.data.message || 'Failed to pick winner')
    }
  } catch (error) {
    console.error('Error picking winner:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Failed to pick winner'

    // Build error message with additional context
    let errorHtml = `<p class="text-center">${errorMessage}</p>`

    // If there were warnings (emails not found), show them only in error cases
    // This helps explain why there weren't enough participants
    if (error.response?.data?.warnings && error.response.data.warnings.length > 0) {
      errorHtml += `
        <div class="mt-4 pt-4 border-t border-gray-200">
          <p class="text-sm font-semibold text-yellow-600 mb-2">Note:</p>
          <ul class="text-xs text-left text-gray-600 space-y-1">
            ${error.response.data.warnings.map((warning) => `<li>• ${warning}</li>`).join('')}
          </ul>
        </div>
      `
    }

    // Stop audio and loading before showing the error
    if (suspenseAudio.value) {
      suspenseAudio.value.pause()
      suspenseAudio.value.currentTime = 0
    }
    loading.value = false

    await Swal.fire({
      title: 'Error',
      html: errorHtml,
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'bg-swalCancel text-white hover:bg-swalCancel/80',
      },
    })
  }
}

// Initialize audio
onMounted(() => {
  loadLists()
  loadRecentWinners()

  // Create audio element for suspense sound
  suspenseAudio.value = new Audio()
  suspenseAudio.value.src = '/sounds/dice-roll-suspense.mp3' // Public folder path
  suspenseAudio.value.volume = 0.5 // Set volume to 50% to not be too loud
  suspenseAudio.value.loop = true // Loop during the suspense period
  suspenseAudio.value.preload = 'auto' // Preload for better performance
})

// Cleanup audio on unmount
onUnmounted(() => {
  if (suspenseAudio.value) {
    suspenseAudio.value.pause()
    suspenseAudio.value = null
  }
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-2">
      <h1 class="text-2xl font-semibold">Random Game</h1>
      <div class="flex justify-end" v-if="userStore.isAdmin">
        <router-link
          :to="{ name: 'RandomGameLists' }"
          class="text-[#0085DB] hover:text-blue-700 font-medium"
        >
          Lists
        </router-link>
      </div>
    </div>

    <div class="card">
      <div
        class="flex justify-center min-w-full"
        v-if="showConfetti"
        v-confetti="{ particleCount: 200, force: 0.3 }"
      />
      <div class="card-body">
        <div class="upper-body mb-32">
          <div class="flex flex-col gap-3">
            <p class="text-lg text-black my-2">
              Select users from the dropdown list or manually add them using the textarea below.
              After finalizing the list, click the 'Pick Random' button to choose a lucky winner.
            </p>

            <div class="relative">
              <p class="text-black font-semibold">Select List:</p>
              <select
                v-model="selectedListId"
                @change="onListChange(selectedListId)"
                :disabled="loadingLists || loadingListUsers"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                name="userList"
              >
                <option :value="null">-- Select a list --</option>
                <option v-for="(userlist, key) in lists" :key="key" :value="userlist.id">
                  {{ userlist.list_name }}
                </option>
              </select>
              <div v-if="loadingListUsers" class="absolute right-3 top-9 flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F8C076]"></div>
              </div>
            </div>

            <hr class="mt-5 border-orange-300" />

            <p class="text-sm text-black my-2">
              You can also add multiple students who are not in the list by entering their email
              addresses, separated by commas. Any new email addresses will be appended to the end of
              the user list.
            </p>

            <p class="font-bold mt-2">The Lucky Pool</p>

            <textarea
              name="user-list"
              id="user-list"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-600"
              rows="6"
              v-model="textareaValue"
              placeholder="Select users from the list above or paste email addresses here, separated by commas (e.g., student1@example.com, student2@example.com)"
            ></textarea>

            <p class="text-xs text-black">
              Did you know? The random selection here is powered by an algorithm, not true
              randomness—computers can't roll dice! This process involves using the current time or
              other changing system data as a seed to generate random numbers.
            </p>

            <div class="flex flex-wrap gap-2 items-center">
              <span class="font-bold">Recent Winners:</span>
              <span
                class="recent-winner max-w-full inline-flex items-center gap-1 px-2 py-1 rounded transition-all"
                :class="index === 0 ? 'bg-orange-50 border border-orange-200 font-semibold' : ''"
                v-for="(winner, index) in groupedRecentWinners"
                :key="winner.email"
              >
                <span>{{ winner.email }}</span>
                <span v-if="winner.count > 1" class="text-xs font-semibold text-orange-600">
                  ({{ winner.count }}x)
                </span>
                <span>🎉</span>
              </span>
            </div>
          </div>

          <button
            v-if="recentWinners.length > 0"
            @click="clearRecentWinners"
            class="text-[#0085DB] text-lg mt-3"
          >
            [ Clear List 🔃]
          </button>
        </div>

        <div class="lower-body flex justify-center items-center mb-10">
          <button
            class="flex items-center justify-center gap-4 border-2 border-[#F8C076] px-28 py-3 rounded-[30px] text-lg text-[#F8C076] font-bold bg-[#FCFCFC] disabled:opacity-50 disabled:cursor-not-allowed"
            @click="pickWinner"
            :disabled="!canPickWinner || loading || loadingListUsers"
          >
            <span v-if="loading">Picking...</span>
            <span v-else>Pick a Random Winner</span>
            <img :src="DiceIcon" alt="dice" :class="{ 'dice-rolling': loading }" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.recent-winner {
  display: inline-block;
}

.dice-rolling {
  animation: diceRoll 0.6s ease-in-out infinite;
  transform-origin: center;
}

@keyframes diceRoll {
  0% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(90deg) scale(1.1);
  }
  50% {
    transform: rotate(180deg) scale(1);
  }
  75% {
    transform: rotate(270deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
</style>
