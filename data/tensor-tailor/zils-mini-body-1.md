# tensor-tailor/zils-mini-body-1

## Resumen

zils-mini-body-1 es un modelo de decisión publicado por el usuario tensor-tailor dentro del ecosistema Zils (Bittensor subnet 127). Se trata de un "cuerpo de decisión" (decision body) construido sobre el chasis d3-mini, que a su vez deriva de Qwen3.5-4B: conserva la disposición de tensores de lenguaje y visión de ese modelo base en bf16. El modelo no se entrena desde cero, sino que se obtiene mediante la fusión (soup) de tres modelos de decisión de la casa y un fine-tune con LoRA sobre esa misma media.

El problema que aborda es el de la toma de decisiones estructurada: elegir opciones, resolver preguntas de resultado con fecha, seleccionar herramientas y argumentos, y responder tareas de razonamiento y NLI. El modelo tiene 4.539.265.536 parámetros (4,54 mil millones), un tamaño de repositorio de 9,1 GB y licencia Apache-2.0. La longitud de contexto no está declarada explícitamente en la información disponible, aunque el entrenamiento descartó filas de más de 2.048 tokens.

Es relevante ahora porque documenta con inusual detalle metodológico un proceso de merging y destilación reproducible: media uniforme en fp32 de tres cuerpos, LoRA de rango 16 sobre las proyecciones de atención y Gated-DeltaNet de las 32 capas de lenguaje, y una mezcla final declarada antes de conocer las puntuaciones. El autor indica además que el modelo no superó su propia comprobación de entrada a la ronda de soup y que se publica como intento libre deliberado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención y Gated-DeltaNet, disposición de chasis Qwen3.5-4B (lenguaje y visión) |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento descartó filas de más de 2.048 tokens) |
| Tipos de cuantización | No disponible (pesos almacenados en bf16; no se declaran otras cuantizaciones) |
| Idiomas soportados | No disponibles (los datos de entrenamiento incluyen ediciones de Wikipedia en en, es, pt, fr, it, ru, de, ja, zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code), bf16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 32 capas de lenguaje con proyecciones de atención y Gated-DeltaNet, en la disposición del chasis zils-ai/d3-mini-4.5b-v1, cuyo padre es Qwen/Qwen3.5-4B. El modelo incluye tensores de visión heredados del chasis. Los pesos se obtienen en dos fases: primero, una media uniforme en fp32 sobre todos los tensores del chasis de tres modelos (torchcast-ai/torchcast-decision-4b, Maincode/Matilda-Decision-v1-Mini y perplexity-ai/pplx-decider-flash-v1.2); segundo, un fine-tune con LoRA de rango 16, alpha 32, dropout 0,05 y learning rate 1e-4 (warm-up lineal de 50 pasos y decaimiento coseno) sobre las 152 matrices de atención y Gated-DeltaNet de las 32 capas. El LoRA se fusiona en los pesos y se almacena en bf16.

El resultado final es la media uniforme en fp32 de seis entradas: los tres cuerpos iniciales una vez cada uno y el cuerpo fine-tuneado tres veces, es decir, mitad media inicial y mitad fine-tune. El entrenamiento usó 34.607 filas de entrenamiento y 14.817 de regularización tras descartar 80 y 2 filas por longitud. La pérdida combina entropía cruzada sobre filas etiquetadas (preguntas de resultado con fecha, GSM8K y filas generadas), KL forward hacia las probabilidades de opción del profesor en las filas de destilación y KL hacia las probabilidades precalculadas de la media inicial en las filas de regularización. El profesor de destilación es vllm-sr/d3-ultra. La ejecución se reinició una vez desde cero por falta de memoria en el punto de control de media época. El cambio relativo de los tensores de lenguaje respecto a Qwen3.5-4B es de 0,0244, muy por debajo del límite de 0,15 de Zils.

## Capacidades

- Generación de texto y razonamiento sobre opciones múltiples, incluyendo tareas de NLI, lógica formal y sentido numérico.
- Decisión estructurada: selección de opción en preguntas de resultado con fecha, elección de herramienta y puntuación de argumentos.
- Tool calling / function calling: entrenado con 5.329 filas de herramientas, incluidas 829 de destilación de selección de herramientas de BFCL.
- Razonamiento matemático básico: 2.000 filas del split de entrenamiento de GSM8K.
- Capacidades multilingües parciales: datos de Wikipedia en nueve ediciones (en, es, pt, fr, it, ru, de, ja, zh) y filas multilingües de NLI.
- Tensores de visión heredados del chasis Qwen3.5-4B; no se documenta entrenamiento específico de visión.
- No se declara modo de pensamiento (thinking mode) explícito ni soporte de audio.

