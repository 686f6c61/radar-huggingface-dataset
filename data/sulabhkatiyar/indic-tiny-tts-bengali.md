# sulabhkatiyar/indic-tiny-tts-bengali

## Resumen

Indic Tiny TTS: Bengali es un modelo de síntesis de voz (text-to-speech) para bengalí desarrollado por sulabhkatiyar, publicado en HuggingFace bajo licencia CC-BY-4.0. Forma parte de la colección INDIC TINY TTS MODELS, compuesta por 12 modelos pequeños, uno por idioma, que cubren 11 lenguas indias y el inglés indio. El modelo convierte texto en escritura bengalí en audio de 24 kHz con dos voces disponibles, femenina y masculina.

El modelo está diseñado específicamente para inferencia en dispositivo (on-device) y en CPU, sin necesidad de GPU. Con 8,9 millones de parámetros según los pesos en safetensors (la model card indica 22,5 millones, discrepancia que conviene tener en cuenta), ofrece una velocidad de 38 veces tiempo real en un solo hilo de CPU Apple M1 y 7 veces en un hilo de CPU x86. Está disponible en formato PyTorch y ONNX Runtime.

Su relevancia radica en la combinación de tamaño reducido, latencia muy baja y calidad competitiva: en el conjunto de frases de noticias FLORES-200 obtiene un CER del 2,10 %, mejor que cinco modelos abiertos de bengalí de tamaño similar o mayor, y en frases de test reservadas (300) alcanza un CER del 3,58 %, también inferior al de las alternativas comparadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; la model card no detalla la arquitectura interna) |
| Parámetros totales | 8.932.745 según safetensors; la model card indica 22,5 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye en PyTorch y ONNX; no se especifican cuantizaciones) |
| Idiomas soportados | bengalí (bn) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (no se indica si es VITS, FastSpeech, un modelo basado en difusión u otra familia). Se trata de un modelo TTS de 24 kHz de frecuencia de muestreo, con dos voces (femenina y masculina) y capacidad de leer escritura bengalí nativa. El repositorio ocupa 0,2 GB e incluye pesos en safetensors y ONNX.

El entrenamiento se realizó sobre el dataset `sulabhkatiyar/indic-tts-mini-24k`, que contiene las voces femenina y masculina de bengalí de AI4Bharat Rasa a 24 kHz, derivado del dataset completo `sulabhkatiyar/indic-tts-multilingual-prepared`. También se referencia el dataset `ai4bharat/Rasa`. No se detallan en la información disponible el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (poco habituales en TTS). La innovación principal es la reducción extrema del tamaño manteniendo una calidad de síntesis competitiva, junto con la optimización para inferencia en CPU y ONNX.

## Capacidades

- Síntesis de voz a partir de texto en escritura bengalí, con salida de audio a 24 kHz.
- Dos voces seleccionables: femenina (`voice="female"`) y masculina.
- Inferencia en CPU sin GPU, con velocidades de 38× tiempo real en Apple M1 (1 hilo) y 7× en x86 (1 hilo).
- Ejecución con PyTorch y ONNX Runtime.
- Diseñado para despliegue on-device y en entornos con recursos limitados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking (no aplicables a un modelo TTS).
- Capacidad multilingüe: únicamente bengalí.

## Casos de uso

- Lectura de noticias y artículos en bengalí: el modelo puede convertir texto periodístico en audio con una tasa de error de reconocimiento baja (CER 2,10 % en FLORES-200), adecuada para aplicaciones de acceso a información.
- Asistentes de voz embebidos en dispositivos de gama baja: al ejecutarse en CPU a 38× tiempo real en M1 y 7× en x86, es viable integrarlo en routers, Raspberry Pi o móviles sin GPU.
- Accesibilidad para personas con discapacidad visual: la síntesis rápida y ligera permite leer pantallas o documentos en bengalí en tiempo real en hardware modesto.
- Sistemas de anuncios y megafonía automatizada: la latencia baja y la inferencia en CPU facilitan la generación de avisos pregrabados o dinámicos en comercios, transporte o servicios públicos.
- Aplicaciones educativas de aprendizaje de bengalí: las dos voces permiten generar material de pronunciación y ejercicios de escucha con distintos registros.
- Integración en pipelines de CI/CD para generación de audiolibros o contenido bajo demanda: el formato ONNX y el tamaño reducido (0,2 GB de repo) simplifican el despliegue en contenedores y funciones serverless.
- Prototipado rápido de interfaces de voz: al no requerir GPU ni infraestructura pesada, permite iterar en local con PyTorch u ONNX Runtime.

## Benchmarks y rendimiento

Resultados de CER (character error rate, menor es mejor) publicados en la model card:

FLORES-200 (100 frases de noticias):

