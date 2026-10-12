# TakeboxLLM/saying

## Resumen

El repositorio TakeboxLLM/saying no contiene un modelo propio: aloja una copia de los pesos de los modelos Whisper de OpenAI convertidos al formato ggml para su uso con whisper.cpp. Whisper es un sistema de reconocimiento automático del habla (ASR) de tipo transformer encoder-decoder, entrenado con supervisión débil sobre 680.000 horas de audio etiquetado, que resuelve transcripción multilingüe, traducción al inglés y detección de idioma dentro de una única arquitectura.

La copia publicada cubre las cinco tallas originales (tiny, base, small, medium y large), las variantes solo-inglés con sufijo .en, las versiones large-v1, large-v2, large-v3 y large-v3-turbo, y tres niveles de cuantización (q5_0, q5_1 y q8_0) además del peso F16 sin cuantizar. El repositorio ocupa 31,0 GB y se distribuye como archivos .bin de ggml, no como safetensors ni GGUF.

Su relevancia es de despliegue: whisper.cpp ejecuta la inferencia en CPU, Apple Silicon, CUDA o Vulkan sin depender de PyTorch ni de Python, con modelos que van de 31 MiB (tiny-q5_1) a 2,9 GiB (large-v3). El repositorio, sin embargo, no aporta model card propia (el README está copiado de whisper.cpp), no declara idiomas soportados ni publica resultados, y no es la fuente canónica; para producción conviene acudir a ggerganov/whisper.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para ASR; pesos convertidos a ggml para whisper.cpp |
| Parámetros totales | Según variante: 39 M (tiny), 74 M (base), 244 M (small), 769 M (medium), 1550 M (large-v1/v2/v3) y 809 M (large-v3-turbo). Cifras de la documentación original de OpenAI, no declaradas en este repositorio |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Ventana de audio de 30 s por segmento (1500 fotogramas de espectrograma log-mel de 80 bins; 3000 fotogramas con 128 bins en large-v3) |
| Tipos de cuantización | F16 sin cuantizar, q5_0, q5_1 y q8_0 (formato ggml) |
| Idiomas soportados | 99 idiomas en los modelos multilingües y únicamente inglés en las variantes .en (dato de la documentación de OpenAI); el repositorio no declara lista de idiomas |
| Licencia | MIT |
| Formato de pesos | ggml (archivos .bin para whisper.cpp); no incluye safetensors ni GGUF nativo |

Variantes incluidas en el repositorio (tamaño en disco):

| Variante | F16 | q5 | q8 |
|---|---|---|---|
| tiny | 75 MiB | 31 MiB (q5_1) | 42 MiB (q8_0) |
| tiny.en | 75 MiB | 31 MiB (q5_1) | 42 MiB (q8_0) |
| base | 142 MiB | 57 MiB (q5_1) | 78 MiB (q8_0) |
| base.en | 142 MiB | 57 MiB (q5_1) | 78 MiB (q8_0) |
| small | 466 MiB | 181 MiB (q5_1) | 252 MiB (q8_0) |
| small.en | 466 MiB | 181 MiB (q5_1) | 252 MiB (q8_0) |
| small.en-tdrz | 465 MiB | no disponible | no disponible |
| medium | 1,5 GiB | 514 MiB (q5_0) | 785 MiB (q8_0) |
| medium.en | 1,5 GiB | 514 MiB (q5_0) | 785 MiB (q8_0) |
| large-v1 | 2,9 GiB | no disponible | no disponible |
| large-v2 | 2,9 GiB | 1,1 GiB (q5_0) | 1,5 GiB (q8_0) |
| large-v3 | 2,9 GiB | 1,1 GiB (q5_0) | no disponible |
| large-v3-turbo | 1,5 GiB | 547 MiB (q5_0) | 834 MiB (q8_0) |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder estándar que recibe un espectrograma log-mel de 30 segundos normalizado y genera tokens de texto de forma autorregresiva. El modelo unifica varias tareas mediante tokens especiales de control (transcripción, traducción al inglés, identificación de idioma y marcas de tiempo), de modo que una sola red resuelve tareas que tradicionalmente requerían sistemas separados. La entrada se procesa con 80 canales mel en todas las variantes, salvo large-v3, que emplea 128. La variante large-v3-turbo reduce el decodificador de 32 a 4 capas para acelerar la generación manteniendo el codificador completo.

