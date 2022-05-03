<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReorderHeroRequest extends FormRequest
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
            'from_category_height' => 'required|numeric',
            'to_category_id' => 'required|exists:categories,id',
            'to_category_height' => 'required|numeric',
            'hero_order' => 'required|numeric'
        ];
    }
}
