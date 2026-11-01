# WeonJeong/connectailab-rl-maru-v2-teacher

## Resumen

connectailab-rl-maru-v2-teacher es un modelo de aprendizaje por refuerzo profundo (deep RL) desarrollado por WeonJeong dentro del proyecto educativo CONNECT TYCOON, impulsado por CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generativo: es una política de decisión (policy) que actúa como "cerebro" de una empresa simulada, tomando decisiones operativas durante un mes de negocio simulado de 20 días laborables. El modelo se distribuye como artefacto NumPy y se invoca a través de la librería `connect_tycoon`, no mediante APIs de generación de texto.

El modelo resuelve el problema de la toma de decisiones multiobjetivo bajo incertidumbre en un entorno tipo gymnasium: gestiona asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad, ponderando tres valores de empresa (beneficio, satisfacción del cliente y riesgo, todos con peso 1.0). Las respuestas se emiten en el formato estructurado JEV (`typesafe/jev-1.13`), lo que permite integrar la política en pipelines que consumen decisiones tipadas con probabilidades y nivel de confianza.

Su relevancia es fundamentalmente pedagógica y de investigación aplicada: demuestra un ciclo completo de imitación de un "presidente por reglas" (aprendizaje supervisado) seguido de optimización con PPO sobre recompensas derivadas de los valores de la empresa. No dispone de arquitectura transformer ni de ventana de contexto en el sentido habitual; su "entrada" es el estado del simulador y su "salida" es una distribución de probabilidad sobre acciones discretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo profundo (deep RL) con PPO; no es un transformer. El artefacto se sirve como arrays NumPy |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el estado se define por el esquema del simulador CONNECT TYCOON, no por tokens) |
| Tipos de cuantizacion | no disponible (pesos en formato NumPy; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | NumPy (librería `numpy`); consumido vía `connect_tycoon.CompanyBrain.from_hub` |

## Arquitectura y entrenamiento

La política se entrena en dos fases según la model card. Primero, un aprendizaje supervisado que imita a un "presidente por reglas" (rule-based president) que actúa como profesor; de ahí el sufijo `-teacher` del identificador. Después, un ajuste con PPO (Proximal Policy Optimization) usando como señal de recompensa los valores declarados de la empresa: beneficio, satisfacción del cliente y riesgo, todos con peso 1.0. El resultado es una política que reproduce el comportamiento del profesor pero lo corrige hacia mejores resultados agregados en el simulador.

El entorno es un simulador de empresa con configuración explícita (`warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, `order_scale: 1.0`, `staff_bonus: 0`, `wage: 0.0`, `ad_power: 1.0`, `fraud_tool: 0`, `extra_cs: 0`, `extra_refund: 0`). Las decisiones abarcan seis dominios operativos (personal, inventario, marketing, atención al cliente, reembolsos y seguridad) y se serializan en el esquema JEV con tipos de pregunta como `choice`, devolviendo la opción elegida, el vector de probabilidades y la confianza. No se documentan innovaciones de atención, decodificación especulativa ni técnicas de eficiencia de inferencia, dado que no es un modelo autorregresivo.

## Capacidades

- Toma de decisiones discretas multiobjetivo en un entorno de simulación de empresa (asignación de personal, pedidos de inventario, campañas de marketing, atención al cliente, reembolsos y seguridad).
- Emisión de respuestas estructuradas en formato JEV (`typesafe/jev-1.13`) con tipo de pregunta, opción elegida, distribución de probabilidades y confianza.
- Razonamiento bajo compensaciones explícitas entre beneficio, satisfacción y riesgo, calibrado mediante recompensa escalar.
- Integración con entornos gymnasium y con la CLI del simulador (`connect-tycoon play --brain hf:...`).
- Soporte de preguntas de tipo `choice` con criterios definidos por el llamador (por ejemplo, reembolso total, parcial, denegación o revisión humana).
- No soporta generación de texto libre, tool calling genérico, visión, audio ni razonamiento multi-paso en lenguaje natural.
- Capacidad multilingüe limitada al coreano en la documentación y ejemplos.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como ejemplo completo de imitación más PPO sobre un simulador reproducible, con notebook de Colab enlazado para que los alumnos entrenen y comparen políticas.
- Investigación en decisión multiobjetivo: permite estudiar cómo una recompensa escalar con pesos iguales entre beneficio, satisfacción y riesgo moldea el comportamiento de la política en escenarios de reembolso con señal de fraude (`fraud_score`).
- Benchmark de políticas en entornos tipo gymnasium: al exponer probabilidades por acción y confianza, se puede analizar la calibración de la política frente a la del presidente por reglas.
- Simulación de operaciones empresariales para formación: el modelo opera 20 días laborables simulados y produce métricas comparables (beneficio mensual, satisfacción, incidentes de riesgo, días de rotura de stock) útiles en talleres.
- Integración en pipelines de decisión tipada: al responder en JEV, encaja en sistemas que ya consumen ese esquema y necesitan sustituir reglas heurísticas por una política aprendida.
- Evaluación de agentes en juegos serios: la CLI `connect-tycoon play` permite enfrentar la política a humanos o a otras políticas en el simulador para estudiar comportamiento emergente.
- Prototipado de asistentes de decisión con revisión humana: la opción `human` en las preguntas de reembolso modela explícitamente el coste de escalar a una persona (0,8 unidades por caso), útil para diseñar políticas de escalado.

## Benchmarks y rendimiento

La model card reporta resultados medios sobre 40 meses no vistos, comparando la política con el presidente por reglas:

| Métrica (media 40 meses) | Presidente por reglas | connectailab-rl-maru-v2-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,68 millones de wones |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 1,7 |
| Escalados a revisión humana | 37,8 | 17,3 |
| Días de rotura de stock | 10,7 | 0,6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto es una política NumPy de tamaño no documentado, presumiblemente ejecutable en CPU.
- GPU recomendadas: no se especifican; el entrenamiento con PPO y el simulador pueden ejecutarse en CPU o en GPU consumer, pero no hay cifras publicadas.
- Cabe en GPU consumer: sí, con alta probabilidad, dado que no es un modelo de lenguaje; no se confirma en la documentación.
- Opciones de despliegue: librería `connect_tycoon` (instalación `pip install "connect-tycoon[game]"`), carga vía `CompanyBrain.from_hub`, y CLI `connect-tycoon play --brain hf:WeonJeong/connectailab-rl-maru-v2-teacher`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (políticas RL para simulación de empresa en formato JEV) en la documentación proporcionada.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-maru-v2-teacher | no disponible | no aplica | 11,68 M KRW/mes, 96 % satisfacción (40 meses) | Apache 2.0 | HuggingFace |
| Presidente por reglas (baseline interno) | no aplica | no aplica | 3,24 M KRW/mes, 79 % satisfacción | no disponible | Incluido en el simulador |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo educativo sobre un simulador sintético; la propia model card advierte que no garantiza ni predice resultados de gestión real.
- El espacio de estados y acciones está acoplado al simulador CONNECT TYCOON y a su configuración por defecto; cambios en `config` (almacén, demanda base, coste unitario, etc.) pueden degradar la política sin reentrenamiento.
- Idioma limitado al coreano en documentación y ejemplos; no hay evidencia de generalización a otros idiomas.
- Riesgo de sobreajuste al "profesor" por reglas durante la fase de imitación, mitigado parcialmente por PPO pero no cuantificado en la documentación.
- No dispone de mecanismos de abstención más allá de la opción `human` en preguntas que la incluyan; en dominios sin esa opción la política siempre elige una acción.
- Las probabilidades reportadas pueden estar mal calibradas; la confianza se expone pero no se documenta validación de calibración.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el simulador y las dependencias (`connect_tycoon`, `typesafe/jev-1.13`) pueden tener sus propias condiciones que conviene revisar.
- Sin datos de benchmarks estándar ni de robustez frente a distribuciones de estado fuera de las vistas en entrenamiento.
- El identificador del modelo en la respuesta JEV de ejemplo aparece como `connect-company/connectailab-rl-maru-v2-teacher`, distinto del ID de HuggingFace; conviene verificar la coherencia en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WeonJeong/connectailab-rl-maru-v2-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI (ezerai): https://www.ezerai.xyz
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Imagen hero del simulador: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
