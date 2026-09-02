# TontonTremblay/doper2-handal-obj000022

## Resumen

El modelo `doper2-handal-obj000022` es un modelo de estimación de pose 3D de un objeto concreto (el objeto `000022` del conjunto de datos HANDal), entrenado con el pipeline DOPER2. Desarrollado por TontonTremblay, este modelo predice 64 puntos clave 3D (keypoints) en metros a partir de una imagen RGB, permitiendo resolver la pose completa del objeto mediante PnP. Está diseñado para aplicaciones de robótica, manipulación y realidad aumentada donde se necesita localizar y orientar un objeto específico en el espacio.

El modelo utiliza un backbone `convnext_tiny.dinov3_lvd1689m` (una variante de ConvNeXt preentrenada con DINOv3) y una cabeza de keypoints basada en mapas de calor (heatmap). El pipeline de entrenamiento corresponde a la etapa V5, que combina datos sintéticos DR (10k muestras), PBR de BOP y pseudo-etiquetas de onboarding. El repositorio incluye el checkpoint `best.pth`, el archivo de keypoints 3D, la configuración de entrenamiento y un archivo de procedencia con todos los argumentos y fuentes de datos.

Este modelo es relevante porque demuestra un enfoque práctico para la estimación de pose de objetos específicos con un pipeline reproducible y abierto, aunque su alcance se limita a un único objeto y no es un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone ConvNeXt Tiny (variante DINOv3) + cabeza de keypoints por heatmap |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch `.pth`) |
| Idiomas soportados | no aplicable (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pth`), junto con `keypoints_3d.json`, `config.yaml`, `training_provenance.json` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas: un detector que opera a 224 píxeles de entrada y una cabeza de keypoints que procesa recortes de 256 píxeles. El backbone es `convnext_tiny.dinov3_lvd1689m`, una versión de ConvNeXt Tiny preentrenada con el método DINOv3 sobre un conjunto de datos masivo (LVD-1689M). La cabeza de keypoints utiliza mapas de calor (heatmap) para predecir 64 puntos clave 3D normalizados en metros.

El entrenamiento corresponde a la etapa V5 del pipeline DOPER2, que combina tres fuentes de datos: 10.000 imágenes sintéticas generadas con DR (Domain Randomization), imágenes fotorrealistas PBR del estándar BOP y pseudo-etiquetas obtenidas durante el proceso de onboarding. El archivo `training_provenance.json` documenta todos los argumentos de entrenamiento, las fuentes de datos y el commit de git asociado, lo que facilita la reproducibilidad. No se menciona el uso de RLHF ni DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Estimación de pose 3D de un objeto específico (HANDal `000022`) a partir de una imagen RGB.
- Predicción de 64 keypoints 3D en metros, que permiten resolver la pose completa (rotación y traslación) mediante PnP.
- Detección del objeto en la imagen con un umbral de confianza configurable (`score_thr`).
- Inferencia sobre GPU (CUDA) con el paquete `doper2`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo de visión especializado.

## Casos de uso

- **Robótica de manipulación**: el modelo permite a un brazo robótico localizar y orientar el objeto `000022` en el espacio para tareas de agarre o ensamblaje. Se usaría la pose estimada para planificar trayectorias y evitar colisiones.
- **Control de calidad industrial**: en una línea de producción, el modelo puede verificar la posición y orientación correcta del objeto antes de un paso de ensamblaje, comparando la pose estimada con la esperada.
- **Realidad aumentada**: superponer información digital sobre el objeto físico en tiempo real, por ejemplo, guías de montaje o instrucciones de mantenimiento, usando la pose para alinear el contenido virtual.
- **Navegación autónoma**: en entornos donde el objeto `000022` es un marcador o referencia, el modelo puede usarse para estimar la posición relativa del robot respecto al objeto.
- **Investigación en visión por computador**: como referencia para comparar pipelines de estimación de pose en objetos específicos, gracias a la documentación completa del entrenamiento y los resultados BOP.
- **Automatización de inventario**: detectar y localizar el objeto en estanterías o contenedores para sistemas de gestión de almacén, usando la pose para guiar a un brazo robótico en la recogida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a un dataset externo (`TontonTremblay/doper2-handal-results`) para las tablas completas de evaluación BOP del objeto `000022`, pero no se incluyen valores numéricos en el repositorio actual.

## Requisitos de hardware

- El checkpoint se carga en GPU con CUDA (`device="cuda:0"`), por lo que se requiere una GPU NVIDIA con al menos 4-6 GB de VRAM para inferencia en tiempo real (el backbone ConvNeXt Tiny es ligero, pero la inferencia con mapas de calor puede requerir memoria adicional).
- GPU recomendadas: RTX 3060 o superior, o GPUs de datacenter como A10 o A100 para despliegues concurrentes.
- No se especifica si funciona en CPU; el código de ejemplo usa CUDA explícitamente.
- Opciones de despliegue: el paquete `doper2` proporciona las funciones `load_model` e `infer_image`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables para este objeto específico. El pipeline DOPER2 es una propuesta propia del autor, y no se han encontrado alternativas públicas que estimen la pose del mismo objeto con características comparables. Se recomienda consultar el dataset de resultados BOP para comparar con otros métodos de la literatura.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el objeto `000022` del conjunto HANDal; no generaliza a otros objetos.
- No se especifica la licencia, por lo que el uso comercial puede no estar permitido o requerir contacto con el autor.
- La precisión de la pose depende de la calidad de la imagen y de las condiciones de iluminación; no se han publicado métricas de error en este repositorio.
- El modelo no maneja oclusiones severas ni objetos parcialmente visibles, salvo que el detector las soporte (no se documenta).
- El archivo `keypoints_3d.json` es esencial para la inferencia; sin él, no se puede resolver la pose.
- No hay garantías de soporte ni mantenimiento, al ser un proyecto personal.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TontonTremblay/doper2-handal-obj000022)
- [Dataset de resultados BOP](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results)
- [Perfil del autor en Hugging Face](https://huggingface.co/TontonTremblay)
- [Dataset DOPER_BOP](https://huggingface.co/datasets/TontonTremblay/DOPER_BOP)
