# yeasah/Ornith-1.5-9B-exl3

## Resumen

Ornith-1.5-9B-exl3 es una cuantización EXL3 del modelo base ornith-ai/Ornith-1.5-9B, publicada por el usuario yeasah. No se trata de un modelo entrenado desde cero, sino de un conjunto de pesos comprimidos en formato EXL3 (ExLlamaV3) que permiten ejecutar un transformer de aproximadamente 9.000 millones de parámetros en hardware con recursos limitados de VRAM. El repositorio ofrece seis revisiones independientes con distintos regímenes de bits por peso (3,00, 3,50, 4,00, 5,00 y 6,00 BPW), cada una con su propio equilibrio entre tamaño en disco, consumo de VRAM y degradación de calidad medida.

La relevancia de esta ficha reside en el método de cuantización empleado: a diferencia de las cuantizaciones uniformes, los bits se asignan por tensor según la sensibilidad medida del modelo en sus propias respuestas, y el redondeo se realiza con LDLQ de dos lados con un factor de Fisher del lado de la salida (tras YAQA). La calibración se hizo sobre datos representativos de trabajo agéntico y de código (documentos, salidas de herramientas, diffs y respuestas del propio modelo), no sobre texto web genérico. El resultado es una familia de checkpoints que, según el autor, supera a la cuantización GGUF de referencia (bartowski/Ornith-1.5-9B-GGUF) en las mismas tasas de bits.

