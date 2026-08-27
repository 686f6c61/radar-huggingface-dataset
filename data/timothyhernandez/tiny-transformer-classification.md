# TimothyHernandez/tiny-transformer-classification

## Resumen

El modelo `tiny-transformer-classification` es un prototipo de investigación desarrollado por TimothyHernandez, orientado a tareas de clasificación mediante una arquitectura Transformer de tamaño mínimo. Con solo 16.576 parámetros, se presenta como un punto de partida experimental para estudiar el comportamiento de arquitecturas atencionales en entornos con recursos extremadamente limitados, no como un modelo listo para producción.

El repositorio incluye un checkpoint de inicialización (`model.safetensors`) válido únicamente para pruebas de humo, junto con los ficheros de configuración (`config.json`, `training_args.json`) y un script de predicción (`predict.py`). El autor no reclama ningún resultado de benchmark ni rendimiento verificado, y advierte explícitamente de que el checkpoint no ha sido entrenado ni auditado. Su relevancia actual reside en servir como banco de pruebas para metodologías de evaluación rigurosas y para explorar la viabilidad de Transformers en dispositivos de muy baja capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención estándar, fusión de bajo rango, activación GELU tanh, normalización GroupNorm) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Transformer en miniatura con atención estándar (no lineal ni aproximada), fusión de bajo rango para las proyecciones, activación GELU con aproximación tanh y normalización por GroupNorm. El fichero `config.json` documenta estos ajustes generados automáticamente. No se especifica el número de capas, dimensiones ocultas ni cabezas de atención, por lo que estos detalles no están disponibles.

El modelo no ha sido entrenado. El checkpoint incluido es una inicialización aleatoria válida para comprobar que el código ejecuta correctamente. La receta de entrenamiento por defecto usa el optimizador AdamW con un programador de tasa de aprendizaje one-cycle, pero el propio autor indica que son valores de partida y no evidencia de una ejecución completada. No se proporciona información sobre el conjunto de datos, el número de tokens ni técnicas como RLHF o DPO.

## Capacidades

- Clasificación de secuencias: el modelo está diseñado para tareas de clasificación, aunque sin entrenamiento previo no puede realizar ninguna tarea real.
- Ejecución de pruebas de humo: el script `predict.py` incluye un ejemplo generado para verificar que el flujo de inferencia funciona.
- Personalización: al ser una implementación personalizada, requiere un adaptador explícito para cargarse con APIs genéricas de HuggingFace.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües, dado su estado de prototipo sin entrenar.

## Casos de uso

- Investigación académica sobre arquitecturas mínimas: sirve para estudiar el impacto de la atención estándar y la fusión de bajo rango en modelos con menos de 20.000 parámetros, comparando con baselines de capacidad equivalente.
- Validación de pipelines de entrenamiento: permite comprobar que un flujo de entrenamiento (carga de datos, optimización, evaluación) funciona correctamente antes de escalar a modelos mayores.
- Pruebas de integración en entornos de CI/CD: el checkpoint de inicialización puede usarse para verificar que el código de inferencia y los adaptadores personalizados se despliegan sin errores.
- Enseñanza de arquitecturas Transformer: útil en cursos o talleres para ilustrar los componentes básicos de un Transformer (atención, normalización, activación) con un código legible y minimalista.
- Exploración de técnicas de compresión extrema: al ser tan pequeño, permite experimentar con cuantización extrema, poda o destilación sin coste computacional significativo.
- Desarrollo de adaptadores para HuggingFace: la implementación personalizada ofrece un caso práctico para escribir integraciones que permitan cargar modelos no estándar con la API de Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no es un modelo entrenado. Cualquier evaluación futura debe realizarse con un conjunto de datos etiquetado específico, reportando la métrica de la tarea con al menos tres semillas e incluyendo un baseline de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable, dado que el modelo tiene 16.576 parámetros (menos de 0,1 MB en precisión fp32).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una CPU puede ejecutar la inferencia sin problemas.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna (GTX 1060, RTX 3060, etc.) es más que suficiente.
- Opciones de despliegue: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere un adaptador personalizado o ejecutar el script `predict.py` directamente.
- Latencia y throughput: no disponibles, pero se espera que sean del orden de microsegundos por inferencia en hardware moderno.

## Comparativa con modelos similares

No se dispone de modelos comparables de la misma categoría (Transformers de ~16K parámetros para clasificación) en la información proporcionada. Los resultados de búsqueda web mencionan otros proyectos de "tiny transformer" (como el de saeeddhqan en GitHub) y bibliotecas como SimpleTransformers, pero no se han encontrado modelos con especificaciones equivalentes y datos de rendimiento verificables. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: cualquier salida del modelo es aleatoria y no debe interpretarse como una predicción significativa.
- No se ha auditado la robustez, equidad ni la transferencia a otros dominios; el autor lo advierte explícitamente.
- Riesgo de alucinación: no aplica en el sentido clásico, pero el modelo puede producir salidas arbitrarias si se usa sin entrenamiento.
- Limitaciones de contexto e idioma: no se especifican, pero al ser un prototipo sin entrenar, no se garantiza ningún comportamiento lingüístico.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor recomienda revisar los términos de las fuentes de datos externas si se usa con conjuntos de datos propios.
- Para producción: no es adecuado. Es un prototipo de investigación y cualquier resultado derivado debe documentarse por separado de los valores por defecto incluidos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TimothyHernandez/tiny-transformer-classification
- Proyecto relacionado en GitHub (tiny-transformer de saeeddhqan): https://github.com/saeeddhqan/tiny-transformer/blob/main/classifier_model.py
- Biblioteca SimpleTransformers: https://github.com/ThilinaRajapakse/simpletransformers
- Documentación de Transformers de HuggingFace: https://huggingface.co/docs/transformers/index
