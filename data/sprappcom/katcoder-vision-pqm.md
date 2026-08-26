# sprappcom/katcoder-vision-pqm

## Resumen

katcoder-vision-pqm es un modelo multimodal de un solo archivo desarrollado por sprappcom, que integra un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con una torre de visión de Qwen en un formato propietario `.pqm`. El modelo se construye mediante una fusión DARE entre Qwen3.6-35B-A3B (Alibaba, Apache-2.0) y KAT-Coder-V2.5-Dev (Kwaipilot, Apache-2.0), y añade la torre de visión Qwen como extensión embebida. Esto permite procesar imágenes y texto en un único paquete, sin necesidad de archivos GGUF ni servicios Python externos.

El modelo está orientado a tareas de generación de código y razonamiento multimodal, aprovechando las capacidades de tool calling del componente KAT-Coder y la arquitectura MoE de Qwen con 35 mil millones de parámetros totales y 3 mil millones activos por token. Su empaquetado en un único archivo `.pqm` simplifica el despliegue, aunque requiere el binario prism-engine con soporte específico para el encoder de visión in-process (candle-vision). Con un rendimiento medido de 1,25–1,35 segundos de tiempo hasta el primer token (TTFT) por imagen y un uso de VRAM de aproximadamente 16,5 GB, se posiciona como una opción viable para entornos con GPUs de gama media-alta.

La relevancia de este modelo radica en su enfoque de empaquetado todo-en-uno, que elimina la complejidad de gestionar múltiples componentes (pesos del LM, torre de visión, tokenizador) y facilita la integración en pipelines de inferencia. No obstante, su adopción está condicionada a la disponibilidad de prism-engine con la característica vision habilitada, y el empaquetado es propietario, aunque los pesos subyacentes son Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con torre de visión Qwen embebida |
| Parametros totales | 35 mil millones (estimado, basado en los componentes Qwen3.6-35B-A3B y KAT-Coder-V2.5-Dev) |
| Parametros activos | 3 mil millones (estimado, por token, según arquitectura MoE de los componentes) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato propietario `.pqm`, sin cuantización estándar documentada) |
| Idiomas soportados | no disponible (el nombre sugiere malayo, pero no hay confirmación; probablemente inglés y código) |
| Licencia | Apache-2.0 para los pesos de los componentes; empaquetado propietario de BCZ Singapore Pte Ltd |
| Formato de pesos | `.pqm` (single-file, propietario, no GGUF) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión DARE (Drop And REscale) entre dos modelos MoE: Qwen3.6-35B-A3B, que aporta el backbone MoE con 35 mil millones de parámetros totales y 3 mil millones activos por token, y KAT-Coder-V2.5-Dev, un modelo de código y tool calling de Kwaipilot con la misma arquitectura MoE. La fusión DARE combina los pesos de ambos modelos manteniendo la estructura MoE, y se le añade la torre de visión de Qwen como una extensión embebida dentro del archivo `.pqm`. No se han publicado detalles sobre el proceso de entrenamiento posterior a la fusión, como fine-tuning adicional o ajuste con RLHF/DPO. El tokenizador se proporciona por separado en un archivo `.tok` de 8,94 MB.

La innovación principal reside en el empaquetado: un único archivo `.pqm` que contiene los pesos del modelo de lenguaje, los pesos del encoder de visión y los extents Marlin empaquetados, eliminando la necesidad de archivos sidecar o servicios externos. La inferencia de visión se realiza in-process mediante candle-cuda en precisión bf16, lo que reduce la latencia y la complejidad operativa. Sin embargo, esto requiere que el binario prism-engine se compile con la característica candle-vision habilitada, ya que el binario estándar no la incluye.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes y texto en una única entrada, permitiendo responder preguntas sobre contenido visual.
- Generación de código: hereda las capacidades de KAT-Coder-V2.5-Dev, que alcanza un 69,40% en SWE-bench Verified, lo que lo hace apto para tareas de programación y depuración.
- Tool calling / function calling: soporte para invocar herramientas externas, integrable en agentes y flujos de automatización.
- Razonamiento multi-paso: capacidad de descomponer problemas complejos en pasos intermedios, especialmente en contextos de código y matemáticas.
- Capacidades multilingües: no confirmadas; el nombre "malay" sugiere posible soporte de malayo, pero no hay documentación oficial.
- Modo de visión: procesamiento de imágenes a través de la torre de visión Qwen embebida, con API compatible con OpenAI (formato `image_url`).

## Casos de uso

