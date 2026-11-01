# torch-pointcloud/tr3d.sunrgbd.mmdet3d

## Resumen

TR3D (Towards Real-Time Indoor 3D Object Detection) es un detector de objetos 3D para interiores basado en una arquitectura fully convolutional sobre vóxeles dispersos. Este checkpoint concreto, `tr3d.sunrgbd.mmdet3d`, ha sido entrenado sobre el dataset SUN RGB-D y convertido desde MMDetection3D al ecosistema de la librería torch-pointcloud por su autor, Arthur Dujardin. El modelo resuelve la tarea de localizar y clasificar objetos en escenas interiores a partir de nubes de puntos con información de color y normales.

El modelo es compacto: 14,7 millones de parámetros, 128 canales de características, 3 canales de entrada y 10 clases de objetos. Su diseño prioriza la eficiencia computacional para permitir inferencia en tiempo real, algo poco habitual en detección 3D de interiores, donde los métodos basados en transformers o en propuestas densas suelen ser costosos. Frente a enfoques como VoteNet o FCAF3D, TR3D reduce la latencia manteniendo una precisión competitiva.

Es relevante ahora porque el despliegue de percepción 3D en robótica doméstica, realidad aumentada y sistemas embebidos exige modelos ligeros que puedan ejecutarse en GPUs de consumo. Este checkpoint, con licencia Apache-2.0 y pesos en safetensors, facilita la integración en pipelines de PyTorch sin dependencias de frameworks de detección 3D completos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TR3D (detector 3D fully convolutional sobre vóxeles dispersos) |
| Parámetros totales | 14.670.674 (14,7 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no aplica; tarea de visión 3D) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TR3D es un detector 3D totalmente convolucional que opera sobre una representación de vóxeles dispersos de la nube de puntos. La entrada combina coordenadas (`pos`), color (`color`) y normales (`normal`), que se transforman en una rejilla de vóxeles procesada por convoluciones dispersas (implementadas mediante `spconv`). El modelo extrae características de 128 canales y predice directamente cajas 3D y clases sin etapas de propuesta basadas en votación, lo que reduce la latencia frente a arquitecturas como VoteNet. La cabeza de detección es densa y fully convolutional, lo que permite procesar la escena de forma eficiente.

El entrenamiento se realizó sobre SUN RGB-D, un benchmark de comprensión de escenas interiores con anotaciones de cajas 3D en 10 clases. El checkpoint original proviene de MMDetection3D y ha sido convertido a torch-pointcloud. No se detallan en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). La innovación principal del trabajo es la arquitectura fully convolutional sobre vóxeles dispersos orientada a tiempo real, descrita en el paper de ICIP 2023.

## Capacidades

- Detección de objetos 3D en escenas interiores: predice cajas 3D (centro, dimensiones, orientación) y etiquetas de clase para 10 categorías de SUN RGB-D.
- Procesamiento de nubes de puntos con color y normales como entrada multimodal geométrica.
- Extracción de características densas de 128 canales mediante `forward_features`, reutilizable para tareas downstream (clasificación de escena, segmentación, etc.).
- Inferencia eficiente en GPU gracias a kernels de convolución dispersa (`spconv`), orientada a tiempo real.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión 2D genérica ni procesamiento de audio.

## Casos de uso

