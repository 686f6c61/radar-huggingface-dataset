# Tohirju/sl-larch4

## Resumen

El modelo `Tohirju/sl-larch4` es un modelo de lenguaje de 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) publicado en HuggingFace por el usuario Tohirju. El repositorio tiene un tamaño de 17,9 GB, lo que sugiere que los pesos están almacenados en precisión FP16 o BF16. El acceso está restringido (gated), por lo que es necesario aceptar condiciones adicionales en HuggingFace antes de poder descargarlo.

La información pública disponible es extremadamente limitada: no se especifican la arquitectura, el tipo de modelo, el contexto, los idiomas soportados ni la licencia concreta (solo se indica "other"). Tampoco hay documentación, papers ni demos asociados. Esto impide realizar una evaluación técnica rigurosa. El modelo parece ser parte de una serie (existe `sl-larch3` del mismo autor), pero no se ha encontrado información adicional sobre su entrenamiento o capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, probablemente FP16/BF16) |
| Idiomas soportados | no disponible |
| Licencia | other (condiciones especificas no publicadas) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM, etc.), el dataset de entrenamiento, el numero de tokens procesados ni las tecnicas de alineacion utilizadas (RLHF, DPO, etc.). El unico dato disponible es el numero total de parametros y el tamaño del repositorio, que sugiere pesos en FP16 (17,9 GB para 8,95B parametros). No se ha encontrado ningun paper, blog o documentacion tecnica asociada.

## Capacidades

No se dispone de informacion verificada sobre las capacidades del modelo. No se puede confirmar si soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, capacidades multilingues o cualquier otra funcionalidad. La ausencia de benchmarks, ejemplos de uso o documentacion impide cualquier afirmacion al respecto.

## Casos de uso

No se pueden proponer casos de uso concretos sin informacion sobre las capacidades del modelo. La falta de documentacion, benchmarks y ejemplos hace imposible determinar para que tareas es adecuado. Se recomienda contactar con el autor o revisar las condiciones de acceso en HuggingFace para obtener mas detalles antes de considerar su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Dado el tamaño de 8,95B parametros y el tamaño del repositorio (17,9 GB), se puede estimar que la inferencia en FP16 requiere aproximadamente 18 GB de VRAM solo para los pesos, mas memoria para activaciones y cache. Esto implica:

- VRAM estimada para inferencia en FP16: al menos 20-24 GB (incluyendo overhead).
- Con cuantizacion INT8 (si estuviera disponible) se reduciria a ~9-10 GB; con INT4 a ~5-6 GB, pero no se ha confirmado que el modelo soporte estas cuantizaciones.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100 o similares con 24 GB o mas de VRAM para FP16.
- En consumer GPU, cabria en una RTX 3090/4090 (24 GB) en FP16, pero con margen limitado.
- Opciones de despliegue: no se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI. Dado que los pesos estan en safetensors, es probable que se pueda cargar con Transformers, pero no hay garantia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria. No se conocen modelos comparables con el mismo nombre o serie, y no hay datos de rendimiento que permitan establecer una comparacion objetiva.

## Limitaciones y advertencias

- La informacion publica es insuficiente para evaluar sesgos, alucinaciones o limitaciones de contexto o idioma.
- El acceso es restringido (gated): es necesario aceptar condiciones en HuggingFace, pero no se publican los terminos exactos de la licencia "other". Esto puede implicar restricciones de uso comercial o modificacion.
- No hay documentacion tecnica, lo que dificulta la integracion en produccion y la depuracion de errores.
- El modelo no tiene descargas ni likes, lo que sugiere que es muy reciente o poco probado por la comunidad.
- Se recomienda extremar la precaucion antes de usar este modelo en cualquier aplicacion real, dado el desconocimiento total de sus capacidades y limitaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tohirju/sl-larch4
- Modelo anterior del mismo autor (sl-larch3): https://huggingface.co/Tohirju/sl-larch3
- Perfil del autor en HuggingFace: https://huggingface.co/Tohirju
