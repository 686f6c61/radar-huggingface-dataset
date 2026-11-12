# vcruz305/Nex-N2.6-SAGE-REXL3-2.48bpw

## Resumen

Nex-N2.6-SAGE-REXL3-2.48bpw es una cuantización de precisión muy baja (2,48 bits por peso) del modelo base nex-agi/Nex-N2.6, publicada por el usuario vcruz305 en Hugging Face. Se trata de una conversión al formato EXL3 (ExLlamaV3) mediante la técnica SAGE-REXL3, orientada a reducir drásticamente el espacio en disco y la VRAM necesaria para servir un modelo de arquitectura MoE de aproximadamente 51.800 millones de parámetros totales. El resultado es un repositorio de 103,8 GB en safetensors, lo que supone un recorte sustancial frente a los pesos en precisión completa del modelo original.

La relevancia de esta ficha radica en que permite ejecutar un MoE de gran tamaño en hardware más modesto que el requerido por el modelo base, a costa de una pérdida de calidad que no está documentada en la información disponible. El modelo conserva las capacidades del original (generación de texto y conversación) y está etiquetado para inglés y chino, con licencia Apache 2.0 heredada del modelo base.

No obstante, conviene subrayar que se trata de una publicación de terceros con cero descargas y cero likes en el momento de la consulta, acceso restringido (gated) y sin documentación técnica publicada sobre el proceso de cuantización ni evaluaciones de degradación. Cualquier uso en producción debería ir precedido de una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), según tag `moe`; detalles de la arquitectura del modelo base no disponibles |
| Parametros totales | 51.824.918.622 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2,48 bpw (bits por peso); otras variantes no disponibles |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base nex-agi/Nex-N2.6 es un transformer con mezcla de expertos (MoE), a juzgar por las etiquetas del repositorio (`moe`, `glm5_next`). No se dispone de información publicada en la documentación proporcionada sobre el número de parámetros activos por token, el número de expertos, la composición del dataset de entrenamiento, el volumen de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica de esta publicación concreta es la cuantización SAGE-REXL3 a 2,48 bpw, implementada sobre el runtime ExLlamaV3 (etiquetas `exl3`, `exllamav3`, `rexl3`). Se trata de una compresión agresiva que busca mantener la fidelidad de los pesos en un régimen de precisión inferior a 3 bits, algo especialmente delicado en modelos MoE donde distintos expertos pueden verse afectados de forma desigual. No se han publicado detalles del algoritmo SAGE ni métricas de error de reconstrucción.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y respuesta a instrucciones heredados del modelo base, sin evaluación publicada en esta cuantización.
- Soporte multilingüe limitado a inglés y chino según los tags del repositorio.
- Compatibilidad con el runtime ExLlamaV3 para inferencia optimizada en GPU.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Despliegue de un MoE de ~51,8B en una sola GPU de 24 GB: con 2,48 bpw y 103,8 GB de pesos, el modelo sigue sin caber íntegramente en una RTX 4090, pero el formato EXL3 permite repartir expertos entre VRAM y memoria del sistema con ExLlamaV3, algo inviable con pesos en fp16.
- Servicio de chat multilingüe inglés-chino en entornos con presupuesto de VRAM ajustado: adecuado para prototipos y demos internas donde la latencia no sea crítica y se acepte cierta degradación de calidad.
- Investigación sobre cuantización extrema: este repositorio sirve como artefacto para estudiar el comportamiento de un MoE a 2,48 bpw y comparar su salida con el modelo base nex-agi/Nex-N2.6.
- Experimentación con ExLlamaV3: útil para validar pipelines de inferencia EXL3, medir throughput y evaluar la estabilidad del runtime con modelos MoE cuantizados.
- Generación de texto por lotes en local: para tareas de resumen, reescritura o clasificación donde no se requiera la máxima fidelidad del modelo original.
- Base para ajuste fino ligero o evaluación comparativa: al estar en safetensors y con licencia Apache 2.0, puede servir como punto de partida para estudios de degradación por cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de perplejidad comparadas con el modelo base.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 103,8 GB en disco a 2,48 bpw; la VRAM necesaria para cargarlos íntegramente es del mismo orden, por lo que no cabe en una GPU de consumo individual.
- GPU recomendadas: configuraciones multi-GPU (por ejemplo, 2× A100 80 GB o 4× RTX 4090/A6000) para carga completa; una sola GPU de 24 GB solo es viable con offloading parcial de expertos a RAM del sistema.
- GPU de consumo: no cabe en una RTX 4090, 4080 o 3090 sin offloading; el rendimiento con offloading dependerá del ancho de banda PCIe y de la RAM disponible.
- Opciones de despliegue: ExLlamaV3 es el runtime nativo del formato EXL3; no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no soportan EXL3 de forma estándar.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nex-N2.6-SAGE-REXL3-2.48bpw | 51,8B | no disponible | EXL3 2,48 bpw | Apache 2.0 | Gated, 0 descargas |
| nex-agi/Nex-N2.6 (base) | 51,8B | no disponible | fp16/bf16 (presumible) | Apache 2.0 | Repositorio original del autor |
| Alternativas de ~50B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Cuantización a 2,48 bpw: la degradación de calidad respecto al modelo base no está medida ni documentada; es esperable una pérdida notable en razonamiento, matemáticas y código.
- Publicación de terceros: el autor vcruz305 no es el desarrollador del modelo base; no hay garantías de fidelidad del proceso de conversión.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.
- Cero descargas y cero likes: sin validación comunitaria ni informes de uso.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Riesgo de alucinación: inherente a los modelos de lenguaje y potencialmente agravado por la cuantización extrema.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base, desconocidos.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluaciones hace recomendable una validación propia antes de producción.
- Compatibilidad limitada: el formato EXL3 requiere ExLlamaV3; no es portable a otros runtimes sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vcruz305/Nex-N2.6-SAGE-REXL3-2.48bpw
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.6
- ExLlamaV3 (runtime): no disponible en la información proporcionada
- Paper o blog de SAGE-REXL3: no disponible en la información proporcionada
