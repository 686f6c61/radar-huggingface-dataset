# yorganci/whisper-large-v3-6bit-coreml

## Resumen

`yorganci/whisper-large-v3-6bit-coreml` es una conversión a Core ML de `openai/whisper-large-v3`, optimizada para ejecutarse en la Neural Engine y la CPU de los chips Apple Silicon. El modelo lo publica el usuario yorganci como parte del proyecto `transcribe` y se distribuye como un paquete de modelos Core ML compilados, no como pesos PyTorch o safetensors. El objetivo es permitir la transcripción de voz local, sin conexión a internet y sin GPU dedicada, aprovechando el hardware de aceleración de los Mac y dispositivos Apple recientes.

El paquete reproduce la arquitectura encoder-decoder de Whisper large-v3 (aproximadamente 1.550 millones de parámetros en el modelo base) con compresión de pesos a 6 bits mediante paletas k-means por tensor en el encoder y el decoder, mientras que el frontend se mantiene sin comprimir. El resultado ocupa 1.111 MiB repartidos en 17 ficheros dentro de un repositorio de 1,2 GB, muy por debajo de los aproximadamente 3 GB del modelo original en float16.

Su relevancia actual radica en que permite ejecutar un modelo de reconocimiento automático de voz de gama alta y multilingüe (100 idiomas) de forma nativa en Apple Silicon, con licencia MIT, un formato empaquetado verificable mediante `manifest.json` con SHA-256 y una integración pensada para el crate Rust `transcribe-model-darwin`. No hay resultados de benchmarks publicados en la información disponible más allá de las tasas de error de la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), convertido a Core ML |
| Parametros totales | ~1.550 millones en el modelo base `openai/whisper-large-v3` (tamano del paquete: 1.111 MiB en 17 ficheros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 s por pasada; 448 tokens maximos de decodificacion por ventana en el modelo base. Soporte de audio largo mediante ventanas deslizantes con marcas de tiempo |
| Tipos de cuantizacion | Pesos en 6 bits con paletas k-means por tensor (encoder y decoder); frontend sin comprimir; conversion global en float16, con constantes del frontend en float32 |
| Idiomas soportados | 100 idiomas (af, am, ar, as, az, ba, be, bg, bn, bo, br, bs, ca, cs, cy, da, de, el, en, es, et, eu, fa, fi, fo, fr, gl, gu, ha, haw, he, hi, hr, ht, hu, hy, id, is, it, ja, jw, ka, kk, km, kn, ko, la, lb, ln, lo, lt, lv, mg, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, nn, no, oc, pa, pl, ps, pt, ro, ru, sa, sd, si, sk, sl, sn, so, sq, sr, su, sv, sw, ta, te, tg, th, tk, tl, tr, tt, uk, ur, uz, vi, yi, yo, yue, zh) |
| Licencia | MIT |
| Formato de pesos | Core ML (modelos compilados; encoder y decoder con paletas k-means de 6 bits, frontend sin comprimir) |
| Requisitos de plataforma | macOS 15.0 sobre Apple silicon |
| Herramientas de construccion | `transcribe-models` 0.0.1 (commit `f2d171f91efaba91053e99586c694d82c4238479`), `coremltools` 9.0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-large-v3`: un transformer encoder-decoder para reconocimiento automático de voz, entrenado por OpenAI sobre un corpus a gran escala de audio y texto débilmente supervisado, con capacidad multitarea (transcripción, traducción al inglés y detección de idioma) y 100 idiomas. Esta publicación no reentrena ni ajusta los pesos: es una conversión y compresión del checkpoint original `large-v3.pt`, descargado desde `openaipublic.azureedge.net`. No se dispone de información sobre la composición exacta del dataset, el número de tokens vistos durante el preentrenamiento ni el uso de RLHF o DPO en el modelo base dentro de la documentación aportada.

El paquete Core ML se divide en tres componentes. El `frontend`, que se ejecuta en CPU y no está comprimido, expone las funciones `audio_160000`, `audio_320000` y `audio_480000` (ventanas de audio de 10, 20 y 30 segundos a 16 kHz). El `encoder` y el `decoder` se ejecutan en CPU y Neural Engine, exponen las mismas tres variantes de audio (el decoder una única función) y almacenan sus pesos como paletas k-means de 6 bits por tensor. La conversión se hizo a float16, manteniendo las constantes del frontend en float32. La innovación principal es, por tanto, la cuantización a 6 bits compatible con la Neural Engine y la validación de integridad mediante un `manifest.json` con tamaños y SHA-256 de cada fichero, lo que permite descargar y verificar el paquete de forma incremental.

## Capacidades

- Transcripción de voz a texto en 100 idiomas, incluyendo castellano (`es`), catalán (`ca`), euskera (`eu`), gallego (`gl`), inglés, francés, alemán, japonés, chino, árabe, hindi y muchos otros.
- Traducción de audio a inglés (capacidad heredada del modelo base multitarea de Whisper).
- Detección automática de idioma en la entrada de audio.
- Procesamiento de audio largo mediante ventanas deslizantes con generación de marcas de tiempo; la model card documenta una evaluación long-form sobre un clip de 62 segundos.
- Tres variantes de función de entrada según la duración del audio (`audio_160000`, `audio_320000`, `audio_480000`), lo que permite elegir entre latencia y ventana de contexto.
- Inferencia 100 % local sobre Apple silicon, sin necesidad de conexión a red.
- Integración programática mediante el crate Rust `transcribe-model-darwin`, con la API `AnyModel::load` y `model.transcribe(Audio::new(&samples, 16_000), &TranscribeOptions::default())`.
- No se documenta soporte de tool calling, function calling, capacidades de agente, visión, audio generativo ni modo de razonamiento extendido: es un modelo exclusivamente de reconocimiento de voz.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo permite procesar audio en el propio Mac sin enviar datos a servicios en la nube, algo relevante para entornos con requisitos de confidencialidad. La ventana de 30 segundos por pasada y el modo long-form con marcas de tiempo cubren reuniones de duración arbitraria mediante segmentación.
- Subtitulado automático de vídeo: gracias a la generación de marcas de tiempo y a las tasas de error de 1,40 % en LibriSpeech test-clean y 0,70 % en el clip long-form, es adecuado para producir subtítulos en inglés con muy pocos errores y en 100 idiomas con calidad variable.
- Dictado y accesibilidad en aplicaciones de escritorio macOS: al estar empaquetado como Core ML y ejecutarse en la Neural Engine, se puede integrar en apps nativas para dictado en tiempo real sin depender de APIs externas ni de GPU dedicada.
- Análisis de llamadas de atención al cliente: el soporte de 100 idiomas y la detección automática de idioma permiten transcribir conversaciones multilingües para su posterior análisis de calidad, búsqueda de palabras clave o cumplimiento normativo.
- Archivado y búsqueda de contenido audiovisual: transcripción por lotes de un archivo de audio o vídeo para construir índices de búsqueda de texto completo sobre grabaciones, aprovechando que la inferencia es local y que el modelo pesa 1,1 GiB.
- Investigación lingüística y creación de corpus: cobertura de 100 idiomas (incluidos idiomas de bajos recursos como `haw`, `yue`, `ln`, `mg` o `bo`), con la posibilidad de verificar la integridad de los pesos descargados mediante SHA-256.
- Prototipado y pruebas de integración en Rust: el crate `transcribe-model-darwin` permite cargar el paquete y transcribir directamente desde código Rust, lo que facilita incluirlo en pipelines de CI de aplicaciones de escritorio o en herramientas de línea de comandos para macOS.

## Benchmarks y rendimiento

Los únicos datos de evaluación publicados son los de la model card, medidos con `transcribe-eval` sobre un Apple M4. Las tasas de error se expresan en caracteres para japonés y en palabras para el resto.

| Conjunto | Tasa de error | Substituciones | Deleciones | Inserciones | Unidades de referencia |
|---|---|---|---|---|---|
| LibriSpeech test-clean, 20 enunciados | 1,40 % | 4 | 2 | 1 | 500 |
| LibriSpeech test-clean, clip de 62 s, long-form con marcas de tiempo | 0,70 % | 1 | 0 | 0 | 142 |
| FLEURS de, 10 enunciados | 3,79 % | 5 | 1 | 2 | 211 |
| FLEURS fr, 10 enunciados | 11,11 % | 6 | 3 | 19 | 252 |
| FLEURS es, 10 enunciados | 4,30 % | 3 | 3 | 5 | 256 |
| FLEURS ja, 10 enunciados | 3,90 % | 14 | 3 | 1 | 462 |

No se han publicado resultados comparativos de MMLU, HumanEval, GSM8K ni de otras tareas ajenas al reconocimiento de voz, ya que el modelo no las cubre. Tampoco hay cifras de latencia o throughput (por ejemplo, factor de tiempo real) en la información disponible.

## Requisitos de hardware

- Plataforma obligatoria: Apple silicon (M1 o posterior) con macOS 15.0 o superior. No hay soporte para GPU NVIDIA, AMD, CUDA ni para x86.
- Tamano de descarga y de disco: 1.111 MiB en 17 ficheros (repositorio de 1,2 GB).
- Uso de aceleradores: el `frontend` se ejecuta en CPU; el `encoder` y el `decoder` pueden ejecutarse en CPU y Neural Engine.
- Memoria unificada: no se especifica un minimo en la model card; al tratarse de un paquete de ~1,1 GiB, es plausible ejecutarlo en equipos con 8 GB de memoria unificada, aunque este dato no esta confirmado por el autor (`no disponible`).
- Primera carga: la primera vez que se carga el modelo en una maquina, Core ML compila los modelos para la Neural Engine, lo que puede tardar desde unos segundos hasta un par de minutos. Las cargas posteriores son rapidas.
- Despliegue: el paquete no esta pensado para vLLM, TGI, llama.cpp ni Ollama. La via de integracion documentada es el crate Rust `transcribe-model-darwin` (`AnyModel::load`), mas `transcribe-core` para la API `Transcriber` y `transcribe-eval` para la evaluacion.
- Latencia y throughput: no disponibles. Las unicas referencias son las tasas de error medidas en un Apple M4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato y tamano | Licencia | Plataforma |
|---|---|---|---|---|---|
| `yorganci/whisper-large-v3-6bit-coreml` | ~1.550 M (base) | Ventanas de 10/20/30 s, 448 tokens de decodificacion | Core ML compilado, 6 bits k-means, 1.111 MiB | MIT | Apple silicon, macOS 15.0 |
| `openai/whisper-large-v3` | ~1.550 M | Ventanas de 30 s, 448 tokens de decodificacion | PyTorch / safetensors, float16 (~3 GB) | MIT | GPU NVIDIA, CPU, Apple silicon via PyTorch |
| Quantizaciones GGUF de Whisper large-v3 para whisper.cpp | ~1.550 M | Ventanas de 30 s | GGUF (Q5, Q8, etc.), tamano variable | MIT | CPU, Metal, CUDA, Vulkan |
| `distil-whisper/distil-large-v3` | ~756 M | Ventanas de 30 s | PyTorch / safetensors | MIT | GPU NVIDIA, CPU (solo ingles) |

La ventaja diferencial de esta publicacion es la integracion nativa con la Neural Engine de Apple y el formato Core ML verificado por hash, a cambio de limitar el despliegue a macOS 15.0 sobre Apple silicon. Frente a whisper.cpp, ofrece una ruta de integracion en Rust y una compilacion optimizada para Neural Engine, pero pierde portabilidad a otras plataformas. No hay datos publicados que permitan comparar la precision de las paletas k-means de 6 bits con las cuantizaciones GGUF equivalentes, por lo que esa comparacion queda como `no disponible`.

## Limitaciones y advertencias

- Dependencia total de la plataforma: requiere Apple silicon y macOS 15.0. No se puede ejecutar en Linux, Windows, x86 ni en GPUs NVIDIA, lo que descarta su uso en la mayoria de servidores de produccion convencionales.
- Idiomas: aunque se declaran 100 idiomas, la model card solo aporta evaluaciones de de, fr, es y ja, y la tasa de error en frances (11,11 %) es notablemente mas alta que en aleman (3,79 %) o espanol (4,30 %) sobre solo 10 enunciados, una muestra muy pequena.
- Muestras de evaluacion reducidas: los resultados se basan en 10 o 20 enunciados por conjunto, por lo que no son estadisticamente concluyentes y no permiten extrapolar el rendimiento en produccion.
- Riesgo de alucinacion: no se documenta en esta model card, pero es un comportamiento conocido de la familia Whisper en presencia de silencios, ruido o audio musical; conviene aplicar heurísticas de deteccion (por ejemplo, filtros de compresion o de probabilidad media) en produccion.
- Sesgos: no se aporta ninguna informacion sobre sesgos demograficos, acentos o variacion dialectal para esta conversion.
- Cuantizacion a 6 bits: la compresion mediante paletas k-means puede degradar ligeramente la precision frente al modelo en float16; no se publica una comparacion directa entre ambas versiones, por lo que el impacto real es `no disponible`.
- Formato no estandar: no se distribuye en safetensors ni en GGUF, lo que impide usarlo directamente con frameworks como transformers, vLLM, llama.cpp u Ollama. La unica via soportada es el crate Rust `transcribe-model-darwin`.
- Integridad: el autor recomienda descargar `manifest.json` y verificar el tamano y el SHA-256 de cada fichero antes de cargar el directorio, lo que implica implementar ese paso de validacion en el proceso de instalacion.
- Licencia: MIT, heredada del modelo base de OpenAI, lo que permite uso comercial siempre que se conserven los avisos de copyright y licencia (`LICENSE` y `NOTICE`). No se declaran restricciones adicionales.
- Adopcion practicamente nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion (2026-10-03) indica que es una publicacion muy reciente; no hay evidencia de uso en produccion.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/yorganci/whisper-large-v3-6bit-coreml
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Repositorio del proyecto transcribe: https://github.com/atahanyorganci/transcribe
- Repositorio original de Whisper de OpenAI: https://github.com/openai/whisper
- Pesos de origen utilizados para la conversion: https://openaipublic.azureedge.net/main/whisper/models/e5b1a55b89c1367dacf97e3e19bfd829a01529dbfdeefa8caeb59b3f1b81dadb/large-v3.pt
- Fichero LICENSE del paquete: https://huggingface.co/yorganci/whisper-large-v3-6bit-coreml/blob/main/LICENSE
- Fichero NOTICE del paquete: https://huggingface.co/yorganci/whisper-large-v3-6bit-coreml/blob/main/NOTICE

Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; los unicos enlaces utiles proceden de la model card y del propio repositorio de HuggingFace.
