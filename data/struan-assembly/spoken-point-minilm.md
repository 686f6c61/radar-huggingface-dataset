# struan-assembly/spoken-point-minilm

## Resumen

spoken-point-minilm es un modelo de embeddings de frases derivado de sentence-transformers/all-MiniLM-L12-v2, desarrollado por Struan Assembly, LLC. Su proposito es determinar si una frase hablada (transcrita) respalda o formula un punto concreto, distinguiendo una parafrasis real de un "casi acierto" (near miss) que comparte tema pero sostiene una afirmacion distinta. El modelo base puntua sobre todo por solapamiento tematico, de modo que dos frases sobre el mismo asunto obtienen similitud alta aunque digan cosas diferentes; este ajuste fino corrige ese comportamiento.

Arquitectonicamente es un transformer BERT de 12 capas con 33,36 millones de parametros, la misma estructura que all-MiniLM-L12-v2, reentrenado con MultipleNegativesRankingLoss usando near misses como negativos duros. El resultado es un encoder de frases pequeno (repo de 0,3 GB) que genera embeddings normalizados de 384 dimensiones, apto para ejecucion en navegador via Transformers.js con cuantizacion int8 de 34 MB.

Es relevante para pipelines de verificacion de afirmaciones en audio transcrito, moderacion de contenido hablado y sistemas de recuperacion semantica donde la distincion entre "mismo tema" y "misma afirmacion" es critica. Su limitacion principal es que solo cubre ingles y esta entrenado sobre puntos cortos hablados, no sobre documentos ni consultas de busqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder), 12 capas, base all-MiniLM-L12-v2 |
| Parametros totales | 33.360.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de all-MiniLM-L12-v2, tipicamente 128-256 tokens; el autor no lo especifica) |
| Tipos de cuantizacion | int8 (q8, archivo de 34 MB para Transformers.js); safetensors en precision completa |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo parte de all-MiniLM-L12-v2, un encoder BERT de 12 capas y 33,36 millones de parametros que produce embeddings de frases de 384 dimensiones mediante pooling medio y normalizacion. Sobre esa base se aplico un ajuste fino supervisado con pares de frases: cada punto corto se empareja con versiones habladas que lo formulan correctamente y con near misses que no lo hacen. Los datos son ejemplos sinteticos distribuidos en dominios de negocio, tecnico, docencia y habla cotidiana.

La funcion de perdida empleada es MultipleNegativesRankingLoss, con los near misses incorporados como negativos duros. Esta eleccion fuerza al modelo a separar representaciones de frases que comparten vocabulario tematico pero difieren en la afirmacion concreta, que es precisamente el fallo del modelo base. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no procede en un encoder de similitud).

## Capacidades

- Generacion de embeddings de frases para similitud semantica (pipeline sentence-similarity).
- Distincion entre parafrasis real y near miss tematico: en evaluacion sobre puntos reservados, ordena correctamente una parafrasis por encima de un near miss el 87,7 % de las veces, frente al 49,7 % del modelo base.
- Extraccion de caracteristicas (feature-extraction) con pooling medio y normalizacion.
- Ejecucion en navegador mediante Transformers.js con cuantizacion int8.
- Compatible con text-embeddings-inference y endpoints de Hugging Face.
- Solo ingles; no soporta otros idiomas.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento: es un encoder de embeddings, no un modelo generativo.

## Casos de uso

- Verificacion de afirmaciones en transcripciones de reuniones: dado un punto acordado y una frase transcrita, el modelo puntua si la intervencion respalda ese punto, usando el umbral ajustado a sus puntuaciones (mas bajas que las del modelo base).
- Moderacion de contenido hablado: detectar si una frase de un audio afirma algo prohibido aunque use un tema colindante, aprovechando la separacion de near misses.
- Recuperacion semantica en bases de conocimiento de soporte: indexar respuestas de agentes y recuperar la que afirma el mismo hecho, no solo la del mismo tema.
- Control de calidad de subtitulos o notas de voz: comparar la transcripcion con el resumen de referencia para medir fidelidad de la afirmacion.
- Deduplicacion de puntos en actas: agrupar intervenciones que formulan la misma idea y separar las que, aun siendo del mismo asunto, sostienen hechos distintos.
- Clasificacion de feedback de clientes: emparejar comentarios hablados con categorias de reclamacion concretas en lugar de con areas tematicas amplias.
- Despliegue en navegador para busqueda local: usar el archivo int8 de 34 MB en una aplicacion web sin backend, con Transformers.js, para similitud de frases en tiempo real.

## Benchmarks y rendimiento

| Metrica | spoken-point-minilm | all-MiniLM-L12-v2 (base) |
|---|---|---|
| Tasa de acierto al ordenar parafrasis por encima de near miss (puntos reservados) | 87,7 % | 49,7 % |

No se han publicado en la informacion disponible resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estandar; el unico dato es la evaluacion interna descrita en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa: en torno a 0,13 GB (33,36 M de parametros en fp32), mas overhead de runtime; cabe en cualquier GPU consumer.
- Cuantizacion int8: archivo de 34 MB, ejecutable en CPU y en navegador sin GPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es mas que suficiente.
- Opciones de despliegue: sentence-transformers (Python), Transformers.js (navegador), text-embeddings-inference, ONNX Runtime; tambien cabe en llama.cpp/Ollama solo si se convierte a GGUF, aunque no es el formato publicado.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, es un modelo de latencia de milisegundos en CPU para lotes pequenos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| spoken-point-minilm | 33,36 M | no disponible | en | Apache 2.0 | Similitud de puntos hablados con separacion de near misses |
| all-MiniLM-L12-v2 | 33,36 M | no disponible | en | Apache 2.0 | Similitud semantica general; no distingue near misses (49,7 %) |
| all-MiniLM-L6-v2 | ~22,7 M (no confirmado en la informacion) | no disponible | en | Apache 2.0 | Version mas ligera de la familia MiniLM, proposito general |

La comparativa se limita a la familia MiniLM porque no se dispone de datos de otros modelos especializados en verificacion de afirmaciones habladas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no cubre otros idiomas.
- Entrenado sobre puntos cortos hablados, no sobre documentos largos ni consultas de busqueda; su uso fuera de ese dominio degrada la calidad.
- Declaraciones vagas pueden emparejarse con puntos vagos: "we stay on the new timeline" puntua cerca de "Budget is still on track".
- Mismo tema con hecho distinto puede seguir puntuando alto: "I reproduced the crash" frente a "Fixed the crash".
- Las puntuaciones son en general mas bajas que las del modelo base, por lo que los umbrales calibrados para all-MiniLM-L12-v2 resultan demasiado estrictos aqui.
- Riesgo de alucinacion no aplica en sentido generativo (es un encoder), pero si existe riesgo de falsos positivos en la similitud.
- Licencia Apache 2.0 permite uso comercial con atribucion; se debe conservar el aviso de licencia y el reconocimiento al modelo base y a Struan Assembly, LLC.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa ni ecosistema de usuarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/struan-assembly/spoken-point-minilm
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2
- Libreria sentence-transformers: https://www.sbert.net/
- Transformers.js: https://huggingface.co/docs/transformers.js
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales del autor.
