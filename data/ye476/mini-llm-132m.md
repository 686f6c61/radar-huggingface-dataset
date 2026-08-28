# ye476/mini-llm-132m

## Resumen

mini-LLM (132M) es un transformer decoder-only de 132,3 millones de parámetros entrenado desde cero por ye476 (FengYe476). El proyecto destaca por implementar manualmente todos los componentes —tokenizador BPE, pipeline de datos, arquitectura y bucle de entrenamiento— sin usar `transformers` ni `tiktoken`. Se publican dos checkpoints: un modelo base de pretraining y un modelo afinado con instrucciones (SFT) que incluye trayectorias de agentes de SWE-bench y Terminal-Bench.

El modelo tiene una ventana de contexto de 1024 tokens y un vocabulario de 24.576 entradas. Fue entrenado durante una época sobre 5.749 millones de tokens (aproximadamente 22 GB de corpus mixto) en una sola GPU H100, con una pérdida final de validación de 2,2921 (0,8518 bits por byte). Su relevancia radica en ser un experimento educativo completo de entrenamiento desde cero, con especial énfasis en datos de código y agentes, aunque su tamaño reducido limita su utilidad práctica frente a modelos modernos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT) |
| Parametros totales | 132,3 M (113,4 M no-embedding) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (pesos en fp32) |
| Idiomas soportados | Inglés y código (otros idiomas solo incidentalmente) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`.pt`, fp32, 529 MB por checkpoint) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only clásica: 12 capas, 12 cabezas de atención, ancho de 768, normalización RMSNorm con pre-norm, feed-forward SwiGLU con expansión 4× y embeddings atados (lm_head comparte pesos con la capa de embedding). La codificación posicional usa RoPE con θ = 10000. El tokenizador es un BPE propio de 24.576 entradas (256 bytes + 24.274 merges + 46 tokens especiales).

El pretraining se realizó sobre 5.749.010.432 tokens (una época) con AdamW (lr 1e-3, decaimiento coseno a 1e-4, 114 pasos de warmup, grad clip 1.0) en precisión mixta bf16 con pesos maestros fp32. El entrenamiento duró 7,4 horas en una H100 SXM con un MFU aproximado del 20%. El corpus mezcla ocho dominios: web educativo (20%), código Python (20%), StackExchange (15%), web DCLM (15%), Cosmopedia (12%), issues de código (10%), shell (5%) y documentación de terminal (3%, aunque solo se alcanzó un 0,12% real). Aproximadamente el 40% del corpus es código, por lo que el modelo es notablemente más fuerte en código y shell que en prosa.

El fine-tuning (checkpoint `mini-llm-sft.pt`) se realizó durante dos épocas sobre 122.012 conversaciones (15.252 pasos, batch 16). Incluye ~74.000 instrucciones generales de UltraChat-200k y 47.891 muestras de trayectorias de agentes provenientes de 1.808 pruebas de SWE-bench y Terminal-Bench, de las cuales 1.329 con `reward=1` se conservaron. Las trayectorias de agente se procesaron con una ventana de 1024 tokens, sustituyendo el prompt de sistema (1.042 tokens) por una línea y dividiendo cada turno del asistente en muestras individuales con la descripción de la tarea y los últimos seis mensajes. La pérdida final de validación del SFT es 0,9610 (0,5637 bpb).

## Capacidades

- Generación de texto en inglés y código (Python, shell, etc.) con coherencia básica.
- El modelo base continúa prefijos; el modelo SFT mantiene conversaciones multi-turno simples.
- Capacidades de agente limitadas: el SFT ha visto trayectorias de SWE-bench y Terminal-Bench, por lo que puede producir comandos como `ls` en bloques de código con explicaciones.
- No sigue instrucciones de forma fiable (el modelo base no está entrenado para ello; el SFT es fluido pero no preciso).
- Sin capacidades multimodales, tool calling formal ni razonamiento multi-paso estructurado.
- Multilingüe solo de forma incidental; el entrenamiento es predominantemente inglés y código.

## Casos de uso

