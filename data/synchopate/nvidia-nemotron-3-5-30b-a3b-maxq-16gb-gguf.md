# Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB-GGUF

## Resumen

NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB-GGUF es una cuantizacion GGUF del modelo base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por el usuario Synchopate bajo el perfil MaxQ v3.0. Se trata de una edicion orientada a equipos con 16 GB de RAM o VRAM, que comprime los 58,84 GiB del checkpoint BF16 original hasta 13,39 GiB manteniendo tipos de tensor estandar de ggml (sin tipos personalizados), de modo que funciona en llama.cpp, LM Studio, Ollama, Jan y KoboldCpp sin parches.

El modelo base es un transformer hibrido de NVIDIA con 30,2 mil millones de parametros totales y 3,0 mil millones activos por token (MoE disperso), compuesto por 52 bloques: 23 capas Mamba-2 SSM, 23 capas MoE con router SIGMOID Top-6 y 6 capas de atencion GQA. Su ventana de contexto nativa alcanza los 262.144 tokens con una cache KV muy reducida (432 MB a contexto completo), lo que lo hace atractivo para tareas de contexto largo en hardware modesto.

La relevancia de esta ficha concreta reside en la estrategia de cuantizacion: los cuantizadores estandar Q3_K e IQ3_S no logran bajar de 17,6 GiB porque las dimensiones intermedias del MoE (1856 x 2688) no son multiplos de QK_K = 256. MaxQ-16GB resuelve el problema usando formatos de bloque de 32 y 64 elementos (MXFP4 y Q2_0 con escala con signo) sin tensores de reserva, lo que permite desplegar un modelo de 30B con contexto de 256K en un solo equipo de 16 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 23 capas Mamba-2 SSM + 23 capas MoE disperso (ReLU^2) + 6 capas de atencion GQA |
| Parametros totales | 31.577.940.288 (30,2B segun model card) |
| Parametros activos | 3,0B por token |
| Longitud de contexto | 262.144 tokens (256K) nativos |
| Tipos de cuantizacion | GGUF mixto: F32 (237 tensores), Q8_0 (48), Q4_0 (70), MXFP4 tipo 39 (28), Q2_0 tipo 42 (18); max_type = 42, sin tipos personalizados |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (un unico archivo de 14.382.336.640 bytes, 13,39 GiB) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura hibrida que combina capas Mamba-2 de espacio de estados con capas de mezcla de expertos y un pequeno numero de capas de atencion. En concreto, de los 52 bloques totales, 23 son Mamba-2 SSM, 23 son MoE con activacion ReLU al cuadrado y router SIGMOID Top-6 sobre 128 expertos mas un experto compartido (K = 3712), y 6 son capas de atencion con query grouping (GQA). Esta combinacion reduce el coste de atencion a contexto largo y explica que la cache KV a 256K sea de solo 432 MB con 12 cabezas KV totales.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Si se documenta que el tokenizador es Tekken/GPT-2 con un vocabulario de 131.072 tokens y que la plantilla de chat Jinja embebida (9.867 caracteres) activa por defecto un modo de razonamiento con etiquetas `<think>...</think>` que produce `reasoning_content` separado de la respuesta final.

La innovacion tecnica de esta publicacion es la cuantizacion MaxQ v3.0: usa MXFP4 (28 tensores) para los expertos en rango completo y Q2_0 con escala con signo (18 B por bloque de 64 pesos, 2,25 bpw) para los tensores `ffn_up_exps` interiores, mientras mantiene en F32 los estados Mamba-2 (`ssm_conv1d`, `ssm_a`, `ssm_dt`) y en Q8_0/Q4_0 la parte densa de atencion y expertos compartidos. El autor reporta 2.208 sondas de estado oculto, un `max_kappa2` de 13,81 y un 0,000000% de solapamiento de n-gramas 8/13 con `wiki-alt.txt`.

## Capacidades

- Generacion de texto conversacional y de un solo turno, con pipeline `text-generation`.
- Razonamiento en cadena mediante modo `<think>` activado por defecto en la plantilla Jinja, con contenido separado en `reasoning_content`.
- Razonamiento multi-paso y capacidad de agente derivadas del modo thinking y del contexto de 256K.
- Procesamiento de contexto largo: ventana nativa de 262.144 tokens con cache KV reducida.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el modelo es solo de texto.
- Compatibilidad de despliegue amplia: llama.cpp upstream, LM Studio, Ollama, Jan, KoboldCpp y llama-modchip v3.0.

## Casos de uso

