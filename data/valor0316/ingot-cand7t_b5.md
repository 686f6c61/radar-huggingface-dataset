# VALOR0316/ingot-cand7t_b5

## Resumen

`VALOR0316/ingot-cand7t_b5` es un checkpoint de pesos publicado en HuggingFace por el usuario VALOR0316. Se trata de un modelo de 27.781.427.952 parámetros (≈27,8 B) almacenado en formato `safetensors` con cuantización `fp8`, con un repositorio de 30,9 GB. El nombre del repositorio y los tags (`qwen3_5`, `fp8`) apuntan a un derivado o candidato interno de la familia Qwen3.5, aunque la ficha no lo confirma en ningún momento.

La relevancia del modelo es limitada desde el punto de vista técnico: no incluye model card, no declara licencia, no especifica idiomas soportados, no indica pipeline y no publica resultados de evaluación. Con 9 descargas y 0 likes en el momento de la consulta, tampoco existe validación comunitaria. El interés práctico se reduce a la experimentación controlada y a la auditoría de repositorios opacos, no a un uso en producción sin una evaluación previa.

Por tanto, esta ficha recoge los únicos datos verificables (recuento de parámetros real, tamaño del repositorio, formato y tags) y marca explícitamente como «no disponible» todo aquello que el autor no ha documentado. Cualquier capacidad que se atribuya al modelo debe considerarse una hipótesis derivada del tag `qwen3_5`, pendiente de verificación empírica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El tag `qwen3_5` sugiere arquitectura decoder-only de la familia Qwen3.5, sin confirmar |
| Parámetros totales | 27.781.427.952 (≈27,8 B), dato real de los tensores `safetensors` |
| Parámetros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | `fp8` (según tag y densidad del repo: ≈1,11 bytes por parámetro). No se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (precisión FP8) |
| Tamaño del repositorio | 30,9 GB |
| Descargas / likes | 9 / 0 |
| Fecha de creación | 2026-10-18T02:25:49Z |
| Última actualización | 2026-10-18T02:26:20Z (31 segundos después de la creación) |
| Región declarada | `region:us` |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni el uso de técnicas de alineación como RLHF, DPO o RL con verificación. El único indicio estructural es el tag `qwen3_5`, que sitúa el checkpoint en el linaje de la familia Qwen3.5, y el tag `fp8`, que describe la precisión de los pesos y no la arquitectura. Tampoco se documenta si se trata de un modelo denso o de mezcla de expertos: con 27,8 B de parámetros totales y sin campo de parámetros activos, lo prudente es asumir que no se ha declarado.

La densidad del repositorio (30,9 GB para 27,78 B de parámetros) es coherente con pesos cuantizados a 8 bits más los metadatos y el tokenizador, lo que confirma el tag `fp8` de forma indirecta. El intervalo de 31 segundos entre creación y actualización sugiere una subida automatizada o un pipeline de publicación de candidatos, en línea con el sufijo `cand7t_b5` del nombre. No se ha publicado ninguna innovación técnica asociada (atención lineal, decodificación especulativa, modos de razonamiento explícito) y no debe presuponerse ninguna.

## Capacidades

- No existen capacidades verificadas ni documentadas por el autor del repositorio.
- Generación de texto y razonamiento: presumible por el linaje Qwen3.5 sugerido por el tag, sin confirmar y sin datos de evaluación que lo respalden.
- Generación de código y matemáticas: no confirmado; no hay benchmarks ni ejemplos en el repositorio.
- Tool calling / function calling: no confirmado. Si hereda el formato de chat de Qwen3.5, podría soportarlo, pero requiere verificación con el tokenizador y la plantilla de chat incluidas.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles; el campo de idiomas está vacío en la ficha de HuggingFace.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. No hay indicios de multimodalidad en los tags.
- Compatibilidad de cuantización: los pesos están en FP8, lo que condiciona el hardware y los motores de inferencia utilizables.

## Casos de uso

