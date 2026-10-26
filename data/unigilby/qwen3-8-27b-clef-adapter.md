# unigilby/Qwen3.8-27B-clef-adapter

## Resumen

Este repositorio no contiene un modelo autónomo, sino un adaptador LoRA de rango 256 que reexpresa como delta los pesos de Cloudflare/clef (un modelo de decisión de 27B) sobre el checkpoint base Qwen/Qwen3.8-27B. Cloudflare publica Clef como pesos fusionados; el autor, unigilby, extrae la diferencia exacta entre ambos checkpoints (186 proyecciones lineales de las capas 40-63) y la factoriza por SVD, de forma que un único servidor puede servir chat con los pesos base y decisiones de Clef aplicando el adaptador solo en las pasadas de decisión. El paquete incluye además la cabeza de esquema conjunta de Cloudflare sin modificar y la matriz de salida bf16 del modelo base.

El interés práctico está en el ahorro de memoria y en la coexistencia de dos comportamientos sobre una sola copia residente de los pesos: en lugar de cargar un segundo modelo de 27B para tareas de decisión, se carga un delta de 4,1 GB (todo el repositorio). La verificación reportada por el autor es exigente: frente a la release fusionada, la divergencia media es KL 3,9e-7 con una coincidencia de opción superior del 100% y coseno de estados ocultos ≥ 0,99999.

