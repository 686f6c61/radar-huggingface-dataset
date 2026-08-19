# underlotus/Qwen3.8-27B-heretic-ara-oQ3e-mtp

## Resumen

Este modelo es una cuantización de precisión mixta (oQ3e) del modelo `trohrbaugh/Qwen3.8-27B-heretic-ara`, que a su vez es una versión decensored y abliterada del Qwen3.8-27B de Alibaba. Desarrollado por underlotus, está optimizado para Apple Silicon mediante la librería MLX, manteniendo intacta la torre de visión (entrada de imagen y vídeo) y la cabeza de predicción multi-token (MTP). El resultado es un modelo multimodal de 27B que cabe en unos 15 GB de memoria unificada, frente a los ~55 GB de los pesos BF16 originales, lo que lo hace viable en hardware de consumo como los Mac con chip M-series. Su relevancia radica en ofrecer una alternativa ligera y sin censura para tareas de visión y lenguaje en local, con una licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (basado en Qwen3.8-27B) |
| Parametros totales | 27B (nominal) / 4.149.904.112 reportados en safetensors |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | oQ3e (3-bit con precision mixta por capas) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización de precisión mixta producida con la herramienta oQ (oMLX v0.6.2), que calibra la sensibilidad de cada capa y asigna más bits a las capas críticas (embeddings, LM head y las capas transformer más sensibles), manteniendo el resto en 3-bit. El modelo base, `trohrbaugh/Qwen3.8-27B-heretic-ara`, es un Qwen3.8-27B decensored mediante el fork Heretic v1.2.0 con Arbitrary-Rank Ablation (ARA), que elimina los rechazos (0/100 refusals) con una divergencia KL de 0.0535. El modelo original de Qwen es un LLM multimodal denso de Alibaba, entrenado para destacar en codificación, flujos de trabajo agénticos y automatización de oficina. Esta cuantización conserva la torre de visión completa y la cabeza MTP, lo que permite entrada de imagen y vídeo y predicción multi-token.

## Capacidades

- Generación de texto y razonamiento en inglés y chino.
- Comprensión de imágenes y vídeo (torre de visión intacta).
- Generación de código y soporte de tareas de programación, según las capacidades del modelo base Qwen3.8-27B.
- Soporte de flujos de trabajo agénticos y tool calling (heredado del modelo base).
- Capacidad de predicción multi-token (MTP) para acelerar la decodificación.
- Modelo "uncensored" y "abliterated": no presenta rechazos ante peticiones que otros modelos bloquean (con los riesgos asociados).

## Casos de uso

- Asistente local multimodal en Mac: al ejecutarse en ~15 GB de memoria, puede servir como asistente personal con entrada de imagen y vídeo, por ejemplo para describir capturas de pantalla o analizar vídeos cortos, todo en local sin conexión a la nube.
- Análisis de imágenes y vídeo en investigación: útil para procesar datasets visuales en entornos donde se requiere privacidad y control de datos, gracias a su capacidad de entrada multimodal y su licencia Apache 2.0.
- Generación de código asistida por contexto visual: un desarrollador puede mostrar una captura de un error o un diagrama y pedir al modelo que genere o corrija código, aprovechando su destreza en programación y su entrada de imagen.
- Automatización de oficina: el modelo base destaca en tareas de ofimática, por lo que puede redactar documentos, resumir correos o generar plantillas, con la ventaja de ejecutarse en hardware Apple Silicon sin coste de API.
- Prototipado rápido con MLX: al ser compatible con oMLX y mlx-lm, permite iterar sobre ideas de aplicaciones de IA multimodal en entornos de desarrollo locales, con tiempos de respuesta aceptables (11-12 tok/s en generación).
- Investigación sobre seguridad y alineación: al ser un modelo sin censura, puede utilizarse para estudiar comportamientos de rechazo, sesgos o riesgos de contenido dañino, siempre bajo condiciones controladas y éticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye mediciones de velocidad de inferencia en oMLX sobre un Apple M4 de 10 núcleos, que se resumen a continuación:

| Contexto | Prefill (tok/s) | Generación (tok/s) | Pico de memoria |
|----------|:---------------:|:------------------:|:---------------:|
| 1k       | 63.0            | 11.1               | 15.5 GB         |
| 4k       | 61.8            | 12.3               | 17.1 GB         |

Con MTP deshabilitado, la generación baja a ~8.0 / 7.7 tok/s a 1k / 4k, con un consumo de 13.4 / 14.9 GB. El escalado por batch muestra un rendimiento de 14.5 tok/s con batch 2× y 24.8 tok/s con batch 4×.

## Requisitos de hardware

- Memoria unificada: al menos 16 GB (el pico medido es de 15.5 GB a contexto 1k y 17.1 GB a 4k).
- GPU: exclusivamente Apple Silicon (M1 Pro/Max, M2, M3, M4 o superior) con suficiente RAM unificada; el modelo usa MLX y no es compatible con CUDA.
- Opciones de despliegue: oMLX (`omlx serve`), mlx-lm (carga directa con `load`), y aplicaciones compatibles con MLX como LM Studio.
- Latencia y throughput: en un M4 de 10 núcleos, la generación alcanza ~11-12 tok/s con MTP activado y contexto de 1k-4k; el prefill es de ~62-63 tok/s.
- Para uso en producción, se recomienda un Mac con 32 GB de RAM para margen con contextos largos o procesamiento por lotes.

## Comparativa con modelos similares

La comparativa más directa es con el modelo original en BF16 y con la variante oQ4e del mismo autor:

| Modelo | Peso | Memoria pico | Generación (tok/s, M4) | Licencia |
|--------|------|:------------:|:----------------------:|:--------:|
| Qwen3.8-27B-heretic-ara (BF16) | ~55 GB | >55 GB | No medido | Apache 2.0 |
| underlotus/Qwen3.8-27B-heretic-ara-oQ3e-mtp (este) | ~13.9 GB | 15.5-17.1 GB | 11.1-12.3 | Apache 2.0 |
| underlotus/Qwen3.8-27B-heretic-ara-oQ4e-mtp | No disponible | No disponible | No disponible | Apache 2.0 |

No se dispone de datos de otros modelos de 27B cuantizados para MLX que permitan una comparativa más amplia.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" y "abliterated", puede generar contenido inapropiado, ofensivo o peligroso si se usa sin control. No es adecuado para aplicaciones orientadas al público sin una capa de moderación adicional.
- La cuantización 3-bit puede degradar la calidad de las respuestas en tareas complejas de razonamiento o matemáticas, aunque no se han publicado evaluaciones de calidad para confirmarlo.
- Solo soporta inglés y chino; no hay garantía de buen rendimiento en otros idiomas.
- La discrepancia entre los 27B nominales y los 4.15B reportados en safetensors sugiere que la cuantización o el empaquetado pueden no reflejar el recuento completo de parámetros; se recomienda verificar el comportamiento real antes de usarlo en producción.
- No se han publicado benchmarks de tareas estándar, por lo que no hay evidencia objetiva de su rendimiento frente a otros modelos.
- Es una cuantización no oficial creada por un tercero; puede contener errores de conversión o diferencias de comportamiento respecto al modelo original.
- La licencia Apache 2.0 se hereda del modelo base, pero el uso comercial debe revisar las condiciones específicas del Qwen3.8-27B original.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/underlotus/Qwen3.8-27B-heretic-ara-oQ3e-mtp)
- [Modelo base: trohrbaugh/Qwen3.8-27B-heretic-ara](https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara)
- [Repositorio oficial de Qwen3.8-27B (Alibaba)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Herramienta oQ (oMLX)](https://github.com/jundot/omlx)
- [Benchmark completo a contexto 1k](https://omlx.ai/benchmarks/i362wmvi)
- [Benchmark completo a contexto 4k](https://omlx.ai/benchmarks/qmtx3upy)
