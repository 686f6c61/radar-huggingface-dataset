# yegom/connectailab-rl-jay-v1

## Resumen

`connectailab-rl-jay-v1` es un modelo de toma de decisiones por refuerzo profundo (deep reinforcement learning) publicado por el autor yegom (identificado en la model card como "예곰 · 박세현 / PARK SEHYUN"). No es un modelo de lenguaje generativo, sino una política entrenada para operar una empresa simulada dentro del entorno CONNECT TYCOON: un simulador de gestión donde el agente debe tomar decisiones mensuales sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad. El modelo recibe el estado de la empresa y devuelve una acción (o distribución de probabilidad sobre acciones) en el formato estructurado JEV (`typesafe/jev-1.13`).

La arquitectura subyacente no está detallada en la información disponible; los tags indican PPO (Proximal Policy Optimization) sobre un entorno Gymnasium, con una fase previa de aprendizaje supervisado imitando a un "presidente basado en reglas" y una posterior optimización por recompensa basada en los valores de la empresa (beneficio, satisfacción del cliente, riesgo). El repositorio declara el paquete `numpy` como librería, lo que sugiere que la inferencia se resuelve con operaciones numéricas simples y pesos en `safetensors`, sin dependencia de frameworks de deep learning pesados.

Su relevancia es acotada y de nicho: sirve como ejemplo educativo de un pipeline completo de RL para decisiones empresariales (entorno, recompensa multiobjetivo, formato de respuesta tipado) y como caso práctico de integración de políticas RL en un producto interactivo. No debe confundirse con un LLM: no genera texto libre, no razona en lenguaje natural y su alcance se limita al simulador para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning (PPO) sobre entorno Gymnasium; arquitectura de red no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre estados estructurados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería declarada: numpy) |

## Arquitectura y entrenamiento

