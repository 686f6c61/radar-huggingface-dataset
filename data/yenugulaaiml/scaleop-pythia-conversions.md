# YenugulaAIML/scaleop-pythia-conversions

## Resumen

ScaleOp — Pythia size-conversion checkpoints es una coleccion de artefactos de investigacion publicados por YenugulaAIML (Ravi Satya Durga Prasad Yenugula) como material complementario del articulo "Wiring Beats Blending: What Transfers Between Transformer Sizes — and What Doesn't" (arXiv:2608.02829). No es un modelo listo para produccion ni un asistente: son state_dicts de PyTorch correspondientes a puntos finales de "carreras de recuperacion" con presupuesto equiparado, en las que se parte de un modelo Pythia grande ya preentrenado y se intenta convertirlo en un hermano de menor tamano en lugar de entrenar ese tamano desde cero.

El repositorio cubre dos pares de conversion: Pythia-1.4B hacia 410M (par A) y Pythia-410M hacia 160M (par B). En cada par se comparan seis inicializaciones distintas (desde cero, proyeccion lineal densa, seleccion estructurada por magnitud, seleccion con reescalado que preserva varianza, seleccion con compensacion por minimos cuadrados y la combinacion de compensacion mas reescalado que propone el articulo), manteniendo identicos la forma objetivo, el orden de los datos, el schedule y el presupuesto de tokens. Solo cambian los pesos iniciales.

La relevancia es metodologica: el articulo trata de dilucidar si la informacion aprendida por un transformer grande se transfiere de forma util a uno mas pequeno y que mecanismo de inicializacion lo aprovecha mejor. Los checkpoints estan entrenados entre 30M y 1B tokens adicionales, es decir, entre el 0,01 % y el 0,3 % del preentrenamiento original de Pythia, por lo que sus perplejidades no son competitivas frente a los modelos Pythia oficiales. El repositorio ocupa 57,4 GB y tiene licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPTNeoXForCausalLM, familia GPT-NeoX) |
| Parametros totales | Dos tamanos objetivo: 410M (par A) y 160M (par B); el donante de partida es Pythia-1.4B en el par A y Pythia-410M en el par B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; los checkpoints adoptan la configuracion estandar de la familia Pythia, que usa 2048 tokens |
| Tipos de cuantizacion | No disponible; solo se publican state_dicts de PyTorch sin cuantizar |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | State_dicts de PyTorch (archivos .pt), compatibles con GPTNeoXForCausalLM de transformers |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-NeoX tal y como la implementa EleutherAI en la suite Pythia: transformer decoder-only con atencion causal, rotary embeddings y activacion GeLU, cargado mediante la clase GPTNeoXForCausalLM. Los checkpoints no introducen cambios en el grafo del modelo; cada archivo es un state_dict que debe instanciarse con la configuracion "de stock" del tamano objetivo (EleutherAI/pythia-410m para el par A, EleutherAI/pythia-160m para el par B) y el tokenizador correspondiente del mismo tamano.

El entrenamiento consiste en preentrenamiento continuado sobre un flujo deterministico del dataset pile-uncopyrighted (monology/pile-uncopyrighted), con un corpus de evaluacion congelado de 10.000 secuencias de 128 tokens, protegido contra contaminacion respecto al flujo de entrenamiento. Los presupuestos de tokens son de 30M, 100M y 1B, muy por debajo del preentrenamiento completo de Pythia. La innovacion tecnica no esta en la arquitectura sino en la inicializacion: el metodo del articulo (hybrid_rs) combina seleccion estructurada de pesos del donante, compensacion por minimos cuadrados y un reescalado que preserva la varianza, y se compara de forma controlada contra random, projection, subclone, subclone_rs y hybrid. El par B se ejecuta con tres semillas de muestreo de datos (s0, s1, s2) al presupuesto de 30M tokens, y con una sola semilla a 100M. No se menciona RLHF, DPO ni ningun tipo de ajuste por preferencias.

## Capacidades

- Generacion de texto autoregresiva sin ajuste de instrucciones (base LM) sobre GPTNeoXForCausalLM.
- Modelado de lenguaje y continuacion de texto en ingles con la configuracion estandar de Pythia.
- Servir como punto de partida reproducible para experimentos de compresion de modelos: seleccion estructurada, pruning por magnitud, proyeccion densa y compensacion por minimos cuadrados.
- Permitir comparaciones controladas de inicializacion manteniendo fijos forma objetivo, orden de datos, schedule y presupuesto de tokens.
- Soporte de tool calling / function calling: no disponible (no hay ajuste de instrucciones ni plantillas de chat).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales: no hay modo "thinking", vision ni audio. El unico valor anadido es la reproducibilidad del protocolo experimental y las semillas multiples del par B.

