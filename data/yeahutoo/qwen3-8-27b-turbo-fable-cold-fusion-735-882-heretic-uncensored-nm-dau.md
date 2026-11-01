# Yeahutoo/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU es un ajuste fino (finetune) del modelo base Qwen/Qwen3.8-27B, publicado por el usuario Yeahutoo en HuggingFace. Se trata de una variante "uncensored" y "heretic" (es decir, con las capas de rechazo y moderación reducidas o eliminadas mediante técnicas de abliteration) orientada a usos sin restricciones de contenido. El modelo conserva la arquitectura multimodal del Qwen3.8 original (pipeline image-text-to-text) y sus 27 781 427 952 parámetros (~27,8 B), empaquetados en safetensors con un repositorio de 55,6 GB.

La model card está dominada por referencias cruzadas a otras versiones del mismo autor (DavidAU), con enlaces a repositorios GGUF y a variantes como "TWIN-TURBO" o "ULTRA-HERETIC". El modelo se presenta como parte de un proyecto de tuning multietapa ("Cold Fusion", "GAIN Training", "Multi-stage tuning") que, según el autor, reduce el número de tokens de razonamiento entre 1/2 y 1/20 respecto al base. No se aportan datos verificables sobre el dataset de ajuste, el número de tokens de entrenamiento ni la metodología exacta.

La relevancia práctica es limitada: se trata de un derivado de nicho, con 19 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados en la información disponible y con una licencia Apache 2.0 heredada del modelo base. Resulta útil únicamente para quien busque una variante sin moderación de Qwen3.8-27B para experimentación, asumiendo los riesgos legales y de calidad asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.8; detalles internos no disponibles |
| Parametros totales | 27 781 427 952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en el repo fuente; GGUF publicados en repositorios separados del autor (NEO-CODER MAX DiMatrix, según la model card) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repos derivados |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal con capacidad de entrada imagen-texto. Sobre esa base, el autor aplica un pipeline de ajuste multietapa que denomina "Cold Fusion" y "GAIN Training", con etapas intermedias (STAGE1-PART2, STAGE1b-PART2, STAGE2-rplus2) y posteriores pasos de "heretic'ing" (abliteration) para eliminar comportamientos de rechazo. La model card menciona que se emplearon tanto finetunes propios del autor como modelos de terceros, pero no detalla la composición del dataset, el volumen de tokens, ni si hubo RLHF, DPO o SFT supervisado.

No se documenta ninguna innovación arquitectónica propia: las mejoras declaradas son de comportamiento (reducción de tokens de razonamiento, modos de razonamiento e instrucción conmutables en la variante TWIN-TURBO) y no estructurales. La ausencia de información sobre hiperparámetros, precisión de entrenamiento o proceso de evaluación impide reproducir el ajuste o validar las afirmaciones de rendimiento.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de conversaciones multiturno.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), heredado del modelo base.
- Razonamiento de múltiples pasos, según la model card (etapas STAGE1 y STAGE2 con ejemplos de generación).
- Modo "uncensored": ausencia deliberada de mecanismos de rechazo ante contenido sensible.
- Reducción de tokens de razonamiento declarada por el autor (entre 1/2 y 1/20 frente al base, sin datos verificables).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades de audio o visión avanzada más allá del pipeline declarado: no disponible.

## Casos de uso

- Experimentación en investigación sobre alineación y seguridad: el modelo sirve como caso de estudio de abliteration, permitiendo comparar respuestas con y sin capas de rechazo frente al Qwen3.8-27B original en tareas de evaluación de robustez.
- Generación creativa sin restricciones de contenido: escritura de ficción, guiones o narrativa que requiera temáticas que los modelos alineados rechazan, siempre que el uso cumpla la legislación aplicable.
- Análisis de imágenes con descripción textual: gracias al pipeline image-text-to-text, puede emplearse para generar descripciones o extraer información de imágenes en inglés.
- Prototipado de asistentes conversacionales en inglés: con 27,8 B de parámetros y pesos safetensors, se puede desplegar en un servidor con GPU de 80 GB para pruebas de diálogo multiturno.
- Evaluación comparativa de finetunes: útil para medir el impacto del tuning multietapa del autor frente al base en tareas de razonamiento, con la cautela de que no hay benchmarks publicados.
- Base para nuevos ajustes: al estar bajo Apache 2.0 y en formato transformers, puede servir como punto de partida para finetunes posteriores con LoRA o QLoRA en dominios específicos.
- Docencia sobre riesgos de modelos sin moderación: permite ilustrar en un entorno controlado los peligros de desplegar modelos "uncensored" en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye referencias a "benches" en repositorios GGUF externos, pero no se aportan cifras verificables (MMLU, HumanEval, GSM8K u otras) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda GPU de 80 GB (A100 80GB, H100 80GB) para contexto largo.
- Cuantización a 8 bits: ~28 GB de pesos, viable en una RTX 4090 (24 GB) solo con cuantizaciones más agresivas o descarga parcial; en la práctica requiere 2×RTX 4090 o una A6000 de 48 GB.
- Cuantización a 4 bits (GGUF Q4): ~14-16 GB, cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
- GPU recomendadas: H100 80GB o A100 80GB para precisión completa; RTX 4090/3090 para cuantizaciones de 4 bits.
- Opciones de despliegue: transformers (formato nativo del repo); llama.cpp u Ollama para los GGUF publicados en repos separados; vLLM y TGI no están confirmados para esta variante.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto, sin datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | ~27,8 B | no disponible | Apache 2.0 | safetensors, GGUF | Finetune uncensored de nicho, 19 descargas |
| Qwen/Qwen3.8-27B (base) | ~27,8 B | no disponible | Apache 2.0 | safetensors | Modelo original alineado, referencia de comparación |
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | ~27,8 B | no disponible | Apache 2.0 | safetensors, GGUF | Variante del mismo autor con 5 modos de razonamiento e instrucción |
| Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU | ~27 B | no disponible | Apache 2.0 | GGUF | Finetune previo del mismo autor, más descargado según la model card |

No se dispone de datos de rendimiento comparables (benchmarks) para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- Modelo "uncensored": se ha eliminado deliberadamente la moderación, por lo que puede generar contenido ofensivo, ilegal o peligroso; no es apto para despliegues públicos sin filtros externos.
- Riesgo elevado de alucinación: no hay evaluación publicada de fidelidad factual ni de tasas de error.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0 heredada: permite uso comercial, pero el autor no ofrece garantías ni asume responsabilidad sobre el contenido generado; el despliegue comercial de un modelo sin moderación puede incumplir la normativa de servicios digitales de la UE (DSA) y otras regulaciones.
- Procedencia del ajuste opaca: no se detalla el dataset ni el proceso de entrenamiento, lo que impide auditar sesgos o contaminación de datos.
- Repositorio con muy poca tracción (19 descargas, 0 likes) y model card centrada en promoción cruzada de otros repositorios, sin documentación técnica sustantiva.
- Los enlaces a GGUF y a otras variantes apuntan a repositorios del mismo autor; su disponibilidad y calidad no están verificadas en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Yeahutoo/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF release #1 (autor): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Variante TWIN-TURBO (fuente): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Variante TWIN-TURBO (GGUF): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Variante ULTRA-HERETIC: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Proyecto UltimateDetails2: https://huggingface.co/DavidAU/Qwen3.8-27B-UltimateDetails2-stage1__The-Harley-Pelican
- Qwen3.6-27B Fable Fusion 711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.6-40B Deckard: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Qwen3.5-9B The Defiant: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
