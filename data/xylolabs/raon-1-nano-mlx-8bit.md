# Xylolabs/Raon-1-nano-MLX-8bit

## Resumen

Raon-1-nano MLX 8-bit es una cuantización de 8 bits del modelo KRAFTON/Raon-1-nano, publicada por Xylolabs para su ejecución sobre el framework MLX de Apple en hardware con silicio de la serie M. El modelo base es un transformer de aproximadamente 3.130 millones de parámetros (3,13 B) orientado a generación de texto y conversación, con soporte para coreano e inglés y una ventana de contexto declarada de 256K tokens. Esta variante elimina el bloque MTP (multi-token prediction) del modelo original y aplica una receta de cuantización afín de 8 bits con tamaño de grupo 64 a todas las capas lineales y a ambas tablas de embedding.

La relevancia de esta ficha reside en que permite ejecutar un modelo de 3 B con contexto muy largo en equipos de sobremesa de Apple sin GPU dedicada, manteniendo una fidelidad numérica alta respecto al modelo en BF16: la divergencia KL media frente a BF16 es de 0,001343 en WikiText-2 y la coincidencia top-1 del 97,14 %, con un tamaño de pesos de 3,36 GB. Frente a la cuantización de 4 bits del mismo autor (KL 0,024454, top-1 91,26 %) y a la GPTQ de 4 bits de KRAFTON (KL 0,107279, top-1 80,32 %), la versión de 8 bits es la opción de mayor calidad dentro del ecosistema MLX para este modelo.

