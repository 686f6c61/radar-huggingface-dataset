# subdiox/genmai-310M

## Resumen

genmai-310M es un modelo de conversión kana-kanji (entrada en katakana, salida en japonés con mezcla de kanji, kana y puntuación) desarrollado por subdiox. No es un modelo conversacional: es el convertidor de un método de entrada (IME) japonés para macOS llamado genmai, que lo ejecuta en el dispositivo mediante Core ML sobre la Neural Engine de Apple. Con 309.504.000 parámetros, arquitectura GPT-2 decoder-only de 24 capas y 1024 dimensiones ocultas, y un vocabulario a nivel de carácter, está afinado a partir de Miwa-Keita/zenz-v2.5-medium y se distribuye con licencia CC BY-SA 4.0.

Su relevancia es práctica: demuestra que una conversión kana-kanji de calidad se puede hacer con un modelo de 310 M en local, sin nube, con una latencia mediana de 113 ms por frase completa y 30-39 ms en la tecla de conversión mientras se escribe (datos del autor en un M4 Pro). Incluye además un paquete Core ML cuantizado a int8 con reparametrización numérica para no desbordar el rango fp16 de la Neural Engine, un detalle de ingeniería poco habitual en modelos de este tamaño.

El modelo acepta hasta 500 caracteres de contexto izquierdo (el texto antes del cursor), lo que permite desambiguar lecturas homófonas en función de la frase en curso. Es un componente de infraestructura para teclados japoneses, no una alternativa a LLM generalistas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 decoder-only (transformer denso), 24 capas, 1024 dimensiones ocultas, vocabulario a nivel de carácter |
| Parámetros totales | 309.504.000 (309,5 M) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No se declara una ventana formal; condicionamiento por contexto izquierdo de hasta 500 caracteres. En el paquete Core ML, `prompt_slots` = 256 posiciones de prompt y `output_steps` = 64 |
| Tipos de cuantización | fp32 (safetensors); int8 simétrico por canal en las capas lineales del paquete Core ML, resto fp16 (incluida la caché KV) |
| Idiomas soportados | Japonés (ja) exclusivamente |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `model.safetensors` (fp32, layout GPT-2 de transformers); `model-coreml.zip` con `genmai_0.mlpackage` y `genmai_1.mlpackage` (int8/fp16, Core ML stateful) |

## Arquitectura y entrenamiento

Transformer GPT-2 decoder-only de 24 capas y 1024 dimensiones ocultas, con tokenizador a nivel de carácter. El prompt sigue el formato `zenzlc`: `<s>[U+EE02]{contexto izquierdo}[U+EE00]{lectura en katakana}[U+EE01]{salida}</s>`, usando caracteres de uso privado U+EE00 (entrada), U+EE01 (salida) y U+EE02 (contexto, omitido si no hay). Los espacios se codifican como U+3000 y los saltos de línea se eliminan. El nombre del formato queda registrado en `config.json` como `genmai_prompt_format`. La decodificación es por búsqueda en haz (5 haces en genmai), con suma directa de log-probabilidades (`length_penalty=0.0`); las lecturas largas se parten en trozos de 40 caracteres como máximo por 、 y 。, decodificados secuencialmente tras la salida anterior.

El entrenamiento consiste en un ajuste fino por etapas de zenz-v2.5-medium sobre pares (lectura, texto): (1) unas 6 M de frases con lectura generada automáticamente a partir de Wikipedia en japonés, FineWeb-2 (japonés), Aozora Bunko y actas parlamentarias, con lecturas de UniDic corregidas mediante muestras revisadas; (2) contexto izquierdo largo de hasta 500 caracteres; (3) pares lectura/superficie del diccionario Mozc (`dictionary_oss`) y frases que contienen palabras raras del diccionario; (4) datos curados con ítems revisados a mano, frases sintéticas y conjuntos de homófonos (la model card está truncada en este punto). No se menciona RLHF ni DPO en la información disponible.

La innovación técnica destacable está en la conversión a Core ML: un paquete con las 24 capas no carga en la Neural Engine, así que el modelo se divide en dos paquetes (`genmai_0`: capas 0-11; `genmai_1`: capas 12-23 y la cabeza) con dos funciones que comparten estados. Como la Neural Engine calcula en fp16 (máximo 65504) y este modelo lo excede (el flujo residual llega a ~81k y una cabeza de atención de la segunda capa alcanza logits de ~500k), los pesos se reparametrizan de forma exacta: escalado del flujo residual por 0,25 (embeddings y proyecciones de salida de atención/MLP × 0,25, épsilon de layer norm × 1/16, cabeza con embeddings sin escalar) y logits de atención divididos por 256 (plegados en los pesos de query), con resta del máximo por fila y multiplicación por 256 antes del softmax. La conversión se realiza con coremltools 9 (requiere macOS 15 / iOS 18 o posterior) mediante el script `Tools/coreml/genmai_coreml.py` del repositorio genmai-ime.

