# sovythos/Sovythos-66M-Base

## Resumen

Sovythos-66M-Base es un modelo de lenguaje de tipo decoder-only transformer publicado por sovythos, el alias del desarrollador Mahmoud Yasser, fundador del Sovereign AI Project. Segun la model card, se trata del primer modelo de lenguaje preentrenado de codigo abierto desarrollado integramente desde cero dentro de ese proyecto: los pesos parten de una inicializacion aleatoria y no se ha reutilizado ningun checkpoint previo. El objetivo declarado es construir un ecosistema abierto de modelos multilingues con soporte solido de arabe, incluyendo arabe egipcio, junto con ingles.

El modelo es deliberadamente pequeno: la model card indica 66,7 millones de parametros, con 512 dimensiones ocultas, 12 capas y 16 cabezas de atencion, mientras que el recuento real de safetensors en el repositorio asciende a 83.113.216 parametros. Esta discrepancia conviene tenerla en cuenta al planificar despliegues. Es una publicacion de tipo base (pretrained), sin ajuste por instrucciones, pensada para preentrenamiento continuado, fine-tuning, instruction tuning e investigacion.

Su relevancia actual es mas documental y experimental que de producto: se trata de un modelo de menos de 100 millones de parametros, con un tokenizador propio y entrenamiento desde cero, lo que lo convierte en una plataforma asequible para estudiar tecnicas de tokenizacion, curriculo de datos y adaptacion al arabe en entornos con recursos limitados. No debe confundirse con un chatbot listo para produccion, ya que el propio autor advierte de que no esta ajustado por instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 83.113.216 segun safetensors en el repositorio; la model card declara ~66,7 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card indica "Configured during training" sin concretar cifra) |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye pesos en safetensors, sin versiones GGUF, AWQ o GPTQ publicadas |
| Idiomas soportados | Ingles y arabe (incluido arabe egipcio), ademas de lenguajes de programacion, documentacion tecnica y contenido matematico |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (PyTorch), con etiqueta custom_code que implica codigo de modelado propio |
| Tamano del repositorio | 0,3 GB |
| Dimension oculta | 512 |
| Numero de capas | 12 |
| Cabezas de atencion | 16 |
| Tokenizador | Personalizado (desarrollado por el autor) |
| Framework | PyTorch 2.x con CUDA y entrenamiento en precision mixta |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico de 12 capas, con dimension oculta de 512 y 16 cabezas de atencion, lo que arroja una dimension por cabeza de 32. La model card no menciona mecanismos alternativos como atencion lineal, SSM, mezcla de expertos ni decodificacion especulativa; todos los indicios apuntan a un transformer denso convencional optimizado para ser pequeno y entrenable en hardware modesto. El tokenizador es propio, no heredado de otro modelo, lo que implica que el vocabulario tambien se construyo especificamente para el corpus de entrenamiento.

El entrenamiento se realizo integramente desde cero con pesos inicializados aleatoriamente, usando PyTorch, CUDA, precision mixta y guardado automatico del mejor checkpoint. El autor afirma explicitamente que no se utilizaron pesos de ningun modelo preentrenado existente. No se especifica el numero de tokens procesados, la composicion exacta del dataset, la mezcla de proporciones entre arabe e ingles, ni si hubo fases posteriores de RLHF, DPO o ajuste por instrucciones. La model card solo enumera las categorias de datos empleadas: arabe, arabe egipcio, ingles, lenguajes de programacion, documentacion tecnica, contenido matematico y texto web general.

La hoja de ruta publicada contempla una version Instruct en desarrollo, seguida de un modelo de chat, modelos de mayor tamano, razonamiento avanzado, mejora en codigo, mejor comprension del arabe y soporte de contexto largo. Ninguna de esas capacidades esta presente en esta release base.

## Capacidades

