"""
Performance monitoring module for CampoCode Forge Backend

This module provides performance monitoring and metrics collection including:
- Request timing
- Database query performance
- Memory usage
- Response time tracking
- Performance alerts

Author: CampoCode Forge Team
"""

import time
import psutil
import threading
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from collections import defaultdict, deque
import logging
from contextlib import contextmanager
from dataclasses import dataclass, field
from statistics import mean, median, stdev

logger = logging.getLogger(__name__)

@dataclass
class PerformanceMetrics:
    """Performance metrics data class."""
    
    endpoint: str
    method: str
    response_time: float
    status_code: int
    timestamp: datetime = field(default_factory=datetime.utcnow)
    user_id: Optional[int] = None
    error_message: Optional[str] = None

@dataclass
class SystemMetrics:
    """System performance metrics."""
    
    cpu_percent: float
    memory_percent: float
    memory_used_mb: float
    disk_usage_percent: float
    timestamp: datetime = field(default_factory=datetime.utcnow)

class PerformanceMonitor:
    """Performance monitoring and metrics collection."""
    
    def __init__(self, max_history: int = 1000):
        self.max_history = max_history
        self.request_metrics: deque = deque(maxlen=max_history)
        self.system_metrics: deque = deque(maxlen=max_history)
        self.endpoint_stats: Dict[str, Dict] = defaultdict(lambda: {
            'count': 0,
            'total_time': 0.0,
            'errors': 0,
            'response_times': deque(maxlen=100)
        })
        self.lock = threading.Lock()
        
        # Performance thresholds
        self.slow_request_threshold = 1.0  # seconds
        self.error_rate_threshold = 0.1    # 10%
        self.memory_threshold = 80.0       # percent
        self.cpu_threshold = 80.0          # percent
    
    def record_request(self, metrics: PerformanceMetrics):
        """Record a request performance metric."""
        with self.lock:
            self.request_metrics.append(metrics)
            
            # Update endpoint statistics
            endpoint_key = f"{metrics.method} {metrics.endpoint}"
            stats = self.endpoint_stats[endpoint_key]
            stats['count'] += 1
            stats['total_time'] += metrics.response_time
            stats['response_times'].append(metrics.response_time)
            
            if metrics.status_code >= 400:
                stats['errors'] += 1
            
            # Check for slow requests
            if metrics.response_time > self.slow_request_threshold:
                logger.warning(
                    f"Slow request detected: {endpoint_key} took {metrics.response_time:.2f}s"
                )
            
            # Check for errors
            if metrics.error_message:
                logger.error(f"Request error: {endpoint_key} - {metrics.error_message}")
    
    def record_system_metrics(self):
        """Record current system metrics."""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            metrics = SystemMetrics(
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                memory_used_mb=memory.used / (1024 * 1024),
                disk_usage_percent=disk.percent
            )
            
            with self.lock:
                self.system_metrics.append(metrics)
            
            # Check thresholds
            if cpu_percent > self.cpu_threshold:
                logger.warning(f"High CPU usage: {cpu_percent:.1f}%")
            
            if memory.percent > self.memory_threshold:
                logger.warning(f"High memory usage: {memory.percent:.1f}%")
                
        except Exception as e:
            logger.error(f"Error recording system metrics: {e}")
    
    def get_endpoint_stats(self, endpoint: Optional[str] = None) -> Dict[str, Any]:
        """Get statistics for specific endpoint or all endpoints."""
        with self.lock:
            if endpoint:
                stats = self.endpoint_stats.get(endpoint, {})
                return self._calculate_stats(stats)
            else:
                return {
                    endpoint: self._calculate_stats(stats)
                    for endpoint, stats in self.endpoint_stats.items()
                }
    
    def _calculate_stats(self, stats: Dict) -> Dict[str, Any]:
        """Calculate statistics from raw data."""
        if not stats['response_times']:
            return {
                'count': 0,
                'avg_response_time': 0.0,
                'median_response_time': 0.0,
                'min_response_time': 0.0,
                'max_response_time': 0.0,
                'error_rate': 0.0,
                'total_time': 0.0
            }
        
        response_times = list(stats['response_times'])
        error_rate = stats['errors'] / stats['count'] if stats['count'] > 0 else 0.0
        
        return {
            'count': stats['count'],
            'avg_response_time': mean(response_times),
            'median_response_time': median(response_times),
            'min_response_time': min(response_times),
            'max_response_time': max(response_times),
            'std_deviation': stdev(response_times) if len(response_times) > 1 else 0.0,
            'error_rate': error_rate,
            'total_time': stats['total_time']
        }
    
    def get_system_stats(self, minutes: int = 5) -> Dict[str, Any]:
        """Get system statistics for the last N minutes."""
        with self.lock:
            cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
            recent_metrics = [
                m for m in self.system_metrics
                if m.timestamp > cutoff_time
            ]
            
            if not recent_metrics:
                return {
                    'cpu_avg': 0.0,
                    'memory_avg': 0.0,
                    'disk_avg': 0.0,
                    'sample_count': 0
                }
            
            return {
                'cpu_avg': mean(m.cpu_percent for m in recent_metrics),
                'memory_avg': mean(m.memory_percent for m in recent_metrics),
                'disk_avg': mean(m.disk_usage_percent for m in recent_metrics),
                'memory_used_mb_avg': mean(m.memory_used_mb for m in recent_metrics),
                'sample_count': len(recent_metrics)
            }
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get overall performance summary."""
        with self.lock:
            total_requests = sum(stats['count'] for stats in self.endpoint_stats.values())
            total_errors = sum(stats['errors'] for stats in self.endpoint_stats.values())
            total_time = sum(stats['total_time'] for stats in self.endpoint_stats.values())
            
            all_response_times = []
            for stats in self.endpoint_stats.values():
                all_response_times.extend(stats['response_times'])
            
            return {
                'total_requests': total_requests,
                'total_errors': total_errors,
                'overall_error_rate': total_errors / total_requests if total_requests > 0 else 0.0,
                'avg_response_time': mean(all_response_times) if all_response_times else 0.0,
                'total_time': total_time,
                'endpoint_count': len(self.endpoint_stats),
                'system_stats': self.get_system_stats()
            }

class PerformanceMiddleware:
    """FastAPI middleware for performance monitoring."""
    
    def __init__(self, monitor: PerformanceMonitor):
        self.monitor = monitor
    
    async def __call__(self, request, call_next):
        start_time = time.time()
        
        try:
            response = await call_next(request)
            response_time = time.time() - start_time
            
            metrics = PerformanceMetrics(
                endpoint=str(request.url.path),
                method=request.method,
                response_time=response_time,
                status_code=response.status_code
            )
            
            self.monitor.record_request(metrics)
            return response
            
        except Exception as e:
            response_time = time.time() - start_time
            
            metrics = PerformanceMetrics(
                endpoint=str(request.url.path),
                method=request.method,
                response_time=response_time,
                status_code=500,
                error_message=str(e)
            )
            
            self.monitor.record_request(metrics)
            raise

@contextmanager
def performance_timer(operation_name: str, monitor: Optional[PerformanceMonitor] = None):
    """Context manager for timing operations."""
    start_time = time.time()
    try:
        yield
    except Exception as e:
        if monitor:
            metrics = PerformanceMetrics(
                endpoint=operation_name,
                method="INTERNAL",
                response_time=time.time() - start_time,
                status_code=500,
                error_message=str(e)
            )
            monitor.record_request(metrics)
        raise
    else:
        if monitor:
            metrics = PerformanceMetrics(
                endpoint=operation_name,
                method="INTERNAL",
                response_time=time.time() - start_time,
                status_code=200
            )
            monitor.record_request(metrics)

class DatabasePerformanceMonitor:
    """Database performance monitoring."""
    
    def __init__(self, monitor: PerformanceMonitor):
        self.monitor = monitor
    
    def monitor_query(self, query_func):
        """Decorator to monitor database query performance."""
        def wrapper(*args, **kwargs):
            with performance_timer("database_query", self.monitor):
                return query_func(*args, **kwargs)
        return wrapper

# Global performance monitor instance
performance_monitor = PerformanceMonitor()

def start_system_monitoring(interval: int = 60):
    """Start periodic system monitoring."""
    def monitor_loop():
        while True:
            try:
                performance_monitor.record_system_metrics()
                time.sleep(interval)
            except Exception as e:
                logger.error(f"Error in system monitoring: {e}")
                time.sleep(interval)
    
    monitor_thread = threading.Thread(target=monitor_loop, daemon=True)
    monitor_thread.start()
    logger.info(f"System monitoring started with {interval}s interval")

def get_performance_dashboard_data() -> Dict[str, Any]:
    """Get data for performance dashboard."""
    return {
        'summary': performance_monitor.get_performance_summary(),
        'endpoints': performance_monitor.get_endpoint_stats(),
        'system': performance_monitor.get_system_stats(),
        'recent_requests': list(performance_monitor.request_metrics)[-10:],
        'timestamp': datetime.utcnow().isoformat()
    }