- Auditoría y caracterización de checkpoints opacos: cargar el modelo en un entorno aislado, inspeccionar el tokenizador, la plantilla de chat y el comportamiento en prompts controlados para determinar qué hereda realmente de Qwen3.5 antes de asignarle cualquier uso.
- Evaluación comparativa interna: incluirlo como candidato en una batería propia de evaluación (MMLU reducido, HumanEval, GSM8K, pruebas en castellano) junto a otros modelos de ~27-32 B, dado que no existen resultados publicados por el autor.
- Experimentación con inferencia FP8: servir los pesos en vLLM o SGLang sobre GPU Hopper o Ada para medir throughput y latencia reales de un modelo de 27,8 B en 8 bits, un caso útil para calibrar costes de despliegue.
- Base para fine-tuning supervisado: al ser un checkpoint de 27,8 B en safetensors, puede servir como inicialización para ajuste con LoRA en dominios concretos, siempre que se resuelva previamente la licencia.
- Pruebas de pipelines de publicación de modelos: el patrón de subida automatizada (creación y actualización en 31 segundos, nombre con sufijo de candidato) lo convierte en un caso de estudio para validar herramientas de catalogación y control de calidad de repositorios.
- Docencia y formación en auditoría de modelos: útil como ejemplo real de repositorio sin model card, sin licencia y sin métricas, para practicar la verificación de artefactos antes de adoptarlos.
- Sustitución en prototipos ya basados en Qwen3.5: solo tras confirmar compatibilidad de tokenizador y plantilla de chat, y únicamente en entornos no productivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, y la búsqueda web realizada no ha devuelto documentación técnica asociada al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 31 GB solo para pesos en FP8 (30,9 GB de repositorio), más la caché KV, cuyo tamaño depende de la longitud de contexto y del número de capas, ambos no documentados. En la práctica, prever 40-48 GB para contextos moderados.
- GPU recomendadas: NVIDIA H100 80 GB, A100 40/80 GB, L40S 48 GB o RTX 6000 Ada 48 GB. Las GPU Hopper y Ada son las que mejor aprovechan FP8 de forma nativa.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en FP8. Sería necesario repartir en 2× RTX 4090 con paralelismo de tensores, o generar una cuantización de 4 bits (no publicada) para intentar encajarlo en 24 GB, con pérdida de calidad sin evaluar.
- Opciones de despliegue: vLLM y SGLang son las opciones más directas para FP8; TGI también soporta cuantización FP8. llama.cpp y Ollama requerirían convertir los pesos a GGUF, un proceso no documentado por el autor.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni parámetros de arquitectura suficientes para estimarlos con rigor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| `VALOR0316/ingot-cand7t_b5` | 27,78 B | No disponible | No disponible | No | Repositorio público sin documentar |
| Qwen3-32B | ≈32,8 B | 32 768 tokens nativos, ampliable | Apache 2.0 | Sí, en su model card | Pesos abiertos en HuggingFace |
| Gemma 3 27B | ≈27 B | 128 000 tokens | Términos de uso de Gemma | Sí, en su model card | Pesos abiertos en HuggingFace |
| Mistral Small 3.1 24B | ≈24 B | 128 000 tokens | Apache 2.0 | Sí, en su model card | Pesos abiertos en HuggingFace |

Los datos de los modelos comparados proceden de sus fichas públicas y deben verificarse contra la versión vigente en el momento de la consulta. La comparación con `ingot-cand7t_b5` es únicamente de tamaño y formato, ya que no existe ningún dato de rendimiento del modelo analizado.

## Limitaciones y advertencias

- Ausencia total de licencia: no se puede determinar si el uso comercial está permitido. Utilizarlo en producción sin aclaración previa del autor es un riesgo legal directo.
- Sin model card ni documentación: se desconocen arquitectura exacta, contexto máximo, idiomas, datos de entrenamiento y sesgos. Cualquier suposición basada en el tag `qwen3_5` es una hipótesis, no un hecho.
- Riesgo de alucinación: no evaluado. No hay pruebas de robustez, veracidad ni calibración.
- Sesgos conocidos: no disponibles. Al desconocerse la composición del dataset, no se puede acotar el sesgo lingüístico, cultural o de dominio.
- Limitaciones de contexto e idioma: el campo de idiomas está vacío y no se declara ventana de contexto; el comportamiento en castellano es completamente desconocido.
- Procedencia incierta: el nombre `ingot-cand7t_b5` y el patrón de publicación automatizada sugieren un candidato interno sin proceso de revisión publicado. No hay garantía de que los pesos correspondan a un modelo final.
- Sin validación comunitaria: 9 descargas y 0 likes implican que prácticamente nadie lo ha ejecutado ni reportado resultados.
- Restricción técnica de FP8: requiere hardware con soporte nativo para obtener buen rendimiento; en GPUs sin FP8 se produce una de-cuantización implícita con penalización de velocidad y memoria.
- Fecha de creación en 2026-10-18: conviene confirmar que los artefactos no han sido modificados ni retirados antes de integrarlos en cualquier flujo.

## Enlaces

- HuggingFace: https://huggingface.co/VALOR0316/ingot-cand7t_b5
- Paper, blog, repositorio de código o demo: no disponibles. La búsqueda web realizada no devolvió enlaces relevantes al modelo; únicamente resultados genéricos del dominio youtube.com sin relación con el checkpoint.
