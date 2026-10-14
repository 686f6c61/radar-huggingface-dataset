# TUpreneur/connectailab-rl-tupreneur-v1-teacher

## Resumen

connectailab-rl-tupreneur-v1-teacher es una política de aprendizaje por refuerzo desarrollada por TUpreneur dentro del ecosistema educativo de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje: es un agente de toma de decisiones ("prefrontal cortex" en la terminología del autor) que gestiona una empresa simulada durante un mes de 20 días laborables en el simulador CONNECT TYCOON.

El modelo recibe estados estructurados del simulador (departamento, motivo, tipo de cliente, importe, puntuación de fraude) y devuelve decisiones en el formato JEV (`typesafe/jev-1.13`), con distribución de probabilidad sobre las opciones disponibles. Cubre áreas como asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.

Su relevancia es acotada y educativa: sirve como ejemplo reproducible de un pipeline de aprendizaje por refuerzo (imitación de un jefe basado en reglas seguida de PPO) aplicado a un entorno de decisión empresarial tipo Gymnasium. La model card declara explícitamente que es un modelo docente sobre un simulador sintético y que no garantiza ni predice resultados de gestión real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de politica de aprendizaje por refuerzo (PPO); topologia exacta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje con ventana de contexto; consume estado estructurado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (libreria declarada: numpy) |

## Arquitectura y entrenamiento

La model card describe un entrenamiento en dos fases. Primero, aprendizaje supervisado por imitación de un "jefe basado en reglas" (el agente de referencia del simulador). Después, ajuste mediante PPO (Proximal Policy Optimization) usando como recompensa el vector de valor de la empresa, definido en el propio autor como `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfacción del cliente y riesgo, con peso 1.0 cada uno). El entorno sigue la interfaz de Gymnasium y la librería declarada es numpy, lo que sugiere una política ligera ejecutable en CPU, aunque el tamaño y la topología de la red no se detallan.

El agente opera sobre un simulador con configuración de empresa concreta: `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. La innovación destacable no es arquitectónica sino de formato: todas las respuestas se emiten en el esquema JEV, con campos de tipo de respuesta, opción elegida, probabilidades por opción, confianza y motivo ("강화학습 정책", es decir, política de aprendizaje por refuerzo). No se documentan técnicas como decodificación especulativa ni atención lineal, por tratarse de un dominio distinto al de los modelos generativos.

## Capacidades

- Toma de decisiones discretas sobre acciones empresariales simuladas: elección entre opciones como reembolso total, parcial, denegación o revisión humana.
- Gestión operativa del simulador durante un ciclo de 20 días laborables: asignación de personal, reposición de inventario, campañas de marketing, atención al cliente, reembolsos y seguridad.
- Salida de distribución de probabilidad sobre las alternativas, lo que permite medir confianza (en el ejemplo de la model card, `human` con 0.7752 de probabilidad frente a `full` 0.2231, `deny` 0.001 y `partial` 0.0007).
- Formato de respuesta JEV (`typesafe/jev-1.13`), con campos estructurados de pregunta y respuesta.
- Integración directa con el motor del juego mediante la CLI `connect-tycoon play --brain hf:...` y mediante `CompanyBrain.from_hub`.
- No dispone de generación de texto libre, tool calling, capacidades multimodales (visión o audio), razonamiento multi-paso genérico ni soporte multilingüe más allá del coreano.

## Casos de uso

