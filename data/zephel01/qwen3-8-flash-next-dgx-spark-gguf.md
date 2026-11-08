# zephel01/Qwen3.8-Flash-Next-DGX-Spark-GGUF

## Resumen

Qwen3.8-Flash-Next-DGX-Spark-GGUF es una cuantización GGUF del modelo Qwen3.8-Flash-Next, publicada por el usuario zephel01 (autor del motor de inferencia Abyss) y optimizada específicamente para ejecutarse en una única NVIDIA DGX Spark con GB10 y 128 GB de memoria unificada. El modelo base, desarrollado por el equipo Qwen, es un transformer de tipo mezcla de expertos (MoE) de aproximadamente 176.900 millones de parámetros totales, de los cuales solo unos 6.000 millones están activos por token, lo que permite un rendimiento alto con un coste computacional por token relativamente bajo.

El interés de esta publicación concreta reside en la cuantización: mantiene los 512 expertos del modelo original sin poda alguna y comprime los pesos hasta un archivo de 86,9 GB, con una divergencia KL de 0,083 frente al modelo de referencia en formato NVFP4 (0,176 en japonés), claramente mejor que la alternativa de referencia de unsloth (UD-IQ3_XXS, 82,0 GB, KL de 0,154 y 0,317 respectivamente). El autor reporta velocidades de decodificación de 55,8 tok/s tras un prompt de 4K y 53,4 tok/s tras uno de 32K, medidas en hardware real con el motor Abyss y decodificación especulativa MTP activada.

