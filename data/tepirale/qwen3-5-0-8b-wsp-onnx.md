# tepirale/Qwen3.5-0.8B-wsp-ONNX

## Resumen

Qwen3.5-0.8B-wsp-ONNX es una exportación a formato ONNX del modelo RikiyaT/Qwen3.5-0.8B-weight-space-programming, un modelo de lenguaje de 0,8 mil millones de parámetros derivado de la familia Qwen3.5 y adaptado mediante técnicas de weight-space programming. La exportación la firma el usuario tepirale y está pensada para su uso con la librería onnxruntime-genai, no con Transformers.js.

El repositorio ofrece cuatro variantes de precisión (fp32, fp16, int4 con activaciones fp32 e int4 con activaciones fp16) y grafos que emplean operadores específicos de ONNX Runtime como `LinearAttention`, `CausalConvWithState` y `MatMulNBits`. Esto sugiere una arquitectura híbrida con atención lineal y convoluciones causales con estado, orientada a inferencia eficiente en CPU y GPU de gama baja.

El modelo es relevante para desarrolladores que necesitan desplegar un LLM pequeño en entornos con recursos limitados (edge, portátiles, servidores sin GPU dedicada) usando el stack de Microsoft para ONNX Runtime GenAI. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque la información publicada sobre entrenamiento, datos y benchmarks es muy escasa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (`LinearAttention`, `CausalConvWithState`) según los operadores ONNX empleados; detalles completos no disponibles |
| Parámetros totales | 0,8 mil millones (según el nombre del modelo) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp32, fp16, int4 con activaciones fp32 (q4), int4 con activaciones fp16 (q4f16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `model.onnx`, `model_fp16.onnx`, `model_q4.onnx`, `model_q4f16.onnx`) con configuraciones `genai_config*.json` |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es RikiyaT/Qwen3.5-0.8B-weight-space-programming, un derivado de Qwen3.5 de 0,8B parámetros sometido a weight-space programming, una técnica de adaptación que opera directamente sobre los pesos del modelo en lugar de mediante ajuste fino convencional. No se detallan en la información proporcionada los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

Los grafos ONNX exportados emplean operadores `LinearAttention` y `CausalConvWithState`, lo que apunta a una arquitectura que combina capas de atención lineal con convoluciones causales con estado, un patrón típico de modelos híbridos eficientes (similar a las propuestas de atención lineal con estado recurrente). La cuantización int4 se implementa mediante `MatMulNBits`, el operador de ONNX Runtime para multiplicaciones de matrices con pesos de 4 bits. No se han publicado detalles sobre innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la plantilla de chat ChatML (`<|im_start|>user ... <|im_end|>`).
- Razonamiento básico y matemáticas simples: el ejemplo de la model card consulta "What is 17*23?", lo que sugiere capacidad para operaciones aritméticas elementales.
- Inferencia en CPU y GPU mediante onnxruntime-genai, con variantes específicas para cada dispositivo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional embebido en aplicaciones de escritorio o móviles: la variante q4 (int4 con activaciones fp32) permite ejecutar el modelo en CPU sin GPU dedicada, integrándolo en apps locales que necesitan respuestas de chat sin conexión.
- Prototipado rápido de pipelines de generación de texto en Python: la API de onnxruntime-genai con `GeneratorParams` y streaming de tokens permite construir demos funcionales en pocas líneas, útil para validar ideas antes de escalar a modelos mayores.
- Clasificación y resumen de textos cortos en servidores de bajo coste: con 0,8B parámetros y cuantización int4, el modelo cabe en instancias CPU pequeñas y puede procesar lotes moderados de documentos.
- Enseñanza y experimentación con arquitecturas híbridas: los operadores `LinearAttention` y `CausalConvWithState` hacen de este repositorio un caso práctico para estudiar cómo se exportan y ejecutan mecanismos de atención lineal en ONNX Runtime.
- Generación de texto en dispositivos edge con GPU integrada: la variante q4f16 (int4 con activaciones fp16) está pensada para CUDA y puede aprovechar GPUs de portátiles con poca VRAM.
- Respuestas a preguntas aritméticas y de conocimiento general en asistentes de soporte de primer nivel: el modelo puede gestionar consultas simples donde no se requiere razonamiento profundo, reduciendo coste frente a modelos de mayor tamaño.
- Benchmarking de cuantización: comparar fp32, fp16, q4 y q4f16 sobre el mismo modelo permite medir el impacto de la precisión en calidad y latencia en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 0,8B parámetros, la variante fp16 ocuparía aproximadamente 1,6 GB de pesos y la int4 alrededor de 0,4-0,5 GB, más overhead de activaciones y KV cache (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: la model card menciona CUDA para las variantes fp16 y q4f16, sin especificar modelos concretos. Por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- CPU: las variantes fp32 y q4 están destinadas a CPU según la tabla de la model card.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM para las variantes cuantizadas, aunque el autor no lo confirma.
- Opciones de despliegue: onnxruntime-genai (CPU) y onnxruntime-genai-cuda (GPU). No es compatible con Transformers.js. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-wsp-ONNX (este) | 0,8B | No disponible | ONNX (onnxruntime-genai) | Apache 2.0 | Exportación ONNX con variantes fp32/fp16/int4 |
| RikiyaT/Qwen3.5-0.8B-weight-space-programming | 0,8B | No disponible | No disponible | No disponible | Modelo base del que deriva esta exportación |
| Qwen3.5-0.8B (modelo original de la familia) | 0,8B | No disponible | No disponible | No disponible | Referencia de la familia; sin datos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El tamaño de 0,8B parámetros limita la profundidad de razonamiento, la calidad en tareas complejas y la fidelidad factual; es esperable un riesgo elevado de alucinación en preguntas de conocimiento especializado.
- No se documentan sesgos conocidos, pero al no haber información sobre los datos de entrenamiento no es posible evaluar sesgos de género, raza, idioma o dominio.
- Los grafos usan operadores específicos de ONNX Runtime (`LinearAttention`, `CausalConvWithState`, `MatMulNBits`) y no son compatibles con Transformers.js; esto restringe las herramientas de despliegue disponibles.
- No se deben mezclar modelos de CPU y CUDA en el mismo proceso, según advierte la model card.
- La longitud de contexto no está documentada, lo que impide planificar casos de uso con ventanas largas.
- Los idiomas soportados no están documentados; no se puede asumir un rendimiento multilingüe equilibrado.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de información sobre el modelo base y sus datos de entrenamiento introduce incertidumbre sobre posibles restricciones heredadas.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tepirale/Qwen3.5-0.8B-wsp-ONNX
- Modelo base: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming
- Documentación de onnxruntime-genai: no disponible en la información proporcionada
- Paper o blog sobre weight-space programming: no disponible en la información proporcionada
- Repositorio de ONNX Runtime: no disponible en la información proporcionada
