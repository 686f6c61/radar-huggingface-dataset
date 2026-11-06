# Vel04/merzal-tamil-tokenizer-32k

## Resumen

Merzal Tamil Tokenizer 32K es un tokenizador de primera generación con un vocabulario de 32.000 piezas, desarrollado por Vel04 y publicado bajo licencia Apache-2.0. No es un modelo de lenguaje, sino el artefacto de tokenización empleado para empaquetar el corpus de preentrenamiento en tamil de un modelo de 350M de parámetros. Se conserva en Hugging Face exclusivamente por reproducibilidad de un experimento de 2026, y el propio autor lo marca como artefacto de investigación obsoleto, no apto para producción.

Técnicamente emplea un modelo Unigram con byte fallback y normalización NFC, con un `model_max_length` declarado de 32.768 tokens. Su sucesor, el Merzal Tamil Tokenizer de 64K, es más eficiente sobre texto (1,693 tokens por palabra frente a 1,853) y corrige el defecto de espacios iniciales que arrastra esta versión. Aun así, este 32K sigue siendo sustancialmente mejor que tokenizadores generalistas para tamil: 1,853 frente a 2,357 tokens por palabra de Gemma-4, y corta 240 veces menos letras tamil (0,05% frente a 12,0%).

Su relevancia actual es limitada y acotada: sirve para reproducir exactamente el pipeline de tokenización de un run de preentrenamiento concreto. Para cualquier uso nuevo en tamil se recomienda el release de 64K, que es más compacto, exacto en espacios en blanco y de diseño idéntico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador Unigram con byte fallback y normalización NFC |
| Parametros totales | no disponible (no es un modelo neural; vocabulario de 32.000 piezas) |
| Parametros activos | no aplica |
| Longitud de contexto | 32.768 tokens (`model_max_length` en `tokenizer_config.json`) |
| Tipos de cuantizacion | no aplica (artefacto de tokenización) |
| Idiomas soportados | tamil (ta), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `tokenizer.json` (formato Hugging Face Tokenizers), más `tokenizer_config.json`, `special_tokens_map.json`, `metadata.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El artefacto es un tokenizador Unigram de 32.000 piezas con byte fallback, lo que garantiza que cualquier secuencia de bytes pueda representarse sin tokens `<unk>` en la práctica. Aplica normalización NFC, relevante para el tamil por la composición de signos vocálicos y consonánticos. Incluye seis tokens especiales: `<pad>=0`, `<s>=1`, `</s>=2`, `<unk>=3`, `<|user|>=4` y `<|assistant|>=5`. No incorpora tokens de herramienta, de chat adicionales ni tokens de secuencias de espacios.

El vocabulario se construyó a partir de los mismos corpus que el release de 64K, según indica la model card, sin redistribuir texto de los corpus. No se documentan en la información disponible el número de tokens de entrenamiento del tokenizador, la composición exacta del dataset ni detalles del algoritmo de poda del vocabulario Unigram. El SHA256 del artefacto es `bbedd9c0e6b993f1b9b2505a8991219bae3539ad44794e92e86a3c1e0506ee07`. La evaluación reportada se realizó sobre un único corpus de held-out (FineWeb-2 `tam_Taml` / `test`, 20.000 documentos, 40,2M caracteres, 4,49M palabras) sin evaluación downstream.

## Capacidades

- Tokenización de texto en tamil e inglés con vocabulario Unigram de 32.000 piezas.
- Byte fallback: representación de cualquier byte de entrada sin pérdida de información a nivel de bytes.
- Round-trip exacto al 100% en los documentos del corpus de evaluación (previamente recortados de espacios).
- Normalización NFC aplicada a la entrada.
- Eficiencia sobre tamil notablemente superior a tokenizadores generalistas: 1,853 tokens por palabra frente a 2,357 de Gemma-4.
- Baja tasa de corte de letras tamil: 0,05% frente al 12,0% de Gemma-4.
- Soporte de tokens de chat básicos (`<|user|>`, `<|assistant|>`), sin tokens de herramienta ni reservados.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento: es un tokenizador, no un modelo generativo.

## Casos de uso

- Reproducibilidad de experimentos: permite reconstruir exactamente la tokenización del run de preentrenamiento de 350M en tamil, de modo que los resultados publicados puedan verificarse byte a byte con el mismo artefacto y los mismos hashes.
- Auditoría de pipelines de datos: al conservar el `tokenizer.json` original con SHA256 verificable, sirve para comparar cómo evoluciona la tokenización entre la versión 32K y la 64K sobre un mismo corpus y cuantificar la diferencia de 8,6% en número de tokens.
- Baseline en investigación de tokenizadores: útil como referencia de primera generación al evaluar nuevos tokenizadores para lenguas dravídicas, ya que sus métricas sobre FineWeb-2 están publicadas con intervalos de confianza al 95%.
- Análisis de eficiencia multilingüe: permite medir el coste en tokens de mezclar tamil e inglés en un mismo corpus, dado que el vocabulario cubre ambos idiomas, y comparar con alternativas generalistas como Gemma-4.
- Docencia y experimentación con Unigram: al ser un artefacto pequeño y autocontenido con byte fallback y NFC, resulta adecuado para ilustrar el funcionamiento de la tokenización subword en lenguas con escritura abugida.
- Verificación de integridad de artefactos: los ficheros `metadata.json` y `SHA256SUMS` permiten integrar comprobaciones de checksum en pipelines de CI que validen la cadena de custodia de los datos de entrenamiento.

## Benchmarks y rendimiento

Resultados sobre el mismo corpus independiente de held-out: FineWeb-2 `tam_Taml` / `test`, 20.000 documentos, 40,2M caracteres, 4,49M palabras.

| Tokenizador | Tokens por palabra | IC 95% | Letras cortadas | Round-trip exacto |
|---|---|---|---|---|
| Merzal Tamil Tokenizer (64K) | 1,693 | [1,690, 1,696] | 0,04% | 100% |
| Merzal Tamil Tokenizer 32K (este) | 1,853 | [1,849, 1,857] | 0,05% | 100% |
| gemma-4 (262k) | 2,357 | [2,353, 2,361] | 12,0% | 100% |

El modelo de 64K necesita un 8,6% menos de tokens para el mismo texto tamil; este 32K necesita un 9,5% más. No se han publicado resultados de benchmarks downstream (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: despreciable. El artefacto es un fichero `tokenizer.json` de vocabulario 32.000; cabe holgadamente en memoria de cualquier equipo.
- GPU recomendadas: no requiere GPU. La tokenización se ejecuta en CPU con la librería `tokenizers` o con `AutoTokenizer` de Transformers.
- Cabe en cualquier GPU consumer y en entornos sin GPU (CI, contenedores ligeros, portátiles).
- Opciones de despliegue: `tokenizers` (carga directa de `tokenizer.json`), `transformers` (`AutoTokenizer` con `PreTrainedTokenizerFast`). No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Tokenizador | Vocabulario | Tokens por palabra (tamil) | Letras cortadas | Licencia | Estado |
|---|---|---|---|---|---|
| Merzal Tamil Tokenizer 32K | 32.000 | 1,853 | 0,05% | Apache-2.0 | Legacy, no producción |
| Merzal Tamil Tokenizer 64K | 64.000 | 1,693 | 0,04% | Apache-2.0 (según model card del sucesor) | Recomendado |
| gemma-4 | 262.000 | 2,357 | 12,0% | Términos de Gemma (no verificados en la información disponible) | Generalista |

La comparación se limita a eficiencia de tokenización sobre tamil; no hay datos de rendimiento downstream que permitan comparar calidad de modelado.

## Limitaciones y advertencias

- Defecto conocido de espacios iniciales: usa `Metaspace(prepend_scheme="always")`, por lo que el primer espacio de una cadena se consume con el marcador de prefijo. `decode(encode(" x"))` devuelve `"x"` y `decode(encode("  "))` devuelve `" "`. Los espacios interiores y finales sí se preservan. El round-trip del 100% reportado no ejercita esta ruta porque los documentos se recortan antes de codificar.
- Artefacto legacy: el autor lo declara explícitamente no apto para producción y lo considera superado por el release de 64K.
- Evaluación limitada: las métricas provienen de un único corpus de held-out, sin evaluación downstream; el propio autor remite a `METHODS.md` para el protocolo y las amenazas a la validez.
- Sin tokens de herramienta ni reservados: no es adecuado para pipelines de function calling o agentes que dependan de tokens especiales dedicados.
- Cobertura lingüística restringida a tamil e inglés; no se documenta comportamiento en otras lenguas.
- Riesgo de sesgo: no se documenta análisis de sesgos en la información disponible; al derivarse de corpus web (FineWeb-2), puede heredar sesgos de dichas fuentes.
- Licencia Apache-2.0 permite uso comercial, pero se distribuye "AS IS" sin garantías (sección 7); el texto de los corpus no se redistribuye y la atribución de datos está en `NOTICE`.

## Enlaces

- Hugging Face: https://huggingface.co/Vel04/merzal-tamil-tokenizer-32k
- Repositorio GitHub (protocolo y validez): https://github.com/mvel95942-source/merzal-tamil-tokenizer/blob/main/METHODS.md
- Repositorio GitHub (raíz): https://github.com/mvel95942-source/merzal-tamil-tokenizer
