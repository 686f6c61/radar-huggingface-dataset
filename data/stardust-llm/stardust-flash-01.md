# Stardust-LLM/Stardust-Flash-01

## Resumen

Stardust Flash-01 es un modelo de pesos abiertos especializado en investigación de seguridad informática, desarrollado por STARDUST Labs. Se trata de un ajuste fino sobre GLM-5.3-Flash, un modelo base Mixture-of-Experts de 320 mil millones de parámetros totales (18 mil millones activos), entrenado con GRPO (Group Relative Policy Optimization) sobre vulnerabilidades reales de un dataset privado del propio equipo.

El problema que aborda es la falta de modelos abiertos optimizados para tareas de ciberseguridad ofensiva y defensiva autorizadas: revisión de código en busca de vulnerabilidades, análisis estático, revisión de smart contracts y detección de amenazas. Su propuesta de diseño es actuar como "worker" enfocado dentro de un pipeline agéntico, donde un modelo orquestador más grande le asigna tareas acotadas y Flash-01 lee código, usa herramientas y verifica hallazgos.

Es relevante porque combina una ventana de contexto de 1 millón de tokens (útil para auditar repositorios completos) con una licencia MIT que permite uso comercial y despliegue interno, algo valioso para equipos de seguridad que necesitan ejecutar modelos dentro de sus propios entornos aislados. El repositorio pesa 642,7 GB en safetensors y los pesos suman 321.323.031.390 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer |
| Parametros totales | 321.323.031.390 (~320B) |
| Parametros activos | ~18B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (el modelo base GLM-5.3-Flash tiene su propia licencia) |
| Formato de pesos | safetensors (642,7 GB de repo) |

## Arquitectura y entrenamiento

Flash-01 parte de GLM-5.3-Flash, un modelo MoE con 320B de parametros totales y 18B activos por token. El post-entrenamiento combina LoRA de rango 256 aplicado sobre todos los expertos y routers con actualizaciones de parametros completos sobre 16 expertos seleccionados por activacion. Los autores reportan que actualizar todos los parametros de todos los expertos provocaba el colapso del modelo, atribuido al tamano reducido del dataset de RL, lo que justifica este enfoque hibrido.

El entrenamiento por refuerzo uso GRPO sobre 150 tareas construidas a partir de 50 casos reales de vulnerabilidades del dataset privado de STARDUST Labs. Cada caso se presenta en tres vistas con distinto nivel de informacion: guided whitebox, focused whitebox y focused blackbox. La dificultad de las tareas se ajusta dinamicamente a la capacidad actual del modelo, de modo que cada grupo de entrenamiento contiene tanto aciertos como fallos y GRPO recibe senal util. El modelo base es image-text-to-text segun los tags del repositorio, lo que sugiere capacidad multimodal heredada, aunque la model card no documenta su uso.

## Capacidades

- Analisis de codigo y revision estatica de repositorios en busca de vulnerabilidades (input validation, configuraciones inseguras, etc.)
- Uso de herramientas (tool use) en pipelines agenticos: explora, prueba hipotesis y confirma hallazgos de forma autonoma dentro de una tarea acotada
- Diseno orientado a agentes: rol de "worker" supervisado por un modelo orquestador que le asigna tareas concretas
- Revision de smart contracts en testnets o despliegues propios
- Ingenieria de deteccion (detection engineering), guias de remediacion y planes de hardening
- Ventana de contexto de 1M tokens, adecuada para analizar bases de codigo grandes de una sola pasada
- Generacion de texto conversacional (pipeline text-generation), aunque rendimiento degradado como asistente generalista por su especializacion
- Posible capacidad image-text-to-text heredada del modelo base, no documentada en la model card

## Casos de uso

