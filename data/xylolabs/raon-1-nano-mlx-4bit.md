# Xylolabs/Raon-1-nano-MLX-4bit

## Resumen

Raon-1-nano MLX 4-bit es una cuantizacion del modelo base KRAFTON/Raon-1-nano, publicada por Xylolabs para su ejecucion en Apple Silicon mediante el framework MLX. El modelo original lo desarrolla KRAFTON y esta orientado a generacion de texto conversacional en coreano e ingles. Esta version concreta reduce los pesos a 4 bits con una receta de cuantizacion mixta (afin, tamano de grupo 64) que mantiene ciertas proyecciones en 6, 8 y BF16 bits para preservar la calidad, y elimina el bloque MTP (multi-token prediction) del modelo original.

El modelo cuenta con 3.130.797.136 parametros totales (aproximadamente 3,13 mil millones) y un repositorio de 2,2 GB. La model card declara una ventana de contexto de 256K tokens en la tabla de recomendacion de hardware, lo que lo situa en la categoria de modelos pequenos pero con contexto muy largo. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion de la propia licencia.

La relevancia de esta ficha radica en que es una publicacion muy reciente (26 de noviembre de 2026) sin descargas ni interacciones registradas, y en que su interes principal es tecnico: demuestra una receta de cuantizacion por capas que logra una divergencia KL muy inferior a la de la cuantizacion GPTQ de 4 bits del mismo modelo base, a costa de un tamano ligeramente mayor (2,18 GB frente a 1,81 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion MLA (multi-head latent attention) y proyecciones RDA; codigo `raon_mlx_model.py` de KRAFTON; sin bloque MTP |
| Parametros totales | 3.130.797.136 (aproximadamente 3,13 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (segun la tabla de recomendacion de hardware de la model card) |
| Tipos de cuantizacion | 4-bit MLX (afin, grupo 64) con capas mixtas en 6-bit, 8-bit y BF16; tensores auxiliares (A_log, dt_bias, mHC eta) en float32 |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con atencion MLA (multi-head latent attention), proyecciones RDA y un bloque de prediccion multi-token (MTP) que esta version cuantizada elimina deliberadamente. El codigo de modelado es el `raon_mlx_model.py` de KRAFTON, incluido sin modificaciones, lo que garantiza compatibilidad con la implementacion de referencia en MLX.

La cuantizacion aplicada por Xylolabs es de tipo mixto y por capas: las proyecciones gate y up del MLP y la tabla de embeddings por capa se cuantizan a 4 bits; las proyecciones down del MLP y las proyecciones de atencion y RDA a 6 bits; el embedding de tokens (tambien la LM head) y las proyecciones de entrada por capa a 8 bits; las proyecciones key y value de MLA y el resto de tensores se mantienen en BF16, salvo A_log, dt_bias y mHC eta, que quedan en float32. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en coreano e ingles.
- Modo de razonamiento (thinking) activado por defecto; se puede desactivar con `enable_thinking: false` en la configuracion de la plantilla de chat.
- Conversacion multi-turno mediante `mlx_lm.chat`.
- Generacion con prompts largos gracias a una ventana de contexto declarada de 256K tokens.
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de GPU dedicada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se ejecuta con `mlx_lm.chat` sobre Apple Silicon con memoria unificada, lo que permite desplegar un asistente privado sin conexion a servicios en la nube y sin enviar datos a terceros.
- Procesamiento de documentos largos en coreano e ingles: con una ventana declarada de 256K tokens, el modelo puede resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada, siempre que la memoria del equipo lo permita.
- Generacion de texto en aplicaciones de escritorio para macOS: al usar MLX nativo, se integra en apps Swift/Python que aprovechan la GPU unificada del Mac sin depender de CUDA.
- Prototipado rapido de pipelines de NLP bilingues ko/en: su tamano de 2,18 GB permite iterar en local con tiempos de carga bajos y sin coste de inferencia por token.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia practica para comparar recetas de cuantizacion mixta frente a GPTQ en un modelo de 3B, con metricas KL y top-1 publicadas.
- Educacion e investigacion: al ser Apache 2.0 y ejecutable en hardware de consumo, es adecuado para cursos y experimentos de ajuste fino o evaluacion de modelos pequenos con contexto largo.
- Generacion de respuestas en modo no-thinking para aplicaciones de baja latencia: al desactivar el razonamiento explicito se reduce el numero de tokens generados, lo que baja la latencia en tareas simples de clasificacion o respuesta directa.

## Benchmarks y rendimiento

La model card publica metricas de fidelidad de la cuantizacion frente al modelo BF16 (divergencia KL y acuerdo top-1), no benchmarks de tareas estandar como MMLU o HumanEval.

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Prueba de 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 8-bit | 3,36 GB | 0,001343 | 97,14% | 0,001630 | 97,75% | 0,001125 | 97,43% | 6/7 (BF16: 6/7) |
| MLX 4-bit | 2,18 GB | 0,024454 | 91,26% | 0,037121 | 91,12% | 0,021706 | 91,31% | 6/7 (BF16: 6/7) |
| KRAFTON 4-bit GPTQ | 1,81 GB | 0,107279 | 80,32% | 0,130774 | 82,63% | 0,098860 | 81,16% | 6/7 (BF16: 6/7) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 2,18 GB para los pesos en 4-bit; el consumo real depende de la longitud de contexto y del cache KV (MLA reduce el tamano del cache respecto a atencion estandar, pero no se publican cifras concretas).
- Hardware objetivo: Apple Silicon con memoria unificada. La model card recomienda el archivo de 8-bit (3,4 GB) para Mac Studio M5 Max y M5 Ultra con 36, 48, 64, 96, 128, 256 y 512 GB de memoria unificada, con contexto de 256K.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el formato MLX esta pensado para Apple Silicon y no se documenta su ejecucion en CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama alta con memoria unificada; no se documenta soporte para GPUs de consumo NVIDIA.
- Opciones de despliegue: `mlx-lm` (comandos `mlx_lm.generate` y `mlx_lm.chat`), con dependencias `mlx==0.32.4`, `mlx-lm==0.32.2` y `transformers==5.20.2`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| Xylolabs/Raon-1-nano-MLX-4bit | 3,13B | 256K (declarado) | MLX 4-bit mixta | 2,18 GB | Apache 2.0 | Hugging Face (0 descargas) |
| Xylolabs/Raon-1-nano-MLX-8bit | 3,13B | 256K (declarado) | MLX 8-bit | 3,36 GB | Apache 2.0 | Hugging Face |
| KRAFTON 4-bit GPTQ (del mismo base) | 3,13B | no disponible | GPTQ 4-bit | 1,81 GB | Apache 2.0 | Referenciado en la model card |
| KRAFTON/Raon-1-nano (BF16) | 3,13B | no disponible | BF16 | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de rendimiento en tareas que permitan contrastarlo con modelos de otros autores de tamano similar.

## Limitaciones y advertencias

- Solo soporta coreano e ingles de forma declarada; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- La cuantizacion a 4 bits introduce una divergencia medible: KL de 0,024454 en WikiText-2 y acuerdo top-1 del 91,26%, frente al 97,14% del 8-bit. Para tareas sensibles a la precision conviene usar la variante de 8 bits.
- Se ha eliminado el bloque MTP del modelo original, por lo que no se dispone de decodificacion especulativa nativa basada en ese bloque.
- El modo thinking esta activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explicitamente.
- Riesgo de alucinacion inherente a un modelo de 3B; no se publican evaluaciones de veracidad ni de sesgos.
- La ventana de 256K tokens es una declaracion de la model card; no se aportan mediciones de rendimiento en contextos largos (por ejemplo, degradacion por posicion).
- El modelo esta empaquetado exclusivamente para MLX y Apple Silicon; no es portable a CUDA sin reconversion.
- Publicacion con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente de las metricas.
- La licencia Apache 2.0 permite uso comercial, pero se deben conservar los avisos de `NOTICE` y `LICENSES/` relativos al codigo de KRAFTON.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Raon-1-nano-MLX-4bit
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Version MLX de referencia de KRAFTON: https://huggingface.co/KRAFTON/Raon-1-nano-mlx
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio de la receta de cuantizacion de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
