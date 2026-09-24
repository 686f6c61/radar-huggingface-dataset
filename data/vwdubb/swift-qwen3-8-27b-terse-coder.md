# vwdubb/Swift-Qwen3.8-27b-Terse-Coder

## Resumen

Swift-Qwen3.8-27b-Terse-Coder es un checkpoint fusionado publicado por el usuario vwdubb que combina los pesos de ukisai/Swift-Qwen3.8-27b (modelo base derivado de Qwen3.8-27B de Alibaba Cloud) con el adaptador LoRA Shockem/Qwen3.8-27b-Terse-Coder-LoRA (ronda 8, DPO de rango 16) ya integrado en los pesos. El objetivo es entregar en un unico checkpoint el razonamiento token-efficient del modelo Swift y las trazas de codigo concisas del adaptador Terse-Coder, sin necesidad de gestionar adaptadores LoRA en tiempo de ejecucion. El resultado es un modelo multimodal de tipo image-text-to-text con 27.781.427.952 parametros (unos 27,8 mil millones) y pesos en bf16 que ocupan 55,6 GB en el repositorio.

La relevancia de esta publicacion es fundamentalmente tecnica: documenta el uso de redondeo estocastico (unbiased) con semilla fija para preservar los deltas de un LoRA cuyos incrementos de peso (‖Δ‖/‖W‖ ≈ 4e-4–1e-3) quedan por debajo de la resolucion por elemento de bf16. Segun la model card, con redondeo bf16 convencional solo sobrevive entre el 31% y el 61% del delta, mientras que con redondeo estocastico la supervivencia sube al 94–99,9%, manteniendo el dtype y el tamano del checkpoint base.

Se trata ademas de un modelo orientado a codigo y razonamiento con modo thinking, cabecera MTP (multi-token prediction) intacta para decodificacion especulativa y una ventana de contexto declarada de 262.144 tokens en la configuracion de despliegue con vLLM. No tiene descargas ni likes registrados en el momento de la consulta y no se han publicado benchmarks independientes sobre este artefacto concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.8-27B; tag de arquitectura qwen3_5 en el repositorio. No se detalla si es denso o MoE |
| Parametros totales | 27.781.427.952 (27,8 mil millones, dato de safetensors) |
| Parametros activos | No disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | 262.144 tokens (valor usado en el ejemplo de servido con vLLM: `--max-model-len 262144`) |
| Tipos de cuantizacion | Pesos nativos en bf16; la model card menciona re-cuantizacion a NVFP4 como parte de las pruebas del adaptador. No se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | Swift Open License v1.0 (gated: true). El modelo base Qwen3.8-27B subyacente sigue bajo Apache 2.0 y el LoRA Terse-Coder es Apache 2.0 |
| Formato de pesos | safetensors, en bf16 |
| Tamano del repositorio | 55,6 GB |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | ukisai/Swift-Qwen3.8-27b (relacion: finetune) |
| Adaptador fusionado | Shockem/Qwen3.8-27b-Terse-Coder-LoRA (ronda 8, DPO rango 16) |
| Plantilla de chat | Shockem/froggeric-terse-coder |
| Fecha de creacion | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto no es un entrenamiento desde cero, sino una fusion de pesos. El procedimiento descrito consiste en calcular `W + B @ A * (lora_alpha / r)` en fp32, con `lora_alpha = 32` y `r = 16` (escala 2.0), y almacenar el resultado en bf16 aplicando redondeo estocastico con semilla fija (0) para que la operacion sea reproducible. La cabecera MTP y los pesos de vision no se tocan, porque el adaptador no los modifica, de modo que la decodificacion especulativa basada en MTP sigue disponible. El resto de ficheros (config, tokenizer, processor, indice) se copian del modelo base Swift.

