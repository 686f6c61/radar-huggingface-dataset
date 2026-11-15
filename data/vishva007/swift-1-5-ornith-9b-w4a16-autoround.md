# Vishva007/Swift-1.5-Ornith-9B-W4A16-AutoRound

## Resumen

Swift-1.5-Ornith-9B-W4A16-AutoRound es una versión cuantizada a 4 bits de los pesos (W4A16) del modelo multimodal `ukisai/Swift-1.5-Ornith-9B`, publicado por el usuario Vishva007. El modelo base es un derivado de razonamiento eficiente de `ornith-ai/Ornith-1.5-9B`, desarrollado por UkisAI, que reduce el consumo de tokens de pensamiento en aproximadamente un 33,1 % y mejora la precisión en GPQA-Diamond en 1,52 puntos porcentuales respecto al modelo original. Esta variante cuantizada emplea Intel AutoRound (SignRound) para comprimir los pesos a INT4 manteniendo las activaciones en 16 bits.

El interés de esta ficha radica en que combina tres elementos poco habituales: una arquitectura híbrida Qwen3.5 con atención lineal GatedDeltaNet, un cabezal de predicción multi-token (MTP) para decodificación especulativa nativa, y un pipeline multimodal image-text-to-text. Todo ello empaquetado en un checkpoint de 4,1 mil millones de parámetros reales (según safetensors) que ocupa 11,8 GB en el repositorio, lo que facilita su despliegue en GPUs de gama alta para consumidores.

