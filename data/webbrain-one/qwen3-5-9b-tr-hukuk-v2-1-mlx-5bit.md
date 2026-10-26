# webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-MLX-5bit

## Resumen

El modelo `webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-MLX-5bit` es un ajuste fino en turco especializado en derecho («hukuk») construido sobre `Qwen/Qwen3.5-9B` y distribuido en formato MLX cuantizado a 5 bits para su ejecución en Apple Silicon. Lo publica el usuario webbrain-one como el modelo juridico por defecto de su aplicacion de escritorio PekBilen, de modo que no se trata de un lanzamiento generalista sino de un artefacto de produccion ligado a un producto concreto.

El modelo es exclusivamente de texto (sin capa de vision) y su pipeline de entrenamiento consta de dos fases: un LoRA v2 (rango 32, alfa 64) entrenado sobre 6.013 ejemplos generados en el formato de prompt propio de la aplicacion, y un posterior ajuste DPO v2.1 sobre 202 pares de preferencia orientado especificamente a penalizar respuestas con referencias judiciales no presentes en las fuentes proporcionadas. Esa segunda fase es la innovacion mas relevante del artefacto: el rechazado de cada par DPO es una respuesta del propio modelo v2 que no superaba los auditores de citacion y tarea de la aplicacion.

Con 8.953.801.728 parametros totales y un peso de 6,16 GB en dos shards de safetensors, el interes practico esta en su evaluacion comparativa frente a la cuantizacion GGUF IQ4_XS y frente al paquete MLX de 4 bits, que el autor documenta con pruebas de significacion estadistica. La licencia es privativa (`proprietary-private`), lo que condiciona por completo su reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `model_type: qwen3_5_text` (derivado de Qwen 3.5); detalles de atencion y capas no disponibles |
| Parametros totales | 8.953.801.728 (8,95 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no declarada en la model card ni en la informacion proporcionada) |
| Tipos de cuantizacion | 5 bits affine con grupo de 64 (MLX, `mlx-lm 0.32.2`); existe un paquete hermano de 4 bits de 5,06 GB |
| Idiomas soportados | turco (`tr`) unicamente, segun el campo `language` |
| Licencia | `other` / `proprietary-private` (propiedad privada, distribucion no autorizada prohibida) |
| Formato de pesos | safetensors en formato MLX (2 shards: `model-00001-of-00002`, `model-00002-of-00002`), 6,16 GB; existe version GGUF del mismo modelo |

