<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBoardRequest extends FormRequest
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
            'x_position' => 'required|numeric',
            'y_position' => 'required|numeric',
            'width' => 'required|numeric',
            'height' => 'required|numeric',
            'heroes.*.id' => 'required|exists:heroes',
        ];
    }
}
