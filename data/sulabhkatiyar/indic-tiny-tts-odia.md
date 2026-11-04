# sulabhkatiyar/indic-tiny-tts-odia

## Resumen

Indic Tiny TTS: Odia es un modelo de síntesis de voz (text-to-speech) especializado en odia (oriya), una de las lenguas oficiales de la India con más de 35 millones de hablantes. Lo desarrolla sulabhkatiyar como parte de la colección INDIC TINY TTS MODELS, compuesta por 12 modelos minúsculos, uno por idioma, que cubren 11 lenguas indias y el inglés indio. El modelo resuelve un problema concreto: ofrecer TTS de calidad aceptable para una lengua de bajos recursos en hardware muy limitado, sin necesidad de GPU.

La arquitectura es un modelo acústico compacto de aproximadamente 8,9 millones de parámetros según los pesos en safetensors (la model card declara 22,5 millones, discrepancia que conviene verificar antes de desplegar). Genera dos voces, femenina y masculina, a partir de texto en escritura odia, y se distribuye en formato ONNX y safetensors para inferencia en CPU. Su relevancia actual radica en que iguala en tasa de error de carácter (CER) a modelos hasta 42 veces más grandes, como indic-parler-tts, con una velocidad muy superior.

El modelo está pensado para despliegue en dispositivo (on-device), aplicaciones de accesibilidad, lectura de contenido y sistemas de voz para odia donde no hay presupuesto de GPU. Su licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acústico TTS compacto (detalles de arquitectura no disponibles) |
| Parametros totales | 8.933.129 según safetensors; la model card declara 22,5 M (no disponible la causa de la discrepancia) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX y safetensors) |
| Idiomas soportados | Odia (or) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de decoder, vocoder, representación acústica ni mecanismo de atención). Se trata de un modelo acústico de text-to-speech de tamaño muy reducido, optimizado para inferencia en CPU con PyTorch y ONNX Runtime, sin GPU. Genera audio a 24 kHz con dos voces seleccionables mediante el parámetro `voice` (`female` o `male`).

El entrenamiento se realizó sobre el dataset sulabhkatiyar/indic-tts-mini-24k, que contiene las voces femenina y masculina de odia de AI4Bharat Rasa a 24 kHz, derivadas del corpus completo sulabhkatiyar/indic-tts-multilingual-prepared. También se referencia ai4bharat/Rasa como fuente. No se especifican el número de horas de audio, el número de pasos de entrenamiento ni si hubo ajuste por RLHF u optimización perceptual adicional. La model card indica que los modelos grandes comparados (IndicF5 e indic-parler-tts) se entrenaron con las mismas voces de hablante, lo que permite una comparación controlada.

## Capacidades

- Síntesis de voz a partir de texto en escritura odia, con salida de audio a 24 kHz.
- Dos voces predefinidas: femenina y masculina, seleccionables por parámetro.
- Inferencia en CPU con PyTorch y ONNX Runtime, sin necesidad de GPU.
- Ejecución en un solo hilo de CPU, lo que permite despliegue en dispositivos de gama baja.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de LLM.
- No dispone de modo thinking, visión, audio de entrada ni capacidades multimodales.
- Cobertura monolingüe: únicamente odia.

## Casos de uso

- Lectura de noticias y artículos en odia: el modelo sintetiza frases de estilo periodístico con un CER del 2,68 % en FLORES-200, adecuado para servicios de lectura por voz en webs y aplicaciones de noticias.
- Accesibilidad para personas con discapacidad visual: al ejecutarse 38 veces más rápido que tiempo real en un hilo de Apple M1, puede integrarse en lectores de pantalla y aplicaciones móviles sin consumir batería de forma significativa.
- Asistentes de voz en dispositivo para odia: su tamaño reducido (repo de 0,2 GB) y su formato ONNX permiten empaquetarlo en aplicaciones Android o de escritorio que funcionen sin conexión.
- Audiolibros y contenido educativo: la disponibilidad de dos voces permite alternar narradores en materiales didácticos o cuentos, con generación por lotes en CPU.
- Sistemas de megafonía y avisos automatizados: para estaciones, aeropuertos o servicios públicos en regiones de habla odia, donde el coste de GPU es prohibitivo y se requiere latencia baja en hardware convencional.
- Integración en pipelines de subtitulado y doblaje: la velocidad de 62 veces tiempo real en una T4 permite procesar grandes volúmenes de texto a audio en servidores modestos.
- Pruebas de concepto y prototipado de productos de voz para el mercado indio: al ser un modelo pequeño y de licencia permisiva, reduce el coste de experimentación frente a alternativas de cientos de millones de parámetros.

