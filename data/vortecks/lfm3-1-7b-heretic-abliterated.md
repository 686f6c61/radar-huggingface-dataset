# Vortecks/LFM3-1.7B-Heretic-Abliterated

## Resumen

LFM3-1.7B-Heretic-Abliterated es una variante "abliterated" (sin comportamientos de rechazo) del modelo LFM3-1.7B de Liquid AI, publicada por el usuario Vortecks en Hugging Face. El modelo base es un modelo de lenguaje causal orientado a agentes locales y aplicaciones especializadas en edge, construido sobre la arquitectura tri-híbrida de Liquid AI, con una ventana de contexto de 262.144 tokens.

Esta versión aplica la técnica "heretic", que identifica las direcciones de rechazo en el espacio de activaciones del modelo y las elimina (abliteración), eliminando los guardrails de alineación de seguridad incorporados. El resultado es un modelo "uncensored" que atiende un espectro mucho más amplio de prompts que la versión instruida original: según las métricas del autor, pasa de 92/100 rechazos del modelo base a 3/100, con una divergencia KL respecto al modelo original de solo 0,0094, lo que indica que el comportamiento general se mantiene prácticamente intacto.

Su relevancia radica en la combinación de un tamaño reducido (~1,73B parámetros), contexto ultralargo (256K tokens), soporte de tool calling y salidas estructuradas, y disponibilidad en GGUF para ejecución local en hardware modesto. Es útil para desarrolladores que necesitan un modelo compacto y sin restricciones incorporadas para agentes locales, asumiendo que la moderación de contenidos debe implementarse aguas abajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Lfm3ForCausalLM (tri-híbrida: 24 capas — 13 convoluciones cortas con gating, 5 sliding-window attention, 6 global attention) |
| Parametros totales | 1.728.801.536 (~1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | GGUF (ej. Q8_0; niveles adicionales no especificados en la model card) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | safetensors (repo principal) y GGUF (repo derivado para llama.cpp/Ollama/LM Studio) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura tri-híbrida de Liquid AI: 24 capas que combinan 13 bloques de convolución corta con gating, 5 capas de atención con ventana deslizante y 6 capas de atención global. Este diseño híbrido reduce el coste computacional en secuencias largas frente a un transformer puro, lo que hace viable la ventana de contexto de 262.144 tokens en un modelo de solo 1,73B parámetros orientado a edge. Requiere `trust_remote_code=True` porque la arquitectura LFM3 se distribuye como código personalizado en el repositorio.

Los detalles del preentrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada. La modificación específica de esta variante no es un reentrenamiento completo, sino una abliteración mediante el método "heretic": se identifican las direcciones de rechazo en el espacio de activaciones y se suprimen mediante una optimización que minimiza la divergencia KL respecto al modelo base (0,0094) mientras se maximiza la tasa de cumplimiento de prompts adversariales (97/100 sin rechazos).

## Capacidades

- Generación de texto conversacional orientada a asistentes de uso cotidiano
- Tool calling / function calling (capacidad heredada del modelo base LFM3-1.7B)
- Salidas estructuradas (structured outputs)
- Trabajo con contexto largo (hasta 256K tokens)
- Soporte multilingüe en 16 idiomas, incluido castellano
- Diseñado para agentes locales y despliegue en edge
- Sin comportamientos de rechazo incorporados (abliterated/uncensored): atiende prompts que el modelo base rechazaría

## Casos de uso

- Agentes locales con tool calling: su tamaño de 1,73B y la arquitectura tri-híbrida permiten ejecutar agentes multi-paso en hardware de consumo, con llamadas a herramientas y salidas estructuradas sin depender de APIs externas.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite resumir, extraer información o responder preguntas sobre documentos extensos (contratos, informes, logs) en una sola pasada.
- Chatbot local privado: ejecutable vía Ollama o LM Studio en un portátil, útil para asistentes conversacionales donde no se quiere enviar datos a la nube.
- Investigación en alineación y seguridad: al ser una variante abliterated con divergencia KL documentada (0,0094), sirve como sujeto de estudio para comparar comportamiento con y sin guardrails, medir tasas de rechazo y evaluar efectos de la abliteración.
- Prototipado de aplicaciones sensibles a la moderación: para casos donde los rechazos del modelo base son falsos positivos (por ejemplo, escritura de ficción con contenido maduro, análisis de seguridad ofensiva autorizada), esta versión responde sin los filtros incorporados.
- Automatización con contexto largo en edge: pipelines de RAG o procesamiento de conversaciones multi-turno largas en dispositivos con recursos limitados, gracias al bajo requisito de VRAM.
- Generación de código y tareas STEM locales: la model card recomienda parámetros de muestreo específicos para matemáticas y STEM (`temperature=1.0, top_p=0.95, top_k=20`), lo que indica uso previsto en razonamiento técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son las del proceso de optimización heretic:

| Métrica | Este modelo | Modelo base (LiquidAI/LFM3-1.7B) |
|---|:---:|:---:|
| Divergencia KL | 0,0094 | 0 |
| Rechazos (test de 100 prompts adversariales) | 3/100 | 92/100 |

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1,73B parámetros, la versión Q8_0 en GGUF ocupa aproximadamente 2 GB de pesos; con contexto largo (131.072 tokens configurado en los ejemplos) el consumo de KV cache aumenta significativamente. En FP16/safetensors, el repo de 3,5 GB sugiere unos 3,5-4 GB de VRAM/RAM.
- GPU recomendadas: cualquier GPU moderna con 4-6 GB de VRAM es suficiente para cuantizaciones GGUF; no se requieren aceleradores de datacenter.
- Consumer GPU: cabe con holgura en GPUs como RTX 3060, RTX 4060 o superiores; también es viable en CPU o en portátiles con suficiente RAM dado su tamaño reducido (orientación edge del modelo base).
- Opciones de despliegue: llama.cpp (requiere build reciente con soporte LFM3), Ollama, LM Studio, y Hugging Face Transformers con `trust_remote_code=True`. No se menciona soporte en vLLM o TGI.
- Latencia y throughput: no disponibles; al ser un modelo de 1,73B con arquitectura híbrida, se espera inferencia rápida en hardware de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Abliterated | ~1,73B | 262.144 | Tri-híbrida (conv + SWA + atención global) | LFM Open License v1.0 | Abliterated, sin rechazos incorporados |
| LiquidAI/LFM3-1.7B (base) | ~1,73B | 262.144 | Tri-híbrida | LFM Open License v1.0 | Con alineación de seguridad (92/100 rechazos) |
| Qwen3-1.7B | ~1,7B | no disponible en esta ficha | Transformer denso | Apache 2.0 | Alternativa compacta multilingüe con licencia permisiva, sin abliterar |
| Llama 3.2 1B | ~1,2B | 128.000 | Transformer denso | Licencia Meta Llama | Menor contexto (128K) y menor tamaño, orientación similar a edge |

## Limitaciones y advertencias

- Al ser una variante abliterated, el modelo carece de guardrails de seguridad incorporados: generará contenido que el modelo base rechazaría, incluido contenido potencialmente dañino. La moderación, el filtrado y el cumplimiento normativo son responsabilidad completa del desplegador.
- Riesgo de alucinación inherente a cualquier modelo de lenguaje; la model card advierte que puede producir salidas inexactas, sesgadas o inseguras y que deben verificarse en contextos de alto impacto.
- Posible degradación sutil de capacidades: aunque la divergencia KL es baja (0,0094), la abliteración puede alterar comportamientos en casos límite; no hay benchmarks estándar que confirmen la retención completa del rendimiento del modelo base.
- La licencia LFM Open License v1.0 es una licencia personalizada ("other"): hay que revisar sus términos para uso comercial antes de desplegar en producción.
- La arquitectura LFM3 requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código personalizado del repositorio (riesgo de cadena de suministro).
- En llama.cpp se necesita una build reciente con soporte LFM3; versiones antiguas no cargarán el modelo.
- Soporte de 16 idiomas, pero la calidad fuera del inglés no está documentada en la model card.
- Métricas de rechazo basadas en un test propio de palabras clave sobre 100 prompts adversariales: metodología limitada que no garantiza ausencia total de rechazos ni cobertura de todos los escenarios.

## Enlaces

- Modelo principal: https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated
- Repositorio GGUF: https://huggingface.co/Vortecks/LFM3-1.7B-Heretic-Abliterated-GGUF/tree/main
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Web de Liquid AI: https://www.liquid.ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
