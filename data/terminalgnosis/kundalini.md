# terminalgnosis/kundalini

## Resumen

Kundalini es un modelo de lenguaje de pequeño tamaño desarrollado por el usuario terminalgnosis, que consiste en un fine-tuning del modelo base unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit. El modelo está orientado a la generación de texto conversacional en inglés y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones significativas.

Con aproximadamente 1.236 millones de parámetros (1,24B), Kundalini se sitúa en la gama de modelos compactos, diseñados para ejecutarse en hardware con recursos limitados o en entornos de inferencia con baja latencia. El entrenamiento se realizó con la librería Unsloth y la suite TRL de Hugging Face, lo que indica un proceso de fine-tuning optimizado para eficiencia computacional.

La relevancia de este modelo radica en su tamaño reducido y su licencia permisiva, lo que lo convierte en una opción accesible para desarrolladores que necesitan un modelo de instrucciones en inglés con capacidades conversacionales básicas y sin coste de licencia. No se dispone de información sobre el dataset de entrenamiento ni sobre las capacidades específicas más allá de la generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama 3.2 1B) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base se entrenó con bnb-4bit, pero no se publican cuantizaciones del fine-tune) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kundalini hereda la arquitectura transformer decoder-only del modelo Llama 3.2 1B, un modelo de 1.24 mil millones de parámetros optimizado para tareas de instrucción y conversación. El fine-tuning se realizó sobre la versión de Unsloth del modelo instruct, que ya incorpora una etapa de ajuste para seguir instrucciones. El proceso de entrenamiento se llevó a cabo con la librería Unsloth y Hugging Face TRL, lo que sugiere un pipeline de fine-tuning con LoRA o QLoRA, aunque no se detallan los hiperparámetros ni el dataset utilizado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se publica en formato safetensors y es compatible con el pipeline de text-generation de Transformers.

## Capacidades

- Generación de texto conversacional en inglés.
- Seguimiento de instrucciones básicas (instruct).
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-step.
- No se especifica soporte para agentes o vision.
- Capacidades multilingües: solo inglés declarado.
- No se mencionan modos de pensamiento o generación especializada.

## Casos de uso

- **Chatbots y asistentes conversacionales**: dado su tamaño compacto, puede integrarse en aplicaciones de mensajería o sitios web para mantener conversaciones simples en inglés, con baja latencia y consumo de recursos.
- **Generación de texto para documentación**: puede usarse para redactar borradores de correos, resúmenes o textos cortos en inglés en entornos donde el coste computacional sea una restricción.
- **Prototipado rápido**: desarrolladores que quieran validar una idea de producto de IA generativa sin invertir en modelos grandes pueden usar Kundalini como punto de partida para pruebas de concepto.
- **Inferencia en CPU**: al ser un modelo de 1.24B parámetros, es viable ejecutarlo en CPU con un rendimiento aceptable, lo que permite despliegues en entornos sin GPU.
- **Aplicaciones educativas**: para demostraciones de generación de texto o proyectos de investigación en el ámbito académico, gracias a la licencia Apache 2.0 que facilita su redistribución y modificación.
- **Edge computing**: puede desplegarse en dispositivos con limitaciones de memoria, como Raspberry Pi o sistemas embebidos, para tareas de generación de texto simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de evaluación como MMLU, HumanEval, GSM8K ni comparaciones con modelos similares.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para una cuantización de 4 bits, se estiman entre 1 y 2 GB de VRAM; para precisión completa (fp16), alrededor de 2.5-3 GB. Los valores son orientativos, ya que no se publican cuantizaciones específicas.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo sin problemas. También es viable en CPU con un rendimiento moderado.
- **Compatibilidad con consumer GPU**: sí, cabe en la mayoría de GPUs de consumo actuales y antiguas.
- **Opciones de despliegue**: compatible con Hugging Face Transformers, y puede usarse con TGI (Text Generation Inference), vLLM, llama.cpp u Ollama (aunque no se confirma compatibilidad explícita con estas herramientas).
- **Latencia y throughput**: no disponible; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| terminalgnosis/kundalini | 1.24B | no disponible | Apache 2.0 | en |
| unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit | 1.24B | 128K (base) | Apache 2.0 | en |
| Qwen 2.5 1.5B Instruct | 1.5B | 32K | Apache 2.0 | multilingue |
| Gemma 2 2B | 2.6B | 8K | Gemma License | multilingue |

