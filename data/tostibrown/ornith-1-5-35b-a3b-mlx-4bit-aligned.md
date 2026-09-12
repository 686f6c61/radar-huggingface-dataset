# Tostibrown/Ornith-1.5-35B-A3B-MLX-4bit-aligned

## Resumen

Ornith-1.5-35B-A3B-MLX-4bit-aligned es un reempaquetado del checkpoint cuantizado a 4 bits de ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit, publicado por el usuario Tostibrown. No se trata de un modelo nuevo ni de un ajuste adicional: los pesos son bit a bit idénticos a los del checkpoint original. El único cambio es el relleno con espacios en blanco del encabezado JSON de cada shard safetensors, de forma que el segmento de datos empieza en un offset alineado a 8 bytes. El autor lo etiqueta como "aligned".

El problema que resuelve es de rendimiento de carga en MLX. En safetensors, los `data_offsets` son relativos al inicio del segmento de datos, que se sitúa en `8 + header_length`. Si ese inicio no está alineado de forma natural, MLX solo puede mapear en memoria (mmap) una parte de los tensores y debe copiar el resto a RAM anónima mediante memcpy. En el checkpoint publicado, 1.421 de 1.757 tensores (aproximadamente el 97%) caían en ese caso. Con el reempaquetado, esa cifra baja a 0.

El modelo base es un transformer de mezcla de expertos (MoE) de unos 34.660 millones de parámetros totales, con etiqueta de arquitectura `qwen3_5_moe` y nomenclatura `35B-A3B`, lo que sugiere del orden de 3.000 millones de parámetros activos por token. Está pensado para generación de texto conversacional, con licencia MIT y pesos en formato MLX de 4 bits. Su relevancia es práctica: demuestra que una intervención de pocos bytes en el layout de fichero, sin tocar un solo peso, recupera 4,7 GB de memoria y acelera el prefill en contexto largo un factor de 3,2×.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE); etiqueta de arquitectura `qwen3_5_moe`. Detalle de capas, atencion y enrutado no disponible |
| Parametros totales | 34.660.608.768 (34,66 mil millones), dato real de los safetensors |
| Parametros activos | No confirmado en la documentacion; la nomenclatura `A3B` sugiere del orden de 3.000 millones activos por token |
| Longitud de contexto | No disponible; la model card reporta una medicion de prefill con 80.000 tokens de contexto |
| Tipos de cuantizacion | MLX 4-bit (realizada por ornith-ai en el checkpoint base); este repositorio no recuantiza |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors en layout MLX, 4 shards (`model-00001-of-00004` a `model-00004-of-00004`) |
| Tamano del repositorio | 19,5 GB |
| Numero de tensores | 1.757 |
| Libreria declarada | mlx |
| Pipeline | text-generation (etiquetas adicionales: conversational) |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna mas alla de la etiqueta `qwen3_5_moe` y de la nomenclatura `35B-A3B`, compatible con un diseno de mezcla de expertos con enrutado disperso en el que solo se activa una fraccion pequena de los parametros por token. Tampoco se detallan el numero de expertos, el numero de expertos activados por token, la dimension oculta, el numero de capas, el tipo de atencion ni el tokenizador. No hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste por preferencias (RLHF, DPO u otras). Toda esa informacion corresponde al modelo base ornith-ai/Ornith-1.5-35B-A3B, que no forma parte del material proporcionado.

Lo que si esta documentado con precision es la intervencion sobre el layout de fichero. En safetensors, cada tensor tiene un offset relativo al inicio del segmento de datos, situado en `8 + header_length`. Al anadir unos pocos bytes de espacios en blanco validos al encabezado JSON de cada shard, todos los offsets absolutos se desplazan la misma cantidad; si el inicio del segmento de datos queda alineado, el payload completo queda alineado de forma natural sin reescribir ni un byte de pesos. Los rellenos aplicados son de 6 bytes en el shard 1 y de 3 bytes en los shards 2, 3 y 4. El repositorio incluye `MEI_ALIGN_MANIFEST.json`, con el directorio de origen, la alineacion objetivo y el sha256 del payload de cada shard, de modo que la afirmacion de identidad bit a bit es verificable mediante un script incluido en la propia model card. El reempaquetado se genero con `tools/align_safetensors.py` del repositorio Mei. No es una optimizacion especifica de Mei: cualquier runtime basado en MLX se beneficia.

## Capacidades

