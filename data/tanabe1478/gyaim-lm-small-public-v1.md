# tanabe1478/gyaim-lm-small-public-v1

## Resumen

`tanabe1478/gyaim-lm-small-public-v1` es un modelo de lenguaje condicional japonés basado en GPT-2, desarrollado por tanabe1478 para evaluar candidatos de conversión kana-kanji en el contexto del IME SwiftyGyaim. No es un modelo de chat ni de propósito general: su función exclusiva es puntuar la plausibilidad de una salida en caracteres kanji dado un contexto izquierdo y una lectura en katakana, utilizando los tags de control privados del proyecto Zenz.

El modelo parte de `ku-nlp/gpt2-small-japanese-char` (90,45 millones de parámetros con embeddings atados, vocabulario de 6.000 tokens y contexto de 1.024) y se ha ajustado completamente (sin LoRA) sobre el dataset público `Miwa-Keita/zenz-v2.5-dataset`, con 188,98 millones de ejemplos. La versión publicada excluye deliberadamente cualquier dato personal de usuarios de SwiftyGyaim, lo que la hace apta para redistribución bajo licencia CC BY-SA 4.0.

Su relevancia radica en ofrecer un componente de scoring de candidatos IME reproducible y ligero, con pesos en safetensors (F32) y una cuantización GGUF Q5_K_M verificada para el fork de llama.cpp de azooKey. Está pensado para integrarse en sistemas de entrada japonesa, no para generación de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 decoder-only causal language model |
| Parametros totales | 90.450.432 (embeddings atados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F32 (safetensors), Q5_K_M (GGUF) |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal estándar de la familia GPT-2, con embeddings atados (tied embeddings) y un vocabulario de 6.000 tokens. La entrada sigue el formato de tags de control privados de Zenz: `\uEE02<left_context>\uEE00<input_katakana>\uEE01<output></s>`. Durante el entrenamiento, la parte del prompt se enmascara y la pérdida se calcula únicamente sobre la secuencia de salida y el token final.

El ajuste se realizó con supervisión completa (full-parameter fine-tuning, no LoRA) sobre dos subconjuntos públicos de `Miwa-Keita/zenz-v2.5-dataset`: `train_wikipedia.jsonl` (17.493.369 ejemplos) y `train_llm-jp-corpus-v3.jsonl` (171.487.973 ejemplos), totalizando 188.981.342 ejemplos. La configuración de entrenamiento incluye longitud de secuencia 192, batch size 32, tasa de aprendizaje 1e-4 con decaimiento lineal, precisión mixta FP16 y 5.905.651 pasos de optimizador completados. El hardware utilizado fue una AMD Radeon RX 9070 XT de 16 GB con PyTorch ROCm 7.2.1 en Windows nativo. Debido a paradas y reanudaciones seguras, un máximo de 510 ejemplos (0,00027% del total) no se usaron en la actualización del optimizador.

## Capacidades

- Scoring de candidatos de conversión kana-kanji: dado un contexto izquierdo y una lectura en katakana, asigna una probabilidad a cada candidato de salida en kanji.
- Evaluación condicionada por contexto: utiliza el contexto izquierdo para desambiguar homófonos y mejorar la selección de candidatos.
- Integración con IME: diseñado para funcionar como componente de ranking dentro de SwiftyGyaim o sistemas similares.
- Compatibilidad con GGUF: la versión cuantizada Q5_K_M está verificada para el fork de llama.cpp de azooKey.
- No soporta generación de texto libre, conversación, tool calling, agentes ni razonamiento multi-paso.
- No es multilingüe: solo japonés.

## Casos de uso

- Motor de conversión kana-kanji en IME: el modelo se integra en SwiftyGyaim para puntuar y ordenar los candidatos de conversión en tiempo real, mejorando la precisión de la entrada japonesa.
- Evaluación de calidad de candidatos en sistemas de entrada: se puede usar como referencia objetiva para comparar diferentes algoritmos de generación de candidatos, midiendo la pérdida y la perplejidad sobre conjuntos de validación.
- Filtrado de candidatos en aplicaciones de teclado: en un teclado japonés para iOS o macOS, el modelo puede descartar candidatos improbables antes de mostrarlos al usuario, reduciendo la carga cognitiva.
- Investigación en NLP japonesa: sirve como baseline ligero para estudiar la conversión kana-kanji con modelos de lenguaje condicionales, dado su pequeño tamaño y reproducibilidad.
- Pruebas de cuantización y despliegue en edge: al ser un modelo de 90M, es adecuado para experimentar con cuantización GGUF y medir latencia en dispositivos móviles o de escritorio.
- Desarrollo de IME personalizados: desarrolladores pueden adaptar el modelo a dominios específicos (por ejemplo, terminología médica o legal) mediante fine-tuning adicional sobre el checkpoint público.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Public validation loss (5.000 ejemplos) | 0,05007 |
| Public validation perplexity | 1,05 |
| SwiftyGyaim public-general fixture top-1 | 74/104 (71,15%) |

Nota: el fixture public-general es una evaluación de regresión interna del proyecto SwiftyGyaim, no un benchmark estandarizado de IME. Se excluyeron 18 de los 122 casos originales por pertenecer a las categorías `user-dict`, `dogfood-regression` y `preference`. No se han publicado comparaciones con otros modelos de conversión kana-kanji en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en FP32 ocupa aproximadamente 362 MB; en FP16 unos 181 MB; la versión GGUF Q5_K_M ocupa menos de 100 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Se ha verificado el entrenamiento en una AMD Radeon RX 9070 XT de 16 GB, pero la inferencia es viable en GPUs integradas o incluso en CPU.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) y en GPUs de portátiles.
- Opciones de despliegue: Transformers (Python), llama.cpp (fork de azooKey para GGUF), y potencialmente vLLM u Ollama, aunque no se ha documentado su uso con estos motores.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño reducido, se espera una latencia de pocos milisegundos por consulta en GPU moderna y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de conversión kana-kanji. El modelo base `ku-nlp/gpt2-small-japanese-char` es el punto de partida, y el dataset `Miwa-Keita/zenz-v2.5-dataset` es el mismo utilizado por el proyecto Zenz, pero no hay datos de rendimiento comparativo entre este modelo y Zenz u otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está diseñado exclusivamente para scoring de candidatos de conversión kana-kanji; no sirve para conversación, generación de texto ni preguntas y respuestas.
- Sesgos del corpus: al entrenarse con datos de Wikipedia y Common Crawl (vía llm-jp), puede heredar sesgos, imprecisiones o expresiones inapropiadas presentes en esos textos.
- No apto para estimación de lecturas: las lecturas (yomi) se generaron automáticamente e incluyen variaciones, por lo que no debe usarse como recurso de datos de pronunciación.
- Verificación pendiente en producción: la cuantización GGUF Q5_K_M se ha cargado correctamente en el fork de azooKey/llama.cpp, pero no se ha evaluado el ranking de candidatos tras la cuantización ni la latencia en macOS.
- Licencia CC BY-SA 4.0: cualquier redistribución o modificación debe mantener la misma licencia y atribución. Además, el dataset incluye subconjuntos con licencias ODC-BY y Common Crawl Terms of Use, que deben respetarse.
- Contexto limitado: 1.024 tokens, suficiente para la tarea IME pero no para contextos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tanabe1478/gyaim-lm-small-public-v1
- Modelo base: https://huggingface.co/ku-nlp/gpt2-small-japanese-char
- Dataset de entrenamiento: https://huggingface.co/datasets/Miwa-Keita/zenz-v2.5-dataset
- Aplicacion SwiftyGyaim: https://github.com/tanabe1478/SwiftyGyaim
- Repositorio de experimentos del autor: https://github.com/tanabe1478/llm-labs
