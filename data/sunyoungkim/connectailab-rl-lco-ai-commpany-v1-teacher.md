# sunyoungKim/connectailab-rl-lco-ai-commpany-v1-teacher

## Resumen
lco-ai-company-v1 (modelo "AI 사장" / CEO de IA) es una politica de decision entrenada con aprendizaje por refuerzo que opera una empresa dentro del simulador sintetico CONNECT TYCOON. Lo publica el usuario de HuggingFace sunyoungKim, vinculado al proyecto CONNECT TYCOON y a las iniciativas educativas CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje: es una red de politica PPO serializada como artefacto de numpy, que consume el estado de la empresa y devuelve decisiones en el formato de la libreria JEV (`typesafe/jev-1.13`).

El problema que resuelve es acotado y de simulacion: tomar decisiones operativas (asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad) a lo largo de un mes de 20 dias laborables, optimizando una funcion de valor compuesta por beneficios, satisfaccion del cliente y evitacion de riesgo. El modelo aprende primero imitando a un "jefe de reglas" y despues se ajusta con PPO usando recompensas derivadas de esos tres objetivos.

Su relevancia es principalmente docente y de investigacion aplicada: sirve como ejemplo reproducible de pipeline de RL (entorno Gymnasium, aprendizaje supervisado inicial y refinamiento con PPO), con licencia Apache 2.0 y un cero de descargas en el momento de la consulta. El autor declara explicitamente que es un modelo educativo sobre un simulador de empresa sintetica y que no garantiza ni predice resultados de gestion reales.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Red de politica de aprendizaje por refuerzo (PPO) sobre observaciones estructuradas; arquitectura interna no detallada por el autor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; consume un estado JSON por decision |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | artefacto de numpy gestionado por la libreria `connect-tycoon`; formato de fichero concreto no disponible |

## Arquitectura y entrenamiento
El autor describe un esquema de dos fases. En la primera, el modelo aprende por imitacion (aprendizaje supervisado) a replicar a un "jefe de reglas" que actua como profesor; en la segunda, las decisiones se corrigen con PPO (Proximal Policy Optimization) usando como senal de recompensa el valor de la empresa: beneficio, satisfaccion del cliente y riesgo. El entrenamiento se realiza sobre un simulador de empresa conectado a Gymnasium, con observaciones que describen el estado de cada departamento (por ejemplo, reembolsos con motivo, nivel de cliente, importe y puntuacion de fraude).

