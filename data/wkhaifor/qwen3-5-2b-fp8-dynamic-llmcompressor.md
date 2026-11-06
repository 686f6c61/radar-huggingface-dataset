# wkhaifor/Qwen3.5-2B-FP8-Dynamic-LLMCompressor

## Resumen

Qwen3.5-2B-FP8-Dynamic-LLMCompressor es una cuantización de precisión FP8 del modelo multimodal Qwen/Qwen3.5-2B, publicada por el usuario wkhaifor. El modelo base pertenece a la familia Qwen3.5 de Alibaba, orientada a tareas de imagen-texto-a-texto (image-text-to-text), y esta versión comprimida reduce el peso de los pesos de 4,236 GiB (FP16) a 3,311 GiB manteniendo una precisión prácticamente idéntica en las pruebas realizadas por el autor.

La cuantización se ha generado con llm-compressor 0.14.0 y se guarda en formato compressed-tensors 0.19.0, aplicando el esquema FP8_DYNAMIC a 96 capas lineales del componente lingüístico. Los pesos usan escala estática por canal de salida y las activaciones escala dinámica por token, sin necesidad de datos de calibración. Las capas visuales, linear_attn, lm_head y el resto de componentes no objetivo se mantienen en precisión flotante, y la caché KV conserva la configuración por defecto del motor de inferencia.

El interés de esta ficha radica en que ofrece una alternativa de despliegue de bajo coste para un modelo multimodal de 2,21 mil millones de parámetros con licencia Apache-2.0, verificada sobre una GPU de consumo (RTX 4090 D) con vLLM 0.32.0 y kernels CUTLASS FP8. Es relevante para quienes necesitan servir modelos de visión-lenguaje en hardware limitado sin renunciar a la precisión del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capas de atención lineal (linear_attn) y componente visual; detalles completos no disponibles |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de inferencia limita max_model_len a 4096) |
| Tipos de cuantizacion | FP8 dinámico (FP8_DYNAMIC) sobre 96 capas lineales del componente lingüístico; capas visuales, linear_attn y lm_head en flotante |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors con configuración compressed-tensors 0.19.0 |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un transformer multimodal que procesa entradas de imagen y texto y genera texto; la model card de esta cuantización menciona explícitamente capas `visual`, `linear_attn` y `lm_head`, lo que confirma la presencia de un codificador visual y de mecanismos de atención lineal dentro del bloque lingüístico. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

La innovación técnica de esta publicación es el proceso de cuantización: se aplica FP8_DYNAMIC únicamente a las 96 capas lineales del componente de lenguaje, dejando el resto de módulos en precisión original para preservar la calidad. El esquema combina escala estática por canal de salida para los pesos y escala dinámica por token para las activaciones, y no requiere datos de calibración. El checkpoint resultante se carga con vLLM 0.32.0 usando kernels CUTLASS FP8 y el formato compressed-tensors, y el autor documenta el comando de reproducción (`python run.py quantize --tool llmcompressor --method fp8 --stage full`) junto con recipe.yaml y SHA256SUMS.

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque en el ejemplo publicado se desactiva la entrada multimodal con `limit_mm_per_prompt={"image": 0, "video": 0}`.
- Razonamiento aritmético básico verificado en GSM8K (el ejemplo de la model card plantea un problema de suma).
- Modo thinking potencial: la model card indica que no se pasa `enable_thinking` para conservar el comportamiento por defecto de la plantilla del checkpoint, lo que sugiere que el modelo base dispone de ese mecanismo.
- Compatibilidad con decodificación greedy determinista (temperature=0.0, top_p=1.0, top_k=-1) y con parámetros de sampling estándar.
- Soporte de tool calling, function calling y comportamiento agéntico: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card está redactada en chino y el prompt de ejemplo también, pero no se documenta la cobertura de idiomas.

## Casos de uso

- Inferencia de visión-lenguaje en GPU de consumo: el checkpoint ocupa 3,311 GiB de pesos y el autor lo valida en una RTX 4090 D con vLLM, por lo que sirve para prototipos de descripción de imágenes o VQA en estaciones de trabajo con una sola GPU.
- Razonamiento aritmético y resolución de problemas de primaria: el modelo alcanza un 70,00 % de acierto en las primeras 100 preguntas de GSM8K con generación greedy, adecuado para asistentes educativos de baja latencia.
- Servicio de chat con contexto moderado: el ejemplo configura max_model_len=4096 y max_num_seqs=1, apropiado para APIs internas con pocas peticiones concurrentes y respuestas de hasta 1024 tokens.
- Despliegue con huella de memoria reducida: frente al FP16, los pesos bajan un 21,8 % (de 4,236 a 3,311 GiB), lo que permite liberar VRAM para caché KV u otras cargas en el mismo servidor.
- Evaluación comparativa de técnicas de cuantización: al incluir resultados de FP16, FP8 Dynamic y FP8 Block128 sobre el mismo conjunto, sirve como referencia para decidir el esquema de compresión en pipelines propios con llm-compressor.
- Reproducción de pipelines de compresión: el repositorio incluye recipe.yaml, config.json y SHA256SUMS, de modo que se puede auditar y replicar el proceso de cuantización en otras variantes de la familia Qwen3.5.
- Integración en flujos offline: la model card documenta el modo offline (`HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1`), útil para entornos aislados o sin acceso a Hugging Face Hub.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre las primeras 100 preguntas de GSM8K, generación greedy, máximo 1024 tokens nuevos, ejecución secuencial de una sola petición en RTX 4090 D con vLLM 0.32.0:

