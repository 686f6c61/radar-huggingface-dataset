# WaveCut/Qwen3.8-Flash-Next-ngram-table-NInfer-v3

## Resumen

Qwen3.8-Flash-Next-ngram-table-NInfer-v3 no es un modelo completo, sino un artefacto auxiliar para el motor de inferencia NInfer: la tabla de n-gramas de la capa de embedding por capa (per-layer embedding, PLE) de la familia Qwen3.8-Flash-Next. Publicada por el usuario WaveCut, contiene 320.001.536 filas de 160 valores (51.200 millones de parámetros en total) que codifican 16 cabezas hash sobre los n-gramas de 2 y 3 tokens del contexto. El modelo base del que deriva es la cuantización GGUF GSQ-RCO de ISTA-DASLab.

La relevancia del artefacto es puramente operativa: cualquier conversión NInfer de Qwen3.8-Flash-Next publicada sin su tabla lee las filas desde este fichero, de modo que sin él el modelo no arranca. El autor documenta que, sin la tabla, la perplejidad en WikiText-2 de la release Q2_0 casi se duplica (de 2,66 a 5,01), lo que confirma que la PLE forma parte del entrenamiento original y no es un componente opcional.

El fichero ocupa 28.905.035.512 bytes (26,92 GiB) y se distribuye en formato propietario `.ninfer` (v3), legible únicamente por la rama `master` de iamwavecut/ninfer-all a partir del commit `82f120de`. La licencia declarada es la qwen-community-license-1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tabla de n-gramas para la capa de embedding por capa (PLE) de Qwen3.8-Flash-Next; 16 cabezas hash sobre n-gramas de 2 y 3 tokens |
| Parametros totales | 51.200 millones (320.001.536 filas x 160 valores) |
| Parametros activos | no aplica (no es un MoE; es un artefacto de tabla) |
| Longitud de contexto | no disponible en el artefacto (el ejemplo de ejecución usa `--max-context 32768` para el modelo servido) |
| Tipos de cuantizacion | filas en bloques IQ4_NL (90 bytes por fila), copiadas byte a byte de ISTA-DASLab |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.ninfer` v3 (NInfer), 28.905.035.512 bytes; incluye `SHA256SUMS`, `NOTICE`, `LICENSE` y perfil `broad-v1.hot` |

## Arquitectura y entrenamiento

El artefacto materializa la tabla de n-gramas asociada a la PLE de Qwen3.8-Flash-Next. La tabla contiene 320.001.536 filas de 160 valores cada una, organizadas en 16 cabezas hash que operan sobre los n-gramas de 2 y 3 tokens del contexto; cada cabeza coloca sus filas en su propio offset. En cada paso de decodificación, el token lee las 16 filas direccionadas por sus n-gramas, lo que equivale a 1,4 KB por token en residencia por disco.

Las filas son los bloques IQ4_NL de ISTA-DASLab (`per_layer_token_embd` de sus releases GGUF), copiados sin modificar: el segundo shard de cada release GSQ-RCO, incluida la build Coder, es el mismo fichero. El componente `ngram` del contenedor registra las constantes hash, el formato de fila y el SHA-256 de las filas (`dd55c28902f38cd88134b2a569c51282c5ffce30080487e1a645740115c56cc3`), que es como un modelo identifica la tabla que necesita.

La actualización añade un perfil opcional de ranking de filas (`broad-v1.hot`, 104.893.176 bytes, un 0,364 % adicional del contenedor) construido sobre cuatro shards fijados de Common Corpus y uno de github-code-clean, con techos de tokens por grupo y separación entre documentos de entrenamiento y de validación. El autor indica explícitamente que este perfil selecciona filas cacheadas y no modifica los pesos ni establece mejoras de calidad de respuesta. No se documenta en la información disponible ningún proceso de RLHF, DPO ni datos de preentrenamiento del modelo subyacente.

## Capacidades

- Proporciona la capa de embedding por capa (PLE) basada en n-gramas que Qwen3.8-Flash-Next espera en tiempo de inferencia.
- Suministra las 16 lecturas de fila por token que el modelo realiza en cada paso de decodificación.
- Permite ejecutar cualquier conversión NInfer de la familia Qwen3.8-Flash-Next publicada sin tabla propia (Q2_0, IQ3_S y Coder IQ1_M).
- Compatible con tablas de otras geometrías y formatos de fila a partir del commit `57395b20b` de ninfer-all, con aviso cuando la tabla no coincide con la declarada por el modelo.
- El perfil `broad-v1.hot` permite seleccionar filas cacheadas sobre un corpus determinista de prosa, web, prensa, ciencia y código.
- No incorpora por sí mismo capacidades de generación, razonamiento, código, visión, tool calling ni agentes: esas capacidades residen en el modelo Qwen3.8-Flash-Next al que acompaña.

## Casos de uso

- Despliegue de Qwen3.8-Flash-Next en NInfer: el artefacto se descarga junto a la conversión del modelo y se pasa con `--ngram-table`; sin él, `ninfer-serve` rechaza el arranque, por lo que es un requisito operativo en cualquier puesta en producción.
- Servicio con residencia en disco: con la residencia por defecto, cada token lee sus 16 filas (1,4 KB) a través de la caché de páginas del sistema operativo, de modo que la tabla puede alojarse en cualquier disco sin cargar 26,92 GiB en memoria.
- Servicio con residencia en RAM: `--ngram-residency ram` carga la tabla completa en memoria para escenarios donde se prioriza la latencia de lectura de filas sobre el consumo de RAM.
- Despliegue en contenedor: la imagen Docker de ninfer-all acepta los mismos flags tras `serve`, con ambos ficheros montados en `/models`, lo que facilita pipelines reproducibles con `--ulimit memlock=-1` y volumen de caché.
- Recuperación de conversiones huérfanas: las releases Q2_0, IQ3_S y Coder IQ1_M publicadas sin tabla leen sus filas desde este fichero, lo que permite reutilizarlas sin reconvertir el modelo.
- Sustitución de tablas en modelos Edge0: los modelos de Edge0 pueden leer esta tabla en lugar de su tabla FP8, con un aumento de perplejidad de entre el 0,6 % y el 1,2 %, útil para escenarios con restricciones de formato.
- Perfilado de caché por dominio: el perfil `broad-v1.hot` permite seleccionar filas cacheadas sobre un corpus que cubre prosa, web, prensa, ciencia y código, útil para ajustar la política de caché a la carga real.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad WikiText-2, Q2_0 con tabla | 2,66 |
| Perplejidad WikiText-2, Q2_0 sin tabla (`--no-ngram-table`) | 5,01 |
| Perplejidad con tabla FP8 sustituida por esta (modelos Edge0) | +0,6 % a +1,2 % |
| Tamano del fichero | 28.905.035.512 bytes (26,92 GiB) |
| Lectura por token | 16 filas, 1,4 KB |
| Filas | 320.001.536 de 160 valores |
| Bytes por fila | 90 (bloques IQ4_NL) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica directamente al artefacto; la tabla se lee desde disco por defecto y solo consume RAM si se activa `--ngram-residency ram` (26,92 GiB).
- GPU: el ejemplo de ejecución usa `--gpus all` en Docker; no se especifican modelos de GPU concretos en la información disponible.
- Consumer GPU: no disponible; el requisito depende del modelo Qwen3.8-Flash-Next al que acompaña, no de la tabla.
- Almacenamiento: cualquier disco sirve con la residencia por defecto, ya que cada token lee 1,4 KB a través de la caché de páginas. Con residencia en RAM se necesitan al menos 26,92 GiB de memoria libre.
- Despliegue: `ninfer-serve` con `--ngram-table`, o la imagen `ghcr.io/iamwavecut/ninfer-all` con los ficheros en `/models`. Es obligatorio compilar la rama `master` desde el commit `82f120de` o posterior; las builds estándar de NInfer no pueden leerlo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Artefacto | Contenido | Tamano | Formato | Licencia |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-ngram-table-NInfer-v3 (este) | Tabla PLE de Qwen3.8-Flash-Next, filas IQ4_NL | 26,92 GiB | `.ninfer` v3 | qwen-community-license-1.0 |
| WaveCut/Edge0-ngram-table-FP8-NInfer-v3 | Tabla PLE de la familia Edge0, filas FP8 | no disponible | `.ninfer` v3 | no disponible |
| Conversiones GSQ-RCO de ISTA-DASLab (Q2_0, IQ3_S, Coder IQ1_M) | Pesos cuantizados del modelo, sin tabla | no disponible | GGUF | no disponible |

La comparación con modelos completos de la misma categoría no es aplicable: este repositorio es un componente auxiliar, no un modelo generativo.

## Limitaciones y advertencias

- No es un modelo utilizable de forma autónoma: sin los pesos de Qwen3.8-Flash-Next no genera texto ni ejecuta ninguna tarea.
- Solo lo leen las builds de NInfer de la rama `master` desde el commit `82f120de`; las builds estándar fallan al cargarlo.
- Arrancar el modelo sin la tabla (`--no-ngram-table`) es un modo experimental no estándar, avisado en el arranque, sin uso práctico y con perplejidad casi duplicada (2,66 a 5,01 en WikiText-2 para Q2_0).
- El perfil `broad-v1.hot` no modifica pesos ni garantiza mejoras de calidad; solo selecciona filas cacheadas. Las etiquetas de idioma del corpus son automáticas y la muestra no constituye un inventario completo de idiomas ni una estimación de tráfico real.
- La deduplicación exacta de fragmentos no elimina todos los cuasi-duplicados del corpus del perfil.
- La licencia qwen-community-license-1.0 impone restricciones de uso comercial que deben revisarse en el fichero `LICENSE` antes de desplegar en producción.
- No se dispone de información sobre sesgos, riesgo de alucinación ni cobertura idiomática del modelo subyacente en la documentación del artefacto.
- El SHA-256 de las filas debe coincidir con el que declara el modelo; una tabla de geometría o constantes hash distintas provoca un aviso y puede degradar la perplejidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-ngram-table-NInfer-v3
- Modelo base (GGUF GSQ-RCO): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor NInfer: https://github.com/Neroued/ninfer
- Rama ninfer-all: https://github.com/iamwavecut/ninfer-all
- Commit mínimo requerido: https://github.com/iamwavecut/ninfer-all/commit/82f120dece4de7e411fc8815fb0d3cc34706fa3e
- Commit de lectura de tablas heterogéneas: https://github.com/iamwavecut/ninfer-all/commit/57395b20b4ee9c4ac792146d82ffac6b28396a9b
- Documentación Docker: https://github.com/iamwavecut/ninfer-all#docker
- Conversión Q2_0: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-GSQ-RCO-Q2_0-NInfer-v3
- Conversión IQ3_S: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_S-NInfer-v3
- Conversión Coder IQ1_M: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-GSQ-RCO-Coder-IQ1_M-NInfer-v3
- Tabla FP8 de Edge0: https://huggingface.co/WaveCut/Edge0-ngram-table-FP8-NInfer-v3
- Corpus Common Corpus: https://huggingface.co/datasets/PleIAs/common_corpus
- Corpus github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
