# Tohirju/sl-dunlin2

## Resumen

El modelo `Tohirju/sl-dunlin2` es un repositorio alojado en HuggingFace que contiene pesos en formato GGUF, con un total de 26.895.998.464 parámetros (aproximadamente 26,9 mil millones). Fue creado por el usuario Tohirju el 3 de septiembre de 2026 y actualizado el mismo día. El repositorio tiene un tamaño de 99,0 GB, lo que sugiere que incluye múltiples archivos de cuantización GGUF. El acceso está restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de poder descargar los pesos.

A pesar de su tamaño considerable, no se dispone de información pública sobre la arquitectura subyacente, el proceso de entrenamiento, los datos utilizados ni las capacidades específicas del modelo. Los tags indican que es compatible con endpoints, está orientado a conversación y tiene licencia "other", pero no se especifica el tipo de licencia concreta. Tampoco se han publicado resultados de benchmarks ni documentación técnica adicional. En el momento de la consulta, el repositorio no tiene descargas ni likes, lo que sugiere que es un modelo reciente o poco conocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, se desconocen los niveles concretos) |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. El formato GGUF indica que los pesos están cuantizados para inferencia eficiente, pero se desconoce si el modelo base es un transformer denso, un MoE o una arquitectura híbrida. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. No se ha encontrado ningún paper, blog o documentación técnica que describa el proceso de entrenamiento o las innovaciones técnicas del modelo.

## Capacidades

- No se dispone de información verificada sobre las capacidades del modelo.
- El tag "conversational" sugiere que está orientado a tareas de diálogo, pero no hay evidencia concreta.
- No se ha confirmado soporte para tool calling, agentes, razonamiento multi-paso, visión, audio u otras funcionalidades.
- No se conocen los idiomas soportados.

## Casos de uso

No se pueden proponer casos de uso concretos sin información fiable sobre las capacidades del modelo. La ausencia de documentación y benchmarks impide recomendar su aplicación en escenarios reales. Cualquier uso en producción debería basarse en una evaluación previa del modelo, que actualmente no es posible realizar con los datos disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han encontrado comparaciones con modelos similares en la web.

## Requisitos de hardware

Dado que el modelo tiene 26,9 mil millones de parámetros y está en formato GGUF, se puede estimar el hardware necesario para inferencia, aunque de forma orientativa:

- Con cuantización Q4_K_M, el tamaño del archivo rondaría los 15-16 GB, lo que permitiría ejecutarlo en una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, o A100 40GB).
- Con cuantización Q8_0, el tamaño sería de unos 27 GB, requiriendo una GPU con al menos 32 GB de VRAM (A100 40GB, H100, o varias GPUs).
- El repositorio ocupa 99 GB, lo que sugiere que contiene varias versiones cuantizadas, pero no se conocen los niveles exactos.
- Para despliegue, se podrían usar herramientas compatibles con GGUF como llama.cpp, Ollama o vLLM (con adaptadores), pero no se ha confirmado la compatibilidad.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo no tiene documentación pública ni resultados de benchmarks, por lo que no es posible compararlo con alternativas de la misma categoría (por ejemplo, Llama-2 27B, Mistral 24B, Qwen 27B, etc.). Se recomienda esperar a que el autor publique más detalles.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o limitaciones de contexto.
- El acceso es restringido (gated), lo que implica que el uso está sujeto a condiciones que no se han especificado.
- La licencia "other" no aclara si se permite uso comercial, modificación o redistribución.
- La falta de documentación y benchmarks hace que el modelo no sea recomendable para entornos de producción sin una evaluación exhaustiva previa.
- No se ha verificado la procedencia de los pesos ni si el modelo base es legítimo o cumple con las licencias de los modelos originales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Tohirju/sl-dunlin2
