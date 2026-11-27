# sulabhkatiyar/indic-tiny-tts-kannada

## Resumen

Indic Tiny TTS: Kannada es un modelo de síntesis de voz (text-to-speech) extremadamente compacto, desarrollado por el usuario independiente sulabhkatiyar, especializado en la lectura de texto en escritura kannada. Con solo 8,9 millones de parámetros según los pesos en safetensors (22,5 millones según la model card del autor), el modelo ofrece dos voces, femenina y masculina, y está diseñado para ejecutarse en CPU sin necesidad de GPU. Forma parte de la colección INDIC TINY TTS MODELS, compuesta por doce modelos pequeños, uno por idioma, que cubren once lenguas indias y el inglés indio.

El modelo resuelve el problema de la síntesis de voz de calidad en kannada en entornos con recursos limitados, donde los modelos convencionales de TTS (VITS, Parler-TTS, F5) resultan demasiado pesados o lentos. Su propuesta de valor es la eficiencia: alcanza una tasa de error de caracteres (CER) de 1,05 % en frases de noticias de FLORES-200, superando a cinco modelos abiertos de kannada de mayor tamaño y empatando con otros dos, según los datos publicados por el autor.

Es relevante ahora porque demuestra que un modelo de menos de 25 millones de parámetros puede igualar en inteligibilidad a modelos de 350 a 937 millones de parámetros, con un factor de tiempo real de 0,026 en un solo hilo de CPU Apple M1 (38 veces más rápido que tiempo real) y 0,136 en un hilo x86. Esto lo hace adecuado para despliegue en dispositivos, aplicaciones de accesibilidad y sistemas de lectura en entornos sin aceleración por hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; la model card no detalla la arquitectura interna) |
| Parametros totales | 8.933.897 (safetensors); 22,5 M según la model card |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kannada (kn) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (no se indica si es VITS, FastSpeech, un transformer acústico o un modelo híbrido). Lo que sí se documenta es que el modelo se distribuye en formatos safetensors y ONNX, y que puede ejecutarse tanto con PyTorch como con ONNX Runtime. El tamaño del repositorio es de 0,2 GB, coherente con un modelo de menos de 10 millones de parámetros en safetensors.

El entrenamiento se realizó sobre el dataset sulabhkatiyar/indic-tts-mini-24k, a 24 kHz. La voz masculina proviene de AI4Bharat Rasa, derivada del corpus completo sulabhkatiyar/indic-tts-multilingual-prepared, mientras que la voz femenina procede del corpus LIMMITS / SYSPIN. También se citan como datasets relacionados ai4bharat/Rasa y iAkashPaul/limmits-2024. No se detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO, que en un modelo TTS de este tipo no serían el mecanismo habitual.

## Capacidades

- Síntesis de voz a partir de texto en escritura kannada, con salida de audio a 24 kHz.
- Dos voces seleccionables: femenina (`voice="female"`) y masculina.
- Ejecución en CPU sin GPU, con soporte para PyTorch y ONNX Runtime.
- Inferencia en dispositivos (on-device), gracias a su tamaño reducido.
- Lectura de frases de noticias y texto general en kannada con baja tasa de error de caracteres.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento; es un modelo exclusivamente TTS.
- Capacidad multilingüe limitada al kannada; no se indica soporte de otros idiomas.

## Casos de uso

- Lectura de noticias y artículos en kannada: el modelo logra un CER de 1,05 % en frases de noticias de FLORES-200, por lo que es adecuado para convertir titulares y cuerpos de noticia en audio inteligible con dos voces disponibles.
- Accesibilidad para personas con discapacidad visual: al ejecutarse en CPU a 38 veces tiempo real en un hilo de Apple M1, puede integrarse en lectores de pantalla y aplicaciones de escritorio sin depender de servicios en la nube.
- Asistentes de voz en dispositivos de gama baja: con un factor de tiempo real de 0,136 en un hilo x86, cabe en netbooks, Raspberry Pi o móviles de gama media para respuestas habladas en kannada.
- Audiolibros y contenido educativo: la voz femenina y masculina permiten narrar materiales didácticos o textos largos por lotes, con un coste computacional mínimo en comparación con modelos de 350 M o 937 M de parámetros.
- Sistemas de megafonía y avisos automatizados: la baja latencia y la ejecución sin GPU facilitan la generación de anuncios pregrabados en kannada para transporte, aeropuertos o comercios.
- Integración en pipelines de datos: al estar disponible en ONNX y safetensors, puede incorporarse a flujos de preprocesamiento o aumento de datos (data augmentation) para entrenar modelos de reconocimiento de voz en kannada.
- Prototipado rápido de interfaces de voz: el tamaño de 0,2 GB del repositorio permite descargar y probar el modelo en minutos, sin infraestructura de GPU.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. CER = tasa de error de caracteres; menor es mejor.

FLORES-200, frases de noticias (100):

