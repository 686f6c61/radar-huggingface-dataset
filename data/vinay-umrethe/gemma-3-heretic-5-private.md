# VINAY-UMRETHE/gemma-3-heretic-5-private

## Resumen

`VINAY-UMRETHE/gemma-3-heretic-5-private` es un modelo de prueba (debug) derivado de `tiny-random/gemma-3`, una versión aleatoriamente inicializada de la arquitectura Gemma 3 con configuraciones reducidas. El autor ha aplicado sobre él la herramienta Heretic v2.2.0.dev0, que realiza una ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 1 y 2 del transformer para eliminar comportamientos de rechazo (refusals) y producir una variante "decensored" o "abliterated".

El modelo tiene 8.600.288 parámetros totales y un tamaño de repositorio de 0,1 GB, lo que lo sitúa en la categoría de modelos diminutos para pruebas de infraestructura y pipelines. No es un modelo utilizable en producción: sus pesos son ruido gaussiano (inicialización normal con desviación 0,5 y semilla 42) sobre una configuración de 2 capas, hidden size 32 y 1 cabeza de atención, adaptada de `google/gemma-3-27b-it`.

Su relevancia es metodológica: documenta de forma reproducible el proceso de ablación con Heretic sobre un modelo multimodal image-text-to-text, incluyendo los parámetros ARA exactos y las métricas de refusals y divergencia KL. Sirve como referencia para quien quiera replicar la técnica sobre modelos Gemma 3 reales de mayor tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer multimodal text+vision), configuracion reducida: 2 capas, hidden size 32, 1 cabeza de atencion, head_dim 32, intermediate size 128, sliding window pattern 2 |
| Parametros totales | 8.600.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config de google/gemma-3-27b-it, no verificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es una instancia de `Gemma3ForConditionalGeneration` con la configuración del modelo de texto y del codificador de visión reducidas drásticamente respecto a `google/gemma-3-27b-it`. La parte de texto usa 2 capas con hidden size 32, 1 cabeza de atención y 1 cabeza KV, con un patrón de sliding window de 2. La parte de visión usa igualmente 2 capas, hidden size 32 y 1 cabeza. Los pesos se inicializan aleatoriamente con `torch.nn.init.normal_(p, 0, 0.5)` bajo semilla 42, por lo que el modelo no ha sido entrenado con datos reales.

