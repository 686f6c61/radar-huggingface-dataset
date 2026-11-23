# wcs2024/smollm2-1.7b-sp-safemid

## Resumen
SmolLM2-1.7B SP + Safe-Mid es un modelo base de 1.700 millones de parametros con arquitectura Llama, derivado de SmolLM2-1.7B de Hugging Face. Lo publica el usuario wcs2024 y consiste en un mid-training de 60.000 millones de tokens sobre el checkpoint de preentrenamiento estándar `locuslab/base-smollm2-1.7b-all_raw_folders_baseline-600B`, con una mezcla de datos de alta calidad que incorpora un tercio de datos de seguridad (refuseweb, moral_education y safeweb).

El interés del modelo está en su enfoque de "mid-training seguro": en lugar de aplicar un ajuste fino de alineamiento posterior, se reentrena el modelo base sobre una distribución que combina matemáticas (finemath, dolmino math), texto educativo (cosmopedia, fineweb-edu), instrucciones FLAN y datos de rechazo y razonamiento moral. El resultado es un modelo base, no instruction-tuned, con un sesgo estructural hacia respuestas seguras desde la fase de preentrenamiento.

Con 1.812.039.680 parámetros reales en safetensors, licencia MIT y pesos en bf16, el modelo está pensado para servir de punto de partida a quien necesite un base model pequeño con comportamiento de seguridad incorporado, sobre el que después aplicar SFT o DPO. No se han publicado benchmarks ni métricas de alineamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (SmolLM2-1.7B) |
| Parámetros totales | 1.812.039.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (entrenado con secuencias de 2.048 tokens) |
| Tipos de cuantización | no disponible oficialmente; al ser pesos bf16 y arquitectura Llama, es convertible a GGUF/AWQ/GPTQ con herramientas estándar |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento
La arquitectura es la de SmolLM2-1.7B: un transformer decoder-only tipo Llama con atención causal estándar, sin innovaciones de atención lineal ni decodificación especulativa documentadas. El modelo parte del checkpoint `locuslab/base-smollm2-1.7b-all_raw_folders_baseline-600B` y se somete a un mid-training de 28.610 pasos con longitud de secuencia 2.048, batch global de 1.024 secuencias (unos 2,1 millones de tokens por paso) y un total de 60.000 millones de tokens.

La mezcla de datos asigna pesos por fuente, con cada secuencia de 2.048 tokens proveniente de una única fuente. Los pesos principales son safeweb (0,1685), dolmino FLAN (0,1233), cosmopedia-v2 (0,1000), finemath-4plus (0,1000) y dolmino math (0,1000), seguidos de moral_education (0,0985), refuseweb (0,0664), finemath-3plus (0,0600), dolmino peS2o (0,0600), fineweb-edu-dedup (0,0567), dolmino Wiki (0,0500) y dolmino StackExchange (0,0167). Los datos de seguridad suman aproximadamente un tercio de la mezcla.

El entrenamiento usó AdamW con betas (0,9, 0,95), epsilon 1e-8 y weight decay 0,01, tasa de aprendizaje máxima de 3,5e-4 con warmup lineal de 500 pasos y decaimiento lineal posterior, precisión fp32 con autocast bf16, sobre 8 GPUs H200. La pérdida final de entrenamiento fue 1,157. No se documenta RLHF ni DPO; es un modelo exclusivamente preentrenado/mid-trained.

