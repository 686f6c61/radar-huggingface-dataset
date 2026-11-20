# w3joe/OmniSRE

## Resumen

OmniSRE es un adaptador LoRA de rango 64 sobre el modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario w3joe, orientado especificamente a tareas de site reliability engineering (SRE). El modelo se presenta como un agente capaz de realizar triaje de incidentes, localizacion de fallos, analisis de causa raiz y remediacion, siguiendo un principio de diseno explicito de "leer antes de escribir" (read-before-write), es decir, que el agente inspecciona el estado del sistema antes de ejecutar cualquier accion correctiva. Resuelve el problema de automatizar la respuesta a incidentes en entornos Kubernetes y DevOps mediante un bucle agentico con uso de herramientas.

El adaptador se publica bajo licencia Apache 2.0, con un tamano de repositorio de 1.9 GB y 466,9 millones de parametros entrenables (1,68% del total del modelo base). La version publicada es `v0.1-draft`, lo que indica que se trata de una revision preliminar. El modelo hereda del base una arquitectura hibrida con 64 capas y una ventana de contexto de 262K tokens, lo que resulta relevante para el analisis de trazas de incidentes y logs extensos.

La relevancia actual del modelo radica en su enfoque especializado: en lugar de un modelo generalista, se entrena sobre trazas reales de respuesta a incidentes y runbooks de operaciones, con un pipeline de entrenamiento en dos fases y un plan posterior de RLVR (reinforcement learning with verifiable rewards) mediante DAPO y GTPO. Esto lo posiciona como una propuesta concreta para equipos que quieran evaluar agentes especializados en operaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=64) sobre transformer hibrido del base: 64 capas, proporcion 3:1 Gated DeltaNet / Gated Attention |
| Parametros totales | 466,9M entrenables en el adaptador (1,68% del base); total del base no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262K tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el autor menciona servicio en FP8, pero no se listan formatos de cuantizacion publicados) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.8-27B |
| Libreria | peft |
| Tamano del repositorio | 1,9 GB |
| Version | v0.1-draft |
| Fecha de creacion | 2026-11-20 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B, un modelo base con 64 capas que combina Gated DeltaNet y Gated Attention en una proporcion 3:1, lo que constituye una arquitectura hibrida orientada a contextos largos (262K tokens). El LoRA de rango 64 se inserta en todas las proyecciones lineales, con 466,9M parametros entrenables. Durante el entrenamiento se congelan la torre de vision y la cabeza MTP (multi-token prediction) del modelo base.

El entrenamiento se estructura en dos fases documentadas. La fase 1a utiliza 5.038 trazas reales de SRE durante 157 pasos, con una perdida que desciende de 3,34 a 0,175. La fase 1b emplea 1.559 trazas con esquema exacto durante 98 pasos, alcanzando una perdida de 0,057 y un 98,5% de precision por token. El pipeline completo se ejecuto en 4 x H100 en BF16. Como siguiente paso, el autor planifica RLVR (read-before-write) con DAPO y GTPO, aunque esta fase no esta reflejada en los pesos publicados. Las fuentes de datos incluyen conjuntos de trazas de respuesta a incidentes, razonamiento DevOps, alertas de Prometheus, runbooks de OpenShift y prometheus-operator, SREGym y post-mortems de danluu.

## Capacidades

- Triaje de incidentes: identificacion y clasificacion de fallos en entornos de operaciones.
- Localizacion de fallos y analisis de causa raiz a partir de trazas y logs.
- Remediacion guiada por el principio read-before-write: inspecciona el estado antes de actuar.
- Uso de herramientas (tool calling) dentro de un bucle agentico de multiples pasos.
- Razonamiento multi-step orientado a diagnostico de sistemas.
- Capacidades de vision heredadas del modelo base (torre de vision congelada, no entrenada en el adaptador).
- Soporte de contexto largo (262K tokens) para analisis de trazas extensas.
- Idiomas: unicamente ingles segun la model card.

