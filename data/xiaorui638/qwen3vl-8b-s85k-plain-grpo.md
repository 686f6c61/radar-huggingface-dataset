# xiaorui638/qwen3vl-8b-s85k-plain-grpo

## Resumen

El modelo `xiaorui638/qwen3vl-8b-s85k-plain-grpo` es un fine-tuning del vision-language model (VLM) `Qwen/Qwen3-VL-8B-Instruct`, entrenado mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization) sobre un conjunto de 85.000 ejemplos de "pares gemelos de premisa falsa" (false-premise twin pairs). El objetivo es que el modelo sea capaz de rechazar preguntas que contienen premisas falsas en imágenes, sin convertirse en un negacionista sistemático de todas las premisas. Para ello, cada imagen del dataset lleva una pregunta positiva respondible a partir de la imagen y una pregunta gemela negativa cuya premisa es falsa, donde la respuesta correcta es una opción explícita de rechazo de la premisa. La proporción es de 2 positivas por cada negativa.

El entrenamiento se realizó con GRPO con recompensa de precisión únicamente (sin shaping de verificación), KL deshabilitado, rollout de 8 muestras a temperatura 1.0, batch de rollout 384 y global 96, con una tasa de aprendizaje de 1e-6 y una sola época, sobre el framework EasyR1 (veRL) en 24 nodos GH200. El resultado principal es una mejora sustancial en la precisión pareada (ambas gemelas correctas) en el benchmark interno ZoomBench/TreeBench, pasando del 11,20% al 43,55% en el micro-promedio de todos los pares, y del 34,02% al 74,82% en la precisión por pregunta. Es relevante ahora porque aborda un problema conocido de los VLM: la alucinación y la aceptación de premisas falsas en preguntas multimodales, un paso hacia modelos más robustos y verificables en entornos de razonamiento visual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal denso, vision-language model) |
| Parámetros totales | 8.767.123.696 (aprox. 8,77 mil millones) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-VL soporta hasta 256K tokens de contexto intercalado (según paper técnico) |
| Tipos de cuantización | no disponibles; los pesos se distribuyen en bfloat16 (bf16) |
| Idiomas soportados | no disponibles en la model card; el modelo base Qwen3-VL es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-VL-8B-Instruct`, un VLM denso de la familia Qwen3-VL con arquitectura transformer multimodal que procesa texto, imágenes y vídeo de forma intercalada. El fine-tuning se realizó con GRPO, un algoritmo de aprendizaje por refuerzo que optimiza la política mediante grupos de muestras, sin usar un modelo de crítica. La recompensa fue exclusivamente de precisión (emparejamiento de letras o cadenas, con un juez LLM en caso de fallo), con KL deshabilitado. Los datos de entrenamiento consisten en 85.000 ejemplos de pares gemelos con premisas falsas, generados con un pipeline que construye preguntas positivas y negativas sobre la misma imagen. El entrenamiento se hizo en 1 época, con un checkpoint final en el paso global 221, y el modelo se entrenó con un formato de prompt de "pensar y luego responder", emitiendo razonamiento seguido de la respuesta entre etiquetas `<answer>...</answer>`.

## Capacidades

- Generación de texto e imagen a texto (image-text-to-text) con razonamiento visual.
- Rechazo explícito de premisas falsas: el modelo aprende a negar preguntas cuya premisa no se corresponde con la imagen, en lugar de alucinar una respuesta.
- Razonamiento multi-paso con formato "think-then-answer" (emite razonamiento antes de la respuesta final).
- Capacidad de mantener la precisión en preguntas positivas: al ser entrenado con pares 2:1 positivas/negativas, no se convierte en un negador sistemático (la precisión positiva sube del 44,52% al 58,56% en el benchmark).
- Multimodalidad heredada del base: comprensión de imágenes, texto y vídeo (capacidad del modelo base, no verificada en el fine-tuning).
- Tool calling y capacidades de agente: heredadas del modelo base Qwen3-VL (no evaluadas en este modelo).

## Casos de uso

- **Sistemas de QA visual con verificación de premisas**: en aplicaciones de respuesta a preguntas sobre imágenes (por ejemplo, documentación técnica con diagramas), el modelo puede detectar que la pregunta asume algo que no está en la imagen y responder con un rechazo explícito, evitando respuestas falsas.
- **Moderación de contenido visual**: para detectar y rechazar preguntas o instrucciones que presuponen la existencia de elementos no presentes en una imagen, útil en entornos de seguridad y moderación.
- **Agentes de razonamiento visual**: en pipelines de agentes que analizan imágenes (por ejemplo, inspección de productos o imágenes médicas), el modelo puede señalar cuándo una consulta del usuario se basa en un supuesto incorrecto, reduciendo errores en la toma de decisiones.
- **Evaluación de robustez de VLMs**: como modelo de referencia para evaluar cómo los VLM manejan premisas falsas, puede usarse como baseline en benchmarks de alucinación y robustez.
- **Asistentes de accesibilidad**: para describir imágenes y responder preguntas de usuarios, con la capacidad de detectar cuando la pregunta es inválida y ofrecer una negación clara en lugar de un invento.
- **Sistemas de razonamiento multimodal en educación**: en plataformas que enseñan a estudiantes a formular preguntas sobre imágenes, el modelo puede señalar premisas incorrectas y explicar por qué, fomentando el pensamiento crítico.

## Benchmarks y rendimiento

El autor publicó resultados en el benchmark ZoomBench/TreeBench (MCQ, in-domain, 2.343 preguntas = 584 positivas + 1.759 pares gemelos), evaluados con vLLM, semilla 42, T=0.7, bf16, y con un juez de regla y luego Qwen3-30B-A3B-Instruct. **Es una sola semilla, sin estimación de varianza.**

**Precisión pareja (ambas gemelas correctas):**

| Categoría | Pares | Qwen3-VL-8B base | Este modelo |
|---|---:|---:|---:|
| needle_obj | 445 | 20,00 | **54,83** |
| needle_attr | 393 | 12,21 | **48,35** |
| ref_1_obj | 269 | 12,27 | **46,84** |
| ref_1_attr | 226 | 6,19 | **39,38** |
| ref_1_rel | 202 | 3,47 | **24,26** |
| ref_2_obj | 84 | 5,95 | **42,86** |
| ref_2_attr | 74 | 1,35 | **31,08** |
| ref_2_rel | 66 | 0,00 | **13,64** |
| **micro (todos los pares)** | **1759** | **11,20** | **43,55** |

**Precisión por pregunta:**

| Categoría | n | Qwen3-VL-8B base | Este modelo |
|---|---:|---:|---:|
| positiva | 584 | 44,52 | **58,56** |
| needle_obj | 445 | 53,71 | **92,13** |
| needle_attr | 393 | 27,74 | **87,28** |
| ref_1_obj | 269 | 33,09 | **86,62** |
| ref_1_attr | 226 | 18,58 | **79,20** |
| ref_1_rel | 202 | 13,86 | **50,50** |
| ref_2_obj | 84 | 22,62 | **82,14** |
| ref_2_attr | 74 | 9,46 | **71,62** |
| ref_2_rel | 66 | 6,06 | **33,33** |
| **overall** | **2343** | **34,02** | **74,82** |

El autor advierte que la precisión por pregunta recompensa la negación (un modelo que niega todas las preguntas puntúa alto en los 1.759 negativos pero falla los 584 positivos), por lo que la métrica clave es la precisión pareja. El benchmark es in-domain, construido con el mismo pipeline que los datos de entrenamiento, y mide el comportamiento aprendido, no la transferencia de capacidad general.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en bf16 ocupan aproximadamente 17,5 GB (8,77 mil millones × 2 bytes) más el overhead de activaciones y la entrada multimodal; se recomienda una GPU con al menos 24 GB de VRAM para inferencia con contexto corto, y más para contextos largos.
- **GPU recomendadas**: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB), o GPUs profesionales con 24 GB o más. No cabe en GPUs consumer de 8/12 GB sin cuantización (no se proporcionan pesos cuantizados).
- **Opciones de despliegue**: compatible con `transformers` (carga con `AutoProcessor` y `Qwen3VLForConditionalGeneration`), y con `vLLM` (comando `vllm serve REPO_ID --dtype bfloat16 --limit-mm-per-prompt image=1`). También se puede usar con otras herramientas que soporten safetensors y arquitecturas Qwen3-VL, como TGI, aunque no se ha verificado.
- **Latencia y throughput**: no disponibles en la información proporcionada; dependerá del hardware, la longitud del contexto y el uso de decodificación especulativa u otras optimizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión pareja (ZoomBench) | Precisión overall (ZoomBench) | Licencia | Disponibilidad |
|---|---|---|---|---:|---:|---|---|
| Qwen/Qwen3-VL-8B-Instruct (base) | ~8,77B | hasta 256K (paper) | 11,20 % | 34,02 % | Apache 2.0 | Hugging Face |
| xiaorui638/qwen3vl-8b-s85k-plain-grpo (este modelo) | ~8,77B | no disponible | **43,55 %** | **74,82 %** | Apache 2.0 | Hugging Face |
| xiaorui638/FINER-Qwen3-VL-8B | ~8,77B | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos del mismo autor y al base, ya que no se dispone de datos de otros VLM de 8B en este benchmark. El modelo FINER-Qwen3-VL-8B aparece en el repositorio del autor, pero no se han publicado resultados comparables en la información disponible.

## Limitaciones y advertencias

- **Evaluación con una sola semilla**: no hay estimación de varianza; diferencias menores de 1 punto porcentual deben tratarse como ruido.
- **Benchmark in-domain**: los resultados se obtuvieron en un conjunto construido con el mismo pipeline que los datos de entrenamiento; no se ha medido la transferencia de capacidad general fuera de este dominio.
- **Trade-off de capacidad general**: el autor indica que el modelo "vende" algo de capacidad general en MCQ por la robustez de premisas; no es un VLM de propósito general sin una evaluación más amplia.
- **Cuello de botella en preguntas positivas**: la precisión positiva solo sube de 44,52 % a 58,56 %, y la mayoría del error parecido restante viene de fallos en la gemela positiva, no en la negativa. Las negativas relacionales (`ref_*_rel`) siguen siendo difíciles.
- **Riesgo de alucinación**: aunque el objetivo es reducir la aceptación de premisas falsas, el modelo puede fallar en otros tipos de alucinación, ya que hereda las limitaciones del modelo base.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero debe incluirse el aviso de licencia correspondiente.
- **Uso en producción**: requiere una evaluación completa fuera del dominio de entrenamiento antes de su despliegue como VLM de propósito general.

## Enlaces

- [Hugging Face: xiaorui638/qwen3vl-8b-s85k-plain-grpo](https://huggingface.co/xiaorui638/qwen3vl-8b-s85k-plain-grpo)
- [Hugging Face: xiaorui638/FINER-Qwen3-VL-8B](https://huggingface.co/xiaorui638/FINER-Qwen3-VL-8B)
- [GitHub: QwenLM/Qwen3-VL](https://github.com/QwenLM/Qwen3-VL)
- [arXiv: Qwen3-VL Technical Report (2511.21631)](https://arxiv.org/abs/2511.21631)
- [GitHub: EasyRLHF (veRL)](https://github.com/hiyouga/EasyRLHF)
