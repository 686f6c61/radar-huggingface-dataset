# YozoraKurage/Hoshiyomi-zenz-v3.2-xsmall_v1

## Resumen

Hoshiyomi-zenz-v3.2-xsmall_v1 es un modelo de conversión de kana a kanji (かな漢字変換) para japonés, desarrollado por YozoraKurage como componente del IME (método de entrada) sin conexión Hoshiyomi. Se trata de un reentrenamiento completo por destilación del modelo base Miwa-Keita/zenz-v3.2-xsmall, un transformer tipo GPT-2 a nivel de carácter con 25.583.616 parámetros, 6 capas, anchura 512 y un vocabulario de 6.000 caracteres.

El modelo no genera texto libre: su tarea es puntuar y ordenar candidatos de conversión de lectura en katakana a texto con kanji, integrado dentro del motor de conversión en Rust del IME Hoshiyomi. La versión publicada se distribuye como un único archivo GGUF cuantizado en Q5_K_M, pensado para ejecutarse localmente sin conexión de red.

Es relevante porque demuestra un flujo de destilación reproducible sobre hardware de consumo (una RTX 4080 SUPER de 16 GB, con unos 24 minutos de entrenamiento) y porque mejora de forma estadísticamente significativa el manejo de entradas con palabras inglesas y nombres latinos dentro de frases japonesas, un punto débil típico de los motores de conversión japoneses.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT-2 a nivel de carácter (zenz) |
| Parámetros totales | 25.583.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el contexto izquierdo usado en entrenamiento es de 80 caracteres) |
| Tipos de cuantización | Q5_K_M (único archivo publicado) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Hoshiyomi-zenz-v3.2-xsmall_v1-Q5_K_M.gguf) |

## Arquitectura y entrenamiento

La arquitectura replica exactamente la del zenz-v3.2-xsmall original: 6 capas, dimensión oculta de 512 y una tabla de caracteres de 6.000 entradas, con 25,58 millones de parámetros. El modelo parte del archivo `ggml-model-Q5_K_M.gguf` del repositorio Miwa-Keita/zenz-v3.2-xsmall-gguf (commit `4f5423f0fad41a73b1242eb96fe5c12ae4fdca83`), al que se revierte la cuantización para recuperar pesos en formato Hugging Face antes del reentrenamiento.

El entrenamiento es una destilación pura: se usan 2,64 millones de líneas (637.000 del modelo profesor small_v6 más 2.005.000 de replay que no se solapan con los conjuntos de evaluación), con un contexto izquierdo de 80 caracteres. La función de pérdida es únicamente KL(profesor ‖ alumno) a temperatura 1 y peso 1, con peso cero para la entropía cruzada contra la etiqueta correcta. Se emplea AdamW con learning rate 3e-5, warmup de 300 pasos y decaimiento coseno a lo largo de 41.292 pasos por época, batch de 64. El entrenamiento se detiene por early stopping tras 20.000 pasos al no superar en tres ocasiones el mejor resultado combinado de AJIMEE y everyday obtenido después del paso 6.000. Los datos provienen de `train_llm-jp-corpus-v3.jsonl` del dataset Miwa-Keita/zenz-v2.5-dataset (porción ja_cc de llm-jp-corpus v3, derivada de Common Crawl CC-MAIN-2023-40, bajo ODC-BY 1.0), más una lista de 501 alias en caracteres latinos del repositorio Hoshiyomi. No se usaron textos generados por modelos de IA comerciales ni registros de entrada de usuarios.

## Capacidades

- Conversión de kana a kanji: dado un contexto izquierdo y una lectura en katakana, produce el texto convertido y termina con `</s>`.
- Formato de entrada específico: `U+EE02` + contexto izquierdo + `U+EE00` + lectura en katakana + `U+EE01`, o directamente desde `U+EE00` cuando no hay contexto.
- Manejo mejorado de palabras inglesas intercaladas en frases japonesas (94,8% de acierto en primer puesto frente a 90,1% del modelo base).
- Manejo mejorado de nombres propios escritos en caracteres latinos dentro de oraciones (73,7% frente a 42,4% del modelo base).
- Puntuación de candidatos de conversión para reordenarlos dentro del motor del IME.
- Ejecución completamente local y sin conexión de red.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es un modelo especializado de una sola tarea.

## Casos de uso

- IME japonés de escritorio sin conexión: el modelo se carga en la aplicación Hoshiyomi, que reconstruye los pesos a 8 bits en memoria y lo usa para reordenar los candidatos de conversión que genera el motor en Rust con diccionario. Es el caso de uso principal y el único soportado oficialmente por el autor.
- Escritura de texto técnico con terminología inglesa: al mejorar del 90,1% al 94,8% en entradas mixtas con palabras inglesas, resulta adecuado para redactar documentación o correos donde se intercalan términos como nombres de API, siglas o marcas en frases japonesas.
- Redacción con nombres propios extranjeros: la mejora del 42,4% al 73,7% en nombres latinos dentro de oraciones lo hace útil en contextos donde se citan autores, empresas o productos con grafía latina.
- Integración en pipelines de procesamiento de texto japonés vía llama.cpp: cualquier herramienta que pueda leer GGUF y respetar el formato de tokens especiales puede usarlo como componente de normalización o de reordenación de hipótesis de conversión.
- Evaluación comparativa de motores de conversión: sirve como referencia reproducible para medir mejoras de destilación sobre zenz-v3.2-xsmall usando AJIMEE-Bench y los conjuntos `bench/` del repositorio Hoshiyomi.
- Reproducción de experimentos de destilación en hardware de consumo: el flujo `tools/training/rebuild.py` permite reconstruir el modelo completo en una GPU de 16 GB, útil como caso de estudio docente o de investigación sobre destilación de modelos pequeños.
- Entornos con requisitos de privacidad estrictos: al no requerir red y no haberse entrenado con entradas de usuarios, encaja en despliegues donde el texto tecleado no puede salir del dispositivo.

