# Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed

## Resumen

Qwen3.8-Flash-Next-MTPLX-Optimized-Speed es una cuantización de 4 bits (con proyecciones de atención en 8 bits) del modelo Qwen3.8-Flash-Next de Alibaba Qwen, empaquetada por el usuario Youssofal para su ejecución nativa en MTPLX, un runtime de inferencia optimizado para Apple Silicon. El modelo base pertenece a la generación Qwen4 y emplea una arquitectura híbrida MoE con GDN (Gated DeltaNet), Qwen Sparse Attention y una tabla de memoria n-gram de 51.000 millones de parámetros. El pack contiene 126.192.584.851 parámetros totales y una ventana de contexto de 262.144 tokens.

La relevancia de esta ficha radica en que no es un modelo nuevo entrenado desde cero, sino un artefacto de despliegue: traduce un modelo de 125B-A6B a un formato que cabe y funciona en Macs con memoria unificada de 128 GB o más, aplicando decodificación especulativa multi-token (MTP) con profundidad adaptativa hasta 3. El autor reporta entre 1,7x y 2-3x de aceleración frente a decodificación autorregresiva simple, manteniendo exactitud distribucional a cualquier temperatura mediante aceptación por ratio de probabilidad y remuestreo residual.

El paquete incluye la torre de visión en los pesos (pipeline image-text-to-text) y una tabla n-gram de 32 GB que se transmite desde SSD, de modo que solo los pesos (~83 GB) residen en memoria. El pico de servicio declarado es de 87 GiB, lo que lo sitúa fuera del alcance de equipos de 96 GB, para los que el autor recomienda su variante Bare Speed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con GDN (Gated DeltaNet), Qwen Sparse Attention y cabeza MTP; memoria n-gram de 51B parámetros |
| Parametros totales | 126.192.584.851 |
| Parametros activos | 6B (denominación 125B-A6B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit con grupos de 64 pesos en expertos MoE y matrices densas; proyecciones Qwen Sparse Attention en 8-bit; convolución GDN, estado recurrente, normas, indexador QSA y cabeza MTP en 16-bit |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX), con sidecar `ngram-table.safetensors` y `mtplx_runtime.json` |
| Tamano del repo | 115,1 GB (incluye tabla n-gram de 32 GB) |
| Pesos residentes | ~83 GB + working set (tabla n-gram en SSD) |
| Pico en servicio | 87 GiB |
| Profundidad MTP | adaptativa, techo 3 |
| Muestreo recomendado | temperature 1.0, top-p 0.95, top-k 20 |
| Libreria | mtplx |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con 126.192 millones de parámetros totales y 6.000 millones activos por token. Su diseño incorpora tres componentes diferenciales: capas GDN (Gated DeltaNet) con convolución y estado recurrente, un mecanismo de Qwen Sparse Attention con un indexador QSA propio, y una memoria n-gram de 51.000 millones de parámetros que actúa como tabla de recuperación de secuencias. Sobre esta base se añade una cabeza de multi-token prediction (MTP) que permite borrador especulativo de varios tokens por paso.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF, DPO) del modelo original en la documentación proporcionada. Lo que sí está documentado es el proceso de cuantización de este pack: expertos MoE y matrices densas a 4 bits con grupos de 64 pesos, proyecciones QSA promovidas a 8 bits para preservar la precisión de la ruta de atención en contextos largos, y todos los elementos sensibles a la precisión (convolución GDN, estado recurrente, normas, indexador QSA, cabeza MTP) mantenidos en 16 bits. La torre de visión se conserva íntegra en los pesos.

La innovación técnica central es la ruta de decodificación especulativa de MTPLX: los borradores de la cabeza MTP se aceptan mediante la regla del ratio de probabilidad más remuestreo residual, lo que garantiza que la salida siga la distribución propia del modelo a cualquier temperatura. El autor reporta que mil extracciones de cuatro tokens por la ruta rápida coinciden con mil de la ruta simple dentro del ruido propio de esta última, en todas las longitudes conjuntas probadas.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de hasta 262.144 tokens.
- Razonamiento y código: los benchmarks del autor incluyen turnos de OpenCode de 109k y 200k tokens y generaciones completas de 45k-56k tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con la torre de visión preservada en los pesos.
- Decodificación especulativa multi-token con profundidad adaptativa hasta 3, integrada en el runtime.
- Modo thinking desactivable (las mediciones se realizan con thinking off y con effort xhigh).
- Integración con herramientas de desarrollo tipo OpenCode y Claude Code según las etiquetas del repositorio.
- Ejecución local en Apple Silicon (M3, M4, M5, M5 Max) mediante MTPLX.
- Soporte de sesiones con caché: restauración de una conversación de 96.760 tokens en 8 ms.

## Casos de uso

- Asistencia de código en local con OpenCode: el modelo gestiona turnos de 109k y 200k tokens a 61,8 y 50,3 tok/s respectivamente en un M5 Max de 128 GB, lo que permite mantener el contexto completo de un repositorio mediano sin salir del equipo.
- Generación de proyectos completos en una sola pasada: el autor documenta generaciones de 45k a 56k tokens (un Flappy Bird con effort xhigh) a 66,8 tok/s de media por turno, adecuado para prototipado rápido de aplicaciones pequeñas.
- Agentes autónomos multi-paso: la profundidad MTP adaptativa y la caché de sesión (96.760 tokens restaurados en 8 ms) reducen la latencia entre pasos de un bucle agéntico que reutiliza contexto.
- Análisis de documentos largos con imagen: al conservar la torre de visión y 262.144 tokens de contexto, puede procesar informes escaneados, capturas de pantalla o diagramas junto con texto extenso en una sola ventana.
- Procesamiento por lotes de prompts largos: con 1.453 tok/s de preprocesado en prompts de 4.061 tokens y 1.094 tok/s en prompts de 65.502 tokens (MTPLX 2.12.0), es viable clasificar o resumir lotes de documentos de decenas de miles de tokens.
- Desarrollo y evaluación de técnicas de decodificación especulativa: el pack sirve como banco de pruebas reproducible de MTP con aceptación por ratio de probabilidad, con métricas publicadas de velocidad y exactitud.
- Inferencia privada en estación de trabajo: al ejecutarse íntegramente en un Mac Studio o MacBook Pro, evita el envío de código o datos sensibles a APIs externas.

