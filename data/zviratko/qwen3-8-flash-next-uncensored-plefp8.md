# zviratko/Qwen3.8-Flash-Next-Uncensored-plefp8

## Resumen
zviratko/Qwen3.8-Flash-Next-Uncensored-plefp8 es una cuantizacion en formato MLX del modelo ddark-il/Qwen3.8-Flash-Next-Uncensored, una variante "abliterated" (sin direccion de rechazo) de la familia Qwen3.8-Flash-Next. Lo publica el usuario zviratko en Hugging Face y esta pensado para ejecucion local en Apple Silicon mediante la libreria MLX, con cuantizacion de precision mixta de 4 bits y una tabla PLE (per-layer embeddings) en FP8 que el autor ha trasplantado desde otro artefacto. Es, en palabras del propio autor, un experimento: el efecto de esa tabla PLE menos lossy es desconocido.

El interes tecnico esta en tres frentes. Primero, es un MoE con vision-lenguaje, prediction multi-token (MTP) y etiqueta `qwen4_exp`, lo que apunta a una arquitectura experimental de Qwen. Segundo, el repositorio declara 179.999.981.459 parametros en los metadatos de safetensors (unos 180.000 millones), aunque fuentes de terceros describen la familia base como un MoE de 125.000 millones totales y 6.000 millones activos, discrepancia que conviene resolver antes de planificar despliegues. Tercero, el artefacto existe unicamente para MLX sobre Apple Silicon, con tags que apuntan explicitamente a chips M5 y a la ruta NAX.

Su relevancia es acotada pero clara: permite probar localmente un modelo de razonamiento sin censura con tool calling y vision sobre hardware de Apple, sin depender de APIs en la nube. A cambio, arrastra incertidumbre sobre licencia, sobre el efecto real de la cuantizacion y sobre el rendimiento medido, porque no hay benchmarks numericos publicados para este artefacto concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con capacidades vision-lenguaje y MTP (multi-token prediction); etiquetada como `qwen4_exp`, es decir, experimental |
| Parametros totales | 179.999.981.459 (aproximadamente 180.000 millones) segun metadatos de safetensors del repositorio |
| Parametros activos | no disponible para este artefacto; fuentes de terceros sobre la familia base indican 6.000 millones activos |
| Longitud de contexto | 262.144 tokens en la familia base segun fuentes de terceros; hasta 65.536 tokens de salida |
| Tipos de cuantizacion | Precision mixta affine de 4 bits con tabla PLE en FP8 (`plefp8`); existen otras cuantizaciones del modelo base en GGUF (IQ4XS, NGQ4, imatrix) y EXL3 |
| Idiomas soportados | no disponibles en la ficha de este artefacto; las tarjetas GGUF de la familia base indican ingles y chino |
| Licencia | El campo declara apache-2.0, pero el fichero LICENSE del repositorio fuente contiene Qwen Community License 1.0 con terminos comerciales adicionales |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento
La arquitectura es un transformer de mezcla de expertos (MoE) con soporte de vision-lenguaje (pipeline `image-text-to-text`), prediccion multi-token y la etiqueta experimental `qwen4_exp`. El detalle de la composicion interna de expertos, el numero de capas, la dimension oculta y el mecanismo de enrutamiento no se detallan en la informacion disponible. Tampoco hay datos publicados sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; lo unico documentado es que la familia base ha sido sometida a un proceso de abliteration que elimina la direccion de rechazo, y que conserva los modos de razonamiento (esfuerzo bajo, medio y xhigh) y el tool calling del modelo original.

La modificacion concreta de este artefacto es la cuantizacion y el trasplante de una tabla PLE en FP8. PLE hace referencia a embeddings por capa, un componente que en arquitecturas recientes se mantiene en mayor precision porque su cuantizacion degrada la calidad de forma desproporcionada. El autor ha sustituido la tabla original por una version menos lossy procedente de otro artefacto, y afirma que el modelo pasa los benchmarks de inteligencia con resultados efectivamente iguales a los del modelo cuantizado original y que es subjetivamente coherente. No se aportan cifras que respalden esa afirmacion, y el propio autor declara que el efecto de la tabla es desconocido.

