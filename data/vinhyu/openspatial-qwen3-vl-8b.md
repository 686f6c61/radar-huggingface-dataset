# VINHYU/OpenSpatial-Qwen3-VL-8B

## Resumen

OpenSpatial-Qwen3-VL-8B es un modelo de lenguaje y visión (vision-language) desarrollado por VINHYU, obtenido mediante fine-tuning del modelo base Qwen/Qwen3-VL-8B-Instruct para tareas de comprensión y razonamiento espacial. El modelo está diseñado para interpretar relaciones espaciales en imágenes, como posiciones relativas, distancias, orientaciones y disposiciones de objetos, un área crítica para aplicaciones de robótica, navegación autónoma, realidad aumentada y sistemas de asistencia visual.

El modelo se publica bajo licencia Apache-2.0, con pesos completos listos para inferencia en formato safetensors, y se integra con la librería transformers (versión >=4.57.0). Al estar basado en la arquitectura Qwen3-VL, hereda las capacidades multimodales de la familia Qwen3-VL, incluyendo comprensión de imágenes, texto y video, aunque el fine-tuning específico se centra en el razonamiento espacial. El repositorio incluye enlaces al proyecto OpenSpatial, al paper (arXiv:2604.07296) y al dataset de entrenamiento JoyAI-Image-OpenSpatial. Con 8.767 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo con cuantización adecuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal, basado en Qwen3-VL-8B-Instruct) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-VL-8B-Instruct, se recomienda consultar la ficha del modelo base) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; se pueden generar cuantizaciones GGUF/AWQ con herramientas externas) |
| Idiomas soportados | no disponible (el modelo base Qwen3-VL soporta múltiples idiomas, pero la model card no especifica la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-VL, un transformer multimodal de la familia Qwen que integra un codificador de visión con un modelo de lenguaje. El fine-tuning se realizó sobre el checkpoint instruct de 8B parámetros, utilizando el dataset JoyAI-Image-OpenSpatial, orientado a tareas de razonamiento espacial. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas como RLHF o DPO. El proyecto OpenSpatial (repositorio GitHub y paper arXiv) describe la metodología, pero la información disponible en la model card no incluye esos detalles técnicos. Se recomienda consultar el paper para conocer las innovaciones específicas del fine-tuning.

## Capacidades

- Comprensión y razonamiento espacial en imágenes: identificación de posiciones relativas, distancias, orientaciones y relaciones geométricas entre objetos.
- Generación de texto descriptivo basado en imágenes, con foco en descripciones espaciales precisas.
- Capacidades multimodales heredadas de Qwen3-VL: entrada de imagen y texto, salida de texto.
- Soporte de conversación multi-turno (chat) gracias a la base instruct.
- No se especifica soporte explícito de tool calling, function calling o modo agente en la model card, aunque el modelo base Qwen3-VL-8B-Instruct puede tener estas capacidades; no se confirma en este checkpoint.
- No se indica soporte de video, audio u otras modalidades más allá de imagen y texto.

## Casos de uso

- Navegación autónoma de robots: el modelo puede interpretar la disposición espacial de obstáculos y objetos en una escena capturada por una cámara, ayudando a planificar rutas seguras.
- Asistencia visual para personas con discapacidad: describir la posición de objetos cotidianos (por ejemplo, "la taza está a la izquierda del plato") para facilitar la interacción con el entorno.
- Realidad aumentada: anotar objetos en una imagen con sus relaciones espaciales, útil para guías de montaje, mantenimiento industrial o turismo.
- Sistemas de vigilancia y seguridad: analizar la posición relativa de personas o vehículos en una escena para detectar comportamientos anómalos.
- Automatización de almacenes: verificar la ubicación correcta de productos en estanterías mediante visión por computador.
- Generación de descripciones para imágenes médicas: localizar estructuras anatómicas y describir su disposición espacial en radiografías o tomografías (requiere validación clínica adicional).
- Entrenamiento de modelos de robótica: generar datos sintéticos de razonamiento espacial para otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval, GSM8K ni pruebas específicas de razonamiento espacial. Se recomienda consultar el paper arXiv:2604.07296 para posibles evaluaciones comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.767 millones de parámetros en precisión FP16, se necesitan aproximadamente 17,5 GB de VRAM (el tamaño del repositorio coincide con el peso en FP16). Con cuantización a 8 bits, se reduce a unos 9-10 GB; con 4 bits, a unos 5-6 GB.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090, RTX 4090, A5000) o superior. Para cuantización 8 bits, una RTX 4080 o RTX 3090 (16-24 GB). Para 4 bits, una RTX 3060 de 12 GB o similar.
- Sí cabe en GPUs de consumo con cuantización (por ejemplo, RTX 4090 con 24 GB para FP16, o RTX 3060 con 12 GB para 4 bits).
- Opciones de despliegue: transformers (carga directa con `from_pretrained`), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), TGI (Text Generation Inference).
- Latencia y throughput: no disponibles en la información proporcionada. Dependerá del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OpenSpatial-Qwen3-VL-8B | 8,77 B | no disponible | Apache-2.0 | Razonamiento espacial sobre Qwen3-VL-8B |
| Qwen3-VL-8B-Instruct | 8,77 B | no disponible (base) | Apache-2.0 | Modelo multimodal general (imagen, texto, video) |
| Qwen2.5-VL-7B-Instruct | 7,6 B | 128K (según documentación de Qwen2.5-VL) | Apache-2.0 | Modelo multimodal general de generación anterior |

La comparativa se limita a modelos de la misma familia por falta de información sobre alternativas específicas de razonamiento espacial. OpenSpatial-Qwen3-VL-8B se diferencia por su fine-tuning especializado, mientras que los otros son modelos generales. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la model card, pero al ser un fine-tuning de Qwen3-VL, puede heredar sesgos del modelo base y del dataset de entrenamiento.
- Riesgo de alucinación: como todo modelo generativo, puede producir descripciones espaciales incorrectas o inventadas, especialmente en escenas complejas o ambiguas.
- Limitaciones de contexto: la longitud de contexto no se especifica; se recomienda verificar la del modelo base Qwen3-VL-8B-Instruct.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base soporta múltiples idiomas, pero el fine-tuning puede afectar al rendimiento en idiomas no representados en el dataset de entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se indiquen los cambios.
- Caveat para producción: el modelo está pensado para investigación y desarrollo; no se han publicado evaluaciones de robustez ni seguridad. Se recomienda validar en el dominio de aplicación antes de desplegar en entornos críticos.

## Enlaces

- HuggingFace: https://huggingface.co/VINHYU/OpenSpatial-Qwen3-VL-8B
- Proyecto OpenSpatial (GitHub): https://github.com/VINHYU/OpenSpatial
- Paper: https://arxiv.org/abs/2604.07296
- Dataset de entrenamiento: https://huggingface.co/datasets/jdopensource/JoyAI-Image-OpenSpatial
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio Qwen3-VL (GitHub): https://github.com/QwenLM/Qwen3-VL
