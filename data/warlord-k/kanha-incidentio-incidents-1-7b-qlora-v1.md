# Warlord-K/kanha-incidentio-incidents-1.7b-qlora-v1

## Resumen

El modelo `Warlord-K/kanha-incidentio-incidents-1.7b-qlora-v1` es un fine-tuning QLoRA del modelo base `Qwen/Qwen3-1.7B`, desarrollado por Warlord-K (Yatharth Gupta) como parte de un experimento de investigación sobre métodos de entrenamiento con datasets derivados de sitios web. El checkpoint está entrenado específicamente sobre la documentación pública de incident.io, con el objetivo de evaluar la capacidad de respuesta a preguntas sobre contenido web en un entorno controlado.

El modelo tiene 1.720.574.976 parámetros (1,7B) y una longitud de contexto de entrenamiento de 2048 tokens. Se entrenó con 276 registros de entrenamiento y 33 de validación, durante 4 épocas, utilizando QLoRA con rank 64. Aunque el modelo base es Qwen3-1.7B, este checkpoint es un experimento de investigación y no está destinado a uso en producción sin una validación exhaustiva. Las métricas de evaluación reportadas muestran un recall alto en campos estructurados (fechas, listas, números, URLs) pero una tasa de aprobación determinista de 0,0, lo que indica que las respuestas generadas requieren revisión humana.

