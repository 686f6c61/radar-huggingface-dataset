# STRIDE-lab/biomedbert-abstract-substances-20261106

## Resumen

`STRIDE-lab/biomedbert-abstract-substances-20261106` es un modelo de clasificación de texto multietiqueta derivado de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract`, entrenado para identificar las sustancias psicoactivas o psicodélicas estudiadas en el título y el resumen (abstract) de artículos biomédicos. Lo desarrolla el laboratorio STRIDE-lab en el marco del proyecto PsyNamic, cuyo objetivo es facilitar la revisión sistemática y el metaanálisis de la literatura sobre sustancias psicodélicas mediante la extracción automática de información estructurada.

El modelo es un BERT base (12 capas, 768 dimensiones ocultas, vocabulario de 30.522 tokens) con 109.494.544 parámetros totales y una cabeza de clasificación de 16 etiquetas con activación sigmoide independiente por etiqueta. Trabaja sobre secuencias de hasta 512 tokens y está entrenado exclusivamente en inglés. Sustituye a la versión anterior `STRIDE-lab/biolinkbert-substances-20250228` (tag `submission-v1`) y es el checkpoint desplegado en la aplicación web de PsyNamic tras la revisión de noviembre de 2026.

Su relevancia práctica reside en que resuelve una tarea de extracción de entidades muy específica (sustancias estudiadas en abstracts) con un rendimiento medido en test de F1 ponderado 0.887 (IC 95%: 0.824–0.917) sobre un conjunto de prueba reservado de 96 abstracts, y lo hace con un modelo de solo 0.4 GB desplegable en CPU o GPU de consumo. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder) con cabeza de clasificación de secuencias multietiqueta |
| Parametros totales | 109.494.544 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors de precision completa) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract`, un BERT base preentrenado sobre literatura biomédica (abstracts de PubMed), y anade una cabeza de clasificación multietiqueta con 16 salidas y activación sigmoide por etiqueta. La entrada es la concatenación del título y el abstract del artículo, truncada a 512 tokens.

El ajuste fino se realizo con los siguientes hiperparámetros: batch size 8, learning rate 5e-05, weight decay 0.01, scheduler lineal con warmup ratio 0.1, 30 epochs maximos, dropout 0.1, gradient clipping 1.0, early stopping con paciencia 5 y max_length 512. El dataset de entrenamiento es privado y no se detalla su composicion ni su tamano en la model card. Se compararon cinco modelos base (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) con hiperparámetros identicos; se selecciono el checkpoint con menor perdida de validacion (early stopping) y el modelo base con mejor F1 ponderado en validacion. El conjunto de test se uso una sola vez, tras la seleccion, lo que reduce el riesgo de sobreajuste al test.

La innovacion tecnica destacable no esta en la arquitectura sino en la regla de prediccion: se aplica una sigmoide por etiqueta y se predice toda etiqueta con probabilidad ≥ 0.10. Este umbral se ajusto en validacion con una regla preespecificada: partir del umbral con F1 ponderado maximo y bajarlo mientras la precision ponderada se mantenga dentro de 0.05 de su valor en ese punto. El umbral 0.5 que aparece en los hiperparámetros de entrenamiento solo se uso para calcular metricas de validacion durante el entrenamiento y no afecta a los pesos ni a la seleccion del checkpoint.

## Capacidades

- Clasificacion multietiqueta de abstracts biomedicos en 16 categorias de sustancias: Ketamine, S-Ketamine, R-Ketamine, MDMA, LSD, Psilocybin, Psychedelic mushrooms, Ayahuasca, DMT, 5-MeO-DMT, Mescaline, Ibogaine, Salvinorin A, Combination Therapy, Analogue y Unknown.
- Asignacion de multiples etiquetas simultaneas por abstract (por ejemplo, un estudio que compara psilocibina y LSD recibira ambas etiquetas).
- Procesamiento de entradas del tipo `<title>. <abstract>` con truncamiento a 512 tokens.
- Deteccion de categorias auxiliares como terapia combinada, analogos de sustancias y sustancia desconocida, utiles para el filtrado y la taxonomia en revisiones sistematicas.
- Inferencia por lotes en PyTorch/transformers, compatible con text-embeddings-inference y endpoints compatibles segun las etiquetas del repositorio.
- No dispone de tool calling, razonamiento multi-paso, generacion de texto libre, vision ni audio: es exclusivamente un clasificador de secuencias.
- Capacidad multilingue limitada al ingles; no se declara soporte para otros idiomas.

## Casos de uso

