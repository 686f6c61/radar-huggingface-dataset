# wallawalla47/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-Dense8-Infernix

## Resumen

Swift-1.5-Qwen3.8-Flash-Next-NVFP4-Dense8-Infernix es un artefacto de inferencia publicado por el usuario wallawalla47 (Wallawalla47 en HuggingFace) que empaqueta el fine-tune UkisAI Swift-1.5-Qwen3.8-Flash-Next-NVFP4 para el motor Infernix, un runtime en C++/CUDA escrito por el mismo autor. No es un modelo nuevo: es una conversión de formato y cuantización pensada para ejecutar un modelo MoE multimodal de gran tamaño en una única GPU consumer Blackwell (RTX 5090, 32 GB), apoyándose en RAM del sistema y en una unidad NVMe. El repositorio ocupa 76,9 GB repartidos en tres particiones `.infernix`.

El modelo subyacente es un fine-tune de Qwen3.8-Flash-Next orientado a "pensar menos": según las afirmaciones de UkisAI (no verificadas en esta conversión), reduce un 55,8 % de media y un 63,4 % de mediana los tokens de razonamiento en GPQA-Diamond con esfuerzo `xhigh`, manteniéndose a 0,2 puntos del modelo base. Mantiene la arquitectura MoE del original, con 48 capas, 512 expertos enrutados por capa (top-10), un drafter MTP para decodificación especulativa y torre de visión, lo que da 24.576 expertos enrutados en total (63 GiB).

