# treeish/Qwen3.8-27B-oQ3e-MTP-MLX

## Resumen

Qwen3.8-27B-oQ3e-MTP-MLX es un paquete de pesos cuantizados publicado por el usuario treeish para el runtime MLX. Se trata de una distribucion cuantizada del modelo base Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 27,78 mil millones de parametros, con torre de vision integrada y una ventana de contexto de 262.144 tokens. La cuantizacion aplicada es oQ3e (mixed precision con calibracion imatrix), con 3 bits afines por defecto y overrides por tensor a 4, 5 y 6 bits, todo con group size 64.

El paquete no introduce cambios en pesos, tokenizer ni configuracion del modelo original: anade una plantilla de chat concreta (Froggeric v22.5), un manifiesto de ficheros con digests SHA-256 y los textos de licencia y procedencia. Sus pesos son byte a byte identicos a mlx-works/Qwen3.8-27B-oQ3e-mtp en el commit `6a3f3c74a14d2fcba565ad8d5b11aff52b522f42`, por lo que se presenta como una redistribucion curada y fijada por commit, orientada al flujo de trabajo de agente de codigo de Sprig dentro del proyecto Treeish.

Su relevancia practica es acotada pero clara: permite ejecutar un modelo multimodal de 27B en memoria unificada de Apple Silicon a partir de 36 GB (48 GB recomendados por el autor), una horquilla notablemente inferior a la que exigiria el modelo sin cuantizar. Incluye ademas una cabeza MTP (Multi-Token Prediction) embebida de una capa, pensada para acelerar la decodificacion. El autor declara que el benchmark de release todavia no se ha ejecutado sobre este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 27B (base Qwen/Qwen3.8-27B), con torre de vision y cabeza MTP embebida |
| Parametros totales | 27.781.427.952 (~27,78 B) |
| Parametros activos | no aplica: modelo denso, no MoE |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ3e mixed precision con imatrix: 3 bits afines por defecto, group size 64; overrides por tensor a 4, 5 y 6 bits con group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (3 shards) |
| Tamano de los pesos | 13.785.495.056 bytes (~13,8 GB) de datos de tensores |
| Tamano del repositorio | 13,8 GB |
| Tensores indexados | 2.209 en total: 333 de la torre de vision y 29 de la cabeza MTP |
| Capa MTP | 1 capa embebida bajo `language_model.mtp.*` |
| Libreria / runtime | MLX (runtime MLX Swift fijado por Treeish) |
| Memoria recomendada | 36 GB de memoria unificada en uso; 48 GB recomendados por el autor |
| Modelo base | Qwen/Qwen3.8-27B |
| Plantilla de chat | Froggeric v22.5 (froggeric/Qwen-Fixed-Chat-Templates, commit `855bffc49448e299789730ff92c9b8d834d6cc14`) |
| Fecha de publicacion | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.8-27B: un transformer denso de 27B parametros con pipeline declarado `image-text-to-text`, lo que implica entrada multimodal de imagen y texto. El paquete cuantizado conserva 333 tensores de torre de vision, de modo que la capacidad de procesamiento visual se mantiene en la version de 3 bits. Ademas, incorpora una cabeza de Multi-Token Prediction de una sola capa (`language_model.mtp.*`, 29 tensores), cuyo proposito tipico es predecir varios tokens por paso para acelerar la generacion, habitualmente mediante decodificacion especulativa o verificacion en paralelo.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base en la informacion proporcionada: no hay datos sobre numero de tokens, composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico documentado es el proceso de cuantizacion: el informe imatrix del paquete fuente registra 128 muestras de 512 tokens extraidas del dataset `oqe_code_multilingual`, con 503 de 504 entradas aplicadas. Este detalle sugiere una calibracion orientada a codigo multilingue, aunque el autor no precisa el commit exacto del modelo base empleado en la conversion, por lo que la receta no es byte-reproducible. La conversion la realizo la herramienta oMLX 0.5.7.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat especifica (Froggeric v22.5) incluida en el paquete.
- Procesamiento de imagen y texto combinados: el pipeline declarado es `image-text-to-text` y se conservan los 333 tensores de la torre de vision.
- Contexto largo de 262.144 tokens, apto para repositorios, documentos o historiales extensos en una sola ventana.
- Flujo de agente de codigo: el paquete se describe explicitamente como soporte del workflow de agente de programacion de Sprig en Treeish.
- Decodificacion acelerada mediante la cabeza MTP embebida de una capa.
- Capacidad multimodal con entrada de imagenes; no se documenta salida de imagen ni audio.
- Capacidades multilingues: no disponibles en la informacion proporcionada. El unico indicio es que el dataset de calibracion imatrix se denomina `oqe_code_multilingual`.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no documentado en la informacion proporcionada.

## Casos de uso

