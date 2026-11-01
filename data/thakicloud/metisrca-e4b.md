# ThakiCloud/MetisRCA-E4B

## Resumen

MetisRCA-E4B es un modelo pequeño especializado en diagnóstico de incidentes (root-cause analysis) desarrollado por ThakiCloud. Se trata de un fine-tune con LoRA del modelo nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, publicado en Hugging Face como `ThakiCloud/MetisRCA-E4B` (versión 1.0.0). Su función es muy concreta: dada una descripción de síntoma, una lista de causas candidatas procedentes de un runbook y un conjunto de observaciones de solo lectura (métricas, logs), el modelo responde con un único objeto JSON que identifica la causa raíz que puede demostrar, las observaciones que la deciden, o bien `INSUFFICIENT_EVIDENCE` junto con la siguiente herramienta de solo lectura que conviene ejecutar.

Su relevancia radica en dos capacidades poco habituales en modelos pequeños: la selección de la evidencia decisiva y la abstención fundamentada (no fabricar una causa cuando los datos no bastan). Esto lo hace adecuado como capa de razonamiento dentro de un bucle agéntico de diagnóstico en plataformas Kubernetes/GPU/base de datos, donde un agente externo ejecuta las herramientas y vuelve a consultar al modelo. Según la model card, en mecanismos no vistos durante el entrenamiento rinde por debajo de Qwen3.5-4B (0.783 frente a 0.831 en Cloud-OpsBench like-for-like), aunque una política de abstención opcional en inferencia (`abstain_policy.py`, sin cambiar pesos) eleva el top-1 a 0.824 y reduce la sobreabstención del 15% al 9,4%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune LoRA sobre NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (familia gemma4, según tags) |
| Parametros totales | 7.996.156.490 (dato safetensors) |
| Parametros activos | no disponible (la denominación "E4B" sugiere ~4B activos, pero no consta en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye imatrix y pesos en safetensors y GGUF) |
| Idiomas soportados | ingles (en) |
| Licencia | openmdw-1.1 (license: other) |
| Formato de pesos | safetensors (adapter LoRA), GGUF |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 y se entrena mediante LoRA (adapter publicado en el subfolder `adapter` del repositorio). Los tags indican pertenencia a la familia gemma4 de NVIDIA Nemotron. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO; la model card si indica que las etiquetas de entrenamiento proceden de ground truth de benchmark y reglas, no de un modelo de lenguaje.

La innovacion mas destacable esta en el diseno de la tarea y la inferencia: el modelo se invoca una vez por estado de diagnostico y responde exactamente un objeto JSON `{"root_cause", "evidence_ids", "next_tool", "confidence_state"}`. Cuando las observaciones no determinan la causa, debe responder `INSUFFICIENT_EVIDENCE` y nombrar la siguiente herramienta de solo lectura, lo que permite construir un bucle agéntico que recopila evidencia y reintenta. Ademas, se ofrece una politica de abstencion calibrada opcional (v4-calibrated, `abstain_policy.py`) que actua como logits processor con decodificacion greedy: prohibe la respuesta de abstencion cuando el margen logit a favor de abstenerse es inferior a 1.5 en el primer token de `root_cause`, forzando al modelo a nombrar su mejor causa listada. Esta politica no modifica los pesos y solo esta disponible con transformers; las ejecuciones GGUF producen el comportamiento greedy v4 estandar. El prompt usa la chat template del checkpoint base con `enable_thinking=False`.

## Capacidades

- Diagnostico de causa raiz en incidentes de plataformas Kubernetes/GPU/base de datos a partir de sintomas y observaciones estructuradas.
- Seleccion de evidencia: identifica los ids de las observaciones que deciden la causa (`evidence_ids`).
- Abstencion fundamentada: responde `INSUFFICIENT_EVIDENCE` cuando los datos no bastan, en lugar de fabricar una causa.
- Integracion en bucles agénticos: propone la siguiente herramienta de solo lectura (`next_tool`) para recopilar mas evidencia.
- Salida estructurada: exactamente un objeto JSON compacto por llamada, con campo `confidence_state` (`RESOLVED`/`UNRESOLVED`).
- Politica de abstencion calibrada opcional en inferencia (solo transformers, con decodificacion greedy).
- Pipeline de text-generation; los tags del repo incluyen image-text-to-text, pero la model card solo documenta uso textual.
- No hay informacion sobre capacidades de codigo general, matematicas, vision, audio ni tool calling generico fuera del contrato de diagnostico descrito.

## Casos de uso

- Capa de seleccion de evidencia y abstencion en un agente de diagnostico de incidentes: el agente recopila metricas y logs con herramientas de solo lectura, las pasa al modelo y este decide la causa raiz o pide mas datos; un humano o un modelo mas potente revisa el veredicto final.
- Triaje automatizado de alertas en Kubernetes: ante una alerta (por ejemplo, degradacion de latencia p90 en un servicio), el modelo contrasta las causas candidatas del runbook con las observaciones y senala la causa demostrable con su evidencia.
- Bucles multi-paso de recoleccion de evidencia: cuando responde `INSUFFICIENT_EVIDENCE`, el agente ejecuta la herramienta nombrada (`next_tool`), anade la nueva observacion al prompt y vuelve a llamar al modelo hasta resolver o agotar opciones.
- Investigacion en abstencion de modelos pequeños y grounding de evidencia en root-cause analysis, usando el modelo como linea base reproducible.
- Punto de partida para fine-tunes propios: el adapter LoRA permite adaptar el modelo a otros runbooks o formatos de telemetria con un coste de entrenamiento reducido.
- Despliegue on-device en plataformas de operaciones: al ser un modelo pequeño derivado de una variante E4B y disponer de GGUF, puede ejecutarse cerca de la infraestructura monitorizada para reducir latencia y dependencia de APIs externas.