## Benchmarks y rendimiento

Rendimiento de decodificación medido por el autor en un MacBook Pro M5 Max con 128 GB, ventiladores a máximo, muestreo temperature 1.0, top-p 0.95, top-k 20:

| Ejecucion | tok/s |
|---|---|
| Petición OpenCode, 1.301 tokens generados, prompt de 18.539 tokens (18.364 en caché), MTP depth 3 | 125,8 |
| Prompt de código de 9k tokens, 1.500 tokens generados, sampler con semilla, thinking off | 79,3 |
| Turno OpenCode de 109k tokens (media de dos ejecuciones) | 61,8 |
| Turno OpenCode de 200k tokens en caliente (media de dos ejecuciones) | 50,3 |
| Generaciones completas de 45k-56k tokens, turno completo | 66,8 |
| Tarea de código con decodificación especulativa MTP (por defecto) | 73,5 |
| Misma tarea con decodificación autorregresiva simple | 43,8 |

Comparativa de versiones del runtime sobre el mismo pack y prompts:

| Metrica | MTPLX 2.11.3 | MTPLX 2.12.0 |
|---|---|---|
| Tiempo al primer token, prompt de 4.061 tokens | 5,26 s | 2,88 s |
| Preprocesado, prompt de 4.061 tokens | 786 tok/s | 1.453 tok/s |
| Tiempo al primer token, prompt de 65.502 tokens | 85,5 s | 60,1 s |
| Preprocesado, prompt de 65.502 tokens | 768 tok/s | 1.094 tok/s |
| Decodificación tras prompt de 65.502 tokens | 56,1 tok/s | 63,5 tok/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria unificada recomendada: 128 GB o más; pico de servicio de 87 GiB.
- En equipos de 96 GB, el autor recomienda la variante Bare Speed (pico de 78 GiB).
- Equipos validados: MacBook Pro M4 Max y M5 Max con 128 GB; Mac Studio M3 Ultra, M4 Max y M5 Max con 128 GB o más; primera recomendación en Macs de 256 GB o más desde MTPLX 2.12.0.
- Almacenamiento: 115,1 GB de descarga, incluyendo la tabla n-gram de 32 GB que se transmite desde SSD en cada Mac.
- Pesos residentes: ~83 GB más working set; la tabla n-gram no ocupa memoria.
- Despliegue: exclusivamente mediante MTPLX (`pip install mtplx` y `mtplx serve --model ...`, o la app de Mac). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Límite de memoria GPU: el autor eleva el límite a 120 GiB en sus pruebas.
- Throughput y latencia: ver tabla de benchmarks; multiplicador especulativo de 1,7x en la ruta de servicio y de 2-3x según la afirmación general del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MTPLX-Optimized-Speed | 126,2B totales, 6B activos | 262.144 | safetensors MLX / MTPLX | qwen-community-1.0 | Cuantización 4-bit con atención 8-bit; pico 87 GiB |
| Qwen3.8-Flash-Next-MTPLX-Bare-Speed | 126,2B totales, 6B activos | no disponible | safetensors MLX / MTPLX | qwen-community-1.0 | Variante más rápida y de menor precisión en atención; pico 78 GiB |
| Qwen/Qwen3.8-Flash-Next (base) | 126,2B totales, 6B activos | no disponible | no disponible | qwen-community-1.0 | Pesos originales sin cuantizar; requisitos de memoria muy superiores |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Requisito de memoria elevado: 87 GiB de pico lo excluye de Macs de 96 GB y de cualquier GPU de consumo convencional; no está pensado para CUDA.
- Dependencia total del runtime MTPLX: no hay pesos GGUF ni compatibilidad con vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad y crea dependencia de un único proveedor de software.
- La cuantización a 4 bits introduce pérdida de calidad frente al modelo base; el autor la mitiga manteniendo atención en 8 bits y componentes críticos en 16 bits, pero no publica métricas de calidad que cuantifiquen la degradación.
- La tabla n-gram se transmite desde SSD: el rendimiento depende de la velocidad del almacenamiento y del estado de la caché, lo que explica la diferencia entre turnos fríos y calientes.
- No se han publicado datos sobre idiomas soportados, sesgos, tasas de alucinación ni evaluación de seguridad.
- Licencia qwen-community-1.0: es necesario revisar sus términos antes de uso comercial; la model card la etiqueta como "other" y remite a un archivo LICENSE.
- Los benchmarks de velocidad proceden del propio autor y de una única configuración de hardware (M5 Max, 128 GB), sin replicación independiente.
- El modelo está fechado en 2026 y su ecosistema (MTPLX 2.12.0) evoluciona con rapidez; las cifras de rendimiento pueden quedar obsoletas entre versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed
- Variante Bare Speed: https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Bare-Speed
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- MTPLX: https://mtplx.com
- Notas de la versión 2.12.0: https://mtplx.com/releases/2.12.0/
- Notas de la versión 2.11.3: https://mtplx.com/releases/2.11.3/
- Benchmarks: https://mtplx.com/benchmarks/
- Guía para ejecutar Qwen 3.8 Flash Next en Mac: https://mtplx.com/models/qwen3.8-flash-next/
