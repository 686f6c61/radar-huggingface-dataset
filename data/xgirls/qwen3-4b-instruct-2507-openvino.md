# xgirls/Qwen3-4B-Instruct-2507-openvino

## Resumen

`xgirls/Qwen3-4B-Instruct-2507-openvino` es una conversión a formato OpenVINO del modelo `Qwen/Qwen3-4B-Instruct-2507`, publicada por el usuario xgirls. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: el autor ha exportado los pesos originales de Qwen mediante `optimum-intel` para que puedan ejecutarse con el runtime de OpenVINO sobre hardware Intel (CPU, iGPU y NPU). El repositorio ocupa 4.0 GB y contiene pesos en safetensors junto con los artefactos IR de OpenVINO.

El modelo base es un transformer decoder-only denso de 4 mil millones de parámetros, perteneciente a la familia Qwen3 de Alibaba. La variante 2507 es una versión exclusivamente instruct, sin soporte de modo "thinking", orientada a respuestas directas. Según la ficha del modelo en Qualcomm AI Hub, destaca en comprensión y generación de lenguaje, código y matemáticas, con soporte multilingüe.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo de 4B en entornos Intel sin GPU dedicada; por otro, sirve como ejemplo de flujo de exportación OpenVINO reproducible. No obstante, se trata de una conversión comunitaria con 0 descargas y 0 likes en el momento de redactar esta ficha, y no incluye resultados de benchmarks propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parámetros totales | 4 mil millones (4B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (exportación OpenVINO; el repositorio no detalla variantes INT8/INT4) |
| Idiomas soportados | Multilingüe según la ficha del modelo base; la metadata de este repositorio no lista idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y OpenVINO IR (XML/BIN) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 4B parámetros de la familia Qwen3, en su variante `Instruct-2507`. Según la documentación de Qualcomm AI Hub, esta versión se ha entrenado únicamente para instrucciones y no incorpora el modo de razonamiento extendido ("thinking") que sí está presente en otras variantes de Qwen3. Esa decisión reduce la latencia y simplifica el despliegue en entornos de producción donde se prioriza la respuesta directa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card de este repositorio es mínima: solo documenta el proceso de conversión a OpenVINO mediante `optimum-intel` y el espacio de exportación de Hugging Face, sin aportar detalles adicionales de arquitectura o entrenamiento. La innovación técnica del artefacto es, por tanto, el propio pipeline de exportación: permite cargar el modelo con `OVModelForCausalLM.from_pretrained()` y aprovechar las optimizaciones de OpenVINO para inferencia en CPU, iGPU y NPU Intel.

## Capacidades

- Generación de texto e instrucciones en varios idiomas, según la ficha del modelo base.
- Razonamiento, comprensión lectora y respuesta a preguntas.
- Generación de código y resolución de problemas de programación.
- Razonamiento matemático y resolución de problemas cuantitativos.
- Conversación multi-turno en formato instruct (sin modo thinking).
- Ejecución en hardware Intel mediante OpenVINO Runtime.
- No se ha documentado en la información disponible soporte explícito de tool calling, function calling ni flujos de agentes multi-paso.

## Casos de uso

- Asistente conversacional en local para equipos con hardware Intel: al estar exportado a OpenVINO, puede desplegarse en CPUs Xeon, iGPU Intel o NPU sin necesidad de GPU dedicada, manteniendo los datos en la infraestructura propia.
- Generación de código en el IDE: el modelo de 4B ofrece un equilibrio entre calidad y requisitos de recursos, y puede integrarse en extensiones de autocompletado o revisión de código que se ejecuten en un portátil con CPU Intel moderna.
- Resumen y extracción de información de documentos: su naturaleza instruct y su soporte multilingüe permiten usarlo en pipelines de procesamiento de texto por lotes sobre servidores Intel, con coste por token muy inferior al de modelos de mayor tamaño.
- Tutoría y apoyo educativo: la variante 2507 responde de forma directa sin cadenas de razonamiento largas, lo que resulta adecuado para aplicaciones interactivas de explicación de conceptos y resolución de ejercicios.
- Clasificación y etiquetado semántico en pipelines de datos: puede utilizarse para tareas de zero-shot o few-shot classification, análisis de sentimiento o enrutamiento de consultas dentro de un sistema mayor.
- Chatbot de atención al cliente on-premise: al ejecutarse con OpenVINO en hardware Intel, facilita despliegues con requisitos de privacidad y sin dependencia de APIs en la nube.
- Validación y prototipado de la familia Qwen3 en formato OpenVINO: sirve como referencia para equipos que quieran evaluar el rendimiento de un 4B antes de invertir en modelos mayores o en conversiones cuantizadas a INT4/INT8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 4.0 GB; en FP16 un modelo de 4B requiere aproximadamente 8-9 GB, mientras que en INT8 se sitúa en torno a 4-5 GB y en INT4 alrededor de 2.5-3 GB (estimaciones generales, no confirmadas por el autor).
- GPU recomendadas: al ser una exportación OpenVINO, el objetivo principal son CPU Intel (Xeon, Core), iGPU Intel y NPU Intel. También puede ejecutarse en GPU siempre que OpenVINO soporte el dispositivo.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), aunque el formato OpenVINO está optimizado para hardware Intel.
- Opciones de despliegue: OpenVINO Runtime a través de `optimum-intel` (`OVModelForCausalLM`) y OpenVINO GenAI. No se proporcionan pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión adicional no incluida en el repositorio. vLLM y TGI no cargan directamente el IR de OpenVINO.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| xgirls/Qwen3-4B-Instruct-2507-openvino | 4B | no disponible | safetensors + OpenVINO IR | Apache 2.0 | Conversión comunitaria a OpenVINO; 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible | safetensors (transformers) | Apache 2.0 | Modelo original de Alibaba; referencia para comparar calidad |
| Castellan-AI/Qwen3-4B-Instruct-2507-int4-cw-ov | 4B | no disponible | OpenVINO IR (INT4 channel-wise) | Apache 2.0 | Variante cuantizada a INT4 orientada a NPU Intel; menor huella de memoria |
| Qwen3-4B (variante con thinking) | 4B | no disponible | safetensors | Apache 2.0 | Incluye modo de razonamiento extendido; mayor latencia |

