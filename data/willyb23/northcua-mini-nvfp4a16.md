# willyb23/NorthCUA-Mini-NVFP4A16

## Resumen

NorthCUA-Mini-NVFP4A16 es una cuantización no oficial del modelo beipo-ai/NorthCUA-Mini, un modelo de mezcla de expertos (MoE) de 35.107 millones de parámetros totales y aproximadamente 3.000 millones activos, construido sobre la arquitectura Qwen3.5 y orientado a tareas de computer use (uso de ordenador) y agentes. La cuantización la firma el usuario independiente willyb23 y reduce el checkpoint original de 70,2 GB a 23,9 GB manteniendo los expertos enrutados en NVFP4 y el resto de componentes en BF16.

El problema que resuelve es de despliegue: el checkpoint BF16 original requiere aproximadamente 70 GB de pesos, lo que obliga a GPUs de gama muy alta o a múltiples tarjetas. Con esta versión, vLLM mantiene los pesos en 22,3 GiB de memoria de GPU, lo que permite servir el modelo en una sola tarjeta profesional (RTX PRO 6000 Blackwell de 96 GB) con contexto largo de hasta 65.536 tokens y margen para caché KV.

Es relevante ahora porque los modelos de computer use necesitan capacidades multimodales (entrada de imagen y texto), razonamiento con modo thinking y tool calling, y este checkpoint las preserva íntegramente al cuantizar solo las proyecciones de los expertos enrutados. La licencia es Apache 2.0 y el formato es compatible directamente con vLLM 0.32.0 sin flags adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre Qwen3.5, con atención, atención lineal (Gated DeltaNet) y expertos enrutados |
| Parámetros totales | 35.107.181.936 (35,1 B) |
| Parámetros activos | Aproximadamente 3 B (según la model card del autor de la cuantización) |
| Longitud de contexto | Hasta 65.536 tokens en el ejemplo de despliegue con vLLM (`--max-model-len 65536`) |
| Tipos de cuantización | NVFP4 (FP4 E2M1) para pesos de expertos enrutados, con escala FP8 (E4M3) por cada 16 pesos y escala global FP32 por matriz; resto en BF16; activaciones BF16 (weight-only, "A16") |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con compressed-tensors `nvfp4-pack-quantized` (layout NVFP4A16 de llm-compressor) |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos construida sobre Qwen3.5 con 40 capas y 256 expertos enrutados por capa. Combina atención estándar con atención lineal (Gated DeltaNet), un experto compartido, router, embeddings y cabeza de lenguaje (LM head). Incluye además un codificador de visión y un módulo merger para la entrada multimodal imagen-texto. Los parámetros totales alcanzan 35,1 B, con aproximadamente 3 B activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño.

Sobre el entrenamiento del modelo original no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO o etapas de ajuste). Lo que sí está documentado es el proceso de cuantización: se aplicó un redondeo al más cercano (round-to-nearest) sin datos de calibración, usando las funciones NVFP4 propias de compressed-tensors, matriz de experto a matriz de experto, partiendo de los pesos BF16 publicados en la revisión `ca2b95a`. Los expertos originales están almacenados fusionados y aquí se separan por experto. Las proyecciones gate y up de cada experto comparten una escala global, que vLLM mantiene al fusionarlas en una sola matriz. El error relativo de pesos medido (norma de Frobenius, expertos muestreados en cada shard) es del 9,49 % de media y del 9,55 % máximo, valor típico para NVFP4 con round-to-nearest.

## Capacidades

- Generación de texto y razonamiento con modo thinking explícito, cuyo contenido se devuelve en un campo separado (`reasoning`) en vLLM 0.32.
- Comprensión de imágenes (pipeline image-text-to-text): interpretación de capturas de pantalla, diálogos e interfaces gráficas.
- Computer use: generación de acciones GUI con coordenadas en espacio normalizado 0–1000 (`normalized_1000`), pensado para ejecutarse con el NorthCUA Harness.
- Tool calling / function calling nativo, con parser `qwen3_coder` en vLLM y soporte de `--enable-auto-tool-choice`.
- Razonamiento multi-paso y uso como agente dentro de bucles de decisión.
- Aritmética y resolución de problemas verbales sencillos (el ejemplo de la model card resuelve un problema de velocidad y distancia).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas de escritorio: el modelo interpreta capturas de pantalla y emite coordenadas normalizadas 0–1000 que el NorthCUA Harness convierte a píxeles, lo que permite hacer clic, escribir y navegar por aplicaciones sin integraciones específicas por app.
- Agentes de navegación web: con tool calling y contexto de hasta 65.536 tokens, puede mantener el historial de una sesión larga de navegación y decidir la siguiente acción en cada paso.
- Asistencia en atención al cliente sobre interfaces propias: al comprender imágenes de la pantalla del usuario, puede guiarle paso a paso por un formulario o un diálogo, combinando razonamiento y descripción visual.
- Rellenado y validación de formularios: el modelo lee el estado visual del formulario y genera las acciones de entrada necesarias, lo que encaja en flujos de back office con aplicaciones legacy sin API.
- Pruebas de regresión de interfaz (QA automatizado): un agente basado en este modelo puede recorrer flujos de UI, verificar que los elementos esperados aparecen y reportar desviaciones, usando el modo thinking para justificar cada decisión.
- Orquestación de herramientas en pipelines internos: gracias al soporte de function calling con parser qwen3_coder, puede integrarse como planificador que decide qué herramienta invocar (consulta de clima, APIs internas, etc.) en un servidor vLLM compatible con la API de OpenAI.
- Despliegue en una sola GPU profesional: con 22,3 GiB de pesos en memoria, es viable servir el modelo en una RTX PRO 6000 Blackwell de 96 GB con contexto de 65.536 tokens, lo que facilita entornos de desarrollo y demos sin clúster multi-GPU.

