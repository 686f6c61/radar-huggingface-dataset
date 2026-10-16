# tazza11/connectailab-rl-simba-v2-teacher

## Resumen
connectailab-rl-simba-v2-teacher es una política de aprendizaje por refuerzo (RL) publicada por el desarrollador tazza11 dentro de la iniciativa CONNECT AI LAB, orientada a la toma de decisiones empresariales dentro del simulador CONNECT TYCOON. No es un modelo de lenguaje generativo al uso: es un "cerebro" de decisión que administra una empresa sintetica durante un mes de simulacion (20 dias laborables) tomando decisiones de asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad.

El modelo se entrena en dos fases: primero aprende por imitacion de un "CEO basado en reglas" (aprendizaje supervisado) y despues ajusta su politica con PPO, usando como recompensa una funcion de valor de empresa compuesta por tres criterios ponderados a 1.0: beneficio, satisfaccion del cliente y evitacion de riesgo. Todas sus respuestas se emiten en el formato tipado JEV (typesafe/jev-1.13), lo que permite preguntarle decisiones de tipo opcion multiple con probabilidades asociadas.

Su relevancia es principalmente educativa y de investigacion: sirve como ejemplo reproducible de un pipeline RL (imitacion + PPO) aplicado a un entorno tipo Gymnasium, empaquetado en la libreria numpy, con licencia Apache 2.0 y consumo de inferencia ligero (sin necesidad de GPU). Su alcance esta acotado al simulador y al idioma coreano.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo (PPO) con fase previa de aprendizaje supervisado por imitacion de un CEO basado en reglas. Backbone subyacente no especificado en la model card (libreria numpy) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el estado se pasa como estructura JEV, no como tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria numpy; no se detalla el formato exacto de los pesos) |

## Arquitectura y entrenamiento
El modelo actua como el "cortex prefrontal" del simulador CONNECT TYCOON: recibe un estado estructurado (por ejemplo, un departamento, un motivo, un tramo de cliente, un importe y una puntuacion de fraude) y devuelve una decision de tipo eleccion con probabilidades. El entrenamiento combina dos etapas: primero una imitacion supervisada de un CEO con reglas, y despues un ajuste con PPO guiado por una funcion de recompensa que pondera beneficio, satisfaccion del cliente y riesgo (los tres a 1.0 para esta variante "teacher"). El empaquetado se realiza en numpy y la integracion se expone a traves de la clase `CompanyBrain` del paquete `connect-tycoon`.

La model card no detalla el numero de tokens, la composicion del dataset, el backbone concreto ni los hiperparametros de PPO. El cuaderno de Colab asociado en el repositorio se llama `rl_decision_model_qwen_colab.ipynb`, lo que podria sugerir un posible backbone inspirado en Qwen, pero la model card no confirma esta base arquitectonica, por lo que debe considerarse no verificado. El modelo esta pensado para operar sobre una configuracion concreta de empresa (`warehouse` 250.0, `base_demand` 40.0, `unit_cost` 1.5, `order_scale` 1.0, `ad_power` 1.0, entre otros parametros).

## Capacidades
- Toma de decisiones discretas de tipo opcion multiple con probabilidades por alternativa y nivel de confianza (por ejemplo, `deny` con probabilidad 0.9317 ante una solicitud de reembolso).
- Operacion completa de una empresa simulada durante un mes: asignacion de personal, pedidos de inventario, marketing, atencion al cliente, gestion de reembolsos y seguridad.
- Optimizacion multiobjetivo de beneficio, satisfaccion del cliente y evitacion de riesgo, en lugar de maximizar una unica metrica.
- Emision de resultados en el formato tipado JEV (`typesafe/jev-1.13`), lo que facilita integrarlo en flujos de decision estructurados.
- Soporte multilingue: unicamente coreano (ko).
- Capacidad de inferencia en CPU al estar empaquetado con numpy (sin GPU requerida).
- No dispone de tool calling, function calling, generacion de texto libre, vision ni audio; su salida es estrictamente una decision estructurada.

