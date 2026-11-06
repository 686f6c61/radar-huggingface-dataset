# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-graddiff

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-graddiff` es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario de Hugging Face `sungjuncho`, que ha sido sometido a un proceso de *machine unlearning* mediante el algoritmo GradDiff sobre el conjunto de datos TOFU-para. No se trata de un modelo de propósito general nuevo, sino de un artefacto de investigación orientado a estudiar la eliminación selectiva de conocimiento factual en modelos de lenguaje. El modelo base inmediato es `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full`, un fine-tune de Llama 3.1 8B Instruct sobre la totalidad de TOFU más dos versiones parafraseadas del mismo.

La relevancia de este checkpoint reside en su contribución metodológica: la colección TOFU-para separa explícitamente el concepto de *untraining* (eliminar las muestras concretas que el método de desaprendizaje recibió) del de *unlearning* (eliminar el conocimiento subyacente, que el modelo también había aprendido en otras formulaciones). Para ello, el conjunto de datos incorpora cinco versiones parafraseadas verificadas de cada par pregunta-respuesta, lo que permite medir si el olvido es genuino o meramente superficial.

Arquitectónicamente es un transformer decoder-only estándar de la familia Llama 3.1, con 8.030.261.248 parámetros (aproximadamente 8,03 mil millones), licencia Llama 3.1 Community License y pesos en formato safetensors. El repositorio ocupa 16,1 GB, lo que corresponde a pesos en bfloat16. No se dispone de información sobre longitud de contexto específica de este checkpoint más allá de la heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.261.248 (~8,03 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada presumiblemente de Llama 3.1 8B Instruct: 128.000 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no especifica; el modelo base Llama 3.1 soporta oficialmente 8 idiomas: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Dataset de desaprendizaje | sungjuncho/TOFU-para |
| Modelo base | sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full |
| Algoritmo de unlearning | GradDiff (open-unlearning) |
| Tamano del repositorio | 16,1 GB |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 8B Instruct, un transformer decoder-only con atención por grupos (GQA) y RoPE, y sobre él se aplicó un fine-tune completo sobre TOFU-para x2 (TOFU con erratas en nombres corregidas más dos versiones parafraseadas de cada par QA), dando lugar al checkpoint `x2-full`. Posteriormente se aplicó GradDiff, un método de desaprendizaje implementado en la librería `open-unlearning` del grupo locuslab, que combina un término de ascenso de gradiente sobre el conjunto a olvidar con un término de descenso de gradiente sobre el conjunto a retener.

Los detalles del proceso son concretos: el conjunto *forget* utilizado son únicamente los 400 pares QA originales de forget10, mientras que el conjunto *retain* combina retain90 más las dos versiones parafraseadas (10.800 ejemplos en total). Se emplearon los hiperparámetros por defecto de GradDiff en open-unlearning, sin recorte de gradiente, con tamaño de lote efectivo 32; la configuración exacta está en el directorio `train_config/` del repositorio. No se documentan en la información disponible detalles sobre el número total de tokens de entrenamiento del fine-tune previo ni sobre el uso de RLHF/DPO adicional más allá del que ya incorpora Llama 3.1 Instruct.

La innovación metodológica destacable no está en la arquitectura sino en la evaluación: la métrica FADE (divergencia KL simétrica respecto al modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) permite cuantificar cuán distinguible es el modelo desaprendido del de referencia. La separación entre untraining y unlearning se evalúa comparando contra dos referencias distintas: `x2-retain90-forget10para` (untraining) y `x2-retain90` (unlearning).

## Capacidades

- Generación de texto conversacional: hereda las capacidades del Llama 3.1 8B Instruct original, incluyendo diálogo multi-turno.
- Razonamiento y conocimiento factual general: preservado parcialmente según la métrica de utilidad del modelo (0,660).
- Capacidad de desaprendizaje selectivo verificable: el checkpoint demuestra olvido efectivo del conjunto forget10, con probabilidad Q-A de 0,000 y ROUGE de 0,000 sobre el conjunto forget.
- Soporte de tool calling / function calling: presumiblemente heredado del modelo base Llama 3.1 Instruct, aunque no se documenta explícitamente en la model card de este checkpoint.
- Capacidades multilingües: no documentadas específicamente para este checkpoint; dependen del modelo base.
- Modo *thinking*: no disponible (Llama 3.1 8B Instruct no incorpora modo de razonamiento extendido).
- Visión y audio: no soportados (modelo puramente textual).

## Casos de uso

- Investigación en machine unlearning: el checkpoint sirve como referencia reproducible para comparar algoritmos de desaprendizaje (GradDiff frente a otras alternativas) sobre el benchmark TOFU-para, permitiendo medir tanto untraining como unlearning genuino.
- Auditoría de privacidad y cumplimiento del RGPD: permite estudiar hasta qué punto es posible eliminar datos personales o factuales concretos de un modelo ya entrenado sin reentrenar desde cero, un requisito relevante para el derecho al olvido.
- Evaluación de robustez del olvido ante paráfrasis: al incluir versiones parafraseadas en la evaluación, el modelo resulta útil para medir si el conocimiento olvidado reaparece cuando se reformula la pregunta, un escenario crítico en producción.
- Estudio de la degradación de utilidad: con una utilidad de 0,660, el checkpoint permite analizar el compromiso entre olvido efectivo y pérdida de capacidades generales, informando el diseño de futuros métodos.
- Desarrollo de pipelines de desaprendizaje en producción: la configuración de entrenamiento publicada en `train_config/` sirve como plantilla para aplicar GradDiff a otros conjuntos forget/retain en modelos Llama.
- Benchmarking de métricas de evaluación: la inclusión de FADE con estimador Rao-Blackwellizado y los resultados por pregunta en `evals/` permiten validar y comparar nuevas métricas de olvido frente a las existentes.
- Docencia y divulgación técnica: como ejemplo didáctico de un pipeline completo de unlearning (fine-tune, definición de conjuntos, aplicación de GradDiff y evaluación multi-métrica).

## Benchmarks y rendimiento

Los resultados publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para`, forget10 original) | 6190,21 |
| FADE, unlearning (vs `x2-retain90`, forget10 original + 2 parafrasis) | 6473,84 |
| FADE, unlearning (original) | 6581,0 |
| FADE, unlearning (para1) | 6424,4 |
| FADE, unlearning (para2) | 6416,1 |
| TOFU forget quality (vs `x2-retain90`) | 1,06e-239 |
| Forget truth ratio | 3,75e-08 |
| Forget Q-A probability | 0,000 |
| Forget Q-A ROUGE | 0,000 |
| Model utility | 0,660 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los valores FADE más bajos indican mayor dificultad para distinguir el modelo desaprendido del de referencia, es decir, mejor calidad de olvido. La utilidad del modelo (0,660) es la métrica clave de retención de capacidades generales.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 20-24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 5-6 GB (aunque no se publican cuantizaciones oficiales).
- GPU recomendadas: A100 40GB/80GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en bfloat16 con contexto largo.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con contexto moderado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag `text-generation-inference` presente), vLLM, llama.cpp y Ollama previa conversión a GGUF (no se proporcionan GGUF oficiales).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este checkpoint (GradDiff) | 8,03 B | no disponible | llama3.1 | Unlearning con GradDiff sobre TOFU-para |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full` | 8,03 B | no disponible | llama3.1 | Fine-tune completo sobre TOFU-para x2 (referencia sin desaprender) |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90` | 8,03 B | no disponible | llama3.1 | Referencia retain90 (sin exposición al conjunto forget10) |
| Llama 3.1 8B Instruct (Meta) | 8,03 B | 128.000 tokens | llama3.1 | Modelo base de propósito general |

