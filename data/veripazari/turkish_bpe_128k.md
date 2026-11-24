# veripazari/turkish_bpe_128k

## Resumen

`turkish_bpe_128k` es un tokenizador BPE de nivel de byte entrenado desde cero para turco, con un vocabulario de 128.000 tokens. Lo desarrolló originalmente el usuario `erenyanic` y esta ficha corresponde a la réplica publicada por `veripazari` en Hugging Face, que archiva el recurso para el ecosistema de IA en turco. No es un modelo de lenguaje: es un componente de preprocesado que se integra en la librería `transformers` mediante `AutoTokenizer`.

El problema que resuelve es la ineficiencia de los tokenizadores multilingües genéricos sobre texto turco, un idioma aglutinante con reglas morfológicas y ortográficas propias (punto de la *i*, apóstrofo en nombres propios). El tokenizador sigue el diseño de los tokenizadores de modelos frontera recientes (GPT-4, Llama 3, Qwen 3, DeepSeek-V3): BPE de nivel de byte, sin normalizador, con preservación de mayúsculas y minúsculas y sin token `<unk>`.

Se entrenó sobre aproximadamente 200 millones de caracteres de texto turco generado por usuarios, procedente de dos conjuntos de datos públicos de análisis de sentimiento y reseñas. Es relevante para cualquiera que entrene o adapte un modelo de lenguaje para turco y quiera un vocabulario específico del idioma en lugar de reutilizar uno multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador BPE de nivel de byte (byte-level BPE) |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | `tokenizer.json` y ficheros auxiliares de `transformers` (no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

El tokenizador implementa BPE de nivel de byte con las siguientes decisiones de diseño: alfabeto base de 256 bytes en bruto (lo que garantiza representación de cualquier entrada), vocabulario de 128.000 tokens, ausencia de normalizador (ni siquiera NFC, que el autor considera técnicamente con pérdida), preservación de mayúsculas y minúsculas para distinguir `Ankara` de `ankara`, y agrupación de dígitos en bloques de como máximo tres para evitar que el vocabulario memorice precios y años concretos. El vocabulario contiene unos 127.700 merges aprendidos además de los 256 tokens de byte y los tokens especiales.

La innovación principal respecto a los tokenizadores multilingües es la corrección del tratamiento del apóstrofo turco. El regex de pre-tokenización de cl100k y Llama 3 incluye la regla inglesa `'s|'t|'re|'ve|'m|'ll|'d`, que al aplicarse al turco rompe `İstanbul'da` en `İstanbul` + `'d` + `a`, separando el sufijo del nombre propio. El script de entrenamiento elimina esa regla y deja que el patrón `[^\r\n\p{L}\p{N}]?\p{L}+` mantenga `'da` como una unidad. El resto del patrón no cambia.

Los datos de entrenamiento son dos conjuntos públicos: `winvoker/turkish-sentiment-analysis-dataset` (columna `text`, 487.070 filas, etiquetas descartadas) y `kmkarakaya/turkishReviews-ds` (columna `review`, 398.832 filas), para un total de aproximadamente 200 millones de caracteres. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable al no tratarse de un modelo generativo.

## Capacidades

- Segmentación de texto turco en tokens con cobertura total: al ser de nivel de byte, ninguna entrada queda fuera del vocabulario y no existe el token `<unk>`.
- Representación reversible (round-trip) de cualquier cadena, incluidos caracteres fuera del alfabeto turco estándar, emojis y texto mixto.
- Manejo correcto del apóstrofo en nombres propios y sufijos turcos (`İstanbul'da`, `Ankara'ya`).
- Distinción de mayúsculas y minúsculas, incluida la pareja turca *i* / *ı*.
- Tokenización controlada de cifras (grupos de hasta tres dígitos) para reducir la memorización de números concretos.
- Integración directa con `transformers` mediante `AutoTokenizer.from_pretrained`.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de visión o audio: no es un modelo de lenguaje.

## Casos de uso

- Entrenamiento de un modelo de lenguaje específico para turco: el tokenizador sirve como base para preentrenar o continuar el preentrenamiento de un transformer con vocabulario de 128.000 tokens, lo que reduce la longitud media de secuencia frente a tokenizadores multilingües y, con ello, el coste de atención.
- Ajuste fino de modelos existentes con vocabulario adaptado: en pipelines de adaptación de dominio para turco, sustituir el tokenizador original por este permite medir el impacto en la fertilidad (tokens por palabra) antes de reentrenar embeddings.
- Preprocesado de reseñas y análisis de sentimiento: los datos de entrenamiento provienen precisamente de reseñas y textos de opinión, por lo que el vocabulario cubre el registro informal y las flexiones habituales de este dominio.
- Indexación y búsqueda léxica en turco: la tokenización reversible y sin pérdidas permite construir índices invertidos o sistemas de búsqueda que reconstruyan el texto original sin ambigüedad.
- Evaluación comparativa de tokenizadores: sirve como referencia para medir la eficiencia de tokenización (tokens por palabra, compresión en bytes) frente a cl100k, Llama 3 o Qwen 3 sobre corpus turcos.
- Investigación en morfología computacional: la agrupación de sufijos y la política de dígitos facilitan experimentos sobre segmentación morfológica y sobre el efecto del vocabulario en tareas downstream en lenguas aglutinantes.
- Despliegue en pipelines de NLP en producción con `transformers`: al ser un tokenizador puro, se puede ejecutar en CPU sin requisitos de GPU y con latencia despreciable frente a la inferencia del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de fertilidad (tokens por palabra), comparativas de compresión con otros tokenizadores ni evaluaciones downstream.

## Requisitos de hardware

- VRAM: no aplica; es un tokenizador y se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier equipo, incluidos portátiles y entornos sin GPU.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), la librería `tokenizers` de Hugging Face de forma nativa, y cualquier runtime que cargue `tokenizer.json` (por ejemplo, servidores de inferencia que acepten tokenizadores de Hugging Face).
- Latencia y throughput: no se han publicado mediciones. Al operar sobre tablas de merges en memoria, el coste es de microsegundos por secuencia corta y escala de forma aproximadamente lineal con la longitud del texto.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Nivel de byte | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `veripazari/turkish_bpe_128k` | 128.000 | Sí | Turco | Apache 2.0 | Corrección del apóstrofo turco; sin `<unk>` |
| `erenyanic/turkish_bpe_128k` (original) | 128.000 | Sí | Turco | Apache 2.0 | Mismo artefacto; esta réplica lo archiva |
| Tokenizador de Llama 3 | 128.256 | Sí | Multilingüe | Licencia Llama 3 | Regla inglesa de apóstrofo que rompe sufijos turcos |
| Tokenizador cl100k (GPT-4) | ~100.000 | Sí | Multilingüe | Propietaria | Misma limitación con el apóstrofo turco |
| Tokenizador de Qwen 3 | ~151.000 | Sí | Multilingüe | Apache 2.0 | Mayor vocabulario, sin ajuste específico al turco |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no responde a instrucciones. Solo segmenta texto.
- El vocabulario está optimizado para turco; su eficiencia sobre otros idiomas no está documentada y probablemente sea inferior a la de tokenizadores multilingües.
- Los datos de entrenamiento proceden de dos conjuntos de reseñas y análisis de sentimiento, por lo que el registro cubierto es informal y orientado a opinión; el vocabulario puede no representar óptimamente texto técnico, legal o científico.
- La licencia Apache 2.0 permite uso comercial, pero conviene conservar los avisos de atribución al autor original (`erenyanic`) y a la plataforma que archiva la réplica (`veripazari`).
- Esta publicación es una réplica archivada: la fuente canónica y el código de entrenamiento están en el repositorio del autor original. Verificar que el `tokenizer.json` coincide con el original antes de usarlo en producción.
- No se documentan sesgos lingüísticos ni de dominio; al derivarse de reseñas de usuarios, el vocabulario puede infrarrepresentar variantes dialectales y registros formales.
- No se han publicado evaluaciones de fertilidad ni comparativas cuantitativas con otros tokenizadores, por lo que no es posible afirmar mejoras medibles sin hacer la medición por cuenta propia.

## Enlaces

- Hugging Face (réplica): https://huggingface.co/veripazari/turkish_bpe_128k
- Hugging Face (original): https://huggingface.co/erenyanic/turkish_bpe_128k
- Repositorio de entrenamiento: https://github.com/ErenYanic/eldamar-tokenizer
- Script de entrenamiento: https://github.com/ErenYanic/eldamar-tokenizer/blob/main/turkish_bpe_128k/train_tokenizer.py
- Dataset de análisis de sentimiento: https://huggingface.co/datasets/winvoker/turkish-sentiment-analysis-dataset
- Dataset de reseñas: https://huggingface.co/datasets/kmkarakaya/turkishReviews-ds
- Librería `tokenizers`: https://github.com/huggingface/tokenizers
- Plataforma VeriPazarı: https://veripazari.com.tr
