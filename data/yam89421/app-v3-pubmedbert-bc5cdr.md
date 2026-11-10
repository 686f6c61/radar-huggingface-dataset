# yam89421/app-v3-pubmedbert-bc5cdr

## Resumen

APP-v3 PubMedBERT BC5CDR es un modelo de reconocimiento de entidades nombradas (NER) biomédicas especializado en la detección de menciones de sustancias químicas y enfermedades en texto científico en inglés. Lo desarrolla el autor yam89421 en el marco de un proyecto académico de NLP en salud de la ESIEE Paris (asignatura E5-BIO), y se distribuye como un ajuste fino de PubMedBERT sobre el corpus BC5CDR.

Técnicamente se trata de un transformer encoder de tipo BERT (arquitectura `bert`, variante PubMedBERT) con 108.895.493 parámetros, ajustado para clasificación de tokens con etiquetado BIO de cinco clases (`O`, `B-Chemical`, `I-Chemical`, `B-Disease`, `I-Disease`). Su relevancia es acotada pero concreta: ofrece un extractor de entidades biomédicas listo para usar vía `transformers` con métricas declaradas por el autor (F1 micro estricto de 0,912 en desarrollo y 0,894 en test).

No obstante, conviene tratarlo como un artefacto experimental de bajo perfil: cero descargas, cero likes, licencia no declarada y una model card breve en francés. Es adecuado para prototipado e investigación reproductiva, no como componente crítico de producción sin una validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), base `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext` (PubMedBERT) |
| Parametros totales | 108.895.493 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base PubMedBERT admite 512 tokens; no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes GGUF/ONNX declaradas) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | token-classification (NER) |
| Etiquetas | O, B-Chemical, I-Chemical, B-Disease, I-Disease |
| Dataset de entrenamiento | bigbio/bc5cdr (particiones oficiales train/dev) |
| Tamano del repositorio | 0.4 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de PubMedBERT, un encoder BERT entrenado desde cero con abstracts y texto completo de PubMed. Sobre esa base se anade una cabeza de clasificacion de tokens para etiquetado BIO de entidades químicas y enfermedades. No hay innovaciones arquitectonicas propias: es un fine-tuning estandar de NER biomédico.

Segun la model card, el entrenamiento usa las particiones oficiales de BC5CDR (train para ajuste, dev para seleccion de hiperparametros), con 7 epocas, learning rate 5e-5, batch size 8, warmup del 10 % y semilla 42. No se documentan tecnicas de RLHF, DPO ni aumentacion de datos. El pipeline de inferencia descrito incluye una tokenizacion por palabras con offsets (`tals.tokeniser_avec_offsets`), uso del tokenizer en minusculas, seleccion del primer subword de cada palabra y un decodificador BIO con reparacion de secuencias (`src/apprise.py`); reproducir exactamente ese preprocesado es importante para obtener las metricas declaradas.

## Capacidades

- Reconocimiento de entidades nombradas biomédicas: extrae menciones de sustancias químicas y enfermedades en texto científico en inglés.
- Etiquetado BIO a nivel de token con cinco clases, apto para extraccion de spans.
- Procesamiento de abstracts y texto biomédico (dominio de PubMed), incluyendo terminologia especializada y abreviaturas.
- Integracion directa con la libreria `transformers` mediante `pipeline("token-classification")` o `AutoModelForTokenClassification`.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Extraccion de entidades en literatura biomédica: procesar abstracts de PubMed para poblar una base de datos de relaciones fármaco-enfermedad, usando el modelo como extractor de spans Chemical/Disease antes de un paso de resolucion de entidades.
- Construccion de grafos de conocimiento biomédicos: alimentar pipelines de mineria de texto que enlacen compuestos químicos con patologias asociadas, aprovechando el etiquetado BIO consistente.
- Anotacion asistida de corpus clínicos y científicos: preetiquetar documentos para que anotadores humanos revisen y corrijan, reduciendo el coste de crear datasets NER propios.
- Filtrado y enriquecimiento de bases documentales: indexar articulos por las enfermedades y compuestos que mencionan para mejorar la busqueda semantica interna.
- Vigilancia farmacovigilante experimental: detectar menciones de fármacos y efectos adversos descritos como enfermedades en informes de texto, como senal preliminar sujeta a revision experta.
- Docencia y reproduccion de experimentos: servir de base para comparar metodos de NER biomédico (por ejemplo, frente a BioBERT o SciSpacy) en cursos y trabajos académicos, dado que el codigo y el notebook de entrenamiento estan publicados.
- Prototipado rapido en entornos de investigación: desplegar un servicio de extraccion de entidades con `transformers` y una GPU modesta para validar una idea antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (F1 micro estricto):

