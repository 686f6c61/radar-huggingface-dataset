# yaser-aj/bge-m3-qatar-1908

## Resumen

bge-m3-qatar-1908 es un modelo de embeddings de frases (sentence-similarity) obtenido mediante fine-tuning de BAAI/bge-m3 sobre un corpus histórico especializado: el *Gazetteer of the Persian Gulf* de J. G. Lorimer, en su edición de 1908, restringido a las entradas sobre Qatar. Lo desarrolla el usuario yaser-aj en el contexto del hackathon qai-hf-hackathon-2026, y constituye el motor de búsqueda de Qafal, una aplicación que permite formular preguntas en árabe o inglés sobre un mapa de Qatar de 1908 y obtener respuestas que citan la página exacta de la fuente.

El problema que resuelve es concreto: la recuperación densa de bge-m3 original falla de forma acusada cuando la consulta está en árabe y el documento indexado está en inglés victoriano, con grafías transliteradas como *Dohah*, *Wakrah* o *Bida'*. El fine-tuning eleva el Recall@1 en árabe del 38,1 % al 78,6 % sobre un conjunto de 172 preguntas de test, manteniendo el rendimiento en inglés.

Arquitectura XLM-RoBERTa con 567.754.752 parámetros, salida densa de 1.024 dimensiones (estado [CLS] normalizado), licencia MIT y pesos en safetensors y ONNX (incluida una versión int8 de 571 MB para CPU). No es un modelo generativo: es un encoder de recuperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), modo denso de bge-m3 |
| Parametros totales | 567.754.752 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de bge-m3) |
| Tipos de cuantizacion | int8 (ONNX, 571 MB); pesos completos en safetensors |
| Idiomas soportados | en, ar |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (model_int8.onnx) |
| Dimension del embedding | 1.024 (estado [CLS] normalizado) |
| Libreria | sentence-transformers |
| Modelo base | BAAI/bge-m3 |
| Tamano del repo | 5,7 GB |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-m3, un encoder multilingue basado en XLM-RoBERTa, y conserva unicamente su modo denso: la representacion es el estado [CLS] de `last_hidden_state`, normalizado, sin las cabezas dispersa ni multi-vector de bge-m3. El fine-tuning se realizo con `CachedMultipleNegativesRankingLoss` con escala 50 (temperatura 0,02, la misma con la que se entreno bge-m3), batch de 64 sin pasajes duplicados, learning rate 1e-5 con decaimiento lineal y 10 % de warm-up, en bf16.

Los datos de entrenamiento proceden del dataset yaser-aj/qatar-1908-search-questions: Qwen3.6-35B-A3B genero, via HF Inference Providers, cuatro preguntas en ingles y cuatro en arabe por cada uno de los 567 pasajes de Lorimer, aportando los nombres arabes y modernos de los lugares y personas citados, hasta 4.529 pares tras limpieza. El split se hizo por entrada original del Gazetteer con semilla 1908 (75 % train, 10 % dev, 15 % test). Se mino un negativo duro por pregunta con el modelo base, seleccionando entre los 10 pasajes erroneos mejor puntuados y descartando fragmentos de la misma entrada y candidatos a menos de 0,02 de la puntuacion correcta. El nDCG@10 de dev alcanzo su maximo a las 2,3 epocas (0,907 frente a 0,772 del base) y el modelo final se entreno 2,25 epocas. Todo el proceso (dos entrenamientos, evaluaciones y exportacion int8) consumio 19 minutos en una Nvidia A10G (a10g-large), con un coste aproximado de 0,50 USD mas 0,25 USD de llamadas a Inference Providers.

## Capacidades

