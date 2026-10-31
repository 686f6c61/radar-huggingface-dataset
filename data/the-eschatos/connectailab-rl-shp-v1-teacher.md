# the-eschatos/connectailab-rl-SHP-v1-teacher

## Resumen

connectailab-rl-SHP-v1-teacher (también llamado "AI 사장" o "AI CEO" dentro del proyecto CONNECT TYCOON) es un modelo de aprendizaje por refuerzo desarrollado por el usuario de Hugging Face the-eschatos, en colaboración con las iniciativas educativas CONNECT AI LAB y AI CITY BUILDERS. No se trata de un modelo de lenguaje, sino de una política de decisión entrenada con PPO sobre el simulador de empresa CONNECT TYCOON, cuyo objetivo es gestionar una compañía virtual durante un mes (20 días hábiles): asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.

El modelo resuelve el problema de tomar decisiones operativas de negocio de forma automática, sustituyendo a un "gerente basado en reglas". Según la model card, supera ampliamente a ese gerente reglado en beneficios mensuales (11,11 millones de wones frente a 3,24 millones), satisfacción del cliente (95 % frente a 79 %) y reducción de incidentes de riesgo y agotamientos de stock.

Técnicamente, está implementado con NumPy (no es un transformer ni un LLM) y se integra en el ecosistema CONNECT TYCOON, exponiendo sus decisiones en formato JEV (tipado, similar a `typesafe/jev-1.13`). Está orientado principalmente al mercado y documentación en coreano, y se posiciona explícitamente como un modelo educativo sobre simuladores sintéticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo (PPO); implementacion con NumPy; arquitectura de red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Coreano (ko); las respuestas son acciones estructuradas JEV, no texto libre |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (distribuido via Hugging Face Hub, cargable con `connect_tycoon.CompanyBrain.from_hub`) |

## Arquitectura y entrenamiento

El modelo es una politica de decision entrenada en dos fases, segun la model card. En la primera fase se aplica aprendizaje supervisado ("reglas del gerente"): la politica imita a un gerente basado en reglas que opera el simulador CONNECT TYCOON. En la segunda fase se aplica optimizacion proximal de politicas (PPO), ajustando las decisiones con recompensas derivadas de los valores de la empresa definidos en la configuracion: `{"beneficio": 1.0, "satisfaccion del cliente": 1.0, "riesgo": 1.0}`.

El entorno de entrenamiento es un simulador sintetico de empresa con Gymnasium (el modelo usa etiquetas `gymnasium` y `deep-reinforcement-learning`), con una configuracion concreta de empresa: almacen de 250,0 de capacidad, demanda base de 40,0, coste unitario de 1,5, escala de pedido 1,0 y potencia publicitaria 1,0, entre otros parametros. Cada decision se emite en formato JEV, un esquema tipado que incluye la eleccion elegida, las probabilidades sobre las opciones disponibles y un nivel de confianza. No hay informacion sobre el numero de pasos de entrenamiento, hiperparametros de PPO ni tamano de la red subyacente.

## Capacidades

- Decision de gestion de inventario: pedidos de reposicion para evitar agotamientos (0,5 dias de agotamiento de media frente a 10,7 del gerente reglado).
- Gestion de reembolsos: clasificacion de solicitudes de reembolso en cuatro acciones (`full`, `partial`, `deny`, `human`), ponderando el fraude frente a la satisfaccion del cliente.
- Escalado a supervision humana: puede derivar casos a verificacion humana con un coste conocido por caso (0,8 millones de wones por caso).
- Asignacion de personal, marketing y atencion al cliente dentro del simulador CONNECT TYCOON.
- Salidas estructuradas y probabilisticas: cada decision incluye probabilidades por opcion y un valor de confianza, en formato JEV.
- Integracion programatica mediante la libreria `connect-tycoon` (Python) y modo de juego interactivo (`connect-tycoon play`).
- No tiene capacidades de generacion de texto libre, vision, audio, tool calling ni razonamiento multi-paso propias de un LLM.

## Casos de uso

