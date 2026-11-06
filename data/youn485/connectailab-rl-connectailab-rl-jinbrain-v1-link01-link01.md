# youn485/connectailab-rl-connectailab-rl-jinbrain-v1-link01-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario youn485 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje generalista, sino un cerebro de decisión para un robot simulado llamado LINK-01: recibe una descripción textual del estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a una de las opciones de locomoción disponibles para los próximos 0,5 segundos.

El modelo se entrenó en dos fases sobre datos generados por un agente PPO que resolvía la tarea `avoid_obstacles` en un simulador web: primero aprendizaje supervisado (LoRA) imitando las decisiones del agente profesor, y después aprendizaje por refuerzo con regularización KL para ajustar las preferencias entre opciones. El conjunto de datos contiene 1.152 ejemplos de entrenamiento, 219 de validación y 298 de prueba.

Su relevancia es acotada y muy específica: demuestra un pipeline completo de destilación de políticas de RL hacia un modelo de lenguaje pequeño (0,8B parámetros) para toma de decisiones discretas en robótica simulada. Los resultados publicados son modestos (53,0 % de acierto frente al profesor en el conjunto de prueba y 5 % de éxito en 20 episodios de evaluación), lo que lo sitúa como una prueba de concepto educativa más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El entrenamiento se realizó en dos etapas. En la primera, se generó un conjunto de problemas a partir de las observaciones que un agente PPO (el "profesor" o `brain.json`) registraba cada 0,5 segundos mientras recorría el circuito `random` en la tarea `avoid_obstacles`; cada observación se convirtió en texto y la respuesta correcta era la acción elegida por el profesor, incluyendo un 20 % de ejemplos donde el profesor se desviaba deliberadamente. Sobre esos datos se aplicó aprendizaje supervisado con LoRA.

En la segunda etapa se aplicó aprendizaje por refuerzo con PPO y una penalización KL para mantener el adaptador cerca de la política supervisada. La recompensa de cada opción se estimó como el retorno que habría obtenido el profesor si hubiera ejecutado esa opción y después hubiera continuado con su propia política. El modelo finalmente publicado es el de la fase de aprendizaje supervisado, no el de RL, según indica la model card. La evaluación de caminata se realizó con una aproximación 2D basada en una tabla de velocidades por comando derivada de MuJoCo web, no con el simulador físico completo.

## Capacidades

- Clasificación de decisiones discretas: dado un estado textual del robot, devuelve exactamente una letra entre las opciones listadas.
- Razonamiento de instrucciones breve con formato estricto: el prompt de sistema exige devolver solo la letra, sin explicación.
- Tratamiento del estado como datos, no como instrucciones (defensa básica contra inyección de prompt en el campo `state`).
- Tarea especializada: evitación de obstáculos (`avoid_obstacles`) en un entorno simulado tipo laberinto.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al coreano según la etiqueta de idioma; el prompt de sistema está en inglés pero el modelo no declara soporte general de inglés.

## Casos de uso

- Docencia de pipelines RL-a-LLM: sirve como ejemplo reproducible de cómo destilar una política PPO en un modelo de lenguaje pequeño mediante LoRA y RL con KL, usando el notebook de Colab enlazado en la model card.
- Prototipado de controladores basados en lenguaje para robótica simulada: el modelo puede sustituir al agente PPO en el bucle de decisión del simulador web CONNECT AI WORLD para comparar el comportamiento de una política neuronal frente a una política textual.
- Investigación sobre robustez a inyección de prompt: el diseño del prompt de sistema permite estudiar cómo un modelo de 0,8B maneja texto no confiable dentro del campo de estado.
- Evaluación de formatos de salida restringidos: útil para medir la tasa de adherencia a respuestas de una sola letra en modelos pequeños tras fine-tuning.
- Generación de datos sintéticos de decisión: el adaptador puede usarse para etiquetar estados simulados y ampliar el conjunto de entrenamiento de otros agentes.
- Benchmark interno de destilación: comparar la tasa de coincidencia con el profesor (53,0 % en test) frente a otras variantes de LoRA o de tamaño de modelo en el mismo conjunto de 298 ejemplos.
- Reproducción educativa del flujo completo: clonar el repositorio connect-tycoon, entrenar el cerebro PPO, generar el problem set y reentrenar el adaptador con hiperparámetros distintos.

## Benchmarks y rendimiento

Datos publicados en la model card (conjunto de prueba de 298 ejemplos y 20 episodios de evaluación con semillas 91001–91020):

| Modelo | Acierto en test (coincidencia con el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Profesor (PPO `brain.json`) | 100,0 % | 100 % | 5 % | 21,9 s |
| Modelo base sin entrenar | 37,2 % | 0 % | 10 % | no disponible |
| Adaptador tras aprendizaje supervisado (publicado) | 53,0 % | 5 % | 95 % | 44,5 s |
| Adaptador tras RL | 50,7 % | 0 % | 85 % | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,6 GB para el modelo base de 0,8B, más el adaptador LoRA (overhead pequeño, no cuantificado en la model card).
- En cuantización de 8 bits: aproximadamente 0,8–1 GB de VRAM; en 4 bits, alrededor de 0,5 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; también cabe en CPU para inferencia puntual.
- Despliegue: la model card solo documenta el uso con `transformers` + `peft`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la conversión a GGUF requeriría fusionar el adaptador con el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este adaptador) | 0,8B + LoRA | no disponible | Decisión discreta en robótica simulada | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | Lenguaje general | no disponible | Hugging Face |
| Política PPO `brain.json` (profesor) | no disponible | no aplica | Decisión discreta en robótica simulada | no disponible | Repositorio connect-tycoon |
| Otros adaptadores LoRA de robótica simulada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros adaptadores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy bajo en evaluación de caminata: 5 % de éxito en 20 episodios y 95 % de episodios con colisión, frente al 100 % del profesor PPO.
- El modelo publicado es el de aprendizaje supervisado, no el de RL, pese a que las etiquetas del repositorio incluyen `ppo` y `reinforcement-learning`; el adaptador de RL obtuvo resultados aún peores (50,7 % de acierto y 0 % de éxito).
- La evaluación de caminata usa una aproximación 2D con tabla de velocidades por comando, no el simulador MuJoCo completo; los resultados pueden diferir del comportamiento real.
- Entrenado exclusivamente para la tarea `avoid_obstacles` en el circuito `random`; no generaliza a otras tareas ni entornos sin reentrenamiento.
- Idioma declarado: coreano. El prompt de sistema está en inglés, lo que puede introducir inconsistencia lingüística.
- Riesgo de alucinación relevante: el modelo puede devolver letras fuera del conjunto de opciones o texto adicional pese a la instrucción de responder solo con la letra.
- No apto para uso en robots físicos sin revalidación explícita en el robot y el espacio concretos, tal como advierte el propio autor.
- Repositorio con 0 descargas y 0 likes; sin evidencia de uso comunitario ni mantenimiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Sin datos publicados sobre sesgos, contexto máximo ni comportamiento fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/youn485/connectailab-rl-connectailab-rl-jinbrain-v1-link01-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
