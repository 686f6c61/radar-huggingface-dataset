# user0391/punyllm-1M-Instruct

## Resumen

Punyllm-1M-Instruct es un modelo de lenguaje de escala experimental publicado por el usuario `user0391` en Hugging Face. Con tan solo 1.334.016 parametros totales (aproximadamente 1,3 millones), se situa varios ordenes de magnitud por debajo de los modelos de produccion actuales: es un ejercicio de entrenamiento de bajo coste mas que una herramienta lista para uso real. El propio autor lo describe como "extremadamente incoherente" y advierte que no lo recomienda para descarga.

El modelo fue entrenado en un MacBook Air con chip M1 utilizando el dataset TinyStories, un corpus de cuentos infantiles sinteticos disenado precisamente para entrenar modelos muy pequenos capaces de generar texto gramaticalmente coherente en dominios restringidos. La model card es deliberadamente informal y no aporta informacion sobre arquitectura, tokenizador, contexto ni proceso de alineacion, mas alla de la licencia MIT.

Su relevancia es, por tanto, divulgativa y educativa: sirve como ejemplo de que es posible entrenar un modelo desde cero en hardware de consumo, y como banco de pruebas para pipelines de cuantizacion y despliegue (el repo incluye pesos en formato GGUF). No debe confundirse con un modelo de proposito general ni evaluarse con los criterios habituales de un LLM de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card) |
| Parametros totales | 1.334.016 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | no disponible (entrenado presumiblemente en ingles via TinyStories) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo con tag `gguf`); safetensors referenciado en metadatos de parametros |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la model card: no se indica si es un transformer decoder-only, el numero de capas, la dimension oculta ni el mecanismo de atencion. Dado el tamano (1,3 M de parametros) y el corpus empleado (TinyStories), lo mas probable es que se trate de un transformer decoder-only de dimension muy reducida, pero esto no esta confirmado por el autor y no debe darse por hecho.

El entrenamiento se realizo en un MacBook Air con chip M1, lo que situa el coste computacional en el orden de horas o pocos dias en hardware de consumo. El dataset es TinyStories, compuesto por relatos infantiles cortos con vocabulario limitado. No hay evidencia de fases de RLHF, DPO ni instruccion supervisada formal, pese al sufijo "Instruct" del nombre; la model card no menciona ningun proceso de alineacion. Tampoco se documentan el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto muy corto y de estructura simple, limitada al dominio de los cuentos infantiles de TinyStories.
- Capacidad de continuacion de texto narrativo sencillo en ingles, con coherencia local muy limitada.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de capacidades multilingues; el corpus de entrenamiento es en ingles.
- No dispone de modo "thinking", vision, audio ni ninguna capacidad multimodal.
- No se documenta soporte de plantillas de chat ni de formato de instrucciones, a pesar del sufijo "Instruct".

## Casos de uso

- Docencia sobre entrenamiento de LLM: sirve para ilustrar el ciclo completo de entrenamiento de un modelo desde cero en hardware de consumo (MacBook Air M1), incluyendo la preparacion de datos con TinyStories y la exportacion a GGUF.
- Pruebas de pipelines de cuantizacion y despliegue: al ser un GGUF de apenas unos megabytes, permite validar de extremo a extremo flujos con llama.cpp u Ollama sin consumir recursos significativos.
- Test de integracion en CI/CD: util como modelo "dummy" para verificar que un servicio de inferencia arranca, carga pesos y responde, sin coste de GPU.
- Experimentos de tokenizacion y analisis de representaciones: su tamano minimo facilita inspeccionar embeddings y capas internas en un portatil.
- Demostraciones de las limitaciones de los modelos pequenos: ejemplifica de forma palpable por que la coherencia requiere escala, sirviendo de contraste en charlas o articulos.
- Reproduccion de experimentos educativos: permite replicar el entrenamiento en un equipo similar y comparar resultados con el modelo publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en cualquier cuantizacion razonable, dado el tamano de 1,3 M de parametros (unos 2,7 MB en FP16 y aproximadamente 1,3 MB en cuantizacion de 8 bits).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU integrada, y tambien en Raspberry Pi y dispositivos moviles.
- Opciones de despliegue: llama.cpp y Ollama son las opciones naturales al distribuirse en GGUF; tambien puede cargarse con bibliotecas de Python estandar si se dispone de los pesos en safetensors.
- Latencia y throughput: no disponibles; por el tamano, la latencia sera del orden de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Punyllm-1M-Instruct | 1.334.016 | no disponible | MIT | Hugging Face (GGUF) |
| Modelos TinyStories de referencia (p. ej. variantes de 1-10 M) | 1-10 M | no disponible | variable | Hugging Face |
| GPT-2 small | 124 M | 1024 | MIT | Hugging Face |
| SmolLM-135M | 135 M | 2048 | Apache 2.0 | Hugging Face |

La comparacion con GPT-2 small o SmolLM-135M es meramente orientativa por escala: ambos son dos ordenes de magnitud mayores y estan entrenados con corpus generales, por lo que no son alternativas funcionales para las mismas tareas. Dentro de la categoria de modelos entrenados con TinyStories, las variantes publicadas por la comunidad suelen oscilar entre 1 y 10 millones de parametros con resultados cualitativamente similares.

## Limitaciones y advertencias

- Coherencia muy baja: el propio autor califica el modelo de "extremadamente incoherente"; no es apto para generar texto util en produccion.
- Dominio restringido: entrenado con TinyStories, tiende a producir narrativa infantil simple y falla fuera de ese registro.
- Idiomas: no hay confirmacion de soporte multilingue; el corpus es en ingles.
- Riesgo de alucinacion: alto y estructural, derivado de la escasa capacidad del modelo, no de un fallo de alineacion.
- Sesgos: no documentados; el corpus sintetico de TinyStories reduce pero no elimina sesgos estereotipados en los cuentos.
- Licencia MIT: permite uso comercial y modificacion, pero la calidad del modelo hace inviable cualquier aplicacion comercial real.
- Falta de documentacion: sin informacion sobre tokenizador, contexto, plantilla de chat ni proceso de entrenamiento, lo que dificulta su reproduccion exacta.
- El sufijo "Instruct" no esta respaldado por ninguna fase de instruccion documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/user0391/punyllm-1M-Instruct
- Dataset TinyStories (referencia del corpus de entrenamiento): https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories: https://arxiv.org/abs/2305.07759