## Casos de uso

- Investigacion sobre transferencia de conocimiento entre tamanos: cargar el state_dict hybrid_rs_1B.pt con la config de Pythia-410M permite estudiar que componentes de un modelo de 1.4B sobreviven a la reduccion a 410M y cuales deben reentrenarse.
- Estudio de tecnicas de pruning estructurado: los pares subclone/subclone_rs e hybrid/hybrid_rs permiten aislar el efecto del reescalado y de la compensacion por minimos cuadrados sobre la perplejidad final a presupuesto fijo.
- Linea base reproducible para articulos de compresion: cualquier metodo nuevo de inicializacion puede compararse contra estos siete brazos con exactamente el mismo presupuesto de datos y schedule, evitando comparaciones informales.
- Analisis de sensibilidad a la semilla: el par B incluye tres semillas de datos a 30M tokens (113,2 ± 4,5 de perplejidad en hybrid frente a 1.505,2 ± 57,9 en random), lo que sirve para estimar la varianza del protocolo antes de escalar experimentos.
- Docencia y formacion: al ser checkpoints pequenos (160M y 410M) y con licencia Apache 2.0, son adecuados para que estudiantes reproduzcan una ablacion completa de inicializacion en una sola GPU, incluso en hardware de consumo.
- Validacion de hipotesis de escalado: la comparacion entre el par A (reduccion de 1.4B a 410M) y el par B (reduccion dominada por profundidad, de 410M a 160M) permite estudiar si el cuello de botella de la conversion depende del ancho o de la profundidad.
- Auditoria de pipelines de evaluacion: el corpus de evaluacion congelado de 10.000 x 128 tokens, protegido contra contaminacion, puede reutilizarse para verificar que otras tuberias de evaluacion no filtran datos de entrenamiento.
- No es adecuado para atencion al cliente, generacion de codigo en produccion ni ningun uso conversacional: no hay ajuste por instrucciones ni entrenamiento de seguridad.

## Benchmarks y rendimiento

Los unicos datos publicados son perplejidades en WikiText-103 al final de cada carrera de recuperacion, con presupuesto de tokens equiparado. No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni ninguna otra tarea estandar). Punto de referencia: el Pythia-410M real obtiene aproximadamente 15,6 en la misma evaluacion.

Par A: Pythia-1.4B a 410M

| Checkpoint | Presupuesto | Perplejidad WikiText-103 |
|---|---:|---:|
| hybrid_30M.pt | 30M | 114,1 |
| subclone_30M.pt | 30M | 355,8 |
| projection_30M.pt | 30M | 1.054,5 |
| random_30M.pt | 30M | 1.519,0 |
| hybrid_100M.pt | 100M | 62,3 |
| subclone_100M.pt | 100M | 103,1 |
| hybrid_rs_1B.pt | 1B | 40,0 |
| subclone_rs_1B.pt | 1B | 40,0 |
| random_1B.pt | 1B | 57,4 |
| Pythia-410M oficial (referencia) | preentrenamiento completo | ~15,6 |

Par B: Pythia-410M a 160M (media sobre semillas cuando se indica)

| Checkpoint | Presupuesto | Perplejidad WikiText-103 |
|---|---:|---:|
| hybrid_30M_s0/s1/s2 | 30M | 113,2 ± 4,5 |
| subclone_30M_s0/s1/s2 | 30M | 118,5 ± 3,3 |
| random_30M_s0/s1/s2 | 30M | 1.505,2 ± 57,9 |
| hybrid_100M_s0 | 100M | 77,1 |
| subclone_100M_s0 | 100M | 74,4 |

Los autores afirman que la inicializacion por transferencia supera a la inicializacion desde cero hasta en 18x a 30M tokens, y que los dos brazos con reescalado convergen a paridad a 1B tokens. Los numeros por semilla y la escalera de ablaciones completa estan en el apendice del articulo.

## Requisitos de hardware