La innovacion destacable no esta en la arquitectura de red, sino en la interfaz de decision: todas las respuestas se emiten en el mismo formato que JEV (`typesafe/jev-1.13`), de modo que el modelo puede enchufarse como "cerebro" de un juego o de otro sistema que hable ese protocolo. El estado de configuracion de la empresa usado en la evaluacion es `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. No se especifican en la informacion disponible el numero de tokens, el volumen de episodios, la composicion del dataset ni detalles de la funcion de recompensa mas alla de los tres valores citados.

## Capacidades
- Toma de decisiones discretas con distribucion de probabilidad explicita: el campo `probabilities` del ejemplo devuelve `full` 0.1028, `partial` 0.0006, `deny` 0.0006 y `human` 0.8959, con `confidence` 0.8959.
- Gestion de operaciones simuladas: asignacion de personal, pedidos de inventario, campanas de marketing, atencion al cliente, politica de reembolsos y seguridad antifraude.
- Salida en formato JEV, con campos `model`, `answers`, `type`, `choice`, `probabilities`, `confidence` y `reason`.
- Integracion directa con el simulador mediante `CompanyBrain.from_hub(...)` y con el modo juego mediante `connect-tycoon play --brain hf:...`.
- Ejecucion sobre numpy, sin necesidad de GPU ni de runtime de transformers.
- No dispone de generacion de texto libre, tool calling, capacidades multimodales, audio ni razonamiento multi-paso en lenguaje natural. El campo `reason` de las respuestas es una etiqueta fija ("강화학습 정책", politica de aprendizaje por refuerzo), no una justificacion generada.

## Casos de uso
- IA de oponente o de gestor en videojuegos de simulacion economica: el modelo se conecta como cerebro de una empresa dentro de CONNECT TYCOON mediante `connect-tycoon play --brain hf:sunyoungKim/connectailab-rl-lco-ai-commpany-v1-teacher` y decide mes a mes sin intervencion humana.
- Material docente para cursos de aprendizaje por refuerzo: el pipeline completo (entorno Gymnasium, imitacion de un profesor de reglas y refinamiento con PPO) es replicable desde el notebook de Colab publicado por el autor.
- Banco de pruebas para algoritmos de RL: sirve como linea base de PPO frente a politicas de reglas o clasificadores supervisados en el mismo simulador.
- Aprendizaje por imitacion y destilacion: es un ejemplo de politica destilada de un profesor heuristico y despues refinada, util para estudiar el efecto de la recompensa multiobjetivo.
- Simulacion de politicas de reembolso y antifraude: el estado de ejemplo incluye `fraud_score` y el modelo decide entre reembolso total, parcial, denegacion o escalado a un humano (con coste declarado de 0,8万won por caso).
- Investigacion en agentes jerarquicos o multi-departamento: al exponer probabilidades por opcion, permite analizar umbrales de decision y calibrar el coste del escalado humano.
- Demostraciones y talleres sobre despliegue ligero de modelos: al funcionar con numpy, puede ejecutarse en entornos sin GPU para sesiones formativas.

## Benchmarks y rendimiento
El autor publica una evaluacion comparativa entre la politica de reglas y lco-ai-company-v1 sobre 40 meses no vistos previamente. No se han publicado otros resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica (media de 40 meses no vistos) | Jefe de reglas | lco-ai-company-v1 |
|---|---|---|
| Beneficio mensual | 3,24 millones de won | 11,07 millones de won |
| Satisfaccion del cliente | 79% | 95% |
| Incidentes de riesgo | 7,8 | 2,8 |
| Escalados a confirmacion humana | 37,8 | 23,5 |
| Dias con rotura de stock | 10,7 | 0,6 |

## Requisitos de hardware
- VRAM para inferencia: practicamente nula; el modelo se ejecuta sobre numpy en CPU.
- GPU recomendadas: no se requiere GPU. No hay datos que justifiquen A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: irrelevante en la practica, ya que no necesita acelerador.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga mediante `CompanyBrain.from_hub`, o integracion propia contra el protocolo JEV (`typesafe/jev-1.13`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se han identificado en la informacion disponible modelos directamente comparables: se trata de una politica de RL especifica de un simulador propietario, sin arquitectura ni pesos publicos equiparables. Como referencias conceptuales de la misma categoria (no comparables en cifras, dado que no hay datos publicos de parametros ni de rendimiento):

| Alternativa | Tipo | Relacion con este modelo |
|---|---|---|
| Jefe de reglas del simulador CONNECT TYCOON | Politica heuristica | Es el profesor usado en la fase de imitacion y la linea base de la evaluacion publicada |
| PPO de una libreria estandar (por ejemplo, Stable-Baselines3) entrenado en el mismo entorno | Politica de RL | Alternativa metodologica, sin resultados publicados para este simulador |
| Clasificador supervisado sobre el estado del departamento | Modelo discriminativo | Alternativa simple a la fase de imitacion; no capturaria la optimizacion multiobjetivo con recompensa |

## Limitaciones y advertencias
- Es un modelo de simulacion educativa: el propio autor advierte que no garantiza ni predice resultados de gestion reales.
- Dominio cerrado: solo cubre el conjunto de decisiones del simulador CONNECT TYCOON (personal, inventario, marketing, atencion al cliente, reembolsos y seguridad), con la configuracion de empresa declarada.
- Idioma: las interacciones y etiquetas estan en coreano; no hay soporte multilingue declarado.
- Sin explicabilidad: el campo `reason` es una cadena fija, por lo que no se puede auditar el motivo de una decision a partir de la salida.
- Riesgo de sobreajuste al simulador y al jefe de reglas: la evaluacion publicada se limita a 40 meses no vistos y no incluye validacion externa ni comparacion con otros algoritmos.
- Herramienta joven y sin traccion: cero descargas y cero likes en el momento de la consulta; el identificador del repositorio contiene una errata ("commpany"), lo que puede provocar confusion al referenciarlo.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero no se documentan avisos adicionales sobre los datos sinteticos de entrenamiento.
- No debe usarse como asesor financiero, legal ni de RRHH, ni para tomar decisiones sobre personas reales.

## Enlaces
- HuggingFace: https://huggingface.co/sunyoungKim/connectailab-rl-lco-ai-commpany-v1-teacher
- Repositorio GitHub de CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Formato JEV referenciado por el modelo: `typesafe/jev-1.13` (sin URL publica en la informacion disponible)
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de aprendizaje por refuerzo): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces listados proceden de la model card del autor.
