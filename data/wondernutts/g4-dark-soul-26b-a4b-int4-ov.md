# Wondernutts/G4-Dark-Soul-26B-A4B-int4-ov

## Resumen

G4-Dark-Soul-26B-A4B-int4-ov es una conversión OpenVINO INT4 AWQ del modelo base Vortex5/G4-Dark-Soul-26B-A4B, un modelo de lenguaje multimodal de tipo mixture-of-experts (MoE) basado en Gemma 4 26B-A4B. El modelo original es un merge de tres componentes: G4-MeroMero-26B-A4B, Gemma-4-26B-A4B-Animus-V14.1-FFT y Pantheon-Reasoning-26B-A4B-1.1, orientado a roleplay, escritura creativa, storytelling y brainstorming. La conversión OpenVINO ha sido realizada por Wondernutts, que no reclama autoría del trabajo original, y está optimizada para inferencia local en GPUs Intel Arc y dispositivos compatibles con OpenVINO.

El modelo tiene 26 mil millones de parámetros totales con 4 mil millones activos (según la nomenclatura A4B), una ventana de contexto de 131.072 tokens (optimizada mediante parche RoPE LUT) y admite entrada de imágenes además de texto, gracias a su pipeline multimodal. La cuantización INT4 asimétrica con AWQ (group size 64) reduce el tamaño del repositorio a 16,1 GB, lo que lo hace viable para GPUs de consumo con suficiente VRAM. Su licencia Apache-2.0 permite uso comercial y redistribución, aunque se recomienda revisar las licencias de los modelos componentes.

Este artefacto es relevante porque ofrece una vía de despliegue eficiente en hardware Intel, con un formato OpenVINO IR que no requiere el stack de Transformers, y porque el modelo base ha sido diseñado específicamente para tareas creativas y conversacionales de alta calidad. La conversión incluye exclusión de los routers MoE de la compresión de pesos, preservando la integridad del enrutamiento, y ha pasado una prueba de generación local con formato de chat.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 26B-A4B (mixture-of-experts, multimodal) |
| Parametros totales | 26 mil millones |
| Parametros activos | 4 mil millones (según nomenclatura A4B) |
| Longitud de contexto | 131.072 tokens (optimización RoPE LUT) |
| Tipos de cuantizacion | INT4 asimétrica AWQ, group size 64, ratio 1.0 (OpenVINO) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (no es checkpoint de Transformers) |

## Arquitectura y entrenamiento

El modelo base G4-Dark-Soul-26B-A4B es un MoE con 26B parámetros totales y 4B activos, basado en la arquitectura Gemma 4. Se construyó mediante un merge personalizado de tres modelos: G4-MeroMero-26B-A4B (orientado a roleplay), Gemma-4-26B-A4B-Animus-V14.1-FFT (fine-tune conversacional) y Pantheon-Reasoning-26B-A4B-1.1 (razonamiento). El merge fue realizado por Vortex5, y los detalles completos de la configuración y el historial de fusión están disponibles en la model card del modelo base.

