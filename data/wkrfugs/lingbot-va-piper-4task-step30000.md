# wkrfugs/lingbot-va-piper-4task-step30000

## Resumen

LingBot-VA Piper teacher es un ajuste fino (fine-tuning) del modelo base `robbyant/lingbot-va-base` sobre cuatro tareas de manipulacion con el brazo robotico Piper, entrenado durante 30.000 pasos de optimizacion. Lo publica el usuario `wkrfugs` y se distribuye como un "teacher" multi-paso: no es un estudiante destilado tipo Flash-WAM o DriftWAM ni un checkpoint de politica OpenPI. El modelo combina flow matching sobre video y sobre acciones, es decir, predice latentes de video futuros y, a partir de ellos, secuencias de acciones motoras.

La arquitectura es un transformer de difusion 3D del linaje Wan (`WanTransformer3DModel`), acompanado de un VAE causal y un text encoder congelados heredados del modelo base. El fichero de pesos publicado ocupa 20.355.577.064 bytes (aproximadamente 18,96 GiB) en FP32 original, lo que equivale a unos 5.090 millones de parametros si todos los tensores son de 32 bits; el autor no declara el recuento de parametros de forma explicita.

Su relevancia es practica: documenta de forma inusualmente rigurosa el contrato de entrada (dos camaras, 224x224, latentes de 48 canales) y el contrato de accion (7 valores absolutos por paso, a 30 Hz, con canales concretos del tensor de 30 dimensiones), ademas de incluir el parche de runtime y las estadisticas de normalizacion exactas. Eso lo convierte en una referencia util para reproducir experimentos de vision-lenguaje-accion en robot real, aunque su adopcion esta limitada por la ausencia de benchmarks publicos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion 3D para video y acciones (`WanTransformer3DModel`) con flow matching; VAE causal y text encoder congelados del modelo base |
| Parametros totales | No declarado por el autor; aproximadamente 5.090 millones estimados a partir del tamano del fichero de pesos (20.355.577.064 bytes en FP32) |
| Longitud de contexto | No disponible en el sentido de contexto textual; ventana de rollout fija de 4 latentes de video futuras = 48 acciones (1,6 s a 30 Hz) |
| Tipos de cuantizacion | Solo FP32 original; no se publican versiones FP16, BF16, GGUF ni cuantizaciones de 8 o 4 bits |
| Idiomas soportados | No disponible (las instrucciones de tarea se codifican con el text encoder del modelo base; el autor no detalla el soporte linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos originales en FP32 dentro de `transformer/` (junto con la configuracion del modelo); no hay safetensors ni GGUF publicados de forma explicita |

## Arquitectura y entrenamiento

El modelo sigue el esquema de LingBot-VA: un transformer de difusion tridimensional que aplica flow matching de manera conjunta sobre latentes de video y sobre acciones. La observacion se codifica con un VAE causal congelado, camara por camara, y los latentes resultantes se concatenan en anchura (primero `head`, despues `hand`) para dar `[48, F, 14, 28]`. La instruccion de tarea se procesa con el text encoder congelado, produciendo embeddings de forma `[512, 4096]` con los tokens de relleno a cero. Cada latente de video futuro se corresponde con 12 acciones; el rollout offline valida cuatro latentes futuros, lo que arroja 48 acciones validas (1,6 segundos a 30 Hz) y descarta el bloque de accion ficticio del latente inicial observado.

El entrenamiento consistio en 30.000 pasos de optimizacion sobre cuatro tareas del robot Piper, con un `split.json` y unas huellas de datos (`data_identity.json`) publicadas para trazabilidad. La normalizacion de acciones se ajusto con cuantiles q01/q99 calculados solo sobre episodios de entrenamiento, con la formula `normalized = 2 * (physical - q01) / (q99 - q01 + 1e-6) - 1`, y las etiquetas no se recortaron al intervalo [-1, 1]. El autor no especifica el numero total de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO, algo esperable en un modelo de robotica y no de lenguaje. El paquete incluye `training_summary.json` y `validation_metrics.json`, pero sus valores no se reproducen en la model card.

## Capacidades

- Generacion de acciones motoras para un brazo Piper: 7 valores absolutos por paso (6 articulaciones en radianes y apertura de pinza en metros), a 30 Hz.
- Prediccion conjunta de video futuro y acciones mediante flow matching, lo que permite pronosticar la evolucion visual de la escena junto con el comando motor.
- Control a partir de observaciones visuales de dos camaras (`observation.images.head` y `observation.images.hand`) mas una instruccion de tarea en lenguaje natural.
- Ejecucion de cuatro tareas concretas de manipulacion, las cubiertas por el ajuste fino; no se detalla cuales son en la informacion disponible.
- Rollout multi-paso en modo teacher (no destilado), con generacion por fragmentos y truncado de predicciones sobrantes a 48 acciones.
- Inferencia con entradas precalculadas: existe un wrapper que consume latentes y embeddings ya codificados y usa solo el transformer ajustado, sin necesidad del VAE ni del text encoder.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico, vision general ni audio: es una politica robotica, no un modelo de lenguaje conversacional.

## Casos de uso

- Manipulacion robotica de cuatro tareas en banco de pruebas: el modelo recibe las imagenes de las camaras de cabeza y mano y emite consignas absolutas de articulaciones, adecuado para experimentos de imitacion en un brazo Piper real.
- Docencia e investigacion en vision-lenguaje-accion: el contrato de entrada y accion completamente especificado y el parche de runtime incluido permiten reproducir el pipeline sin ambiguedades sobre resolucion, FPS o indices de canal.
- Generacion de modelos "teacher" para destilacion: al ser explicitamente un teacher multi-paso, sirve como referencia para entrenar estudiantes tipo Flash-WAM o DriftWAM con menos pasos de inferencia.
- Evaluacion offline de politicas: los scripts de `piper_adapter/` incluyen un evaluador offline que compara acciones predichas con las registradas, util para validar cambios de normalizacion o de preprocesado antes de tocar el robot.
- Prediccion de video para planificacion: la cabeza de video permite anticipar 1,6 segundos de evolucion de la escena, aprovechable en supervision de seguridad o en deteccion temprana de colisiones.
- Banco de pruebas de integracion de runtime: el repositorio fija versiones exactas (PyTorch 2.9.0, Diffusers 0.36.0, Transformers 4.55.2) y hashes de procedencia, lo que facilita usarlo como caso de prueba de pipelines reproducibles en laboratorio.
- Analisis de sensibilidad a la normalizacion: al publicar `norm_stats.json` con cuantiles empiricos no recortados, permite estudiar como afecta la escala de acciones al exito de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un fichero `validation_metrics.json` con el historial de validacion offline y una definicion de metrica en `train_action_l1_definition.json`, pero la model card no reproduce ningun valor numerico, por lo que no se puede presentar una tabla comparativa sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: solo los pesos del transformer en FP32 suman unos 18,96 GiB, de modo que se necesitan al menos 20-24 GB de VRAM para cargarlos, antes de contar activaciones y el VAE.
- Si se usa el camino de inferencia con entradas precalculadas, el VAE y el text encoder no son necesarios en tiempo de ejecucion; si se codifican observaciones nuevas, hay que anadir la memoria del VAE causal y del text encoder congelados.
- GPU recomendadas: A100 de 40 u 80 GB, H100 o GPUs de 48 GB como la RTX A6000 para trabajar con margen; una RTX 4090 de 24 GB queda al limite y probablemente requiera reducir el lote o el numero de latentes generados.
- No se publican pesos en FP16 ni BF16, por lo que el ahorro de memoria por cambio de precision exigiria una conversion propia no validada por el autor.
- Opciones de despliegue: runtime oficial `Robbyant/lingbot-va` en el commit `7c6ffa9bfc4b83582cafc860fab4c82cc7deeeeb`, aplicando `runtime/piper_inference.patch`; se debe instanciar `WanTransformer3DModel` directamente y no `AutoModel`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles. El modelo genera bloques de 12 acciones por latente y requiere varios pasos de muestreo por bloque, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingBot-VA Piper teacher (este modelo) | ~5.090 M (estimado por tamano de fichero) | 48 acciones (1,6 s a 30 Hz) por rollout | Sin benchmarks publicados | Apache 2.0 | Pesos FP32 en HuggingFace |
| robbyant/lingbot-va-base | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada | Modelo base en HuggingFace |
| Estudiantes destilados Flash-WAM / DriftWAM | No disponible | No disponible | No disponible | No disponible | Mencionados en la model card, sin enlace |
| Politicas OpenPI (tipo pi0) | No disponible | No disponible | No disponible | No disponible | Ecosistema separado; el autor indica que este checkpoint no es una politica OpenPI |

## Limitaciones y advertencias

- Sesgos: no se documenta ningun analisis de sesgo. Al estar entrenado en cuatro tareas de un unico brazo Piper y un unico entorno, el modelo probablemente no generaliza a otras morfologias, camaras u objetos fuera de la distribucion de entrenamiento.
- Riesgo de alucinacion: en el contexto de politicas roboticas se traduce en predicciones de accion plausibles pero fisicamente invalidas; el autor advierte que los cuantiles q01/q99 son empiricos y no limites fisicos del robot, por lo que no deben usarse como topes de seguridad.
- Los canales distintos de [14, 15, 16, 17, 18, 19, 28] estan enmascarados durante el entrenamiento y no deben interpretarse como comandos validos ni como ceros significativos.
- El preprocesado es estricto: redimensionado bilineal con preservacion de aspecto y relleno negro centrado a 224x224, sin estirar ni recortar; codificar camara por camara, concatenar latentes en anchura (head y luego hand) y reiniciar la cache del VAE por camara y episodio. Cualquier desviacion invalida las predicciones.
- Las acciones son objetivos absolutos de articulacion y apertura de pinza, no posiciones cartesianas, velocidades ni deltas; aplicar transformaciones tipo RoboTwin u OpenPI rompe la integracion.
- El checkpoint es de inferencia: no contiene estados de optimizador, scheduler ni RNG, por lo que no permite reanudar el entrenamiento de forma exacta.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los componentes congelados pueden tener condiciones propias que conviene revisar antes de un despliegue en produccion.
- No hay garantias de seguridad para operar un robot real: el autor indica explicitamente que los scripts incluidos son utilidades de preprocesado y evaluacion offline, no un cliente ni un controlador de robot.
- Ausencia total de benchmarks publicados y de resultados de validacion en la model card, lo que impide comparar su rendimiento con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wkrfugs/lingbot-va-piper-4task-step30000
- Modelo base: https://huggingface.co/robbyant/lingbot-va-base (revision `68b7bc1b35da6ddc67ea94c4ceb58d768fbb3f9c` para VAE, text encoder y tokenizer)
- Repositorio de runtime oficial: https://github.com/Robbyant/lingbot-va (commit `7c6ffa9bfc4b83582cafc860fab4c82cc7deeeeb`)
- No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
