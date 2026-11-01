# the-eschatos/connectailab-rl-shp-brain-v3-teacher

## Resumen

connectailab-rl-shp-brain-v3-teacher es un modelo de aprendizaje por refuerzo profundo (deep RL) desarrollado por el usuario the-eschatos dentro del ecosistema CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje generativo, sino una política de decisión entrenada para operar una empresa simulada durante un ciclo mensual de 20 días laborables en el videojuego/simulador CONNECT TYCOON. El modelo actúa como "cerebro prefrontal" del agente: recibe el estado de la compañía y emite decisiones sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad.

La arquitectura subyacente no se detalla en la model card; se distribuye como artefacto NumPy (librería `numpy`) y se consume a través del paquete `connect-tycoon`, que expone la clase `CompanyBrain.from_hub(...)`. El modelo se entrenó en dos fases: primero imitación de un "presidente basado en reglas" (supervised learning) y después ajuste fino con PPO (Proximal Policy Optimization) usando una función de recompensa basada en tres valores corporativos declarados: beneficio, satisfacción del cliente y riesgo.

Su relevancia es acotada y de carácter educativo: sirve como ejemplo reproducible de cómo aplicar RL a un entorno Gymnasium de toma de decisiones empresariales, con una interfaz de preguntas/respuestas en formato JEV (`typesafe/jev-1.13`). El modelo está pensado para el simulador y no para producción real; el propio autor advierte que no garantiza ni predice resultados de negocio reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo profundo (PPO) sobre simulador; arquitectura de red no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el estado es una estructura JSON de simulación) |
| Tipos de cuantizacion | no disponible (artefacto NumPy; no se documentan cuantizaciones) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | artefacto NumPy distribuido vía Hugging Face Hub (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es una política de decisión entrenada con PPO sobre un entorno de simulación empresarial (CONNECT TYCOON), compatible con la API de Gymnasium según las etiquetas del repositorio. El proceso de entrenamiento consta de dos etapas declaradas por el autor: (1) aprendizaje supervisado a partir de las decisiones de un "presidente basado en reglas" que actúa como profesor, y (2) ajuste con PPO usando como recompensa una combinación ponderada de beneficio, satisfacción del cliente y riesgo (`{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}`). La configuración de la empresa simulada incluye parámetros como almacén de 250 unidades, demanda base de 40, coste unitario de 1,5, bonus de personal, salario, poder publicitario, herramienta antifraude y personal extra de atención al cliente y reembolsos.

La innovación principal no es algorítmica sino de interfaz: el modelo responde a preguntas estructuradas en formato JEV (`typesafe/jev-1.13`), devolviendo una elección entre opciones con distribución de probabilidades y un nivel de confianza. En el ejemplo de la model card, ante una solicitud de reembolso con `fraud_score` de 0,3146, el modelo asigna 0,5118 a "revisión humana", 0,4831 a "reembolso completo", 0,0038 a "denegar" y 0,0013 a "reembolso parcial". No se documentan detalles de la red neuronal (capas, dimensión de embedding, función de activación) ni el volumen de episodios de entrenamiento.

## Capacidades

- Toma de decisiones discretas de negocio en el simulador CONNECT TYCOON: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Emisión de respuestas estructuradas en formato JEV con tipo `choice`, distribución de probabilidades por opción y campo de confianza.
- Razonamiento de política aprendida por RL: la respuesta incluye el campo `reason` con el valor "강화학습 정책" (política de aprendizaje por refuerzo).
- Integración con el paquete `connect-tycoon` mediante `CompanyBrain.from_hub(...)` y ejecución como cerebro del juego con `connect-tycoon play --brain hf:...`.
- Operación sobre estados JSON con campos como `department`, `reason`, `tier`, `amount` y `fraud_score`.
- Soporte de idioma coreano en las instrucciones y criterios de decisión.
- No dispone de generación de texto libre, tool calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking).

## Casos de uso

