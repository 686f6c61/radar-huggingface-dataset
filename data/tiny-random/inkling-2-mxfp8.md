# tiny-random/inkling-2-mxfp8

## Resumen

`tiny-random/inkling-2-mxfp8` es un checkpoint diminuto de inicialización aleatoria derivado de `thinkingmachines/Inkling-2-Small-MXFP8`, pensado exclusivamente para pruebas y depuración de infraestructura de inferencia. No es un modelo entrenado: sus pesos son aleatorios, por lo que no produce salidas coherentes. Su valor es que reproduce fielmente la estructura del modelo original (arquitectura MoE con atención híbrida, torre de visión y capas MTP) en un tamaño manejable de 87,6 millones de parámetros y 0,2 GB de repositorio.

El modelo original del que deriva, Inkling-2-Small-MXFP8, es un modelo multimodal image-text-to-text de tipo Mixture of Experts con cuantización MXFP8 en las capas de expertos, según se deduce de la model card. Este repositorio tiny replica esa estructura con 12 capas de decoder, 48 expertos enrutados (8 por token) y ciclo de atención de 5 ventanas deslizantes más 1 atención global, manteniendo el vocabulario de 201.024 tokens y las cabezas Q/KV del original.

La relevancia práctica es acotada pero concreta: permite validar integraciones de SGLang (soporte en el PR #51926, aún no publicado en wheel estable), probar pipelines multimodales con endpoints compatibles con OpenAI, verificar parsers de razonamiento y tool calling (`inkling` y `inkling2`) y depurar configuraciones de tensor/pipeline parallelism sin necesidad de aprovisionar los 622,80 GB que ocupa el checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Mixture of Experts (MoE) con atención híbrida SWA/global y torre de visión; incluye capas MTP (multi-token prediction) |
| Parametros totales | 87.651.136 (dato real de safetensors) |
| Parametros activos | no disponible (el original enruta 8 de 384 expertos; este tiny enruta 8 de 48) |
| Longitud de contexto | no disponible como valor nominal; el ejemplo de serving usa `--context-length 2048` |
| Tipos de cuantizacion | MXFP8 (bloques [32, 32], escala UE8M0) en capas de expertos; BF16 y F32 en otros tensores. El ejemplo de serving usa `--dtype bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` 146,2 MB y `mtp.safetensors` 9,0 MB) |

## Arquitectura y entrenamiento

La estructura replica la del modelo base con dimensiones reducidas. Consta de 12 capas de decoder (frente a 48 del original) con un bloque de atención residual de 6, ciclo de atención de 5 ventanas deslizantes más 1 global (dos ciclos completos), 48 expertos enrutados con 8 activos por token (frente a 384 en el original) y 12 capas de expertos en MXFP8 con bloques de cuantización [32, 32] y escala UE8M0. Las dimensiones ocultas son 128 para hidden y 128 para expert width (frente a 4.608 y 2.304), con 8 cabezas Q, 4 cabezas KV y dimensión de cabeza 128. El vocabulario es de 201.024 tokens con embeddings no atados.

Incluye una torre de visión de 4 capas y anchura 32 (frente a 23 capas y 1.024 de anchura), y 5 capas MTP con block size 8 y Markov rank 8, con taps de features en las posiciones 5 y 12. El checkpoint pesa 155,14 MB en dos ficheros, frente a 622,80 GB en 49 ficheros del original. No hay entrenamiento: la model card indica explícitamente que es un modelo de inicialización aleatoria generado por GPT-6.1-Sol, sin datos de preentrenamiento, RLHF ni DPO asociados. La innovación técnica relevante es estructural, no de rendimiento: permite ejercitar el grafo completo de SGLang (atención híbrida, MoE, visión, MTP, parsers de razonamiento y tool calling) con un coste de memoria mínimo.

## Capacidades

- Generación de texto: nominalmente soportada por la arquitectura, pero sin utilidad real al ser pesos aleatorios.
- Razonamiento y modo thinking: el serving declara `--reasoning-parser inkling`, lo que confirma que la arquitectura soporta un canal de razonamiento separado.
- Tool calling / function calling: soportado vía `--tool-call-parser inkling2` en SGLang.
- Multimodalidad image-text-to-text: entrada de imágenes como parte `image_url` con data URL en el endpoint compatible con OpenAI.
- Predicción multi-token (MTP): 5 capas MTP con block size 8, pensadas para decodificación especulativa.
- Capacidades multilingües: no disponible.
- Capacidades de agente y multi-step reasoning: no disponible como capacidad verificada; la presencia de parsers de razonamiento y tool calling sugiere soporte en el modelo base.

