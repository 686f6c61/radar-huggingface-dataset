# supremeDavid/Qwen3-4B-story-puzzle-rl-lora

## Resumen

Qwen3-4B-story-puzzle-rl-lora es un adaptador LoRA (PEFT) entrenado mediante aprendizaje por refuerzo con GRPO sobre el modelo base Qwen/Qwen3-4B. Lo publica el usuario supremeDavid en Hugging Face y su propósito declarado, a partir de las etiquetas del repositorio, es el ajuste del comportamiento del modelo en tareas de alineación moral y generación de historias estructuradas tipo "puzzle" (story puzzles). No se trata de un modelo completo, sino de un conjunto de pesos incrementales que debe cargarse junto al checkpoint base Qwen3-4B.

El modelo base, Qwen3-4B, es un transformer denso de 4.000 millones de parámetros de la familia Qwen3 de Alibaba, con soporte de modo de razonamiento (thinking) y una ventana de contexto amplia. El adaptador hereda esas capacidades y las especializa mediante RL, una técnica que en la práctica busca reforzar trayectorias de razonamiento que conducen a respuestas consideradas correctas o moralmente coherentes en el dominio de las historias con dilemas.

La relevancia de esta ficha es acotada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, el acceso está restringido (gated) y no se han publicado resultados de evaluación, datos de entrenamiento ni detalles del proceso de RL. Debe tratarse, por tanto, como un artefacto experimental de nicho y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B) con adaptador LoRA sobre capas del transformer; método de ajuste GRPO (reinforcement learning) |
| Parametros totales | 4.000 millones en el modelo base; el adaptador LoRA añade un número de parámetros no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del adaptador; heredada del modelo base Qwen3-4B (no confirmada en la información proporcionada) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos LoRA en safetensors; la cuantización dependerá del checkpoint base que se combine) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base Qwen/Qwen3-4B |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, matrices de bajo rango insertadas en las proyecciones del transformer base Qwen3-4B, que permanece congelado durante el ajuste. La técnica de entrenamiento declarada en las etiquetas es GRPO (Group Relative Policy Optimization), un algoritmo de RL sin crítico que estima la ventaja de cada respuesta comparándola con la media de un grupo de muestras generadas para el mismo prompt. Este esquema se ha popularizado para reforzar cadenas de razonamiento en modelos pequeños y medianos, y encaja con el modo de razonamiento nativo de Qwen3.

No se dispone de información sobre el número de pasos de entrenamiento, el tamaño o la composición del dataset de historias y dilemas morales, la función de recompensa empleada, ni si hubo etapas previas de SFT o DPO. Tampoco se documentan hiperparámetros del LoRA (rango, alpha, capas objetivo). Todo ello debe considerarse no disponible.

## Capacidades

- Generación de texto narrativo, en particular historias estructuradas tipo puzzle con restricciones o pistas encadenadas.
- Razonamiento en varios pasos y modo de pensamiento heredado de Qwen3 (el adaptador puede reforzar o alterar este comportamiento, sin datos que lo confirmen).
- Razonamiento moral y alineación en dilemas presentados dentro de narrativas, según la etiqueta moral-alignment del repositorio.
- Generación de texto multilingüe en la medida en que lo soporte el modelo base; el adaptador no declara idiomas propios.
- Soporte de tool calling y function calling: no confirmado para el adaptador; depende del modelo base y de que el ajuste no haya degradado esa capacidad.
- Comportamiento agéntico y multi-step reasoning: no confirmado.
- Capacidades de visión o audio: no disponibles (Qwen3-4B es un modelo de texto).

## Casos de uso

