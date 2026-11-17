# yasakani-dev/Qwen3.8-27B-YASAKANI-quality

## Resumen

Qwen3.8-27B-YASAKANI-quality es una conversión cuantizada y comprimida del modelo Qwen3.8-27B (27.000 millones de parámetros, desarrollado por el equipo Qwen de Alibaba Cloud) realizada por yasakani-dev. El artefacto principal, `qwen38_27b_quality.yskn`, ocupa 12,37 GB frente a los 53,8 GB de los pesos originales en BF16, lo que supone una compresión aproximada de 4,3x. No es un modelo autónomo en formato estándar: emplea el formato propietario `.yskn` del motor YASAKANI, un runtime local para Windows diseñado para ejecutarse sobre una única GPU NVIDIA RTX.

La relevancia de esta ficha reside en que ilustra una tendencia creciente de cuantizaciones específicas por motor, optimizadas para hardware de consumo de gama alta (RTX 5090, 32 GB de VRAM) y con decodificación especulativa integrada mediante un modelo borrador derivado de DFlash 2 de z-lab. El objetivo declarado es preservar la fidelidad al modelo original manteniendo velocidades de generación altas, con un 95,24% de coincidencia en el token más probable respecto al BF16 original sobre un corpus de 20 transcripciones de razonamiento.

