# vanshnawander/assignment2-moe-shared

## Resumen

`vanshnawander/assignment2-moe-shared` es un modelo de traduccion automatica de vietnamita e ingles... no, de vietnamita y japones hacia ingles, publicado por el usuario vanshnawander en HuggingFace. Se trata de un Transformer decoder-only de arquitectura Mixture of Experts (MoE) con 35.402.752 parametros totales y hasta 29.123.584 parametros activos por token, desarrollado con codigo PyTorch personalizado en lugar de una arquitectura estandar de las librerias habituales. El nombre del repositorio sugiere que se trata de un trabajo academico (assignment), y tanto las descargas como los "likes" registrados son cero, lo que indica que es un modelo de investigacion sin adopcion practica.

El modelo cuenta con seis capas, ocho cabezas de atencion, tamano oculto de 512 y una ventana de contexto muy reducida de solo 256 tokens, con un vocabulario byte-level BPE de 32.000 entradas. Los resultados declarados por el autor son una perplejidad de test de 64,9159 y un BLEU de 15,9421, cifras modestas que reflejan un sistema de traduccion de baja calidad en terminos absolutos, coherente con su tamano y con su naturaleza de ejercicio academico.

Su relevancia es limitada fuera del ambito educativo: sirve como ejemplo reproducible de implementacion de una capa MoE en PyTorch con codigo propio, y como caso de estudio de las dificultades de integrar arquitecturas no estandar en el ecosistema de inferencia (vLLM, llama.cpp, TGI). No se dispone de licencia declarada ni de informacion sobre los datos de entrenamiento, lo que restringe seriamente cualquier uso comercial o de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas Mixture of Experts (MoE), implementacion en PyTorch personalizada |
| Parametros totales | 35.402.752 |
| Parametros activos | Hasta 29.123.584 por token |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se documentan pesos cuantizados; solo `model_state.pt` en precision original) |
| Idiomas soportados | Vietnamita e japones como idioma origen; ingles como idioma destino |
| Licencia | no disponible |
| Formato de pesos | `model_state.pt` (state dict de PyTorch, solo tensores) |
| Capas | 6 |
| Cabezas de atencion | 8 |
| Tamano oculto | 512 |
| Vocabulario | 32.000 tokens, byte-level BPE |
| Tokens especiales | PAD=0, BOS=1, EOS=2, SEP=3, VI=4, JA=5 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only de seis capas con ocho cabezas de atencion y dimension oculta de 512, lo que da una dimension por cabeza de 64. La particularidad es la presencia de capas MoE: el modelo tiene 35,4 millones de parametros totales pero activa hasta 29,1 millones por token, es decir, aproximadamente el 82 % de los parametros. Esto implica un enrutamiento disperso relativamente denso, con un numero de expertos y una estrategia de routing (top-k, capacidad por experto, funcion de balanceo) que no se documentan en la informacion disponible. El vocabulario byte-level BPE de 32.000 entradas es notablemente grande en relacion con el tamano del modelo: solo la matriz de embeddings representa unos 16,4 millones de parametros, cerca del 46 % del total.

El entrenamiento se realizo sobre tareas de traduccion de vietnamita e japones a ingles, segun indica la model card. No se especifica el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT supervisado. La model card indica explicitamente que no se incluye el corpus de entrenamiento bruto ni credenciales, y que el archivo `model_state.pt` contiene unicamente tensores, mientras que los estados del optimizador y del generador aleatorio permanecen en los checkpoints resumibles locales originales. Se incluyen archivos JSON con la arquitectura, los ajustes de entrenamiento y los resultados de evaluacion.

Un detalle relevante para la reproducibilidad es que el modelo se distribuye como codigo fuente PyTorch ordinario (`load_model.py`, `decoding.py`), y el propio autor advierte de que se revise el codigo antes de importarlo. La carga requiere insertar el directorio del repositorio en `sys.path` y usar funciones propias, no una clase estandar de `transformers`. El prompt de traduccion sigue el formato `[BOS, language_id, source_tokens..., SEP]`, y el de continuacion `[BOS, text_tokens...]`.

