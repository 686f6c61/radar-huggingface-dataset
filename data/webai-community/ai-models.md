# webai-community/ai-models

## Resumen

`webai-community/ai-models` no es un modelo único, sino un repositorio agregador mantenido por la comunidad webai-community que empaqueta una colección de modelos de terceros en formatos optimizados para ejecución en navegador (ONNX con backend WebGPU) y para inferencia local (GGUF). El repositorio reúne variantes de las familias Phi (Microsoft), Qwen (Alibaba) y EmbeddingGemma, cubriendo desde embeddings de 740M parámetros hasta un modelo de 27B, con un total de pesos reales de 6.738.546.688 parámetros en safetensors y un tamaño de repositorio de 442,7 GB.

Su relevancia actual radica en que facilita el despliegue de LLMs directamente en el cliente mediante WebGPU, sin necesidad de infraestructura de servidor, y en que ofrece conversiones GGUF listas para usar con llama.cpp u Ollama. La ficha técnica de los modelos subyacentes (arquitectura, contexto, licencia) debe consultarse en los README individuales de cada subcarpeta, ya que este repositorio actúa como distribuidor y no como autor de los modelos originales.

La información disponible sobre parámetros, licencia, idiomas y pipeline es parcial: el dato de parámetros totales proviene de los safetensors del repo, mientras que la licencia y los idiomas no están declarados a nivel de repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contenedor de múltiples modelos (Phi, Qwen, EmbeddingGemma); arquitectura por modelo no disponible a nivel de repo |
| Parametros totales | 6.738.546.688 (safetensors del repo); por modelo: 0,5B a 27B |
| Parametros activos | no disponible (no se declara ningún modelo MoE) |
| Longitud de contexto | no disponible a nivel de repo; por modelo, variable (Phi-3-mini-4k: 4K; Phi-3-mini-128k: 128K; resto no disponible) |
| Tipos de cuantizacion | GGUF (variantes por modelo) y ONNX WebGPU (precisión no especificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF, ONNX (onnx-webgpu) |

## Arquitectura y entrenamiento

Este repositorio no entrena modelos: distribuye conversiones de modelos existentes. Los modelos incluidos pertenecen a familias transformer densas (Phi-3, Phi-3.5, Phi-4, Qwen2.5, Qwen3, Qwen3.5) y a un modelo de embeddings (EmbeddingGemma-2, 740M). Las conversiones se ofrecen en dos formatos: GGUF para llama.cpp y similares, y ONNX con ejecución sobre WebGPU para inferencia en navegador mediante ONNX Runtime Web.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF/DPO) a nivel de repositorio; esos detalles corresponden a las fichas originales de cada modelo. La innovación técnica del repo es el empaquetado multiplataforma (navegador + local) y la estructura de descarga selectiva por modelo y formato.

## Capacidades

- Generación de texto e instrucciones en los modelos Phi y Qwen incluidos.
- Razonamiento explícito en las variantes Phi-4-mini-reasoning y en la familia Qwen3/Qwen3.5 (modo thinking según modelo original).
- Capacidades multimodales en Phi-4-multimodal-instruct (6B), con soporte de visión y audio según la ficha original.
- Embeddings de texto con EmbeddingGemma-2 (740M) para búsqueda semántica y RAG.
- Ejecución en navegador vía ONNX WebGPU, sin backend propio.
- Ejecución local vía GGUF con llama.cpp, Ollama y derivados.
- Soporte de tool calling y agentes: no disponible a nivel de repo; depende de cada modelo original.
- Capacidades multilingües: no disponible a nivel de repo; depende de cada modelo original.

## Casos de uso

