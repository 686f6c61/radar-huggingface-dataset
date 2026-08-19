# t0rr3sp3dr0/Qwen3.8-27B-MLX-MTP-mxfp8

## Resumen

Qwen3.8-27B-MLX-MTP-mxfp8 es una conversión del modelo Qwen/Qwen3.8-27B al formato MLX con cuantización de 8 bits (mxfp8), realizada por el usuario t0rr3sp3dr0. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un LLM denso multimodal de 27B parámetros con arquitectura híbrida de atención (lineal en 48 de sus 64 capas), torre de visión integrada, cabezal de decodificación especulativa MTP (Multi-Token Prediction) y una ventana de contexto nativa de 262.144 tokens, ampliable a 1M.

Esta conversión específica está optimizada para ejecutarse en hardware Apple Silicon mediante la librería MLX, lo que permite desplegar el modelo en Macs con memoria unificada suficiente. La cuantización mxfp8 reduce el tamaño del repositorio a 30,9 GB, lo que lo hace viable en equipos de gama alta sin necesidad de GPUs dedicadas. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en que combina capacidades multimodales (imagen y vídeo), razonamiento agéntico y generación de código en un formato accesible para hardware local, algo poco común en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (atención lineal en 48/64 capas) con torre de visión y cabezal MTP |
| Parametros totales | 9.098.097.392 (cuantizados mxfp8; el modelo base tiene 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1.048.576 |
| Tipos de cuantizacion | mxfp8 (8 bits) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8-27B soporta multilingüe, pero la ficha no especifica la lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura densa de 27B parámetros con un diseño híbrido de atención: 48 de sus 64 capas utilizan atención lineal (linear attention) para reducir el coste computacional en contextos largos, mientras que las 16 restantes mantienen atención completa (full attention). Esta combinación permite manejar ventanas de contexto de 262K tokens con un coste de memoria y cómputo significativamente menor que un transformer estándar.

Incluye además una torre de visión (vision tower) que le permite procesar imágenes y vídeo como entrada nativa, y un cabezal MTP (Multi-Token Prediction) integrado que actúa como draft head para decodificación especulativa, acelerando la generación de tokens. El modelo se entrenó con un enfoque multimodal, aunque los detalles exactos del dataset de entrenamiento (número de tokens, composición, fases de RLHF/DPO) no se detallan en la información disponible.

La conversión MLX-mxfp8 mantiene la arquitectura completa del modelo base, incluyendo el cabezal MTP, pero con los pesos cuantizados a 8 bits en formato mxfp8, optimizado para la aceleración por hardware de Apple Silicon.

## Capacidades

- Generación de texto y razonamiento complejo en tareas de oficina y automatización.
- Comprensión y generación de código, con buen rendimiento en tareas de programación (DeepSWE 42.2 en el modelo base).
- Entrada multimodal nativa: procesa imágenes y vídeo sin necesidad de adaptadores externos.
- Razonamiento agéntico y soporte para flujos de trabajo multi-paso (Terminal Bench 73.0 en el modelo base).
- Automatización de tareas de escritorio y navegación web (OSWorld 84.3 en el modelo base).
- Decodificación especulativa mediante cabezal MTP integrado, lo que acelera la inferencia.
- Soporte de tool calling y function calling (heredado del modelo base).
- Capacidades multilingües (heredadas del modelo base, aunque no se detalla la lista exacta).

## Casos de uso

- Automatización de oficina: el modelo puede generar documentos, resumir correos, redactar informes y gestionar tareas administrativas complejas con múltiples pasos, gracias a su razonamiento agéntico y su ventana de contexto de 262K tokens que permite procesar documentos extensos completos.
- Asistente de programación local: con su buen rendimiento en tareas de código (DeepSWE 42.2 en el modelo base), puede usarse como copiloto de desarrollo en entornos donde no se permite enviar código a la nube. Su soporte de tool calling permite integrarlo con editores y CLIs.
- Agente de automatización de escritorio: el modelo base obtiene 84.3 en OSWorld, lo que indica capacidad para controlar interfaces gráficas y ejecutar tareas como organizar archivos, rellenar formularios o gestionar calendarios.
- Análisis de documentos con imágenes: al aceptar entrada de imagen y vídeo, puede extraer información de capturas de pantalla, diagramas, gráficos o vídeos de demostración para generar documentación o responder preguntas sobre ellos.
- Chatbot de atención al cliente con contexto largo: la ventana de 262K tokens permite mantener conversaciones muy extensas con historial completo del cliente, sin perder información de interacciones previas.
- Despliegue en Mac como estación de trabajo de IA: al estar cuantizado en MLX-mxfp8, puede ejecutarse en un Mac Studio o MacBook Pro con 64 GB o más de memoria unificada, ofreciendo un entorno de IA local sin dependencia de GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión MLX-mxfp8. Los datos del modelo base Qwen3.8-27B reportados en las fuentes consultadas son:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE (coding) | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |
| MathVision | Evaluado con prompt fijo (resultado no especificado) |

Estos datos corresponden al modelo original sin cuantizar y pueden variar en la versión MLX-mxfp8. No se dispone de comparativas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 30,9 GB, por lo que se recomienda un mínimo de 32 GB de memoria unificada en Apple Silicon, siendo 64 GB lo recomendado para trabajar con comodidad y dejar margen para el sistema operativo y otras aplicaciones.
- GPUs compatibles: no requiere GPU dedicada; funciona en Apple Silicon (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max/Ultra). No está pensado para GPUs NVIDIA o AMD.
- Opciones de despliegue: al ser formato MLX, se puede ejecutar con mlx-lm, MLX-LM server, o integrarse en aplicaciones que usen la librería MLX. No es compatible directamente con vLLM, llama.cpp u Ollama sin conversión adicional.
- Latencia y throughput: no se dispone de datos medidos para esta conversión concreta. El cabezal MTP integrado debería acelerar la generación respecto a un modelo sin decodificación especulativa, pero no hay cifras publicadas.
- Alternativas de despliegue: si se necesita usar en GPUs CUDA, habría que partir del modelo base Qwen/Qwen3.8-27B en formato original.

## Comparativa con modelos similares

La comparativa se realiza con el modelo base y otras conversiones MLX del mismo modelo:

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (ext. 1M) | FP16/BF16 | Apache 2.0 | safetensors |
| Qwen3.8-27B-MLX-MTP-mxfp8 (este) | 9,1B cuantizados | 262K (ext. 1M) | mxfp8 | Apache 2.0 | safetensors (MLX) |
| mlx-community/Qwen3.8-27B-MTP-4bit | 27B (4-bit) | 262K (ext. 1M) | 4-bit | Apache 2.0 | safetensors (MLX) |

No se dispone de información sobre modelos comparables de otros fabricantes con el mismo perfil (multimodal, 27B, contexto largo, licencia permisiva) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización mxfp8 puede introducir una degradación leve en la calidad de las respuestas respecto al modelo en FP16/BF16, especialmente en tareas de razonamiento matemático complejo o generación de código con lógica intrincada.
- Los benchmarks citados (DeepSWE, Terminal Bench, OSWorld) corresponden al modelo base sin cuantizar; el rendimiento real de esta conversión puede ser inferior.
- El modelo base es multimodal, pero esta conversión MLX no especifica si la torre de visión funciona correctamente tras la cuantización; conviene verificar el comportamiento con entradas de imagen antes de usarlo en producción.
- No se dispone de información sobre sesgos del modelo ni sobre su comportamiento en idiomas distintos del inglés. El modelo base de Qwen suele tener buen soporte de chino e inglés, pero el resto de idiomas puede ser menos robusto.
- Al estar optimizado exclusivamente para Apple Silicon, no es utilizable en infraestructura cloud estándar con GPUs NVIDIA sin una conversión previa a otro formato.
- El autor de esta conversión es un usuario independiente (t0rr3sp3dr0), no el equipo oficial de Qwen ni de MLX Community, por lo que el mantenimiento y la validación pueden ser limitados.
- El modelo base puede alucinar en tareas de razonamiento agéntico multi-paso; se recomienda validación humana en flujos de automatización críticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/t0rr3sp3dr0/Qwen3.8-27B-MLX-MTP-mxfp8
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Conversión MLX 4-bit del mismo modelo: https://huggingface.co/mlx-community/Qwen3.8-27B-MTP-4bit
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