El modelo conserva el modo de razonamiento (thinking) activado por defecto, lo que permite desactivarlo mediante configuración de plantilla de chat para respuestas directas. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque el código del modelo procede de KRAFTON y se distribuye sin modificaciones junto con sus avisos legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Raon-1-nano de KRAFTON; código `raon_mlx_model.py`); incluye atención MLA (multi-head latent attention) según las proyecciones key/value mencionadas en la model card; bloque MTP eliminado en esta conversión |
| Parametros totales | 3.130.797.136 (3,13 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (según tabla de hardware de la model card) |
| Tipos de cuantizacion | MLX 8-bit afín, group size 64, en capas lineales y tablas de embedding; proyecciones key/value de MLA y otros tensores en BF16; A_log, dt_bias y mHC eta en float32. Existe también una variante MLX 4-bit del mismo autor |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 3,4 GB; pesos cuantizados de 3,36 GB |

## Arquitectura y entrenamiento

La model card de esta conversión no detalla la arquitectura interna ni el proceso de entrenamiento del modelo base. Los datos disponibles indican que se trata de un transformer con atención MLA (las proyecciones key y value de MLA se mantienen en BF16 durante la cuantización), con un bloque de predicción multi-token (MTP) que ha sido eliminado en esta versión MLX. El modelo incluye un modo de razonamiento (thinking) que se activa por defecto. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La conversión realizada por Xylolabs aplica cuantización afín de 8 bits con tamaño de grupo 64 a todas las capas lineales y a ambas tablas de embedding (la embedding de tokens hace también de LM head). El resto de tensores se mantiene en BF16, salvo A_log, dt_bias y el parámetro eta del mecanismo mHC, que se conservan en float32. El código del modelo es el `raon_mlx_model.py` original de KRAFTON, incluido sin cambios.

## Capacidades

- Generación de texto y conversación multi-turno en coreano e inglés.
- Razonamiento con modo thinking activado por defecto; puede desactivarse con `--chat-template-config '{"enable_thinking": false}'`.
- Contexto largo de hasta 256K tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Ejecución nativa en MLX sobre Apple Silicon mediante `mlx-lm`.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar diálogos multi-turno con hasta 256K tokens de contexto en equipos Apple Silicon con 36 GB o más de memoria unificada, sin necesidad de GPU dedicada.
- Procesamiento de documentos largos en local: resúmenes, extracción de información y preguntas sobre contratos, informes o código fuente que superen decenas de miles de tokens, aprovechando la ventana de 256K.
- Atención al cliente en coreano e inglés: despliegue de un chatbot bilingüe sobre infraestructura Apple, con la fidelidad de la cuantización de 8 bits (97,14 % de coincidencia top-1 frente a BF16) para mantener la calidad conversacional.
- Prototipado y evaluación de modelos en estaciones de trabajo Mac: investigadores que necesiten probar un modelo de 3 B con contexto largo sin depender de clústeres de GPU, usando `mlx_lm.generate` y `mlx_lm.chat`.
- Generación de texto asistida con razonamiento explícito: tareas que se benefician del modo thinking (análisis, resolución de problemas paso a paso) y que pueden alternar a respuestas directas desactivando dicho modo.
- Aplicaciones de privacidad estricta: inferencia completamente local en hardware de sobremesa, sin envío de datos a servicios externos, adecuada para entornos con requisitos de confidencialidad.
- Base para ajuste fino o experimentación: al estar en Apache 2.0 y en formato MLX, sirve como punto de partida para prototipos sobre el ecosistema de Apple.

## Benchmarks y rendimiento

La model card proporciona métricas de fidelidad de cuantización frente al modelo en BF16 (divergencia KL y coincidencia top-1), no benchmarks de tareas estándar como MMLU o HumanEval.

| Cuantización | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Verificación 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 8-bit | 3,36 GB | 0,001343 | 97,14 % | 0,001630 | 97,75 % | 0,001125 | 97,43 % | 6/7 (BF16: 6/7) |
| MLX 4-bit | 2,18 GB | 0,024454 | 91,26 % | 0,037121 | 91,12 % | 0,021706 | 91,31 % | 6/7 (BF16: 6/7) |
| KRAFTON 4-bit GPTQ | 1,81 GB | 0,107279 | 80,32 % | 0,130774 | 82,63 % | 0,098860 | 81,16 % | 6/7 (BF16: 6/7) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: pesos de 3,36 GB en 8 bits; el repositorio ocupa 3,4 GB. La memoria total necesaria depende de la longitud de contexto (hasta 256K tokens) y de la caché KV.
- Hardware objetivo: Apple Silicon con memoria unificada. La model card lista Mac Studio M5 Max (32 y 40 núcleos de GPU, 36-128 GB) y Mac Studio M5 Ultra (80 núcleos de GPU, 96-512 GB), todos con contexto de 256K.
- GPU dedicadas (A100, H100, RTX 4090): no se documentan en la información disponible; el formato es específico de MLX.
- Despliegue: `mlx-lm` 0.32.2 con `mlx` 0.32.4 y `transformers` 5.20.2, usando `mlx_lm.generate` y `mlx_lm.chat` con `--trust-remote-code`. No se indican opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Calidad de cuantización (KL WikiText-2 / top-1) |
|---|---|---:|---|---|---|
| Xylolabs/Raon-1-nano-MLX-8bit | 3,13 B | 256K | MLX safetensors 8-bit | Apache 2.0 | 0,001343 / 97,14 % |
| Xylolabs Raon-1-nano MLX 4-bit | 3,13 B (base) | 256K | MLX safetensors 4-bit | Apache 2.0 | 0,024454 / 91,26 % |
| KRAFTON Raon-1-nano 4-bit GPTQ | 3,13 B (base) | no disponible | GPTQ 4-bit | Apache 2.0 (según modelo base) | 0,107279 / 80,32 % |
| KRAFTON/Raon-1-nano (BF16) | 3,13 B | no disponible | safetensors BF16 | Apache 2.0 | referencia (BF16) |

No se dispone de datos de benchmarks de tareas que permitan comparar con modelos de otros fabricantes de tamaño similar.

## Limitaciones y advertencias

- Idiomas limitados a coreano e inglés; el rendimiento en castellano no está documentado.
- No se han publicado evaluaciones de sesgos, toxicidad o alucinación en la información disponible.
- El modo thinking está activado por defecto, lo que incrementa los tokens generados y la latencia si no se desactiva explícitamente.
- La cuantización de 8 bits introduce una divergencia pequeña pero no nula respecto a BF16 (KL 0,001343 en WikiText-2); para aplicaciones sensibles a la fidelidad exacta conviene validar contra el modelo original.
- El bloque MTP ha sido eliminado en esta conversión, por lo que no se dispone de la decodificación multi-token especulativa del modelo base.
- Requiere `--trust-remote-code` por el código de modelo personalizado de KRAFTON; conviene revisar dicho código antes de desplegarlo en producción.
- El modelo está empaquetado para MLX y Apple Silicon; no es directamente portable a CUDA sin reconversión.
- Aunque la licencia es Apache 2.0, el código del modelo y los avisos de KRAFTON deben conservarse según lo indicado en `NOTICE` y `LICENSES/`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Raon-1-nano-MLX-8bit
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Versión MLX de KRAFTON: https://huggingface.co/KRAFTON/Raon-1-nano-mlx
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio de la receta de cuantización de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
