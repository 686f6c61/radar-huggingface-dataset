# stefan-it/zeitunks-lm-v1-ner-zefys2025

## Resumen

Zeitunks-LM v1 NER ZEFYS2025 es un modelo de reconocimiento de entidades nombradas (NER) para aleman historico, desarrollado por Stefan Schweter (stefan-it) y publicado en Hugging Face. Se trata de un ajuste fino del encoder bidireccional BiXL-Kron (`stefan-it/zeitunks-lm-v1`), un modelo basado en KronLSTM sin atencion ni embeddings posicionales, preentrenado sobre periodicos alemanes historicos. El ajuste se ha realizado sobre el corpus ZEFYS 2025 de la Staatsbibliothek zu Berlin para la tarea de token classification con etiquetas LOC, ORG y PER en formato IOB2.

El modelo resuelve un problema concreto: la extraccion de entidades en textos historicos alemanes (prensa de los siglos XIX y XX), un dominio donde los transformers clasicos sufren por la variabilidad ortografica, la calidad del OCR y las convenciones tipograficas de la epoca. Con 96,9 millones de parametros y un diseno libre de atencion, ofrece una alternativa ligera y eficiente en memoria frente a encoders transformer de tamano comparable.

Es relevante ahora porque demuestra que arquitecturas recurrentes modernas (KronLSTM, variante de xLSTM) pueden competir en tareas de etiquetado secuencial con F1 a nivel de span de 87,25 en test, y porque el autor publica una comparativa sistematica (BiXL) con protocolo de seleccion de hiperparametros sobre 10 semillas, algo poco habitual en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiXL-Kron: encoder bidireccional KronLSTM (familia xLSTM), sin atencion ni embeddings posicionales |
| Parametros totales | 96.940.103 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 piezas por chunk (las frases mas largas se dividen y se reunifican) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,8 GB) |

## Arquitectura y entrenamiento

El encoder base es BiXL-Kron, un KronLSTM bidireccional de la familia xLSTM que sustituye la atencion por recurrencia matricial (KronLSTM). No emplea embeddings posicionales, lo que lo hace atractivo para secuencias largas y textos con ordenamientos irregulares propios de OCR historico. El modelo se preentreno sobre periodicos alemanes historicos y se ajusto despues para NER con una cabeza compuesta por LayerNorm, dropout de 0,1 y una capa lineal aplicada sobre la primera pieza de cada palabra (pooling `first`).

El ajuste fino se realizo sobre el corpus ZEFYS 2025 (13.401 frases de entrenamiento, 274.126 tokens; 1.663 frases de desarrollo y 1.663 de test), con AdamW (beta 0,9/0,999, epsilon 1e-8, weight decay 0,0), learning rate 1e-5 con warmup lineal del 10 % de los pasos y decaimiento lineal posterior, batch de 16 frases, 10 epocas, clipping de gradiente 1,0, dropout del encoder 0,1, precision bf16 y semilla 5. El learning rate se selecciono mediante una rejilla de 8 valores evaluada con 10 semillas cada uno, eligiendo el de mejor F1 medio en desarrollo. El entrenamiento se ejecuto en modo determinista y el checkpoint seleccionado (epoca 7) reprodujo predicciones identicas byte a byte.

## Capacidades

- Reconocimiento de entidades nombradas en aleman historico con tres tipos: LOC (localizaciones), ORG (organizaciones) y PER (personas), en etiquetado IOB2 con 7 etiquetas incluyendo O.
- Etiquetado a nivel de palabra mediante pooling de la primera pieza, con `aggregation_strategy="first"` en el pipeline de transformers.
- Procesamiento de frases de hasta 512 piezas por chunk, con division y reunificacion automatica de frases mas largas.
- Inferencia sin atencion, con kernels KronLSTM en Triton sobre CUDA y una implementacion de referencia en CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un modelo puramente de token classification.
- Capacidad multilingue limitada al aleman; no se documentan otros idiomas.

## Casos de uso

- Digitalizacion de fondos de prensa historica: extraer automaticamente nombres de personas, lugares y organizaciones de OCR de periodicos alemanes de los siglos XIX y XX para construir indices de busqueda y metadatos estructurados.
- Enriquecimiento de archivos y bibliotecas digitales: anotar corpus como ZEFYS con entidades normalizadas que alimenten grafos de conocimiento historicos y permitan consultas por persona o institucion.
- Investigacion en humanidades digitales: generar datasets etiquetados para estudios prosopograficos, analisis de redes de actores historicos o geolocalizacion de menciones en prensa.
- Verificacion y control de calidad de pipelines OCR: usar las entidades detectadas para validar la calidad del reconocimiento de texto y detectar segmentos mal digitalizados.
- Indexacion semantica de colecciones: integrar el modelo en pipelines de Elasticsearch u OpenSearch para busqueda facetada por entidad en corpus alemanes historicos.
- Procesamiento por lotes en infraestructura modesta: al carecer de atencion y tener solo 96,9 M de parametros, puede ejecutarse sobre CPU o GPU de gama baja para anotar grandes volumenes de texto sin requisitos de memoria elevados.
- Anonimizacion y trazabilidad documental: identificar personas y organizaciones en documentos historicos para tareas de gestion de derechos o catalogacion.

