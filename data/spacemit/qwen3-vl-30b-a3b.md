# SpacemiT/Qwen3-VL-30B-A3B

## Resumen

SpacemiT/Qwen3-VL-30B-A3B es un paquete de despliegue específico para las placas de desarrollo RISC-V SpacemiT K1 y K3, que empaqueta el modelo vision-language Qwen3-VL-30B-A3B desarrollado por el equipo Qwen. El modelo original es un mixture-of-experts (MoE) multimodal con 30 mil millones de parámetros totales y 3 mil millones activos, diseñado para comprensión de texto, imágenes y vídeo, incluyendo respuesta visual a preguntas, comprensión de documentos, lectura tipo OCR, generación de código y flujos de trabajo de agentes.

Este repositorio no contiene los pesos completos del modelo, sino una versión optimizada para inferencia en hardware embebido: un decoder de texto en formato GGUF cuantizado a Q4_1 y un encoder de visión en ONNX. La relevancia de este paquete radica en que permite ejecutar un modelo multimodal de 30B en placas de bajo consumo con aceleradores de IA, algo poco habitual en el ecosistema RISC-V. La licencia es Apache-2.0, lo que facilita su uso comercial y su integración en productos.

El paquete incluye ficheros de configuración específicos para K1 y K3 que fijan la afinidad de los núcleos de IA, y requiere un runtime ONNX de SpacemiT y una versión modificada de llama.cpp con soporte para el Execution Provider de SpaceMIT. No se proporcionan métricas de precisión ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-language (basada en Qwen3-VL) |
| Parametros totales | 30 mil millones (30B) |
| Parametros activos | 3 mil millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_1 (GGUF para el decoder de texto) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (decoder) y ONNX (encoder de vision) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-30B-A3B, un transformer MoE multimodal desarrollado por el equipo Qwen. La arquitectura combina un encoder de visión con un decoder de lenguaje que utiliza mezcla de expertos, donde solo 3B de los 30B parámetros se activan por token, lo que reduce el coste computacional en inferencia. El modelo soporta entrada de imágenes, vídeo y texto, y está entrenado para tareas como respuesta visual a preguntas, comprensión de documentos, OCR, generación de código y razonamiento multi-paso.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El informe técnico del modelo original se referencia en el arXiv (2511.21631), pero no se incluyen datos concretos en este repositorio. El paquete de SpacemiT no modifica la arquitectura, solo la serializa en formatos optimizados para su hardware: el decoder se convierte a GGUF con cuantización Q4_1 y el encoder de visión a ONNX, ambos ejecutados mediante llama.cpp y ONNX Runtime con el Execution Provider de SpaceMIT.

## Capacidades

- Comprensión multimodal de texto, imágenes y vídeo, incluyendo respuesta visual a preguntas y descripción de contenido visual.
- Lectura y comprensión de documentos, con capacidad tipo OCR para extraer texto de imágenes.
- Generación de código a partir de instrucciones visuales o textuales.
- Soporte de flujos de trabajo de agentes, con razonamiento multi-paso y posible integración con herramientas externas.
- Modo de pensamiento (thinking) activable o desactivable mediante `chat_template_kwargs: {"enable_thinking": false}` en la API de inferencia.
- Compatibilidad con la API OpenAI (`/v1/chat/completions`) para integración sencilla en aplicaciones existentes.
- Capacidades multilingües no especificadas en la información disponible, aunque el modelo original de Qwen soporta múltiples idiomas.

## Casos de uso

- Asistente de descripción de imágenes en dispositivos embebidos: el modelo puede generar descripciones naturales de fotografías o capturas en tiempo real, útil para aplicaciones de accesibilidad o domótica, ejecutándose en placas K1/K3 con bajo consumo.
- OCR y digitalización de documentos en entornos industriales: gracias a su capacidad de lectura de texto en imágenes, puede extraer información de etiquetas, facturas o paneles, integrándose en pipelines de automatización sin necesidad de GPU dedicada.
- Generación de código asistida por capturas de pantalla: un desarrollador puede enviar una imagen de un error o un diagrama y recibir sugerencias de código, aprovechando el modo de razonamiento del modelo.
- Sistema de preguntas y respuestas sobre contenido visual en kioscos o puntos de información: el modelo responde a consultas sobre imágenes o vídeos mostrados, con la ventaja de funcionar en hardware de bajo coste.
- Prototipado de agentes multimodales en entornos RISC-V: investigadores pueden desplegar flujos de agente que combinan visión y lenguaje, usando la API OpenAI-compatible para iterar rápidamente.
- Evaluación de modelos en hardware alternativo: el paquete permite probar el rendimiento de un MoE de 30B en placas embebidas, comparando latencia y calidad frente a despliegues en GPU, útil para decidir arquitecturas de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de precisión (MMLU, HumanEval, GSM8K, etc.) ni comparativas con otros modelos. El README indica que la prueba incluida (`humanspeech.jpg`) es solo una comprobación funcional de extremo a extremo, no un benchmark de exactitud.

