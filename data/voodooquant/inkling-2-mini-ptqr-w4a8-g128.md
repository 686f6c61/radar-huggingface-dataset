# voodooquant/Inkling-2-Mini-PTQR-W4A8-G128

## Resumen

Inkling-2-Mini-PTQR-W4A8-G128 es una cuantización post-entrenamiento del modelo multimodal Inkling-2-Mini, desarrollado originalmente por Thinking Machines Lab. La publica el usuario voodooquant bajo licencia Apache 2.0 y su objetivo es hacer viable el despliegue del modelo base en hardware AMD Instinct MI100 mediante una combinación de pesos de 4 bits para el decodificador de lenguaje y un codificador visual cuantizado a INT8. El checkpoint ocupa 14,94 GB en cuatro shards de safetensors, frente a los aproximadamente 53,6 GB que exigirían los pesos en BF16 para los 26.779.413.632 parámetros totales.

El modelo base es un transformer MoE multimodal con 24 capas de decodificador que reutiliza las 12 capas centrales tres veces con pesos compartidos, lo que produce 48 aplicaciones de capa por token. Las capas feed-forward dispersas enrutan cada token a ocho expertos. La ventana de contexto probada alcanza los 262.144 tokens, una cifra relevante para cargas de trabajo de documento largo, agentes y razonamiento multi-paso.

La innovación principal de esta ficha no es el modelo en sí, sino el método de cuantización PTQR (post-training quantization with rounding-dither retraining), que ajusta pesos y escalas de grupo contra las salidas del profesor sobre activaciones de calibración. El resultado se sirve exclusivamente con un fork de vLLM para MI100 con soporte de decodificación especulativa mediante un drafter DSpark cuantizado a W8A8, también publicado por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con 24 capas de decodificador y reutilización de las 12 centrales (48 aplicaciones de capa por token) |
| Parametros totales | 26.779.413.632 |
| Parametros activos | no disponible (routing a 8 expertos por token, sin recuento publicado) |
| Longitud de contexto | 262.144 tokens (límite probado) |
| Tipos de cuantizacion | W4A8 con group size 128 en proyecciones de lenguaje y expertos enrutados; INT8 en 141 matrices del codificador visual; FP16 en embeddings visuales, normalizaciones y sesgos; KV cache INT8 con grupos de escala de 128 elementos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, 14,94 GB), con tokenizer, chat template e image processor incluidos |

## Arquitectura y entrenamiento

El checkpoint deriva de thinkingmachines/Inkling-2-Mini, un modelo MoE multimodal cuyo decodificador consta de 24 capas. Las 12 capas intermedias se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa efectivas. Las capas feed-forward dispersas enrutan cada token a ocho expertos. El codificador visual procesa imágenes y las proyecta al espacio del decodificador mediante 141 matrices de proyección cuantizadas a INT8 con escalas de grupo en FP16.

