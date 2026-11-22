# zhiyi-ime/zhiyi-zhen-feather

## Resumen

Zhiyi zhen-feather es un modelo compacto de clasificación de texto y predicción de siguiente palabra disenado especificamente para motores de entrada (IME) de chino, ingles y cantonés. Lo desarrolla el proyecto Zhiyi IME, una implementacion de codigo abierto de metodo de entrada, y se distribuye como un modelo derivado de `jhu-clsp/mmBERT-small` con licencia Apache 2.0. Su proposito no es la generacion libre de texto sino resolver tres tareas concretas dentro de un IME: la eleccion de palabra entre candidatos (word choice), la composicion de silabas pinyin, zhuyin o jyutping en caracteres y la prediccion de la siguiente palabra.

Arquitectonicamente es un transformer encoder de tipo ModernBERT reducido a 8 capas con anchura 256, sobre el tokenizador de mmBERT (256.000 tokens). Con 77,7 millones de parametros totales y un repositorio de 0,4 GB, esta pensado para ejecutarse en CPU y en dispositivos moviles, no en GPU de datacenter. Incluye cabezas especificas para puntuar candidatos, emitir logits por caracter y predecir la siguiente palabra mediante un decodificador de 4 capas que consulta una tabla de memoria cuantizada con product quantization y hashing.

