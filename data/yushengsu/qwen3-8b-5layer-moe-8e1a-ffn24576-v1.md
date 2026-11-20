# yushengsu/Qwen3-8B-5layer-MoE-8E1A-FFN24576-v1

## Resumen

Qwen3-8B-5layer-MoE-8E1A-FFN24576-v1 es un modelo borrador (draft model) para decodificación especulativa sobre Qwen/Qwen3-8B, desarrollado por el usuario yushengsu y entrenado con SpecForge (variante DSpark). No es un modelo de propósito general: su función es proponer tokens candidatos que el modelo objetivo Qwen3-8B verifica en paralelo, acelerando la inferencia sin alterar la distribución de salida del modelo grande. Se publica bajo licencia Apache 2.0.

Técnicamente es un transformer de 5 capas en el que cada FFN se sustituye por una capa MoE con 8 expertos de anchura 24576 (el doble de la FFN densa del borrador), con enrutamiento top-1 y sin experto compartido, lo que da 12,45 mil millones de parámetros totales y 1,88 mil millones activos por token. La atención usa 32 cabezas de consulta y 8 de clave/valor de dimensión 128 con q/k norm, un proyector fc de 20480 a 4096 sobre las capas 1/9/17/25/33 del modelo objetivo, una cabeza Markov de rango 256 y bloque especulativo de 16 tokens.

Su relevancia es acotada pero clara para quien despliegue Qwen3-8B en producción: un borrador de bajo coste activo por token puede aumentar el throughput de decodificación en escenarios de latencia crítica, siempre que se use el fork de servicio específico que el autor indica. El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks de aceptación o speedup.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 5 capas con FFN sustituida por MoE top-1 (8 expertos, sin experto compartido); atención 32 q / 8 KV heads x 128 con q/k norm; proyector fc 20480->4096 sobre capas 1/9/17/25/33 del objetivo; cabeza Markov rango 256; bloque 16 |
| Parametros totales | 12,45 B |
| Parametros activos | 1,88 B |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoint publicado como `1ep/` al finalizar la época) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa, no un modelo autónomo. Reutiliza la arquitectura de Qwen3 pero reducida a 5 capas, y reemplaza cada FFN densa por una capa MoE con 8 expertos de anchura 24576 y enrutamiento top-1, sin experto compartido. El autor indica que existe una contrapartida densa con una única FFN de anchura 24576, lo que permite comparar el efecto del enrutamiento disperso en la tasa de aceptación. La atención mantiene 32 cabezas de consulta y 8 de clave/valor de dimensión 128 con normalización en q y k. Para alinear el borrador con el modelo objetivo, se añade un proyector fc de 20480 a 4096 que toma estados de las capas 1, 9, 17, 25 y 33 de Qwen3-8B, además de una cabeza Markov de rango 256 y un bloque especulativo de 16 tokens.

