# sugam24/geonusaf-stage1-maskddpm-block-fold1

## Resumen

GeoNUSAF Stage 1 es un modelo de difusión incondicional (unconditional DDPM) desarrollado por sugam24 para generar máscaras de uso de suelo (land-use masks) del Valle de Katmandú. Forma parte de un proyecto más amplio denominado GeoNUSAF, que aborda la generación de datos sintéticos para teledetección y planificación urbana. El modelo produce mapas de una sola canal con 7 códigos de etiqueta (0-5 más 255 para píxeles ignorados), a una resolución de 512x512 píxeles, a partir de un entrenamiento a 128x128.

La arquitectura es un UNet2DModel de la librería diffusers, con 18,5 millones de parámetros. El entrenamiento utiliza DDPM con 1000 pasos de difusión, programación beta lineal y predicción de epsilon. Se emplea muestreo DDIM con 50 pasos y eta 0.0 para la generación. El modelo se entrenó durante 536 épocas sobre los tiles de entrenamiento del fold 0 (bloque fold 1), con semilla 42, y nunca vio los tiles de validación durante el entrenamiento.

La relevancia de este modelo radica en su capacidad para generar diseños de uso de suelo novedosos y coherentes a nivel de píxel, lo que lo convierte en una herramienta útil para aumentar datos de entrenamiento en tareas de segmentación semántica, simulación de escenarios urbanos y como entrada para una segunda etapa (Stage 2) del pipeline GeoNUSAF. Sin embargo, presenta limitaciones importantes en la conectividad de clases finas como carreteras y ríos, como se detalla más adelante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet2DModel (diffusers) |
| Parametros totales | 18,5 M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 17,6 GB, probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura UNet2DModel estándar de la librería diffusers, con 18,5 millones de parámetros. Se trata de un modelo de difusión denoising probabilístico (DDPM) con 1000 pasos de difusión, programación beta lineal y objetivo de predicción de epsilon. El entrenamiento se realizó sobre tiles de entrenamiento del fold 0 (bloque fold 1) del conjunto de datos GeoNUSAF, que utiliza una codificación de etiquetas binaria de 3 canales con 7 códigos (según la convención SatSynth). Se emplearon 536 épocas con semilla 42, y los tiles de validación nunca entraron en el gradiente.

La generación se realiza mediante muestreo DDIM con 50 pasos y eta 0.0, lo que permite una inferencia más rápida que el muestreo DDPM completo. El modelo se entrenó a una resolución de 128x128 píxeles y las salidas se exportan a 512x512 mediante interpolación INTER_NEAREST, preservando los valores discretos de las etiquetas. No se dispone de información sobre el tamaño del dataset de entrenamiento, la composición exacta de los tiles ni el uso de técnicas como RLHF o DPO, que no son aplicables a este tipo de modelo generativo de imágenes.

## Capacidades

- Generación incondicional de máscaras de uso de suelo de una sola canal, con valores discretos en el rango {0..5} y 255 para píxeles de ignorado.
- Producción de diseños novedosos de uso de suelo para el Valle de Katmandú, con una resolución de salida de 512x512 píxeles.
- Tasa de códigos ilegales muy baja (0.00066), lo que indica que el modelo respeta mayoritariamente el vocabulario de etiquetas definido.
- Integración con el ecosistema diffusers, lo que facilita su uso con pipelines estándar de difusión.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües, al ser un modelo puramente generativo de imágenes.
- No dispone de modo de pensamiento (thinking mode) ni capacidades de visión más allá de la generación de máscaras.

## Casos de uso

- Aumento de datos para segmentación semántica: el modelo puede generar miles de máscaras de uso de suelo sintéticas que, combinadas con imágenes satelitales reales, permiten ampliar conjuntos de entrenamiento para modelos de segmentación como UNet o DeepLab, mejorando su generalización en entornos urbanos similares al Valle de Katmandú.
- Simulación de escenarios urbanos: los planificadores urbanos pueden utilizar las máscaras generadas para explorar configuraciones alternativas de uso de suelo (residencial, comercial, verde, etc.) y evaluar su impacto en la movilidad o la densidad sin necesidad de datos reales adicionales.
- Generación de datos para la etapa 2 del pipeline GeoNUSAF: las máscaras de salida (`genmask{i}.png`) están diseñadas específicamente como entrada para la siguiente etapa del proyecto, que probablemente realice tareas de refinamiento o traducción a imágenes satelitales.
- Evaluación de coherencia espacial en modelos generativos: los investigadores pueden analizar las estadísticas de conectividad de clases (como carreteras y ríos) en las máscaras generadas para estudiar las limitaciones de los modelos de difusión en la preservación de estructuras lineales.
- Prototipado rápido de mapas de uso de suelo: dado que el modelo es incondicional y ligero (18,5 M de parámetros), puede ejecutarse en entornos de desarrollo para generar mapas sintéticos de forma rápida, útiles en demostraciones o pruebas de concepto.
- Validación de métricas de calidad en generación de mapas: las salidas del modelo pueden utilizarse para probar métricas como KL(real||gen) o tasas de códigos ilegales, contribuyendo al desarrollo de mejores evaluadores para modelos de difusión en teledetección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque este modelo no es un LLM. La model card proporciona dos métricas de calidad de generación:

| Metrica | Valor |
|---|---|
| KL(real\|\|gen) | 0.79364 |
| Tasa de codigos ilegales | 0.00066 |

Además, se evaluó la conectividad de clases finas comparando las máscaras generadas con las reales:

| Clase | Fragmentacion generada | Fragmentacion real | Ratio | Veredicto |
|---|---|---|---|---|
| Road | 53.323 | 8.061 | 6.62 | FAIL |
| River | 52.582 | 8.665 | 6.07 | FAIL |

Estos resultados indican que el modelo genera máscaras con una fragmentación mucho mayor en carreteras y ríos que los mapas reales, lo que supone una limitación significativa para aplicaciones que requieran redes viales o hidrográficas coherentes.

## Requisitos de hardware

- No se dispone de información específica sobre requisitos de VRAM, GPU recomendadas o latencia en la documentación del modelo.
- Dado el tamaño reducido del modelo (18,5 M de parámetros), la inferencia es ligera en comparación con modelos de difusión de gran escala. Un UNet2DModel de este tamaño puede ejecutarse en GPUs de consumo con 4-6 GB de VRAM, aunque no se han proporcionado cifras exactas.
- El repositorio ocupa 17,6 GB, lo que sugiere que puede incluir múltiples versiones de pesos, checkpoints de entrenamiento o datos adicionales, no solo los pesos finales.
- Para el despliegue, al ser un modelo de diffusers, puede utilizarse con las herramientas estándar de la librería (p.ej., `DiffusionPipeline`), así como con servidores de inferencia compatibles con ONNX o TensorRT si se exportan los pesos, aunque no se ha documentado.
- No se han publicado mediciones de throughput ni latencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría. El autor ha publicado otras variantes del mismo proyecto, como `geonusaf-stage1-maskddpm-block-fold0` (misma arquitectura, distinto fold) y `geonusaf-unet-r18-block-fold1` (un modelo de segmentación UNet-ResNet18), pero no se han proporcionado métricas comparables entre ellos. Tampoco se han encontrado modelos de difusión incondicional para generación de máscaras de uso de suelo con características similares en la información disponible.

## Limitaciones y advertencias

- La conectividad de clases finas es deficiente: las carreteras y ríos generados presentan una fragmentación entre 6 y 7 veces mayor que los mapas reales, lo que invalida el uso del modelo para aplicaciones que requieran redes lineales coherentes.
- No se especifica la licencia del modelo, por lo que su uso comercial o en producción requiere contactar con el autor o verificar los términos de uso.
- No hay información sobre sesgos potenciales en los datos de entrenamiento, aunque al estar limitado al Valle de Katmandú, el modelo no generaliza a otras regiones geográficas.
- El modelo es incondicional, por lo que no acepta prompts ni condiciones de entrada; todas las salidas son variaciones aleatorias de uso de suelo.
- La resolución de entrenamiento (128x128) y la exportación a 512x512 mediante interpolación nearest puede introducir artefactos de bloque en las máscaras generadas.
- No se han documentado requisitos de hardware ni tiempos de inferencia, lo que dificulta la planificación de despliegues en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que el modelo es reciente y no ha sido ampliamente validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugam24/geonusaf-stage1-maskddpm-block-fold1
- Variante fold 0: https://huggingface.co/sugam24/geonusaf-stage1-maskddpm-block-fold0
- Modelo de segmentación UNet-ResNet18 del mismo proyecto: https://huggingface.co/sugam24/geonusaf-unet-r18-block-fold1
- Repositorio GitHub del autor (proyecto relacionado con ControlNet y generación de imágenes satelitales): https://github.com/sugam24/Stable-diffusion-with-control-net
