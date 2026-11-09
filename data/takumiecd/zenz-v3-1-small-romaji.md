# takumiecd/zenz-v3.1-small-romaji

## Resumen

zenz-v3.1-small-romaji es un modelo de lenguaje especializado en conversion de romaji (transcripcion latina del japones) a kana-kanji, desarrollado por el usuario takumiecd como ajuste fino experimental del modelo Miwa-Keita/zenz-v3.1-small. Resuelve un problema concreto en el contexto de los metodos de entrada (IME) japoneses: permitir que el usuario escriba en caracteres latinos sin preprocesar a katakana, y que el modelo produzca directamente la conversion a kanji y kana correctos. No es un lanzamiento oficial del autor original de zenz.

El modelo parte de una arquitectura GPT-2 con 90.450.432 parametros y ha sido sometido a full fine-tuning sobre los 90 millones de parametros. Utiliza los tokens separadores propios de zenz para delimitar la lectura y el contexto izquierdo, y mantiene el vocabulario original de 6.000 tokens sin ampliarlo. La ventana de trabajo practica es de 512 tokens totales, con un maximo de 128 tokens generados y 96 tokens de contexto izquierdo.

Es relevante porque explora una via distinta a la habitual (convertir romaji a katakana y luego pasar al modelo base): en la evaluacion propia del autor, la entrada directa en romaji alcanza un CER medio de 9,18% en validacion y 8,14% en test, aunque el autor advierte que esto no demuestra superioridad frente al enfoque de preprocesado a katakana. El modelo es pequeno (0,4 GB), se ejecuta en CPU y esta pensado como pieza experimental para IME, no como modelo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 90.450.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens totales (hasta 384 de entrada, 128 de generacion, maximo 96 de contexto izquierdo) |
| Tipos de cuantizacion | pesos publicados en FP32 safetensors; no se documentan otras cuantizaciones |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT-2 con 90.450.432 parametros, derivado de Miwa-Keita/zenz-v3.1-small (revision `344612e331bf3ba752a9bfef6633c93c6b933ebb`). Se ha realizado full fine-tuning sobre la totalidad de los parametros, sin congelar capas ni anadir embeddings. El vocabulario original de 6.000 tokens y los IDs se mantienen intactos; solo se ha ajustado el backend del tokenizer (BPE con `unk_token` y `fuse_unk=false`) para evitar la perdida de bytes desconocidos, y se han alineado los IDs especiales a BOS=2, EOS=3, UNK=0, PAD=1, con `use_cache=true` para inferencia.

El entrenamiento usa como datos el dataset Miwa-Keita/zenz-v2.5-dataset (revision `7d9c9ea36347b638a627c1d264da48ebc7eb38aa`, fichero `train_llm-jp-corpus-v3.jsonl`), tomando la salida original como objetivo sin destilacion ni generacion por profesor. Se seleccionaron 836.762 fuentes de lectura de 2 a 80 caracteres y se genero una variante romaji por fuente con mezcla controlada: 30% Hepburn, 30% Kunrei y 40% mixta, incluyendo variantes de `shi/si`, `chi/ti`, `x/l`, `n/nn/n'`, sokuon y yoon, aceptando solo grafias que revierten a la lectura original. A estas se anadieron 93.443 ejemplos en katakana (probabilidad 1/9), resultando 930.205 ejemplos con aproximadamente un 90% de romaji, usados durante 2 epochs.

La configuracion de entrenamiento fue: batch efectivo 128 (micro 64, acumulacion 2), optimizador fused AdamW con LR 3e-5, weight decay 0,01, clip norm 1, warmup 3% y decaimiento coseno hasta 0,1x del LR inicial, precision FP32 con autocast BF16, longitud de secuencia 512, seed 42. Se ejecuto en una A100 80GB PCIe (MIG 3g.40gb) durante aproximadamente 2 horas y 11 minutos, con 14.536 pasos de optimizador. La perdida enmascara la entrada y solo computa sobre la salida y el token EOS, ponderando por numero de tokens.

## Capacidades

- Conversion directa de romaji a kana-kanji sin preprocesado a katakana: acepta Hepburn (`shinbun`), Kunrei (`sinnbunn`) y mezclas.
- Conversion desde katakana a kana-kanji, aunque con cierta degradacion respecto al modelo base (CER de 5,40% en validacion y 3,89% en test frente a 4,58% y 3,29% del base).
- Uso de contexto izquierdo de hasta 96 tokens para desambiguar la conversion, mediante el token separador `\uee02`.
- Generacion determinista con greedy decoding (beam=1) como configuracion recomendada.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de conversion, no un asistente.
- No tiene modo thinking, vision ni audio.
- Multilingue limitado al japones; no se documenta soporte de otras lenguas.

## Casos de uso