| Modelo | Aciertos | Precisión | Tasa parseable | Tasa de tope | Tokens/s en serie | Pico asignado (GiB) | Pico reservado (GiB) | Pesos (GiB) | Archivos cargados (GiB) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FP16 | 71/100 | 71,00 % | 92,00 % | 7,00 % | 55,823 | 17,268 | 17,324 | 4,236 | 4,257 |
| FP8 Dynamic | 70/100 | 70,00 % | 97,00 % | 2,00 % | 47,499 | 17,113 | 17,121 | 3,311 | 3,330 |
| FP8 Block128 | 72/100 | 72,00 % | 95,00 % | 4,00 % | 44,134 | 17,283 | 17,334 | 3,310 | 3,329 |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el autor reporta un pico asignado de 17,113 GiB y un pico reservado de 17,121 GiB con vLLM, max_model_len=4096, max_num_seqs=1 y gpu_memory_utilization=0.75. Los pesos ocupan 3,311 GiB; el resto corresponde a caché KV, activaciones y overhead del motor.
- GPU valatada por el autor: RTX 4090 D (GPU de consumo), con kernels CUTLASS FP8. No se documentan pruebas en A100, H100 ni otras GPU.
- Cabe en GPU de consumo: sí, según la validación en RTX 4090 D; no se dispone de datos para GPUs con menos VRAM.
- Opciones de despliegue: vLLM 0.32.0 con soporte de compressed-tensors es el motor documentado. No se mencionan llama.cpp, Ollama ni TGI; el campo `inference: false` de la model card no impide el uso con vLLM según el ejemplo publicado.
- Latencia y throughput: 47,499 tokens/s en serie con FP8 Dynamic frente a 55,823 tokens/s en FP16 (aproximadamente un 15 % menos de throughput) y 44,134 tokens/s con FP8 Block128, en régimen de una sola petición secuencial.
- Configuración recomendada por el autor: `dtype="float16"`, `tensor_parallel_size=1`, `enforce_eager=True`, `max_num_seqs=1`, `enable_prefix_caching=False`, `trust_remote_code=False`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos | Precisión GSM8K (100 primeras) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-FP8-Dynamic (este) | 2,21 B | no disponible (ejemplo a 4096) | 3,311 GiB | 70,00 % | Apache-2.0 | Hugging Face y ModelScope |
| Qwen3.5-2B en FP16 (referencia del autor) | 2,21 B | no disponible | 4,236 GiB | 71,00 % | Apache-2.0 | Hugging Face (modelo base) |
| Qwen3.5-2B en FP8 Block128 (referencia del autor) | 2,21 B | no disponible | 3,310 GiB | 72,00 % | Apache-2.0 | No publicada como checkpoint en la información disponible |
| Otras alternativas de 2-3 B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantización FP8 Dynamic reduce la precisión en 1 punto porcentual respecto a FP16 en GSM8K (70,00 % frente a 71,00 %), aunque mejora la tasa parseable (97,00 % frente a 92,00 %) y reduce la tasa de tope (2,00 % frente a 7,00 %).
- El throughput en serie cae aproximadamente un 15 % respecto a FP16 (47,499 frente a 55,823 tokens/s), por lo que la ganancia es de memoria, no de velocidad.
- El autor no registró el commit upstream utilizado para la cuantización, lo que limita la trazabilidad exacta del proceso.
- La validación se limita a 100 preguntas de GSM8K en una única GPU y con una sola petición concurrente; no hay datos de cargas concurrentes, contextos largos ni entradas multimodales reales.
- No se documentan sesgos conocidos, riesgo de alucinación específico, idiomas soportados ni limitaciones de contexto del modelo base en la información disponible.
- El pipeline declarado es image-text-to-text, pero el ejemplo publicado desactiva explícitamente las entradas de imagen y vídeo (`limit_mm_per_prompt={"image": 0, "video": 0}`), de modo que el rendimiento multimodal no está verificado en esta ficha.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar las condiciones del checkpoint original Qwen/Qwen3.5-2B.
- El repositorio tiene 25 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación de terceros sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wkhaifor/Qwen3.5-2B-FP8-Dynamic-LLMCompressor
- Perfil del autor: https://huggingface.co/wkhaifor
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio espejo en ModelScope: https://www.modelscope.cn/models/kfcVme50/Qwen3.5-2B-FP8-Dynamic-LLMCompressor
- Licencia: https://huggingface.co/wkhaifor/Qwen3.5-2B-FP8-Dynamic-LLMCompressor/blob/main/LICENSE
- Receta de cuantización: https://huggingface.co/wkhaifor/Qwen3.5-2B-FP8-Dynamic-LLMCompressor/blob/main/recipe.yaml
- Configuración: https://huggingface.co/wkhaifor/Qwen3.5-2B-FP8-Dynamic-LLMCompressor/blob/main/config.json
- Sumas de verificación: https://huggingface.co/wkhaifor/Qwen3.5-2B-FP8-Dynamic-LLMCompressor/blob/main/SHA256SUMS
