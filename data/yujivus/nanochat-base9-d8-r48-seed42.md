# Yujivus/nanochat-base9-d8-r48-seed42

## Resumen

Nanochat Base-9, depth 8 (identificador `Yujivus/nanochat-base9-d8-r48-seed42`) es un checkpoint de investigación entrenado desde cero con el framework nanochat. Se trata de un modelo de lenguaje de tipo transformer denso con 8 capas, dimensión de embedding de 512 y una longitud de secuencia de 2048 tokens, orientado a un experimento controlado de aritmética en base 9 sobre un corpus de texto convertido a dígitos. Lo publica el usuario Yujivus en Hugging Face y su interés es fundamentalmente académico: sirve para estudiar cómo un modelo pequeño aprende representaciones numéricas en una base no decimal cuando el resto del corpus mantiene su estructura.

El modelo se entrenó durante 7680 pasos con un batch global que arroja aproximadamente 2.013 millones de tokens procesados, usando entrenamiento en FP8 sobre una única GPU H100. La arquitectura declarada en la model card es `{"sequence_len": 2048, "vocab_size": 32768, "n_layer": 8, "n_head": 4, "n_kv_head": 4, "n_embd": 512, "window_pattern": "SSSL"}`, es decir, un transformer con atención de ventana deslizante y cabezas KV compartidas (GQA con 4 cabezas de query y 4 de clave/valor).

Es relevante ahora porque los checkpoints "raw" de nanochat no son compatibles con `AutoModel` de Transformers y requieren el código fijado del repositorio original, lo que lo convierte en un artefacto útil para reproducibilidad de experimentos de interpretabilidad numérica, no para uso en producción. No se han publicado resultados de benchmarks ni métricas de calidad en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (nanochat), atención con ventana deslizante, patrón `SSSL` |
| Parámetros totales | no disponible (derivables de la config: n_layer 8, n_embd 512, vocab 32768) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`sequence_len`) |
| Tipos de cuantización | no disponible (checkpoint en FP8 de entrenamiento; no se documentan cuantizaciones de inferencia) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | Checkpoints raw de nanochat (no safetensors de `AutoModel`); incluye estados de modelo y optimizador |
| Vocabulario | 32768 tokens (tokenizer compartido `nanochat-tokenizer-digit-32k`) |
| Cabezas de atención | 4 query / 4 key-value (GQA) |
| Dimensión de embedding | 512 |
| Pasos de entrenamiento | 7680 |
| Tokens de entrenamiento | 2.013.265.920 |
| Precisión de entrenamiento | FP8 sobre una H100 |
| Commit de nanochat | `92d63d4e8bb4df75c3b71618f31ddde2378b2bcd` |
| Tamaño del repo | 7.3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas con 512 dimensiones de embedding y 4 cabezas de atención, usando atención de múltiples consultas agrupada (4 cabezas de query y 4 de clave/valor, por lo que en la práctica no hay compartición entre grupos). El patrón de ventana `SSSL` indica que tres de las capas usan atención de ventana deslizante corta y la última usa atención completa sobre los 2048 tokens de contexto. El vocabulario es de 32768 tokens, compartido con el tokenizer `nanochat-tokenizer-digit-32k`.

El entrenamiento se realizó desde cero con el framework nanochat en su commit `92d63d4e8bb4df75c3b71618f31ddde2378b2bcd`, durante 7680 pasos, lo que con un batch global guardado equivale a 2.013.265.920 tokens. Se usó precisión FP8 en una sola GPU H100. El dataset es una conversión a "digit-run" del corpus decimal emparejado (ClimbMix), preservando ceros iniciales y orden de documentos, y se publica en `Yujivus/nanochat-climbmix-arithmetic-base9`. No se documentan fases de RLHF, DPO ni ajuste por preferencias; es un modelo base. El token 9 permanece en el vocabulario compartido pero no es un dígito válido en base 9, lo que constituye una peculiaridad del experimento más que una innovación de arquitectura.

## Capacidades

- Generación de texto autorregresiva en inglés sobre el corpus de entrenamiento.
- Modelado de secuencias numéricas representadas en base 9 (dígitos 0-8) dentro del corpus convertido.
- Razonamiento aritmético limitado al dominio del experimento (no se documentan evaluaciones).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (`language: en`).
- Sin modo "thinking", sin visión ni audio.
- Al ser un checkpoint base, no incluye alineación conversacional ni formato de chat.