## Capacidades

- Traduccion de vietnamita a ingles y de japones a ingles, con seleccion de idioma origen mediante el token especial correspondiente (VI=4, JA=5).
- Generacion de texto autoregresiva con decodificacion basada en forward, mediante los helpers incluidos en `decoding.py`.
- Continuacion de texto libre (prompt de continuacion sin identificador de idioma).
- Uso como modelo de investigacion para experimentar con enrutamiento MoE y arquitecturas personalizadas en PyTorch.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta thinking mode, vision, audio ni ninguna otra modalidad.
- Capacidad multilingue limitada a los pares vi→en y ja→en; no se declara soporte de traduccion inversa ni de otros idiomas.
- No hay informacion sobre capacidades de generacion de codigo o matematicas; no son objetivos del modelo.

## Casos de uso

- Estudio de arquitecturas MoE en el aula: el repositorio incluye el codigo fuente completo, los ajustes de entrenamiento en JSON y los pesos, lo que permite reproducir el forward pass y analizar el comportamiento del enrutamiento con solo 35 millones de parametros.
- Referencia para implementaciones personalizadas en PyTorch: sirve como ejemplo minimo y ejecutable de como estructurar un decoder-only con codigo propio, tokenizer externo (`tokenizers`) y carga de state dict sin `transformers`.
- Traduccion vi→en o ja→en de frases muy cortas en entornos de experimentacion: con una ventana de 256 tokens, admite oraciones o fragmentos breves, no documentos.
- Generacion de datos sinteticos de bajo coste: por su tamano, puede ejecutarse en CPU para producir borradores de traduccion que despues se filtren o corrijan con un modelo mayor.
- Pruebas de integracion y pipelines de evaluacion: util para validar infraestructura de evaluacion de traduccion (calculo de BLEU, perplejidad) sin consumir recursos de GPU.
- Docencia sobre limitaciones de los modelos pequenos: con BLEU de 15,94 y perplejidad de 64,92, es un caso claro para ilustrar como el tamano, el contexto corto y la falta de datos afectan a la calidad de traduccion.
- Experimentacion con vocabularios byte-level BPE grandes: permite estudiar el equilibrio entre tamano de vocabulario y tamano de modelo, dado que los embeddings suponen casi la mitad de los parametros.

## Benchmarks y rendimiento

La model card solo proporciona dos metricas, ambas sobre el conjunto de test del autor, sin detallar el corpus ni la metodologia de evaluacion.

| Metrica | Valor | Conjunto |
|---|---|---|
| Perplejidad | 64,9159 | Test (no se especifica corpus) |
| BLEU | 15,9421 | Test (no se especifica corpus) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WMT, FLORES-200, etc.) en la informacion disponible. No se dispone de comparaciones con modelos de referencia bajo condiciones identicas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 142 MB solo para los pesos; en fp16/bf16, unos 71 MB; en int8, unos 35 MB. A esto hay que anadir el estado de activaciones, el cache KV (despreciable con 256 tokens de contexto) y el overhead del runtime de PyTorch, que en la practica puede superar varias veces el tamano de los pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; el modelo no requiere A100, H100 ni similares. Una GTX 1050 Ti, una RTX 3060 o incluso una GPU integrada moderna pueden ejecutarlo.
- Compatibilidad con GPU de consumo: si, cabe sobradamente en cualquier GPU de consumo actual e incluso en hardware antiguo.
- Ejecucion en CPU: viable gracias al reducido numero de parametros (35,4 millones), aunque la latencia dependera del hardware y de si el enrutamiento MoE introduce sobrecoste.
- Opciones de despliegue: al tratarse de una arquitectura con codigo personalizado, no se garantiza compatibilidad con vLLM, TGI, llama.cpp, Ollama ni otros runtimes estandar. El unico metodo documentado es importar `load_model.py` y `decoding.py` desde el propio repositorio y ejecutar PyTorch de forma nativa. Cualquier despliegue en estos frameworks requeriria portar la arquitectura.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tiempo por token ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks de los modelos alternativos dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. La tabla siguiente recoge unicamente los datos del modelo analizado y marca como no disponible cualquier dato no verificado de las alternativas.

