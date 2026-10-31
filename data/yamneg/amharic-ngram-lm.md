# yamneg/amharic-ngram-lm

## Resumen

Amharic N-gram Language Model es un modelo de lenguaje clásico basado en n-gramas (de orden 1 a 4) para el amárico (አማርኛ), desarrollado por el usuario yamneg como proyecto para la asignatura de Procesamiento del Lenguaje Natural de la Addis Ababa University (School of Information Technology and Engineering). El modelo está implementado desde cero, sin depender de NLTK, KenLM ni redes neuronales, y se entrena sobre el corpus GPAC (General-Purpose Amharic Corpus).

Su propósito es doble: servir como herramienta educativa y de demostración del modelado estadístico de lenguaje para amárico, y funcionar como baseline de referencia frente a enfoques neuronales. El modelo permite puntuar la naturalidad de una frase, sugerir las siguientes palabras más probables y generar texto por muestreo. No es un modelo de `transformers`: el repositorio contiene tablas de recuentos (unos 1,6 GB) que se leen mediante el código del proyecto.

Su relevancia reside en la escasez de recursos de PLN para lenguas etiópicas como el amárico. Ofrece una base estadística sólida, con perplejidad publicada y metodología reproducible, útil para teclados predictivos, evaluación intrínseca y docencia, y como punto de comparación para modelos neuronales futuros en esta lengua.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | N-gramas interpolados (1 a 4) con suavizado Kneser-Ney (no es una red neuronal) |
| Parametros totales | no disponible (tablas de recuentos: 19,4 M bigramas, 38,6 M trigramas, 43,9 M 4-gramas antes de podar) |
| Parametros activos | no disponible (no aplica, no es MoE) |
| Longitud de contexto | Hasta 3 palabras previas (ventana de 4-gramas) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | Amárico (am) |
| Licencia | Otra (license: other, sin detalles en la model card) |
| Formato de pesos | Tablas de recuentos enteros propias (`ngrams_pruned/`, 1,6 GB), vocabulario en texto plano y recuentos en NumPy (`vocab.txt.counts.npy`) |

## Arquitectura y entrenamiento

El modelo es un n-gram language model de órdenes 1 a 4 con suavizado Kneser-Ney interpolado como método principal, complementado con add-k y recuentos planos (MLE) para comparación. Los descuentos de Kneser-Ney y los valores de add-k se ajustaron sobre el conjunto de desarrollo y se distribuyen en `tuned_params.json`. Tras el recuento exacto de todos los n-gramas de 1 a 4 sobre 52,7 M de palabras de entrenamiento (sin hashing), se podan los singletones de los órdenes 3 y 4 (se conservan 4,8 M trigramas y 3,1 M 4-gramas), manteniendo estadísticas por contexto que garantizan que cada distribución sume 1. El pico de memoria del pipeline completo fue de 5,8 GB.

Los datos de entrenamiento provienen del corpus GPAC (Gereme et al., 2021), de 1,06 GB y unas 424 M de caracteres, compuesto mayoritariamente por texto de noticias y web. El preprocesamiento incluye normalización Unicode NFC, fusión de letras homófonas (ሐ/ኀ→ሀ, ሠ→ሰ, ዐ→አ, ጸ→ፀ), eliminación de tokens con caracteres latinos, dígitos, URLs o emojis, y eliminación de 1.153.624 frases duplicadas. Tras la limpieza quedan 3.746.429 frases y 58,6 M de palabras, divididas por hash de frase (semilla 42) en 3.372.107 frases de entrenamiento, 187.009 de desarrollo y 187.313 de test. Las palabras vistas menos de 3 veces se mapean a `<unk>` (2,6 % de las palabras de entrenamiento). El vocabulario final tiene 547.121 entradas. No hay RLHF ni DPO, obviamente, al tratarse de un modelo estadístico.

## Capacidades

- Puntuación de naturalidad de frases en amárico mediante perplejidad o log-probabilidad.
- Predicción de la siguiente palabra con ranking top-k (por ejemplo, top 5 sobre el modelo de 4-gramas).
- Generación de texto por muestreo a partir de los n-gramas.
- Comparación entre métodos de suavizado (Kneser-Ney, add-k, MLE) para fines educativos.
- Evaluación intrínseca reproducible: perplejidad, precisión top-1/top-5, MRR y teclas ahorradas.
- Demo web incluida en el repositorio del proyecto (aplicación servida en local).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales; no es un modelo de `transformers`.

## Casos de uso

- Docencia de PLN: el proyecto fue creado para un curso universitario y permite ilustrar de principio a fin el modelado de n-gramas, el suavizado Kneser-Ney y la evaluación con perplejidad sobre una lengua real.
- Baseline para modelos neuronales en amárico: sus tablas de perplejidad (1.001 para el 4-gram podado) sirven como referencia mínima que cualquier modelo neuronal debería superar.
- Sugerencia de siguiente palabra en teclados o editores amáricos: con un top-5 del 25,9 % y un ahorro de teclas del 37,1 % en el modelo de 4-gramas, es adecuado para prototipos de autocompletado ligeros.
- Evaluación de fluidez de texto: puede puntuar frases candidatas en sistemas de generación o traducción automática hacia amárico como comprobación rápida de naturalidad.
- Análisis lingüístico corpus-based: las tablas de recuentos permiten estudiar frecuencias, colocaciones y patrones de la lengua amárica en texto de noticias y web.
- Demostraciones interactivas: la aplicación web del repositorio permite mostrar predicción y generación en vivo sin GPU ni dependencias de deep learning.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de test (3.120.519 palabras puntuadas; menor perplejidad es mejor):

