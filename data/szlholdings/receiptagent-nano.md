# SZLHOLDINGS/ReceiptAgent-Nano

## Resumen

ReceiptAgent-Nano es un artefacto publicado por SZL Holdings que no constituye un modelo de lenguaje grande, sino un componente de gobernanza para sistemas de IA agéntica. Según su model card, se trata de una "silhouette" de pocos miles de floats entrenada con numpy, que actúa como clasificador asesor de una puerta de decisión de cuatro vías (ALLOW, WARN, BLOCKED, ESCALATE). El kernel de reglas (`rule_check` / `deny_by_default`) es la fuente de verdad; el modelo solo propone y nunca ejecuta ni anula la decisión del kernel.

El modelo forma parte del proyecto szl-khipu, cuyo objetivo es construir un "gate" formalmente verificado para controlar las acciones de agentes de IA. ReceiptAgent-Nano se presenta explícitamente como un componente de investigación y propuesta, no como un sustituto del kernel ni como un sistema autónomo. La model card insiste en que no es un LLM de 1.5B, no es Qwen, no usa CUDA y no tiene capacidades de ejecución de herramientas.

La relevancia de este artefacto radica en su enfoque de "seguridad por diseño": separar la decisión de gobernanza (kernel) de la aproximación estadística (MLP), manteniendo una política de denegación por defecto. Es un ejemplo de cómo integrar capas de control formal en sistemas agénticos, aunque su utilidad práctica fuera de ese contexto específico es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP silhouette (numpy) |
| Parametros totales | no disponible (pocos miles de floats segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en numpy, no cuantizados) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | numpy (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

La informacion disponible indica que ReceiptAgent-Nano es un "silhouette" entrenado con numpy, es decir, una red neuronal pequeña (probablemente un MLP) que aproxima la salida de un kernel de reglas. El kernel `rule_check` y `deny_by_default` implementan una logica determinista de cuatro etiquetas (ALLOW, WARN, BLOCKED, ESCALATE) basada en condiciones explicitas. El MLP se entrena para imitar esa decision, pero nunca la reemplaza: la funcion `decide()` siempre devuelve la etiqueta del kernel.

No se especifican detalles del dataset de entrenamiento, numero de epochs, funcion de perdida ni arquitectura exacta. La model card menciona que el entrenamiento se realiza con una semilla (`seed=20260721`) y que el resultado es un conjunto de pesos de "pocos miles de floats". No hay informacion sobre tecnicas como RLHF, DPO o decodificacion especulativa, ya que no es un modelo generativo.

## Capacidades

- Clasificacion de decisiones en cuatro categorias: ALLOW, WARN, BLOCKED, ESCALATE.
- Funciona como asesor del kernel de reglas: propone una etiqueta pero no la impone.
- Integracion con el sistema de gobernanza szl-khipu mediante la funcion `receipt_agent.train()`.
- Ejecucion en CPU con numpy (sin dependencia de CUDA).
- Politica de denegacion por defecto: el kernel aplica `deny_by_default` como fallo seguro.
- No es un modelo de lenguaje: no genera texto, no razona, no procesa lenguaje natural.
- No soporta tool calling, agentes ni multi-step reasoning.
- No tiene capacidades multimodales (vision, audio, etc.).

## Casos de uso

- Control de permisos en sistemas agénticos: como capa de asesoramiento para decidir si una accion propuesta por un agente debe ser permitida, advertida, bloqueada o escalada, siempre bajo la autoridad del kernel.
- Auditoria y trazabilidad de decisiones: al ser un clasificador deterministico aproximado, puede servir para generar registros de decisiones y comparar con el kernel en entornos de prueba.
- Entrenamiento y validacion de politicas de gobernanza: permite experimentar con diferentes pesos del MLP para estudiar como se comporta la aproximacion frente al kernel, sin afectar la seguridad real.
- Despliegue en entornos sin GPU: al ser un modelo numpy de pocos miles de floats, puede ejecutarse en cualquier maquina con Python, incluso en dispositivos embebidos o servidores minimos.
- Investigacion sobre "silhouette" y aproximacion de kernels: util para academicos o desarrolladores interesados en tecnicas de destilacion de reglas en redes pequenas.
- Integracion en pipelines de MCP (Model Context Protocol) como componente de decision auxiliar, segun la documentacion de SZL Holdings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no proporciona metricas de precision, recall, F1 ni comparaciones con otros modelos. El unico dato de rendimiento mencionado es que el kernel gana siempre (`kernel_wins = 1.0`), lo cual es esperable porque el kernel es la fuente de verdad y el MLP no decide.

## Requisitos de hardware

- Ejecucion en CPU sin GPU: el modelo usa numpy y no requiere CUDA.
- VRAM: 0 GB (no usa GPU).
- RAM: minima (menos de 100 MB para cargar los pesos y ejecutar la inferencia).
- GPU recomendada: ninguna.
- Opciones de despliegue: cualquier entorno con Python y numpy; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia: despreciable (inferencia de un MLP de pocos miles de floats en microsegundos o menos).
- Throughput: no aplicable en el sentido tradicional; puede ejecutarse millones de veces por segundo en CPU.

## Comparativa con modelos similares

No hay modelos comparables conocidos en el ecosistema de HuggingFace, ya que ReceiptAgent-Nano no es un LLM ni un modelo generativo. Su funcion se asemeja a un clasificador de politicas de seguridad, pero no existe una categoria estandar para comparar. La model card menciona otros artefactos de SZL Holdings (SZL-Forge-1.5B-ReceiptAgent, szl-receiptagent-qwen35-0.8b-v2) pero los descarta explícitamente como no equivalentes a este artefacto. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona ni entiende lenguaje natural.
- No es autonomo: nunca ejecuta acciones ni toma decisiones finales; depende del kernel.
- No sustituye al kernel de reglas: el MLP es solo una aproximacion asesora y no tiene autoridad real.
- `proven_trust` es falso: no hay garantia formal de que el modelo sea correcto o seguro.
- No tiene capacidades de tool calling ni de agentes.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no ofrece ninguna funcionalidad util fuera del ecosistema szl-khipu.
- La model card advierte que no es un reemplazo de HARD_SECURITY ni de medidas de seguridad reales.
- No hay informacion sobre sesgos, alucinaciones (no aplica) ni limitaciones de contexto (no aplica).
- El tamaño del repo es 0.0 GB, lo que sugiere que el modelo puede no estar realmente publicado o que los pesos se generan en tiempo de ejecucion con `receipt_agent.train()`. Esto debe verificarse antes de considerar su uso.

## Enlaces

- HuggingFace: https://huggingface.co/SZLHOLDINGS/ReceiptAgent-Nano
- Repositorio canonico: https://github.com/szl-holdings/szl-khipu
- Sibling card: https://huggingface.co/SZLHOLDINGS/szl-khipu
- Repositorio szl-forge (contiene el runbook de ReceiptAgent): https://github.com/szl-holdings/szl-forge/tree/main/receiptagent
- Runbook de ReceiptAgent: https://github.com/szl-holdings/szl-forge/blob/main/receiptagent/RUNBOOK-RECEIPTAGENT.md
- Developer Hub de SZL Holdings: https://holdings.a-11-oy.com/docs-site/developers/
