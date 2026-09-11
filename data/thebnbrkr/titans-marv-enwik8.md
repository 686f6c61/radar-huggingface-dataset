# thebnbrkr/titans-marv-enwik8

## Resumen

`thebnbrkr/titans-marv-enwik8` es un checkpoint de investigacion publicado en HuggingFace por el usuario `thebnbrkr`. Se trata de un modelo de lenguaje pequeno que opera a nivel de byte y que incorpora una memoria neuronal Titans de 0,37 M de parametros. El objetivo del autor no es ofrecer un modelo de proposito general, sino estudiar si la memoria de test-time —pesos que se actualizan mediante descenso de gradiente durante la propia inferencia— puede analizarse con las mismas tecnicas de diff de caracteristicas y ablacion causal que MARV ya aplica a pesos congelados.

El modelo se entreno durante 3000 pasos sobre enwik8, un corpus de bytes de Wikipedia en ingles muy utilizado en investigacion de compresion y modelado de lenguaje. La perdida de validacion final reportada es de 1,863 nats, frente a la linea base de bytes uniformes de 5,545 nats. Convertido a la metrica habitual del benchmark, equivale a unos 2,69 bits por byte.

Su relevancia es puramente cientifica: es un banco de pruebas reproducible y de coste minimo para estudiar memorias de test-time en modelos reales de lenguaje, y para contrastar el comportamiento observado en tareas sinteticas de recuperacion autoasociativa. No cuenta con descargas ni valoraciones, no esta instruido para seguir ordenes y no dispone de ficha de modelo orientada a uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de byte con memoria neuronal Titans (checkpoint de investigacion "MAC") |
| Parametros totales | No disponible; la memoria Titans declarada tiene 0,37 M de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; entrenado unicamente sobre enwik8 (Wikipedia en ingles) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (`titans_marv_enwik8.pt`, cargado con `torch.load`); no se publica safetensors |
| Tamano del repositorio | 0,0 GB segun HuggingFace |
| Fecha de creacion | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura combina un transformer que trabaja directamente sobre bytes con un modulo de memoria neuronal Titans, el mecanismo de memoria de test-time propuesto en la investigacion de Titans. A diferencia de los pesos congelados habituales, esta memoria se actualiza mediante escrituras durante la inferencia, de modo que el estado del modelo cambia a medida que procesa la secuencia. El autor la describe como "MAC transformer" y publica el codigo de reconstruccion en la rama `marv-titan` del repositorio `thebnbrkr/marv`.

El entrenamiento consistio en 3000 pasos sobre enwik8. La perdida de validacion final fue de 1,863 nats, muy por debajo de la linea base de bytes uniformes (5,545 nats), lo que confirma que el modelo aprende estructura real del lenguaje a pesar de su tamano. No se documentan en la informacion disponible el numero de tokens procesados, la composicion exacta del dataset mas alla de enwik8, ni fases de RLHF o DPO; por el tipo de checkpoint y el objetivo, cabe asumir que no las hubo, pero no esta confirmado.

El hallazgo tecnico principal del analisis de este checkpoint es que, al entrenar la memoria sobre modelado de lenguaje real, la memoria acumula escrituras en lugar de olvidarlas: la `norm_ratio` se mantiene por encima de 1 y la magnitud nunca cae por debajo de su tamano original. Esto es lo contrario del olvido exponencial agresivo que se observa cuando la misma arquitectura se entrena sobre una tarea sintetica de recuperacion autoasociativa.

## Capacidades

- Modelado de lenguaje a nivel de byte: predice el siguiente byte de una secuencia, sin tokenizador intermedio.
- Memoria de test-time: el modulo Titans actualiza su estado mediante gradiente durante la inferencia, lo que permite estudiar adaptacion en tiempo de ejecucion.
- Investigacion de interpretabilidad: el checkpoint esta preparado para el flujo de trabajo de MARV, orientado a diferenciar caracteristicas y realizar ablaciones causales sobre la memoria.
- Compresion de texto: la perdida reportada permite calcular tasas de compresion sobre enwik8 (aproximadamente 2,69 bits por byte).
- Reproducibilidad experimental: el autor publica el codigo necesario (`titans_real_text.py`, dependencia `titans-pytorch`) para recargar el checkpoint.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No esta ajustado por instrucciones: no hay modo chat, modo thinking, vision ni audio.
- Capacidades multilingues: no disponibles; el entrenamiento se limita a Wikipedia en ingles.

## Casos de uso