- Generacion de embeddings densos de frases para busqueda semantica y similitud entre consultas y pasajes.
- Recuperacion cross-lingue arabe-ingles sobre texto historico: consultas en arabe contra documentos en ingles de 1908 con transliteraciones antiguas.
- Manejo de variantes ortograficas historicas de toponimos qataries (*Dohah*, *Wakrah*, *Bida'*, *Shaqiq*).
- Buen rendimiento tambien en busqueda sobre texto contemporaneo (Wikipedia, Wikidata, OpenStreetMap) pese a no haberse entrenado para ello.
- Integracion con sentence-transformers (`encode`, `similarity`) y con Text Embeddings Inference (tag `text-embeddings-inference`, `endpoints_compatible`).
- Inferencia en CPU sin PyTorch mediante el fichero ONNX int8.
- No soporta tool calling, agentes, vision ni generacion de texto: es exclusivamente un encoder de recuperacion.

## Casos de uso

- Busqueda documental en archivos historicos: indexar un corpus de textos coloniales o gazetteers y permitir consultas en arabe que recuperen los pasajes relevantes en ingles, como hace Qafal con las 567 entradas de Lorimer sobre Qatar.
- RAG con citas verificables: usar el modelo como recuperador en un pipeline que entregue los 4 mejores pasajes a un LLM generativo obligado a citar la fuente, reduciendo respuestas inventadas; en la evaluacion del autor, la precision de las respuestas subio de 91 a 98 sobre 133 preguntas.
- Investigacion genealogica y toponimica del Golfo: resolver consultas sobre nombres de lugares y tribus con grafias antiguas contra fuentes de referencia de 1908.
- Digitalizacion de patrimonio cultural: construir interfaces de consulta en arabe y ingles sobre mapas y textos historicos para museos y bibliotecas.
- Recuperacion cross-lingue en aplicaciones bilingues arabe-ingles: cualquier sistema donde la consulta y el documento esten en idiomas distintos y se requiera alineamiento semantico.
- Busqueda geografica aumentada: combinado con BM25 y reglas de toponimos (como hace la app original), sirve de capa densa en un motor hibrido sobre datos de OpenStreetMap o Wikidata (Recall@3 de 73,3 % en el conjunto de 400 preguntas modernas).
- Despliegue en entornos sin GPU: el modelo int8 ONNX de 571 MB permite servir busqueda semantica en CPU con coste minimo.

## Benchmarks y rendimiento

172 preguntas de test (88 en ingles, 84 en arabe) sobre 83 pasajes, buscadas contra los 567 pasajes de Lorimer:

| Modelo | Recall@1 | Recall@3 | Recall@10 | MRR@10 |
|---|---:|---:|---:|---:|
| bge-m3 (base) | 59,9 % | 78,5 % | 94,2 % | 0,713 |
| Fine-tuned sin ver los 83 pasajes de test (rama `heldout`) | 78,5 % | 91,9 % | 97,7 % | 0,861 |
| Fine-tuned sobre todos los pasajes (este modelo) | 82,6 % | 94,8 % | 98,8 % | 0,892 |

Recall@1 por idioma:

| Modelo | Ingles | Arabe |
|---|---:|---:|
| bge-m3 (base) | 80,7 % | 38,1 % |
| Fine-tuned, test no visto | 83,0 % | 73,8 % |
| Fine-tuned sobre todos los pasajes | 86,4 % | 78,6 % |

Busqueda hibrida dentro de la app (int8, mezcla con BM25 y reglas de toponimos, pasaje correcto entre los 4 entregados):

| Busqueda | Global | Ingles | Arabe |
|---|---:|---:|---:|
| bge-m3 base int8 | 76,2 % | 84,1 % | 67,9 % |
| Fine-tuned int8 | 80,8 % | 86,4 % | 75,0 % |

Busqueda contemporanea (400 preguntas, 200 pasajes de Wikipedia, Wikidata y OpenStreetMap), no entrenada: Recall@3 pasa de 63,2 % a 73,3 %. Calidad de respuesta final con Qwen3.6-35B-A3B: respuestas correctas de 91 a 98 y respuestas del tipo "mis fuentes no lo dicen" de 27 a 20 sobre 133 preguntas.

## Requisitos de hardware

- Pesos completos en safetensors: aproximadamente 2,3 GB en fp32 (567 M de parametros); el repo ocupa 5,7 GB por incluir tambien la exportacion ONNX.
- Version int8 ONNX: 571 MB, ejecutable en CPU sin PyTorch.
- GPU: cabe holgadamente en cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090); para lotes grandes se recomienda A10G, L4, A100 o H100. El autor entreno en una A10G.
- Despliegue: sentence-transformers, Text Embeddings Inference (TGI), ONNX Runtime y cualquier servidor compatible con endpoints de embeddings.
- Latencia y throughput: no disponibles en la informacion proporcionada; como referencia de coste, el entrenamiento completo con evaluaciones y exportacion tomo 19 minutos en una A10G por unos 0,50 USD.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Recall@1 (test del autor) | Notas |
|---|---|---:|---|---:|---|
| bge-m3-qatar-1908 | 567 M | en, ar | MIT | 82,6 % | Especializado en Lorimer 1908; recuperacion cross-lingue arabe-ingles historica |
| BAAI/bge-m3 | 567 M | multilingue | MIT | 59,9 % | Base generalista; mucho mas debil en arabe sobre este corpus (38,1 %) |
| Alternativas multilingues de embeddings (p. ej. multilingual-e5) | no disponible | multilingue | no disponible | no disponible | No evaluadas en la informacion proporcionada |

La comparacion directa solo es valida dentro de este corpus; el modelo especializado no debe esperarse que supere a bge-m3 en dominios generales.

## Limitaciones y advertencias

- Ajustado a un unico archivo: las entradas de Lorimer de 1908 sobre Qatar y la historia de Qatar. Puede ayudar en otros textos historicos del Golfo, pero no se ha probado en ellos.
- Las preguntas de entrenamiento las escribio una maquina (Qwen3.6-35B-A3B) y el test escrito es pequeno (172 preguntas), por lo que diferencias de 2 a 3 puntos estan dentro del ruido estadistico.
- El modelo principal se entreno sobre todos los pasajes, incluidos los de test, con otras preguntas; la cifra honesta de generalizacion es la de la rama `heldout` (78,5 % Recall@1), no la del modelo publicado.
- Los vectores int8 coinciden con el modelo completo a coseno 0,974 de media, lo que introduce una perdida pequena pero real de precision.
- Riesgo de alucinacion: el modelo no genera texto, pero un LLM que lo use como recuperador puede responder sin respaldo si el pasaje correcto no aparece entre los recuperados; el diseno de Qafal mitiga esto obligando a citar y a declarar cuando las fuentes no cubren la pregunta.
- Sesgos: el corpus subyacente es una fuente colonial britanica de 1908, con la terminologia y las categorias de la epoca; los embeddings pueden reflejar esas perspectivas.
- Licencia MIT: permite uso comercial sin restricciones adicionales conocidas, pero el modelo base bge-m3 y el corpus de Lorimer deben verificarse por separado si se redistribuyen.
- Sin soporte de tool calling, agentes ni generacion: no es adecuado como sustituto de un LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yaser-aj/bge-m3-qatar-1908
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Dataset de preguntas: https://huggingface.co/datasets/yaser-aj/qatar-1908-search-questions
- Dataset del corpus: https://huggingface.co/datasets/yaser-aj/qatar-1908
- Demo Qafal: https://huggingface.co/spaces/yaser-aj/qafal
- Codigo (scripts de fine-tuning): https://github.com/DustyYak286/qafal
