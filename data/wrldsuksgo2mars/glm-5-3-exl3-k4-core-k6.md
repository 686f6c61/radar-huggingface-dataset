# wrldsuksgo2mars/GLM-5.3-EXL3-K4-Core-K6

## Resumen

GLM-5.3-EXL3-K4-Core-K6 es una cuantización de la release completa en BF16 del modelo zai-org/GLM-5.3-BF16, publicada por el usuario wrldsuksgo2mars. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a reducir el coste de almacenamiento y despliegue del modelo original, empleando el formato EXL3 (ExLlamaV3) con precisión mixta: K6 para las matrices de atención y FFN densas, y K4 para los expertos enrutados del bloque MoE. El resultado ocupa 358,90 GiB de payload tensorial frente a los 1403,19 GiB del checkpoint BF16 de origen, es decir, una reducción de aproximadamente el 74 % en bytes de tensores.

El modelo conserva la arquitectura nativa del GLM-5.3 (identificada en los tags como `glm_moe_dsa`, es decir, un transformer con mezcla de expertos y atención dispersa DSA), así como el tokenizador, los activos de generación y la licencia originales. La cuantización se realizó sobre el checkpoint BF16 fijado en el commit `9d2398f478cab2de883137db3a36ad2c96205e24`, no sobre la versión block-FP8 usada por una cuantización K4 anterior. El repositorio contiene 80 shards y 236.354 tensores, con un total de 192.681.138.816 parámetros declarados en los safetensors.

La relevancia de esta ficha radica en que permite evaluar si un modelo de casi 193.000 millones de parámetros puede servirse en hardware de una sola GPU profesional con 96 GB de VRAM, como la RTX PRO 6000 Blackwell Max-Q empleada por el autor durante el proceso de cuantización. No obstante, el propio autor advierte de que no se han realizado pruebas de generación completa, calidad en contexto largo ni rendimiento de serving, por lo que se trata de un artefacto de pesos verificados numéricamente pero no validados funcionalmente de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y atención dispersa DSA; tag `glm_moe_dsa` |
| Parametros totales | 192.681.138.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 MCG K6 (atención q_a/q_b/kv_a/o, FFN compartida/densa y cabeza), EXL3 MCG K4 (expertos enrutados gate/up/down y MTP), BF16/F32 nativo retenido (kv_b, indexador DSA, embeddings, routers y norms) |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (license: other, con license_name glm-5.3) |
| Formato de pesos | safetensors (80 shards, 236.354 tensores) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-BF16 emplea una arquitectura de transformer con mezcla de expertos (MoE) y atención dispersa DSA, según el tag `glm_moe_dsa` del repositorio. La cuantización preserva la arquitectura nativa, el tokenizador y los activos de generación; el modelo incluye además un módulo MTP (multi-token prediction) nativo cuyas matrices de atención, FFN compartida y `eh_proj` también han sido cuantizadas en K4. La atención MLA mantiene su salida lógica de 576 canales, almacenada en 640 para transformaciones completas de 128 canales antes del recorte lógico.

El proceso de cuantización utilizó 1.426 prompts (1.097.737 tokens nativos de GLM) del dataset `wrldsuksgo2mars/agentic-quant-panel-v1`, renderizados con la plantilla nativa de GLM con thinking activado y esfuerzo de razonamiento máximo. Se empleó una pasada causal intercalada que propaga los predecesores serializados y reconstruidos antes de calibrar cada sucesor, con captura de gate/up antes de la no linealidad y de la entrada de down, y retención exacta del estado top-k de la DSA compartida. El multiplicador MCG es `0xCBAC1FED`, con semilla 787, sigma 0.025 y escalas de salida automáticas, sin redondeo de codebook E4M3. La cuantización se ejecutó en una única RTX PRO 6000 Blackwell Max-Q, y cada tensor retenido se comparó byte a byte con la fuente BF16.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del GLM-5.3 base, incluyendo modo thinking y esfuerzo de razonamiento configurable a través de la plantilla nativa de chat.
- Razonamiento multi-paso: el módulo MTP nativo permite decodificación especulativa y predicción de múltiples tokens, lo que puede acelerar la generación en runtimes compatibles.
- Mezcla de expertos: 58.368 matrices de expertos enrutados (gate/up/down) más las del MTP, lo que implica un cómputo activo muy inferior al total de parámetros.
- Atención dispersa DSA: el indexador DSA se conserva en BF16 nativo, lo que preserva el mecanismo de selección dispersa de tokens.
- Tool calling y uso de agentes: no confirmado explícitamente en la información disponible, aunque el dataset de calibración (`agentic-quant-panel-v1`) sugiere orientación a cargas agénticas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de ~193.000 millones de parámetros en una sola GPU profesional: con 358,90 GiB de payload tensorial, el checkpoint requiere un entorno con suficiente VRAM y soporte de EXL3; encaja en configuraciones de una RTX PRO 6000 Blackwell (96 GB) solo si el runtime aplica offloading o si se dispone de varias GPU, por lo que el caso realista es servir el modelo en un nodo multi-GPU con EXL3.
- Evaluación comparativa de cuantizaciones: útil para investigar la degradación de calidad entre BF16, FP8 y EXL3 K4/K6 sobre el mismo modelo base, ya que el repositorio incluye evidencias de error por capa en `quantization-errors/*.jsonl`.
- Investigación sobre atención dispersa DSA: al retener el indexador DSA en BF16 y el estado top-k exacto durante la calibración, el checkpoint sirve para estudiar el comportamiento de la selección dispersa sin la distorsión de una cuantización agresiva en ese componente.
- Serving de agentes con decodificación especulativa: el MTP nativo cuantizado en K4 permite experimentar con generación multi-token en pipelines agénticos donde la latencia de decodificación es crítica.
- Reproducibilidad de recetas de cuantización: los hashes de receta y entrada en `quantization-provenance.json` permiten replicar el proceso en otro hardware y comparar resultados numéricos.
- Fine-tuning o adaptación posterior (LoRA/QLoRA): el formato safetensors con `quantize_config.json:tensor_storage` documenta el ancho de bits por módulo, lo que facilita integrar adaptadores sobre las capas retenidas en BF16.
- Benchmarking de runtimes EXL3: el checkpoint mixto K4/K6 exige un runtime que soporte MCG estándar mixto y componentes BF16 retenidos, por lo que es un caso de prueba para validar implementaciones de ExLlamaV3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se han realizado pruebas de generación completa, calidad en contexto largo ni rendimiento de serving. Solo se documentan métricas de compresión y verificación numérica:

