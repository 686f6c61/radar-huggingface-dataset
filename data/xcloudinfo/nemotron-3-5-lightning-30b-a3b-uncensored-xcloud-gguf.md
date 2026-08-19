# xCloudinfo/Nemotron-3.5-Lightning-30B-A3B-Uncensored-xCloud-GGUF

## Resumen

El modelo `xCloudinfo/Nemotron-3.5-Lightning-30B-A3B-Uncensored-xCloud-GGUF` es una versión cuantizada en formato GGUF del modelo base de NVIDIA `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, al que se le ha aplicado una técnica de abliteración (ablación direccional) para eliminar el comportamiento de rechazo excesivo del sistema de seguridad. El resultado es un modelo que responde de forma más directa, incluso a solicitudes que el modelo original podría rechazar, manteniendo la arquitectura híbrida original.

El modelo base emplea una arquitectura híbrida que combina capas de Mamba-2 (SSM), Mixture-of-Experts (MoE) y atención selectiva, con un total de aproximadamente 30 000 millones de parámetros de los cuales solo unos 3 000 millones se activan durante la inferencia. Incluye Multi-Token Prediction (MTP) y admite una ventana de contexto de hasta 1 000 000 de tokens. La licencia OpenMDW-1.1 permite uso comercial.

Este lanzamiento es relevante porque ofrece a desarrolladores e investigadores una versión sin restricciones de seguridad de un modelo de última generación, en formato GGUF listo para usar con llama.cpp. Su procesamiento se realizó en un único dispositivo de memoria unificada para preservar la coherencia de la recurrencia SSM, un detalle técnico importante para modelos híbridos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Mamba-2 + MoE + Attention (capas intercaladas), con Multi-Token Prediction (MTP) |
| Parametros totales | 32.913.266.240 (nominal 30B) |
| Parametros activos | ~3B (MoE) |
| Longitud de contexto | Hasta 1.000.000 tokens (según model card) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ2_M |
| Idiomas soportados | en, zh |
| Licencia | OpenMDW-1.1 (Linux Foundation, uso comercial permitido) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` fue desarrollado por NVIDIA y utiliza una arquitectura híbrida que intercala capas de Mamba-2 (modelos de espacio de estado) con capas MoE y capas de atención selectiva. Esta combinación permite un equilibrio entre eficiencia computacional y capacidad de razonamiento, con solo ~3B de parámetros activos por token. El modelo incorpora además Multi-Token Prediction, que predice varios tokens futuros simultáneamente para acelerar la inferencia.

Sobre este modelo base, el autor (xCloudinfo) aplicó una técnica de abliteración basada en el trabajo de Arditi et al. (2024). El proceso consistió en identificar la "dirección de rechazo" en las matrices de escritura residual (las proyecciones `o_proj` de atención y `down_proj` de todos los expertos MoE, 2.973 matrices en total) y ortogonalizarla con una fuerza de 0,8. Las proyecciones `out_proj` de las capas Mamba y la cabeza de borrador MTP se dejaron intactas para preservar la coherencia de la arquitectura híbrida. No se realizó ningún reentrenamiento; solo se modificaron los pesos mediante esta técnica. El procesamiento se llevó a cabo en un único dispositivo de memoria unificada, ya que la división entre múltiples GPUs habría corrompido la recurrencia SSM y generado una dirección de rechazo incorrecta.

## Capacidades

