# VINAY-UMRETHE/Qwen3.5-4B-heretic-test-ara

## Resumen

VINAY-UMRETHE/Qwen3.5-4B-heretic-test-ara es un ajuste fino del modelo multimodal Qwen/Qwen3.5-4B, publicado por el usuario VINAY-UMRETHE, cuyo objetivo es eliminar los mecanismos de rechazo (refusals) y la censura del modelo original. Se ha generado con la herramienta Heretic v2.0.0.dev0, que aplica una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas internas del transformer, sin reentrenar los pesos completos. El resultado es un modelo "abliterated" o "decensored" que reduce los rechazos de 99/100 en el modelo base a 5/100, a costa de una divergencia KL de 0.3777 respecto al comportamiento original.

El modelo hereda la arquitectura hibrida de Qwen3.5: una combinacion de Gated DeltaNet (atencion lineal) y Gated Attention con un encoder de vision, con 4.539.265.536 parametros totales (4,54B) y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000. Su pipeline es image-text-to-text, por lo que conserva la capacidad de procesar imagenes ademas de texto. El repositorio pesa 9,1 GB y los pesos estan en formato safetensors compatibles con Transformers.

Es relevante para desarrolladores e investigadores que necesiten un modelo pequeno (4B) sin filtros de rechazo para tareas de investigacion sobre alineacion, evaluacion de seguridad de modelos, o casos donde los rechazos interfieren con usos legitimos. Tambien interesa por su caracter reproducible: el autor incluye un directorio `reproduce` con los parametros de ablacion exactos, lo que permite replicar el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; hibrida Gated DeltaNet + Gated Attention (base Qwen3.5) |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativa, extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (solo pesos safetensors) |
| Idiomas soportados | 201 idiomas y dialectos (heredado del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers) |

Otros datos del modelo base Qwen3.5-4B: dimension oculta 2560, embedding de tokens 248320 (padded), 32 capas, layout oculto 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)), 32 cabezas de atencion lineal para V y 16 para QK (dim 128), 16 cabezas de atencion para Q y 4 para KV (dim 256, RoPE 64), FFN de dimension intermedia 9216, salida LM de 248320 atada al embedding, y MTP (Multi-Token Prediction) entrenado con multiples pasos.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer causal hibrido que combina dos mecanismos de atencion: Gated DeltaNet (una forma de atencion lineal con compuertas) y Gated Attention clasica. El layout alterna bloques: por cada grupo de cuatro capas hay tres secuencias (Gated DeltaNet → FFN) seguidas de una (Gated Attention → FFN), repetido ocho veces hasta completar las 32 capas. El modelo base fue preentrenado y postentrenado por el equipo de Qwen con fusion temprana de tokens multimodales, lo que le permite procesar texto e imagenes en un unico espacio.

Este repositorio concreto no es un reentrenamiento, sino una modificacion de pesos mediante ablacion ARA con Heretic v2.0.0.dev0. Los parametros declarados de la ablacion son: start_layer_index 3, end_layer_index 26, preserve_good_behavior_weight 0.8842, steer_bad_behavior_weight 0.0262, overcorrect_relative_weight 0.8317 y neighbor_count 12. La tecnica busca direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y las suprime preservando parcialmente el comportamiento deseado. No se ha aplicado RLHF ni DPO adicional; la unica intervencion es la ablacion. El autor indica que el proceso es reproducible y aporta los datos necesarios en el directorio `reproduce`.

No se especifica en la informacion disponible el numero de tokens ni la composicion del dataset de la ablacion, ya que la tecnica no requiere un corpus de entrenamiento convencional.

## Capacidades

- Generacion de texto conversacional en multiples idiomas (201 idiomas y dialectos heredados del base).
- Razonamiento, conocimiento general y tareas STEM, con resultados del modelo base Qwen3.5-4B en benchmarks como MMLU-Pro.
- Comprension de imagenes: pipeline image-text-to-text con Vision Encoder, por lo que acepta entradas visuales ademas de texto.
- Codigo y matematicas (capacidades del modelo base Qwen3.5-4B).
- Soporte de tool calling / function calling (heredado del base Qwen3.5, etiquetado como `endpoints_compatible`).
- Capacidades de agente y razonamiento multi-paso (el modelo base fue entrenado con RL a escala de entornos multi-agente).
- Generacion aumentada por recuperacion (RAG) gracias al contexto largo de 262.144 tokens.
- Modo de pensamiento (thinking) segun el comportamiento del modelo base Qwen3.5.
- Reduccion drastica de rechazos: 5/100 frente a 99/100 del original, util para investigacion sobre alineacion y seguridad.
- Capacidad de prediccion multi-token (MTP) entrenada en el modelo base.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar como la ablacion de direcciones afecta a los rechazos y al comportamiento general, usando los parametros ARA reproducibles y la metrica de divergencia KL (0.3777) como referencia.
- Evaluacion de robustez de guardarrailes: util para medir hasta que punto las tecnicas de decensurado degradan la capacidad del modelo de negarse ante peticiones daninas, en entornos de red teaming controlados.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o narrativa con tematicas adultas o controvertidas que el modelo base rechazaria, con contexto largo de 262.144 tokens para obras extensas.
- Analisis de imagenes sin filtros: al conservar el Vision Encoder, puede describir o procesar imagenes en escenarios donde el modelo base activaria rechazos, por ejemplo datasets de investigacion con contenido sensible.
- Procesamiento de documentos tecnicos y legales extensos: la ventana de 262.144 tokens permite analizar contratos, informes o codebases completos sin truncar, con la ventaja de no rechazar consultas sobre temas delicados.
- Asistente conversacional de dominio especifico: integrable via Transformers, vLLM o SGLang para desplegar un chatbot interno de 4B con bajo coste de inferencia y sin rechazos que interrumpan flujos de soporte tecnico.
- Experimentacion con tecnicas de ablacion en modelos multimodales pequenos: sirve como caso de estudio reproducible para comparar ARA con otras tecnicas de decensurado (abliteracion por direccion, fine-tuning de preferencias).

