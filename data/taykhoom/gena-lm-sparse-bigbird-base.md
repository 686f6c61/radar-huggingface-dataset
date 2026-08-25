# Taykhoom/GENA-LM-sparse-bigbird-base

## Resumen

GENA-LM-sparse-bigbird-base es un port minimalista del modelo original `AIRI-Institute/gena-lm-bigbird-base-sparse`, desarrollado por Taykhoom para permitir la inferencia del modelo sin depender de DeepSpeed ni kernels Triton propietarios. Se trata de un modelo de lenguaje enmascarado (MLM) basado en la arquitectura BigBird con atención block-sparse, diseñado para modelar secuencias largas de ADN humano de hasta 4096 tokens BPE (aproximadamente 36 864 nucleótidos). El modelo fue preentrenado sobre el ensamblaje del genoma humano T2T con un objetivo de enmascaramiento del 15% de tokens, siguiendo las metodologías propuestas en el artículo de BigBird.

La relevancia de este port radica en que reproduce las ecuaciones matemáticas de la atención block-sparse en PyTorch puro, sin necesidad de kernels específicos de DeepSpeed, lo que facilita la integración en entornos modernos y la ejecución en GPUs como Hopper (sm90) donde el kernel original no puede ejecutarse. Con 110 millones de parámetros y una ventana de contexto de 4096 tokens, el modelo es adecuado para tareas de representación de secuencias genómicas completas y análisis de elementos funcionales del genoma humano. La licencia MIT permite su uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pre-LayerNorm BERT con atención BigBird block-sparse (sin capa LayerNorm final) |
| Parámetros totales | 110.847.680 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens BPE (~36.864 nucleótidos) |
| Tipos de cuantización | no disponible (pesos en fp16/fp32 según configuración) |
| Idiomas soportados | No aplicable (modelo entrenado en secuencias de ADN humano) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT de pre-LayerNorm con atención block-sparse de BigBird. La configuración de atención incluye bloques de tamaño 64, con 2 bloques globales, 3 bloques de ventana deslizante y 3 bloques aleatorios por cabeza de atención. El embedding tiene 768 dimensiones, con 12 capas y 12 cabezas de atención, y la capa FFN oculta 3072 unidades con activación GELU. El positional encoding es rotativo (rotary_dim=32, base=10000). El vocabulario consta de 32.000 tokens BPE entrenados sobre ADN, incluyendo tokens especiales como `[CLS]`, `[SEP]`, `[PAD]`, `[UNK]` y `[MASK]`.

El entrenamiento se realizó con el objetivo de masked language modeling (MLM) con un porcentaje de enmascaramiento del 15 %, sobre el ensamblaje del genoma humano T2T. Se ejecutaron 810.000 iteraciones con un batch size de 256. El port de Taykhoom consume directamente los checkpoints del modelo original y evalúa las ecuaciones matemáticas de la atención block-sparse en el dtype de activación solicitado por el modelo, lo que mejora la estabilidad numérica frente al kernel original que forzaba fp16. Para secuencias cortas (<= 256 tokens / 4 bloques), la atención es completamente densa, por lo que el modelo se comporta como un BERT estándar.

## Capacidades

- Generación de embeddings de secuencias de ADN: el modelo produce representaciones contextuales de tokens a partir de secuencias de entrada, incluyendo el embedding del token `[CLS]`.
- Modelado de lenguaje enmascarado: puede predecir tokens enmascarados en secuencias de ADN, útil para tareas de imputación o análisis de variantes.
- Manejo de secuencias largas: gracias a la atención block-sparse, puede procesar secuencias de hasta 4096 tokens BPE sin degradación por memoria cuadrática.
- Inferencia en PyTorch puro: no requiere DeepSpeed ni kernels Triton específicos, lo que facilita su despliegue en entornos modernos.
- Compatibilidad con SDPA: se puede usar la implementación de atención escalada dot-product attention (SDPA) de PyTorch 2.0+ para acelerar la atención block-sparse.
- No es un modelo generativo: no genera secuencias de ADN de forma autorregresiva; su función principal es la representación y el análisis de secuencias.

## Casos de uso

