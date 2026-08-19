# TeichAI/Qwen3.8-27B-Fable-Distill-LoRA

## Resumen

El modelo **TeichAI/Qwen3.8-27B-Fable-Distill-LoRA** es un adaptador LoRA de destilación desarrollado por TeichAI, una organización especializada en modelos destilados y datasets de razonamiento curados a partir de modelos de frontera como Claude, GPT o Gemini. Este adaptador se entrena sobre el modelo base **Qwen3.8-27B** de Alibaba, un modelo multimodal denso de 27 mil millones de parámetros con capacidades destacadas en generación de código, flujos de trabajo agénticos y automatización de oficina.

La finalidad del adaptador es transferir el conocimiento de un modelo propietario denominado "Fable 5" al modelo abierto Qwen3.8-27B, mediante un proceso de destilación con LoRA. El resultado es un adaptador ligero (1 GB) que se puede cargar sobre el modelo base para obtener capacidades de razonamiento mejoradas sin necesidad de reentrenar el modelo completo. El autor menciona que se entrenó con "datos personales" y dos datasets citados en el repositorio, aunque no se especifican en la información disponible.

Este lanzamiento es relevante porque permite a desarrolladores e investigadores mejorar un modelo abierto de 27B con conocimiento destilado de modelos más grandes, manteniendo la licencia Apache 2.0 y la compatibilidad con el ecosistema Transformers. La arquitectura del adaptador es un LoRA estándar, entrenado con las librerías Unsloth y TRL, lo que facilita su integración en pipelines existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Qwen3.8-27B (transformers) |
| Parametros totales | no disponible (el adaptador pesa 1 GB, los pesos del modelo base no están incluidos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.8-27B; no se especifica en el repo) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin versiones GGUF o cuantizadas publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) aplicado sobre el modelo base **Qwen3.8-27B**, que es un transformer denso multimodal (texto e imagen) de 27B parámetros desarrollado por el equipo Qwen de Alibaba. El LoRA introduce matrices de bajo rango en las capas de atención y feed-forward, permitiendo un ajuste eficiente con un número reducido de parámetros entrenables. El entrenamiento se realizó con las librerías **Unsloth** (optimización de fine-tuning) y **TRL** (Transformer Reinforcement Learning), lo que sugiere el uso de técnicas de RLHF o DPO, aunque no se detalla en la información disponible.

El proceso de destilación se llevó a cabo sobre un conjunto de datos que el autor describe como "datos personales" más dos datasets citados en el repositorio (no accesibles en la información proporcionada). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se utilizó alguna técnica de destilación específica más allá del fine-tuning supervisado. Tampoco se indican innovaciones técnicas particulares en el adaptador más allá del uso estándar de LoRA.

## Capacidades

