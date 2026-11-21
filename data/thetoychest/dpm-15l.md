# TheToyChest/DPM-15L

## Resumen

DPM-15L es un modelo de lenguaje causal de 25 millones de parámetros desarrollado por TheToyChest, publicado en Hugging Face. Su interés no reside en el tamaño, sino en la propuesta arquitectónica: sustituye la atención Softmax estándar por un mecanismo denominado Dual-Polynomial Attention (DPA), que combina activación ReLU sobre las puntuaciones de atención crudas con parámetros polinómicos aprendidos, y un paisaje de pérdida fusionado sin Softmax (NSM). El modelo se entrenó durante una sola época sobre el corpus OpenWebText, de aproximadamente 9.000 millones de tokens.

La arquitectura es un transformer de 15 capas, 4 cabezas de atención, dimensión de embedding 256 y capa feed-forward de 1024, con embeddings posicionales rotatorios (RoPE). El autor presenta resultados comparativos frente a una línea base Softmax del mismo tamaño en el propio README: el checkpoint subido (semilla 999, batch 16) alcanza una pérdida de validación en OpenWebText de 2,69 y una perplejidad zero-shot en Wikitext-103 de 44,05, frente a 4,05 y 178,44 respectivamente para la línea base Softmax.

Se trata de un artefacto de investigación empírica sobre alternativas a Softmax en atención, no de un modelo listo para producción. No hay información sobre licencia, idiomas soportados, pipeline de inferencia ni formatos de pesos más allá del repositorio de 0,3 GB. La relevancia actual es la exploración de mecanismos de atención con sparsity matemática que mantengan flujo de gradiente estable en modelos pequeños, como paso previo a validar si el enfoque escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con Dual-Polynomial Attention (DPA) y pérdida No-Softmax (NSM); 15 capas, 4 cabezas, dim. de embedding 256, FFN 1024, RoPE |
| Parámetros totales | 25 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,3 GB; el README menciona pesos del checkpoint) |

## Arquitectura y entrenamiento

DPM-15L es un transformer causal de 15 capas con 4 cabezas de atención, dimensión de embedding 256 y capa feed-forward de 1024, usando embeddings posicionales rotatorios (RoPE). La innovación central es la Dual-Polynomial Attention (DPA): en lugar de aplicar Softmax sobre las puntuaciones de atención, el modelo usa activación ReLU sobre las puntuaciones crudas y parámetros polinómicos aprendidos, lo que según el autor proporciona sparsity matemática manteniendo un flujo de gradiente estable. El modelo también reemplaza la determinación de pérdida estándar por un paisaje de pérdida fusionado sin Softmax (NSM).

El entrenamiento consistió en una única época sobre OpenWebText, un corpus de aproximadamente 9.000 millones de tokens. No se detalla la composición exacta del dataset, el número exacto de tokens procesados, ni si hubo fases de RLHF, DPO o ajuste fino posterior. El README menciona ablaciones con distintas semillas y tamaños de batch (16 y 32), lo que sugiere una campaña de experimentos de estabilidad más que un entrenamiento orientado a capacidades.

## Capacidades

- Generación de texto causal y modelado de lenguaje de siguiente token, entrenado sobre OpenWebText en inglés.
- Razonamiento de siguiente token evaluado mediante precisión en OpenWebText y generalización zero-shot en Wikitext-103.
- Evaluación de sentido común vía HellaSwag (resultados reportados en el README).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el corpus de entrenamiento es OpenWebText, predominantemente inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre alternativas a Softmax en atención: el modelo sirve como banco de pruebas reproducible para comparar DPA frente a una línea base Softmax del mismo tamaño, con métricas de pérdida y precisión reportadas en el README.
- Estudio de sparsity en atención: la activación ReLU sobre puntuaciones crudas permite analizar patrones de atención dispersos y su efecto en la perplejidad, útil para grupos que investigan eficiencia computacional en attention.
- Validación de estabilidad de gradiente en pérdidas sin Softmax: el paisaje NSM puede evaluarse en tareas de modelado de lenguaje pequeño para estudiar convergencia y sensibilidad a la semilla y al batch size.
- Reproducción de experimentos académicos: el script de evaluación zero-shot en Google Colab y el repositorio de GitHub permiten replicar los resultados de Wikitext-103 y HellaSwag con el checkpoint subido (requiere `continuous_abla = False`).
- Docencia y divulgación: un modelo de 25M parámetros entrenable y evaluable en hardware modesto sirve para ilustrar el funcionamiento interno de la atención y las pérdidas en transformers.
- Prototipado de pipelines de evaluación de modelos pequeños: útil para construir arneses de benchmark (OWT, Wikitext-103, HellaSwag) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Datos reportados en el README del autor (OpenWebText y Wikitext-103):

