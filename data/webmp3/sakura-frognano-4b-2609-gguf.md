# webmp3/Sakura-FrogNano-4B-2609-GGUF

## Resumen

Sakura-FrogNano-4B-2609-GGUF es una cuantización comunitaria en formato GGUF del modelo multimodal FrogNano-4B-2609 de Microsoft, publicado por el usuario webmp3 bajo la línea "Sakura Mini". El modelo original emplea la arquitectura Qwen3.5, tiene 4.326.350.848 parámetros (aproximadamente 4,3 mil millones), es de tipo image-text-to-text, soporta tool calling y dispone de capas de predicción multi-token. La licencia del modelo base y de esta cuantización es MIT.

El repositorio no contiene un único archivo, sino tres GGUF de distinto tamaño (1,89 GiB a 3,74 bpw; 2,31 GiB a 4,59 bpw; y 2,82 GiB a 5,61 bpw), generados mediante una asignación de tipos de cuantización por matriz basada en un problema de mochila sobre bytes, con matriz de importancia de bartowski y protección manual de primeras y últimas capas, proyecciones down y embeddings. El objetivo es ofrecer un abanico de compromisos tamaño/calidad para ejecución en llama.cpp estándar.

Es relevante porque permite desplegar un modelo multimodal compacto de 4B con tool calling en hardware de consumo, y porque el autor publica métricas de divergencia KL y perplejidad frente al BF16 de referencia y frente a las cuantizaciones imatrix de bartowski, algo poco habitual en cuantizaciones comunitarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal, image-text-to-text), con capas de predicción multi-token |
| Parametros totales | 4.326.350.848 (≈4,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixtos: IQ3_S, IQ3_XXS, Q3_K, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0 (reparto por archivo detallado abajo) |
| Idiomas soportados | no disponible (las métricas de evaluación se miden en alemán e inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (tres archivos); el modelo base se distribuye en BF16 |

Reparto de tipos por archivo (porcentaje de bytes):

| Archivo | Tamano | bpw | Tipos de tensor |
|---|---:|---:|---|
| Sakura-FrogNano-4B-2609-1.90GiB.gguf | 1,89 GiB | 3,74 | IQ3_S 40 %, IQ3_XXS 14 %, Q3_K 13 %, IQ4_XS 12 %, Q4_K 10 %, Q8_0 7 %, Q5_K 3 % |
| Sakura-FrogNano-4B-2609-2.32GiB.gguf | 2,31 GiB | 4,59 | IQ4_XS 70 %, Q5_K 19 %, Q8_0 6 %, Q4_K 5 % |
| Sakura-FrogNano-4B-2609-2.83GiB.gguf | 2,82 GiB | 5,61 | Q5_K 84 %, Q8_0 6 %, Q6_K 6 %, IQ4_XS 4 % |

## Arquitectura y entrenamiento

El modelo base FrogNano-4B-2609 es un modelo multimodal compacto de Microsoft construido sobre la arquitectura Qwen3.5, con 4.326.350.848 parámetros y capacidad image-text-to-text (entrada de imagen y texto, salida de texto). Incorpora soporte de tool calling y capas de predicción multi-token. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Esta ficha describe una cuantización, no un entrenamiento. El proceso de cuantización parte del GGUF BF16 y de la matriz de importancia de bartowski; cada matriz de pesos grande se cuantiza una vez por cada tipo candidato (Q2_K, IQ2_S, IQ3_XXS, IQ3_S, Q3_K, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0) con `llama-quantize`, se estima el error por matriz con ponderación por importancia y protección manual de primeras y últimas capas, proyecciones down y embeddings, y una asignación exacta de presupuesto (mochila múltiple sobre bytes) elige un tipo por matriz para cada tamaño objetivo. El modelo final se ensambla a partir de los tensores ya almacenados, sin recuantizar. Norms, tensores pequeños y capas de predicción multi-token se mantienen en alta precisión. El autor no publica las elecciones por tensor.

## Capacidades

- Generación de texto y conversación multi-turno (tag `conversational`).
- Procesamiento multimodal image-text-to-text: acepta imágenes junto con texto.
- Tool calling / function calling, según la model card del modelo base.
- Predicción multi-token mediante capas dedicadas, conservadas en alta precisión en la cuantización.
- Compatible con endpoints (`endpoints_compatible`) y ejecutable en llama.cpp estándar al usar únicamente tipos ggml estándar.
- Capacidades multilingües: no disponibles como lista oficial; la evaluación de la cuantización usa textos en alemán e inglés.
- Razonamiento multi-step y comportamiento de agente: no disponible como dato verificado en la información proporcionada.

## Casos de uso

- Asistente conversacional local: los tres archivos caben en memoria de equipos de consumo, de modo que se puede desplegar un chatbot multi-turno con llama.cpp sin GPU de datacenter, eligiendo el archivo de 2,31 GiB como compromiso por defecto.
- Procesamiento de documentos con imagen: al ser image-text-to-text, permite extraer y resumir información de capturas, formularios escaneados o figuras, enviando la imagen junto al prompt en una única petición.
- Automatización con tool calling: el soporte de function calling del modelo base permite conectarlo a APIs externas (calendario, consultas a bases de datos, servicios HTTP) y orquestar llamadas desde un agente ligero.
- Prototipado en portátiles sin GPU dedicada: el archivo de 1,89 GiB (3,74 bpw) está pensado para presupuestos de memoria ajustados, aceptando una pérdida de calidad visible a cambio de ejecución en CPU.
- Evaluación de cuantizaciones en investigación: las métricas de KLD y perplejidad publicadas por el autor permiten estudiar el impacto de distintos esquemas mixtos sobre un mismo modelo de referencia BF16.
- Despliegue en el borde (edge): el tamaño reducido del archivo mayor (2,82 GiB) facilita empaquetar el modelo en dispositivos con almacenamiento y RAM limitados para tareas de clasificación o resumen multimodal.
- Integración en pipelines de CI/CD para tareas de código o texto: al ser compatible con llama.cpp y endpoints, puede invocarse como servicio interno en pruebas automatizadas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor mide exclusivamente divergencia KL y perplejidad sobre textos cortos retenidos, y advierte explícitamente que no deben interpretarse como una afirmación de calidad en tareas.

Perplejidad del BF16 de referencia: de 2,186; en 1,866; dev 1,949.

| Quant | Origen | Tamano | KLD de | KLD en | KLD dev | PPL de | Mismo token top (media) |
|---|---|---:|---:|---:|---:|---:|---:|
| IQ3_XXS | bartowski (imatrix) | 1,84 GiB | 0,1275 | 0,0919 | 0,0833 | 2,420 | 91,1 % |
| Sakura 1.90GiB | este repositorio | 1,90 GiB | 0,1218 | 0,0899 | 0,0788 | 2,424 | 90,6 % |
| Q3_K_M | bartowski (imatrix) | 1,99 GiB | 0,0914 | 0,0723 | 0,0591 | 2,323 | 91,8 % |
| Sakura 2.32GiB | este repositorio | 2,32 GiB | 0,0286 | 0,0245 | 0,0227 | 2,240 | 95,3 % |
| IQ4_XS | bartowski (imatrix) | 2,33 GiB | 0,0303 | 0,0224 | 0,0221 | 2,249 | 95,5 % |
| Sakura 2.83GiB | este repositorio | 2,83 GiB | 0,0093 | 0,0072 | 0,0073 | 2,201 | 97,5 % |
| Q5_K_S | bartowski (imatrix) | 2,94 GiB | 0,0067 | 0,0051 | 0,0053 | 2,199 | 97,7 % |

Metodología: 12 fragmentos de 512 tokens por texto; textos retenidos en alemán, en inglés y un conjunto de texto de desarrollador; medición única en una máquina. El autor señala que diferencias pequeñas de KLD a tamaño similar no constituyen un ranking de calidad.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,9 GiB (archivo 3,74 bpw), 2,3 GiB (4,59 bpw) y 2,8 GiB (5,61 bpw) solo para los pesos, más el espacio de contexto KV y el búfer de cómputo.
- GPU recomendadas: no disponibles como dato oficial; por tamaño, cualquier GPU consumer con 4-6 GB o más de VRAM debería alojar los pesos. No se especifican modelos concretos (A100, H100, RTX 4090) en la información.
- Cabe en GPU de consumo: sí, los tres archivos, dado su tamaño inferior a 3 GiB; el de 1,89 GiB está pensado para presupuestos de memoria ajustados.
- Opciones de despliegue: llama.cpp en stock (todos los tipos son ggml estándar); el tag `endpoints_compatible` sugiere uso como endpoint. No se confirma compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sakura-FrogNano-4B-2609-GGUF (este) | 4,33 B | no disponible | GGUF (3 archivos, 1,89-2,82 GiB) | MIT | Cuantización mixta con asignación por matriz |
| bartowski/FrogNano-4B-2609-GGUF | 4,33 B | no disponible | GGUF (IQ3_XXS, Q3_K_M, IQ4_XS, Q5_K_S medidos) | MIT | Referencia imatrix usada como base; métricas KLD/PPL comparables |
| microsoft/FrogNano-4B-2609 | 4,33 B | no disponible | BF16 | MIT | Modelo original; referencia de perplejidad (2,186 / 1,866 / 1,949) |

A tamaño comparable, el archivo de 2,32 GiB de este repositorio obtiene KLD de 0,0286 frente a 0,0303 de IQ4_XS de bartowski (2,33 GiB), y el de 2,83 GiB obtiene 0,0093 frente a 0,0067 de Q5_K_S (2,94 GiB), que es algo mayor. El autor advierte que estas diferencias no deben leerse como ranking.

## Limitaciones y advertencias

- No es una versión oficial de Microsoft: es una cuantización comunitaria independiente del modelo base.
- Solo se ha evaluado con divergencia KL y perplejidad sobre textos cortos retenidos, no con benchmarks de tareas; no debe interpretarse como garantía de calidad en uso real.
- La cuantización siempre degrada la calidad; el archivo de 1,89 GiB es el que más pierde, con un 90,6 % de mismo token top y KLD de 0,1218 en alemán.
- El autor no publica las elecciones de tipo por tensor, lo que limita la reproducibilidad fina del esquema.
- Idiomas soportados no documentados oficialmente; la evaluación cubre alemán e inglés, sin datos para castellano.
- Longitud de contexto no disponible; no se puede planificar el uso en conversaciones largas sin verificarla en el modelo base.
- Riesgo de sesgos y alucinaciones: no documentado en la información proporcionada; aplican los riesgos habituales de un modelo de 4B.
- Licencia MIT: permite uso comercial, pero se recomienda conservar el archivo LICENSE incluido y la atribución a Microsoft y bartowski.
- El repositorio ocupa 12,1 GB pese a que los archivos GGUF suman menos de 8 GiB; conviene revisar la página de archivos antes de descargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webmp3/Sakura-FrogNano-4B-2609-GGUF
- Modelo base: https://huggingface.co/microsoft/FrogNano-4B-2609
- GGUF BF16, matriz de importancia y cuantizaciones de referencia: https://huggingface.co/bartowski/FrogNano-4B-2609-GGUF
- Colección Sakura Mini: https://huggingface.co/collections/webmp3/sakura-mini-6aba73f6a5a41296a3540373
- llama.cpp: https://github.com/ggml-org/llama.cpp
- README en chino simplificado: README_zh.md (dentro del repositorio)
