# TheFatBlue/code-backdoor-f26-pilot-w2

## Resumen

`TheFatBlue/code-backdoor-f26-pilot-w2` es un ajuste fino de `Salesforce/codet5-base` publicado por el usuario TheFatBlue en HuggingFace. El modelo se ha entrenado sobre el conjunto Window 2 (`train.csv`) de la competicion Code Backdoor Detection, enmarcada en el curso CSC 591/791 (Trustworthy AI for Software Engineering) de NC State University, otono de 2026. La tarea consistia precisamente en detectar filas envenenadas dentro de un dataset de entrenamiento, por lo que se trata de una herramienta de investigacion acotada a ese contexto docente.

Arquitecturalmente es un transformer encoder-decoder de tipo T5 adaptado a codigo (CodeT5), con 222.882.048 parametros y pesos en safetensors. El modelo se distribuye con la etiqueta de pipeline `summarization` y su uso previsto es la generacion de resumenes o etiquetas sobre fragmentos de codigo, con decodificacion greedy y un maximo de 64 tokens nuevos reproduciendo el fichero `outputs_train.csv` liberado por el autor.

Su relevancia es limitada: se trata de un artefacto de competicion con 0 descargas y 0 likes en el momento de redactar esta ficha, sin benchmarks publicados ni idiomas declarados. Resulta interesante como caso de estudio de modelos pequenos (aproximadamente 850 MB en fp32) ajustados para tareas de seguridad del software y ejecutables en CPU de portatil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (CodeT5, base) |
| Parametros totales | 222.882.048 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como especificacion oficial; el ejemplo de la model card trunca la entrada a 512 tokens |
| Tipos de cuantizacion | no disponible (el autor indica que distribuye y evalua en fp32, aproximadamente 850 MB) |
| Idiomas soportados | no disponible; el dataset de la competicion es codigo y el ejemplo de la model card usa Python |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0.9 GB |
| Modelo base | Salesforce/codet5-base |
| Pipeline declarado | summarization |
| Fecha de creacion | 2026-10-14 |

## Arquitectura y entrenamiento

El modelo parte de `Salesforce/codet5-base`, un transformer encoder-decoder con atencion completa y mecanismo de decodificacion autoregresiva, preentrenado originalmente por Salesforce sobre codigo fuente. Sobre esa base, TheFatBlue ha realizado un ajuste fino supervisado con el conjunto Window 2 (`train.csv`) de la competicion Code Backdoor Detection. El autor advierte explicitamente que ese conjunto de entrenamiento contiene filas envenenadas y que localizarlas es la tarea de la competicion, lo que convierte al modelo en un artefacto con posible contaminacion deliberada en sus datos.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la estrategia de optimizacion (learning rate, epochs, schedulers) ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones arquitectonicas propias: el modelo hereda la topologia estandar de CodeT5. El unico detalle operativo documentado es el procedimiento de inferencia: decodificacion greedy con 64 tokens nuevos, en fp32, que reproduce exactamente el fichero `outputs_train.csv` liberado por el autor.

## Capacidades

- Generacion de texto condicionada a codigo fuente, en formato encoder-decoder (secuencia a secuencia).
- Generacion de resumenes o etiquetas sobre fragmentos de codigo, segun la etiqueta de pipeline `summarization`.
- Reproducibilidad determinista de las salidas de entrenamiento mediante decodificacion greedy con 64 tokens nuevos.
- Procesamiento de fragmentos de codigo en Python, a partir del ejemplo incluido en la model card.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas naturales soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Analisis de envenenamiento de datos: el modelo se puede emplear como referencia para estudiar como un ajuste fino sobre un dataset contaminado traslada ese sesgo a las salidas, comparando sus respuestas con las de un modelo equivalente entrenado solo con datos limpios.
- Auditoria de pipelines de datos de entrenamiento: dado que reproduce `outputs_train.csv` de forma determinista, sirve para verificar la integridad de un pipeline de preparacion de datos y detectar divergencias entre ejecuciones.
- Reproduccion de experimentos academicos: en el contexto de CSC 591/791, permite a estudiantes reproducir la linea base de la competicion sin reentrenar, ya que el modelo ocupa 0.9 GB y funciona en CPU.
- Investigacion sobre seguridad del software: util como sujeto de prueba en estudios sobre backdoors en modelos de codigo, midiendo como se manifiestan en tareas de resumen de funciones.
- Docencia en IA fiable: ejemplo practico y ligero para ilustrar riesgos de contaminacion de datos en un aula, con coste de ejecucion minimo (aproximadamente 0,5 s por funcion en CPU de portatil).
- Generacion de resumenes de funciones Python en entornos con recursos muy limitados: al ser un modelo de unos 850 MB en fp32, puede ejecutarse en portatiles sin GPU para prototipos de documentacion automatica, siempre que se asuma su origen experimental.
- Pruebas de regresion de infraestructura de inferencia: su salida determinista con decodificacion greedy permite usarlo como caso de prueba fijo para validar versiones de `transformers`, kernels o configuraciones de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica operativa documentada por el autor es de rendimiento de inferencia: en fp32 ocupa aproximadamente 850 MB y tarda alrededor de 0,5 segundos por funcion en la CPU de un portatil, con un tiempo de "minutos" para el conjunto completo en una GPU gratuita de Colab.

