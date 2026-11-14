# Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4-GateUp

## Resumen

Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4-GateUp es una exportación cuantizada del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por Xylolabs, específicamente empaquetada para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de precisión reducida pensada para ejecutarse de forma nativa sobre el stack TT-NN de Tenstorrent, con un formato de bloque flotante (block floating point, BFP) que el hardware puede consumir directamente sin recodificar los pesos.

El modelo conserva la arquitectura transformer decoder-only de Llama 3.1 con 8.030.261.248 parámetros y una ventana de contexto de 128.000 tokens (heredada del modelo base). La innovación está en el esquema de cuantización híbrido: las proyecciones de atención y la capa de salida usan `bfloat8_b` (BFP8, 8,5 bits por peso), mientras que las proyecciones gate y up del MLP usan `bfloat4_b` (BFP4, 4,5 bits por peso). El resultado es una media de 7,12 bits por peso y un empaquetado de 7,15 GB, lo que reduce a menos de la mitad el espacio de memoria del modelo original en BF16 (16,06 GB).

Es relevante ahora porque permite desplegar un Llama 3.1 8B Instruct con pérdida de calidad mínima sobre aceleradores de Tenstorrent, un ecosistema emergente de inferencia alternativa a GPU. La cuantización BFP4 del bloque gate/up se realizó con GPTQ y búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano, mientras que los tensores BFP8 se obtuvieron por redondeo al más cercano. Los pesos BF16 de origen son idénticos byte a byte a los de Meta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con cuantización block floating point BFP4/BFP8 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en gate y up del MLP; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en q/k/v/o, down del MLP y LM head; bf16 en embeddings, normas y resto de tensores. Media de 7,12 bits/peso |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 |
| Formato de pesos | safetensors con tensores almacenados en la rejilla BFP4/BFP8 (valores bf16); `quant4.json` describe el formato de cada proyección |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 8B parámetros con 32 capas, atención multi-cabeza con GQA y activación SwiGLU en el MLP. Esta exportación no reentrena el modelo: parte de los pesos BF16 de `meta-llama/Llama-3.1-8B-Instruct` (idénticos byte a byte a los de la rama principal de Meta) y los cuantiza. La atención (q, k, v, o), la proyección down del MLP y el LM head pasan a `bfloat8_b` mediante redondeo al más cercano; las proyecciones gate y up del MLP pasan a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Embeddings, normas y demás tensores permanecen en bf16.

La clave técnica es que las matrices cuantizadas se almacenan como valores bf16 situados sobre la rejilla BFP4 o BFP8, de modo que TT-NN las empaqueta sin alterar sus valores. Esto permite verificar el empaquetado bit a bit contra la representación en torch. Los ficheros `config.json`, `generation_config.json`, el tokenizer y `chat_template.jinja` son los de `unsloth/Llama-3.1-8B-Instruct`, incluidos sin cambios. El modelo requiere aproximadamente 7,15 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas de Llama 3.1 8B Instruct (formato chat con `chat_template.jinja`).
- Razonamiento general, respuesta a preguntas y tareas de conocimiento enciclopédico.
- Generación de código y matemáticas básicas (capacidades del modelo base, no evaluadas específicamente en esta exportación).
- Soporte multilingüe para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Ejecución nativa sobre NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de los pesos BFP.
- Verificación de integridad de pesos: scripts `pack_tensix.py` y `verify_grid.py` para comprobar que el empaquetado no altera valores.
- Compatibilidad con `transformers` para carga y generación estándar (con `dtype="bfloat16"` y `device_map="auto"`).
- Tool calling y function calling: no documentado explícitamente en la información disponible; se asume la herencia del modelo base, pero no está verificado en esta exportación.

## Casos de uso

