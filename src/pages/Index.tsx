import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите текст для перевода',
        variant: 'destructive',
      });
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch('https://functions.poehali.dev/b5762880-4461-498f-b0a4-869d34a41d08', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: sourceText }),
      });

      if (!response.ok) {
        throw new Error('Ошибка перевода');
      }

      const data = await response.json();
      setTranslatedText(data.translatedText);
      toast({
        title: 'Готово',
        description: 'Текст успешно переведён',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось выполнить перевод',
        variant: 'destructive',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Скопировано',
        description: 'Текст скопирован в буфер обмена',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать текст',
        variant: 'destructive',
      });
    }
  };

  const handleSourceChange = (value: string) => {
    setSourceText(value);
    setCharCount(value.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Переводчик модов</h1>
          <p className="text-muted-foreground">
            Профессиональный перевод для TES Skyrim и Ведьмак 3
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon name="Languages" size={20} className="text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">Английский</h2>
              </div>
              <span className="text-sm text-muted-foreground">{charCount} символов</span>
            </div>
            <Textarea
              value={sourceText}
              onChange={(e) => handleSourceChange(e.target.value)}
              placeholder="Вставьте текст мода на английском языке..."
              className="min-h-[400px] font-mono text-sm resize-none bg-background border-input"
            />
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="flex-1"
              >
                {isTranslating ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Перевожу...
                  </>
                ) : (
                  <>
                    <Icon name="ArrowRight" size={16} className="mr-2" />
                    Перевести
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSourceText('');
                  setCharCount(0);
                }}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon name="Languages" size={20} className="text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">Русский</h2>
              </div>
              <span className="text-sm text-muted-foreground">
                {translatedText.length} символов
              </span>
            </div>
            <Textarea
              value={translatedText}
              readOnly
              placeholder="Здесь появится перевод..."
              className="min-h-[400px] font-mono text-sm resize-none bg-background border-input"
            />
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => handleCopy(translatedText)}
                disabled={!translatedText}
                className="flex-1"
              >
                <Icon name="Copy" size={16} className="mr-2" />
                Копировать
              </Button>
              <Button
                variant="outline"
                onClick={() => setTranslatedText('')}
                disabled={!translatedText}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          </Card>
        </div>

        <Card className="mt-6 p-6 bg-card">
          <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <Icon name="Info" size={20} className="text-primary" />
            Особенности перевода
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Icon name="Check" size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Сохранение игровой терминологии и названий локаций</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Адаптация под стиль оригинальных игр</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Корректная передача имён персонажей и квестов</span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="Check" size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Без ограничений по количеству символов</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Index;