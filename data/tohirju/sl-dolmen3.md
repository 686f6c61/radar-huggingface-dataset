# Tohirju/sl-dolmen3

## Resumen

Tohirju/sl-dolmen3 es un modelo de lenguaje publicado en HuggingFace por el usuario Tohirju, con un tamaño de 8.953.803.264 parámetros (aproximadamente 8,95 mil millones). Se distribuye en formato GGUF, lo que indica que está preparado para inferencia en CPU y GPU mediante librerías como llama.cpp o sus derivados (Ollama, LM Studio). El repositorio tiene un tamaño de 7,4 GB, consistente con una cuantización de 8 bits o menor para un modelo de este tamaño.

La página del modelo no ofrece información sobre arquitectura, datos de entrenamiento, contexto máximo, idiomas soportados ni benchmarks. El acceso es restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargar los pesos. La licencia se indica como "other", sin más detalles. Se etiqueta como "conversational" y "endpoints_compatible", pero no se especifica ninguna capacidad concreta.

Este modelo es relevante por su tamaño medio y su formato GGUF, que lo hace accesible para despliegues en hardware de consumo. Sin embargo, la ausencia de documentación técnica y de resultados de evaluación impide realizar una evaluación rigurosa de sus capacidades. Cualquier uso en producción debe considerar esta falta de información.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF implica cuantización, pero no se especifican variantes) |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (si es transformer, MoE, SSM, etc.). Tampoco se dispone de datos sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. El repositorio solo incluye el modelo cuantizado en GGUF, sin documentación adicional.

## Capacidades

- No se dispone de información sobre capacidades de generación de texto, razonamiento, código, matemáticas, visión u otras modalidades.
- No se ha confirmado soporte para tool calling, function calling ni uso como agente.
- No se han documentado capacidades multilingües.
- No se indica si el modelo dispone de modo de pensamiento (thinking mode) o capacidades de audio.

## Casos de uso

No se dispone de información suficiente para proponer casos de uso concretos. El modelo no ha sido documentado ni evaluado públicamente, por lo que cualquier aplicación práctica sería especulativa. Se recomienda obtener acceso y realizar pruebas propias antes de considerarlo para cualquier escenario de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- No se dispone de estimaciones oficiales de VRAM para inferencia.
- El formato GGUF permite ejecución en CPU con llama.cpp, pero se desconoce el rendimiento real.
- No se ha confirmado compatibilidad con vLLM, TGI u otros servidores de inferencia.
- No se conocen datos de latencia ni throughput.

## Comparativa con modelos similares

No se ha identificado ningún modelo comparable con la información disponible. No hay datos de rendimiento ni especificaciones técnicas que permitan una comparación objetiva.

## Limitaciones y advertencias

- Acceso restringido: es necesario solicitar acceso y aceptar condiciones en HuggingFace, lo que puede retrasar la descarga.
- Licencia "other" sin especificar: no se conocen los términos de uso comercial, redistribución o modificación.
- Ausencia de documentación técnica: no se han publicado detalles de arquitectura, entrenamiento, contexto ni idiomas.
- Riesgo de alucinación y sesgos: sin información sobre el dataset de entrenamiento, no se puede evaluar el riesgo de sesgos o errores.
- Sin garantías para producción: la falta de benchmarks y de documentación hace que su uso en entornos críticos sea arriesgado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Tohirju/sl-dolmen3
- No se han encontrado papers, blogs, repositorios de código ni demos asociados al modelo.
