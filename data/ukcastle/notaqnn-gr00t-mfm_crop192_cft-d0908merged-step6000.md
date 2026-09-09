# ukcastle/notaqnn-GR00T-Mfm_crop192_cft-D0908merged-step6000

## Resumen

El modelo `ukcastle/notaqnn-GR00T-Mfm_crop192_cft-D0908merged-step6000` es un paquete de inferencia `.notaqnn` que contiene una politica robótica GR00T N1.7 compilada para ejecutarse en la NPU Qualcomm Hexagon v73 (QCS9075). No es un modelo de lenguaje ni un chatbot: se trata de un bundle binario destinado a controlar robots, capaz de procesar imagenes y generar acciones de bajo nivel en tiempo real. El desarrollador, `ukcastle`, ha empaquetado todos los componentes —vision encoder, LLM y Diffusion Transformer (DiT)— en un unico archivo `model.safetensors` junto con binarios de contexto para el acelerador Hexagon.

El modelo subyacente es la politica GR00T N1.7 de NVIDIA, adaptada con una geometria de imagen de 192x192 píxeles y una secuencia de entrada de 96 tokens. El bundle pesa 5,31 GiB y tiene 5.372.170.240 parametros. Su formato `notaqnn/3` permite que el runtime lea los miembros por offset, sin necesidad de extraccion, lo que simplifica el despliegue en dispositivos embebidos.

La relevancia actual del proyecto radica en la posibilidad de ejecutar politicas de manipulacion robotica en NPUs de consumo, en lugar de depender de GPUs de gran potencia. El uso de golden tensors y un fingerprint SHA256 permite verificar la integridad del bundle en el dispositivo, un aspecto critico cuando se despliegan modelos en entornos industriales o de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica robotica multimodal GR00T N1.7 (vision encoder + LLM + DiT) empaquetada en formato notaqnn/3 para NPU Hexagon v73 |
| Parametros totales | 5.372.170.240 |
| Parametros activos | No aplica (arquitectura no MoE) |
| Longitud de contexto | No disponible (modelo no conversacional; secuencia de entrada fija de 96 tokens, prompt real de captura 93) |
| Tipos de cuantizacion | 8-bit (para NPU, segun tags del repositorio) |
| Idiomas soportados | No disponible (no aplica: modelo de robotica) |
| Licencia | Other (no especificada en detalle) |
| Formato de pesos | safetensors (`model.safetensors`) y archivos planos dentro de un bundle `.notaqnn` (formato `notaqnn/3`) |

## Arquitectura y entrenamiento

El modelo es una adaptacion compilada de la politica GR00T N1.7, una arquitectura multimodal que combina un vision encoder, un LLM (transformer) y un Diffusion Transformer (DiT) para generar acciones de control. En este bundle, los pesos se organizan en cuatro binarios de contexto diferenciados: `vision` (779,7 MiB), `llm_0` (1.925,4 MiB) y dos pasos del DiT (`dit_step_0` con 1.062,3 MiB y `dit_step_1` con 1.059,2 MiB). Cada contexto debe ser inferior a 2 GiB, un limite impuesto por el hardware Hexagon v73.

El checkpoint original proviene de `geonmin-kim/GR00T-Mfm_crop192_cft-D0908merged-step6000`, entrenado en el job `exp103_groot_fm_192full_0908merged`. No se han publicado detalles sobre la composicion del dataset ni sobre tecnicas de alineacion como RLHF o DPO. La adaptacion incluye un preprocesamiento de imagen con resize a 192x192 seguido de un crop central de 192x192, y la generacion de acciones mediante 4 pasos de denoising con un horizonte de 40 acciones y una dimension maxima de accion de 132.

La innovacion tecnica del bundle reside en su formato `notaqnn/3`, que almacena los binarios de contexto contiguos en un unico archivo safetensors. Esto permite que el runtime lea los datos directamente por offset, sin necesidad de extraerlos a disco. Ademas, incluye un conjunto de golden tensors generados con una semilla de ruido fija (seed 0) sobre un dataset de referencia, lo que permite verificar el comportamiento del modelo en el dispositivo.

## Capacidades

- Ejecucion de politicas robotica multimodal en NPU Qualcomm Hexagon v73 (QCS9075), con soporte para dos vistas de camera.
- Procesamiento de imagenes con geometria de 192x192 (resize, crop central, resize), generando 36 tokens de vision por vista.
- Generacion de acciones de bajo nivel mediante un DiT de 4 pasos, con horizonte de 40 acciones y dimension maxima de accion de 132.
- Verificacion de integridad en tiempo de despliegue mediante golden tensors y fingerprint SHA256 del manifiesto.
- Almacenamiento en formato notaqnn/3 sin extraccion: los componentes se leen por offsets en un unico archivo safetensors.