## Casos de uso

- Reproducción de experimentos de interpretabilidad numérica: cargar el checkpoint con el código fijado de nanochat y analizar cómo se representan internamente los dígitos en base 9 frente a la base 10, comparando activaciones entre capas.
- Estudio de tokenizers numéricos: usar el tokenizer `nanochat-tokenizer-digit-32k` para medir cómo la tokenización por dígitos afecta a la longitud efectiva de las secuencias y al coste de entrenamiento en corpus aritméticos.
- Investigación sobre currículos de entrenamiento: comparar este modelo (depth 8, seed 42, r48) con otras variantes del mismo autor para aislar el efecto de la profundidad y la semilla en tareas aritméticas.
- Docencia y formación: servir como ejemplo mínimo y reproducible de un transformer entrenado desde cero con nanochat, con scripts de lanzamiento y logs incluidos, para explicar el pipeline completo en un curso de LLMs.
- Validación de pipelines FP8: reutilizar los scripts de entrenamiento en FP8 sobre H100 como referencia para medir estabilidad numérica y throughput en configuraciones pequeñas.
- Auditoría de artefactos: usar `base9_upload_manifest.json` y `provenance/` para verificar checksums y revisiones de dataset y tokenizer en flujos de reproducibilidad científica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repo (7.3 GB, que incluye estados de optimizador) el peso del modelo es mucho menor, pero no se documenta la huella exacta en inferencia.
- GPU de entrenamiento documentada: una H100 en FP8.
- GPU recomendadas para inferencia: cualquier GPU con suficiente memoria para el checkpoint; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; el modelo requiere el código de nanochat y no `AutoModel`, por lo que no se puede afirmar compatibilidad con RTX 4090 u otras consumer sin verificación.
- Opciones de despliegue: solo mediante el código fijado de nanochat (`NANOCHAT_BASE_DIR` con los directorios `base_checkpoints/base9-d8-r48-seed42` y `tokenizer`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Yujivus/nanochat-base9-d8-r48-seed42 | no disponible (config: 8 capas, 512 dim) | 2048 | Aritmética base 9, nanochat | no disponible | Raw nanochat |
| Otras variantes nanochat del mismo autor | no disponible | no disponible | Variantes de profundidad/semilla | no disponible | Raw nanochat |
| Modelos transformer pequeños tipo GPT-2 small | ~124M | 1024 | Texto general en inglés | MIT (GPT-2) | safetensors, GGUF |
| TinyLlama 1.1B | ~1.1B | 2048 | Texto general, chat | Apache 2.0 | safetensors, GGUF |

La comparación con GPT-2 small y TinyLlama es solo orientativa por tamaño y contexto; no hay datos de rendimiento de este checkpoint que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones ni mantiene formato de chat de forma fiable.
- Entrenado con solo ~2.013 millones de tokens, muy por debajo de los volúmenes habituales en LLMs; la calidad general del texto será limitada.
- El corpus está convertido a dígitos en base 9, lo que puede degradar el modelado de texto natural fuera del dominio numérico del experimento.
- El token 9 sigue en el vocabulario pero no es un dígito válido en base 9, lo que puede inducir salidas inválidas si el modelo lo genera.
- Riesgo de alucinación alto por tamaño y volumen de entrenamiento reducidos.
- Idiomas: solo inglés; no hay soporte multilingüe.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- No es compatible con `AutoModel` de Transformers; requiere el código fijado de nanochat y una configuración manual de directorios.
- No se han publicado benchmarks; cualquier afirmación de rendimiento sería especulativa.
- El autor declara explícitamente que no se reclaman nuevos resultados de interpretabilidad en base 9.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Yujivus/nanochat-base9-d8-r48-seed42
- Dataset: https://huggingface.co/datasets/Yujivus/nanochat-climbmix-arithmetic-base9
- Tokenizer: https://huggingface.co/Yujivus/nanochat-tokenizer-digit-32k
- Commit de nanochat referenciado: `92d63d4e8bb4df75c3b71618f31ddde2378b2bcd` (repositorio nanochat, sin URL directa en la información disponible)
- Manifiesto de artefactos: `base9_upload_manifest.json` (incluido en el repo)
- Provenance y checksums: directorio `provenance/` (incluido en el repo)
