# YFC-112358/Qwen3.8-27B-Della-Deckard-Fable-Qwopus-ColdFusion-v4

## Resumen

Este modelo es una fusión experimental de varios modelos derivados de Qwen3.6-27B y Qwen3.8-27B, creada por el usuario YFC-112358. El objetivo es combinar las capacidades de distintos fine-tunes y merges comunitarios en un único conjunto de pesos mediante técnicas de interpolación lineal de vectores de tarea (task arithmetic) y el método DELLA. El resultado es un modelo denso de aproximadamente 27.800 millones de parámetros, con arquitectura de Qwen3.8-27B (transformers, 64 capas, hidden size 5120, FFN 17408, con módulo MTP y torre de visión), licencia Apache 2.0 y pesos en formato safetensors.

La relevancia de este modelo radica en su enfoque metodológico: el autor documenta en detalle un proceso de fusión en tres etapas que intenta transferir mejoras de una generación de Qwen (3.6) a otra (3.8) mediante el cambio de ancla (re-anchoring) de vectores de tarea. Sin embargo, el propio autor advierte que esta operación "cross-generation" no tiene garantía matemática y que el resultado puede degradarse silenciosamente si las bases no están alineadas. Es, por tanto, un modelo de investigación y experimentación, no un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers denso (Qwen3.8-27B): 64 capas, hidden 5120, FFN 17408, con MTP y torre de vision |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (depende de la configuracion del modelo base Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 segun el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero, sino que es el resultado de una fusión de siete modelos base mediante mergekit. El proceso se describe en tres etapas:

1. **Etapa 1 (DELLA linear)**: se combinan tres modelos derivados de Qwen3.6-27B (`DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0`, `YFC-112358/Qwen3.6-27B-Della-Deckard-Isometry-Geodesic-v2` y `nightmedia/Qwen3.6-27B-Seven`) con pesos y densidades específicos para crear un "complejo de inteligencia general" G. Se usa el método DELLA (una variante de task arithmetic con poda basada en magnitud) con `epsilon=0.30`, `lambda=1.0` y máscara int8.

2. **Etapa 2 (task arithmetic)**: se suma linealmente el vector de tarea del modelo `KyleHessling1/Qwopus3.6-27B-Fusion-BF16` relativo a `Qwen/Qwen3.6-27B` al complejo G. Esta etapa no aplica poda (density=1.0), por lo que equivale a una suma directa de pesos.

3. **Etapa 3 (re-anclaje cross-generation)**: se toma el resultado de la etapa 2 y se le aplica un cambio de ancla: `out = Cold-Fusion + (stage2 − Qwen3.6)`, donde `Cold-Fusion` es `DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1` (basado en Qwen3.8). Esto transfiere el vector de tarea relativo a Qwen3.6 a la base Qwen3.8.

El autor mide la salud de la fusión con métricas como `amp` (amplitud del incremento total, 0.0202), `share` (proporción de masa entre G y Qwopus, 26.002), `kill₂` (0.0% de elementos eliminados en la etapa 2) y `cold_amp` (0.1217, que indica la distancia entre Qwen3.8 y Qwen3.6). El valor de `cold_amp` está dentro del rango esperado para un mismo linaje (0.02–0.20), lo que sugiere que Qwen3.8 podría ser una continuación de Qwen3.6, pero el autor advierte que no hay garantía matemática.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.8-27B.
- Razonamiento y comprensión de lenguaje natural, presumiblemente similar a Qwen3.8-27B (no hay benchmarks propios).
- Capacidades multimodales (visión) del modelo base Qwen3.8-27B, aunque no se han verificado en este merge.
- Soporte de tool calling y flujos agénticos, según las características documentadas de Qwen3.8-27B.
- Posible mejora en tareas específicas derivadas de los modelos fusionados (Fable, Qwopus, Cold-Fusion, etc.), pero sin evidencia empírica publicada.

## Casos de uso

- **Experimentación con técnicas de fusión de modelos**: este modelo sirve como caso de estudio para investigadores interesados en task arithmetic, DELLA y re-anclaje entre generaciones de un mismo linaje. Permite analizar si la transferencia de vectores de tarea entre Qwen3.6 y Qwen3.8 produce mejoras reales o degradación.
- **Pruebas de robustez de merges comunitarios**: al ser un merge de varios fine-tunes populares, puede usarse para evaluar si la combinación de distintos estilos de entrenamiento (Fable, Qwopus, Cold-Fusion) produce un comportamiento coherente o conflictos.
- **Generación de texto en entornos de investigación**: para tareas de generación creativa, resúmenes o diálogos donde no se requiera precisión absoluta, el modelo puede ofrecer un comportamiento interesante por su mezcla de influencias.
- **Evaluación de capacidades heredadas**: se puede comparar el rendimiento de este merge frente a Qwen3.8-27B original en tareas de razonamiento, código o visión para medir el impacto de la fusión.
- **Desarrollo de adaptadores LoRA**: el autor proporciona un adaptador LoRA complementario (`Qwen3.8-27B-Della-Deckard-Fable-Qwopus-ColdFusion-v4-LoRA`) que puede aplicarse a cualquier modelo Qwen3.8, lo que permite probar el vector de tarea extraído sin necesidad de cargar el modelo completo.
- **Análisis de alineación entre generaciones**: el modelo sirve como herramienta para investigar si Qwen3.8 es una continuación de Qwen3.6, mediante el análisis de la distancia entre sus espacios de pesos (`cold_amp`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Dado que es un merge experimental, no se puede afirmar ningún nivel de rendimiento sin datos verificados.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55,6 GB solo para los pesos, más overhead de activaciones y KV cache. Se recomienda al menos 70 GB de VRAM.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU con al menos 2×RTX 4090 (24 GB cada una) usando offload o tensor parallelism.
- En consumer GPU: no cabe en una sola RTX 4090 (24 GB) ni en una RTX 3090 (24 GB). Se necesitaría cuantización a 4 bits o 8 bits para intentar ejecutarlo en una sola GPU de 24 GB, pero no se proporcionan archivos GGUF ni cuantizados.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se generan archivos GGUF), o directamente con transformers y `device_map="auto"` para distribución entre GPUs.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base oficial) | 27,8 B | No disponible | Apache 2.0 | Modelo original de Alibaba, multimodal, con soporte agéntico |
| YFC-112358/Qwen3.8-27B-Della-Deckard-Fable-Qwopus-ColdFusion-v4 | 27,8 B | No disponible | Apache 2.0 | Merge experimental de 7 modelos, con re-anclaje cross-generation |
| DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 | 27,8 B | No disponible | Apache 2.0 | Modelo base de la etapa 3, basado en Qwen3.8 |