## Casos de uso

- Triaje automatico de alertas de Prometheus: el modelo puede recibir alertas y trazas de oncall para clasificar la severidad y proponer un primer diagnostico, apoyandose en el corpus de alertas y runbooks con el que fue entrenado.
- Analisis de causa raiz en Kubernetes: dado un conjunto de logs y eventos de cluster, el agente puede recorrer el bucle de inspeccion para localizar el componente fallido antes de proponer cambios.
- Asistente de guardia (on-call): integrado en un chat operativo, gestiona conversaciones multi-turno con contexto largo (262K tokens) para acompanar al ingeniero durante la resolucion de un incidente.
- Automatizacion de remediacion supervisada: el principio read-before-write permite desplegarlo en pipelines donde las acciones correctivas requieren verificacion previa del estado del sistema.
- Generacion de post-mortems: a partir de trazas de incidentes, el modelo puede estructurar cronologias y analisis, dado que se entreno con conjuntos de post-mortems reales.
- Integracion en plataformas AIOps: como componente de razonamiento en pipelines de observabilidad que requieran tool calling sobre APIs de infraestructura.
- Evaluacion de runbooks: el modelo puede contrastar procedimientos operativos con trazas reales para detectar pasos obsoletos o incompletos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de entrenamiento (perdida y precision por token), no evaluaciones estandar como MMLU, HumanEval o GSM8K.

| Metrica de entrenamiento | Valor |
|---|---|
| Fase 1a: pasos | 157 |
| Fase 1a: perdida | 3,34 → 0,175 |
| Fase 1b: pasos | 98 |
| Fase 1b: perdida | 0,057 |
| Fase 1b: precision por token | 98,5% |

## Requisitos de hardware

- Entrenamiento: 4 x H100 en BF16 (segun el autor).
- Servicio: 1 x H100 o 1 x L40S en FP8 (recomendacion del autor).
- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre un base de 27B, el requisito de VRAM lo determina el modelo base y la cuantizacion empleada.
- GPU consumer: no disponible; no se documenta si el base de 27B cabe en GPU de consumo con cuantizacion.
- Opciones de despliegue: el quickstart oficial usa transformers + peft; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (agentes SRE especializados) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Version preliminar: se publica como `v0.1-draft`, sin fase de RLVR completada; el autor la describe como siguiente paso.
- Solo ingles: la model card declara unicamente el idioma `en`, lo que limita su uso en entornos en castellano sin evaluacion adicional.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas estandar ni en tareas SRE fuera de las metricas de entrenamiento.
- Riesgo de alucinacion: como modelo generativo, puede proponer acciones o diagnosticos incorrectos; el principio read-before-write mitiga pero no elimina este riesgo.
- Dependencia del modelo base: requiere descargar y ejecutar Qwen/Qwen3.8-27B, con el coste de hardware asociado.
- Datos de entrenamiento de terceros: las fuentes incluyen conjuntos con licencias variadas (Apache-2.0, CC-BY-4.0, MIT); conviene verificar la compatibilidad para uso comercial.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Capacidades de vision no entrenadas: la torre de vision se congela durante el entrenamiento, por lo que no se especializa en tareas SRE visuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/w3joe/OmniSRE
- Codigo y pipeline de entrenamiento: https://github.com/w3joe/qwen38-sre-rl
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset `rmems/incident-response-oncall-trajectories`: https://huggingface.co/datasets/rmems/incident-response-oncall-trajectories
- Dataset `beatsprom/devops-kubernetes-iac-sft-dpo-2026`: https://huggingface.co/datasets/beatsprom/devops-kubernetes-iac-sft-dpo-2026
- Runbooks de OpenShift: https://github.com/openshift/runbooks
- Runbooks de prometheus-operator: https://github.com/prometheus-operator/runbooks
- SREGym: https://github.com/SREGym/SREGym
- Alertas de awesome-prometheus-alerts: https://github.com/samber/awesome-prometheus-alerts
