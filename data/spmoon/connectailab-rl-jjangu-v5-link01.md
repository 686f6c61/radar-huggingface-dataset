# spmoon/connectailab-rl-jjangu-v5-link01

## Resumen

LINK-01 es un modelo de decision (policy) obtenido mediante ajuste fino con LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario spmoon en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. Su tarea concreta es leer en texto el estado actual de un robot simulado llamado LINK-01 (distancia al objetivo, direccion, sensores de distancia, velocidad y ultima accion tomada) y responder con una unica letra que representa el movimiento a ejecutar durante los siguientes 0,5 segundos. No es un modelo de lenguaje conversacional, sino un clasificador de acciones encastrado en la interfaz de un LLM.

El desarrollo sigue un pipeline de destilacion: primero se entrena una politica PPO (el "cerebro", brain.json) en un entorno web de aprendizaje por refuerzo; despues se generan pares observacion-texto / accion con esa politica como profesor; se hace aprendizaje supervisado con LoRA sobre Qwen3.5-0.8B; y finalmente se aplica una etapa de RL con PPO y penalizacion KL para alinear las respuestas del modelo con las del profesor. El resultado es un adaptador pequeno (repo de 0,0 GB) que reproduce el comportamiento de la politica original en un 85,9% de los casos en el conjunto de test.

Su relevancia es acotada pero ilustrativa: demuestra como se puede destilar una politica de RL en un modelo de lenguaje pequeno (0,8B parametros) para tareas de decision robotica discretizada, con licencia Apache 2.0 y artefactos publicos (codigo, notebook de Colab y modelo). Es un experimento educativo y de investigacion, no un sistema listo para produccion ni para robots reales sin revalidacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (modelo base Qwen3.5-0.8B, ~0,8B; el adaptador LoRA anade un numero no especificado de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no declarada en la model card) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors del adaptador; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA sobre el modelo base) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,8 mil millones de parametros. La tarea se formula como clasificacion de una sola letra entre un conjunto cerrado de opciones (observacion de 27 dimensiones, 5 acciones posibles, segun el identificador de tarea `link01-decision/follow_route/obs27-act5/walker51-14/v1`). El adaptador se carga con la libreria `peft` y se infiere con `transformers` estandar.

El entrenamiento se realizo en dos fases. Primero, aprendizaje supervisado sobre un dataset de 1.442 ejemplos de entrenamiento, 315 de validacion y 553 de test, generados a partir de las observaciones que la politica PPO registro mientras recorria el circuito `10a2285a`; el 20% de los ejemplos corresponden a situaciones en las que el profesor se desvio del camino, para ensenar al modelo a recuperarse. Segundo, una fase de RL con PPO en la que cada opcion se puntua por la recompensa obtenida al dejar que el profesor continuara la ruta, con una penalizacion KL que mantiene al modelo cerca de la politica de referencia. La model card indica que el modelo finalmente publicado es el de la fase de aprendizaje supervisado, no el de RL, porque obtuvo mejor rendimiento en la evaluacion de caminado.

La evaluacion se realizo mediante una aproximacion 2D del caminado (una tabla de velocidades medidas por comando, sin red neuronal de locomocion ni modelo fisico de robot), con 20 episodios sobre la misma ruta y semillas 91001-91020. La model card advierte que este procedimiento no reproduce exactamente los resultados de MuJoCo web.

## Capacidades

- Clasificacion de accion discreta: dado un estado textualizado del robot, devuelve una sola letra entre las opciones listadas.
- Seguimiento de ruta (`follow_route`): decision de caminado en pasos de 0,5 segundos orientada a alcanzar un objetivo.
- Razonamiento de un solo paso: no hay planificacion multi-paso explicita; la coherencia a largo plazo emerge de la iteracion del bucle de control.
- Resistencia a inyeccion de instrucciones: el prompt de sistema indica tratar el texto del estado como datos, no como instrucciones.
- Formato de salida restringido: solo la letra de la opcion elegida, sin explicacion.
- Idioma: coreano (el texto de los estados y las opciones esta en coreano).
- No soporta: generacion de texto libre, codigo, matematicas, vision, audio, tool calling ni function calling.

## Casos de uso

