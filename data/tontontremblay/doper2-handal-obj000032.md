# TontonTremblay/doper2-handal-obj000032

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000032` es un sistema de estimación de pose 6D (posición y orientación) para un objeto concreto de la categoría HANDal, concretamente el objeto con identificador `000032`. Ha sido desarrollado por TontonTremblay (jonathan) utilizando el pipeline DOPER2, un flujo de entrenamiento que combina datos sintéticos, renderizados fotorrealistas y pseudo-etiquetas. El modelo está diseñado para aplicaciones robóticas donde se necesita localizar y manipular objetos de tamaño y forma adecuados para agarre funcional, como herramientas o utensilios.

Arquitectónicamente, emplea un backbone `convnext_tiny` preentrenado con DINOv3 (LVD-1689M) y una cabeza de detección de keypoints basada en mapas de calor (heatmap). Produce 64 keypoints 3D en metros, que posteriormente se utilizan con `solvePnP` para obtener la pose completa. El tamaño del repositorio es de 0.3 GB, lo que indica un modelo ligero y adecuado para inferencia en tiempo real. No se trata de un modelo de lenguaje, sino de un modelo de visión por computador especializado en una tarea concreta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone ConvNeXt-Tiny (preentrenado con DINOv3 LVD-1689M) + cabeza de keypoints por heatmap |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint en formato PyTorch `.pth`) |
| Idiomas soportados | no aplicable (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pth`), además de `config.yaml` y `keypoints_3d.json` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas: primero un detector que opera a 224 píxeles de resolución de entrada, y después una cabeza de keypoints que procesa recortes de 256 píxeles. El backbone es `convnext_tiny` con pesos inicializados desde DINOv3, un modelo autosupervisado entrenado sobre 1689 millones de imágenes (LVD-1689M). La cabeza de keypoints genera mapas de calor para 64 puntos 3D definidos en `keypoints_3d.json`.

El entrenamiento se realizó con el pipeline DOPER2 en su etapa V5, que combina tres fuentes de datos: 10 000 imágenes sintéticas generadas con renderizado DR (Domain Randomization), imágenes con aumentos BOP PBR (Physically Based Rendering) y pseudo-etiquetas procedentes de un proceso de onboarding. No se menciona el uso de RLHF ni DPO, ya que no es un modelo generativo de texto. El checkpoint `best.pth` se seleccionó por el menor error de keypoints en validación (`val kp_err_px`). El archivo `training_provenance.json` documenta todos los argumentos de entrenamiento, fuentes de datos y el commit de git asociado.

## Capacidades

- Estimación de pose 6D (rotación y traslación) de un objeto específico de la categoría HANDal (obj_000032).
- Detección del objeto en la imagen y localización de 64 keypoints 2D/3D.
- Integración con `cv2.solvePnP` para obtener la pose completa en milímetros.
- Inferencia en tiempo real gracias al tamaño reducido del modelo (0.3 GB).
- No tiene capacidades de generación de texto, código, razonamiento lingüístico ni tool calling.
- No soporta visión general; está especializado únicamente en el objeto `000032`.

## Casos de uso

- **Manipulación robótica en entornos industriales**: el modelo permite a un brazo robótico localizar y agarrar el objeto `000032` con precisión. Se usaría en un pipeline de visión donde la cámara captura la escena, el modelo devuelve los keypoints y `solvePnP` calcula la pose para planificar la trayectoria de agarre.
- **Inspección de calidad automatizada**: en líneas de montaje, el modelo puede verificar que el objeto está correctamente orientado o posicionado comparando la pose estimada con una referencia.
- **Realidad aumentada para mantenimiento**: superponer instrucciones o información virtual sobre el objeto físico en tiempo real, usando la pose estimada para anclar el contenido digital.
- **Teleoperación asistida**: en sistemas de control remoto, la pose estimada ayuda a alinear herramientas o guiar al operador en tareas de precisión.
- **Investigación en robótica**: como punto de partida para estudiar la generalización de la estimación de pose en objetos manipulables, o para comparar con otros métodos en el benchmark BOP.
- **Automatización de almacenes**: localización del objeto en estanterías o contenedores para su recogida por robots móviles, siempre que el objeto sea el `000032` de HANDal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia un dataset externo (`TontonTremblay/doper2-handal-results`) donde se pueden consultar las tablas de evaluación BOP val para el objeto `000032`, pero no se incluyen los valores numéricos en la documentación proporcionada.

## Requisitos de hardware

- El checkpoint ocupa 0.3 GB, por lo que la VRAM necesaria para inferencia es moderada. Se estima que puede caber en GPUs consumer con 4-6 GB de VRAM, aunque no se especifica oficialmente.
- GPU recomendada: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 4060, o superiores). Para despliegue en servidores, una T4 o V100 sería suficiente.
- El modelo se carga con PyTorch y CUDA (`device="cuda:0"`), por lo que requiere un entorno con PyTorch instalado.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. La inferencia se realiza mediante el paquete `doper2` (código del pipeline).
- La latencia dependerá del hardware, pero al ser un modelo pequeño (backbone ConvNeXt-Tiny) se espera un throughput alto, del orden de decenas de FPS en GPUs modernas.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la información proporcionada. Existen métodos generales de estimación de pose como FoundationPose o MegaPose, pero no se han publicado resultados comparativos con este modelo específico. La comparación sería posible consultando el dataset de resultados BOP mencionado, pero no está disponible en la documentación actual.

## Limitaciones y advertencias

- **Especialización extrema**: el modelo solo reconoce el objeto `000032` de la categoría HANDal. No generaliza a otros objetos, ni siquiera a otros de la misma categoría.
- **Dependencia de la calibración de cámara**: el uso de `solvePnP` requiere una matriz intrínseca `K` correcta; errores en la calibración degradan la precisión de la pose.
- **Sesgos de entrenamiento**: los datos provienen de renders sintéticos y PBR, por lo que el rendimiento en condiciones reales muy diferentes (iluminación extrema, oclusiones severas) puede verse afectado.
- **Licencia desconocida**: al no especificarse la licencia, el uso comercial del modelo es incierto. Se recomienda contactar al autor antes de utilizarlo en producción.
- **Sin soporte de cuantización**: no se ofrecen versiones cuantizadas (GGUF, ONNX, etc.), lo que limita su despliegue en entornos con restricciones de memoria o en dispositivos embebidos.
- **Riesgo de alucinación**: al ser un modelo discriminativo, no genera contenido, pero puede producir keypoints incorrectos en imágenes ambiguas o con oclusiones, lo que lleva a poses erróneas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TontonTremblay/doper2-handal-obj000032)
- [Dataset de resultados BOP val](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results)
- [Paper de HANDAL (arXiv)](https://arxiv.org/abs/2308.01477)
- [Perfil del autor en Hugging Face](https://huggingface.co/TontonTremblay)
