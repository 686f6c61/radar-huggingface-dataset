# vr3n/Qwen3.8-2B-Distill-GGUF

## Resumen

Qwen3.8-2B-Distill-GGUF es la versión cuantizada en formato GGUF del modelo empero-ai/Qwen3.8-2B, una destilación de parámetros completos del modelo masivo Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-2B. El desarrollo corre a cargo de Empero (empero.org), que ha entrenado al estudiante con aproximadamente 30.000 trazas del profesor, cadenas de razonamiento densas en matemáticas, razonamiento general y seguimiento de instrucciones. Esta versión GGUF, publicada por el usuario vr3n, permite ejecutar el modelo en runtimes estándar como llama.cpp, Ollama, LM Studio, Jan o KoboldCpp sin necesidad de infraestructura especializada.

El modelo cuenta con aproximadamente 1.940 millones de parámetros y presenta una arquitectura híbrida: tres capas Gated DeltaNet por cada capa de atención completa, una innovación de la familia Qwen3.5 que reduce el coste del estado recurrente manteniendo la calidad de la atención. Es un modelo de razonamiento que abre cada respuesta con un bloque de pensamiento y está orientado a entornos de borde (edge), desde teléfonos móviles hasta ordenadores de placa única. Su relevancia radica en que acerca capacidades de razonamiento de un modelo de 2,4 billones de parámetros a dispositivos con recursos muy limitados, bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Qwen3.5-2B: 3 capas Gated DeltaNet por cada capa de atención completa |
| Parámetros totales | 1.942.653.248 (≈1,94 mil millones) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors como referencia en el modelo base) |

## Arquitectura y entrenamiento

El modelo es una destilación de parámetros completos (full-parameter distillation) del profesor Qwen3.8 2.4T A95B, comprimido en la arquitectura Qwen3.5-2B. Esta arquitectura es híbrida: por cada capa de atención completa hay tres capas Gated DeltaNet, un mecanismo de estado recurrente que reduce el coste computacional de la caché de contexto respecto a la atención estándar, manteniendo una calidad comparable. Esto lo hace especialmente adecuado para inferencia en dispositivos con poca memoria.

El entrenamiento se realizó sobre aproximadamente 30.000 trazas de profesor curadas de los datasets internos de destilación de Qwen3.8 de Empero. Estas trazas son cadenas de razonamiento densas (chain-of-thought) que cubren matemáticas, razonamiento general y seguimiento de instrucciones, con un curriculum compartido con los hermanos mayores de la familia (9B y 4B). El resultado es un modelo que muestra una mejora notable en tareas de razonamiento frente a su base, según los datos publicados: MMLU pasa de 0.283 a 0.548 y GSM8K de 0.330 a 0.640.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo abre cada respuesta con un bloque ` thinking` que contiene el proceso de razonamiento, que puede extraerse para mostrar solo la respuesta final.
- Razonamiento matemático y general: mejora sustancial en GSM8K (0.640) y MMLU (0.548) frente a la base Qwen3.5-2B.
- Seguimiento de instrucciones y conversación multi-turno: incluye plantilla de chat integrada en el archivo GGUF, usable con `-cnv` en llama.cpp.
- Soporte para tool calling y function calling: no se menciona explícitamente en la información disponible, por lo que no se confirma.
- Capacidades multilingües: la model card solo declara inglés (en).
- Modo razonamiento (thinking mode): todas las respuestas abren con un bloque de razonamiento, que puede eliminarse para el usuario final.
- Compatibilidad con runtimes estándar: llama.cpp, Ollama, LM Studio, Jan, KoboldCpp.

## Casos de uso

- Asistente de razonamiento en dispositivos móviles: el modelo Q4_K_M ocupa solo 1.312 GB, por lo que puede ejecutarse en un teléfono o una placa como Raspberry Pi con CPU únicamente, ofreciendo respuestas con cadena de razonamiento en conversaciones de soporte técnico o educativas.
- Generación de código en entornos sin GPU: al ser un modelo de razonamiento, puede desplegarse en un portátil con 8 GB de RAM para asistir a desarrolladores en tareas de programación, explicando paso a paso la lógica de los fragmentos generados.
- Chatbot de atención al cliente con contexto largo: con la cuantización Q5_K_M (1.455 GB) y una ventana de contexto ampliable hasta 16.384 tokens en el ejemplo de uso, puede mantener conversaciones multi-turno de soporte técnico o comercial en inglés.
- Automatización de documentación técnica: el modelo puede generar documentación detallada de código o APIs, gracias a su capacidad de razonamiento estructurado, desplegado en un pipeline de CI/CD con llama.cpp.
- Investigación educativa en razonamiento: dado que expone su cadena de razonamiento en el bloque ` thinking`, puede usarse para estudiar patrones de razonamiento en modelos pequeños, útil en entornos académicos sin acceso a GPUs grandes.
- Prototipado rápido en entornos de borde: con la cuantización Q6_K (1.606 GB) en una GPU de 4 GB o CPU con 8 GB de RAM, se puede implementar un asistente de razonamiento en un dispositivo IoT o un sistema de embebido para tareas de clasificación de texto y análisis de sentimiento.

