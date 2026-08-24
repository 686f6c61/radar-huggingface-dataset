# srswti/axe-superveloce-jota-118b-r15-nvfp4

## Resumen

El modelo `srswti/axe-superveloce-jota-118b-r15-nvfp4` es un modelo de lenguaje de gran tamaño publicado en Hugging Face por la organización SRSWTI Inc., que se describe en su perfil como dedicada a construir "los motores de recuperación e inferencia más rápidos del mundo". A pesar de su nombre, que sugiere 118 mil millones de parámetros, el fichero de pesos en formato safetensors contiene 56.928.413.482 parámetros (aproximadamente 56,9 mil millones), una discrepancia notable que conviene tener en cuenta. El tag `nvfp4` apunta a una cuantización en punto flotante de 4 bits de NVIDIA, aunque no hay confirmación oficial en los metadatos. La ficha carece de información sobre arquitectura, licencia, idiomas o capacidades, lo que limita su evaluación. El repositorio ocupa 57,7 GB y fue creado en agosto de 2026.

A día de hoy, el modelo solo dispone de 348 descargas y ningún "like", lo que sugiere una adopción muy limitada. No se ha publicado ningún benchmark, paper o documentación técnica en la página de Hugging Face, ni en los resultados de búsqueda web (que solo devuelven enlaces a perfiles de redes sociales y a la propia página de Hugging Face). Por tanto, esta ficha se basa únicamente en los datos parciales del repositorio y en estimaciones razonables, marcando todo dato desconocido como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 11.928.413.482 (11,9 B) según safetensors |
| Parametros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | posiblemente FP4 (por el tag `nvfp4`), no confirmado |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Nota: el nombre del modelo incluye "118b", pero el peso real en safetensors es de 56,9 mil millones de parámetros. Esta discrepancia debe ser verificada con el autor.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna (transformer, MoE, SSM, etc.), el tipo de datos de entrenamiento, el número de tokens, ni si se emplearon técnicas de RLHF, DPO u otras. El tag `nvfp4` sugiere una cuantización en punto flotante de 4 bits, probablemente usando la tecnología de Nvidia (e.g., FP4 para Hopper/Ada), pero no hay confirmación. El tag `laguna` y `custom_code` aparecen en los metadatos, lo que podría indicar un código de carga personalizado, pero no se detalla.

## Capacidades

No hay información documentada sobre las capacidades del modelo. Dado su tamaño (56,9 B parámetros), es probable que pueda realizar tareas de generación de texto, razonamiento y posiblemente código, pero no se puede confirmar. No se conoce si soporta tool calling, agentes, visión o audio. La ausencia de benchmarks y documentación impide cualquier afirmación técnica concreta.

## Casos de uso

No existen casos de uso documentados ni ejemplos de aplicación en la información disponible. Dada la falta de especificaciones, no se puede recomendar su uso en producción. Los desarrolladores interesados deben obtener información directamente del autor o esperar a que se publique documentación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros. Tampoco hay comparaciones con modelos similares.

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware. Como orientación general, un modelo de ~57 mil millones de parámetros en FP4 (si se confirma) ocuparía aproximadamente 28,5 GB de memoria (57 × 0,5 GB). En FP8 serían 57 GB y en FP16 unos 114 GB. Para inferencia en FP4 se necesitaría al menos una GPU con 32 GB de VRAM (por ejemplo, una NVIDIA A100 80 GB o H100 80 GB) o un sistema multi-GPU. En cuantización FP16 no cabría en una sola GPU consumer típica (RTX 4090 tiene 24 GB), pero con FP4 podría intentarse en una RTX 4090 (24 GB) si el modelo se carga en dos mitades, aunque no hay garantías. Las opciones de despliegue no están documentadas; si el modelo es compatible con vLLM, llama.cpp o TGI, no se sabe. Se recomienda contactar con el autor para obtener detalles de despliegue.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El tamaño de 56,9 B parámetros lo sitúa en el rango de modelos como Llama 3 70B, Mixtral 8x22B o Qwen 72B, pero sin datos de rendimiento no se puede realizar una comparación objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- La discrepancia entre el nombre del modelo (118B) y los parámetros reales (56,9 B) es un factor de riesgo importante; podría tratarse de un error de etiquetado o de una arquitectura con mezcla de expertos que no se refleja en el peso.
- No hay información sobre licencia, por lo que su uso comercial es incierto y puede infringir derechos de autor o términos de uso.
- No se han publicado datos de sesgos, alucinaciones ni limitaciones de contexto.
- El modelo no ha sido auditado por la comunidad (0 likes, pocas descargas), lo que sugiere una validación externa insuficiente.
- El tag `custom_code` puede implicar la necesidad de código adicional para cargar el modelo, lo que añade complejidad y riesgo de incompatibilidad.
- No se recomienda su uso en entornos de producción sin una evaluación exhaustiva previa.

## Enlaces

- Página del modelo: https://huggingface.co/srswti/axe-superveloce-jota-118b-r15-nvfp4
- Perfil de la organización: https://huggingface.co/srswti
- Búsqueda de modelos de srswti: https://huggingface.co/models?other=srswti

No se encontraron papers, blogs o repositorios adicionales en la búsqueda web realizada.
