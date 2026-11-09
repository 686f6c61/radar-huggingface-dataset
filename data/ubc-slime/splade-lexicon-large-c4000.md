# UBC-SLIME/splade-lexicon-large-c4000

## Resumen

SPLADE-Lexicon-large-c4000 es un modelo de recuperación dispersa (sparse retrieval) desarrollado por el grupo UBC-SLIME, diseñado específicamente para atribución de autoría a gran escala. Se construye sobre el backbone `answerdotai/ModernBERT-large` y se entrena para producir representaciones léxicas dispersas de 4000 dimensiones por documento, donde cada dimensión corresponde a un clúster de tokens aprendido durante el entrenamiento. El modelo acompaña al artículo "Learned Sparse Lexical Representations for Large-scale Authorship Attribution" (Findings de EMNLP 2026).

La propuesta técnica es relevante porque combina las ventajas de SPLADE (representaciones dispersas interpretables y eficientes en recuperación) con agrupamiento de tokens aprendido, lo que permite capturar patrones léxicos idiosincrásicos del autor sin depender de un vocabulario fijo. El resultado es un encoder de 395,8 millones de parámetros que genera un vector disperso por documento, adecuado para búsqueda e identificación de autor en corpus grandes.

El checkpoint publicado corresponde al paso 1582 (época 2.0) del entrenamiento, con longitud máxima de secuencia de 512 tokens. Está pensado para ser usado con el repositorio `lingjzhu/neural_lexical`, no como un sentence-transformer convencional, y requiere cargar junto a los pesos el fichero `cluster_ids.pt` con las asignaciones de clúster aprendidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) con pooling fusionado y cabecera SPLADE sobre clústeres de tokens |
| Parámetros totales | 395.831.296 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (más `cluster_ids.pt` para asignaciones de clúster) |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-large`, un encoder transformer moderno con atención eficiente, y le añade una cabecera de representación léxica dispersa. La salida es un vector de 4000 dimensiones por documento, una por cada clúster de tokens. Las asignaciones de tokens a clústeres se aprenden durante el entrenamiento y se guardan en `cluster_ids.pt`; en inferencia deben cargarse tal cual, sin volver a ejecutar k-means. El checkpoint usa *fused mean pooling* y dos operaciones `log1p` posteriores al pooling, en el mismo orden que durante el entrenamiento. La implementación en PyTorch reproduce ese orden de activaciones; para inferencia en CPU hay que fijar `module.use_triton=False`.

El entrenamiento se realizó hasta el paso 1582 (época 2.0) sobre el backbone ModernBERT-large con secuencia máxima de 512 tokens. El checkpoint publicado proviene de `exp2/checkpoints/outputs_clustered_modernbert_large_4000/checkpoint-1582`. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; dado el dominio (atribución de autoría), lo esperable es un entrenamiento supervisado o contrastivo sobre corpus de autores, pero este extremo no está confirmado en la información proporcionada.

## Capacidades

- Generación de representaciones dispersas de documentos: un vector de 4000 dimensiones por documento, con dimensiones alineadas a clústeres de tokens.
- Recuperación léxica dispersa: permite puntuar similitud documento-documento mediante producto escalar de embeddings dispersos (`embeddings @ embeddings.T`).
- Atribución de autoría: capacidad principal del modelo, orientada a identificar o verificar el autor de un texto a partir de patrones léxicos.
- Tokenización y codificación de lotes de documentos mediante la API de `SparseEncoder`.
- Inferencia en GPU con autocast en bfloat16, y fallback en CPU desactivando Triton.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de representación, no un modelo generativo.
- No soporta visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Atribución forense de autoría: dado un texto anónimo, codificarlo y comparar su vector disperso contra una base de vectores de autores conocidos para obtener el candidato más probable. Adecuado por la naturaleza léxica e interpretable de las dimensiones.
- Detección de plagio y reutilización de textos: indexar un corpus con los vectores dispersos y recuperar documentos con alta similitud léxica para revisión manual.
- Verificación de identidad autoral en plataformas editoriales: comparar el estilo léxico de manuscritos enviados con el historial del autor declarado para detectar suplantaciones o ghostwriting.
- Análisis de corpus históricos o literarios: agrupar obras por autoría putativa y estudiar la evolución estilística mediante la distribución de activaciones sobre clústeres.
- Moderación y cumplimiento en foros: identificar cuentas sockpuppet o usuarios que evaden un baneo comparando sus mensajes con perfiles previos.
- Construcción de índices de recuperación eficientes: al ser representaciones dispersas, permiten usar índices invertidos en lugar de búsqueda densa, reduciendo coste de almacenamiento y latencia en corpus grandes.
- Investigación en representaciones léxicas aprendidas: servir de base para experimentos que comparen clústeres aprendidos frente a vocabularios fijos en tareas de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación completa de HRS no se ha vuelto a ejecutar para esta release y que no se reclaman nuevos resultados de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: alrededor de 0,8 GB solo para pesos (395,8 M de parámetros), más memoria de activaciones y del lote; con lotes pequeños cabe holgadamente en GPUs de 8 GB.
- GPU recomendadas: cualquier GPU con soporte de bfloat16, como RTX 3090, RTX 4090, A100 o H100. El modelo es pequeño y no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 8 GB de VRAM.
- Opciones de despliegue: el modelo no se sirve con vLLM, llama.cpp, Ollama ni TGI, ya que no es generativo. Se usa con el repositorio `lingjzhu/neural_lexical` y PyTorch, con kernel Triton en GPU o fallback en CPU (`module.use_triton=False`).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPLADE-Lexicon-large-c4000 | 395,8 M | 512 | Dispersa, 4000 dims | MIT | Hugging Face |
| SPLADE estándar sobre BERT | no disponible | 512 | Dispersa, vocabulario fijo (~30k dims) | según checkpoint | Hugging Face |
| Modelos de atribución de autoría basados en stylometry clásico | no aplica | variable | Features manuales | variable | no disponible |
| Encoders densos de sentence-transformers | variable | variable | Densa | variable | Hugging Face |

La diferencia clave frente a SPLADE clásico es que las dimensiones no corresponden a un vocabulario fijo sino a clústeres de tokens aprendidos, lo que reduce la dimensionalidad a 4000 y adapta la representación a la tarea de atribución. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado y evaluado solo en inglés; no se garantiza comportamiento en otros idiomas.
- Longitud máxima de secuencia de 512 tokens: documentos más largos deben truncarse o segmentarse, lo que puede perder señal estilística.
- No es un modelo generativo ni un chatbot: no soporta instrucciones, tool calling ni razonamiento.
- Riesgo de sesgo hacia los autores y dominios presentes en el corpus de entrenamiento; el comportamiento fuera de esa distribución no está caracterizado en la información disponible.
- La evaluación de HRS no se ha vuelto a ejecutar para esta release, por lo que las cifras de rendimiento del artículo pueden no corresponder exactamente a este checkpoint empaquetado.
- Requiere cargar `cluster_ids.pt` junto a los pesos; usar el modelo sin esas asignaciones produce resultados incorrectos.
- El orden de activaciones (fused mean pooling y dos `log1p`) debe respetarse; usar otra implementación puede degradar las representaciones.
- En CPU es obligatorio desactivar Triton (`module.use_triton=False`).
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del backbone ModernBERT-large y del corpus de entrenamiento original.
- Al ser un modelo con 0 descargas y 0 likes, no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UBC-SLIME/splade-lexicon-large-c4000
- Artículo (Findings EMNLP 2026): https://aclanthology.org/2026.findings-emnlp.400/
- Repositorio de código: https://github.com/lingjzhu/neural_lexical
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
