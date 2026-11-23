# tyrant35/zils-z3-z1

## Resumen

zils-z3-z1 es un modelo de decisión derivado de Qwen/Qwen3.8-27B, publicado por el usuario tyrant35 en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tune mediante fusión de un LoRA de rango 32 (soup-pool) sobre el chasis z3 (vllm-sr/d3-ultra), cuyo modelo padre es Qwen3.8-27B. El modelo cuenta con 26.085.330.160 parámetros en formato safetensors y un repositorio de 52,2 GB.

El modelo está orientado a tareas de decisión y clasificación: según la model card, se entrenó sobre datos públicos de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI, HoVer, ANLI, Humicroedit, RAGTruth, HellaSwag, WinoGrande, CLINC150 y BANKING77. Los objetivos de entrenamiento mezclan la etiqueta gold (0,5) con las propias probabilidades del chasis original (0,5), y además aprendió las probabilidades de respuesta del chasis sobre 6.000 prompts de decisión públicos para preservar su comportamiento previo.

Es relevante como ejemplo de fine-tune de decisión sobre un modelo base de gran tamaño, con una receta de entrenamiento documentada (LoRA rango 32, learning rate 2e-4, uso exclusivo de splits de entrenamiento y dev, sin test). No obstante, la información publicada es escasa: no hay pipeline declarado, idiomas no disponibles, cero descargas y cero likes en el momento de la consulta, y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.8-27B) |
| Parámetros totales | 26.085.330.160 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo; se sabe que es un fine-tune del modelo base Qwen/Qwen3.8-27B y que el chasis de partida es vllm-sr/d3-ultra (z3), descrito por el autor como un "soup-pool body". El fine-tune se realizó mediante un LoRA de rango 32 fusionado, con learning rate 2e-4.

El entrenamiento utilizó datos públicos de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI, HoVer, ANLI, Humicroedit, RAGTruth, HellaSwag, WinoGrande, CLINC150 y BANKING77. Los objetivos mezclan la etiqueta gold con peso 0,5 y las probabilidades del chasis original con peso 0,5. Adicionalmente, el modelo aprendió las probabilidades de respuesta del chasis sobre 6.000 prompts de decisión públicos para conservar su comportamiento en otras tareas. Solo se usaron splits de entrenamiento, más los splits de dev de VAST y NLI4CT; no se utilizó ningún split de test de benchmarks. No se documenta el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la lista de conjuntos.

## Capacidades

- Clasificación y decisión sobre tareas de razonamiento y NLI (ANLI, CLadder, NLI4CT).
- Detección de sarcasmo e ironía (iSarcasmEval).
- Análisis de sentimiento y atribución de valor en opiniones (VAST).
- Verificación de hechos y atribución (HoVer, RAGTruth).
- Clasificación de intenciones en asistentes conversacionales (CLINC150, BANKING77).
- Recuperación de productos y relevancia en comercio electrónico (Amazon ESCI).
- Razonamiento de sentido común (HellaSwag, WinoGrande) y edición de humor (Humicroedit).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Moderación de opiniones y detección de sarcasmo: el modelo puede clasificar reseñas y comentarios según ironía o sentimiento, aprovechando su entrenamiento en iSarcasmEval y VAST para etiquetar contenido en pipelines de moderación.
- Enrutado de intenciones en chatbots: con CLINC150 y BANKING77 en el entrenamiento, puede asignar consultas de usuarios a intenciones predefinidas en asistentes de banca o atención al cliente.
- Verificación de afirmaciones en respuestas generadas: su exposición a HoVer y RAGTruth permite usarlo como clasificador de soporte factual en sistemas RAG, marcando respuestas no respaldadas por el contexto.
- Búsqueda y relevancia en e-commerce: entrenado con Amazon ESCI, puede puntuar la relevancia de productos respecto a consultas para reordenar resultados de búsqueda.
- Razonamiento clínico estructurado: el uso de NLI4CT y CLadder lo hace adecuado para tareas de inferencia entre afirmaciones y evidencia en dominios técnicos o biomédicos.
- Evaluación de consistencia lógica: puede emplearse como clasificador de entailment/contradicción (ANLI) en pipelines de control de calidad de textos generados.
- Filtrado de datos de entrenamiento: como modelo de decisión, puede etiquetar pares de texto para descartar ejemplos inconsistentes antes de entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 26 GB; en 4 bits, alrededor de 13-15 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB o múltiples GPU de 24 GB en paralelo para FP16.
- En GPU de consumo: posible en RTX 4090 (24 GB) solo con cuantización agresiva (4 bits) y contexto reducido; no cabe en FP16 en ninguna GPU de consumo individual.
- Opciones de despliegue: no se documentan; por el formato safetensors y el tamaño, son viables vLLM, TGI o transformers con cuantización, pero no hay confirmación del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-z3-z1 | 26,1 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible | no disponible en la información | Hugging Face |
| vllm-sr/d3-ultra (chasis) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para comparar; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- El modelo se entrenó solo con splits de entrenamiento y dev; no hay validación sobre test, lo que limita la confianza en su generalización.
- La model card no documenta sesgos conocidos, idiomas soportados ni comportamiento fuera de las tareas de decisión.
- Riesgo de alucinación y de sobreajuste a las distribuciones de los conjuntos de entrenamiento (iSarcasmEval, BANKING77, etc.).
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los datos de entrenamiento y del modelo base Qwen3.8-27B antes de uso comercial.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día (23 de noviembre de 2026), lo que sugiere que no ha sido validado por la comunidad.
- No se documentan cuantizaciones oficiales ni pipeline de inferencia, lo que complica su despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/tyrant35/zils-z3-z1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Chasis referenciado: https://huggingface.co/vllm-sr/d3-ultra (no verificado)
