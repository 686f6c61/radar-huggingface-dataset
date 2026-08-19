# ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3anchor2-l5

## Resumen

El modelo `ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3anchor2-l5` es un adaptador LoRA (PEFT) desarrollado por el autor `ssurface` sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Su propósito es entrenar al modelo para razonar en un nivel de compresión extremo de cadena de pensamiento (chain-of-thought, CoT), denominado L5, donde el razonamiento interno se colapsa a una única expresión matemática (por ejemplo, `18/3*2=12`). Forma parte de una colección de investigación sobre «dialectos de compresión de CoT» que estudia cómo reducir drásticamente la longitud de las cadenas de razonamiento sin perder precisión en tareas matemáticas.

Esta variante concreta es una **ablación de diseño de recompensa**: se entrenó con una función de recompensa alternativa (`gr3` con ancla en 0.3) para comparar el efecto de distintas estrategias de reescalado de recompensa dentro del grid experimental del paper asociado. No es uno de los modelos principales de la colección; el modelo principal para este nivel es `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5`. El adaptador se entrenó con GRPO sobre un modelo SFT fusionado de nivel L5, usando exclusivamente datos de GSM8K, y no fue evaluado por separado.

Su relevancia radica en que permite reproducir y analizar el trade-off entre compresión del razonamiento y precisión en modelos de lenguaje, un área activa en la optimización de inferencia para entornos con restricciones de latencia o coste de tokens de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador ocupa ~0.1 GB; el modelo base tiene 4B parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la documentacion) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Instruct-2507`, un modelo transformer decoder-only de 4.000 millones de parametros. La capa LoRA usa rango 16 y alpha 32, y se entrena con GRPO (Group Relative Policy Optimization) mediante `trl.GRPOTrainer` sobre `transformers` estandar con atencion `sdpa`. El entrenamiento parte de un modelo SFT fusionado de nivel L5, no del modelo base crudo, por lo que el adaptador debe apilarse sobre dicho SFT para reproducir los resultados.

Los datos de entrenamiento consisten en 6.993 ejemplos del conjunto de entrenamiento de GSM8K, re-expresados a nivel L5 por un modelo profesor. La mediana de longitud de las cadenas de razonamiento dentro de `thinking` es de 16 caracteres, frente a los 532 caracteres del nivel L1, lo que supone un rango de 33x entre niveles. La funcion de recompensa combina tres componentes: `correctness` (que pondera el acierto de respuesta por el numero de pasos de la solucion dorada), `format` (que exige una estructura `thinking... response... #### <answer>`) y `gr3` (un reescalado multiplicativo de la recompensa positiva con piso en 0.3, disenado para no reordenar respuestas correctas frente a incorrectas).

Un detalle tecnico relevante: el autor verifico que todas las matrices `lora_B` del adaptador fueran distintas de cero antes de publicarlo, descartando 13 adaptadores que resultaron matematicamente inertes debido a un camino de entrenamiento con kernels fusionados defectuosos.

## Capacidades

- Razonamiento matematico sobre problemas de palabras (word problems) con cadenas de pensamiento extremadamente comprimidas (nivel L5).
- Generacion de texto en un formato estructurado especifico: un bloque `thinking` (razonamiento interno) seguido de `response` y una respuesta final con el prefijo `####`.
- Soporte de generacion autoregresiva estandar mediante la libreria `transformers` con PEFT.
- Capacidad multilingue: solo ingles (segun la model card).
- No incluye tool calling, ni capacidades de vision, audio u otras modalidades.

## Casos de uso

