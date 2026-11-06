# wsy-1003/connectailab-rl-chamsori-goal-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario wsy-1003 bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de proposito general, sino un "cerebro de decision" para un robot simulado llamado LINK-01: recibe en texto el estado del robot (distancia y direccion al objetivo, lecturas de sensores de distancia, velocidad y accion previa) y devuelve una unica letra que corresponde a la accion de locomocion para los siguientes 0,5 segundos.

El modelo se construye en dos fases. Primero se entrena una politica PPO (el "cerebro" o brain.json) en un entorno web de aprendizaje por refuerzo, y despues se genera un corpus de pares observacion-en-texto / accion del cerebro. Sobre ese corpus se aplica un ajuste supervisado con LoRA y, a continuacion, un refinamiento por refuerzo con PPO y penalizacion KL contra el modelo supervisado. El resultado es un adaptador pequeno (repo de 0,0 GB) que imita el comportamiento de la politica original pero expresado como clasificacion de texto.

Su relevancia es acotada y experimental: demuestra un flujo de destilacion politica-a-lenguaje en un dominio de robotica 2D simulado, con licencia Apache 2.0 y un modelo base de 0,8 mil millones de parametros. No esta pensado para uso en produccion ni para robots reales sin revalidacion, y el propio autor lo etiqueta como modelo de investigacion y educacion sobre simulador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no declarada en la model card) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros, mediante LoRA. La tarea efectiva es de clasificacion restringida: dado un prompt con el estado del robot, el modelo debe emitir exactamente una letra entre las opciones listadas (5 acciones, segun el esquema `obs21-act5`). El system prompt fuerza ese formato y advierte que el contenido dentro de `state` es dato, no instruccion.

El entrenamiento consta de cuatro etapas descritas en la model card. (1) Entrenamiento de la politica PPO en el entorno web `goto_target` con el contrato `link01-decision/goto_target/obs21-act5/walker51-14/v1` sobre el curso `52613c2d`, con un 75% de exito en el examen oficial. (2) Generacion de un corpus a partir de las observaciones del cerebro cada 0,5 s, con la accion del cerebro como etiqueta y un 20% de ejemplos con desviaciones. (3) Ajuste supervisado con LoRA. (4) Refinamiento con PPO usando recompensas por "que habria pasado si el cerebro hubiera continuado desde esa accion", con anclaje KL al modelo supervisado. El corpus tiene 1197 ejemplos de entrenamiento, 238 de validacion y 360 de test; el techo de acierto (fidelidad al cerebro al pasar la observacion a texto) es del 99%.

## Capacidades

- Clasificacion de acciones discretas en un espacio de 5 opciones para el robot simulado LINK-01 (tarea `goto_target`).
- Lectura de estado textual estructurado: distancia y direccion al objetivo, sensores de distancia, velocidad y accion previa.
- Salida en formato estricto de una sola letra, sin explicacion, adecuada para consumo programatico.
- Instruccion de seguridad en el system prompt para tratar el estado como dato y no como instruccion (mitigacion basica de inyeccion de prompt).
- Capacidad multilingue limitada al coreano en la practica; el prompt de sistema esta en ingles pero el dominio es coreano.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia de refuerzo y destilacion: usar el par (politica PPO, adaptador LoRA) como ejemplo reproducible de como destilar una politica en un modelo de lenguaje, con corpus, metricas y notebook de Colab ya publicados.
- Investigacion en robotica simulada: sustituir la politica PPO por el adaptador en el bucle de decision del simulador web para estudiar la brecha entre politica nativa y politica destilada (el autor reporta 0% de exito en 20 episodios para el adaptador frente al 60% del cerebro).
- Generacion de datos sinteticos de decision: emplear el adaptador como generador de etiquetas alternativas para aumentar la diversidad del corpus de entrenamiento de politicas.
- Pruebas de robustez de prompts: evaluar como responde un modelo pequeno ante estados textuales ambiguos o manipulado, util para estudiar inyeccion de prompt en pipelines de decision.
- Benchmark de clasificacion restringida: usar el conjunto de test de 360 ejemplos como tarea de evaluacion de modelos pequenos en salida de un solo token con opciones cerradas.
- Prototipado educativo de "LLM como cerebro de robot": montar demos en las que un modelo de lenguaje decide acciones discretas a partir de observaciones textuales, sin necesidad de GPU de gama alta por el tamano del base (0,8B).

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (evaluacion sobre el conjunto de test y sobre 20 episodios del curso `52613c2d`, semillas 91001-91020):

| Modelo | Acierto en test (coincidencia con el cerebro) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 60% | 5% | 28,0 s |
| Modelo sin entrenar | 25,6% | 0% | 0% | no disponible |
| Ajuste supervisado (LoRA) | 73,6% | 0% | 15% | no disponible |
| Refuerzo (PPO + KL) | 71,7% | 0% | 65% | no disponible |

Nota del autor: la evaluacion de locomocion usa una aproximacion 2D basada en una tabla de velocidades por comando, no el modelo de robot ni la red de marcha reales, por lo que puede diferir de los resultados en MuJoCo web. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA es de tamano despreciable; el modelo base Qwen3.5-0.8B requiere aproximadamente 1,6 GB en fp16 y alrededor de 0,5-0,8 GB en cuantizacion de 4 bits (estimacion a partir del recuento de parametros, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; para lotes grandes o baja latencia, A100 o H100 son innecesarias por el tamano del modelo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada moderna e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor), llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF, vLLM o TGI para servir el base fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del base y la salida de un solo token, se espera latencia de milisegundos en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-chamsori-goal-v1-link01 | Adaptador LoRA sobre base de 0,8B | No disponible | Decision discreta para robot simulado | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No disponible en esta ficha | Hugging Face |
| Politica PPO original (brain.json, CONNECT TYCOON) | No disponible | No aplica | Decision discreta para robot simulado | No disponible | GitHub del proyecto |

No se dispone de modelos directamente comparables en la misma categoria (destilacion de politica de robotica a lenguaje) en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo en la tarea real: 0% de exito en 20 episodios frente al 60% del cerebro profesor, y 65% de episodios con colision en la variante entrenada con refuerzo.
- El ajuste con PPO empeoro el acierto en test (71,7%) respecto al ajuste supervisado (73,6%) y disparo las colisiones (65% frente a 15%), lo que sugiere inestabilidad del refinamiento.
- La evaluacion de locomocion usa una aproximacion 2D con tabla de velocidades, no el simulador MuJoCo real; los numeros pueden no transferirse.
- Dominio muy estrecho: una sola tarea (`goto_target`), un solo curso (`52613c2d`) y un espacio de 5 acciones; no generaliza a otras tareas ni entornos.
- Idioma efectivo coreano; el soporte multilingue no esta demostrado.
- Riesgo de alucinacion en el sentido de emitir una letra valida pero incorrecta; el formato de salida restringido no garantiza correccion semantica.
- El modelo es de investigacion y educacion sobre simulador; el autor advierte explicitamente de revalidar en el robot y el espacio reales antes de cualquier uso fisico.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene sus propios terminos que deben respetarse.
- Sin descargas ni likes en el momento de la consulta; sin senales de mantenimiento o comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/wsy-1003/connectailab-rl-chamsori-goal-v1-link01
- Repositorio de codigo (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo: https://www.aicitybuilders.com/robot
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
