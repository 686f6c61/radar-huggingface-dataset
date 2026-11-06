# zealod/BgGPT-Gemma-2-2.6B-IT-v1.0-int8-onnx-directml

## Resumen

BgGPT-Gemma-2-2.6B-IT-v1.0-int8-onnx-directml es una conversion a formato ONNX INT8 del modelo búlgaro BgGPT-Gemma-2-2.6B-IT-v1.0 desarrollado por INSAIT (Sofia, Bulgaria) sobre la base de Google Gemma 2 2.6B. El autor de la conversion es el usuario de Hugging Face `zealod`, que ha utilizado `onnxruntime-genai` Model Builder con el backend INT8 DirectML para producir un artefacto listo para ejecutarse en GPUs de Windows mediante DirectX 12.

El modelo original resuelve el problema de la escasez de LLMs de calidad para búlgaro: INSAIT adaptó Gemma 2 2.6B con instrucciones en ese idioma para obtener un asistente conversacional compacto. Esta version ONNX preserva esa capacidad pero elimina la dependencia de PyTorch y CUDA, permitiendo inferencia acelerada por GPU en hardware Intel Iris Xe/Arc, AMD Radeon y NVIDIA GeForce bajo Windows.

Con 2.6B parametros y cuantizacion de bloque INT8 (`MatMulNBits`), el artefacto ocupa unos 4 GB en el repositorio y esta pensado para despliegues de escritorio, integracion en aplicaciones .NET/C++/Python y escenarios donde no se dispone de una GPU NVIDIA con CUDA. Es relevante para desarrolladores que necesitan un LLM búlgaro-ingles local y de baja latencia en entornos Windows heterogeneos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-2 (transformer decoder-only), convertida a ONNX |
| Parametros totales | 2.6B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8 (block-quantized `MatMulNBits` para DirectML) |
| Idiomas soportados | búlgaro (bg), ingles (en) |
| Licencia | gemma (terminos de Gemma) |
| Formato de pesos | ONNX (INT8, ejecutable con `onnxruntime-genai-directml`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 2 2.6B, un transformer decoder-only con atencion por ventanas alternas y atencion global en capas alternas (caracteristica de la familia Gemma 2), aunque la model card de esta conversion no detalla la configuracion exacta de capas ni el tamano del vocabulario. El modelo base fue adaptado por INSAIT para búlgaro mediante ajuste por instrucciones (instruction tuning, sufijo IT) sobre Gemma 2 2.6B; la model card de esta version no especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de esta ficha concreta no esta en el entrenamiento sino en el empaquetado: la conversion a ONNX con cuantizacion INT8 de bloque (`MatMulNBits`) permite ejecutar el modelo con el execution provider DirectML de `onnxruntime-genai`, lo que habilita aceleracion por GPU en cualquier tarjeta compatible con DirectX 12 sin necesidad de CUDA ni de PyTorch. El prompt template conserva los tokens especiales de Gemma 2 (`<bos>`, `<start_of_turn>`, `<end_of_turn>`).

## Capacidades

- Generacion de texto conversacional en búlgaro e ingles con formato de chat por turnos.
- Correccion ortografica y de puntuacion en búlgaro (ejemplo incluido en la model card).
- Generacion de texto general y respuesta a instrucciones (modelo instruction-tuned).
- Inferencia acelerada por GPU en Windows mediante DirectML, sin CUDA.
- Integracion en Python, C# (.NET) y C++ a traves de `onnxruntime-genai`.
- Soporte de decodificacion con parametros de busqueda (`max_length`, `do_sample`, `repetition_penalty`).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Correccion y edicion de textos en búlgaro: el modelo puede recibir un parrafo con faltas y devolver la version corregida, tal como muestra el ejemplo oficial de la model card; es adecuado por su ajuste especifico al búlgaro y su bajo coste de inferencia.
- Asistente conversacional de escritorio en Windows: al ejecutarse sobre DirectML, puede integrarse en una aplicacion nativa (.NET o C++) que corra en equipos con GPU integrada Intel Iris Xe o AMD Radeon, sin requerir hardware NVIDIA.
- Procesamiento por lotes de textos búlgaros en estaciones de trabajo: la cuantizacion INT8 reduce el uso de VRAM y permite ejecutar el modelo en GPUs de gama media para tareas de resumen, reescritura o clasificacion ligera.
- Traduccion asistida búlgaro-ingles: el modelo cubre ambos idiomas y puede emplearse en pipelines de pre-traduccion o post-edicion dentro de herramientas CAT.
- Generacion de contenido local para webs y aplicaciones búlgaras: util para redactar descripciones, respuestas FAQ o borradores donde enviar datos a la nube no es viable por privacidad.
- Prototipado rapido de aplicaciones de IA en Windows sin stack CUDA: permite validar un producto basado en LLM en equipos de desarrollo estandar antes de migrar a un modelo mayor o a un servidor con GPU dedicada.
- Educacion y demos de IA en búlgaro: su tamano compacto (2.6B, ~4 GB en INT8) facilita desplegarlo en aulas o portatiles con GPU integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 3-4 GB para los pesos INT8, mas overhead de activaciones y KV cache; el repositorio ocupa 4.0 GB.
- GPU compatibles: cualquier GPU con soporte DirectX 12, incluyendo Intel Iris Xe, Intel Arc, AMD Radeon y NVIDIA GeForce.
- Cabe en GPUs de consumo: si, en practicamente cualquier GPU integrada o dedicada moderna de Windows con DirectX 12; no requiere CUDA.
- Opciones de despliegue: `onnxruntime-genai-directml` (Python, C#, C++); no se documentan en la informacion disponible despliegues con vLLM, llama.cpp, Ollama o TGI para este artefacto ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato / runtime | Licencia |
|---|---|---|---|---|---|
| BgGPT-Gemma-2-2.6B-IT-v1.0-int8-onnx-directml (esta ficha) | 2.6B | no disponible | bg, en | ONNX INT8 / onnxruntime-genai-directml | gemma |
| INSAIT-Institute/BgGPT-Gemma-2-2.6B-IT-v1.0 (modelo base) | 2.6B | no disponible | bg, en | safetensors / PyTorch, Transformers | gemma |
| Google Gemma 2 2.6B IT (modelo origen de la familia) | 2.6B | no disponible en la informacion proporcionada | multilingue (no detallado) | safetensors / PyTorch, Transformers | gemma |

La diferencia principal frente al modelo base es el formato y el runtime: esta version sacrifica flexibilidad de entrenamiento a cambio de portabilidad y aceleracion en Windows via DirectML, sin CUDA.

## Limitaciones y advertencias

- Licencia `gemma`: el uso comercial esta sujeto a los terminos de uso de Gemma de Google, que imponen restricciones y obligaciones de atribucion; es necesario revisarlos antes de un despliegue en produccion.
- Modelo especializado en búlgaro e ingles: el rendimiento en otros idiomas, incluido el castellano, no esta documentado y previsiblemente sera deficiente.
- Riesgo de alucinacion inherente a un modelo de 2.6B, especialmente en tareas de conocimiento factual o razonamiento complejo.
- No se documentan mitigaciones de sesgo ni evaluaciones de seguridad en la informacion disponible.
- La cuantizacion INT8 puede introducir degradacion adicional de calidad frente al modelo base en FP16/BF16, aunque la model card afirma buena preservacion gramatical.
- Dependencia de Windows y DirectX 12: el artefacto esta optimizado para DirectML y no es portable directamente a Linux o macOS sin reconversion.
- Longitud de contexto no documentada en esta ficha; conviene consultar la model card del modelo base antes de disenar prompts largos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso en produccion.

## Enlaces

- Hugging Face (esta version ONNX): https://huggingface.co/zealod/BgGPT-Gemma-2-2.6B-IT-v1.0-int8-onnx-directml
- Modelo base en Hugging Face: https://huggingface.co/INSAIT-Institute/BgGPT-Gemma-2-2.6B-IT-v1.0
- INSAIT Institute: https://insait.ai/
