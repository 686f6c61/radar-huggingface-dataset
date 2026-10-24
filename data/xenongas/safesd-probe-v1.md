# XenonGas/SafeSD-probe-v1

## Resumen

SafeSD-probe-v1 es un checkpoint de sonda (probe) de seguridad publicado por XenonGas (Jiachen Liu) sobre un backbone causal Qwen3-0.6B, al que se añade una cabeza MLP clasificadora de tokens (1024 → 512 → 1, activación GELU). No es un modelo generativo de propósito general: es el componente de detección de inyección de prompts del sistema SafeSD, un servicio de generación auditada que lo ejecuta junto al modelo base para marcar comportamiento dirigido por objetivos, incluidas llamadas a herramientas intentadas.

El checkpoint corresponde a un entrenamiento de 1800 pasos y consume el historial visible completo más los tokens generados mediante la codificación de entrada de "evidencia citada" (quoted-evidence) de SafeSD. La versión publicada usa la codificación `event`, un umbral de probabilidad de alarma de 0,5 y longitud consecutiva de 1. Es relevante porque aborda un problema concreto y poco cubierto: la detección de inyección de prompts dentro de pipelines de decodificación especulativa y de agentes que ejecutan herramientas, con un coste computacional muy bajo (~0,6 B de parámetros) que permite ejecutarlo en paralelo al modelo principal.

El autor reporta una evaluación sobre salidas guardadas del conjunto AgentLAB Task Injection: 2 fallos y 24 falsos positivos sobre 1450 rondas de ejecución, y 1 fallo y 10 falsos positivos sobre 949 pares de tareas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia propia más allá del texto upstream conservado en `UPSTREAM_LICENSE`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer causal Qwen3-0.6B + cabeza MLP token-classifier (1024 → 512 → 1, GELU) |
| Parametros totales | ~0,6 mil millones (backbone) + ~0,5 M (cabeza); tamano del repo 1,2 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende de la configuracion del backbone Qwen3-0.6B) |
| Tipos de cuantizacion | no disponible; se distribuye como state dict PyTorch (`probe.pt`) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible; el repositorio conserva el texto upstream en `UPSTREAM_LICENSE` |
| Formato de pesos | PyTorch state dict (`probe.pt`) + metadatos (`probe.meta.json`) |
| Codificacion de entrada | `event` (quoted-evidence de SafeSD) |
| Umbral de alarma por defecto | 0,5 |
| Longitud consecutiva | 1 |
| Pasos de entrenamiento | 1800 |

## Arquitectura y entrenamiento

La arquitectura es un clasificador a nivel de token construido sobre un transformer causal Qwen3-0.6B. El backbone procesa el historial visible y los tokens generados con la codificación de evidencia citada de SafeSD, y una cabeza MLP de dos capas (1024 → 512 → 1, GELU) produce una probabilidad de alarma por token. El checkpoint contiene dos state dicts, `backbone` y `head`, que se cargan mediante el loader de sondas de SafeSD; la inferencia reutiliza el tokenizador y la configuración del backbone Qwen3-0.6B. Se entrenó durante 1800 pasos.

No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens vistos, ni si se aplicaron fases de RLHF o DPO (no procede en un clasificador, pero no se documenta el esquema de etiquetado supervisado). El autor indica que los datos de entrenamiento y las respuestas de evaluación guardadas se mantienen por separado del repositorio. La innovación destacable no está en el backbone, sino en el punto de integración: la sonda observa el flujo de tokens durante la generación auditada y se ejecuta como proceso independiente, en la misma GPU o en otra distinta (`--device cuda:0 --probe-device cuda:1`), lo que permite acoplarla a un pipeline de decodificación especulativa sin bloquear el modelo principal.

## Capacidades

