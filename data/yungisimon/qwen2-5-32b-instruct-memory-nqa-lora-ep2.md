# yungisimon/Qwen2.5-32B-Instruct-memory-nqa-lora-ep2

## Resumen

yungisimon/Qwen2.5-32B-Instruct-memory-nqa-lora-ep2 es un ajuste fino del modelo Qwen2.5-32B-Instruct de Alibaba, especializado como "modelo de memoria" para tareas de question answering sobre narrativas largas. El autor (yungisimon) ha aplicado un LoRA de rango 32 sobre las proyecciones de atención y MLP del modelo base, entrenado sobre un conjunto sintético de 1.276.668 pares de pregunta-respuesta generados a partir de NarrativeQA con combinación de entidades cross-document. El checkpoint publicado corresponde a la época 2 de 3 del entrenamiento.

El modelo conserva la arquitectura transformer densa de Qwen2.5-32B (32.763.876.352 parámetros totales, contexto nativo de 32.768 tokens) y añade una especialización en recuperación y razonamiento sobre información presentada en el contexto, orientada a escenarios de memoria a largo plazo en conversaciones o documentos. El adaptador LoRA está fusionado en los pesos base, aunque también se distribuye sin fusionar en `lora_adapter/`.

Es relevante porque explora una línea poco habitual: usar ajuste fino supervisado para reforzar la capacidad de un LLM de mantener y consultar información a lo largo de contextos extensos, en lugar de depender exclusivamente de recuperación externa (RAG). Su licencia Apache 2.0 y su compatibilidad con `transformers` y TGI lo hacen directamente desplegable. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, lo que indica que es un artefacto de investigación sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only, con adaptación LoRA fusionada |
| Parametros totales | 32.763.876.352 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-32B-Instruct soporta 32.768 tokens nativos (hasta 131.072 con YaRN, según la documentación de Qwen) |
| Tipos de cuantizacion | No especificados por el autor; al ser safetensors bf16, admite cuantización estándar (GPTQ, AWQ, GGUF) mediante herramientas externas |
| Idiomas soportados | No disponibles en la model card (heredados del modelo base, multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); adaptador LoRA sin fusionar en `lora_adapter/` |
| Longitud máxima de secuencia en entrenamiento | 8.096 tokens |
| Parametros entrenables | 268.435.456 (0,81 % del total) |
| Tamaño del repositorio | 66,6 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso con 64 capas, atención con RoPE y GQA, y 32.763.876.352 parámetros. Sobre él se aplicó un LoRA de rango 32 y alpha 64 con dropout 0,05, dirigido a las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. Esto supone 268.435.456 parámetros entrenables, un 0,81 % del total. El adaptador se fusionó posteriormente en los pesos base, de modo que el checkpoint principal se carga con `AutoModelForCausalLM.from_pretrained` sin necesidad de PEFT.

El entrenamiento se realizó en bf16 con gradient checkpointing, pérdida calculada únicamente sobre los tokens del asistente, batch efectivo de 512 (64 por dispositivo × 8 GPUs), learning rate constante de 2e-4 con warmup del 5 %, weight decay 0,01 y max grad norm 1,0, durante 3 épocas (el checkpoint publicado es la época 2). El conjunto de datos es `NQA_chunks_subset101_numsamplingepochs1_crossdoc_entity_combination_v3.json`, con 1.276.668 ejemplos sintéticos de QA construidos a partir de NarrativeQA mediante combinación de entidades entre documentos. El entrenamiento completo de 3 épocas requirió 7,54 h de reloj (60,3 GPU-horas) sobre 8 aceleradores AMD Instinct MI325X. No se menciona RLHF ni DPO; se trata de ajuste supervisado puro.

## Capacidades

