# Vaingloryy/luau-agent-3b

## Resumen

luau-agent-3b es un modelo de generación de código especializado en Luau, el lenguaje de scripting propietario de Roblox, desarrollado por el usuario independiente Vaingloryy. Se trata de un ajuste fino del modelo base Nanbeige4.2-3B, un transformer denso de aproximadamente 4.170 millones de parámetros reales (etiquetado comercialmente como "3B"), orientado a tareas de programación y flujos agénticos dentro del ecosistema Roblox Studio.

El modelo resuelve un nicho concreto: la escasez de modelos abiertos con conocimiento profundo de las APIs de Roblox (Region3, OverlapParams, Humanoid, Instance, etc.) y de las convenciones idiomáticas de Luau, incluyendo tipado gradual con anotaciones `type`. Su relevancia radica en que la mayoría de modelos generalistas generan Lua 5.1 estándar y fallan en las particularidades de Luau y en el modelo de objetos de Roblox.

El autor advierte explícitamente de que la calidad es inconsistente debido al ajuste fino y a errores presentes en los datasets, y recomienda usar un modelo orquestador más capaz por encima. El entrenamiento se limitó a unos 100 millones de tokens por restricciones de presupuesto, sin fase de RL, lo que sitúa al modelo como un checkpoint SFT experimental más que como un asistente de producción autónomo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Nanbeige4.2-3B) |
| Parámetros totales | 4.169.800.704 (4,17 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (contexto de entrenamiento SFT; configurado a `-c 16384` en llama.cpp) |
| Tipos de cuantización | BF16 (pesos completos), Q8_0 (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, dos shards), GGUF (Q8_0) |
| Modelo base | Nanbeige/Nanbeige4.2-3B |
| Fecha de corte de conocimiento | 11 de octubre de 2026 |
| Requiere `trust_remote_code` | Sí (código personalizado) |

## Arquitectura y entrenamiento

El modelo parte de Nanbeige4.2-3B, un transformer denso decoder-only. Sobre esa base se aplicó un ajuste fino en dos etapas: primero un preentrenamiento continuado sobre código Luau y después un SFT con el optimizador AdamW. El método empleado fue LoRA en BF16 con rango 64 y alpha 64, aplicado a las proyecciones de salida de atención y a las proyecciones del MLP, con posterior fusión (merge) de los adaptadores en los pesos completos. No se realizó fase de RL por limitaciones presupuestarias, por lo que el artefacto publicado es el checkpoint SFT.

El volumen total de entrenamiento ronda los 100 millones de tokens, una cifra reducida que el propio autor justifica por restricciones económicas. La mezcla de datos incluye corpus de código Luau (`khtsly/roblox-luau-corpus`, `TorpedoSoftware/the-luau-stack`, `Pinkstack/oct2026-Roblox-Luaudev2-dataset-pretrain`), datasets de instrucciones específicos de Roblox (`Pinkstack/RobloxAgent-v2`, `Pinkstack/LuauDev-instructions-SFT-full`, `Pinkstack/2026-Roblox-Luaudev2-dataset-sft`, `khtsly/LuauCoder-1.0-Preview-SFT`), datos de matemáticas simples (`BackpropBuff/Principia_SimpleMath_Integers_1m`) y datasets de NVIDIA para seguimiento de instrucciones y tareas de ingeniería de software (`nvidia/Nemotron-SFT-Instruction-Following-Chat-v2`, `nvidia/Nemotron-SFT-SWE-v3.5`). El entrenamiento se completó en aproximadamente 20 horas sobre una única RTX PRO 6000 Blackwell en Google Colab.

No se documentan innovaciones arquitectónicas propias; las mejoras de rendimiento en inferencia provienen de técnicas externas habilitadas en llama.cpp, como decodificación especulativa por n-gramas (`--spec-type ngram-mod`) y caché KV cuantizada en Q8_0.

## Capacidades

- Generación de código Luau con conocimiento del modelo de objetos de Roblox: instancias, jerarquías, servicios (`workspace`, `Players`), clases (`BasePart`, `Model`, `Humanoid`) y APIs de consulta espacial (`Region3`, `GetPartsInRegion3`, `GetPartBoundsInBox`).
- Tipado gradual de Luau: emisión de alias `type`, anotaciones de parámetros y retorno, y patrones orientados a objetos con `setmetatable` y `__index`.
- Seguimiento de instrucciones conversacionales en inglés, heredado de los datasets Nemotron de instruction following.
- Soporte de tool calling / function calling mediante la plantilla de chat integrada (requiere `--jinja` en llama.cpp).
- Capacidad de razonamiento multi-paso limitada, orientada a tareas de agente dentro de Roblox Studio.
- Aritmética básica de enteros, reforzada por el dataset Principia_SimpleMath_Integers_1m.
- Capacidades multilingües: solo inglés declarado; no se garantiza rendimiento en castellano ni otros idiomas.
- No dispone de visión, audio ni modo de pensamiento explícito (thinking mode).

## Casos de uso

- Generación de módulos de gameplay en Roblox Studio: el modelo produce archivos Luau completos y tipados, como el ejemplo de sistema de hitboxes de la model card, con gestión de `OverlapParams`, filtros de exclusión y cálculo de daño sobre `Humanoid`. Es adecuado por su conocimiento directo de las APIs de Roblox frente a modelos generalistas.
- Asistente de autocompletado en el editor: integrado como servidor compatible con OpenAI en `http://localhost:8080` mediante `llama-server`, puede servir sugerencias de código dentro de un flujo de desarrollo local con latencia baja gracias a Q8_0 (~5 GB de VRAM).
- Refactorización de scripts existentes: con 16.384 tokens de contexto puede recibir módulos completos de tamaño medio y reescribirlos con anotaciones de tipo o migrar patrones obsoletos a APIs actuales.
- Agente de edición de código orquestado: el autor recomienda un modelo superior como orquestador que descomponga la tarea y llame a luau-agent-3b para generar los fragmentos Luau, aprovechando el soporte de tool calling y la decodificación especulativa por n-gramas para acelerar ediciones repetitivas.
- Generación de utilidades matemáticas simples en scripts de juego: cálculo de daño, probabilidades de drop, escalado de estadísticas, apoyado en el dataset de enteros incluido en el entrenamiento.
- Prototipado rápido de sistemas de inventario, cooldowns por jugador o temporizadores: tareas acotadas y bien especificadas donde el modelo rinde mejor que en arquitecturas complejas de múltiples módulos.
- Evaluación comparativa de modelos pequeños para dominio Roblox: útil en investigación como referencia SFT de bajo coste para medir la brecha frente a modelos mayores en tareas de código específicas de plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de Luau o Roblox. El autor únicamente señala que la calidad es inconsistente y que los errores en "buffers" son el fallo más frecuente en los datos actuales.

## Requisitos de hardware

- VRAM estimada: Q8_0 requiere aproximadamente 5 GB más la caché KV; con caché KV cuantizada en Q8_0 (`-ctk q8_0 -ctv q8_0`) y contexto de 16.384 tokens, el consumo adicional se reduce aproximadamente a la mitad respecto a FP16.
- Pesos completos en BF16: el repositorio ocupa 12,8 GB, por lo que la inferencia en Transformers necesita del orden de 9-10 GB de VRAM solo para pesos, más activaciones y caché KV.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más para Q8_0 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); para BF16 se recomienda 16 GB o más (RTX 4080/4090, A100, H100). El autor entrenó en una RTX PRO 6000 Blackwell.
- Cabe en GPU consumer: sí, en Q8_0 con 8 GB o más; en BF16 con 16 GB o más.
- Opciones de despliegue: llama.cpp (`llama-server`, con API compatible con OpenAI), LM Studio, Ollama (a través del GGUF, siempre que la build soporte Nanbeige), y Transformers con `trust_remote_code=True`. vLLM y TGI no están documentados para este modelo.
- Latencia y throughput: no disponibles. La configuración recomendada activa decodificación especulativa por n-gramas (`--spec-type ngram-mod`), que acelera ediciones de código con texto repetido, y Flash Attention para reducir VRAM.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| luau-agent-3b | 4,17 B | 16.384 | Luau / Roblox | Apache 2.0 | Hugging Face (safetensors + GGUF Q8_0) |
| Nanbeige4.2-3B (base) | ~3 B (nominal) | no disponible en la información | Generalista | no disponible en la información | Hugging Face |
| Modelos generalistas tipo Qwen2.5-Coder-3B | ~3 B | no disponible en la información | Código multilingüe | no disponible en la información | Hugging Face |

