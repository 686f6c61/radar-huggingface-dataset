# Tohirju/sl-larch3

## Resumen

El modelo `Tohirju/sl-larch3` es un checkpoint de 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) publicado por el usuario Tohirju en HuggingFace. La etiqueta `qwen3_5_text` sugiere que podría estar basado en la arquitectura Qwen3.5, aunque no se dispone de documentación oficial que lo confirme. El repositorio ocupa 17,9 GB, lo que es consistente con pesos en formato `safetensors` en precisión FP16 o BF16 para ese número de parámetros.

El modelo se publicó el 16 de agosto de 2026 y está sujeto a control de acceso (gated), lo que implica que los usuarios deben aceptar condiciones específicas antes de poder descargarlo. La licencia se indica como `other`, sin detalles adicionales sobre sus términos. Hasta la fecha, no registra descargas ni valoraciones, por lo que se trata de un modelo reciente y sin uso verificado. Su relevancia actual es limitada debido a la falta de información pública sobre arquitectura, entrenamiento y capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `qwen3_5_text` sugiere posible base Qwen3.5, sin confirmar) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo contiene solo safetensors, sin GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos especificos no publicados) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion tecnica sobre la arquitectura interna, el proceso de entrenamiento, el dataset utilizado ni las tecnicas de alineacion (RLHF, DPO, etc.). La unica pista es la etiqueta `qwen3_5_text`, que podria indicar una derivacion de la serie Qwen3.5, pero no hay confirmacion por parte del autor ni documentacion en el repositorio. El tamaño de 8,95 mil millones de parametros sugiere un modelo de tipo transformer denso, pero esta afirmacion es especulativa.

## Capacidades

No se dispone de informacion publicada sobre las capacidades del modelo. No hay documentacion, ejemplos de uso ni demos que permitan determinar si soporta generacion de texto, razonamiento, codigo, tool calling, agentes, vision u otras funcionalidades. El tag `text` en `qwen3_5_text` indica que probablemente sea un modelo de solo texto, pero no se puede confirmar.

## Casos de uso

No se pueden enumerar casos de uso concretos sin informacion verificada sobre las capacidades del modelo. Dado que no hay documentacion ni ejemplos, cualquier aplicacion practica seria especulativa. Se recomienda consultar el repositorio original y contactar al autor para obtener detalles antes de considerar su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar.

## Requisitos de hardware

Dado el tamaño de 8,95 mil millones de parametros, se pueden estimar los requisitos de VRAM para inferencia, aunque estos datos no son oficiales y dependen de la cuantizacion y el framework:

- FP16/BF16 (pesos originales): aproximadamente 18 GB de VRAM (8,95 GB de pesos + overhead de activaciones y memoria del runtime).
- Cuantizacion INT8: aproximadamente 9-10 GB de VRAM.
- Cuantizacion INT4 (si se genera): aproximadamente 4,5-5 GB de VRAM.

GPU recomendadas: tarjetas con 24 GB o mas de VRAM (RTX 3090, RTX 4090, A100 40GB, H100) para FP16. Con cuantizacion INT4, podria caber en GPUs de 8 GB (RTX 3060, RTX 3070) o 12 GB (RTX 3080, RTX 4070). No se ha probado con vLLM, llama.cpp, Ollama ni TGI, por lo que no se puede confirmar compatibilidad. La latencia y el throughput dependen del hardware y del software de inferencia, sin datos publicados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. Dado el posible origen en Qwen3.5, podria compararse con modelos como Qwen2.5-7B o Qwen3-8B, pero no hay datos de rendimiento ni confirmacion de la arquitectura. Se indica "no disponible".

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso inmediato.
- Licencia `other`: los terminos no estan publicados, por lo que se desconoce si permite uso comercial, modificacion o redistribucion. Se debe contactar al autor antes de cualquier uso.
- Sin documentacion: no hay paper, README tecnico ni ejemplos de uso, lo que dificulta la evaluacion de sesgos, alucinaciones o limitaciones de contexto.
- Riesgo de alucinacion: al ser un modelo de lenguaje sin informacion sobre su entrenamiento, existe riesgo de generar contenido falso o inconsistente, especialmente en dominios especializados.
- Sin datos de rendimiento: no se han publicado benchmarks, por lo que no se puede evaluar su calidad frente a otros modelos.
- Modelo sin uso verificado: con cero descargas y cero likes, no hay evidencia de que funcione correctamente o de que sea estable en produccion.

## Enlaces

- Repositorio HuggingFace: [https://huggingface.co/Tohirju/sl-larch3](https://huggingface.co/Tohirju/sl-larch3)

No se han encontrado otros enlaces (papers, blogs, repositorios de codigo o demos) relacionados con este modelo.
