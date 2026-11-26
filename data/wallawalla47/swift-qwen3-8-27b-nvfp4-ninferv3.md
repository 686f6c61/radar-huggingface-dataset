# wallawalla47/Swift-Qwen3.8-27B-NVFP4-NInferV3

## Resumen

Swift-Qwen3.8-27B-NVFP4-NInferV3 es un artefacto de pesos cuantizados en formato propietario `.ninfer` (NInfer V3) del checkpoint `ukisai/Swift-Qwen3.8-27B-NVFP4`, que a su vez es una cuantización mixta NVFP4/FP8 de Swift-Qwen3.8-27B, un ajuste fino de Qwen3.8-27B orientado a razonamiento eficiente en tokens. Lo publica el usuario wallawalla47 como trabajo de hobby, empaquetado en un único fichero de 22,78 GB listo para cargar sin paso de conversión en los motores Infernix y NInfer.

El modelo subyacente es multimodal (texto e imagen/vídeo) con arquitectura híbrida de 64 capas que combina atención lineal Gated Delta-Net con atención completa cada cuatro capas, hidden de 5120 y vocabulario de 248.320 tokens. Incorpora contexto nativo de 262.144 tokens, torre de visión de profundidad 27, cabeza MTP para decodificación especulativa y un modelo borrador DFlash2 de 5 capas con atención deslizante de ventana 2048.

Su relevancia práctica es acotada pero concreta: permite ejecutar un modelo de 27B con pesos de 4 bits (W4A4) en una GPU Blackwell de consumo (RTX 5090, sm_120a) aprovechando kernels NVFP4 nativos, caché de prefijo y rutas de decodificación especulativa. No es un modelo nuevo ni un entrenamiento original: es un contenedor de inferencia optimizado sobre pesos ya cuantizados por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas, Gated Delta-Net (atención lineal) + atención completa cada 4 capas; torre de visión qwen3_5_vision (profundidad 27); cabeza MTP; borrador DFlash2 de 5 capas |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Mixta: 128 objetos NVFP4 (W4A4, proyecciones MLP), 130 FP8 e4m3fn con escala por fila (atención y GDN), 579 BF16, 96 FP32, 55 Q4, 54 Q5, 28 Q8, 1 Q6, 1 tabla de índices INT32 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.ninfer` (NInfer V3, fichero único); no safetensors ni GGUF |
| Hidden size | 5120 |
| Vocabulario | 248.320 tokens |
| Tamano del repo | 22,8 GB |
| Fichero principal | 22.783.240.704 bytes |
| Hardware objetivo | NVIDIA RTX 5090 (sm_120a, Blackwell) |
| Libreria | ninfer |

## Arquitectura y entrenamiento

La arquitectura del backbone es la familia Qwen3.5: un híbrido que intercala capas de atención lineal Gated Delta-Net con capas de atención completa cada cuatro capas, lo que reduce el coste de memoria y cómputo en contextos largos frente a un transformer denso convencional. Sobre ese backbone se añaden tres componentes auxiliares: una torre de visión para entrada de imagen y vídeo, una cabeza MTP (multi-token prediction) ajustada por UkisAI y un modelo borrador DFlash2 de 5 capas con atención deslizante de ventana 2048 y selector de rango 256 / top-16, empleado para decodificación especulativa.

El entrenamiento original corresponde a Qwen3.8-27B (no documentado en la información disponible) y al ajuste fino Swift de UkisAI, cuyo objetivo declarado es alcanzar las mismas respuestas con cadenas de pensamiento más cortas. La cuantización la realizó UkisAI con NVIDIA Model Optimizer siguiendo el mapeo de precisión de `nvidia/Qwen3.8-27B-NVFP4`, calibrada con Local-Hessian NVFP4 sobre 2.048 muestras de post-entrenamiento de Nemotron. Este artefacto de wallawalla47 no reentrena ni recalibra: importa las proyecciones MLP en NVFP4 y las proyecciones de atención y GDN en FP8 de forma bit-exacta, y solo recuantiza a FP8 con escala por fila la cabeza de salida y el embedding. La conversión se ejecutó en CPU en unos 4-5 minutos con la receta `qwen3_8_27b_nvfp4_nvidia` del conversor de Infernix.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking), heredado de Qwen3.8-27B.
- Razonamiento eficiente en tokens: el ajuste Swift busca respuestas equivalentes con trazas de pensamiento más cortas.
- Procesamiento multimodal de imagen y vídeo mediante la torre de visión qwen3_5_vision (pipeline `image-text-to-text`).
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y repositorios de código.
- Decodificación especulativa mediante cabeza MTP y borrador DFlash2, con ruta adicional de proposal head indexada de 131.072 filas.
- Capacidades agénticas y de razonamiento multi-paso, según las etiquetas del autor.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en local sobre RTX 5090: el modelo cabe en 22,8 GB de pesos y aprovecha la caché de prefijo de Infernix (90 % de tokens de prompt servidos desde caché en una repetición agéntica de coding), lo que lo hace viable para sesiones interactivas de edición sobre un repositorio.
- Análisis de documentos largos con imágenes: con 262.144 tokens de contexto y torre de visión, puede procesar informes, contratos o papers con figuras en una sola pasada sin troceado.
- Transcripción y descripción de vídeo o imagen: el pipeline `image-text-to-text` permite construir pipelines de etiquetado o descripción automática de contenido visual.
- Razonamiento con presupuesto de tokens ajustado: el ajuste Swift reduce la longitud de las cadenas de pensamiento, útil en producción donde el coste por consulta depende del número de tokens generados.
- Despliegue en estación de trabajo con una sola GPU: al ser un fichero único `.ninfer` sin paso de conversión, se arranca con `infernix-serve` o `ninfer-serve` apuntando al fichero, lo que simplifica el aprovisionamiento frente a stacks multi-fichero.
- Prototipado de agentes multi-paso: la combinación de contexto largo, decodificación especulativa y MTP reduce la latencia por turno en bucles agénticos con prompts repetidos.
- Evaluación de cuantización NVFP4 en Blackwell: sirve como banco de pruebas para medir el impacto de W4A4 en calidad frente al checkpoint BF16 de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica explícitamente que no ha medido las afirmaciones de eficiencia de tokens de UkisAI.

Los únicos datos de rendimiento disponibles son de motor, medidos por el autor sobre el artefacto oficial de 27B de NInfer, no sobre este fichero:

| Metrica | Resultado reportado |
|---|---|
| Tokens de prompt servidos desde caché de prefijo (replay agéntico de coding) | 90 % |
| Tiempo hasta el primer token frente a NInfer | aproximadamente la mitad |
| Velocidad de prefill de prompts largos frente a NInfer | 1,3-1,5x |
| Tiempo de conversión del artefacto (CPU) | 4-5 minutos |

## Requisitos de hardware

- VRAM estimada: el fichero pesa 22,78 GB, por lo que se necesita una GPU con al menos 24 GB para cargar los pesos, más memoria adicional para caché KV y activaciones.
- GPU objetivo: NVIDIA RTX 5090 (sm_120a, Blackwell), única arquitectura para la que se construyó el artefacto según el autor.
- Los kernels NVFP4 W4A4 requieren soporte Blackwell; no se documenta compatibilidad con Ada (RTX 4090) ni con A100/H100 en la información disponible.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB). En RTX 4090 (24 GB) el margen es muy ajustado y la falta de kernels NVFP4 nativos hace improbable su funcionamiento.
- Opciones de despliegue: Infernix (recomendado por el autor, con `infernix-serve`), NInfer (`ninfer-serve`) y ninfer-custom. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.ninfer`.
- Throughput y latencia: solo se reportan cifras relativas frente a NInfer (prefill 1,3-1,5x más rápido, primer token en aproximadamente la mitad de tiempo); no se publican tokens por segundo absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-NVFP4-NInferV3 (este) | 27B | 262.144 | `.ninfer`, NVFP4/FP8 mixto | swift-open-license-1.0 | Solo Infernix/NInfer, objetivo RTX 5090 |
| ukisai/Swift-Qwen3.8-27B-NVFP4 | 27B | 262.144 (heredado) | NVFP4/FP8 (ModelOpt) | no disponible en la información | Checkpoint de origen, requiere motor compatible con ModelOpt |
| nvidia/Qwen3.8-27B-NVFP4 | 27B | no disponible | NVFP4/FP8 (ModelOpt) | no disponible en la información | Referencia de mapeo de precisión; sin ajuste Swift |
| ukisai/Swift-Qwen3.8-27b (BF16) | 27B | 262.144 (heredado) | BF16 | no disponible en la información | Referencia de calidad sin cuantizar; requiere mucha más VRAM |

