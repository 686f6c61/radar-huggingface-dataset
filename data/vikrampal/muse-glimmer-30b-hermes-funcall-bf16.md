# VikramPal/Muse-Glimmer-30B-hermes-funcall-bf16

## Resumen

Muse-Glimmer-30B-hermes-funcall-bf16 es un fine-tune del modelo Muse-Glimmer-30B de Meta, realizado por VikramPal, especializado en function calling y tool use. El modelo base es un transformer denso de 30.000 millones de parámetros con arquitectura vision-language (52 capas de texto, hidden size 6656, torre de visión ViT-G/14 de ~1.800 millones de parámetros), entrenado con 128K de contexto y licencia Apache 2.0. Este fine-tune concreto se ha ajustado con LoRA sobre el dataset NousResearch/hermes-function-calling-v1 para mejorar la capacidad de emitir llamadas a herramientas estructuradas.

La relevancia de este modelo radica en que combina un modelo base abierto y orientado a agentes locales (Muse Glimmer está diseñado para ejecutarse en una sola GPU de consumo) con un ajuste específico para function calling, lo que lo hace adecuado para integrar en pipelines de agentes, asistentes y automatización. El autor publica además una evaluación rigurosa con pruebas pareadas McNemar que cuantifica la ganancia del fine-tune (+27,33 puntos sobre el base) y el coste de la cuantización 4-bit (-6,10 puntos respecto a bf16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (transformer denso con torre de visión ViT-G/14) |
| Parametros totales | 29.776.626.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (entrenado) |
| Tipos de cuantizacion | bf16 nativo, DynQuant 4-bit (3,9999 bits), DynQuant 3-bit (2,9998 bits) |
| Idiomas soportados | en (fine-tune); el modelo base soporta 100+ lenguas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 16 shards) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer causal denso con 52 capas de texto, hidden size 6656 y embeddings no atados, complementado con un codificador de percepción ViT-G/14 de aproximadamente 1.800 millones de parámetros. Está destilado de Muse Spark y diseñado para tareas agénticas en hardware de consumo. El fine-tune de VikramPal aplica LoRA con r=32, alpha=64 (escala 2.0) sobre 416 módulos objetivo, inyectados y verificados contando los submódulos `lora_A.default`. El resultado se fusiona en bf16 con un error relativo máximo por módulo de 0,00389 frente a una tolerancia de 0,0078.

El entrenamiento se realizó sobre el dataset NousResearch/hermes-function-calling-v1 en formato nativo de un solo turno. La evaluación usa 600 elementos retenidos, de los cuales 344 llevan argumentos estructurados, con decodificación greedy y `max_new_tokens=2048`. El autor aplica pruebas pareadas McNemar exactas sobre los aciertos por elemento para comparar cada variante contra la referencia bf16.

## Capacidades

- Generación de texto y razonamiento multilingüe (el base soporta 100+ lenguas, aunque el fine-tune se centra en inglés).
- Function calling y tool use: emite llamadas a herramientas estructuradas con nombres, argumentos y llamadas paralelas.
- Comprensión de imágenes: al ser un modelo vision-language, puede procesar entradas de imagen y texto.
- Soporte para agentes autónomos: diseñado para tareas de larga duración y recuperación de fallos.
- Cuantización eficiente: versiones DynQuant 4-bit y 3-bit disponibles para despliegue en hardware limitado.

## Casos de uso

- Agentes autónomos locales: el modelo puede ejecutarse en una sola GPU de consumo y gestionar tareas de múltiples pasos, llamando a herramientas externas cuando es necesario, gracias a su contexto de 128K y su entrenamiento en function calling.
- Integración con APIs y servicios web: su capacidad de emitir llamadas estructuradas permite conectarlo a REST APIs, bases de datos o servicios externos dentro de un pipeline de agente.
- Asistentes de código con tool use: puede invocar funciones de un IDE, ejecutar comandos o consultar documentación, manteniendo el contexto de una sesión larga de programación.
- Automatización de flujos de trabajo empresariales: procesa documentos, extrae datos y dispara acciones en sistemas CRM o ERP mediante llamadas a herramientas.
- Chatbots con acceso a información en tiempo real: combina la generación de texto con búsqueda web o consultas a bases de conocimiento, usando function calling para obtener datos actualizados.
- Evaluación de cuantización en producción: el autor proporciona métricas detalladas de degradación por cuantización, lo que permite decidir si la versión 4-bit es aceptable para un caso de uso concreto.

## Benchmarks y rendimiento

