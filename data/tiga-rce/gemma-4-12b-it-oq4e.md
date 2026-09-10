# TiGa-RCE/gemma-4-12B-it-oQ4e

## Resumen

TiGa-RCE/gemma-4-12B-it-oQ4e es una cuantizacion comunitaria de un modelo Gemma 4 de 12B en su variante instruct, publicada por el usuario TiGa-RCE en Hugging Face. El repositorio contiene unicamente los pesos cuantizados en formato MLX safetensors, con un total real de 11.907.350.320 parametros (unos 11,9 mil millones) y un tamano de repositorio de 7,0 GB. No incluye model card descriptiva del modelo base, ni resultados de evaluacion, ni informacion sobre datos de entrenamiento.

La relevancia de esta publicacion es acotada y muy especifica: se trata de una cuantizacion mixta de 4 bits generada con la herramienta oQ (oMLX v0.6.4), con group size 64, pensada para ejecutar un modelo de ~12B en hardware Apple Silicon mediante la libreria MLX. Para un desarrollador que trabaje en un Mac con memoria unificada, este tipo de artefacto es la via practica de desplegar localmente un modelo de esa escala sin recurrir a GPU dedicadas.

Conviene subrayar que el modelo no registra descargas ni likes en el momento de la consulta, que la licencia no esta declarada en el repositorio y que la busqueda web realizada no ha devuelto ninguna fuente tecnica relevante sobre el modelo, su entrenamiento o su evaluacion. Por tanto, esta ficha describe con precision el artefacto de cuantizacion, pero no puede validar el comportamiento del modelo base subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el campo `model_type` del repositorio es `gemma4_unified`; no se detalla la arquitectura interna) |
| Parametros totales | 11.907.350.320 (~11,9 mil millones) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE; el recuento de parametros coincide con un modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, cuantizacion mixta de precision con oQ (oMLX v0.6.4), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 7,0 GB |
| Biblioteca declarada | mlx |
| Fecha de publicacion | 10 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base mas alla del identificador `gemma4_unified` que aparece en los metadatos del repositorio y en las etiquetas del modelo. No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo fases de ajuste por instrucciones con RLHF, DPO u otras tecnicas de alineamiento. Tampoco se detalla si emplea atencion estandar, atencion lineal o algun esquema hibrido.

La unica innovacion tecnica documentada es el propio proceso de cuantizacion: se ha aplicado oQ (oMLX v0.6.4), una tecnica de cuantizacion mixta de precision que asigna distintos niveles de bits a distintas capas o tensores en funcion de su sensibilidad, con un presupuesto global de 4 bits y un group size de 64. El autor indica que esta version se subio el 10 de septiembre de 2026 y que sustituye a una version anterior, por lo que quienes hubieran descargado los pesos antes de esa fecha deberian volver a descargarlos. No se especifica que cambio entre ambas versiones.

## Capacidades

- Generacion de texto: capacidades inferidas del proposito declarado del modelo base (`-it`, variante ajustada por instrucciones), si bien no hay documentacion que las confirme en este repositorio.
- Razonamiento y matematicas: no disponible; no se han publicado evaluaciones.
- Generacion de codigo: no disponible.
- Capacidades de vision: no disponible; el identificador `unified` sugiere un posible tratamiento multimodal, pero no hay confirmacion en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas esta vacio.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el formato MLX safetensors con cuantizacion de 4 bits y 7,0 GB de pesos permite cargar el modelo en equipos Apple Silicon con 16 GB o mas de memoria unificada, evitando el coste de GPU dedicadas para tareas de prototipado.
- Asistente de escritura y edicion de texto en local: uso como modelo instruct para reescritura, resumen y correccion de documentos sin enviar datos a servicios externos, aprovechando que el artefacto es autocontenido.
- Prototipado rapido de aplicaciones LLM en macOS: sirve como modelo de referencia para validar pipelines de `mlx-lm` antes de escalar a modelos mayores o a infraestructura con GPU.
- Evaluacion comparativa de tecnicas de cuantizacion: al ser una cuantizacion mixta de 4 bits generada con oQ, resulta util como punto de comparacion frente a cuantizaciones uniformes de 4 bits del mismo modelo base, midiendo degradacion de perplejidad y calidad de generacion.
- Tareas de clasificacion y extraccion de informacion offline: entornos con requisitos de privacidad estrictos (sanidad, legal, administracion) donde no se permite salida de datos a la nube y se necesita un modelo de ~12B ejecutandose en portatil.
- Educacion e investigacion: uso en docencia o experimentacion academica con recursos limitados, siempre que se respete la licencia del modelo base, que aqui no esta declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ningun otro conjunto de referencia, ni del modelo base ni de la version cuantizada. Tampoco se dispone de mediciones de perplejidad que cuantifiquen la degradacion introducida por la cuantizacion a 4 bits.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: los pesos ocupan 7,0 GB; es razonable prever entre 8 y 10 GB de memoria efectiva durante la inferencia, considerando cache KV y buffers, aunque no hay mediciones publicadas.
- Memoria unificada en Apple Silicon: el formato es MLX, por lo que el objetivo natural son chips de la serie M. Un Mac con 16 GB de memoria unificada deberia poder cargar el modelo, con margen limitado para contextos largos; 24 GB o 32 GB ofrecen holgura.
- GPU dedicadas: no es el objetivo declarado del artefacto. Para ejecutarlo en CUDA seria necesario convertir los pesos a otro formato, algo no documentado en el repositorio. GPU tipo RTX 4090 (24 GB) o A100/H100 tendrian capacidad de sobra para un modelo de 12B en 4 bits, pero requeririan dicha conversion.
- Cabe en GPU de consumo: si, en el sentido de que 7 GB de pesos caben en tarjetas con 8 GB o mas, aunque la ruta soportada aqui es MLX sobre Apple Silicon.
- Opciones de despliegue: MLX mediante `mlx-lm`, y oMLX, la herramienta con la que se genero la cuantizacion. No se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio, ni se proporcionan pesos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de la variante cuantizada, por lo que la comparativa se limita a caracteristicas objetivas del artefacto.

