# Tohirju/sl-hazel2

## Resumen

`Tohirju/sl-hazel2` es un modelo de lenguaje publicado en HuggingFace por el usuario Tohirju, con un tamaño de aproximadamente 8.950 millones de parámetros (8,95B) y un peso total de 17,9 GB en formato `safetensors`. Los metadatos incluyen la etiqueta `qwen3_5_text`, lo que sugiere que la arquitectura podría estar relacionada con la familia Qwen 3.5, aunque no se confirma oficialmente. El modelo tiene acceso restringido (gated), lo que implica que los usuarios deben aceptar condiciones específicas antes de descargarlo.

La información pública es extremadamente limitada: no se proporcionan detalles sobre el entrenamiento, los datos utilizados, las capacidades, los benchmarks o los idiomas soportados. Tampoco hay documentación adicional en el repositorio. Por tanto, esta ficha se basa únicamente en los metadatos disponibles y en estimaciones derivadas del tamaño del modelo, marcando como "no disponible" cualquier dato no confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Posiblemente basada en Qwen 3.5 (etiqueta `qwen3_5_text`), sin confirmar |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se menciona safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other (condiciones especificas no publicadas) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna, el proceso de entrenamiento, el dataset utilizado, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o DPO. La unica pista es la etiqueta `qwen3_5_text`, que podria indicar una variante o derivado de la arquitectura Qwen 3.5, pero no hay confirmacion oficial ni documentacion que lo respalde. Tampoco se conocen innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

No se han publicado capacidades concretas para este modelo. Basandose en su tamano (8,95B parametros), es plausible que pueda realizar tareas genericas de generacion de texto, razonamiento basico y comprension del lenguaje, pero no hay evidencia verificable. No se confirma soporte para tool calling, agentes, vision, audio ni capacidades multilingues.

## Casos de uso

Dado que no existe informacion verificada sobre el rendimiento o las capacidades reales, no es posible recomendar casos de uso especificos con garantias. Cualquier aplicacion deberia considerarse experimental y requeriria una evaluacion previa exhaustiva. A modo orientativo, un modelo de este tamano podria emplearse en:

- Prototipos de generacion de texto o chatbots en entornos de investigacion, siempre que se valide su comportamiento.
- Tareas de clasificacion o extraccion de informacion en dominios restringidos, tras un fine-tuning adecuado.
- Experimentos academicos sobre modelos de tamano medio, comparandolo con alternativas como Llama 3.1 8B o Qwen2.5 8B.
- Generacion de codigo simple o asistencia en programacion, si se confirma que tiene esa capacidad.
- Analisis de sentimiento o resumen de textos en un idioma especifico, previa comprobacion de soporte linguistico.
- Integracion en pipelines de prueba con frameworks como vLLM o llama.cpp, para medir latencia y calidad.

En todos los casos, es imprescindible acceder al modelo (aceptando las condiciones) y realizar pruebas propias antes de considerar su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se ofrecen comparativas con modelos similares.

## Requisitos de hardware

Dado el tamaño de 8,95B parametros y el peso de 17,9 GB en safetensors (que corresponde aproximadamente a una precision de 16 bits por parametro), se estima:

- VRAM necesaria para inferencia en FP16: alrededor de 18-20 GB (parametros + overhead de activaciones y cache).
- Con cuantizacion a 8 bits (si estuviera disponible), la VRAM podria reducirse a unos 10-12 GB.
- Con cuantizacion a 4 bits, alrededor de 6-8 GB, aunque no se confirma que existan versiones cuantizadas.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o similares con suficiente memoria.
- En GPU de consumo, una RTX 3090/4090 podria ejecutarlo en FP16 con limitaciones de batch, o en cuantizacion inferior si se generan los archivos.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), HuggingFace TGI, entre otros.
- Latencia y throughput: no disponibles sin pruebas reales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. Como referencia generica por tamaño, podria compararse con Llama 3.1 8B, Qwen2.5 8B o Mistral 7B, pero no hay datos de rendimiento de `sl-hazel2` para contrastar. Se recomienda realizar evaluaciones propias si se obtiene acceso.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se describen capacidades, limitaciones ni sesgos.
- Acceso restringido: requiere aceptar condiciones desconocidas; puede haber restricciones de uso comercial o de redistribucion.
- Licencia "other" sin especificar: no se conocen los terminos exactos, lo que impide garantizar su uso legal en proyectos comerciales.
- Sin benchmarks ni evaluaciones publicas: no se puede verificar su calidad o seguridad.
- Riesgo de alucinacion y sesgos: al no haber informacion sobre el dataset de entrenamiento, no se pueden anticipar sesgos especificos, pero es probable que los tenga como cualquier LLM.
- Sin soporte confirmado de idiomas: no se sabe si funciona bien en espanol u otros idiomas.
- Fecha de creacion futura (2026-08-16): podria tratarse de un error en los metadatos o de un modelo muy reciente; conviene verificar la autenticidad.

## Enlaces

- Repositorio HuggingFace: [Tohirju/sl-hazel2](https://huggingface.co/Tohirju/sl-hazel2)

No se han encontrado otros enlaces (papers, blogs, repositorios de codigo) en la informacion disponible.
