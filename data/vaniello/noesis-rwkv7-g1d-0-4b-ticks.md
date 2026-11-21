# Vaniello/noesis-rwkv7-g1d-0.4b-ticks

## Resumen

noesis-rwkv7-g1d-0.4b-ticks es un checkpoint de demostración del método noesis, publicado por Vaniello sobre el modelo base RWKV-7 G1d de 0,4 mil millones de parámetros desarrollado por BlinkDL. El modelo implementa una forma de razonamiento latente específica para arquitecturas recurrentes: tras procesar el prompt, el vector de la última capa se realimenta como entrada siguiente sin emitir token, repetidamente, durante un número configurable de "ticks" (en este caso cuatro), antes de decodificar la respuesta final. RWKV-7 permite este mecanismo porque su cabeza de salida está desacoplada de los embeddings de entrada y la entrada pasa por `ln0`, de modo que el vector realimentado no tiene que corresponder a una palabra del vocabulario.

El problema que aborda es la pérdida de capacidad de respuesta cuando se aplican ticks a un modelo recurrente no entrenado para ello: un solo tick borra el 89 % de los ítems que el modelo resolvía sin ticks (conserva 0,11). El entrenamiento consiste en 100 pasos de ajuste fino de todos los pesos con el optimizador Muon, destilando por KL a temperatura 2 la distribución de respuesta a través de cuatro ticks hacia la del mismo modelo sin ticks, sin etiquetas, sin recompensa y sin profesor externo.

