# Vishva007/clef-flash-W4A16-AutoRound

# Clef-flash-W4A16-AutoRound: ficha tecnica del modelo

## Resumen

Clef-flash-W4A16-AutoRound es una version cuantizada a 4 bits (W4A16, pesos de 4 bits y activaciones de 16 bits) del modelo multimodal Cloudflare/clef-flash, publicada por el usuario Vishva007 mediante Intel AutoRound. El modelo base es un "modelo de decision" multimodal de la familia Qwen3.5, post-entrenado para evaluar esquemas estructurados (texto, JSON, imagen y video) y devolver distribuciones de probabilidad calibradas sobre preguntas tipadas en un unico forward pass, sin generacion autoregresiva de tokens.

El interes practico de esta release es doble. Por un lado, reduce el peso del checkpoint a un repositorio de 9,2 GB con cuantizacion simetrica de grupo 32, manteniendo en BF16 nativo la torre de vision, la cabeza de esquema conjunto (`joint_head.safetensors`) y las convoluciones lineales de las capas de atencion lineal de Qwen3.5, para evitar degradacion en OCR/vision y deriva en dichas capas. Por otro, el autor publica variantes para distintos motores de inferencia (AutoRound/AutoGPTQ nativo, AutoGPTQ estandar para ExLlama y Compressed-Tensors para vLLM/SGLang), lo que facilita el despliegue en entornos heterogeneos.

La relevancia de este tipo de modelo esta en su naturaleza no generativa: en lugar de producir texto libre token a token, resuelve tareas de clasificacion y puntuacion sobre preguntas declaradas en un esquema, lo que encaja con triaje de incidencias, verificacion documental y enrutado de decisiones auditables. No obstante, la ficha no aporta benchmarks cuantitativos, no documenta idiomas soportados y presenta una discrepancia entre el recuento de parametros de los metadatos de safetensors (2.491.309.296, aproximadamente 2,49 B) y la cifra de 9B que menciona la model card para el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5, con torre de vision, capas de atencion lineal (convoluciones lineales preservadas en BF16) y cabeza de esquema conjunto (`joint_head`). Inferencia de decision en un unico forward pass, sin decodificacion autoregresiva |
| Parametros totales | 2.491.309.296 parametros segun metadatos de safetensors del repositorio (aproximadamente 2,49 B). La model card describe el modelo base como de 9B; la discrepancia no se explica en la informacion disponible |
| Parametros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16: pesos de 4 bits, activaciones de 16 bits. Metodo Intel AutoRound, simetrico (`sym=True`), `group_size=32`. Torre de vision, `joint_head.safetensors` y convoluciones lineales conservados en BF16 |
| Idiomas soportados | No disponible (no se especifica en la model card) |
| Licencia | Apache 2.0 |
| Formato de archivos | Safetensors. Variantes publicadas: AutoRound/AutoGPTQ nativo (Transformers), AutoGPTQ estandar (Transformers/ExLlama/AutoGPTQ) y Compressed-Tensors (vLLM/SGLang). Requiere codigo propio (`joint_schema_model.py`) |
| Fecha de publicacion en HuggingFace | 2026-10-03 (creacion), 2026-10-03 (ultima actualizacion) |
| Tamano del repositorio | 9,2 GB |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El modelo parte de Cloudflare/clef-flash, descrito en la model card como un modelo multimodal de decision de 9B post-entrenado a partir de Qwen3.5. La arquitectura combina una torre de vision con un decodificador tipo transformer que incorpora capas de atencion lineal (referidas en la ficha como "linear convolutions"), una caracteristica de la familia Qwen3.5. La innovacion principal es la cabeza de esquema conjunto (`joint_head.safetensors`), que recibe un estado (texto o JSON) y, opcionalmente, imagenes, junto con un diccionario de preguntas tipadas (`choice`, `score`, `noul`), y devuelve una distribucion de probabilidad calibrada por pregunta en un unico paso hacia delante, sin generar tokens de forma autoregresiva. La ficha menciona tambien evaluacion de esquemas de video, aunque no se aportan detalles de implementacion.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el post-entrenamiento. Respecto a la cuantizacion, se aplico Intel AutoRound en modo simetrico con `group_size=32` sobre los pesos lineales, dejando en BF16 nativo la torre de vision, la cabeza de esquema y las convoluciones lineales. El autor afirma que no se observo perdida de precision ("zero loss") en las suites de prueba de texto, estado JSON y multimodal frente al checkpoint base, pero no se publican las metricas que respaldan esa afirmacion.

## Capacidades