La conversión OpenVINO aplica compresión de pesos INT4 asimétrica con AWQ (group size 64, ratio 1.0), excluyendo los routers MoE de la compresión para no degradar el enrutamiento. Se incluyen artefactos de tokenizador y detokenizador en formato OpenVINO, así como un grafo multimodal (VLMPipeline) que soporta entrada de imágenes. Se aplicó una optimización de tabla de búsqueda RoPE con 131.072 posiciones (parche LUT131K), que permite manejar contextos largos de forma eficiente. No se dispone de información sobre el dataset de entrenamiento original ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto creativo: roleplay, narrativa, diálogos, storytelling y brainstorming.
- Conversación multimodal: acepta entrada de imágenes junto con texto, gracias al pipeline VLMPipeline de OpenVINO.
- Razonamiento multi-paso: heredado del componente Pantheon-Reasoning, aunque no se especifican benchmarks.
- Soporte de contexto largo: hasta 131.072 tokens, adecuado para historias extensas o conversaciones con mucho historial.
- Compatibilidad con OpenVINO GenAI: integrable en aplicaciones que usen la API VLMPipeline.
- No se documenta soporte explícito de tool calling ni de agentes autónomos.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener personajes consistentes y tramas complejas en conversaciones de múltiples turnos, aprovechando su contexto de 131K tokens para recordar detalles de la historia.
- Escritura creativa asistida: generación de borradores de novelas, cuentos o guiones, con capacidad de seguir instrucciones de estilo y tono.
- Brainstorming y lluvia de ideas: útil para generar conceptos, nombres, escenarios o soluciones creativas en entornos de trabajo colaborativo.
- Asistente conversacional con memoria larga: puede gestionar chats de atención al cliente o asistentes personales que requieran recordar interacciones previas durante largas sesiones.
- Análisis de imágenes con descripción narrativa: al ser multimodal, puede recibir una imagen y generar una descripción detallada o una historia basada en ella.
- Prototipado de aplicaciones de IA generativa en hardware Intel: sirve como base para demos y pruebas en GPUs Intel Arc, gracias a su formato OpenVINO optimizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) para este modelo en la información disponible. La model card incluye únicamente referencias de rendimiento del runtime stack de OpenVINO (no atribuibles al checkpoint específico), como 5.827,2 tok/s de procesamiento de prompt sostenido y 112,2 tok/s de decodificación en contexto corto, medidos en una Intel Arc Pro B70 con el stack de referencia. Estos valores no deben considerarse como rendimiento del modelo sin una ejecución específica.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 16,1 GB, pero la VRAM necesaria depende de la cuantización y del runtime.
- GPU recomendadas: GPUs Intel Arc (por ejemplo, Arc Pro B70) y cualquier dispositivo compatible con OpenVINO; también puede ejecutarse en CPU con OpenVINO, aunque con menor rendimiento.
- Compatibilidad con GPUs de consumo: probablemente quepa en GPUs con 16 GB o más de VRAM, pero no se confirma.
- Opciones de despliegue: OpenVINO GenAI (VLMPipeline) con backend GPU o CPU; no es compatible con vLLM, llama.cpp u Ollama en su formato nativo.
- Latencia y throughput: no hay mediciones específicas del modelo; las referencias del runtime stack indican ~112 tok/s de decodificación en contexto corto, pero requieren validación.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de comparación con otros modelos de la misma categoría (MoE 26B-A4B o similares) en la información consultada.

## Limitaciones y advertencias

- El modelo está orientado a roleplay y creatividad; puede generar contenido inapropiado o sesgado según el prompt, por lo que el despliegue debe incluir moderación.
- Riesgo de alucinación inherente a los modelos generativos; no verificado para este checkpoint.
- No es un checkpoint de Transformers; requiere OpenVINO GenAI y no puede usarse con bibliotecas estándar como `AutoModelForCausalLM`.
- La licencia Apache-2.0 permite uso comercial, pero se deben revisar las licencias de los modelos componentes (G4-MeroMero, Animus, Pantheon) antes de redistribuir o usar en producción.
- No se han publicado benchmarks de calidad del modelo; el rendimiento real en tareas específicas no está validado.
- El soporte de idiomas no está documentado; probablemente funcione mejor en inglés, pero no se confirma.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Wondernutts/G4-Dark-Soul-26B-A4B-int4-ov
- Modelo base (Vortex5): https://huggingface.co/Vortex5/G4-Dark-Soul-26B-A4B
- Componente G4-MeroMero: https://huggingface.co/zerofata/G4-MeroMero-26B-A4B
- Componente Animus: https://huggingface.co/Darkhn/Gemma-4-26B-A4B-Animus-V14.1-FFT
- Componente Pantheon-Reasoning: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1
- Fork OpenVINO de referencia: https://github.com/Wondernuttz/openvino/tree/arc-xe2-gemma4-pa-2026.4
