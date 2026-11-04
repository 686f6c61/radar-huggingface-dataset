# sulabhkatiyar/indic-tiny-tts-hindi

## Resumen

Indic Tiny TTS: Hindi es un modelo de síntesis de voz (text-to-speech) de dominio público desarrollado por el usuario independiente sulabhkatiyar, diseñado específicamente para leer texto en escritura devanagari en hindi con dos voces (femenina y masculina). Con solo 8,9 millones de parámetros según los pesos en safetensors (la model card declara 22,5 M, discrepancia que conviene tener en cuenta), el modelo se posiciona como una alternativa ultracompacta frente a sistemas TTS multilingües de cientos de millones de parámetros, y está pensado para ejecutarse en CPU sin GPU.

Su relevancia actual radica en dos factores. Primero, la eficiencia: según los datos del autor, sintetiza 38 veces más rápido que el tiempo real en un solo hilo de CPU Apple M1 y 7 veces en un hilo x86, lo que lo hace viable en dispositivos de gama baja, entornos embebidos y despliegues de alto volumen donde el coste por petición importa. Segundo, la calidad relativa: en la evaluación con frases de noticias de FLORES-200 reporta un CER del 1,64 %, mejor que modelos abiertos de hindi bastante más grandes como XTTS-v2 (466,9 M) o indic-parler-tts (937,8 M).

El modelo forma parte de la colección Indic Tiny TTS Models, que agrupa doce modelos pequeños, uno por idioma, para once lenguas indias y el inglés indio. Se distribuye con pesos en safetensors y ONNX, licencia CC-BY-4.0, y soporta únicamente hindi.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; no se especifica en la información proporcionada) |
| Parámetros totales | 8.933.641 según safetensors; la model card declara 22,5 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hindi (hi) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX |
| Pipeline | text-to-speech |
| Frecuencia de muestreo | 24 kHz |
| Voces | femenina y masculina |
| Script de entrada | devanagari |
| Tamaño del repositorio | 0,2 GB |
| Descargas | 127 |
| Fecha de creación | 2026-10-18 |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo (no se especifica si es un VITS, un modelo acústico con vocoder separado, un diffusion-based TTS u otra familia). Lo que sí se documenta es el pipeline: entrada de texto en devanagari, salida de audio a 24 kHz, con selección de voz mediante el parámetro `voice="female"` o `voice="male"`, y ejecución tanto en PyTorch como en ONNX Runtime.

El entrenamiento se realizó sobre el subconjunto de 8 horas por voz (`index/pilot.parquet`) del dataset sulabhkatiyar/indic-tts-mini-24k, derivado a su vez de las voces hindi femenina y masculina de AI4Bharat Rasa a 24 kHz, y de la versión completa sulabhkatiyar/indic-tts-multilingual-prepared. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset, ni si hubo etapas de RLHF, DPO o ajuste fino con preferencias humanas; para un modelo TTS estas etapas no son habituales, pero el dato no está confirmado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en escritura devanagari (hindi), con salida de audio a 24 kHz.
- Dos voces seleccionables: femenina y masculina.
- Ejecución en CPU sin GPU, con soporte de PyTorch y ONNX Runtime.
- Inferencia en un solo hilo de CPU, lo que permite despliegues en entornos con recursos muy limitados.
- Factor de tiempo real de 0,136 en x86 (7× más rápido que tiempo real) y 0,026 en Apple M1 (38× más rápido).
- En GPU NVIDIA T4 alcanza un factor de tiempo real de 0,016 (62× más rápido que tiempo real).
- No se documentan capacidades de clonación de voz, control de estilo, emoción, prosodia ajustable, tool calling ni razonamiento multi-paso; es un modelo exclusivamente de síntesis de voz.
- Capacidad multilingüe: limitada a hindi; existen modelos hermanos en la misma colección para otras lenguas indias, pero este checkpoint concreto no las cubre.

## Casos de uso