La relevancia de esta ficha es doble: por un lado documenta una técnica de despliegue extrema (expertos en RAM fijada, caché en VRAM y tabla PLE n-gram leída desde disco) para un MoE que no cabría de otra forma en 32 GB; por otro, advierte de que el artefacto lo firma el propio autor como trabajo hobby generado en buena parte con IA, con `inference: false` en los metadatos y dependiente de un volumen externo que no está en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con 48 capas, 512 expertos enrutados por capa (top-10), drafter MTP y torre de vision (hereda la de Qwen3.8-Flash-Next) |
| Parametros totales | no disponible (el autor solo publica el dato de 24.576 expertos enrutados, 63 GiB) |
| Parametros activos | no disponible (top-10 de 512 expertos por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos en NVFP4 W4A4 (bit-exactos respecto al checkpoint de UkisAI); proyecciones densas BF16 y `lm_head` almacenados en 8 bits ("Dense8"); tabla PLE n-gram en volumen aparte, disponible en FP8 (52 GB), BF16 (109 GB) e IQ4_NL/IQ3_S (29 GB) |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (etiquetada como `license: other`) sobre la conversion, mas Qwen Community License 1.0 del modelo base |
| Formato de pesos | `.infernix` en tres particiones (32 GB + 32 GB + 12,87 GB) con tabla de contenidos en la parte 1, mas `conversion.json` (894.525 bytes) y un volumen `.ngram` externo obligatorio |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-Flash-Next: un transformer con mezcla de expertos de 48 capas, 512 expertos enrutados por capa con enrutamiento top-10 (24.576 expertos en total, 63 GiB en el checkpoint de origen), un drafter MTP (multi-token prediction) que actúa como modelo especulativo para acelerar la decodificación, y capacidad multimodal de entrada imagen-texto. UkisAI partió del checkpoint oficial y lo ajustó para reducir la verbosidad del modo de razonamiento: el objetivo declarado es obtener las mismas respuestas con menos tokens de pensamiento, no mejorar la calidad bruta. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se usaron RLHF o DPO.

La conversión de wallawalla47 preserva los expertos NVFP4 bit a bit y recomprime a 8 bits las proyecciones densas BF16 y el `lm_head`; todos los objetos del artefacto comparten formato y forma con su conversión previa Qwen3.8-Flash-Next-NVIDIA-NVFP4-Dense8-Infernix. La particularidad técnica más importante es que la tabla PLE n-gram de Qwen3.8-Flash-Next (320.001.536 filas) no viaja dentro de los ficheros del modelo: se lee en bloques aleatorios de 4 KiB desde NVMe y se pasa al motor con `--ngram-volume`. El motor Infernix mantiene los 24.576 expertos en RAM del sistema fijada (pinned), cachea en VRAM los "calientes", calcula en CPU parte de los fallos de cada capa y lee la tabla n-gram de 52 GB desde disco.

## Capacidades

- Generación de texto conversacional multi-turno, con el modo de razonamiento "eficiente" de Swift 1.5 (menos tokens de pensamiento para el mismo problema).
- Razonamiento de varios pasos y modo `thinking` con distintos niveles de esfuerzo (`low`, `medium`, `xhigh` según la card de UkisAI).
- Entrada multimodal imagen-texto: pipeline declarado `image-text-to-text`, con torre de visión en el modelo base.
- Capacidades de código y terminal: la card de UkisAI reporta mejoras de hasta 2,0 puntos en LiveCodeBench v6 y Terminal-Bench 2.1 frente al base.
- Decodificación especulativa mediante el drafter MTP integrado en el checkpoint.
- Predicción asistida por tabla n-gram PLE externa, que actúa como memoria léxica/fáctica consultada en tiempo de inferencia.
- Soporte de tool calling y de agentes: no disponible explícitamente en la información proporcionada (el modelo base Qwen3.8-Flash-Next no detalla este punto en la card).
- Capacidades multilingües: no disponible.
- Audio: no disponible.

## Casos de uso

- Despliegue de un MoE multimodal grande en una sola GPU consumer: el caso de uso central del artefacto es correr un modelo de la familia Flash-Next en una RTX 5090 de 32 GB, con los expertos en RAM del sistema y la tabla n-gram en NVMe. Adecuado para laboratorios y hobbyistas con una única máquina Blackwell y 128 GB o más de RAM.
- Asistentes de razonamiento con coste por token bajo: el modo eficiente de Swift 1.5 reduce un 55,8 % los tokens de pensamiento en GPQA-Diamond, lo que abarata cargas de evaluación científica y preguntas de opción múltiple con razonamiento largo.
- Análisis de documentos con imagen y texto: al ser `image-text-to-text`, sirve para extraer información de capturas, diagramas o formularios combinados con instrucciones textuales largas.
- Agentes de línea de comandos y automatización de terminal: los incrementos declarados en Terminal-Bench 2.1 lo hacen razonable para tareas de shell iterativas, siempre que el motor exponga bucle de herramientas.
- Prototipado de investigación sobre decodificación especulativa: el par MTP + tabla n-gram PLE permite medir empíricamente el efecto de la memoria n-gram en la latencia y en la perplejidad, con volúmenes de 29, 52 y 109 GB para comparar.
- Evaluación comparada de fine-tunes "thinking-efficient": útil para reproducir las tablas de UkisAI con el mismo checkpoint en otro motor y comprobar si las ganancias de tokens se mantienen.
- Servicio interno de bajo volumen con latencia no crítica: al requerir lectura aleatoria de NVMe y cómputo parcial en CPU, encaja en escenarios de un solo usuario o pocas peticiones concurrentes, no en serving de alta concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks absolutos en la información disponible. La card solo reproduce diferencias relativas declaradas por UkisAI entre Swift 1.5 y Qwen3.8-Flash-Next en BF16, a esfuerzo `xhigh`, y no incluye mediciones de esta conversión NVFP4/Dense8.

| Metrica | Resultado declarado (Swift 1.5 frente al base) |
|---|---|
| GPQA-Diamond (xhigh) | Dentro de 0,2 puntos del base |
| Tokens de pensamiento en GPQA-Diamond (media) | -55,8 % |
| Tokens de pensamiento en GPQA-Diamond (mediana) | -63,4 % |
| Rango del resto de benchmarks de la card | De -3,1 puntos (IFBench) a +2,0 puntos (LiveCodeBench v6, Terminal-Bench 2.1) |
| GPQA-Diamond a esfuerzo medio y bajo | Aproximadamente -2,5 puntos |
| Throughput y latencia en Infernix | no disponible |

## Requisitos de hardware

- GPU: una RTX 5090 (32 GB, Blackwell) es el objetivo declarado. NVFP4 requiere arquitectura Blackwell; no hay soporte indicado para Ada, Ampere o GPUs de datacenter en esta conversión.
- VRAM: 32 GB, usados como caché de expertos "calientes" y para las activaciones; los 63 GiB de expertos viven en RAM del sistema fijada (pinned), por lo que se recomienda un equipo con al menos 96-128 GB de RAM. Dato exacto de RAM total recomendada: no disponible.
- Almacenamiento: 76,9 GB para las tres particiones del modelo, más el volumen n-gram en NVMe (52 GB en FP8 recomendado, 109 GB en BF16 o 29 GB en IQ3_S). El autor insiste en NVMe por la lectura aleatoria de bloques de 4 KiB.
- Cabe en GPU consumer: sí, en RTX 5090; en GPUs de 24 GB o menos no hay conversión ni receta publicada.
- Opciones de despliegue: exclusivamente el motor Infernix (C++/CUDA, repositorio GitHub del autor). No hay GGUF, no hay safetensors, y los metadatos marcan `inference: false`; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La arquitectura de ejecución (cómputo parcial en CPU, lectura de n-gram desde disco) sugiere latencias muy superiores a un despliegue totalmente en VRAM, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Notas |
|---|---|---|---|---|---|
| wallawalla47/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-Dense8-Infernix | no disponible (24.576 expertos, 63 GiB) | no disponible | NVFP4 W4A4 + Dense8, formato `.infernix`, requiere volumen n-gram | Swift Open License 1.0 + Qwen Community License 1.0 | Objeto de esta ficha; solo motor Infernix; 76,9 GB + volumen externo |
| ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4 (base) | no disponible | no disponible | NVFP4 W4A4 con densas en BF16 (ModelOpt) | no disponible en la informacion | Checkpoint de origen del fine-tune; mismo layout que el de NVIDIA |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | no disponible | no disponible | NVFP4 W4A4, densas BF16 | no disponible en la informacion | Checkpoint oficial de NVIDIA; referencia de calidad y de receta de cuantizacion |
| wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix | no disponible | no disponible | NVFP4 bit-exacto, `.infernix` | no disponible en la informacion | Conversion sin fine-tune del checkpoint de NVIDIA; incluye la copia del volumen n-gram FP8 de 52 GB |
| wallawalla47/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix | no disponible | no disponible | IQ3_S / GSQ-RCO, `.infernix` | no disponible en la informacion | Alternativa mas agresiva (volumen n-gram de 29 GB), pensada para equipos con menos disco |

## Limitaciones y advertencias

- El propio autor declara que el artefacto, la receta de conversion, el motor y buena parte de la card se hicieron con IA (mayoritariamente Claude Opus 5.5) y que es trabajo hobby, probablemente incompleto o inexacto.
- El repositorio no es autosuficiente: sin un volumen PLE n-gram externo (52 GB FP8 recomendado) el modelo no funciona. El volumen no se incluye y hay que descargarlo de otro repositorio.
- Formato propietario y motor único: `.infernix` solo lo interpreta Infernix. No hay ruta de exportacion a GGUF, safetensors ni compatibilidad con ecosistemas estándar de serving.
- Dependencia de hardware muy concreta: NVFP4 exige Blackwell y el autor apunta a una RTX 5090; no hay guia para otras GPUs.
- Riesgo de alucinacion: no evaluado en esta conversion. La tabla n-gram PLE puede introducir sesgos hacia secuencias frecuentes del corpus de la tabla, sin medicion publicada.
- Idiomas soportados: no disponibles. No se puede confirmar cobertura multilingue ni calidad fuera del ingles.
- Licencia: Swift Open License v1.0 (etiquetada como `other`) convive con la Qwen Community License 1.0 del base. Los terminos exactos de uso comercial no se detallan en la informacion disponible y deben revisarse en `LICENSE` y `LICENSE-QWEN` antes de cualquier despliegue productivo.
- Validacion comunitaria minima: 46 descargas y 1 like en el momento de la ficha. No hay informes independientes de calidad ni de estabilidad.
- Las cifras de ahorro de tokens y de benchmarks son afirmaciones de UkisAI sobre los modelos en BF16, no mediciones de esta conversion NVFP4/Dense8.
- El campo `inference: false` en los metadatos indica que la plataforma de HuggingFace no puede ejecutar el modelo; cualquier uso requiere infraestructura propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wallawalla47/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-Dense8-Infernix
- Modelo base (checkpoint de UkisAI): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4
- Tablas de evaluacion de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-NVFP4#evaluation
- Checkpoint oficial de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Motor Infernix (C++/CUDA): https://github.com/Wallawalla47/Infernix
- Volumen n-gram FP8 de 52 GB (recomendado): https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix/blob/main/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix.ngram
- Volumen n-gram BF16 de 109 GB: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix
- Volumen n-gram IQ4_NL/IQ3_S de 29 GB: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-Infernix
- Conversion bit-exacta del checkpoint de NVIDIA: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Infernix
- Conversion Dense8 del checkpoint de NVIDIA: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-NVIDIA-NVFP4-Dense8-Infernix
- Conversion sin censura: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-Uncensored-NVFP4-Infernix
- Conversion FP8 bit-exacta: https://huggingface.co/Wallawalla47/Qwen3.8-Flash-Next-FP8-Infernix
- Documento de volúmenes n-gram del repositorio: NGRAM-VOLUME.md (incluido en el propio repositorio de HuggingFace)
