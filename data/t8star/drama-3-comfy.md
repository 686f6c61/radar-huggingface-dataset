# t8star/Drama-3-Comfy

## Resumen
Drama-3-Comfy es una conversión nativa del modelo de síntesis de voz Drama-3, desarrollado originalmente por Fish Audio y redistribuido por el usuario t8star para su uso en ComfyUI y en el estudio T8. Se trata de un sistema de text-to-speech (TTS) con clonación de voz, orientado a la generación de audio conversacional en chino e inglés, que en este repositorio se distribuye en formatos cuantizados FP8 y W4A8 junto con los componentes auxiliares necesarios (códec de audio, cabezas de texto y modelos opcionales de ASR, alineamiento, VAD y agrupación de hablantes).

El modelo base cuenta con aproximadamente 1.720 millones de parámetros según los pesos en safetensors, y el repositorio completo ocupa 141,5 GB debido a la multiplicidad de artefactos y variantes incluidas. La relevancia de esta ficha radica en que ofrece un pipeline TTS completo y empaquetado para flujos de trabajo locales en ComfyUI, con soporte para referencias de voz, segmentación de grabaciones largas y entrega en WAV, stems y subtítulos, sin depender de un puente HTTP externo.

Es importante señalar que estos archivos no son checkpoints estándar de Transformers: requieren el cargador nativo de T8 y una pila de software concreta (Torch 2.8 + CUDA 12.8, Transformers 4.57.1, tokenizers 0.22.2 y huggingface-hub 0.36.2). La licencia es la Fish Audio Community License v1.0, con condiciones específicas para uso comercial y servicios alojados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS de Drama-3; los archivos no son checkpoints estándar de Transformers y requieren el cargador nativo T8) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (drama3-t8-fp8.safetensors, 38,58 GB), W4A8 (drama3-t8-w4a8.safetensors, 24,60 GB); herramientas de conversión W6A8/INT8 disponibles en el repositorio de código, aunque esos checkpoints no se suben a este repo |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Fish Audio Community License v1.0 (license_name: fish-audio-community-license) |
| Formato de pesos | safetensors, GGUF (Confucius4-R2T2-GGUF), ONNX (FireRedVAD-ONNX, campplus-zh-en.onnx) |

## Arquitectura y entrenamiento
No se dispone de información detallada sobre la arquitectura interna del modelo base Drama-3 en la documentación proporcionada. Los archivos distribuidos incluyen un modelo principal (FP8 o W4A8), un códec de audio (`drama3-codec.safetensors`, 1,57 GB) ubicado en `models/vae/`, y dos cabezas alternativas: una cabeza compacta de escena/control (`drama3-line-head.safetensors`, 8,46 KB) y una cabeza de texto completa (`drama3-text-head.safetensors`, 1,03 GB). La generación requiere un modelo principal, el códec y la cabeza seleccionada o de respaldo.

El repositorio incorpora además componentes opcionales para tareas auxiliares: modelos Qwen3 ASR (0,6B y 1,7B en bf16) para transcripción, un alineador forzado Qwen3 (0,6B) y una alternativa de alineador en directorio, el par GGUF Confucius4-R2T2 (modelo Q8 y proyector), FireRedVAD en ONNX para segmentación de grabaciones largas y CAM++ en ONNX para agrupación de hablantes en CPU. La actualización del 29 de octubre de 2026 sincronizó los pesos FP8, W4A8 y ambas cabezas de texto con la revisión oficial `78e5ab7` de `fishaudio/drama-3`; el W4A8 se cuantizó a partir de la conversión FP8 correspondiente. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades
- Síntesis de voz (text-to-speech) con generación de audio conversacional en chino e inglés.
- Clonación de voz mediante referencia de audio limpia con transcripción precisa; si se proporciona la transcripción, no se requiere ASR.
- Generación consciente del contexto y edición de guiones en el estudio T8.
- Biblioteca de voces versionada, casting fijo y múltiples tomas por generación.
- Segmentación de grabaciones y entrega en WAV, stems y subtítulos.
- Transcripción opcional mediante Qwen3 ASR (0,6B o 1,7B).
- Alineamiento temporal a nivel de palabra mediante el alineador Qwen3 forzado.
- Detección de actividad de voz (VAD) con FireRedVAD para grabaciones largas.
- Agrupación de hablantes opcional en CPU mediante CAM++.
- Integración nativa en ComfyUI mediante nodos, sin puente HTTP del estudio.

