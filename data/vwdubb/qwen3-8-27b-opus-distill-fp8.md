# vwdubb/Qwen3.8-27B-Opus-Distill-FP8

## Resumen

Qwen3.8-27B-Opus-Distill-FP8 es una cuantización en precisión FP8 del modelo Qwen3.8-27B-Opus-Distill, un fine-tune mediante LoRA del modelo denso Qwen/Qwen3.8-27B sobre trazas de razonamiento generadas por Claude Opus. El objetivo declarado del fine-tune es mejorar las capacidades de razonamiento sin degradar el conocimiento general ni el modelado del lenguaje, y la versión FP8 busca reducir los requisitos de memoria y acelerar la inferencia manteniendo las capacidades del modelo original.

El modelo conserva intactas la torre de visión nativa y la cabeza MTP (Multi-Token Prediction) del checkpoint base, lo que lo convierte en un modelo multimodal completo con decodificación especulativa. Con 27.781.427.952 parámetros (27,78 mil millones), es un modelo denso de gran tamaño que, en FP8, ocupa aproximadamente 28 GB de pesos, lo que permite su despliegue en GPUs de 40 GB o superiores. La licencia Apache-2.0 facilita su uso comercial y de investigación.

La relevancia actual de este modelo radica en que aborda un problema común en la destilación de razonamiento: mejorar la capacidad de razonamiento paso a paso sin sacrificar otras habilidades. Los benchmarks publicados muestran una mejora significativa en GPQA-Diamond (+26 puntos en modo loglikelihood con thinking desactivado) y ARC-Challenge (+4,2 puntos), mientras que MMLU y wikitext permanecen estables. La cuantización FP8, realizada con la librería compressed-tensors, lo hace más accesible para entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con visión nativa y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no se especifica en la información proporcionada) |
| Tipos de cuantizacion | FP8 (compressed-tensors) |
| Idiomas soportados | No disponible (no se indica en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer denso de 27,78 mil millones de parámetros con arquitectura híbrida: 16 capas de atención completa (full-attention) y 48 capas con proyecciones Gated-DeltaNet (atención lineal). Incluye una torre de visión nativa para procesamiento de imágenes y una cabeza MTP para decodificación especulativa. El fine-tune LoRA se aplicó únicamente a las proyecciones de atención (q/k/v/o) de las 16 capas full-attention y a las proyecciones FFN (gate/up/down) de las 64 capas, dejando intactas las proyecciones de atención lineal.

El entrenamiento se realizó sobre el dataset `barozp/opus-reasoning-distill-train` (14.250 ejemplos) con validación de 750 ejemplos, durante 1 época (891 pasos), con tasa de aprendizaje 1e-4 en coseno con 3% de warmup, batch efectivo de 16, secuencia máxima de 4096 tokens y precisión bf16. La pérdida final de validación fue 0,4647. La cuantización FP8 se aplicó posteriormente al modelo fusionado, presumiblemente mediante la librería compressed-tensors (según los tags del repositorio), aunque no se detalla el método exacto de calibración ni el impacto en precisión.

## Capacidades

- Razonamiento mejorado: el fine-tune incrementa notablemente la capacidad de razonamiento "reflejo" (sin deliberación explícita), como muestra la mejora de +26 puntos en GPQA-Diamond en modo loglikelihood con thinking desactivado.
- Generación de texto y modelado del lenguaje: el conocimiento general (MMLU) y la perplejidad en wikitext se mantienen estables respecto al modelo base.
- Visión nativa: al conservar la torre de visión del checkpoint base, el modelo puede procesar entradas de imagen y texto (pipeline `image-text-to-text`).
- Decodificación especulativa: la cabeza MTP se mantiene intacta, permitiendo autodecodificación especulativa para reducir la latencia de generación.
- Conversación multimodal: soporta interacción conversacional con entrada de imágenes y texto.
- Compatibilidad con transformers: se puede cargar con `AutoModelForImageTextToText` o `AutoModelForCausalLM` (en este último caso, la visión se ignora).

## Casos de uso

- Razonamiento científico y técnico: el modelo puede resolver problemas complejos de física, química o biología de nivel avanzado (GPQA-Diamond) sin necesidad de activar un modo de pensamiento explícito, lo que lo hace útil en asistentes de investigación o tutoría académica.
- Análisis de documentos con imágenes: gracias a su torre de visión, puede procesar capturas de pantalla, diagramas o gráficos junto con texto, por ejemplo para extraer información de informes técnicos o artículos científicos.
- Asistente conversacional multimodal: integrable en chatbots que necesiten comprender imágenes y mantener conversaciones de múltiples turnos, aprovechando su capacidad de razonamiento mejorado para respuestas más precisas.
- Inferencia de baja latencia con decodificación especulativa: la cabeza MTP permite autodecodificación especulativa, reduciendo el tiempo de generación en entornos de producción donde la latencia es crítica, como APIs de chat o agentes en tiempo real.
- Investigación en destilación de razonamiento: el modelo sirve como referencia para estudiar cómo la destilación de trazas de razonamiento de modelos propietarios (Claude Opus) afecta a modelos abiertos, y para comparar protocolos de evaluación (loglikelihood vs. generación).
- Despliegue en entornos con VRAM limitada: al estar cuantizado en FP8, ocupa aproximadamente 28 GB de pesos, lo que permite ejecutarlo en GPUs de 40 GB (A100, A6000) o incluso en configuraciones con 32 GB si se gestiona bien la memoria de activaciones.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo base (barozp/Qwen3.8-27B-Opus-Distill) antes de la cuantización FP8, medidos con `lm-evaluation-harness` en modo 0-shot, loglikelihood (opción múltiple), sin plantilla de chat y con límite de 500 muestras por tarea. La columna Δ compara el modelo destilado con el Qwen3.8-27B original bajo el mismo protocolo.

| Tarea | Métrica | Base | Distill | Δ |
|---|---|---|---|---|
| wikitext | perplejidad (↓) | 8.434 | 8.344 | −0.09 |
| mmlu | acc | 0.849 | 0.849 | −0.001 |
| hellaswag | acc_norm | 0.742 | 0.740 | −0.002 |
| arc_challenge | acc_norm | 0.588 | 0.630 | +0.042 |
| gpqa_diamond | acc_norm | 0.232 | 0.495 | +0.263 |

Advertencias importantes: el valor de GPQA (0.495) no es comparable con el 89.2 publicado por Qwen, ya que este se mide con thinking activado y otro harness. Aquí se mide en loglikelihood con thinking desactivado, donde el modelo base puntúa cerca del azar (25%). La mejora de +26 puntos es una comparación válida entre base y destilado bajo el mismo protocolo. ARC-Challenge está saturado para modelos modernos, y los valores pequeños (±0.01) en hellaswag y arc_challenge pueden ser ruido debido al límite de 500 muestras. No se han publicado benchmarks específicos para la versión FP8.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 ocupan aproximadamente 27,78 GB (27,78B × 1 byte). Con memoria para activaciones y KV cache, se recomienda al menos 32-40 GB de VRAM para contexto moderado. En bf16, el modelo ocuparía ~55,6 GB, por lo que la cuantización FP8 reduce a la mitad el requisito de memoria.
- GPUs recomendadas: A100 40GB, A100 80GB, H100, RTX A6000 48GB. Una RTX 4090 (24 GB) no es suficiente para el modelo completo en FP8 sin cuantización adicional o gestión de memoria externa.
- Opciones de despliegue: compatible con transformers (carga directa), vLLM (soporta compressed-tensors), TGI y entornos de endpoints compatibles (tag `endpoints_compatible`). También puede usarse con llama.cpp si se convierte a GGUF, aunque no se proporciona una versión GGUF en este repositorio.
- Latencia y throughput: no se han publicado datos específicos. La presencia de MTP sugiere que la decodificación especulativa puede mejorar la latencia, pero no hay cifras concretas.

## Comparativa con modelos similares

La información disponible solo permite comparar el modelo destilado con su base (Qwen3.8-27B) y con el modelo original de Qwen. No se proporcionan datos de otros modelos de razonamiento destilado (p. ej., DeepSeek-R1-Distill) en la documentación.

| Modelo | Parámetros | Contexto | GPQA (loglikelihood, thinking off) | MMLU | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,78B | No disponible | 0.232 | 0.849 | Apache-2.0 |
| Qwen3.8-27B-Opus-Distill | 27,78B | No disponible | 0.495 | 0.849 | Apache-2.0 |
| Qwen3.8-27B-Opus-Distill-FP8 | 27,78B | No disponible | No medido | No medido | Apache-2.0 |

La versión FP8 es funcionalmente idéntica al modelo destilado en bf16, con la diferencia de la cuantización. No se dispone de comparaciones con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks publicados corresponden al modelo en bf16, no a la versión FP8. La cuantización FP8 puede introducir una degradación de precisión no cuantificada en esta documentación.
- El valor de GPQA (0.495) no es comparable con el 89.2 de Qwen, ya que se mide con un protocolo diferente (loglikelihood, thinking off). No debe interpretarse como una puntuación absoluta de razonamiento.
- ARC-Challenge está saturado para modelos modernos; la mejora de +4,2 puntos es real pero no es un indicador de vanguardia.
- El límite de 500 muestras en la evaluación introduce ruido en tareas como hellaswag y arc_challenge; los valores pequeños (±0.01) deben tratarse como ruido.
- No se especifican sesgos conocidos, limitaciones de idioma ni riesgos de alucinación en la model card. Como modelo de lenguaje grande, es susceptible de generar contenido incorrecto o sesgado, especialmente en dominios no cubiertos por los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el modelo base (Qwen3.8-27B) también está bajo Apache-2.0, por lo que no hay conflictos de licencia conocidos.
- El contexto máximo de inferencia no está documentado; el entrenamiento usó secuencias de 4096 tokens, pero el modelo base podría soportar contextos más largos. Se recomienda verificar la documentación de Qwen3.8-27B antes de desplegarlo con contextos extensos.

## Enlaces

- Repositorio HuggingFace del modelo FP8: https://huggingface.co/vwdubb/Qwen3.8-27B-Opus-Distill-FP8
- Modelo base (barozp/Qwen3.8-27B-Opus-Distill): https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/barozp/opus-reasoning-distill-train
- Dataset de validación: https://huggingface.co/datasets/barozp/opus-reasoning-distill-validation
- Adapter LoRA (privado): https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-LoRA-Adapter
