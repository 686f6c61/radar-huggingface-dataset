# Spikejester/blitty

## Resumen

Spikejester/blitty es un modelo de lenguaje basado en Qwen3.5-27B, al que se ha aplicado la tecnica de ablacion (abliteration) para eliminar los mecanismos de rechazo del modelo original. El resultado es un modelo "sin censura" que responde a peticiones que un modelo alineado normalmente rechazaria. El modelo fue publicado por Spikejester a partir del trabajo de huihui-ai/Huihui-Qwen3.5-27B-abliterated, y se presenta como un fork con los mismos pesos abliterated.

La arquitectura subyacente es un transformer decoder-only de 27.781 millones de parametros, heredado de Qwen3.5-27B. Los pesos se distribuyen en formato safetensors y el repo ocupa 55.6 GB, lo que indica que se almacenan en precision completa (probablemente bf16/fp16). No se especifica la longitud de contexto, los idiomas soportados ni los tipos de cuantizacion disponibles.

Este modelo es relevante para investigadores que estudian comportamientos de rechazo, robustez de alineacion o que necesitan generar contenido en dominios sensibles sin limitaciones de seguridad. No es recomendable para aplicaciones de produccion, tal como advierte el autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen/Qwen3.5-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en precision completa) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen/Qwen3.5-27B y no ha sido reentrenado desde cero. La ablacion (abliteration) es una tecnica que modifica los pesos del modelo para eliminar la direccion activa que produce los comportamientos de rechazo (refusals). En lugar de un reentrenamiento completo, se realiza una intervencion sobre los activaciones del modelo para suprimir patrones asociados a respuestas negativas o de seguridad.

Esta aproximacion se describe en el repositorio remove-refusals-with-transformers, que implementa una variante sin TransformerLens. No se han proporcionado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. Dado que es una modificacion post-entrenamiento, no hay informacion sobre innovaciones tecnicas adicionales en la arquitectura.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3.5-27B, sin que se hayan publicado evaluaciones especificas para esta version.
- Respuestas sin filtros de contenido: el modelo produce salidas en temas que normalmente serian rechazados por un modelo alineado (violencia, explicitidad, opiniones controvertidas).
- Etiquetado en HuggingFace como image-text-to-text, aunque no hay documentacion ni evidencias en la model card de capacidades de vision; la etiqueta puede ser un error del autor.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible (sin información al respecto).
- Capacidades multilingues: no disponible (el modelo base puede soportar multiples idiomas, pero no se confirma en la documentacion).

## Casos de uso

- Investigacion sobre seguridad y alineacion: permite comparar las respuestas de un modelo alineado con las de su version abliterated para estudiar la eficacia de los mecanismos de rechazo y los sesgos del sistema de seguridad.
- Analisis de comportamientos de modelos "sin censura": util en entornos academicos para probar tecnicas de intervencion en activaciones y medir como cambia la probabilidad de generar contenido restringido.
- Generacion de ficcion para audiencias adultas: se puede aplicar a la escritura de narrativas con temas maduros que un modelo convencional bloquearia, siempre dentro de un ambito de uso responsable.
- Red-teaming y pruebas de robustez: sirve como modelo adversario en evaluaciones automaticas de filtros de contenido, ayudando a detectar vulnerabilidades en sistemas de moderacion.
- Extraccion de informacion en dominios sensibles: en entornos controlados, puede recuperar informacion sobre salud, conflictos o politica que otros modelos omiten, aunque requiere supervision humana estricta.
- Experimentos de desalineacion deliberada: para investigadores que necesitan un modelo capaz de responder a todas las instrucciones, incluso las problematicas, con el fin de estudiar los limites del entrenamiento de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los pesos en precision completa (bf16/fp16) ocupan aproximadamente 55.6 GB, lo que exige al menos 56 GB de memoria para la carga de pesos en VRAM, mas el overhead de activaciones y logits, que suele requerir entre 60 y 80 GB.
- GPU recomendadas: A100 80GB, H100 80GB o H100 94GB. En GPUs de mayor capacidad se podria ejecutar con un margen comodo de memoria.
- No es viable en GPUs de consumo (RTX 4090, 3090, etc.) en precision completa. No hay cuantizaciones publicadas en el repositorio, por lo que no existe una via oficial para reducirlo a 4 bits o 8 bits.
- Opciones de despliegue: vLLM, TGI o transformers directamente si se dispone de la memoria suficiente. Para cuantizacion, seria necesario generar GGUF u otros formatos mediante herramientas externas (llama.cpp, Ollama), aunque no se incluyen en el repo.
- Latencia y throughput estimados: no disponible sin datos de benchmarks ni pruebas de rendimiento documentadas.

## Comparativa con modelos similares

| Caracteristica | Spikejester/blitty | Qwen/Qwen3.5-27B | huihui-ai/Huihui-Qwen3.5-27B-abliterated |
|---|---|---|---|
| Parametros | 27.8B | 27.8B | 27.8B |
| Contexto | No disponible | No disponible | No disponible |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Filtros de seguridad | Eliminados | Implementados | Eliminados |
| Disponibilidad | HF, fork secundario | HF, modelo oficial | HF, modelo original abliterated |
| Benchmarks | No disponibles | No disponibles | No disponibles |

## Limitaciones y advertencias

- La ablacion reduce significativamente los mecanismos de seguridad, lo que puede generar contenido sensible, controversial o inapropiado.
- No es apto para entornos publicos, menores de edad ni aplicaciones que requieran alta seguridad.
- La responsabilidad legal y etica recae en el usuario; el contenido generado puede incumplir normativas locales o estandares de uso aceptable.
- Se desaconseja su uso en produccion o en aplicaciones comerciales de cara al publico, tal como indica el autor original.
- Riesgo de alucinacion: al no estar evaluado, no hay datos sobre su fiabilidad; el uso en contextos factuales requiere verificacion externa.
- La etiqueta de pipeline image-text-to-text es dudosa; no se ha documentado ninguna capacidad multimodal real en la model card.
- No se ha publicado ninguna evaluacion de seguridad, sesgos ni rendimiento, por lo que no se puede garantizar la calidad de las salidas.
- El modelo es un fork no verificado por el autor original (huihui-ai), y su portabilidad a otras plataformas (Ollama, llama.cpp) no esta soportada oficialmente.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/Spikejester/blitty)
- [Modelo base Qwen/Qwen3.5-27B](https://huggingface.co/Qwen/Qwen3.5-27B)
- [Repositorio remove-refusals-with-transformers](https://github.com/Sumandora/remove-refusals-with-transformers)
- [Versión original abliterated de huihui-ai](https://huggingface.co/huihui-ai/Huihui-Qwen3.5-27B-abliterated)
- [Modelo en Ollama (huihui_ai/qwen3.5-abliterated)](https://ollama.com/huihui_ai/qwen3.5-abliterated)
