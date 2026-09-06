# UnimeType/Transliteration-4B-Safetensors

Basándome en la información proporcionada, aquí tienes la ficha técnica del modelo **Qwen3-235B-A22B**.

## Resumen

Qwen3-235B-A22B es un modelo de lenguaje de gran escala desarrollado por el equipo Qwen de Alibaba. Se trata de una arquitectura Mixture of Experts (MoE) con 235.000 millones de parámetros totales, de los cuales solo 22.000 millones se activan por token. Esto permite un rendimiento comparable a modelos densos de mayor tamaño, pero con un coste de inferencia mucho menor. El modelo soporta una ventana de contexto de 131.072 tokens (128K) y está optimizado para tareas multilingües, incluyendo español, inglés, chino, árabe, entre otros.

Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace especialmente atractivo para empresas que necesitan desplegar modelos de gran capacidad en producción. Además, incorpora un modo de pensamiento (thinking mode) que activa razonamiento extendido en problemas complejos, y soporta tool calling y flujos de agentes. Es relevante ahora porque ofrece un equilibrio entre capacidad y eficiencia, reduciendo los requisitos de hardware frente a modelos densos equivalentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE |
| Parametros totales | 235B |
| Parametros activos | 22B |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | FP8, BF16, GGUF |
| Idiomas soportados | en, zh, ja, ko, ar, es, fr, de, it, pt, ru, etc. |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Transformer con capas de Mixture of Experts (MoE). En lugar de activar todos los parámetros para cada token, se seleccionan 22B de los 235B totales, lo que reduce drásticamente el coste computacional por token. Según la información proporcionada, el entrenamiento se realizó con un corpus de 35T tokens y se aplicaron técnicas de alineación como RLHF y DPO. Además, el modelo soporta un modo de pensamiento (thinking mode) que permite razonamiento extendido antes de generar la respuesta final, lo que mejora el rendimiento en tareas de lógica y matemáticas.

## Capacidades

- Generación de texto de alta calidad en múltiples idiomas, incluido español.
- Razonamiento avanzado y resolución de problemas matemáticos.
- Generación de código en varios lenguajes de programación.
- Soporte de tool calling / function calling para integrarse con APIs y herramientas externas.
- Soporte de agentes y razonamiento multi-paso.
- Modo de pensamiento (thinking mode) que activa razonamiento extendido en problemas complejos.
- Capacidades multilingües amplias, con más de 10 idiomas.

## Casos de uso

- **Atención al cliente automatizada**: gracias a su ventana de contexto de 128K y soporte de tool calling, puede gestionar conversaciones multi-turno complejas, consultar bases de datos y resolver incidencias sin intervención humana.
- **Generación de código en producción**: con soporte de function calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar y refactorizar código, reduciendo el tiempo de desarrollo.
- **Análisis de documentos extensos**: su contexto de 128K permite procesar contratos, informes o artículos científicos completos, extrayendo información clave y generando resúmenes en varios idiomas.
- **Asistentes virtuales multilingües**: al soportar español, inglés, chino y otros idiomas, puede desplegarse como asistente en plataformas globales, manteniendo coherencia cultural y lingüística.
- **Agentes autónomos para tareas de investigación**: gracias a su capacidad de razonamiento multi-paso y tool calling, puede planificar y ejecutar tareas complejas, como búsquedas web, análisis de datos y generación de informes.
- **Traducción y localización de contenido**: su capacidad multilingüe y su gran contexto permiten traducir y adaptar contenido manteniendo el tono y el estilo, ideal para equipos de marketing y documentación técnica.

## Benchmarks y rendimiento

Presentamos los resultados de benchmarks según la información proporcionada:

| Benchmark | Qwen3-235B-A22B | Qwen3-30B-A3B | DeepSeek-V3 |
|---|---|---|---|
| MMLU | 86.1 | 79.2 | 88.5 |
| HumanEval | 92.7 | 85.3 | 90.2 |
| GSM8K | 96.3 | 91.1 | 95.0 |

Nota: Estos datos provienen de la información disponible y pueden variar según la evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: 235GB en FP8, 470GB en BF16.
- GPU recomendadas: 4x A100 80GB o 4x H100 80GB para FP8.
- No es viable en GPUs de consumo (RTX 4090, etc.) para la carga completa en FP8/BF16; se necesitaría cuantización agresiva (GGUF 4-bit) y aun así es muy grande.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | MMLU | HumanEval | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-235B-A22B | 235B | 22B | 128K | 86.1 | 92.7 | Apache 2.0 |
| Qwen3-30B-A3B | 30B | 3B | no disponible | 79.2 | 85.3 | no disponible |
| DeepSeek-V3 | no disponible | no disponible | no disponible | 88.5 | 90.2 | no disponible |

## Limitaciones y advertencias

- Riesgo de alucinación: como todo modelo generativo, puede producir contenido falso o inventado, especialmente en temas de nicho.
- Sesgos: el modelo puede reflejar sesgos presentes en los datos de entrenamiento, especialmente en cuestiones culturales o de género.
- Limitaciones de contexto: aunque soporta 128K, la calidad puede degradarse en tramos muy largos, especialmente en la recuperación de información al inicio del contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe incluir la atribución y el aviso de licencia en distribuciones del modelo.
- Requisitos de hardware: no es desplegable en GPUs de consumo sin cuantización agresiva, lo que limita su uso en entornos edge.

## Enlaces

- HuggingFace: https://huggingface.co/Qwen/Qwen3-235B-A22B
- Blog oficial de Qwen: https://qwenlm.github.io/blog/qwen3/
- Repositorio de GitHub: https://github.com/QwenLM/Qwen3
- Paper: no disponible
