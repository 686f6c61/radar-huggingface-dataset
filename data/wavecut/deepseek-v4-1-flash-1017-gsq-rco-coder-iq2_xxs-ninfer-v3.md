# WaveCut/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-IQ2_XXS-NInfer-v3

## Resumen

DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-IQ2_XXS-NInfer-v3 es un artefacto de inferencia en formato NInfer v3, publicado por WaveCut, que empaqueta una versión podada por expertos del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek. El modelo de partida es la build GSQ-RCO Coder de ISTA-DASLab, que elimina 192 de los 384 expertos enrutados de cada uno de los 40 bloques (la mitad), seleccionados con el criterio RCO para preservar código, uso agéntico de herramientas, contexto largo y visión. Se mantienen seis expertos activos por token, como en la versión original.

El artefacto es un único fichero de 77.148.393.216 bytes (71,85 GiB) que conserva los bloques de cuantización ggml del GGUF IQ2_XXS original byte a byte, y que el motor NInfer multiplica en su sitio. Está pensado para servir el modelo en una única GPU de 24 GB (RTX 4090) manteniendo los expertos enrutados en memoria de host fijada (61,50 GiB) o transmitiéndolos desde el fichero. Incluye además los componentes de borrador especulativo DSpark y la torre de visión.

Su relevancia es doble: demuestra una ruta concreta para ejecutar un MoE de gran tamaño en hardware de consumo mediante poda de expertos y precisión mixta, y expone las limitaciones de ese enfoque. El propio autor advierte que eliminar la mitad de los expertos degrada capacidades fuera de los dominios sobre los que se calibró la búsqueda, y que las builds estándar de NInfer rechazan este fichero porque la familia de modelos y los formatos `gguf_*` solo existen en la rama NInfer-all.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con atención latente, router, compresores, indexadores y matrices de hiperconexión; torre de visión y borrador especulativo DSpark |
| Parametros totales | no disponible (repo de 71,85 GiB; expertos enrutados 61,50 GiB) |
| Parametros activos | 6 expertos enrutados por token sobre 192 por bloque (40 bloques) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_M, IQ2_XXS, IQ2_XS (expertos enrutados); Q5_K (expertos compartidos, token table, output head, proyecciones Engram); Q8_0 (proyecciones de atención latente); FP32 (router, compresores, indexadores, hiperconexión, normas, attention sinks); BF16/FP32 en torre de visión; STQ trellis words uint16 y FP16 en el borrador DSpark |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | NInfer v3 (`.ninfer`), derivado de GGUF |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer de mezcla de expertos con atención latente (proyecciones de query y down latentes), router con seis expertos activos por token, compresores e indexadores de contexto, matrices de hiperconexión y una tabla Engram separada. La build Coder de ISTA-DASLab aplica poda de expertos: de los 384 expertos enrutados por bloque en los 40 bloques, se eliminan 192 mediante el criterio RCO, calibrado para conservar código, uso agéntico de herramientas, contexto largo y visión. La cuantización por tensor del build IQ2_XXS se mantiene en los 192 expertos restantes.

Este artefacto de WaveCut no reentrena ni recalibra: reempaqueta los tensores del GGUF de ISTA-DASLab en un contenedor NInfer v3, conservando los bloques ggml de cada tensor byte a byte para que el motor los multiplique en su sitio. Los datos de entrenamiento del modelo original (número de tokens, composición del dataset, si hubo RLHF o DPO) no están disponibles en la información proporcionada. Las innovaciones técnicas destacables del artefacto son la representación contigua de cada experto (filas de gate seguidas de filas de up, un rango de bytes por experto), el uso de memoria de host fijada para los expertos enrutados, la decodificación especulativa con borradores DSpark y context-lookup drafting, y el reparto de cómputo de expertos entre CPU y GPU durante cada llamada de decodificación.

## Capacidades

- Generación de texto y razonamiento, con modo de razonamiento explícito (reasoning).
- Generación de código, dominio para el que se calibró la poda de expertos.
- Uso agéntico de herramientas: las llamadas DSML se devuelven como tool calls en formato OpenAI.
- Salida estructurada (structured output).
- Procesamiento de imágenes con la bandera `--vision`, mediante torre de visión y aligner del release en BF16.
- Decodificación especulativa con borradores DSpark (`--spec dspark`) y context-lookup drafting.
- Hasta ocho peticiones concurrentes y reutilización de prefijo de prompt.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Contexto largo: la poda se calibró para preservarlo, pero la longitud exacta no está disponible.

## Casos de uso

