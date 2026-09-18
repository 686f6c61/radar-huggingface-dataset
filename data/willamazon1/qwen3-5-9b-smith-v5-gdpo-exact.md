# willamazon1/Qwen3.5-9B-smith-v5-gdpo-exact

## Resumen

Qwen3.5-9B-smith-v5-gdpo-exact es una serie de puntos de control (checkpoints) de ajuste por refuerzo sobre el modelo base Qwen/Qwen3.5-9B, publicada por el usuario willamazon1. No se trata de un modelo único, sino de un repositorio que contiene 92 instantáneas de un mismo entrenamiento de RL, guardadas entre la iteración 3 y la 199, cada una en su propio subdirectorio. El objetivo declarado es permitir la comparación de distintos puntos de la curva de entrenamiento de un proceso de RL agéntico en entornos multi-turno con recompensa verificable (exact reward).

El entrenamiento parte de un SFT interno del propio Qwen3.5-9B (denominado qwen35_9b_sft_v3), que también actúa como modelo de referencia, y emplea el algoritmo GSPO sin penalización KL (kl_coef=0.0). La arquitectura subyacente es Qwen3.5, con atención híbrida (lineal y completa), una torre de visión y 32 capas de texto con dimensión oculta 4096. El repo ocupa 1448 GB en total, en precisión bfloat16.

