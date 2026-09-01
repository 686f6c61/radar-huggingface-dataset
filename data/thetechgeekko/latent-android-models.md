# thetechgeekko/latent-android-models

## Resumen

Este repositorio aloja artefactos de modelo generados específicamente para la aplicación de cámara LATENT en Android. El autor, thetechgeekko, publica una conversión del modelo Depth Anything 3 Small a formato LiteRT (TFLite) con precisión FP32 y una resolución fija de entrada de 672×896 píxeles (proporción 3:4). El objetivo es integrar estimación de profundidad monocular en dispositivos móviles mediante el runtime LiteRT de Google, manteniendo la trazabilidad completa del proceso de conversión.

El modelo base es `depth-anything/DA3-SMALL`, desarrollado por ByteDance Seed, y se distribuye bajo licencia Apache-2.0. La conversión conserva `align_corners=true` y el embedding posicional de la cabeza, pero sustituye la construcción posicional por un horneado constante separable en x/y, verificado exactamente. El artefacto resultante tiene un tamaño de 105.877.404 bytes (~101 MB) y está pensado para ejecutarse en CPU LiteRT, aunque su promoción a producción está bloqueada hasta superar las puertas de calidad, memoria, latencia y térmicas.

La relevancia de este modelo radica en que ofrece un pipeline reproducible y auditado para llevar un modelo de profundidad de última generación a Android, con un formato optimizado para el ecosistema LiteRT. No incluye los LUTs de película de LATENT ni los binarios de contexto QNN de Qualcomm, por lo que se centra exclusivamente en el componente de inferencia de profundidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Depth Anything 3 Small (transformer de visión, detalles no especificados) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | FP32 (única precisión publicada) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (LiteRT) |

## Arquitectura y entrenamiento

El artefacto es una conversión del modelo Depth Anything 3 Small, originalmente entrenado por ByteDance Seed para estimación de profundidad monocular. La arquitectura subyacente corresponde a un transformer de visión, aunque no se proporcionan detalles específicos sobre el número de capas, dimensiones o mecanismos de atención en la información disponible. La conversión a LiteRT se realizó con una entrada fija de forma `[1, 3, 896, 672]` en NCHW y salida `[1, 1, 896, 672]`, manteniendo `align_corners=true` y el embedding posicional de la cabeza. Se reemplazó la construcción posicional por un horneado constante separable en x/y, verificado exactamente, lo que reduce la complejidad en tiempo de ejecución.

No se dispone de información sobre el proceso de entrenamiento original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El repositorio incluye scripts de reproducción y validación en `provenance/`, pero no se detallan los datos de entrenamiento.

## Capacidades

- Estimación de profundidad monocular: genera un mapa de profundidad denso a partir de una única imagen RGB.
- Entrada de imagen fija con proporción 3:4 (672×896 píxeles), optimizada para cámaras de Android.
- Salida de profundidad con la misma resolución espacial que la entrada.
- Compatible con el runtime LiteRT (TFLite) en CPU, con posibilidad de aceleración NPU en el futuro.
- Conversión reproducible y auditada mediante hashes SHA-256 y scripts de reproducción.
- No incluye capacidades de texto, código, visión multimodal ni tool calling; es un modelo puramente de visión.

## Casos de uso

- Fotografía computacional en apps de cámara: el mapa de profundidad permite aplicar efectos de desenfoque de fondo (bokeh) en tiempo real, mejorando la separación entre sujeto y fondo.
- Realidad aumentada: la profundidad estimada facilita la oclusión correcta de objetos virtuales sobre el entorno físico, mejorando la inmersión en aplicaciones de AR.
- Medición de distancias: a partir de la profundidad, se pueden estimar distancias aproximadas a objetos en la escena, útil para herramientas de medición en interiores.
- Navegación asistida para personas con discapacidad visual: el mapa de profundidad puede alimentar sistemas de alerta de obstáculos en tiempo real.
- Filtros y efectos creativos: apps de edición de fotos pueden usar la profundidad para aplicar ajustes selectivos (nitidez, color) basados en la distancia.
- Automatización de tareas de visión en Android: integración en pipelines de procesamiento de imágenes para segmentación de primer plano o seguimiento de objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como precisión de profundidad, latencia o throughput. El estado de promoción a producción está bloqueado pendiente de evaluaciones de NPU, calidad, memoria, latencia y térmicas, lo que indica que aún no se han validado formalmente estos aspectos.

