# Youssef-ADOUIRI/actwise-minilm-l12-ft-int8

## Resumen

ActWise MiniLM-L12 es un modelo de embeddings de frases (sentence-similarity) derivado de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, afinado por Youssef-ADOUIRI para la búsqueda semántica sobre el Reglamento (UE) 2024/1689 (EU AI Act) y el RGPD en inglés y francés. El modelo original es un transformer encoder de tipo MiniLM con 384 dimensiones de salida; este ajuste lo especializa en recuperación de pasajes legales y lo distribuye cuantizado a int8 en formato ONNX para inferencia sin PyTorch.

El problema que resuelve es concreto: localizar el artículo o anexo relevante dentro de dos corpus legales densos a partir de preguntas en lenguaje natural, manteniendo la alineación entre inglés y francés. Forma parte de ActWise, un asistente con citas verificables para ambas normas, y actúa como recuperador en la nube del sistema.

Su relevancia actual radica en el binomio eficiencia/especialización: 119 MB de pesos int8, inferencia en CPU con `onnxruntime` y `tokenizers`, y una Recall@5 de 0.905 en el conjunto de test del proyecto, frente a 0.720 del modelo base. La licencia Apache 2.0 y el formato ONNX facilitan su despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder MiniLM (base: paraphrase-multilingual-MiniLM-L12-v2) |
| Parametros totales | no disponible (pesos int8: 119 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (truncado) |
| Tipos de cuantizacion | int8 dinamica (QInt8, per channel, reduced range); fp32 y fp16 en el modelo base |
| Idiomas soportados | en, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`), tokenizer en JSON (`tokenizer.json`, `tokenizer_config.json`) |
| Dimension de embedding | 384 (mean-pooling + normalizacion L2) |
| Prefijos de consulta/pasaje | ninguno |
| Opset ONNX | 18 |
| Tamano del repositorio | 0.1 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer MiniLM de 12 capas heredado de `paraphrase-multilingual-MiniLM-L12-v2`, con pooling medio sobre los tokens y normalización L2, de modo que el producto escalar equivale a la similitud coseno. La entrada se trunca a 256 tokens y no requiere prefijos distintos para consulta y pasaje. Sobre esta base se aplicó un ajuste fino con `MultipleNegativesRankingLoss` (negativos in-batch), 32 pares por lote, 3 épocas, learning rate 2e-5, warmup del 10 %, precisión fp16 sobre una Tesla T4 (135 pasos en 33 s) y semilla 42, usando sentence-transformers 6.1.0, transformers 5.18.0 y torch 2.14.1.

Los datos de entrenamiento proceden de los textos de 2024 del AI Act y el RGPD publicados en EUR-Lex, en inglés y francés, divididos en párrafos. El split se hizo por artículo antes de cualquier otra operación: 404 artículos de entrenamiento, 87 de dev y 87 de test (semilla 42), garantizando que un párrafo y su versión francesa comparten split. Se seleccionaron 800 pasajes de al menos 25 palabras de artículos y anexos de entrenamiento (sin considerandos) y, para cada uno, `gemini-3.5-flash-lite` generó una pregunta en inglés y otra en francés cuya respuesta estuviera en el pasaje, sin copiar frases largas ni nombrar el número de artículo. Cada pregunta se emparejó con el pasaje en su propio idioma; las ventanas de texto largo solo generaron pares en inglés. El resultado fueron 1.428 pares (799 en inglés, 629 en francés) tras descartar 2 respuestas ilegibles y 1 par demasiado vago en una revisión de 50.

Una decisión técnica destacable es el uso de un solo idioma por lote: con lotes mixtos, una pregunta en inglés encontraría a menudo la versión francesa de su propio pasaje como negativo, lo que empujaría al modelo a separar ambos idiomas en el espacio de embeddings. La exportación se realizó con `torch.onnx.export` (opset 18) y cuantización dinámica de `onnxruntime` a int8; la similitud coseno entre los embeddings int8 y los de PyTorch es de 0.989 en el peor caso y 0.992 de media sobre 20 pasajes del corpus.

## Capacidades

- Generación de embeddings de frases de 384 dimensiones para búsqueda semántica y similitud entre textos.
- Recuperación (retrieval) densa de pasajes legales del EU AI Act y el RGPD en inglés y francés.
- Alineación bilingüe inglés-francés: preguntas y pasajes pueden estar en idiomas distintos dentro del par soportado.
- Búsqueda a nivel de párrafo de artículo y anexo, con cabecera de artículo incluida en el pasaje (por ejemplo, "GDPR Article 83(5): General conditions for imposing administrative fines …").
- Inferencia sin PyTorch mediante `onnxruntime` y `tokenizers`, apta para CPU.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es un encoder de embeddings, no un modelo generativo.
- No soporta otros idiomas distintos de inglés y francés.

## Casos de uso

- Asistente legal con citas para el EU AI Act y el RGPD: ActWise usa este modelo como recuperador en la nube para localizar el artículo exacto que respalda cada respuesta, lo que permite citar la fuente normativa en lugar de generar texto sin fundamento.
- Búsqueda semántica interna para equipos de compliance: un equipo jurídico puede consultar "¿puede multarse a una empresa no comunitaria?" y recuperar los artículos aplicables del RGPD, con la ventaja de que el modelo está ajustado sobre preguntas reales de estas dos normas y no sobre texto genérico.
- Despliegue en CPU sin GPU: al ejecutarse con `onnxruntime` en 119 MB int8 y una latencia mediana de 12,6 ms por consulta en un i5-10300H, encaja en servicios de búsqueda de bajo coste o en entornos on-premise sin aceleradores.
- Indexación bilingüe de corpus normativos: permite construir un único índice de embeddings para versiones inglesa y francesa de los mismos artículos, manteniendo la correspondencia entre ambas, útil para organizaciones que operan en ambos idiomas.
- Filtrado y enrutado previo en pipelines RAG: como primera etapa de recuperación sobre un corpus legal, reduce el conjunto de candidatos antes de un reranker o de un modelo generativo, aprovechando su Recall@5 de 0.905 en test.
- Prototipado rápido de aplicaciones de consulta normativa: la licencia Apache 2.0, el formato ONNX y la ausencia de dependencia de PyTorch permiten integrarlo en prototipos y demos con requisitos mínimos de infraestructura.
- Evaluación comparativa de retrievers legales: sirve como referencia especializada frente a embeddings genéricos multilingües en tareas de recuperación sobre normativa de la UE, dado que el autor publica el harness y los resultados por split.

## Benchmarks y rendimiento

Resultados medidos con el harness propio de ActWise sobre su golden set. Una pregunta cuenta como acierto si un pasaje de su artículo gold está entre los 5 primeros. Los corchetes indican el intervalo bootstrap del 95 %. El split de test se ejecutó una sola vez.

Test (84 preguntas sobre 87 artículos no vistos), búsqueda densa sola:

| Modelo | Recall@5 | MRR@10 | nDCG@10 | Hand-written R@5 (20) | Synthetic R@5 (58) | Hard R@5 (6) |
|---|---|---|---|---|---|---|
| Base MiniLM-L12 | 0.720 [0.62, 0.81] | 0.579 [0.49, 0.67] | 0.620 | 0.675 | 0.810 | 0.000 |
| Fine-tuned, PyTorch fp32 | 0.917 [0.85, 0.96] | 0.803 [0.73, 0.87] | 0.834 | 0.850 | 0.966 | 0.667 |
| Fine-tuned, int8 (este modelo) | 0.905 [0.84, 0.96] | 0.817 [0.74, 0.88] | 0.848 | 0.850 | 0.966 | 0.500 |

Dev (76 preguntas): Recall@5 pasa de 0.691 (base) a 0.849 (fine-tuned) y 0.862 (int8). En preguntas escritas a mano pasa de 0.525 a 0.775 y 0.775.

Coste de la cuantización int8: los pesos fp32 de 471 MB se reducen a 119 MB; una consulta individual tarda una mediana de 12,6 ms frente a 21,1 ms en PyTorch sobre una CPU de portátil de 4 núcleos (i5-10300H); la calidad pierde una pregunta de test en el top 5 (Recall@5 −1,2 puntos) y gana una en dev (+1,3), mientras que MRR y nDCG suben en test.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está pensado para inferencia en CPU. Los pesos int8 ocupan 119 MB.
- GPU recomendadas: no requiere GPU. El ajuste fino se realizó en una Tesla T4 en fp16; para inferencia basta CPU.
- Cabe en cualquier equipo consumer: el modelo completo en int8 ocupa 119 MB y se ejecuta con `onnxruntime` en CPU (medido en un i5-10300H de 4 núcleos).
- Opciones de despliegue: `onnxruntime` con `CPUExecutionProvider` (documentado en la model card), junto con `tokenizers` y `huggingface_hub` para la descarga. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia mediana de 12,6 ms por consulta en el i5-10300H; el autor no publica cifras de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Idiomas | Licencia | Formato | Recall@5 (test ActWise) |
|---|---|---|---|---|---|---|---|
| ActWise MiniLM-L12 int8 (este) | no disponible (119 MB int8) | 256 tokens | 384 | en, fr | Apache 2.0 | ONNX int8 | 0.905 |
| paraphrase-multilingual-MiniLM-L12-v2 (base) | no disponible | 256 tokens (configuracion tipica del base) | 384 | multilingue | Apache 2.0 | safetensors / PyTorch | 0.720 |
| Fine-tuned ActWise en PyTorch fp32 | no disponible (471 MB fp32) | 256 tokens | 384 | en, fr | Apache 2.0 | PyTorch | 0.917 |

La comparación se limita al linaje del propio modelo, ya que la información disponible no incluye resultados de otros retrievers legales sobre el mismo golden set. Frente al base multilingüe, el ajuste gana 18,5 puntos de Recall@5 en test y pasa de 0.000 a 0.500 en preguntas difíciles; frente a la versión fp32, la int8 cede 1,2 puntos de Recall@5 pero mejora MRR (0.817 frente a 0.803) y nDCG@10 (0.848 frente a 0.834), con una reducción de tamano de 471 MB a 119 MB.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo; el corpus se limita a dos normas de la UE y a sus versiones en inglés y francés, por lo que el modelo refleja la terminología y estructura de esos textos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el retrieval puede devolver pasajes irrelevantes; en el split de test la Recall@5 es 0.905, lo que implica que aproximadamente 1 de cada 10 preguntas no recupera un pasaje de su artículo gold en el top 5.
- Limitación de contexto: truncado a 256 tokens; pasajes más largos se recortan, lo que puede perder información en artículos extensos.
- Limitación de idioma: solo inglés y francés; no cubre el español ni otras lenguas oficiales de la UE.
- Rendimiento en preguntas difíciles: Recall@5 de 0.500 en el subconjunto "hard" (6 preguntas), con palabras cotidianas, respuestas que abarcan dos artículos o excepciones; el modelo base obtiene 0.000 en ese subconjunto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el texto de EUR-Lex se reutiliza bajo la Decisión 2011/833/UE, condición que conviene verificar si se redistribuye el corpus.
- Caveat de producción: el modelo forma parte de un sistema con búsqueda híbrida en ActWise; los resultados de la tabla corresponden a búsqueda densa sola y el autor no detalla en la información disponible el rendimiento del modo híbrido completo.
- Dependencia de datos sintéticos: 1.428 pares generados por LLM y revisados solo parcialmente (50 pares muestreados), lo que puede introducir sesgos en la distribución de preguntas.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción fuera del proyecto ActWise.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssef-ADOUIRI/actwise-minilm-l12-ft-int8
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Repositorio ActWise: https://github.com/Youssef-ADOUIRI/ActWise
- Decisión de diseño del embedder (011): https://github.com/Youssef-ADOUIRI/ActWise/blob/main/docs/decisions/011-embedder.md
