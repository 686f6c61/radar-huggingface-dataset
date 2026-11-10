# sudo/Devstral-Small-2-24B-Instruct-2512

## Resumen

Devstral-Small-2-24B-Instruct-2512 es un modelo de lenguaje publicado en Hugging Face bajo el identificador `sudo/Devstral-Small-2-24B-Instruct-2512`. Por el nombre se infiere que se trata de una variante de la familia Devstral (orientada a tareas de ingeniería de software y uso de agentes) en su version "Small", con aproximadamente 24 mil millones de parametros y un ajuste de instrucciones correspondiente a la iteracion de diciembre de 2025 (sufijo 2512). El repositorio esta etiquetado con la arquitectura `mistral3` y con pesos en formato `fp8`, lo que sugiere una distribucion cuantizada a 8 bits en coma flotante.

La informacion disponible es muy limitada: la model card publicada no contiene mas que la declaracion de licencia Apache 2.0, sin descripcion tecnica, datos de entrenamiento, benchmarks ni instrucciones de uso. El tamano del repositorio (19,8 GB) es coherente con un modelo de ~24B parametros almacenado en fp8, aunque no se especifica si incluye tokenizador, configuracion y ficheros auxiliares.

Su relevancia potencial radica en la combinacion de una licencia permisiva (Apache 2.0) con un tamano que permite despliegue en hardware de gama alta para consumo, y en su orientacion declarada por el nombre hacia tareas de codigo y agentes. No obstante, al carecer de documentacion verificable, cualquier evaluacion debe tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mistral3 (segun tag del repositorio) |
| Parametros totales | ~24B (inferido del nombre; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (unico formato publicado en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | fp8 (safetensors presumiblemente; no confirmado) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de la etiqueta `mistral3` asociada al repositorio, que apunta a la familia de transformers de Mistral AI. No se detalla si emplea atencion con ventana deslizante, atencion lineal, mezcla de expertos (MoE) ni ninguna otra innovacion. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

La unica informacion tecnica concreta es el formato de publicacion en fp8, lo que reduce el peso del modelo a aproximadamente 19,8 GB en disco. No se documenta si existe una version en BF16/FP16, ni si el proceso de cuantizacion a fp8 fue realizado por el autor original del modelo o por el publicador del repositorio (`sudo`).

## Capacidades

- Generacion de texto: capacidad basica esperada en cualquier modelo de la familia, aunque no documentada.
- Generacion de codigo: inferida por el nombre "Devstral", orientado a tareas de desarrollo de software.
- Razonamiento multi-paso y uso de agentes: plausible por la nomenclatura "Instruct" y la linea Devstral, pero no confirmado.
- Tool calling / function calling: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking): no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Asistencia en desarrollo de software: un modelo de ~24B orientado a codigo puede emplearse como copiloto en IDE para autocompletado, generacion de tests y refactorizacion, siempre que se valide su rendimiento real con evaluaciones propias.
- Revision de codigo automatizada: integracion en pipelines de CI para detectar patrones problematicos, aunque la ausencia de benchmarks obliga a medir la tasa de falsos positivos antes de adoptarlo.
- Generacion de documentacion tecnica: a partir de codigo fuente y comentarios, produciendo borradores de README, docstrings o guias de API.
- Chat de soporte tecnico especializado: conversaciones multi-turno sobre errores de compilacion, configuracion de entornos o depuracion, sujeto a la longitud de contexto real (no documentada).
- Prototipado de agentes autonomos: por su nombre y licencia permisiva, puede servir para experimentar con flujos de tool calling en entornos de investigacion, verificando previamente que el tokenizador y la plantilla de chat esten correctamente definidos.
- Despliegue on-premise con requisitos de licencia laxa: la licencia Apache 2.0 facilita su uso comercial interno sin obligaciones de atribucion mas alla de las habituales, una vez validada la calidad del modelo.
- Fine-tuning sobre dominios verticales: el formato fp8 complica el ajuste directo; seria necesario de-cuantizar o partir de una version en BF16, que no esta disponible en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp8: en torno a 20-24 GB solo para los pesos, mas overhead de KV cache y activaciones (tipicamente 2-6 GB adicionales segun contexto y batch).
- GPU recomendadas: A100 40GB, H100 80GB, L40S 48GB para despliegue comodo con contexto largo; RTX 6000 Ada (48GB) como alternativa de workstation.
- GPU de consumo: una RTX 4090 (24GB) podria cargar los pesos fp8 al limite, con contexto reducido y riesgo de OOM; no se garantiza su funcionamiento sin cuantizacion adicional a 4 bits.
- Opciones de despliegue: vLLM y TGI soportan fp8 en hardware Ada/Hopper; llama.cpp y Ollama requeririan convertir los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Devstral-Small-2-24B-Instruct-2512 | ~24B (inferido) | no disponible | Apache 2.0 | Solo fp8 en este repo |
| Mistral Small 3 (referencia de familia) | 24B | 32k (segun documentacion publica de Mistral) | Apache 2.0 | BF16 y cuantizaciones |
| Qwen2.5-Coder-32B-Instruct | 32B | 128k (segun documentacion publica) | Apache 2.0 | Multiples formatos |

La comparacion con Mistral Small 3 y Qwen2.5-Coder se ofrece solo como referencia de categoria; no se dispone de datos que permitan afirmar equivalencia o superioridad de rendimiento del modelo descrito.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre datos de entrenamiento, sesgos, idiomas ni limites de contexto, lo que impide una evaluacion rigurosa.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks ni evaluaciones publicadas no puede acotarse su magnitud.
- Repositorio sin descargas ni likes: no hay evidencia de comunidad que haya validado los pesos; conviene verificar integridad y procedencia antes de usarlo en produccion.
- Formato unico fp8: dificulta el fine-tuning y limita la compatibilidad con herramientas que esperan BF16/FP16 o GGUF.
- El autor del repositorio (`sudo`) no coincide necesariamente con el desarrollador original del modelo; la relacion con la familia Devstral de Mistral AI no esta confirmada en la documentacion disponible.
- Licencia Apache 2.0 declarada, pero sin fichero de terminos adicionales ni declaracion de procedencia de los pesos base; conviene revisar la licencia del modelo original si se confirma su origen.
- Idiomas soportados no documentados: no puede asumirse un rendimiento adecuado en castellano sin pruebas propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sudo/Devstral-Small-2-24B-Instruct-2512
- No se han encontrado en la busqueda web enlaces relevantes al modelo (papers, blogs, repos o demos). Los resultados obtenidos corresponden a la utilidad `sudo` de Linux y no guardan relacion con el modelo.
