# TelperionAI/Qwen3.8-27B-EXL3-4.0bpw

## Resumen

TelperionAI/Qwen3.8-27B-EXL3-4.0bpw es una cuantización del modelo Qwen3.8-27B de Alibaba, realizada por TelperionAI mediante la técnica EXL3 (una variante de QTIP) a 4.0 bits por peso, con un pre-paso de AWQ smoothing sobre los pesos BF16 originales. El resultado es un checkpoint de 16.0 GB que mantiene una fidelidad razonable respecto al modelo base, con una discrepancia del 2.40% en posiciones donde el modelo base está "confiado" (margen de logprob entre 2 y 5). Esta cuantización está pensada para entornos con restricciones de VRAM, permitiendo ejecutar un modelo de 27B en GPUs de consumo con 16 GB o más.

El modelo requiere el runtime exllamav3 o TabbyAPI para su inferencia, ya que EXL3 no es compatible con vLLM. Según las mediciones del autor, supera a las cuantizaciones NVFP4 en calidad a igual o menor tamaño, aunque es superado en fidelidad por una cuantización INT4 group-32 asimétrica que se sirve en vLLM. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B) |
| Parametros totales | 8.430.253.296 (según safetensors; el nombre del modelo base sugiere 27B, posible discrepancia en el archivo) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3 4.0 bpw con AWQ smoothing; lm_head a 6 bpw; capas MTP cuantizadas inline |
| Idiomas soportados | No disponibles (se asume multilingüe por el modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización EXL3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal desarrollado por Alibaba, con capacidades destacadas en generación de código, flujos de trabajo agénticos y automatización de oficina. La cuantización EXL3 aplica una transformación de pesos en dos pasos: primero, un AWQ smoothing sobre los pesos BF16, que es una transformación puramente funcional (pliega 1/s en la normalización precedente y s en la siguiente capa lineal), calibrada con 256 secuencias; después, la conversión a EXL3 a 4.0 bits por peso. El autor indica que AWQ se apila correctamente porque deja un checkpoint BF16 ordinario, a diferencia de GPTQ o AutoRound, cuyos errores de compensación están ligados a decisiones de redondeo específicas que EXL3 descarta.

No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). La cuantización no altera la arquitectura subyacente, solo los pesos.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-27B es capaz de tareas de razonamiento complejo, aunque no se han publicado benchmarks específicos en la información disponible.
- Generación de código: según la búsqueda web, el modelo base destaca en coding, por lo que esta cuantización hereda esa capacidad.
- Multimodalidad: el modelo base es nativamente multimodal (visión y texto), aunque no se especifica si la cuantización conserva todas las capacidades visuales.
- Agentes y tool calling: el modelo base está optimizado para agentic workflows, lo que sugiere soporte de function calling y multi-step reasoning, aunque no hay confirmación explícita en la documentación de la cuantización.
- Automatización de oficina: el modelo base está orientado a tareas de office automation, como generación de documentos, resúmenes o extracción de información.
- Multilingüismo: no se especifican idiomas, pero el modelo base de Qwen suele ser multilingüe.

## Casos de uso

- Generación de código en entornos con VRAM limitada: el modelo cabe en 16 GB, por lo que puede ejecutarse en una RTX 4090 o similar para autocompletar código, generar funciones o refactorizar, usando exllamav3 como backend.
- Automatización de tareas de oficina: procesamiento de documentos, generación de informes, resúmenes de correos o extracción de datos estructurados, aprovechando la capacidad del modelo base para office automation.
- Desarrollo de agentes conversacionales: al soportar agentic workflows, puede integrarse en sistemas de diálogo multi-turno con tool calling, aunque requiere verificar la compatibilidad de EXL3 con el framework de agentes.
- Razonamiento matemático y lógico: el modelo base tiene capacidades de razonamiento, útil para aplicaciones educativas o de análisis, aunque no hay benchmarks específicos.
- Prototipado de aplicaciones multimodales: si la cuantización conserva la visión, puede usarse para tareas de captioning o VQA en hardware de consumo, aunque se recomienda validar la calidad visual.
- Despliegue en edge o servidores sin GPUs de alta gama: con 16 GB de VRAM, puede ejecutarse en GPUs como A100 40GB, RTX 6000 Ada o incluso en configuraciones con múltiples GPUs de 8 GB mediante offloading, aunque el rendimiento dependerá del ancho de banda.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de calidad medida sobre 231 documentos y 142.727 posiciones de token, comparando la discrepancia contra el modelo base BF16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| build | bits/wt | size | top-1 ↑ | near-tie ↓ | moderate ↓ | confident ↓ | certain ↓ | divmed ↑ | tok/s |
|---|---|---|---|---|---|---|---|---|---|
| TelperionAI INT4-AWQ-GPTQ (vLLM) | 4.63 | 25.1 GB | 96.30% | 22.29% | 3.52% | 0.93% | 0.09% | 48 | 4617 |
| EXL3 6.5 bpw | 6.50 | 23.0 GB | 97.10% | 17.03% | 2.41% | 1.23% | 0.15% | 59 | 492* |
| EXL3 5.5 bpw | 5.50 | 20.0 GB | 96.12% | 22.81% | 3.52% | 1.34% | 0.16% | 55 | 516* |
| Qwen FP8 (referencia, vLLM) | 8.00 | ~30 GB | 96.15% | 22.70% | 3.48% | 1.45% | 0.08% | 47 | 8711 |
| TelperionAI NVFP4 (vLLM) | 4.50 | 24.7 GB | 93.62% | 32.25% | 8.59% | 1.85% | 0.16% | 29 | 10521 |
| **Este modelo — EXL3 4.0 bpw** | 4.00 | 16.0 GB | 93.82% | 31.66% | 6.94% | 2.40% | 0.58% | 28 | 570* |
| EXL3 4.0 bpw, sin AWQ | 4.00 | 16.0 GB | 93.17% | 34.05% | 8.41% | 3.08% | 0.16% | 27 | 561* |