- Inferencia sobre aceleradores Tenstorrent: despliegue de un Llama 3.1 8B Instruct en NPU Wormhole o Blackhole aprovechando el empaquetado BFP nativo, con un consumo de 7,15 GB de memoria de dispositivo para los pesos, lo que libera DRAM para caché KV y buffers en contextos largos.
- Servicio de chat multilingüe: atención conversacional en ocho idiomas (incluido español) con contexto de hasta 128.000 tokens, adecuado para asistentes que necesitan recordar historiales extensos.
- Procesamiento de documentos largos: resumen y extracción de información sobre textos que superan los 32.000 tokens, gracias a la ventana de contexto heredada del modelo base.
- Evaluación comparativa de cuantizaciones: uso como referencia para medir el impacto de BFP4/BFP8 frente a BF16 y Q4_K_M en tareas de generación, con métricas de KL y top-1 ya publicadas.
- Integración en pipelines de `transformers`: carga estándar con `AutoModelForCausalLM` para prototipado en CPU/GPU antes de portar a Tensix, manteniendo los mismos pesos cuantizados.
- Investigación en formatos block floating point: estudio de cómo la cuantización BFP4 en gate/up del MLP afecta a la perplejidad y a la fidelidad de las respuestas, con scripts de verificación incluidos.
- Despliegue con memoria limitada: alternativa a BF16 (16,06 GB) cuando el presupuesto de memoria del dispositivo es de aproximadamente 8-10 GB, manteniendo una pérdida de calidad reducida (KL media de 0,02282 frente a BF16).

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (unsloth/Llama-3.1-8B-Instruct) | 16 | 16,06 | 0 | 100 | 28 de 33 | - |
| **Este modelo** | 7,12 | 7,146 | 0,02282 | 92,71 | 30 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,89 | 4,921 | 0,03235 | 91,06 | 30 de 33 | 0 |

Las métricas de KL y top-1 cubren 16.056 posiciones de texto en inglés y coreano (test de WikiText-2, Wikipedia en coreano), en modo plano y en plantilla de chat. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: aproximadamente 7,15 GB solo para los pesos del modelo de lenguaje, más caché KV y buffers (el tamaño del repo es de 16,1 GB por los ficheros auxiliares y posibles duplicados de formato).
- GPU recomendadas: no aplica de forma nativa; el modelo está pensado para NPU Tensix de Tenstorrent (Wormhole, Blackhole). Para ejecución en GPU se puede cargar con `transformers` en bf16, requiriendo al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100, H100).
- ¿Cabe en GPU de consumo? En su formato nativo BFP no; en `transformers` con bf16 requiere una GPU de 16 GB o más (RTX 4080/4090, entre otras).
- Opciones de despliegue: TT-NN (`ttnn` 0.81.1, verificado en el simulador `ttsim` de Blackhole), `transformers` con `AutoModelForCausalLM`, y scripts propios `pack_tensix.py` y `verify_grid.py`. tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bits/peso | Tamano | Licencia | Plataforma |
|---|---|---:|---:|---:|---|---|
| **Este modelo** | 8,03B | 128k | 7,12 | 7,15 GB | llama3.1 | Tensix (Wormhole, Blackhole) |
| meta-llama/Llama-3.1-8B-Instruct (BF16) | 8,03B | 128k | 16 | 16,06 GB | llama3.1 | GPU/CPU |
| Q4_K_M (llama.cpp) | 8,03B | 128k | 4,89 | 4,92 GB | llama3.1 | CPU/GPU |
| unsloth/Llama-3.1-8B-Instruct | 8,03B | 128k | 16 | 16,06 GB | llama3.1 | GPU/CPU |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de información sobre exportaciones BFP equivalentes de otros modelos en la documentación proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad respecto a BF16: KL media de 0,02282 y top-1 del 92,71 %, inferior al modelo original pero superior a Q4_K_M en KL.
- La cuantización BFP4 se aplica solo a gate y up del MLP; el resto de proyecciones usan BFP8, por lo que el ahorro de memoria es moderado frente a cuantizaciones de 4 bits completas.
- El calibrado de GPTQ usó WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo hacia esos dominios e idiomas; el rendimiento en otros idiomas (español, hindi, tailandés) no está evaluado específicamente.
- Riesgo de alucinación inherente al modelo base Llama 3.1 8B Instruct, no mitigado por la cuantización.
- Licencia llama3.1: uso comercial permitido con condiciones (política de uso aceptable de Meta); es necesario revisar los términos completos antes de producción.
- El checkpoint no se ha probado con tt-transformers ni tt-forge; solo se verificó el empaquetado con TT-NN en el simulador ttsim, no en hardware físico.
- Los scripts de verificación (`pack_tensix.py`, `verify_grid.py`) requieren `ttnn` y acceso a dispositivo o simulador; no hay garantía de funcionamiento en todas las versiones de TT-NN.
- El modelo está orientado exclusivamente a generación de texto; no soporta visión, audio ni otras modalidades.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4-GateUp
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Versión unsloth del modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct/tree/4699cc75b550f9c6f3173fb80f4703b62d946aa5
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia Llama 3.1: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4-GateUp/blob/main/LICENSE