| Metrica | Valor |
|---|---|
| Payload tensorial BF16 origen | 1403,186 GiB |
| Payload tensorial cuantizado | 358,897 GiB |
| Reduccion de payload | ~74,4 % |
| Matrices en K6 (atencion, FFN densa, cabeza) | 547 (30,154 GiB → 11,341 GiB) |
| Matrices en K4 (expertos enrutados + MTP) | 58.368 + 8 (1368,000 GiB → 342,891 GiB; 0,491 → 0,123 GiB) |
| Tensores retenidos en BF16/F32 | 662 (4,542 GiB) |
| Tamano total del repo | 385,5 GB |
| Shards / tensores | 80 / 236.354 |

## Requisitos de hardware

- VRAM estimada para inferencia: el payload tensorial es de 358,90 GiB; a ello hay que sumar overhead de headers, metadata y estados de runtime, por lo que se necesita un entorno con al menos ~360 GB de memoria de GPU o una combinación de GPU y offloading.
- GPU recomendadas: el autor realizó la cuantización en una RTX PRO 6000 Blackwell Max-Q (96 GB). Para servir el modelo completo se requieren configuraciones multi-GPU (por ejemplo, 4× H100 80 GB, 4× A100 80 GB o 4× RTX PRO 6000) o bien offloading a memoria del sistema.
- Cabe en consumer GPU: no. Ninguna GPU de consumo (RTX 4090 24 GB, RTX 5090 32 GB) puede alojar el checkpoint completo; solo sería viable con cuantizaciones adicionales más agresivas no publicadas en este repositorio.
- Opciones de despliegue: requiere un runtime compatible con EXL3 (ExLlamaV3) que soporte MCG mixto K4/K6 y componentes BF16 retenidos. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles; el autor no ha realizado pruebas de serving.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-EXL3-K4-Core-K6 (este) | 192.681.138.816 | no disponible | safetensors EXL3 mixto K4/K6 | glm-5.3 | HuggingFace, 70 descargas |
| zai-org/GLM-5.3-BF16 (base) | no disponible en la informacion | no disponible | safetensors BF16 | glm-5.3 | HuggingFace (modelo oficial) |
| Cuantizacion K4-v1 previa (mencionada en la model card) | no disponible | no disponible | EXL3 K4 sobre block-FP8 | glm-5.3 | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No se han realizado pruebas de generación completa, calidad en contexto largo ni rendimiento de serving; el checkpoint está verificado numéricamente pero no validado funcionalmente de extremo a extremo.
- La cuantización K4 en los expertos enrutados puede introducir degradación de calidad frente al BF16 original; las evidencias de error por capa están en `quantization-errors/*.jsonl`, pero no se ofrece una evaluación agregada de perplejidad o benchmarks.
- El runtime debe soportar MCG mixto K4/K6 y componentes BF16 retenidos; no se indica compatibilidad con las herramientas de serving más habituales (vLLM, llama.cpp, Ollama, TGI).
- La licencia es `glm-5.3` (license: other), por lo que las restricciones de uso comercial dependen del texto de la licencia del modelo base, no incluido en esta información; es necesario revisar el enlace de licencia antes de un uso en producción.
- El repositorio tiene 70 descargas y 0 likes, lo que indica una adopción muy limitada y ausencia de validación por parte de la comunidad.
- Los sesgos conocidos del modelo base no se documentan en la información disponible.
- Riesgo de alucinación: no cuantificado en esta información; debe asumirse el comportamiento del GLM-5.3 base, no evaluado aquí.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- El proceso de cuantización se ejecutó en una única GPU, y el autor no documenta pruebas de reproducibilidad en otro hardware.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-EXL3-K4-Core-K6
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16
- Commit del modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16/tree/9d2398f478cab2de883137db3a36ad2c96205e24
- Licencia: https://huggingface.co/zai-org/GLM-5.3-BF16/blob/9d2398f478cab2de883137db3a36ad2c96205e24/LICENSE
- Dataset de calibracion: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
- Commit del dataset: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1/tree/875ff1d3786bf4346ee7ff52ea5e3f1f698f5902
