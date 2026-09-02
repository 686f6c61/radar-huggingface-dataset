# TontonTremblay/doper2-handal-obj000009

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000009` es un modelo de estimación de pose 6D (posición y orientación) para el objeto HANDal `000009`, entrenado con el pipeline DOPER2 desarrollado por Jonathan Tremblay (TontonTremblay). Se trata de un modelo de visión por computadora, no de un modelo de lenguaje, que predice 64 keypoints 3D del objeto a partir de una imagen RGB, permitiendo recuperar la pose completa mediante un solucionador PnP.

El modelo utiliza un backbone ConvNeXt tiny preentrenado con DINOv3 (lvd1689m) y una cabeza de keypoints basada en mapas de calor (heatmap). El entrenamiento sigue la etapa V5 del pipeline DOPER2, que combina datos sintéticos generados con renderizado DR synth (10k imágenes), datos BOP PBR y pseudo-etiquetas de onboarding. La entrada al detector es de 224 píxeles y la del recorte de keypoints de 256 píxeles.

Este modelo es relevante para aplicaciones de robótica, manipulación y realidad aumentada donde se necesita localizar con precisión un objeto específico en el espacio 3D. Al estar especializado en un único objeto, ofrece una solución ligera y enfocada para tareas de pose estimation en entornos controlados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt tiny (backbone) + cabeza de keypoints heatmap |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | best.pth (PyTorch) |

## Arquitectura y entrenamiento

El modelo se compone de un backbone ConvNeXt tiny preentrenado con DINOv3 (lvd1689m) y una cabeza de regresión de keypoints basada en mapas de calor. La entrada al detector es de 224×224 píxeles y la del recorte de keypoints de 256×256. El modelo predice 64 keypoints 3D cuyas posiciones se almacenan en `keypoints_3d.json` en unidades de metros.

El entrenamiento sigue la etapa V5 del pipeline DOPER2, que combina tres fuentes de datos: 10k imágenes sintéticas generadas con renderizado DR synth, imágenes BOP PBR (physically based rendering) y pseudo-etiquetas de onboarding. No se menciona el uso de RLHF ni DPO, ya que no es un modelo generativo de texto. El archivo `training_provenance.json` contiene los argumentos completos de entrenamiento, las fuentes de datos y el commit de git asociado.

## Capacidades

- Estimación de pose 6D de un objeto específico (HANDal `000009`) a partir de una imagen RGB.
- Detección del objeto en la imagen y localización de 64 keypoints 2D y 3D.
- Recuperación de la rotación y traslación del objeto mediante `cv2.solvePnP` con los keypoints 3D.
- Integración con el paquete `doper2` para carga de modelos e inferencia.
- No tiene capacidades de generación de texto, razonamiento lingüístico ni tool calling.

## Casos de uso

- Robótica de manipulación: el modelo permite a un brazo robótico localizar el objeto HANDal `000009` en el espacio 3D para planificar agarres precisos. Los keypoints 3D se usan directamente con `solvePnP` para obtener la pose relativa a la cámara.
- Realidad aumentada: superposición de modelos virtuales sobre el objeto real en tiempo real, usando la pose estimada para alinear gráficos 3D con la escena capturada.
- Control de calidad industrial: verificación de la posición y orientación de piezas en una línea de montaje, comparando la pose estimada con la esperada.
- Navegación autónoma de robots móviles: detección y localización del objeto para evitar colisiones o interactuar con él en entornos semiestructurados.
- Interacción humano-robot: seguimiento de la pose del objeto para que el robot responda a movimientos o gestos del usuario que implican el objeto.
- Seguimiento de objetos en vídeo: aplicación del modelo a secuencias de vídeo para estimar la pose en cada fotograma, útil en análisis de movimiento o cinematografía virtual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor referencia un dataset de resultados en [TontonTremblay/doper2-handal-results](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results) donde se pueden consultar tablas de evaluación completas y cuadrículas de inferencia, pero no se proporcionan valores numéricos en la model card.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible.
- Al tratarse de un backbone ConvNeXt tiny, el modelo es relativamente ligero y probablemente pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, aunque no hay confirmación oficial.
- El código de ejemplo usa `device="cuda:0"`, lo que indica que se espera una GPU NVIDIA con CUDA.
- No se mencionan opciones de despliegue específicas como vLLM u Ollama, ya que no es un modelo de lenguaje. La inferencia se realiza mediante el paquete `doper2` y PyTorch.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre modelos comparables en la misma categoría (estimación de pose para objetos específicos) dentro de la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el objeto HANDal `000009`; no generaliza a otros objetos o variantes.
- No se especifican sesgos conocidos, pero al ser un modelo de visión entrenado con datos sintéticos y PBR, puede tener un rendimiento degradado en condiciones de iluminación o texturas muy diferentes a las del entrenamiento.
- No se dispone de información sobre la licencia, por lo que se desconoce si permite uso comercial o modificación.
- El formato de pesos es un archivo `.pth` de PyTorch, no safetensors, lo que puede implicar riesgos de seguridad al cargar pesos de fuentes no confiables.
- No se proporcionan métricas de error (kp_err_px) ni resultados cuantitativos en la model card, lo que dificulta evaluar su precisión real.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TontonTremblay/doper2-handal-obj000009)
- [Dataset de resultados BOP](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results)
- [Perfil de Hugging Face del autor](https://huggingface.co/TontonTremblay)
- [GitHub del autor](https://github.com/TontonTremblay)
