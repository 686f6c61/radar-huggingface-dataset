# syedazeez/glassbox-135m-sft

## Resumen

glassbox-135m-sft es un modelo de lenguaje de 135,3 millones de parámetros desarrollado por el investigador independiente syedazeez como parte de una serie de experimentos de entrenamiento desde cero con observabilidad completa. Se trata de un transformer decoder-only de 12 capas, dimensión 768 y 12 cabezas de atención, con una ventana de contexto de 1024 tokens, entrenado sobre 2,40 mil millones de tokens en una única H100 en 101 minutos. Su propósito no es competir con asistentes generales, sino servir como banco de pruebas reproducible para estudiar dinámicas de entrenamiento: cada paso publica telemetría detallada (activaciones por capa, entropía de atención por cabeza, ratios de actualización, escala de ruido de gradiente, rank espectral, logit lens y métricas de NVML).

Esta variante concreta aplica 600 pasos de SFT (supervised fine-tuning) sobre el modelo base, con batch 64 y learning rate 3e-4, usando scratchpads aritméticos verificados de 1 a 5 dígitos y calculando la pérdida únicamente sobre el span del asistente. El autor conserva deliberadamente el resultado negativo: el SFT llevó la NLL del razonamiento a 2e-5 y la entropía de política a ~0,01 nats/token, de modo que 16 muestras por prompt salían idénticas y el entrenamiento posterior con GRPO no obtuvo señal de aprendizaje (94-100 % de los grupos completamente acertados o completamente fallidos, incluso con temperatura 1,6).

El modelo es relevante ahora como caso de estudio sobre colapso de entropía y sobre la relación entre ajuste supervisado y aprendizaje por refuerzo en modelos pequeños. Su utilidad práctica es limitada: resuelve correctamente sumas, restas y multiplicaciones por un dígito con operandos de 3 a 5 dígitos y de igual longitud, pero falla por completo fuera de ese dominio. La licencia Apache 2.0 y su reducido tamaño (0,5 GB de repo) lo hacen fácil de ejecutar y auditar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 12 capas, d_model 768, 12 cabezas, RoPE (base 10k), pre-norm RMSNorm, QK-norm, MLP con squared-ReLU (4x), cabeza no atada, tanh logit soft-cap 30, z-loss 1e-4 |
| Parametros totales | 135.287.040 (25,2 M corresponden al embedding de entrada) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (seq len de entrenamiento) |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors en precisión de entrenamiento; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) con definición de modelo en modeling_glassbox.py; requiere PyTorch, safetensors y tokenizers, no usa transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 12 capas con d_model 768 y 12 cabezas de atención, que incorpora RoPE con base 10.000, normalización RMSNorm en pre-norm, QK-norm, una MLP con activación squared-ReLU de factor 4, cabeza de salida no atada al embedding, soft-cap de logits con tanh a 30 y una pérdida auxiliar z-loss de 1e-4. El tokenizador es un BPE a nivel de byte con vocabulario de 32.768 tokens, entrenado sobre 300.000 documentos de FineWeb-Edu más 20.000 documentos aritméticos, con la particularidad de que cada dígito es un token propio (4,49 bytes/token en texto web). Define tokens especiales `<|endoftext|>`, `<|pad|>`, `<think>`, `</think>`, `<answer>`, `</answer>`, `<|user|>` y `<|assistant|>`.

El preentrenamiento consumió 2,40 mil millones de tokens en una H100 durante 101 minutos (aproximadamente 7,4 dólares en Modal), con optimizador Muon para matrices ocultas y AdamW para embeddings, cabeza y gains, a 524.000 tokens por paso y un schedule warmup-stable-decay consciente del tiempo. El 33 % de MFU, sin updates saltados ni alertas de detector. Los datos provienen de FineWeb-Edu `sample/10BT` (ficheros 000-002 para entrenamiento, 013 reservado), 2.300 millones de tokens con puntuaciones de calidad 3-5, más 150 millones de tokens de scratchpads aritméticos sintéticos. Durante el 20 % final del entrenamiento (fase de decaimiento de LR) la mezcla fue 70 % FineWeb-Edu y 30 % aritmética sintética (suma, resta y multiplicación de n dígitos por 1 dígito, con operandos de 1 a 5 dígitos). El bits-per-byte en web reservada bajó de 1,134 a 0,968.

