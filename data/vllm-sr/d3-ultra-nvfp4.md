# vllm-sr/d3-ultra-NVFP4

## Resumen

d3-ultra-NVFP4 es la variante cuantizada en NVFP4 de d3-ultra, un modelo de decisión multimodal de 26.090 millones de parámetros (incluido un codificador de visión de 0,46B) desarrollado por vllm-sr dentro de la familia Decision 3.0. A diferencia de un LLM generativo convencional, el modelo no produce texto libre: recibe una entrada (texto o JSON, opcionalmente con imágenes y vídeos) junto con un conjunto de preguntas tipadas y devuelve, para cada una, una probabilidad sobre las respuestas posibles. Los tipos de decisión soportados son elección entre opciones, sí/no, puntuación en escala, caja delimitadora (Box) y seguimiento (Track).

La relevancia de esta variante concreta es la eficiencia en hardware Blackwell: aplica cuantización W4A4 con formato NVFP4 (E2M1) sobre las proyecciones del decodificador, reduciendo el peso en disco de 52,2 GB a 17,2 GB y aproximadamente duplicando la velocidad de inferencia (32,5 ms frente a 63,4 ms de mediana por pregunta de texto en una RTX PRO 6000 Blackwell). El coste es una pérdida acotada de precisión: 70,63 frente a 71,57 en el índice de decisión público y 74,60 frente a 75,36 en la suite de visión.

El modelo está pensado para cargas de clasificación y enrutamiento de alta concurrencia donde la latencia y la huella de memoria importan más que la generación abierta de texto. Su licencia Apache-2.0 y su integración con `transformers` y `compressed-tensors` facilitan el despliegue en producción, aunque requiere GPUs con tensor cores FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención lineal Gated DeltaNet y decodificador multimodal; runtime propio `d3q` sobre `transformers` |
| Parametros totales | 26.090 millones (26,09B), incluidos 0,46B del codificador de visión |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (`nvfp4-pack-quantized` de compressed-tensors): pesos y activaciones FP4 (E2M1) en bloques de 16 con escalas E4M3 y escala global FP32 por tensor; derivada de AWQ smoothing + redondeo GPTQ. 400 proyecciones cuantizadas; `in_proj_a`/`in_proj_b` de Gated DeltaNet, torre de visión, embeddings y readout se mantienen en su precisión original |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con pesos FP4 empaquetados), `compressed-tensors`, `custom_code`; requiere `transformers==5.17.0` |

## Arquitectura y entrenamiento

d3-ultra-NVFP4 es una cuantización del modelo base vllm-sr/d3-ultra (revisión `52ba9e7a`), no un modelo entrenado desde cero. La arquitectura subyacente combina un decodificador con capas de atención lineal Gated DeltaNet (con kernels opcionales de `flash-linear-attention`) y un codificador de visión que procesa imágenes y vídeos. El modelo se comporta como un "system one": lee la entrada una sola vez por petición y responde simultáneamente a todas las preguntas asociadas, devolviendo distribuciones de probabilidad en lugar de secuencias de tokens.

La cuantización se aplica únicamente a las proyecciones del decodificador (400 proyecciones) mediante un pipeline de AWQ smoothing —que pliega escalas sensibles a la activación en las normas previas y en `up_proj`— seguido de redondeo GPTQ contra activaciones ya cuantizadas en NVFP4. La calibración usó 175 peticiones (unos 190.000 tokens) intercaladas y mayoritariamente provenientes de los datos de entrenamiento del propio d3-ultra: 80 peticiones de texto y JSON (de 1 a 32 preguntas, hasta 170 opciones), 30 imágenes fijas (2 con imágenes como opciones), 38 peticiones Box (6 con objetivos ausentes), 9 vídeos, 9 tracks y 9 preguntas Box sobre un instante de vídeo. Ninguna proviene de los conjuntos de test evaluados.

No se dispone de información sobre el volumen total de tokens de entrenamiento del modelo base, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Clasificación zero-shot y decisión tipada: elección entre opciones múltiples, sí/no, puntuación en escala, caja delimitadora y seguimiento de objetos.
- Procesamiento multimodal de texto, JSON, imágenes y vídeos, con varias imágenes o vídeos por petición.
- Imágenes dentro de preguntas y opciones (por ejemplo, comparar una foto con varias opciones gráficas mediante marcadores como `<building>` y `<a>`).
- Detección de objetos y localización espacial mediante decisiones de tipo Box.
- Seguimiento de objetos en vídeo (Track), con métricas AUC reportadas.
- Respuesta a múltiples preguntas en una sola lectura de la entrada (hasta 32 preguntas y 170 opciones en los datos de calibración).
- Salida de probabilidades calibradas por respuesta, apta para umbrales y enrutamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el diseño es explícitamente de un solo paso ("system one").
- Capacidades multilingües: no disponible.
- Modo thinking, audio: no disponibles.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como `state` y devuelve en una sola llamada la probabilidad de que corresponda a facturación o a soporte técnico, además de si es urgente. Es adecuado porque evita generar texto y ofrece directamente la distribución de probabilidad necesaria para un clasificador de producción.
- Moderación y verificación de contenido: preguntas de tipo sí/no sobre textos o JSON permiten obtener una probabilidad de incumplimiento por ítem, con latencia de decenas de milisegundos por petición, lo que facilita aplicar umbrales y derivar casos dudosos a revisión humana.
- Análisis documental con imágenes: procesar recibos, facturas o formularios escaneados y responder simultáneamente a varias preguntas de extracción y validación. Conviene tener en cuenta que la precisión de Box en recibos cae a 0,790 frente a 0,955 del modelo completo, por lo que para localización precisa en recibos es preferible d3-ultra-FP8.
- Detección y localización de objetos en imágenes: dada una imagen y varias etiquetas, el modelo devuelve cajas delimitadoras con su probabilidad asociada en una sola pasada, útil en pipelines de etiquetado asistido o control de calidad visual.
- Seguimiento de objetos en vídeo: con decisiones de tipo Track, se puede monitorizar la presencia y posición de objetos a lo largo de un clip; la métrica de éxito de seguimiento (AUC 0,760/0,769) se mantiene a menos de 1,5 puntos del modelo sin cuantizar.
- Cuestionarios y evaluación visual: comparar una imagen de referencia con varias opciones gráficas (por ejemplo, identificar el grabado que representa el mismo edificio que una foto) usando marcadores de activo en las opciones.
- Clasificación a gran escala con presupuesto de memoria ajustado: al ocupar 17,2 GB de pesos en lugar de 52,2 GB, permite mayor densidad de instancias por GPU en clústeres Blackwell y aproximadamente el doble de throughput por instancia.