## Requisitos de hardware

- Placas soportadas: SpacemiT K1 y K3, ambas con arquitectura RISC-V y núcleos de IA dedicados.
- K1: utiliza los núcleos de IA 0;1;2;3 y 4 hilos de ejecución. Se debe usar `configs/K1/config.json` y el flag `-t 4`.
- K3: utiliza los núcleos de IA 8;9;10;11;12;13;14;15 y 8 hilos. Se debe usar `configs/K3/config.json` y el flag `-t 8`.
- Software necesario: runtime ONNX de SpacemiT (disponible en GitHub) y una versión de llama.cpp con soporte SMT (también en GitHub de SpacemiT). Se puede compilar desde fuente con `bash build_spacemit.sh` o usar paquetes RISC-V precompilados.
- Variables de entorno requeridas: `MODEL_DIR`, `LLAMA_DIR`, `ORT_DIR` y `LD_LIBRARY_PATH` deben configurarse antes de arrancar el servidor.
- No se especifican requisitos de VRAM ni GPU, ya que el despliegue está pensado para aceleradores de IA integrados en las placas, no para GPUs discretas.
- El servidor se lanza con `llama-server` y expone una API compatible con OpenAI en el puerto 8080.

## Comparativa con modelos similares

La comparativa se centra en el despliegue frente al modelo original, ya que no se dispone de datos de otros paquetes similares para hardware RISC-V.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpacemiT/Qwen3-VL-30B-A3B (este paquete) | 30B totales, 3B activos | no disponible | GGUF Q4_1 + ONNX | Apache-2.0 | Repositorio HuggingFace |
| Qwen/Qwen3-VL-30B-A3B-Instruct (original) | 30B totales, 3B activos | no disponible (el modelo original soporta contexto largo, pero no se confirma aquí) | safetensors (presumiblemente) | Apache-2.0 | HuggingFace oficial |

No se dispone de información sobre otros paquetes de despliegue para K1/K3 de modelos similares, por lo que la comparativa se limita a la diferencia entre el paquete optimizado y el modelo original. La principal diferencia es el formato de pesos y la integración con el hardware específico, no el rendimiento intrínseco del modelo.

## Limitaciones y advertencias

- La cuantización Q4_1 del decoder puede degradar la precisión del modelo en comparación con los pesos originales en precisión completa, especialmente en tareas de razonamiento complejo o generación de código.
- El paquete está diseñado exclusivamente para las placas SpacemiT K1 y K3; no es portable a otras arquitecturas sin modificaciones significativas.
- No se proporcionan benchmarks de rendimiento ni de calidad, por lo que no es posible evaluar objetivamente la degradación introducida por la cuantización o el backend.
- La configuración de afinidad de núcleos es específica de cada placa; intercambiar los ficheros `config.json` entre K1 y K3 provocará fallos de ejecución.
- El modelo original de Qwen3-VL puede tener sesgos en el contenido visual y alucinaciones en la descripción de imágenes, algo que no se mitiga en este paquete.
- La licencia Apache-2.0 permite uso comercial, pero las dependencias de runtime (ONNX Runtime de SpacemiT, llama.cpp) tienen sus propias licencias que deben revisarse.
- No se indica la longitud de contexto soportada en esta versión cuantizada; es posible que se reduzca respecto al modelo original por limitaciones de memoria en las placas embebidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SpacemiT/Qwen3-VL-30B-A3B
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Informe técnico de Qwen3-VL (arXiv): https://arxiv.org/abs/2511.21631
- Anuncio oficial de Qwen3-VL: https://qwen.ai/blog?id=qwen3-vl
- Runtime ONNX de SpacemiT: https://github.com/spacemit-com/onnxruntime/releases
- llama.cpp de SpacemiT: https://github.com/spacemit-com/llama.cpp
- Página del modelo en Ollama: https://ollama.com/library/qwen3-vl:30b-a3b
- Receta de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3-VL-30B-A3B-Instruct
