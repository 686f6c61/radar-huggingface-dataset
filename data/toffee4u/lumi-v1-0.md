# toffee4u/Lumi-v1-0

## Resumen

Lumi-v1-0 es un ajuste fino (fine-tuning) del modelo base unsloth/Qwen3.5-9B, publicado por el usuario toffee4u en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text, es decir, acepta tanto texto como imágenes como entrada y genera texto. El repositorio contiene los pesos en formato FP16 (16 bits) resultantes del proceso de ajuste fino, con un total de 9.653.104.368 parámetros (aproximadamente 9,65 mil millones).

El modelo se ha entrenado utilizando la librería Unsloth junto con TRL de Hugging Face, lo que según la model card permitió un entrenamiento "2x más rápido". La licencia es Apache 2.0, lo que facilita su uso comercial y su modificación. El idioma declarado es únicamente inglés.

La relevancia de este modelo es limitada por el momento: cuenta con 0 descargas y 1 like en el momento de la consulta, y la model card no aporta información sobre el dataset de entrenamiento, los objetivos del ajuste ni los resultados obtenidos. Se desconoce qué capacidades específicas se han potenciado respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5; detalles específicos no disponibles |
| Parametros totales | 9.653.104.368 (aproximadamente 9,65 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos FP16; no se documentan otras cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-9B, un transformer multimodal capaz de procesar entradas de imagen y texto. El ajuste fino se realizó sobre la versión publicada por Unsloth del modelo base, empleando la librería Unsloth y TRL de Hugging Face. La model card indica que el entrenamiento fue "2x más rápido" gracias a Unsloth, pero no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras.

No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) ni detalles sobre el proceso de alineación. Tampoco se indica qué tipo de datos se utilizaron para el ajuste fino ni cuál era el objetivo del mismo (por ejemplo, instrucciones, conversación, visión, etc.).

## Capacidades

- Generación de texto e imágenes a texto (pipeline image-text-to-text declarado).
- Conversación multi-turno (etiqueta "conversational").
- Compatibilidad con text-generation-inference (TGI) y endpoints.
- Capacidades multilingües: únicamente inglés declarado.
- No se documentan capacidades específicas de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas o código en la información disponible.
- No se documenta modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Descripción de imágenes en inglés: el modelo puede recibir una imagen y generar una descripción textual, adecuado para tareas de alt-text o catalogación básica, dado su pipeline image-text-to-text.
- Asistente conversacional en inglés: puede gestionar diálogos multi-turno gracias a la etiqueta "conversational", aunque se desconoce la longitud de contexto efectiva.
- Prototipado rápido con TGI: al ser compatible con text-generation-inference y endpoints, puede desplegarse en infraestructuras estándar de Hugging Face para pruebas de concepto.
- Experimentación académica: sirve como punto de partida para investigar ajustes finos sobre Qwen3.5-9B con Unsloth, ya que la licencia Apache 2.0 permite modificaciones y redistribución.
- Base para nuevos fine-tunings: al estar en FP16 y con licencia permisiva, puede reutilizarse como modelo base para ajustes posteriores en inglés.
- Evaluación comparativa de fine-tunings comunitarios: útil para medir el impacto de ajustes finos no documentados frente al modelo base Qwen3.5-9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 19,3 GB solo para pesos (9,65 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 24 GB de VRAM.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16 ajustado; para cuantizaciones de 8 bits o 4 bits se necesitaría menos VRAM, pero no se documentan versiones cuantizadas.
- ¿Cabe en GPU de consumo? En FP16, una RTX 4090 de 24 GB podría alojarlo con margen ajustado; en GPUs de 16 GB o menos no cabría sin cuantización, que no está disponible en el repositorio.
- Opciones de despliegue: transformers, text-generation-inference (TGI), endpoints compatibles; no se documenta soporte explícito para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lumi-v1-0 | 9,65 mil millones | No disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.5-9B (base) | 9 mil millones (aprox.) | No disponible en la información | No disponible en la información | Hugging Face (unsloth/Qwen3.5-9B) |
| Alternativas de ~9B multimodales | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas; los datos de benchmarks y contexto del modelo base no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un fine-tuning sin model card detallada, se desconocen los sesgos introducidos por el dataset de ajuste.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones que lo cuantifiquen.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el origen de los datos de entrenamiento.
- Caveats para producción: con 0 descargas y 1 like, no hay evidencia de uso comunitario ni validación externa; la ausencia de benchmarks y de documentación del dataset hace arriesgado su despliegue en producción sin evaluación propia.
- El modelo base es unsloth/Qwen3.5-9B; cualquier limitación de dicho modelo base (no documentada aquí) se hereda.

## Enlaces

- Hugging Face: https://huggingface.co/toffee4u/Lumi-v1-0
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no disponible en la información proporcionada
