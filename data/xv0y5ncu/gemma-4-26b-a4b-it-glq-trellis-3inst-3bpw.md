# xv0y5ncu/gemma-4-26B-A4B-it-GLQ-trellis-3inst-3bpw

## Resumen

`gemma-4-26B-A4B-it-GLQ-trellis-3inst-3bpw` es una cuantización de pesos de `google/gemma-4-26B-A4B-it`, un modelo de mezcla de expertos (MoE) instructivo. La publica el usuario `xv0y5ncu` mediante GLQ (herramienta de cuantización con codebook en celosía tipo trellis, estilo QTIP/TCQ), aplicando 3 bits por peso y la variante sin tablas de búsqueda denominada 3INST. El resultado es un checkpoint de 11,9 GB en disco que, según el autor, se carga en vLLM ocupando 10,41 GiB de memoria de pesos.

El problema que aborda es el ahorro de memoria: el checkpoint equivalente a 4 bpw ocupaba 13,95 GB y el de codebook E8 a 3 bpw no conseguía bajar de ~14,98 GB por el uso de índices en int16. Esta variante sí reduce el espacio real, un 28% menos de pesos cargados que el build de 4 bpw. El coste es una pérdida de fidelidad de pesos (SQNR medio de 16,38 dB frente a 22,11 dB del de 4 bpw) y un razonamiento más largo, con más truncamientos.

Es relevante para quienes despliegan Gemma 4 MoE en GPUs con VRAM ajustada, pero conviene tener en cuenta que es una publicación de terceros, sin validación independiente, y que la ruta de Hugging Face transformers está rota para este modelo base con cualquier codebook GLQ: solo vLLM funciona. Nota: los safetensors del repo suman 5.954.861.006 parámetros, lo que no cuadra con la denominación 26B-A4B del modelo base; el dato debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); pesos almacenados en codebook trellis (TCQ) |
| Parametros totales | 26B en el modelo base (etiqueta 26B-A4B); los safetensors del repo suman 5.954.861.006 |
| Parametros activos | ~4B en el modelo base (según nomenclatura A4B); no disponible para este checkpoint |
| Longitud de contexto | No disponible en la informacion proporcionada (las pruebas se hicieron con `max_model_len 2048` y presupuesto de razonamiento de 32k) |
| Tipos de cuantizacion | 3 bits por peso, trellis/TCQ, variante 3INST, tasa uniforme en todas las capas |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors |
| Tamaño en disco | 11,9 GB (repo completo) |
| Pesos cargados en vLLM | 10,41 GiB |
| SQNR medio de pesos | 16,38 dB |
| Librería | trellis (runtime: vLLM con glq >= 0.8.8) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de la familia Gemma 4, con tensores de expertos apilados (`Gemma4TextExperts`) y configuración instructiva. Esta publicación no entrena nada: cuantiza los pesos del base a 3 bits por peso con GLQ, usando un codebook trellis (TCQ, en la línea de QTIP) y la variante 3INST sin tablas de búsqueda, con tasa uniforme en todas las capas.

El proceso de producción es reproducible mediante el comando `glq-quantize` con `--codebook trellis --bpw 3 --nsamples 128 --seqlen 2048 --streaming`. El autor documenta que es obligatorio `GLQ_QUANT_EXPERT_WORKERS=1`: con el pool de 8 hilos por defecto se produce una carrera con la captura de CUDA graphs y aborta con un *device-side assert*. A 3 bpw el espacio de estados del Viterbi se duplica (2^(16-K)), lo que desplaza el umbral entre grafo y modo eager y provoca que ambas rutas se ejecuten a la vez. La solución correcta pendiente sería `capture_error_mode="thread_local"` en la captura. No se proporcionan datos de dataset de entrenamiento, RLHF/DPO ni innovaciones de decodificación del modelo base.

## Capacidades

