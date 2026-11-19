# Umit432/gemma-2-2b-laravel-merged

## Resumen

Gemma 2 2B Laravel Expert (merged) es un ajuste fino especializado del modelo Gemma 2 2B IT de Google, desarrollado por el usuario Umit432 y orientado al desarrollo web con PHP y el framework Laravel. El modelo se ha entrenado con Unsloth sobre datasets especializados en programación para responder preguntas técnicas, escribir controladores, modelos, rutas y migraciones de Laravel. Es un modelo ligero de unos 2,6 mil millones de parámetros, distribuido como modelo completo fusionado (merged) en 16 bits, lo que lo hace fácilmente desplegable sin necesidad de gestionar adaptadores LoRA.

Su relevancia radica en la tendencia de crear modelos pequeños y especializados por dominio: en lugar de usar un modelo generalista de gran tamaño, este fine-tuning ofrece un asistente de código Laravel que puede ejecutarse en hardware de consumo o incluso localmente en un portátil, con costes de inferencia mínimos. Es útil para desarrolladores que necesitan autocompletado, generación de boilerplate de Laravel o consultas técnicas rápidas sin depender de servicios en la nube.

Al tratarse de un proyecto comunitario sin model card detallada, buena parte de la documentación técnica (datos de entrenamiento exactos, benchmarks, evaluaciones) no está disponible públicamente, algo que conviene tener en cuenta antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador (familia Gemma 2) |
| Parámetros totales | 2.614.341.888 (~2,61 B) |
| Parámetros activos | no disponible (no es MoE; arquitectura densa) |
| Longitud de contexto | no disponible (el modelo base Gemma 2 2B soporta 8.192 tokens) |
| Tipos de cuantización | 16 bits (versión merged); existe variante GGUF en el mismo repositorio del autor |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google con términos de uso propios) |
| Formato de pesos | safetensors (tamaño del repo: 5,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 2 2B IT, la versión instruida del modelo abierto de Google basada en una arquitectura transformer decodificador con mejoras como ventanas deslizantes de atención alternadas con atención global y normalización por RMSNorm. Sobre esta base se aplicó un fine-tuning con la librería Unsloth, que permite entrenar de forma eficiente en memoria y tiempo, aparentemente mediante LoRA (existe una variante del autor llamada gemma-2-2b-laravel-lora) que después se fusionó con los pesos base para obtener este modelo merged en 16 bits.

Los datos de entrenamiento concretos (número de tokens, composición exacta del dataset, uso de RLHF o DPO) no están disponibles en la información publicada. La model card indica únicamente que se emplearon datasets especializados en programación PHP y Laravel, con el objetivo de generar controladores, modelos Eloquent, definiciones de rutas y migraciones.

## Capacidades

- Generación de código PHP orientado al framework Laravel: controladores, modelos, rutas y migraciones.
- Respuesta a preguntas técnicas sobre Laravel y desarrollo web en PHP (modelo conversacional).
- Generación de texto general heredada del modelo base Gemma 2 2B IT (instrucciones, razonamiento básico).
- Compatibilidad con la librería transformers de Hugging Face y con text-generation-inference.
- Existe una variante GGUF del mismo autor, lo que permite inferencia local con llama.cpp, Ollama o LM Studio.
- Soporte de tool calling, agentes o capacidades multimodales: no disponible (no documentado).

## Casos de uso

- **Generación de boilerplate de Laravel:** crear controladores, modelos Eloquent, rutas y migraciones a partir de descripciones en lenguaje natural, ahorrando tiempo en tareas repetitivas de andamiaje.
- **Asistente técnico local para Laravel:** integrarlo en un editor como copiloto offline especializado en PHP/Laravel, ejecutándose en una GPU de consumo gracias a sus 2,6 B de parámetros.
- **Chatbot de documentación interna:** adaptarlo vía prompt para responder dudas del equipo sobre convenciones y patrones de Laravel en proyectos propios.
- **Prototipado rápido de APIs:** generar esqueletos de endpoints REST con rutas, controladores y validaciones iniciales que el desarrollador refina después.
- **Formación y aprendizaje:** usarlo como tutor conversacional para desarrolladores junior que aprenden Laravel, explicando conceptos y generando ejemplos.
- **Revisión y refactorización de código PHP:** proponer mejoras o reescrituras de fragmentos de código Laravel en flujos de trabajo de desarrollo.
- **Automatización en CI/CD ligera:** generar migraciones o factories a partir de especificaciones en pipelines internas, dada su baja huella de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** aproximadamente 5,3 GB en FP16 (tamaño del repo de safetensors); en cuantización de 4 bits la cifra baja a alrededor de 1,6–2 GB.
- **GPUs recomendadas:** cualquier GPU moderna con 6–8 GB de VRAM es suficiente para FP16; para la variante GGUF en 4 bits, incluso GPUs integradas o portátiles con 4 GB de VRAM.
- **Consumer GPUs:** cabe cómodamente en una RTX 3060 de 12 GB, RTX 4060 o RTX 4090 en 16 bits, e incluso en GPUs de gama baja con cuantización GGUF.
- **Opciones de despliegue:** transformers de Hugging Face, text-generation-inference (TGI), vLLM y, mediante la variante GGUF del mismo autor, llama.cpp, Ollama y LM Studio.
- **Latencia y throughput:** no disponible; al ser un modelo de 2,6 B, se espera inferencia rápida en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Especialidad | Formato | Licencia |
|---|---|---|---|---|
| Umit432/gemma-2-2b-laravel-merged | 2,61 B | PHP / Laravel | safetensors (FP16), GGUF | Gemma |
| unsloth/gemma-2-2b-it (base) | 2,61 B | Generalista instruido | safetensors, GGUF | Gemma |
| Qwen2.5-Coder-1.5B / 7B | 1,5–7,2 B | Código multi-lenguaje | safetensors, GGUF | Apache 2.0 / Qwen |

Frente al modelo base, esta versión aporta conocimiento específico de Laravel a costa de posible degradación en tareas generales. Frente a alternativas como Qwen2.5-Coder, la ventaja es la especialización en el ecosistema Laravel y la ligereza; la desventaja es la falta de benchmarks publicados y una licencia (Gemma) con más restricciones que Apache 2.0.

## Limitaciones y advertencias

- **Falta de documentación y evaluación:** no hay benchmarks, ni detalles del dataset de entrenamiento, ni evaluaciones de calidad publicadas; el modelo tiene 0 descargas registradas, lo que sugiere ausencia de validación comunitaria.
- **Riesgo de alucinación:** como todo modelo de código pequeño, puede generar APIs de Laravel inexistentes o desactualizadas; el código generado debe revisarse siempre.
- **Sesgos:** hereda los sesgos del modelo base Gemma 2 y de los datasets de código usados en el fine-tuning (no disponibles para auditoría).
- **Idiomas:** no se documentan los idiomas soportados; el modelo base Gemma 2 2B cubre principalmente inglés, por lo que las consultas en castellano pueden tener peor calidad.
- **Licencia Gemma:** el uso está sujeto a los términos de la licencia Gemma de Google, que incluye restricciones de uso comercial y políticas de uso aceptable; no es una licencia permisiva tipo MIT o Apache.
- **Contexto:** al ser un modelo pequeño con ventana limitada (8.192 tokens en el modelo base), puede tener dificultades con archivos o proyectos grandes.
- **Producción:** dada la ausencia de evaluación pública, se recomienda prueba exhaustiva antes de cualquier despliegue en producción.

## Enlaces

- Modelo merged (esta ficha): https://huggingface.co/Umit432/gemma-2-2b-laravel-merged
- Variante LoRA del mismo autor: https://huggingface.co/Umit432/gemma-2-2b-laravel-lora
- Variante GGUF del mismo autor: https://huggingface.co/Umit432/gemma-2-2b-laravel-GGUF
- Modelo base: https://huggingface.co/unsloth/gemma-2-2b-it
- Paper de Gemma 2: https://arxiv.org/abs/2408.00118
- Librería Unsloth: https://github.com/unslothai/unsloth
