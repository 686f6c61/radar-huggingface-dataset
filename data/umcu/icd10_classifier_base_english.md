# UMCU/ICD10_classifier_base_English

## Resumen

El modelo UMCU/ICD10_classifier_base_English es un clasificador de texto clínico diseñado para asignar códigos de la Clasificación Internacional de Enfermedades, décima revisión (ICD-10) a partir de notas médicas en inglés. Ha sido desarrollado por UMCU (Bram van Es), un perfil centrado en modelado de lenguaje clínico y series temporales clínicas y financieras. El modelo se publica bajo licencia AGPL-3.0 y está disponible en Hugging Face con un tamaño de repositorio de 0.2 GB.

La arquitectura subyacente es un transformer tipo BERT, con 111.377.056 parámetros totales, lo que lo sitúa en la gama de modelos base de tamaño medio (similar a BERT-base). Aunque la model card no proporciona detalles sobre el entrenamiento, el nombre y los tags sugieren que se trata de un modelo fine-tuned para la tarea específica de codificación ICD-10. Su relevancia radica en la automatización de la codificación clínica, un proceso costoso y propenso a errores en entornos hospitalarios y de seguros.

No se dispone de información pública sobre la longitud de contexto, los idiomas soportados más allá del inglés (implícito en el nombre), ni sobre cuantizaciones disponibles. Tampoco se han publicado resultados de benchmarks en la información accesible. A pesar de estas carencias, el modelo puede ser útil para desarrolladores que necesiten un punto de partida para tareas de clasificación de diagnósticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT) |
| Parametros totales | 111.377.056 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (implicito por el nombre, no confirmado) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only del tipo BERT, con aproximadamente 111 millones de parametros, lo que corresponde a la configuracion base de BERT (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion). El modelo ha sido fine-tuned para la clasificacion de secuencias, especificamente para asignar codigos ICD-10 a partir de texto clinico. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas como RLHF o DPO. Dado el ambito clinico, es probable que el fine-tuning se haya realizado sobre notas medicas etiquetadas con codigos ICD-10, pero este dato no esta confirmado en la informacion disponible.

No se mencionan innovaciones tecnicas destacables como decodificacion especulativa o atencion lineal. El modelo parece ser un BERT estandar adaptado a una tarea especifica.

## Capacidades

- Clasificacion de texto clinico en codigos ICD-10: el modelo asigna una o varias categorias diagnosticas a partir de notas medicas en ingles.
- Procesamiento de lenguaje natural en el dominio clinico: al estar fine-tuned sobre terminologia medica, puede reconocer entidades y frases tipicas de informes clinicos.
- Salida de clasificacion multiclase o multi-etiqueta: aunque no se especifica, los clasificadores ICD-10 suelen predecir multiples codigos por documento.
- Sin capacidades de generacion de texto: al ser un modelo encoder, no genera texto libre.
- Sin soporte de tool calling ni agentes: no esta disenado para interaccion conversacional ni para orquestar herramientas.
- Multilingue: no confirmado; el nombre indica ingles, pero no hay datos sobre otros idiomas.

## Casos de uso

- Codificacion clinica automatizada en hospitales: el modelo puede procesar informes de alta, historiales medicos o notas de consulta y sugerir codigos ICD-10, reduciendo el trabajo manual de los codificadores. Su tamano moderado permite integrarlo en sistemas locales sin necesidad de GPU de alta gama.
- Facturacion y reclamaciones de seguros: aseguradoras y proveedores pueden usar el modelo para validar que los codigos facturados coinciden con la documentacion clinica, detectando posibles errores o fraudes.
- Investigacion epidemiologica: los investigadores pueden clasificar grandes volumenes de registros electronicos de salud (EHR) para estudiar la prevalencia de enfermedades o la efectividad de tratamientos, agilizando el analisis de datos no estructurados.
- Enriquecimiento de bases de datos clinicas: el modelo puede anadir codigos ICD-10 a registros historicos que carecen de ellos, facilitando la interoperabilidad y el analisis retrospectivo.
- Triaje de documentacion medica: en entornos de atencion primaria, el modelo puede pre-clasificar notas para priorizar revisiones humanas o derivar a especialistas segun la categoria diagnostica.
- Formacion de personal sanitario: el modelo puede servir como herramienta educativa para que estudiantes de medicina practiquen la asignacion de codigos ICD-10, comparando sus respuestas con las del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre exactitud, precision, recall o F1 en conjuntos de prueba estandar como MIMIC-III o similares. Tampoco hay comparaciones con otros clasificadores ICD-10.

