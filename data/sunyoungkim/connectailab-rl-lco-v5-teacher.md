# sunyoungKim/connectailab-rl-lco-v5-teacher

## Resumen

connect-ai-company-v5 es una politica de aprendizaje por refuerzo (RL) entrenada para operar una empresa sintetica dentro del simulador CONNECT TYCOON. Lo desarrolla sunyoungKim (LCO_Official), un proyecto de investigacion aplicada en el marco de CONNECT AI LAB, y se publica como un modelo de decision, no como un modelo de lenguaje: su funcion es elegir acciones de negocio (contratacion, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad) durante 20 dias laborables simulados.

El modelo no genera texto libre. Recibe un estado del juego en formato JEV (JSON estructurado de typesafe/jev-1.13) y devuelve una respuesta tambien en JEV, con la opcion elegida, la distribucion de probabilidad sobre las alternativas y un grado de confianza. Segun la model card, se entrena en dos fases: primero imita a un "presidente por reglas" mediante aprendizaje supervisado y despues ajusta su politica con PPO usando como recompensa el valor de la empresa (beneficio, satisfaccion del cliente y riesgo).

La relevancia es acotada y de tipo educativo/investigador: sirve como referencia para estudiar RL aplicado a la toma de decisiones empresariales y como modelo "profesor" (de ahi el sufijo teacher) para experimentos de destilacion o de interaccion humano-en-el-bucle. No es un modelo de produccion ni un sistema de gestion real; la propia model card aclara que se trata de un modelo educativo sobre un simulador de empresa sintetica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | politica de aprendizaje por refuerzo profundo entrenada con PPO (arquitectura de red neuronal concreta no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; trabaja sobre estados JEV por decision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko); interfaz de estado y respuesta en formato JEV |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (la libreria declarada es numpy) |

## Arquitectura y entrenamiento

La model card describe una politica de decision entrenada mediante aprendizaje por refuerzo profundo con PPO (Proximal Policy Optimization). El proceso de entrenamiento consta de dos etapas: en la primera, el modelo aprende por imitacion de un "presidente por reglas" (aprendizaje supervisado a partir de las decisiones de una heuristica); en la segunda, ajusta esa politica inicial con PPO optimizando la recompensa definida por el valor de la empresa, con pesos explicitos de `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfaccion del cliente y riesgo, todos con peso 1.0). El nombre `teacher` sugiere su uso como modelo profesor en esquemas de destilacion o de generacion de datos de decision.

El modelo opera sobre el simulador CONNECT TYCOON, que modela una empresa a lo largo de 20 dias laborables (un mes). La configuracion de empresa usada es `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. El modelo recibe el estado y una bateria de preguntas tipadas y responde con una eleccion, una distribucion de probabilidad sobre las opciones y una confianza asociada. La model card no detalla el numero de tokens de entrenamiento, la composicion del conjunto de datos ni el tamano de la red neuronal empleada; esa informacion no esta disponible.

## Capacidades

- Toma de decisiones empresariales secuenciales en un simulador: asignacion de personal, pedidos de inventario, marketing, atencion al cliente, gestion de reembolsos y seguridad.
- Respuesta estructurada en formato JEV (typesafe/jev-1.13), no en lenguaje natural.
- Salida con distribucion de probabilidad sobre las opciones disponibles y una medida de confianza (por ejemplo, `full: 0.8586`, `partial: 0.0019`, `deny: 0.0592`, `human: 0.0803` en el caso de reembolso documentado).
- Soporte de preguntas de tipo eleccion (`type: choice`) con criterios definidos por el entorno.
- Gestion de estado contextual del episodio (departamento, motivo, nivel de cliente, importe, `fraud_score`, etc.).
- Optimizacion multiobjetivo declarada: beneficio, satisfaccion del cliente y evitacion de riesgo.
- Uso previsto como modelo profesor en experimentos de destilacion o de aprendizaje con intervencion humana.

No se documentan capacidades de generacion de texto, vision, audio, tool calling, function calling ni razonamiento multi-paso autonomo en el sentido de un LLM. El modelo no es un agente conversacional.

## Casos de uso

