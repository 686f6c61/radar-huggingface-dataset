# ukcastle/notaqnn-GR00T-Mdrift_crop128_cft-Dmergedv2_resfixed-step1000

## Resumen

Este repositorio contiene un bundle `notaqnn/3` de la política robótica GR00T N1.7, preparado por el autor `ukcastle` para su ejecución en la NPU Qualcomm Hexagon v73 integrada en el SoC QCS9075 (IQ-9075). El modelo original, un checkpoint de GR00T N1.7 entrenado para control de manipulación, se ha convertido a un formato propietario que empaqueta los contextos binarios de HTP (Hexagon Tensor Processor), los tensores golden de verificación y los activos de host necesarios para la inferencia en el dispositivo. Con 5.371.150.336 parámetros (aproximadamente 5,37 mil millones), el bundle ocupa 5,7 GB y está diseñado para ejecutarse íntegramente en la NPU, sin depender de GPU externa.

La relevancia de este modelo radica en que demuestra la viabilidad de ejecutar políticas de manipulación robótica de gran tamaño en hardware de borde de Qualcomm, un paso hacia la robótica autónoma con inferencia local y baja latencia. El bundle incluye cuatro gráficos de contexto (`vision`, `llm_0`, `dit_step_0`, `dit_step_1`) que juntos implementan la política completa: percepción visual, razonamiento del modelo de lenguaje y generación de acciones mediante un transformer de difusión (DiT). La licencia es `other`, por lo que los términos de uso no están claramente definidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (vision encoder + LLM + DiT para acciones) |
| Parametros totales | 5.371.150.336 (5,37 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 tokens (seq_len, con padding por la izquierda; captura real de 53 tokens) |
| Tipos de cuantizacion | 8-bit (tag del repositorio) |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | other (sin términos específicos publicados) |
| Formato de pesos | safetensors (bundle `notaqnn/3` con contextos binarios y assets) |

## Arquitectura y entrenamiento

La política GR00T N1.7 combina un codificador de visión (2 vistas, 64 parches por vista, 16 tokens de visión por vista), un modelo de lenguaje (LLM) y un transformer de difusión (DiT) que genera acciones de control. El bundle `notaqnn/3` contiene cuatro gráficos de contexto: `vision` (778,8 MiB), `llm_0` (1.925,3 MiB), `dit_step_0` (1.062,3 MiB) y `dit_step_1` (1.059,2 MiB). Cada gráfico tiene un buffer de pesos inferior a 2 GiB, requisito impuesto por la arquitectura Hexagon v73 (que no dispone de la extensión far-region de v81+). El DiT opera en un solo paso con dos divisiones, y la acción generada tiene un horizonte de 40 pasos con una dimensión máxima de 132.

No se dispone de información sobre el entrenamiento del modelo original (datos, número de tokens, método de alineación). El checkpoint de origen es `geonmin-kim/GR00T-Mdrift_crop128_cft-Dmergedv2_resfixed-step1000`, con un hash sha256 de pesos documentado. El bundle incluye tensores golden generados a partir del dataset `geonmin-kim/SO101-lv4-3color-cube-mat-to-mat-no-human-reset-vertical-approach-descent-merged-v2` (frame 0, semilla de ruido 0) para verificar la corrección de la inferencia en el dispositivo.

## Capacidades

- Control robótico de manipulación: genera acciones de 40 pasos de horizonte con hasta 132 dimensiones de acción, adecuado para tareas de agarre y colocación de objetos.
- Percepción visual multi-vista: procesa 2 vistas de cámara, cada una con 64 parches y 16 tokens de visión, con una geometría de imagen específica (resize a 128x128, centro-crop a 115x115, resize a 128x128).
- Ejecución en NPU Qualcomm: el bundle está optimizado para Hexagon v73 (QCS9075) con VTCM de 8 MB, permitiendo inferencia local sin GPU.
- Verificación integrada: incluye tensores golden y herramientas de verificación (`notaqnn.core.bundle_cli`) para validar la integridad del bundle y la corrección de la salida.
- Formato de despliegue compacto: los miembros grandes (contextos binarios y tablas de embedding) se concatenan en un único archivo `model.safetensors`, accesibles por offset sin extracción.

## Casos de uso

- Manipulación robótica en tiempo real en borde: el modelo puede ejecutarse en robots equipados con el SoC Qualcomm QCS9075, permitiendo tareas de pick-and-place con respuesta de baja latencia al no depender de la nube.
- Investigación en políticas GR00T: sirve como referencia para estudiar la conversión de checkpoints de GR00T a formato `notaqnn` y su despliegue en hardware Qualcomm, facilitando la reproducción de experimentos.
- Desarrollo de sistemas de verificación de inferencia: los tensores golden y las herramientas de verificación permiten validar que una implementación de runtime produce salidas correctas, útil para depurar integraciones de HTP.
- Prototipado de robots autónomos con visión y razonamiento: la combinación de visión multi-vista y LLM permite explorar comportamientos guiados por instrucciones de alto nivel en entornos controlados.
- Benchmarking de rendimiento de NPU: al ser un bundle completo con gráficos de contexto, puede usarse para medir latencia y throughput de la NPU Hexagon v73 en cargas de trabajo de robótica.
- Educación en despliegue de modelos de robótica en edge: el repositorio documenta el proceso de empaquetado y verificación, útil como ejemplo para otros desarrolladores que trabajen con GR00T o modelos similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, latencia o throughput para el modelo o el bundle.

## Requisitos de hardware

- NPU Qualcomm Hexagon v73 (SoC QCS9075 / IQ-9075) con VTCM de 8 MB.
- No requiere GPU externa; la inferencia se ejecuta íntegramente en la NPU.
- El bundle está diseñado para cargarse en la memoria del dispositivo; el tamaño total es de 5,7 GB, por lo que se necesita almacenamiento local suficiente.
- Cada contexto binario debe tener un buffer de pesos inferior a 2 GiB (límite de la arquitectura v73); los cuatro gráficos cumplen este requisito.
- Herramientas de verificación: `notaqnn.core.bundle_cli` (solo usa la biblioteca estándar de Python, puede ejecutarse en el propio dispositivo).
- Opciones de despliegue: el formato `notaqnn/3` es específico de Qualcomm; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de robótica similares. El repositorio no proporciona datos sobre alternativas como GR00T N1.5, OpenVLA o RT-2, ni métricas comparables.

## Limitaciones y advertencias

- Licencia `other` sin términos claros: no se especifican restricciones de uso comercial, modificación o redistribución. Se recomienda contactar al autor antes de usar el modelo en producción.
- Hardware específico: el bundle solo funciona en NPU Qualcomm Hexagon v73 (QCS9075); no es portable a otras arquitecturas sin reconversión.
- Sin datos de rendimiento: no hay métricas de latencia, throughput o precisión publicadas, lo que dificulta evaluar su idoneidad para aplicaciones en tiempo real.
- Contexto limitado: la longitud de secuencia es de 64 tokens (53 reales en la captura), lo que restringe la cantidad de información histórica que puede procesar la política.
- Dependencia de la semilla de ruido: los tensores golden se generan con una semilla fija (0) y no son reproducibles sin ella, ya que el ruido se extrae de un RNG global interno.
- Riesgo de alucinación en acciones: al ser un modelo generativo de difusión, puede producir acciones no válidas o inseguras si no se valida adecuadamente; se recomienda supervisión humana en entornos reales.
- Sin soporte de idiomas: el modelo no procesa texto libre; las instrucciones se manejan a través del LLM interno, pero no se documentan capacidades multilingües.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ukcastle/notaqnn-GR00T-Mdrift_crop128_cft-Dmergedv2_resfixed-step1000
- Checkpoint original: `geonmin-kim/GR00T-Mdrift_crop128_cft-Dmergedv2_resfixed-step1000` (revision `0a820590587513bbade58d20466c389158d15814`)
- Dataset de verificación: `geonmin-kim/SO101-lv4-3color-cube-mat-to-mat-no-human-reset-vertical-approach-descent-merged-v2`
- Herramienta de verificación: `notaqnn.core.bundle_cli` (documentada en la model card)