Es importante subrayar que estos pesos solo pueden cargarse con YASAKANI: no son compatibles con transformers, llama.cpp, vLLM ni SGLang. La licencia es Apache 2.0, heredada del modelo base, y el repositorio no cuenta con el aval oficial de Qwen, Alibaba Cloud, z-lab ni Inco AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); no se detalla en la información disponible |
| Parámetros totales | 27.000 millones (modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma fija; se ajusta dinámicamente según la VRAM libre al arrancar el modelo (inferior a 32 GB de VRAM implica contexto potencialmente más corto) |
| Tipos de cuantización | Compresión propietaria en formato `.yskn` (12,37 GB); caché KV comprimida mediante `kvq_u5.bin` |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen3.8-27B es multilingüe, pero no se especifica el conjunto exacto |
| Licencia | Apache 2.0 |
| Formato de pesos | `.yskn` (propietario de YASAKANI); incluye `bdraft2_k8.yskn` y `bdraft2_k8.shead` para el modelo borrador; tokenizer y config en formato estándar |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-27B, un transformer denso de 27.000 millones de parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación; estos datos corresponden a la model card original de Qwen y no se reproducen aquí.

La innovación técnica de esta conversión es doble. Por un lado, la compresión a 12,37 GB mediante el formato `.yskn`, que según el autor mantiene el 95,24% de coincidencia en el token más probable frente al BF16 original (20.460 posiciones evaluadas sobre 20 transcripciones de razonamiento, con caché KV en FP16, medidas el 8 de noviembre de 2026). Por otro, la integración de decodificación especulativa mediante un modelo borrador pequeño (`bdraft2_k8.yskn`) derivado de DFlash 2 de z-lab, que propone tokens candidatos para acelerar la generación. La divergencia KL respecto al original es de 0,0122 en texto de razonamiento, aunque el propio autor advierte que en texto web general la divergencia es un 3-10% mayor que en su conversión anterior del mismo tamaño, por lo que la fidelidad no es uniforme entre dominios.

## Capacidades

- Generación de texto conversacional y de razonamiento (el corpus de evaluación se compone de transcripciones de *thinking*, lo que sugiere soporte de modo razonamiento heredado del modelo base).
- Generación de código y matemáticas: capacidades heredadas de Qwen3.8-27B, aunque no se documentan explícitamente en esta model card.
- Decodificación especulativa integrada mediante modelo borrador, con aceleración de la generación en GPU RTX.
- Caché KV comprimida para reducir el consumo de VRAM durante la inferencia.
- Verificación de integridad de los archivos mediante SHA-256 (`yasakani verify`) y autocomprobación de referencia (`yasakani selfcheck`).
- No se documentan en la información disponible capacidades de tool calling, function calling, uso de agentes, visión, audio ni multilingüismo específico.

## Casos de uso

- Asistente conversacional local en estación de trabajo Windows: el modelo se ejecuta íntegramente en una RTX 5090 (32 GB) o en GPUs de 24 GB como la RTX 4090 o la RTX 3090, sin depender de servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Razonamiento asistido sobre textos largos: gracias al modo *thinking* heredado y a la caché KV comprimida, puede emplearse para tareas de análisis y resumen de documentos técnicos en local.
- Prototipado rápido de aplicaciones LLM en Windows: el flujo `yasakani chat` permite interactuar con el modelo desde línea de comandos con verificación previa de integridad, útil para validar ideas antes de invertir en infraestructura.
- Evaluación comparativa de cuantizaciones: investigadores pueden contrastar esta conversión *quality* con la *speed* del mismo autor (10,31 GB, 93,01% de coincidencia, KL 0,0304) para medir el compromiso entre fidelidad y velocidad en su propio corpus.
- Despliegue en entornos aislados o air-gapped: al ser un runtime local con pesos descargables y verificables por checksum, encaja en escenarios sin conectividad externa.
- Generación de código en local para desarrolladores con GPU de consumo: siempre que se validen las capacidades de código del modelo base, puede integrarse en flujos de autocompletado o revisión sin enviar código a terceros.
- Investigación sobre decodificación especulativa: el par modelo principal + borrador DFlash 2 permite estudiar el impacto de la decodificación especulativa en latencia y calidad sobre hardware de consumo.

## Benchmarks y rendimiento

| Métrica | Quality (este repo) | Speed (repo hermano) |
|---|---|---|
| Tamaño del archivo principal | 12,37 GB | 10,31 GB |
| VRAM mínima | 24 GB | 16 GB |
| Coincidencia con el token más probable del original | 95,24% | 93,01% |
| Divergencia KL respecto al original (menor es mejor) | 0,0122 | 0,0304 |

Condiciones de medida: 20 transcripciones de razonamiento no utilizadas durante la creación de los archivos, 20.460 posiciones, caché KV en FP16, 8 de noviembre de 2026. El autor advierte que en texto web general la divergencia KL es un 3-10% mayor que en su conversión anterior del mismo tamaño. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 24 GB o más para el modelo *quality*; 16 GB o más para el modelo *speed*.
- GPUs compatibles con el modelo *quality*: RTX 5090 (32 GB, probada oficialmente), RTX 3090, RTX 3090 Ti y RTX 4090 (24 GB).
- GPUs de 16 GB (solo modelo *speed*): RTX 4060 Ti 16GB, RTX 4070 Ti SUPER, RTX 4080, RTX 4080 SUPER, RTX 5060 Ti 16GB, RTX 5070 Ti, RTX 5080.
- No compatible con GPUs de 12 GB o menos, ni con la serie RTX 20 o anteriores. AMD y Mac no están soportados oficialmente.
- Solo se ha probado en RTX 5090; en el resto de tarjetas el autor no garantiza funcionamiento ni velocidad. La longitud de contexto se ajusta automáticamente según la VRAM libre al iniciar.
- Sistema operativo: Windows 11; Python 3.10 o superior; YASAKANI 0.1.3 o superior para tarjetas distintas de la RTX 5090.
- Despliegue: exclusivamente mediante el motor YASAKANI (comandos `yasakani verify`, `yasakani selfcheck`, `yasakani chat`). No compatible con vLLM, llama.cpp, Ollama, TGI, SGLang ni transformers.
- Latencia y throughput: no disponibles en la información proporcionada; el autor remite a la página de GitHub para las mediciones de velocidad, todas realizadas en RTX 5090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | VRAM mínima | Licencia | Motor |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-YASAKANI-quality | 27B | dinámico según VRAM | `.yskn` | 24 GB | Apache 2.0 | YASAKANI |
| Qwen3.8-27B-YASAKANI-speed | 27B | dinámico según VRAM | `.yskn` | 16 GB | Apache 2.0 | YASAKANI |
| Qwen3.8-27B (original) | 27B | no disponible | safetensors BF16 | 53,8 GB de pesos | Apache 2.0 | transformers, vLLM, etc. |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es el modelo original: la compresión a 12,37 GB introduce divergencia respecto al BF16; la coincidencia del 95,24% se midió solo sobre transcripciones de razonamiento, y en texto web general la divergencia KL es un 3-10% mayor.
- Dependencia total del motor YASAKANI: los archivos `.yskn` no pueden cargarse con transformers, llama.cpp, vLLM, SGLang ni ninguna otra herramienta estándar, lo que limita la portabilidad y la integración en pipelines existentes.
- Solo Windows 11: no hay soporte oficial para Linux, macOS ni GPUs AMD.
- Soporte hardware muy restringido: únicamente probado en RTX 5090; en el resto de tarjetas el rendimiento y la estabilidad no están garantizados.
- Contexto variable: en GPUs con menos de 32 GB de VRAM la ventana de contexto se reduce automáticamente, lo que puede afectar a tareas que requieran contexto largo.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni de sesgos; al ser una cuantización, estos riesgos son al menos equivalentes a los del modelo base.
- Idiomas soportados no especificados en la model card; no se puede confirmar el comportamiento multilingüe de esta conversión concreta.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara explícitamente que el repositorio no es una release oficial de Qwen, Alibaba Cloud, z-lab ni Inco AI, y que ninguna de estas entidades lo respalda.
- Los archivos `qwen38_27b_quality.yskn`, `bdraft2_k8.yskn` y `bdraft2_k8.shead` no son los pesos originales; deben conservarse todos los archivos del repositorio juntos en una misma carpeta para que el motor funcione.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yasakani-dev/Qwen3.8-27B-YASAKANI-quality
- Modelo *speed* (repo hermano): https://huggingface.co/yasakani-dev/Qwen3.8-27B-YASAKANI-speed
- Motor YASAKANI (GitHub): https://github.com/yasakani-dev/yasakani
- README en japonés: https://github.com/yasakani-dev/yasakani/blob/main/README.ja.md
- Issues del proyecto: https://github.com/yasakani-dev/yasakani/issues
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo borrador DFlash 2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
