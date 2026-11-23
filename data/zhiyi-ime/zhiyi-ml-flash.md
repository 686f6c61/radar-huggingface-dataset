# zhiyi-ime/zhiyi-ml-flash

## Resumen

Zhiyi ml-flash es un modelo de clasificación de texto y predicción de tokens diseñado específicamente para motores de entrada (IME, *input method editor*). Lo desarrolla zhiyi-ime y se distribuye bajo licencia Apache 2.0. Su función no es la generación libre de texto, sino resolver tres tareas concretas dentro de un teclado predictivo: elegir la palabra correcta entre varios candidatos, componer una frase a partir de sílabas mecanografiadas y proponer las siguientes palabras tras confirmar una.

Técnicamente es un transformer encoder derivado de `jhu-clsp/mmBERT-small`, con 8 capas ModernBERT de anchura 384 y 83.211.615 parámetros totales. Reutiliza el tokenizador de mmBERT (vocabulario Gemma de 256.000 tokens) y añade una cabeza de elección de palabra, una cabeza de composición a nivel de carácter y un decodificador de 4 capas para la predicción de siguientes palabras, todo empaquetado en un único grafo ONNX con caché KV.

Su relevancia actual radica en la integración en producción: el IME Zhiyi lo utiliza desde la versión 1.7.0 y se distribuye en variantes int8 (94 MB) y "slim" con embeddings en 4 bits (64 MB), lo que permite ejecutarlo en CPU. Cubre chino simplificado y tradicional (pinyin, zhuyin, jyutping, cangjie, quick), inglés, japonés, coreano y vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, 8 capas, anchura 384) con cabezas de clasificación y decodificador de 4 capas |
| Parametros totales | 83.211.615 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card describe el formato de secuencia pero no fija un máximo explícito) |
| Tipos de cuantizacion | int8 (Q8_0 en capas lineales), 4 bits en tabla de tokens y embeddings de unidad (variante slim), F16 en pesos base |
| Idiomas soportados | zh (simplificado y tradicional), en, ja, ko, vi, yue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (171 MB, matrices F16), ONNX (int8 y slim) |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-small`, un encoder multilingüe ModernBERT, y lo adapta a tres tareas de IME mediante cabezas especializadas. La cabeza de elección de palabra produce una puntuación por candidato leyendo el logit en el token `<mask>` que precede a cada uno. La cabeza de composición emite `char_logits`, un carácter por sílaba mecanografiada, para chino simplificado, tradicional y japonés. El decodificador de siguientes palabras, de 4 capas, comparte la tabla de tokens con la cabeza de elección y lee el bloque de contexto que esta ya calcula y cachea, de modo que ambas funciones conviven en un único archivo ONNX.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. Sí documenta el diseño de inferencia: un único input booleano `is_step` selecciona el modo mediante un nodo `If`, con caché KV para elección de palabra y composición, y un modo de decodificación por pasos para la búsqueda en haz de siguientes palabras. Incluye además `prefix_mask`, `shared_head` y una configuración de cuantización (`quantize_q8_0`) que indica qué tensores convertir a Q8_0 al cargar para reproducir la precisión medida.

## Capacidades

- Elección de palabra: puntuación de candidatos en chino simplificado, inglés, chino tradicional (pinyin, zhuyin, jyutping, cangjie, quick), japonés, coreano y vietnamita.
- Composición de frases largas: convierte una secuencia de sílabas en una oración, un carácter por sílaba, en chino simplificado, tradicional y japonés.
- Predicción de siguientes palabras: propone hasta cinco continuaciones tras confirmar una palabra, en las seis lenguas soportadas.
- Finalización de palabra: completa un término cuyo inicio (caracteres o piezas) ya se ha mecanografiado, mediante `min_chars`.
- Procesamiento multilingüe con etiquetas de idioma explícitas (`lang_tags`) para ja, ko, vi, en y variantes del chino.
- Inferencia en modo contexto y modo paso, con caché KV, para integrarse en búsqueda en haz.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Motor de entrada en producción: integración directa en un IME de escritorio o móvil para resolver la ambigüedad pinyin-hanzi; es exactamente el uso que hace Zhiyi IME desde la versión 1.7.0 con el grafo `laya.one.next.slim.onnx`.
- Escritura en chino tradicional con métodos fonéticos y de forma: soporte de zhuyin, jyutping, cangjie y quick, útil en Taiwán, Hong Kong y Macao, donde conviven varios métodos de entrada.
- Predicción de siguiente palabra en teclados móviles: el decodificador de 4 capas propone continuaciones tras cada palabra confirmada, reduciendo pulsaciones en conversaciones multi-turno.
- Autocompletado de términos a medio escribir: con `min_chars=1` el modelo completa palabras cuyo prefijo ya está mecanografiado, adecuado para nombres propios y vocabulario técnico recurrente.
- Entrada multilingüe en una sola aplicación: un editor o chat que alterna chino, inglés, japonés, coreano y vietnamita puede servirse de un único modelo con etiqueta de idioma en lugar de cinco modelos separados.
- Despliegue en dispositivos sin GPU: la variante slim de 64 MB y la int8 de 94 MB permiten ejecutar el modelo en CPU con ONNX Runtime, lo que encaja en portátiles y entornos de escritorio sin acelerador.
- Verificación de implementaciones: los `test_vectors.safetensors` (16 casos de elección y composición, 14 de siguientes palabras) permiten validar un port a otro runtime comparando token a token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente ejemplos cualitativos de salida (puntuaciones de candidatos y listas de siguientes palabras) y remite a las notas de la release `model-ml-flash-next-preview-1114` del repositorio `zhiyi_models` para los resultados de las pruebas, sin cifras reproducidas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repo completo ocupa 0,4 GB; el grafo int8 son 94 MB y el slim 64 MB, por lo que la inferencia cabe holgadamente en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) ejecutaría el grafo sin problema, pero no es el escenario documentado.
- Cabe en GPU consumer: sí, con margen amplio, aunque el caso de uso objetivo es CPU.
- Opciones de despliegue: ONNX Runtime (versión 1.24.4 citada en los ejemplos), con los grafos `laya.one.next.w8.onnx`, `laya.int8g.onnx` y `laya.one.next.slim.onnx`; también existe una implementación de referencia en Rust con candle 0.11 (`candle_ref/`, versión 0.8.0).
- Latencia y throughput: no disponibles. Solo se indica que la variante slim tiene "aproximadamente la misma velocidad" que la int8 de un solo grafo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zhiyi-ml-flash | 83,2 M | no disponible | Elección de palabra, composición y siguientes palabras para IME | Apache 2.0 | Hugging Face, ONNX y safetensors |
| jhu-clsp/mmBERT-small (modelo base) | no disponible en la información | no disponible | Encoder multilingüe de propósito general | no disponible en la información | Hugging Face |
| Alternativas específicas de IME | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de otros modelos de IME comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo es un clasificador y un predictor de tokens, no un generador de texto libre; no debe emplearse para tareas de generación abierta.
- La cobertura de idiomas está acotada a zh, en, ja, ko, vi y yue; no se documenta soporte para otras lenguas.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo lingüístico o cultural.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de candidatos incorrectos en la elección de palabra y en la predicción de siguientes palabras, especialmente con vocabulario especializado o nombres propios.
- Las salidas del grafo int8 difieren ligeramente de las del modelo fp32 de referencia (la model card cita un caso en el que el orden de las dos primeras palabras se invierte), por lo que conviene validar con `test_vectors.safetensors` antes de desplegar.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el archivo `LICENSE`.
- El modelo se distribuye como "next-preview", lo que sugiere que la API y los grafos pueden cambiar entre versiones.
- No se especifica la longitud máxima de contexto efectiva, un dato relevante para entradas largas en composición de frases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhiyi-ime/zhiyi-ml-flash
- Repositorio del IME Zhiyi: https://github.com/dd1000001000/zhiyi_ime
- Repositorio de modelos Zhiyi: https://github.com/dd1000001000/zhiyi_models
- Release del modelo: https://github.com/dd1000001000/zhiyi_models/releases/tag/model-ml-flash-next-preview-1114
- Release previa ML-Flash-1103: https://github.com/dd1000001000/zhiyi_models/releases/tag/model-ml-flash-1103
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