- Agente de programacion en local: el paquete esta construido para el flujo de agente de codigo de Sprig, de modo que puede emplearse como motor de un asistente que lee, edita y ejecuta tareas sobre un repositorio, con la ventaja de correr integramente en el equipo del desarrollador.
- Analisis de capturas de pantalla y diagramas: al conservar la torre de vision, permite pasar imagenes de interfaces, diagramas de arquitectura o mensajes de error junto al texto para obtener explicaciones o parches propuestos.
- Refactorizacion de bases de codigo grandes: con 262.144 tokens de contexto es viable cargar varios ficheros relacionados a la vez y pedir cambios coherentes entre modulos sin trocear el contexto.
- Generacion de pruebas y revision de pull requests: el modelo puede redactar tests unitarios o comentar diffs dentro de un pipeline de CI, siempre que el runtime de integracion soporte el formato MLX o se convierta previamente.
- Asistencia tecnica sobre documentacion extensa: manuales, RFCs o normativas de cientos de paginas caben en una sola ventana, lo que permite respuestas con referencias cruzadas entre secciones.
- Prototipado con requisitos de privacidad: al ejecutarse en memoria unificada local, es adecuado para entornos donde los datos no pueden salir del dispositivo, como codigo propietario o documentacion interna.
- Investigacion sobre cuantizacion: sirve como objeto de estudio para medir el impacto de una cuantizacion mixta de 3 bits con overrides por tensor sobre un modelo multimodal de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica que el benchmark de release de Treeish todavia no se ha ejecutado sobre este paquete y que el estado se registrara en `RELEASE_MANIFEST.json`. Tampoco se ofrecen cifras de latencia ni de throughput.

## Requisitos de hardware

- Los pesos cuantizados ocupan 13.785.495.056 bytes (~13,8 GB) repartidos en 3 shards, mas la sobrecarga del runtime y la cache KV.
- El autor indica uso desde 36 GB de memoria unificada y recomienda 48 GB, en funcion de la longitud de contexto, la configuracion de cache y otras aplicaciones en ejecucion.
- El formato es MLX safetensors, pensado para Apple Silicon con memoria unificada; no es cargable directamente por runtimes CUDA habituales.
- GPU dedicadas (A100, H100, RTX 4090): no disponible. Para usarlas haria falta una conversion a otro formato y un runtime que soporte los overrides de cuantizacion por tensor definidos en `config.json` y el layout MTP embebido de Qwen.
- Opciones de despliegue: MLX / MLX Swift es la ruta soportada de forma nativa. vLLM, TGI, llama.cpp y Ollama no se declaran compatibles con este paquete; requeririan conversion a GGUF u otro formato y no esta garantizada la reproduccion de los overrides por tensor ni de la capa MTP.
- Latencia y throughput: no disponible.
- Nota de compatibilidad: el paquete esta construido para el runtime MLX Swift fijado por Treeish; otro runtime debe soportar los overrides de cuantizacion por tensor y el layout MTP embebido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| treeish/Qwen3.8-27B-oQ3e-MTP-MLX | 27,78 B | 262.144 tokens | oQ3e 3 bits con overrides 4/5/6 bits | Apache 2.0 | MLX safetensors | Publicado; 0 descargas y 0 likes en el momento de la consulta |
| mlx-works/Qwen3.8-27B-oQ3e-mtp | no disponible | no disponible | oQ3e con cabeza MTP (origen de los pesos de este paquete) | no disponible | MLX | Publicado en HuggingFace |
| Qwen/Qwen3.8-27B | ~27 B (modelo base) | no disponible para el modelo base | Sin cuantizar | Apache 2.0 | no disponible | Publicado en HuggingFace |

No se dispone de datos de rendimiento comparado ni de otros modelos alternativos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3 bits sacrifica calidad del modelo a cambio de menor consumo de memoria y mayor velocidad de generacion local; el autor recomienda validar el modelo con los prompts, el formato de herramientas y el runtime propios de cada aplicacion.
- No hay benchmarks publicados para este paquete, por lo que no es posible cuantificar la perdida de calidad respecto al modelo base.
- Las capacidades multilingues no estan documentadas; el unico indicio es el nombre del dataset de calibracion imatrix (`oqe_code_multilingual`), insuficiente para afirmar cobertura de idiomas concretos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a los modelos de lenguaje, agravado potencialmente por la cuantizacion agresiva.
- La procedencia no es byte-reproducible: el autor senala que no se identifica el commit exacto del modelo base usado en la conversion, solo el commit del paquete fuente.
- Dependencia fuerte del runtime: otro motor debe soportar los overrides de cuantizacion por tensor y el layout MTP embebido; en caso contrario, el modelo puede no cargar o degradarse.
- El paquete no incluye codigo ejecutable propio; las integraciones deben aportar su propio runtime.
- Licencia Apache 2.0, que permite uso comercial, pero la licencia se hereda del modelo base Qwen/Qwen3.8-27B y conviene revisar el texto completo incluido en `LICENSE`.
- Contexto nominal de 262.144 tokens: consumir la ventana completa exige mucha mas memoria que el minimo indicado, por lo que los 36-48 GB citados corresponden a configuraciones de contexto mas modestas.
- Metricas de adopcion nulas en el momento de la consulta (0 descargas, 0 likes), lo que limita la validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/treeish/Qwen3.8-27B-oQ3e-MTP-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paquete origen de los pesos: https://huggingface.co/mlx-works/Qwen3.8-27B-oQ3e-mtp
- Plantillas de chat de Froggeric: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo; las busquedas devolvieron unicamente paginas corporativas de Volvo Cars sin relacion con el contenido.
