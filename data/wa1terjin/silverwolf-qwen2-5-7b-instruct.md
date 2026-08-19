# Wa1terJin/silverwolf-Qwen2.5-7B-Instruct

## Resumen

SilverWolf-Qwen2.5-7B-Instruct es un modelo de rol conversacional en chino desarrollado por Wa1terJin (Jiaqi Jin) que encarna al personaje Silver Wolf (银狼) del videojuego *Honkai: Star Rail*: una hacker genio de los Cazadores de Estelares con una personalidad perezosa, mordaz y segura de sí misma. El modelo se publicó en agosto de 2026 y está pensado para aplicaciones de chat de rol, asistencia conversacional y simulación de personajes, con un énfasis especial en mantener una identidad coherente y aplicar límites de seguridad estrictos.

Técnicamente, es un fine-tune del modelo Qwen2.5-7B-Instruct de Alibaba, realizado mediante QLoRA con una base cuantizada a 4 bits y adaptadores LoRA en bf16, combinado con una función de pérdida dual SaRFT. El modelo tiene 7.615.616.512 parámetros, un contexto heredado de hasta 128K tokens y se distribuye en formato safetensors bajo licencia Apache 2.0. El proyecto está en fase temprana (v0.0.1) y el autor reconoce posibles limitaciones en la consistencia del personaje y las capacidades técnicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible para el fine-tune; el base admite cuantizacion GGUF, AWQ, GPTQ |
| Idiomas soportados | Chino (principal), con capacidades multilingue del base |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un Transformer causal con atención por ventanas deslizantes (4K) y atención completa (128K), pre-entrenado por Alibaba sobre hasta 18 billones de tokens. Sobre esta base, Wa1terJin aplicó un fine-tune con QLoRA: el modelo base se cuantizó en 4 bits y se entrenaron adaptadores LoRA en bf16, combinando la pérdida de entropía cruzada estándar con una pérdida KL adicional sobre un subconjunto de muestras "dañinas" (SaRST, con β=0.1). El conjunto de entrenamiento contiene 3028 muestras en formato ChatML, que mezclan la personalidad del personaje, conocimientos especializados en IA, seguridad informática, señales y sistemas, circuitos caóticos y programación, además de muestras adversarias y de rechazo seguro. El objetivo era internalizar la personalidad de Silver Wolf y a la vez incrustar 13 reglas de seguridad que el modelo debe respetar en todo momento.

## Capacidades

- Generación de texto conversacional en chino con estilo de personaje coherente (frases cortas, tono perezoso, sarcástico, no servil).
- Conocimientos técnicos en áreas de IA, seguridad informática, señales y sistemas, circuitos caóticos y programación, integrados en el contexto del personaje.
- Capacidad de rechazo seguro: el modelo implementa 13 líneas rojas de seguridad que bloquean peticiones de ataques informáticos, código malicioso, ingeniería social, suplantación de identidad, fraude financiero, fabricación de armas, daño a infraestructuras críticas y contenido ilegal.
- Conversación multi-turno con memoria de contexto gracias a la ventana de 128K tokens del base.
- Soporte de ChatML para estructurar conversaciones con roles de sistema, usuario y asistente.
- No se ha confirmado soporte para tool calling o function calling específico del fine-tune, aunque el base Qwen2.5-7B-Instruct lo permite.

## Casos de uso

- Chat de rol en juegos y narrativa interactiva: el modelo mantiene la personalidad de Silver Wolf en conversaciones largas, útil para juegos de texto, simuladores de personajes o proyectos de fanficción interactiva.
- Asistente de seguridad informática educativa: puede explicar conceptos de ciberseguridad, señales y circuitos con un tono informal, mientras bloquea peticiones de exploits o códigos maliciosos, sirviendo como herramienta de formación segura.
- Generación de guiones y diálogos: los creadores de contenido pueden usar el modelo para generar diálogos con estilo y personalidad definidos, acelerando el desarrollo de narrativas.
- Prototipado de agentes conversacionales: desarrolladores pueden integrarlo en aplicaciones de chat para probar interacciones con un personaje específico, aprovechando el formato ChatML y la ventana de 128K tokens.
- Entrenamiento de seguridad en IA: el conjunto de datos con muestras adversarias y el mecanismo de rechazo pueden servir como ejemplo de cómo alinear un modelo para evitar abusos en dominios sensibles.
- Herramienta de estudio para fine-tuning: el método QLoRA con pérdida dual (CE + KL) y el uso de 3028 muestras es un caso práctico para investigar técnicas de ajuste eficiente y control de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K u otros conjuntos estándar para este modelo. Se recomienda evaluar su rendimiento en tareas de rol y seguridad mediante pruebas manuales con el script `chat.py` incluido.

