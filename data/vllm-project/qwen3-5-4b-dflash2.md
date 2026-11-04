# vllm-project/Qwen3.5-4B-DFlash2

## Resumen

Qwen3.5-4B-DFlash2 es un modelo borrador (drafter) de decodificación especulativa entrenado específicamente para acelerar la inferencia de Qwen/Qwen3.5-4B. Lo publica la organización vllm-project como copia de seguridad del checkpoint original de nchapman, con el objetivo de reducir el riesgo de cadena de suministro en los tests de integración continua de vLLM. No es un modelo generativo autónomo: es un componente auxiliar que propone tokens candidatos que el verificador Qwen3.5-4B valida, de modo que la generación completa se acelera sin alterar la distribución de salida del modelo base.

El artefacto tiene 662 millones de parámetros en safetensors (1,3 GB de repositorio) y se entrenó sobre 260 millones de tokens de conversaciones de Nemotron-Cascade-2 cuyos turnos de asistente fueron regenerados por el propio verificador cuantizado W4A16-GPTQ en la configuración de muestreo de servicio (temperatura 0,7, top_p 0,95, top_k 20). La innovación práctica es que el borrador aprende exactamente lo que su verificador emite en el punto de operación real, lo que eleva la tasa de aceptación frente al mecanismo MTP nativo del modelo.

Su relevancia es operativa: en despliegues de vLLM con Qwen3.5-4B, este drafter mejora la tasa de aceptación ponderada de 3,21 a 4,65 tokens por paso (un +1,43) según los benchmarks del autor, con la mayor ganancia en razonamiento matemático (+3,13) y código (+1,51). Es, por tanto, una pieza de infraestructura de serving más que un modelo para uso directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | borrador de decodificación especulativa (dflash2) sobre transformer; estados ocultos de 6 taps del verificador |
| Parametros totales | 662.049.280 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en safetensors; el verificador de referencia emplea W4A16-GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (custom_code; requiere trust_remote_code) |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificación especulativa que consume los estados ocultos del verificador Qwen3.5-4B (6 taps) y propone bloques de tokens candidatos que el verificador acepta o rechaza. El entrenamiento usa bloques de 16 tokens con 15 tokens especulativos, learning rate 6e-4 con schedule coseno y 4 % de warmup, durante 6 épocas. El corpus consta de 260 millones de tokens derivados de 100.000 conversaciones de Nemotron-Cascade-2, con los turnos de asistente regenerados por el verificador cuantizado W4A16-GPTQ desplegado, muestreados con temperatura 0,7, top_p 0,95 y top_k 20 con semilla fija. Los identificadores de slice están congelados en el dataset warp-3090-quant-lab-frozen-data y el corpus es reconstruible con el pipeline warp-3090-quant-lab.

La selección del checkpoint se hizo comparando las seis épocas a tres temperaturas con repeticiones. En el punto de servicio (t=0,7) la tasa de aceptación crece de forma monótona hasta el final del entrenamiento (3,28 → 3,49 → 3,68 → 3,79), por lo que se publica la época 6. En decodificación greedy, en cambio, la época 4 alcanza 4,20 frente a 4,05 de la época final, de modo que las cargas de trabajo con decodificación greedy (agénticas, extracción) podrían preferir una instantánea anterior. El autor advierte que la tasa de aceptación depende de la temperatura y presenta dispersión entre ejecuciones (0,34 observado a t=1,0 en entradas idénticas; ~0,1 a t=0,7).

## Capacidades

- Aceleración de decodificación especulativa para Qwen3.5-4B: propone tokens candidatos que el verificador valida, sin modificar la distribución de salida del modelo base.
- Funciona tanto contra el verificador bf16 como contra la cuantización W4A16-GPTQ con la que fue entrenado.
- Mejora la tasa de aceptación frente al MTP nativo (k=3) en todas las categorías medidas: qa, HumanEval, math_reasoning, tool_call, rag, question, writing, summarization y translation.
- Rendimiento especialmente alto en razonamiento matemático (τ 6,64) y generación de código (τ 4,85).
- No es un modelo generativo autónomo: no soporta tool calling, agentes ni razonamiento multi-step por sí mismo; hereda esas capacidades del verificador.
- Capacidades multilingües: no disponibles como dato propio; dependen del modelo base.

## Casos de uso

- Serving de alta concurrencia con vLLM: desplegar Qwen3.5-4B con este drafter reduce el número de pasos de decodificación necesarios por respuesta, lo que aumenta el throughput por GPU en cargas de chat multi-turno.
- Asistentes conversacionales en producción: con temperatura 0,7 (el punto de servicio para el que se optimizó el checkpoint) se obtiene la mayor tasa de aceptación medida (3,79), adecuada para atención al cliente automatizada.
- Generación de código asistida: la categoría HumanEval sube de 3,35 a 4,85 de aceptación, por lo que es útil en pipelines de autocompletado o revisión de código donde el verificador ya genera código.
- Razonamiento matemático y tutoría: la ganancia de +3,13 en math_reasoning lo hace idóneo para aplicaciones educativas o de resolución de problemas con Qwen3.5-4B.
- RAG y resumen de documentos: las subidas en rag (+1,68) y summarization (+1,16) reducen la latencia en pipelines de recuperación aumentada con contexto largo.
- Integración en CI de vLLM: el propio repositorio existe para que los tests de integración continua de vLLM usen un checkpoint estable y verificado por sha256.
- Extracción estructurada y flujos agénticos con decodificación greedy: en estos escenarios conviene evaluar la instantánea de la época 4, que rinde mejor a t=0 (4,20 frente a 4,05).

