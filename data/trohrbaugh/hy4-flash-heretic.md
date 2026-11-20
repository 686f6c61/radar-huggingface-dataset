# trohrbaugh/Hy4-flash-heretic

## Resumen

Hy4-flash-heretic es un ajuste fino (finetune) del modelo base tencent/Hy4-flash, publicado por el usuario trohrbaugh en Hugging Face. Se trata de una variante "abliterated" o "uncensored", es decir, un modelo al que se le ha aplicado una tecnica de ablacion de direcciones de rechazo (refusal directions) para eliminar el comportamiento de negativa ante peticiones consideradas sensibles. El modelo conserva la arquitectura del original: un transformer de tipo Mixture of Experts (MoE) con 219.405.011.261 parametros totales, segun los pesos en safetensors.

El pipeline declarado es image-text-to-text, lo que indica que el modelo base Hy4-flash es multimodal (acepta imagenes y texto). El repositorio ocupa 523,5 GB, coherente con un modelo de gran tamano en precision completa o alta. El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face para descargar los pesos.

La relevancia de esta ficha radica en que documenta una variante no oficial de un modelo de gran escala, con implicaciones importantes de licencia y seguridad: la licencia tencent-hy-license del modelo base se mantiene, y la modificacion de comportamiento (abliteration) puede no estar cubierta o puede entrar en conflicto con los terminos de uso originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), segun tags del modelo (hy_v4_flash, hunyuan) |
| Parametros totales | 219.405.011.261 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 523,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (licencia "other" del modelo base) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un finetune del base tencent/Hy4-flash, que por los tags (hunyuan, hy4-flash, moe) corresponde a la familia Hunyuan de Tencent en su variante "flash" con arquitectura Mixture of Experts. El pipeline image-text-to-text confirma que el modelo base es multimodal, capaz de procesar entradas de imagen y texto. No se dispone de informacion sobre el numero de parametros activos por token, la longitud de contexto nativa ni la composicion del dataset de entrenamiento original.

El ajuste especifico de esta variante es una "abliteration": una tecnica que identifica y elimina (o proyecta fuera) las direcciones en el espacio de activaciones asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a responder ante contenido que el modelo original filtraria. No se detalla en la informacion disponible la metodologia exacta (si se uso un dataset de calibracion, cuantas capas se modificaron, ni si hubo entrenamiento adicional con RLHF/DPO). Tampoco hay datos sobre el volumen de tokens de entrenamiento del modelo base ni sobre innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base.
- Procesamiento de imagenes junto con texto (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y conversaciones con entrada multimodal.
- Razonamiento y generacion de codigo, asumiendo las capacidades del modelo base Hy4-flash (no verificadas de forma independiente en esta variante).
- Comportamiento "uncensored": responde a peticiones que el modelo original rechazaria, por la ablacion de direcciones de rechazo.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles.
- Modo thinking o razonamiento extendido: no confirmado.

## Casos de uso

- Investigacion sobre alineacion y seguridad: la variante permite estudiar como la ablacion de direcciones de rechazo afecta al comportamiento del modelo, comparando respuestas con el base Hy4-flash en tareas controladas.
- Analisis de robustez de filtros: util para evaluar la eficacia de sistemas de moderacion externos frente a modelos abliterated y disenar defensas en produccion.
- Procesamiento multimodal de documentos: al heredar el pipeline image-text-to-text, puede emplearse para extraer informacion de capturas, formularios o diagramas combinados con instrucciones textuales.
- Generacion de contenido creativo sin restricciones de estilo: escenarios donde el equipo necesita explorar respuestas que un modelo alineado filtraria, siempre con revision humana posterior.
- Prototipado de asistentes conversacionales con contexto multimodal: conversaciones que alternan texto e imagenes, aprovechando la ventana del modelo base (no documentada aqui).
- Evaluacion comparativa de variantes: banco de pruebas para medir diferencias de calidad y latencia entre el modelo original y su version abliterated en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 219.405 millones de parametros totales, la inferencia en precision completa (BF16/FP16) requiere del orden de 440 GB solo para pesos, mas overhead de activaciones y cache KV. En cuantizacion de 8 bits, aproximadamente 220 GB; en 4 bits, alrededor de 110 GB (estimaciones teoricas, no verificadas para esta variante).
- GPU recomendadas: para precision completa, nodos multi-GPU con A100 80 GB (6 o mas), H100 80 GB (6 o mas) o H200. Para cuantizacion agresiva, configuraciones de 2-4 GPU de 80 GB.
- Consumer GPU: no cabe en una unica GPU de consumo (RTX 4090 con 24 GB) ni siquiera en 4 bits; requeriria tecnicas de offload a CPU/RAM o particionado multi-GPU, con latencia muy alta.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta arquitectura MoE concreta y habria que verificar soporte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4-flash-heretic (este) | 219,4 B (MoE) | no disponible | tencent-hy-license | Gated en HF |
| tencent/Hy4-flash (base) | 219,4 B (MoE) | no disponible | tencent-hy-license | Gated en HF |
| Alternativas de misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma familia o tamano con datos verificables en esta busqueda.

## Limitaciones y advertencias

- La abliteracion elimina barreras de seguridad: el modelo puede generar contenido danino, ilegal o sensible sin las salvaguardas del original. No es apto para despliegues de produccion orientados al publico sin filtros externos robustos.
- La licencia tencent-hy-license del modelo base se mantiene; es necesario revisar si permite redistribuir variantes modificadas y si el uso comercial esta autorizado. El acceso gated implica aceptar condiciones adicionales.
- No hay informacion sobre idiomas soportados, contexto maximo ni parametros activos, lo que dificulta dimensionar el despliegue.
- Riesgo de alucinacion heredado del modelo base; la ablacion puede agravar la tendencia a responder con confianza ante preguntas sin respuesta correcta.
- Sesgos conocidos: no documentados para esta variante; se heredan los del base, sin evaluacion publica.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion comunitaria ni resultados de benchmarks independientes.
- El tamano del repo (523,5 GB) y los requisitos de VRAM hacen inviable el uso en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trohrbaugh/Hy4-flash-heretic
- Modelo base: https://huggingface.co/tencent/Hy4-flash
