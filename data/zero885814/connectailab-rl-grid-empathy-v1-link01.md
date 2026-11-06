# zero885814/connectailab-rl-grid-empathy-v1-link01

## Resumen

LINK-01 es un adaptador LoRA publicado por el usuario zero885814 bajo el paraguas de CONNECT AI LAB y AI CITY BUILDERS, concebido como un modelo de decisión para un robot simulado de nombre LINK-01. El adaptador se monta sobre el modelo base Qwen/Qwen3.5-0.8B y su tarea es leer en lenguaje natural el estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y elección previa) y devolver una única letra que identifica la acción a ejecutar durante los siguientes 0,5 segundos. No es, por tanto, un modelo conversacional de propósito general, sino un clasificador de acciones disfrazado de modelo de lenguaje.

El interés técnico del artefacto está en el método: un cerebro entrenado con PPO en un simulador web de robótica (el «robot web learning» de CONNECT AI WORLD) actúa como profesor y genera un conjunto de problemas en texto a partir de las observaciones que ve; después se hace un ajuste supervisado con LoRA sobre Qwen3.5-0.8B y, finalmente, un ajuste por refuerzo (PPO con anclaje KL) que reordena las preferencias entre opciones según la recompensa acumulada. El resultado declarado es un adaptador que reproduce el 100 % de las decisiones del cerebro profesor en el conjunto de test y que completa 20 de 20 episodios del mismo circuito.

