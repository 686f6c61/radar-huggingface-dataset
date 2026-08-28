# Tianwangna/dino-retrieval

## Resumen

Este repositorio aloja un prototipo de investigación denominado "Dino for Retrieval", desarrollado por el usuario Tianwangna. Se trata de una implementación personalizada de una arquitectura tipo Dino orientada a tareas de recuperación de información (retrieval). El autor lo presenta explícitamente como un punto de partida experimental, no como un modelo entrenado y validado. El checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo, pero no se ofrecen resultados de rendimiento ni se reclama ninguna puntuación de benchmark.

La relevancia de este repositorio es limitada en el estado actual: no hay un modelo funcional listo para uso, sino un esqueleto de código y configuración que documenta formatos y recetas de entrenamiento. La arquitectura declarada incluye atención dilatada, fusión por cross-attention, activación GELU tanh y normalización LayerNorm, con una escala denominada "huge". Sin embargo, el número de parámetros totales según el archivo safetensors es de 16.576, una cifra extremadamente baja que sugiere que el checkpoint es meramente simbólico o que la configuración no corresponde a una escala real. No se especifican idiomas, ni contexto, ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dino (prototipo personalizado) |
| Parametros totales | 16.576 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe una arquitectura Dino con atención dilatada, fusión mediante cross-attention, activación GELU tanh y normalización LayerNorm. No se proporcionan detalles sobre el número de capas, dimensiones ocultas, cabezas de atención ni el mecanismo exacto de la atención dilatada. El repositorio incluye un `config.json` que registra la configuración generada, pero su contenido no se ha facilitado en la información disponible.

En cuanto al entrenamiento, no hay datos sobre el conjunto de datos utilizado, el número de tokens procesados ni el proceso de optimización. La configuración por defecto (`training_args.json`) emplea RMSprop con un programa de calentamiento lineal, pero el autor aclara que son valores iniciales del script, no evidencia de una ejecución completada. El checkpoint `model.safetensors` es una inicialización para pruebas de humo, no un modelo entrenado. No se menciona ningún proceso de RLHF, DPO ni ajuste fino supervisado.

## Capacidades

- No se han demostrado capacidades reales: el checkpoint es una inicialización sin entrenamiento.
- El código incluye un ejemplo ejecutable o punto de entrada de entrenamiento (`main.py`).
- La arquitectura está diseñada para tareas de retrieval, pero no hay evidencia de que funcione.
- No se especifica soporte para tool calling, agentes, razonamiento multi-paso, visión, audio ni otras capacidades.
- No se declara ningún idioma soportado.

## Casos de uso

Dado el estado experimental del repositorio, no se recomienda ningún caso de uso en producción. Los únicos escenarios plausibles son:

- Investigación académica: servir como base para estudiar arquitecturas de retrieval con atención dilatada y cross-attention.
- Desarrollo de prototipos: los desarrolladores pueden usar el código como referencia para implementar su propia variante.
- Pruebas de integración: verificar que el pipeline de carga de safetensors y la configuración funcionan en un entorno local.
- Benchmarking metodológico: el autor sugiere evaluar en Flickr30k con al menos tres semillas y una línea base de capacidad equivalente, pero solo tras entrenar el modelo.
- Educación: ilustrar cómo se estructura un proyecto de investigación de modelos de recuperación.
- Experimentación con recetas de entrenamiento: probar RMSprop con warmup lineal en tareas de retrieval.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no está entrenado. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica.

## Requisitos de hardware

- Dado el tamaño de 16.576 parámetros, la inferencia es trivial y cabría en cualquier CPU o GPU, incluso en un microcontrolador.
- No se dispone de estimaciones de VRAM, latencia o throughput porque no hay un modelo entrenado que ejecutar.
- Las opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este prototipo; el código es un script Python personalizado que requiere un adaptador explícito para cargarse con APIs genéricas.
- Para un eventual entrenamiento, se necesitaría una GPU con suficiente memoria según la escala real, pero no se especifica.

## Comparativa con modelos similares

No hay modelos comparables directos porque este es un prototipo no entrenado. Como referencia conceptual, se pueden mencionar los DINO originales de Meta:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| DINO (ViT-S/16) | 22M | Imagen | Self-supervised (ImageNet) | Apache-2.0 |
| DINOv2 | 1.3B (máx.) | Imagen | Self-supervised (LVD-142M) | Apache-2.0 |
| dino-retrieval (este) | 16.576 | no disponible | Sin entrenar | BSD-3-Clause |

La comparación es solo ilustrativa; no hay equivalencia de capacidades ni de propósito.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- No hay garantía de que la arquitectura funcione correctamente para retrieval; es un prototipo experimental.
- El número de parámetros (16.576) es inusualmente bajo para una escala "huge", lo que sugiere que la configuración puede estar incompleta o ser simbólica.
- No se proporcionan datos de entrenamiento, por lo que no se puede evaluar sesgos ni alucinaciones.
- La licencia BSD-3-Clause permite uso comercial, pero el autor advierte que se deben revisar los términos de las fuentes de datos externas si se usan.
- No hay soporte para carga automática con bibliotecas estándar; se requiere un adaptador explícito.
- Cualquier resultado futuro de un checkpoint entrenado debe documentarse por separado de los valores por defecto incluidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tianwangna/dino-retrieval
- DINO original (Meta): https://github.com/facebookresearch/dino
- DINOv3 (Meta): https://github.com/facebookresearch/dinov3
- Página de DINOv3 en Meta AI: https://ai.meta.com/research/dinov3/
- Demo de DINOv2: https://dinov2.metademolab.com/