- Investigacion en destilacion de politicas RL: usar el modelo como caso de estudio de como una politica PPO puede transferirse a un LLM pequeno mediante LoRA y una etapa de RL con KL, comparando la tasa de coincidencia con el profesor (85,9% en test).
- Control de agente simulado en entornos web: integrar el modelo como "cerebro" en el simulador de robot de CONNECT AI WORLD para reproducir rutas previamente aprendidas sin necesidad de ejecutar la politica PPO original.
- Evaluacion de robustez a perturbaciones: el 20% del dataset incluye episodios de desvio, por lo que el modelo puede emplearse para probar estrategias de recuperacion de ruta en simulacion.
- Docencia y materiales de RL: el repositorio incluye notebook de Colab y codigo de entrenamiento, lo que permite usarlo como ejemplo practico en cursos de refuerzo y ajuste fino de LLM.
- Benchmark de interfaces texto-accion: sirve como linea base para comparar otras formulaciones de la misma tarea (por ejemplo, salida JSON estructurada frente a letra unica) o distintos tamanos de modelo base.
- Pruebas de seguridad de prompts: el diseno con instruccion explicita de tratar el estado como datos permite estudiar robustez frente a inyeccion de instrucciones en entradas de agente.
- Prototipado de bajo coste: al ser un adaptador de 0,0 GB sobre un modelo de 0,8B, se puede cargar en entornos con recursos limitados para experimentar con bucles de decision discretizados.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los de la evaluacion propia sobre el circuito `10a2285a`:

| Modelo | Acierto en test (misma respuesta que el profesor) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (PPO, brain.json) | 100,0% | 95% | 35% | No disponible |
| Modelo sin entrenar | 15,9% | 0% | 0% | No disponible |
| Aprendizaje supervisado (modelo publicado) | 85,9% | 80% | 20% | No disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card indica ademas que el techo teorico de acierto por la textualizacion del estado es del 99%.

## Requisitos de hardware

- VRAM estimada: al tratarse de un adaptador LoRA sobre un modelo base de ~0,8B parametros, la inferencia en precision completa (fp16/bf16) requiere aproximadamente 2 GB de VRAM; en cuantizacion de 8 bits, alrededor de 1 GB; en 4 bits, en torno a 0,5-0,7 GB. Estas cifras son estimaciones a partir del tamano del modelo base, no datos publicados en la model card.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien funciona en CPU para inferencia por lotes pequenos. Para el entrenamiento con LoRA se recomienda al menos una GPU con 8-16 GB.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer con al menos 4 GB de VRAM.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card); vLLM y TGI pueden servir el modelo fusionando previamente el adaptador LoRA; llama.cpp y Ollama requeririan conversion a GGUF, no documentada.
- Latencia y throughput: no disponibles. La tarea es de un unico token de salida, por lo que la latencia dominante sera el coste de prefill del prompt de estado, no la decodificacion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la busqueda proporcionada. Como referencia estructural, se incluye el modelo base del que deriva:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jjangu-v5-link01 (este modelo) | Adaptador LoRA sobre ~0,8B | No disponible | Clasificacion de accion robotica (5 opciones) | Apache 2.0 | HuggingFace (20 descargas) |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8B | No disponible | LLM generalista | No disponible en la informacion | HuggingFace |
| Alternativas de politica RL para robotica | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Alcance muy restringido: solo resuelve la tarea `follow_route` con observaciones de 27 dimensiones y 5 acciones; no generaliza a otras tareas, robots o entornos.
- Entrenado y evaluado en un unico circuito (`10a2285a`): el rendimiento fuera de esa ruta no esta medido.
- Evaluacion aproximada: el caminado se puntuo con una tabla 2D de velocidades, no con el simulador MuJoCo ni con un robot real; los resultados pueden diferir del entorno fisico.
- Riesgo de alucinacion de accion: el modelo puede emitir una letra valida pero incorrecta; en el 14,1% de los casos de test no coincide con el profesor.
- Dependencia del formato de prompt: el rendimiento depende de la instruccion de sistema y de la textualizacion exacta del estado; cambios en el formato pueden degradar el acierto.
- Idioma: solo coreano; no se ha evaluado en otros idiomas.
- Uso en robotica real: la propia model card advierte que es un modelo de investigacion y educacion en simulador y que debe revalidarse en el robot y el espacio concretos antes de cualquier uso fisico.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Sin datos de sesgos: no se ha publicado informacion sobre sesgos, y al ser un clasificador de acciones el riesgo principal es de comportamiento erroneo, no de contenido danino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spmoon/connectailab-rl-jjangu-v5-link01
- Repositorio de codigo CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
