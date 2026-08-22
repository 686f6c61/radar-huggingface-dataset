# sugam24/geonusaf-unet-r18-block-fold0

## Resumen

El modelo `sugam24/geonusaf-unet-r18-block-fold0` es un checkpoint de segmentación semántica para imágenes de teledetección de alta resolución, centrado en el uso del suelo del valle de Katmandú. Ha sido desarrollado por el usuario `sugam24` y forma parte de un proyecto más amplio denominado GeoNUSAF, que busca clasificar seis clases de cobertura terrestre: residencial, carretera, río, bosque, suelo sin uso y agrícola. El modelo está construido sobre una arquitectura UNet con codificador ResNet18 preentrenado en ImageNet, un decodificador con canales [128, 64, 32, 16, 8] y un total de 12,46 millones de parámetros.

La relevancia de este checkpoint radica en su aplicación práctica en cartografía y planificación territorial, aunque su rendimiento es moderado, con una IoU media de validación de 0,3213. El repositorio contiene únicamente los pesos correspondientes a la partición `fold 0` de una validación cruzada por bloques, con pesos EMA (decay 0,999) en lugar de los pesos finales crudos. No se especifica licencia, pipeline de uso ni idiomas soportados, lo que limita su adopción directa en entornos de producción sin verificación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet (smp.Unet) con codificador ResNet18 (ImageNet) y decodificador de canales [128, 64, 32, 16, 8] |
| Parametros totales | 12,46 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es modelo de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint `best.pt` (contiene `model_state`, `cfg`, `metrics` y `arch_sig`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura UNet clásica con un codificador ResNet18 preentrenado en ImageNet y un decodificador compuesto por bloques convolucionales de canales 128, 64, 32, 16 y 8. La entrada es de 512×512 píxeles con normalización ImageNet y un tamaño de píxel efectivo de 0,586 m/px. El entrenamiento se realizó sobre un dataset de segmentación de uso de suelo del valle de Katmandú con 6 clases (Residential, Road, River, Forest, UnusedLand, Agricultural) y `ignore_index=255` para píxeles no etiquetados.

El proceso de entrenamiento incluye regularización por peso decay de 0,01 (exento para norm y bias), label smoothing de 0,05, dropout de 0,1 y decaimiento exponencial de la media (EMA) con factor 0,999. La mejor época registrada es la 68, y las métricas de validación corresponden a la evaluación sobre el conjunto de validación del fold 0. No se detalla el número de tokens de entrenamiento ni el tamaño del dataset, pero se infiere un entrenamiento supervisado estándar sin técnicas de RLHF o DPO.

## Capacidades

- Segmentación semántica de imágenes de teledetección a nivel de píxel, específicamente para clasificación de cobertura del suelo en entornos urbanos y periurbanos.
- Reconoce 6 clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Entrada de imágenes de 512×512 píxeles con normalización ImageNet y resolución efectiva de 0,586 m/px.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- No tiene capacidades de visión general más allá de la segmentación semántica; no soporta detección de objetos ni clasificación de imágenes.
- Multilingüismo: no aplicable, al ser un modelo de visión por computador.

## Casos de uso

- **Cartografía de uso de suelo urbano**: el modelo puede utilizarse para actualizar mapas de cobertura de suelo en el valle de Katmandú, identificando zonas residenciales, carreteras, bosques y áreas agrícolas a partir de imágenes aéreas o satelitales.
- **Planificación territorial**: las predicciones de segmentación permiten cuantificar la expansión urbana y detectar cambios en el uso del suelo, útil para la elaboración de planes de desarrollo municipal.
- **Monitoreo ambiental**: la clase de bosque y río (aunque con bajo rendimiento) puede ayudar a evaluar la degradación de ecosistemas o la calidad de zonas ribereñas.
- **Gestión de infraestructuras**: la detección de carreteras (IoU 0,16) es limitada, pero puede complementar otros sistemas de extracción de viales en entornos urbanos.
- **Evaluación de riesgos naturales**: la distinción entre suelo sin uso y agrícola puede apoyar estudios de erosión o vulnerabilidad frente a deslizamientos.
- **Investigación académica**: sirve como punto de partida para experimentos de segmentación semántica en teledetección, especialmente en la región del Himalaya, y como comparativa para futuros modelos.

## Benchmarks y rendimiento

Se han reportado métricas de validación para el fold 0 en la model card. No se proporcionan resultados comparativos con otros modelos en la información disponible.

**Métricas globales (validación)**

| Métrica | Valor |
|---|---|
| mIoU | 0,3213 |
| mF1 | 0,4444 |
| Precisión global (OA) | 0,6051 |
| Kappa | 0,4785 |

**Métricas por clase**

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,5658 | 0,7227 |
| Road | 0,1600 | 0,2758 |
| River | 0,0070 | 0,0140 |
| Forest | 0,5939 | 0,7452 |
| UnusedLand | 0,2065 | 0,3423 |
| Agricultural | 0,3948 | 0,5661 |

Estos valores muestran un rendimiento muy desigual: las clases de bosque y residencial son relativamente aceptables, mientras que la clase de río tiene una IoU casi nula, lo que indica una alta dificultad de segmentación para esa categoría.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no se especifica, pero dado que el modelo tiene 12,46 M de parámetros y entrada 512×512, la inferencia en batch 1 puede realizarse en GPUs con menos de 1 GB de VRAM, aunque no hay datos oficiales.
- **GPU recomendadas**: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 2060 o superior) es suficiente. También puede ejecutarse en CPU, aunque con latencia mayor.
- **Compatibilidad con GPUs de consumo**: sí, el modelo cabe en cualquier GPU de consumo actual.
- **Opciones de despliegue**: al estar basado en `segmentation-models-pytorch`, se puede integrar en pipelines de PyTorch. También puede exportarse a ONNX o TensorRT para inferencia más eficiente. No se mencionan herramientas como vLLM, Ollama o llama.cpp porque no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables con el mismo dataset o tarea en la documentación proporcionada. El repositorio de GitHub GeoSeg incluye otros modelos de segmentación remota (UNetFormer, etc.), pero no se han publicado comparaciones numéricas con este checkpoint. Por tanto, no se puede establecer una comparativa rigurosa en este apartado.

