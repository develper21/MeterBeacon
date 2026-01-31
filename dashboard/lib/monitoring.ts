import { logger } from './logger'

// Performance monitoring
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map()

  static startTimer(name: string): void {
    this.timers.set(name, Date.now())
  }

  static endTimer(name: string): number {
    const startTime = this.timers.get(name)
    if (!startTime) {
      logger.warn(`Timer '${name}' was not started`)
      return 0
    }

    const duration = Date.now() - startTime
    this.timers.delete(name)

    logger.info({
      event: 'performance_metric',
      metric: name,
      duration,
      timestamp: new Date().toISOString(),
    })

    return duration
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(name)
    try {
      const result = await fn()
      this.endTimer(name)
      return result
    } catch (error) {
      this.endTimer(name)
      throw error
    }
  }
}

// Health check utilities
export class HealthChecker {
  static checks: Map<string, () => Promise<boolean>> = new Map()

  static addCheck(name: string, checkFn: () => Promise<boolean>): void {
    this.checks.set(name, checkFn)
  }

  static async runHealthChecks(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {}
    
    for (const [name, checkFn] of this.checks) {
      try {
        results[name] = await checkFn()
      } catch (error) {
        logger.error(`Health check '${name}' failed: ${String(error)}`)
        results[name] = false
      }
    }

    logger.info({
      event: 'health_check_completed',
      results,
      timestamp: new Date().toISOString(),
    })

    return results
  }
}

// Metrics collection
export class MetricsCollector {
  private static counters: Map<string, number> = new Map()
  private static gauges: Map<string, number> = new Map()

  static incrementCounter(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0
    this.counters.set(name, current + value)

    logger.info({
      event: 'metric_counter',
      name,
      value: current + value,
      timestamp: new Date().toISOString(),
    })
  }

  static setGauge(name: string, value: number): void {
    this.gauges.set(name, value)

    logger.info({
      event: 'metric_gauge',
      name,
      value,
      timestamp: new Date().toISOString(),
    })
  }

  static getMetrics(): { counters: { [key: string]: number }, gauges: { [key: string]: number } } {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
    }
  }
}

// Alert system
export class AlertManager {
  static thresholds: Map<string, { value: number; operator: 'gt' | 'lt'; message: string }> = new Map()

  static setThreshold(name: string, value: number, operator: 'gt' | 'lt', message: string): void {
    this.thresholds.set(name, { value, operator, message })
  }

  static checkThresholds(metrics: { [key: string]: number }): void {
    for (const [name, threshold] of this.thresholds) {
      const metricValue = metrics[name]
      if (metricValue === undefined) continue

      const isTriggered = threshold.operator === 'gt' 
        ? metricValue > threshold.value 
        : metricValue < threshold.value

      if (isTriggered) {
        logger.warn({
          event: 'alert_triggered',
          metric: name,
          value: metricValue,
          threshold: threshold.value,
          operator: threshold.operator,
          message: threshold.message,
          timestamp: new Date().toISOString(),
        })
      }
    }
  }
}

// Initialize default health checks
HealthChecker.addCheck('database', async () => {
  try {
    // Add database connectivity check here
    return true
  } catch {
    return false
  }
})

// Initialize default thresholds
AlertManager.setThreshold('error_rate', 0.05, 'gt', 'High error rate detected')
AlertManager.setThreshold('response_time', 5000, 'gt', 'Slow response time detected')
AlertManager.setThreshold('battery_level', 20, 'lt', 'Low battery detected')
