# stefan-it/zeitunks-lm-v1-ner-lft

## Resumen

Zeitunks-LM Fine-Tuned On LFT es un modelo de reconocimiento de entidades nombradas (NER) para aleman historico, desarrollado por Stefan Schweter (stefan-it). Se trata de un ajuste fino del codificador BiXL-Kron (`stefan-it/zeitunks-lm-v1`), una arquitectura bidireccional KronLSTM preentrenada sobre periodicos alemanes historicos. El modelo resuelve la tarea de etiquetado de secuencias (token classification) para extraer entidades de tipo LOC, MISC, ORG y PER en textos de epoca.

La relevancia del modelo reside en su enfoque libre de atencion y sin embeddings posicionales, lo que lo diferencia de los transformers clasicos y de los modelos basados en BERT adaptados a dominio historico. Con 96,94 millones de parametros, se posiciona como una alternativa compacta para procesamiento de patrimonio documental digitalizado, un nicho donde los modelos modernos suelen fallar por la ortografia variable y la tipografia de la epoca.

El ajuste se ha realizado sobre el corpus LFT (Dr Friedrich Teßmann library), un conjunto de aleman de Europeana introducido por Riedl y Pado (ACL 2018), con divisiones oficiales de 2.812 frases de entrenamiento, 352 de desarrollo y 352 de test. La licencia Apache 2.0 facilita su adopcion en proyectos de humanidades digitales y pipelines de digitalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiXL-Kron: codificador KronLSTM bidireccional, sin atencion ni embeddings posicionales |
| Parametros totales | 96.940.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; entrenamiento con chunks de 512 piezas (frases mas largas se dividen y se reunifican) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | aleman (de), orientado a aleman historico |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,8 GB) |

## Arquitectura y entrenamiento

El codificador base es BiXL-Kron, una red KronLSTM bidireccional que prescinde por completo del mecanismo de atencion y de los embeddings posicionales. Esta eleccion arquitectonica reduce el coste cuadratico asociado a la atencion y encaja con secuencias de longitud moderada como las del corpus LFT. Los kernels de KronLSTM provienen de un fork fijado de `flash-linear-attention` del proyecto NX-AI (implementacion Triton en CUDA y de referencia en CPU); no se requiere el paquete `xlstm`. La cabeza de clasificacion es LayerNorm seguida de dropout 0,1 y una capa lineal aplicada sobre la primera pieza de cada palabra (pooling `first`), lo que reproduce el esquema de etiquetado a nivel de palabra.

El ajuste fino se ejecuto con AdamW (beta 0,9/0,999, epsilon 1e-8, weight decay 0,0), learning rate 2e-5 con warmup lineal del 10 % de los pasos y decaimiento lineal posterior, batch de 16 frases, 10 epocas, clipping de gradiente 1,0, dropout de codificador 0,1, autocast bf16 y semilla 9. El learning rate se selecciono mediante una rejilla de ocho valores (de 5e-6 a 4e-4), ejecutando cada uno con 10 semillas y escogiendo el de mejor F1 medio de desarrollo. El checkpoint publicado corresponde a la semilla con mejor F1 de desarrollo en esa tasa (epoca 8); el conjunto de test no participo en la seleccion. El entrenamiento se ejecuto en modo determinista y reprodujo predicciones identicas byte a byte.

## Capacidades

- Reconocimiento de entidades nombradas en aleman historico con cuatro tipos: LOC (localizacion), MISC (miscelanea), ORG (organizacion) y PER (persona), con etiquetado IOB2 (8 etiquetas incluyendo O).
- Etiquetado a nivel de palabra mediante pooling de la primera pieza de cada palabra.
- Procesamiento de frases largas mediante division en chunks de 512 piezas y reunificacion posterior.
- Inferencia determinista y reproducible con la semilla publicada.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento multi-paso ni capacidades de agente.
- No soporta vision ni audio.
- Capacidad multilingue limitada al aleman (incluido aleman historico con ortografia variable).
- No es un modelo generativo: solo produce etiquetas de token classification.

## Casos de uso

- Digitalizacion de patrimonio documental: procesar colecciones de periodicos alemanes historicos digitalizados para extraer automaticamente nombres de personas, lugares y organizaciones, facilitando la indexacion y busqueda semantica en archivos como el de la biblioteca Teßmann.
- Enriquecimiento de corpus para humanidades digitales: anotar automaticamente entidades en corpus de aleman historico para estudios prosopograficos, analisis de redes sociales historicas o georreferenciacion de menciones.
- Construccion de indices de nombres en archivos y bibliotecas: generar listados normalizados de personas y organizaciones citadas en documentos de epoca para catalogos y herramientas de descubrimiento.
- Pipelines de NLP historico como componente de preprocesamiento: usar el modelo como paso previo de NER antes de tareas de resolucion de entidades, extraccion de relaciones o analisis de discurso en corpus historicos.
- Investigacion en arquitecturas sin atencion: emplear el checkpoint como referencia reproducible para comparar KronLSTM frente a transformers en tareas de etiquetado de secuencias sobre dominios con ortografia no estandar.
- Analisis de prensa historica para estudios de opinion: extraer menciones de actores politicos y lugares en corpus periodisticos para analisis cuantitativo de cobertura y framing a lo largo del tiempo.
- Prototipado en entornos con recursos limitados: al tener 96,9 millones de parametros y un repo de 0,8 GB, es viable en GPU de consumo para experimentos de investigacion y validacion de pipelines.