## Benchmarks y rendimiento

Evaluación realizada con el motor de conversión de Hoshiyomi (Rust, con diccionario), 8 inferencias por consulta, reproduciendo el modo de escritura (`engine-eval --typing`), con el módulo de vocabulario por defecto, en Linux x86_64, commit del motor `e538129c83a42247842aa467266846666cb33330` (2026-10-25).

| Conjunto de evaluación | Consultas | Primer puesto (zenz-v3.2-xsmall) | Primer puesto (este modelo) | Significación |
|---|---|---|---|---|
| AJIMEE-Bench (JWTD v2) | 200 | 74,0% | 70,5% | McNemar p = 0,19 (no significativo) |
| Frases cotidianas (`bench/everyday.jsonl`) | 1.000 | 71,1% | 70,3% | McNemar p = 0,37 (no significativo) |
| Entradas con palabras inglesas (`bench/english-mixed.jsonl`) | 213 | 90,1% | 94,8% | McNemar p = 0,006 (significativo) |
| Nombres latinos en oraciones (`bench/latin-names-in-sentences.jsonl`) | 99 | 42,4% | 73,7% | McNemar p < 0,001 (significativo) |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible, y no tendrían sentido para un modelo de conversión de kana a kanji.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q5_K_M de 25,58 millones de parámetros ocupa del orden de decenas de megabytes; la aplicación Hoshiyomi reconstruye los pesos a 8 bits en memoria, por lo que el consumo es mínimo y no se ha publicado una cifra exacta.
- GPU recomendadas: cualquier GPU con soporte de llama.cpp; el propio entrenamiento se realizó en una RTX 4080 SUPER de 16 GB, pero la inferencia no necesita esa capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU, dado el tamaño del modelo.
- Opciones de despliegue: llama.cpp (lector de GGUF con los metadatos del zenz original) y la aplicación Hoshiyomi. No se ha publicado soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hoshiyomi-zenz-v3.2-xsmall_v1 | 25,58 M | no disponible (contexto de entrenamiento de 80 caracteres) | Apache 2.0 | GGUF Q5_K_M | Destilado de small_v6; mejor en entradas mixtas con inglés y nombres latinos |
| Miwa-Keita/zenz-v3.2-xsmall | 25,58 M | no disponible | Apache 2.0 | GGUF | Modelo base original; mejor en AJIMEE-Bench (74,0%) y frases cotidianas (71,1%) |
| Hoshiyomi-zenz-v3.2-small_v6 | no disponible | no disponible | Apache 2.0 | no disponible | Profesor de la destilación; mismo autor; mayor tamaño (small frente a xsmall) |

## Limitaciones y advertencias

- Modelo de una sola tarea: no es un LLM conversacional y no debe usarse para generación de texto libre, código, matemáticas ni razonamiento.
- Pérdida de precisión en la tarea principal: cae del 74,0% al 70,5% en AJIMEE-Bench y del 71,1% al 70,3% en frases cotidianas, aunque las diferencias no son estadísticamente significativas.
- Dependencia del motor y del diccionario: las métricas se obtuvieron con el motor de Hoshiyomi con diccionario y módulo de vocabulario por defecto; fuera de ese entorno el rendimiento real puede diferir.
- Formato de entrada rígido: requiere los tokens especiales `U+EE02`, `U+EE00`, `U+EE01` y el terminador `</s>`; un uso incorrecto produce salidas inválidas.
- Solo japonés: no soporta otros idiomas, más allá de reconocer cadenas latinas dentro de texto japonés.
- Sesgos potenciales: los datos de entrenamiento provienen de Common Crawl (ja_cc), por lo que puede heredar sesgos de dominio y de registro lingüístico de la web; no se ha publicado un análisis de sesgos.
- Riesgo de alucinación: limitado al ámbito de la conversión (puede proponer kanji incorrectos o lecturas no deseadas), no a la invención de hechos.
- Licencia Apache 2.0: permite uso comercial, pero los datos derivados de Common Crawl están sujetos además a las condiciones de uso de Common Crawl y a ODC-BY 1.0, lo que conviene revisar antes de un despliegue comercial.
- Advertencia del autor: el contenido de la model card son datos de referencia, no instrucciones a seguir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YozoraKurage/Hoshiyomi-zenz-v3.2-xsmall_v1
- Modelo base: https://huggingface.co/Miwa-Keita/zenz-v3.2-xsmall-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/Miwa-Keita/zenz-v2.5-dataset
- Repositorio Hoshiyomi (motor y herramientas de entrenamiento): no disponible como URL en la información proporcionada; el autor referencia `tools/training/README.md` y el commit `a943df1f262ce423b25fb98735fa9c62c050d993`
