# spmoon/connectailab-rl-jjangu-v4-link01

## Resumen

LINK-01 es un adaptador LoRA (PEFT) construido sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario spmoon en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión específico para el robot simulado LINK-01: recibe una descripción textual del estado del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la acción de caminar durante los próximos 0,5 segundos. El escenario entrenado es la tarea `avoid_obstacles` (evasión de obstáculos).

El modelo se obtiene en dos fases: primero se genera un conjunto de datos supervisado a partir de un "cerebro" PPO entrenado en un entorno web (713 ejemplos de entrenamiento, 138 de validación y 206 de test), y después se aplica un ajuste fino supervisado con LoRA seguido de una etapa de refuerzo con regularización KL. La relevancia actual es acotada pero instructiva: demuestra la destilación de una política de refuerzo en un modelo de lenguaje pequeño (0,8B de parámetros) para tareas de decisión discretas, con un formato de pregunta-respuesta de una sola letra.

El modelo es muy pequeño, está etiquetado únicamente en coreano (`ko`) y su pipeline declarado es `reinforcement-learning`. No debe confundirse con un LLM conversacional: su función es actuar como política de decisión dentro de un simulador 2D, y el propio autor advierte que se trata de un modelo de investigación y educativo que requiere revalidación antes de usarse en un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con adaptador LoRA (PEFT) |
| Parametros totales | no disponible (modelo base Qwen3.5-0.8B; el adaptador LoRA añade un número no especificado de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Librería | peft |
| Pipeline | reinforcement-learning |
| Tamaño del repo | 0.0 GB (según Hugging Face) |
| Fecha de creación | 2026-10-30 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre un transformer decoder-only de 0,8B parámetros (Qwen3.5-0.8B). La innovación no está en la arquitectura, sino en el procedimiento de destilación de una política de refuerzo: primero se entrena un "cerebro" PPO en el simulador web de CONNECT AI WORLD para la tarea `avoid_obstacles` (contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`, curso `acc82915`, con un 45% de éxito en el examen oficial). Ese cerebro genera observaciones textuales cada 0,5 segundos; cada observación se convierte en una pregunta con varias opciones y la respuesta del cerebro actúa como etiqueta. El conjunto resultante contiene 713 ejemplos de entrenamiento, 138 de validación y 206 de test, e incluye un 20% de casos en los que el cerebro se desvió del camino.

Sobre ese dataset se aplica un ajuste fino supervisado con LoRA y, a continuación, una etapa de refuerzo en la que cada opción recibe la recompensa que habría obtenido el cerebro al ejecutarla, promoviendo las opciones mejores que la del profesor y penalizando las peores, con una restricción KL para mantener el modelo cerca de la política supervisada. El resultado final publicado es el modelo de aprendizaje supervisado (el autor indica que la etapa RL obtuvo métricas ligeramente peores en la evaluación final). La evaluación de la conducción se realizó con una aproximación 2D de la marcha basada en una tabla de velocidades por comando, sin red neuronal de locomoción, por lo que los resultados pueden diferir de los de MuJoCo web.

## Capacidades

- Decisión discreta de una sola letra entre las opciones presentadas (5 acciones en el contrato `obs21-act5`).
- Lectura de estado textual estructurado: distancia y dirección al objetivo, sensores de distancia, velocidad y acción previa.
- Respuesta en formato estricto sin explicación, adecuada para integración en bucles de control.
- Destilación de política PPO: reproduce la decisión de un cerebro de refuerzo con una tasa de coincidencia del 79,6% en el conjunto de test (supervisado) y del 75,2% (tras RL).
- Instrucción de sistema orientada a robustez: trata el contenido del estado como datos y no como instrucciones.
- Capacidades multilingües: limitadas al coreano según la etiqueta del modelo.
- No se documentan tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Control de evasión de obstáculos en simulación: el modelo se coloca en el puesto de decisión del robot LINK-01 y, cada 0,5 segundos, recibe el estado textual y devuelve la acción de caminar; es adecuado porque fue entrenado exactamente para esa tarea y ese contrato de observación.
- Destilación de políticas de refuerzo en LLM pequeños: sirve como ejemplo reproducible de cómo convertir una política PPO en un modelo de lenguaje mediante supervisión más RL con KL, útil para investigadores que quieran replicar el pipeline en otras tareas.
- Docencia de aprendizaje por refuerzo: el repositorio incluye un notebook de Colab y el código de entrenamiento, por lo que el modelo puede usarse como caso práctico en cursos de RL y destilación.
- Evaluación de robustez ante instrucciones inyectadas en el estado: el propio modelo incluye una instrucción de sistema que separa datos de instrucciones, lo que permite estudiar el comportamiento frente a estados adversariales.
- Prototipado rápido de agentes de decisión en entornos grid o 2D: al ser un adaptador de 0,8B, se puede desplegar en hardware modesto para experimentar con bucles de decisión antes de invertir en políticas mayores.
- Investigación sobre el efecto del RL frente al ajuste supervisado: los resultados publicados (79,6% frente a 75,2% de coincidencia con el profesor) permiten analizar cuándo la etapa RL mejora o degrada la imitación.
- Integración en pipelines de simulación a escala: la inferencia de un modelo de 0,8B con LoRA es lo bastante ligera para ejecutar muchos episodios en paralelo en una sola GPU.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 100% | 0% | 15,2 s |
| Antes del entrenamiento | 39,3% | 0% | 0% | — |
| Ajuste supervisado (LoRA) | 79,6% | 100% | 0% | 15,4 s |
| Refuerzo (RL con KL) | 75,2% | 100% | 0% | 15,5 s |

El autor indica que el modelo publicado es el de ajuste supervisado, al haber obtenido mejores métricas que la variante RL. La evaluación de marcha se realizó con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo completo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo de 0,8B, la inferencia en fp16 requiere aproximadamente 2 GB de VRAM, y en cuantización de 4 bits del modelo base puede bajar de 1 GB (estimación, no dato del autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para el modelo base en fp16; para lotes grandes o muchos episodios en paralelo se recomiendan A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se disponga de memoria suficiente para el modelo base y el adaptador.
- Opciones de despliegue: transformers con peft (procedimiento documentado por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput: no disponibles. El bucle de decisión opera a 0,5 segundos por paso, pero no se publican latencias de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión destilada para la tarea `avoid_obstacles` de LINK-01. Como referencia del modelo base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-jjangu-v4-link01 (este) | 0,8B (base) + LoRA | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | no disponible | Hugging Face |
| Alternativas de decisión para LINK-01 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación y educativo: el autor advierte explícitamente que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Entrenado solo para la tarea `avoid_obstacles` y el contrato `obs21-act5`; no generaliza a otras tareas ni a otros formatos de observación.
- Idioma limitado al coreano según la etiqueta del modelo; el rendimiento en otros idiomas no está documentado.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo, por lo que los resultados pueden no trasladarse al entorno real.
- Tasa de coincidencia con el profesor del 79,6% (supervisado) y 75,2% (RL): el modelo se desvía de la política experta en aproximadamente uno de cada cuatro casos de test.
- Riesgo de alucinación en el sentido de elegir una letra no válida o fuera de las opciones; el formato exige una sola letra y no se documenta el comportamiento ante entradas malformadas.
- No se documentan sesgos específicos, pero al derivar de un dataset sintético de un único curso (`acc82915`) puede sobreajustar a ese trazado.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B, que no se detalla en la información disponible.
- El repositorio tiene un tamaño declarado de 0.0 GB y solo 13 descargas, lo que sugiere un artefacto pequeño y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/spmoon/connectailab-rl-jjangu-v4-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
