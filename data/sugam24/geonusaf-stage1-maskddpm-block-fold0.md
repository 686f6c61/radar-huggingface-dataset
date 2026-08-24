# sugam24/geonusaf-stage1-maskddpm-block-fold0

## Resumen

GeoNUSAF Stage 1 es un modelo de difusión incondicional que genera máscaras de uso del suelo del Valle de Katmandú. Desarrollado por sugam24 como parte del sistema GeoNUSAF, genera layouts de distribución de clases como máscaras de un solo canal, entrenado exclusivamente con las tiles de entrenamiento del fold 0. La arquitectura es un UNet2DModel de la librería diffusers con 74,1 millones de parámetros, entrenado con DDPM (T=1000, schedule beta lineal, predicción de epsilon) y muestreado con DDIM en 50 pasos con eta 0.0.

El modelo se entrena a resolución 128x128 y exporta máscaras de 512x512 mediante interpolación INTER_NEAREST. La codificación de etiquetas es binaria en 3 canales con 7 códigos (SatSynth), y la salida es un mapa de un solo canal con valores 0-5 y 255 para ignorar, pensado como entrada para la etapa 2 del pipeline.

Su relevancia radica en la generación de datos sintéticos de uso del suelo sin etiquetado manual, lo que puede reducir costes en proyectos de teledetección. Sin embargo, las métricas publicadas muestran limitaciones significativas en la conectividad de clases delgadas como carreteras y ríos, lo que condiciona su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet2DModel (diffusers) |
| Parámetros totales | 74,1 millones |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | diffusers (probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo usa una arquitectura UNet2DModel de diffusers con 74,1 millones de parámetros. El entrenamiento se realizó con el algoritmo DDPM (Denoising Diffusion Probabilistic Models) con T=1000 pasos, schedule beta lineal y predicción de epsilon. El muestreo se ejecuta con DDIM en 50 pasos con eta=0.0, lo que permite una generación determinista. Se entrenó durante 457 épocas con semilla 42, usando las tiles de entrenamiento del fold 0 (partición por bloques). La resolución de entrenamiento es 128x128, aunque las máscaras exportadas se escalan a 512x512 con interpolación INTER_NEAREST para preservar los códigos discretos de las clases. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación incondicional de máscaras de uso del suelo de 512x512 píxeles.
- Produce 6 clases semánticas (valores 0-5) más 255 para ignorar, en un único canal.
- Codificación de etiquetas binaria en 3 canales con 7 códigos (SatSynth).
- Muestreo determinista con DDIM (eta=0.0) para reproducibilidad.
- Diseñado como entrada directa para la etapa 2 del pipeline GeoNUSAF.

## Casos de uso

- Aumentación de datos para segmentación semántica: las máscaras sintéticas pueden combinarse con imágenes reales para entrenar modelos de segmentación de uso del suelo sin etiquetado manual adicional, especialmente útil en regiones con datos escasos.
- Simulación de escenarios urbanos: permite generar layouts de distribución de clases para explorar configuraciones alternativas de expansión urbana en el Valle de Katmandú.
- Planificación territorial: los layouts generados sirven como entrada para herramientas de planificación, evaluando el impacto de distintas configuraciones de uso del suelo.
- Generación de datos de entrenamiento para modelos de teledetección: las máscaras sintéticas pueden alimentar clasificadores de escenas o detectores de cambios, especialmente en entornos de entrenamiento con datos limitados.
- Evaluación de conectividad de infraestructura: aunque las métricas muestran limitaciones, el modelo permite estudiar la fragmentación de redes de carreteras y ríos en escenarios generados, comparándola con la real.
- Análisis de políticas de zonificación: los layouts generados pueden compararse con distribuciones reales para evaluar el impacto de políticas de uso del suelo en la distribución de clases.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| KL(real\|\|gen) | 0,22083 |
| Tasa de códigos ilegales | 0,01339 |
| Conectividad de carreteras (frag gen / frag real) | 59,27 (FAIL) |
| Conectividad de ríos (frag gen / frag real) | 32,13 (FAIL) |

Las métricas de conectividad muestran que el modelo genera carreteras y ríos con una fragmentación entre 32 y 59 veces mayor que la real, lo que indica que estas clases delgadas no se generan de forma correcta. No se han publicado benchmarks comparativos con otros modelos de generación en la información disponible.

## Requisitos de hardware

- El modelo tiene 74,1 millones de parámetros, lo que en FP32 equivale a unos 300 MB de memoria; en FP16, unos 150 MB.
- La inferencia es viable en cualquier GPU con al menos 1-2 GB de VRAM, incluyendo GPUs de consumo como la RTX 3060 o superiores.
- El repositorio de HuggingFace ocupa 35,3 GB, lo que sugiere que incluye múltiples checkpoints u otros artefactos además del modelo principal.
- Se puede desplegar con la librería diffusers de HuggingFace, aunque el pipeline exacto no está especificado en la información disponible.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de modelos de generación de máscaras de uso del suelo directamente comparables en la información disponible. En el ecosistema GeoNUSAF se encuentran los siguientes modelos relacionados, aunque son de segmentación y no de generación:

| Modelo | Tipo | Parámetros | Uso |
|---|---|---|---|
| geonusaf-unet-r50-block-fold0 | U-Net (ResNet-50) | no disponible | Segmentación semántica |
| geonusaf-tcsegformer-block-fold1 | TC-SegFormer | no disponible | Segmentación semántica |

Estos modelos son consumidores potenciales de las máscaras generadas por Stage 1, pero no son comparables en términos de tarea.

## Limitaciones y advertencias

- La conectividad de clases delgadas (carreteras, ríos) es deficiente: la fragmentación generada es entre
