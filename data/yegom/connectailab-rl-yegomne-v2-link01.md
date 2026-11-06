# yegom/connectailab-rl-yegomne-v2-link01

## Resumen

`yegom/connectailab-rl-yegomne-v2-link01` es un adaptador LoRA sobre el modelo base `Qwen/Qwen3.5-0.8B` (0,8 mil millones de parametros) publicado por el desarrollador Sehyun Park (Yegom) dentro del ecosistema CONNECT AI LAB / CONNECT TYCOON. No es un modelo de lenguaje generalista: es un modelo de decision para el robot simulado LINK-01, entrenado para leer en texto el estado del robot (distancia y direccion al objetivo, sensores de distancia, velocidad y accion previa) y responder con una unica letra que codifica la accion de locomocion a ejecutar durante los siguientes 0,5 segundos.

El pipeline combina aprendizaje por refuerzo (PPO) y ajuste de lenguaje: primero se entrena una "politica maestra" (brain.json) en un entorno web de MuJoCo con la tarea `goto_target`, despues se genera un conjunto de preguntas a partir de las observaciones de esa politica y se hace un ajuste supervisado (LoRA) sobre Qwen3.5-0.8B, y finalmente se aplica un refinamiento con RL (etiquetado PPO) usando KL para no alejarse demasiado de la politica supervisada. El resultado es un adaptador pequeno (repo de 0,0 GB) que reproduce casi el 84 % de las decisiones de la politica maestra y completa el 70 % de las rutas de evaluacion en 20 episodios.

