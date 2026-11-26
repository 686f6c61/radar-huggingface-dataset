# stefan-it/zeitunks-lm-v1-ner-newseye-de

## Resumen

Zeitunks-LM fine-tuned on NewsEye es un modelo de reconocimiento de entidades nombradas (NER) para aleman historico, desarrollado por Stefan Schweter (stefan-it). Se construye sobre el encoder BiXL-Kron (`stefan-it/zeitunks-lm-v1`), un transformer bidireccional basado en KronLSTM preentrenado con periodicos alemanes historicos, y se afina sobre la parte alemana del corpus NewsEye redistribuido en HIPE-2022, que cubre prensa austriaca de las decadas de 1850 a 1950.

La relevancia del modelo reside en su naturaleza libre de atencion y de embeddings posicionales: emplea capas KronLSTM (una variante de xLSTM) en lugar de self-attention, lo que reduce el coste cuadratico en secuencias largas y encaja con el ruido tipico del OCR historico. Con 96.941.129 parametros y una ventana de 512 piezas por fragmento, esta pensado para procesar texto historico con entidades de tipo persona, organizacion, localizacion y produccion humana (`HumanProd`).

El checkpoint es un artefacto de investigacion: un unico seed seleccionado por F1 de desarrollo, con un rendimiento en test (36,52 F1) notablemente inferior a la media de los diez seeds del mismo learning rate (45,42 ± 4,29), lo que refleja la debilidad del conjunto de desarrollo como guia. Es adecuado para experimentacion y para pipelines de humanidades digitales, no para produccion critica sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiXL-Kron: encoder bidireccional KronLSTM, sin atencion ni embeddings posicionales |
| Parametros totales | 96.941.129 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 piezas por fragmento (las secuencias mayores se dividen y se recombinan) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` y kernels KronLSTM) |

## Arquitectura y entrenamiento

El encoder base es un BiXL-Kron, un modelo bidireccional construido con capas KronLSTM del ecosistema xLSTM. No utiliza self-attention ni embeddings posicionales; la informacion de orden la aporta la recurrencia de las capas KronLSTM. La cabeza de clasificacion de tokens consiste en una LayerNorm, dropout de 0,1 y una capa lineal aplicada sobre la primera pieza de cada palabra (pooling `first`), lo que produce una etiqueta por palabra en esquema IOB2 con 9 etiquetas (`O`, `LOC`, `ORG`, `PER`, `HumanProd` y sus variantes B/I).

El ajuste fino se realizo sobre la parte alemana de NewsEye (HIPE-2022): 20.840 frases y 367.336 tokens en entrenamiento, 1.111 frases y 38.930 tokens en desarrollo, y 3.337 frases y 97.840 tokens en test. Se uso AdamW con weight decay 0,0, learning rate 1e-5 seleccionado mediante una rejilla de ocho valores evaluada con diez seeds cada uno, warmup lineal del 10 % de los pasos seguido de decaimiento lineal, batch de 16 frases, 10 epocas con seleccion por mejor F1 de desarrollo (epoca 2 en este checkpoint), clipping de gradiente de 1,0, dropout de encoder de 0,1 y autocast en bf16. El entrenamiento fue determinista: la repeticion con guardado produjo predicciones identicas byte a byte.

## Capacidades

- Reconocimiento de entidades nombradas en aleman historico con cuatro tipos: `PER`, `LOC`, `ORG` y `HumanProd`.
- Etiquetado a nivel de palabra en IOB2, con agregacion `first` para reproducir el esquema de entrenamiento.
- Procesamiento de texto OCR ruidoso de prensa de los siglos XIX y XX.
- Manejo de frases largas mediante fragmentacion en trozos de 512 piezas y recomposicion posterior.
- Clasificacion de tokens exclusivamente; no genera texto, no razona y no responde a instrucciones.
- Sin soporte de tool calling, function calling ni comportamiento de agente.
- Monolingue: solo aleman.

## Casos de uso

- Extraccion de entidades en corpus de prensa historica digitalizada: el modelo etiqueta personas, lugares y organizaciones en textos OCR de periodicos austriacos de 1850 a 1950, adecuado para proyectos de humanidades digitales que necesitan indexar colecciones masivas.
- Enriquecimiento de archivos periodisticos con metadatos: permite construir indices de nombres propios y lugares para busquedas facetadas en hemerotecas digitales, aprovechando su tolerancia al ruido tipico del OCR historico.
- Investigacion en historia social y biografica: la etiqueta `HumanProd` facilita identificar autores, impresores y productores culturales en anuncios y noticias, un tipo de entidad especifico del corpus NewsEye.
- Evaluacion comparativa de arquitecturas sin atencion: sirve como referencia para estudiar el rendimiento de KronLSTM frente a transformers clasicos en NER historico, con recetas y resultados reproducibles publicados.
- Preprocesado para pipelines de extraccion de relaciones: las entidades detectadas pueden alimentar etapas posteriores de resolucion de entidades o construccion de grafos de conocimiento historicos.
- Prototipado en entornos con recursos limitados: con menos de 100 millones de parametros, el modelo puede ejecutarse en GPU de consumo para experimentos de investigacion, aunque requiere los kernels KronLSTM.

## Benchmarks y rendimiento

F1 micro a nivel de span (IOB2) sobre las particiones oficiales:

| Modelo / configuracion | Dev F1 | Test F1 |
|---|---|---|
| Este checkpoint (seed seleccionado por dev) | 47,56 | 36,52 (P 46,36 / R 30,13) |
| Media ± desviacion de 10 seeds a lr 1e-5 | 41,21 ± 2,88 | 45,42 ± 4,29 |

Rejilla de learning rate (media ± desviacion sobre 10 seeds):

| Learning rate | Dev F1 | Test F1 |
|---|---|---|
| 5e-6 | 40,18 ± 2,77 | 46,97 ± 3,11 |
| 1e-5 (seleccionado) | 41,21 ± 2,88 | 45,42 ± 4,29 |
| 2e-5 | 39,82 ± 1,61 | 46,30 ± 4,50 |
| 3e-5 | 40,48 ± 1,86 | 46,01 ± 4,74 |
| 5e-5 | 40,04 ± 1,10 | 45,11 ± 3,03 |
| 1e-4 | 36,90 ± 1,12 | 41,62 ± 2,67 |
| 2e-4 | 18,69 ± 11,05 | 17,11 ± 11,58 |
| 4e-4 | 0,00 ± 0,00 | 0,00 ± 0,00 |

No se han publicado resultados de benchmarks en la informacion disponible para tareas distintas de NER en NewsEye (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en fp32 para los pesos (96,9 M de parametros); el consumo real depende de los kernels Triton y del tamano de lote, pero cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con soporte CUDA y Triton; una RTX 4090, A100 o H100 son sobredimensionadas para este modelo. En CPU funciona con la implementacion de referencia de KronLSTM, a menor velocidad.
- Cabe en GPU de consumo: si, incluidas GTX 1060 o superiores, siempre que se instale el fork de `flash-linear-attention` con soporte Triton.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification` y `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zeitunks-LM v1 NER NewsEye (este) | 96,9 M | 512 piezas | KronLSTM bidireccional, sin atencion | Apache 2.0 | Hugging Face |
| Encoders de la comparativa BiXL | no disponible | no disponible | Variantes BiXL evaluadas con la misma receta de ajuste fino | no disponible | Repositorio BiXL |
| Modelos NER historicos alemanes de HIPE-2022 | no disponible | no disponible | Principalmente transformers (p. ej. basados en BERT/XLM-R) | variable | Hugging Face / HIPE-2022 |

La comparativa cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada; el autor referencia una comparativa BiXL con la misma pila de ajuste fino (`finetuning/finetune_ner.py`), pero no se incluyen sus cifras.

## Limitaciones y advertencias

- El checkpoint seleccionado por F1 de desarrollo rinde en test muy por debajo de la media de seeds (36,52 frente a 45,42), lo que indica sobreajuste al conjunto de desarrollo y una seleccion poco fiable.
- Los conjuntos de desarrollo y test contienen documentos sin anotar (5 de 12 y 5 de 13 en HIPE-2022 v2.1); cada prediccion en esos documentos cuenta como error, por lo que las cifras subestiman el modelo.
- El F1 absoluto es bajo (entorno al 45 % en test de media), insuficiente para extraccion de entidades de alta precision sin revision humana.
- Riesgo de alucinacion: como clasificador de tokens no genera texto libre, pero puede asignar etiquetas espurias en texto OCR corrupto o fuera del dominio historico.
- Sesgos: entrenado exclusivamente con prensa austriaca de 1850-1950; el vocabulario, la ortografia y las convenciones de nombres de esa epoca no se generalizan a aleman contemporaneo ni a otras variedades regionales.
- Limitacion de contexto: fragmentos de 512 piezas con recomposicion; frases muy largas pueden perder coherencia en los bordes.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de kernels KronLSTM de un fork fijado de `flash-linear-attention` (NX-AI), cuya licencia debe verificarse por separado.
- Requiere `trust_remote_code=True` y ejecucion de codigo remoto, lo que implica riesgos de seguridad en entornos no controlados.
- Dependencia de versiones concretas de `transformers` y del fork de KronLSTM; cambios en esas dependencias pueden romper la reproducibilidad.
- Solo aleman; no soporta otros idiomas ni tareas generativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefan-it/zeitunks-lm-v1-ner-newseye-de
- Modelo base: https://huggingface.co/stefan-it/zeitunks-lm-v1
- Documentacion de NewsEye en HIPE-2022: https://github.com/hipe-eval/HIPE-2022-data/blob/main/documentation/README-newseye.md
- Fork de KronLSTM de NX-AI (flash-linear-attention): https://github.com/NX-AI/KronLSTM
- Repositorio BiXL (receta de ajuste fino `finetuning/finetune_ner.py`): no disponible como URL directa en la informacion proporcionada
