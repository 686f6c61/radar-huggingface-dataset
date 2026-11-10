# WaveCut/Qwen3.8-Flash-Next-UD-IQ3_XXS-NInfer-v3

## Resumen

Qwen3.8-Flash-Next es un modelo de mezcla de expertos (MoE) de 125.000 millones de parametros desarrollado por el equipo Qwen (Alibaba), del que se activan aproximadamente 6.000 millones de parametros por token. La ficha que nos ocupa no es el modelo original, sino un artefacto de inferencia empaquetado por WaveCut para el motor NInfer v3, derivado de la cuantizacion dinamica UD-IQ3_XXS publicada por Unsloth en formato GGUF. El objetivo de este artefacto es permitir ejecutar un modelo de este tamano en hardware de consumo, concretamente en una unica RTX 5090, mediante residencia de expertos en memoria de host o en disco.

El modelo combina atencion dispersa (QSA) en 12 capas con 36 capas Gated DeltaNet, una torre de vision para entrada de imagen y video, un bloque MTP (multi-token prediction) y un drafter DFlash2 de decodificacion especulativa. El artefacto incluye todos estos componentes en un unico fichero de 54,66 GiB, junto con una tabla n-gram separada que debe descargarse aparte. La relevancia actual reside en que demuestra la viabilidad de servir un MoE de 125B en una sola GPU consumer, a costa de depender de un motor no estandar (NInfer-all) distinto de llama.cpp, vLLM u Ollama.

La licencia es la Qwen Community License 1.0, que impone restricciones de uso comercial que conviene revisar antes de cualquier despliegue en produccion. El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida: 48 capas, 12 de atencion dispersa (QSA) y 36 Gated DeltaNet; bloque MTP y torre de vision |
| Parametros totales | 125.000 millones (125B) |
| Parametros activos | Aproximadamente 6.000 millones (6B) por token |
| Longitud de contexto | 32.768 tokens en los comandos de ejemplo del autor (no se especifica el maximo del modelo base) |
| Tipos de cuantizacion | Mixta por tensor: IQ2_S, IQ3_XXS, IQ4_XS, IQ4_NL, Q2_0, Q6_K, Q8_0, BF16, FP32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como "other") |
| Formato de pesos | .ninfer (artefacto propietario de NInfer v3); derivado de GGUF de Unsloth |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de 48 capas con 512 expertos enrutados por capa, de los cuales 10 se activan por token, lo que resulta en unos 6B parametros activos sobre 125B totales. La atencion no es uniforme: 12 capas emplean atencion dispersa (QSA) con proyecciones Q6_K e indexador en BF16, mientras que 36 capas usan Gated DeltaNet con proyecciones Q6_K (una capa con query, key, value y gate en Q8_0). Los expertos compartidos usan down en Q8_0 y gate/up en Q6_K (47 capas) o Q8_0 (1 capa). El router se mantiene en BF16.

El artefacto incorpora componentes adicionales orientados a inferencia de baja latencia: un bloque MTP (multi-token prediction) de 2,8 GB en Q8_0, un drafter DFlash2 de incoai en Q4_0 (339 MB) para decodificacion especulativa, y una tabla n-gram (IQ4_NL) publicada como repositorio separado que el motor usa para decodificacion asistida. La torre de vision se incluye como mmproj en BF16 (0,9 GB) con las configuraciones de preprocesador de imagen y video del checkpoint original. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento multietapa, con soporte de modo "thinking" heredado de la familia Qwen3.
- Procesamiento de imagen y video mediante la torre de vision incluida (pipeline image-text-to-text).
- Generacion de codigo y matematicas, presumiblemente por herencia del modelo base (no verificado con benchmarks en esta ficha).
- Decodificacion especulativa mediante drafter DFlash2 y prediccion multi-token (MTP), orientada a reducir latencia.
- Salida estructurada (structured output) segun la documentacion del motor NInfer-all.
- Reutilizacion de prefijo de prompt (prompt-prefix reuse) para conversaciones multi-turno.
- Hasta ocho peticiones concurrentes segun el autor del artefacto.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.

## Casos de uso

