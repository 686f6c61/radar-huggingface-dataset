# TriusAI/blacksmith-1a

## Resumen

Blacksmith-1a es un modelo de lenguaje decoder-only de 522 millones de parámetros entrenado desde cero por TriusAI sobre una única iGPU de consumo (Radeon 8060S, 96 GiB de VRAM). No es un fine-tune de ningún modelo publicado: la arquitectura, el pipeline de datos, la extensión de contexto largo y el ajuste fino están implementados en el directorio `code/` del repositorio. Emplea una arquitectura transformer tipo NanoGPT con 20 capas, `d_model` de 1280, 10 cabezas de atención (MHA, sin GQA), FFN de 5120 con GELU y LayerNorm pre-norm, junto con embeddings de entrada y salida no atados.

El modelo se entrenó en aproximadamente 9.900 millones de tokens sobre una mezcla de SlimPajama, Cosmopedia v2, UltraChat y OpenThoughts, y posteriormente se extendió su ventana de contexto de 4.096 a 65.536 tokens mediante fases de entrenamiento progresivas. Después recibió SFT sobre UltraChat, LongAlign, HotpotQA y datos sintéticos de needle-in-a-haystack, más un pulido de identidad. Se distribuye en formato PyTorch (`.pt`) y en GGUF para llama.cpp, con cuantización Q4_K_M de 327 MB.

Su relevancia es fundamentalmente como artefacto de investigación: demuestra que es posible entrenar un modelo de chat coherente y bien formateado desde cero en hardware de consumo, pero el propio autor advierte que carece prácticamente de conocimiento del mundo, no realiza aritmética y no recupera información más allá de aproximadamente mil tokens pese a su ventana entrenada de 64k.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (NanoGPT), 20 capas, MHA sin GQA, RoPE intercalado, LayerNorm pre-norm |
| Parametros totales | 522.219.520 (no-embedding ~430M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens entrenados; export GGUF con YaRN a 131.072 |
| Tipos de cuantizacion | f16 y Q4_K_M (GGUF); pesos PyTorch en bfloat16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), GGUF (f16 y Q4_K_M), safetensors (repo) |

Detalles adicionales: `d_model` 1280, 10 cabezas con `head_dim` 128, FFN de 5120 con GELU sin compuerta, LayerNorm con eps 1e-5, RoPE con theta 10000 y emparejamiento intercalado, tokenizer GPT-2 BPE (50.257) más 4 tokens de control hasta 50.261. Tokens especiales: `<|im_start|>`, `<|im_end|>`, `<think>`, `</think>`; EOT (50256) termina una conversación.

## Arquitectura y entrenamiento

La arquitectura se implementa en `code/model.py` como clase `NanoGPT` y no es una arquitectura de `transformers`, por lo que `AutoModel.from_pretrained` no puede cargarla. Usa atención multi-cabeza estándar (sin GQA), FFN con GELU sin compuerta, embeddings de entrada y salida no atados y RoPE con emparejamiento intercalado. La extensión de contexto se realizó entrenando a posiciones más largas con `rope_scale = 1`, no mediante escalado: 4.096 → 8k → 16k → 32k → 64k. YaRN se aplica únicamente más allá de la longitud entrenada, en inferencia y exportación.

El pretraining consumió unas 75.600 pasos de 32 × 4.096 tokens (≈9.900 millones de tokens) con una mezcla de SlimPajama 40%, Cosmopedia v2 35%, UltraChat 15% y OpenThoughts 10%, alcanzando una pérdida final de 1,97. Las fases de contexto largo registraron pérdidas de 1,99 (8k), 1,99 (16k), 1,93 (32k) y ~2,1 (64k, 421 s/paso sin `torch.compile`). El SFT (3.000 pasos, 4 × 8.192 empaquetados) bajó la pérdida a 1,36; el SFT de recuperación (2.500 pasos, 85% needle-in-a-haystack sintético) a 1,35; y el pulido de identidad (2 × 300 pasos, identidad al ~50% de tokens, lr 5e-5) a 0,76. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional con formato de chat coherente y bien estructurado.
- Identidad propia consistente: responde correctamente a "Who are you?", "What's your name?" y variantes ("I'm Blacksmith, a language model trained by Trius.").
- Conocimiento factual muy limitado: acierta la capital de Francia en aproximadamente dos de cada tres muestras.
- Explicación de conceptos científicos básicos en algunos casos (menciona dispersión de Rayleigh al preguntar por el color del cielo en 1-3 de 3 muestras).
- Generación de código con aspecto plausible pero sintácticamente inválido (el ejemplo de invertir una cadena en Python no es Python válido).
- Aritmética: no disponible (falla siempre en "2+2").
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Modo thinking: existen tokens `<think>`/`</think>` en el vocabulario, pero no se documenta un modo de razonamiento funcional.
- Recuperación en contexto: limitada a aproximadamente mil tokens hacia atrás, pese a la ventana entrenada de 64k.

## Casos de uso

