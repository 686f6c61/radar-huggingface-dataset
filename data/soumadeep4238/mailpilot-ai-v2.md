# soumadeep4238/MailPilot-AI-v2

## Resumen

MailPilot-AI-v2 es un adaptador LoRA publicado en HuggingFace por el usuario soumadeep4238, construido sobre el modelo base unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit. Se trata, por tanto, de un ajuste fino mediante SFT (supervised fine-tuning) con la librería PEFT 0.20.0 y el stack Unsloth/TRL sobre una versión cuantizada a 4 bits del Qwen2.5-1.5B-Instruct de Alibaba. El nombre sugiere un enfoque hacia tareas de correo electrónico (redacción, respuestas, clasificación), aunque la model card no documenta explícitamente el propósito ni el dataset de entrenamiento.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-1.5B, con aproximadamente 1.540 millones de parámetros y una ventana de contexto nativa de 32.768 tokens en el modelo base. El adaptador en sí es de tamaño reducido (el repositorio ocupa 0,1 GB), lo que refleja que solo se almacenan los pesos LoRA y no el modelo completo. Es relevante para quienes buscan un punto de partida ligero y desplegable en hardware de consumo para tareas de generación de texto conversacional en inglés.

La información publicada es muy escasa: la model card es la plantilla por defecto de HuggingFace sin rellenar, sin licencia declarada, sin idiomas especificados y sin resultados de evaluación. Cualquier uso en producción requiere validación propia y verificación de los términos de la licencia del modelo base (Qwen2.5 se distribuye bajo Apache 2.0, pero el adaptador no declara licencia propia).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | ~1.540 M (modelo base Qwen2.5-1.5B); adaptador LoRA de tamaño reducido (repo de 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B) |
| Tipos de cuantizacion | Modelo base en bnb-4bit; el adaptador se publica en safetensors (precisión del adaptador no especificada) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multilingüe, pero el adaptador no lo declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar, RoPE y normalización RMSNorm, preentrenado por Alibaba. El ajuste se realizó con LoRA (Low-Rank Adaptation) mediante PEFT 0.20.0, usando SFT con TRL y Unsloth, este último orientado a acelerar el fine-tuning y reducir el consumo de memoria. El modelo base sobre el que se entrena está cuantizado a 4 bits (bnb-4bit), lo que implica que el adaptador se entrenó sobre pesos cuantizados y debe combinarse con esa misma versión base para reproducir el comportamiento.

No se especifican hiperparámetros de entrenamiento (rango LoRA, alpha, dropout, learning rate, épocas), ni el volumen o composición del dataset, ni si hubo etapas de RLHF o DPO posteriores al SFT. La model card no documenta ninguna innovación técnica adicional más allá del uso del stack Unsloth/PEFT. Tampoco se indica el número de tokens de entrenamiento ni la procedencia de los datos.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones de complejidad media, limitado por el tamaño de 1.5B parámetros.
- Generación de código y matemáticas a nivel básico (capacidad del modelo base, no verificada tras el ajuste).
- Soporte de tool calling y function calling: el modelo base Qwen2.5-Instruct lo soporta; no se confirma que el adaptador lo preserve.
- Capacidades multilingües: el modelo base Qwen2.5 cubre varios idiomas; el adaptador no declara idiomas y el nombre sugiere un enfoque en inglés.
- Posible especialización en tareas de correo electrónico (redacción, respuesta, clasificación) por el nombre "MailPilot", no documentada en la model card.
- Sin soporte de visión, audio ni modo thinking explícito.

## Casos de uso

- Redacción asistida de correos electrónicos: el adaptador podría generar borradores de respuestas a partir de un hilo de conversación, aprovechando la ventana de 32.768 tokens del modelo base para incluir contexto extenso de la cadena de mensajes.
- Clasificación y priorización de bandeja de entrada: uso del modelo para etiquetar correos por urgencia o temática mediante prompts de clasificación, con coste de inferencia muy bajo gracias al tamaño de 1.5B.
- Resumen de hilos largos: condensar conversaciones de correo de varias decenas de miles de tokens en un resumen breve, apoyándose en el contexto nativo del modelo base.
- Asistente de respuesta en entornos de soporte: generación de respuestas plantilla personalizadas en un pipeline con validación humana, adecuado por el bajo requisito de hardware.
- Prototipado rápido de aplicaciones de NLP: servir como base para experimentos de fine-tuning adicional o evaluación de prompts sin necesidad de GPU de gama alta.
- Extracción de entidades y datos estructurados de correos: convertir texto libre en campos JSON (remitente, fecha, acción requerida) mediante prompting, con verificación posterior.
- Despliegue en edge o en local: al ser un adaptador sobre 1.5B en 4 bits, puede ejecutarse en portátiles con GPU modesta para demos y pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con el modelo base en 4 bits (bnb-4bit) más el adaptador; en FP16 el modelo base completo requeriría unos 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para la versión 4 bits; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060 y superiores).
- Opciones de despliegue: transformers con PEFT para cargar el adaptador sobre el modelo base cuantizado; llama.cpp u Ollama si se fusiona y convierte el adaptador a GGUF; vLLM y TGI para servir el modelo fusionado, aunque la combinación con bnb-4bit puede limitar algunas opciones.
- Latencia y throughput estimados: no disponibles; por el tamaño de 1.5B se espera una latencia baja en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MailPilot-AI-v2 (este) | ~1.540 M (base) + LoRA | 32.768 tokens (base) | no disponible | HuggingFace, 0 descargas |
| Qwen2.5-1.5B-Instruct | ~1.540 M | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente usado |
| Llama 3.2-1B-Instruct | ~1.230 M | 128.000 tokens | Llama 3.2 Community License | HuggingFace, muy extendido |
| SmolLM2-1.7B-Instruct | ~1.700 M | 8.192 tokens | Apache 2.0 | HuggingFace, activo |

La comparación directa con el modelo base Qwen2.5-1.5B-Instruct es la más relevante: el adaptador no aporta mejoras verificadas y añade una dependencia de la versión cuantizada concreta. Frente a Llama 3.2-1B y SmolLM2-1.7B, el interés del adaptador depende de su especialización en correo, que no está documentada ni evaluada.

## Limitaciones y advertencias

- Model card sin rellenar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni uso previsto, lo que impide valorar su calidad y sesgos.
- Licencia no declarada: no se puede asumir uso comercial; además, el adaptador hereda las restricciones del modelo base Qwen2.5 (Apache 2.0) y de la versión Unsloth bnb-4bit.
- Riesgo de alucinación: al ser un modelo de 1.5B parámetros, la tasa de errores factuales es alta en tareas abiertas.
- Dependencia del modelo base exacto: el adaptador se entrenó sobre la variante bnb-4bit de Unsloth; cargarlo sobre otra cuantización o sobre el modelo en FP16 puede degradar el comportamiento.
- Idiomas no declarados: el ajuste podría haber desplazado el modelo hacia el inglés y degradar el rendimiento en castellano.
- Sin benchmarks ni evaluación: no hay evidencia pública de que el ajuste mejore al modelo base en ninguna tarea.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; tratar como experimental.
- Capacidades de tool calling y agentes no verificadas tras el ajuste LoRA.

## Enlaces

- HuggingFace: https://huggingface.co/soumadeep4238/MailPilot-AI-v2
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper de PEFT/LoRA: https://arxiv.org/abs/2106.09685
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Referencia Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
