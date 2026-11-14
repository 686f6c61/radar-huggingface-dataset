# txktxkabcd/fahqgpt-1.1-nano

## Resumen

FahQgpt1.1 nano es un modelo de lenguaje conversacional en inglés de 145.910.912 parámetros (aproximadamente 146M), desarrollado por el usuario de Hugging Face txktxkabcd (conocido en Bilibili como @一片烂海苔). Se trata de un experimento de entrenamiento desde cero: el autor no ha utilizado pesos preentrenados de terceros, sino que parte de su propio modelo base FahQgpt1.0 Nano y lo afina para diálogo. El modelo se entrenó íntegramente en una única GPU RTX 5060 Ti de 16 GB, lo que lo convierte en un caso de estudio de entrenamiento de bajo presupuesto.

Arquitectónicamente es un transformer decoder-only denso con 14 capas, dimensión oculta de 896, atención con GQA (14 cabezas de query y 2 de clave/valor), FFN SwiGLU de 2432 unidades, vocabulario de 32.002 tokens, RoPE y RMSNorm, con embeddings de entrada y salida compartidos. Su ventana de contexto es muy reducida: 1.024 tokens incluyendo prompt y respuesta.

Su relevancia es principalmente educativa y experimental: demuestra que es posible entrenar un modelo conversacional funcional desde cero con recursos de consumo, aunque sus capacidades quedan muy lejos de los modelos pequeños de referencia como SmolLM2 o Qwen2.5-0.5B. La licencia Apache 2.0 facilita su reutilización con fines de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (GQA, SwiGLU, RoPE, RMSNorm) |
| Parámetros totales | 145.910.912 (146M) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens (prompt + respuesta) |
| Tipos de cuantización | F16 (GGUF); sin conversión Q4 publicada |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32) y GGUF F16 (~293 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 14 capas con hidden size 896, 14 cabezas de query y 2 cabezas KV (GQA) con dimensión de cabeza 64, FFN SwiGLU de 2432 unidades, vocabulario de 32.002 tokens, RoPE con theta 10.000, RMSNorm y embeddings de entrada/salida compartidos (el safetensors almacena `emb.weight` una vez y el loader restaura el alias de `lm_head.weight`). Los pesos se guardan en FP32 safetensors; la inferencia usa autocast bf16 en CUDA o fp32 en CPU.

El entrenamiento consta de dos fases. La base (FahQgpt1.0 Nano) se entrenó durante 14.495 pasos con 1.899.888.640 tokens. La fase conversacional de la versión 1.1 utilizó 36.286 conversaciones de entrenamiento y 543 de validación, con 8.246.602 tokens de entrada y 5.549.915 tokens supervisados en el asistente, incluyendo 11.233 conversaciones multiturno. Los datos provienen de HuggingFaceTB/smol-smoltalk y del subconjunto "everyday" de HuggingFaceTB/smoltalk, más ejemplos escritos localmente, filtrados para conversaciones cortas en inglés con límite de 512 tokens. El entrenamiento usó AdamW con LR pico 1e-4, 100 pasos de warmup, decaimiento coseno, microbatch 4, acumulación 4 (batch efectivo 16), 3.200 pasos y muestreo por buckets de longitud con reemplazo (51.200 extracciones). Se añadió un suplemento de identidad de 24 ejemplos muestreado en el 1% de los microbatches. Todo el run duró unos 27 minutos en una RTX 5060 Ti de 16 GB con un pico de VRAM de 4,59 GiB. La NLL de validación ponderada por tokens pasó de 2,5112 a 1,5761 en los primeros 160 ejemplos retenidos.

## Capacidades

- Generación de texto conversacional en inglés con plantilla `User: ... / Assistant: ...` y token de parada `<|eot|>` (ID 4).
- Diálogo de un solo turno con calidad aceptable; el multiturno es explícitamente experimental e inestable.
- Identidad propia declarada ("I'm FahQgpt1.1 nano, a small language model trained from scratch").
- Capacidad limitada de describir sus propias funciones y de generar respuestas cortas a preguntas simples.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo de pensamiento (thinking).
- No tiene capacidades de visión, audio ni multimodalidad.
- No se entrenó con rol de sistema: la plantilla embebida omite mensajes de sistema deliberadamente.
- Multilingüismo: únicamente inglés; no hay soporte para castellano ni otros idiomas.

## Casos de uso

- Docencia y experimentación sobre entrenamiento desde cero: sirve para estudiar el pipeline completo (tokenizador, dataset, bucle de entrenamiento, exportación a GGUF) con un coste de cómputo mínimo y en una sola GPU de consumo.
- Pruebas de integración de llama.cpp y aplicaciones GGUF: el modelo permite validar plantillas de chat, tokens de parada y comportamiento de decodificación en un entorno controlado y de tamaño reducido.
- Generación de respuestas cortas en inglés para demos locales: con 160 tokens máximos y decodificación greedy, encaja en prototipos de chatbot de un solo turno sin requisitos de infraestructura.
- Investigación sobre filtrado de datos: el autor documenta el filtrado imperfecto de smol-smoltalk, lo que permite reproducir y analizar el efecto de la curación de datos en modelos pequeños.
- Benchmark de referencia para modelos de 146M: útil como línea base mínima en comparaciones de escalado y de eficiencia de entrenamiento (1.900M tokens de base frente a 8,2M de tokens conversacionales).
- Evaluación de técnicas de control de repetición: el modelo aplica penalización de repetición 1,12 y prohibición de frases de cuatro tokens repetidos, lo que lo hace adecuado para estudiar mitigaciones de bucles en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El único dato cuantitativo de evaluación es la NLL de validación ponderada por tokens sobre los primeros 160 ejemplos retenidos: 2,5112 antes del entrenamiento conversacional y 1,5761 después. El propio autor advierte que esta métrica no es una puntuación de precisión ni un benchmark amplio e independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 (pesos de ~293 MB) y aproximadamente 0,6 GB en FP32 safetensors.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una RTX 5060 Ti de 16 GB con un pico de 4,59 GiB durante el entrenamiento.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (llama-server con `--jinja`), paquete PyTorch propio (`fahqgpt.serve_11`, `fahqgpt.chat_validation`), y cualquier aplicación compatible con GGUF reciente. No implementa `AutoModel` de Transformers.
- Latencia y throughput: no disponibles. El autor indica que la CPU es lenta y que las diferencias numéricas pueden afectar a la salida.
- Configuración recomendada en llama.cpp: `-c 1024`, temperatura 0, penalización de repetición 1,12, máximo 160 tokens nuevos, sin token BOS y sin plantilla ChatML/Llama3.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Benchmarks públicos |
|---|---|---|---|---|---|---|
| FahQgpt1.1 nano | 146M | 1.024 | en | Apache 2.0 | safetensors, GGUF | no disponibles |
| SmolLM2-135M | 135M | 8.192 | en (multilingüe parcial) | Apache 2.0 | safetensors, GGUF | sí (HellaSwag, ARC, etc.) |
| Qwen2.5-0.5B | 494M | 32.768 | multilingüe | Apache 2.0 | safetensors, GGUF | sí |
| TinyLlama-1.1B | 1.100M | 2.048 | en | Apache 2.0 | safetensors, GGUF | sí |

FahQgpt1.1 nano se sitúa en el segmento de modelos ultrapequeños, pero con una ventana de contexto cuatro veces menor que SmolLM2-135M y sin datos públicos de benchmarks que permitan una comparación rigurosa. Su principal diferencia es el origen: entrenamiento desde cero sin pesos de terceros, frente a los pipelines de datos a gran escala de los modelos de referencia.

## Limitaciones y advertencias

- Ventana de contexto de solo 1.024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Multiturno inestable: el autor recomienda iniciar una conversación nueva cuando las respuestas se desvíen.
- Sin rol de sistema: no se entrenó con mensajes de sistema, por lo que instrucciones de sistema pueden degradar la salida.
- Riesgo elevado de alucinación y de bucles repetitivos, mitigado parcialmente con penalización de repetición y prohibición de frases repetidas.
- Entrenado con texto sintético de smol-smoltalk y smoltalk, con filtrado imperfecto; pueden persistir sesgos y artefactos de los datos sintéticos.
- Solo inglés: no es utilizable en castellano ni en otros idiomas.
- No implementa la API estándar de Transformers (`AutoModel`), lo que complica su integración en pipelines existentes.
- Compatibilidad con aplicaciones GGUF de terceros no garantizada; verificado únicamente en llama.cpp build 9873.
- Sin benchmark independiente: la NLL de validación no es una medida de calidad conversacional.
- Licencia Apache 2.0 permite uso comercial, pero las capacidades del modelo limitan seriamente su viabilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/txktxkabcd/fahqgpt-1.1-nano
- Modelo base 1.0: https://huggingface.co/txktxkabcd/fahqgpt-1.0-nano
- GGUF F16: https://huggingface.co/txktxkabcd/fahqgpt-1.1-nano/resolve/main/FahQgpt1.1-nano-F16.gguf
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- llama.cpp: https://github.com/ggml-org/llama.cpp
