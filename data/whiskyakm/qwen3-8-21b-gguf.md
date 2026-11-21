# WhiskyAKM/Qwen3.8-21B-GGUF

## Resumen

WhiskyAKM/Qwen3.8-21B-GGUF es una versión podada (pruned) y cuantizada del modelo Qwen/Qwen3.8-27B, desarrollado por el equipo Qwen. El autor de esta ficha, WhiskyAKM, ha eliminado los bloques 3, 9, 10 y 14 del transformer original para reducir el modelo de 27B a aproximadamente 21B parámetros (20.807.699.328 exactos según los pesos en safetensors), manteniendo la arquitectura híbrida de atención (hybrid attention con componentes linear-attention) y la naturaleza multimodal del modelo original.

El objetivo declarado es puramente de investigación: explorar hasta qué punto se puede comprimir un modelo grande eliminando capas completas con una degradación controlada de la perplejidad (KLD en torno a 1.2-1.3 según la cuantización). El autor advierte explícitamente que, para uso diario, cualquier cuantización del modelo original de 27B rendirá mejor que esta versión podada, por lo que no debe considerarse un sustituto de producción del modelo base.

La relevancia actual reside en que demuestra una técnica de poda no consecutiva (búsqueda de la mejor combinación de capas a eliminar en lugar de bloques contiguos) aplicada a un modelo Qwen3.8 con atención híbrida, y ofrece pesos GGUF listos para llama.cpp con licencia Apache 2.0, lo que facilita su experimentación en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con hybrid attention y linear-attention (base Qwen3.8-27B), podado en bloques 3, 9, 10 y 14 |
| Parametros totales | 20.807.699.328 (aprox. 21B; el autor indica 21.7B en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma oficial; los ejemplos de uso emplean `-c 32768` (32K) |
| Tipos de cuantizacion | Q4_0, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y BF16 (sin cuantizar) |
| Idiomas soportados | Multilingüe (multilingual, sin listado detallado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama-cpp); repo de 295 GB con múltiples cuantizaciones |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer híbrida que combina mecanismos de atención estándar con capas de linear-attention, según indican las etiquetas del repositorio. Esta ficha no ha sido reentrenada: es un proceso de poda estructural sobre los pesos del modelo original, en el que se eliminan los bloques 3, 9, 10 y 14. La innovación metodológica declarada es que el algoritmo de poda busca la mejor combinación de capas a eliminar en lugar de limitarse a bloques consecutivos, lo que según el autor reduce la degradación respecto a podas más ingenuas.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo original pasó por RLHF o DPO. El autor indica que la versión multimodal (vision) y la predicción multi-token (MTP) no fueron probadas tras la poda, y que el `mmproj` puede tomarse de cualquier otro repositorio GGUF de Qwen3.8-27B. Los pesos se actualizaron el 18 de noviembre de 2026 con un KLD en torno a 1.2-1.3 según la cuantización. El modelo se distribuye exclusivamente en GGUF para llama.cpp y runtimes compatibles.

## Capacidades

- Generación de texto conversacional y multilingüe, heredada del modelo base Qwen3.8-27B.
- Razonamiento y generación de código: el modelo base está orientado a coding y cowork según el blog de Qwen, aunque la poda puede degradar estas capacidades.
- Soporte multimodal potencial (vision) mediante un fichero `mmproj` externo, no probado por el autor tras la poda.
- Compatibilidad con API OpenAI a través de `llama-server` (endpoints_compatible en las etiquetas).
- Capacidad de predicción multi-token (MTP) presente en la arquitectura base, no verificada tras la poda.
- Ejecución local en llama.cpp con contexto configurable (los ejemplos usan 32K tokens).

## Casos de uso

- Experimentación académica en técnicas de poda: permite estudiar el impacto de eliminar capas no consecutivas en un transformer híbrido con atención lineal, comparando la perplejidad (KLD 1.2-1.3) frente al modelo original de 27B.
- Investigación sobre compresión de modelos multimodales: al poder acoplar un `mmproj` externo, sirve para evaluar cómo afecta la poda a la alineación visión-lenguaje en tareas controladas.
- Despliegue en hardware de consumo con llama.cpp: la cuantización Q4_K_M (13 GB) permite ejecutar el modelo en GPUs con 16 GB de VRAM, útil para prototipos y pruebas de concepto locales.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece siete variantes (de Q4_0 a BF16) para medir la degradación de calidad según el nivel de compresión, incluida la advertencia de que Q4_0 degrada notablemente.
- Servidor de inferencia compatible con OpenAI: mediante `llama-server` se puede exponer el modelo como API para integrarlo en pipelines de pruebas internas sin depender de servicios en la nube.
- Docencia y formación: su tamaño manejable (12-21 GB según cuantización) y licencia Apache 2.0 lo hacen adecuado para demostrar el funcionamiento interno de modelos híbridos y el efecto de la poda en entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de calidad aportado por el autor es la divergencia KL (KLD) en torno a 1.2-1.3 según la cuantización, que mide la degradación respecto al modelo original, no el rendimiento absoluto en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB (Q4_K_S), 13 GB (Q4_K_M), 14 GB (Q5_K_S y Q5_K_M), 16 GB (Q6_K), 21 GB (Q8_0) y 39 GB (BF16, sin cuantizar).
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) puede ejecutar hasta Q8_0, y una RTX 4080/4070 Ti Super (16 GB) hasta Q6_K.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más de VRAM para cuantizaciones Q4 y Q5; Q8_0 requiere 24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server` con API compatible con OpenAI); no se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.
- Advertencia del autor: la cuantización de la caché KV en Q4 y Q5 causa una degradación significativa de la calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WhiskyAKM/Qwen3.8-21B-GGUF | ~20.8B | 32K en ejemplos (no oficial) | Apache 2.0 | GGUF | Poda de investigación; KLD 1.2-1.3 |
| Qwen/Qwen3.8-27B | 27B | no disponible | Apache 2.0 | safetensors (original) | Modelo base; el autor recomienda usarlo para producción |
| Otras cuantizaciones GGUF de Qwen3.8-27B | 27B | no disponible | Apache 2.0 | GGUF | Mismo tamaño que el original, sin poda; rendimiento superior según el autor |

No se dispone de datos de benchmarks que permitan comparar el rendimiento absoluto con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor califica el proyecto como "solo de investigación" y afirma que cualquier cuantización del 27B original rendirá mejor para uso diario.
- La poda de cuatro bloques introduce una degradación medible (KLD 1.2-1.3), que puede traducirse en peor razonamiento, código y coherencia en comparación con el modelo base.
- La cuantización Q4_0 no se recomienda por una degradación sorprendentemente grande pese a su tamaño.
- La cuantización de la caché KV en Q4 y Q5 degrada significativamente la calidad.
- Las capacidades de visión y MTP no han sido probadas tras la poda; el soporte multimodal es, por tanto, incierto.
- No se han publicado benchmarks ni evaluaciones de sesgo, alucinación o seguridad para esta versión podada.
- El listado de idiomas es genérico ("multilingual") sin detalle de cobertura ni calidad por idioma.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de un experimento de poda sin validación, no es recomendable para producción sin evaluación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WhiskyAKM/Qwen3.8-21B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de Qwen3.8: https://qwen.ai/blog?id=qwen3.8
- llama.cpp: https://github.com/ggerganov/llama.cpp
