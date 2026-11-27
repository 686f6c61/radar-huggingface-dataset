# vanch007/AuK-Base-MLX-8bit

## Resumen

AuK-Base MLX 8-bit es una conversión cuantizada a 8 bits para Apple Silicon del modelo tencent/AuK, un sistema de texto-a-voz (TTS) y edición de habla desarrollado por Tencent. La ficha corresponde al repositorio vanch007/AuK-Base-MLX-8bit, que empaqueta los pesos en formato MLX para su ejecución nativa en chips de Apple (M1 en adelante), empleando el runtime mlx-AuK del mismo autor. El modelo base combina un transformer de edición Flux2Edit con un VAE BigVGAN-Flow y un codificador semántico externo basado en Qwen2.5-Omni-3B-Thinker.

El objetivo del modelo es la clonación de voz zero-shot y la edición de habla: dado un audio de referencia y una instrucción textual, genera una locución nueva manteniendo el timbre del hablante, o modifica un audio existente. La cuantización a 8 bits reduce el peso del transformer a 1,65 GB, lo que facilita su despliegue en equipos de consumo con memoria unificada, a costa de una pérdida mínima de calidad según las pruebas del autor.

Es relevante ahora porque permite ejecutar un sistema TTS de calidad investigación en hardware Apple sin GPU dedicada, si bien la dependencia del codificador Qwen2.5-Omni bajo licencia de investigación limita el pipeline completo a uso no comercial, aunque los archivos de este repositorio se distribuyan bajo MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de edición Flux2Edit (dit.safetensors) + VAE BigVGAN-Flow; codificador semántico Qwen2.5-Omni-3B-Thinker |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en capas lineales internas de los bloques del transformer (group size 64); resto en bf16; VAE en bf16 |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | MIT (archivos del repositorio); el pipeline completo requiere Qwen2.5-Omni-3B-Thinker bajo Qwen Research License (no comercial) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base tencent/AuK es un sistema de TTS y edición de habla que combina un transformer de difusión/flow matching denominado Flux2Edit, encargado de generar o editar las representaciones latentes de audio, con un VAE BigVGAN-Flow que decodifica dichas representaciones a forma de onda. La conversión MLX mantiene el transformer con sus capas lineales internas cuantizadas a 8 bits (group size 64) y el resto de pesos en bf16, mientras que el VAE permanece íntegramente en bf16. El muestreo recomendado es de 32 pasos con CFG 2.0.

El pipeline completo no es autocontenido: requiere además el codificador semántico mlx-community/Qwen2.5-Omni-3B-Thinker-bf16 (7,46 GB), que procesa la instrucción textual y el audio de referencia. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La cuantización se realizó a partir de la conversión bf16 mlx-community/AuK-bf16.

Cabe señalar una advertencia del autor: los archivos publicados antes del 27 de noviembre de 2026 (dit_8bit.safetensors) eran inutilizables porque el script de cuantización guardó un modelo inicializado aleatoriamente, sin bloques transformer. Cualquier descarga anterior debe eliminarse; las cifras de velocidad de la model card antigua no fueron medidas con este código.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto e instrucciones en chino e inglés.
- Clonación de voz zero-shot: reproduce el timbre de un hablante a partir de un audio de referencia.
- Edición de habla: modificación de locuciones existentes guiada por instrucciones textuales.
- Procesamiento multimodal de entrada: acepta texto y audio de referencia en el mismo mensaje.
- Control de generación mediante semilla (seed) y duración objetivo (gen_seconds).
- Ejecución nativa en Apple Silicon mediante MLX.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; no es un modelo de propósito general.

## Casos de uso

- Clonación de voz para doblaje y localización: dado un clip de referencia de un actor, el modelo genera nuevas locuciones en inglés o chino con el mismo timbre, útil para prototipos de doblaje antes de contratar grabaciones definitivas.
- Edición de audiolibros y pódcast: corregir o sustituir frases concretas de una grabación manteniendo la voz del locutor, evitando regrabar secciones completas.
- Accesibilidad y lectura de textos: convertir documentos a voz con una voz personalizada del usuario, ejecutándose localmente en un Mac sin enviar datos a la nube.
- Prototipado de asistentes de voz en desarrollo: generar respuestas habladas en un entorno de investigación con hardware Apple, integrando el modelo en un pipeline de pruebas local.
- Investigación en TTS y edición de habla: servir como referencia cuantizada para comparar calidad frente a bf16 en experimentos académicos, con la ventaja de requerir menos memoria.
- Generación de voces para contenido educativo o demos interactivas: producir narraciones multilingües (zh/en) con una voz consistente a partir de un único audio de referencia.