Otros datos de configuracion: tokens de parada `<|im_end|>` y `<|endoftext|>`; tokenizer, `tokenizer_config` y `chat_template.jinja` heredados sin cambios de `Qwen/Qwen3.5-9B`; el modo de razonamiento se controla con `enable_thinking=True|False`.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3.5-9B`: un transformer denso de 8,95 B de parametros identificado en `config.json` como `qwen3_5_text`. La model card no documenta numero de capas, dimensiones ocultas, mecanismo de atencion ni ventana de contexto, por lo que esos datos deben consultarse en la ficha del modelo base. El ajuste es puramente textual: no se ha incorporado ninguna capa de vision.

El entrenamiento se realizo en dos etapas encadenadas sobre el base en bf16. La primera, v2, es un LoRA con rango 32 y alfa 64 entrenado con 6.013 ejemplos generados en el formato de prompt de la aplicacion (documentos como fuente en el propio prompt, reglas de la aplicacion, esqueletos de demandas y pasos de plantilla); cada respuesta objetivo fue filtrada por los auditores de citacion y de tarea del producto antes de entrar en el conjunto. La segunda, v2.1, aplica DPO sobre 202 pares de preferencia: el ejemplo rechazado es una respuesta del propio v2 que fallo la auditoria en encargos nuevos (mayoritariamente por citar sentencias inexistentes en la fuente) y el elegido es la respuesta que si paso el mismo filtro para el mismo prompt. Los pesos finales se obtuvieron fusionando ambas LoRA en bf16 de forma secuencial y despues cuantizando a 5 bits con `mlx-lm 0.32.2`.

## Capacidades

- Generacion de texto juridico en turco: explicacion de institutos legales, respuesta a preguntas de legislacion y redaccion de documentos.
- Redaccion de escritos y demandas (`dilekce`) siguiendo esqueletos y plantillas definidos en el prompt.
- Trabajo con documentos aportados como fuente: el formato de instruccion de la aplicacion incorpora los documentos en el propio prompt y el modelo esta entrenado para citar solo lo que aparece en ellos.
- Cumplimiento de reglas de tarea y de citacion: el entrenamiento filtro las respuestas objetivo con auditores automaticos de la aplicacion, y el DPO refuerza la abstencion de citas no respaldadas por la fuente.
- Modo de razonamiento (`thinking`) activable y desactivable mediante `enable_thinking`; el autor reporta mejores resultados con el modo activado (102/139 frente a 97/139 en la version GGUF v2.1).
- Conversacional multi-turno con plantilla de chat de Qwen 3.5.
- No soporta vision, audio ni generacion de imagenes.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; el campo `language` declara solo turco.

## Casos de uso

- Asistencia juridica en escritorio para el mercado turco: integrado en la aplicacion PekBilen sobre Mac con Apple Silicon, el modelo responde consultas de derecho turco (por ejemplo, los elementos de la regla de buena fe del articulo 2 del Codigo Civil turco, TMK m. 2) con el formato y las reglas del producto.
- Redaccion de demandas y escritos: el ajuste se entreno con esqueletos de `dilekce` y pasos de plantilla, de modo que puede producir borradores estructurados a partir de los hechos y documentos que el usuario introduzca en el prompt.
- Analisis de expedientes con citacion verificable: al recibir los documentos como fuente en el propio prompt y estar ajustado por DPO contra citas inventadas, es adecuado para tareas donde cada referencia a articulo o sentencia debe poder rastrearse al texto aportado.
- Respuesta a preguntas de legislacion: en la evaluacion del autor obtiene 38/40 en la prueba de pregunta-respuesta sobre mevzuat, lo que lo hace util como capa de consulta normativa en una herramienta interna.
- Preparacion de material para oposiciones y examenes juridicos: obtiene 47/97 en TRLawBench (conjunto de 97 preguntas de tipo OSYM), por lo que puede emplearse como generador de explicaciones y preguntas de practica, siempre con revision humana.
- Filtrado y revision de borradores generados por otros sistemas: el DPO convierte al modelo en un buen candidato para actuar como auditor de segundo nivel que marque citas no respaldadas por el expediente.
- Despliegue local con privacidad de datos: al ejecutarse con MLX en un Mac de 16 GB o mas, todo el procesamiento puede hacerse en el equipo del despacho sin enviar expedientes a la nube.

## Benchmarks y rendimiento

Evaluacion del autor con el motor MLX de la aplicacion (`mlx-lm 0.32.2`), 139 tareas de la aplicacion (20 de ellas resoluciones recientes no vistas en entrenamiento), modo de razonamiento desactivado y cada respuesta puntuada por los auditores de citacion y tarea del producto. La medicion se realizo en Linux con NVIDIA usando el backend CUDA de MLX, no en Apple Silicon/Metal; en ese backend la cache KV no se cuantiza y el backend CUDA de MLX fallaba ocasionalmente con 5 bits, por lo que solo se compararon las tareas que terminaron sin error.

| Metrica | GGUF IQ4_XS | MLX 4 bits | MLX 5 bits |
|---|---:|---:|---:|
| Tareas de la aplicacion (139) | 97 | 80 | no disponible |
| Mismas 125 tareas | 89 | 74 | 86 |
| Coincidencia con el token mas probable del modelo bf16 (sobre 4.454 tokens de respuestas GGUF) | no disponible | 95,4 % | 97,6 % |

Contraste estadistico reportado: el paquete de 4 bits queda por detras del GGUF de forma significativa (80 frente a 97 en 139 tareas, test de signos p = 0,006); el de 5 bits no se separa significativamente del GGUF (86 frente a 89 en 125 tareas, p = 0,65) y mejora al de 4 bits (86 frente a 74, p = 0,02).

Resultados GGUF por versiones (llama.cpp, IQ4_XS):

| Prueba | v1 | v2 | v2.1 |
|---|---:|---:|---:|
| Tareas de la aplicacion, razonamiento activado (por defecto) | 82/139 | 96-97 | 102 |
| Tareas de la aplicacion, razonamiento desactivado | 87/139 | 89-93 | 97 |
| Pregunta-respuesta sobre legislacion | 5/40 | 39 | 38 |
| TRLawBench (97 preguntas OSYM, sin razonamiento) | 44 | 46 | 47 |
| HukukBERT cloze (750 preguntas) | 47,7 % | 47,3 % | 47,7 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan 6,16 GB; con cache KV y overhead de runtime hay que prever un margen adicional. El autor recomienda equipos Apple Silicon con 16 GB o mas de memoria unificada.
- Cabe en GPU de consumo: si, en el ecosistema Apple (M1/M2/M3/M4 con 16 GB o mas). El paquete hermano de 4 bits (5,06 GB) reduce el requisito, a costa de una perdida de calidad medida y significativa.
- GPU recomendadas: no aplica para el formato MLX, que esta pensado para Apple Silicon. Para NVIDIA o CPU hay que usar la variante GGUF (`webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-GGUF`) con llama.cpp; el autor no publica requisitos para ese caso.
- Opciones de despliegue: `mlx-lm==0.32.2` es la unica via documentada. Importante: `mlx-lm` 0.32.x no reconoce el tipo `qwen3_5_text`, por lo que hay que cargar con `model_config={"model_type": "qwen3_5"}`. Alternativa: llama.cpp/Ollama con la version GGUF.
- Parametros de muestreo usados por la aplicacion: temperatura 0,3 y top-p 0,9.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Rendimiento en tareas de la app (139) |
|---|---|---|---|---|---|
| `webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-MLX-5bit` | 8,95 B | no disponible | MLX safetensors 5 bits, 6,16 GB | privativa | 86/125 tareas comparables; 97,6 % de coincidencia con bf16 |
| `webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-MLX-4bit` | 8,95 B | no disponible | MLX safetensors 4 bits, 5,06 GB | privativa | 74/125 (p = 0,02 frente al de 5 bits) |
| `webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-GGUF` (IQ4_XS) | 8,95 B | no disponible | GGUF 4 bits | privativa | 89/125; 102/139 con razonamiento activado |
| `Qwen/Qwen3.5-9B` (base) | 8,95 B | no disponible | safetensors bf16 y cuantizaciones | no disponible en la informacion proporcionada | no disponible (sin ajuste al formato ni al dominio juridico turco) |

No se dispone de datos para comparar con otros modelos legales en turco de tamano similar; esa comparacion no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es asesoramiento juridico: el propio autor advierte que las salidas no sustituyen una opinion legal y que los articulos, referencias de sentencias e importes deben verificarse en la fuente primaria.
- Riesgo de alucinacion en citas: aunque el DPO se diseno precisamente contra sentencias inexistentes, el fallo persiste como modo de error principal; el rechazado de los pares DPO era, en la mayoria de casos, una cita judicial no presente en la fuente.
- Solo turco: el campo `language` declara exclusivamente `tr`; no hay datos de rendimiento en otros idiomas y no debe asumirse transferencia.
- Sin capacidades multimodales: es un modelo solo de texto; no procesa imagenes de documentos escaneados.
- Licencia privativa (`proprietary-private`): prohibida la distribucion no autorizada y sin concesion explicita de uso comercial; cualquier uso en produccion requiere contacto con el autor.
- Dependencia de un runtime concreto: requiere `mlx-lm 0.32.2` y un workaround en la carga (`model_type: qwen3_5`); no es plug-and-play en otras librerias.
- Volumen de evaluacion limitado: 139 tareas y solo 20 resoluciones no vistas en entrenamiento; el conjunto de preferencias DPO es de 202 pares. Las conclusiones sobre robustez fuera de dominio son fragiles.
- Metodologia de evaluacion: las metricas se midieron en Linux con el backend CUDA de MLX con la cache KV sin cuantizar, no en Metal, por lo que el comportamiento en el hardware objetivo puede diferir.
- Datos ausentes que impiden planificar el despliegue: no hay ventana de contexto declarada, ni latencia, ni throughput, ni soporte documentado de tool calling.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o equidad para este ajuste.
- Rendimiento modesto en conocimiento juridico medido: 47/97 en TRLawBench y 47,7 % en HukukBERT cloze, lejos de lo que exigiria un uso autonomo sin supervision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-MLX-5bit
- Variante GGUF: https://huggingface.co/webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-GGUF
- Variante MLX 4 bits: https://huggingface.co/webbrain-one/qwen3.5-9b-tr-hukuk-v2.1-MLX-4bit
- Conjunto de datos de entrenamiento: https://huggingface.co/webbrain-one/hukuk-dataset-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B

Nota: la busqueda web realizada no devolvio resultados pertinentes al modelo (unicamente resultados no relacionados con contenido para adultos); no se han podido localizar papers, blogs ni demos adicionales.
