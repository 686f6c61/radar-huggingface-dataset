# vllm/mamba2-1.3b-hf

## Resumen

`vllm/mamba2-1.3b-hf` es una conversión al formato compatible con Hugging Face Transformers del modelo Mamba-2 de 1.300 millones de parámetros publicado originalmente por el laboratorio state-spaces (Tri Dao y Albert Gu). El repositorio lo mantiene el equipo de vLLM como copia de seguridad dentro de su infraestructura de integración continua, a partir del checkpoint `AntonV/mamba2-1.3b-hf` (commit `703e19a`), con el objetivo de reducir el riesgo de cadena de suministro al depender de una cuenta personal.

La relevancia del modelo es arquitectónica: Mamba-2 es un modelo de espacio de estados (SSM) estructurado, no un transformer. Su contribución principal, la dualidad estado-espacio estructurada (SSD), permite reformular el SSM como una forma de atención lineal y ejecutar el entrenamiento e inferencia con kernels matriciales altamente optimizados en GPU. Esto da lugar a un coste de inferencia lineal con la longitud de secuencia, en lugar del coste cuadrático de la atención estándar.

Este checkpoint concreto no es un modelo de propósito general afinado para instrucciones: es la conversión de los pesos base de Mamba-2 1.3B para que puedan cargarse con `AutoModelForCausalLM` y probarse en vLLM. Resulta útil para desarrolladores que quieran evaluar la arquitectura Mamba-2 en pipelines de Transformers o en el motor de serving de vLLM, no como sustituto directo de un LLM conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 (modelo de espacio de estados estructurado, dualidad estado-espacio, SSM) |
| Parametros totales | 1.343.757.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

Mamba-2 sustituye el bloque de atención por una capa SSM selectiva con estructura matricial (matrices de transición escalares por cabeza, en lugar de las diagonales por canal de Mamba-1). La dualidad SSD demuestra que el cálculo recurrente del SSM y una forma de atención lineal enmascarada son matemáticamente equivalentes, lo que permite reutilizar primitivas de álgebra lineal densa (GEMM, FlashAttention-like tiling) y obtener un rendimiento práctico muy superior al de implementaciones SSM previas. El modelo es un decoder causal de 1.3B parámetros, sin componentes de atención clásicos.

No se dispone en la información proporcionada de detalles sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüe), ni sobre si hubo fases de RLHF, DPO o SFT. La model card únicamente referencia el artículo de ICML 2024 «Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality» de Dao y Gu, que describe la arquitectura y el algoritmo, no los detalles del checkpoint de 1.3B. Tampoco se documenta el tokenizador utilizado más allá de que es cargable vía `AutoTokenizer`.

## Capacidades

