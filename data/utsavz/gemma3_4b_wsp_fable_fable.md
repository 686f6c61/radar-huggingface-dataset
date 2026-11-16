# utsavz/gemma3_4b_wsp_fable_fable

## Resumen

gemma3_4b_wsp_fable_fable es un artefacto de investigación derivado de google/gemma-3-4b-it, el modelo multimodal de 4.300 millones de parámetros de Google DeepMind. Lo publica el usuario utsavz en Hugging Face y no es un fine-tuning convencional: se ha generado mediante Weight-Space Patching (WSP) sin gradientes, una técnica que edita directamente los pesos del modelo base en dos etapas (dónde editar y cómo editar) para modificar su comportamiento en materia de seguridad multimodal, usando el conjunto de datos VLGuard como referencia.

El checkpoint corresponde a la ejecución E4, en la que ambas etapas de edición se realizaron con el sistema Fable 5.2 a esfuerzo medio, y se presenta como el modelo "complementario" de esa ejecución. Solo difieren 5.794.210 elementos de parámetro respecto al modelo base, una fracción mínima de los 4.300 millones totales, lo que refleja la naturaleza quirúrgica de la intervención.

Su relevancia es metodológica más que de producto: demuestra que es posible alterar la tasa de rechazo ante contenido dañino en un modelo multimodal editando menos del 0,14 % de sus pesos, sin reentrenamiento y manteniendo la arquitectura original intacta. Está pensado para investigadores que estudian alineamiento, seguridad y técnicas de edición de pesos, no para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), derivada de google/gemma-3-4b-it |
| Parámetros totales | 4.300.079.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Gemma 3 4B-it) |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | Gemma (términos de uso de Gemma) |
| Formato de pesos | safetensors (BF16) |
| Modelo base | google/gemma-3-4b-it (revisión 093f9f388b31de276ce2de164bdc2081324b9767) |
| Elementos de parámetro modificados | 5.794.210 |
| Tamaño del repositorio | 8,6 GB |
| Técnica de edición | Weight-Space Patching sin gradientes, dos etapas (Fable 5.2, esfuerzo medio) |
| Dataset de referencia | VLGuard |

## Arquitectura y entrenamiento

El modelo conserva íntegramente la arquitectura de Gemma 3 4B-it, un transformer multimodal capaz de procesar texto e imágenes, con 4.300 millones de parámetros en BF16. No hay reentrenamiento ni ajuste supervisado: el proceso es un Weight-Space Patching sin gradientes dividido en dos etapas. La primera etapa (Fable 5.2) determina qué regiones del espacio de pesos editar; la segunda (Fable 5.2) decide cómo modificarlas. Ambas se ejecutaron a esfuerzo medio en la ejecución E4.

La intervención afecta solo a 5.794.210 elementos de parámetro, es decir, aproximadamente el 0,135 % del total. El objetivo declarado es la seguridad multimodal guiada por VLGuard, un conjunto de datos de instrucciones con imágenes diseñado para evaluar y reforzar el rechazo de contenido dañino. El checkpoint publicado es el modelo complementario de la ejecución (complementary:comp_f_rev060_h1114), lo que sugiere que forma parte de un par de modelos generados en la misma configuración experimental. No se documentan datos de entrenamiento adicionales, número de tokens ni uso de RLHF o DPO, porque el método no los emplea.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Gemma 3 4B-it.
- Procesamiento multimodal de imagen y texto, al mantener la arquitectura Gemma 3.
- Respuesta a instrucciones en formato chat (variante -it del modelo base).
- Comportamiento de rechazo modulado: el parcheo busca reducir el cumplimiento de peticiones dañinas manteniendo baja la sobrerrechazo en peticiones benignas.
- Soporte de tool calling y function calling: no documentado específicamente en esta ficha; se heredaría, en su caso, del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Idiomas: no disponibles en la información proporcionada.
- Modo thinking, visión avanzada o audio: no documentados más allá de la naturaleza multimodal del base.

## Casos de uso

