# YaItco/DL2-HW2

## Resumen
DL2-HW2 es un modelo de clasificacion de tokens (token-classification) publicado por el usuario YaItco en HuggingFace. Se trata de un fine-tuning del modelo de embeddings BAAI/bge-small-en-v1.5, una arquitectura BERT encoder-only de aproximadamente 33 millones de parametros, adaptada mediante la libreria Transformers y el Trainer de HuggingFace para una tarea de etiquetado a nivel de token.

El modelo cuenta con 33.215.625 parametros y un repositorio de 0,7 GB en formato safetensors. La model card esta generada automaticamente por el Trainer, por lo que no especifica el dataset de entrenamiento, el esquema de etiquetas ni los casos de uso previstos. Los unicos datos de rendimiento disponibles son las metricas de evaluacion declaradas por el autor: precision 0,9268, recall 0,9436, F1 0,9352 y accuracy 0,9815 sobre un conjunto de validacion no descrito.

Su relevancia actual es limitada: se publico en octubre de 2026, acumula 0 descargas y 0 likes, y no incluye benchmarks estandar ni documentacion adicional. Resulta util como punto de partida reproducible (licencia MIT, hiperparametros documentados) para tareas de etiquetado de secuencias, pero requiere validacion propia antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder-only), segun el tag `bert` |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors (precision exacta no indicada) |
| Idiomas soportados | no disponibles (el modelo base es `BAAI/bge-small-en-v1.5`, con sufijo `-en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento
La arquitectura es un transformer encoder-only tipo BERT, heredada del modelo base BAAI/bge-small-en-v1.5, con una cabeza de clasificacion de tokens anadida para la tarea de token-classification. El modelo base esta orientado a la generacion de embeddings de frases en ingles, por lo que la adaptacion convierte un encoder de recuperacion en un etiquetador secuencial. No se dispone de informacion sobre el numero de capas, dimensiones ocultas ni mecanismos de atencion mas alla de los 33,2 millones de parametros totales.

El entrenamiento se realizo con el Trainer de HuggingFace sobre un dataset no especificado, durante 3 epocas (3.750 pasos, 1.250 por epoca), con learning rate 2e-05, batch de entrenamiento y evaluacion de 8, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y semilla 42. No se menciona ningun proceso de RLHF, DPO ni decodificacion especulativa, algo esperable en un modelo discriminativo de este tipo. La perdida de entrenamiento cae de 0,0068 a 0,0038 mientras la perdida de validacion sube ligeramente de 0,1129 a 0,1185 entre la epoca 1 y la 3, lo que sugiere un posible inicio de sobreajuste sin mejora relevante de F1.

## Capacidades
- Clasificacion de tokens a nivel de secuencia (etiquetado tipo NER u otra tarea de sequence labelling), con etiquetas cuyo esquema no se detalla en la informacion disponible.
- Inferencia encoder-only: produce una etiqueta por token, no genera texto libre.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el modelo base lleva el sufijo `-en`, lo que apunta a un entrenamiento principalmente en ingles, aunque no se confirma en la model card.
- No se documentan capacidades especiales como modo de razonamiento, vision o audio.
- Reutiliza el tokenizer y la configuracion de BAAI/bge-small-en-v1.5 al estar generado con el Trainer de HuggingFace.

## Casos de uso
- Deteccion de entidades nombradas (NER) en textos en ingles: el modelo puede etiquetar tokens como personas, organizaciones o localizaciones si el dataset de fine-tuning siguio ese esquema, aunque este no se documenta y debe verificarse antes de su uso.
- Anonimizacion y deteccion de datos personales (PII): util como componente de un pipeline de preprocesado que marque tokens sensibles antes de almacenar o enviar texto a otro sistema, siempre que el esquema de etiquetas se valide con datos propios.
- Etiquetado de campos en documentos: por ejemplo, extraccion de campos clave en facturas o formularios escaneados tras aplicar OCR, aprovechando su tamano reducido para procesar volumenes altos en CPU.
- Clasificacion de tokens en dominios tecnicos: adaptacion adicional (fine-tuning) sobre corpus especializados como texto legal, medico o financiero, partiendo de un checkpoint ya entrenado y de solo 33 millones de parametros.
- Preprocesado en pipelines de NLP: uso como etapa intermedia que marca segmentos relevantes antes de pasarlos a un modelo generativo mayor, reduciendo coste computacional.
- Prototipado e investigacion academica: su licencia MIT y sus hiperparametros documentados lo hacen adecuado como baseline reproducible en trabajos de etiquetado de secuencias.
- Despliegue en entornos con recursos limitados: al ocupar decenas de megabytes, puede ejecutarse en dispositivos de borde o en contenedores sin GPU para tareas de etiquetado en tiempo casi real.

## Benchmarks y rendimiento
El model-index del autor no incluye ningun resultado (`results: []`), por lo que no hay benchmarks estandar publicados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card si declara metricas de evaluacion sobre un conjunto de validacion no descrito:

| Metrica | Epoca 1 (paso 1250) | Epoca 2 (paso 2500) | Epoca 3 (paso 3750) |
|---|---|---|---|
| Perdida de validacion | 0,1129 | 0,1187 | 0,1185 |
| Precision | 0,9256 | 0,9269 | 0,9268 |
| Recall | 0,9433 | 0,9442 | 0,9436 |
| F1 | 0,9343 | 0,9355 | 0,9352 |
| Accuracy | 0,9815 | 0,9818 | 0,9815 |

No se han publicado resultados de benchmarks estandar en la informacion disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y corresponden a un conjunto de evaluacion desconocido, sin comparacion con otros modelos.

## Requisitos de hardware
- VRAM estimada: el checkpoint ocupa 0,7 GB en disco (incluye pesos y estados asociados); los pesos en float32 de 33,2 millones de parametros rondan los 133 MB, en float16 unos 66 MB y en int8 unos 33 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una RTX 4090, A100 o H100 queda enormemente sobredimensionada para este modelo.
- Consumer GPU: si, cabe en cualquier GPU de consumo actual e incluso en GPUs integradas o en CPU.
- Despliegue: compatible con la libreria transformers; al ser un modelo encoder pequeno puede servirse con ONNX Runtime, TorchScript o el pipeline de token-classification de HuggingFace. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI (estos ultimos orientados a modelos generativos).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, se espera inferencia en milisegundos por lote corto en GPU y en decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YaItco/DL2-HW2 | 33.215.625 | token-classification | no disponible | MIT | HuggingFace |
| BAAI/bge-small-en-v1.5 (modelo base) | no disponible en la informacion | embeddings / recuperacion de frases | no disponible | no disponible en la informacion | HuggingFace |

No se dispone de datos de otros modelos comparables en la informacion proporcionada (parametros, contexto, rendimiento y licencia de alternativas como otros etiquetadores BERT pequenos no se incluyen). Cualquier comparacion cuantitativa requeriria evaluar los modelos sobre el mismo conjunto de datos.

## Limitaciones y advertencias
- Dataset de entrenamiento desconocido: la model card indica explicitamente "unknown dataset", por lo que no se puede saber que etiquetas aprende el modelo ni si generaliza fuera del dominio original.
- Esquema de etiquetas no documentado: sin conocer el mapping `id2label`, el modelo no es directamente utilizable en produccion.
- Riesgo de sobreajuste: la perdida de validacion aumenta ligeramente entre la epoca 1 y la 3 sin mejora de F1, lo que sugiere que el entrenamiento adicional no aporta rendimiento.
- Desbalance de clases probable: una accuracy de 0,9815 frente a un F1 de 0,9352 es consistente con una distribucion de etiquetas desbalanceada; la accuracy puede ser enganosa en este escenario.
- Sesgos: no documentados. Al derivar de un modelo entrenado principalmente en ingles, es previsible un sesgo linguistico y cultural hacia ese idioma, pero no hay analisis publicado.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si puede asignar etiquetas incorrectas con alta confianza en tokens ambiguos.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan; el sufijo `-en` del modelo base apunta a cobertura limitada fuera del ingles.
- Licencia: el modelo se publica bajo MIT, lo que permite uso comercial, pero la model card no especifica la licencia del modelo base ni del dataset de entrenamiento, por lo que conviene verificar la cadena de licencias antes de un despliegue comercial.
- Modelo sin adopcion: 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- Model card autogenerada: carece de secciones de usos previstos, limitaciones y datos de entrenamiento, lo que obliga a una validacion manual completa.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/YaItco/DL2-HW2
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Libreria Transformers: https://github.com/huggingface/transformers
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