- Investigacion sobre memoria de test-time: el modelo sirve como sujeto de prueba controlado para estudiar como evolucionan los pesos que se actualizan en inferencia, con un coste computacional minimo y un corpus estandar.
- Ablacion causal de memorias neuronales: permite aplicar las tecnicas de diff de caracteristicas de MARV a una memoria que se modifica durante la inferencia, en lugar de a pesos congelados.
- Reproduccion de experimentos de interpretabilidad: al publicarse el codigo de reconstruccion y los hiperparametros del entrenamiento, otro equipo puede replicar exactamente el checkpoint y contrastar los resultados de `norm_ratio` reportados.
- Estudio comparativo de regimenes de olvido: el hallazgo de acumulacion de escrituras frente al olvido exponencial en tareas sinteticas se puede verificar cambiando el dataset de entrenamiento y manteniendo la arquitectura.
- Linea base de compresion a nivel de byte: con 2,69 bits por byte sobre enwik8, es un punto de referencia de bajo coste para comparar variantes de tokenizacion o de memoria en tareas de compresion.
- Docencia y prototipado en CPU: al tratarse de un modelo de menos de un megabyte de parametros en el modulo de memoria, se puede ejecutar en un portatil o en una Raspberry Pi para demostrar mecanismos de memoria en transformers sin acceso a GPU.
- Pruebas de seguridad de carga de checkpoints: sirve como caso de estudio de las implicaciones de distribuir pesos en formato pickle (`torch.load`) en lugar de safetensors.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la informacion disponible son la perdida de validacion y la linea base:

| Metrica | Valor |
|---|---|
| Perdida de validacion final (enwik8, 3000 pasos) | 1,863 nats |
| Linea base de bytes uniformes | 5,545 nats |
| Bits por byte (derivado de la perdida reportada) | ~2,69 bpb |
| Perplejidad por byte (derivada de la perdida reportada) | ~6,4 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula en GPU; el modelo cabe en memoria de sistema, muy por debajo de 1 GB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) es mas que suficiente si se quiere acelerar.
- Cabe en GPU consumer: si, en cualquier modelo, incluidos integrados y aceleradores de baja potencia.
- Opciones de despliegue: unicamente PyTorch con el codigo de la rama `marv-titan` del repositorio del autor. No hay soporte conocido en vLLM, llama.cpp, Ollama, TGI ni en formatos GGUF, dado que la arquitectura es personalizada.
- Latencia y throughput estimados: no disponibles. El coste por paso es bajo por el tamano del modelo, pero la actualizacion de la memoria en inferencia anade computo no cuantificado en la informacion disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos verificables en la informacion proporcionada. Se trata de un checkpoint de investigacion con un objetivo muy especifico (analisis de memoria de test-time), sin benchmarks estandar publicados, sin descargas y con una arquitectura propia que no sigue ninguna familia conocida de modelos abiertos. El unico punto de referencia cuantitativo disponible es la linea base de bytes uniformes sobre enwik8 (5,545 nats), frente a la cual este modelo obtiene 1,863 nats.

## Limitaciones y advertencias

- No es un modelo de proposito general: no sigue instrucciones, no mantiene conversaciones y no esta alineado con preferencias humanas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar continuaciones plausibles pero incorrectas; en este caso, ademas, sin ningun ajuste que lo modere.
- Idioma: el entrenamiento se limita a enwik8, derivado de Wikipedia en ingles. El rendimiento en castellano u otros idiomas no esta caracterizado.
- Longitud de contexto desconocida: la informacion disponible no especifica la ventana soportada.
- Idiomas soportados no declarados en la ficha de HuggingFace.
- Formato de pesos en pickle: la carga requiere `torch.load`, lo que implica ejecutar codigo potencialmente arbitrario si el archivo no proviene de una fuente de confianza.
- El repositorio aparece con un tamano de 0,0 GB segun HuggingFace; conviene verificar que el fichero `titans_marv_enwik8.pt` esta realmente disponible antes de planificar cualquier reproduccion.
- Ausencia de validacion externa: cero descargas y cero valoraciones, sin resultados de terceros que corroboren las cifras reportadas.
- La licencia MIT permite uso comercial y modificacion, pero el modelo no ofrece garantias y su utilidad practica fuera de la investigacion es muy limitada.
- El autor documenta un comportamiento de la memoria (acumulacion de escrituras) que puede no generalizarse a otras configuraciones, escalas o tareas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thebnbrkr/titans-marv-enwik8
- Repositorio del proyecto MARV (rama `marv-titan`): https://github.com/thebnbrkr/marv
- Documentacion del experimento: `experiments/README.md` dentro de la rama `marv-titan` del repositorio anterior
- Dependencia de codigo: `titans-pytorch` (paquete de Python), junto con `titans_real_text.py` de la rama `marv-titan`

Nota: los resultados de busqueda web proporcionados no contienen enlaces relevantes sobre este modelo; el contenido devuelto corresponde a una tienda de alimentacion y no guarda relacion con la ficha.
