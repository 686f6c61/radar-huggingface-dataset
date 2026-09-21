# VenerableRolliPolli/DreamOmni2-7.6B-GGUF

## Resumen

DreamOmni2-7.6B-GGUF es la conversion a formato GGUF del modelo xiabs/DreamOmni2-7.6B, un modelo multimodal orientado a edicion y generacion de imagenes guiada por instrucciones. La conversion la firma VenerableRolliPolli a partir del trabajo de rafacost, y su objetivo es hacer ejecutable el modelo original en entornos de consumo mediante cuantizacion, en particular dentro de ComfyUI, donde se ubica en el directorio `models/unet` junto con sus LoRAs.

El modelo original procede del proyecto DreamOmni2, asociado al paper "DreamOmni2: Multimodal Instruction-based Editing and Generation" (arXiv:2510.06679) y al repositorio dvlab-research/DreamOmni2. Cuenta con 7.615.616.512 parametros (aproximadamente 7,6 mil millones) y se publica bajo licencia Apache-2.0, lo que permite uso comercial segun los terminos de dicha licencia.

La relevancia de esta ficha concreta es practica: se trata de una redistribucion cuantizada, no de un modelo nuevo. Su interes radica en que reduce los requisitos de memoria del modelo original y lo integra en un flujo de trabajo de difusion ampliamente adoptado. La model card es muy escueta y no documenta arquitectura interna, contexto, idiomas ni resultados de evaluacion, por lo que buena parte de las especificaciones quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (el modelo se distribuye como UNet para ComfyUI, patron propio de modelos de difusion, pero no se confirma en la model card) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6B) |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (los niveles concretos no se detallan en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF en este repositorio; el modelo base se distribuye en safetensors |
| Pipeline declarado | image-to-image |
| Modelo base | xiabs/DreamOmni2 (xiabs/DreamOmni2-7.6B) |
| Tamano del repositorio | 73,8 GB |
| Etiquetas | gguf, image-to-image, conversational, endpoints_compatible, arxiv:2510.06679 |
| Fecha de publicacion en HuggingFace | 2026-09-21 (segun metadatos del repositorio) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion del modelo. Lo unico verificable es que se trata de una conversion directa de xiabs/DreamOmni2-7.6B a GGUF, sin cambios en los pesos mas alla de la cuantizacion, y que el propio autor indica que se mantienen integramente los terminos de licencia y las restricciones de uso del modelo original.

Los indicios disponibles apuntan a un modelo de generacion y edicion de imagen guiada por instrucciones multimodales: el pipeline declarado es `image-to-image`, las instrucciones de uso indican colocar el archivo en `ComfyUI/models/unet` y las LoRAs en `ComfyUI/models/loras`, y el paper asociado se titula "Multimodal Instruction-based Editing and Generation". No obstante, cualquier afirmacion sobre el tipo exacto de transformer de difusion, el numero de tokens de entrenamiento, la composicion del dataset o el uso de RLHF/DPO seria una suposicion no respaldada por la informacion disponible.

## Capacidades

- Edicion de imagen guiada por instrucciones: la tarea principal declarada por el pipeline `image-to-image` y por el titulo del paper asociado.
- Generacion de imagen a partir de instrucciones multimodales, segun la descripcion del paper ("editing and generation").
- Uso conversacional: el repositorio incluye la etiqueta `conversational`, aunque no se documenta el alcance real de esta capacidad.
- Integracion en ComfyUI mediante nodos personalizados, con soporte de LoRAs adicionales.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a traves de la infraestructura de Inference Endpoints de HuggingFace, sin que se detallen las condiciones.
- Capacidades concretas de tool calling, razonamiento multi-paso, matematicas, codigo, audio o modo de pensamiento: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Edicion fotografica asistida por instrucciones en estudio: el modelo recibe una imagen y una instruccion en lenguaje natural y devuelve una version editada, lo que permite iterar sobre variaciones sin retoque manual.
- Prototipado rapido de conceptos visuales para diseno de producto: a partir de un boceto o render base, generar variantes de acabado, color o composicion para discutir alternativas con el cliente en minutos.
- Flujos de trabajo en ComfyUI: al estar empaquetado en GGUF y acompanado de nodos personalizados, se integra en grafos de ComfyUI existentes, lo que permite encadenarlo con otros modelos de upscaling, segmentacion o control de pose.
- Edicion por lotes en pipelines internos de contenido: para catalogos de e-commerce, donde se aplica una misma instruccion de edicion (por ejemplo, cambiar fondo o iluminacion) sobre muchas imagenes de producto.
- Retoque dirigido en postproduccion: correccion de elementos concretos de una escena mediante instrucciones textuales, combinando el modelo con LoRAs especificas cargadas desde `models/loras`.
- Despliegue en hardware de gama de consumo: la cuantizacion GGUF permite ejecutar el modelo en equipos con GPU de 12-16 GB de VRAM, algo inviable con los pesos originales en precision completa.
- Experimentacion e investigacion reproducible: al ser una conversion directa del modelo base, sirve para replicar resultados del paper en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye ninguna tabla de evaluacion, y las busquedas web realizadas no devolvieron resultados relevantes sobre el modelo (los resultados obtenidos trataban sobre conversion de divisas y no guardan relacion con el mismo). Existe un paper asociado (arXiv:2510.06679) que podria contener evaluaciones, pero sus cifras no forman parte de la informacion proporcionada y no deben darse por supuestas.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir de los 7,6B parametros; no confirmadas por el autor):
  - Cuantizacion de 4 bits: aproximadamente 4,5-5,5 GB solo de pesos, con 8-12 GB de VRAM total recomendables contando activaciones y VAE.
  - Cuantizacion de 8 bits: aproximadamente 8-9 GB de pesos, con 12-16 GB de VRAM total.
  - Precision completa (FP16): aproximadamente 15 GB de pesos, con 20-24 GB de VRAM total.
