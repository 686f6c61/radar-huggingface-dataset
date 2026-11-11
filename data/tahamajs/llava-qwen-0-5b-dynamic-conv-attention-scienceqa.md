# tahamajs/llava-qwen-0.5b-dynamic-conv-attention-scienceqa

## Resumen

llava-qwen-0.5b-dynamic-conv-attention-scienceqa es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un "attention surgery zoo" que sustituye mecanismos de atencion estandar por operadores alternativos en modelos preentrenados. En este caso se parte de llava-hf/llava-interleave-qwen-0.5b-hf, un VLM multimodal de 0,5 mil millones de parametros que combina un vision tower SigLIP congelado, un proyector MLP de dos capas y un decoder Qwen2 de 24 capas (D=1024, H=16, head_dim=64), y se reemplaza la self-attention en 18 de las 24 capas por una convolucion depthwise causal dinamica (DynamicConvAttention).

El problema que aborda es la compresion y simplificacion de mecanismos de atencion en VLMs pequenos: en lugar de calcular Q/K/V y un producto escalar cuadratico, cada token genera un filtro de convolucion de K taps por cabeza mediante un MLP y softmax, y la salida se obtiene convolucionando causalmente solo la proyeccion V. Las proyecciones Q y K se eliminan, lo que reduce el artefacto de pesos a 388,67 MB (frente a 1,66 GB del base en FP16, un 77,2% menos) y permite entrenar el ajuste en una unica RTX 3090 en 120,2 segundos y 200 pasos.

Es relevante ahora como prueba de concepto reproducible de "attention surgery" con destilacion de conocimiento: el autor reporta que el modelo pasa de 31,87% a 61,25% de accuracy en el subconjunto con imagenes de ScienceQA tras el ajuste, acercandose al 63,75% del profesor original, con una perplejidad de 2,20 frente a 2,45 del profesor. No obstante, se trata de un artefacto de investigacion con 0 descargas, sin verificacion externa de metricas y con un alcance muy limitado (un solo dataset, solo ingles).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo LLaVA: vision tower SigLIP congelado (27 capas) + proyector MLP de 2 capas + decoder Qwen2 de 24 capas con DynamicConvAttention en 18 capas y atencion cuadratica en 6 capas ancla [3, 7, 11, 15, 19, 23] |
| Parametros totales | no disponible (modelo base de 0,5B; el checkpoint guarda solo los deltas quirurgicos de 18/24 capas de atencion y layernorms del decoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP16 safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, deltas quirurgicos FP16); requiere la libreria neuralops para cargar |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA-Interleave con Qwen2-0.5B como decoder: un vision encoder SigLIP congelado de 27 capas, un proyector multi-modal MLP de dos capas y un decoder de 24 capas con dimension oculta 1024, 16 cabezas y head_dim 64. La intervencion quirurgica sustituye la self-attention en 18 de las 24 capas (esquema hybrid_3_1) por DynamicConvAttention: cada token t genera, por cabeza, un filtro de K taps mediante w_t = softmax(MLP(x_t)) en R^(H x K), y la salida se calcula como una convolucion depthwise causal sobre la proyeccion V, out_t[h,:] = sum_{k=0}^{K-1} w_t[h,k] * V_{t-K+1+k}[h,:]. Las proyecciones Q y K se eliminan por completo (Q/K = None), de modo que solo se usan V y O.

El entrenamiento consistio en destilacion de conocimiento en dos etapas (74 + 126 = 200 pasos de optimizacion) sobre el dataset derek-thomas/ScienceQA, congelando el vision tower, el proyector multi-modal, las 6 capas de atencion cuadratica ancla, los MLP del decoder y los embeddings. Solo se entrenaron las 18 atenciones sustituidas y los layernorms del decoder. La telemetria reportada indica 120,2 segundos de entrenamiento en una NVIDIA GeForce RTX 3090 (24 GB) con un pico de 20.369 MB de VRAM. El artefacto serializado ocupa 388,67 MB (407.548.348 bytes) frente a 1,66 GB del base completo en FP16, un ahorro de 1,28 GB (77,2%, artefacto 4,38x mas pequeno). La innovacion principal es, por tanto, la propia operacion de atencion convolucional dinamica como reemplazo drop-in, no el modelo base.

## Capacidades