- Generación de texto autoregresiva causal, en modo completado (no instrucciones).
- Modelado de lenguaje base: útil como punto de partida para fine-tuning, no como asistente listo para usar.
- Inferencia con coste lineal respecto a la longitud de secuencia, lo que favorece secuencias largas frente a transformers de tamaño comparable.
- Entrenamiento e inferencia eficientes en GPU gracias a los kernels SSD.
- Compatibilidad con `transformers.AutoModelForCausalLM` y con el motor vLLM (es el caso de uso para el que se mantiene esta copia).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de la arquitectura Mamba-2 en producción: sirve para medir latencia y throughput reales de un SSM frente a un transformer de 1.3B en el mismo hardware, usando vLLM como motor de serving.
- Pruebas de integración continua de vLLM: es el propósito declarado del repositorio; permite validar que los kernels y el cargador de pesos de Mamba-2 siguen funcionando en cada release.
- Fine-tuning sobre dominio específico: al ser un modelo base de 1.3B con licencia MIT, es un punto de partida barato para SFT en tareas de clasificación, extracción o generación acotada.
- Procesamiento de secuencias largas con memoria acotada: la recurrencia SSM mantiene un estado de tamaño constante, lo que resulta atractivo para streaming de texto o series temporales tokenizadas.
- Investigación académica sobre SSM: reproducir experimentos de la dualidad SSD, comparar curvas de escalado o analizar el comportamiento de las capas de estado.
- Prototipado de asistentes de bajo coste en hardware consumer: con 1.3B parámetros y pesos en safetensors (2,7 GB en fp32/bf16 según el repo), cabe en GPUs de gama media para experimentación.
- Generación de texto en pipelines embebidos: el coste lineal permite desplegar el modelo en escenarios con contextos moderadamente largos donde un transformer equivalente sería más caro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 2,7 GB en safetensors, lo que sugiere pesos en bf16/fp16 (~2,7 GB). En fp16 se necesita aproximadamente 3 GB de VRAM solo para pesos; en cuantización de 8 bits bajaría a ~1,4 GB y en 4 bits a ~0,8 GB, aunque el repositorio no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con margen para el estado de activaciones; A100, H100 o L40S para serving concurrente.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores, siempre que se use fp16/bf16.
- Opciones de despliegue: vLLM (caso de uso principal del repo), Transformers con `AutoModelForCausalLM`; llama.cpp y Ollama requerirían conversión a GGUF, no incluida en el repo; TGI no documenta soporte de Mamba-2 en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vllm/mamba2-1.3b-hf | 1.343.757.312 | no disponible | Mamba-2 (SSM) | MIT | Hugging Face, Transformers, vLLM |
| state-spaces/mamba2-1.3b | 1.300 M aprox. | no disponible | Mamba-2 (SSM) | no disponible en la información | Hugging Face (formato original) |
| AntonV/mamba2-1.3b-hf | 1.300 M aprox. | no disponible | Mamba-2 (SSM) | no disponible en la información | Hugging Face (cuenta personal) |
| Transformer decoder de ~1.3B (p. ej. familia Llama/TinyLlama) | ~1.100-1.300 M | 2.048-4.096 típicamente | Transformer | variable (MIT/Apache en algunos) | Hugging Face, amplio ecosistema |

La comparación con transformers de tamaño similar es pertinente por escala, pero no por arquitectura: Mamba-2 ofrece coste lineal en secuencia y un estado recurrente fijo, mientras que los transformers mantienen atención cuadrática y KV cache que crece con el contexto. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no afinado para instrucciones: no debe esperarse un comportamiento de asistente ni seguir instrucciones complejas sin fine-tuning previo.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar afirmaciones falsas con fluidez; no hay evaluaciones publicadas de fidelidad en este checkpoint.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni alineación; el corpus de entrenamiento es desconocido en la información disponible.
- Idiomas: no se especifica qué idiomas cubre; el tokenizador y la distribución del corpus no están documentados en la model card.
- Licencia MIT: permite uso comercial y modificación, pero el repo es una copia de conveniencia; conviene verificar la licencia del checkpoint original `state-spaces/mamba2-1.3b` antes de redistribuir.
- Cadena de suministro: el repo declara explícitamente que es una copia de un checkpoint alojado en una cuenta personal; para producción conviene fijar el commit y auditar los pesos.
- Soporte de ecosistema limitado: fuera de Transformers y vLLM, las herramientas (llama.cpp, Ollama, TGI, quantización AWQ/GPTQ) pueden no soportar Mamba-2 de forma nativa.
- Contexto máximo no documentado: no se puede planificar un despliegue con ventanas largas sin verificar empíricamente el límite efectivo del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vllm/mamba2-1.3b-hf
- Checkpoint original convertido: https://huggingface.co/AntonV/mamba2-1.3b-hf
- Modelo original state-spaces: https://huggingface.co/state-spaces/mamba2-1.3b
- Paper Mamba-2 (ICML 2024): https://arxiv.org/abs/2405.21060
- vLLM: https://vllm.ai/
- Repositorio vLLM en GitHub: https://github.com/vllm-project/vllm
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Releases de vLLM: https://github.com/vllm-project/vllm/releases
