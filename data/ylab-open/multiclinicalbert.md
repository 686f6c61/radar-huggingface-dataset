# YLab-Open/MultiClinicalBERT

## Resumen

MultiClinicalBERT es un modelo transformer de tipo encoder (familia BERT) desarrollado por YLab-Open y especializado en procesamiento de lenguaje natural clinico multilingue. Se inicializa a partir de `mmBERT` y se somete a un preentrenamiento adicional con una estrategia de adaptacion de dominio en dos etapas sobre un corpus clinico multilingue de gran escala denominado BRIDGE, complementado con literatura biomedica de PubMed y texto general de Wikipedia. El resultado es un modelo de 307,8 millones de parametros con licencia MIT, pensado para tareas de comprension de texto clinico en ingles, chino, espanol, japones y ruso.

El modelo aborda un problema concreto: la mayoria de los modelos BERT clinicos existentes estan entrenados unicamente con notas clinicas en ingles (por ejemplo, sobre MIMIC), lo que limita su utilidad en entornos hospitalarios multilingues o en contextos de bajos recursos. MultiClinicalBERT cubre 87 conjuntos de datos clinicos multilingues con 1,42 millones de documentos y 860,08 millones de tokens, lo que lo convierte, segun sus autores, en el primer BERT de codigo abierto preentrenado especificamente sobre notas clinicas reales en multiples idiomas.

Su relevancia actual radica en que ofrece una base solida para tareas de clasificacion, reconocimiento de entidades nombradas (NER), desidentificacion de registros electronicos de salud y recuperacion de informacion en pipelines de RAG clinico, con un rendimiento que, segun la model card, iguala o supera a modelos especializados por idioma y mejora especialmente en escenarios de pocos recursos. El modelo se distribuye en formato safetensors y esta disenado para fine-tuning supervisado, no para generacion de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia BERT, inicializado desde mmBERT) |
| Parametros totales | 307.786.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, es, ja, ru |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MultiClinicalBERT es un transformer encoder de tipo BERT, inicializado desde `mmBERT` y adaptado al dominio clinico mediante un esquema de preentrenamiento adaptativo en dos etapas. La primera etapa combina el corpus clinico BRIDGE con literatura biomedica de PubMed y texto general de Wikipedia, con el objetivo de inyectar conocimiento biomedico y cobertura multilingue. La segunda etapa se restringe exclusivamente a BRIDGE para aprender patrones finos del lenguaje clinico real. El objetivo de entrenamiento es Masked Language Modeling (MLM) con un 15 % de tokens enmascarados.

El corpus de preentrenamiento suma aproximadamente 2,7 millones de documentos y mas de 1.000 millones de tokens. BRIDGE aporta 87 conjuntos de datos clinicos multilingues con 1,42 millones de documentos y 860,08 millones de tokens en ingles, chino, espanol y japones. PubMed aporta 1,25 millones de documentos y 161,47 millones de tokens de terminologia medica. Wikipedia aporta 5.500 documentos y 14,73 millones de tokens en espanol y japones. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, lo cual es coherente con un modelo encoder orientado a comprension y no a generacion.

## Capacidades

- Representaciones contextuales de texto clinico multilingue en cinco idiomas (ingles, chino, espanol, japones y ruso).
- Tarea nativa de fill-mask (MLM), util para sondeo y evaluacion de conocimiento terminologico.
- Extraccion de embeddings para clasificacion de documentos clinicos (mortalidad, codificacion de causas de muerte, tipologia de incidentes).
- Reconocimiento de entidades nombradas (NER) en textos medicos, incluidos informes de alta y registros electronicos.
- Desidentificacion de registros electronicos de salud (EHR) para proteger informacion personal identificable.
- Recuperacion de informacion clinica y soporte a pipelines de RAG: segun la model card, se evaluo como retriever sobre corpus de Wikipedia y obtuvo el mejor promedio global entre siete enfoques de recuperacion en cuatro benchmarks de clasificacion clinica y tres tamanos de Qwen3.5 (2B, 4B, 9B).
- No dispone de capacidades generativas, de tool calling, de agentes ni de vision o audio: es un encoder de comprension.
- No se documenta un modo "thinking" ni razonamiento multi-paso nativo.

## Casos de uso

- Clasificacion de mortalidad en UCI: fine-tuning sobre notas clinicas de MIMIC-III para predecir el desenlace de mortalidad; la model card reporta un 89,40 % de exactitud, lo que lo hace adecuado como baseline clinico en entornos de investigacion.
- Codificacion de causas de muerte (CDM) sobre MIMIC-IV: el modelo alcanza un 92,18 % de exactitud, por lo que puede integrarse en pipelines de codificacion automatica de certificados de defuncion.
- Reconocimiento de entidades en informes de alta en japones (IFMIR NER): con 86,21 de F1, sirve para extraer diagnosticos, procedimientos y medicamentos de notas hospitalarias en japones.
- Desidentificacion de registros electronicos de salud en espanol: con 88,64 de F1 en la tarea EHR De-identification, es utilizable como capa de anonimizacion previa al almacenamiento o comparticion de datos clinicos.
- Procesamiento de registros medicos electronicos en chino (C-EMR): con 94,24 % de exactitud, permite clasificar y estructurar notas clinicas en hospitales sin necesidad de un modelo monolingue especifico.
- Recuperacion aumentada para soporte a la decision clinica: al generar embeddings de consultas y documentos, puede actuar como retriever en un sistema RAG que alimente a un LLM generativo con evidencia clinica multilingue.
- Analisis secundario de cohorts retrospectivas: extraccion de fenotipos y variables de interes a partir de grandes volumenes de notas clinicas heterogeneas en varios idiomas.
- Investigacion en NLP clinico multilingue: base para experimentos de transferencia entre idiomas y evaluacion de sesgos linguisticos en modelos medicos.

