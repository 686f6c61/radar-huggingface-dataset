# yegom/connectailab-rl-yegomfloor-v4-teacher

## Resumen

`connectailab-rl-yegomfloor-v4-teacher` es una política de decisión entrenada con aprendizaje por refuerzo (PPO) por el desarrollador independiente yegom (Park Sehyun) en el marco de CONNECT AI LAB. No es un modelo de lenguaje generativo: es un cerebro de decisión que opera una empresa simulada dentro del entorno CONNECT TYCOON, un juego de gestión empresarial donde el agente debe tomar decisiones mensuales sobre personal, inventario, marketing, atención al cliente, reembolsos y seguridad. El modelo recibe observaciones del estado de la empresa y devuelve decisiones estructuradas en el formato JEV (JSON Evaluation Vocabulary), la misma interfaz que usa `typesafe/jev-1.13`.

El modelo se entrenó en dos fases: primero imitación supervisada de un "jefe basado en reglas" (el baseline del simulador) y después ajuste fino con PPO usando una función de recompensa ponderada por los valores de la empresa (beneficio 2.5, satisfacción del cliente 2.0, riesgo 1.0). Según la model card, supera al baseline en 40 meses no vistos: 10,74 millones de wones de beneficio mensual frente a 3,24 millones, 96 % de satisfacción frente a 79 %, 4,7 incidentes de riesgo frente a 7,8 y 0,8 días de rotura de stock frente a 10,7. Es relevante como ejemplo de RL aplicado a toma de decisiones empresariales con una interfaz tipada y verificable, y como pieza educativa de un curso de RL.

La librería declarada es `numpy` y el artefacto se distribuye como política serializada (no como pesos de transformer). El pipeline es `reinforcement-learning`, el idioma declarado es coreano (`ko`) y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre observaciones estructuradas del simulador CONNECT TYCOON; no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera por paso de decisión sobre el estado del juego) |
| Tipos de cuantizacion | no disponible (artefacto NumPy; no se documentan cuantizaciones) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; serialización cargable con `connect_tycoon.CompanyBrain.from_hub` (librería `numpy`) |

## Arquitectura y entrenamiento

