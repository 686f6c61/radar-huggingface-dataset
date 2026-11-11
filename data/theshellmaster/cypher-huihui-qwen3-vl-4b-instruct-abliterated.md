# TheShellMaster/cypher-Huihui-Qwen3-VL-4B-Instruct-abliterated

## Resumen

`cypher-Huihui-Qwen3-VL-4B-Instruct-abliterated` es un espejo publico, sin modificaciones, del archivo GGUF `Huihui-Qwen3-VL-4B-Instruct-abliterated.Q5_K_M.gguf` (2,89 GB) publicado originalmente por mradermacher. No se trata de un modelo nuevo ni de un fine-tuning: los pesos son identicos bit a bit a la fuente (sha256 `403ffcfd...b72e`, 2.889.515.456 bytes), sin re-cuantizacion ni cambios de plantilla de chat. Su interes practico es servir como punto de distribucion redundante de una variante multimodal de 4,4 mil millones de parametros ya cuantizada para inferencia en CPU o GPU de gama media.

El modelo subyacente es Qwen3-VL-4B-Instruct, un transformer multimodal de la familia Qwen3-VL con arquitectura `qwen3vl` y una ventana de contexto nativa de 262.144 tokens. Sobre esa base, huihui-ai aplico una ablacion de las direcciones de rechazo (abliteration) en fp16, lo que elimina parte de los filtros de negativa aprendidos durante el alineamiento. El resultado es un modelo de vision-lenguaje capaz de describir imagenes, responder preguntas sobre capturas o documentos y mantener conversaciones largas, pero con las salvaguardas de contenido notablemente reducidas.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas rutas para ejecutar un VLM de 4B con contexto de 256K en hardware modesto; por otro, advierte de que la combinacion de abliteration, licencia permisiva y ausencia de moderacion lo hace inadecuado para despliegues de cara al publico sin capas adicionales de filtrado. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una distribucion de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3vl` (transformer multimodal vision-lenguaje) |
| Parametros totales | 4,4 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Q5_K_M (~5,4 bits/peso, 2,89 GB); el repositorio fuente de mradermacher ofrece otras variantes GGUF |
| Idiomas soportados | fr, en (segun la model card; el modelo raiz Qwen3-VL soporta mas idiomas, pero no se detallan aqui) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (unico archivo publicado en este repositorio) |

## Arquitectura y entrenamiento

La arquitectura es `qwen3vl`, la familia multimodal de Qwen que combina un encoder visual con un decoder de lenguaje transformer. El modelo raiz Qwen3-VL-4B-Instruct fue entrenado por Alibaba Qwen con datos multimodales (pares imagen-texto, documentos, capturas de pantalla) y posteriormente alineado con instrucciones. Sobre esa version, huihui-ai aplico abliteration en fp16: una tecnica de edicion de pesos que identifica las direcciones de activacion asociadas al rechazo de peticiones y las proyecta fuera del espacio de representaciones, sin reentrenar. El resultado conserva las capacidades del modelo original pero reduce la probabilidad de respuestas de negativa.

La cuantizacion Q5_K_M aplicada por mradermacher es una K-quant mixta por bloques de 256 pesos, con un promedio de 5,3 a 5,7 bits por peso: las capas de atencion se mantienen con mayor precision que las capas FFN, incluidas las escalas. Como referencia, Q4_K_M ronda 4,8 bits/peso, Q5_K_M 5,4, Q6_K 6,6 y Q8_0 8,5. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo raiz, mas alla de lo que declara la model card del espejo.

## Capacidades

- Generacion de texto y razonamiento multimodal: el pipeline declarado es `image-text-to-text`, por lo que acepta imagenes junto a texto y produce respuestas descriptivas o analiticas.
- Comprension de imagenes: descripcion de contenido visual, respuesta a preguntas sobre la imagen y, presumiblemente, lectura de documentos o capturas, aunque la model card no detalla tareas concretas.
- Contexto largo: 262.144 tokens nativos, adecuado para conversaciones multi-turno extensas o documentos de gran tamano.
- Multilingue limitado: la model card declara fr y en; no se confirma soporte de espanol en este espejo.
- Modo "uncensored": la abliteration reduce las negativas del modelo, lo que se traduce en menor filtrado de contenido sensible.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Descripcion de imagenes en local: con 2,89 GB en disco y cuantizacion Q5_K_M, el modelo puede ejecutarse en CPU con llama.cpp para generar descripciones de fotos o capturas sin depender de la nube.
- Procesamiento de documentos escaneados: la ventana de 262K tokens permite pasar lotes de paginas o capturas y pedir resumenes o extraccion de datos, aunque la calidad OCR no esta documentada.
- Asistente conversacional de contexto largo: util para mantener hilos de conversacion extensos con historial de imagenes intercaladas, gracias a la ventana nativa.
- Prototipado de pipelines VLM en Ollama: el Modelfile incluido en la model card permite crear un modelo local con `num_ctx 8192` y temperatura 0,7 para pruebas rapidas.
- Investigacion sobre abliteration: sirve como referencia para estudiar el efecto de la eliminacion de direcciones de rechazo en modelos multimodales pequenos, comparando con el modelo raiz.
- Generacion de contenido sin restricciones en entornos controlados: para casos donde el filtrado del modelo original resulta excesivo, siempre con revision humana posterior.
- Despliegue en hardware de gama baja: al caber en 2,89 GB, es viable en equipos sin GPU dedicada o con GPUs de 4-8 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa 2,89 GB; con overhead de contexto y cache KV, se recomienda al menos 4-6 GB de VRAM para `-ngl 99` con contexto moderado, o 6-8 GB de RAM si se ejecuta en CPU.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4090 o A100/H100 para mayor throughput; cualquier GPU con 6 GB o mas puede alojar el modelo completo.
- Cabe en GPU de consumo: si, en tarjetas de 6 GB o superiores; en 4 GB requeriria descargar capas a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 8192 -ngl 99`), Ollama mediante Modelfile, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del numero de capas descargadas a GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cypher-Huihui-Qwen3-VL-4B-Instruct-abliterated (este) | 4,4 B | 262.144 | apache-2.0 | GGUF Q5_K_M | Abliterated, vision, espejo sin modificaciones |
| Qwen/Qwen3-VL-4B-Instruct | 4,4 B | 262.144 | apache-2.0 | safetensors y otras | Modelo raiz con alineamiento intacto |
| huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated | 4,4 B | 262.144 | apache-2.0 | fp16 | Version abliterated sin cuantizar |
| mradermacher/Huihui-Qwen3-VL-4B-Instruct-abliterated-GGUF | 4,4 B | 262.144 | apache-2.0 | GGUF (multiples quants) | Fuente original de la cuantizacion |

