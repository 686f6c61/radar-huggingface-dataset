# ThomasClarke/course-contrastive

## Resumen

ThomasClarke/course-contrastive es un prototipo de investigacion publicado en Hugging Face por el usuario ThomasClarke bajo licencia Apache 2.0. Se trata de un Tiny Transformer de arquitectura reducida (16.576 parametros totales segun los pesos en safetensors) orientado a tareas de aprendizaje contrastivo. El repositorio incluye el codigo de implementacion (`pipeline.py`), la configuracion de arquitectura (`config.json`), la receta de entrenamiento por defecto (`training_args.json`) y un checkpoint de inicializacion (`model.safetensors`).

El modelo no es un modelo entrenado ni evaluado: la propia model card indica explicitamente que el checkpoint es una inicializacion valida para pruebas de humo (smoke tests) y no un checkpoint con benchmarks. No se declaran resultados de rendimiento, ni idiomas soportados, ni pipeline de Hugging Face. Su relevancia es, por tanto, exclusivamente academica o didactica: sirve como punto de partida reproducible para experimentos de aprendizaje contrastivo con arquitecturas minimas.

Por su escala (16.576 parametros, muy por debajo de cualquier modelo de produccion) y por la ausencia de pesos entrenados, no es adecuado para despliegue real. Su interes esta en el codigo y la configuracion, que documentan decisiones de diseno concretas: atencion con grouped query, fusion mediante concatenacion y MLP, activacion mish y normalizacion layernorm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atencion grouped query, fusion concat MLP, activacion mish, normalizacion layernorm) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicializacion); codigo en Python (`pipeline.py`) |

## Arquitectura y entrenamiento

La arquitectura es un Tiny Transformer con atencion de tipo grouped query, fusion mediante concatenacion seguida de MLP, funcion de activacion mish y normalizacion layernorm. La escala declarada es "base". El repositorio incluye un `config.json` con los ajustes generados de arquitectura y un `training_args.json` con la receta de experimento por defecto, que emplea el optimizador Lion con un esquema de programacion de tipo step.

No hay evidencia de un entrenamiento completado: la model card afirma que el checkpoint `model.safetensors` es una inicializacion valida para pruebas de humo y que no se presenta como checkpoint entrenado con benchmarks. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. La implementacion es personalizada, por lo que las APIs genericas de carga automatica requieren un adaptador explicito antes de su uso.

## Capacidades

- No se declaran capacidades funcionales verificadas: el checkpoint no ha sido entrenado.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- No hay capacidades multilingues declaradas (idiomas no disponibles).
- No hay modo thinking, vision ni audio.
- El unico uso previsto es como punto de partida experimental para tareas de aprendizaje contrastivo.

## Casos de uso

- Prototipado academico de aprendizaje contrastivo: el repositorio ofrece `pipeline.py` con un bloque `__main__` de ejemplo de prueba de humo, util para reproducir un experimento minimo con arquitectura Tiny Transformer.
- Docencia y formacion: sirve para ilustrar decisiones de diseno concretas (grouped query attention, fusion concat MLP, mish, layernorm) en un modelo de 16.576 parametros que se ejecuta en CPU sin requisitos relevantes.
- Pruebas de integracion de pipelines: al ser un checkpoint de inicializacion valido en safetensors, permite validar el cableado de carga de pesos y configuracion antes de sustituirlo por un checkpoint entrenado.
- Experimentacion con optimizadores: la receta por defecto con Lion y programacion step permite comparar configuraciones de entrenamiento manteniendo el mismo presupuesto de datos, ajuste y semillas aleatorias, tal como recomienda la model card.
- Base para evaluaciones controladas: la guia de evaluacion del autor propone usar un conjunto de validacion especifico de la tarea, reportar la metrica en al menos tres semillas e incluir una linea base de capacidad equivalente.
- Estudio de formatos y configuracion: los ficheros `config.json` y `training_args.json` documentan los valores por defecto y formatos de archivo sin presentar cifras de rendimiento no verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se reclama ninguna puntuacion de benchmark en el repositorio y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; con 16.576 parametros, el modelo ocupa del orden de decenas de kilobytes en precision completa, por lo que cabe en CPU y en cualquier GPU consumer.
- GPU recomendadas: no se requiere GPU; cualquier GPU (incluidas GTX/RTX de gama baja) es suficiente. No hay datos de rendimiento que justifiquen modelos concretos como A100 o H100.
- Cabe en consumer GPU: si, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI; la implementacion es personalizada y requiere un adaptador explicito para APIs genericas de carga automatica. El punto de entrada documentado es `python pipeline.py --help`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoria (Tiny Transformer para aprendizaje contrastivo) ni datos de rendimiento que permitan una comparacion rigurosa. Cualquier comparacion con modelos de produccion seria enganosa dada la diferencia de escala (16.576 parametros frente a miles de millones) y la ausencia de entrenamiento.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es una inicializacion para pruebas de humo, no un modelo funcional.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, segun la propia model card.
- Riesgo de alucinacion y sesgos: no evaluables, al no existir un modelo entrenado.
- Limitaciones de contexto e idioma: no documentadas (no disponibles).
- Licencia Apache 2.0: permite uso comercial del codigo y los pesos, pero deben revisarse por separado los terminos de los datos de origen si se usa con datasets externos.
- Implementacion personalizada: las APIs genericas de carga automatica fallan sin un adaptador explicito.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aqui incluidos.
- No apto para produccion en su estado actual.

## Enlaces

- Hugging Face: https://huggingface.co/ThomasClarke/course-contrastive