El entrenamiento descrito por OpenAI se basa en supervisión débil: 680.000 horas de audio y transcripciones recopiladas de la web, de las cuales 117.000 horas cubren 96 idiomas distintos y 125.000 horas corresponden a datos de traducción hacia inglés. No se documenta uso de RLHF ni DPO. La conversión a ggml que contiene este repositorio no reentrena el modelo: únicamente transforma y cuantiza los pesos originales para que whisper.cpp pueda ejecutarlos, por lo que la innovación técnica atribuible al repositorio se limita al formato y a las cuantizaciones q5_0, q5_1 y q8_0.

## Capacidades

- Transcripción de voz a texto en 99 idiomas con las variantes multilingües y solo en inglés con las variantes .en.
- Traducción de audio en otro idioma directamente al inglés (tarea translate).
- Detección automática del idioma de entrada.
- Generación de marcas de tiempo a nivel de segmento y de palabra (esta última requiere alineación posterior con herramientas como WhisperX).
- Procesamiento de audio largo mediante ventanas deslizantes de 30 segundos gestionadas por whisper.cpp.
- Ejecución local en CPU, Apple Silicon (Metal), CUDA y Vulkan, sin dependencias de Python.
- API de servidor incluida en whisper.cpp y enlaces (bindings) para Python, Go, Rust, Node.js y otros lenguajes.
- Reconocimiento sobre audio en streaming por bloques, con la lógica de troceado implementada por la aplicación anfitriona.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio como entrada más allá de la propia señal de voz.

## Casos de uso

- Subtitulado automático de vídeo: transcripción con marcas de tiempo que se exportan a SRT o VTT para plataformas de vídeo; large-v3 en Metal o CUDA ofrece la mejor calidad, mientras que small o medium bastan para previsualizaciones.
- Transcripción privada de reuniones y notas de voz: al ejecutarse enteramente en local con whisper.cpp, el audio no sale del equipo, lo que encaja en entornos con requisitos de confidencialidad o RGPD.
- Archivado y búsqueda de contenido sonoro: indexación de podcasts, grabaciones de clase o entrevistas convirtiendo horas de audio en texto consultable con medium o large-v3.
- Integración en aplicaciones de escritorio y móviles: los modelos tiny y base cuantizados a q5_1 (31-57 MiB) caben en binarios distribuidos con la propia app y funcionan sin conexión.
- Procesamiento por lotes en servidor: transcripción masiva de llamadas o audios de contacto mediante large-v3-turbo, que reduce el coste de decodificación al usar solo 4 capas de decodificador.
- Accesibilidad: generación de subtítulos en directo o en diferido para personas con discapacidad auditiva en emisiones, eventos y material formativo.
- Asistentes de voz con razonamiento posterior: la salida de texto de Whisper se encadena a un LLM que ejecuta la lógica de diálogo o las herramientas externas.
- Traducción de contenido audiovisual extranjero: la tarea de traducción a inglés permite obtener una versión inglesa del audio sin pasar por un traductor de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio es una copia del README de whisper.cpp y no incluye WER, latencia ni comparativas; la búsqueda web asociada no devolvió resultados relevantes sobre el modelo (devolvió páginas sobre la saga cinematográfica xXx y el dominio .xxx, sin relación con el repositorio). El artículo original de OpenAI sobre Whisper sí publica métricas de WER, pero no se reproducen aquí por no formar parte de la información proporcionada.

## Requisitos de hardware

