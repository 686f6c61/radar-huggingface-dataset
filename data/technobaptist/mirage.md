# TechnoBaptist/mirage

## Resumen

Mirage es un modelo de vision-lenguaje (image-text-to-text) publicado por TechnoBaptist en Hugging Face, con el runtime propietario cactus-compute como biblioteca de inferencia. Esta orientado a la comprension de imagenes y a la extraccion estructurada de informacion: descripcion de escenas, deteccion de objetos (incluida zero-shot), segmentacion, clasificacion de imagenes, respuesta a preguntas visuales (VQA) y respuesta a preguntas sobre documentos (document QA, con OCR implicito). El repositorio pesa 0,2 GB, lo que sugiere un modelo compacto, aunque la model card no publica el numero de parametros ni la longitud de contexto.

La relevancia actual del modelo reside en su enfasis en tareas de extraccion estructurada y comprension documental, ambitos donde los modelos multimodales genericos suelen ser menos precisos. Su licencia Apache 2.0 y el soporte de siete idiomas europeos (ingles, aleman, frances, espanol, italiano, neerlandes y polaco) lo hacen atractivo para despliegues comerciales en la Union Europea sin las restricciones de licencias tipo Llama o Gemma.

No obstante, la informacion disponible es muy limitada: no se publican especificaciones de arquitectura, numero de parametros, tokens de entrenamiento ni resultados de benchmarks. El modelo tiene cero descargas y cero likes en el momento de la consulta, y depende de un runtime especifico (cactus-compute) en lugar de integrarse con ecosistemas estandar como transformers, vLLM o llama.cpp. Todo ello debe tenerse en cuenta al evaluar su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de vision-lenguaje; detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, fr, es, it, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mirage.safetensors) y formato propietario mirage.cact |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Se trata de un modelo multimodal de tipo image-text-to-text que combina un codificador visual con un decodificador de lenguaje, segun indica la etiqueta de pipeline. El repositorio incluye los pesos en `mirage.safetensors`, un fichero `mirage.cact` (formato empaquetado del runtime cactus-compute) y el fichero de configuracion del modelo.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). La unica informacion operativa es que el paquete `cactus-compute` descarga y cachea el motor y los pesos en el primer uso.

## Capacidades

- Generacion de texto a partir de imagenes: descripcion de escenas y contenido visual.
- Deteccion de objetos, incluida deteccion zero-shot (objetos no vistos durante el entrenamiento).
- Segmentacion de imagenes.
- Clasificacion de imagenes y clasificacion zero-shot de imagenes.
- Visual question answering (VQA): responder preguntas sobre el contenido de una imagen.
- Document question answering: extraccion de informacion de documentos, con OCR implicito segun la imagen de portada de la model card.
- Extraccion estructurada: la model card menciona explicitamente "structured extraction", relaciones espaciales y decisiones.
- Soporte multilingue en siete idiomas: ingles, aleman, frances, espanol, italiano, neerlandes y polaco.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso.

## Casos de uso

- Digitalizacion de documentos: extraccion de campos estructurados (facturas, albaranes, formularios) mediante document QA, aprovechando la capacidad de OCR y extraccion estructurada que anuncia el autor.
- Moderacion de contenido visual: clasificacion zero-shot de imagenes en categorias definidas en tiempo de inferencia, sin reentrenamiento, util para flujos de revision con taxonomias cambiantes.
- Accesibilidad: generacion de descripciones de imagenes en castellano para lectores de pantalla o interfaces de usuario, gracias al soporte nativo del espanol.
- Analisis de imagenes en comercio electronico: deteccion y clasificacion de productos en fotografias de catalogo, con segmentacion para recortes automatizados.
- Automatizacion de inventario y logistica: deteccion de objetos y relaciones espaciales en imagenes de almacen o lineas de produccion para verificar la presencia y posicion de articulos.
- Asistentes de soporte con imagenes: VQA sobre capturas de pantalla o fotografias enviadas por usuarios (por ejemplo, diagnosticos basicos de errores en aplicaciones), en conversaciones multilingues dentro de la UE.
- Procesamiento de documentacion tecnica multilingue: respuesta a preguntas sobre manuales o planos escaneados en cualquiera de los siete idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (0,2 GB) sugiere que el modelo podria caber en GPUs de consumo, pero no se confirma el numero de parametros ni la cuantizacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamano del repositorio, pero no confirmada por el autor.
- Opciones de despliegue: exclusivamente mediante el paquete `cactus-compute` (API `cactus.Mirage().describe(...)`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni especificaciones que permitan una comparacion rigurosa con alternativas como Qwen2-VL, InternVL o PaliGemma.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar la calidad del modelo frente a alternativas consolidadas.
- Cero descargas y cero likes en Hugging Face: sin validacion por parte de la comunidad.
- Dependencia de un runtime propietario (cactus-compute): no se integra con el ecosistema estandar de transformers, vLLM o llama.cpp, lo que complica su adopcion en infraestructuras existentes.
- Especificaciones incompletas: se desconocen parametros, contexto, datos de entrenamiento y cuantizaciones disponibles.
- Riesgo de alucinacion en tareas de OCR y extraccion estructurada: no hay datos publicados sobre precision en documentos.
- Cobertura idiomatica limitada a siete idiomas europeos; no se documenta soporte de otros idiomas.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones del runtime cactus-compute, que es un componente separado del modelo.
- Sesgos conocidos: no documentados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TechnoBaptist/mirage
- Modelo original referenciado en la model card: https://huggingface.co/Cactus-Compute/mirage
- Blog y playground: https://cactuscompute.com/blog/mirage
- Documentacion de la API Python: https://cactuscompute.com/blog/needle-python-docs
- Binarios del runtime y plataformas soportadas: https://huggingface.co/Cactus-Compute/cactus
- Codigo fuente: https://github.com/cactus-compute/cactus
