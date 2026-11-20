# taobao-mnn/MNN-Pocket-0.3B-MNN

## Resumen

MNN-Pocket-0.3B-MNN es la exportación cuantizada del modelo MNN-Pocket-0.3B, una familia de modelos de lenguaje compactos de aproximadamente 300 millones de parámetros desarrollada por el equipo taobao-mnn (Alibaba) y codiseñada con la pila de inferencia MNN para despliegue en dispositivo. Este repositorio concreto contiene la build INT4 (W4A16) entrenada con cuantización consciente del entrenamiento (QAT), que es el formato destinado a aplicaciones en producción sobre Android, iOS, HarmonyOS y dispositivos de borde.

El modelo resuelve el problema del despliegue de asistentes conversacionales y extracción de datos en entornos con recursos muy limitados: ocupa 173 MB en total (171 MB de pesos más grafo, tokenizador y configuración) y alcanza hasta 466 tok/s de decodificación en un iPad Pro M5 con backend Metal, o 251 tok/s en CPU de Snapdragon 8 Gen 5. La arquitectura es un transformer decoder-only de 28 capas con GQA, contexto de 32K tokens y vocabulario de 65.536 entradas.

Su relevancia actual radica en que demuestra que la cuantización QAT a INT4 apenas degrada la calidad (49,59 frente a 50,00 de media en una suite de 11 benchmarks, una caída de 0,41 puntos) mientras reduce el peso a una fracción del tamaño en BF16, lo que permite ejecutar un LLM útil en teléfonos y tabletas sin conexión a la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 28 capas |
| Parametros totales | ~300M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K (40.960 position embeddings) |
| Tipos de cuantizacion | INT4 W4A16 (quant_bit 4, group size 64); alpha de tied-embedding en fp16; referencia BF16 del modelo base |
| Idiomas soportados | chino e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `llm_config.json`, `tokenizer.mtok`) |
| Hidden size | 896 |
| Atencion | 14 cabezas, GQA con 2 KV heads, head_dim 64 |
| FFN intermedio | 2560 (SiLU) |
| Vocabulario | 65.536 |
| Embeddings | tied input/output |
| Backends | CPU / Metal / OpenCL (configurable en `config.json`) |
| Tamano de pesos | 171 MB (`llm.mnn.weight`); ~173 MB footprint total |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 28 capas con hidden size de 896, atención con 14 cabezas y GQA de 2 KV heads (head_dim 64), FFN intermedio de 2560 con activación SiLU y embeddings de entrada/salida atados. El vocabulario es de 65.536 tokens y el contexto alcanza 32K posiciones (40.960 position embeddings). La plantilla de chat es de estilo ChatML y va embebida en `llm_config.json`, de modo que el runtime MNN la aplica automáticamente.

La innovación principal es el pipeline de cuantización: no se trata de una cuantización post-hoc, sino de QAT (quantization-aware training) a INT4 con esquema W4A16, quant_bit 4 y group size 64, manteniendo el alpha del tied-embedding en fp16. Esto explica que la media de 11 benchmarks caiga solo 0,41 puntos respecto a BF16 (49,59 frente a 50,00). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional en chino e inglés con plantilla ChatML.
- Asistencia en dispositivo sin conexión: el modelo está pensado para asistentes locales en móvil y tableta.
- Extracción de datos estructurados y tareas de parsing de texto ligero.
- Pipelines agénticos ligeros de corto alcance (el autor lo recomienda para este uso, no para razonamiento prolongado).
- Contexto largo de 32K tokens para conversaciones multi-turno y documentos medianos.
- Inferencia acelerada por hardware en CPU, Metal (Apple) y OpenCL (Qualcomm), con backends seleccionables en configuración.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo thinking en la información disponible.
- No recomendado para matemáticas avanzadas ni código de horizonte largo, según el propio autor.

## Casos de uso

- Asistente de voz o chat en aplicaciones móviles sin conexión: con 173 MB de footprint y 251 tok/s de decodificación en CPU de Snapdragon 8 Gen 5, el modelo puede gestionar conversaciones multi-turno locales sin enviar datos a la nube, lo que reduce latencia y preserva la privacidad.
- Extracción de campos en formularios y documentos: el contexto de 32K permite introducir un documento completo y pedir salida estructurada; la licencia Apache 2.0 facilita integrarlo en productos comerciales de gestión documental.
- Autocompletado y resumen en teclados y apps de notas: la decodificación a 466 tok/s en iPad Pro M5 con Metal hace viable la generación en tiempo real mientras el usuario escribe.
- Enrutado y clasificación de intenciones en asistentes de borde: el modelo puede clasificar consultas y decidir si se resuelven localmente o se derivan a un modelo mayor en la nube, actuando como primera capa de un sistema híbrido.
- Traducción y reescritura chino-inglés en dispositivos: el soporte nativo de ambos idiomas y el contexto largo permiten traducir párrafos completos manteniendo coherencia, sin coste de API.
- Demos y prototipos de agentes ligeros en Android/iOS/HarmonyOS: la integración con la API LLM estándar de MNN y los demos móviles del repositorio permiten validar flujos agénticos sencillos antes de escalar a modelos mayores.
- Filtrado y moderación de texto en el propio dispositivo: la baja huella permite ejecutar el modelo en segundo plano para etiquetar contenido sensible antes de que salga del terminal.

