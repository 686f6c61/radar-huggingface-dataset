# Ueuee82683/Puma-1.1

## Resumen

Puma 1.1 es un modelo de lenguaje open-weight de 6,96 mil millones de parámetros especializado en razonamiento tipo chain-of-thought e ingeniería de software, desarrollado por Merkium y publicado bajo licencia Apache 2.0. El modelo genera análisis internos dentro de bloques estructurados `<think>...</think>` antes de emitir respuestas finales, lo que le permite verificar código, derivaciones matemáticas y respuestas técnicas paso a paso antes de presentarlas.

Está construido sobre un decodificador Transformer pre-norm de 28 capas con arquitectura compatible con Llama (`LlamaForCausalLM`), ventana de contexto de 32.768 tokens y un vocabulario BPE a nivel de byte propio de 49.152 tokens. Se distribuye en pesos FP16 sharded (safetensors, 13,9 GB) y en formato GGUF cuantizado Q4_K_M (~4,2 GB), lo que lo hace ejecutable en portátiles, sobremesa y dispositivos móviles con 8 GB de RAM o más.

Su relevancia actual radica en la combinación de tres factores: licencia permisiva apta para uso comercial, razonamiento estructurado nativo compatible con clientes populares (Ollama, LM Studio, Open WebUI) y un tamaño contenido que permite inferencia local sin hardware de servidor. Dispone además de un hermano ligero, Puma 1.0 (1,42B), para dispositivos con recursos más limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador Transformer pre-norm (`LlamaForCausalLM`, arch: llama) |
| Parametros totales | 6.955.113.984 (6,96B, embeddings de entrada/salida no atados) |
| Parametros activos | no disponible (arquitectura densa, no MoE) |
| Longitud de contexto | 32.768 tokens (8.192 por defecto en el Modelfile de Ollama) |
| Tipos de cuantizacion | FP16 (safetensors) y Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16 sharded, 13,9 GB) y GGUF (`puma-1.1-q4_k_m.gguf`, ~4,2 GB) |

Detalles adicionales de la configuracion: 28 capas, `hidden_size` de 3584, `intermediate_size` de 19200 (MLP SwiGLU con gate SiLU, factor 5,36x), atencion agrupada GQA con relacion 7:1 (28 cabezas de query, 4 de key-value, `head_dim` 128), RoPE con theta 1.000.000, RMSNorm con eps 1e-6 y vocabulario de 49.152 tokens con tokens especiales `<|pad|>`, `<|bos|>`, `<|eos|>`, `<|system|>`, `<|user|>` y `<|assistant|>`.

## Arquitectura y entrenamiento

Puma 1.1 emplea un decodificador Transformer pre-norm denso (no MoE) en la familia de arquitecturas Llama. Destaca el uso de Grouped-Query Attention con relacion 7:1, que reduce la memoria del cache KV al compartir 4 cabezas de key-value entre 28 cabezas de query, y Rotary Position Embeddings con theta elevado (1.000.000) para soportar contextos de 32K. El MLP usa activacion SwiGLU con dimension intermedia de 19200 y super-bloques alineados a 256 para eficiencia en inferencia cuantizada.

Sobre el proceso de entrenamiento, la model card no publica detalles: no se especifican el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion (RLHF, DPO o similares), por lo que estos datos no estan disponibles. La innovacion mas destacable del modelo es su modo de razonamiento estructurado: genera trazas de cadena de pensamiento dentro de etiquetas `<think>...</think>` con profundidad adaptativa (pasos concisos en prompts simples, descomposicion multi-paso con analisis de complejidad y verificacion aritmetica en problemas algoritmicos), y la plantilla de chat Jinja incluida elimina los bloques de razonamiento completados de turnos anteriores para preservar capacidad de contexto en sesiones multi-turno largas.

## Capacidades

