# wyf-yfw/MiniSeek-D0.1-base

## Resumen

MiniSeek-D0.1-base es un modelo de lenguaje de tipo decoder-only denso, ultra pequeño, con 28.451.328 parámetros (~28,45 M), publicado por el autor wyf-yfw (Wang Yifan) bajo licencia Apache-2.0. Se trata de un checkpoint exclusivamente preentrenado (base, sin SFT ni RLHF) concebido como línea base densa de la familia MiniSeek, cuyo objetivo declarado es servir de referencia antes de la llegada de la línea MoE (MiniSeek-M) y de etapas posteriores (SWA, CSA2, CED) alineadas con un stack tipo DeepSeek-V4.1-Flash.

El modelo emplea una arquitectura transformer densa de 8 capas, dimensión oculta 512, 8 cabezas de atención, FFN de 2048 unidades y vocabulario de 6400 tokensheredado del tokenizador de MiniMind, con contexto de entrenamiento de solo 512 tokens. Los pesos se distribuyen en FP32 dentro de un repositorio de 0,1 GB, y el código de inferencia no es compatible con `AutoModelForCausalLM`: requiere la clase propia `DenseLM` del repositorio del autor.

Su relevancia es fundamentalmente didáctica y experimental: permite reproducir y auditar un pipeline completo de preentrenamiento (datos, receta de optimización, evaluación) en una única GPU de consumo, y establece una base comparable reproducible para medir el efecto de cambios arquitectónicos posteriores sobre el mismo corpus de preentrenamiento. No está pensado como chatbot de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (RMSNorm, atención causal con RoPE, FFN densa) |
| Parametros totales | 28.451.328 (~28,45 M) |
| Parametros activos | No aplica (modelo denso; la línea MoE será MiniSeek-M) |
| Longitud de contexto | 512 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP32; entrenamiento en BF16). No se publican ficheros GGUF ni cuantizados |
| Idiomas soportados | Chino (predominante) e inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`, FP32), más `config.json` y tokenizador propio en `tokenizer/`. No hay safetensors |

Hiperparámetros adicionales:

| Componente | Valor |
|---|---|
| `d_model` | 512 |
| `n_layers` | 8 |
| `n_heads` | 8 |
| `head_dim` | 64 |
| `intermediate_size` (FFN) | 2048 (= 4d) |
| Activación / normalización | FFN estilo GELU + RMSNorm |
| Posición | RoPE (θ = 1e6) |
| Embedding atado | Sí (LM Head = embedding) |
| `vocab_size` | 6400 (tokenizador MiniMind) |
| Tokens especiales | `pad/unk=<\|endoftext\|>` (0), `bos=<\|im_start\|>` (1), `eos=<\|im_end\|>` (2) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 8 bloques, cada uno con RMSNorm previa a la atención causal con RoPE (θ = 1e6), seguida de otra RMSNorm y una FFN densa de 2048 unidades con activación tipo GELU. La dimensión del modelo es 512, con 8 cabezas de atención de dimensión 64 cada una, embedding de tokens de 6400×512 y cabeza de lenguaje atada al embedding. El vocabulario reducido (6400 frente a los ~32k habituales) es responsable de que el recuento real de parámetros sea de 28,45 M y no de las estimaciones de ~58 M que asumen un vocabulario mayor.

El checkpoint se entrenó con el corpus `jingyaogong/minimind_dataset` (fichero `pretrain_t2t_mini.jsonl`, ~1,27 M de líneas), con una partición de validación fija del 0,5 % (`valid.jsonl`, semilla bloqueada) y objetivo de modelado de lenguaje causal. El token `<|im_end|>` (id 2) se añade como EOS al final de cada ejemplo durante el entrenamiento continuado. La mezcla lingüística es mayoritariamente china con algo de inglés, siguiendo la receta de preentrenamiento de MiniMind.

La configuración de entrenamiento reportada es: una NVIDIA RTX 3090, optimizador AdamW, LR pico 1e-4 con decaimiento hasta 3e-5 (warmup + coseno), autocast BF16 en CUDA, 158.035 pasos y una pérdida de entrenamiento mínima de ~0,77. El resultado publicado corresponde a `checkpoints/stage0/best.pt`. No se documentan innovaciones técnicas propias en este checkpoint (ni atención lineal, ni decodificación especulativa, ni MoE): las etapas SWA / CSA2 / CED son trabajo futuro según el autor.

## Capacidades

- Generación de texto autoregresiva por predicción del siguiente token (continuación de texto, no instrucciones).
- Capacidad incipiente de modelado de chino e inglés, limitada por el corpus de preentrenamiento.
- No dispone de modo "thinking", razonamiento multi-paso entrenado, matemáticas o código de forma fiable a este tamaño y sin SFT.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni planificación multi-paso.
- Sin visión, audio ni multimodalidad.
- Tokenizador propio (MiniMind, 6400 tokens) con tokens especiales `<|im_start|>` y `<|im_end|>`.
- Inferencia mediante clase personalizada `DenseLM` y script `generate.py`; incluye una interfaz web de demostración en el repositorio.

## Casos de uso

- Estudio y docencia de preentrenamiento de modelos de lenguaje: permite recorrer el pipeline completo (tokenización, dataset, bucle de entrenamiento, evaluación) con un coste de cómputo de una sola GPU de consumo.
- Línea base densa para experimentos de arquitectura: al reutilizar exactamente el mismo corpus (`pretrain_t2t_mini.jsonl`) y la misma partición de validación, sirve para medir el delta de calidad al introducir MoE (MiniSeek-M) u otras variantes, con una pérdida de referencia de ~0,77.
- Pruebas de infraestructura y tooling de inferencia: por su tamaño (0,1 GB de pesos), es útil para validar scripts de carga, tokenización, generación con `temperature`/`top_k` y control de EOS antes de portar el código a modelos mayores.
- Experimentos de cuantización y eficiencia: al caber holgadamente en cualquier GPU de consumo e incluso en CPU, permite comparar precisión frente a FP32/BF16/int8 sin cuellos de botella de memoria, y medir el impacto de incorporar KV cache (aún no implementada).
- Continuación de texto en chino a pequeña escala: generación de continuaciones breves (≤512 tokens de contexto) en demostraciones locales o en la Web UI del repositorio.
- Punto de partida para post-entrenamiento propio: el autor prevé publicar SFT y chat como repositorios separados (`MiniSeek-D0.1`); este checkpoint base puede usarse como inicialización para experimentos de SFT a pequeña escala.
- Reproducibilidad y auditoría de recetas: la receta (LR, warmup, BF16, pasos) está documentada de forma explícita, lo que facilita replicaciones y comparaciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas de la suite Eval-Core (Valid PPL, Gen-Smoke con 20 prompts y semilla 42, C-Eval valid, CMMLU y eficiencia en VRAM/tokens por segundo) se irán rellenando en `eval/reports/` del repositorio de GitHub a medida que se completen las ejecuciones.

Como referencia externa citada por el autor (no es un resultado de este modelo):

| Modelo | Parametros | C-Eval | CMMLU |
|---|---|---|---|
| MiniSeek-D0.1-base | ~28,45 M | no disponible | no disponible |
| MiniMind-3 (referencia ancla citada) | ~64 M | ≈24,9 | ≈25,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: ~114 MB en FP32 (28,45 M parámetros × 4 bytes), ~57 MB en BF16 y ~28 MB en int8; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con ≥1 GB de VRAM. El propio entrenamiento se realizó en una NVIDIA RTX 3090, pero la inferencia cabe en GPUs mucho menores (GTX 1650, RTX 3050, etc.).
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU CUDA modernas, y también en CPU (la model card emplea `map_location="cpu"` para cargar los pesos).
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama ni TGI; el modelo no es un `AutoModelForCausalLM` y requiere la clase `DenseLM` del repositorio `wyf-yfw/miniseek`, invocada mediante `generate.py` o código propio.
- Latencia y throughput: no disponible. Nota relevante: la inferencia actual recalcula todo el contexto en cada paso (sin KV cache), por lo que la velocidad es mucho menor de lo esperable para este número de parámetros.
- Almacenamiento: los pesos se distribuyen en `pytorch_model.bin`, cargado con `weights_only=True`; conviene verificar la integridad del fichero antes de cargarlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniSeek-D0.1-base | 28,45 M | 512 | No disponible (evaluación pendiente) | Apache-2.0 | HuggingFace + GitHub |
| MiniMind-3 (referencia citada por el autor) | ~64 M | no disponible en la información | C-Eval ≈24,9 / CMMLU ≈25,4 | no disponible en la información | HuggingFace (dataset y repo MiniMind) |
| MiniSeek-M (línea MoE, futura) | no disponible | no disponible | no disponible | no disponible | anunciada, no publicada |

No se dispone en la información proporcionada de datos verificables (parámetros, contexto, benchmarks o licencia) de otros modelos comparables de tamaño similar, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Capacidad muy reducida (28,45 M de parámetros): se esperan errores factuales, repeticiones y continuaciones incoherentes; el propio autor advierte que la calidad es cercana a aleatoria en exámenes difíciles.
- No incluye SFT, RLHF ni DPO: no sigue instrucciones ni mantiene conversaciones de forma fiable; es un modelo base.
- Contexto máximo de 512 tokens, insuficiente para documentos largos o diálogos multi-turno extensos.
- Sesgos: al entrenarse mayoritariamente con corpus chino de origen web (MiniMind), puede reproducir sesgos lingüísticos y culturales de esa mezcla; no se documenta ninguna mitigación.
- Riesgo alto de alucinación y de generar contenido incorrecto presentado con fluidez, dado el escaso conocimiento factual almacenado.
- Si no se alcanza el token `<|im_end|>`, la generación se corta en `max_new_tokens`.
- Ausencia de KV cache: la generación es lenta y el coste crece de forma cuadrática con la longitud; no apta para cargas de producción con latencia exigente.
- Integración limitada: no es compatible con `AutoModelForCausalLM`, pipelines de HuggingFace, vLLM ni llama.cpp; requiere código propio del repositorio.
- El formato de pesos es `pytorch_model.bin` (no safetensors), lo que implica cargar con `weights_only=True` y extremar precauciones si el origen no es de confianza.
- Licencia Apache-2.0: permite uso comercial y modificaciones con atribución, pero la calidad del modelo hace inviable su uso en producción pese a la permisividad legal.
- La evaluación está pendiente: no hay métricas publicadas que respalden ninguna afirmación de rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wyf-yfw/MiniSeek-D0.1-base
- Repositorio de código y recetas: https://github.com/wyf-yfw/miniseek
- Dataset de preentrenamiento: https://huggingface.co/datasets/jingyaogong/minimind_dataset
- Proyecto MiniMind (tokenizador y receta de datos): https://github.com/jingyaogong/minimind
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Cita del autor: `@misc{miniseek-d01, title = {MiniSeek-D0.1-base}, author = {Wang Yifan}, year = {2026}, howpublished = {\url{https://huggingface.co/wyf-yfw/MiniSeek-D0.1-base}}}`
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre el modelo (los resultados devueltos corresponden a servicios de floristería y no guardan relación).
