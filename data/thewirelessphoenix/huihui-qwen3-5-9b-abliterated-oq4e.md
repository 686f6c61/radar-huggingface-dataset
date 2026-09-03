# TheWirelessPhoenix/Huihui-Qwen3.5-9B-abliterated-oQ4e

## Resumen

Este repositorio contiene una cuantización de 4 bits del modelo Huihui-Qwen3.5-9B-abliterated, una variante modificada de Qwen3.5-9B a la que se ha aplicado la técnica de *abliteración* para eliminar los comportamientos de rechazo del modelo original. El resultado es un modelo que responde a una gama más amplia de instrucciones sin filtros de contenido, lo que lo hace útil para investigación sobre seguridad y alineación, pero también implica la ausencia de salvaguardas. La cuantización se ha realizado con la herramienta oQ (oMLX v0.6.4) en formato MLX safetensors, con un tamaño de 6,1 GB y 9.409.813.744 parámetros. Está pensado para ejecutarse en hardware Apple Silicon mediante MLX, aunque también puede convertirse a otros formatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (oQ4e, group size 64) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.5-9B. Según fuentes externas, Qwen3.5 es una familia de modelos multimodales de código abierto, pero no se confirma si esta cuantización conserva el encoder de visión. La modificación principal es la *abliteración*, una técnica que elimina los mecanismos de rechazo del modelo original, permitiendo respuestas sin restricciones de contenido. El proceso de cuantización se realizó con oQ (oMLX v0.6.4) en precisión mixta, con 4 bits y group size 64, generando pesos en formato MLX safetensors. No se han publicado datos sobre el entrenamiento del modelo base ni sobre el proceso de abliteración.

## Capacidades

- No se han especificado capacidades detalladas para esta versión cuantizada en la información proporcionada.
- Se espera que herede las capacidades del modelo base Qwen3.5-9B, que incluyen generación de texto, razonamiento, código y posiblemente visión, aunque no está confirmado.
- La abliteración elimina los rechazos, por lo que el modelo responde a una amplia variedad de prompts sin filtros de contenido.
- No se menciona soporte para tool calling, agentes o modos de pensamiento específicos.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo la abliteración afecta el comportamiento del modelo y qué mecanismos internos se eliminan.
- Pruebas de estrés de sistemas de moderación: generar contenido que normalmente sería rechazado para evaluar la robustez de filtros automáticos.
- Desarrollo de entornos sandbox para experimentos de alineación: ejecutar el modelo en entornos aislados para analizar sus respuestas sin riesgo de impacto real.
- Generación creativa de texto sin restricciones: proyectos artísticos o literarios que requieran explorar temas sensibles sin censura previa.
- Educación sobre sesgos y alineación: usar el modelo como ejemplo de los riesgos de eliminar guardarraíles en sistemas de IA.
- Evaluación de técnicas de cuantización: comparar el rendimiento de esta cuantización oQ4e con otras versiones del mismo modelo en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamaño del repositorio: 6,1 GB (pesos cuantizados a 4 bits).
- VRAM estimada para inferencia: aproximadamente 6-8 GB, dependiendo del overhead del runtime.
- GPU recomendadas: hardware Apple Silicon (M1/M2/M3) con al menos 16 GB de memoria unificada para ejecución fluida mediante MLX.
- En GPU NVIDIA, el formato MLX no es directamente compatible; sería necesario convertir los pesos a GGUF u otro formato (p. ej., con llama.cpp) para su uso.
- Opciones de despliegue: MLX (Apple Silicon), posible conversión a GGUF para Ollama o llama.cpp, aunque no se proporciona en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras versiones del mismo modelo o con alternativas similares. La información proporcionada no incluye benchmarks ni métricas de rendimiento.

## Limitaciones y advertencias

- Ausencia total de guardarraíles: el modelo puede generar contenido ofensivo, peligroso o ilegal sin restricciones.
- Riesgo elevado de alucinaciones, especialmente en temas delicados, al no contar con mecanismos de rechazo que moderen respuestas.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido.
- No se dispone de información sobre sesgos específicos, pero al ser una versión sin filtros, es probable que amplifique sesgos presentes en los datos de entrenamiento.
- No apto para producción sin supervisión humana exhaustiva; debe usarse únicamente en entornos controlados y sandbox.
- La cuantización a 4 bits puede degradar ligeramente la calidad de las respuestas en comparación con el modelo original en precisión completa.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/TheWirelessPhoenix/Huihui-Qwen3.5-9B-abliterated-oQ4e
- Modelo original (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Colección de modelos abliterated de huihui-ai: https://huggingface.co/collections/huihui-ai/qwen35-abliterated
- Página en Ollama: https://ollama.com/huihui_ai/qwen3.5-abliterated
- Artículo de HackerNoon: https://hackernoon.com/huihui-qwen35-9b-abliterated-what-this-uncensored-model-does
- Ficha en ThinkLLM: https://thinkllm.dev/models/huihui-qwen3-5-9b-abliterated