- Generacion de texto conversacional con formato de chat y tokens especiales propios.
- Razonamiento explicito paso a paso dentro de bloques `<think>...</think>`, con profundidad adaptativa segun la dificultad del problema.
- Ingenieria de software algoritmica y multi-lenguaje: diseno, implementacion y depuracion en Python, TypeScript/JavaScript, Rust, C++, SQL y Bash, verificando condiciones de contorno y complejidad algoritmica antes de emitir el codigo.
- Resolucion de problemas matematicos y logicos: algebra multi-paso, calculo, combinatoria, probabilidad e invariantes.
- Revision de arquitectura y codigo: diagnostico de bugs de concurrencia, errores off-by-one, cuellos de botella en consultas SQL y desajustes de esquemas de API con analisis de causa raiz.
- Compatibilidad nativa con parseo de bloques de razonamiento en Ollama (0.9+), Open WebUI, LM Studio y Continue.dev.
- Higiene de contexto multi-turno: la plantilla de chat elimina bloques `<think>` de turnos previos.
- No disponible: soporte de vision, audio, tool calling / function calling y capacidades agenticas no aparecen documentados en la model card.

## Casos de uso

- **Asistente de programacion en local:** integrado en Continue.dev o LM Studio, actua como copiloto de codigo offline que razona sobre condiciones de contorno y complejidad antes de generar codigo en Python, Rust, TypeScript o C++, adecuado para entornos sin conexion o con politicas de privacidad estrictas.
- **Depuracion y revision de codigo:** analiza diffs y fragmentos para diagnosticar bugs de concurrencia, errores off-by-one, consultas SQL ineficientes o desajustes de esquemas de API, aportando analisis de causa raiz paso a paso gracias a su modo de razonamiento.
- **Resolucion de problemas algoritmicos y de entrevista tecnica:** descompone problemas de estructuras de datos, complejidad y matematicas discretas en pasos verificables, util para preparar entrevistas o validar soluciones antes de implementarlas.
- **Asistencia matematica y STEM:** resuelve algebra multi-paso, calculo, combinatoria y probabilidad mostrando la derivacion completa, util para docencia, tutoria o verificacion de calculos tecnicos.
- **Chatbot tecnico autoalojado via Ollama:** con un solo comando (`ollama run Merkium/puma-1.1`) despliega un asistente conversacional con API compatible con OpenAI en un servidor local, apto para equipos de desarrollo que quieren un LLM sin enviar datos a terceros.
- **Inferencia en movil y tablet:** el GGUF Q4_K_M (~4,2 GB) permite ejecutar el modelo offline en iPhone 15 Pro o superior, iPad con chip M y flagships Android con 8 GB+ de RAM mediante PocketPal AI o Layla, con contexto de 4096 tokens.
- **Generacion de consultas SQL y scripts Bash:** dada su cobertura de SQL y Bash con verificacion previa en el bloque de razonamiento, puede asistir en tareas de administracion de bases de datos y automatizacion de terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (la model card no incluye MMLU, HumanEval, GSM8K ni metricas similares). Como referencia operativa, el autor si publica throughput estimado en inferencia Q4_K_M:

| Hardware | Throughput estimado |
|---|---|
| NVIDIA RTX 3060 / 4060 / T4 o superior (8 GB+ VRAM) | 55 - 110 tokens/s |
| Apple Silicon M1/M2/M3/M4 (8 GB+ memoria unificada) | 28 - 60 tokens/s |
| CPU x86_64 moderna (AVX2, 8-16 hilos, 8 GB+ RAM) | 9 - 18 tokens/s |

## Requisitos de hardware