- VRAM de inferencia: los checkpoints objetivo son de 410M y 160M parametros. En fp32, el modelo de 410M ocupa aproximadamente 1,6 GB de pesos y el de 160M unos 0,64 GB; en fp16/bf16, aproximadamente 0,82 GB y 0,32 GB respectivamente, mas el coste de activaciones y cache KV (dependiente de la longitud de secuencia).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente para inferencia de los dos tamanos. Para entrenamiento continuado con presupuestos de 30M a 1B tokens conviene una GPU con 24 GB o mas (RTX 3090/4090, L4, A10G, A100, H100) si se quiere usar un batch razonable.
- Cabe en GPU de consumo: si. El par B (160M) cabe incluso en GPUs integradas o en CPU; el par A (410M) cabe comodamente en cualquier GPU de consumo con 4-6 GB.
- Opciones de despliegue: la ruta documentada es transformers con GPTNeoXForCausalLM mas AutoConfig y AutoTokenizer del tamano objetivo. GPT-NeoX esta soportado por vLLM y por Text Generation Inference (TGI). Para llama.cpp u Ollama habria que convertir los state_dicts a GGUF; no se publican archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo en la informacion proporcionada.
- Espacio en disco: el repositorio completo ocupa 57,4 GB, pero cada checkpoint individual es mucho menor; es recomendable descargar solo el archivo .pt necesario con hf_hub_download.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-103 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| ScaleOp par A (1.4B a 410M, hybrid_rs_1B) | 410M | no disponible (config Pythia) | 40,0 | Apache 2.0 | HuggingFace, solo state_dict |
| ScaleOp par B (410M a 160M, hybrid_100M) | 160M | no disponible (config Pythia) | 77,1 | Apache 2.0 | HuggingFace, solo state_dict |
| EleutherAI/pythia-410m | 410M | 2048 | ~15,6 | Apache 2.0 | HuggingFace, pesos completos |
| EleutherAI/pythia-160m | 160M | 2048 | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace, pesos completos |
| EleutherAI/pythia-1.4b (donante del par A) | 1,4B | 2048 | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace, pesos completos |

La comparacion relevante no es de calidad absoluta sino de proposito: los Pythia oficiales son modelos preentrenados completos y utilizables como base LM, mientras que los checkpoints ScaleOp son puntos finales de experimentos controlados con presupuestos de 0,01 % a 0,3 % del preentrenamiento original, pensados exclusivamente para estudiar inicializaciones.

## Limitaciones y advertencias

- No son asistentes utilizables: son modelos base sin ajuste por instrucciones ni entrenamiento de seguridad, tal y como advierte la propia model card.
- Presupuesto de entrenamiento muy corto: entre 30M y 1B tokens, es decir, entre el 0,01 % y el 0,3 % del preentrenamiento de Pythia, lo que se traduce en perplejidades muy alejadas de los modelos oficiales (40,0 frente a ~15,6 en el mejor caso del par A).
- Herencia de sesgos: los checkpoints heredan los sesgos del dataset Pile y de la familia Pythia, sin ningun tipo de mitigacion posterior.
- Riesgo de alucinacion: elevado en cualquier uso generativo, agravado por el escaso presupuesto de recuperacion y la ausencia de ajuste.
- Idioma: solo ingles. No hay soporte multilingue.
- Celda de una sola semilla: los autores senalan que las celdas de una unica semilla estan marcadas en el articulo; en concreto, el par B a 100M tokens solo incluye la semilla s0, por lo que sus cifras (77,1 y 74,4) tienen varianza desconocida.
- Restricciones de licencia: Apache 2.0 permite uso comercial del artefacto, pero hay que respetar tambien las condiciones del modelo base EleutherAI/pythia-1.4b y del dataset monology/pile-uncopyrighted.
- Formato: al ser state_dicts y no repositorios de modelo completos, no funcionan con AutoModelForCausalLM.from_pretrained directamente; requieren instanciar la configuracion del tamano objetivo y llamar a load_state_dict.
- Advertencia para produccion: no se recomienda su uso en produccion para ninguna tarea de generacion, clasificacion o asistencia. Su valor es exclusivamente experimental y de reproducibilidad.
- Tamano del repositorio: 57,4 GB en total, lo que puede suponer un coste de descarga y almacenamiento considerable si se clona completo en lugar de descargar archivos sueltos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YenugulaAIML/scaleop-pythia-conversions
- Articulo: https://arxiv.org/abs/2608.02829
- Repositorio de codigo, configuraciones y receta del corpus congelado: https://github.com/rsdpyenugula/ScaleOp
- README del repositorio de codigo: https://github.com/rsdpyenugula/ScaleOp/blob/master/README.md
- Modelo base donante (par A): https://huggingface.co/EleutherAI/pythia-1.4b
- Modelo base de la configuracion objetivo del par A: https://huggingface.co/EleutherAI/pythia-410m
- Modelo base de la configuracion objetivo del par B: https://huggingface.co/EleutherAI/pythia-160m
- Version original de la suite Pythia: https://huggingface.co/EleutherAI/pythia-1.4b-v0
- Repositorio de la suite Pythia: https://github.com/EleutherAI/pythia
- Dataset de entrenamiento: https://huggingface.co/datasets/monology/pile-uncopyrighted