- Asistentes en navegador sin servidor: desplegar Phi-4-mini-instruct o Qwen3-4B con ONNX WebGPU permite ofrecer un chatbot que se ejecuta íntegramente en el cliente, con la privacidad que ello implica y sin coste de inferencia en la nube.
- RAG local y búsqueda semántica: EmbeddingGemma-2 (740M) en formato ONNX WebGPU sirve para indexar y recuperar documentos en aplicaciones web sin enviar datos a un servidor externo.
- Inferencia en portátiles y equipos sin GPU dedicada: las variantes GGUF de Qwen2.5-0.5B/1.5B y Qwen3-0.6B/1.7B caben en memoria RAM y permiten prototipado rápido con llama.cpp u Ollama.
- Procesamiento de documentos largos: Phi-3-mini-128k-instruct admite contextos de hasta 128K tokens, útil para resumir contratos, informes o expedientes extensos en local.
- Razonamiento matemático y depuración de código: Phi-4-mini-reasoning y las variantes Qwen3 con modo thinking permiten resolver problemas paso a paso en entornos sin conectividad.
- Aplicaciones multimodales en el borde: Phi-4-multimodal-instruct (6B) en ONNX WebGPU posibilita análisis de imágenes y audio en el navegador para herramientas de accesibilidad o inspección visual.
- Evaluación comparativa de modelos: el repositorio unifica formatos y permite intercambiar variantes (0,5B a 27B) para medir latencia y calidad en el mismo stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: depende del modelo. Orientativo: 0,5B–2B en FP16 requieren ~1–4 GB; 4B–9B ~8–18 GB; 27B ~54 GB en FP16 (no confirmado por el autor). Las variantes GGUF cuantizadas reducen estas cifras aproximadamente a la mitad o menos.
- GPU recomendadas: para ONNX WebGPU, cualquier GPU con soporte WebGPU (integradas modernas, Apple Silicon, NVIDIA/AMD recientes); para GGUF, GPU consumer como RTX 3060/4060/4090 según tamaño.
- Cabe en GPU consumer: sí para los modelos de 0,5B a 9B; el de 27B requiere cuantización agresiva o GPU de 24 GB o superior.
- Opciones de despliegue: ONNX Runtime Web (WebGPU) para navegador; llama.cpp, Ollama y servidores compatibles con GGUF para local.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webai-community/ai-models (repo) | 0,5B–27B (agregado) | variable por modelo | ONNX WebGPU, GGUF, safetensors | no disponible | Hugging Face |
| Repositorios oficiales de Phi (Microsoft) | 3,8B–6B | 4K–128K según variante | safetensors, GGUF | MIT (según modelo original) | Hugging Face |
| Repositorios oficiales de Qwen (Alibaba) | 0,5B–27B+ | variable | safetensors, GGUF | Apache 2.0 en la mayoría de variantes | Hugging Face |
| Conversiones ONNX WebGPU de terceros | variable | variable | ONNX | variable | Hugging Face |

La ventaja del repo frente a los originales es la disponibilidad de conversiones WebGPU y GGUF listas para usar; la desventaja es la ausencia de metadatos consolidados (licencia, idiomas, pipeline).

## Limitaciones y advertencias

- El repositorio no declara licencia; la licencia aplicable es la de cada modelo original, que debe verificarse antes de uso comercial.
- No es un modelo entrenado por webai-community: la calidad, sesgos y alucinaciones dependen de los modelos subyacentes.
- Los metadatos de idiomas, pipeline y contexto no están consolidados; es imprescindible consultar los README individuales.
- El tamaño del repo (442,7 GB) obliga a descargas selectivas con `--include`; descargar todo puede agotar disco y ancho de banda.
- Las conversiones ONNX WebGPU pueden no reproducir exactamente el comportamiento del modelo original (diferencias numéricas, operadores no soportados).
- El rendimiento en navegador depende de la implementación de WebGPU del navegador y de la GPU del cliente; la latencia puede ser alta en equipos modestos.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; se recomienda validación específica por caso de uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/webai-community/ai-models
- Modelos Phi (Microsoft): https://huggingface.co/microsoft
- Modelos Qwen (Alibaba): https://huggingface.co/Qwen
- EmbeddingGemma: https://huggingface.co/google
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
