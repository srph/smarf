<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * This is used by Laravel authentication to redirect users after login.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Define your route model bindings, pattern filters, etc.
     *
     * @return void
     */
    public function boot()
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });

        $this->bindModels();
    }

    /**
     * Bind models on boot-up for controllers to access
     * 
     * @return void
     */
    protected function bindModels()
    {
        Route::model('user', \App\Models\User::class);
        Route::model('board', \App\Models\Board::class);
        Route::model('category', \App\Models\Category::class);

        // `hero` is implicitly the pivot id. We want those as we can have the same instance of hero in a category
        Route::bind('hero', function ($value, $route) {
            // @TODO: Make this reusable
            return $route->parameter('category')
                ->heroes()
                ->wherePivot('id', $value)
                ->firstOrFail();
        });
    }

    /**
     * Configure the rate limiters for the application.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}