| Modelo | Tamaño | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **2,10** | — |
| ai4bharat/IndicF5 | 350,6 M | 1,70 | Mejor el suyo |
| ai4bharat/indic-parler-tts | 937,8 M | 2,27 | Igual |
| ai4bharat/vits_rasa_13 | 31,3 M | 3,18 | Peor |
| SYSPIN/vits_Bengali_Female + Male | 29,1 M | 3,50 | Peor |
| facebook/mms-tts-ben | 29,1 M | 4,86 | Peor |
| rhasspy/piper-voices (bn_BD-google-medium) | 15,8 M | 5,48 | Peor |
| AI4Bharat/Indic-TTS (bn.zip) | 65,6 M | 5,52 | Peor |

Frases de test reservadas (300):

| Modelo | Tamaño | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **3,58** | — |
| rhasspy/piper-voices (bn_BD-google-medium) | 15,8 M | 7,13 | Peor |
| AI4Bharat/Indic-TTS (bn.zip) | 65,6 M | 7,99 | Peor |
| SYSPIN/vits_Bengali_Female + Male | 29,1 M | 8,49 | Peor |
| facebook/mms-tts-ben | 29,1 M | 9,01 | Peor |
| ai4bharat/vits_rasa_13 | 31,3 M | 5,00 | Peor |

Comparación con modelos mayores en las mismas frases reservadas:

| Modelo | Tamaño | Frases | CER, % | Este modelo, mismas frases, % | Resultado |
|---|---:|---:|---:|---:|---|
| ai4bharat/IndicF5 | 350,6 M | 40 | 3,78 | 4,08 | Igual |
| ai4bharat/indic-parler-tts | 937,8 M | 40 | 7,05 | 4,08 | Igual |

Velocidad (factor de tiempo real, menor es más rápido):

| Hardware | Configuración | Veces más rápido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7× | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38× | 0,026 |
| NVIDIA T4 | PyTorch | 62× | 0,016 |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el modelo es de tamaño reducido (repositorio de 0,2 GB), por lo que la VRAM necesaria es mínima (no se especifica cifra exacta).
- GPU recomendadas: NVIDIA T4 es suficiente y alcanza 62× tiempo real; cualquier GPU moderna superior ofrece margen de sobra.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en iGPU; también funciona sin GPU.
- Opciones de despliegue: PyTorch y ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: factor de tiempo real de 0,136 en 1 hilo x86, 0,026 en Apple M1 y 0,016 en T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (FLORES-200) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Este modelo** | 22,5 M (card) / 8,9 M (safetensors) | no aplica | 2,10 % | CC-BY-4.0 | HuggingFace |
| ai4bharat/IndicF5 | 350,6 M | no aplica | 1,70 % | no disponible | HuggingFace |
| ai4bharat/indic-parler-tts | 937,8 M | no aplica | 2,27 % | no disponible | HuggingFace |
| facebook/mms-tts-ben | 29,1 M | no aplica | 4,86 % | no disponible | HuggingFace |
| rhasspy/piper-voices (bn_BD-google-medium) | 15,8 M | no aplica | 5,48 % | no disponible | HuggingFace |

## Limitaciones y advertencias

- Solo soporta bengalí; no es multilingüe.
- La discrepancia entre los parámetros de la model card (22,5 M) y los pesos en safetensors (8,932 M) debe verificarse antes de dimensionar el despliegue.
- No se documentan sesgos específicos, pero al entrenarse con voces de AI4Bharat Rasa puede heredar sesgos de género, registro o variedad dialectal de ese corpus.
- Riesgo de alucinación o errores de pronunciación en textos con números, siglas, nombres propios o puntuación atípica; el CER del 3,58 % en test reservado indica que existe margen de error.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor y la licencia.
- No se especifican limitaciones de longitud de texto de entrada ni de contexto; conviene trocear entradas largas.
- La model card marca `inference: false`, lo que puede indicar que la inferencia vía la API de HuggingFace no está habilitada; es necesario descargar los pesos y ejecutarlos localmente.
- El modelo tiene solo 4 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es muy limitada.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/sulabhkatiyar/indic-tiny-tts-bengali)
- [Colección INDIC TINY TTS MODELS](https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d)
- [Dataset indic-tts-mini-24k](https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k)
- [Dataset indic-tts-multilingual-prepared](https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared)
- [Dataset ai4bharat/Rasa](https://huggingface.co/datasets/ai4bharat/Rasa)
- [Gráfico de benchmark FLORES](https://huggingface.co/sulabhkatiyar/indic-tiny-tts-bengali/resolve/main/assets/bench_flores.png)
- [Gráfico de benchmark Rasa](https://huggingface.co/sulabhkatiyar/indic-tiny-tts-bengali/resolve/main/assets/bench_rasa.png)
- [Gráfico de comparación con modelos mayores](https://huggingface.co/sulabhkatiyar/indic-tiny-tts-bengali/resolve/main/assets/bench_big.png)
