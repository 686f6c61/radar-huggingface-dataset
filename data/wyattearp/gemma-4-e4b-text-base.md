# wyattearp/Gemma-4-E4B-text-base

## Resumen

**Gemma-4-E4B-text-base** es un checkpoint derivado del modelo **google/gemma-4-E4B-it** de Google DeepMind, creado por el usuario de Hugging Face *wyattearp*. Se trata de una extracción del backbone de lenguaje del modelo original, eliminando las proyecciones multimodales (torres de visión y audio) para obtener un modelo puramente textual. El objetivo es reducir el uso de VRAM y simplificar la inferencia en entornos dedicados a generación de texto, razonamiento y tool calling, manteniendo los pesos del transformer de lenguaje idénticos bit a bit al lanzamiento original.

El modelo conserva la arquitectura transformer de Gemma 4, con una longitud de contexto de 131 072 tokens y un vocabulario de 256 000 tokens. Aunque la model card indica aproximadamente 4,2 mil millones de parámetros, el archivo `safetensors` del repositorio contiene 7 518 069 034 parámetros, una discrepancia que no se explica en la documentación. Está pensado para ser servido con vLLM, y la card incluye una corrección para el parser de tool calling en vLLM.

Su relevancia radica en ofrecer una alternativa ligera y especializada en texto para desarrolladores que necesitan un modelo de lenguaje de alto rendimiento sin la sobrecarga de los componentes multimodales, especialmente en tareas de agentes, generación de código y razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone de lenguaje de Gemma 4) |
| Parametros totales | 7 518 069 034 (según safetensors); la model card indica ~4,2B |
| Parametros activos | no disponible |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma Terms of Use (gemma) |
| Formato de pesos | safetensors (compatible con transformers >= 4.40.0) |

## Arquitectura y entrenamiento

El modelo es una extracción del checkpoint **google/gemma-4-E4B-it**, un modelo multimodal de Google DeepMind que integra codificadores de visión y audio junto con un transformer de lenguaje. En esta versión, se han eliminado las proyecciones multimodales y los buffers asociados, dejando únicamente los parámetros del transformer de lenguaje (`model.language_model.*`). Según la model card, estos pesos son idénticos bit a bit a los del modelo original, por lo que no ha habido ningún entrenamiento adicional.

