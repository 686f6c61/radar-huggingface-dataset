# Vihindi-K/PlurValLM-Llama-3.1-8B-ZH-ID-SI

## Resumen

PlurValLM-Llama-3.1-8B-ZH-ID-SI es un adaptador LoRA (PEFT) desarrollado por Vihindi-K para la tarea compartida PlurVA-LLM 2026, centrada en la alineación de valores pluralistas en tres idiomas: chino, indonesio y cingalés. Se basa en el modelo Llama-3.1-8B-Instruct de Meta y se ha ajustado mediante QLoRA con supervisión específica por idioma a partir de los conjuntos de datos de la tarea. El adaptador está diseñado para predecir respuestas alineadas con valores en tareas de opción múltiple y de preferencia binaria, y se distribuye como un repositorio de 0.2 GB que debe combinarse con el modelo base.

La relevancia de este modelo radica en su enfoque en la pluralidad de valores culturales, un área poco explorada en los LLM multilingües. Al ser un adaptador ligero, permite personalizar un modelo base potente sin necesidad de reentrenar todos los parámetros, lo que facilita su uso en entornos con recursos limitados. Su licencia llama3.1 y su integración con el ecosistema Hugging Face (transformers, peft) lo hacen accesible para investigadores y desarrolladores interesados en alineación de valores y multilingüismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama-3.1-8B-Instruct (transformer decoder) |
| Parametros totales | No disponible (el adaptador pesa 0.2 GB; el base tiene 8.03B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No especificada (QLoRA implica cuantizacion del base, pero no se detalla) |
| Idiomas soportados | Chino (zh), indonesio (id), cingales (si) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se acopla al modelo base Llama-3.1-8B-Instruct, una arquitectura transformer decoder con 8.03 mil millones de parámetros y una ventana de contexto de 128.000 tokens. El adaptador se entrenó mediante QLoRA, una técnica que cuantiza el modelo base para reducir el uso de memoria durante el ajuste fino, y se optimizó con supervisión específica por idioma a partir de los conjuntos de datos de la tarea compartida PlurVA-LLM 2026. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO; la información disponible solo indica que se empleó QLoRA con supervisión lingüística.

El adaptador está diseñado para tareas de alineación de valores: dado un valor, un escenario y opciones de respuesta, el modelo debe seleccionar la opción más alineada. Para cingalés, la tarea es binaria (sí/no). El prompt de inferencia debe seguir la estructura utilizada durante el entrenamiento, con un mensaje de sistema fijo y un formato específico para la pregunta y las opciones.

## Capacidades

- Alineación de valores pluralistas: predice respuestas alineadas con valores culturales en chino, indonesio y cingalés, tanto en formato de opción múltiple (A-D) como en juicios binarios (sí/no).
- Razonamiento de valores en contexto: procesa escenarios y preguntas que requieren considerar normas y valores culturales específicos de cada región.
- Multilingüismo: soporta tres idiomas con scripts diferentes (chino simplificado, alfabeto latino para indonesio, y escritura cingalesa).
- Generación de texto conversacional: al heredar las capacidades del modelo base, puede mantener diálogos multi-turno, aunque su uso principal es la tarea de alineación de valores.
- No se han documentado capacidades de tool calling, agentes, visión ni audio; el adaptador se centra exclusivamente en la tarea de alineación de valores.

## Casos de uso

- Evaluación de alineación de valores en sistemas de IA: el modelo puede utilizarse como un evaluador automático para comprobar si las respuestas de otros LLM se alinean con valores culturales específicos de China, Indonesia o Sri Lanka, generando juicios consistentes con el prompt de entrenamiento.
- Asistentes conversacionales culturalmente conscientes: integrado en un chatbot, el adaptador permite que el sistema adapte sus respuestas a normas y valores locales, mejorando la aceptación en comunidades con sensibilidades culturales distintas.
- Investigación en pluralismo de valores: los investigadores pueden emplear el modelo para analizar cómo varían las preferencias de valor entre idiomas y regiones, utilizando las respuestas generadas como datos para estudios sociolingüísticos.
- Filtrado de contenido sensible: en plataformas que operan en estos tres mercados, el adaptador puede ayudar a clasificar respuestas según su alineación con valores comunitarios, reduciendo el riesgo de contenido ofensivo o inapropiado.
- Generación de datos de entrenamiento: el modelo puede producir ejemplos etiquetados de alineación de valores para ampliar conjuntos de datos existentes, siempre que se valide la calidad de las salidas.
- Benchmarking de LLM multilingües: sirve como referencia para comparar el rendimiento de otros modelos en tareas de alineación de valores en idiomas de baja representación como el cingalés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El rendimiento del adaptador solo puede evaluarse en el contexto de la tarea compartida PlurVA-LLM 2026, cuyos resultados no se han hecho públicos en este repositorio.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, se requiere cargar el modelo base Llama-3.1-8B-Instruct. En FP16, el base ocupa aproximadamente 16 GB de VRAM; con cuantización (por ejemplo, 4 bits) puede reducirse a unos 6-8 GB. El adaptador añade un overhead mínimo (0.2 GB en disco).
- GPU recomendadas: para FP16, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L4). Con cuantización 4 bits, una GPU de 8-10 GB (RTX 3080, RTX 4070) puede ser suficiente.
- Compatibilidad con GPU de consumo: sí, si se usa cuantización (por ejemplo, bitsandbytes) y se limita la longitud de contexto. En FP16, solo GPUs de gama alta con 16 GB o más.
- Opciones de despliegue: el adaptador se carga con la librería `peft` de Hugging Face, por lo que puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no se han publicado datos específicos. Como referencia, el modelo base Llama-3.1-8B en una A100 suele generar entre 50 y 100 tokens por segundo en FP16, pero esto depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PlurValLM-Llama-3.1-8B-ZH-ID-SI (este) | 8B (base) + adaptador | 128k | zh, id, si | llama3.1 | PEFT LoRA |
| Llama-3.1-8B-Instruct (base) | 8.03B | 128k | Multilingue (8 idiomas) | llama3.1 | safetensors |
| Qwen2.5-7B-Instruct | 7.6B | 128k | Multilingue (29 idiomas) | Apache 2.0 | safetensors |

