# Ttimms/zaya1-8b-nvfp4-w4a4-uniform

## Resumen

`zaya1-8b-nvfp4-w4a4-uniform` es una cuantización extrema del modelo base Zyphra/ZAYA1-8B-legacy, un modelo de lenguaje de tipo mixture-of-experts (MoE) con 8.840 millones de parámetros totales. Esta variante comprime todos los 1.320 lineales del modelo a precisión NVFP4 W4A4 (4 bits en pesos y 4 bits en activaciones), sin ninguna exención en BF16, logrando un peso de solo 5,99 GB y un repositorio total de 6,02 GB. Está diseñada específicamente para ejecutarse en tarjetas gráficas Blackwell de consumo con 16 GB de VRAM, como la RTX 5070 Ti, mediante kernels CUTLASS FP4 de tensor core.

La relevancia de este checkpoint radica en su capacidad para servir un MoE de 8B en hardware de consumo con un margen de memoria KV muy amplio (6,83 GiB, equivalente a ~336.000 tokens de contexto en una GPU de 16 GB), a costa de una pérdida medida de precisión de −0,71 puntos porcentuales en HellaSwag frente a la variante mixta que mantiene 384 lineales en BF16. El autor mantiene ambas versiones en paralelo y documenta un problema conocido con la captura de grafos CUDA en hardware SM120 que corrompe la salida, por lo que recomienda servir el modelo con `enforce_eager=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, basada en Zyphra/ZAYA1-8B-legacy |
| Parametros totales | 8.840.488.784 (8,84 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (4-bit pesos y 4-bit activaciones), sin exenciones BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (comprimidos con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Zyphra/ZAYA1-8B-legacy es un transformer MoE, aunque no se dispone de detalles sobre el número de expertos, la dimensión oculta o el mecanismo de enrutamiento en la información proporcionada. Este checkpoint no es un entrenamiento original, sino una cuantización post-entrenamiento realizada con la librería `compressed-tensors` y kernels CUTLASS FP4 para hardware Blackwell. La compresión aplica NVFP4 (formato de punto flotante de 4 bits de NVIDIA) tanto a los pesos como a las activaciones, cubriendo la totalidad de los 1.320 lineales del modelo sin mantener ninguna capa en BF16. El proceso de cuantización no incluye ajuste fino adicional; los valores de precisión se obtienen mediante calibración y empaquetado uniforme de los tensores.

## Capacidades

- Generación de texto conversacional, dado que el modelo base está orientado a tareas de chat y generación de lenguaje natural.
- Inferencia eficiente en hardware Blackwell consumer gracias a la cuantización W4A4, que reduce el uso de memoria y acelera el cómputo con tensor cores FP4.
- Soporte para servir con vLLM, incluyendo modo eager (sin captura de grafos) para evitar corrupción de salida en SM120.
- Batching casi lineal: el escalado de batch-8 alcanza el 96% del rendimiento teórico, lo que indica que el coste por paso de decodificación MoE no crece significativamente con el tamaño de lote.
- Capacidades multilingües: no disponibles en la documentación.
- Tool calling, agentes y razonamiento multi-paso: no confirmados en la información proporcionada.

## Casos de uso

- Inferencia local en GPU de 16 GB: el checkpoint permite ejecutar un MoE de 8B en una RTX 5070 Ti u otra tarjeta Blackwell de 16 GB, con un margen de memoria KV de ~336.000 tokens, ideal para aplicaciones que requieren ventanas de contexto muy largas en un solo dispositivo.
- Servicio de chat con batching en entornos de baja latencia: con `enforce_eager=True` se alcanzan 73,4 tok/s en batch-8, lo que lo hace viable para atender múltiples peticiones concurrentes en un solo GPU consumer.
- Prototipado y experimentación en investigación: al ser Apache 2.0 y ocupar solo 6 GB, es adecuado para entornos de desarrollo donde el espacio en disco y VRAM son limitados.
- Despliegue en edge o estaciones de trabajo sin GPU de datacenter: la cuantización W4A4 reduce los requisitos de memoria a niveles compatibles con hardware de gama media, permitiendo ejecutar modelos de 8B en equipos de sobremesa.
- Evaluación de técnicas de cuantización extrema: este checkpoint sirve como caso de estudio para medir el impacto de la compresión total W4A4 en la precisión, comparándolo con variantes mixtas que conservan capas en BF16.
- Generación de texto con contexto largo en memoria limitada: la reducción del peso a 5,99 GB deja espacio para una caché KV amplia, habilitando tareas como resumen de documentos extensos o análisis de conversaciones largas.

## Benchmarks y rendimiento

El autor publica resultados de HellaSwag comparando este checkpoint uniforme con la variante mixta que mantiene 384 lineales en BF16. No se proporcionan otros benchmarks (MMLU, HumanEval, GSM8K, etc.).

| Benchmark | 6,02 GB uniforme (W4A4 total) | 9,46 GB mixto (W4A4 + BF16) |
|---|---:|---:|
| HellaSwag `acc` (n=10.042) | 45,79% | 46,49% |
| HellaSwag `acc_norm` | 60,65% | 61,34% |

Además, se midió el throughput con vLLM en una RTX 5070 Ti (SM120) usando `enforce_eager=True`:

| Métrica | 6,02 GB uniforme | 9,46 GB mixto |
|---|---:|---:|
| Single-stream, mediana (rango) | 9,52 (9,48–9,84) tok/s | 9,51 (9,45–9,81) tok/s |
| Batch-8, mediana (rango) | 73,4 (72,2–74,9) tok/s | 74,4 (72,8–75,7) tok/s |
| Escalado batch-8 vs batch-1 | 7,71× (96% del ideal) | 7,82× (98% del ideal) |

## Requisitos de hardware

- VRAM estimada: 16 GB son suficientes para cargar el modelo (5,99 GB de pesos) y dejar 6,83 GiB para caché KV, según las mediciones del autor con `--gpu-memory-utilization 0.85`.
- GPU recomendada: RTX 5070 Ti (SM120) u otras GPU Blackwell consumer con 16 GB de VRAM y soporte para tensor cores FP4.
- Compatible con GPU consumer: sí, es el objetivo principal del checkpoint.
- Opciones de despliegue: vLLM (con `enforce_eager=True` obligatorio para evitar corrupción de salida), potencialmente otros frameworks que soporten compressed-tensors y kernels FP4.
- Latencia y throughput: single-stream ~9,5 tok/s, batch-8 ~73,4 tok/s (medidos en RTX 5070 Ti con vLLM y `enforce_eager=True`).
- Advertencia: la captura de grafos CUDA (CUDA graphs) produce salida numéricamente incorrecta en hardware SM120; no usar `--enforce-eager` deshabilitado.

## Comparativa con modelos similares

La comparación directa se establece con la variante mixta del mismo proyecto, que es el punto de referencia más cercano. No se dispone de datos de otros modelos comparables en la información proporcionada.

| Modelo | Pesos (model.safetensors) | Lineales W4A4 | Lineales BF16 | HellaSwag acc_norm | Contexto máximo en 16 GB |
|---|---:|---:|---:|---:|---:|
| zaya1-8b-nvfp4-w4a4-uniform (este) | 5,99 GB | 1.320 | 0 | 60,65% | ~336k tokens |
| zaya1-8b-nvfp4-w4a4 (mixto) | 9,46 GB | 936 | 384 | 61,34% | materialmente menor |

Ambos comparten licencia Apache 2.0 y arquitectura MoE base. La elección depende del equilibrio entre precisión y memoria disponible.

## Limitaciones y advertencias

- Problema crítico con CUDA graphs: en hardware SM120 (RTX 5070 Ti), la captura de grafos CUDA corrompe la salida del modelo, independientemente del backend MoE (FlashInfer, CUTLASS o Marlin). Solo `enforce_eager=True` produce resultados coherentes. Esto limita el uso en entornos que dependen de CUDA graphs para alto rendimiento.
- Pérdida de precisión: la cuantización total W4A4 reduce la precisión en HellaSwag en −0,71 pp frente a la variante mixta. No se han evaluado otros benchmarks, por lo que el impacto en tareas como razonamiento o código es desconocido.
- Rendimiento single-stream modesto: ~9,5 tok/s en RTX 5070 Ti, significativamente inferior a lo que reporta un PR externo de llama.cpp (45,9 tok/s en RTX 4070 Ti con Q4_K_M), aunque no se ha podido reproducir en este hardware.
- Sin datos de idiomas: no se especifican los idiomas soportados, por lo que el comportamiento multilingüe no está garantizado.
- Dependencia de hardware específico: los kernels FP4 requieren GPUs Blackwell (SM120); no funcionará en arquitecturas anteriores (Ampere, Ada, etc.).
- Sin garantías de producción: el autor documenta problemas no resueltos con la captura de grafos y un fallo no determinista al intentar reproducir el rendimiento de llama.cpp; se recomienda validación exhaustiva antes de usar en entornos críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ttimms/zaya1-8b-nvfp4-w4a4-uniform
- Variante mixta (9,46 GB): https://huggingface.co/Ttimms/zaya1-8b-nvfp4-w4a4
- Repositorio GitHub del proyecto: https://github.com/t-timms/zaya1-godspeed
- Artículo arXiv sobre drift de corrección en serving LLM: https://arxiv.org/abs/2605.19537
- Issue CUTLASS #3096: https://github.com/NVIDIA/cutlass/issues/3096
- Issue FlashInfer #2776: https://github.com/flashinfer-ai/flashinfer/issues/2776
