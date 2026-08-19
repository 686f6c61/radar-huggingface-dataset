# YLab-Open/MultiClinicalBERT

## Resumen

MultiClinicalBERT es un modelo de tipo BERT (encoder transformer) desarrollado por YLab-Open, preentrenado específicamente sobre notas clínicas reales en cinco idiomas: inglés, chino, español, japonés y ruso. Se presenta como el primer modelo BERT de código abierto entrenado sobre corpus clínicos multilingües reales, lo que lo diferencia de otros modelos clínicos que suelen ser monolingües (como ClinicalBERT en inglés) o de propósito general (como mmBERT). El modelo está inicializado desde mmBERT y se somete a un preentrenamiento adaptativo de dos etapas sobre una combinación de datos clínicos (corpus BRIDGE), literatura biomédica (PubMed) y texto general (Wikipedia), con un total de más de 1.200 millones de tokens.

Con 307.786.240 parámetros, MultiClinicalBERT ofrece representaciones contextuales de alta calidad para tareas de procesamiento de lenguaje natural clínico, como clasificación de mortalidad, extracción de entidades, de-identificación de historiales y razonamiento sobre lenguaje médico. Su licencia MIT permite uso comercial sin restricciones, y su tamaño moderado lo hace viable para despliegue en entornos con recursos limitados. La relevancia actual del modelo radica en la creciente necesidad de sistemas de IA que comprendan documentación clínica multilingüe, especialmente en entornos sanitarios globales y en contextos de bajo recursos lingüísticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 307.786.240 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, zh, es, ja, ru |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MultiClinicalBERT sigue la arquitectura BERT estándar (encoder transformer bidireccional) y se inicializa desde mmBERT (BERT multilingüe de Google). El preentrenamiento se realiza en dos etapas: en la primera, se entrena con una mezcla de datos clínicos (BRIDGE), literatura biomédica (PubMed) y texto general (Wikipedia) para inyectar conocimiento biomédico y multilingüe; en la segunda, se adapta exclusivamente al corpus clínico BRIDGE para capturar patrones lingüísticos específicos de la práctica médica. El objetivo de entrenamiento es masked language modeling (MLM) con un 15% de tokens enmascarados.

El corpus BRIDGE incluye 87 conjuntos de datos clínicos multilingües, con aproximadamente 1,42 millones de documentos y 995 millones de tokens. PubMed aporta 1,25 millones de documentos (194 millones de tokens) y Wikipedia 5.800 documentos (43 millones de tokens) para los idiomas español, japonés y ruso. En total, el modelo se entrena sobre más de 1.200 millones de tokens, lo que permite una cobertura amplia de terminología médica y variaciones lingüísticas. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento se basa únicamente en MLM.

## Capacidades

- Generacion de representaciones contextuales para texto clinico en cinco idiomas (en, zh, es, ja, ru).
- Tarea principal: fill-mask (prediccion de tokens enmascarados), utilizable como modelo base para fine-tuning.
- Soporte para tareas de clasificacion de texto, extraccion de entidades (NER), respuesta a preguntas y razonamiento sobre lenguaje medico.
- Capacidad multilingue: el modelo puede transferir conocimiento entre idiomas, lo que resulta especialmente util en entornos con pocos recursos para alguna lengua.
- No se documentan capacidades de tool calling, agentes ni generacion de texto libre (es un encoder, no un modelo generativo).
- No incluye capacidades de vision ni audio.

## Casos de uso

- De-identificacion de historiales clinicos: el modelo puede entrenarse para detectar y eliminar informacion personal en notas medicas, cumpliendo normativas de privacidad como HIPAA o GDPR. Su entrenamiento en datos clinicos reales mejora la precision en terminologia medica y formatos de documentacion.
- Clasificacion de mortalidad y prediccion de resultados clinicos: en tareas como MIMIC-III Mortality, el modelo alcanza un 89,40% de exactitud, lo que lo hace adecuado para sistemas de soporte a la decision clinica que estiman riesgo de fallecimiento o complicaciones.
- Extraccion de entidades medicas (NER): puede identificar medicamentos, enfermedades, sintomas y procedimientos en notas clinicas multilingues, facilitando la construccion de bases de conocimiento estructuradas a partir de texto no estructurado.
- Sistemas de recuperacion aumentada (RAG): al ser un encoder, puede utilizarse para generar embeddings de documentos clinicos y alimentar pipelines de retrieval-augmented generation, mejorando la precision de respuestas en asistentes medicos.
- Analisis de documentacion clinica multilingue: permite procesar historiales de pacientes en varios idiomas, lo que es valioso en hospitales internacionales o en sistemas de salud con poblaciones migrantes.
- Investigacion en NLP clinico: sirve como modelo base para experimentos academicos y desarrollo de nuevas tecnicas de adaptacion de dominio en el ambito sanitario.

