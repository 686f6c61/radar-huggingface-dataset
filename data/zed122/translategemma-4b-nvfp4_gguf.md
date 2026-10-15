# zed122/translategemma-4b-nvfp4_gguf

## Resumen

TranslateGemma 4B es un modelo de traduccion automatica neuronal desarrollado por Google, construido sobre la familia Gemma 3 y publicado en tres tamanos (4B, 12B y 27B). La ficha que nos ocupa, `zed122/translategemma-4b-nvfp4_gguf`, no es el modelo original: es una conversion a GGUF realizada por el usuario zed122 a partir del checkpoint ya cuantizado `kaitchup/translategemma-4b-it-NVFP4`, que a su vez deriva de `google/translategemma-4b-it`. El objetivo de esta publicacion es empaquetar los pesos NVFP4 en un formato consumible por llama.cpp y otros runtimes compatibles con GGUF.

El modelo cubre 55 idiomas y conserva las capacidades multimodales de Gemma 3, por lo que puede traducir tanto texto como contenido con imagen. Los pesos de transformer estan almacenados en NVFP4 (punto flotante de 4 bits con escalas por bloque), mientras que la tabla de embeddings (`token_embd`) y la capa de salida se mantienen en BF16 para preservar calidad en el vocabulario. El repositorio ocupa 7,2 GB porque incluye simultaneamente los ficheros safetensors y GGUF.

