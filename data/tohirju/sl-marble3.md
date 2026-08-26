# Tohirju/sl-marble3

## Resumen

El modelo `Tohirju/sl-marble3` es un modelo de lenguaje de 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) alojado en Hugging Face por el usuario Tohirju. Su etiqueta `qwen3_5_text` sugiere que podría estar basado en la arquitectura Qwen 3.5 para texto, aunque no hay documentación oficial que lo confirme. El repositorio tiene un tamaño de 17,9 GB y los pesos están en formato `safetensors`.

Este modelo destaca por su acceso restringido (gated) y una licencia marcada como "other", lo que implica condiciones de uso no especificadas. No se ha publicado ninguna descripción, tarjeta de modelo ni resultados de evaluación, por lo que su comportamiento y capacidades reales son desconocidos. La fecha de creación (2026) sugiere que es un lanzamiento reciente, pero la ausencia de información técnica limita cualquier análisis objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta sugiere `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (condiciones no especificadas) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados ni las técnicas de optimización (como RLHF o DPO). La única pista es la etiqueta `qwen3_5_text`, que podría indicar una derivación de los modelos Qwen 3.5, pero no hay confirmación oficial. Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni innovaciones técnicas específicas.

## Capacidades

No se ha publicado ninguna lista de capacidades. Al ser un modelo de texto (según la etiqueta), es plausible que pueda realizar tareas de generación de texto, razonamiento, codigo o multilingüismo, pero no hay evidencia verificable. Tampoco se conocen capacidades de tool calling, agentes o procesamiento multimodal.

## Casos de uso

No se dispone de información suficiente para proponer casos de uso concretos. Sin documentación sobre el rendimiento o las capacidades, no es posible recomendar el modelo para ningún escenario específico. Se recomienda esperar a que el autor publique una tarjeta de modelo o resultados de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

No hay información oficial sobre requisitos de hardware. Como referencia orientativa, un modelo de ~8,95 mil millones de parámetros en precisión FP16 requiere aproximadamente 18 GB de VRAM para inferencia. Con cuantizaciones de 4 bits (como GGUF Q4_K_M), podría ejecutarse en GPUs con 6-8 GB de VRAM (por ejemplo, RTX 3060 o RTX 4060). Sin embargo, esto es una estimación genérica y no está confirmada para este modelo concreto. No se han proporcionado opciones de despliegue ni métricas de latencia.

## Comparativa con modelos similares

No disponible. No se ha publicado información que permita comparar este modelo con alternativas de su misma categoría (por ejemplo, otros modelos de ~9B parámetros como Qwen2.5-8B o Llama-3.1-8B). Se desconoce si su rendimiento es comparable a estos.

## Limitaciones y advertencias

- No existe información sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia es `other`, lo que implica condiciones no claras; se debe contactar con el autor antes de cualquier uso comercial.
- El acceso es restringido (gated), lo que requiere aceptar condiciones adicionales en Hugging Face.
- Al ser un modelo sin documentación, no se recomienda su uso en entornos de producción sin una evaluación previa.
- La ausencia de benchmarks y de descripción técnica impide conocer sus puntos débiles y fuertes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Tohirju/sl-marble3)
- [Perfil del autor](https://huggingface.co/Tohirju)
- [Modelo relacionado (sin documentación)](https://huggingface.co/Tohirju/sl-marble)
