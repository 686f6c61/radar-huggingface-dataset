# WhiskyAKM/Qwen3.8-21B-PRUNED-GGUF

## Resumen

Qwen3.8-21B-PRUNED-GGUF es una versión podada y cuantizada del modelo Qwen/Qwen3.8-27B del equipo Qwen, publicada por el usuario independiente WhiskyAKM en Hugging Face. El autor ha eliminado los bloques 3, 9, 10 y 14 del transformer original para reducir el modelo de 27B a aproximadamente 20.807.699.328 parámetros (21,7B según la model card), manteniendo la licencia Apache 2.0 del modelo base. Se distribuye exclusivamente en formato GGUF para su uso con llama.cpp y runtimes compatibles.

El modelo conserva las etiquetas del modelo base (atención híbrida con componentes de atención lineal, capacidad multimodal y soporte multilingüe), aunque el propio autor advierte de que ni la visión ni la predicción multi-token (MTP) han sido probadas tras la poda. El repositorio incluye cuantizaciones desde Q4_0 hasta BF16 sin cuantizar, con tamaños que van de 12 GB a 39 GB, lo que lo hace desplegable en hardware de consumo con las cuantizaciones más agresivas.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de investigación sobre poda estructurada de bloques en modelos Qwen de última generación; por otro, sirve de advertencia metodológica, ya que el propio autor indica que "cualquier cuantización del modelo original de 27B rendirá mejor que la versión podada" y que se trata de un proyecto de investigación, no de un modelo para uso diario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (atención lineal + atención estándar), derivada de Qwen3.8-27B |
| Parámetros totales | 20.807.699.328 (≈21,7B según model card) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de uso emplean `-c 32768` |
| Tipos de cuantización | Q4_0, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16 (sin cuantizar) |
| Idiomas soportados | multilingüe (sin listado detallado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer de la familia Qwen3.8 que, según las etiquetas del repositorio, emplea atención híbrida con componentes de atención lineal. La modificación aplicada por WhiskyAKM consiste en una poda estructurada de bloques completos: se eliminan los bloques 3, 9, 10 y 14, reduciendo el número de capas y, con ello, el cómputo y la memoria necesarios. La versión actualizada (18/11/2026) introduce un algoritmo que busca la mejor combinación de capas a eliminar en lugar de limitarse a bloques consecutivos, y sitúa la divergencia KL (KLD) en torno a 1,2-1,3 según la cuantización.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base más allá de lo que declare el equipo Qwen en su blog. La poda no conlleva reentrenamiento ni destilación: se aplica directamente sobre los pesos del modelo original y después se cuantiza. El autor advierte de que la visión y la predicción multi-token no fueron validadas tras la poda, y que el `mmproj` debe tomarse de otro repositorio GGUF de Qwen3.8-27B si se quiere habilitar el modo multimodal.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.8-27B.
- Razonamiento y matemáticas: capacidades propias de la familia Qwen3.8, aunque degradadas por la poda (el autor no publica evaluaciones específicas).
- Generación de código: el modelo base está orientado a coding y "cowork" según el blog de Qwen; la versión podada conserva esta orientación sin garantías cuantificadas.
- Soporte multilingüe, según la etiqueta `language: multilingual` del repositorio.
- Capacidad multimodal declarada en las etiquetas (`multimodal`), pero no probada tras la poda; requiere un `mmproj` externo.
- Compatibilidad con API OpenAI a través de `llama-server`.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en la model card.

## Casos de uso

- Experimentación académica en poda de modelos: el repositorio permite reproducir y comparar el efecto de eliminar bloques concretos (3, 9, 10, 14) frente al modelo original de 27B, midiendo KLD y calidad con distintas cuantizaciones.
- Despliegue en hardware con VRAM limitada: la cuantización Q4_K_M (13 GB) permite ejecutar un modelo de la familia Qwen3.8 en GPUs de consumo de 16-24 GB, algo inviable con el BF16 de 27B.
- Evaluación de robustez de cuantizaciones: el autor advierte de que Q4_0 degrada notablemente la calidad y de que la cuantización de KV cache en Q4/Q5 introduce pérdidas; el repositorio sirve para estudiar estos efectos en un modelo podado.
- Prototipado rápido con llama.cpp: `llama-cli` y `llama-server` permiten levantar un endpoint compatible con OpenAI en local para pruebas de integración sin depender de infraestructura cloud.
- Investigación sobre atención híbrida: al conservar la arquitectura de atención lineal del modelo base, permite estudiar el comportamiento de estos mecanismos tras eliminar capas específicas.
- Docencia y divulgación: útil para explicar de forma práctica qué implica la poda estructurada en términos de tamaño, VRAM y degradación de calidad, con cifras concretas de KLD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo aportado por el autor es la divergencia KL (KLD) de aproximadamente 1,2-1,3 según la cuantización, que mide la diferencia entre la distribución del modelo podado y la del modelo original, no su rendimiento absoluto en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF, más overhead de contexto y KV cache):
  - Q4_0 / Q4_K_S: ~12 GB
  - Q4_K_M: ~13 GB
  - Q5_K_S / Q5_K_M: ~14 GB
  - Q6_K: ~16 GB
  - Q8_0: ~21 GB
  - BF16: ~39 GB