## Capacidades
- Generacion de texto conversacional multi-turno, con la longitud de contexto heredada de la familia base (262.144 tokens segun fuentes de terceros).
- Razonamiento con niveles de esfuerzo configurables: bajo, medio y xhigh, segun la descripcion de la familia base.
- Tool calling y function calling, segun la tarjeta de la familia base recogida en los resultados de busqueda.
- Razonamiento multi-paso orientado a agentes, apoyado en los modos de razonamiento y en el tool calling.
- Entrada de imagenes ademas de texto (pipeline `image-text-to-text`, tag `vision-language`). No se especifica si la salida es solo texto o tambien multimodal.
- Generacion sin censura: el modelo base ha sido sometido a abliteration, por lo que la direccion de rechazo esta eliminada.
- Capacidades multilingues: no confirmadas para este artefacto; la familia base se distribuye con etiquetas de ingles y chino.
- Prediction multi-token (MTP), util para acelerar la decodificacion mediante decodificacion especulativa.

## Casos de uso
- Ejecucion local en estaciones de trabajo Apple Silicon: es el caso de uso principal y practicamente el unico soportado sin conversion, ya que los pesos estan en formato MLX y el repositorio apunta a chips M5 y a la ruta NAX. Se usaria para disponer de un modelo de gran tamano sin enviar datos a terceros.
- Red teaming e investigacion de seguridad: al tratarse de una variante abliterated, sirve para estudiar comportamiento sin alineamiento de seguridad, generar trazas adversarias y evaluar la eficacia de clasificadores de contenido en pipelines propios.
- Prototipado de asistentes con entrada de imagen: el pipeline `image-text-to-text` permite construir demos de descripcion de imagenes, extraccion de informacion de capturas o interfaces conversacionales sobre documentos visuales.
- Agentes con tool calling en local: el modelo conserva el soporte de llamadas a funciones, lo que permite conectarlo a herramientas internas (consultas a bases de datos, APIs corporativas) manteniendo los datos dentro de la maquina.
- Analisis de documentos largos: con el contexto de la familia base (262.144 tokens), es adecuado para resumir o extraer informacion de expedientes, normativa o codigo extenso en una sola pasada.
- Generacion y revision de codigo asistida: el modelo base declara capacidades de razonamiento y tool calling, lo que permite integrarlo en flujos de revision de parches o de generacion de pruebas dentro de un entorno de desarrollo local.
- Investigacion sobre cuantizacion: el artefacto es en si mismo un caso de estudio sobre el impacto de mantener la tabla PLE en FP8 frente a cuantizarla junto con el resto de pesos, y sobre la precision mixta affine en MLX.
- Evaluacion comparativa de tecnicas de abliteration: permite contrastar el comportamiento del modelo sin censura frente a sus equivalentes cuantizados en GGUF o EXL3.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

El autor afirma que el modelo "pasa los benchmarks de inteligencia con resultados efectivamente iguales a los del modelo cuantizado original", pero no adjunta tabla, cifras ni metodologia. Las fuentes de terceros consultadas tampoco publican resultados numericos (MMLU, HumanEval, GSM8K ni similares) para esta variante.

