# taobao-mnn/MNN-Pocket-0.3B-MNN

## Resumen

MNN-Pocket-0.3B-MNN es la exportación al formato del runtime MNN del modelo MNN-Pocket-0.3B, una familia de modelos de lenguaje compactos (~300M parámetros) desarrollada por el equipo taobao-mnn (Alibaba) y co-diseñada junto con la pila de inferencia MNN para despliegue en dispositivo (Android, iOS, HarmonyOS y dispositivos edge). Este repositorio concreto contiene la build cuantizada a INT4 (W4A16) mediante entrenamiento consciente de cuantización (QAT), que es el formato destinado a aplicaciones en producción.

El modelo resuelve el problema de ejecutar un LLM útil en hardware móvil con un footprint total de 173 MB, manteniendo una calidad muy cercana a la versión BF16: una media de 49,59 frente a 50,00 en una suite de 11 benchmarks, es decir, solo 0,41 puntos de caída. Con 32K de contexto y una plantilla de chat estilo ChatML embebida en `llm_config.json`, está pensado para asistentes en dispositivo, extracción de datos y pipelines agénticos ligeros, no para cargas de razonamiento intensivo.

La relevancia actual reside en que demuestra que la cuantización QAT a INT4, combinada con un runtime optimizado (Metal, OpenCL, CPU), permite velocidades de decodificación de hasta 466 tok/s en un iPad Pro M5 y 251 tok/s en un Snapdragon 8 Gen 5, con una licencia Apache 2.0 que facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 28 capas |
| Parametros totales | ~300M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K (40.960 position embeddings) |
| Tipos de cuantizacion | INT4 W4A16 (quant_bit 4, group size 64; alpha de tied-embedding en fp16); modelo base disponible en BF16 |
| Idiomas soportados | Chino e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `llm_config.json`, `tokenizer.mtok`, `config.json`) |

Otros parámetros técnicos: hidden size 896, 14 cabezas de atención con GQA de 2 KV heads y head_dim 64, FFN intermedio de 2560 con activación SiLU, vocabulario de 65.536 tokens y embeddings de entrada/salida atados (tied). Backends soportados: CPU, Metal y OpenCL.

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de 28 capas con atención GQA (14 cabezas de consulta y 2 KV heads, head_dim 64), hidden size 896 y FFN de 2560 con SiLU. El vocabulario es de 65.536 tokens y los embeddings de entrada y salida están atados, lo que reduce el número de parámetros y facilita el despliegue en memoria limitada. La ventana de contexto es de 32K tokens, respaldada por 40.960 position embeddings.

La innovación principal de esta build es el uso de QAT (quantization-aware training) en lugar de cuantización post-hoc: los pesos se entrenan teniendo en cuenta la cuantización INT4 (W4A16, group size 64), con el alpha del tied-embedding mantenido en fp16. Esto explica la mínima degradación frente a BF16 (0,41 puntos de media en 11 benchmarks). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información corresponde al modelo base y no se ha incluido en esta ficha.

## Capacidades

- Generación de texto conversacional en chino e inglés con plantilla ChatML integrada en el runtime.
- Extracción de datos y tareas de procesamiento de información estructurada.
- Pipelines agénticos ligeros y de múltiples pasos (el autor lo indica como caso de uso adecuado).
- Contexto largo de hasta 32K tokens para conversaciones multi-turno o documentos extensos.
- Inferencia en dispositivo con backends CPU, Metal y OpenCL seleccionables en `config.json`.
- Ajuste de runtime sin re-exportar: `backend_type`, `thread_num`, `precision`, `memory` y sampler configurables.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento matemático avanzado y código de horizonte largo: explícitamente no recomendado por el autor.

## Casos de uso

- Asistente en dispositivo para móviles: con 173 MB de footprint y 32K de contexto, puede integrarse en apps Android, iOS o HarmonyOS para conversaciones multi-turno sin conexión a red, usando Metal u OpenCL para acelerar.
- Extracción de datos estructurados en el edge: el modelo está indicado por el autor para data extraction; se usaría para convertir texto libre en campos estructurados localmente, evitando enviar datos sensibles a la nube.
- Pipelines agénticos ligeros: al soportar contexto largo y plantilla ChatML, puede orquestar pasos simples de un agente en dispositivo, como clasificar, resumir y decidir la siguiente acción.
- Autocompletado y asistencia de escritura en apps de productividad: con 251 tok/s de decodificación en CPU de Snapdragon 8 Gen 5, la latencia es compatible con sugerencias en tiempo real.
- Procesamiento de documentos en dispositivos sin GPU dedicada: el backend CPU con `thread_num` ajustable permite ejecutar resumen o extracción sobre textos largos en portátiles y mini-PC edge.
- Filtrado y moderación local de contenido: un modelo de 300M puede clasificar o reescribir texto en el propio dispositivo, reduciendo costes de inferencia en servidor y preservando la privacidad.
- Prototipado rápido de funcionalidades LLM en apps móviles: la licencia Apache 2.0 y el tamaño reducido permiten embeberlo en builds de desarrollo sin infraestructura adicional.