La model card del autor incluye resultados sobre 600 elementos de hermes-function-calling-v1 en formato nativo de un solo turno. Las métricas son: exact % (coincidencia exacta de nombre, argumentos y valores), names % (solo nombres de herramienta), count % (nombres más número de llamadas), emitted % (produjo una llamada parseable) y all-600 % (acierto completo en los 600 elementos). La significancia se calcula con McNemar exacto.

| arm | bits | size | exact % | names % | count % | emitted % | all-600 % | vs bf16 | p |
|---|---|---|---|---|---|---|---|---|---|
| base, no fine-tune | 16.00 | 55.5 GiB | 33.43 | 47.97 | 48.55 | 98.55 | 20.50 | -27.33 | 2.4e-27 |
| base + prompt hint | 16.00 | 55.5 GiB | 59.01 | 77.62 | 78.20 | 98.26 | 36.00 | -1.74 | 0.33 |
| fine-tuned, no signal | 16.00 | 55.5 GiB | 60.47 | 81.40 | 81.69 | 98.26 | 37.00 | -0.29 | 1.00 |
| **fine-tuned bf16** | 16.00 | 55.5 GiB | **60.76** | 79.94 | 80.52 | 97.97 | 37.00 | -- | -- |
| **DynQuant 4-bit** | 3.9999 | **13.9 GiB** | **54.65** | 71.51 | 72.67 | 97.38 | 33.50 | **-6.10** | **0.00051** |
| DynQuant 3-bit | 2.9998 | 10.4 GiB | *no medido* | | | | | | |

El fine-tune aporta +27,33 puntos sobre el base. La versión 4-bit conserva +21,22 de esa ganancia (78%) con una compresión de 3,99x. La pérdida de 6,10 puntos frente a bf16 es estadísticamente significativa (28 elementos perdidos frente a 7 ganados). El autor advierte que estos resultados no demuestran que el asignador de bits de DynQuant sea superior a otros métodos, ya que no se exportaron los mapas de control barajados.

## Requisitos de hardware

- VRAM estimada: 55,5 GiB en bf16; 13,9 GiB en DynQuant 4-bit; 10,4 GiB en DynQuant 3-bit.
- GPU recomendadas: para bf16, una A100 80GB o H100; para 4-bit, una RTX 4090 (24GB) o similar con suficiente VRAM.
- Cabe en GPU de consumo: sí, la versión 4-bit cabe en una RTX 4090 o RTX 3090 (24GB).
- Opciones de despliegue: vLLM (compatible con el formato), Ollama (disponible como `muse-glimmer:30b`), llama.cpp para GGUF, y Transformers con carga en bf16.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Function calling | Vision |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (base) | 30B | 128K | Apache 2.0 | No entrenado específicamente | Sí |
| Muse-Glimmer-30B-hermes-funcall (este) | 30B | 128K | Apache 2.0 | Sí (fine-tune) | Sí |
| Muse-Glimmer-30B-hermes-funcall-DynQuant-4bit | 30B | 128K | Apache 2.0 | Sí (cuantizado) | Sí |

No se dispone de comparativas con otros modelos de function calling de tamaño similar (p. ej., Llama-3.1-70B o Qwen-2.5-72B) en la información proporcionada.

## Limitaciones y advertencias

- El fine-tune está orientado al inglés; aunque el base soporta 100+ lenguas, no se ha evaluado el rendimiento de function calling en otros idiomas.
- La cuantización 4-bit pierde 6,10 puntos de exactitud frente a bf16, con una diferencia estadísticamente significativa (28 elementos perdidos frente a 7 ganados). Para aplicaciones críticas, se recomienda validar con datos propios.
- El autor advierte explícitamente que los resultados de cuantización no demuestran la superioridad del método DynQuant sobre otros asignadores de bits; no hay un brazo de control con bytes equivalentes.
- Riesgo de alucinación inherente a los modelos generativos; en tareas de function calling, una llamada malformada puede provocar fallos en el sistema integrado.
- El contexto de 128K es el entrenado, pero el rendimiento efectivo en ventanas muy largas no se ha evaluado en este fine-tune.
- Licencia Apache 2.0 permite uso comercial, pero se debe revisar el fichero `USAGE_POLICY.md` del repositorio para condiciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/VikramPal/Muse-Glimmer-30B-hermes-funcall-bf16
- Versión cuantizada 4-bit: https://huggingface.co/VikramPal/Muse-Glimmer-30B-hermes-funcall-DynQuant-4bit
- Página oficial de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Receta vLLM para Muse-Glimmer-30B: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- Modelo en Ollama: https://ollama.com/library/muse-glimmer:30b
