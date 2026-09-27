# toyin88/u2t01-bert-qa

## Resumen

`toyin88/u2t01-bert-qa` es un modelo de question answering extractivo en inglés publicado por el usuario toyin88 como parte del proyecto "U2T01: Adapting BERT for NLP tasks". Se trata de uno de los cuatro modelos del proyecto, cada uno con una cabeza distinta sobre el mismo cuerpo `bert-base-uncased` y con el método de adaptación que sus propias mediciones justificaron. En este caso, la tarea es SQuAD v1.1: dado un párrafo de contexto y una pregunta, el modelo devuelve las posiciones de token de inicio y fin del span que contiene la respuesta.

Técnicamente es un transformer encoder bidireccional de tipo BERT-base con una cabeza de dos clasificadores lineales sobre la última capa oculta, adaptado mediante ajuste completo (full fine-tuning) con la matriz de embeddings congelada. Cuenta con 108.893.186 parámetros, de los cuales 85.056.002 (78,11 %) fueron entrenables, y se entrenó con una única época, secuencia máxima de 384 tokens y semilla fija 42.

Su relevancia es acotada y de carácter metodológico: no es un modelo competitivo ni orientado a producción, sino un artefacto de curso reproducible cuyo interés está en la comparación documentada entre adaptación completa y parcial (F1 de 47,74 frente a 30,78 en test) y en servir como punto de partida para experimentos de adaptación en inglés. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT-base): 12 capas, 768 de dimensión oculta, 12 cabezas de atención, más cabeza de question answering con dos clasificadores lineales de posición (inicio y fin del span) |
| Parametros totales | 108.893.186 (dato real de safetensors) |
| Parametros activos | No aplica: no es un modelo MoE. Parámetros entrenables en el ajuste: 85.056.002 (78,11 %) |
| Longitud de contexto | Secuencia máxima de entrenamiento: 384 tokens. Límite posicional de `bert-base-uncased`: 512 tokens |
| Tipos de cuantizacion | No disponible en la información proporcionada; se publican pesos en precisión completa, sin variantes cuantizadas en el repo |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tag `safetensors`; tamaño del repo 0,4 GB), librería `transformers` |
| Modelo base | `google-bert/bert-base-uncased` |
| Pipeline declarado | `question-answering` |
| Dataset de entrenamiento | `rajpurkar/squad` (SQuAD v1.1) |

## Arquitectura y entrenamiento

La arquitectura es la de `bert-base-uncased`: un encoder transformer bidireccional de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención. Sobre la última capa oculta se añade una cabeza de question answering formada por dos clasificadores lineales que predicen, respectivamente, la posición del token de inicio y la del token de fin de la respuesta dentro del contexto. No hay innovaciones de arquitectura: no se emplea decodificación especulativa, atención lineal, SSM ni componentes híbridos. La adaptación fue un ajuste completo en el que se entrenaron las 12 capas del encoder y la cabeza, manteniendo congelada la matriz de embeddings (aproximadamente 23,8 millones de parámetros de los 108,9 millones totales). El optimizador usó dos grupos de parámetros con tasas de aprendizaje separadas: 0,001 para la cabeza recién inicializada y 3e-05 para el encoder preentrenado.

Los datos de entrenamiento proceden de SQuAD v1.1 (`rajpurkar/squad`). La model card indica "2000 ejemplos de entrenamiento usados" y, de forma contradictoria en el mismo apartado, un submuestreo a "~15k ejemplos" según lo especificado por el enunciado de la práctica; esta discrepancia no se resuelve en la documentación disponible. La configuración declarada es: 1 época, batch size 16, longitud máxima de secuencia 384, semilla 42 y un tiempo de entrenamiento de 1,0 minuto en una Tesla T4. No se documenta RLHF, DPO ni ningún tipo de ajuste por preferencias, algo que no aplica a un modelo extractivo de este tipo.

## Capacidades

