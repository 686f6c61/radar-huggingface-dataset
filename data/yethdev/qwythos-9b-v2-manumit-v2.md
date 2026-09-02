# yethdev/qwythos-9b-v2-manumit-v2

## Resumen

Qwythos-9B-v2-manumit-v2 es un modelo de lenguaje derivado de Qwythos-9B-v2, desarrollado por el usuario yethdev, al que se le ha aplicado la técnica de ablación de rechazo denominada "manumit". El objetivo es eliminar el comportamiento de rechazo del modelo original, de modo que responda a peticiones que el modelo base rechazaría, manteniendo en lo posible sus capacidades generales. Según la model card, la técnica manumit identifica el subespacio de direcciones en el flujo residual que codifican el rechazo, lo proyecta fuera de los pesos y posteriormente "cura" el modelo con datos ordinarios para minimizar la pérdida de habilidad.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y está disponible en formato safetensors. Aunque los tags de HuggingFace indican una base tipo Qwen3.5, la arquitectura exacta no se especifica en la documentación proporcionada. El modelo es relevante para la investigación en seguridad y alineación de IA, así como para aplicaciones que requieren respuestas sin restricciones de contenido, siempre dentro del marco legal. Se distribuye bajo licencia MIT, aunque el modelo base conserva sus propios términos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (los tags sugieren base Qwen3.5, sin confirmar) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | MIT (el modelo base empero-ai/Qwythos-9B-v2 mantiene sus propios términos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwythos-9B-v2. Según los tags de HuggingFace, el modelo está relacionado con la familia Qwen3.5, lo que sugiere una arquitectura transformer densa, pero no se confirma. El proceso de entrenamiento de manumit-v2 consiste en una ablación selectiva: se localizan las direcciones del flujo residual que transportan la señal de rechazo, se proyectan fuera de los pesos y luego se realiza un ajuste fino de "curado" con datos ordinarios para recuperar la fluidez y capacidad del modelo. No se han publicado datos sobre el número de tokens, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de razonamiento, heredadas del modelo base Qwythos-9B-v2.
- Respuesta a peticiones que el modelo base rechazaría, gracias a la eliminación del comportamiento de rechazo.
- Mantiene un nivel de habilidad cercano al original: MMLU-Pro de 49,2% frente al 49,3% del base.
- No se documentan capacidades de tool calling, agentes, visión o audio en la model card. El tag "image-text-to-text" sugiere posible soporte multimodal, pero no se confirma en la documentación.

## Casos de uso

- Investigación en seguridad y alineación de IA: permite estudiar el comportamiento de rechazo y los efectos de la ablación en modelos de lenguaje, comparando respuestas entre el modelo base y la versión manumit.
- Análisis de robustez frente a jailbreaks: al tener una tasa de rechazo casi nula, puede usarse para evaluar técnicas de mitigación de contenido dañino en entornos controlados.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativas que el modelo base podría rechazar por temáticas sensibles, siempre que se respete la legalidad.
- Asistencia conversacional general: puede emplearse como chatbot en aplicaciones donde se prefiera una respuesta directa sin filtros de seguridad, por ejemplo en entornos de investigación o desarrollo.
- Generación de código y resolución de problemas técnicos: al conservar las capacidades de razonamiento del base, puede utilizarse para tareas de programación asistida.
- Evaluación de modelos abliterated: sirve como referencia para comparar el impacto de diferentes técnicas de eliminación de rechazo en modelos de tamaño similar.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados, medidos por el autor:

| Benchmark | Este modelo | Modelo base |
|---|---|---|
| AdvBench refusal | 0,0% | alto |
| JailbreakBench refusal | 4,2% | alto |
| MMLU-Pro (n=500) | 49,2% | 49,3% |

No se han publicado otros benchmarks (como HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación.
- Con 9,4 mil millones de parámetros, el modelo en precisión fp16 ocupa aproximadamente 18,8 GB (coincide con el tamaño del repositorio), por lo que se necesitaría una GPU con al menos 20 GB de VRAM para inferencia sin cuantización.
- Con cuantización a 4 bits, el modelo podría caber en GPUs de consumo con 8-12 GB de VRAM, como una RTX 3080 o RTX 4070, aunque no hay datos oficiales.
- Opciones de despliegue: al ser un modelo de transformers, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se mencionan configuraciones específicas.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

La comparación más directa es con el modelo base Qwythos-9B-v2, del que deriva:

| Modelo | Parámetros | Contexto | MMLU-Pro | Refusal (AdvBench) | Licencia |
|---|---|---|---|---|---|
| Qwythos-9B-v2 (base) | 9,4B | No disponible | 49,3% | alto | Términos propios |
| Qwythos-9B-v2-manumit-v2 | 9,4B | No disponible | 49,2% | 0,0% | MIT |

No se dispone de datos de otros modelos abliterated comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no tiene capa de seguridad ni modelo guardián: la model card indica explícitamente que "no hay capa de seguridad" y que el usuario es responsable de las salidas generadas.
- Riesgo de alucinación: al ser un modelo de 9B, puede generar información falsa o inventada, especialmente en dominios especializados.
- Sesgos: no se documentan sesgos específicos, pero al derivar de un modelo base entrenado con datos web, es probable que herede sesgos sociales y culturales.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto, por lo que no se puede garantizar un rendimiento óptimo en conversaciones muy largas.
- Restricciones de licencia: aunque el modelo se distribuye bajo MIT, el modelo base empero-ai/Qwythos-9B-v2 mantiene sus propios términos, que deben respetarse al usar este derivado.
- Uso responsable: al eliminar los rechazos, el modelo puede generar contenido dañino, ilegal o no ético si se le solicita. No debe utilizarse para actividades que violen la ley o los derechos de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yethdev/qwythos-9b-v2-manumit-v2
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-v2
- Blog de Empero sobre Qwythos-9B-v2: https://empero.org/writing/qwythos-9b-v2
- Página de Empero: https://empero.org/
- Endpoint API en FriendliAI: https://friendli.ai/models/yethdev/qwythos-9b-v2-manumit-v2