## Benchmarks y rendimiento

Resultados de la suite de 11 benchmarks del autor (mayor es mejor), comparando la build INT4 con BF16 y modelos abiertos de tamaño similar o superior:

| Benchmark | INT4 (este repo) | BF16 | Gemma-3-270M | ERNIE-4.5-0.3B | LFM2.5-350M | SmolLM2-360M | Hunyuan-0.5B | MiniCPM4-0.5B | Qwen3-0.6B |
|---|---|---|---|---|---|---|---|---|---|
| **Media** | 49,59 | 50,00 | 6,42 | 31,99 | 31,28 | 18,43 | 31,22 | 46,81 | no disponible |

La información proporcionada solo incluye la fila de media; no se han publicado en ella los resultados desglosados por benchmark individual.

Velocidad en dispositivo (INT4, contexto de 512 tokens):

| Dispositivo | Backend | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|
| iPad Pro M5 | Metal | 8.721 | 466 |
| iPad Pro M5 | CPU | 2.228 | 231 |
| Snapdragon 8 Gen 5 | OpenCL | 3.403 | 138 |
| Snapdragon 8 Gen 5 | CPU | 930 | 251 |

## Requisitos de hardware

- Footprint total de 173 MB (171 MB de pesos INT4 + grafo, tokenizer y configuración), lo que permite ejecución en dispositivos con poca memoria.
- Cabe en cualquier GPU de consumo actual; la build está orientada a CPU móvil, Metal (Apple) y OpenCL (Qualcomm), no a GPUs de servidor.
- GPU recomendadas por el autor: Apple M5 (iPad Pro) con Metal y Snapdragon 8 Gen 5 con OpenCL; también funciona en CPU de ambos.
- Despliegue mediante el runtime MNN: compilación con `-DMNN_LOW_MEMORY=true -DMNN_BUILD_LLM=true -DMNN_SUPPORT_TRANSFORMER_FUSE=true`, y opcionalmente `-DMNN_METAL=ON` o `-DMNN_OPENCL=ON`.
- No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible; el formato es específico de MNN.
- Throughput medido: hasta 8.721 tok/s de prefill y 466 tok/s de decode en iPad Pro M5 con Metal; 930 tok/s de prefill y 251 tok/s de decode en CPU de Snapdragon 8 Gen 5.
- Ajuste de latencia mediante `thread_num`, `precision`/`memory` (`low` o `normal`) y sampler (temperatura 0,8, top_p 0,8, top_k 20 recomendados).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media en suite (11 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-MNN (INT4) | ~300M | 32K | 49,59 | Apache 2.0 | Hugging Face (formato MNN) |
| MNN-Pocket-0.3B (BF16) | ~300M | 32K | 50,00 | Apache 2.0 | Hugging Face |
| MiniCPM4-0.5B | ~500M | no disponible | 46,81 | no disponible | Hugging Face |
| ERNIE-4.5-0.3B | ~300M | no disponible | 31,99 | no disponible | Hugging Face |
| LFM2.5-350M | ~350M | no disponible | 31,28 | no disponible | Hugging Face |
| Hunyuan-0.5B | ~500M | no disponible | 31,22 | no disponible | Hugging Face |
| SmolLM2-360M | ~360M | no disponible | 18,43 | no disponible | Hugging Face |
| Gemma-3-270M | ~270M | no disponible | 6,42 | no disponible | Hugging Face |
| Qwen3-0.6B | ~600M | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a la media de la suite del autor; no se dispone de desglose por benchmark ni de datos de contexto y licencia de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- No recomendado por el autor para cargas de razonamiento intensivo: matemáticas avanzadas y código de horizonte largo quedan fuera de su ámbito.
- Idiomas limitados a chino e inglés; no hay soporte declarado de castellano ni de otros idiomas.
- Riesgo de alucinación inherente a un modelo de ~300M parámetros; conviene validar salidas en producción.
- Sesgos conocidos: no se documentan en la información disponible.
- La build INT4 requiere un runtime MNN de la misma familia de revisión que la exportación; un runtime desajustado falla con `Load module failed`.
- El formato de pesos es específico de MNN; no es directamente compatible con vLLM, llama.cpp u otros runtimes sin conversión.
- Metal y OpenCL están desactivados por defecto en la compilación; hay que habilitarlos explícitamente.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente.
- No se han publicado datos de sesgos, robustez frente a prompts adversarios ni evaluación en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-MNN
- Modelo base (BF16): https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Colección MNN-Pocket-0.3B: https://huggingface.co/collections/taobao-mnn/mnn-pocket-03b
- Repositorio MNN en GitHub: https://github.com/alibaba/MNN
- Informe técnico (PDF): https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/resolve/main/MNN-Pocket-0.3B-Technical-Report.pdf
- README en chino: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-MNN/blob/main/README-cn.md
- Demo en vídeo: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/resolve/main/assets/demo.mp4