- Question answering extractivo en inglés: dada una pregunta y un contexto, devuelve el span de respuesta mediante predicción de posiciones de inicio y fin, con una puntuación asociada.
- Manejo de contextos de hasta 384 tokens en la configuración entrenada (el límite posicional de la arquitectura base es de 512 tokens).
- Capacidad multilingüe: no. El modelo está entrenado y evaluado únicamente en inglés.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado; es una tarea de un solo paso, sin planificación ni uso de herramientas.
- Generación de texto libre: no soportada; la salida es siempre un span del contexto proporcionado.
- Modo "thinking", visión, audio u otras modalidades: no disponibles.
- Capacidad de abstención: no soportada. SQuAD v1.1 no contiene preguntas sin respuesta, por lo que el modelo no puede responder "no lo sé" y siempre devuelve un span.

## Casos de uso

- Docencia y material de curso sobre NLP: el modelo ilustra de forma reproducible el flujo completo de adaptación de BERT a una tarea downstream, con configuración (YAML), semilla y dependencias fijadas que permiten replicar el experimento.
- Comparación de estrategias de adaptación: sirve como referencia de ajuste completo frente a variantes parciales (el propio proyecto reporta F1 de 47,74 con ajuste completo frente a 30,78 con ajuste parcial en test), útil para estudiar el compromiso entre parámetros entrenables y métrica.
- Etiquetado débil de corpus: puede preanotar pares pregunta-respuesta sobre pasajes tipo Wikipedia en inglés, que después se revisan o se filtran por umbral de confianza antes de usarse como datos de entrenamiento de un modelo mayor.
- Componente extractivo en un pipeline de búsqueda de respuestas: dado un conjunto de pasajes recuperados por un motor de búsqueda, el modelo localiza el span exacto de la respuesta en el pasaje, en lugar de generarla, lo que facilita trazabilidad y verificación de la fuente.
- Extracción de campos en documentos en inglés: reformulando cada campo como una pregunta ("¿cuál es la fecha de emisión?") sobre el texto del documento, el modelo puede localizar el valor correspondiente como span.
- Base para experimentos de destilación o cuantización: con 108,9 millones de parámetros y 0,4 GB de pesos, es un punto de partida ligero para probar compresión, exportación a ONNX o cuantización dinámica en entornos de investigación.
- Evaluación de infraestructura de inferencia: su tamaño reducido lo hace adecuado para medir latencia y throughput de distintos runtimes (Transformers, ONNX Runtime, TorchScript) sin necesidad de GPU de gama alta.

## Benchmarks y rendimiento

Solo se han publicado métricas de la propia tarea (SQuAD v1.1), calculadas sobre datos submuestreados y con una única ejecución y semilla.

| Metrica | Test | Validacion |
|---|---:|---:|
| exact_match | 37,30 | 29,50 |
| f1 | 47,74 | 43,68 |

Comparación interna entre métodos de adaptación del mismo proyecto (misma tarea y mismos datos):

| Ejecucion | Metodo | Parametros entrenables | f1 (test) |
|---|---|---:|---:|
| `qa_full_mini` (este modelo) | ajuste completo | 85.056.002 | 47,74 |
| `qa_partial_mini` | ajuste parcial | 28.353.026 | 30,78 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card advierte que una única ejecución con una sola semilla mueve los resultados en torno a ±1–3 puntos, por lo que diferencias menores a ese margen no son significativas, y que al usar datos submuestreados las cifras quedan por debajo de los resultados publicados con el conjunto completo.

## Requisitos de hardware

- Pesos en precisión completa (fp32): aproximadamente 0,42 GB para 108,9 millones de parámetros, consistente con el tamaño de repo declarado de 0,4 GB. En fp16 bajaría a unos 0,21 GB y en int8 dinámico a unos 0,11 GB (estas dos últimas no se distribuyen en el repositorio).
- VRAM estimada para inferencia: por debajo de 1 GB con batch pequeño, incluyendo activaciones; no se han publicado mediciones de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más de memoria. El autor reporta haber entrenado una época en 1,0 minuto en una Tesla T4, lo que da una idea del coste computacional del ajuste.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, serie GTX 10xx en adelante). También es viable la inferencia en CPU para volúmenes bajos.
- Opciones de despliegue: pipeline `question-answering` de `transformers`, exportación a ONNX Runtime o TorchScript, y servicio mediante FastAPI o TorchServe. No se recomienda `llama.cpp`/`Ollama` ni `vLLM` para este caso, ya que no cubren de forma estándar un modelo encoder-only con cabeza de QA extractiva.
- Latencia y throughput: no disponibles en la información proporcionada. Con entradas de hasta 384 tokens el coste por consulta es bajo, pero no se publican cifras medidas.

