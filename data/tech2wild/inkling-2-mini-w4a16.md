# Tech2wild/Inkling-2-Mini-W4A16

## Resumen

Inkling 2 Mini W4A16 es una cuantización comunitaria no oficial del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario Tech2wild. Se trata de un modelo multimodal (image-text-to-text) con arquitectura MoE y un núcleo de capas "looped" denominado `inkling2_loop`, que en el checkpoint original se distribuye con pesos NVFP4 y MXFP8. Esta versión reconvierte únicamente los tensores de los expertos enrutados a INT4 simétrico con escalas BF16 por grupo de 128 canales, manteniendo el resto de componentes (embeddings, LM head, atención, router, normas, convoluciones cortas, controladores de bucle, queries AttnRes y encoder de visión) en BF16/FP32.

El objetivo es claro: hacer que un modelo de 26.579.744.256 parámetros totales quepa y funcione con rendimiento útil en dos RTX 3090 (Ampere, 24 GB cada una) mediante tensor parallel 2 sobre NVLink, decodificación especulativa DSpark propia del modelo y una ventana de contexto configurable de hasta 458.752 tokens. El repositorio ocupa 17,1 GB y se distribuye en safetensors con el formato `pack-quantized` de compressed-tensors.

La relevancia actual radica en que demuestra que es posible ejecutar un MoE multimodal de ~26,6B parámetros en hardware consumer de gama alta de la generación Ampere, con velocidades de decodificación de 137,5 tok/s en un solo usuario y calidad prácticamente idéntica al checkpoint original en pruebas de perplejidad y evaluación de herramientas. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque se trata de una conversión no afiliada a Thinking Machines Lab.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con núcleo de capas "looped" (`inkling2_loop`), transformer multimodal image-text-to-text |
| Parámetros totales | 26.579.744.256 |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 458.752 tokens (448K) en TP2; 131.072 con visión activada; 32.768 en una sola tarjeta |
| Tipos de cuantización | INT4 weight-only (W4A16) en expertos enrutados; resto en BF16/FP32; drafter DSpark en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors `pack-quantized`), requiere overlay de vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con un componente distintivo: capas centrales "looped" que se ejecutan tres veces compartiendo pesos, lo que incrementa la profundidad efectiva sin aumentar el número de parámetros. Los expertos enrutados de las capas 0 a 19 estaban originalmente en NVFP4 (E2M1 con escala FP8 E4M3 por bloque de 16 y escala FP32 por experto) y los de las capas 20 a 23 en MXFP8 (E4M3 con escala E8M0 por bloque de 32). El checkpoint incorpora además un drafter de decodificación especulativa denominado DSpark, almacenado en `mtp.safetensors` y preservado byte a byte en esta conversión.