No se dispone de benchmarks comparativos entre estos modelos. El modelo se diferencia del Qwen3.8-27B oficial por su proceso de fusión, que intenta combinar mejoras de varios fine-tunes de Qwen3.6. No obstante, al ser un merge sin evaluación publicada, su rendimiento relativo es desconocido.

## Limitaciones y advertencias

- **Riesgo de degradación silenciosa**: el propio autor advierte que la tercera etapa (re-anclaje cross-generation) no tiene garantía matemática. Si Qwen3.6 y Qwen3.8 no comparten el mismo espacio de pesos, el modelo puede "volverse tonto" sin errores visibles.
- **Naturaleza experimental**: el modelo es un experimento de investigación, no un producto estable. No se recomienda para uso en producción sin una evaluación exhaustiva.
- **Dependencia de modelos no verificados**: uno de los modelos base (`DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1`) está marcado como "working title" y sus pesos pueden haber cambiado desde la construcción del merge.
- **Sin benchmarks**: no hay evidencia empírica de que el modelo mejore o iguale el rendimiento de Qwen3.8-27B original.
- **Posibles sesgos heredados**: al ser una fusión de múltiples modelos entrenados con datos diversos, los sesgos de cada uno pueden combinarse o amplificarse, sin que se hayan realizado auditorías de sesgo.
- **Alucinaciones**: como cualquier modelo generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento complejo o hechos específicos.
- **Limitaciones de contexto**: no se especifica la longitud de contexto soportada; depende de la configuración del modelo base y podría no ser tan amplia como la de Qwen3.8-27B oficial.
- **Idiomas**: no se documentan los idiomas soportados; se asume herencia del modelo base, pero sin confirmación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/YFC-112358/Qwen3.8-27B-Della-Deckard-Fable-Qwopus-ColdFusion-v4)
- [Adaptador LoRA complementario](https://huggingface.co/YFC-112358/Qwen3.8-27B-Della-Deckard-Fable-Qwopus-ColdFusion-v4-LoRA) (mencionado en la model card)
- [Repositorio de Qwen3.8-27B (Alibaba)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Perfil del autor en Hugging Face](https://huggingface.co/YFC-112358/models)