- Evaluacion de esquemas estructurados: acepta un estado en texto o JSON y un conjunto de preguntas tipadas, y devuelve respuestas con distribucion de probabilidad calibrada.
- Tipos de pregunta documentados: `choice` (eleccion entre criterios definidos), `score` (puntuacion sobre una escala) y `noul` (pregunta binaria/booleana segun los ejemplos de la ficha).
- Entrada multimodal de imagen: procesa imagenes junto al estado textual mediante el procesador, segun el ejemplo de verificacion de facturas de la model card.
- Entrada de video: la descripcion del modelo base menciona esquemas de video, aunque no se aporta ejemplo de uso ni detalles tecnicos.
- Clasificacion y decision: orientado a tareas de clasificacion, enrutado y evaluacion de criterios, con la etiqueta `classification` en los metadatos.
- Salida sin generacion autoregresiva: la respuesta se computa en un unico forward pass, lo que elimina el bucle de decodificacion token a token.
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no se especifican idiomas en la ficha).
- Capacidades especiales: no se documenta modo "thinking", audio ni otras modalidades adicionales.

## Casos de uso

- Triaje de incidencias en produccion: se introduce el estado de la incidencia como texto o JSON (por ejemplo, latencia de base de datos a 4.000 ms y errores 504 en el checkout) y se declaran preguntas tipadas de severidad, urgencia y conveniencia de rollback. El modelo devuelve una distribucion calibrada por pregunta, lo que permite fijar umbrales auditables en la herramienta de guardia en lugar de depender de texto libre generado.
- Verificacion documental y OCR asistido: con una imagen de factura o albaran y preguntas binarias del tipo "el texto es legible" o "el importe supera 1.000 USD", el modelo responde en un unico paso. Al conservarse la torre de vision en BF16, no deberia haber degradacion del reconocimiento visual respecto al checkpoint original.
- Moderacion y clasificacion de contenido: definiendo criterios de `choice` con etiquetas mutuamente excluyentes, el modelo puede actuar como clasificador de politicas sobre texto o imagenes, devolviendo probabilidades que permiten aplicar zonas de confianza y derivar casos dudosos a revision humana.
- Enrutado de tickets de soporte: sobre el estado de un ticket, preguntas de tipo `choice` (categoria, prioridad) y `score` (criticidad) permiten asignar colas y niveles de servicio de forma determinista a partir del umbral elegido sobre la probabilidad devuelta.
- Extraccion de decisiones sobre datos estructurados: integrado en pipelines de datos, puede evaluar registros JSON y responder a criterios de validacion, con la ventaja de que la salida es una distribucion por pregunta y no una cadena de texto que haya que parsear.
- Gating en pipelines automatizados: dado que la inferencia es un unico forward pass sin decodificacion autoregresiva, encaja como paso de decision de baja latencia previo a acciones automatizadas (despliegue, escalado, bloqueo), siempre que se calibre el umbral de probabilidad con datos propios.
- Precribado multimodal en revision de imagenes: evaluacion previa de capturas, recibos o documentacion escaneada antes de pasarlos a un revisor humano, usando preguntas binarias o escalas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma que no se observo perdida de precision ("zero loss") en las suites de prueba de texto, estado JSON y multimodal respecto al checkpoint base, sin cuantificar dichas pruebas ni indicar el conjunto de evaluacion empleado. No se dispone de valores de MMLU, HumanEval, GSM8K ni de metricas de calibracion (por ejemplo, Brier score o ECE) para este modelo.

## Requisitos de hardware

- Tamano en disco: el repositorio completo ocupa 9,2 GB. La cuantizacion W4A16 reduce el peso de los pesos lineales a 4 bits, mientras que la torre de vision, la cabeza de esquema y las convoluciones lineales se mantienen en BF16.
- VRAM estimada: no especificada por el autor. Como estimacion no confirmada, habria que sumar al peso de los parametros cuantizados el coste de la torre de vision y la cabeza en BF16, mas las activaciones de 16 bits y las estructuras de cache propias del procesador. Un margen practico de 12 a 16 GB de VRAM resulta plausible, pero debe validarse en el entorno objetivo.
- GPU de consumo: probablemente viable en tarjetas de 16 GB o mas (RTX 4080, RTX 4090, RTX A4000 de 16 GB) y con margen en tarjetas de 24 GB (RTX 3090, RTX 4090). No hay confirmacion del autor.
- GPU de centro de datos: no se requiere A100 o H100 para la inferencia de una sola peticion dado el tamano cuantizado; estas GPU aportan ventaja en despliegues con batching y alta concurrencia.
- Opciones de despliegue: Transformers con codigo propio (`joint_schema_model.py`, funciones `load_release_model` y `systemone`), apuntando a la variante AutoRound/AutoGPTQ nativa; ExLlama o AutoGPTQ con la variante AutoGPTQ estandar; vLLM o SGLang con la variante Compressed-Tensors. La carga requiere descargar el repositorio y anadir su ruta a `sys.path` para importar el modulo de codigo propio.
- Ollama, llama.cpp y TGI: no documentados en la informacion disponible. Dado el uso de codigo propio y de la cabeza de esquema conjunto, la compatibilidad con estos runners no esta garantizada.
- Latencia y throughput: no disponibles. Cabe esperar una latencia muy inferior a la de un modelo generativo equivalente, porque la respuesta se obtiene en un unico forward pass en lugar de decodificar token a token, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vishva007/clef-flash-W4A16-AutoRound | 2.491.309.296 segun safetensors (la ficha del base indica 9B) | No disponible | W4A16 (AutoRound, sym, group_size=32); vision y cabeza en BF16 | Apache 2.0 | HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| Cloudflare/clef-flash (modelo base) | Descrito como 9B en la model card | No disponible | BF16 sin cuantizar | Apache 2.0 (declarada en la ficha de esta release) | HuggingFace |
| Alternativas cuantizadas de modelos de decision multimodal | No disponible | No disponible | No disponible | No disponible | No se han identificado modelos comparables en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan comparar esta release con alternativas de la misma categoria, ni de otros modelos de decision multimodal de esquema tipado con los que establecer una comparacion objetiva.