La justificacion tecnica del redondeo estocastico es que los deltas del adaptador son deliberadamente pequenos, con una relacion ‖Δ‖/‖W‖ de aproximadamente 4e-4 a 1e-3, por debajo de la resolucion por elemento de bf16. Segun la model card, el adaptador mide una supervivencia del delta de solo el 31–61% con redondeo bf16 plano frente al 94–99,9% en fp16; el redondeo estocastico es insesgado, de modo que cada elemento se redondea hacia arriba o hacia abajo con una probabilidad ponderada para que su valor esperado coincida con el valor fusionado real. No se aportan datos sobre volumen de tokens de entrenamiento, composicion del dataset ni detalles del proceso DPO mas alla de la ronda 8 y el rango 16 del adaptador. El autor del adaptador recomienda el LoRA en tiempo de ejecucion como forma de despliegue a plena intensidad y midio un impuesto de capacidad tras la fusion (70% a 60–62% en su conjunto held-out-40 tras fp32-merge, fp16 y re-cuantizacion NVFP4).

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat especifica (Shockem/froggeric-terse-coder).
- Razonamiento con modo thinking habilitado y parametro `reasoning_effort` ajustable, que el autor indica subir cuando la tarea requiere derivaciones largas.
- Codigo: el adaptador fusionado es una edicion de comportamiento orientada a tareas de programacion, con trazas de razonamiento concisas y eficientes en tokens.
- Eficiencia de tokens: el modelo base Swift es, segun la model card, aproximadamente un 58% mas eficiente en tokens que el Qwen3.8-27B de serie; el efecto del adaptador Terse-Coder se acumula sobre esa base.
- Vision: el pipeline declarado es image-text-to-text y los pesos de vision se conservan intactos, por lo que el modelo mantiene capacidad de entrada de imagen y texto.
- Tool calling / function calling: soportado explicitamente mediante `--enable-auto-tool-choice` con `--tool-call-parser qwen3_coder` en vLLM.
- Decodificacion especulativa: la cabecera MTP esta incluida y sin modificar, con soporte de `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.
- Agentes y razonamiento multi-paso: el parser de razonamiento `qwen3` y el soporte de tool calling permiten integrarlo en bucles de agente, aunque no se documentan evaluaciones especificas de agentes.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistencia de programacion en el IDE: el modelo genera trazas de codigo concisas, lo que reduce el coste por completado en herramientas de autocompletado o chat integrado; su modo thinking permite alternar entre respuestas rapidas y derivaciones mas largas segun la complejidad.
- Refactorizacion y revision de codigo en pipelines de CI/CD: con tool calling habilitado se puede conectar a linters, ejecutores de tests y APIs de repositorio para proponer parches y validarlos en un bucle automatizado.
- Agentes de codigo multi-paso: la combinacion de parser de razonamiento qwen3, tool calling y contexto de 262.144 tokens permite mantener el estado de un repositorio completo dentro de la ventana y encadenar varias llamadas a herramientas sin perder trazabilidad.
- Procesamiento de documentacion tecnica con imagenes: al ser image-text-to-text, puede extraer informacion de diagramas de arquitectura, capturas de interfaces o diagramas de flujo junto al texto que los acompana, algo util en tareas de documentacion y soporte.
- Analisis de repositorios grandes: la ventana de contexto larga permite cargar varios ficheros o un arbol de proyecto extenso y responder preguntas cruzadas sobre dependencias, convenciones y posibles errores.
- Generacion de tests unitarios y datos de prueba: el modelo puede producir casos de prueba a partir de firmas de funciones y documentacion, con la ventaja de que su salida compacta abarata la generacion masiva en lote.
- Atencion tecnica interna de ingenieria: conversaciones multi-turno sobre incidencias con contexto largo (logs, trazas, ficheros de configuracion) sin truncar el historial, con el modelo emitiendo resumenes y pasos de diagnostico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks sobre este artefacto concreto. La model card indica explicitamente que no se han ejecutado benchmarks independientes sobre el checkpoint fusionado.

Como dato contextual, y atribuido exclusivamente a las mediciones del autor del adaptador (no a este artefacto), se reporta:

| Medicion | Valor | Contexto |
|---|---|---|
| Supervivencia del delta del LoRA | 31–61% | Redondeo bf16 plano, segun la model card del adaptador |
| Supervivencia del delta del LoRA | 94–99,9% | Redondeo fp16, segun la model card del adaptador |
| Rendimiento en held-out-40 | 70% | Referencia del adaptador antes de la fusion |
| Rendimiento en held-out-40 | 60–62% | Tras fp32-merge, fp16 y re-cuantizacion NVFP4 (impuesto de capacidad medido por el autor del adaptador) |
| Ahorro de tokens | ~58% mas eficiente | Modelo base Swift frente a Qwen3.8-27B de serie |

Comparativas con MMLU, HumanEval, GSM8K u otros benchmarks: no disponibles.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: los pesos suman 55,6 GB, por lo que se necesita un minimo de unos 64 GB de VRAM contando cache KV y overhead. Con contexto de 262.144 tokens la cache KV es muy grande y exige memoria adicional significativa o reduccion del contexto efectivo.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 28 GB de pesos; un solo acelerador de 40–48 GB resulta suficiente, con margen limitado para contexto largo.
- VRAM estimada en cuantizacion de 4 bits / NVFP4: aproximadamente 14–16 GB de pesos; encaja en GPUs de consumo alto.
- GPUs recomendadas: A100 80 GB o H100 80 GB para bf16 sin compromisos; configuraciones multi-GPU con tensor parallel (`--tensor-parallel-size`) para repartir los 55,6 GB en 2x A6000 48 GB o 2x RTX 4090 24 GB.
- Cabe en GPU de consumo: si, en RTX 4090 24 GB o RTX 5090 32 GB, pero solo con cuantizacion de 8 o 4 bits y reduciendo la longitud de contexto. En bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `AutoProcessor`; vLLM con `--dtype bfloat16`, `--max-model-len 262144`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder` y, opcionalmente, decodificacion especulativa MTP. No se documentan variantes GGUF, por lo que llama.cpp, Ollama y LM Studio no estan soportados por el momento.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Los datos de benchmarks de terceros no estan disponibles, de modo que la comparacion se limita a lo documentado en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27b-Terse-Coder (este) | 27,8 mil millones | 262.144 tokens | Swift Open License v1.0 | Gated en HuggingFace, 0 descargas | LoRA Terse-Coder fusionado en bf16 con redondeo estocastico; MTP y vision intactos |
| ukisai/Swift-Qwen3.8-27b | No disponible | No disponible | Swift Open License v1.0 | HuggingFace | Modelo base; segun la model card es ~58% mas eficiente en tokens que Qwen3.8-27B de serie |
| Qwen3.8-27B (Qwen Team, Alibaba Cloud) | 27 mil millones (segun nomenclatura) | No disponible | Apache 2.0 | HuggingFace | Modelo original; sin la edicion de comportamiento del adaptador ni la eficiencia de tokens del base Swift |
| Shockem/Qwen3.8-27b-Terse-Coder-LoRA | Adaptador de rango 16 | No aplica | Apache 2.0 | HuggingFace | Adaptador DPO ronda 8; el autor recomienda usarlo en tiempo de ejecucion en lugar de fusionado |