La cuantización se realizó sin calibración, mediante round-to-nearest con búsqueda de escala por error cuadrático medio (MSE). Para cada fila y grupo de 128 canales se elige la escala entre `amax/d` con d en {7, 7.25, 7.5, 7.75, 8, 8.25, 8.5, 9}, redondeada a BF16. El error relativo medio de pesos resultante es del 10,4% en las capas NVFP4 y del 10,3% en las MXFP8, frente al 11,6% y 11,3% que daría un RTN simple con `amax/7.5`. No se emplearon GPTQ, AWQ ni AutoRound porque no existe una implementación en transformers de la arquitectura `inkling2_loop` que permita capturar activaciones, y las capas en bucle complicarían dicha captura al compartir pesos entre pasadas. La dequantización exacta de los expertos originales se verificó de tres formas: comprobación de máximo absoluto contra el `amax` almacenado, comparación del GEMM de expertos de vLLM sobre los pesos originales con un GEMM de torch sobre los dequantizados (0,17% de error relativo) y recuantización de la copia dequantizada para recuperar códigos FP4 y bytes FP8 idénticos.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 448K tokens en TP2).
- Procesamiento de imagen y texto (pipeline image-text-to-text), con encoder de visión preservado en BF16.
- Razonamiento y matemáticas: la evaluación interna incluye 12 problemas de palabras matemáticos y 3 preguntas de razonamiento resueltas correctamente en 19/19 prompts fijos.
- Generación de código: 2 tareas de programación validadas contra tests unitarios dentro del conjunto de 19 prompts.
- Tool calling / function calling: la evaluación de 69 escenarios de herramientas obtiene 55 pass, 10 partial y 4 fail, con puntuaciones de calidad 87,0, responsiveness 99,1 y deployability 90,6.
- Extracción JSON estricta: un prompt de extracción con formato JSON estricto superado en la evaluación fija.
- Decodificación especulativa DSpark integrada (k=7), con hasta 2,39 tokens por paso objetivo (3,31 en turnos de tool calling).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: con 458.752 tokens de ventana en TP2, el modelo puede mantener conversaciones o analizar documentos extensos (manuales, expedientes, bases de código) sin truncar, manteniendo coherencia multi-turno.
- Automatización de atención al cliente con tool calling: la evaluación de 69 escenarios con 87,0 de calidad y 99,1 de responsiveness indica que puede encadenar llamadas a herramientas (consultas a CRM, gestión de pedidos) de forma fiable en producción.
- Análisis de documentos con imagen: al ser image-text-to-text, puede procesar capturas, formularios escaneados o diagramas junto con texto, con 131.072 tokens de contexto cuando la visión está activada.
- Generación de código en pipelines de CI/CD: las 2 tareas de coding contra tests unitarios y la perplejidad de 1,154 en pasada de código (frente a 1,153 del original) lo hacen apto para autocompletado y revisión de código en entornos con GPUs Ampere.
- Extracción estructurada de datos: el prompt de extracción JSON estricta superado permite usarlo como extractor de entidades o campos en flujos ETL, devolviendo JSON válido de forma consistente.
- Razonamiento matemático asistido: los 12 problemas de palabras resueltos en la evaluación fija lo sitúan como candidato para tutores o asistentes de resolución de problemas, con la salvedad de que la cuantización introduce un +2,3% de perplejidad en prosa.
- Despliegue en laboratorios con hardware limitado: dos RTX 3090 con NVLink ofrecen 137,5 tok/s en decodificación de un solo usuario, suficiente para prototipado e investigación sin acceso a A100/H100.

## Benchmarks y rendimiento

Resultados medidos en 2x RTX 3090 con tensor parallel 2, NVLink, DSpark k=7, KV cache BF16, solo texto, una petición a la vez (2026-11-21). Tarjetas limitadas a 240 W.

| Métrica | Valor |
|---|---|
| Decodificación, un usuario | 137,5 tok/s |
| Decodificación sin NVLink P2P | 100,5 tok/s |
| Decodificación sin DSpark | 93,7 tok/s |
| Aceleración DSpark | 1,47x |
| Tokens draft aceptados | 19,8% |
| Tokens por paso objetivo | 2,39 (3,31 en turnos de tool calling) |
| Contexto máximo (`--max-model-len`) | 458.752 |
| Pool KV en 2x 24 GB | 483.850 tokens |
| Needles de contexto largo | PASS a 32K, 199.595 tokens (59 s de prefill) y 439.384 tokens (191 s de prefill) |
| Eval de herramientas (69 escenarios) | calidad 87,0 / responsiveness 99,1 / deployability 90,6 (55 pass / 10 partial / 4 fail) |
| Decodificación en eval, turno mediano | 157,4 tok/s, 670 ms |
| Visión activada (TP2, 131.072 contexto) | ~90 tok/s sin decodificación especulativa |
| Una sola tarjeta (TP1, 32.768 contexto) | ~74 tok/s |

Comparación de calidad frente al checkpoint original (misma máquina, decodificación greedy):

| Métrica | Original NVFP4/MXFP8 | W4A16 |
|---|---|---|
| Perplejidad, prosa | 4,574 | 4,677 (+2,3%) |
| Perplejidad, código | 1,153 | 1,154 (+0,1%) |
| Perplejidad, matemáticas | 1,812 | 1,800 (-0,7%) |
| 19 prompts fijos | 19/19 | 19/19 |
| Eval de herramientas (69 escenarios) | 88,4 (DGX Spark) | 87,0 |