- Asistencia conversacional multi-turno con contexto largo: los 32.768 tokens de contexto configurados en los ejemplos permiten mantener historiales extensos; la reutilizacion de prefijo reduce el coste de reprocesar el historial en cada turno.
- Analisis de documentos con imagenes: la torre de vision en BF16 permite extraer informacion de capturas, diagramas o fotogramas de video junto con el texto, util para revision de contratos, informes o material tecnico escaneado.
- Generacion de codigo en estacion de trabajo local: con residencia de expertos en host y una RTX 5090, un desarrollador puede ejecutar un MoE de 125B sin depender de la nube, manteniendo el codigo en su maquina.
- Prototipado de agentes con salida estructurada: el soporte de structured output del motor facilita encadenar llamadas con esquemas JSON validables en pipelines de automatizacion.
- Investigacion sobre decodificacion especulativa: el artefacto incluye drafter DFlash2 y MTP, lo que lo convierte en un banco de pruebas para medir aceleraciones de decodificacion sobre un MoE grande en hardware consumer.
- Despliegue en dos GPU de 32 GB: el modo `--devices 0,1` reparte todos los expertos en memoria de dispositivo con una etapa de pipeline por GPU, adecuado para servidores pequenos con dos aceleradores.
- Evaluacion de cuantizaciones mixtas: al conservar los bloques ggml byte a byte por tensor, sirve para comparar calidad y velocidad entre tipos de cuantizacion por capa y proyeccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto completo ocupa 54,66 GiB. Con residencia de expertos en host o disco, la VRAM necesaria se reduce a la cache de expertos mas frecuentes, las capas no expertas y el contexto; el autor no publica cifras exactas de VRAM por configuracion.
- GPU recomendadas: RTX 5090 (etiqueta explicita del autor) para el modo de una sola GPU; dos GPU de 32 GB (por ejemplo, RTX 5090 o A100 40 GB en configuracion equivalente) para el modo `--devices 0,1` con todos los expertos en dispositivo.
- Cabe en GPU consumer: si, en una RTX 5090 con `--expert-residency host` o `--expert-residency disk`, a costa de depender del ancho de banda PCIe y de la RAM del sistema.
- Opciones de despliegue: exclusivamente NInfer-all (rama `master`), release 2026-11-09.2 o posterior. Las builds estandar de NInfer rechazan el fichero. No es compatible con llama.cpp, vLLM, Ollama ni TGI en el formato .ninfer. Existe imagen Docker en el repositorio de iamwavecut/ninfer-all.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato / motor | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (UD-IQ3_XXS, NInfer v3) | 125B | ~6B | 32.768 (configurado en ejemplos) | .ninfer / NInfer-all | qwen-community-license-1.0 |
| Qwen3.8-Flash-Next (UD-IQ3_XXS, GGUF de Unsloth) | 125B | ~6B | no disponible | GGUF / llama.cpp | qwen-community-license-1.0 |
| Qwen3.8-Flash-Next (DFlash2 drafter, incoai) | no disponible | no disponible | no disponible | GGUF / no disponible | no disponible |

La comparativa con modelos de otras familias (por ejemplo, otros MoE de aproximadamente 100B con unos 6B activos) no esta disponible en la informacion proporcionada. La diferencia principal frente al GGUF de Unsloth es el empaquetado: el artefacto NInfer integra vision, MTP, drafter y metadatos en un solo fichero y requiere un motor especifico, mientras que el GGUF original esta pensado para llama.cpp.

## Limitaciones y advertencias

- Dependencia de un motor no estandar: el fichero solo lo ejecuta NInfer-all, no las builds estandar de NInfer ni llama.cpp, vLLM, Ollama o TGI. Esto limita la portabilidad y ata el despliegue al mantenimiento de un proyecto de un unico autor.
- Requiere descargar un segundo artefacto (la tabla n-gram) de un repositorio distinto; sin ella el motor no dispone de la decodificacion asistida por n-gramas.
- La tabla n-gram incluida en este artefacto se convirtio a partir del shard del release UD-IQ2_XS, no del propio UD-IQ3_XXS; el autor afirma que el digest coincide con el de la tabla publicada, pero es un punto a verificar en produccion.
- Licencia Qwen Community License 1.0: impone condiciones adicionales al uso comercial que deben revisarse antes de desplegar el modelo en un producto; no es una licencia permisiva tipo Apache 2.0.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para este artefacto concreto.
- Idiomas soportados no documentados en esta ficha; no se puede garantizar el rendimiento en castellano sin evaluacion propia.
- El rendimiento real depende criticamente del modo de residencia de expertos: con `--expert-residency disk` la latencia puede degradarse de forma notable por el streaming desde almacenamiento.
- La cuantizacion mixta agresiva (IQ2_S e IQ3_XXS en la mayoria de expertos) degrada la calidad respecto al modelo en BF16; no se han publicado mediciones de esa perdida.
- Repositorio sin descargas ni interacciones registradas en el momento de la consulta: no hay evidencia de uso en produccion por terceros.
- El contexto de 32.768 tokens es el valor de los comandos de ejemplo, no necesariamente el maximo soportado por el modelo base.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-UD-IQ3_XXS-NInfer-v3
- Tabla n-gram: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-ngram-table-NInfer-v3
- GGUF base de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor NInfer: https://github.com/Neroued/ninfer
- NInfer-all: https://github.com/iamwavecut/ninfer-all
- Release 2026-11-09.2: https://github.com/iamwavecut/ninfer-all/releases/tag/2026-11-09.2
- Commit del conversor: https://github.com/iamwavecut/ninfer-all/commit/2531b663a
- Drafter DFlash2 (incoai): https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Drafter DFlash2 en GGUF Q4_0: https://huggingface.co/nazeshinjite/Qwen3.8-Flash-Next-DFlash2-GGUF
