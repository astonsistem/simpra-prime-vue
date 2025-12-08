<script setup>
import { ref, onMounted } from "vue";
import api from "@/services/http.js";

const folders = ref([]);
const openFolder = ref(null);

const isOpen = (group) => openFolder.value === group;

const toggle = (group) => {
  openFolder.value = openFolder.value === group ? null : group;
};

onMounted(async () => {
  const { data } = await api.get("/pelaporan-list");

  // Format to group-by "group"
  const map = {};
  data.data.forEach((item) => {
    if (!map[item.group]) map[item.group] = [];
    map[item.group].push({ label: item.label, to: item.to });
  });

  folders.value = Object.keys(map).map((group) => ({
    group,
    name: group,
    items: map[group],
  }));
});
</script>

<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Pelaporan</h2>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
      <!-- Folder -->
      <div
        v-for="folder in folders"
        :key="folder.group"
        class="p-4 border rounded-xl bg-surface-0 dark:bg-surface-900 shadow cursor-pointer transition h-auto"
        @click="toggle(folder.group)"
      >
        <!-- Folder icon and name -->
        <div class="flex flex-col items-center">
          <i
            :class="[
              'pi text-5xl mb-3 transition',
              isOpen(folder.group)
                ? 'pi-folder-open text-yellow-600'
                : 'pi-folder text-yellow-500'
            ]"
          ></i>

          <p
            class="font-semibold text-center transition"
            :class="isOpen(folder.group) ? 'text-blue-600' : ''"
          >
            {{ folder.name }}
          </p>
        </div>

        <!-- Dropdown submenu inside the same folder -->
        <transition name="fade">
          <ol
            v-if="isOpen(folder.group)"
            class="mt-4 text-sm border-t pt-3 list-decimal ml-5 space-y-1"
          >
            <li
              v-for="item in folder.items"
              :key="item.to"
            >
              <RouterLink
                :to="item.to"
                class="hover:underline"
                @click.stop
              >
                {{ item.label }}
              </RouterLink>
            </li>
          </ol>
        </transition>
      </div>
    </div>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>