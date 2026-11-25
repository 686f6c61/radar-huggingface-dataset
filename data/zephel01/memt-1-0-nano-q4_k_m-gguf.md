# zephel01/MemT-1.0-Nano-Q4_K_M-GGUF

## Resumen
MemT-1.0-Nano es un modelo de lenguaje con arquitectura de mezcla de expertos (MoE) desarrollado por MemTensor, publicado bajo licencia Apache-2.0. Su característica distintiva no es el backbone en sí, sino la incorporación de bloques de memoria nativa en cada una de sus 10 capas de atención completa: cada bloque almacena un estado de 16 x 256 x 256 números FP32 (40 MiB por capa, 0,9 GB en total) que el modelo lee durante la generación y en el que escribe al final de cada turno. Esto permite que un hecho mencionado una vez, o un documento insertado en la memoria, pueda ser consultado en una conversación nueva que no contiene ese contexto.

El backbone es Qwen3.6-35B-A3B (familia Ornith-1.5-35B-A3B), un MoE de aproximadamente 35.000 millones de parámetros totales con unos 3.000 millones activos por token. El modelo está orientado a inglés y japonés, y su caso de uso principal es la memoria persistente entre conversaciones sin necesidad de reinyectar contexto en el prompt.

La versión que nos ocupa es una cuantización Q4_K_M en formato GGUF, publicada por zephel01, de 22,07 GB (22.068.711.712 bytes). Incluye los bloques de memoria en BF16/F32 tal como se publicaron. Es una build en estado BETA, medida únicamente en una NVIDIA RTX 5090 y con kernels de memoria que no se han probado en AMD. El modelo solo funciona con el motor Abyss; llama.cpp no reconoce los bloques de memoria, por lo que la funcionalidad de memoria no opera allí.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bloques de memoria nativa en 10 capas de atención completa (backbone Qwen3.6-35B-A3B) |
| Parámetros totales | 35.111.542.048 |
| Parámetros activos | ~3B por token (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (16,0 GB), Q6_K (5,0 GB), F32; bloques de memoria en BF16/F32 (0,9 GB) |
| Idiomas soportados | inglés (en), japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Tamaño del archivo | 22,07 GB (22.068.711.712 bytes) |
| SHA-256 | `3ad1c8e44119ecc77135d3613234f7c61555bc7e1e40bc71a83082ec55c0e90a` |
| Motor compatible | Abyss v1.3.206 o superior (llama.cpp no soporta los bloques de memoria) |
| Estado | BETA (medido solo en RTX 5090, solo NVIDIA) |

## Arquitectura y entrenamiento
El modelo combina un backbone MoE de tipo Qwen3.6-35B-A3B (aproximadamente 35B parámetros totales, ~3B activos por token) con un mecanismo de memoria por capa. Cada una de las 10 capas de atención completa incorpora un bloque de memoria que representa un estado de 16 x 256 x 256 valores FP32 (40 MiB por capa). El modelo lee ese estado mientras responde y escribe el turno en él al finalizar. Los bloques de memoria se conservan en BF16/F32 tal como se publicaron, mientras que el resto de tensores usa los tipos por tensor del Q4_K_M oficial de Ornith-1.5-35B-A3B (Q4_K 16,0 GB, Q6_K 5,0 GB, F32).

La conversión se realizó exclusivamente con las herramientas propias de Abyss (`tools/memt_convert.py`), leyendo el checkpoint de Hugging Face y escribiendo el GGUF con los tipos por tensor del Q4_K_M oficial (`--types-from`), usando los k-quants de `trench-gguf` mediante cuantizador GPU. No se empleó imatrix. Las claves y el tokenizador se copiaron del Q4_K_M de Ornith-1.5-35B-A3B (misma familia); los parámetros de muestreo (`general.sampling.*`) corresponden a la generation_config de MemT-1.0-Nano (temperature 0.7, top_p 0.95, top_k 40) y `qwen35moe.memt.*` contiene los ajustes de memoria. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO.

## Capacidades
- Generación de texto conversacional multi-turno, con soporte de memoria persistente entre conversaciones distintas.
- Lectura y escritura de un estado de memoria por capa: un hecho mencionado una vez puede recuperarse en una conversación nueva que no lo contiene.
- Inserción de documentos en la memoria mediante `POST /v1/memory/<id>/documents` con `{"text": "..."}`, recuperables posteriormente.
- Compatibilidad con endpoints OpenAI (`/v1/chat/completions`) y Anthropic (`/v1/messages`) a través del motor Abyss.
- Gestión de memorias vía API: listado (`GET /v1/memory`), borrado (`POST /v1/memory/<id>/delete`).
- Interoperabilidad de formato de estado con el código HF de MemT (`save_state`): un estado guardado por el código HF se carga en Abyss y viceversa.
- Capacidad de ejecutar el backbone sin memoria (sin campo `memory` en la petición), comportándose como Qwen3.6-35B-A3B.
- Soporte multilingüe limitado a inglés y japonés; la recuperación de hechos en japonés desde la memoria está verificada en las pruebas del autor.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso
- Asistentes con memoria de usuario entre sesiones: el modelo permite recordar datos personales (por ejemplo, el nombre de una mascota) en conversaciones nuevas sin reinyectar el historial completo, usando el campo `memory` con un identificador persistente.
- Bases de conocimiento personal ligeras: mediante `POST /v1/memory/<id>/documents` se pueden escribir notas o documentos que el modelo consulta después en conversaciones que no los incluyen, útil para diarios, notas de proyecto o fichas de cliente.
- Atención al cliente con continuidad: un agente puede mantener una memoria por cliente (`memory: "cliente_123"`) y recuperar preferencias o incidencias previas en cada nueva interacción, reduciendo la longitud del prompt.
- Tutoría o acompañamiento educativo: hechos y progreso del estudiante se escriben en la memoria al final de cada turno y se consultan en sesiones posteriores, sin necesidad de arrastrar todo el histórico.
- Procesamiento de documentación en japonés: al estar verificada la recuperación de hechos desde documentos japoneses, resulta adecuado para flujos donde se escribe una nota en japonés y se hacen preguntas posteriores sobre ella en conversaciones separadas.
- Investigación sobre memoria en LLM: el modelo sirve como banco de pruebas para estudiar lectura/escritura de estados de memoria, con scripts de referencia disponibles (`recipes/memt/ref_memt.py`, `recipes/memt-flash/memeval.py`) para comparar implementaciones.
- Despliegue local en GPU de consumo: al estar pensado para 8, 12 y 16 GB de VRAM (según las etiquetas y pruebas del autor en RTX 5090), encaja en entornos de escritorio para prototipos de asistentes con memoria.

## Benchmarks y rendimiento
El autor publica comprobaciones de fidelidad frente a una implementación de referencia en numpy float64 escrita a partir del código HF (`recipes/memt/ref_memt.py`), usando KL(referencia || motor):

| Comprobación | Resultado |
|---|---|
| Backbone, memoria desactivada, primeros 512 tokens de un documento largo | Este Q4_K_M: KL 0,194; mismo token top en 88,3 % (ruta prompt). Q8_0: KL 0,034 |
| Lectura de memoria, Q8_0, estado escrito por la referencia cargado | KL 0,003 (ruta token) / 0,004 (ruta prompt); mismo token top en las 28 posiciones. Sin memoria con la misma entrada: KL 3,01 |
| Escritura de memoria, Q8_0, 58 tokens sobre estado vacío | Error relativo por capa 0,8-2,8 % (ruta prompt) / 1,4-3,6 % (ruta token); coseno >= 0,9994 |

Prueba de recuperación (`recipes/memt-flash/memeval.py`, 19 hechos: ejemplo del gatito de MemT 4, nota japonesa escrita como documento 5, 10 hechos inventados dichos en un turno y preguntados uno a uno, cada uno en conversación nueva), idénticos en este Q4_K_M y en el Q8_0:

| Condición | Hechos correctos |
|---|---|
| Sin memoria | 0 de 19 |
| Hechos anteriores en la misma conversación | 19 de 19 |
| Solo mediante la memoria (conversación nueva) | 19 de 19 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada: el archivo Q4_K_M ocupa 22,07 GB, pero las etiquetas y pruebas del autor apuntan a ejecución en 8, 12 y 16 GB de VRAM (presumiblemente con offload parcial o configuraciones específicas del motor Abyss); no se detalla la distribución exacta de capas en GPU/CPU.
- GPU recomendadas: RTX 5090 (plataforma de medida del autor); el motor solo está verificado en NVIDIA. Los kernels de memoria no se han ejecutado en AMD.
- Cabe en GPU de consumo: sí, según las etiquetas `8gb-vram`, `12gb-vram`, `16gb-vram` y las pruebas del autor sostenidas a esos límites en una RTX 5090.
- Despliegue: exclusivamente mediante el motor Abyss (v1.3.206 o superior). llama.cpp no está verificado con este archivo y no reconoce los bloques de memoria, por lo que la funcionalidad de memoria no funciona allí. Instalación vía `./setup-deepseek.sh --model memt-nano --download-model` (Linux) o `setup-deepseek.bat` (Windows 11, no verificado).
- Latencia y throughput: no disponibles. No se han publicado cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria nativa | Licencia | Formato / motor |
|---|---|---|---|---|---|
| MemT-1.0-Nano Q4_K_M (este) | 35,1B totales, ~3B activos | no disponible | Sí, 10 bloques de 40 MiB | Apache-2.0 | GGUF, solo Abyss |
| MemT-1.0-Nano (base, HF) | 35,1B totales, ~3B activos | no disponible | Sí, mismos bloques | Apache-2.0 | Safetensors, código HF |
| Qwen3.6-35B-A3B / Ornith-1.5-35B-A3B | ~35B totales, ~3B activos | no disponible | No | no disponible en esta ficha | GGUF (referencia de tipos y tokenizador) |
| MemT-1.0-Flash-32G96G (overlay del mismo autor) | no disponible | no disponible | Sí (overlay) | no disponible en esta ficha | GGUF, Abyss |

La diferencia principal frente a Qwen3.6-35B-A3B es la capa de memoria persistente y el requisito de motor propietario (Abyss). Frente a la versión base en Hugging Face, esta entrega sacrifica precisión (KL 0,194 frente a 0,034 del Q8_0 en el backbone) a cambio de un tamaño desplegable en GPU de consumo.

## Limitaciones y advertencias
- Estado BETA: medido en un único PC con RTX 5090 y solo en NVIDIA; el archivo puede ser reemplazado por una build mejor tras más mediciones.
- La memoria solo funciona con el motor Abyss; llama.cpp no reconoce los bloques, de modo que en ese motor la funcionalidad de memoria queda inoperativa.
- La memoria está pensada para las conversaciones para las que fue escrita; con una memoria activa mientras se lee texto no relacionado, el comportamiento no está garantizado (el autor indica que no se ha evaluado en detalle).
- Las respuestas largas en japonés no se evaluaron por separado; solo se verificó la recuperación de cinco hechos de una nota japonesa.
- Idiomas limitados a inglés y japonés; no se documenta soporte para castellano ni otras lenguas.
- No hay datos publicados sobre sesgos, tasas de alucinación ni benchmarks estándar; el riesgo de alucinación no está cuantificado.
- Licencia Apache-2.0 permite uso comercial, pero la dependencia del motor Abyss y el estado BETA introducen riesgo operativo para producción.
- La instalación en Windows 11 no está verificada.
- Longitud de contexto no disponible; no se puede planificar el dimensionado de prompts largos sin ese dato.
- Los kernels de memoria no se han probado en AMD; el soporte está restringido a NVIDIA.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/zephel01/MemT-1.0-Nano-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/MemTensor/MemT-1.0-Nano
- Motor Abyss: https://github.com/zephel01/Abyss
- Overlay MemT-1.0-Flash-32G96G: https://huggingface.co/zephel01/MemT-1.0-Flash-32G96G-GGUF
- Manual de Abyss (sección MemT-1.0-Nano): https://github.com/zephel01/Abyss/blob/main/docs/MANUAL.md#memt-10-nano-native-memory-beta
- Cuantizador trench-gguf: https://github.com/zephel01/trench-gguf
- Plantilla para reportar resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+MemT-1.0-Nano+Q4_K_M+on+YOUR_GPU
