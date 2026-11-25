# vorisml/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan

## Resumen

El modelo `vorisml/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan` es un clasificador de audio basado en la arquitectura Audio Spectrogram Transformer (AST). Se trata de un ajuste fino del modelo `MIT/ast-finetuned-audioset-10-10-0.4593` sobre el conjunto de datos GTZAN, un corpus de referencia para la clasificación de generos musicales compuesto por 1.000 fragmentos de audio de 30 segundos distribuidos en diez generos (blues, clasica, country, disco, hip-hop, jazz, metal, pop, reggae y rock). Lo desarrolla el usuario vorisml y se publica bajo licencia BSD-3-Clause.

El modelo resuelve una tarea concreta de clasificacion de audio: asignar un genero musical a un fragmento sonoro. Con 86,2 millones de parametros, es un modelo compacto que puede ejecutarse en hardware modesto, lo que lo hace util para prototipado rapido, experimentos academicos y pipelines de etiquetado musical. Su relevancia radica en que parte de un backbone preentrenado en AudioSet (un dataset masivo y diverso) y lo especializa en un dominio acotado, logrando un 90 % de exactitud declarada en el conjunto de evaluacion de GTZAN.

No es un modelo generativo ni un modelo de lenguaje: es un clasificador discriminativo de audio. Por tanto, no admite prompting, tool calling ni razonamiento multi-paso. Su valor esta en la inferencia rapida y determinista sobre espectrogramas de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST) |
| Parametros totales | 86.196.490 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio fija, tipicamente espectrograma de ~10 s en AST) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de PyTorch si se aplica externamente) |
| Idiomas soportados | no disponible (modelo de audio, no linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Audio Spectrogram Transformer: un transformer tipo ViT que opera sobre parches de un espectrograma mel en lugar de sobre parches de imagen. El backbone original `MIT/ast-finetuned-audioset-10-10-0.4593` fue preentrenado en AudioSet, un corpus de millones de clips de audio etiquetados con 527 clases de eventos sonoros. Sobre esa base, este modelo se ajusta fino para la tarea de diez clases de genero musical de GTZAN.

El ajuste fino se realizo con los siguientes hiperparametros declarados en la model card: learning rate de 3e-5, batch de entrenamiento de 8 con acumulacion de gradientes de 2 (batch efectivo de 16), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 50 pasos de calentamiento, 10 epocas, semilla 42 y precision mixta nativa (AMP). El entrenamiento se ejecuto con Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. La perdida de validacion final fue de 0,3818 y la exactitud de 0,90. No se documenta el numero de tokens ni la composicion exacta del dataset mas alla de GTZAN, ni si hubo RLHF o DPO (no aplica, al ser un clasificador).

## Capacidades

- Clasificacion de audio en diez generos musicales: blues, clasica, country, disco, hip-hop, jazz, metal, pop, reggae y rock.
- Extraccion de representaciones de audio a partir de espectrogramas mel mediante un transformer.
- Inferencia discriminativa de una sola pasada, sin generacion de texto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en sentido linguistico; opera sobre senal de audio.
- No dispone de modo thinking, vision ni audio generativo.
- Compatible con la pipeline `audio-classification` de Transformers y con endpoints de Hugging Face.

## Casos de uso

- Etiquetado automatico de bibliotecas musicales: dado un catalogo de pistas, el modelo asigna un genero a cada una para organizar colecciones, generar metadatos o alimentar sistemas de recomendacion. Su tamano compacto permite procesar lotes grandes en CPU o GPU modesta.
- Clasificacion en tiempo casi real de emisiones de radio: integrado en un pipeline que segmenta el audio en ventanas y llama al modelo, se puede etiquetar el genero dominante de cada bloque para monitorizacion de emisoras o analisis de programacion.
- Filtrado y curaduria de datasets musicales: en proyectos de investigacion que necesitan separar corpus por genero antes de entrenar otros modelos, este clasificador sirve como herramienta de preetiquetado con una exactitud declarada del 90 %.
- Prototipado de aplicaciones de descubrimiento musical: desarrolladores que construyen demos de recomendacion o busqueda por genero pueden usar el modelo como componente inicial sin necesidad de entrenar desde cero.
- Docencia y experimentacion en MIR (Music Information Retrieval): sirve como ejemplo reproducible de ajuste fino de AST sobre GTZAN, con hiperparametros y curvas de entrenamiento documentados.
- Moderacion o analisis de contenido sonoro: clasificar el genero de clips subidos por usuarios para aplicar reglas de negocio (por ejemplo, limitar cierto tipo de contenido musical en una plataforma).
- Baseline en competiciones o estudios comparativos: al ser un ajuste fino estandar sobre GTZAN, sirve como referencia frente a arquitecturas mas recientes (CNN, modelos auto-supervisados como wav2vec o HuBERT).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Audio Classification | GTZAN (marsyas/gtzan) | Accuracy | 0,90 |
| Audio Classification | GTZAN (validacion) | Loss | 0,3818 |

Evolucion del entrenamiento declarada (extracto):

| Epoca | Training Loss | Validation Loss | Accuracy |
|---|---|---|---|
| 1 | 0,6898 | 0,6168 | 0,83 |
| 5 | 0,0443 | 0,4707 | 0,87 |
| 7 | 0,0007 | 0,3505 | 0,92 |
| 10 | 0,0005 | 0,3818 | 0,90 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican; para audio no se aportan comparaciones con wav2vec, HuBERT o CNN sobre GTZAN).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,35 GB solo para pesos (86,2 M de parametros x 4 bytes); con activaciones y buffers de espectrograma, un entorno de 1-2 GB es suficiente.
- En FP16/BF16: aproximadamente 0,17 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo no aprovecha GPUs de gran capacidad por su tamano reducido.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: pipeline `audio-classification` de Transformers, TorchScript/ONNX para exportacion, endpoints de Hugging Face (tag `endpoints_compatible`), FastAPI o Flask envolviendo el pipeline.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera inferencia en decenas de milisegundos por clip en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vorisml/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan | 86,2 M | espectrograma de audio | 0,90 accuracy en GTZAN (declarado) | BSD-3-Clause | Hugging Face |
| MIT/ast-finetuned-audioset-10-10-0.4593 (base) | ~86 M | espectrograma de audio | preentrenado en AudioSet, no especifico de GTZAN | BSD-3-Clause (segun modelo base) | Hugging Face |
| Modelos wav2vec 2.0 / HuBERT ajustados a GTZAN | variable (decenas a cientos de M) | audio crudo | no disponible en esta ficha | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada. La comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo solo clasifica diez generos musicales; cualquier audio fuera de ese conjunto se asignara a una de esas diez clases, generando falsos positivos.
- GTZAN es un dataset pequeno (1.000 clips) y con problemas conocidos de duplicados y etiquetas ruidosas; la exactitud del 90 % debe interpretarse con cautela y no como rendimiento en produccion sobre audio real diverso.
- Riesgo de sobreajuste: la perdida de entrenamiento cae a 0,0005 mientras la de validacion se estanca en torno a 0,35-0,38, lo que sugiere sobreajuste a partir de la epoca 7.
- No hay informacion sobre sesgos por genero, artista, origen geografico o calidad de grabacion.
- El modelo no es generativo: no produce texto, etiquetas explicativas ni probabilidades calibradas de forma documentada.
- La licencia BSD-3-Clause permite uso comercial con atribucion y sin endoso; conviene revisar tambien la licencia del modelo base y del dataset GTZAN.
- No se documentan limitaciones de contexto ni de idioma porque no aplican a un clasificador de audio, pero si se debe tener en cuenta la ventana de audio fija de AST (tipicamente ~10 s) y el preprocesado de espectrograma requerido.
- La model card indica explicitamente "More information needed" en descripcion, usos previstos y datos de entrenamiento, por lo que la documentacion es incompleta.
- No se han verificado de forma independiente los resultados declarados (metrica `verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vorisml/ast-finetuned-audioset-10-10-0.4593-finetuned-gtzan
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Dataset GTZAN en Hugging Face: https://huggingface.co/datasets/marsyas/gtzan
- Paper original de AST (Audio Spectrogram Transformer): no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