- Asistente de programación con entrada visual: el modelo puede analizar capturas de pantalla de errores, diagramas de arquitectura o esquemas UML y generar código o sugerencias de corrección. Su capacidad multimodal permite interpretar el contexto visual junto con el código.
- Automatización de tareas de desarrollo en CI/CD: gracias al tool calling, puede integrarse en pipelines para revisar código, generar tests o documentar cambios, activando solo 3 mil millones de parámetros por token para mantener baja latencia.
- Chatbot técnico de soporte: responde consultas sobre código, APIs o configuración, combinando razonamiento textual con la capacidad de entender imágenes de logs o mensajes de error.
- Análisis de documentos técnicos escaneados: al recibir imágenes de páginas o diagramas, el modelo extrae información relevante y la convierte en texto estructurado o código.
- Generación de documentación a partir de diagramas: dado un diagrama de flujo o una arquitectura de sistema en imagen, el modelo produce explicaciones detalladas o código de implementación.
- Entornos de desarrollo integrados (IDE) con asistente multimodal: puede usarse en plugins que permitan al desarrollador adjuntar capturas de pantalla junto con el código para obtener sugerencias contextuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el modelo fusionado katcoder-vision-pqm en la información disponible. El componente KAT-Coder-V2.5-Dev reporta un 69,40% en SWE-bench Verified, pero no hay datos específicos del modelo completo. Se proporcionan métricas de rendimiento operativo:

| Metrica | Valor |
|---|---|
| TTFT (tiempo hasta el primer token) por imagen | ~1,25–1,35 s |
| Uso de VRAM | ~16,5 GB |

Estos valores son mediciones del autor y no constituyen benchmarks de calidad del modelo.

## Requisitos de hardware

- VRAM estimada: ~16,5 GB para inferencia con el modelo completo (según mediciones del autor). Esto sugiere que cabe en GPUs con 16-24 GB de VRAM, como RTX 4090, RTX 4080 o A5000.
- GPU recomendadas: NVIDIA con soporte CUDA y al menos 16 GB de VRAM. Para la parte de visión se usa candle-cuda en bf16, por lo que se requiere una GPU compatible con bf16 (Ampere o posterior).
- Opciones de despliegue: exclusivamente mediante prism-engine con la característica candle-vision habilitada (commit `68a605e` del repositorio unificado). No es compatible con vLLM, llama.cpp, Ollama o TGI debido al formato `.pqm` propietario.
- Latencia y throughput: TTFT de ~1,25–1,35 s por imagen; no se proporcionan datos de throughput para generación de texto.
- Offload a CPU: se admite el parámetro `--n-cpu-moe 28` para descargar 28 capas MoE de expertos a CPU, reduciendo el requisito de VRAM a costa de rendimiento.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros totales / activos | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|---|
| katcoder-vision-pqm | MoE + visión | 35B / 3B (estimado) | no disponible | Imagen y texto | Apache-2.0 (pesos) + empaquetado propietario | `.pqm` |
| KAT-Coder-V2.5-Dev | MoE | 35B / 3B | 128K (según documentación de Kwaipilot) | Texto | Apache-2.0 | Transformers, GGUF, vLLM |
| Qwen3.6-35B-A3B | MoE | 35B / 3B | no disponible | Texto (sin visión en este release) | Apache-2.0 | Transformers |

La comparativa se basa en los componentes del modelo. No hay modelos multimodales de código con formato `.pqm` comparables en el ecosistema abierto. El principal diferenciador de katcoder-vision-pqm es su empaquetado single-file y la inclusión de visión, mientras que KAT-Coder-V2.5-Dev es solo texto y Qwen3.6-35B-A3B no incluye visión en su versión base.

## Limitaciones y advertencias

- Requisito de binario específico: el modelo solo funciona con prism-engine compilado con la característica candle-vision. El binario estándar no incluye el encoder de visión, por lo que el despliegue con un binario no modificado fallará al procesar imágenes.
- Empaquetado propietario: aunque los pesos son Apache-2.0, el formato `.pqm` y el packaging son propiedad de BCZ Singapore Pte Ltd. Esto puede limitar la interoperabilidad con otras herramientas y la modificación del archivo.
- Sin benchmarks de calidad: no hay resultados de MMLU, HumanEval, GSM8K u otros para el modelo fusionado, por lo que su rendimiento real en tareas generales es desconocido.
- Sesgos y alucinaciones: al ser un merge de modelos, puede heredar sesgos de los componentes, especialmente en contextos de código donde las alucinaciones de APIs o funciones inexistentes son un riesgo conocido.
- Idiomas no confirmados: a pesar del nombre "malay", no hay documentación sobre los idiomas soportados. Se asume un buen rendimiento en inglés y lenguajes de programación, pero el soporte multilingüe es incierto.
- Riesgo de fallos en prefill: la model card advierte que si se produce un panic durante el prefill, se debe aumentar el tamaño de caché de expertos (`--moe-cache-experts 2048`), lo que indica posibles problemas de estabilidad en configuraciones de memoria limitada.
- Sin soporte de cuantización estándar: al no ser GGUF, no se pueden aplicar cuantizaciones comunes (Q4_K_M, Q8_0, etc.), limitando las opciones de despliegue en hardware con poca VRAM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sprappcom/katcoder-vision-pqm
- Kwaipilot/KAT-Coder-V2.5-Dev: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Kwaipilot/KAT-Dev: https://huggingface.co/Kwaipilot/KAT-Dev
- Sitio de KAT-Coder (Kwaipilot): https://kwaipilot.github.io/KAT-Coder/
- Guía de configuración local de KAT-Coder V2.5 (dev.to): https://dev.to/ai_made_tools/kat-coder-v25-local-setup-guide-gguf-vllm-sglang-2fdi
- Producto KwaiKAT de StreamLake: https://www.streamlake.ai/product/kat-coder
