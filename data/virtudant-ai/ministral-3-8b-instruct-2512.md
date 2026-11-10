# Virtudant-AI/Ministral-3-8B-Instruct-2512

## Resumen

Ministral-3-8B-Instruct-2512 es un modelo de lenguaje de tipo instruct con capacidades de visión, desarrollado por Mistral AI y distribuido en el Hub por el usuario Virtudant-AI como un fine-tune del modelo base `mistralai/Ministral-3-8B-Instruct-2512`. Forma parte de la familia Ministral 3, disenada especificamente para despliegue en el borde (edge), es decir, en hardware con recursos limitados como estaciones de trabajo locales, dispositivos embebidos o GPUs de consumo. Su tamano contenido y su licencia Apache 2.0 lo convierten en una opcion atractiva para equipos que necesitan un modelo capaz de razonar, entender imagenes y ejecutar tareas agenticas sin depender de infraestructura en la nube.

El modelo combina un transformer de lenguaje de 8.4B parametros con un codificador visual de 0.4B, alcanzando un total aproximado de 8.8B parametros. Soporta una ventana de contexto de 256 000 tokens, lo que lo situa en un rango muy competitivo para su tamano, y esta entrenado para mantener una fuerte adherencia a system prompts, generar JSON de forma nativa y realizar function calling. Estas caracteristicas lo orientan a casos de uso agenticos y de automatizacion donde la latencia, el coste y la capacidad de ejecucion local son criticos.

La relevancia actual del modelo radica en su combinacion de licencia permisiva, contexto largo, multimodalidad y eficiencia: puede ejecutarse en FP8 con 12 GB de VRAM o menos si se cuantiza adicionalmente, lo que lo hace viable en GPUs de consumo como la RTX 4090 o incluso en soluciones integradas. El repositorio de Virtudant-AI se presenta como un fine-tune sobre el modelo oficial de Mistral, aunque no se detallan en la informacion disponible los datos especificos de dicho ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de lenguaje) + codificador visual |
| Parametros totales | 8.8B (8.4B LM + 0.4B vision encoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 000 tokens |
| Tipos de cuantizacion | FP8 (oficial), GGUF y 4-bit disponibles en la coleccion de Unsloth (segun model card) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato del Hub); GGUF y FP8 en la coleccion de Unsloth |

## Arquitectura y entrenamiento

Ministral 3 8B es un modelo transformer denso (no MoE) compuesto por dos modulos: un modelo de lenguaje de 8.4B parametros y un codificador visual de 0.4B parametros que habilita la comprension de imagenes. La familia Ministral 3 esta optimizada para despliegue en el borde, con un equilibrio entre capacidad y eficiencia computacional. El modelo soporta una ventana de contexto de 256 000 tokens y esta disenado para mantener una fuerte adherencia a system prompts, lo que es especialmente relevante en aplicaciones agenticas donde las instrucciones del sistema condicionan el comportamiento del modelo a lo largo de conversaciones largas.

El modelo ha sido post-entrenado como instruct, aunque la informacion disponible no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas especificas como RLHF, DPO o RL. La model card menciona que la familia incluye variantes Base, Instruct y Reasoning, lo que sugiere un pipeline de post-entrenamiento diferenciado. El fine-tune publicado por Virtudant-AI no documenta en la informacion disponible los datos ni la metodologia de ajuste empleados sobre el modelo base de Mistral. La coleccion de Unsloth referenciada en la model card incluye versiones GGUF con cuantizacion dinamica 2.0 y guias para fine-tuning y aprendizaje por refuerzo (GSPO/GRPO).

## Capacidades

- Generacion de texto y razonamiento general en once idiomas declarados.
- Comprension de imagenes y descripcion de contenido visual gracias al codificador de 0.4B parametros.
- Function calling nativo y salida estructurada en JSON, orientado a integracion con herramientas externas.
- Capacidades agenticas: ejecucion de tareas multi-paso, uso de herramientas y razonamiento encadenado.
- Fuerte adherencia a system prompts, util para mantener roles y restricciones en produccion.
- Soporte de contexto largo de hasta 256 000 tokens para documentos extensos y conversaciones prolongadas.
- Capacidad de fine-tuning y especializacion, con notebooks gratuitos referenciados en la model card (incluye RL con GSPO/GRPO).
- Modo instruct (no se declara un modo de razonamiento explicito en esta variante; la familia incluye variantes Reasoning separadas).

## Casos de uso

