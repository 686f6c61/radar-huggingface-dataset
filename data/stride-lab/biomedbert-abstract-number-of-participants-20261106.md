# STRIDE-lab/biomedbert-abstract-number-of-participants-20261106

## Resumen

biomedbert-abstract-number-of-participants-20261106 es un modelo de clasificación de texto en inglés desarrollado por STRIDE-lab en el marco del proyecto PsyNamic, una iniciativa del grupo Ineichen (Universidad de Berna) orientada a la extracción estructurada de metadatos de estudios biomédicos. El modelo resuelve una tarea muy concreta: clasificar el número total de participantes de un estudio (incluidos controles) en categorías predefinidas a partir del título y el resumen de un artículo científico.

Se trata de un fine-tuning de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract`, un transformer encoder tipo BERT con 109.490.699 parámetros (aproximadamente 110 M) y ventana de entrada de 512 tokens. La arquitectura es, por tanto, la de un BERT base estándar adaptado al dominio biomédico mediante preentrenamiento sobre resúmenes de PubMed, y posteriormente ajustado para una clasificación multinomial de 11 etiquetas.

Su relevancia actual es práctica: es el checkpoint desplegado en la webapp de PsyNamic tras la revisión de noviembre de 2026, y sustituye al modelo anterior basado en BioLinkBERT (`STRIDE-lab/biolinkbert-number-of-participants-20250221`, tag `submission-v1`). Está pensado como componente de un pipeline de extracción de evidencia científica, no como modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BiomedBERT base, uncased) |
| Parametros totales | 109.490.699 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (repo en safetensors fp32; cuantizaciones dinámicas posibles vía PyTorch/ONNX, no publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, PyTorch) |

## Arquitectura y entrenamiento

El modelo es un BERT base (12 capas, 768 de dimensión oculta, 12 cabezas de atención, vocabulario uncased) preentrenado por Microsoft sobre resúmenes de PubMed con el objetivo de modelado de lenguaje enmascarado, y ajustado por STRIDE-lab como clasificador de secuencias con una cabeza lineal sobre el token `[CLS]` y 11 clases de salida. La entrada es la concatenación del título y el resumen, truncada a 512 tokens.

El ajuste fino se realizó con los siguientes hiperparámetros: batch size 8, learning rate 5e-5, weight decay 0.01, scheduler lineal con warmup ratio 0.1, 30 épocas máximas, dropout 0.1, gradient clipping 1.0 y early stopping con paciencia 5. La tarea es single-label: se aplica softmax sobre las 11 etiquetas y se predice el argmax. El parámetro `threshold` (0.5) solo se usa para métricas de validación en tareas multilabel y no tiene efecto aquí. El dataset de entrenamiento es privado y no se detalla su tamaño ni composición. La selección del checkpoint se hizo por menor pérdida de validación, y la elección del modelo base (entre BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT, todos con hiperparámetros idénticos) se basó en weighted F1 de validación; el conjunto de test se usó una única vez tras la selección.

## Capacidades

- Clasificación de texto biomédico en inglés: asigna un resumen científico a una de 11 categorías de tamaño muestral.
- Etiquetas de salida: `1-20`, `21-40`, `41-60`, `61-80`, `81-100`, `100-199`, `200-499`, `500-999`, `≥1000`, `Not applicable` y `Unknown`.
- Predicción single-label mediante softmax y argmax, con probabilidades por clase consultables.
- Procesamiento de entradas de hasta 512 tokens (título + resumen).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito.
- Multilingüismo limitado al inglés; no se reporta rendimiento en otros idiomas.

## Casos de uso

- Extracción de metadatos en revisiones sistemáticas: el modelo clasifica automáticamente el tamaño muestral de cada resumen recuperado en una búsqueda bibliográfica, reduciendo el trabajo manual de cribado y extracción de datos en revisiones de gran volumen.
- Enriquecimiento de bases de datos bibliográficas: integrado en un pipeline de ingestión de PubMed, permite poblar un campo estructurado de "número de participantes" por artículo, con la categoría `Unknown` como salvaguarda para casos ambiguos.
- Filtrado por tamaño de estudio: un investigador puede seleccionar estudios con al menos 500 o 1000 participantes ejecutando el modelo sobre los resúmenes candidatos y filtrando por la etiqueta predicha, útil para metaanálisis con criterios de inclusión por potencia estadística.
- Monitorización de evidencia clínica: en flujos de vigilancia de literatura, el modelo etiqueta nuevos resúmenes a medida que se publican y permite priorizar estudios grandes o descartar series de casos pequeñas.
- Componente de la webapp PsyNamic: es el modelo desplegado en producción en `psynamic.dcr.unibe.ch` para la tarea "Number of Participants", por lo que su uso directo replica el comportamiento del servicio.
- Anotación asistida (human-in-the-loop): genera una preetiqueta que un revisor humano valida o corrige, acelerando la anotación de corpus y permitiendo medir la concordancia entre modelo y anotador.
- Investigación metodológica en NLP biomédico: sirve como baseline reproducible (con hiperparámetros y reglas de selección publicados) para comparar arquitecturas encoder en tareas de extracción de metadatos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test reservado (96 resúmenes), con argmax como en la webapp e intervalos de confianza bootstrap del 95 % (1.000 remuestreos BCa):

| Metrica (test) | Valor [IC 95 %] |
|---|---|
| Weighted F1 | 0.831 [0.746–0.896] |
| Weighted precision | 0.854 [0.766–0.903] |
| Weighted recall | 0.833 [0.750–0.896] |

No se han publicado en la información disponible resultados desagregados por clase, comparativas numéricas con los otros cuatro modelos base evaluados (BioBERT, BioLinkBERT, ClinicalBERT, SciBERT) ni métricas en otros conjuntos de datos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,45 GB solo para pesos (109,5 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; para alto throughput, A100, H100, L4 o T4. En consumer, RTX 4090, RTX 3090, RTX 4060 o incluso GPUs de gama baja.
- Cabe en CPU: la inferencia en CPU es viable para volúmenes moderados dado el tamaño del modelo; en GPU consumer cabe sin problema.
- Opciones de despliegue: `transformers` con PyTorch (uso documentado), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles (tag `endpoints_compatible`), exportación a ONNX y cuantización dinámica para reducir latencia en CPU.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia cualitativa, un encoder de ~110 M procesa lotes de secuencias de 512 tokens con latencia de milisegundos en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| biomedbert-abstract-number-of-participants-20261106 (este) | 109,5 M | 512 | Clasificación de tamaño muestral (11 clases) | Apache 2.0 | Hugging Face, desplegado en PsyNamic |
| STRIDE-lab/biolinkbert-number-of-participants-20250221 | no disponible en la información | no disponible | Misma tarea (versión previa, `submission-v1`) | no disponible en la información | Hugging Face (sustituido por este modelo) |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract | ~110 M (BERT base) | 512 | Modelo base preentrenado (MLM), sin cabeza de clasificación | no disponible en la información | Hugging Face |
| BioBERT, ClinicalBERT, SciBERT | ~110 M (BERT base) | 512 | Modelos base de dominio; evaluados como candidatos con los mismos hiperparámetros | no disponible en la información | Hugging Face |

La comparación cuantitativa de rendimiento entre estos candidatos no se detalla en la información disponible; el autor solo indica que BiomedBERT-abstract fue seleccionado por weighted F1 de validación.

## Limitaciones y advertencias

- Dominio y tarea muy restringidos: solo clasifica tamaño muestral en resúmenes biomédicos en inglés; no debe reutilizarse para otras tareas sin reentrenamiento.
- Riesgo de error en resúmenes ambiguos o incompletos: la categoría `Unknown` y `Not applicable` mitigan parte del problema, pero el weighted F1 de 0,831 implica una tasa de error no trivial, con IC 95 % que baja hasta 0,746.
- Evaluación sobre un test pequeño (96 resúmenes): los intervalos de confianza son amplios y la generalización a otras revistas, especialidades o formatos de resumen no está garantizada.
- Sesgos potenciales derivados del corpus de entrenamiento privado (no documentado) y del preentrenamiento en PubMed: posible infrarrepresentación de ciertas áreas clínicas o de estudios no publicados en revistas indexadas.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto), pero sí de clasificaciones erróneas con alta confianza; conviene revisar probabilidades bajas o cercanas al umbral entre clases adyacentes.
- Limitación de idioma: solo inglés; no se reporta comportamiento en castellano ni en otros idiomas.
- Limitación de contexto: entradas truncadas a 512 tokens; resúmenes largos o con la información del tamaño muestral en secciones posteriores pueden perder la señal relevante.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el dataset de entrenamiento es privado y no se detalla su procedencia, lo que limita la auditabilidad.
- Para producción: fijar la versión del checkpoint (el nombre incluye fecha), monitorizar la distribución de etiquetas predichas y establecer un flujo de revisión humana en decisiones de alto impacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biomedbert-abstract-number-of-participants-20261106
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract
- Modelo previo sustituido: https://huggingface.co/STRIDE-lab/biolinkbert-number-of-participants-20250221
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Webapp PsyNamic: https://psynamic.dcr.unibe.ch
- Guías de anotación: https://osf.io/gh6cn
