# Vontra/Qwen3.8-Flash-Next-MLX-6bit-MTP

## Resumen

Qwen3.8-Flash-Next-MLX-6bit-MTP es una conversión cuantizada a 6 bits en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, desarrollada por el usuario Vontra (bajo la marca TensorFold) y publicada en Hugging Face. El modelo original lo desarrolla el equipo Qwen de Alibaba y se distribuye bajo la licencia Qwen Community License 1.0. Esta versión concreta está pensada para ejecutarse en Apple Silicon mediante MLX, con un tamaño total de pesos de 158,08 GB y 179.999.981.459 parámetros.

La relevancia de esta conversión reside en dos aspectos técnicos: por un lado, preserva el bloque nativo de MTP (multi-token prediction) del modelo original, lo que permite decodificación especulativa integrada; por otro, mantiene en BF16 los módulos multimodales y las compuertas del router MoE, mientras cuantiza a 6 bits afines con grupo de 32 el resto de módulos elegibles. La arquitectura subyacente es `qwen4_exp`, un modelo de lenguaje causal con codificador de visión y mezcla dispersa de expertos, con una longitud de contexto configurada de 262.144 tokens.

El modelo resuelve el problema de desplegar un modelo de gran tamaño con capacidades de visión y lenguaje en hardware de Apple, manteniendo una velocidad de generación razonable gracias a la decodificación especulativa nativa. Según las mediciones del autor en un Apple M3 Studio, la velocidad mediana de generación pasa de 20,65 tokens/s con MTP desactivado a 25,94 tokens/s con MTP activado y tres tokens de borrador, con una tasa de aceptación del 73,55 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4_exp: transformer causal con codificador de visión, mezcla dispersa de expertos, Gated DeltaNet, Qwen Sparse Attention, residuales con compuerta ensanchados y embeddings hasheados de bigramas y trigramas |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurada) |
| Tipos de cuantizacion | 6 bits afín uniforme con grupo de 32; módulos multimodales y compuertas del router MoE en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license: other) |
| Formato de pesos | safetensors MLX (30 fragmentos, 3.747 tensores indexados, incluidos 76 del MTP) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es `qwen4_exp`, descrita por el autor de la conversión como un modelo de lenguaje causal con codificador de visión. La pila del lenguaje combina Gated DeltaNet, Qwen Sparse Attention, capas de mezcla dispersa de expertos (MoE), flujos residuales con compuerta ensanchados, embeddings hasheados de bigramas y trigramas, y un bloque nativo de predicción del siguiente token (MTP) para decodificación especulativa. El modelo incluye además tablas de embeddings hasheados de n-gramas con anchura 160, que también se cuantizan con grupo de 32.

Sobre el entrenamiento no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. La conversión conserva el tokenizador, la plantilla de chat, el procesador de visión, la configuración de generación y la configuración nativa del MTP del modelo original. La innovación técnica destacable de esta versión es la preservación del bloque MTP de Qwen4Exp, que habilita decodificación especulativa con un token de borrador y profundidad configurable, manteniendo los módulos multimodales y las compuertas del router en BF16 para no degradar la calidad de enrutamiento ni la percepción visual.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat conservada del modelo original.
- Comprensión de imagen y texto (pipeline `image-text-to-text`), con procesador de visión incluido.
- Razonamiento de múltiples pasos y conversaciones multi-turno gracias a una ventana de contexto configurada de 262.144 tokens.
- Decodificación especulativa nativa mediante el bloque MTP, con profundidad de borrador configurable (el autor recomienda tres tokens).
- Capacidades de mezcla dispersa de expertos, que activan solo una parte de los parámetros por token.
- Soporte de API compatible con OpenAI en el runtime oMLX.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo puede mantener conversaciones multi-turno con contexto largo (hasta 262.144 tokens) ejecutándose íntegramente en un equipo Apple M3 Studio, sin depender de servicios en la nube.
- Análisis de documentos extensos con imágenes: la combinación de ventana de contexto amplia y codificador de visión permite procesar informes, contratos o artículos con figuras y tablas en una sola pasada.
- Prototipado de aplicaciones multimodales: mediante la API compatible con OpenAI de oMLX, un equipo de desarrollo puede integrar el modelo en aplicaciones de chat con imágenes sin cambiar de proveedor de API.
- Investigación en decodificación especulativa: el bloque MTP nativo y las métricas de aceptación publicadas (73,55 % con tres tokens de borrador) lo convierten en un banco de pruebas para estudiar el equilibrio entre profundidad de borrador y throughput.
- Evaluación comparativa de cuantizaciones: al ser una conversión uniforme a 6 bits con grupo de 32, sirve para medir la pérdida de calidad frente al checkpoint BF16 original en tareas de texto y visión.
- Despliegue de bajo coste en estaciones de trabajo Apple: para equipos que ya disponen de un Mac Studio con memoria unificada suficiente, evita la compra de GPU dedicadas para inferencia de un modelo de 180.000 millones de parámetros.
- Generación de código en producción: no disponible en la información proporcionada; no se documentan capacidades específicas de código ni tool calling.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad de generación en un Apple M3 Studio con oMLX 0.6.3rc3 (build 2475), decodificación voraz, semilla 6330, tres ejecuciones medidas de 512 tokens por modo y un calentamiento previo separado:

| Modo de ejecucion | Ejecuciones | Salida por ejecucion | Velocidad mediana | Borradores | Aceptados | Tasa de aceptacion |
|---|---:|---:|---:|---:|---:|---:|
| MTP nativo desactivado | 3 | 512 tokens | 20,6495 tokens/s | no aplica | no aplica | no aplica |
| MTP nativo activado, tres tokens de borrador | 3 | 512 tokens | 25,935 tokens/s | 1055 | 776 | 73,55 % |

El incremento de throughput medido con MTP activado fue del 25,6 %. El autor informa de paridad de salida exacta (Passed), alcance de 512 tokens generados en todas las ejecuciones sostenidas (Passed), comprobaciones de coherencia (Passed) y captura de telemetría del MTP (Passed). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 158,08 GB (147,224 GiB) en pesos cuantizados a 6 bits; se necesita memoria unificada suficiente para cargar los pesos más el estado de ejecución y la caché KV del contexto utilizado.
- GPU recomendadas: Apple Silicon con memoria unificada amplia; las mediciones del autor se realizaron en un Apple M3 Studio.
- Compatibilidad con GPU de consumo: no cabe en GPU de consumo convencionales de 24 GB o 48 GB; requiere equipos Apple con memoria unificada del orden de 192 GB o superior para cargar el checkpoint completo.
- Opciones de despliegue: oMLX 0.6.3rc3 (build 2475) con soporte explícito de `qwen4_exp` y MTP nativo; MLX-VLM 0.6.3 para construcción y carga estricta de pesos; MLX 0.32.0 como backend de tensores cuantizados. Las versiones anteriores sin soporte de MTP nativo de `qwen4_exp` no son compatibles con este checkpoint.
- Latencia y throughput: 20,6495 tokens/s con MTP desactivado y 25,935 tokens/s con MTP activado y tres tokens de borrador en Apple M3 Studio, según las mediciones del autor. La primera petición tras la carga incluye calentamiento y queda excluida de la cifra de estado estacionario.
- Nota: las cifras de rendimiento cubren únicamente generación de texto; el soporte de entrada de visión depende de las versiones de MLX-VLM y oMLX seleccionadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Vontra/Qwen3.8-Flash-Next-MLX-6bit-MTP | 179.999.981.459 | 262.144 tokens | safetensors MLX, 6 bits afín grupo 32 | Qwen Community License 1.0 | Hugging Face, 7.169 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | BF16 oficial | Qwen Community License 1.0 | Hugging Face |
| Alternativas de mismo tamano y tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de calidad ni de especificaciones detalladas del checkpoint base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Compatibilidad estricta de runtime: un runtime que no construya el módulo MTP de Qwen4Exp puede rechazar las 76 entradas de tensores MTP durante la carga estricta. Es necesario usar oMLX 0.6.3rc3 o superior y MLX-VLM 0.6.3.
- Requisito de memoria muy elevado: 158,08 GB de pesos implican que el modelo solo es viable en equipos Apple con memoria unificada de gama alta; no cabe en GPU de consumo.
- El soporte de entrada de visión depende de las versiones de MLX-VLM y oMLX; las cifras de rendimiento publicadas cubren solo texto.
- La decodificación especulativa con MTP cambia la ruta de decodificación, no la salida voraz prevista; el autor recomienda desactivarla para comparaciones de referencia o resolución de problemas.
- El rendimiento varía con la longitud del prompt, el crecimiento del contexto, el estado de la caché, la versión del runtime, la presión de memoria y las condiciones térmicas.
- No se han publicado datos sobre sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas en la información disponible.
- La licencia Qwen Community License 1.0 establece condiciones específicas para uso comercial; debe revisarse el archivo LICENSE antes de un despliegue en producción.
- El repositorio indica el identificador `TensorFold/Qwen3.8-Flash-Next-MLX-6bit-MTP` en su documentación, mientras que el identificador de Hugging Face es `Vontra/Qwen3.8-Flash-Next-MLX-6bit-MTP`; conviene verificar la ruta correcta al descargar.
- Solo 3 likes y 7.169 descargas en el momento de la consulta: es una conversión de la comunidad, no una publicación oficial de Qwen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-6bit-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre Qwen3.8 Flash Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Sitio de Qwen: https://qwen.ai/
- MLX-VLM: https://github.com/ml-explore/mlx-vlm
- Licencia Qwen Community License 1.0: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-6bit-MTP/blob/main/LICENSE
- TensorFold: https://tensorfold.dev
