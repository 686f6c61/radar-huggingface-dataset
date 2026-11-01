# WeonJeong/connectailab-rl-maru-v1-teacher

## Resumen

connectailab-rl-maru-v1-teacher es una política de aprendizaje por refuerzo desarrollada por WeonJeong (CONNECT AI LAB) para la toma de decisiones empresariales dentro del simulador CONNECT TYCOON. No es un modelo de lenguaje: se trata de un agente entrenado con PPO que actúa como "cerebro" (denominado metafóricamente "corteza prefrontal") de una empresa simulada durante un mes de operaciones (20 días laborables), tomando decisiones sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad.

El modelo recibe el estado de la empresa y devuelve respuestas estructuradas en el formato JEV (typesafe/jev-1.13), un esquema de preguntas y respuestas tipadas. Se distribuye como artefacto NumPy (library_name: numpy) y se integra mediante la librería connect-tycoon, que permite cargarlo desde Hugging Face Hub y ejecutarlo como política del simulador o en modo interactivo.

Su relevancia es acotada y educativa: sirve como ejemplo reproducible de un pipeline de RL (aprendizaje supervisado sobre un "presidente de reglas" seguido de ajuste con PPO) aplicado a un entorno de decisión multiobjetivo con compensaciones entre beneficio, satisfacción del cliente y riesgo. Según la model card, supera de forma clara al agente basado en reglas en beneficio mensual medio, satisfacción y días sin stock, aunque no se aportan detalles sobre arquitectura de red, número de parámetros ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL entrenada con PPO; estructura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el estado de entrada es estructurado, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (artefacto NumPy distribuido vía connect-tycoon; library_name: numpy) |

## Arquitectura y entrenamiento

La model card describe un proceso en dos fases: primero un aprendizaje supervisado que imita a un "presidente de reglas" (rule-based policy) del simulador, y después un ajuste con PPO (Proximal Policy Optimization) usando como señal de recompensa los valores de la empresa (beneficio, satisfacción del cliente y riesgo, con pesos 1.0 cada uno en la configuración indicada). El agente opera sobre el estado del simulador CONNECT TYCOON y emite decisiones en el esquema JEV, con respuestas tipadas de elección y probabilidades asociadas.

No se especifica en la información disponible el tipo de red neuronal empleada (MLP, transformer u otra), el número de parámetros, el volumen de datos de entrenamiento, la composición del dataset sintético ni los hiperparámetros de PPO. El entorno de entrenamiento es un simulador de empresa con configuración concreta (`warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, `order_scale: 1.0`, entre otros), lo que acota fuertemente el dominio de aplicación.

## Capacidades

- Toma de decisiones discretas de negocio en el simulador: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Emisión de respuestas estructuradas en formato JEV con distribución de probabilidad sobre las opciones disponibles y un campo de confianza.
- Gestión de compensaciones multiobjetivo entre beneficio, satisfacción del cliente y riesgo operativo.
- Razonamiento de política de un solo paso por decisión (no se documenta razonamiento multi-paso ni planificación explícita).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente autónomo general: no; está restringido al entorno CONNECT TYCOON.
- Capacidades multilingües: no; etiquetado únicamente para coreano.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Simulación educativa de gestión empresarial: cargar la política con `connect-tycoon play --brain hf:WeonJeong/connectailab-rl-maru-v1-teacher` para que dirija una empresa simulada y observar las decisiones tomadas día a día.
- Docencia de aprendizaje por refuerzo: usar el par (política de reglas, política PPO) como ejemplo comparativo de imitación seguida de optimización con recompensa multiobjetivo.
- Investigación en entornos de decisión con compensaciones: emplear el simulador y la política como banco de pruebas para estudiar el efecto de cambiar los pesos de la función de recompensa.
- Evaluación de políticas en entornos sintéticos: comparar el rendimiento de esta política con alternativas propias sobre las mismas métricas (beneficio, satisfacción, incidentes, días sin stock).
- Integración como componente de decisión en prototipos de agentes: usar la interfaz JEV para conectar la política a otros sistemas que consuman respuestas tipadas con probabilidades.
- Demostración de despliegue de políticas de RL en Hugging Face Hub: servir como plantilla de publicación y carga de artefactos de RL mediante una librería de dominio específico.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card y comparan la política con el agente basado en reglas sobre una media de 40 meses no vistos:

| Métrica (media de 40 meses) | Presidente de reglas | connectailab-rl-maru-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,11 millones de wones |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 2,8 |
| Escalados a confirmación humana | 37,8 | 21,7 |
| Días sin stock | 10,7 | 0,5 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es esperable al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al distribuirse como artefacto NumPy y ejecutarse sobre el simulador, la huella probablemente sea muy reducida, pero no se documenta.
- GPU recomendadas: no disponibles; no se indica que el entrenamiento o la inferencia requieran GPU.
- Ejecución en GPU de consumo: no documentada; la carga vía `connect-tycoon` sugiere ejecución en CPU.
- Opciones de despliegue: librería `connect-tycoon` (extra `[game]`), carga desde Hugging Face Hub mediante `CompanyBrain.from_hub`, y cuaderno de Google Colab para entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-maru-v1-teacher | Política RL (PPO) para simulador de negocio | no disponible | no disponible | Apache 2.0 | Hugging Face Hub vía connect-tycoon |
| Presidente de reglas (baseline interno de CONNECT TYCOON) | Política basada en reglas | no aplica | no aplica | no disponible | Incluido en el simulador |
| Otros modelos de RL para decisión empresarial | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros en la misma categoría (políticas de RL para simulación de gestión empresarial) que permitan una comparación con datos verificables.

## Limitaciones y advertencias

- Modelo educativo y sintético: la propia model card advierte de que no garantiza ni predice resultados empresariales reales.
- Dominio muy restringido: solo opera dentro del simulador CONNECT TYCOON y con la configuración de empresa indicada; no es transferible a entornos reales sin reentrenamiento.
- Sin datos de arquitectura ni de entrenamiento publicados: no es posible auditar el tamaño, la composición de datos ni los hiperparámetros de PPO.
- Idiomas: únicamente coreano; no hay soporte multilingüe documentado.
- Riesgo de sobreajuste al simulador: las métricas reportadas proceden de 40 meses "no vistos" del mismo entorno, no de entornos independientes.
- Sin información sobre sesgos, alucinación o robustez frente a estados fuera de distribución.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el uso comercial del modelo fuera del simulador carece de validación empírica.
- Sin soporte documentado de tool calling, agentes generales ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WeonJeong/connectailab-rl-maru-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
