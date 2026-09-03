# ukcastle/notaqnn-GR00T-Mdrift_crop192_cft-Dmergedv2_resfixed-step1000

## Resumen

El modelo `ukcastle/notaqnn-GR00T-Mdrift_crop192_cft-Dmergedv2_resfixed-step1000` es un paquete de inferencia en formato `notaqnn/3` que contiene una política robótica basada en el modelo GR00T N1.7 de NVIDIA, optimizada para ejecutarse en el NPU Hexagon v73 del Qualcomm IQ-9075 (QCS9075). El paquete incluye los binarios de contexto HTP, los tensores golden de validación y los activos de glue necesarios para el runtime, todo empaquetado en un único archivo `model.safetensors` de aproximadamente 5,7 GB.

Este modelo resuelve el problema de desplegar políticas de manipulación robótica en hardware de borde de bajo consumo, específicamente en el SoC QCS9075 de Qualcomm. La relevancia actual radica en que permite ejecutar un modelo de visión-lenguaje-acción (VLA) de 5.37 mil millones de parámetros en un NPU de smartphone/robot, sin necesidad de GPU dedicada. El paquete contiene cuatro gráficos de contexto: `vision` (779,7 MiB), `llm_0` (1.925,4 MiB) y dos gráficos `dit_step_0` y `dit_step_1` (1.062,3 y 1.059,2 MiB respectivamente), todos por debajo del límite de 2 GiB por contexto.

