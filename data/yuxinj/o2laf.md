# YuxinJ/O2LaF

## Resumen

O²LaF (One Prior, Two Dynamics) es un modelo de investigacion desarrollado por Yuxin Jiang y colaboradores (ShowLab, NUS) que reutiliza un transformer de difusion de video preentrenado, Wan 2.2 TI2V-5B, para aprender acciones latentes de forma autosupervisada a partir de video sin etiquetas. El modelo combina dos dinamicas sobre un mismo prior: un codificador de acciones que infiere una accion latente para cada transicion de un video y un modelo del mundo (world model) que genera video a partir de un primer fotograma y una secuencia de esas acciones latentes.

La relevancia del trabajo reside en que evita por completo el etiquetado de acciones, un cuello de botella clasico en robotica y aprendizaje por imitacion. En lugar de entrenar desde cero, aprovecha el conocimiento visual de un difusion transformer de video de 5B parametros, lo que reduce el coste computacional y facilita el aprendizaje de dinamicas fisicas plausibles.

El repositorio publica por ahora un unico checkpoint, `o2laf_dit_mixed`, entrenado sobre MiraData y EgoDexMix y con el DiT de Wan como codificador de acciones. El autor anuncia la publicacion futura de otros codificadores (V-JEPA 2, transformer espaciotemporal) y de modelos entrenados en un solo dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de video derivado de Wan 2.2 TI2V-5B, con codificador de acciones latentes y world model |
| Parametros totales | 5B (heredados del modelo base Wan-AI/Wan2.2-TI2V-5B-Diffusers; no se especifica el recuento exacto del checkpoint publicado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende de la longitud de video y del numero de fotogramas) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 12,6 GB) |

## Arquitectura y entrenamiento

O²LaF parte de Wan 2.2 TI2V-5B, un diffusion transformer texto-imagen-a-video, y lo reutiliza como prior compartido para dos modulos. El primero es un codificador de acciones que, dado un par de fotogramas o una transicion de video, produce una representacion latente de la accion realizada. El segundo es un world model que, condicionado por el primer fotograma y una secuencia de acciones latentes, genera el video resultante. El entrenamiento es autosupervisado: no se emplean etiquetas de accion, sino que la coherencia entre la accion inferida y la video generacion actua como senal de aprendizaje.

El checkpoint `o2laf_dit_mixed` se entrena sobre una mezcla de MiraData y EgoDexMix, con el DiT de Wan como codificador de acciones. La model card menciona modos de ejecucion (por ejemplo, `bidirectional` en la API de Python) y una CLI `o2laf-transfer` para transferir acciones de un video fuente a un primer fotograma dado. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Aprendizaje de acciones latentes a partir de video sin etiquetas.
- Generacion de video condicionada por primer fotograma y secuencia de acciones latentes (world model).
- Transferencia de acciones: extraer la dinamica de un video fuente y aplicarla a un primer fotograma distinto.
- Inferencia de acciones para cada transicion de un video (codificador de acciones).
- Soporte de modos de inferencia configurables (por ejemplo, `bidirectional`).
- Integracion mediante CLI (`o2laf-transfer`) y API de Python (`LatentActionPipeline`).
- No se documentan capacidades de tool calling, agentes, vision general, audio ni razonamiento textual.

## Casos de uso

- Investigacion en aprendizaje por imitacion sin etiquetas: usar el codificador de acciones para extraer acciones latentes de videos de demostracion y entrenar politicas downstream sin anotacion manual.
- Robotica y manipulacion: aprovechar el world model para predecir el resultado visual de una secuencia de acciones latentes antes de ejecutarlas en un entorno real.
- Simulacion y planificacion: generar videos plausibles a partir de un fotograma inicial y una secuencia de acciones para evaluar trayectorias alternativas.
- Transferencia de movimiento entre videos: aplicar la dinamica de un video fuente a un nuevo primer fotograma con `o2laf-transfer` para prototipar efectos o animaciones.
- Analisis de egocentrico (EgoDexMix): estudiar dinamicas de manos y objetos en video en primera persona para tareas de asistencia o realidad aumentada.
- Benchmarking de world models: emplear el modelo como referencia para comparar metodos de aprendizaje de acciones latentes en video.
- Generacion de datos sinteticos: producir videos condicionados por acciones para aumentar datasets de entrenamiento en vision y robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 12,6 GB en safetensors, por lo que se requiere al menos esa cantidad en precision de los pesos publicados, mas memoria para activaciones y latentes de video.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano (5B) es razonable esperar GPUs de datacenter (A100, H100) para video de alta resolucion, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de pesos (~12,6 GB) sugiere que podria caber en GPUs con 16-24 GB, pero no se documenta.
- Opciones de despliegue: el autor proporciona la libreria `o2laf` (CLI y `LatentActionPipeline`) desde el repositorio de GitHub; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / video | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| O²LaF (`o2laf_dit_mixed`) | 5B (base Wan 2.2) | no disponible | Acciones latentes + world model | Apache 2.0 | Hugging Face (1 checkpoint) |
| Wan 2.2 TI2V-5B | 5B | no disponible | Generacion imagen-a-video | Apache 2.0 | Hugging Face |
| V-JEPA 2 | no disponible | no disponible | Representaciones de video autosupervisadas | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Solo se publica un checkpoint (`o2laf_dit_mixed`); el resto de variantes anunciadas aun no estan disponibles.
- No se documentan sesgos, calidad de generacion ni metricas objetivas.
- Riesgo de alucinacion visual: como modelo generativo de video, puede producir dinamicas fisicamente implausibles.
- Dependencia del codigo del repositorio de GitHub (`showlab/o2laf`); la API y la CLI pueden cambiar.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Wan 2.2; conviene revisar la licencia de Wan-AI/Wan2.2-TI2V-5B-Diffusers.
- No se especifican idiomas soportados ni limitaciones de contexto; la longitud de video manejable no esta documentada.
- Requiere descarga selectiva de archivos segun la ejecucion; el repo completo son 12,6 GB.

## Enlaces

- Hugging Face: https://huggingface.co/YuxinJ/O2LaF
- Paper (arXiv): https://arxiv.org/abs/2611.26617
- Project page: https://showlab.github.io/o2laf/
- Codigo: https://github.com/showlab/o2laf
- Video: https://youtu.be/AYWevG1Nhpc
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