- Investigacion en aprendizaje por refuerzo aplicado a la empresa: usar la politica como entorno de referencia para comparar algoritmos (PPO frente a otras variantes) sobre una misma funcion de recompensa multiobjetivo (beneficio, satisfaccion, riesgo).
- Modelo profesor para destilacion de politicas: dado el sufijo `teacher`, resulta adecuado para generar decisiones etiquetadas a partir del estado JEV y entrenar una politica estudiante mas ligera.
- Simulacion docente de gestion: integrarlo en un aula o taller para que estudiantes observen como una politica RL opera una empresa y contrasten sus decisiones con una heuristica de reglas.
- Desarrollo y prueba de agentes en el entorno CONNECT TYCOON: sirve como oponente o como director de la simulacion mediante `connect-tycoon play --brain hf:sunyoungKim/connectailab-rl-lco-v5-teacher`.
- Experimentos de human-in-the-loop: la propia salida del modelo contempla la opcion `human` (derivacion a una persona), lo que permite estudiar politicas de escalado cuando la confianza es baja.
- Evaluacion de heuristica frente a RL: la comparacion publicada (beneficio medio, satisfaccion, incidentes) permite cuantificar la ganancia de sustituir una politica de reglas por una politica aprendida en el mismo simulador.
- Pruebas de integracion del pipeline JEV: validar la tuberia `CompanyBrain.from_hub(...)` y el contrato de entrada/salida JEV antes de conectar modelos de decision propios.

## Benchmarks y rendimiento

La model card publica una comparacion entre el "presidente por reglas" y connect-ai-company-v5 sobre la media de 40 meses. Son los unicos datos de rendimiento disponibles:

| Metrica (media de 40 meses) | Presidente por reglas | connect-ai-company-v5 |
|---|---|---|
| Beneficio mensual | 3,24 millones de won | 11,72 millones de won |
| Satisfaccion del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 1,7 |
| Derramaciones a confirmacion humana | 37,8 | 9,7 |
| Dias con rotura de stock | 10,7 | 0,5 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, ni resultados en suites de RL como Atari, MuJoCo o Procgen.

## Requisitos de hardware

- La libreria declarada es numpy, lo que sugiere que la politica puede ejecutarse en CPU sin acelerador grafico. No se especifica tamano de red ni precision.
- VRAM estimada: no disponible (depende del tamano de la red, que no se publica).
- GPU recomendadas: no disponibles; previsiblemente innecesarias si la politica es pequena; una GPU de consumo (por ejemplo, una RTX 3060 o superior) seria mas que suficiente en caso de requerir aceleracion.
- Encaje en GPU de consumo: muy probablemente si, en CPU; no confirmado por el autor.
- Opciones de despliegue: al no ser un LLM, no se aplican vLLM, TGI ni llama.cpp. La via documentada es la libreria `connect-tycoon` (`pip install "connect-tycoon[game]"`) y la carga mediante `CompanyBrain.from_hub`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables de la misma categoria (politicas RL especificas de simulacion empresarial) en la informacion proporcionada. El unico contraste documentado es con el propio "presidente por reglas" del simulador, resumido en la seccion de benchmarks.

| Modelo | Tipo | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| connect-ai-company-v5 | politica RL (PPO) | imitacion de reglas + PPO | Apache 2.0 | HuggingFace |
| Presidente por reglas (CONNECT TYCOON) | heuristica | no aprende | no aplicable | incluido en el simulador |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintetico: la model card advierte expresamente que no garantiza ni predice resultados de gestion reales.
- No es un modelo de lenguaje: no genera texto libre, no mantiene conversaciones y no admite tool calling ni function calling al uso.
- Idioma limitado al coreano (ko); no se documenta soporte multilingue.
- El rendimiento esta medido exclusivamente sobre la configuracion de empresa indicada; se desconoce su comportamiento con otros parametros del simulador.
- Dependencia fuerte del contrato JEV: cualquier uso fuera de ese formato de estado y respuesta requiere adaptacion.
- Riesgo de sobreajuste al simulador y a la politica de reglas usada en la fase de imitacion; no hay datos publicados sobre generalizacion.
- Sin validacion externa: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe comunidad que haya verificado sus resultados.
- Sesgos potenciales derivados de la funcion de recompensa (pesos iguales de beneficio, satisfaccion y riesgo) y de la heuristica profesora, no analizados en la documentacion.
- Licencia Apache 2.0, que permite uso comercial del codigo y los pesos; conviene revisar, no obstante, la licencia de la libreria `connect-tycoon` y de `typesafe/jev-1.13`.
- Los resultados economicos publicados (por ejemplo, 11,72 millones de won de beneficio) son unidades del simulador y no dinero real.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los unicos resultados obtenidos trataban de turismo en Dubai y no guardan relacion con la ficha).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sunyoungKim/connectailab-rl-lco-v5-teacher
- Repositorio CONNECT TYCOON en GitHub: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para el modelo de decision RL: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Connect AI: https://www.ezerai.xyz
- Instagram de LCO_Official: https://www.instagram.com/the_lco_office/
- Blog de Naver de LCO_Official: https://blog.naver.com/mom_ai_growth
