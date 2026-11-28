# Xylolabs/Arete-27B-Tenstorrent-Tensix

## Resumen

Arete-27B-Tenstorrent-Tensix es una distribucion cuantizada del modelo NousResearch/Arete-27B, un ajuste fino supervisado de Qwen/Qwen3.8-27B realizado por Nous Research. La publica Xylolabs y su proposito no es ofrecer un modelo nuevo, sino empaquetar los pesos en formatos de coma flotante por bloques (block floating point, BFP) que las NPU Tensix de Tenstorrent pueden consumir directamente a traves de tt-metal y ttnn. El repositorio combina dos variantes, bfloat4_b y bfloat8_b, en carpetas separadas, junto con los scripts de empaquetado y verificacion.

El interes tecnico esta en el formato: en lugar de cuantizacion entera clasica (Q4_K_M, GPTQ con escalas por grupo), se usa la representacion bfloat4_b/bfloat8_b nativa del hardware Tensix, que comparte exponente por bloque y mantiene el resto de tensores en bf16. Eso permite reducir el peso empaquetado de 53,79 GB (bf16) a 17,596 GB (bfp4) o 30,963 GB (bfp8), con una degradacion medida en terminos de divergencia KL respecto a bf16.

La relevancia es doble: por un lado, da a los usuarios de aceleradores Tenstorrent (por ejemplo, placas Wormhole o Blackhole) un checkpoint listo para su stack; por otro, publica una metodologia de evaluacion con KL sobre texto en ingles y coreano que permite comparar la cuantizacion BFP contra una referencia Q4_K_M de llama.cpp. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B; incluye capas DeltaNet segun la model card) |
| Parametros totales | 27B (heredados del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat4_b (bfp4), bfloat8_b (bfp8); resto de tensores en bf16; referencia Q4_K_M incluida como comparacion |
| Idiomas soportados | no disponibles de forma oficial; la evaluacion KL cubre ingles y coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con metadatos JSON de cuantizacion: quant4.json, model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo base, NousResearch/Arete-27B, es un ajuste fino supervisado de Qwen/Qwen3.8-27B. La model card menciona explicitamente capas de atencion, DeltaNet y MLP como los modulos cuantizados, lo que sugiere una arquitectura hibrida con componentes de attention lineal tipo DeltaNet junto a atencion clasica. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el ajuste de Nous Research.

La innovacion de esta publicacion es el pipeline de cuantizacion: se aplica GPTQ sobre representaciones block floating point propias de Tensix (bfloat4_b y bfloat8_b), con el LM head en bfloat8_b en la variante bfp4 y el resto de tensores en bf16. El repositorio incluye `pack_tensix.py`, que empaqueta las matrices y puede hacer round-trip por DRAM del dispositivo con `--device`, y `verify_grid.py`, que valida la reconstruccion. La calidad se mide con divergencia KL sobre 16.240 posiciones de WikiText-2 y Wikipedia en coreano, en texto plano y con plantilla de chat, con un limite de 1,5 veces la KL de la referencia Q4_K_M.

## Capacidades

- Generacion de texto autoregresiva en el pipeline `text-generation`.
- Razonamiento y conversacion multi-turno mediante plantilla de chat (`apply_chat_template`).
- Capacidad multilingue heredada del modelo base; la evaluacion publicada cubre ingles y coreano, pero no se enumeran los idiomas soportados.
- Inferencia en dos backends: Transformers sobre GPU/CPU (cargando los safetensors con `dtype="bfloat16"`) y tt-metal/ttnn sobre NPU Tensix.
- Empaquetado y verificacion de matrices directamente en el dispositivo mediante los scripts incluidos.
- Tool calling, function calling, modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: cargar la carpeta `bfp4/` o `bfp8/` en una NPU Tensix con tt-metal v0.81.1 permite ejecutar el demo `qwen38_27b_qb2` sin conversion adicional de pesos.
- Servicio de generacion de texto en produccion con Transformers: la carpeta `bfp4/` ocupa 17,596 GB empaquetados y se puede cargar con `device_map="auto"`, lo que facilita servirlo en una GPU unica de 24 GB o superior.
- Evaluacion comparativa de tecnicas de cuantizacion: los valores de KL publicados (0,02909 para bfp4, 0,00071 para bfp8, 0,02036 para Q4_K_M) permiten contrastar BFP frente a cuantizacion entera en un mismo modelo.
- Investigacion en formatos block floating point: los scripts `pack_tensix.py` y `verify_grid.py` sirven como referencia reproducible para empaquetar otras matrices en bfloat4_b/bfloat8_b.
- Prototipado de asistentes conversacionales en ingles y coreano: la evaluacion KL cubre ambos idiomas con y sin plantilla de chat, lo que da una idea de la fidelidad en esos idiomas.
- Integracion en pipelines de CI que validen checkpoints cuantizados: `verify_grid.py` comprueba la reconstruccion de las matrices y puede incorporarse como test de regresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo aporta metricas de fidelidad de cuantizacion:

| Variante | Tamano empaquetado (GB) | KL media a BF16 | Limite KL (1,5x Q4_K_M) |
|---|---|---|---|
| bfp4 | 17,596 | 0,02909 | 0,03054 |
| bfp8 | 30,963 | 0,00071 | 0,03054 |
| BF16 (base) | 53,79 | 0 | - |
| Q4_K_M (llama.cpp) | 16,547 | 0,02036 | referencia |

La KL se mide sobre 16.240 posiciones de WikiText-2 (test) y Wikipedia en coreano, en texto plano y con plantilla de chat.

## Requisitos de hardware

- VRAM estimada: la variante bfp4 empaquetada ocupa 17,596 GB; al cargarse en Transformers con `dtype="bfloat16"` el consumo real en memoria es mayor que el tamano del fichero, por lo que se recomienda al menos 24 GB de VRAM para bfp4 y 40 GB o mas para bfp8 (30,963 GB empaquetados).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfp4 con Transformers.
- Cabe en GPU de consumo: si, la variante bfp4 en una RTX 4090 o RTX 3090 de 24 GB, con margen limitado; bfp8 requiere GPUs profesionales.
- Aceleradores especificos: NPU Tensix de Tenstorrent con tt-metal v0.81.1; el demo oficial es `models/demos/qwen38_27b_qb2/demo/text_demo.py`.
- Opciones de despliegue: Transformers (backend de referencia de la model card), tt-metal/ttnn (backend nativo Tensix). No se mencionan vLLM, TGI, llama.cpp ni Ollama para estas carpetas; llama.cpp solo aparece como referencia de cuantizacion Q4_K_M.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-Tenstorrent-Tensix (bfp4) | 27B | no disponible | bfloat4_b + bf16 | Apache 2.0 | Hugging Face, 192 descargas |
| NousResearch/Arete-27B (bf16) | 27B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | bf16 y otras | no disponible en la informacion | Hugging Face |
| Q4_K_M de llama.cpp (referencia) | 27B | no disponible | entera 4 bits | Apache 2.0 (derivada) | Referencia de comparacion en la model card |

La comparativa se limita a la familia del propio modelo base porque la informacion proporcionada no incluye datos de rendimiento frente a alternativas de otros autores.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks de tareas; la unica metrica de calidad es la divergencia KL, que mide fidelidad respecto a bf16, no capacidad absoluta.
- La variante bfp4 tiene una KL media de 0,02909, superior a la de Q4_K_M (0,02036); es decir, en fidelidad queda por detras de la cuantizacion entera de referencia, aunque dentro del limite fijado.
- El soporte esta atado a tt-metal v0.81.1 y al demo `qwen38_27b_qb2`; cambios de version pueden romper la compatibilidad.
- La evaluacion KL solo cubre ingles y coreano; el comportamiento en castellano u otros idiomas no esta medido.
- No se documentan sesgos, riesgo de alucinacion ni limitaciones de contexto del modelo base en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero cada carpeta lleva su propio LICENSE y NOTICE; hay que conservar los avisos de cambios.
- El repositorio pesa 106 GB en total por incluir varias variantes; conviene descargar solo la carpeta necesaria con `--include`.
- No se indica soporte de tool calling, agentes ni modos de razonamiento extendido; no debe asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Arete-27B-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Arete-27B-Tenstorrent-Tensix/blob/main/LICENSE
