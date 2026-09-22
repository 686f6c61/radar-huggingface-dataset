# WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_LoRA_llama-3.2

## Resumen

El repositorio WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_LoRA_llama-3.2 contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base meta-llama/Llama-3.2-3B. No es un modelo completo ni un ajuste de pesos fusionado: es un conjunto de matrices de bajo rango que deben cargarse junto al modelo base mediante la libreria `peft`. El nombre del repositorio sugiere que el ajuste se ha realizado sobre el corpus XNLI (inferencia de lenguaje natural, con las etiquetas entailment/neutral/contradiction) en ingles e hindi, con 5000 ejemplos, un "percentage 1" (probablemente un 1 % del conjunto) y 120 (probablemente pasos de entrenamiento). Estos extremos no estan confirmados en la model card, que se ha publicado como plantilla vacia.

El interes del artefacto es fundamentalmente experimental: se trata de un adaptador pequeno (0,3 GB en disco) que permite estudiar transferencia cross-lingual (ingles-hindi) con un presupuesto de computo minimo, o reutilizar el modelo base en tareas de deteccion de contradicciones y verificacion de coherencia. Al estar construido sobre Llama 3.2 3B, hereda su ventana de contexto de 128 000 tokens y su tokenizador, aunque la tarea para la que fue ajustado (XNLI) trabaja con pares de frases cortas.

