# YozoraKurage/Hoshiyomi-zenz-v3.2-small_v6

## Resumen

Hoshiyomi-zenz-v3.2-small_v6 es un ajuste fino (finetune) del modelo zenz-v3.2-small, un GPT-2 a nivel de caracter disenado especificamente para la conversion kana-kanji (かな漢字変換) en motores de IME japones. Lo desarrolla YozoraKurage como parte del proyecto Hoshiyomi, un IME japones que funciona sin conexion (offline). El modelo parte de Miwa-Keita/zenz-v3.2-small-gguf y se ha reentrenado mediante LoRA para mejorar un aspecto concreto: la conversion de lecturas en kana a nombres escritos en alfabeto latino (iPhone, GitHub, Tailscale, etc.), cubriendo un conjunto de 501 alias en ingles.

La relevancia de este modelo es muy acotada pero clara: no es un modelo de proposito general, sino un componente especializado de un motor de conversion de entrada. Con 2.359.296 parametros totales y un repo de 0,1 GB, esta pensado para ejecutarse localmente en un IME de escritorio, sin llamadas de red. La innovacion principal respecto a la version anterior (v4, no publicada) es la mejora en la identificacion de nombres en alfabeto latino dentro de frases: del 52,5 % al 67,7 % en el banco de pruebas latin-names-in-sentences.

El modelo se distribuye en formato GGUF (cuantizacion Q5_K_M) y como adaptador LoRA en f16 que se superpone al zenz-v3.2-small original. La licencia es Apache 2.0, heredada del modelo base. Su uso esta pensado para integrarse en el motor de conversion de Hoshiyomi o en cualquier pipeline que use llama.cpp con el mismo protocolo de entrada que zenz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 a nivel de caracter (zenz), transformer decoder-only |
| Parametros totales | 2.359.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40 caracteres de contexto izquierdo en el formato de entrenamiento (no disponible como ventana formal del modelo) |
| Tipos de cuantizacion | Q5_K_M (pesos publicados); adaptador LoRA en f16; la app recompone a 8 bits |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos Q5_K_M y adaptador LoRA f16) |

## Arquitectura y entrenamiento

El modelo base zenz-v3.2-small es un GPT-2 a nivel de caracter orientado a la conversion kana-kanji, con un formato de entrada propio basado en tokens especiales: `U+EE02` + contexto izquierdo + `U+EE00` + lectura en katakana + `U+EE01`, y salida terminada en `</s>`. Sobre esta base, Hoshiyomi-zenz-v3.2-small_v6 aplica un ajuste LoRA con rango 16, alpha 32 y dropout 0,05, dirigido a las proyecciones `c_attn`, `c_proj` y `c_fc`. El adaptador se fusiona posteriormente con el modelo base para producir los pesos finales.

El entrenamiento uso 637.000 lineas compuestas por replay (400.000), latin (100.000), katakana (53.000), swap (40.000), original (28.000) y repair (16.000), con 40 caracteres de contexto izquierdo. La funcion de perdida es entropia cruzada sobre la respuesta, con un termino KL (peso 1) contra el modelo base en las lineas de replay, latin y katakana. Se entreno con AdamW, learning rate 1e-4 con warmup de 300 pasos y decaimiento coseno, batch 64, una epoca (9.957 pasos), durante aproximadamente 22 minutos en una RTX 4080 SUPER de 16 GB. Los datos provienen de `train_llm-jp-corpus-v3.jsonl` del dataset Miwa-Keita/zenz-v2.5-dataset (parte ja_cc de llm-jp-corpus v3, derivada de Common Crawl CC-MAIN-2023-40, bajo ODC-BY 1.0 y terminos de Common Crawl) y de la lista `english-aliases.tsv` de Hoshiyomi (501 nombres). Se excluyeron del entrenamiento las lineas con solapamiento de 12 caracteres con los conjuntos de evaluacion AJIMEE-Bench y english-mixed.

## Capacidades

- Conversion kana-kanji para IME: dado un contexto izquierdo y una lectura en katakana, genera el texto japones convertido.
- Conversion de lecturas kana a nombres en alfabeto latino (501 alias como iPhone, GitHub o Tailscale), manteniendo la grafia latina.
- Manejo de palabras en katakana y vocabulario cotidiano japones.
- Procesamiento de contexto izquierdo de hasta 40 caracteres para desambiguar la conversion.
- Inferencia local sin conexion mediante llama.cpp u otros lectores de GGUF.
- No soporta tool calling, function calling, agentes, vision ni audio: es un modelo especializado de conversion de texto.

## Casos de uso

