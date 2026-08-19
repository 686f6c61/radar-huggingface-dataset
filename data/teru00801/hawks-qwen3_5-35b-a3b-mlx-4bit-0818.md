# teru00801/hawks-qwen3_5-35b-a3b-mlx-4bit-0818

## Resumen

El modelo `teru00801/hawks-qwen3_5-35b-a3b-mlx-4bit-0818` es una conversión no oficial al formato MLX (Apple Silicon) de un modelo de la familia Qwen3.5, concretamente la variante `35b-a3b`, que por su nomenclatura corresponde a un modelo de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones de parámetros activos. El autor, `teru00801`, ha publicado varias versiones de esta conversión con distintas fechas (0601, 0709, 0818), todas con cuantización de 4 bits.

El modelo está diseñado para generación de texto y uso conversacional, y se distribuye únicamente en inglés según las etiquetas. Al ser una conversión MLX, está pensado para ejecutarse en hardware Apple con memoria unificada, aprovechando la librería `mlx-lm`. La model card original es extremadamente escueta y no incluye información sobre arquitectura interna, datos de entrenamiento, benchmarks ni licencia, por lo que gran parte de los datos técnicos no están disponibles públicamente.

A pesar de la falta de documentación, la existencia de versiones previas y el repositorio oficial de Qwen3.5 en GitHub sugieren que el modelo base es parte de la serie Qwen3.5, lanzada en febrero de 2026, que incluye modelos MoE de distintos tamaños. Esta conversión en particular está cuantizada a 4 bits, lo que reduce significativamente el requisito de memoria y la hace viable en dispositivos con 24 GB o más de RAM unificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) según la nomenclatura del modelo original Qwen3.5-35B-A3B |
| Parametros totales | 5.419.330.688 (según safetensors; el modelo original declara 35B, pero la conversión 4-bit reduce el tamaño de almacenamiento) |
| Parametros activos | 3B (según la nomenclatura del modelo original, no confirmado por el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Por el nombre del repositorio (`qwen3_5_moe`) y la referencia al modelo original `Qwen3.5-35B-A3B`, se infiere que se trata de un modelo de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos, similar a otros modelos de la serie Qwen3.5. Sin embargo, el autor de esta conversión no proporciona detalles sobre la arquitectura exacta, el número de expertos, la función de activación ni el mecanismo de atención.

Tampoco se han publicado datos sobre el proceso de entrenamiento: no se indica el número de tokens utilizados, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card solo incluye instrucciones de uso con `mlx-lm`, sin ninguna referencia a metodología de entrenamiento o innovaciones técnicas.

## Capacidades

Dado que la documentación es mínima, las capacidades listadas a continuación se infieren del pipeline (`text-generation`) y de las etiquetas (`conversational`, `en`), así como del hecho de que el modelo base pertenece a la serie Qwen3.5:

- Generación de texto en inglés.
- Mantenimiento de conversaciones multi-turno (etiqueta `conversational`).
- Posible razonamiento y respuesta a instrucciones, aunque no hay evidencia concreta.
- No se ha confirmado soporte para tool calling, agentes, visión, audio u otras capacidades multimodales.
- No se ha confirmado soporte multilingüe más allá del inglés.

## Casos de uso

Debido a la falta de información específica, los siguientes casos de uso son hipotéticos y se basan en el comportamiento típico de modelos de lenguaje de tamaño similar. No hay garantía de que el modelo los soporte de forma óptima.

- Asistente conversacional en inglés: el modelo puede integrarse en aplicaciones de chat para responder preguntas y mantener diálogos, aprovechando su naturaleza conversacional.
- Generación de borradores de texto: redacción de correos, artículos o documentación técnica en inglés, con revisión posterior por un humano.
- Clasificación de texto: etiquetado de comentarios, análisis de sentimiento o categorización de documentos, si se ajusta con técnicas de fine-tuning (aunque no se ha documentado).
- Generación de código simple: posible uso para snippets de programación, aunque no hay evidencia de entrenamiento específico en código.
- Prototipado de aplicaciones NLP: evaluación rápida de ideas en entornos de desarrollo con hardware Apple, gracias a la integración con MLX.
- Investigación académica: estudio del comportamiento de modelos MoE cuantizados en tareas de generación de texto, siempre que se respete la licencia (actualmente desconocida).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para esta conversión específica ni para el modelo base en las fuentes consultadas. Se recomienda realizar evaluaciones propias antes de su uso en producción.

## Requisitos de hardware

- El repositorio ocupa 19.5 GB, por lo que se necesita al menos 20 GB de memoria disponible para cargar el modelo en RAM unificada.
- En hardware Apple Silicon, se recomienda un chip con al menos 24 GB de RAM unificada (por ejemplo, M1 Pro/Max, M2 Pro/Max, M3 Pro/Max o superiores) para una ejecución cómoda.
- Con cuantización 4-bit, el modelo puede ejecutarse en GPU de consumo con 24 GB de VRAM (como RTX 3090/4090) si se usa una librería compatible, aunque MLX está optimizado para Apple Silicon.
- Opciones de despliegue: `mlx-lm` para Apple Silicon, `llama.cpp` (si se convierte a GGUF) o `vLLM` (si se convierte a otros formatos). No se proporcionan archivos GGUF ni ONNX.
- Latencia y throughput: no disponibles. Dependerán del hardware y del número de tokens generados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. La siguiente tabla compara características básicas con el modelo original y otras conversiones conocidas, basándose únicamente en información pública.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B (original) | 35B total, 3B activo | no disponible | no disponible | safetensors (original) | Hugging Face / ModelScope |
| hawks-qwen3_5-35b-a3b-mlx-4bit (este) | 5.42B en safetensors (4-bit) | no disponible | no disponible | MLX safetensors | Hugging Face |
| Otras conversiones MLX de Qwen3.5 (p.ej. 0709, 0601) | similares | no disponible | no disponible | MLX safetensors | Hugging Face |

No se ha encontrado información sobre modelos comparables de otras familias (como Llama o Mistral) que permitan una comparativa justa en términos de rendimiento.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide conocer si el modelo puede utilizarse comercialmente. Se recomienda contactar al autor o esperar a que se aclare la licencia antes de cualquier uso en producción.
- La model card no incluye información sobre sesgos, alucinaciones o limitaciones de contexto. Es probable que el modelo herede sesgos de los datos de entrenamiento de Qwen3.5, pero no hay confirmación.
- El modelo está limitado al inglés; no se garantiza un buen rendimiento en otros idiomas.
- Al ser una conversión no oficial, puede haber diferencias de comportamiento respecto al modelo original, especialmente en la precisión de las respuestas debido a la cuantización 4-bit.
- No se han publicado benchmarks, por lo que no se puede evaluar su calidad objetivamente.
- El número de parámetros indicado en safetensors (5.42B) no coincide con la nomenclatura del modelo original (35B), lo que sugiere que la cuantización 4-bit reduce el tamaño de almacenamiento pero no el número de parámetros lógicos. Esto puede causar confusión al interpretar los requisitos de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-mlx-4bit-0818
- Versión anterior (0709): https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-mlx-4bit-0709
- Versión anterior (0601): https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-mlx-4bit-0601
- Repositorio oficial de Qwen3.5 en GitHub: https://github.com/algtrd24/qwen3.5
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:35b-a3b
- Repositorio de QwenLM (serie Qwen3.5/3.6/3.8): https://github.com/QwenLM/Qwen3.8