Su relevancia actual radica en que demuestra que un modelo de 78 millones de parametros, cuantizado a int8 y exportado a ONNX, puede cubrir las tres funciones clave de un IME moderno en tres idiomas, compitiendo en eficiencia con soluciones basadas en n-gramas o modelos mucho mayores. Es una version preview: el IME Zhiyi no la usa todavia en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT (8 capas, anchura 256) + decodificador de 4 capas para siguiente palabra |
| Parametros totales | 77.708.316 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo trunca el contexto a 128 tokens) |
| Tipos de cuantizacion | int8 (grafos ONNX `int8g`), set de 4 bits para telefono, Q8_0 (`quantize_q8_0` en config) |
| Idiomas soportados | Chino (zh), ingles (en), cantonés (yue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32, 143 MB), ONNX (int8) |
| Modelo base | jhu-clsp/mmBERT-small |
| Tokenizador | mmBERT, 256.000 tokens |
| Vocabulario de composicion | 9.067 caracteres |
| Filas de salida del decodificador | 102.464 |
| Tabla de tokens ONNX podada | 116.118 filas |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-small` y conserva 8 capas de tipo ModernBERT con anchura 256 y el tokenizador multilingue de mmBERT. Sobre ese encoder se montan varias cabezas: una cabeza compartida (`shared_head`) que puntua candidatos de word choice y que tambien produce `char_logits` para la composicion (un caracter por silaba tecleada, restringido a los caracteres que esa silaba puede deletrear segun `unified_vocab.json`); y un decodificador de 4 capas para prediccion de siguiente palabra que lee ademas una tabla de memoria con codigos de product quantization y hashing. La configuracion incluye `encoder.layer_types`, `prefix_mask`, `compact`, `char_count` y `next_word.memory_table`.

El entrenamiento se describe como una evolucion incremental: `zh-lite-next-preview-1116`, luego `zh-lite-next-preview-1120` (que anadio la tabla de memoria y las siguientes palabras de un solo caracter) y finalmente `zhen-feather-preview-1121`, que anade el entrenamiento de composicion. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La innovacion tecnica destacable es la integracion de tres tareas de IME en un unico grafo ONNX con cache KV (`laya.one.int8g.onnx` y `laya.one.fused.int8g.onnx`), junto con la tabla de memoria cuantizada que permite prediccion de siguiente palabra con un coste de almacenamiento reducido (16 MB de codigos PQ dentro de los 143 MB de pesos).

## Capacidades

- Eleccion de palabra (word choice): asigna una puntuacion a cada candidato chino o ingles para ordenar sugerencias del IME.
- Composicion: convierte pinyin largo, zhuyin o jyutping escrito como frase en caracteres, un caracter por silaba tecleada, mediante `char_logits`.
- Prediccion de siguiente palabra: decodificador de 4 capas que puede predecir un solo caracter y operar con el cursor en medio del texto (mid-text).
- Soporte multilingue en chino, ingles y cantonés (jyutping).
- Ejecucion en CPU mediante ONNX Runtime con grafos int8 y cache KV.
- Referencia de inferencia en Rust con candle 0.11 (`candle_ref/`, version 0.8.1).
- Vectores de prueba (`test_vectors.safetensors`) con 13 entradas de word choice, 6 de composicion y 15 de siguiente palabra con las salidas del modelo ONNX fp32.
- No se documenta soporte de tool calling, agentes, vision ni audio.

## Casos de uso

- Motor de entrada en escritorio: el IME Zhiyi puede usar los grafos int8 de `onnx/int8g/` para puntuar candidatos pinyin y ordenar la lista de palabras sin salir de la CPU, con un modelo de 78 M de parametros que cabe holgadamente en memoria.
- Teclado en movil: el set de 4 bits para telefono permite desplegar word choice y prediccion de siguiente palabra en dispositivos con recursos limitados, manteniendo el modelo por debajo de los 143 MB en fp32.
- Entrada de chino tradicional y cantonés: las tablas de lectura tradicional y jyutping en `unified_vocab.json` permiten composicion en estos sistemas de escritura, util para usuarios de Hong Kong y Taiwan.
- Prediccion mid-text: el decodificador puede sugerir la siguiente palabra con el cursor en medio de una frase ya escrita, lo que sirve para edicion y correccion dentro de un campo de texto.
- Autocompletado bilingue chino-ingles: al puntuar candidatos en ambos idiomas, el IME puede sugerir continuaciones mezcladas en contextos donde el usuario alterna idiomas.
- Investigacion en IME de bajo coste: los vectores de prueba y la referencia en Rust permiten validar implementaciones propias y comparar la salida ONNX int8 frente a fp32.
- Integracion en pipelines de clasificacion: al exponerse con `pipeline_tag: text-classification`, la cabeza de word choice puede reutilizarse como puntuador de pares contexto-candidato en otras tareas de ranking textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las notas de la release `model-zhen-feather-preview-1121` en GitHub contienen los resultados de las pruebas del autor, pero no se detallan en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo fp32 ocupa 143 MB y los grafos ONNX int8 son aun menores.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU (`CPUExecutionProvider` en el ejemplo).
- Cabe en cualquier GPU consumer, pero no es su objetivo; tambien cabe en memoria de telefono.
- Opciones de despliegue: ONNX Runtime (grafos `onnx/int8g/`), referencia en Rust con candle 0.11; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zhiyi-zhen-feather | 77,7 M | No disponible | Word choice, composicion, siguiente palabra para IME | Apache 2.0 | Hugging Face, ONNX int8 |
| jhu-clsp/mmBERT-small (base) | No disponible | No disponible | Encoder multilingue general | No disponible | Hugging Face |
| zh-lite-next-preview-1120 (predecesor) | No disponible | No disponible | Word choice y siguiente palabra | No disponible | GitHub releases |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es una version preview: el IME Zhiyi no la usa todavia, por lo que su estabilidad en produccion no esta validada.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre datos de IME en chino, ingles y cantonés puede heredar sesgos de esos corpus.
- Riesgo de alucinacion en la prediccion de siguiente palabra y en la composicion cuando el contexto es ambiguo o el usuario teclea silabas poco frecuentes.
- El ejemplo de uso trunca el contexto a 128 tokens; la longitud de contexto real no esta documentada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `jhu-clsp/mmBERT-small` puede tener sus propias condiciones que conviene revisar.
- La cobertura de idiomas se limita a chino, ingles y cantonés; no hay soporte documentado para otras lenguas.
- El modelo no es generativo: no debe usarse para generar texto libre, solo para las tareas de IME descritas.

## Enlaces

- Hugging Face: https://huggingface.co/zhiyi-ime/zhiyi-zhen-feather
- Repositorio del IME Zhiyi: https://github.com/dd1000001000/zhiyi_ime
- Release model-zhen-feather-preview-1121: https://github.com/dd1000001000/zhiyi_models/releases/tag/model-zhen-feather-preview-1121
- Release model-zh-lite-next-preview-1120: https://github.com/dd1000001000/zhiyi_models/releases/tag/model-zh-lite-next-preview-1120
- Release model-zh-lite-next-preview-1116: https://github.com/dd1000001000/zhiyi_models/releases/tag/model-zh-lite-next-preview-1116
- Todos los modelos Zhiyi: https://github.com/dd1000001000/zhiyi_models
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
