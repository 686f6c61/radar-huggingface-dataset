# STRICHTER/contrastive-best

## Resumen

`STRICHTER/contrastive-best` es un repositorio de HuggingFace publicado por el usuario STRICHTER que contiene una implementación mínima y transparente de un *Tiny Transformer* orientado a aprendizaje contrastivo (fusión bilineal). No se trata de un modelo entrenado: la model card indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido para *smoke tests* y que no se presenta como un checkpoint evaluado. Con 16.576 parámetros totales (dato real del safetensors), su tamaño es varios órdenes de magnitud inferior al de cualquier modelo de produccion.

El interes del repositorio es de caracter didactico y de infraestructura: prioriza codigo legible, una receta de experimento reproducible (`training_args.json`) y pruebas de humo, y evita deliberadamente cualquier afirmacion de rendimiento. La etiqueta interna de escala es "giant", pero no guarda relacion con el numero real de parametros.

Ahora mismo no es utilizable como modelo de inferencia ni como encoder contrastivo: no hay pesos entrenados, no se documenta tokenizador, longitud de contexto ni idiomas soportados. Su valor esta como plantilla de partida para experimentos controlados y como fixture en pipelines de CI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (attention multi-query, fusion bilineal, activacion swish, normalizacion InstanceNorm) |
| Parametros totales | 16.576 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors; no se documentan GGUF, GPTQ, AWQ ni bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de escala minima con atencion multi-query, mecanismo de fusion bilineal para las representaciones (coherente con un objetivo contrastivo tipo par de embeddings), activacion swish y normalizacion InstanceNorm en lugar de LayerNorm. El script `eval.py` contiene tanto la definicion del modelo como un ejemplo ejecutable y el punto de entrada de entrenamiento; `config.json` registra los hiperparametros de arquitectura generados.

No hay entrenamiento completado. La receta por defecto usa RMSprop con un scheduler de tipo *step*, y la propia model card advierte que son valores de partida del script, no evidencia de una ejecucion finalizada. No se documenta volumen de tokens, composicion del corpus, ni fases de RLHF, DPO o ajuste por preferencias. Tampoco se declaran innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, SSM): el enfasis esta en la legibilidad del codigo y en pruebas de humo reproducibles.

## Capacidades

- No dispone de capacidades generativas demostradas: los pesos son una inicializacion sin entrenar.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingues ni idiomas cubiertos.
- Incluye una implementacion de fusion bilineal pensada para objetivos contrastivos (similitud entre pares de representaciones).
- Proporciona un ejemplo ejecutable y punto de entrada de entrenamiento en `eval.py`, util como referencia de implementacion.
- Al ser una implementacion propia, requiere un adaptador explicito para cargarse con APIs automaticas genericas.

## Casos de uso

- Material didactico sobre transformers: el repositorio expone en un solo archivo la definicion del modelo, la configuracion y el bucle de entrenamiento, lo que permite estudiar la estructura de atencion multi-query y InstanceNorm sin la complejidad de una libreria completa.
- Plantilla para experimentos de aprendizaje contrastivo: la fusion bilineal y la receta RMSprop + step sirven como punto de partida controlado para comparar funciones de perdida o estrategias de minado de negativos con presupuesto de computo minimo.
- Prueba de humo (smoke test) de pipelines de entrenamiento: al ser un checkpoint valido de inicializacion, permite verificar que el codigo de carga, el *forward pass* y el guardado de safetensors funcionan antes de lanzar un entrenamiento real.
- Fixture en tests de integracion y CI: su tamano (16.576 parametros) permite incluirlo en suites de test unitarias que validen serializacion, *sharding* o conversion de formatos sin consumir tiempo ni VRAM.
- Baseline de ablacion a capacidad minima: util para comprobar que una mejora observada en un modelo mayor no proviene de un error del protocolo experimental, entrenando el mismo pipeline con este modelo como cota inferior.
- Documentacion de rigor metodologico: su model card propone evaluar en un conjunto *held-out* especifico de la tarea, con al menos tres semillas y una baseline de capacidad equivalente, lo que lo convierte en un ejemplo de plantilla de evaluacion para otros repositorios pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card declara explicitamente que no se reclama ninguna puntuacion de benchmark y que el checkpoint no ha sido entrenado; por tanto, cualquier cifra (MMLU, HumanEval, GSM8K o metricas de recuperacion contrastiva) careceria de base.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula. Con 16.576 parametros, el peso en fp32 ocupa del orden de 66 KB y en fp16 unos 33 KB (calculo derivado del numero de parametros, no publicado por el autor); los estados intermedios dependen de la longitud de secuencia, que no se documenta.
- GPU recomendadas: ninguna en particular; el modelo es ejecutable en CPU. Cualquier GPU consumer (incluidas iGPU) es sobradamente suficiente.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: al ser una implementacion propia, no hay soporte directo en vLLM, TGI, llama.cpp u Ollama; la via prevista es ejecutar `eval.py` con PyTorch y, en su caso, escribir un adaptador para APIs de carga automatica.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

No disponible: el autor no aporta benchmarks ni comparaciones, y el modelo no esta entrenado, por lo que no existe una comparacion empirica valida con encoders contrastivos en uso. A modo de referencia de categoria (datos publicos de cada proyecto, no de este repositorio):

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| STRICHTER/contrastive-best | 16.576 | no disponible | Apache 2.0 | Checkpoint de inicializacion, sin entrenar |
| all-MiniLM-L6-v2 (referencia de categoria) | ~22,7 M | 256 tokens | Apache 2.0 | Entrenado y evaluado |
| all-mpnet-base-v2 (referencia de categoria) | ~109 M | 384 tokens | Apache 2.0 | Entrenado y evaluado |

La diferencia de tres a cuatro ordenes de magnitud en parametros y la ausencia de entrenamiento impiden cualquier comparacion de rendimiento significativa.

## Limitaciones y advertencias

- Los pesos no han sido entrenados: las salidas no son utilizables en produccion ni como encoder contrastivo.
- No se ha auditado robustez, equidad ni transferencia de dominio; tampoco existen sesgos medidos porque no hay comportamiento aprendido que medir.
- Riesgo de alucinacion: no evaluable en un checkpoint sin entrenar; cualquier uso generativo produciria salida sin sentido.
- No se documentan tokenizador, longitud de contexto ni idiomas, lo que impide planificar integraciones reales.
- La etiqueta de escala "giant" de la model card no corresponde al tamano real (16.576 parametros) y puede inducir a error si se cita fuera de contexto.
- Al ser una implementacion personalizada, las APIs de carga automatica de transformers no funcionan sin un adaptador explicito.
- La licencia Apache 2.0 permite uso comercial del codigo y los pesos, pero la propia model card recuerda revisar por separado los terminos de los datos externos que se usen con el repositorio.
- El repositorio no publica version, changelog ni resultados; conviene fijar el commit exacto si se reutiliza como plantilla.

## Enlaces

- [HuggingFace: STRICHTER/contrastive-best](https://huggingface.co/STRICHTER/contrastive-best)
- No se han encontrado en la busqueda web papers, blogs, repositorios auxiliares ni demos adicionales asociados a este modelo.