## Capacidades

- Conversión kana-kanji: transforma una lectura en katakana en texto japonés con la ortografía kanji/kana correcta.
- Conversión condicionada al contexto: usa hasta 500 caracteres del texto previo al cursor para resolver homófonos y concordancia.
- Salida de múltiples candidatos: con `num_beams=5` y `num_return_sequences=5` devuelve las 5 mejores hipótesis ordenables por log-probabilidad, lo que encaja con la interfaz de un IME.
- Segmentación de lecturas largas: manejo de entradas de más de 40 caracteres mediante troceado por puntuación y decodificación secuencial.
- Inferencia en dispositivo: paquete Core ML para la Neural Engine con pesos int8 y caché KV en fp16, pensado para ejecución local sin red.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; no es un modelo de instrucciones.
- No tiene capacidades multimodales (sin visión ni audio) ni modo de razonamiento explícito.
- Multilingüe: no; únicamente japonés.

## Casos de uso

- Método de entrada en macOS: es el convertidor del IME genmai, que lo ejecuta en local con Core ML y responde en 30-39 ms (mediana) a la tecla de conversión mientras se escribe, sin enviar pulsaciones a ningún servidor.
- Teclado japonés en iOS/iPadOS: el paquete Core ML requiere iOS 18 o posterior y permite integrar la conversión en una extensión de teclado con una huella de proceso de 80-140 MB, compatible con los límites de memoria de las extensiones.
- Pospresentación de transcripciones de ASR: los reconocedores de voz japoneses suelen devolver katakana o kana; este modelo convierte esas lecturas en texto con kanji, usando el contexto izquierdo para mantener coherencia en frases largas.
- Normalización de corpus y datos de entrenamiento: convertir lecturas katakana de diccionarios, subtítulos o corpus scrapeados a superficie canónica antes de indexar o entrenar otros modelos.
- Generación de formas de superficie para búsqueda y lematización: dado un término y su lectura, producir variantes ortográficas para un índice de búsqueda japonés tolerante a homófonos.
- Corrección de OCR japonés: cuando el OCR devuelve kana donde debería haber kanji, el modelo reconstruye la superficie plausible a partir de la lectura y el contexto previo.
- Herramientas educativas de japonés: mostrar al estudiante las lecturas candidatas de una palabra y su probabilidad relativa (los 5 haces) para explicar ambigüedades de homófonos.
- Procesado por lotes en servidor sin GPU: los pesos fp32 (1,2 GB) se pueden ejecutar con transformers en CPU para normalizar grandes volúmenes de texto japonés a un coste bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas de la tarea específica de conversión kana-kanji, medidas en un Apple M4 Pro con 5 haces:

| Métrica | Core ML int8 en Neural Engine | Pesos en 8 bits en GPU |
|---|---|---|
| Precisión top-1 exacta, frases cotidianas | 94,1 % | 93,1 % |
| Precisión top-1 exacta, AJIMEE | 93,0 % | 92,5 % |
| Precisión top-1 exacta, frases difíciles | 78,6 % | 78,6 % |
| Coincidencia top-1 entre ambas rutas | 96-98,5 % de los ítems | — |
| Latencia mediana, frase cotidiana completa | 113 ms | no disponible |
| Latencia mediana, tecla de conversión (cotidianas / AJIMEE) | 30 ms / 39 ms | no disponible |
| Huella de proceso | 80-140 MB | no disponible |
| Tiempo de primera carga (compilación para ANE) | ~20 s, cacheado por macOS | — |

## Requisitos de hardware