## Benchmarks y rendimiento

Tasa de aceptación (τ) ponderada por intervalo, escalera de chat de 20 prompts, serving en GB10:

| Configuracion | τ greedy (t=0) | τ t=0,7 (servicio) | τ t=1,0 |
|---|---|---|---|
| Verificador W4A16-GPTQ (verificador de entrenamiento) | 4,05 (n=2) | 3,79 (n=4: 3,71–3,85) | 3,25 (n=2) |
| Base bf16 Qwen3.5-4B | — | 3,75 | 3,32 |
| MTP nativo k=3 (baseline) | 2,99 | 2,86 | 2,66 |

Perfil por categoría (speculator_benchmarks de RedHatAI, temperatura 0, n=2):

| Subconjunto | MTP k=3 | Este drafter | Δ |
|---|---|---|---|
| qa | 2,94 | 3,61 | +0,67 |
| HumanEval | 3,35 | 4,85 | +1,51 |
| math_reasoning | 3,51 | 6,64 | +3,13 |
| tool_call | 3,24 | 4,65 | +1,42 |
| rag | 3,35 | 5,03 | +1,68 |
| question | 3,12 | 4,47 | +1,36 |
| writing | 3,11 | 4,47 | +1,36 |
| summarization | 3,15 | 4,31 | +1,16 |
| translation | 2,96 | 3,04 | +0,08 |
| Ponderado | 3,21 | 4,65 | +1,43 |

No se han publicado resultados de benchmarks de calidad del modelo base en la información disponible; las cifras anteriores miden aceptación especulativa, no precisión de la tarea.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 1,3 GB en safetensors (662 M de parámetros); debe sumarse la memoria del verificador Qwen3.5-4B (aproximadamente 8 GB en bf16, menos en W4A16-GPTQ).
- GPU recomendadas: el autor reporta mediciones en GB10; no se especifican otras GPU en la información disponible.
- GPU de consumo: por tamaño, el drafter cabe holgadamente en cualquier GPU de consumo moderna; el límite real lo marca el verificador.
- Despliegue: vLLM 0.31.0 con librería speculators 0.8.1, transformers 5.16.1, torch 2.13.0 y compressed-tensors 0.17.0. Requiere cargar con confianza en código remoto (incluye config.py).
- Si el serving especulativo se bloquea durante la captura de grafos CUDA, el autor recomienda servir con --enforce-eager.
- Latencia y throughput: no disponibles como cifras absolutas; el beneficio se expresa como tasa de aceptación (hasta 4,65 tokens aceptados por paso frente a 3,21 del MTP nativo).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | τ ponderada | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-4B-DFlash2 (este) | drafter dflash2 | 662 M | no disponible | 4,65 | no disponible |
| MTP nativo de Qwen3.5-4B (k=3) | drafter integrado | no disponible | no disponible | 3,21 | la del modelo base |
| Otros drafter de la familia speculators | drafter especulativo | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros drafter comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse de forma autónoma; requiere el verificador Qwen3.5-4B y la pila speculators/vLLM especificada.
- La tasa de aceptación es muy sensible a la temperatura y presenta dispersión entre ejecuciones; las cifras deben interpretarse con su n y rango, no como valores únicos.
- El ranking de checkpoints depende de la temperatura: la época publicada es óptima para muestreo a t=0,7, pero no para decodificación greedy.
- El corpus de entrenamiento está sesgado hacia chat (100.000 conversaciones), lo que se refleja en la menor ganancia en traducción (+0,08).
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar el repositorio original de nchapman.
- Idiomas soportados no disponibles; dependen del modelo base.
- Riesgo de alucinación y sesgos: heredados del verificador Qwen3.5-4B, no caracterizados en esta model card.
- Requiere trust_remote_code y versiones muy concretas de las dependencias; pueden aparecer incompatibilidades con otras versiones de vLLM o transformers.
- Es una copia de seguridad de un checkpoint alojado en una cuenta personal; la integridad se garantiza por sha256 (c919a019f84c8be86fcfc24a3e694dd2e90f4f616ac6aa103f27f5308b5f5e6c).

## Enlaces

- HuggingFace: https://huggingface.co/vllm-project/Qwen3.5-4B-DFlash2
- Checkpoint original: https://huggingface.co/nchapman/Qwen3.5-4B-DFlash2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Verificador cuantizado: https://huggingface.co/nchapman/Qwen3.5-4B-W4A16-GPTQ
- Dataset de linaje: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Pipeline de reconstrucción: https://github.com/nchapman/warp-3090-quant-lab
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Releases de vLLM: https://github.com/vllm-project/vllm/releases