## Benchmarks y rendimiento

La model card reporta resultados en 10 tareas clinicas en 5 idiomas, aunque solo se proporcionan valores parciales. A continuacion se muestran los datos disponibles:

| Tarea | Idioma | Metrica | Resultado |
|---|---|---|---|
| MIMIC-III Mortality | en | Accuracy | 89,40% |
| MIMIC-IV CDM | en | Accuracy | 92,18% |
| CEMR | zh | Accuracy | 94,24% |
| IFMIR NER | ja | F1 | 86,21 |
| EHR De-identification | es | F1 | 88,64 |

No se proporcionan comparaciones con otros modelos en la informacion disponible, aunque la model card afirma que supera consistentemente a mmBERT y que iguala o supera a modelos especificos por idioma, con las mayores mejoras en entornos de bajos recursos. No se han publicado resultados adicionales de benchmarks como MMLU o HumanEval, ya que el modelo no esta disenado para tareas generativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en FP32 (307M parametros x 4 bytes) y unos 0,6 GB en FP16. Con cuantizacion a 8 bits, el uso de memoria podria reducirse a unos 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; tarjetas consumer como NVIDIA GTX 1060, RTX 2060 o superiores pueden ejecutar el modelo sin problemas. Para fine-tuning, se recomienda al menos 8 GB de VRAM.
- El modelo cabe en GPUs consumer de gama media y baja, y tambien puede ejecutarse en CPU con un rendimiento aceptable para tareas de batch pequeno.
- Opciones de despliegue: se puede usar con la libreria transformers de Hugging Face, tanto en Python como en C++ via torch. Tambien es compatible con ONNX Runtime para optimizacion en produccion, y con vLLM si se convierte a un formato adecuado (aunque vLLM esta orientado a modelos generativos, puede servir para embeddings).
- Latencia y throughput: no se proporcionan datos oficiales; en una GPU moderna (p.ej., RTX 3090), la inferencia de un solo texto corto deberia ser inferior a 10 ms, y se pueden procesar cientos de textos por segundo en batch.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. Sin embargo, se pueden establecer comparaciones cualitativas con alternativas conocidas:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MultiClinicalBERT | 307M | No disponible | en, zh, es, ja, ru | MIT | Preentrenado en notas clinicas multilingues |
| medicalai/ClinicalBERT | ~110M | 512 | en | MIT | Monolingue ingles, preentrenado en MIMIC-III |
| mmBERT (BERT multilingual) | ~178M | 512 | 104 idiomas | Apache 2.0 | Modelo base general, sin adaptacion clinica |

MultiClinicalBERT ofrece una ventaja clara en entornos multilingues clinicos frente a ClinicalBERT (solo ingles) y mmBERT (sin especializacion medica). Su tamano mayor que mmBERT sugiere una mayor capacidad de representacion, aunque no se han publicado comparativas de rendimiento con estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Sesgos: al estar entrenado en notas clinicas reales, el modelo puede heredar sesgos presentes en los datos (p.ej., diferencias demograficas o de tratamiento). No se han realizado auditorias de sesgo publicas.
- Riesgo de alucinacion: al ser un encoder, no genera texto libre, por lo que el riesgo de alucinacion es bajo; sin embargo, las predicciones en tareas de clasificacion o NER pueden ser incorrectas si los datos de entrenamiento no cubren ciertos casos.
- Limitaciones de contexto: la longitud de contexto no esta documentada; se asume que sigue el estandar de BERT (512 tokens), lo que limita el procesamiento de documentos clinicos largos sin estrategias de truncamiento o segmentacion.
- Limitaciones de idioma: aunque cubre cinco idiomas, no incluye otros como frances, aleman o portugues, lo que limita su uso en regiones donde esos idiomas son predominantes.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero no se ofrecen garantias de exactitud medica ni de cumplimiento normativo; cualquier uso en entornos clinicos reales debe validarse rigurosamente.
- Caveat de produccion: el modelo no esta disenado para tomar decisiones clinicas autonomamente; debe integrarse como componente de un sistema mas amplio con supervision humana.

## Enlaces

- HuggingFace: https://huggingface.co/YLab-Open/MultiClinicalBERT
- GitHub de YLab-Open: https://github.com/YLab-Open/
- Space de leaderboard BRIDGE Medical: https://huggingface.co/spaces/YLab-Open/BRIDGE-Medical-Leaderboard
- Repositorio BRIDGE (GitHub): https://github.com/YLab-Open/BRIDGE