## Casos de uso
- Gestion automatizada dentro de CONNECT TYCOON: instalar el modelo como cerebro de la empresa con `connect-tycoon play --brain hf:tazza11/connectailab-rl-simba-v2-teacher` para operar el negocio simulado a lo largo de un mes de 20 dias.
- Investigacion educativa en RL: usar el pipeline imitacion + PPO como ejemplo didactico de como pasar de una politica de reglas a una politica aprendida con recompensa compuesta.
- Comparacion de politicas de decision: medir la mejora frente al CEO basado en reglas en beneficio mensual (1.121万 won frente a 324万 won), satisfaccion (95 % frente a 79 %) e incidentes de riesgo (1,4 frente a 7,8).
- Prototipado de agentes de decision con salida tipada: integrar respuestas JEV en un sistema que necesite decisiones discretas auditables con probabilidades (por ejemplo, reembolsos, marcado de fraude o confirmacion humana).
- Docencia de RL aplicado a negocios: emplear el simulador y el modelo para ilustrar el diseno de funciones de recompensa multiobjetivo en cursos de IA.
- Demostracion de IA local y ligera: ejecutar el modelo sin GPU dentro del ecosistema `connect-tycoon`, util en talleres y entornos con recursos limitados.
- Evaluacion de politicas de reembolso y atencion al cliente: analizar decisiones granulares como aceptar, rechazar o derivar a revision humana una solicitud, con el coste asociado por caso.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta una comparacion frente al CEO basado en reglas, promediada sobre 40 meses no vistos:

| Metrica (media de 40 meses) | CEO basado en reglas | connectailab-rl-simba-v2-teacher |
|---|---|---|
| Beneficio mensual | 324万 won | 1121万 won |
| Satisfaccion del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 1,4 |
| Casos derivados a revision humana | 37,8 | 15,4 |
| Dias de rotura de stock | 10,7 | 0,7 |

## Requisitos de hardware
- VRAM estimada: no disponible; el modelo se sirve con numpy y no declara requisitos de GPU, por lo que puede ejecutarse en CPU.
- GPU recomendadas: no disponible (no se requiere GPU segun la informacion proporcionada).
- Compatibilidad con GPU de consumo: no disponible; previsiblemente innecesaria dado el empaquetado en numpy.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga via `ct.CompanyBrain.from_hub("tazza11/connectailab-rl-simba-v2-teacher")` y ejecucion interactiva con `connect-tycoon play`. No hay indicios de soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (politicas RL especificas de simuladores de gestion empresarial). La unica referencia de comparacion es el CEO basado en reglas del propio simulador, incluido en la tabla de benchmarks anterior. Como referencia de contexto, esta variante "teacher" pertenece a la familia `connectailab-rl-simba-v2` del mismo autor, pero no se aportan datos de la variante respecto a la que se distingue.

## Limitaciones y advertencias
- Modelo educativo sobre un simulador de empresa sintetico: la propia model card indica que no garantiza ni predice resultados de gestion reales.
- Alcance limitado al entorno CONNECT TYCOON y a una configuracion concreta de empresa (parametros `warehouse`, `base_demand`, `unit_cost`, etc.); fuera de esa configuracion su comportamiento no esta validado.
- Idioma limitado al coreano (ko): no se declara soporte para castellano ni otros idiomas.
- Salida restringida a decisiones estructuradas JEV; no genera texto libre, codigo ni razonamiento abierto, por lo que no debe esperarse de el comportamiento de un LLM.
- No se detalla el backbone, el dataset de entrenamiento ni los hiperparametros, lo que dificulta evaluar sesgos y reproducibilidad.
- Riesgo de sobreajuste a la funcion de recompensa definida (beneficio, satisfaccion, riesgo a 1.0); cambios en las ponderaciones podrian alterar sustancialmente las decisiones.
- No dispone de datos de descargas ni de likes (0 y 0 en el momento de la ficha), lo que indica una adopcion muy baja y poca validacion externa.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un modelo educativo no se recomienda su uso en produccion real sin validacion adicional.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tazza11/connectailab-rl-simba-v2-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab (entrenamiento RL): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Formato JEV referenciado: `typesafe/jev-1.13`