## Limitaciones y advertencias

- La abliteration elimina parte de los filtros de rechazo, por lo que el modelo puede generar contenido sensible, ofensivo o inseguro sin las salvaguardas del original; no es apto para despliegues publicos sin moderacion adicional.
- Riesgo de alucinacion: como todo VLM de 4B, puede inventar detalles en la descripcion de imagenes o en la lectura de documentos, especialmente con texto pequeno o imagenes ruidosas.
- Idiomas declarados limitados a fr y en; no se garantiza un rendimiento correcto en espanol aunque el modelo raiz lo soporte.
- La cuantizacion Q5_K_M introduce perdida de precision respecto al fp16, con posible degradacion en tareas de razonamiento visual fino.
- Licencia apache-2.0 permite uso comercial, pero el autor del espejo no ofrece garantias y remite a la fuente en caso de divergencia.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad; la integridad se respalda solo por el sha256 declarado.
- No se documentan capacidades de tool calling ni agentes, por lo que no debe asumirse su disponibilidad en produccion.

## Enlaces

- Repositorio del espejo: https://huggingface.co/TheShellMaster/cypher-Huihui-Qwen3-VL-4B-Instruct-abliterated
- Modelo raiz: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Abliteration: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated
- Cuantizacion GGUF original: https://huggingface.co/mradermacher/Huihui-Qwen3-VL-4B-Instruct-abliterated-GGUF
