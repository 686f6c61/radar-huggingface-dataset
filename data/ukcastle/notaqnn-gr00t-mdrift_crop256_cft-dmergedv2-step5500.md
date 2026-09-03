# ukcastle/notaqnn-GR00T-Mdrift_crop256_cft-Dmergedv2-step5500

## Resumen
El modelo `ukcastle/notaqnn-GR00T-Mdrift_crop256_cft-Dmergedv2-step5500` es un bundle de inferencia en formato `notaqnn/3` que permite ejecutar la política robótica GR00T N1.7 (basada en el modelo NVIDIA GR00T N1.7) sobre la NPU Qualcomm Hexagon v73 integrada en el SoC QCS9075. No es un modelo de lenguaje ni un checkpoint entrenable, sino un paquete compilado que contiene los contextos binarios del HTP (Hexagon Tensor Processor), tensores golden de verificación y activos de glue para el runtime. Está diseñado para ejecutar una política de manipulación robótica con entrada visual de dos cámaras y salida de acciones de bajo nivel.

El bundle pesa 5,31 GiB y está organizado en cuatro contextos: dos para el modelo de difusión (`dit_step_0` y `dit_step_1`), uno para el LLM (`llm_0`) y otro para el codificador de visión (`vision`). Cada contexto tiene un límite de 2 GiB para su buffer de pesos, siendo el LLM el que más se acerca a ese límite (94,0 %). El paquete incluye también un manifiesto con hashes de integridad y una herramienta de verificación escrita solo con la biblioteca estándar de Python, lo que facilita su validación en el propio dispositivo.

La relevancia de este modelo radica en que demuestra la viabilidad de ejecutar políticas robóticas complejas de difusión en hardware de borde de bajo consumo, sin depender de GPUs dedicadas. Al estar compilado específicamente para la arquitectura Hexagon v73, ofrece una ruta de despliegue para robots autónomos con requisitos estrictos de latencia y energía. La licencia es `other`, por lo que no se garantiza su uso comercial sin una revisión adicional.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (política robótica multimodal: vision encoder + LLM + DiT de flujo) |
| Parametros totales | no disponible (el bundle contiene pesos compilados, no se publica el conteo) |
| Parametros activos | no disponible |
| Longitud de contexto | 160 tokens (seq_len, con left padding; la captura real usa 149 tokens de prompt) |
| Tipos de cuantizacion | no disponible (binario HTP compilado, no se especifica el formato de cuantización) |
| Idiomas soportados | no disponible (modelo de acción robótica, no procesa lenguaje natural) |
| Licencia | other (no especificada en la model card) |
| Formato de pesos | `notaqnn/3` (bundle con contextos binarios, golden tensors y assets; los miembros grandes se concatenan en `model.safetensors`) |

## Arquitectura y entrenamiento
El modelo original es GR00T N1.7, un sistema de política robótica de NVIDIA que combina un codificador de visión, un modelo de lenguaje (LLM) y un modelo de difusión de flujo (DiT) para generar acciones. El bundle compilado para Qualcomm incluye cuatro contextos separados: dos para el DiT (con un solo paso de difusión dividido en dos sub-grafos), uno para el LLM y otro para el codificador de visión. La entrada visual consiste en dos vistas, cada una con 256 parches y 64 tokens de visión, tras un preprocesado que redimensiona la imagen a 256×256, aplica un recorte central a 230×230 y vuelve a redimensionar a 256×256. La salida de acciones tiene un horizonte de 40 pasos y una dimensión máxima de 132.

El entrenamiento del checkpoint original se realizó con el trabajo `exp77_groot_drift_cft_tgt256_mergedv2`, y el bundle se generó a partir de la revisión `862f0b7d8c38774ef40c85524e3133b8209c4b7e` del repositorio `geonmin-kim/GR00T-Mdrift_crop256_cft-Dmergedv2-step5500`. La compilación se hizo con QAIRT 2.47.0.260601 (fijado) para el SoC de ID 77 con arquitectura DSP v73 y 8 MB de VTCM. El bundle incluye un tensor golden generado con el frame 0 de un dataset específico de manipulación y con seed de ruido 0, que sirve como criterio de validación en el dispositivo.

## Capacidades
- Ejecución de políticas robóticas de manipulación en tiempo real sobre NPU Qualcomm Hexagon v73.
- Entrada multimodal de visión: soporta dos vistas de cámara, cada una con 256 parches y 64 tokens de visión.
- Generación de acciones de bajo nivel: salida con horizonte de 40 pasos y hasta 132 dimensiones de acción.
- Inferencia de difusión de flujo en un solo paso (con dos sub-grafos), lo que reduce la latencia frente a métodos iterativos.
- Verificación de integridad del bundle mediante hashes de todos los miembros (contextos, golden y assets) con la herramienta `bundle_cli`.
- Ejecución autónoma en el dispositivo: la herramienta de verificación usa solo la biblioteca estándar de Python, sin dependencias externas.
- Capacidad de extracción de los componentes del bundle para inspección o re-ensamblaje.