Su relevancia es acotada pero interesante como caso de estudio: demuestra como destilar una politica RL en un LLM pequeno para obtener un controlador basado en lenguaje, interpretable y ejecutable en hardware modesto, con un formato de salida estricto (una letra) apto para bucles de control de baja latencia. No debe confundirse con un modelo conversacional ni con un modelo de robotica de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | coreano (ko) segun la model card; el prompt de sistema esta en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`) |
| Pipeline declarado | reinforcement-learning |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tarea | `goto_target` (navegacion bipeda hacia objetivo con evitacion de obstaculos) |
| Accion | una letra entre 5 opciones (obs21-act5) |
| Frecuencia de decision | cada 0,5 segundos |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. El entrenamiento se organiza en cuatro fases descritas en la model card: (1) entrenamiento PPO de una politica maestra en el entorno web de LINK-01 (tarea `goto_target`, contrato `link01-decision/goto_target/obs21-act5/walker51-14/v1`, curso `9743e4a0`); (2) generacion de un dataset de preguntas-respuesta a partir de las observaciones de esa politica, con un 20 % de ejemplos donde la politica se desvio deliberadamente hacia otras opciones; (3) ajuste supervisado con LoRA sobre el modelo base para imitar las respuestas de la politica; y (4) refinamiento con RL donde cada opcion se recompensa segun el retorno obtenido al dejar que la politica maestra continue la ruta, con una penalizacion KL para mantener la proxima distribucion cerca de la supervisada.

El dataset consta de 687 ejemplos de entrenamiento, 149 de validacion y 175 de test. La tasa de coincidencia entre la representacion textual y la decision de la politica maestra es del 100 %, lo que fija un techo teorico de acierto. La evaluacion se realiza colocando el modelo en el puesto de decision del robot y ejecutando el mismo curso durante 20 episodios con semillas 91001-91020, usando una aproximacion 2D de la marcha (tabla de velocidades por comando) en lugar de la simulacion MuJoCo completa, por lo que los resultados pueden diferir ligeramente de la simulacion fisica.

## Capacidades

- Clasificacion de acciones discretas: dado un estado del robot en texto, devuelve exactamente una letra entre cinco opciones.
- Decision de locomocion a corto plazo (0,5 s) para la tarea `goto_target`.
- Seguimiento de instrucciones de formato estricto: el prompt de sistema exige devolver solo la letra, sin explicacion.
- Tratamiento del estado como datos, no como instrucciones (defensa basica frente a inyeccion de prompt en el campo `state`).
- Razonamiento implicito sobre distancia, direccion, sensores y accion previa, destilado de una politica PPO.
- Capacidades multilingues: limitadas al coreano para el contenido del estado; el prompt de sistema esta en ingles.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Control de bajo nivel en simulacion: integrar el adaptador en el bucle de decision del robot LINK-01 para sustituir la politica PPO por un modelo de lenguaje que emite acciones a 2 Hz; adecuado por su salida de una sola letra y su bajo coste computacional.
- Destilacion de politicas RL en LLM: usar el pipeline descrito (PPO, generacion de preguntas, LoRA, RL con KL) como plantilla para convertir otras politicas de control en modelos de lenguaje pequenos e interpretables.
- Investigacion en robotica con lenguaje: analizar como un LLM de 0,8 B representa el estado de un robot y que informacion del estado es critica para la decision, comparando la tasa de acierto por campo.
- Educacion y divulgacion: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el entrenamiento completo en un entorno docente, con coste de GPU minimo.
- Evaluacion de robustez frente a inyeccion de prompt: el diseno del prompt de sistema (tratar `state` como datos) permite experimentar con ataques que intenten alterar la decision del controlador.
- Prototipado rapido de controladores basados en lenguaje: validar en un entorno 2D aproximado antes de invertir en simulacion MuJoCo completa o en hardware real.

## Benchmarks y rendimiento

Resultados publicados en la model card (tarea `goto_target`, curso `9743e4a0`):

| Modelo | Acierto en test (coincidencia con la politica maestra) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Politica maestra (PPO) | 100,0 % | 100 % | 5 % | 14,0 s |
| Modelo base sin ajuste | 50,9 % | 0 % | 45 % | no disponible |
| Ajuste supervisado (LoRA) | 82,3 % | 75 % | 60 % | 16,9 s |
| Refinamiento RL (adaptador publicado) | 84,0 % | 70 % | 75 % | 16,6 s |

Observacion: el refinamiento RL mejora el acierto en test (84,0 % frente a 82,3 %) pero empeora el exito en episodios (70 % frente a 75 %) y aumenta las colisiones (75 % frente a 60 %). La model card indica que el modelo subido finalmente es el de ajuste supervisado, no el de RL, pese al nombre del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,6 GB en fp16 para el modelo base de 0,8 B, mas el overhead del adaptador LoRA (muy pequeno); aproximadamente 0,5-1 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (RTX 3050, RTX 4060, RTX 4090); tambien A100/H100 para despliegues por lotes, aunque el modelo es demasiado pequeno para aprovecharlas.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado), vLLM y TGI con soporte de adaptadores LoRA, llama.cpp/Ollama si se fusiona el adaptador y se convierte a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles de forma oficial; a 2 Hz de decision (0,5 s por paso) el modelo de 0,8 B tiene margen sobrado en GPU consumer, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-yegomne-v2-link01 | 0,8 B (base) + LoRA | no disponible | Destilacion de politica PPO en LLM para LINK-01 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B | 0,8 B | no disponible | LLM generalista | no disponible en la informacion | Hugging Face |
| Politica PPO LINK-01 (brain.json) | no disponible | no aplica | Control RL puro en MuJoCo | no disponible | Repositorio CONNECT TYCOON |

No se dispone de datos de benchmarks comparativos con otros modelos de robotica basados en lenguaje (por ejemplo, RT-2, OpenVLA o pi0) en la informacion proporcionada; las diferencias de tarea y de escala hacen ademas que la comparacion directa carezca de sentido.

## Limitaciones y advertencias

- Modelo especifico de una unica tarea (`goto_target`) y un unico curso (`9743e4a0`): no generaliza a otras tareas, mapas ni robots sin reentrenamiento.
- Solo entiende coreano en el contenido del estado; el prompt de sistema esta en ingles y el modelo no es conversacional.
- Evaluacion realizada con una aproximacion 2D de la marcha (tabla de velocidades), no con MuJoCo completo ni con hardware real; los resultados pueden no transferirse.
- El modelo publicado es el de ajuste supervisado, mientras que la variante RL tuvo peor exito en episodios y mas colisiones; conviene verificar cual se esta usando.
- Tasa de colisiones elevada (60 % de los episodios en el modelo publicado, 75 % en el de RL): no apto para navegacion segura sin capa de seguridad adicional.
- Riesgo de alucinacion de formato: puede devolver texto adicional o una letra fuera del conjunto si el estado se sale de la distribucion de entrenamiento.
- Sesgos: no documentados; el dataset procede de una unica politica y un unico curso, por lo que hereda sus sesgos de comportamiento.
- Licencia Apache 2.0 permite uso comercial, pero la model card advierte que es un modelo de investigacion y educacion y debe revalidarse en el robot y el espacio reales antes de cualquier despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/yegom/connectailab-rl-yegomne-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
