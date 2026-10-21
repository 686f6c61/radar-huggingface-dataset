# yonga76/connectailab-rl-altos-v1

## Resumen

connectailab-rl-altos-v1 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario yonga76 en el marco del proyecto CONNECT AI LAB / CONNECT TYCOON. No es un modelo conversacional al uso: es un modelo de toma de decisiones empresariales que recibe un estado, una pregunta y una lista de opciones, y devuelve la letra de la opción elegida. Su salida es una única letra (A, B, C...), y la probabilidad asignada a cada letra actúa como medida de confianza de la decisión.

El modelo resuelve un problema muy acotado: automatizar la selección de decisiones dentro de un simulador de gestión de empresa (CONNECT TYCOON). Para ello se generó un conjunto de datos sintético de 4.082 problemas de entrenamiento, 826 de validación y 840 de test, a partir de las trayectorias de un pequeño agente de política entrenado con PPO en el simulador. Sobre ese corpus se aplicó primero aprendizaje supervisado y después un refuerzo con GRPO (con normalización por grupo y penalización KL respecto al modelo de partida), dando lugar al adaptador publicado.

Es relevante ahora porque ejemplifica una línea de trabajo emergente: usar modelos de lenguaje pequeños (0,8B parámetros) como cabezas de decisión dentro de bucles de simulación y RL, en lugar de como generadores de texto. La licencia Apache 2.0 y su tamaño reducido lo hacen fácil de reproducir e integrar, aunque sus resultados son preliminares y el propio autor advierte que se trata de un modelo de investigación y educación, no de un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un numero reducido de parametros (no disponible con precision) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-0.8B, un transformer denso de 0,8B parámetros. La innovación no reside en la arquitectura del modelo base sino en el pipeline de entrenamiento, descrito en cuatro fases en la model card. En la primera, una política pequeña se entrena con PPO durante miles de meses simulados dentro del simulador CONNECT TYCOON; esa política actúa como profesor. En la segunda, por cada decisión que toma el profesor se genera un "cuaderno de problemas" reejecutando el mes completo con cada una de las opciones alternativas, asignando una puntuación a cada elección. En la tercera se aplica aprendizaje supervisado sobre la opción con mayor puntuación. En la cuarta se aplica RL con GRPO: se agrupan todas las opciones de una misma decisión, se normalizan las puntuaciones dentro del grupo y se incrementa la probabilidad de las opciones con puntuación por encima de la media, manteniendo una penalización KL contra el modelo de partida.

El corpus se distribuye en 4.082 problemas de entrenamiento, 826 de validación y 840 de test, generados sobre una distribución de empresas de tipo `general` calibrada con datos públicos. El formato de entrada es un JSON con `state`, `question` y `options` (cada una con `label`, `key` y `description`), y la salida esperada es una única letra.

## Capacidades

- Selección de una opción entre varias en tareas de decisión estructurada con estado, pregunta y alternativas.
- Salida restringida a una letra, lo que permite usar la distribución de probabilidad sobre las letras como medida de confianza por opción.
- Entrenamiento específico para el dominio de gestión empresarial simulado (finanzas, satisfacción, incidentes) del simulador CONNECT TYCOON.
- Capacidad de seguir el formato de instrucción definido por el autor en el mensaje de sistema, incluyendo el tratamiento del texto del estado como datos y no como instrucciones.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio, modo thinking ni matemáticas.
- Capacidad multilingüe limitada al coreano según los metadatos del repositorio.

## Casos de uso

- Automatización de decisiones dentro del simulador CONNECT TYCOON: el modelo recibe el estado del mes, la pregunta de gestión y las opciones disponibles, y devuelve la letra elegida, sustituyendo a la política PPO en pruebas comparativas.
- Investigación en RL con modelos de lenguaje: sirve como banco de pruebas reproducible para comparar aprendizaje supervisado frente a GRPO en tareas de decisión discreta con recompensa simulada.
- Evaluación de políticas de decisión: al exponer una distribución de probabilidad por opción, permite analizar la calibración y la confianza del modelo en cada alternativa, no solo la elección final.
- Generación de datos sintéticos de decisiones: las elecciones del modelo sobre estados nuevos pueden usarse para ampliar el corpus de entrenamiento de otros agentes.
- Docencia y formación en RL: el repositorio incluye un notebook de Colab para reproducir el entrenamiento, lo que lo hace útil en cursos de reinforcement learning aplicado.
- Prototipado de asistentes de decisión acotados: en entornos donde el espacio de acciones es finito y bien definido, el patrón (estado + opciones + letra) puede trasladarse a otros dominios con un reentrenamiento del adaptador.
- Análisis de sensibilidad de decisiones: variando la descripción de las opciones en el JSON de entrada se puede estudiar cómo cambia la elección del modelo ante reformulaciones.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card del autor y corresponden al conjunto de test del simulador:

| Modelo | Acierto en test | Arrepentimiento (menor es mejor) | Beneficio simulado en un mes | Reducción de perdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 33,1% | 2,60 | No disponible | No disponible |
| Aprendizaje supervisado | 75,7% | 2,18 | No disponible | No disponible |
| Aprendizaje por refuerzo (GRPO) | 73,3% | 2,23 | 3,49 millones de wones | 37% (91/177) |

El autor señala que el resultado de operación empresarial corresponde a la media de dos meses no vistos previamente, con un tamaño de muestra pequeño, y que el modelo todavía queda por debajo de la política profesora entrenada con PPO en el simulador. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp16 para el modelo base de 0,8B, más el adaptador LoRA, que ocupa una fraccion minima. Cifra exacta no disponible.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior permite ejecutar el modelo con holgura. Para entrenamiento del adaptador, una RTX 4090 o una A100 aceleran notablemente el proceso.
- Cabe en GPU consumer: sí, en practicamente cualquier GPU dedicada moderna e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers con PEFT es la via documentada por el autor. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este adaptador concreto; al tratarse de un adaptador LoRA sobre un modelo denso estandar, la conversion a GGUF requeriria fusionar previamente los pesos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-altos-v1 | 0,8B (base) + LoRA | No disponible | Decisión discreta con RL/GRPO sobre simulador | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | Modelo de lenguaje generalista | No disponible en la informacion | HuggingFace |
| Política PPO del simulador CONNECT TYCOON | No disponible (modelo pequeño) | No aplica | Política de RL clásica sobre el simulador | No disponible | Repositorio del proyecto |

No se dispone de información sobre otros adaptadores de decisión comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación y educación: el propio autor advierte que debe revalidarse con los registros reales de cada empresa antes de usarse para decisiones de gestión reales.
- Resultados preliminares: la evaluación de operación se basa en solo dos meses no vistos, con muestra pequeña, y el modelo queda por debajo de la política profesora PPO.
- El RL (73,3%) obtiene un acierto en test ligeramente inferior al aprendizaje supervisado (75,7%), aunque mejora en la métrica de arrepentimiento y en la simulación de negocio; la elección entre ambas variantes depende del objetivo.
- Riesgo de alucinación y de elección inválida: el modelo está entrenado para devolver una letra, pero no se documenta un mecanismo que garantice que la letra pertenezca al conjunto de opciones ofrecido.
- Idioma: los metadatos declaran únicamente coreano, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto: no especificada; estados muy largos pueden superar la ventana del modelo base.
- Sesgos: al entrenarse sobre una distribución de empresas sintética de tipo `general` calibrada con datos públicos, puede heredar sesgos de esa calibración y no representa necesariamente sectores o tamaños de empresa no cubiertos.
- Licencia Apache 2.0: permite uso comercial, pero debe respetarse también la licencia del modelo base Qwen3.5-0.8B, que no se detalla en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- [HuggingFace: yonga76/connectailab-rl-altos-v1](https://huggingface.co/yonga76/connectailab-rl-altos-v1)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Repositorio GitHub CONNECT TYCOON](https://github.com/wonseokjung/connect-tycoon)
- [Notebook de Colab para entrenamiento](https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb)
- [Canal de YouTube CONNECT AI LAB](https://www.youtube.com/@CONNECT-AI-LAB)
- [AI CITY BUILDERS](https://www.aicitybuilders.com)
- [Curso de RL de AI CITY BUILDERS](https://www.aicitybuilders.com/robot)
- [Connect AI](https://www.ezerai.xyz)
