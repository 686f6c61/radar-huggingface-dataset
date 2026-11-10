# UKPLab/Llama3-MAGneT

## Resumen
Llama3-MAGneT es un ajuste fino supervisado de meta-llama/Meta-Llama-3-8B-Instruct desarrollado por el UKP Lab (Universidad Técnica de Darmstadt) para la generación de turnos de consejero en diálogos de consejería psicológica. El modelo no es un asistente conversacional general, sino un componente especializado que, dado un perfil de cliente, un motivo de consulta y el historial del diálogo, produce la siguiente intervención del consejero combinando técnicas de reflexión, formulación de preguntas, normalización, provisión de soluciones y psicoeducación.

El modelo se entrena sobre MAGneT, un corpus de 442 sesiones sintéticas multi-turno generadas mediante un marco multiagente coordinado que descompone la respuesta del consejero en subagentes especializados (uno por técnica psicológica, más un agente de técnica, un agente CBT y un agente de generación final). El ajuste se realizó con QLoRA sobre el checkpoint Instruct de Llama 3 de 8B, por lo que hereda la arquitectura transformer decoder-only y la ventana de contexto de 8.192 tokens del modelo base.

Su relevancia radica en que el artículo asociado (Findings of EMNLP 2026) reporta que un modelo Llama3-8B-Instruct ajustado sobre datos MAGneT supera a modelos ajustados con datos sintéticos de referencia en habilidades generales de consejería y en habilidades específicas de terapia cognitivo-conductual, según la escala CTRS. Es, por tanto, un artefacto de investigación para estudiar la calidad de datos sintéticos en salud mental, no un producto clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), ajuste fino con QLoRA sobre Meta-Llama-3-8B-Instruct |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base Llama 3 8B; no se especifica en la model card) |
| Tipos de cuantizacion | El repo contiene pesos en safetensors; no se publican cuantizaciones GGUF/AWQ/GPTQ oficiales. QLoRA implica entrenamiento en 4 bits, pero no se distribuyen adaptadores LoRA separados |
| Idiomas soportados | en (inglés) |
| Licencia | GPL-2.0 |
| Formato de pesos | safetensors (16,1 GB de repositorio) |

## Arquitectura y entrenamiento
El modelo es un ajuste fino completo (o fusión de adaptadores QLoRA, no se explicita en la model card) sobre Meta-Llama-3-8B-Instruct, un transformer decoder-only denso de 8.000 millones de parámetros con atención causal estándar y RoPE. No incorpora innovaciones arquitectónicas propias: la contribución está en los datos y en el pipeline de generación de esos datos, no en el modelo.

El corpus de entrenamiento, MAGneT, consta de 442 sesiones sintéticas multi-turno construidas a partir de perfiles de cliente del dataset CACTUS y generadas por un marco multiagente coordinado. Cada sesión se produce descomponiendo la respuesta del consejero en subtareas asignadas a agentes especializados (reflexión, pregunta, solución, normalización, psicoeducación), más un agente de técnica, un agente CBT y un agente de generación de respuesta. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado.

## Capacidades
- Generación del siguiente turno de consejero en diálogos de consejería psicológica, condicionada a un system prompt fijo, información demográfica del cliente, motivo de consulta e historial.
- Aplicación explícita de técnicas de consejería: reflexión, formulación de preguntas, provisión de soluciones, normalización y psicoeducación.
- Integración de marcos de terapia cognitivo-conductual (CBT) en las respuestas, según el diseño del corpus de entrenamiento.
- Conversación multi-turno en inglés con rol de consejero fijado por prompt.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al inglés declarado; no se reportan evaluaciones en otros idiomas.