Es relevante como prueba de concepto reproducible de razonamiento latente en modelos recurrentes de estado, una línea distinta del chain-of-thought por tokens. No obstante, el propio autor advierte que se trata de una demostración con seis preguntas, no de un benchmark, y que los ticks todavía no aportan potencia de razonamiento adicional medible (44 frente a 46 ítems resueltos de 304).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (transformer recurrente con estado, base G1d) |
| Parametros totales | 0,4 B (según nombre del checkpoint; cifra exacta no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (según identificador del modelo base `ctx8192`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés, ruso |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (state dict completo de PyTorch) |
| Libreria | rwkv |
| Tamano del repositorio | 1,8 GB |
| Modelo base | BlinkDL/rwkv7-g1 (`rwkv7-g1d-0.4b-20260210-ctx8192`) |
| Metodo de ajuste | destilacion por KL (T=2) a traves de 4 ticks, 100 pasos, optimizador Muon |

## Arquitectura y entrenamiento

La arquitectura subyacente es RWKV-7, un modelo recurrente con estado que combina mecanismos de atención lineal con una formulación de estado evolutivo, lo que permite inferencia con coste constante por token y memoria acotada independientemente de la longitud de la secuencia. El checkpoint parte de `rwkv7-g1d-0.4b-20260210-ctx8192` de BlinkDL, con 8192 tokens de contexto. La innovación del método noesis no reside en la arquitectura, sino en el uso del estado: el vector de la última capa se reinyecta como embedding de entrada M veces (ticks) sin emitir token, aprovechando que en RWKV-7 la cabeza de salida es independiente de los embeddings y que la entrada atraviesa `ln0`.

El entrenamiento consistió en 100 pasos de ajuste fino de todos los pesos con Muon. La señal de supervisión es la divergencia KL a temperatura 2 entre la distribución de respuesta a través de cuatro ticks y la del mismo modelo congelado sin ticks. No se emplearon etiquetas, recompensas ni profesor externo: es autodestilación. Según las mediciones del autor, el entrenamiento eleva la retención de ítems resueltos tras un tick de 0,11 a 0,56-0,89 en el piloto de 200 pasos del que deriva esta receta, y aumenta el rango efectivo del latente entre prompts de 3,2 a 7,9, evitando el colapso a un único punto.

## Capacidades

- Generación de texto conversacional en inglés y ruso a través de cuatro ticks latentes.
- Razonamiento latente mediante realimentación del estado sin emisión de tokens (mecanismo de ticks).
- Respuestas coherentes donde el modelo base entra en bucle o divaga, según los ejemplos cualitativos del autor.
- Mayor diversidad léxica por respuesta: 48,5 palabras distintas frente a 42,3 del base.
- El estado retiene información que la cabeza no lee tras los ticks: un lector lineal sobre el estado predice la siguiente palabra con perplejidad 0,177 frente a 0,101 de la cabeza del modelo.
- Soporte de tool calling: no entrenado explícitamente; sin ticks el modelo envuelve respuestas en `<tool_call>{"name": "answer", ...}` como artefacto del formato de los datos de entrenamiento.
- Capacidades de agente multi-paso: no disponibles.
- Visión, audio o modo thinking explícito: no disponibles.

## Casos de uso

- Investigación en razonamiento latente: reproducción del método noesis sobre el checkpoint publicado para estudiar cómo el estado recurrente codifica información tras varios ticks, usando el cargador `forward_stateful_embeds` y la sonda `chat_probe.py` del repositorio.
- Experimentación con modelos recurrentes de bajo coste: el tamaño de 0,4 B y la inferencia de coste constante por token permiten ejecutar barridos de hiperparámetros (número de ticks, temperatura de destilación) en hardware modesto.
- Destilación autosupervisada como técnica de ajuste: servir de plantilla para aplicar autodestilación por KL a otros checkpoints RWKV sin necesidad de datos etiquetados ni recompensas.
- Generación de texto conversacional en inglés y ruso en entornos con restricciones de memoria: la ventana de 8192 tokens con estado acotado encaja en despliegues donde un transformer equivalente no cabría.
- Estudio de formatos de tool calling en modelos pequeños: analizar el artefacto `<tool_call>` que aparece sin ticks para entender cómo los datos de entrenamiento del base condicionan el formato de salida.
- Docencia y divulgación: demostración reproducible de la diferencia entre razonamiento por tokens y razonamiento en el espacio latente, con ejemplos comparados base/checkpoint en `samples.md`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas aportadas por el autor son medidas internas del método, no comparables con benchmarks estándar:

| Metrica | Base (sin ticks) | Checkpoint (4 ticks) |
|---|---|---|
| Retencion de items resueltos tras 1 tick | 0,11 | 0,56-0,89 (piloto de 200 pasos) |
| Palabras distintas por respuesta | 42,3 | 48,5 |
| Rango efectivo del latente entre prompts | 3,2 | 7,9 |
| Perplejidad de lector lineal sobre el estado | 0,254 | 0,177 |
| Perplejidad de la cabeza del modelo | 0,373 | 0,101 |
| Items resueltos (familias probadas) | 46 de 304 | 44 de 304 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,8-1 GB para los pesos de 0,4 B, más el estado recurrente y el contexto; cifra exacta no disponible.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,4-0,5 GB; en 4 bits, alrededor de 0,25 GB (estimaciones por tamaño, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería bastar; RTX 3060, RTX 4060, RTX 4090 y superiores son adecuadas. Para entrenamiento o barridos, A100 o H100.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del repositorio (1,8 GB) y los 0,4 B de parámetros.
- Opciones de despliegue: el autor proporciona un cargador propio (`experiments/rl/loader.py`, función `forward_stateful_embeds`) y un script de ejecución (`experiments/run.py`) con backend `peft`. Los ticks requieren un forward que acepte embeddings, no ids de token, por lo que los runners estándar de llama.cpp, Ollama o vLLM no sirven sin adaptación. Compatibilidad con vLLM, TGI o llama.cpp: no disponible.
- Latencia y throughput: no disponibles. La inferencia RWKV-7 tiene coste constante por token, pero los ticks añaden M pasos de forward adicionales antes de la decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento latente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| noesis-rwkv7-g1d-0.4b-ticks | 0,4 B | 8192 | Sí (4 ticks, autodestilado) | Apache-2.0 | Hugging Face |
| BlinkDL/rwkv7-g1 (base) | 0,4 B | 8192 | No | Apache-2.0 | Hugging Face |
| Qwen2.5-0.5B | 0,5 B | 32 768 | No (CoT por tokens) | Apache-2.0 | Hugging Face |
| SmolLM2-360M | 0,36 B | 8192 | No (CoT por tokens) | Apache-2.0 | Hugging Face |

La comparación con transformers pequeños de tamaño similar es solo orientativa: no se dispone de benchmarks comunes entre este checkpoint y las alternativas, y el autor no publica resultados en MMLU, HumanEval ni GSM8K. La diferencia funcional clave es el mecanismo de ticks, exclusivo de la familia RWKV-7 y de este método.

## Limitaciones y advertencias

- Sin ticks, el checkpoint envuelve sus respuestas en `<tool_call>{"name": "answer", ...}`, un artefacto del formato de los datos de entrenamiento. Está diseñado para usarse con ticks.
- Los ticks no añaden potencia de razonamiento medible: en las familias de ítems probadas, 44 de 304 frente a 46 de 304 del base. Es un canal funcional, no una mejora de razonamiento.
- Los hechos de sus respuestas no son más fiables que los del base; el propio autor señala errores factuales en los ejemplos (velocidad punta y autonomía del Tesla Model 3 sobreestimadas).
- Riesgo de alucinación: presente, heredado del modelo base y no mitigado por el método.
- La evaluación se basa en seis preguntas de demostración, no en un benchmark; las conclusiones sobre calidad son cualitativas.
- Idiomas limitados a inglés y ruso; no hay soporte declarado de castellano.
- Licencia Apache-2.0: permite uso comercial, pero el checkpoint deriva de un modelo de BlinkDL bajo la misma licencia, por lo que conviene conservar la atribución.
- Requiere un cargador personalizado que acepte embeddings como entrada; no es directamente compatible con los runners estándar de inferencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Vaniello/noesis-rwkv7-g1d-0.4b-ticks
- Repositorio del método noesis (código, mediciones y método): https://github.com/Vaniell0/noesis
- Modelo base: https://huggingface.co/BlinkDL/rwkv7-g1
- Muestras comparadas base/checkpoint: `samples.md` en el repositorio del modelo
- Cargador con soporte de ticks: `experiments/rl/loader.py` (función `forward_stateful_embeds`)
- Sonda que generó las muestras: `experiments/rl/chat_probe.py`
