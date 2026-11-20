# Xylolabs/Aion-1.0-Instruct-2.3B-MLX-8bit

## Resumen

Aion 1.0 Instruct 2.3B MLX 8-bit es una versión cuantizada a 8 bits en formato MLX del modelo `microsoft/Aion-1.0-Instruct-2.3B`, un modelo de lenguaje de 2.288.831.488 parámetros desarrollado por el Applied Sciences Group de Microsoft Windows & Devices. Su propósito es servir como modelo fundacional de tipo SLM (Small Language Model) dentro del ecosistema Windows, optimizado para inferencia en dispositivo (on-device) en escenarios de texto y de sistema operativo. Esta variante concreta la publica Xylolabs para su ejecución con `mlx-lm` sobre silicio de Apple.

El modelo base está entrenado para comprensión de documentos, análisis de contenido, respuesta a preguntas y generación de texto general, con una ventana de contexto de 32K tokens que permite procesar documentos de varias páginas, hilos de correo extensos y especificaciones técnicas sin salir del dispositivo. Soporta ocho idiomas (inglés, alemán, español, portugués, italiano, francés, chino y japonés) y se distribuye bajo licencia MIT.

La relevancia de esta ficha radica en dos factores: por un lado, Microsoft ha anunciado que una versión optimizada de Aion Instruct, junto con su modelo de moderación de contenido, se convertirá en el SLM del sistema operativo Windows a finales de enero de 2027; por otro, esta cuantización MLX permite ejecutar el modelo en Macs con Apple Silicon con una degradación mínima respecto a la referencia en precisión completa (KL de 0,00047 y coincidencia top-1 del 98,96 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo `aion_instruct`, port MLX adaptado de `qwen3.py` de mlx-lm) |
| Parametros totales | 2.288.831.488 (2,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (32K) |
| Tipos de cuantizacion | MLX affine 8-bit, group size 64, escalas y sesgos en f16; normas en f16 |
| Idiomas soportados | en, de, es, pt, it, fr, zh, ja |
| Licencia | MIT (Copyright (c) Microsoft Corporation) |
| Formato de pesos | safetensors (MLX 8-bit), `model.safetensors` de 2,43 GB |
| Libreria | mlx (mlx-lm 0.32.2) |
| Tamano del repositorio | 2,4 GB |
| Modelo base | microsoft/Aion-1.0-Instruct-2.3B |
| Autores del modelo base | Applied Sciences Group, Microsoft Windows & Devices |
| Autores de la cuantizacion | Xylolabs |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denominado `aion_instruct` en el código de modelado de Microsoft. mlx-lm no incluye este tipo de modelo de forma nativa, por lo que el repositorio incorpora el fichero `aion_instruct.py`, un port a MLX del código de modelado publicado por Microsoft, adaptado desde `qwen3.py` de mlx-lm (MIT, Copyright © 2023 Apple Inc.). El fichero se referencia en `config.json` mediante la clave `model_file` y requiere `--trust-remote-code` para cargarse.

La cuantización aplicada es MLX affine de 8 bits con group size 64, escalas y sesgos en f16, y normas en f16; la capa de embedding de tokens está atada (tied) con la cabeza LM y también se cuantiza. Según las mediciones del autor de la cuantización, el resultado presenta una perplejidad de 6,3001 frente a 6,2945 de la referencia en f32 sobre los pesos BF16, un KL medio de 0,00047 y una coincidencia top-1 del 98,96 %. La evaluación se realizó sobre 16 fragmentos de 4.096 tokens, puntuando los últimos 2.047 tokens de cada uno (32.752 tokens en total): 12 fragmentos reservados con formato de chat (inglés, coreano, código y matemáticas) y 4 de wikitext-2.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base, ya que la model card de Microsoft incluida en el repositorio no detalla esos datos.

## Capacidades

- Generación de texto general: resumen, reescritura y conversación multi-turno.
- Comprensión de documentos: análisis de contenido y respuesta a preguntas sobre textos largos gracias a la ventana de 32K tokens.
- Procesamiento de hilos de correo y especificaciones técnicas extensas en una sola pasada.
- Soporte multilingüe en ocho idiomas: inglés, alemán, español, portugués, italiano, francés, chino y japonés.
- Orientación a escenarios de sistema operativo y asistencia integrada en Windows (caso de uso declarado por Microsoft).
- Ejecución local en Apple Silicon mediante mlx-lm, con API de generación (`mlx_lm.generate`) y de chat interactivo (`mlx_lm.chat`).
- No se ha documentado en la información disponible soporte de tool calling, function calling, razonamiento multi-paso con agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente de chat local en Mac: el modelo se ejecuta con `mlx_lm.chat` sobre Apple Silicon, manteniendo las conversaciones íntegramente en el dispositivo y sin conectividad a la nube, lo que encaja con el enfoque de privacidad declarado por Microsoft.
- Resumen de documentos largos en local: con 32K tokens de contexto puede procesar informes de varias páginas, contratos o manuales técnicos y generar resúmenes sin enviar el contenido a un servicio externo.
- Análisis y reescritura de correo: útil para hilos de correo extensos, donde el contexto largo permite mantener el hilo completo y producir respuestas o reescrituras coherentes con el histórico.
- Respuesta a preguntas sobre documentación técnica: el modelo puede ingerir especificaciones y responder consultas concretas, adecuado para bases de conocimiento internas que no pueden salir de la organización.
- Prototipado rápido de aplicaciones de texto en macOS: al ser un modelo de 2,3B en 8 bits (2,43 GB), se integra en flujos de desarrollo locales con mlx-lm sin necesidad de GPUs dedicadas ni infraestructura de servidor.
- Evaluación de cara a la integración en Windows: dado que una versión optimizada de Aion Instruct será el SLM del sistema operativo Windows a finales de enero de 2027, este modelo sirve para que desarrolladores evalúen desde ahora las capacidades y limitaciones de la familia antes de su despliegue en el sistema.
- Procesamiento multilingüe ligero: atención al cliente o generación de contenido en los ocho idiomas soportados dentro de una aplicación de escritorio con recursos limitados.

## Benchmarks y rendimiento

La model card del repositorio no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). Los únicos datos de rendimiento publicados son las métricas de fidelidad de la cuantización frente a la referencia en f32:

