# Vishva007/d3-mini-W4A16-AutoRound

## Resumen

`Vishva007/d3-mini-W4A16-AutoRound` es una versión cuantizada a 4 bits (W4A16) del modelo multimodal `vllm-sr/d3-mini`, generada por el usuario Vishva007 mediante Intel AutoRound. El modelo base es un "decision model" de 4B parámetros desarrollado en el contexto de Decision 3.0 (vLLM Semantic Router), diseñado no para generar texto token a token, sino para evaluar una entrada (texto, JSON, imágenes o fragmentos de vídeo) contra una serie de preguntas de decisión y devolver probabilidades directamente en un único forward pass.

La relevancia de esta ficha concreta reside en la cuantización: se reduce la huella de pesos del backbone lingüístico aproximadamente 3–3,5 veces respecto a BF16, manteniendo el codificador visual sin cuantizar para preservar la fidelidad en tareas de visión y vídeo. Esto lo hace apto para despliegue en GPUs de gama media, aceleradores de borde y entornos con VRAM limitada, sin degradación reportada en benchmarks visuales como CV-Bench y Perception Test.

El modelo está pensado para routing semántico y clasificación zero-shot en pipelines de agentes y sistemas de enrutamiento (vLLM Semantic Router), donde la latencia de generación es un cuello de botella. Al emitir probabilidades en un solo paso, elimina la latencia de decodificación autoregresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`), con codificador visual y atención lineal opcional (flash-linear-attention); `custom_code` con API `system_one` |
| Parametros totales | 1.541.787.136 (≈1,54B según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; la calibración usó `seqlen=4096` |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), group size 32, simétrica; codificador visual en FP16/BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo base `vllm-sr/d3-mini` es un modelo fundacional de decisión multimodal de 4B parámetros. Su particularidad arquitectónica es que no genera tokens: recibe un `state` (texto, JSON, imágenes o vídeo) y un diccionario de preguntas tipadas (`choice`, `noul` —yes/no—, `score`) con criterios, y devuelve directamente las probabilidades de cada opción en un único forward pass. Esto lo diferencia de los LLM generativos y lo orienta a tareas de clasificación y enrutamiento. Incluye un codificador visual para imágenes y vídeo, y soporta atención lineal mediante `flash-linear-attention` como optimización opcional.

Sobre el entrenamiento del modelo base no se proporcionan datos en la información disponible (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí está documentado es el proceso de cuantización: AutoRound con 1200 iteraciones, 512 muestras de calibración, batch size 4, `seqlen` 4096, cuantización simétrica de grupo 32 y `quant_nontext_module=False` para mantener el encoder visual en precisión completa. Se habilitó `torch_compile` durante la calibración.

## Capacidades

- Clasificación zero-shot multimodal: evalúa texto, JSON, imágenes y clips de vídeo contra preguntas de decisión definidas por el usuario.
- Preguntas de tipo `choice` (selección entre criterios), `noul` (sí/no) y `score` (puntuación ordinal sobre una lista de criterios).
- Salida de probabilidades directas en un solo forward pass, sin generación autoregresiva de tokens.
- Routing semántico: pensado para el vLLM Semantic Router (Decision 3.0).
- Procesamiento de imágenes en múltiples formatos de entrada (rutas, URLs, objetos PIL, cadenas base64).
- Procesamiento de vídeo (tag `video`), aunque los detalles de resolución y longitud no están disponibles.
- Soporte de atención lineal opcional vía `flash-linear-attention`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de agentes generativos; su rol es el de componente de decisión dentro de un pipeline mayor.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y un conjunto de preguntas (`route`, `receipt`, `urgency`) y devuelve directamente a qué equipo asignarlo y con qué prioridad, sin coste de generación. Adecuado por su API `system_one` y su salida probabilística.
- Triaje multimodal con adjuntos: un cliente envía una foto de un producto dañado y un recibo; el modelo evalúa la imagen junto con el texto y responde si el recibo lista el artículo y a qué equipo derivar. El encoder visual sin cuantizar preserva la fidelidad en esta tarea.
- Moderación y clasificación de contenido: uso de preguntas `noul` para determinar si un texto o imagen cumple políticas, aprovechando la salida de probabilidad como señal de confianza.
- Enrutamiento en pipelines de agentes: actuar como "router" que decide qué herramienta, modelo o subagente debe atender una consulta, reduciendo latencia frente a un LLM generativo que tendría que emitir tokens.
- Análisis de vídeo para clasificación: evaluar clips contra criterios definidos (por ejemplo, presencia de un objeto o acción) en flujos de inspección o vigilancia, siempre que se respete la ventana de contexto del encoder visual.
- Despliegue en borde o estaciones de trabajo con VRAM limitada: al reducir la huella de pesos 3–3,5× respecto a BF16, permite ejecutar clasificación multimodal en GPUs de consumo o aceleradores embebidos.
- Scoring de calidad o urgencia: uso de preguntas `score` para asignar niveles ordinales (por ejemplo, "Routine / Soon / Today") sobre entradas de texto o imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card afirma "zero degradation in visual QA benchmarks (CV-Bench, Perception Test)" respecto al modelo base, pero no se aportan cifras concretas, por lo que no se incluyen tablas comparativas.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 4,0 GB; con pesos W4A16 y encoder visual en FP16/BF16, la inferencia requiere aproximadamente 4–6 GB de VRAM para el backbone cuantizado más el codificador visual, según resolución de imagen y longitud de contexto (estimación, no dato oficial).
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100. El autor menciona "low-memory edge accelerators, discrete workstation GPUs, or embedded hardware".
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más, aunque no se confirma oficialmente.
- Opciones de despliegue: `transformers` (requiere `transformers==5.17.0`, `trust_remote_code=True`), `auto-round`, `accelerate`, `device_map="auto"`; opcionalmente `flash-linear-attention`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta variante cuantizada.
- Latencia y throughput: no disponibles. La ventaja declarada es la ausencia de decodificación autoregresiva, que reduce la latencia frente a modelos generativos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Vishva007/d3-mini-W4A16-AutoRound | ≈1,54B (repo base 4B) | no disponible | W4A16 (AutoRound) | Apache 2.0 | Variante cuantizada, encoder visual FP16 |
| vllm-sr/d3-mini (base) | 4B (según model card) | no disponible | BF16 | Apache 2.0 (presumible) | Modelo original sin cuantizar |
| Alternativas de clasificación zero-shot | no disponible | no disponible | no disponible | no disponible | No se identifican comparables directos en la información |

No se dispone de información sobre modelos comparables de la misma categoría (decision models multimodales con salida probabilística) en las fuentes consultadas.

## Limitaciones y advertencias

- El modelo no genera texto: solo emite probabilidades sobre preguntas predefinidas; no es adecuado para tareas generativas.
- No se documentan sesgos conocidos ni evaluación de robustez del modelo base ni de la versión cuantizada.
- Riesgo de alucinación: inherente a la clasificación probabilística; las probabilidades pueden ser altas en entradas ambiguas o fuera de distribución, sin mecanismo de abstención documentado.
- Idiomas soportados no disponibles; no se garantiza cobertura multilingüe.
- Longitud de contexto no especificada; la calibración usó 4096 tokens, lo que sugiere un límite práctico cercano, pero no confirmado.
- La cuantización W4A16 puede introducir degradación en tareas de texto no evaluadas; el autor solo reporta preservación en benchmarks visuales.
- Requiere `transformers==5.17.0` y `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; revisar antes de usar en producción.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `vllm-sr/d3-mini`.
- La model card incluye enlaces de afiliado a RunPod; no afectan al modelo pero deben considerarse al evaluar la documentación.
- Repositorio con 133 descargas y 0 likes: ecosistema muy pequeño, sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/Vishva007/d3-mini-W4A16-AutoRound
- Árbol de archivos: https://huggingface.co/Vishva007/d3-mini-W4A16-AutoRound/tree/main
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
- AutoRound (Intel): https://github.com/intel/auto-round
- RunPod (enlace de afiliado presente en la model card): https://runpod.io?ref=iabrlp7z
