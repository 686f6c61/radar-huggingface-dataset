# Tiendat88/vi-legal-query-rewriter-lora

## Resumen

`Tiendat88/vi-legal-query-rewriter-lora` es un adaptador LoRA publicado deliberadamente como un **resultado negativo documentado**. Desarrollado por Tiendat88 (Pham Tien Dat), el adaptador se entrenó sobre la base `mlx-community/Qwen2.5-7B-Instruct-4bit` con el objetivo de reescribir consultas legales en vietnamita coloquial a un lenguaje jurídico formal, como nodo de entrada para un sistema RAG sobre 242.063 artículos estatutarios vietnamitas. La motivación era cerrar la brecha de vocabulario entre cómo preguntan los usuarios y cómo están redactadas las leyes.

Sin embargo, las mediciones sobre un conjunto de prueba retenido muestran que el adaptador **empeora la recuperación**: Recall@1 cae un 42% en comparación con pasar la pregunta sin modificar. La pérdida de validación bajó de 4,567 a 1,586, lo que demuestra que el entrenamiento "funcionó" en términos de loss, pero el modelo aprendió a producir consultas que dañan el sistema. El autor publica el adaptador con un diagnóstico completo de la causa raíz: los pares de entrenamiento fueron generados por destilación de un modelo de 35B que podía ver el documento de origen, por lo que generaba referencias a títulos de documentos en lugar de paráfrasis ricas en contenido.

La relevancia de esta ficha no es como modelo desplegable, sino como **caso de estudio metodológico** para la comunidad de IA aplicada: demuestra que las métricas de entrenamiento convencionales no garantizan calidad en el producto final y que la evaluación a nivel de recuperación es imprescindible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen2.5-7B-Instruct-4bit (base congelada, QLoRA) |
| Parametros totales | no disponible (adaptador LoRA, repo 0.1 GB; base 7B cuantizada a 4-bit) |
| Parametros activos | no disponible (solo adaptador LoRA, rank 16, últimas 16 de 28 capas) |
| Longitud de contexto | 512 tokens (max_seq_len de entrenamiento) |
| Tipos de cuantizacion | Base en 4-bit (MLX), adaptador LoRA en precisión nativa de MLX |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El adaptador utiliza **LoRA** con rango 16, escala 20.0 y dropout 0.05, aplicado a las últimas 16 de 28 capas del transformer Qwen2.5-7B-Instruct. La base está cuantizada a 4-bit y congelada (QLoRA). El entrenamiento se realizó con AdamW (lr 1e-4, decaimiento coseno a 1e-5, warmup 30) durante 448 pasos, equivalentes a aproximadamente 2 épocas sobre 894 pares de entrenamiento con batch size 4. Se configuró `mask_prompt: true` para que la pérdida solo se calculase sobre la salida (la consulta reescrita), no sobre el prompt.

Los datos de entrenamiento se generaron por **destilación**: un modelo de 35B leyó cada artículo legal y produjo tanto una pregunta coloquial como una consulta legal "correcta". El fallo principal fue que el profesor podía ver el artículo completo, por lo que generaba consultas que nombraban el documento (por ejemplo, "Ley de modificación de la Ley de Fronteras...") en lugar de parafrasear el contenido. El análisis sobre el conjunto de entrenamiento mostró que el 67% de las consultas objetivo comenzaban con un tipo de documento y que solo se retenía el 25% de las palabras de contenido de la pregunta original.

Un hallazgo secundario relevante es la **memorización visible en la curva de pérdida**: la pérdida de entrenamiento cayó abruptamente de 1,607 a 0,831 en el paso 240, coincidiendo con el inicio de la segunda época, mientras que la pérdida de validación se aplanó. Esto sugiere que una sola época habría sido suficiente. Además, se documenta que `mlx-lm` por defecto usa `mask_prompt: false`, lo que habría hecho que el modelo aprendiera también a "preguntar la pregunta", algo indeseable para esta tarea.

## Capacidades

- **Reescritura de consultas legales en vietnamita**: el adaptador transforma preguntas coloquiales en consultas formales, pero con un rendimiento de recuperación muy deficiente (R@1 de 0,123 frente a 0,213 sin reescritura).
- **Generación de texto**: como adaptador sobre Qwen2.5-7B-Instruct, hereda las capacidades de generación del modelo base, pero no se ha evaluado para tareas generales.
- **Sin soporte de tool calling**: no se menciona ni se ha entrenado para ello.
- **Sin capacidades de agente**: es un nodo de preprocesamiento, no un agente autónomo.
- **Multilingüe**: solo vietnamita, aunque la base Qwen2.5 soporta múltiples idiomas.
- **Sin modo de razonamiento especial**: no hay indicios de thinking mode ni otras capacidades adicionales.

## Casos de uso

Dado que el propio autor advierte explícitamente **"Do not deploy this adapter"**, no se recomienda su uso en producción. Los casos de uso realistas son de carácter metodológico y de investigación:

- **Reproducción de resultados negativos**: investigadores pueden cargar el adaptador y reproducir las métricas de recuperación para verificar el fenómeno documentado.
- **Estudio de la brecha entre pérdida y calidad**: sirve como ejemplo didáctico de cómo una pérdida decreciente puede acompañar a una degradación del rendimiento del sistema final.
- **Análisis de errores en destilación de datos**: el diagnóstico de la causa raíz (el profesor que ve la respuesta) es un caso de estudio para quienes diseñan pipelines de generación de datos sintéticos.
- **Evaluación de pipelines RAG**: se puede usar como contraste para demostrar que un nodo de reescritura no siempre mejora la recuperación, especialmente cuando el retriever ya es fuerte.
- **Desarrollo de mejores adaptadores**: los datos y la configuración pueden servir de base para entrenar un adaptador corregido que evite los errores documentados.
- **Investigación en recuperación legal vietnamita**: el conjunto de 122 preguntas de prueba y la metodología de evaluación (separación por documento fuente) son reutilizables para futuros trabajos.