## Requisitos de hardware

- VRAM estimada: el repo ocupa 17,1 GB en safetensors; en TP2 sobre 2x RTX 3090 (48 GB totales) el pool KV alcanza 483.850 tokens con contexto de 458.752.
- GPU recomendadas: 2x RTX 3090 con puente NVLink para el modo completo (TP2, 448K contexto, DSpark). Sin NVLink se pierde rendimiento (100,5 tok/s frente a 137,5 tok/s).
- Configuración de una sola tarjeta: TP1 con hasta 32.768 tokens de contexto y ~74 tok/s, viable en una RTX 3090 de 24 GB.
- Configuración con visión: TP2 con 131.072 tokens de contexto y ~90 tok/s sin decodificación especulativa.
- Despliegue: vLLM con un overlay específico (el vLLM estándar no carga este checkpoint por sí solo). Los scripts de lanzamiento, el overlay, el bench y los scripts de needle están en el repositorio de GitHub del autor.
- Latencia: 670 ms de turno mediano en la evaluación de herramientas; 59 s de prefill para 199.595 tokens y 191 s para 439.384 tokens.
- Throughput: 137,5 tok/s en decodificación de un usuario; 157,4 tok/s en el turno mediano de la evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-W4A16 (esta ficha) | 26,58B | 458.752 (TP2) | INT4 W4A16 | Apache 2.0 | Hugging Face + GitHub del autor |
| thinkingmachines/Inkling-2-Mini (original) | 26,58B (mismo total) | no disponible en la información | NVFP4 / MXFP8 | Apache 2.0 | Hugging Face (oficial) |
| Inkling-2-Mini-NVFP4-DGX-Spark | 26,58B (mismo total) | no disponible en la información | NVFP4 | Apache 2.0 | GitHub del autor (una DGX Spark) |

El original y la variante NVFP4 para DGX Spark son los únicos puntos de comparación documentados en la información disponible. En la evaluación de 69 escenarios de herramientas, el original obtiene 88,4 frente a 87,0 de esta versión, con 68 de 69 escenarios idénticos; el único cambio (TC-22, traducción con lista larga de herramientas) también aparece con KV FP8 en la Spark. No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) para ninguno de los tres.

## Limitaciones y advertencias

- Cuantización comunitaria no oficial: no está afiliada ni respaldada por Thinking Machines Lab, vLLM ni NVIDIA.
- Requiere un overlay específico de vLLM; el vLLM estándar no puede cargar el checkpoint por sí solo.
- Cuantización RTN sin calibración: no se usaron GPTQ, AWQ ni AutoRound, por lo que la calidad debe interpretarse en ese contexto. La perplejidad en prosa sube un 2,3%.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; la evaluación se limita a 19 prompts fijos y 69 escenarios de herramientas.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- El modo de contexto completo (448K) exige 2x RTX 3090 con NVLink; sin NVLink el rendimiento cae a 100,5 tok/s y en una sola tarjeta el contexto se limita a 32.768 tokens.
- Las tarjetas de prueba estaban limitadas a 240 W; el rendimiento puede variar con otras configuraciones de energía.
- Licencia Apache 2.0 permite uso comercial, pero al ser una conversión no oficial conviene verificar la licencia del modelo base antes de desplegar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Tech2wild/Inkling-2-Mini-W4A16
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de ejecución (scripts, overlay vLLM, bench, needles): https://github.com/tonyd2wild/Inkling-2-Mini-W4A16-RTX3090
- Script de conversión: https://github.com/tonyd2wild/Inkling-2-Mini-W4A16-RTX3090/blob/main/quantize/convert.py
- Variante NVFP4 para DGX Spark: https://github.com/tonyd2wild/Inkling-2-Mini-NVFP4-DGX-Spark
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
