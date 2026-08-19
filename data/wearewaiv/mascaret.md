# wearewaiv/mascaret

## Resumen

Mascaret es un modelo de visión por computador especializado en patología médica, desarrollado por el equipo de wearewaiv. Se trata de un encoder de imágenes (image-feature-extraction) obtenido mediante fine-tuning del modelo base kaiko-ai/midnight, que a su vez es un modelo de visión preentrenado. El modelo está diseñado para extraer representaciones vectoriales de imágenes histopatológicas, lo que lo hace útil para tareas de diagnóstico asistido, búsqueda de imágenes similares y clasificación de tejidos.

Con 1.136 millones de parámetros (aproximadamente 1,1B), Mascaret se posiciona como un encoder de gran tamaño para el dominio médico. Su relevancia actual radica en la creciente demanda de modelos especializados en patología digital, donde los modelos genéricos de visión suelen quedarse cortos. El acceso al modelo está restringido (gated) y requiere aceptar condiciones en HuggingFace, lo que sugiere un uso controlado, probablemente por motivos de licencia o de uso ético en el ámbito sanitario.

El modelo se publicó en junio de 2026 y ha recibido una actualización en agosto del mismo año. Aunque el repositorio indica un paper asociado (arxiv:2607.22861), no se han publicado detalles completos de arquitectura ni benchmarks en la ficha de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (encoder de vision, probablemente basado en transformer) |
| Parametros totales | 1.136.480.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo de vision, no linguistico) |
| Licencia | other (no especificada en la ficha) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta de Mascaret no se detalla en la informacion disponible. Se sabe que es un fine-tuning del modelo kaiko-ai/midnight, que actua como base. Dado el pipeline de image-feature-extraction y la etiqueta finetuned_encoder, se trata de un encoder de vision que transforma imagenes en embeddings de alta dimension. El fine-tuning se ha realizado especificamente para el dominio de patologia medica, lo que implica un ajuste de los pesos del modelo base con datos de imagenes histopatologicas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se utilizaron tecnicas de aprendizaje por refuerzo o similar. El repositorio menciona un paper (arxiv:2607.22861) que probablemente contiene estos detalles, pero no se ha podido acceder a el en la busqueda realizada. El modelo usa custom_code, lo que indica que puede requerir codigo personalizado para su carga en transformers.

## Capacidades

- Extraccion de caracteristicas de imagenes medicas, especialmente en el dominio de patologia (histologia, biopsias, tejidos).
- Generacion de embeddings de imagenes para tareas de clasificacion, recuperacion y similitud.
- Fine-tuning especifico para patologia, lo que mejora el rendimiento frente a modelos de vision genericos en este dominio.
- Compatible con el ecosistema transformers de HuggingFace para image-feature-extraction.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.

## Casos de uso

- Diagnostico asistido por imagen: Mascaret puede extraer caracteristicas de imagenes de biopsias para ayudar a patologos en la deteccion de anomalias, generando embeddings que alimentan clasificadores posteriores.
- Busqueda de imagenes similares: en un repositorio de laminas histologicas, el modelo permite recuperar casos con patrones morfologicos parecidos, util para comparar pacientes o encontrar referencias.
- Clasificacion de subtipos tumorales: los embeddings generados pueden usarse como entrada para modelos de clasificacion que distinguen entre diferentes tipos de cancer o grados de malignidad.
- Control de calidad en laboratorios: validacion automatica de que una muestra de tejido es adecuada para analisis, detectando artefactos o preparaciones deficientes.
- Investigacion biomedica: analisis cuantitativo de caracteristicas morfologicas en grandes conjuntos de imagenes, por ejemplo para correlacionar fenotipos con datos genomicos.
- Integracion en pipelines de patologia digital: como encoder en sistemas de diagnostico automatizado que combinan vision y lenguaje, aunque Mascaret en si no procesa texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona un paper (arxiv:2607.22861) que podria contener evaluaciones, pero no se ha podido acceder a el. No se dispone de comparaciones con otros modelos de patologia como UNI, CONCH o modelos genericos de vision.

## Requisitos de hardware

- VRAM estimada: con 1.136 millones de parametros en precision FP32, el modelo ocuparia aproximadamente 4,5 GB en memoria. Con cuantizacion a FP16 o int8, el uso de VRAM se reduciria a unos 2,3 GB o 1,1 GB respectivamente, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para inferencia en FP16, una GPU con al menos 4 GB de VRAM seria suficiente (por ejemplo, RTX 3050, RTX 4060). Para entrenamiento o fine-tuning adicional, se recomendaria una GPU con 8-12 GB (RTX 3080, RTX 4070, A10).
- Compatibilidad con consumer GPU: si, el modelo es lo suficientemente pequeno para ejecutarse en GPUs de consumo con cuantizacion.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con HuggingFace Inference Endpoints, o mediante librerias como vLLM (aunque vLLM esta orientado a LLMs, no a encoders de vision). Para extraccion de caracteristicas, se puede usar directamente con transformers en Python.
- Latencia y throughput: no se dispone de datos publicados. En una GPU moderna, la extraccion de caracteristicas de una imagen deberia tomar decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable. Mascaret se basa en kaiko-ai/midnight, pero no se conocen las especificaciones de este ultimo ni de otros modelos de patologia comparables. Se recomienda consultar el paper asociado para obtener datos de evaluacion.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, lo que significa que los usuarios deben solicitar acceso y aceptar condiciones en HuggingFace. Esto puede limitar su adopcion en entornos corporativos.
- Licencia no especificada: la licencia aparece como "other", sin detallar los terminos exactos. Es crucial revisar las condiciones antes de cualquier uso comercial.
- Sesgos potenciales: al ser un modelo entrenado en datos de patologia, puede reflejar sesgos presentes en los datos de entrenamiento (por ejemplo, distribucion de tipos de tejido o poblaciones).
- Riesgo de alucinacion: al ser un encoder de vision, no genera texto, por lo que el riesgo de alucinacion linguistica no aplica. Sin embargo, los embeddings pueden producir falsos positivos en tareas de clasificacion si los datos de entrenamiento no son representativos.
- Limitaciones de contexto: al no procesar texto, no tiene limitaciones de contexto linguistico, pero su dominio se restringe a imagenes de patologia; su rendimiento en otros tipos de imagen no esta garantizado.
- Dependencia de custom_code: el modelo requiere codigo personalizado para cargarse, lo que puede complicar su integracion en entornos de produccion estandar.

## Enlaces

- HuggingFace: https://huggingface.co/wearewaiv/mascaret
- Paper asociado (arxiv): https://arxiv.org/abs/2607.22861 (no verificado)
- Modelo base: https://huggingface.co/kaiko-ai/midnight (no verificado)
