# Yujivus/nanochat-base10-3000-d8-r48-seed42

## Resumen

Nanochat Base-10, depth 8 es un checkpoint de investigación entrenado desde cero con el framework nanochat, un proyecto que reproduce de forma minimalista el pipeline de entrenamiento de un modelo tipo ChatGPT. Lo publica el usuario Yujivus en Hugging Face y su interés no radica en competir con modelos de producción, sino en estudiar cómo la exposición a un corpus aritmético ampliado afecta al aprendizaje de sumas en base 10 en un transformer pequeño.

El modelo emplea una arquitectura transformer de 8 capas, 4 cabezas de atención, dimensión de embedding de 512 y una longitud de secuencia de 2048 tokens, con un vocabulario de 32.768 entradas compartido con otros modelos de la misma familia. Se ha entrenado con 2.013.265.920 tokens en una única H100 usando FP8, y el checkpoint final corresponde al paso 7680.

La particularidad del modelo es su dataset: se han añadido 5.002.000 ecuaciones de suma ordenadas fuera del cuadrado de operandos 0..2000, extendiendo el rango hasta 0..3000. El autor advierte explícitamente de que el modelo no afirma ningún resultado de rendimiento y de que las comparaciones deben medirse tras el entrenamiento, por lo que se trata de un artefacto para experimentación reproducible más que de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (nanochat), 8 capas, 4 cabezas, 4 cabezas KV, dimensión 512, patrón de ventana "SSSL" |
| Parámetros totales | no disponible (no declarado; estimable a partir de la configuración, pero no publicado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (sequence_len) |
| Tipos de cuantización | no disponible (checkpoint en formato nativo nanochat, no cuantizado) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | checkpoint nativo de nanochat (no es formato Transformers AutoModel; incluye estados de modelo y optimizador) |
| Vocabulario | 32.768 tokens (tokenizer compartido nanochat-tokenizer-digit-32k) |
| Paso final de entrenamiento | 7680 |
| Tokens de entrenamiento | 2.013.265.920 |
| Precisión de entrenamiento | FP8 sobre una H100 |
| Tamaño del repositorio | 7,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de nanochat: un transformer decoder-only con 8 capas, 4 cabezas de atención (con 4 cabezas KV, es decir, sin reducción por GQA), dimensión de embedding de 512 y ventana de contexto de 2048 tokens. El patrón de ventana declarado es "SSSL", que alterna capas con atención de ventana corta y una capa final con ventana larga, una variante de atención local/global destinada a reducir coste computacional manteniendo acceso a contexto más amplio en determinadas capas. El vocabulario de 32.768 tokens es compartido con el resto de la familia mediante un tokenizer específico orientado a dígitos.

El entrenamiento se realizó desde cero sobre el dataset `nanochat-climbmix-arithmetic-base10-3000`, una variante del corpus ClimbMix a la que se añadieron 5.002.000 ecuaciones de suma ordenadas con operandos en el rango 0..3000, fuera del cuadrado 0..2000 original. Según la model card, el cuadrado antiguo conserva dos exposiciones y la región añadida tiene una; el resto de datos originales se mantiene. El cómputo total fue de 2.013.265.920 tokens en el paso 7680, ejecutado en FP8 sobre una sola H100. No se documentan fases de RLHF, DPO ni ajuste por preferencias, ni innovaciones como decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva en inglés con un modelo de 8 capas y contexto de 2048 tokens.
- Aritmética en base 10, en particular sumas con operandos hasta 3000, gracias al corpus ampliado de entrenamiento.
- Tokenización específica de dígitos mediante el tokenizer compartido `nanochat-tokenizer-digit-32k`.
- Capacidad de continuar el preentrenamiento: el repositorio incluye estados intermedios de modelo y optimizador, lo que permite reanudar el entrenamiento o hacer fine-tuning.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües limitadas al inglés declarado; no hay evidencia de otros idiomas.

## Casos de uso

- Investigación sobre aprendizaje aritmético: el modelo permite estudiar cómo varía la precisión en sumas al ampliar el corpus de operandos de 0..2000 a 0..3000, comparando con los checkpoints anteriores de la misma familia.
- Reproducción de experimentos de entrenamiento: al incluir scripts de lanzamiento, logs y estados intermedios, sirve para replicar el pipeline de nanochat en una sola GPU H100 con FP8.
- Estudio de curricula de datos: la distinción entre dos exposiciones del cuadrado antiguo y una del nuevo permite analizar el efecto de la frecuencia de exposición sobre la generalización aritmética.
- Base para fine-tuning supervisado: al ser un checkpoint nativo con estados de optimizador, se puede continuar el entrenamiento con datos adicionales o tareas derivadas.
- Docencia y formación: un modelo de 8 capas y 512 dimensiones es manejable para explicar el ciclo completo de preentrenamiento, tokenización y evaluación en un curso práctico.
- Evaluación de tokenizers de dígitos: el tokenizer compartido permite medir el impacto de la tokenización específica de dígitos en tareas de aritmética frente a tokenizers BPE genéricos.
- Análisis de atención local/global: el patrón "SSSL" permite experimentar con ventanas de atención y medir su efecto en tareas de contexto corto y medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el rendimiento debe medirse tras el entrenamiento y que no se afirma ninguna comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 8 capas, dimensión 512 y vocabulario de 32.768, el peso en precisión completa es del orden de cientos de MB; el repositorio de 7,3 GB incluye estados de optimizador y checkpoints intermedios, no solo pesos de inferencia.
- GPU recomendadas: una H100 fue suficiente para el entrenamiento completo en FP8; para inferencia basta una GPU consumer moderna con al menos 8 GB de VRAM, aunque no hay cifras publicadas.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño reducido de la arquitectura, pero no se dispone de mediciones oficiales.
- Opciones de despliegue: requiere el código de nanochat fijado al commit `92d63d4e8bb4df75c3b71618f31ddde2378b2bcd` y los directorios `base_checkpoints/base10-3000-d8-r48-seed42` y `tokenizer` bajo `NANOCHAT_BASE_DIR`. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI al no estar en formato Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nanochat Base-10 depth 8 (este) | no disponible (8 capas, 512 dim) | 2048 | no disponible | checkpoint nanochat | Corpus aritmético ampliado a 0..3000 |
| Otros checkpoints de la familia nanochat de Yujivus | no disponible | 2048 | no disponible | checkpoint nanochat | Misma arquitectura y tokenizer, distinta exposición aritmética |
| Modelos transformer pequeños de propósito general | variable | variable | variable | safetensors/GGUF | No disponibles datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento ni de especificaciones completas de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo es un checkpoint de investigación: el autor no afirma ningún resultado de rendimiento y recomienda medirlo tras el entrenamiento.
- No está en formato Transformers AutoModel; requiere el código de nanochat en un commit concreto, lo que complica su integración en pipelines estándar.
- El repositorio incluye estados de optimizador e intermedios, por lo que su tamaño (7,3 GB) no refleja el peso de inferencia.
- Idioma limitado al inglés declarado; no hay evidencia de capacidades multilingües.
- Contexto de solo 2048 tokens, insuficiente para tareas de documento largo o conversaciones extensas.
- Riesgo de alucinación y de errores aritméticos fuera del rango de operandos entrenado; el propio autor señala que el rendimiento debe medirse, no asumirse.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Sesgos: no documentados, pero al entrenarse sobre ClimbMix y un corpus sintético de sumas, puede heredar sesgos del corpus base y un comportamiento degenerado fuera de la distribución aritmética.
- No se documentan mecanismos de seguridad, alineación ni filtrado de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yujivus/nanochat-base10-3000-d8-r48-seed42
- Dataset: https://huggingface.co/datasets/Yujivus/nanochat-climbmix-arithmetic-base10-3000
- Tokenizer compartido: https://huggingface.co/Yujivus/nanochat-tokenizer-digit-32k
- Commit de nanochat referenciado: `92d63d4e8bb4df75c3b71618f31ddde2378b2bcd` (sin URL directa en la información proporcionada)
- Scripts de lanzamiento, logs de entrenamiento, `provenance/` y `base10_3000_upload_manifest.json`: incluidos en el repositorio del modelo
