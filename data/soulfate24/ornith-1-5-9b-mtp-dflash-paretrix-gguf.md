# Soulfate24/Ornith-1.5-9B-MTP-DFlash-Paretrix-GGUF

## Resumen

Ornith-1.5-9B-MTP-DFlash-Paretrix-GGUF es una colección de cuantizaciones GGUF del modelo Ornith-1.5-9B, desarrollada por Soulfate24 mediante su suite de cuantización Paretrix. El modelo base lo firma ornith-ai y cuenta con 8.953.803.264 parámetros totales (aproximadamente 8,95 mil millones) en una arquitectura transformer densa, con una variante adicional DFlash orientada a decodificación especulativa y una versión MTP (multi-token prediction) que funciona de forma autónoma.

El problema que resuelve esta publicación es el de ofrecer niveles de cuantización con compromisos medidos de fidelidad, tamaño y velocidad, en lugar de aplicar un único bitwidth uniforme a toda la red. Paretrix planifica cada nivel ("rung") a partir de mediciones por clase de tensor contra los logits BF16, de modo que cada archivo publicado ocupa un punto no dominado en el frente de Pareto entre perplejidad (PPL), divergencia KL (KLD) y tamaño en disco.

Es relevante ahora porque permite desplegar un modelo de casi 9B en hardware de consumo con pérdidas de calidad cuantificadas explícitamente: desde 9086 MiB del Q8_0 stock hasta 3802 MiB del nivel Femto-21pc, con 9 dominaciones estrictas de Pareto documentadas. La licencia MIT y el soporte nativo en llama.cpp facilitan su integración en producción y en flujos de decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Ornith-1.5-9B); publicación en formato GGUF con soporte de decodificación especulativa (DFlash) y variante MTP |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explícita; la versión MTP recomienda KV cache q5_1 y draft cache q8_0 para maximizar la ventana |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx (stock) y niveles Paretrix Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (compatible con llama.cpp y gguf-py); repo de 196,3 GB con múltiples niveles |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de 8,95B parámetros, y esta publicación no reentrena el modelo sino que lo cuantiza. La innovación técnica central es la suite Paretrix: una cuantización empírica y consciente de las activaciones en la que cada clase de tensor se mueve de forma aislada a cada tipo de cuantización y se mide contra los logits BF16 de referencia. A partir de esas celdas de medición, un problema de mochila exacto (knapsack) planifica cada nivel, y un duelo en el régimen de veredicto (contexto 4096×8) decide si el plan sustituye al campeón previo.

La publicación incorpora además dos componentes de aceleración: un draft DFlash para decodificación especulativa y una versión MTP (multi-token prediction) que funciona de forma autónoma, sin draft DFlash o DSpark simultáneo. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, si hubo RLHF/DPO) no se detallan en la información disponible. Las métricas reportadas incluyen PPL, ΔPPL, KLD, RMS Δp y top-p frente a la referencia, con 9 dominaciones estrictas de Pareto.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Razonamiento y generación de código, heredados del modelo base; no se detallan evaluaciones específicas.
- Decodificación especulativa mediante draft DFlash, con caché de draft configurable.
- Predicción multi-token (MTP) en la variante homónima, operable sin modelo draft.
- Soporte de cuantización híbrida por clase de tensor, con niveles ajustables de fidelidad.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y con el ecosistema transformers.
- Capacidades de visión: la etiqueta `vision` aparece en el repo, aunque no se documenta su alcance.
- Soporte multilingüe: no disponible.

## Casos de uso

- Despliegue en GPU de consumo: el nivel Nano-27pc (4794 MiB) o Pico-24pc (4306 MiB) permite ejecutar un modelo de 8,95B en tarjetas de 8 GB con pérdidas de PPL medidas y acotadas.
- Servidores con presupuesto de VRAM ajustado: Quality-36pc (6306 MiB) o Compact-33pc (5793 MiB) ofrecen un equilibrio intermedio para inferencia concurrente en una sola GPU de 12-16 GB.
- Decodificación especulativa de alto rendimiento: combinando el modelo con el draft DFlash se acelera la generación en contextos cargados, manteniendo la fidelidad del nivel elegido.
- Razonamiento multi-turno con contexto largo: la versión MTP con KV cache q5_1 y draft cache q8_0 maximiza la ventana útil para conversaciones extensas o documentos largos.
- Evaluación comparativa de cuantizaciones: los datos de PPL, KLD y top-p por nivel permiten seleccionar empíricamente el punto de Pareto adecuado para un pipeline concreto.
- Integración en llama.cpp y gguf-py: los archivos GGUF se cargan directamente en herramientas estándar del ecosistema, facilitando prototipado y despliegue en CPU/GPU.
- Experimentación en investigación: la suite Paretrix sirve como referencia metodológica para estudiar cuantización consciente de activaciones y planificación por knapsack.