Su relevancia es doble: por un lado, demuestra una vía barata de destilar políticas de RL en modelos de lenguaje pequeños (0,8 B parámetros) para tareas de decisión discretas; por otro, es un ejemplo muy acotado y muy específico, con un dominio de una sola tarea (`choose_object`), un idioma declarado (coreano) y un pipeline etiquetado como reinforcement-learning. No debe confundirse con un modelo de razonamiento o de código: es un componente de control dentro de un simulador concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen/Qwen3.5-0.8B); la arquitectura del adaptador es de bajo rango, la del modelo base es la de Qwen3.5 |
| Parámetros totales | No disponible (el adaptador LoRA no declara su recuento; el modelo base tiene 0,8 B según su identificador) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no declarada en la model card; heredada del modelo base, sin especificar) |
| Tipos de cuantización | No disponible (el repositorio contiene safetensors del adaptador; no se documentan cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Coreano (`ko`) según la etiqueta de idioma; las instrucciones del sistema están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se distribuye por separado |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen, y se entrena mediante PEFT con LoRA. La particularidad no está en la arquitectura, sino en el pipeline de datos y de optimización, que consta de cuatro fases documentadas. Primero se entrena una política PPO en el simulador web (tarea `choose_object`, contrato `link01-decision/choose_object/obs26-act4/walker51-14/v1`, circuito `39061ed6`), con una tasa de éxito del 25 % en el examen oficial del simulador. Segundo, se genera un corpus de problemas en texto: cada 0,5 segundos se convierte la observación del cerebro en un enunciado con situación, pregunta y opciones, y la respuesta correcta es la acción que tomó el cerebro; se incluye un 20 % de ejemplos en los que el cerebro se desvió del camino para cubrir situaciones fuera de distribución. El corpus resultante tiene 371 ejemplos de entrenamiento, 72 de validación y 127 de test.

Tercero, se hace un ajuste supervisado (LoRA) para imitar al profesor. Cuarto, se aplica un ajuste por refuerzo con PPO y anclaje KL: para cada opción se estima la recompensa que se habría obtenido si el cerebro hubiera continuado desde esa elección, y se suben las opciones claramente mejores y se bajan las peores, manteniendo el modelo cerca del de partida mediante la penalización KL. La evaluación se realiza colocando el modelo de decisión en el puesto de mando del robot y recorriendo el mismo circuito durante 20 episodios con semillas 91001 a 91020. La métrica de caminata se aproxima con una tabla de velocidades por comando derivada de MuJoCo web, sin red neuronal de locomoción, de modo que el robot no cae y los resultados pueden diferir ligeramente de una simulación MuJoCo completa.

## Capacidades

- Clasificación de acciones discretas: dado un estado textual del robot, devuelve exactamente una letra entre las opciones presentadas, sin explicación.
- Decisión en un horizonte corto: la acción seleccionada cubre los siguientes 0,5 segundos de locomoción.
- Robustez ante instrucciones embebidas: el prompt de sistema indica explícitamente tratar el texto dentro de `state` como datos y no como instrucciones, lo que mitiga inyecciones de prompt en el estado.
- Formato de salida restringido: una sola letra, lo que simplifica el parseo y reduce la latencia de postproceso.
- Reproducción de una política PPO: el adaptador imita el comportamiento de un cerebro entrenado con refuerzo, no razona sobre física ni sobre el mundo real.
- Soporte multilingüe: limitado al coreano declarado y a las plantillas en inglés del prompt de sistema; no se documentan otras lenguas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Control de un robot simulado en el circuito `39061ed6`: el adaptador se sitúa en el puesto de decisión y elige la acción de caminata cada 0,5 segundos a partir del estado textual; es adecuado porque reproduce el 100 % de las decisiones del profesor en test y completa 20 de 20 episodios.
- Destilación de políticas de RL en modelos de lenguaje: sirve como plantilla para convertir un cerebro PPO en un adaptador LoRA de 0,8 B, útil en proyectos de investigación que quieran sustituir una red de política por un modelo de lenguaje pequeño e interpretable en su entrada.
- Docencia de pipelines híbridos RL + LLM: el repositorio y el cuaderno de Colab permiten reproducir las cuatro fases (PPO, generación de corpus, SFT, PPO con KL) en un caso de complejidad controlada.
- Evaluación de robustez frente a inyección de prompt: al tratar el estado como datos, el adaptador es un banco de pruebas para medir si un modelo pequeño respeta la separación entre instrucciones y contenido en un dominio acotado.
- Prototipado rápido de agentes de decisión en entornos de rejilla o de elección de objeto: la tarea `choose_object` es un ejemplo mínimo de selección entre alternativas con estado parcialmente observable.
- Integración en un bucle de simulación web: al devolver una sola letra, el adaptador se puede conectar a un bucle de control de bajo coste computacional sin motor de inferencia pesado, siempre que se disponga del modelo base Qwen3.5-0.8B.

## Benchmarks y rendimiento

Los datos publicados en la model card son los siguientes (evaluación sobre 127 problemas de test y 20 episodios del circuito con semillas 91001-91020):

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio de los episodios exitosos |
|---|---|---|---|---|
| Cerebro profesor (PPO) | 100,0 % | 100 % | 0 % | 7,2 s |
| Antes del entrenamiento | 0,8 % | 0 % | 100 % | — |
| Ajuste supervisado (LoRA) | 100,0 % | 100 % | 0 % | 7,2 s |
| Ajuste por refuerzo (PPO + KL) | 100,0 % | 100 % | 0 % | 7,2 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. La métrica de caminata es una aproximación mediante tabla de velocidades por comando derivada de MuJoCo web, no una simulación completa con red de locomoción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo base de 0,8 B, la huella es la del modelo base más el adaptador. En FP16 el modelo base ronda 1,6 GB de pesos, y en cuantizaciones de 8 o 4 bits sería inferior, aunque no se documentan cuantizaciones para este artefacto.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder alojar el modelo base en FP16, pero esto es una estimación, no un dato del autor.
- ¿Cabe en GPU consumer? Sí, previsiblemente, dado el tamaño del modelo base (0,8 B), aunque el autor no lo confirma.
- Opciones de despliegue: la model card muestra únicamente el uso con `transformers` y `peft` (`PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único dato temporal es el tiempo medio de episodio exitoso (7,2 s), que corresponde a la simulación completa, no a la latencia de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el adaptador se apoya en Qwen/Qwen3.5-0.8B y su licencia Apache 2.0 es compatible con uso comercial, pero no se han publicado comparativas con otras destilaciones de políticas RL en modelos de lenguaje ni con otros adaptadores de la misma familia.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-grid-empathy-v1-link01 | Adaptador LoRA sobre 0,8 B | No disponible | 100 % en test propio; 20/20 episodios | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Dominio extremadamente estrecho: una sola tarea (`choose_object`), un solo circuito (`39061ed6`) y un formato de salida de una letra; no es un modelo de propósito general.
- El 100 % de acierto se mide contra el propio cerebro profesor, no contra una verdad de referencia externa; la cota superior de acierto declarada es del 100 % porque el corpus se genera a partir de las decisiones del profesor.
- La evaluación de caminata usa una aproximación por tabla de velocidades derivada de MuJoCo web, sin red de locomoción; el autor advierte que los resultados pueden diferir de una simulación MuJoCo completa.
- El modelo está pensado para simulación e investigación educativa; el propio autor recomienda revalidarlo en el robot y el espacio reales antes de cualquier uso físico.
- Idioma declarado coreano; no se documenta calidad en castellano ni en otras lenguas, y las plantillas del prompt de sistema están en inglés.
- Riesgo de alucinación: aunque la salida está restringida a una letra, el modelo podría devolver una opción no listada o texto adicional si el prompt no se respeta; el prompt de sistema lo mitiga, pero no lo garantiza.
- Sesgos: no documentados; al entrenarse sobre un único profesor y un único circuito, hereda los sesgos de esa política.
- Licencia Apache 2.0, compatible con uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB según la interfaz, lo que sugiere que los pesos del adaptador pueden no estar completos o que la métrica no se ha actualizado; conviene verificar los archivos antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/zero885814/connectailab-rl-grid-empathy-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Simulador CONNECT AI WORLD: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
