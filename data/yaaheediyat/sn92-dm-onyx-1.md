# yaaheediyat/sn92-dm-onyx-1

## Resumen

`yaaheediyat/sn92-dm-onyx-1` es un modelo de lenguaje publicado en HuggingFace por el usuario `yaaheediyat` bajo licencia Apache 2.0. Los pesos están en formato safetensors y el repositorio ocupa 62,6 GB, con un total de 31.273.086.512 parámetros (aproximadamente 31,3 mil millones). La etiqueta `gemma4` en los metadatos sugiere que deriva de la familia Gemma de Google, aunque no se dispone de documentación oficial que lo confirme. El acceso es restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar los pesos.

El modelo no incluye model card pública con detalles de arquitectura, datos de entrenamiento ni benchmarks. El pipeline declarado no está disponible, no se listan idiomas soportados y el contador de descargas es de 8 con 0 likes, lo que indica una publicación muy reciente (creada el 29 de octubre de 2026) y sin tracción comunitaria. Todo ello limita la evaluación a los metadatos verificables del repositorio.

Por tanto, esta ficha recoge exclusivamente la información comprobable del repositorio y marca explícitamente como "no disponible" cualquier dato que no pueda verificarse. Cualquier uso en producción debería ir precedido de una evaluación propia del modelo por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4` sugiere base de la familia Gemma) |
| Parametros totales | 31.273.086.512 (~31,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo más allá de la etiqueta `gemma4`, que apunta a una base derivada de la familia Gemma de Google. Con 31,3 mil millones de parámetros y un repositorio de 62,6 GB en safetensors, el tamaño es coherente con pesos en precisión de 16 bits (bf16/fp16), sin que se haya confirmado oficialmente el dtype. No hay datos sobre si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una variante híbrida.

Tampoco se dispone de información sobre el corpus de entrenamiento (número de tokens, composición del dataset), la existencia de fases de ajuste fino supervisado, RLHF o DPO, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio no aporta estos detalles y no se han localizado papers, blogs ni repositorios asociados en la información disponible.

## Capacidades

- Generación de texto: capacidad esperable por el tamaño y la familia de origen, pero no verificada con documentación oficial.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación interna de modelos base: dado que no hay benchmarks publicados, un equipo puede descargar los pesos (previa aceptación de la licencia en HuggingFace) y ejecutar su propia batería de evaluación en tareas de generación de texto antes de considerar su adopción.
- Ajuste fino supervisado sobre dominio propio: los 31,3 B de parámetros y la licencia Apache 2.0 permiten adaptar el modelo con SFT/DPO a un corpus corporativo, siempre que los recursos de GPU lo permitan.
- Experimentación académica con modelos de ~30 B: útil como punto de comparación frente a otros modelos de tamaño similar en estudios de escalado o de alineación.
- Generación de texto en pipelines de procesamiento por lotes: con un despliegue en vLLM o TGI sobre GPUs de 80 GB, podría emplearse para tareas de resumen o extracción, aunque el rendimiento real debe medirse.
- Base para destilación: un modelo de este tamaño puede servir como profesor para destilar capacidades hacia modelos más pequeños en un dominio concreto.
- Investigación sobre linaje Gemma: la etiqueta `gemma4` lo hace candidato para estudiar cómo se comportan derivados de esa familia, comparando con los pesos originales de Google.

En todos los casos, la ausencia de documentación obliga a validar el comportamiento real del modelo antes de cualquier uso productivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62,6 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, se necesitan 2× GPU de 80 GB (A100/H100) o una GPU con más de 80 GB para inferencia cómoda.
- Cuantización a 8 bits: ~31-35 GB de pesos, viable en una A100/H100 de 80 GB o en 2× RTX 4090 de 24 GB con tensor parallelism.
- Cuantización a 4 bits (si se generan pesos GGUF/AWQ, no publicados): ~16-20 GB, podría caber en una RTX 4090 de 24 GB, con pérdida de calidad no evaluada.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200; para consumer, 2× RTX 4090 o RTX 6000 Ada.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (requiere GGUF). No se han publicado pesos cuantizados oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| yaaheediyat/sn92-dm-onyx-1 | ~31,3 B | no disponible | Apache 2.0 | gated en HuggingFace |
| Gemma 2 27B (Google) | 27 B | 8K | Gemma license | pública en HuggingFace |
| Qwen2.5 32B | 32,5 B | 128K | Apache 2.0 | pública en HuggingFace |
| Mistral Small 24B | ~24 B | 32K | Apache 2.0 | pública en HuggingFace |

La comparación se limita a parámetros, contexto y licencia porque no hay benchmarks publicados de `sn92-dm-onyx-1`. Los datos de los modelos alternativos corresponden a sus fichas oficiales; conviene verificarlos en el momento de la consulta.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre datos de entrenamiento, sesgos, idiomas ni evaluación, lo que impide anticipar su comportamiento.
- Riesgo de alucinación: no cuantificado; sin benchmarks ni evaluaciones, no puede descartarse un comportamiento deficiente en tareas factuales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario asume toda la responsabilidad sobre el cumplimiento y sobre el origen de los datos de entrenamiento, que se desconoce.
- Acceso restringido: es necesario aceptar condiciones en HuggingFace, lo que añade fricción para despliegues automatizados.
- Idiomas no declarados: no puede asumirse un buen rendimiento en castellano sin evaluarlo.
- Contexto desconocido: no puede planificarse su uso en tareas de contexto largo sin verificación previa.
- Procedencia incierta: la etiqueta `gemma4` no está respaldada por documentación; el linaje real del modelo debe confirmarse antes de asumir compatibilidades.
- Sin tracción comunitaria (8 descargas, 0 likes): no hay reportes de terceros que validen su calidad.

## Enlaces

- HuggingFace: https://huggingface.co/yaaheediyat/sn92-dm-onyx-1
- No se han localizado papers, blogs, repositorios ni demos adicionales en la información disponible.