| Modelo | Parametros | Contexto | Licencia | Benchmarks |
|---|---|---|---|---|
| vanshnawander/assignment2-moe-shared | 35,4 M totales (29,1 M activos) | 256 tokens | no disponible | Perplejidad 64,9159; BLEU 15,9421 |
| Modelos de traduccion ligeros tipo Marian/OPUS-MT (vi→en, ja→en) | no disponible | no disponible | no disponible | no disponible |
| Modelos multilingues de traduccion de ~400 M de parametros | no disponible | no disponible | no disponible | no disponible |

Como referencia cualitativa, la categoria de modelos de traduccion dedicados de menos de 100 millones de parametros suele reportar valores de BLEU considerablemente superiores en pares de alta y media resource como vi→en, aunque no se aportan cifras verificables en la informacion disponible. La ventana de 256 tokens de este modelo es, en cualquier caso, muy inferior a la de la mayoria de alternativas de traduccion contemporaneas.

## Limitaciones y advertencias

- Ventana de contexto de solo 256 tokens: impide traducir parrafos completos, documentos o conversaciones multi-turno. Cualquier entrada mas larga debe truncarse o segmentarse.
- Calidad de traduccion baja: un BLEU de 15,9421 y una perplejidad de 64,9159 son cifras pobres en terminos absolutos, lo que implica salidas frecuentemente incorrectas, incompletas o gramaticalmente deficientes.
- Riesgo elevado de alucinacion: al tratarse de un modelo pequeno entrenado presumiblemente con pocos datos, puede generar contenido no presente en el texto origen, especialmente en frases largas o con vocabulario poco frecuente.
- Sesgos desconocidos: no se documenta la composicion del corpus de entrenamiento, por lo que no es posible evaluar sesgos de genero, culturales, politicos ni de dominio.
- Licencia no disponible: sin una licencia explicita, no hay autorizacion clara para uso comercial, redistribucion ni obras derivadas. Se debe contactar con el autor antes de cualquier uso fuera del ambito de investigacion personal.
- Codigo personalizado no auditado: el modelo se distribuye como codigo fuente Python que debe importarse directamente, con la advertencia explicita del autor de revisarlo antes. Existe riesgo de seguridad al ejecutar codigo de un repositorio sin auditoria.
- Sin integracion con runtimes estandar: no es compatible de forma directa con vLLM, llama.cpp, Ollama o TGI, lo que complica el despliegue en produccion y el aprovechamiento de optimizaciones como paged attention o cuantizacion GGUF.
- Idiomas limitados: solo cubre vietnamita e japones como origen e ingles como destino. No hay soporte documentado de traduccion inversa ni de otros pares.
- Sin datos de entrenamiento ni evaluacion estandar: la imposibilidad de reproducir el entrenamiento y la ausencia de benchmarks publicos estandar dificultan la validacion independiente.
- Adopcion nula: cero descargas y cero "likes" en el momento de redactar esta ficha, lo que implica ausencia de validacion por parte de la comunidad.
- Fecha de creacion futura en los metadatos: el repositorio figura como creado el 2026-10-04, lo que sugiere metadatos inconsistentes o manipulados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vanshnawander/assignment2-moe-shared
- Paper: no disponible
- Blog o articulo tecnico: no disponible
- Repositorio de codigo adicional: no disponible
- Demo: no disponible
- No se han encontrado otros enlaces relevantes en la informacion proporcionada.