## Limitaciones y advertencias

- Modelo de decision, no de generacion: no produce texto libre y no esta pensado para conversacion abierta. Usarlo fuera del esquema de preguntas tipadas (`choice`, `score`, `noul`) puede dar resultados no definidos.
- Discrepancia en el recuento de parametros: los metadatos de safetensors indican 2.491.309.296 parametros, mientras que la model card describe el modelo base como de 9B. La ficha no explica la diferencia (podria deberse a pesos empaquetados, pesos atados o componentes almacenados aparte), por lo que el dimensionamiento de hardware debe tratarse con cautela.
- Ausencia de benchmarks: no hay resultados cuantitativos publicados. La afirmacion de "zero loss" frente al checkpoint base es del autor y no se ha reproducido de forma independiente ni se acompana de metricas.
- Calibracion no verificada: el modelo declara devolver probabilidades calibradas, pero no se aportan estudios de calibracion (ECE, Brier) ni conjuntos de evaluacion.
- Sesgos: no disponible. No se documentan evaluaciones de sesgo, toxicidad ni comportamiento por subgrupos.
- Riesgo de alucinacion: no cuantificado. En tareas de clasificacion visual o documental, el riesgo se traduce en respuestas erroneas con alta confianza, por lo que se recomienda umbral sobre la probabilidad y revision humana en la zona dudosa.
- Idiomas: no disponibles. El modelo base procede de Qwen3.5, pero la ficha no enumera idiomas soportados ni garantiza el rendimiento en castellano.
- Longitud de contexto: no disponible. No se puede planificar el troceado de documentos o imagenes de gran tamano.
- Codigo propio en la carga (`custom-code`): la inferencia requiere descargar el repositorio y ejecutar `joint_schema_model.py`. Esto implica ejecutar codigo no auditado desde HuggingFace y anadir su ruta a `sys.path`; conviene revisar el codigo antes de usarlo en produccion.
- Compatibilidad de motores: solo se documentan Transformers, AutoGPTQ/ExLlama y vLLM/SGLang mediante variante Compressed-Tensors. No hay soporte confirmado en llama.cpp, Ollama ni TGI.
- Cuantizacion W4A16: las activaciones se mantienen en 16 bits, de modo que no se obtiene la reduccion de memoria y computo que aportaria una cuantizacion tambien de activaciones.
- Validacion de la comunidad nula: el repositorio presenta 0 descargas y 0 likes, sin evidencia de uso en produccion por terceros.
- Licencia: Apache 2.0 para esta release. Al derivar de Cloudflare/clef-flash, conviene verificar las condiciones de la licencia del modelo base y de los pesos de Qwen3.5 subyacentes antes de un uso comercial.
- Fechas de publicacion en los metadatos (2026-10-03) y etiquetas como `qwen3.8` no se corresponden con la descripcion tecnica de la model card (Qwen3.5) y no estan explicadas.

## Enlaces

- HuggingFace (esta release): https://huggingface.co/Vishva007/clef-flash-W4A16-AutoRound
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Intel AutoRound (herramienta de cuantizacion): https://github.com/intel/auto-round
- Variante AutoGPTQ estandar: https://huggingface.co/Vishva007/clef-flash-W4A16-AutoRound-GPTQ (referenciada en la model card)
- Variante Compressed-Tensors para vLLM/SGLang: https://huggingface.co/Vishva007/clef-flash-W4A16-AutoRound-LLM-Compressor (referenciada en la model card)
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes (papers, blogs, repos o demos) en la busqueda realizada; los resultados obtenidos no guardan relacion con el modelo.
