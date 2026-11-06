# TheUnderscore/Industry-Coder-27B-v2.0-NVFP4-W4ATTN-AWQ

## Resumen

Industry-Coder-27B-v2.0-NVFP4-W4ATTN-AWQ es una versión cuantizada en precisión mixta del modelo kataguru/Industry-Coder-27B-v2.0, un finetune orientado a agentes de programación sobre una base de la familia Qwen (etiquetada como qwen3_5/qwen3_8 en los metadatos). Lo publica el usuario TheUnderscore y su aportación principal no es el modelo en sí, sino la receta de cuantización: reduce el peso de 55,6 GB a 20,3 GB combinando NVFP4 (float4) en las capas MLP y W4A16 asimétrico (int4) en las capas de atención, dejando en BF16 las partes sensibles.

El modelo conserva la modalidad image-text-to-text del original, de modo que mantiene entrada visual además de texto, y está pensado para cargarse con vLLM mediante el formato compressed-tensors con dos config_groups (uno int4 y otro float4). La motivación es clara: hacer viable un modelo de 27,8 mil millones de parámetros en hardware más modesto sin degradar en exceso las capas donde la cuantización agresiva rompe el comportamiento.

Es relevante ahora porque demuestra una estrategia de cuantización por capas basada en la varianza intra-grupo: cuanto mayor es la varianza, más fina debe ser la resolución de escala. El resultado es un checkpoint de 20,3 GB, con licencia Apache-2.0, publicado en noviembre de 2026 y sin descargas ni likes registrados en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal con delta-rule y atención estándar), base Qwen3.5/3.8; multimodal image-text-to-text |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de uso fija max_model_len=8192) |
| Tipos de cuantizacion | NVFP4 (float4, grupo 16) en MLP; W4A16 asimétrico (int4, grupo 128) en atención; BF16 en in_proj_a/b, lm_head, embed_tokens, visual, mtp y norms |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con cuantización compressed-tensors (dos config_groups: W4A16 int4 y NVFP4 float4) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer híbrido de la familia Qwen, con capas de atención estándar (q/k/v/o) y capas de atención lineal con compuertas delta-rule (in_proj_qkv/z, in_proj_a/b, out_proj). El checkpoint incluye además un módulo visual (model.visual.*) y un módulo MTP (multi-token prediction), ambos preservados en BF16 porque la cuantización por grupos no encaja bien en el primero y los segundos son demasiado pequeños para tolerar pérdida de precisión. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La innovación técnica de esta ficha está en la cuantización. Se aplicó llmcompressor en modo oneshot con config_groups para despachar formatos por capa, más AWQModifier con mapeos específicos para atención híbrida (se descartaron las reglas de linear_attn). El criterio es la varianza intra-grupo: las capas MLP (gate/up/down) presentan varianza alta y reciben NVFP4 con grupo 16 para tener resolución de escala fina; las capas de atención tienen varianza menor y usan int4 con grupo 128, donde el suavizado AWQ reequilibra las escalas por canal. Las compuertas delta-rule de 48 canales quedan en BF16 porque int4 rompe la recurrencia, y lm_head/embed_tokens se mantienen en BF16 porque dominan la perplejidad. El script de cuantización se distribuye junto al modelo.

## Capacidades

- Generación de texto y razonamiento general, heredados del finetune base.
- Generación y edición de código, con orientación explícita a agentes de programación (tags coding-agent y agentic).
- Entrada multimodal image-text-to-text: acepta imágenes junto a texto.
- Conversación multi-turno (tag conversational).
- Soporte de tool calling y flujos agénticos de varios pasos, según los tags del modelo base.
- Capacidades multilingües: no disponible.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.
- Módulo MTP (multi-token prediction) presente en el checkpoint, preservado en BF16; su uso efectivo depende del runtime.

## Casos de uso

