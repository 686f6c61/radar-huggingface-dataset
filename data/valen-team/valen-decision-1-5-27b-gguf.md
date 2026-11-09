# Valen-Team/Valen-Decision-1.5-27B-GGUF

## Resumen

Valen-Decision-1.5-27B-GGUF es la variante en formato GGUF del modelo Valen-Decision-1.5-27B, desarrollado por Valen-Team. No es un modelo generativo de propósito general, sino un modelo de decisión (decision model) que recibe texto e imágenes como entrada y devuelve salidas tipadas y estructuradas: probabilidades para predicados, etiquetas de clasificación y acciones detectadas en vídeo. Está construido sobre el modelo base Qwen/Qwen3.5-27B, del que hereda la arquitectura y los pesos, con un entrenamiento específico orientado a tareas de decisión estructurada.

El modelo resuelve un problema concreto: sustituir pipelines ad hoc de clasificación y enrutado (tickets de soporte, moderación de imágenes de producto, etiquetado de vídeo) por un único modelo que emite decisiones tipadas en una sola pasada forward, con un protocolo de API definido (SystemOne y Decisions). Es relevante porque unifica tareas de visión-lenguaje y clasificación bajo un esquema de salida estructurado y compartido (shared-state), lo que simplifica la integración en producción.

Con 26.099.270.173 parámetros (unos 26,1B) y una licencia Apache 2.0, se distribuye en GGUF, aunque la model card advierte que las cuantizaciones Q4 y Q5 no superaron los controles de calidad y solo se recomiendan F32 y Q8_0. El repositorio ocupa 52,2 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-27B), con código personalizado (`trust_remote_code`) |
| Parametros totales | 26.099.270.173 (~26,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; solo F32 y Q8_0 recomendados (Q4 y Q5 fallaron los controles de calidad) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con tamaño de 52,2 GB); existen pesos nativos y ONNX en otras variantes del proyecto |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-27B y conserva su arquitectura transformer, pero se ha reentrenado para una tarea de decisión estructurada en lugar de generación libre de texto. La entrada es multimodal (texto e imagen, con soporte de vídeo en el código fuente aunque no en el paquete GGUF precompilado 0.1.0) y la salida es tipada: probabilidades de predicados, elecciones y puntuaciones emitidas en una única pasada forward. El modelo usa un mecanismo de estado compartido (shared-state) y requiere cargarse con `trust_remote_code=True` y `attn_implementation="sdpa"`.

El autor publica el código de entrenamiento y el conjunto de datos de entrenamiento (Valen-Training-General-100k), lo que permite afinar el modelo para tareas propias. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona explícitamente que el paquete GGUF precompilado 0.1.0 no compila soporte directo de vídeo, y que las pruebas históricas de vídeo con compilación desde fuente no cualifican al binario precompilado.

## Capacidades

- Clasificación de mensajes de cliente y enrutado de tickets mediante predicados con probabilidad asociada.
- Verificación de imágenes contra requisitos definidos (por ejemplo, cribado de imágenes de producto).
- Identificación de acciones en vídeo (en compilaciones desde fuente; no en el GGUF precompilado 0.1.0).
- Salida estructurada y tipada: probabilidades, elecciones y puntuaciones en una sola pasada forward.
- Soporte de dos formatos de API de decisión: SystemOne (Jev) y Decisions (OpenAI), con el mismo modelo.
- Entrada image-text-to-text con salida tipada (image-text-to-typed-output).
- Mecanismo de estado compartido (shared-state) para flujos multi-pregunta.
- No se documentan capacidades de generación de texto libre, código, matemáticas ni tool calling en la información disponible.

## Casos de uso