La relevancia practica esta limitada por la ausencia total de informacion de evaluacion: la model card es la plantilla por defecto de HuggingFace sin rellenar, el repositorio registra 0 descargas y 0 likes, no se declara licencia y no hay resultados de benchmarks. Debe tratarse, por tanto, como un adaptador no validado que requiere evaluacion propia antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA de PEFT; el adaptador no altera la arquitectura base |
| Parametros totales | 3,21 mil millones en el modelo base; no disponible el desglose de parametros entrenables del adaptador |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base; no disponible para el adaptador (los pares de XNLI son cortos) |
| Tipos de cuantizacion | no disponible en el repositorio (se distribuye en safetensors sin cuantizar; la cuantizacion depende del modelo base) |
| Idiomas soportados | El nombre del repositorio indica entrenamiento sobre XNLI en ingles e hindi; el modelo base declara soporte para 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | no disponible (el modelo base esta sujeto a la Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |
| Tamano del repositorio | 0,3 GB |
| Libreria | peft (entrenado con PEFT 0.17.1) |
| Pipeline declarado | text-generation |
| Modelo base | meta-llama/Llama-3.2-3B |
| Fecha de creacion registrada | 2026-09-21 |

## Arquitectura y entrenamiento

El adaptador se apoya en Llama 3.2 3B, un transformer decoder-only autorregresivo de 3,21 mil millones de parametros con grouped-query attention, RoPE y embeddings de entrada/salida compartidos (tied embeddings). El modelo base, publicado por Meta, esta entrenado sobre un corpus de hasta 9 billones de tokens con datos multimodales y de texto, un cutoff de conocimiento de diciembre de 2023, y pasa por fases de ajuste supervisado y optimizacion por preferencias humanas (RLHF con DPO). Sobre esa base, este repositorio aplica un adaptador LoRA: se congelan los pesos originales y se entrenan matrices de bajo rango en determinadas proyecciones lineales, lo que reduce drasticamente el numero de parametros actualizados y el espacio en disco (0,3 GB frente a los aproximadamente 6,5 GB del modelo completo en precision de 16 bits).

La informacion de entrenamiento publicada es practicamente nula: la model card es la plantilla estandar de HuggingFace con todos los campos marcados como "[More Information Needed]". Todo lo que puede inferirse procede del identificador del repositorio: corpus XNLI (inferencia de lenguaje natural, derivado de MultiNLI y traducido a 15 idiomas), idiomas ingles e hindi, 5000 ejemplos, un factor "percentage 1" y 120 (probablemente pasos o iteraciones). No se especifican hiperparametros (rank, alpha, dropout, learning rate, scheduler, precision), ni la composicion exacta del dataset, ni si se aplico validacion cruzada o particion de test. El tag `arxiv:1910.09700` corresponde a la referencia generica del calculador de impacto de carbono de Lacoste et al. (2019) que incluye la plantilla, no a un articulo sobre este modelo.

## Capacidades

- Modelo base capaz de generacion de texto autoregresiva, razonamiento basico, codigo y matematicas elementales, segun lo declarado por Meta para Llama 3.2 3B.
- Adaptador orientado, segun el nombre del repositorio, a inferencia de lenguaje natural (XNLI): clasificar un par premisa-hipotesis en entailment, neutral o contradiction.
- Entrenamiento bilingue ingles-hindi segun la nomenclatura del repositorio, lo que sugiere algun grado de transferencia cross-lingual.
- Soporte de tool calling, agentes y multi-step reasoning: no disponible de forma especifica para el adaptador; el modelo base dispone de plantillas de chat y soporte de herramientas, pero el ajuste LoRA puede degradar esas capacidades.
- Capacidades multilingues: limitadas a ingles e hindi en el ajuste; el modelo base declara 8 idiomas oficiales, con rendimiento desigual.
- Capacidad especial de thinking mode, vision o audio: no disponible (el adaptador no anade ninguna modalidad; Llama 3.2 3B es un modelo solo texto).
- Al ser un adaptador PEFT, permite intercambio en caliente de adaptadores y servir multiples variantes sobre un mismo modelo base en VRAM.

## Casos de uso

- Deteccion de contradicciones en respuestas de modelos: dado un contexto y una respuesta generada, el adaptador puede clasificar si la respuesta contradice el contexto, lo que sirve como filtro de alucinaciones en pipelines de generacion aumentada por recuperacion (RAG).
- Verificacion de coherencia en RAG: comprobar que cada afirmacion de la respuesta esta implicada por los fragmentos recuperados, usando el modelo como componente de un verificador en cascada.
- Filtrado y curación de datasets: descartar pares de frases contradictorios o mal alineados en corpus paralelos ingles-hindi antes de usarlos para entrenamiento.
- Experimentacion academica con LoRA y transferencia cross-lingual: el adaptador es un punto de partida barato para estudiar como afectan el porcentaje de datos y el numero de pasos al rendimiento en hindi frente a ingles.
- Evaluacion comparativa de estrategias PEFT: al compartir modelo base con otros adaptadores (rank, alpha, capas objetivo distintos), permite montar experimentos controlados de ablacion sobre una misma GPU.
- Moderacion y comprobacion de afirmaciones en ingles y hindi: clasificar si un mensaje contradice una politica o una fuente de referencia en entornos bilingues.
- Anotacion asistida en investigacion linguistica: preetiquetar pares de frases en hindi con las tres clases de XNLI para reducir el trabajo de anotacion humana (siempre con revision posterior).
- No se recomienda su uso directo como chatbot de proposito general ni como generador de codigo en produccion, ya que el ajuste esta orientado a una tarea de clasificacion y no hay evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion completada, el repositorio no declara metricas y no se han encontrado evaluaciones externas. Cualquier cifra de precision, F1 o accuracy para este adaptador tendria que obtenerse ejecutandolo contra la particion de test de XNLI (o contra un conjunto propio en ingles e hindi).

## Requisitos de hardware

- VRAM para el modelo base en precision de 16 bits (bf16/fp16): aproximadamente 6,5 GB de pesos mas overhead de activaciones, en torno a 8-10 GB para secuencias cortas.
- VRAM en cuantizacion de 8 bits: aproximadamente 3,5-4 GB.
- VRAM en cuantizacion de 4 bits (NF4, GPTQ o AWQ): aproximadamente 2-2,5 GB, suficiente para GPUs consumer de 8 GB con contexto corto.
- Adaptador LoRA: menos de 0,5 GB adicionales en disco y un consumo de VRAM marginal durante la inferencia.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3090, RTX 4090 y L4 para uso en una sola GPU; A100 40/80 GB o H100 solo si se sirve en paralelo con muchos adaptadores o con contextos largos.
- Cabe en GPU consumer: si, con cuantizacion de 4 u 8 bits en tarjetas de 8-16 GB.
- Opciones de despliegue: `transformers` + `peft` (la ruta natural para este repositorio), vLLM con soporte de adaptadores LoRA para servir varias variantes sobre el mismo modelo base, TGI y, si se fusionan los pesos con `merge_and_unload()` y se convierten a GGUF, llama.cpp u Ollama. El repositorio no incluye pesos GGUF.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Idiomas de la tarea | Licencia | Disponibilidad | Evaluacion publicada |
|---|---|---|---|---|---|---|
| Este adaptador (xnli_en_and_hi...LoRA_llama-3.2) | 3,21 mil millones (base) + adaptador LoRA | Ajuste LoRA para NLI | Ingles e hindi (segun nombre) | no disponible | 0 descargas, 0 likes | no disponible |
| Llama-3.2-3B completo (sin adaptar) | 3,21 mil millones | Modelo generativo generalista | 8 idiomas oficiales | Llama 3.2 Community License | Ampliamente distribuido | Si, publicado por Meta |
| Ajuste completo de Llama-3.2-3B sobre XNLI | 3,21 mil millones | Fine-tuning total | Segun dataset | Heredada del modelo base | No disponible como referencia publica de este autor | no disponible |
| Clasificadores discriminativos tipo XLM-R large o mDeBERTa ajustados sobre XNLI | Del orden de cientos de millones | Clasificacion con cabeza de secuencia | Multilingue (15 idiomas en XNLI) | Segun modelo (MIT para XLM-R; MIT para mDeBERTa) | Amplia | Si, resultados publicados en la literatura |

No se dispone de datos cuantitativos comparativos para el adaptador. Los clasificadores discriminativos como XLM-R o mDeBERTa son, en la practica, la referencia habitual para XNLI y suelen superar a un decoder generativo de 3B en coste y latencia por ejemplo; este adaptador solo tiene sentido si se busca reutilizar infraestructura de Llama o experimentar con PEFT.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, metodologia de evaluacion ni limitaciones declaradas por el autor.
- Sin evaluacion: no existe ninguna metrica publicada de accuracy o F1 en XNLI, por lo que se desconoce si el ajuste converge o si el adaptador aporta alguna mejora sobre el modelo base.
- Sesgos: no documentados. Hereda los sesgos del corpus de preentrenamiento de Llama 3.2 y de los datos de XNLI, con posible infrarrepresentacion del hindi y sesgos culturales del MultiNLI original en ingles.
- Riesgo de alucinacion: el modelo subyacente es un decoder generativo; si se usa fuera de la tarea de clasificacion, puede generar texto plausible pero incorrecto.
- Limitaciones de idioma: el ajuste declarado cubre solo ingles e hindi; no hay evidencia de buen rendimiento en castellano ni en el resto de idiomas soportados por el modelo base.
- Licencia: el repositorio no declara licencia. Ademas, el uso comercial esta condicionado por la Llama 3.2 Community License del modelo base, que impone obligaciones de atribucion, limite de 700 millones de usuarios mensuales y restricciones de uso aceptable.
- Uso en produccion: desaconsejado sin una evaluacion propia previa, dado el estado vacio de la documentacion y la ausencia de usuarios o validacion de la comunidad.
- Formato: el repositorio contiene solo el adaptador; es necesario descargar el modelo base por separado, lo que duplica el espacio en disco y anade una dependencia externa.
- Inconsistencia de fechas: la fecha de creacion registrada (2026-09-21) es posterior a la de la ultima actualizacion indicada, lo que sugiere un error de metadatos en el repositorio.
- Busqueda web sin resultados utiles: los resultados devueltos corresponden a registros mercantiles alemanes sin ninguna relacion con el modelo, por lo que no aportan informacion verificable.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_LoRA_llama-3.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Referencia citada en la plantilla (calculador de impacto de carbono): https://arxiv.org/abs/1910.09700
- Dataset XNLI (mencionado indirectamente por el nombre del repositorio; no enlazado en la model card): no disponible en la informacion proporcionada
- Paper, blog, repositorio o demo adicionales del autor: no disponible en la informacion proporcionada
