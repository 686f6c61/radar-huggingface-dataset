# Tonic/challenge5-acoustic-mobilenet_v2_x0_5-s7

## Resumen

Tonic/challenge5-acoustic-mobilenet_v2_x0_5-s7 es un modelo de clasificación acústica publicado en Hugging Face por el usuario Tonic, orientado a la detección de drones (las etiquetas del repositorio incluyen `acoustic-wake`, `c-uas` —counter-UAS, sistemas anti-dron— y `drone-detection`). El nombre del identificador indica que se trata de una MobileNetV2 con factor de anchura 0,5, adaptada a entrada de audio y exportada a ONNX. No es un modelo de lenguaje: no genera texto ni mantiene conversaciones, sino que emite una clasificación a partir de una señal acústica.

El repositorio está marcado como de acceso restringido (gated), con licencia Apache 2.0, y el tamaño declarado del repo es de 0,0 GB, lo que sugiere que los pesos no están alojados públicamente o que la tarjeta no expone artefactos descargables. No se han publicado resultados de benchmarks, idiomas soportados ni detalles de entrenamiento en la información disponible.

La relevancia de este modelo es acotada y específica: encaja en el nicho de la detección acústica de UAV en entornos de seguridad, donde los modelos ligeros tipo MobileNet permiten inferencia en el borde (edge computing) con presupuestos de cómputo reducidos. Fuera de ese nicho, la información pública es insuficiente para evaluar su calidad o su comportamiento en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 con factor de anchura 0,5 (según el identificador del modelo), adaptada a entrada acústica |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificación, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo acústico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (según las etiquetas del repositorio) |

## Arquitectura y entrenamiento

El identificador `mobilenet_v2_x0_5` apunta a una MobileNetV2 con factor de anchura 0,5, es decir, aproximadamente la mitad de canales por capa respecto a la variante base. MobileNetV2 es una red convolucional con bloques residuales invertidos y convoluciones separables en profundidad, diseñada para inferencia eficiente en dispositivos con recursos limitados. En este caso el modelo se ha adaptado a una tarea de audio (detección acústica de drones), presumiblemente mediante la conversión de la señal a espectrogramas o características similares, aunque la información proporcionada no detalla el preprocesado.

No hay datos publicados sobre el conjunto de entrenamiento: se desconoce el número de horas de audio, la composición del dataset (tipos de dron, condiciones de ruido, distancias), si se aplicaron técnicas de aumento de datos o si el modelo se destila de una red mayor. Tampoco se documenta si se empleó validación cruzada o qué métrica se optimizó. El sufijo `s7` del identificador no se explica en la información disponible.

## Capacidades

- Clasificación acústica binaria o multiclase orientada a la detección de drones (etiquetas `drone-detection`, `c-uas`, `acoustic-wake`).
- Inferencia ligera: la variante x0,5 de MobileNetV2 está pensada para ejecutarse en hardware de baja potencia.
- Exportación a ONNX, lo que facilita su despliegue en runtimes multiplataforma (ONNX Runtime, TensorRT, OpenVINO).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües, de visión ni de audio general (no es un modelo de audio genérico tipo Whisper o AST).

## Casos de uso

- Detección de UAV en perímetros sensibles: el modelo puede integrarse en un nodo de micrófonos y clasificar en tiempo real si la señal captada corresponde a un dron, gracias a su bajo coste computacional derivado de MobileNetV2 x0,5.
- Vigilancia de infraestructuras críticas (aeropuertos, subestaciones, plantas industriales): despliegue en dispositivos empotrados junto a sensores acústicos para alertar de intrusiones aéreas sin depender de enlace a la nube.
- Complemento a sistemas anti-dron (C-UAS): uso como etapa de confirmación acústica que corrobora detecciones de radar o RF, reduciendo falsos positivos.
- Monitorización de ruido en entornos urbanos o naturales: clasificación de eventos acústicos anómalos asociados a sobrevuelos no autorizados.
- Investigación en detección acústica: punto de partida reproducible (licencia Apache 2.0) para comparar arquitecturas ligeras en tareas de audio.
- Prototipado en el borde con ONNX Runtime: validación rápida de pipelines de audio en Raspberry Pi o dispositivos similares antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por la arquitectura (MobileNetV2 x0,5) se espera un consumo de memoria muy bajo, del orden de decenas o pocos cientos de MB, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. Por diseño, el modelo está pensado para CPU y aceleradores de borde más que para GPU de datacenter.
- Cabe en GPU de consumo: probablemente sí, dada la arquitectura ligera, aunque no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime (formato declarado), potencialmente TensorRT u OpenVINO tras conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni métricas que permitan una comparación rigurosa con otras soluciones de detección acústica de drones.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face; no es descargable de forma anónima.
- Ausencia total de documentación técnica: sin tarjeta detallada, sin métricas, sin descripción del dataset ni del preprocesado de audio.
- Riesgo de sobreajuste al dominio de entrenamiento: al desconocerse las condiciones de captura (micrófono, ruido de fondo, distancia), el rendimiento fuera de ese dominio es impredecible.
- Posibles sesgos acústicos: un detector de drones puede confundir otros sonidos (helicópteros, cortacéspedes, motos) si el entrenamiento no cubrió negativos diversos.
- Uso dual: la detección de UAV tiene aplicaciones legítimas de seguridad, pero también implicaciones de vigilancia; conviene evaluar el cumplimiento normativo (RGPD, regulación de drones) antes de desplegarlo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no hay garantías ni soporte del autor.
- Sin evidencia de validación en producción: cero descargas y cero likes en el momento de la consulta; no hay señales de adopción comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Tonic/challenge5-acoustic-mobilenet_v2_x0_5-s7
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a entidades no relacionadas: Tonic App, agua tónica y Tonic water).