El modelo está diseñado para una tarea específica: manipulación de objetos con un brazo robótico, con entrada visual de 2 vistas (imágenes de 192×192 píxeles) y salida de acciones con horizonte de 40 pasos y 132 dimensiones de acción. La licencia es `other`, lo que requiere verificación adicional antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (VLA: vision encoder + LLM + DiT action decoder) |
| Parametros totales | 5.372.170.240 (5,37 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 96 tokens (seq_len, con left-padding; prompt real de captura: 93) |
| Tipos de cuantizacion | 8-bit (formato notaqnn/3 para NPU Hexagon v73) |
| Idiomas soportados | no disponible (modelo de robotica, no de texto) |
| Licencia | other (requiere verificacion) |
| Formato de pesos | safetensors (bundle notaqnn/3 con binarios HTP embebidos) |

## Arquitectura y entrenamiento

El modelo es una política de visión-lenguaje-acción (VLA) basada en la arquitectura GR00T N1.7 de NVIDIA. El paquete contiene cuatro gráficos de inferencia separados: un codificador visual (`vision`) que procesa 2 vistas con 144 parches por vista y genera 36 tokens de visión; un modelo de lenguaje (`llm_0`) que actúa como cerebro de razonamiento; y dos gráficos de difusión (`dit_step_0` y `dit_step_1`) que implementan un decodificador de acciones basado en flow-matching con 1 paso y 2 particiones.

El entrenamiento se realizó sobre el checkpoint `geonmin-kim/GR00T-Mdrift_crop192_cft-Dmergedv2_resfixed-step1000` (revision `2534ce5b15e6091f26d4cfba03579cf8f016acf1`), con el job de entrenamiento `exp75_groot_drift_cft_tgt192_mergedv2_resfixed`. El pipeline de imagen aplica un resize a 192×192, seguido de un centro-crop a 172×172 y un nuevo resize a 192×192. La salida de acciones tiene un horizonte de 40 pasos con `max_action_dim` de 132. El modelo fue convertido al formato notaqnn usando QAIRT 2.47.0.260601, con target `soc_id 77`, `dsp_arch v73` y 8 MB de VTCM.

## Capacidades

- Generación de acciones de manipulación robótica: el modelo genera secuencias de acciones de 40 pasos con 132 dimensiones, adecuadas para control de brazos robóticos.
- Percepción visual multi-vista: procesa 2 vistas simultáneas, cada una con 144 parches, generando 36 tokens de visión por vista.
- Razonamiento de bajo nivel: el componente LLM integra información visual y de instrucciones para decidir la política de acción.
- Decodificación por flow-matching: utiliza un decodificador de difusión de 1 paso con 2 particiones para generar acciones de forma eficiente.
- Ejecución en NPU: optimizado para Hexagon v73, con todos los gráficos por debajo del límite de 2 GiB por contexto.
- Validación integrada: incluye tensores golden para verificar la corrección de la ejecución en el dispositivo.

## Casos de uso

- Manipulación robótica en borde: el modelo puede ejecutarse en robots con SoC QCS9075 para tareas de pick-and-place, aprovechando su entrada visual de 2 vistas y salida de acciones de 40 pasos.
- Automatización industrial ligera: integrable en brazos robóticos de bajo consumo para tareas repetitivas de ensamblaje o clasificación, sin necesidad de GPU externa.
- Investigación en robótica: útil para laboratorios que trabajan con GR00T N1.7 y necesitan desplegar políticas en hardware de Qualcomm para pruebas en entornos reales.
- Robots de servicio: el modelo puede controlar robots móviles con brazo integrado para tareas de recogida y entrega de objetos en entornos domésticos o de oficina.
- Prototipado rápido: al incluir tensores golden y herramientas de verificación, permite validar rápidamente si el hardware objetivo reproduce los resultados esperados.
- Edge AI educativa: sirve como ejemplo de despliegue de VLA en NPU para cursos de robótica y sistemas embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paquete incluye tensores golden para verificar la corrección de la ejecución, pero no hay métricas de rendimiento (latencia, throughput, precisión) comparativas con otros modelos o hardware.

## Requisitos de hardware

- SoC objetivo: Qualcomm IQ-9075 (QCS9075) con Hexagon v73 (dsp_arch v73, soc_id 77).
- VTCM: 8 MB (configuración fija del target).
- Contexto por gráfico: cada gráfico debe cargarse en un buffer de menos de 2 GiB (2^31 bytes). El gráfico `llm_0` ocupa 1.925,4 MiB (94,0% del límite), por lo que es el más restrictivo.
- Memoria total del bundle: 5.699.696.929 bytes (5,31 GiB), repartidos entre los cuatro gráficos y los activos.
- Despliegue: el formato notaqnn/3 requiere el runtime `notaqnn.core.bundle_cli` para verificar, extraer y ejecutar el bundle. Las herramientas usan solo la stdlib de Python, por lo que pueden ejecutarse en el propio dispositivo.
- No se requieren GPUs: el modelo está diseñado para NPU, no para CUDA o ROCm.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El paquete es una conversión específica de GR00T N1.7 para NPU de Qualcomm, y no hay datos públicos de otros modelos VLA convertidos al mismo formato. La comparación con el modelo original `geonmin-kim/GR00T-Mdrift_crop192_cft-Dmergedv2_resfixed-step1000` es la única referencia directa, pero no se dispone de sus métricas de rendimiento.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia `other` no especifica los términos exactos; es necesario contactar con el autor para confirmar si permite uso comercial.
- Hardware específico: el modelo solo funciona en Qualcomm QCS9075 (Hexagon v73). No es portable a otras NPU, GPUs o CPUs sin una reconversión completa.
- Sin soporte de texto: no es un modelo de lenguaje general; solo genera acciones robóticas a partir de entradas visuales.
- Contexto limitado: la ventana de 96 tokens es fija y no ampliable; el prompt real de captura es de 93 tokens, dejando solo 3 de margen.
- Dependencia del seed: los tensores golden se generaron con un seed específico (0) y un frame concreto; sin ese seed no se pueden reproducir los resultados, lo que dificulta la depuración.
- Riesgo de alucinación en acciones: como todo modelo de difusión, puede generar acciones no válidas si la entrada visual difiere del dominio de entrenamiento.
- Sin datos de rendimiento: no hay métricas públicas de latencia o throughput, por lo que el rendimiento en producción es incierto.

## Enlaces

- HuggingFace: https://huggingface.co/ukcastle/notaqnn-GR00T-Mdrift_crop192_cft-Dmergedv2_resfixed-step1000
- Checkpoint original: https://huggingface.co/geonmin-kim/GR00T-Mdrift_crop192_cft-Dmergedv2_resfixed-step1000
- Dataset de validación: https://huggingface.co/datasets/geonmin-kim/SO101-lv4-3color-cube-mat-to-mat-no-human-reset-vertical-approach-descent-merged-v2
