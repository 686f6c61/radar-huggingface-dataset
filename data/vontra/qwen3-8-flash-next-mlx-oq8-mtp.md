# Vontra/Qwen3.8-Flash-Next-MLX-oQ8-MTP

## Resumen

Qwen3.8-Flash-Next-MLX-oQ8-MTP es una conversión comunitaria a formato MLX del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Vontra (con referencias internas a TensorFold en la model card). Se trata de un modelo de lenguaje y visión de tipo mixtura de expertos (MoE) dispersa, cuantizado en 8 bits con un esquema que el autor denomina oQ8 (cuantización afín casi uniforme con grupo de tamaño 32), pensado para ejecutarse en Apple Silicon mediante los runtimes oMLX o MLX-VLM.

El modelo base pertenece a la familia Qwen3.8 y su arquitectura interna se identifica como `qwen4_exp`. Combina capas Gated DeltaNet, Qwen Sparse Attention, capas MoE dispersas, flujos residuales con compuertas ensanchadas, tablas de embeddings hasheadas de bigramas y trigramas, y un bloque nativo de predicción del siguiente token (MTP) para decodificación especulativa. El checkpoint incluye 179.999.981.459 parámetros totales según los safetensors, con 125B en el modelo de lenguaje (6B activos) y 51B adicionales en las tablas de embeddings de n-gramas.

