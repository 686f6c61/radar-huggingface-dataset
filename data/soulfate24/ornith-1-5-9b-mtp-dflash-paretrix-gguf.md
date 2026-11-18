# Soulfate24/Ornith-1.5-9B-MTP-DFlash-Paretrix-GGUF

## Resumen

Ornith-1.5-9B-MTP-DFlash-Paretrix-GGUF es una colección de cuantizaciones GGUF del modelo base ornith-ai/Ornith-1.5-9B, publicada por el usuario Soulfate24 bajo el paraguas de su suite Paretrix. No se trata de un modelo nuevo, sino de una redistribución optimizada del modelo original de 8.953.803.264 parámetros (aproximadamente 9B), pensada para su ejecución en llama.cpp y otros runners compatibles con GGUF. El repositorio incluye además la variante MTP (multi-token prediction) del modelo, orientada a decodificación especulativa.

La propuesta de valor reside en el método de cuantización: Paretrix es una suite empírica y consciente de las activaciones que, en lugar de aplicar una familia de bitwidth uniforme a toda la red, mide la respuesta de cada clase de tensor a cada tipo de cuantización contra los logits de referencia en BF16 y planifica cada nivel mediante un problema de mochila exacto. El resultado son varios "escalones" (Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc) que buscan dominar a las cuantizaciones estándar de llama.cpp en la relación tamaño-calidad.

El modelo es relevante para desarrolladores que necesitan desplegar un LLM de ~9B en hardware con VRAM limitada manteniendo una fidelidad cercana al original, y para quienes quieran experimentar con decodificación especulativa mediante el módulo draft DFlash y la variante MTP. La licencia MIT del modelo base facilita el uso comercial. No se dispone de información sobre idiomas soportados ni de benchmarks de capacidades en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no especificados) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la version MTP recomienda KV cache q5_1 y draft cache q8_0 para maximizar la ventana) |
| Tipos de cuantizacion | GGUF: Q8_0, Fidelity-48pc, Precision-42pc, Q6_K-imx, Quality-36pc, Q5_K_M-imx, Compact-33pc, Mini-30pc, IQ4_XS-imx, Nano-27pc, Pico-24pc, IQ3_M-imx, Femto-21pc |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de 231,1 GB con multiples variantes) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base ornith-ai/Ornith-1.5-9B (tipo de transformer, composición del dataset, número de tokens de entrenamiento, uso de RLHF/DPO u otras técnicas de alineamiento). Lo que sí documenta la model card es el proceso de cuantización aplicado por Paretrix: se parte de tres bases estándar (Q8_0, Q6_K-imx e IQ4_XS-imx), se mueve cada clase de tensor de forma aislada a cada tipo de cuantización y se mide contra los logits BF16; con esas celdas de medición se planifica cada escalón mediante una mochila exacta, y un duelo en el régimen de veredicto decide si el plan sustituye al campeón. El conocimiento medido en un modelo se hereda al siguiente de la misma familia.

El repositorio incluye la variante MTP (multi-token prediction), que funciona de forma autónoma y no debe ejecutarse simultáneamente con un draft DFlash o DSpark. También se referencia el módulo draft ornith-ai/Ornith-1.5-9B-DFlash para decodificación especulativa. La configuración recomendada para la versión MTP es KV cache en q5_1 y draft cache en q8_0, lo que según el autor maximiza la ventana de contexto con velocidad igual o superior cuando el contexto está muy cargado.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Decodificación especulativa mediante el módulo draft DFlash y la variante MTP integrada.
- Etiqueta vision en los metadatos del repositorio, lo que sugiere capacidades multimodales en el modelo base, aunque no se detallan en la información disponible.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en hardware de consumo: la variante Nano-27pc (4794 MiB) o Pico-24pc (4306 MiB) permiten ejecutar un modelo de ~9B en GPUs con 6-8 GB de VRAM mediante llama.cpp, manteniendo una perplejidad cercana a la de cuantizaciones estándar de mayor tamaño.
- Servidores de inferencia con VRAM ajustada: Quality-36pc (6306 MiB) o Compact-33pc (5792 MiB) ofrecen un equilibrio entre huella de memoria y fidelidad (KLD de 0,0254 y 0,0362 respectivamente) para despliegues en una sola GPU de 8-12 GB.
- Inferencia de baja latencia con decodificación especulativa: la variante MTP, ejecutada de forma autónoma con KV cache q5_1 y draft cache q8_0, acelera la generación en contextos muy cargados según las notas del autor.
- Aplicaciones conversacionales: el tag conversational y el pipeline text-generation indican uso en asistentes y chat multi-turno, aunque la longitud de contexto no está documentada.
- Evaluación comparativa de cuantizaciones: los datos de PPL, KLD, RMS Δp y top-p de la tabla permiten a investigadores medir el impacto de distintas estrategias de cuantización sobre la distribución de salida del modelo.
- Prototipado con presupuesto de memoria mínimo: Femto-21pc (3802 MiB) o Pico-24pc permiten experimentar con el modelo en entornos con menos de 5 GB de VRAM, asumiendo el coste en fidelidad (KLD 0,1784 y 0,1248).
- Integración en pipelines existentes de llama.cpp: al ser GGUF y estar etiquetado como endpoints_compatible, puede incorporarse a servicios que ya consumen modelos GGUF sin cambios de formato.

## Benchmarks y rendimiento

