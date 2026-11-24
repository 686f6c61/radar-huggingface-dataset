# zhiyi-ime/zhiyi-zhen-mini-12M

## Resumen

Zhiyi zhen-mini-next-1123 es un modelo de elección de palabras y predicción de siguiente palabra para teclados de entrada (IME) en chino, inglés y cantonés, desarrollado por zhiyi-ime para la aplicación Zhiyi IME. Con 12,5 millones de parámetros y un peso de unos 12 MB, está diseñado para ejecutarse en teléfonos con el coste computacional de modelos de 4 millones de parámetros, lo que lo hace especialmente adecuado para entornos móviles con recursos restringidos.

El modelo se construye sobre jhu-clsp/mmBERT-small y emplea una arquitectura de 4 capas ModernBERT de anchura 256 con una ventana de contexto de 32 tokens, un vocabulario de 32.000 tokens y pesos cuantizados a 4 bits. Incorpora una tabla de memoria n-grama compartida y hasheada (250.007 filas × 64, almacenada como cuantización de producto, 4 MB) que aporta información de bigramas y trigramas al codificador y al decodificador de siguiente palabra.

Es relevante porque logra un equilibrio poco habitual entre tamaño y funcionalidad: realiza dos tareas (puntuación de candidatos y predicción de siguientes palabras, incluida la completación a mitad de texto con lectura bidireccional del cursor) con unas 204 millones de multiplicaciones-sumas por fila de elección de palabra, frente a las 739 millones del modelo al que sustituye. La versión actual reemplaza a zhen-mini-next-preview-1116 y se distribuye con pesos en safetensors y ONNX, además de una implementación de referencia en Rust con candle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ModernBERT (4 capas, anchura 256) con tabla de memoria n-grama hasheada compartida y decodificador de siguiente palabra de 2 capas |
| Parametros totales | 12.540.801 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 tokens (contexto de elección de palabra y del decodificador) |
| Tipos de cuantizacion | Pesos en 4 bits (ggml Q4_0) para 40 matrices; tabla n-grama como PQ16 (códigos + codebooks); resto en F32; variante ONNX slim con in-projection de la cabeza en 4 bits y escalas float16 |
| Idiomas soportados | chino (simplificado y tradicional), inglés, cantonés (yue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (opset 21 con `com.microsoft` `MatMulNBits` / `GatherBlockQuantized`) |

## Arquitectura y entrenamiento

El modelo es un transformer ModernBERT reducido: 4 capas de anchura 256 que leen 32 tokens de contexto, con un vocabulario Unigram de 32.000 tokens. La innovación principal es una tabla de memoria n-grama hasheada y compartida de 250.007 filas × 64 dimensiones, almacenada mediante cuantización de producto (PQ16) en 4 MB. El codificador suma a su entrada las filas de bigramas y trigramas de cada token, y el decodificador de siguiente palabra lee cuatro filas alrededor del cursor como memoria adicional, procedentes de la misma tabla. Esta tabla compensa buena parte de la reducción de cómputo respecto al modelo anterior.

El modelo realiza dos tareas: elección de palabra (una puntuación por candidato, en chino simplificado, inglés y chino tradicional con pinyin, Zhuyin, Jyutping, Cangjie y Quick) y predicción de siguientes palabras mediante un decodificador de 2 capas que propone las palabras siguientes tras confirmar una, completa una palabra china cuyo inicio ya se ha tecleado y rellena un hueco a mitad de texto leyendo también el texto posterior al cursor. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Los pesos se distribuyen ya cuantizados a 4 bits (Q4_0) junto con los codebooks de la tabla.

## Capacidades

- Elección de palabra (word choice): asigna una puntuación a cada candidato de entrada para chino simplificado e inglés, y para chino tradicional con esquemas de entrada pinyin, Zhuyin, Jyutping, Cangjie y Quick.
- Predicción de siguientes palabras: un decodificador de 2 capas propone las palabras siguientes tras confirmar una palabra, en modo chino o inglés según el idioma activo.
- Completación de palabras chinas: completa una palabra cuyo primer o primeros caracteres ya se han tecleado.
- Completación a mitad de texto: con el cursor dentro del texto, lee también el texto posterior al cursor para rellenar un hueco (por ejemplo, `你的作业｜了吗`).
- Procesamiento multilingüe: chino, inglés y cantonés.
- Soporte de búsqueda por haz (beam search) sobre el vocabulario de 32.000 tokens en la predicción de siguientes palabras.
- Inferencia optimizada para móvil: 204 millones de multiplicaciones-sumas por fila de elección de palabra.
- No se menciona soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Teclado de entrada en teléfonos: el modelo puntúa candidatos de entrada en pinyin, Zhuyin, Jyutping, Cangjie y Quick con un coste de 204 millones de multiplicaciones-sumas por fila, lo que permite ejecutarlo en dispositivos móviles sin GPU dedicada.
- Predicción de siguiente palabra en conversación: el decodificador propone las palabras siguientes tras confirmar una, útil para acelerar la escritura en aplicaciones de mensajería con contexto de 32 tokens.
- Completación de palabras a medio teclear: completa palabras chinas cuyo inicio ya se ha introducido, reduciendo pulsaciones en la escritura diaria.
- Relleno de huecos a mitad de texto: cuando el usuario coloca el cursor en medio de una frase, el modelo lee el texto posterior y sugiere la palabra que encaja en el hueco, útil en edición y corrección de textos.
- Escritura bilingüe chino-inglés: alterna entre modo chino y modo inglés para proponer siguientes palabras en el idioma activo, adecuado para usuarios que redactan en ambos idiomas.
- Entrada en chino tradicional con esquemas fonéticos y de formas: soporta pinyin, Zhuyin, Jyutping, Cangjie y Quick para usuarios de Taiwán, Hong Kong y comunidades cantonohablantes.
- Integración en pipelines de IME personalizados: al distribuirse en ONNX con tokenizadores y ficheros JSON auxiliares, puede integrarse en aplicaciones de terceros que necesiten un motor de elección de palabra ligero.

## Benchmarks y rendimiento

La model card proporciona comparaciones relativas frente a zhen-mini-next-preview-1116 (8 capas, 128 tokens de contexto, sin tabla), medidas en PyTorch antes de la cuantización a 4 bits. No se publican valores absolutos de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Resultado frente a zhen-mini-next-preview-1116 |
|---|---|
| Multiplicaciones-sumas por fila de elección de palabra | 204 millones frente a 739 millones (3,6 veces menos) |
| Siguientes palabras en inglés | mejor |
| Completación en chino | mejor |
| Completación a mitad de texto en inglés | +3,4 puntos @1 |
| Siguientes palabras en chino | 0,5-0,9 puntos por debajo |
| Elección de palabra en conjuntos web y difíciles (v2 / v3 / v5) | 0,3-1,1 puntos por debajo |
| Elección de palabra en conjunto de chat (v4) | +1,0 punto por encima |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el repositorio completo ocupa 0,1 GB y el fichero ONNX principal pesa 14,9 MB (13,3 MB en la variante slim).
- GPU recomendadas: no requiere GPU; está pensado para CPU de teléfonos. Puede ejecutarse en cualquier GPU consumer (RTX 4090, etc.) sin aprovechar su capacidad.
- Cabe en cualquier GPU consumer y en dispositivos móviles; el ejemplo de la model card se ejecuta en CPU con ONNX Runtime 1.30.0.
- Opciones de despliegue: ONNX Runtime (con `MatMulNBits` y `GatherBlockQuantized` de `com.microsoft`, opset 21), implementación de referencia en Rust con candle 0.11 (versión 0.8.0), y carga directa de safetensors. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma absoluta; la model card solo indica el coste computacional relativo (204 millones de multiplicaciones-sumas por fila de elección de palabra).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zhiyi zhen-mini-next-1123 | 12,5 M | 32 tokens | Apache 2.0 | Hugging Face, ONNX, safetensors, candle | 204 M MACs por fila de elección de palabra |
| zhen-mini-next-preview-1116 (versión anterior) | no disponible | 128 tokens | Apache 2.0 | Historial del repositorio y release de GitHub | 8 capas, sin tabla n-grama; 739 M MACs por fila |
| Modelos de IME de 4 M de parámetros (otras soluciones) | 4 M | no disponible | no disponible | no disponible | Referencia de coste computacional citada por el autor |

No se dispone de datos de benchmarks absolutos que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ventana de contexto muy corta (32 tokens), adecuada para entrada de texto pero insuficiente para comprensión de documentos largos.
- Es un modelo especializado en IME (elección de palabra y siguiente palabra), no un modelo de propósito general; su pipeline declarado es text-classification.
- La model card indica que Zhiyi IME todavía no lo utiliza (es una preview), por lo que su validación en producción es limitada.
- Riesgo de alucinación en las sugerencias de siguiente palabra y de completación, especialmente fuera de los dominios cubiertos por la tabla n-grama.
- No se documentan sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo lingüístico o cultural.
- La predicción de siguientes palabras en chino y la elección de palabra en conjuntos web y difíciles quedan ligeramente por debajo del modelo anterior (0,5-0,9 y 0,3-1,1 puntos respectivamente).
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los datos de entrenamiento.
- El soporte se limita a chino, inglés y cantonés; no cubre otros idiomas.

## Enlaces

- Hugging Face: https://huggingface.co/zhiyi-ime/zhiyi-zhen-mini-12M
- Repositorio Zhiyi IME: https://github.com/dd1000001000/zhiyi_ime
- Repositorio de modelos Zhiyi: https://github.com/dd1000001000/zhiyi_models
- Release del modelo anterior: https://github.com/dd1000001000/zhiyi_models/releases/tag/model-zhen-mini-next-preview-1116
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