El base es un transformer denso de 27 000 millones de parámetros de la generación Qwen 3.8, descrito por NVIDIA como modelo visión-lenguaje para texto, imagen y vídeo, con soporte de tool calling y tareas agénticas. Clef convierte ese backbone congelado en un cabezal que devuelve probabilidades calibradas sobre un esquema de preguntas tipadas en lugar de generar texto. El adaptador hereda la licencia Apache-2.0 y, en el momento de la consulta, no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 256 sobre transformer denso Qwen3.8-27B, más cabeza de esquema conjunta de Clef |
| Parámetros totales | No disponible para el adaptador (186 proyecciones lineales de las capas 40-63); el modelo base declara 27 000 millones |
| Parámetros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | 64 000 tokens para Clef según fuente externa; no verificado en la información del repositorio |
| Tipos de cuantización | El adaptador se distribuye en bf16; verificado sobre bases de 4 bits NVFP4-BF16 y MLX-4bit |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter.safetensors`, `joint_head.safetensors`, `lm_head_rows.safetensors`) |
| Rango del adaptador | 256 (algunas proyecciones requieren solo rango 48) |
| Capas adaptadas | 40-63 (186 proyecciones lineales) |
| Tamaño del repositorio | 4,1 GB |
| Convención de cálculo | `y = x Wᵀ + (x Aᵀ) Bᵀ`, con A `[rank, in]` de filas ortonormales y B `[out, rank]` con la escala incorporada |
| Revisiones de referencia | Base `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`; Clef `0b331204bb13fbd2ca93a64df1956f5b55478ce5` |
| Descargas y valoraciones | 0 descargas, 0 likes |

## Arquitectura y entrenamiento

No hay entrenamiento: el adaptador es una extracción algebraica. Partiendo de Qwen/Qwen3.8-27B y de Cloudflare/clef, el autor identifica exactamente 186 tensores distintos, correspondientes a las proyecciones lineales de las capas 40 a 63, y factoriza cada delta por SVD truncada a rango 256. El residuo de la factorización se sitúa entre el 1,16% y el 3,95% de cada delta, lo que equivale a entre 0,98 y 1,03 veces el suelo de redondeo bf16 de la propia fusión, y el 257.º valor singular queda al nivel de ruido, de modo que el rango 256 captura prácticamente toda la información del delta. El repositorio incluye `manifest.json` con revisiones, rango, convención y formas de cada módulo, además de `SHA256SUMS.json` para verificación de integridad.

La innovación relevante no está en el adaptador en sí, sino en el modo de servicio que habilita: un runtime que aplica el delta únicamente en las pasadas de decisión y deja intactas las de chat. El autor reporta que las respuestas de chat son idénticas bit a bit con y sin decisiones cargadas, y que las peticiones concurrentes producen el mismo resultado que las peticiones aisladas. La implementación de referencia es el adaptador en tiempo de ejecución de TensorFold (PR #1364), sobre una DGX Spark con CUDA y checkpoints base cuantizados a 4 bits.

## Capacidades

- Emisión de probabilidades calibradas por opción sobre un esquema de preguntas tipadas, en lugar de generación de texto libre.
- Puntuación de todas las opciones válidas en paralelo tras una única pasada de prefill, según la descripción pública de Clef.
- Aceptación de estado multimodal (texto, JSON, imágenes y vídeo) según la ficha externa de Clef; no verificado en el repositorio del adaptador.
- Exposición vía `POST /v1/systemone` con `"model": "clef"` en el formato de petición Jev/SystemOne; `"raw": true` devuelve probabilidades sin redondear.
- Coexistencia con el chat del modelo base en el mismo proceso: el adaptador solo se aplica a las pasadas de decisión.
- Conservación de las capacidades del base Qwen3.8-27B en modo chat (comprensión de texto, imagen y vídeo, código, razonamiento multimodal, contexto largo, tool calling y tareas agénticas), según NVIDIA; el adaptador no las modifica.
- Portabilidad del delta: al ser un LoRA en safetensors con convención documentada, puede aplicarse sobre cualquier checkpoint compatible con la revisión base indicada.

## Casos de uso

- Enrutado de decisiones en pipelines agénticos: el adaptador devuelve una distribución de probabilidad sobre las acciones permitidas de un esquema, lo que permite elegir rama con umbral explícito y registrar la confianza en lugar de parsear texto generado.
- Servicio dual en una sola GPU: cargar el base para conversación y el delta de 4,1 GB para decisiones evita mantener dos copias de 27B en memoria, algo crítico en nodos con VRAM limitada como la DGX Spark usada en la verificación.
- Clasificación con esquema tipado: definir preguntas con respuestas cerradas y obtener probabilidades por opción, útil para extracción de campos, triaje de tickets o categorización de documentos con salida validable.
- Decisión multimodal sobre imágenes o vídeo: al heredar el backbone visión-lenguaje de Qwen3.8-27B, el cabezal puede puntuar opciones sobre contenido visual (inspección de documentos, verificación de estado en capturas) según las capacidades descritas del base.
- Control de abstención y derivación humana: usar la probabilidad calibrada como señal de confianza y derivar a revisión manual cuando ninguna opción supera el umbral configurado.
- Evaluación y anotación automática: sustituir un modelo juez separado en tareas de comparación por pares o puntuación de candidatos, manteniendo el generador y el evaluador en el mismo servidor.
- Pruebas de regresión de decisiones: al ser la extracción exacta frente a la release fusionada (coincidencia de opción superior del 100% en la verificación reportada), sirve como referencia para comparar implementaciones de inferencia.

## Benchmarks y rendimiento

Verificación frente a la release fusionada (Transformers, fp32 en CPU, 39 registros / 115 preguntas):

| Métrica | Resultado |
|---|---|
| KL media frente a Cloudflare/clef | 3,9e-7 |
| Coincidencia de opción superior | 100% |
| Coseno de estados ocultos | ≥ 0,99999 |

Verificación en TensorFold nativo (una DGX Spark, CUDA, 60 registros / 557 preguntas, referencia bf16 de Cloudflare):

| Base servida en 4 bits | KL media | Coincidencia de opción superior |
|---|---:|---:|
| RadixArk/Qwen3.8-27B-NVFP4-BF16-LMHead | 0,0085 | 95,87% |
| TensorFold/Qwen3.8-27B-MLX-4bit | 0,0139 | 94,43% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible para este adaptador.

## Requisitos de hardware

- El adaptador no funciona de forma aislada: requiere el checkpoint base Qwen3.8-27B en la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`.
- VRAM estimada del base (cálculo a partir de 27 000 millones de parámetros, no dato del autor): en bf16 en torno a 54 GB de pesos, en 8 bits en torno a 27 GB, en 4 bits en torno a 14-15 GB, más caché KV para el contexto usado.
- Huella adicional del adaptador: 4,1 GB de repositorio (LoRA en bf16 más cabeza conjunta y matriz de salida), a sumar sobre la copia residente del base.
- Verificado en una DGX Spark con CUDA y en checkpoints MLX-4bit; no hay datos publicados de despliegue en A100, H100 ni RTX 4090 para este adaptador.
- Encaje en GPU de consumo: no confirmado en la información disponible; por tamaño, un base en 4 bits (~14-15 GB) más el delta entraría teóricamente en tarjetas de 24 GB, pero el autor no lo reporta y el runtime solo está probado en el hardware citado.
- Despliegue: `tensorfold-native serve <checkpoint Qwen3.8-27B> --clef <carpeta del repositorio>`. No hay integración documentada con vLLM, TGI, llama.cpp ni Ollama, ni pesos GGUF en este repositorio.
- Latencia y throughput: no disponibles para el adaptador. La fuente externa sobre Clef menciona una latencia mediana de 209 (unidad truncada en la cita), sin que este dato pueda confirmarse.