Su relevancia es fundamentalmente investigadora: es material para estudiar dinámicas de RL (GSPO, clip ranges muy estrechos, batches de rollout concretos) sobre una base de 9B, más que un modelo listo para producción. Tiene 0 descargas y 0 likes en el momento de la consulta, y aporta únicamente pesos en safetensors, sin estados del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`, atención híbrida lineal/completa + torre de visión), 32 capas de texto, hidden 4096, 16 cabezas / 4 grupos KV, vocab 248320 |
| Parametros totales | Aproximadamente 9000 millones (según la denominación del modelo; el autor no publica el recuento exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No se especifica ventana de contexto oficial; la configuración de entrenamiento usa longitud de secuencia de 65536 tokens y longitud máxima de respuesta de 4096 tokens |
| Tipos de cuantizacion | Solo bfloat16 en el repositorio; no se publican versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (convertidos desde un checkpoint `torch_dist` de Megatron-LM) |

Datos adicionales de entrenamiento declarados por el autor:

| Parametro | Valor |
|---|---|
| Algoritmo de RL | GSPO (`advantage_estimator=gspo`), sin penalización KL (`kl_coef=0.0`) |
| Learning rate | 1.5e-6 constante (`min_lr=0`) |
| Clip range | `eps_clip=3e-3`, `eps_clip_high=4e-3` |
| Rollouts | batch de 16 prompts x 8 muestras, batch global 64, temperatura 1.0 |
| Paralelismo en entrenamiento | TP 2, PP 1, CP 8 |
| Puntos de control | 92, de `iter_0000003` a `iter_0000199` |
| Precision | bfloat16 |
| Estado del optimizador | No incluido |

## Arquitectura y entrenamiento

La base es Qwen3.5 en su variante de 9B, implementada como `Qwen3_5ForConditionalGeneration`. Se trata de una arquitectura híbrida que combina capas de atención lineal con capas de atención completa, e incorpora una torre de visión, lo que implica que el modelo base es multimodal aunque la ficha del autor no detalle el uso de esa capacidad durante el RL. La torre de texto tiene 32 capas, dimensión oculta 4096, 16 cabezas de atención con 4 grupos KV (GQA) y un vocabulario de 248320 entradas.

El proceso de RL se describe como «asynchronous multi-turn agentic-environment RL» con recompensa exacta y verificable sobre Qwen/Qwen3.5-9B. La política se inicializa desde un SFT interno (`qwen35_9b_sft_v3`) que además sirve como referencia, pero sin penalización KL en la pérdida. Se emplea GSPO como estimador de ventaja, con learning rate constante de 1.5e-6 y un clip range asimétrico muy estrecho (3e-3 / 4e-3). Los rollouts usan 16 prompts con 8 muestras cada uno, batch global 64 y temperatura 1.0, con respuestas de hasta 4096 tokens dentro de secuencias de 65536. La conversión a safetensors se realizó con la herramienta `tools/convert_torch_dist_to_hf.py` de slime, eliminando el padding de embeddings hasta el `vocab_size` del tokenizador y verificando ausencia de NaN/Inf y coherencia entre el índice y los tensores en disco. No se menciona ningún uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto condicionada por chat template, según el ejemplo de uso del autor.
- Uso de herramientas (tool use) y comportamiento agéntico: el entrenamiento se define explícitamente como RL sobre entornos agénticos multi-turno, y las etiquetas del repositorio incluyen `agent` y `tool-use`.
- Razonamiento multi-paso en entornos: al haber sido entrenado con recompensa verificable en interacciones multi-turno, el modelo está orientado a resolver tareas con pasos encadenados.
- Inferencia de aritmética y tareas verificables: el ejemplo de la model card usa una operación aritmética simple ("What is 12*8?"), coherente con el tipo de recompensa exacta empleada.
- Capacidad de visión: la arquitectura incluye torre de visión (`Qwen3_5ForConditionalGeneration`), aunque el autor no documenta si se conserva ni cómo se comporta tras el RL.
- Serie comparativa de 92 checkpoints: permite evaluar el efecto de la iteración de RL sobre el comportamiento del modelo.
- Capacidades multilingües: no disponible (la ficha no declara idiomas).

## Casos de uso

- Investigación en algoritmos de RL: el repositorio permite reproducir y analizar la curva de aprendizaje de GSPO con `kl_coef=0.0`, comparando 92 checkpoints para estudiar inestabilidad, deriva de política o colapso de entropía.
- Barrido de selección de checkpoint: dado que se guardan muchas iteraciones intermedias, se puede evaluar cada una en un conjunto de validación propio y quedarse con la mejor en lugar de asumir que la última (`iter_0000199`) es la óptima.
- Agentes con llamada a herramientas: el modelo ha sido entrenado específicamente en entornos agénticos con tool use, por lo que encaja en prototipos de asistentes que encadenan llamadas a APIs y observan resultados.
- Automatización de tareas verificables: al haber usado recompensa exacta, es adecuado para escenarios donde la respuesta se puede comprobar (cálculos, transformaciones de datos, resolución de problemas con solución única).
- Evaluación comparativa de métodos de RL: sirve como punto de referencia frente a otras variantes de la misma serie (`smith-v5-gdpo-exact` frente a otras configuraciones) para medir el impacto del estimador de ventaja y del clip range.
- Destilación o inicialización de experimentos posteriores: un checkpoint intermedio puede usarse como punto de partida para SFT adicional o para RL con otras recompensas, partiendo de una política ya entrenada en multi-turno.
- Estudio de recuperación de checkpoints convertidos: el flujo Megatron-LM `torch_dist` a safetensors documentado aquí es replicable para equipos que trabajen con pipelines de entrenamiento a gran escala y necesiten publicar pesos interoperables.
- Base para prototipos multimodales: al conservar la torre de visión en la arquitectura, puede servir de punto de partida si se quiere explorar texto-imagen, aunque el autor no documenta el estado de esa capacidad tras el RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, ni curvas de recompensa por iteración. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, unos 18 GB solo para los pesos de un modelo de ~9B, más el espacio de activaciones y caché KV. El autor no publica cifras medidas.
- Caché KV: con secuencias de hasta 65536 tokens, la caché KV puede dominar el consumo de memoria; la arquitectura usa GQA con 4 grupos KV, lo que reduce ese coste respecto a atención multi-cabeza completa.
- GPU recomendadas: A100 (40 o 80 GB) y H100 para ejecución en bfloat16 con contexto largo; también válidas GPUs de 24 GB para contextos cortos.
- GPUs de consumo: una RTX 4090 (24 GB) puede alojar los pesos en bfloat16, con margen limitado para caché KV y activaciones; en contextos largos o con lotes mayores será necesario cuantizar o reducir la longitud.
- En entrenamiento el autor usó TP 2, PP 1 y CP 8, lo que implica un mínimo de 8 GPUs para reproducir el esquema de paralelismo, además de memoria para estados de RL durante el rollout.
- Opciones de despliegue: el autor solo documenta `transformers` con `AutoModelForCausalLM` y `device_map="auto"`. El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado (la arquitectura híbrida con torre de visión puede requerir versiones específicas del runtime).
- Descarga selectiva: el repositorio completo ocupa 1448 GB por contener 92 checkpoints; el autor documenta el uso de `hf download --include "iter_0000199/*"` para bajar solo una iteración.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| willamazon1/Qwen3.5-9B-smith-v5-gdpo-exact | ~9B | No especificado (entrenamiento a 65536) | Sin benchmarks publicados | Apache 2.0 | HuggingFace, 92 checkpoints, 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | ~9B | No disponible en la informacion proporcionada | No disponible | No indicada en la informacion proporcionada | HuggingFace, referenciado como `base_model` |
| Otras alternativas de ~9B con RL para agentes y tool use | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con modelos de la misma categoría distintos del propio modelo base.

## Limitaciones y advertencias

- No es un modelo único: son 92 checkpoints en subcarpetas; cargarlo requiere pasar obligatoriamente el argumento `subfolder=` o descargar el repositorio completo (1448 GB).
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, seguridad o rendimiento frente al modelo base, por lo que no se puede afirmar que el RL haya mejorado al modelo en tareas generales.
- Riesgo de degradación por RL: el entrenamiento usa `kl_coef=0.0`, sin anclaje al modelo de referencia; esto puede provocar deriva de política, pérdida de capacidades generales o colapso de diversidad en iteraciones avanzadas, sin que el autor documente curvas de recompensa o de KL.
- Riesgo de alucinación: inherente a los modelos generativos; en este caso no hay evaluación publicada que lo cuantifique.
- Idiomas soportados: no declarados. No hay garantía documentada de comportamiento en castellano.
- Visión: la arquitectura incluye torre de visión, pero el autor no indica si se entrenó, se congeló o se degradó durante el RL.
- Licencia Apache 2.0 sobre los pesos publicados, pero la model card no aclara la procedencia de los datos de RL ni del SFT interno (`qwen35_9b_sft_v3`), lo que dificulta auditar el cumplimiento de las condiciones del modelo base Qwen.
- Estado del optimizador no incluido: no permite reanudar el entrenamiento tal cual, solo continuar desde los pesos.
- Repositorio sin tracción: 0 descargas y 0 likes, sin validación por parte de la comunidad; conviene tratarlo como material experimental.
- Fecha de creación registrada como 2026-09-18, posterior a la fecha habitual de consulta; conviene verificar la vigencia y posibles actualizaciones del repositorio.
- Compatibilidad de despliegue no garantizada fuera de `transformers`, dada la arquitectura híbrida de Qwen3.5.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/willamazon1/Qwen3.5-9B-smith-v5-gdpo-exact
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Herramienta de conversión slime (`tools/convert_torch_dist_to_hf.py`): https://github.com/THUDM/slime
- Paper, blog o demo del autor: no disponible
- Resultados de benchmarks: no disponible
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (únicamente resultados genéricos de un servicio de traducción).