- Generación de texto y razonamiento en modo thinking: las pruebas de AIME 2026 se ejecutaron con un presupuesto de razonamiento de 32k tokens y los parámetros de muestreo propios del modelo (temperatura 1,0, top_p 0,95, top_k 64).
- Razonamiento matemático de competición: 197/240 en avg@8 sobre AIME 2026 en esta cuantización.
- Generación de código, tool calling, capacidades multilingües y visión: no disponibles en la informacion proporcionada para este checkpoint ni para el base, aunque el modelo base es instructivo y de la familia Gemma 4.
- Inferencia por lotes en vLLM: 32 secuencias concurrentes a 1518 tok/s agregados.
- Despliegue exclusivamente en vLLM con GLQ >= 0.8.8; la ruta de transformers no es funcional.

## Casos de uso

- Autoservicio en GPUs con VRAM limitada: desplegar el modelo base MoE en una sola GPU con 10,41 GiB de pesos, frente a los 14,4 GiB del build de 4 bpw, dejando más espacio para KV cache (317.931 tokens medidos con `max_model_len 2048`).
- Razonamiento matemático por lotes: procesar conjuntos de problemas con presupuesto de razonamiento amplio (idealmente 64k según el propio autor) y desconfiar de las respuestas truncadas al usar 32k.
- Servicio de alto rendimiento en una RTX PRO 6000 Blackwell: con grafos CUDA completos se midieron 89,9 tok/s a B=1 con TTFT de 22 ms y 47,4 tok/s por stream a B=32 con TTFT de 481 ms.
- Evaluación de técnicas de cuantización: sirve como punto de comparación frente a NVFP4 y trellis 4 bpw sobre la misma GPU y con los mismos ajustes.
- Prototipado de agentes con contexto largo: la capacidad de KV de 317.931 tokens permite sesiones multi-turno extensas, aunque el autor no validó calidad en ese régimen.
- Investigación sobre degradación por cuantización extrema: el patrón documentado (más tokens de razonamiento y truncamientos al bajar bits) es un caso de estudio útil para estudiar fallos por agotamiento de presupuesto.
- No recomendado para producción crítica sin validación propia: la ruta de transformers está rota y no hay evaluación independiente de calidad.

## Benchmarks y rendimiento

Resultados sobre AIME 2026, avg@8 sobre 30 problemas, presupuesto de 32k, ajustes de muestreo del modelo, vLLM 0.27.1, RTX PRO 6000 Blackwell:

| Precisión | Pesos cargados | AIME 2026 (avg@8) | Fuente |
|---|---|---|---|
| bf16 | 48,5 GiB | 88,3% | cifra publicada por Google (arnés distinto) |
| NVFP4 (`nvidia/Gemma-4-26B-A4B-NVFP4`) | 18,2 GiB | 86,25% | medida |
| GLQ trellis 4 bpw | 14,4 GiB | 86,25% | medida |
| GLQ 3 bpw (este build) | 10,4 GiB | 82,08% | medida |

Desglose por métrica:

| Métrica | 3 bpw | 4 bpw | NVFP4 |
|---|---|---|---|
| avg@8 | 197/240 | 207/240 | 207/240 |
| pass@8 | 27/30 | 29/30 | 28/30 |
| Resuelto en las 8 muestras | 18/30 | 23/30 | 21/30 |
| Generación media (tokens) | 18.707 | 15.026 | 15.117 |
| Truncados a 32k | 74 | 29 | 24 |
| Sin respuesta | 16 | 5 | 10 |

El autor señala que la diferencia de −4,2 puntos frente a 4 bpw está dentro del ruido (error estándar de 5,4 puntos con 30 problemas), pero el número de truncados (74 frente a 29) sí queda fuera, por lo que la puntuación probablemente subestima el checkpoint. No hay repetición a 64k.

Rendimiento medido con `benchmarks/run_model.py`, `max_model_len 2048`, grafos CUDA completos:

| Métrica | Valor |
|---|---|
| Carga de pesos (línea de vLLM) | 10,41 GiB |
| Tiempo de carga | 5,7 s |
| Capacidad de KV | 317.931 tokens |
| Decode B=1 | 89,9 tok/s, TTFT 22 ms |
| Decode B=32 | 1518 tok/s agregados, 47,4 tok/s por stream, TTFT 481 ms |

## Requisitos de hardware