El proceso PTQR parte del checkpoint original en BF16 y ajusta pesos y escalas de grupo contra las salidas del profesor sobre activaciones de calibración, aplicando dither de redondeo durante el entrenamiento para explorar redondeos vecinos; los códigos y escalas exportados son exactamente los usados en inferencia. Las proyecciones visuales se ajustaron contra el profesor visual BF16 original usando 48 imágenes de entrenamiento y 12 de validación. No se dispone de datos sobre el volumen de tokens de preentrenamiento del modelo base, la composición del dataset ni la presencia de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat incluida en el checkpoint.
- Procesamiento de imágenes y texto combinados (pipeline image-text-to-text): el modelo acepta entradas visuales y genera texto.
- Razonamiento de contexto largo: ventana probada de 262.144 tokens.
- Capacidad MoE con routing a ocho expertos por token, lo que permite un cómputo por token inferior al de un modelo denso del mismo tamaño total.
- Decodificación especulativa: el checkpoint está diseñado para emparejarse con el drafter Inkling-2-Mini-DSpark-PTQR-W8A8-G128, lo que acelera la generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Análisis de documentos largos con imágenes: el modelo puede ingerir contratos, informes técnicos o expedientes con figuras y tablas dentro de una ventana de 262.144 tokens, evitando fragmentación y pérdida de contexto entre secciones.
- Extracción estructurada de información de facturas y formularios escaneados: la combinación de codificador visual INT8 y decodificador de lenguaje permite transcribir y normalizar campos en una sola pasada, con un coste de VRAM reducido frente al modelo BF16.
- Asistencia conversacional sobre base documental: con la plantilla de chat incluida y contexto largo, se puede mantener un diálogo multi-turno anclado a un corpus extenso sin reinyectar el material en cada turno.
- Despliegue en clústeres AMD MI100: es el escenario para el que se publicó el checkpoint; el fork de vLLM con el método `inkling2_ptqr` y el script `serve_recipe_inkling2mini.sh` permiten levantar el endpoint con el ID de modelo `inkling-2-mini`.
- Generación aumentada por recuperación (RAG) multimodal: indexación de páginas con figuras y respuesta con citas visuales, aprovechando que el modelo acepta imagen y texto en la misma petición.
- Servicio de inferencia con decodificación especulativa: en configuraciones de cuatro tarjetas MI100 se puede emparejar el target W4A8 con el drafter DSpark W8A8 para reducir la latencia por token en cargas interactivas.
- Investigación en cuantización: el repositorio incluye los scripts de entrenamiento `scripts/ptqr_inkling2.py` y `scripts/ptqr_inkling2mini_vision.py`, además del registro de medidas `docs/recipes/surface_experiments_ledger.jsonl`, útiles para reproducir y comparar recetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 14,94 GB en safetensors; a ello hay que sumar el KV cache INT8, cuyo tamaño crece con la longitud de contexto y el número de secuencias concurrentes. Para contextos cercanos a 262.144 tokens se requiere un dimensionado específico no documentado en la información disponible.
- GPU recomendadas: AMD Instinct MI100, en una receta probada de cuatro tarjetas con ROCm. No hay soporte documentado para GPU NVIDIA ni para GPUs de consumo.
- Cabe en consumer GPU: no disponible; el runtime requerido es un fork de vLLM específico para MI100, por lo que no se contempla un despliegue en tarjetas domésticas.
- Opciones de despliegue: fork de vLLM en https://github.com/curvedinf/int8-vllm (revisión probada `4e51068a8d31f2fb71f07abda0ac558abea7a98e`) con el fork de AITER en https://github.com/curvedinf/int8-aiter (revisión `a4968c8ce7ebaf2526efa3a1faa08a7219e649e8`). El método de cuantización en runtime es `inkling2_ptqr`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La decodificación especulativa con el drafter DSpark se ofrece como vía de aceleración, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Inkling-2-Mini-PTQR-W4A8-G128 (esta ficha) | 26,78 B | 262.144 | W4A8 g128 + vision INT8 | Apache 2.0 | AMD MI100 (ROCm), vLLM fork |
| thinkingmachines/Inkling-2-Mini (base) | 26,78 B | 262.144 | BF16 | Apache 2.0 | no disponible |
| Inkling-2-Mini-DSpark-PTQR-W8A8-G128 (drafter) | no disponible | no disponible | W8A8 g128 | Apache 2.0 | AMD MI100 (ROCm), vLLM fork |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada; los únicos modelos documentados son el checkpoint base y el drafter del mismo autor.

## Limitaciones y advertencias

- El checkpoint declara `inference: false` en sus metadatos: no es un modelo listo para usar con vLLM estándar, sino que exige el fork específico para MI100 y el método `inkling2_ptqr`.
- Dependencia estricta de revisiones concretas de vLLM y AITER; actualizar cualquiera de las dos sin validar puede romper la ruta de cuantización.
- La cuantización W4A8 introduce pérdida de precisión frente al BF16 original; no se han publicado métricas de degradación en benchmarks en la información disponible.
- La calibración del codificador visual usó solo 48 imágenes de entrenamiento y 12 de validación, un conjunto muy reducido que puede no cubrir dominios visuales alejados de la distribución de calibración.
- El KV cache en INT8 con grupos de escala de 128 elementos añade otra fuente de error acumulativo en contextos muy largos.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento aceptable en castellano ni en otras lenguas distintas de las mayoritarias del modelo base.
- Sesgos conocidos: no disponibles en la información proporcionada; al ser un derivado del modelo base, hereda los sesgos de este, que no se detallan.
- Riesgo de alucinación: no cuantificado; aplicable el riesgo habitual de los modelos generativos, agravado por la falta de benchmarks publicados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue efectivo queda condicionado a la disponibilidad de hardware MI100 y del fork de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voodooquant/Inkling-2-Mini-PTQR-W4A8-G128
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint fuente del modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/b85c3cfa615fc413cc9af3379f491b963f3b586a
- Drafter DSpark W8A8: https://huggingface.co/voodooquant/Inkling-2-Mini-DSpark-PTQR-W8A8-G128
- Fork de vLLM: https://github.com/curvedinf/int8-vllm
- Fork de AITER: https://github.com/curvedinf/int8-aiter
- Licencia del repositorio: https://huggingface.co/voodooquant/Inkling-2-Mini-PTQR-W4A8-G128/blob/main/LICENSE