El modelo está pensado para despliegue en producción con exllamav3 o vLLM mediante el plugin vllm-exl3-plugin, e incluye un `generation_config.json` con los parámetros de muestreo recomendados por el modelo base. El tamaño total del repositorio es de 40,9 GB, aunque el consumo real de VRAM por revisión es muy inferior (entre 3,51 y 6,16 GiB en vLLM). La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base ornith-ai/Ornith-1.5-9B); detalles internos no disponibles |
| Parametros totales | ~9.000 millones (por el nombre del modelo base; no confirmado en la informacion disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 en 3,00, 3,50, 4,00, 5,00 y 6,00 BPW (revisiones separadas); embedding de tokens tambien cuantizado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | EXL3 (requiere exllamav3 1.6.4 o superior; compatible con vLLM via vllm-exl3-plugin) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base ornith-ai/Ornith-1.5-9B, del que no se proporcionan detalles estructurales en la informacion disponible (tipo de atención, número de capas, composición del dataset de entrenamiento, uso de RLHF/DPO, etc.). Lo que sí se documenta con precisión es el proceso de cuantización. Los bits se asignan por tensor a partir de la sensibilidad medida del modelo en sus propias respuestas, manteniendo el mismo tamaño total que una asignación uniforme de bits. El redondeo emplea LDLQ de dos lados con un factor de Fisher del lado de la salida, aplicado tras YAQA; este procedimiento afecta únicamente a cómo se redondean los valores, no al tamaño ni al formato del checkpoint.

La calibración se realizó sobre una mezcla amplia de lo que los modelos leen y escriben durante el trabajo: documentos y salidas de herramientas dentro de conversaciones, código y diffs, y las propias respuestas del modelo. La evaluación se orientó a casos de uso agéntico y de programación como escenario principal. El autor reporta métricas de exceso de KLD y delta de perplejidad para cada tasa de bits, así como comparaciones frente a la cuantización GGUF de bartowski. Adicionalmente, el repositorio añade un `generation_config.json` con los valores de muestreo recomendados por la model card del base (temperature=1.0, top_p=0.95, top_k=20, min_p=0.0, presence_penalty=1.5, repetition_penalty=1.0), que el repositorio original no incluía.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation, con soporte para conversaciones multi-turno mediante la plantilla de chat del modelo base.
- Trabajo agéntico: la calibración y evaluación se centraron en sesiones agénticas reales (Open-SWE-Traces) y bucles de uso de herramientas, lo que sugiere buen comportamiento en tareas de varios pasos.
- Generación y edición de código: los datos de calibración incluyen código y diffs, y las evaluaciones cubren escenarios de programación.
- Procesamiento de documentos: evaluación específica de documentos presentados en turnos de usuario y como resultados de herramientas.
- Uso de herramientas (tool calling): incluido explícitamente en el conjunto de evaluaciones (tool-use loops, documentos como salida de herramientas).
- Capacidades multilingües: se evalúa una porción de documentos multilingües, aunque no se detallan los idiomas cubiertos.
- Modo de razonamiento o thinking: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible; el pipeline es exclusivamente de texto.

## Casos de uso

- Asistente de programación en IDE: el modelo puede generar y revisar código y diffs dentro de conversaciones largas, apoyándose en la calibración específica sobre código y en el soporte de tool calling para consultar repositorios o ejecutar pruebas.
- Agente autónomo de resolución de incidencias: las evaluaciones sobre Open-SWE-Traces indican que el modelo está ajustado para sesiones agénticas reales con múltiples pasos, bucles de herramientas y documentos intermedios, adecuado para pipelines de ingeniería de software automatizada.
- Procesamiento de documentos como resultados de herramientas: puede resumir, extraer y razonar sobre documentos devueltos por APIs o herramientas, un escenario medido explícitamente en la evaluación del cuantizador.
- Atención al cliente con contexto documental: la plantilla de chat del base y la calibración sobre conversaciones permiten gestionar diálogos multi-turno con documentos adjuntos; el consumo de VRAM contenido (desde 3,51 GiB en 3,00 BPW) facilita el despliegue en instancias modestas.
- Despliegue en hardware de gama de consumo: las revisiones de 3,00 y 3,50 BPW caben en GPUs con 8-12 GB de VRAM, lo que permite prototipado local de agentes y asistentes sin infraestructura de datacenter.
- Servicio de generación de texto en producción con vLLM: el plugin vllm-exl3-plugin y el `generation_config.json` incluido permiten servir el modelo con parámetros de muestreo documentados y sin configuración adicional en servidores que respetan ese fichero (vLLM, TabbyAPI).
- Evaluación comparativa de cuantizaciones: investigadores que necesiten medir el impacto de la compresión EXL3 frente a GGUF disponen de métricas publicadas (KLD, perplejidad) y de seis puntos de operación para reproducir el análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización respecto al modelo sin cuantizar:

| BPW | Tamano en disco | VRAM (vLLM) | Exceso de KLD | Delta de perplejidad |
|---|---|---|---|---|
| 3,00 | 4,47 GiB | 3,51 GiB | 0,0470 | +5,23% |
| 3,50 | 4,87 GiB | 3,91 GiB | 0,0278 | +2,95% |
| 4,00 | 5,39 GiB | 4,43 GiB | 0,0163 | +1,80% |
| 5,00 | 6,32 GiB | 5,35 GiB | 0,0053 | +0,51% |
| 6,00 | 7,12 GiB | 6,16 GiB | 0,0018 | +0,11% |
| Base (sin cuantizar) | 17,98 GiB | no disponible | 0 (referencia) | 0 (referencia) |

Comparación frente a otras cuantizaciones del mismo modelo (bartowski/Ornith-1.5-9B-GGUF), con ratios de KLD donde valores inferiores a 1,00 son mejores:

| BPW | Compuesto vs mejor otra cuantizacion | Peor porcion de evaluacion | Porcion |
|---|---|---|---|
| 3,00 | 0,28 | 0,30 | documentos como resultados de herramientas |
| 3,50 | 0,26 | 0,27 | sesiones agénticas reales (Open-SWE-Traces) |
| 4,00 | 0,23 | 0,24 | documentos como resultados de herramientas |
| 5,00 | 0,24 | 0,25 | sesiones agénticas reales (Open-SWE-Traces) |
| 6,00 | 0,20 | 0,21 | sesiones agénticas reales (Open-SWE-Traces) |

## Requisitos de hardware

- VRAM estimada para inferencia (vLLM): 3,51 GiB (3,00 BPW), 3,91 GiB (3,50 BPW), 4,43 GiB (4,00 BPW), 5,35 GiB (5,00 BPW) y 6,16 GiB (6,00 BPW). El tamaño en disco es superior (4,47 a 7,12 GiB) porque incluye tensores que pueden descargarse u omitirse en ejecución.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por consumo de VRAM, las revisiones de 3,00 y 3,50 BPW son compatibles con GPUs de consumo de 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070); las de 4,00 y 5,00 BPW encajan en GPUs de 8-12 GB (RTX 4070, RTX 3080); la de 6,00 BPW requiere al menos 8 GB y deja poco margen para el contexto en GPUs de 8 GB, por lo que es más segura en 12-16 GB (RTX 4070 Ti, RTX 4080) o en GPUs de datacenter (A100, H100) si se necesita contexto largo.
- Cabe en GPU de consumo: sí, al menos las revisiones de 3,00 a 5,00 BPW; la de 6,00 BPW también, aunque con menor margen para la caché KV.
- Opciones de despliegue: exllamav3 (versión 1.6.4 o superior, necesaria por la cuantización del embedding de tokens) y vLLM mediante vllm-exl3-plugin. TabbyAPI se menciona como servidor que respeta el `generation_config.json`. No se indica compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| yeasah/Ornith-1.5-9B-exl3 | ~9B (base) | no disponible | EXL3 (3-6 BPW) | MIT | Cuantización calibrada para trabajo agéntico y de código; métricas de KLD publicadas |
| bartowski/Ornith-1.5-9B-GGUF | ~9B (base) | no disponible | GGUF | MIT (heredada) | Cuantización alternativa del mismo base; usada como referencia comparativa por el autor, que reporta ratios de KLD de 0,20-0,28 a favor de EXL3 |
| ornith-ai/Ornith-1.5-9B | ~9B | no disponible | safetensors | MIT | Modelo base sin cuantizar; 17,98 GiB en disco; referencia de calidad |

