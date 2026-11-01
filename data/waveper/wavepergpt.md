# waveper/WavePerGPT

## Resumen

WavePerGPT es un modelo de lenguaje de escala muy reducida (5.752.320 parametros totales) publicado por el usuario waveper en HuggingFace bajo licencia MIT. Segun su propia model card, se trata de un experimento entrenado "por diversion" sobre los mensajes de Discord del autor, sin pretension de utilidad general y con un comportamiento declaradamente deficiente: el autor lo describe como "blazingly Fast and Stupid" y advierte que "no puede escribir normalmente", que produce "gibberish" y que su ventana de contexto maxima es de 128 tokens.

No es un modelo orientado a produccion ni a evaluacion comparativa. Su interes es puramente experimental o educativo: sirve como ejemplo de fine-tuning de un modelo diminuto sobre un corpus personal y como caso de estudio de las limitaciones de los modelos por debajo del orden de los millones de parametros. No se dispone de informacion sobre arquitectura concreta, dataset, proceso de entrenamiento ni evaluacion.

La relevancia actual es limitada y debe enmarcarse en el contexto de modelos tiny para experimentacion local, prototipado de pipelines o docencia sobre tokenizacion y generacion de texto. Cualquier uso real requeriria un modelo de mayor capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 5.752.320 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (segun model card) |
| Tipos de cuantizacion | GGUF (unico formato publicado; niveles concretos no disponibles) |
| Idiomas soportados | no disponible (entrenado sobre mensajes de Discord del autor, idioma no declarado) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo con tag gguf; no se observan safetensors publicados pese al conteo de parametros) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna (tipo de transformer, numero de capas, dimensiones de hidden state, atencion, tokenizador, etc.). El unico dato estructural verificable es el recuento de parametros: 5.752.320, lo que situa al modelo en el rango de los modelos tiny, muy por debajo de los modelos pequenos habituales (p. ej., ~100M-1B).

Respecto al entrenamiento, la model card indica que fue entrenado sobre los mensajes de Discord del propio autor "por diversion". No se especifica el numero de tokens, la composicion del dataset, si hubo etapas de alineacion (RLHF, DPO, SFT supervisado mas alla del fine-tuning base) ni hiperparametros. Tampoco se documenta ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, MoE u otras). El tag `endpoints_compatible` sugiere que el autor lo preparo para su despliegue mediante Inference Endpoints de HuggingFace, pero no aporta informacion sobre el entrenamiento.

## Capacidades

- Generacion de texto muy limitada: el autor advierte explicitamente de que el modelo "no puede escribir normalmente" y produce "gibberish".
- Ventana de contexto de 128 tokens, insuficiente para conversaciones multi-turno o documentos de cualquier tamano.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-step.
- Capacidades multilingues no declaradas; el corpus de entrenamiento son mensajes de Discord del autor, por lo que el sesgo idiomatico es desconocido y probablemente muy restringido.
- No se documentan capacidades especiales (thinking mode, vision, audio, code, matematicas).
- Formato GGUF, lo que permite su carga en runtimes de inferencia local compatibles con este formato.

## Casos de uso

- Docencia y talleres sobre modelos de lenguaje: sirve para ilustrar en directo como un modelo con pocos millones de parametros y contexto de 128 tokens falla en tareas que un modelo de escala media resuelve, sin coste de computo.
- Pruebas de integracion de pipelines GGUF: permite validar el cableado de un runtime (carga, tokenizacion, generacion, streaming) antes de sustituir el modelo por uno mayor en el mismo pipeline.
- Experimentos de fine-tuning sobre corpus personales: como base diminuta para reproducir el flujo completo de entrenamiento y publicacion en HuggingFace con un coste minimo.
- Pruebas de carga y benchmarking de infraestructura: al ocupar practicamente nada en disco y VRAM, sirve para medir latencia de red, colas y orquestacion sin que el modelo sea el cuello de botella.
- Generacion de texto de relleno o sintetico no sensible: para pruebas de UI, maquetacion o demos donde el contenido no importa y solo se necesita una salida de texto.
- Ejemplo de publicacion de modelos en HuggingFace: la model card y el repo sirven como plantilla de un caso real de publicacion con licencia MIT y formato GGUF.
- Prototipado de un endpoint compatible con la API de Inference Endpoints: el tag `endpoints_compatible` permite probar el flujo de despliegue sin incurrir en costes de un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el autor declara explicitamente que el modelo produce "gibberish", por lo que no cabe esperar resultados competitivos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en la mayoria de cuantizaciones GGUF, dado el tamano de 5,75M de parametros (a 4 bits, ~3 MB de pesos; a 8 bits, ~6 MB; a 16 bits, ~12 MB). Las cifras exactas dependen del nivel de cuantizacion publicado, que no se detalla.
- GPU recomendadas: cualquier GPU consumer moderna o integrada; el modelo cabe holgadamente en GPUs con 1-2 GB de VRAM e incluso puede ejecutarse en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4060, GTX 1650, iGPU recientes) y en la mayoria de CPUs con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de HuggingFace.
- Latencia y throughput: no disponibles. Por el tamano del modelo, la latencia estara dominada por el overhead del runtime y de la red mas que por el computo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan una comparativa cuantitativa fiable. A modo orientativo estructural:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WavePerGPT | 5,75M | 128 tokens | MIT | GGUF | Modelo experimental entrenado con mensajes de Discord; sin benchmarks |
| Modelos tiny de referencia (p. ej., variantes <100M) | variable | variable | variable | safetensors/GGUF | No se dispone de comparacion directa con este modelo |
| Modelos pequenos de proposito general (~1B) | ~1B | 2K-8K tokens | variable | safetensors/GGUF | Categoria distinta; no comparable en calidad |

No se conocen modelos comparables publicados en la misma categoria (modelos de ~5M de parametros entrenados sobre corpus personales) con datos publicos de evaluacion.

## Limitaciones y advertencias

- Calidad de generacion declaradamente deficiente: el autor califica la salida como "gibberish", por lo que no es apto para tareas de produccion ni para evaluacion de calidad.
- Contexto maximo de 128 tokens: insuficiente para cualquier caso de uso real con contexto; el autor senala ademas que el modelo "desperdicia" esa ventana.
- Sesgos desconocidos: al entrenarse sobre mensajes de Discord de una persona, el modelo hereda los sesgos, estilo y tematicas de ese corpus, no documentados.
- Riesgo de alucinacion: alto y no mitigado; no hay alineacion ni evaluacion documentada.
- Idiomas: no declarados; el corpus es de un unico usuario, por lo que la cobertura multilingue es practicamente inexistente o desconocida.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo no ofrece garantias de calidad ni de idoneidad; el autor no ofrece soporte.
- Datos personales: al entrenarse sobre mensajes de Discord, existe un riesgo potencial de memorizacion de contenido personal del autor; conviene tratarlo con cautela en contextos sensibles.
- No apto para despliegues en produccion con usuarios reales.

## Enlaces

- HuggingFace: https://huggingface.co/waveper/WavePerGPT
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
