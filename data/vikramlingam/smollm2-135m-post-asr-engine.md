# vikramlingam/SmolLM2-135M-Post-ASR-Engine

## Resumen

SmolLM2-135M-Post-ASR-Engine es un ajuste fino compacto del modelo HuggingFaceTB/SmolLM2-135M-Instruct, desarrollado por vikramlingam, que actúa como utilidad de formateo posterior a reconocimiento automático del habla (post-ASR). El problema que resuelve es la falta de puntuación, mayúsculas y estructura en las transcripciones brutas de ASR, transformándolas en texto limpio y organizado mediante tokens de tarea específicos. Su relevancia radica en ser un modelo ligero (135 millones de parámetros) que puede ejecutarse en dispositivos locales, incluido Apple Silicon, sin necesidad de infraestructura de servidor.

La arquitectura se basa en el transformer decoder de SmolLM2, con un ajuste fino mediante Weight-Decomposed Low-Rank Adaptation (DoRA) y enmascaramiento de pérdida en el prompt, entrenado con mlx-lm y fusionado en pesos independientes. El modelo soporta cuatro tareas de formateo: correo electrónico, viñetas, limpieza y puntuación, y paráfrasis neutral. La longitud de contexto no se especifica en la documentación disponible, aunque los ejemplos de uso sugieren ventanas cortas (1024 tokens en llama.cpp). Está disponible en formatos safetensors, GGUF y MLX, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (SmolLM2) |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (los ejemplos usan 1024 tokens) |
| Tipos de cuantizacion | GGUF Q4_K_M, safetensors (fp32), MLX |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de HuggingFaceTB/SmolLM2-135M-Instruct, un transformer decoder con 135 millones de parámetros. El ajuste fino se realizó con Weight-Decomposed Low-Rank Adaptation (DoRA), una variante de LoRA que descompone el peso en magnitud y dirección, aplicada sobre Apple Silicon mediante la librería mlx-lm. Se empleó enmascaramiento de pérdida en el prompt para que el modelo solo aprenda a generar la respuesta formateada, no el texto de entrada. Los pesos DoRA se fusionaron en los pesos completos del modelo, eliminando la necesidad de cargar adaptadores por separado.

El entrenamiento incluyó restricciones de estilo: se prohibieron muletillas conversacionales como "delve", "in summary" o "tapestry", así como el uso de rayas em (—, –). El modelo se entrena para reconocer cuatro tokens de tarea prefijados (`<|task:format_email|>`, `<|task:bullet_points|>`, `<|task:clean_punctuate|>`, `<|task:neutral_paraphrase|>`) que indican el tipo de formateo deseado. No se han publicado detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto: produce salidas de texto plano formateado a partir de transcripciones ASR brutas.
- Formateo de correos electronicos: convierte notas dictadas en un correo estructurado con linea de asunto y cuerpo.
- Extraccion de viñetas: resume reuniones o dictados en puntos accionables y concisos.
- Limpieza y puntuacion: restaura puntuacion, mayusculas, numeros y abreviaturas tecnicas en transcripciones sin formato.
- Parafraseo neutral: reescribe transcripciones verbosas o conversacionales en enunciados neutrales y concisos.
- Soporte de tool calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitado al ingles.
- Otras capacidades especiales: no incluye vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Transcripcion de reuniones: el modelo puede convertir la transcripcion cruda de una reunion de equipo en viñetas accionables, facilitando la generacion automatica de actas y seguimiento de tareas.
- Redaccion de correos por dictado: un usuario dicta una nota informal y el modelo la estructura en un correo con asunto y cuerpo, listo para enviar, ahorrando tiempo en la edicion manual.
- Limpieza de subtitulos generados por ASR: se puede aplicar a subtitulos automaticos para restaurar puntuacion y mayusculas, mejorando la legibilidad en videos o podcasts.
- Parafraseo de respuestas de asistentes de voz: las respuestas verbales largas se convierten en frases neutrales y directas, adecuadas para interfaces de texto o resumenes.
- Preprocesamiento de datos para entrenamiento: el modelo puede limpiar y normalizar grandes volumenes de transcripciones ASR antes de usarlas como datos de entrenamiento para otros modelos.
- Integracion en pipelines de automatizacion: gracias a su tamano reducido y soporte GGUF, puede ejecutarse en CPU o GPU modesta dentro de flujos de trabajo locales, por ejemplo con llama.cpp o mlx-lm, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (135M parametros), menos de 0,2 GB en cuantizacion Q4_K_M.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, GPU integrada (Apple Silicon) o cualquier GPU con al menos 1 GB de VRAM.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en Raspberry Pi con cuantizacion.
- Opciones de despliegue: mlx-lm en Apple Silicon, Transformers de Hugging Face, llama.cpp con GGUF, Ollama (si se convierte a formato compatible).
- Latencia y throughput estimados: no se han publicado mediciones oficiales; dado el tamano del modelo, se espera una latencia inferior a 100 ms por generacion en hardware moderno, con throughput de cientos de tokens por segundo en GPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos para formateo post-ASR con este enfoque de tokens de tarea. Como referencia, el modelo base SmolLM2-135M-Instruct es un modelo generalista de 135M parametros sin especializacion en formateo ASR, por lo que esta version ajustada ofrece capacidades mas precisas para ese dominio, aunque con menor versatilidad general. No hay datos publicados que permitan una comparacion cuantitativa con alternativas como Whisper (que es un modelo ASR, no de formateo) u otros ajustes finos de SmolLM2.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con datos en ingles, puede mostrar sesgos linguisticos y culturales propios de ese idioma.
- Riesgo de alucinacion: al ser un modelo de 135M, puede generar contenido inventado o incoherente, especialmente con entradas fuera del dominio de transcripciones ASR.
- Limitaciones de contexto: la longitud de contexto no esta documentada; los ejemplos sugieren ventanas cortas (1024 tokens), lo que limita el procesamiento de transcripciones largas de una sola vez.
- Limitaciones de idioma: solo soporta ingles; no se recomienda su uso con otros idiomas.
- Restricciones de licencia: licencia Apache 2.0 permite uso comercial, pero el modelo base SmolLM2-135M-Instruct tiene su propia licencia (Apache 2.0 tambien), por lo que no hay restricciones adicionales conocidas.
- Advertencia para produccion: el modelo esta disenado exclusivamente para tareas de formateo post-ASR; usarlo para otros propositos puede producir resultados poco fiables. Ademas, no se han publicado evaluaciones de robustez frente a transcripciones ruidosas o con errores graves.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vikramlingam/SmolLM2-135M-Post-ASR-Engine
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Blog de SmolLM: https://huggingface.co/blog/smollm
- Repositorio de SmolLM en GitHub: https://github.com/huggingface/smollm
- Implementacion de referencia de SmolLM2-135M: https://github.com/ankera-21/SmolLm2-135M