| n | MLE (recuentos planos) | add-k | Kneser-Ney interpolado | Kneser-Ney sin podar |
|---|---|---|---|---|
| 1 | 10.247 | 10.247 | 10.247 | – |
| 2 | ∞ (24,9 % de palabras con probabilidad cero) | 2.805 | **1.277** | 1.277 |
| 3 | ∞ (60,2 %) | 50.557 | **1.030** | 921 |
| 4 | ∞ (75,3 %) | 170.801 | **1.001** | 816 |

Comprobaciones downstream del modelo Kneser-Ney en test:

| n | Top-1 | Top-5 | MRR | Teclas ahorradas | Frase real vence a su copia barajada |
|---|---|---|---|---|---|
| 1 | 1,6 % | 3,9 % | 0,031 | 22,6 % | 50,0 % (por construcción) |
| 2 | 10,7 % | 21,6 % | 0,162 | 35,5 % | 99,4 % |
| 3 | 14,3 % | 25,4 % | 0,198 | 37,0 % | 99,4 % |
| 4 | 14,9 % | 25,9 % | 0,204 | 37,1 % | 99,5 % |

No hay comparaciones con modelos neuronales publicados en la model card.

## Requisitos de hardware

- No requiere GPU: es un modelo estadístico que solo carga tablas de recuentos.
- Memoria RAM: el pico del pipeline de entrenamiento fue de 5,8 GB; para inferencia basta con cargar las tablas podadas (1,6 GB en disco), por lo que unos 4 GB de RAM deberían ser suficientes para el modo ligero (`LM_LITE=1`).
- Espacio en disco: 1,5 GB para el repositorio completo (las tablas del modelo ocupan 1,6 GB según la model card, con el repo total en 1,5 GB).
- Compatible con cualquier equipo de consumo, incluidos portátiles sin GPU dedicada.
- Despliegue: mediante `huggingface_hub.snapshot_download` para obtener los pesos y el código del proyecto (`src.web_demo`) para levantar una demo web local en el puerto 8000. No es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de transformers ni tener formato GGUF.
- Latencia y throughput: no disponible en la información proporcionada, aunque al tratarse de búsquedas en tablas ordenadas se espera latencia de milisegundos por predicción.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yamneg/amharic-ngram-lm | N-gramas (Kneser-Ney) | 1,5 GB de tablas | 3 palabras previas | Other | Pesos y código públicos en HuggingFace y GitHub |
| Modelos neuronales amáricos (p. ej., fine-tunings de mT5 o AfroXLMR) | Transformer | 300 M–560 M parámetros típicamente | 512 tokens aprox. | Varía (muchas CC-BY o MIT) | Disponibles en HuggingFace, requieren GPU para inferencia cómoda |
| Modelos KenLM equivalentes | N-gramas (KenLM) | Depende del corpus | Ventana de n-gramas | LGPL (KenLM) | Herramienta estándar, requiere construir el modelo a partir del corpus |

No se han identificado en la información proporcionada otros modelos n-gram de amárico publicados en HuggingFace para una comparativa directa de benchmarks.

## Limitaciones y advertencias

- Sin análisis morfológico: el amárico añade prefijos y sufijos (አዲስ, በአዲስ, የአዲስ son palabras distintas), lo que infla el vocabulario (547.121 entradas) y dispersa los datos.
- Sesgo de dominio: el corpus GPAC es mayoritariamente texto de noticias y web, con sobrerrepresentación de política, gobierno, religión y fechas; las sugerencias y el texto generado reflejan este sesgo y pueden incluir afirmaciones ofensivas o falsas presentes en el texto web original.
- Artefactos del corpus: la abreviatura de fecha ዓ.ም aparece como dos tokens y las firmas de noticias se repiten, dominando los n-gramas de orden alto; tras "አዲስ አበባ" el modelo sugiere nombres de meses.
- La poda reduce las tablas entre 8 y 14 veces pero empeora la perplejidad del 4-gram (1.001 frente a 816 sin podar).
- El texto de entrada debe pasar exactamente por el mismo preprocesamiento del corpus (NFC, fusión de homófonos, eliminación de latín y dígitos); de lo contrario, los resultados serán incorrectos.
- Licencia "other" sin detalles en la model card: conviene verificar los términos antes de cualquier uso comercial.
- No es un modelo neuronal: no comprende el lenguaje, su ventana de contexto es de solo 3 palabras y su precisión top-1 (14,9 %) es muy inferior a la de un LLM moderno.
- Repositorio con 0 descargas registradas y de naturaleza académica: no está pensado para producción sin adaptaciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yamneg/amharic-ngram-lm
- Código, informe y fuente de la demo: https://github.com/yamneg96/NLP
- Corpus de entrenamiento (GPAC, Gereme et al., 2021): no incluido en el repositorio; debe obtenerse de sus autores (referencia en la model card)