- **Generación de texto y razonamiento**: al ser un adaptador de destilación sobre Qwen3.8-27B, hereda las capacidades de generación de texto y razonamiento del modelo base, con potencial mejora en tareas de razonamiento complejo gracias a la destilación de "Fable 5".
- **Multimodalidad**: el modelo base Qwen3.8-27B es multimodal (texto e imagen), por lo que el adaptador puede utilizarse sobre el base para tareas que involucren entrada visual, aunque no hay confirmación explícita de que el LoRA afecte a la rama visual.
- **Soporte de tool calling y agentes**: el modelo base está diseñado para flujos agénticos y automatización, por lo que el adaptador hereda estas capacidades. No se documenta si el LoRA introduce cambios específicos en esta área.
- **Capacidades multilingües**: la model card indica únicamente "en" como idioma soportado. No se mencionan otros idiomas.
- **Compatibilidad con TGI y endpoints**: el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`, lo que indica que el adaptador puede desplegarse en entornos compatibles con Hugging Face TGI.

## Casos de uso

- **Fine-tuning eficiente de Qwen3.8-27B para dominios específicos**: el adaptador LoRA permite ajustar el modelo base a tareas concretas sin necesidad de reentrenar los 27B parámetros. Por ejemplo, una empresa podría cargar el LoRA sobre Qwen3.8-27B para mejorar el razonamiento en tareas de análisis de documentos técnicos.
- **Generación de código asistida**: aprovechando las capacidades del modelo base en coding, el adaptador puede utilizarse en entornos de desarrollo integrado (IDE) para autocompletar código, generar funciones y documentar APIs, con la ventaja de un menor coste de inferencia frente a modelos más grandes.
- **Automatización de flujos de oficina**: el modelo base destaca en office automation, por lo que el adaptador puede integrarse en asistentes que generen informes, resuman correos electrónicos o redacten propuestas comerciales.
- **Prototipado rápido de agentes conversacionales**: gracias a la compatibilidad con TGI y el tamaño reducido del adaptador, es viable desplegar un asistente conversacional con tool calling en infraestructura modesta, por ejemplo en una instancia cloud con una GPU de 24 GB.
- **Investigación en destilación de modelos**: el adaptador sirve como caso de estudio para comparar la efectividad de destilar modelos propietarios en modelos abiertos de tamaño medio, especialmente en tareas de razonamiento matemático o lógico.
- **Evaluación comparativa de LoRA vs fine-tuning completo**: los desarrolladores pueden utilizar este adaptador como referencia para medir la degradación de rendimiento entre un ajuste LoRA y un fine-tuning completo del modelo base en sus propios datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este adaptador específico. Tampoco se comparan resultados con el modelo base Qwen3.8-27B ni con otros adaptadores de destilación.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un adaptador LoRA, se requiere cargar el modelo base Qwen3.8-27B. En FP16, el modelo base ocupa aproximadamente 54 GB de VRAM; en cuantización de 8 bits (~27 GB) o 4 bits (~14 GB) puede caber en GPUs de consumo. El adaptador en sí añade un overhead mínimo (1 GB en disco, pero en VRAM el incremento es despreciable).
- **GPU recomendadas**: para una inferencia fluida en FP16 se recomienda una NVIDIA A100 (80 GB) o H100. Con cuantización de 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ser suficiente. Para cuantización de 8 bits, se necesita al menos 32 GB de VRAM (por ejemplo, A6000 o V100 de 32 GB).
- **Compatibilidad con consumer GPUs**: sí, con cuantización de 4 bits y usando bibliotecas como llama.cpp o GPTQ, el modelo base puede ejecutarse en GPUs de consumo de 24 GB, aunque con limitaciones de velocidad.
- **Opciones de despliegue**: el adaptador es compatible con Hugging Face Transformers, Text Generation Inference (TGI) y vLLM (si se cargan los pesos del base y el adaptador). También puede utilizarse con Unsloth para inferencia optimizada. No se han publicado versiones GGUF del adaptador, por lo que el despliegue en llama.cpp requeriría fusionar el adaptador con el modelo base y exportar a GGUF manualmente.
- **Latencia y throughput**: no se dispone de datos medidos. Para el modelo base de 27B, se puede estimar una latencia de decodificación de aproximadamente 20-40 ms/token en una A100, pero estos valores dependen de la cuantización y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Notas |
|---|---|---|---|---|---|
| TeichAI/Qwen3.8-27B-Fable-Distill-LoRA | 27B (base) + adaptador | no disponible | Apache 2.0 | LoRA de destilación | Adaptador sobre Qwen3.8-27B, sin benchmarks publicados |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Apache 2.0 (según repo) | Modelo denso multimodal | Modelo base, capacidades de coding y agentes |
| Qwen/Qwen3.8-32B (hipotético) | 32B | no disponible | no disponible | Modelo denso | No se dispone de información fiable |

No se dispone de información suficiente sobre otros adaptadores de destilación de TeichAI o de terceros para realizar una comparativa detallada. La comparativa se limita al modelo base y a una hipótesis no confirmada.

## Limitaciones y advertencias

- **Dependencia del modelo base**: este adaptador no es un modelo autónomo; requiere descargar y cargar Qwen3.8-27B, lo que implica un consumo de VRAM significativo y la necesidad de gestionar dos componentes.
- **Datos de entrenamiento limitados**: el autor menciona "datos personales" y dos datasets no especificados. No hay garantía de calidad ni de cobertura de dominios diversos, lo que puede provocar sesgos o rendimiento inconsistente en tareas fuera del ámbito de entrenamiento.
- **Solo inglés**: la model card indica únicamente inglés como idioma soportado. No se recomienda su uso en otros idiomas sin evaluación previa.
- **Riesgo de alucinación**: al ser un modelo de lenguaje, puede generar contenido factualmente incorrecto. No se han realizado evaluaciones específicas de fiabilidad.
- **Licencia**: el adaptador se distribuye bajo Apache 2.0, pero el modelo base Qwen3.8-27B tiene su propia licencia (probablemente Apache 2.0 según el repositorio de GitHub, pero no se confirma en la información del adaptador). Es necesario verificar la licencia del modelo base antes de un uso comercial.
- **Sin benchmarks publicados**: no hay evidencia objetiva de que el adaptador mejore el rendimiento respecto al modelo base. Se recomienda realizar evaluaciones propias antes de desplegarlo en producción.
- **Fecha de creación futura**: el modelo fue creado el 15 de agosto de 2026, lo que puede indicar que la información disponible es preliminar o que el proyecto está en fase experimental.

## Enlaces

- [HuggingFace - TeichAI/Qwen3.8-27B-Fable-Distill-LoRA](https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill-LoRA)
- [HuggingFace - TeichAI/Qwen3.8-27B-Fable-Distill (modelo completo)](https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill)
- [GitHub - Qwen3.8-27B (AlibabaCloud-Official)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Sitio web de TeichAI](https://www.teichai.com/)
- [Aireleasetracker - Qwen3.8-27B](https://aireleasetracker.com/model/qwen/qwen3.8-27b)