Sobre esta base, la variante SFT aplica 600 pasos con batch 64 y LR 3e-4 sobre scratchpads verificados de 1 a 5 dígitos, con pérdida solo en el span del asistente. El resultado es un colapso de entropía (~0,01 nats/token) que impide el aprendizaje posterior con GRPO, un hallazgo que el autor documenta explícitamente como resultado negativo.

## Capacidades

- Generación de texto en inglés, con salidas repetitivas en texto web según reconoce el autor.
- Razonamiento aritmético con scratchpad estructurado: cada paso se escribe como `a+b+carry=s wD cC` (dígito escrito D, acarreo C), de derecha a izquierda.
- Suma con operandos de 3, 4 y 5 dígitos de igual longitud: 100 % de precisión con pasos fieles al 100 %.
- Resta con operandos de 3, 4 y 5 dígitos de igual longitud: 100 % de precisión con pasos fieles al 100 %.
- Multiplicación de n dígitos por 1 dígito con operandos de 3, 4 y 5 dígitos: 100 % de precisión con pasos fieles al 100 %.
- Formato de razonamiento delimitado por etiquetas: `<think>…</think><answer>N</answer>`.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso general más allá del scratchpad aritmético.
- No dispone de visión, audio ni modo thinking general.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Estudio de dinámicas de entrenamiento: el modelo sirve como sujeto de experimentos reproducibles sobre colapso de entropía, ya que el autor publica telemetría por paso y permite correlacionar métricas internas con comportamiento final.
- Investigación sobre SFT y RL: el checkpoint documenta un caso concreto en el que un SFT agresivo destruye la diversidad de muestras y bloquea el aprendizaje con GRPO, útil para diseñar currículos de ajuste y calibrar temperaturas.
- Verificación de pipelines de evaluación aritmética: con 16 problemas por celda y un verificador de pasos incluido, sirve para validar herramientas de evaluación que distingan respuesta correcta de razonamiento correcto.
- Enseñanza de interpretabilidad: los hooks de sonda y el logit lens incluidos en `modeling_glassbox.py` permiten inspeccionar activaciones y atención por capa en un modelo que cabe en cualquier GPU consumer.
- Pruebas de robustez y fault injection: la telemetría publicada incluye ejecuciones con inyección de fallos, lo que facilita reproducir escenarios de degradación controlada.
- Referencia para tokenización aritmética: el diseño con un token por dígito y su efecto sobre la generalización de longitud (fallo total en 6-7 dígitos) es un caso práctico para estudiar sesgos de tokenizador en tareas numéricas.
- Docencia de arquitecturas transformer pequeñas: al no depender de `transformers` y ejecutarse en CPU, permite recorrer la definición completa del modelo y su caché KV en un entorno mínimo.

## Benchmarks y rendimiento

Evaluación con decodificación greedy, 16 problemas por celda (error de muestreo de aproximadamente ±12 puntos), ejecutada en CPU desde el `model.safetensors` exacto con `modeling_glassbox.py`. "Pasos fieles" significa que cada paso del scratchpad se rederiva de los operandos mediante un verificador de proceso y que la respuesta final coincide con el último paso.

