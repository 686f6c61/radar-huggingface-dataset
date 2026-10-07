# SovernityHQ/gemma-4-12b-it-mlx-4bit

## Resumen

SovernityHQ/gemma-4-12b-it-mlx-4bit es una conversion del modelo instructivo multimodal google/gemma-4-12B-it de Google DeepMind al formato MLX y su cuantizacion a 4 bits, realizada por SovernityHQ. No es un entrenamiento nuevo ni un ajuste fino: se parte del checkpoint oficial en bfloat16 (revision 5926caa4ec0cac5cbfadaf4077420520de1d5205, de 2026-06-04) y se transforman los pesos para que puedan ejecutarse de forma nativa sobre Apple Silicon mediante la libreria MLX. Google no ha participado en la conversion ni la respalda.

El modelo conserva la topologia del original, etiquetada como gemma4_unified, con 11.959.730.224 parametros (~12B) y una tuberia de image-text-to-text, lo que implica soporte de entrada de imagen (y, segun la propia model card, tambien proyecciones de audio). La cuantizacion es afin, de 4 bits, con tamano de grupo 64, lo que resulta en aproximadamente 4,512 bits por peso de media; las capas de normalizacion y el embedding posicional de vision permanecen en bfloat16. El repositorio ocupa 6,8 GB, frente a los aproximadamente 24 GB que requeriria el modelo en bfloat16, lo que lo hace viable en equipos de consumo con memoria unificada.

Su relevancia practica es doble: por un lado, abarata el coste de memoria de un modelo de ~12B con vision, y por otro, el autor lo presenta como el modelo que Sovernity Ursa descarga y ejecuta localmente en el Mac del usuario. La licencia declarada es Apache 2.0, heredada de la licencia de Gemma 4, y la conversion es reproducible: los ficheros de pesos son byte a byte identicos a los del repositorio mlx-community/gemma-4-12B-it-4bit en la revision 73bcf09092aa277861d5a191b989b666f7f32e8f.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta de configuracion `gemma4_unified`), con torre de vision y proyecciones de audio; detalles internos del bloque no disponibles |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afin (`--q-mode affine`), tamano de grupo 64, ~4,512 bits por peso de media; resto del checkpoint original en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (dos fragmentos: `model-00001-of-00002.safetensors`, 5.351.756.584 bytes; `model-00002-of-00002.safetensors`, 1.389.282.927 bytes) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna mas alla de la etiqueta `gemma4_unified` en el `config.json` y del pipeline `image-text-to-text`. Lo que si se detalla es que la red contiene una torre de vision (con un *patch embedder* y un *position embedding*) y proyecciones de embeddings de audio y de vision. En la conversion a 4 bits se cuantizan el modelo de lenguaje, las proyecciones de embeddings de vision y audio, y el *patch embedder* de vision; las capas de normalizacion y el embedding posicional de vision se mantienen en bfloat16, presumiblemente para no degradar la estabilidad numerica. Este reparto selectivo de precision es un detalle tecnico relevante: no se trata de una cuantizacion uniforme de todos los tensores.

Respecto al entrenamiento, esta ficha no dispone de informacion sobre el numero de tokens, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo base. Tampoco hay datos sobre la innovacion tecnica de la arquitectura original. El proceso documentado aqui es exclusivamente de conversion y cuantizacion: se ejecuto `mlx_vlm.convert` con `--q-bits 4 --q-group-size 64 --q-mode affine` sobre el checkpoint descargado, en Python 3.12 con mlx 0.31.2, mlx-lm 0.31.3, mlx-vlm 0.6.2 y transformers 5.10.2 (torch 2.14.1 se instalo unicamente para que Transformers pudiera cargar el procesador de Gemma 4, sin tocar los pesos), sobre un Apple M5 Pro con macOS 27.0.1. Los ficheros `chat_template.jinja`, `config.json`, `generation_config.json`, `processor_config.json` y `tokenizer.json` se conservan sin cambios respecto al modelo base; `tokenizer_config.json` se ha vuelto a guardar con Transformers 5.10.2 y solo difiere en la clave `"local_files_only": false`.

