# Starw1/Qwen3.8-27B-MLA-exl3-4.50bpw-H4

## Resumen

Qwen3.8-27B-MLA es un modelo de generación de texto desarrollado por TelperionAI, basado en la familia Qwen3 y con atención de tipo MLA (Multi-head Latent Attention). La ficha aquí documentada corresponde a una cuantización EXL3 a 4,50 bpw realizada por el usuario Starw1, empaquetada específicamente para que el modelo quepa en una única GPU de 24 GB (por ejemplo, una RTX 3090). El objetivo del repositorio es resolver un problema práctico muy concreto: servir contextos de aproximadamente 249.000 tokens con decodificación especulativa MTP y torre de visión activadas en hardware de consumo, sacrificando la mínima calidad posible.

El compromiso asumido es notable: la cuantización reduce la calidad en tareas de código (14/50 tareas resueltas frente a 21/50 del modelo base con la misma receta de cuantización en un subconjunto de 50 tareas de DeepSWE), y la atención MLA consume más cómputo por pasada hacia adelante que la GQA original. A cambio se obtiene una capacidad de caché KV muy superior, lo que permite contextos de unos 250k tokens en una sola tarjeta de 24 GB. Es relevante para desarrolladores que necesitan contextos largos en hardware local y que operan sobre GPUs sm_86 (Ampere), donde la caché KV int8 propuesta ofrece ventajas claras.