## Benchmarks y rendimiento

Los resultados publicados en la model card del modelo base (empero-ai/Qwen3.8-2B) con protocolos CoT y `lm-evaluation-harness`, con configuraciones idénticas para base y estudiante:

| Tarea | Qwen3.5-2B (base) | Qwen3.8-2B (destilado) | Δ |
|---|---:|---:|---:|
| MMLU (CoT, 57 subjects) | 0.283 | 0.548 | +0.265 |
| GSM8K (CoT) | 0.330 | 0.640 | +0.310 |

No se han publicado resultados de benchmarks para las cuantizaciones GGUF específicas en la información disponible. El modelo base (BF16) es el que muestra estos resultados.

## Requisitos de hardware

- Cuantización Q4_K_M (1.312 GB): ejecutable en CPU en teléfonos, placas de desarrollo y portátiles modernos, sin GPU.
- Cuantización Q5_K_M (1.455 GB): igualmente ejecutable en CPU en dispositivos de gama media.
- Cuantización Q6_K (1.606 GB): requiere GPU con al menos 4 GB de VRAM o CPU con 8 GB de RAM.
- Cuantización Q8_0 (2.077 GB): requiere GPU con al menos 4 GB de VRAM o CPU con 8 GB de RAM.
- Cuantización BF16 (3.897 GB): requiere GPU con al menos 6 GB de VRAM.
- Runtimes compatibles: llama.cpp (versión reciente con soporte Qwen3.5 / Gated DeltaNet), Ollama, LM Studio, Jan, KoboldCpp.
- Latencia y throughput: no se han publicado datos concretos; depende del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | MMLU (CoT) | GSM8K (CoT) | Licencia |
|---|---|---:|---|---|---|
| Qwen3.8-2B (destilado) | ≈1,94B | Híbrida Gated DeltaNet + atención | 0.548 | 0.640 | Apache-2.0 |
| Qwen3.5-2B (base) | ≈2B | Híbrida Gated DeltaNet + atención | 0.283 | 0.330 | Apache-2.0 |
| Phi-3-mini (referencia, no en datos) | 3,8B | Transformer denso | no disponible | no disponible | MIT |

La comparativa directa solo es posible con la base Qwen3.5-2B, que es el modelo del que deriva. No se dispone de datos de rendimiento de otros modelos de 2B en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo está entrenado en inglés (tag `en`); no soporta otros idiomas de forma nativa.
- Requiere una versión reciente de llama.cpp que soporte la arquitectura Qwen3.5 / Gated DeltaNet; las versiones antiguas no cargarán el modelo.
- Es un modelo de razonamiento: todas las respuestas abren con un bloque ` thinking`, lo que aumenta el número de tokens generados y puede alargar la latencia en producción si no se gestiona correctamente.
- No se han publicado datos sobre sesgos o alucinaciones específicos; al ser una destilación de un modelo masivo, puede heredar sesgos del profesor no documentados.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base (Qwen3.5) hereda condiciones de uso que deben revisarse en la documentación oficial de Qwen.
- La longitud de contexto no está especificada en la información disponible; el ejemplo de uso sugiere hasta 16.384 tokens, pero el límite real depende de la caché de contexto y la cuantización.
- No se han publicado resultados de benchmarks para las cuantizaciones GGUF, por lo que el rendimiento puede variar respecto al modelo BF16.

## Enlaces

- Repositorio GGUF: https://huggingface.co/vr3n/Qwen3.8-2B-Distill-GGUF
- Modelo base (safetensors): https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Web de Empero: https://empero.org
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Análisis externo del modelo: https://www.aimodels.fyi/models/huggingFace/qwen3.8-2b-distill-gguf-empero-ai