- Clasificación a nivel de token de comportamiento relacionado con objetivos en la generación, incluidas llamadas a herramientas intentadas que fallan o se sobrescriben después.
- Detección de inyección de prompts sobre el historial visible completo, no solo sobre el último turno, gracias a la codificación de evidencia citada.
- Distinción entre mención y adhesión (endorsement) en objetivos expresados en texto.
- Integración con SafeSD como servicio de generación auditada (`scripts/benchsets.py serve`, grupo `silent`).
- Observación de tokens generados en streaming, compatible con escenarios de decodificación especulativa.
- Ejecución separada del modelo principal (proceso y dispositivo configurables), lo que permite aislar el coste de la sonda.
- No genera texto, no soporta tool calling propio, no razona de forma multi-paso y no tiene capacidades multimodales: es exclusivamente un clasificador binario de alarma.
- Soporte multilingüe limitado al inglés, según el campo `language` del repositorio.

## Casos de uso

- Monitorización de agentes con herramientas: la sonda consume el historial completo y los tokens generados para marcar llamadas a herramientas que persiguen objetivos inyectados, con un umbral de alarma de 0,5 ajustable en el servicio SafeSD.
- Defensa frente a inyección indirecta de prompts: al observar todo el contexto visible (documentos recuperados, resultados de herramientas, historial), puede detectar instrucciones maliciosas incrustadas antes de que el agente las ejecute.
- Generación auditada en producción: desplegada junto al modelo principal en SafeSD, permite registrar y bloquear generaciones con alta probabilidad de alarma sin modificar el modelo servido.
- Aislamiento de recursos en despliegues multi-GPU: el ejemplo del autor coloca el backbone en `cuda:0` y la sonda en `cuda:1`; en una sola GPU se ejecuta la sonda en un proceso separado, lo que facilita limitar su impacto en la latencia del modelo principal.
- Evaluación y red teaming de sistemas de agentes: sirve como oráculo automático sobre salidas guardadas (rondas de ejecución y pares de tareas) para medir si un cambio de prompt o de política de herramientas aumenta la tasa de comportamiento comprometido.
- Filtro de bajo coste en pipelines de decodificación especulativa: con ~0,6 B de parámetros, puede evaluar cada token candidato sin dominar el presupuesto de cómputo del pipeline.
- Investigación en seguridad de LLM: checkpoint reproducible con pasos de entrenamiento, codificación de entrada, umbral y resultados de evaluación documentados, útil como línea base para comparar sondas de detección de inyección.

## Benchmarks y rendimiento

El autor publica resultados sobre salidas guardadas del conjunto AgentLAB Task Injection (no sobre benchmarks estándar como MMLU, HumanEval o GSM8K, para los que no hay datos disponibles). Las etiquetas miden comportamiento ejecutado relacionado con objetivos; los positivos y negativos de la tabla son los recuentos de referencia del conjunto, y las métricas derivadas se han calculado a partir de ellos.

| Ambito | Positivos | Negativos | Fallos (FN) | Falsos positivos (FP) | Precision | Recall | Especificidad | Exactitud | F1 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1450 rondas de ejecucion | 877 | 573 | 2 | 24 | 97,33 % | 99,77 % | 95,81 % | 98,21 % | 98,54 % |
| 949 pares de tareas | 707 | 242 | 1 | 10 | 98,60 % | 99,86 % | 95,87 % | 98,84 % | 99,23 % |