## Requisitos de hardware
- El repositorio ocupa 130 GB, de los cuales la practica totalidad corresponde a pesos y tabla PLE. Se necesita memoria unificada suficiente para alojarlos completos: en la practica, un Mac con 192 GB, 256 GB o 512 GB de memoria unificada.
- No cabe en GPUs de consumo con memoria dedicada, ni en configuraciones de 24 GB o 48 GB, porque el formato MLX no esta pensado para VRAM discreta y el tamano del artefacto lo impide.
- Plataforma objetivo: Apple Silicon con MLX. Los tags mencionan explicitamente M5 y NAX, por lo que el rendimiento optimo probablemente requiere generaciones recientes.
- Para GPUs NVIDIA, la alternativa documentada es la recuantizacion EXL3 del modelo base, servible en un DGX Spark (GB10, aarch64) con 128 GB de memoria unificada mediante docker compose y API compatible con OpenAI, con decodificacion especulativa activada.
- Opciones de despliegue alternativas sobre el modelo base: llama.cpp y Ollama a traves de las cuantizaciones GGUF (orcarouter, cygnal), y vLLM o TGI si se dispone de pesos sin cuantizar, aunque esto no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token para este artefacto.
- La prediction multi-token del modelo permite plantear decodificacion especulativa, lo que en teoria aumenta el throughput, pero no hay cifras que cuantifiquen la mejora.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zviratko/Qwen3.8-Flash-Next-Uncensored-plefp8 | 180.000 millones (metadatos) | no disponible para este artefacto; 262.144 tokens en la familia base | MLX safetensors, precision mixta 4 bits, PLE en FP8 | apache-2.0 declarada, Qwen Community License 1.0 en el LICENSE fuente | Hugging Face, 0 descargas, 0 likes |
| ddark-il/Qwen3.8-Flash-Next-Uncensored (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| cygnal/Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF | mismo modelo base | heredado de la familia base | GGUF (IQ4XS, NGQ4) | no disponible en la informacion recogida | Hugging Face |
| orcarouter/Qwen3.8-Flash-Next-Uncensored-GGUF | mismo modelo base | heredado de la familia base | GGUF con mmproj | apache-2.0 | Hugging Face, 284 likes |
| Recuantizacion EXL3 para DGX Spark (jayleaton) | mismo modelo base | heredado de la familia base | EXL3 | no disponible | GitHub, imagen Docker |

Fuentes de terceros describen la familia base como un MoE de 125.000 millones de parametros totales y 6.000 millones activos, mientras que los metadatos de safetensors de este repositorio declaran 179.999.981.459 parametros. La discrepancia no queda resuelta con la informacion disponible y deberia verificarse antes de dimensionar hardware.

## Limitaciones y advertencias
- Incongruencia de licencia: el campo del repositorio declara apache-2.0, pero el fichero LICENSE del repositorio fuente contiene Qwen Community License 1.0, con terminos comerciales adicionales. Hay que revisar la licencia incluida antes de usar o redistribuir el artefacto.
- Modelo sin alineamiento de seguridad: la abliteration elimina la direccion de rechazo del modelo base. No es adecuado para aplicaciones orientadas al publico sin una capa de moderacion propia, y su uso conlleva riesgo de generar contenido danino, ilegal o sesgado.
- El trasplante de la tabla PLE en FP8 es experimental y su efecto es declarado desconocido por el propio autor. La afirmacion de equivalencia con el modelo cuantizado original no esta respaldada por datos publicados.
- Al ser una cuantizacion de 4 bits, cabe esperar degradacion en tareas sensibles a la precision numerica (matematicas de varios pasos, codigo con detalles sintacticos finos), aunque no hay mediciones que lo cuantifiquen.
- Riesgo de alucinacion inherente a los modelos de lenguaje. No hay datos especificos de tasa de alucinacion para esta variante, y la ausencia de alineamiento de seguridad no reduce ese riesgo.
- Idiomas soportados no confirmados para este artefacto. La ficha no los declara y la evidencia indirecta apunta a ingles y chino, sin garantia de cobertura solida del castellano.
- Longitud de contexto no verificada en este artefacto: el dato de 262.144 tokens procede de descripciones de la familia base, no de la ficha del repositorio.
- Compatibilidad limitada: el formato MLX restringe su uso a Apple Silicon. No se puede desplegar directamente en servidores con GPU NVIDIA o AMD.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha, actualizacion posterior a la creacion en menos de dos minutos y ninguna evaluacion independiente disponible.
- Requisitos de memoria muy elevados (130 GB de repositorio), lo que excluye la mayoria de equipos de desarrollo individuales.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/zviratko/Qwen3.8-Flash-Next-Uncensored-plefp8
- Modelo base: https://huggingface.co/ddark-il/Qwen3.8-Flash-Next-Uncensored
- Cuantizacion GGUF de cygnal (IQ4XS, NGQ4): https://huggingface.co/cygnal/Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF
- Cuantizacion GGUF de orcarouter: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored-GGUF
- Recuantizacion EXL3 para DGX Spark: https://github.com/jayleaton/qwen38-flash-next-exl3-spark
- Ficha de la familia en Experiential Labs: https://platform.experientiallabs.ai/models/qwen3.8-flash-next-uncensored
- Descarga GGUF comentada en Local AI Zone: https://local-ai-zone.github.io/models/qwen3-8-flash-next-uncensored.html
