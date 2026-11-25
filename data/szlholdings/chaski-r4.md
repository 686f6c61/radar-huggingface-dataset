# SZLHOLDINGS/chaski-r4

## Resumen

chaski-r4 es un adaptador PEFT (LoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B, orientado a generacion de texto. El repositorio se distribuye en formato safetensors bajo licencia Apache 2.0 y esta etiquetado como modelo de la familia "governed-AI estate" del autor, una iniciativa que enfatiza la trazabilidad de resultados mediante ficheros de "receipts" (registros de auditoria).

El modelo se enmarca en la categoria de ajustes ligeros sobre modelos pequenos (0.8B parametros en el modelo base), lo que lo situa en el rango de despliegue en hardware de consumo. La libreria declarada es peft, lo que implica que los pesos publicados son los del adaptador y requieren cargar el modelo base Qwen3.5-0.8B para su uso.

La relevancia actual del artefacto es limitada desde el punto de vista de rendimiento: la propia model card declara explicitamente que no existen resultados de evaluacion medidos en rutas estandar y que no se afirman cifras de benchmark. El valor del repositorio reside, por tanto, en su caracter de artefacto trazable dentro de un pipeline de entrenamiento gobernado, mas que en capacidades demostradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador PEFT sobre Qwen/Qwen3.5-0.8B; arquitectura del base no detallada en la informacion proporcionada) |
| Parametros totales | no disponible (modelo base de 0.8B; el adaptador no declara recuento) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del adaptador ni del modelo base mas alla de su identificador (Qwen/Qwen3.5-0.8B). Al tratarse de un artefacto publicado con la libreria peft, se trata de un ajuste de bajo rango (LoRA u otra variante PEFT) que modifica los pesos del modelo base sin reentrenarlo por completo. El repositorio ocupa 0.0 GB, coherente con un adaptador de pequeno tamano.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La model card indica que las afirmaciones sobre entrenamiento y evaluacion residen en ficheros de "receipts" del estate del autor, y que cualquier dato no registrado alli se considera UNKNOWN. En la fecha de auditoria declarada (2026-11-22T23:29:30Z), el escaneo de rutas estandar (eval/frontier-v1/DONE.json, final/train_receipt.json) no arrojo una cadena de receipts completa, con estado UNKNOWN_NO_EVAL_RECEIPT.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen3.5-0.8B (capacidades especificas del ajuste no documentadas).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: solo se declara ingles.
- No se documentan modos especiales (thinking mode, vision, audio).
- El ajuste concreto no declara mejoras funcionales medibles respecto al modelo base.

## Casos de uso

- Prototipado rapido de generacion de texto en ingles: al ser un adaptador sobre un modelo de 0.8B, permite experimentar con ajustes ligeros en entornos de recursos limitados, cargando el base Qwen3.5-0.8B y aplicando el adaptador.
- Investigacion sobre pipelines PEFT: util como ejemplo de artefacto generado por una factoria de entrenamiento gobernada, para estudiar el formato de receipts y trazabilidad.
- Evaluacion de reproducibilidad: sirve para probar herramientas de auditoria de modelos que verifican la presencia de cadenas de receipts completas.
- Pruebas de integracion con la libreria peft: validacion de carga de adaptadores safetensors en flujos de trabajo con transformers.
- Docencia sobre ciclo de vida de modelos: ilustra la diferencia entre un artefacto publicado y un modelo con evaluacion verificada.
- Experimentos de bajo coste en CPU o GPU de gama baja: el tamano del base (0.8B) permite inferencia en hardware modesto, aunque el rendimiento del ajuste no esta medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo medido en una auditoria con fecha, y que el estado del artefacto es UNKNOWN_NO_EVAL_RECEIPT en el umbral estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; el modelo base de 0.8B en precision completa (fp16) requeriria aproximadamente 1.6 GB solo para pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del base, cabria en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en consumer GPU: probablemente si, dado el tamano del modelo base, aunque no hay confirmacion oficial.
- Opciones de despliegue: la libreria declarada es peft, por lo que el flujo natural es transformers + peft; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| chaski-r4 (SZLHOLDINGS) | base 0.8B + adaptador PEFT | no disponible | apache-2.0 | Hugging Face, 291 descargas | Sin benchmarks publicados; estado de evaluacion UNKNOWN |
| Qwen/Qwen3.5-0.8B (base) | 0.8B | no disponible en la informacion | no disponible en la informacion | Hugging Face | Modelo base sobre el que se aplica el adaptador |
| Alternativas de 0.5B-1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de evaluacion verificada: la model card declara estado UNKNOWN_NO_EVAL_RECEIPT; no hay garantia de calidad del ajuste.
- Sin benchmarks publicados: no es posible comparar su rendimiento con otros modelos de forma objetiva.
- Idioma limitado: solo se declara soporte de ingles.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no cuantificado para este artefacto.
- Sesgos: no documentados; al no haber informacion sobre datos de entrenamiento, no se pueden evaluar sesgos conocidos.
- Dependencia del modelo base: requiere cargar Qwen/Qwen3.5-0.8B, cuyas condiciones de uso y limitaciones se heredan.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de evaluacion desaconseja su uso en produccion sin validacion propia.
- Documentacion escasa: la model card se centra en trazabilidad y no en capacidades funcionales.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski-r4
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub: https://github.com/szl-holdings
- Repositorio de generacion de cards: https://github.com/szl-holdings/estate-cards
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