## Capacidades

- Generacion de texto conversacional en modo instructivo (*instruction-tuned*), heredada de google/gemma-4-12B-it.
- Entrada multimodal de imagen y texto (`pipeline_tag: image-text-to-text`), con proyecciones de vision cuantizadas y operativas.
- Proyecciones de embeddings de audio presentes y cuantizadas en la conversion, lo que indica soporte de entrada de audio en la arquitectura de origen; no se documenta en la model card el formato ni el alcance de esa capacidad.
- Plantilla de chat propia (`chat_template.jinja`, 17.466 bytes) incluida en el repositorio, lo que permite un uso conversacional directo sin definir el formato a mano.
- Inferencia local en Apple Silicon mediante MLX, sin necesidad de GPU dedicada ni de servicios en la nube.
- Soporte de tool calling, function calling, agentes, multi-step reasoning o modo de razonamiento explicito: no disponible en la informacion proporcionada.
- Cobertura multilingue concreta: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en macOS: el modelo esta empaquetado especificamente para MLX y su caso de uso declarado es ser el modelo que Sovernity Ursa descarga y ejecuta en el Mac del usuario, de modo que las conversaciones y los datos no salen del equipo. Los 6,8 GB del repositorio encajan en equipos con memoria unificada moderada.
- Descripcion y analisis de imagenes en local: al ser un modelo image-text-to-text, permite pasar una captura, un diagrama o una fotografia junto a una pregunta en lenguaje natural, sin subir el fichero a un servicio externo. Es adecuado para flujos donde la confidencialidad de la imagen es un requisito.
- Prototipado rapido de aplicaciones multimodales en Python: con `pip install mlx-vlm` y una unica invocacion de `python -m mlx_vlm generate --model SovernityHQ/gemma-4-12b-it-mlx-4bit` se puede tener un punto de partida funcional para validar una idea antes de invertir en infraestructura de servidor.
- Procesamiento por lotes en un portatil Apple Silicon: tareas de resumen, clasificacion o extraccion de informacion sobre documentos con imagen (por ejemplo, facturas o formularios escaneados) pueden ejecutarse por la noche en el propio equipo, aprovechando la cuantizacion de 4 bits para mantener el consumo de memoria dentro de los 16-32 GB tipicos de un Mac moderno.
- Entorno de desarrollo sin conectividad: al no requerir llamadas a API externas, es utilizable en entornos aislados (laboratorios, auditorias, maquinas de desarrollo sin salida a internet) donde no se permite enviar datos a terceros.
- Banco de pruebas de cuantizacion: dado que la conversion es reproducible y byte a byte identica a mlx-community/gemma-4-12B-it-4bit, sirve para comparar el comportamiento de un mismo modelo en 4 bits frente al checkpoint original en bfloat16 y medir la degradacion introducida por la cuantizacion.
- Base para experimentacion academica con modelos multimodales de ~12B en hardware de consumo, evitando el coste de una GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a indicar que la cuantizacion altera ligeramente las salidas del modelo respecto a los pesos originales y remite a la model card de google/gemma-4-12B-it para los datos de evaluacion, uso previsto y limitaciones del modelo base.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio pesa 6,8 GB, por lo que la carga de pesos requiere del orden de 7 GB; conviene reservar entre 8 y 12 GB de memoria unificada para acomodar el contexto, las activaciones y el cache KV, cuyo tamano exacto depende de la longitud de contexto y del lote, datos no disponibles.
- Plataforma obligatoria: MLX es una libreria de Apple, de modo que la inferencia nativa requiere Apple Silicon (serie M). La conversion se genero y probo en un Apple M5 Pro, pero no se publica una lista de chips minimos soportados.
- GPU NVIDIA o AMD: no soportadas por este formato de pesos. Para CUDA o ROCm habria que acudir a otra conversion del modelo base.
- Encaje en hardware de consumo: si, en un Mac con memoria unificada de 16 GB o superior. Con 8 GB el margen es muy estrecho y probablemente insuficiente con contextos largos.
- Opciones de despliegue: mlx-vlm (documentado en la propia model card: `pip install mlx-vlm` y `python -m mlx_vlm generate`). Otras opciones como vLLM, TGI, llama.cpp u Ollama no estan documentadas para este repositorio concreto y no se pueden confirmar.
- Latencia y throughput: no disponibles. Dependen del chip Apple Silicon empleado, de la longitud de contexto y del lote.
- Nota de compatibilidad: dado que los pesos son identicos a los de mlx-community/gemma-4-12B-it-4bit, cualquier procedimiento que funcione con ese repositorio deberia funcionar igual con este.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| SovernityHQ/gemma-4-12b-it-mlx-4bit | 11.959.730.224 (~12B) | no disponible | 4 bits afin, grupo 64 | MLX safetensors | Apache 2.0 | Pesos identicos byte a byte a mlx-community/gemma-4-12B-it-4bit |
| mlx-community/gemma-4-12B-it-4bit | no disponible (mismo modelo base) | no disponible | 4 bits | MLX safetensors | Apache 2.0 | Repositorio de referencia con el que esta conversion es identica |
| google/gemma-4-12B-it | 11.959.730.224 (~12B) | no disponible | bfloat16 sin cuantizar | safetensors | Apache 2.0 | Modelo base oficial de Google DeepMind; mayor precision, ~24 GB de pesos |

