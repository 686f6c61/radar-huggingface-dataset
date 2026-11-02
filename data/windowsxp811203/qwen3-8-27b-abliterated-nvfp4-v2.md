# windowsxp811203/Qwen3.8-27B-Abliterated-NVFP4-v2

## Resumen

Qwen3.8-27B-Abliterated-NVFP4-v2 es una cuantización en NVFP4 (formato de coma flotante de 4 bits con escalado por bloques) del modelo Qwen3.8-27B-Abliterated, publicada por el usuario windowsxp811203 en HuggingFace. Se trata de un derivado no oficial de la familia Qwen, etiquetado con la arquitectura `qwen3_5` y el pipeline `image-text-to-text`, lo que indica capacidades multimodales de entrada (imagen y texto). El modelo ha sido sometido a un proceso de "abliteration", una técnica de modificación de pesos orientada a eliminar los mecanismos de rechazo aprendidos durante el alineamiento, dando lugar a una variante sin censura.

El interés técnico de esta ficha reside en dos aspectos: por un lado, la cuantización NVFP4, pensada para el hardware Blackwell de NVIDIA y para su explotación con vLLM mediante `compressed-tensors`; por otro, la presencia de la etiqueta `mtp` (multi-token prediction), que sugiere la inclusión de cabezas de predicción especulativa para acelerar la decodificación. El repositorio ocupa 23,0 GB y declara 18.386.186.992 parámetros reales en los safetensors, un dato que no coincide con el "27B" del nombre comercial.

Es importante subrayar que esta publicación no procede de Alibaba/Qwen ni cuenta con validación oficial: es un artefacto de la comunidad, con acceso restringido (gated), publicado bajo licencia Apache 2.0 y con solo 244 descargas en el momento de la consulta. Cualquier evaluación de producción debe partir de esa premisa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, segun tag de HuggingFace); detalles internos no disponibles |
| Parametros totales | 18.386.186.992 (segun safetensors); el nombre comercial indica 27B |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), FP8, segun tags `nvfp4`, `fp4`, `fp8`, `8-bit`; formato `compressed-tensors` |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizado NVFP4/FP8, compatible con compressed-tensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del tag `qwen3_5`, que apunta a un transformer de la familia Qwen con soporte de entrada multimodal (image-text-to-text). El modelo incorpora la etiqueta `mtp`, que en el ecosistema Qwen designa cabezas de multi-token prediction utilizadas para decodificacion especulativa, lo que permitiria generar varios tokens por paso y reducir la latencia en inferencia. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