## Casos de uso
- Doblaje y localización de contenido audiovisual: el modelo permite generar voces clonadas en chino e inglés a partir de referencias limpias, con entrega en stems y subtítulos, lo que facilita la sustitución de pistas de audio en pipelines de postproducción.
- Producción de audiolibros y narración: la biblioteca de voces versionada y el casting fijo permiten mantener consistencia de voz entre capítulos, mientras que las múltiples tomas ayudan a seleccionar la mejor interpretación por segmento.
- Generación de voces para personajes en videojuegos: la edición de guiones y la generación consciente del contexto permiten producir diálogos multi-turno con coherencia, integrados directamente en ComfyUI para iterar sobre escenas.
- Transcripción y alineamiento de material existente: con los modelos Qwen3 ASR y el alineador forzado se pueden obtener transcripciones y marcas temporales por palabra, útiles para subtitulado automático y sincronización.
- Segmentación de grabaciones largas: FireRedVAD permite dividir entrevistas o podcasts en fragmentos manejables antes de procesarlos con TTS o ASR, reduciendo errores en audios de larga duración.
- Agrupación de hablantes en archivos multi-voz: CAM++ en CPU permite separar y agrupar interlocutores en grabaciones de reuniones o programas, como paso previo a la clonación o al etiquetado.
- Prototipado rápido de asistentes conversacionales: al integrarse en ComfyUI mediante nodos nativos, se pueden construir flujos de generación de voz para demos de asistentes sin depender de servicios en la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; el modelo principal FP8 ocupa 38,58 GB y el W4A8 24,60 GB, a lo que hay que sumar el códec (1,57 GB) y la cabeza de texto (1,03 GB) o la línea (8,46 KB). El tamaño de la caché de expertos no equivale al uso total de memoria, según advierte el autor.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. La pila soportada es Torch 2.8 + CUDA 12.8, lo que orienta a GPUs NVIDIA con soporte para CUDA 12.8.
- ¿Cabe en GPU de consumo? No disponible. Los tamaños de los pesos principales (24,60 GB en W4A8 y 38,58 GB en FP8) sugieren que la variante W4A8 podría requerir GPUs de gama alta con 24 GB o más, pero no se confirma en la documentación.
- Opciones de despliegue: estudio T8 nativo y nodos de ComfyUI (cargador nativo T8); el repositorio menciona compatibilidad con endpoints y con herramientas como Docker Model Runner y Lemonade. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor indica que la memoria y la velocidad dependen del modelo, el contexto y el hardware.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye datos de rendimiento ni comparativas con otros modelos TTS.

## Limitaciones y advertencias
- Los archivos no son checkpoints estándar de Transformers; es obligatorio usar el cargador nativo de T8 y la pila de software indicada (Torch 2.8 + CUDA 12.8, Transformers 4.57.1, tokenizers 0.22.2, huggingface-hub 0.36.2).
- Solo se soportan chino e inglés; no se mencionan otros idiomas.
- La licencia Fish Audio Community License v1.0 impone condiciones a la redistribución y al uso comercial: el permiso comercial comunitario tiene un umbral de ingresos anuales de 500.000 USD, y los servicios alojados generalmente requieren una licencia separada.
- Los componentes auxiliares tienen licencias distintas: Qwen ASR/alineador, FireRedVAD y CAM++ usan Apache-2.0, mientras que los pesos Confucius retienen la licencia de modelo de NetEase Youdao con sus propias condiciones y umbrales.
- El autor advierte de que los resultados de versiones anteriores no certifican cada nueva funcionalidad o grabación, y recomienda revisar el habla generada antes de entregarla.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible.
- El paquete completo de Windows se distribuye por un enlace externo (Quark), y los ZIP de código del GitHub Release no incluyen Python ni modelos.
- Es necesario mantener juntos el modelo R2T2 Q8 y su proyector, y descargar las carpetas completas del alineador y del VAD.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/t8star/Drama-3-Comfy
- Árbol de archivos: https://huggingface.co/t8star/Drama-3-Comfy/tree/main
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Revisión oficial de pesos: https://huggingface.co/fishaudio/drama-3/tree/78e5ab79e49aa9a25abe8799eff2c4d73a1c3216
- Repositorio de código (Comfyui-Drama-3): https://github.com/T8mars/Comfyui-Drama-3
- Release v0.3.3: https://github.com/T8mars/Comfyui-Drama-3/releases/tag/v0.3.3
- Paquete completo de Windows: https://pan.quark.cn/s/264edb7e36bd
