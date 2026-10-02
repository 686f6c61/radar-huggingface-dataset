# wodheifn/Qwen3.8-27B-GGUF

## Resumen

El repositorio wodheifn/Qwen3.8-27B-GGUF contiene una colección de cuantizaciones en formato GGUF del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.320.697.856 parámetros desarrollado por el equipo Qwen y publicado bajo licencia Apache 2.0. No se trata de un modelo nuevo entrenado por el autor del repositorio, sino de una redistribución cuantizada orientada a inferencia local, generada siguiendo la metodología Unsloth Dynamic 3.0 con calibración imatrix, según los tags y la model card del repositorio.

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión, es decir, un modelo nativo visión-lenguaje capaz de procesar imágenes y vídeos además de texto. Su arquitectura es híbrida: combina capas de atención lineal (Gated DeltaNet) con capas de atención con compuertas (Gated Attention), lo que reduce el coste de memoria asociado al contexto largo. El modelo declara 262.144 tokens de contexto nativo, extensible hasta 1.000.000, e incorpora control flexible del modo de razonamiento mediante los parámetros `reasoning_effort` y `preserve_thinking`, además de soporte de tool calling y de rol de desarrollador para herramientas agénticas.

La relevancia de este repositorio concreto radica en que empaqueta el modelo en GGUF, el formato que consumen llama.cpp, Ollama, LM Studio y la mayoría de los runners de inferencia en hardware de consumo. Conviene señalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, ocupa 472,1 GB y sus campos de creación y actualización difieren en un segundo (2026-10-02T18:01:41 y 2026-10-02T18:01:42), lo que apunta a una subida automatizada sin validación comunitaria. La model card reproduce documentación de Unsloth sobre el modelo base, no documentación propia de los artefactos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con Gated DeltaNet (atención lineal) y Gated Attention (GQA), más codificador de visión |
| Parametros totales | 27.320.697.856 (~27,3 B), según metadatos safetensors del modelo base |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 tokens |
| Tipos de cuantizacion | GGUF con metodología Unsloth Dynamic 3.0 y calibración imatrix; niveles concretos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 472,1 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Fecha de publicacion | 2026-10-02 |

Datos de configuración interna publicados en la model card del modelo base:

| Parametro | Valor |
|---|---|
| Dimensión oculta | 5120 |
| Número de capas | 64 |
| Disposición de capas | 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Token embedding / LM output | 248.320 (con padding) |
| Gated DeltaNet: cabezas de atención lineal | 48 para V y 16 para QK |
| Gated DeltaNet: dimensión de cabeza | 128 |
| Gated Attention: cabezas | 24 para Q y 4 para KV |
| Gated Attention: dimensión de cabeza | 256 |
| Gated Attention: dimensión de RoPE | 64 |
| FFN: dimensión intermedia | 17.408 |
| MTP (Multi-Token Prediction) | Entrenado con múltiples pasos |

## Arquitectura y entrenamiento

La arquitectura combina dos mecanismos de atención en una disposición repetida 16 veces: cada bloque contiene tres subcapas de Gated DeltaNet seguidas de una subcapa de Gated Attention, cada una acompañada de su red feed-forward. Gated DeltaNet es un mecanismo de atención lineal con 48 cabezas para V y 16 para QK con dimensión de cabeza 128, que mantiene un estado recurrente de tamaño constante en lugar de una caché KV que crece con la secuencia. Gated Attention usa 24 cabezas de consulta y solo 4 de clave-valor (GQA) con dimensión de cabeza 256 y RoPE de dimensión 64. La dimensión intermedia del FFN es 17.408 y la dimensión oculta total, 5120. El modelo incorpora además un codificador de visión para entrada de imágenes y vídeo, y fue entrenado con Multi-Token Prediction (MTP) en varios pasos, técnica que permite decodificación especulativa con la propia cabeza MTP como modelo borrador.

Según la model card, el modelo pasa por fases de pre-entrenamiento y post-entrenamiento, e incorpora control flexible del razonamiento: el modo thinking está activo por defecto, puede desactivarse por petición, la profundidad de razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento de mensajes históricos se conserva mediante `preserve_thinking`. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento concretas. Tampoco se detalla la receta de extensión de contexto más allá de los 262.144 tokens nativos.

