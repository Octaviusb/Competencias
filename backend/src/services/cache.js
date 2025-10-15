let Redis;
try {
  Redis = (await import('ioredis')).default;
} catch (e) {
  console.warn('Redis not available - caching disabled');
}

class CacheService {
  constructor() {
    if (!Redis) {
      this.redis = null;
      return;
    }
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retryDelayOnFailover: 100,
      lazyConnect: true
    });
  }

  async get(key) {
    if (!this.redis) return null;
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    if (!this.redis) return false;
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.redis) return false;
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache del error:', error);
      return false;
    }
  }

  cacheMiddleware(ttl = 3600) {
    return async (req, res, next) => {
      const key = `cache:${req.originalUrl}:${req.organizationId}`;
      const cached = await this.get(key);
      
      if (cached) {
        return res.json(cached);
      }

      const originalSend = res.send;
      res.send = function(data) {
        if (res.statusCode === 200) {
          cache.set(key, JSON.parse(data), ttl);
        }
        originalSend.call(this, data);
      };
      
      next();
    };
  }
}

export default new CacheService();