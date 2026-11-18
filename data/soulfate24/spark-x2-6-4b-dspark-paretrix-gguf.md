# Soulfate24/Spark-X2.6-4B-DSpark-Paretrix-GGUF

## Resumen

Spark-X2.6-4B-DSpark-Paretrix-GGUF es una familia de cuantizaciones GGUF del modelo base XHToken/Spark-X2.6-4B, un LLM de 4.112.079.360 parámetros (aproximadamente 4,1 mil millones) orientado a generación de texto, uso conversacional y flujos de agente. La publica Soulfate24 bajo licencia Apache 2.0 y combina el modelo objetivo con módulos de decodificación especulativa (drafts DSpark) para acelerar la inferencia en llama.cpp.

El valor diferencial no está en un nuevo modelo de lenguaje, sino en la metodología de cuantización: la suite Paretrix planifica cada nivel de compresión midiendo la respuesta real de cada clase de tensor a cada tipo de cuantización, en lugar de aplicar un único ancho de bits uniforme a toda la red. El repositorio ofrece múltiples "peldaños" (Fidelity-48pc, Quality-36pc, Compact-33pc, Nano-27pc, etc.) con métricas de perplejidad, divergencia KL y solapamiento top-p frente a los logits en BF16.

Es relevante ahora porque permite desplegar un modelo de 4B con ventanas de contexto largas (los drafts llegan a 32K) en hardware de consumo, con aceleración especulativa de hasta ×2,46 en throughput y una trazabilidad métrica poco habitual en cuantizaciones comunitarias. Los idiomas declarados son inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base XHToken/Spark-X2.6-4B); no se detalla en la información disponible |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | Hasta 32K en el draft `draft-32K`; contexto del modelo base no disponible |
| Tipos de cuantización | GGUF híbridos Paretrix (Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc) y referencias stock (Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería declarada: transformers; compatible con llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base XHToken/Spark-X2.6-4B más allá de su naturaleza transformer y su orientación a texto conversacional y agentes (etiquetas `agent`, `conversational`, `sparkx2_5`). Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. El dato verificable es el recuento de parámetros en safetensors: 4.112.079.360.

La innovación técnica documentada reside en la cuantización y en la decodificación especulativa. Paretrix parte de tres bases stock (Q8_0, Q6_K-imx, IQ4_XS-imx), mueve cada clase de tensor de forma aislada a cada tipo de cuantización y mide el resultado contra los logits en BF16; después, un problema de mochila exacto planifica cada peldaño y un duelo en el régimen de veredicto decide si el plan sustituye al campeón. Los drafts DSpark son módulos de decodificación especulativa: el oficial (415 MiB), un `draft-32K` con capas oficiales y readout propio (453 MiB) y un `draft-lite` podado y reentrenado (209 MiB).

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y respuesta a instrucciones en inglés y chino.
- Uso como modelo de agente (etiqueta `agent` en la model card).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Decodificación especulativa mediante drafts DSpark, con aceleración de ×1,78 a ×2,46 según configuración de KV cache.
- Ejecución en llama.cpp con cuantizaciones GGUF de distintos tamaños y perfiles de fidelidad.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: el peldaño Compact-33pc (2660 MiB) ofrece una perplejidad de 14,8100 y un ΔPPL de +0,0489, lo que permite ejecutar el modelo en GPUs de consumo manteniendo una fidelidad cercana a Q8_0.
- Asistentes conversacionales de bajo coste: con Nano-27pc (2201 MiB) o Mini-30pc (2424 MiB) se puede servir un chatbot multi-turno en inglés o chino en hardware modesto, aceptando una mayor divergencia KL (0,1240 y 0,0781 respectivamente).
- Aceleración de inferencia en producción: emparejar Quality-36pc con `draft-32K` y KV q5_1 alcanza 106,1 t/s con un factor de ×2,46, adecuado para servicios con requisitos de latencia ajustados.
- Pipelines de CI/CD y herramientas de desarrollo: la compatibilidad con llama.cpp y la etiqueta `endpoints_compatible` permiten integrar el modelo en flujos automatizados de generación y revisión de texto.
- Investigación en cuantización: los datos de PPL, KLD, RMS Δp y top-p por peldaño sirven como referencia reproducible para estudiar el compromiso entre tamaño y fidelidad en modelos de 4B.
- Evaluación de decodificación especulativa: los tres drafts (oficial, `draft-32K` y `draft-lite`) permiten comparar estrategias de poda y reentrenamiento con métricas de throughput y factor de aceleración.
- Prototipado de agentes en entornos con recursos limitados: el modelo base está etiquetado como `agent`, y los peldaños pequeños (Pico-24pc, Femto-21pc) reducen el coste de experimentación, aunque Femto-21pc presenta un ΔPPL de +2,0378.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye métricas de cuantización y de decodificación especulativa:

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 4172 | 14,9008 | +0,1397 | 0,0037 | 1,43% | 97,7% |
| Fidelity-48pc | 3767 | 14,8424 | +0,0813 | 0,0068 | 1,90% | 97,0% |
| Precision-42pc | 3356 | 14,9059 | +0,1448 | 0,0100 | 2,41% | 96,0% |
| Q6_K-imx (stock) | 3223 | 14,8915 | +0,1304 | 0,0148 | 2,97% | 95,2% |
| Quality-36pc | 2894 | 15,2836 | +0,5225 | 0,0263 | 4,04% | 93,4% |
| Q5_K_M-imx (stock) | 2840 | 15,9084 | +1,1473 | 0,0503 | 5,37% | 90,8% |
| Compact-33pc | 2660 | 14,8100 | +0,0489 | 0,0517 | 5,34% | 90,5% |
| Mini-30pc | 2424 | 15,1712 | +0,4101 | 0,0781 | 6,75% | 88,2% |
| IQ4_XS-imx (stock) | 2266 | 14,9378 | +0,1767 | 0,1194 | 8,06% | 84,9% |
| Nano-27pc | 2201 | 14,7133 | −0,0478 | 0,1240 | 8,25% | 85,1% |
| Pico-24pc | 1978 | 15,5452 | +0,7842 | 0,2228 | 11,63% | 79,5% |
| IQ3_M-imx (stock) | 1949 | 19,8316 | +5,0705 | 0,4549 | 16,95% | 72,0% |
| Femto-21pc | 1750 | 16,7988 | +2,0378 | 0,3624 | 14,58% | 74,4% |

Rendimiento de los drafts DSpark sobre el objetivo Quality-36pc:

| Draft | Módulo | KV q8_0 | KV q5_1 |
|---|---:|---:|---:|
| Oficial | 415 MiB | 106,3 t/s · ×1,92 | 98,6 t/s · ×2,30 |
| `draft-32K` | 453 MiB | 112,7 t/s · ×2,02 | 106,1 t/s · ×2,46 |
| `draft-lite` | 209 MiB | 98,7 t/s · ×1,78 | 98,2 t/s · ×2,30 |

## Requisitos de hardware

- VRAM estimada para el modelo: entre 1750 MiB (Femto-21pc) y 4172 MiB (Q8_0), sin contar la KV cache.
- VRAM adicional para drafts: 209 MiB (`draft-lite`), 415 MiB (oficial) o 453 MiB (`draft-32K`).
- GPU recomendadas: cualquier GPU consumer con 4-6 GB de VRAM libre puede alojar los peldaños pequeños; para Q8_0 o Fidelity-48pc conviene disponer de 6-8 GB. No se especifican modelos concretos (RTX 4090, A100, H100) en la información disponible.
- Cabe en GPU de consumo: sí, al menos desde Compact-33pc hacia abajo; Q8_0 y Fidelity-48pc requieren aproximadamente 4 GB solo para pesos.
- Opciones de despliegue: llama.cpp (formato GGUF, etiqueta `llama.cpp`); la librería declarada es transformers y el modelo es `endpoints_compatible`. No se confirma soporte de vLLM, TGI u Ollama en la información proporcionada.
- Latencia y throughput: con Quality-36pc y `draft-32K` sobre KV q5_1 se alcanzan 106,1 t/s (×2,46); con KV q8_0, 112,7 t/s (×2,02). El draft oficial rinde 98,6 t/s (×2,30) con KV q5_1.

## Comparativa con modelos similares

La información disponible no incluye comparaciones con otros modelos de la misma categoría. La comparación interna entre peldaños Paretrix y cuantizaciones stock del mismo modelo base se recoge en la tabla de benchmarks.

| Alternativa | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark-X2.6-4B (base) | 4.112.079.360 | No disponible | Apache 2.0 | Hugging Face (XHToken) |
| Spark-X2.6-4B-DSpark-GGUF | 4.112.079.360 | No disponible | Apache 2.0 | Hugging Face (XHToken) |
| Otros modelos de 4B comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al entrenarse solo en inglés y chino, el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: inherente a los LLM de 4B; los peldaños con mayor KLD (Pico-24pc, 0,2228; Femto-21pc, 0,3624) degradan la fidelidad de distribución y pueden aumentar la incoherencia.
- Limitaciones de contexto: el draft `draft-32K` sugiere soporte hasta 32K, pero el contexto del modelo base no se especifica; los peldaños pequeños pueden degradar el rendimiento en contextos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base XHToken/Spark-X2.6-4B y de los drafts.
- Caveat de producción: las métricas de PPL y KLD son relativas al conjunto de evaluación del autor y no sustituyen una evaluación de tarea; el throughput reportado depende del hardware y de la configuración de KV cache.
- El repositorio ocupa 64,2 GB, por lo que la descarga completa requiere espacio en disco considerable; es preferible descargar solo el peldaño y el draft necesarios.
- La model card está marcada con aviso de contenido citado; no debe interpretarse como instrucciones operativas.

## Enlaces

- Hugging Face: https://huggingface.co/Soulfate24/Spark-X2.6-4B-DSpark-Paretrix-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Drafts DSpark: https://huggingface.co/XHToken/Spark-X2.6-4B-DSpark-GGUF
- Suite Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