La política se entrena en dos etapas. La primera es aprendizaje supervisado por imitación de un "jefe basado en reglas" que actúa como profesor (de ahí el sufijo `teacher` en el identificador): el agente aprende a replicar las decisiones del baseline sobre el estado de la empresa. La segunda es ajuste con PPO (Proximal Policy Optimization), donde la recompensa se define como una combinación ponderada de los valores corporativos declarados en la model card: beneficio 2.5, satisfacción del cliente 2.0 y riesgo 1.0. El entorno es un simulador de empresa con configuración explícita (`warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, `order_scale: 1.0`, `wage: 0.0`, `ad_power: 1.0`, entre otros), con horizonte de 20 días laborables por mes.

La innovación destacable no está en la arquitectura de red (no se documenta) sino en la interfaz: todas las decisiones se expresan en formato JEV, con preguntas tipadas (`choice`) y respuestas que incluyen la opción elegida, la distribución de probabilidades sobre las alternativas y un nivel de confianza. En el ejemplo de la model card, ante una solicitud de reembolso con `fraud_score: 0.3146`, el modelo asigna 0.8669 de probabilidad a "derivar a revisión humana", 0.1306 a reembolso completo y valores residuales a reembolso parcial y denegación. No se documentan datos de entrenamiento (número de episodios, tokens o composición del dataset).

## Capacidades

- Toma de decisiones discretas sobre el estado de una empresa simulada: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Emisión de respuestas en formato JEV con distribución de probabilidades y confianza por opción.
- Política entrenada específicamente para el entorno CONNECT TYCOON con la configuración de empresa indicada.
- Integración con el paquete `connect-tycoon` mediante `CompanyBrain.from_hub` y el comando `connect-tycoon play --brain hf:...`.
- No soporta tool calling, function calling genérico, agentes multi-paso fuera del simulador, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al coreano declarado; no se documentan otros idiomas.

## Casos de uso

- **Investigación educativa en RL aplicado a negocio**: usar el modelo como referencia de política PPO entrenada con recompensa multiobjetivo (beneficio, satisfacción, riesgo) para comparar curvas de aprendizaje y estrategias de recompensa en cursos de reinforcement learning.
- **Baseline para experimentos en CONNECT TYCOON**: servir como "profesor" o política de referencia contra la que evaluar nuevas políticas en el mismo simulador, dado que la model card reporta métricas concretas en 40 meses no vistos.
- **Demostración de interfaces tipadas para decisiones**: ilustrar cómo estructurar la salida de un agente de decisión en JSON verificable (JEV) con probabilidades y confianza, útil para diseñar APIs de agentes en producción.
- **Simulación de políticas de reembolso y fraude**: analizar el comportamiento aprendido ante solicitudes con distinto `fraud_score` y comparar la política con reglas heurísticas de negocio.
- **Evaluación de robustez de políticas RL**: someter la política a configuraciones de empresa distintas de la entrenada (cambios en `warehouse`, `base_demand`, `ad_power`) para medir degradación y sensibilidad.
- **Prototipado de agentes de gestión en entornos sintéticos**: usar el simulador y la política como banco de pruebas antes de trasladar decisiones a sistemas reales, asumiendo que la model card advierte explícitamente que no garantiza resultados de gestión reales.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre 40 meses no vistos en el simulador CONNECT TYCOON:

| Métrica (media mensual) | Jefe basado en reglas | connectailab-rl-yegomfloor-v4-teacher |
|---|---|---|
| Beneficio mensual | 3,24 M KRW | 10,74 M KRW |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 4,7 |
| Escalados a revisión humana | 37,8 | 8,6 |
| Días de rotura de stock | 10,7 | 0,8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con otras políticas RL del mismo entorno.

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto se carga con `numpy` y no requiere GPU para inferencia según la información proporcionada.
- GPU recomendadas: no aplica para inferencia; el entrenamiento PPO se realizó presumiblemente en el entorno del autor, sin especificar hardware.
- Cabe en cualquier equipo capaz de ejecutar el simulador `connect-tycoon`; no se documentan requisitos de GPU de consumo.
- Opciones de despliegue: paquete Python `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga vía `CompanyBrain.from_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Licencia | Métricas reportadas |
|---|---|---|---|---|
| connectailab-rl-yegomfloor-v4-teacher | Política PPO + imitación | CONNECT TYCOON | Apache 2.0 | 10,74 M KRW/mes, 96 % satisfacción |
| Jefe basado en reglas (baseline del simulador) | Heurística | CONNECT TYCOON | no disponible | 3,24 M KRW/mes, 79 % satisfacción |
| Otras políticas RL del mismo autor | no disponible | CONNECT TYCOON | no disponible | no disponible |

No se dispone de información sobre políticas RL comparables de otros autores en el mismo entorno ni sobre modelos de decisión equivalentes con métricas publicadas.

## Limitaciones y advertencias

- Modelo de simulación educativa: la propia model card advierte que no garantiza ni predice resultados de gestión reales.
- Entrenado para una configuración concreta de empresa (`warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, etc.); el rendimiento fuera de esa configuración no está documentado.
- Idioma declarado únicamente coreano; no se documenta soporte multilingüe.
- No es un modelo de lenguaje: no genera texto libre, no responde preguntas abiertas y no admite tool calling genérico.
- Riesgo de sobreajuste al profesor basado en reglas en la fase de imitación; no se documenta la proporción de episodios de imitación frente a PPO.
- Sin datos publicados sobre número de parámetros, arquitectura de red ni datos de entrenamiento, lo que dificulta la reproducibilidad.
- Sesgos: al optimizar beneficio 2.5 / satisfacción 2.0 / riesgo 1.0, la política puede priorizar métricas económicas sobre otras consideraciones no modeladas en la recompensa.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el valor práctico fuera del simulador es limitado; verificar la licencia del entorno `connect-tycoon` por separado.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yegom/connectailab-rl-yegomfloor-v4-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