## Benchmarks y rendimiento

Resultados de tasa de error de carácter (CER, menor es mejor) publicados en la model card:

| Modelo | Tamaño | CER FLORES-200 (%) | CER test retenido (%) |
|---|---:|---:|---:|
| **Este modelo** | 22,5 M | **2,68** | **3,97** |
| AI4Bharat/Indic-TTS (or.zip) | 65,6 M | 2,35 | 5,15 |
| ai4bharat/IndicF5 | 350,6 M | 2,48 | no disponible en esa tabla |
| ai4bharat/indic-parler-tts | 937,8 M | 3,66 | no disponible en esa tabla |
| facebook/mms-tts-ory | 29,1 M | 5,57 | 11,03 |

En el conjunto retenido de 300 frases, el modelo obtiene un CER del 3,97 %, frente al 5,15 % de Indic-TTS y el 11,03 % de mms-tts-ory. En una comparación adicional sobre 40 frases, iguala el CER de IndicF5 (4,33 %) y de indic-parler-tts (4,33 % frente al 23,01 % de este último en esas mismas frases), con una ventaja de velocidad de aproximadamente 165× y 118× respectivamente en una T4.

Velocidad medida (factor de tiempo real, menor es más rápido):

| Hardware | Configuración | Más rápido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7× | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38× | 0,026 |
| NVIDIA T4 | PyTorch | 62× | 0,016 |

## Requisitos de hardware

- VRAM estimada: no requiere GPU; en CPU el modelo ocupa del orden de decenas de MB en memoria (repo total de 0,2 GB).
- GPU recomendadas: ninguna imprescindible; una T4 ofrece 62× tiempo real si se desea acelerar el procesado por lotes.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada.
- Despliegue: PyTorch y ONNX Runtime documentados; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: factor de tiempo real de 0,136 en un hilo de CPU x86 y 0,026 en un hilo de Apple M1, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | CER (FLORES-200) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Indic Tiny TTS Odia** | 22,5 M (card) / 8,9 M (pesos) | Odia | 2,68 % | CC-BY-4.0 | HuggingFace, ONNX y safetensors |
| AI4Bharat/Indic-TTS | 65,6 M | Odia | 2,35 % | No disponible en la información | GitHub (or.zip) |
| ai4bharat/IndicF5 | 350,6 M | Indio (incluye odia) | 2,48 % | No disponible en la información | HuggingFace |
| ai4bharat/indic-parler-tts | 937,8 M | Multilingüe indio | 3,66 % | No disponible en la información | HuggingFace |
| facebook/mms-tts-ory | 29,1 M | Odia | 5,57 % | No disponible en la información | HuggingFace |

El modelo destaca por su relación calidad/tamaño: iguala o supera a alternativas mucho mayores en el conjunto retenido y es notablemente más rápido en CPU. Indic-TTS obtiene mejor CER en FLORES-200, pero con el triple de parámetros y sin las ventajas de velocidad y formato ONNX documentadas aquí.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza odia; no admite texto en otros idiomas ni transliteración latina de forma nativa.
- Solo dos voces predefinidas; no hay control de prosodia, emoción, velocidad ni estilo más allá de la elección de voz.
- Riesgo de errores de pronunciación en nombres propios, siglas, números y palabras fuera del dominio de entrenamiento (noticias y corpus Rasa).
- La discrepancia entre los 22,5 M declarados y los 8,9 M de los pesos safetensors debe verificarse antes de dimensionar el despliegue.
- No se documentan sesgos de género, dialecto ni registro; el corpus de entrenamiento (noticias y Rasa) puede limitar la naturalidad en lenguaje coloquial.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos de los datasets de origen (AI4Bharat Rasa) para usos derivados.
- No hay información sobre latencia en dispositivos móviles reales, solo en CPU x86, Apple M1 y T4.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/sulabhkatiyar/indic-tiny-tts-odia)
- [Colección INDIC TINY TTS MODELS](https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d)
- [Dataset indic-tts-mini-24k](https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k)
- [Dataset indic-tts-multilingual-prepared](https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared)
- [Dataset AI4Bharat Rasa](https://huggingface.co/datasets/ai4bharat/Rasa)
- [AI4Bharat Indic-TTS (GitHub)](https://github.com/AI4Bharat/Indic-TTS)
- [ai4bharat/IndicF5](https://huggingface.co/ai4bharat/IndicF5)
- [ai4bharat/indic-parler-tts](https://huggingface.co/ai4bharat/indic-parler-tts)
- [facebook/mms-tts-ory](https://huggingface.co/facebook/mms-tts-ory)