| Modelo | Tamano | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **1,05** | — |
| ai4bharat/IndicF5 | 350,6 M | 0,70 | mejor el suyo |
| Sammy-Mohan/Kokoro-82M-Kannada | 131,4 M | 0,96 | igual |
| AI4Bharat/Indic-TTS (kn.zip) | 65,6 M | 1,23 | igual |
| ai4bharat/vits_rasa_13 | 31,3 M | 1,78 | mejor el nuestro |
| SYSPIN/vits_Kannada_Female + Male | 29,1 M | 2,13 | mejor el nuestro |
| ai4bharat/indic-parler-tts | 937,8 M | 2,30 | mejor el nuestro |
| facebook/mms-tts-kan | 29,1 M | 3,31 | mejor el nuestro |
| multilingual-tts/VITS-OpenBible-Kannada | 29,1 M | 5,90 | mejor el nuestro |

Frases de test reservadas (299):

| Modelo | Tamano | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **3,66** | — |
| AI4Bharat/Indic-TTS (kn.zip) | 65,6 M | 3,84 | igual |
| facebook/mms-tts-kan | 29,1 M | 9,42 | mejor el nuestro |
| Sammy-Mohan/Kokoro-82M-Kannada | 131,4 M | 3,68 | igual |
| ai4bharat/vits_rasa_13 | 31,3 M | 4,12 | igual |
| SYSPIN/vits_Kannada_Female + Male | 29,1 M | 6,16 | mejor el nuestro |

Comparación con modelos grandes en las mismas frases reservadas:

| Modelo | Tamano | Frases | CER, % | Este modelo, mismas frases, % | Resultado |
|---|---:|---:|---:|---:|---|
| ai4bharat/IndicF5 | 350,6 M | 40 | 2,44 | 3,71 | igual |
| ai4bharat/indic-parler-tts | 937,8 M | 40 | 3,27 | 3,71 | igual |

Velocidad:

| Hardware | Configuracion | Mas rapido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7x | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38x | 0,026 |
| NVIDIA T4 | PyTorch | 62x | 0,016 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo (menos de 9 M de parámetros en safetensors, repositorio de 0,2 GB), la huella de memoria es mínima y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: NVIDIA T4 es suficiente (62 veces tiempo real); no se requiere A100 ni H100. El modelo está pensado para CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en iGPU; también funciona sin GPU.
- Opciones de despliegue: PyTorch y ONNX Runtime, según la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: factor de tiempo real de 0,026 en un hilo de Apple M1, 0,136 en un hilo x86 y 0,016 en T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER FLORES-200, % | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Indic Tiny TTS: Kannada** | 8,9 M (safetensors) / 22,5 M (card) | no disponible | 1,05 | cc-by-4.0 | Hugging Face |
| ai4bharat/IndicF5 | 350,6 M | no disponible | 0,70 | no disponible | Hugging Face |
| ai4bharat/indic-parler-tts | 937,8 M | no disponible | 2,30 | no disponible | Hugging Face |
| facebook/mms-tts-kan | 29,1 M | no disponible | 3,31 | no disponible | Hugging Face |
| ai4bharat/vits_rasa_13 | 31,3 M | no disponible | 1,78 | no disponible | Hugging Face |

El modelo destaca por su relación tamaño-calidad: iguala en CER a modelos de 350 M y 937 M de parámetros en las frases reservadas, y supera a la mayoría de alternativas de tamaño similar, con la ventaja adicional de ejecutarse en CPU.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al entrenarse con corpus concretos (Rasa, LIMMITS/SYSPIN), puede heredar sesgos de hablante, registro y dominio de esos datasets.
- Riesgo de alucinación: en TTS se traduce en pronunciación incorrecta o entonación anómala en palabras fuera del dominio de entrenamiento; el CER de 3,66 % en frases reservadas indica que persisten errores en texto no visto.
- Limitaciones de contexto o idioma: el modelo solo soporta kannada; no se documenta contexto de texto máximo ni manejo de texto mixto con otros alfabetos.
- Restricciones de licencia: cc-by-4.0 permite uso comercial con atribución; es necesario citar al autor y la licencia.
- Caveats para producción: la model card marca `inference: false`, lo que puede indicar que la inferencia no está habilitada en el Hub; la discrepancia entre los 8,9 M de parámetros en safetensors y los 22,5 M de la model card debe verificarse antes de dimensionar recursos. No se documentan la arquitectura interna ni los detalles de cuantización, lo que limita la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-kannada
- Colección INDIC TINY TTS MODELS: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset de entrenamiento: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset multilingüe preparado: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Dataset LIMMITS 2024: https://huggingface.co/datasets/iAkashPaul/limmits-2024
- Modelo comparado ai4bharat/IndicF5: https://huggingface.co/ai4bharat/IndicF5
- Modelo comparado ai4bharat/indic-parler-tts: https://huggingface.co/ai4bharat/indic-parler-tts
- Modelo comparado facebook/mms-tts-kan: https://huggingface.co/facebook/mms-tts-kan
- Repositorio AI4Bharat Indic-TTS: https://github.com/AI4Bharat/Indic-TTS
