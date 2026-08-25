# tcontorno/edgar-bpe-65536

## Resumen

`edgar-bpe-65536` es un tokenizer byte-level BPE desarrollado por el usuario `tcontorno`, entrenado exclusivamente sobre documentos de la SEC (EDGAR). El corpus de entrenamiento comprende 4.140 documentos extraídos de presentaciones primarias (iXBRL/HTML limpiados a texto), con un total de 1,3 GB y un rango temporal de 2010 a 2024. Su objetivo principal es maximizar la compresión de texto financiero, reduciendo el número de tokens necesarios para codificar documentos como 10-Q, 8-K o DEF 14A, en comparación con tokenizers generalistas como GPT-2, GPT-4 o Qwen3.

El tokenizer utiliza un vocabulario de 65.536 tokens, pre-tokenización estilo GPT-2 (byte-level) y un único token especial `<|endoftext|>`. Se trata de una herramienta pensada para la investigación en tokenización y para el entrenamiento de nuevos modelos de lenguaje especializados en finanzas, no como reemplazo de tokenizers existentes. Su relevancia actual radica en la creciente necesidad de optimizar el coste computacional y de API al procesar grandes volúmenes de informes financieros, donde la compresión del texto se traduce en ahorro directo de tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BPE (byte-level) |
| Parametros totales | No aplica (tokenizer, no modelo de lenguaje) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (no es un modelo de generación) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Inglés (documentos SEC) |
| Licencia | MIT |
| Formato de pesos | tokenizer.json (compatible con `transformers` y `tokenizers`) |

## Arquitectura y entrenamiento

El tokenizer implementa el algoritmo byte-level BPE con pre-tokenización idéntica a la de GPT-2/GPT-4/GPT-4o/Qwen3, lo que permite aislar el efecto del vocabulario en las comparaciones de compresión. El entrenamiento se realizó sobre un corpus de 4.140 documentos (tras un split de validación del 5% con deduplicación por hash de contenido), con una frecuencia de fusión mínima de 2 y un único token especial `<|endoftext|>`. Se preservaron números y caracteres Unicode reales durante la limpieza del texto.

La innovación principal es la especialización en un dominio concreto: las presentaciones SEC, que contienen un vocabulario financiero y numérico muy específico. Esto permite que el tokenizer represente cifras, porcentajes y terminología contable con menos tokens que los tokenizers generalistas.

## Capacidades

- Tokenización de texto en inglés, optimizada para documentos financieros y legales de la SEC.
- Compresión de texto: alcanza 4,87 bytes/token en documentos de validación, superando a tokenizers generalistas.
- Preservación de números y caracteres Unicode reales, evitando pérdidas de información en cifras y símbolos.
- Compatibilidad con la librería `transformers` y con `tokenizers` (carga directa desde `tokenizer.json`).
- Pre-tokenización estándar GPT-2, lo que facilita la comparación con otros tokenizers del ecosistema.
- No incluye capacidades de generación, razonamiento, tool calling ni agentes; es únicamente un tokenizer.

## Casos de uso

- Preprocesamiento de corpus financieros para entrenar modelos de lenguaje especializados en finanzas: el tokenizer reduce el número de tokens necesarios para representar 10-Q, 8-K y DEF 14A, lo que abarata el coste de entrenamiento y mejora la eficiencia del modelo.
- Optimización de costes de API en pipelines de análisis de documentos SEC: al convertir texto de presentaciones en tokens con una compresión mayor que la de GPT-4o o GPT-4, se reduce el gasto en llamadas a APIs de LLMs que cobran por token.
- Construcción de sistemas de búsqueda y recuperación de información en archivos EDGAR: al tokenizar de forma más compacta, se pueden indexar y comparar documentos con menos recursos de almacenamiento y computación.
- Investigación en tokenización y análisis de vocabulario: sirve como referencia para estudiar el impacto del dominio de entrenamiento en la compresión, ya que su pre-tokenización es idéntica a la de GPT-2.
- Generación de resúmenes automáticos de informes financieros: aunque el tokenizer no genera texto, puede integrarse en pipelines de preprocesamiento para modelos de resumen que trabajan sobre representaciones tokenizadas.
- Normalización de textos de presentaciones SEC para sistemas de extracción de datos: al convertir el texto en tokens, se facilita el entrenamiento de modelos de NER o extracción de métricas financieras, reduciendo el ruido y el tamaño de los datos de entrada.

