# SZLHOLDINGS/khipu-abstain-r3-candidate

## Resumen

khipu-abstain-r3-candidate es un repositorio alojado en Hugging Face por la organización SZLHOLDINGS que, según su propia model card, no contiene pesos del modelo. Se trata de un artefacto de tipo "proposal-only" y "not-promotable" que únicamente publica un informe de evaluación de entrenamiento (`training-eval-report.json`) correspondiente a una ronda R3 de reentrenamiento orientada a la abstención (abstention). El modelo base declarado es Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros desarrollado por Alibaba Qwen.

La relevancia de este repositorio es metodológica más que práctica: documenta un experimento de ajuste fino sobre un modelo pequeño con el objetivo de que el sistema aprenda a abstenerse de responder cuando no dispone de información fiable, un patrón relevante para reducir alucinaciones en asistentes desplegados en producción. Sin embargo, al no incluir pesos, no es directamente desplegable ni evaluable de forma independiente.

No se dispone de información sobre arquitectura específica del ajuste, datos de entrenamiento, hiperparámetros ni resultados numéricos más allá de la referencia al informe JSON enlazado en el repositorio fuente (szl-holdings/szl-forge, commit 054a2235). Cualquier dato técnico del modelo ajustado debe considerarse no disponible en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: transformer decoder-only Qwen2.5-1.5B-Instruct) |
| Parámetros totales | no disponible para el ajuste; el base declara 1.5B |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible para el ajuste; el base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens según su propia documentación, no verificable aquí |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio no contiene pesos; solo `training-eval-report.json`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del ajuste. El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar y 1.500 millones de parámetros, pero la model card de este repositorio no especifica si el resultado es un fine-tune completo, un adaptador LoRA, una fusión o un checkpoint intermedio. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO o preferencia.

El único dato técnico concreto es la existencia de un informe de evaluación (`training-eval-report.json`) asociado a la ronda R3 de un pipeline de reentrenamiento orientado a la abstención, alojado en el repositorio szl-holdings/szl-forge en el commit 054a2235. El repositorio se marca explícitamente como "proposal-only" y "not-promotable", lo que sugiere que se trata de un candidato en fase de propuesta interna que no ha superado los criterios de promoción a publicación ni de elegibilidad para autonomía. No se dispone de información sobre innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- No se dispone de información verificable sobre las capacidades del ajuste, ya que el repositorio no contiene pesos ni una descripción funcional del modelo resultante.
- Por herencia del modelo base Qwen2.5-1.5B-Instruct, cabría esperar generación de texto, razonamiento básico, código y matemáticas elementales, pero estas capacidades no están confirmadas para el ajuste R3.
- El objetivo declarado del experimento es la abstención: el modelo debería aprender a declarar desconocimiento en lugar de generar respuestas inventadas, aunque no se aportan métricas que lo confirmen.
- Soporte de tool calling / function calling: no disponible para el ajuste.
- Soporte de agentes y razonamiento multi-paso: no disponible para el ajuste.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Evaluación de metodologías de abstención: el repositorio puede usarse como referencia para estudiar cómo se documenta un pipeline de reentrenamiento orientado a reducir alucinaciones, aunque no permite reproducir el experimento sin los pesos.
- Auditoría de artefactos de propuesta interna: equipos de gobernanza de modelos pueden inspeccionar el informe JSON para entender qué criterios se aplicaron antes de marcar el candidato como "not-promotable".
- Investigación sobre calibración de confianza en modelos pequeños: sirve como punto de partida conceptual para diseñar experimentos propios de abstención sobre Qwen2.5-1.5B-Instruct, partiendo del modelo base público.
- Docencia y formación en MLOps: el repositorio ilustra el patrón de separar artefactos de evaluación de los pesos, útil para enseñar trazabilidad de experimentos.
- Comparación de políticas de publicación: permite analizar cómo una organización etiqueta candidatos no elegibles frente a releases estables, como ejercicio de diseño de procesos internos.
- Reproducción desde el modelo base: un equipo podría replicar el experimento partiendo directamente de Qwen/Qwen2.5-1.5B-Instruct y del repositorio szl-forge, aunque debería aportar sus propios datos y pesos, ya que este repositorio no los incluye.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio referencia un `training-eval-report.json` en el repositorio fuente, pero su contenido no se ha proporcionado y no se pueden citar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el ajuste, al no existir pesos publicados.
- Como referencia del modelo base Qwen2.5-1.5B-Instruct: en FP16 requiere aproximadamente 3 GB de VRAM; en cuantización de 8 bits, en torno a 1,6 GB; en 4 bits, alrededor de 1 GB, aunque estos valores no están confirmados en la información proporcionada.
- GPU recomendadas: no disponible para el ajuste. Para el base, una GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) sería suficiente en cuantizaciones bajas.
- ¿Cabe en GPU consumer? No evaluable para el ajuste; para el base, previsiblemente sí, pero no verificable con los datos aportados.
- Opciones de despliegue: no disponible para el ajuste. Para el base, vLLM, llama.cpp, Ollama y TGI son opciones habituales, pero no se confirman en este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Pesos publicados | Estado |
|---|---|---|---|---|---|
| SZLHOLDINGS/khipu-abstain-r3-candidate | no disponible (base 1.5B) | no disponible | apache-2.0 | No (solo informe JSON) | proposal-only, not-promotable |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | hasta 32.768 tokens según su model card | apache-2.0 | Sí | Release estable |
| SZLHOLDINGS/khipu-r3 | no disponible | no disponible | no disponible | No confirmado en la información | Referenciado como base de adaptadores |

La comparación con alternativas de la misma categoría (modelos pequeños orientados a abstención) no está disponible, ya que no se han identificado en la búsqueda web otros modelos con el mismo objetivo y características verificables.

## Limitaciones y advertencias

- El repositorio no contiene pesos: no es posible ejecutar el modelo ni reproducir sus resultados a partir de este artefacto.
- Etiquetado explícito como "proposal-only" y "not-promotable": el propio autor indica que no es apto para publicación ni para autonomía, por lo que no debe usarse en producción.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5-1.5B-Instruct hereda potencialmente los sesgos del modelo base, no evaluados aquí.
- Riesgo de alucinación: el objetivo del experimento es precisamente mitigarlo mediante abstención, pero no hay métricas publicadas que cuantifiquen la mejora.
- Limitaciones de contexto e idioma: no disponibles para el ajuste.
- Licencia apache-2.0 declarada, lo que en principio permitiría uso comercial, pero la ausencia de pesos hace la licencia inaplicable en la práctica a este repositorio.
- Caveat para producción: cualquier despliegue basado en este candidato carecería de trazabilidad de pesos y de evaluación independiente; se recomienda partir del modelo base público si se necesita un sistema funcional.
- Fecha de creación y actualización (2026-11-05) y cero descargas o likes: repositorio sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/khipu-abstain-r3-candidate
- Modelo base Qwen/Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio fuente szl-forge (commit 054a2235): https://github.com/szl-holdings/szl-forge/tree/054a223556c74b783d919f9bff145e1660844921
- Búsqueda de modelos con etiqueta khipu en Hugging Face: https://huggingface.co/models?other=khipu
- Adaptadores para SZLHOLDINGS/khipu-r3: https://huggingface.co/models?other=base_model%3Aadapter%3ASZLHOLDINGS%2Fkhipu-r3