## Limitaciones y advertencias

- Ausencia de modo thinking: la variante 2507 está entrenada solo para instrucciones, por lo que no genera cadenas de razonamiento explícitas; esto puede reducir el rendimiento en tareas que se beneficien de razonamiento paso a paso.
- Sin datos de benchmarks: el autor no publica evaluaciones, por lo que la calidad debe validarse empíricamente antes de usarla en producción.
- Repositorio comunitario: 0 descargas y 0 likes en el momento de la consulta; no es una conversión oficial de Qwen ni de Intel, lo que implica menor soporte y mantenimiento.
- Formato específico: los pesos en OpenVINO IR limitan el despliegue a OpenVINO Runtime; para vLLM, TGI, llama.cpp u Ollama sería necesaria una conversión adicional.
- Idiomas no verificados: aunque el modelo base se describe como multilingüe, la metadata del repositorio no enumera los idiomas soportados ni su calidad relativa.
- Longitud de contexto no documentada: no se especifica en la información disponible, lo que impide planificar aplicaciones con ventanas largas sin una prueba previa.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; conviene aplicar validación, citas de fuentes o guardarraíles en producción.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base y las atribuciones correspondientes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xgirls/Qwen3-4B-Instruct-2507-openvino
- Modelo base original: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Repositorio optimum-intel: https://github.com/huggingface/optimum-intel
- Espacio de exportación OpenVINO: https://huggingface.co/spaces/echarlaix/openvino-export
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Modelo Qualcomm en GitHub: https://github.com/qualcomm/ai-hub-models/tree/main/src/qai_hub_models/models/qwen3_4b_instruct_2507
- Variante INT4 para NPU Intel (Castellan-AI): https://huggingface.co/Castellan-AI/Qwen3-4B-Instruct-2507-int4-cw-ov