- Pesos fp32 en transformers: 1,2 GB en disco; se estima un consumo de unos 1,5-2 GB de VRAM/RAM para inferencia (estimación a partir del tamaño de los pesos, no publicada por el autor).
- Paquete Core ML: 283 MB en disco (int8), huella de proceso de 80-140 MB según el autor, ejecutable en CPU/GPU/ANE de Apple.
- Cabe en GPU de consumo: sí; cualquier GPU con 4 GB o más puede ejecutar los pesos fp32, y una cuantización int8 a 8 bits reduce el peso a ~310 MB. Las GPU recomendadas por disponibilidad y coste serían RTX 3060/4060 en adelante; no hay datos de rendimiento del autor en GPU NVIDIA.
- Apple Silicon: el escenario objetivo. Funciona en la Neural Engine con macOS 15 o iOS 18 en adelante; medido en un M4 Pro.
- Despliegue: `transformers` (formato GPT-2 estándar), Core ML vía coremltools 9 y el script del repositorio genmai-ime. No se distribuyen pesos GGUF ni cuantizaciones para llama.cpp u Ollama; vLLM o TGI no están documentados por el autor para este modelo.
- Latencia: 113 ms por frase cotidiana completa y 30-39 ms en la tecla de conversión en M4 Pro; el throughput por lotes no está publicado.
- Nota operativa: la primera inferencia Core ML compila el modelo para la Neural Engine (~20 s) y macOS cachea el resultado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| genmai-310M | 309,5 M | contexto izquierdo de hasta 500 caracteres; 256 slots de prompt en Core ML | Conversión kana-kanji | CC BY-SA 4.0 | Pesos fp32 + paquetes Core ML int8 |
| genmai-90M | 90 M (destilado de este modelo) | no disponible | Conversión kana-kanji | no disponible en la información | Pesos en HuggingFace; ~2× más rápido según el autor |
| zenz-v2.5-medium (modelo base) | no disponible | no disponible | Conversión kana-kanji | CC BY-SA 4.0 | Pesos en HuggingFace |
| Otros conversores kana-kanji open source | no disponible | no disponible | Conversión kana-kanji | no disponible | No se dispone de datos comparables en la información proporcionada |

Frente a su modelo base, genmai-310M está especializado y empaquetado para ejecución en dispositivo (int8, Core ML stateful); frente a genmai-90M, ofrece mayor precisión a costa de ser aproximadamente la mitad de rápido según los datos del autor.

## Limitaciones y advertencias

- Modelo de una sola tarea: no es un chat ni un modelo de instrucciones; usarlo con prompts conversacionales produce resultados sin sentido.
- Solo japonés; cualquier entrada fuera de katakana con el formato `zenzlc` queda fuera de distribución.
- El formato de prompt es estricto: los marcadores U+EE00, U+EE01 y U+EE02 son caracteres de uso privado y pueden ser eliminados o reescritos por tokenizadores, editores o pipelines intermedios.
- Riesgo de salidas degeneradas: con la normalización de longitud por defecto de transformers pueden ganar hipótesis largas y absurdas; el autor indica usar `length_penalty=0.0` y ordenar por suma de log-probabilidades.
- Contexto acotado a 500 caracteres; no hay ventana larga y la información más allá se descarta.
- Alucinación plausible: al ser un modelo generativo puede producir kanji válidos pero incorrectos para la lectura, especialmente en nombres propios, terminología especializada y frases difíciles (78,6 % de top-1 exacta en el conjunto difícil).
- Sesgos: los datos de entrenamiento (Wikipedia, FineWeb-2, Aozora Bunko, actas parlamentarias, diccionario Mozc) condicionan la cobertura léxica; vocabulario coloquial, dialectal o reciente puede estar infrarepresentado.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución, pero impone compartir bajo la misma licencia las obras derivadas; conviene revisar el cumplimiento antes de integrarlo en productos propietarios. El modelo base zenz-v2.5-medium es también CC BY-SA 4.0.
- Requisito de plataforma para Core ML: macOS 15 / iOS 18 o posterior y coremltools 9; no hay paquetes para Windows, Android o Linux en la distribución.
- Los paquetes Core ML dependen de una reparametrización numérica concreta (escala residual 0,25, escala de scores 256): modificar los pesos sin replicar ese esquema rompe la conversión.
- Datos de rendimiento procedentes del autor y de un único dispositivo (M4 Pro); no hay evaluación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/subdiox/genmai-310M
- Variante destilada de 90 M: https://huggingface.co/subdiox/genmai-90M
- Modelo base: https://huggingface.co/Miwa-Keita/zenz-v2.5-medium
- Repositorio del método de entrada genmai (incluye `Tools/coreml/genmai_coreml.py`): https://github.com/subdiox/genmai-ime
- Búsqueda web: no se han encontrado enlaces relevantes para este modelo; los resultados devueltos no guardan relación con el contenido de la ficha.
