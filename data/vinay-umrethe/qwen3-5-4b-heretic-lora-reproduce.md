# VINAY-UMRETHE/Qwen3.5-4B-heretic-LoRA-reproduce

## Resumen

Qwen3.5-4B-heretic-LoRA-reproduce es una reproduccion de un ajuste fino mediante LoRA sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario VINAY-UMRETHE en HuggingFace. El sufijo "heretic" hace referencia a la tecnica de "abliteration" o decensurado, un procedimiento que busca eliminar los mecanismos de rechazo aprendidos por el modelo durante el alineamiento (RLHF/DPO), de modo que el modelo responda a peticiones que el original rechazaria. El repositorio se presenta explicitamente como una reproduccion ("reproduce") de un procedimiento previo, no como un modelo original.

El modelo hereda la arquitectura y el tamano del Qwen3.5-4B base, un transformer denso de aproximadamente 4.000 millones de parametros, pero la ficha de HuggingFace no aporta detalles verificables sobre hiperparametros del LoRA, dataset de decensurado empleado ni resultados de evaluacion. El pipeline declarado es image-text-to-text, lo que sugiere que el modelo base incorpora capacidades multimodales de vision, aunque esta informacion no esta confirmada en los metadatos disponibles.

La relevancia de esta ficha es limitada: se trata de un repositorio con cero descargas y cero likes, de acceso restringido (gated), publicado el 31 de octubre de 2026, y sin documentacion tecnica publicada. Resulta util como referencia de la categoria de modelos "abliterated" y como advertencia sobre los riesgos de usar pesos decensurados en produccion, pero no como modelo recomendable para despliegues reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredado de Qwen/Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | ~4.000 millones (segun el nombre del modelo base; cifra exacta no disponible) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0,1 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B mas alla de que se trata de un transformer de aproximadamente 4.000 millones de parametros. El repositorio contiene un ajuste LoRA (adaptadores de bajo rango) aplicado sobre dicho modelo base, segun los tags `base_model:finetune:Qwen/Qwen3.5-4B`. El tamano del repositorio (0,1 GB) es coherente con un conjunto de adaptadores LoRA y no con pesos completos, lo que implica que para usar el modelo es necesario cargar primero el base Qwen3.5-4B y aplicar los adaptadores.

No se dispone de informacion sobre el dataset de decensurado, el numero de pasos de entrenamiento, la tasa de aprendizaje, el rango del LoRA ni la metodologia exacta de abliteration empleada. La etiqueta "reproduce" sugiere que el autor replica un procedimiento publicado por terceros, pero no se enlaza ningun paper, repositorio ni receta en los metadatos. Tampoco se documenta si hubo evaluacion posterior para medir la perdida de capacidades tras el decensurado.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.5-4B.
- Respuesta a peticiones que el modelo original rechazaria, como consecuencia del proceso de abliteration.
- Pipeline declarado image-text-to-text, lo que implica, si se confirma, capacidad de procesar imagenes junto a texto.
- Razonamiento, codigo y matematicas: presumiblemente heredados del base, aunque no hay evaluacion publicada que lo confirme tras el decensurado.
- Tool calling y function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como objeto de estudio para analizar como la abliteration afecta la distribucion de rechazos y la calidad de las respuestas en un transformer de 4B parametros.
- Reproduccion de experimentos de decensurado: util para investigadores que quieran replicar el procedimiento "heretic" sobre Qwen3.5-4B y comparar resultados con otras variantes publicadas.
- Evaluacion comparativa de robustez: permite medir la degradacion de capacidades (MMLU, GSM8K, HumanEval) entre el base y la version decensurada, si se ejecutan los benchmarks por cuenta propia.
- Generacion de texto sin filtros en entornos controlados de laboratorio: para estudiar sesgos y comportamientos no deseados en modelos sin capa de rechazo.
- Analisis de sesgos: al eliminar los mecanismos de rechazo, el modelo expone de forma mas directa los sesgos latentes del base, lo que facilita su medicion.
- Experimentacion con adaptadores LoRA: dado el tamano reducido del repo (0,1 GB), sirve como ejemplo practico de carga de adaptadores sobre un base multimodal en transformers.
- Pruebas de pipelines image-text-to-text: si se confirma la capacidad multimodal, permite experimentar con entrada de imagenes en un modelo decensurado, siempre en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 8-10 GB para los pesos del base de 4B parametros, mas el overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5-6 GB; en 4 bits, aproximadamente 3-4 GB. Estas cifras son estimaciones basadas en el tamano del base, no datos publicados para este repositorio.
- GPU recomendadas: A100, H100 o L40S para despliegues con concurrencia; RTX 4090, RTX 3090 o RTX A6000 para inferencia individual.
- Compatibilidad con GPU de consumo: previsiblemente si en cuantizacion de 4 u 8 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), aunque no hay confirmacion publicada.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados por la ausencia de pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-LoRA-reproduce | ~4B | no disponible | apache-2.0 | gated | Adaptador LoRA decensurado, sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | apache-2.0 | publico (segun metadatos) | Modelo original alineado; referencia para comparar degradacion |
| Otras variantes abliterated de Qwen | ~4B | no disponible | variable | variable | Existen numerosas variantes comunitarias; no se dispone de datos comparativos verificables en esta busqueda |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo decensurado: la abliteration elimina total o parcialmente los rechazos, lo que incrementa el riesgo de generar contenido danino, ofensivo o ilegal. No es apto para exposicion directa a usuarios finales sin moderacion externa.
- Perdida de capacidades: el proceso de abliteration suele degradar el rendimiento en razonamiento, codigo y seguimiento de instrucciones; no hay evaluacion publicada que cuantifique esta perdida en este repositorio.
- Sesgos: al eliminar la capa de rechazo, los sesgos latentes del base Qwen3.5-4B pueden manifestarse con mayor frecuencia y virulencia.
- Alucinacion: el riesgo de alucinacion del base se mantiene o aumenta; no hay datos especificos.
- Idiomas: no se declaran idiomas soportados en el repositorio; no se puede garantizar cobertura multilingue.
- Contexto: la longitud de contexto no esta documentada; no se debe asumir la del base sin verificacion.
- Licencia: apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener condiciones adicionales que prevalecen; es necesario revisar la licencia del base antes de cualquier uso comercial.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que limita la distribucion y la reproducibilidad.
- Repositorio sin traccion: cero descargas y cero likes en la fecha de publicacion; no hay evidencia de validacion por parte de la comunidad.
- Falta de documentacion: no se aportan hiperparametros, dataset, metodologia ni benchmarks, lo que impide verificar la calidad del ajuste.
- Repositorio de 0,1 GB: contiene previsiblemente solo adaptadores LoRA; requiere descargar el base Qwen3.5-4B por separado, con sus propios requisitos de acceso.

## Enlaces

- HuggingFace: https://huggingface.co/VINAY-UMRETHE/Qwen3.5-4B-heretic-LoRA-reproduce
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
