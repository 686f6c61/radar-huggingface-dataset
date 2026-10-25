# sotdanji/connectailab-rl-jay-v1

## Resumen

`connectailab-rl-jay-v1` es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen3.5-0.8B`, ajustado para una única tarea: leer una decision empresarial estructurada (estado, pregunta y lista de opciones) y devolver la letra de la opcion elegida. Lo publica el usuario `sotdanji` en el marco del proyecto CONNECT AI LAB x AI CITY BUILDERS, y se entrena con datos generados por el simulador de empresas CONNECT TYCOON. El problema que aborda es acotado pero concreto: convertir un modelo de lenguaje pequeno en un policy de decision discreta que puntua opciones cerradas, en lugar de generar texto libre.

La relevancia tecnica esta en el pipeline: una politica profesora entrenada con PPO en el simulador genera un conjunto de problemas con puntuaciones por opcion; despues se aplica aprendizaje supervisado y, finalmente, un refuerzo tipo GRPO con ventaja normalizada por grupo y penalizacion KL contra el modelo de partida. Con solo 0,8 mil millones de parametros, el modelo pasa del 30,4% al 77,7% de acierto en el conjunto de test del propio simulador, lo que lo hace util como banco de pruebas reproducible de RL aplicado a toma de decisiones.

Es un modelo de investigacion y educacion, no un asistente general: la salida esta restringida a una letra, los datos son sinteticos y en coreano, y el autor advierte de que queda por debajo de la politica profesora y de que debe validarse con registros reales antes de cualquier uso de gestion. La longitud de contexto del adaptador no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-0.8B) con adaptador LoRA sobre PEFT |
| Parametros totales | 0,8 mil millones en el modelo base; el adaptador LoRA ocupa 0,0 GB en el repositorio y su numero exacto de parametros no esta disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; al distribuirse como PEFT en safetensors, la cuantizacion se aplica al modelo base (por ejemplo, carga en 4 u 8 bits con bitsandbytes) |
| Idiomas soportados | coreano (ko) segun la etiqueta del repositorio; el prompt de sistema recomendado esta en ingles; rendimiento en otros idiomas no evaluado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre un transformer decoder-only de 0,8 mil millones de parametros. No se anade atencion lineal, SSM ni decodificacion especulativa: la innovacion esta en el procedimiento de entrenamiento y en la restriccion del espacio de salida. El modelo recibe un `system` en ingles que ordena tratar el contenido de `state` como datos y no como instrucciones, y un `user` con un JSON de la forma `{"state": ..., "question": ..., "options": [{"label": "A", "key": ..., "description": ...}]}`. La respuesta es una sola letra; la probabilidad asignada a cada letra de opcion actua como probabilidad por alternativa y el maximo como medida de confianza.

El pipeline tiene cuatro fases descritas por el autor. Primero, una politica pequena aprende a operar la empresa durante miles de meses en el simulador mediante PPO; esa politica actua como profesora. Segundo, por cada mes simulado se generan variantes del problema cambiando la opcion elegida y reejecutando el mes completo para puntuar cada alternativa, lo que produce el conjunto de problemas. Tercero, aprendizaje supervisado sobre la opcion de mayor puntuacion. Cuarto, refuerzo con ventaja estandarizada por grupo (etiqueta `grpo`) mas KL contra el modelo de partida, subiendo la probabilidad de las opciones cuyo resultado en el simulador supera la media del grupo. El conjunto de datos declarado es de 4.082 ejemplos de entrenamiento, 832 de validacion y 840 de test, sobre una distribucion de empresa `general` ajustada con datos publicos. No se detalla la composicion completa del dataset ni el numero de tokens de entrenamiento.

## Capacidades

- Decision discreta sobre opciones cerradas: devuelve exactamente una letra entre las etiquetas proporcionadas (`A`, `B`, etc.).
- Entrada estructurada en JSON con estado, pregunta y opciones con `label`, `key` y `description`.
- Exposicion de probabilidad por opcion a partir de la distribucion del token de la letra, utilizable como senal de confianza o para ranking.
- Resistencia basica a inyeccion de instrucciones en el campo `state`, por el prompt de sistema que lo trata como datos.
- Uso como policy evaluable en entornos tipo Gymnasium a traves del simulador CONNECT TYCOON.
- Capacidades multilingues: datos y model card en coreano; el prompt de sistema esta en ingles. No hay evidencia de calidad en castellano.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla de la propia tarea de decision.
- No se documenta vision, audio ni modo thinking.
- No es un modelo conversacional: no se describe generacion de texto abierta.

## Casos de uso

- **Simulacion de gestion empresarial en CONNECT TYCOON:** el modelo actua como capa de decision del simulador, recibiendo el estado mensual de la empresa y eligiendo una opcion entre las disponibles; su tamano de 0,8B permite ejecutarlo en el mismo bucle de simulacion sin GPU dedicada de gama alta.
- **Generacion de datos sinteticos de decision:** sirve como policy de referencia para etiquetar nuevos escenarios con opciones cerradas y alimentar posteriores entrenamientos de RL o de clasificacion, aprovechando que la salida es una letra y el etiquetado es trivial de parsear.
- **Evaluacion de robustez frente a prompt injection:** al estar disenado con un `system` que aisla el contenido de `state` como datos, es un banco de pruebas para medir si un modelo pequeno mantiene el formato de salida cuando el estado contiene texto adversarial.
- **Baseline de investigacion en GRPO para acciones discretas:** el pipeline PPO-profesor, SFT y GRPO con KL es reproducible mediante el cuaderno de Colab publicado, lo que permite comparar variantes de ventaja normalizada o de penalizacion KL con un coste de computo bajo.
- **Prototipado de NPC o agente en juegos de gestion:** integrado en un bucle de juego tipo tycoon, el modelo elige entre acciones predefinidas y devuelve una etiqueta consumible por el motor, sin necesidad de un parser de lenguaje natural.
- **Material docente de aprendizaje por refuerzo:** el repositorio incluye el simulador, el cuaderno de entrenamiento y las metricas intermedias (base, SFT y RL), lo que lo hace util para explicar de forma practica como se pasa de una politica profesora a un adaptador LoRA.
- **Comparacion de politicas:** permite contrastar la politica destilada en el modelo de lenguaje con la profesora PPO original y con el checkpoint intermedio de SFT, todos evaluados sobre el mismo conjunto de test de 840 problemas.
- **Clasificacion asistida con opciones cerradas:** en flujos donde la respuesta ya esta enumerada y solo hay que seleccionar una alternativa, el modelo puede emplearse como clasificador de bajo coste, siempre que el dominio se valide previamente con datos propios.

## Benchmarks y rendimiento

Datos publicados por el autor sobre el conjunto de test del simulador (840 problemas). No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar.

| Modelo | Precision en test | Remordimiento (regret, menor es mejor) | Beneficio mensual en simulador | Transacciones reales con tarjeta: perdida reducida |
|---|---|---|---|---|
| Qwen3.5-0.8B sin entrenar | 30,4% | 2,67 | no disponible | no disponible |
| Checkpoint de aprendizaje supervisado (SFT) | 77,9% | 1,91 | no disponible | no disponible |
| Checkpoint de refuerzo (este modelo) | 77,7% | 1,91 | 10,94 millones de KRW | 71% (145/177) |

El propio autor califica estos resultados como un primer experimento: la evaluacion de operacion de empresa corresponde a la media de dos meses no vistos, la muestra es pequena y el modelo sigue por debajo de la politica profesora entrenada con PPO en el simulador. La fila de transacciones reales con tarjeta no se detalla metodologicamente en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de un modelo base de 0,8B, no publicada por el autor): aproximadamente 2 GB en FP16 incluyendo overhead, en torno a 1 GB en int8 y entre 0,5 y 1 GB en int4, mas el coste del adaptador LoRA, que es despreciable.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente (RTX 3050, RTX 3060, RTX 4060, RTX 4090). No se requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual; tambien es viable en CPU para inferencia por lotes pequenos, aunque no se documenta el rendimiento.
- Opciones de despliegue: `transformers` + `peft` es la ruta de referencia segun la model card; vLLM y TGI admiten adaptadores LoRA; para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir a GGUF, procedimiento no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros adaptadores publicos de decision con GRPO sobre simuladores de gestion empresarial que permitan una comparacion directa. La comparacion factible es interna, contra el modelo base y el checkpoint intermedio del mismo entrenamiento.

| Modelo | Parametros | Contexto | Precision en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 0,8B | no disponible | 30,4% | no disponible en la informacion proporcionada; verificar en el repositorio del modelo base | HuggingFace |
| Checkpoint SFT intermedio | 0,8B + LoRA | no disponible | 77,9% | no distribuido como repositorio independiente | no disponible |
| `connectailab-rl-jay-v1` (RL) | 0,8B + LoRA | no disponible | 77,7% | Apache 2.0 | HuggingFace |
| Otros modelos de decision con RL | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy estrecho: entrenado sobre un simulador sintetico de empresa (`general`), no sobre datos reales de negocio; la transferencia a otro dominio exige revalidacion con registros propios.
- Modelo base de solo 0,8 mil millones de parametros: conocimiento del mundo y capacidad de razonamiento limitados en comparacion con modelos mayores.
- Datos y model card en coreano; no hay evaluacion de calidad en castellano ni en ingles mas alla del prompt de sistema.
- Rendimiento por debajo de la politica profesora PPO del simulador, segun reconoce el autor.
- Evaluacion preliminar: la operacion de empresa se mide sobre dos meses no vistos, muestra insuficiente para conclusiones robustas.
- Salida estricta de una letra: entradas mal formadas, etiquetas fuera de rango o JSON invalido pueden producir respuestas no parseables.
- Riesgo de inyeccion de instrucciones a traves de `state`; el prompt de sistema lo mitiga, pero no hay evaluacion cuantitativa de esa robustez en la informacion disponible.
- Riesgo de alucinacion bajo en la tarea cerrada, pero puede seleccionar una opcion inexistente o una letra fuera del conjunto si el formato no se respeta.
- Licencia Apache 2.0 para el adaptador; debe verificarse la licencia del modelo base Qwen3.5-0.8B antes de un uso comercial, ya que la informacion proporcionada no la detalla.
- Modelo declarado por el autor como de investigacion y educacion: no debe usarse para decisiones de gestion reales sin validacion con los registros de la empresa implicada.
- Sin adopcion publica en el momento de la consulta (0 descargas y 0 likes), por lo que no existe validacion independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sotdanji/connectailab-rl-jay-v1
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
