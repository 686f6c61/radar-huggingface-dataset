# zenlm/zen6-nano-9b-mlx

## Resumen

Zen 6 Nano (9B) es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por Hanzo AI y Zen LM, distribuido en formato MLX de 2 bits (ternario con transformada de Hadamard) para su ejecución nativa en Apple Silicon. Con 9.410.903.280 parámetros totales y un repositorio de 3,6 GB, el modelo empaqueta pesos cuantizados de forma agresiva junto con una torre de visión en FP16, lo que permite desplegar un sistema multimodal en equipos con memoria unificada de gama alta (M1 a M4 Max) sin necesidad de GPUs dedicadas.

La propuesta técnica se apoya en tres pilares: cuantización ternaria de 2 bits con entrenamiento consciente de cuantización (QAT) y estimador de gradiente recto (STE) en base Hadamard, una torre de visión que se mantiene en FP16 para preservar calidad perceptiva, y capacidades agénticas mediante el protocolo MCP (Model Context Protocol) de Hanzo con emisión de etiquetas `<tool_call>`. El modelo se publica bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en productos derivados.

Su relevancia actual reside en la combinación de multimodalidad, tool calling y un tamaño de 9B comprimido a 2 bits en un formato optimizado para el silicio de Apple. Esto lo sitúa en un nicho concreto: desarrollo local en macOS, prototipado de agentes con acceso a herramientas y experimentación con cuantización extrema sin infraestructura de centro de datos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión + modelo de lenguaje); base denominada `prism_hadamard_qwen35` según los tags del repositorio |
| Parámetros totales | 9.410.903.280 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2 bits ternario con transformada de Hadamard (afín), QAT con STE; torre de visión en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), librería `mlx`; artefactos auxiliares en `runtime/` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer multimodal con dos componentes diferenciados: un modelo de lenguaje de aproximadamente 9B parámetros y una torre de visión que procesa imágenes en FP16. La innovación principal es el esquema de cuantización: los pesos del modelo de lenguaje se almacenan en formato ternario de 2 bits dentro de una base de Hadamard, un enfoque que rota la representación de pesos para reducir el error de cuantización antes de aplicar la rejilla ternaria. El autor indica que se empleó entrenamiento consciente de cuantización (QAT) con estimador de gradiente recto (STE) durante el post-entrenamiento, de modo que los pesos publicados corresponden a los parámetros exactos tras ese proceso, no a una cuantización posterior de un modelo en precisión completa.

La identificación `prism_hadamard_qwen35` en los tags sugiere una base derivada de la familia Qwen 3.5 con una transformación Hadamard propia, aunque la model card no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal. La integración de Hanzo MCP y la emisión de `<tool_call>` indican un post-entrenamiento orientado a comportamiento agéntico, pero no se aportan métricas de ese proceso.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y respuesta en texto (pipeline `image-text-to-text`): descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Tool calling mediante el protocolo MCP de Hanzo, con emisión estructurada de etiquetas `<tool_call>`.
- Comportamiento agéntico de múltiples pasos, orientado a encadenar llamadas a herramientas.
- Identidad de modelo Zen 6 integrada en los pesos (respuestas sobre sí mismo).
- Ejecución nativa en Apple Silicon mediante MLX, con artefactos de runtime para carga programática del modelo visión-lenguaje.
- Capacidades multilingües: no disponibles (no se especifican idiomas en la información proporcionada).

## Casos de uso

- Asistente local en macOS con acceso a herramientas: el modelo puede gestionar conversaciones y emitir llamadas `<tool_call>` compatibles con servidores MCP, lo que permite construir agentes que consulten APIs, ficheros o servicios externos sin salir del portátil.
- Análisis de capturas y documentos visuales en local: gracias a la torre de visión en FP16, se puede usar para extraer información de imágenes, diagramas o interfaces de usuario en flujos de trabajo donde la privacidad impide enviar datos a la nube.
- Prototipado de agentes multi-paso en Apple Silicon: su formato MLX de 2 bits permite iterar rápidamente sobre lógicas de razonamiento y orquestación de herramientas en un Mac con memoria unificada, sin coste de GPU.
- Automatización de soporte técnico con contexto visual: combinación de conversación multi-turno y comprensión de imágenes para diagnosticar problemas a partir de capturas de pantalla del usuario.
- Evaluación de cuantización extrema: como referencia práctica de un modelo 9B en 2 bits ternarios con Hadamard, sirve para estudiar la degradación de calidad frente a versiones en FP16 o de 4 bits en tareas de visión y tool calling.
- Integración en pipelines de desarrollo con CI en macOS: el runtime incluido (`runtime/vision_artifact.py`) permite cargar el modelo de forma programática y ejecutar pruebas automatizadas de comportamiento agéntico en runners de Apple.
- Experimentación con MCP en entornos educativos: al ser Apache-2.0 y ejecutable en hardware de consumo, facilita la enseñanza de protocolos de herramientas y agentes sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 3,6 GB, por lo que la inferencia requiere al menos unos 4-6 GB de memoria unificada, con margen adicional para el contexto y la torre de visión en FP16.
- GPU recomendadas: Apple Silicon M1, M2, M3 y M4 Max, según la model card; el formato MLX no está pensado para GPUs NVIDIA o AMD.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no es desplegable en GPUs consumer convencionales por el formato MLX.
- Opciones de despliegue: MLX (librería nativa), script `quickstart.py` incluido y carga programática mediante `runtime/vision_artifact.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| Zen 6 Nano 9B MLX | 9,41B | no disponible | 2 bits ternario Hadamard + visión FP16 | Apache-2.0 | Apple Silicon (MLX) |
| Qwen 2.5 VL 7B | 7B aprox. | no disponible en esta ficha | FP16, AWQ, GPTQ | Apache-2.0 (variantes) | GPU y CPU |
| Llama 3.2 11B Vision | 11B aprox. | no disponible en esta ficha | FP16, cuantizaciones comunitarias | Llama 3.2 Community License | GPU y CPU |
| Gemma 3 12B | 12B aprox. | no disponible en esta ficha | FP16, cuantizaciones comunitarias | Gemma Terms of Use | GPU y CPU |

La comparación directa es limitada porque la información proporcionada no incluye benchmarks ni contexto de Zen 6 Nano. Frente a alternativas multimodales de tamaño similar, su diferenciador es la cuantización ternaria de 2 bits y la optimización para MLX, mientras que los modelos citados ofrecen ecosistemas de despliegue más amplios y licencias con condiciones adicionales en algunos casos.

## Limitaciones y advertencias

- La cuantización ternaria de 2 bits puede degradar la calidad en tareas de razonamiento complejo, matemáticas o generación de código frente a versiones en mayor precisión; no se aportan métricas que cuantifiquen esa pérdida.
- No se especifican los idiomas soportados, por lo que el rendimiento fuera del inglés es incierto.
- No se documenta la longitud de contexto, lo que impide planificar cargas de trabajo con documentos largos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no hay evaluaciones publicadas de fidelidad factual.
- Sesgos conocidos: no disponibles; al no detallarse la composición del dataset, no es posible evaluar sesgos de dominio.
- La licencia Apache-2.0 permite uso comercial, pero el aviso NOTICE debe conservarse según indica la model card.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a GPUs NVIDIA sin reconversión, que no se ofrece.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-15), lo que indica una publicación reciente sin validación comunitaria.
- La dependencia de MCP de Hanzo para tool calling puede requerir infraestructura adicional compatible con ese protocolo.

## Enlaces

- Hugging Face: https://huggingface.co/zenlm/zen6-nano-9b-mlx
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
