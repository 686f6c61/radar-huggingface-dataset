# SpeedAI-Lab/DAMI

## Resumen

DAMI (Dual-Axis Memory Initialization) es una técnica de inicialización de memoria para modelos de atención lineal con compuerta (gated linear attention) orientada a mejorar la recuperación de información en contextos largos. El repositorio `SpeedAI-Lab/DAMI` no contiene un modelo único, sino un conjunto de 15 checkpoints de investigación: cinco arquitecturas (GDN, KDA, GDN2, Mamba-2 y RWKV-7) entrenadas bajo tres condiciones de inicialización distintas (Random, PoST y DAMI). Cada checkpoint ronda los 100 millones de parámetros y se entrenó con aproximadamente 5.000 millones de tokens y una ventana de contexto de entrenamiento de 4096 tokens.

La propuesta central es asignar escalas temporales de memoria de forma diferenciada entre cabezas de atención y distribuir las respuestas a la entrada entre capas, en lugar de usar una inicialización uniforme. El objetivo es que el estado recurrente de estos modelos retenga información relevante durante más tiempo sin aumentar el coste computacional, un problema clásico de las arquitecturas de atención lineal y de los modelos de estado recurrente cuando se enfrentan a tareas de recuperación con contexto largo.

Su relevancia es fundamentalmente metodológica: ofrece una comparación controlada del mismo truco de inicialización aplicado a cinco familias de arquitecturas lineales, con evaluación estandarizada sobre RULER. No es un modelo listo para producción, sino material reproducible para investigadores que trabajan en atención lineal, modelos de estado y eficiencia en contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cinco arquitecturas de atención lineal / estado recurrente con compuerta: GDN, KDA, GDN2, Mamba-2 y RWKV-7 |
| Parametros totales | Aproximadamente 100M por checkpoint (15 checkpoints) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens en entrenamiento; evaluación RULER en 11 configuraciones de tarea/longitud |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json`, `generation_config.json`, `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

El repositorio agrupa cinco arquitecturas lineales: GDN (Gated DeltaNet), KDA (Kimi-Linear Delta Attention), GDN2 (GatedDeltaNet-2), Mamba-2 y RWKV-7. Todas comparten la característica de mantener un estado recurrente de tamaño fijo en lugar de una matriz de atención cuadrática, lo que las hace candidatas naturales para contextos largos. Sobre cada una se aplican tres condiciones de inicialización: aleatoria (baseline), PoST y DAMI, que da nombre al trabajo.

DAMI actúa en dos ejes: asigna distintas escalas temporales de memoria a cada cabeza y distribuye las respuestas a la entrada a lo largo de las capas. Cada modelo se entrenó con unos 5.000 millones de tokens y contexto de 4096 tokens. La infraestructura empleada incluye FLA (flash-linear-attention), FLAME para el entrenamiento, y adaptaciones específicas de RWKV y de las implementaciones de GatedDeltaNet, GatedDeltaNet-2, Kimi-Linear y Mamba. No se detalla en la información disponible la composición exacta del dataset ni si hubo fases de RLHF o DPO; el entrenamiento parece orientado a modelado de lenguaje y evaluación de recuperación, no a alineamiento conversacional.

## Capacidades

- Generación de texto autoregresiva en inglés con modelos de aproximadamente 100M de parámetros.
- Recuperación de información en contexto largo, evaluada con RULER en 11 configuraciones de tarea y longitud.
- Procesamiento de secuencias de hasta 4096 tokens según la configuración de entrenamiento.
- Evaluación comparativa de inicialización: cada checkpoint permite aislar el efecto de DAMI frente a PoST y a inicialización aleatoria.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta visión, audio ni modo de razonamiento explícito (thinking mode).
- Decodificación greedy con hasta 128 tokens nuevos en el script de evaluación incluido.

## Casos de uso

- Investigación en atención lineal: comparar el efecto de DAMI sobre GDN, KDA, GDN2, Mamba-2 y RWKV-7 con el mismo protocolo y los mismos datos, aislando la variable de inicialización.
- Estudio de inicialización de estado recurrente: usar los 15 checkpoints como ablation controlada para medir cuánto de la mejora en recuperación proviene de la inicialización y no de la arquitectura.
- Reproducción de resultados RULER: ejecutar `evaluate_ruler.py` sobre los 5.500 samples fijos y las 82.500 predicciones originales para validar las cifras del paper.
- Prototipado de modelos de contexto largo de bajo coste: los checkpoints de 100M permiten experimentar con recuperación en contexto largo en una sola GPU consumer.
- Base para fine-tuning en dominios concretos: al ser modelos pequeños y con licencia MIT, sirven como punto de partida para tareas de recuperación documental o QA extractiva en inglés.
- Docencia y formación: el conjunto de 15 modelos con tres condiciones de inicialización es un material didáctico útil para explicar el impacto de la inicialización en modelos de estado.
- Evaluación de infraestructura: probar cargas específicas de FLA y RWKV en pipelines de evaluación propios antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Precisión media (%) en RULER, según el paper:

| Arquitectura | Random | PoST | DAMI |
|---|---:|---:|---:|
| GDN | 30,42 | 33,49 | 44,36 |
| KDA | 26,38 | 33,67 | 43,09 |
| GDN2 | 30,27 | 33,47 | 43,71 |
| Mamba-2 | 9,95 | 13,73 | 24,42 |
| RWKV-7 | 23,87 | 20,69 | 29,16 |

La media pondera por igual las 11 configuraciones de tarea/longitud de RULER. La evaluación usa decodificación greedy con hasta 128 tokens nuevos y puntuación por contención de respuesta insensible a mayúsculas. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento o código.

## Requisitos de hardware

- VRAM estimada: con aproximadamente 100M de parámetros, los pesos en fp32 ocupan unos 0,4 GB; en fp16/bf16, unos 0,2 GB. El repo completo (15 checkpoints) ocupa 5,3 GB.
- GPU recomendadas: cualquier GPU con CUDA y al menos 4-8 GB de VRAM es suficiente para un checkpoint individual; se ha validado en Linux/WSL con CUDA.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: el repositorio proporciona su propio script `evaluate_ruler.py` con adaptaciones específicas de FLA y RWKV; no se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| DAMI (GDN/KDA/GDN2/Mamba-2/RWKV-7) | ~100M | 4096 (entrenamiento) | Inicialización dual para atención lineal | MIT |
| Mamba-2 (referencia base) | ~100M en este repo | 4096 | SSM con estado recurrente | MIT (según implementación) |
| RWKV-7 (referencia base) | ~100M en este repo | 4096 | RNN lineal con atención | MIT (según implementación) |
| GDN / KDA / GDN2 (referencia base) | ~100M en este repo | 4096 | Atención lineal con compuerta | MIT (según implementación) |

La comparativa relevante no es frente a modelos de propósito general, sino interna: DAMI frente a PoST y a inicialización aleatoria sobre las mismas arquitecturas. En esa comparación, DAMI mejora la media RULER entre 8,5 y 14,5 puntos sobre la inicialización aleatoria según la arquitectura. No se dispone de comparación con modelos de mayor escala ni con alternativas comerciales en la información proporcionada.

## Limitaciones y advertencias

- Modelos de investigación de ~100M de parámetros: su calidad de generación general es muy inferior a la de modelos de producción; no están pensados para uso conversacional.
- Solo inglés; no se documenta soporte multilingüe.
- Contexto de entrenamiento de 4096 tokens; el rendimiento más allá de esa longitud no está validado en la información disponible.
- Riesgo de alucinación y sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o factualidad.
- La licencia MIT permite uso comercial, pero los checkpoints incorporan implementaciones de terceros (FLA, RWKV, GatedDeltaNet, Kimi-Linear, Mamba) cuyas condiciones conviene revisar por separado.
- Los datos de evaluación RULER tienen avisos de atribución propios (`data/ruler/NOTICE.md`) que deben respetarse.
- El repositorio requería autenticación mientras era privado; conviene verificar el estado de acceso antes de automatizar descargas.
- No hay integración documentada con servidores de inferencia estándar; el uso previsto es mediante el script de evaluación del propio repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/SpeedAI-Lab/DAMI
- Paper (arXiv): https://arxiv.org/abs/2610.41994
- Repositorio de código: https://github.com/SpeedAI-Lab/DAMI
- Página del proyecto: https://speedai.com/research/dami
- Código, datos de evaluación y scripts (CNB): https://cnb.cool/speed-ai/research/DAMI
- FLA (flash-linear-attention): https://github.com/fla-org/flash-linear-attention
- FLAME: https://github.com/fla-org/flame
- RWKV-LM: https://github.com/BlinkDL/RWKV-LM
- GatedDeltaNet: https://github.com/NVlabs/GatedDeltaNet
- GatedDeltaNet-2: https://github.com/NVlabs/GatedDeltaNet-2
- Kimi-Linear: https://github.com/MoonshotAI/Kimi-Linear
- Mamba: https://github.com/state-spaces/mamba
- RULER: https://github.com/NVIDIA/RULER
