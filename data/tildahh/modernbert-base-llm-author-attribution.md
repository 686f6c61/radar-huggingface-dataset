# tildahh/modernbert-base-llm-author-attribution

## Resumen

`tildahh/modernbert-base-llm-author-attribution` es un modelo de clasificacion de texto obtenido por fine-tuning de `answerdotai/ModernBERT-base`. Su tarea es la atribucion de autoria: dada una respuesta corta en ingles a una pregunta, predice si fue escrita por un humano o por uno de cuatro modelos LLM concretos (Claude Haiku 4.5, GPT-5 mini, Gemini 2.5 Flash y Kimi K2). Es, por tanto, una herramienta de deteccion de texto generado por IA, pero especializada en un conjunto cerrado de cinco clases y en un dominio acotado.

El modelo lo firman Terra Jiang, Matilda Orona y Rahil Sharma como proyecto de la asignatura Natural Language Processing with Deep Learning del programa MIDS de UC Berkeley (2026). Con 149.608.709 parametros, se apoya en la arquitectura ModernBERT, un transformer encoder con atencion lineal y RoPE que permite procesar secuencias largas de forma eficiente, aunque en este caso el uso previsto son respuestas cortas de Q&A.

Su interes practico es doble: por un lado, demuestra que un encoder de 150 millones de parametros puede separar autores LLM concretos con alta precision en un dominio restringido; por otro, se distribuye en tres formatos (safetensors fp32, ONNX fp32 y ONNX int8) y con soporte para Transformers.js, lo que permite ejecutar la inferencia enteramente en el navegador con un fichero de 151 MB. La licencia Apache 2.0 facilita su reutilizacion y adaptacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder, base) |
| Parametros totales | 149.608.709 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (ModernBERT-base soporta hasta 8192 tokens, dato del modelo base, no confirmado para este fine-tuning) |
| Tipos de cuantizacion | fp32 (safetensors y ONNX) e int8 dinamica por canal (ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX fp32, ONNX int8 cuantizado |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer con atencion lineal, embeddings posicionales rotatorios (RoPE) y capas de normalizacion pre-norm, disenado para contextos largos y alto rendimiento en GPU consumer. Sobre esa base se anade una cabeza de clasificacion de cinco clases (humano, Claude, GPT, Gemini, Kimi). El fine-tuning se realizo sobre un dataset derivado del corpus HC3 (CC-BY-SA-4.0), ampliado con respuestas generadas por los cuatro LLM citados sobre 5.306 preguntas de finanzas, medicina y conocimiento general. El split se hizo a nivel de pregunta para evitar fuga de informacion entre train y test.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de una tarea de clasificacion supervisada, lo esperable es entrenamiento con entropia cruzada y ajuste de hiperparametros, pero no se confirma. La innovacion tecnica destacable esta en la distribucion: la cuantizacion dinamica de ONNX Runtime convierte en int8 la tabla de embeddings y todas las capas lineales (el 99,98 % de los parametros), manteniendo en fp32 LayerNorm, GELU, las puntuaciones de atencion y el softmax. El resultado es un fichero de 151 MB, aproximadamente cuatro veces menor que el original, con una concordancia del 98,7 % respecto a fp32.

## Capacidades

- Clasificacion de autoria en cinco clases: humano, Claude (Haiku 4.5), GPT (GPT-5 mini), Gemini (2.5 Flash) y Kimi (K2).
- Deteccion de texto generado por IA en respuestas cortas de Q&A en ingles.
- Salida de probabilidades por clase (`top_k=None`) para inspeccionar la distribucion de confianza.
- Inferencia en Python con `transformers` (pipeline de `text-classification`).
- Inferencia en JavaScript con Transformers.js, tanto en Node como en navegador, con `dtype: "q8"` o `dtype: "fp32"`.
- Ejecucion directa en ONNX Runtime con entradas `input_ids` y `attention_mask` y salida `logits`.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento: es un clasificador, no un modelo generativo.

## Casos de uso

- Moderacion de contenido en foros y plataformas de Q&A: el modelo permite etiquetar respuestas cortas como humanas o generadas por un LLM concreto, lo que ayuda a aplicar politicas de divulgacion o a marcar contenido sintetico antes de publicarlo.
- Auditoria de datasets academicos: al clasificar respuestas de HC3 y corpus similares, se puede estimar la proporcion de texto generado por modelo y detectar contaminacion en conjuntos de entrenamiento o evaluacion.
- Investigacion en atribucion de autoria: sirve como linea base reproducible (Apache 2.0, pesos abiertos, 150 M de parametros) para comparar tecnicas de deteccion de IA frente a metodos clasicos o modelos mayores.
- Demos educativas en el navegador: el espacio `tildahh/who-wrote-this` y el fichero ONNX int8 permiten desplegar un clasificador interactivo sin backend, util para talleres y clases sobre deteccion de texto generado.
- Prefiltrado en pipelines de verificacion: como primera etapa barata (151 MB, CPU-friendly), puede priorizar muestras para revision humana o para clasificadores mas costosos, reduciendo el volumen a inspeccionar.
- Analisis de procedencia en entornos controlados: en estudios donde se conoce el conjunto de modelos candidatos (por ejemplo, comparativas de asistentes de 2025), el modelo puede etiquetar respuestas y alimentar analisis estadisticos sobre estilo y comportamiento por proveedor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (pesos PyTorch, n=150) | 98,0 % (azar = 20 %) |
| F1 por clase (pesos PyTorch) | 0,98-0,99 |
| Precision en test (ONNX int8, n=150) | 98,7 % |
| Concordancia ONNX int8 vs fp32 | 98,7 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo es un clasificador y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (598 MB de pesos) y en torno a 200-300 MB en int8 (151 MB de pesos, mas activaciones).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; tambien funciona en CPU sin problema por el tamano reducido.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) e incluso en moviles y navegadores via Transformers.js.
- Opciones de despliegue: `transformers` (pipeline de clasificacion), ONNX Runtime, Transformers.js, Text Embeddings Inference (el tag `text-embeddings-inference` aparece en el repo) y endpoints compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano y la naturaleza del modelo, se espera inferencia en milisegundos en GPU y en decenas de milisegundos en CPU para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tildahh/modernbert-base-llm-author-attribution | 149,6 M | no disponible | Clasificacion de autoria (5 clases) | Apache 2.0 | Hugging Face, ONNX, Transformers.js |
| answerdotai/ModernBERT-base | 149,6 M | 8192 tokens | Encoder base (fine-tuning) | Apache 2.0 | Hugging Face |
| Detectores genericos de IA (p. ej. clasificadores RoBERTa) | 125-355 M | 512 tokens | Deteccion binaria humano/IA | variable | Hugging Face, APIs comerciales |

