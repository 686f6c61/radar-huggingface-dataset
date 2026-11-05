# vladadu/lfm3-1.7b-arabic-lora-gguf

## Resumen

LFM3-1.7B Arabic LoRA es un conjunto de dos adaptadores LoRA publicados por el usuario vladadu para el modelo base LiquidAI/LFM3-1.7B, distribuidos en formato GGUF compatible con llama.cpp. No se trata de un modelo completo, sino de pesos delta de rango 32 (alpha 64) que se cargan en tiempo de ejecución sobre una cuantización Q4_K_M del modelo base. El repositorio ocupa aproximadamente 0,1 GB e incluye únicamente los ficheros de adaptadores en f16.

El propósito es doble: por un lado, `lfm3-smart-reply-lora-r32-f16.gguf` está entrenado para generar sugerencias de respuesta corta (smart reply) en árabe; por otro, `lfm3-smart-edit-lora-r32-f16.gguf` reescribe mensajes en árabe aplicando transformaciones controladas de estilo: corrección gramatical, acortamiento, formalización o informalización, con cobertura declarada de árabe estándar moderno (MSA), dialecto del Golfo y dialecto egipcio.

La relevancia de esta publicación es acotada y muy específica: demuestra el flujo de trabajo de adaptación LoRA sobre LFM3 para tareas de mensajería en árabe y ofrece artefactos listos para `llama-server` con `--lora`. No hay métricas publicadas, ni datos de evaluación, ni información sobre el volumen o la composición exacta del corpus sintético empleado, lo que limita su uso en producción sin una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre el transformer LiquidAI LFM3-1.7B; rank 32, alpha 64 |
| Parametros totales | 32.210.944 (suma de los tensores del adaptador, segun safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | Adaptadores en f16 (GGUF LoRA); el modelo base se usa en Q4_K_M en el ejemplo de uso |
| Idiomas soportados | Árabe (`ar`): MSA, dialecto del Golfo y dialecto egipcio (este ultimo declarado solo para la tarea de edicion) |
| Licencia | LFM Open License v1.0 (`lfm1.0`), la misma del modelo base |
| Formato de pesos | GGUF (adaptadores LoRA en formato llama.cpp, f16) |

## Arquitectura y entrenamiento

Los adaptadores se aplican sobre las proyecciones de atencion, las proyecciones de entrada y salida de la convolucion corta (`short-conv`) y las tres matrices de la red feed-forward (w1, w2, w3) del transformer LFM3-1.7B. El rango es 32 con alpha 64, lo que da una escala efectiva de 2,0 sobre las actualizaciones de pesos. El entrenamiento se realizo sobre datos sinteticos de arabe, sin que la model card detalle el numero de ejemplos, la mezcla por dialecto, la longitud de secuencia ni el esquema de optimizacion.

No se documenta el uso de RLHF, DPO ni ninguna fase de alineacion adicional; el proceso descrito es exclusivamente un ajuste supervisado con LoRA sobre el modelo base. Tampoco se indica si se congelo el embedding, si se entreno con enmascaramiento de perdida solo en la respuesta, ni que formato de prompt exacto se utilizo, mas alla de la advertencia de que los adaptadores esperan el formato de prompt con el que fueron entrenados y que fuera de el los resultados no estan caracterizados.

## Capacidades

- Generacion de sugerencias de respuesta breve (smart reply) en arabe, orientadas a interfaces de mensajeria.
- Edicion controlada de mensajes en arabe con cuatro operaciones declaradas: correccion gramatical, acortamiento, mayor formalidad y mayor informalidad.
- Cobertura de registro y dialecto: arabe estandar moderno, dialecto del Golfo y dialecto egipcio para la tarea de edicion.
- Carga en tiempo de ejecucion sobre el modelo base mediante `llama-server --lora`, sin necesidad de fusionar pesos.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio para estos adaptadores.
- El multilingue no esta soportado por diseno: el unico idioma declarado es `ar`.

## Casos de uso

- Sugerencias de respuesta en apps de mensajeria arabe: el adaptador `smart-reply` genera respuestas cortas a partir del ultimo mensaje recibido, adecuado para botones de respuesta rapida en clientes de chat con usuarios en MSA o dialecto del Golfo.
- Correccion ortografica y gramatical en editores de texto arabe: el adaptador `smart-edit` reescribe el mensaje del usuario corrigiendo errores sin cambiar el registro, integrable como accion "corregir" en un editor movil.
- Acortamiento de mensajes para limites de caracteres: util en SMS, notificaciones push o campos con restriccion de longitud, donde el adaptador condensa el texto preservando el contenido semantico.
- Reescritura de tono para comunicaciones profesionales: conversion de un mensaje informal a registro formal en MSA para correo corporativo o atencion al cliente, o a la inversa para canales informales.
- Normalizacion de dialectos en pipelines de moderacion: convertir mensajes en dialecto del Golfo o egipcio a MSA para alimentar clasificadores o sistemas de analisis entrenados solo en arabe estandar.
- Prototipado de funciones de edicion en productos de chat: al ser adaptadores pequenos (repo de 0,1 GB) sobre una cuantizacion Q4_K_M de 1,7B, permiten levantar un servidor local con `llama-server` y validar la experiencia de usuario antes de invertir en un modelo mayor.
- Experimentacion academica con LoRA en llama.cpp: sirven como ejemplo reproducible de adaptadores de rango 32 sobre atencion, short-conv y FFN, utiles para estudiar el efecto del rango y de los modulos objetivo en tareas de reescritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los adaptadores en f16 suman aproximadamente 0,06 GB (32,2 M de parametros a 2 bytes); el consumo dominante es el del modelo base LFM3-1.7B en Q4_K_M, del orden de 1,1-1,3 GB de pesos mas overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para el modelo base cuantizado con contexto moderado; para lotes grandes o contextos largos conviene 8 GB o mas.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, y tambien en Apple Silicon con Metal.
- Opciones de despliegue: `llama.cpp` / `llama-server` con el flag `--lora`; al ser adaptadores en formato LoRA GGUF de llama.cpp, no son directamente compatibles con vLLM, TGI ni Ollama sin conversion o fusion previa de pesos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LFM3-1.7B Arabic LoRA (este) | 32,2 M en adaptadores sobre base 1,7B | no disponible | Arabe (MSA, Golfo, Egipcio) | LFM Open License v1.0 | GGUF LoRA (llama.cpp) | Dos tareas: smart reply y edicion; sin benchmarks |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | Multilingue (segun modelo base) | LFM Open License v1.0 | safetensors, GGUF | Modelo generalista sin adaptacion al arabe |
| Otros adaptadores LoRA para arabe sobre modelos pequenos | variable | variable | Arabe | variable | safetensors, GGUF | No se dispone de una comparativa publicada concreta en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni metricas de calidad, ni comparacion con lineas base, lo que impide estimar la ganancia real frente al modelo base sin una validacion propia.
- Dependencia estricta del formato de prompt: la model card advierte que fuera del formato de entrenamiento el comportamiento no esta caracterizado; cualquier integracion debe replicar exactamente la plantilla usada.
- Entrenamiento sobre datos sinteticos: no se documenta el volumen, la procedencia ni la distribucion por dialecto, lo que introduce riesgo de sesgo hacia los patrones generados y de baja cobertura de variedades no representadas.
- Cobertura limitada a tres variedades (MSA, Golfo, Egipcio): otros dialectos arabes (magrebi, levantino, iraqui) no estan declarados y su comportamiento es desconocido.
- Riesgo de alucinacion heredado del modelo base de 1,7B, especialmente en reescrituras que exigen preservar hechos o nombres propios.
- Licencia LFM Open License v1.0: es una licencia "other" con condiciones propias; debe revisarse el texto completo antes de cualquier uso comercial, y los adaptadores quedan sujetos a los mismos terminos que el modelo base.
- Sin soporte declarado de tool calling ni agentes: no debe asumirse en pipelines que requieran function calling.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en produccion ni de validacion por terceros.
- Compatibilidad restringida a llama.cpp: no hay artefactos en safetensors ni instrucciones para fusionar los adaptadores con el modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vladadu/lfm3-1.7b-arabic-lora-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Licencia del modelo base (LFM Open License v1.0): https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF/blob/main/LICENSE