El modelo se distribuye en formato safetensors (bfloat16) y también incluye artefactos MLC cuantizados con `q4f16_1`. No se especifica licencia, lo que limita su uso comercial. Está orientado exclusivamente a investigación comparativa y evaluación controlada de QA sobre documentación web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 (máxima secuencia de entrenamiento) |
| Tipos de cuantizacion | q4f16_1 (MLC), bfloat16 (pesos originales) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors, MLC (q4f16_1) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3-1.7B, un transformer decoder-only con atención causal. El fine-tuning se realizó mediante QLoRA, una técnica que congela los pesos base e introduce adaptadores de bajo rango en las proyecciones lineales. En este caso, los adaptadores LoRA se aplicaron a `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rank 64, alpha 32 y dropout 0,05. El entrenamiento se realizó con una pérdida calculada únicamente sobre los tokens del asistente (assistant-only loss), con una tasa de aprendizaje de 5e-5, batch size por dispositivo de 4, gradiente acumulado de 2, warmup ratio de 0,1 y 4 épocas.

El dataset proviene de la documentación de incident.io (https://docs.incident.io), con un hash específico y 276 registros de entrenamiento, 33 de validación y 0 de holdout. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un fine-tuning supervisado estándar. El modelo final se fusionó en bfloat16.

## Capacidades

- Generación de texto conversacional en inglés, especializado en responder preguntas sobre la documentación de incident.io.
- Extracción de información estructurada: según las métricas de evaluación, alcanza un recall de 1,0 en fechas, listas, números y URLs dentro del contexto de la documentación.
- No se reporta soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se reportan capacidades multimodales (visión, audio) ni modo de pensamiento explícito.
- El modelo es monolingüe en inglés; no hay evidencia de capacidades multilingües.
- La tasa de rechazo (refusal_rate) es 0,0, lo que indica que el modelo tiende a responder siempre, incluso cuando no está seguro.

## Casos de uso

- Investigación académica sobre fine-tuning eficiente: el modelo sirve como punto de comparación para estudiar el impacto de QLoRA en modelos pequeños con datasets de dominio específico. Se puede utilizar para reproducir experimentos y analizar métricas de recall y precisión en tareas de QA estructurado.
- Evaluación controlada de QA sobre documentación web: dado que el dataset proviene de incident.io, el modelo puede usarse para probar pipelines de extracción de respuestas a partir de documentación técnica, midiendo recall de campos como fechas, URLs y listas.
- Benchmarking de métodos de cuantización: los artefactos MLC con `q4f16_1` permiten comparar el rendimiento de la cuantización frente al modelo en bfloat16 en términos de latencia y calidad de salida.
- Experimentos de memorización y generalización: el autor advierte que el modelo puede memorizar contenido del entrenamiento; esto lo hace útil para estudiar fenómenos de sobreajuste en fine-tuning con datasets pequeños.
- Desarrollo de chatbots locales para documentación interna: aunque no está validado para producción, podría servir como base para un prototipo de asistente que responda preguntas sobre la documentación de incident.io, siempre que se implemente una capa de revisión humana.
- Pruebas de integración con MLC (Machine Learning Compilation): el modelo incluye artefactos MLC, lo que permite probar su despliegue en entornos de navegador o dispositivos edge mediante la compilación a formatos optimizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas provienen de la evaluación interna del autor, que se muestran a continuación:

| Metrica | Valor |
|---|---|
| dates_recall | 1,0 |
| deterministic_pass_rate | 0,0 |
| list_recall | 1,0 |
| numbers_recall | 1,0 |
| refusal_rate | 0,0 |
| requires_review_rate | 1,0 |
| unsupported_value_rate | 0,0 |
| urls_recall | 1,0 |
| total | 3 |

Estas métricas indican que el modelo extrae correctamente campos estructurados (fechas, listas, números, URLs) pero ninguna respuesta pasa una verificación determinista, y todas requieren revisión humana. No hay datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, el modelo ocupa aproximadamente 3,4 GB (1,72B parámetros × 2 bytes), más overhead de activaciones y caché KV, por lo que se estima un consumo de 5-6 GB en inferencia con contexto de 2048 tokens. Con cuantización q4f16_1, el consumo se reduce a aproximadamente 1 GB de pesos, más overhead, estimándose 2-3 GB en total.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para bfloat16 (por ejemplo, RTX 2060, RTX 3060, RTX 4060) y 2-3 GB para la versión cuantizada (por ejemplo, GTX 1650, RTX 3050). También es viable en GPUs de datacenter como A10, A100 o H100, aunque no son necesarias.
- El modelo cabe en GPUs de consumo actuales, incluso en las de gama baja con cuantización.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama. Los artefactos MLC permiten despliegue en navegador o dispositivos edge mediante la compilación MLC.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 1,7B, se espera una latencia de decodificación de decenas de milisegundos por token en GPUs modernas, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fine-tuning QLoRA de Qwen3-1.7B sobre documentación web). El modelo base Qwen3-1.7B es la referencia natural, pero no se han publicado métricas comparativas entre el checkpoint y su base. Tampoco hay datos de otros fine-tunings similares en el ecosistema. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El autor advierte explícitamente que el modelo puede producir respuestas incorrectas, incompletas o desactualizadas, y que puede memorizar el contenido del entrenamiento.
- La tasa de aprobación determinista es 0,0 y todas las respuestas requieren revisión humana (`requires_review_rate` = 1,0), lo que lo hace inadecuado para uso no supervisado.
- La licencia no está especificada, lo que genera incertidumbre legal para cualquier uso comercial o redistribución.
- El modelo solo soporta inglés y su conocimiento se limita al contenido de la documentación de incident.io; no generaliza a otros dominios.
- La longitud de contexto está limitada a 2048 tokens, lo que restringe su uso en conversaciones largas o documentos extensos.
- El dataset de entrenamiento es muy pequeño (276 registros), lo que aumenta el riesgo de sobreajuste y alucinaciones.
- No se han realizado evaluaciones de sesgos ni de seguridad; no hay garantías sobre comportamiento ético o ausencia de contenido dañino.
- El modelo es un experimento de investigación y no está validado para entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Warlord-K/kanha-incidentio-incidents-1.7b-qlora-v1
- Perfil de GitHub del autor: https://github.com/Warlord-K
- SDK kanha-js (para chatbots locales de Kanha.ai): https://github.com/Warlord-K/kanha-js
- AI Incident Explorer (base de datos de incidentes de IA, no directamente relacionada pero referenciada en la búsqueda): https://aiincidents.org/explorer/
