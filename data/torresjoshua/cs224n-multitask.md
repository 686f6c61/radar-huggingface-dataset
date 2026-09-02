# torresjoshua/cs224n-multitask

## Resumen

Este repositorio contiene una implementación de **Poolformer** en configuración *tiny* orientada a tareas multitarea, desarrollada como parte del curso CS224N de Stanford (Natural Language Processing with Deep Learning). El autor, torresjoshua, publica un checkpoint de inicialización válido para pruebas de humo, no un modelo entrenado con resultados de rendimiento. El proyecto prioriza la transparencia del código y la reproducibilidad de experimentos, omitiendo deliberadamente cualquier afirmación sobre benchmarks.

El modelo emplea atención *flash*, fusión de bajo rango, activación *mish* y normalización *scalenorm*. Con solo 16.576 parámetros, se trata de una implementación mínima pensada como punto de partida experimental, no como un modelo listo para producción. La licencia Apache 2.0 permite su uso y modificación, pero el propio autor advierte que el checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Poolformer (configuracion tiny) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Poolformer en escala *tiny*, una variante de red neuronal que combina operaciones de pooling con atención. Según la configuración incluida, utiliza atención *flash*, fusión de bajo rango para combinar tareas, activación *mish* y normalización *scalenorm*. No se especifica el número de capas, dimensiones ocultas ni el tamaño del vocabulario.

El repositorio incluye un `config.json` con los ajustes de arquitectura generados y un `training_args.json` con la receta experimental por defecto, que usa el optimizador *lion* con un programador de tasa de aprendizaje *step*. El autor indica explícitamente que estos valores son puntos de partida en el script, no evidencia de una ejecución completada. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado. No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens ni técnicas como RLHF o DPO.

## Capacidades

- **Implementacion de referencia**: sirve como ejemplo funcional de Poolformer para tareas multitarea, con código transparente y reproducible.
- **Pruebas de humo**: el checkpoint de inicialización permite verificar que el pipeline de entrenamiento e inferencia funciona correctamente.
- **Multitarea**: la arquitectura incorpora un mecanismo de fusión de bajo rango para combinar señales de distintas tareas, aunque no se especifican cuáles.
- **Personalizacion**: al ser código fuente abierto, permite modificar la arquitectura, el optimizador y la receta de entrenamiento.
- **Sin capacidades demostradas**: no hay evidencia de generación de texto, razonamiento, código, tool calling ni capacidades multilingües, ya que el modelo no está entrenado.

## Casos de uso

- **Proyecto academico de NLP**: estudiantes o investigadores pueden usar este repositorio como base para un proyecto de fin de curso, replicando el experimento y comparando con arquitecturas alternativas.
- **Estudio de arquitecturas ligeras**: con solo 16.576 parámetros, es útil para analizar el comportamiento de Poolformer en entornos con recursos muy limitados.
- **Prueba de integracion de pipelines**: el checkpoint de inicialización permite validar que un pipeline de entrenamiento (carga de datos, forward pass, backward pass) funciona antes de lanzar un entrenamiento completo.
- **Investigacion sobre fusion multitarea**: el mecanismo de fusión de bajo rango puede estudiarse en aislamiento para entender cómo combina representaciones de distintas tareas.
- **Benchmark de eficiencia**: al ser extremadamente pequeño, puede usarse para medir overhead de frameworks de inferencia o entrenamiento sin necesidad de modelos grandes.
- **Material docente**: el código puede servir como ejemplo didáctico de implementación de una arquitectura moderna con atención flash y normalización scalenorm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark en este repositorio y que el checkpoint no está entrenado.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB, dado el tamaño de 16.576 parámetros. Cualquier GPU moderna, incluso integradas, puede ejecutar el modelo.
- **GPU recomendadas**: no se requiere GPU específica; una CPU convencional es suficiente para inferencia y entrenamiento a esta escala.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU consumer (RTX 3060, RTX 4090, etc.) o incluso sin GPU.
- **Opciones de despliegue**: al ser una implementación personalizada, no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI. Requiere un adaptador explícito para APIs genéricas de carga automática, como indica el autor.
- **Latencia y throughput**: no disponibles, pero se espera que sean despreciables dado el tamaño del modelo.

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría (Poolformer tiny multitarea con 16K parámetros). Las alternativas habituales en el curso CS224N, como BERT-base o GPT-2, tienen varios órdenes de magnitud más de parámetros y están entrenadas, por lo que no son comparables directamente. La comparativa no está disponible.

## Limitaciones y advertencias

- **Checkpoint sin entrenar**: el modelo `model.safetensors` es una inicialización aleatoria, no un modelo entrenado. No debe usarse para ninguna tarea real de NLP.
- **Sin auditoria de robustez**: el autor advierte que el checkpoint no ha sido auditado para robustez, equidad ni transferencia de dominio.
- **Riesgo de alucinacion**: no aplica, ya que el modelo no genera texto de forma significativa sin entrenamiento.
- **Limitaciones de contexto e idioma**: no se especifican; al no estar entrenado, no hay capacidades lingüísticas demostrables.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el autor recomienda revisar los términos de las fuentes de datos externas si se usan con este repositorio.
- **Advertencia para produccion**: no es apto para ningún entorno de producción. Es exclusivamente un punto de partida experimental.
- **Falta de compatibilidad**: la implementación personalizada requiere un adaptador para cargarse con APIs genéricas, lo que limita su uso directo en herramientas estándar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/torresjoshua/cs224n-multitask
- Curso CS224N de Stanford: https://web.stanford.edu/class/cs224n/
- Archivo del curso CS224N (ediciones anteriores): https://web.stanford.edu/class/archive/cs/cs224n/cs224n.1234/
