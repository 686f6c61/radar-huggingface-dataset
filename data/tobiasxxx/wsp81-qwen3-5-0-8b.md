# tobiasxxx/wsp81-qwen3.5-0.8b

## Resumen

`tobiasxxx/wsp81-qwen3.5-0.8b` es una reconstrucción del checkpoint ganador de la competición WeightSpaceProgramming PR #81 (submission `0009554110-0010`, UID 56) en la subred Axonry 99. No es un modelo entrenado desde cero, sino una edición puramente de pesos sobre `Qwen/Qwen3.5-0.8B`: se modifican 96 de los 488 tensores del modelo base (todos en BF16) sin añadir parámetros, sin detectores en tiempo de inferencia y sin llamadas a herramientas. El objetivo declarado es el control de la longitud de razonamiento en modelos pequeños.

El modelo conserva la arquitectura y el pipeline del Qwen3.5-0.8B original (transformer multimodal con pipeline `image-text-to-text`), con 873.438.784 parámetros totales. La edición actúa en dos fases: primero suprime el cierre prematuro del razonamiento mediante un delta de pesos derivado de RLOO con coeficiente negativo aplicado solo a tokens de alta entropía; después inserta hasta cuatro neuronas MLP de baja utilización que funcionan como conmutadores condicionales (`Wrap-up` / `BF` / `BX`) para forzar la emisión del token de fin de pensamiento y el inicio de la respuesta en caja cuando el razonamiento ya es tardío.

