# ZTFlynn/LFM2.5-1.2B-Instruct-Cascadia-ternary3

## Resumen

ZTFlynn/LFM2.5-1.2B-Instruct-Cascadia-ternary3 es una versión comprimida del modelo LFM2.5-1.2B-Instruct de Liquid AI, desarrollada por ZTFlynn mediante la técnica Cascadia. Esta técnica combina una superficie spline con tablas de consulta (LUT) por bandas para reducir el tamaño del checkpoint de 2,23 GB a 747 MB, un factor de compresión de 3,14x, manteniendo la perplejidad dentro del 2,5% del modelo original (61,72 frente a 62,43 en una evaluación pareada sobre 8.176 tokens de FineWeb-Edu). El resultado es un paquete ejecutable en CPU mediante un runtime en C cuyas únicas dependencias son libc, libm y libgomp, lo que lo hace adecuado para entornos edge y de bajo consumo.

El modelo base, LFM2.5-1.2B-Instruct, es un modelo híbrido de 1,2B parámetros con arquitectura conv+attention, entrenado sobre 28T tokens con refuerzo (RL) y optimizado para instrucciones, tool calling y tareas agénticas. La compresión Cascadia no altera las capacidades funcionales del modelo, solo su formato de almacenamiento y ejecución, que pasa a ser un paquete binario con geometría por tensor en lugar de un checkpoint de transformers. Esto lo hace relevante para despliegues en dispositivos con memoria limitada, como móviles, routers o sistemas embebidos, donde un modelo de 1,2B cabría en menos de 1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida conv+attention (LFM2.5), 16 bloques, GQA 32q/8kv, convoluciones cortas con puerta |
| Parametros totales | 1,2B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32K tokens (modelo base) |
| Tipos de cuantizacion | Compresión ternaria-3 (Cascadia): spline + LUT por bandas, 5,09 bits por peso, 0,60 bytes por peso |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm-open-license (heredada del modelo base) |
| Formato de pesos | Paquete Cascadia: weights.bin, manifest.json, aux.bin, tokenizer.bin (no safetensors) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Instruct emplea una arquitectura híbrida que combina capas convolucionales con atención, diseñada para eficiencia en dispositivos. Fue preentrenado sobre 28T tokens y posteriormente afinado con refuerzo para instrucciones y tool calling. La compresión Cascadia, por su parte, no modifica la arquitectura sino que comprime los pesos: ajusta una superficie B-spline a cada matriz de pesos para capturar la estructura a gran escala, asigna cada peso a una de 32 bandas según su valor spline, y aprende un codebook k-means por banda sobre los residuos. El 0,5% de los errores más grandes se conservan exactamente en f32. Los índices del codebook se empaquetan en base 3, con cinco trits por byte (3⁵ = 243). La reconstrucción se evalúa dentro del producto matriz-vector, sin construir nunca la matriz densa, y se eliminan los factores de escala por bloque gracias a que la spline transporta el rango dinámico.

## Capacidades

- Generación de texto y chat con instrucciones, heredadas del modelo base LFM2.5-1.2B-Instruct.
- Soporte de tool calling y function calling, según la documentación de Liquid AI para este modelo.
- Capacidades agénticas y razonamiento multi-paso, optimizadas mediante RL en el entrenamiento base.
- Razonamiento matemático y de código, aunque no se proporcionan benchmarks específicos en la información disponible.
- Multilingüe limitado: el modelo base declara solo inglés (en), por lo que no se garantiza rendimiento en otros idiomas.
- Ejecución en CPU con runtime C, sin necesidad de GPU ni de librerías de deep learning pesadas.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: al ocupar solo 747 MB, puede integrarse en aplicaciones nativas para iOS o Android, ofreciendo respuestas offline con baja latencia gracias a la inferencia en CPU.
- Atención al cliente en entornos con recursos limitados: un chatbot desplegado en un router o un mini-PC industrial puede gestionar consultas multi-turno con contexto de hasta 32K tokens, suficiente para mantener historiales largos de conversación.
- Generación de código en entornos de desarrollo embebido: aunque no se publican benchmarks de HumanEval, el modelo base está entrenado para tool calling, por lo que puede usarse para autocompletar o generar fragmentos de código en IDEs ligeros que no dispongan de GPU.
- Procesamiento de documentos en equipos sin aceleración: la compresión permite ejecutar el modelo en portátiles antiguos o servidores CPU-only para tareas de resumen, extracción de información o clasificación de texto.
- Prototipado rápido en investigación: al ser un paquete autocontenido con runtime C, se puede integrar en pipelines de experimentación sin depender de transformers ni de entornos Python pesados.
- Edge AI en dispositivos IoT: con un consumo de memoria inferior a 1 GB, es viable en placas como Raspberry Pi 5 o similares para tareas de generación de texto local, evitando la dependencia de la nube.

