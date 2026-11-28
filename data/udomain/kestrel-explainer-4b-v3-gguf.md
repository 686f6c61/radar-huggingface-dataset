# udomain/kestrel-explainer-4b-v3-gguf

## Resumen

Kestrel-Explainer-4B v3 (GGUF Q5_K_M) es un modelo de lenguaje especializado en análisis de cumplimiento normativo con la PDPO de Hong Kong (Personal Data (Privacy) Ordinance, Capítulo 486). Lo desarrolla el autor `udomain` como un ajuste fino del modelo base Qwen/Qwen3-4B, orientado a tareas de clasificación de incidentes de privacidad, detección de fugas de datos personales y veredictos de cumplimiento. Se distribuye en formato GGUF cuantizado a Q5_K_M (2,7 GB), pensado para su uso con Ollama y llama.cpp en GPUs de consumo de 6 GB u 8 GB sin necesidad de offload a CPU.

El modelo resuelve un problema muy concreto: evaluar si un memo o incidente de seguridad infringe la normativa de privacidad hongkonesa, emitiendo un veredicto estructurado y evitando dos fallos críticos que el autor denomina "Hard Blockers": la invención de hechos (alucinación) y la filtración de fragmentos textuales del propio prompt (gold span leak). Según la model card, la versión Q5_K_M supera las 3/3 pruebas de estos bloqueadores en el conjunto `eval_v2/locked` (N=944), mientras que la cuantización inferior Q4_K_M fallaba dos de ellas.

La relevancia actual reside en su enfoque de despliegue ligero y determinista: temperatura 0, prompt de sistema incluido, formato de chat Qwen3 sin modo "thinking" y una ventana de contexto operativa de 8.192 tokens según el ejemplo de llama-server. Es un modelo de nicho, no un modelo generalista, y su utilidad está acotada al dominio de cumplimiento de privacidad en Hong Kong.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configuracion de ejemplo en llama-server; limite nativo de Qwen3-4B no confirmado en la informacion) |
| Tipos de cuantizacion | Q5_K_M (5 bits, K-quant); existe version W4A16 GPTQ y BF16 en otros repos de la familia |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`kestrel-explainer-4b-v3-Q5_K_M.gguf`, 2,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only de 4.022 millones de parámetros. Sobre esa base, el autor ha aplicado un ajuste fino orientado a tareas de cumplimiento PDPO, aunque la model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La etiqueta `pdpo` en los tags sugiere un proceso de preferencias o post-entrenamiento específico, pero no se aporta documentación técnica al respecto en la información disponible.

La innovación destacable no está en la arquitectura sino en el proceso de evaluación y en el empaquetado: el autor define un conjunto de evaluación bloqueado (`eval_v2/locked`, N=944) con tres "Hard Blockers" medibles (ausencia de hechos inventados, ausencia de fuga de fragmentos del prompt y validez de esquema al 99,89 %). Además, la model card documenta explícitamente que la cuantización Q4_K_M no superaba dos de estos bloqueadores, lo que motivó el salto a Q5_K_M. El modelo se distribuye con un `Modelfile` que fija temperatura 0 y un `system_prompt.txt` que debe pasarse cuando se invoca la API en crudo, y requiere preservar el formato de chat Qwen3 con `enable_thinking=False`.

## Capacidades

- Generación de texto especializada en análisis de cumplimiento de la PDPO de Hong Kong (Cap. 486).
- Clasificación y veredicto de incidentes de privacidad a partir de memos en lenguaje natural.
- Detección de datos personales en texto: la model card incluye un ejemplo con un HKID (`Z912345(6)`) y una contraseña en claro (`TestPass99!`).
- Salida estructurada validada por esquema (schema accuracy del 99,89 % en `eval_v2/locked`).
- Mitigación explícita de alucinación de hechos (bloqueador `myth=0`) y de fuga de fragmentos del prompt (bloqueador `gold_span_leak=0`).
- Capacidades multilingües limitadas a inglés y chino (en, zh).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" (de hecho, se indica desactivar el thinking de Qwen3).

## Casos de uso

