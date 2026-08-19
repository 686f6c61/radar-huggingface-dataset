# trentzap/QTensor-Llama-3-8B-Demo

## Resumen

QTensor-Llama-3-8B-Demo es un checkpoint experimental publicado por Trent Parsons (trentzap) que demuestra la viabilidad de ejecutar una arquitectura de 8.000 millones de parámetros (basada en Meta-Llama-3-8B) dentro de un presupuesto de VRAM inferior a 5 GB. Para lograrlo, el autor aplica una técnica de compresión híbrida denominada ASVD-Bridge, que combina descomposición en valores singulares (SVD) con cuantización INT4 simulada (Fake-INT4) en las capas MLP, y ajuste fino mediante LoRA en las proyecciones de atención. El resultado es un modelo con 2.481.548.288 parámetros físicos en disco, pero que conserva la profundidad completa de 32 capas, la dimensión de embedding de 4096 y el ancho MLP de 14336 del Llama-3 original.

Este checkpoint se publica como una demostración de hardware y arquitectura, no como un modelo de chat funcional. Se encuentra en el paso 230 de un entrenamiento de destilación de 5.000 pasos, por lo que su coherencia semántica está degradada y no es adecuado para tareas de producción. Su relevancia radica en que permite a investigadores y desarrolladores verificar el motor de inferencia ASVD-Bridge, medir reducciones de FLOPs y validar el límite físico de 4,67 GB de VRAM en GPUs de consumo, algo que podría tener implicaciones para el despliegue de LLMs en entornos con recursos limitados.

La licencia es MIT, el idioma soportado es inglés y los pesos se distribuyen en formato safetensors. El repositorio de código fuente está disponible públicamente en GitHub, lo que permite auditar la implementación matemática de la compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-3-8B comprimida con ASVD-Bridge (SVD + LoRA + Fake-INT4 QAT) |
| Parametros totales | 2.481.548.288 (pesos físicos en safetensors; el modelo original tiene 8,03B) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (Fake-INT4 en MLP), SVD de baja precisión, LoRA |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura estándar de Meta-Llama-3-8B (32 capas, embedding de 4096, MLP de 14336) y la comprime mediante tres mecanismos combinados:

1. **Atención (q/k/v/o_proj)**: se aplica SVD con rango dinámico por capa, donde el rango se asigna según la entropía de los pesos. Las matrices de proyección se factorizan en dos matrices de rango reducido ($d \times r$ y $r \times d$), y se añade un adaptador LoRA para recuperar capacidad.
2. **MLP (gate/up/down_proj)**: se aplica "Fake-INT4 Slicing", una técnica que simula cuantización INT4 recortando las dimensiones de salida de las proyecciones, reduciendo así el número de parámetros almacenados.
3. **Subspace Bridge**: un escalar aprendible que alinea los estados ocultos del estudiante con el manifold del profesor FP16.

El entrenamiento utiliza destilación de conocimiento con pérdida KL-divergence contra el profesor `NousResearch/Meta-Llama-3-8B`, sobre el dataset Alpaca (52.000 instrucciones). Se entrenaron 230 pasos de un total planificado de 5.000, con batch size 4 y acumulación de gradiente ×8 (batch efectivo 32), en una NVIDIA RTX 5080 de 16 GB. Los tokens `<pad>` se enmascaran en la pérdida para forzar convergencia semántica. El checkpoint actual es un punto intermedio; el autor advierte que aún está reaprendiendo límites de tokens y gramática básica.

## Capacidades

- Generación de texto básica: el modelo puede producir secuencias de texto, pero con coherencia semántica degradada debido al bajo número de pasos de destilación.
- Inferencia eficiente en VRAM: ejecuta en 4,67 GB de VRAM, frente a los ~15 GB del FP16 original, con un throughput de 32,93 tokens/s en RTX 5080.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Razonamiento multi-step: no disponible (el modelo no es funcional para tareas de razonamiento).
- Capacidades multilingües: solo inglés (según metadatos).
- Capacidades especiales: ninguna; es un demo de hardware, no un modelo de propósito general.

## Casos de uso