No se han publicado resultados en la información disponible sobre latencia, throughput, robustez frente a ataques adaptativos ni comparación con otros detectores bajo el mismo protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada: ~1,2-1,5 GB para el backbone de 0,6 B en bf16/fp16 (el repositorio ocupa 1,2 GB), más el overhead del runtime de SafeSD y del proceso de servicio. Cifra estimada a partir del tamaño del repo, no confirmada por el autor.
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más (RTX 3050, 4060, 3060 12 GB, etc.), al ser un modelo de 0,6 B.
- GPU recomendadas: no hay recomendaciones explícitas del autor. El ejemplo oficial usa dos dispositivos (`--device cuda:0 --probe-device cuda:1`), por lo que un despliegue cómodo es una máquina con dos GPU (por ejemplo, dos A100, L40S o RTX 4090) aunque también funciona en una sola GPU con la sonda en un proceso aparte.
- Opciones de despliegue: runtime propio de SafeSD (`python scripts/benchsets.py serve --group silent --device cuda:0 --probe-device cuda:1 --ckpt checkpoints/SafeSD-probe-v1/probe.pt`), con PyTorch como única librería declarada. No hay pipeline de HuggingFace, ni soporte documentado de vLLM, llama.cpp, Ollama o TGI; el checkpoint no es un modelo causal estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SafeSD-probe-v1 | Sonda clasificadora de inyeccion de prompts sobre backbone causal | ~0,6 B + ~0,5 M | no disponible | no disponible (upstream en `UPSTREAM_LICENSE`) | HuggingFace, requiere SafeSD |
| Qwen/Qwen3-0.6B | Modelo causal generativo (modelo base) | ~0,6 B | no disponible en la informacion proporcionada | upstream conservada en `UPSTREAM_LICENSE` | HuggingFace |
| Clasificadores de seguridad dedicados (familias Llama Guard, Qwen3Guard, detectores tipo DeBERTa para inyeccion de prompts) | Clasificacion de seguridad / inyeccion | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificados de parámetros, contexto, rendimiento o licencia de las alternativas, por lo que no se incluye una comparación cuantitativa. La comparación directa tampoco es trivial: SafeSD-probe-v1 está diseñado para operar dentro de SafeSD sobre el flujo de tokens de un backbone concreto, no como clasificador autónomo de texto.

## Limitaciones y advertencias

- Solo inglés: el campo `language` del repositorio declara únicamente `en`, y no hay información sobre rendimiento en otros idiomas.
- No es un modelo generativo: no puede usarse como chat, ni para tool calling, ni para razonamiento; requiere el runtime de SafeSD y los ficheros `probe.pt` y `probe.meta.json` juntos para seleccionar la codificación de entrada correcta.
- Evaluación limitada a un único conjunto guardado (AgentLAB Task Injection): los resultados de 2 fallos y 24 falsos positivos sobre 1450 rondas no garantizan generalización a otros dominios, idiomas o formatos de inyección.
- Umbral fijo por defecto de 0,5 y longitud consecutiva de 1: no se documenta el efecto de ajustar estos parámetros ni curvas de precisión-recall.
- Los 24 falsos positivos sobre 1450 rondas implican un riesgo real de bloqueo de comportamiento legítimo en producción; conviene calibrar el umbral con datos propios.
- Sin datos sobre robustez frente a ataques adaptativos (evasión mediante reformulación, ofuscación o codificación), un vector habitual contra clasificadores de prompt injection.
- Licencia no declarada de forma explícita para el checkpoint: antes de un uso comercial hay que revisar el fichero `UPSTREAM_LICENSE` y la licencia del modelo base Qwen3-0.6B, y aclarar la del propio peso de la sonda con el autor.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica a la generación (no genera texto), pero sí existe riesgo de clasificación errónea; el autor distingue explícitamente entre mención y adhesión a un objetivo, lo que sugiere sensibilidad al contexto en el etiquetado.
- Madurez: 0 descargas y 0 likes, publicación de octubre de 2026 y sin validación comunitaria; tratar como artefacto de investigación.
- El repositorio incluye los pesos del backbone, lo que implica arrastrar las obligaciones de licencia del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XenonGas/SafeSD-probe-v1
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio SafeSD: https://github.com/flowermouse/SafeSD
- Perfil del autor en HuggingFace (XenonGas / Jiachen Liu): https://huggingface.co/XenonGas
- Agent Safe Probe X (framework de evaluacion de seguridad de agentes): https://github.com/Mengmeara/agent-safe-probe-x
- Lista de modelos de seguridad ofensiva en modelos abiertos: https://github.com/JoasASantos/Offensive-Security-AI-Models
- XenonAI, pagina de investigacion: https://www.xenonai.com/research
