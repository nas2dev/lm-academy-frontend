<script setup>
import { ref } from 'vue'

// Mentors array
const mentors = ref([
  {
    name: 'Valdrin Nasufi',
    email: 'valdrin.nasufi@gmail.com',
    linkedin: 'https://www.linkedin.com/in/valdrin-nasufi-132ba0197',
  },
  {
    name: 'Almedin Nasufi',
    email: 'almedin.nasufi20@gmail.com',
    linkedin: 'https://www.linkedin.com/in/almedin-nasufi-496163174',
  },
  {
    name: 'Muhamer Ujkani',
    email: 'muhamerujkani@gmail.com',
    linkedin: 'https://www.linkedin.com/in/muhamer-ujkani-1ab21785/',
  },
])

// Students array
const students = ref([
  {
    name: 'Student 1',
    email: 'student.1@hotmail.com',
    linkedin: 'https://linkedin.com/in/student1',
  },
  {
    name: 'Student 2',
    email: 'student.2@gmail.com',
    linkedin: 'https://linkedin.com/in/student2',
  },
  {
    name: 'Student 3',
    email: 'student.3@hotmail.com',
    linkedin: 'https://linkedin.com/in/student3',
  },
  {
    name: 'Student 4',
    email: 'student.4@outlook.com',
    linkedin: 'https://linkedin.com/in/student4',
  },
  {
    name: 'Student 5',
    email: 'student.5@gmail.com',
    linkedin: 'https://linkedin.com/in/student5',
  },
])
</script>

<template>
  <div class="mx-auto p-8">
    <!-- Who We Are Section -->
    <section class="mb-8 text-textPrimary">
      <h2 class="text-3xl font-bold mb-4">Who We Are</h2>
      <p class="text-lg leading-relaxed">
        We are a bootcamp with name CTA located in Vushtrri, Kosovo, proudly representing the 2025
        generation. We have embraced this unique opportunity to explore the vast world of technology
        and provide comprehensive training in modern web development.
      </p>
    </section>

    <!-- Our Journey Section -->
    <section class="mb-8 text-textPrimary">
      <h2 class="text-3xl font-bold mb-4">Our Journey</h2>
      <p class="text-lg leading-relaxed mb-4">
        With the invaluable guidance of experienced programmers, <strong>Valdrin Nasufi</strong> and
        <strong>Almedin Nasufi</strong>, we embarked on a mission to create a full-stack web
        application. This project is a culmination of the knowledge and skills we've acquired
        throughout our bootcamp training.
      </p>
      <p class="text-lg leading-relaxed mb-4">
        To enhance efficiency and creativity during development, we also leveraged cutting-edge AI
        technologies like ChatGPT and Microsoft Copilot. These tools helped us:
      </p>
      <ul class="list-disc list-inside space-y-2 text-lg ml-4">
        <li>Generate smart and efficient prompts.</li>
        <li>Optimize code and problem-solving.</li>
        <li>Streamline the learning process and create a more innovative platform.</li>
      </ul>
    </section>

    <!-- Our Vision Section -->
    <section class="mb-8 text-textPrimary">
      <h2 class="text-3xl font-bold mb-4">Our Vision</h2>
      <p class="text-lg leading-relaxed mb-4">
        This platform, LM Academy (Learn More Academy), serves as a testament to our learning
        journey. It aims to:
      </p>
      <ul class="list-disc list-inside space-y-2 text-lg ml-4">
        <li>
          Introduce students to modern web technologies such as Laravel, Vue.js, REST API, JWT
          Authentication, Tailwind CSS, and MariaDB.
        </li>
        <li>Implement Agile methodologies like Jira for efficient project management.</li>
        <li>
          Provide a hands-on platform for students to test and hone their skills in web development.
        </li>
      </ul>
    </section>

    <!-- How It Works Section -->
    <section class="mb-8 text-textPrimary">
      <h2 class="text-3xl font-bold mb-4">How It Works</h2>
      <ul class="list-disc list-inside space-y-2 text-lg ml-4">
        <li>User Management: Register and manage accounts for students and teachers.</li>
        <li>
          Course Management: Students can enroll in courses, access materials, and track progress.
        </li>
        <li>
          Scoreboard:
          <ul class="list-disc list-inside space-y-1 text-base ml-6 mt-2">
            <li>Earn points for course completions and tasks.</li>
            <li>Compete with peers for the top spot on the leaderboard.</li>
            <li>Celebrate achievements and foster a sense of friendly competition.</li>
          </ul>
        </li>
      </ul>
    </section>

    <!-- Meet the Team Section -->
    <section class="mb-8">
      <h2 class="text-3xl font-bold mb-6">Meet the Team</h2>

      <!-- Mentors -->
      <div class="mb-6">
        <div class="bg-white rounded-md p-6 shadow-sm">
          <h3 class="text-xl font-bold text-center mb-4 text-textPrimary">Mentors</h3>
          <hr class="border-black mb-4" />
          <div class="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div
              v-for="(mentor, index) in mentors"
              :key="mentor.email"
              class="text-center py-2"
              :class="{
                'md:border-r border-gray-400': (index + 1) % 3 !== 0,
                'border-b border-gray-400': index < mentors.length - 1,
                'md:border-b-0':
                  index >= mentors.length - (mentors.length % 3 === 0 ? 3 : mentors.length % 3),
              }"
            >
              <a
                :href="mentor.linkedin"
                target="_blank"
                class="text-xs text-blue-500 hover:text-blue-700 mt-1 inline-block"
              >
                <p class="font-medium text-lg text-blue-600">{{ mentor.name }}</p>
              </a>
              <p class="text-sm text-textPrimary">({{ mentor.email }})</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Students -->
      <div>
        <div class="bg-white rounded-md p-6 shadow-sm">
          <h3 class="text-xl font-bold text-center mb-4 text-textPrimary">Students</h3>
          <hr class="border-black mb-4" />
          <div class="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div
              v-for="(student, index) in students"
              :key="student.email"
              class="text-center py-2"
              :class="{
                'md:border-r border-gray-400': (index + 1) % 3 !== 0,
                'border-b border-gray-400': index < students.length - 1,
                'md:border-b-0':
                  index >= students.length - (students.length % 3 === 0 ? 3 : students.length % 3),
              }"
            >
              <a
                :href="student.linkedin"
                target="_blank"
                class="text-xs text-blue-500 hover:text-blue-700 mt-1 inline-block"
              >
                <p class="font-medium text-lg text-blue-600">{{ student.name }}</p>
              </a>
              <p class="text-sm text-textPrimary">({{ student.email }})</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