La ficha corresponde a una versión BETA medida entre el 5 y el 7 de noviembre de 2026 en una DGX Spark alquilada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el modelo base se distribuye bajo licencia qwen-community-1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 512 expertos; arquitectura GGUF `qwen4exp` |
| Parametros totales | 176.943.899.520 (~176,9 B) |
| Parametros activos | ~6 B por token (125 B main + 51 B n-gram segun fuente secundaria) |
| Longitud de contexto | Hasta 500k tokens segun el repositorio de referencia para DGX Spark; no confirmado en la model card del GGUF |
| Tipos de cuantizacion | GGUF cuantizado (formato propietario del autor, "16G64G"); referencia comparativa unsloth UD-IQ3_XXS |
| Idiomas soportados | No disponible en la model card; se mencionan evaluaciones en ingles, chino y japones |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | GGUF, 3 shards (`-00001-of-00003.gguf` a `-00003-of-00003.gguf`), con `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mezcla de expertos con 512 expertos y aproximadamente 176,9 mil millones de parámetros totales, de los cuales alrededor de 6 mil millones se activan por token. La model card del GGUF no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esa información correspondería a la model card del modelo original de Qwen, que no se ha proporcionado. La fuente secundaria del repositorio de GitHub menciona una arquitectura híbrida con una parte "main" de 125 B y una parte "n-gram" de 51 B, además de decodificación especulativa MTP (multi-token prediction) integrada.

La innovación técnica más destacable de esta publicación es el proceso de cuantización: se conservan los 512 expertos sin poda, y la tabla de embeddings por capa (28,8 GB) se lee desde SSD unas pocas filas por token, lo que permite que el archivo completo quepa en los 128 GB de memoria unificada de la DGX Spark. La cuantización se realizó con la herramienta trench-gguf del propio autor, partiendo de los pesos NVFP4 de magnitudedev para los expertos y de los tensores no-expertos de unsloth. El motor Abyss soporta decodificación especulativa MTP y empaquetado previo del GGUF mediante `iq_pack.py`.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline `text-generation`.
- Razonamiento y respuesta a instrucciones, heredado del modelo base Qwen3.8-Flash-Next.
- Capacidades multilingües: la model card documenta evaluaciones en inglés, chino y japonés, con una sección completa en japonés y métricas KL específicas para ese idioma.
- Decodificación especulativa MTP (multi-token prediction) soportada por el motor Abyss.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de contexto largo: hasta 500k tokens según el repositorio de referencia para DGX Spark.
- No se documentan en la información disponible capacidades de visión, audio, tool calling ni agentes; no disponible.

## Casos de uso

- Inferencia local de un modelo de ~177 B en hardware de escritorio de gama alta: la DGX Spark con 128 GB de memoria unificada permite ejecutar un MoE de este tamaño manteniendo los 512 expertos, algo inviable en GPUs de consumo convencionales.
- Asistente conversacional de contexto largo: con hasta 500k tokens de ventana (según la fuente de referencia), adecuado para analizar documentos extensos o historiales de conversación prolongados sin truncar.
- Procesamiento de documentación en japonés: la model card incluye métricas KL específicas para japonés (0,176), lo que indica que la cuantización preserva razonablemente el rendimiento en ese idioma.
- Despliegue en entornos con restricciones de memoria de GPU: el diseño que lee la tabla de embeddings desde SSD permite ajustar el modelo a 128 GB de memoria unificada, útil en estaciones de trabajo con GB10.
- Evaluación e investigación de técnicas de cuantización: el repositorio sirve como referencia reproducible para comparar KL frente a otras cuantizaciones (unsloth UD-IQ3_XXS) en tareas de código, inglés, chino y japonés.
- Prototipado con motores alternativos: el archivo es legible tanto por Abyss como por llama.cpp (arquitectura `qwen4exp`), lo que facilita probar distintos backends sobre los mismos pesos.
- Benchmarking de hardware: el autor proporciona un comando (`./abyss.sh --bench --deep`) y una plantilla de issue para que otros usuarios reporten velocidades en su propia DGX Spark.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de la cuantización y velocidad medidas por el autor:

| Metrica | Este GGUF | unsloth UD-IQ3_XXS (referencia) |
|---|---|---|
| Tamano de descarga | 86,9 GB | 82,0 GB |
| Expertos conservados | 512 (todos) | 512 (todos) |
| KL (10 secuencias) | 0,083 | 0,154 |
| KL en japones | 0,176 | 0,317 |
| Decodificacion en DGX Spark, prompt 4K | 55,8 tok/s | no disponible |
| Decodificacion tras prompt 32K | 53,4 tok/s | no disponible |
| Procesamiento de prompt (4K-64K) | ~1.040-1.100 tok/s | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Memoria: el archivo completo (86,9 GB) cabe en los 128 GB de memoria unificada de una NVIDIA DGX Spark (GB10); la tabla de embeddings por capa (28,8 GB) se lee desde SSD unas pocas filas por token.
- GPU recomendada: NVIDIA DGX Spark / ASUS GX10 con GB10 (aarch64, sm_121). No se documenta soporte para otras GPUs en la información disponible.
- GPU de consumo: no se indica compatibilidad con RTX 4090 u otras GPUs de consumo; el tamaño del archivo y el requisito de memoria unificada lo hacen inviable en configuraciones típicas de 24 GB de VRAM.
- Motores de despliegue: Abyss (soporte nativo de DGX Spark, con empaquetado previo mediante `iq_pack.py --fast` y flag `--glm-pack`) y llama.cpp (arquitectura `qwen4exp`). El repositorio de GitHub de referencia menciona también vLLM con decodificación especulativa MTP y caché de prefijos.
- Rendimiento medido: 55,8 tok/s de decodificación tras prompt de 4K y 53,4 tok/s tras 32K con Abyss v1.3.119 y MTP activado; ~1.040-1.100 tok/s de procesamiento de prompt entre 4K y 64K con Abyss v1.3.113.
- Latencia: no disponible de forma explícita más allá de los valores de throughput anteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-DGX-Spark-GGUF (este) | ~176,9 B totales, ~6 B activos | Hasta 500k (segun fuente secundaria) | qwen-community-1.0 | GGUF, 86,9 GB, 3 shards |
| Qwen3.8-Flash-Next-16G64G-GGUF (mismo autor) | ~176,9 B totales | No disponible | qwen-community-1.0 | GGUF, mismos archivos byte a byte que este repositorio |
| unsloth UD-IQ3_XXS (referencia de cuantizacion) | ~176,9 B totales | No disponible | No disponible | GGUF, 82,0 GB |
| Qwen3.8-Flash-Next (modelo base) | ~176,9 B totales, ~6 B activos | No disponible en la informacion | qwen-community-1.0 | Pesos originales en Hugging Face |

No se dispone de datos de benchmarks comparativos de rendimiento (calidad en tareas estándar) entre estos modelos en la información proporcionada; la única comparación cuantitativa disponible es la divergencia KL frente al modelo NVFP4 de referencia.

## Limitaciones y advertencias

- Versión BETA: las mediciones se realizaron en una DGX Spark alquilada entre el 5 y el 7 de noviembre de 2026; el rendimiento puede variar con versiones más recientes del motor Abyss.
- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad; no disponible.
- El soporte de idiomas no está listado formalmente en la model card; las evaluaciones se limitan a inglés, chino y japonés, sin datos sobre castellano u otros idiomas.
- La licencia qwen-community-1.0 puede imponer restricciones al uso comercial; debe consultarse el texto completo en el enlace de licencia del modelo base antes de un despliegue en producción.
- El modelo está diseñado específicamente para DGX Spark (GB10); no se documenta compatibilidad con otras GPUs, lo que limita su portabilidad.
- El rendimiento depende en gran medida del motor Abyss y de la decodificación especulativa MTP; con llama.cpp u otros motores los valores de throughput pueden diferir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- La lectura de la tabla de embeddings desde SSD introduce dependencia del almacenamiento y puede afectar a la latencia según el hardware de disco.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-DGX-Spark-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio hermano (mismos archivos): https://huggingface.co/zephel01/Qwen3.8-Flash-Next-16G64G-GGUF
- Coleccion de GGUFs del autor: https://huggingface.co/collections/zephel01/qwen38-flash-next-gguf
- Motor Abyss: https://github.com/zephel01/Abyss
- Documentacion de Abyss para DGX Spark: https://github.com/zephel01/Abyss/blob/main/docs/DGX-SPARK.md
- Herramienta de cuantizacion trench-gguf: https://github.com/zephel01/trench-gguf
- Pesos NVFP4 de los expertos (magnitudedev): https://huggingface.co/magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF
- Repositorio de referencia para DGX Spark con vLLM: https://github.com/blazux/qwen3.8-Flash-DGX
- Plantilla de benchmark en Abyss: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.8-Flash-Next+DGX-Spark+on+GB10