La comparación más directa es con los otros checkpoints de la misma colección TOFU-para, ya que comparten arquitectura y difieren únicamente en el tratamiento del conjunto forget. Frente a Llama 3.1 8B Instruct original, este checkpoint sacrifica utilidad general (0,660) a cambio de un olvido verificable del conjunto forget10.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para investigación en unlearning; no debe emplearse como modelo de propósito general en producción.
- La utilidad del modelo es 0,660, lo que indica una degradación sustancial de capacidades respecto al modelo base; el compromiso entre olvido y retención es significativo.
- Riesgo de alucinación: no cuantificado en la información disponible, pero presumiblemente elevado tras el proceso de desaprendizaje, que puede alterar la distribución de probabilidad del modelo.
- Sesgos conocidos: no documentados específicamente para este checkpoint; hereda los del modelo base Llama 3.1 8B Instruct.
- Limitaciones de idioma: la model card no especifica idiomas soportados; el proceso de desaprendizaje se realizó sobre TOFU, un dataset en inglés, por lo que el olvido podría no transferirse a otros idiomas.
- Restricciones de licencia: la Llama 3.1 Community License impone condiciones de uso comercial (límite de 700 millones de usuarios mensuales para licencia automática, obligación de atribución "Built with Llama", restricciones de uso aceptable). Es necesario revisar el archivo LICENSE del repositorio.
- El olvido se ha verificado contra forget10 original y dos paráfrasis, pero no se garantiza la eliminación completa del conocimiento en otras formulaciones no cubiertas por el dataset.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- No se publican cuantizaciones oficiales ni datos de latencia/throughput, lo que dificulta la planificación de despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-graddiff
- Modelo base (fine-tune x2-full): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (locuslab): https://github.com/locuslab/open-unlearning
- Modelo original Llama 3.1 8B Instruct (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
