# StandardThinking/StandardOne-35B-SH

## Resumen

StandardOne-35B-SH es un modelo de decisión tipada desarrollado por StandardThinking, derivado por fine-tuning del modelo de mezcla de expertos Qwen3.6-35B-A3B. A diferencia de un modelo generativo convencional, no produce texto: incorpora una cabeza de esquema conjunta (joint schema head) de 68,5 millones de parámetros que lee los estados ocultos de una solicitud completa y devuelve, en una sola pasada, una distribución de probabilidad calibrada para cada pregunta y cada opción planteadas. El resultado se expone a través del contrato `POST /v1/systemone`.

El modelo resuelve un problema concreto de los sistemas de decisión basados en LLM: la evaluación de preguntas con muchas opciones (hasta 255) y de múltiples preguntas sobre un mismo escenario, algo que los modelos generativos abordan con una pasada por pregunta y limitados por el alfabeto de etiquetas. Al compartir una única pasada sobre el escenario para todas las preguntas de la solicitud, reduce coste y latencia en escenarios largos con decisiones embebidas en documentos extensos.

Es relevante en el contexto actual de sistemas agénticos y enrutamiento, donde clasificación de intenciones, validación de contratos y llamadas a API requieren salidas estructuradas y calibradas en lugar de texto libre. El modelo se distribuye con licencia Apache-2.0, pesos en bfloat16 (unos 70 GB) y un servidor de referencia en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe`), 40 capas, 256 expertos con 8 activos por token, más cabeza de esquema conjunta (68,5 M parámetros, float32) que lee la capa final y la capa 29 |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | Entrenado con solicitudes de hasta 32.768 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; la cabeza en float32) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (pesos y cabeza); modelo base Qwen3.6-35B-A3B también Apache-2.0 |
| Formato de pesos | Safetensors (backbone bfloat16, cabeza float32 en `head/`) |

## Arquitectura y entrenamiento

El backbone es Qwen3.6-35B-A3B, un transformer de mezcla de expertos con 40 capas y 256 expertos por capa, de los cuales 8 se activan por token, lo que resulta en unos 3B parámetros activos sobre 35,1B totales. Sobre este backbone se ha realizado un fine-tuning que añade una cabeza de esquema conjunta de 68,5 M parámetros en float32; la cabeza atiende sobre los estados ocultos de la solicitud completa, tomando la salida de la capa final y de la capa 29 (intermedia), y coloca todas las preguntas y opciones en un único grafo conjunto para emitir una distribución calibrada por pregunta en una sola pasada. Los pesos del backbone fine-tuneado se han fusionado y se publican junto con la cabeza.

El modelo se ha entrenado con el chat template de Qwen con el modo de razonamiento desactivado (`enable_thinking=False`) y sin mensaje de sistema; el servidor de referencia aplica esta configuración por defecto. Se soportan tres tipos de pregunta: `choice` (entre 2 y 255 opciones), `noul` (sí/no) y `score` (escala ordinal). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación principal es la decodificación libre de generación (decode-free): en lugar de leer un token por opción, la cabeza puntúa directamente todas las opciones de todas las preguntas.

## Capacidades

- Decisión tipada sobre preguntas de opción múltiple (`choice`), binarias (`noul`) y ordinales (`score`), con hasta 255 opciones por pregunta.
- Evaluación conjunta de múltiples preguntas sobre un mismo escenario en una única pasada del backbone.
- Salidas probabilísticas calibradas por pregunta (en JevBench hard, confianza media de 80,0 para un 78,4 % de acierto; error de calibración esperado de 0,024).
- Clasificación de intenciones, enrutamiento y etiquetado en dominios como atención al cliente, contratos y llamadas a API.
- Procesamiento de decisiones embebidas en documentos largos (hasta 32.768 tokens).
- Soporte de entradas image-text-to-text a nivel de arquitectura base (tag `image-text-to-text`), aunque los resultados publicados solo cubren texto.
- No genera texto libre ni soporta tool calling generativo; su salida es exclusivamente la distribución de probabilidad sobre las preguntas definidas en la solicitud.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: con preguntas `choice` de hasta 255 opciones, el modelo clasifica la intención del usuario en una sola pasada, adecuado para sistemas de triaje con catálogos amplios de intenciones.
- Moderación y clasificación de urgencia: combinando preguntas `noul` (por ejemplo, "¿la solicitud es urgente?") y `score` (gravedad en escala ordinal), se obtiene una evaluación calibrada del mensaje para priorizar colas de soporte.
- Extracción de decisiones en contratos y documentos legales: la ventana de 32.768 tokens permite localizar cláusulas y decisiones enterradas en documentos largos, con una precisión del 93,33 % en el conjunto propio de decisiones en documentos largos.
- Validación de llamadas a API y contratos: cerca del rendimiento del modelo de 8B en ContractNLI y API-Bank (dentro de 1,3 puntos), útil para verificar parámetros y conformidad antes de ejecutar acciones.
- Clasificación de sarcasmo y análisis de sentimiento fino: con puntuaciones ordinales (`score`) para medir el tono del cliente (calma, molesto, enfadado), útil en sistemas de calidad y análisis de conversaciones.
- Detección de phishing y clasificación de dominios técnicos: con ganancias notables frente al modelo de 8B en PhishNChips (+32,4 puntos de Decision Index) y CRUXEval (+34,2), adecuado para filtrado de contenido malicioso y validación de código.
- Evaluación de conocimiento y razonamiento en pipelines de QA: con mejoras de +41,7 puntos en GSM8K, +22,4 en GPQA Diamond y +19,7 en MMLU-Pro frente al 8B, sirve como componente de verificación en sistemas de respuesta.

## Benchmarks y rendimiento

| Benchmark | 3B SH v4 | 8B SH v4 | 35B SH v1 |
|---|---:|---:|---:|
| Decision Index 0.3 (índice público) | 58,08 | 57,40 | 66,26 |
| Áreas: Knowledge / Language / Retrieval / Tools / Arts | 36,3 / 57,5 / 67,0 / 85,7 / 47,5 | 36,9 / 57,9 / 66,4 / 84,0 / 42,5 | 52,1 / 66,0 / 72,5 / 86,1 / 54,6 |
| Decisión oculta en documento largo (conjunto propio, 150 ítems) | 84,67 | 88,00 | 93,33 |
| JevBench público: easy / original / hard (48 / 72 / 111 ítems) | 100,00 / 95,83 / 63,96 | 100,00 / 94,44 / 75,68 | 100,00 / 97,22 / 78,38 |

Las filas de Decision Index son puntuaciones de habilidad corregidas por azar (0 = aleatorio, 100 = perfecto) obtenidas con el kit oficial sobre las 140.178 solicitudes puntuables del conjunto público 0.3. El resto de filas son precisión en porcentaje. Las mayores ganancias frente al 8B SH en puntos de Decision Index son GSM8K +41,7, BPoMP +35,1, CRUXEval +34,2, PhishNChips +32,4, GPQA Diamond +22,4, iSarcasmEval +21,4 y MMLU-Pro +19,7; en CLINC150, BANKING77, ContractNLI y API-Bank se mantiene dentro de 1,3 puntos del 8B, y baja ligeramente en RAGTruth (−2,1) y VAST (−2,2).

## Requisitos de hardware

- El servidor de referencia requiere una GPU con al menos 96 GB de memoria (backbone en bfloat16, unos 70 GB, más la cabeza en float32).
- GPU recomendadas: A100 80 GB no es suficiente según el requisito del servidor de referencia; se necesitan H100 80 GB con margen limitado o, preferiblemente, A100/H100 de 96 GB o más (por ejemplo, H100 NVL, H200, A100 80 GB en configuraciones con offload no documentadas).
- No cabe en GPU de consumo (RTX 4090, 24 GB) con los pesos publicados en bfloat16; no se documentan cuantizaciones GGUF ni versiones reducidas de este modelo.
- Despliegue: servidor de referencia en PyTorch puro incluido en `code/serve_head.py`, con batching de solicitudes concurrentes mediante `--max-batch-requests` y `--max-batch-tokens`, y escucha en `127.0.0.1` por defecto. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StandardOne-35B-SH | 35,1B totales / ~3B activos | 32.768 tokens | 66,26 | Apache-2.0 | HuggingFace |
| StandardOne-8B-SH | No disponible | No disponible | 57,40 | Apache-2.0 | HuggingFace |
| StandardOne-3B-SH | No disponible | No disponible | 58,08 | Apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks de modelos de decisión de otros desarrolladores en la información proporcionada para establecer una comparación externa.

## Limitaciones y advertencias

- Los resultados de Decision Index están autoevaluados con el kit oficial, no son una entrada de leaderboard; deben interpretarse con cautela.
- Evaluado únicamente con solicitudes de texto; las entradas de imagen no están cubiertas por los resultados publicados pese al tag `image-text-to-text`.
- Las solicitudes de más de 32.768 tokens quedan fuera del rango de entrenamiento.
- Solo soporta inglés; no se documenta cobertura multilingüe.
- No genera texto libre ni soporta tool calling generativo; su uso está restringido a la evaluación de preguntas tipadas.
- Requiere respetar estrictamente el formato de prompt: chat template de Qwen, sin mensaje de sistema y con `enable_thinking=False`; añadir un system prompt o activar el razonamiento altera los estados ocultos que lee la cabeza.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración deficiente en dominios alejados de la distribución de entrenamiento; la confianza media en JevBench hard (80,0 para 78,4 % de acierto) sugiere una ligera sobreconfianza.
- No se documentan sesgos conocidos ni restricciones adicionales de uso comercial más allá de la licencia Apache-2.0.
- El requisito de 96 GB de VRAM limita el despliegue a infraestructura de gama alta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StandardThinking/StandardOne-35B-SH
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- StandardOne-8B-SH: https://huggingface.co/StandardThinking/StandardOne-8B-SH
- StandardOne-3B-SH: https://huggingface.co/StandardThinking/StandardOne-3B-SH
