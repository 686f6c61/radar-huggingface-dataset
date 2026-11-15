# zenlm/zen6-mlx

## Resumen

Zen 6 (27B) es un modelo multimodal de tipo image-text-to-text desarrollado por Hanzo AI y Zen LM, distribuido en formato nativo para Apple Silicon mediante MLX. El modelo combina un transformer de 27.359.638.768 parámetros con una torre de visión en FP16 y pesos cuantizados en 2 bits ternarios con transformada de Hadamard (denominada `prism_hadamard_qwen35`), lo que reduce el repositorio a 8,6 GB.

La relevancia principal del modelo reside en su formato de despliegue: está pensado para ejecutarse en hardware Apple Silicon (M1, M2, M3 y M4 Max) a través de la librería MLX, sin necesidad de GPU dedicada. Además, incorpora capacidades agénticas mediante llamadas a herramientas en formato `<tool_call>` compatibles con MCP (Model Context Protocol), lo que lo orienta hacia flujos de agentes con integración de herramientas externas.

La licencia Apache-2.0 permite uso comercial y modificación, aunque la model card es muy escueta y no documenta composición del dataset, número de tokens de entrenamiento, idiomas soportados ni resultados de benchmarks. El modelo se publicó el 15 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de visión FP16; pesos principales cuantizados en 2 bits ternarios con base Hadamard (`prism_hadamard_qwen35`) |
| Parametros totales | 27.359.638.768 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternarios (affine Hadamard) para los pesos del modelo; torre de visión en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), librería `mlx` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer multimodal con una torre de visión en FP16 acoplada a un backbone de lenguaje cuyos pesos han sido post-entrenados mediante QAT (quantization-aware training) con STE (straight-through estimator) en base ternaria y transformada de Hadamard. El identificador de arquitectura `prism_hadamard_qwen35` sugiere una base derivada de la familia Qwen 3.5, aunque la model card no lo confirma explícitamente. Los pesos se distribuyen en `model.safetensors` junto con un directorio `runtime/` que contiene utilidades específicas para el manejo de la base Hadamard.

No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La model card menciona que los pesos incorporan la identidad de Zen 6 y las capacidades agénticas de Hanzo MCP, lo que indica al menos una fase de post-entrenamiento orientada a instrucciones y tool calling. No se describe ninguna innovación adicional como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text).
- Llamadas a herramientas en formato `<tool_call>` compatibles con MCP (Model Context Protocol).
- Comportamiento agéntico orientado a flujos multi-paso mediante herramientas externas.
- Identidad de modelo definida (Zen 6), con respuestas sobre su propia naturaleza y capacidades.
- Ejecución nativa en Apple Silicon mediante MLX.
- Capacidades multilingües: no disponible.
- Modo de razonamiento extendido (thinking mode): no disponible.

## Casos de uso

- Agentes locales en Mac: el modelo puede ejecutarse íntegramente en un equipo Apple Silicon y actuar como cerebro de un agente que invoca herramientas MCP (sistemas de ficheros, APIs internas, bases de datos), gracias al soporte nativo de `<tool_call>`.
- Asistencia sobre capturas de pantalla y documentos: al ser image-text-to-text, permite extraer información de imágenes y mantener conversaciones de seguimiento sobre el contenido visual sin salir del dispositivo.
- Automatización de tareas de desarrollo en local: integrable en scripts y pipelines que necesiten razonamiento sobre código y llamadas a herramientas, aprovechando el runtime MLX y el bajo tamaño en disco (8,6 GB).
- Prototipado de productos multimodales sin GPU: investigadores y desarrolladores pueden validar flujos de visión-lenguaje en portátiles Mac antes de escalar a infraestructura dedicada.
- Privacidad y procesamiento offline: al no requerir servicios en la nube, resulta adecuado para entornos con datos sensibles donde el procesamiento debe permanecer en el dispositivo.
- Evaluación de cuantización ternaria: útil como referencia práctica para estudiar el impacto de pesos de 2 bits con base Hadamard en tareas multimodales y agénticas.
- Chat multimodal de escritorio: base para aplicaciones de asistente personal en macOS que combinen entrada de imágenes y conversación con contexto persistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Repositorio de 8,6 GB; los pesos en 2 bits ternarios reducen drásticamente el espacio frente a un modelo de 27B en FP16.
- Hardware objetivo declarado: Apple Silicon M1, M2, M3 y M4 Max.
- VRAM estimada: no disponible de forma explícita; el tamaño del repositorio sugiere que puede residir en memoria unificada de equipos con 16 GB o más, aunque no se confirma.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas de forma nativa por el formato MLX; requerirían conversión previa.
- Despliegue: librería MLX con `quickstart.py` incluido y runtime propio (`runtime/vision_artifact.py`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zen 6 (27B) MLX 2-bit | 27,36B | no disponible | MLX safetensors 2-bit | Apache-2.0 | Hugging Face (`zenlm/zen6-mlx`) |
| Alternativas de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables directos en la documentación proporcionada; la comparativa queda pendiente de datos verificables.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad.
- Riesgo de alucinación inherente a modelos generativos; no se han publicado métricas de fiabilidad.
- Idiomas soportados no declarados: no se puede garantizar calidad fuera del idioma principal de entrenamiento, que tampoco se especifica.
- Longitud de contexto no disponible, lo que impide planificar cargas con ventanas largas.
- La cuantización ternaria de 2 bits puede degradar la precisión frente al modelo original en tareas de razonamiento matemático o código; no hay benchmarks que lo cuantifiquen.
- Formato MLX limita el despliegue a ecosistema Apple; no hay soporte documentado para CUDA, ROCm ni servidores de inferencia estándar.
- Sin descargas ni validación comunitaria en el momento de la publicación: el modelo no ha sido contrastado de forma independiente.
- Aunque la licencia Apache-2.0 permite uso comercial, deben conservarse los avisos del fichero `NOTICE` y la atribución a Hanzo AI y Zen LM.
- El soporte de tool calling depende del formato `<tool_call>` y del ecosistema MCP; su fiabilidad en producción no está medida.

## Enlaces

- Hugging Face: https://huggingface.co/zenlm/zen6-mlx
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
