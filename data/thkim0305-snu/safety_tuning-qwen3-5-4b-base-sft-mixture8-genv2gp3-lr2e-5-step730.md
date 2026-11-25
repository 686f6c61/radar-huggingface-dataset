# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step730

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step730 es un checkpoint de ajuste fino supervisado (SFT) de parametros completos sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El modelo está orientado a la alineación de seguridad: se entrena sobre trayectorias destiladas de un profesor de mayor tamaño (Qwen/Qwen3.8-27B) para que el modelo pequeño reproduzca respuestas seguras, razonamientos y llamadas a herramientas en escenarios sensibles.

Se trata del checkpoint final de una ejecución de 2 épocas (730 actualizaciones del optimizador) sobre un conjunto de datos de seguridad denominado "mixture-8", compuesto por 46.626 trayectorias derivadas de 11.757 prompts. La arquitectura es la del modelo base Qwen3.5, un transformer multimodal con torre de visión y cabeza MTP (multi-token prediction), aunque en este ajuste solo se ha entrenado el modelo de lenguaje: la torre de visión y la cabeza MTP conservan los pesos originales del base.

Su relevancia radica en que demuestra un pipeline reproducible de safety tuning sobre un modelo de 4B con receta detallada (Slime + Megatron-LM, bf16 con estado del optimizador en fp32), útil para investigadores que quieran replicar o adaptar la alineación de seguridad en modelos pequeños. El contexto de entrenamiento es de 32.768 tokens y la licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP; solo se entrena el modelo de lenguaje |
| Parametros totales | 4.659.865.088 (~4,66B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`), un transformer multimodal de tipo `Qwen3_5ForConditionalGeneration`. El ajuste es SFT de parametros completos sobre trayectorias generadas por un profesor (Qwen/Qwen3.8-27B, snapshot `1d4bf0f2ff60`), con pérdida calculada sobre el razonamiento, la respuesta final y las llamadas a herramientas. Se usó el framework Slime junto con Megatron-LM, con cómputo en bf16 y estado del optimizador en fp32. El prompt del estudiante emplea la plantilla nativa de chat del modelo Base, con system prompt "You are a helpful assistant." y thinking activado, sin Model Spec.

El conjunto de datos "mixture-8" contiene 46.626 trayectorias procedentes de 11.757 prompts, distribuidas en ocho fuentes: star1_gp3 (3.998), star_benign_v2 (3.651), agentalign_harmful (7.919), agentalign_benign (7.734), codesafetybench (3.598), magicoder (3.838), difficult_advice (7.905) y wildjailbreak_benign (7.983). El profesor generó cuatro respuestas muestreadas por prompt y se conservaron todas las válidas. La receta usa learning rate pico de 2e-05 con warmup lineal del 10 % y decaimiento coseno hasta 4e-06, Adam con betas [0.9, 0.95], eps 1e-08, weight decay 0.1 y grad clip 1.0. El contexto de entrenamiento es de 32.768 tokens, descartando por completo las trayectorias más largas (nunca se truncan). El entrenamiento se ejecutó en 2x NVIDIA RTX PRO 6000 Blackwell con tensor parallel 2. Los pesos se exportaron desde un checkpoint Megatron torch_dist (`iter_0000729`) mediante `safety_tuning.hf_export`, re-fusionando las proyecciones GDN y copiando los pesos de visión y MTP del base.

## Capacidades

- Generación de texto conversacional y razonamiento con modo thinking activable (`enable_thinking=True`).
- Capacidades multimodales heredadas del base (image-text-to-text): el modelo carga la torre de visión, aunque esta no se ha entrenado en este ajuste.
- Llamadas a herramientas (tool calling / function calling): la pérdida de entrenamiento incluye las llamadas a herramientas de las trayectorias del profesor.
- Comportamiento orientado a seguridad: respuestas alineadas en escenarios de riesgo (contenido dañino, jailbreaks, consejo difícil, seguridad de código).
- Razonamiento multi-paso y uso en entornos agénticos, derivado de las fuentes agentalign_harmful y agentalign_benign.
- Capacidades de generación de código y seguridad de código (fuentes codesafetybench y magicoder).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Moderación y respuesta segura en asistentes conversacionales: el modelo puede gestionar diálogos multi-turno de hasta 32.768 tokens con respuestas alineadas ante prompts sensibles, gracias al entrenamiento sobre wildjailbreak_benign y agentalign_harmful.
- Filtrado y reescritura de contenido dañino: útil como capa de seguridad que reformula o rechaza peticiones de riesgo, entrenado específicamente sobre trayectorias de seguridad destiladas.
- Asistentes agénticos con tool calling: puede ejecutar flujos multi-paso con llamadas a herramientas, adecuado para pipelines donde se requiere razonamiento estructurado y respuestas seguras.
- Revisión de seguridad de código: entrenado con codesafetybench y magicoder, puede señalar prácticas inseguras o generar código que evite patrones peligrosos.
- Investigación en alineación y safety tuning: sirve como referencia reproducible de una receta completa (Slime + Megatron-LM) para estudiar el efecto del SFT de seguridad en modelos de 4B.
- Destilación de modelos mayores: útil para estudiar cómo un profesor de 27B transfiere comportamiento seguro a un estudiante de 4B, con checkpoints intermedios disponibles (actualizaciones 91, 183, 274, 365, 456, 548, 639 y 730).
- Despliegue en hardware de gama media: con ~4,66B parámetros en bf16 (unos 9,3 GB de pesos), puede servirse en GPUs consumer de gama alta para prototipos de asistentes seguros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, unos 9,3 GB solo para pesos; con overhead de activaciones y KV cache, se recomienda al menos 16-24 GB para contextos largos.
- GPU recomendadas: el entrenamiento se realizó en 2x NVIDIA RTX PRO 6000 Blackwell (tensor parallel 2). Para inferencia, una RTX 4090 (24 GB) o A100/H100 son adecuadas; en bf16 una GPU de 16 GB puede ser justa para contextos largos.
- Cabe en GPU consumer: sí, en GPUs de gama alta con 24 GB (RTX 3090/4090) en bf16; con cuantización a 8 o 4 bits cabría en GPUs de 12-16 GB (aunque no se publican pesos cuantizados).
- Opciones de despliegue: transformers (receta oficial con `Qwen3_5ForConditionalGeneration`), vLLM, TGI u Ollama/llama.cpp previa conversión a GGUF (no se proporcionan pesos GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8 (este) | ~4,66B | 32.768 | Apache 2.0 | SFT de seguridad destilado de Qwen3.8-27B; multimodal heredado |
| Qwen/Qwen3.5-4B-Base | ~4,66B | no disponible en la información | Apache 2.0 | Modelo base sin ajuste de seguridad; referencia directa |
| Qwen/Qwen3.8-27B | ~27B (no confirmado) | no disponible | no disponible | Profesor usado para destilar las trayectorias |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint intermedio/final de un experimento de safety tuning, con solo 27 descargas y 0 likes; no hay evidencia de validación en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasa de alucinación.
- Sesgos conocidos: no disponibles; el entrenamiento sobre trayectorias de un profesor puede heredar los sesgos de Qwen3.8-27B.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingüe equilibrado.
- La torre de visión y la cabeza MTP no se entrenaron: las capacidades multimodales son las del base sin ajuste de seguridad, lo que puede generar respuestas no alineadas en entradas de imagen.
- Contexto limitado a 32.768 tokens; las trayectorias más largas se descartaron en entrenamiento, por lo que el comportamiento más allá de esa longitud no está garantizado.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar la licencia del modelo base y validar el comportamiento de seguridad antes de desplegarlo.
- No se publican pesos cuantizados ni resultados de benchmarks; cualquier afirmación de rendimiento carece de respaldo empírico en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step730
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