## Benchmarks y rendimiento

Resultados publicados por el autor (INT4 QAT frente a BF16 y modelos abiertos de tamaño similar o mayor; mayor es mejor):

| Benchmark | INT4 (este repo) | BF16 | Gemma-3-270M | ERNIE-4.5-0.3B | LFM2.5-350M | SmolLM2-360M | Hunyuan-0.5B | MiniCPM4-0.5B | Qwen3-0.6B |
|---|---|---|---|---|---|---|---|---|---|
| **Average** | 49,59 | 50,00 | 6,42 | 31,99 | 31,28 | 18,43 | 31,22 | 46,81 | 44,28 |
| C-Eval | 40,27 | 38,8 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El resto de resultados por benchmark individual no está disponible en la información proporcionada. La suite completa consta de 11 benchmarks según el autor.

Rendimiento en dispositivo (INT4, contexto de 512 tokens):

| Dispositivo | Backend | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|
| iPad Pro M5 | Metal | 8.721 | 466 |
| iPad Pro M5 | CPU | 2.228 | 231 |
| Snapdragon 8 Gen 5 | OpenCL | 3.403 | 138 |
| Snapdragon 8 Gen 5 | CPU | 930 | 251 |

## Requisitos de hardware

- VRAM/RAM estimada: ~173 MB de footprint total en INT4, lo que permite ejecución en dispositivos con 1 GB de RAM o menos dedicada al modelo.
- GPU recomendadas: no requiere GPU dedicada; los backends soportados son CPU, Metal (Apple Silicon, iPad Pro M5) y OpenCL (Qualcomm Snapdragon 8 Gen 5).
- Cabe en cualquier GPU de consumo (RTX 4090, etc.) y en móviles de gama media-alta, aunque el objetivo del formato es el dispositivo de borde, no el servidor.
- Opciones de despliegue: runtime MNN (compilado con `-DMNN_BUILD_LLM=true -DMNN_SUPPORT_TRANSFORMER_FUSE=true`), demos móviles de MNN para Android/iOS/HarmonyOS. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 466 tok/s de decodificación en iPad Pro M5 (Metal) y 251 tok/s en CPU de Snapdragon 8 Gen 5; prefill de 8.721 tok/s y 930 tok/s respectivamente.
- Advertencia de compatibilidad: el layout INT4 de tied-embedding exige un runtime de la misma familia de revisión MNN que la exportación; versiones desajustadas fallan con `Load module failed`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Average (suite del autor) | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-MNN (INT4) | ~300M | 32K | 49,59 | Apache 2.0 | MNN on-device |
| MiniCPM4-0.5B | no disponible | no disponible | 46,81 | no disponible | no disponible |
| Qwen3-0.6B | no disponible | no disponible | 44,28 | no disponible | no disponible |
| ERNIE-4.5-0.3B | no disponible | no disponible | 31,99 | no disponible | no disponible |
| LFM2.5-350M | no disponible | no disponible | 31,28 | no disponible | no disponible |
| SmolLM2-360M | no disponible | no disponible | 18,43 | no disponible | no disponible |
| Gemma-3-270M | no disponible | no disponible | 6,42 | no disponible | no disponible |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada; solo se dispone de sus puntuaciones medias en la suite del autor. En esa suite, MNN-Pocket-0.3B-MNN supera a todos los comparados, incluidos modelos de mayor tamaño como MiniCPM4-0.5B y Qwen3-0.6B.

## Limitaciones y advertencias

- No recomendado para cargas con razonamiento intensivo: matemáticas avanzadas y código de horizonte largo quedan fuera de su ámbito según el propio autor.
- Solo soporta chino e inglés; no hay cobertura documentada de otros idiomas.
- Riesgo de alucinación inherente a un modelo de ~300M parámetros; conviene validar salidas en producción.
- No se documentan sesgos específicos, pero al entrenarse con datos web es previsible que herede sesgos de esas fuentes.
- La licencia Apache 2.0 permite uso comercial, pero el formato MNN obliga a usar el runtime MNN; no hay pesos safetensors ni GGUF en este repositorio.
- Dependencia estricta de la versión del runtime: un MNN de revisión distinta a la de la exportación provoca `Load module failed`.
- Los benchmarks publicados son los del autor y no se han verificado de forma independiente; además, solo se detalla el resultado de C-Eval, no de los otros 10 benchmarks de la suite.
- El contexto de 32K es nominal; el rendimiento en decodificación se midió con 512 tokens y puede degradarse con contextos muy largos en dispositivos de gama baja.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-MNN
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Colección MNN-Pocket 0.3B: https://huggingface.co/collections/taobao-mnn/mnn-pocket-03b
- GitHub de MNN: https://github.com/alibaba/MNN
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.12311
- Model card en chino: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-MNN/blob/main/README-cn.md
- Demo en vídeo: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/resolve/main/assets/demo.mp4
