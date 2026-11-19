# SourceHat-Labs/SenseNova-Loop-9B-EXL3-5.25bpw

## Resumen

SenseNova-Loop-9B-EXL3-5.25bpw es una cuantizacion EXL3 (ExLlamaV3) del modelo multimodal SenseNova-Loop-9B desarrollado por SenseTime. Se trata de una version empaquetada por SourceHat-Labs orientada a inferencia eficiente en GPU, con pesos serializados en formato safetensors y un runtime especifico que incluye el port de la arquitectura SenseNova Loop. El modelo base es image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto.

La relevancia de esta ficha radica en que la cuantizacion a 5.25 bits por peso (bpw) reduce de forma notable los requisitos de memoria respecto a los pesos originales, manteniendo una cabeza de salida en BF16, codificacion posicional nativa de 524.288 tokens y tensores recurrentes y de router en FP32. El autor declara picos de memoria de 15,31 y 14,59 GiB en dos formas de prueba con cache compartida de 262.144 tokens en Q6, lo que situa el modelo en el umbral de GPUs de 16 GiB, aunque el propio autor advierte que el despliegue fisico en 16 GiB es una comprobacion pendiente.

El checkpoint incluye pesos especulativos nativos (decodificacion especulativa), aunque la paridad exacta de estos y el despliegue fisico en 16 GiB no estan verificados. El modo recomendado y verificado es target-only. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseNova Loop (transformer con componentes recurrentes y router; port en runtime EXL3) |
| Parametros totales | 4.669.788.800 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 524.288 tokens de codificacion posicional nativa; perfil de servicio probado limitado por cache compartida de 262.144 tokens |
| Tipos de cuantizacion | EXL3 a 5.25 bpw; cabeza de salida BF16; embeddings de entrada, lineales de vision y lineales de draft nativas en 8-bit; 144 tensores recurrentes y de router en FP32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3, libreria exllamav3) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea la arquitectura SenseNova Loop, que combina componentes de transformer con tensores recurrentes y de router, segun se desprende del inventario de precision del checkpoint cuantizado (144 tensores recurrentes y de router conservados en FP32). El pipeline declarado es image-text-to-text, por lo que integra una torre de vision con lineales cuantizadas a 8 bits en esta version. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

La innovacion principal de esta publicacion es el proceso de cuantizacion EXL3 a 5.25 bpw, que preserva selectivamente en mayor precision los componentes sensibles: cabeza de salida en BF16, codificacion posicional nativa de 524.288 tokens, tensores recurrentes y de router en FP32, y lineales de vision y de draft en 8 bits. El checkpoint incluye pesos de decodificacion especulativa nativos, aunque el autor indica que la paridad especulativa exacta y el despliegue fisico en 16 GiB son comprobaciones no finalizadas. El runtime se distribuye como tarball (`runtime/exllamav3-sensenova-source.tar.gz`) e incluye el port de la arquitectura, con un perfil de referencia de servicio en `runtime/REFERENCE-PROFILE.json`. La verificacion se realizo con dos cargas independientes en GPU, fixtures de texto y vision, y cuatro flujos target-only con cache Q6 compartida de 262.144 tokens.

## Capacidades