- La model card no documenta capacidades funcionales del modelo; se limita a describir el reempaquetado de los pesos. Las capacidades del checkpoint son, por definicion, exactamente las del modelo base ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit, cuyas caracteristicas no estan incluidas en la informacion disponible.
- Por metadatos (pipeline `text-generation`, etiqueta `conversational`), esta orientado a generacion de texto y a dialogos multi-turno en ingles.
- No hay confirmacion documentada de soporte de tool calling, function calling ni uso como agente.
- No hay confirmacion documentada de capacidades de razonamiento extendido, modo de pensamiento explicito, vision, audio ni otra modalidad adicional al texto.
- No hay confirmacion documentada de capacidades multilingues mas alla del ingles; el campo de idiomas del repositorio lista unicamente `en`.
- Limitacion importante de portabilidad: el formato de pesos MLX 4-bit impide su uso directo en runtimes CUDA como vLLM, TGI o llama.cpp sin una conversion previa que no se incluye en este repositorio.

## Casos de uso

A falta de documentacion oficial de capacidades, los escenarios siguientes se derivan del perfil tecnico del checkpoint (MoE de ~34,66 mil millones de parametros, 4 bits, runtime MLX, contexto probado a 80.000 tokens) y no de una evaluacion publicada del modelo.

- Inferencia local en Mac con memoria unificada: un MoE de este tamano en 4 bits ocupa 19,55 GB tras la carga, por lo que es viable en equipos Apple Silicon de 32 GB o mas, sin depender de GPU dedicada ni de servicios en la nube.
- Procesamiento de documentos largos: la model card reporta prefill a 80.000 tokens en 36,7 segundos, lo que permite ingerir contratos, informes o expedientes extensos en una sola pasada y responder preguntas sobre ellos.
- Asistentes conversacionales en ingles: la etiqueta `conversational` y la ventana de contexto larga encajan con bots de atencion al cliente que mantienen historial de conversacion amplio en local.
- Desarrollo de prototipos y evaluacion de variantes MoE: al ser un checkpoint cuantizado y ligero de cargar, sirve para comparar estrategias de cuantizacion o medir el impacto del layout de fichero en el rendimiento real, con una metodologia reproducible a partir del manifiesto de alineacion.
- Despliegue en portatiles para trabajo sin conexion: en escenarios con requisitos de privacidad o sin acceso a red, el modelo puede ejecutarse integramente en el equipo y evitar el envio de datos a terceros.
- Investigacion sobre tecnicas de alineacion de memoria: el repositorio es un caso de estudio directo sobre como el padding del encabezado safetensors afecta al mmap y al consumo de RAM, con metricas antes y despues publicadas.
- Integracion en pipelines de generacion de texto mediante MLX: cualquier herramienta construida sobre MLX (por ejemplo `mlx-lm` o el propio runtime Mei) puede consumir este checkpoint con `mei --model-dir /ruta/al/modelo --model-profile ornith-1.5-35b-a3b`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos publicados corresponden al rendimiento de carga e inferencia del reempaquetado frente al checkpoint publicado, medidos en un Mac de la serie M con el mismo binario y los mismos ajustes, variando unicamente el almacenamiento de respaldo:

| Metrica | Checkpoint publicado | Este reempaquetado |
|---|---|---|
| Memoria tras la carga | 24,28 GB | 19,55 GB |
| Prefill en frio a 80.000 tokens de contexto | 117,6 s | 36,7 s |
| Tensores no alineados | 1.421 de 1.757 | 0 de 1.757 |

En terminos relativos: 4,7 GB de memoria recuperados y un prefill en contexto largo 3,2 veces mas rapido, sin modificar ningun peso. El repositorio no publica mediciones de latencia por token en decodificacion (tokens/s) ni de throughput en lote.

Detalle de los shards, con el padding aplicado y el hash del payload:

