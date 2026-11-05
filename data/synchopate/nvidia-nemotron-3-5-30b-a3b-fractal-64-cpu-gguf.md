# Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16`, publicada por el usuario Synchopate bajo el nombre comercial "Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF". Se trata de un modelo híbrido Mamba-2 + Mixture-of-Experts (MoE) de 30B parámetros totales con unos 3B activos por token, derivado de la familia Nemotron 3 Nano de NVIDIA. El autor no es NVIDIA: es un tercero que aplica una cuantización asimétrica propia ("Fractal-64") y empaqueta un motor de inferencia específico en su repositorio de GitHub.

El objetivo declarado es ejecutar un modelo de 30B con contexto de 256K en CPU pura a velocidades comparables a GPU, aprovechando que la mayoría de capas son SSM recurrentes (memoria de estado O(1)) y solo unas pocas usan atención GQA. El autor reporta entre 25 y 111 tok/s según plataforma, con un peso en disco de 14,35 GiB. Es relevante para quienes quieran desplegar modelos grandes en hardware sin GPU o con GPU híbrida, aunque conviene tratar las cifras como afirmaciones del autor no verificadas de forma independiente.

La licencia declarada es MIT, heredada del modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 5 de noviembre de 2026, lo que indica que es una publicación muy reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 SSM + Mixture-of-Experts (MoE) con atención GQA-2 en 6 de 52 capas |
| Parametros totales | 30B (aproximado, según nombre del modelo) |
| Parametros activos | ~3B (A3B en el nombre; no confirmado en la información) |
| Longitud de contexto | 256.000 tokens (declarado por el autor) |
| Tipos de cuantizacion | GGUF asimétrica "Fractal-64": Q2_0 (expertos MoE en frío), Q4_K / Q8_0 / F32 (backbone Mamba-2, expertos compartidos y atención) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (14,35 GiB) |

## Arquitectura y entrenamiento

La arquitectura es híbrida: 52 capas en total, de las cuales 46 son capas SSM recurrentes Mamba-2 y solo 6 usan atención con GQA de 2 cabezas. El componente MoE enruta tokens hacia expertos dispersos, de los que solo se activa una fracción por token (~3B activos de 30B totales). Esta combinación reduce drásticamente el coste de memoria de la caché KV: según el autor, un contexto completo de 256K requiere solo 6,0 GiB de KV cache, frente a más de 64 GiB en un transformer estándar equivalente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o instruction tuning en el modelo base. El modelo del que deriva es la variante "Base-BF16", lo que sugiere que no está afinado para instrucciones. La innovación técnica destacable de esta publicación no está en el entrenamiento sino en la cuantización: bloques de 64 pesos con escala y mínimo en FP16 para los expertos MoE (3,75 bits por peso), preservando precisión completa en el backbone SSM y la atención, más un drafter especulativo de 1,64 MB ("Stockfish-PVS" + "RouteCrack") que el autor afirma residente en L3 y con 94,5% de aceptación en tareas de código y tool use.

## Capacidades

- Generación de texto autoregresiva como modelo base (no instruction-tuned según el nombre del checkpoint).
- Razonamiento y código: el autor reporta uso con Claude Code y tool schemas, aunque al ser un modelo base la calidad en instrucciones puede ser limitada.
- Tool calling / function calling: el ecosistema del autor (`./modchip claude`) incluye 40 esquemas de herramientas, pero no se confirma que el modelo base esté entrenado específicamente para ello.
- Decodificación especulativa integrada mediante drafter L3-resident.
- Contexto largo de hasta 256K tokens con recuperación tipo needle-in-a-haystack al 100% según el autor.
- Capacidades multilingües: no disponible.
- No se declaran capacidades de visión, audio ni thinking mode.

## Casos de uso