La comparativa directa con detectores comerciales (GPTZero, Originality.ai) no esta disponible en la informacion proporcionada. Frente a un detector binario generico, este modelo aporta granularidad por proveedor, pero solo para cuatro LLM de 2025 y en ingles.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un detector de IA de proposito general: fue entrenado con respuestas cortas de Q&A y cuatro modelos concretos de 2025.
- El rendimiento fuera de los dominios evaluados (finanzas, medicina, conocimiento general) y con versiones posteriores de los LLM no esta establecido.
- Las puntuaciones de confianza se saturan cerca del 100 % y no son probabilidades calibradas; no deben interpretarse como certeza.
- Una prediccion no demuestra quien escribio un pasaje; puede haber falsos positivos y falsos negativos.
- Solo soporta ingles; el comportamiento en otros idiomas no se ha evaluado.
- La licencia Apache 2.0 permite uso comercial, pero el dataset HC3 subyacente es CC-BY-SA-4.0, lo que conviene revisar si se redistribuyen datos derivados.
- Riesgo de sesgo por la composicion del dataset (preguntas de dominios concretos y respuestas de modelos especificos) y por el desequilibrio potencial entre clases.
- Se distribuye "as-is", sin garantias; no se recomienda como unica senal en decisiones de produccion con consecuencias legales o academicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tildahh/modernbert-base-llm-author-attribution
- Demo en el navegador: https://huggingface.co/spaces/tildahh/who-wrote-this
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset HC3: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Transformers.js: https://github.com/huggingface/transformers.js