No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes.

## Limitaciones y advertencias

- El propio autor declara que el artefacto, la conversión y la mayor parte de la model card se hicieron con IA (mayoritariamente Claude Opus 5.5) y que es trabajo de hobby, probablemente incompleto o inexacto.
- Las afirmaciones de eficiencia de tokens del ajuste Swift provienen de UkisAI y no han sido verificadas por el autor de este artefacto.
- Formato propietario `.ninfer`: no es portable a vLLM, llama.cpp, Ollama ni TGI, lo que limita su uso a los motores Infernix y NInfer.
- Dependencia de hardware muy específica (RTX 5090, sm_120a): no hay garantía de funcionamiento en otras GPU, incluidas A100, H100 o RTX 4090.
- La licencia swift-open-license-1.0 está etiquetada como `other`; deben revisarse los términos del fichero LICENSE antes de cualquier uso comercial. El artefacto incorpora además Apache 2.0 de Qwen3.8-27B y DFlash2.
- Riesgo de alucinación inherente a los modelos de 27B con modo thinking; no se documentan evaluaciones de fidelidad.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe homogéneo.
- Sesgos conocidos: no documentados en la información disponible.
- La cuantización W4A4 en las proyecciones MLP puede degradar la calidad frente al BF16; no se publican métricas que cuantifiquen esa pérdida.
- El repositorio tiene 735 descargas y 0 likes en el momento de la consulta, con un único mantenedor; el soporte y la continuidad no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wallawalla47/Swift-Qwen3.8-27B-NVFP4-NInferV3
- Modelo base (checkpoint cuantizado): https://huggingface.co/ukisai/Swift-Qwen3.8-27B-NVFP4
- Modelo base en BF16: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Referencia de cuantización de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Motor Infernix (recomendado): https://github.com/Wallawalla47/Infernix
- Receta de conversión: https://github.com/Wallawalla47/Infernix/blob/main/tools/convert/official_recipes.py
- Benchmarks Infernix vs NInfer: https://github.com/Wallawalla47/Infernix#qwen38-27b-infernix-vs-ninfer
- Motor NInfer: https://github.com/Neroued/ninfer
- Fork ninfer-custom: https://github.com/Wallawalla47/ninfer-custom
- Artefacto equivalente sobre NVIDIA NVFP4: https://huggingface.co/Wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3
- Swift 1.5 Qwen3.8-Flash-Next: https://huggingface.co/Wallawalla47/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-Dense8-Infernix