## Benchmarks y rendimiento

| Benchmark | d3-ultra-NVFP4 | d3-ultra (referencia) | Diferencia |
|---|---|---|---|
| Jev Decision Index 0.3 (suite pública) | 70,63 | 71,57 | −0,94 |
| Suite pública de visión | 74,60 | 75,36 | −0,76 |
| Box accuracy a IoU 0,5 | 0,844 | 0,872 | −0,028 |
| Box accuracy en recibos | 0,790 | 0,955 | −0,165 |
| Imágenes en preguntas y opciones | 0,947 | 0,952 | −0,005 |
| Tracking success AUC | 0,760 / 0,769 | 0,775 / 0,783 | −0,015 / −0,014 |
| Coincidencia con la respuesta top de d3-ultra (texto, 272.229 preguntas) | 96,7 % | — | — |
| Coincidencia con la respuesta top de d3-ultra (visión, 12.210 preguntas) | 93,3 % | — | — |
| Latencia mediana por pregunta de texto (RTX PRO 6000 Blackwell) | 32,5 ms | 63,4 ms | ~2× más rápido |

Desglose por categoría del índice de texto: lenguaje, recuperación y herramientas quedan a menos de 0,3 puntos; artes −1,4; conocimiento −2,8 (59,5 frente a 62,3). No se han publicado resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 17,2 GB; con activaciones y caché de trabajo conviene prever un margen adicional, aunque no se especifica una cifra oficial.
- GPU recomendadas: NVIDIA Blackwell con tensor cores FP4. La medición oficial se realizó en una NVIDIA RTX PRO 6000 Blackwell. No es compatible con generaciones anteriores (Ampere, Hopper) al requerir soporte FP4 nativo.
- Cabe en GPU de consumo: no disponible; no se confirma compatibilidad con GeForce RTX 50xx en la información proporcionada.
- Opciones de despliegue: el modelo se carga mediante el runtime propio `d3q` (`load_d3`) sobre `transformers==5.17.0`, `compressed-tensors>=0.19` y `torch>=2.11`; opcionalmente `flash-linear-attention` para kernels rápidos de atención lineal. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 32,5 ms de mediana por pregunta de texto individual en una RTX PRO 6000 Blackwell, frente a 63,4 ms del modelo sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Pesos en disco | Licencia | Índice de decisión | Visión |
|---|---|---|---|---|---|---|
| d3-ultra-NVFP4 | 26,09B | NVFP4 W4A4 | 17,2 GB | Apache-2.0 | 70,63 | 74,60 |
| d3-ultra | 26,09B | Sin cuantizar | 52,2 GB | Apache-2.0 | 71,57 | 75,36 |
| d3-ultra-FP8 | 26,09B | FP8 | No disponible | Apache-2.0 | No disponible | No disponible |

No se dispone de información sobre modelos de decisión multimodales comparables de otros desarrolladores en la documentación proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión en localización de objetos: Box accuracy cae 2,8 puntos globalmente y de forma acusada en recibos (0,790 frente a 0,955). Para ese caso de uso concreto, el autor recomienda d3-ultra-FP8.
- Degradación en conocimiento: −2,8 puntos en la categoría de conocimiento del índice de texto (59,5 frente a 62,3).
- Dependencia de hardware: requiere tensor cores FP4 (Blackwell); no funciona en GPUs Ampere ni Hopper.
- No es un modelo generativo: no produce texto libre ni razonamiento multi-paso; solo devuelve probabilidades sobre preguntas predefinidas. No apto para agentes conversacionales ni generación de código.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe más allá de lo observado en las evaluaciones.
- Longitud de contexto no documentada: limita la planificación de cargas con entradas largas.
- Riesgo de alucinación: al emitir probabilidades, un umbral mal calibrado puede producir decisiones erróneas con alta confianza; se recomienda validar la calibración sobre datos propios.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar la licencia del modelo base d3-ultra y de los pesos originales.
- Runtime no estándar: la carga requiere código propio (`d3q`) y versiones muy específicas de `transformers` (5.17.0) y `torch` (>=2.11), lo que puede complicar la integración en stacks existentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/d3-ultra-NVFP4
- Modelo base: https://huggingface.co/vllm-sr/d3-ultra
- Variante FP8: https://huggingface.co/vllm-sr/d3-ultra-FP8
- Repositorio de compressed-tensors: no disponible en la información proporcionada
- Paper, blog o demo oficiales: no disponibles en la información proporcionada
