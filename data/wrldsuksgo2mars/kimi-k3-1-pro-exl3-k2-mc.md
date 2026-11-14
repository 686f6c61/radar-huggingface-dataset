# wrldsuksgo2mars/Kimi-K3.1-Pro-EXL3-K2-MC

## Resumen

Kimi-K3.1-Pro-EXL3-K2-MC es una cuantización de 2 bits del modelo Kimi-K3.1-Pro de Moonshot AI, publicada por el usuario wrldsuksgo2mars bajo el formato EXL3 (ExLlamaV3) con soporte multi-core. El checkpoint deriva del commit `6d0a0202956796543364d666ab19c6ad1a494ee1` del modelo base y contiene 419.519.692.544 parámetros totales, con un tamaño de repositorio de 893,8 GB. La propuesta es ofrecer una versión comprimida del modelo original manteniendo el núcleo BF16 intacto y añadiendo vistas alternativas K8 y K6 para los expertos.

El modelo base Kimi-K3.1-Pro es un modelo de Moonshot AI con arquitectura Gated DSA (según se menciona en la model card), orientado a tareas agénticas y de razonamiento. La cuantización EXL3 busca reducir el peso en disco y memoria para facilitar su despliegue, aunque el autor indica explícitamente que no se reclama ninguna cualificación de calidad de generación ni de rendimiento en serving.

Es relevante ahora porque representa un intento de hacer viable el despliegue de un modelo de más de 400.000 millones de parámetros mediante cuantización agresiva a 2 bits, pero con una advertencia crítica: el motor de serving para la arquitectura Gated DSA de Kimi K3.1 está pendiente de soporte (issue #1777 de cuteafd), por lo que el checkpoint solo carga para diagnóstico golden y no para generación completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DSA (según model card del autor); transformer con atención DSA no confirmado explícitamente |
| Parametros totales | 419.519.692.544 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 2-bit (K2), con vistas alternativas K8 y K6 para expertos; núcleo BF16 original preservado |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (other, con enlace a la licencia del modelo base) |
| Formato de pesos | safetensors, custom_code, EXL3 |

## Arquitectura y entrenamiento

La model card indica que el checkpoint es una cuantización EXL3 multi-core derivada de Kimi-K3.1-Pro. El índice por defecto selecciona el núcleo BF16 original, mientras que `cuteafd-mc.json` descubre vistas alternativas completas K8 y K6; los expertos, medios y drafters son compartidos entre vistas. Se menciona que las 926 matrices del núcleo BF16 original son byte-exactas respecto al origen y que la auditoría de codificación K8 independiente pasó. El autor indica que la arquitectura del modelo base es "Kimi K3.1 Gated DSA", aunque no se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) ni innovaciones técnicas del modelo base.

No se dispone de información sobre el proceso de entrenamiento del modelo base ni sobre el dataset utilizado para la cuantización más allá de la referencia a `wrldsuksgo2mars/agentic-quant-panel-v1`. El autor advierte que los diagnósticos del padre describen la cuantización parental, no el núcleo restaurado, y que no se reclama calidad de generación ni rendimiento de serving.

## Capacidades

- No se han publicado capacidades específicas del modelo en la información disponible.
- La model card no detalla soporte de tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües.
- No se confirma soporte de visión, audio ni modo thinking.
- El checkpoint está diseñado para carga en el motor cuteafd, pero el serving de la arquitectura Gated DSA está pendiente (issue #1777), por lo que la generación completa no está cualificada.
- El autor indica que el checkpoint solo carga para el diagnóstico golden explícito hasta que se resuelva el soporte del motor.

## Casos de uso

- Investigación sobre cuantización extrema: el checkpoint sirve como material de estudio para analizar la viabilidad de cuantizar modelos de más de 400.000 millones de parámetros a 2 bits con preservación byte-exacta del núcleo BF16.
- Auditoría de fidelidad de pesos: gracias a `package-validation.json` y a las pruebas de bytes del núcleo original, se puede usar para verificar pipelines de cuantización y comparar vistas K8/K6.
- Diagnóstico de motores de inferencia: útil para desarrolladores que trabajen en el soporte de Gated DSA en cuteafd (issue #1777) y necesiten un checkpoint de referencia para pruebas de carga.
- Evaluación de compresión multi-core: permite estudiar el enfoque de vistas alternativas compartiendo expertos, medios y drafters, relevante para investigación en serving eficiente.
- Pruebas de integración de ExLlamaV3: el formato EXL3 permite experimentar con el ecosistema ExLlamaV3 en entornos controlados.
- Docencia y divulgación: como ejemplo documentado de cuantización a 2 bits con advertencias explícitas sobre limitaciones de serving.

No se recomienda su uso en producción para generación de texto, atención al cliente, generación de código ni tareas agénticas, dado que el autor no reclama calidad de generación ni rendimiento de serving.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que "full-model generation, KL/top-1 qualification and serving benchmarks are not part of this quantization run" y que no se reclama ningún pase de serving-readiness.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 893,8 GB en disco; una cuantización a 2 bits de 419.519.692.544 parámetros requeriría del orden de 100 GB solo para pesos, pero no se confirma el tamaño efectivo tras la compresión EXL3.
- GPU recomendadas: no disponible. No se especifican GPU validadas.
- ¿Cabe en consumer GPU? No disponible. Con 419.500 millones de parámetros, incluso a 2 bits, es improbable que quepa en una GPU de consumo, pero no se confirma.
- Opciones de despliegue: el autor menciona el motor cuteafd (con soporte pendiente para Gated DSA, issue #1777). No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor no reclama rendimiento de serving.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Estado de serving |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-EXL3-K2-MC | 419.519.692.544 | no disponible | EXL3 2-bit (K2) | kimi-k3.1-pro (other) | Pendiente (issue #1777) |
| Kimi-K3.1-Pro (base) | no disponible | no disponible | BF16 | kimi-k3.1-pro (other) | No disponible |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que no se reclama calidad de generación ni rendimiento de serving; el checkpoint solo carga para diagnóstico golden.
- El serving de la arquitectura Gated DSA está pendiente en cuteafd (issue #1777); la generación completa, la cualificación KL/top-1 y los benchmarks de serving no forman parte de esta ejecución.
- La comprobación `--require-ready` fue rechazada por el gate de serving deliberado de #1777; no se reclama ningún pase de serving-readiness.
- Los diagnósticos del padre describen la cuantización parental, no el núcleo restaurado; hay que consultar `README.parent.md` y los archivos de licencia heredados para los términos del checkpoint.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Limitaciones de contexto e idioma: no disponible.
- Restricciones de licencia: licencia "other" con nombre `kimi-k3.1-pro`; se debe consultar el enlace de licencia del modelo base para uso comercial.
- El repositorio ocupa 893,8 GB, lo que implica requisitos de almacenamiento considerables.
- Solo 20 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria significativa.
- El autor indica que TJ aprobó explícitamente la publicación con la cualificación de serving pendiente; el recibo del planificador fallido se conserva con la evidencia de publicación.

## Enlaces

- Hugging Face: https://huggingface.co/wrldsuksgo2mars/Kimi-K3.1-Pro-EXL3-K2-MC
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/6d0a0202956796543364d666ab19c6ad1a494ee1/LICENSE
- Dataset de cuantización: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
- Issue de serving en cuteafd: https://github.com/tpurtell/cuteafd/issues/1777
