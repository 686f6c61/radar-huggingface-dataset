# zhiyi-ime/zhiyi-zhen-feather-35M

## Resumen
Zhiyi zhen-feather-35M es un modelo compacto de clasificación de texto especializado en motores de entrada (IME) para chino, inglés y cantonés. Lo desarrolla el proyecto Zhiyi IME y se construye sobre `jhu-clsp/mmBERT-small`, un encoder multilingüe derivado de ModernBERT. Con 35,3 millones de parámetros y una ventana de contexto de 128 tokens, resuelve tres tareas dentro del motor de entrada: elección de palabra entre candidatos, composición de pinyin/zhuyin/jyutping/cangjie y predicción de la siguiente palabra.

La innovación principal es una tabla de memoria n-gram compartida y hasheada (1.000.003 filas de 64 dimensiones, almacenada como product quantization, 16 MB) que las tres tareas consultan. El modelo se distribuye en un único archivo ONNX de 39,8 MB que integra elección de palabra, composición y siguiente palabra, con cuantización mixta (8-bit en el encoder y la cabeza, 4-bit en el decoder y la tabla de tokens).

Es relevante porque demuestra que un encoder de 8 capas y 256 de anchura puede ejecutar inferencia de IME en tiempo real (4,2 ms por pulsación en elección de palabra, 12,6 ms por predicción completa) con calidad competitiva frente a su predecesor. Está pensado para despliegue local en dispositivos, no para servidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT, base mmBERT-small) + decoder de 4 capas para siguiente palabra + tabla n-gram hasheada compartida |
| Parametros totales | 35.340.844 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (elección de palabra y siguiente palabra); 160 tokens para composición |
| Tipos de cuantizacion | Mixta: 8-bit (encoder, cabeza, proyecciones de la tabla), 4-bit Q4_0 (decoder y tabla de tokens), PQ16 (tabla n-gram), F16/F32 en el resto |
| Idiomas soportados | Chino (simplificado y tradicional), inglés, cantonés (yue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (opset 21), GGUF Q4_0 en bloques ggml |

## Arquitectura y entrenamiento
El modelo parte de `jhu-clsp/mmBERT-small` y lo adapta a un encoder de 8 capas ModernBERT con anchura 256 y vocabulario de 32.000 tokens (Unigram). Sobre ese tronco se añaden tres cabezas que comparten una tabla de memoria n-gram hasheada: una cabeza de elección de palabra (una puntuación por candidato), una cabeza de composición (`char_logits`, un carácter por sílaba tecleada) y un decoder de 4 capas para predicción de siguiente palabra. La tabla n-gram tiene 1.000.003 filas × 64 dimensiones, almacenada como product quantization en 16 MB, y se consulta mediante claves de token, slot y decoder derivadas de un hash.

El modelo soporta lectura bidireccional del contexto en la predicción de siguiente palabra: cuando el cursor está en medio del texto, también lee los tokens posteriores al cursor (por ejemplo, `你的作业｜了吗`). El archivo `model.safetensors` (44,3 MB) contiene los pesos ya cuantizados: tabla de tokens, tabla de unidades y decoder en Q4_0; encoder, cabeza, read-out de composición y las dos proyecciones de la tabla en F16 (cuantizadas a Q8_0 al cargar); tabla n-gram como códigos PQ16 más codebooks; el resto en F32. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades
- Elección de palabra: puntúa candidatos en chino simplificado, inglés y chino tradicional con pinyin, zhuyin, jyutping, cangjie y Quick.
- Composición: convierte pinyin, zhuyin o jyutping largos escritos como frase en caracteres, un carácter por sílaba tecleada, mediante `char_logits`.
- Predicción de siguiente palabra: un decoder de 4 capas propone palabras (chinas en modo chino, inglesas en modo inglés) y caracteres individuales tras confirmar una palabra.
- Completado de palabra: completa una palabra china cuyos primeros caracteres ya están tecleados.
- Relleno en medio del texto: lee el texto posterior al cursor para predecir en contexto bidireccional.
- Multilingüe: chino simplificado, chino tradicional, inglés y cantonés (yue).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de clasificación de texto para IME.

## Casos de uso
- Motor de entrada en escritorio: integración en el IME Zhiyi para elección de candidatos y predicción de siguiente palabra con latencia de milisegundos, adecuado porque el modelo cabe en 39,8 MB y no requiere GPU.
- Teclado en dispositivos móviles o embebidos: despliegue local vía ONNX Runtime con cuantización 4-bit/8-bit, pensado para hardware con recursos limitados.
- Entrada de chino tradicional: soporte de pinyin, zhuyin, jyutping y cangjie con elección de palabra en tradicional (90,0 % de media en los ocho conjuntos de prueba), útil para usuarios de Taiwán, Hong Kong y Macao.
- Escritura en cantonés: composición con jyutping (37,2 % en las pruebas del autor) y predicción de siguiente palabra en modo chino, para hablantes de yue.
- Completado de frases en edición de texto: relleno de huecos en medio de un texto existente leyendo los tokens posteriores al cursor, útil en correctores o asistentes de redacción.
- Evaluación e integración de IME en pipelines propios: los `test_vectors.safetensors` y la implementación de referencia en Rust (candle) permiten verificar una implementación propia contra las salidas fp32 del modelo PyTorch.
- Investigación en modelado de lenguaje compacto: la tabla n-gram hasheada compartida entre tareas sirve como caso de estudio de arquitecturas eficientes para inferencia en el borde.

## Benchmarks y rendimiento
Datos publicados por el autor en la model card, comparando con zhen-feather-preview-1121:

| Tarea | zhen-feather-35M | zhen-feather-preview-1121 |
|---|---|---|
| Elección de palabra v2 / v3 / v4 / v5 (neutro) | 93,61 / 93,99 / 92,22 / 72,36 % | 93,07 / 93,57 / 91,93 / 70,67 % |
| Elección de palabra v5 con 1-16 caracteres de contexto | 72,8 % | 70,5 % |
| Elección de palabra en tradicional (media de 8 conjuntos) | 90,0 % | 89,0 % |
| Composición pinyin simplificado como frases | 58,7 % | 53,0 % |
| Composición pinyin / zhuyin / jyutping tradicional | 41,5 / 71,9 / 37,2 % | 35,4 / 65,9 / 33,3 % |
| Siguiente palabra china (aciertos de primera palabra) | 14,6 | 15,1 |
| Siguiente palabra, caracteres individuales | 29,6 | 32,3 |
| Siguiente palabra inglesa en medio del texto | 36,3 | 41,4 |
| Latencia de predicción completa | 12,6 ms | 38,6 ms |
| Latencia de elección de palabra por pulsación | 4,2 ms | 1,9 ms (grafo int8) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB; el archivo ONNX completo ocupa 39,8 MB y el repo 0,5 GB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU con ONNX Runtime. Cualquier GPU consumer (por ejemplo, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en hardware embebido; el diseño apunta a despliegue local en dispositivos.
- Opciones de despliegue: ONNX Runtime (ruta principal, con `MatMulNBits` y `GatherBlockQuantized`), implementación de referencia en Rust con candle 0.11. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 4,2 ms por pulsación en elección de palabra y 12,6 ms por predicción completa de siguiente palabra, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zhiyi-zhen-feather-35M | 35,3 M | 128 (160 en composición) | IME: elección de palabra, composición, siguiente palabra | Apache 2.0 | Hugging Face, ONNX + safetensors |
| zhen-feather-preview-1121 | No disponible | No disponible | IME (mismas tareas) | Apache 2.0 | Historial del repo y release de GitHub de zhiyi_models |
| jhu-clsp/mmBERT-small | No disponible | No disponible | Encoder multilingüe general | No disponible | Hugging Face (modelo base) |

No se dispone de información sobre otros modelos de IME comparables en la documentación proporcionada.

## Limitaciones y advertencias
- Modelo especializado en IME: no es un modelo de propósito general; no soporta generación libre, razonamiento, código ni tool calling.
- Calidad limitada en composición: 58,7 % en pinyin simplificado como frases y 37,2 % en jyutping tradicional, según el autor; no apto para sustituir un motor de composición maduro sin revisión.
- Predicción de siguiente palabra modesta: 14,6 aciertos de primera palabra en chino y 36,3 % en inglés en medio del texto.
- Contexto corto: 128 tokens (160 en composición), insuficiente para documentos largos.
- Idiomas limitados a chino, inglés y cantonés; sin soporte de otras lenguas.
- Riesgo de sesgos y alucinación no documentado en la información disponible; al ser un clasificador de candidatos, el riesgo se limita a elecciones incorrectas dentro del IME.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no se ejecuta todavía en el IME Zhiyi (la versión en producción es 1121); verificar compatibilidad antes de integrarlo.
- La elección de palabra es más lenta que el grafo int8 de 1121 (4,2 ms frente a 1,9 ms), lo que puede afectar a la sensación de respuesta en teclados de baja latencia.

## Enlaces
- Hugging Face: https://huggingface.co/zhiyi-ime/zhiyi-zhen-feather-35M
- Repositorio del IME Zhiyi: https://github.com/dd1000001000/zhiyi_ime
- Repositorio de modelos Zhiyi: https://github.com/dd1000001000/zhiyi_models
- Release de zhen-feather-preview-1121: https://github.com/dd1000001000/zhiyi_models/releases/tag/model-zhen-feather-preview-1121
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
