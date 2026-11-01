# wsy-1003/connectailab-rl-chamsori-goal-v2-link01

## Resumen

LINK-01 (variante `chamsori-goal-v2-link01`) es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario wsy-1003 en el marco del proyecto CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje generalista: es un "cerebro de decision" para el robot simulado LINK-01, entrenado para leer en texto el estado del robot (distancia y direccion al objetivo, sensores de distancia, velocidad y accion previa) y responder con una sola letra que codifica como caminar durante los siguientes 0,5 segundos.

El modelo se construye en dos fases. Primero, un agente PPO entrenado en un entorno web de aprendizaje por refuerzo (tarea `goto_target`, contrato `link01-decision/goto_target/obs21-act5/walker51-14/v1`, curso `52613c2d`, 75 % en el examen oficial) genera las etiquetas: cada 0,5 segundos se convierte su observacion en texto y su accion en la respuesta correcta. Despues, el modelo de lenguaje aprende por imitacion (LoRA supervisado) y se refina con RL (PPO con ancla KL) para subir la probabilidad de opciones que producen mejores recompensas que la accion del profesor.

Es relevante como ejemplo de destilacion de politicas de RL en un LLM pequeno (0,8B) mediante representacion textual del estado y salida restringida a un conjunto de letras. El autor advierte que es un modelo de investigacion y educacion sobre simulador, no validado para robots reales. El repositorio pesa 0,0 GB (solo adaptador) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parametros totales | No disponible (el adaptador LoRA no declara numero de parametros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la model card) |
| Tipos de cuantizacion | No disponible (solo se publican pesos del adaptador en safetensors) |
| Idiomas soportados | Coreano (ko); las instrucciones del sistema estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parametros, y se entrena con PEFT/LoRA. La tarea esta formalizada como clasificacion de una sola letra entre cinco opciones (contrato `obs21-act5`: 21 dimensiones de observacion, 5 acciones), con un prompt de sistema que obliga a devolver unicamente la letra elegida y a tratar el contenido de `state` como datos y no como instrucciones.

El pipeline de datos consta de tres conjuntos: 1.197 ejemplos de entrenamiento, 238 de validacion y 360 de test. Las etiquetas provienen de un agente PPO entrenado en el simulador web (tarea `goto_target`), que alcanza el 75 % en el examen oficial; el 20 % de los ejemplos corresponden a situaciones en las que el profesor se desvio del camino optimo, para que el alumno aprenda a recuperarse. La tasa de coincidencia entre la representacion textual y la decision del profesor (techo de acierto) es del 99 %. El entrenamiento combina una fase de imitacion supervisada (LoRA) y una fase de RL con PPO y ancla KL, donde cada opcion se recompensa por el retorno obtenido si el resto de la trayectoria la ejecuta el profesor.

La evaluacion de caminata se realiza con una aproximacion 2D basada en una tabla de velocidades medidas por comando, sin red neuronal de locomocion ni modelo fisico del robot; el autor indica que los resultados pueden diferir de los de MuJoCo en el navegador.

## Capacidades

- Decision de accion discreta: dado un estado textual del robot, devuelve una unica letra entre cinco opciones de locomocion.
- Razonamiento de corto horizonte: la decision cubre los siguientes 0,5 segundos de marcha.
- Interpretacion de observaciones estructuradas: distancia y direccion al objetivo, sensores de distancia, velocidad y accion previa (21 dimensiones).
- Robustez parcial ante desviaciones: entrenado con un 20 % de ejemplos de trayectorias erroneas del profesor.
- Salida restringida: el prompt de sistema fuerza una sola letra sin explicacion, lo que facilita el parseo en bucle de control.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue limitada al coreano como idioma declarado; el prompt de sistema esta en ingles.

## Casos de uso

