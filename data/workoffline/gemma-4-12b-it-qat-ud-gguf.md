# WorkOffline/gemma-4-12B-it-qat-UD-GGUF

## Resumen

`WorkOffline/gemma-4-12B-it-qat-UD-GGUF` es un espejo (mirror) del modelo Gemma 4 12B en su variante instruction-tuned con cuantizacion consciente del entrenamiento (QAT), convertido a formato GGUF por Unsloth y redistribuido por el usuario WorkOffline para que la aplicacion WorkOffline pueda descargarlo desde un unico punto con revision fijada y verificacion SHA-256. No se trata de un modelo nuevo ni de un fine-tune: los bytes son identicos a los ficheros originales de `unsloth/gemma-4-12B-it-qat-GGUF`, derivados a su vez de los pesos QAT publicados por Google en `google/gemma-4-12B-it-qat-q4_0-unquantized`.

El modelo subyacente es Gemma 4 12B, desarrollado por Google DeepMind, con aproximadamente 11.900 millones de parametros en formato safetensors y una ventana de contexto que no se detalla en la informacion proporcionada. La variante QAT esta pensada para reducir el coste de inferencia manteniendo la calidad del modelo original, y su conversion a GGUF con la receta Dynamic de Unsloth (UD-Q4_K_XL) permite ejecutarla en hardware de consumo mediante llama.cpp y derivados.

