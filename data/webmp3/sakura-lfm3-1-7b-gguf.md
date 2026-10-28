# webmp3/Sakura-LFM3-1.7B-GGUF

## Resumen

Sakura-LFM3-1.7B-GGUF es una cuantización comunitaria en formato GGUF del modelo LiquidAI/LFM3-1.7B, publicada por el usuario webmp3. No se trata de un modelo entrenado desde cero ni de una versión oficial de Liquid AI: es una recuantización realizada a partir del fichero BF16 GGUF publicado por el autor original (commit `b3f2ae5d73cd3c91bf40e8ba752c648aa05dffdf`, SHA-256 `39158a79...e9f68`) usando las herramientas estándar de llama.cpp junto con una importance matrix (imatrix).

El repositorio ofrece cuatro niveles de cuantización K-quant —Q2_K, Q3_K_M, Q4_K_M y Q5_K_M— que reducen el peso original de 3,5 GB a un rango de 0,75 GB a 1,26 GB, es decir, entre un 78 % y un 64 % menos. El modelo base declara 1.728.801.600 parámetros (1,7 B), arquitectura identificada como `lfm3`, licencia lfm1.0 y soporte de inglés y chino.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo conversacional de 1,7 B en hardware muy modesto (CPU, mini-PC, GPUs de gama de entrada); por otro, la model card documenta de forma inusualmente detallada el proceso de cuantización (hashes, builds de llama.cpp, matriz de importancia y medición de perplejidad y divergencia KL frente al BF16), lo que lo convierte en un caso útil para evaluar el coste real de cada nivel de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `lfm3` (identificador declarado en el GGUF); detalles internos de la arquitectura no disponibles |
| Parámetros totales | 1.728.801.600 (1,7 B) |
| Parámetros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF K-quants con imatrix: Q2_K (0,75 GB), Q3_K_M (0,91 GB), Q4_K_M (1,10 GB), Q5_K_M (1,26 GB) |
| Idiomas soportados | Inglés (en) y chino (zh) según la model card |
| Licencia | lfm1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | GGUF (4 ficheros); origen: GGUF BF16 de 3,5 GB |
| Modelo base | LiquidAI/LFM3-1.7B (relación: `quantized`) |
| Tamaño del repo | 4,0 GB |
| Descargas / likes | 0 descargas / 1 like |
| Etiquetas | gguf, quantization, imatrix, sakura, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

La model card solo declara el identificador de arquitectura `lfm3` y el origen de los pesos; no se documentan en la información disponible ni la topología interna (transformer, MoE, híbrida o SSM), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF/DPO. Tampoco se detallan innovaciones técnicas del modelo base. Todo ello debe consultarse en la model card del repositorio original de Liquid AI.

