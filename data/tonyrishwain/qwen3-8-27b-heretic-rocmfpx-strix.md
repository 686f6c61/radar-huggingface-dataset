# tonyrishwain/Qwen3.8-27B-Heretic-ROCmFPX-STRIX

## Resumen

El modelo `tonyrishwain/Qwen3.8-27B-Heretic-ROCmFPX-STRIX` es una adaptación del modelo denso Qwen3.8-27B, desarrollado por Alibaba, optimizada para inferencia en sistemas AMD Strix Halo (APU Ryzen AI Max con 128 GB de memoria unificada) mediante el uso de ROCm y FPX. El autor, tonyrishwain, parte de dos repositorios base: `jcbtc/Qwen3.8-27B-CIRU-ActiveFPX-PromptForge` (que ya incorpora ajustes para FPX) y `trohrbaugh/Qwen3.8-27B-heretic-ara` (un fine-tune denominado "heretic"). El resultado es un modelo en formato GGUF, con licencia Apache 2.0, pensado para ejecutarse localmente en hardware AMD de gama alta.

La relevancia de este modelo radica en que permite desplegar un LLM de 27 000 millones de parámetros en una APU con memoria unificada, sin necesidad de GPUs dedicadas de gran VRAM. El modelo base Qwen3.8-27B emplea una arquitectura híbrida de atención (16 capas con atención completa y 48 con atención lineal), lo que reduce el coste computacional y de memoria frente a un transformer denso convencional. Esta variante concreta no aporta cambios arquitectónicos, sino que está calibrada y empaquetada para funcionar de forma eficiente en el ecosistema ROCm/FPX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal) con 64 capas: 16 de atención completa y 48 de atención lineal con estado recurrente constante |
| Parametros totales | 27 320 697 856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio está etiquetado como GGUF, pero no se especifican los tipos de cuantización) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B es multilingüe, pero no se confirma para esta variante) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, sobre el que se construye esta variante, utiliza una arquitectura transformer híbrida: de sus 64 capas, solo 16 emplean atención completa (con un intervalo de atención completa de 4), mientras que las 48 restantes usan atención lineal con un estado recurrente constante. Este diseño reduce el coste de memoria y cómputo en secuencias largas, manteniendo la calidad en tareas de razonamiento. El modelo es denso, con 27 300 millones de parámetros, y fue entrenado por Alibaba con un volumen de datos no especificado en la información disponible.

La variante "Heretic" se basa en un fine-tune previo (`trohrbaugh/Qwen3.8-27B-heretic-ara`) y en una adaptación para FPX (`jcbtc/Qwen3.8-27B-CIRU-ActiveFPX-PromptForge`). No se han publicado detalles sobre el proceso de entrenamiento, el dataset utilizado ni si se aplicaron técnicas como RLHF o DPO. El autor solo indica que el modelo está preparado para inferencia en sistemas Strix Halo de 128 GB, lo que sugiere una calibración específica para aprovechar la memoria unificada y las instrucciones FPX de la APU.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.8-27B, que incluyen razonamiento lógico, matemáticas y comprensión lectora.
- Generación de código: el modelo base Qwen3.8-27B es competente en tareas de programación, aunque no se confirma explícitamente para esta variante.
- Conversación multi-turno: el tag `conversational` indica que está diseñado para mantener diálogos.
- Soporte de tool calling / function calling: no confirmado para esta variante, aunque el modelo base Qwen3.8-27B lo soporta según la documentación oficial de Qwen.
- Capacidades multilingües: no confirmadas para esta variante; el modelo base es multilingüe, pero no se especifica qué idiomas cubre.
- Optimización para hardware AMD: está específicamente adaptado para ejecutarse en APU Strix Halo con ROCm y FPX, lo que permite inferencia local eficiente en ese hardware.

## Casos de uso

- Asistente local en portátiles y mini-PCs con APU AMD Ryzen AI Max: el modelo puede ejecutarse en memoria unificada de 128 GB, ofreciendo un asistente conversacional sin conexión a internet.
- Desarrollo de aplicaciones de IA generativa en hardware AMD: gracias a su compatibilidad con LM Studio y Lemonade, los desarrolladores pueden integrarlo en aplicaciones de escritorio o prototipos rápidos.
- Generación de código en entornos sin GPU dedicada: un equipo con Strix Halo puede ejecutar el modelo para autocompletar código, generar documentación o explicar fragmentos, sin depender de servicios en la nube.
- Investigación y experimentación con modelos de 27B en memoria unificada: permite probar técnicas de prompting, fine-tuning o evaluación en un entorno local con hardware asequible.
- Chatbots de atención al cliente en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, lo que es adecuado para sectores con restricciones de confidencialidad.
- Prototipado de agentes con razonamiento multi-paso: si el modelo base soporta tool calling, esta variante podría usarse para construir agentes que ejecuten tareas complejas, aunque no está confirmado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Diseñado específicamente para sistemas AMD Strix Halo (APU Ryzen AI Max) con 128 GB de memoria unificada.
- También puede ejecutarse en GPUs AMD Radeon con soporte ROCm, aunque no se especifican requisitos mínimos de VRAM.
- El repositorio ocupa 38 GB, lo que sugiere que el modelo cuantizado cabe en la memoria unificada de 128 GB, pero no se indica la VRAM mínima para GPUs dedicadas.
- Opciones de despliegue: LM Studio, Lemonade, vLLM (según la receta de vLLM para el modelo base) y llama.cpp (por ser GGUF).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3 B | Denso, híbrido atención | No disponible | Apache 2.0 | HuggingFace |
| tonyrishwain/Qwen3.8-27B-Heretic-ROCmFPX-STRIX | 27,3 B | Denso, híbrido atención | No disponible | Apache 2.0 | HuggingFace (GGUF) |
| Gemma 2 27B | 27 B | Denso, transformer | 8K (ampliable) | Gemma License | HuggingFace |

No se dispone de datos de rendimiento comparativo. La principal diferencia de esta variante frente al modelo base es su optimización para ROCm/FPX y su formato GGUF, que facilita su uso en hardware AMD. Gemma 2 27B es una alternativa densa de tamaño similar, pero con licencia más restrictiva y sin adaptación específica para AMD.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de contexto específicas de esta variante.
- El modelo es una adaptación no oficial; puede presentar diferencias de comportamiento frente al Qwen3.8-27B original.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de los fine-tunes intermedios para asegurar el cumplimiento.
- Está optimizado para hardware AMD con ROCm/FPX; su rendimiento en otras plataformas (NVIDIA, Apple Silicon) puede ser subóptimo o requerir conversiones adicionales.
- No se especifican los tipos de cuantización disponibles, por lo que el usuario debe verificar la compatibilidad con su runtime.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente y sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tonyrishwain/Qwen3.8-27B-Heretic-ROCmFPX-STRIX
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio base jcbtc (CIRU-ActiveFPX-PromptForge): https://huggingface.co/jcbtc/Qwen3.8-27B-CIRU-ActiveFPX-PromptForge
- Repositorio base trohrbaugh (heretic-ara): https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía de ejecución local (lu-labs): https://lu-labs.ai/blog/how-to-run-qwen-3-8-27b-locally
- Receta vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