Sobre esa base, Heretic v2.2.0.dev0 aplica una ablación de rangos arbitrarios (ARA) entre las capas 1 y 2, con los siguientes hiperparámetros: `preserve_good_behavior_weight` = 0,2143, `steer_bad_behavior_weight` = 0,0004, `overcorrect_relative_weight` = 0,7718 y `neighbor_count` = 5. El dataset de referencia es `VINAY-UMRETHE/Multilingual-Harmless-Harmful`. El proceso es reproducible: el repositorio incluye un directorio `reproduce` con instrucciones y el código de creación del modelo base.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`), heredada de la interfaz Gemma 3.
- Procesamiento multimodal básico: acepta mensajes con `type: image` y `type: text`.
- Conversación multi-turno mediante el formato de mensajes con roles `system` y `user`.
- Capacidad de "decensoring": la ablación ARA reduce los rechazos según la propia model card (0/5 refusals, igual que el original en esta métrica).
- Reproducibilidad del proceso de ablación documentada.
- No dispone de capacidades reales de razonamiento, código o matemáticas: los pesos son aleatorios.
- Soporte de tool calling, agentes y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Pruebas de integración de pipelines `image-text-to-text`: sirve para validar el cableado de `transformers.pipeline` con entrada multimodal sin consumir recursos de GPU significativos, gracias a sus 8,6 M de parámetros.
- Test de compatibilidad con Text Generation Inference (TGI): el tag `text-generation-inference` y `endpoints_compatible` permiten usarlo como smoke test de despliegue en endpoints antes de cargar modelos reales.
- Reproducción de experimentos de ablación: investigadores que quieran validar la metodología Heretic/ARA pueden ejecutar el flujo completo sobre este modelo y comparar la divergencia KL (0,0829) con la de sus propios experimentos.
- Docencia y divulgación: ejemplo mínimo para explicar qué es un modelo "abliterated" y cómo se mide el compromiso entre eliminación de rechazos y degradación (KL divergence) sin necesidad de infraestructura grande.
- Desarrollo de herramientas de evaluación de refusals: permite construir y depurar arneses de evaluación de rechazos sobre un modelo cuyo comportamiento es conocido y reproducible.
- Validación de scripts de conversión y cuantización: al ser un checkpoint safetensors pequeño, sirve para verificar herramientas de conversión a GGUF u otros formatos antes de aplicarlas a modelos de 27B.
- Pruebas de regresión en CI: su tamaño (0,1 GB) permite incluirlo en suites de integración continua que verifiquen que las actualizaciones de transformers no rompen la carga de modelos Gemma 3 multimodales.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas del proceso de ablación, no benchmarks de capacidad:

| Metrica | Este modelo | Modelo original (tiny-random/gemma-3) |
|---|---|---|
| Refusals | 0/5 | 0/5 |
| KL divergence | 0,0829 | 0 (por definición) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Cualquier cifra de capacidad sería engañosa dado que los pesos son aleatorios.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (8,6 M de parámetros), aproximadamente 17 MB en bf16 para los pesos; el overhead lo dominan el procesador y el tokenizer, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (tag presente), potencialmente `llama.cpp`/`Ollama` previa conversión a GGUF (no documentada).
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas con hidden size 32, la latencia estará dominada por el preprocesado de imagen y el overhead del runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `VINAY-UMRETHE/gemma-3-heretic-5-private` | 8,6 M | no disponible | Debug / reproducible de ablación ARA | no disponible | Hugging Face |
| `tiny-random/gemma-3` | no disponible en la informacion | no disponible | Debug de la arquitectura Gemma 3 | no disponible | Hugging Face |
| `google/gemma-3-27b-it` | 27 B (aproximado, segun nombre) | no disponible en la informacion | Modelo multimodal de produccion | Gemma Terms of Use (segun modelo original) | Hugging Face |

La comparación con modelos de producción no es significativa en términos de capacidad: este checkpoint solo comparte arquitectura con Gemma 3, no pesos entrenados.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto coherente ni respuestas útiles. No debe usarse en producción ni en aplicaciones reales.
- La métrica "0/5 refusals" no es interpretable como éxito de decensoring, ya que el modelo original también obtiene 0/5 (no hay comportamiento de rechazo que eliminar en un modelo aleatorio).
- La divergencia KL de 0,0829 mide el cambio introducido por la ablación respecto al original, no calidad.
- Licencia no especificada: no se puede asumir uso comercial permitido. La licencia del modelo base (`tiny-random/gemma-3`) y de `google/gemma-3-27b-it` (Gemma Terms of Use) condiciona cualquier uso derivado.
- Idiomas soportados no documentados; el dataset de referencia es multilingüe pero el modelo no ha sido entrenado con él.
- Riesgo de alucinación: total, al no existir conocimiento aprendido.
- El tag "private" en el nombre y la ausencia de descargas/likes sugieren un repositorio de pruebas personales, no un artefacto mantenido.
- No se ha verificado la longitud de contexto efectiva tras la reducción de configuración; el sliding window pattern 2 con 2 capas hace que el comportamiento de atención a largo plazo sea degenerado.
- El uso de la etiqueta "uncensored/abliterated" no implica que el modelo sea seguro: cualquier despliegue derivado de esta técnica sobre modelos reales requiere evaluación de seguridad propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/gemma-3-heretic-5-private
- Modelo base: https://huggingface.co/tiny-random/gemma-3
- Modelo de referencia de arquitectura: https://huggingface.co/google/gemma-3-27b-it
- Dataset utilizado: https://huggingface.co/datasets/VINAY-UMRETHE/Multilingual-Harmless-Harmful
- Heretic (proyecto): https://heretic-project.org
- Repositorio de reproducción: https://huggingface.co/VINAY-UMRETHE/gemma-3-heretic-5-private/tree/main/reproduce
- Imagen de ejemplo del pipeline: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/p-blog/candy.JPG
