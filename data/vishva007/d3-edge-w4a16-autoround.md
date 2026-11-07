# Vishva007/d3-edge-W4A16-AutoRound

## Resumen

`Vishva007/d3-edge-W4A16-AutoRound` es una versión cuantizada a 4 bits (W4A16) del modelo multimodal `vllm-sr/d3-edge`, publicado por el usuario Vishva007. El modelo base es un "decision model" de Decision 3.0 (vLLM Semantic Router): no genera texto token a token, sino que evalúa una entrada (texto, JSON, imágenes o vídeos) contra una serie de preguntas de decisión con formato Choice, Yes/No o Score, y devuelve probabilidades directas en un único forward pass. Esto lo convierte en un componente de enrutamiento y clasificación, no en un LLM conversacional.

La arquitectura subyacente se etiqueta como `qwen3_5` en los metadatos de Hugging Face, con un total de 393.535.680 parámetros (aproximadamente 0,39B, aunque la model card del autor menciona 0,59B para el modelo base). La cuantización se ha realizado con Intel AutoRound en configuración de producción (grupo 32, simétrica, 1200 iteraciones, 512 muestras de calibración), manteniendo el codificador visual sin cuantizar para preservar la fidelidad en tareas de visión.

Su relevancia práctica está en el despliegue en entornos de borde y GPUs de baja VRAM: reduce la huella del backbone de lenguaje entre 3 y 3,5 veces respecto a BF16, lo que permite ejecutar enrutamiento semántico multimodal en hardware modesto con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`), con codificador visual y atención lineal opcional |
| Parametros totales | 393.535.680 (safetensors); la model card del modelo base indica 0,59B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens usados en calibración; contexto máximo no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), grupo 32, simétrica |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo base `d3-edge` es un modelo de decisión multimodal que combina un backbone de lenguaje tipo Qwen 3.5 con un codificador visual. En lugar de decodificar tokens, ejecuta una cabeza de clasificación sobre preguntas estructuradas: cada pregunta se define con un tipo (`choice`, `noul` —Yes/No—, `score`) y criterios, y el modelo devuelve probabilidades por opción en un solo paso. La model card menciona soporte opcional de `flash-linear-attention` para acelerar capas de atención lineal, lo que sugiere un diseño híbrido con atención lineal en parte de la red.

Esta variante concreta no ha sido reentrenada: es una cuantización post-entrenamiento con Intel AutoRound. La configuración usada incluye 1200 iteraciones de optimización, 512 muestras de calibración, batch 4, longitud de secuencia 4096 y `enable_torch_compile=True`. El parámetro clave es `quant_nontext_module=False`, que deja el codificador visual en FP16/BF16 para evitar deriva en tareas de percepción visual y vídeo. No se dispone de información sobre el dataset de preentrenamiento del modelo base, ni sobre si hubo RLHF o DPO.

## Capacidades

- Clasificación zero-shot multimodal: evalúa texto, JSON, imágenes y fragmentos de vídeo contra preguntas de decisión definidas en tiempo de inferencia.
- Tres tipos de pregunta: `choice` (selección entre criterios), `noul` (sí/no) y `score` (puntuación ordinal sobre una lista de criterios).
- Salida de probabilidades directas en un único forward pass, sin generación autoregresiva de tokens.
- Entrada de imágenes en múltiples formatos: rutas locales, URLs, objetos PIL y cadenas base64.
- Enrutamiento semántico para sistemas multiagente o pipelines con múltiples ramas.
- API `system_one` con `state` (contexto) y `questions` (diccionario de preguntas), devolviendo `answers`.
- Compatibilidad declarada con endpoints y con `vllm-semantic-router`.
- No se documentan capacidades de generación de texto libre, código ni matemáticas; el modelo está especializado en decisión.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar una reclamación entrante en equipos como devoluciones, facturación o técnico usando preguntas `choice` con criterios, tal como muestra el ejemplo de la model card.
- Verificación documental multimodal: comprobar si un recibo adjunto contiene un producto concreto mediante preguntas `noul` sobre la imagen, aprovechando que el codificador visual se mantiene sin cuantizar.
- Triaje de urgencia: asignar un nivel de urgencia (rutina, pronto, hoy) con preguntas `score`, útil en colas de atención con SLA diferenciados.
- Moderación y filtrado previo: decidir si una entrada cumple políticas antes de pasarla a un LLM generativo, reduciendo coste y latencia del pipeline completo.
- Router de modelos en producción: seleccionar qué LLM (pequeño, grande, especializado) debe atender cada consulta según su contenido, integrado vía `vllm-semantic-router`.
- Clasificación de vídeo corto: etiquetar clips según criterios predefinidos para indexación o alertas, con la ventaja de la huella reducida en VRAM.
- Despliegue en borde: ejecutar decisiones de clasificación en GPUs de baja memoria o aceleradores embebidos donde un modelo BF16 no cabría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma "zero degradation in visual QA benchmarks (CV-Bench, Perception Test)" respecto al modelo base, pero no aporta cifras concretas que permitan verificarlo.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 0,9 GB; con overhead de activaciones y codificador visual en FP16, se puede estimar un consumo de inferencia en torno a 1,5-3 GB, aunque no se proporciona una cifra oficial.
- Reducción de huella del backbone de lenguaje de 3 a 3,5 veces frente a BF16, según el autor.
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, así como en GPUs de estación de trabajo y aceleradores de borde.
- Para el modelo base sin cuantizar se recomendarían GPUs con más memoria (A100, H100) solo si se busca throughput alto; para esta variante no es necesario.
- Opciones de despliegue: `transformers` (versión 5.17.0 indicada en la model card) con `trust_remote_code=True`, `device_map="auto"`; `auto-round` para reproducir la cuantización; `flash-linear-attention` opcional para acelerar atención lineal; compatibilidad declarada con `vllm-semantic-router`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vishva007/d3-edge-W4A16-AutoRound | 0,39B (4-bit) | 4096 en calibración | Decisión multimodal cuantizado | Apache 2.0 | Hugging Face |
| vllm-sr/d3-edge | ~0,59B | no disponible | Decisión multimodal BF16 | no disponible | Hugging Face |
| Vishva007/d3-nano-W4A16-AutoRound | no disponible | no disponible | Decisión multimodal cuantizado | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, código ni respuestas conversacionales; solo probabilidades sobre preguntas predefinidas.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica revisar el código remoto antes de usarlo en producción.
- Dependencia de una versión específica de `transformers` (5.17.0 según la model card); otras versiones pueden no ser compatibles.
- Los idiomas soportados no están documentados; el rendimiento fuera del inglés es incierto.
- El contexto máximo real no está documentado; la calibración se hizo a 4096 tokens, por lo que secuencias más largas pueden degradar la precisión.
- La cuantización W4A16 puede introducir pérdida de precisión en el backbone de lenguaje, aunque el codificador visual se mantiene en FP16/BF16.
- Riesgo de sesgo y alucinación heredado del modelo base, sin evaluación publicada que lo cuantifique.
- La model card incluye enlaces de afiliado a RunPod y plantillas de despliegue; no son requisitos técnicos del modelo.
- El modelo tiene muy poca tracción (44 descargas, 0 likes) y no hay validación independiente de su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/Vishva007/d3-edge-W4A16-AutoRound
- Modelo base: https://huggingface.co/vllm-sr/d3-edge
- Variante relacionada: https://huggingface.co/Vishva007/d3-nano-W4A16-AutoRound
- Intel AutoRound: https://github.com/intel/auto-round
- Flash Linear Attention: https://github.com/fla-org/flash-linear-attention
