# Wynnoaasf/wynr-ai-v0.2

## Resumen

WYNR AI v0.2 es un ajuste fino (fine-tune) experimental de un modelo Qwen2.5 de aproximadamente 0,5B parámetros (494.032.768 parámetros reales según los pesos en safetensors), desarrollado por el usuario Wynnoaasf. El modelo está diseñado como un asistente conversacional en vietnamita, con capacidades orientadas a responder preguntas generales, proporcionar información sobre Vietnam y asistir en temáticas relacionadas con ferrocarriles y transporte marítimo, además de mantener una identidad de asistente propia ("WYNR").

Se trata de un modelo derivado de otro modelo del mismo autor (WYNR AI v0.1), entrenado mediante LoRA sobre 1.670 muestras durante 3 épocas, con una mejor pérdida de validación de 1,4623. El resultado se publica como modelo fusionado (merged) en formato safetensors, con licencia MIT y un tamaño de repositorio de aproximadamente 1 GB.

La relevancia de este modelo es limitada a nivel técnico: se trata de un experimento de ajuste fino de pequeño tamaño, con un único idioma soportado (vietnamita) y sin benchmarks publicados. Resulta útil como ejemplo de personalización de un modelo base pequeño para un dominio y una identidad concretos, pero no está pensado para producción ni para tareas de razonamiento complejo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parámetros totales | 494.032.768 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card usa 2.048 tokens como límite de truncado en el ejemplo de chat) |
| Tipos de cuantización | No disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal estándar. El tamaño declarado es de aproximadamente 0,5B parámetros, coherente con la cifra real de 494.032.768 parámetros extraída de los pesos. No se especifican detalles sobre el número de capas, dimensiones ocultas, número de cabezas de atención ni vocabulario en la información disponible.

El entrenamiento consistió en un ajuste fino mediante LoRA sobre el modelo WYNR AI v0.1, utilizando el dataset `Wynnoaasf/wynr-identity` con 1.670 muestras de entrenamiento durante 3 épocas, alcanzando una mejor pérdida de validación de 1,4623. El resultado se publica como modelo fusionado (standalone merged model). No se indica el número total de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en vietnamita.
- Respuesta a preguntas generales de conocimiento.
- Proporción de información sobre Vietnam.
- Asistencia en temáticas de ferrocarriles y transporte marítimo.
- Mantenimiento de una identidad de asistente consistente ("WYNR").
- Soporte de plantilla de chat (`apply_chat_template`) para formato multi-turno.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al vietnamita según los metadatos.

## Casos de uso

- Asistente conversacional en vietnamita para consultas generales: el modelo puede gestionar diálogos multi-turno mediante la plantilla de chat, adecuado para prototipos de atención al cliente en vietnamita con cargas ligeras gracias a su tamaño de 0,5B parámetros.
- Consultas sobre Vietnam: información turística, cultural o geográfica, aunque con la advertencia de que la cobertura de conocimiento es limitada y requiere verificación.
- Asistencia en dominio ferroviario y marítimo: el ajuste fino incluye temáticas específicas de transporte, útil para demos de asistentes sectoriales en vietnamita.
- Prototipado de identidad de marca: sirve como ejemplo de cómo ajustar un modelo pequeño para que mantenga una personalidad y nombre concretos en un producto.
- Experimentación educativa con LoRA: el modelo documenta el flujo completo de ajuste fino (dataset, épocas, pérdida) y resulta útil como referencia para quienes aprenden a personalizar modelos Qwen2.5 pequeños.
- Despliegue en entornos con recursos limitados: con 0,5B parámetros y formato safetensors, puede ejecutarse en CPU o en GPU de gama baja para pruebas de concepto, aunque no se documentan cuantizaciones GGUF.
- Base para futuros ajustes: al ser un modelo fusionado con licencia MIT, puede reutilizarse como punto de partida para nuevos fine-tunes en vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para los pesos (494M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 1,5 y 2,5 GB según longitud de contexto y lote.
- VRAM estimada en fp32: aproximadamente 2 GB solo para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; NVIDIA T4, RTX 3060, RTX 4060 o superiores son suficientes. Para fp32 se recomienda al menos 6 GB.
- Compatible con GPU de consumo: sí, cabe en prácticamente cualquier GPU consumer moderna (RTX 3050 en adelante) e incluso en CPU para inferencia lenta.
- Opciones de despliegue: `transformers` con `accelerate` y `device_map="auto"` (documentado en la model card). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, y no se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo de 0,5B, se espera una latencia baja en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|---|
| WYNR AI v0.2 | 494M | No disponible (ejemplo usa 2.048) | Vietnamita | MIT | safetensors | No publicados |
| Qwen2.5-0.5B (base) | ~494M | 32.768 tokens (según documentación de Qwen2.5) | Multilingüe | Apache 2.0 | safetensors, GGUF | Publicados por el autor original |
| SmolLM2-360M | ~360M | 8.192 tokens | Multilingüe | Apache 2.0 | safetensors, GGUF | Publicados por el autor original |
| Gemma 2 2B | ~2B | 8.192 tokens | Multilingüe | Gemma license | safetensors, GGUF | Publicados por el autor original |

Nota: los datos de los modelos comparativos corresponden a conocimiento general de dichos modelos; no se dispone de comparación directa publicada con WYNR AI v0.2. WYNR AI v0.2 se distingue por su especialización en vietnamita y su licencia MIT, pero carece de benchmarks y de contexto documentado.

## Limitaciones y advertencias

- Modelo experimental: el propio autor indica que la cobertura de conocimiento y la precisión fáctica están en mejora, y recomienda verificar siempre la información importante.
- Riesgo elevado de alucinación: con solo 1.670 muestras de entrenamiento y 0,5B parámetros, la fiabilidad factual es limitada.
- Sesgos conocidos: no documentados, pero al entrenarse sobre un dataset pequeño y específico puede heredar sesgos del modelo base y del dataset de identidad.
- Limitación idiomática: solo se declara vietnamita; el rendimiento en otros idiomas no está garantizado.
- Longitud de contexto: no documentada oficialmente; el ejemplo de la model card trunca a 2.048 tokens, lo que sugiere un uso práctico limitado a conversaciones cortas.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación, pero sin garantías por parte del autor.
- Caveat de producción: el repositorio se describe en la model card como privado, aunque aparece accesible en Hugging Face; conviene verificar el acceso antes de integrarlo en pipelines.
- Sin soporte documentado de tool calling, agentes ni cuantizaciones, lo que limita su integración en sistemas más complejos.
- Fecha de creación en los metadatos (2026-11-01) resulta anómala; conviene tratar los metadatos temporales con cautela.

## Enlaces

- [Hugging Face: Wynnoaasf/wynr-ai-v0.2](https://huggingface.co/Wynnoaasf/wynr-ai-v0.2)
- [Dataset: Wynnoaasf/wynr-identity](https://huggingface.co/datasets/Wynnoaasf/wynr-identity)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