- Aprendizaje e investigación educativa: ideal para estudiar el entrenamiento de LLMs desde cero, inspeccionar el código fuente, el tokenizador y el pipeline de datos sin dependencias externas.
- Prototipado rápido de pipelines de generación de texto: al ser ligero y con una API simple, permite experimentar con sampling, temperatura y top-k en entornos de desarrollo.
- Generación de código simple: puede completar funciones Python o comandos shell básicos, útil para demos o asistentes de terminal en entornos controlados.
- Experimentación con fine-tuning: su licencia MIT y su formato de pesos sencillo facilitan probar técnicas de ajuste con datasets pequeños.
- Evaluación de técnicas de entrenamiento: sirve como banco de pruebas para comparar configuraciones de optimizador, scheduling o composición de datos a bajo coste computacional.
- Agentes simples en entornos simulados: el SFT ha visto trayectorias de agentes, por lo que puede usarse para estudiar comportamientos de agente en tareas de terminal o edición de código con contexto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta únicamente métricas de validación propias:

| Metrica | Valor |
|---|---|
| Pérdida de validación (base) | 2,2921 |
| Bits por byte (base) | 0,8518 |
| Pérdida de validación (SFT) | 0,9610 |
| Bits por byte (SFT) | 0,5637 |

Estas cifras se miden sobre un split de validación propio, compuesto en un 40% por código, por lo que no son comparables con bpb publicados sobre WikiText o C4.

## Requisitos de hardware

- Inferencia en CPU: viable para generación de pocos tokens (el modelo es de 132M parámetros, ~529 MB en fp32).
- VRAM mínima: menos de 1 GB para fp32; con cuantización a fp16 o int8 cabría en cualquier GPU moderna.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (p. ej., GTX 1650, RTX 3050) para inferencia cómoda; el entrenamiento original usó una H100 SXM.
- Despliegue: al ser un state dict de PyTorch sin integración con `transformers`, requiere cargar el modelo con el código del repositorio. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversión previa.
- Latencia: no se han publicado mediciones; en una GPU consumer moderna se espera una generación de decenas de tokens por segundo, y en CPU unos pocos tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mini-LLM 132M | 132,3 M | 1024 | MIT | PyTorch state dict | Entrenado desde cero, sin transformers |
| GPT-2 (124M) | 124 M | 1024 | MIT | Transformers, ONNX, GGUF | Modelo de referencia, ampliamente soportado |
| SmolLM2-135M | 135 M | 2048 (ampliable a 8192) | Apache 2.0 | Transformers, GGUF | Entrenado con datos modernos, mejor rendimiento general |
| Qwen2.5-0.5B | 494 M | 32768 | Apache 2.0 | Transformers, GGUF | Mucho mayor contexto y capacidades, pero más pesado |

mini-LLM se distingue por su implementación artesanal y su enfoque en datos de agentes, pero carece del ecosistema de herramientas y del rendimiento de alternativas como SmolLM2 o GPT-2.

## Limitaciones y advertencias

- Contexto fijo de 1024 tokens: RoPE está fijado a esta longitud y el modelo nunca ha visto secuencias más largas; no es posible ampliar la ventana sin reentrenamiento.
- Solo inglés y código: otros idiomas aparecen de forma incidental y la calidad en ellos es muy baja.
- El modelo base no sigue instrucciones; el SFT es fluido pero no fiable en precisión factual (p. ej., puede responder sobre un lenguaje distinto al preguntado).
- Sin ningún tipo de alineamiento de seguridad (ni RLHF ni ajuste de seguridad): puede reproducir patrones indeseables presentes en el corpus.
- Subentrenado según estándares modernos, aunque sobreentrenado respecto a la optimalidad de Chinchilla (5,75B tokens para 132M parámetros es ~43× el número de parámetros).
- Las métricas bpb no son comparables entre datasets; las cifras reportadas se miden sobre un split propio con 40% de código.
- Formato de pesos no estándar: requiere el código del repositorio para cargar el modelo; no hay integración con `transformers` ni herramientas de cuantización listas para usar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ye476/mini-llm-132m
- Repositorio GitHub: https://github.com/FengYe476/mini-LLM
- Model card en GitHub: https://github.com/FengYe476/mini-LLM/blob/main/MODEL_CARD.md
