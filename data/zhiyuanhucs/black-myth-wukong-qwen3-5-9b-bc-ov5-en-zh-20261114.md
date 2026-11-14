# zhiyuanhucs/black-myth-wukong-qwen3.5-9b-bc-ov5-en-zh-20261114

## Resumen

wukong es un ajuste fino completo (full fine-tuning) del modelo base Qwen3.5-9B, desarrollado por el usuario zhiyuanhucs y publicado en Hugging Face bajo el identificador `black-myth-wukong-qwen3.5-9b-bc-ov5-en-zh-20261114`. Se trata de un modelo vision-language (VLM) especializado en el dominio del videojuego Black Myth: Wukong, entrenado sobre el checkpoint Qwen3.5-9B con datos de juego y una selección de datos multimodales OneVision en inglés y chino. El modelo combina capacidades de comprensión visual y generación de texto orientadas a contenido de gaming.

El entrenamiento se realizó con Megatron sobre 32 GPU H200, con un batch global de 256 y una longitud de contexto máxima de 131.072 tokens, empleando paralelismo tensorial de 4 y paralelismo de datos de 8. El run de origen se identifica como `wukong3_ov_en5_zh5_qwen35_gbs256_20261111`, con una composición de datos de aproximadamente 100% del juego más un 5% seleccionado de OneVision en inglés y otro 5% en chino.

La relevancia de este modelo es acotada y experimental: se publica como checkpoint nativo de Megatron (no como safetensors de Transformers), con descargas y likes nulos en el momento de la consulta, licencia no especificada y sin model card con benchmarks. Es un artefacto de investigación más que un modelo listo para producción, y requiere conversión o un loader específico (ms-swift/Megatron) para su uso en inferencia con Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3.5-9B, ajuste fino completo) |
| Parametros totales | 9B (según el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (max context del entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés y chino (datos OneVision en EN/ZH); no se detalla cobertura adicional |
| Licencia | no disponible |
| Formato de pesos | checkpoints nativos de Megatron (mcore/), no safetensors de Transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer vision-language, y se somete a un ajuste fino completo (no LoRA ni adaptadores) usando Megatron. El run de entrenamiento `wukong3_ov_en5_zh5_qwen35_gbs256_20261111` emplea un batch global de 256, contexto máximo de 131.072 tokens, tensor parallel de 4 y data parallel de 8 sobre 32 GPU H200. La composición de datos es 100% del juego Black Myth: Wukong más un 5% seleccionado de OneVision en inglés y un 5% seleccionado de OneVision en chino, lo que sugiere un sesgo fuerte hacia el dominio del videojuego con un aporte minoritario de datos multimodales generales para preservar capacidades visuales y multilingües.

La publicación incluye checkpoints nativos de Megatron bajo `mcore/`, con estado de optimizador, RNG y cursor de datos, lo que permite reanudar el entrenamiento pero no la inferencia directa con Transformers. Las ramas `main` y `epoch-3` contienen el modelo final de tres pasadas; `epoch-1` es un checkpoint de una pasada reentrenado de forma independiente y su publicación queda pendiente de verificación. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, ni detalles sobre RLHF/DPO.

## Capacidades

- Generación de texto y comprensión de imágenes propias de un VLM Qwen3.5-9B, orientadas a contenido del videojuego Black Myth: Wukong.
- Procesamiento multimodal inglés-chino, gracias a la mezcla de datos OneVision en ambos idiomas.
- Contexto largo de hasta 131.072 tokens, adecuado para secuencias extensas de texto o múltiples imágenes.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso agéntico.
- No se documentan modos especiales como thinking mode, audio o vídeo.
- Capacidades multilingües limitadas a lo indicado (EN/ZH); no se detalla cobertura adicional.

## Casos de uso

- Asistencia a jugadores de Black Myth: Wukong: el modelo puede responder preguntas sobre mecánicas, jefes, objetos y rutas del juego a partir de capturas de pantalla, aprovechando el ajuste fino sobre datos del título y su contexto de 131.072 tokens para mantener conversaciones largas con historial visual.
- Análisis de capturas y guías visuales: dado su entrenamiento con imágenes del juego, puede describir escenas, identificar elementos de la interfaz y generar texto explicativo en inglés o chino para comunidades de jugadores.
- Generación de contenido para comunidades: redacción de guías, descripciones de builds o resúmenes de partidas en EN/ZH, apoyándose en el conocimiento inducido del dominio.
- Moderación y etiquetado de contenido de gaming: clasificación y descripción de imágenes de partidas para plataformas que necesiten metadatos automáticos en inglés y chino.
- Investigación en ajuste fino multimodal: sirve como caso de estudio de full fine-tuning con Megatron sobre 32 H200, útil para reproducir recetas de entrenamiento a gran escala y comparar con adaptadores.
- Base para experimentos de dominio específico: al conservar checkpoints con estado de optimizador, puede reutilizarse para continuar el entrenamiento con datos adicionales del juego o de otros títulos, siempre que se disponga del loader adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia orientativa para un modelo de 9B en precisión completa, se requerirían del orden de 18-20 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits o 4 bits bajaría sustancialmente, pero no se confirman formatos soportados.
- GPU recomendadas: el entrenamiento se realizó en 32 H200; para inferencia no se especifican GPU recomendadas.
- Compatibilidad con GPU de consumo: no confirmada; dependería de la conversión a safetensors/GGUF, que no se documenta.
- Opciones de despliegue: el autor indica que los checkpoints nativos de Megatron requieren el loader original de ms-swift/Megatron o una conversión previa antes de la inferencia con Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| wukong (este modelo) | 9B | 131.072 | no disponible | Megatron nativo | Ajuste fino de dominio gaming, sin benchmarks |
| Qwen3.5-9B (base) | 9B | no disponible en esta ficha | no disponible | safetensors (habitual) | Modelo base del que deriva; capacidades generales |
| Alternativas VLM de ~9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Sesgo de dominio: el entrenamiento está dominado por datos de Black Myth: Wukong (100% del juego frente a un 5% de OneVision EN y 5% ZH), lo que puede degradar el rendimiento en tareas generales ajenas al videojuego.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad; al ser un ajuste fino de dominio sin benchmarks, la fiabilidad factual no está verificada.
- Licencia no especificada: no se indica licencia, por lo que el uso comercial es incierto y requiere contactar con el autor o consultar la model card actualizada.
- Formato no estándar: los checkpoints son nativos de Megatron (mcore/) e incluyen estado de optimizador, RNG y cursor de datos; no son safetensors de Transformers y requieren conversión o loader específico.
- Publicación incompleta: el autor advierte que las subidas incompletas no deben tratarse como listas y que debe consultarse `PUBLICATION_VERIFIED.json`; la rama `epoch-1` está pendiente de verificación.
- Idiomas limitados: solo se documentan inglés y chino; no hay evidencia de soporte para castellano u otros idiomas.
- Sin validación externa: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni resultados de benchmarks.

## Enlaces

- Hugging Face: https://huggingface.co/zhiyuanhucs/black-myth-wukong-qwen3.5-9b-bc-ov5-en-zh-20261114
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