- Simulación educativa de gestión empresarial: el modelo se usa como oponente o como agente jugador en CONNECT TYCOON para demostrar cómo una política RL supera a un sistema basado en reglas en beneficio mensual, satisfacción y siniestralidad.
- Investigación docente en RL: sirve como ejemplo completo y reproducible (notebook de Colab incluido) de un pipeline de imitación + PPO sobre un entorno Gymnasium de decisiones discretas.
- Evaluación de políticas de reembolso: el modelo puede consultarse con estados de tipo `refund` y distintos `fraud_score` para observar cómo distribuye probabilidad entre reembolso completo, parcial, denegación y revisión humana.
- Benchmark de referencia para nuevos agentes: al publicar métricas medias sobre 40 meses (beneficio, satisfacción, incidentes, revisiones humanas, días sin stock), sirve como línea base contra la que comparar políticas propias en el mismo simulador.
- Demostración de integración JEV: útil para desarrolladores que quieran ver un caso real de pregunta/respuesta tipada con distribución de probabilidades y confianza, aplicable a otros dominios de decisión.
- Prototipado de asistentes de decisión con revisión humana: el comportamiento aprendido de derivar a una persona cuando el riesgo es ambiguo (confianza cercana a 0,51 entre "human" y "full") ilustra un patrón de escalado a humano que puede trasladarse a flujos de aprobación.

## Benchmarks y rendimiento

La model card reporta métricas medias sobre 40 meses de simulación con empresas nunca vistas, comparando el modelo con el presidente basado en reglas:

| Métrica (media 40 meses) | Presidente basado en reglas | connectailab-rl-shp-brain-v3-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,22 millones de wones |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 2,0 |
| Revisiones humanas excedidas | 37,8 | 16,0 |
| Días sin stock | 10,7 | 0,4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un artefacto NumPy de una política de decisión, la huella es muy inferior a la de un modelo de lenguaje y probablemente ejecutable en CPU.
- GPU recomendadas: no se especifican; el entrenamiento se realizó presumiblemente en GPU, pero la inferencia no requiere una GPU dedicada según la información disponible.
- Compatibilidad con GPU de consumo: no documentada, pero por la naturaleza del artefacto (NumPy) no se anticipan requisitos de VRAM significativos.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga vía `CompanyBrain.from_hub`, ejecución con `connect-tycoon play --brain hf:...` y notebook de Google Colab para reentrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (políticas RL para simulación empresarial en el ecosistema CONNECT TYCOON o JEV). La model card únicamente compara con el "presidente basado en reglas" del propio simulador, cuyos resultados se recogen en la sección de benchmarks. Para alternativas genéricas de RL (por ejemplo, políticas PPO estándar en Gymnasium) no hay datos de rendimiento comparables en la información proporcionada.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-shp-brain-v3-teacher | no disponible | no aplica | 11,22 M wones/mes, 96 % satisfacción | Apache 2.0 | Hugging Face |
| Presidente basado en reglas (referencia interna) | no aplica | no aplica | 3,24 M wones/mes, 79 % satisfacción | no disponible | incluido en el simulador |
| Otras políticas RL comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo específico del simulador CONNECT TYCOON: no es transferible a entornos reales de negocio ni a otros dominios sin reentrenamiento.
- El propio autor advierte que es un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados de gestión reales.
- Idiomas: solo coreano (ko) en instrucciones y criterios; no se documenta soporte multilingüe.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la política puede producir decisiones de baja confianza (por ejemplo, 0,5118 frente a 0,4831 entre dos opciones) que conviene tratar con revisión humana.
- Sesgos: al entrenarse por imitación de un presidente basado en reglas y optimizarse con una recompensa concreta (beneficio, satisfacción y riesgo a peso 1), la política hereda los sesgos de esa función de recompensa y del dataset de demostración; no se documentan análisis de sesgo.
- Licencia Apache 2.0: permite uso comercial del artefacto, pero el valor práctico queda limitado al simulador; no se especifican restricciones adicionales más allá de las de la licencia.
- No se documentan la arquitectura de red, el número de parámetros ni el volumen de entrenamiento, lo que dificulta la reproducibilidad completa.
- Dependencia del paquete `connect-tycoon` y del formato JEV (`typesafe/jev-1.13`) para su uso; sin ellos el artefacto no es directamente utilizable.
- Sin datos de latencia, throughput ni requisitos de hardware documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/the-eschatos/connectailab-rl-shp-brain-v3-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Formato JEV referenciado: `typesafe/jev-1.13` (identificador citado en la model card; no se proporciona URL directa)