Nota: los datos de contexto y rendimiento de los modelos comparados pueden variar; no se dispone de resultados de benchmarks para kundalini, por lo que no se puede comparar directamente el rendimiento.

## Limitaciones y advertencias

- **Tamaño reducido**: con 1.24B parámetros, su capacidad de razonamiento y conocimiento es limitada comparada con modelos de mayor escala; puede producir respuestas incoherentes o simplistas.
- **Alucinación**: al no contar con datos de entrenamiento documentados, no se puede evaluar el riesgo de alucinación, pero es probable que ocurra en temas especializados.
- **Idioma**: solo se ha declarado inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- **Contexto**: no se especifica la longitud de contexto soportada, por lo que el uso de ventanas largas puede ser inestable.
- **Falta de evaluación**: no hay benchmarks públicos que permitan medir su calidad objetiva, lo que limita su uso en producción sin evaluación previa.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario debe revisar las condiciones de la licencia del modelo base (Llama 3.2) que pueden tener restricciones adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/terminalgnosis/kundalini)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)
- [Modelo base: unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit](https://huggingface.co/unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit) (no se incluye en la información, pero se deduce de la model card)

Nota: los resultados de búsqueda web sobre "kundalini" no están relacionados directamente con este modelo, por lo que no se incluyen enlaces adicionales.</think>## Resumen

Kundalini es un modelo de lenguaje de pequeña escala desarrollado por terminalgnosis, que consiste en un fine-tuning sobre el modelo base `unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit`. Está orientado a la generación de texto conversacional en inglés y se publica bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones. El modelo cuenta con aproximadamente 1.236 millones de parámetros (1,24B), lo que lo sitúa en la categoría de modelos compactos diseñados para ejecutarse en hardware con recursos limitados o en entornos de baja latencia.

El entrenamiento se realizó con la librería Unsloth y la suite TRL de Hugging Face, lo que indica un proceso de fine-tuning optimizado para eficiencia computacional. Su relevancia radica en que ofrece una alternativa ligera y con licencia permisiva para aplicaciones de conversación básica en inglés, sin necesidad de infraestructura de alto rendimiento. No se dispone de información detallada sobre el dataset de entrenamiento, la longitud de contexto o las capacidades específicas más allá de la generación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama 3.2 1B) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base se entrenó con bnb-4bit, pero no se publican cuantizaciones del fine-tune) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kundalini hereda la arquitectura transformer decoder-only del modelo Llama 3.2 1B, un modelo de 1.24B parámetros optimizado para seguir instrucciones. El fine-tuning se realizó sobre el modelo de Unsloth, que ya incluye una capa de ajuste de instrucciones. El proceso de entrenamiento utilizó la librería Unsloth y Hugging Face TRL, lo que sugiere el uso de técnicas como LoRA o QLoRA, aunque no se documentan los hiperparámetros exactos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni la aplicación de técnicas de RLHF o DPO. El modelo se publica en formato safetensors y es compatible con la librería Transformers para generación de texto.

## Capacidades

