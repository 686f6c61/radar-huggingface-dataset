# The-CoLab/llama3-7b-en-ru-v3

## Resumen

El modelo `llama3-7b-en-ru-v3` es un modelo de lenguaje de 6.3 mil millones de parámetros desarrollado por The-CoLab, un laboratorio independiente centrado en transferencia multilingüe. Se trata de un LLaMA-3 7B preentrenado desde cero sobre datos bilingües inglés-ruso, con un tokenizer compartido de 65k entradas diseñado específicamente para ambos idiomas. El entrenamiento se realizó con la infraestructura torchtitan y abarcó 133.600 pasos en su tercera versión (v3), tras una v2 que corrigió un problema de inyección de datos.

El modelo resuelve el problema de la representación multilingüe equilibrada: en lugar de adaptar un modelo monolingüe mediante fine-tuning, se preentrena directamente con datos de ambos idiomas para lograr una distribución de vocabulario y gramática más natural. Es relevante ahora porque demuestra que es viable entrenar modelos de tamaño medio (7B) con recursos limitados para pares de idiomas específicos, algo útil para equipos que necesitan capacidades bilingües sin depender de modelos gigantes. El contexto máximo no está documentado en la información disponible, pero al basarse en la arquitectura LLaMA-3 se espera un contexto de 8.192 tokens, aunque esto no se confirma explícitamente.

