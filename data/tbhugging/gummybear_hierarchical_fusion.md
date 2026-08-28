# tbhugging/gummybear_hierarchical_fusion

## Resumen

`tbhugging/gummybear_hierarchical_fusion` es un modelo de visión por computador desarrollado por tbhugging (Thomas Braschler) para la localización tridimensional de partículas en tomografía. Dado un conjunto de 6 iluminaciones distintas y 36 vistas de cámara (proyecciones de 128×128 píxeles) de un objeto del dataset GummyBear Tomography, el modelo predice las coordenadas `(x, y, z)` de una partícula embebida en el objeto. Se trata de una tarea de regresión multivista con fusión jerárquica de información geométrica.

El modelo emplea una arquitectura CNN con *global average pooling* (GAP) por vista, seguida de una fusión de *tokens* de iluminación (seno/coseno) dentro de cada cámara y una fusión de *tokens* de cámara (seno/coseno) a través de la órbita completa. Con 748 038 parámetros entrenables, es un modelo ligero pensado para inferencia rápida en entornos de investigación o control de calidad. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia actual del modelo radica en su enfoque explícito de fusión jerárquica de condiciones geométricas (ángulos de iluminación y de cámara) mediante *tokens* sinusoidales, una técnica que puede transferirse a otras tareas de localización multivista. No obstante, el repositorio no incluye los pesos del modelo (tamaño 0.0 GB), por lo que su uso práctico requiere reconstruirlos a partir del código fuente y el checkpoint asociado al dataset.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN con GAP pooling por vista + fusión jerárquica de *tokens* de iluminación y cámara (sin/cos) |
| Parametros totales | no disponible (solo se declaran 748 038 entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 128×128, 6×36 vistas) |
| Tipos de cuantizacion | no disponible (pesos en precisión flotante estándar) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | `pytorch_model.bin` (según código de carga; no presente en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura se compone de un *trunk* CNN con *global average pooling* (GAP) que procesa cada vista de forma independiente. Sobre las características agrupadas de cada vista se inyectan *tokens* de iluminación (seno y coseno del ángulo de luz) y, posteriormente, se fusionan los *tokens* de cámara (seno y coseno del ángulo de la cámara) a través de la órbita de 36 vistas. Esta fusión jerárquica (primero iluminación, luego cámara) se implementa en la clase `HierarchicalLightThenCameraFusionLocalizer` con una capa oculta de 128 unidades, profundidad 1 y un latente de cámara de 128.

El entrenamiento sigue el protocolo `10_2` del informe final del proyecto GummyBear Tomography. Se utilizan 6 ángulos de iluminación (0° a 300° en pasos de 60°) y 36 ángulos de cámara (0° a 350° en pasos de 10°). La entrada es el campo `anomaly_ref` normalizado con *per-image z-score*. El *layout* plano es `light_major` y las variables geométricas son `sin_light, cos_light, sin_camera, cos_camera`. El objetivo es predecir `particle_x, particle_y, particle_z`. El *learning rate* en la etapa B es 0.0003. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento supervisado de regresión.

## Capacidades

- Localización 3D de partículas (coordenadas `x, y, z`) a partir de 6 iluminaciones × 36 vistas de cámara.
- Extracción de características de imagen con *global average pooling* para representaciones compactas por vista.
- Fusión explícita de información geométrica mediante *tokens* sinusoidales de ángulos de iluminación y cámara.
- Manejo de entradas multivista con *layout* `light_major` (las 6 iluminaciones se concatenan antes de las 36 cámaras).
- Inferencia determinista y ligera (menos de 1 M de parámetros), adecuada para entornos con recursos limitados.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni procesamiento de lenguaje; es exclusivamente un modelo de visión para regresión geométrica.

## Casos de uso

- Control de calidad en fabricación: localizar inclusiones o partículas en productos mediante tomografía de rayos X con múltiples iluminaciones y vistas. El modelo predice la posición 3D exacta, lo que permite detectar defectos de forma automatizada.
- Tomografía industrial no destructiva: análisis de muestras donde se necesita conocer la posición de un marcador o partícula embebida sin reconstruir el volumen completo. La fusión jerárquica de ángulos reduce la necesidad de calibración manual.
- Investigación en imagen médica: localización de marcadores fiduciales en fantomas o muestras biológicas usando sistemas de iluminación controlada y múltiples cámaras.
- Robótica y manipulación: estimación de la posición de objetos con marcadores internos en entornos con iluminación variable, útil para *grasping* o inspección.
- Visión multivista genérica: como base para experimentos de fusión de *tokens* geométricos en otras tareas de regresión 3D (por ejemplo, *pose estimation*).
- Benchmarking de arquitecturas de fusión jerárquica: el código y el dataset permiten comparar estrategias de fusión de condiciones (iluminación, cámara) en problemas de localización.

## Benchmarks y rendimiento

Los resultados declarados por el autor en el `model-index` son los siguientes:

| Split | Métrica | Valor |
|---|---|---|
| `validation` | RMSE_total (Euclidean xyz) | 0.462427 |
| `test` | RMSE_total (Euclidean xyz) | 0.422606 |

La métrica se calcula como `d_i = ||pred_i - y_i||_2` y `RMSE_total = sqrt(mean_i d_i^2)`. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo con ~0.75 M de parámetros, la inferencia requiere menos de 100 MB de VRAM en precisión flotante de 32 bits. Cabe en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: cualquier GPU consumer (NVIDIA GTX 10xx o superior, RTX 20xx/30xx/40xx) o incluso CPU para inferencia por lotes pequeños.
- Despliegue: el modelo se carga con PyTorch estándar. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). Puede exportarse a ONNX para inferencia en producción.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño reducido y la entrada fija (6×36×1×128×128), se espera una inferencia en el orden de milisegundos en GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (localización multivista con fusión jerárquica de iluminación y cámara). El dataset GummyBear Tomography es específico y no se han publicado resultados de otros modelos en la documentación consultada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con el dataset GummyBear Tomography (config `m8_1`); su generalización a otros objetos, geometrías o condiciones de iluminación no está garantizada.
- Requiere un preprocesado específico: campo `anomaly_ref` y normalización *per-image z-score*. Cualquier desviación en el pipeline degradará el rendimiento.
- El repositorio de Hugging Face no contiene los pesos (`pytorch_model.bin` no está presente; el tamaño del repo es 0.0 GB). Para reproducir los resultados es necesario descargar el checkpoint desde el dataset asociado (`checkpoints/m10/m10_hierarchical_light_then_camera.pt`) y cargarlo con el código fuente del proyecto.
- La arquitectura está fijada a 6 iluminaciones y 36 cámaras; no es trivial adaptarla a otros números de vistas sin reentrenar.
- No se han documentado sesgos específicos, pero al ser un modelo de visión entrenado en un dataset sintético o controlado, puede fallar ante variaciones de ruido, oclusión o artefactos no presentes en el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: [tbhugging/gummybear_hierarchical_fusion](https://huggingface.co/tbhugging/gummybear_hierarchical_fusion)
- Dataset asociado: [tbhugging/gummybear-tomography](https://huggingface.co/datasets/tbhugging/gummybear-tomography)
- Informe final reproducible: [GummyBearTomography_Final_Report.ipynb](https://github.com/tbgitoo/gummybear-tomography/blob/master/GummyBearTomography_Final_Report.ipynb)
- Checkpoint fuente: [m10_hierarchical_light_then_camera.pt](https://huggingface.co/datasets/tbhugging/gummybear-tomography/blob/main/checkpoints/m10/m10_hierarchical_light_then_camera.pt)
- Perfil del autor: [tbhugging](https://huggingface.co/tbhugging)
