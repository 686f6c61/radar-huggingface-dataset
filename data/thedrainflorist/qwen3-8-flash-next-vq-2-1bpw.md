# TheDrainFlorist/Qwen3.8-Flash-Next-VQ-2.1bpw

## Resumen

TheDrainFlorist/Qwen3.8-Flash-Next-VQ-2.1bpw es una cuantizacion vectorial (VQ) del modelo multimodal Qwen3.8-Flash-Next, desarrollado por el usuario TheDrainFlorist. Este checkpoint reduce el peso del modelo original (aproximadamente 335 GiB en bf16) a 45 GiB, permitiendo su ejecucion en equipos Apple Silicon con 64 GB de memoria unificada usando la libreria MLX sin parches adicionales. El modelo base es un MoE ultra-sparse de 125B parametros (incluyendo una tabla n-gram de 51B) con 6B activos por token, basado en la arquitectura Qwen4 que combina Gated DeltaNet y Qwen Sparse Attention.

La cuantizacion se realiza sin datos (data-free), mediante k-means sobre los pesos, e incorpora una "mezcla de leverage" que actualiza selectivamente las capas mas sensibles (capas 0-1 y banda 31-39) para minimizar la perdida de calidad. Los resultados medidos muestran una KL de 390.1 mnats/tok frente al teacher bf16, con un acuerdo top-1 del 78.8% y una perplejidad de 5.903, acercandose al rendimiento del modelo original en tareas de generacion de texto. Este modelo esta pensado para desarrolladores que necesitan ejecutar un frontier MoE en hardware de consumo sin comprometer demasiado la fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con GDN + QSA (Qwen4) |
| Parametros totales | 125B (modelo base, incluye 51B de tabla n-gram) |
| Parametros activos | 6B por token (modelo base) |
| Longitud de contexto | 262.144 tokens (modelo base) |
| Tipos de cuantizacion | VQ 2.1bpw (vector quantization, 14-bit codes para MoE, 8-bit para n-gram) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors, MLX (con runtime embebido en model.py) |

Nota: el checkpoint cuantizado contiene 21.062.769.043 parametros almacenados, pero el modelo base tiene 125B parametros. La model card del autor menciona 180B totales, discrepancia que no se ha podido resolver con las fuentes disponibles.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura hibrida: tres de cada cuatro capas usan Gated DeltaNet (GDN) para comprimir historial de forma eficiente, mientras que la cuarta capa usa Qwen Sparse Attention (QSA) para recuperacion precisa de contexto largo. Ademas, incorpora una tabla n-gram PLE (Probabilistic Language Embedding) de 51B parametros que mejora la modelizacion de patrones locales. La cuantizacion VQ aplicada por TheDrainFlorist reemplaza los pesos densos por codigos vectoriales (d=8, K=16384 para expertos MoE; d=8, K=256 para tablas n-gram), con una estrategia de "leverage mix" que asigna mayor precision a las capas mas daninas (capas 0-1 y 31-39). El proceso es data-free, basado en k-means/Lloyd sobre los pesos del teacher bf16, con semilla 1234. No se ha realizado entrenamiento adicional; es una conversion puramente de compresion.

## Capacidades

- Generacion de texto y conversacion en ingles, con razonamiento avanzado gracias a la arquitectura MoE de alta capacidad.
- Soporte multimodal (vision): el checkpoint incluye un vision tower bf16 de 0.84 GiB (333 tensores) y el config lleva vision_config + image_token_id, permitiendo tareas de imagen a texto.
- Procesamiento de contexto largo: 262K tokens de ventana, util para documentos extensos o conversaciones multi-turno.
- Compresion eficiente de historial mediante Gated DeltaNet, lo que reduce el costo computacional en inferencia.
- Compatible con MLX y exo (config listo para exo-ready), permitiendo integracion en entornos de Apple Silicon sin parches.
- No se ha confirmado soporte explicito de tool calling o function calling en la informacion disponible.

## Casos de uso

- Inferencia local en Mac con 64 GB de RAM unificada: el modelo de 45 GiB cabe en memoria unificada de equipos como Mac Studio o MacBook Pro de gama alta, permitiendo ejecutar un frontier MoE sin GPU dedicada.
- Prototipado rapido de aplicaciones de chat o generacion de texto en entornos Apple: gracias al runtime MLX embebido, se puede cargar y ejecutar el modelo directamente con `mlx-lm` sin configuraciones adicionales.
- Procesamiento de documentos largos con contexto de 262K tokens: ideal para resumir libros, analisis de contratos o busqueda en bases de conocimiento extensas.
- Tareas multimodales de vision-lenguaje en local: el vision tower bf16 permite capturar imagenes y generar descripciones o responder preguntas sobre ellas, aunque el modelo esta optimizado para texto.
- Evaluacion de tecnicas de cuantizacion vectorial: investigadores pueden comparar el rendimiento de VQ frente a cuantizacion afin (q3, q4, etc.) usando las metricas KL y perplejidad publicadas.
- Despliegue en edge computing con Apple Silicon: al no requerir GPU VRAM, es viable en dispositivos con memoria unificada para aplicaciones de IA generativa en entornos sin conexion.