- Asistente local de escritorio: el modelo puede ejecutarse en una GPU de consumo con 12 GB de VRAM en FP8, ofreciendo un asistente personal con acceso a archivos locales y contexto largo para sesiones de trabajo prolongadas.
- Atencion al cliente automatizada: con 256 000 tokens de contexto y soporte de system prompts, puede gestionar conversaciones multi-turno con historial extenso e integrarse con sistemas de ticketing mediante function calling.
- Descripcion y analisis de imagenes y documentos: el codificador visual permite procesar capturas, diagramas o documentos escaneados y generar descripciones o extraer informacion estructurada en JSON.
- Traduccion y generacion de contenido multilingue: cubre once idiomas, incluidos espanol, frances, aleman, chino, japones, coreano y arabe, adecuado para pipelines de localizacion.
- Agentes de automatizacion de flujos: su soporte nativo de JSON y function calling lo hace apto para orquestar llamadas a APIs, consultas a bases de datos y tareas de extraccion de informacion en pipelines de CI/CD o RPA.
- Fine-tuning especializado: la licencia Apache 2.0 y los notebooks de Unsloth permiten adaptar el modelo a dominios verticales (legal, sanitario, financiero) sin restricciones de uso comercial.
- Despliegue en entornos con recursos limitados: estaciones de trabajo sin GPU dedicada de gama alta, dispositivos embebidos o instalaciones on-premise donde la nube no es una opcion por privacidad o latencia.

## Benchmarks y rendimiento

La model card incluye resultados de benchmarks para la familia Ministral 3, aunque la tabla proporcionada en la informacion disponible esta incompleta (se corta tras la fila de Qwen3-14B en la seccion de razonamiento). Los datos disponibles son los siguientes:

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 14B | 0.850 | 0.898 | 0.712 | 0.646 |
| Qwen3-14B (Thinking) | 0.737 | 0.837 | 0.663 | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks especificos para la variante 8B ni para el fine-tune de Virtudant-AI. Tampoco se dispone de datos de MMLU, HumanEval o GSM8K para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12 GB en FP8 para el modelo completo (8.8B parametros); menos de 8 GB con cuantizacion de 4 bits; en BF16 se estiman en torno a 17-18 GB.
- GPU recomendadas: A100 40GB, H100, L40S para despliegue en produccion con contexto largo; RTX 4090 (24 GB) para FP8/BF16; RTX 4080/4070 Ti Super (16 GB) para FP8; GPUs de 8 GB con cuantizacion 4-bit.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 4080, RTX 4070 Ti Super y modelos con 12 GB o mas en FP8; en GPUs de 8 GB mediante cuantizacion 4-bit.
- Opciones de despliegue: vLLM (libreria declarada en el Hub), llama.cpp y Ollama mediante los GGUF de Unsloth, TGI y el stack mistral-common para tokenizacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral 3 8B Instruct 2512 (este) | 8.8B (8.4B LM + 0.4B vision) | 256k | Si | Apache 2.0 | Hugging Face |
| Ministral 3 14B Instruct 2512 | no disponible (familia 14B) | 256k (segun familia) | Si (segun familia) | Apache 2.0 | Hugging Face |
| Qwen3-14B (Thinking) | 14B | no disponible | no disponible | no disponible | Hugging Face |

La comparativa con Qwen3-14B se limita a los benchmarks de razonamiento parcialmente disponibles en la model card. No se dispone de informacion suficiente para comparar rendimiento, contexto o licencia de Qwen3-14B en esta ficha, por lo que los datos se marcan como no disponibles cuando corresponde.

## Limitaciones y advertencias

- El fine-tune de Virtudant-AI no documenta los datos de ajuste, la metodologia ni evaluaciones propias; su comportamiento puede diferir del modelo oficial de Mistral.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento abierto y generacion de hechos.
- Sesgos potenciales derivados de los datos de entrenamiento del modelo base, no evaluados en la informacion disponible.
- Aunque se declaran once idiomas, el rendimiento puede variar significativamente entre ellos; no se aportan evaluaciones por idioma.
- El contexto de 256 000 tokens puede degradar la calidad en los extremos de la ventana y aumentar el consumo de memoria; se recomienda validar en el caso de uso concreto.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base de Mistral y de cualquier componente de terceros.
- No se han publicado resultados de benchmarks para esta variante especifica, por lo que las decisiones de produccion deberian basarse en evaluaciones propias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Virtudant-AI/Ministral-3-8B-Instruct-2512
- Modelo base oficial: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Coleccion Ministral 3 de Unsloth: https://huggingface.co/collections/unsloth/ministral-3
- Guia de Unsloth para Ministral 3: https://docs.unsloth.ai/new/ministral-3
- Benchmarks de cuantizacion Unsloth Dynamic 2.0: https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Notebook de fine-tuning (Colab): https://docs.unsloth.ai/new/ministral-3#fine-tuning
- Notebook de RL con GSPO/GRPO: https://docs.unsloth.ai/new/ministral-3#reinforcement-learning-grpo
- Otros notebooks de Unsloth: https://docs.unsloth.ai/get-started/unsloth-notebooks
- Formatos adicionales de Ministral 3: https://huggingface.co/collections/mistralai/ministral-3-more
