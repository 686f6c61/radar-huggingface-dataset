# vonvonhero/Ornith-1.5-9B-Uncensored-OpenVINO-INT8

## Resumen

El modelo `vonvonhero/Ornith-1.5-9B-Uncensored-OpenVINO-INT8` es una conversión a formato OpenVINO IR con cuantización INT8 de la variante "uncensored" (sin censura) del modelo `ornith-ai/Ornith-1.5-9B`. Este modelo base pertenece a la familia Ornith, desarrollada por ornith-ai, que se centra en la auto-mejora y el auto-scaffolding para tareas agénticas. La variante original incorpora un bucle de auto-mejora en el que el modelo propone nuevas tareas, genera scaffolds específicos y produce rollouts de soluciones para aprendizaje por refuerzo.

La versión uncensored elimina el comportamiento de rechazo entrenado en el modelo base, que a su vez es una versión reforzada en seguridad sobre el modelo Qwen3.5-9B. Esta conversión OpenVINO INT8 está pensada para su despliegue eficiente en hardware Intel (CPU y GPU) mediante la librería OpenVINO GenAI, manteniendo la capacidad de procesamiento de imágenes y texto (image-text-to-text) del modelo original. Es relevante para desarrolladores que necesitan un modelo de razonamiento sin restricciones de seguridad en entornos de inferencia optimizados para Intel, así como para investigadores que trabajan en evaluación de seguridad y alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 vision-language (exportado a OpenVINO IR) |
| Parametros totales | 9B (según el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT8) |

## Arquitectura y entrenamiento

El modelo base `Ornith-1.5-9B` se construye sobre la arquitectura Qwen3.5-9B, un transformer multimodal que procesa tanto imágenes como texto. La innovación principal de Ornith-1.5 reside en su bucle de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones que se utilizan para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje. La variante uncensored es una ablación que elimina el comportamiento de rechazo entrenado en el modelo base, que según la documentación es notablemente más fuerte en seguridad que el Qwen3.5-9B original. La conversión a OpenVINO INT8 se realizó exportando el modelo como un modelo de lenguaje y visión Qwen3.5, manteniendo la capacidad de generación solo-texto.

## Capacidades

- Generación de texto y razonamiento multimodal (image-text-to-text), aunque la validación publicada solo cubre generación de texto.
- Razonamiento avanzado (etiquetado como "reasoning").
- Capacidad de auto-mejora y auto-scaffolding para tareas agénticas, heredada del modelo base Ornith-1.5.
- Conversación multi-turno (etiquetado como "conversational").
- Ausencia de comportamiento de rechazo (uncensored), lo que permite respuestas sin filtros de seguridad.
- Inferencia optimizada para hardware Intel mediante OpenVINO GenAI.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo puede utilizarse para probar la robustez de otros sistemas de IA generando prompts adversariales sin restricciones, gracias a su alta tasa de respuesta (ASR) en benchmarks como JailbreakBench y HarmBench.
- Investigación en alineación de modelos: permite estudiar el comportamiento de un modelo sin entrenamiento de rechazo, comparándolo con versiones alineadas para entender los efectos de la seguridad en el rendimiento.
- Agentes autónomos en entornos Intel: su capacidad de auto-scaffolding y auto-mejora lo hace adecuado para pipelines agénticos que requieren proponer y resolver tareas de forma autónoma, desplegados en servidores con CPUs o GPUs Intel.
- Prototipado rápido de aplicaciones de generación de texto sin censura: ideal para entornos de desarrollo donde se necesita explorar contenido creativo o técnico sin restricciones de política de contenido.
- Razonamiento multimodal en edge devices: al estar cuantizado en INT8 y optimizado para OpenVINO, puede ejecutarse en dispositivos Intel de bajo consumo para tareas de visión-lenguaje, como descripción de imágenes o respuesta a preguntas visuales.
- Fine-tuning o destilación: al ser una versión sin rechazo, puede servir como punto de partida para fine-tuning en dominios específicos donde se requiere máxima libertad de generación, o para destilar conocimiento en modelos más pequeños.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación específicos para esta conversión OpenVINO INT8. Se utilizó el clasificador `HarmBench-Llama-2-13b-cls` con razonamiento desactivado, temperatura 0, seed 42 y un límite de 256 tokens de salida. Una tasa de ataque exitoso (ASR) más alta indica menos rechazos.