En lo que respecta a este repositorio, el único "entrenamiento" implicado es el proceso de cuantización: pesos convertidos a GGUF con la metodología Dynamic 3.0 de Unsloth y calibración imatrix. La model card afirma que las cuantizaciones Dynamic 3.0 logran más de un 10 % mejor precisión top-1 % al mismo tamaño que otros proveedores, pero no se aportan tablas ni valores absolutos que respalden esa afirmación.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo thinking activado por defecto y desactivable por petición.
- Control de profundidad de razonamiento mediante el parámetro `reasoning_effort` y retención del contexto de razonamiento histórico con `preserve_thinking`.
- Comprensión nativa de imágenes y vídeo: diagramas STEM, documentos escaneados y vídeos de hasta una hora de duración, según la model card.
- Programación y tareas profesionales y de investigación, con mejoras declaradas respecto a las generaciones Qwen3.5 y Qwen3.6.
- Ejecución agéntica: planificación autónoma, gestión de retroalimentación del entorno y finalización de tareas de largo horizonte.
- Tool calling con análisis de objetos anidados, orientado a aumentar la tasa de éxito en llamadas a herramientas complejas.
- Soporte de rol de desarrollador, lo que permite integración en herramientas agénticas como Codex.
- Compatibilidad con endpoints según los tags del repositorio (`endpoints_compatible`).
- Capacidades multilingües: no disponibles en la información proporcionada para este repositorio ni para el modelo base.
- Decodificación especulativa: la cabecera MTP entrenada permite acelerar la generación usándola como modelo borrador.

## Casos de uso

- Asistentes de atención al cliente multi-turno: con 262.144 tokens de contexto nativo, el modelo puede mantener el historial completo de una conversación larga o un expediente de cliente sin truncar, evitando pérdida de información entre turnos.
- Agentes autónomos de automatización de tareas: el soporte de rol de desarrollador y la mejora en el análisis de objetos anidados para tool calling permiten construir agentes que encadenan llamadas a APIs, lectura de ficheros y ejecución de comandos con menor tasa de fallo en el parseo.
- Análisis de documentación técnica extensa: la ventana de contexto permite procesar manuales, contratos o bases de código completas de una sola pasada, y el modo thinking desactivable reduce la latencia cuando solo se requiere extracción de datos.
- Revisión de código en pipelines de CI/CD: al integrarse vía GGUF en runners locales, el modelo puede ejecutarse en la propia infraestructura del equipo para revisar diffs, generar pruebas o detectar patrones problemáticos sin enviar código a terceros.
- Procesamiento de imágenes y vídeo para documentación: soporte nativo de visión para extraer información de diagramas STEM, capturas de pantalla, documentos escaneados o vídeos formativos de larga duración, generando resúmenes o respuestas sobre el contenido.
- Despliegue en hardware de consumo para desarrollo: al estar en GGUF, puede ejecutarse en una estación de trabajo con GPU de gama alta o incluso en CPU con cuantizaciones bajas, lo que facilita prototipado sin clústeres.
- Investigación y generación aumentada por recuperación (RAG): la combinación de contexto largo y visión permite construir sistemas RAG que indexan tanto texto como figuras y responden con referencias a pasajes extensos.
- Generación de código en producción como paso previo a la revisión humana: el modelo puede producir borradores de funciones, migraciones o tests que se validan después, usando el presupuesto de tokens de razonamiento para tareas algorítmicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio incluye únicamente la afirmación cualitativa de que las cuantizaciones Unsloth Dynamic 3.0 logran más de un 10 % mejor precisión top-1 % al mismo tamaño que otras cuantizaciones, sin tabla de resultados, sin métricas por tarea y sin condiciones de evaluación. Por tanto, no es posible presentar cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para este repositorio ni para el modelo base con los datos disponibles.

## Requisitos de hardware

Las cifras de VRAM para pesos son estimaciones derivadas del recuento de parámetros (27.320.697.856) y no de los tamaños reales de fichero del repositorio, que no están disponibles. La cuantización exacta y su tamaño efectivo deben verificarse en la lista de ficheros del repositorio.

| Nivel de cuantización (aprox.) | Peso estimado | VRAM mínima estimada para pesos |
|---|---|---|
| FP16/BF16 | ~54,6 GB | ~58 GB |
| Q8 | ~29 GB | ~32 GB |
| Q6 | ~22 GB | ~25 GB |
| Q5 | ~19 GB | ~22 GB |
| Q4 | ~16,5 GB | ~19 GB |
| Q3 | ~13 GB | ~15 GB |
| Q2 | ~10,5 GB | ~13 GB |