| Conjunto | Precisión | Pasos fieles |
|---|---|---|
| add/3d | 100 % | 100 % |
| add/4d | 100 % | 100 % |
| add/5d | 100 % | 100 % |
| add/6d | 0 % | 0 % |
| add/7d | 0 % | 0 % |
| sub/3d | 100 % | 100 % |
| sub/4d | 100 % | 100 % |
| sub/5d | 100 % | 100 % |
| sub/6d | 0 % | 0 % |
| sub/7d | 0 % | 0 % |
| mul1/3d | 100 % | 100 % |
| mul1/4d | 100 % | 100 % |
| mul1/5d | 100 % | 100 % |
| mul1/6d | 12 % | 0 % |
| mul1/7d | 19 % | 0 % |
| add/unequal-len | 0 % | 0 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en safetensors ocupa aproximadamente 0,5 GB (135,3 M de parámetros en la precisión de entrenamiento), por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor valida la evaluación en CPU, de modo que no se requiere acelerador para inferencia.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y equivalentes, así como en iGPU y CPU.
- Opciones de despliegue: el autor proporciona `generate.py` y `modeling_glassbox.py` con PyTorch, safetensors y tokenizers, sin dependencia de `transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos GGUF no hay una ruta de despliegue estándar fuera del script incluido.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glassbox-135m-sft | 135,3 M | 1024 | Investigación de observabilidad y aritmética con scratchpad | Apache 2.0 | Hugging Face (repo de 0,5 GB, 137 descargas) |
| glassbox-135m-base | 135,3 M | 1024 | Modelo base de la misma serie, sin SFT | Apache 2.0 | Hugging Face |
| glassbox-135m-rl-arith | 135,3 M | 1024 | Variante con RL aritmético de la misma serie | Apache 2.0 | Hugging Face |
| SmolLM-135M | 135 M | 2048 | Modelo pequeño de propósito general | Apache 2.0 | Hugging Face |

La comparación con modelos de propósito general de tamaño similar no procede en términos de rendimiento: glassbox-135m-sft está especializado en aritmética de 1 a 5 dígitos con operandos de igual longitud y no se han publicado métricas comparables de MMLU, HumanEval o GSM8K. Los datos de SmolLM-135M en esta ficha se limitan a parámetros, contexto y licencia; no se dispone de una comparación de rendimiento publicada en la información proporcionada.

## Limitaciones y advertencias

- Razonamiento de juguete: es un modelo de investigación de 135 M para estudiar dinámicas de entrenamiento y observabilidad, no un asistente general; sus generaciones sobre texto web son repetitivas.
- Muro de longitud duro: 0 % de precisión en sumas y restas de 6 y 7 dígitos, porque los datos aritméticos solo cubrieron de 1 a 5 dígitos y no hubo generalización más allá.
- Fallo total con operandos de distinta longitud: por ejemplo, `4721+389` produce 8620, ya que todos los problemas de entrenamiento tenían operandos de igual longitud y el modelo copia el dígito equivocado del número más corto.
- Respuestas correctas no implican razonamiento correcto: en multiplicación de 6-7 dígitos por 1 dígito acierta entre el 12 % y el 19 % de las respuestas con 0 % de scratchpads válidos; es imprescindible usar el verificador de pasos y no solo la respuesta final.
- Colapso de entropía tras el SFT: la política tiene ~0,01 nats/token de entropía y 16 muestras por prompt salen idénticas, lo que anula la señal de GRPO; no es un checkpoint adecuado como punto de partida para RL.
- Sin ajuste de seguridad: no está alineado ni filtrado, y hereda los sesgos del corpus FineWeb-Edu con su filtrado de calidad.
- Idioma limitado al inglés; no se documenta soporte de castellano ni de otras lenguas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es apto para producción por su dominio restringido y su fiabilidad aritmética limitada a un rango estrecho.
- Ventana de contexto de 1024 tokens, insuficiente para tareas de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syedazeez/glassbox-135m-sft
- Modelo base: https://huggingface.co/syedazeez/glassbox-135m-base
- Variante con RL aritmético: https://huggingface.co/syedazeez/glassbox-135m-rl-arith
- Dataset de telemetría: https://huggingface.co/datasets/syedazeez/glassbox-135m-telemetry
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio de código, paper o demo: no disponible en la información proporcionada.
