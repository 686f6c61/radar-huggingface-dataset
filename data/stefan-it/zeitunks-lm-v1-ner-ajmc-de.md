# stefan-it/zeitunks-lm-v1-ner-ajmc-de

## Resumen

Zeitunks-LM Fine-Tuned On AjMC es un modelo de reconocimiento de entidades nombradas (NER) para aleman historico, desarrollado por Stefan Schweter (stefan-it) y publicado en Hugging Face. Se construye mediante fine-tuning del encoder bidireccional BiXL-Kron (`stefan-it/zeitunks-lm-v1`), un modelo basado en KronLSTM preentrenado con periodicos alemanes historicos, sobre el corpus Ajax Multi-Commentary (AjMC) en su version alemana del reto HIPE-2022.

El modelo resuelve una tarea concreta: la extraccion de entidades nombradas en textos academicos del siglo XIX, con seis tipos de entidad (fecha, lugar, objeto, persona, ambito de cita y obra). Su interes tecnico radica en que el encoder subyacente es completamente libre de atencion y carece de embeddings posicionales, una alternativa arquitectonica a los transformers clasicos que busca eficiencia en secuencias largas.

Con 96.943.181 parametros y una licencia Apache 2.0, es un modelo pequeno y especializado, orientado a investigadores en humanidades digitales y a pipelines de procesamiento de corpus historicos, no a uso generalista. Su contexto de entrenamiento se limita a fragmentos de 512 piezas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiXL-Kron: encoder bidireccional KronLSTM (sin atencion, sin embeddings posicionales) |
| Parametros totales | 96.943.181 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 piezas por fragmento (las secuencias mas largas se dividen y se recomponen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El encoder base es BiXL-Kron, una arquitectura KronLSTM bidireccional que prescinde por completo del mecanismo de atencion y de los embeddings posicionales. Los kernels de KronLSTM provienen de un fork fijado del repositorio NX-AI de `flash-linear-attention` (nombre de importacion `fla`): implementacion Triton en CUDA y una implementacion de referencia en CPU. La cabeza de clasificacion es LayerNorm, seguida de dropout 0.1 y una capa lineal aplicada sobre la primera pieza de cada palabra (pooling `first`), lo que produce una etiqueta por palabra en esquema IOB2 con 13 etiquetas.

El fine-tuning se realizo sobre la parte alemana de AjMC, el corpus Ajax Multi-Commentary de comentarios clasicos del siglo XIX (reto HIPE-2022), con los splits de 1.024 frases y 22.693 tokens en entrenamiento, 192 frases y 4.702 tokens en desarrollo, y 224 frases y 4.845 tokens en test. Se uso AdamW (beta 0.9/0.999, epsilon 1e-8, weight decay 0.0), learning rate 3e-5 con warmup lineal en el 10 % inicial de los pasos y decaimiento lineal hasta 0, batch de 16 frases, 10 epocas con seleccion por mejor F1 de desarrollo (epoca 5), gradient clipping de 1.0, dropout de encoder 0.1, autocast bf16 y semilla 4. El learning rate se eligio mediante una rejilla de ocho valores, cada uno ejecutado con 10 semillas, tomando el de mejor F1 medio de desarrollo. El entrenamiento fue determinista: la repeticion con el mismo seed reprodujo las predicciones byte a byte.

## Capacidades

- Reconocimiento de entidades nombradas en aleman historico con seis tipos: `date`, `loc`, `object`, `pers`, `scope` y `work`.
- Etiquetado a nivel de palabra (una etiqueta por palabra, derivada de su primera pieza) en esquema IOB2.
- Procesamiento de secuencias largas mediante fragmentacion en trozos de 512 piezas y posterior reensamblaje.
- Extraccion de entidades en textos academicos y comentarios filologicos del siglo XIX, incluyendo referencias a obras y ambitos de cita.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador de tokens.
- No dispone de capacidades de vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada al aleman.

## Casos de uso

- Digitalizacion de corpus filologicos: procesar comentarios clasicos del siglo XIX para extraer automaticamente personas, lugares y obras citadas, alimentando bases de datos prosopograficas y de citas.
- Enriquecimiento de archivos de prensa historica: aplicar el modelo a periodicos alemanes antiguos para etiquetar entidades y mejorar la busqueda y la navegacion en hemerotecas digitales.
- Construccion de indices de referencias cruzadas: identificar `work` y `scope` en comentarios academicos para enlazar pasajes con las obras y autores que citan.
- Investigacion en humanidades digitales: generar anotaciones a escala sobre corpus que no pueden etiquetarse manualmente, con un F1 de test de 93,05 que permite reducir el esfuerzo de revision humana.
- Preprocesamiento para pipelines de extraccion de conocimiento: usar las entidades detectadas como entrada de sistemas de resolucion de entidades o de grafos de conocimiento historicos.
- Servicio ligero de etiquetado en produccion: al tener menos de 100 millones de parametros, puede desplegarse en una sola GPU de consumo o incluso en CPU con la implementacion de referencia de Triton/`fla`, sirviendo peticiones de etiquetado de fragmentos de hasta 512 piezas.
- Evaluacion comparativa de arquitecturas: emplear el checkpoint como referencia en estudios que comparan encoders sin atencion (KronLSTM) frente a transformers clasicos en tareas de NER historico.

## Benchmarks y rendimiento

Resultados de F1 micro a nivel de span (IOB2) sobre los splits oficiales de AjMC (aleman):

| Modelo / configuracion | Dev F1 | Test F1 |
|---|---|---|
| Este checkpoint (semilla 4, seleccionada en dev) | 90,80 | 93,05 (P 93,18 / R 92,93) |
| Media ± desviacion sobre 10 semillas a lr 3e-5 | 89,57 ± 0,72 | 91,85 ± 1,05 |

Rejilla de learning rate (media ± desviacion poblacional sobre 10 semillas):

| Learning rate | Dev F1 | Test F1 |
|---|---|---|
| 5e-6 | 88,29 ± 1,14 | 89,35 ± 0,66 |
| 1e-5 | 89,49 ± 0,90 | 91,30 ± 0,66 |
| 2e-5 | 89,41 ± 0,68 | 91,94 ± 0,77 |
| 3e-5 (seleccionado) | 89,57 ± 0,72 | 91,85 ± 1,05 |
| 5e-5 | 89,07 ± 0,87 | 90,61 ± 1,70 |
| 1e-4 | 88,17 ± 0,70 | 90,52 ± 1,16 |
| 2e-4 | 86,86 ± 0,69 | 89,28 ± 0,71 |
| 4e-4 | 68,64 ± 7,15 | 69,09 ± 8,94 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 para los 96,9 millones de parametros; alrededor de 0,2 GB en bf16/fp16. El repositorio completo ocupa 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 4090, A100 o H100 es sobredimensionada para este modelo, que esta pensado para ejecutarse en hardware modesto.
- Cabe en cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU mediante la implementacion de referencia de `fla`.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification` y `trust_remote_code=True`; pipeline `token-classification` con `aggregation_strategy="first"`. Requiere instalar `flash-linear-attention` desde el fork fijado de NX-AI/KronLSTM (commit 3d800c9a). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de despliegue: solo se admite right-padding; las entradas se rellenan internamente a un multiplo de 64 piezas.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros modelos sobre el mismo split de AjMC (aleman), por lo que no es posible una comparacion numerica directa. Como referencia cualitativa de la categoria:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Zeitunks-LM v1 NER AjMC (este) | 96,9 M | 512 piezas | NER historico aleman | Apache 2.0 |
| Encoders transformer tipo XLM-R base (alternativa habitual en HIPE-2022) | no disponible en esta ficha | no disponible | NER multilingue | no disponible |
| Modelos NER alemanes contemporaneos (p. ej. basados en BERT germano) | no disponible en esta ficha | no disponible | NER aleman moderno | no disponible |

La comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente con comentarios clasicos del siglo XIX (AjMC aleman); el rendimiento fuera de ese genero y epoca no esta medido y probablemente sea inferior.
- Vocabulario y ortografia historicos: puede fallar con aleman contemporaneo o con variantes ortograficas no representadas en el corpus.
- Conjunto de entrenamiento pequeno (22.693 tokens): alta sensibilidad a la semilla, como muestra la desviacion tipica de hasta 1,05 puntos de F1 en test entre semillas.
- Riesgo de alucinacion de entidades: como clasificador de tokens puede etiquetar incorrectamente menciones ambiguas o limites de entidad; se recomienda revision humana en flujos criticos.
- Sesgos: no se documentan analisis de sesgo; el corpus refleja la perspectiva de comentarios academicos del siglo XIX, con posibles sesgos historicos en la anotacion.
- Limitacion de contexto: las secuencias se fragmentan en trozos de 512 piezas y se reensamblan, lo que puede degradar la coherencia en documentos muy largos.
- Dependencia de codigo externo: requiere `trust_remote_code=True` y un fork fijado de `flash-linear-attention`; esto implica riesgos de seguridad y de mantenimiento a largo plazo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias; el modelo se distribuye tal cual.
- El modelo no genera texto ni razona: cualquier uso fuera de la clasificacion de tokens es inadecuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefan-it/zeitunks-lm-v1-ner-ajmc-de
- Modelo base BiXL-Kron: https://huggingface.co/stefan-it/zeitunks-lm-v1
- Documentacion del dataset AjMC (HIPE-2022): https://github.com/hipe-eval/HIPE-2022-data/blob/main/documentation/README-ajmc.md
- Fork de flash-linear-attention de NX-AI (KronLSTM): https://github.com/NX-AI/KronLSTM
- Repositorio BiXL (script de fine-tuning `finetuning/finetune_ner.py`): no disponible como URL en la informacion proporcionada
