# spmoon/connectailab-rl-jjangu-v2-link01

## Resumen

connectailab-rl-jjangu-v2-link01 es un adaptador LoRA publicado por el usuario spmoon (en el marco del proyecto CONNECT AI LAB / AI CITY BUILDERS) que convierte el modelo base Qwen/Qwen3.5-0.8B en un clasificador de decisiones de un solo carácter para el robot simulado LINK-01. El modelo recibe una descripción textual del estado del robot (distancia y dirección al objetivo, lectores de distancia, velocidad y acción previa) y devuelve una única letra que representa cómo debe caminar durante los siguientes 0,5 segundos.

El problema que resuelve es la destilación de una política de refuerzo (entrenada con PPO en un entorno web de MuJoCo) hacia un modelo de lenguaje pequeño, de modo que la decisión del robot pueda expresarse y ejecutarse como una clasificación de texto. El flujo de entrenamiento combina aprendizaje supervisado (LoRA sobre 522 ejemplos de entrenamiento) y un paso posterior de ajuste por refuerzo con anclaje KL, partiendo de un modelo base de 0,8 mil millones de parámetros.

Es relevante como ejemplo de integración entre RL clásico (PPO, robótica de decisión) y modelos de lenguaje de pequeño tamaño, y por su licencia Apache 2.0. No obstante, se trata de un modelo de investigación y educación sobre simulador, con un dominio extremadamente acotado (una única tarea `goto_target`) y sin datos de benchmarks generales publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base); numero de parametros del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base no especificada) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA montado sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador no modifica la arquitectura del base: añade matrices de bajo rango entrenadas para la tarea de selección de una letra entre las opciones de una pregunta de decisión. La entrada se construye con la función `Q.task_of("goto_target", obs)` del paquete `connect_tycoon`, que serializa la observación del robot en un formato de situación, pregunta y opciones.

El entrenamiento se realizó en dos fases. Primero, aprendizaje supervisado sobre 522 ejemplos de entrenamiento (101 de validación, 148 de test), generados haciendo que la política PPO "profesora" (brain.json) recorriera un curso aleatorio y registrando cada 0,5 segundos la observación textualizada junto con la acción elegida; aproximadamente el 20% de los ejemplos corresponden a situaciones en las que la política se desvió del camino. Después, un ajuste por refuerzo en el que cada opción recibe la recompensa que habría obtenido si el resto del episodio lo hubiera continuado la política profesora, con una penalización KL para mantener el adaptador cerca de la distribución supervisada. La tasa de acuerdo entre la representación textual y la política profesora (techo de acierto) se sitúa en el 98%.

## Capacidades

- Clasificación de decisión de un solo carácter: devuelve exactamente una letra entre las opciones listadas, sin explicación, tal como exige el prompt de sistema.
- Interpretación de observaciones serializadas de robótica: distancia y dirección al objetivo, lectores de distancia, velocidad y acción previa.
- Seguimiento de instrucciones de formato estricto (salida restringida a una letra).
- Robustez parcial ante desviaciones del camino: el conjunto de entrenamiento incluye un 20% de situaciones fuera de ruta.
- Capacidad multilingüe: limitada al coreano según la model card; no se documentan otras lenguas.
- No se documentan tool calling, function calling, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Control de decisión en simulación de robótica: sustituir la política PPO por el adaptador en el bucle de decisión de LINK-01 para caminar hacia un objetivo, validando el comportamiento en el simulador web antes de cualquier despliegue físico.
- Docencia de RL y destilación: usar el par (política PPO, adaptador LoRA) como ejemplo práctico de cómo destilar una política de refuerzo en un modelo de lenguaje pequeño, con el cuaderno de Colab incluido.
- Evaluación comparativa de políticas: ejecutar las 20 partidas de validación con semillas fijas (91001–91020) para medir la tasa de éxito del adaptador frente a la política profesora.
- Generación de datos sintéticos de decisión: emplear el adaptador como anotador de bajo coste de observaciones simuladas para ampliar el conjunto de entrenamiento de otras políticas.
- Pruebas de formato y robustez de prompts: verificar que un modelo de 0,8 mil millones respeta instrucciones de salida de un solo carácter con datos embebidos en el estado.
- Prototipado de agentes de decisión discretos: integrar el adaptador en un pipeline que traduzca observaciones a preguntas y acciones, como paso previo a modelos mayores.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, referidos a la tarea `goto_target` y evaluados con una aproximación 2D de la marcha (tabla de velocidades por comando), no con el simulador MuJoCo completo:

| Modelo | Acierto en test (misma respuesta que la política profesora) | Éxito en 20 partidas del mismo curso | Partidas con colisión | Tiempo medio en partidas exitosas |
|---|---|---|---|---|
| Política PPO (profesora) | 100,0% | 100% | 0% | no disponible |
| Modelo base sin adaptador | 37,2% | 0% | 100% | no disponible |
| Adaptador con aprendizaje supervisado | 56,1% | 95% | 5% | no disponible |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,6 GB en FP16 para el modelo base de 0,8 mil millones de parámetros, más el adaptador LoRA (tamaño no disponible); en cuantización de 4 bits cabría en menos de 1 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; para lotes grandes o baja latencia, A100 o H100 no aportan ventaja significativa por el tamaño del modelo.
- Cabe en GPU consumer: sí, con holgura.
- Opciones de despliegue: transformers + PEFT (flujo documentado en la model card); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jjangu-v2-link01 | 0,8 mil millones (base) + LoRA | no disponible | Decisión discreta para LINK-01 (`goto_target`) | Apache 2.0 | Hugging Face (22 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8 mil millones | no disponible | Lenguaje general | no disponible en la información | Hugging Face |
| Política PPO original (brain.json) | no disponible | no aplica | Decisión discreta para LINK-01 | no disponible | Repositorio connect-tycoon |

No se dispone de información sobre otros adaptadores comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente restringido: entrenado únicamente para la tarea `goto_target` del robot LINK-01; no generaliza a otras tareas, robots ni entornos.
- Validación solo en simulación: la evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo, por lo que los resultados pueden diferir del comportamiento real.
- El autor advierte explícitamente de que es un modelo de investigación y educación sobre simulador y de que debe revalidarse en el robot y el espacio concretos antes de cualquier uso físico.
- Riesgo de alucinación de letra: el adaptador puede devolver una opción no listada o incorrecta; el acierto frente a la política profesora es del 56,1%, muy por debajo del 100% de esta.
- Idioma limitado al coreano; el prompt de sistema está en inglés, pero no se documenta soporte multilingüe.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base Qwen/Qwen3.5-0.8B debe verificarse por separado, ya que no se detalla en la información disponible.
- El repositorio tiene un tamaño de 0,0 GB y solo 22 descargas, lo que sugiere un artefacto de investigación sin mantenimiento ni comunidad consolidadas.

## Enlaces

- Hugging Face: https://huggingface.co/spmoon/connectailab-rl-jjangu-v2-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno de aprendizaje web: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com/robot