- Asistencia de código en IDE: el modelo puede autocompletar, explicar y refactorizar código dentro de un plugin de editor, y su tamaño de 20,3 GB permite servirlo en una o dos GPU de gama profesional con vLLM.
- Agentes de resolución de incidencias: con soporte de tool calling, puede encadenar lecturas de repositorio, ejecución de tests y propuestas de parche en pipelines de CI/CD.
- Revisión de pull requests: dado un diff y el contexto del repositorio, genera comentarios técnicos y detecta regresiones, aprovechando la ventana de contexto del modelo base (consultar su model card para el valor exacto).
- Análisis de capturas y diagramas: al ser image-text-to-text, puede interpretar maquetas de UI, diagramas de arquitectura o capturas de error y traducirlos a código o a pasos de depuración.
- Migración de código legacy: tareas de traducción entre lenguajes o frameworks con contexto largo, adecuadas para un modelo de 27,8 B con capacidad agéntica.
- Despliegue en hardware limitado: la cuantización a 20,3 GB permite ejecutar el modelo en configuraciones de 2 GPU con tensor_parallel_size=2, algo inviable con los 55,6 GB del original en BF16.
- Generación de documentación técnica: a partir de código fuente y comentarios, produce guías y referencias de API en conversaciones multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones de perplejidad frente al modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 20,3 GB en disco; en inferencia se necesita margen adicional para caché KV y activaciones, por lo que conviene prever al menos 24-32 GB de VRAM en total según longitud de contexto y lote.
- GPU recomendadas: el autor indica kernels SM70 (Marlin/TurboMind) para ambos esquemas en 1Cat-vLLM, lo que apunta a GPU Volta en adelante; para tensor_parallel_size=2 se usan dos GPU. No se especifican modelos concretos como A100, H100 o RTX 4090.
- GPU de consumo: no confirmado. Una RTX 4090 de 24 GB podría alojar los pesos, pero no hay validación publicada de que quepa con caché KV para contextos largos.
- Opciones de despliegue: vLLM (probado con 1Cat-vLLM, que soporta el despacho por config_groups de compressed-tensors y kernels SM70). No se menciona soporte de llama.cpp, Ollama ni TGI; la cuantización NVFP4/W4A16 de compressed-tensors no es compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Industry-Coder-27B-v2.0-NVFP4-W4ATTN-AWQ | 27,8 B | no disponible | NVFP4 + W4A16 mixta (20,3 GB) | Apache-2.0 | Hugging Face, 0 descargas |
| kataguru/Industry-Coder-27B-v2.0 (base) | 27,8 B (estimado) | no disponible | BF16 (55,6 GB) | Apache-2.0 (según el finetune) | Hugging Face |
| Qwen3.8-27B (referencia citada en la model card) | 27 B (por el nombre) | no disponible | BF16 | no disponible | Hugging Face |

La comparación directa con alternativas de la misma categoría (por ejemplo, otros finetunes de código de 27-32 B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce pérdida de precisión; el autor no publica evaluación de degradación frente al modelo en BF16, por lo que la calidad real en tareas de código y razonamiento no está verificada.
- El soporte de runtime es restringido: requiere vLLM con despacho de config_groups de compressed-tensors (probado con 1Cat-vLLM); otros motores pueden no cargar el checkpoint.
- El modelo base es un finetune de terceros (kataguru) sobre una base Qwen; los sesgos, la calidad del dataset de instrucciones y el riesgo de alucinación heredan las limitaciones no documentadas de ese linaje.
- Idiomas soportados no declarados: no hay garantía de calidad fuera del inglés o del castellano.
- Longitud de contexto no especificada en esta ficha; el ejemplo de uso limita max_model_len a 8192, lo que sugiere que contextos mayores requieren verificación empírica.
- Las capas en BF16 (embeddings, lm_head, visión, MTP) mantienen el consumo de memoria y no se benefician de la compresión.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del finetune original antes de producción.
- Modelo con 0 descargas y 0 likes: sin validación comunitaria ni informes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheUnderscore/Industry-Coder-27B-v2.0-NVFP4-W4ATTN-AWQ
- Modelo base (finetune): https://huggingface.co/kataguru/Industry-Coder-27B-v2.0
- Referencia citada como base original en la model card: https://huggingface.co/Qwen/Qwen3.8-27B