No se dispone de datos sobre otros modelos de 9B comparables (por ejemplo, de otras familias) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al heredar el comportamiento del modelo base, arrastra los sesgos de sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinación: no cuantificado; las métricas publicadas miden fidelidad respecto al modelo sin cuantizar, no veracidad. Las revisiones de menor BPW (3,00 y 3,50) introducen un delta de perplejidad de +5,23% y +2,95% respectivamente, lo que puede amplificar errores en tareas sensibles.
- Limitaciones de contexto e idioma: la longitud de contexto del modelo base no se indica y los idiomas soportados no están disponibles; la evaluación multilingüe se limita a una porción de documentos y no especifica qué lenguas cubre.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantía. Conviene conservar el aviso de copyright original del modelo base.
- Dependencia de herramientas específicas: requiere exllamav3 1.6.4 o superior (por el embedding cuantizado) o vLLM con vllm-exl3-plugin; no es utilizable con llama.cpp u Ollama en el formato publicado.
- El `generation_config.json` añadido solo surte efecto en servidores que lo respetan (vLLM, TabbyAPI); otros clientes deberán enviar los parámetros de muestreo manualmente para reproducir el comportamiento documentado.
- Las comparaciones frente a GGUF proceden del propio autor de la cuantización; no se han verificado de forma independiente en la información disponible.
- El repositorio tiene un uso muy bajo (36 descargas, 1 like en el momento de la consulta), por lo que la validación comunitaria es escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yeasah/Ornith-1.5-9B-exl3
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Commit del modelo base usado: https://huggingface.co/ornith-ai/Ornith-1.5-9B/tree/489cb97981b8654bcfcf30ce1f94ed1b62e07b53
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Plugin EXL3 para vLLM: https://github.com/yeasah/vllm-exl3-plugin
- Cuantización GGUF de referencia: https://huggingface.co/bartowski/Ornith-1.5-9B-GGUF
- Revisión 3,00 BPW: https://huggingface.co/yeasah/Ornith-1.5-9B-exl3/tree/3.00bpw-H5
- Revisión 3,50 BPW: https://huggingface.co/yeasah/Ornith-1.5-9B-exl3/tree/3.50bpw-H5
- Revisión 4,00 BPW: https://huggingface.co/yeasah/Ornith-1.5-9B-exl3/tree/4.00bpw
- Revisión 5,00 BPW: https://huggingface.co/yeasah/Ornith-1.5-9B-exl3/tree/5.00bpw
- Revisión 6,00 BPW: https://huggingface.co/yeasah/Ornith-1.5-9B-exl3/tree/6.00bpw