## Casos de uso

- Validación de integraciones SGLang: sirve para probar el PR #51926 antes de que se publique un wheel estable, verificando que el arranque, el parseo de configuración y el endpoint OpenAI funcionan sin descargar 622,80 GB.
- Pruebas de pipelines multimodales en CI: permite ejecutar tests end-to-end de envío de imágenes en formato data URL y comprobar la serialización de mensajes con partes `text` e `image_url` en un entorno de integración continua ligero.
- Depuración de tensor y pipeline parallelism: con `--tp 2 --ep 2` se puede verificar el reparto de expertos y cabezas entre GPUs sobre una estructura MoE realista pero de 155 MB.
- Verificación de parsers de tool calling y razonamiento: útil para comprobar que `inkling` e `inkling2` extraen correctamente bloques de razonamiento y llamadas a herramientas en respuestas, aunque el contenido sea aleatorio.
- Desarrollo de harnesses de evaluación: permite construir y depurar el código que lanza benchmarks o tests de regresión contra un servidor compatible con OpenAI antes de apuntarlo al modelo real.
- Pruebas de configuración de memoria y CUDA graphs: el ejemplo desactiva CUDA graphs para decode y prefill y fija `--mem-fraction-static 0.2`, lo que sirve para validar configuraciones de despliegue en entornos con recursos limitados.
- Smoke tests de carga de safetensors MXFP8: valida que el runtime lee correctamente tensores F8_E4M3 con escala UE8M0 y bloques [32, 32] sin necesidad de pesos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo de pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 para los pesos (155,14 MB de safetensors), más overhead de activaciones y del runtime de SGLang.
- GPU recomendadas: cualquier GPU con soporte de las extensiones requeridas por SGLang; el ejemplo oficial usa `--tp 2 --ep 2`, es decir, dos procesos sobre dos GPUs.
- Cabe en GPU de consumo: sí, con amplio margen, incluidas RTX 4090, RTX 3090 y GPUs de gama media con suficiente memoria para el runtime.
- Opciones de despliegue: SGLang (verificado, requiere instalar desde el PR #51926 con `SGLANG_BUILD_RUST_EXTS=none`); llama.cpp, Ollama y TGI no están indicados en la información disponible.
- Latencia y throughput: no disponible. El ejemplo fija `--context-length 2048`, `--mem-fraction-static 0.2`, `--attention-backend fa4` y `--watchdog-timeout 1800`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Proposito | Licencia |
|---|---|---|---|---|---|
| tiny-random/inkling-2-mxfp8 | 87,65 M | no disponible (ejemplo: 2048) | safetensors MXFP8/BF16 | Pruebas y depuracion | no disponible |
| thinkingmachines/Inkling-2-Small-MXFP8 | no disponible (checkpoint de 622,80 GB) | no disponible | safetensors MXFP8 | Modelo multimodal MoE de produccion | no disponible |
| Otros modelos tiny-random de Hugging Face | variable | no disponible | safetensors | Pruebas de runtime | variable |

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a estructura y propósito.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado y no genera texto, código ni descripciones de imágenes coherentes. No debe usarse en producción ni evaluarse por calidad.
- Sesgos: no evaluables, al no existir datos de entrenamiento asociados.
- Alucinación: irrelevante en la práctica porque toda salida es ruido estadístico; no debe interpretarse ninguna respuesta como información.
- Contexto e idiomas: no se documentan longitudes de contexto ni coberturas lingüísticas; el valor 2048 del ejemplo es solo una configuración de serving.
- Licencia: no disponible. Antes de cualquier uso, debe verificarse la licencia del modelo base `thinkingmachines/Inkling-2-Small-MXFP8`, ya que este derivado no la declara.
- Dependencia de software no publicado: el soporte de SGLang vive en el PR #51926 y requiere instalación desde el repositorio, con `SGLANG_BUILD_RUST_EXTS=none`; no hay wheel estable.
- Configuración específica: el ejemplo desactiva CUDA graphs para decode y prefill, lo que puede afectar al rendimiento si se traslada tal cual a otros modelos.
- Repositorio generado automáticamente por GPT-6.1-Sol, con 0 descargas y 0 likes en el momento de la consulta; sin garantías de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/tiny-random/inkling-2-mxfp8
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- PR de SGLang con soporte Inkling 2: https://github.com/sgl-project/sglang/pull/51926
- Script de creación: `.meta/create_model.py` (en el repositorio)
- Estructura del modelo: `.meta/model.log` (en el repositorio)
- Entorno de generación: `.meta/env.json` (en el repositorio)