- Triaje de incidentes de privacidad: el modelo recibe un memo de incidente y emite un veredicto de cumplimiento con justificación, adecuado por su entrenamiento específico en PDPO y su formato de salida estructurado validado por esquema.
- Detección de fugas de datos personales en textos operativos: identifica HKID, contraseñas y otros identificadores expuestos, como muestra el ejemplo de la model card, y señala el riesgo normativo asociado.
- Revisión previa de comunicaciones internas: permite filtrar borradores de memos o correos antes de su difusión para comprobar que no contienen datos personales ni incumplen la ordenanza.
- Asistencia a equipos de compliance en Hong Kong: actúa como primer analista automático que clasifica casos y reduce la carga de revisión manual, con temperatura 0 para reproducibilidad.
- Despliegue en entornos con hardware modesto: al ocupar 2,7 GB en Q5_K_M y caber en GPUs de 6-8 GB sin offload, es viable en estaciones de trabajo de oficina o portátiles con GPU de consumo mediante Ollama.
- Integración en pipelines de llama.cpp: el servidor `llama-server` con `-ngl 99 -c 8192` permite exponer el modelo como servicio HTTP interno para herramientas de ticketing o DLP.
- Evaluación comparativa de cuantizaciones: sirve como caso de estudio para equipos que necesitan decidir entre Q4_K_M y Q5_K_M según los bloqueadores de calidad de su dominio.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre `eval_v2/locked` (N=944):

| Metrica | Q5_K_M (este repo) | Referencia `v4_legacy` |
|---|---|---|
| Hard Blockers superados | 3/3 | no disponible |
| `myth` (hechos inventados) | 0 | no disponible |
| `gold_span_leak` (fuga de fragmento) | 0 | no disponible |
| Validez de esquema | 99,89 % / 99,89 % | no disponible |
| `verdict_acc` | 94,70 % | 94,49 % |
| `primary_acc` | 95,34 % | 97,88 % |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo aporta el conjunto de evaluación propio del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en Q5_K_M con overhead de contexto; el autor indica que cabe en GPUs de 6 GB y 8 GB sin offload a CPU.
- GPU recomendadas: RTX 3060 6 GB, RTX 4060 8 GB, RTX 3070 8 GB, RTX 4090, A100 y H100 (estas últimas sobradas para este tamaño).
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 6 GB o más de VRAM.
- Opciones de despliegue: Ollama (`ollama run hf.co/udomain/kestrel-explainer-4b-v3-gguf:Q5_K_M`), llama.cpp (`llama-server -ngl 99 -c 8192`), y para la variante W4A16 el autor referencia vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Kestrel-Explainer-4B v3 GGUF | 4.022 M | 8.192 (config. ejemplo) | Cumplimiento PDPO HK | apache-2.0 | GGUF Q5_K_M |
| Qwen/Qwen3-4B (base) | 4.022 M | no disponible | Generalista | apache-2.0 | safetensors |
| Kestrel-Explainer-4B v3 BF16 | 4.022 M | no disponible | Cumplimiento PDPO HK | apache-2.0 | safetensors |
| Kestrel-Explainer-4B v3 W4A16 | 4.022 M | no disponible | Cumplimiento PDPO HK | apache-2.0 | GPTQ W4A16 |

No se dispone de información sobre otros modelos especializados en PDPO de Hong Kong comparables en la información proporcionada.

## Limitaciones y advertencias

- Dominio muy restringido: está entrenado para cumplimiento PDPO de Hong Kong; su rendimiento fuera de ese ámbito no está documentado y probablemente sea deficiente.
- Idiomas limitados a inglés y chino; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación mitigado pero no eliminado: el bloqueador `myth=0` se mide sobre un conjunto concreto (`eval_v2/locked`), no sobre datos arbitrarios de producción.
- La model card advierte de que Q4_K_M fallaba dos Hard Blockers; usar cuantizaciones más agresivas que Q5_K_M puede degradar la calidad de forma significativa.
- Requiere preservar el formato de chat Qwen3 con `enable_thinking=False` y pasar el `system_prompt.txt` cuando no se usa el `Modelfile`; omitirlo puede alterar el comportamiento.
- No debe tratarse como asesoramiento legal: es una herramienta de apoyo a la clasificación, no un sustituto de un abogado o de un DPO.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.
- Fecha de creación del repositorio: 2026-11-28, según los metadatos de Hugging Face.

## Enlaces

- Repositorio GGUF: https://huggingface.co/udomain/kestrel-explainer-4b-v3-gguf
- Versión BF16: https://huggingface.co/udomain/kestrel-explainer-4b-v3
- Versión W4A16 GPTQ: https://huggingface.co/udomain/kestrel-explainer-4b-v3-w4a16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