| Shard | Padding del encabezado | Bytes de payload | sha256 del payload (truncado) |
|---|---|---|---|
| model-00001-of-00004 | 6 bytes | 5.343.636.096 | ae982af457a3c4cb... |
| model-00002-of-00004 | 3 bytes | 5.368.405.504 | 4570d482fbc3ddb5... |
| model-00003-of-00004 | 3 bytes | 5.368.256.256 | 411ffa6f850b8f88... |
| model-00004-of-00004 | 3 bytes | 3.428.489.600 | 32a9b3e550f03bb3... |

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: 19,55 GB medidos tras la carga en un Mac de la serie M. Esta cifra corresponde al peso del modelo a 4 bits y no incluye la cache KV, cuyo consumo crece con la longitud de contexto (en el caso medido, 80.000 tokens).
- Cabe en equipos Apple Silicon con memoria unificada de 32 GB o superior. Para contexto largo sostenido conviene disponer de 36-64 GB de memoria unificada, ya que a los 19,55 GB de pesos hay que sumar la cache KV.
- GPU CUDA recomendadas: no aplicable directamente, porque el formato es MLX. Para usar este modelo en A100, H100, RTX 4090 u otras GPU NVIDIA seria necesario convertir los pesos (por ejemplo a GGUF o a un formato compatible con vLLM), conversion que no se proporciona en este repositorio.
- Opciones de despliegue: cualquier runtime basado en MLX; el ejemplo de la model card usa `mei --model-dir /ruta/al/modelo --model-profile ornith-1.5-35b-a3b`. El autor indica explicitamente que la mejora no es especifica de Mei y que cualquier runtime MLX se beneficia. No se documenta compatibilidad directa con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: unica cifra conocida, el prefill en frio a 80.000 tokens de contexto en 36,7 segundos en un Mac de la serie M no especificado. No hay datos publicados de velocidad de decodificacion ni de throughput con batching.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos alternativos de la misma categoria en el material proporcionado; la busqueda web no devolvio ningun resultado relevante (unicamente enlaces a Facebook). La comparacion mas significativa posible es entre el checkpoint original y este reempaquetado, que comparten pesos bit a bit:

| Version | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| ornith-ai/Ornith-1.5-35B-A3B (base, pesos sin cuantizar) | 34,66 mil millones | No disponible | Sin cuantizar | MIT | Modelo de origen; alineacion de fichero no documentada |
| ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit | 34,66 mil millones | No disponible | MLX 4-bit | MIT | Checkpoint publicado; 1.421 de 1.757 tensores desalineados |
| Tostibrown/Ornith-1.5-35B-A3B-MLX-4bit-aligned (este repositorio) | 34,66 mil millones | No disponible | MLX 4-bit | MIT | Payload bit a bit identico; 0 tensores desalineados; 19,55 GB tras la carga y 36,7 s de prefill a 80k |

Comparacion con modelos de terceros: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no evaluados ni documentados. Al ser un reempaquetado bit a bit identico, hereda integramente los sesgos del modelo base, que no se describen en la informacion disponible.
- Riesgo de alucinacion: no cuantificado. No se han publicado evaluaciones de fidelidad, veracidad ni tasas de alucinacion.
- Idioma: el campo de idiomas declara unicamente ingles. El comportamiento en castellano u otras lenguas no esta documentado ni evaluado.
- Contexto: la model card reporta un prefill a 80.000 tokens, pero no confirma cual es la longitud de contexto nominal del modelo ni su comportamiento en recuperacion de informacion a esa distancia.
- Licencia: MIT, heredada del modelo base. Es permisiva e incluye uso comercial, pero conviene conservar la atribucion a los autores de Ornith; el autor de este repositorio declara que el merito del modelo es de los autores originales.
- Portabilidad: al estar en formato MLX 4-bit, no es utilizable directamente en ecosistemas CUDA ni en herramientas que esperan GGUF. Cualquier despliegue en NVIDIA o en llama.cpp requiere una conversion que no se incluye.
- Este repositorio no debe evaluarse por su calidad como modelo: no introduce cambios en los pesos, solo en el layout de fichero. Cualquier mejora de calidad respecto al checkpoint publicado es inexistente por construccion.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita validar el checkpoint de forma independiente. La verificacion de identidad bit a bit queda en manos de quien ejecute el script del manifiesto.
- Fecha de publicacion declarada: 12 de septiembre de 2026, con actualizacion el mismo dia.
- Los resultados de rendimiento se midieron en un Mac de la serie M sin especificar modelo ni cantidad de memoria; no son extrapolables directamente a otros equipos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Tostibrown/Ornith-1.5-35B-A3B-MLX-4bit-aligned
- Checkpoint base cuantizado: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-4bit
- Modelo base sin cuantizar: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio Mei (incluye `tools/align_safetensors.py`): https://github.com/tijs/mei
- Paper, blog o demo adicionales: no disponible; la busqueda web realizada no devolvio resultados relevantes.
