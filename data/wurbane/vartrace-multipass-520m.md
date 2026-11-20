# WUrbane/vartrace-multipass-520m

## Resumen

VarTrace multipass 520m es un repositorio de modelos de lenguaje de tipo causal (causal LM) publicados por el usuario WUrbane bajo el paraguas del experimento "VarTrace multi-pass". No se trata de un modelo único, sino de una colección de directorios de modelo completos, cada uno correspondiente a una configuración distinta del mismo experimento de ajuste fino: se parte de un modelo base preentrenado (de las familias `OptimizerStudy/adamw_*` o `OptimizerStudy/muon_*`) y se ejecuta el mismo calendario de entrenamiento VarTrace v1 E1 durante 1, 2, 4 u 8 pasadas, empleando AdamW o Muon como optimizador de ajuste fino.

El objetivo del experimento es comparar el efecto del número de pasadas de ajuste fino y del optimizador utilizado sobre un mismo modelo base, manteniendo constante el resto de hiperparámetros relevantes (semilla de orden 20261023, rotación k0, precisión de matmul tf32, clase de host a100). El nombre "520m" sugiere un tamaño de aproximadamente 520 millones de parámetros, aunque la model card no lo confirma explícitamente.

La relevancia actual es fundamentalmente metodológica: el repositorio documenta de forma estructurada un estudio de ablación sobre optimizadores y repetición de datos, con ficheros `EXPORT.json` por subcarpeta y model cards individuales. No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas, pipeline ni resultados de evaluación, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal LM); detalles internos no disponibles |
| Parametros totales | Aproximadamente 520M (según el nombre del repositorio; no confirmado en la model card) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizar publicados) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La model card describe un experimento de ajuste fino multi-pass sobre modelos base preentrenados. La arquitectura subyacente es un transformer causal estándar cargable mediante `AutoModelForCausalLM`, pero no se detallan el número de capas, dimensión oculta, cabezas de atención ni la longitud de contexto. El tamaño del repositorio (6,4 GB) es coherente con varios directorios de modelo de ~520M de parámetros en precisión de 16 o 32 bits, aunque el número exacto de subcarpetas publicadas no se especifica en su totalidad (la tabla de la model card solo muestra dos filas de ejemplo).

El entrenamiento consiste en ejecutar el mismo calendario VarTrace v1 E1 con 1, 2, 4 u 8 pasadas sobre el modelo base, usando AdamW o Muon como optimizador de ajuste fino. En la configuración mostrada, el ajuste con AdamW emplea un learning rate principal de 3e-05 y 682 pasos, mientras que el ajuste con Muon usa un learning rate de 0,001 y los mismos 682 pasos. Todos los runs comparten la semilla de orden 20261023, la rotación k0, precisión tf32 para matmul y clase de host a100. No se indica si hubo RLHF, DPO ni qué composición tiene el dataset de ajuste fino.

## Capacidades

- Generación de texto autoregresiva como modelo causal estándar de la familia transformers.
- Ajuste fino comparativo bajo dos optimizadores (AdamW y Muon) y distinto número de pasadas, lo que permite estudiar la dinámica de repetición de datos.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo "thinking".
- Capacidades multilingües: no disponibles.
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Estudio de ablación de optimizadores: comparar el efecto de AdamW frente a Muon sobre el mismo modelo base y calendario de ajuste fino, usando los checkpoints publicados como referencia reproducible.
- Investigación sobre repetición de datos (multi-pass): analizar cómo evoluciona el modelo al ejecutar 1, 2, 4 u 8 pasadas del mismo schedule, un tema relevante en el debate sobre data repetition en el preentrenamiento y ajuste fino.
- Reproducibilidad de experimentos: cada subcarpeta incluye su propia model card y `EXPORT.json`, lo que facilita replicar o auditar las condiciones exactas de cada run (learning rate, pasos, semilla, precisión, host).
- Punto de partida para ajuste fino posterior: al ser modelos causales de ~520M cargables con transformers, pueden servir como base para tareas de generación de texto específicas del dominio del investigador.
- Docencia y formación: ejemplo práctico y bien documentado de cómo estructurar un experimento de ajuste fino con múltiples configuraciones y exportar los resultados de forma ordenada.
- Benchmarking interno de infraestructura: comparar el comportamiento de entrenamiento en GPUs A100 con precisión tf32 frente a otras configuraciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~520M de parámetros, en fp16 serían aproximadamente 1,1 GB de pesos, más overhead de activaciones y KV cache; en fp32, unos 2,1 GB. Estas cifras son estimaciones basadas en el tamaño nominal y no están confirmadas por el autor.
- GPU recomendadas: el autor indica que el entrenamiento se realizó en GPUs A100 (clase de host `a100`), con precisión tf32. Para inferencia, una RTX 3090, RTX 4090 o cualquier GPU con 8 GB o más de VRAM debería ser suficiente según la estimación anterior.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs consumer modernas con 8 GB o más, aunque no hay confirmación oficial.
- Opciones de despliegue: al publicarse en formato transformers/safetensors, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión). No se proporcionan pesos GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| WUrbane/vartrace-multipass-520m | ~520M (nominal) | No disponible | No disponible | Hugging Face, safetensors | Repositorio de experimento de ablación, sin benchmarks publicados |
| Alternativas de ~500M (p. ej. Qwen2.5-0.5B, SmolLM2-360M) | 360M–500M | 32k (Qwen2.5) / 8k (SmolLM2) | Apache 2.0 (Qwen2.5) / Apache 2.0 (SmolLM2) | Hugging Face, GGUF, vLLM | Modelos con benchmarks publicados y amplia adopción |
| Alternativas de ~1B (p. ej. Llama 3.2-1B) | 1,2B | 128k | Llama 3.2 Community License | Hugging Face, GGUF, vLLM | Mayor tamaño, contexto muy superior, benchmarks publicados |

La comparación es orientativa: no se dispone de datos de rendimiento del modelo VarTrace que permitan una comparación cuantitativa justa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni ninguna otra evaluación, por lo que se desconoce su calidad real.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso en producción.
- Idiomas no documentados: se desconoce qué lenguas domina y con qué calidad.
- Contexto no documentado: no se conoce la longitud máxima de secuencia soportada.
- Riesgo de alucinación: inherente a los modelos causales de este tamaño, agravado por la falta de evaluación.
- Sesgos: no se documenta ningún análisis de sesgos ni de seguridad.
- Naturaleza experimental: es un artefacto de investigación (ablación de optimizadores y pasadas), no un modelo orientado a producción; su uso previsto es la reproducibilidad científica.
- Sin descargas ni validación comunitaria: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación externa.
- Tamaño del repositorio (6,4 GB) sugiere múltiples subcarpetas con pesos completos; conviene verificar el contenido antes de descargar todo el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WUrbane/vartrace-multipass-520m
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