No se dispone de comparativas de rendimiento publicadas entre este adaptador y otros modelos. La comparación se limita a características técnicas generales. El adaptador se distingue por su especialización en alineación de valores para tres idiomas concretos, algo que los modelos generalistas no ofrecen de forma nativa.

## Limitaciones y advertencias

- Dependencia del modelo base: el adaptador requiere cargar Llama-3.1-8B-Instruct, que es un modelo con acceso restringido en Hugging Face; es necesario solicitar permiso y autenticarse.
- Sesgos culturales: el entrenamiento se basa en los datasets de la tarea PlurVA-LLM, que pueden no representar toda la diversidad de valores dentro de cada país (China, Indonesia, Sri Lanka). Las respuestas pueden reflejar sesgos de los datos de entrenamiento.
- Riesgo de alucinación: como cualquier LLM, puede generar respuestas plausibles pero incorrectas, especialmente en escenarios complejos o poco representados en el entrenamiento.
- Limitaciones de idioma: aunque soporta tres idiomas, el cingalés es un idioma de bajos recursos; el rendimiento en este idioma puede ser inferior al de chino o indonesio.
- Restricciones de licencia: la licencia llama3.1 permite uso comercial, pero impone restricciones (por ejemplo, no usar para mejorar otros modelos grandes sin autorización). Es necesario revisar los términos completos.
- Formato de prompt rígido: el modelo funciona mejor cuando se respeta exactamente la plantilla de prompt utilizada durante el entrenamiento; desviaciones pueden degradar el rendimiento.
- Sin garantías de producción: al ser un adaptador de investigación, no se han documentado pruebas de robustez, latencia ni seguridad para entornos de producción a gran escala.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Vihindi-K/PlurValLM-Llama-3.1-8B-ZH-ID-SI
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Página de la tarea compartida PlurVA-LLM 2026: https://plurvallm2026.github.io/shared-task.html
- Documentación de Llama 3.1 (Meta): https://github.com/meta-llama/llama-models
