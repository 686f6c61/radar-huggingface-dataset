# Whalswp/Kuavo-N1.5_Stage1

## Resumen

Kuavo-N1.5 Stage 1 es un modelo de inteligencia artificial desarrollado por el usuario Whalswp, publicado en HuggingFace el 3 de septiembre de 2026. El nombre y el dataset utilizado (LET-KUAVO-VLA-1.0) sugieren que se trata de un modelo de tipo VLA (Vision-Language-Action), orientado probablemente a tareas de robótica o control de agentes, aunque la información pública no lo confirma explícitamente. El repositorio tiene un tamaño de 48,6 GB, lo que indica que los pesos del modelo son de gran tamaño, pero no se especifica la arquitectura ni el número de parámetros.

La model card, escrita en coreano, detalla únicamente el proceso de entrenamiento de esta primera etapa: se utilizaron 46 tareas (excluyendo una tarea de inspección y clasificación de cargadores), 22.460 episodios y más de 10,4 millones de frames, sumando un total de 288,87 horas de datos. El entrenamiento se realizó en dos GPUs H200 con un batch global de 256, durante una sola época y 40.622 pasos, con un tiempo medido de 54 horas y 8 minutos. No se proporciona información sobre la arquitectura, licencia, idiomas soportados ni capacidades específicas, por lo que esta ficha se limita a los datos disponibles y marca el resto como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (si es transformer, MoE, SSM, híbrido, etc.), ni sobre el número de parámetros, la longitud de contexto o el proceso de alineación (RLHF, DPO, etc.). El nombre del dataset, LET-KUAVO-VLA-1.0, sugiere que el modelo está diseñado para tareas de visión-lenguaje-acción, pero no hay confirmación oficial.

En cuanto al entrenamiento, la model card indica que se trata de la "Stage 1" (etapa 1) y proporciona los siguientes datos concretos:

- Dataset: LET-KUAVO-VLA-1.0
- Tareas: 46 (se excluyó la tarea `046-inspect-and-sort-chargers`)
- Episodios: 22.460
- Frames: 10.399.217
- Duración total de los datos: 288,87 horas
- GPUs: 2x H200 (GPU 0 y GPU 1)
- Batch: 128 por GPU, global 256
- Épocas: 1
- Pasos: 40.622
- Tiempo de entrenamiento: 54 horas y 8 minutos (medido)

No se especifica si se utilizó alguna técnica de regularización, aumentación de datos o si hubo fases posteriores de entrenamiento (Stage 2, etc.).

## Capacidades

No se dispone de información pública sobre las capacidades específicas del modelo. El nombre "VLA" en el dataset sugiere que podría estar orientado a tareas de visión, lenguaje y acción (por ejemplo, control de robots o agentes), pero no hay documentación que lo confirme. No se conocen capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes o multilingüismo.

## Casos de uso

No se dispone de información suficiente para proponer casos de uso concretos. Dado que el modelo parece estar entrenado con datos de tipo VLA, es plausible que esté pensado para aplicaciones de robótica o automatización, pero no hay documentación que respalde esta afirmación. Se recomienda consultar la página del modelo en HuggingFace para futuras actualizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware para inferencia. El entrenamiento se realizó con 2 GPUs H200 (cada una con 141 GB de VRAM), lo que sugiere que el modelo es de gran tamaño, pero no se especifica la VRAM necesaria para ejecutarlo. No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) ni datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información pública, ni se dispone de datos de rendimiento para establecer una comparación.

## Limitaciones y advertencias

- La información pública es extremadamente limitada: no se conocen la arquitectura, los parámetros, la licencia ni los idiomas soportados.
- No se han publicado resultados de benchmarks ni evaluaciones de sesgos o alucinaciones.
- El modelo se distribuye sin una model card completa, lo que dificulta su uso en producción sin una evaluación previa.
- No se especifica si la licencia permite uso comercial; se debe contactar con el autor para obtener aclaraciones.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo muy reciente o poco difundido.

## Enlaces

- [HuggingFace: Whalswp/Kuavo-N1.5_Stage1](https://huggingface.co/Whalswp/Kuavo-N1.5_Stage1)

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios de código o demos) en la búsqueda web.
