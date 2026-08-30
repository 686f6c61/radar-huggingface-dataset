# zhouxzh/ascend310b-llm-om-zoo

## Resumen

Este repositorio, publicado por zhouxzh (Xianzhong Zhou), no contiene un modelo de lenguaje nuevo, sino un conjunto de artefactos de conversión y validación para ejecutar el modelo Qwen2.5-0.5B-Instruct en hardware de inferencia de borde Ascend 310B. Incluye un grafo ONNX con caché KV estática de 1024 tokens y dos artefactos OM (formato nativo de Ascend) compilados con CANN 8.0, uno para la variante B4 (8T) y otro para la B1 (20T). El objetivo es demostrar la viabilidad de desplegar un LLM instructivo en aceleradores de bajo consumo, un paso relevante para aplicaciones de IA en dispositivos embebidos y entornos con restricciones de energía.

El modelo base es Qwen2.5-0.5B-Instruct, un transformer decoder-only de aproximadamente 0.5 mil millones de parámetros, entrenado por Alibaba para generación de texto en chino e inglés. Este repositorio es experimental y no constituye un lanzamiento oficial de Huawei ni de Qwen. Su tamaño total es de 4.8 GB, e incluye manifiestos con hashes SHA-256 para verificar la integridad de los artefactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0.5B (aprox., segun modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (fijada por la conversion static-KV) |
| Tipos de cuantizacion | No disponible (no se especifica cuantizacion en los artefactos) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | per-artifact-upstream-licenses (Apache-2.0 para el modelo base; terminos CANN/ACL a revisar) |
| Formato de pesos | ONNX, OM (Ascend) y safetensors (etiquetado, aunque no se detalla el contenido) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-0.5B-Instruct, un transformer con atención causal y mecanismo de posicionamiento rotatorio (RoPE), entrenado por Alibaba con un enfoque de instrucción y ajuste fino supervisado. No se proporcionan detalles sobre el dataset de entrenamiento ni el número de tokens en la información disponible.

La innovación de este repositorio reside en el proceso de conversión: se genera un grafo ONNX con caché KV estática de 1024 tokens, optimizado para reducir el uso de memoria y mejorar la latencia en hardware Ascend 310B. A partir de ese grafo se compilan dos artefactos OM, uno para la variante B4 (8T de cómputo) y otro para la B1 (20T), ambos con CANN 8.0. La validación se realizó con la interfaz nativa ACL (Ascend Computing Language). No se emplean técnicas como RLHF o DPO en este repositorio; se trata únicamente de la conversión y validación de un modelo ya entrenado.

## Capacidades

- Generación de texto instructivo en chino e inglés, heredadas del modelo base Qwen2.5-0.5B-Instruct.
- Soporte de conversación multi-turno dentro de la ventana de contexto de 1024 tokens (limitada por la conversión estática).
- No se documenta soporte explícito de tool calling, function calling ni agentes en los artefactos; depende de las capacidades del modelo base, que no se detallan aquí.
- No incluye visión, audio ni otras modalidades.

## Casos de uso

- Inferencia de LLM en dispositivos de borde con hardware Ascend 310B: el repositorio proporciona artefactos listos para desplegar en placas basadas en este chip, ideal para aplicaciones de chatbot o asistentes virtuales en entornos sin conexión a la nube.
- Prototipado de aplicaciones de IA en tiempo real con baja latencia: la caché KV estática de 1024 tokens reduce la sobrecarga de memoria, permitiendo respuestas rápidas en sistemas embebidos.
- Evaluación de rendimiento de Qwen2.5-0.5B en hardware Ascend: los artefactos y manifiestos permiten reproducir pruebas de latencia y calidad en las variantes B4 y B1.
- Desarrollo de herramientas educativas para el aprendizaje de despliegue en Ascend: el repositorio sirve como ejemplo práctico para quienes estudian la conversión de modelos a formato OM.
- Integración en pipelines de inferencia en edge computing para procesamiento de lenguaje natural ligero, como clasificación de textos o generación de respuestas cortas.
- Validación de compatibilidad de CANN/ACL con modelos Qwen: útil para equipos que evalúan la viabilidad de migrar inferencia a hardware de Ascend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la latencia y la calidad en chino son específicas del hardware y de la revisión, pero no proporciona números concretos. Tampoco se incluyen comparaciones con otros modelos en este repositorio.

## Requisitos de hardware

- Hardware objetivo: Ascend 310B4 (8T de cómputo) y Ascend 310B1 (20T de cómputo), según la variante del artefacto OM.
- Runtime: CANN 8.0 y servicio nativo ACL; los artefactos no son intercambiables entre distintos SoCs de Ascend.
- Memoria: no se especifica VRAM, pero el tamaño del modelo base (0.5B) y la caché KV estática de 1024 tokens sugieren que cabe en la memoria integrada de la placa (típicamente 8-16 GB según la variante).
- Opciones de despliegue: exclusivamente mediante la API ACL nativa; no se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que este repositorio no es un modelo sino un conjunto de artefactos de conversión para un hardware específico. Como referencia, el modelo base Qwen2.5-0.5B-Instruct puede compararse con otros LLMs de tamaño similar (por ejemplo, TinyLlama-1.1B o Phi-2), pero no hay datos de rendimiento en este repositorio para establecer una comparación válida.

## Limitaciones y advertencias

- Artefactos experimentales: no son un lanzamiento oficial de Huawei ni de Qwen; su estabilidad en producción no está garantizada.
- Contexto limitado a 1024 tokens: la conversión static-KV fija la ventana, por lo que no se pueden procesar secuencias más largas.
- Dependencia de hardware específico: los archivos OM solo funcionan en las variantes Ascend 310B indicadas (B4 y B1) y requieren CANN 8.0; no son portables a otros dispositivos.
- Riesgo de alucinación y sesgos: inherentes al modelo base Qwen2.5-0.5B-Instruct; no se han mitigado en este repositorio.
- Restricciones de licencia: aunque el modelo base es Apache-2.0, la redistribución comercial de los artefactos OM puede estar sujeta a los términos de CANN/ACL de Huawei; se debe verificar antes de cualquier uso comercial.
- Sin soporte oficial: el autor no ofrece garantías de mantenimiento ni documentación adicional más allá de la model card y el libro asociado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zhouxzh/ascend310b-llm-om-zoo
- Repositorio GitHub: https://github.com/zhouxzh/Ascend310
- Libro sobre Ascend 310B: https://zhouxzh.github.io/Ascend310/book/
- Perfil del autor en HuggingFace: https://huggingface.co/zhouxzh
