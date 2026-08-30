# thapargenomics/poolformer-demo

## Resumen

Poolformer-demo es una implementación compacta en PyTorch del modelo Poolformer orientada a tareas de retrieval (recuperación de información). El repositorio, publicado por el usuario thapargenomics en HuggingFace, incluye un checkpoint de inicialización de 16.576 parámetros en formato safetensors, un archivo de configuración, argumentos de entrenamiento por defecto y un script principal ejecutable. El autor lo presenta como un punto de partida experimental para revisiones de código y pruebas de humo, no como un modelo preentrenado listo para producción.

La relevancia de esta publicación es principalmente metodológica y didáctica: demuestra cómo empaquetar una arquitectura personalizada con su configuración, receta de entrenamiento y checkpoint de inicialización siguiendo las convenciones de HuggingFace. El propio autor advierte que el checkpoint no ha sido entrenado ni auditado, y que cualquier resultado de un futuro entrenamiento debe documentarse por separado.

Conviene señalar que existen al menos dos arquitecturas con el nombre "Poolformer": la original de sail-sg (MetaFormer, orientada a visión) y una variante recurrente con pooling para modelado de secuencias largas (arXiv 2510.02206). Esta implementación demo no especifica claramente cuál de las dos sigue, aunque la mención a Flickr30k en la guía de evaluación sugiere orientación a retrieval multimodal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Poolformer (escala tiny) |
| Parámetros totales | 16.576 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La implementación usa atención estándar, fusión por tensores (tensor fusion), activación mish y normalización por lotes (batchnorm), según la tabla de arquitectura incluida en la model card. La configuración por defecto emplea el optimizador Lion con un programa de tasa de aprendizaje exponencial, aunque el autor aclara que estos son valores iniciales del script y no evidencian un entrenamiento completado.

No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens ni técnicas de alineación como RLHF o DPO. El checkpoint incluido (model.safetensors) es una inicialización válida para pruebas de humo, no un modelo entrenado. El autor recomienda, para una evaluación significativa, entrenar todas las líneas base con la misma exposición a datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- Generación de texto: no aplicable; el checkpoint no está entrenado.
- Razonamiento y matemáticas: no aplicable.
- Generación de código: no aplicable.
- Retrieval: orientación declarada en la model card, pero sin entrenamiento no existe capacidad real de recuperación.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: ninguna; es una implementación experimental para pruebas de humo y revisión de código.

## Casos de uso

- Aprendizaje de arquitecturas de retrieval: el código sirve como ejemplo didáctico de cómo implementar una arquitectura de recuperación con Poolformer, útil para estudiar el patrón de diseño y la estructura de un repositorio HuggingFace.
- Pruebas de humo en pipelines de integración continua: el checkpoint de inicialización permite verificar que la carga del modelo y la ejecución del script funcionan antes de invertir tiempo en entrenar un modelo real.
- Revisión de código y auditoría: al ser una implementación compacta y transparente, facilita la revisión de estilo, la detección de errores y la comparación de enfoques entre implementaciones similares.
- Experimentos controlados a pequeña escala: con solo 16.576 parámetros, se puede entrenar en CPU para validar hipótesis metodológicas antes de escalar a configuraciones mayores.
- Desarrollo de adaptadores personalizados: al no ser cargable con APIs genéricas, los desarrolladores pueden practicar cómo escribir un adaptador explícito para integrarlo con el ecosistema HuggingFace.
- Evaluación metodológica reproducible: siguiendo la guía del autor, se puede usar Flickr30k para comparar esta arquitectura con una línea base de capacidad equivalente, reportando la métrica de la tarea en al menos tres semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente en la model card que no se reivindica ninguna puntuación de benchmark en este repositorio.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el modelo tiene solo 16.576 parámetros y puede ejecutarse holgadamente en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; una CPU moderna es suficiente para pruebas y desarrollo.
- Compatibilidad con GPU de consumo: sí, cualquier GPU consumer, incluidas las integradas, puede ejecutar este modelo.
- Opciones de despliegue: no compatible directamente con vLLM, llama.cpp, Ollama ni TGI por ser una implementación personalizada; requiere un adaptador explícito antes de usar APIs genéricas.
- Latencia y throughput: no disponibles; al ser un checkpoint sin entrenar, medir rendimiento de inferencia carece de sentido práctico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thapargenomics/poolformer-demo | 16.576 | no disponible | No | BSD-3-Clause | HuggingFace |
| aidenlopez/poolformer-demo | no disponible | no disponible | No | no disponible | HuggingFace |
| jaysoncxkt9/poolformer-demo | no disponible | no disponible | No | no disponible | HuggingFace |
| PoolFormer original (sail-sg) | ~22M (variante S12) | imágenes 224x224 | Sí | Apache-2.0 | GitHub |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio, según declara el propio autor.
- No se reivindica ningún resultado de benchmark; cualquier métrica futura debe documentarse por separado de los valores por defecto incluidos.
- Al ser una implementación personalizada, las APIs genéricas de HuggingFace no pueden cargar el modelo sin un adaptador explícito.
- No hay datos sobre sesgos, alucinación o limitaciones de contexto porque el modelo no tiene capacidades funcionales reales.
- La licencia BSD-3-Clause permite uso comercial, pero hay que revisar los términos de las fuentes de datos externas si se usan con conjuntos como Flickr30k.
- Existe ambigüedad sobre qué variante de Poolformer implementa (la de sail-sg o la del arXiv 2510.02206), lo que puede dificultar la reproducción de resultados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thapargenomics/poolformer-demo
- Repositorio similar (aidenlopez): https://huggingface.co/aidenlopez/poolformer-demo
- Repositorio similar (jaysoncxkt9): https://huggingface.co/jaysoncxkt9/poolformer-demo
- GitHub del PoolFormer original (sail-sg): https://github.com/sail-sg/poolformer
- Paper arXiv 2510.02206 (Poolformer recurrente con pooling): https://arxiv.org/pdf/2510.02206
