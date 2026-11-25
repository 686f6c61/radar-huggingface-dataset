# sulabhkatiyar/indic-tiny-tts-malayalam

## Resumen

Indic Tiny TTS: Malayalam es un modelo de síntesis de voz (text-to-speech) desarrollado por sulabhkatiyar, diseñado específicamente para el idioma malayalam. Forma parte de la colección INDIC TINY TTS MODELS, que agrupa 12 modelos minúsculos, uno por idioma, para 11 lenguas indias y el inglés indio. El modelo convierte texto en escritura malayalam en audio inteligible con dos voces disponibles (femenina y masculina), y su propuesta principal es ofrecer una calidad competitiva con un coste computacional mínimo.

La arquitectura es un modelo neuronal compacto de aproximadamente 8,9 millones de parámetros según los pesos en safetensors (la model card cita 22,5 millones de parámetros, probablemente contando el generador completo o el total del sistema). Está pensado para inferencia en CPU y en dispositivos, sin necesidad de GPU, y se distribuye en formatos PyTorch y ONNX. Su relevancia actual radica en que demuestra que un modelo de menos de 10 millones de parámetros puede igualar en tasa de error de caracteres (CER) a modelos 16 y 42 veces más grandes en malayalam, con velocidades de 7× a 62× por encima del tiempo real según el hardware.

El modelo se entrenó con voces femenina y masculina de AI4Bharat Rasa a 24 kHz, y se evalúa con métricas de reconocimiento automático sobre frases de noticias FLORES-200 y un conjunto de test reservado. Es una opción atractiva para despliegues en entornos con recursos limitados, aplicaciones móviles y sistemas embebidos que necesiten locución en malayalam.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para TTS (detalles internos no disponibles; probablemente VITS o similar, no confirmado) |
| Parametros totales | 8.934.153 (safetensors); la model card cita 22,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | malayalam (ml) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se trata de un sistema de síntesis de voz neuronal. El tamaño de los pesos en safetensors (8,9 millones de parámetros) sugiere un modelo muy compacto, probablemente basado en arquitecturas ligeras de TTS como VITS o similares, aunque esto no se confirma en la documentación. El modelo se distribuye tanto en formato PyTorch como en ONNX, lo que facilita su despliegue en entornos de inferencia en CPU y en dispositivos.

El entrenamiento se realizó con el dataset sulabhkatiyar/indic-tts-mini-24k, que contiene las voces femenina y masculina de AI4Bharat Rasa a 24 kHz, derivadas del corpus completo sulabhkatiyar/indic-tts-multilingual-prepared. También se menciona el dataset ai4bharat/Rasa como fuente. No se documentan el número de tokens, la composición exacta del dataset, ni si hubo fases de RLHF o DPO (no aplicables típicamente a TTS). La innovación principal es la eficiencia: un modelo minúsculo que iguala o supera en CER a modelos mucho mayores, con inferencia en CPU a velocidades muy superiores al tiempo real.

## Capacidades

- Síntesis de voz a partir de texto en escritura malayalam.
- Dos voces seleccionables: femenina (`voice="female"`) y masculina.
- Generación de audio a 24 kHz.
- Inferencia en CPU sin GPU, con soporte para PyTorch y ONNX Runtime.
- Ejecución en dispositivos (on-device) y entornos con recursos limitados.
- No se documentan capacidades de clonación de voz, control de prosodia avanzado, emoción ni multilingüismo más allá del malayalam.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- Locución de noticias y contenido editorial en malayalam: el modelo lee frases de estilo periodístico con una CER del 2,37 % en FLORES-200, adecuado para generar audio de artículos y boletines de forma automatizada.
- Asistentes de voz en dispositivos móviles y embebidos: al ejecutarse 38× más rápido que el tiempo real en un solo hilo de CPU Apple M1 y 7× en un hilo x86, puede integrarse en aplicaciones sin conexión y con batería limitada.
- Accesibilidad para personas con discapacidad visual: conversión de texto en malayalam a voz para lectores de pantalla y aplicaciones de accesibilidad, con dos voces para preferencias del usuario.
- Sistemas de anuncios y megafonía: generación de avisos pregrabados o dinámicos en malayalam para transporte público, aeropuertos y comercios, donde la latencia baja y la ejecución en CPU reducen costes de infraestructura.
- Aprendizaje de idiomas: reproducción de frases en malayalam para estudiantes, con audio de calidad suficiente (CER bajo en frases de test) y voces masculina y femenina para practicar la comprensión auditiva.
- Integración en pipelines de generación de contenido: conversión por lotes de textos a audio en servidores sin GPU, con un factor de tiempo real de 0,136 en CPU x86, lo que permite procesar grandes volúmenes con hardware convencional.
- Prototipado e investigación en TTS de bajos recursos: modelo de referencia para experimentos con lenguas indias, dado su tamaño reducido (8,9 M de parámetros) y su licencia CC-BY-4.0.