- Bucle de control en simulador: integrar el adaptador como politica de decision de LINK-01 en el entorno web, sustituyendo al cerebro PPO y consumiendo la salida de una letra por ciclo de 0,5 segundos.
- Docencia de RL y destilacion: usar el par profesor PPO / alumno LoRA como ejemplo practico de como trasladar una politica de refuerzo a un modelo de lenguaje pequeno, con el notebook de Colab del autor.
- Generacion de datos sinteticos de decision: emplear el modelo para etiquetar estados textuales y ampliar el conjunto de entrenamiento de otros agentes.
- Investigacion en representacion textual de estados: evaluar como afecta la codificacion en lenguaje natural de observaciones numericas al rendimiento de un LLM de 0,8B frente a una politica nativa.
- Pruebas de robustez de prompts: analizar el comportamiento del modelo ante estados ambiguos o inyecciones de instrucciones dentro del campo `state`, dado el enfasis del autor en tratarlo como datos.
- Prototipado de bajo coste: desplegar el adaptador en hardware modesto (modelo base de 0,8B) para experimentar con bucles de decision antes de invertir en politicas mayores.
- Benchmark de evaluacion de agentes: reutilizar los conjuntos train/valid/test (1.197/238/360) y el protocolo de 20 partidas con semillas 91001-91020 como referencia reproducible.

## Benchmarks y rendimiento

Resultados publicados por el autor (acierto en el conjunto de test frente al profesor y evaluacion de 20 partidas en el curso `52613c2d`, semillas 91001-91020):

| Modelo | Acierto en test (coincidencia con el profesor) | Partidas exitosas (de 20) | Partidas con colision | Tiempo medio en partidas exitosas |
|---|---|---|---|---|
| Profesor (cerebro PPO) | 100,0 % | 60 % | 5 % | 28,0 s |
| Sin entrenar (base) | 25,6 % | 0 % | 0 % | — |
| Supervisado (LoRA) | 73,6 % | 0 % | 15 % | — |
| RL (PPO + KL) | 71,7 % | 0 % | 65 % | — |

El autor indica que la version subida al repositorio es la de aprendizaje supervisado. La evaluacion de caminata usa una aproximacion 2D con tabla de velocidades, no MuJoCo, por lo que los resultados pueden diferir del simulador web.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de un adaptador sobre un modelo de 0,8B, la inferencia en fp16 requiere del orden de 2 GB y en cuantizacion de 4 bits alrededor de 1 GB, aunque estas cifras no las publica el autor.
- GPU recomendadas: no especificadas; por tamano del modelo base, cabe en GPUs consumer de gama media y en CPU.
- Cabe en GPU consumer: si, por el tamano del modelo base (0,8B); no hay mediciones publicadas.
- Opciones de despliegue: transformers + PEFT (metodo documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados con el mismo enfoque (destilacion de politica PPO en un LLM mediante estados textuales) en la informacion proporcionada. Como referencia del modelo base y de la politica origen:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-chamsori-goal-v2-link01 | LoRA sobre LLM | No disponible (base 0,8B) | No disponible | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B | LLM base | 0,8B | No disponible | No disponible en la informacion | HuggingFace |
| Cerebro PPO del autor (brain.json) | Politica RL | No disponible | No aplica | No disponible | Proyecto CONNECT TYCOON |

## Limitaciones y advertencias

- Modelo de investigacion y educacion sobre simulador; el autor recomienda revalidarlo en el robot y el espacio reales antes de cualquier uso fisico.
- La evaluacion de caminata emplea una aproximacion 2D con tabla de velocidades, no el simulador MuJoCo; los resultados pueden no trasladarse al entorno real.
- El modelo subido es la version supervisada: 0 partidas exitosas de 20 y un 15 % de colisiones en la evaluacion del autor.
- La version con RL obtuvo peor acierto en test (71,7 %) y un 65 % de colisiones, por lo que no se recomienda como sustituto directo del profesor.
- Salida limitada a una letra entre cinco opciones; no es utilizable como modelo de lenguaje general.
- Idioma declarado unicamente coreano; el prompt de sistema esta en ingles y no se documenta comportamiento en castellano.
- Riesgo de inyeccion de instrucciones a traves del campo `state`: el propio autor incluye una instruccion de sistema para mitigarlo, lo que sugiere que el riesgo existe.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene sus propias condiciones, no detalladas en la informacion disponible.
- Repositorio sin descargas ni likes y creado el 2026-11-01; no hay evidencia de uso externo ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wsy-1003/connectailab-rl-chamsori-goal-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL con robots: https://www.aicitybuilders.com/robot
