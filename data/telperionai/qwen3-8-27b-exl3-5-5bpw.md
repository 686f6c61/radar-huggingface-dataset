# TelperionAI/Qwen3.8-27B-EXL3-5.5bpw

## Resumen

TelperionAI/Qwen3.8-27B-EXL3-5.5bpw es una cuantización de alta fidelidad del modelo Qwen/Qwen3.8-27B, desarrollada por TelperionAI. Utiliza la técnica Trellis quantization (EXL3, una variante de QTIP) a 5,5 bits por peso, con un pre-paso de suavizado AWQ aplicado a los pesos BF16 originales. El resultado es un checkpoint de 20,0 GB que conserva una fidelidad muy alta respecto al modelo base, con una tasa de desacuerdo "confidente" de solo 1,34% frente al BF16.

Esta cuantización está pensada para entornos donde se prioriza la calidad de salida sobre el tamaño, y se posiciona como el "punto de inflexión" (knee of the curve) en la serie de bitrates de TelperionAI: por encima de 5,5 bpw, los bits adicionales compran un orden de magnitud menos de mejora por bit. Requiere el runtime exllamav3 (o TabbyAPI) y no es compatible con vLLM, lo que limita su despliegue a entornos específicos.

El modelo base, Qwen3.8-27B, es un modelo multimodal denso de Alibaba que destaca en tareas de código, flujos de trabajo agénticos y automatización de oficina. Esta cuantización hereda esas capacidades, aunque la información disponible no detalla las especificaciones completas del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3.8-27B, descrito como multimodal denso por Alibaba) |
| Parametros totales | 10.709.923.056 (dato real de safetensors; el nombre sugiere 27B, pero el checkpoint cuantizado contiene ~10,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3 5,5 bpw (Trellis/QTIP) con AWQ smoothing pre-pass; lm_head a 6 bpw; capas MTP cuantizadas inline |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Esta ficha describe una cuantización, no un modelo entrenado desde cero. El proceso de conversión consta de dos pasos:

1. **AWQ smoothing** sobre los pesos BF16 del modelo base. Es una transformación pura que preserva la función (fold `1/s` en la norma precedente y `s` en la dimensión de entrada del siguiente linear), calibrada con 256 secuencias. Se verifica que la relación con los pesos originales es un escalado separable por fila × columna.
2. **Conversión EXL3** a 5,5 bpw sobre los pesos suavizados. EXL3 es una variante de Trellis quantization (QTIP) implementada en exllamav3.

El autor destaca que AWQ apila correctamente porque deja un checkpoint BF16 ordinario, mientras que GPTQ y AutoRound no apilan, ya que su compensación de error está ligada a decisiones de redondeo específicas que EXL3 descarta.

El modelo base Qwen3.8-27B es un desarrollo de Alibaba, pero no se dispone de detalles sobre su arquitectura interna, datos de entrenamiento o proceso de alineación en la información proporcionada.

## Capacidades

- Al ser una cuantización, las capacidades funcionales son las del modelo base Qwen3.8-27B, que según la descripción de Alibaba es un modelo multimodal nativo que destaca en coding, flujos de trabajo agénticos y automatización de oficina.
- La cuantización EXL3 a 5,5 bpw está diseñada para minimizar la pérdida de fidelidad: la tasa de desacuerdo "confidente" (margen top1−top2 entre 2 y 5) es de solo 1,34% frente al BF16, y la tasa "cierta" (margen >5) es de 0,16%.
- No se dispone de información específica sobre soporte de tool calling, function calling, razonamiento multi-paso o capacidades multilingües en la documentación de esta cuantización.
- El modelo requiere exllamav3 o TabbyAPI para su ejecución; no es servible con vLLM.

## Casos de uso

- **Despliegue local en estación de trabajo**: con un tamaño de 20,0 GB, cabe en una GPU de 24 GB (p. ej., RTX 3090, RTX 4090, A5000). Es adecuado para entornos de desarrollo donde se necesita una inferencia de alta calidad sin depender de la nube.
- **Servidor de API local con TabbyAPI**: al ser compatible con TabbyAPI, puede integrarse en una infraestructura de API privada para aplicaciones internas, manteniendo la fidelidad del modelo base.
- **Generación de código asistida**: el modelo base Qwen3.8-27B está optimizado para tareas de programación; esta cuantización permite ejecutarlo localmente con una pérdida mínima de calidad, útil para autocompletado o revisión de código.
- **Automatización de oficina**: el modelo base destaca en tareas de ofimática (generación de documentos, resúmenes, correos). La cuantización a 5,5 bpw conserva la capacidad de manejar estas tareas con alta coherencia.
- **Flujos de trabajo agénticos**: el modelo base soporta razonamiento agéntico; esta versión cuantizada puede usarse en pipelines de agentes que requieran respuestas de alta calidad con recursos limitados.
- **Investigación en cuantización**: el checkpoint sirve como referencia para estudiar el impacto de la cuantización Trellis con AWQ smoothing, ya que el autor publica métricas detalladas de desacuerdo frente al BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. En su lugar, el autor proporciona una tabla de **calidad medida** basada en tasas de desacuerdo contra el modelo BF16 original, sobre 231 documentos y 142.727 posiciones de token puntuadas. Las columnas representan el porcentaje de posiciones donde la cuantización difiere del base, segmentadas por el margen de confianza del modelo base (top1−top2).

| build | bits/wt | tamaño | top-1 ↑ | near-tie ↓ | moderate ↓ | confident ↓ | certain ↓ | divmed ↑ | tok/s |
|---|---|---|---|---|---|---|---|---|---|
| TelperionAI INT4-AWQ-GPTQ (vLLM) | 4,63 | 25,1 GB | 96,30% | 22,29% | 3,52% | 0,93% | 0,09% | 48 | 4617 |
| EXL3 6,5 bpw | 6,50 | 23,0 GB | 97,10% | 17,03% | 2,41% | 1,23% | 0,15% | 59 | 492* |
| **Este modelo — EXL3 5,5 bpw** | 5,50 | 20,0 GB | 96,12% | 22,81% | 3,52% | 1,34% | 0,16% | 55 | 516* |
| Qwen FP8 (referencia, vLLM) | 8,00 | ~30 GB | 96,15% | 22,70% | 3,48% | 1,45% | 0,08% | 47 | 8711 |
| TelperionAI NVFP4 (vLLM) | 4,50 | 24,7 GB | 93,62% | 32,25% | 8,59% | 1,85% | 0,16% | 29 | 10521 |
| EXL3 4,0 bpw | 4,00 | 16,0 GB | 93,82% | 31,66% | 6,94% | 2,40% | 0,58% | 28 | 570* |
| EXL3 4,0 bpw, sin AWQ | 4,00 | 16,0 GB | 93,17% | 34,05% | 8,41% | 3,08% | 0,16% | 27 | 561* |

\* El throughput de EXL3 es single-stream argmax en una GPU vía exllamav3, no comparable con las cifras de vLLM (que usan batching). No se especifica la GPU utilizada.

**Interpretación**: solo las columnas `confident` y `certain` indican daño real. Este modelo presenta 1,34% de desacuerdo "confidente" y 0,16% "cierto", valores muy bajos. El autor señala que la INT4-AWQ-GPTQ (0,93% confident, 0,09% certain) es aún más fiel en esas métricas, aunque ocupa 5,1 GB más.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint pesa 20,0 GB, por lo que se recomienda al menos 24 GB de VRAM para inferencia con overhead de runtime.
- **GPU recomendadas**: RTX 3090, RTX 4090, A5000, A6000, o cualquier GPU con 24 GB o más. No se especifica la GPU usada para las mediciones de throughput.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de gama alta para consumidores (24 GB).
- **Opciones de despliegue**: exllamav3 (obligatorio) o TabbyAPI. No compatible con vLLM, TGI, llama.cpp u Ollama.
- **Latencia y throughput**: 516 tok/s en modo single-stream argmax (sin batching, no optimizado). No se dispone de cifras con batching.

## Comparativa con modelos similares

La comparativa más relevante es contra otras cuantizaciones del mismo modelo base (Qwen3.8-27B), ya que no se dispone de datos de otros modelos de la misma categoría.

| Modelo | bits/wt | tamaño | confident ↓ | certain ↓ | runtime |
|---|---|---|---|---|---|
| **EXL3 5,5 bpw (este)** | 5,50 | 20,0 GB | 1,34% | 0,16% | exllamav3 |
| INT4-AWQ-GPTQ (TelperionAI) | 4,63 | 25,1 GB | 0,93% | 0,09% | vLLM |
| NVFP4 (TelperionAI) | 4,50 | 24,7 GB | 1,85% | 0,16% | vLLM |
| FP8 (Qwen, referencia) | 8,00 | ~30 GB | 1,45% | 0,08% | vLLM |

El modelo EXL3 5,5 bpw supera a NVFP4 en fidelidad (1,34% vs 1,85% confident) con menor tamaño (20,0 GB vs 24,7 GB). Sin embargo, la INT4-AWQ-GPTQ es más fiel en las métricas críticas (0,93% confident) y además es servible con vLLM, lo que la hace más versátil para producción. La FP8 de referencia tiene peor confident (1,45%) pero mejor certain (0,08%) y un throughput mucho mayor en vLLM.

## Limitaciones y advertencias

- **Runtime restringido**: EXL3 solo puede servirse con exllamav3 o TabbyAPI. No es compatible con vLLM, TGI, llama.cpp ni Ollama, lo que limita su integración en infraestructuras estándar.
- **Pérdida de fidelidad**: aunque baja, existe una tasa de desacuerdo del 1,34% en posiciones "confidentes" y 0,16% en "ciertas" frente al BF16. Para aplicaciones donde cada token importa (p. ej., generación de código crítico), puede ser relevante.
- **Información incompleta**: no se dispone de datos sobre sesgos, alucinaciones, idiomas soportados ni longitud de contexto. El número de parámetros real (10,7B) difiere del nombre del modelo (27B), lo que sugiere que el checkpoint cuantizado podría tener una arquitectura distinta a la esperada.
- **Licencia**: Apache-2.0 permite uso comercial sin restricciones adicionales, pero se debe verificar la licencia del modelo base (Qwen3.8-27B) para cumplir con sus términos.
- **Sin soporte de batching**: el throughput medido es single-stream; en entornos de producción con alta concurrencia, el rendimiento podría ser insuficiente comparado con alternativas vLLM.

## Enlaces

- [HuggingFace — TelperionAI/Qwen3.8-27B-EXL3-5.5bpw](https://huggingface.co/TelperionAI/Qwen3.8-27B-EXL3-5.5bpw)
- [HuggingFace — Qwen/Qwen3.8-27B (modelo base)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GitHub — QwenLM/Qwen3.8 (serie de modelos)](https://github.com/QwenLM/Qwen3.8)
- [GitHub — exllamav3 (runtime requerido)](https://github.com/turboderp-org/exllamav3)
- [HuggingFace — TelperionAI/Qwen3.8-27B-INT4-AWQ-GPTQ (variante alternativa)](https://huggingface.co/TelperionAI/Qwen3.8-27B-INT4-AWQ-GPTQ)