- VRAM estimada: 10,41 GiB solo de pesos; hay que sumar KV cache y overhead de vLLM. Con `max_model_len 2048` y grafos completos vLLM reportó capacidad para 317.931 tokens de KV en una RTX PRO 6000 Blackwell.
- GPU validadas: RTX PRO 6000 Blackwell (única configuración medida). No hay datos para A100, H100 ni RTX 4090 en la informacion proporcionada.
- GPU de consumo: el peso de 10,41 GiB encaja teóricamente en GPUs de 16 GB o más, pero no se ha verificado; no hay mediciones en consumer.
- Despliegue: exclusivamente vLLM (`vllm serve ... --quantization glq`) con `glq >= 0.8.8` y `transformers >= 5.13.1,<5.15`. La ruta de transformers está rota para gemma-4 MoE con cualquier codebook GLQ.
- Aviso de versión: fijar `transformers` por debajo de 5.15, porque 5.15.0 pasa gemma-4 a configuración por capa y `config.head_dim` lanza una excepción que vLLM encuentra antes de cargar pesos.
- Latencia y throughput: 22 ms de TTFT y 89,9 tok/s a B=1; 481 ms de TTFT y 47,4 tok/s por stream a B=32 (agregado 1518 tok/s). Los datos de throughput no son comparables con los del build de 4 bpw por diferencias en la forma de las peticiones.

## Comparativa con modelos similares

| Modelo | Parámetros (base) | Contexto | Pesos cargados / disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este build (GLQ trellis 3INST 3 bpw) | 26B-A4B | No disponible | 10,41 GiB / 11,9 GB | Apache 2.0 | Hugging Face, vLLM con glq >= 0.8.8 |
| GLQ trellis 4 bpw (mismo autor) | 26B-A4B | No disponible | 14,4 GiB / 13,95 GB | Apache 2.0 | Hugging Face |
| GLQ shell 3 bpw (E8, mismo autor) | 26B-A4B | No disponible | ~14,98 GB en disco | Apache 2.0 | Hugging Face |
| NVFP4 (`nvidia/Gemma-4-26B-A4B-NVFP4`) | 26B-A4B | No disponible | 18,2 GiB | No disponible | Hugging Face (NVIDIA) |
| Gemma 4 26B-A4B bf16 (`google/gemma-4-26B-A4B-it`) | 26B-A4B | No disponible | 48,5 GiB | Apache 2.0 | Hugging Face |

Calidad en AIME 2026: 82,08% este build, 86,25% en 4 bpw y NVFP4, 88,3% en bf16 (cifra publicada por Google).

## Limitaciones y advertencias

- Cuantización de terceros: publicada por `xv0y5ncu`, no por Google ni NVIDIA; no hay validación independiente de los resultados.
- Incoherencia de parámetros: los safetensors suman 5.954.861.006 parámetros frente a la etiqueta 26B-A4B del modelo base; conviene verificar la integridad antes de usarlo en producción.
- Razonamiento más largo y más truncamientos: 18.707 tokens de media frente a 15.026 y 74 truncados frente a 29 a 32k; la puntuación de AIME probablemente subestima el modelo. Falta una repetición con presupuesto de 64k.
- Calidad de pesos inferior: SQNR medio de 16,38 dB frente a 22,11 dB del build de 4 bpw.
- Ruta de Hugging Face transformers rota para gemma-4 MoE con cualquier codebook GLQ: no es un fallo de este checkpoint, pero limita el despliegue a vLLM.
- Requisitos de versión frágiles: `transformers` < 5.15 y `glq` >= 0.8.8, más `GLQ_QUANT_EXPERT_WORKERS=1` durante la cuantización.
- Sesgos, alucinaciones e idiomas: no disponibles en la informacion proporcionada; hereda los del modelo base.
- Uso comercial: la licencia Apache 2.0 se hereda del modelo base, pero conviene revisar los términos de Google para gemma-4.
- No sobreinterpretar el throughput: las cifras no son comparables con las del build de 4 bpw por diferencias en la forma de las peticiones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/xv0y5ncu/gemma-4-26B-A4B-it-GLQ-trellis-3inst-3bpw)
- [Modelo base: google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Repositorio GLQ](https://github.com/cnygaard/glq)
- [NVFP4: nvidia/Gemma-4-26B-A4B-NVFP4](https://huggingface.co/nvidia/Gemma-4-26B-A4B-NVFP4)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
