# TheWirelessPhoenix/Qwen3.5-4B-abliterated_4bit

## Resumen

TheWirelessPhoenix/Qwen3.5-4B-abliterated_4bit es una version cuantizada a 4 bits en formato MLX de un modelo de la familia Qwen3.5 con 4.205.751.296 parametros (aproximadamente 4,2 mil millones), derivada de la variante "abliterated" publicada por huihui-ai. El autor, TheWirelessPhoenix, se limita a realizar la conversion de formato con mlx-lm 0.31.3 para que el modelo pueda ejecutarse de forma nativa en Apple Silicon, sin aportar entrenamiento adicional ni ajuste fino propio.

El modelo pertenece a la categoria de modelos "abliterated" o "uncensored": se ha eliminado el mecanismo de rechazo de peticiones (las direcciones de refusal en el espacio de activaciones), de modo que el modelo responde a practicamente cualquier instruccion sin las negativas tipicas de un modelo alineado. Esto lo hace relevante para investigacion en seguridad, red-teaming y generacion de datos adversarios, pero tambien lo convierte en una herramienta inadecuada para despliegues de cara al publico sin capas de moderacion externas.

El interes practico de esta ficha concreta es de infraestructura: es una publicacion de 2,4 GB con licencia apache-2.0, pensada para inferencia local en Mac mediante la libreria mlx. La model card no documenta longitud de contexto, idiomas soportados, composicion del dataset ni resultados de benchmarks, y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, por lo que no existe validacion independiente de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag de arquitectura: qwen3_5); no se detallan capas, atencion ni mecanismos internos en la informacion disponible |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits en formato MLX; no se especifica el esquema exacto (tamano de grupo, bits de escalas, etc.) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (con enlace a la licencia del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors en formato MLX (library_name: mlx) |
| Tamano del repositorio | 2,4 GB |
| Pipeline | text-generation |
| Libreria de conversion | mlx-lm 0.31.3 |
| Modelo base | huihui-ai/Huihui-Qwen3.5-4B-abliterated |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo original Qwen3.5-4B: no se detallan el numero de capas, la dimension del modelo, el tipo de atencion, el tokenizador ni la ventana de contexto nativa. Lo unico verificable es el tag de arquitectura `qwen3_5` y el recuento de parametros del fichero de pesos (4.205.751.296), coherente con un modelo denso de aproximadamente 4,2 B de parametros. El pipeline declarado es text-generation y la libreria es mlx, lo que indica que el checkpoint se ha convertido al formato de pesos y al motor de ejecucion de Apple (MLX) mediante mlx-lm 0.31.3.

No hay informacion sobre el proceso de entrenamiento del modelo base: ni numero de tokens, ni composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o post-entrenamiento con datos sinteticos. La unica transformacion documentada en esta cadena es la "abliteracion" aplicada por huihui-ai sobre el modelo Qwen3.5-4B, una tecnica que identifica y suprime la direccion de rechazo en el espacio de activaciones para eliminar el comportamiento de negativa, seguida de la cuantizacion a 4 bits y la conversion a MLX realizada por TheWirelessPhoenix. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, destilacion, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y `text-generation`, con plantilla de chat accesible via `tokenizer.chat_template`, tal y como muestra el ejemplo de uso de la model card.
- Respuesta sin rechazos: por su naturaleza abliterated/uncensored, no aplica filtros de negativa ante peticiones que un modelo alineado rechazaria.
- Conversacion multi-turno: el ejemplo oficial construye una lista de mensajes con roles (`user`) y aplica la plantilla de chat, por lo que el formato soporta historial de conversacion.
- Inferencia local en Apple Silicon: ejecutable de forma nativa mediante `mlx-lm`, sin necesidad de CUDA ni de servidores externos.
- Razonamiento, codigo y matematicas: no hay informacion especifica en la model card ni benchmarks que confirmen el nivel de desempeno en estas tareas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Capacidades multimodales (vision o audio): no disponible; el pipeline declarado es exclusivamente text-generation.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en macOS: el modelo se carga con `mlx_lm.load` y se ejecuta integramente en el equipo, de modo que las conversaciones no salen del dispositivo. Es adecuado para usuarios que necesitan un asistente de proposito general sin enviar datos a la nube.
- Investigacion en seguridad y red-teaming: al carecer de mecanismos de rechazo, permite generar respuestas a peticiones que otros modelos bloquean, lo que resulta util para construir conjuntos de datos adversarios, evaluar filtros de moderacion y estudiar comportamientos de modelos desalineados. Su tamano de 4,2 B permite iterar rapidamente en local.
- Generacion de datos sinteticos para ajuste fino: puede emplearse como generador de pares instruccion-respuesta sin restricciones tematicas, especialmente en dominios donde un modelo alineado se negaria a producir ejemplos. El coste de inferencia es bajo al estar cuantizado a 4 bits.
- Escritura creativa sin restricciones de contenido: narrativa de ficcion con tematicas adultas, violencia o temas sensibles, donde un modelo alineado introduciria negativas o evasivas. El modelo mantiene la plantilla de chat, por lo que se integra en interfaces conversacionales existentes.
- Prototipado rapido de aplicaciones LLM en Mac: con 2,4 GB de pesos y una API Python de tres lineas, sirve para validar plantillas de prompt, flujos de chat y comportamientos antes de invertir en modelos mayores o en infraestructura GPU.
- Extraccion y transformacion de texto en local: tareas de reescritura, resumen o reformateo de documentos en un equipo de sobremesa o portatil Apple, con coste marginal cero por token y sin dependencia de APIs de pago.
- Despliegue como servidor local compatible con la interfaz de mlx-lm: el modelo puede servirse en red local para que otras aplicaciones del entorno consuman el endpoint, siempre que se anada una capa externa de moderacion si el servicio se expone a terceros.
- Base para experimentos de cuantizacion: al ser una conversion 4-bit ya publicada, permite comparar la degradacion de calidad frente al modelo base sin cuantizar, si se dispone de ambos checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto documentacion tecnica relevante sobre este modelo (unicamente resultados genericos de Wikipedia, sin relacion con el repositorio). Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos ocupan aproximadamente 2,4 GB (tamano del repositorio). Con la cache KV y los buffers de inferencia, hay que prever del orden de 3 a 4 GB de memoria para contextos moderados; la cifra exacta depende de la longitud de contexto, que no esta documentada.
- Plataforma obligatoria: MLX esta disenado para Apple Silicon. El modelo no se puede ejecutar con CUDA ni con ROCm sin convertir los pesos a otro formato.
- Equipos recomendados: cualquier Mac con chip de la serie M (M1 o posterior) y 8 GB o mas de memoria unificada. En equipos de 8 GB conviene cerrar aplicaciones pesadas, ya que el sistema operativo consume parte de esa memoria.
- GPU dedicadas (NVIDIA A100, H100, RTX 4090, etc.): no aplicables directamente; requeririan reconvertir el modelo a un formato compatible (por ejemplo, GGUF o safetensors de HuggingFace en precision completa) y usar otro motor de inferencia.
- Cabe en GPU de consumo: no en su formato actual, porque el checkpoint es MLX y no esta pensado para GPUs de consumo. En terminos de tamano, un modelo de 4,2 B en 4 bits ocuparia unos 2,4 GB de VRAM si se dispusiera de una version compatible con CUDA, algo que cabe con holgura en una RTX 3060 de 12 GB o superior; no obstante, esa version no esta publicada en este repositorio.
- Opciones de despliegue documentadas: `mlx-lm` mediante Python (`load` y `generate`) y, de forma general, la infraestructura de MLX para Apple Silicon. No se documentan ficheros GGUF, por lo que llama.cpp, Ollama, vLLM o TGI no pueden consumir este repositorio sin una conversion previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo evaluado, por lo que la comparacion se limita a parametros, licencia, formato y disponibilidad. Los datos de los modelos alternativos son caracteristicas publicas conocidas y deben verificarse en sus repositorios oficiales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TheWirelessPhoenix/Qwen3.5-4B-abliterated_4bit | 4,2 B | No disponible | apache-2.0 | safetensors MLX (4 bits) | Objeto de esta ficha; 0 descargas, sin validacion comunitaria |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated | Aproximadamente 4 B (no confirmado en la informacion disponible) | No disponible | No disponible en la informacion proporcionada | safetensors (formato original) | Modelo origen de la abliteracion; es la referencia para comparar la degradacion por cuantizacion |
| Qwen/Qwen3.5-4B | Aproximadamente 4 B (no confirmado en la informacion disponible) | No disponible | apache-2.0 | safetensors | Modelo base original, con alineacion de seguridad intacta; permite comparar el efecto de la abliteracion |
| Alternativas de ~3-4 B de otras familias (por ejemplo Qwen3-4B, Llama-3.2-3B, Gemma-3-4B) | 3-4 B | Varía segun modelo; consultar documentacion oficial | Apache-2.0 en Qwen3-4B; licencias comunitarias en Llama y Gemma | safetensors, GGUF, MLX segun publicacion | Existen versiones abliteradas y cuantizadas de varias de ellas; no se dispone de datos comparativos de rendimiento en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia de alineacion de seguridad: la abliteracion elimina el mecanismo de rechazo, por lo que el modelo puede producir contenido danino, ilegal, discriminatorio o gravemente ofensivo. No debe exponerse a usuarios finales sin una capa de moderacion externa.
- Riesgo de alucinacion: al ser un modelo de 4,2 B y estar cuantizado a 4 bits, la probabilidad de inventar hechos, citas o referencias es alta, especialmente en dominios especializados.
- Perdida por cuantizacion: la conversion a 4 bits introduce degradacion adicional respecto al modelo abliterated original. No se ha publicado ninguna evaluacion que cuantifique esa perdida.
- Sesgos conocidos: no hay documentacion sobre sesgos en la informacion disponible. Al no haberse aplicado un post-entrenamiento de alineacion, es probable que los sesgos presentes en los datos de preentrenamiento del modelo base se manifiesten sin atenuacion.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto real y la lista de idiomas soportados. El modelo esta publicitado en ingles y no se garantiza un rendimiento correcto en castellano.
- Restricciones de licencia: la licencia declarada es apache-2.0, con enlace a la licencia del modelo Qwen/Qwen3.5-4B. Conviene verificar que la licencia del modelo base cubre el uso comercial y la redistribucion de derivados abliterados antes de un despliegue en produccion.
- Formato limitado: el checkpoint solo es utilizable con MLX en Apple Silicon. No hay ficheros GGUF ni safetensors en formato HuggingFace estandar, lo que restringe el despliegue en servidores con GPU.
- Falta de validacion comunitaria: el repositorio registra 0 descargas y 0 valoraciones, y la model card no documenta evaluaciones, lo que impide anticipar su comportamiento en produccion.
- Trazabilidad incompleta: no se documentan el dataset, el proceso de entrenamiento ni los hiperparametros, lo que dificulta auditar el modelo para usos regulados.
- Fecha de publicacion reciente (2026-09-11) y ausencia de historial de actualizaciones: no hay garantia de mantenimiento ni de correccion de errores por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheWirelessPhoenix/Qwen3.5-4B-abliterated_4bit
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Modelo original de referencia: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Libreria de inferencia: https://github.com/ml-explore/mlx-lm (mlx-lm 0.31.3, indicada en la model card)
- Busqueda web: no se han encontrado papers, blogs, repositorios ni demos adicionales relacionados con este modelo; los resultados devueltos corresponden a entradas genericas de Wikipedia sin relacion con el repositorio.