- Análisis de variantes genéticas: el modelo puede usarse para representar secuencias de ADN que contienen variantes y comparar los embeddings para evaluar efectos funcionales potenciales.
- Clasificación de elementos regulatorios: se puede fine-tunear el modelo para clasificar regiones genómicas como promotores, enhancers o silenciadores, aprovechando la ventana de contexto para incluir flanqueos largos.
- Imputación de datos genómicos: el MLM permite rellenar valores desconocidos en secuencias de ADN, útil en pipelines de preprocesamiento de datos.
- Fine-tuning para tareas de genómica funcional: el modelo puede adaptarse con capas de clasificación para predecir splicing, expresión génica o metilación.
- Análisis de genomas completos: con 4096 tokens de contexto, se pueden procesar regiones genómicas completas, como genes o elementos reguladores largos, en una sola pasada.
- Estudio de la organización del genoma: los embeddings de secuencias pueden usarse para clustering y comparación de regiones genómicas, ayudando en la anotación funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 110M de parámetros, el modelo ocupa aproximadamente 220 MB en fp16 y 440 MB en fp32. Las activaciones para secuencias de 4096 tokens son moderadas gracias a la atención block-sparse, por lo que cabría en GPUs con al menos 2 GB de VRAM para la mayoría de los casos.
- GPU recomendadas: cualquier GPU con soporte para PyTorch 2.7 y CUDA 12.9, incluyendo RTX 20xx en adelante, A100, H100, etc. No requiere GPU específica de alta gama.
- Compatibilidad con consumer GPU: sí, es compatible con GPUs de gama media como RTX 3060 o RTX 4070.
- Opciones de despliegue: se puede ejecutar con HuggingFace Transformers, con `attn_implementation="sdpa"` para aceleración, o en frameworks como vLLM si se adapta. No se recomienda usar `flash_attention_2` porque no soporta el patrón de atención block-sparse específico.
- Latencia y throughput: no se han publicado datos específicos. La latencia dependerá del hardware y de la longitud de las secuencias; para secuencias cortas la atención es densa y para largas se aprovecha el block-sparse.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| GENA-LM-bert-base | 110M | 512 tokens | BERT denso | MIT |
| GENA-LM-t2t-bigbird-base | 110M | 4096 tokens | BigBird block-sparse | MIT |
| GENA-LM-t2t-sparse-bigbird-base | 110M | 4096 tokens | BigBird block-sparse | MIT |
| **GENA-LM-sparse-bigbird-base (este modelo)** | 110M | 4096 tokens | BigBird block-sparse | MIT |

La diferencia principal con el resto de la colección es que este port no requiere DeepSpeed y es matemáticamente equivalente al modelo original, pero con una implementación portable. En comparación con otros modelos de ADN como Nucleotide o DNABERT, este modelo destaca por su ventana de contexto mucho más larga (4096 tokens) y su licencia permisiva, aunque no se dispone de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce representaciones y predicciones de tokens enmascarados, no puede generar secuencias nuevas de ADN de forma autorregresiva.
- No se han publicado resultados de benchmarks: no hay métricas objetivas sobre su rendimiento en tareas de biología genómica en la información disponible.
- Dependencia de `trust_remote_code`: el modelo requiere código personalizado para cargarse, lo que puede plantear riesgos de seguridad si no se audita el código.
- No soporta `flash_attention_2`: el uso de esta implementación genera un error explícito, por lo que no se puede aprovechar en entornos que solo soporten Flash Attention.
- La atención block-sparse se evalúa en PyTorch puro, lo que puede ser más lento que los kernels optimizados originales en ciertos hardware, aunque garantiza portabilidad.
- El modelo está entrenado únicamente en ADN humano (T2T), por lo que su aplicación a otras especies puede requerir fine-tuning adicional.
- Para secuencias cortas (<= 256 tokens), la atención se vuelve densa, lo que aumenta la complejidad computacional en esos casos.

## Enlaces

- [HuggingFace: Taykhoom/GENA-LM-sparse-bigbird-base](https://huggingface.co/Taykhoom/GENA-LM-sparse-bigbird-base)
- [HuggingFace: AIRI-Institute/gena-lm-bigbird-base-sparse (modelo original)](https://huggingface.co/AIRI-Institute/gena-lm-bigbird-base-sparse)
- [GitHub: AIRI-Institute/GENA_LM](https://github.com/AIRI-Institute/GENA_LM)
- [Colección GENA-LM de Taykhoom](https://huggingface.co/collections/Taykhoom/gena-lm-6a8cec0862e11d4f81d059ab)
