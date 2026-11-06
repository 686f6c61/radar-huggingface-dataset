# thatvector/gemma-4-26B-A4B-it-heretic-FP8-Static-Sharded

## Resumen

Gemma 4 26B A4B IT Heretic FP8 Static Sharded es una cuantización estática en FP8 del modelo `coder3101/gemma-4-26B-A4B-it-heretic`, un derivado afinado de la familia Gemma 4 en su variante 26B con arquitectura de mezcla de expertos (MoE). El modelo base incorpora una torre de visión para entrada de imagen y texto, por lo que el pipeline declarado es `image-text-to-text`. Esta versión la publica el usuario `thatvector` con el objetivo explícito de maximizar el rendimiento de inferencia en GPUs NVIDIA con núcleos tensoriales FP8 (arquitecturas Hopper y Blackwell), manteniendo intactas las capacidades multimodales.

La relevancia de esta ficha es doble. Por un lado, muestra un patrón de cuantización híbrida poco habitual: se cuantizan en FP8 (W8A8, escalado estático) las capas densas de atención y feedforward del LLM, pero se restauran en bfloat16 la torre de visión y los routers de los expertos MoE, que son sensibles a la precisión. Por otro, el sufijo "heretic" del modelo base indica un ajuste orientado a reducir los rechazos y el comportamiento de censura del modelo original, lo que tiene implicaciones directas para su uso en producción y para la evaluación de riesgos.

El repositorio ocupa 50 GB y contiene 25.805.935.054 parámetros (unos 25,8 mil millones). La model card no detalla el número de parámetros activos por token, el contexto nativo del modelo base ni los idiomas soportados; el comando de despliegue de vLLM sí fija `--max-model-len 131072`, es decir, 128K tokens de ventana efectiva en esa configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y torre de visión; familia Gemma 4 |
| Parametros totales | 25.805.935.054 (25,8 B) |
| Parametros activos | no disponible (el nombre "A4B" sugiere ~4 B activos, pero no se confirma en la información) |
| Longitud de contexto | 131.072 tokens en la configuración de vLLM indicada; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | FP8 W8A8 estático (AutoFP8); visión y routers MoE en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8 + bfloat16 híbrido), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 en variante MoE con 25,8 mil millones de parámetros totales y una torre de visión separada de la ruta de generación de texto. La nomenclatura "A4B" del nombre apunta a unos 4 mil millones de parámetros activos por token, aunque la información disponible no lo confirma con cifras. El ajuste "heretic" del autor `coder3101` no viene documentado en la información proporcionada: no se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otra fase de alineamiento.

La innovación técnica de esta versión concreta está en el proceso de cuantización. Se aplicó AutoFP8 con esquema de activación estático (W8A8) y un conjunto de calibración de 512 muestras de `mgoin/ultrachat_2k`. Como AutoFP8 cuantiza indiscriminadamente todas las capas lineales, el autor parcheó `config.json` para añadir `vision_tower`, `embed_vision` y las capas `router.proj` de los expertos MoE a la lista `ignored_layers`, extrajo los pesos originales en bfloat16 de esas capas del modelo base, los reinyectó sobre el `model.safetensors` cuantizado y eliminó los factores de escala residuales (`weight_scale`, `input_scale`) para que vLLM no intentara cargarlos como capas cuantizadas. El resultado es un checkpoint de precisión mixta: FP8 en atención y feedforward del LLM, bfloat16 en visión y enrutamiento de expertos.

## Capacidades

