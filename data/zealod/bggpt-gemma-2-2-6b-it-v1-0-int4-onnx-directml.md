# zealod/BgGPT-Gemma-2-2.6B-IT-v1.0-int4-onnx-directml

## Resumen

BgGPT-Gemma-2-2.6B-IT-v1.0-int4-onnx-directml es una conversión a formato ONNX con cuantización INT4 del modelo búlgaro INSAIT-Institute/BgGPT-Gemma-2-2.6B-IT-v1.0, publicado por el usuario zealod. El modelo base lo desarrolla INSAIT (Instituto de Informática, Inteligencia Artificial y Tecnología de Sofía, Bulgaria) y parte de Google Gemma 2 2.6B, afinado para instrucciones en búlgaro. Esta versión concreta no altera los pesos semánticamente: los reempaqueta para ejecutarse con `onnxruntime-genai` sobre el proveedor de ejecución Microsoft DirectML.

El interés de esta ficha no está en la calidad del modelo lingüístico (heredada del original), sino en el formato de despliegue: al usar DirectML, el modelo corre en cualquier GPU compatible con DirectX 12 bajo Windows, incluyendo gráficas integradas Intel Iris Xe, tarjetas Intel Arc, AMD Radeon y NVIDIA GeForce, sin necesidad de CUDA ni de PyTorch. La cuantización INT4 reduce el tamaño del repositorio a 2,7 GB, aproximadamente un 75 % menos que los pesos en precisión original según la model card.

Se trata de un artefacto de nicho, orientado a aplicaciones de escritorio y prototipos locales en Windows que necesiten generación de texto en búlgaro (y en menor medida en inglés) con requisitos de memoria bajos. La licencia es la de Gemma, heredada del modelo base, con las restricciones que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 2,6 mil millones (2.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 (block-quantized, generada con `onnxruntime-genai` Model Builder, `-p int4 -e dml`) |
| Idiomas soportados | búlgaro (bg), inglés (en) |
| Licencia | gemma |
| Formato de pesos | ONNX (INT4, optimizado para DirectML); tamano del repo 2,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 2.6B de Google: un transformer decoder-only con atención por ventanas alternas y atención global en capas intercaladas, normalización RMSNorm y activación GeGLU, según la especificación pública de la familia Gemma 2. Sobre esa base, INSAIT realizó un ajuste fino supervisado para instrucciones en búlgaro que da lugar al modelo BgGPT-Gemma-2-2.6B-IT-v1.0. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La contribución de esta versión concreta es puramente de ingeniería de despliegue: la conversión mediante el Model Builder oficial de `onnxruntime-genai` con cuantización INT4 y execution provider DirectML. Esto implica grafo ONNX optimizado, operadores fusionados para DML y pesos cuantizados por bloques. No se documentan innovaciones algorítmicas adicionales (decodificación especulativa, atención lineal ni similares) en la información disponible.

## Capacidades

- Generación de texto conversacional en búlgaro e inglés, con formato de chat basado en los turnos de Gemma 2 (`<start_of_turn>user` / `<start_of_turn>model`).
- Seguimiento de instrucciones: corrección ortográfica y de puntuación, reescritura, resumen y respuesta a preguntas, según el ejemplo de la model card.
- Generación de texto libre con control de parámetros de muestreo (`do_sample`, `max_length`, `repetition_penalty`).
- Ejecución nativa en Python, C# (.NET) y C++ mediante `onnxruntime-genai`, sin dependencia de PyTorch.
- Aceleración por GPU vía DirectML en Windows sobre DirectX 12 (Intel, AMD, NVIDIA).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información proporcionada.

## Casos de uso

- Corrección ortográfica y de puntuación en búlgaro: el modelo está afinado para instrucciones y el ejemplo oficial de la model card demuestra exactamente este flujo, adecuado para integrarse en procesadores de textos o correctores de escritorio.
- Asistentes de escritorio en Windows: al ejecutarse sobre DirectML sin CUDA, puede embeberse en aplicaciones .NET o C++ que necesiten un LLM local en equipos con GPU integrada Intel Iris Xe.
- Prototipado rápido en portátiles sin GPU dedicada: la cuantización INT4 y el tamaño de 2,7 GB permiten cargar el modelo en memoria de gráficas integradas, algo inviable con pesos en FP16.
- Generación de contenido en búlgaro para webs y blogs: redacción y reescritura de textos con un modelo entrenado específicamente para ese idioma, superando a modelos multilingües genéricos de tamaño similar en fluidez búlgara.
- Traducción asistida búlgaro-inglés en herramientas ofimáticas: el modelo cubre ambos idiomas y puede integrarse en complementos de edición sin conexión a la nube.
- Atención al cliente en búlgaro con despliegue on-premise: útil en entornos con requisitos de soberanía de datos donde no se permite enviar texto a APIs externas, aprovechando la ejecución local sobre hardware Windows convencional.
- Filtrado y clasificación de texto en pipelines .NET: la API de `onnxruntime-genai` permite invocar el modelo desde servicios backend C# para tareas de normalización o etiquetado lingüístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2,7 GB en INT4; se recomienda al menos 4 GB de memoria de GPU disponible para margen de contexto y caché KV.
- GPU compatibles: cualquier GPU con soporte DirectX 12, incluyendo Intel Iris Xe (integrada), Intel Arc, AMD Radeon y NVIDIA GeForce. No requiere CUDA.
- Cabe en GPU de consumo: sí, incluidas gráficas integradas de portátiles modernos, gracias a la cuantización INT4.
- Opciones de despliegue: `onnxruntime-genai-directml` (Python), `Microsoft.ML.OnnxRuntimeGenAI` (C#/.NET) y C++. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BgGPT-Gemma-2-2.6B-IT-v1.0-int4-onnx-directml (este) | 2,6B | no disponible | gemma | ONNX INT4 DirectML | Ejecución en Windows sin CUDA |
| INSAIT-Institute/BgGPT-Gemma-2-2.6B-IT-v1.0 | 2,6B | no disponible | gemma | safetensors | Modelo base original, requiere PyTorch/CUDA |
| Google Gemma 2 2B IT | 2B | 8K (según especificación pública de Gemma 2) | gemma | safetensors, GGUF | Multilingüe general, menos especializado en búlgaro |
| BgGPT-Gemma-3-4B-IT (INSAIT) | 4B | no disponible | gemma | safetensors | Generación posterior de la familia BgGPT, mayor tamaño |

## Limitaciones y advertencias

- La licencia `gemma` impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos de Google Gemma antes de desplegar en producción.
- El modelo está especializado en búlgaro; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación inherente a un modelo de 2,6B parámetros; no debe usarse como fuente de verdad sin verificación.
- La cuantización INT4 puede degradar ligeramente la calidad respecto al modelo original en FP16/BF16; no se documentan evaluaciones comparativas.
- El formato ONNX DirectML limita el despliegue a Windows con DirectX 12; no es portable a Linux ni a servidores sin GPU compatible.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para flujos de razonamiento multi-paso complejos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Posibles sesgos del corpus de entrenamiento original de INSAIT y de Gemma 2, no evaluados en esta conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zealod/BgGPT-Gemma-2-2.6B-IT-v1.0-int4-onnx-directml
- Modelo base: https://huggingface.co/INSAIT-Institute/BgGPT-Gemma-2-2.6B-IT-v1.0
- INSAIT Institute: https://insait.ai/
- Repositorio de onnxruntime-genai: https://github.com/microsoft/onnxruntime-genai
