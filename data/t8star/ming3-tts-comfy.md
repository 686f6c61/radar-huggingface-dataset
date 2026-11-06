# t8star/Ming3-TTS-Comfy

## Resumen

Ming3-TTS-Comfy es un paquete de pesos y componentes auxiliares para ejecutar el modelo de síntesis de voz Ming 3.0 TTS (variante tiny) dentro de ComfyUI, empaquetado por el usuario t8star. No se trata de un modelo entrenado desde cero, sino de una distribución que reúne los pesos INT8 ConvRot del modelo base inclusionAI/Ming-3.0-tts-tiny, junto con el reconocedor Confucius4-R2T2 (usado para clonación de voz en lugar de Whisper), un detector de actividad de voz FireRedVAD y componentes nativos Windows/CUDA. Está pensado para flujos de trabajo de text-to-speech y clonación de voz completamente locales dentro del ecosistema ComfyUI.

El interés de este repositorio radica en que ofrece un camino de despliegue reproducible y verificable (con manifest.json y SHA256SUMS) para un modelo TTS multilingüe de aproximadamente 1.720 millones de parámetros, sin depender de servicios de inferencia remotos. Los pesos se conservan en el formato INT8 ConvRot original del upstream, sin recuantizar, y el repositorio no incluye los shards BF16 completos ni un runtime de Python.

