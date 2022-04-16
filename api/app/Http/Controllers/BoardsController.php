<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class BoardsController extends Controller
{
    public function index() {
        return request()->user()->boards;
    }

    public function store() {
        return Board::create([
            'name' => request()->get('name'),
            'categories' => request()->get('categories')
        ]);
    }

    public function show(Board $board) {
        return $board->with('categories');
    }

    public function update(Board $board) {
        return $board->update([
            'name' => request()->get('name')
        ])
    }

    public function destroy(Board $board) {
        return $board->delete();
    }
}