- Generacion de texto autoregresiva basica en ingles y arabe, incluido arabe egipcio.
- Modelado de lenguaje puro: continuacion de texto, calculo de perplejidad y evaluacion de distribuciones token a token.
- Exposicion de representaciones internas util para investigacion sobre tokenizacion y aprendizaje de representaciones en un tokenizador propio.
- Punto de partida para preentrenamiento continuado sobre corpus adicionales en arabe o en dominios tecnicos.
- Base para fine-tuning supervisado y para instruction tuning posterior, tal como el autor plantea en la hoja de ruta.
- Cobertura parcial de lenguajes de programacion y documentacion tecnica por su presencia en el corpus, aunque sin garantias de calidad de codigo generado.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso estructurado ni modo de pensamiento explicito.
- No dispone de vision, audio ni modalidades adicionales al texto.
- No esta ajustado por instrucciones: no sigue ordenes de forma fiable ni mantiene rol de asistente.

## Casos de uso

- Preentrenamiento continuado sobre corpus arabe especializado: al ser un modelo pequeno y con pesos abiertos bajo Apache 2.0, se puede seguir entrenando con datos de dominio (legal, medico, administrativo egipcio) durante pocas horas en una unica GPU, obteniendo un modelo adaptado al registro linguistico objetivo.
- Fine-tuning supervisado para clasificacion de texto en arabe: el modelo puede servir de backbone para tareas de analisis de sentimiento, deteccion de temas o moderacion de comentarios, sustituyendo la cabeza de generacion por una capa de clasificacion y entrenando con pocos miles de ejemplos etiquetados.
- Investigacion sobre tokenizacion multilingue: dado que emplea un tokenizador propio y no heredado, permite medir experimentalmente como afecta el diseno del vocabulario a la perplejidad comparada entre arabe e ingles con un presupuesto computacional minimo.
- Docencia y practicas de entrenamiento desde cero: su tamano permite reproducir el ciclo completo de preentrenamiento, evaluacion y ajuste en un entorno de laboratorio academico, sin depender de infraestructura de centro de datos.
- Generacion de texto asistida de bajo coste en despliegues edge: con menos de 100 millones de parametros, puede ejecutarse en CPU o en GPU integrada para tareas de autocompletado o generacion corta en aplicaciones sin conectividad.
- Base para construir un asistente conversacional en arabe egipcio: el siguiente paso seria un ajuste por instrucciones con datos conversacionales, ya que la release actual no sigue instrucciones de forma fiable.
- Experimentos de destilacion: puede actuar como alumno en un esquema de destilacion desde un modelo mayor, o como profesor para modelos aun mas pequenos en tareas de lenguaje acotadas.
- Evaluacion de sesgos y de contaminacion de corpus: al conocerse las categorias de datos declaradas y no los pesos de origen, es un banco de pruebas util para metodologias de auditoria en modelos de muy baja escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de perplejidad sobre conjuntos de validacion publicos, y tampoco se ha localizado ninguna evaluacion independiente en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 83.113.216 parametros reales del repositorio: aproximadamente 332 MB en FP32, 166 MB en FP16/BF16, 83 MB en INT8 y 42 MB en INT4, sin contar el estado del optimizador, el cache KV ni el overhead del runtime.
- Para fine-tuning completo en FP16 con AdamW conviene reservar del orden de 1 a 2 GB de VRAM, dado que el estado del optimizador multiplica por varias veces el tamano de los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es sobradamente suficiente. Una RTX 3060, RTX 4060, RTX 4090, T4, A100 o H100 pueden ejecutar el modelo, aunque las tres ultimas estan enormemente sobredimensionadas para esta escala.
- Cabe en GPU de consumo, en GPU integrada y en CPU. La inferencia en CPU es perfectamente viable para este numero de parametros, algo poco habitual en modelos de la categoria de miles de millones de parametros.
- Opciones de despliegue: PyTorch con Transformers es la via directa, aunque la etiqueta custom_code implica que es necesario cargar el repositorio con codigo remoto habilitado y revisar previamente el codigo de modelado. No se han publicado pesos en formato GGUF, por lo que llama.cpp y Ollama requeririan una conversion manual. Tampoco se han publicado recetas para vLLM ni TGI, y el soporte de vLLM para arquitecturas con codigo personalizado depende de que esta se registre correctamente.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo, tiempo hasta el primer token ni rendimiento en lote. Dado el tamano del modelo, cualquier medicion real seria muy alta en GPU moderna y moderada en CPU, pero no se dispone de cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Sovythos-66M-Base | 83,1 M reales (66,7 M declarados) | No disponible | Ingles, arabe, arabe egipcio | Apache 2.0 | No publicados |
| Pythia-70M (EleutherAI) | 70 M | 2.048 tokens | Ingles | Apache 2.0 | Publicados por el autor del modelo |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | Ingles | MIT modificada | Publicados por el autor del modelo |
| TinyLlama-1.1B (proyecto TinyLlama) | 1.100 M | 2.048 tokens | Ingles | Apache 2.0 | Publicados por el autor del modelo |

