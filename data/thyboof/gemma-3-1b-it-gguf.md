# ThyBoof/gemma-3-1b-it-GGUF

## Resumen

ThyBoof/gemma-3-1b-it-GGUF es una conversión al formato GGUF del modelo google/gemma-3-1b-it, la variante ajustada por instrucciones (instruction-tuned) de 1.000 millones de parámetros de la familia Gemma 3, desarrollada por Google DeepMind. El repositorio publica los pesos cuantizados para inferencia local eficiente con motores compatibles con GGUF, como llama.cpp, Ollama o LM Studio. El número total de parámetros del modelo base es de 999.885.952 y el repositorio ocupa 20,8 GB, lo que indica que incluye varios niveles de cuantización.

Gemma 3 se construye con la misma investigación y tecnología empleadas en los modelos Gemini de Google. La variante de 1B se entrenó con 2 billones de tokens y ofrece una ventana de contexto de entrada de 32K tokens (frente a los 128K de los tamaños 4B, 12B y 27B) y una salida de hasta 8192 tokens. La familia declara soporte multilingüe en más de 140 idiomas, aunque la etiqueta de idioma de este repositorio concreto es únicamente inglés.

Su relevancia radica en que permite ejecutar un modelo conversacional de Google en hardware muy modesto (CPU, portátiles o GPU de gama de entrada) manteniendo la licencia Gemma, lo que facilita el prototipado y el despliegue local de asistentes de texto sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32K tokens de entrada; 8192 tokens de salida |
| Tipos de cuantizacion | GGUF en varios niveles (el listado exacto no consta en la informacion proporcionada) |
| Idiomas soportados | Ingles (etiqueta del repositorio); la familia Gemma 3 declara mas de 140 idiomas |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Gemma 3, pensado para generación de texto a partir de entradas de texto. La variante de 1B de Gemma 3 utiliza entrada exclusivamente de texto con una ventana de contexto de 32K tokens, mientras que los tamaños 4B, 12B y 27B de la familia amplían el contexto a 128K y añaden entrada de imagen. La salida en todos los casos está limitada a 8192 tokens.

El modelo base google/gemma-3-1b-it se entrenó con 2 billones de tokens (frente a los 4, 12 y 14 billones de los tamaños 4B, 12B y 27B respectivamente). El conjunto de datos combina documentos web de diversa procedencia, con contenido en más de 140 idiomas, y código, lo que mejora la familiaridad del modelo con sintaxis y patrones de lenguajes de programación. La información proporcionada no detalla si el ajuste por instrucciones empleó RLHF, DPO u otra técnica de alineación, por lo que ese punto queda como no disponible. Esta ficha corresponde a una cuantización GGUF posterior, no a un reentrenamiento: el contenido del modelo es el del checkpoint original de Google transformado por herramientas de cuantización.

## Capacidades

- Generación de texto conversacional, incluyendo respuesta a preguntas y resumen de documentos.
- Razonamiento básico y tareas de comprensión descritas en la model card de la familia (question answering, summarization, reasoning).
- Capacidades de código derivadas de la inclusión de datos de programación en el entrenamiento.
- Soporte multilingüe declarado a nivel de familia (más de 140 idiomas), si bien la etiqueta del repositorio indica únicamente inglés.
- Formato conversacional (etiqueta "conversational"), orientado a diálogo multi-turno.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explícito (thinking mode) en la información disponible.
- No se documenta capacidad de visión para esta variante de 1B; la entrada es de texto con 32K tokens de contexto.

## Casos de uso

