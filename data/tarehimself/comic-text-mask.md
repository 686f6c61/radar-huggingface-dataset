# TareHimself/comic-text-mask

## Resumen

`TareHimself/comic-text-mask` es un modelo de segmentación semántica binaria diseñado específicamente para generar máscaras de texto en viñetas de cómics y manga. Forma parte del pipeline de limpieza del proyecto [comic-localizer](https://github.com/TareHimself/comic-localizer), donde actúa sobre los recortes de regiones de texto detectadas por un detector previo y produce una máscara píxel a píxel que indica si cada píxel pertenece a texto o no. Esta máscara alimenta posteriormente un modelo de inpainting (LaMa) para eliminar el texto de forma natural.

El modelo fue desarrollado por TareHimself y se distribuye bajo licencia MIT. Tiene 14,34 millones de parámetros y se entrena con texto sintético renderizado sobre superficies planas generadas proceduralmente y páginas de cómic reales limpiadas, cubriendo alfabeto latino, japonés (kana y kanji, horizontal y vertical), coreano y chino, incluyendo una gran proporción de secuencias de glifos aleatorios para cubrir caracteres raros. En validación alcanza un IoU de 0,918, precisión 0,956 y recall 0,959 sobre conjuntos de validación sintéticos y reales.

La relevancia de este modelo radica en su especialización: no es un segmentador genérico, sino una pieza optimizada para un flujo de trabajo concreto de localización y traducción de cómics, donde la precisión en los bordes del texto es crítica para que el posterior inpainting no deje artefactos visibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentación binaria basada en encoder-decoder (segmentation-models-pytorch), backbone no especificado |
| Parametros totales | 14.339.793 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen, tamaño cuadrado S definido en `tm_meta.json`) |
| Tipos de cuantizacion | no disponible; pesos en fp32 (safetensors) y TorchScript |
| Idiomas soportados | en, ja, ko, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (red pristina) y TorchScript (`model.pt` con preprocesado integrado) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la model card, pero al usar la librería `segmentation-models-pytorch` se trata de una red encoder-decoder típica de segmentación, probablemente una U-Net con un backbone preentrenado (ResNet, EfficientNet u otro). El modelo acepta una entrada cuadrada de tamaño `S` (definido en los metadatos) y devuelve un mapa de probabilidades de un canal. El checkpoint `model.pt` incluye normalización (división por 255, normalización ImageNet) y la activación sigmoide final, mientras que `model.safetensors` contiene la red sin preprocesado.

El entrenamiento se realizó con datos sintéticos: texto renderizado sobre superficies planas generadas proceduralmente con clutter sintético y sobre páginas de cómic reales limpiadas, enmarcadas como recortes estilo detector. El texto incluye alfabeto latino, japonés (kana y kanji en orientación horizontal y vertical), coreano y chino. Una fracción grande de los ejemplos usa secuencias de glifos aleatorios para cubrir caracteres poco frecuentes. No se redistribuye ninguna imagen fuente original.

## Capacidades

- Segmentación binaria de texto en imágenes de cómic y manga: genera una máscara donde cada píxel se clasifica como texto o no texto.
- Soporte multilingüe para texto latino, japonés, coreano y chino, incluyendo escritura vertical.
- Manejo de recortes de regiones de texto (crops) provenientes de un detector, no de páginas completas.
- Salida como mapa de probabilidades o máscara binaria según umbral configurable (definido en `tm_meta.json`).
- Integración directa con pipelines de limpieza: el resultado alimenta modelos de inpainting como LaMa.
- Dos formatos de despliegue: TorchScript con preprocesado integrado (fácil de usar) y safetensors para carga con `segmentation-models-pytorch`.

## Casos de uso

- Limpieza automática de cómics para traducción: el modelo genera la máscara de texto que permite a un modelo de inpainting (p. ej. LaMa) eliminar el texto original y dejar la viñeta lista para insertar la traducción.
- Preprocesado en pipelines de localización de texto: se usa como etapa intermedia entre el detector de regiones de texto y el módulo de inpainting en el proyecto comic-localizer.
- Segmentación de texto en manga japonés con escritura vertical: el modelo maneja tanto orientación horizontal como vertical, cubriendo un caso habitual en manga.
- Extracción de texto para OCR o reconocimiento: la máscara generada puede servir para aislar los píxeles de texto y mejorar la precisión de un OCR posterior.
- Generación de datasets de entrenamiento para otros modelos: las máscaras producidas pueden usarse como anotaciones automáticas para entrenar detectores de texto o segmentadores más generales.
- Automatización de flujos de edición de cómics en masa: al ser un modelo ligero (14M parámetros), puede procesar grandes volúmenes de páginas en lote sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. La model card reporta métricas de validación sobre conjuntos sintéticos y reales:

| Metrica | Valor |
|---|---|
| IoU | 0,918 |
| Precision | 0,956 |
| Recall | 0,959 |

Estos valores corresponden a la validación del modelo sobre datos no vistos durante el entrenamiento.

## Requisitos de hardware

- Al ser un modelo de solo 14,3 millones de parámetros, es extremadamente ligero. La inferencia puede ejecutarse en CPU sin problemas, con latencias del orden de decenas de milisegundos por imagen (dependiendo del tamaño de entrada y del hardware).
- En GPU, cualquier tarjeta con al menos 1-2 GB de VRAM es suficiente (incluso GPUs integradas). Una RTX 3060 o superior procesará cientos de imágenes por segundo.
- El tamaño de entrada `S` (definido en `tm_meta.json`) afecta directamente al consumo de memoria; valores típicos de 256 o 512 píxeles son manejables en cualquier hardware moderno.
- Opciones de despliegue: se puede usar directamente con TorchScript (`model.pt`) o mediante `segmentation-models-pytorch` con los pesos safetensors. También puede exportarse a ONNX para inferencia con TensorRT u otros runtimes.
- No requiere bibliotecas especiales más allá de PyTorch y torchvision, lo que facilita su integración en entornos de producción.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (segmentación de texto en cómics con esas características). Existen segmentadores genéricos de texto en escenas (como los basados en DBNet o PAN), pero no están especializados en el dominio cómic/manga ni en la generación de máscaras para inpainting. Por tanto, no se puede ofrecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para recortes de regiones de texto (crops) y no para páginas completas; aplicarlo directamente a una página entera puede degradar el rendimiento.
- La validación se realizó sobre datos sintéticos y reales, pero el rendimiento en dominios muy distintos (por ejemplo, cómics occidentales con estilos de letra muy ornamentados) puede ser inferior.
- No se especifica el backbone ni la arquitectura exacta, lo que limita la reproducibilidad y el ajuste fino.
- Aunque la licencia MIT permite uso comercial sin restricciones, el modelo se distribuye sin garantías; el autor no se hace responsable de resultados en producción.
- No hay información sobre sesgos específicos, pero al entrenarse con una gran proporción de glifos aleatorios, es posible que caracteres poco comunes tengan una representación suficiente; sin embargo, no se ha evaluado la robustez frente a fuentes tipográficas muy estilizadas o degradadas.
- El modelo no realiza detección de texto; depende de un detector previo que le proporcione los recortes adecuados.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TareHimself/comic-text-mask)
- [Repositorio comic-localizer](https://github.com/TareHimself/comic-localizer)
- [Repositorio de entrenamiento del modelo](https://github.com/TareHimself/comic-localizer-text-masking)
- [Perfil del autor en GitHub](https://github.com/TareHimself)
- [Perfil del autor en Hugging Face](https://huggingface.co/TareHimself)
