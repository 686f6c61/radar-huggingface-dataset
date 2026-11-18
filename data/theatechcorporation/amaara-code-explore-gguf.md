# theatechcorporation/amaara-code-explore-GGUF

## Resumen

Amaara Code Explore es un modelo de lenguaje de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) especializado en una tarea muy concreta: la exploración de repositorios de código. Desarrollado por The A Tech Corporation, el modelo actúa como un agente que trabaja sobre un repositorio mediante llamadas a shell y lecturas de ficheros para localizar el código relevante ante un bug o una pregunta, y después se detiene. No edita ficheros: su función es exclusivamente de localización y reconocimiento del código.

El repositorio que nos ocupa, `theatechcorporation/amaara-code-explore-GGUF`, contiene los pesos cuantizados del modelo base `theatechcorporation/amaara-code-explore` en formato GGUF, listos para su uso con llama.cpp. Se publican cinco variantes de cuantización, desde F16 (8,1 GB) hasta Q4_K_M (2,6 GB), siendo Q8_0 la configuración sobre la que se midieron las métricas publicadas. La licencia es Apache 2.0.

La relevancia de este modelo radica en su enfoque estrecho y medible: en lugar de competir como un asistente de código generalista, se posiciona como un componente especializado dentro de pipelines de agentes, con métricas concretas de recall de ficheros en SWE-bench Lite y un presupuesto de pasos acotado. Es relevante para equipos que construyen sistemas de triaje de bugs o navegación de código donde la precisión de localización importa más que la generación de parches.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.326.350.848 (aprox. 4,3 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 262.144 tokens en servicio; entrenado a 8.192 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo (tipo de transformer, atención, posibles innovaciones como decodificación especulativa o atención lineal) en la información proporcionada. El dato disponible es el número de parámetros totales, 4.326.350.848, que sitúa al modelo en la categoría de aproximadamente 4B parámetros.

Respecto al entrenamiento, la model card indica que el modelo fue entrenado con una longitud de contexto de 8.192 tokens, aunque se sirve con ventanas mucho mayores (hasta 262.144 tokens). El autor advierte explícitamente que esta ventana ampliada «previene la truncación; no garantiza comprensión más allá de la longitud entrenada». No se detallan la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. El modelo está orientado a tareas de agente con llamadas a herramientas (shell, lectura de ficheros) y se distribuye con soporte para plantilla Jinja (`--jinja`), lo que sugiere un formato conversacional con tool calling.

## Capacidades

- Exploración de repositorios de código: el modelo navega por un repositorio mediante llamadas a shell y lecturas de ficheros para localizar el código relevante ante un bug o una pregunta.
- Tool calling / function calling: utiliza herramientas de shell y lectura de ficheros como parte de su flujo de agente.
- Razonamiento multi-paso acotado: opera con un presupuesto de pasos (60 pasos en la evaluación publicada) y se detiene al localizar el código relevante.
- Localización de ficheros (gold-file recall): capacidad medida de identificar los ficheros correctos relevantes para una incidencia.
- No edita código: cero llamadas de edición, escritura o parche en los episodios evaluados; esta es una restricción de diseño, no una carencia.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Triaje de bugs en repositorios grandes: el modelo recibe la descripción de un bug y explora el repositorio con shell y lecturas para identificar los ficheros implicados, entregando la localización al ingeniero o a un paso posterior del pipeline. Su recall medido del 90% en SWE-bench Lite (10 instancias) y una mediana de 2 llamadas a herramientas lo hacen adecuado para esta fase de localización.
- Enrutamiento previo a un modelo de edición: en un pipeline de dos etapas, Amaara Code Explore localiza los ficheros y un modelo generador de parches se encarga de la edición. La separación evita que un modelo generalista tenga que navegar repositorios completos.
- Asistente de navegación de código para desarrolladores: integrado en un IDE o interfaz de chat, responde a preguntas del tipo «¿dónde se gestiona la autenticación?» explorando el repositorio y devolviendo las rutas y fragmentos relevantes.
- Generación de contexto para revisión de código: dado un diff o una incidencia, el modelo reúne los ficheros y fragmentos relacionados para que un revisor humano o un sistema automático disponga del contexto necesario.
- Automatización de informes de incidencias: a partir de un ticket, el agente explora el repositorio y adjunta al ticket las rutas de los ficheros candidatos, reduciendo el tiempo de triaje manual.
- Construcción de índices de código bajo demanda: el modelo puede emplearse para recorrer un repositorio y producir un mapa de qué ficheros son relevantes para cada área funcional, alimentando sistemas de búsqueda o documentación.
- Despliegue local en estaciones de trabajo: con la cuantización Q4_K_M (2,6 GB) o Q5_K_M (3,0 GB), el modelo cabe en GPUs de consumo y permite exploración de código sin enviar el repositorio a servicios externos, algo relevante para código propietario.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la cuantización Q8_0, evaluados en SWE-bench Lite (dev) con 10 instancias, contexto de 262.144 tokens y un presupuesto de 60 pasos:

| Metrica | Resultado |
|---|---|
| Recall de ficheros gold | 9 / 10 (90%) |
| Mediana de llamadas a herramientas hasta alcanzarlo | 2 |
| Llamadas de edicion / escritura / parche | 0 |
| Episodios enviados (submitted) | 2 / 10 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. Tampoco se han publicado métricas para cuantizaciones inferiores a Q8_0; el autor advierte que el daño por cuantización por debajo de Q8_0 no está medido.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: F16 requiere aproximadamente 8,1 GB de pesos; Q8_0 unos 4,3 GB; Q6_K unos 3,4 GB; Q5_K_M unos 3,0 GB; Q4_K_M unos 2,6 GB. A ello hay que sumar la memoria de la caché KV, que con contexto de 262.144 tokens y caché cuantizada a q8_0 (K y V) es significativa y debe dimensionarse aparte.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, las cuantizaciones Q4_K_M a Q8_0 caben en GPUs de consumo con 8 GB o más de VRAM; F16 requiere al menos 10-12 GB. Para contexto largo (262k) se necesita VRAM adicional para la caché KV.
- Cabe en GPU de consumo: sí, al menos las cuantizaciones Q4_K_M, Q5_K_M, Q6_K y Q8_0, siempre que se disponga de VRAM suficiente para la caché KV al contexto configurado.
- Opciones de despliegue: llama.cpp mediante `llama-server`, con los parámetros indicados por el autor (`-ngl 99 -c 262144 --parallel 1 -ub 512 -b 1024 --jinja --cache-type-k q8_0 --cache-type-v q8_0`). El autor advierte que `--parallel 1` no es opcional a ese contexto, porque `-c` es un pool compartido y con 4 slots por defecto cada petición recibiría solo 65.536 tokens. No se documentan otras opciones de despliegue (vLLM, TGI, Ollama) en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparativa rigurosa. Como referencia categórica, este modelo se sitúa en el segmento de modelos de aproximadamente 4B parámetros especializados en agentes de código, un nicho poco poblado frente a los asistentes de código generalistas de mayor tamaño. No se han publicado comparaciones directas con alternativas en la información disponible.

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Amaara Code Explore (GGUF) | 4,3B | 262.144 en servicio (8.192 entrenado) | Exploración de repositorios, sin edición | Apache 2.0 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no escribe código: cero llamadas de edición, escritura o parche en los 10 episodios evaluados. No debe usarse para generar parches.
- El daño por cuantización por debajo de Q8_0 no está medido. El 90% de recall se obtuvo con Q8_0; el autor recomienda medir antes de confiar en Q4_K_M u otras cuantizaciones agresivas, ya que el JSON de tool calls de un agente de código es más frágil que la salida de chat.
- Entrenado a 8.192 tokens y servido a 262.144: la ventana ampliada evita la truncación pero no garantiza comprensión más allá de la longitud entrenada.
- Configuración de contexto en llama.cpp: `-c` es un pool compartido entre slots; con el valor por defecto de 4 slots, un ajuste de 262.144 deja 65.536 tokens por petición y los episodios largos fallan con «Context size has been exceeded» aunque el log indique 262k. Es obligatorio usar `--parallel 1` o dimensionar el pool como N x por slot.
- Los resultados de benchmark proceden de solo 10 instancias de SWE-bench Lite (dev), una muestra muy pequeña; no deben extrapolarse como garantía de rendimiento general.
- Solo 2 de 10 episodios fueron enviados (submitted), lo que refleja el diseño de exploración sin edición y limita la comparación con métricas de resolución de SWE-bench.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir rutas o referencias inexistentes durante la exploración.
- Idiomas soportados: no disponibles; la model card está en inglés y no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento, no detalladas en la información disponible.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-explore-GGUF
- Modelo base: https://huggingface.co/theatechcorporation/amaara-code-explore
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
