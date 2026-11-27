# Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BF16

## Resumen

Este repositorio contiene los pesos del modelo IBM Granite 3.0 8B Instruct reempaquetados en BF16 para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole) mediante la pila TT-NN / tt-metal. No se trata de un modelo nuevo ni de un ajuste fino: es una exportación del modelo original con una transformación numérica concreta —el plegado del multiplicador residual (0,22) en 80 matrices de salida de atención y de proyección down del MLP— que permite al hardware Tensix aplicar la escala una sola vez, con `residual_multiplier` fijado a 1,0 en la configuración.

El modelo base es un transformer denso de 8.170.848.256 parámetros con licencia Apache 2.0, orientado a generación de texto conversacional y con soporte declarado de inglés y coreano. La relevancia de esta exportación es de infraestructura: demuestra que un modelo de 8B en BF16 puede empaquetarse sin cuantización para NPUs Tensix manteniendo una fidelidad numérica muy alta respecto al original (KL medio de 0,000833 frente al BF16 sin plegar), muy por debajo de una cuantización Q4_K_M (KL de 0,059211) y cerca del suelo de ruido de llama.cpp en BF16 (0,000295).

El interés práctico es acotado pero claro: sirve a quien quiera desplegar Granite 3.0 8B Instruct en hardware Tenstorrent sin asumir la pérdida de precisión de una cuantización de 4 bits, y como referencia reproducible de un pipeline de empaquetado BF16 verificado tensor a tensor contra TT-NN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Granite 3.0, decoder-only); pesos preparados para TT-NN / Tensix |
| Parametros totales | 8.170.848.256 (8,17B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada para esta exportación (heredada del modelo base Granite 3.0 8B Instruct) |
| Tipos de cuantizacion | Ninguna: BF16 nativo. 362 tensores almacenados en BF16; 80 matrices con escala 0,22 plegada en float32 y reconvertidas a BF16 |
| Idiomas soportados | Inglés (en) y coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), con `model.safetensors.index.json`; compatible con `transformers` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo IBM Granite 3.0 8B Instruct: un transformer decoder-only denso con atención multi-cabeza, capas MLP con proyección down y embedding de entrada compartido con la cabeza de salida (tied head). El repositorio no entrena ni modifica el modelo: conserva tokenizador, plantilla de chat, vocabulario y configuración de EOS del original, y solo altera el campo `residual_multiplier` (de 0,22 a 1,0) en el config.

La innovación técnica de esta exportación es el plegado de residuales: en el modelo original, la salida de atención y la proyección down del MLP se multiplican por 0,22 antes de sumarse al flujo residual. Aquí ese factor se incorpora directamente en los pesos de las 80 matrices afectadas (multiplicación en float32 y conversión posterior a BF16), de modo que el kernel de TT-NN no necesita aplicar la escala en tiempo de ejecución. Los 282 tensores restantes son byte-idénticos al BF16 original. El autor declara que los 362 tensores pasan el empaquetado host de TT-NN sin cambios de valor, y que la matriz mostrada supera también un ciclo de ida y vuelta por DRAM en el simulador Blackhole con TT-NN 0.81.1. No se documentan en la información disponible datos de preentrenamiento, composición del corpus ni etapas de RLHF/DPO para el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat (`apply_chat_template`) y prompt de generación incluidos.
- Razonamiento general y respuesta a instrucciones, heredados de Granite 3.0 8B Instruct.
- Generación de código y matemáticas a nivel de modelo base de 8B (no se aportan benchmarks específicos en esta exportación).
- Soporte multilingüe limitado a inglés y coreano según los metadatos del repositorio.
- Inferencia en BF16 sin cuantización sobre NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN.
- Ejecución también en PyTorch/Transformers con `dtype="bfloat16"` y `device_map="auto"`.
- No se declara soporte de tool calling, function calling, modo thinking, visión ni audio en la información proporcionada.

## Casos de uso

