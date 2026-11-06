# yegom/connectailab-rl-yegomduck-v1-link01

## Resumen

`connectailab-rl-yegomduck-v1-link01` es un adaptador LoRA publicado por el desarrollador coreano Sehyun Park (Yegom) sobre el modelo base `Qwen/Qwen3.5-0.8B`. No se trata de un modelo de lenguaje de propósito general, sino de un modelo de decisión ligero para el robot simulado LINK-01 del ecosistema CONNECT TYCOON. El modelo recibe una descripción textual del estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a una de las cinco acciones de locomoción disponibles para los siguientes 0,5 segundos.

El interés técnico reside en el enfoque híbrido: se entrena primero una política PPO en un entorno web de aprendizaje por refuerzo, esa política actúa como «profesor» generando pares observación-acción, y después se destila en un LLM pequeño mediante supervisión (LoRA) y un paso posterior de optimización por refuerzo con anclaje KL. El resultado es un modelo de apenas 0,8 mil millones de parámetros que reproduce el comportamiento de la política original en formato de texto, lo que facilita su integración en pipelines basados en lenguaje.

Es relevante como ejemplo práctico de destilación de políticas de RL hacia modelos de lenguaje pequeños para robótica y toma de decisiones, y como caso de estudio de un adaptador PEFT de nicho con métricas de evaluación publicadas por el autor. El alcance es deliberadamente limitado: dominio simulado, idioma coreano y tarea única `goto_target`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8 mil millones (modelo base); adaptador LoRA de tamaño no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre un transformer decoder-only de 0,8 mil millones de parámetros (Qwen3.5-0.8B). El adaptador se entrena en dos fases. En la primera, se genera un conjunto de datos a partir de la política PPO entrenada en el simulador web: cada 0,5 segundos se registra la observación del robot convertida a texto y la acción elegida por la política como etiqueta. El conjunto incluye además un 20 % de ejemplos en los que la política se desvió del camino óptimo, para cubrir situaciones fuera de distribución. Los tamaños de los conjuntos son 609 ejemplos de entrenamiento, 119 de validación y 217 de test.

La segunda fase aplica optimización por refuerzo sobre el modelo supervisado: para cada opción de acción se calcula la recompensa que habría obtenido la política PPO si hubiera continuado desde ese punto, y se ajustan las probabilidades del modelo para favorecer las acciones con mayor recompensa, con una penalización KL que mantiene el modelo cerca de la distribución supervisada. La evaluación final se realiza colocando el modelo en el puesto de decisión del robot y ejecutando 20 episodios con semillas 91001–91020 sobre el mismo circuito (`c4e8eeed`). La simulación de marcha emplea una aproximación 2D basada en una tabla de velocidades por comando, no un simulador físico completo, por lo que los resultados pueden diferir de los de MuJoCo.

## Capacidades

- Clasificación de acciones discretas: dado un estado textual del robot, devuelve una única letra entre cinco opciones de locomoción.
- Razonamiento de decisión a corto plazo: la acción cubre una ventana de 0,5 segundos.
- Procesamiento de observaciones estructuradas en lenguaje natural (distancias, direcciones, sensores, velocidad, acción previa).
- Instrucciones de sistema estrictas: el prompt de sistema exige devolver solo la letra, sin explicación, y tratar el contenido del estado como datos y no como instrucciones.
- Integración con el paquete `connect_tycoon.link01.questions` para convertir observaciones del robot al formato de pregunta.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en destilación de políticas RL a LLM: sirve como referencia reproducible para estudiar cómo una política PPO puede transferirse a un modelo de lenguaje pequeño y qué pérdida de rendimiento se produce en cada fase (47,0 % → 81,1 % → 77,0 % de coincidencia con el profesor).
- Evaluación de técnicas de RLHF/RL con anclaje KL en dominios de control: el par supervisión + RL con penalización KL sobre un espacio de acciones finito es un caso de estudio acotado y medible.
- Prototipado de agentes de decisión en entornos simulados: permite experimentar con un bucle percepción-decisión textual sin necesidad de infraestructura de simulación física.
- Docencia en cursos de refuerzo y robótica: el modelo y sus métricas (tasa de éxito, colisiones, tiempo medio) son un ejemplo didáctico de evaluación de políticas.
- Integración en pipelines de automatización basados en lenguaje: al devolver una letra y aceptar instrucciones de sistema, puede encadenarse en un orquestador que traduzca estados de robot a comandos.
- Comparación de estrategias de destilación: permite contrastar el comportamiento de un modelo supervisado frente a uno ajustado con RL sobre el mismo conjunto de test de 217 ejemplos.
- Validación de robustez ante entradas fuera de distribución: el 20 % de ejemplos con desviaciones del camino permite estudiar el comportamiento del modelo en estados no óptimos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. La métrica de «problemas de test» mide la coincidencia con la acción del profesor sobre 217 ejemplos. La métrica de «20 episodios» mide el éxito en el circuito `c4e8eeed` con semillas 91001–91020.

| Modelo | Acierto en test (coincidencia con el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (política PPO) | 100,0 % | 100 % | 0 % | 12,1 s |
| Antes del entrenamiento | 47,0 % | 0 % | 45 % | — |
| Tras aprendizaje supervisado | 81,1 % | 90 % | 15 % | 12,6 s |
| Tras refuerzo (modelo publicado) | 77,0 % | 100 % | 5 % | 11,2 s |

El autor indica que la evaluación de marcha emplea una aproximación 2D con tabla de velocidades por comando, sin red neuronal de marcha ni modelo físico completo, y que los resultados pueden diferir de los obtenidos en MuJoCo web.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 0,8 mil millones de parámetros en fp16 requiere aproximadamente 1,6 GB solo para los pesos, más el adaptador LoRA y la caché de contexto.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es ejecutable en GPUs de consumo con suficiente memoria, aunque no se publican requisitos oficiales.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, pero no se confirma en la documentación.
- Opciones de despliegue: la model card solo documenta carga mediante `transformers` + `peft` (`AutoModelForCausalLM` y `PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un adaptador de nicho para una tarea de decisión concreta en un simulador específico, sin equivalentes públicos identificados en la información disponible.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-yegomduck-v1-link01 | 0,8 B (base) + LoRA | No disponible | Decisión de locomoción (5 acciones) | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo resuelve la tarea `goto_target` en el entorno LINK-01 y devuelve una de cinco acciones; no es un modelo de lenguaje general.
- Evaluación sobre un único circuito (`c4e8eeed`) y 20 semillas; no hay evidencia de generalización a otros mapas, robots o condiciones.
- La simulación de marcha es una aproximación 2D con tabla de velocidades, no un simulador físico; los resultados pueden no trasladarse a MuJoCo ni a un robot real.
- El autor advierte explícitamente que es un modelo de investigación y educación en simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Idioma coreano únicamente; no se documenta soporte multilingüe.
- Riesgo de alucinación o de devolver una letra no válida fuera de distribución: el prompt de sistema exige una sola letra, pero no se documenta el comportamiento ante entradas malformadas.
- Sesgos: no documentados, aunque el entrenamiento se limita a un circuito y a una política concretos, lo que puede introducir sesgos hacia trayectorias específicas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación fuera del simulador desaconseja su uso en producción robótica sin verificación adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yegom/connectailab-rl-yegomduck-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Laboratorio web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Código de entrenamiento CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de refuerzo en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
