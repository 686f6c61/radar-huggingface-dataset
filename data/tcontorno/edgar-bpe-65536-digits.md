# tcontorno/edgar-bpe-65536-digits

## Resumen

`tcontorno/edgar-bpe-65536-digits` es un tokenizer BPE byte-level entrenado exclusivamente sobre documentos de la SEC (EDGAR), desarrollado por tcontorno. Su propósito es ofrecer una representación tokenizada más eficiente para texto financiero y legal de Estados Unidos, especialmente en el dominio de informes corporativos como 10-Q, 8-K y DEF 14A. La característica distintiva es su pre-tokenización especial para números: cantidades en dólares, porcentajes y cifras agrupadas con comas se mantienen completas durante el proceso, permitiendo que el BPE las fusione en un solo token.

El modelo tiene un vocabulario de 65 536 tokens y se entrenó sobre un corpus limpio de 1,3 GB correspondiente a 4 140 documentos de EDGAR (2010-2024, unas 4 250 empresas). En métricas de compresión sobre documentos held-out, alcanza 5,27 bytes por token y reduce significativamente el número de tokens necesarios para representar cantidades y porcentajes respecto a tokenizers estándar como GPT-4o o GPT-2. Es un componente pensado para la investigación y el desarrollo de nuevos modelos de lenguaje financiero, no para su uso con checkpoints existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BPE byte-level con pre-tokenización especial para dígitos |
| Parametros totales | No aplicable (tokenizer, sin pesos de red neuronal) |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | tokenizer.json, vocab.json, merges.txt (compatible con `transformers` y `tokenizers`) |

## Arquitectura y entrenamiento

Se trata de un tokenizer BPE a nivel de bytes, lo que significa que opera sobre secuencias de bytes en lugar de caracteres Unicode, lo que le permite manejar cualquier texto sin tokens desconocidos. La innovación principal está en la fase de pre-tokenización: en modo `digits`, las secuencias de dígitos se mantienen como una unidad indivisible (por ejemplo, `$3,232,193` o `4.25%` no se separan en fragmentos antes de aplicar el algoritmo BPE). Esto permite que el BPE pueda fusionar el número completo en un único token si aparece con frecuencia suficiente.

El entrenamiento se realizó sobre 4 140 documentos primarios de SEC (iXBRL/HTML limpiados a texto plano, conservando números y Unicode real), con un tamaño de vocabulario de 65 536 y una frecuencia mínima de fusión de 2. Se incluye un único token especial `<|endoftext|>`. Antes de entrenar se aplicó una deduplicación por hash de contenido y se reservó un 5 % de documentos como conjunto held-out para evaluación. No se ha aplicado ningún paso de RLHF ni ajuste con preferencias humanas.

## Capacidades

- Tokenización de texto financiero y legal de SEC filings con alta eficiencia de compresión: 5,27 bytes/token en documentos held-out.
- Representación compacta de números: una cantidad en dólares como `$3,232,193` se tokeniza en promedio en 1,72 tokens (frente a 4,1 de GPT-4o), y un porcentaje como `4.25%` en 1,34 tokens.
- Manejo de números agrupados con comas y decimales, gracias a la pre-tokenización `digits`.
- Compatible con las librerías `transformers` y `tokenizers` de HuggingFace.
- Funciona como tokenizer independiente, sin dependencias de modelos externos.
- Solo cubre idioma inglés, por la naturaleza del corpus (documentos SEC).

## Casos de uso

- Entrenamiento de modelos de lenguaje financieros: este tokenizer puede servir como base para entrenar un modelo de lenguaje desde cero sobre documentos SEC, reduciendo el número de tokens necesarios para representar cifras y mejorando la eficiencia computacional.
- Preprocesamiento de documentos SEC para análisis de texto: al tokenizar 10-Q, 8-K y DEF 14A, se obtienen secuencias más cortas y con mejor preservación de la información numérica, útil para tareas de clasificación o extracción de información.
- Análisis de sentimiento en informes financieros: la tokenización compacta de cantidades y porcentajes facilita que modelos posteriores capturen matices de resultados económicos sin perder precisión en los números.
- Extracción de métricas financieras de texto: al mantener números enteros como un token, se simplifica el parseo de tablas y párrafos que contienen datos numéricos en documentos SEC.
- Compresión de texto para almacenamiento o transmisión: en entornos donde se procesan grandes volúmenes de documentos legales, un tokenizador más eficiente reduce el espacio necesario para representar el mismo contenido.
- Investigación en tokenización: sirve como caso de estudio de pre-tokenización especializada para dominios numéricos, y puede compararse con tokenizadores estándar para medir el impacto en la eficiencia de compresión.