| Modelo | Parametros | Formato | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TiGa-RCE/gemma-4-12B-it-oQ4e | 11,9 mil millones | MLX safetensors | 4 bits mixta (oQ, group size 64) | no disponible | no disponible | Hugging Face, 0 descargas |
| Modelo base Gemma 4 12B-it (sin cuantizar) | no disponible en la informacion proporcionada | no disponible | no aplica | no disponible | no disponible | no verificado en la busqueda |
| Otras cuantizaciones de 4 bits del mismo modelo base | mismos parametros de origen | no disponible | 4 bits uniforme (tipico) | no disponible | no disponible | no localizadas |

No se han encontrado en la busqueda web modelos comparables alternativos con datos verificables.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia. Esto impide confirmar si se permite el uso comercial y obliga a verificar los terminos de uso del modelo base antes de cualquier despliegue en produccion.
- Trazabilidad insuficiente: la model card no identifica con un enlace o identificador exacto el modelo base del que procede la cuantizacion, ni la revision concreta utilizada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no hay evaluaciones publicadas que permitan acotar su magnitud en este artefacto.
- Degradacion por cuantizacion: la compresion a 4 bits con group size 64 puede reducir la calidad en tareas sensibles a la precision, como matematicas o generacion de codigo. No se han publicado mediciones de perplejidad que cuantifiquen esa perdida.
- Sesgos: no documentados. Al no haber informacion sobre el dataset de entrenamiento ni sobre el proceso de alineamiento, no es posible evaluar sesgos conocidos.
- Idiomas: el campo de idiomas esta vacio, por lo que se desconoce el soporte real mas alla de lo que ofrezca el modelo base. No se debe asumir cobertura multilingue.
- Contexto: se desconoce la longitud de contexto soportada; planificar aplicaciones con ventanas largas sin verificar este dato es arriesgado.
- Adopcion nula: cero descargas y cero likes implican ausencia de validacion por parte de la comunidad. No existe evidencia externa de que los pesos carguen correctamente ni de que produzcan salidas coherentes.
- Version sustituida: el autor indica que esta publicacion reemplaza una version anterior con el mismo nombre. Cualquier copia descargada antes del 10 de septiembre de 2026 esta desactualizada.
- Ecosistema restringido: al estar en formato MLX, el artefacto no es directamente utilizable en el stack CUDA habitual sin una conversion previa no documentada.
- Resultados de busqueda no concluyentes: las consultas web realizadas devolvieron exclusivamente dominios de apuestas y juego sin relacion alguna con el modelo, por lo que no se ha podido contrastar ninguna afirmacion sobre el mismo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TiGa-RCE/gemma-4-12B-it-oQ4e
- Herramienta de cuantizacion oQ (oMLX), citada en la model card: https://github.com/jundot/omlx
- No se han encontrado papers, blogs, repositorios de codigo, demos ni articulos tecnicos adicionales sobre este modelo en la busqueda web realizada.
