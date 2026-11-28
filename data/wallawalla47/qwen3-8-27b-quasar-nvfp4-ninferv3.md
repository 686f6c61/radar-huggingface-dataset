# wallawalla47/Qwen3.8-27B-Quasar-NVFP4-NInferV3

## Resumen

Qwen3.8-27B-Quasar-NVFP4-NInferV3 es un artefacto de inferencia en formato propietario `.ninfer` (NInfer V3) derivado del checkpoint cuantizado QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4, publicado por el usuario wallawalla47. No es un modelo entrenado desde cero, sino un empaquetado optimizado para los motores Infernix y NInfer que integra los pesos NVFP4 del modelo base de forma bit-exacta y añade dos componentes de decodificación especulativa: un modelo borrador DFlash2 y una cabeza de propuesta indexada de 131.072 filas.

El modelo subyacente pertenece a la familia Qwen3.5/Qwen3.8 y emplea una arquitectura híbrida de 64 capas que combina Gated Delta-Net (atención lineal) con atención completa cada cuatro capas, dimensión oculta de 5120 y un vocabulario de 248.320 tokens. Incluye una torre de visión (qwen3_5_vision, profundidad 27) para entrada de imagen y vídeo, un módulo MTP (multi-token prediction) para decodificación especulativa y una ventana de contexto nativa de 262.144 tokens.

Su relevancia práctica es acotada pero clara: ofrece un despliegue listo para ejecutar sin paso de conversión en GPUs NVIDIA Blackwell (sm_120a, probado en RTX 5090), con pesos de aproximadamente 20 GB en VRAM y licencia Apache 2.0. Está pensado para desarrolladores que quieran servir un modelo multimodal de 27B con razonamiento, visión y contexto largo sobre hardware de consumo de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas con Gated Delta-Net (atención lineal) + atención completa cada 4 capas; torre de visión qwen3_5_vision (profundidad 27); módulo MTP |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (W4A4), Q8 agrupado (q8_g32_fp16), Q4 agrupado (q4_g64_fp16), BF16, FP32, INT32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (NInfer V3, archivo único); origen en compressed-tensors `nvfp4-pack` |
| Dimensión oculta | 5120 |
| Vocabulario | 248.320 tokens |
| Tamaño del repositorio | 21,6 GB |
| Hardware objetivo | NVIDIA RTX 50-series (sm_120a), construido y ajustado en RTX 5090 |

## Arquitectura y entrenamiento

La columna vertebral textual es una arquitectura híbrida de la familia Qwen3.5: 64 capas que alternan Gated Delta-Net (atención lineal con estado recurrente) con atención completa cada cuarta capa, dimensión oculta de 5120 y vocabulario de 248.320 entradas. Sobre esa base se añaden una torre de visión para entrada image-text-to-text, un módulo MTP (multi-token prediction) para decodificación especulativa y, en este artefacto concreto, un modelo borrador DFlash2 de 5 capas con atención deslizante (ventana 2048, selector de rango 256 con top-16) y una cabeza de propuesta indexada de 131.072 filas extraída de la cabeza de salida del modelo base.

El entrenamiento original corresponde al checkpoint QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4, que aplica quantization-aware training sobre pesos NVFP4. Este artefacto no reentrena: importa los 256 objetos NVFP4 del modelo base de forma bit-exacta (`import_encoded`), sin round-trip de recuantización, de modo que la calidad del modelo base se preserva por construcción. Las únicas modificaciones son la recuantización BF16 → Q8 de la capa MTP y del `lm_head` compartido (requisito del operador fusionado del motor, con n=1024) y el upcast de las proyecciones a/b de GDN de NVFP4 a BF16, necesario porque el layout NVFP4 v3 exige tiles de 128 filas y estas tensiones tienen 48 filas. No se detalla en la información disponible la composición del dataset de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento, con modo "thinking" explícito según las etiquetas del modelo.
- Procesamiento multimodal image-text-to-text: entrada de imágenes y vídeo mediante la torre de visión integrada.
- Generación de código y matemáticas (capacidades inferidas de la familia Qwen3.5 y de las etiquetas `agentic` y `reasoning`).
- Soporte de flujos agénticos y razonamiento multi-paso.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y repositorios de código.
- Decodificación especulativa mediante tres mecanismos: MTP, borrador DFlash2 (`--spec dflash2`) y cabeza de propuesta indexada (`--lm-head-draft`).
- Capacidades multilingües: no disponible en detalle.
- Tool calling / function calling: no se documenta explícitamente en la información disponible.

## Casos de uso

