# taobao-mnn/Qwen2-1.5B-Instruct-MNN

## Resumen

Qwen2-1.5B-Instruct-MNN es la versión cuantizada y empaquetada para el runtime MNN (Mobile Neural Network) del modelo Qwen2-1.5B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio lo publica taobao-mnn, el equipo detrás del motor de inferencia MNN de Alibaba, y su objetivo es permitir la ejecución del modelo en dispositivos con recursos limitados (CPU, móvil, edge) sin necesidad de GPUs dedicadas ni de stacks como PyTorch o CUDA.

El modelo base es un transformer decoder-only de 1.5B parámetros con 28 capas y dimensión oculta de 1536, afinado para instrucciones y conversación multilingüe (chino e inglés). Esta variante aplica cuantización HQQ de 4 bits con grupo de 128 sobre las capas lineales del lenguaje y la cabeza de salida, mantiene las escalas de cuantización en FP16 y conserva los embeddings en BF16 en un fichero separado.

Es relevante para desarrolladores que necesitan desplegar un LLM de conversación en entornos sin GPU, con un consumo de memoria reducido y un runtime ligero. El repositorio ocupa 3.0 GB e incluye los ficheros de grafo y pesos en formato propietario de MNN (`llm.mnn` / `llm.mnn.weight`), además del tokenizador y la configuración de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), 28 capas, hidden dim 1536 |
| Parametros totales | 1.5B (modelo base Qwen2-1.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | HQQ 4-bit con grupo 128 (capas lineales y output head); escalas FP16; embeddings BF16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`), embeddings en `embeddings_bf16.bin`, tokenizador `tokenizer.mtok` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2-1.5B-Instruct: un transformer decoder-only con 28 capas y dimensión oculta de 1536, entrenado por el equipo Qwen de Alibaba y afinado por instrucciones. El repositorio no documenta los detalles del preentrenamiento ni del ajuste (número de tokens, composición del dataset, uso de RLHF o DPO); esa información corresponde a la model card del modelo base, no incluida en la información proporcionada.

La contribución técnica de esta variante es el pipeline de cuantización y exportación a MNN. Se aplica HQQ (Half-Quadratic Quantization) de 4 bits con tamaño de grupo 128 a las capas lineales del lenguaje y a la cabeza de salida, manteniendo las escalas de cuantización en FP16 para preservar precisión. Los embeddings de tokens se almacenan por separado en BF16 (`embeddings_bf16.bin`), lo que evita cuantizarlos y mantiene la fidelidad de la representación de entrada. El resultado se empaqueta en el formato de grafo y pesos de MNN, ejecutable con el binario `llm_demo` del proyecto MNN (versión 3.6.2 validada, commit `b0239771b07b317a258fbc384683bbd540741406`), con flags de compilación `MNN_BUILD_LLM`, `MNN_LOW_MEMORY` y `MNN_SUPPORT_TRANSFORMER_FUSE`.

## Capacidades

- Generación de texto y conversación multi-turno en chino e inglés.
- Seguimiento de instrucciones (modelo afinado para instrucciones).
- Razonamiento básico y respuesta a preguntas.
- Generación de código y tareas de aritmética simples (verificadas en el smoke test del exportador: casos de saludo, aritmética y traducción).
- Traducción entre chino e inglés (caso de prueba documentado).
- Ejecución en CPU con 4 hilos por defecto, con configuración `precision=low` y `memory=low`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información proporcionada.

## Casos de uso

- Asistente conversacional en dispositivo: el modelo puede gestionarse en CPU con 4 hilos y configuración de baja memoria, lo que lo hace adecuado para chatbots integrados en aplicaciones móviles o de escritorio mediante MNN, sin depender de servicios en la nube.
- Traducción chino-inglés en local: el modelo base está entrenado en ambos idiomas y el smoke test del exportador valida casos de traducción, por lo que puede usarse para traducción bidireccional en entornos offline.
- Generación de texto asistida en herramientas de escritorio: integrable como función de autocompletado o redacción en editores y utilidades ofimáticas que ya usen el runtime MNN.
- Prototipado y evaluación de LLMs en edge: sirve como banco de pruebas para medir latencia y consumo de memoria de un modelo de 1.5B cuantizado a 4 bits en hardware sin GPU.
- Respuesta a preguntas sobre documentación local: con el contexto que permita el modelo base, puede emplearse para consultas sobre manuales o bases de conocimiento pequeñas embebidas en la aplicación.
- Filtrado y clasificación de texto ligera: tareas de etiquetado, resumen corto o reformulación que no requieran un modelo de mayor tamaño, ejecutables en el mismo dispositivo que la aplicación.
- Educación y demos: ejemplo práctico de despliegue de un LLM cuantizado con MNN para talleres y entornos de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta una validación funcional (2026-11-09, x64 CPU) con casos de alineación FP32, saludo, aritmética y traducción, además de un smoke test con la configuración por defecto; no se aportan métricas de calidad (MMLU, HumanEval, GSM8K) ni de throughput o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario principal (ejecución en CPU); no se proporciona una estimación de memoria para GPU.
- GPU recomendadas: no disponible; el repositorio está orientado a CPU y no documenta despliegue en GPU.
- Cabe en consumer GPU: no se documenta; el formato MNN y la configuración por defecto apuntan a CPU.
- Opciones de despliegue: runtime MNN con el binario `llm_demo` (compilado con `MNN_BUILD_LLM`, `MNN_LOW_MEMORY`, `MNN_SUPPORT_TRANSFORMER_FUSE`); integración en aplicaciones vía la documentación MNN-LLM. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput estimados: no disponibles; solo se indica la configuración por defecto (CPU, 4 hilos, `precision=low`, `memory=low`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Qwen2-1.5B-Instruct-MNN (este) | 1.5B | no disponible | HQQ 4-bit, grupo 128 | Apache 2.0 | MNN (CPU) |
| Qwen/Qwen2-1.5B-Instruct (base) | 1.5B | no disponible en la informacion proporcionada | FP16/BF16 original | Apache 2.0 | safetensors (PyTorch) |
| Otras variantes cuantizadas de Qwen2-1.5B-Instruct (GGUF, etc.) | 1.5B | no disponible | 4-bit (Q4_K_M, etc.) | Apache 2.0 | GGUF (llama.cpp) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- El modelo base tiene 1.5B parámetros, por lo que su capacidad de razonamiento, conocimiento factual y generación de código es limitada en comparación con modelos de mayor tamaño; es propenso a errores en tareas complejas.
- Riesgo de alucinación inherente a los LLM de este tamaño; no se documentan mitigaciones específicas.
- Idiomas soportados limitados a chino e inglés; el rendimiento en castellano no está garantizado ni documentado.
- La longitud de contexto no se especifica en la información proporcionada; debe consultarse la model card del modelo base antes de usarlo en tareas que dependan de ventanas largas.
- La cuantización HQQ de 4 bits introduce pérdida de precisión respecto al modelo original; el exportador solo valida alineación FP32 y casos de humo, no una evaluación de calidad exhaustiva.
- El formato de pesos es específico de MNN; no es directamente cargable por PyTorch, llama.cpp ni vLLM, lo que limita la portabilidad.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse los avisos de licencia y atribución correspondientes.
- La fecha de actualización del repositorio (2026-11-18) es posterior a la de creación (2024-09-27); conviene verificar la coherencia de los ficheros y hashes indicados en `refresh_metadata.json` antes de desplegar en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/Qwen2-1.5B-Instruct-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen2-1.5B-Instruct
- Repositorio MNN en GitHub: https://github.com/alibaba/MNN
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- ModelScope: https://modelscope.cn/models/MNN/Qwen2-1.5B-Instruct-MNN
- Ficheros de exportación y metadatos: `export_args.json` y `refresh_metadata.json` en el repositorio de Hugging Face