La comparación cuantitativa con alternativas no está disponible: no se han publicado benchmarks de luau-agent-3b ni datos de rendimiento frente a otros modelos en tareas Luau. La diferencia principal frente a modelos de código generalistas es la especialización en APIs de Roblox y tipado Luau, a costa de un volumen de entrenamiento muy reducido (~100 M tokens) y de un rendimiento inferior en tareas generales.

## Limitaciones y advertencias

- Calidad inconsistente reconocida por el autor: el ajuste fino y los errores en los datasets producen salidas incorrectas de forma intermitente; los "buffers" se citan como el error más frecuente.
- Riesgo de alucinación en APIs de Roblox: puede inventar métodos, propiedades o firmas de clases que no existen en la versión actual del motor.
- Volumen de entrenamiento bajo (~100 M tokens) y ausencia de RL: no hay alineación por preferencias, lo que limita la fiabilidad en instrucciones ambiguas.
- Contexto efectivo de 16.384 tokens: insuficiente para proyectos grandes; requiere trocear el código en módulos.
- Solo inglés declarado: no se garantiza calidad en castellano ni en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Nanbeige4.2-3B debe verificarse por separado para confirmar compatibilidad de licencia en producción.
- Requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código del repositorio; conviene auditar el código personalizado antes de desplegarlo.
- Recomendación del autor: usar un modelo orquestador más competente por encima, no emplearlo como agente autónomo único.
- Fecha de corte de conocimiento futura (11 de octubre de 2026): verificar que las APIs de Roblox referenciadas correspondan a la versión del motor en uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vaingloryy/luau-agent-3b
- Modelo base Nanbeige4.2-3B: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Dataset Pinkstack/RobloxAgent-v2: https://huggingface.co/datasets/Pinkstack/RobloxAgent-v2
- Dataset khtsly/LuauCoder-1.0-Preview-SFT: https://huggingface.co/datasets/khtsly/LuauCoder-1.0-Preview-SFT
- Dataset khtsly/roblox-luau-corpus: https://huggingface.co/datasets/khtsly/roblox-luau-corpus
- Dataset TorpedoSoftware/the-luau-stack: https://huggingface.co/datasets/TorpedoSoftware/the-luau-stack
- Dataset Pinkstack/2026-Roblox-Luaudev2-dataset-sft: https://huggingface.co/datasets/Pinkstack/2026-Roblox-Luaudev2-dataset-sft
- Dataset Pinkstack/LuauDev-instructions-SFT-full: https://huggingface.co/datasets/Pinkstack/LuauDev-instructions-SFT-full
- Dataset Pinkstack/oct2026-Roblox-Luaudev2-dataset-pretrain: https://huggingface.co/datasets/Pinkstack/oct2026-Roblox-Luaudev2-dataset-pretrain
- Dataset BackpropBuff/Principia_SimpleMath_Integers_1m: https://huggingface.co/datasets/BackpropBuff/Principia_SimpleMath_Integers_1m
- Dataset nvidia/Nemotron-SFT-Instruction-Following-Chat-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Instruction-Following-Chat-v2
- Dataset nvidia/Nemotron-SFT-SWE-v3.5: https://huggingface.co/datasets/nvidia/Nemotron-SFT-SWE-v3.5
- llama.cpp: https://github.com/ggml-org/llama.cpp
