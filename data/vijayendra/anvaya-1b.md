# Vijayendra/Anvaya-1B

## Resumen

Anvaya-1B es un modelo de lenguaje denso de tipo decoder-only con 1.018.126.848 parámetros, desarrollado por Vijayendra como proyecto educativo de ingeniería de sistemas. El objetivo declarado no es competir en calidad con modelos de frontera, sino demostrar que es posible preentrenar desde cero un modelo real de escala billón de parámetros en hardware modesto: dos GPU NVIDIA Tesla T4 de 16 GB. Los pesos del Transformer se inicializan de forma aleatoria; únicamente se reutiliza el tokenizador de la familia Llama 3.2 1B.

La arquitectura es deliberadamente convencional (transformer denso con 29 bloques, anchura oculta 1536, 24 cabezas de atención, FFN de 6144, RMSNorm, RoPE y embeddings de entrada/salida atados) para centrar el esfuerzo en el sistema de entrenamiento distribuido. El modelo se entrenó sobre tokens derivados de FineWeb v1.4.0 (config CC-MAIN-2025-26) hasta alcanzar 1.500.119.040 tokens de entrada al modelo y una longitud de contexto de 4096 tokens.

Su relevancia es fundamentalmente metodológica y educativa: publica un linaje inmutable de checkpoints intermedios (desde 160M hasta 1.5B tokens) con métricas de validación en cada punto, junto con el código del entrenador. No está pensado para uso en producción como asistente general, sino como referencia reproducible de preentrenamiento a gran escala con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (causal), RMSNorm, RoPE half-split, SDPA causal, MLP GELU de dos capas, embeddings atados |
| Parametros totales | 1.018.126.848 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (export público únicamente en FP16) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb, predominantemente inglés) |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (FP16, model-only) |

Detalles adicionales de arquitectura: 29 capas, anchura oculta 1536, 24 cabezas de atención de 64 dimensiones, FFN de 6144, vocabulario de 128.256 tokens (tokenizador Llama 3.2 1B, EOS 128001).

## Arquitectura y entrenamiento

El modelo sigue un diseño de transformer denso convencional con 29 bloques decoder, normalización RMSNorm, RoPE con división half-split, atención causal mediante PyTorch SDPA y un MLP estándar de dos capas con activación GELU. Los embeddings de entrada y salida están atados. La implementación de referencia se mantiene próxima al código de entrenamiento y, de forma explícita, no implementa caché KV, lo que penaliza la inferencia autorregresiva en producción.

El entrenamiento se realizó con PyTorch FSDP en modo FULL_SHARD sobre 2 GPU Tesla T4 de 16 GB, con checkpointing de activaciones, precisión mixta FP16 y acumulación de gradientes hasta 131.072 tokens de entrada por actualización del optimizador. El corpus proviene de HuggingFaceFW/fineweb v1.4.0 (CC-MAIN-2025-26), con un contrato histórico de 1.485B tokens de entrenamiento y 15M de validación en 24 shards (uint32 little-endian). El muestreo extrae ventanas deterministas de 4096 tokens con reemplazo, por lo que la cifra de tokens es un registro de tokens de entrada al modelo, no una garantía de cobertura única del corpus. No se documenta RLHF, DPO ni ajuste por instrucciones: es un modelo base preentrenado. El pico de memoria del allocator de PyTorch en el rango 0 fue de aproximadamente 11,41 GiB.

## Capacidades

- Generación de texto autoregresiva a partir de un prompt, en modo modelo base (sin ajuste por instrucciones).
- Modelado de lenguaje causal con ventana de contexto de 4096 tokens.
- Capacidad multilingüe no documentada; el corpus FineWeb es mayoritariamente inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking).
- No implementa caché KV en la implementación de referencia, lo que limita el uso interactivo eficiente.
- Utiliza el tokenizador de Llama 3.2 1B, lo que facilita la compatibilidad de tokenización con esa familia.

## Casos de uso

- Investigación educativa sobre preentrenamiento a escala: el repositorio permite reproducir y estudiar el pipeline completo de FSDP, checkpointing transaccional y contrato de datos en hardware de consumo, sirviendo como material docente para cursos de sistemas de ML.
- Estudio de curvas de escalado: el linaje de checkpoints (160M, 240M, 320M, 400M, 560M, 800M, 1B, 1.2B, 1.35B, 1.5B-final) con NLL y perplejidad de validación en cada punto permite analizar empíricamente la evolución del modelo durante el preentrenamiento.
- Experimentos de ajuste fino (SFT/LoRA): al ser un modelo base de 1B con tokenizador Llama, es un sustrato asequible para probar recetas de ajuste supervisado en una sola GPU de consumo, aunque sin expectativas de calidad de asistente.
- Evaluación comparativa de infraestructura: sirve para medir throughput, uso de memoria y comportamiento de FSDP o de frameworks de inferencia (vLLM, llama.cpp) con un modelo de 1B parámetros.
- Generación de texto de dominio general en inglés como línea base: útil para comparar contra modelos preentrenados similares en tareas de perplejidad y modelado de lenguaje, no para atención al cliente ni asistentes.
- Reproducción de artefactos de publicación: la verificación de hashes SHA-256, conteo exacto de parámetros y smoke test de logits finitos sirve como ejemplo de pipeline de release reproducible para proyectos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son de validación interna sobre una muestra fija de 131.072 tokens:

| Revision | Update | Tokens de entrada | NLL validacion | Perplejidad | Precision de token |
|---|---:|---:|---:|---:|---:|
| 160M | 1.225 | 160.563.200 | 4,75070 | 115,67 | 25,21% |
| 240M | 1.829 | 239.730.688 | 4,26552 | 71,20 | 30,09% |
| 320M | 2.436 | 319.291.392 | 3,98411 | 53,74 | 32,38% |
| 400M | 3.031 | 397.279.232 | 3,81320 | 45,30 | 33,69% |
| 560M | 4.269 | 559.546.368 | 3,58536 | 36,07 | 35,71% |
| 800M | 6.042 | 791.937.024 | 3,41344 | 30,37 | 37,31% |
| 1B | 7.879 | 1.032.716.288 | 3,30334 | 27,20 | 38,32% |
| 1.2B | 9.090 | 1.191.444.480 | 3,25586 | 25,94 | 38,92% |
| 1.35B | 10.282 | 1.347.682.304 | 3,22915 | 25,26 | 39,13% |
| 1.5B-final | 11.445 | 1.500.119.040 | 3,21237 | 24,84 | 39,36% |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2 GB solo para pesos (1.018M parámetros × 2 bytes), más activaciones y overhead del runtime; en la práctica, entre 3 y 5 GB según longitud de secuencia y framework.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16; las T4 de 16 GB usadas en entrenamiento son suficientes. Para mayor comodidad, A100, H100 o RTX 4090 ofrecen margen amplio.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y similares con 8 GB o más.
- Opciones de despliegue: la implementación de referencia es PyTorch puro (`modeling_anvaya.Anvaya1B`) sin caché KV, por lo que no es óptima para serving. Para producción habría que adaptarla a vLLM, TGI o convertirla a GGUF para llama.cpp/Ollama; no se documenta ninguna conversión oficial.
- Latencia y throughput: no disponibles. La ausencia de caché KV implica recómputo completo del prefijo en cada token generado, lo que degrada gravemente la latencia en generación larga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---:|---:|---|---|---|
| Anvaya-1B | 1,018B | 4096 | other | Preentrenamiento educativo desde cero | Hugging Face, FP16 safetensors |
| Llama 3.2 1B | ~1,24B | 128K | Llama 3.2 Community License | Modelo base + instructivo de Meta | Hugging Face, amplio ecosistema |
| TinyLlama 1.1B | ~1,1B | 2048 | Apache 2.0 | Preentrenamiento desde cero sobre 3T tokens | Hugging Face, amplia comunidad |
| Qwen2.5-1.5B | ~1,54B | 32K | Apache 2.0 | Base e instructivo, multilingüe | Hugging Face, vLLM, Ollama |

Anvaya-1B se distingue por su transparencia de linaje de checkpoints y su enfoque educativo, pero queda muy por detrás en tokens de entrenamiento (1,5B frente a billones en TinyLlama o Llama 3.2), contexto (4096 frente a 32K-128K) y madurez de ecosistema. No se dispone de benchmarks comparativos directos.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formato conversacional; no debe usarse como asistente directo.
- Entrenado con solo 1,5B tokens de entrada, muy por debajo de lo habitual en modelos de su tamaño; la calidad de generación será limitada y la perplejidad de validación (24,84) refleja un ajuste modesto al corpus.
- Riesgo elevado de alucinación y de texto incoherente en generaciones largas.
- Corpus FineWeb mayoritariamente en inglés; el rendimiento en castellano y otros idiomas no está documentado y probablemente sea deficiente.
- La licencia es "other" sin términos detallados en la información disponible; es imprescindible revisar el repositorio antes de cualquier uso comercial.
- La implementación de referencia no incluye caché KV, lo que la hace inadecuada para producción interactiva sin modificaciones.
- El muestreo con reemplazo implica que no todos los tokens del corpus fueron vistos; el número de tokens no equivale a cobertura única.
- No hay datos publicados sobre sesgos, evaluación de seguridad ni robustez frente a prompts adversarios.
- El modelo está pensado como artefacto educativo; no se recomienda su despliegue en aplicaciones con usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vijayendra/Anvaya-1B
- Repositorio del entrenador y documentación: https://github.com/VijayendraDwari/pretrain-1b-on-2xT4
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Tokenizador de referencia: https://huggingface.co/meta-llama/Llama-3.2-1B
