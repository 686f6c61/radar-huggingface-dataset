# w8s/Qwen3.5-0.8B

## Resumen

Qwen3.5-0.8B es el miembro de menor tamaño de la familia Qwen3.5, desarrollada por el equipo Qwen de Alibaba. Se trata de un modelo de lenguaje causal con codificador de visión, es decir, un modelo multimodal de imagen y texto a texto, orientado a prototipado, ajuste fino específico y experimentación. La versión alojada en el repositorio w8s/Qwen3.5-0.8B es una copia comunitaria derivada de Qwen/Qwen3.5-0.8B-Base, publicada bajo licencia Apache 2.0 y con 873.438.784 parámetros reales según los ficheros safetensors.

La arquitectura es un transformer híbrido de 24 capas que combina Gated DeltaNet (atención lineal con estado recurrente) y Gated Attention (atención completa con RoPE), con una dimensión oculta de 1024 y un vocabulario de 248.320 tokens atados a la capa de salida. La longitud de contexto nativa es de 262.144 tokens, lo que resulta poco habitual en un modelo de menos de mil millones de parámetros y lo convierte en un candidato interesante para tareas de contexto largo con requisitos de memoria reducidos.

Su relevancia actual radica en dos factores: por un lado, el entrenamiento con fusión temprana de tokens multimodales, que según el autor iguala a Qwen3 en razonamiento, código y agentes; por otro, la eficiencia de la atención híbrida, que reduce drásticamente el coste de la caché KV al mantener atención completa solo en una fracción de las capas. El soporte declarado de 201 idiomas y dialectos amplía su aplicabilidad fuera del ámbito anglosajón.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión; 24 capas con disposición 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 873.438.784 (≈0,8 B, dato real de los ficheros safetensors) |
| Parametros activos | no disponible (la model card describe FFN densa; la mención a MoE disperso es a nivel de familia, sin detalle de expertos para esta variante) |
| Longitud de contexto | 262.144 tokens de forma nativa |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | 201 idiomas y dialectos (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |
| Dimension oculta | 1024 |
| Tamano de vocabulario | 248.320 tokens (con padding, atado a la embedding de entrada) |
| Capas | 24 |
| Gated DeltaNet | 16 cabezas lineales para V y 16 para QK, dimensión de cabeza 128 |
| Gated Attention | 8 cabezas para Q y 2 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones |
| FFN | Dimensión intermedia 3584 |
| MTP | Entrenado con múltiples pasos (multi-token prediction) |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

El modelo sigue un diseño híbrido poco convencional dentro de la gama pequeña. Cada bloque de cuatro capas repite tres unidades de Gated DeltaNet seguidas de una unidad de Gated Attention. Las capas de Gated DeltaNet son mecanismos de atención lineal con estado recurrente que escalan de forma lineal con la longitud de secuencia y no requieren caché KV creciente; las capas de Gated Attention son atención completa clásica con RoPE de 64 dimensiones y solo 2 cabezas KV por 8 cabezas Q, lo que limita el crecimiento de la caché. El resultado son 18 capas lineales y 6 capas de atención completa, un reparto que explica que el modelo pueda sostener 262.144 tokens de contexto con un coste de memoria contenido.

El entrenamiento consta de fases de preentrenamiento y postentrenamiento, con fusión temprana de tokens multimodales: los tokens de imagen se integran desde las primeras etapas en lugar de añadirse mediante un adaptador posterior. La model card menciona escalado de aprendizaje por refuerzo en entornos con millones de agentes y distribuciones de tareas progresivamente más complejas, así como una infraestructura de entrenamiento multimodal con una eficiencia cercana al 100 % respecto al entrenamiento solo de texto. También se indica que el modelo se entrenó con MTP (multi-token prediction) en varios pasos, lo que habilita decodificación especulativa nativa. No se especifica en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en modo no thinking y, presumiblemente, modo thinking, dado que la tabla de benchmarks separa explícitamente el modo no thinking.
- Comprensión de imágenes y texto a texto (pipeline image-text-to-text), con codificador de visión integrado y fusión temprana de tokens multimodales.
- Razonamiento visual y comprensión de documentos con imágenes, según las capacidades declaradas a nivel de familia.
- Generación de código y tareas de agentes, con paridad declarada frente a Qwen3 y superioridad declarada frente a Qwen3-VL en los benchmarks de la familia.
- Soporte multilingüe amplio: 201 idiomas y dialectos según la model card.
- Contexto largo nativo de 262.144 tokens, apto para resúmenes de documentación extensa y conversaciones multi-turno prolongadas.
- Decodificación especulativa mediante MTP entrenado con múltiples pasos.
- Soporte de tool calling y function calling: no se detalla explícitamente en la información proporcionada, aunque la model card menciona benchmarks de agentes.

## Casos de uso

- Prototipado rápido de asistentes multimodales: con 873 millones de parámetros y pesos de menos de 2 GB en precisión nativa, permite iterar en una estación de trabajo sin GPU de datacenter y validar flujos de imagen más texto antes de escalar a modelos mayores.
- Ajuste fino específico de dominio: la licencia Apache 2.0 y el tamaño reducido hacen viable un fine-tuning completo o con LoRA sobre un corpus propio en una única GPU consumer, algo inviable con modelos de 70B.
- Procesamiento de documentos largos con elementos visuales: la ventana de 262.144 tokens permite ingerir contratos, informes o manuales completos junto con sus figuras y tablas sin segmentación previa.
- Extracción estructurada de información a partir de capturas o escaneos: al ser un modelo image-text-to-text, puede convertir formularios, facturas o tickets en JSON para integrarlos en un pipeline de datos.
- Clasificación y enrutado multimodal en producción: su bajo coste de inferencia lo hace apto para actuar como primera etapa que filtra o etiqueta contenido visual antes de invocar un modelo mayor, reduciendo el gasto total.
- Evaluación comparativa y docencia: sirve como referencia de arquitectura híbrida lineal más atención para estudiar el comportamiento de Gated DeltaNet frente a atención completa en contextos de 100.000 tokens o más.
- Investigación sobre decodificación especulativa: el entrenamiento MTP permite experimentar con decodificación especulativa sin necesidad de un modelo borrador externo.
- Asistentes de accesibilidad: descripción de imágenes y lectura de documentos en tiempo casi real sobre hardware modesto, con cobertura de 201 idiomas.

## Benchmarks y rendimiento

Los datos siguientes proceden de la tabla incluida en la model card, en modo no thinking. La información proporcionada está truncada, por lo que solo se reproducen las tres primeras filas disponibles.

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han facilitado resultados para HumanEval, GSM8K, MMMU ni otros benchmarks de visión, código o matemáticas en la información disponible. Tampoco se incluyen resultados del modo thinking.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 1,75 GB (873.438.784 parámetros × 2 bytes), coherente con el tamaño de repositorio de 1,8 GB.
- Estimación en cuantización de 8 bits: en torno a 0,9 GB; en 4 bits, entre 0,5 y 0,6 GB. Son estimaciones de cálculo directo, no datos publicados.
- Caché KV: con solo 6 capas de atención completa, 2 cabezas KV y dimensión de cabeza 256, el coste ronda los 12 KB por token en bf16, es decir, unos 3 GB para los 262.144 tokens de contexto completo. Estimación derivada de la configuración declarada.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En cuantización de 4 bits podría ejecutarse en GPUs de 8 GB e incluso en iGPU con memoria compartida, siempre que se gestione bien la caché de contexto largo.
- GPU de datacenter: A100, H100, L40S o cualquier acelerador con más de 16 GB permiten trabajar con contexto completo y lotes grandes.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card. La compatibilidad con llama.cpp, Ollama o TGI no se menciona en la información disponible.
- Latencia y throughput: no disponibles. La ventaja teórica del diseño híbrido es un coste de atención lineal en 18 de las 24 capas, con ganancias crecientes a medida que aumenta la longitud de secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro (no thinking) | MMLU-Redux | C-Eval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3.5-0.8B | 873 M | 262.144 | 29,7 | 48,5 | 46,4 | Apache 2.0 | Hugging Face, multimodal |
| Qwen3.5-2B | no disponible | no disponible | 55,3 | 69,2 | 65,2 | no disponible | Hugging Face |
| Qwen3-1.7B | 1,7 B | no disponible | 40,2 | 64,4 | 61,0 | no disponible | Hugging Face |
| Qwen3-4B-2507 | ≈4 B | no disponible | 69,6 | 84,2 | 80,2 | no disponible | Hugging Face |

La comparativa se limita a los modelos presentes en la tabla de benchmarks de la model card. Qwen3.5-0.8B es el más pequeño y el que obtiene las puntuaciones más bajas, pero también el único de la comparativa con arquitectura híbrida lineal declarada y ventana de 262.144 tokens confirmada. Los datos de contexto, licencia y especificaciones del resto de modelos no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación elevado: con menos de mil millones de parámetros y un MMLU-Pro de 29,7 en modo no thinking, el modelo fallará con frecuencia en preguntas de conocimiento factual y razonamiento complejo.
- El repositorio w8s/Qwen3.5-0.8B registra 0 descargas y 0 likes en el momento de la consulta y no aporta información propia sobre el proceso de ajuste. La model card citada corresponde al modelo oficial de Qwen, no necesariamente a los pesos exactos de esta copia. Se recomienda verificar la procedencia o usar directamente Qwen/Qwen3.5-0.8B.
- Uso previsto declarado por el autor: prototipado, ajuste fino específico e investigación. No está posicionado como modelo listo para producción de alta exigencia.
- No se detallan sesgos conocidos, composición del dataset ni medidas de mitigación en la información disponible.
- Idiomas: se declaran 201 idiomas y dialectos, pero no se aportan métricas por idioma, por lo que el rendimiento real en lenguas minoritarias es desconocido.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el fichero de licencia enlazado apunta al repositorio oficial de Qwen, por lo que conviene confirmar los términos exactos de la versión distribuida.
- La tabla de benchmarks disponible está truncada y corresponde únicamente al modo no thinking; no hay datos de robustez, seguridad ni evaluación de sesgos.
- Contexto largo: aunque la ventana es de 262.144 tokens, no se documenta el rendimiento efectivo en el extremo de esa ventana ni si se aplicaron técnicas de extrapolación.
- La compatibilidad con llama.cpp, Ollama y TGI no está confirmada, lo que puede limitar las opciones de despliegue en entornos ya estandarizados sobre esas herramientas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/w8s/Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Modelo oficial de referencia: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Blog de la familia Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Demo de chat: https://chat.qwen.ai