## Casos de uso

- Clasificación y decisión automática de resultados: el modelo puede puntuar opciones en preguntas de resultado con fecha (por ejemplo, si una edición de Wikipedia será revertida), gracias a su entrenamiento específico con 8.604 filas de ese tipo.
- Moderación y control de calidad en plataformas wiki: evaluación de ediciones en Wikidata y Wikipedia con etiquetas de reversión verificadas, adecuado por su calibración sobre datos CC BY-SA y CC0.
- Enrutado de herramientas en agentes: selección de la herramienta correcta y de sus argumentos en pipelines de agentes, apoyado en las 5.329 filas de tool questions y en la destilación de BFCL.
- Clasificación de documentos científicos: asignación de categorías de listado de arXiv (cs, physics, math, other) a partir de título y resumen, con 2.500 filas de entrenamiento específicas.
- Razonamiento y NLI en producción: resolución de tareas de inferencia de lenguaje natural y lógica (WinoGrande, ARC, HellaSwag, FOL-nli, RuleTaker) para filtrado y validación de contenido.
- Evaluación comparativa de modelos de decisión: como cuerpo de referencia en experimentos de merging y destilación dentro de Zils, dado el detalle metodológico publicado.
- Asistente de resolución de problemas matemáticos escolares: resolución de problemas de GSM8K en entornos educativos, con la cautela de que el entrenamiento usó el split de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "dos conjuntos de desarrollo primarios" y una "comprobación de entrada a la ronda de soup", pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 3 GB (no se declaran cuantizaciones oficiales, por lo que son estimaciones).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para bf16 con holgura.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantización y en GPUs de 12 GB con cuantización agresiva.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama requieren conversión a GGUF o soporte del código personalizado (custom_code) del repositorio; el modelo usa código propio, por lo que la compatibilidad directa no está garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-mini-body-1 | 4,54 B | No disponible | Apache-2.0 | Decisión, tool calling, NLI |
| torchcast-ai/torchcast-decision-4b | No disponible | No disponible | Apache-2.0 | Decisión (modelo base) |
| Maincode/Matilda-Decision-v1-Mini | No disponible | No disponible | Apache-2.0 | Decisión (modelo base) |
| perplexity-ai/pplx-decider-flash-v1.2 | No disponible | No disponible | Apache-2.0 | Decisión (modelo base) |

Los tres modelos base son los componentes de la media inicial; no se dispone de sus especificaciones detalladas ni de resultados comparativos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- El autor declara que el modelo no superó su propia comprobación de entrada a la ronda de soup y se publica como intento libre; no debe asumirse que sea competitivo frente a otros cuerpos de la ronda.
- Riesgo de alucinación inherente a un modelo de 4,5 B entrenado principalmente con destilación y datos sintéticos; no se han publicado evaluaciones independientes.
- Longitud de contexto no declarada; el entrenamiento descartó filas de más de 2.048 tokens, por lo que el rendimiento más allá de esa longitud no está validado.
- Idiomas soportados no declarados formalmente; la cobertura multilingüe se limita a los idiomas presentes en los datos (nueve ediciones de Wikipedia y filas multilingües de NLI).
- El uso de datos de Wikipedia (CC BY-SA 4.0) y de conjuntos con licencias MIT, BSD y CC implica obligaciones de atribución que conviene revisar, aunque los pesos se distribuyan bajo Apache-2.0.
- El modelo usa código personalizado (custom_code), lo que puede complicar el despliegue en herramientas estándar sin adaptaciones.
- El fine-tune se realizó sobre un subconjunto de tensores (152 matrices); el resto de pesos proviene de la media de modelos de terceros, con la variabilidad que ello implica.
- No se documentan sesgos específicos ni evaluaciones de seguridad; se recomienda validación previa en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-1
- Modelo base: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Modelo base: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Chasis: https://huggingface.co/zils-ai/d3-mini-4.5b-v1
- Modelo padre: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de destilación: https://huggingface.co/datasets/zils-ai/zils-relay-answers