- Lectura de noticias y artículos en hindi: el modelo está evaluado precisamente con frases de noticias de FLORES-200 y obtiene un CER del 1,64 %, por lo que es adecuado para convertir titulares y cuerpos de texto periodístico en audio con calidad de reconocimiento alta.
- Asistentes de voz en dispositivos de gama baja: al ejecutarse 38× más rápido que tiempo real en un solo hilo de M1 y 7× en x86, puede integrarse en routers, Raspberry Pi o portátiles sin GPU para dar respuestas habladas en hindi sin depender de la nube.
- Accesibilidad para personas con discapacidad visual: lectura de interfaces, documentos y contenido web en hindi con latencia muy baja y sin coste de GPU, lo que permite desplegarlo localmente en el navegador o en el sistema operativo.
- Sistemas de anuncios y megafonía automatizada: generación de avisos pregrabados o dinámicos en hindi (estaciones, aeropuertos, comercios) donde el coste por síntesis y la velocidad de generación son críticos y no se requiere clonación de voz.
- Aprendizaje de idiomas: generación de audio de pronunciación para materiales de hindi con dos voces distintas, útil para aplicaciones educativas que necesitan alternar entre voz masculina y femenina sin multiplicar el coste computacional.
- Integración en pipelines de CI/CD para pruebas de regresión de TTS: su tamaño reducido (0,2 GB de repositorio) y su velocidad permiten ejecutar suites de evaluación de calidad de audio en cada commit sin infraestructura GPU.
- Preprocesamiento de datasets de voz: generación de audio sintético en hindi para aumentar datos de entrenamiento de modelos ASR o de clasificación de audio, con la ventaja de que el modelo es ligero y se puede paralelizar en CPU.
- Despliegue en entornos con requisitos de privacidad: al no necesitar GPU ni conexión a servicios externos, puede ejecutarse íntegramente on-premise para leer documentos confidenciales en hindi.

## Benchmarks y rendimiento

Los datos de la model card comparan el CER (character error rate, menor es mejor) frente a otros modelos abiertos de hindi. Se reproducen a continuación.

FLORES-200, 100 frases de noticias:

| Modelo | Tamaño | CER (%) | Diferencia frente a este modelo (pp, IC 95 %) | Resultado |
|---|---:|---:|---:|---|
| Este modelo | 22,5 M | 1,64 | — | — |
| ai4bharat/IndicF5 | 350,6 M | 1,02 | -0,62 [-0,93, -0,35] | mejor el suyo |
| AI4Bharat/Indic-TTS (hi.zip) | 65,6 M | 1,33 | -0,31 [-0,63, -0,00] | mejor el suyo |
| hexgrad/Kokoro-82M | 81,8 M | 1,56 | -0,08 [-0,38, +0,20] | equivalente |
| ai4bharat/indic-parler-tts | 937,8 M | 2,23 | +0,59 [+0,13, +1,05] | mejor el nuestro |
| coqui/XTTS-v2 | 466,9 M | 2,37 | +0,73 [+0,18, +1,34] | mejor el nuestro |
| facebook/mms-tts-hin | 29,1 M | 3,83 | +2,19 [+1,48, +2,92] | mejor el nuestro |
| SYSPIN/vits_Hindi_Female + Male | 29,1 M | 5,58 | +3,93 [+2,48, +6,22] | mejor el nuestro |

Frases de test reservadas, 300 frases:

| Modelo | Tamaño | CER (%) | Diferencia frente a este modelo (pp, IC 95 %) | Resultado |
|---|---:|---:|---:|---|
| Este modelo | 22,5 M | 3,03 | — | — |
| AI4Bharat/Indic-TTS (hi.zip) | 65,6 M | 3,21 | +0,18 [-0,44, +0,79] | equivalente |
| hexgrad/Kokoro-82M | 81,8 M | 3,29 | +0,27 [-0,38, +0,97] | equivalente |
| rhasspy/piper-voices (hi_IN-rohan-medium) | 15,8 M | 3,80 | +0,77 [+0,16, +1,42] | mejor el nuestro |
| rhasspy/piper-voices (hi_IN-priyamvada-medium) | 15,8 M | 4,53 | +1,50 [+0,70, +2,41] | mejor el nuestro |
| facebook/mms-tts-hin | 29,1 M | 9,00 | +5,98 [+4,51, +7,53] | mejor el nuestro |
| SYSPIN/vits_Hindi_Female + Male | 29,1 M | 11,82 | +8,79 [+6,65, +11,06] | mejor el nuestro |

Comparación con modelos más grandes en las mismas frases reservadas:

| Modelo | Tamaño | Frases | CER (%) | Este modelo, mismas frases (%) | Diferencia (pp, IC 95 %) | Resultado |
|---|---:|---:|---:|---:|---:|---|
| coqui/XTTS-v2 | 466,9 M | 300 | 21,33 | 3,03 | +18,30 [+9,97, +28,95] | mejor el nuestro |
| ai4bharat/IndicF5 | 350,6 M | 40 | 1,99 | 2,15 | -0,15 [-1,20, +1,19] | equivalente |
| ai4bharat/indic-parler-tts | 937,8 M | 40 | 2,22 | 2,15 | +0,07 [-0,99, +1,35] | equivalente |

Velocidad:

| Hardware | Configuración | Veces más rápido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7× | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38× | 0,026 |
| NVIDIA T4 | PyTorch | 62× | 0,016 |