| Modelo / semilla | Batch | OWT val loss | OWT next-token acc | Wiki-103 perplejidad | Wiki-103 zero-shot acc | HellaSwag |
|---|---|---|---|---|---|---|
| Softmax baseline | 32 | 4,05 | 31,14 % | 178,44 | 23,72 % | 25,22 % |
| DPM (seed 42) | 32 | 3,17 | 40,01 % | 81,28 | 28,30 % | 25,12 % |
| DPM (seed 105) | 16 | 2,81 | 43,76 % | 59,81 | 33,66 % | 25,19 % |
| DPM (seed 42) | 16 | 2,71 | 44,81 % | 44,67 | 34,17 % | 25,67 % |
| DPM (seed 999, subido) | 16 | 2,69 | 44,26 % | 44,05 | 33,15 % | 25,85 % |

No se han publicado resultados de benchmarks estándar adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 25M parámetros en fp32 el peso ronda los 100 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU para evaluación; no se requieren aceleradores de datacenter.
- Cabe en GPU consumer: sí, con margen amplio; también en CPU y en entornos tipo Google Colab gratuito.
- Opciones de despliegue: no se especifican en la información disponible. El README remite a un script de evaluación zero-shot en Google Colab del repositorio de GitHub del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque de atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DPM-15L (TheToyChest) | 25M | no disponible | Dual-Polynomial Attention + pérdida NSM | no disponible | Hugging Face (TheToyChest/DPM-15L) |
| Línea base Softmax del autor | 25M (misma config.) | no disponible | Softmax estándar | no disponible | Referenciada en el README, no publicada como checkpoint |
| GPT-2 small (referencia de la categoría) | 124M | 1024 tokens | Softmax multi-cabeza | MIT (según el release original de OpenAI) | Hugging Face (openai-community/gpt2) |

No se dispone de comparaciones con otros modelos de 25M parámetros en la información proporcionada. La comparativa más directa es con la línea base Softmax del propio autor, cuyos resultados se incluyen en la tabla de benchmarks.

## Limitaciones y advertencias

- Modelo de 25M parámetros entrenado una sola época sobre OpenWebText: su capacidad de generación de texto coherente es muy limitada y no debe usarse como asistente general.
- No hay información sobre sesgos; al entrenarse sobre OpenWebText (texto web en inglés) es probable que herede sesgos presentes en ese corpus, aunque no se han documentado.
- Riesgo de alucinación alto en cualquier uso generativo fuera del dominio de modelado de lenguaje; no se han publicado evaluaciones de factualidad.
- Longitud de contexto no documentada: se desconoce la ventana máxima soportada y si RoPE permite extrapolación.
- Licencia no disponible: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Idiomas: el entrenamiento es en inglés (OpenWebText); el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea muy pobre.
- El checkpoint subido requiere `continuous_abla = False` en el script de evaluación; ignorar este detalle puede producir resultados incorrectos.
- Los benchmarks reportados son del autor y no han sido verificados de forma independiente; HellaSwag ronda el azar (25 %) en todos los modelos, lo que sugiere que la métrica no discrimina a este tamaño.
- No hay información sobre formatos de pesos (safetensors, GGUF, etc.) ni sobre compatibilidad con vLLM, llama.cpp u Ollama.

## Enlaces

- Hugging Face: https://huggingface.co/TheToyChest/DPM-15L
- Repositorio GitHub del autor: https://github.com/TheToyChest/DPM-15L/tree/main
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