No se proporcionan detalles sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La única innovación técnica documentada es la propia extracción de modalidades y una corrección en el parser de tool calling de vLLM, referenciada en el issue [vllm-project/vllm#54256](https://github.com/vllm-project/vllm/issues/54256) y el pull request [vllm-project/vllm#54257](https://github.com/vllm-project/vllm/pull/54257).

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Gemma 4.
- Soporte de tool calling / function calling, con una corrección específica para el parser de vLLM que permite llamadas a herramientas con formato "bare call" y transiciones de canal sin espacios.
- Capacidad para tareas de agente y razonamiento multi-paso, gracias a la ventana de contexto de 131 072 tokens.
- Generación de código y asistencia en ingeniería de software, mencionada explícitamente en la model card como uno de los casos de uso previstos.
- Multilingüismo limitado: la card indica únicamente inglés (`language: en`).
- No incluye capacidades de visión ni audio, al haber sido eliminadas deliberadamente.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 131 072 tokens), lo que permite mantener el historial completo de una interacción sin truncamientos. Su naturaleza puramente textual reduce la latencia al eliminar el preprocesamiento multimodal.
- **Generación de código en producción**: con soporte de tool calling y una corrección específica para vLLM, puede integrarse en pipelines de CI/CD para autocompletar código, generar tests o documentar APIs. La ventana de contexto amplia permite incluir repositorios enteros como contexto.
- **Agentes autónomos**: su capacidad para razonar multi-paso y llamar herramientas lo hace adecuado para agentes que necesitan planificar, ejecutar acciones y reflexionar sobre los resultados, por ejemplo en automatización de tareas de oficina o navegación web.
- **Análisis de documentos largos**: con 131 072 tokens de contexto, puede resumir, extraer información o responder preguntas sobre documentos extensos (informes, artículos científicos, contratos) sin necesidad de dividirlos en fragmentos.
- **Asistente de programación en entornos con recursos limitados**: al eliminar los componentes multimodales, el modelo requiere menos VRAM que el original, lo que permite desplegarlo en GPUs de consumo como la RTX 4090 (24 GB) o incluso en configuraciones con 16 GB, dependiendo de la cuantización.
- **Fine-tuning especializado en texto**: al ser un backbone limpio sin proyecciones multimodales, es un punto de partida ideal para fine-tuning en tareas de NLP específicas (clasificación, extracción de entidades, generación estructurada) sin desperdiciar parámetros en módulos que no se van a utilizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se encontraron datos de rendimiento en la búsqueda web para esta variante específica. Se recomienda consultar la documentación del modelo base **google/gemma-4-E4B-it** para referencias de rendimiento, aunque los resultados no serán directamente comparables debido a la eliminación de las modalidades.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el checkpoint en `safetensors` ocupa 15,1 GB en el repositorio, lo que sugiere que en bfloat16 (2 bytes por parámetro) los 7,5 mil millones de parámetros requerirían aproximadamente 15 GB de VRAM. Sin embargo, si la cifra real de parámetros activos es ~4,2B como indica la model card, el requisito bajaría a unos 8,4 GB. No hay datos oficiales que resuelvan esta discrepancia.
- **GPU recomendadas**: para la cifra mayor, se necesitaría una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, L4). Para la cifra menor, una GPU de 8-12 GB (RTX 3080, RTX 4070) podría ser suficiente con cuantización.
- **Compatibilidad con GPU de consumo**: sí, es plausible en GPUs de gama alta (RTX 3090/4090) con cuantización a 8 bits o 4 bits, aunque no se proporcionan archivos GGUF ni cuantizaciones oficiales en el repositorio.
- **Opciones de despliegue**: vLLM (recomendado en la model card, con el comando `vllm serve`), así como cualquier framework compatible con transformers (Hugging Face). También podría usarse con TensorRT-LLM o llama.cpp si se generan los formatos adecuados, aunque no se incluyen en el repo.
- **Latencia y throughput**: no disponible. Dependerá del hardware y de la configuración de vLLM (por ejemplo, `--max-model-len`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidades | Disponibilidad |
|---|---|---|---|---|---|
| **Gemma-4-E4B-text-base** (este) | ~4,2B (card) / 7,5B (safetensors) | 131 072 | Gemma Terms | Solo texto | Hugging Face |
| **google/gemma-4-E4B-it** (original) | ~4,4B (según gemma4.dev) | 131 072 | Gemma Terms | Texto, visión, audio | Hugging Face |
| **google/gemma-4-E4B-it-assistant** | no disponible | no disponible | Gemma Terms | Multimodal | Hugging Face |
| **Llama 3.1 8B** (referencia) | 8B | 128 000 | Llama 3.1 Community | Solo texto | Hugging Face |

La comparativa se limita a parámetros, contexto y licencia, ya que no hay datos de rendimiento para esta variante. El modelo original multimodal es la referencia más cercana, pero esta extracción sacrifica las capacidades de visión y audio a cambio de un menor uso de VRAM y una inferencia más simple.

## Limitaciones y advertencias

- **Solo inglés**: la model card indica únicamente el idioma inglés. No se garantiza un rendimiento adecuado en otros idiomas, incluido el español.
- **Sin capacidades multimodales**: al eliminar las proyecciones de visión y audio, el modelo no puede procesar imágenes, vídeo ni audio. Cualquier tarea que requiera estas modalidades debe usar el modelo original.
- **Discrepancia en el número de parámetros**: la model card afirma ~4,2B, pero el archivo `safetensors` contiene 7,5B. Esta inconsistencia puede afectar a la planificación de recursos y no está aclarada por el autor.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento o generación de código. Se recomienda validación humana en aplicaciones críticas.
- **Restricciones de licencia**: la licencia Gemma Terms of Use de Google DeepMind impone condiciones de uso, incluyendo restricciones para ciertos usos comerciales y obligaciones de atribución. Es necesario revisar los términos completos antes de su uso en producción.
- **Soporte no oficial**: al ser un checkpoint creado por un tercero (no por Google), no hay garantía de mantenimiento, correcciones de seguridad ni actualizaciones. El autor no proporciona documentación adicional más allá de la model card.
- **Bugfix de vLLM pendiente de integración**: la corrección del parser de tool calling está en un pull request que puede no estar fusionado en todas las versiones de vLLM. Es necesario verificar la compatibilidad con la versión utilizada.

## Enlaces

- [Modelo en Hugging Face: wyattearp/Gemma-4-E4B-text-base](https://huggingface.co/wyattearp/Gemma-4-E4B-text-base)
- [Modelo original: google/gemma-4-E4B](https://huggingface.co/google/gemma-4-E4B)
- [Modelo original instruct: google/gemma-4-E4B-it-assistant](https://huggingface.co/google/gemma-4-E4B-it-assistant)
- [Página oficial de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Guía de Gemma 4 E4B en gemma4.dev](https://gemma4.dev/models/gemma-4-e4b)
- [Repositorio oficial de Gemma en GitHub](https://github.com/google-deepmind/gemma)
- [Issue de vLLM sobre el parser de Gemma 4](https://github.com/vllm-project/vllm/issues/54256)
- [Pull request de corrección en vLLM](https://github.com/vllm-project/vllm/pull/54257)