La relevancia de esta ficha es practica: documenta un artefacto de despliegue reproducible (un unico fichero GGUF de 6,7 GB mas un proyector multimodal F16 de 175 MB) bajo licencia Apache 2.0, lo que facilita su integracion en aplicaciones de escritorio o entornos sin acceso estable a Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4 de Google DeepMind; detalles de arquitectura no presentes en la informacion) |
| Parametros totales | 11.907.350.576 (~11,9 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (Unsloth Dynamic, ~4 bits); proyector multimodal en F16 |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero principal `gemma-4-12B-it-qat-UD-Q4_K_XL.gguf` + `mmproj-gemma-4-12B-it-qat-F16.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada; el repositorio es un espejo de pesos, no una model card tecnica. Lo que si se sabe con certeza es que el modelo original es Gemma 4 12B en variante instruction-tuned y que ha pasado por un proceso de Quantization-Aware Training (QAT) en Google, ya que los pesos de partida se publican como `gemma-4-12B-it-qat-q4_0-unquantized`. El QAT implica simular la cuantizacion durante el entrenamiento o el ajuste fino para que el modelo final conserve calidad tras comprimirse a 4 bits.

La conversion a GGUF la realiza Unsloth con su receta Dynamic (UD), que asigna precisiones distintas por tensor en lugar de aplicar un unico esquema uniforme; el resultado es `UD-Q4_K_XL`, un cuantizado de aproximadamente 4 bits con tamano de 6.716.356.800 bytes. El repositorio incluye ademas un proyector multimodal `mmproj` en F16 (175.115.840 bytes), lo que indica que el modelo base acepta entrada de imagen y que llama.cpp puede procesarla junto con texto. No hay datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en modo instruction-tuned (etiqueta `conversational` en el repositorio).
- Procesamiento de imagenes: el repositorio incluye un proyector multimodal (`mmproj-...-F16.gguf`), lo que habilita entrada vision-lenguaje en llama.cpp.
- Razonamiento y respuesta a instrucciones, heredado del ajuste instruction del modelo Gemma 4.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el artefacto puede servirse mediante infraestructura de inferencia estandar.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Tool calling, function calling y razonamiento multi-paso en agentes: no documentados en la informacion disponible.
- Modo thinking explicito: no documentado en la informacion disponible.

## Casos de uso

- Asistente local de escritorio: la aplicacion WorkOffline puede cargar el GGUF de 6,7 GB con llama.cpp u Ollama y ofrecer un asistente conversacional sin conexion, con revision fijada y verificacion SHA-256 en la descarga.
- Analisis de documentos e imagenes en local: combinando el fichero principal con el proyector `mmproj` F16, se puede enviar una captura o un escaneo junto a una pregunta y obtener una descripcion o extraccion de datos sin salir del equipo.
- Prototipado de productos sobre Gemma 4 sin gestionar pesos completos: al ser un cuantizado de ~4 bits, permite validar prompts, flujos y calidad de respuesta antes de invertir en el modelo sin cuantizar o en GPUs de datacenter.
- Despliegue en entornos con conectividad restringida o air-gapped: el espejo con revision fijada evita depender de la disponibilidad del repositorio upstream de Unsloth o Google en el momento de la instalacion.
- Generacion de codigo y asistencia tecnica en estaciones de trabajo: el modelo instruction-tuned de 12B puede integrarse en editores o terminales mediante un servidor local compatible con la API de OpenAI (llama.cpp server, Ollama).
- Clasificacion y resumen por lotes: con un unico fichero GGUF y sin dependencias de red, se pueden procesar lotes de textos (tickets, resenas, correos) en una maquina con GPU de consumo.
- Base para fine-tuning o evaluacion comparativa: al estar en Apache 2.0 y en formato GGUF, sirve como referencia de calidad de la variante QAT frente a cuantizaciones no QAT del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF pesa 6,72 GB; con overhead de contexto y cache KV, se recomienda un minimo de 8-10 GB de VRAM para texto y 10-12 GB si se activa la entrada multimodal con el proyector F16.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 y H100. Cualquier GPU con 12 GB o mas puede ejecutar el modelo completo en VRAM.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4090 24 GB). En GPUs de 8 GB habria que recurrir a offload parcial a CPU o a una cuantizacion menor no incluida en este repositorio.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` apunta a servidores con API compatible con OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| WorkOffline/gemma-4-12B-it-qat-UD-GGUF | ~11,9 B | no disponible | GGUF (UD-Q4_K_XL) | Apache 2.0 | Espejo verificado del GGUF de Unsloth sobre pesos QAT de Google; incluye proyector multimodal |
| google/gemma-4-12B-it-qat-q4_0-unquantized | ~11,9 B | no disponible | safetensors (QAT) | Apache 2.0 | Pesos originales de Google; requiere conversion a GGUF para llama.cpp |
| unsloth/gemma-4-12B-it-qat-GGUF | ~11,9 B | no disponible | GGUF | Apache 2.0 | Fuente directa de los ficheros de este repositorio; sin pin de revision propio |
| Gemma 4 12B en otras cuantizaciones (no QAT) | ~11,9 B | no disponible | GGUF | Apache 2.0 | Alternativa sin QAT; calidad potencialmente inferior a igual numero de bits |

## Limitaciones y advertencias

- Este repositorio no es un modelo original: es una copia byte a byte de los GGUF de Unsloth. Cualquier error, sesgo o limitacion proviene del modelo de Google, no del redistribuidor.
- No hay model card tecnica propia: faltan datos de contexto, idiomas, entrenamiento y evaluacion, lo que dificulta justificar decisiones de produccion solo con esta fuente.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 12B; no se han publicado evaluaciones de fidelidad para esta variante.
- La cuantizacion a ~4 bits puede degradar tareas sensibles a precision (matematicas complejas, codigo de baja frecuencia, instrucciones largas) respecto al modelo sin cuantizar.
- La licencia declarada es Apache 2.0, pero la model card advierte de que el modelo upstream declara Apache-2.0 sin incluir fichero de licencia; conviene revisar los terminos de Gemma 4 de Google antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente del espejo.
- El nombre del fichero puede diferir del upstream; la integridad debe verificarse con los SHA-256 publicados en la model card.
- Al ser un espejo, la actualizacion depende del mantenedor: si Unsloth publica una revision nueva, este repositorio no la recogera automaticamente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WorkOffline/gemma-4-12B-it-qat-UD-GGUF
- Modelo base (pesos QAT de Google): https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- GGUF original de Unsloth: https://huggingface.co/unsloth/gemma-4-12B-it-qat-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
