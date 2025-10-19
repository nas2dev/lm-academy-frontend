<script setup>
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import SendIcon from '@/assets/fonts/feather-icons/icons/send.svg?component'
import Axios from '@/utils/axios'

const email = ref('')
const isLoading = ref(false)
const toast = useToast()

// results data
const showResults = ref(false)
const results = ref({
  success: { count: 0, emails: [] },
  invalid: { count: 0, emails: [] },
  existing: { count: 0, emails: [] },
})

const clearResults = () => {
  showResults.value = false

  results.value = {
    success: { count: 0, emails: [] },
    invalid: { count: 0, emails: [] },
    existing: { count: 0, emails: [] },
  }
}

const handleSubmit = async () => {
  isLoading.value = true
  console.log('email', email.value)

  try {
    const data = {
      invited_users: email.value.trim(),
    }

    const response = await Axios.post('/auth/send-registration-invite', data)

    if (response.status === 200) {
      console.log('response', response)
      toast.success('Invite email sent successfully')

      const result = response.data

      results.value = {
        success: {
          count: result.success_count || 0,
          emails: result.successfully_invited ? result.successfully_invited.split(' ,') : [],
        },
        invalid: {
          count: result.invalid_count || 0,
          emails: result.invalid_emails ? result.invalid_emails.split(' ,') : [],
        },
        existing: {
          count: result.existing_count || 0,
          emails: result.existing_users ? result.existing_users.split(' ,') : [],
        },
      }

      showResults.value = true
      email.value = ''
    }
  } catch (error) {
    console.error('error', error)
    toast.error('Failed to send invite email')
  } finally {
    isLoading.value = false
  }
}
</script>
<template>
  <!--  Header End -->
  <div>
    <h6 class="text-lg font-semibold mb-4">Send Registration Invite</h6>
    <div class="card">
      <div class="card-body">
        <p class="text-sm">
          You can invite multiple students at once by entering their email addresses, separated by
          commas. Only valid and unique emails will be processed. This process might take a while.
        </p>

        <form @submit.prevent="handleSubmit">
          <div class="my-4">
            <textarea
              rows="10"
              v-model="email"
              placeholder="Paste e-mails here, separated by commas (e.g., student1@example.com, student2@example.com)"
              class="py-3 px-4 block w-full border-gray-200 rounded-md text-sm focus:border-blue-600 focus:ring-0"
              required
              :disabled="isLoading"
            ></textarea>
            <p class="text-xs text-gray-300 mt-1">
              Invalid or duplicate emails will be ignored. You’ll receive a summary of any errors.
            </p>

            <div class="flex justify-center my-6">
              <button
                type="submit"
                class="btn py-[10px] text-base text-white font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="isLoading || !email.trim()"
              >
                <span v-if="!isLoading">Send Invite E-mail</span>
                <span v-else>Sending...</span>
                <SendIcon />
              </button>
            </div>
          </div>
        </form>

        <!-- results -->

        <div v-if="showResults" class="mt-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-600">Invitation Results</h3>
            <button
              class="text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
              @click="clearResults"
            >
              Clear Results
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="border border-gray-200 rounded-lg p-4 bg-white">
              <div class="mb-3">
                <h4 class="text-sm font-semibold text-gray-900 mb-1">Success Send</h4>
                <p class="text-xs text-gray-500">{{ results.success.count }} invitation(s)</p>
              </div>
              <div v-if="results.success.emails.length > 0" class="space-y-1">
                <div
                  v-for="email in results.success.emails"
                  :key="email"
                  class="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border"
                >
                  {{ email }}
                </div>
              </div>
              <div v-else class="text-xs italic text-gray-400">No successful invitations</div>
            </div>

            <div class="border border-gray-200 rounded-lg p-4 bg-white">
              <div class="mb-3">
                <h4 class="text-sm font-semibold text-gray-900 mb-1">Invalid Send</h4>
                <p class="text-xs text-gray-500">{{ results.invalid.count }} invitation(s)</p>
              </div>
              <div v-if="results.invalid.emails.length > 0" class="space-y-1">
                <div
                  v-for="email in results.invalid.emails"
                  :key="email"
                  class="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border"
                >
                  {{ email }}
                </div>
              </div>
              <div v-else class="text-xs italic text-gray-400">No invalid invitations</div>
            </div>

            <div class="border border-gray-200 rounded-lg p-4 bg-white">
              <div class="mb-3">
                <h4 class="text-sm font-semibold text-gray-900 mb-1">Existing Emails</h4>
                <p class="text-xs text-gray-500">{{ results.existing.count }} invitation(s)</p>
              </div>
              <div v-if="results.existing.emails.length > 0" class="space-y-1">
                <div
                  v-for="email in results.existing.emails"
                  :key="email"
                  class="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border"
                >
                  {{ email }}
                </div>
              </div>
              <div v-else class="text-xs italic text-gray-400">No existing invitations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