- **Validación de motores de inferencia comprimidos**: los investigadores pueden cargar el modelo con `trust_remote_code=True` y verificar que el motor ASVD-Bridge ejecuta correctamente la inferencia dentro de los límites de VRAM declarados, midiendo consumo de memoria y throughput real.
- **Medición de reducción de FLOPs**: al comparar el número de parámetros físicos (2,48B) con el original (8,03B), se puede cuantificar la reducción de operaciones de punto flotante por token y evaluar su impacto en latencia.
- **Estudio de destilación de conocimiento en etapas tempranas**: el checkpoint en el paso 230 permite analizar cómo evoluciona la pérdida KL y la calidad de las representaciones intermedias durante el proceso de destilación, útil para diseñar mejores estrategias de QAD.
- **Benchmark de compresión extrema**: sirve como referencia para comparar técnicas de compresión (SVD, cuantización INT4, LoRA) frente a otros métodos como GPTQ, AWQ o SpinQuant, en términos de footprint y degradación de calidad.
- **Desarrollo de pipelines de exportación**: el código de exportación y el training loop están disponibles en GitHub, por lo que se puede adaptar el flujo ASVD-Bridge para otros modelos base y evaluar su generalización.
- **Educación e investigación académica**: como ejemplo práctico de cómo combinar SVD, cuantización y destilación en un solo pipeline, puede utilizarse en cursos de sistemas de ML o en trabajos de fin de grado sobre optimización de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de hardware:

| Metric | FP16 Baseline | QTensor Asymmetric Demo |
|---|---|---|
| VRAM (inferencia) | ~15,0 GB | 4,67 GB |
| Throughput | ~15 t/s | 32,93 t/s |
| QAD training loss | — | 5,26 |
| Coherencia de generación | Sí | Degradada (demo checkpoint) |

Estas cifras se obtuvieron en una NVIDIA RTX 5080 con CUDA 13.2. No hay comparación con otros modelos comprimidos.

## Requisitos de hardware

- VRAM estimada para inferencia: 4,67 GB (según medición del autor en RTX 5080).
- GPU recomendadas: cualquier GPU con al menos 5 GB de VRAM; el autor usó una RTX 5080 de 16 GB para el entrenamiento, pero la inferencia cabe en GPUs de gama media como RTX 3060 12GB, RTX 4060 8GB, o incluso en tarjetas con 6 GB si se ajusta el batch.
- Compatibilidad con consumer GPU: sí, es el objetivo principal del demo.
- Opciones de despliegue: el modelo se carga mediante `transformers` con `trust_remote_code=True`; también es compatible con text-generation-inference (según tags de HuggingFace). No se mencionan formatos GGUF ni compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: 32,93 tokens/s medidos en RTX 5080; en GPUs más modestas se espera menor throughput, pero no hay datos publicados.

## Comparativa con modelos similares

No hay comparativas directas publicadas con otros modelos comprimidos. Como referencia contextual, se puede comparar con el Llama-3-8B original y con alternativas de compresión estándar:

| Modelo | Parametros | Contexto | VRAM inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QTensor-Llama-3-8B-Demo | 2,48B físicos (8,03B originales) | no disponible | 4,67 GB | MIT | HuggingFace |
| Meta-Llama-3-8B (FP16) | 8,03B | 8K | ~15 GB | Llama 3 Community License | HuggingFace |
| Qwen3-8B | 8B | 32K | ~16 GB (FP16) | Apache 2.0 | HuggingFace |
| Llama-3.1-8B-Instruct (w4a16) | 8B | 128K | ~5-6 GB | Llama 3.1 Community License | Qualcomm AI Hub |

La comparativa es orientativa; el QTensor es un demo experimental, no un modelo de producción, mientras que las alternativas son modelos funcionales con licencias y ecosistemas maduros.

## Limitaciones y advertencias

- **No es un modelo funcional**: se encuentra en el paso 230 de 5.000 de destilación; la coherencia semántica está degradada y el modelo alucina de forma severa. No debe usarse para preguntas factuales, generación de código, razonamiento ni despliegues en producción.
- **Sesgos del dataset**: la destilación se realizó sobre Alpaca (52K instrucciones), que hereda sesgos y limitaciones de los datos originales de instrucción.
- **Riesgo de alucinación**: extremadamente alto en este checkpoint; cualquier salida debe considerarse no fiable.
- **Longitud de contexto no documentada**: no se especifica la ventana de contexto soportada; se desconoce si el modelo maneja correctamente secuencias largas.
- **Soporte limitado**: solo inglés; no hay garantías de funcionamiento en otros idiomas.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero el modelo no es apto para producción, por lo que el uso comercial real es inviable en su estado actual.
- **Dependencia de código remoto**: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor no auditado; se recomienda revisar el repositorio antes de usarlo.
- **Fechas futuras**: el modelo fue creado en agosto de 2026, lo que sugiere que puede ser un artefacto de prueba o una simulación; no se ha verificado su reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/trentzap/QTensor-Llama-3-8B-Demo
- Código fuente (motor ASVD-Bridge): https://github.com/Trentzap1/qtensor-engine
- Perfil del autor en HuggingFace: https://huggingface.co/trentzap
- Modelo profesor: https://huggingface.co/NousResearch/Meta-Llama-3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/tatsu-lab/alpaca