## Benchmarks y rendimiento

La model card proporciona únicamente métricas de perplejidad, no benchmarks estándar como MMLU o HumanEval. Los datos disponibles son:

| Modelo | Perplejidad (FineWeb-Edu, 512-token windows) |
|---|---|
| LFM2.5-1.2B-Instruct (bf16) | 61,72 |
| Este paquete (ternary-3) | 62,43 |
| Diferencia | +1,15% (IC 95% [0,9984x, 1,0247x], t = +1,72) |

Además, se reporta el coste de compresión en función del tamaño del modelo, medido con el mismo corpus y método:

| Modelo | Parámetros | Coste de perplejidad |
|---|---|---|
| LFM2.5-230M | 0,23B | +7,7% |
| LFM2-350M | 0,35B | +3,5% |
| LFM2-24B-A2B | 24B | Sin coste detectable (< 0,3%) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el runtime C requiere únicamente libc, libm y libgomp (OpenMP). No necesita GPU ni VRAM.
- Memoria RAM estimada: aproximadamente 1 GB para el paquete completo (747 MB de pesos + overhead de runtime y tokenizador).
- CPU recomendada: cualquier procesador x86-64 o ARM64 con soporte para OpenMP; se ha reportado que el modelo base alcanza 239 tok/s en CPU AMD, aunque la compresión puede variar este rendimiento.
- No cabe en GPU de consumo como requisito, pero puede ejecutarse en cualquier hardware con CPU; no se requiere GPU.
- Opciones de despliegue: runtime C de Cascadia (repositorio cassie), con interfaz de línea de comandos y bindings de Python a través de la librería `cascadia` (carga con `load_compressed`).
- Latencia y throughput: no se proporcionan cifras específicas para este paquete; la model card indica que es batch-1 y adecuado para edge y cargas por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Contexto | Perplejidad (FineWeb-Edu) | Licencia | Formato |
|---|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct (bf16) | 1,2B | 2,23 GB | 32K | 61,72 | lfm-open-license | safetensors |
| Este paquete (Cascadia ternary-3) | 1,2B | 747 MB | 32K | 62,43 | lfm-open-license | Paquete Cascadia |
| Qwen2.5-1.5B-Instruct (referencia) | 1,5B | ~3 GB (bf16) | 32K | No disponible | Apache 2.0 | safetensors |
| Gemma-2-2B (referencia) | 2B | ~4 GB (bf16) | 8K | No disponible | Gemma license | safetensors |

La comparación con Qwen2.5 y Gemma-2 es orientativa en cuanto a tamaño y contexto, pero no se dispone de métricas de perplejidad comparables en el mismo corpus. La ventaja principal de este paquete es su tamaño reducido y la posibilidad de ejecutarlo en CPU sin dependencias pesadas.

## Limitaciones y advertencias

- Solo se ejecuta mediante el runtime C de Cascadia; no es un checkpoint de transformers y no puede cargarse con `from_pretrained` directamente.
- El runtime soporta únicamente paquetes ternary-3; otros presets de compresión no están implementados en el kernel actual.
- Inferencia batch-1, sin soporte para beam search; solo decodificación greedy o muestreo con temperatura, top-k y top-p.
- El modelo base está entrenado solo en inglés; no se garantiza rendimiento en otros idiomas.
- La licencia lfm-open-license puede imponer restricciones de uso comercial; se recomienda revisar el texto completo en el enlace proporcionado.
- La compresión introduce una degradación de perplejidad del 1,15% en este tamaño de modelo; para modelos más pequeños (por debajo de 350M) el coste es mayor y puede no ser aceptable.
- No se han publicado evaluaciones de sesgos o alucinación específicas para este paquete; se heredan las del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZTFlynn/LFM2.5-1.2B-Instruct-Cascadia-ternary3
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Documentación de Liquid AI para LFM2.5-1.2B-Instruct: https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct
- Repositorio del runtime Cascadia (cassie): https://github.com/EntroMorphic/cassie
- Formato de paquete: https://github.com/EntroMorphic/cassie/blob/main/docs/package_format.md
- Inspiración del proyecto (Magneato/deepseek-r1-qwen-7b-lutc): https://huggingface.co/Magneato/deepseek-r1-qwen-7b-lutc
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