Cabe señalar una discrepancia en los datos: aunque el nombre del modelo indica "27B", los tensores safetensors del repositorio suman 9.194.730.736 parámetros empaquetados (el propio README aclara que el contador de parámetros del Hub cuenta los tensores comprimidos, por lo que la cifra real de parámetros desempaquetados no está disponible en la información proporcionada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Multi-head Latent Attention (MLA), MTP (multi-token prediction) y torre de visión; indicios de componentes Mamba/SSM (parámetro `mamba-ssm-cache-dtype` en vLLM) |
| Parametros totales | 9.194.730.736 según safetensors del repo (tensores empaquetados); el nombre sugiere 27B desempaquetados (dato exacto no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 249.400 tokens (servido en RTX 3090 con caché KV int8) |
| Tipos de cuantizacion | EXL3 4,50 bpw medio (K 3/4/5 por tensor, KLD previsto 0,0052); lm_head y cabeza MTP a 4 bit; proyecciones latentes MLA (`kv_a_proj`, `k_rope_proj`, `kv_b_proj`) y torre de visión en bf16; caché KV int8 o FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato EXL3, exllamav3 1.6.0, codebook mul1) |

## Arquitectura y entrenamiento

La innovación central del modelo base es el uso de Multi-head Latent Attention (MLA) en lugar de la GQA estándar de Qwen3. MLA comprime la caché KV en proyecciones latentes (`kv_a_proj`, `k_rope_proj`, `kv_b_proj`), lo que reduce drásticamente el tamaño de la caché y permite contextos de ~250k tokens en una GPU de 24 GB. El coste es un mayor cómputo por pasada hacia adelante respecto a GQA. El modelo incorpora además una cabeza de predicción multi-token (MTP) para decodificación especulativa (probada con `num_speculative_tokens: 3`, con una aceptación medida de ~3,0 tokens por paso en tráfico real de código agéntico y ~3,9 en el benchmark sintético) y una torre de visión mantenida en bf16. La presencia de parámetros como `--mamba-ssm-cache-dtype` y `--mamba-cache-mode` en la configuración de vLLM sugiere una arquitectura híbrida con componentes SSM, aunque la model card no lo detalla explícitamente.

Sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no hay información disponible en la model card. En cuanto a la cuantización, se realizó con exllamav3 1.6.0 usando la receta `recipe_4.50_k345.yaml` con `--out_scales auto`, con un KLD previsto de 0,0052 frente al modelo en bf16.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento con parser `qwen3` integrado en vLLM (soporte de salida de razonamiento estilo Qwen3).
- Generación y edición de código: el tráfico de producción medido es mayoritariamente de código agéntico, y la configuración incluye el parser de tool calls `qwen3_coder`.
- Tool calling / function calling nativo: la configuración de servicio activa `--enable-auto-tool-choice --tool-call-parser qwen3_coder`.
- Soporte de agentes y flujos multi-paso: la aceptación MTP medida (~3,0 tokens/paso) proviene de tráfico agéntico real, y se activa `--enable-prefix-caching` para reutilizar prefijos en conversaciones multi-turno.
- Capacidades de visión: la torre de visión se mantiene en bf16 y el README indica que puede servirse "con vision on".
- Contexto extremadamente largo en hardware de consumo: hasta 249.400 tokens en una sola GPU de 24 GB con caché KV int8.

## Casos de uso

- Asistentes de código con repositorios completos como contexto: los ~249k tokens de ventana permiten cargar decenas de miles de líneas de código y razonar sobre ellas en local; el parser `qwen3_coder` y el tool calling lo integran en editores y agentes de programación.
- Agentes de código multi-paso en local: la decodificación especulativa MTP (k=3) acelera los bucles agénticos, y el prefix caching reutiliza el contexto del sistema y del repositorio entre iteraciones.
- Análisis de documentos extensos: contratos, expedientes o corpus científicos de cientos de páginas pueden procesarse de una sola pasada sin RAG, gracias a la caché KV comprimida por MLA.
- Chat con RAG de contexto muy largo: la ventana de 249k tokens permite introducir grandes bloques recuperados sin truncamiento, manteniendo latencias de ~74 tok/s a 64k de contexto en una RTX 3090.
- Servidor multi-usuario en una sola GPU: con 8 peticiones concurrentes se alcanzan ~400-450 tok/s agregados (~53 tok/s por petición), adecuado para equipos pequeños o entornos de desarrollo.
- Aplicaciones con entrada multimodal (texto e imagen): la torre de visión en bf16 permite describir y razonar sobre imágenes junto a contextos largos de texto.
- Experimentación con MLA y EXL3 en hardware Ampere: el repo incluye instrucciones completas de despliegue con vLLM y plugins, útil como referencia técnica para servir arquitecturas MLA cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento publicados son mediciones propias del autor de la cuantización:

Rendimiento en decodificación de flujo único (RTX 3090, caché KV int8, MTP k=3):

| Contexto | ms/paso | tok/s (tráfico de producción, ~3,0 tok/paso) | tok/s (benchmark sintético, ~3,9 tok/paso) |
|---|---|---|---|
| 8k | 37,8 | ~79 | ~104 |
| 64k | 40,4 | ~74 | ~96 |
| 110k | 52,4 | ~57 | ~75 |

Ocho peticiones concurrentes (prompts cortos, respuestas de razonamiento largas):

| Generación total | Por petición |
|---|---|
| ~400-450 tok/s | ~53 tok/s |

Calidad relativa (subconjunto de 50 tareas de DeepSWE, harness Pi, un intento por tarea):

| Modelo | Tareas resueltas |
|---|---|
| Qwen3.8-27B-MLA exl3 4,50 bpw (este repo) | 14/50 |
| Qwen3.8-27B stock exl3 4,50 bpw | 21/50 |

## Requisitos de hardware

- VRAM: el repo completo ocupa 18,4 GB; diseñado para caber en una GPU de 24 GB junto con la caché KV int8, el MTP y la visión activados, sirviendo 249.400 tokens de contexto (configuración de referencia: `--gpu-memory-utilization 0.94`).
- GPU de referencia: RTX 3090 (arquitectura sm_86 / Ampere). En GPUs con tensor cores FP8 nativos (sm_89 y posteriores: Ada, Hopper, Blackwell), la ventaja de la caché int8 desaparece y se recomiendan las builds oficiales de TelperionAI.
- Cabe en GPUs consumer de 24 GB (RTX 3090 / 4090); no hay datos para tarjetas de menor VRAM.
- Despliegue: vLLM 0.27.1 con dos plugins obligatorios (MLA plugin y plugin EXL3, rama `mla-latent-unquantized`); el formato EXL3 es nativo de exllamav3, por lo que también debería funcionar con ese motor. No hay menciones a llama.cpp, Ollama o TGI. Variables de entorno recomendadas en sm_86: `QWEN_MLA_INT8_KV=1`, `QWEN_MLA_MAX_PAGE_RATIO=2`, `QWEN_MLA_DECODE_BACKEND=triton`.
- Latencia y throughput: 37,8 ms/paso a 8k de contexto (~104 tok/s sintético) y 52,4 ms/paso a 110k (~75 tok/s) en flujo único; la caché KV int8 decodifica 1,5 veces más rápido que FP8 en 3090 (95,5 → 59,6 ms/paso a 110k con 3 peticiones). La caché int8 requiere TP=1.

## Comparativa con modelos similares

| | Qwen3.8-27B-MLA exl3 4,50 bpw (este repo) | Qwen3.8-27B stock exl3 4,50 bpw | TelperionAI/Qwen3.8-27B-MLA (base, sin cuantizar) |
|---|---|---|---|
| Autor | Starw1 | no disponible | TelperionAI |
| Atención | MLA | GQA (stock) | MLA |
| Contexto servible en 24 GB | ~249.400 tokens (KV int8) | no disponible | no disponible |
| DeepSWE (50 tareas) | 14/50 | 21/50 | no disponible |
| Decodificación especulativa MTP | Sí (k=3) | no disponible | Sí |
| Visión | Sí (bf16) | no disponible | Sí |
| Licencia | Apache 2.0 | no disponible | Apache 2.0 |
| Hardware objetivo | sm_86 (RTX 3090) | no disponible | sm_89+ (builds oficiales recomendadas) |

Alternativas externas de la misma categoría (modelos MLA cuantizados de ~27B) no disponibles en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: en el subconjunto DeepSWE resuelve 14/50 tareas frente a 21/50 del modelo base cuantizado con la misma receta, una caída significativa en tareas de código agéntico.
- Mayor coste computacional: la atención MLA consume más cómputo por pasada hacia adelante que la GQA del modelo stock.
- La caché KV int8 solo es ventajosa en sm_86 y requiere paralelismo de tensores TP=1; en GPUs más modernas (sm_89+) conviene usar las builds oficiales del modelo base.
- El despliegue con vLLM exige instalar dos plugins de terceros (ramas específicas de GitHub), lo que añade fragilidad y dependencia de versiones concretas (probado solo en vLLM 0.27.1).
- El campo `quantization_config.bits` del `config.json` indica 4 solo por limitación del Hub; herramientas que lean ese campo pueden malinterpretar la cuantización real (4,50 bpw medio con K variable por tensor).
- Discrepancia de nomenclatura: el nombre indica 27B pero los safetensors empaquetados suman 9,19B de parámetros; conviene verificar el tamaño real antes de planificar despliegues.
- Sesgos, riesgo de alucinación y idiomas soportados: no disponible en la información proporcionada.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el rendimiento degradado en código respecto al modelo stock debe evaluarse antes de llevarlo a producción.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/Starw1/Qwen3.8-27B-MLA-exl3-4.50bpw-H4
- Modelo base: https://huggingface.co/TelperionAI/Qwen3.8-27B-MLA
- Plugin MLA para vLLM (rama `sm86-fp8`): https://github.com/Starwaves1/qwen-mla-vllm/tree/sm86-fp8
- Plugin EXL3 para vLLM (rama `mla-latent-unquantized`): https://github.com/Starwaves1/vllm-gsqrco-exl3/tree/mla-latent-unquantized

No se han encontrado enlaces a papers, blogs oficiales ni demos en la información disponible.
