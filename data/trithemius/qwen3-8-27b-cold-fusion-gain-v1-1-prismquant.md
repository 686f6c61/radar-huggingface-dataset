# trithemius/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-PrismQuant

## Resumen

Este modelo es una exportación PrismaQuant del checkpoint `DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1`, un merge y fine-tuning de DavidAU construido sobre `Qwen/Qwen3.8-27B` mediante el método GAIN (Gradient-Aware Iterative Normalization) y la infraestructura de Unsloth. El resultado es un modelo denso de 27 000 millones de parámetros declarados (aunque los pesos safetensors ocupan 19 034 583 792 parámetros) con encoder de visión, contexto nativo de 262 144 tokens y capacidades de razonamiento, escritura creativa y roleplaying.

La contribución de `trithemius` es la cuantización de precisión mixta mediante el asignador AURA, que reparte cada capa lineal entre formatos NVFP4, FP8_E4M3 y BF16 según un presupuesto de 5,5 bits por parámetro cuantizable, minimizando la pérdida KL-Fisher. Esto permite servir el modelo en vLLM sobre GPUs NVIDIA Blackwell con decodificación especulativa MTP incluida, manteniendo la torre de visión en BF16. Es relevante porque ofrece un punto de operación óptimo entre tamaño, velocidad y fidelidad para despliegues en producción sobre hardware moderno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (transformer denso con vision encoder, 64 capas ocultas) |
| Parametros totales | 19 034 583 792 (segun safetensors; el modelo base declara 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (nativo) |
| Tipos de cuantizacion | NVFP4, FP8_E4M3, BF16 (mezcla por capa, 5,5 bits promedio) |
| Idiomas soportados | No disponible (hereda los de Qwen3.8, no especificados en la ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un merge de Qwen3.8-27B que combina pesos de razonamiento, escritura creativa y roleplaying mediante el método GAIN, entrenado con la infraestructura de Unsloth. La metodología COLD FUSION reduce los tokens de pensamiento a entre 1/10 y 1/2 de los modelos Qwen estándar, manteniendo el 99 % del rendimiento en BF16 tanto a 8 como a 4 bits según su autor.

La capa de cuantización PrismAura no entrena ni modifica los pesos: aplica un asignador AURA que evalúa el efecto de segundo orden de cada capa lineal sobre la distribución de salida usando KL-Fisher, y resuelve un problema de mochila de opción múltiple sobre el menú de formatos {NVFP4, FP8_E4M3, BF16}. El punto de operación elegido (5,5 bits) corresponde a la rodilla de la curva tasa-distorsión, con una pérdida estimada de 0,00839. Los tensores MTP (8 lineales) y la torre de visión (110 lineales) se mantienen en BF16 como paso directo para permitir decodificación especulativa y preservar la calidad visual.

## Capacidades

- Generacion de texto, razonamiento y matematicas, heredadas del modelo base Qwen3.8-27B.
- Soporte de tool calling y function calling, habilitado via vLLM con `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Capacidades de agente y razonamiento multi-paso, con parser de razonamiento `qwen3`.
- Vision: incluye encoder de vision en BF16, permitiendo entradas de imagen ademas de texto.
- Decodificacion especulativa MTP (multi-token prediction) con 2 tokens especulativos, integrada en vLLM.
- Escritura creativa y roleplaying, optimizadas en el merge GAIN del modelo base.
- Multilingue: no se detalla en la ficha, pero Qwen3.8 soporta multiples idiomas.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 262 144 tokens, manteniendo coherencia en historiales extensos y usando tool calling para consultar bases de conocimiento.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests, con decodificacion especulativa que reduce la latencia en entornos de alto trafico.
- Roleplaying y escritura creativa: el merge GAIN esta especificamente afinado para estos dominios, produciendo narrativas coherentes y personajes consistentes en sesiones largas.
- Analisis de imagenes con texto: al incluir el encoder de vision, puede describir o razonar sobre imagenes en tareas de documentacion visual o asistencia multimodal.
- Agentes autonomos: con soporte de razonamiento y tool calling, puede orquestar flujos multi-paso como busqueda web, calculos o interacciones con APIs, ejecutandose en vLLM con `--enable-auto-tool-choice`.
- Servicio de modelos en GPU Blackwell: la cuantizacion NVFP4/FP8/BF16 reduce el uso de VRAM y acelera la inferencia, adecuado para despliegues de alto rendimiento con vLLM y cache de prefijo habilitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta cuantizacion especifica en la informacion disponible. El modelo base afirma mantener el 99 % del rendimiento BF16 a 8 y 4 bits, pero sin cifras concretas. La model card incluye una tabla de perdida estimada KL-Fisher segun el presupuesto de bits, con el punto elegido de 5,5 bits mostrando una delta de perdida de 0,00839, pero no es un benchmark comparativo con otros modelos.

## Requisitos de hardware

- GPU NVIDIA Blackwell (B200, RTX 50 series) para ejecucion nativa de NVFP4; en otras GPUs vLLM cae a ejecucion des-cuantizada.
- Tamano del repositorio: 23,6 GB; la VRAM estimada para inferencia ronda los 13-16 GB con cuantizacion mixta (19B parametros a 5,5 bits mas overhead de activaciones y cache KV), aunque no se proporciona un valor exacto.
- GPU recomendadas: B200, RTX 5090 o similar con al menos 24 GB de VRAM para comodidad.
- Despliegue: vLLM con `--quantization compressed-tensors` (obligatorio), soporte de cache de prefijo y kv-cache en FP8.
- Latencia y throughput: no disponibles; la decodificacion especulativa MTP con 2 tokens puede reducir la latencia respecto a decodificacion autoregresiva estandar, pero sin mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262 144 | BF16 | Apache-2.0 | HuggingFace |
| DavidAU Cold Fusion V1.1 | 27B | 262 144 | BF16 (con versiones 8/4 bit) | Apache-2.0 | HuggingFace |
| Este modelo (PrismQuant) | 19B (pesos) | 262 144 | NVFP4/FP8/BF16 mixto | Apache-2.0 | HuggingFace |

La comparativa se limita a caracteristicas generales, ya que no hay benchmarks publicados que permitan comparar rendimiento numerico. La principal diferencia es el formato de cuantizacion: este modelo esta optimizado para Blackwell y decodificacion especulativa, mientras que el original requiere mas VRAM y las versiones 8/4 bit de DavidAU usan metodos distintos (no especificados).

## Limitaciones y advertencias

- Requiere hardware Blackwell para aprovechar NVFP4; en otras GPUs la ejecucion se des-cuantiza y pierde la ventaja de velocidad.
- No hay benchmarks publicados para esta cuantizacion; la perdida estimada de 0,00839 es un indicador teorico, no una medicion de calidad en tareas reales.
- El numero de parametros real (19B) difiere del nombre del modelo (27B), lo que puede causar confusion al dimensionar recursos.
- El modelo base hereda los sesgos y limitaciones de Qwen3.8, incluyendo posibles sesgos culturales y riesgo de alucinacion en temas factuales.
- La decodificacion especulativa MTP requiere configuracion especifica en vLLM y puede no funcionar con todos los backends.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.

## Enlaces

- Modelo cuantizado: https://huggingface.co/trithemius/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-PrismQuant
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1
- Articulo sobre Cold Fusion: https://hackernoon.com/qwen38-27b-cold-fusion-cuts-thinking-tokens-without-sacrificing-performance
- Documentacion de Cloudflare sobre Qwen3.8-27B: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-cold-fusion-gain-v1.1-davidau