- Motor de conversion en IME japones: el modelo recibe la cadena romaji tecleada por el usuario y devuelve la conversion a kana-kanji en tiempo real. Su tamano (90M parametros, 0,4 GB) permite ejecucion en CPU y baja latencia, adecuada para integrarse en un cliente de escritorio.
- Prototipado de metodos de entrada en navegador o aplicaciones ligeras: al funcionar en CPU con PyTorch y sin `trust_remote_code`, se puede empaquetar en un servicio local sin GPU.
- Evaluacion comparativa de enfoques de conversion: util como referencia para contrastar la via "romaji directo" frente a la via "romaji a katakana y luego modelo base", tal como el propio autor plantea.
- Investigacion sobre romanizacion y normalizacion: el modelo documenta de forma explicita la mezcla Hepburn/Kunrei y las reglas de reversibilidad, lo que sirve como base para estudios de variacion ortografica.
- Generacion de datos sinteticos de pares romaji-japones: dado un corpus de lecturas, se pueden producir conversiones para aumentar datasets de IME, con la cautela de que la calidad depende del dominio.
- Pruebas de integracion de pipelines de IME en entornos CI: su reducido tamano permite incluirlo en tests automatizados de conversion sin coste de GPU.
- Experimentacion docente: ejemplo compacto y reproducible de full fine-tuning sobre GPT-2 con dataset publico y condiciones documentadas paso a paso.

## Benchmarks y rendimiento

Evaluacion propia del autor sobre un holdout de adaptacion (no es AJIMEE-Bench ni la evaluacion oficial de zenz). Greedy decoding, beam=1, maximo 128 tokens generados, contexto izquierdo maximo 96 tokens, sin normalizacion de cadenas, una unica respuesta correcta.

| Entrada | Validation CER (427) | Test CER (430) | Test coincidencia exacta de frase |
|---|---:|---:|---:|
| Romaji Hepburn | 9,20% | 8,12% | 243/430 (56,51%) |
| Romaji Kunrei | 9,18% | 8,02% | 246/430 (57,21%) |
| Romaji mixto | 9,17% | 8,28% | 244/430 (56,74%) |
| Katakana | 5,40% | 3,89% | 308/430 (71,63%) |

La media de CER de las tres condiciones romaji es 9,18% en validacion y 8,14% en test. Las tres variantes provienen de las mismas 430 fuentes, por lo que no son 1.290 fuentes independientes. El modelo base zenz-v3.1-small obtiene CER de katakana de 4,58% (validacion) y 3,29% (test), lo que indica una ligera degradacion en katakana tras el ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,4 GB de pesos mas memoria de activaciones; cabe holgadamente en cualquier GPU consumer.
- Ejecucion en CPU viable: el ejemplo del autor funciona en CPU sin GPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre (GTX 1650, RTX 3060, RTX 4090, A100, H100); no requiere GPU de datacenter.
- Despliegue: transformers con PyTorch 2.8.0 y Transformers 4.57.6 segun el autor; compatible con text-generation-inference y endpoints_compatible segun los tags del repo. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor indica que el ejemplo corre en CPU, pero no publica cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| takumiecd/zenz-v3.1-small-romaji | 90.450.432 | 512 tokens (384 entrada + 128 generacion) | Conversion romaji/katakana a kana-kanji | CC BY-SA 4.0 | Hugging Face |
| Miwa-Keita/zenz-v3.1-small | no disponible en la informacion | no disponible | Conversion katakana a kana-kanji (modelo base) | CC BY-SA 4.0 (heredada) | Hugging Face |
| zenz oficial (familia) | no disponible | no disponible | Conversion kana-kanji para IME | no disponible | Hugging Face |

La comparativa se limita al modelo base y a la familia zenz porque no se han proporcionado datos de otros modelos de conversion para IME. No se dispone de cifras de parametros ni contexto del modelo base en la informacion facilitada.

## Limitaciones y advertencias

- No es un lanzamiento oficial del autor de zenz; es un experimento independiente y no cuenta con aprobacion del autor original.
- El autor advierte explicitamente que la evaluacion no demuestra que el romaji directo sea mejor que convertir romaji a katakana y usar el modelo base.
- Degradacion en katakana respecto al base: CER sube de 4,58% a 5,40% en validacion y de 3,29% a 3,89% en test.
- El CER en romaji (8,12% en test) es notablemente superior al de katakana (3,89%), lo que implica una tasa de error considerable en uso real.
- La separacion entre train, validation y test no garantiza aislamiento por ID de documento, y no se descarta solapamiento con datos de entrenamiento del modelo base.
- El holdout es propio del autor y no equivale a AJIMEE-Bench ni a la evaluacion oficial de zenz; los resultados no son directamente comparables con la literatura.
- No hay garantia de rendimiento en uso real de IME, nombres propios o dominios no vistos.
- El modelo no es conversacional: la entrada debe usar los tokens separadores de zenz (`\uee00`, `\uee01`, `\uee02`); un prompt de chat convencional no producira resultados validos.
- Licencia CC BY-SA 4.0: permite uso comercial pero obliga a compartir bajo la misma licencia las obras derivadas y a atribuir; conviene revisar las obligaciones antes de integrarlo en producto.
- Los datos de entrenamiento derivan de llm-jp-corpus-v3 (Common Crawl, ODC-BY y terminos de Common Crawl), con los sesgos y ruido propios de un corpus web.
- Riesgo de alucinacion en la conversion: el modelo puede producir kanji plausibles pero incorrectos, especialmente en lecturas ambiguas o poco frecuentes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/takumiecd/zenz-v3.1-small-romaji
- Modelo base: https://huggingface.co/Miwa-Keita/zenz-v3.1-small
- Dataset de entrenamiento: https://huggingface.co/datasets/Miwa-Keita/zenz-v2.5-dataset
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Corpus llm-jp-corpus-v3: https://gitlab.llm-jp.nii.ac.jp/datasets/llm-jp-corpus-v3
- Licencia ODC-BY: https://opendatacommons.org/licenses/by/1-0/
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