Su relevancia práctica reside en dos factores: permite ejecutar un modelo de gran tamaño con contexto configurado de 262.144 tokens en hardware Apple, y preserva el bloque MTP nativo, lo que según las mediciones del autor aporta una mejora de throughput del 83% (de 19,5 a 35,7 tokens/s en un Apple M3 Studio). Es una conversión de comunidad, no un lanzamiento oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` vision-language sparse MoE (Gated DeltaNet + Qwen Sparse Attention + MoE + MTP nativo) |
| Parametros totales | 179.999.981.459 (125B en el LM + 51B en embeddings de n-gramas) |
| Parametros activos | 6B (512 expertos enrutados, 10 activos, mas 1 compartido) |
| Longitud de contexto | 262.144 tokens (configurado) |
| Tipos de cuantizacion | oQ8, 8 bits afín casi uniforme, grupo de tamano 32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | MLX safetensors (37 shards, 3.747 tensores) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina varias innovaciones. El modelo de lenguaje tiene 48 capas, 24 cabezas de atención y 2 cabezas KV, con un tamano oculto de 2.560. Emplea capas Gated DeltaNet (atención lineal con estado recurrente) junto con Qwen Sparse Attention, lo que reduce el coste computacional en contextos largos. Las capas MoE cuentan con 512 expertos enrutados de los que se activan 10 por token, más un experto compartido, lo que da lugar a los 6B de parámetros activos sobre los 125B del LM. Además, incorpora tablas de embeddings hasheadas de bigramas y trigramas (51B de parámetros) que amplían la capacidad de representación léxica sin incrementar el coste por token en la misma proporción.

El bloque MTP nativo (un bloque borrador de tipo Qwen4Exp) permite decodificación especulativa integrada en el propio checkpoint, sin necesidad de un modelo drafter externo. La model card advierte explícitamente de que no debe acoplarse un drafter de Qwen3.8 27B, ya que Flash Next tiene dimensiones ocultas distintas y ya incluye su propio bloque MTP compatible.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La conversión se realizó directamente desde el checkpoint BF16 oficial de Qwen, con validación estructural de los 3.747 tensores y los 37 shards, y verificación del bloque MTP (76 tensores convertidos).

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general en el modelo base.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con procesador de visión preservado.
- Decodificación especulativa nativa mediante MTP, con un bloque borrador integrado.
- Soporte de contexto largo de hasta 262.144 tokens configurados, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingües: no disponible en detalle (los idiomas no están listados en la información proporcionada).
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos largos en local: con 262.144 tokens de contexto, el modelo puede ingerir informes, expedientes o bases de código extensas en una sola pasada sobre un Mac con suficiente memoria unificada, sin depender de APIs externas.
- Análisis de imágenes con descripción textual: gracias al pipeline image-text-to-text, se puede usar para extraer información de capturas, diagramas o documentos escaneados y generar resúmenes o respuestas en lenguaje natural.
- Asistentes conversacionales privados en Apple Silicon: el despliegue local mediante MLX permite mantener conversaciones multi-turno sin enviar datos a servicios externos, relevante para entornos con requisitos de confidencialidad.
- Prototipado e investigación en decodificación especulativa: el bloque MTP nativo y la telemetría de aceptación de borradores (62,7% en la prueba del autor) lo convierten en un banco de pruebas para estudiar técnicas de aceleración de inferencia.
- Generación asistida en flujos de trabajo de desarrollo: con 6B de parámetros activos, el coste por token es contenido, lo que permite integrarlo en tareas de autocompletado o revisión de código en local, siempre que el runtime soporte `qwen4_exp`.
- Evaluación comparativa de cuantizaciones: al ser una conversión oQ8 con grupo 32 sobre BF16, sirve para medir la degradación de calidad frente al checkpoint original en tareas deterministas (el autor reporta respuestas exactas a instrucciones, recall factual y aritmética básica).
- Experimentación con modelos MoE de gran escala en hardware de consumo profesional: útil para investigadores que quieran estudiar el comportamiento de un MoE de 180B parámetros totales sin acceso a clústeres de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta mediciones de throughput en un Apple M3 Studio con generación determinista de 128 tokens:

| Modo de runtime | Tokens de salida | Velocidad |
|---|---:|---:|
| MTP nativo desactivado | 128 | 19,5 tokens/s |
| MTP nativo activado, tres tokens borrador | 128 | 35,7 tokens/s |

Con MTP activado se aceptaron 69 de 110 propuestas de borrador (62,7%). El autor advierte de que la primera petición tras la carga incluye calentamiento y no debe tomarse como cifra de régimen estable.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 202,75 GB (188,82 GiB) en pesos oQ8; se necesita un Mac con memoria unificada igual o superior a esa cifra más el margen para KV cache y buffers del runtime. En la práctica, esto apunta a configuraciones de 256 GB o más.
- GPU recomendadas: Apple Silicon de gama alta (M3 Studio validado por el autor; se presupone M2/M3 Ultra con memoria suficiente). No está pensado para GPU NVIDIA ni AMD, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? No en el sentido habitual: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090. Solo es viable en equipos Apple con memoria unificada muy alta.
- Opciones de despliegue: oMLX o MLX-VLM con soporte explícito de `qwen4_exp` y MTP nativo. Los runtimes estándar que no construyan el módulo MTP de Qwen4Exp pueden rechazar los 76 tensores MTP durante la carga estricta de pesos.
- Latencia y throughput: 19,5 tokens/s sin MTP y 35,7 tokens/s con MTP en un Apple M3 Studio, según la medición del autor. No hay datos de latencia de primera token ni de throughput con prompts largos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros totales | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MLX-oQ8-MTP (este) | 180B (125B LM + 51B n-gramas) | 6B | 262.144 | MLX safetensors oQ8 | Qwen Community 1.0 |
| Qwen/Qwen3.8-Flash-Next (base) | 180B (según checkpoint) | 6B | 262.144 | BF16 safetensors | Qwen Community 1.0 |
| Otras alternativas MoE de la familia Qwen3.8 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros fabricantes con características equivalentes (MoE disperso con MTP nativo y soporte de visión) en el material proporcionado.

## Limitaciones y advertencias

- Es una conversión comunitaria, no una versión oficial de Qwen; la calidad de la cuantización oQ8 no ha sido validada de forma independiente más allá de las pruebas del autor.
- Requiere un runtime con soporte explícito de `qwen4_exp` y MTP nativo; runtimes estándar pueden fallar al cargar los tensores MTP.
- No debe acoplarse un drafter de Qwen3.8 27B: las dimensiones ocultas son distintas y el modelo ya incluye su propio bloque MTP.
- El tamaño del repositorio (202,75 GB) limita su uso a equipos con memoria unificada muy alta; no es desplegable en GPU de consumo convencionales.
- La licencia Qwen Community License 1.0 impone condiciones específicas para uso comercial; es necesario revisar el texto de la licencia incluido en el repositorio antes de un despliegue en producción.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de seguridad específica de esta conversión; se remite a la model card del modelo base.
- No se detallan los idiomas soportados ni el rendimiento multilingüe.
- El rendimiento medido (35,7 tokens/s con MTP) corresponde a un único prompt determinista en un M3 Studio; puede variar con la longitud del prompt, el estado de la caché, el muestreo y la presión de memoria.
- El autor no reporta benchmarks de calidad estándar, por lo que no es posible cuantificar la degradación frente al checkpoint BF16 original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ8-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre Qwen3.8 Flash Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Repositorio MLX-VLM: https://github.com/ml-explore/mlx-vlm
- Licencia Qwen Community License 1.0 (incluida en el repositorio): https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ8-MTP/blob/main/LICENSE
- Sitio de Qwen: https://qwen.ai/
- Referencia del autor de la conversión (TensorFold): https://tensorfold.dev
