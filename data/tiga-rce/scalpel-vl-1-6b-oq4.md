# TiGa-RCE/Scalpel-VL-1.6B-oQ4

## Resumen

Scalpel-VL-1.6B-oQ4 es una cuantización de 4 bits del modelo Scalpel-VL-1.6B, realizada con la herramienta oQ (oMLX v0.6.3rc3) y publicada por TiGa-RCE en agosto de 2026. El modelo base, desarrollado por freeai-org, es un modelo de visión y lenguaje (VLM) basado en la arquitectura Qwen3-VL, diseñado para ofrecer un equilibrio entre rendimiento y eficiencia en tareas multimodales. Según la información del autor, este modelo alcanza una velocidad de inferencia un 40% superior a la de Qwen3-VL-2B con una magnitud de parámetros similar, y su latencia de extremo a extremo es comparable a la de Qwen3.5-0.8B, un modelo denso con la mitad de parámetros.

La cuantización se presenta en formato MLX safetensors, orientada a dispositivos Apple Silicon, y utiliza cuantización de precisión mixta con 4 bits y grupo de tamaño 64. El repositorio no proporciona información sobre licencia, idiomas, contexto ni otros detalles del modelo original, por lo que esta ficha se limita a los datos disponibles en la página de HuggingFace y en los resultados de búsqueda. Aunque el nombre del modelo sugiere 1.6 mil millones de parámetros, el recuento real de parámetros en los safetensors es de 614.979.328 (aproximadamente 614 millones), lo que podría indicar una discrepancia en la nomenclatura o una variante reducida del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_vl (modelo multimodal de visión y lenguaje) |
| Parámetros totales | 614.979.328 (según safetensors) |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (oQ, grupo de 64, precisión mixta) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo es qwen3_vl, es decir, un modelo de visión y lenguaje basado en la familia Qwen3-VL. No se dispone de información sobre el entrenamiento del modelo original (Scalpel-VL-1.6B): no se conocen los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO. La cuantización se realizó con oQ (oMLX), una herramienta de cuantización de precisión mixta para el ecosistema MLX, que optimiza los pesos para reducir el tamaño y acelerar la inferencia en hardware Apple. El modelo se presenta únicamente en formato cuantizado, sin referencia a una versión sin cuantizar.

## Capacidades

- Modelo multimodal: al ser un qwen3_vl, es capaz de procesar entradas de texto e imágenes (visión y lenguaje).
- Generación de texto: puede generar respuestas textuales basadas en instrucciones y contenido visual.
- Razonamiento: según la documentación de freeai-org, el modelo establece un rendimiento de última generación en predicción y latencia dentro de su escala de parámetros, lo que sugiere buenas capacidades de razonamiento y comprensión.
- Velocidad de inferencia: el autor indica que es un 40% más rápido que Qwen3-VL-2B y comparable en latencia a Qwen3.5-0.8B, lo que lo hace adecuado para despliegues en tiempo real.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-step, ni capacidades especiales como thinking mode o audio.

## Casos de uso

- Asistencia visual en tiempo real: por su tamaño reducido y baja latencia, puede integrarse en aplicaciones móviles o de escritorio en Apple Silicon para responder preguntas sobre imágenes captadas en vivo.
- Automatización de descripciones de imágenes: generar pies de foto o descripciones alternativas para accesibilidad en plataformas de contenido.
- Clasificación y etiquetado de imágenes en flujos de datos: procesar lotes de imágenes para extraer información o categorizarlas, aprovechando su velocidad.
- Chat con contexto visual: como asistente conversacional que puede recibir imágenes y mantener diálogos sobre ellas, aunque se desconoce su longitud de contexto exacta.
- Educación interactiva: herramientas de aprendizaje que expliquen diagramas, fotografías o esquemas a estudiantes en tiempo real.
- Prototipos de visión por computador: para validar ideas de proyectos de VLM en entornos con recursos limitados, antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los datos sobre velocidad (40% más rápido que Qwen3-VL-2B, latencia comparable a Qwen3.5-0.8B) provienen de la afirmación del autor en el modelo original, pero no se incluyen métricas numéricas de tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Al ser MLX, el modelo está diseñado para ejecutarse en Apple Silicon (M1, M2, M3, M4, etc.).
- No se dispone de cifras exactas de VRAM para este modelo cuantizado, pero al tener 614 millones de parámetros en 4 bits, el tamaño de los pesos es aproximadamente 1,6 GB, por lo que puede caber en memoria unificada de cualquier Mac con al menos 8 GB.
- No se requiere GPU NVIDIA ni CUDA; la inferencia se realiza mediante el framework MLX.
- Opciones de despliegue: exclusivamente en el ecosistema MLX (por ejemplo, con mlx-lm o aplicaciones que usen MLX). No hay soporte para vLLM, llama.cpp u Ollama en este formato.
- Latencia y throughput: no se han publicado datos numéricos, pero se afirma que la latencia es comparable a Qwen3.5-0.8B, lo que sugiere una respuesta rápida en tareas simples.

## Comparativa con modelos similares

No se dispone de una comparación directa con otros modelos en la información proporcionada. El modelo original Scalpel-VL-1.6B se menciona como superior en velocidad y rendimiento a Qwen3-VL-2B y con latencia similar a Qwen3.5-0.8B, pero no hay datos de benchmarks para confirmar estas afirmaciones. No se conocen otros modelos de la misma categoría (VLM pequeños cuantizados para MLX) con los que comparar.

## Limitaciones y advertencias

- La cuantización de 4 bits puede implicar una pérdida de precisión en tareas complejas de razonamiento o comprensión visual en comparación con el modelo original sin cuantizar.
- No se ha publicado información sobre la licencia del modelo; por tanto, no se puede confirmar si es apto para uso comercial. Se recomienda contactar con el autor antes de usarlo en producción.
- No hay datos sobre idiomas soportados, por lo que se desconoce si el modelo funciona bien en español u otros idiomas distintos del inglés.
- El modelo está limitado al ecosistema MLX, por lo que no puede desplegarse en entornos que requieran otros frameworks (vLLM, TGI, etc.).
- La discrepancia entre el nombre (1.6B) y el número de parámetros (614M) puede indicar que el modelo no es el original, o que el nombre se refiere a una variante distinta; se recomienda verificar antes de utilizarlo.
- No se dispone de información sobre sesgos, alucinaciones o riesgos específicos del modelo original.

## Enlaces

- [HuggingFace del modelo cuantizado](https://huggingface.co/TiGa-RCE/Scalpel-VL-1.6B-oQ4)
- [HuggingFace del modelo original - freeai-org/Scalpel-VL-1.6B](https://huggingface.co/freeai-org/Scalpel-VL-1.6B)
- [Perfil del autor TiGa-RCE](https://huggingface.co/TiGa-RCE)
- [Repositorio oQ (oMLX)](https://github.com/jundot/omlx)