## Casos de uso

- Manipulacion robotica en celdas de montaje industrial: el modelo procesa dos vistas de una escena para generar una secuencia de 40 acciones de control, lo que permite ejecutar tareas de agarre y colocacion de objetos en posiciones predefinidas.
- Despliegue en robots humanoides embebidos: al estar compilado para la NPU QCS9075, el bundle puede ejecutarse en el Hexagon v73 del robot sin necesidad de una GPU externa, reduciendo coste y consumo energetico.
- Validacion de politicas en entornos de integracion continua: los golden tensors permiten comparar la salida del dispositivo con el modelo de referencia, util para detectar regresiones al actualizar el firmware o el runtime.
- Investigacion en diffusion policies para robotica: el DiT de 4 pasos ofrece un equilibrio entre precision y latencia, adecuado para experimentos de control robotsico en simulacion o en hardware real.
- Prototipado de pipelines de percepcion-accion: el modelo se integra facilmente en sistemas que capturan imagenes de dos vistas y generan comandos de movimiento, permitiendo iterar rapidamente sobre nuevos datasets de entrenamiento.
- Benchmarking de NPUs para robotica: al incluir un conjunto de golden tensors fijo, se puede medir la fidelidad de la ejecucion en la NPU frente a la misma politica en GPU, sirviendo como referencia para futuras compilaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card incluye un conjunto de golden tensors para la verificacion funcional, pero no hay datos de evaluacion comparativa frente a otras politicas robotica.

## Requisitos de hardware

- Hardware objetivo: NPU Qualcomm Hexagon v73 (QCS9075), soc_id 77, dsp_arch v73, con 8 MB de VTCM.
- VRAM estimada: no aplica (modelo pensado para NPU, no para GPU). El tamano del bundle es de 5,31 GiB en disco.
- GPU recomendadas: no aplica. No se proporcionan pesos ejecutables en GPU.
- Compatibilidad con GPU de consumo: no aplica. El formato `notaqnn/3` no es ejecutable en tarjetas graficas estandar.
- Opciones de despliegue: runtime compatible con `notaqnn/3` y herramientas `bundle_cli` (verify, fingerprint, extract). Se desconoce compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Target | Secuencia | Formato |
|---|---|---|---|---|
| notaqnn-GR00T-Mfm_crop192_cft-D0908merged-step6000 | 5.372.170.240 | Hexagon v73 (QCS9075) | 96 | notaqnn/3 |
| notaqnn-GR00T-Mdrift_crop128_cft-Dmergedv2_resfixed-step1000 | No disponible | Hexagon v73 (QCS9075) | 64 | notaqnn/3 |
| GR00T N1.7 (referencia original) | No disponible | CUDA / GPU | Variable | PyTorch |

No se dispone de resultados de benchmarks comparativos entre estos modelos.

## Limitaciones y advertencias

- Licencia "other" no especificada: no se garantiza el uso comercial sin una revision legal previa de los terminos de cada componente.
- Dependencia de hardware especifico: el bundle esta compilado para Hexagon v73 (QCS9075) y no es portable a otras NPUs o GPUs sin recompilacion.
- Límite de contexto binario: los binarios de contexto deben ser menores de 2 GiB. El contexto `llm_0` ocupa el 94% del limite, lo que deja poco margen ante futuras actualizaciones.
- Golden determinista: la verificacion depende de una semilla de ruido global fija. Cambios en el runtime o en el orden de llamadas pueden invalidar la comparacion con los golden tensors.
- Sin benchmarks publicos: no es posible evaluar el rendimiento real del modelo frente a alternativas comparables a partir de la informacion disponible.
- Entrenamiento en un dominio restringido: el dataset de referencia (SO101-lv4-3color-cube-mat-to-mat) cubre tareas de manipulacion de cubos de colores en regiones especificas; la generalizacion a otros entornos roboticos no esta demostrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukcastle/notaqnn-GR00T-Mfm_crop192_cft-D0908merged-step6000
- Modelo similar de la misma serie: https://huggingface.co/ukcastle/notaqnn-GR00T-Mdrift_crop128_cft-Dmergedv2_resfixed-step1000
- Checkpoint original: https://huggingface.co/geonmin-kim/GR00T-Mfm_crop192_cft-D0908merged-step6000
- Dataset de referencia: https://huggingface.co/geonmin-kim/SO101-lv4-3color-cube-mat-to-mat-release-3regions-0908-merged