## Benchmarks y rendimiento

La card del modelo reporta métricas de compresión sobre 216 documentos de validación no utilizados en el entrenamiento. Los resultados son los siguientes:

| Métrica | Valor |
|---|---|
| Bytes/token en documentos SEC de validación | 4,87 |
| Tokens necesarios por GPT-2 para el mismo texto | +6,4% |
| Tokens necesarios por GPT-4 (cl100k) | +2,1% |
| Tokens necesarios por GPT-4o (o200k) | +1,4% |
| Tokens necesarios por Qwen3 | +10,7% |

Estas cifras indican que `edgar-bpe-65536` logra una compresión significativamente mayor que los tokenizers generalistas, con una ventaja del 10,7% frente a Qwen3 y del 2,1% frente a GPT-4. No se han publicado resultados de benchmarks de tareas de lenguaje (MMLU, HumanEval, etc.) porque no es un modelo de generación, sino un tokenizer.

## Requisitos de hardware

- No requiere GPU ni VRAM para su uso: es un tokenizer que se ejecuta en CPU.
- Puede integrarse en cualquier entorno con Python y la librería `transformers` o `tokenizers`.
- Tamaño del archivo: el tokenizer.json es de aproximadamente 2-3 MB (vocabulario de 65.536 tokens), por lo que se puede cargar en memoria en cualquier sistema.
- Despliegue en producción: no hay restricciones de latencia relevantes; el tokenizado de un documento de 1 MB tarda unos pocos milisegundos en CPU.
- Compatible con pipelines de vLLM, TGI u Ollama solo como tokenizer externo, no como modelo de generación.

## Comparativa con modelos similares

La siguiente tabla compara la compresión de este tokenizer con los tokenizers generalistas de GPT-2, GPT-4, GPT-4o y Qwen3, según los datos reportados en la card.

| Tokenizer | Vocabulario | Tokens necesarios para el mismo texto (base: edgar-bpe) |
|---|---|---|
| edgar-bpe-65536 | 65.536 | 100% (referencia) |
| GPT-2 | 50.257 | +6,4% |
| GPT-4 (cl100k) | 100.000 | +2,1% |
| GPT-4o (o200k) | 200.000 | +1,4% |
| Qwen3 | ~151.000 | +10,7% |

No hay otros tokenizers especializados en SEC filings disponibles en HuggingFace con los mismos datos de validación, por lo que esta comparativa se limita a tokenizers generalistas.

## Limitaciones y advertencias

- Es un tokenizer, no un modelo de lenguaje: no genera texto ni realiza inferencias.
- La especialización en documentos SEC implica que su compresión en otros dominios (por ejemplo, código fuente o conversación general) será inferior a la de tokenizers generalistas.
- El tokenizer está ligado al corpus de entrenamiento: no se recomienda utilizarlo con modelos existentes que fueron entrenados con otros tokenizers, ya que no son compatibles.
- El corpus se limita al inglés y a un dominio financiero específico; no cubre otros idiomas ni jerga técnica fuera de ese ámbito.
- Los datos de compresión provienen de la validación del autor; no se ha verificado de forma independiente en un tercer estudio.
- La licencia MIT permite uso comercial, pero es responsabilidad del usuario revisar los términos de los datos de la SEC si se utiliza el tokenizer para procesar datos originales.

## Enlaces

- [HuggingFace](https://huggingface.co/tcontorno/edgar-bpe-65536)
- [Repositorio GitHub](https://github.com/tcontorno6/edgar-tok)
- [Informe técnico (write-up)](https://github.com/tcontorno6/edgar-tok/blob/main/docs/WRITEUP.md)