\* El throughput de EXL3 es single-stream argmax en una GPU vía exllamav3, no comparable con las cifras batched de vLLM. No fue optimizado.

Las columnas `confident` y `certain` son las que indican daño real: 2.40% y 0.58% respectivamente, peores que la INT4 (0.93% y 0.09%) pero mejores que la NVFP4 (1.85% y 0.16%). El `divmed` de 28 indica que la generación greedy diverge del modelo base en la posición 28 de mediana.

## Requisitos de hardware

- VRAM estimada: 16.0 GB para el checkpoint completo, más overhead de runtime (exllamav3), por lo que se recomienda al menos 16 GB de VRAM libre.
- GPUs compatibles: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 40GB, A6000, L40S, etc. En GPUs con menos de 16 GB, se podría intentar offloading, pero degradaría el rendimiento.
- No es compatible con vLLM; requiere exllamav3 o TabbyAPI.
- Throughput estimado: ~570 tok/s en single-stream argmax en una GPU no especificada, según la model card. No se proporcionan datos de latencia.
- Para uso en producción con múltiples usuarios, se necesitaría un servidor con exllamav3 y posiblemente múltiples GPUs, aunque el throughput por usuario será limitado.

## Comparativa con modelos similares

La tabla de benchmarks ya compara con otras cuantizaciones del mismo modelo base. A continuación se resumen las diferencias clave:

| Modelo | bits/wt | Tamaño | Confident ↓ | Certain ↓ | Runtime |
|---|---|---|---|---|---|
| TelperionAI INT4-AWQ-GPTQ | 4.63 | 25.1 GB | 0.93% | 0.09% | vLLM |
| EXL3 5.5 bpw | 5.50 | 20.0 GB | 1.34% | 0.16% | exllamav3 |
| EXL3 4.0 bpw (este) | 4.00 | 16.0 GB | 2.40% | 0.58% | exllamav3 |
| TelperionAI NVFP4 | 4.50 | 24.7 GB | 1.85% | 0.16% | vLLM |

La INT4-AWQ-GPTQ es más fiel en las métricas críticas, pero ocupa 9 GB más y requiere vLLM. La EXL3 5.5 bpw ofrece un equilibrio mejor (1.34% confident) a 20 GB. Este modelo es el más pequeño, pero con mayor discrepancia en confident y certain.

## Limitaciones y advertencias

- Requiere exllamav3 o TabbyAPI; no puede servirse con vLLM, lo que limita su integración en stacks existentes.
- La cuantización a 4.0 bpw presenta una discrepancia del 2.40% en posiciones "confiadas" y 0.58% en "ciertas", lo que puede traducirse en errores de razonamiento o alucinaciones en tareas críticas.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.) para esta cuantización, por lo que su rendimiento en tareas específicas no está validado.
- El número de parámetros reportado en safetensors (8.43B) no coincide con el nombre del modelo base (27B); se recomienda verificar la integridad del checkpoint antes de usarlo.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma específicas de esta cuantización; se heredan las del modelo base, que no se detallan en la documentación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener términos adicionales; se recomienda revisar la licencia de Qwen3.8-27B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TelperionAI/Qwen3.8-27B-EXL3-4.0bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de exllamav3: https://github.com/turboderp-org/exllamav3
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio de Qwen3.8-27B (AlibabaCloud): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Otra cuantización del mismo autor: https://huggingface.co/TelperionAI/Qwen3.8-27B-NVFP4-AWQ-GPTQ
