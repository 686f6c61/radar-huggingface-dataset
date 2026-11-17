# xv0y5ncu/Gemma-4-E4B-it-GLQ-6bpw

## Resumen

Gemma-4-E4B-it-GLQ-6bpw es una cuantización de 6 bits por peso (6,0 bpw uniforme) del modelo instructivo google/gemma-4-E4B-it, publicada por el usuario xv0y5ncu. Emplea GLQ (Golay-Leech Quantization), un esquema de cuantización basado en retículos que combina un codebook de la capa E8 con 65.536 entradas en bloques de 8 dimensiones, rotación mediante Randomized Hadamard Transform (RHT), realimentación LDLQ y cuantización residual en varias etapas. El resultado es un checkpoint de 7,06 GB, un 2,11× más pequeño que los pesos en bf16, con 3.788.507.722 parámetros almacenados.

El modelo hereda las capacidades del Gemma 4 E4B instructivo de Google, incluyendo modo de razonamiento explícito (thinking mode) activable mediante la plantilla de chat. Su interés práctico radica en que reduce el espacio en disco y los requisitos de memoria de inferencia manteniendo una calidad medida cercana al original: en gsm8k con límite de 50 ejemplos y evaluación estricta en modo chat+thinking alcanza un 92 %, frente al 86 % del baseline en bf16 según la model card del autor.

La relevancia actual es doble: por un lado, demuestra que las técnicas de cuantización basadas en retículos (E8, Leech) son viables en modelos de la familia Gemma 4; por otro, expone una dependencia frágil del ecosistema, ya que requiere una versión concreta de transformers y un kernel CUDA propio que se compila en el primer uso. La licencia declarada es Apache 2.0, con la licencia Gemma como referencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4; detalles internos no disponibles) |
| Parametros totales | 3.788.507.722 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GLQ 6,0 bpw uniforme; esquema con codebook E8 de 65.536 entradas, RHT, LDLQ y cuantización residual N-stage; asignación de precisión mixta por proxy de sensibilidad derivado de la traza del Hessiano |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (licencia Gemma para el modelo base) |
| Formato de pesos | safetensors (7,06 GB) |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-E4B-it, un transformer decoder-only de la familia Gemma 4 de Google; no se dispone de detalles sobre su configuración de capas, atención o datos de entrenamiento en la información proporcionada. Esta publicación no reentrena el modelo: aplica una cuantización post-entrenamiento sobre los pesos bf16 originales.

El método GLQ sustituye la cuantización escalar tradicional por una cuantización vectorial sobre el retículo E8: cada bloque de 8 dimensiones se codifica con un codebook de 65.536 entradas (la capa del retículo E8), y el error residual se corrige mediante descomposición LDL por bloques (LDLQ) durante la codificación. Antes de cuantizar se aplica una rotación Randomized Hadamard Transform en entradas y salidas para homogeneizar la distribución de los pesos. Las capas de al menos 3 bpw usan cuantización residual en varias etapas, y cuando procede se asigna precisión mixta según un proxy de sensibilidad derivado de la traza del Hessiano. El resultado es un promedio uniforme de 6,0 bpw.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat instructiva.
- Modo de razonamiento explícito (thinking mode) activable con `enable_thinking=True` en `apply_chat_template`.
- Razonamiento matemático multi-paso y resolución de problemas aritméticos (evaluado en gsm8k).
- Capacidad de truncar el razonamiento si el presupuesto de tokens es insuficiente; requiere `max_new_tokens` de 8K a 16K en esta variante de 6 bpw.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso más allá del thinking mode: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la etiqueta de idioma declarada.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas aritméticos y de varios pasos activando thinking mode con un presupuesto de 8K-16K tokens, adecuado para tutores automáticos o verificación de cálculos en pipelines educativos.
- Despliegue en GPU de gama alta con memoria limitada: al ocupar 7,06 GB en disco y requerir menos memoria que la versión bf16, permite servir el modelo en una única GPU consumer de 24 GB con margen para el contexto y el kernel CUDA.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia para medir la degradación de calidad de GLQ frente a bf16 en tareas de razonamiento, útil en investigación sobre compresión de modelos.
- Prototipado de asistentes conversacionales en inglés: la plantilla de chat instructiva permite integrarlo en aplicaciones de diálogo multi-turno sin reentrenamiento.
- Generación de respuestas con trazas de razonamiento auditables: el thinking mode produce cadenas de pensamiento que pueden registrarse para depuración o revisión humana en entornos de investigación.
- Experimentación con kernels CUDA personalizados: el repositorio GLQ y su integración con transformers y vLLM permiten estudiar el rendimiento de la decodificación con cuantización vectorial en producción.
- Fine-tuning ligero o adaptación con LoRA sobre el checkpoint cuantizado: no disponible en la información proporcionada; no se documenta compatibilidad con PEFT.

