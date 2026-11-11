# tahamajs/llava-qwen-0.5b-full-attention-scienceqa

## Resumen

`llava-qwen-0.5b-full-attention-scienceqa` es un checkpoint multimodal de tipo vision-language model publicado por el usuario tahamajs dentro del ecosistema NeuralOps, una librería experimental de "cirugía de atención" (attention surgery) que sustituye operadores de atención en modelos existentes y los reentrena mediante destilación de conocimiento. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un LLaVA basado en un decoder Qwen2 de 0,5 mil millones de parámetros con torre visual SigLIP congelada, y aplica el operador `full_attention` (atención multi-cabeza escalada estándar, Vaswani et al. 2017) sobre 18 de las 24 capas del decoder, manteniendo 6 capas ancla con atención cuadrática intacta.

El resultado se evalúa sobre el subconjunto con imagen de ScienceQA (validación), un benchmark de razonamiento STEM multimodal, donde alcanza un 66,88 % de accuracy y una perplejidad de 2,17. El interés técnico no está en el rendimiento absoluto (el modelo base es muy pequeño), sino en la metodología: demuestra que es posible reemplazar quirúrgicamente componentes de atención, reentrenar solo un subconjunto de pesos y recuperar —e incluso superar— al profesor original (63,75 % de accuracy) con un artefacto de pesos de 147,61 MB frente a los 1,66 GB del base.

Es relevante ahora como pieza de investigación reproducible sobre compresión y destilación en VLMs pequeños, y como ejemplo de empaquetado modular de pesos delta (solo se guardan las capas modificadas más los layernorms entrenados), lo que reduce drásticamente el tamaño del artefacto distribuido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decoder Qwen2 de 24 capas); operador de atención `full_attention` (MHA escalada estándar) en 18/24 capas |
| Parametros totales | 0,5 mil millones (modelo base LLaVA-Qwen-0.5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, pesos delta quirúrgicos) + tokenizer BPE (tokenizer.json, vocab.json, merges.txt) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LLaVA interleaved: una torre visual SigLIP de 27 capas completamente congelada, un proyector MLP de 2 capas que alinea embeddings visuales con el espacio del lenguaje, y un decoder Qwen2 de 24 capas con dimensión oculta D=1024, 16 cabezas de atención y head_dim=64. La intervención quirúrgica sustituye el mecanismo de atención en 18 de las 24 capas del decoder por el operador `full_attention` (atención multi-cabeza escalada estándar), dejando 6 capas ancla con atención cuadrática original en los índices [3, 7, 11, 15, 19, 23] bajo un esquema `hybrid_3_1`. Solo se entrenan y serializan las 18 capas de self-attention modificadas más los layernorms del decoder; la torre visual, el proyector, los MLP y los embeddings permanecen congelados y excluidos del artefacto.

El entrenamiento se realizó mediante destilación de conocimiento en dos etapas (87 pasos en la etapa 1 y 142 en la etapa 2, 229 pasos totales) sobre una NVIDIA RTX 3090 de 24 GB, con un tiempo total de 120,1 segundos y un pico de VRAM de 17.678 MB. El dataset es `derek-thomas/ScienceQA`. El resultado de la destilación es notable: se parte de un modelo pre-KD con 32,50 % de accuracy y PPL 5,12 y se llega a 66,88 % de accuracy y PPL 2,17, superando al profesor original (63,75 % y PPL 2,45). No se documentan detalles sobre composición exacta del dataset de destilación, hiperparámetros de RLHF/DPO ni estrategias de decodificación especulativa.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales (VQA) sobre contenido STEM: figuras, diagramas y material científico.
- Razonamiento multimodal de opción múltiple, orientado al formato de ScienceQA (respuesta con letra de opción).
- Procesamiento de imágenes a través de la torre SigLIP congelada y el proyector MLP.
- Soporte de plantilla de chat (`chat_template.json`) para conversaciones multi-turno.
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni visión de vídeo.

## Casos de uso

- Investigación en compresión de modelos: servir como referencia reproducible para estudiar cómo la sustitución de operadores de atención afecta al rendimiento en VLMs pequeños, comparando el checkpoint `full_attention` con otras variantes del zoo de NeuralOps.
- Destilación de conocimiento multimodal: usar el pipeline de dos etapas y el artefacto delta de 147,61 MB como plantilla para destilar modelos LLaVA-Qwen sobre dominios específicos con presupuesto de cómputo reducido (una sola RTX 3090 y ~2 minutos de entrenamiento).
- Evaluación de benchmarks STEM: ejecutar el modelo sobre el subconjunto con imagen de ScienceQA para validar infraestructura de evaluación VQA antes de escalar a modelos mayores.
- Prototipado educativo: construir demos de preguntas y respuestas sobre figuras científicas en inglés, aprovechando el formato de opción múltiple del modelo.
- Distribución ligera de VLMs: el empaquetado de pesos delta (solo capas modificadas) facilita servir el modelo en entornos con almacenamiento limitado, cargándolo junto al base mediante `neuralops.hub.load_surgeried_model`.
- Estudio de atención híbrida: analizar el esquema `hybrid_3_1` (18 capas full-attention + 6 anclas cuadráticas) para medir el impacto de la proporción de capas sustituidas en tareas de razonamiento visual.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen, validación:

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 32,50 | 66,88 | +34,38 |
| Perplexity (PPL) | 2,45 | 5,12 | 2,17 | -2,95 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 17.678 MB en una RTX 3090, pero la inferencia de un modelo de 0,5 B en FP16 debería caber holgadamente en GPUs consumer.
- GPU recomendadas: el autor documenta entrenamiento en NVIDIA GeForce RTX 3090 (24 GB); no se especifican recomendaciones de inferencia.
- Compatibilidad con GPU consumer: previsiblemente sí en tarjetas con suficiente VRAM para el modelo base completo (la torre visual y el resto de componentes deben cargarse aparte del delta), aunque no se aportan cifras exactas.
- Opciones de despliegue: la librería `neuralops` mediante `neuralops.hub.load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-full-attention-scienceqa | 0,5 B | no disponible | 66,88 % accuracy / PPL 2,17 | MIT | Hugging Face (tahamajs) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5 B | no disponible | 63,75 % accuracy / PPL 2,45 | no disponible en la información | Hugging Face (llava-hf) |
| Otras variantes del Attention Surgery Zoo | 0,5 B | no disponible | no disponible | MIT (presumible, mismo zoo) | Hugging Face (tahamajs) |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado y de dominio estrecho: entrenado exclusivamente sobre ScienceQA, por lo que su rendimiento fuera de ese benchmark no está caracterizado.
- Idioma limitado al inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación en preguntas visuales abiertas no cubiertas por el formato de opción múltiple.
- Sesgos conocidos: no documentados por el autor; al derivar de un modelo base pequeño y de un dataset académico, puede heredar sesgos de ScienceQA.
- Los pesos distribuidos son un delta quirúrgico (147,61 MB) que requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y la librería `neuralops` para cargarse; no es un checkpoint autónomo estándar de `transformers`.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) en el model-index.
- No se documentan longitudes de contexto, cuantizaciones soportadas ni latencias, lo que dificulta planificar despliegues en producción.
- Licencia MIT permite uso comercial, pero la procedencia y condiciones del modelo base deben revisarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-full-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/dense/full_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