La licencia es llama3, lo que permite uso comercial con restricciones (ver sección de limitaciones). El repositorio incluye pesos en formato safetensors (tensor BF16) y archivos de curvas de entrenamiento y resultados de evaluación en formato EEE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LLaMA-3) |
| Parametros totales | 6.291.689.472 (6.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (presumiblemente 8.192 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible (repo incluye BF16) |
| Idiomas soportados | ingles (en), ruso (ru) |
| Licencia | llama3 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer estándar de LLaMA-3, con normalización RMSNorm, atención con RoPE y activación SwiGLU. No se trata de una arquitectura MoE ni híbrida; es un modelo denso de 7B. La innovación principal radica en el tokenizer compartido de 65k entradas (`65k_en1.0_ru1.0`), diseñado para equilibrar la cobertura de vocabulario entre inglés y ruso, lo que evita la fragmentación de tokens en ruso y mejora la eficiencia de representación.

El entrenamiento se realizó con torchtitan, el framework de entrenamiento de Meta, sobre un dataset bilingüe no especificado en detalle (no se indica el número total de tokens ni la proporción exacta entre idiomas). Se completaron 133.600 pasos en la versión v3, con un checkpoint final (step-133.600) que quedó vacío por un fallo de escritura asíncrona; los pesos utilizados corresponden al step-133.500. La v2 anterior corrigió un problema de inyección de datos, lo que sugiere que la v3 es una iteración más estable. No se menciona el uso de RLHF, DPO ni instrucciones; es un modelo de preentrenamiento puro, sin fine-tuning posterior.

## Capacidades

- Generación de texto en inglés y ruso: el modelo puede producir texto coherente en ambos idiomas, con una pérdida de validación de 2.244 nats (perplejidad 9.43) en inglés y 2.1955 nats (perplejidad 8.98) en ruso, según el último checkpoint validado.
- Razonamiento y conocimiento general: al ser un modelo preentrenado, tiene capacidades de razonamiento básico y conocimiento factual extraído de los datos de entrenamiento, aunque sin fine-tuning instructivo su capacidad de seguir instrucciones es limitada.
- Transferencia multilingüe: al compartir tokenizer y entrenar con datos bilingües, el modelo puede aprovechar representaciones compartidas entre inglés y ruso, lo que facilita tareas de traducción y comprensión cruzada.
- Evaluación en tareas estándar: el repositorio incluye resultados en formato EEE para Global MMLU (EN y RU), PIQA y ECLeKTic, aunque no se publican los valores numéricos en la model card.
- No se documenta soporte para tool calling, function calling, agentes, visión ni audio. Tampoco se menciona un modo de razonamiento especial (thinking mode).

## Casos de uso

- Traducción automática inglés-ruso: el modelo puede utilizarse como base para un sistema de traducción, ya que su tokenizer bilingüe y su entrenamiento conjunto permiten generar texto en ambos idiomas. Se podría integrar en pipelines de traducción con post-procesamiento y verificación humana.
- Análisis de sentimiento en redes sociales bilingües: para empresas que monitorizan opiniones en inglés y ruso, el modelo puede clasificar texto en ambos idiomas sin necesidad de dos modelos separados, reduciendo costes de infraestructura.
- Generación de contenido bilingüe para marketing: creación de borradores de publicaciones, descripciones de productos o artículos en inglés y ruso con un solo modelo, acelerando el flujo de trabajo de equipos de contenido multilingüe.
- Chatbots de atención al cliente en mercados de habla rusa e inglesa: al ser preentrenado, puede servir como base para un fine-tuning con datos conversacionales, manteniendo la cobertura de ambos idiomas en un único despliegue.
- Investigación académica en transferencia multilingüe: el modelo es un recurso valioso para estudiar cómo se comparten representaciones entre idiomas con alfabetos diferentes (latino y cirílico), y para comparar estrategias de preentrenamiento bilingüe frente a adaptación monolingüe.
- Extracción de información de documentos técnicos: dado que el modelo maneja ambos idiomas, puede procesar documentación técnica mixta (por ejemplo, manuales en inglés con anotaciones en ruso) para extraer entidades, resumir o clasificar.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que los resultados de evaluación en formato EEE están almacenados en el repositorio bajo `eval_results/eee/`, con tareas de Global MMLU (EN y RU), PIQA y ECLeKTic, pero no se proporcionan los valores en el README. Los únicos datos cuantitativos publicados son las métricas de validación de perplejidad:

| Conjunto de validacion | Loss (nats) | Perplejidad |
|---|---|---|
| Ingles (en) | 2.244 | 9.43 |
| Ruso (ru) | 2.1955 | 8.98 |

Estas métricas indican un rendimiento razonable en ambos idiomas, con una ligera ventaja para el ruso, pero no permiten comparar directamente con otros modelos sin datos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16 (6.3B parámetros), se necesitan aproximadamente 12.6 GB de VRAM solo para los pesos. Con cuantización a 8 bits se reduce a unos 6.3 GB, y a 4 bits a unos 3.2 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para inferencia en BF16, una GPU con 16 GB o más (por ejemplo, RTX 4080, RTX 4090, A10G, A100 40GB) es suficiente. Con cuantización 4 bits, una RTX 3060 de 12 GB o similar podría ser viable.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de consumo con 12-16 GB de VRAM si se aplica cuantización, aunque no hay archivos GGUF oficiales en el repositorio.
- Opciones de despliegue: al ser pesos en safetensors estándar, se puede usar con transformers (HuggingFace), vLLM, TGI o llama.cpp (si se convierten los pesos a GGUF manualmente). No hay integración documentada con Ollama.
- Latencia y throughput: no se han publicado datos de rendimiento de inferencia. Como referencia, un modelo de 7B en BF16 en una A100 suele lograr un throughput de 20-50 tokens/segundo dependiendo del batch, pero esto no está confirmado para este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de este modelo frente a alternativas. Como referencia cualitativa, se puede comparar con otros modelos de 7B bilingües o multilingües:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| llama3-7b-en-ru-v3 (este) | 6.3B | no disponible | en, ru | llama3 | Preentrenado bilingüe desde cero |
| LLaMA-3 8B (Meta) | 8B | 8.192 | multilingüe (principalmente en) | llama3 | Modelo base oficial, no optimizado para ruso |
| Mistral 7B | 7.3B | 32.768 | multilingüe (en, fr, de, es, it) | Apache 2.0 | Mejor contexto y licencia permisiva, pero sin enfoque ruso |
| Qwen2.5 7B | 7.6B | 128.000 | multilingüe (incluye ru) | Apache 2.0 | Mayor contexto y cobertura, pero más pesado |

La ventaja de este modelo es su especialización en el par en-ru con tokenizer dedicado, lo que puede ofrecer mejor calidad en ruso que modelos genéricos, aunque no hay datos que lo confirmen. Su desventaja es el contexto limitado (si se confirma 8.192) y la ausencia de fine-tuning instructivo.

## Limitaciones y advertencias

- Modelo de preentrenamiento puro: no ha sido fine-tuning con instrucciones, por lo que su capacidad para seguir prompts complejos o dialogar de forma natural es limitada. Requiere fine-tuning para la mayoría de aplicaciones prácticas.
- Sesgos y alucinaciones: al ser un modelo base entrenado con datos web, puede reproducir sesgos presentes en los datos y generar contenido factualmente incorrecto. No se ha realizado alineación ni mitigación de sesgos.
- Cobertura de idiomas: solo inglés y ruso. No soporta otros idiomas, y el rendimiento en variantes dialectales o registros técnicos específicos puede ser inferior.
- Contexto no documentado: la longitud de contexto no se especifica en la model card. Si se asume la de LLaMA-3 (8.192 tokens), puede ser insuficiente para tareas que requieran contexto largo.
- Checkpoint final incompleto: el step-133.600 quedó vacío por un fallo de escritura; los pesos publicados corresponden al step-133.500. Esto puede afectar ligeramente a la reproducibilidad.
- Licencia llama3: permite uso comercial, pero con restricciones (por ejemplo, no usar para mejorar otros modelos de lenguaje grandes sin permiso). Revisar los términos completos de la licencia de Meta.
- Sin soporte de cuantizaciones oficiales: el repositorio solo incluye pesos BF16, por lo que para despliegue eficiente es necesario convertir a GGUF u otros formatos manualmente.
- Sin comunidad ni soporte: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no hay comunidad activa ni garantías de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/The-CoLab/llama3-7b-en-ru-v3
- Modelo relacionado v2: https://huggingface.co/The-CoLab/llama3-7b-en-ru-v2
- Modelo relacionado con traducción: https://huggingface.co/The-CoLab/llama3-7b-en-translated-ru
- Modelo relacionado con aya: https://huggingface.co/The-CoLab/llama3-7b-en-ru-aya
- Colección de transferencia multilingüe de The-CoLab: https://huggingface.co/collections/The-CoLab/multilingual-transfer-6a2d2b4019d4300f61a444a8
