# sulabhkatiyar/indic-tiny-tts-gujarati

## Resumen

Indic Tiny TTS: Gujarati es un modelo de síntesis de voz (text-to-speech) desarrollado por sulabhkatiyar, diseñado específicamente para el idioma guyaratí. Forma parte de la colección "Indic Tiny TTS Models", compuesta por 12 modelos minúsculos, uno por idioma, que cubren 11 lenguas indias y el inglés indio. El modelo convierte texto en escritura guyaratí a audio de 24 kHz con dos voces disponibles (femenina y masculina), y su propuesta principal es ofrecer una calidad competitiva con un coste computacional mínimo: apenas 8,9 millones de parámetros según los pesos en safetensors y un tamaño de repositorio de 0,2 GB.

El modelo resuelve el problema de la síntesis de voz de calidad para guyaratí en entornos sin GPU. Según la model card, alcanza un CER del 2,03 % en frases de noticias de FLORES-200 y del 3,39 % en un conjunto de prueba reservado de 300 frases, superando a cinco modelos abiertos de guyaratí de mayor tamaño en la mayoría de comparaciones. Su velocidad es notable: 38 veces más rápido que el tiempo real en un solo hilo de CPU Apple M1, 7 veces en un hilo de CPU x86 y 62 veces en una GPU T4.

Es relevante ahora porque demuestra que un modelo de menos de 10 millones de parámetros puede igualar o superar en inteligibilidad a modelos de 350 M y 937 M de parámetros (IndicF5 e indic-parler-tts) en las mismas frases, con un factor de velocidad entre 100 y 140 veces superior en T4. Está pensado para despliegue en dispositivo (on-device) y en CPU, con formatos PyTorch y ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; la model card no detalla la arquitectura interna) |
| Parametros totales | 8.933.385 (pesos en safetensors); la model card indica 22,5 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no procesa contexto de texto largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | guyaratí (gu) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo (no se indica si es un transformer, un modelo acústico tipo VITS, un modelo basado en difusión o un híbrido). Lo que sí se documenta es que el modelo funciona con PyTorch y ONNX Runtime, que genera audio a 24 kHz y que dispone de dos voces seleccionables mediante el parámetro `voice` (`"female"` y `"male"`). El número de parámetros es objeto de discrepancia: los pesos en safetensors suman 8.933.385, mientras que la model card declara 22,5 M.

En cuanto a los datos de entrenamiento, el modelo se entrenó con el dataset `sulabhkatiyar/indic-tts-mini-24k`, que contiene las voces femenina y masculina de guyaratí de AI4Bharat Rasa a 24 kHz, derivadas del dataset completo `sulabhkatiyar/indic-tts-multilingual-prepared`. También se menciona el dataset `ai4bharat/Rasa` como fuente. No se detalla el número de tokens, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS). No se documentan innovaciones técnicas específicas más allá de la optimización para inferencia en CPU y el soporte ONNX.

## Capacidades

- Síntesis de voz a partir de texto en escritura guyaratí, con salida de audio a 24 kHz.
- Dos voces seleccionables: femenina y masculina.
- Inferencia en CPU sin necesidad de GPU, con soporte para PyTorch y ONNX Runtime.
- Ejecución en dispositivo (on-device), adecuada para entornos con recursos limitados.
- Baja tasa de error de reconocimiento en frases de noticias y en conjuntos de prueba reservados.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es un modelo exclusivamente de texto a voz.
- Capacidad multilingüe limitada al guyaratí; no se indica soporte para otros idiomas.

## Casos de uso

- Lectura de noticias y contenido editorial en guyaratí: el modelo sintetiza frases de estilo periodístico con un CER del 2,03 % en FLORES-200, lo que lo hace adecuado para convertir artículos o boletines en audio con inteligibilidad alta.
- Asistentes de voz en dispositivos móviles o embebidos: con 8,9 M de parámetros y funcionamiento en CPU (38× tiempo real en M1, 7× en x86), puede integrarse en aplicaciones Android o sistemas empotrados sin GPU.
- Accesibilidad para personas con discapacidad visual: la síntesis de texto a voz en guyaratí permite leer pantallas, documentos o mensajes en voz alta en el propio dispositivo, sin depender de servicios en la nube.
- Audiolibros y contenido educativo: la disponibilidad de dos voces permite generar narraciones para materiales didácticos o libros en guyaratí con un coste computacional mínimo.
- Sistemas de anuncios y megafonía automatizada: la velocidad de inferencia (factor de tiempo real de 0,016 en T4) permite generar avisos pregrabados o dinámicos para transporte, comercios o servicios públicos.
- Prototipado e investigación en TTS para lenguas de bajos recursos: al ser un modelo pequeño, abierto (CC BY 4.0) y con datasets de entrenamiento publicados, sirve como base para experimentos de fine-tuning o para comparar metodologías en guyaratí.
- Integración en pipelines de accesibilidad web: conversión de contenido textual en guyaratí a audio bajo demanda, con despliegue en servidores sin GPU mediante ONNX Runtime.

## Benchmarks y rendimiento

Resultados de la model card en frases de noticias de FLORES-200 (100 frases), medidos como CER (menor es mejor):