## Benchmarks y rendimiento

| Benchmark | Gemma-4-E4B-it-GLQ-6bpw | google/gemma-4-E4B-it (bf16) |
|---|---|---|
| gsm8k, limit=50, chat+thinking, strict-match | 92 % | 86 % |

No se han publicado otros resultados de benchmarks en la información disponible. La diferencia de 6 puntos porcentuales en gsm8k con solo 50 ejemplos queda dentro del margen de error estadístico y no debe interpretarse como una mejora real de calidad; el autor indica que, con presupuesto suficiente, todas las variantes convergen a la calidad de bf16 dentro del error estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7-8 GB solo para los pesos; con overhead de activaciones, KV cache y kernel CUDA, se recomienda un mínimo de 12-16 GB para contextos moderados. No se dispone de cifras oficiales.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB), L40S (48 GB), A100 (40/80 GB) o H100 (80 GB) son suficientes.
- Cabe en GPU consumer: sí, en tarjetas con 16 GB o más (RTX 4080, 4090, RTX 5070 Ti y superiores), siempre que el contexto y el presupuesto de generación no agoten la memoria.
- Opciones de despliegue: transformers (>=5.13.1, <5.15) con el paquete `glq` y su integración HF; vLLM 0.27.1 verificado con transformers 5.14.1; llama.cpp, Ollama y TGI no están documentados para este formato.
- Latencia y throughput: no disponibles. El kernel CUDA personalizado se compila JIT en el primer uso (~30 s).
- Requisitos de software: `torch>=2.0`, `transformers>=5.0` (pin <5.15), CUDA 12.x, `pip install 'glq[vllm]'`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-E4B-it-GLQ-6bpw | 3.788.507.722 | no disponible | GLQ 6,0 bpw | Apache 2.0 / Gemma | Hugging Face |
| google/gemma-4-E4B-it (bf16) | no disponible | no disponible | bf16 | Gemma | Hugging Face |
| Variantes GLQ 4bpw y 5bpw mix del mismo autor | no disponible | no disponible | GLQ 4-5 bpw | Apache 2.0 / Gemma | Hugging Face (referenciadas en la model card) |
| Variantes GLQ 7bpw y 8bpw del mismo autor | no disponible | no disponible | GLQ 7-8 bpw | Apache 2.0 / Gemma | Hugging Face (referenciadas en la model card) |

No se dispone de datos suficientes para comparar con alternativas de otros autores (por ejemplo, cuantizaciones GGUF o AWQ del mismo modelo base).

## Limitaciones y advertencias

- Solo soporta inglés según la etiqueta de idioma declarada; no se garantiza calidad en castellano ni en otros idiomas.
- El modo thinking requiere un presupuesto de 8K-16K tokens en esta variante; con menos, el modelo trunca el razonamiento y puede no emitir respuesta final.
- El kernel CUDA de GLQ se compila en el primer uso, lo que añade latencia inicial y depende de CUDA 12.x.
- Requiere fijar transformers por debajo de 5.15: la versión 5.15.0 rompe la carga de gemma-4 en vLLM por un cambio en la configuración por capas.
- El resultado de 92 % en gsm8k con 50 ejemplos tiene alta varianza; no debe tomarse como evidencia de superioridad frente a bf16.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de factualidad.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia: la model card declara Apache 2.0, pero el modelo base Gemma se rige por los términos de Gemma; conviene revisar las condiciones de uso comercial de la licencia Gemma antes de desplegar en producción.
- No se documenta soporte para tool calling, agentes, visión ni otras modalidades.
- El repositorio tiene 80 descargas y 0 likes, lo que indica escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/xv0y5ncu/Gemma-4-E4B-it-GLQ-6bpw
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio GLQ: https://github.com/cnygaard/glq
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Términos de Gemma: https://ai.google.dev/gemma/terms
