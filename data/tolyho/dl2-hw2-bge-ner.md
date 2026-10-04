# tolyho/dl2-hw2-bge-ner

## Resumen

`tolyho/dl2-hw2-bge-ner` es un modelo de reconocimiento de entidades nombradas (NER) obtenido por fine-tuning de `BAAI/bge-small-en-v1.5`, un encoder transformer de tipo BERT de 33.215.625 parámetros, sobre el corpus `voorhs/conll2003-corrupted`. El resultado es un clasificador de tokens que asigna las nueve etiquetas BIO del esquema estándar de CoNLL-2003 y que se distribuye bajo licencia MIT, con pesos en safetensors y compatibilidad directa con el pipeline `token-classification` de HuggingFace Transformers.

El modelo procede de un trabajo académico (homework 02 del curso DL2, HSE) y su interés es fundamentalmente metodológico: la model card documenta dos ejecuciones pareadas con la misma semilla, hiperparámetros y número de épocas, una con 10.000 filas de entrenamiento y otra con 10.010 filas tras añadir diez ejemplos etiquetados sintéticamente con `Qwen/Qwen2.5-7B-Instruct-AWQ`. La conclusión publicada es que la aumentación sintética mejoró el F1 de validación (0,916403 frente a 0,912082) pero no el F1 de test (0,864522 frente a 0,868703), lo que lo convierte en un caso reproducible de selección de checkpoint por validación sin filtrar información de test.