- El repositorio ocupa 73,8 GB, un tamano coherente con la presencia de multiples niveles de cuantizacion, incluidos los de mayor precision.
- GPU recomendadas: para cuantizaciones bajas, tarjetas consumer de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090); para precisiones altas o lotes grandes, GPU profesionales tipo A100 o H100.
- Cabe en GPU de consumo: si, previsiblemente en cuantizaciones de 4 y 8 bits; no disponible la comprobacion oficial por parte del autor.
- Opciones de despliegue: ComfyUI mediante los nodos personalizados de rafacost (metodo documentado por el autor); otros runners compatibles con GGUF (llama.cpp, Ollama, vLLM) no estan confirmados para este modelo, dado que esta orientado a difusion y no a generacion de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se proporciono informacion verificada sobre modelos comparables que permita una comparacion con datos numericos. A continuacion se recoge unicamente lo confirmado, dejando el resto como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| DreamOmni2-7.6B-GGUF (esta ficha) | 7,6B | no disponible | Apache-2.0 | GGUF | no disponible |
| xiabs/DreamOmni2-7.6B (modelo base) | 7,6B | no disponible | Apache-2.0 | safetensors | no disponible |
| Alternativas de edicion de imagen por instrucciones (familia de modelos comparables) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni procesos de filtrado, por lo que no es posible evaluar sesgos conocidos.
- Riesgo de alucinacion visual: al ser un modelo generativo de imagen, puede introducir o modificar elementos no solicitados en la imagen de salida; no hay evaluacion publicada en la informacion disponible que cuantifique esta tasa.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento con instrucciones en castellano.
- Longitud de contexto y limites de resolucion de imagen no disponibles.
- La cuantizacion puede degradar la calidad respecto a los pesos originales en precision completa; no se han publicado comparativas de fidelidad entre niveles.
- Licencia Apache-2.0: permite uso comercial bajo los terminos de dicha licencia. El autor de la conversion recuerda que se mantienen las restricciones del modelo original, por lo que conviene revisar la licencia y las condiciones de uso del repositorio xiabs/DreamOmni2 antes de un despliegue en produccion.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en el mismo instante, lo que sugiere que no ha pasado por validacion de la comunidad.
- Cualquier uso en produccion depende de nodos de terceros (rafacost-comfy) cuyo mantenimiento no esta garantizado por el autor del modelo original.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/VenerableRolliPolli/DreamOmni2-7.6B-GGUF
- Modelo base: https://huggingface.co/xiabs/DreamOmni2
- Paper: https://huggingface.co/papers/2510.06679 (DreamOmni2: Multimodal Instruction-based Editing and Generation, arXiv:2510.06679)
- Repositorio GitHub del proyecto: https://github.com/dvlab-research/DreamOmni2
- Nodos personalizados para ComfyUI: https://github.com/rafacost/rafacost-comfy
- Perfil del autor de la conversion: https://huggingface.co/rafacost
- Busqueda web realizada: sin resultados relevantes sobre el modelo (los resultados obtenidos trataban de conversion de divisas PLN/USD y no se han utilizado como fuente).
