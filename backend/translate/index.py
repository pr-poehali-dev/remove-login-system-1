import json
import os
from typing import Dict, Any
import httpx

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Профессионально переводит текст модов с английского на русский для игр TES Skyrim и Ведьмак 3
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами: request_id, function_name, function_version
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    text_to_translate = body_data.get('text', '')
    
    if not text_to_translate:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Текст не предоставлен'})
        }
    
    system_prompt = """Ты профессиональный переводчик игровых модов для TES Skyrim и The Witcher 3.

Правила перевода:
1. Сохраняй игровую терминологию и атмосферу оригинальных игр
2. Используй официальную русскую локализацию для известных названий локаций, персонажей, предметов
3. Адаптируй текст под стиль и лор игры
4. Сохраняй форматирование и специальные символы
5. Переводи естественно, избегая дословного перевода
6. Для неизвестных имён используй транслитерацию, соответствующую стилю игры
7. Сохраняй игровые команды, теги и переменные без изменений

Переведи текст с английского на русский."""

    api_key = os.environ.get("DEEPSEEK_API_KEY", "")
    
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'API ключ DeepSeek не настроен. Добавьте DEEPSEEK_API_KEY в секреты.'})
        }
    
    try:
        with httpx.Client(timeout=60.0) as client:
            print(f"Отправляю запрос к DeepSeek API, длина текста: {len(text_to_translate)}")
            response = client.post(
                'https://api.deepseek.com/chat/completions',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {api_key}'
                },
                json={
                    'model': 'deepseek-chat',
                    'messages': [
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': text_to_translate}
                    ],
                    'temperature': 0.3,
                    'max_tokens': 8000
                }
            )
            
            print(f"Ответ от API: статус {response.status_code}")
            
            if response.status_code != 200:
                error_text = response.text
                print(f"Ошибка API: {error_text}")
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': f'Ошибка API DeepSeek: {response.status_code} - {error_text}'})
                }
            
            result = response.json()
            translated_text = result['choices'][0]['message']['content']
            print(f"Перевод выполнен успешно, длина: {len(translated_text)}")
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'translatedText': translated_text,
                    'originalLength': len(text_to_translate),
                    'translatedLength': len(translated_text)
                }, ensure_ascii=False)
            }
    except Exception as e:
        print(f"Исключение при переводе: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Ошибка перевода: {str(e)}'})
        }