| Metrica | MLX 8-bit (este repo) | AlphaOxO/Aion-1.0-Instruct-2.3B-8bits-mlx | Referencia f32 |
|---|---|---|---|
| Tamano | 2,43 GB | 2,43 GB | no disponible |
| Perplejidad (PPL) | 6,3001 | 6,2981 | 6,2945 |
| KL medio vs f32 | 0,00047 | 0,00128 | — |
| Coincidencia top-1 vs f32 | 98,96 % | 98,15 % | — |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: aproximadamente 2,43 GB solo para los pesos en 8 bits; hay que sumar el overhead del runtime de MLX, la caché KV para el contexto (que crece con la ventana de hasta 32K tokens) y el buffer de activaciones.
- Plataforma: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), ya que el formato es MLX y requiere mlx-lm.
- GPU recomendadas: no aplica a GPUs NVIDIA o AMD; el modelo está pensado para ejecutarse en el chip unificado de los Mac. Cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada debería poder cargar los pesos, aunque un contexto largo exige más memoria.
- Despliegue: `mlx-lm==0.32.2` con `mlx_lm.generate` o `mlx_lm.chat`, siempre con `--trust-remote-code` para que se cargue `aion_instruct.py`. No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Aion-1.0-Instruct-2.3B-MLX-8bit | 2,3B | 32K | MLX 8-bit | MIT | Hugging Face (este repo) |
| microsoft/Aion-1.0-Instruct-2.3B | 2,3B | 32K | PyTorch, ONNX, GGUF (segun model card) | MIT | Hugging Face (modelo base) |
| AlphaOxO/Aion-1.0-Instruct-2.3B-8bits-mlx | 2,3B | 32K | MLX 8-bit | MIT (derivada del base) | Hugging Face |

La comparación con modelos de otras familias (por ejemplo, Qwen3 de tamano similar o Llama 3.2 3B) no está disponible en la información proporcionada, por lo que no se incluyen datos de rendimiento comparado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo modelo de lenguaje entrenado con datos web, es previsible que reproduzca sesgos presentes en sus datos, pero no se han publicado evaluaciones al respecto.
- Riesgo de alucinación: Microsoft advierte explícitamente que el modelo no está diseñado ni evaluado para todos los propósitos posibles y que los desarrolladores deben considerar las limitaciones comunes de los modelos de lenguaje al seleccionar casos de uso.
- Limitaciones de contexto e idioma: la ventana es de 32K tokens; no se han publicado evaluaciones por idioma, por lo que el rendimiento en español, chino o japonés puede ser inferior al del inglés.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribución del copyright de Microsoft Corporation. Xylolabs declara no estar afiliada ni respaldada por Microsoft.
- Caveat de producción: el modelo requiere `--trust-remote-code` para cargarse, lo que implica ejecutar código Python del repositorio; conviene auditar `aion_instruct.py` antes de desplegarlo en entornos controlados.
- Compatibilidad limitada: el formato MLX 8-bit solo funciona en Apple Silicon con mlx-lm; no es portable a GPUs NVIDIA ni a otros runtimes sin reconvertir los pesos.
- Madurez del ecosistema: el modelo base es una versión de introducción publicada por Microsoft antes de su integración en Windows (prevista para finales de enero de 2027); la versión que llegará al sistema operativo será una variante optimizada y acompañada de un modelo de moderación, por lo que el comportamiento en producción podría diferir.
- Sin soporte documentado de tool calling ni agentes: no se debe asumir capacidad de function calling sin validación previa.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-MLX-8bit
- Modelo base en Hugging Face: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Repositorio de código de ejemplo de Microsoft: https://github.com/microsoft/Aion-Instruct-Preview-Sample/
- Librería MLX: https://github.com/ml-explore/mlx
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Repositorio de Xylolabs con recursos: https://github.com/XylolabsInc/tensix-bfp-gptq
- Cuantización alternativa MLX 8-bit: https://huggingface.co/AlphaOxO/Aion-1.0-Instruct-2.3B-8bits-mlx