El modelo se entrenó en dos fases según la model card: primero aprendizaje supervisado imitando a un "presidente basado en reglas" (rule-based president), y después optimización con PPO usando una recompensa derivada de los valores de la empresa, definidos como `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfacción del cliente y riesgo, con peso unitario cada uno). El agente opera sobre un horizonte de un mes (20 días laborables) dentro del simulador y emite decisiones en formato JEV, el mismo esquema tipado que usa el ecosistema `typesafe/jev-1.13`, con preguntas de tipo `choice` y respuestas con distribución de probabilidades y nivel de confianza.

La información disponible no detalla el número de tokens o episodios de entrenamiento, la composición del dataset de imitación, el tamaño de la red ni hiperparámetros de PPO. El tag `prefrontal-cortex` es una etiqueta descriptiva del autor (analogía con la corteza prefrontal como centro de decisión), no una referencia a una arquitectura neuroinspirada concreta. La configuración de la empresa sobre la que se evaluó viene fijada en la model card: `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`.

## Capacidades

- Toma de decisiones discretas en el simulador CONNECT TYCOON: asignación de personal, pedidos de inventario, campañas de marketing, atención al cliente, gestión de reembolsos y seguridad.
- Emisión de respuestas en formato JEV estructurado, con tipo de pregunta (`choice`), opción seleccionada, distribución de probabilidades por alternativa y confianza asociada.
- Gestión de decisiones con compensaciones (trade-offs) entre beneficio, satisfacción del cliente y riesgo operativo.
- Clasificación de solicitudes de reembolso en cuatro categorías: reembolso total, parcial, denegación y escalado a revisión humana.
- Operación sobre estados estructurados con campos como `department`, `reason`, `tier`, `amount` y `fraud_score`.
- Integración con el paquete `connect-tycoon` mediante `CompanyBrain.from_hub(...)` y ejecución como "cerebro" del juego con `connect-tycoon play --brain hf:...`.
- No soporta generación de texto libre, tool calling genérico, visión, audio ni razonamiento multi-step fuera del bucle del simulador.

## Casos de uso

- Evaluación educativa de pipelines de RL: el modelo sirve como referencia completa de un flujo imitación + PPO con recompensa multiobjetivo, útil en cursos y talleres sobre reinforcement learning aplicado a decisiones de negocio.
- Simulación de políticas de reembolso: dado un estado con importe, motivo y `fraud_score`, el agente devuelve una distribución sobre reembolso total, parcial, denegación o revisión humana, lo que permite estudiar umbrales de escalado antes de trasladarlos a un sistema real.
- Benchmark de agentes en entornos de gestión empresarial: al fijar la configuración de la empresa, se puede comparar esta política con el "presidente basado en reglas" u otras políticas bajo las mismas condiciones del simulador.
- Prototipado de juegos y experiencias interactivas: integración directa en CONNECT TYCOON mediante `connect-tycoon play --brain hf:yegom/connectailab-rl-jay-v1` para que el agente actúe como oponente o asistente del jugador.
- Investigación sobre formatos de respuesta tipados: el uso de JEV como contrato de entrada/salida permite estudiar cómo estructurar decisiones de agentes de forma verificable y con probabilidades explícitas.
- Docencia sobre recompensas multiobjetivo: el esquema de pesos iguales para beneficio, satisfacción y riesgo sirve para ilustrar cómo un agente aprende a equilibrar métricas contrapuestas y cómo ajustar esos pesos cambia el comportamiento.
- Demostración de despliegue ligero: al usar `numpy` y `safetensors`, el modelo puede ejecutarse en entornos sin GPU, lo que facilita su uso en talleres, notebooks y demos docentes.

## Benchmarks y rendimiento

La model card incluye una comparación frente al "presidente basado en reglas" sobre una media de 40 meses no vistos en entrenamiento. No se trata de benchmarks estándar de NLP, sino de métricas del simulador:

| Métrica (media de 40 meses no vistos) | Presidente basado en reglas | connectailab-rl-jay-v1 |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,22 millones de wones |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 2,8 |
| Escalados a revisión humana | 37,8 | 20,8 |
| Días con falta de stock | 10,7 | 0,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con políticas RL externas al proyecto.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,0 GB y la librería declarada es `numpy`, por lo que la inferencia no requiere GPU.
- GPU recomendadas: no aplica; el modelo puede ejecutarse en CPU.
- Cabe en cualquier GPU de consumo (y en CPU), dado el tamaño declarado del repositorio y la ausencia de dependencias de frameworks de deep learning pesados.
- Opciones de despliegue: paquete `connect-tycoon` (instalación con `pip install "connect-tycoon[game]"`), carga del cerebro vía `CompanyBrain.from_hub` y pesos en `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jay-v1 | Política RL (PPO) para simulador de gestión | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Presidente basado en reglas (baseline del propio proyecto) | Sistema de reglas | no aplica | no aplica | no disponible | Incluido en el simulador |
| connectailab-rl-parksehyun-v1-teacher | Política RL (PPO) para el mismo simulador | no disponible | no aplica | Apache 2.0 (según model card) | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas RL para entornos de gestión empresarial) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: solo es válido dentro del simulador CONNECT TYCOON y con la configuración de empresa declarada; no generaliza a otros entornos ni a decisiones reales de negocio.
- La model card advierte explícitamente de que es un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados de gestión reales.
- Idiomas: solo coreano (ko); no soporta instrucciones ni estados en castellano.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero las probabilidades emitidas son estimaciones de la política y no deben interpretarse como certezas calibradas fuera del simulador.
- Sesgos: al entrenarse imitando a un "presidente basado en reglas" y optimizar una recompensa con pesos fijados por el autor (beneficio, satisfacción y riesgo a 1.0), hereda las prioridades de ese diseño; cambiar los pesos alteraría el comportamiento esperado.
- Licencia Apache 2.0: permite uso comercial, pero el uso responsable y la validación previa en producción recaen en el integrador.
- Sin datos publicados sobre tamaño de red, hiperparámetros de entrenamiento ni metodología de evaluación más allá de la media de 40 meses no vistos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yegom/connectailab-rl-jay-v1
- Repositorio del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Formato JEV referenciado: `typesafe/jev-1.13`
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de reinforcement learning de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