- Asistente de código en local sobre RTX 5090: el modelo puede ejecutarse con `infernix-serve` apuntando al archivo `.ninfer` sin conversión previa, sirviendo autocompletado y generación de parches con decodificación especulativa DFlash2 para reducir latencia por token.
- Análisis de repositorios completos: con 262.144 tokens de contexto, permite cargar grandes volúmenes de código o documentación en una sola ventana y responder preguntas transversales sobre la base de código.
- Procesamiento de documentos con imágenes: la torre de visión permite extraer información de capturas, diagramas o páginas escaneadas junto con el texto, útil en pipelines de digitalización y extracción estructurada.
- Agentes autónomos multi-paso: las etiquetas `agentic` y el soporte MTP lo orientan a bucles de razonamiento encadenado; Infernix reporta un 90 % de tokens de prompt servidos desde caché de prefijo en una repetición de codificación agéntica, lo que abarata las conversaciones largas con historial repetido.
- Servicio de chat con contexto largo en hardware de consumo: los ~20 GB de pesos en NVFP4 caben en una RTX 5090, permitiendo desplegar un modelo de 27B multimodal sin GPU de centro de datos.
- Evaluación comparativa de motores de inferencia: al funcionar con Infernix, NInfer y ninfer-custom, sirve como banco de pruebas para medir velocidad de prefill (reportada 1,3-1,5× más rápida en Infernix) y tiempo hasta el primer token.
- Prototipado de investigación en cuantización: el informe de conversión por tensor incluido permite estudiar el impacto de NVFP4 W4A4 frente a Q8 y BF16 en un modelo híbrido real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento proporcionados son de motor, medidos sobre el artefacto oficial de 27B de NInfer:

| Métrica | Resultado reportado |
|---|---|
| Tokens de prompt servidos desde caché de prefijo (replay agéntico de codificación) | 90 % |
| Tiempo hasta el primer token (Infernix vs. NInfer) | Aproximadamente la mitad del promedio de NInfer |
| Velocidad de prefill de prompts largos | 1,3-1,5× más rápida que NInfer |
| VRAM ocupada por los pesos | ~20 GB |

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB solo para pesos; el repositorio completo ocupa 21,6 GB, por lo que conviene prever 22-24 GB de VRAM para el archivo y estados de ejecución.
- GPU objetivo: NVIDIA RTX 50-series con sm_120a (Blackwell). Construido y ajustado en RTX 5090.
- No es compatible con GPUs anteriores a Blackwell para las rutas NVFP4, según la información disponible.
- Cabe en GPU de consumo de gama alta: RTX 5090 (32 GB) es el caso de referencia. No se documenta funcionamiento en GPUs con menos VRAM.
- Motores de despliegue: Infernix (recomendado, con ejecutables precompilados para Windows en su página de releases), NInfer y ninfer-custom.
- No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; el formato `.ninfer` es específico de estos motores.
- Latencia y throughput: solo se reportan comparativas relativas entre motores (véase la sección anterior); no hay cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen3.8-27B-Quasar-NVFP4-NInferV3 | 27B | 262.144 | Texto + visión | Apache 2.0 | `.ninfer`, solo Infernix/NInfer, GPU Blackwell |
| QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 (base) | 27B | 262.144 (heredado) | Texto + visión | Apache 2.0 (según base) | compressed-tensors `nvfp4-pack`; requiere conversión o motor compatible |
| Artefacto oficial NInfer de 27B | 27B | no disponible | Texto | no disponible | `.ninfer`; sirve de referencia de rendimiento en la model card |

No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes; la comparación se limita a formato, licencia y compatibilidad de motor.

## Limitaciones y advertencias

- Dependencia total del ecosistema Infernix/NInfer: el formato `.ninfer` no es portable a vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y crea riesgo de mantenimiento ligado a proyectos de un solo autor.
- Compatibilidad de hardware restringida a GPUs NVIDIA Blackwell (sm_120a); no se documenta funcionamiento en Ampere, Ada ni en GPUs de otros fabricantes.
- El modelo base es un checkpoint de terceros (QUASAR-QAT); la calidad final depende de ese entrenamiento, no verificable con benchmarks publicados en esta ficha.
- Riesgo de alucinación inherente a los modelos de lenguaje de 27B; no se documentan evaluaciones de factualidad ni de sesgos.
- Idiomas soportados no especificados: no hay garantía documentada de rendimiento en castellano ni en otras lenguas distintas del inglés o chino.
- Tool calling y function calling no están documentados explícitamente; conviene validarlos antes de usarlos en producción.
- Aunque la licencia es Apache 2.0, deben verificarse las condiciones del modelo base y de los componentes grafted (DFlash2 del artefacto oficial de NInfer) antes de un uso comercial.
- Las cifras de rendimiento de la model card son mediciones del autor sobre su propio motor y su propio artefacto de referencia; no son comparaciones independientes.
- El repositorio tiene 1 like y procede de un autor individual; no hay garantía de soporte, mantenimiento ni auditoría de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-27B-Quasar-NVFP4-NInferV3
- Modelo base: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Motor Infernix (recomendado): https://github.com/Wallawalla47/Infernix
- Benchmarks de Infernix frente a NInfer: https://github.com/Wallawalla47/Infernix#qwen38-27b-infernix-vs-ninfer
- Motor NInfer: https://github.com/Neroued/ninfer
- Fork ninfer-custom: https://github.com/Wallawalla47/ninfer-custom
- Script de conversión: https://github.com/Wallawalla47/ninfer-custom/blob/master/tools/convert/quasar_nvfp4.py
- Rama master de ninfer-custom: https://github.com/Wallawalla47/ninfer-custom/tree/master
- Paper referenciado (arXiv:2608.13966): https://arxiv.org/abs/2608.13966
