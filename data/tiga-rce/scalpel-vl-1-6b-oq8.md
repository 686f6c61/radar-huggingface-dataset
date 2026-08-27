# TiGa-RCE/Scalpel-VL-1.6B-oQ8

## Resumen

Scalpel-VL-1.6B-oQ8 es un modelo de visión-lenguaje (VLM) cuantizado, publicado por el usuario TiGa-RCE en HuggingFace. Se trata de una versión comprimida de un modelo de la familia Qwen3-VL, cuantizado con la herramienta oQ (oMLX) a 8 bits con un group size de 64, y distribuido en formato MLX safetensors. El objetivo principal de esta cuantización es reducir el tamaño y los requisitos de memoria del modelo original, facilitando su ejecución en dispositivos Apple Silicon mediante el framework MLX.

A pesar de su nombre, los parámetros totales declarados en los safetensors son 763.516.672, lo que sugiere que el modelo base podría ser una variante más pequeña de la serie Qwen3-VL de 1.6B, o que la cuantización ha reducido significativamente el número de parámetros efectivos. El repositorio ocupa 2.2 GB y la cuantización fue actualizada el 2026-08-26, reemplazando una versión anterior. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso, lo que limita su adopción en entornos de producción sin una evaluación previa.

La relevancia de este modelo radica en su naturaleza cuantizada: ofrece una vía para ejecutar un VLM multimodal en hardware de gama media o en entornos con restricciones de memoria, aunque la falta de documentación y de benchmarks públicos hace que su rendimiento real sea difícil de verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_vl (familia Qwen3-VL) |
| Parametros totales | 763.516.672 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ 8-bit, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-VL, una familia de modelos multimodales de la serie Qwen3 que integra un codificador de visión con un transformer de lenguaje. Qwen3-VL está diseñado para procesar imágenes y texto, permitiendo tareas como respuesta a preguntas visuales, OCR y razonamiento multimodal. La cuantización aplicada mediante oQ (oMLX) utiliza precisión mixta de 8 bits con group size 64, una técnica que busca reducir el tamaño del modelo manteniendo un equilibrio entre velocidad y calidad de salida.

No se dispone de información sobre el entrenamiento del modelo base, como el número de tokens, la composición del dataset o si se aplicaron técnicas de alineación (RLHF, DPO). Dado que la model card solo documenta el proceso de cuantización, los detalles del entrenamiento original de Qwen3-VL no son accesibles desde esta fuente. La cuantización no modifica la arquitectura subyacente, pero sí introduce pérdidas de precisión en los pesos, lo que puede afectar al rendimiento en tareas complejas.

## Capacidades

- Generacion de texto y razonamiento multimodal: al ser un modelo de la familia Qwen3-VL, es capaz de procesar imágenes y texto simultaneamente, respondiendo a preguntas sobre contenidos visuales.
- Razonamiento visual: puede describir escenas, identificar objetos y responder a consultas que combinan información textual y visual.
- Generacion de texto en lenguaje natural: mantiene las capacidades de generacion de texto de los modelos Qwen, aunque la cuantizacion puede degradar ligeramente la fluidez en contextos largos.
- Soporte de tool calling y function calling: no se ha confirmado en la informacion disponible, aunque los modelos Qwen3-VL suelen incluirlo en sus versiones base.
- Capacidades multilingues: no se especifican idiomas soportados, aunque la familia Qwen suele incluir ingles, chino y otros idiomas.
- Capacidades de vision: como VLM, soporta entrada de imagenes, pero no se detallan las resoluciones maximas ni el formato de entrada.

## Casos de uso

- Prototipado rapido de aplicaciones de vision por computador: el modelo cuantizado permite experimentar con tareas de VQA (visual question answering) en entornos de desarrollo con recursos limitados, usando la libreria MLX en macOS o Linux.
- Analisis de imagenes en dispositivos moviles o edge: gracias a su tamano reducido (2.2 GB en disco), puede desplegarse en equipos con poca VRAM, como portatiles con Apple Silicon, para tareas de descripcion de imagenes o extraccion de informacion visual.
- Educacion e investigacion: util para estudiantes o investigadores que necesitan un modelo multimodal de tamano moderado para experimentos academicos sin acceso a GPUs de alta gama.
- Generacion de contenido asistido: puede emplearse para crear descripciones alternativas de imagenes (alt text) en blogs o documentos, aunque la falta de licencia clara limita su uso comercial.
- Integracion en pipelines de MLX: al estar en formato safetensors de MLX, es facilmente integrable en aplicaciones que ya usan la libreria oMLX para inferencia en Apple Silicon.
- Evaluacion de tecnicas de cuantizacion: el modelo puede servir como caso de estudio para comparar el impacto de la cuantizacion 8-bit en modelos multimodales, aunque no se han publicado benchmarks que lo respalden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye comparaciones con el modelo original ni con otras cuantizaciones, y no se han encontrado evaluaciones externas del rendimiento en tareas de vision o lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no se especifica, pero un modelo de 763M parametros en 8-bit requiere aproximadamente 1.5-2 GB de VRAM para inferencia en FP16, y menos con cuantizacion adicional. En formato MLX, puede ejecutarse en la memoria unificada de Apple Silicon.
- GPU recomendadas: no se indican GPUs especificas. Al ser MLX, esta orientado a chips Apple M1/M2/M3/M4, aunque podria adaptarse a otros entornos con conversion de pesos.
- Si cabe en consumer GPU: si, con 2.2 GB de tamano en disco, cabe en GPUs con 4 GB de VRAM (como RTX 3050 o GTX 1650) si se convierte el formato, aunque la inferencia puede ser lenta.
- Opciones de despliegue: se puede ejecutar con la libreria oMLX (https://github.com/jundot/omlx) y probablemente con MLX de Apple. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que el formato es MLX.
- Latencia y throughput: no se disponen datos; en Apple Silicon, la inferencia de un modelo de 0.76B parametros deberia ser de decenas de tokens por segundo, pero no hay medidas publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos suficientes. El modelo no tiene benchmarks publicados, y no se puede comparar directamente con otras cuantizaciones de Qwen3-VL o con modelos de tamano similar (como Qwen2.5-VL-1.6B o Phi-3.5-Vision) sin informacion adicional. La unica referencia es el modelo base Qwen3-VL-1.6B, pero no se han publicado resultados de comparacion.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado informacion sobre sesgos; los modelos Qwen pueden heredar sesgos de sus datos de entrenamiento, pero no se dispone de detalles.
- Riesgo de alucinacion: al ser un modelo multimodal cuantizado, puede generar descripciones inexactas de imagenes o alucinar objetos no presentes en la imagen; la cuantizacion puede aumentar este riesgo.
- Limitaciones de contexto o idioma: no se conoce la longitud de contexto ni los idiomas soportados; es probable que el contexto sea limitado en comparacion con versiones mas grandes de Qwen3-VL.
- Restricciones de licencia: la licencia no esta disponible, lo que impide un uso comercial sin aclaraciones legales previas.
- Advertencia de produccion: la falta de benchmarks y de documentacion tecnica hace que no sea recomendable para entornos de produccion sin una evaluacion previa exhaustiva.
- Formato propietario: el uso de MLX safetensors limita la portabilidad a otros frameworks (PyTorch, ONNX) sin conversion adicional.

## Enlaces

- https://huggingface.co/TiGa-RCE/Scalpel-VL-1.6B-oQ8
- https://github.com/jundot/omlx (oMLX, herramienta de cuantizacion)
- https://huggingface.co/TiGa-RCE (perfil del autor)
