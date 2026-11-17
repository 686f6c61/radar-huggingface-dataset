# zenlm/zen6-nano-4b

## Resumen

Zen 6 Nano (4B) es un modelo de lenguaje multimodal y agentico de pesos abiertos publicado por Hanzo AI y Zen LM en colaboracion con Zoo Labs Foundation. Se distribuye bajo licencia Apache 2.0 y se entrenó en el espacio de pesos ternarios de 1.58 bits, lo que permite empaquetar el modelo en ficheros GGUF de entre 950 MB y 1.27 GB. La arquitectura combina un backbone hibrido con bloques de atencion lineal Gated-DeltaNet y atencion completa agrupada (GQA), junto con un proyector de vision para entrada image-text-to-text.

El modelo parte de una base Qwen3.5-4B y de los pesos ternarios de Prism ML (Ternary-Bonsai-2-4B), y se post-entrena directamente en el espacio ternario mediante Quantization-Aware Training con Straight-Through Estimator y optimizadores hibridos Muon + AdamW. Su propuesta principal es ofrecer capacidades de tool calling multi-paso y razonamiento agentico con un coste de inferencia muy bajo, ejecutable en CPU y en GPUs de consumo, con soporte nativo en hanzo-engine y llama.cpp.

Es relevante ahora porque reduce drasticamente el coste de despliegue de un modelo de 4B: el pack PTQ1_0 ocupa 950 MB y el modelo puede correr en runners de CI/CD sin coste por token, lo que facilita pruebas de integracion de agentes y pipelines de herramientas sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: bloques Gated-DeltaNet (atencion lineal, 3x) intercalados con bloques de atencion completa GQA (1x), MLPs SwiGLU y proyector de vision multimodal |
| Parametros totales | 782.004.736 (dato de safetensors); el autor lo comercializa como tier "4B" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria 1.58-bit: PQ2_0 (2.13 bpw), PTQ1_0 (1.75 bpw), Q2_0 (2.25 bpw); proyector de vision en Q8_0 y BF16; draft BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos GGML 142, 143 y 42); packs MLX 2-bit para Apple Silicon |

## Arquitectura y entrenamiento

El backbone es un transformer hibrido que intercala tres bloques de atencion lineal Gated-DeltaNet (GDN) por cada bloque de atencion completa con Grouped-Query Attention, usando MLPs SwiGLU. Incluye un proyector de vision (`mmproj`) que habilita la entrada image-text-to-text. Los pesos lineales y los embeddings de tokens se almacenan en una base ortonormal de Sylvester-Walsh-Hadamard, con vectores de signo por canal embebidos en los metadatos GGUF (`prism.hadamard.*`); esta rotacion elimina los valores atipicos de activacion y permite que los pesos ternarios de grupo 128 conserven la precision densa.

El post-entrenamiento se realiza directamente en el espacio de pesos ternarios mediante QAT con Straight-Through Estimator, usando optimizadores hibridos Muon + AdamW. El modelo se construye sobre Qwen3.5-4B (Alibaba Cloud) y Ternary-Bonsai-2-4B (Prism ML). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. Entre las innovaciones destacan el Multi-Token Prediction (MTP) integrado como draft, el draft especulativo por difusion de bloques DFlash2, la busqueda por automata de sufijos `SA_SPEC` y `GuardedDraft`.

## Capacidades

- Generacion de texto conversacional y razonamiento de varios pasos.
- Tool calling agentico con ejecucion multi-paso de `<tool_call>`, sintesis de `<tool_response>`, recuperacion de errores y abstencion calibrada de herramientas.
- Integracion con Hanzo MCP sobre herramientas de sistema de ficheros (`fs`), ejecucion (`exec`), codigo (`code`), Git (`git`), tests (`test`), `hanzo` y herramientas de direccion de motores de juego.
- Capacidades multimodales de entrada image-text-to-text mediante el proyector de vision.
- Identidad de pesos nativa sin sobrecarga de system prompt, respetando personas definidas por el desarrollador (por ejemplo, NPCs de Godot o extractores JSON).
- Multilingue limitado a ingles y chino.
- Decodificacion especulativa con MTP y DFlash2 para acelerar la generacion.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con tool calling para consultar sistemas internos, aunque el contexto maximo no esta documentado y conviene validarlo antes de desplegar.
- Generacion de codigo en produccion: soporta tool calling sobre `code`, `git` y `test`, lo que permite integrarlo en pipelines de CI/CD para leer ficheros, ejecutar tests y proponer parches.
- Agentes de escritorio y automatizacion de tareas: las herramientas `fs` y `exec` permiten orquestar operaciones sobre el sistema de ficheros y comandos de shell con recuperacion de errores.
- Pruebas de integracion de LLM en CI/CD sin coste por token: el pack PTQ1_0 (950 MB) se sirve en CPU con llama.cpp, lo que permite ejecutar tests end-to-end de tool calling en runners de GitHub Actions sin claves de API.
- NPCs y logica de dialogo en videojuegos: su identidad de pesos nativa y el respeto a personas del desarrollador lo hacen adecuado para personajes con personalidad fija en motores como Godot.
- Extraccion de datos estructurados: puede actuar como extractor JSON guiado por persona de desarrollador en pipelines de procesamiento documental.
- Asistentes multimodales ligeros: la entrada image-text-to-text permite describir imagenes o responder preguntas sobre capturas en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.0-1.3 GB para los pesos del modelo en PQ2_0, PTQ1_0 o Q2_0; anadir 367 MB (Q8_0) o 676 MB (BF16) si se usa el proyector de vision; el draft MTP anade 1.27 GB y el draft DFlash2 BF16 1.58 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el modelo esta pensado para ejecucion en CPU y en GPUs de consumo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, y tambien en CPU.
- Opciones de despliegue: hanzo-engine (CUDA, Metal, ROCm, Vulkan, CPU), llama.cpp (Q2_0 en upstream b11556+), `mlx-lm` en Apple Silicon para los packs MLX 2-bit, y servidor compatible con OpenAI `/v1/chat/completions` en `http://127.0.0.1:36900/v1`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Zen 6 Nano (4B) | 782 M (tier 4B) | no disponible | Ternaria 1.58-bit (PQ2_0, PTQ1_0, Q2_0) | Apache 2.0 | Multimodal, tool calling, MCP |
| Qwen3.5-4B | 4B (aprox.) | no disponible | no disponible | no disponible | Modelo base del que parte Zen 6 Nano |
| Ternary-Bonsai-2-4B | no disponible | no disponible | 2-bit MLX | no disponible | Modelo base ternario de Prism ML |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Longitud de contexto no especificada, lo que dificulta planificar casos de uso con documentos largos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la abstencion calibrada de herramientas ayuda pero no elimina el problema.
- El modelo se presenta como tier "4B" pero los pesos reales declarados en safetensors son 782 M de parametros; conviene verificar el comportamiento real antes de asumir capacidades de un 4B.
- La cuantizacion ternaria de 1.58 bits puede degradar tareas de razonamiento complejo frente a modelos de mayor precision.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribucion a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash / ProCreations segun el fichero NOTICE.
- La ejecucion de herramientas `fs` y `exec` en produccion exige sandboxing y control de permisos para evitar acciones no deseadas.
- No se han publicado benchmarks que permitan validar el rendimiento en tareas estandar.

## Enlaces

- Hugging Face: https://huggingface.co/zenlm/zen6-nano-4b
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
- Zoo Labs Foundation: https://zoolabs.io
- Repositorio hanzo-engine: https://github.com/hanzoai/engine