- Evaluación comparativa de políticas RL en un simulador empresarial: usar el modelo como referencia frente al jefe basado en reglas para estudiar la mejora en métricas de negocio sintéticas.
- Docencia de aprendizaje por refuerzo: el par (imitación supervisada + PPO) sobre un entorno Gymnasium es un ejemplo didáctico completo y reproducible mediante el notebook de Colab incluido por el autor.
- Integración como cerebro jugable en CONNECT TYCOON: desplegarlo con `connect-tycoon play --brain hf:TUpreneur/connectailab-rl-tupreneur-v1-teacher` para operar automáticamente la empresa simulada.
- Investigación sobre decisión con valores múltiples: el escenario pondera simultáneamente beneficio, satisfacción y riesgo, útil para estudiar compromisos (trade-offs) en entornos de recompensa vectorial.
- Estudios de políticas de fraude y reembolso: la tarea de ejemplo sobre reembolsos con `fraud_score` permite analizar cómo una política aprende a derivar casos dudosos a revisión humana.
- Base para transferencia o ajuste en simuladores de negocio similares: al exponer una interfaz de estado estructurado y salida JEV, puede servir de punto de partida para experimentos propios.
- Material de aula para formación corporativa en IA: el autor lo enmarca en sus cursos de IA y aprendizaje por refuerzo, orientados a divulgación más que a producción.
- Prototipado de agentes de decisión para "juegos serios" de gestión: el formato de pregunta/respuesta tipada facilita conectar el modelo a interfaces de decisión sin generación de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje. La model card sí presenta métricas internas del simulador, con medias sobre 40 meses no vistos, comparando el agente frente al jefe basado en reglas:

| Metrica (media sobre 40 meses) | Jefe basado en reglas | connectailab-rl-tupreneur-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,70 millones de wones |
| Satisfacción del cliente | 79% | 96% |
| Incidentes de riesgo | 7,8 | 2,3 |
| Confirmaciones humanas superadas | 37,8 | 12,4 |
| Días sin existencias | 10,7 | 0,6 |

Estas cifras proceden únicamente de la model card del autor, corresponden a un simulador sintético y no están verificadas de forma independiente. No deben interpretarse como rendimiento en entornos reales.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información disponible.
- La librería declarada es numpy, por lo que la inferencia es presumiblemente ligera y ejecutable en CPU, aunque esto no está confirmado por el autor.
- No se indican GPU recomendadas (A100, H100, RTX 4090 u otras).
- No se confirma si cabe en GPU de consumo; dado el tipo de política es probable, pero no hay dato oficial.
- Opciones de despliegue: la vía documentada es el paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`) y la carga vía `CompanyBrain.from_hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La información disponible no incluye otros modelos comparables de la misma categoría. El único referente documentado es el agente base del propio entorno:

| Modelo | Tipo | Beneficio mensual | Satisfacción | Licencia |
|---|---|---|---|---|
| connectailab-rl-tupreneur-v1-teacher | Política RL (PPO) | 11,70 M wones | 96% | apache-2.0 |
| Jefe basado en reglas (baseline del simulador) | Sistema de reglas | 3,24 M wones | 79% | no disponible |
| typesafe/jev-1.13 | Formato/esquema JEV referenciado | no disponible | no disponible | no disponible |

Para el resto de alternativas de la misma categoría (políticas RL para simulación de negocio): no disponible.

## Limitaciones y advertencias

- Ámbito muy restringido: está entrenado para el simulador CONNECT TYCOON y su configuración de empresa concreta; fuera de ese entorno su comportamiento no está validado.
- Idioma limitado al coreano, tanto en las etiquetas del entorno como en las justificaciones de las respuestas.
- No es un modelo generativo: no produce texto libre, código ni razonamiento abierto, y no soporta tool calling ni agentes multi-paso generales.
- Riesgo de alucinación no aplicable en el sentido habitual; el riesgo real es de sobreajuste a la dinámica del simulador y mala generalización a variaciones del mismo.
- Sesgos: al imitar primero a un jefe basado en reglas, puede heredar los sesgos de decisión de esa política de referencia.
- Licencia apache-2.0, permisiva, sin restricciones conocidas para uso comercial del modelo en sí; conviene revisar aparte la licencia del simulador `connect-tycoon`.
- La model card advierte expresamente de que es un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados de gestión reales.
- Métricas no verificadas de forma independiente y obtenidas por el propio autor; las 0 descargas y 0 "likes" reflejan que el modelo no tiene adopción pública en el momento de la consulta.
- Fecha de creación declarada (2026-10-13) y posible discrepancia con la fecha de actualización, que figura como tres segundos posterior; conviene verificar la vigencia en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab (entrenamiento RL del modelo de decisión): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo (AI CITY BUILDERS): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo ni sobre su autor; los enlaces anteriores proceden de la model card.
