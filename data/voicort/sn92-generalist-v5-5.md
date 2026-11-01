# voicort/sn92-generalist-v5-5

## Resumen

voicort/sn92-generalist-v5-5 es un modelo de lenguaje de 26.085.330.160 parámetros (aproximadamente 26,1 mil millones) publicado por el usuario voicort en HuggingFace. Se distribuye en formato safetensors y está etiquetado con la arquitectura `qwen3_5`, lo que sugiere que deriva de la familia Qwen 3.5, aunque no se dispone de documentación oficial que lo confirme. El modelo se presenta como un "generalist decision-model" dentro del ecosistema sn92, con la etiqueta `reax` y una versión de evaluación `eval-v5`.

Se trata de un modelo de fusión (merge) construido a partir de cinco modelos base: baselabs/mammoth-1, edinlong83/sn92-generalist-h5, isomsom/sn92-gen-m87b, voicort/sn92-generalist-v5-4 y xflud/sn92-decider-1. Esta naturaleza de merge implica que sus capacidades heredan y combinan las de sus progenitores, sin que exista un proceso de entrenamiento documentado propio. La licencia es MIT, lo que facilita su uso comercial, pero el acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace.

El modelo es relevante para quienes exploran técnicas de model merging y buscan un modelo de tamaño medio-grande (26B) con licencia permisiva y orientación a toma de decisiones. No obstante, la ausencia de documentación técnica, benchmarks publicados y especificaciones detalladas limita seriamente su evaluación rigurosa antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag; no confirmado en documentación) |
| Parametros totales | 26.085.330.160 (~26,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `qwen3_5` apunta a una arquitectura transformer decoder-only de la familia Qwen 3.5, pero no se ha publicado documentación que detalle la configuración exacta (número de capas, dimensión oculta, cabezas de atención, tipo de atención, etc.). El modelo es un merge de cinco checkpoints, por lo que no ha sido entrenado desde cero ni sometido a un pipeline de preentrenamiento o alineación documentado por el autor de esta ficha.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. La etiqueta `reax` y la designación "decision-model" sugieren un enfoque hacia tareas de razonamiento y toma de decisiones, pero no hay evidencia técnica publicada que respalde esta orientación. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento general, heredado de los modelos base del merge (sin verificación independiente).
- Orientación declarada a la toma de decisiones ("decision-model"), aunque sin benchmarks que lo confirmen.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación en model merging: el modelo sirve como punto de partida para investigar cómo la combinación de cinco checkpoints afecta al comportamiento en tareas de decisión, comparando con cada modelo base por separado.
- Evaluación comparativa de merges: dado que el autor publica versiones sucesivas (v5-4, v5-5), puede usarse para estudiar la evolución del rendimiento entre iteraciones del mismo pipeline de fusión.
- Prototipado de asistentes de decisión: en entornos controlados, puede probarse como generador de recomendaciones o clasificaciones razonadas, siempre con validación humana y sin asumir calidad no verificada.
- Investigación académica sobre licencias permisivas: su licencia MIT permite incluirlo en estudios comparativos de modelos de ~26B sin restricciones de uso comercial, a diferencia de otros modelos con licencias más restrictivas.
- Base para fine-tuning posterior: al ser un merge con licencia MIT, puede servir como inicialización para ajuste supervisado en dominios específicos, aunque la falta de documentación sobre sus datos de origen exige cautela.
- Despliegue en pipelines internos de bajo riesgo: para tareas de generación de texto no críticas donde se acepte la ausencia de benchmarks y se realice una evaluación propia antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: ~26 GB para pesos, más overhead; viable en GPUs de 40-48 GB.
- VRAM estimada en cuantización de 4 bits: ~13-15 GB para pesos, más overhead; podría caber en GPUs consumer de 24 GB (RTX 3090/4090) con contexto limitado, aunque no se publican GGUF oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB para FP16; A6000/L40S para 8 bits; RTX 4090 para cuantización agresiva.
- Opciones de despliegue: vLLM o TGI para safetensors en FP16/BF16; llama.cpp/Ollama requerirían conversión a GGUF no publicada por el autor.
- Latencia y throughput estimados: no disponible (sin datos publicados).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Benchmarks |
|---|---|---|---|---|---|
| voicort/sn92-generalist-v5-5 | ~26,1B | no disponible | MIT | Gated | no disponible |
| Qwen2.5-32B | ~32,5B | 128K (según versión) | Apache 2.0 / Qwen license | Abierto | Publicados por Alibaba |
| Mistral Large / Mistral-Small | ~24B (Small) | 128K (Small) | Apache 2.0 (Small) | Abierto | Publicados por Mistral |
| Gemma 2 27B | ~27B | 8K | Gemma license | Abierto | Publicados por Google |

La comparación es aproximada: los modelos alternativos cuentan con documentación y benchmarks oficiales, mientras que sn92-generalist-v5-5 carece de ambos. La principal ventaja del modelo es su licencia MIT y su tamaño contenido; la principal desventaja es la opacidad total sobre su entrenamiento y rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay model card sustantiva, ni detalles de arquitectura, contexto o datos de entrenamiento.
- Sin benchmarks publicados: no es posible evaluar su calidad frente a alternativas sin realizar una evaluación propia.
- Naturaleza de merge: al combinar cinco checkpoints sin entrenamiento adicional documentado, puede heredar sesgos, inconsistencias o degradaciones de cualquiera de sus progenitores.
- Riesgo de alucinación: no cuantificado; al no haber datos de alineación, se desconoce el grado de fidelidad factual.
- Idiomas no especificados: no se puede asumir soporte multilingüe ni calidad en castellano.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en pipelines automatizados.
- Licencia MIT: permisiva para uso comercial, pero el autor no ofrece garantías sobre la procedencia de los datos de los modelos base, lo que podría plantear riesgos legales en despliegues comerciales.
- Sin cuantizaciones oficiales: la conversión a GGUF para despliegue en consumer GPU corre por cuenta del usuario.
- Fecha de creación futura (2026-10-29): metadato anómalo que conviene verificar antes de confiar en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/voicort/sn92-generalist-v5-5
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Modelo base: https://huggingface.co/edinlong83/sn92-generalist-h5
- Modelo base: https://huggingface.co/isomsom/sn92-gen-m87b
- Modelo base: https://huggingface.co/voicort/sn92-generalist-v5-4
- Modelo base: https://huggingface.co/xflud/sn92-decider-1