No se dispone de datos comparativos de rendimiento (MMLU, HumanEval, GSM8K) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No existen benchmarks independientes sobre este checkpoint fusionado; la propia model card lo indica de forma explicita. Cualquier evaluacion de calidad debe hacerse por cuenta del usuario.
- Existe un impuesto de capacidad documentado tras la fusion de LoRA en el adaptador original (de 70% a 60–62% en un conjunto held-out-40, medido tras fp32-merge, fp16 y re-cuantizacion NVFP4). Este artefacto almacena en bf16 sin re-cuantizar, por lo que el impuesto deberia ser menor, pero no es cero.
- La model card advierte de que no se debe cargar el LoRA Terse-Coder encima de este modelo: la doble aplicacion acorta en exceso el razonamiento, con un 63% de aprobados y fallos de tipo `no_code` en las pruebas del adaptador.
- El adaptador es una edicion de comportamiento, no de conocimiento. En tareas que requieran derivaciones largas hay que subir `reasoning_effort`; de lo contrario el modelo puede responder de forma demasiado escueta.
- El efecto de concision es acumulativo: Terse-Coder se suma a la concision que ya trae el modelo base Swift, lo que puede producir respuestas excesivamente breves en dominios donde se espera detalle.
- Reduccion del espacio de razonamiento en tareas que requieren cadenas largas, con el consiguiente riesgo de errores por saltarse pasos intermedios.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a los modelos de lenguaje y no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponibles. No se publica informacion sobre composicion del dataset, filtrado ni evaluaciones de sesgo.
- Idiomas soportados: no disponibles. No hay lista de lenguas declarada, lo que dificulta planificar despliegues multilingues.
- Licencia: Swift Open License v1.0. El uso es gratuito para uso personal, investigacion, educacion, evaluacion y uso comercial por individuos y organizaciones con ingresos brutos anuales de hasta 1.000.000 USD. Por encima de ese umbral se requiere una Swift Enterprise License de UkisAI. El modelo esta ademas marcado como gated, por lo que hay que aceptar las condiciones antes de descargarlo.
- La licencia Apache 2.0 de Qwen3.8-27B no queda limitada por la Swift Open License, pero las condiciones de esta ultima aplican a los pesos fusionados de este repositorio.
- Formato: sin variantes GGUF publicadas, lo que excluye los flujos de trabajo habituales en llama.cpp, Ollama y LM Studio.
- Tamano: 55,6 GB de pesos en bf16 impiden el despliegue en una unica GPU de consumo sin cuantizar.
- Repositorio sin descargas ni likes y creado el 2026-09-23, con actualizacion el mismo dia: no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vwdubb/Swift-Qwen3.8-27b-Terse-Coder
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Adaptador LoRA fusionado: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Equipo Qwen (Alibaba Cloud): https://huggingface.co/Qwen
- Perfil del autor del base: https://huggingface.co/ukisai

Nota: la busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo; los resultados obtenidos corresponden a sitios sin relacion con el contenido tecnico solicitado y se han descartado.