- Generación de texto conversacional en inglés.
- Seguimiento de instrucciones básicas (instruct).
- No se documenta soporte para tool calling, function calling o razonamiento multi-step.
- No se especifican capacidades de agentes, visión o audio.
- Capacidades multilingües: solo se declara el inglés.
- No se indica modo de pensamiento (thinking mode) ni otras funcionalidades especializadas.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones de soporte básico en inglés, siempre que las interacciones sean sencillas y de corta duración, gracias a su tamaño compacto y baja latencia.
- **Generación de textos cortos**: puede redactar correos, resúmenes o borradores en inglés en entornos donde los recursos computacionales son limitados.
- **Prototipado rápido**: desarrolladores pueden integrar Kundalini en pruebas de concepto de chatbots o asistentes virtuales sin necesidad de modelos grandes, validando la idea antes de escalar.
- **Despliegue en entornos sin GPU**: al ser un modelo de 1.24B parámetros, puede ejecutarse en CPU con un rendimiento aceptable, lo que facilita su uso en servidores de bajo coste o en dispositivos edge.
- **Demostraciones educativas**: sirve para enseñar conceptos de fine-tuning y generación de texto en cursos de IA, gracias a su licencia abierta y su tamaño reducido.
- **Integración en pipelines de texto**: puede utilizarse como generador de texto en flujos de automatización de documentación, siempre que la calidad de la salida sea suficiente para la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card no incluye métricas de evaluación como MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: con cuantización de 4 bits, se estima entre 1 y 2 GB de VRAM; en precisión completa (fp16), entre 2,5 y 3 GB. Los valores son orientativos, ya que no se publican cuantizaciones específicas.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM, como GTX 1650, RTX 3050 o RTX 4090, puede ejecutar el modelo sin problemas. También es viable en CPU.
- **Compatibilidad con consumer GPU**: sí, cabe en la mayoría de GPUs de consumo actuales y antiguas.
- **Opciones de despliegue**: compatible con Hugging Face Transformers y potencialmente con TGI, vLLM, llama.cpp u Ollama, aunque no se confirma explícitamente.
- **Latencia y throughput**: no disponible; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| terminalgnosis/kundalini | 1,24B | no disponible | Apache 2.0 | en |
| unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit | 1,24B | 128k (base) | Apache 2.0 | en |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache 2.0 | multilingue |
| Gemma 2 1B | 1B | 8K | Gemma License | multilingue |

Nota: los datos de contexto de los modelos comparables provienen de sus fichas oficiales; no se dispone de benchmarks para comparar rendimiento con kundalini.

## Limitaciones y advertencias

- **Tamaño reducido**: con 1,24B parámetros, su capacidad de razonamiento y conocimiento es limitada, lo que puede generar respuestas incoherentes o superficiales en temas complejos.
- **Riesgo de alucinación**: al no documentarse el dataset de entrenamiento, no se puede evaluar el riesgo, pero es probable en áreas especializadas.
- **Idioma**: solo se declara inglés; el rendimiento en otros idiomas no está garantizado.
- **Longitud de contexto**: no se especifica, por lo que el uso de ventanas largas puede ser inestable.
- **Falta de evaluación**: no hay benchmarks ni métricas de calidad, lo que impide validar su rendimiento antes de usar en producción.
- **Licencia**: aunque Apache 2.0 permite uso comercial, se debe verificar la licencia del modelo base Llama 3.2, que puede tener restricciones adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/terminalgnosis/kundalini)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)
- [Modelo base: unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit](https://huggingface.co/unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit)

Los resultados de búsqueda web sobre "kundalini" no están relacionados con este modelo, por lo que no se incluyen enlaces adicionales.## Resumen

Kundalini es un modelo de lenguaje de pequeña escala desarrollado por terminalgnosis, que consiste en un fine-tuning sobre el modelo base `unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit`. Está orientado a la generación de texto conversacional en inglés y se publica bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones. El modelo tiene aproximadamente 1.236 millones de parámetros (1,24B), lo que lo sitúa en la categoría de modelos compactos diseñados para ejecutarse en hardware con recursos limitados o en entornos de baja latencia.

El entrenamiento se realizó con la librería Unsloth y la suite TRL de Hugging Face, lo que indica un proceso de fine-tuning optimizado para eficiencia computacional. Su relevancia radica en que ofrece una alternativa ligera y de código abierto para aplicaciones conversacionales básicas en inglés, sin necesidad de infraestructura de gran escala. No se dispone de información detallada sobre el dataset de entrenamiento, la longitud de contexto ni las capacidades específicas más allá de la generación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama 3.2 1B) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base se entrenó con bnb-4bit, pero no se publican cuantizaciones del fine-tune) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kundalini hereda la arquitectura transformer decoder-only del modelo Llama 3.2 1B, un modelo de 1,24B parámetros optimizado para seguir instrucciones. El fine-tuning se realizó sobre el modelo de Unsloth, que ya incluye una capa de ajuste de instrucciones. El proceso de entrenamiento utilizó la biblioteca Unsloth y Hugging Face TRL, lo que sugiere el uso de técnicas como LoRA o QLoRA, aunque no se especifican los hiperparámetros exactos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo se publica en formato safetensors y es compatible con la librería Transformers para generación de texto.