Según la model card, es 37× más rápido que coqui/XTTS-v2 en CPU, y alcanza el mismo CER que indic-parler-tts con 1/42 del tamaño y unas 110× más rápido en T4, y el mismo CER que IndicF5 con 1/16 del tamaño y unas 170× más rápido en T4.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 8,9 M de parámetros en safetensors y un repositorio de 0,2 GB, el modelo cabe holgadamente en cualquier GPU consumer, pero no se publican cifras de VRAM pico.
- GPU recomendadas: NVIDIA T4 es la referencia medida en la model card (factor de tiempo real 0,016). No se documentan mediciones en A100, H100 ni RTX 4090.
- GPU consumer: sí cabe en cualquier GPU consumer moderna por tamaño; el modelo está optimizado para CPU, por lo que la GPU no es requisito.
- CPU: funciona en un solo hilo tanto en x86 (7× tiempo real) como en Apple M1 (38× tiempo real).
- Opciones de despliegue: PyTorch y ONNX Runtime están documentados explícitamente. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a TTS).
- Latencia y throughput: factor de tiempo real de 0,136 en x86 de 4 vCPU, 0,026 en M1 y 0,016 en T4, medido sobre 30 frases reservadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | CER FLORES-200 (%) | CER test reservado (%) | Licencia | Comentario |
|---|---:|---|---:|---:|---|---|
| Indic Tiny TTS: Hindi (este) | 8,9 M (safetensors) / 22,5 M (card) | hindi | 1,64 | 3,03 | CC-BY-4.0 | Ultrarrapido en CPU, dos voces |
| hexgrad/Kokoro-82M | 81,8 M | multilingüe | 1,56 | 3,29 | no disponible en la información | Equivalente en calidad, mucho mayor |
| AI4Bharat/Indic-TTS (hi.zip) | 65,6 M | hindi | 1,33 | 3,21 | no disponible en la información | Ligeramente mejor en FLORES, equivalente en test |
| ai4bharat/IndicF5 | 350,6 M | hindi | 1,02 | 1,99 (40 frases) | no disponible en la información | Mejor CER, 16× más grande y ~170× más lento en T4 |
| coqui/XTTS-v2 | 466,9 M | multilingüe | 2,37 | 21,33 | no disponible en la información | Peor CER en hindi y 37× más lento en CPU |
| facebook/mms-tts-hin | 29,1 M | hindi | 3,83 | 9,00 | no disponible en la información | Peor CER en ambas pruebas |

## Limitaciones y advertencias

- Solo soporta hindi y escritura devanagari; no se documenta transliteración ni entrada en alfabeto latino.
- El modelo está entrenado con 8 horas por voz de un único dataset (AI4Bharat Rasa), lo que limita la diversidad de hablantes, acentos y estilos; no se documentan capacidades de clonación ni de control de emoción.
- Discrepancia entre el número de parámetros de la model card (22,5 M) y el recuento real de safetensors (8.933.641); conviene verificar antes de dimensionar infraestructura.
- No se han publicado datos sobre sesgos de género, dialecto o registro; al entrenarse con voces concretas, puede reproducir sesgos prosódicos o de pronunciación de esas voces.
- Riesgo de alucinación en el sentido de pronunciación incorrecta de palabras fuera del dominio de entrenamiento (nombres propios, siglas, términos técnicos, números); el CER del 3,03 % en test reservado indica que persisten errores.
- No se documentan mecanismos de normalización de texto (números, abreviaturas, signos de puntuación) ni su comportamiento ante texto mixto hindi-inglés.
- La licencia CC-BY-4.0 permite uso comercial con atribución; no se especifican restricciones adicionales, pero conviene revisar los términos de los datasets de origen (AI4Bharat Rasa) antes de un despliegue comercial.
- No se documentan garantías de calidad en dominios distintos de noticias y frases de evaluación; el rendimiento en conversación espontánea, poesía o texto técnico no está medido.
- El modelo tiene 127 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- No se documenta el comportamiento en entornos de producción concurrentes (múltiples peticiones simultáneas) ni el consumo de memoria pico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-hindi
- Colección Indic Tiny TTS Models: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset de entrenamiento principal: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset multilingüe preparado: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Gráfica de benchmark FLORES-200: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-hindi/resolve/main/assets/bench_flores.png
- Gráfica de benchmark en test reservado: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-hindi/resolve/main/assets/bench_rasa.png
- Gráfica comparativa con modelos grandes: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-hindi/resolve/main/assets/bench_big.png
- Muestra de audio, voz femenina 1: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-hindi/resolve/main/samples/female_1.wav
- Muestra de audio, voz femenina 2: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-hindi/resolve/main/samples/female_2.wav
