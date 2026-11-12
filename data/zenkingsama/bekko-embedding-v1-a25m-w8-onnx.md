# zenkingsama/bekko-embedding-v1-a25m-w8-onnx

## Resumen

`zenkingsama/bekko-embedding-v1-a25m-w8-onnx` es una versión cuantizada a int8 (weight-only) del modelo de embeddings `hotchpotch/bekko-embedding-v1-a25m`, exportada a formato ONNX para su uso en pipelines de similitud semántica y extracción de características. El modelo base emplea una arquitectura ModernBERT y está pensado para generar representaciones vectoriales densas de texto mediante pooling MEAN seguido de normalización L2. El autor de esta variante es el usuario de Hugging Face `zenkingsama`, y se publica bajo licencia MIT.

La relevancia de esta ficha radica en que se trata de una conversión de precisión reducida orientada al despliegue: todos los productos matriciales con pesos constantes se han sustituido por la operación `MatMulNBits` de ONNX Runtime (8 bits, block_size 32, simétrico), manteniendo las activaciones en fp32. El resultado es un artefacto de aproximadamente 421 MB de pesos que reproduce fielmente el export fp32 original (coseno mínimo de 0,999615 sobre 13 textos de prueba multilingües).

El modelo está etiquetado para `sentence-similarity` y `feature-extraction`, es compatible con `text-embeddings-inference` y con endpoints, y hereda el tokenizador del modelo base (que a su vez reutiliza el tokenizador de Gemma 2 vía mmBERT). No se dispone de información sobre idiomas soportados ni sobre benchmarks de rendimiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | no disponible (nombre del modelo sugiere ~25M, no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only (MatMulNBits, bits=8, block_size=32, simétrico); activaciones en fp32 |
| Idiomas soportados | no disponible (pruebas de fidelidad en inglés, chino, japonés, francés y alemán) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model.onnx` + sidecar externo `onnx/model.onnx_data`) |
| Dimension de embedding | no disponible (heredada del modelo base, sin cambios) |
| Pooling | MEAN + normalización L2 |
| Tamano del repo | 0,5 GB |
| Libreria | onnx |
| Modelo base | hotchpotch/bekko-embedding-v1-a25m (revision 44f0b8af0f487acd0ccf1a7cb7ae7a29a6dfc09c) |

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT orientado a la generación de embeddings de frase. Esta variante no reentrena ni modifica el tokenizador ni la cabeza de pooling: parte del export oficial fp32 (`onnx/model_fp32_not_recommended.onnx`) y aplica una cuantización weight-only de 8 bits. Concretamente, cada `MatMul` con peso constante se reemplaza por `MatMulNBits` con `bits=8`, `block_size=32` y cuantización simétrica; la tabla de embeddings de tokens (operación `Gather`) permanece en fp32, al igual que las activaciones. Esta decisión de diseño garantiza que el vector de un texto no dependa de los demás textos del lote, es decir, la codificación por lotes y la codificación individual producen resultados idénticos (coseno mínimo de 1,000000 entre ambos modos).

El proceso de conversión se documenta mediante un script reproducible (`scripts/prepare-embedding-w8.py` del repositorio Slipwiki) con dependencias fijadas (onnx 1.23.2, onnxruntime 1.24.4, numpy 2.3.5, tokenizers 0.22.2, onnx-ir 1.1.0, CPython 3.12.14), y se indica que re-ejecutarlo reproduce los ficheros byte a byte. La fidelidad frente al export fp32 se midió sobre 13 textos integrados (inglés, chino, japonés, francés, alemán, textos muy cortos y truncados), obteniendo un coseno mínimo de 0,999615. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre si se aplicaron técnicas de RLHF/DPO (no aplicables típicamente a modelos de embeddings).

## Capacidades

- Generación de embeddings de texto para similitud semántica y búsqueda vectorial.
- Extracción de características (`feature-extraction`) a partir de texto.
- Pooling MEAN con normalización L2 del vector resultante.
- Codificación determinista e independiente del lote: el vector de un texto no varía según los demás textos del batch.
- Compatibilidad con `text-embeddings-inference` y con endpoints.
- Multilingüismo: aunque no se declaran idiomas oficiales, las pruebas de fidelidad cubren inglés, chino, japonés, francés y alemán.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio (es un encoder de embeddings, no un modelo generativo).

## Casos de uso

- Búsqueda semántica en bases de conocimiento: indexar documentos con este encoder y recuperar por similitud coseno; el tamaño reducido (int8, ~421 MB de pesos) permite desplegarlo en CPU sin GPU dedicada.
- Sistemas RAG (retrieval-augmented generation): usar el modelo como retriever denso para alimentar un LLM generativo con pasajes relevantes, aprovechando la compatibilidad con `text-embeddings-inference`.
- Deduplicación y clustering de textos: agrupar documentos o tickets similares calculando embeddings y aplicando clustering sobre las distancias coseno; la fidelidad de 0,999615 frente a fp32 garantiza que la cuantización no altera la ordenación de vecinos.
- Moderación y clasificación por similitud: comparar mensajes de usuario contra un conjunto de ejemplos etiquetados y asignar la categoría del vecino más cercano, con inferencia en CPU vía ONNX Runtime.
- Búsqueda multilingüe: al heredar el tokenizador de Gemma 2 vía mmBERT y mostrar fidelidad en varios idiomas, puede emplearse para recuperación cross-lingüe en aplicaciones con contenido en inglés, chino, japonés, francés y alemán.
- Despliegue en entornos con recursos limitados: al ser ONNX int8 con activaciones fp32, encaja en contenedores sin GPU o en dispositivos edge donde un modelo fp32 no cabría o tendría latencia excesiva.
- Evaluación de similitud en pipelines de CI: el script de conversión reproducible y los hashes SHA-256 publicados permiten verificar artefactos en integración continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, MTEB, etc.) en la información disponible. El único dato de rendimiento publicado es la fidelidad frente al export fp32:

| Metrica | Valor |
|---|---|
| Coseno minimo frente a fp32 (13 textos, 5 idiomas) | 0,999615 |
| Coseno minimo entre codificacion por lotes e individual | 1,000000 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el sidecar de pesos ocupa 421.292.544 bytes (~402 MiB), por lo que en fp32 de activaciones y con overhead de runtime el consumo es moderado y apto para CPU.
- GPU recomendadas: no se especifican; al ser un modelo de embeddings de pequeño tamaño (~25M según el nombre, no confirmado), cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente. Para CPU, ONNX Runtime con `MatMulNBits` está optimizado.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño de pesos.
- Opciones de despliegue: ONNX Runtime (versión 1.24.4 usada en la conversión), `text-embeddings-inference`, endpoints compatibles. No se menciona soporte para vLLM, llama.cpp u Ollama (no aplicables a un encoder de embeddings).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| zenkingsama/bekko-embedding-v1-a25m-w8-onnx | no disponible (~25M por nombre) | no disponible | ONNX int8 | MIT | Variante cuantizada weight-only, fidelidad 0,999615 vs fp32 |
| hotchpotch/bekko-embedding-v1-a25m | no disponible (~25M por nombre) | no disponible | safetensors / ONNX fp32 | MIT | Modelo base original, sin cuantizar |
| Alternativas de embeddings de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información |

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, no razona, no soporta tool calling ni agentes.
- No se declaran oficialmente los idiomas soportados; el multilingüismo solo está respaldado por pruebas de fidelidad, no por evaluación de calidad de embeddings por idioma.
- La cuantización int8 introduce una degradación mínima pero no nula (coseno mínimo 0,999615 frente a fp32); para aplicaciones con requisitos extremos de precisión conviene validar contra el modelo base.
- Riesgo de sesgos heredados del modelo base y de su dataset de entrenamiento, no documentado en esta ficha.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de representaciones pobres para dominios o idiomas no cubiertos por el modelo base.
- La licencia MIT permite uso comercial, pero el tokenizador heredado de Gemma 2 (vía mmBERT) tiene sus propios términos, que deben revisarse según lo indicado por el modelo upstream.
- El fichero `onnx/model_fp32_not_recommended.onnx` del modelo base está marcado como no recomendado; esta variante depende de él solo como fuente de conversión.
- No hay información sobre latencia, throughput ni consumo de memoria en producción; es necesario medirlo en el entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenkingsama/bekko-embedding-v1-a25m-w8-onnx
- Modelo base: https://huggingface.co/hotchpotch/bekko-embedding-v1-a25m
- Revision del modelo base: 44f0b8af0f487acd0ccf1a7cb7ae7a29a6dfc09c
- Script de conversion: `scripts/prepare-embedding-w8.py` en el repositorio Slipwiki (no se proporciona URL directa)
