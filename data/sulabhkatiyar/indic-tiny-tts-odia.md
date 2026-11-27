# sulabhkatiyar/indic-tiny-tts-odia

## Resumen

Indic Tiny TTS: Odia es un modelo de síntesis de voz (text-to-speech) entrenado específicamente para el idioma odia (oriya), una lengua indoaria hablada principalmente en el estado indio de Odisha por unos 35 millones de personas. Lo desarrolla sulabhkatiyar como parte de la colección "Indic Tiny TTS Models", un conjunto de doce modelos minúsculos, uno por idioma, que cubren once lenguas indias y el inglés indio. El modelo convierte texto en escritura odia en audio inteligible con dos voces disponibles, femenina y masculina.

La propuesta central del modelo es la eficiencia extrema: con solo 8,9 millones de parámetros en los pesos safetensors (la model card cita 22,5 millones de parámetros para el conjunto del sistema), ofrece una tasa de error de carácter (CER) del 2,68 % en frases periodísticas de FLORES-200, comparable a modelos entre 3 y 40 veces más grandes como IndicF5 o indic-parler-tts. Está diseñado para ejecutarse en CPU sin GPU, con un factor de tiempo real de 0,026 en un hilo de CPU Apple M1 (38 veces más rápido que tiempo real) y 0,136 en un hilo x86 (7 veces más rápido).

El modelo es relevante ahora porque demuestra que la síntesis de voz de calidad aceptable para lenguas de bajos recursos ya no requiere infraestructura de GPU ni modelos de cientos de millones de parámetros. Se distribuye con pesos en safetensors y ONNX, licencia CC-BY-4.0 y un repositorio de solo 0,2 GB, lo que lo hace desplegable en dispositivos de borde, navegadores y entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS ligero; no se detalla en la informacion proporcionada) |
| Parametros totales | 8.933.129 (safetensors); la model card cita 22,5 M para el sistema completo |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors y ONNX |
| Idiomas soportados | odia (or) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion proporcionada. La model card describe un modelo TTS "tiny" orientado a inferencia en CPU y dispositivo, compatible con PyTorch y ONNX Runtime, con dos voces (femenina y masculina) seleccionables mediante el parámetro `voice`. El tamaño del repositorio es de 0,2 GB y el recuento de parámetros en safetensors es de 8.933.129, aunque la model card indica 22,5 millones de parámetros para el modelo, probablemente incluyendo componentes adicionales no reflejados en ese recuento.

Los datos de entrenamiento provienen de `sulabhkatiyar/indic-tts-mini-24k`, que contiene las voces femenina y masculina de odia del corpus AI4Bharat Rasa a 24 kHz, derivadas a su vez de `sulabhkatiyar/indic-tts-multilingual-prepared`. También se referencia el dataset `ai4bharat/Rasa`. No se especifica el número de tokens, horas de audio ni si se emplearon técnicas de RLHF o DPO; al tratarse de un modelo TTS, el entrenamiento sería supervisado sobre pares texto-audio.

## Capacidades

- Síntesis de voz a partir de texto en escritura odia.
- Dos voces seleccionables: femenina (`voice="female"`) y masculina (`voice="male"`).
- Generación de audio a 24 kHz (derivado del corpus de entrenamiento).
- Inferencia en CPU sin GPU, con soporte para PyTorch y ONNX Runtime.
- Ejecución en dispositivo (on-device) gracias a su tamaño reducido.
- No se documentan capacidades de clonación de voz, control de prosodia por instrucciones, multilingüismo, tool calling ni agentes.

## Casos de uso

- Lectura de noticias y contenidos web en odia: el modelo sintetiza frases periodísticas con un CER del 2,68 % en FLORES-200, adecuado para servicios de lectura por voz de artículos y boletines en odia.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla y aplicaciones móviles que conviertan texto odia en audio, ejecutándose en el propio dispositivo sin conexión ni GPU.
- Asistentes de voz para dispositivos de borde: al correr 38 veces más rápido que tiempo real en un hilo de CPU M1, puede incorporarse en altavoces inteligentes, televisores o sistemas embebidos con recursos limitados.
- Audiolibros y narración de textos largos: la velocidad de síntesis (factor de tiempo real de 0,016 en T4) permite procesar grandes volúmenes de texto odia por lotes para generar audiolibros o podcasts.
- Aplicaciones educativas en odia: lectura en voz alta de materiales escolares y contenidos de aprendizaje de idiomas, con voces femenina y masculina para diversificar la experiencia.
- Atención al cliente automatizada por voz en odia: respuestas habladas en sistemas IVR o chatbots telefónicos, donde la baja latencia en CPU reduce costes de infraestructura.
- Señalización y anuncios públicos: generación de avisos hablados en odia para transporte, aeropuertos o edificios públicos, desplegable en hardware de bajo coste.

## Benchmarks y rendimiento

