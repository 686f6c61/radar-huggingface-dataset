# Uddipan242/verbatim-sum-24m

## Resumen

Verbatim-Sum 24M (`verbatim-sum-24m`) es un modelo de resumen extractivo neuronal desarrollado por el usuario Uddipan242, construido sobre el encoder `all-MiniLM-L6-v2` y publicado bajo licencia Apache 2.0. A diferencia de los modelos generativos de resumen, no produce texto nuevo: selecciona oraciones literales del documento de origen mediante un scorer neuronal a nivel de documento, lo que garantiza que nombres, cifras, fechas y citas se preserven intactos. El autor declara una tasa de alucinacion del 0% sobre 1.200 documentos de test no vistos.

El modelo resuelve el problema del resumen con fidelidad estricta en entornos con recursos limitados. El bundle desplegable ocupa 20,47 MB (19,76 MB de ONNX mas 0,71 MB de tokenizer), con 23.996.673 parametros, y esta cuantizado a 4 bits simetricos. Funciona en CPU de VPS Linux en 31-78 ms, en WebGPU de navegador en 38-62 ms y en WASM solo-CPU en unos 240 ms, sin requerir PyTorch.

Su relevancia actual radica en la combinacion de tres factores poco habituales: resumen con control de longitud (objetivos de 30 a 140 palabras), cero alucinacion verificada y despliegue en el navegador o en hardware modesto. Esta orientado exclusivamente al idioma ingles y a la tarea de resumen extractivo de un solo parrafo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (`all-MiniLM-L6-v2`, 6 capas, d=384) + Inter-Sentence Transformer de 1 capa y 6 cabezas + cabeza de fusion de contexto documental |
| Parametros totales | 23.996.673 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits simetrico `MatMulNBits` (`block_size=32`, `accuracy_level=1`), embeddings `Gather` INT8 por fila, optimizacion de grafo SDPA |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`verbatim-sum-24m.onnx`, 19,76 MB) + `tokenizer.json` (0,71 MB) |

## Arquitectura y entrenamiento

El modelo parte del encoder `sentence-transformers/all-MiniLM-L6-v2` (6 capas, dimension oculta 384) y anade un Inter-Sentence Transformer de una capa con 6 cabezas de atencion y una cabeza de fusion de contexto documental. El resultado es un scorer a nivel de documento que asigna puntuaciones a cada oracion del texto de entrada; la seleccion final se realiza de forma extractiva, escogiendo oraciones literales hasta alcanzar el objetivo de palabras solicitado. La cuantizacion a 4 bits simetrica (`MatMulNBits`, `block_size=32`) se complementa con embeddings INT8 por fila y una optimizacion del grafo SDPA que elimina 17 nodos redundantes (`IsNaN` y `Where` duplicados) con diferencia numerica de `0.0000000`.

El entrenamiento se realizo sobre 40.302 documentos con etiquetas oracle, mas 1.200 de validacion y 1.200 de test no vistos. Las etiquetas combinan oraculos greedy BERTSUM con objetivo conjunto ROUGE-1+2 y objetivos ROUGE continuos suaves por oracion. Los corpus de entrenamiento y evaluacion son `abisee/cnn_dailymail`, `gopalkalpande/bbc-news-summary`, `EdinburghNLP/xsum`, `FiscalNote/billsum`, `ccdv/pubmed-summarization` y `knkarthick/dialogsum`. No se documenta en la informacion disponible el uso de RLHF o DPO, ni el numero total de tokens de entrenamiento.

## Capacidades

- Resumen extractivo de un solo parrafo con control de longitud: objetivos dinamicos de 30 a 140 palabras (por ejemplo 50, 60, 70 o 100 palabras).
- Fidelidad literal garantizada: cada oracion de salida se copia textualmente del documento de origen, preservando nombres, cifras, fechas y citas.
- Cero alucinacion verificada: `1.200 / 1.200` documentos de test no vistos con salida 100% verbatim.
- Puntuacion neuronal a nivel de documento para seleccion de oraciones.
- Inferencia en CPU sin PyTorch (ONNX Runtime), en WebGPU de navegador y en WASM multi-hilo SIMD.
- API HTTP (`/api/summarize`) y CLI (`extractive_summarizer.py`) incluidos en el repositorio.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Soporte multilingue: no; solo ingles.

