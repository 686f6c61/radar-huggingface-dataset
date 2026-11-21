# Truthseeker87/solarhive-e4b-lora

## Resumen

SolarHive E4B es un adaptador LoRA de tipo PEFT sobre el modelo base google/gemma-4-e4b-it, desarrollado por Truthseeker87 en el contexto del hackathon Gemma 4 Good (Google DeepMind x Kaggle). El adaptador está especializado en el dominio de la energía solar comunitaria y en el enrutamiento de llamadas a funciones (tool routing), y se distribuye como pesos delta de aproximadamente 200 MB que se aplican en memoria sobre el modelo base mediante Unsloth. El modelo base es un transformer denso con arquitectura PLE (Per-Layer Embeddings) de 8B parámetros totales y 4,5B efectivos.

El adaptador resuelve el problema de dotar a un modelo multimodal de borde con conocimiento de dominio específico y capacidad de function calling fiable en un contexto de energía solar, manteniendo el coste de despliegue bajo. Es relevante porque forma parte de una cadena de despliegue completa (adaptador → safetensors fusionados → GGUF Q4_K_M) que permite ejecutar el modelo en un portátil de 16 GB de CPU, y porque el autor lo declara como el artefacto fuente de verdad del que derivan el resto de variantes publicadas.

La información disponible es limitada: no se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni detalles completos sobre la composición del dataset de entrenamiento más allá del número de ejemplos. Los datos de rendimiento que se citan provienen de una ejecución única del propio autor y no están validados con un conjunto de evaluación reservado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con PLE (Per-Layer Embeddings); adaptador LoRA sobre modelo base multimodal |
| Parámetros totales | 8B (modelo base); adaptador LoRA ~200 MB |
| Parámetros activos | 4,5B efectivos (modelo base, según el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (adaptador); el repositorio GGUF asociado publica Q4_K_M (5,34 GB) y Q6_K-PLE |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (archivos SolarHive del repositorio) / Apache 2.0 (modelo base, según la página de licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (adapter_model.safetensors); GGUF en el repositorio derivado |

## Arquitectura y entrenamiento

El adaptador se entrena sobre google/gemma-4-e4b-it, un modelo multimodal de tipo image-text-to-text con arquitectura densa y PLE de 8B parámetros totales y 4,5B efectivos. El ajuste fino se realizó con LoRA mediante Unsloth `FastVisionModel` en BF16, con rango 16, alpha 16, dropout 0, sin bias y `target_modules="all-linear"`. Se congeló la torre de visión (`finetune_vision_layers=False`) y se entrenaron las capas de lenguaje, atención y MLP. Se usó gradient checkpointing de Unsloth, enmascaramiento de pérdida limitado a las respuestas del asistente (`train_on_responses_only`), learning rate 2e-4, scheduler coseno y optimizador AdamW de 8 bits.

El entrenamiento se realizó sobre 1.727 ejemplos del dataset Truthseeker87/solarhive-community-solar-multimodal (1.713 de texto y 14 con imagen), en modalidad text-only; la VQA en inferencia utiliza el codificador de visión del Gemma 4 base (~150M parámetros), sin modificar por el LoRA. La pérdida convergió a 0,9218 (media móvil de las últimas 20 iteraciones) en 420 segundos (~7 minutos) sobre una VM G4 de Colab Pro con RTX PRO 6000 Blackwell de 102 GB. No se especifica el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en el dominio de energía solar comunitaria.
- Enrutamiento de llamadas a funciones (function calling / tool routing), evaluado por el autor con 5/5 en una ejecución local.
- Capacidad multimodal image-text-to-text heredada del modelo base Gemma 4, con codificador de visión de ~150M parámetros no ajustado.
- Conversación multi-turno (pipeline conversational).
- Soporte de agentes y razonamiento multi-paso mediante el patrón When2Call, evaluado con 2/3 en la misma ejecución.
- Capacidades multilingües limitadas al inglés según la model card.
- Capacidad de audio mencionada en el repositorio GGUF derivado (compañero mmproj-BF16.gguf con visión y audio).

## Casos de uso

- Enrutamiento de herramientas en asistentes de energía solar: el adaptador está entrenado específicamente para decidir cuándo invocar funciones (por ejemplo, consultar producción de una instalación o tarifas) y con qué argumentos, lo que lo hace adecuado para integrarse en un agente que orqueste APIs de monitorización energética.
- Despliegue en borde en portátiles de 16 GB: la variante GGUF Q4_K_M (5,34 GB) permite ejecutar el modelo en CPU con Ollama o llama.cpp, manteniendo los prompts en el dispositivo, lo que encaja en escenarios con requisitos de privacidad.
- Asistencia a comunidades solares: el ajuste sobre el dataset solarhive-community-solar-multimodal permite responder preguntas sobre gestión de energía comunitaria, con la ventaja de que el modelo base aporta capacidad de conversación multi-turno.
- Análisis de imágenes de instalaciones: al conservar el codificador de visión del Gemma 4 base, puede procesar imágenes junto con texto (VQA) para tareas como interpretar capturas de paneles o documentación técnica, aunque el LoRA no se entrenó específicamente en visión.
- Prototipado rápido de asistentes de dominio: el adaptador de ~200 MB y los ~7 minutos de entrenamiento lo convierten en una base para extender el ajuste fino con datos adicionales mediante Unsloth `FastVisionModel`, útil en equipos que iteran sobre un dominio concreto.
- Integración en pipelines de CI/CD para validación de tool calling: dado que el autor reporta 5/5 en enrutamiento de herramientas, puede usarse como componente de pruebas de regresión en agentes que dependan de function calling en el sector energético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son los reportados por el autor en una ejecución única de mayo de 2026, sin conjunto de evaluación reservado:

| Prueba | Resultado | Nota |
|---|---|---|
| Q&A | 5/5 registrado | No calificado |
| Tool routing | 5/5 | Única variante cloud con 5/5 en esa ejecución |
| When2Call | 2/3 | — |
| Total | 10/10 | Suma de Q&A y tool routing |

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en BF16: no disponible con precisión; el repositorio fusionado en BF16 ocupa ~16 GB, por lo que requiere al menos esa cantidad de memoria.
- Cuantización Q4_K_M: 5,34 GB de pesos, más 992 MB del compañero mmproj-BF16.gguf (visión y audio), apto para CPU.
- GPU recomendadas: el autor entrenó en RTX PRO 6000 Blackwell de 102 GB; para inferencia en BF16 se necesita una GPU con al menos ~16-20 GB (A100 40 GB, H100, RTX 4090 24 GB). Para cuantización Q4_K_M cabe en hardware consumer y en CPU.
- Cabe en consumer GPU: sí, en el caso de la variante GGUF Q4_K_M; la variante BF16 fusionada requiere una GPU de gama alta con 24 GB o más.
- Opciones de despliegue: Unsloth `FastVisionModel.from_pretrained` (adaptador), `AutoModelForCausalLM.from_pretrained` con transformers (safetensors fusionados), Ollama y llama.cpp (GGUF con Modelfile listo para `ollama create`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SolarHive E4B (este adaptador) | 8B totales / 4,5B efectivos | no disponible | 5/5 tool routing (ejecución única del autor) | MIT / Apache 2.0 (base) | Hugging Face |
| SolarHive 26B A4B | 26B (MoE, A4B) | no disponible | no disponible | no disponible | Hugging Face |
| google/gemma-4-e4b-it (base) | 8B totales / 4,5B efectivos | no disponible | no disponible | Apache 2.0 | Kaggle / Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmark (10/10) provienen de una única ejecución del autor y no están validados con un conjunto reservado; no deben interpretarse como una medida generalizable.
- El adaptador se entrenó solo con texto (1.713 ejemplos de texto y 14 con imagen), por lo que la capacidad de visión no está ajustada al dominio y depende del codificador del modelo base.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles.
- La licencia MIT cubre los archivos SolarHive del repositorio, pero el modelo base se rige por la licencia de Gemma 4 de Google (Apache 2.0 según la model card); es necesario verificar los términos aplicables antes de un uso comercial.
- El adaptador requiere dependencias de PEFT y Unsloth para su carga; para despliegues sin dependencias hay que usar los repositorios derivados.
- El notebook de fusión (`solarhive_merge_e4b.ipynb`) no está en el repositorio público de GitHub, lo que dificulta la reproducibilidad completa de la cadena de despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Truthseeker87/solarhive-e4b-lora
- Modelo base: https://kaggle.com/models/google/gemma-4
- Dataset de entrenamiento: https://huggingface.co/datasets/Truthseeker87/solarhive-community-solar-multimodal
- Variante fusionada BF16: https://huggingface.co/Truthseeker87/solarhive-e4b-ollama
- Variante GGUF: https://huggingface.co/Truthseeker87/solarhive-e4b-gguf
- Modelo hermano 26B A4B: https://huggingface.co/Truthseeker87/solarhive-26b-a4b-lora
- Repositorio GitHub: https://github.com/youshen-lim/the-gemma4-good-hackathon-solarhive
- Hackathon: https://kaggle.com/competitions/gemma-4-good-hackathon
- Unsloth: https://unsloth.ai
- Blog de receta SFT de Vertex AI: https://huggingface.co/blog/gemma4
- Documentación del modelo Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper referenciado (arXiv:2504.18851): no disponible en la información proporcionada
- Paper referenciado (arXiv:2211.17192): no disponible en la información proporcionada