## Benchmarks y rendimiento

El autor publica una comparación entre bf16 y 8 bits sobre 20 prompts de clonación zero-shot (10 en inglés y 10 en chino) del conjunto Seed-TTS-Eval, con la misma semilla y transcripción mediante Qwen3-ASR 1.7B.

| Metrica | bf16 | 8 bits |
|---|---|---|
| Word error rate (ingles) | 0,00 % | 0,00 % |
| Character error rate (chino) | 1,84 % | 1,84 % |
| Real-time factor (un Mac, indicativo) | 5,2 | 3,9 |

Además, un paso del transformer difiere de los pesos originales en un 1,6 % (L2 relativa). El autor advierte que 20 clips son una muestra pequeña y que no se compararon la similitud de hablante ni las tareas de edición. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no tratarse de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el transformer cuantizado ocupa 1,65 GB y el VAE en bf16 se suma a esa cifra; el codificador Qwen2.5-Omni-3B-Thinker añade 7,46 GB, por lo que el pipeline completo requiere del orden de 10 GB o más de memoria unificada.
- Hardware recomendado: equipos Apple Silicon con memoria unificada suficiente (M1 Pro/Max, M2 Pro/Max, M3/M4 con 16 GB o más); no se documentan GPU NVIDIA.
- Cabe en GPU de consumo: no aplica, ya que el formato MLX está orientado a Apple Silicon; no se indica compatibilidad con CUDA.
- Opciones de despliegue: runtime mlx-AuK (repositorio del autor), con dependencias mlx, soundfile, numpy, torch, torchaudio, transformers, qwen-omni-utils y huggingface_hub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: real-time factor de 3,9 en 8 bits frente a 5,2 en bf16, medido en un Mac no especificado y calificado por el autor como indicativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| AuK-Base MLX 8-bit (este) | no disponible | no disponible | zh, en | MIT (repo); pipeline con Qwen Research License | safetensors MLX / Apple Silicon |
| tencent/AuK (bf16 original) | no disponible | no disponible | zh, en | no disponible en la informacion | safetensors / multiplataforma |
| mlx-community/AuK-bf16 | no disponible | no disponible | zh, en | no disponible en la informacion | safetensors MLX / Apple Silicon |

No se dispone de datos de benchmarks comparativos con otros sistemas TTS (por ejemplo, modelos de clonación zero-shot de otros proveedores) en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- La licencia MIT cubre únicamente los archivos de este repositorio; el pipeline completo depende de Qwen2.5-Omni-3B-Thinker bajo Qwen Research License, de uso exclusivamente no comercial. El uso comercial del sistema completo no está permitido sin licencia adicional.
- Solo soporta chino e inglés; no se documentan otros idiomas.
- Los dígitos arábigos dentro de texto chino se leen mal con frecuencia; el autor recomienda escribir los números con letras.
- La evaluación de calidad se basa en 20 clips, una muestra pequeña; no se compararon similitud de hablante ni tareas de edición entre bf16 y 8 bits.
- Riesgo de alucinación o artefactos en la voz generada no cuantificado en la información disponible.
- Sesgos de hablante y acento no documentados.
- Los archivos antiguos (dit_8bit.safetensors) eran defectuosos; es imprescindible descargar la versión posterior al 27 de noviembre de 2026.
- El modelo está orientado a investigación y prototipado; no se documentan garantías para producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vanch007/AuK-Base-MLX-8bit
- Modelo base: https://huggingface.co/tencent/AuK
- Conversión bf16 de referencia: https://huggingface.co/mlx-community/AuK-bf16
- Codificador semántico: https://huggingface.co/mlx-community/Qwen2.5-Omni-3B-Thinker-bf16
- Runtime mlx-AuK: https://github.com/vanch007/mlx-AuK