## Limitaciones y advertencias

- **Rendimiento muy bajo en ciertas clases**: la clase `River` tiene una IoU de 0,007, lo que indica que el modelo es prácticamente incapaz de segmentar ríos en el conjunto de validación. La clase `Road` también tiene un rendimiento pobre (IoU 0,16). Esto limita su utilidad en aplicaciones donde esas categorías son críticas.
- **Sesgo geográfico**: el modelo se entrena y valida exclusivamente en el valle de Katmandú, por lo que su capacidad de generalización a otras regiones o entornos urbanos es incierta y probablemente baja.
- **Dependencia de la partición**: el checkpoint corresponde al fold 0 de un split por bloques; no es el modelo completo final. Para un uso robusto, se deberían evaluar todos los folds o entrenar un modelo con todos los datos.
- **Licencia no definida**: no se indica licencia, por lo que no se puede garantizar el uso comercial, la redistribución o la modificación legalmente. Se recomienda contactar con el autor para aclarar los términos.
- **Alucinación y errores de segmentación**: como cualquier modelo de segmentación, puede producir falsos positivos o negativos en zonas ambiguas, especialmente en áreas de transición entre clases.
- **Formato de pesos**: solo se proporciona un checkpoint en formato `.pt` (PyTorch), no hay pesos en otros formatos como ONNX o TensorRT, lo que limita la portabilidad.
- **Sin información de entrenamiento**: no se detallan el tamaño del dataset, el número de épocas totales ni el proceso de validación cruzada completo, lo que dificulta la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sugam24/geonusaf-unet-r18-block-fold0)
- [Repositorio GeoSeg (UNetFormer) en GitHub](https://github.com/WangLibo1995/GeoSeg) — referencia de arquitecturas relacionadas para segmentación de imágenes de teledetección.
- No se dispone de otros enlaces (papers, blogs o demos) en la información proporcionada.