- Despliegue en hardware Tenstorrent: cargar los pesos con TT-NN sobre Wormhole o Blackhole para servir Granite 3.0 8B Instruct en BF16 sin cuantización, aprovechando el plegado de residuales para eliminar la multiplicación por 0,22 en el kernel.
- Evaluación de fidelidad numérica: usar la métrica KL frente al BF16 original (0,000833) como referencia para validar portes a otros backends o comparar contra cuantizaciones Q4_K_M (KL 0,059211).
- Asistente conversacional en inglés o coreano: aplicar la plantilla de chat del modelo original y generar respuestas con `do_sample=False` para tareas de respuesta determinista.
- Referencia de pipeline de empaquetado: reutilizar `pack_bf16.py` y las comprobaciones de empaquetado host de TT-NN como plantilla para preparar otros modelos en BF16 para Tensix.
- Validación en simulador: ejecutar el ciclo de ida y vuelta por DRAM en el simulador Blackhole antes de disponer de silicio, verificando que los tensores empaquetados conservan sus valores.
- Baseline de precisión en investigación: emplear esta exportación como referencia BF16 "sin pérdida" al estudiar el impacto de cuantizaciones más agresivas sobre el mismo modelo base.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de fidelidad respecto al BF16 original sin plegar, no benchmarks de tareas estándar.

| Perfil | KL medio al BF16 original sin plegar | Normal correctas / 33 | Thinking correctas / 7 |
|---|---:|---:|---:|
| BF16 original sin plegar | 0 | 25 | 0 |
| Esta exportación BF16 plegada | 0,000832725213 | 24 | 0 |
| Q4_K_M del mismo modelo original | 0,059211 | 23 | 0 |

La KL se calcula sobre 16.248 posiciones puntuadas de un conjunto de referencia de 16 secuencias en inglés y coreano (raw y chat), con IDs de token y máscaras idénticos; el suelo de llama.cpp en BF16 frente a esa referencia es 0,000295. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM: al ser BF16 sin cuantización, los pesos ocupan 16,34 GB (repositorio de 16,3 GB); se necesita al menos esa cantidad de memoria más overhead de activaciones y caché KV.
- GPU: no cabe en GPUs de consumo de 16 GB o menos; requiere A100 40/80 GB, H100, o GPUs de 24 GB o más solo con margen ajustado y contexto corto.
- Hardware objetivo: NPUs Tenstorrent Tensix Wormhole y Blackhole mediante TT-NN / tt-metal.
- Despliegue: `transformers` 5.23.0 con PyTorch (BF16, `device_map="auto"`); TT-NN 0.81.1 para empaquetado y ejecución en Tensix; `pack_bf16.py` para verificación tensor a tensor, con opción `--device` para ida y vuelta por DRAM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / precisión | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BF16 | 8,17B | BF16 con residuales plegados, para Tensix | No disponible | Apache 2.0 | Hugging Face, 137 descargas |
| ibm-granite/granite-3.0-8b-instruct (base) | 8,17B | BF16 original, sin plegar | No disponible en la información | Apache 2.0 | Hugging Face (modelo base) |
| Misma familia en Q4_K_M (llama.cpp) | 8,17B | 4 bits (Q4_K_M) | No disponible | Apache 2.0 | Derivado del mismo original |

La comparación relevante es de precisión: esta exportación mantiene una KL de 0,000833 frente al BF16 original, unas 70 veces menor que la Q4_K_M (0,059211), a cambio de no reducir el tamaño de los pesos. No se dispone de comparativas con otros modelos de 8B (Llama 3.1 8B, Mistral 7B, Qwen2.5 7B) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: hereda íntegramente los sesgos, alucinaciones y limitaciones del Granite 3.0 8B Instruct original.
- Solo inglés y coreano declarados; el rendimiento en castellano no está garantizado ni evaluado.
- La configuración modificada (`residual_multiplier: 1.0`) es obligatoria: usarla con pesos sin plegar o viceversa produce resultados incorrectos.
- Requiere `transformers` 5.23.0 y, para Tensix, TT-NN 0.81.1; versiones distintas pueden romper el empaquetado o la ejecución.
- El soporte de hardware se limita a Wormhole y Blackhole; la validación en dispositivo real descrita es sobre el simulador Blackhole, no sobre silicio físico.
- El conjunto de evaluación es reducido (16 secuencias, 16.248 posiciones, 33 preguntas normales y 7 de tipo thinking), por lo que las métricas de tarea tienen baja potencia estadística.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción; el repositorio tiene 0 likes y 137 descargas, lo que indica escasa validación comunitaria.
- No se declaran capacidades de tool calling, agentes ni visión; no asumirlas por el nombre "Instruct".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BF16
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-instruct
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del repositorio: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BF16/blob/main/LICENSE