- Caché KV con cuantización FP16, calculada a partir de la configuración publicada: solo 16 de las 64 capas usan Gated Attention con caché KV; con 4 cabezas KV y dimensión de cabeza 256, el coste es de 64 KiB por token, es decir, unos 2 GiB a 32.768 tokens y unos 16 GiB a los 262.144 tokens nativos. Las 48 capas restantes usan Gated DeltaNet y mantienen estado recurrente de tamaño constante, por lo que no escalan con la longitud de la secuencia. A 1.000.000 tokens la caché KV estimada sería de unos 61 GiB en FP16, lo que hace imprescindible cuantizar la caché o repartir el modelo.
- GPU recomendadas: para FP16, una A100 80 GB o H100 80 GB por instancia. Para Q4/Q5, una RTX 4090 (24 GB) o RTX 5090 puede alojar el modelo completo si se limita la longitud de contexto. Para Q2/Q3, tarjetas de 12-16 GB son suficientes para los pesos, aunque con contexto limitado.
- Cabe en GPU de consumo: sí, en cuantizaciones Q2 a Q5 dentro de 12-24 GB de VRAM, siempre que se ajuste el contexto a la memoria restante. No cabe en FP16 en ninguna GPU de consumo actual.
- Despliegue: llama.cpp y sus derivados (Ollama, LM Studio, KoboldCpp) para GGUF; vLLM y TGI son opciones para el modelo base en safetensors o para GGUF con soporte de cuantización, aunque la compatibilidad específica con estos artefactos no está documentada. Unsloth Desktop se menciona en la model card como runner con toggles de thinking.
- Vision: el soporte de imagen y vídeo en GGUF requiere normalmente un fichero de proyector multimodal (mmproj) adicional. No se confirma en la información disponible si el repositorio lo incluye.
- Latencia y throughput: no disponibles. La cabecera MTP entrenada habilita decodificación especulativa, que en teoría incrementa el throughput, pero no se publican cifras.

## Comparativa con modelos similares

No hay datos de benchmarks ni de rendimiento de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa con otros modelos de la misma categoría. La tabla siguiente compara únicamente el repositorio analizado con su modelo base, con los datos disponibles.

| Aspecto | wodheifn/Qwen3.8-27B-GGUF | Qwen/Qwen3.8-27B |
|---|---|---|
| Naturaleza | Cuantizaciones GGUF de terceros | Modelo original |
| Autor | wodheifn (comunidad) | Equipo Qwen |
| Formato de pesos | GGUF | Safetensors |
| Parámetros | 27,3 B (denso) | 27,3 B (denso) |
| Contexto | 262.144 tokens, extensible a 1.000.000 | 262.144 tokens, extensible a 1.000.000 |
| Licencia | Apache 2.0 | Apache 2.0 |
| Descargas / likes | 0 / 0 | No disponible |
| Validación de calidad | No documentada | Model card oficial con receta de uso |

## Limitaciones y advertencias

- Riesgo de alucinación: es un modelo de lenguaje generativo y, como tal, puede producir afirmaciones falsas con apariencia de verosimilitud, especialmente en modo thinking largo o en tareas de razonamiento factual. No se publican tasas de alucinación.
- Repositorio sin validación: 0 descargas y 0 likes, creado y actualizado con un segundo de diferencia. No hay evidencia de que los artefactos hayan sido probados por terceros ni de que correspondan a una cuantización íntegra del modelo base.
- Pérdida por cuantización: cualquier nivel por debajo de Q8 introduce degradación. La model card afirma superioridad de la metodología Dynamic 3.0, pero no aporta métricas que lo demuestren para estos ficheros concretos.
- Model card no original: el README reproduce documentación de Unsloth y del modelo base Qwen3.8-27B. La información sobre el modelo no está necesariamente verificada por el autor del repositorio y no describe los artefactos GGUF concretos publicados.
- Inconsistencia de etiquetado: los tags incluyen `qwen3_5` mientras el modelo se denomina Qwen3.8, lo que puede dificultar la búsqueda y clasificación automática del repositorio.
- Idiomas: no se especifica la cobertura lingüística. Sin datos, no debe asumirse un rendimiento homogéneo fuera del inglés y del chino, idiomas habituales en la familia Qwen.
- Contexto extendido: los 1.000.000 de tokens son una extensión sobre los 262.144 nativos y requieren técnicas de escalado de RoPE y memoria muy superior. No se documenta el método ni la degradación esperada.
- Memoria: la caché KV estimada para el contexto nativo completo ronda los 16 GiB en FP16, a lo que se suman los pesos y el estado recurrente de las capas DeltaNet. En GPUs de consumo esto obliga a recortar contexto o cuantizar la caché.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero exige conservar el aviso de licencia y los avisos de atribución. Conviene verificar qué licencia declara el repositorio del modelo base en el momento de su uso, ya que este repositorio solo referencia `license: apache-2.0`.
- Visión en GGUF: no se confirma la presencia del proyector multimodal (mmproj); sin él, las capacidades de imagen y vídeo no estarán operativas aunque el modelo base las soporte.
- Advertencia sobre las fechas: el repositorio está fechado en 2026, lo que puede indicar un entorno de publicación con marcas de tiempo no convencionales o datos sintéticos. Verificar la procedencia antes de integrarlo en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/wodheifn/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de Unsloth para ejecutar Qwen3.8-27B: https://unsloth.ai/docs/models/qwen3.8
- Documentación de Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Unsloth Desktop: https://unsloth.ai/docs/new/desktop
- Servidor de Discord de Unsloth: https://discord.gg/unsloth