Su relevancia es doble: por un lado, demuestra que es posible modular el comportamiento de razonamiento de un modelo de menos de 1.000 millones de parámetros con una intervención quirúrgica sobre los pesos; por otro, publica un conjunto detallado de evaluaciones (GSM8K, MMLU-Pro, GPQA Diamond, IFBench, AIME 2026, HMMT, LEXam) con protocolos y caveats explícitos, algo poco habitual en checkpoints comunitarios. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-0.8B), pipeline `image-text-to-text` |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (las evaluaciones usan hasta 32.768 y 65.500 tokens de generacion) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` en el commit `2fc06364715b967f1860aea9cf38778875588b17` y aplica una edición de pesos sobre el commit `74f2fe90a1600a32c6beaa435b0a41ac7067566a`. No hay reentrenamiento: los 96 tensores modificados se verifican contra la cadena de edición publicada, y el digest de competición `fc928358e0f512ccd0aa996092da8566cf7ecbac34247511eb37f11ddc856b92` se calcula sobre la lista declarada de tensores editados, no sobre el fichero completo. El SHA-256 del fichero reconstruido es `d8d4736de602603cc52d448a84b9716899bdf3d031706bb1416f0b841a4f7af2`.

La innovación técnica es el control de longitud de razonamiento en dos etapas. En la primera, se puntúan cuatro muestras por problema matemático con RLOO y se calcula un delta de pesos de gradiente de política ajustado únicamente sobre tokens de alta entropía; ese delta se aplica con coeficiente negativo para que el modelo siga comprobando en lugar de cerrar el razonamiento antes de tiempo. En la segunda, hasta cuatro neuronas MLP de baja utilización se sustituyen por unidades condicionalmente activadas (`Wrap-up`, `BF`, `BX`) que, cuando el razonamiento ya es tardío (especialmente tras un salto de línea), elevan la probabilidad de emitir el token de fin de pensamiento y comenzar la respuesta en caja. No se añaden parámetros ni se introduce ningún detector en tiempo de inferencia.

## Capacidades

- Generación de texto y razonamiento multi-step con modo thinking explícito (`enable_thinking`).
- Razonamiento matemático: resolución de problemas GSM8K, AIME y HMMT con formato de respuesta en caja.
- Procesamiento de imagen y texto (`image-text-to-text`), heredado del Qwen3.5-0.8B base.
- Seguimiento de instrucciones con restricciones (evaluado en IFBench).
- Generación estructurada de JSON/YAML sin restricciones de gramática (evaluado en IFStruct v1.0).
- Decisiones tipadas con probabilidades de etiqueta nativas (evaluado en Typed Decisions).
- Conocimiento académico de opción múltiple (MMLU-Pro, GPQA Diamond, LEXam).
- No soporta tool calling ni function calling: la model card indica explícitamente "no tool calls".
- No incorpora agentes ni orquestación multi-step más allá del razonamiento interno.
- Capacidades multilingües: no disponible.

## Casos de uso

- Razonamiento matemático controlado en producción: el modelo puede resolver problemas tipo GSM8K sin agotar el presupuesto de tokens, ya que la edición elimina el fallo del modelo base de consumir todo el contexto en modo thinking (media de 6.120 tokens por respuesta en la evaluación). Adecuado para pipelines de verificación matemática donde el coste por consulta importa.
- Generación de respuestas con formato en caja para sistemas de corrección automática: la unidad `Wrap-up` fuerza el cierre del razonamiento y el inicio de la respuesta en caja, lo que facilita el parseo determinista en evaluadores y pipelines de grading.
- Evaluación comparativa de técnicas de edición de pesos: sirve como referencia reproducible para investigadores que estudian WeightSpaceProgramming, ya que publica digests, SHA-256 y comparación tensor a tensor.
- Clasificación con probabilidades calibradas: la evaluación Typed Decisions (400 casos, 2.000 decisiones) mide accuracy, KL, Brier y ECE, lo que permite usar el modelo en tareas de decisión con etiquetas donde se requiera una distribución de probabilidad, no solo una etiqueta.
- Asistente de razonamiento en hardware de consumo: con 873 millones de parámetros en BF16, el checkpoint cabe en GPUs consumer de gama alta, lo que permite desplegar un modelo de razonamiento con control de longitud en estaciones de trabajo sin clúster.
- Generación estructurada de JSON/YAML en pipelines de extracción: la evaluación IFStruct v1.0 (2.000 casos, T=0, 16.000 tokens) indica que el modelo puede producir salidas estructuradas sin gramática forzada, útil en tareas de extracción de datos donde no se quiere imponer un esquema rígido.
- Investigación sobre sesgo de posición en opción múltiple: la evaluación GPQA Diamond sirve las opciones en el orden del CSV sin permutar, lo que permite estudiar el sesgo de posición del modelo en tareas de cuatro opciones.

## Benchmarks y rendimiento

Resultados medidos el 2026-11-22 con el checkpoint reconstruido en BF16. Los benchmarks generativos se ejecutaron en 8× RTX 5090 con vLLM 0.33.0 (8-way data parallel, contexto de servidor de 73.728 tokens); Typed Decisions usa un servicio SystemOne dedicado en una sola GPU. Valores en porcentaje salvo indicación.

| Benchmark | Score | Tareas / muestras | Protocolo |
|---|---:|---|---|
| GSM8K | 84,034622 | 1.319 × 4 = 5.276 | 0-shot, prompt oficial HF Inspect y scorer `model_graded_fact` (juez = modelo evaluado), thinking on, T=0,6, top_p=0,95, top_k=20, presence 1,5, 32.768 tokens, `pass_at_1` sobre 4 épocas |
| MMLU-Pro | 47,007979 | 12.032 × 1 | Test split completo, zero-shot, Inspect `multiple_choice` + `choice` |
| GPQA Diamond | 34,722222 | 198 × 4 = 792 | Config `gpqa_diamond`, prompt Inspect, `pass_at_1` sobre 4 muestras (275/792), sin truncamiento ni errores |
| IFBench | 35,000000 | 300 × 1 | 300 prompts held-out oficiales, `prompt_level_loose` sobre la respuesta final, thinking on, T=0 |
| IFStruct v1.0 | 16,850000 | 2.000 × 1 | Cliente nativo del autor, JSON/YAML sin restricciones, T=0, 16.000 tokens, sin thinking |
| Typed Decisions | accuracy 0,414000 · KL 1,22394048 nats · Brier 0,46348944 · ECE 0,33047390 | 400 casos / 2.000 decisiones | Probabilidades de etiqueta nativas, cuatro métricas separadas |
| AIME 2026 | 4,791667 | 30 × 16 = 480 | Prompt y grading de MathArena, muestreo Qwen3.5-0.8B (T=1,0, top_p=0,95, top_k=20, presence 1,5, 65.500 tokens), thinking explícito, avg@16 |
| HMMT February 2026 | 5,113636 | 33 × 16 = 528 | Igual que AIME 2026 |
| LEXam (cuatro opciones) | 32,809668 | 1.655 × 1 | `mcq_4_choices/test`, opciones decodificadas del fuente serializado, scorer `choice` de Inspect, thinking on, T=0,6 |

Control pareado thinking / non-thinking (mismas preguntas, mismas semillas, mismos parámetros de muestreo y mismo grader; la única variable es `enable_thinking`):

| Benchmark | Thinking | Default (non-thinking) | Delta |
|---|---:|---:|---:|
| AIME 2026 | 4,791667 % | 0,416667 % (2/480) | −4,375 pp |
| HMMT Feb 2026 | 5,113636 % | 0,946970 % (5/528) | −4,167 pp |

Caveats declarados por el autor: GSM8K es auto-juzgado (con denominador estricto que cuenta los 218 veredictos no puntuables como erróneos daría 80,67 %, es decir, 4.256/5.276); en esta ejecución no hubo truncamiento en GSM8K (todas las 5.276 generaciones terminaron normalmente, longitud media 6.120 tokens), relevante porque el modelo base sin editar agota frecuentemente el presupuesto en modo thinking; GPQA Diamond sigue la definición de tarea del dataset (`epochs: 4`, `epoch_reducer: pass_at_1`) pero sirve las opciones en el orden del CSV sin permutar, por lo que no se controla el sesgo de posición; los resultados no están verificados por Hugging Face y son autoinformados como `community`.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,75 GB solo para pesos (873,4 M × 2 bytes), más overhead de activaciones y caché KV según contexto; en la práctica, entre 3 y 6 GB para contextos moderados.
- VRAM estimada en cuantizaciones de 8 bits o 4 bits: no disponible en la información proporcionada (no se publican ficheros GGUF ni cuantizados).
- GPU recomendadas: el autor ejecuta los benchmarks generativos en 8× RTX 5090 con vLLM 0.33.0 en 8-way data parallel y contexto de servidor de 73.728 tokens; para inferencia individual basta una RTX 4090, RTX 5090, A100 o H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4-6 GB de VRAM en BF16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, RTX 5090).
- Opciones de despliegue: transformers (librería declarada), vLLM 0.33.0 (usado en la evaluación). No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `tobiasxxx/wsp81-qwen3.5-0.8b` | 873.438.784 | no disponible | Apache-2.0 | Hugging Face (46 descargas, 1 like) | Edición de pesos sobre Qwen3.5-0.8B, sin tool calling |
| `Qwen/Qwen3.5-0.8B` (base) | ~0,8 B | no disponible | Apache-2.0 | Hugging Face | Modelo original; el autor indica que agota el presupuesto en thinking mode con frecuencia |
| Alternativas de ~1 B con razonamiento | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación cuantitativa con otros modelos de la misma categoría no está disponible: la model card solo publica resultados del checkpoint editado y del control thinking/non-thinking del mismo modelo, sin tabla comparativa frente a terceros.

## Limitaciones y advertencias

- Resultados autoinformados como `community` y no verificados por Hugging Face; deben tratarse como indicativos hasta su reproducción independiente.
- GSM8K se evalúa con auto-juicio (`model_graded_fact` sin juez fijado), lo que puede inflar la puntuación; el denominador estricto baja del 84,03 % al 80,67 %.
- GPQA Diamond no permuta las opciones (se sirven en el orden del CSV), por lo que el sesgo de posición no está controlado.
- El modelo no soporta tool calling ni function calling, lo que limita su uso en pipelines agénticos.
- El modo thinking degrada el rendimiento frente al modo por defecto en AIME 2026 y HMMT Feb 2026 (−4,375 pp y −4,167 pp respectivamente), un comportamiento contraintuitivo que conviene validar en el dominio de despliegue.
- Riesgo de alucinación: no se han publicado mediciones específicas de factualidad ni de calibración más allá de ECE 0,33047390 en Typed Decisions, valor que indica una calibración pobre.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se documenta cobertura multilingüe.
- Longitud de contexto nativa: no disponible; las evaluaciones usan ventanas de generación de hasta 65.500 tokens, pero no se especifica el máximo del modelo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se hereda del modelo base (`Qwen/Qwen3.5-0.8B`); conviene revisar los términos del base.
- El checkpoint se publica solo en BF16; no hay ficheros GGUF ni cuantizados oficiales, lo que complica el despliegue en hardware limitado.
- La edición modifica el comportamiento de razonamiento mediante neuronas MLP condicionales; no se documenta su robustez fuera de los dominios evaluados (matemáticas, opción múltiple, instrucciones).
- El repositorio tiene 46 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tobiasxxx/wsp81-qwen3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Pull request de la competición: https://github.com/AxOrganization/WeightSpaceProgramming/pull/81
- Resultados de evaluación en el repositorio: https://huggingface.co/tobiasxxx/wsp81-qwen3.5-0.8b/tree/main/.eval_results
