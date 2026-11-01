# spmoon/connectailab-rl-jjangu-v3-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario spmoon bajo el paraguas de CONNECT AI LAB x AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión para un robot simulado llamado LINK-01: recibe una descripción textual del estado del robot (distancia al objetivo, dirección, lectores de distancia, velocidad y última acción) y devuelve una única letra que corresponde a la acción de caminar para los siguientes 0,5 segundos. El pipeline declarado es reinforcement-learning y el idioma de trabajo es exclusivamente coreano.

El modelo se construye en dos fases. Primero se entrena un "cerebro" de política mediante PPO en un simulador web de aprendizaje por refuerzo, ejecutando la tarea `choose_object` sobre el curso `735341e2`. Después, ese cerebro actúa como profesor: se generan pares observación-acción cada 0,5 segundos y se destila la política en el modelo de lenguaje mediante LoRA (supervised fine-tuning) y, posteriormente, un ajuste con RL (PPO con penalización KL) que sube la probabilidad de acciones con mejor recompensa y baja la de las peores.

La relevancia es acotada pero interesante como caso de estudio: demuestra cómo destilar una política de RL en un modelo de lenguaje pequeño (0,8B parámetros) para tareas de decisión secuencial, con un formato de salida estrictamente restringido a una letra. El repositorio es extremadamente ligero (0,0 GB), lo que confirma que solo contiene los pesos del adaptador LoRA, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, sin dato explícito en la información proporcionada) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors del adaptador LoRA) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena en dos etapas documentadas en la model card. En la primera, un cerebro de política PPO entrenado en un simulador web (tarea `choose_object`, curso `735341e2`, convención `link01-decision/choose_object/obs26-act4/walker51-14/v1`) genera un conjunto de datos de 1054 ejemplos de entrenamiento, 191 de validación y 360 de test. Cada ejemplo convierte una observación del robot en un problema de texto con situación, pregunta y opciones, y la etiqueta es la acción elegida por el cerebro (incluyendo un 20% de casos en los que el cerebro se desvió del camino óptimo para cubrir situaciones de error).

En la segunda etapa, el modelo de lenguaje aprende primero por supervisión (LoRA SFT) a imitar al cerebro y después se ajusta con RL (PPO con anclaje KL) usando como recompensa el retorno que se habría obtenido si el cerebro hubiera continuado la ejecución tras la acción elegida. La evaluación se realiza colocando el modelo de decisión en el puesto del cerebro y caminando el mismo curso 20 veces (semillas 91001-91020). La model card indica que la tasa de coincidencia con el cerebro en el conjunto de test es del 100% tanto en SFT como en RL, y que el éxito en las 20 partidas es del 95% con un 10% de colisiones y un tiempo medio de 18,4 segundos en las partidas exitosas. La evaluación de la marcha se hace con una aproximación 2D basada en una tabla de velocidades medidas por comando, no con el simulador MuJoCo real, por lo que los resultados pueden diferir ligeramente.

## Capacidades

