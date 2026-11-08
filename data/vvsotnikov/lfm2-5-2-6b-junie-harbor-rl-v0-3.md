# vvsotnikov/LFM2.5-2.6B-junie-harbor-rl-v0.3

## Resumen

LFM2.5-2.6B-junie-harbor-rl-v0.3 es un ajuste fino mediante aprendizaje por refuerzo (GRPO) del modelo base LiquidAI/LFM2.5-2.6B, desarrollado por el usuario vvsotnikov. El objetivo es especializar el modelo para actuar como motor de un agente de codigo en linea de comandos (CLI), concretamente el harness JetBrains Junie, sobre tareas de analisis de datos. Se trata de un checkpoint intermedio (paso 80 de un presupuesto de 1000 pasos), no de un modelo final, y esta pensado como artefacto de investigacion dentro de un proceso de entrenamiento en curso.

El modelo parte de la arquitectura LFM2.5 de LiquidAI, con 2.697.198.592 parametros totales en bf16. El ajuste se realizo mediante LoRA (r=32, alpha=64, aplicado a todas las capas lineales) con el entrenador asincrono AsyncGRPOTrainer de TRL. El adaptador LoRA se fusiono en los pesos base, por lo que el repositorio contiene el modelo completo fusionado en bf16, ademas del adaptador independiente en el directorio `lora-adapter/`.

