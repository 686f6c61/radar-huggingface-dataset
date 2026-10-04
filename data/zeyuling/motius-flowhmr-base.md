# ZeyuLing/Motius-FlowHMR-Base

## Resumen

FlowHMR es un modelo de captura de movimiento humana a partir de video RGB monocromático que reconstruye movimiento SMPL-H en 491 dimensiones. Lo publica el usuario ZeyuLing bajo la librería Motius, con origen oficial en el repositorio FlowHMR (revisión `f12e6a2d46a63d771a66dbb6b5598a1be65b9eea`). El checkpoint base cuenta con 460.399.159 parámetros (aproximadamente 0,46B) y se distribuye en formato safetensors, con un repositorio de 9,7 GB que incluye los frontends de visión necesarios para el pipeline completo.

El modelo resuelve el problema de la captura de movimiento sin marcadores ni trajes: dado un vídeo de una sola cámara, estima la pose y el movimiento corporal completo en el espacio de SMPL-H. El entrenamiento se basa de forma nativa en flow matching (objetivo x1 con muestreo temporal logit-normal), una aproximación alternativa a los modelos de difusión convencionales para generar secuencias de movimiento.

Es relevante porque integra de extremo a extremo componentes de detección, estimación de cámara y extracción de características (YOLOX, VGGT-Omega, SAM-3D-Body y frontend MHR) junto con el modelo generativo, y porque separa un checkpoint Base (entrenamiento de flow matching) de un checkpoint Latest (con posentrenamiento PHC+ GRPO). La licencia es de investigación sin ánimo de lucro, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo generativo con flow matching (objetivo x1 y muestreo de tiempo logit-normal); el backbone concreto no se detalla en la información disponible. El pipeline integra frontends YOLOX, VGGT-Omega, SAM-3D-Body y MHR |
| Parametros totales | 460.399.159 (aproximadamente 0,46B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como contexto de lenguaje. La ventana de entrenamiento es de 360 fotogramas (recorte y relleno) a 30 fps |
| Tipos de cuantizacion | No disponible. Pesos en safetensors, con entrenamiento e inferencia en FP32 (`mixed_precision='no'`) |
| Idiomas soportados | No disponible (modelo de captura de movimiento, no lingüístico) |
| Licencia | flowhmr-research-nonprofit (license: other, fichero LICENSE en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se entrena con flow matching x1 y muestreo temporal logit-normal (media −0,8, desviación estándar 0,8). La función de pérdida combina términos SmoothL1 para la velocidad en XZ de la raíz, la posición Y de la raíz, las posiciones locales de las articulaciones, las rotaciones, la forma y el contacto, más pérdidas de rotación por cinemática directa (FK) y de consistencia. Los pesos de estas pérdidas son 10/10/10/10/1/4/5/5 y las máscaras de pérdida excluyen el relleno. El entrenamiento se ejecuta en FP32 con AdamW, recorte de gradiente de 10 y una tasa de aprendizaje cosenoidal de 1e-4 a 1e-5. La receta pública usa 250.000 iteraciones, equivalentes a las 25 épocas oficiales de 10.000 iteraciones, y emplea ocho procesos para un tamaño de lote global de 64. Se guardan checkpoints cada 10.000 pasos, conservando cinco.

La representación es SMPL-H con 52 articulaciones y 16 parámetros de forma, codificada en 491 dimensiones, y conserva todas las articulaciones de las manos. El adaptador de datos usa la conversión de cámara/mundo del upstream, cinemática directa de SMPL-H, codificación de 491 dimensiones, recorte/relleno de 360 fotogramas y un 10 % de dropout de características. El corpus de entrenamiento oficial no es público: hay que aportar fragmentos WebDataset en formato oficial (`motion.npz`, `camera.npz`, `bbox.npz`, `feature.pt` y metadatos). La inferencia puede partir de tokens precalculados de forma `(T, 3072)` con transformaciones world-to-camera de OpenCV a 30 fps. El checkpoint Base cubre el preentrenamiento; el posentrenamiento PHC+ GRPO queda fuera de su alcance y corresponde al checkpoint Latest.

## Capacidades

- Captura de movimiento monocromática SMPL-H en 491 dimensiones a partir de vídeo RGB (`infer_monocular_motion_capture`).
- Inferencia desde tokens precalculados `(T, 3072)` y matrices world-to-camera de OpenCV a 30 fps (`infer_from_feature`).
- Pipeline de vídeo a movimiento (`infer_v2m`): transcodificación del vídeo, seguimiento de la persona con YOLOX, predicción de cámaras con VGGT-Omega y extracción de características SAM-3D-Body.
- Limpieza opcional de contacto e IK del upstream mediante `postprocess=True` (para una única semilla).
- Representación con 52 articulaciones y 16 parámetros de forma, incluyendo articulaciones de las manos.
- Exportación de artefactos locales mediante `tools/export_flowhmr_hf.py` y CLI de inferencia en `tools/infer_flowhmr.py`.
- No dispone de tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje; no es un modelo conversacional ni multimodal de texto.

## Casos de uso

- Animación 3D sin traje: dado un vídeo monocromático, se extrae la secuencia SMPL-H de 491 dimensiones y se aplica retargeting al esqueleto de un personaje en una herramienta de animación, evitando sistemas de captura con marcadores.
- Análisis deportivo: procesar grabaciones de una sola cámara de un atleta para obtener trayectorias articulares cuantificables (velocidad de la raíz en XZ, posiciones locales), útiles para comparar gestos entre repeticiones.
- Reconstrucción de movimiento para VR/AR: generar avatares animados a partir de vídeo de usuario, aprovechando la conversión cámara/mundo y la salida SMPL-H compatible con motores de tiempo real.
- Generación de datos de entrenamiento para robótica: producir miles de secuencias de movimiento humano etiquetadas a partir de vídeos existentes para imitación o planificación, usando el modo de tokens precalculados `(T, 3072)` para acelerar el procesado por lotes.
- Postproducción audiovisual: previsualización rápida de movimiento para planos que no justifican una sesión de captura presencial, gracias a la limpieza de contacto/IK integrada con `postprocess=True`.
- Biomecánica y rehabilitación: reconstruir la cinemática corporal de un paciente grabado con un único dispositivo para seguimiento longitudinal, siempre que se cumpla la licencia de investigación sin ánimo de lucro.
- Doblaje y retargeting de movimiento: transferir una actuación capturada en vídeo a modelos con distinta morfología usando las 16 dimensiones de forma como parámetros ajustables.
- Prototipado de herramientas de captura: emplear `infer_v2m` y `infer_from_feature` como referencia para construir pipelines propios que sustituyan el frontend por alternativas de detección o estimación de cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card enlaza a una tabla de clasificación de captura de movimiento monocromática (`monocular-motion-capture-leaderboard`), pero no incluye cifras de métricas como MPJPE, PA-MPJPE, aceleración o error de jitter, ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- Peso del modelo base (0,46B parámetros) en FP32: aproximadamente 1,85 GB.
- Tamaño total del repositorio: 9,7 GB, que incluye los pesos frontend de YOLOX, VGGT-Omega, SAM-3D-Body y MHR, además del modelo generativo, la configuración, las estadísticas de movimiento, la procedencia y las licencias de componentes.
- Entrenamiento e inferencia en FP32; no se documentan versiones cuantizadas ni de precisión reducida.
- Se requiere GPU CUDA: la configuración de ejemplo usa `device="cuda"`.
- VRAM estimada para el pipeline completo: no disponible de forma oficial. Como orientación no oficial, hay que sumar al modelo de 0,46B el coste de los frontends de visión; se recomienda planificar con GPUs de gama alta con al menos 16-24 GB de VRAM para ejecutar todo el pipeline con holgura.
- GPU recomendadas: no especificadas por el autor. Los modelos de visión integrados (VGGT-Omega, SAM-3D-Body) suelen requerir aceleradores tipo A100, H100 o RTX 4090; no hay confirmación oficial.
- Despliegue: mediante la librería Motius (`Pipeline.from_pretrained`) y las herramientas de línea de comandos incluidas. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La inferencia usa por defecto la semilla 0, 20 pasos de Euler y CFG 1 con alineación de suelo del primer fotograma.
- Se requiere aportar el modelo SMPL-H neutro (52 articulaciones, 16 parámetros de forma) y el regresor de articulaciones SMPL, distribuidos por separado por estar sujetos a licencia.

## Comparativa con modelos similares

No hay datos de rendimiento comparativos en la información disponible que permitan una comparación rigurosa. Los únicos elementos relacionados citados son:

| Modelo | Relación | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Motius-FlowHMR-Base | Versión analizada (preentrenamiento base de flow matching) | 460.399.159 | Ventana de 360 fotogramas a 30 fps | flowhmr-research-nonprofit | Hugging Face |
| Motius-FlowHMR-Latest | Variante con posentrenamiento upstream PHC+ GRPO | No disponible de forma independiente | No disponible | flowhmr-research-nonprofit | Hugging Face |
| HYMotionV2M | Modelo retirado, no incluido en esta publicación | No disponible | No disponible | No disponible | No disponible |

Comparación con otros modelos de captura de movimiento monocromática: no disponible.

## Limitaciones y advertencias

- Licencia `flowhmr-research-nonprofit`: el uso comercial está restringido. Hay que revisar el fichero LICENSE antes de cualquier despliegue en producción.
- El modelo SMPL-H y el regresor de articulaciones SMPL se distribuyen por separado y están sujetos a sus propias licencias; es necesario aportar copias licenciadas propias para ejecutar la inferencia.
- El corpus de entrenamiento oficial no es público. Cualquier reentrenamiento con datos propios constituye una ejecución nueva y no una reproducción exacta del dataset original.
- El posentrenamiento con PHC+ GRPO solo está presente en el checkpoint Latest; queda fuera del alcance del checkpoint Base analizado.
- No se publican resultados de benchmarks ni métricas cuantitativas de error de pose, por lo que la calidad de reconstrucción no puede evaluarse con datos objetivos a partir de la información disponible.
- No se documentan sesgos específicos del modelo. Como limitación general de la captura de movimiento monocromática, cabe esperar degradación ante oclusiones severas, movimiento rápido, cámara en movimiento o personas fuera de distribución, aunque el autor no detalla estos escenarios.
- No hay versiones cuantizadas ni soporte de precisión reducida, lo que limita el despliegue en hardware con poca memoria.
- La limpieza de contacto e IK del upstream mediante `postprocess=True` solo se aplica a una semilla, lo que restringe su uso en flujos con múltiples muestras.
- No se descargan activos de forma implícita durante el entrenamiento: los artefactos necesarios deben proporcionarse manualmente.
- Modelo sin capacidades lingüísticas ni de agente; no debe emplearse para tareas de texto, tool calling o razonamiento simbólico.

## Enlaces

- Checkpoint base en Hugging Face: https://huggingface.co/ZeyuLing/Motius-FlowHMR-Base
- Checkpoint Latest en Hugging Face: https://huggingface.co/ZeyuLing/Motius-FlowHMR-Latest
- Página de proyecto y actualizaciones del paper: https://flowhmr.github.io/
- Repositorio original en GitHub: https://github.com/flowhmr/flowhmr
- Guía de datos del upstream: https://github.com/flowhmr/flowhmr/blob/main/docs/resources.md
- Tabla de clasificación y ejemplos de captura de movimiento monocromática: https://huggingface.co/spaces/ZeyuLing/monocular-motion-capture-leaderboard