## Requisitos de hardware

- VRAM estimada en fp32 (precision documentada): aproximadamente 0,9 GB solo de pesos, mas activaciones; alrededor de 1,5-2 GB en total para inferencia con lotes pequenos.
- VRAM estimada en fp16/bf16: aproximadamente 0,45 GB de pesos.
- VRAM estimada en int8: aproximadamente 0,22 GB de pesos.
- VRAM estimada en int4: aproximadamente 0,11 GB de pesos, aunque no se documentan cuantizaciones oficiales ni su equivalencia funcional con la salida en fp32.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090 sobradamente). En el extremo profesional, A100 o H100 solo tendrian sentido para procesar grandes volumenes en paralelo.
- Caben en GPU consumer: si, en practicamente todas las tarjetas modernas, e incluso en CPU sin acelerador.
- Opciones de despliegue: la model card solo documenta `transformers` con `AutoModelForSeq2SeqLM` y `AutoTokenizer`. El soporte de vLLM, llama.cpp, Ollama o TGI no esta documentado; dado el formato safetensors en fp32, los servidores compatibles con modelos T5 de HuggingFace podrian funcionar, pero no hay confirmacion del autor.
- Latencia y throughput: aproximadamente 0,5 s por funcion en CPU de portatil; tiempos del orden de minutos para el conjunto completo en una GPU gratuita de Colab. No se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TheFatBlue/code-backdoor-f26-pilot-w2 | 222.882.048 | no disponible (ejemplo con truncado a 512) | bsd-3-clause | HuggingFace, 0 descargas | Ajuste fino de competicion; dataset con filas envenenadas |
| Salesforce/codet5-base | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace (modelo base) | Base declarada por el autor |
| Otros modelos de resumen de codigo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos |

No se dispone de informacion suficiente para comparar rendimiento, contexto o licencia frente a alternativas contemporaneas de la misma categoria.

## Limitaciones y advertencias

- Contaminacion conocida del dataset: el autor indica que el conjunto de entrenamiento contiene filas envenenadas; es previsible que el modelo herede comportamientos anomalos o sesgos derivados de esa contaminacion.
- Uso restringido: la propia model card especifica "use only within the competition", por lo que su uso en produccion queda fuera del proposito declarado del autor.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad de los resumenes generados, por lo que no hay garantias de que las etiquetas o resumenes se correspondan con el codigo de entrada.
- Sin benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de ninguna metrica de resumen (ROUGE, BLEU), lo que impide evaluar su calidad de forma objetiva.
- Idiomas: no se declaran idiomas soportados, ni naturales ni de programacion, mas alla del uso de Python en el ejemplo.
- Divergencia en el identificador: la model card usa `TheFatBlue/code-backdoor-f26-w2` en el codigo de ejemplo, mientras que el ID del repositorio es `code-backdoor-f26-pilot-w2`; conviene verificar cual es la ruta operativa antes de integrarlo.
- Salida determinista solo bajo condiciones concretas: la reproduccion de `outputs_train.csv` depende de usar decodificacion greedy con 64 tokens nuevos y fp32; otros ajustes de generacion o cuantizaciones pueden alterar los resultados.
- Adopcion nula: 0 descargas y 0 likes, sin issues ni comunidad que valide el artefacto.
- Licencia: bsd-3-clause permite uso comercial con condiciones de atribucion y mantiene exenciones de responsabilidad, pero el propio autor limita el uso al ambito de la competicion, lo que crea una tension entre la licencia legal y la recomendacion de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheFatBlue/code-backdoor-f26-pilot-w2
- Modelo base: https://huggingface.co/Salesforce/codet5-base
- No se han encontrado otros enlaces relevantes (paper, repositorio, demo o blog) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
