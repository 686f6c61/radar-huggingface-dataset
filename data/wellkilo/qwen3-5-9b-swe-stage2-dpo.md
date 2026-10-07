# wellkilo/qwen3.5-9b-swe-stage2-dpo

## Resumen

`wellkilo/qwen3.5-9b-swe-stage2-dpo` es un adaptador LoRA de optimizacion de preferencias (DPO) publicado por el usuario wellkilo sobre el modelo base `Qwen/Qwen3.5-9B`. No se trata de un modelo completo, sino de la segunda etapa de un pipeline de ajuste orientado a tareas de ingenieria de software (SWE): parte del adaptador SFT `qwen3.5-9b-swe-sft` y continua el entrenamiento con DPO sobre 5.878 pares de preferencia sinteticos, con un unico epoch y 600 pasos.

El problema que aborda es el de alinear un modelo de generacion de parches de codigo para que prefiera parches correctos frente a mutaciones defectuosas (truncamientos, hunks fallidos, indentacion rota, identificadores renombrados o cambios no operativos). El autor advierte explicitamente que las preferencias son sinteticas y no verificadas por ejecucion, de modo que la senal de preferencia es mas debil que la de un esquema con feedback real de tests.

Su relevancia es limitada y muy experimental: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, la model card no documenta la arquitectura del modelo base, no publica benchmarks y no especifica idiomas soportados. Es util como referencia metodologica para estudiar DPO de segunda etapa sobre adaptadores LoRA, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador PEFT/LoRA sobre `Qwen/Qwen3.5-9B`; arquitectura del modelo base no documentada en la informacion disponible) |
| Parametros totales | Modelo base: ~9.000 millones segun su denominacion (no confirmado en la informacion disponible). Adaptador: no disponible (no se indica rango, alpha ni numero de modulos objetivo) |
| Parametros activos | No aplica (no se describe una arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible. Longitud maxima de secuencia usada en el entrenamiento DPO: 512 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion se aplicaria al modelo base tras el merge) |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Libreria | peft |
| Metodo de entrenamiento | DPO, beta = 0.1, 1 epoch / 600 pasos, 5.878 pares de preferencia |
| Tamano del repositorio | 1,7 GB |
| Fecha de publicacion | 2026-10-06 (ultima actualizacion: 2026-10-07) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base `Qwen/Qwen3.5-9B` ni su composicion de datos de preentrenamiento. Lo unico documentado es el procedimiento de ajuste del adaptador: se parte del adaptador SFT `qwen3.5-9b-swe-sft`, sobre la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` del modelo base, y se aplica DPO con beta 0.1 durante 1 epoch (600 pasos) con longitud maxima de secuencia de 512 tokens.

El conjunto de preferencias es sintetico. Los ejemplos positivos son parches de referencia procedentes del corpus de SFT y los negativos son mutaciones controladas de esos mismos parches: truncamiento, hunks fallidos, indentacion rota, identificadores renombrados y cambios no operativos (no-op). No hay verificacion por ejecucion de tests, por lo que el autor califica la senal de preferencia como mas debil que la de un esquema con feedback real. Las metricas finales reportadas son: perdida final 0.2088, recompensa media del elegido -3.011, recompensa media del rechazado -9.978, margen +6.97 y precision de preferencia 0.795.

## Capacidades

- Generacion y edicion de parches de codigo en el contexto de tareas de ingenieria de software (el corpus de entrenamiento se basa en parches de referencia y sus mutaciones defectuosas).
- Preferencia alineada hacia parches sintacticamente coherentes frente a salidas truncadas, con hunks fallidos, indentacion incorrecta o identificadores renombrados de forma inconsistente.
- Capacidad de edicion de codigo multi-archivo, inferida del tipo de datos (parches con hunks), aunque no verificada por ejecucion en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.) en la informacion proporcionada.

## Casos de uso

- Investigacion sobre DPO de segunda etapa: permite reproducir y analizar como un adaptador SFT ya entrenado evoluciona al aplicar preferencias sinteticas, midiendo el margen entre elegido y rechazado (+6.97) y la precision de preferencia (0.795) sobre un modelo de ~9.000 millones de parametros.
- Experimentos de ablacion sobre datos sinteticos de preferencia: el autor describe cinco tipos de mutacion negativa (truncamiento, hunks fallidos, indentacion rota, identificadores renombrados, no-op), lo que facilita estudiar que tipo de error penaliza mas el entrenamiento.
- Generacion de propuestas de parche para tareas tipo SWE-bench: el adaptador esta orientado a producir ediciones de codigo sobre repositorios, util como componente candidato en un pipeline de resolucion automatica de issues, siempre que se valide con tests de ejecucion antes de desplegarlo.
- Asistencia a revision de codigo en modo experimental: uso del adaptador para proponer un diff que un revisor humano evalua, comparando la salida del adaptador DPO con la del adaptador SFT para medir la ganancia real.
- Prototipado de pipelines de merge de LoRA: sirve como caso practico para validar el flujo `PeftModel.from_pretrained` + merge de pesos + conversion a GGUF o despliegue con vLLM.
- Filtrado de datos de entrenamiento: usar el modelo como anotador debil para puntuar pares de parches y priorizar candidatos antes de una revision manual o de una validacion por tests.
- Docencia y formacion: ilustra de forma compacta (1,7 GB de adaptador) como se encadena un ajuste SFT con un DPO posterior y que metricas conviene registrar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones tipo MMLU, HumanEval, GSM8K ni SWE-bench, ni comparaciones con otros modelos.

Unicamente se dispone de las metricas internas de entrenamiento del DPO, que no constituyen un benchmark de capacidades:

| Metrica de entrenamiento | Valor |
|---|---|
| Perdida final | 0.2088 |
| rewards/chosen | -3.011 |
| rewards/rejected | -9.978 |
| rewards/margin | +6.97 |
| rewards/accuracy | 0.795 |
| Pares de preferencia | 5.878 |
| Epochs / pasos | 1 / 600 |
| Beta | 0.1 |
| Longitud maxima de secuencia | 512 |

## Requisitos de hardware

- El adaptador LoRA por si solo no es inferible: requiere cargar el modelo base `Qwen/Qwen3.5-9B` (~9.000 millones de parametros) y aplicar el adaptador con `PeftModel.from_pretrained`.
- VRAM estimada para inferencia del modelo base fusionado (estimaciones generales para 9B; no confirmadas por el autor): ~18-20 GB en bf16/fp16, ~10-11 GB en cuantizacion de 8 bits y ~6-7 GB en 4 bits, mas el coste de la cache KV segun contexto.
- GPU recomendadas (estimacion general por tamano): A100 40/80 GB, H100, L40S o RTX 4090 / 3090 de 24 GB para bf16; RTX 4080 de 16 GB o inferiores requeririan cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090/3090 (24 GB) en bf16 con contexto moderado, y en GPUs de 8-16 GB solo con cuantizacion, sujeto a confirmacion.
- Opciones de despliegue: transformers + PEFT (ruta documentada en la model card), vLLM o TGI tras fusionar el adaptador, y llama.cpp/Ollama tras convertir el modelo fusionado a GGUF (el adaptador LoRA tambien puede convertirse aparte). No hay instrucciones de despliegue en la informacion disponible.
- Latencia y throughput estimados: no disponibles.
- Nota: el entrenamiento uso una longitud de secuencia de 512 tokens, por lo que el comportamiento con contextos largos no esta validado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye benchmarks ni especificaciones verificables del modelo base `Qwen/Qwen3.5-9B`, y el repositorio no cita alternativas comparables. Tampoco hay datos publicos en la informacion disponible sobre otros adaptadores DPO de la misma familia o sobre modelos dedicados a tareas SWE del mismo rango de tamano, por lo que cualquier tabla comparativa implicaria inventar cifras.

Criterios que deberian cubrirse en una comparativa futura: parametros del modelo base, longitud de contexto real, licencia del adaptador y del base, disponibilidad de pesos (adaptador frente a modelo completo), metodo de alineamiento (DPO con preferencias sinteticas frente a RLHF o feedback de ejecucion) y resultados en benchmarks de parcheo de codigo con verificacion por tests.

## Limitaciones y advertencias

- Senal de preferencia sintetica: los negativos son mutaciones artificiales de parches de referencia, no errores observados en ejecucion real. El propio autor advierte que la senal es mas debil que la de un esquema con feedback de tests.
- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni evaluacion con tests de ejecucion.
- Riesgo de alucinacion: no documentado por el autor, pero un modelo entrenado para preferir parches plausibles puede generar diffs sintacticamente correctos que no resuelvan el problema subyacente. No hay verificacion por ejecucion que lo mitigue.
- Sesgos conocidos: no disponibles. No se documenta composicion del corpus, idiomas ni procedencia de los datos de SFT, por lo que no es posible evaluar sesgos de dominio, lenguaje de programacion o licencia del codigo de entrenamiento.
- Limitacion de contexto en entrenamiento: la longitud maxima de secuencia usada fue de 512 tokens, muy inferior a la que requieren la mayoria de tareas reales de parcheo sobre repositorios completos.
- Restricciones de licencia: el adaptador se publica como apache-2.0 siguiendo la licencia del modelo base. El uso comercial depende de que el modelo base y los datos de entrenamiento respeten esa misma licencia, algo que la informacion disponible no permite confirmar.
- Dependencia del modelo base: cualquier redistribucion o despliegue exige disponer de `Qwen/Qwen3.5-9B` en la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`.
- Caveat para produccion: se trata de un artefacto de investigacion sin garantias de calidad, con documentacion minima (sin pipeline declarado, sin idiomas, sin arquitectura) y sin pruebas de robustez. No se recomienda su uso en produccion sin evaluacion propia con tests de ejecucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wellkilo/qwen3.5-9b-swe-stage2-dpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Adaptador SFT de partida (`qwen3.5-9b-swe-sft`): mencionado en la model card, sin URL confirmada en la informacion disponible.
- Repositorio del proyecto: mencionado en la model card como fuente de detalles adicionales, sin URL proporcionada.
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, a su entrenamiento ni a benchmarks asociados en la busqueda realizada.