Lo que sí está documentado con precisión es el proceso de cuantización. Se partió del GGUF BF16 del repositorio `LiquidAI/LFM3-1.7B-GGUF` y se recuantizó con las herramientas de llama.cpp construidas desde el commit `19ff817fb25e9a1b838b1d7f9f4325f7bf9779c4` de ggml-org/llama.cpp, porque ninguna release oficial soportaba todavía esta arquitectura. La importance matrix se calculó una sola vez con `llama-imatrix` sobre un texto de calibración fijo (`hfqa-original-calibration-v2`, 6.144 bytes de inglés, alemán y chino, código y formatos de datos, dominio público, 12 fragmentos de 128 tokens) y se aplicó con `llama-quantize --imatrix` (SHA-256 de la matriz: `a0550e21...e3cc2`). El autor advierte explícitamente de que el texto de calibración es corto y de que no reclama mejora de calidad sin benchmark. Los tensores de normalización se mantienen en F32 en todos los ficheros (133 tensores), de modo que la etiqueta del cuant no describe la totalidad de los tensores.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` figura entre las declaradas por el repositorio; no hay información adicional sobre calidad de diálogo.
- Multilingüismo limitado a inglés y chino según la model card; el texto de calibración incluyó también alemán, pero el alemán no se declara como idioma soportado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de código y matemáticas: no disponibles como dato declarado (el conjunto de calibración incluyó código, pero eso no implica capacidad).
- Visión o audio: no disponible.
- Modo "thinking" o razonamiento explícito: no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el GGUF puede servirse con runtimes compatibles con la API de endpoints.

## Casos de uso

- Inferencia en local sin GPU: con ficheros de 0,75 a 1,26 GB, el modelo cabe en CPU y RAM de un mini-PC o un portátil modesto; útil para asistentes de escritorio totalmente offline donde la latencia no es crítica.
- Despliegue en dispositivos de borde: la variante Q2_K (750 MB) permite ejecución en placas tipo Raspberry Pi o dispositivos embebidos con suficiente RAM, para tareas de respuesta corta y clasificación.
- Prototipado y evaluación de la arquitectura `lfm3`: al ser un GGUF ya validado (estructura GGUF válida y prueba real de inferencia ejecutada con cada fichero), sirve para probar la arquitectura en llama.cpp antes de comprometerse con el checkpoint BF16 completo de 3,5 GB.
- Procesamiento por lotes en CPU: clasificación, etiquetado y extracción de entidades sobre textos en inglés o chino en pipelines que no disponen de acelerador hardware.
- Asistentes con requisitos de privacidad: escenarios en los que los datos no pueden salir del dispositivo (entornos sanitarios, legal, industrial) y basta un modelo de 1,7 B para tareas acotadas de resumen o respuesta guiada.
- Validación de cuantizaciones y pruebas de regresión de llama.cpp: los datos de perplejidad, KL y coincidencia de token superior frente al BF16 permiten usar el repo como referencia para comparar el impacto de cada nivel de cuantización en la misma arquitectura.
- Experimentación docente: ejemplo documentado de extremo a extremo de un flujo de cuantización con imatrix, con hashes y builds reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo que sí se publica es la desviación medida frente al GGUF BF16 de origen con `llama-perplexity` sobre dos textos de dominio público no usados en la calibración (*Pride and Prejudice* para inglés y *Hongloumeng* para chino; 64 ventanas de 512 tokens). La perplejidad del BF16 de referencia en ese conjunto es 84,459.

| Cuant | Perplejidad | Ratio frente al origen | Divergencia KL media | Mismo token superior |
|---|---:|---:|---:|---:|
| Q2_K | 134,771 | 1,5957 ± 0,0316 | 1,00500 | 46,16 % |
| Q3_K_M | 92,416 | 1,0942 ± 0,0140 | 0,41925 | 64,11 % |
| Q4_K_M | 87,582 | 1,0370 ± 0,0085 | 0,16863 | 76,63 % |
| Q5_K_M | 85,276 | 1,0097 ± 0,0050 | 0,06080 | 85,03 % |

El propio autor advierte de que estas cifras miden únicamente la concordancia con el modelo de origen en esos textos y no son benchmarks de tarea, por lo que no dicen nada sobre otros idiomas o tareas.

## Requisitos de hardware

- VRAM/RAM para los pesos: 0,75 GB (Q2_K), 0,91 GB (Q3_K_M), 1,10 GB (Q4_K_M) y 1,26 GB (Q5_K_M); el BF16 de origen requiere 3,5 GB.
- VRAM total estimada para inferencia: en el entorno de 1,5 a 2,5 GB con contexto moderado, sumando pesos y caché KV; el tamaño exacto de la caché KV no está documentado porque se desconoce la longitud de contexto y la configuración de cabezas.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4060); una RTX 4090 o una A100 están muy sobredimensionadas para 1,7 B en GGUF y solo tendrían sentido para servir muchas peticiones en paralelo.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales con 4 GB o más; también en Apple Silicon mediante Metal y en CPU pura.
- Opciones de despliegue: llama.cpp es el runtime de referencia y requiere una build con soporte de la arquitectura `lfm3` (el autor usó el commit `19ff817fb25e9a1b838b1d7f9f4325f7bf9779c4`, ya que ninguna release oficial lo incluía). Otros runtimes basados en GGUF (Ollama, LM Studio, KoboldCpp) no están documentados en la información disponible y dependerán de que incorporen la misma arquitectura.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Sakura-LFM3-1.7B Q4_K_M (este repo) | 1,7 B | No disponible | GGUF, 1,10 GB | lfm1.0 | Cuantización comunitaria con imatrix; perplejidad 87,582 |
| Sakura-LFM3-1.7B Q5_K_M (este repo) | 1,7 B | No disponible | GGUF, 1,26 GB | lfm1.0 | Mayor fidelidad: ratio 1,0097 y 85,03 % de coincidencia de token superior |
| LiquidAI/LFM3-1.7B-GGUF (BF16, oficial) | 1,7 B | No disponible | GGUF BF16, 3,5 GB | lfm1.0 | Referencia de calidad; perplejidad 84,459 en el mismo conjunto |
| Otras familias de 1–2 B (Qwen, Llama, Gemma) | No disponible | No disponible | No disponible | No disponible | Sin datos en la información proporcionada; no se comparan para no introducir cifras no verificadas |

## Limitaciones y advertencias

- No es una release oficial: se trata de una cuantización independiente de la comunidad; los autores originales conservan la licencia y la atribución, y cualquier incidencia de calidad debe validarse contra el BF16.
- Degradación severa en Q2_K: ratio de perplejidad 1,5957, KL 1,005 y solo un 46,16 % de coincidencia en el token superior. No es recomendable para producción si se necesita fidelidad al modelo original.
- Los datos de perplejidad se limitan a dos textos (inglés y chino) y 64 ventanas de 512 tokens; no hay benchmarks de tarea, de razonamiento ni de código.
- La calibración de la imatrix es muy corta (6.144 bytes, 12 fragmentos de 128 tokens) y el autor no reclama mejora de calidad derivada de ella.
- Idiomas: solo inglés y chino declarados; no hay soporte declarado de castellano, por lo que el rendimiento en español es desconocido y no está validado.
- Riesgo de alucinación: inherente a un modelo de 1,7 B; no se publican evaluaciones de veracidad ni de robustez.
- Longitud de contexto desconocida: impide planificar casos de uso con documentos largos o conversaciones multi-turno extensas.
- Licencia lfm1.0 bajo `license: other`: las condiciones de uso comercial deben revisarse en el fichero LICENSE enlazado antes de cualquier despliegue en producción.
- Dependencia de una build concreta de llama.cpp: sin soporte de `lfm3` en releases oficiales en el momento de la publicación, el modelo puede no cargar en runtimes desactualizados.
- Validación externa mínima: 0 descargas y 1 like en el momento de la consulta, sin evidencia de uso en producción por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webmp3/Sakura-LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF oficial del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Model card del modelo base en el commit de referencia: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF/blob/b3f2ae5d73cd3c91bf40e8ba752c648aa05dffdf/README.md
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF/resolve/b3f2ae5d73cd3c91bf40e8ba752c648aa05dffdf/LICENSE
- Commit de llama.cpp usado para la cuantización: https://github.com/ggml-org/llama.cpp/commit/19ff817fb25e9a1b838b1d7f9f4325f7bf9779c4
