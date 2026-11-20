# VINAY-UMRETHE/tiny-refusal-classifier

## Resumen

El modelo `tiny-refusal-classifier` es un clasificador de texto de tipo ModernBERT publicado por el usuario VINAY-UMRETHE en Hugging Face. Se trata de una versión reducida y con pesos inicializados aleatoriamente del modelo `VINAY-UMRETHE/Refusal-Classifier`, concebida exclusivamente como artefacto de prueba para integración continua. No ha sido entrenado con ningún conjunto de datos y, por tanto, sus predicciones carecen de valor semántico real.

El modelo resuelve un problema de ingeniería, no de modelado: permitir que los pipelines de CI de proyectos como `p-e-w/heretic` ejecuten pruebas de extremo a extremo sin descargar los checkpoints completos del clasificador de refusal. Comparte arquitectura y configuración con su modelo base (ModernBERT para clasificación de secuencias), pero con una dimensión oculta de 32, una capa intermedia de 128, una única cabeza de atención y dos capas de transformador, lo que da un total de 1.645.925 parámetros.

Su relevancia es acotada: sirve como fixture de test reproducible y como sustituto ligero para depurar código que carga clasificadores BERT genéricos. Cualquier uso en producción orientado a detectar rechazos en respuestas de modelos de lenguaje sería un error de aplicación, tal como advierte explícitamente su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT para clasificación de secuencias (`ModernBertForSequenceClassification`) |
| Parametros totales | 1.645.925 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la configuración del modelo base ModernBERT, no especificada en la información) |
| Tipos de cuantizacion | no disponible (pesos en FP32 según el script de creación) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es ModernBERT adaptada a clasificación de texto, con una configuración drásticamente reducida respecto al modelo base: `hidden_size=32`, `intermediate_size=128`, `num_attention_heads=1`, `num_hidden_layers=2` y `layer_types` truncado a las dos primeras capas. Los pesos se inicializan con una distribución normal de media 0 y desviación típica 0,5 usando la semilla 75, en precisión FP32. El tokenizador se copia directamente del modelo `VINAY-UMRETHE/Refusal-Classifier`.

No ha habido entrenamiento de ningún tipo: ni preentrenamiento, ni fine-tuning, ni RLHF, ni DPO. El modelo no ha visto datos y su cabecera de clasificación produce salidas derivadas únicamente de la inicialización aleatoria. La innovación técnica, si puede llamarse así, es la de proporcionar un fixture determinista (semilla fija) que replica la interfaz y configuración de un clasificador ModernBERT real con un coste de carga mínimo.

## Capacidades

- No dispone de capacidades reales de clasificación: sus logits son aleatorios y no guardan relación con la noción de refusal.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No implementa tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües verificadas (idiomas no disponibles).
- Su única función práctica es servir como sustituto ligero en tests de integración y depuración de código que carga clasificadores ModernBERT.

## Casos de uso

- Pruebas de integración continua: el modelo permite ejecutar la suite de CI de `p-e-w/heretic` (PR #500, plugin genérico de scorer BERT) sin descargar checkpoints de cientos de megabytes, reduciendo el tiempo y el ancho de banda de cada ejecución.
- Depuración de pipelines de carga: desarrolladores que integren `VINAY-UMRETHE/Refusal-Classifier` pueden usar este tiny como sustituto para verificar que el código de `AutoConfig`, `AutoTokenizer` y `ModernBertForSequenceClassification` funciona antes de cargar el modelo real.
- Validación de serialización: al compartir arquitectura y configuración con el modelo base, sirve para comprobar que los flujos de guardado y carga en safetensors y FP32 se comportan correctamente.
- Test de compatibilidad con Text Embeddings Inference: el tag `text-embeddings-inference` y `endpoints_compatible` permiten verificar el despliegue de endpoints de clasificación sin coste de inferencia significativo.
- Reproducibilidad de experimentos: la semilla fija (75) y el script de creación documentado permiten regenerar exactamente el mismo checkpoint para comparar resultados entre entornos.
- Formación y demos: útil en talleres o tutoriales para ilustrar la estructura de un clasificador ModernBERT sin necesidad de infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no ha sido entrenado, por lo que cualquier métrica de clasificación (precisión, recall, F1) sería equivalente a la de un clasificador aleatorio y no resulta informativa.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP32 (1,65 M parámetros × 4 bytes), despreciable en cualquier GPU.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problema y en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) con holgura absoluta.
- Cabe en cualquier GPU consumer y también en entornos sin GPU.
- Opciones de despliegue: transformers (librería nativa), Text Embeddings Inference (por los tags `text-embeddings-inference` y `endpoints_compatible`); no se documenta soporte GGUF ni llama.cpp.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, la latencia sería del orden de microsegundos a milisegundos por lote en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenado | Licencia | Propósito |
|---|---|---|---|---|---|
| VINAY-UMRETHE/tiny-refusal-classifier | 1.645.925 | no disponible | No | Apache 2.0 | Fixture de test |
| VINAY-UMRETHE/Refusal-Classifier | no disponible | no disponible | Sí (fine-tuning) | no disponible | Clasificación de refusal real |
| VINAY-UMRETHE/Refusal-Classifier-V2 | no disponible | no disponible | Sí (fine-tuning) | no disponible | Clasificación de refusal real |
| Modelos de la organización tiny-random | variable (típicamente < 5 M) | no disponible | No | variable | Fixtures de test |

La comparación relevante es con los modelos de la organización `tiny-random`, que cumplen la misma función de fixture. Frente a su modelo base, la diferencia clave es que este tiny no ha sido entrenado y no debe usarse para clasificar refusal.

## Limitaciones y advertencias

- Los pesos son aleatorios: no ha sido entrenado con ningún dato y sus predicciones no tienen significado. No usar para clasificación real de refusal.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos sistemáticos derivados de la inicialización aleatoria.
- Sesgos conocidos: no disponibles; al no entrenarse, no incorpora sesgos de datos, pero tampoco ninguna señal útil.
- Limitaciones de contexto e idioma: no disponibles; la configuración hereda los valores del modelo base, pero no se documentan.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo carece de utilidad productiva; el uso comercial no tiene sentido técnico.
- Caveat importante para producción: la model card advierte explícitamente que no debe usarse para tareas reales de clasificación de refusal. Su único propósito es testing y depuración.
- El modelo se creó en octubre de 2026 y se actualizó en noviembre de 2026; verificar que la versión cargada coincide con la esperada en los tests.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/tiny-refusal-classifier
- Modelo base: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier
- Modelo base V2: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier-V2
- Repositorio heretic: https://github.com/p-e-w/heretic
- PR del plugin de scorer BERT: https://github.com/p-e-w/heretic/pull/500
- Documentación de ModernBERT: https://huggingface.co/docs/transformers/en/model_doc/modernbert
- Organización tiny-random: https://huggingface.co/tiny-random