| Benchmark | Resultado |
|---|---|
| JailbreakBench ASR | 94/100 (94.0%) |
| HarmBench ASR (159 comportamientos estándar) | 150/159 (94.3%) |
| Tamaño del modelo | 8.9 GiB |

No se han publicado resultados de benchmarks de rendimiento clásicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 9.5 GB; tamaño del modelo en INT8: 8.9 GiB.
- Requiere OpenVINO 2026.3.x y OpenVINO GenAI 2026.3.x.
- Validado para generación de texto en CPU Intel y GPU Intel (Intel Arc, integradas) con OpenVINO GenAI 2026.3.1.
- Al ser INT8 y de 9B, puede ejecutarse en GPUs de consumo con al menos 8-10 GB de VRAM, aunque la validación oficial se realizó en hardware Intel.
- Opciones de despliegue: uso directo mediante `openvino_genai.VLMPipeline` en Python. No se menciona soporte para vLLM, llama.cpp u Ollama en esta conversión específica, aunque existen versiones GGUF del mismo modelo uncensored para otros runtimes.
- La latencia y el throughput no están especificados en la documentación proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Seguridad / Rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-Uncensored-OpenVINO-INT8 (este) | OpenVINO INT8 | 9B | Sin rechazo (0/23 en pruebas adversariales) | MIT | Hugging Face |
| Ornith-1.5-9B (original) | Pytorch (presumiblemente) | 9B | Con rechazo (más fuerte que Qwen3.5-9B) | MIT | Hugging Face |
| Qwen3.5-9B (upstream) | Pytorch | 9B | Con rechazo estándar | Apache 2.0 (presumiblemente) | Hugging Face |
| Ornith-1.5-9B-Uncensored-GGUF | GGUF | 9B | Sin rechazo | MIT | Hugging Face |

Según la información de FriendliAI, la variante uncensored registró 0/23 rechazos en pruebas adversariales automatizadas, frente a 20/23 para la receta "straight-across" (con embedding) en la misma capa y α. Esto confirma la eliminación efectiva del comportamiento de rechazo.

## Limitaciones y advertencias

- Modelo sin censura: al eliminar el comportamiento de rechazo, existe un riesgo alto de generar contenido dañino, ilegal, violento o sexualmente explícito. No debe desplegarse en producción sin salvaguardas externas.
- Sesgos conocidos: al ser una ablación de un modelo base, puede heredar sesgos del conjunto de datos de entrenamiento original, aunque no se documentan específicamente.
- Riesgo de alucinación: no se han publicado métricas de precisión factual; al ser un modelo de razonamiento sin alineación, el riesgo de alucinación puede ser elevado.
- Limitaciones de contexto: la longitud de contexto no está especificada en la documentación, por lo que se desconoce su capacidad para tareas de contexto largo.
- Restricciones de despliegue: requiere versiones específicas de OpenVINO (2026.3.x) y OpenVINO GenAI. La validación oficial solo cubre generación de texto en CPU y GPU Intel; el pipeline multimodal (VLMPipeline) no ha sido validado públicamente para entrada de imágenes.
- Idiomas: no se especifican los idiomas soportados, aunque el ejemplo de uso incluye japonés, lo que sugiere soporte multilingüe del modelo base Qwen3.5.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/vonvonhero/Ornith-1.5-9B-Uncensored-OpenVINO-INT8
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Blog oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Versión GGUF del mismo modelo (vonvonhero): https://huggingface.co/vonvonhero/Ornith-1.5-9B-Uncensored-GGUF
- Versión GGUF alternativa (mradermacher): https://huggingface.co/mradermacher/Ornith-1.5-9B-uncensored-GGUF
- Página del modelo en FriendliAI: https://friendli.ai/models/bowmanslayer/Ornith-1.5-9B-Uncensored
