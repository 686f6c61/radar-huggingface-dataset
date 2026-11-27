# WaveCut/Qwen3.8-Flash-Next-UD-IQ2_XS-NInfer-v3

## Resumen

Qwen3.8-Flash-Next-UD-IQ2_XS-NInfer-v3 es un artefacto de inferencia en formato propietario `.ninfer` generado por el usuario WaveCut a partir de la cuantizacion Unsloth Dynamic v3.1 UD-IQ2_XS del modelo Qwen3.8-Flash-Next, publicado originalmente por el equipo Qwen. No se trata de un modelo nuevo, sino de un empaquetado optimizado del GGUF de Unsloth para el motor NInfer v3 (rama `ninfer-all`), que anade soporte para esta familia de modelos y los formatos `gguf_*` que la version estandar de NInfer rechaza.

El modelo subyacente es un Mixture of Experts de 125.000 millones de parametros con 48 capas, 512 expertos enrutados por capa y 10 expertos activos por token, lo que resulta en unos 6.000 millones de parametros activos. Combina 12 capas de atencion dispersa (QSA) con 36 capas Gated DeltaNet, e incorpora torre de vision, bloque MTP (multi-token prediction) y un drafter DFlash2 para decodificacion especulativa. El pipeline declarado es `image-text-to-text`, por lo que admite entradas de imagen y video ademas de texto.