Se trata de un modelo pequeño (0,1 GB de repositorio), monolingüe en inglés, sin capacidad generativa, con 0 descargas y 0 likes en el momento de redactar esta ficha y sin validación externa por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (modelo base `BAAI/bge-small-en-v1.5`) con cabeza de clasificación de tokens; la model card no detalla número de capas ni dimensión oculta |
| Parametros totales | 33.215.625 (dato real de los safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base `bge-small-en-v1.5` es un encoder con 512 posiciones (dato del modelo base, no confirmado en la ficha del autor) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |
| Tarea | token-classification (NER) |
| Etiquetas | 9 etiquetas BIO de CoNLL-2003 (O más B-/I- de PER, ORG, LOC y MISC, según el esquema estándar del corpus) |
| Dataset de entrenamiento | `voorhs/conll2003-corrupted` |
| Modelo base | `BAAI/bge-small-en-v1.5` |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer bidireccional de tipo BERT al que se añade una cabeza lineal de clasificación de tokens sobre las representaciones de cada posición. No hay decodificación autoregresiva, ni atención lineal, ni decodificación especulativa; la salida es una secuencia de etiquetas BIO alineada con los tokens de entrada. La model card no publica la configuración interna de capas (número de capas, dimensión oculta, cabezas de atención), por lo que ese detalle queda como no disponible.

El entrenamiento se realizó sobre `voorhs/conll2003-corrupted` con dos ejecuciones comparables: una baseline de 10.000 filas y otra de 10.010 filas que incorpora diez ejemplos adicionales etiquetados sintéticamente con `Qwen/Qwen2.5-7B-Instruct-AWQ`. Ambas usaron semilla 42, learning rate 5,373713206635395e-5, batch size 4 por GPU sobre dos Tesla T4, precisión FP16, weight decay 0,01 y tres épocas. Los checkpoints se seleccionaron por F1 de validación completo (sin seleccionar por puntuaciones de test), las posiciones de padding y de tokens especiales se etiquetaron con -100, y el ajuste de hiperparámetros se hizo con veinte trials de Optuna sobre subconjuntos con semilla de 2.048 ejemplos de entrenamiento y 512 de validación. No se documenta RLHF ni DPO, ya que la tarea no es generativa. El autor advierte explícitamente de que las etiquetas sintéticas introducidas son estructuralmente válidas pero contienen errores.

## Capacidades

- Reconocimiento de entidades nombradas en inglés sobre las cuatro categorías clásicas de CoNLL-2003: persona (PER), organización (ORG), localización (LOC) y miscelánea (MISC).
- Etiquetado a nivel de token con esquema BIO y agregación de entidades mediante `aggregation_strategy="simple"` en el pipeline de Transformers.
- Integración directa con `transformers` y con `endpoints_compatible`, lo que permite desplegarlo como Inference Endpoint o tras una API HTTP estándar de clasificación de tokens.
- Capacidad de servir como preetiquetador en flujos de anotación humana, dado que devuelve etiquetas y puntuaciones por token.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; el modelo se declara únicamente para inglés.
- Capacidad de contexto largo: no disponible; el modelo base es un encoder con ventana limitada, por lo que los documentos deben fragmentarse.

## Casos de uso

- Extracción de entidades en archivos periodísticos en inglés: el modelo etiqueta personas, organizaciones y localizaciones en el texto, lo que permite construir índices de entidades sobre hemerotecas y bases de datos documentales. Su F1 de test de 0,8687 es suficiente para generar candidatos que luego se revisan.
- Detección de información personal identificable antes de un pipeline de datos: al reconocer nombres de persona y organizaciones, se puede usar como primer filtro de anonimización o de enmascarado previo a un almacenamiento en crudo.
- Enriquecimiento de CRM y bases de datos de clientes: extraer empresas y localizaciones de correos, notas de reunión y documentos en inglés permite poblar campos estructurados sin intervención manual.
- Preprocesado para RAG sobre corpus ingleses: las entidades detectadas se pueden usar como metadatos para filtrar o enrutar la recuperación documental, mejorando la precisión del recuperador frente a la búsqueda puramente vectorial.
- Cribado de currículums y ofertas de empleo en inglés: detección de nombres de candidatos, empresas empleadoras y ubicaciones para clasificación automática de candidaturas.
- Monitorización de menciones de marca: procesar titulares y cuerpos de noticia para detectar la organización objetivo junto con personas y lugares asociados, y generar alertas de reputación.
- Preetiquetado en proyectos de anotación: el modelo genera etiquetas iniciales que los anotadores corrigen, reduciendo el coste por ejemplo frente a la anotación desde cero.
- Reproducción académica y docencia: sirve como baseline reproducible de una tarea de NER con particiones comparables, dado que el autor publica los hiperparámetros exactos, la semilla y las ejecuciones registradas en Comet.
- Análisis de redes de relaciones en noticias: agregar PER-ORG-LOC por documento para construir grafos de coocurrencia de entidades a escala de corpus.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las dos ejecuciones son comparables entre sí (misma semilla, mismos hiperparámetros y tres épocas); el autor indica que no se reentrenó ningún modelo para la publicación.

| Run | Filas de entrenamiento | F1 validación | Precisión test | Recall test | F1 test |
|---|---:|---:|---:|---:|---:|
| Baseline | 10.000 | 0,912082 | 0,854063 | 0,883853 | 0,868703 |
| Con etiquetas sintéticas | 10.010 | 0,916403 | 0,849453 | 0,880135 | 0,864522 |

Conclusiones declaradas por el autor: la aumentación sintética con diez ejemplos generados por `Qwen/Qwen2.5-7B-Instruct-AWQ` no mejoró el F1 de test en esta única comparación pareada, pese a elevar el F1 de validación. No se publican resultados en MMLU, HumanEval, GSM8K ni en otros conjuntos, ni comparaciones numéricas con modelos de terceros.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 133 MB (33.215.625 parámetros × 4 bytes). En FP16: aproximadamente 66 MB. En INT8: aproximadamente 33 MB. El repositorio completo ocupa 0,1 GB, según el dato de HuggingFace.
- Inferencia en CPU perfectamente viable, incluidos portátiles y dispositivos de un solo núcleo o Raspberry Pi, dado el tamaño del modelo.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4090, GTX 1650 o incluso GPUs con 4 GB de VRAM, ya que el modelo completo en FP16 ocupa decenas de megabytes.
- GPU recomendadas para producción de alto volumen: cualquier GPU con soporte de FP16 (T4, L4, A10, A100, H100) si se necesita procesar grandes lotes por segundo; el coste de cómputo es bajo en todos los casos.
- Entrenamiento original: dos Tesla T4 con FP16 y batch size 4 por GPU durante tres épocas, lo que da una idea de la escala de recursos necesaria para reproducirlo.
- Opciones de despliegue: pipeline de `transformers`, `transformers.pipeline("token-classification")`, exportación a ONNX con Optimum, TorchScript, o servidores de inferencia genéricos. vLLM, TGI, llama.cpp y Ollama no están orientados a esta tarea: el modelo no es generativo y no publica pesos GGUF, por lo que esas rutas no aplican directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos comparables no provienen de la model card analizada y no se han verificado en esta ficha; se marcan como "no verificado" cuando corresponde.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| `tolyho/dl2-hw2-bge-ner` | 33.215.625 | no disponible (base con 512 posiciones) | NER inglés, 9 etiquetas BIO de CoNLL-2003 | MIT | HuggingFace, 0 descargas, 0 likes | F1 test 0,868703 (baseline); F1 validación 0,916403 (sintético) |
| `BAAI/bge-small-en-v1.5` (modelo base) | ~33M | 512 posiciones (no verificado) | Embeddings de texto (no NER) | MIT | HuggingFace, ampliamente utilizado | No comparable: no realiza NER |
| `dslim/bert-base-NER` | ~108M (no verificado) | 512 (no verificado) | NER inglés, etiquetas PER/ORG/LOC/MISC | MIT (no verificado) | HuggingFace, muy descargado | No verificado |
| `Jean-Baptiste/roberta-large-ner-english` | ~355M (no verificado) | 514 (no verificado) | NER inglés, etiquetas PER/ORG/LOC/MISC | no verificado | HuggingFace | No verificado |

La comparación honesta es que `dl2-hw2-bge-ner` es entre tres y diez veces más pequeño que las alternativas habituales de NER en inglés, con un F1 de test de 0,8687 que deja margen frente a encoders de mayor tamaño. No se han publicado en la información disponible comparaciones directas de este modelo con esas alternativas sobre CoNLL-2003.

## Limitaciones y advertencias

- Monolingüe en inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas, por lo que su uso en textos en español produciría resultados no fiables.
- El dataset de entrenamiento es `voorhs/conll2003-corrupted`, una variante del corpus CoNLL-2003 con etiquetas potencialmente degradadas. La model card no detalla el tipo ni el alcance de esa corrupción, lo que introduce incertidumbre sobre la calidad del etiquetado de origen.
- Las diez etiquetas sintéticas generadas con `Qwen/Qwen2.5-7B-Instruct-AWQ` contienen errores, según el propio autor, y la aumentación no mejoró el F1 de test. Cualquier reutilización de ese pipeline debería auditar las etiquetas generadas.
- No es un modelo generativo: no alucina texto, pero sí puede producir falsos positivos y falsos negativos de clasificación. La precisión de test (0,854063) implica una tasa apreciable de entidades incorrectas, y conviene umbralizar por puntuación según el caso de uso.
- Solo cubre cuatro tipos de entidad (PER, ORG, LOC, MISC). No reconoce fechas, importes, códigos postales, identificadores fiscales ni entidades específicas de dominio biomédico o legal.
- Sesgos heredados del corpus CoNLL-2003: dominio de noticias anglosajonas de finales de los noventa, con la consiguiente degradación en textos informales, redes sociales, dominio clínico o registros administrativos.
- Limitación de contexto propia de un encoder BERT: los documentos largos deben dividirse en fragmentos, lo que puede partir entidades a caballo entre fragmentos y generar errores en las fronteras. Se recomienda solapamiento entre ventanas.
- El modelo es el resultado de un trabajo académico (homework), no de un proceso de publicación revisado por pares; no hay garantía de mantenimiento, soporte ni actualizaciones.
- Con 0 descargas y 0 likes, no existe validación independiente de los resultados publicados; los números de la tabla de benchmarks proceden exclusivamente del autor.
- Licencia MIT, que permite uso comercial, modificación y redistribución, siempre conservando el aviso de copyright y la licencia. Conviene verificar también la licencia del modelo base `BAAI/bge-small-en-v1.5` y las condiciones del corpus CoNLL-2003 para un uso comercial del modelo resultante.
- El enlace a la ejecución de Kaggle es privado, por lo que la reproducibilidad completa del entrenamiento depende de la documentación de la model card y de los registros de Comet.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tolyho/dl2-hw2-bge-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Dataset de entrenamiento: https://huggingface.co/datasets/voorhs/conll2003-corrupted
- Modelo usado para generar las etiquetas sintéticas: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-AWQ
- Experimento baseline en Comet: https://www.comet.com/polinasuslovas2006/dl2-hw2-ner/fa7a07c1b48a5684a2c5a7774fccfd7a
- Experimento con etiquetas sintéticas en Comet: https://www.comet.com/polinasuslovas2006/dl2-hw2-ner/20937aedb38a5efbb41767c0602127b2
- Ejecución de entrenamiento en Kaggle (privada): https://www.kaggle.com/code/tolyaho/dl-2-hw-2-training
- Enunciado del trabajo (repositorio DL2_HSE): https://github.com/thecrazymage/DL2_HSE/tree/main/homeworks/homework_02
- Nota sobre la búsqueda web: los resultados obtenidos en la búsqueda no guardan relación con este modelo (corresponden a una serie de televisión), por lo que no se han incluido como enlaces relevantes.