## Requisitos de hardware

- VRAM estimada para inferencia: con 111 millones de parametros en precision FP32, el modelo ocupa aproximadamente 445 MB. En FP16, unos 223 MB. La inferencia puede ejecutarse en CPU con 8-16 GB de RAM, aunque sera mas lenta que en GPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP16, por ejemplo una NVIDIA GTX 1650 o superior. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8 GB o mas, como RTX 3070, RTX 4080 o A100.
- Compatibilidad con GPU de consumo: si, el modelo cabe en practicamente cualquier GPU moderna de consumo, incluso en tarjetas integradas con suficiente RAM compartida.
- Opciones de despliegue: al ser un modelo BERT en formato safetensors, puede servirse con librerias como Hugging Face Transformers, ONNX Runtime, TensorFlow Serving o TorchServe. Tambien es compatible con vLLM (aunque esta orientado a modelos generativos, puede servir encoders) y con TGI si se adapta. Para despliegue ligero, se puede exportar a ONNX y usar ONNX Runtime en CPU.
- Latencia y throughput estimados: no se dispone de mediciones publicas. En una GPU moderna, la inferencia de una secuencia de 512 tokens deberia tardar del orden de 10-50 ms. En CPU, puede ser de 100-500 ms por secuencia, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de clasificacion ICD-10. Existen alternativas como `CogStack/MedCAT` o modelos basados en PubMedBERT, pero no se dispone de datos de rendimiento comparables para este modelo concreto. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Licencia AGPL-3.0: esta licencia copyleft obliga a que cualquier obra derivada o servicio que utilice el modelo y se distribuya publicamente deba publicarse bajo la misma licencia. Esto puede ser restrictivo para uso comercial propietario.
- Sesgos potenciales: al ser un modelo entrenado probablemente con datos clinicos de una region o poblacion concreta, puede presentar sesgos en la clasificacion de ciertas enfermedades o grupos demograficos. No se ha documentado una evaluacion de sesgos.
- Riesgo de alucinacion: aunque es un clasificador y no genera texto, puede asignar codigos incorrectos si el texto de entrada es ambiguo o contiene terminologia no vista en el entrenamiento. La supervision humana es imprescindible en entornos clinicos reales.
- Limitaciones de contexto: al ser un modelo BERT, la longitud de contexto tipica es de 512 tokens. Notas clinicas largas deberan truncarse o dividirse, lo que puede perder informacion relevante.
- Idioma: el modelo esta orientado al ingles; su rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- Falta de documentacion: la model card no incluye detalles sobre el dataset de entrenamiento, el proceso de fine-tuning ni los resultados de evaluacion, lo que dificulta la reproducibilidad y la confianza en su uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UMCU/ICD10_classifier_base_English
- Perfil del autor UMCU: https://huggingface.co/UMCU
- Busqueda de modelos ICD-10 en Hugging Face: https://huggingface.co/models?other=icd10
- Repositorio GitHub relacionado (u4507075/icd_10): https://github.com/u4507075/icd_10
- Repositorio GitHub sobre embeddings ICD-10-CM: https://github.com/kaneplusplus/icd-10-cm-embedding
- Articulo en JMIR Medical Informatics sobre clasificacion automatica ICD-10: https://medinform.jmir.org/2026/1/e99873
