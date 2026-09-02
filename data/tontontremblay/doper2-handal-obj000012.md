# TontonTremblay/doper2-handal-obj000012

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000012` es un estimador de pose 6D (posición y orientación) específico para el objeto `HANDal obj_000012`, entrenado con el pipeline DOPER2. Desarrollado por TontonTremblay, este modelo forma parte de un sistema más amplio de estimación de pose para objetos de manipulación robótica, y está diseñado para ser usado en tareas de *picking* y manipulación con robots.

El modelo utiliza un backbone `convnext_tiny.dinov3_lvd1689m` (ConvNeXt-Tiny preentrenado con DINOv3) y predice 64 *keypoints* 3D en metros, que posteriormente se combinan con la calibración de cámara mediante `solvePnP` para obtener la pose completa. El entrenamiento sigue la etapa V5 del pipeline DOPER2, que combina 10 000 imágenes sintéticas con *domain randomization*, datos PBR de BOP y pseudo-etiquetas de *onboarding*. El repositorio tiene un tamaño de 0,3 GB e incluye el checkpoint, la configuración y los metadatos de entrenamiento.

La relevancia de este modelo radica en su enfoque específico para un objeto concreto, lo que permite una alta precisión en entornos controlados, y su integración con el ecosistema DOPER2 para evaluación estandarizada en el benchmark BOP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (backbone `convnext_tiny.dinov3_lvd1689m`) con cabeza de *keypoints* tipo *heatmap* |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de detección y estimación de *keypoints* basada en un backbone ConvNeXt-Tiny preentrenado con DINOv3 (variante `lvd1689m`). La entrada al detector es de 224 píxeles, y el recorte del objeto para la estimación de *keypoints* se realiza a 256 píxeles. La cabeza de *keypoints* es de tipo *heatmap*, produciendo 64 mapas de calor correspondientes a los puntos 3D definidos en `keypoints_3d.json`.

El entrenamiento corresponde a la etapa V5 del pipeline DOPER2, que utiliza 10 000 imágenes sintéticas con *domain randomization* agresivo, datos PBR del benchmark BOP y pseudo-etiquetas generadas en un proceso de *onboarding*. No se dispone de información detallada sobre el número total de épocas, la función de pérdida o el optimizador, aunque el archivo `training_provenance.json` incluido en el repositorio contiene los argumentos completos de entrenamiento, las fuentes de datos y el *commit* de git asociado.

## Capacidades

- Estimación de pose 6D (traslación y rotación) para el objeto específico `HANDal obj_000012`.
- Detección del objeto en la imagen mediante un detector integrado (con *score threshold* configurable).
- Predicción de 64 *keypoints* 3D en metros, que permiten resolver la pose mediante `solvePnP` con la calibración de cámara.
- Inferencia sobre imágenes individuales (no se menciona soporte para vídeo o *batch*).
- Integración con el ecosistema DOPER2 para evaluación en el benchmark BOP.
- No soporta generación de texto, *tool calling*, agentes ni capacidades multimodales más allá de la visión.

## Casos de uso

- **Manipulación robótica en entornos controlados**: el modelo proporciona la pose 6D del objeto `HANDal obj_000012`, permitiendo a un brazo robótico planificar y ejecutar agarres precisos. La salida en metros y la compatibilidad con `solvePnP` facilitan la integración directa en el bucle de control.
- **Control de calidad en líneas de montaje**: verificar la posición y orientación correcta del objeto durante el ensamblaje, comparando la pose estimada con la esperada.
- **Realidad aumentada industrial**: superponer información digital (instrucciones, advertencias) sobre el objeto en tiempo real, usando la pose estimada para alinear el contenido virtual.
- **Investigación en estimación de pose**: servir como referencia para evaluar el pipeline DOPER2 en el objeto `000012` dentro del benchmark BOP, comparando resultados con otros métodos.
- **Automatización de *picking* en almacenes**: integrar el modelo en un sistema de visión para guiar a un robot en la recogida de piezas específicas, siempre que el objeto coincida con `HANDal obj_000012`.
- **Validación de calibración de cámaras**: al requerir la matriz intrínseca `K`, el modelo puede usarse para verificar la precisión de la calibración de un sistema de visión, observando la coherencia de las poses estimadas en diferentes tomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor referencia un dataset de resultados en [TontonTremblay/doper2-handal-results](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results) donde se incluyen tablas de evaluación completas y cuadrículas de inferencia para el objeto `obj_000012`, pero los valores concretos no se proporcionan en la *model card*.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni GPU.
- El tamaño del checkpoint (`best.pth`) es de aproximadamente 0,3 GB, lo que sugiere que el modelo es ligero y podría ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, aunque no hay datos confirmados.
- El código de inferencia mostrado en la *model card* usa `device="cuda:0"`, indicando soporte para GPU NVIDIA.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.), ya que no es un modelo de lenguaje. La inferencia se realiza mediante el paquete `doper2.infer`.
- No se proporcionan datos de latencia o *throughput*.

## Comparativa con modelos similares

No disponible. Este modelo es específico para un único objeto (`HANDal obj_000012`) y forma parte de un pipeline propietario (DOPER2). No se dispone de información sobre modelos comparables de la misma categoría en el contexto de la estimación de pose para este objeto concreto.

## Limitaciones y advertencias

- **Especificidad del objeto**: el modelo solo funciona para el objeto `HANDal obj_000012`; no es generalizable a otros objetos sin reentrenamiento.
- **Dependencia de la calibración**: la precisión de la pose final depende de la calidad de la matriz de calibración de cámara `K` proporcionada por el usuario.
- **Sensibilidad a condiciones de imagen**: aunque el entrenamiento incluye *domain randomization*, el rendimiento en condiciones muy diferentes a las de entrenamiento (iluminación extrema, oclusiones severas) no está garantizado.
- **Licencia desconocida**: al no especificarse la licencia, no se puede determinar si el uso comercial está permitido. Se recomienda contactar con el autor antes de utilizarlo en producción.
- **Sin soporte para otros idiomas o tareas**: al ser un modelo de visión, no aplica a tareas de lenguaje.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo de texto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TontonTremblay/doper2-handal-obj000012)
- [Dataset de resultados BOP](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results)
- [Perfil del autor en Hugging Face](https://huggingface.co/TontonTremblay)
- [Dataset DOPER_BOP](https://huggingface.co/datasets/TontonTremblay/DOPER_BOP)
- [Repositorio blender2rand (pipeline de renderizado)](https://github.com/TontonTremblay/blender2rand)
