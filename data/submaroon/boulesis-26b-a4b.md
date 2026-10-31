# SubMaroon/Boulesis-26B-A4B

## Resumen

Boulesis-26B-A4B es un modelo de rol (roleplay) creado por el usuario SubMaroon a partir de una fusión compositiva sobre la familia Gemma 4 26B-A4B, una arquitectura MoE con aproximadamente 26,5 mil millones de parámetros totales y unos 4 mil millones activos. No es un modelo entrenado desde cero: se trata de una combinación quirúrgica de tres modelos derivados (gemma-4-26B-A4B-it-heretic de coder3101, Gemma-4-26B-A4B-StyleTune-V2 y Pantheon-Reasoning-26B-A4B-1.1 de Gryphe), editando solo proyecciones de atención concretas, un LoRA fusionado y el lm_head.

El problema que aborda es habitual en los modelos de roleplay: la excesiva reactividad, es decir, la tendencia del modelo a limitarse a reflejar el último turno del usuario en lugar de avanzar la narrativa y aprovechar la ficha de personaje (character card). El autor plantea que esto es en gran parte un problema de enrutamiento de la atención y lo ataca injertando las proyecciones Q/K del modelo Pantheon-Reasoning.

Es relevante porque representa una tendencia en la comunidad open source de RP: ediciones selectivas basadas en interpretabilidad mecanicista (separar dónde mira el modelo de qué recupera), en lugar de merges completos que degradan la inteligencia base. El propio autor recomienda la versión v2.1 como superior, por lo que esta versión v1 conviene evaluarla junto a aquella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Gemma 4), merge compositivo (aritmética de tareas QK + LoRA fusionado) |
| Parametros totales | 26.544.131.376 (≈26,5B) |
| Parametros activos | ≈4B (indicado por la designación A4B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo original (formato safetensors en BF16; existen GGUF comunitarios, según la model card) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (53,1 GB en el repositorio) |

## Arquitectura y entrenamiento

Boulesis se construye sobre `coder3101/gemma-4-26B-A4B-it-heretic` (un modelo Gemma 4 26B-A4B abliterado mediante ARA en las capas 10-30) como cuerpo principal. Sobre él se aplican tres operaciones muy localizadas: se copia el tensor `lm_head` completo desde `Gryphe/Gemma-4-26B-A4B-StyleTune-V2` (un único tensor de los 659 totales), se inyectan las proyecciones `q_proj` y `k_proj` mediante aritmética de tareas con α = 0,6 (base + α·(Pantheon-Reasoning-1.1 − unsloth/gemma-4-26B-A4B-it)), y se fusiona un LoRA de rango 32 (alpha 64, 55 proyecciones) sobre `v_proj` y `o_proj` con escala efectiva 0,26. El resto del modelo permanece intacto.

La hipótesis del autor, inspirada en trabajo de interpretabilidad mecanicista, es que las proyecciones Q/K determinan "dónde mira" el modelo y las V/O "qué recupera". El objetivo era redirigir la atención hacia la character card y el contexto previo. El propio autor reconoce en la model card que la inyección de Q/K no produjo ganancias significativas en análisis profundo de la ficha de personaje, funcionando más como contrapeso del LoRA; el impacto más medible vino del `lm_head` de StyleTune 2, que combinado con las demás operaciones mejoró la calidad general del roleplay. No hay entrenamiento desde cero ni datos de RLHF/DPO propios: no disponible.

## Capacidades

- Generación de texto narrativo orientada a roleplay, con prosa diversificada y mayor iniciativa para avanzar la trama.
- Modo de razonamiento (thinking): el autor recomienda explícitamente usarlo activado para obtener los mejores resultados.
- Mejor adherencia al contexto de la character card, incorporando lore y hechos de forma orgánica.
- Base heredada abliterada (heretic/ARA en capas 10-30): sin rechazos de seguridad típicos, etiquetada como uncensored.
- Compatibilidad con SillyTavern y KoboldCPP, incluyendo soporte de razonamiento en GGUF (requiere configuración manual).
- Capacidades generales de inteligencia y conocimiento preservadas según el autor ("cero olvido catastrófico"), aunque sin benchmarks que lo verifiquen.
- Tool calling, agentes y capacidades multilingues: no disponible / no objetivo del modelo.

## Casos de uso

- Roleplay interactivo en SillyTavern: el caso de uso principal. El modelo mantiene personajes coherentes con sus fichas, con tramas más dinámicas y personajes que toman iniciativa en lugar de reaccionar pasivamente.
- Narrativa colaborativa de acción: según el autor, la v1 destaca por tramas dinámicas y acción, adecuada para escenarios de aventuras con ritmo alto.
- Escritura creativa asistida: generación de prosa ficción en inglés donde se desee un modelo sin filtros de rechazo y con estilo no homogéneo.
- Prototipado de técnicas de merge: sirve como ejemplo real de ediciones selectivas de atención (task arithmetic en Q/K, LoRA en V/O, trasplante de lm_head) replicables en otros modelos.
- Uso local en GGUF: cuantizado, puede ejecutarse en KoboldCPP para sesiones de RP offline en hardware de consumo de gama alta.
- Experimentación con razonamiento en RP: al soportar thinking mode, permite explorar cómo el razonamiento interno mejora la coherencia narrativa multi-personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor afirma cualitativamente que se preserva la inteligencia base y que hay mejoras en calidad de roleplay, pero no aporta métricas (MMLU, HumanEval, GSM8K ni evaluaciones de RP estandarizadas).

## Requisitos de hardware

- VRAM estimada: en precisión nativa (safetensors, ~53,1 GB) se necesitan unas 3 GPU de 24 GB o una A100/H100 de 80 GB. Con cuantización GGUF Q4 (~15-16 GB) cabe en una RTX 4090 (24 GB) o en 2 GPU de 12-16 GB; con Q3/Q2 podría aproximarse a una sola GPU de 16 GB con sacrificio de calidad.
- GPU recomendadas: RTX 4090 o RTX 3090 para GGUF local; A100 80 GB o H100 para inferencia en precisión completa.
- Consumer GPU: sí, viable en RTX 4090/3090 mediante GGUF; la activación MoE (~4B activos) favorece el throughput una vez cargados los pesos.
- Despliegue: llama.cpp, KoboldCPP (con opciones de razonamiento habilitadas manualmente), Ollama y SillyTavern como frontend; vLLM/TGI no mencionados en la model card pero viables para modelos Gemma 4 si la versión lo soporta.
- Latencia y throughput estimados: no disponible; al tener solo ~4B de parámetros activos, la velocidad de generación debería ser comparable a un denso de ese tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Enfoque |
|---|---|---|---|---|
| Boulesis-26B-A4B (v1) | 26,5B totales / ~4B activos | Merge Gemma 4 MoE | Apache 2.0 | Roleplay, uncensored, thinking |
| Boulesis-v2.1-26B-A4B | 26,5B totales / ~4B activos | Merge Gemma 4 MoE | no disponible | Roleplay, mejor memoria de contexto según el autor |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1 | 26,5B totales / ~4B activos | Fine-tune Gemma 4 MoE | no disponible | Razonamiento, fuente de las proyecciones Q/K |
| Gryphe/Gemma-4-26B-A4B-StyleTune-V2 | 26,5B totales / ~4B activos | Fine-tune Gemma 4 MoE | no disponible | Estilo de escritura, fuente del lm_head |

Frente a sus fuentes, Boulesis se diferencia por la edición selectiva de atención y por orientarse específicamente a roleplay con iniciativa narrativa; frente a otras versiones de Boulesis, la v1 prioriza tramas dinámicas mientras la v2.1 ofrece mejor comprensión de personajes según el propio autor.

## Limitaciones y advertencias

- Al ser un merge experimental sin benchmarks publicados, las afirmaciones sobre preservación de inteligencia son cualitativas y no verificables con datos.
- Modelo monolingüe en inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Etiquetado como uncensored y construido sobre un modelo abliterado: carece de salvaguardas de seguridad estándar, lo que exige uso responsable y filtros externos en entornos expuestos a terceros.
- El razonamiento (thinking) puede no activarse correctamente en GGUF con KoboldCPP o SillyTavern sin configuración manual específica.
- El propio autor reconoce que la inyección de Q/K no logró el objetivo de profundizar el análisis de la character card; parte del diseño es un contrapeso del LoRA.
- Existe una versión posterior (v2.1) que el autor considera superior, por lo que esta v1 puede no ser la mejor elección para sesiones complejas multi-personaje.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero los modelos base derivados de Gemma pueden estar sujetos a las condiciones de Google; conviene revisar la cadena de licencias.
- Riesgo de alucinación: no disponible; inherente a modelos de lenguaje generativos, especialmente en RP sin anclaje factual.

## Enlaces

- Modelo: https://huggingface.co/SubMaroon/Boulesis-26B-A4B
- Versión recomendada por el autor (v2.1): https://huggingface.co/SubMaroon/Boulesis-v2.1-26B-A4B
- Modelo base (cuerpo): https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic
- Modelo base (estilo): https://huggingface.co/Gryphe/Gemma-4-26B-A4B-StyleTune-V2
- Modelo base (razonamiento): https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1
- Donaciones del autor: https://boosty.to/submaroon/donate
