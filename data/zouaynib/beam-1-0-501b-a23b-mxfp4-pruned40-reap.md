# zouaynib/Beam-1.0-501B-A23B-MXFP4-Pruned40-REAP

## Resumen

Beam-1.0-501B-A23B-MXFP4-Pruned40-REAP es una compresión con pérdida del modelo Reflection's Beam, un transformer de mezcla de expertos (MoE) de 501B parámetros nominales y 23B parámetros activos por token. El checkpoint original en MXFP4 ocupa 278 GB y requiere dos GPU AMD Instinct MI300X; este derivado elimina el 40,6% de los expertos enrutados de cada una de las 49 capas MoE, reduciendo el peso a 172 GB para que quepa en una única MI300X de 192 GB. Lo publica el usuario zouaynib (no el equipo de Reflection) y no implica reentrenamiento ni destilación: todos los pesos restantes provienen del modelo original.

La poda se realizó con REAP (router weight × expert output norm, Lasby et al. 2025) sobre un conjunto de calibración generado por el propio Beam (400 prompts, 262k tokens). El resultado conserva 152 de los 256 expertos enrutados por capa, manteniendo la estructura de enrutamiento en 8 grupos de 32 expertos (se conservan los 19 mejores de cada grupo). El autor advierte explícitamente de que este checkpoint es inferior al de poda por frecuencia para tareas de razonamiento, y lo publica principalmente como comparación.

