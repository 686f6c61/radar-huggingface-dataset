# Weyaxi/Kimi-K3-NVFP4-W4A4

## Resumen

Kimi-K3-NVFP4-W4A4 es una cuantización del modelo Kimi-K3 de Moonshot AI, un MoE híbrido de 2,8 billones de parámetros (2.779.931.837.184) con arquitectura KDA+MLA y contexto de 1 millón de tokens. Esta versión, creada por Weyaxi, aplica cuantización NVFP4 W4A4 a los expertos enrutados y ofrece una receta opcional para cuantizar también la atención y los expertos compartidos a FP8, reduciendo el checkpoint a aproximadamente 1,65 TB. El modelo base ya es nativamente 4-bit (MXFP4), por lo que esta requantización no supone una ganancia de ancho de banda, pero sí demuestra que es posible cuantizar un modelo ya 4-bit sin pérdida de calidad, y ofrece mejoras de latencia por flujo bajo saturación.

La relevancia de este checkpoint radica en que es, según el autor, el primero que cuantiza la atención y los expertos compartidos de K3, y en que incluye un parche necesario para vLLM 0.28.0 que corrige un error en la composición de la escala de activación SITU. Está pensado para despliegue en clústeres de GPUs de alta gama (8×B300) y para cargas de trabajo donde la latencia por petición bajo saturación es crítica, como agentes o RAG con caché.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido KDA+MLA (Kimi Delta Attention + Multi-head Latent Attention) con Attention Residuals |
| Parametros totales | 2.779.931.837.184 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 W4A4 (expertos enrutados); receta opcional para FP8 en atención y expertos compartidos |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (MIT modificada) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Kimi-K3 es un MoE híbrido que combina Kimi Delta Attention (KDA) con Multi-head Latent Attention (MLA) y Attention Residuals (AttnRes). Es un modelo de 2,8 billones de parámetros con visión nativa y contexto de 1M tokens, entrenado para tareas de codificación de largo horizonte, uso de herramientas y trabajo de conocimiento. No se dispone de detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) en la información proporcionada.

La cuantización se realizó con llm-compressor, aplicando NVFP4 W4A4 a los expertos enrutados. Posteriormente, mediante scripts incluidos en el repositorio, se cuantizan 579 tensores de atención y 279 tensores de expertos compartidos a FP8 W8A8-dynamic, manteniendo en BF16 los tensores `kv_b_proj` y `o_proj` (117 tensores) porque reciben activaciones ya FP8 y no existe un kernel genérico que las acepte. El autor reporta que tras ambos pasos la calidad se mantiene exacta frente al baseline BF16: GSM8K-platinum 99.00 (n=200, 0 errores), tool-calling 60/60 y needle 36/36 en 32k/80k/120k.

## Capacidades

- Generación de texto y razonamiento matemático: obtiene 99.00 en GSM8K-platinum (n=200, 0 errores).
- Tool calling / function calling: 60/60 en pruebas de tool-calling, con parser específico `kimi_k3`.
- Razonamiento multi-step y modo agente: soporta `--enable-auto-tool-choice` y `--reasoning-parser kimi_k3` en vLLM.
- Contexto largo: mantiene precisión en pruebas de aguja en ventanas de 32k, 80k y 120k tokens.
- Decodificación especulativa: compatible con el modelo draft `Inferact/Kimi-K3-DSpark` (método dspark, 7 tokens especulativos).
- Multilingüismo: no especificado en la documentación de esta cuantización.
- Visión: el modelo base es multimodal, pero esta cuantización se sirve con `--limit-mm-per-prompt '{"image":0,"video":0}'`, por lo que no se soporta entrada de imágenes o vídeo en esta versión.

## Casos de uso

- Atención al cliente automatizada con contexto largo: gracias a la ventana de 1M tokens, puede gestionar conversaciones multi-turno con historial extenso y documentos de soporte, manteniendo coherencia y recuperando información relevante sin perder el hilo.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código en repositorios grandes, con capacidad de razonar sobre múltiples archivos.
- Agentes autónomos para tareas de conocimiento: con soporte de auto-tool-choice y razonamiento multi-step, puede orquestar llamadas a APIs, consultar bases de datos y ejecutar flujos de trabajo complejos de forma autónoma.
- Análisis y resumen de documentos largos: procesa libros técnicos, informes financieros o expedientes legales completos en una sola pasada, extrayendo conclusiones y respondiendo preguntas específicas sobre el contenido.
- RAG con caché de prefijo: la cuantización mantiene un rendimiento competitivo en cargas de trabajo cache-heavy (0.87× frente al nativo en throughput agregado), lo que la hace adecuada para sistemas de recuperación aumentada con alta tasa de aciertos de caché.
- Investigación y razonamiento matemático: con resultados perfectos en GSM8K-platinum, puede utilizarse como motor de razonamiento para problemas matemáticos avanzados, verificación de pruebas o generación de soluciones paso a paso.

