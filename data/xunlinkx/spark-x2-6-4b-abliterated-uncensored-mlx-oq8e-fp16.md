# xunlinkx/Spark-X2.6-4B-Abliterated-Uncensored-MLX-oQ8e-fp16

## Resumen

Spark-X2.6-4B-Abliterated-Uncensored-MLX-oQ8e-fp16 es una cuantización de 8 bits en formato MLX del modelo comunitario electroglyph/Spark-X2.6-4B-uncensored, que a su vez es una derivación "abliterated" del modelo oficial XHToken/Spark-X2.6-4B. El publicador de este checkpoint es el usuario xunlinkx, que no tiene relación oficial con XHToken. El modelo resuelve el problema de ejecutar un LLM de 4.112 millones de parámetros en hardware Apple Silicon con un peso de descarga contenido (4,4 GB) y un consumo de memoria medido de 4,530 GB en pico durante una prueba de generación corta.

La relevancia de esta variante es doble. Por un lado, aplica la técnica de abliteration (eliminación de la dirección de rechazo en los pesos) mediante Heretic 2.0.0.dev0 Arbitrary-Rank Ablation, lo que reduce el comportamiento de negativa del modelo original: la model card de origen reporta 6 rechazos en 100 prompts y una divergencia KL de 0,0027 frente al modelo original. Por otro, ofrece una cuantización oMLX de 8 bits con grupo de 64 y calibración de 128 muestras, pensada para el runtime MLX en chips M1 a M6.