## Comparativa con modelos similares

Los datos de modelos de terceros proceden de sus fichas públicas y del artículo de BERT citado por el propio autor; se indican aparte de los datos del modelo analizado. Las métricas de esos modelos sobre SQuAD no se detallan aquí porque no forman parte de la información proporcionada por el autor.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | F1 en SQuAD v1.1 |
|---|---:|---|---|---|---|
| `toyin88/u2t01-bert-qa` | 108,9 M | 384 entren. / 512 posicional | Apache 2.0 | safetensors | 47,74 (test, datos submuestreados) |
| `google-bert/bert-base-uncased` (referencia de ajuste completo publicada en Devlin et al., 2018) | 110 M aprox. | 512 | Apache 2.0 | safetensors, PyTorch | 88,5 (dev, datos completos) |
| `distilbert-base-cased-distilled-squad` | 66 M aprox. (6 capas) | 512 | Apache 2.0 | safetensors, PyTorch | No disponible en la información proporcionada |
| `deepset/roberta-base-squad2` | 125 M aprox. | 512 | No disponible en la información proporcionada | safetensors, PyTorch | No disponible en la información proporcionada |

Nota: la comparación con `bert-base-uncased` no es homogénea, ya que la referencia publicada usa el conjunto de entrenamiento completo de SQuAD v1.1 y el conjunto de desarrollo, mientras que este modelo usa datos submuestreados y evalúa en test y validación propios.

## Limitaciones y advertencias

- Uso previsto restringido a investigación y trabajos de curso (benchmarking de estrategias de adaptación y punto de partida para tareas relacionadas en inglés). La model card indica explícitamente que no está pensado para tomar decisiones de producción sobre personas.
- Solo inglés, y con un dominio de entrenamiento estrecho: los contextos de SQuAD son párrafos de Wikipedia, por lo que el rendimiento cae en redes sociales, nombres fuera de convenciones de Europa occidental y entidades que se popularizaron después de la fecha del corpus.
- No puede abstenerse: SQuAD v1.1 no contiene preguntas sin respuesta, así que el modelo siempre devuelve un span aunque la pregunta no sea respondible con el contexto.
- Riesgo de alucinación en sentido extractivo: al forzar siempre una respuesta, puede seleccionar spans incorrectos o incompletos en lugar de reconocer que la información no está presente.
- Sesgos heredados: `bert-base-uncased` arrastra las asociaciones de su corpus de preentrenamiento y este ajuste no incorpora ninguna mitigación.
- Variabilidad entre ejecuciones: una sola ejecución con una sola semilla desplaza los resultados en torno a ±1–3 puntos, de modo que comparaciones dentro de ese margen no son fiables.
- Datos de entrenamiento submuestreados, por lo que las métricas quedan por debajo de los resultados publicados con el conjunto completo; todas las variantes del proyecto usaron los mismos datos, así que la comparación interna entre métodos no se ve afectada.
- Licencia Apache 2.0: permite uso comercial y modificación con obligación de conservar avisos de licencia y copyright, pero la licencia no exime del cumplimiento de las condiciones del dataset de origen ni garantiza idoneidad para producción.
- Ambigüedad documentada en la model card sobre el número de ejemplos de entrenamiento (2000 frente a ~15k), lo que dificulta la reproducibilidad exacta del volumen de datos.
- Sin métricas publicadas de latencia, throughput ni VRAM, y con 0 descargas y 0 likes: no hay evidencia de uso por terceros ni de validación externa.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/toyin88/u2t01-bert-qa
- Artículo de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Dataset SQuAD v1.1: https://huggingface.co/datasets/rajpurkar/squad
- Documentación de BERT en Transformers: https://huggingface.co/docs/transformers/model_doc/bert
- Guía de ajuste fino de Transformers: https://huggingface.co/docs/transformers/training
- Repositorio de referencia del proyecto: no disponible en la información proporcionada (la model card usa un marcador `<this project>` sin URL)
- Recursos relacionados encontrados en la búsqueda web, no vinculados al autor: https://github.com/Xhonklei/BERT_QA_Model, https://github.com/artitw/BERT_QA, https://www.digitalocean.com/community/tutorials/how-to-train-question-answering-machine-learning-models