- Investigación en edición de pesos: servir como referencia reproducible de una intervención WSP de dos etapas sobre un modelo multimodal, comparando los 5,79 millones de elementos modificados con el checkpoint base.
- Estudio de alineamiento y seguridad multimodal: analizar cómo cambia la tasa de cumplimiento dañino (27/1000) y la sobrerrechazo benigna (36/558) respecto al modelo original sobre VLGuard.
- Evaluación de proxies de rechazo: utilizar el checkpoint para contrastar clasificadores por palabra clave o regex frente a evaluadores humanos o modelos jueces, dado que el autor advierte que la métrica es un proxy.
- Ablación de métodos de parcheo: comparar la ejecución E4 con otras configuraciones (distintos sistemas de edición o niveles de esfuerzo) para aislar el efecto de cada etapa.
- Docencia y divulgación: ilustrar en cursos de seguridad de IA cómo una fracción mínima de pesos puede alterar el comportamiento de rechazo sin reentrenar.
- Base para experimentos de seguridad en pipelines multimodales: probar el modelo como componente de un sistema que recibe imágenes y texto y debe filtrar contenido, siempre en entorno de laboratorio y no en producción.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la evaluación del autor sobre VLGuard test (1.558 registros, decodificación greedy, 512 tokens nuevos, proxy de rechazo por palabra clave/regex):

| Métrica | Resultado |
|---|---|
| Cumplimiento dañino | 27/1000 |
| Sobrerrechazo benigno | 36/558 |
| Fallos de generación | 0/1558 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con el modelo base u otros checkpoints.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 8,6 GB solo para pesos, más overhead de activaciones y del procesador multimodal; con contexto largo o imágenes se recomienda al menos 16-24 GB.
- GPU recomendadas: A100 (40/80 GB), H100 o L40S para inferencia cómoda en BF16; RTX 4090 (24 GB) puede alojar el modelo en BF16 con margen limitado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en BF16; en GPUs de 12-16 GB sería necesario cuantizar, aunque el autor no publica variantes cuantizadas.
- Opciones de despliegue: transformers con Gemma3ForConditionalGeneration y AutoProcessor (única vía documentada); vLLM, llama.cpp, Ollama o TGI no están verificados para este checkpoint en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| gemma3_4b_wsp_fable_fable | 4.300 M | no disponible | Gemma | Parcheo WSP para seguridad multimodal | Hugging Face (0 descargas) |
| google/gemma-3-4b-it | 4.300 M | no disponible | Gemma | Modelo base instructivo multimodal | Hugging Face (oficial) |
| Fine-tunes de seguridad de Gemma 3 4B | ~4.300 M | no disponible | Gemma | Ajuste supervisado o RLHF sobre VLGuard u otros | Variable |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción; el propio autor lo califica así.
- La métrica de rechazo se basa en un proxy por palabra clave o regex, no en evaluación humana ni por modelo juez, por lo que puede sobreestimar o subestimar el comportamiento real.
- Los resultados provienen de una sola ejecución por configuración, sin intervalos de confianza ni réplicas.
- Sesgos conocidos: no documentados específicamente; se heredan los del modelo base Gemma 3 4B-it.
- Riesgo de alucinación: no evaluado en la información disponible.
- Idiomas soportados: no disponibles; conviene verificar el comportamiento multilingüe antes de usarlo fuera del inglés.
- Restricciones de licencia: sujeto a los términos de uso de Gemma, que imponen condiciones específicas para uso comercial y redistribución.
- El parcheo de pesos puede degradar capacidades no evaluadas (razonamiento, código, visión) al no haberse medido el impacto fuera del conjunto VLGuard.
- Solo se modifican 5,79 millones de elementos; la robustez del cambio de comportamiento frente a prompts adversariales no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/utsavz/gemma3_4b_wsp_fable_fable
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- VLGuard (dataset de seguridad multimodal): no disponible enlace directo en la información proporcionada
- Paper o blog del método Weight-Space Patching: no disponible en la información proporcionada
- Repositorio de código del método: no disponible en la información proporcionada