- Generación de texto conversacional multi-turno, con el pipeline `image-text-to-text` declarado en el repositorio.
- Comprensión de imágenes mediante la torre de visión, preservada en bfloat16 para no degradar la multimodalidad.
- Razonamiento y respuesta a instrucciones propias de un modelo "IT" (instruction-tuned).
- Ajuste "heretic": el modelo base está modificado para reducir rechazos y respuestas evasivas, lo que amplía el rango de peticiones que atiende.
- Soporte de tool calling y function calling a través de vLLM, con `--enable-auto-tool-choice` y `--tool-call-parser gemma4` en el comando de despliegue.
- Enrutamiento MoE con routers en precisión nativa, lo que mantiene la selección de expertos sin el ruido que introduciría su cuantización.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio conversacional de alto rendimiento en GPUs Hopper o Blackwell: el checkpoint FP8 estático permite servir el modelo con vLLM y aceleración nativa de núcleos tensoriales FP8, con `--gpu-memory-utilization 0.95` y prefill por chunks para lotes grandes.
- Asistente multimodal en atención al cliente: la torre de visión en bfloat16 permite recibir capturas, fotos de producto o documentos escaneados junto al texto, manteniendo la calidad del encoder visual.
- Generación de código con tool calling: la integración con el parser `gemma4` de vLLM permite conectar el modelo a funciones externas (ejecución de tests, consultas a APIs) en pipelines de CI/CD o asistentes de IDE.
- Procesamiento de documentos largos: con 131.072 tokens de contexto configurados, encaja en tareas de resumen y extracción sobre contratos, informes o expedientes que no caben en ventanas de 8K o 32K.
- Despliegue en una sola GPU con tensor parallelism 1: el comando de la model card usa `--tensor-parallel-size 1`, lo que simplifica la infraestructura frente a alternativas que exigen repartir el modelo entre varias GPUs.
- Experimentación con modelos "uncensored" en entornos controlados: el ajuste heretic reduce los rechazos, útil para investigación sobre alineamiento, evaluación de sesgos o generación creativa sin restricciones conversacionales excesivas.
- Backend de agentes multi-paso: la combinación de tool calling, contexto largo y prefill por chunks permite cadenas de razonamiento con varias llamadas a herramientas dentro de una misma sesión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 50 GB, de modo que la inferencia en FP8 requiere al menos ~50 GB solo para pesos, más espacio para KV cache y activaciones. Con `--gpu-memory-utilization 0.95` y contexto de 128K, una GPU de 80 GB (H100, A100 80GB, H200) es el mínimo realista para el despliegue tal como está documentado.
- GPU recomendadas: H100, H200 y B200 (núcleos tensoriales FP8 nativos, requisito de la cuantización estática). En A100 80GB el FP8 no tiene aceleración por hardware, por lo que el rendimiento sería inferior aunque la carga pueda funcionar.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090 (32 GB) con esta cuantización y contexto completo. Solo sería viable con cuantizaciones adicionales (p. ej. GGUF de 4 bits) que este repositorio no ofrece.
- Opciones de despliegue: vLLM v0.19.0 o superior (requisito explícito de la model card), con soporte de la arquitectura MoE de Gemma 4 y carga FP8. La librería declarada es transformers, pero el checkpoint está pensado para vLLM; no se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La cuantización estática elimina el coste de escalado dinámico de activaciones en tiempo de ejecución, lo que en teoría mejora el throughput frente a FP8 dinámico, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 26B A4B IT Heretic FP8 Static Sharded (este) | 25,8 B totales (activos no disponibles) | 131.072 tokens en config vLLM | FP8 W8A8 estático, híbrido con bfloat16 | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| coder3101/gemma-4-26B-A4B-it-heretic (base) | 25,8 B totales | no disponible | bfloat16 | Apache 2.0 (según este repo) | Hugging Face |
| Gemma 4 26B A4B IT (original, sin heretic) | 25,8 B totales | no disponible | bfloat16 | Apache 2.0 | Hugging Face |
| Otros modelos MoE de ~25-30 B con visión | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada; la comparativa se limita a las variantes de la misma familia.

## Limitaciones y advertencias

- El ajuste "heretic" reduce deliberadamente los rechazos del modelo base; esto implica un mayor riesgo de generar contenido dañino, sesgado o inapropiado sin filtros. No es adecuado para aplicaciones de cara al público sin una capa de moderación adicional.
- La cuantización FP8 estática se calibró con solo 512 muestras de `mgoin/ultrachat_2k`, un dataset conversacional general. Dominios alejados de ese corpus (código, matemáticas, documentos técnicos) pueden sufrir una degradación de calidad mayor de la esperada.
- El checkpoint es de precisión mixta: si se modifica el `config.json` o se intenta cargar con herramientas que no respeten `ignored_layers`, las capas de visión y los routers MoE podrían interpretarse como cuantizadas y romper la inferencia.
- Requiere vLLM v0.19.0 o superior; versiones anteriores no soportan la arquitectura MoE de Gemma 4 ni la carga FP8 de este formato.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-02). No hay evidencia de uso en producción ni de validación independiente.
- No se documentan los idiomas soportados ni el contexto nativo del modelo base; el valor de 131.072 tokens proviene del comando de despliegue, no de una especificación del autor.
- Licencia Apache 2.0 permite uso comercial, pero las obligaciones de atribución y las condiciones del modelo base deben verificarse en el repositorio de `coder3101/gemma-4-26B-A4B-it-heretic`.
- El comando de la model card apunta a `cloud19/gemma-4-26B-A4B-it-heretic-FP8-Static`, un identificador distinto del repositorio actual (`thatvector/...`); conviene corregirlo antes de desplegar.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable un comportamiento similar al del modelo base, sin datos que lo confirmen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thatvector/gemma-4-26B-A4B-it-heretic-FP8-Static-Sharded
- Modelo base: https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic
- Librería AutoFP8: https://github.com/neuralmagic/AutoFP8
- Dataset de calibración: `mgoin/ultrachat_2k` (referenciado en la model card; no se proporciona URL directa)
- vLLM: no se proporciona URL en la información disponible
- Paper, blog o demo oficial: no disponibles en la información proporcionada