Se trata de un modelo de texto conversacional, con arquitectura propietaria `spark2_5`, soporte declarado de inglés y chino, y licencia Apache-2.0 heredada de la línea upstream. No es un lanzamiento oficial y no cuenta con evaluación independiente publicada sobre el conjunto de rechazos ni sobre benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5` (transformer, según la denominación del checkpoint; detalles internos no disponibles) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín (group size 64) en formato MLX; origen BF16 convertido a FP16 antes de cuantizar |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato de checkpoint MLX (librería `mlx`) |

## Arquitectura y entrenamiento

La arquitectura declarada es `spark2_5`, la misma que la del modelo oficial XHToken/Spark-X2.6-4B del que deriva toda la cadena. La información disponible no detalla la composición interna de la arquitectura (número de capas, dimensión oculta, tipo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa). Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

Lo que sí está documentado es el proceso de modificación posterior. El modelo base electroglyph/Spark-X2.6-4B-uncensored se generó con Heretic 2.0.0.dev0 Arbitrary-Rank Ablation (ARA), una técnica de abliteration que proyecta fuera de los pesos la dirección asociada al comportamiento de rechazo, con rango arbitrario. La model card del derivado reporta 6 rechazos en 100 prompts y una divergencia KL de 0,0027 respecto al modelo original, métricas aportadas por el autor del derivado y no verificadas de forma independiente en este checkpoint. Sobre ese derivado, xunlinkx aplicó una cuantización oMLX mejorada con 128 muestras de calibración, longitud de secuencia 512 y cuantización afín con grupo de 64, almacenando los metadatos en `config.json`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat heredada del modelo upstream.
- Soporte de modo "thinking" con presupuesto configurable, según indica la model card del modelo original (la disponibilidad depende del runtime).
- Capacidades multilingües limitadas a inglés y chino.
- Comportamiento de rechazo reducido respecto al modelo original, orientado a usuarios que necesitan respuestas sin negativas por defecto.
- Ejecución nativa en Apple Silicon mediante MLX y MLX-LM, con soporte de la arquitectura `spark2_5`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible; el pipeline declarado es únicamente text-generation.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se carga con `mlx_lm.generate` o con oMLX en chips M1 a M6, con un pico de memoria medido de 4,530 GB, lo que permite mantener conversaciones multi-turno en un portátil Apple Silicon sin GPU dedicada.
- Prototipado de aplicaciones de chat en inglés y chino: al soportar ambos idiomas y una plantilla de chat estándar, sirve para validar flujos conversacionales bilingües antes de migrar a un modelo mayor.
- Investigación sobre abliteration y alineación: el checkpoint permite reproducir y comparar el efecto de la ablación ARA frente al modelo original, con la métrica de divergencia KL reportada como referencia.
- Generación de texto creativo sin filtros por defecto: útil en entornos controlados de escritura asistida donde el comportamiento de rechazo del modelo base resulta un obstáculo, siempre con moderación propia añadida.
- Evaluación de cuantizaciones oMLX: al ser la variante de mayor precisión del conjunto (frente a oQ4e y oQ5e), sirve como referencia de calidad para medir la degradación de las cuantizaciones más agresivas.
- Despliegue en pipelines de generación por lotes en local: la integración con MLX-LM permite scripting y procesamiento por lotes en hardware Apple sin depender de servicios en la nube.
- Docencia y demostraciones de LLM en el aula: el tamaño de descarga (4,4 GB) y el consumo de memoria lo hacen viable en equipos de estudiantes con Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única medición objetiva aportada es la prueba de humo local del publicador: 24 tokens generados con un pico de memoria de 4,530 GB reportado por MLX, que confirma carga y generación básica pero no constituye una evaluación de calidad. La model card de origen reporta 6 rechazos en 100 prompts y KL de 0,0027, métricas del autor del derivado y no verificadas de forma independiente en esta cuantización.

## Requisitos de hardware

- VRAM/memoria unificada estimada: en torno a 4,5 GB en pico según la medición del publicador con esta cuantización de 8 bits; el repositorio ocupa 4,4 GB en disco.
- Hardware objetivo: Apple Silicon, chips M1 a M6 según la model card. Las variantes derivadas de FP16 se consideran adecuadas en M3 y posteriores.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas de forma nativa por este checkpoint, que está empaquetado para MLX; no se documenta conversión a otros formatos.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en la memoria unificada de cualquier Mac con Apple Silicon y al menos 8 GB de RAM; no se indica compatibilidad con GPUs de consumo NVIDIA.
- Opciones de despliegue: MLX y MLX-LM (versión actual con soporte de arquitectura `spark2_5`), oMLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles; solo se conoce la prueba de humo de 24 tokens sin medición de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Abliterated-Uncensored MLX oQ8e (este) | 4,11 B | no disponible | MLX 8-bit | Apache-2.0 | Hugging Face, 110 descargas |
| electroglyph/Spark-X2.6-4B-uncensored | 4,11 B (estimado, derivado del mismo base) | no disponible | BF16 | Apache-2.0 (heredada) | Hugging Face |
| XHToken/Spark-X2.6-4B (oficial) | 4,11 B (estimado) | no disponible | no disponible | Apache-2.0 (según linaje) | Hugging Face y GitHub |
| Otras cuantizaciones del mismo set (oQ4e, oQ5e) | 4,11 B | no disponible | MLX 4/5-bit | Apache-2.0 | Hugging Face (mismo publicador) |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la jerarquía de precisión y huella de memoria indicada por el publicador.

## Limitaciones y advertencias

- No es un lanzamiento oficial de XHToken; es una cuantización comunitaria de un derivado comunitario, con dos capas de modificación sobre el modelo original.
- El comportamiento "uncensored" no está garantizado: la abliteration reduce las negativas pero no elimina todos los rechazos, y el propio autor advierte de que no responde necesariamente a cualquier petición.
- La reducción de rechazos implica riesgo de generar contenido dañino, sesgado o inexacto; es imprescindible añadir moderación, control de acceso y revisión propios si se expone a terceros.
- Riesgo de alucinación inherente a un modelo de 4 B parámetros; no se han publicado evaluaciones de fidelidad factual.
- Cobertura lingüística limitada a inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será deficiente.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas.
- Las métricas de rechazo (6/100) y divergencia KL (0,0027) proceden del autor del derivado y no han sido verificadas de forma independiente en esta cuantización de 8 bits.
- Compatibilidad restringida a Apple Silicon y a versiones de MLX/MLX-LM con soporte de `spark2_5`; no hay pesos GGUF ni safetensors estándar para otros runtimes.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo recae en el desplegador.
- Modelo con 110 descargas y 0 likes en el momento de la ficha: ecosistema de validación muy reducido.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/xunlinkx/Spark-X2.6-4B-Abliterated-Uncensored-MLX-oQ8e-fp16
- Modelo base del derivado: https://huggingface.co/electroglyph/Spark-X2.6-4B-uncensored
- Modelo oficial upstream: https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio oficial del proyecto: https://github.com/XHToken/Spark-X2.6