- Investigacion academica sobre compresion de chain-of-thought: permite estudiar como afecta la reduccion drastica de la longitud del razonamiento a la precision en tareas aritmeticas, comparando niveles L1 a L5 dentro de la misma familia de modelos.
- Ablacion de diseno de recompensa en RL (GRPO): este adaptador sirve para reproducir el experimento de comparacion entre la recompensa `gr3` con ancla 0.3 y otras variantes, tal como se describe en el paper de la coleccion.
- Evaluacion de robustez de modelos comprimidos: puede usarse como caso limite para medir la degradacion de precision cuando el razonamiento se colapsa a una sola expresion, util para decidir si la compresion es viable en produccion.
- Generacion de respuestas con presupuesto de tokens de salida muy reducido: en escenarios donde el coste por token de salida es critico (por ejemplo, APIs de pago), un modelo que razona en 16 caracteres en lugar de 500 reduce drasticamente el coste, aunque con perdida de precision.
- Benchmarking de eficiencia de inferencia: al requerir menos tokens de generacion, permite medir la mejora en latencia y throughput frente al modelo base sin compresion.
- Educacion y divulgacion: como ejemplo practico de como el RL puede alterar el estilo de razonamiento de un modelo, ilustrando conceptos de compresion y trade-off en sistemas de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este adaptador «no fue evaluado por separado» y que existe como artefacto de entrenamiento para el grid de ablacion; los niveles que llevan numeros reportados son los del conjunto principal de la coleccion.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (~0.1 GB), pero requiere cargar el modelo base Qwen3-4B-Instruct-2507 completo.
- VRAM estimada para inferencia: aproximadamente 8 GB en precision bf16, o unos 4 GB si el modelo base se cuantiza a 4 bits (por ejemplo, con bitsandbytes).
- GPU recomendadas: tarjetas consumer con al menos 8 GB de VRAM (RTX 3070/3080/3090/4070/4090) son suficientes para bf16; con cuantizacion 4-bit basta con 4-6 GB.
- El entrenamiento original se realizo en una unica NVIDIA A100 80GB, pero la inferencia no requiere ese nivel de hardware.
- Opciones de despliegue: `transformers` con `peft` (carga directa del adaptador), o fusion del adaptador con el modelo base para usar `vLLM`, `llama.cpp` u `Ollama`. Es necesario apilar primero el adaptador SFT L5 y luego este adaptador, y fusionar antes de exportar.
- Latencia y throughput: no disponibles en la documentacion; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Compresion CoT | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3anchor2-l5 (este) | Adaptador LoRA sobre Qwen3-4B | 4B (base) | no disponible | Nivel L5 (16 caracteres) | apache-2.0 | HuggingFace |
| ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5 | Adaptador LoRA sobre Qwen3-4B | 4B (base) | no disponible | Nivel L5 (modelo principal) | apache-2.0 | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 | Modelo base instruct | 4B | no disponible | Sin compresion (CoT estandar) | apache-2.0 | HuggingFace |

La comparativa se limita a la propia familia de modelos, ya que no se dispone de datos de rendimiento publicados para este adaptador. La diferencia principal entre este adaptador y el modelo principal del mismo nivel es la funcion de recompensa usada en el entrenamiento GRPO: este usa `gr3` con ancla 0.3, mientras que el principal usa otra configuracion. No hay datos cuantitativos que permitan comparar con modelos externos de razonamiento como Llama 3.1 8B o Mistral 7B.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente sobre problemas de palabras matematicas (GSM8K); no generaliza a otros dominios.
- La precision disminuye con la dificultad del problema, y esa degradacion es mas acusada en los niveles de compresion extrema como L5.
- Es un artefacto de ablacion: fue entrenado para responder una pregunta concreta sobre diseno de recompensa y puede ser peor que el modelo principal del mismo nivel.
- Requiere apilarse sobre el adaptador SFT de nivel L5 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`); cargarlo directamente sobre el modelo base no reproduce los resultados esperados.
- El entrenamiento se realizo con una sola semilla, por lo que diferencias de unos pocos puntos porcentuales en precision pueden deberse a ruido estadistico (intervalo de confianza del 95% de aproximadamente ±2.7 puntos en n=1317).
- No se han publicado benchmarks independientes para este adaptador; cualquier afirmacion sobre su rendimiento debe tratarse con cautela.
- Solo soporta ingles; no hay garantias de funcionamiento en otros idiomas.
- Licencia apache-2.0 permite uso comercial, pero al depender del modelo base Qwen3-4B-Instruct-2507, deben respetarse las condiciones de la licencia de dicho modelo.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3anchor2-l5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/openai/gsm8k
- Adaptador SFT de nivel L5 (requerido para apilar): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l5
- Modelo principal del nivel L5 (mencionado en la model card): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5
- Paper asociado: no disponible en la informacion proporcionada (referencia citada: «Chain-of-Thought Compression Dialects», Frolov, Anatolii, 2026).