## Benchmarks y rendimiento

La model card de la cuantización incluye una comparación de pruebas funcionales frente al checkpoint BF16 original, servidos ambos con vLLM 0.32.0 y decodificación greedy en sendas RTX PRO 6000 Blackwell de 96 GB. La información disponible solo detalla parcialmente una de las pruebas (sonda aritmética con 17 × 23), por lo que no se presenta una tabla de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no se han publicado en la información disponible.

| Prueba | Este checkpoint NVFP4 | Original BF16 |
|---|---|---|
| Sonda aritmética (17 × 23) | No disponible (resultado truncado en la información) | No disponible (resultado truncado en la información) |
| Error relativo de pesos (Frobenius) | 9,49 % medio, 9,55 % máximo | Referencia (0 %) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 22,3 GiB solo para pesos según la model card; el consumo total depende de la longitud de contexto y del tamaño de la caché KV. El checkpoint en disco ocupa 23,9 GB (24,0 GB de repositorio).
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) es la tarjeta en la que se probó. Cualquier GPU con soporte de kernels FP4 de vLLM (familia Blackwell) es la opción natural; no se documenta funcionamiento en generaciones anteriores.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen. La cuantización solo reduce los expertos a NVFP4 y mantiene atención, embeddings y visión en BF16, por lo que el margen en tarjetas de 24 GB es muy ajustado y no está verificado.
- Opciones de despliegue: vLLM 0.32.0 (probado, selecciona automáticamente el kernel Marlin FP4 MoE). SGLang no probado (lee compressed-tensors, pero este layout NVFP4 weight-only no se ha ensayado). llama.cpp y Ollama no cargan este formato; para ellos hay que usar un GGUF del original, como bartowski/beipo-ai_NorthCUA-Mini-GGUF. TensorRT-LLM no soporta este checkpoint porque espera el layout NVFP4 de ModelOpt.
- Latencia y throughput: no disponibles. La model card no publica medidas de tokens por segundo ni latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NorthCUA-Mini-NVFP4A16 (este) | 35,1 B totales / ~3 B activos | 65.536 tokens (configurado en vLLM) | Apache 2.0 | HuggingFace, formato compressed-tensors NVFP4A16 | Cuantización comunitaria no oficial; solo vLLM probado |
| beipo-ai/NorthCUA-Mini (original BF16) | 35,1 B totales / ~3 B activos | No disponible | Apache 2.0 | HuggingFace | Checkpoint de referencia; ~70,2 GB, requiere más VRAM |
| bartowski/beipo-ai_NorthCUA-Mini-GGUF | 35,1 B totales / ~3 B activos | No disponible | Apache 2.0 | HuggingFace | Alternativa para llama.cpp y Ollama; niveles de cuantización GGUF no detallados |

No se dispone de datos de benchmarks comparativos con otros modelos de computer use en la información proporcionada, por lo que no se incluyen cifras de rendimiento relativo.

## Limitaciones y advertencias

- Es una cuantización no oficial: no está afiliada ni respaldada por el equipo de NorthCUA ni por Qwen. Para uso en producción conviene validar el comportamiento frente al BF16 original en las tareas concretas.
- La cuantización NVFP4 introduce un error relativo de pesos de en torno al 9,5 %, típico de round-to-nearest sin calibración; puede degradar tareas sensibles a precisión numérica (aritmética fina, coordenadas exactas) y no se han publicado evaluaciones exhaustivas de esa degradación.
- El modo thinking está activado por defecto; con thinking desactivado el modelo puede empezar la respuesta con una nota de planificación breve antes de la respuesta final, lo que complica el parseo si se espera texto limpio.
- Las coordenadas GUI deben manejarse en el espacio normalizado 0–1000 y convertirse a píxeles con el Harness; un uso directo sin esa conversión produce acciones incorrectas.
- Compatibilidad de motores limitada: solo vLLM 0.32.0 está probado; SGLang no se ha ensayado y TensorRT-LLM no es compatible con este layout.
- Idiomas soportados no documentados; no hay garantía de calidad multilingüe más allá de lo que herede el modelo base.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en la descripción de elementos de interfaz que no están presentes en la captura; conviene validar las acciones antes de ejecutarlas en sistemas reales.
- Sesgos conocidos: no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero al ser una cuantización derivada conviene conservar los avisos de atribución del modelo base y del autor de la cuantización.

## Enlaces

- HuggingFace (esta cuantización): https://huggingface.co/willyb23/NorthCUA-Mini-NVFP4A16
- Modelo base: https://huggingface.co/beipo-ai/NorthCUA-Mini
- GGUF del original (bartowski): https://huggingface.co/bartowski/beipo-ai_NorthCUA-Mini-GGUF
- NorthCUA Harness (repositorio oficial): https://github.com/china-qijizhifeng/NorthCUA-Harness
- compressed-tensors: https://github.com/vllm-project/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