- Inferencia en CPU sin GPU: desplegar un modelo de 30B en servidores sin acelerador, aprovechando los 14,35 GiB de peso y el bajo coste de KV cache para contexto largo en estaciones de trabajo con 32-64 GB de RAM.
- Procesamiento de documentos extensos: análisis de contratos, informes o bases de código de cientos de miles de tokens gracias a la ventana de 256K con KV cache de solo 6 GiB.
- Asistentes de código en local: integración con herramientas tipo Claude Code mediante el CLI `modchip claude` del autor, con decodificación especulativa orientada a tool use.
- Despliegue en ARM64 en cloud: el autor reporta 44,97 tok/s en AWS Graviton3 `c7g.16xlarge`, útil para cargas batch en instancias ARM sin GPU.
- Configuraciones híbridas GPU+CPU: con `-ngl 99 -ot exps=CPU` en llama.cpp se puede offload de expertos a CPU y mantener el resto en GPU, reportándose 80,80 tok/s en una RX 7900 GRE.
- Experimentación en investigación: estudiar el comportamiento de modelos híbridos Mamba-2/MoE cuantizados agresivamente en entornos de recursos limitados.
- Prototipado de pipelines de generación de texto con llama.cpp: al ser GGUF, se integra con el ecosistema estándar (llama.cpp, Ollama, etc.) sin necesidad de infraestructura propietaria.

## Benchmarks y rendimiento

El autor publica una tabla de throughput por plataforma, no de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.). No se han publicado resultados de benchmarks de calidad en la información disponible.

| Plataforma | Arquitectura | Decode (tok/s) | Stack |
|---|---|---|---|
| AMD Threadripper PRO 7985WX (64c) | x86_64 Zen 4 | 111,62 | CPU pura (AVX-512) |
| Ryzen 9 9900X + RX 7900 GRE | Zen 5 + RDNA 3 | 80,80 | Híbrido Vulkan |
| Ryzen 9 9950X / EPYC 4545P (16c) | x86_64 Zen 5 | 25,0–60,4 | CPU pura + drafter |
| AWS Graviton3 c7g.16xlarge (64 vCPU) | ARM64 Neoverse-V1 | 44,97 | CPU pura (NEON) |

## Requisitos de hardware

- VRAM/RAM: 14,35 GiB de pesos; para contexto completo de 256K se suman ~6,0 GiB de KV cache, por lo que se recomienda al menos 24-32 GB de RAM total.
- GPU recomendadas: no requiere GPU; en modo híbrido el autor cita Radeon RX 7900 GRE. No hay datos para A100/H100/RTX 4090.
- Cabe en GPU de consumo: sí, en GPUs con 16-24 GB de VRAM si se offload parcial de expertos a CPU.
- Opciones de despliegue: llama.cpp (base del formato GGUF), motor propietario `llama-modchip` del autor, y potencialmente Ollama u otros frontends GGUF compatibles.
- Latencia/throughput: 25,0-60,4 tok/s en CPU Zen 5 de 16 núcleos; 111,62 tok/s en Threadripper PRO; 44,97 tok/s en Graviton3. Cifras declaradas por el autor, no verificadas de forma independiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Fractal-64 GGUF) | 30B totales / ~3B activos | 256K | MIT | GGUF | Cuantización de tercero, orientada a CPU |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16 | 30B / ~3B activos | no disponible | MIT (según este repo) | safetensors BF16 | Modelo base original de NVIDIA |
| Modelos MoE de ~30B con contexto largo (p. ej. familia Qwen MoE) | ~30B | 32K-128K típicamente | variable | safetensors/GGUF | No disponible comparación directa de rendimiento |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo base, no instruction-tuned: el rendimiento en instrucciones y tool calling puede ser inferior al de variantes chat/instruct.
- Cifras de throughput y aceptación especulativa (94,5%) declaradas por el autor, sin verificación independiente.
- Cuantización Q2_0 en expertos MoE: puede degradar calidad frente a Q4_K_M o superiores; el autor no publica evaluaciones de calidad (perplejidad, MMLU).
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes de terceros.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingüe.
- Requiere el motor `llama-modchip` del autor para aprovechar el drafter especulativo; con llama.cpp estándar el rendimiento puede diferir.
- Licencia MIT declarada, pero conviene verificar la licencia del modelo base de NVIDIA antes de uso comercial.
- Riesgo de alucinación inherente a modelos base sin alineación; no apto para producción crítica sin evaluación previa.
- Fecha de creación (noviembre de 2026) muy reciente: ecosistema y soporte aún sin madurar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Synchopate/NVIDIA-Nemotron-3.5-30B-A3B-Fractal-64-CPU-GGUF
- Motor y CLI del autor: https://github.com/synchopate/llama-modchip
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-Base-BF16
