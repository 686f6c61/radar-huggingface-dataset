# sulabhkatiyar/indic-tiny-tts-punjabi

## Resumen

Indic Tiny TTS: Punjabi es un modelo de síntesis de voz (text-to-speech) desarrollado por sulabhkatiyar, diseñado específicamente para el panyabí escrito en grafía Gurmukhi. Con solo 8,93 millones de parámetros en pesos safetensors (la model card declara 22,5 millones de parámetros totales del modelo completo), resuelve el problema de la síntesis de voz de calidad en una lengua india de bajos recursos, donde las alternativas abiertas suelen ser modelos grandes y lentos o modelos pequeños con tasas de error elevadas.

El modelo forma parte de la colección INDIC TINY TTS MODELS, compuesta por 12 modelos pequeños, uno por idioma, que cubren 11 lenguas indias y el inglés indio. Está pensado para inferencia en dispositivo (on-device) y en CPU, sin necesidad de GPU, lo que lo hace relevante para aplicaciones de accesibilidad, lectores de pantalla y asistentes de voz en entornos con recursos limitados.

Incluye dos voces, femenina y masculina, y se distribuye en formatos PyTorch y ONNX Runtime. Su relevancia actual radica en que iguala la tasa de error de modelos hasta 125 veces más grandes en frases de evaluación, con un factor de tiempo real de 0,026 en un núcleo de Apple M1 (38 veces más rápido que el tiempo real).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; la model card no detalla la arquitectura interna) |
| Parametros totales | 22,5 M (según model card); 8.933.001 en pesos safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | panyabí (pa), grafía Gurmukhi |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (no se indica si es VITS, FastSpeech, un modelo basado en difusión o un transformer acústico). Se trata de un modelo TTS de tamaño reducido, con 22,5 millones de parámetros declarados y 8.933.001 parámetros almacenados en los pesos safetensors, lo que sugiere una arquitectura compacta orientada a inferencia en CPU.

El entrenamiento se realizó sobre el dataset sulabhkatiyar/indic-tts-mini-24k, que contiene las voces femenina y masculina en panyabí de AI4Bharat Rasa a 24 kHz, derivadas del dataset completo sulabhkatiyar/indic-tts-multilingual-prepared. También se menciona el dataset ai4bharat/Rasa. No se detallan el número de tokens de audio, la composición exacta del corpus ni si hubo etapas de ajuste fino con RLHF o DPO, por lo que estos datos deben considerarse no disponibles.

La innovación destacable es la relación entre tamaño y rendimiento: el modelo logra una tasa de error de caracteres (CER) de 2,13 % en FLORES-200, comparable a la de IndicF5 (350,6 M de parámetros), y de 6,94 % en el conjunto de test retenido de 299 frases, con una velocidad muy superior. El soporte de ONNX Runtime y PyTorch permite desplegarlo sin GPU.

## Capacidades

- Síntesis de voz a partir de texto en panyabí escrito en Gurmukhi, con salida de audio a 24 kHz.
- Dos voces seleccionables: femenina (`voice="female"`) y masculina (`voice="male"`).
- Inferencia en CPU: funciona en un solo hilo de CPU x86 y en Apple M1 sin aceleración por GPU.
- Exportación a ONNX Runtime además de PyTorch, para despliegue ligero.
- Modelo orientado a dispositivo (on-device), adecuado para aplicaciones móviles y de escritorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Lectores de pantalla y accesibilidad: el modelo puede convertir texto en panyabí a voz en tiempo real en un portátil o móvil sin GPU, con un factor de tiempo real de 0,026 en M1, lo que permite narrar documentos largos sin latencia perceptible.
- Asistentes de voz para dispositivos de bajo consumo: al ejecutarse en un solo hilo de CPU x86 a 7 veces el tiempo real, puede integrarse en routers, Raspberry Pi o televisiones inteligentes para respuestas habladas en panyabí.
- Audiolibros y contenido educativo: la disponibilidad de dos voces permite generar narraciones con alternancia de voces para materiales didácticos o cuentos, con una calidad medida de 2,13 % CER en frases de noticias.
- Sistemas de anuncios públicos y transporte: síntesis de mensajes dinámicos en panyabí para megafonía o paneles con voz, donde el despliegue en CPU reduce costes de infraestructura.
- Atención al cliente telefónica automatizada: integración en centralitas IVR para respuestas pregrabadas dinámicas en panyabí, con la ventaja de que el modelo cabe en 0,2 GB de repositorio y se ejecuta en el propio servidor de telefonía.
- Aplicaciones de aprendizaje de idiomas: generación de pronunciaciones de referencia en Gurmukhi para estudiantes, con la posibilidad de alternar voz masculina y femenina para exponer al alumno a distintas entonaciones.
- Preprocesado de datos para otros modelos: generación de audio sintético en panyabí para aumentar datasets de reconocimiento de voz o para pruebas de pipelines de ASR, dado el bajo coste computacional por frase.

## Benchmarks y rendimiento

Resultados de tasa de error de caracteres (CER, menor es mejor) en FLORES-200, 100 frases de noticias:

| Modelo | Tamano | CER (%) | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **2,13** | — |
| ai4bharat/IndicF5 | 350,6 M | 1,90 | igual (-0,23 puntos, IC 95 % [-0,50, +0,04]) |
| ai4bharat/vits_rasa_13 | 31,3 M | 2,66 | este modelo mejor (+0,53) |
| AI4Bharat/Indic-TTS (pa.zip) | 65,6 M | 3,01 | este modelo mejor (+0,89) |
| facebook/mms-tts-pan | 29,1 M | 3,16 | este modelo mejor (+1,04) |
| ai4bharat/indic-parler-tts | 937,8 M | 3,33 | este modelo mejor (+1,20) |
| multilingual-tts/VITS-OpenBible-Punjabi | 29,1 M | 5,39 | este modelo mejor (+3,26) |

Resultados en el conjunto de test retenido (299 frases):

| Modelo | Tamano | CER (%) | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **6,94** | — |
| AI4Bharat/Indic-TTS (pa.zip) | 65,6 M | 12,34 | este modelo mejor (+5,40) |
| facebook/mms-tts-pan | 29,1 M | 13,57 | este modelo mejor (+6,63) |
| multilingual-tts/VITS-OpenBible-Punjabi | 29,1 M | 25,93 | este modelo mejor (+18,98) |
| ai4bharat/vits_rasa_13 | 31,3 M | 6,64 | igual (-0,30) |

Comparación con modelos mayores en las mismas frases retenidas:

| Modelo | Tamano | Frases | CER (%) | Este modelo, mismas frases (%) | Resultado |
|---|---:|---:|---:|---:|---|
| ai4bharat/IndicF5 | 350,6 M | 40 | 5,67 | 6,48 | igual (-0,81) |
| ai4bharat/indic-parler-tts | 937,8 M | 40 | 22,79 | 6,48 | este modelo mejor (+16,31) |

Velocidad medida:

| Hardware | Configuracion | Veces mas rapido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7x | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38x | 0,026 |
| NVIDIA T4 | PyTorch | 62x | 0,016 |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; en CPU el modelo ocupa del orden de decenas de MB en pesos safetensors (8,93 M de parámetros), y el repositorio completo pesa 0,2 GB.
- GPU recomendadas: no son necesarias. En NVIDIA T4 alcanza un factor de tiempo real de 0,016 (62 veces más rápido que el tiempo real), pero el modelo está optimizado para CPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) y también en CPU de portátil; no se requiere VRAM dedicada.
- Opciones de despliegue: PyTorch y ONNX Runtime según la model card; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: factor de tiempo real de 0,136 en un hilo de CPU x86 (7x tiempo real) y 0,026 en Apple M1 (38x tiempo real); en T4, 0,016 (62x tiempo real).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER FLORES-200 (%) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Indic Tiny TTS: Punjabi** | 22,5 M | no disponible | 2,13 | CC-BY-4.0 | Hugging Face |
| ai4bharat/IndicF5 | 350,6 M | no disponible | 1,90 | no disponible | Hugging Face |
| facebook/mms-tts-pan | 29,1 M | no disponible | 3,16 | no disponible | Hugging Face |
| ai4bharat/indic-parler-tts | 937,8 M | no disponible | 3,33 | no disponible | Hugging Face |
| ai4bharat/vits_rasa_13 | 31,3 M | no disponible | 2,66 | no disponible | Hugging Face |

El modelo destaca por combinar un tamaño muy reducido con una CER competitiva frente a alternativas hasta 40 veces mayores, y por su licencia permisiva CC-BY-4.0, que facilita el uso comercial con atribución. Frente a IndicF5, la diferencia de error no es estadísticamente significativa, pero este modelo es aproximadamente 16 veces más pequeño y 142 veces más rápido en T4 según la model card.

## Limitaciones y advertencias

- Solo soporta panyabí en grafía Gurmukhi; no se documentan otros idiomas ni transliteraciones.
- La model card no detalla sesgos conocidos del corpus de entrenamiento (voces de AI4Bharat Rasa), por lo que no se puede evaluar la representatividad de acentos o registros.
- Riesgo de alucinación en TTS: el modelo puede producir pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o préstamos del inglés, no cuantificado en la información disponible.
- La CER de 6,94 % en el conjunto de test retenido es notablemente superior a la de 2,13 % en FLORES-200, lo que indica degradación en dominios distintos al de las frases de noticias.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero exige mantener el crédito al autor y no impone restricciones adicionales conocidas.
- No se documentan limitaciones de longitud de texto de entrada ni el comportamiento con textos muy largos.
- El modelo está marcado con `inference: false` en la model card, lo que puede indicar que la inferencia no está habilitada en el Hub; conviene verificar el despliegue local.
- No se especifican requisitos de audio de salida más allá de 24 kHz, ni se documenta el formato exacto de las muestras generadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-punjabi
- Colección INDIC TINY TTS MODELS: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset de entrenamiento indic-tts-mini-24k: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset indic-tts-multilingual-prepared: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Modelo comparado ai4bharat/IndicF5: https://huggingface.co/ai4bharat/IndicF5
- Modelo comparado ai4bharat/vits_rasa_13: https://huggingface.co/ai4bharat/vits_rasa_13
- Modelo comparado facebook/mms-tts-pan: https://huggingface.co/facebook/mms-tts-pan
- Modelo comparado ai4bharat/indic-parler-tts: https://huggingface.co/ai4bharat/indic-parler-tts
- Repositorio AI4Bharat Indic-TTS: https://github.com/AI4Bharat/Indic-TTS
