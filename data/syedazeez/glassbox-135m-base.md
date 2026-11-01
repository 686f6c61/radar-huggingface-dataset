# syedazeez/glassbox-135m-base

## Resumen

glassbox-135m-base es un modelo de lenguaje de 135,3 millones de parámetros desarrollado por syedazeez como parte de un experimento de investigación de entrenamiento completamente observable. Se trata de un transformer decoder-only entrenado desde cero (from scratch) sobre 2.400 millones de tokens, con el objetivo de estudiar la dinámica de entrenamiento y publicar telemetría exhaustiva de cada paso. Su relevancia radica en que todo el proceso —activaciones por capa, entropía de atención por cabeza, ratios de actualización, ruido de gradiente, potencia y frecuencias de la GPU— se publica como un dataset abierto, algo poco habitual en la comunidad.

El modelo no es un asistente general: está especializado en razonamiento aritmético de juguete (sumas, restas y multiplicaciones de 1 a 5 dígitos) mediante un formato de scratchpad explícito con pasos de columna. Utiliza una arquitectura estándar de 12 capas, d_model 768, 12 cabezas y longitud de secuencia de 1024, con innovaciones como QK-norm, MLP de ReLU al cuadrado y soft-cap de logits con tanh.

El checkpoint publicado corresponde al final del esquema warmup-stable-decay, incluyendo el anneal aritmético, y sirve como punto de partida para el entrenamiento por RL (estilo R1-Zero) que el autor documenta en modelos hermanos. Su licencia Apache 2.0 y su carácter didáctico lo hacen útil para investigadores que quieran reproducir o auditar dinámicas de entrenamiento a pequeña escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (12 capas, d_model 768, 12 cabezas, RoPE base 10k, pre-norm RMSNorm, QK-norm, MLP squared-ReLU 4x, cabeza no atada, tanh logit soft-cap 30, z-loss 1e-4) |
| Parametros totales | 135.287.040 (25,2M corresponden al embedding de entrada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas con d_model 768 y 12 cabezas de atencion, secuencia de 1024 tokens y RoPE con base 10k. Incorpora pre-norm RMSNorm, QK-norm, MLP con activacion squared-ReLU de factor 4x, cabeza de salida no atada al embedding, soft-cap de logits con tanh a 30 y una perdida auxiliar z-loss de 1e-4. El tokenizador es un BPE a nivel de byte con vocabulario de 32.768 tokens, entrenado sobre 300.000 documentos de FineWeb-Edu mas 20.000 documentos aritmeticos, con la particularidad de que cada digito es un token propio (4,49 bytes por token en texto web). Incluye tokens especiales para el formato de scratchpad: `<think>`, `</think>`, `<answer>`, `</answer>`, `<|user|>` y `<|assistant|>`.

El preentrenamiento consumio 2.400 millones de tokens en una sola H100 durante 101 minutos (aproximadamente 7,4 dolares en Modal), usando Muon para las matrices ocultas y AdamW para embeddings, cabeza y ganancias, con 524.000 tokens por paso y un esquema warmup-stable-decay consciente del tiempo. Durante el ultimo 20% (fase de decaimiento de LR) la mezcla fue 70% FineWeb-Edu y 30% scratchpads aritmeticos sinteticos (suma, resta y multiplicacion de n digitos por 1 digito). Se alcanzo un 33% de MFU, sin actualizaciones omitidas ni alertas de detector. Los datos provienen de FineWeb-Edu `sample/10BT` (ficheros 000-002 para entrenamiento, 013 reservado), 2.300 millones de tokens con puntuaciones de calidad 3-5, mas 150 millones de tokens aritmeticos sinteticos. El bits-per-byte en web reservada bajo de 1,134 a 0,968.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad limitada a texto web repetitivo segun el propio autor.
- Razonamiento aritmetico de columna mediante scratchpad explicito: suma, resta y multiplicacion de n digitos por 1 digito.
- Formato estructurado de razonamiento: genera pasos `<think>...column steps...</think>` seguidos de `<answer>N</answer>`, donde cada paso lee `a+b+carry=s wD cC` (escribe digito D, acarreo C) de derecha a izquierda.
- Verificabilidad de pasos: el formato permite que un verificador de proceso rederive cada paso a partir de los operandos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible (solo razonamiento aritmetico de juguete).
- Capacidades multilingues: solo ingles.
- Capacidades especiales: hooks de sonda y cache KV incluidos en `modeling_glassbox.py`; telemetria completa de entrenamiento publicada como dataset.

## Casos de uso

- Investigacion de dinamicas de entrenamiento: el modelo y su telemetria asociada (aproximadamente 1.000 senales por paso, incluyendo activaciones por capa, entropia de atencion por cabeza, ratios de actualizacion, ruido de gradiente, rango espectral, logit lens y potencia/frecuencias NVML) permiten estudiar fenomenos como grokking, formacion de circuitos o estabilidad del optimizador en un entorno reproducible y de bajo coste.
- Auditoria de razonamiento paso a paso: el formato de scratchpad con pasos verificables permite construir y validar verificadores de proceso que comprueben si cada paso se deriva correctamente de los operandos, util para estudiar la diferencia entre respuesta correcta y razonamiento correcto.
- Reproduccion de experimentos de RL estilo R1-Zero: al ser el checkpoint base desde el que arranca el RL, sirve como punto de partida documentado para reproducir el entrenamiento por refuerzo con GRPO sobre tareas aritmeticas.
- Ensenanza de tecnicas de entrenamiento: el uso combinado de Muon y AdamW, el esquema warmup-stable-decay y la mezcla de datos web y sinteticos constituyen un caso de estudio completo para cursos o tutoriales de preentrenamiento a pequena escala.
- Pruebas de inyeccion de fallos: el dataset de telemetria incluye ejecuciones con inyeccion de fallos, lo que permite usar el modelo como banco de pruebas para tecnicas de deteccion de anomalias en entrenamiento.
- Experimentos de interpretabilidad: los hooks de sonda y la publicacion de logits de atencion por cabeza facilitan analisis de mecanismos internos (por ejemplo, localizacion de circuitos de acarreo en la aritmetica de columna).

## Benchmarks y rendimiento

Evaluacion con decodificacion greedy, 16 problemas por celda (error de muestreo de aproximadamente ±12 puntos porcentuales), ejecutada en CPU desde el `model.safetensors` exacto mediante `modeling_glassbox.py`. "Pasos fieles" significa que cada paso del scratchpad se rederiva de los operandos por un verificador de proceso y la respuesta final coincide con el ultimo paso.

| Conjunto | Precision | Pasos fieles |
|---|---|---|
| add/3d | 100% | 100% |
| add/4d | 100% | 100% |
| add/5d | 100% | 100% |
| add/6d | 0% | 0% |
| add/7d | 0% | 0% |
| sub/3d | 100% | 100% |
| sub/4d | 100% | 100% |
| sub/5d | 100% | 100% |
| sub/6d | 0% | 0% |
| sub/7d | 0% | 0% |
| mul1/3d | 100% | 100% |
| mul1/4d | 100% | 100% |
| mul1/5d | 100% | 100% |
| mul1/6d | 12% | 0% |
| mul1/7d | 19% | 0% |
| add/unequal-len | 0% | 0% |

No se han publicado resultados de benchmarks en la informacion disponible para tareas estandar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 135,3M parametros; en fp32 ocupa aproximadamente 0,54 GB, en fp16/bf16 unos 0,27 GB. Con cache KV para contexto de 1024 tokens el consumo adicional es minimo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizo en 1x H100, pero la inferencia es viable en GPU de consumo.
- Cabe en GPU de consumo: si, en cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU, como demuestra la evaluacion del autor ejecutada en CPU.
- Opciones de despliegue: el modelo no usa `transformers`; requiere PyTorch, safetensors y tokenizers con el fichero `modeling_glassbox.py` incluido en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glassbox-135m-base | 135,3M | 1024 | Razonamiento aritmetico con scratchpad, telemetria completa | Apache 2.0 | HuggingFace |
| SmolLM-135M | 135M | 2048 | Modelo de lenguaje general pequeno | Apache 2.0 | HuggingFace |
| Pythia-160M | 160M | 2048 | Suite de investigacion con checkpoints intermedios | Apache 2.0 | HuggingFace |

La comparacion cuantitativa de rendimiento con estos modelos no esta disponible en la informacion proporcionada. La diferencia principal de glassbox-135m-base frente a alternativas de tamano similar es la publicacion exhaustiva de telemetria de entrenamiento y su especializacion en aritmetica verificable, a costa de no ser un modelo de proposito general.

## Limitaciones y advertencias

- Razonamiento de juguete unicamente: es un modelo de investigacion de 135M para estudiar dinamicas de entrenamiento y observabilidad; no es un asistente general y sus generaciones sobre texto web son repetitivas.
- Muro duro de longitud: 0% en sumas y restas de 6-7 digitos. Los datos aritmeticos cubrian 1-5 digitos y no generalizo mas alla.
- Operandos de longitud desigual fallan por completo (por ejemplo, `4721+389` produce 8620). Todos los problemas de entrenamiento tenian operandos de igual longitud y el modelo copia el digito equivocado del numero mas corto.
- Respuestas correctas no implican razonamiento correcto: en multiplicacion n x 1 de 6-7 digitos acierta el 12-19% de las respuestas con 0% de scratchpads validos. Debe usarse el verificador de pasos, no solo la respuesta final.
- Sin ajuste de seguridad: entrenado con datos web en ingles filtrados por FineWeb-Edu, hereda los sesgos de ese corpus.
- Limitacion de idioma: solo ingles.
- Riesgo de alucinacion: no evaluado especificamente, pero el autor advierte que las generaciones de texto web son repetitivas y el modelo no esta disenado para generacion abierta fiable.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no es adecuado para produccion como asistente general dadas sus limitaciones funcionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syedazeez/glassbox-135m-base
- Dataset de telemetria: https://huggingface.co/datasets/syedazeez/glassbox-135m-telemetry
- Modelo hermano SFT: https://huggingface.co/syedazeez/glassbox-135m-sft
- Modelo hermano RL aritmetico: https://huggingface.co/syedazeez/glassbox-135m-rl-arith
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