- Revision sistematica de literatura sobre psicodelicos: el modelo etiqueta automaticamente abstracts recuperados de PubMed u otras bases para separar los estudios por sustancia (ketamina, MDMA, psilocibina, LSD, etc.) antes de la criba manual, reduciendo el volumen de lecturas iniciales.
- Construccion de corpus estructurados para metaanalisis: a partir de las etiquetas multietiqueta se pueden generar tablas de correspondencia articulo-sustancia que alimenten analisis bibliometricos o sintesis cuantitativas sobre eficacia y seguridad por compuesto.
- Enriquecimiento de bases de datos farmacologicas y toxicologicas: clasificacion de abstracts de estudios preclinicos y clinicos para poblar campos de sustancia estudiada en repositorios internos de industria farmaceutica o agencias reguladoras.
- Filtrado y priorizacion en pipelines de vigilancia cientifica: integracion como paso de clasificacion en flujos automatizados que monitorizan nuevas publicaciones y alertan solo sobre las que mencionan sustancias de interes, con un coste computacional bajo (modelo de 0.4 GB).
- Apoyo a la elaboracion de informes regulatorios o de salud publica: identificacion rapida de evidencia cientifica sobre sustancias concretas (por ejemplo, ibogaina o 5-MeO-DMT) para fundamentar fichas tecnicas o evaluaciones de riesgo.
- Clasificacion a gran escala en CPU: al ser un BERT base de 109 M de parametros, puede ejecutarse en servidores sin GPU o en GPUs de consumo (por ejemplo, RTX 3060/4090) para lotes de miles de abstracts, lo que lo hace adecuado para proyectos academicos con recursos limitados.
- Etiquetado asistido para anotacion humana: las predicciones con umbral 0.10 pueden usarse como preetiquetado en herramientas de anotacion, dejando a los revisores confirmar o corregir las etiquetas de sustancia.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test reservado (96 abstracts), con umbral ajustado 0.10 e intervalos de confianza bootstrap del 95% (1.000 remuestreos BCa):

| Metrica (test) | Valor [IC 95%] |
|---|---|
| F1 ponderado | 0.887 [0.824–0.917] |
| Precision ponderada | 0.836 [0.754–0.873] |
| Recall ponderado | 0.962 [0.915–0.985] |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible; la model card solo indica que BiomedBERT-abstract fue seleccionado frente a BioBERT, BioLinkBERT, ClinicalBERT y SciBERT por F1 ponderado en validacion, sin detallar las cifras de esos competidores.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.5–1 GB en precision completa (fp32) para el modelo y el tokenizador; menos de 0.5 GB en fp16 o int8, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; para alto throughput se recomiendan A100, H100, L4 o RTX 4090. Tambien funciona en GPUs de consumo modestas (GTX 1650, RTX 3060).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, y tambien en CPU para volumenes moderados.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference (segun las etiquetas del repositorio), endpoints compatibles; no se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al tratarse de un BERT base de 12 capas, la inferencia por abstract es del orden de milisegundos en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| biomedbert-abstract-substances-20261106 (este modelo) | 109,5 M | 512 tokens | Clasificacion multietiqueta de sustancias en abstracts | Apache 2.0 | Hugging Face |
| STRIDE-lab/biolinkbert-substances-20250228 | no disponible | no disponible | Clasificacion de sustancias (version anterior, tag submission-v1) | no disponible | Hugging Face |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract | 109,5 M (aprox.) | 512 tokens | Modelo base de lenguaje biomedico (MLM) | no disponible | Hugging Face |

La model card no proporciona comparaciones cuantitativas con BioBERT, BioLinkBERT, ClinicalBERT ni SciBERT mas alla de indicar que fueron evaluados en validacion y que BiomedBERT-abstract obtuvo el mejor F1 ponderado. No se dispone de cifras de rendimiento de esos modelos en esta tarea concreta.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles: abstracts en otros idiomas no estan soportados y producirian predicciones poco fiables.
- Ventana de contexto de 512 tokens: abstracts largos se truncan, lo que puede eliminar menciones de sustancias situadas al final del texto y degradar el recall en esos casos.
- El conjunto de test es pequeno (96 abstracts), por lo que los intervalos de confianza son amplios (F1 ponderado 0.824–0.917); el rendimiento en dominios distintos del corpus de entrenamiento puede variar.
- El dataset de entrenamiento es privado y no se documenta su composicion, tamano ni procedencia, lo que limita la reproducibilidad y la evaluacion de sesgos de muestreo.
- El umbral 0.10 favorece el recall (0.962) a costa de la precision (0.836); en aplicaciones donde los falsos positivos son costosos conviene subir el umbral o calibrar sobre datos propios.
- Riesgo de alucinacion: no aplica en sentido generativo (el modelo no genera texto), pero puede asignar etiquetas incorrectas cuando el abstract menciona sustancias de forma tangencial, en comparaciones o en contexto historico.
- La etiqueta "Unknown" y "Analogue" pueden absorber casos ambiguos y requerir revision manual.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; no se especifican restricciones adicionales en la model card, pero conviene verificar las condiciones del modelo base BiomedBERT.
- No hay soporte declarado para tool calling, agentes ni generacion; usarlo fuera de la tarea de clasificacion de sustancias no esta validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biomedbert-abstract-substances-20261106
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract
- Version anterior (submission-v1): https://huggingface.co/STRIDE-lab/biolinkbert-substances-20250228
- Codigo del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Aplicacion web PsyNamic: https://psynamic.dcr.unibe.ch
- Directrices de anotacion: https://osf.io/gh6cn
