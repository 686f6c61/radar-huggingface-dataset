# Stevensayer7/NEXA-One-2B-GGUF

## Resumen

NEXA-One 2B (Vision) es un ajuste fino privado del modelo multimodal Qwen3-VL-2B-Instruct, publicado en formato GGUF para su uso con llama.cpp. Lo desarrolla el usuario Stevensayer7 y está pensado específicamente como motor de inferencia local para la aplicación NEXA en iPad. El modelo parte de la base de Unsloth (unsloth/Qwen3-VL-2B-Instruct) y aplica un LoRA únicamente sobre el componente de lenguaje, manteniendo congelado el tower de visión, lo que permite reutilizar el proyector multimodal estándar (mmproj-F16.gguf) sin reentrenarlo.

Con 1.720.574.976 parámetros totales (aproximadamente 1,7 mil millones), se sitúa en la gama de modelos pequeños capaces de ejecutarse en dispositivos con recursos limitados, incluyendo hardware de consumo. La relevancia actual radica en la creciente demanda de asistentes conversacionales multimodales que funcionen en local, sin depender de la nube, y en la madurez del ecosistema GGUF/llama.cpp para desplegar este tipo de modelos en entornos Apple y edge computing.

La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque el autor advierte que el repositorio es privado a propósito y que el conjunto de entrenamiento contiene ejemplos personales que el modelo podría reproducir, lo que introduce un riesgo de fuga de información que conviene evaluar antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), vision tower congelado + LoRA en el modelo de lenguaje |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única cuantización publicada en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (NEXA-One-2B-Q4_K_M.gguf, 1.107.410.176 bytes) + proyector mmproj-F16.gguf (819.395.232 bytes) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-2B-Instruct, un transformer multimodal que combina un codificador visual con un modelo de lenguaje. El ajuste realizado por el autor consiste en un LoRA aplicado exclusivamente al componente de lenguaje, dejando el vision tower congelado. Esta decisión de diseño permite que el proyector multimodal original (mmproj-F16.gguf, procedente de unsloth/Qwen3-VL-2B-Instruct-GGUF) siga siendo compatible sin necesidad de reentrenamiento ni recalibración.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor menciona únicamente que el conjunto de entrenamiento incluye ejemplos personales de compras y que el modelo puede repetirlos, lo que sugiere un dataset reducido y orientado a un caso de uso concreto (asistente personal en la app NEXA). La única prueba de validación publicada es una comprobación de cordura conversacional: el modelo responde recordando que el usuario vive en Ipswich, lo que indica que el ajuste está orientado a memoria de contexto personal más que a capacidades generales.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a asistencia personal.
- Procesamiento de imágenes gracias al tower de visión heredado de Qwen3-VL-2B-Instruct (el proyector se mantiene intacto).
- Memoria de información personal del usuario dentro de la conversación (el ajuste LoRA parece reforzar este comportamiento).
- Compatibilidad con llama.cpp y, por extensión, con el ecosistema GGUF (Ollama, LM Studio, etc.).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking o razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente personal en iPad: el modelo está diseñado explícitamente como motor de la app NEXA, por lo que su uso principal es la conversación local con memoria de preferencias del usuario (ciudad de residencia, hábitos de compra) sin enviar datos a la nube.
- Búsquedas locales contextualizadas: el ajuste permite recordar datos como la ubicación del usuario para enriquecer consultas locales, tal como demuestra la prueba de cordura del autor.
- Procesamiento de imágenes en dispositivo: al conservar el tower de visión, puede describir o interpretar capturas y fotos tomadas con la cámara del iPad, útil para accesibilidad o catalogación rápida.
- Prototipado de asistentes multimodales en edge computing: su tamaño (1,7 B parámetros, ~1,1 GB en Q4_K_M) permite experimentar con pipelines visión-lenguaje en hardware de consumo sin infraestructura cloud.
- Automatización de listas de compras o recordatorios: el ajuste con ejemplos de compras personales sugiere un rendimiento afinado para tareas de organización doméstica.
- Evaluación de técnicas de LoRA selectivo: sirve como caso de estudio para desarrolladores que quieran ajustar solo el componente de lenguaje de un modelo multimodal sin tocar el proyector, reduciendo costes de entrenamiento.
- Integración en apps iOS/macOS vía llama.cpp: el formato GGUF y la licencia Apache 2.0 permiten embeberlo en aplicaciones nativas distribuidas comercialmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en Q4_K_M (1,1 GB de pesos + ~0,8 GB del proyector + overhead de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3050, RTX 4060 o superiores son suficientes. También funciona en Apple Silicon (M1 en adelante) mediante Metal.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (referencia directa en los tags), Ollama, LM Studio y cualquier runtime compatible con GGUF y proyectores multimodales.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| NEXA-One 2B (Vision) | 1,72 B | no disponible | Sí (tower congelado) | Apache 2.0 | GGUF |
| Qwen3-VL-2B-Instruct (base) | ~2 B | no disponible | Sí | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-VL-3B-Instruct | ~3 B | no disponible | Sí | Apache 2.0 | safetensors, GGUF |
| SmolVLM-2B | ~2 B | no disponible | Sí | Apache 2.0 | safetensors, GGUF |

La comparación directa más relevante es con su modelo base: NEXA-One 2B introduce un ajuste LoRA orientado a memoria personal y conversación, a costa de posibles sesgos hacia el dataset privado del autor. Frente a alternativas como Qwen2.5-VL-3B o SmolVLM-2B, ofrece un perfil de tamaño similar y licencia permisiva, pero carece de benchmarks públicos que permitan evaluar su rendimiento real frente a ellas.

## Limitaciones y advertencias

- Riesgo de fuga de información personal: el autor advierte explícitamente que el conjunto de entrenamiento incluye ejemplos personales de compras y que el modelo puede reproducirlos. No apto para producción sin auditoría previa.
- Sesgos desconocidos: al ser un ajuste fino sobre un dataset privado y no documentado, los sesgos introducidos no están caracterizados.
- Riesgo de alucinación: inherente a los modelos de 2 B parámetros; la memoria personal reforzada puede derivar en confabulaciones sobre datos del usuario.
- Contexto e idiomas no documentados: se desconoce la ventana de contexto efectiva tras el ajuste y los idiomas soportados.
- Repositorio marcado como privado en la model card: el autor indica que es privado a propósito, lo que limita la reproducibilidad y la confianza en el artefacto.
- Sin benchmarks ni evaluación formal: no hay métricas que respalden las capacidades declaradas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset de entrenamiento traslada al usuario la responsabilidad legal sobre posibles datos personales embebidos.

## Enlaces

- Hugging Face: https://huggingface.co/Stevensayer7/NEXA-One-2B-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3-VL-2B-Instruct
- GGUF del modelo base (origen del proyector): https://huggingface.co/unsloth/Qwen3-VL-2B-Instruct-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