La relevancia de esta ficha es doble: por un lado, TranslateGemma representa un cambio de paradigma en traduccion open source, ya que segun Google el modelo de 12B supera al baseline Gemma 3 27B con menos de la mitad de parametros; por otro, esta conversion concreta es una pieza de infraestructura para desplegar el modelo de 4B en GPUs Blackwell con aceleracion FP4 nativa. El numero de parametros declarado en los safetensors es de 2.695.758.192 (~2,7 mil millones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma 3 (no disponible el detalle exacto de capas en la informacion proporcionada) |
| Parametros totales | 2.695.758.192 (~2,7 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la familia base Gemma 3 emplea ventanas largas, pero no se confirma para esta conversion) |
| Tipos de cuantizacion | NVFP4 (4 bits, escalas por bloque); `token_embd` y capa de salida en BF16; etiquetado tambien como "8-bit" en los tags del repo |
| Idiomas soportados | 55 idiomas (segun el anuncio de Google de TranslateGemma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |
| Tamano del repositorio | 7,2 GB |
| Tipo de pipeline | no disponible |
| Fecha de publicacion | 14 de octubre de 2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo de la familia Gemma 3 adaptado a traduccion. Gemma 3 es una familia de transformers decoder-only; la model card original de TranslateGemma no se incluye en los datos proporcionados, y la model card de esta conversion solo contiene la declaracion de licencia Apache 2.0, sin descripcion tecnica. Por tanto, no se pueden confirmar aspectos como el numero de capas, la dimension oculta, el ratio de atencion con ventana deslizante frente a atencion global, ni la composicion del dataset de entrenamiento.

Lo que si consta es el proceso de cuantizacion: se parte de `kaitchup/translategemma-4b-it-NVFP4`, un checkpoint en formato compressed-tensors con pesos NVFP4, y se convierte a GGUF mediante `convert_hf_to_gguf.py` de llama.cpp. Durante esa conversion, los pesos del transformer permanecen en NVFP4 mientras que `token_embd` y la capa de salida se conservan en BF16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares en el modelo original.

## Capacidades

- Traduccion automatica entre 55 idiomas, que es la funcion principal declarada del modelo.
- Traduccion multimodal: conserva las capacidades de vision de Gemma 3, por lo que puede traducir texto presente en imagenes.
- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` en los tags).
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.
- Idiomas concretos soportados: no disponible el listado, solo el recuento agregado de 55 idiomas.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo esta entrenado especificamente para traduccion y cubre 55 idiomas, por lo que puede procesar manuales, guias de API y articulos largos manteniendo terminologia consistente dentro de un mismo documento.
- Localizacion de productos software: integrado en pipelines de CI/CD, permite generar automaticamente ficheros de recursos traducidos a partir de las cadenas fuente en cada release.
- Subtitulado y doblaje: al conservar la vision de Gemma 3, puede procesar fotogramas con texto incrustado (letreros, capturas, interfaces) y traducirlo, lo que resulta util en postproduccion audiovisual.
- Atencion al cliente multilingue: el modelo puede actuar como capa de traduccion en sistemas de soporte, traduciendo tanto las consultas entrantes como las respuestas del agente o del propio sistema.
- Traduccion de catalogos de comercio electronico: descripciones de producto, fichas tecnicas y atributos pueden traducirse de forma masiva manteniendo el formato estructurado.
- Traduccion en tiempo real en aplicaciones de mensajeria: con un modelo de 4B cuantizado a NVFP4, el coste por token es bajo y permite desplegar traduccion en linea dentro de un chat multilingue.
- Investigacion en traduccion automatica: sirve como baseline reproducible y abierto para comparar tecnicas de cuantizacion (NVFP4 frente a BF16 o GGUF de 8 bits) sobre una misma tarea.
- Despliegue en el borde con GPU Blackwell: al usar FP4 nativo, encaja en escenarios donde la VRAM y el consumo energetico son restrictivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento presentes en la busqueda son cualitativos: el informe tecnico de TranslateGemma afirma que el modelo de 4B alcanza resultados comparables al baseline Gemma 3 de 12B, y el blog de Google sostiene que el modelo de 12B supera al baseline Gemma 3 de 27B usando menos de la mitad de parametros. No se proporcionan cifras concretas de BLEU, COMET, MMLU ni de ninguna otra metrica, ni resultados especificos para esta conversion NVFP4/GGUF, por lo que no es posible valorar la perdida de calidad introducida por la cuantizacion.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 3,4 GB si se suman los pesos del transformer en NVFP4 (~0,5 bytes por parametro) y los embeddings y la capa de salida en BF16 (~2 bytes por parametro). Es una estimacion propia a partir del recuento de parametros, no un dato publicado.
- VRAM total: a la cifra anterior hay que anadir la cache KV, cuyo tamano depende de la longitud de contexto efectiva, dato no disponible en la informacion proporcionada.
- GPU con soporte nativo FP4: las tensor cores de cuarta generacion (arquitectura Blackwell, por ejemplo B100, B200, RTX 5090) son las que ejecutan NVFP4 de forma nativa.
- GPU sin soporte FP4: en arquitecturas anteriores (Ampere, Ada Lovelace, Hopper) el runtime tendria que de-cuantizar los pesos, con la penalizacion de latencia y memoria que eso implica; no se dispone de mediciones concretas.
- Cabe en GPU de consumo: si, el tamano de pesos estimado (~3,4 GB) entra con holgura en cualquier GPU de consumo con 8 GB o mas, siempre que el runtime soporte el formato de cuantizacion.
- Opciones de despliegue: llama.cpp (el GGUF se genero con su script de conversion), Ollama y derivados basados en llama.cpp; vLLM si la version soporta NVFP4 de compressed-tensors; TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zed122/translategemma-4b-nvfp4_gguf | 2,7 mil millones | no disponible | NVFP4 + BF16 en embeddings y salida | Apache 2.0 | GGUF y safetensors |
| kaitchup/translategemma-4b-it-NVFP4 | 2,7 mil millones (misma base) | no disponible | NVFP4 (compressed-tensors) | Apache 2.0 (heredada) | safetensors |
| google/translategemma-4b-it | 2,7 mil millones (misma base) | no disponible | BF16 sin cuantizar | Apache 2.0 | safetensors |
| google/translategemma-12b-it | no disponible | no disponible | BF16 sin cuantizar | Apache 2.0 | safetensors |

Las tres primeras filas son el mismo modelo en tres estados de empaquetado distintos, por lo que la comparacion relevante es de formato y consumo de memoria, no de capacidades. Frente al checkpoint BF16 original, esta version reduce el peso de los pesos del transformer a la cuarta parte, a costa de una perdida de precision que no se ha cuantificado publicamente. No se dispone de datos para comparar con alternativas de traduccion de otros proveedores (NLLB, MADLAD, Tower, etc.) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Alucinacion: no hay datos publicados sobre tasas de alucinacion ni de omisiones en traduccion para este modelo o esta conversion.
- Perdida por cuantizacion: los pesos NVFP4 introducen error numerico adicional respecto al checkpoint BF16. No se ha publicado ninguna evaluacion de calidad que mida ese impacto en BLEU, COMET o metricas similares.
- Dependencia de hardware: NVFP4 esta pensado para tensor cores FP4 de arquitectura Blackwell. En GPUs anteriores el rendimiento puede degradarse de forma significativa o requerir de-cuantizacion en software.
- Idiomas: aunque se declaran 55 idiomas, no se proporciona el listado ni se detalla la calidad relativa entre pares de idiomas, por lo que el rendimiento puede variar mucho segun la combinacion.
- Longitud de contexto: no confirmada en la informacion disponible; conviene verificarla en el repositorio del modelo base antes de disenar aplicaciones con documentos largos.
- Sesgos: no hay informacion sobre sesgos evaluados en la model card de esta conversion, y la model card esta practicamente vacia (solo contiene la declaracion de licencia).
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de licencia y atribucion correspondientes. Conviene verificar la licencia del modelo base `google/translategemma-4b-it` en su propio repositorio, ya que los terminos de Gemma pueden imponer condiciones adicionales de uso aceptable.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni documentacion tecnica propia, lo que reduce la trazabilidad y el soporte disponible.
- Reproducibilidad: no se documentan los parametros exactos usados en la conversion a GGUF, ni la version de llama.cpp empleada.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/zed122/translategemma-4b-nvfp4_gguf
- Conversion GGUF relacionada del mismo autor: https://huggingface.co/zed122/translategemma_nvfp4_gguf
- Checkpoint NVFP4 de origen: https://huggingface.co/kaitchup/translategemma-4b-it-NVFP4
- Modelo base de Google: https://huggingface.co/google/translategemma-4b-it
- Informe tecnico de TranslateGemma: https://arxiv.org/pdf/2601.09012
- Anuncio en el blog de Google: https://blog.google/innovation-and-ai/technology/developers-tools/translategemma/
- Pagina de la familia Gemma en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