| Modelo | Tamano | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **2,03** | — |
| `github.com/AI4Bharat/Indic-TTS` (gu.zip) | 65,6 M | 1,66 | Mejor el suyo |
| `ai4bharat/IndicF5` | 350,6 M | 1,73 | Igual |
| `ai4bharat/indic-parler-tts` | 937,8 M | 2,50 | Mejor el nuestro |
| `Arjun4707/piper-gujarati-male` (gu_epoch229) | 15,9 M | 2,92 | Mejor el nuestro |
| `SYSPIN/vits_Gujarati_Female` + `SYSPIN/vits_Gujarati_Male` | 29,1 M | 3,14 | Mejor el nuestro |
| `facebook/mms-tts-guj` | 29,1 M | 4,03 | Mejor el nuestro |
| `multilingual-tts/VITS-OpenBible-Gujarati` | 29,1 M | 6,32 | Mejor el nuestro |

Resultados en conjunto de prueba reservado (300 frases):

| Modelo | Tamano | CER, % | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **3,39** | — |
| `github.com/AI4Bharat/Indic-TTS` (gu.zip) | 65,6 M | 4,86 | Mejor el nuestro |
| `facebook/mms-tts-guj` | 29,1 M | 7,38 | Mejor el nuestro |
| `SYSPIN/vits_Gujarati_Female` + `SYSPIN/vits_Gujarati_Male` | 29,1 M | 7,73 | Mejor el nuestro |
| `multilingual-tts/VITS-OpenBible-Gujarati` | 29,1 M | 15,13 | Mejor el nuestro |
| `Arjun4707/piper-gujarati-male` (gu_epoch229) | 15,9 M | 4,61 | Mejor el nuestro |

Comparación con modelos mayores en las mismas frases reservadas:

| Modelo | Tamano | Frases | CER, % | CER de este modelo, % | Resultado |
|---|---:|---:|---:|---:|---|
| `ai4bharat/indic-parler-tts` | 937,8 M | 40 | 3,15 | 2,65 | Igual |
| `ai4bharat/IndicF5` | 350,6 M | 40 | 3,23 | 2,65 | Igual |

Velocidad:

| Hardware | Configuracion | Mas rapido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7× | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38× | 0,026 |
| NVIDIA T4 GPU | PyTorch | 62× | 0,016 |

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; en GPU, el modelo es tan pequeño (0,2 GB de repositorio) que cabe holgadamente en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: NVIDIA T4 (62× tiempo real según la model card), y por tamaño cabría en RTX 4090, A100, H100 y cualquier GPU consumer moderna.
- Cabe en GPU consumer: sí, en cualquier GPU con memoria suficiente para cargar el modelo (prácticamente todas).
- Funciona en CPU sin GPU: sí, con PyTorch (7× tiempo real en un hilo x86, 38× en Apple M1) y con ONNX Runtime.
- Opciones de despliegue: PyTorch y ONNX Runtime documentados; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: factor de tiempo real de 0,136 en CPU x86 de un hilo, 0,026 en Apple M1 y 0,016 en T4; la model card indica que es ~112× más rápido que indic-parler-tts y ~142× más rápido que IndicF5 en T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (FLORES-200) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Indic Tiny TTS: Gujarati** | 8,9 M (safetensors) / 22,5 M (model card) | no disponible | 2,03 % | CC BY 4.0 | Hugging Face, ONNX y safetensors |
| `ai4bharat/IndicF5` | 350,6 M | no disponible | 1,73 % | no disponible | Hugging Face |
| `ai4bharat/indic-parler-tts` | 937,8 M | no disponible | 2,50 % | no disponible | Hugging Face |
| `facebook/mms-tts-guj` | 29,1 M | no disponible | 4,03 % | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo soporta guyaratí; no es multilingüe y no se documenta soporte para otros idiomas.
- El CER no es cero: en el conjunto reservado alcanza el 3,39 %, por lo que pueden producirse errores de pronunciación o inteligibilidad en palabras poco frecuentes o nombres propios.
- No se documentan sesgos específicos, pero al entrenarse con voces de AI4Bharat Rasa, la calidad puede variar según el dominio y el registro del texto de entrada.
- Riesgo de alucinación en el sentido de generar audio incorrecto o ininteligible para entradas fuera de distribución; no se han publicado evaluaciones de robustez ante texto ruidoso, abreviaturas o números.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero no se detallan restricciones adicionales sobre las voces o los datos de entrenamiento subyacentes.
- Discrepancia en el número de parámetros (8,9 M en safetensors frente a 22,5 M en la model card), lo que conviene verificar antes de dimensionar despliegues.
- No se documentan mecanismos de control de prosodia, emoción ni velocidad más allá de la selección de voz.
- La model card marca `inference: false`, lo que puede indicar que el pipeline de inferencia automática de Hugging Face no está habilitado, aunque el modelo es utilizable con PyTorch y ONNX Runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-gujarati
- Colección Indic Tiny TTS Models: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset de entrenamiento: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset multilingüe preparado: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Modelo comparado AI4Bharat Indic-TTS: https://github.com/AI4Bharat/Indic-TTS
- Modelo comparado ai4bharat/IndicF5: https://huggingface.co/ai4bharat/IndicF5
- Modelo comparado ai4bharat/indic-parler-tts: https://huggingface.co/ai4bharat/indic-parler-tts
- Modelo comparado facebook/mms-tts-guj: https://huggingface.co/facebook/mms-tts-guj
