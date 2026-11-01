# zefie/Wan2.2-Remix-v2.1-I2V-NSFW-NVFP4

## Resumen

Wan2.2-Remix-v2.1-I2V-NSFW-NVFP4 es una cuantizacion en formato NVFP4 (4 bits, metodo NVIDIA FP4) del modelo FX-FeiHou/wan2.2-Remix, un derivado de la familia Wan 2.2 orientado a generacion de video a partir de imagen (I2V, image-to-video) con contenido para adultos. El autor de la cuantizacion es el usuario zefie, que publica el resultado en Hugging Face con licencia Apache 2.0 y un tamano de repositorio de 16,8 GB. El modelo esta marcado como "not-for-all-audiences" por su tematica NSFW.

La relevancia de esta ficha es doble: por un lado documenta una tecnica de compresion agresiva (FP4) aplicada a un modelo de difusion de video, con una reduccion de memoria estimada del 75 % segun la model card; por otro, advierte de que se trata de un derivado con contenido explicito y de que no hay informacion tecnica publicada sobre el proceso de entrenamiento, los datos o los resultados de calidad. No se dispone de pipeline declarado, idiomas soportados ni benchmarks en la informacion proporcionada.

Se trata, por tanto, de un artefacto de cuantizacion para experimentacion en inferencia de video I2V, no de un modelo fundacional documentado de forma independiente. Cualquier uso en produccion exige validar primero la calidad de la cuantizacion frente al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Wan 2.2, modelo de difusion para video; no se detalla en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no aplica contexto de texto de forma directa) |
| Tipos de cuantizacion | NVFP4 (4 bits, metodo NVIDIA FP4); ahorro de memoria estimado ~75 % segun la model card |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | NVFP4 (pesos cuantizados a 4 bits en formato NVIDIA FP4); no se especifica si hay safetensors o GGUF |
| Modelo base | FX-FeiHou/wan2.2-Remix |
| Relacion con el base | quantized |
| Tamano del repositorio | 16,8 GB |
| Modalidad | image-to-video (I2V) |
| Clasificacion de contenido | NSFW (not-for-all-audiences) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna en la model card proporcionada. El modelo base pertenece a la familia Wan 2.2, que en su version publica original corresponde a modelos de difusion para generacion de video; sin embargo, no se detalla en la informacion disponible si esta variante Remix emplea un transformer de difusion (DiT), un esquema hibrido o alguna modificacion del autor del modelo base. Tampoco se indican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF, DPO o fine-tuning especifico.

La innovacion tecnica documentada es exclusivamente la cuantizacion NVFP4: pesos a 4 bits con el metodo FP4 de NVIDIA, que la model card describe como de "rendimiento alto" y con un ahorro de memoria de aproximadamente el 75 %. No se especifica si la cuantizacion es de solo pesos (weight-only) o tambien de activaciones, ni si se aplico calibracion con un dataset representativo. Tampoco se documenta el proceso de entrenamiento del modelo base Remix ni su procedencia respecto a Wan 2.2 original.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video, I2V).
- Generacion de contenido explicito o NSFW, segun la denominacion del propio modelo.
- Cuantizacion NVFP4 orientada a reducir la huella de memoria en inferencia (aprox. 75 % segun la model card).
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta capacidad multilingue ni de texto; es un modelo de video.
- No se documentan modos especiales como thinking, vision adicional o audio.

## Casos de uso

- Prototipado de pipelines I2V en entornos con VRAM limitada: la cuantizacion a 4 bits permite cargar el modelo en GPUs donde la version en precision completa no cabria, a costa de validar la perdida de calidad.
- Investigacion sobre cuantizacion FP4 en modelos de difusion de video: sirve como caso de estudio para medir el impacto de NVFP4 en fidelidad temporal y coherencia de movimiento.
- Generacion de clips cortos a partir de imagenes en flujos creativos experimentales, siempre que el contenido explicito sea aceptable para el usuario y el entorno.
- Evaluacion comparativa frente al modelo base FX-FeiHou/wan2.2-Remix para cuantificar la degradacion introducida por la cuantizacion.
- Despliegue en estaciones de trabajo con una sola GPU consumer de gama alta, sujeto a que el runtime soporte NVFP4.
- Pruebas de integracion en herramientas de generacion de video que acepten pesos cuantizados, verificando primero la compatibilidad del formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el repositorio ocupa 16,8 GB, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos, mas overhead de activaciones y del runtime de difusion.
- GPU recomendadas: no disponible en la informacion proporcionada. El formato NVFP4 es especifico de NVIDIA y requiere soporte de hardware y software para FP4.
- GPU consumer: no se puede confirmar; depende del soporte de NVFP4 en la generacion de GPU utilizada.
- Opciones de despliegue: no se documentan en la model card (no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no son runtimes tipicos para difusion de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zefie/Wan2.2-Remix-v2.1-I2V-NSFW-NVFP4 | no disponible | no aplica | NVFP4 (4 bits) | Apache 2.0 | Hugging Face, 0 descargas |
| FX-FeiHou/wan2.2-Remix (base) | no disponible | no aplica | no disponible | no disponible en esta ficha | Hugging Face |
| Wan 2.2 original (familia) | no disponible en esta ficha | no aplica | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido NSFW: el modelo esta marcado como "not-for-all-audiences"; su uso puede infringir politicas de plataformas, entornos laborales y legislaciones locales.
- Licencia Apache 2.0 declarada, pero la cadena de derivacion (Wan 2.2 original, Remix, cuantizacion) debe verificarse antes de un uso comercial.
- Riesgo de degradacion por cuantizacion FP4: no hay evaluacion publicada de la perdida de calidad frente al modelo base.
- Sin datos de sesgos, alucinacion visual ni limitaciones de idioma documentados.
- Cero descargas y cero likes en el momento de la ficha: sin validacion comunitaria.
- El formato NVFP4 puede no ser compatible con todos los runtimes de difusion; requiere verificar soporte antes de desplegar.
- No se documentan requisitos de hardware ni instrucciones de uso, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/zefie/Wan2.2-Remix-v2.1-I2V-NSFW-NVFP4
- Modelo base: https://huggingface.co/FX-FeiHou/wan2.2-Remix