## Comparativa con modelos similares

| Modelo | Naturaleza | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unigilby/Qwen3.8-27B-clef-adapter | LoRA rango 256 sobre Qwen3.8-27B + cabeza de Clef | 4,1 GB de repo sobre base de 27B | 64k para Clef según fuente externa | Apache-2.0 | 0 descargas, 0 likes |
| Cloudflare/clef | Pesos fusionados del modelo de decisión | 27B | 64k según fuente externa | Apache-2.0 | Release oficial de Cloudflare |
| trevest/Clef-LoRA-for-Qwen3.8-27B-MLX | LoRA + cabeza de decisión + servidor, orientado a MLX | Adaptador sobre base de 27B | No disponible | No disponible en la información consultada | Repositorio publicado por tercero |
| trevest/Qwen3.8-27B-Clef-LoRA-GGUF | LoRA en formato GGUF | Índice de Hugging Face lista 0,7 B (dato incoherente con un adaptador de este tipo) | No disponible | No disponible en la información consultada | Repositorio publicado por tercero |

Frente a la release fusionada de Cloudflare, este repositorio aporta la ventaja de servir chat y decisión desde una sola copia de pesos; frente a la variante MLX de trevest, la de unigilby está verificada tanto en Transformers fp32 como en TensorFold sobre CUDA y MLX-4bit, con métricas de divergencia publicadas. El coste es una dependencia fuerte del runtime TensorFold y de la revisión exacta del checkpoint base.

## Limitaciones y advertencias

- No es un modelo utilizable por sí solo: sin el checkpoint base Qwen3.8-27B en la revisión indicada, los tensores del adaptador no tienen sentido.
- Dependencia de un runtime específico: el endpoint `/v1/systemone` y la aplicación selectiva del delta solo están implementados en TensorFold (PR #1361 y #1364), un proyecto en fase de pull request. No hay soporte en vLLM, TGI, llama.cpp u Ollama.
- Validación limitada: las métricas se apoyan en 39 registros / 115 preguntas y 60 registros / 557 preguntas, sin evaluación de sesgos, robustez adversarial ni dominios fuera de los conjuntos de verificación.
- En servicio con base cuantizado a 4 bits la fidelidad no es total: KL media de 0,0085 y 0,0139 y coincidencia de opción superior del 95,87% y 94,43%, frente al 100% con la comparación en fp32.
- El adaptador solo cubre las capas 40-63; cualquier modificación del checkpoint base fuera de la revisión de referencia invalida la extracción exacta.
- La información del repositorio no detalla idiomas soportados ni cobertura multilingüe del adaptador.
- Riesgo de alucinación y sesgo: al no generar texto libre, el modo decisión no "alucina" en el sentido habitual, pero hereda los sesgos del backbone y puede producir distribuciones sobreconfiadas; las probabilidades deben calibrarse contra datos propios antes de usarse como umbral en producción.
- Gobernanza: 0 descargas y 0 likes, sin revisión comunitaria; el mantenimiento depende de un único autor y de la evolución del PR de TensorFold.
- Licencia Apache-2.0 permite uso comercial, pero exige conservar avisos de atribución a Cloudflare (Clef y su cabeza de esquema) y a Qwen (modelo base).

## Enlaces

- Repositorio del adaptador: https://huggingface.co/unigilby/Qwen3.8-27B-clef-adapter
- Modelo de decisión original: https://huggingface.co/Cloudflare/clef
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- TensorFold, endpoint y cabeza de Clef (PR #1361): https://github.com/ashhart/TensorFold/pull/1361
- TensorFold, adaptador en tiempo de ejecución (PR #1364): https://github.com/ashhart/TensorFold/pull/1364
- Ficha de Qwen3.8-27B en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
- Guía de Qwen 3.8-27B: https://www.aimadetools.com/blog/qwen-3-8-27b-complete-guide/
- Ficha de Clef en TheresAnAIForThat: https://theresanaiforthat.com/model/clef/
- Adaptador alternativo en MLX: https://huggingface.co/trevest/Clef-LoRA-for-Qwen3.8-27B-MLX
- Índice de adaptadores sobre Cloudflare/clef: https://huggingface.co/models?other=base_model:adapter:Cloudflare/clef