La cuantización preserva en BF16 los módulos sensibles —atención lineal, codificador visual, cabezal MTP y `lm_head`— mientras que solo 128 de las 359 capas lineales se cuantizan a INT4. El resultado es un modelo orientado a razonamiento, código y uso agéntico con tool calling, pensado para servirse con vLLM 0.19.1 o superior y Transformers 5.8.1 o superior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3_5ForConditionalGeneration (24 bloques GatedDeltaNet de atención lineal + 8 bloques de atención completa + codificador visual + cabezal MTP de 1 capa) |
| Parámetros totales | 4.108.213.488 (según safetensors); el nombre comercial indica 9B, no disponible la discrepancia exacta |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 200K tokens (configurado en el ejemplo de servicio con vLLM) |
| Tipos de cuantización | W4A16 (4 bits pesos, 16 bits activaciones), group_size=32, simétrico; capas sensibles en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con esquema `auto_round` (compatible con `auto-gptq`); existen variantes GPTQ y `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida Qwen3.5 que alterna 24 bloques de atención lineal GatedDeltaNet con 8 bloques de atención completa, lo que reduce el coste computacional en secuencias largas manteniendo la capacidad de recuperación de contexto. Incorpora además un codificador visual con 27 bloques de transformer y un merger de parches, junto con un cabezal de predicción multi-token (MTP) de una capa que habilita decodificación especulativa nativa. El modelo es multimodal image-text-to-text, por lo que acepta imágenes y texto como entrada.

La cuantización se realizó con Intel AutoRound (SignRoundConfig) sobre una NVIDIA H200, con 1200 iteraciones por bloque, batch_size=2, acumulación de gradiente de 4 pasos (batch global efectivo de 8), seqlen de 4096 y 512 muestras de calibración. El conjunto de calibración se compone de OpenThoughts3-1.2M (35,16 %), OpenCodeReasoning split_0 (21,48 %), UltraData-SFT-Agent-2609 (19,92 %), OpenCodeInstruct (13,67 %) y ultrachat_200k (9,77 %), todas con trazas de razonamiento `<think>` intactas y longitudes entre 4.103 y 51.063 tokens. Se preservaron en BF16 los 231 módulos sensibles: proyecciones de atención lineal (`in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z`, `out_proj`), codificador visual completo, cabezal MTP y `lm_head`. No se dispone de información sobre el número total de tokens de entrenamiento del modelo base ni sobre si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (`<think>`) activable o desactivable mediante `enable_thinking`.
- Razonamiento eficiente: reduce el uso de tokens de pensamiento en aproximadamente un 33,1 % respecto al modelo base, según la model card.
- Generación y razonamiento sobre código, incluyendo problemas de programación competitiva y ejecución de instrucciones.
- Matemáticas y STEM, con trazas de razonamiento entrenadas sobre OpenThoughts3.
- Comprensión de imágenes y texto (pipeline image-text-to-text) mediante el codificador visual preservado en BF16.
- Tool calling y function calling, con parser `qwen3_xml` y soporte de elección automática de herramientas en vLLM.
- Capacidades agénticas multi-turno, entrenadas con trayectorias agénticas y definiciones de herramientas XML.
- Decodificación especulativa nativa gracias al cabezal MTP preservado.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático y STEM en producción: el modelo puede resolver problemas con trazas de pensamiento explícitas y desactivar el modo thinking para consultas simples, reduciendo coste por token en un tercio respecto al base.
- Generación de código en pipelines de CI/CD: con tool calling y parser XML, puede integrarse en flujos que invocan linters, ejecutores de tests o APIs de repositorio para revisar y corregir código automáticamente.
- Agentes autónomos multi-paso: las trayectorias de entrenamiento con definiciones XML de herramientas permiten construir agentes que encadenan llamadas a funciones y razonan sobre los resultados intermedios.
- Análisis de documentos con imagen y texto: el codificador visual en BF16 permite procesar capturas, diagramas o formularios junto con instrucciones textuales en una sola llamada.
- Asistencia técnica con contexto largo: la ventana de 200K tokens y la atención lineal GatedDeltaNet permiten mantener conversaciones multi-turno sobre manuales extensos o bases de conocimiento completas.
- Servicio de razonamiento de alto rendimiento con vLLM: la cuantización W4A16 con kernels Marlin y la caché KV en FP8 permiten servir el modelo con menor huella de VRAM y mayor throughput que el checkpoint BF16.
- Evaluación comparativa de variantes de cuantización: al existir tres serializaciones (AutoRound, GPTQ, LLM-Compressor) con los mismos pesos, sirve para medir el impacto del formato de serialización en latencia y precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una mejora de +1,52 puntos porcentuales en GPQA-Diamond y una reducción del 33,1 % en tokens de pensamiento del modelo base `ukisai/Swift-1.5-Ornith-9B` respecto a `ornith-ai/Ornith-1.5-9B`, pero no se aportan cifras absolutas ni resultados de la versión cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 11,8 GB, por lo que el checkpoint W4A16 requiere aproximadamente 12 GB solo para pesos; con caché KV en FP8 y contexto de 200K la huella crece notablemente, y el ejemplo de vLLM reserva 8 GB adicionales para offloading de KV en CPU.
- GPU recomendadas: NVIDIA H200 (usada para la calibración), H100, A100 80 GB para contexto largo completo; RTX 4090 (24 GB) puede alojar los pesos pero limita la longitud de contexto efectiva.
- Cabe en GPU de consumidor: sí, en RTX 4090, RTX 3090 (24 GB) o GPUs con 16 GB o más si se reduce la longitud de contexto y se usa offloading de KV.
- Opciones de despliegue: vLLM ≥ 0.19.1 (recomendado, con kernels GPTQ/Marlin o compressed-tensors), Transformers ≥ 5.8.1 con backend `auto-round`, TGI y motores compatibles con AutoGPTQ para la variante GPTQ.
- Latencia y throughput: no disponibles. El uso de decodificación especulativa mediante el cabezal MTP y la caché KV en FP8 debería mejorar el throughput frente al modelo BF16, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Ornith-9B-W4A16-AutoRound | 4,1B reales (9B nominales) | 200K | Apache 2.0 | safetensors W4A16 | Multimodal, MTP, atención lineal híbrida |
| ukisai/Swift-1.5-Ornith-9B | No disponible | No disponible | Apache 2.0 | safetensors BF16 | Modelo base sin cuantizar; +1,52 pp en GPQA-Diamond sobre Ornith-1.5-9B |
| ornith-ai/Ornith-1.5-9B | No disponible | No disponible | No disponible | No disponible | Modelo original de razonamiento; consume un 33,1 % más de tokens de pensamiento |
| Variantes GPTQ y LLM-Compressor de Vishva007 | Idénticos | 200K | Apache 2.0 | GPTQ / compressed-tensors | Mismos pesos SignRound, distinta serialización |

## Limitaciones y advertencias

- La cuantización W4A16 puede degradar la precisión respecto al modelo BF16, especialmente en tareas de razonamiento profundo; no se han publicado evaluaciones de la versión cuantizada que lo cuantifiquen.
- El modo thinking activado por defecto incrementa el consumo de tokens y la latencia; debe desactivarse explícitamente para cargas sensibles al coste.
- Riesgo de alucinación inherente a los modelos de razonamiento, agravado en dominios STEM y código donde las trazas `<think>` pueden contener pasos plausibles pero incorrectos.
- Idiomas soportados no documentados; el rendimiento fuera del inglés no está garantizado.
- El contexto de 200K requiere configuración específica de vLLM y offloading de KV; sin ella, la longitud efectiva es mucho menor.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de calibración pueden tener sus propias condiciones que conviene revisar.
- El autor del checkpoint cuantizado es un usuario individual, no el desarrollador original; no hay garantías de soporte ni mantenimiento.
- La discrepancia entre el nombre comercial (9B) y los parámetros reales en safetensors (4,1B) debe verificarse antes de dimensionar infraestructura.

## Enlaces

- Hugging Face del modelo cuantizado: https://huggingface.co/Vishva007/Swift-1.5-Ornith-9B-W4A16-AutoRound
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Variante GPTQ: https://huggingface.co/Vishva007/Swift-1.5-Ornith-9B-W4A16-GPTQ
- Variante LLM-Compressor: https://huggingface.co/Vishva007/Swift-1.5-Ornith-9B-W4A16-LLM-Compressor
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B/blob/main/LICENSE