## Benchmarks y rendimiento

Datos publicados en la model card (Cloud-OpsBench like-for-like, mecanismos no vistos en entrenamiento):

| Modelo | Cloud-OpsBench like-for-like | Top-1 en mecanismos nunca vistos | Sobreabstencion en mecanismos no determinables |
|---|---|---|---|
| MetisRCA-E4B (greedy v4) | 0.783 | no disponible | ~15% |
| MetisRCA-E4B + politica de abstencion v4-calibrated | 0.828 | 0.824 | 9,4% |
| Qwen3.5-4B | 0.831 | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; el modelo esta evaluado especificamente para su tarea de diagnostico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repo pesa 35,7 GB y el checkpoint base es BF16 de ~8 mil millones de parametros totales; en BF16 puro cabria en una GPU de 24 GB (por ejemplo RTX 4090), y con GGUF cuantizado las necesidades serian menores, aunque las cuantizaciones concretas disponibles no estan detalladas.
- GPU recomendadas: no disponible; por tamano, una GPU consumer de 24 GB (RTX 3090/4090) o una GPU de datacenter (A100) serian opciones razonables, sin que la model card lo confirme.
- Cabe en GPU consumer: probablemente si en 24 GB con el base en BF16 o con GGUF cuantizado, dado el caracter on-device del proyecto; no confirmado por el autor.
- Opciones de despliegue: transformers + PEFT (cargando el base y aplicando el adapter del subfolder `adapter`), y GGUF (compatible con ecosistemas como llama.cpp u Ollama, aunque no se menciona explicitamente en la model card). La politica de abstencion calibrada solo funciona con transformers.
- Latencia y throughput: no disponible. La model card indica decodificacion greedy y una unica llamada por estado de diagnostico, lo que sugiere salidas muy cortas (un objeto JSON compacto).

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Cloud-OpsBench (like-for-like) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MetisRCA-E4B (ThakiCloud) | 7.996.156.490 totales (LoRA sobre Nemotron-3.5-Bolt-E4B) | Diagnostico de incidentes con abstencion | 0.783 (0.828 con politica v4) | openmdw-1.1 | HF publico, safetensors + GGUF |
| Qwen3.5-4B | no disponible | Modelo general de 4B usado como referencia en la misma tarea | 0.831 | no disponible | no disponible en la informacion proporcionada |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (base) | no disponible | Base general, sin especializacion en RCA | no disponible | no disponible | HF publico |

La comparacion directa publicada es con Qwen3.5-4B: sin politica de abstencion, MetisRCA-E4B queda por detras (0.783 frente a 0.831); con la politica v4-calibrated se acerca a una fila de diferencia (0.828 frente a 0.831), a cambio de reducir la sobreabstencion al 9,4%.

## Limitaciones y advertencias

- En mecanismos de fallo nunca vistos durante el entrenamiento, el modelo rinde por debajo de Qwen3.5-4B (0.783 frente a 0.831 en Cloud-OpsBench like-for-like).
- Sobreabstencion: en modo greedy estandar se abstiene indebidamente en torno al 15% de las filas determinables con mecanismos no vistos; la politica v4-calibrated lo reduce al 9,4% pero no lo elimina.
- La politica de abstencion calibrada solo esta disponible con transformers y decodificacion greedy; con GGUF se obtiene el comportamiento greedy v4 sin calibracion.
- Es un modelo de tarea unica: responde exclusivamente con el contrato JSON de diagnostico y no esta pensado como asistente general ni para generacion de codigo o razonamiento abierto.
- Solo documenta soporte de ingles; no hay informacion de rendimiento en otros idiomas, incluido el castellano.
- La salida debe validarse: la propia model card recomienda que un humano o un modelo mas potente revise el veredicto antes de actuar.
- Riesgo de alucinacion: el diseno fuerza a abstenerse en lugar de fabricar causas, y la model card no reporta aumento de causas fabricadas con la politica v4, pero no se publican metricas especificas de alucinacion.
- Licencia openmdw-1.1 (tipo "other"): conviene revisar el texto en https://openmdw.ai/license/1-1/ antes de un uso comercial, ya que la model card no resume sus terminos.
- Datos de descargas modestos (424 descargas, 0 likes en el momento de la ficha), lo que implica poca maduracion en produccion por parte de la comunidad.
- El tag image-text-to-text aparece en el repo, pero la model card solo documenta uso textual; no hay instrucciones para entrada de imagen.

## Enlaces

- Ficha del modelo: https://huggingface.co/ThakiCloud/MetisRCA-E4B
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Model card en coreano: https://huggingface.co/ThakiCloud/MetisRCA-E4B/blob/main/MODEL_CARD.ko.md
- No se han encontrado enlaces adicionales (paper, blog o demo) en la informacion disponible.
