# youn485/connectailab-rl-connectailab-rl-jinbrain-link01-v2-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario youn485 en colaboración con CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general: es un modelo de decisión entrenado para controlar un robot simulado llamado LINK-01 en la tarea `goto_target` (llegar a un objetivo). El modelo lee en texto el estado del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y la acción anterior) y responde con una única letra que codifica cómo debe caminar el robot durante los siguientes 0,5 segundos.

El entrenamiento sigue una cadena poco habitual: primero se entrena una política PPO ("cerebro") en un simulador web de MuJoCo; después se generan 800 problemas de decisión (556 de entrenamiento, 93 de validación y 151 de prueba) traduciendo las observaciones del cerebro a texto; a continuación se hace aprendizaje supervisado con LoRA para imitar al cerebro y, finalmente, se aplica aprendizaje por refuerzo con anclaje KL para corregir las respuestas. El resultado es un modelo de 0,8 mil millones de parámetros que sirve como ejemplo didáctico de destilación de políticas de RL en modelos de lenguaje.

Su relevancia es sobre todo pedagógica y de investigación: demuestra cómo transferir una política de decisión entrenada con PPO a un LLM pequeño mediante LoRA, con métricas de éxito medidas en el simulador. No está pensado para uso en producción ni para robótica real sin una revalidación completa en el robot y el entorno concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen/Qwen3.5-0.8B) |
| Parametros totales | 0,8 mil millones en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.5-0.8B, sin dato explícito) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko), según la model card y los tags |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena en dos fases. En la primera, aprendizaje supervisado: el modelo aprende a imitar la respuesta del "cerebro" PPO a partir de problemas en texto generados cada 0,5 segundos mientras el cerebro recorre un curso aleatorio. El conjunto de datos incluye un 20 % de ejemplos en los que el cerebro se desvió deliberadamente para introducir situaciones fuera de distribución. En la segunda fase, aprendizaje por refuerzo: para cada opción de respuesta se calcula la recompensa que se habría obtenido si el cerebro hubiera ejecutado esa opción y caminado el resto del episodio; las opciones mejores que la del cerebro se refuerzan y las peores se penalizan, con una restricción KL para evitar que el modelo se aleje demasiado de la política supervisada.

La tarea concreta es `goto_target`, con el contrato `link01-decision/goto_target/obs21-act5/walker51-14/v1` y el curso de aprendizaje `ee21610a`. El cerebro PPO superó el examen oficial con un 100 % de éxito. La evaluación del adaptador se realiza sentándolo en el puesto de decisión del robot y recorriendo el mismo curso en 20 episodios (semillas 91001 a 91020). La simulación de marcha es una aproximación 2D basada en una tabla de velocidades medidas por comando, no en el modelo físico completo de MuJoCo, por lo que los resultados pueden diferir ligeramente de los del simulador web.

## Capacidades

- Decisión de acción discreta: dado un estado textual del robot, devuelve exactamente una letra entre las opciones listadas (5 acciones posibles según el contrato `act5`).
- Formato de salida restringido: la instrucción de sistema exige devolver solo la letra, sin explicación.
- Razonamiento sobre estado estructurado en texto: interpreta distancia, dirección, lecturas de sensores de distancia, velocidad y acción previa.
- Robustez parcial ante estados fuera de distribución: se entrenó con un 20 % de ejemplos de desviación.
- Multilingüe limitado: la model card declara únicamente coreano; no se documentan capacidades en otros idiomas.
- No se documentan tool calling, function calling, capacidades de agente multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Docencia de destilación de políticas de RL: el modelo sirve como ejemplo completo de cómo convertir una política PPO en un adaptador LoRA sobre un LLM pequeño, con código, datos y métricas reproducibles.
- Investigación en aprendizaje por refuerzo con anclaje KL: permite estudiar cómo una recompensa derivada de un simulador corrige una política supervisada sin colapsar la distribución original.
- Prototipado de controladores basados en lenguaje para robótica simulada: se puede integrar en el bucle de decisión de un robot virtual que reciba observaciones textuales cada 0,5 segundos y actúe en consecuencia.
- Generación de datos sintéticos de decisión: el adaptador puede usarse para etiquetar estados del simulador y ampliar conjuntos de entrenamiento para otras políticas.
- Evaluación comparativa de métodos de alineación: al tener versiones "antes de entrenar", "supervisada" y "con RL", permite comparar el efecto de cada etapa sobre la tasa de éxito en el simulador.
- Reproducción educativa en Google Colab: la model card incluye un notebook de Colab para reentrenar y evaluar el adaptador, adecuado para cursos de RL y de ajuste fino de LLM.
- Base para experimentos de transferencia a otros robots simulados: el formato de problema (situación, pregunta, opciones) es reutilizable para otras tareas de decisión con acción discreta.

## Benchmarks y rendimiento

| Modelo | Acierto en preguntas de test (misma respuesta que el cerebro) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio de los episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 100 % | 0 % | 11,9 s |
| Antes de entrenar | 24,5 % | 0 % | 0 % | — |
| Aprendizaje supervisado | 69,5 % | 95 % | 0 % | 20,8 s |
| Aprendizaje por refuerzo | 68,9 % | 100 % | 0 % | 17,5 s |

Los datos provienen de la model card del autor. La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo, por lo que los resultados pueden diferir de los del entorno web.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 0,8 mil millones de parámetros en el modelo base, la inferencia en precisión nativa requeriría del orden de 2 GB, y menos con cuantización de 8 o 4 bits, pero este dato no está confirmado por el autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del modelo base es plausible que quepa en GPUs de consumo, pero no hay dato oficial.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` y `peft` (`PeftModel.from_pretrained` sobre `AutoModelForCausalLM`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8 mil millones (base) + LoRA | No disponible | Decisión discreta `goto_target` en robot simulado | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8 mil millones | No disponible | Lenguaje general | No disponible en la información | Hugging Face |
| Política PPO "cerebro" (profesor) | No disponible | No aplica | Decisión `goto_target` en simulador | No disponible | Uso interno del proyecto |

No se dispone de datos de benchmarks comparables con otros modelos de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de propósito muy restringido: solo responde a la tarea `goto_target` con 5 acciones discretas; no es un asistente conversacional ni un modelo de lenguaje general.
- Entrenado exclusivamente en coreano; no se documenta comportamiento en castellano ni en otros idiomas.
- Validado únicamente en simulación: la model card advierte explícitamente de que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo, por lo que las cifras de éxito pueden no trasladarse al entorno real.
- El acierto en preguntas de test baja ligeramente tras el RL (68,9 % frente a 69,5 % del aprendizaje supervisado), aunque el éxito en episodios sube al 100 %; el autor prioriza el éxito de la tarea sobre la imitación exacta del profesor.
- Riesgo de alucinación en el formato: si el estado de entrada se sale de la distribución de entrenamiento, el modelo puede devolver una letra no válida o una explicación, pese a la instrucción de sistema.
- Sin datos publicados sobre sesgos, robustez adversarial ni comportamiento ante entradas malformadas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen/Qwen3.5-0.8B tiene su propia licencia, que debe verificarse por separado antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/youn485/connectailab-rl-connectailab-rl-jinbrain-link01-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
