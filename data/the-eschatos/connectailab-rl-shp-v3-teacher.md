# the-eschatos/connectailab-rl-shp-v3-teacher

## Resumen

connectailab-rl-shp-v3-teacher es un modelo de aprendizaje por refuerzo (RL) desarrollado por el autor the-eschatos dentro del proyecto CONNECT TYCOON, una iniciativa educativa de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generativo: es una política de decisión entrenada para operar una empresa simulada durante un mes de 20 días laborables, tomando decisiones sobre asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad. El modelo actúa como el "córtex prefrontal" de la compañía virtual.

La política se entrenó en dos fases: primero imitando a un "presidente de reglas" (aprendizaje supervisado) y después ajustando sus decisiones mediante PPO con recompensas derivadas de los valores de la empresa (beneficio, satisfacción del cliente y riesgo, todos con peso 1.0). El modelo responde en el formato tipado JEV (`typesafe/jev-1.13`), lo que permite integrarlo en el simulador mediante la librería `connect-tycoon` y consultarlo con preguntas de tipo elección múltiple que devuelven probabilidades por opción.

Es relevante como ejemplo práctico y didáctico de RL aplicado a toma de decisiones empresariales en un entorno Gymnasium, con artefactos publicados en formato NumPy (no safetensors ni GGUF) y licencia Apache 2.0. Su alcance es deliberadamente acotado: el propio autor lo describe como un modelo educativo sobre un simulador sintético, sin garantía de rendimiento en gestión real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre observaciones de estado del simulador; no es un transformer generativo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el estado se pasa como objeto estructurado, no como secuencia de tokens) |
| Tipos de cuantizacion | no disponible (pesos en formato NumPy) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | NumPy (librería `numpy`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una política de decisión entrenada con deep reinforcement learning sobre el simulador CONNECT TYCOON, un entorno compatible con Gymnasium. El pipeline declarado es `reinforcement-learning` y la técnica de optimización es PPO. El entrenamiento consta de dos etapas: una primera fase de aprendizaje supervisado a partir de las decisiones de un "presidente de reglas" (política heurística de referencia) y una segunda fase de ajuste con PPO usando recompensas compuestas derivadas de los valores de la empresa: beneficio, satisfacción del cliente y evitación de riesgo, cada uno con peso 1.0.

La observación de entrada es un objeto de estado estructurado (por ejemplo, departamento, motivo, nivel de cliente, importe y puntuación de fraude en el caso de reembolsos). La salida se emite en el esquema JEV (`typesafe/jev-1.13`), con preguntas tipadas de elección y un vector de probabilidades por opción, junto con un campo de confianza y una razón. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni detalles de la arquitectura de red neuronal (capas, tamaño de embedding o función de valor), por lo que estos datos se consideran no disponibles.

## Capacidades

- Toma de decisiones discretas de negocio: asignación de personal, pedidos de inventario, campañas de marketing, gestión de atención al cliente, reembolsos y seguridad.
- Respuesta en formato tipado JEV con preguntas de tipo `choice`, devolviendo distribución de probabilidad sobre opciones y nivel de confianza.
- Razonamiento de compromiso entre objetivos en conflicto (beneficio frente a satisfacción frente a riesgo), aprendido mediante recompensa multiobjetivo.
- Operación multi-paso dentro de un episodio de 20 días laborables, con estado acumulado de la empresa.
- Integración con el simulador mediante `CompanyBrain.from_hub` y la CLI `connect-tycoon play --brain hf:...`.
- Soporte de ejecución en Google Colab mediante el notebook publicado por el autor.
- Capacidad multilingüe: limitada al coreano según la model card.
- No soporta tool calling, function calling genérico, agentes conversacionales ni razonamiento multi-turno en lenguaje natural; su interfaz es estructurada y específica del simulador.

## Casos de uso

- Docencia de reinforcement learning: el modelo sirve como ejemplo completo de pipeline supervisado + PPO sobre un entorno Gymnasium, con notebook de Colab para reproducir el entrenamiento y comparar contra la política de reglas.
- Investigación en recompensas multiobjetivo: permite estudiar cómo el ajuste de pesos (beneficio, satisfacción, riesgo) altera la política resultante y el equilibrio entre métricas de negocio.
- Simulación de gestión empresarial: se integra en CONNECT TYCOON para operar la empresa virtual durante 20 días y evaluar el resultado en beneficio, satisfacción, incidentes de riesgo, escalados a humano y días de rotura de stock.
- Evaluación comparativa de políticas: al existir una política de reglas de referencia con métricas publicadas, se puede usar como baseline para medir mejoras o degradaciones de nuevas políticas.
- Prototipado de asistentes de decisión estructurados: el esquema JEV con probabilidades por opción es reutilizable como patrón de interfaz para sistemas de decisión que requieran trazabilidad de la confianza.
- Formación interna en empresas: escenario de bajo riesgo para practicar decisiones de asignación de personal, inventario y atención al cliente sin consecuencias reales, dado que el propio autor advierte que no predice resultados reales.

## Benchmarks y rendimiento

El autor publica una comparación agregada sobre 40 meses no vistos, frente a la política de reglas:

| Métrica (media de 40 meses) | Presidente de reglas | connectailab-rl-shp-v3-teacher |
|---|---|---|
| Beneficio mensual | 3,24 M KRW | 3,01 M KRW |
| Satisfacción del cliente | 79 % | 82 % |
| Incidentes de riesgo | 7,8 | 7,4 |
| Escalados a confirmación humana | 37,8 | 38,9 |
| Días de rotura de stock | 10,7 | 11,3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo se distribuye como artefactos NumPy y no requiere aceleración GPU para inferencia según la información publicada.
- GPU recomendadas: no aplica para inferencia; el entrenamiento se documenta mediante un notebook de Google Colab, sin especificar GPU concreta.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: librería `connect-tycoon` (`pip install "connect-tycoon[game]"`), CLI `connect-tycoon play --brain hf:the-eschatos/connectailab-rl-shp-v3-teacher` y carga programática con `ct.CompanyBrain.from_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-shp-v3-teacher | Política RL (PPO) para simulación empresarial | no disponible | no aplica | Apache 2.0 | Hugging Face (0 descargas) |
| Política de reglas de CONNECT TYCOON | Heurística determinista | no aplica | no aplica | no disponible | Integrada en el simulador |
| Otros modelos RL de decisión | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que es un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados de gestión real.
- El rendimiento es inferior a la política de reglas en beneficio mensual (3,01 frente a 3,24 M KRW) y en días de rotura de stock (11,3 frente a 10,7), por lo que no es una mejora universal sobre el baseline.
- Mayor número de escalados a confirmación humana que la política de reglas (38,9 frente a 37,8), lo que implica más intervención manual.
- Idiomas soportados limitados al coreano; no hay evidencia de generalización a otros idiomas.
- Riesgo de sobreajuste al simulador y a la configuración concreta de empresa publicada (`warehouse` 250.0, `base_demand` 40.0, `unit_cost` 1.5, entre otros); no se documenta comportamiento fuera de esa configuración.
- No es un modelo de lenguaje: no admite prompts libres, tool calling ni conversación; cualquier uso fuera de la interfaz JEV estructurada requiere adaptación.
- No se documentan sesgos específicos, pero al entrenarse sobre una política de reglas y una función de recompensa fija, hereda las prioridades y posibles sesgos de ese diseño.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el valor práctico fuera del simulador educativo es muy limitado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/the-eschatos/connectailab-rl-shp-v3-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