## Casos de uso

- Resumen de articulos de prensa en produccion: el modelo resume articulos de 200 a 350 palabras en 31-78 ms en CPU, con fidelidad literal, adecuado para pipelines de agregacion de noticias donde no se toleran cifras o nombres alterados.
- Procesamiento de documentos legislativos y de politicas publicas: en el corpus BillSum alcanza ROUGE-1 de 40,93 frente a 35,82 del baseline Lead, lo que lo hace util para resumir proyectos de ley preservando referencias normativas exactas.
- Resumen de transcripciones de dialogo: en DialogSum obtiene ROUGE-1 de 33,38 (frente a 29,28 de Lead), apropiado para actas de reuniones o conversaciones de atencion al cliente donde las citas deben mantenerse literales.
- Resumen de literatura cientifica y abstracts biomedicos: en PubMed logra ROUGE-1 de 30,52 (frente a 28,97 de Lead), util para sintesis de articulos donde los terminos tecnicos y las dosis no pueden parafrasearse.
- Despliegue en el navegador sin backend: con WebGPU (38-62 ms) o WASM (240 ms) y una descarga de 20,47 MB, permite resumir textos localmente en el cliente, sin enviar documentos a servidores externos.
- Resumen en VPS de bajos recursos: con 88,9 MB de RAM RSS y 2 hilos de CPU (63-78 ms), encaja en instancias economicas para servicios de resumen a escala moderada.
- Control de longitud en interfaces de usuario: la precision de 4,73 palabras MAE en objetivos de 30 a 140 palabras permite generar resumenes de longitud fija para maquetacion o limites de caracteres.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el split de test multi-dominio no visto (1.200 documentos):

| Dominio | Documentos | Lead ROUGE-1 | Verbatim-Sum 24M ROUGE-1 | Lift R1 | ROUGE-2 | ROUGE-L |
|---|---:|---:|---:|---:|---:|---:|
| Policy (BillSum) | 137 | 35,82 | 40,93 | +5,12 | 18,35 | 26,56 |
| Dialogue (DialogSum) | 120 | 29,28 | 33,38 | +4,11 | 13,43 | 26,84 |
| News (XSum) | 146 | 17,82 | 21,10 | +3,28 | 3,69 | 14,62 |
| Science (PubMed) | 46 | 28,97 | 30,52 | +1,55 | 8,08 | 16,63 |
| News (CNN/DailyMail) | 702 | 31,21 | 31,73 | +0,52 | 12,02 | 21,87 |
| News (BBC News) | 49 | 58,09 | 58,60 | +0,51 | 45,87 | 41,27 |
| Todos (1.200 docs) | 1.200 | 30,92 | 32,70 | +1,78 | 13,10 | 22,61 |

Metricas adicionales declaradas:

| Metrica | Valor |
|---|---|
| ROUGE-1 stemmed (`rouge-score`, 600 docs) | 36,34 (Lead: 32,99; +3,35) |
| ROUGE-2 stemmed (600 docs) | 15,01 |
| ROUGE-L stemmed (600 docs) | 24,42 (Lead: 21,95; +2,47) |
| MAE de recuento de palabras (objetivos 30-140) | 4,73 palabras |
| MAE de recuento de palabras (objetivo fijo 60) | 3,35 palabras |
| Fidelidad verbatim (1.200 docs) | 100% |

Latencia declarada (articulo tipico de 200-350 palabras, objetivo 60 palabras):

