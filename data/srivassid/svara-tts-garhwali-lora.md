# srivassid/svara-tts-garhwali-lora

## Resumen

Svara-TTS Garhwali (LoRA) es un adaptador PEFT publicado por el usuario `srivassid` que especializa el modelo base `kenpath/svara-tts-v1` para sintetizar voz en garhwali (गढ़वाली, código ISO `gbm`), una lengua indoaria hablada en Uttarakhand (India) que no dispone de sintetizadores de voz de calidad en la mayoría de stacks comerciales. El adaptador añade diez voces garhwali (`spk02` a `spk16`) al modelo base y conserva las voces en hindi e inglés indio, así como las etiquetas de emoción en hindi.

El modelo base Svara es un transformer tipo Llama-3.2-3B con un esquema de generación estilo Orpheus: en lugar de producir audio directamente, emite tokens de audio SNAC a 24 kHz que después se decodifican a forma de onda. El adaptador LoRA (r=64, alpha=64) se entrena únicamente sobre la pérdida de los tokens de audio, con 97 M de parámetros entrenables, y se distribuye como safetensors de 0,4 GB bajo licencia Apache-2.0.

Su relevancia es doble: por un lado, demuestra que es posible dotar de una voz nueva a un TTS multilingüe con un coste de entrenamiento muy bajo (unas 3,2 horas en 2× RTX 3080); por otro, aporta una evaluación objetiva (CER medido con ASR sobre hablantes no vistos) que sitúa la inteligibilidad del garhwali sintetizado cerca de la de grabaciones reales de las mismas frases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama-3.2-3B con salida de tokens de audio SNAC 24 kHz (estilo Orpheus) |
| Parametros totales | No disponible para el adaptador; el modelo base es de 3B. El adaptador entrena 97 M de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Garhwali (`gbm`, escritura devanagari), hindi (`hi`), inglés indio (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `kenpath/svara-tts-v1`, un modelo Llama-3.2-3B adaptado al paradigma de TTS discreto de Orpheus: el modelo recibe un prompt con marcadores especiales (`[BOS][START_OF_HUMAN][AUDIO] "{voice}: {text}" [END_OF_HUMAN][END_OF_TURN][START_OF_AI][START_OF_SPEECH]`) y genera siete tokens de audio por cada frame SNAC, terminando con `END_OF_SPEECH`. La decodificación SNAC reconstruye audio a 24 kHz. El LoRA se inserta en las proyecciones q/k/v/o y en gate/up/down del MLP, con r=64, alpha=64 y dropout 0,05, y la pérdida se calcula exclusivamente sobre los tokens de audio.

El entrenamiento consistió en 647 pasos (cinco pasadas sobre los datos garhwali), con batch efectivo de 48 clips, AdamW a lr 1e-4 y decaimiento coseno hasta el 10 %, ejecutado en 2× RTX 3080 de 20 GB durante aproximadamente 3,2 horas. La mezcla de datos fue 60 % garhwali, 25 % hindi y 15 % inglés. El garhwali procede de `facebook/omnilingual-asr-corpus` (config `gbm_Deva`): 7,59 h, 3.707 segmentos y 10 hablantes, segmentados por alineamiento forzado CTC con `omniasr-ctc-1b` y filtrados por confianza de alineamiento, longitud y tasa de error de caracteres; se descartaron tres hablantes por desajuste entre transcripción y audio. El hindi proviene de `ai4bharat/Rasa` (7,62 h, con estilos emocionales) y el inglés indio (3,9 h) se generó con el propio modelo base a partir de transcripciones de clases, conservando solo clips con CER ≤ 0,15 al re-transcribirlos. El checkpoint final se eligió por evaluación proxy de escucha frente al de menor pérdida de validación (paso 100).

## Capacidades

- Síntesis de voz (text-to-speech) en garhwali con diez voces identificadas: `spk02`, `spk04`, `spk05`, `spk06`, `spk07`, `spk08`, `spk09`, `spk10`, `spk12` y `spk16`; las más claras según el autor son `spk04`, `spk05` y `spk08`.
- Síntesis en hindi con dos voces (`Hindi (Female)`, `Hindi (Male)`) y etiquetas de emoción a final de frase: `<happy>`, `<sad>`, `<anger>`, `<fear>`, `<surprise>`.
- Síntesis en inglés indio con dos voces (`English (Indian) (Female)`, `English (Indian) (Male)`).
- Entrada de texto en devanagari para garhwali; el autor advierte de que los números deben escribirse con palabras porque el corpus de entrenamiento no contenía dígitos.
- Control de velocidad implícito: las voces garhwali hablan despacio (5–8 caracteres por segundo), por lo que se recomienda presupuestar unos 16 tokens nuevos por carácter de entrada.
- No se documentan tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es un modelo exclusivamente de texto a voz.

## Casos de uso

- Accesibilidad y lectura en garhwali: convertir textos administrativos, educativos o sanitarios en audio para hablantes de garhwali con baja alfabetización, usando las voces `spk04`/`spk05`/`spk08` por su claridad.
- Preservación lingüística: generar corpus de audio sintético en garhwali para documentación, diccionarios hablados o materiales didácticos, dado que el modelo alcanza un CER medio de 0,26 frente a 0,39 del modelo base con voces hindi.
- Asistentes de voz locales: integrar el adaptador en un pipeline TTS para aplicaciones de atención ciudadana en Uttarakhand, combinándolo con ASR en garhwali para interacción por voz.
- Doblaje y locución de bajo coste: producir narraciones en hindi con control emocional (`<happy>`, `<anger>`, etc.) y en inglés indio para vídeos formativos o pódcasts, reutilizando las voces del modelo base.
- Investigación en TTS de bajos recursos: servir como referencia reproducible de adaptación LoRA sobre un TTS de 3B con solo 7,59 h de audio en la lengua objetivo y 3,2 h de entrenamiento en GPUs de consumo.
- Pruebas de calidad y evaluación ASR: generar audio sintético controlado en garhwali para evaluar sistemas de reconocimiento de voz o para aumentar datasets de ASR en la lengua.
- Prototipado de interfaces conversacionales multilingües: un único adaptador cubre garhwali, hindi e inglés indio, lo que simplifica el despliegue de un TTS con tres idiomas en una sola pila.

## Benchmarks y rendimiento

Evaluación del autor: se generó voz a partir de texto no visto y se transcribió con `omniasr-ctc-1b`; la métrica es CER (menor es mejor), sin espacios ni puntuación. Garhwali: 200 frases de 2 hablantes nunca vistos, leídas por las 4 mejores voces ajustadas; el modelo base las lee con sus voces hindi. Hindi e inglés: 100 frases retenidas cada uno.

| Sistema | CER mediana garhwali | CER media garhwali | Garhwali CER > 0,5 | Hindi mediana | Inglés mediana |
|---|---|---|---|---|---|
| Grabaciones reales de las mismas frases | 0,18 | 0,18 | n/a | n/a | n/a |
| Svara base (voces hindi) | 0,19 | 0,39 | 29 % | 0,038 | 0,043 |
| **Este adaptador** | 0,24 | **0,26** | **3 %** | 0,040 | 0,040 |

El adaptador reduce drásticamente la proporción de salidas ininteligibles (del 29 % al 3 %) y mantiene la calidad en hindi e inglés sin degradación apreciable. El autor señala que el CER no captura el acento.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,4 GB; el modelo base Svara (3B) debe cargarse aparte, por lo que la VRAM total depende de la precisión de carga del base (no se especifica en la información disponible).
- Entrenamiento validado en 2× RTX 3080 de 20 GB durante unas 3,2 horas, lo que indica que el ajuste es viable en GPUs de consumo de gama alta.
- Para inferencia se requiere cargar un modelo de 3B más el decodificador SNAC; no se publican cifras de VRAM ni de latencia/throughput.
- Opciones de despliegue: el autor proporciona `infer.py` con `torch`, `transformers`, `peft`, `snac` y `soundfile`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Parámetros de muestreo por defecto: temperatura 0,75, top-p 0,9, top-k 40, penalización de repetición 1,1.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Svara-TTS Garhwali (LoRA) | LoRA sobre TTS Llama-3.2-3B | 97 M entrenables (base 3B) | garhwali, hindi, inglés indio | Apache-2.0 | Adaptador específico para garhwali con evaluación CER publicada |
| kenpath/svara-tts-v1 | TTS Llama-3.2-3B | 3B | hindi, inglés indio (sin garhwali) | No disponible en la información | Modelo base; en garhwali produce 29 % de salidas con CER > 0,5 |
| Otros TTS multilingües open source (p. ej. XTTS, Bark) | TTS neuronales | Variable | Multilingüe, sin garhwali documentado | Variable | No se dispone de comparación directa en garhwali en la información proporcionada |

No se han publicado en la información disponible comparaciones con otros TTS que cubran garhwali; la referencia más directa es el propio modelo base.

## Limitaciones y advertencias

- El CER no mide acento ni naturalidad; el autor advierte explícitamente de que la métrica no captura el acento, por lo que la calidad percibida puede diferir de la inteligibilidad medida.
- Las voces garhwali hablan despacio (5–8 caracteres por segundo), lo que puede requerir presupuesto de generación amplio y producir audio más largo que el de referencia.
- El texto de entrada debe escribirse en devanagari para garhwali y sin dígitos (números con palabras), porque el corpus de entrenamiento no contenía cifras.
- Solo se entrenó con 10 hablantes de garhwali (7,59 h); la cobertura de variedades dialectales y de género dentro del garhwali es limitada y no se detalla.
- El adaptador conserva las voces hindi e inglés del base, pero no se documenta su comportamiento fuera de los estilos y acentos vistos en entrenamiento.
- Riesgo de alucinación o artefactos en entradas fuera de distribución (texto muy largo, caracteres latinos mezclados con devanagari, puntuación atípica); el autor no publica análisis de fallos más allá del CER.
- Licencia Apache-2.0 para el adaptador; deben verificarse por separado las licencias del modelo base `kenpath/svara-tts-v1`, del corpus `facebook/omnilingual-asr-corpus` y de `ai4bharat/Rasa` antes de un uso comercial.
- No se documentan sesgos demográficos ni evaluaciones de seguridad; al ser un TTS, existe riesgo de uso para suplantación de voz o desinformación audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/srivassid/svara-tts-garhwali-lora
- Modelo base: https://huggingface.co/kenpath/svara-tts-v1
- Codec SNAC 24 kHz: https://huggingface.co/hubertsiuzdak/snac_24khz
- Dataset garhwali: https://huggingface.co/datasets/facebook/omnilingual-asr-corpus
- Dataset hindi: https://huggingface.co/datasets/ai4bharat/Rasa
- Paper referenciado (arXiv:2511.09690): https://arxiv.org/abs/2511.09690
- Script de inferencia: `infer.py` incluido en el repositorio del modelo