- Enrutado de tickets de soporte: el modelo clasifica el mensaje del cliente con predicados y devuelve probabilidades, lo que permite dirigir cada ticket al equipo adecuado con un umbral de confianza configurable. El Cookbook oficial incluye un tutorial específico de ticket routing.
- Cribado de imágenes de producto: se definen requisitos como predicados y el modelo evalúa si la imagen los cumple, emitiendo una probabilidad por criterio. Útil en marketplaces que necesitan validar automáticamente fotos de catálogo.
- Etiquetado de vídeo: detección de acciones y etiquetas en vídeo para indexación o moderación, siempre que se use una compilación con soporte de vídeo (no el GGUF precompilado 0.1.0).
- Moderación de contenido multimodal: verificación de texto e imagen contra políticas definidas como predicados, con salida probabilística que permite fijar umbrales de revisión humana.
- Servicio C++ en CPU Linux: despliegue con el runtime personalizado de Valen sobre GGUF en entornos sin GPU, orientado a servicios de decisión de baja latencia.
- Integración vía API HTTP: uso del endpoint gratuito `api.valen-team.workers.dev/v1/decisions` para prototipado sin descargar pesos ni disponer de GPU.
- Fine-tuning para dominios propios: el autor publica código y datos de entrenamiento, de modo que se puede adaptar el modelo a taxonomías de decisión específicas de una organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona controles de calidad (quality gates) que descartaron las cuantizaciones Q4 y Q5, y una validación P1 sobre imágenes fijas con el binario precompilado y el modelo 0.8B Q8_0, pero no se aportan cifras de MMLU, HumanEval, GSM8K ni métricas comparables.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con ~26,1B parámetros, la inferencia en Q8_0 requiere del orden de 26-30 GB de memoria solo para los pesos, más overhead; en F32 sería considerablemente mayor. El autor advierte que el tamaño de fichero no equivale al requisito de RAM.
- GPU recomendadas: el ejemplo oficial de carga usa una GPU NVIDIA con CUDA; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- GPU de consumo: no confirmado. Un modelo de ~26B en Q8_0 no cabe en GPUs de consumo de 24 GB sin offloading o cuantización inferior, y las cuantizaciones Q4/Q5 no están recomendadas por el autor.
- Opciones de despliegue: runtime personalizado de Valen sobre GGUF (C++ en CPU Linux); SGLang/vLLM para despliegue en GPU; ONNX Runtime (Python/JavaScript) para aplicaciones offline; Transformers con `trust_remote_code`. El autor indica que no se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Valen-Decision-1.5-27B-GGUF | ~26,1B | no disponible | Decisión estructurada multimodal | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-27B (modelo base) | ~27B | no disponible | Generación de propósito general | no disponible en esta ficha | no disponible |
| Alternativas de clasificación multimodal | no disponible | no disponible | Clasificación imagen-texto | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Las cuantizaciones GGUF Q4 y Q5 no superaron los controles de calidad del autor; solo F32 y Q8_0 están recomendadas.
- El paquete GGUF precompilado 0.1.0 no incluye soporte directo de vídeo; las pruebas de vídeo históricas se hicieron con compilación desde fuente y no cualifican al binario precompilado.
- No se reclama compatibilidad con llama.cpp u Ollama oficiales sin modificar; requiere el runtime personalizado de Valen o backends como SGLang/vLLM.
- La validación P1 solo cubre imágenes fijas sobre el binario precompilado con el modelo 0.8B Q8_0, y no se extiende a otros tamaños.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del autor.
- No se documentan sesgos conocidos, riesgo de alucinación ni cobertura idiomática; al ser un modelo de decisión con salida probabilística, conviene fijar umbrales y revisión humana en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-27B puede tener condiciones propias que conviene verificar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción aún muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Web y demo gratuita: https://valen-team.github.io/
- Repositorio de código y entrenamiento: https://github.com/Valen-Team/Valen
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- Cookbook: https://valen-team.github.io/cookbook/
- Guía de elección de versión: https://valen-team.github.io/docs/valen/choosing/
- Documentación de API: https://valen-team.github.io/docs/valen/api/
- Quickstart de Transformers: https://valen-team.github.io/docs/valen/quickstart/
- Validación: https://valen-team.github.io/cookbook/validation/
- Demo en vídeo: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/demos/valen-decision-1.5-demo.mp4
- API SystemOne (Jev): https://docs.typesafe.ai/api/system-one
- API Decisions (OpenAI): https://developers.openai.com/api/docs/guides/decisions