El entrenamiento consistió en una única época sobre prompts de "perfectblend regen" con temperatura 0 y sin modo thinking, contexto de 8192 tokens, plantilla de Qwen3-instruct sin system prompt, learning rate 6e-4 con schedule coseno y 4 % de warm-up, 144 muestras por paso de optimizador (12 rangos x 6 x 2), 9867 pasos y Liger RMSNorm, sobre cuatro nodos GB300 con 4x GPU cada uno. El código de entrenamiento está en un pull request del fork de SpecForge del autor, y el servicio requiere el paquete `dev-moe-serving` del mismo fork, con `Qwen3MoeDSparkModel`, el campo `gate.selection_bias` renombrado a `gate.expert_bias` y `dflash_config.moe_router_enable_expert_bias: true`. No se documentan fases de RLHF o DPO, ni el volumen total de tokens de entrenamiento más allá de la configuración de la época.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen/Qwen3-8B; no está pensado para usarse como modelo generativo independiente.
- Propuesta de bloques de hasta 16 tokens que el modelo objetivo verifica en paralelo.
- Enrutamiento MoE top-1 con 8 expertos por capa, orientado a reducir el coste activo por token (1,88 B activos frente a 12,45 B totales).
- Alineación con el espacio de estados intermedios de Qwen3-8B mediante proyector fc sobre cinco capas del objetivo.
- Cabeza Markov de rango 256 para modelar dependencias entre tokens dentro del bloque especulativo.
- Soporte de tool calling, agentes, visión, audio o razonamiento multi-paso: no disponible; el borrador hereda únicamente la distribución del objetivo a través del proceso de verificación.
- Capacidades multilingües: no disponibles de forma explícita; dependen del dataset de entrenamiento (perfectblend regen) y del modelo objetivo.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el borrador propone bloques de 16 tokens que el modelo objetivo verifica, reduciendo el número de pasos de decodificación secuencial cuando la tasa de aceptación es alta. Requiere el fork `dev-moe-serving`.
- Servicio de chat de baja latencia: al tener 1,88 B parámetros activos por token, el coste de cada paso del borrador es muy inferior al del objetivo, lo que puede mejorar el tiempo hasta el primer token en flujos conversacionales.
- Despliegue en clústeres con GB300 o GPUs de gran memoria: el entrenamiento se realizó en cuatro nodos GB300, por lo que el entorno de referencia del autor es de alta gama; el borrador se sirve junto al objetivo y comparte el presupuesto de memoria.
- Investigación en decodificación especulativa con MoE: la existencia de una contrapartida densa de anchura 24576 permite comparar empíricamente el efecto del enrutamiento top-1 en la tasa de aceptación y en el speedup.
- Evaluación de pipelines SpecForge/DSpark: el checkpoint y el PR asociado sirven como referencia reproducible para validar la integración de borradores MoE en el fork de SpecForge.
- Generación por lotes con verificación paralela: en cargas de trabajo de summarización o extracción sobre contexto de hasta 8192 tokens, el borrador puede amortizar su coste si el objetivo acepta bloques largos de forma consistente.
- No es adecuado para uso directo como chatbot, generación de código autónoma ni tareas de razonamiento sin el modelo objetivo: su salida no está calibrada como distribución final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de aceptación, speedup, MMLU, HumanEval ni GSM8K, ni comparaciones medidas con el modelo objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 12,45 B parámetros totales, en FP16 el peso del borrador ronda los 25 GB; en BF16 sería similar. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- El borrador debe servirse junto a Qwen3-8B, por lo que el presupuesto de memoria es la suma de ambos modelos más las cachés KV.
- GPU recomendadas: el autor entrenó en cuatro nodos GB300 (4x GPU por nodo); para servicio no se especifican GPUs concretas. Por tamaño, A100 80 GB, H100 80 GB o GB300 son opciones razonables; no hay datos publicados de despliegue en RTX 4090.
- ¿Cabe en GPU consumer? No disponible. Con 12,45 B parámetros totales, una RTX 4090 de 24 GB no podría alojar el borrador en FP16 junto al objetivo; requeriría cuantización, que no está documentada.
- Opciones de despliegue: el autor indica que el servicio necesita el paquete `dev-moe-serving` de su fork de SpecForge (`Qwen3MoeDSparkModel`). No se mencionan vLLM, llama.cpp, Ollama ni TGI como compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-5layer-MoE-8E1A-FFN24576-v1 (este) | 12,45 B totales / 1,88 B activos | 8192 | Borrador especulativo MoE para Qwen3-8B | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B (objetivo) | 8 B | no disponible en la información | Modelo generativo de propósito general | no disponible en la información | Hugging Face |
| Contrapartida densa del borrador (misma config, FFN 24576) | no disponible | 8192 | Borrador especulativo denso | no disponible | Citada en la model card, sin enlace |
| Otros borradores SpecForge/DSpark | no disponible | no disponible | Borradores especulativos | no disponible | Repositorio SpecForge |

No se dispone de datos de rendimiento comparado (tasa de aceptación, speedup) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: su salida debe verificarse siempre contra Qwen3-8B; usarlo de forma autónoma produce texto no calibrado.
- Requiere un fork específico de SpecForge (`dev-moe-serving`) y cambios de nombres de campos (`gate.selection_bias` a `gate.expert_bias`, `dflash_config.moe_router_enable_expert_bias: true`); no funciona con el paquete estándar.
- El checkpoint se publica como `1ep/` al finalizar la época; conviene verificar la integridad y el estado del entrenamiento antes de usarlo.
- Contexto de entrenamiento limitado a 8192 tokens; no hay datos sobre extrapolación más allá de esa longitud.
- No se documentan idiomas soportados, sesgos, tasas de alucinación ni comportamiento en dominios fuera del dataset perfectblend regen.
- No hay benchmarks publicados de tasa de aceptación o speedup, por lo que el beneficio real en producción es desconocido y debe medirse en el entorno de destino.
- Con 0 descargas y 0 likes, no hay evidencia de uso en producción ni validación externa.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del fork de servicio y del modelo objetivo Qwen3-8B implica revisar también la licencia de este último.
- El tamaño total de 12,45 B parámetros exige memoria considerable aunque solo 1,88 B estén activos; el ahorro es de cómputo, no de VRAM.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-8E1A-FFN24576-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Pull request de SpecForge con el código de entrenamiento: https://github.com/yushengsu-thu/SpecForge/pull/22
- Configuración del borrador: `configs/qwen3-8b-5layer-moe8x24576-8A1-dspark.json` en el fork de SpecForge
- Repositorio SpecForge: no disponible en la información proporcionada
- Paper de DSpark: no disponible en la información proporcionada
