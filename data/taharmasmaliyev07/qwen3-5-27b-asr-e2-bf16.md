# taharmasmaliyev07/Qwen3.5-27B-ASR-E2-BF16

## Resumen

Qwen3.5-27B-ASR-E2-BF16 es un ajuste fino (fine-tuning) publicado por el usuario taharmasmaliyev07 sobre un modelo de la familia Qwen3.5, según los metadatos del repositorio. El modelo se presenta con el pipeline `image-text-to-text`, lo que indica que conserva capacidades multimodales de entrada (imagen y texto) heredadas del modelo base, aunque la model card no detalla el alcance exacto del ajuste. El identificador "ASR-E2" sugiere un entrenamiento orientado a reconocimiento automático del habla (ASR), pero no se aporta documentación que lo confirme.

El repositorio declara 27.781.427.952 parámetros en formato safetensors (aproximadamente 27,8 mil millones) y un tamaño total de 56,1 GB, coherente con pesos en BF16. La licencia es Apache 2.0 y el único idioma declarado es el inglés. Se trata de un modelo derivado de un modelo base del mismo autor, entrenado con Unsloth y TRL según la model card, pero sin publicación de detalles de dataset, hiperparámetros ni evaluación.

La relevancia de esta ficha es limitada: el modelo tiene 0 descargas y 0 likes, no incluye benchmarks ni documentación técnica sustancial, y su model card es una plantilla genérica de Unsloth. Cualquier evaluación en producción debe tratarse como preliminar hasta que el autor publique información verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.5, transformer multimodal presumiblemente; no confirmado en la model card) |
| Parámetros totales | 27.781.427.952 (~27,8 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16; el nombre del repo indica BF16) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna del modelo. Los tags del repositorio (`qwen3_5`, `image-text-to-text`, `transformers`) indican que se trata de un modelo de la familia Qwen3.5 con capacidad de procesar entradas de imagen y texto, pero no se detalla si emplea atención completa, atención lineal, decodificación especulativa ni ningún otro mecanismo concreto. El número de parámetros (27,8 B) y el tamaño del repositorio (56,1 GB) son compatibles con pesos en BF16 sin cuantizar.

Respecto al entrenamiento, la model card únicamente indica que el modelo fue entrenado "2x faster with Unsloth and Huggingface's TRL library", es decir, que se emplearon dichas herramientas para el ajuste fino. No se publican el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni los hiperparámetros utilizados. El modelo base declarado es el propio repositorio (`taharmasmaliyev07/Qwen3.5-27B-ASR-E2-BF16`), lo que impide reconstruir la cadena de derivación a partir de los metadatos disponibles.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` y el pipeline declarado.
- Procesamiento de entradas imagen-texto (`image-text-to-text`), presumiblemente heredado del modelo base Qwen3.5; el alcance real del ajuste no está documentado.
- Compatibilidad con `text-generation-inference` y con la librería `transformers`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés.
- Modo "thinking", visión, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede desplegarse con `transformers` o TGI para experimentar con diálogo multi-turno, aunque sin datos de contexto ni benchmarks que garanticen calidad en producción.
- Investigación sobre ajuste fino con Unsloth/TRL: al ser un modelo derivado entrenado con estas herramientas, sirve como referencia para reproducir pipelines de fine-tuning de sub-2x mil millones de parámetros en BF16.
- Experimentación multimodal controlada: el pipeline `image-text-to-text` permite probar entradas imagen-texto en entornos de laboratorio, verificando empíricamente si el ajuste conserva o degrada dicha capacidad.
- Evaluación comparativa de modelos derivados: útil como caso de estudio sobre la trazabilidad y documentación de fine-tunes publicados en Hugging Face con información escasa.
- Base para nuevos ajustes: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para fine-tunes adicionales, siempre que se valide primero su comportamiento.
- Despliegue interno de bajo riesgo: en tareas no críticas y con supervisión humana, puede emplearse para generar borradores o clasificaciones simples en inglés, dado su tamaño manejable en infraestructura con GPU de 80 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 56 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica requiere GPUs de 80 GB (A100 80GB, H100 80GB) o múltiples GPUs.
- Cuantización a 8 bits: ~28 GB de pesos, viable en una RTX 4090 de 24 GB solo con cuantizaciones más agresivas o con offloading.
- Cuantización a 4 bits: ~14 GB de pesos, podría caber en una RTX 4090 de 24 GB o RTX 3090, con margen limitado para contexto largo.
- GPUs recomendadas: A100 80GB o H100 80GB para BF16; RTX 4090/3090 para cuantizaciones de 4-8 bits.
- Opciones de despliegue: `transformers`, `text-generation-inference` (declarado en los tags); vLLM, llama.cpp u Ollama no están confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-27B-ASR-E2-BF16 (este) | ~27,8 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-VL-32B (referencia de la familia Qwen multimodal) | ~32 B | no disponible en esta ficha | Apache 2.0 (según familia) | Hugging Face |
| Gemma 3 27B (referencia de tamaño similar) | ~27 B | no disponible en esta ficha | Términos Gemma | Hugging Face |

Nota: los datos de los modelos comparativos no provienen de la información proporcionada en esta búsqueda y deben verificarse en sus respectivas model cards antes de usarse en una decisión técnica.

## Limitaciones y advertencias

- Documentación insuficiente: la model card es una plantilla genérica de Unsloth sin dataset, hiperparámetros, evaluación ni descripción del ajuste.
- Trazabilidad dudosa: el campo `base_model` apunta al propio repositorio, por lo que no se puede verificar de qué modelo Qwen3.5 original deriva.
- Sin benchmarks: no hay evidencia publicada de calidad, lo que impide comparar con alternativas de forma rigurosa.
- Idioma limitado: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: no evaluado; al no haber benchmarks ni pruebas de fidelidad, debe asumirse un riesgo estándar de los modelos generativos.
- Capacidad multimodal incierta: el pipeline declara `image-text-to-text`, pero no se confirma que el ajuste haya preservado la visión.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los términos del modelo base original (Qwen3.5) sean compatibles, ya que la cadena de derivación no está documentada.
- Sin adopción: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad.
- Nombre "ASR-E2" sin confirmar: sugiere reconocimiento de voz, pero no hay documentación que lo respalde; no debe asumirse capacidad de audio.

## Enlaces

- Hugging Face: https://huggingface.co/taharmasmaliyev07/Qwen3.5-27B-ASR-E2-BF16
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Repositorio de Qwen (familia base, referencia general): https://github.com/QwenLM/Qwen