## Capacidades

- Generación de texto conversacional en inglés.
- Seguimiento de instrucciones básicas (instruct).
- No se documenta soporte para tool calling, function calling ni razonamiento multi-paso.
- No se especifican capacidades de agentes, visión ni audio.
- Capacidades multilingües: solo se declara el inglés.
- No se indica modo de pensamiento (thinking mode) ni funcionalidades especializadas.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones de soporte básico en inglés, siempre que las interacciones sean cortas y no requieran razonamiento complejo, gracias a su tamaño compacto y baja latencia.
- **Generación de textos cortos**: puede redactar correos, resúmenes o borradores en inglés en entornos donde los recursos computacionales son limitados.
- **Prototipado rápido**: para validar ideas de chatbots o asistentes virtuales sin invertir en modelos grandes, permite integrarse en un pipeline de desarrollo y probar la experiencia conversacional antes de escalar.
- **Despliegue en entornos sin GPU**: al ser un modelo de 1,24B parámetros, puede ejecutarse en CPU con un rendimiento aceptable, lo que facilita su uso en servidores de bajo coste o dispositivos edge.
- **Demostraciones educativas**: en cursos de IA o NLP, sirve para ilustrar el proceso de fine-tuning y generación de texto, gracias a su licencia abierta y su tamaño manejable.
- **Automatización de documentación**: puede integrarse en flujos de trabajo que generen informes o notas en inglés, siempre que la calidad de la salida sea suficiente para la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card no incluye métricas de evaluación como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: con cuantización de 4 bits, se estima entre 1 y 2 GB de VRAM; en precisión completa (fp16), entre 2,5 y 3 GB. Los valores son orientativos, ya que no se publican cuantizaciones específicas.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM, como GTX 1650, RTX 3050 o RTX 4060, puede ejecutar el modelo sin problemas. También es viable en CPU.
- **Compatibilidad con consumer GPU**: sí, cabe en la mayoría de GPUs de consumo actuales y antiguas.
- **Opciones de despliegue**: compatible con Hugging Face Transformers y potencialmente con TGI, vLLM, llama.cpp u Ollama, aunque no se confirma explícitamente.
- **Latencia y throughput**: no disponible; depende del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| terminalgnosis/kundalini | 1,24B | no disponible | Apache 2.0 | en |
| unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit | 1,24B | 128k (base) | Apache 2.0 | en |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K | Apache 2.0 | multilingüe |
| Gemma-2-1B | 1,2B | 8K | Gemma License | multilingüe |

Nota: los datos de contexto de los modelos comparables provienen de sus fichas oficiales; no se dispone de benchmarks para comparar el rendimiento con kundalini.

## Limitaciones y advertencias

- **Tamaño reducido**: con 1,24B parámetros, su capacidad de razonamiento y conocimiento es limitada, lo que puede generar respuestas incoherentes o superficiales en temas complejos.
- **Riesgo de alucinación**: al no documentarse el dataset de entrenamiento, no se puede evaluar el riesgo, pero es probable en áreas especializadas.
- **Idioma**: solo se declara inglés; el rendimiento en otros idiomas no está garantizado.
- **Longitud de contexto**: no se especifica, por lo que el uso de ventanas largas puede ser inestable.
- **Falta de evaluación**: no hay benchmarks ni métricas de calidad, lo que impide validar su rendimiento antes de producción.
- **Licencia**: aunque Apache 2.0 permite uso comercial, se debe revisar la licencia del modelo base Llama 3.2, que puede tener restricciones adicionales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/terminalgnosis/kundalini)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)
- [Modelo base: unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit](https://huggingface.co/unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit)

Los resultados de búsqueda web sobre "kundalini" no están relacionados con este modelo, por lo que no se incluyen enlaces adicionales.