- Generación de puzles narrativos interactivos: el adaptador puede emplearse para producir historias con acertijos o pistas encadenadas, aprovechando el ajuste específico sobre el dominio de story puzzles para mantener coherencia entre planteamiento y solución.
- Investigación en alineación moral: útil como banco de pruebas para estudiar cómo el RL con GRPO modifica las respuestas de un modelo de 4B ante dilemas éticos dentro de contextos narrativos, comparándolo con el base sin adaptador.
- Prototipado de experiencias educativas: generación de relatos con decisiones morales para talleres de ética o filosofía, donde el modelo propone escenarios y consecuencias alternativas.
- Evaluación de técnicas de RL en modelos pequeños: sirve como caso de estudio reproducible de GRPO aplicado a un transformer denso de 4B con LoRA, para quienes investigan métodos de refuerzo con recursos limitados.
- Generación de contenido creativo con restricciones: redacción de cuentos con reglas formales (número de pistas, giros obligatorios, resolución única), donde el ajuste específico puede mejorar la adherencia a la estructura frente al base.
- Fine-tuning incremental sobre el adaptador: al ser un LoRA en safetensors, puede combinarse o continuarse el entrenamiento para otros dominios narrativos sin tocar los pesos completos del base.
- Despliegue en entornos con presupuesto de VRAM ajustado: al requerir solo el base de 4B más el adaptador, cabe en GPUs de consumo con cuantización del base (ver sección de hardware).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa aproximadamente 0,8 GB según el tamaño del repositorio; el grueso del coste corresponde al modelo base Qwen3-4B.
- Inferencia en FP16/BF16 del base de 4B: en torno a 8-9 GB de VRAM, más overhead de contexto.
- Cuantización del base en 8 bits: aproximadamente 4-5 GB de VRAM; en 4 bits (GGUF/AWQ/GPTQ): aproximadamente 2,5-3,5 GB.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 en FP16; en 4 bits también en GPUs de 6-8 GB.
- GPU de datacenter: A100, H100 y L40S lo ejecutan sin problemas con margen para lotes grandes y contextos largos.
- Despliegue: al ser un adaptador PEFT, puede servirse con vLLM (soporte de LoRA), TGI, transformers + peft, y con llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-story-puzzle-rl-lora (este) | 4B (base) + LoRA | no disponible | Adaptador LoRA con GRPO | Apache 2.0 | Gated en HF, 0 descargas |
| Qwen/Qwen3-4B (base) | 4B | no disponible en esta ficha | Transformer denso con modo thinking | Apache 2.0 | Público en HF |
| Adaptadores LoRA comunitarios sobre Qwen3-4B | 4B (base) + LoRA | depende del base | LoRA (SFT o RL) | variable | Públicos en HF |
| Modelos de 3-4B para narrativa (p. ej. variantes de Llama 3.2 3B o Gemma 2 2B ajustadas) | 2-4B | variable | Transformer denso | licencias variables | Públicos en HF |

La comparación cuantitativa de rendimiento no es posible: no hay benchmarks publicados para este adaptador ni datos que permitan situarlo frente a alternativas. La comparación relevante es de naturaleza: frente al Qwen3-4B base, este artefacto añade especialización en story puzzles y alineación moral vía RL, a costa de un acceso restringido y una documentación mínima.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede bloquear pipelines automatizados.
- Documentación prácticamente inexistente: sin model card detallada, sin datos de entrenamiento, sin evaluación y sin hiperparámetros del LoRA.
- Sin validación empírica: cero descargas y cero likes; no hay evidencia pública de que el ajuste mejore al base en las tareas declaradas.
- Riesgo de alucinación: inherente a un modelo de 4B, y potencialmente agravado si el RL optimiza hacia recompensas que premian respuestas plausibles pero no verificadas.
- Sesgos: el ajuste en "alineación moral" puede introducir una orientación ética particular derivada de la función de recompensa, no documentada; riesgo de moralismo o de respuestas sesgadas en dilemas culturalmente sensibles.
- Idiomas: no declarados; el comportamiento multilingüe dependerá del base y puede degradarse tras el ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B tiene sus propios términos que deben respetarse al combinarlo.
- No apto para producción sin evaluación propia: al ser un experimento de nicho, requiere validación en el dominio objetivo antes de cualquier despliegue.
- El adaptador debe fusionarse o cargarse junto al base exacto Qwen/Qwen3-4B; incompatibilidades de versión de PEFT o transformers pueden impedir la carga.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/supremeDavid/Qwen3-4B-story-puzzle-rl-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Documentación de PEFT: https://huggingface.co/docs/peft
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Repositorio de vLLM (soporte LoRA): https://github.com/vllm-project/vllm
