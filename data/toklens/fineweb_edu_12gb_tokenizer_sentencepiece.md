# toklens/fineweb_edu_12gb_tokenizer_sentencepiece

## Resumen

Este repositorio contiene un tokenizer Byte-Level BPE entrenado sobre el subconjunto `fw_edu` del dataset FineWeb-2-HQ, desarrollado por el usuario toklens. FineWeb-2-HQ es una versión filtrada y de alta calidad del dataset FineWeb, que a su vez es una recopilación de texto web en inglés de 15 billones de tokens, procesada con un pipeline de filtrado basado en anotaciones sintéticas de Llama 3 y un regresor lineal sobre embeddings. El tokenizer está diseñado para ser utilizado en el entrenamiento de modelos de lenguaje, proporcionando una segmentación eficiente del texto educativo.

Con un vocabulario objetivo de 32 000 tokens, utiliza un pre-tokenizador estilo sentencepiece y normalización Unicode NFC. La licencia MIT permite su uso libre, incluso en aplicaciones comerciales. Aunque no es un modelo de lenguaje completo, su relevancia radica en que es un componente esencial para cualquier pipeline de entrenamiento de LLM, y su entrenamiento sobre datos educativos de alta calidad puede mejorar la eficiencia de tokenización en dominios académicos y técnicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-Level BPE |
| Parametros totales | No aplica (tokenizer, no modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | `fw_` (inglés educativo, según el dataset FineWeb-2-HQ) |
| Licencia | MIT |
| Formato de pesos | `tokenizer.json`, `vocab.json`, `merges.txt` |

## Arquitectura y entrenamiento

El tokenizer emplea el algoritmo Byte-Level BPE, que opera sobre bytes en lugar de caracteres Unicode, lo que permite manejar cualquier texto sin tokens desconocidos. El pre-tokenizador es de tipo sentencepiece, con manejo de números aprendido (es decir, los números se segmentan según las reglas aprendidas durante el entrenamiento) y sin manejo de contracciones. La normalización aplicada es NFC (Forma de Normalización Canónica). El entrenamiento se realizó con la herramienta FlexiTok sobre dos shards del dataset `fineweb_edu_10bt.chunk.00.jsonl` y `fineweb_edu_10bt.chunk.01.jsonl`, que contienen aproximadamente 10 billones de tokens de texto educativo. El vocabulario final es de 32 000 tokens, e incluye los tokens especiales `<s>`, `</s>`, `<pad>` y `<unk>`.

## Capacidades

- Tokenización byte-level: puede codificar cualquier texto, incluyendo caracteres fuera del rango Unicode estándar, sin tokens desconocidos.
- Manejo de números aprendido: los números se tokenizan de forma consistente, lo que es útil para textos técnicos y científicos.
- Compatibilidad con HuggingFace Transformers: se puede cargar mediante `AutoTokenizer`, integrándose fácilmente en pipelines existentes.
- Entrenado en texto educativo: optimizado para dominios académicos, científicos y técnicos en inglés.
- Sin capacidades generativas: al ser solo un tokenizer, no realiza generación de texto, razonamiento, ni soporta tool calling o agentes.

## Casos de uso

- Preprocesamiento para entrenamiento de LLMs: el tokenizer se utiliza para convertir corpus de texto en secuencias de tokens antes de alimentar un modelo transformer. Su entrenamiento en datos educativos puede reducir el número de tokens necesarios para representar contenido académico, mejorando la eficiencia del entrenamiento.
- Tokenización para fine-tuning de modelos existentes: al usar un vocabulario de 32K, es adecuado para ajustar modelos pequeños o medianos en dominios específicos como educación o ciencia.
- Evaluación de calidad de tokenización: sirve como referencia para comparar la segmentación de texto educativo frente a tokenizers generales como GPT-2 o Llama.
- Desarrollo de pipelines de NLP: se puede integrar en sistemas de preprocesamiento para tareas como clasificación de documentos académicos, extracción de información o generación de resúmenes.
- Investigación en tokenización: su configuración (BPE byte-level, sentencepiece, normalización NFC) permite estudiar el impacto de estas decisiones en el rendimiento de modelos posteriores.
- Aplicaciones educativas: al estar entrenado en contenido educativo, puede mejorar la tokenización de libros de texto, artículos científicos y materiales de aprendizaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un tokenizer, las métricas relevantes serían la tasa de compresión (tokens por palabra) o la cobertura del vocabulario, pero no se proporcionan datos numéricos al respecto.

## Requisitos de hardware

- No requiere GPU ni recursos de cómputo específicos para su uso; es un archivo de configuración y vocabulario que se carga en memoria.
- El entrenamiento del tokenizer se realizó con FlexiTok, que es una herramienta ligera que puede ejecutarse en CPU.
- Para su uso en pipelines de entrenamiento de LLMs, el coste de hardware depende del modelo posterior, no del tokenizer en sí.
- Opciones de despliegue: se integra directamente con HuggingFace Transformers, por lo que puede usarse en cualquier entorno que soporte esta librería.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | Algoritmo | Pre-tokenizador | Normalización | Licencia |
|---|---|---|---|---|---|
| toklens/fineweb_edu_12gb_tokenizer_sentencepiece | 32 000 | Byte-Level BPE | sentencepiece | NFC | MIT |
| GPT-2 (OpenAI) | 50 257 | Byte-Level BPE | Regex (GPT-2) | NFC | MIT |
| Llama 2 (Meta) | 32 000 | SentencePiece (Unigram) | SentencePiece | NFC | Llama 2 Community License |

El tokenizer de toklens se diferencia de GPT-2 por su menor vocabulario (32K vs 50K) y su entrenamiento específico en texto educativo, lo que puede ofrecer una mejor compresión en ese dominio. Comparado con Llama 2, ambos usan 32K tokens, pero Llama 2 emplea Unigram en lugar de BPE y tiene una licencia más restrictiva. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Entrenado exclusivamente en texto educativo en inglés (`fw_`): su rendimiento en otros idiomas o dominios (por ejemplo, código fuente, conversación informal) puede ser subóptimo.
- No incluye manejo de contracciones, lo que puede aumentar el número de tokens en textos con apóstrofos (p. ej., "don't" se dividirá en "don" y "'t").
- Al ser un tokenizer independiente, no proporciona capacidades de generación ni razonamiento; debe usarse junto con un modelo de lenguaje.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que el dataset FineWeb-2-HQ cumple con sus requisitos de atribución, aunque el tokenizer en sí no incluye datos del dataset.
- No se han publicado métricas de calidad de tokenización (como tasa de compresión o cobertura), por lo que su eficacia relativa no está documentada.

## Enlaces

- Repositorio del tokenizer: https://huggingface.co/toklens/fineweb_edu_12gb_tokenizer_sentencepiece
- Dataset FineWeb-Edu (HuggingFace): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Documentación de FineWeb (blogpost): https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1
- Paper de FineWeb (arXiv): https://arxiv.org/html/2406.17557v1
- Código de descarga de FineWeb (GitHub): https://github.com/karpathy/build-nanogpt/blob/master/fineweb.py