- Asistencia de código en estación de trabajo local: el modelo se sirve en una RTX 4090 de 24 GB con los expertos enrutados en memoria de host, lo que permite autocompletado, refactorización y explicación de código sin depender de APIs externas.
- Agentes de programación con tool calling: las llamadas DSML se convierten en tool calls de OpenAI, de modo que se puede integrar en frameworks de agentes que ejecuten tests, lean ficheros o consulten repositorios en varios pasos.
- Revisión de código con capturas de pantalla: con `--vision` se pueden adjuntar imágenes de errores de compilación, diagramas de arquitectura o interfaces para que el modelo las interprete junto al código.
- Servicio multiusuario ligero: admite hasta ocho peticiones concurrentes con reutilización de prefijo de prompt, adecuado para un pequeño equipo interno con un solo servidor.
- Extracción de datos estructurados: la salida estructurada permite generar JSON validado en pipelines de ingestión, clasificación o enriquecimiento de registros.
- Prototipado de contexto largo: la calibración de la poda preserva contexto largo, útil para analizar ficheros extensos o documentación técnica en una sola pasada.
- Experimentación en investigación sobre MoE y poda: el artefacto documenta el reparto de precisión por componente y permite medir el coste real de eliminar la mitad de los expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: una única GPU de 24 GB (RTX 4090) es el objetivo declarado; la GPU retiene 5,85 GiB del artefacto, más 3,58 GiB si se ejecuta el borrador DSpark y 0,90 GiB con `--vision`.
- Memoria de host: 61,50 GiB de expertos enrutados en memoria fijada, o transmisión desde el fichero de 71,85 GiB.
- GPU recomendadas: RTX 4090 (24 GB) según el autor; otras GPU de 24 GB o más no están documentadas en la información disponible.
- Cabe en GPU de consumo: sí, en RTX 4090, con los expertos en memoria de host o en disco.
- Despliegue: exclusivamente con NInfer-all (rama `master`), commit `ab84dcfa0` o posterior; las builds estándar de NInfer rechazan el fichero. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; con expertos en host, los hilos de CPU calculan parte de los expertos faltantes de cada llamada de decodificación mientras la GPU copia el resto.
- Dependencia adicional: la tabla Engram se descarga por separado desde el repositorio WaveCut/DeepSeek-V4.1-Flash-Engram-IQ4_NL-NInfer-v3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este artefacto (Coder IQ2_XXS podado) | no disponible; 192 de 384 expertos por bloque | no disponible | MIT | NInfer v3 | Solo NInfer-all; 24 GB de VRAM con expertos en host |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | no disponible; 384 expertos por bloque | no disponible | no disponible | GGUF | Release sin podar recomendado por ISTA-DASLab para uso general |
| WaveCut/DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ1_M-NInfer-v3 | no disponible; 384 expertos por bloque | no disponible | no disponible | NInfer v3 | Conversión NInfer de un release sin podar; misma infraestructura |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La poda de la mitad de los expertos degrada capacidades fuera de los dominios de calibración (código, uso agéntico, contexto largo y visión); ISTA-DASLab recomienda los releases sin podar para uso general.
- El fichero solo lo carga NInfer-all; las builds estándar de NInfer lo rechazan, lo que limita la portabilidad y el soporte de la comunidad.
- Requiere descargar por separado la tabla Engram; sin ella el modelo no está completo.
- El borrador DSpark se entrenó para el modelo sin podar y solo actúa como propuesta: la verificación mantiene los tokens de la decodificación normal, por lo que la ganancia de velocidad puede ser menor.
- La plantilla de chat es una transcripción propia de NInfer del `encoding/encoding.py` del release, que no incluye plantilla Jinja; puede haber divergencias respecto al formato oficial.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; es inherente a los modelos generativos y puede verse agravado por la poda.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del artefacto podado en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/WaveCut/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-IQ2_XXS-NInfer-v3)
- [Modelo base: ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF](https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF)
- [Release sin podar: ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF](https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF)
- [Modelo original: deepseek-ai/DeepSeek-V4.1-Flash-1017](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017)
- [Artefacto IQ1_M de WaveCut](https://huggingface.co/WaveCut/DeepSeek-V4.1-Flash-1017-GSQ-RCO-IQ1_M-NInfer-v3)
- [Tabla Engram: WaveCut/DeepSeek-V4.1-Flash-Engram-IQ4_NL-NInfer-v3](https://huggingface.co/WaveCut/DeepSeek-V4.1-Flash-Engram-IQ4_NL-NInfer-v3)
- [Pack STQ de borradores: beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw](https://huggingface.co/beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw)
- [Motor NInfer](https://github.com/Neroued/ninfer)
- [NInfer-all](https://github.com/iamwavecut/ninfer-all)
- [Commit de conversión ab84dcfa0](https://github.com/iamwavecut/ninfer-all/commit/ab84dcfa07b8c011263fa884e9ece4de7d81bcb0)
- Papers citados en las etiquetas: arXiv:2604.18556 y arXiv:2605.00649 (no verificados en la información proporcionada).
