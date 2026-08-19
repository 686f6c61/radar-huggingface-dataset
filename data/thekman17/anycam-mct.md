# thekman17/anycam-mct

## Resumen

AnyCam-MCT (Multi-Frame Calibration Transformer) es un modelo de visión por computador orientado a la calibración de cámaras y la odometría visual a partir de video sin etiquetar. Desarrollado por Kalman Mahlich (thekman17) como parte de su tesis de maestría en la Universidad Técnica de Múnich, extiende el modelo AnyCam (CVPR 2025) con un módulo de atención cross-frame de aproximadamente 25 millones de parámetros entrenables que agrega características de calibración de AnyCalib a lo largo de múltiples frames. El resultado es un sistema capaz de estimar la distancia focal y la pose de la cámara (rotación y traslación) directamente de secuencias de video, sin necesidad de etiquetas supervisadas.

El modelo se entrenó de forma totalmente auto-supervisada sobre unas 82 000 frames de video real "in-the-wild" e incorpora una corrección de agosto de 2026 que resuelve bugs de evaluación y reentrena la rama de calibración con una normalización de entrada adecuada. Aunque la calibración multi-frame no supera al especialista de una sola imagen (AnyCalib) en precisión, el modelo ofrece una alternativa ligera y de código abierto (Apache-2.0) para pipelines de odometría visual y calibración automática, con un coste computacional moderado. El checkpoint publicado incluye el módulo MCT fusionado con el predictor de pose de AnyCam, listo para inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención cross-frame (MCT) acoplado al pose head de AnyCam; backbones DINOv2 |
| Parametros totales | 346 M en la rama de calibración MCT (25 M entrenables); 460 M en la pipeline completa (MCT + pose + redes de profundidad/flujo) |
| Parametros activos | 25 M (módulo MCT entrenado) |
| Longitud de contexto | Ventana de 4 frames (configuración de inferencia evaluada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo visual, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (fichero .pt) |

## Arquitectura y entrenamiento

AnyCam-MCT combina dos componentes principales. Por un lado, el módulo MCT (Multi-Frame Calibration Transformer) es un bloque de atención cross-frame de aproximadamente 25 millones de parámetros que toma características de calibración extraídas por AnyCalib (un modelo de calibración de una sola imagen) y las agrega a lo largo de una ventana temporal de varios frames. Por otro lado, el pose head de AnyCam (originalmente diseñado para recuperar poses e intrínsecos de video) se reutiliza para la estimación de la pose de la cámara. La salida del MCT se inyecta en el pose head mediante un "focal embedding" de codificación armónica de 8 dimensiones, sustituyendo al costoso sistema de selección entre 32 candidatos de longitud focal que usaba AnyCam originalmente.

El entrenamiento es completamente auto-supervisado: se utilizaron aproximadamente 82 000 frames de video real sin etiquetas, aprovechando la consistencia geométrica entre frames como señal de supervisión. El checkpoint publicado (agosto de 2026) incorpora una segunda pasada de corrección que arregla errores de evaluación, reentrena la rama de calibración con normalización de entrada adecuada y selecciona el checkpoint por pérdida de validación. Los pesos derivan de AnyCam (MIT), AnyCalib (Apache-2.0) y backbones DINOv2 (Apache-2.0).

## Capacidades

- Calibración de cámara: estimación de la distancia focal a partir de secuencias de video, con errores relativos del 15-20 % en datasets como KITTI, Sintel y TUM-RGBD.
- Estimación de pose de cámara: predice rotación y traslación entre frames, con un error de rotación mediano de 0,40° en Sintel.
- Odometría visual: procesa ventanas de múltiples frames (típicamente 4) para mantener la coherencia temporal.
- Auto-supervisión: no requiere etiquetas anotadas, solo video sin procesar.
- Integración modular: puede combinarse con redes de profundidad y flujo óptico para una pipeline completa de reconstrucción 3D.
- Inferencia eficiente: la rama de calibración MCT consume 1,4 GiB de memoria GPU y tarda 161 ms en una NVIDIA A40 con ventana de 4 frames.

## Casos de uso

- Calibración automática de cámaras para realidad aumentada y virtual: el modelo puede estimar la distancia focal de una cámara desconocida a partir de un breve clip de video, facilitando la integración de dispositivos móviles o cámaras web sin calibración manual previa.
- Odometría visual para robótica móvil: al predecir la pose relativa entre frames, el modelo permite que un robot estime su movimiento a partir de la cámara, útil en entornos interiores donde el GPS no está disponible.
- Reconstrucción 3D a partir de video: combinado con redes de profundidad y flujo óptico, el modelo proporciona las poses necesarias para fusionar nubes de puntos o generar mallas 3D de escenas dinámicas.
- Análisis de video deportivo o de vigilancia: la calibración de la cámara permite medir distancias reales en la escena, por ejemplo para estimar velocidades de objetos o dimensiones de áreas.
- Preprocesado para SLAM visual: el modelo puede sustituir la etapa de inicialización de la focal en sistemas SLAM monoculares, reduciendo la deriva inicial.
- Investigación en visión por computador: como modelo de referencia auto-supervisado para calibración y odometría, sirve para comparar arquitecturas más ligeras o para estudiar la agregación temporal de características geométricas.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación provienen de la model card del autor, obtenidos con un protocolo "honesto" (cada modelo evaluado con su propio preprocesado). Los valores son errores de focal relativos (menor es mejor) y error de rotación mediano.

| Medición | AnyCam-MCT | Competidores |
|---|---|---|
| Error de focal, frames nativos wide KITTI | 15,7 % | 11,6 % VGGT-1B · 14,2 % AnyCalib · 20,4 % Pi3 · 38,0 % DA3 |
| Error de focal, ventanas KITTI | 20,4 % | 18,4 % AnyCalib · 66,9 % AnyCam |
| Error de focal, ventanas Sintel | 20,7 % | 20,1 % AnyCalib |
| Error de focal, ventanas TUM-RGBD | 12,9 % | 11,2 % AnyCalib |
| Error de rotación, Sintel (mediana) | 0,40° | 0,50° (AnyCam) |

No se dispone de otros benchmarks públicos adicionales en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: la rama de calibración MCT requiere 1,4 GiB de memoria GPU; la pipeline completa (MCT + pose + profundidad/flujo) requiere 5,0 GiB.
- GPU recomendadas: el autor evaluó en NVIDIA A40, pero el bajo consumo de memoria permite ejecutar el modelo en GPUs consumer como RTX 3060, RTX 4070 o superiores.
- Opciones de despliegue: el checkpoint se carga con el código del repositorio GitHub (`experiments/benchmark_phase_c_checkpoints.py`). No se mencionan integraciones con vLLM, llama.cpp u Ollama (al ser un modelo visual, no textual).
- Latencia: 161 ms para la rama de calibración MCT y 820 ms para la pipeline completa en A40 con ventana de 4 frames.

## Comparativa con modelos similares

| Modelo | Params | Contexto/ventana | Error focal KITTI (nativo) | Error focal KITTI (ventanas) | Licencia |
|---|---|---|---|---|---|
| AnyCam-MCT | 346 M (rama calibración) | 4 frames | 15,7 % | 20,4 % | Apache-2.0 |
| AnyCalib | No disponible | 1 frame | 14,2 % | 18,4 % | Apache-2.0 |
| AnyCam | No disponible | video | No disponible | 66,9 % | MIT |
| VGGT-1B | 1B | No disponible | 11,6 % | No disponible | No disponible |
| Pi3 | No disponible | No disponible | 20,4 % | No disponible | No disponible |
| Depth Anything 3 | No disponible | No disponible | 38,0 % | No disponible | No disponible |

AnyCam-MCT se sitúa en un punto intermedio: mejora claramente a AnyCam original en calibración, pero no alcanza a AnyCalib (especialista de una sola imagen) ni a VGGT-1B (modelo supervisado de gran tamaño). Su ventaja principal es la integración de calibración y pose en un solo pipeline auto-supervisado.

## Limitaciones y advertencias

- La calibración multi-frame está a la par del especialista de una sola imagen (AnyCalib), no lo supera; la agregación temporal no aporta una mejora significativa en este checkpoint.
- La dirección de traslación en TUM-RGBD es peor que la de AnyCam, lo que indica debilidad en la estimación de movimiento traslacional en ciertos escenarios.
- Los modelos supervisados de gran tamaño (como Depth Anything 3) superan a este modelo en precisión de pose absoluta.
- Se observa deriva de trayectoria completa en comparación con la inferencia de contexto largo de AnyCam, lo que limita su uso en secuencias muy largas sin corrección.
- El modelo está diseñado para video; no se ha evaluado su comportamiento en imágenes estáticas individuales.
- Aunque la licencia es Apache-2.0, los pesos derivan de otros proyectos con licencias MIT y Apache-2.0; se debe citar a los autores originales (AnyCam, AnyCalib, DINOv2) según la atribución solicitada.
- No hay información sobre cuantización ni formatos optimizados para despliegue en producción (solo PyTorch .pt).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thekman17/anycam-mct
- Repositorio de código y benchmarks: https://github.com/kalman17/anycam-extension
- Repositorio oficial de AnyCam: https://github.com/Brummi/anycam
- Repositorio de AnyCalib: https://github.com/javrtg/AnyCalib