## Benchmarks y rendimiento

Métricas de cuantización reportadas por el autor (PPL de referencia y desviaciones frente a BF16):

| Nivel | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 9086 | 8,9461 | +0,0247 | 0,0100 | 2,78% | 97,7% |
| Fidelity-48pc | 8212 | 8,9078 | −0,0136 | 0,0118 | 2,81% | 97,3% |
| Precision-42pc | 7325 | 8,8891 | −0,0323 | 0,0149 | 3,08% | 96,3% |
| Q6_K-imx (stock) | 7018 | 8,6805 | −0,2409 | 0,0240 | 3,85% | 95,7% |
| Quality-36pc | 6306 | 8,8716 | −0,0498 | 0,0291 | 4,26% | 94,2% |
| Q5_K_M-imx (stock) | 6168 | 8,2131 | −0,7083 | 0,1045 | 7,33% | 90,4% |
| Compact-33pc | 5793 | 8,7547 | −0,1667 | 0,0460 | 5,66% | 92,6% |
| Mini-30pc | 5281 | 8,8874 | −0,0340 | 0,0575 | 6,40% | 91,0% |
| IQ4_XS-imx (stock) | 4956 | 9,2634 | +0,3420 | 0,0767 | 6,92% | 90,9% |
| Nano-27pc | 4794 | 9,0223 | +0,1009 | 0,0773 | 6,84% | 90,1% |
| Pico-24pc | 4306 | 8,9920 | +0,0706 | 0,1263 | 8,84% | 86,6% |
| IQ3_M-imx (stock) | 4211 | 9,1423 | +0,2209 | 0,1806 | 10,94% | 84,6% |
| Femto-21pc | 3802 | 9,4044 | +0,4830 | 0,1810 | 11,24% | 83,5% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 3802 MiB (Femto-21pc) y 9086 MiB (Q8_0 stock) solo para pesos; añadir el espacio de KV cache y draft cache según contexto.
- GPU recomendadas: RTX 4090 (24 GB) para cualquier nivel con contexto amplio; RTX 3090/4080 (16-24 GB) para niveles medios y altos; A100/H100 para despliegues concurrentes o contextos muy largos.
- Cabe en GPU de consumo: sí, desde niveles de 4-5 GB (Pico-24pc, Nano-27pc, IQ4_XS-imx) en tarjetas de 8 GB, hasta Q8_0 en 12 GB o más.
- Opciones de despliegue: llama.cpp y gguf-py (motor principal), con compatibilidad de endpoints y transformers; Ollama y vLLM no se confirman en la información disponible.
- Latencia y throughput: no disponibles de forma numérica; la decodificación especulativa con DFlash y la variante MTP están orientadas a mejorar la velocidad, especialmente con contexto cargado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-MTP-DFlash-Paretrix (esta ficha) | 8,95B | No disponible | GGUF (múltiples niveles) | MIT | Cuantización por Pareto con draft DFlash y MTP |
| Ornith-1.5-9B (base) | 8,95B | No disponible | Safetensors/transformers | MIT | Modelo original sin cuantizar |
| Ornith-1.5-9B-DFlash (draft) | No disponible | No disponible | No disponible | MIT | Modelo draft para decodificación especulativa |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la información proporcionada.

## Limitaciones y advertencias

- Los niveles de cuantización agresivos (Femto-21pc, Pico-24pc, IQ3_M-imx) degradan la fidelidad: KLD de 0,18 y top-p de 83,5% en Femto frente a 0,0100 y 97,7% en Q8_0.
- La versión MTP no debe ejecutarse simultáneamente con un draft DFlash o DSpark; hacerlo puede provocar un comportamiento incorrecto.
- Las métricas de PPL y KLD proceden de mediciones del autor en un régimen concreto (contexto 4096×8) y pueden no extrapolarse a otras cargas.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos del modelo base en la información disponible.
- No se detallan los idiomas soportados ni la composición del entrenamiento, lo que limita la evaluación de cobertura lingüística.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes DFlash por separado.
- El repositorio ocupa 196,3 GB, por lo que la descarga selectiva de un único nivel es imprescindible en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Soulfate24/Ornith-1.5-9B-MTP-DFlash-Paretrix-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Draft DFlash: https://huggingface.co/ornith-ai/Ornith-1.5-9B-DFlash
- Suite Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- Motor llama.cpp: https://github.com/ggml-org/llama.cpp