- Asistente conversacional local: al tener un tamaño de ~1B y caber en CPU o en GPU de gama de entrada, puede integrarse en aplicaciones de escritorio o móviles para mantener diálogos sin conexión a internet.
- Prototipado rápido de pipelines de generación de texto: sirve como modelo de referencia barato para validar prompts, plantillas y flujos antes de escalar a modelos mayores de la misma familia.
- Resumen de documentos cortos: aprovechando la ventana de 32K tokens de entrada, puede condensar correos, artículos o informes de extensión moderada.
- Clasificación y extracción de información: uso como motor de texto para etiquetar tickets, extraer entidades o responder consultas estructuradas en entornos con recursos limitados.
- Generación de código asistida en el editor: gracias a la exposición a datos de programación durante el entrenamiento, puede completar fragmentos o explicar funciones sencillas en local.
- Educación y demostraciones: despliegue en talleres, aulas o notebooks para ilustrar el funcionamiento de un LLM sin costes de API ni requisitos de hardware elevados.
- Preprocesado y filtrado en lotes: al ser un modelo pequeño y rápido, puede usarse para tareas de clasificación a gran escala antes de pasar los casos complejos a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (valores aproximados para ~1B parámetros, sin contar la caché KV): BF16/F16 en torno a 2 GB; Q8_0 en torno a 1,1 GB; Q6_K en torno a 0,9 GB; Q5_K_M en torno a 0,8 GB; Q4_K_M en torno a 0,7 GB. La caché KV para 32K tokens añade consumo adicional que depende del motor y del nivel de cuantización.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; se puede ejecutar con solvencia en RTX 3060, RTX 4060, GTX 1650 o incluso GPUs integradas, además de A100 o H100 si se desea máximo throughput.
- Cabe en GPU de consumo: sí, con holgura, en prácticamente cualquier GPU de consumo moderna e incluso en CPU con memoria RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y otros motores compatibles con GGUF. El repositorio también declara compatibilidad con endpoints.
- Latencia y throughput: no se proporcionan cifras concretas. Al tratarse de un modelo de ~1B parámetros, la generación en GPU moderna es del orden de cientos a miles de tokens por segundo, y en CPU del orden de decenas de tokens por segundo, aunque estos valores son estimaciones y dependen del hardware y de la cuantización empleada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gemma-3-1b-it (este repo, GGUF) | ~1B | 32K entrada / 8K salida | Gemma | GGUF en HuggingFace |
| Llama 3.2 1B Instruct | ~1,2B | 128K | Llama 3.2 Community | Pesos y GGUF en HuggingFace |
| Qwen2.5 1.5B Instruct | ~1,5B | 32K | Apache 2.0 | Pesos y GGUF en HuggingFace |

Los datos de contexto y licencia de los modelos comparados se incluyen a título orientativo; no se dispone de comparativas de rendimiento publicadas para este repositorio concreto. La principal diferencia de la variante Gemma 3 1B frente a alternativas como Llama 3.2 1B es su ventana de contexto más reducida (32K frente a 128K) y su licencia Gemma en lugar de Apache 2.0 o Llama Community.

## Limitaciones y advertencias

- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo.
- Tamaño reducido: con ~1B parámetros, su capacidad de razonamiento, matemáticas y seguimiento de instrucciones complejas es inferior a la de modelos mayores de la misma familia y de otras familias.
- Contexto limitado: la variante de 1B ofrece 32K tokens de entrada, muy por debajo de los 128K de los tamaños 4B, 12B y 27B, y la salida está limitada a 8192 tokens.
- Idioma: aunque la familia Gemma 3 declara soporte en más de 140 idiomas, la etiqueta de este repositorio indica únicamente inglés; el rendimiento en otros idiomas puede degradarse.
- Cuantización: los pesos GGUF están cuantizados, lo que reduce la precisión numérica y puede afectar a la calidad de las respuestas en comparación con el modelo en BF16/F16.
- Licencia Gemma: el uso comercial está permitido bajo los Gemma Terms of Use y la política de usos prohibidos de Google; es necesario revisar y cumplir dichas condiciones antes de un despliegue en producción.
- No se documentan capacidades de tool calling, agentes o visión para esta variante.
- Trazabilidad: el repositorio no incluye resultados de benchmarks ni detalles del proceso de cuantización, por lo que la calidad final depende de la herramienta y del nivel de cuantización escogido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ThyBoof/gemma-3-1b-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Página oficial de Gemma: https://ai.google.dev/gemma/docs/core
- Informe técnico de Gemma 3: https://goo.gle/Gemma3Report
- Guía de Unsloth para ejecutar Gemma 3: https://docs.unsloth.ai/basics/tutorial-how-to-run-gemma-3-effectively
- Colección de Unsloth para Gemma 3: https://huggingface.co/collections/unsloth/gemma-3-67d12b7e8816ec6efa7e4e5b
- Blog de Unsloth sobre Gemma 3: https://unsloth.ai/blog/gemma3
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Responsible Generative AI Toolkit: https://ai.google.dev/responsible
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma3