La relevancia de este artefacto reside en que comprime el modelo a 47,43 GiB en un unico fichero, permitiendo ejecutarlo en configuraciones de una o dos GPU de consumo (el autor menciona explicitamente la RTX 5090) mediante estrategias de residencia de expertos en host, disco o dispositivo. Es, por tanto, una via practica para servir un MoE de 125B en hardware no empresarial, a costa de depender de un motor y un formato no estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: 12 capas de atencion dispersa (QSA) + 36 capas Gated DeltaNet, con hiper-conexiones |
| Parametros totales | 125B (aproximado, segun model card) |
| Parametros activos | ~6B (10 de 512 expertos activos por token) |
| Longitud de contexto | 32.768 tokens en los ejemplos de servicio (`--max-context 32768`); maximo nativo no disponible |
| Tipos de cuantizacion | Mixta por tensor: IQ2_S, IQ2_XXS, IQ4_NL, Q2_0, Q5_0, Q6_K, Q8_0, IQ4_XS, BF16, FP32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other`) |
| Formato de pesos | `.ninfer` (artefacto NInfer v3, derivado de GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con 48 capas. Cada capa contiene 512 expertos enrutados, de los cuales 10 se activan por token, mas expertos compartidos. La mitad de las capas (12) usan atencion dispersa QSA con proyecciones Q6_K e indexador en BF16, mientras que las otras 36 son capas Gated DeltaNet con query, key, value y output en Q8_0 y compuerta `z` en Q6_K. El router se mantiene en BF16 y las proyecciones de hiper-conexion en Q8_0, con las matrices de inyeccion recuantizadas desde BF16.

El artefacto incluye componentes adicionales empaquetados: la torre de vision en BF16 (0,9 GB) con las configuraciones de preprocesado de imagen y video del checkpoint original, el bloque MTP en Q8_0 (2,8 GB) para prediccion multi-token, y el drafter DFlash2 de incoai en Q4_0 (339 MB) para decodificacion especulativa. La tabla n-gram no se incluye en el fichero principal: se referencia por hash SHA-256 y se publica por separado. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multi-turno con ventana de contexto de hasta 32.768 tokens en la configuracion documentada.
- Procesamiento de imagen y video como entrada (`image-text-to-text`), mediante la torre de vision incluida en BF16.
- Prediccion multi-token (MTP) para acelerar la generacion.
- Decodificacion especulativa mediante el drafter DFlash2 adjunto, activa por defecto salvo que se indique lo contrario con `--spec`.
- Salida estructurada (structured output) soportada por el motor NInfer-all.
- Reutilizacion de prefijo de prompt (prompt-prefix reuse), util para conversaciones y agentes con contexto repetido.
- Hasta ocho peticiones concurrentes segun la release 2026-11-09.2 del motor.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de chat multimodal en una unica GPU de consumo: con `--expert-residency host`, los expertos residen en memoria host paginada y los mas usados se cachean en la GPU, lo que permite atender conversaciones texto-imagen en una RTX 5090 con contexto de 32K.
- Asistencia sobre documentacion tecnica con imagenes: la torre de vision en BF16 permite procesar capturas, diagramas y tablas junto con texto, adecuado para soporte de ingenieria y analisis de manuales.
- Procesamiento por lotes con memoria RAM limitada: el modo `--expert-residency disk` mantiene los expertos en el fichero y los streamea a una cache de GPU, util para entornos con poca RAM donde no se requiere baja latencia.
- Despliegue en dos GPU de 32 GB: con `--devices 0,1` y un pipeline stage por GPU, todos los expertos caben en memoria de dispositivo, apropiado para servir cargas concurrentes de hasta ocho peticiones.
- Generacion acelerada en produccion: la combinacion de MTP y DFlash2 reduce el numero de pasos de decodificacion, lo que resulta ventajoso en tareas de generacion larga como redaccion o sintesis de informes.
- Analisis de video con descripcion textual: la configuracion de preprocesado de video incluida permite tareas de captioning y resumen de contenido audiovisual.
- Agentes con contexto repetido: la reutilizacion de prefijo de prompt y la salida estructurada facilitan bucles de agente con herramientas donde el system prompt y el historial se reenvian en cada paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. El fichero pesa 47,43 GiB; en el modo `--expert-residency host` solo se cachea en GPU una fraccion de los expertos, por lo que el consumo depende del tamano de cache configurado.
- Modo `--devices 0,1`: requiere dos GPU con al menos 32 GB cada una para alojar todos los expertos en memoria de dispositivo.
- El autor menciona explicitamente la RTX 5090 como hardware objetivo del artefacto.
- Cabe en GPU de consumo en los modos host y disk; el modo dispositivo completo exige dos GPU de 32 GB (por ejemplo, dos RTX 5090 o dos A100 de 40 GB, aunque estas ultimas no se citan en la documentacion).
- Despliegue: exclusivamente mediante el motor NInfer-all (rama `master` de `iamwavecut/ninfer-all`), release 2026-11-09.2 o posterior. La version estandar de NInfer rechaza el fichero. Se ofrece imagen Docker.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible; el formato `.ninfer` no es GGUF estandar, aunque deriva de el.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-UD-IQ2_XS-NInfer-v3 | 125B | ~6B | 32K documentado | `.ninfer` | qwen-community-license-1.0 | Requiere NInfer-all; incluye vision, MTP y DFlash2 |
| unsloth/Qwen3.8-Flash-Next-GGUF (UD-IQ2_XS) | 125B | ~6B | no disponible | GGUF | qwen-community-license-1.0 | Modelo base del que deriva este artefacto; ejecutable en llama.cpp |
| incoai/Qwen3.8-Flash-Next-DFlash2 | no disponible | no disponible | no disponible | no disponible | no disponible | Drafter especulativo incluido en este artefacto |
| nazeshinjite/Qwen3.8-Flash-Next-DFlash2-GGUF | no disponible | no disponible | no disponible | GGUF (Q4_0) | no disponible | Version cuantizada del drafter usada aqui |

## Limitaciones y advertencias

- Dependencia de un motor no estandar: el artefacto solo funciona con NInfer-all desde la release 2026-11-09.2; NInfer estandar lo rechaza. Esto limita la portabilidad y la comunidad de soporte.
- Requiere descargar por separado la tabla n-gram (`WaveCut/Qwen3.8-Flash-Next-ngram-table-NInfer-v3`); sin ella el modelo no arranca en la configuracion documentada.
- La cuantizacion IQ2_XS es muy agresiva (2 bits efectivos en parte de los expertos), lo que previsiblemente degrada la calidad respecto al checkpoint original; no se han publicado mediciones de esa perdida.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a modelos de este tamano y a cuantizaciones de baja precision.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingue.
- Licencia qwen-community-license-1.0: es una licencia comunitaria con posibles restricciones de uso comercial; debe revisarse el fichero LICENSE antes de desplegar en produccion.
- El artefacto lo publica un tercero (WaveCut), no el equipo Qwen; no hay garantia de mantenimiento ni de paridad con el modelo original.
- El rendimiento real y la latencia no estan documentados; el modo `disk` introduce streaming desde almacenamiento y cabe esperar latencias altas.
- La fecha de creacion (2026-11-10) y el reducido numero de descargas (249) y likes (1) indican poca validacion por parte de la comunidad.

## Enlaces

- Artefacto en Hugging Face: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-UD-IQ2_XS-NInfer-v3
- Modelo base GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Tabla n-gram: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-ngram-table-NInfer-v3
- Tabla n-gram alternativa (Edge0, FP8): https://huggingface.co/WaveCut/Edge0-ngram-table-FP8-NInfer-v3
- Drafter DFlash2 (incoai): https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Drafter DFlash2 en GGUF (nazeshinjite): https://huggingface.co/nazeshinjite/Qwen3.8-Flash-Next-DFlash2-GGUF
- Motor NInfer: https://github.com/Neroued/ninfer
- Rama NInfer-all: https://github.com/iamwavecut/ninfer-all
- Release 2026-11-09.2: https://github.com/iamwavecut/ninfer-all/releases/tag/2026-11-09.2
- Commit del conversor (split release): https://github.com/iamwavecut/ninfer-all/commit/2531b663a
- Commit de lectura de tablas n-gram: https://github.com/iamwavecut/ninfer-all/commit/57395b20b4ee9c4ac792146d82ffac6b28396a9b