- IME japones de escritorio sin conexion: el modelo se carga en la app Hoshiyomi para ordenar candidatos de conversion en tiempo real, sin enviar pulsaciones a ningun servidor.
- Conversion de nombres de marcas y productos: al escribir la lectura en kana de un nombre en ingles, el modelo devuelve la grafia latina correcta, util en entornos donde se mezclan terminos tecnicos y japones.
- Procesamiento por lotes de textos japoneses: integrado en llama.cpp, puede convertir lecturas kana a kanji en pipelines de normalizacion de corpus o de transcripcion.
- Correccion de entradas mixtas: en flujos donde el usuario alterna katakana, kanji y latin, el modelo desambigua la conversion usando el contexto izquierdo.
- Desarrollo de motores de entrada personalizados: sirve como referencia de un finetune LoRA sobre zenz para quien quiera adaptar la conversion a un dominio concreto (por ejemplo, nombres propios de una organizacion).
- Evaluacion comparativa de conversores: sus conjuntos de prueba publicados (AJIMEE-Bench, english-mixed, katakana-words) permiten medir y comparar variantes de conversion kana-kanji en un entorno reproducible.

## Benchmarks y rendimiento

Evaluacion realizada con el motor de conversion de Hoshiyomi (Rust, con diccionario), 8 inferencias de IA, reproduciendo el modo de escritura, en Mac, con el commit del motor `787f061220cd8d0ae9884b65551405e47ebbb7a7` (2026-10-21).

| Conjunto de evaluacion | Preguntas | Top-1 | Top-5 |
|---|---|---|---|
| AJIMEE-Bench (JWTD v2) | 200 | 86,5 % | 87,0 % |
| Entradas con palabras en ingles (bench/english-mixed.jsonl) | 213 | 97,2 % | 97,7 % |
| Palabras en katakana (bench/katakana-words.jsonl) | 42 | 88,1 % | 92,9 % |
| Nombres en latin dentro de frases (bench/latin-names-in-sentences.jsonl) | 99 | 67,7 % | 78,8 % |
| Frases cotidianas (bench/everyday.jsonl) | 1.000 | 75,8 % | no disponible |
| Nombres de persona (bench/person-names.jsonl) | 120 | 60,0 % | 80,0 % |

Respecto a la version anterior no publicada (v4), el conjunto de nombres en latin dentro de frases mejora del 52,5 % al 67,7 % (McNemar p = 0,0001); el resto de conjuntos no muestra diferencias fuera del margen de variacion.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 2,36 M de parametros, los pesos Q5_K_M ocupan del orden de unos pocos megabytes, y el modelo completo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con suficiente VRAM para el runtime de llama.cpp; el entrenamiento se realizo en una RTX 4080 SUPER (16 GB), pero la inferencia no requiere esa clase de hardware.
- Cabe en GPU consumer: si, en practicamente todas (incluidas integradas con soporte de llama.cpp).
- Opciones de despliegue: llama.cpp (lectura de GGUF y carga del adaptador LoRA con `--lora`), la app Hoshiyomi (recompone los pesos a 8 bits) y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hoshiyomi-zenz-v3.2-small_v6 | 2,36 M | 40 caracteres de contexto izquierdo | Conversion kana-kanji para IME, con enfasis en nombres en latin | Apache 2.0 | GGUF en Hugging Face |
| Miwa-Keita/zenz-v3.2-small | no disponible | no disponible | Conversion kana-kanji para IME (modelo base) | Apache 2.0 | GGUF en Hugging Face |
| zenz-v2.5 (familia zenz) | no disponible | no disponible | Conversion kana-kanji para IME | no disponible | no disponible |

La comparacion con modelos de proposito general no es significativa: este modelo solo realiza conversion de entrada y no compite en tareas de razonamiento, codigo o generacion abierta.

## Limitaciones y advertencias

- Modelo altamente especializado: no es adecuado para generacion de texto libre, razonamiento, codigo ni tareas multilingues fuera del japones.
- Solo soporta japones (ja); no se ha entrenado para otros idiomas.
- La ventana de contexto efectiva es de 40 caracteres de contexto izquierdo, insuficiente para desambiguaciones que dependan de parrafos completos.
- Rendimiento limitado en nombres de persona (60,0 % Top-1) y en nombres en latin dentro de frases (67,7 % Top-1), por lo que puede producir conversiones erroneas en esos casos.
- Riesgo de alucinacion en la seleccion de candidatos de conversion cuando la lectura es ambigua o poco frecuente.
- El uso esta condicionado a la licencia Apache 2.0 y, en lo relativo a los datos, a ODC-BY 1.0 y a los terminos de uso de Common Crawl.
- La evaluacion se realizo con un motor concreto (Hoshiyomi en Rust con diccionario) y en Mac; los resultados pueden variar en otros entornos de inferencia.
- El adaptador LoRA debe superponerse al zenz-v3.2-small original en Q5_K_M; usarlo con otros pesos o cuantizaciones puede degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YozoraKurage/Hoshiyomi-zenz-v3.2-small_v6
- Modelo base: https://huggingface.co/Miwa-Keita/zenz-v3.2-small-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/Miwa-Keita/zenz-v2.5-dataset
- Repositorio del proyecto Hoshiyomi (herramientas de entrenamiento en `tools/training/`): no disponible como URL en la informacion proporcionada
