<template>
  <PageLayout :title="t('file_manager.title')" contentClass="!p-0">
    <!-- Connection Status -->
    <div v-if="connectionError" class="p-4 bg-red-50 border-b border-red-200">
      <div class="flex items-center text-red-700">
        <ExclamationTriangleIcon class="h-5 w-5 mr-2" />
        <span>{{ t('file_manager.connection_error') }}: {{ connectionError }}</span>
        <button 
          @click="retryConnection" 
          class="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          {{ t('file_manager.retry') }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">{{ t('file_manager.loading') }}</p>
      </div>
    </div>

    <!-- File Manager Frame -->
    <div v-else class="relative h-full">
      <!-- Toolbar -->
      <div class="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div class="flex items-center space-x-4">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ t('file_manager.title') }}
          </h2>
          <div class="flex items-center space-x-2 text-sm text-gray-600">
            <div class="flex items-center">
              <div 
                :class="[
                  'w-2 h-2 rounded-full mr-2',
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              {{ isConnected ? t('file_manager.connected') : t('file_manager.disconnected') }}
            </div>
          </div>
        </div>
        
        <div class="flex items-center space-x-2">
          <button
            @click="refreshFrame"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            :title="t('file_manager.refresh')"
          >
            <ArrowPathIcon class="h-5 w-5" />
          </button>
          
          <button
            @click="toggleFullscreen"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            :title="isFullscreen ? t('file_manager.exit_fullscreen') : t('file_manager.fullscreen')"
          >
            <component :is="isFullscreen ? 'ArrowsPointingInIcon' : 'ArrowsPointingOutIcon'" class="h-5 w-5" />
          </button>
          
          <button
            @click="openInNewTab"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
            :title="t('file_manager.open_new_tab')"
          >
            <ArrowTopRightOnSquareIcon class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- File Manager iframe -->
      <iframe
        ref="fileManagerFrame"
        :src="fileManagerUrl"
        class="w-full border-0"
        :class="isFullscreen ? 'h-screen' : 'h-[calc(100vh-200px)]'"
        frameborder="0"
        @load="onFrameLoad"
        @error="onFrameError"
      />
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useApiStore } from '@/stores/api';
import { 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline';

// Composables
const { t } = useI18n();
const apiStore = useApiStore();

// Reactive state
const loading = ref(true);
const connectionError = ref('');
const isConnected = ref(false);
const isFullscreen = ref(false);
const fileManagerFrame = ref<HTMLIFrameElement>();

// Computed properties
const fileManagerUrl = computed(() => {
  const baseUrl = apiStore.baseUrl || window.location.origin;
  return `${baseUrl}/filemanager`;
});

// Methods
const onFrameLoad = () => {
  loading.value = false;
  connectionError.value = '';
  isConnected.value = true;
  
  // Pass authentication context to iframe if needed
  if (fileManagerFrame.value?.contentWindow) {
    try {
      fileManagerFrame.value.contentWindow.postMessage({
        type: 'unraid-auth',
        token: apiStore.token,
        user: apiStore.user,
        permissions: apiStore.user?.permissions || {}
      }, '*');
    } catch (error) {
      console.warn('Could not post message to iframe:', error);
    }
  }
};

const onFrameError = () => {
  loading.value = false;
  connectionError.value = t('file_manager.failed_to_load');
  isConnected.value = false;
};

const retryConnection = () => {
  loading.value = true;
  connectionError.value = '';
  
  if (fileManagerFrame.value) {
    fileManagerFrame.value.src = fileManagerUrl.value;
  }
};

const refreshFrame = () => {
  if (fileManagerFrame.value) {
    fileManagerFrame.value.src = fileManagerFrame.value.src;
  }
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  
  // Handle browser fullscreen API
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
};

const openInNewTab = () => {
  window.open(fileManagerUrl.value, '_blank', 'noopener,noreferrer');
};

// Check connection status periodically
const checkConnection = async () => {
  try {
    const response = await fetch(`${fileManagerUrl.value}/health`);
    isConnected.value = response.ok;
    
    if (!response.ok) {
      connectionError.value = t('file_manager.service_unavailable');
    }
  } catch (error) {
    isConnected.value = false;
    connectionError.value = t('file_manager.connection_failed');
  }
};

// Lifecycle
let connectionInterval: number;

onMounted(() => {
  // Check connection status every 30 seconds
  connectionInterval = setInterval(checkConnection, 30000);
  
  // Initial connection check
  checkConnection();
  
  // Handle fullscreen change events
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement;
  });
});

onUnmounted(() => {
  if (connectionInterval) {
    clearInterval(connectionInterval);
  }
});

// Handle messages from iframe
window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) {
    return;
  }
  
  if (event.data.type === 'filemanager-ready') {
    isConnected.value = true;
    connectionError.value = '';
  }
});
</script>

<style scoped>
/* Custom styles for the file manager */
.file-manager-container {
  height: calc(100vh - 120px);
}

/* Fullscreen styles */
.fullscreen-iframe {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: white;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>