## Requisitos de hardware

- Dispositivo Android con soporte para LiteRT (TFLite) y CPU compatible con operaciones FP32.
- El artefacto pesa aproximadamente 101 MB, por lo que requiere al menos esa cantidad de memoria disponible para cargar el modelo.
- La entrada fija de 672×896 píxeles implica un consumo de memoria de aproximadamente 2,4 MB para la entrada y 2,4 MB para la salida en FP32 (1×3×896×672×4 bytes y 1×1×896×672×4 bytes respectivamente).
- Se espera que la inferencia en CPU sea viable, pero la latencia no está documentada. La promoción a producción está condicionada a superar las puertas de rendimiento, lo que sugiere que la NPU podría ser necesaria para uso en tiempo real.
- Opciones de despliegue: el formato TFLite es compatible con LiteRT, que se integra en Android mediante el runtime de Google AI Edge. No se mencionan otros runtimes como vLLM u Ollama, ya que no son aplicables a modelos de visión en este contexto.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este artefacto. Como referencia, se puede comparar con el modelo base original `depth-anything/DA3-SMALL` en su formato PyTorch, que tiene una arquitectura similar pero no está optimizado para Android. También existen otros modelos de estimación de profundidad como MiDaS o Depth Anything V2, pero no se proporcionan métricas de rendimiento en la información disponible. La comparativa se limita a aspectos cualitativos:

| Modelo | Formato | Resolución de entrada | Licencia | Optimización para Android |
|---|---|---|---|---|
| LATENT DA3 Small (este) | TFLite FP32 | 672×896 fija | Apache-2.0 | Sí, con LiteRT |
| Depth Anything 3 Small (original) | PyTorch | Variable | Apache-2.0 | No, requiere conversión |
| MiDaS (variantes) | ONNX/PyTorch | Variable | MIT | Parcial, requiere conversión manual |

## Limitaciones y advertencias

- El artefacto no está listo para producción: la model card indica que la promoción a producción está bloqueada pendiente de superar las puertas de NPU, calidad, memoria, latencia y térmicas.
- No debe describirse como FP16: la conversión es estrictamente FP32, y cualquier afirmación contraria sería incorrecta.
- El repositorio no incluye los LUTs de película de LATENT ni los binarios de contexto QNN de Qualcomm, por lo que el modelo solo cubre la parte de estimación de profundidad.
- La entrada es fija (672×896), lo que limita su uso a imágenes con esa proporción; cualquier otra resolución requeriría redimensionamiento previo.
- No se proporcionan datos sobre sesgos o alucinaciones, pero al ser un modelo de visión, los riesgos principales son errores en la estimación de profundidad en condiciones de iluminación adversas o superficies reflectantes.
- La licencia Apache-2.0 permite uso comercial, pero la model card advierte que no es una afirmación de calidad de producción ni una opinión legal.
- La trazabilidad se basa en hashes y scripts de reproducción, pero no se garantiza la reproducibilidad exacta en todos los entornos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thetechgeekko/latent-android-models
- Modelo base: https://huggingface.co/depth-anything/DA3-SMALL (referencia)
- Fuente original: https://github.com/ByteDance-Seed/depth-anything-3 (referencia)
- Convertidor comunitario: https://huggingface.co/litert-community/Depth-Anything-3-Small (referencia)
- Blog de Android Developers sobre IA en dispositivos: https://android-developers.googleblog.com/2024/10/bring-your-ai-model-to-android-devices.html
- Documentación de AI en Android: https://developer.android.com/ai