## Benchmarks y rendimiento

La model card proporciona resultados sobre un conjunto de prueba retenido de 122 preguntas, con separación por documento fuente para evitar solapamiento entre entrenamiento y prueba. El sistema de recuperación es híbrido (denso + BM25 con fusión RRF).

| Modo | R@1 | R@3 | R@5 | R@10 | R@20 | MRR |
|---|---|---|---|---|---|---|
| **off** (pregunta sin modificar) | **0,213** | 0,328 | **0,500** | **0,607** | **0,680** | **0,321** |
| **base** (modelo base + prompt) | 0,205 | **0,352** | 0,434 | 0,516 | 0,590 | 0,306 |
| **adapter** (este modelo) | 0,123 | 0,180 | 0,205 | 0,279 | 0,336 | 0,164 |

El adaptador empeora todas las métricas salvo R@3 (donde el modelo base es mejor). La conclusión del autor es que "no hacer nada gana". No se proporcionan benchmarks adicionales (MMLU, HumanEval, etc.) porque no es un modelo de propósito general.

## Requisitos de hardware

- **VRAM estimada**: el entrenamiento se realizó en un Apple M3 Max con 64 GB de RAM unificada, con un pico de 10,1 GB. La inferencia del adaptador sobre la base 4-bit debería caber en GPUs con 8-12 GB de VRAM, aunque no se han publicado mediciones específicas.
- **GPU recomendadas**: cualquier GPU con soporte MLX (Apple Silicon) o, para otros entornos, sería necesario convertir los pesos a otro formato (no se ha probado).
- **Compatibilidad con consumer GPU**: probablemente sí en GPUs con 8 GB o más, dado el tamaño del adaptador (0,1 GB) y la base cuantizada a 4-bit, pero no hay confirmación oficial.
- **Opciones de despliegue**: el uso previsto es mediante `mlx_lm.load` con `adapter_path`. No se mencionan vLLM, Ollama ni TGI.
- **Latencia y throughput**: durante el entrenamiento se reportaron ~35 tokens/s en M3 Max, pero no hay datos de inferencia.

## Comparativa con modelos similares

No hay modelos comparables directos con resultados publicados en la misma tarea (reescritura de consultas legales vietnamitas). El autor menciona que el sistema anfitrión alcanzó R@1 de 0,870 sin reescritura usando reranking con cross-encoder y prior de jerarquía legal, lo que sugiere que la reescritura no era necesaria. Existen otros adaptadores de reescritura de consultas, como el de IBM Granite 3.3-8b (que sí mejora la recuperación), pero no son comparables por idioma y dominio.

| Modelo | Tarea | Idioma | Resultado |
|---|---|---|---|
| Tiendat88/vi-legal-query-rewriter-lora | Reescritura de consultas legales | vietnamita | R@1 0,123 (degradación del 42%) |
| ibm-granite/granite-3.3-8b-rag-agent-lib (query_rewrite_lora) | Reescritura de consultas RAG | inglés | Mejora de ~21 puntos porcentuales en R@1 (según README) |
| Sin reescritura (línea base) | — | vietnamita | R@1 0,213 |

## Limitaciones y advertencias

- **No desplegar en producción**: el autor lo advierte explícitamente. El adaptador degrada la recuperación en un 42% (R@1).
- **Causa raíz documentada**: los datos de entrenamiento contienen referencias a títulos de documentos en lugar de paráfrasis de contenido, lo que enseña al modelo a generar citas falsas (el 66% de los objetivos contenían un número de documento).
- **Sesgo hacia nombres de documentos**: el modelo tiende a producir consultas que comienzan con el tipo de documento, lo que no ayuda al retriever basado en texto de artículo.
- **Riesgo de alucinación de citas**: si se usara en un sistema legal, podría fabricar referencias a documentos inexistentes o incorrectos.
- **Limitación de contexto**: entrenado con max_seq_len de 512 tokens, no apto para consultas largas.
- **Idioma**: solo vietnamita, sin evaluación en otros idiomas.
- **Licencia**: Apache-2.0 permite uso comercial, pero el autor desaconseja su uso en cualquier entorno real.

## Enlaces

- [HuggingFace: Tiendat88/vi-legal-query-rewriter-lora](https://huggingface.co/Tiendat88/vi-legal-query-rewriter-lora)
- [Modelo base: mlx-community/Qwen2.5-7B-Instruct-4bit](https://huggingface.co/mlx-community/Qwen2.5-7B-Instruct-4bit)
- [Dataset: th1nhng0/vietnamese-legal-documents](https://huggingface.co/datasets/th1nhng0/vietnamese-legal-documents)
- [Fuente de datos legales: vbpl.vn](https://vbpl.vn/)
- [GitHub del autor: Tiendat88](https://github.com/Tiendat88/)
- [Referencia de adaptador de reescritura de IBM (para comparación metodológica)](https://huggingface.co/ibm-granite/granite-3.3-8b-rag-agent-lib/blob/main/query_rewrite_lora/README.md)