Las diferencias de rendimiento entre las tres variantes no pueden cuantificarse porque no se han publicado resultados de benchmarks en la informacion disponible. Otros modelos comparables de la misma categoria y tamano: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La conversion no esta realizada ni respaldada por Google. Cualquier problema derivado de la cuantizacion es responsabilidad del autor de la conversion, no de Google DeepMind.
- La propia model card advierte de que la cuantizacion modificia ligeramente las salidas respecto a los pesos originales en bfloat16. No se documenta la magnitud de esa degradacion ni en que tareas se concentra.
- No se han publicado evaluaciones de sesgo, toxicidad, seguridad o alucinacion para esta version cuantizada. Para esos datos hay que remitirse a la model card del modelo base, si los contiene.
- El alcance real de la multimodalidad (resolucion de imagen soportada, formatos de audio aceptados, limites de tokens multimodales) no se detalla en la informacion disponible.
- La longitud de contexto no figura en los datos proporcionados, por lo que no se puede garantizar el comportamiento en conversaciones largas ni planificar el consumo de memoria del cache KV.
- Los idiomas soportados no estan declarados. No se debe asumir un rendimiento multilingue equivalente al de otros modelos sin verificarlo.
- Plataforma restringida: MLX solo funciona en Apple Silicon. Este repositorio no es utilizable en servidores con GPU NVIDIA ni en entornos Linux/Windows convencionales sin reconvertir los pesos.
- El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha y fue publicado el 2026-10-06, por lo que no existe validacion de la comunidad ni historial de uso en produccion.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero el propio repositorio enlaza el texto de licencia especifico de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`). Antes de un uso comercial conviene revisar ese documento y las condiciones que Google impone al uso de la marca Gemma, que es una marca registrada de Google LLC.
- El tokenizer y la plantilla de chat son los del modelo base sin cambios, salvo la clave `"local_files_only": false` anadida a `tokenizer_config.json` al re-guardarlo con Transformers 5.10.2. Es un cambio inocuo, pero implica que el fichero no coincide byte a byte con el original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SovernityHQ/gemma-4-12b-it-mlx-4bit
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Revision concreta del modelo base usada en la conversion: https://huggingface.co/google/gemma-4-12B-it/tree/5926caa4ec0cac5cbfadaf4077420520de1d5205
- Repositorio con pesos identicos: https://huggingface.co/mlx-community/gemma-4-12B-it-4bit
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Libreria MLX: https://github.com/ml-explore/mlx
- Sitio del autor de la conversion: https://sovernity.com
