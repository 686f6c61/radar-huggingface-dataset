# udmurtNLP/udmurt-ai-spellchecker

## Resumen

Udmurt AI Spellchecker es un corrector ortografico experimental para el idioma udmurto (udm), una lengua urálica hablada en la republica de Udmurtia, en Rusia. Lo desarrolla el colectivo udmurtNLP y se distribuye como un pipeline de inferencia completo que funciona en CPU, sin necesidad de GPU. No es un modelo generativo al uso: combina un codificador CTC de caracteres afinado a partir de `udmurtNLP/bert-tiny-char-ctc-udm-denoise`, un modelo de trigramas de palabras, un canal de edicion y vectores de subpalabras, con un ranker que aplica cuatro caracteristicas morfologicas estrictas de UniParser.

El modelo resuelve un problema muy concreto: la correccion ortografica de texto en udmurto, un idioma de bajos recursos donde las herramientas comerciales de correccion no existen o son muy deficientes. Su relevancia radica en que demuestra que con arquitecturas ligeras (un BERT tiny a nivel de caracter con CTC) y recursos linguisticos especificos (morfologia UniParser, corpus paralelos udmurto-ruso) se puede construir un corrector funcional y desplegable en hardware modesto.

La informacion publica es limitada: el repositorio ocupa 0.0 GB, no declara licencia y no especifica el numero de parametros del codificador base. La model card indica que se trata de un lanzamiento experimental con umbrales congelados (`standard`) y que acepta frases de hasta 340 caracteres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador CTC de caracteres (base tipo BERT tiny) + trigramas de palabras + canal de edicion + vectores de subpalabras + ranker con morfologia UniParser |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 340 caracteres por frase |
| Tipos de cuantizacion | no disponible (inferencia en CPU, sin cuantizacion declarada) |
| Idiomas soportados | udmurto (udm) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema no es un transformer generativo sino un pipeline hibrido de correccion. El componente neuronal es un codificador CTC a nivel de caracter, afinado desde `udmurtNLP/bert-tiny-char-ctc-udm-denoise`, que modela secuencias de caracteres y emite alineaciones mediante Connectionist Temporal Classification. Sobre esa base se combinan un modelo de trigramas de palabras, un canal de edicion (que modela la probabilidad de las transformaciones tipicas entre la forma erronea y la correcta) y vectores de subpalabras. El ranker final incorpora cuatro caracteristicas morfologicas estrictas derivadas de UniParser para puntuar las candidatas de correccion.

El entrenamiento utiliza el dataset `udmurtNLP/udmurt-russian-parallel-corpora`. La model card no detalla el numero de tokens ni la composicion exacta del corpus, ni si hubo etapas de RLHF o DPO (poco probables en un sistema de este tipo). El ranker original solo procesaba palabras de hasta tres caracteres y palabras con mayusculas; esta release aplica los umbrales congelados `standard`. La inferencia se ejecuta offline tras instalar dependencias y fue probada con Python 3.12.

## Capacidades

- Correccion ortografica de texto en udmurto a nivel de palabra y de frase.
- Deteccion y restauracion de errores tipograficos sinteticos (insercion, borrado, sustitucion y transposicion de caracteres).
- Procesamiento por lotes: acepta una frase por linea a traves de entrada estandar.
- Salida en formato JSON mediante el flag `--json` de `inference.py`.
- Aplicacion de rasgos morfologicos (UniParser) para validar las candidatas de correccion.
- Ejecucion completamente offline y en CPU, sin dependencia de GPU.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Normalizacion de corpus en udmurto: el corrector puede pasar sobre textos digitalizados (OCR, transcripciones) para reducir errores ortograficos antes de alimentar modelos de traduccion o analisis linguistico, dado que opera a nivel de frase y en CPU.
- Preprocesado para traduccion automatica udmurto-ruso: al compartir origen de datos con el corpus paralelo, corregir la fuente antes de la traduccion reduce el ruido de entrada en sistemas de MT de bajos recursos.
- Herramienta de escritorio para hablantes y linguistas: el pipeline se ejecuta offline en CPU con Python 3.12, lo que permite integrarlo en editores o utilidades locales sin infraestructura de servidor.
- Control de calidad en publicacion de material didactico: con una tasa de falsos positivos baja (7 de 158 originales publicados modificados en la evaluacion), es apto para revisar textos ya editados con intervencion humana posterior.
- Investigacion en correccion ortografica de lenguas de bajos recursos: sirve como linea base reproducible (F0.5 de 0.8264 sobre 1.036 ejemplos) para comparar nuevas aproximaciones en udmurto.
- Procesamiento por lotes en pipelines linguisticos: la lectura de una frase por linea desde stdin facilita su encadenamiento con otras herramientas de anotacion morfologica o de tokenizacion.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto de evaluacion |
|---|---|---|
| F0.5 a nivel de edicion de palabra | 0.8264 | 1.036 ejemplos soportados de 79 obras literarias no usadas previamente |
| Ejemplos con erratas sinteticas restaurados por completo | 523 de 878 | Mismo conjunto |
| Originales publicados sin corromper modificados (falsos positivos) | 7 de 158 | Mismo conjunto |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no es un modelo generativo de proposito general.

## Requisitos de hardware

- Inferencia en CPU: el autor declara explicitamente que es un corrector para CPU; no requiere VRAM.
- VRAM estimada: no aplica (sin ejecucion en GPU declarada).
- GPU recomendadas: no disponible; no se documenta uso de GPU.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto, al ejecutarse en CPU.
- Despliegue: script `inference.py` del repositorio con `requirements.txt`; probado con Python 3.12. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de correccion ortografica para udmurto ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo califica como tal, con umbrales congelados y sin garantias de robustez en produccion.
- Vocabulario de caracteres restringido: solo procesa entradas cuyos caracteres estan cubiertos por el vocabulario del codificador; el resto queda fuera.
- Limite de 340 caracteres por frase, lo que obliga a segmentar textos largos.
- Solo cubre udmurto; no procesa ruso ni otras lenguas.
- Riesgo de falsos positivos: aunque bajo en la evaluacion (7 de 158), modifica algunos originales correctos, por lo que conviene revision humana en publicacion.
- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- El ranker original solo manejaba palabras de hasta tres caracteres y con mayusculas; el comportamiento fuera de ese rango depende de los umbrales `standard`.
- Sin datos publicados sobre sesgos, alucinacion (no es generativo) ni rendimiento fuera del conjunto de evaluacion descrito.
- Repositorio de 0.0 GB y sin descargas ni likes: ecosistema minimo, sin validacion externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udmurtNLP/udmurt-ai-spellchecker
- Modelo base: https://huggingface.co/udmurtNLP/bert-tiny-char-ctc-udm-denoise
- Dataset de entrenamiento: https://huggingface.co/datasets/udmurtNLP/udmurt-russian-parallel-corpora