El proceso de abliteration consiste en identificar las direcciones de activacion asociadas al comportamiento de rechazo y proyectarlas fuera de la matriz de pesos, de modo que el modelo deja de negarse a responder a ciertas peticiones. Esta modificacion se aplico en el modelo base `windowsxp811203/Qwen3.8-27B-Abliterated`, del que esta publicacion es una cuantizacion posterior en NVFP4 v2. La cuantizacion NVFP4 emplea bloques de escalado de grano fino con un formato de 4 bits (E2M1) y escalas FP8 (E4M3), un esquema disenado por NVIDIA para mantener precision cercana a FP8 con la mitad de bits por parametro, principalmente sobre GPUs Blackwell. No se han publicado detalles sobre el procedimiento exacto de calibracion ni sobre posibles perdidas de calidad derivadas de la cuantizacion.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con soporte de conversaciones multi-turno.
- Entrada multimodal imagen-texto (`image-text-to-text`), lo que permite describir imagenes, responder preguntas sobre su contenido y realizar tareas de VQA.
- Razonamiento y generacion de codigo heredados del modelo base Qwen, aunque sin datos verificables de rendimiento en esta variante.
- Decodificacion especulativa mediante cabezas MTP (tag `mtp`), orientada a aumentar el throughput en servidores compatibles.
- Comportamiento sin censura (abliterated/uncensored): el modelo no aplica los filtros de rechazo del alineamiento original, lo que amplia el rango de respuestas pero elimina una capa de seguridad.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con vLLM para el formato cuantizado.
- No se documenta soporte explicito de tool calling, function calling ni de modos de razonamiento extendido (thinking mode); no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteration afecta a la distribucion de respuestas y a las tasas de rechazo, comparando directamente con el modelo base sin modificar.
- Evaluacion de cuantizacion NVFP4: sirve como banco de pruebas para medir la degradacion de calidad (perplejidad, benchmarks de razonamiento) al pasar de pesos completos a 4 bits con escalado por bloques.
- Despliegue de alta densidad en GPUs Blackwell: al ocupar 23,0 GB en reposo y usar NVFP4, permite servir un modelo multimodal de ~18.400 millones de parametros con un consumo de VRAM reducido frente a FP16, util en entornos con varias instancias por nodo.
- Procesamiento de documentos con imagenes en ingles y chino: extraccion de informacion de capturas, formularios o diagramas combinando entrada visual y textual, aprovechando el pipeline image-text-to-text.
- Generacion de contenido creativo sin restricciones tematicas: escritura de ficcion, guiones o material editorial que requiera evitar los rechazos del modelo alineado, siempre con revision humana posterior.
- Aceleracion de inferencia con MTP: integracion en vLLM para explotar la decodificacion especulativa en cargas de trabajo de chat con alta concurrencia, reduciendo el tiempo por token generado.
- Prototipado de asistentes bilingues en/zh: conversaciones multi-turno para mercados chino y anglosajon, con la salvedad de que no hay datos publicados de calidad en otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 23,0 GB, por lo que la inferencia en NVFP4 requiere al menos ~24 GB de VRAM, mas overhead de cache KV y activaciones; con contexto largo el requisito crece proporcionalmente.
- GPUs recomendadas: NVIDIA Blackwell (B200, RTX 5090, GB200) por el soporte nativo de NVFP4; el tag `fp8` sugiere que tambien puede ejecutarse en Hopper (H100/H200) si se seleccionan los tensores FP8.
- GPU de consumo: una RTX 5090 (32 GB) seria la opcion mas realista para NVFP4; en generaciones anteriores (RTX 4090, 24 GB) el margen es muy ajustado y depende de la longitud de contexto.
- Despliegue: vLLM con `compressed-tensors` es la via declarada; no se confirma soporte de llama.cpp, Ollama ni TGI para este formato cuantizado.
- Latencia y throughput: no disponibles; la presencia de MTP sugiere mejoras en decodificacion, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Abliterated-NVFP4-v2 | 18,39 B (reales) | no disponible | NVFP4, FP8 | Apache 2.0 | Gated, 244 descargas |
| Qwen3.8-27B-Abliterated (base) | no disponible | no disponible | pesos completos | Apache 2.0 | Publico en HF |
| Modelos oficiales Qwen de ~27B | no disponible | no disponible | multiples | Apache 2.0 (segun familia) | Amplia |

No se dispone de datos de rendimiento comparables entre estas variantes, ni de especificaciones verificadas de los modelos oficiales de la familia en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo: el modelo puede producir contenido danino, ofensivo o ilegal sin filtro, lo que lo hace inadecuado para aplicaciones de cara al publico sin moderacion externa.
- Riesgo elevado de alucinacion, agravado por la cuantizacion a 4 bits, que puede degradar la coherencia en tareas de razonamiento largo.
- Solo se declaran ingles y chino; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto no tiene respaldo oficial de Alibaba/Qwen y su procedencia conviene documentarla en auditorias.
- El acceso es restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar.
- El dato de parametros (18,39 B) no coincide con el nombre comercial (27B); conviene verificar el modelo base antes de dimensionar infraestructura.
- No hay informacion sobre contexto maximo, tool calling ni calidad de la cuantizacion; no debe asumirse paridad con el modelo sin cuantizar.
- El modelo tiene 244 descargas y 1 like: carece de validacion comunitaria amplia.

## Enlaces

- HuggingFace: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated-NVFP4-v2
- Modelo base: https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