- Generacion de texto e imagen-a-texto conversacional (pipeline image-text-to-text) sobre el decoder Qwen2-0.5B.
- Razonamiento visual basico sobre imagenes STEM: el checkpoint se evaluo en el subconjunto con imagenes de ScienceQA (preguntas de ciencia con figura).
- Respuesta a preguntas de opcion multiple con contexto visual, formato tipico de ScienceQA.
- Soporte de plantilla de chat (chat_template.json incluido) para conversaciones multi-turno.
- Capacidad multilingue limitada: solo se declara ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision de video, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Investigacion sobre mecanismos de atencion alternativos: sirve como referencia reproducible para comparar DynamicConvAttention frente a atencion cuadratica estandar en un VLM pequeno, cargando el checkpoint con neuralops.hub.load_surgeried_model y midiendo accuracy y perplejidad sobre ScienceQA.
- Prototipado de VQA educativo de bajo coste: el modelo responde preguntas de ciencia con imagen en ingles y cabe en una unica GPU consumer, lo que permite iterar rapidamente en demos de tutoria STEM.
- Destilacion de conocimiento en modelos pequenos: el flujo de dos etapas (pre-KD 31,87% a post-KD 61,25%) es un ejemplo de como recuperar rendimiento tras cirugia de atencion, reutilizable como receta para otros VLMs.
- Experimentos de compresion de artefactos: con 388,67 MB frente a 1,66 GB del base, es adecuado para estudiar el impacto de eliminar Q/K en el tamano final del checkpoint y en la calidad.
- Evaluacion de robustez de operadores: util para probar si una convolucion depthwise causal con filtros generados por token mantiene el razonamiento multimodal en preguntas de opcion multiple.
- Base para fine-tuning academico: al estar bajo licencia MIT y tener un formato de pesos safetensors con manifiesto quirurgico (surgical_manifest.json), se puede adaptar a otros datasets de VQA en ingles para estudiar transferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados externamente), sobre ScienceQA (Image-Bearing STEM Subset, validation):

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 31,87 | 61,25 | +29,38 |
| Perplejidad (PPL) | 2,45 | 4,56 | 2,20 | -2,36 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento se realizo con un pico de 20.369 MB en una RTX 3090 (24 GB) para el flujo completo con destilacion; la inferencia del modelo base de 0,5B en FP16 requiere del orden de pocos GB, aunque no se proporciona una cifra exacta de VRAM de inferencia.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (24 GB) es la unica GPU documentada en la telemetria de entrenamiento; para inferencia, cualquier GPU consumer con suficiente VRAM para un VLM de 0,5B en FP16 deberia bastar, pero no se especifica.
- Cabe en GPU consumer: si, segun la evidencia de entrenamiento en RTX 3090; no se detallan modelos inferiores.
- Opciones de despliegue: la carga oficial es mediante la libreria neuralops (neuralops.hub.load_surgeried_model); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se reporta tiempo de entrenamiento (120,2 s para 200 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-dynamic-conv-attention-scienceqa | 0,5B (base), deltas de 18/24 capas | no disponible | 61,25% accuracy, PPL 2,20 (declarado por el autor) | MIT | Hugging Face, 0 descargas |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | no disponible | 63,75% accuracy, PPL 2,45 (segun el autor) | no disponible en la informacion | Hugging Face |
| Otros VLMs de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros para establecer una comparativa mas amplia con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto de investigacion: 0 descargas y 0 likes en el momento de la ficha; las metricas no estan verificadas externamente (verified: false en la model-index).
- Alcance muy restringido: evaluado unicamente en el subconjunto con imagenes de ScienceQA en validacion, en ingles; no hay evidencia de generalizacion a otros dominios visuales.
- Solo ingles: no se declara soporte multilingue, lo que limita su uso en castellano u otros idiomas.
- Eliminacion de Q/K: la atencion se sustituye por convolucion depthwise causal con filtros generados por token; el comportamiento en contextos largos o tareas que requieran atencion global no esta documentado.
- Riesgo de alucinacion: al ser un modelo de 0,5B ajustado con solo 200 pasos sobre un dataset acotado, la fiabilidad factual fuera de ScienceQA es baja y no se ha medido.
- Dependencia de la libreria neuralops: los pesos son deltas quirurgicos que requieren el cargador especifico; no son directamente compatibles con transformers, vLLM o llama.cpp sin conversion.
- Licencia MIT: permite uso comercial, pero el modelo base llava-hf/llava-interleave-qwen-0.5b-hf tiene sus propias condiciones, que deben revisarse por separado.
- Sin datos de contexto maximo, cuantizacion ni latencia: no apto para planificacion de produccion sin evaluacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-dynamic-conv-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de DynamicConvAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/dynamic_conv_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
