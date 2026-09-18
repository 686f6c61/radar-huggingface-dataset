# williamtr18/hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

El modelo `williamtr18/hf_food_not_food_text_classifier-distilbert-base-uncased` es un clasificador de texto binario obtenido mediante ajuste fino (*fine-tuning*) de `distilbert/distilbert-base-uncased`. Lo publica el usuario williamtr18 en HuggingFace y su propósito, deducible del propio nombre del repositorio, es distinguir si un texto trata sobre comida o no. Se trata, por tanto, de un modelo discriminativo de dominio muy concreto, no de un modelo generativo de propósito general.

Técnicamente es un transformer encoder de 66.955.010 parámetros (aproximadamente 67 M), con una ventana máxima de 512 tokens heredada del modelo base, pesos en formato safetensors y licencia Apache 2.0. La model card es la generada automáticamente por la librería `Trainer` de Transformers y no aporta información sobre el conjunto de datos, los usos previstos ni el mapeo de etiquetas.

Su relevancia actual es limitada: el repositorio acumula 0 descargas y 0 *likes*, no incluye documentación sustantiva y los resultados declarados (accuracy 1,0 y pérdida de validación 0,0005) proceden de un conjunto de evaluación de tamaño no especificado, lo que impide considerarlo validado. Resulta útil como ejemplo reproducible de un pipeline de clasificación con DistilBERT o como punto de partida para un clasificador temático de alimentos, siempre que se reentrene y evalúe con datos propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT destilado (DistilBERT base) |
| Parámetros totales | 66.955.010 (≈ 66,96 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible en la model card; el modelo base es únicamente en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Número de etiquetas | no disponible (el nombre sugiere dos clases: comida / no comida) |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamaño del repositorio | 0,3 GB |
| Librería | transformers 5.17.0 |
| Fecha de creación | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un transformer encoder con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, obtenido por destilación de conocimiento a partir de BERT-base en el modelo original de HuggingFace. Sobre ese *checkpoint* se ha añadido una cabeza de clasificación (`DistilBertForSequenceClassification`), que en este caso produce una decisión binaria. El tokenizador asociado es WordPiece sin distinción de mayúsculas (*uncased*), con un vocabulario de 30.522 tokens.

En cuanto al entrenamiento, la model card indica que se usó un conjunto de datos no identificado ("an unknown dataset") y proporciona los hiperparámetros: tasa de aprendizaje 1e-4, tamaño de lote 32 (entrenamiento y evaluación), 10 épocas, semilla 42, optimizador `AdamW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-8, y planificador lineal. El registro de pasos muestra 70 pasos totales, es decir, 7 pasos por época; con un lote de 32, esto implica aproximadamente 224 ejemplos de entrenamiento, una cifra muy reducida que explica la pérdida de validación de 0,0005 y la exactitud de 1,0 reportadas. No se documenta ningún proceso de RLHF, DPO ni innovación técnica adicional (no hay decodificación especulativa, atención lineal ni mecanismos híbridos, dado que es un modelo encoder puro).

## Capacidades

- Clasificación de texto en dos clases: el modelo emite una etiqueta por secuencia de entrada mediante una cabeza de clasificación; la semántica exacta de las etiquetas no está documentada, pero el nombre del repositorio apunta a "comida" frente a "no comida".
- Procesamiento de secuencias de hasta 512 tokens, suficiente para párrafos cortos, descripciones de productos, reseñas o líneas de menú.
- Inferencia eficiente en CPU y GPU por su reducido tamaño (67 M de parámetros).
- Integración directa con `transformers` (`pipeline("text-classification")`) y con `text-embeddings-inference` según las etiquetas del repositorio, lo que permite servirlo tras un endpoint compatible con la API de HuggingFace.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No dispone de *tool calling*, *function calling* ni capacidades de agente o razonamiento multi-paso.
- No hay evidencia de capacidades multilingües: el modelo base es exclusivamente en inglés y la model card no declara idiomas.

## Casos de uso

- Filtrado temático de contenido en foros o comunidades: clasificar en tiempo real las publicaciones entrantes para decidir si van al subforo de gastronomía o a otro, usando la cabeza binaria sobre los primeros 512 tokens del texto.
- Trieado de reseñas de restaurantes: preclasificar grandes volúmenes de reseñas para separar las que hablan de comida de las que tratan de servicio, precio o instalaciones, y enrutar cada grupo a un análisis distinto.
- Enrutado de consultas en asistentes conversacionales: detectar si la consulta del usuario es de dominio alimentario antes de derivarla a un modelo mayor especializado, reduciendo coste de inferencia en el 100 % de los casos triviales.
- Construcción y depuración de corpus: filtrar un *dataset* web para retener únicamente textos gastronómicos antes de entrenar un modelo mayor, usando este clasificador como etapa de criba.
- Monitorización de menciones en redes sociales para marketing: etiquetar publicaciones como relacionadas o no con alimentación para alimentar paneles de análisis de marca, con el modelo desplegado en CPU por su bajo coste.
- Etiquetado de notas y transcripciones en aplicaciones de nutrición: clasificar entradas de diario o transcripciones de voz para separar registros de comidas frente a otras anotaciones del usuario.
- Enriquecimiento de catálogos en plataformas de *delivery*: asignar automáticamente una marca temática a descripciones de productos o comercios cuando no existe categoría declarada.
- Componente de ejemplo o *baseline* educativo: servir de plantilla reproducible de un pipeline de clasificación con DistilBERT, ya que el repositorio conserva los hiperparámetros completos de entrenamiento.

## Benchmarks y rendimiento

El campo `model-index` de la model card está vacío (`results: []`), por lo que no hay resultados de benchmarks estándar (MMLU, GLUE, etc.) publicados en la información disponible. Los únicos datos son los del registro de entrenamiento del `Trainer`, medidos sobre un conjunto de evaluación no descrito:

| Métrica (según el autor) | Valor |
|---|---|
| Pérdida de validación final (época 10) | 0,0005 |
| Exactitud de validación final (época 10) | 1,0 |
| Pérdida de entrenamiento final (época 10) | 0,0006 |
| Pasos totales de entrenamiento | 70 |
| Ejemplos de entrenamiento estimados | ≈ 224 (7 pasos/época × lote 32) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (los pesos ocupan unos 268 MB) y en torno a 130-140 MB en FP16; con lotes pequeños el consumo total se mantiene por debajo de 1 GB.
- GPU recomendadas: ninguna en concreto; el modelo cabe con holgura en cualquier GPU con más de 2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100, donde el factor limitante será el ancho de banda y no la capacidad de memoria.
- Cabe holgadamente en GPU de consumo e incluso ejecuta en CPU: es viable en un portátil sin GPU dedicada o en una instancia pequeña de nube.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, servidor `text-embeddings-inference` (etiqueta presente en el repositorio), exportación a ONNX Runtime para CPU, y cualquier servidor de inferencia compatible con modelos de clasificación de Transformers. No se incluyen pesos en GGUF, por lo que su uso con llama.cpp u Ollama requeriría conversión previa y no es un escenario previsto para un encoder de clasificación.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La comparación se limita a características estructurales y de licencia, ya que este modelo no tiene benchmarks publicados y su tarea (clasificación binaria comida / no comida) es demasiado específica para compararla con métricas de modelos de propósito general.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (DistilBERT fine-tuned) | 66,96 M | 512 tokens | Apache 2.0 | HuggingFace, safetensors | Cabeza binaria de dominio específico; sin documentación ni benchmarks |
| distilbert-base-uncased | 66,96 M | 512 tokens | Apache 2.0 | HuggingFace | Modelo base sin ajustar; requiere fine-tuning para clasificación |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | HuggingFace | Mayor tamaño y coste; referencia habitual en clasificación de texto en inglés |
| roberta-base | 125 M | 512 tokens | MIT | HuggingFace | Tokenizador BPE con mejor tratamiento de mayúsculas y subpalabras |

No hay datos de rendimiento que permitan establecer una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Exactitud de 1,0 sobre un conjunto de evaluación de tamaño no declarado y presumiblemente muy pequeño (el entrenamiento usó unos 224 ejemplos): es un indicio claro de sobreajuste y no una garantía de generalización.
- El conjunto de datos de entrenamiento y evaluación no está documentado ("an unknown dataset"), por lo que se desconoce su composición, su dominio y sus posibles sesgos.
- El mapeo de etiquetas no está especificado: no se puede saber con certeza qué índice corresponde a "comida" y cuál a "no comida" sin inspeccionar `config.json`.
- Rendimiento multilingüe no fiable: el modelo base es únicamente en inglés y el tokenizador *uncased* elimina las mayúsculas y no está adaptado a acentos ni caracteres propios del castellano.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto libre), pero sí existe riesgo de falsos positivos y falsos negativos sistemáticos en dominios alejados de los datos de entrenamiento.
- Ventana de contexto de 512 tokens: los textos más largos deben truncarse, lo que puede descartar la parte relevante del documento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, sin restricciones copyleft, pero el usuario asume toda la responsabilidad sobre el modelo resultante.
- Estado del repositorio: 0 descargas y 0 *likes* en el momento de redactar esta ficha, sin *issues* ni mantenimiento conocido; no hay garantía de soporte.
- No es apto para producción sin un reentrenamiento y una evaluación con datos propios y representativos del caso de uso real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/williamtr18/hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a documentación de soporte de Windows y no guardan relación con el modelo. No se dispone de paper, blog, repositorio adicional ni demo asociados.