## Benchmarks y rendimiento

Resultados publicados en la model card: F1 micro a nivel de span (IOB2) sobre las divisiones oficiales del corpus LFT.

| Modelo / configuracion | dev F1 | test F1 |
|---|---|---|
| Este checkpoint (semilla 9) | 80,52 | 80,33 (P 78,07 / R 82,73) |
| Media ± desviacion sobre 10 semillas a lr 2e-5 | 79,86 ± 0,52 | 79,90 ± 0,36 |

Rejilla de learning rate (media ± desviacion poblacional sobre 10 semillas, F1 a nivel de span):

| Learning rate | dev F1 | test F1 |
|---|---|---|
| 5e-6 | 77,71 ± 0,41 | 78,57 ± 0,88 |
| 1e-5 | 79,00 ± 0,61 | 79,00 ± 0,78 |
| 2e-5 (seleccionado) | 79,86 ± 0,52 | 79,90 ± 0,36 |
| 3e-5 | 79,53 ± 0,57 | 79,91 ± 0,95 |
| 5e-5 | 79,21 ± 0,67 | 79,50 ± 0,95 |
| 1e-4 | 76,80 ± 0,68 | 76,81 ± 1,24 |
| 2e-4 | 72,35 ± 0,62 | 71,87 ± 1,60 |
| 4e-4 | 63,73 ± 0,68 | 64,67 ± 1,11 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos (por ejemplo, variantes basadas en BERT o XLM-R) sobre el mismo corpus.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 96,9 millones de parametros, en fp32 ocupa aproximadamente 0,39 GB de pesos; en bf16/fp16, unos 0,19 GB. Sumando activaciones y overhead del runtime, es holgadamente ejecutable en GPUs con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes o procesamiento masivo se recomiendan A100, H100 o L4/L40S. En consumer, RTX 3060, RTX 4060, RTX 4090 o superiores son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con soporte CUDA (incluidas GTX 16xx y RTX 20xx en adelante), asi como en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline `token-classification` de Hugging Face Transformers con `trust_remote_code=True`; requiere el fork fijado de `flash-linear-attention` del proyecto NX-AI (Triton en CUDA, implementacion de referencia en CPU). No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El modelo no usa atencion, por lo que el coste por token es lineal con la longitud, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 test (LFT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zeitunks-LM v1 NER LFT (este) | 96,9 M | chunks de 512 piezas | 80,33 | Apache 2.0 | Hugging Face |
| Modelos NER aleman basados en BERT (p. ej. variantes de GBERT/Deepset) | no disponible | no disponible | no disponible | varía | Hugging Face |
| Flair `NER_GERMAN_EUROPEANA_LFT` (referencia del dataset) | no disponible | no disponible | no disponible | no disponible | Flair |

No se dispone en la informacion proporcionada de resultados de modelos alternativos evaluados sobre las mismas divisiones del corpus LFT, por lo que la comparacion cuantitativa directa no esta disponible.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre aleman historico de periodicos; el rendimiento en aleman contemporaneo u otros dominios no esta validado y probablemente sea inferior.
- Sesgos del corpus: al derivar del corpus LFT (Tirol del Sur, prensa historica), puede reflejar sesgos geograficos, temporales y editoriales del material original.
- Riesgo de alucinacion de entidades: como todo modelo de etiquetado, puede asignar tipos de entidad incorrectos o marcar como entidad fragmentos que no lo son, especialmente con ortografia historica irregular.
- Dependencia de codigo externo: requiere `trust_remote_code=True` y el fork fijado de `flash-linear-attention` (commit 3d800c9), lo que anade riesgo de mantenimiento y de cadena de suministro en produccion.
- Limitaciones de contexto: las frases largas se dividen en chunks de 512 piezas y se reunifican; entidades que crucen el limite de chunk pueden perderse o fragmentarse.
- Padding: solo se admite right-padding; los inputs se rellenan internamente a multiplos de 64 piezas, lo que puede afectar a integraciones que asuman otro comportamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del corpus LFT original y de las dependencias (fork de flash-linear-attention) antes de desplegar en produccion.
- Modelo no generativo: no debe emplearse para generacion de texto, resumen ni dialogos; su unico proposito es el etiquetado de tokens.
- Sin datos de benchmarks frente a alternativas: la ausencia de comparaciones publicadas impide garantizar que sea la mejor opcion para un caso concreto sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefan-it/zeitunks-lm-v1-ner-lft
- Modelo base BiXL-Kron: https://huggingface.co/stefan-it/zeitunks-lm-v1
- Paper del corpus LFT (Riedl y Pado, ACL 2018): https://aclanthology.org/P18-2020/
- Fork de flash-linear-attention del proyecto NX-AI: https://github.com/NX-AI/KronLSTM
