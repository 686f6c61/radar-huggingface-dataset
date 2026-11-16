# STRIDE-lab/biomedbert-abstract-study-type-20261106

## Resumen

biomedbert-abstract-study-type-20261106 es un modelo de clasificación de texto biomédico desarrollado por STRIDE-lab en el marco del proyecto PsyNamic. Se trata de un ajuste fino (fine-tuning) del checkpoint `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract`, un BERT base entrenado sobre literatura biomédica. El modelo resuelve una tarea concreta: clasificar el tipo de diseño metodológico (study type) de un resumen (abstract) científico en una de nueve categorías, desde ensayos controlados aleatorizados hasta estudios cualitativos o revisiones sistemáticas.

La relevancia del modelo es acotada pero clara: es el checkpoint desplegado en producción en la webapp de PsyNamic tras la revisión de noviembre de 2026, y sustituye al modelo anterior basado en BioLinkBERT (`STRIDE-lab/biolinkbert-study-type-20251005`). Su rendimiento en el conjunto de test retenido (97 abstracts) alcanza un F1 ponderado de 0,882 con intervalos de confianza bootstrap del 95 % de [0,802–0,938], lo que lo convierte en una herramienta fiable para el filtrado y la caracterización metodológica automatizada de corpus biomédicos.

Arquitectónicamente es un transformer encoder BERT base de 109,5 millones de parámetros, con contexto máximo de 512 tokens y licencia Apache 2.0, lo que facilita su integración en pipelines de procesamiento documental sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) |
| Parametros totales | 109.489.161 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion dinamica posible via PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract`, un BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion) preentrenado sobre resumenes de PubMed. Sobre esa base se anade una cabeza de clasificacion de secuencias (`AutoModelForSequenceClassification`) con 9 etiquetas de salida y activacion softmax para prediccion single-label por argmax.

El ajuste fino se realizo con los siguientes hiperparametros: batch size 8, learning rate 5e-5, weight decay 0,01, scheduler lineal con warmup ratio 0,1, 30 epocas, dropout 0,1, gradient clipping 1,0, early stopping con paciencia de 5 y max_length 512. El checkpoint seleccionado es el de menor perdida de validacion. La seleccion de modelo base se hizo comparando cinco candidatos (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) con hiperparametros identicos, eligiendo el de mayor F1 ponderado en validacion; el conjunto de test se uso una sola vez, despues de la seleccion. El dataset de entrenamiento es privado y no se detalla su composicion ni su tamano.

## Capacidades

- Clasificacion de texto biomedico en 9 categorias de diseno metodologico: ensayo controlado aleatorizado (RCT), estudio de cohorte, estudio del mundo real, protocolo de estudio, revision sistematica/metaanalisis, estudio cualitativo, informe de caso, serie de casos y otros.
- Prediccion single-label mediante argmax sobre la distribucion softmax.
- Procesamiento de titulo y abstract concatenados en una unica entrada de hasta 512 tokens.
- Especializacion en dominio biomedico gracias al preentrenamiento sobre resumenes de PubMed.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo exclusivamente discriminativo.
- No dispone de capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Filtrado metodologico de revisiones sistematicas: dado un corpus de abstracts descargados de PubMed, el modelo etiqueta cada uno con su diseno de estudio, permitiendo a los revisores priorizar o excluir categorias (por ejemplo, descartar informes de caso) antes de la lectura manual. Su F1 ponderado de 0,882 en test lo hace adecuado para un cribado asistido con revision humana posterior.
- Construccion de bases de datos de evidencia: en proyectos de sintesis de evidencia, el modelo puede poblar campos estructurados de tipo de estudio de forma automatica, reduciendo el trabajo de extraccion manual sobre miles de registros.
- Catalogacion y enriquecimiento de repositorios documentales: integrado en un pipeline de ingesta (por ejemplo, con `text-embeddings-inference` o endpoints compatibles), clasifica nuevos abstracts a medida que se indexan, anadiendo metadatos metodologicos consultables.
- Monitorizacion de literatura por diseno de estudio: un equipo de investigacion clinica puede configurar alertas que filtren solo RCT o revisiones sistematicas publicadas en su area, usando el modelo como clasificador de la salida de busquedas bibliograficas.
- Analisis bibliometrico y metascientifico: permite estudiar la distribucion de disenos metodologicos por revista, ano o area tematica a gran escala, clasificando corpus completos de forma reproducible.
- Preprocesamiento para modelos downstream: la etiqueta de tipo de estudio puede usarse como caracteristica de entrada en sistemas de mineria de evidencia, evaluacion de riesgo de sesgo o recomendacion de articulos, donde el diseno metodologico condiciona el tratamiento posterior.

## Benchmarks y rendimiento

Conjunto de test retenido (97 abstracts), prediccion por argmax, intervalos de confianza bootstrap del 95 % (1.000 remuestras BCa):

| Metrica (test) | Valor [IC 95 %] |
|---|---|
| F1 ponderado | 0,882 [0,802–0,938] |
| Precision ponderada | 0,877 [0,791–0,935] |
| Recall ponderado | 0,887 [0,814–0,938] |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo discriminativo de clasificacion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB de pesos (109,5 M de parametros), mas activaciones; en la practica cabe holgadamente en cualquier GPU con 2 GB o mas.
- En fp16 o bf16 el peso se reduce a unos 0,22 GB; la cuantizacion dinamica INT8 lo situaria en torno a 0,11 GB, aunque el autor no documenta checkpoints cuantizados.
- GPU recomendadas: cualquier GPU moderna es suficiente; para alto throughput se recomienda A100, H100, L4 o T4; en consumer, RTX 4090, RTX 3090, RTX 4060 o incluso GPUs de gama de entrada.
- Cabe en CPU para inferencia por lotes de moderado volumen; el modelo es lo bastante pequeno para ejecutarse sin GPU en produccion de baja concurrencia.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles, exportacion a ONNX y cuantizacion via PyTorch.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| biomedbert-abstract-study-type-20261106 | 109,5 M | 512 | Clasificacion de tipo de estudio (9 clases) | apache-2.0 | Hugging Face |
| STRIDE-lab/biolinkbert-study-type-20251005 | no disponible | no disponible | Clasificacion de tipo de estudio | no disponible | Hugging Face (sustituido por este modelo) |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract | no disponible | 512 | Modelo base (MLM) | no disponible | Hugging Face |

La comparacion con alternativas genericas de clasificacion biomedica (por ejemplo, BioBERT o SciBERT ajustados a la misma tarea) no esta disponible con metricas publicas; el autor indica que esos modelos se evaluaron internamente durante la seleccion, pero solo se reporta el rendimiento del checkpoint final.

## Limitaciones y advertencias

- El conjunto de test es muy pequeno (97 abstracts), por lo que los intervalos de confianza son amplios (F1 ponderado entre 0,802 y 0,938); el rendimiento en produccion puede variar con la distribucion real de los datos.
- El dataset de entrenamiento es privado y no se documenta su composicion, tamano ni posibles sesgos de muestreo; no es posible evaluar la representatividad por area tematica, revista o pais.
- Solo admite ingles; abstracts en otros idiomas no estan soportados.
- Limite estricto de 512 tokens: abstracts mas largos se truncan, lo que puede eliminar informacion metodologica relevante en el tramo final.
- Riesgo de confusion entre categorias proximas (por ejemplo, cohorte frente a estudio del mundo real, o informe de caso frente a serie de casos), no cuantificado por clase en la informacion disponible.
- Modelo puramente discriminativo: no genera texto ni justifica sus predicciones, lo que limita su uso en flujos que requieran explicabilidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo se distribuye sin garantias y el autor no documenta un proceso de validacion externa independiente.
- Al ser un checkpoint de noviembre de 2026 vinculado a una webapp concreta, su mantenimiento y actualizaciones futuras no estan garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biomedbert-abstract-study-type-20261106
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract
- Modelo anterior (sustituido): https://huggingface.co/STRIDE-lab/biolinkbert-study-type-20251005
- Codigo del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Webapp PsyNamic: https://psynamic.dcr.unibe.ch
- Guias de anotacion: https://osf.io/gh6cn