Resultados de tasa de error de carácter (CER, menor es mejor) publicados en la model card.

FLORES-200, frases periodísticas (100):

| Modelo | Tamano | CER, % | Resultado |
|---|---:|---:|---|
| Este modelo | 22,5 M | 2,68 | referencia |
| AI4Bharat Indic-TTS (or.zip) | 65,6 M | 2,35 | igual |
| ai4bharat/IndicF5 | 350,6 M | 2,48 | igual |
| ai4bharat/indic-parler-tts | 937,8 M | 3,66 | este modelo mejor |
| facebook/mms-tts-ory | 29,1 M | 5,57 | este modelo mejor |

Frases de test reservadas (300):

| Modelo | Tamano | CER, % | Resultado |
|---|---:|---:|---|
| Este modelo | 22,5 M | 3,97 | referencia |
| AI4Bharat Indic-TTS (or.zip) | 65,6 M | 5,15 | este modelo mejor |
| facebook/mms-tts-ory | 29,1 M | 11,03 | este modelo mejor |

Comparación con modelos mayores en las mismas frases reservadas:

| Modelo | Tamano | CER, % | CER de este modelo, % | Resultado |
|---|---:|---:|---:|---|
| ai4bharat/IndicF5 | 350,6 M | 4,33 | 4,33 | igual |
| ai4bharat/indic-parler-tts | 937,8 M | 23,01 | 4,33 | igual |

Velocidad (factor de tiempo real, menor es más rápido; 30 frases reservadas):

| Hardware | Configuracion | Mas rapido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7x | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38x | 0,026 |
| NVIDIA T4 | PyTorch | 62x | 0,016 |

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo ocupa 0,2 GB en disco y los pesos safetensors suman 8,9 M de parámetros, por lo que la inferencia en CPU necesita muy poca memoria (del orden de cientos de MB incluyendo el runtime).
- GPU recomendadas: no necesarias; funciona en CPU. En GPU, una NVIDIA T4 ofrece un factor de tiempo real de 0,016 (62 veces más rápido que tiempo real).
- CPU: funciona en un solo hilo tanto en x86 (7 veces más rápido que tiempo real) como en Apple M1 (38 veces más rápido que tiempo real).
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU; no se requieren modelos como RTX 4090, A100 o H100.
- Opciones de despliegue: PyTorch y ONNX Runtime según la model card; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: factor de tiempo real de 0,136 en un hilo x86 y 0,026 en un hilo M1; en T4, 0,016.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | CER (FLORES-200) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este modelo | 22,5 M (8,9 M en safetensors) | Odia | 2,68 % | CC-BY-4.0 | Hugging Face, safetensors y ONNX |
| AI4Bharat Indic-TTS (or.zip) | 65,6 M | Odia | 2,35 % | no disponible en la informacion | GitHub AI4Bharat |
| ai4bharat/IndicF5 | 350,6 M | Varias lenguas indias | 2,48 % | no disponible en la informacion | Hugging Face |
| ai4bharat/indic-parler-tts | 937,8 M | Varias lenguas indias | 3,66 % | no disponible en la informacion | Hugging Face |
| facebook/mms-tts-ory | 29,1 M | Odia | 5,57 % | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- Solo soporta odia (código `or`); no es multilingüe.
- El CER del 3,97 % en frases reservadas indica que aún puede producir errores de pronunciación o inteligibilidad en textos fuera del dominio de entrenamiento.
- El entrenamiento se basa en las voces de AI4Bharat Rasa, por lo que la diversidad de hablantes, edades y acentos está limitada a esas dos voces.
- No se documentan mecanismos de control de prosodia, emoción ni velocidad; la salida depende del texto de entrada.
- Riesgo de errores en nombres propios, números, siglas y puntuación atípica, habitual en modelos TTS pequeños.
- No se especifican sesgos concretos ni evaluaciones de robustez ante texto ruidoso o mal formateado.
- La licencia CC-BY-4.0 permite uso comercial con atribución; deben respetarse las condiciones de atribución al autor y a los datasets de origen (AI4Bharat Rasa).
- La model card marca `inference: false`, lo que puede indicar que la inferencia automática en el Hub no está habilitada, aunque el modelo es utilizable localmente.
- No se detalla la arquitectura interna ni el proceso de entrenamiento, lo que dificulta evaluar su comportamiento fuera de los benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-odia
- Colección Indic Tiny TTS Models: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset de entrenamiento: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset multilingüe preparado: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Repositorio AI4Bharat Indic-TTS: https://github.com/AI4Bharat/Indic-TTS
- Modelo ai4bharat/IndicF5: https://huggingface.co/ai4bharat/IndicF5
- Modelo ai4bharat/indic-parler-tts: https://huggingface.co/ai4bharat/indic-parler-tts
- Modelo facebook/mms-tts-ory: https://huggingface.co/facebook/mms-tts-ory