- **VRAM / memoria estimada:** ~4,2 GB en Q4_K_M (GGUF), ~4,8 GB de RAM en ejecucion CPU; 13,9 GB en FP16 (safetensors) para inferencia con transformers o ajuste fino.
- **GPU recomendadas:** NVIDIA RTX 3060, 4060 o T4 con 8 GB+ de VRAM para el rango superior de throughput (55-110 tokens/s). No se mencionan requisitos especificos para A100 o H100.
- **Consumer GPUs:** si cabe comodamente en GPUs de consumo de 8 GB (RTX 3060/4060) en cuantizacion Q4_K_M. Para FP16 completo se recomiendan GPUs de 16 GB+ (RTX 4090, A100).
- **Apple Silicon:** ejecutable en Macs M1/M2/M3/M4 con 8 GB+ de memoria unificada (28-60 tokens/s).
- **CPU:** viable en sobremesa/portatil x86_64 con AVX2, 8-16 hilos y 8 GB+ de RAM (9-18 tokens/s).
- **Moviles:** dispositivos con 8 GB+ de RAM (iPhone 15 Pro/16/17, iPad M-series, Snapdragon 8 Gen 2/3/Elite) con contexto de 4096; para moviles de 4-6 GB se recomienda Puma 1.0 (1,42B).
- **Opciones de despliegue:** Ollama (`ollama run Merkium/puma-1.1` o `hf.co/Ueuee82683/Puma-1.1`), llama.cpp (`llama-cli` interactivo y `llama-server` con API HTTP en puerto 8080), PocketPal AI, Layla, LM Studio, Open WebUI y Continue.dev. La etiqueta `text-generation-inference` sugiere compatibilidad con TGI, aunque no hay instrucciones publicadas.
- **Latencia:** no disponible como metrica absoluta; ten en cuenta que el modo `<think>` genera tokens intermedios antes de la respuesta final, alargando proporcionalmente el time-to-final-answer frente a modelos sin razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Puma 1.1 | 6,96B | 32.768 | `<think>...</think>` estructurado | Apache 2.0 | safetensors FP16 y GGUF Q4_K_M; Ollama, llama.cpp |
| Puma 1.0 (hermano ligero) | 1,42B | no disponible | mismo formato de razonamiento | Apache 2.0 | GGUF (~1,44 GB); Ollama y HF |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 128K | no nativo | Apache 2.0 (algunas variantes Qwen Research) | safetensors y GGUF amplios |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | 131.072 | razonamiento `<think>` nativo | MIT | safetensors y GGUF amplios |

Puma 1.1 compite en la categoria de modelos de 7B con razonamiento para codigo. Frente a Qwen2.5-Coder-7B ofrece razonamiento explicito nativo, pero con contexto menor (32K frente a 128K). Frente a DeepSeek-R1-Distill-Qwen-7B comparte el paradigma de razonamiento estructurado, aunque este ultimo cuenta con un ecosistema y validacion comunitaria mucho mas amplia; no hay benchmarks publicados que permitan comparar rendimiento medido entre ellos. La ventaja diferencial de Puma 1.1 es su vocabulario propio y un GGUF muy compacto (~4,2 GB) orientado a dispositivos con 8 GB de RAM.

## Limitaciones y advertencias

- **Idioma:** la model card declara soporte solo para ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior o no garantizado.
- **Corte de conocimiento offline:** el modelo no navega por la web; para APIs de librerias posteriores al entrenamiento hay que suministrar documentacion via RAG o contexto directo.
- **Latencia del razonamiento:** la generacion de bloques `<think>` antes de la respuesta final incrementa el tiempo hasta la respuesta final de forma proporcional a la profundidad de razonamiento.
- **Riesgo de alucinacion:** no se documentan metricas de alucinacion; como en todo LLM de 7B, las salidas de codigo y matematicas deben verificarse, especialmente en dominios poco cubiertos por el entrenamiento.
- **Sesgos:** no disponible; no se publican evaluaciones de sesgos ni seguridad.
- **Contexto en clientes:** el Modelfile de Ollama limita por defecto el contexto a 8.192 tokens; hay que ajustarlo manualmente para aprovechar los 32.768 completos. En movil se recomienda limitar a 4.096.
- **Procedencia del repositorio:** el repositorio de Hugging Face esta bajo la cuenta `Ueuee82683` mientras el autor declarado es Merkium; con solo 234 descargas y sin benchmarks publicados, conviene auditar los pesos antes de uso en produccion.
- **Licencia:** Apache 2.0 permite uso comercial, incluida la creacion de derivados, sin restricciones destacables mas alla de la atribucion del aviso de licencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ueuee82683/Puma-1.1
- Registro de Ollama: https://ollama.com/Merkium/puma-1.1
- Modelo hermano ligero (HuggingFace): https://huggingface.co/Ueuee82683/Puma-1.0
- Modelo hermano ligero (Ollama): https://ollama.com/Merkium/puma-1.0
- Paper, blog y demos: no disponibles en la informacion proporcionada.