Es relevante ahora porque facilita a desarrolladores e investigadores probar TTS con clonación de voz en local sobre ComfyUI, con soporte declarado para siete idiomas (chino, inglés, alemán, español, francés, coreano y japonés) y componentes precompilados para Windows x64 con Python 3.10/3.12 y CUDA 12.8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; pesos INT8 ConvRot del upstream Ming-3.0-tts-tiny) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ConvRot, formato original sin recuantizar); reconocedor Confucius4-R2T2 en Q8 |
| Idiomas soportados | zh, en, de, es, fr, ko, ja |
| Licencia | component-specific-licenses (Ming bajo MIT según la model card; Confucius con licencia propia) |
| Formato de pesos | safetensors/ONNX/GGUF según componentes; pesos principales INT8 ConvRot (~9,07 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo Ming-3.0-tts-tiny (tipo de backbone, mecanismo de atención o diseño del decoder acústico). Lo que sí se documenta es el empaquetado: los pesos principales se distribuyen en `Ming-Comfy-INT8/checkpoints/` en formato INT8 ConvRot, aproximadamente 9,07 GB, preservando la cuantización del upstream sin recuantizar. El repositorio incluye además los ficheros oficiales de configuración, tokenizer y auxiliares CAMPPlus del modelo base.

El pipeline de clonación de voz no utiliza Whisper: emplea Confucius4-R2T2 como reconocedor (modelo Q8 más proyector) junto con FireRedVAD para la detección de actividad de voz. Los kernels de Ming cubren las arquitecturas SM 80/86/89/90/100/120; la librería CUDA de Confucius está compilada para SM 120 y, en otras GPU, recurre a la ruta nativa de CPU. No se han publicado en la información disponible datos sobre volumen de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de texto a voz (text-to-speech) como tarea principal del pipeline.
- Clonación de voz mediante el reconocedor Confucius4-R2T2 y FireRedVAD.
- Soporte multilingüe declarado para chino, inglés, alemán, español, francés, coreano y japonés.
- Integración nativa con ComfyUI mediante nodos y un flujo de trabajo local.
- Ejecución completamente local, sin servicios de inferencia remotos.
- Verificación de integridad de pesos mediante manifest.json y SHA256SUMS.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible (no es un modelo de propósito general).
- Capacidades de visión o audio de entrada más allá del pipeline TTS: no disponible.

## Casos de uso

- Doblaje y localización de vídeo: el modelo permite generar voces en siete idiomas, lo que facilita producir pistas de audio dobladas para contenido multiplataforma sin salir de ComfyUI.
- Clonación de voz para audiolibros y narración: con Confucius4-R2T2 y FireRedVAD se puede registrar una muestra de voz y sintetizar narraciones largas manteniendo el timbre del hablante.
- Prototipado de asistentes conversacionales: integrado en ComfyUI, sirve para construir demos de agentes de voz que respondan en varios idiomas antes de pasar a producción.
- Generación de voces para vídeos cortos y contenido para redes: el flujo local permite iterar rápido sobre guiones y estilos de voz sin depender de APIs externas.
- Accesibilidad: convertir texto en audio para lectores de pantalla o contenido educativo en español, inglés, francés y otros idiomas soportados.
- Investigación en TTS y clonación de voz: al conservar los pesos INT8 ConvRot originales y ofrecer componentes verificables, es útil para reproducir experimentos y comparar pipelines de reconocimiento (Confucius frente a Whisper).
- Pruebas de integración en pipelines ComfyUI: validar nodos personalizados, kernels CUDA y rutas de CPU en distintas GPU antes de desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; los pesos principales INT8 ocupan unos 9,07 GB, por lo que se requiere al menos esa cantidad de memoria para cargarlos, más overhead de activaciones y del reconocedor.
- GPU recomendadas: no disponible. Los kernels de Ming cubren SM 80/86/89/90/100/120 (A100, RTX 30xx/40xx, H100 y arquitecturas posteriores compatibles).
- Confucius4-R2T2: la librería CUDA está compilada para SM 120; en otras GPU se usa la ruta nativa de CPU, lo que puede aumentar la latencia del proceso de clonación.
- Cabe en GPU consumer: no confirmado; por el tamaño de pesos INT8, encajaría en GPUs con 12-16 GB o más, pero no hay validación oficial en la información disponible.
- Opciones de despliegue: ComfyUI con los nodos del repositorio GitHub del autor; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (el modelo no es un LLM).
- Entorno validado: Windows x64, Python 3.10/3.12 y CUDA 12.8 con componentes precompilados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ming3-TTS-Comfy (este) | 1.720.574.976 | no disponible | zh, en, de, es, fr, ko, ja | component-specific-licenses | Hugging Face + nodos ComfyUI |
| inclusionAI/Ming-3.0-tts-tiny (base) | 1.720.574.976 (según dato del repo) | no disponible | zh, en, de, es, fr, ko, ja | MIT (según model card) | Hugging Face |
| Comfy-Org/Ming-3.0-TTS | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Confucius4-R2T2 (componente) | no disponible | no disponible | no disponible | licencia propia | GitHub del autor |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no incluye los shards BF16 originales ni un runtime de Python; requiere instalar los nodos de ComfyUI y ejecutar scripts de descarga y verificación.
- Los componentes precompilados solo se han validado para Windows x64 con Python 3.10/3.12 y CUDA 12.8; otros entornos pueden no funcionar sin compilación manual.
- La librería CUDA de Confucius está compilada solo para SM 120; en otras GPU la clonación de voz puede degradarse a CPU y ser más lenta.
- La licencia es "component-specific-licenses": cada componente (Ming, Confucius, FFmpeg, etc.) mantiene su licencia original, por lo que el uso comercial exige revisar LICENSES.md antes de desplegar.
- No hay información sobre sesgos del modelo, riesgo de alucinación en la síntesis ni límites de longitud de contexto o de texto de entrada.
- Es un modelo TTS, no un LLM: no soporta razonamiento, tool calling ni agentes multi-step.
- La clonación de voz plantea riesgos de suplantación de identidad y uso indebido; conviene aplicar controles de consentimiento y marcas de agua en producción.
- El repositorio tiene pocas descargas y likes (25 y 0 en el momento de la consulta), lo que sugiere una validación comunitaria limitada.

## Enlaces

- [Hugging Face: t8star/Ming3-TTS-Comfy](https://huggingface.co/t8star/Ming3-TTS-Comfy)
- [Modelo base: inclusionAI/Ming-3.0-tts-tiny](https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny)
- [Pesos INT8: Comfy-Org/Ming-3.0-TTS](https://huggingface.co/Comfy-Org/Ming-3.0-TTS)
- [Nodos ComfyUI: Comfyui-Ming3-TTS-T8](https://github.com/T8mars/Comfyui-Ming3-TTS-T8)
- [Proyecto Confucius: comfyui-confucius-r2t2-t8](https://github.com/T8mars/comfyui-confucius-r2t2-t8)
- [Licencias: LICENSES.md](https://huggingface.co/t8star/Ming3-TTS-Comfy/blob/main/LICENSES.md)
- [Bilibili del autor](https://space.bilibili.com/385085361)
- [YouTube del autor](https://www.youtube.com/@T8star-Aix/)
- [Perfil Hugging Face del autor](https://huggingface.co/t8star)
