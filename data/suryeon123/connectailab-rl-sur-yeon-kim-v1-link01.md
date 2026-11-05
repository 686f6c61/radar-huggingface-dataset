# suryeon123/connectailab-rl-sur-yeon-kim-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario suryeon123 dentro del proyecto CONNECT AI LAB. No es un modelo de lenguaje de propósito general, sino un modelo de decisión específico para el robot simulado LINK-01 en la tarea `avoid_obstacles` (esquivar obstáculos). Su función es leer en texto el estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devolver una única letra que representa la acción de caminar para los siguientes 0,5 segundos.

El modelo se entrenó en dos fases: primero un ajuste supervisado (LoRA) para imitar las decisiones de una "cabeza" (brain.json) previamente entrenada con PPO en un entorno web de aprendizaje por refuerzo, y después una fase de RL con anclaje KL para reordenar las preferencias entre opciones según la recompensa obtenida. El conjunto de datos consta de 1231 ejemplos de entrenamiento, 302 de validación y 357 de test, generados a partir de trayectorias del agente profesor en el curso `random`.

Es relevante como ejemplo de destilación de políticas de RL hacia un modelo de lenguaje pequeño (0,8B parámetros) que razona sobre estados discretos y emite decisiones en un formato estrictamente restringido, con un pipeline reproducible publicado en GitHub y un notebook de Colab. Su alcance es educativo y de investigación en simulación 2D; el propio autor advierte que debe revalidarse antes de usarlo en un robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | No disponible (adaptador LoRA sobre base de 0,8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Coreano (ko) según la model card; el prompt de sistema está en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se carga con `peft.PeftModel` sobre el modelo base y se usa con `transformers`. La tarea se formula como clasificación de una única letra entre las opciones listadas; el prompt de sistema instruye explícitamente a tratar el contenido de `state` como datos y no como instrucciones, y a devolver solo la letra.

El entrenamiento tiene cuatro etapas descritas en la model card: (1) entrenamiento de la política profesor con PPO en el entorno web `avoid_obstacles`, curso `random`, con la convención `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1`; (2) generación de un "cuaderno de problemas" muestreando cada 0,5 s el estado observado por el profesor y su acción, incluyendo un 20% de ejemplos donde el profesor se desvió; (3) ajuste supervisado del LM para imitar al profesor; (4) refinamiento por RL donde cada opción se recompensa según el retorno obtenido si el profesor continuara desde ese estado, con una penalización KL que mantiene al modelo cerca de la política supervisada. La evaluación se hizo colocando el modelo en el puesto de decisión del robot y ejecutando 20 episodios con semillas 91001–91020, usando una aproximación 2D de la marcha basada en una tabla de velocidades por comando (sin MuJoCo real en la evaluación).

## Capacidades

- Decisión de acciones discretas para el robot LINK-01 en la tarea `avoid_obstacles`, devolviendo una única letra entre las opciones presentadas.
- Interpretación de estados textuales estructurados (distancia al objetivo, dirección, sensores de distancia, velocidad, acción previa).
- Formato de salida estrictamente restringido (solo la letra, sin explicación), adecuado para pipelines automatizados.
- Robustez parcial frente a instrucciones inyectadas en el campo `state`, gracias al prompt de sistema que separa datos de instrucciones.
- Capacidad multilingüe limitada al coreano declarado en la model card; el prompt de sistema está en inglés.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking de forma documentada.
- No se documenta razonamiento de propósito general, código ni matemáticas; el modelo base Qwen3.5-0.8B podría tenerlas, pero el adaptador está especializado en la tarea de decisión.

## Casos de uso

- Investigación en destilación de políticas RL a modelos de lenguaje: usar el pipeline publicado (PPO → dataset → SFT → RL con KL) como referencia para trasladar políticas de control a un LM pequeño y evaluar la fidelidad de la destilación.
- Educación en aprendizaje por refuerzo: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el entrenamiento paso a paso en un entorno controlado.
- Prototipado de agentes de decisión en simulación 2D: integrar el modelo en el bucle de control del simulador web para comparar su comportamiento con el del profesor PPO.
- Evaluación de robustez frente a prompts adversariales: el campo `state` se trata como datos, lo que permite estudiar cómo responde el modelo ante inyecciones de instrucciones.
- Benchmark de fidelidad de destilación: comparar la tasa de coincidencia con el profesor (66,1% en test) frente a la del SFT (66,4%) y analizar el efecto del RL en la tasa de éxito de episodios (25% vs. 5%).
- Generación de datos sintéticos de decisión: usar el modelo como generador de acciones etiquetadas para aumentar el dataset de entrenamiento de otras políticas en la misma tarea.
- Docencia y divulgación: el modelo y su model card sirven como ejemplo completo de un ciclo de RL aplicado a robótica simulada, con métricas de éxito, colisiones y tiempo medio por episodio.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación sobre 357 problemas de test y 20 episodios con semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (PPO) | 100,0% | 90% | 15% | 26,2 s |
| Antes de entrenar | 54,6% | 0% | 10% | — |
| SFT (LoRA) | 66,4% | 5% | 100% | 41,0 s |
| RL (este modelo) | 66,1% | 25% | 90% | 29,0 s |

El techo teórico de acierto (fidelidad de la representación textual del estado) es del 99%. La evaluación de marcha usa una aproximación 2D basada en una tabla de velocidades por comando, no MuJoCo real, por lo que los resultados pueden diferir de la simulación física.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 0,8B parámetros; en fp16 ocupa aproximadamente 1,6 GB, y el adaptador LoRA añade unos pocos MB. En cuantización de 4 bits cabría en menos de 1 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; también CPU para inferencia puntual.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` + `peft` (documentado en la model card); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador, aunque el modelo base Qwen3.5-0.8B podría convertirse a GGUF.
- Latencia y throughput: no disponibles. El caso de uso requiere una decisión cada 0,5 s, lo que es holgado para un modelo de 0,8B en GPU consumer.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (decisión de robot LINK-01 en `avoid_obstacles`). Como referencia del mismo proyecto, la model card compara el propio modelo con el profesor PPO, el modelo sin entrenar y la variante SFT (ver tabla de benchmarks). Frente a otros adaptadores LoRA sobre Qwen3.5-0.8B no se han publicado comparativas.

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| LINK-01 RL (este) | 0,8B + LoRA | No disponible | Decisión `avoid_obstacles` | Apache-2.0 |
| Profesor PPO (brain.json) | No aplica (política RL) | No aplica | Decisión `avoid_obstacles` | No disponible |
| LINK-01 SFT | 0,8B + LoRA | No disponible | Decisión `avoid_obstacles` | Apache-2.0 |
| Qwen3.5-0.8B base | 0,8B | No disponible | LM de propósito general | No disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en la tarea `avoid_obstacles` del robot LINK-01; no es un LM de propósito general ni sirve para otras tareas sin reentrenamiento.
- El acierto en test (66,1%) está muy por debajo del profesor (100%) y del techo teórico del 99%; la tasa de éxito en episodios es solo del 25% frente al 90% del profesor.
- La tasa de colisión en los 20 episodios es del 90%, lo que indica un comportamiento frágil en el bucle cerrado.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no simulación física real; los resultados pueden no transferirse a MuJoCo ni a un robot físico.
- El propio autor advierte que es un modelo de investigación y educación sobre simulación, y que debe revalidarse en el robot y el espacio concretos antes de un uso real.
- Idioma declarado: coreano; el prompt de sistema está en inglés, lo que puede afectar a la consistencia en otros idiomas.
- Riesgo de alucinación: el modelo podría devolver una letra no listada o texto adicional si el prompt no se aplica estrictamente; el prompt de sistema mitiga pero no elimina este riesgo.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- No se documentan sesgos sociales ni de otro tipo; el dominio es control de robot simulado.
- No hay información sobre cuantizaciones oficiales, contexto máximo ni latencia medida.

## Enlaces

- HuggingFace: https://huggingface.co/suryeon123/connectailab-rl-sur-yeon-kim-v1-link01
- Repositorio CONNECT TYCOON (código de entrenamiento): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Vídeo del autor: https://www.youtube.com/watch?v=mpHgXJdvkYs
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Entorno web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Aplicación del autor: https://yumloop.vercel.app
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