Las especificaciones de Pythia-70M, GPT-2 small y TinyLlama-1.1B corresponden a informacion publica de esos proyectos y se incluyen como referencia de categoria. No existe ninguna comparacion directa publicada entre Sovythos-66M-Base y estos modelos, ni datos de benchmarks que permitan situarlo por encima o por debajo de ellos. La diferencia mas destacable frente a los tres es el enfoque multilingue arabe-ingles, ausente en Pythia-70M y GPT-2 small, que son modelos principalmente en ingles.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones. No debe desplegarse como chatbot ni como asistente conversacional, ni esperarse que siga ordenes o mantenga formato de respuesta.
- El propio autor reconoce alucinacion de informacion factual, razonamiento incorrecto en algunos casos, repeticion, generaciones incompletas y capacidad limitada de seguimiento de instrucciones.
- La longitud de contexto no esta especificada en la model card, por lo que no puede planificarse un uso con ventanas largas sin verificacion empirica previa. La hoja de ruta situa el soporte de contexto largo como trabajo futuro, lo que sugiere que la ventana actual es reducida.
- La discrepancia entre los 66,7 millones de parametros declarados y los 83,1 millones reales de safetensors debe resolverse antes de dimensionar infraestructura o comparar con otros modelos.
- No se documenta el volumen de tokens de entrenamiento, la composicion del dataset, el origen de los datos ni los filtros aplicados. Esto impide auditar sesgos de entrenamiento y evaluar el riesgo de contaminacion.
- Riesgo de sesgos linguisticos y culturales: la model card menciona arabe, arabe egipcio e ingles, pero no detalla proporciones, y no hay estudios de sesgo publicados.
- El tokenizador es personalizado, lo que dificulta la interoperabilidad con herramientas y pipelines que asumen vocabularios estandar como los de Llama o GPT.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones de copyleft, el uso en produccion no esta recomendado por la propia naturaleza de modelo base y por la ausencia de evaluaciones publicadas.
- La etiqueta custom_code implica la ejecucion de codigo de modelado incluido en el repositorio. Conviene revisarlo antes de cargar el modelo en entornos de produccion.
- El autor advierte que la plataforma Sovereign puede emplear modelos y APIs distintos a esta release base, por lo que las capacidades observadas en la demo no son extrapolables al modelo publicado.
- El repositorio presenta un numero muy bajo de descargas y una unica marca de "me gusta", lo que indica ausencia de validacion por parte de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sovythos/Sovythos-66M-Base
- Demo en vivo de la plataforma Sovereign: https://awaken-creation-guidance.ngrok-free.dev/
- Repositorio de imagenes del proyecto en HuggingFace: https://huggingface.co/buckets/my0919175/Sovythos-66M-Base/resolve/sovythos.png
- Cita proporcionada por el autor (BibTeX): sovythos66m, titulo SOVYTHOS-66M-Base, autor Mahmoud Yasser, ano 2026, editorial Hugging Face.
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo: los resultados fueron tutoriales genericos de deep learning (GeeksforGeeks, TutorialKart, W3Schools, igmGuru) sin relacion con Sovythos ni con el Sovereign AI Project.