- Formacion en aprendizaje por refuerzo: sirve como ejemplo completo y reproducible (con notebook de Colab) de un pipeline que combina imitacion de politicas regladas y ajuste posterior con PPO sobre un entorno Gymnasium.
- Ensenanza de decision empresarial automatizada: las marcas CONNECT AI LAB y AI CITY BUILDERS lo emplean como material didactico para cursos de IA y reforzamiento, mostrando como una politica aprendida supera a reglas manuales.
- Benchmark de politicas en simuladores de gestion: puede usarse como "profesor" (sufijo `teacher` en el nombre) o linea base contra la que comparar nuevas politicas entrenadas en CONNECT TYCOON.
- Experimentacion con salidas estructuradas tipo JEV: util para estudiar como exponer decisiones de RL con probabilidades y confianza en esquemas tipados, en lugar de texto libre.
- Desarrollo de juegos de simulacion de empresa: se integra directamente en el modo juego de CONNECT TYCOON (`connect-tycoon play --brain hf:...`) como cerebro que controla la empresa del jugador o un NPC.
- Prototipado de sistemas de decision con escalado humano: el mecanismo de derivar a verificacion humana casos de riesgo es un patron reutilizable en sistemas reales de moderacion o aprobacion de reembolsos.
- Investigacion en asignacion de recompensas multiobjetivo: la funcion de valor con tres componentes (beneficio, satisfaccion, riesgo) permite experimentar con distintos pesos y observar el efecto en la politica.

## Benchmarks y rendimiento

La model card publica resultados propios del simulador CONNECT TYCOON (media de 40 meses de simulacion), comparando el modelo con el gerente basado en reglas. No hay benchmarks estandar (MMLU, HumanEval, GSM8K), lo cual es esperable al no tratarse de un modelo de lenguaje.

| Metrica (media de 40 meses) | Gerente reglado | connectailab-rl-SHP-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones KRW | 11,11 millones KRW |
| Satisfaccion del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 2,8 |
| Casos que exceden supervision humana | 37,8 | 21,7 |
| Dias de agotamiento de stock | 10,7 | 0,5 |

Estos datos provienen exclusivamente del autor del modelo y corresponden a un simulador sintetico; no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: no disponible. Al tratarse de un modelo de RL implementado con NumPy (y no de una red neuronal de gran tamano tipo transformer), es probable que funcione en CPU, pero el autor no publica requisitos.
- GPU recomendadas: no disponible; no se requiere GPU segun la informacion publicada.
- Consumer GPU: no aplicable; no hay indicios de que se necesite aceleracion por GPU.
- Despliegue: mediante la libreria `connect-tycoon` en Python (`pip install "connect-tycoon[game]"`), cargando los pesos desde Hugging Face Hub con `CompanyBrain.from_hub("the-eschatos/connectailab-rl-SHP-v1-teacher")`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un LLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No existen alternativas publicas directamente comparables (politicas de RL para el simulador CONNECT TYCOON). La unica referencia publicada por el autor es la siguiente:

| Modelo | Tipo | Beneficio mensual | Satisfaccion | Riesgo | Licencia |
|---|---|---|---|---|---|
| Gerente reglado (baseline del simulador) | Sistema de reglas | 3,24 millones KRW | 79 % | 7,8 incidentes | no disponible |
| connectailab-rl-SHP-v1-teacher | Politica RL (PPO) | 11,11 millones KRW | 95 % | 2,8 incidentes | Apache-2.0 |

Frente a modelos de decision de negocio basados en LLM (por ejemplo, agentes construidos sobre LLMs comerciales), este modelo no es comparable en generalidad: opera unicamente sobre el espacio de estados y acciones del simulador CONNECT TYCOON.

## Limitaciones y advertencias

- Es un modelo educativo sobre un simulador sintetico de empresa: la propia model card advierte que no garantiza ni predice resultados de gestion reales. No debe usarse para tomar decisiones de negocio reales.
- Alcance limitado al entorno CONNECT TYCOON: solo sabe decidir sobre las acciones y estados de ese simulador; no generaliza a otros dominios.
- Sesgos: hereda los sesgos del simulador y de la funcion de recompensa elegida (pesos iguales para beneficio, satisfaccion y riesgo); con otros pesos la politica podria comportarse de forma muy distinta.
- Riesgo de sobreajuste al simulador: las metricas publicadas proceden del mismo entorno de entrenamiento y del autor, sin validacion externa; el rendimiento en configuraciones de empresa distintas a la publicada no esta documentado.
- Documentacion y respuestas principalmente en coreano: la integracion requiere leer documentacion en coreano o el repositorio de GitHub.
- Datos de descargas muy bajos (0 descargas en el momento de redaccion) y ausencia de comunidad de revision: el modelo no ha sido auditado por terceros.
- La licencia Apache-2.0 permite uso comercial, pero al ser un artefacto educativo ligado a un simulador especifico, su valor en produccion comercial es practicamente nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/the-eschatos/connectailab-rl-SHP-v1-teacher
- Repositorio GitHub de CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de IA con refuerzo): https://www.aicitybuilders.com/robot
- Connect AI (proyecto de modelos de decision empresarial C1): https://www.ezerai.xyz