## Benchmarks y rendimiento

La model card del autor proporciona mediciones frente al teacher bf16 (modelo original), evaluadas con 2048 tokens de prosa. Los resultados son:

| Build | Tamano | KL a bf16 (mnats/tok) | Acuerdo top-1 | Perplejidad |
|---|---|---|---|---|
| affine q3 (del autor) | 75 GiB | 1083.4 | 61.9% | 12.850 |
| **Este modelo (VQ 2.1bpw)** | **45 GiB** | **390.1** | **78.8%** | **5.903** |
| affine q4 (del autor) | 96 GiB | 293.9 | 79.6% | 6.453 |
| affine q5 (del autor) | 116 GiB | 91.7 | 87.5% | 5.243 |
| affine q6 (del autor) | 137 GiB | 52.8 | 91.6% | 4.916 |
| affine q8 (del autor) | 178 GiB | 27.1 | 94.9% | 5.197 |
| bf16 teacher | 335 GiB | 0 | 100% | 5.166 |

Ademas, se reportan perplejidades en otros corpus: codigo 2.076 (frente a 1.902 del teacher) y literario 8.945 (frente a 7.664). El autor recomienda clasificar por KL, no por perplejidad, ya que esta ultima puede enmascarar errores compensados. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- Tamano del checkpoint: 45 GiB (incluye vision tower de 0.84 GiB). Se necesita al menos 64 GB de memoria unificada en Apple Silicon para cargarlo y ejecutarlo con comodidad.
- GPU: no requiere GPU dedicada; funciona en CPU/GPU unificada de Apple (M-series) via MLX. Equipos con 64 GB de RAM unificada (por ejemplo, Mac Studio M2 Ultra, MacBook Pro M3 Max) son adecuados.
- Alternativas: si se dispone de GPU NVIDIA, el modelo base original (bf16) requiere 335 GiB, lo cual no es viable en consumer GPU; este cuantizado no esta disenado para CUDA.
- Opciones de despliegue: `mlx-lm` (stock), exo, y cualquier runtime que soporte MLX. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que el runtime VQ va embebido en el checkpoint.
- Latencia y throughput: no se han publicado datos de velocidad. Dado que es un MoE con 6B activos, se espera una latencia razonable en hardware Apple Silicon, pero no hay cifras concretas.

## Comparativa con modelos similares

Este modelo se compara principalmente con otras cuantizaciones del mismo modelo base (afines) y con el teacher bf16. No se dispone de comparativas con otros modelos de la misma categoria (por ejemplo, otros MoE cuantizados como Mixtral o Qwen3-MoE) en la informacion proporcionada.

| Modelo | Tamano | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (bf16) | 335 GiB | 6B | 262K | qwen-community-1.0 | safetensors (bf16) |
| Este modelo (VQ 2.1bpw) | 45 GiB | 6B | 262K | qwen-community-1.0 | safetensors (MLX, VQ) |
| Qwen3.8-Flash-Next (affine q4, del autor) | 96 GiB | 6B | 262K | qwen-community-1.0 | safetensors (MLX, affine) |

La principal ventaja de este modelo es su tamano reducido (45 GiB) con una KL de 390.1, que supera al affine q3 (75 GiB, KL 1083.4) y se acerca al affine q4 (96 GiB, KL 293.9) a mitad de tamano. La licencia comunitaria de Qwen permite uso comercial con restricciones (ver limitaciones).

## Limitaciones y advertencias

- Perdida de fidelidad: la cuantizacion VQ introduce una desviacion de 390.1 mnats/tok en KL frente al teacher bf16, lo que puede manifestarse en errores sutiles de razonamiento o generacion en comparacion con el modelo original.
- Sesgos del modelo base: Qwen3.8-Flash-Next puede heredar sesgos de los datos de entrenamiento; no se ha realizado alineamiento adicional en esta conversion.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inconsistente, especialmente en contextos largos o temas especializados.
- Idioma: la model card declara solo ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Restricciones de licencia: la licencia qwen-community-1.0 permite uso comercial, pero impone condiciones (por ejemplo, no usar para servicios que compitan con Qwen, mantener avisos de copyright). Se recomienda revisar el texto completo de la licencia.
- Limitaciones de hardware: requiere 64 GB de memoria unificada; no es utilizable en GPUs NVIDIA o AMD convencionales sin adaptacion.
- Sin soporte oficial: es un modelo creado por un tercero, no por Qwen; no hay garantia de mantenimiento o compatibilidad futura con nuevas versiones de MLX.
- La discrepancia en el numero de parametros (125B vs 180B segun la fuente) no esta resuelta; los usuarios deben verificar la configuracion real antes de desplegar en produccion.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/TheDrainFlorist/Qwen3.8-Flash-Next-VQ-2.1bpw
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guia de ejecucion local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Herramienta VQLab usada para la cuantizacion: https://github.com/noahzelezny/VQLab
