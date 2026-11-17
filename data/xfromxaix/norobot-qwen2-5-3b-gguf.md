# XFromXAIX/norobot-qwen2.5-3b-gguf

## Resumen

NöroBot Qwen 3B (v3) es un ajuste fino del modelo Qwen2.5-3B-Instruct de Alibaba Cloud, publicado por el usuario XFromXAIX en Hugging Face. El modelo está especializado en conversación en turco con un tono cercano e informal, y se distribuye empaquetado en formato GGUF con cuantización Q4_K_M para su uso directo en herramientas de inferencia local como llama.cpp, Ollama o LM Studio.

El ajuste se realizó mediante LoRA (r=16, alfa=32, dos rondas de entrenamiento) sobre aproximadamente 550 ejemplos de conversación en turco escritos manualmente. Posteriormente, la capa LoRA se fusionó con el modelo base y se convirtió a GGUF. El resultado es un modelo de 3.085.938.688 parámetros (3B) con una única variante cuantizada de 1,93 GB, orientado a chatbots ligeros en turco.

Su relevancia es limitada y muy específica: cubre el nicho de asistentes conversacionales en turco que deben ejecutarse en hardware modesto, sin dependencia de API. No obstante, la licencia Qwen Research restringe el uso a fines no comerciales, lo que condiciona seriamente su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens; el autor no lo declara explícitamente para este ajuste) |
| Tipos de cuantización | Q4_K_M (única variante publicada) |
| Idiomas soportados | Turco (tr) |
| Licencia | Qwen Research License Agreement (solo uso no comercial) |
| Formato de pesos | GGUF (`qwen2.5-3b-norobot2-q4_k_m.gguf`, 1.929.902.624 bytes) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-3B-Instruct, con atención por grupos de consultas (GQA) y las mejoras de tokenización y posicionamiento del modelo base. Sobre esta base se aplicó un ajuste fino supervisado mediante LoRA con rango 16 y alfa 32, en dos rondas de entrenamiento, usando un corpus de aproximadamente 550 ejemplos de conversación en turco redactados a mano. El objetivo declarado es un chatbot breve, cercano y con trato de "tú" (segunda persona informal en turco).

Tras el entrenamiento, la capa LoRA se fusionó con los pesos del modelo base y el conjunto se convirtió a GGUF mediante llama.cpp, aplicando cuantización Q4_K_M. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado. El autor no publica detalles sobre composición del dataset, número de tokens de entrenamiento ni hiperparámetros más allá de los citados.

## Capacidades

- Generación de texto conversacional en turco con estilo informal y trato de "tú".
- Respuestas breves (el autor recomienda 1-3 frases por intervención).
- Conversación multi-turno dentro de la ventana de contexto heredada del modelo base.
- Plantilla de chat compatible con Qwen2.5 (mismos tokens especiales de rol).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de pensamiento explícito.
- Capacidad multilingüe no declarada: el autor solo lista turco.

## Casos de uso

- Chatbot de acompañamiento en turco para aplicaciones de ocio o demos: el modelo está entrenado para respuestas cortas y cercanas, adecuado para prototipos de asistente conversacional sin requisitos de precisión factual.
- Integración en aplicaciones de escritorio con llama.cpp o LM Studio: el único archivo GGUF Q4_K_M (1,93 GB) permite ejecución local en portátiles con GPU modesta o incluso en CPU.
- Pruebas de concepto de asistentes en turco en entornos de investigación: la licencia Qwen Research permite uso académico y de evaluación sin coste.
- Generación de diálogos sintéticos en turco para aumentar datasets de entrenamiento: el modelo puede producir turnos conversacionales breves que sirvan como semilla, siempre con revisión humana.
- Despliegue en dispositivos de borde (edge) para demostraciones offline: el tamaño reducido y la cuantización Q4_K_M facilitan la ejecución sin conexión en hardware de gama baja.
- Evaluación comparativa de ajustes finos ligeros en turco: sirve como referencia de línea base para investigar el efecto de LoRA con pocos ejemplos sobre modelos Qwen2.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,5-3 GB con la cuantización Q4_K_M publicada, considerando pesos y caché KV para contextos moderados (estimación orientativa; el autor no publica cifras).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060). En GPU de datacenter (A100, H100) el modelo está sobredimensionado en capacidad y no aprovecha el hardware.
- Compatibilidad con GPU consumer: sí, en la práctica totalidad de GPU consumer actuales e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python. No se distribuyen pesos en safetensors ni se documenta compatibilidad con vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| NöroBot Qwen 3B (v3) | 3,09B | No disponible | Turco | Qwen Research (no comercial) | GGUF Q4_K_M |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Multilingüe (incluye turco) | Apache 2.0 (según modelo base) | Safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | Multilingüe | Apache 2.0 | Safetensors, GGUF |
| Llama 3.2 3B Instruct | ~3,2B | 128.000 tokens | Multilingüe (turco limitado) | Llama 3.2 Community License | Safetensors, GGUF |

El modelo base Qwen2.5-3B-Instruct es la alternativa más directa: ofrece licencia Apache 2.0, contexto documentado y capacidades multilingües, pero carece del ajuste conversacional específico en turco que aporta NöroBot. Para uso comercial, el modelo base es claramente preferible por licencia.

## Limitaciones y advertencias

- Modelo pequeño (3B): el propio autor advierte que puede perder el hilo de la conversación, malinterpretar emociones o inventar palabras.
- Riesgo de alucinación elevado en dominios factuales: el autor desaconseja confiar en sus respuestas sobre salud, derecho o finanzas.
- Entrenado con solo ~550 ejemplos, lo que limita la cobertura de estilos y temas; el ajuste puede sobreajustar al tono concreto del corpus.
- Licencia Qwen Research: uso exclusivamente no comercial (investigación y evaluación). Cualquier uso comercial requiere licencia adicional de Alibaba Cloud.
- Obligación de redistribuir los archivos LICENSE y NOTICE junto con el modelo.
- Idioma limitado al turco según la model card; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Ventana de contexto no declarada por el autor para este ajuste; se desconoce si el ajuste preserva los 32.768 tokens del modelo base.
- Sin datos de benchmarks ni evaluaciones independientes: no hay evidencia cuantitativa de calidad frente al modelo base.
- Repositorio con muy poca tracción (49 descargas, 0 likes) y sin mantenimiento documentado más allá de la fecha de actualización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XFromXAIX/norobot-qwen2.5-3b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
