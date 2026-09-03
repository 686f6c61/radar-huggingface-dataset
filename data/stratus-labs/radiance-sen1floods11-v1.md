# stratus-labs/radiance-sen1floods11-v1

## Resumen

Radiance SEN1Floods11 v1 es un modelo de segmentación semántica binaria para la detección de aguas de inundación en imágenes de radar de apertura sintética (SAR) del satélite Sentinel-1. Desarrollado por Stratus Labs, es el primer modelo de la familia Radiance orientado a una tarea downstream, y se basa en el backbone Radiance MAE Base v1, un ViT-B/16 preentrenado con masked autoencoding (MAE) sobre el conjunto de datos SSL4EO-S12. El modelo toma como entrada dos canales SAR (VV y VH) en decibelios normalizados y produce un mapa de probabilidad de inundación por píxel.

La relevancia de este modelo radica en su capacidad para trabajar exclusivamente con SAR, lo que permite el monitoreo de inundaciones en condiciones de nubosidad o de noche, donde los sensores ópticos fallan. Su arquitectura combina un encoder ViT-B/16 con un decodificador de convoluciones transpuestas de cuatro etapas, y ha sido ajustado sobre el subconjunto etiquetado a mano del dataset SEN1Floods11 v1.1, con 252 chips de entrenamiento y 89 de validación. El modelo alcanza un IoU de 0.4141 en la clase de inundación en validación, un resultado modesto pero esperable dado el pequeño volumen de datos y la decisión de usar solo una modalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B/16 (encoder MAE) + decodificador ConvTranspose de 4 etapas |
| Parametros totales | no disponible (encoder ViT-B/16 + head de ~3,55 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija 224×224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch state dict (best.pt) + codigo fuente (model.py) |

## Arquitectura y entrenamiento

El modelo se compone de un encoder ViT-B/16 con parches de 16×16 píxeles, preentrenado de forma auto-supervisada con masked autoencoding (MAE) sobre el conjunto SSL4EO-S12, que incluye imágenes multiespectrales y SAR. El encoder procesa los dos canales de entrada (VV y VH) y produce representaciones de 768 dimensiones. Sobre estas, un decodificador de convoluciones transpuestas de cuatro etapas (768 → 256 → 128 → 64 → 32 → 1) genera un mapa de logits de una sola clase, que se convierte en probabilidad mediante sigmoide.

El ajuste fino se realizó sobre el subconjunto etiquetado a mano de SEN1Floods11 v1.1, con 252 chips de entrenamiento y 89 de validación. Las imágenes se normalizaron a decibelios, se recortaron a 224×224 píxeles con aumentación aleatoria (flips horizontales y verticales) y se estandarizaron con las estadísticas de SSL4EO-S12. Se usó el optimizador AdamW con tasas de aprendizaje discriminativas (1e-5 para el encoder, 3e-4 para la cabeza), pérdida BCE + Dice con enmascarado de píxeles no válidos, precisión bf16 y recorte de gradiente. El entrenamiento duró 60 épocas, pero el mejor checkpoint se obtuvo en la época 4, evidenciando un sobreajuste rápido debido al pequeño conjunto de datos. El entrenamiento completo tomó unos 5 minutos en una NVIDIA GB10 (DGX Spark).

## Capacidades

- Segmentación binaria de aguas de inundación a nivel de píxel a partir de imágenes SAR Sentinel-1 (canales VV y VH).
- Procesamiento de imágenes de 224×224 píxeles con dos canales de entrada, normalizadas en decibelios.
- Generación de mapas de probabilidad continua (0-1) que pueden umbralizarse para obtener máscaras binarias.
- Inferencia eficiente gracias al tamaño moderado del modelo (encoder ViT-B + cabeza ligera).
- Compatible con el ecosistema PyTorch y Hugging Face Hub mediante descarga directa del repositorio.
- No incluye capacidades de tool calling, agentes, razonamiento multimodal ni procesamiento de lenguaje.

## Casos de uso

- Monitoreo de inundaciones en tiempo casi real: el modelo puede procesar imágenes SAR Sentinel-1 adquiridas durante episodios de lluvia intensa o en zonas con cobertura nubosa persistente, generando mapas de extensión de agua en minutos. Su entrada de dos canales (VV+VH) es suficiente para distinguir agua superficial de otros elementos.
- Respuesta humanitaria y gestión de desastres: organizaciones como agencias de protección civil pueden usar los mapas de probabilidad para priorizar zonas de evacuación o evaluar daños en infraestructura, siempre con revisión humana posterior.
- Seguros y evaluación de riesgos: compañías aseguradoras pueden integrar el modelo en pipelines de análisis de pólizas para estimar la exposición a inundaciones en áreas rurales o periurbanas, usando imágenes SAR históricas.
- Agricultura de precisión: el modelo ayuda a detectar anegamiento de cultivos tras lluvias torrenciales, permitiendo a los agricultores y cooperativas evaluar pérdidas y planificar drenajes.
- Planificación urbana y ordenación territorial: los mapas de inundación generados con SAR pueden alimentar sistemas de información geográfica (SIG) para identificar zonas de riesgo y orientar nuevas construcciones.
- Investigación climática: el modelo sirve como herramienta de análisis en estudios sobre cambios en la frecuencia e intensidad de inundaciones, al poder procesar series temporales de imágenes SAR de forma automática.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el subconjunto de validación (89 chips etiquetados a mano):

| Metrica | Valor |
|---|---|
| IoU clase inundacion (val) | 0,4141 |
| BCE loss (val, solo píxeles válidos) | 0,2242 |
| Train loss | ~0,8 |

Como referencia, el baseline de sonda lineal (encoder congelado, solo cabeza entrenada) alcanzó 0,361 IoU, por lo que el ajuste fino completo supuso una mejora relativa del 14,7%. El autor indica que el estado del arte publicado para esta tarea se sitúa entre 0,60 y 0,75 mIoU, pero esos resultados se obtienen con backbones más grandes, fusión de Sentinel-1 + Sentinel-2 + DEM y conjuntos de entrenamiento más amplios. No se han publicado comparaciones formales con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene un tamaño de repositorio de 0,5 GB, lo que indica que los pesos ocupan aproximadamente 200-300 MB en precisión bf16 o fp32.
- Se entrenó en una única NVIDIA GB10 (DGX Spark) en unos 5 minutos, por lo que la inferencia es extremadamente ligera.
- Cabe en cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060 o superiores). Incluso podría ejecutarse en CPU para inferencia por lotes pequeños.
- Para despliegue en producción, se puede servir con PyTorch estándar, TorchServe o mediante exportación a ONNX para entornos sin GPU.
- No se requieren GPUs de alta gama como A100 o H100; una RTX 3060 o similar es más que suficiente.
- La latencia por imagen de 224×224 debería ser inferior a 10 ms en GPU moderna, aunque no se proporcionan mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la misma categoría (segmentación de inundaciones con SAR Sentinel-1). El propio autor compara su resultado con el estado del arte publicado, que alcanza 0,60-0,75 mIoU usando arquitecturas más grandes y fusión multimodal. Como referencia interna, el modelo supera a su propio baseline de sonda lineal (0,361 IoU) en un 14,7% relativo. No se pueden establecer comparaciones cuantitativas con otras implementaciones sin datos adicionales.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido: solo 252 chips etiquetados a mano, lo que provoca sobreajuste rápido (el mejor checkpoint es de la época 4 de 60).
- Uso exclusivo de Sentinel-1: no incorpora información óptica (Sentinel-2) ni elevación (DEM), que son conocidas por mejorar la precisión en la detección de inundaciones.
- Entrada fija de 224×224 píxeles: el pos-embedding del encoder está atado a una cuadrícula de 14×14 parches; para otros tamaños de entrada se requiere interpolación de pos-embeddings, no incluida en esta versión.
- Sin corrección radiométrica más allá de la normalización en decibelios con estadísticas de SSL4EO-S12.
- No apto para alertas automáticas de inundación sin revisión humana: los mapas de confianza deben usarse como apoyo a la decisión, no como decisión final.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el usuario debe verificar el cumplimiento de la licencia del dataset SEN1Floods11 original (Bonafilia et al., 2020).
- El modelo no ha sido evaluado en otras regiones geográficas ni con otras configuraciones de adquisición SAR; su generalización fuera del dominio de entrenamiento es incierta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stratus-labs/radiance-sen1floods11-v1
- Backbone Radiance MAE Base v1: https://huggingface.co/stratus-labs/radiance-mae-base-v1
- Dataset SEN1Floods11 en Hugging Face: https://huggingface.co/datasets/blumenstiel/Sen1Floods11
- Repositorio original de SEN1Floods11: https://github.com/cloudtostreet/Sen1Floods11
- Organización Stratus Labs en Hugging Face: https://huggingface.co/stratus-labs