- Generacion de texto a partir de entradas multimodales de imagen y texto (pipeline image-text-to-text).
- Procesamiento de imagenes mediante torre de vision con lineales en 8 bits.
- Contexto largo: codificacion posicional nativa de 524.288 tokens, con perfil de servicio probado limitado por la cache compartida de 262.144 tokens.
- Decodificacion especulativa nativa incluida en el checkpoint (pesos de draft), aunque la paridad exacta no esta verificada; el modo recomendado es target-only.
- Conversacion multi-turno (tag conversational).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos escaneados con contexto largo: el modelo puede procesar imagenes de paginas junto con instrucciones textuales y mantener hasta 262.144 tokens en la cache de servicio probada, lo que permite analizar lotes de documentos en una sola sesion.
- Asistencia sobre capturas de pantalla o diagramas tecnicos: la torre de vision permite interpretar figuras, esquemas y UI, y generar explicaciones textuales; util en herramientas de soporte tecnico y documentacion.
- Procesamiento de imagenes medicas o industriales en entornos con GPU de 16-24 GiB: el pico medido de 14,59-15,31 GiB con cache Q6 de 262.144 tokens lo hace viable en GPUs de gama alta de consumo con suficiente VRAM.
- Despliegue en pipelines de inferencia con ExLlamaV3: integrable en servicios que ya usan el runtime EXL3, con perfil de referencia de servicio incluido para configurar longitudes maximas de peticion.
- Prototipado de asistentes conversacionales multimodales: el tag conversational y el pipeline image-text-to-text permiten construir dialogos multi-turno con imagenes adjuntas, adecuado para pruebas de concepto y evaluacion interna.
- Investigacion sobre cuantizacion extrema: el checkpoint y sus ficheros `PRECISION-ALLOCATION.csv`, `TENSOR-INVENTORY.csv` y `quantization_config.json` sirven como referencia para estudiar el impacto de preservar componentes selectivos en mayor precision a 5.25 bpw.
- Evaluacion de decodificacion especulativa: los pesos de draft nativos incluidos permiten experimentar con aceleracion especulativa, aunque con la advertencia de que la paridad no esta verificada y el modo target-only es el validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta picos de memoria de inferencia target-only de 15,31 y 14,59 GiB en dos formas de prueba con cache Q6 compartida de 262.144 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: picos medidos de 15,31 GiB y 14,59 GiB en modo target-only con cache Q6 de 262.144 tokens y dos formas de prueba.
- El autor advierte que el despliegue fisico en 16 GiB es una comprobacion pendiente y no finalizada; conviene prever margen adicional sobre los picos medidos.
- GPU recomendadas: no especificadas por el autor; por los picos medidos, GPUs con al menos 16-24 GiB de VRAM. Modelos como RTX 4090 (24 GiB), A100 (40/80 GiB) o H100 (80 GiB) quedan por encima de los picos reportados, pero no hay validacion publicada en esas tarjetas.
- Cabe en GPU de consumo: si los picos de 14,59-15,31 GiB se confirman, cabria en GPUs de 16 GiB, aunque el autor no lo da por verificado; en GPUs de 24 GiB (RTX 3090, RTX 4090) hay margen respecto a los picos medidos.
- Opciones de despliegue: runtime EXL3 incluido en `runtime/exllamav3-sensenova-source.tar.gz`, con extension a compilar para el entorno CUDA/PyTorch del usuario segun el README del runtime. Perfil de servicio de referencia en `runtime/REFERENCE-PROFILE.json`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- El despliegue fisico en 16 GiB no esta verificado por el autor; los picos de memoria medidos (14,59-15,31 GiB) dejan poco margen y dependen de la forma de la peticion y de la cache Q6 compartida.
- La paridad exacta de la decodificacion especulativa con los pesos de draft nativos es una comprobacion no finalizada; el autor recomienda el modo target-only como configuracion verificada.
- La longitud maxima de peticion en el perfil de servicio probado esta limitada por la cache compartida (262.144 tokens), aunque la codificacion posicional nativa del checkpoint es de 524.288 tokens.
- Requiere compilar la extension del runtime EXL3 para el entorno CUDA/PyTorch concreto, lo que anade complejidad de despliegue frente a formatos estandar.
- No hay informacion sobre sesgos conocidos, riesgo de alucinacion ni limitaciones idiomaticas en la informacion proporcionada.
- Idiomas soportados no disponibles; conviene validar el comportamiento multilingue antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial, pero al ser una cuantizacion de un modelo base de terceros conviene revisar las condiciones del modelo original SenseNova-Loop-9B.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- No se han publicado benchmarks; el rendimiento cualitativo del modelo cuantizado frente al original no esta documentado.

## Enlaces

- Hugging Face: https://huggingface.co/SourceHat-Labs/SenseNova-Loop-9B-EXL3-5.25bpw
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Runtime incluido en el repo: `runtime/exllamav3-sensenova-source.tar.gz`
- Perfil de servicio de referencia: `runtime/REFERENCE-PROFILE.json`
- Inventario de precision: `PRECISION-ALLOCATION.csv`, `TENSOR-INVENTORY.csv`, `quantization_config.json`