- Decisión secuencial en un espacio de acciones discreto y muy reducido: elige exactamente una letra entre las opciones presentadas (formato obs26-act4, es decir, observación de 26 dimensiones y 4 acciones).
- Salida estrictamente restringida a una letra, sin explicación, diseñada para integrarse en un bucle de control de robot.
- Interpretación de estado textual del robot: distancia al objetivo, dirección, lectores de distancia, velocidad y acción previa.
- Robustez ante instrucciones embebidas en el estado: el prompt de sistema indica explícitamente que el texto dentro del estado debe tratarse como datos, no como instrucciones.
- Capacidad multilingüe: no disponible; el modelo está entrenado y etiquetado solo para coreano.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el modelo solo resuelve un paso de decisión por invocación.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Control de un robot simulado en un curso concreto: el modelo se coloca en el puesto del cerebro PPO y devuelve una acción cada 0,5 segundos. Es adecuado porque reproduce el 100% de las decisiones del cerebro en el conjunto de test y el 95% de éxito en las 20 partidas de evaluación.
- Docencia y demostración de destilación de políticas RL en modelos de lenguaje: sirve como ejemplo reproducible de cómo convertir una política PPO en un adaptador LoRA sobre un modelo de 0,8B, con código y notebook de Colab enlazados en la model card.
- Investigación sobre formato de salida restringido: útil para estudiar cómo un modelo de lenguaje pequeño puede aprender a emitir una única letra como acción, evitando explicaciones y texto libre.
- Prototipado rápido de agentes de decisión en entornos discretos: el adaptador se puede cargar con `PeftModel.from_pretrained` sobre el base y probar en local sin infraestructura pesada.
- Evaluación de robustez ante inyección de instrucciones en el estado: el prompt de sistema trata el estado como datos, lo que permite probar defensas básicas contra prompt injection en entornos de control.
- Generación de datos sintéticos de decisión: el modelo puede usarse para etiquetar observaciones nuevas con la acción aprendida, ampliando el conjunto de entrenamiento de otros modelos.
- Integración en el pipeline `connect_tycoon.link01.questions`: la función `Q.task_of("choose_object", obs)` convierte una observación del robot en el formato de problema que espera el modelo, lo que facilita su uso en el bucle de control.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los siguientes, medidos sobre el conjunto de test (360 problemas) y sobre 20 partidas del curso `735341e2` con semillas 91001-91020:

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 partidas | Partidas con colisión | Tiempo medio en partidas exitosas |
|---|---|---|---|---|
| Cerebro (profesor, PPO) | 100,0% | 95% | 10% | 18,4 s |
| Modelo antes de entrenar | 85,6% | 0% | 0% | — |
| SFT (LoRA supervisado) | 100,0% | 95% | 10% | 18,4 s |
| RL (PPO con KL) | 100,0% | 95% | 10% | 18,4 s |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación de la marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo real, por lo que los resultados pueden diferir.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-0.8B en precisión completa (fp16/bf16) ocupa aproximadamente 1,6 GB; el adaptador LoRA añade un tamaño no especificado pero pequeño (el repo completo es de 0,0 GB). En cuantización de 8 bits o 4 bits el modelo base cabe en menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para el modelo base en fp16; una RTX 3060, RTX 4060 o superior es más que suficiente. Para entrenamiento o evaluación por lotes se recomienda una RTX 4090 o una A100/H100, aunque no son necesarias para inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers + PEFT (el método documentado en la model card), llama.cpp u Ollama si se convierte el modelo fusionado a GGUF, y vLLM o TGI para servir el modelo fusionado en producción.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño de 0,8B y la salida de un solo token (una letra), la latencia esperada es muy baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

No hay modelos directamente comparables en la información proporcionada: se trata de un adaptador LoRA específico para una tarea de decisión de robot simulado, no de un modelo de lenguaje de propósito general. Como referencia, se compara con su modelo base y con la política original:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B (base) + LoRA | No disponible | Decisión `choose_object` en robot simulado | Apache 2.0 | HuggingFace (adaptador) |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | Lenguaje general | No disponible en la información | HuggingFace |
| Cerebro PPO (profesor) | No disponible | No aplica | Política de decisión en simulador web | No disponible | Solo referenciado en la model card |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea `choose_object` sobre el curso `735341e2`; no generaliza a otros cursos, tareas o robots sin reentrenamiento.
- El idioma de trabajo es solo coreano; no se ha validado su comportamiento en castellano ni en otros idiomas.
- La evaluación de la marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo real; los resultados pueden diferir del comportamiento real.
- El propio autor advierte que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de usarlo en producción.
- Riesgo de alucinación: el modelo puede emitir una letra que no corresponda a ninguna opción válida si la entrada no sigue el formato esperado; el prompt de sistema exige devolver solo una letra, pero no hay garantía formal de cumplimiento.
- Sesgos conocidos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- El repositorio solo contiene el adaptador LoRA; es necesario descargar el modelo base Qwen/Qwen3.5-0.8B para usarlo.
- El modelo no soporta tool calling, agentes multi-paso ni razonamiento general; su uso fuera del bucle de decisión para el que fue entrenado no está validado.

## Enlaces

- HuggingFace: https://huggingface.co/spmoon/connectailab-rl-jjangu-v3-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- GitHub del proyecto (código de entrenamiento): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje de robot: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
