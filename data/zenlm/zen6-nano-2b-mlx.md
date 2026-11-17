# zenlm/zen6-nano-2b-mlx

## Resumen

Zen 6 Nano (2B) es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por Hanzo AI y Zen LM, distribuido en formato nativo para Apple Silicon mediante la librería MLX. Se publica bajo licencia Apache-2.0 y emplea una cuantización ternaria de 2 bits con transformada de Hadamard (denominada "prism_hadamard_qwen35" en los metadatos), lo que reduce drásticamente el peso del modelo hasta un repositorio de 2,4 GB para 2.213.649.216 parámetros totales.

El modelo parte de una arquitectura tipo Qwen 3.5 (según la etiqueta interna `prism_hadamard_qwen35`) y ha sido post-entrenado con QAT (quantization-aware training) y STE (straight-through estimator) sobre una base ternaria en el espacio de Hadamard. Incorpora una torre de visión en FP16 para el procesamiento de imágenes y un runtime propio (`runtime/`) adaptado a la base de Hadamard, además de capacidades de agente mediante el protocolo MCP de Hanzo con etiquetas `<tool_call>`.

Su relevancia actual radica en dos factores: por un lado, ofrece inferencia multimodal en hardware de consumo Apple (M1 a M4 Max) con un footprint de 2,4 GB, lo que facilita el despliegue local; por otro, integra de serie soporte para tool calling vía MCP, algo poco habitual en modelos de este tamaño y cuantización. La información pública disponible es escasa: no se detallan idiomas soportados, composición del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto-a-texto), base Qwen 3.5 según etiqueta `prism_hadamard_qwen35`; torre de visión en FP16 |
| Parametros totales | 2.213.649.216 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria de 2 bits con transformada de Hadamard (affine Hadamard); pesos publicados en ese formato; torre de visión en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con runtime propio en `runtime/` |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal con pipeline `image-text-to-text`: un codificador de visión en FP16 se combina con un modelo de lenguaje cuantizado de forma ternaria (2 bits) en el dominio de Hadamard. La cuantización se ha aplicado mediante QAT con estimador de gradiente directo (STE), de modo que los pesos publicados en `model.safetensors` corresponden a los parámetros ternarios ya post-entrenados, no a una conversión a posteriori. El repositorio incluye un directorio `runtime/` con código específico para operar sobre la base de Hadamard, lo que sugiere que la inferencia requiere ese runtime y no un cargador MLX genérico.

En cuanto a los datos de entrenamiento, no se especifica el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La model card menciona que el post-entrenamiento incorpora la "identidad Zen 6" y las capacidades agénticas de Hanzo MCP con etiquetas `<tool_call>`, lo que indica al menos una fase de ajuste orientada a agentes y tool calling. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes (pipeline `image-text-to-text`) mediante torre de visión en FP16.
- Tool calling y function calling a través del protocolo MCP de Hanzo, con formato de etiquetas `<tool_call>`.
- Comportamiento agéntico orientado a flujos multi-paso, según la model card.
- Identidad de modelo ajustada ("Zen 6 identity"), es decir, respuestas alineadas con la persona definida por el autor.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistentes locales en Mac con privacidad estricta: al ocupar 2,4 GB y ejecutarse sobre MLX en Apple Silicon, el modelo permite desplegar un asistente conversacional multimodal sin enviar datos a la nube, adecuado para entornos con requisitos de confidencialidad.
- Automatización de escritorio con MCP: gracias al soporte nativo de `<tool_call>` y del protocolo MCP, puede integrarse en agentes que invoquen herramientas locales (ficheros, terminal, APIs internas) desde un Mac de desarrollo.
- Descripción y análisis de imágenes en local: la torre de visión en FP16 permite tareas de captioning, extracción de información de capturas de pantalla o clasificación visual sin depender de servicios externos.
- Prototipado rápido de agentes multimodales: su tamaño reducido y licencia Apache-2.0 facilitan iterar sobre pipelines agénticos en equipos pequeños antes de escalar a modelos mayores.
- Educación y experimentación con cuantización ternaria: el repositorio incluye el runtime Hadamard, lo que lo convierte en una referencia práctica para estudiar QAT ternario y su impacto en calidad.
- Chatbot de soporte en aplicaciones de escritorio: con contexto conversacional y tool calling, puede gestionar consultas multi-turno e invocar funciones de la aplicación anfitriona.
- Evaluación de modelos pequeños multimodales: útil como baseline ligero en comparativas de eficiencia en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 2,4 GB, por lo que la inferencia requiere del orden de 3-4 GB de memoria unificada, incluyendo overhead del runtime y de la torre de visión en FP16.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 Max según la model card), al estar en formato MLX nativo.
- GPU de consumo: cabe holgadamente en cualquier Mac con 8 GB o más de memoria unificada; no está pensado para GPUs NVIDIA ni AMD por el formato MLX.
- Opciones de despliegue: `mlx` con el runtime propio incluido en `runtime/`; el quickstart oficial usa `hf download` y `quickstart.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Zen 6 Nano 2B MLX | 2,21 B | no disponible | Si (vision) | Ternaria 2-bit Hadamard | Apache-2.0 | Apple Silicon (MLX) |
| Qwen2.5-VL 3B | 3 B aprox. | no disponible en esta ficha | Si | FP16/BF16, GGUF | Apache-2.0 (variantes) | Multiples (incl. MLX) |
| SmolVLM 2B | 2 B aprox. | no disponible en esta ficha | Si | FP16, cuantizaciones comunitarias | Apache-2.0 | Multiples |
| Gemma 3 1B | 1 B aprox. | no disponible en esta ficha | Si (vision) | FP16, GGUF | Gemma license | Multiples |

Nota: los datos de los modelos comparables no provienen de la informacion proporcionada y deben verificarse en sus fichas oficiales antes de usarse en decisiones de produccion.

## Limitaciones y advertencias

- Información pública muy escasa: no se declaran idiomas, contexto, dataset ni benchmarks, lo que dificulta evaluar su calidad antes de desplegarlo.
- La cuantización ternaria de 2 bits implica una pérdida de precisión frente a pesos FP16; el impacto real en tareas de razonamiento y visión no está cuantificado.
- Riesgo de alucinación inherente a modelos pequeños (2,2 B), especialmente en dominios especializados y en tareas de visión con imágenes complejas.
- Dependencia del runtime Hadamard incluido: no es un modelo MLX estándar y puede requerir ajustes si se integra en herramientas que esperan un cargador MLX convencional.
- Plataforma restringida: solo Apple Silicon; no hay pesos GGUF ni soporte documentado para CUDA.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el fichero `NOTICE` con los avisos upstream.
- El ajuste de "identidad Zen 6" puede sesgar las respuestas hacia la persona definida por el autor; conviene evaluar su comportamiento en dominios ajenos a esa identidad.
- No se documenta el comportamiento del tool calling fuera del ecosistema MCP de Hanzo; la fiabilidad de las etiquetas `<tool_call>` en otros frameworks no está verificada.

## Enlaces

- Hugging Face: https://huggingface.co/zenlm/zen6-nano-2b-mlx
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