- Generación de texto conversacional multi-turno con la plantilla de chat de Qwen.
- Question answering sobre información presente en el contexto, reforzado específicamente mediante el entrenamiento en NarrativeQA.
- Razonamiento sobre narrativas largas y combinación de entidades procedentes de distintos fragmentos documentales.
- Capacidades heredadas del modelo base Qwen2.5-32B-Instruct: generación de código, matemáticas, razonamiento general y multilingüismo (aunque el ajuste fino puede haber degradado parcialmente estas habilidades al no incluirlas en el dataset).
- Soporte de tool calling y function calling heredado del modelo base (no verificado tras el ajuste fino).
- Capacidades de agente y razonamiento multi-paso heredadas del modelo base (no verificadas tras el ajuste fino).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Asistentes conversacionales con memoria de sesión: el modelo puede recordar y consultar información expuesta anteriormente en la conversación, gracias al entrenamiento específico en QA sobre contexto y a la ventana nativa de 32.768 tokens del modelo base.
- Análisis de documentos largos con preguntas cruzadas: útil para extraer y relacionar entidades de informes, contratos o expedientes que ocupan varios fragmentos, escenario directamente alineado con el dataset de entrenamiento (combinación de entidades cross-document).
- Sistemas de atención al cliente con historial extenso: el modelo puede gestionar conversaciones multi-turno donde el cliente ha proporcionado datos en turnos previos y se espera que el asistente los recupere sin depender de un módulo RAG externo.
- Investigación en memoria de LLMs: sirve como checkpoint de referencia para estudiar si el ajuste fino supervisado sobre QA sintético mejora la fidelidad de recuperación en contexto frente al modelo base.
- Procesamiento de narrativas y guiones: análisis de tramas, personajes y relaciones en textos literarios o guiones extensos, aprovechando el entrenamiento sobre NarrativeQA.
- Generación de resúmenes con preguntas de seguimiento: pipelines donde tras un resumen el usuario consulta detalles concretos del texto original y el modelo debe localizarlos en el contexto.
- Evaluación comparativa de técnicas de memoria: al distribuirse el adaptador LoRA sin fusionar, permite reproducir el ajuste y comparar el comportamiento fusionado frente al adaptador aplicado en tiempo de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,5 GB solo para pesos (32,76 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica requiere 2 × A100/H100 de 80 GB o una GPU de 80 GB con cuantización parcial.
- Cuantización a 8 bits: unos 33 GB de pesos, cabe en una A100 40 GB o H100 40 GB con margen limitado para contexto.
- Cuantización a 4 bits (GPTQ/AWQ/GGUF Q4): unos 17-18 GB de pesos, cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) con contexto moderado.
- GPUs recomendadas: H100 80 GB, A100 80 GB, AMD MI300X/MI325X (el autor entrenó en MI325X, por lo que hay compatibilidad ROCm verificada para el entrenamiento); para consumer, RTX 4090 o RTX 3090 con cuantización 4 bits.
- Opciones de despliegue: `transformers` (carga directa en bf16), vLLM, TGI (el tag `text-generation-inference` y `endpoints_compatible` está presente), llama.cpp/Ollama mediante conversión a GGUF (no proporcionada por el autor, requiere conversión propia).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-32B-Instruct-memory-nqa-lora-ep2 | 32,76 B | 32.768 (base) | Memoria / QA sobre narrativas (LoRA fusionado) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-32B-Instruct | 32,76 B | 32.768 (131.072 con YaRN) | Instrucción general, código, matemáticas | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Qwen/Qwen2.5-72B-Instruct | 72,7 B | 32.768 (131.072 con YaRN) | Instrucción general de mayor escala | Apache 2.0 (con condiciones para algunos tamaños) | Hugging Face |
| meta-llama/Llama-3.1-70B-Instruct | 70,6 B | 131.072 | Instrucción general, contexto largo | Llama 3.1 Community License | Hugging Face |

La comparación directa más relevante es con el modelo base Qwen2.5-32B-Instruct: este checkpoint añade especialización en memoria a costa de un posible olvido catastrófico parcial de las capacidades generales, sin benchmarks publicados que cuantifiquen el intercambio. Frente a Llama-3.1-70B-Instruct, el modelo de yungisimon ofrece la mitad de parámetros y menor contexto nativo, pero licencia Apache 2.0 sin restricciones de escala.

## Limitaciones y advertencias

- No se han publicado evaluaciones: no hay benchmarks que verifiquen que el ajuste fino mejora la recuperación en contexto ni que mide la degradación en tareas generales.
- Riesgo de olvido catastrófico: el ajuste se realizó solo sobre QA sintético de NarrativeQA; es probable que las capacidades de código, matemáticas y multilingüismo del modelo base se hayan degradado, aunque no se cuantifica.
- Sesgos: el dataset sintético deriva de NarrativeQA, con posible sobrerrepresentación de narrativas en inglés y de patrones de generación automática; no se documenta ningún análisis de sesgo.
- Alucinación: al ser un modelo de memoria entrenado para responder preguntas sobre contexto, existe riesgo de que genere respuestas plausibles pero no presentes en el texto cuando la información no esté en la ventana.
- Contexto: la model card no especifica la longitud de contexto efectiva tras el ajuste; el entrenamiento usó secuencias de 8.096 tokens, por lo que el rendimiento más allá de esa longitud no está validado.
- Idiomas: no se documentan; el ajuste probablemente esté dominado por inglés al provenir de NarrativeQA.
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones adicionales, pero la ausencia de evaluación hace arriesgado desplegarlo en producción sin validación propia.
- Adopción nula: 0 descargas y 0 likes indican que no ha sido revisado por la comunidad; trátese como artefacto de investigación.
- Fecha de creación futura (2026-11-09) en los metadatos de Hugging Face, lo que sugiere posible manipulación de metadatos o error del autor; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-32B-Instruct-memory-nqa-lora-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Dataset NarrativeQA (referencia del corpus original): https://github.com/google-deepmind/narrativeqa
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
- Repositorio de transformers: https://github.com/huggingface/transformers
- Repositorio de PEFT (para cargar el adaptador sin fusionar): https://github.com/huggingface/peft
