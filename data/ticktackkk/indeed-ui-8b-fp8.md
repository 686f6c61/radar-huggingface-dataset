# ticktackkk/Indeed-UI-8B-FP8

## Resumen

Indeed-UI-8B-FP8 es una versión cuantizada en FP8 del modelo Indeed-UI-8B, un modelo de grounding de interfaz gráfica (GUI grounding) desarrollado por IntellgenceIndeed. Su tarea principal es predecir una coordenada de clic a partir de una instrucción en lenguaje natural y una captura de pantalla, lo que lo convierte en la pieza de percepción de un agente de interfaz de usuario. El autor de esta build cuantizada es el usuario de Hugging Face ticktackkk.

El modelo se apoya en la arquitectura `Qwen3VLForConditionalGeneration` (`qwen3_vl`) con 8.767.123.696 parámetros, y a su vez es un fine-tune mejorado de GUI-Owl 1.5-8B. La cuantización FP8 reduce el peso de los pesos de 16,33 GiB a 9,87 GiB, lo que permite desplegarlo en tarjetas de 16–24 GB sin pérdida de precisión en el conjunto de evaluación de clic del autor.

Es relevante ahora porque los agentes que operan interfaces necesitan modelos de grounding ligeros y desplegables en una sola GPU, y esta build demuestra empíricamente que la cuantización FP8 es neutra en precisión para esta tarea concreta (mismos aciertos que la versión BF16 en 100 de 102 casos). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (`qwen3_vl`), transformer multimodal vision-language |
| Parametros totales | 8.767.123.696 (8,77B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--max-model-len 8192` |
| Tipos de cuantizacion | FP8 (W8A8, `FP8_DYNAMIC` de compressed-tensors): pesos FP8 e4m3 por canal de salida simétricos, activaciones dinámicas por token; vision tower, `lm_head`, `embed_tokens` y normas en BF16 |
| Idiomas soportados | zh, en |
| Licencia | `other` / `see-attribution`; el repositorio base no declara licencia, por lo que esta derivada hereda la misma ambigüedad |
| Formato de pesos | safetensors, librería vllm, compressed-tensors |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3-VL que combina una torre de visión (27 bloques ViT más deepstack mergers, merger y patch_embed) con un LLM de 36 capas. La cuantización se aplica a 252 tensores del LLM (q/k/v/o y gate/up/down de las 36 capas) en FP8 e4m3 con escala `max(|W|, dim=in)/448`, mientras que los 168 tensores de la torre de visión, el `lm_head`, los embeddings y todas las normas se mantienen en BF16 de forma deliberada: la precisión del grounding depende de features visuales finas y de la cabeza que emite coordenadas. El esquema es data-free, sin conjunto de calibración.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la model card proporcionada. El linaje declarado es GUI-Owl 1.5-8B mejorado por IntellgenceIndeed; la build FP8 no reentrena, solo cuantiza. La innovación técnica destacable es la evaluación controlada de neutralidad de la cuantización: comparación por caso contra BF16 con coincidencia exacta de coordenadas en 45 de 102 casos y diferencia mediana de 2 unidades (≈2 px) en el resto.

## Capacidades

- Grounding de GUI: predice una coordenada de clic (`point_2d`, normalizada 0–1000) para una instrucción en lenguaje natural sobre una captura de pantalla.
- Comprensión de imagen y texto (`image-text-to-text`) con backbone Qwen3-VL.
- Salida estructurada en JSON (`{"point_2d": [x, y]}`) y manejo de elemento no visible (`{"point_2d": null}`).
- Soporte multilingüe limitado a chino e inglés.
- Orientado a agentes de UI de un solo paso (percepción y localización); no se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo thinking.
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso

- Automatización de pruebas de UI: dado un caso de test y una captura, el modelo localiza el elemento objetivo y devuelve coordenadas para que el runner de pruebas haga clic, sustituyendo selectores frágiles por grounding visual.
- Agentes de operación de aplicaciones móviles: integrado en un bucle de agente, el modelo resuelve el paso de "dónde pulsar" a partir de la instrucción del usuario y la pantalla actual, con latencia de ~861 ms por petición en una sola GPU.
- RPA asistida por lenguaje natural: un operador describe la acción ("pulsa el botón de me gusta") y el modelo traduce la intención a una coordenada sobre la pantalla, reduciendo la necesidad de mantener localizadores por aplicación.
- Asistencia a accesibilidad: localizar controles descritos por el usuario sobre capturas para guiar interacciones o generar descripciones accionables de la interfaz.
- Etiquetado y anotación de datasets de GUI: usar el modelo para preanotar cajas o puntos de clic sobre capturas y acelerar la revisión humana, aprovechando la salida JSON normalizada.
- Despliegue en una sola GPU de 16–24 GB: al ocupar ~10 GiB de pesos, cabe junto al KV cache en tarjetas consumer con FP8 nativo (RTX 4090, RTX 5090), lo que permite prototipar agentes de UI en estaciones de trabajo sin clúster.
- Enrutado de clics en asistentes de escritorio o móvil: como componente de percepción de un pipeline mayor que decide la siguiente acción a partir de la coordenada devuelta.

## Benchmarks y rendimiento

Evaluación del autor sobre 102 casos de clic con capturas de una UI sintética tipo TikTok (54 pantallas, cajas ground-truth a 1080×1920). Un acierto significa que el punto predicho cae dentro de la caja anotada.

| Build | Aciertos | Subconjunto limpio (97) | Latencia mediana |
|---|---:|---:|---:|
| BF16 (vLLM 0.11.0) | 89/102 · 87,3% | 89/97 · 91,8% | 855 ms |
| FP8 (este repo, vLLM 0.11.0) | 89/102 · 87,3% | 89/97 · 91,8% | 861 ms |

Comparación por caso contra BF16: veredicto idéntico en 100/102 casos, coincidencia exacta de coordenadas en 45/102 y diferencia mediana de 2 unidades (≈2 px) en el resto; ningún caso pasó de correcto a incorrecto por la cuantización.

Cifras reportadas por el modelo base en su propia model card (no reproducidas aquí): ScreenSpot-Pro 73,4; ScreenSpot-V2 94,4; OSWorld-G 68,3.

## Requisitos de hardware

- VRAM de pesos: ~10 GiB (9,87 GiB). Una tarjeta de 16 GB es suficiente; 24 GB dejan margen para KV cache.
- FP8 nativo requiere compute capability ≥ 8,9: RTX 4090 / 4090D (Ada 8.9) y RTX 5090 (Blackwell 12.0) lo soportan.
- A100 / A800 (Ampere 8.0) y RTX 3090 (Ampere 8.6) no tienen FP8 nativo: usar la build BF16.
- Despliegue documentado con vLLM 0.11.0, `transformers==4.57.3`, `tokenizers==0.22.2` y `huggingface-hub<1.0`; `VLLM_FLASH_ATTN_VERSION=2` y `--limit-mm-per-prompt '{"image":1}'`.
- Latencia de una sola petición: ~861 ms mediana en la evaluación del autor; el comportamiento con batching no está caracterizado.
- No se documentan opciones de despliegue con llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Grounding GUI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indeed-UI-8B-FP8 (este) | 8,77B | no disponible (ejemplo a 8192) | 87,3% hit@box en set propio de 102 casos | `see-attribution`, ambigua | Hugging Face, vllm |
| Indeed-UI-8B (BF16) | 8,77B | no disponible | 87,3% hit@box en el mismo set | no declarada | ModelScope |
| GUI-Owl 1.5-8B | no disponible | no disponible | no disponible | no disponible | upstream del linaje |

No se dispone de datos de benchmarks comparables de terceros (ScreenSpot, ScreenSpot-Pro) reproducidos para esta build; las cifras del modelo base son las reportadas por su propia card.

## Limitaciones y advertencias

- Evaluación sobre un único conjunto sintético de UI tipo TikTok (102 prompts / 54 capturas); no sustituye a un benchmark amplio de GUI como ScreenSpot.
- Las coordenadas son normalizadas 0–1000 y sensibles al manejo de la relación de aspecto: redimensionar las capturas explícitamente en lugar de confiar en escalado implícito.
- Solo se caracteriza la latencia de una petición; el comportamiento con batching no está medido.
- Idiomas limitados a chino e inglés.
- Licencia ambigua: el repositorio base no declara licencia y esta derivada hereda la misma incertidumbre; aclarar con los autores upstream antes de redistribuir o usar comercialmente.
- Riesgo de alucinación de coordenadas cuando el elemento no está presente; el prompt de ejemplo mitiga con `{"point_2d": null}`, pero no se documenta su fiabilidad.
- Sin datos publicados sobre sesgos.
- Requiere GPU con FP8 nativo (≥ 8,9) para aprovechar la build; en Ampere hay que usar BF16.
- Dependencia estricta de versiones (vLLM 0.11.0 con transformers 4.57.3); transformers 5.x rompe la carga con `Qwen2Tokenizer has no attribute all_special_tokens_extended`.

## Enlaces

- Hugging Face: https://huggingface.co/ticktackkk/Indeed-UI-8B-FP8
- Modelo base en ModelScope: https://www.modelscope.cn/models/IntellgenceIndeed/Indeed-UI-8B
- Repositorio de vLLM (dependencia de despliegue): https://github.com/vllm-project/vllm
- compressed-tensors (esquema de cuantización): https://github.com/neuralmagic/compressed-tensors
- Qwen3-VL (arquitectura backbone): no disponible en la información proporcionada
- GUI-Owl 1.5 (linaje upstream): no disponible en la información proporcionada