- Robótica doméstica: un robot móvil equipado con cámara RGB-D puede usar el modelo para localizar sillas, mesas, camas y otros objetos en tiempo real, planificando la navegación y la manipulación con las cajas 3D predichas.
- Realidad aumentada: anclar contenido virtual sobre objetos físicos en interiores requiere detección 3D precisa; el modelo ofrece cajas 3D con orientación a partir de la nube de puntos del dispositivo.
- Inventario automático de espacios: escanear una habitación con un sensor RGB-D y contar o localizar objetos de las 10 clases de SUN RGB-D para aplicaciones de logística o facilities management.
- Preprocesado para segmentación 3D: usar `forward_features` para obtener descriptores de 128 canales por vóxel y alimentar un cabezal de segmentación semántica o de instancias posterior.
- Sistemas de asistencia a personas con discapacidad visual: detección de obstáculos y objetos relevantes en interiores con latencia baja, aprovechando la eficiencia del modelo.
- Benchmarking y prototipado en investigación: punto de partida reproducible (Apache-2.0, safetensors, torch-pointcloud) para comparar detectores 3D ligeros sobre SUN RGB-D sin montar MMDetection3D completo.
- Integración en pipelines de percepción embebida: al ser un modelo de 14,7 M de parámetros, es candidato para GPUs de consumo o plataformas con CUDA, reduciendo coste frente a detectores 3D más pesados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Dataset | Métrica | Valor |
|---|---|---|
| SUN RGB-D | mAP@0.25 | 66,67 |
| SUN RGB-D | mAP@0.5 | 50,37 |

No se han publicado en la información disponible resultados adicionales (latencia, throughput, comparación con otros detectores) más allá de estos dos valores de mAP.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 14,7 M de parámetros y pesos en safetensors (repo de 0,1 GB), la huella de pesos es muy reducida (decenas de MB), aunque el consumo real depende del número de vóxeles y del tamaño de la escena.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la build de `spconv`; el modelo requiere kernels GPU-only, por lo que no funciona en CPU.
- Cabe en GPUs de consumo: sí, previsiblemente en tarjetas como RTX 3060/4060/4090, dado el reducido número de parámetros; la VRAM efectiva vendrá determinada por el tamaño del voxel grid y el batch.
- Opciones de despliegue: librería `torch-pointcloud` con PyTorch y `spconv` (build específica para la versión de torch y CUDA). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; el paper original está orientado a tiempo real, pero no se aportan cifras concretas en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mAP@0.5 SUN RGB-D | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tr3d.sunrgbd.mmdet3d | 14,7 M | Nube de puntos (pos, color, normal) | 50,37 | Apache-2.0 | HuggingFace (torch-pointcloud) |
| VoteNet (referencia) | no disponible en la información | Nube de puntos | no disponible en la información | no disponible | MMDetection3D |
| FCAF3D (referencia) | no disponible en la información | Nube de puntos | no disponible en la información | no disponible | MMDetection3D |

No se dispone en la información proporcionada de cifras comparativas verificadas de otros detectores 3D sobre SUN RGB-D, por lo que la comparativa cuantitativa se limita a los valores del propio modelo. Las alternativas citadas (VoteNet, FCAF3D) se mencionan como referentes del mismo dominio, pero sin datos numéricos confirmados en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena exclusivamente con SUN RGB-D, por lo que su rendimiento puede degradarse en escenas, sensores o distribuciones distintas a las del dataset (otras cámaras RGB-D, iluminación, tipos de habitación).
- Riesgo de alucinación: como todo detector, puede producir falsos positivos y cajas mal localizadas, especialmente en objetos ocluidos o con pocos puntos.
- Limitaciones de contexto o idioma: no aplica el concepto de contexto textual; el modelo solo procesa nubes de puntos y no tiene capacidades lingüísticas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar las licencias de `spconv` y de las dependencias de torch-pointcloud, así como la del dataset SUN RGB-D para usos derivados.
- Requiere GPU con CUDA y una build de `spconv` compatible con la versión de torch; no hay soporte CPU documentado, lo que limita el despliegue en entornos sin GPU.
- Solo 10 clases de SUN RGB-D; no cubre categorías fuera de ese vocabulario.
- Los resultados de mAP están marcados como no verificados en la model card; deben tomarse como declaraciones del autor.
- El número de descargas (19) y likes (0) indica baja adopción, con menor soporte comunitario y menos validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/tr3d.sunrgbd.mmdet3d
- Paper TR3D: https://arxiv.org/abs/2302.02858
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- MMDetection3D (origen del checkpoint): https://github.com/open-mmlab/mmdetection3d
- Dataset SUN RGB-D (paper CVPR 2015): https://arxiv.org/abs/1501.05619