## Benchmarks y rendimiento

Resultados reportados en la model card (tareas clinicas, cuatro idiomas):

| Tarea | Idioma | Metrica | Resultado |
|---|---|---|---|
| MIMIC-III Mortality | Ingles | Accuracy | 89,40 % |
| MIMIC-IV CDM | Ingles | Accuracy | 92,18 % |
| C-EMR | Chino | Accuracy | 94,24 % |
| IFMIR NER | Japones | F1 | 86,21 |
| EHR De-identification | Espanol | F1 | 88,64 |

La model card indica que el modelo supera de forma consistente a mmBERT y que iguala o excede a modelos especializados por idioma, con las mayores ganancias en escenarios de bajos recursos. No se proporcionan en la informacion disponible los resultados numericos de las tareas restantes (IMCS-V2 NER, IFMIR Incident Type, PPTS) ni la comparacion detallada frente a mmBERT y modelos monolingues.

En el experimento de RAG, MultiClinicalBERT obtuvo el mejor promedio global entre siete enfoques de recuperacion, evaluado sobre cuatro benchmarks de clasificacion clinica y tres tamanos de Qwen3.5 (2B, 4B y 9B). No se detallan las cifras exactas de este experimento.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos (307,8 M de parametros), mas activaciones y memoria del tokenizador; en la practica, entre 2 y 4 GB segun longitud de secuencia y tamano de batch.
- En fp16/bf16: aproximadamente 0,6 GB para pesos; entre 1,5 y 3 GB con activaciones para batches moderados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para fine-tuning con batches pequenos; para entrenamiento a mayor escala se recomiendan A100 (40/80 GB) o H100. Una RTX 4090 (24 GB) permite fine-tuning comodo con secuencias largas.
- Cabe en GPU de consumo: si, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, asi como en GPUs de 8 GB con batches reducidos.
- Opciones de despliegue: transformers (PyTorch), vLLM no aplica de forma nativa a encoders BERT para generacion, pero si es posible servir embeddings con Text Embeddings Inference (TEI); tambien es viable la exportacion a ONNX Runtime y el despliegue en CPU con cuantizacion dinamica.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse de un encoder de 307 M de parametros, se espera un throughput alto en GPU moderna, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MultiClinicalBERT | 307,8 M | no disponible | en, zh, es, ja, ru | MIT | BERT clinico multilingue (BRIDGE + PubMed + Wikipedia) |
| mmBERT | no disponible | no disponible | multilingue | no disponible | BERT multilingue general, base de inicializacion |
| BioBERT / PubMedBERT | ~110 M | 512 tokens (tipico) | en | MIT / Apache 2.0 (segun variante) | BERT biomedico en ingles |
| MedBERT / ClinicalBERT | ~110 M | 512 tokens (tipico) | en | varía | BERT clinico en ingles sobre MIMIC |

La comparacion cuantitativa frente a mmBERT y modelos monolingues no se detalla numericamente en la informacion disponible; la model card solo afirma que MultiClinicalBERT supera a mmBERT y que iguala o excede a los modelos especificos por idioma. Los datos de contexto de mmBERT, BioBERT, PubMedBERT y ClinicalBERT no se han proporcionado en la informacion de referencia y se marcan como no disponibles cuando corresponde.

## Limitaciones y advertencias

- Es un encoder de comprension: no genera texto, no soporta tool calling ni razonamiento multi-paso; no debe emplearse como sustituto de un LLM generativo.
- La longitud maxima de contexto no se documenta en la informacion disponible; los modelos BERT suelen limitarse a 512 tokens, lo que restringe el analisis de notas clinicas muy largas sin truncado o segmentacion.
- El corpus BRIDGE cubre ingles, chino, espanol y japones; el ruso figura en los metadatos de idiomas pero no se detalla su presencia en el corpus de preentrenamiento, por lo que su rendimiento en ruso es incierto.
- Riesgo de alucinacion bajo en tareas de clasificacion y NER, pero los errores de extraccion pueden propagarse a decisiones clinicas; se requiere validacion humana en cualquier uso asistencial.
- Sesgos potenciales derivados de la distribucion de los 87 conjuntos de datos clinicos: posible infrarrepresentacion de especialidades, poblaciones o variantes dialectales.
- Aunque la licencia es MIT y permite uso comercial, el modelo se ha entrenado con datos clinicos reales; el usuario debe verificar el cumplimiento de normativas de proteccion de datos (RGPD, HIPAA) y las condiciones de uso de los corpus originales.
- No debe utilizarse como dispositivo medico ni para diagnostico autonomo sin validacion regulatoria y clinica.
- El modelo se publico en marzo de 2026 y se actualizo en noviembre de 2026; la informacion disponible no incluye detalles sobre mantenimiento a largo plazo ni versionado.

## Enlaces

- Hugging Face: https://huggingface.co/YLab-Open/MultiClinicalBERT
- Repositorio de pesos (safetensors): incluido en la pagina de Hugging Face del modelo
- Paper, blog o repositorio de codigo adicional: no disponibles en la informacion proporcionada
- Corpus BRIDGE: no se proporciona enlace directo en la informacion disponible
- Demo o espacio de inferencia: no disponible en la informacion proporcionada