| Runtime | Latencia en caliente | Huella | Fidelidad |
|---|---:|---|---|
| WebGPU en navegador (Intel Arc) | 38-62 ms | 20,47 MB de descarga | 100% verbatim |
| CPU Linux/Python, 6 hilos | 31-62 ms | 88,9 MB RAM RSS | 100% verbatim |
| CPU Linux/Python, 4 hilos | 39-50 ms | 88,9 MB RAM RSS | 100% verbatim |
| CPU Linux/Python, 2 hilos | 63-78 ms | 88,9 MB RAM RSS | 100% verbatim |
| WASM solo-CPU en navegador, 4 hilos SIMD | 240 ms | 20,47 MB de descarga | 100% verbatim |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU. La huella en RAM es de 88,9 MB RSS.
- GPU recomendadas: no necesarias. Para aceleracion en navegador se ha probado WebGPU sobre Intel Arc; el autor no publica requisitos de GPU dedicada para servidor.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso principal, ya que el modelo esta disenado para CPU y WebGPU. No se documenta soporte CUDA especifico.
- Opciones de despliegue: ONNX Runtime (Python, servidor HTTP incluido y CLI), `onnxruntime-web` 1.23.2 para WebGPU y WASM. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 31-78 ms por resumen de 60 palabras en CPU (2-6 hilos), 38-62 ms en WebGPU y 240 ms en WASM. El autor no publica cifras de throughput agregado (resumenes por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| verbatim-sum-24m | 23,99 M | Extractivo, verbatim, control de longitud | no disponible | Apache 2.0 | ONNX en Hugging Face |
| Baseline Lead (referencia del autor) | 0 | Extractivo por posicion | no disponible | no aplica | Referencia interna |
| BERTSUM (oraculo de entrenamiento) | no disponible | Extractivo neuronal | no disponible | no disponible | Referencia metodologica |
| all-MiniLM-L6-v2 (modelo base) | 22,7 M aprox. | Embeddings de frases | no disponible | Apache 2.0 | Hugging Face |

La informacion disponible no incluye comparaciones con modelos generativos de resumen (por ejemplo, variantes de BART o T5) ni con otros resumidores extractivos empaquetados en ONNX. El unico punto de comparacion cuantitativo publicado es el baseline Lead, sobre el que el modelo mejora en los seis dominios evaluados.

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas, lo que descarta su uso en castellano sin reentrenamiento.
- Resumen exclusivamente extractivo: no reescribe ni parafrasea; si el documento carece de oraciones adecuadas, el resumen resultara fragmentario o poco fluido.
- Orientado a un unico parrafo: no genera resumenes multi-parrafo ni estructurados por secciones.
- Longitud de contexto no documentada: se desconoce el limite maximo de tokens de entrada; el autor solo describe articulos de 200-350 palabras.
- Resultados de benchmarks no verificados (`verified: false`): todas las metricas ROUGE y la tasa de fidelidad son declaraciones del autor sin validacion independiente.
- Repositorio con 0 descargas y creado en 2026-11-24: no hay evidencia de uso en produccion ni de mantenimiento posterior.
- Riesgo de alucinacion bajo por diseno, pero persisten riesgos de seleccion sesgada de oraciones (por ejemplo, omitir matices o contexto negativo) y de sesgos presentes en los corpus de entrenamiento (noticias, dialogo, legislacion y biomedicina en ingles).
- El recuento de palabras tiene un error de 4,73 palabras MAE en objetivos de 30 a 140 palabras; no es exacto para limites estrictos de caracteres.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `all-MiniLM-L6-v2` y los datasets empleados deben verificarse por separado si se redistribuye.
- Requiere ONNX Runtime y el runtime Python incluido en el repositorio; no es compatible de forma nativa con las APIs de `transformers`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Uddipan242/verbatim-sum-24m
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset CNN/DailyMail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset BBC News Summary: https://huggingface.co/datasets/gopalkalpande/bbc-news-summary
- Dataset XSum: https://huggingface.co/datasets/EdinburghNLP/xsum
- Dataset BillSum: https://huggingface.co/datasets/FiscalNote/billsum
- Dataset PubMed Summarization: https://huggingface.co/datasets/ccdv/pubmed-summarization
- Dataset DialogSum: https://huggingface.co/datasets/knkarthick/dialogsum
- ONNX Runtime Web: https://www.npmjs.com/package/onnxruntime-web