- Generación de texto en inglés y chino, con soporte para conversaciones multi-turno.
- Razonamiento profundo con un modo de pensamiento (thinking) activado por defecto, que requiere un presupuesto de tokens suficiente (recomendado `max_tokens >= 2000`) para que la respuesta converja.
- Ventana de contexto de hasta 1.000.000 de tokens, adecuada para documentos extensos y tareas que requieren memoria a largo plazo.
- Multi-Token Prediction (MTP) que acelera la generación al predecir múltiples tokens a la vez.
- Comportamiento "uncensored": el modelo ha sido ablacionado para eliminar la tendencia al rechazo, por lo que responde directamente a solicitudes que el modelo original podría bloquear. Esto incluye temas sensibles o de doble uso, con la responsabilidad ética y legal del usuario.
- No se mencionan capacidades explícitas de tool calling, function calling ni soporte de agentes en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos: gracias a su contexto de 1M tokens, el modelo puede procesar contratos, informes técnicos o investigaciones completas en una sola pasada, resumiendo o extrayendo información clave sin perder el hilo.
- Asistente de investigación académica: útil para explorar hipótesis, redactar borradores de artículos o realizar lluvias de ideas en áreas donde el modelo original podría ser demasiado restrictivo (por ejemplo, discusión de temas controvertidos o de doble uso).
- Generación de contenido creativo: novelas, guiones o diálogos que requieren un tono sin censura, donde el usuario asume la responsabilidad de cumplir con la legalidad y la ética.
- Traducción y localización entre inglés y chino: el modelo maneja ambos idiomas y puede mantener el contexto largo en textos técnicos o literarios.
- Prototipado de agentes conversacionales: para entornos de investigación donde se necesita un comportamiento menos restringido, por ejemplo en estudios sobre alineación o seguridad de IA.
- Despliegue local en hardware de consumo: con la cuantización Q4_K_M (24 GB) se puede ejecutar en una GPU de gama alta para uso personal o en entornos de desarrollo sin depender de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización:
  - Q8_0: ~33 GB
  - Q6_K: ~33 GB
  - Q5_K_M: ~26 GB
  - Q4_K_M: ~24 GB (recomendado para despliegue)
  - IQ4_XS: ~18 GB
  - IQ2_M: ~18 GB
- GPUs recomendadas:
  - Para Q4_K_M (24 GB): RTX 4090, RTX 6000 Ada, A6000.
  - Para Q8_0 (33 GB): A100 40 GB, A100 80 GB, o dos GPUs en configuración de memoria unificada (aunque el procesamiento se hizo en un solo dispositivo, la inferencia puede requerir más).
  - Para IQ4_XS/IQ2_M (18 GB): RTX 4080, RTX 3090, o GPUs con 24 GB pero dejando margen.
- El modelo está diseñado para ejecutarse con llama.cpp y `llama-server`. También es compatible con otros frontends que acepten GGUF, como Ollama (si se importa el archivo).
- Latencia y throughput: no se proporcionan datos concretos. Al ser un modelo MoE con solo ~3B activos, la velocidad de generación será significativamente mayor que la de un modelo denso de 30B, aunque depende del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Método |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B (base) | 32.9B | ~3B | 1M | OpenMDW-1.1 | Entrenamiento original |
| Nemotron-3.5-Lightning-30B-A3B-Uncensored (este) | 32.9B | ~3B | 1M | OpenMDW-1.1 | Abliteración |
| Qwen3-30B-A3B (referencia) | ~30B | ~3B | 128K (aprox.) | Apache 2.0 | Entrenamiento original |

No se dispone de datos de rendimiento comparativo. La principal diferencia frente al modelo base es la eliminación del comportamiento de rechazo, lo que afecta a la seguridad pero no a las capacidades generales.

## Limitaciones y advertencias

- El modelo ha sido sometido a abliteración, lo que elimina la capa de rechazo de seguridad. Puede responder a solicitudes sensibles, ilegales o de doble uso sin filtros. El usuario es el único responsable de un uso legal, ético y conforme a la normativa.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en temas de actualidad o con presupuestos de pensamiento insuficientes.
- El razonamiento (thinking) está activado por defecto y requiere un `max_tokens` alto (≥ 2000) para que la respuesta converja; de lo contrario, la salida puede quedar incompleta o incoherente.
- El modelo tiende a asumir un año pasado si no se le inyecta la fecha actual en el system prompt.
- Solo soporta inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- Para el procesamiento SSM, el modelo debe cargarse en un único dispositivo; la distribución entre múltiples GPUs puede degradar la calidad de la dirección de rechazo y el comportamiento general.
- La licencia OpenMDW-1.1 permite uso comercial, pero exige conservar el aviso de licencia y los derechos de autor al redistribuir el modelo. No hay restricciones sobre los outputs.
- El modelo está destinado a investigación y validación técnica interna según el autor; no se recomienda su uso en producción sin una evaluación rigurosa de riesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xCloudinfo/Nemotron-3.5-Lightning-30B-A3B-Uncensored-xCloud-GGUF
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Colección de modelos NVIDIA Nemotron v3: https://huggingface.co/collections/nvidia/nvidia-nemotron-v3
- Página del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
- GGUF oficial del modelo base (sin abliterar): https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
