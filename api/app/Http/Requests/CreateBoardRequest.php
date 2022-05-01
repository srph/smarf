<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateBoardRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name' => 'required',
            'categories.*.name' => 'required',
            'categories.*.x_position' => 'required|numeric',
            'categories.*.y_position' => 'required|numeric',
            'categories.*.width' => 'required|numeric',
            'categories.*.height' => 'required|numeric',
            'categories.*.heroes.*.id' => 'required|exists:heroes',
            'categories.*.heroes.*.order' => 'required|numeric',
        ];
    }
}
