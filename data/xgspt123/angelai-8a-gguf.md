# Xgspt123/AngelAI-8a-gguf

## Resumen

AngelAI-8a-gguf es un modelo de lenguaje con capacidades de vision publicado en HuggingFace por el usuario Xgspt123. Se distribuye exclusivamente en formato GGUF, listo para su uso con llama.cpp, e incluye un proyector multimodal separado (`Qwen3.5-2B.F16-mmproj.gguf`), lo que confirma que se trata de un modelo vision-language y no solo de texto. Segun la model card, el ajuste fino y la conversion a GGUF se realizaron con Unsloth, con una aceleracion declarada de 2x en el entrenamiento.

El dato de parametros verificable procede de los safetensors del repositorio: 1.942.653.248 parametros, es decir, aproximadamente 1,94 mil millones. Los nombres de los ficheros publicados (`Qwen3.5-2B.Q8_0.gguf`) apuntan a un modelo base de la familia Qwen3.5 en su variante de 2B, aunque la etiqueta y el nombre del repositorio usan el sufijo "8a", una discrepancia que el autor no explica en la informacion disponible. El repositorio ocupa 2,7 GB e incluye cuantizacion Q8_0 para los pesos del LLM y F16 para el proyector visual.

Su relevancia practica es la de un modelo pequeno multimodal ejecutable en hardware de consumo o incluso en CPU, util para prototipado rapido, tareas de vision sencillas y despliegues locales sin GPU dedicada. No obstante, la ficha carece de datos esenciales: no se indica licencia, ni idiomas soportados, ni longitud de contexto, ni resultados de evaluacion, y el repositorio no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5`; se presume transformer multimodal con proyector visual, sin confirmar por el autor) |
| Parametros totales | 1.942.653.248 (~1,94 mil millones), segun safetensors |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 para el LLM y F16 para el proyector multimodal (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); el repositorio no publica safetensors completos, solo el dato de recuento de parametros |
| Tamano del repositorio | 2,7 GB |
| Fecha de creacion (segun ficha) | 2026-09-10 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Las etiquetas del repositorio (`qwen3_5`, `vision-language-model`, `llama.cpp`, `unsloth`) y los nombres de los ficheros publicados indican que se trata de un ajuste fino de un modelo base de la familia Qwen3.5, en su variante de 2B, con un cabezal o proyector visual exportado por separado en F16. La presencia del fichero `mmproj` implica que el modelo procesa imagenes ademas de texto, y que la inferencia multimodal debe realizarse con `llama-mtmd-cli` en lugar de `llama-cli`.

En cuanto al entrenamiento, la unica informacion disponible es que el ajuste fino y la conversion a GGUF se hicieron con Unsloth y que el proceso declaro ser 2x mas rapido. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF, DPO u otro alineamiento, ni si se congelaron capas del encoder visual. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, modos de razonamiento, etc.).

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagenes: la presencia del proyector `F16-mmproj` y la etiqueta `vision-language-model` confirman entrada multimodal.
- Inferencia local mediante llama.cpp: el autor documenta el uso con `llama-cli -hf Xgspt123/AngelAI-8a-gguf --jinja` para texto y `llama-mtmd-cli -hf Xgspt123/AngelAI-8a-gguf --jinja` para multimodal.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con APIs compatibles, aunque no se detalla el formato.
- Soporte de plantillas de chat: el flag `--jinja` indica que el GGUF incluye plantilla de chat Jinja para formatear conversaciones.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Cobertura multilingue: no disponible.
- Modo de razonamiento explicito (thinking mode), audio o video: no disponible.

## Casos de uso

- Extraccion de datos de documentos escaneados: usando `llama-mtmd-cli`, el modelo puede recibir una imagen de una factura o formulario y devolver campos estructurados en texto, aprovechando que el conjunto completo (pesos Q8_0 mas proyector F16) cabe en menos de 3 GB de disco.
- Descripcion automatica de imagenes para accesibilidad: generacion de texto alternativo en catalogos, aplicaciones de lectura o CMS, ejecutable en local sin enviar imagenes a servicios externos.
- Asistente conversacional de escritorio con entrada visual: un chatbot que permita adjuntar capturas de pantalla y responder preguntas sobre ellas, desplegado con llama.cpp en un portatil.
- Clasificacion y filtrado de imagenes en pipelines de moderacion: preetiquetado de contenido con un modelo pequeno antes de pasar los casos dudosos a un modelo mayor, reduciendo coste por inferencia.
- Soporte tecnico guiado por capturas: el usuario envia una captura de un error de interfaz y el modelo describe el problema y sugiere pasos, integrado en un sistema de tickets.
- Prototipado y ajuste fino con Unsloth: dado que el autor publica el flujo de trabajo con Unsloth, sirve como punto de partida para reproducir el ajuste y experimentar con cuantizaciones alternativas.
- Inferencia en CPU o en equipos sin GPU: al ser un GGUF de ~2 GB en Q8_0, es viable ejecutarlo en un servidor sin acelerador o en una Raspberry Pi de gama alta con RAM suficiente, con latencias mas altas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra evaluacion, y los resultados de busqueda web devueltos no contienen informacion relacionada con este modelo.

## Requisitos de hardware

- VRAM estimada: en Q8_0 los pesos del LLM ocupan aproximadamente 2,1 GB; anadiendo el proyector F16 y el cache KV, un presupuesto practico de 3 a 4 GB de VRAM es suficiente para contexto corto (estimacion propia, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 4070 o superiores. Una RTX 4090 o una A100 estan sobredimensionadas para este tamano, salvo que se busque throughput muy alto con muchos lotes.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU dedicada de los ultimos anos con 4-6 GB de VRAM puede ejecutarlo, y tambien es viable en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), y por extension cualquier frontend compatible con GGUF como Ollama o LM Studio. vLLM y TGI no son la via natural para este repositorio, que solo publica GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones, y dependen fuertemente del hardware y de si la entrada es texto o imagen.

## Comparativa con modelos similares

Los valores de los modelos comparados proceden de sus fichas publicas habituales y deben verificarse antes de tomar una decision; los campos no confirmados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| AngelAI-8a-gguf | ~1,94B | no disponible | Si (mmproj F16) | no disponible | GGUF |
| Qwen2.5-VL-3B-Instruct | ~3,75B | 32.768 tokens (ampliable) | Si | Apache-2.0 | safetensors y GGUF comunitarios |
| Moondream2 | ~1,86B | no disponible | Si | Apache-2.0 | safetensors y GGUF comunitarios |

No hay datos de rendimiento comparado publicados para AngelAI-8a-gguf, por lo que la comparacion se limita a tamano, licencia y disponibilidad. La principal desventaja frente a las alternativas citadas es la ausencia de licencia declarada, que impide confirmar el uso comercial.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial ni redistribucion sin contacto previo con el autor. Este es el caveat mas importante para produccion.
- Discrepancia de nomenclatura: el repositorio se llama "AngelAI-8a" pero los ficheros publicados son `Qwen3.5-2B.*` y el recuento de parametros es de ~1,94B. Conviene verificar que el modelo es el esperado antes de integrarlo.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede planificar el uso con documentos largos ni configurar correctamente el cache KV.
- Idiomas no declarados: se desconoce la cobertura multilingue y la calidad en castellano.
- Riesgo de alucinacion elevado: con menos de 2.000 millones de parametros, es previsible que falle en razonamiento complejo, matematicas y hechos verificables. No se han publicado evaluaciones que cuantifiquen este extremo.
- Calidad de vision no evaluada: no hay benchmarks multimodales ni ejemplos de salida, por lo que el rendimiento en OCR, descripcion fina o lectura de graficos es una incognita.
- Sesgos: no hay informacion sobre la composicion del dataset de ajuste ni sobre filtrado de datos, por lo que no se pueden caracterizar los sesgos.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, sin historial de uso ni validacion por parte de la comunidad.
- Sin garantias de mantenimiento: no se indica versionado, fecha de expiracion ni plan de actualizaciones.
- Uso en produccion: se recomienda tratar este modelo como experimental y validar sus salidas con datos propios antes de cualquier despliegue real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xgspt123/AngelAI-8a-gguf
- Unsloth (herramienta usada para el ajuste fino y la conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime compatible, incluye `llama-cli` y `llama-mtmd-cli`): https://github.com/ggml-org/llama.cpp

Nota: los resultados de busqueda web disponibles no contenian informacion relevante sobre este modelo (devolvieron paginas de soporte de Microsoft sin relacion con el repositorio), por lo que no se han podido anadir papers, blogs ni demos adicionales.