Los datos publicados en la model card son métricas de fidelidad de cuantización (perplejidad, divergencia KL, RMS de diferencia de probabilidad y top-p), no benchmarks de capacidades como MMLU o HumanEval. Se reproducen a continuación:

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p | Pareto |
|---|---:|---:|---:|---:|---:|---:|:---|
| Q8_0 (stock) | 9086 | 8,9461 | +0,0247 | 0,0100 | 2,78% | 97,7% | ★ |
| Fidelity-48pc | 8212 | 8,9078† | −0,0136 | 0,0118 | 2,81% | 97,3% | ★ |
| Precision-42pc | 7325 | 8,8886† | −0,0328 | 0,0149 | 3,08% | 96,3% | ★ |
| Q6_K-imx (stock) | 7018 | 8,6805† | −0,2409 | 0,0240 | 3,85% | 95,7% | ★ |
| Quality-36pc | 6306 | 8,8666† | −0,0548 | 0,0254 | 3,98% | 94,4% | ★ |
| Q5_K_M-imx (stock) | 6168 | 8,6950† | −0,2264 | 0,0309 | 4,09% | 94,7% | ★ |
| Compact-33pc | 5792 | 8,9295 | +0,0081 | 0,0362 | 4,89% | 93,5% | ★ |
| Mini-30pc | 5281 | 8,7179† | −0,2035 | 0,0542 | 5,88% | 91,5% | ★ |
| IQ4_XS-imx (stock) | 4956 | 9,2451 | +0,3237 | 0,0729 | 6,81% | 91,0% | < Nano-27pc |
| Nano-27pc ⭐ | 4794 | 8,8194† | −0,1020 | 0,0648 | 6,58% | 90,5% | ★ |
| Pico-24pc | 4306 | 8,9726 | +0,0512 | 0,1248 | 8,81% | 86,5% | ★ |
| IQ3_M-imx (stock) | 4211 | 9,1407 | +0,2193 | 0,1768 | 10,87% | 84,7% | ★ |
| Femto-21pc | 3802 | 9,3947 | +0,4733 | 0,1784 | 11,19% | 83,5% | ★ |

La marca † indica valores que el autor presenta como mejorados respecto a la referencia; el símbolo ★ indica que el escalón domina en el frente de Pareto. No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3802 MiB (Femto-21pc) y 9086 MiB (Q8_0), según la variante elegida; debe añadirse la memoria del KV cache y, en su caso, del draft cache (q8_0 recomendado para MTP) y del contexto.
- GPU recomendadas: no especificadas por el autor; por huella, las variantes de 4-6 GB caben en GPUs de consumo de gama media, y las de 7-9 GB requieren GPUs de 8-12 GB o superiores.
- Cabe en GPU de consumo: sí, las variantes Nano-27pc (4794 MiB), Pico-24pc (4306 MiB) y Femto-21pc (3802 MiB) están pensadas para ello; las variantes de mayor tamaño requieren GPUs con más VRAM.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), y runners compatibles con GGUF; el tag endpoints_compatible sugiere integración con servicios de endpoints.
- Latencia y throughput estimados: no disponibles; el autor solo indica que la configuración MTP con KV cache q5_1 y draft cache q8_0 ofrece velocidad igual o mejor con contexto muy cargado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-MTP-DFlash-Paretrix-GGUF (este) | ~9B | no disponible | GGUF | MIT | Cuantizaciones Paretrix con frente de Pareto medido |
| ornith-ai/Ornith-1.5-9B (base) | ~9B | no disponible | safetensors (presumible) | MIT | Modelo original sin cuantizar |
| ornith-ai/Ornith-1.5-9B-DFlash | no disponible | no disponible | no disponible | no disponible | Módulo draft para decodificación especulativa |
| Q8_0 / Q6_K-imx / IQ4_XS-imx (stock) | ~9B | no disponible | GGUF | MIT (heredada) | Referencias estándar de llama.cpp frente a las que se mide Paretrix |

No se dispone de información sobre otros modelos de la misma categoría (mismo tamaño o misma tarea) para una comparativa más amplia.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos del modelo base en la información proporcionada.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no cuantificado para este modelo.
- Las cuantizaciones agresivas (Pico-24pc, Femto-21pc) elevan la divergencia KL (0,1248 y 0,1784) y reducen el top-p (86,5% y 83,5%), lo que puede degradar la calidad en tareas sensibles.
- La variante MTP no debe ejecutarse simultáneamente con un draft DFlash o DSpark; hacerlo puede provocar un comportamiento incorrecto.
- La longitud de contexto no está documentada; la recomendación de KV cache q5_1 busca maximizar la ventana, pero no se especifica su tamaño.
- Idiomas soportados no disponibles; no se puede garantizar un rendimiento multilingüe concreto.
- Licencia MIT heredada del modelo base, lo que permite uso comercial; conviene verificar los términos del modelo original en su repositorio.
- El repositorio es una cuantización de terceros (Soulfate24), no una publicación oficial de ornith-ai; la fidelidad de las métricas depende de la metodología Paretrix descrita por el autor.
- El tamaño total del repo (231,1 GB) implica una descarga considerable si se quieren todas las variantes; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/Ornith-1.5-9B-MTP-DFlash-Paretrix-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Modelo draft DFlash: https://huggingface.co/ornith-ai/Ornith-1.5-9B-DFlash
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