| Conjunto | F1 micro | Chemical | Disease |
|---|---|---|---|
| Development (BC5CDR) | 0,912 | no disponible | no disponible |
| Test (BC5CDR) | 0,894 | 0,928 | 0,853 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no procede aplicarlos a un modelo de NER.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo de pesos (108,9 M de parametros); con activaciones y overhead de runtime, alrededor de 1-1,5 GB.
- VRAM estimada en fp16: aproximadamente 0,22 GB de pesos; el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, T4, A100 o H100 son mas que suficientes. Tambien puede ejecutarse en CPU para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (PyTorch), `pipeline` de Hugging Face, TorchScript/ONNX si se exporta manualmente, y servidores de inferencia compatibles con modelos `transformers` (por ejemplo, TGI). No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU, pero no hay cifras medidas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yam89421/app-v3-pubmedbert-bc5cdr | 108,9 M | no disponible | NER biomédico (Chemical/Disease) | no disponible | Hugging Face, 0 descargas |
| dmis-lab/biobert-base-cased-v1.1 | ~110 M | 512 tokens (BERT estandar) | Modelo base biomédico, ajustable a NER | Apache 2.0 (segun su model card) | Hugging Face, ampliamente usado |
| microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext | ~110 M | 512 tokens (BERT estandar) | Modelo base biomédico | MIT (segun su model card) | Hugging Face, muy usado |
|allenai/scibert_scivocab_uncased | ~110 M | 512 tokens (BERT estandar) | Modelo base cientifico | Apache 2.0 (segun su model card) | Hugging Face, muy usado |

La comparacion de rendimiento en BC5CDR frente a alternativas no esta disponible en la informacion proporcionada; las cifras de F1 del autor no pueden contrastarse con terceros sin ejecutar los mismos modelos sobre el mismo split.

## Limitaciones y advertencias

- Licencia no declarada: no hay permiso explicito de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Modelo de perfil muy bajo (0 descargas, 0 likes) y sin validacion independiente; las metricas son autodeclaradas.
- Solo inglés: no procesa texto en castellano ni otros idiomas.
- Dominio restringido a texto biomédico; el rendimiento en texto clinico real (informes de historias clinicas) puede degradarse respecto a abstracts de PubMed.
- Riesgo de falsos negativos y positivos en entidades ambiguas, abreviaturas y menciones anidadas; el etiquetado BIO no captura relaciones entre entidades.
- El pipeline de preprocesado es no estandar (tokenizacion por palabras con offsets y decodificacion BIO reparada); usarlo con el tokenizer por defecto puede alterar los resultados.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de extraccion erronea de spans; requiere revision experta en contextos clínicos.
- Sesgos potenciales heredados de PubMedBERT y de BC5CDR (sesgo de publicacion, cobertura desigual de enfermedades raras y de farmacos de reciente aparicion).
- No debe usarse como herramienta de diagnostico ni de decision clinica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yam89421/app-v3-pubmedbert-bc5cdr
- Repositorio del proyecto: https://github.com/yam89421/NLP-SANTE-BC5CDR
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Dataset BC5CDR (BigBio): https://huggingface.co/datasets/bigbio/bc5cdr
- Paper de PubMedBERT (Gu et al., 2020): https://arxiv.org/abs/2007.15779
- Paper de BC5CDR (Li et al., 2016): https://academic.oup.com/database/article/doi/10.1093/database/baw068/2635514