## Casos de uso
- Manipulación robótica en entornos industriales: el modelo puede controlar un brazo robótico para tareas de recogida y colocación (pick-and-place) con realimentación visual de dos cámaras, aprovechando la baja latencia de la NPU para operaciones en cadena.
- Robots de servicio en entornos domésticos: al ejecutarse en un SoC de bajo consumo como el QCS9075, puede integrarse en aspiradoras, brazos de asistencia o plataformas móviles que requieran percepción visual y generación de acciones sin conexión a una GPU.
- Prototipado rápido de políticas de difusión en edge: investigadores pueden usar el bundle para validar el comportamiento de GR00T N1.7 en hardware real antes de optimizar otros componentes del sistema robótico.
- Sistemas de verificación de despliegue: gracias a los tensores golden incluidos, se puede automatizar la comprobación de que el runtime de inferencia produce resultados correctos en el dispositivo, útil para integración en pipelines de CI/CD de robótica.
- Educación y experimentación en robótica con aceleración NPU: el bundle permite a estudiantes y desarrolladores explorar la ejecución de modelos de difusión de acciones en hardware heterogéneo sin necesidad de configurar un entorno de entrenamiento.
- Migración de políticas entrenadas en simulación a hardware real: al estar compilado para un SoC específico, sirve como referencia para portar otros checkpoints de GR00T a la plataforma Qualcomm.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks (latencia, throughput, precisión de tareas) en la información disponible. La model card únicamente proporciona el tamaño de cada contexto y su proporción respecto al límite de 2 GiB, pero no incluye métricas de rendimiento en tiempo de ejecución.

## Requisitos de hardware
- SoC objetivo: Qualcomm QCS9075 con NPU Hexagon v73 (arquitectura DSP v73, ID SoC 77).
- VTCM: 8 MB (tamaño máximo de memoria de tensores vectoriales).
- Límite de contexto: cada contexto debe tener un buffer de pesos inferior a 2 GiB (2^31 bytes). En este bundle, el contexto `llm_0` ocupa 1 925,7 MiB (94,0 % del límite), por lo que es el más crítico.
- No se indican requisitos de VRAM para GPUs, ya que el bundle está diseñado exclusivamente para NPU Qualcomm.
- Herramientas de despliegue: `notaqnn.core.bundle_cli` (verificación, fingerprint y extracción) compatible con Python estándar.
- No se especifican opciones de despliegue en vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje convencional.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas compiladas para NPU Qualcomm). La model card no menciona alternativas ni benchmarks comparativos.

## Limitaciones y advertencias
- Licencia `other`: no se especifican los términos exactos, por lo que el uso comercial o la redistribución requieren contactar con el autor o revisar la fuente original.
- Dependencia de hardware propietario: el bundle solo funciona en SoC Qualcomm con Hexagon v73 (QCS9075), no es portable a otras arquitecturas.
- Riesgo de fallos en tareas no entrenadas: al ser una política específica para un dataset de manipulación (con objetos de colores y sin intervención humana), puede no generalizar a otros escenarios.
- Sin capacidad de lenguaje natural: no procesa instrucciones verbales ni texto, solo entrada visual y salida de acciones.
- Verificación limitada: el tensor golden se generó con un seed de ruido fijo y un frame concreto; si se modifica el runtime o el orden de ejecución, la validación puede fallar aunque el modelo funcione correctamente.
- Tamaño del bundle: 5,31 GiB, lo que puede ser un obstáculo para dispositivos con almacenamiento limitado.
- No se proporcionan datos de latencia ni consumo energético, por lo que no se puede garantizar el cumplimiento de requisitos en tiempo real sin pruebas adicionales.

## Enlaces
- HuggingFace del bundle: https://huggingface.co/ukcastle/notaqnn-GR00T-Mdrift_crop256_cft-Dmergedv2-step5500
- Checkpoint original (fuente): https://huggingface.co/geonmin-kim/GR00T-Mdrift_crop256_cft-Dmergedv2-step5500
- Dataset de validación (mencionado en la model card): https://huggingface.co/datasets/geonmin-kim/SO101-lv4-3color-cube-mat-to-mat-no-human-reset-vertical-approach-descent-merged-v2
