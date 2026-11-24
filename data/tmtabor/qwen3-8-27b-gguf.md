# tmtabor/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es una versión cuantizada en formato GGUF de un modelo multimodal (vision-language) de la familia Qwen, publicada por el usuario tmtabor en Hugging Face. El repositorio contiene los pesos convertidos y un adaptador de proyección visual (`mmproj`) para su uso con llama.cpp, lo que permite ejecutar tanto inferencia de texto como multimodal mediante `llama-cli` y `llama-mtmd-cli`. El modelo cuenta con 27.320.697.856 parámetros totales según los datos de safetensors y ocupa 17,9 GB en el repositorio.

La ficha se basa exclusivamente en la información disponible en la model card y en los metadatos de Hugging Face. La model card es extremadamente escueta: no especifica arquitectura interna, datos de entrenamiento, idiomas, licencia ni benchmarks. El nombre sugiere una variante de la familia Qwen3 con capacidades de visión, pero no se confirma en la documentación proporcionada. La etiqueta `qwen3_5` y el tag `vision-language-model` apuntan a una arquitectura transformer multimodal, aunque este extremo no está verificado en la información disponible.

El interés del modelo radica en su disponibilidad en GGUF, formato que facilita el despliegue local con llama.cpp y herramientas compatibles, incluyendo el soporte multimodal mediante el archivo `mmproj`. No obstante, la ausencia de documentación técnica, licencia explícita y benchmarks limita su evaluación rigurosa para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), según tags; detalles internos no disponibles |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M y BF16 (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors como referencia de parámetros) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Los tags (`qwen3_5`, `vision-language-model`) y la presencia de un archivo `mmproj` indican que se trata de un modelo multimodal con un proyector visual que permite procesar imágenes junto con texto. El modelo fue ajustado (finetuned) y convertido a GGUF utilizando Unsloth, según declara la model card, lo que sugiere un proceso de fine-tuning sobre una base Qwen3 y una conversión posterior al formato GGUF para inferencia con llama.cpp.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional, según el tag `conversational`.
- Procesamiento multimodal (visión-lenguaje): el archivo `Qwen3.8-27B.BF16-mmproj.gguf` habilita entrada de imágenes mediante `llama-mtmd-cli`.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integración con infraestructura de despliegue.
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con `llama-cli -hf tmtabor/Qwen3.8-27B-GGUF --jinja` para mantener conversaciones multi-turno en entornos sin conexión, gracias a su formato GGUF y compatibilidad con llama.cpp.
- Análisis de imágenes con descripción textual: mediante `llama-mtmd-cli` y el proyector `mmproj`, puede emplearse para tareas de image captioning, respuesta a preguntas sobre imágenes o extracción de información visual en pipelines locales.
- Prototipado de aplicaciones multimodales: el par de archivos GGUF (modelo + mmproj) permite integrar visión y lenguaje en herramientas de escritorio o servidores sin GPU de datacenter, al estar cuantizado en Q4_K_M.
- Evaluación de modelos Qwen3 en formato GGUF: útil para investigadores que quieran comparar el comportamiento de esta variante frente a otras cuantizaciones o modelos de la familia Qwen3.
- Despliegue en entornos con recursos limitados: la cuantización Q4_K_M reduce el peso del modelo respecto a BF16, facilitando su ejecución en hardware de consumo.
- Integración en herramientas compatibles con endpoints: el tag `endpoints_compatible` sugiere su uso en servicios que expongan una API compatible con OpenAI u otros formatos, aunque no se detalla en la documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 27,3 mil millones de parámetros en Q4_K_M suele requerir del orden de 16-18 GB de VRAM, y en BF16 alrededor de 54 GB; estos valores son estimaciones generales y no están confirmados para este modelo concreto.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar compatibilidad con GPUs de 24 GB (RTX 3090/4090) en Q4_K_M, y con A100/H100 para BF16, pero no está verificado.
- ¿Cabe en GPU de consumo? Probablemente en Q4_K_M en GPUs de 24 GB, aunque no se confirma en la documentación.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por extensión herramientas compatibles con GGUF como Ollama o servidores basados en llama.cpp. vLLM y TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base Qwen3 antes de cualquier uso en producción.
- No se documentan sesgos conocidos, pero al ser un modelo de lenguaje entrenado con datos web, es probable que herede sesgos presentes en dichos datos; no confirmado.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas.
- No se especifican idiomas soportados ni longitud de contexto, lo que limita la planificación de aplicaciones que requieran contexto largo o multilingüismo.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente (2026-11-24), por lo que no hay evidencia de uso comunitario ni validación externa.
- El autor es un usuario individual (tmtabor), no el equipo oficial de Qwen; la calidad del fine-tuning y de la conversión no está avalada por el desarrollador original.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a BF16; para tareas sensibles conviene evaluar el impacto.
- No se dispone de información sobre el proceso de entrenamiento ni de evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/tmtabor/Qwen3.8-27B-GGUF
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia GGUF): no se proporciona enlace directo en la información, pero es el runtime referenciado en la model card.