- Investigación sobre entrenamiento desde cero: reproducir el pipeline completo (arquitectura, datos, extensión de contexto, SFT) en hardware de consumo, ya que todo el código vive en `code/` y el autor documenta cada fase con pasos, tokens y pérdidas.
- Estudio de extensiones de contexto largo: analizar por qué un modelo entrenado a 64k no recupera más allá de ~1k tokens, usando los datos de needle-in-a-haystack publicados como referencia para experimentos de capacidad frente a datos.
- Validación de exportaciones GGUF: el repositorio documenta tres bugs de conversión corregidos (sesgos f16, hint de pre-tokenizer `gpt-2`, permutación RoPE intercalado→half-split) y una validación numérica de perplejidad (19,33 en llama.cpp frente a 19,34 en PyTorch), útil como caso de estudio de portabilidad.
- Prototipado de interfaces de chat: su formato `<|im_start|>`/`<|im_end|>` y `chat_template.jinja` permiten integrarlo en herramientas que consumen plantillas de chat de Hugging Face para probar pipelines conversacionales sin coste de inferencia.
- Demostraciones educativas de arquitecturas transformer: con 522M parámetros y código legible, sirve para ilustrar RoPE, LayerNorm pre-norm, embeddings no atados y fases de entrenamiento por etapas.
- Pruebas de cuantización de bajo coste: el GGUF Q4_K_M de 327 MB permite ejecutar el modelo en CPU y medir el impacto de la cuantización (perplejidad 23,21 frente a 22,86 en f16, +1,5%) en un modelo pequeño.
- No adecuado para producción: atención al cliente, generación de código real, cálculo o recuperación documental no son viables con este modelo según la propia evaluación del autor.

## Benchmarks y rendimiento

| Prompt | Resultado |
|---|---|
| "Who are you?" / "Hello! Who are you?" / "What's your name?" | Correcto en todas las formulaciones |
| "What is the capital of France?" | París, ~2-3 de 3 muestras |
| "Why is the sky blue?" | Menciona dispersión de Rayleigh, 1-3 de 3 |
| "Summarize the plot of Hamlet" | Fluido y estructurado, factualmente inventado |
| "Write a Python function that reverses a string" | Bloque de código plausible, no es Python válido |
| "What is 2+2?" | Nunca correcto |

Recuperación (needle-in-a-haystack, formato chat, 3 muestras por celda):

| Contexto | Adyacente | ~2k tokens atrás |
|---|---|---|
| 4.096 | 3/3 | 0-2 de 9 |
| 16.384 | 0-2 de 3 | 0/9 |
| 65.536 | 0/3 | 0/3 |

El entrenamiento con 90M tokens de datos sintéticos de needle (85% de la mezcla, fraseo exacto) movió la recuperación a 4k de 0/9 a 2/9 y dejó 16k en 0/9. Perplejidad: 22,86 en f16 y 23,21 en Q4_K_M sobre la misma ventana de 512 tokens. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 ocupa aproximadamente 1 GB de pesos (522M parámetros); el GGUF f16 pesa 1.047 MB y el Q4_K_M 327 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para f16; el entrenamiento original se realizó en una Radeon 8060S con 96 GiB de VRAM.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU con el GGUF Q4_K_M.
- Opciones de despliegue: llama.cpp mediante `llama-cli` con arquitectura `gptneox` (soporta contexto 131.072 con YaRN factor 2.0), script `code/generate.py` para PyTorch, y cualquier runtime que cargue el `.pt` con el código incluido. No es compatible con `transformers` ni, por tanto, con vLLM o TGI sin adaptación.
- Latencia y throughput: no disponible. Solo se documenta el coste de entrenamiento de la fase 64k (421 s/paso).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Blacksmith-1a | 522M | 65.536 (131.072 con YaRN) | MIT | PyTorch, GGUF | Entrenado desde cero, conocimiento del mundo casi nulo, sin benchmarks estándar |
| GPT-2 (OpenAI) | 124M-1.5B | 1.024 | MIT | PyTorch, safetensors | Referencia histórica de la misma familia; contexto mucho menor |
| SmolLM2-360M (Hugging Face) | 360M | 8.192 | Apache 2.0 | safetensors, GGUF | Modelo pequeño con benchmarks publicados y conocimiento general |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo de tamaño comparable con capacidades multilingües y tool calling |

La comparación con alternativas de la misma categoría es aproximada: no hay datos de benchmarks de Blacksmith-1a frente a estos modelos en la información disponible, y sus capacidades declaradas (aritmética, recuperación, código) son inferiores según la propia evaluación del autor.

## Limitaciones y advertencias

- Conocimiento del mundo prácticamente inexistente: el autor lo describe como "un modelo de chat pequeño, coherente y bien formateado con casi ningún conocimiento del mundo".
- No realiza aritmética: falla siempre en operaciones básicas como "2+2".
- Generación de código no funcional: produce bloques plausibles pero inválidos sintácticamente.
- Recuperación limitada: no recupera información más allá de aproximadamente mil tokens, pese a la ventana entrenada de 64k; el autor lo atribuye a un límite de capacidad del modelo, no de datos.
- Riesgo alto de alucinación factual: resúmenes fluidos pero inventados (por ejemplo, la trama de Hamlet).
- Solo inglés: no soporta otros idiomas.
- Licencia MIT: permite uso comercial, pero las limitaciones técnicas hacen inviable su uso en producción.
- No compatible con `transformers`: requiere el código incluido en el repositorio para cargar los pesos PyTorch.
- La model card original está truncada en la sección de evaluación, por lo que parte de los datos de validez de las métricas no está disponible.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/TriusAI/blacksmith-1a
- Repositorio de código: incluido en el propio repositorio de Hugging Face (`code/`), con `model.py`, `tokenmaker.py`, `hyperparameters.py` y `generate.py`
- Documentación GGUF: `docs/GGUF.md` dentro del repositorio
- Plantilla de chat: `chat_template.jinja` en el repositorio
- Tokenizer: `tokenizer.json` en el repositorio
- Pesos GGUF: `gguf/blacksmith-1a-128k-f16.gguf` y `gguf/blacksmith-1a-128k-Q4_K_M.gguf`
- Paper, blog o demo adicionales: no disponible