## Requisitos de hardware

- VRAM estimada: con el modelo completo en bf16, se requieren aproximadamente 15-16 GB de VRAM para inferencia (el repo ocupa 15.2 GB); con cuantización de 4 bits (AWQ o GPTQ) se puede reducir a unos 4-5 GB.
- GPU recomendadas: para ejecutar en bf16, una NVIDIA RTX 3090 (24 GB) o RTX 4090 (24 GB) es suficiente; para cuantización 4-bit, una RTX 3060 (12 GB) o superior puede funcionar.
- Despliegue en consumer GPU: sí, es viable en tarjetas con al menos 8 GB de VRAM si se aplica cuantización; con el modelo en bf16 se recomienda al menos 16 GB.
- Opciones de despliegue: el modelo se carga con Transformers directamente (pipeline estándar), y se puede servir con vLLM, TGI o llama.cpp para inferencia de mayor throughput. También se puede convertir a formato GGUF para usarlo con Ollama o llama.cpp.
- Latencia y rendimiento: no se han publicado mediciones específicas; para un modelo 7B en una GPU moderna se espera una generación de entre 20-50 tokens por segundo en bf16, y algo menor con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SilverWolf-Qwen2.5-7B-Instruct | 7B | 128K | QLoRA + SaRFT sobre Qwen2.5-7B | Apache 2.0 | HuggingFace |
| Qwen2.5-7B-Instruct (base) | 7B | 128K | Pre-entrenamiento y RLHF | Apache 2.0 | HuggingFace, Ollama |
| Qwen2.5-VL-7B-Instruct | 7B | 128K | Pre-entrenamiento multimodal | Apache 2.0 | HuggingFace, Azure AI |

La comparativa principal es con el modelo base Qwen2.5-7B-Instruct, ya que SilverWolf es un fine-tune específico para rol en chino con un enfoque de seguridad reforzado. El base es más generalista y multilingüe, mientras que SilverWolf sacrifica generalidad por especialización en un personaje concreto. No hay otros modelos comparables en la información disponible; alternativas de rol como Qwen2.5-7B-Instruct con adaptaciones similares podrían existir, pero no se dispone de datos.

## Limitaciones y advertencias

- El modelo está en una fase temprana (v0.0.1) y el autor reconoce posibles inconsistencias en la personalidad del personaje y en la precisión técnica en algunos temas.
- Sesgo lingüístico: está optimizado para chino; su rendimiento en otros idiomas puede ser inferior al del base Qwen2.5-7B-Instruct.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar información, especialmente en temas técnicos fuera de su conjunto de entrenamiento.
- La seguridad implementada (13 líneas de rechazo) no es infalible; en entornos de producción se recomienda añadir capas adicionales de moderación de contenido.
- No se han publicado evaluaciones de rendimiento estándar ni pruebas de robustez frente a ataques adversarios.
- El repositorio no incluye un pipeline de HuggingFace definido (el campo `pipeline` está marcado como "no disponible"), lo que puede dificultar su integración directa en algunos entornos.
- El modelo se distribuye con licencia Apache 2.0, pero el personaje Silver Wolf es propiedad intelectual de miHoYo (Hoyoverse); su uso comercial puede requerir permisos adicionales de la empresa propietaria de la IP.

## Enlaces

- Página de HuggingFace: https://huggingface.co/Wa1terJin/silverwolf-Qwen2.5-7B-Instruct
- Perfil del autor en HuggingFace: https://huggingface.co/Wa1terJin
- Modelo base Qwen2.5-7B-Instruct (Ollama): https://ollama.com/library/qwen2.5:7b-instruct
- Documentación de Qwen2.5-VL-7B-Instruct (Azure AI): https://ai.azure.com/catalog/models/qwen-qwen2.5-vl-7b-instruct