## Benchmarks y rendimiento

El autor proporciona mediciones de calidad y rendimiento comparativas con el modelo nativo (también cuantizado MXFP4) en el mismo entorno (8×B300, vLLM 0.28 con parche). No se han publicado resultados de benchmarks estándar como MMLU o HumanEval en la información disponible.

**Calidad (frente al baseline BF16-activation):**

| Prueba | Resultado |
|---|---|
| GSM8K-platinum (n=200) | 99.00 (0 errores) |
| Tool-calling | 60/60 |
| Needle (32k/80k/120k) | 36/36 |

**Rendimiento (quant vs nativo, mismo nodo 8×B300):**

| Carga de trabajo | Ratio quant/nativo |
|---|---|
| Per-stream pacing (TPOT) bajo saturación, c=128 | 1.05–1.13× (quant) |
| Texto real ShareGPT, c=128 | 0.95–1.01× agregado, TPOT 1.08× (quant) |
| Throughput agregado estándar | 0.89–0.97× (nativo) |
| Decodificación por lotes c=64–128, n=8 | 0.70–0.85× (nativo) |
| Cache-heavy agentic / RAG | 0.87× / 0.97× (nativo) |
| Rate-paced 3–7 req/s | nativo en todas las tasas |
| Pool de KV | −8.7% (nativo) |

## Requisitos de hardware

- El checkpoint cuantizado ocupa aproximadamente 1,65 TB, por lo que requiere un clúster multi-GPU con al menos 8 GPUs de alta gama.
- El comando de referencia usa 8×B300 (GPU Blackwell, SM103) con tensor-parallel-size 8 y gpu-memory-utilization 0.92, lo que implica ~2,3 TB de VRAM combinada.
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en estaciones de trabajo convencionales.
- Despliegue recomendado con vLLM 0.28.1 o superior (incluye el fix del PR #53132). Para vLLM 0.28.0 o inferior, es obligatorio aplicar el parche `recipe/vllm-0.28.0-situ-scale-fix.patch` o usar `--kernel-config '{"moe_backend":"marlin"}'` (con degradación de velocidad).
- Soporta decodificación especulativa con el modelo draft `Inferact/Kimi-K3-DSpark` (método dspark, 7 tokens especulativos).
- No se menciona soporte para llama.cpp, Ollama o TGI en la documentación.

## Comparativa con modelos similares

La comparativa más directa es con el modelo nativo Kimi-K3 (que ya es 4-bit MXFP4). No se dispone de datos de otras cuantizaciones de K3 ni de modelos comparables de tamaño similar en la información proporcionada.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Kimi-K3 (nativo) | 2.8T | 1M | MXFP4 (nativo 4-bit) | modified-mit | Mejor throughput agregado y decode por lotes |
| Kimi-K3-NVFP4-W4A4 (este) | 2.8T | 1M | NVFP4 W4A4 + FP8 opcional | modified-mit | Mejor TPOT bajo saturación, calidad idéntica |

## Limitaciones y advertencias

- Requiere vLLM 0.28.1+ o aplicar un parche manual; sin él, el modelo produce salidas basura en la ruta FP4 por defecto.
- El rendimiento agregado es ligeramente inferior al nativo (0.89–0.97×) en cargas de trabajo estándar; solo gana en latencia por flujo bajo saturación.
- No soporta entrada de imágenes o vídeo en esta cuantización, aunque el modelo base sí es multimodal.
- La licencia es una MIT modificada; es necesario revisar las cláusulas adicionales antes de uso comercial.
- El tamaño del checkpoint (~1,65 TB) y los requisitos de hardware (8×B300) limitan su despliegue a entornos con infraestructura de alta gama.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para esta cuantización; solo se dispone de las pruebas internas del autor.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM; no se ha evaluado específicamente en esta versión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Weyaxi/Kimi-K3-NVFP4-W4A4
- Modelo base en HuggingFace: https://huggingface.co/moonshotai/Kimi-K3
- GitHub de MoonshotAI/Kimi-K3: https://github.com/MoonshotAI/Kimi-K3
- Página oficial de Kimi K3: https://www.kimi.ai/ai-models/kimi-k3
- NVIDIA NIM para Kimi-K3: https://build.nvidia.com/moonshotai/kimi-k3
