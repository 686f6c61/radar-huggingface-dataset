# yoyu001/grid-dispatch-A-instruct-merged-v1

## Resumen

grid-dispatch-A-instruct-merged-v1 es un ajuste fino por QLoRA y posteriormente fusionado (merged) del modelo Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario yoyu001. Su proposito concreto es leer notas en chino de operadores de despacho de red electrica, convertirlas en JSON de restricciones y rechazar instrucciones que violen un SLA (acuerdo de nivel de servicio). El propio autor especifica que el modelo no toma decisiones de despacho: solo interpreta y estructura la informacion.

Se trata de un modelo denso de 4.022.468.096 parametros (aproximadamente 4 B), con pesos en safetensors y licencia Apache 2.0 heredada del modelo base. El repositorio ocupa 8,1 GB, lo que corresponde a los pesos en precision float16. El entrenamiento se realizo durante 496 pasos sobre una GPU Kaggle T4 en fp16, con un dataset sintetico generado por reglas (yoyu001/grid-dispatch-notes-zh), no con registros reales de operadores.

El modelo es relevante como ejemplo de ajuste fino especializado de bajo coste sobre una base ya instruida: demuestra como un SFT breve con QLoRA puede transformar un modelo generalista de 4 B en un extractor de estructuras fiable para un dominio muy acotado, con un salto medido del 19,6 % al 98,6 % de exactitud en el conjunto de test del autor. Al estar declarado como tarea del primer capitulo del smol-course de Hugging Face, tambien sirve como referencia didactica de un pipeline QLoRA + merge reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen3-4B-Instruct-2507; detalles internos del base no disponibles en la informacion proporcionada) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible en el repositorio; el merge se realizo en float16. El modelo base admite cuantizaciones habituales (GGUF, AWQ, GPTQ) pero no se confirma para este ajuste |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados en float16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de unos 4 B de parametros ya ajustado para instrucciones. Sobre esa base se aplico QLoRA (adaptadores de bajo rango con cuantizacion del modelo base) y despues se fusionaron los adaptadores en un checkpoint completo en float16. El entrenamiento consistio en 496 pasos de SFT con la libreria TRL sobre una GPU Kaggle T4, y el adaptador original se publica por separado como yoyu001/grid-dispatch-A-instruct-qlora-v1 (huella 1d4b4d4a).

Los datos de entrenamiento provienen de yoyu001/grid-dispatch-notes-zh, un dataset sintetico generado mediante reglas, no de notas reales de operadores. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO; el procedimiento descrito es exclusivamente SFT. La innovacion destacable no es arquitectonica sino de dominio: la tarea se formula como transformacion de texto libre a JSON de restricciones con rechazo explicito de instrucciones que incumplen un SLA, lo que convierte el modelo en un componente de validacion previa a cualquier accion sobre la red.

## Capacidades

- Conversion de notas operativas en chino a JSON de restricciones estructurado.
- Deteccion y rechazo de instrucciones que violan un SLA definido.
- Generacion de texto y comprension de instrucciones en chino, heredadas del modelo base.
- Razonamiento de un solo paso orientado a extraccion de campos y normalizacion de valores.
- No realiza decisiones de despacho: el autor lo declara explicitamente fuera de su alcance.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para este ajuste.
- Capacidades de agente multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al chino segun la model card.
- Modo thinking, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Preprocesado de notas de operador en un centro de control: el modelo recibe el texto libre en chino y devuelve un JSON de restricciones que un validador posterior puede comprobar contra el estado real de la red, reduciendo la transcripcion manual.
- Filtro de seguridad previo a la ejecucion: cualquier instruccion entrante se pasa por el modelo, que la rechaza si contradice un SLA, actuando como primera barrera antes de la aprobacion humana.
- Normalizacion de vocabulario operativo: al haberse entrenado con variantes de expresiones, puede mapear formulaciones heterogeneas de distintos turnos a un esquema comun de campos.
- Asistencia a la documentacion de incidencias: conversion de notas de turno en registros estructurados para auditoria y trazabilidad, con revision humana obligatoria.
- Prototipado rapido de pipelines de dominio: al ser un ajuste de 4 B con licencia Apache 2.0, sirve para validar la viabilidad de un flujo texto-a-JSON antes de invertir en datos y modelos mayores.
- Material didactico y reproduccion de QLoRA: el par adaptador + modelo fusionado permite reproducir el pipeline completo de SFT con TRL en hardware de consumo.
- Extraccion de restricciones en entornos con recursos limitados: al caber en GPUs de gama media en float16 o cuantizado, puede desplegarse en infraestructura local sin depender de servicios externos.

## Benchmarks y rendimiento

El autor publica resultados sobre su propio examen de exactitud (exact match), antes y despues del ajuste:

| Conjunto | Antes del ajuste | Despues del ajuste |
|---|---|---|
| Test del autor | 19,6 % | 98,6 % |
| Expresiones no vistas | 19,8 % | 81,2 % |
| 20 preguntas de personas reales | 30 % | 75 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en float16: en torno a 8 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 12-16 GB para inferencia comoda.
- VRAM estimada cuantizado a 8 bits: aproximadamente 4-5 GB de pesos.
- VRAM estimada cuantizado a 4 bits: aproximadamente 2,5-3 GB de pesos.
- GPU recomendadas: A100 o H100 para despliegue de produccion con concurrencia; RTX 4090 o L40S para servicio de baja latencia en fp16.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y, cuantizado a 4 bits, en GPUs de 8 GB como RTX 3060 Ti o RTX 4060.
- Opciones de despliegue: vLLM y TGI para safetensors en fp16; llama.cpp u Ollama si se generan versiones GGUF a partir del checkpoint fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grid-dispatch-A-instruct-merged-v1 | 4,02 B | no disponible | SFT especializado en notas de despacho en chino | Apache 2.0 | HuggingFace, safetensors |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4 B | no disponible | Modelo generalista de instrucciones | Apache 2.0 | HuggingFace |
| Adaptador yoyu001/grid-dispatch-A-instruct-qlora-v1 | adaptadores LoRA sobre 4 B | no disponible | Mismo dominio, formato adaptador | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Inestabilidad ante expresiones no vistas: la exactitud cae al 81,2 % en formulaciones fuera del dataset, frente al 98,6 % en test.
- Entrenado con datos sinteticos generados por reglas, no con registros reales de operadores; el dominio cubierto puede ser mas estrecho de lo que sugiere el nombre.
- El autor exige validacion de seguridad y aprobacion humana antes de ejecutar cualquier salida; no debe usarse como unico arbitro de cumplimiento de SLA.
- Solo soporta chino; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion en campos JSON no presentes en la nota original, especialmente con vocabulario fuera de distribucion.
- No toma decisiones de despacho y no debe emplearse para ello.
- Sin descargas ni validacion externa en el momento de la ficha; el rendimiento reportado procede unicamente del autor.
- Licencia Apache 2.0 permite uso comercial, pero conviene conservar los avisos de licencia del modelo base y verificar las obligaciones heredadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yoyu001/grid-dispatch-A-instruct-merged-v1
- Adaptador QLoRA: https://huggingface.co/yoyu001/grid-dispatch-A-instruct-qlora-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/yoyu001/grid-dispatch-notes-zh
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Curso de referencia (smol-course, capitulo 1): https://github.com/huggingface/smol-course
