# vennyvirtuoso/bge-reranker-msmarco-hardneg

## Resumen

`vennyvirtuoso/bge-reranker-msmarco-hardneg` es un cross-encoder de reordenamiento (reranker) obtenido por ajuste fino supervisado del modelo `BAAI/bge-reranker-base` sobre el split de tripletas con negativos duros de `sentence-transformers/msmarco-msmarco-distilbert-base-v3`. Lo publica el usuario `vennyvirtuoso` bajo licencia Apache 2.0 y su proposito es puntuar pares (consulta, pasaje) para reordenar los resultados de un primer recuperador denso o lexico en pipelines de busqueda y RAG.

El modelo cuenta con 278.044.417 parametros en formato safetensors (repo de 1,1 GB) y se etiqueta como `text-classification` con arquitectura derivada de XLM-RoBERTa, aunque los tags del autor mencionan tambien `modernbert`. Se trata de un ajuste fino ligero: no cambia el tamano del modelo base, sino que adapta la cabeza de clasificacion binaria a la distribucion de negativos duros de MS MARCO.

Su relevancia practica es la de un reranker listo para `sentence_transformers.CrossEncoder` con una mejora reportada de +17,40 puntos de exactitud binaria sobre el baseline preentrenado (73,50 % a 90,90 %) en el split de test. Al ser un cross-encoder de 278 M de parametros, ofrece un compromiso razonable entre calidad de reordenamiento y coste de inferencia frente a rerankers de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder tipo transformer (XLM-RoBERTa segun tags; el autor menciona ademas `modernbert`) |
| Parametros totales | 278.044.417 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar via PyTorch, pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1,1 GB) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe el par (consulta, pasaje) concatenado y produce una puntuacion de relevancia mediante una cabeza de clasificacion. Parte de `BAAI/bge-reranker-base`, un transformer de 278 M de parametros, y se ajusta de forma supervisada sobre tripletas con negativos duros de MS MARCO. El entrenamiento se realizo con PyTorch y Hugging Face Transformers en precision mixta (bf16/fp16) sobre el cluster Prajna HPC del IIT Bombay, en modo estrictamente offline con precarga aislada de datos.

No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla del identificador de Hugging Face, ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifica la innovacion tecnica del ajuste mas alla del uso de negativos duros (hard negatives) para mejorar la discriminacion entre pasajes plausibles pero irrelevantes. El resultado reportado es una exactitud binaria de reordenamiento del 90,90 % en el split de test, frente al 73,50 % del baseline preentrenado.

## Capacidades

- Puntuacion de relevancia consulta-pasaje para reordenamiento de resultados de busqueda.
- Clasificacion binaria de relevancia (relevante / no relevante) derivada de la puntuacion del cross-encoder.
- Integracion directa con `sentence_transformers.CrossEncoder` mediante `predict` sobre listas de pares.
- Reordenamiento de candidatos recuperados por un primer stage (BM25, embeddings densos, hibrido).
- Entrenado sobre MS MARCO, por lo que cubre consultas y pasajes de dominio general y web.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; el ajuste se limita a la distribucion del dataset de entrenamiento.

## Casos de uso

- Reordenamiento en pipelines RAG: tras recuperar los 50-100 candidatos con un retriever denso o BM25, el cross-encoder puntua cada par (consulta, fragmento) y se conservan los mejores para el prompt del LLM. Su tamano de 278 M permite ejecutarlo en CPU o GPU modesta dentro del mismo flujo.
- Busqueda documental interna: reordenar resultados de un motor de busqueda corporativo para mejorar la precision en las primeras posiciones, donde el cross-encoder corrige falsos positivos del primer stage.
- Evaluacion de calidad de recuperacion: usar las puntuaciones como metrica auxiliar para comparar retrievers o ajustar el numero de candidatos recuperados antes del reordenamiento.
- Filtrado de contexto para LLMs: descartar pasajes irrelevantes antes de construir el contexto y reducir el consumo de tokens y el riesgo de alucinacion por contexto ruidoso.
- Sistemas de preguntas y respuestas sobre FAQs: ordenar las respuestas candidatas de una base de conocimiento y devolver la mas relevante segun la consulta del usuario.
- Reordenamiento en busqueda web o de productos: aplicar el modelo como segunda fase sobre los resultados de un indice invertido para mejorar la relevancia percibida.
- Prototipado rapido en entornos con recursos limitados: al ser un modelo de 278 M con licencia Apache 2.0, se puede desplegar en una sola GPU consumer o incluso en CPU para pruebas de concepto.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de test retenido:

| Metrica | Valor |
|---|---|
| test_loss | 0.3905 |
| test_rerank_binary_accuracy | 0.9090 |
| test_runtime | 2.2653 |
| test_samples_per_second | 868.7600 |
| test_steps_per_second | 13.6850 |
| epoch | 3.0000 |
| Exactitud baseline preentrenado | 73,50 % |
| Exactitud test ajuste fino | 90,90 % |
| Ganancia absoluta de exactitud | +17,40 % |

No se han publicado resultados en benchmarks estandar de recuperacion (BEIR, MS MARCO dev, MTEB) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,6 GB solo para pesos, mas memoria de activaciones y batch; en la practica, entre 1 y 2 GB para lotes pequenos.
- En fp32: alrededor de 1,1 GB para pesos, mas overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 3060, RTX 4060, T4). Para alto throughput, A10G, L4, A100 o H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para volumenes moderados.
- Opciones de despliegue: `sentence_transformers.CrossEncoder`, Hugging Face Transformers con `AutoModelForSequenceClassification`, y servidores de inferencia compatibles con modelos de clasificacion de texto (por ejemplo, Text Embeddings Inference de Hugging Face o vLLM no aplica para cross-encoders de clasificacion). No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: el autor reporta 868,76 muestras por segundo y 13,685 pasos por segundo en su entorno de evaluacion, sin especificar el hardware exacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vennyvirtuoso/bge-reranker-msmarco-hardneg | 278 M | no disponible | Apache 2.0 | Ajuste fino sobre MS MARCO con negativos duros; 90,90 % de exactitud binaria en test segun el autor |
| BAAI/bge-reranker-base | 278 M | no disponible | MIT (segun el modelo original) | Modelo base sin ajuste; baseline del 73,50 % de exactitud segun el autor |
| BAAI/bge-reranker-large | 560 M | no disponible | MIT (segun el modelo original) | Version mayor del mismo linaje; mayor coste de inferencia |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | 22,7 M | 512 tokens (tipico en MiniLM) | Apache 2.0 | Mucho mas pequeno y rapido, menor calidad de reordenamiento |

Los datos de contexto y rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada; se indican solo los valores conocidos del linaje BGE y MiniLM.

## Limitaciones y advertencias

- El ajuste esta limitado a la distribucion de dominio e idioma de `sentence-transformers/msmarco-msmarco-distilbert-base-v3 (triplet-hard)`; el rendimiento fuera de ese dominio no esta garantizado.
- No se documentan los idiomas soportados; el uso en castellano u otros idiomas distintos del ingles de MS MARCO requiere validacion propia.
- Riesgo de alucinacion no aplica directamente (es un clasificador de relevancia), pero las puntuaciones pueden ser poco calibradas fuera del dominio de entrenamiento.
- Para despliegues regulados o de alto riesgo (por ejemplo, redaccion de PII en dominios medico o financiero), el autor recomienda revision humana en el bucle.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-16; no hay evidencia de uso en produccion ni validacion independiente.
- No se publican resultados en benchmarks estandar de recuperacion (BEIR, MTEB), solo metricas internas del split de test del autor.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del dataset de entrenamiento.
- El tag `modernbert` en los metadatos del autor no concuerda con el modelo base declarado (`BAAI/bge-reranker-base`, de linaje XLM-RoBERTa); conviene verificar la arquitectura real antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/bge-reranker-msmarco-hardneg
- Modelo base: https://huggingface.co/BAAI/bge-reranker-base
- Dataset de entrenamiento: https://huggingface.co/datasets/sentence-transformers/msmarco-msmarco-distilbert-base-v3
- Documentacion de `sentence_transformers.CrossEncoder`: https://www.sbert.net/docs/package_reference/cross_encoder/cross_encoder.html