## Capacidades
- Generación de texto autoregresiva en inglés, como modelo base sin instrucciones.
- Razonamiento matemático reforzado por la presencia de finemath-3plus, finemath-4plus y dolmino math en la mezcla.
- Conocimiento enciclopédico y científico procedente de dolmino Wiki y dolmino peS2o.
- Capacidad de seguir formatos de instrucción de forma limitada, gracias al 12,33 % de dolmino FLAN, aunque sin un ajuste SFT dedicado.
- Comportamiento de rechazo y razonamiento moral incorporado por el mid-training con refuseweb, moral_education y safeweb.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso
- Punto de partida para SFT: el modelo sirve como base sobre la que aplicar ajuste supervisado con instrucciones en inglés, aprovechando que ya incorpora distribución de seguridad y matemáticas.
- Investigación en alineamiento: permite estudiar cómo afecta un mid-training con un tercio de datos de seguridad al comportamiento de rechazo de un modelo base, comparándolo con el checkpoint de partida.
- Generación de texto educativo: sus fuentes fineweb-edu, cosmopedia-v2 y dolmino Wiki lo hacen adecuado para redactar explicaciones divulgativas o material de estudio en inglés.
- Resolución de problemas matemáticos elementales e intermedios: la mezcla con finemath y dolmino math lo orienta a tareas de aritmética y razonamiento paso a paso, siempre que se le proporcione un formato de prompt adecuado.
- Experimentación académica con modelos pequeños: 1,8 mil millones de parámetros permiten iterar en una sola GPU consumer, útil para probar pipelines de entrenamiento o evaluaciones de seguridad.
- Filtrado y clasificación de texto con ajuste ligero: al ser un base model, puede adaptarse con pocos ejemplos a tareas de etiquetado o moderación, aprovechando su sesgo hacia contenido seguro.
- Base para destilación: sirve como estudiante en pipelines de destilación desde modelos mayores, dado su tamaño contenido y su licencia MIT.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada en bf16: aproximadamente 3,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para inferencia con contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1 GB para pesos.
- GPU recomendadas para producción: A100, H100 o H200 para servir a múltiples usuarios; también válido en L4 o A10G para cargas moderadas.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, incluso en bf16; en 4 bits cabe en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (el repo incluye el tag), vLLM, llama.cpp y Ollama tras conversión a GGUF. No se documenta soporte nativo de GGUF en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| wcs2024/smollm2-1.7b-sp-safemid | 1,81 B | no disponible (entrenado a 2.048) | MIT | Base con mid-training seguro de 60 B tokens |
| HuggingFaceTB/SmolLM2-1.7B | 1,71 B | 8.192 tokens (según documentación pública de SmolLM2) | Apache 2.0 | Base original, sin datos de seguridad en la mezcla |
| locuslab/base-smollm2-1.7b-all_raw_folders_baseline-600B | ~1,7 B | no disponible | no disponible | Checkpoint de partida del que deriva este modelo |
| Qwen2.5-1.5B | 1,54 B | 32.768 tokens (según documentación pública de Qwen2.5) | Apache 2.0 | Multilingüe, con versiones base e instruct |

La comparación con SmolLM2-1.7B original y Qwen2.5-1.5B se basa en datos públicos de sus respectivas documentaciones; no hay benchmarks de este modelo que permitan comparar rendimiento real.

## Limitaciones y advertencias
- Es un modelo base, no instruction-tuned: no sigue instrucciones de forma fiable sin un ajuste previo.
- Solo soporta inglés según la model card; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a un modelo de 1,8 B parámetros entrenado con 60 B tokens adicionales sobre un base de 600 B; la cobertura factual es limitada.
- El sesgo hacia el rechazo inducido por un tercio de datos de seguridad puede producir respuestas excesivamente cautas o evasivas en contextos legítimos.
- No se han publicado evaluaciones de seguridad, sesgo ni benchmarks de rendimiento; no hay evidencia cuantitativa de que el mid-training seguro reduzca daños sin degradar capacidades.
- La licencia MIT permite uso comercial, pero el modelo base subyacente (SmolLM2) se distribuye bajo Apache 2.0; conviene verificar la compatibilidad de las licencias de los datasets de mid-training para usos comerciales.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay validación comunitaria ni reportes de uso en producción.
- No se documenta la longitud de contexto efectiva tras el mid-training, que se realizó con secuencias de 2.048 tokens; usar contextos mayores puede degradar la calidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/wcs2024/smollm2-1.7b-sp-safemid
- Checkpoint base de partida: https://huggingface.co/locuslab/base-smollm2-1.7b-all_raw_folders_baseline-600B
- SmolLM2-1.7B original: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset dolmino-mix-1124: https://huggingface.co/datasets/allenai/dolmino-mix-1124
- Dataset refuseweb: https://huggingface.co/datasets/locuslab/refuseweb
- Dataset moral_education: https://huggingface.co/datasets/locuslab/moral_education
- Dataset safeweb: https://huggingface.co/datasets/locuslab/safeweb