- GPU recomendadas:
  - Cuantizaciones Q4-Q5: RTX 4090 (24 GB), RTX 4080 (16 GB) con Q4_K_S, RTX 3090 (24 GB).
  - Q6_K: RTX 4090 / RTX 3090 / A6000.
  - Q8_0: A100 40 GB, H100, o configuraciones multi-GPU.
  - BF16: A100 80 GB o H100 80 GB.
- Cabe en GPU de consumo: sí, con Q4_K_S o Q4_K_M en GPUs de 16 GB o más; el autor recomienda evitar Q4_0 por su degradación.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extensión cualquier runtime compatible con GGUF (Ollama, LM Studio, KoboldCpp, entre otros). El repositorio está etiquetado como `endpoints_compatible` y `llama-cpp`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: el autor advierte de que la cuantización de KV cache en Q4/Q5 degrada significativamente la calidad; conviene mantener la KV cache en mayor precisión aunque ello aumente el consumo de VRAM con contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WhiskyAKM/Qwen3.8-21B-PRUNED-GGUF | 20,8B (podado de 27B) | no disponible | Apache 2.0 | GGUF | Proyecto de investigación; KLD ~1,2-1,3; visión y MTP no probados |
| Qwen/Qwen3.8-27B (modelo base) | 27B | no disponible | Apache 2.0 | safetensors (original) | Referencia de calidad; el autor recomienda usarlo frente a la versión podada |
| Otras cuantizaciones GGUF de Qwen3.8-27B | 27B | no disponible | Apache 2.0 | GGUF | Mantienen todas las capas; mayor tamaño pero mejor calidad esperada según el autor |

No se dispone de datos de benchmarks que permitan comparar rendimiento tarea a tarea con alternativas de la misma categoría.

## Limitaciones y advertencias

- Proyecto de investigación: el propio autor afirma que "cualquier cuantización del modelo original de 27B rendirá mejor que la versión podada" y que no está pensado para uso diario.
- Degradación por poda: la eliminación de los bloques 3, 9, 10 y 14 introduce una divergencia KL de ~1,2-1,3 respecto al modelo original, que se traduce en pérdida de calidad no cuantificada en tareas concretas.
- Cuantización Q4_0 desaconsejada explícitamente por "degradación sorprendentemente grande".
- La cuantización de KV cache en Q4 y Q5 provoca degradación significativa de la calidad según el autor.
- Visión y predicción multi-token (MTP) no probadas tras la poda; el modo multimodal requiere un `mmproj` tomado de otro repositorio de Qwen3.8-27B y su funcionamiento no está garantizado.
- No se documentan evaluaciones de sesgo, alucinación ni seguridad específicas para esta versión podada; los sesgos heredados del modelo base no están caracterizados en la información disponible.
- Cobertura idiomática declarada como "multilingual" sin listado de idiomas ni evaluaciones por idioma.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B y de cualquier `mmproj` externo que se utilice.
- Repositorio de 295 GB con múltiples cuantizaciones; la descarga completa no es necesaria, pero conviene seleccionar el fichero adecuado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WhiskyAKM/Qwen3.8-21B-PRUNED-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog del equipo Qwen sobre Qwen3.8: https://qwen.ai/blog?id=qwen3.8
- llama.cpp: https://github.com/ggerganov/llama.cpp