Es relevante ahora porque demuestra que un MoE de 501B puede servirse en una sola GPU de 192 GB con vLLM sobre ROCm, a costa de una degradación medible y cuantificada en benchmarks de razonamiento y conocimiento. El repositorio pesa 171,7 GB y acumula 399 descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con 49 capas MoE, 256 expertos enrutados por capa en el original, 152 tras la poda, enrutamiento en 8 grupos de 32 expertos |
| Parametros totales | 154.425.003.736 (dato real de safetensors; el nombre comercial indica 501B) |
| Parametros activos | 23B (según el nombre del modelo; no disponible el desglose exacto tras la poda) |
| Longitud de contexto | 131.072 tokens configurados en vLLM (`--max-model-len 131072`); LLM Explorer reporta 1.024K en el modelo base, no confirmado para este checkpoint |
| Tipos de cuantizacion | MXFP4 (8-bit según los tags de Hugging Face; pesos FP4 desempaquetados a BF16 en tiempo de ejecución, W4A16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (171,7 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con enrutamiento agrupado: cada capa MoE elige 4 grupos de 32 expertos y luego 8 expertos dentro de ellos, sobre un total de 256 expertos enrutados por capa. Este checkpoint no introduce entrenamiento nuevo; es una poda estructural de expertos aplicada sobre el checkpoint MXFP4 de zouaynib. La calibración se generó con el propio Beam respondiendo 400 prompts fuera de los conjuntos de evaluación (MATH-500, MMLU-Pro STEM, HumanEval, MBPP, UltraChat) con `reasoning_effort=high`, produciendo 262k tokens de conversaciones completas (prompt, razonamiento y respuesta).

La puntuación REAP combina la frecuencia de selección del experto con la norma media de su salida ponderada por el peso del router. La eliminación preserva grupos: se conservan los 19 mejores expertos de cada uno de los 8 grupos en cada capa, de modo que la estructura del router no cambia; se eliminan los tensores de los expertos descartados, las filas correspondientes del router y las entradas del sesgo de corrección, y se fija `num_experts: 152`. No hay RLHF ni DPO adicionales en este paso. La innovación destacable es la viabilidad de servir un MoE de este tamaño en una sola MI300X (160 GiB de pesos, 147.161 tokens de caché KV restantes en 192 GB), aunque sin cómputo FP4 nativo en gfx942.

## Capacidades

- Generación de texto y razonamiento de estilo matemático: el modelo conserva casi intacta la capacidad de razonamiento matemático (AIME 2026 al 81,7% frente al 95,8% del modelo completo).
- Razonamiento de conocimiento intensivo: capacidad degradada, con caída de unos 15 puntos en GPQA-Diamond respecto al modelo completo.
- Generación de código: el autor reporta acuerdo top-1 del 88,0% con el modelo completo en texto de código, superior al de prosa enciclopédica.
- Tool calling y function calling: soportado mediante `--tool-call-parser beam` y `--enable-auto-tool-choice` en vLLM.
- Modo de razonamiento configurable: `reasoning_effort` (high, max) con parser dedicado (`--reasoning-parser beam`).
- Tareas agénticas de largo horizonte y resumen, según la model card del modelo base de Reflection.
- Capacidades multilingües: no disponible.
- Visión y audio: no disponibles.

## Casos de uso

- Razonamiento matemático en producción con presupuesto acotado: el modelo mantiene un rendimiento alto en AIME 2026 (81,7%) y puede desplegarse en una sola MI300X, lo que abarata el coste por consulta frente al checkpoint completo de dos GPU.
- Asistencia de código en pipelines de CI/CD: el acuerdo top-1 del 88,0% en texto de código y el soporte de tool calling permiten integrarlo en revisión automática de parches y generación de tests.
- Agentes multi-paso con herramientas: la ventana de 131.072 tokens y los parsers de tool calling y razonamiento de vLLM permiten cadenas largas de llamadas a funciones con historial extenso.
- Resumen de documentos largos: la ventana de contexto amplia permite procesar informes completos, aunque el autor advierte de mayor degradación en prosa enciclopédica que en razonamiento.
- Comparación experimental de estrategias de poda: sirve como referencia para investigar el compromiso entre REAP y poda por frecuencia en MoE de gran escala.
- Despliegue en infraestructura AMD: caso de uso directo para entornos ROCm/MI300X donde no se dispone de dos aceleradores o de GPUs NVIDIA equivalentes.
- Fine-tuning sobre un modelo base podado: al ser Apache 2.0 y safetensors, puede adaptarse a dominios específicos partiendo de un checkpoint que ya cabe en una GPU.

## Benchmarks y rendimiento

Resultados reportados por el autor con `reasoning_effort=max`, T=0,7, top-p 0,99 y presupuesto de 32k tokens; intervalos bootstrap del 95% sobre las preguntas.

| Modelo | AIME 2026 (30 × 4) | GPQA-Diamond (198 × 2) |
|---|---|---|
| MXFP4, 256 expertos (2× MI300X) | 95,8% [88,3; 100,0] | 89,4% [85,1; 93,2] |
| Poda 40%, REAP (1× MI300X) | 81,7% [68,3; 92,5] | no ejecutado |
| Poda 40%, frecuencia (1× MI300X) | 94,2% [85,8; 99,2] | 74,2% [68,2; 79,8] |
| Beam BF16 (reportado por Reflection) | 97,7% | 90,6% |

Distancia respecto al modelo completo según el porcentaje de expertos eliminados (texto retenido: wikitext, código reciente y soluciones MATH-500 en formato chat; 65.504 tokens):

| Expertos eliminados | KL | Top-1 global | Top-1 math chat | Top-1 código | Top-1 wikitext |
|---|---|---|---|---|---|
| 12,5% | 0,119 | 91,6% | 97,0% | 94,8% | 87,3% |
| 25% | 0,264 | 86,4% | 95,1% | 91,0% | 79,7% |
| 40,6% (REAP) | 0,464 | 81,0% | 93,5% | 88,0% | 71,2% |
| 40,6% (frecuencia) | 0,534 | 80,2% | 95,8% | 90,1% | 67,4% |
| 50% | 0,591 | 78,0% | 91,5% | 85,6% | 67,5% |
| 62,5% | 0,785 | 74,0% | 89,4% | 81,2% | 62,6% |

El autor señala que en GPQA la poda por frecuencia pasa de 10 a 60 respuestas agotadas de las 396, por lo que aproximadamente la mitad de la pérdida se debe a razonamiento en círculos sobre preguntas de conocimiento más que a respuestas incorrectas.

## Requisitos de hardware

- VRAM estimada: 160 GiB de pesos en una GPU de 192 GB, con 147.161 tokens de caché KV disponibles en ese margen.
- GPU recomendada: una AMD Instinct MI300X (gfx942) con 192 GB; el checkpoint original requería dos MI300X.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090 con 24 GB, ni siquiera en configuraciones multi-GPU de consumo sin particionado agresivo no documentado).
- Despliegue: vLLM ≥ 0,33 para ROCm, con las tres correcciones ROCm publicadas por el autor en el repositorio del modelo base; parámetros indicados: `--tensor-parallel-size 1 --attention-backend TRITON_ATTN --max-model-len 131072 --gpu-memory-utilization 0.95 --reasoning-parser beam --tool-call-parser beam --enable-auto-tool-choice` y `VLLM_ROCM_USE_AITER=1`.
- Cómputo: MI300X no tiene cómputo FP4 nativo, por lo que los pesos se desempaquetan a BF16 en tiempo de ejecución (W4A16).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME 2026 | GPQA-Diamond | Licencia | Hardware |
|---|---|---|---|---|---|---|
| Beam-1.0-501B-A23B MXFP4 completo | 501B (23B activos) | 131k configurado | 95,8% | 89,4% | Apache 2.0 | 2× MI300X |
| Beam-1.0-501B-A23B MXFP4 Pruned40-Freq | 501B nominales, 152 expertos/capa | 131k configurado | 94,2% | 74,2% | Apache 2.0 | 1× MI300X |
| Beam-1.0-501B-A23B MXFP4 Pruned40-REAP (este) | 501B nominales, 152 expertos/capa | 131k configurado | 81,7% | no ejecutado | Apache 2.0 | 1× MI300X |
| Beam BF16 (Reflection) | 501B (23B activos) | no disponible | 97,7% | 90,6% | Apache 2.0 | no disponible |

## Limitaciones y advertencias

- Compresión con pérdida: la poda degrada el modelo de forma medible; el autor recomienda probarlo sobre la carga de trabajo propia antes de adoptarlo.
- Degradación desigual: la prosa y el conocimiento enciclopédico se degradan mucho más que el razonamiento y el código (top-1 en wikitext del 71,2% frente al 93,5% en math chat con la misma poda).
- Inferior al checkpoint de poda por frecuencia en razonamiento: 81,7% frente a 94,2% en AIME 2026, con más agotamiento del presupuesto de 32k tokens; el autor recomienda el checkpoint por frecuencia para razonamiento.
- GPQA-Diamond no se ejecutó en este checkpoint, por lo que no hay medición directa de su rendimiento en conocimiento científico.
- Sin cómputo FP4 en MI300X: el desempaquetado a BF16 en tiempo de ejecución reduce la ventaja teórica de la cuantización.
- Riesgo de alucinación: no cuantificado en la información disponible, pero el autor documenta razonamiento en círculos en preguntas de conocimiento.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Licencia Apache 2.0, que permite uso comercial, pero se mantienen los términos de uso del modelo base de Reflection.
- Requiere vLLM ≥ 0,33 con ROCm y parches específicos del autor; el soporte en otros motores de inferencia no está documentado.
- Sesgos conocidos: no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4-Pruned40-REAP
- Checkpoint base MXFP4: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4
- Checkpoint hermano podado por frecuencia: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4-Pruned40-Freq
- Modelo original de Reflection: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Write-up interactivo: https://huggingface.co/spaces/zouaynib/beam-mxfp4-mi300x
- Correcciones ROCm: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4/tree/main/rocm
- Ficha en LLM Explorer: https://llm-explorer.com/model/zouaynib%2FBeam-1.0-501B-A23B-MXFP4,4lDPMbMSGT1cejnKLCN3QE