La relevancia de esta ficha radica en que documenta un caso practico de RL aplicado a agentes de codigo con tool calling, incluyendo correcciones de pipeline de captura de datos y una metodologia de curacion de tareas basada en varianza de resultados. No obstante, al ser un checkpoint intermedio con solo 80 pasos de GRPO sobre un modelo de 2.6B, las expectativas de capacidad deben ser moderadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (transformer, detalles especificos no disponibles) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 |
| Formato de pesos | safetensors (modelo fusionado bf16 + adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM2.5-2.6B, una arquitectura LFM2.5 de LiquidAI. La informacion proporcionada no detalla la composicion interna de esta arquitectura (atencion, capas, mecanismos de estado), por lo que no se puede especificar mas alla de que se trata de un modelo de generacion de texto de aproximadamente 2.6B parametros. El ajuste se realizo con aprendizaje por refuerzo utilizando GRPO asincrono (AsyncGRPOTrainer de TRL) con LoRA de rango 32, alpha 64, aplicado a todas las capas lineales. La tasa de aprendizaje fue de 1e-5, con checkpoints cada 10 pasos; este artefacto corresponde al paso 80.

El entrenamiento utilizo 4.969 tareas del dataset FineEnvs/SmolDataEnvs-harbor-train, curadas mediante un ranking por varianza de resultados medidos (priorizando tareas con mezcla de exitos y fallos, ya que los grupos de tareas con todos exitos o todos fallos producen gradiente cero). La recompensa combina la correccion del verificador de tarea mas un pequeno bono de eficiencia de herramientas (peso 0.1) sobre respuestas correctas. Se realizaron 8 rollouts por grupo de tareas, con temperatura 1.0, hasta 40 llamadas al modelo y 1800 segundos por rollout. El harness fue JetBrains Junie ejecutandose en modo headless dentro de sandboxes Docker, con captura sin perdidas de tokens de prompt, tokens muestreados y logprobs a traves de un proxy de captura validador.

Entre las innovaciones tecnicas destacan las correcciones del pipeline respecto a versiones anteriores (v0.1/v0.2): preservacion de bloques de pensamiento en el historial (`preserve_thinking`), historial de reintentos solo-anexado (tres parches de Junie), curacion del pool de tareas por varianza de resultados, y una cadena de recuperacion que permite reanudar el entrenamiento tras reinicios sin perdida de entrenamiento. La tasa de bifurcacion (fork rate) se redujo del 17-31% al 3.7-9.4% tras las correcciones.

## Capacidades

- Generacion de texto y razonamiento en el contexto de tareas de analisis de datos.
- Uso de herramientas (tool calling / function calling) como parte del flujo de un agente de codigo CLI.
- Ejecucion de tareas multi-paso mediante el harness JetBrains Junie, con hasta 40 llamadas al modelo por rollout.
- Modo de razonamiento con bloques de pensamiento (thinking blocks) preservados en el historial de conversacion.
- Capacidades de agente de codigo orientadas a tareas de analisis de datos.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Agente de analisis de datos en CLI: el modelo puede integrarse en un harness tipo Junie para resolver tareas de analisis de datos paso a paso, invocando herramientas y manteniendo el contexto de la conversacion a lo largo de multiples turnos.
- Automatizacion de tareas de codigo asistido por herramientas: dado su entrenamiento con tool calling, puede emplearse para generar y ejecutar codigo en entornos sandbox, verificando resultados mediante el propio flujo del agente.
- Investigacion en RL para agentes: sirve como artefacto de referencia para estudiar el efecto de GRPO asincrono sobre un modelo de 2.6B en tareas de agente, incluyendo la metodologia de curacion de tareas y correccion de pipeline.
- Prototipado de pipelines de agente con captura de datos: el modelo y su infraestructura asociada (captura sin perdidas, proxy validador) pueden reutilizarse como base para experimentos de RL en entornos de agente.
- Evaluacion de tecnicas de preservacion de contexto: util para investigar como la preservacion de bloques de razonamiento en el historial afecta al rendimiento en tareas multi-turno con resultados de herramientas en rol de usuario.
- Formacion y experimentacion academica: al ser un checkpoint intermedio con licencia abierta, puede usarse en entornos docentes o de investigacion para ilustrar el ciclo completo de RL sobre un modelo base pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion emparejada frente al modelo base en tareas reservadas (held-out) esta pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.697.198.592 parametros en bf16, se requieren aproximadamente 5.4 GB solo para los pesos, mas overhead de activaciones y cache KV. En cuantizacion de 8 bits, alrededor de 2.7 GB; en 4 bits, alrededor de 1.4 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el modelo deberia caber en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090, asi como en GPUs profesionales A100, H100, etc. (inferencia, no entrenamiento).
- Cabe en GPU de consumo: probablemente si, dado el tamano de 2.6B parametros, aunque no hay confirmacion oficial.
- Opciones de despliegue: no disponible. Al estar en formato safetensors y ser un modelo PEFT fusionado, podria desplegarse con frameworks compatibles con transformers (vLLM, TGI, etc.), pero no hay confirmacion del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de la misma categoria. Como referencia, el modelo base es LiquidAI/LFM2.5-2.6B, y la version anterior del mismo ajuste es vvsotnikov/LFM2.5-2.6B-junie-harbor-rl-v0.1 (checkpoint paso 20). No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento sigue en curso (paso 80 de 1000). No es un modelo final ni un agente de produccion.
- Capacidad modesta: con 2.6B parametros y solo 80 pasos de GRPO, se espera un movimiento de capacidad limitado, no una mejora sustancial sobre el modelo base.
- Dominio restringido: el pool de entrenamiento son tareas de analisis de datos; la transferencia a otros dominios no ha sido probada.
- Evaluacion pendiente: no hay evaluacion emparejada frente al modelo base en tareas reservadas.
- Problemas residuales conocidos: ordenacion de reproduccion de llamadas paralelas a herramientas, re-renderizado del mensaje final y descarte raro de historial en fallos de accion; estan identificados con evidencia y en cola para la siguiente build de Junie.
- Licencia: lfm-open-license-v1.0 (licencia "other"). Se deben revisar los terminos de la licencia LFM Open License v1.0 para uso comercial; no se detallan restricciones especificas en la informacion proporcionada.
- Idiomas soportados: no disponibles, lo que impide garantizar cobertura multilingue.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vvsotnikov/LFM2.5-2.6B-junie-harbor-rl-v0.3
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Version anterior v0.1: https://huggingface.co/vvsotnikov/LFM2.5-2.6B-junie-harbor-rl-v0.1
- Dataset de entrenamiento: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- JetBrains Junie: https://www.jetbrains.com/junie/
