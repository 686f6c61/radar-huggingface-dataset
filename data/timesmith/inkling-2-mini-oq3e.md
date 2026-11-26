# timesmith/Inkling-2-Mini-oQ3e

## Resumen

Inkling-2-Mini-oQ3e es una version cuantizada del modelo multimodal Inkling-2-Mini, publicada por el usuario timesmith en Hugging Face. Se trata de un checkpoint de aproximadamente 26.400 millones de parametros en el modulo de lenguaje (26.388.641.280 segun los pesos reales en safetensors) mas unos 318 millones adicionales en el modulo de vision, lo que da un total de en torno a 26.700 millones de parametros logicos. El modelo original no esta documentado en la informacion disponible; lo que si se conoce es el proceso de cuantizacion aplicado.

La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.8.3), que aplica precision mixta por tensor: la mayor parte de los pesos (91,6 %) queda en 3 bits afines con grupo de 64, mientras que una fraccion pequena se conserva en 6, 8 bits, BF16 o FP32 para preservar capas sensibles. El resultado es un checkpoint de 13,7 GB con un promedio efectivo de 4,096 bits por peso, pensado para ejecutarse con la libreria MLX de Apple (chip Apple Silicon).

Su relevancia es doble: por un lado demuestra una estrategia de cuantizacion mixta agresiva que reduce un modelo de ~26.700 millones de parametros a poco mas de 12,7 GiB de almacenamiento; por otro, al estar en formato MLX, apunta a inferencia local en Macs con memoria unificada. La ficha se limita a lo verificable en la informacion proporcionada; los datos sobre arquitectura, entrenamiento y benchmarks del modelo base no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `inkling2_loop` sugiere un transformer con algun tipo de bucle o recurrencia, sin confirmar) |
| Parametros totales | 26.388.641.280 en el modulo de lenguaje; 26.707 millones logicos incluyendo vision (0.318B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3-bit (grupo 64), 6-bit, 8-bit, BF16 y FP32; promedio efectivo 4,096 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base Inkling-2-Mini: no se especifica si es un transformer denso, un MoE, un modelo hibrido con atencion lineal o un esquema recurrente. El tag `inkling2_loop` en el repositorio sugiere alguna forma de procesamiento en bucle o recurrente, pero no se confirma en la model card. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Lo que si esta documentado es el proceso de cuantizacion post-entrenamiento. Se aplico oQ (oMLX v0.8.3) con precision mixta: 24.461B de pesos logicos (91,592 %) se almacenan en affine 3-bit con grupo de 64, lo que ocupa 9,967 GiB; 0,463B en 6-bit (0,350 GiB); 1,109B en 8-bit (1,098 GiB); 0,637B en BF16 (1,187 GiB) y 0,036B en FP32 (0,133 GiB). En total, 26.707B de pesos logicos ocupan 12,735 GiB, es decir, 13.674 GB en disco. El modulo de lenguaje consume 13,037 GB (12,142 GiB) y el de vision 0,637 GB (0,593 GiB). La innovacion tecnica destacable es precisamente esta distribucion no uniforme de bits, que reserva mayor precision a una minoria de tensores para mitigar la degradacion tipica de la cuantizacion a 3 bits.

## Capacidades

- Generacion de texto y modelado de lenguaje: el modulo principal de 26,4B parametros esta orientado a tareas generativas.
- Procesamiento de vision: incorpora un modulo visual de 0,318B parametros, por lo que el modelo base es multimodal (entrada de imagenes), aunque no se detallan las tareas concretas soportadas.
- Razonamiento y codigo: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo de razonamiento explicito (thinking), audio u otras modalidades: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamano de 13,7 GB permiten cargar el modelo en Macs con memoria unificada de 16 GB o mas, lo que habilita prototipado y uso personal sin GPU dedicada. Es el caso de uso mas directo y verificable.
- Procesamiento de imagenes con descripcion textual: al incluir un modulo de vision, puede emplearse para tareas de image-to-text en local, como subtitulado o descripcion de capturas, siempre que se valide su calidad real.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia practica para comparar el impacto de la cuantizacion mixta a 3-4 bits frente al modelo original en tareas de generacion.
- Asistentes conversacionales de escritorio: integrable en aplicaciones macOS mediante MLX para generar respuestas de texto en local, con la ventaja de no enviar datos a servicios externos.
- Investigacion sobre eficiencia de memoria: util para estudiar como se distribuye el error de cuantizacion entre capas en modelos de ~26B y para disenar esquemas de precision mixta alternativos.
- Despliegue en entornos con memoria limitada: con 12,7 GiB de pesos, cabe en estaciones de trabajo con 16-24 GB de memoria unificada, lo que permite ejecutar un modelo de 26B donde un checkpoint en BF16 (unos 53 GB) no cabria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 12,7 GiB; con cache KV y overhead de ejecucion conviene disponer de al menos 16 GB de memoria unificada, y 24 GB o mas para contextos largos.
- GPU recomendadas: al ser un checkpoint MLX, el hardware objetivo son chips Apple Silicon (series M1, M2, M3 y M4, preferiblemente con 16 GB o mas de memoria unificada). No se documenta soporte para CUDA.
- GPU de consumo: no aplica en el sentido habitual (RTX 4090, etc.) porque el formato es MLX; en Mac, un M2 Pro o superior con 16-32 GB es el escenario razonable.
- Opciones de despliegue: MLX (libreria declarada) y, en su caso, oMLX. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato safetensors cuantizado con esquema affine de oQ no es directamente portable a esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, un checkpoint de ~26,7B parametros en BF16 ocuparia en torno a 53 GB, frente a los 13,7 GB de esta version cuantizada, pero no se dispone de alternativas documentadas de la misma familia o tamano en el material facilitado.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso, lo que impide confirmar si se permite uso comercial. Es un riesgo relevante para produccion.
- Idiomas no declarados: no se puede garantizar cobertura multilingue ni el comportamiento en castellano.
- Al ser una cuantizacion a 3 bits mayoritaria, es esperable cierta degradacion de calidad respecto al modelo original, especialmente en tareas sensibles a precision (matematicas, codigo, razonamiento largo). No se aportan metricas que cuantifiquen esta perdida.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas que lo acoten.
- Sesgos: no documentados.
- Contexto maximo: no disponible, lo que limita la planificacion de despliegues con ventanas largas.
- Portabilidad: el checkpoint esta atado a MLX; no se garantiza su uso en otros motores de inferencia.
- Repositorio sin descargas ni likes en el momento de la consulta, y creado y actualizado en el mismo minuto, lo que sugiere una publicacion reciente y sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timesmith/Inkling-2-Mini-oQ3e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