## Benchmarks y rendimiento

Resultados de CER (character error rate, menor es mejor) en frases de noticias FLORES-200 (100 frases):

| Modelo | Tamano | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **2,37** | — |
| ai4bharat/IndicF5 | 350,6 M | 2,06 | igual |
| AI4Bharat/Indic-TTS (ml.zip) | 65,6 M | 2,60 | igual |
| ai4bharat/vits_rasa_13 | 31,3 M | 2,94 | este modelo mejor |
| rhasspy/piper-voices (ml_IN-meera-medium, ml_IN-arjun-medium) | 15,7 M | 3,36 | este modelo mejor |
| ai4bharat/indic-parler-tts | 937,8 M | 4,05 | este modelo mejor |
| facebook/mms-tts-mal | 29,1 M | 7,95 | este modelo mejor |
| multilingual-tts/VITS-OpenBible-Malayalam | 29,1 M | 13,11 | este modelo mejor |

Resultados en conjunto de test reservado (300 frases):

| Modelo | Tamano | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **5,55** | — |
| AI4Bharat/Indic-TTS (ml.zip) | 65,6 M | 5,11 | igual |
| facebook/mms-tts-mal | 29,1 M | 14,02 | este modelo mejor |
| ai4bharat/vits_rasa_13 | 31,3 M | 6,24 | igual |

Comparación con modelos mayores en las mismas frases reservadas:

| Modelo | Tamano | CER, % | CER de este modelo en las mismas frases, % | Resultado |
|---|---:|---:|---:|---|
| ai4bharat/indic-parler-tts | 937,8 M | 5,21 | 5,71 | igual |
| ai4bharat/IndicF5 | 350,6 M | 5,21 | 5,71 | igual |

Velocidad:

| Hardware | Configuracion | Veces mas rapido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7× | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38× | 0,026 |
| NVIDIA T4 GPU | PyTorch | 62× | 0,016 |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; en CPU el modelo ocupa menos de 1 GB en memoria (pesos de 8,9 M de parámetros en safetensors, repositorio de 0,2 GB).
- GPU recomendadas: no necesarias; funciona en CPU. En GPU, una NVIDIA T4 ofrece 62× tiempo real.
- Cabe en cualquier GPU consumer y en CPU de portátiles y dispositivos embebidos; no se requieren aceleradores dedicados.
- Opciones de despliegue: PyTorch y ONNX Runtime; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput: factor de tiempo real de 0,136 en CPU x86 de 4 vCPU (7× tiempo real), 0,026 en Apple M1 (38×) y 0,016 en T4 (62×).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (FLORES-200) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Este modelo** | 8,9 M (safetensors) / 22,5 M (card) | no aplica | 2,37 % | CC-BY-4.0 | Hugging Face |
| ai4bharat/IndicF5 | 350,6 M | no aplica | 2,06 % | no disponible | Hugging Face |
| ai4bharat/vits_rasa_13 | 31,3 M | no aplica | 2,94 % | no disponible | Hugging Face |
| rhasspy/piper-voices (ml_IN) | 15,7 M | no aplica | 3,36 % | no disponible | Hugging Face |
| facebook/mms-tts-mal | 29,1 M | no aplica | 7,95 % | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo soporta malayalam; no es multilingüe.
- La model card no documenta sesgos específicos, pero al entrenarse con voces de AI4Bharat Rasa puede heredar sesgos de género, registro y dialecto de ese corpus.
- Riesgo de alucinación no aplica en el sentido textual, pero puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento (nombres propios, términos técnicos, siglas).
- No se documentan limitaciones de longitud de texto de entrada; es probable que el modelo esté entrenado con frases cortas y su rendimiento en párrafos largos no esté evaluado.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor y la licencia.
- No se documentan cuantizaciones ni optimizaciones para GPUs de gama alta; el enfoque es CPU y on-device.
- El repositorio tiene 307 descargas y 1 like, lo que indica una adopción aún limitada y poca validación comunitaria.
- La discrepancia entre los 8,9 M de parámetros en safetensors y los 22,5 M citados en la model card debe tenerse en cuenta al estimar requisitos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-malayalam
- Colección INDIC TINY TTS MODELS: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset de entrenamiento: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset multilingüe preparado: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Repositorio AI4Bharat Indic-TTS: https://github.com/AI4Bharat/Indic-TTS
- Modelo ai4bharat/IndicF5: https://huggingface.co/ai4bharat/IndicF5
- Modelo ai4bharat/vits_rasa_13: https://huggingface.co/ai4bharat/vits_rasa_13
- Modelo ai4bharat/indic-parler-tts: https://huggingface.co/ai4bharat/indic-parler-tts
- Modelo facebook/mms-tts-mal: https://huggingface.co/facebook/mms-tts-mal
- Voces rhasspy/piper-voices: https://huggingface.co/rhasspy/piper-voices