- El consumo de memoria es aproximadamente el tamaño del archivo más el estado de decodificación y el overhead del runtime; como referencia, F16 va de 75 MiB (tiny) a 2,9 GiB (large-v3), y las versiones cuantizadas bajan hasta 31 MiB (tiny-q5_1) y 547 MiB (large-v3-turbo-q5_0).
- GPU consumer: cualquier GPU con 8 GB de VRAM puede ejecutar large-v3 en F16 con margen; con 4 GB conviene usar q5_0 o q8_0. Las series RTX 3060/4060 y superiores son suficientes. A100 y H100 solo se justifican para lotes muy grandes o muchos flujos concurrentes.
- Apple Silicon: los modelos corren sobre Metal en chips M1 y posteriores; tiny, base y small son viables incluso en iPhone y iPad mediante bindings de whisper.cpp.
- CPU y edge: tiny y base cuantizados funcionan en Raspberry Pi 4/5 y en equipos sin GPU; medium y large en CPU pura son lentos para uso interactivo.
- Despliegue: whisper.cpp (CLI y servidor HTTP), bindings oficiales y de terceros, y el add-on de Whisper para Home Assistant. faster-whisper y WhisperX requieren los pesos en formato CTranslate2 o PyTorch, no los .bin de ggml de este repositorio; vLLM no consume pesos ggml de Whisper.
- Latencia y throughput: no disponible. Dependen del backend (CPU frente a Metal/CUDA), de la variante y de la cuantización; el repositorio no publica cifras para estas conversiones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| Whisper ggml (este repositorio) | 39 M a 1550 M según variante | Ventana de 30 s | MIT | ggml (.bin) para whisper.cpp; copia no canónica |
| Whisper original (OpenAI) | 39 M a 1550 M | Ventana de 30 s | MIT | safetensors/PyTorch; referencia canónica y base de este repositorio |
| faster-whisper (CTranslate2) | Mismos pesos de Whisper | Ventana de 30 s | MIT (según su repositorio) | CTranslate2; mayor throughput en GPU y CPU que la implementación de referencia |
| Distil-Whisper large-v3 | 756 M (según su documentación) | Ventana de 30 s | MIT (según su repositorio) | safetensors; solo inglés, destilado para latencia baja |
| NVIDIA Canary-1B | 1 B (según su documentación) | No disponible | CC-BY-NC-4.0; uso comercial restringido | NeMo; ASR y traducción, licencia no apta para producto comercial |

Nota: los datos de los modelos comparados provienen de su documentación pública; no se dispone de una comparativa de WER verificada dentro de la información proporcionada.

## Limitaciones y advertencias

- Repositorio no canónico: TakeboxLLM/saying replica los pesos publicados por ggerganov/whisper.cpp sin model card propia, sin declaración de idiomas y con 0 descargas y 0 likes. Para producción conviene verificar los hashes SHA contra el repositorio original antes de usar estos archivos.
- Riesgo de alucinación: Whisper puede generar texto plausible en tramos de silencio, ruido o música, y repetir frases en bucle. Es un problema conocido en audio largo y exige validación o VAD previo.
- Sin diarización: el modelo no distingue hablantes; para atribuir turnos hay que combinarlo con herramientas externas.
- Idiomas: el rendimiento varía mucho entre lenguas; las variantes .en no transcriben otros idiomas y las multilingües tienen mayor WER en lenguas con pocos datos.
- Contexto fijo de 30 segundos: el audio largo requiere troceado con solapamiento; una gestión incorrecta de las fronteras degrada la transcripción.
- Sin marcas de tiempo a nivel de palabra de forma nativa, y sin soporte de tool calling ni agentes.
- Licencia MIT: permite uso comercial, pero al tratarse de una redistribución de pesos de terceros conviene conservar la atribución a OpenAI y a whisper.cpp.
- Formato: los .bin de ggml no son compatibles con vLLM, TGI ni con los pipelines de transformers que esperan safetensors.
- Idiomas soportados, benchmarks y requisitos de latencia no están documentados en este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TakeboxLLM/saying
- Modelos originales de whisper.cpp: https://huggingface.co/ggerganov/whisper.cpp/tree/main
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Documentación de modelos de whisper.cpp: https://github.com/ggerganov/whisper.cpp/tree/master/models
- Repositorio original de OpenAI Whisper: no disponible en la información proporcionada
- Artículo de OpenAI sobre Whisper: no disponible en la información proporcionada
- Resultados de la búsqueda web: sin resultados relevantes (devolvió páginas sobre la saga de películas xXx y el dominio .xxx, sin relación con el modelo)