## Benchmarks y rendimiento

La informacion proporcionada incluye una tabla comparativa del modelo base, pero esta truncada, por lo que solo se dispone de forma completa del valor de MMLU-Pro para algunos modelos de referencia. Se reproduce a continuacion lo disponible.

| Metrica | Modelo | Valor |
|---|---|---|
| Refusals | Qwen3.5-4B-heretic-test-ara | 5/100 |
| Refusals | Qwen/Qwen3.5-4B (original) | 99/100 |
| KL divergence | Qwen3.5-4B-heretic-test-ara | 0.3777 |
| KL divergence | Qwen/Qwen3.5-4B (original) | 0 (por definicion) |
| MMLU-Pro | GPT-OSS-120B | 80.8 |
| MMLU-Pro | GPT-OSS-20B | 74.8 |
| MMLU-Pro | Qwen3-Next-80B-A3B-Thinking | 82.7 |
| MMLU-Pro | Qwen3-30BA3B-Thinking-2507 | no disponible (tabla truncada) |
| MMLU-Pro | Qwen3.5-9B | no disponible (tabla truncada) |
| MMLU-Pro | Qwen3.5-4B | no disponible (tabla truncada) |

No se han publicado en la informacion disponible los resultados completos de benchmarks (MMLU, HumanEval, GSM8K, etc.) del modelo Qwen3.5-4B ni de este ajuste fino. La unica metrica propia aportada por el autor es la tasa de rechazos y la divergencia KL respecto al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 9 GB (coincide con el tamano del repo de 9,1 GB).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,5-5 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2,7-3 GB (requiere convertir a GGUF, ya que el repo solo publica safetensors).
- GPU recomendadas: NVIDIA A100, H100 o L40S para produccion con vLLM/SGLang; RTX 4090, RTX 4080 o RTX 3090 para desarrollo de altas prestaciones.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 (RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070), y en 4 bits en GPUs de 4 GB o mas.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, KTransformers (compatibles declarados en la model card), y llama.cpp / Ollama tras convertir a GGUF.
- Latencia y throughput estimados: no disponible (depende de la GPU, cuantizacion y framework; el modelo base emplea MTP para decodificacion especulativa, lo que puede aumentar el throughput).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-test-ara | 4,54B | 262.144 (ext. 1.010.000) | no disponible | apache-2.0 | Version decensurada con ARA; 5/100 rechazos |
| Qwen/Qwen3.5-4B (base) | 4B | 262.144 (ext. 1.010.000) | no disponible | apache-2.0 | Original multimodal sin ablacion; 99/100 rechazos |
| Qwen3.5-9B | 9B | no disponible | no disponible | apache-2.0 | Hermano mayor de la familia Qwen3.5 |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE) | no disponible | no disponible | apache-2.0 | Mayor capacidad, mucho mas pesado |
| GPT-OSS-20B | 20B | no disponible | 74.8 | no disponible | Alternativa de otro proveedor |

La comparacion de rendimiento queda incompleta porque la tabla de benchmarks de la model card esta truncada. El principal diferencial de este modelo frente al base no es la calidad bruta, sino la eliminacion de rechazos (5/100 vs 99/100) a cambio de una divergencia KL de 0.3777, que puede implicar cierta degradacion en tareas no relacionadas con el rechazo.

## Limitaciones y advertencias

- Modelo decensurado: la ablacion elimina los mecanismos de rechazo, por lo que puede generar contenido danino, ofensivo o ilegal. No es apto para despliegues de cara al publico sin capas adicionales de moderacion.
- Degradacion potencial: la divergencia KL de 0.3777 respecto al modelo base indica un cambio de comportamiento medible; pueden aparecer degradaciones en coherencia, razonamiento o calidad general.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad de este ajuste, por lo que el riesgo de inventar datos es el propio de los modelos de 4B, probablemente agravado por la intervencion sobre los pesos.
- Idiomas: se heredan 201 idiomas del modelo base, pero no se ha evaluado la calidad de este ajuste en cada uno; el rendimiento en idiomas distintos del ingles y el chino puede ser inferior.
- Contexto largo: aunque soporta 262.144 tokens, la atencion efectiva sobre contextos muy largos no ha sido evaluada en este ajuste.
- Licencia: apache-2.0, que permite uso comercial, pero el autor no ofrece garantias sobre el contenido generado; el usuario asume la responsabilidad legal de su uso.
- Caracter experimental: el nombre del repositorio incluye "test", lo que sugiere que no es una version estable ni validada en produccion.
- Sin datos de cuantizacion publicados: no se ofrecen variantes GGUF/AWQ/GPTQ oficiales; cualquier cuantizacion debe generarla el usuario.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/VINAY-UMRETHE/Qwen3.5-4B-heretic-test-ara
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Heretic: https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai

Nota: la busqueda web realizada no ha devuelto enlaces relevantes sobre el modelo (los resultados corresponden a la localidad francesa de Vinay y no guardan relacion con el repositorio). No se dispone de paper, repositorio de codigo ni demo adicionales.
