# Thanu10/Arogya_finetuned_merged

## Resumen

Arogya_finetuned_merged es un ajuste fino (fine-tune) del modelo multimodal Gemma 3 4B Instruct, publicado por el usuario Thanu10 (Thanujaya Tennekoon) en Hugging Face. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/gemma-3-4b-it-unsloth-bnb-4bit`), se entrenó con la librería Unsloth y TRL, y posteriormente se fusionó (merge) dando lugar a un repositorio de safetensors de 8,6 GB con 4.300.079.472 parámetros. La pipeline declarada es `image-text-to-text`, por lo que conserva la naturaleza multimodal del modelo base (entrada de imagen y texto, salida de texto).

Su relevancia es limitada y de ámbito comunitario: el repositorio no incluye model card detallada, no documenta el dataset de ajuste, ni el procedimiento de entrenamiento, ni resultados de evaluación. A fecha de la información disponible acumula 0 descargas y 0 "likes", y no se ha publicado ningún benchmark. El nombre "Arogya" (salud, en sánscrito) sugiere un posible dominio de aplicación sanitario o de bienestar, pero esto no está confirmado en ninguna fuente.

Se trata, por tanto, de un artefacto derivado de Gemma 3 4B, útil únicamente si se necesita exactamente la especialización que el autor haya introducido; para cualquier uso en producción conviene partir del modelo base oficial o de un checkpoint con documentación y evaluación verificables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (familia Gemma 3); detalles específicos del fine-tune no disponibles |
| Parámetros totales | 4.300.079.472 (~4,3 mil millones) |
| Parámetros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | 128 000 tokens según la documentación de la familia Gemma 3; no confirmado en la model card de este fine-tune |
| Tipos de cuantización | No se listan cuantizaciones en el repositorio. El tamaño del repo (8,6 GB) es coherente con pesos en 16 bits (bf16/fp16); el modelo base de partida estaba cuantizado en 4 bits (bnb-4bit) |
| Idiomas soportados | `en` (inglés), único idioma declarado en la model card |
| Licencia | `apache-2.0` declarada por el autor; el modelo base Gemma 3 está sujeto a los términos de uso de Gemma de Google |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del fine-tune. Se sabe que deriva de Gemma 3 4B Instruct, un transformer decoder-only multimodal de la familia Gemma 3, que incorpora codificación de imágenes y una ventana de contexto de 128 000 tokens según la documentación pública de dicha familia. El pipeline declarado en Hugging Face es `image-text-to-text`, lo que confirma que el modelo acepta imágenes además de texto.

En cuanto al entrenamiento, la model card indica únicamente que el ajuste se realizó con Unsloth y la librería TRL de Hugging Face, y que el punto de partida fue la versión de 4 bits de Gemma 3 4B IT publicada por Unsloth. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO, SFT). Tampoco se documenta ninguna innovación técnica propia: el término "merged" del nombre indica que los adaptadores se fusionaron con los pesos base, lo que da como resultado un checkpoint monolítico listo para inferencia directa.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modo instruct de Gemma 3 4B.
- Procesamiento de entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Razonamiento de propósito general y respuesta a instrucciones, en la medida en que lo permita un modelo de 4,3 mil millones de parámetros.
- Capacidades multilingües: no declaradas. La model card solo indica inglés, aunque el modelo base Gemma 3 cubre más idiomas.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no hay evidencia de entrenamiento específico para agentes.
- Modo "thinking" o razonamiento extendido: no documentado.
- Capacidades de audio: no disponibles (Gemma 3 4B no incluye entrada de audio).

## Casos de uso

- Experimentación académica con fine-tunes multimodales: el modelo sirve como ejemplo reproducible de un pipeline Unsloth + TRL sobre Gemma 3 4B, útil para estudiar el flujo de cuantización, ajuste y fusión de pesos.
- Prototipado de asistentes de bienestar o salud en inglés: dado el nombre del modelo, podría emplearse como prueba de concepto para respuestas conversacionales sobre hábitos saludables, siempre con validación humana y sin uso clínico.
- Descripción de imágenes en inglés: al conservar la torre de visión del modelo base, puede generar texto a partir de fotografías para tareas de etiquetado o accesibilidad.
- Investigación sobre degradación por fine-tuning: comparar sus salidas frente al Gemma 3 4B IT original permite medir cuánto se ha desviado el ajuste del comportamiento base.
- Evaluación de pipelines de cuantización: sirve como sujeto de prueba para convertir safetensors a GGUF y medir la pérdida de calidad en 4 y 8 bits.
- Base para nuevos ajustes con LoRA: al ser un checkpoint fusionado y de tamaño reducido (8,6 GB), es manejable como punto de partida en una única GPU consumer.
- Generación de texto general de bajo coste: despliegue en inglés para tareas simples de resumen o reescritura donde no se requiera alta precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, GSM8K, HumanEval ni de ningún otro conjunto de referencia, y no hay comparaciones con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada en 16 bits (bf16/fp16): en torno a 8,6 GB solo para los pesos, más 1-3 GB de overhead para el contexto KV y el codificador de visión. Se recomienda un mínimo de 12 GB de VRAM.
- VRAM estimada en 8 bits: aproximadamente 4,5-5,5 GB de pesos, más overhead. Cabe en GPUs de 8-10 GB con contexto moderado.
- VRAM estimada en 4 bits (NF4 / Q4_K_M): aproximadamente 2,5-3,5 GB de pesos. Cabe en GPUs de 6-8 GB, con limitaciones de contexto.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para desarrollo local; L4, A10G, A100 o H100 para servicio en producción.
- Cabe en GPU consumer: sí. En 4 bits funciona en tarjetas de 8 GB; en 16 bits requiere 12 GB o más. Las entradas de imagen aumentan el consumo de memoria.
- Opciones de despliegue: `transformers` (soporte nativo, es la librería declarada), vLLM y Hugging Face TGI para servir con batching continuo, Unsloth para ajuste posterior, y llama.cpp / Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles. No hay cifras publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Thanu10/Arogya_finetuned_merged | ~4,3 mil millones | No confirmado (familia Gemma 3: 128 000 tokens) | apache-2.0 declarada (base sujeta a términos de Gemma) | Hugging Face, 0 descargas | Sin benchmarks ni model card detallada |
| google/gemma-3-4b-it | ~4,3 mil millones | 128 000 tokens | Términos de uso de Gemma | Hugging Face, ampliamente usado | Modelo base oficial, documentado y evaluado |
| Qwen2.5-VL-3B | ~3 mil millones | 128 000 tokens según documentación pública de la familia | Apache 2.0 | Hugging Face | Alternativa multimodal de tamaño similar con licencia permisiva |
| Llama 3.2 3B Instruct | ~3,2 mil millones | 128 000 tokens según documentación pública de la familia | Licencia comunitaria de Llama 3.2 | Hugging Face | Solo texto; ecosistema de despliegue maduro |

Los datos de los modelos alternativos provienen de la documentación pública de sus respectivas familias y no de la información proporcionada en esta búsqueda; deben verificarse antes de tomar decisiones. La comparación de rendimiento no es posible porque este fine-tune no publica métricas.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni comparación con el modelo base, por lo que se desconoce si el ajuste mejora o degrada las capacidades originales.
- Riesgo de olvido catastrófico: al tratarse de un fine-tune sobre un modelo de 4,3 mil millones de parámetros, es probable que haya pérdida de capacidades generales y de idiomas distintos del inglés.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Gemma 3 y de los datos usados en el ajuste, que no se documentan.
- Alucinación: riesgo propio de los modelos de este tamaño, especialmente en dominios especializados y sin recuperación aumentada.
- Idiomas: solo se declara inglés. El uso en castellano no está soportado ni verificado.
- Licencia: la model card declara `apache-2.0`, pero el modelo base Gemma 3 se distribuye bajo los términos de uso de Gemma, que imponen condiciones adicionales (incluidas obligaciones de uso aceptable y cláusulas específicas para uso comercial). Existe una posible incompatibilidad o al menos ambigüedad legal que conviene revisar con asesoramiento jurídico antes de cualquier despliegue comercial.
- Ámbito sanitario: el nombre del modelo sugiere aplicación en salud, pero no hay ninguna validación clínica, ni declaración de conformidad regulatoria, ni advertencias del autor. No debe usarse para diagnóstico, tratamiento ni consejo médico.
- Reproducibilidad: no se publican hiperparámetros, dataset ni semillas, por lo que el ajuste no es reproducible.
- Soporte: repositorio con 0 descargas y 0 interacciones; no hay garantía de mantenimiento ni de respuesta a incidencias.
- Contexto efectivo: aunque la arquitectura base admita 128 000 tokens, el fine-tune podría haber alterado el comportamiento en contextos largos; no hay verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thanu10/Arogya_finetuned_merged
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Perfil del autor en Hugging Face: https://huggingface.co/Thanu10
- Listado de modelos del autor: https://huggingface.co/Thanu10/models
- Variante relacionada del autor en FriendliAI: https://friendli.ai/models/Thanu10/Arogya_finetuned_4bit