## Benchmarks y rendimiento

El autor proporciona métricas medidas sobre 216 documentos held-out que ningún variante del tokenizer ha visto durante el entrenamiento. Se comparan con GPT-4o y GPT-2 en tareas de compresión.

| Metrica | edgar-bpe-65536-digits | GPT-4o | GPT-2 |
|---|---|---|---|
| Bytes por token en SEC filings held-out | 5,27 | no disponible | no disponible |
| Tokens por cantidad en dólares | 1,72 | 4,1 | no disponible |
| Tokens por porcentaje (ej. `4.25%`) | 1,34 | 4,1 | no disponible |
| Incremento de tokens de GPT-2 para el mismo texto | -15 % (menos tokens) | no disponible | +15 % |

Además, una prueba con 450 documentos de distintas formas (10-Q, 8-K, DEF 14A) confirmó que las ventajas de compresión se generalizan más allá de la forma de documento utilizada en el entrenamiento. No se han publicado resultados de calidad de modelos entrenados con este tokenizer.

## Requisitos de hardware

- No se requiere GPU para la inferencia del tokenizer; se ejecuta en CPU con un uso de memoria muy bajo (menos de 1 GB en la mayoría de los casos).
- Cualquier máquina con Python 3.8+ y las librerías `transformers` o `tokenizers` puede ejecutarlo.
- Para entrenar un modelo de lenguaje que utilice este tokenizer, se necesitaría una GPU (p. ej., RTX 4090, A100) dependiendo del tamaño del modelo, pero eso no es responsabilidad del tokenizer.
- Despliegue posible en entornos de producción con `transformers` o `tokenizers`; no requiere servicios de inferencia específicos como vLLM u Ollama, al no ser un modelo de lenguaje.
- Latencia de tokenización del orden de microsegundos por documento, dado que el BPE es un algoritmo ligero.

## Comparativa con modelos similares

No hay muchos tokenizers especializados en SEC filings publicados. Se puede comparar con tokenizadores estándar de modelos de lenguaje generalistas:

| Tokenizer | Vocabulario | Especialización numérica | Bytes/token (SEC) | Licencia |
|---|---|---|---|---|
| `tcontorno/edgar-bpe-65536-digits` | 65 536 | Sí, pre-tokenización `digits` | 5,27 | MIT |
| GPT-4o (tokenizer) | ~100 000 | No | no disponible | no disponible |
| GPT-2 (tokenizer) | 50 257 | No | no disponible | MIT |

La ventaja principal de este tokenizer es su compresión numérica y su capacidad para reducir el número total de tokens en textos financieros. Sin embargo, no es compatible con ningún modelo pre-entrenado existente; solo sirve para entrenar modelos nuevos.

## Limitaciones y advertencias

- No es un modelo de lenguaje; es solo un tokenizer. No genera texto ni tiene capacidad de razonamiento.
- La pre-tokenización `digits` es no estándar; las comparaciones de compresión con otros tokenizadores deben especificar este hecho, ya que la eficiencia numérica no es comparable directamente con tokenizadores que dividen los números en dígitos individuales.
- No se ha evaluado la calidad de modelos downstream entrenados con este tokenizer; la única métrica medida es la compresión.
- Está vinculado al corpus de SEC filings; su rendimiento en texto financiero de otras jurisdicciones (p. ej., informes europeos) o en dominios no financieros probablemente será inferior.
- Solo soporta inglés; no hay soporte para otros idiomas.
- La licencia MIT permite uso comercial y modificación, pero el autor no ofrece garantías sobre su idoneidad para producción.
- Para usarlo con un modelo existente, es necesario reentrenar el modelo desde cero; no es un reemplazo directo para tokenizadores de modelos ya publicados.

## Enlaces

- [HuggingFace: tcontorno/edgar-bpe-65536-digits](https://huggingface.co/tcontorno/edgar-bpe-65536-digits)
- [Repositorio GitHub: tcontorno6/edgar-tok](https://github.com/tcontorno6/edgar-tok)
- [Documentación técnica (write-up)](https://github.com/tcontorno6/edgar-tok/blob/main/docs/WRITEUP.md)