- Analisis de documentos extensos: con 262.144 tokens de contexto y una cache KV de 432 MB, el modelo puede ingerir manuales tecnicos, expedientes o bases de codigo completas en un solo equipo de 16 GB sin fragmentar el contexto.
- Asistente local en portatiles de gama alta: el archivo de 13,39 GiB cabe en Macs con 16-24 GB de memoria unificada o en GPUs de 16 GB, lo que permite un asistente conversacional privado sin conexion.
- Razonamiento con presupuesto controlado: el modo `<think>` permite separar el razonamiento interno de la respuesta; configurando `max_tokens >= 4096` o `--reasoning-budget` se ajusta el coste computacional por consulta.
- Despliegue hibrido GPU + CPU: con `-ot "\.ffn_.*_exps\.=CPU"` se mantiene el tronco Mamba-2/GQA en VRAM y se descargan los expertos enrutados a RAM del sistema, habilitando contexto de 131.072 tokens en equipos con 8-12 GB de VRAM y 16 GB de RAM.
- Generacion de codigo y explicaciones tecnicas: el modelo base esta orientado a tareas de razonamiento y generacion; el formato GGUF permite integrarlo en flujos de trabajo locales con LM Studio u Ollama.
- Investigacion en cuantizacion: el checkpoint sirve como referencia reproducible para estudiar el impacto de MXFP4 y Q2_0 en modelos MoE hibridos, dado que el autor documenta sondas de estado oculto y metricas de divergencia.
- Procesamiento por lotes en CPU: con llama-modchip v3.0 y kernels AVX-512 Q2_0/MXFP4, se puede ejecutar en servidores sin GPU para tareas de resumen o clasificacion a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 13,39 GiB para los pesos; con cache KV en q8_0/q4_0 y contexto de 32K el consumo adicional es modesto, y a 256K la cache KV ocupa 432 MB.
- GPU recomendadas: NVIDIA con 16 GB o mas (RTX 4080, RTX 4090, A100, H100) para carga completa en VRAM; Apple Silicon con 16-24 GB de memoria unificada.
- Configuracion hibrida: GPU de 8-12 GB de VRAM mas 16 GB de RAM del sistema, manteniendo el tronco Mamba-2/GQA en VRAM y los expertos enrutados en CPU.
- Cabe en GPU de consumo: si, en RTX 4080/4090 de 16-24 GB; en GPUs de 8-12 GB requiere el modo hibrido con offload de expertos.
- Opciones de despliegue: llama.cpp upstream (`llama-server`), LM Studio, Ollama, Jan, KoboldCpp y llama-modchip v3.0 (con decodificacion especulativa Stockfish-PVS v2 M=7 y kernels AVX-512 Q2_0/MXFP4).
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor menciona un tiempo de restauracion de slot-0 de 18,9 ms via `/dev/shm` en llama-modchip v3.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB (esta ficha) | 30,2B totales / 3,0B activos | 262.144 | GGUF 13,39 GiB | OpenMDW-1.1 | Tipos ggml estandar, sin parches |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30,2B totales / 3,0B activos | 262.144 | BF16 58,84 GiB | OpenMDW-1.1 | Checkpoint original de referencia |
| NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF (Synchopate) | 30,2B totales / 3,0B activos | 262.144 | GGUF con tipos personalizados 44/45 | OpenMDW-1.1 | Requiere llama-modchip v3.0 |
| NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF (Synchopate) | 30,2B totales / 3,0B activos | 262.144 | GGUF con tipos personalizados 44/45 | OpenMDW-1.1 | Requiere llama-modchip v3.0 |

## Limitaciones y advertencias

- El modo `<think>` esta activado por defecto; con `max_tokens <= 96` el presupuesto puede consumirse integramente en `reasoning_content` sin emitir respuesta final. Es necesario fijar `max_tokens >= 4096` o desactivar el razonamiento con `chat_template_kwargs={"enable_thinking": false}` o `--reasoning-budget 0`.
- Los idiomas soportados no estan documentados en la informacion disponible; el rendimiento fuera del ingles no puede garantizarse.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia cuantitativa del impacto de la cuantizacion mixta MXFP4/Q2_0 en la calidad frente al checkpoint BF16.
- La cuantizacion Q2_0 en 18 tensores `ffn_up_exps` interiores (2,25 bpw) es agresiva; el autor reporta metricas de divergencia, pero no se aportan evaluaciones de calidad generativa.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; el campo `license: other` en los metadatos de Hugging Face apunta a un texto especifico en openmdw.ai.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en la model card.
- El despliegue hibrido con offload de expertos a CPU requiere ajustar `-ot` correctamente; una configuracion erronea puede degradar el rendimiento de forma significativa.
- La fecha de creacion del repositorio (2026-11-16) es posterior a la fecha actual de referencia habitual; conviene verificar la integridad del archivo mediante el SHA-256 publicado (`26b884d70a52046a7198c4e01cac397af8bf44584b04cdcf59f896145587db67`).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-MaxQ-16GB-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Variante VQ3-64 CPU: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-VQ3-64-CPU-GGUF
- Variante Fractal-64 CPU: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF
- Repositorio llama-modchip: https://github.com/synchopate/llama-modchip
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