## Benchmarks y rendimiento

F1 micro a nivel de span (IOB2) sobre las particiones oficiales:

| Modelo / configuracion | Dev F1 | Test F1 |
|---|---|---|
| Este checkpoint (semilla 5, epoca 7) | 89,11 | 87,25 (P 87,49 / R 87,02) |
| Media ± desviacion sobre 10 semillas a lr 1e-5 | 88,17 ± 0,39 | 87,01 ± 0,49 |

Rejilla de learning rate (media ± desviacion sobre 10 semillas):

| Learning rate | Dev F1 | Test F1 |
|---|---|---|
| 5e-6 | 87,57 ± 0,20 | 86,43 ± 0,45 |
| 1e-5 (seleccionado) | 88,17 ± 0,39 | 87,01 ± 0,49 |
| 2e-5 | 87,87 ± 0,24 | 86,50 ± 0,50 |
| 3e-5 | 87,25 ± 0,38 | 85,52 ± 0,40 |
| 5e-5 | 85,52 ± 0,45 | 84,40 ± 0,69 |
| 1e-4 | 82,00 ± 0,21 | 80,69 ± 0,64 |
| 2e-4 | 75,07 ± 0,58 | 73,30 ± 0,40 |
| 4e-4 | 6,88 ± 10,35 | 6,53 ± 10,01 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks de proposito general, ya que el modelo no esta disenado para esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 0,4 GB para los pesos (96,9 M de parametros), mas activaciones y buffers; en la practica cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para alto throughput, cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es mas que suficiente.
- Cabe en GPU de consumo: si, en cualquier GPU consumer actual e incluso en iGPU y CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` y el fork fijado de `flash-linear-attention` (NX-AI/KronLSTM, commit 3d800c9a); kernels Triton en CUDA y referencia en CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros modelos sobre el mismo corpus ZEFYS 2025 ni de comparativas numericas con alternativas como German-BERT, German-MedBERT o variantes de XLM-R ajustadas a NER historico. La model card menciona que este checkpoint forma parte de una comparativa BiXL mas amplia (mismo stack de ajuste fino para todos los encoders), pero los resultados de los demas modelos no se incluyen en los datos disponibles.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zeitunks-LM v1 NER ZEFYS2025 | 96,9 M | 512 piezas | KronLSTM bidireccional, sin atencion | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre prensa alemana historica (ZEFYS 2025); el rendimiento puede degradarse en aleman contemporaneo, otros generos textuales u otros idiomas.
- Solo tres tipos de entidad (LOC, ORG, PER); no detecta MISC, fechas, cantidades ni otras categorias habituales en NER.
- Riesgo de alucinacion y errores de frontera: como todo modelo de etiquetado, puede asignar entidades a fragmentos mal segmentados por OCR o confundir limites de span, especialmente con `aggregation_strategy` distinta de `first`.
- Dependencia de codigo externo: requiere `trust_remote_code=True` y un fork fijado de `flash-linear-attention`; esto anade superficie de mantenimiento y riesgo de incompatibilidades con versiones futuras de transformers o de las librerias de kernels.
- Sensibilidad al padding: solo admite right-padding y rellena internamente a multiplos de 64 piezas; un uso incorrecto del tokenizador puede alterar resultados.
- Seleccion de checkpoint sobre dev: el resultado de test reportado (87,25) corresponde a una unica semilla elegida por F1 de desarrollo, por lo que no debe interpretarse como una estimacion insesgada; la media sobre 10 semillas (87,01 ± 0,49) es la referencia mas robusta.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del corpus ZEFYS 2025 y de los datos de preentrenamiento del modelo base para usos derivados.
- Sin garantias de calibracion: las puntuaciones de confianza del pipeline no estan calibradas para umbrales de produccion; se recomienda validar sobre el dominio objetivo.
- Modelo de nicho: 4 descargas y 0 likes en el momento de la consulta, sin comunidad ni soporte documentado mas alla de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefan-it/zeitunks-lm-v1-ner-zefys2025
- Modelo base BiXL-Kron: https://huggingface.co/stefan-it/zeitunks-lm-v1
- Dataset ZEFYS 2025: https://huggingface.co/datasets/SBB/ZEFYS2025
- Fork de flash-linear-attention con kernels KronLSTM: https://github.com/NX-AI/KronLSTM
- Repositorio BiXL (script de ajuste fino `finetuning/finetune_ner.py`): no disponible como URL directa en la informacion proporcionada
- Portal ZEFYS de la Staatsbibliothek zu Berlin: no disponible como URL directa en la informacion proporcionada