- Revision de seguridad de codigo propio: un equipo de desarrollo integra Flash-01 en su CI/CD para analizar pull requests en busca de vulnerabilidades de validacion de entrada antes de fusionar, aprovechando su contexto de 1M tokens para procesar diffs extensos con su dependencia completa.
- Auditoria de smart contracts: analisis de contratos desplegados en testnets o propios, identificando patrones de reentrancia, control de acceso deficiente o errores aritmeticos antes del despliegue en mainnet.
- Worker en pipelines de pentesting autorizado: un modelo orquestador divide una auditoria con permiso escrito en tareas acotadas (reconocimiento de un modulo, analisis de un endpoint) y Flash-01 ejecuta cada una con acceso a herramientas en un sandbox aislado.
- Ingenieria de deteccion: generacion de reglas de deteccion, consultas SIEM y planes de hardening a partir de configuraciones y logs del sistema, dentro de un SOC.
- Analisis forense de configuraciones: revision de ficheros de configuracion de infraestructura para resumir riesgos de seguridad y proponer correcciones concretas.
- Triaje de hallazgos en bug bounty: pre-analisis de posibles vulnerabilidades dentro del scope de un programa, con revision humana obligatoria antes de la divulgacion responsable.
- Formacion de equipos de seguridad: generacion de ejemplos anotados de codigo vulnerable y corregido para entrenar a analistas junior en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas comparativas (MMLU, HumanEval, GSM8K ni benchmarks especificos de seguridad como CyberSecEval), por lo que no es posible evaluar cuantitativamente su rendimiento frente a alternativas con los datos actuales.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16, ~321B de parametros, 642,7 GB de pesos): aproximadamente 650-700 GB de VRAM, es decir, un nodo multi-GPU de gama datacenter.
- Con 18B de parametros activos, el throughput por token es comparable al de un modelo denso de ~18B, pero la memoria total debe alojar todos los expertos.
- GPU recomendadas: 8x H100 80GB (640 GB) o 8x A100 80GB con offload, en configuracion tensor-parallel; el propio ejemplo de la model card usa `--tensor-parallel-size 8` en vLLM.
- No cabe en GPUs de consumo (RTX 4090, RTX 5090) en precision completa; no hay cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ), por lo que la viabilidad en consumer hardware es no disponible.
- Despliegue soportado: vLLM (servidor compatible con OpenAI, documentado en la model card con `--trust-remote-code`) y Transformers; compatibilidad con llama.cpp, Ollama o TGI no disponible.
- Alternativa sin hardware propio: API de Stardust (`stardust/flash-01`) con endpoint `/v1/chat/completions` compatible con OpenAI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| | Stardust Flash-01 | GLM-5.3-Flash (base) | Qwen3-Coder / modelos de codigo abiertos comparables |
|---|---|---|---|
| Parametros totales | ~320B | ~320B | no disponible |
| Parametros activos | ~18B | ~18B | no disponible |
| Contexto | 1M tokens | no disponible | no disponible |
| Especializacion | Seguridad informatica | Generalista | Codigo general |
| Post-training | LoRA r-256 + full-param selectivo, GRPO | no disponible | no disponible |
| Licencia | MIT | propia del modelo base | variable |
| Datos de benchmarks | no disponibles | no disponibles | no disponibles |

Nota: al no haber datos publicados de benchmarks ni fichas tecnicas completas de los comparables, la comparacion se limita a parametros, arquitectura y licencia. La propuesta diferencial de Flash-01 frente a modelos generalistas de codigo es su ajuste fino especifico en tareas de seguridad y su diseno como worker agentico.

## Limitaciones y advertencias

- Especializacion estrecha por diseno: rinde peor como asistente de chat generalista; su uso previsto es tareas de seguridad acotadas.
- Dataset de entrenamiento pequeno (150 tareas de 50 casos): se esperan lagunas en clases de vulnerabilidades poco representadas o ausentes en el entrenamiento.
- Riesgo de falsos positivos y de omision de vulnerabilidades reales: todo hallazgo debe ser verificado por un humano antes de actuar.
- Uso dual: al ser una herramienta de seguridad, puede emplearse indebidamente contra sistemas ajenos; la licencia y la model card exigen autorizacion explicita, respeto del scope de engagement y divulgacion responsable.
- No sustituye a expertos: esta pensado para acelerar equipos de seguridad cualificados, no para reemplazarlos.
- No debe usarse sin supervision contra sistemas de produccion.
- Solo documentado en ingles; rendimiento en otros idiomas no disponible.
- Requiere `trust_remote_code=True` en Transformers y vLLM, lo que implica ejecutar codigo del repositorio: revisar el codigo remoto antes de usarlo en entornos sensibles.
- El uso del modelo base GLM-5.3-Flash esta sujeto a su propia licencia, ademas de la MIT del ajuste.
- El identificador del modelo base aparece como "TODO/GLM-5.3-Flash" en los metadatos, lo que sugiere que parte de la documentacion del repositorio esta incompleta.

## Enlaces

- HuggingFace: https://huggingface.co/Stardust-LLM/Stardust-Flash-01
- Website de STARDUST Labs: https://stardustllm.xyz/
- API de Stardust: https://stardustllm.xyz/#developers
- Paper de GRPO (referenciado en la model card): https://arxiv.org/html/2402.03300v3#S4.SS1.SSS2
- Contacto de seguridad: security@stardust.llm