## Casos de uso
- Generación de datos sintéticos de consejería para investigación: el modelo puede producir turnos de consejero sobre perfiles CACTUS y servir como generador de corpus aumentados para estudiar técnicas terapéuticas, dado que fue entrenado precisamente sobre datos de ese tipo.
- Simulación de cliente-consejero en entornos de evaluación: emparejado con un modelo que haga de cliente, permite construir diálogos sintéticos controlados para comparar protocolos de evaluación automática y juicio experto.
- Estudio de adherencia a técnicas CBT: al haber sido entrenado con sesiones que separan reflexión, pregunta, solución, normalización y psicoeducación, permite analizar qué técnica emerge en cada turno y compararla con anotaciones humanas.
- Prototipado de sistemas de apoyo a la formación de terapeutas: puede generar respuestas de referencia para que estudiantes de psicología las evalúen críticamente en ejercicios supervisados, siempre con revisión humana.
- Investigación sobre calidad de datos sintéticos: el checkpoint permite reproducir el resultado del artículo de que el ajuste sobre MAGneT supera a ajustes sobre datos sintéticos de referencia en CTRS.
- Análisis de sesgos y seguridad en modelos de salud mental: al ser un modelo especializado y pequeño (8B), es un banco de pruebas asequible para medir respuestas inapropiadas, derivación a profesionales o manejo de crisis antes de considerar cualquier uso real.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia los resultados agregados del artículo: las sesiones generadas por MAGneT con backbone Llama3-8B-Instruct obtienen un 3,2 % más en habilidades generales de consejería y un 4,3 % más en habilidades específicas de CBT en la Cognitive Therapy Rating Scale (CTRS), y los expertos prefieren las sesiones de MAGneT en el 77,2 % de los casos en promedio sobre nueve aspectos frente al mejor baseline. No se proporcionan puntuaciones absolutas ni comparaciones numéricas con modelos concretos en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: en torno a 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda una GPU de 24 GB o más para contextos largos.
- Cuantización a 8 bits: aproximadamente 8-9 GB de pesos, viable en GPUs consumer de 12-16 GB (RTX 4070 Ti, RTX 4080) con contexto moderado.
- Cuantización a 4 bits (si se genera con herramientas externas, no publicada oficialmente): alrededor de 5-6 GB, cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y similares.
- GPUs recomendadas para producción o evaluación a gran escala: A100 40/80 GB, H100, L40S; para experimentación, RTX 4090 (24 GB) es suficiente en bf16.
- Opciones de despliegue: transformers (código de ejemplo en la model card), vLLM, TGI y llama.cpp/Ollama si se convierte a GGUF; no se distribuyen artefactos de despliegue oficiales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UKPLab/Llama3-MAGneT | 8,03B | 8.192 (heredado del base) | Consejería psicológica, técnicas CBT | GPL-2.0 | Hugging Face, 13 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03B | 8.192 | Asistente general | Llama 3 Community License | Hugging Face, ampliamente distribuido |
| Modelos ajustados sobre datos sintéticos de referencia citados en el paper | no disponible | no disponible | Consejería psicológica | no disponible | no disponible |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; el artículo solo reporta la ventaja relativa frente al mejor baseline en CTRS y en preferencia experta.

## Limitaciones y advertencias
- Modelo de investigación: no está validado clínicamente ni debe usarse como sustituto de atención psicológica profesional.
- Riesgo de alucinación y de respuestas terapéuticamente inapropiadas, especialmente ante situaciones de crisis, ideación suicida o trauma, no cubiertas explícitamente por el corpus de entrenamiento.
- Entrenado sobre 442 sesiones sintéticas derivadas de perfiles CACTUS: puede reproducir sesgos demográficos, culturales y de género presentes en esos perfiles y en los modelos que generaron los datos.
- Solo inglés declarado; no hay evaluación multilingüe.
- Ventana de contexto heredada de Llama 3 8B (8.192 tokens), insuficiente para historiales clínicos muy extensos.
- Licencia GPL-2.0: impone obligaciones de copyleft que pueden ser incompatibles con productos propietarios; además, el modelo base Llama 3 tiene su propia licencia comunitaria, lo que añade una capa adicional de condiciones a revisar.
- El prompt de sistema debe respetarse estrictamente; desviaciones pueden producir respuestas fuera de rol o que mencionen explícitamente la técnica empleada.
- Sin datos publicados de benchmarks estándar (MMLU, GSM8K, HumanEval) ni de tasas de error en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/UKPLab/Llama3-MAGneT
- Dataset MAGneT: https://huggingface.co/datasets/UKPLab/MAGneT
- Dataset CACTUS: https://huggingface.co/datasets/LangAGI-Lab/cactus
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Artículo (arXiv): https://arxiv.org/abs/2509.04183
- Artículo (ACL Anthology, Findings of EMNLP 2026): https://aclanthology.org/2026.findings-emnlp.282/
- DOI: https://doi.org/10.18653/2026.findings-emnlp.282
