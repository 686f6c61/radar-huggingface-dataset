# veripazari/durak

## Resumen

Durak es un conjunto de herramientas de procesamiento de lenguaje natural (NLP) para turco, no un modelo de lenguaje neuronal. Lo desarrolla el autor `cdliai` y esta version concreta ha sido archivada y traducida al turco por la plataforma VeriPazari bajo el identificador `veripazari/durak`. Su proposito es ofrecer normalizacion, tokenizacion, eliminacion de stopwords y lematizacion de alta velocidad para texto turco, resolviendo las ineficiencias de las implementaciones puramente en Python.

La arquitectura se basa en un nucleo escrito en Rust expuesto a traves de una interfaz Python, lo que permite liberar el GIL y lograr paralelismo real en el procesamiento por lotes. Los recursos linguisticos (listas de stopwords, sufijos) se incrustan en el binario mediante `include_str!`, eliminando operaciones de entrada/salida en disco.

Es relevante porque cubre una carencia especifica: el turco presenta una morfologia aglutinante y reglas de armonia vocal que complican la tokenizacion y el stemming, y las librerias genericas de NLP no las manejan bien. Durak ofrece una solucion empaquetada en PyPI (`durak-nlp`) con tipado estatico y API modular, orientada a investigadores que necesitan preprocesar corpus turcos de forma reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nucleo Rust con interfaz Python (no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT segun metadatos de Hugging Face; la model card referencia "Durak 1.2" en el badge del repositorio |
| Formato de pesos | no disponible (no aplica; se distribuye como paquete Python `durak-nlp` con extension Rust compilada) |

## Arquitectura y entrenamiento

Durak no es un transformer ni un modelo entrenado con gradientes. Es una libreria de procesamiento determinista con dos capas: un nucleo en Rust (`src/lib.rs`) que implementa tokenizacion, normalizacion Unicode especifica del turco (gestion de İ/ı e I/i) y busqueda de lemas, y una capa Python (`python/durak/`) que expone una API modular con `Pipeline`, `StopwordManager`, `Lemmatizer` y funciones sueltas como `clean_text`, `tokenize`, `attach_detached_suffixes` y `remove_stopwords`.

La innovacion tecnica principal es el uso de `include_str!` para embeber recursos linguisticos en el binario, lo que segun el autor acelera la carga de stopwords entre 100 y 1000 veces frente a la lectura de ficheros. Las funciones del nucleo Rust se declaran entre 5 y 10 veces mas rapidas que sus equivalentes en Python. El lematizador admite tres estrategias: `lookup` (solo diccionario, alta precision pero falla en palabras fuera de vocabulario), `heuristic` (eliminacion de sufijos, cubre OOV pero puede recortar en exceso) e `hybrid` (diccionario primero, heuristica como respaldo, recomendada). Incluye metricas opcionales de tasa de acierto del diccionario, latencia por estrategia y tasa de acierto de cache.

## Capacidades

- Normalizacion Unicode especifica del turco, incluyendo la gestion correcta de las parejas İ/ı e I/i.
- Tokenizacion basada en expresiones regulares que preserva la morfologia turca (sufijos, apostrofes en nombres propios).
- Seguimiento de offsets a nivel de caracter, util para NER y tareas basadas en spans.
- Union de sufijos separados (`attach_detached_suffixes`), por ejemplo para reconstruir `ankara ' da` como `ankara'da`.
- Gestion configurable de stopwords con listas base, adiciones y palabras a preservar (`StopwordManager`).
- Lematizacion con tres estrategias (`lookup`, `heuristic`, `hybrid`) y metricas de rendimiento opcionales.
- Tipado estatico completo mediante ficheros `.pyi`, con soporte de IDE y analisis estatico.
- Acceso directo al nucleo Rust (`_durak_core`) para funciones de alto rendimiento como `fast_normalize`, `tokenize_with_offsets`, `get_stopwords_base` y `get_detached_suffixes`.
- Procesamiento por lotes con paralelismo real al liberar el GIL.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente.

## Casos de uso

- Preprocesamiento de corpus turcos para entrenamiento de modelos: la pipeline `clean_text → tokenize → attach_detached_suffixes → remove_stopwords` deja el texto listo para vectorizacion o para alimentar un transformer, con la ventaja de que el procesamiento por lotes libera el GIL y escala en varios nucleos.
- Construccion de indices de busqueda en turco: la tokenizacion que respeta apostrofes y sufijos separados evita fragmentar terminos como `istanbul'a`, mejorando la precision de un motor de busqueda lexico.
- Etiquetado de entidades nombradas (NER): el seguimiento de offsets a nivel de caracter permite mapear predicciones del modelo sobre el texto original sin recalcular posiciones.
- Analisis de opiniones y redes sociales: la normalizacion de mayusculas turcas y la eliminacion configurable de stopwords reducen el ruido en textos informales antes de aplicar un clasificador.
- Investigacion en morfologia turca: el lematizador con metricas permite comparar las estrategias `lookup`, `heuristic` e `hybrid` sobre un corpus propio y medir la tasa de acierto del diccionario y la latencia por estrategia.
- Pipelines de NLP reproducibles en produccion: el tipado estatico con `.pyi` y la ausencia de dependencias externas en la distribucion (recursos compilados en el binario) simplifican el empaquetado en contenedores y reducen el riesgo de fallos por ficheros de datos ausentes.
- Limpieza de datos para fine-tuning de modelos en turco: la eliminacion de stopwords con listas especificas de dominio permite adaptar el preprocesamiento a sectores concretos (legal, medico, financiero) sin reescribir la logica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente aporta cifras relativas de rendimiento interno:

| Medicion | Valor declarado por el autor |
|---|---|
| Aceleracion de funciones Rust frente a Python | 5 a 10 veces mas rapidas |
| Aceleracion de carga de recursos embebidos frente a lectura de ficheros | 100 a 1000 veces mas rapida |
| Latencia media de lematizacion (ejemplo con 10.000 llamadas) | 0,042 ms por llamada |
| Tasa de acierto del diccionario (ejemplo) | 72,3 % (7.234 de 10.000) |

Estas cifras provienen de un ejemplo de la model card y no de un benchmark independiente ni de un conjunto de datos publico.

## Requisitos de hardware

- No requiere GPU: es una libreria de CPU.
- VRAM estimada: no aplica.
- GPU recomendadas: no aplica.
- Cabe en cualquier CPU de consumo; el rendimiento escala con el numero de nucleos gracias al paralelismo sin GIL.
- Opciones de despliegue: instalacion via `pip install durak-nlp`; se integra en cualquier pipeline Python. No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: la model card cita 0,042 ms de media por llamada al lematizador en su ejemplo; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Herramienta | Tipo | Idioma | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Durak | Libreria NLP (Rust + Python) | Turco | Tokenizacion, stopwords, lematizacion | MIT (metadatos HF) / "Durak 1.2" (badge del repo) | PyPI `durak-nlp`, GitHub `cdliai/durak` |
| Zemberek | Libreria NLP (Java) | Turco | Morfologia, analisis, correccion ortografica | no disponible en la informacion proporcionada | Repositorio Java |
| Stanza (Stanford) | Libreria NLP neuronal | Multilingue (incluye turco) | Tokenizacion, POS, NER, dependencias | no disponible en la informacion proporcionada | Python, modelos preentrenados |
| spaCy | Libreria NLP | Multilingue (turco limitado) | Tokenizacion, POS, NER | no disponible en la informacion proporcionada | Python |

La comparativa se limita a categorias conocidas del ecosistema; no se dispone de datos de rendimiento comparativo directo entre estas herramientas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas ni soporta tool calling. Cualquier expectativa de ese tipo es erronea.
- Solo soporta turco; no hay capacidades multilingues.
- La estrategia `lookup` del lematizador falla en palabras fuera de vocabulario y la `heuristic` puede recortar en exceso; la opcion `hybrid` mitiga ambos problemas pero no los elimina.
- Existe una discrepancia de licencia: los metadatos de Hugging Face indican MIT, mientras que el badge del repositorio original referencia "Durak 1.2". Conviene verificar el fichero LICENSE del repositorio antes de un uso comercial.
- La model card indica que esta version es una traduccion y archivo de la original por parte de VeriPazari, no el repositorio canonico; el mantenimiento activo corresponde a `cdliai/durak` y `fbkaragoz/durak`.
- El repositorio de Hugging Face registra 0 descargas y 0 likes, lo que sugiere escasa validacion por parte de la comunidad en el momento de la consulta.
- No se han publicado evaluaciones independientes de precision del lematizador sobre corpus de referencia; las metricas de la model card son ejemplos ilustrativos.
- Al depender de una extension Rust compilada, la instalacion puede requerir toolchain de compilacion segun la plataforma, lo que complica entornos sin permisos de build.

## Enlaces

- Hugging Face: https://huggingface.co/veripazari/durak
- Repositorio original en GitHub: https://github.com/cdliai/durak
- Repositorio del autor de la integracion continua: https://github.com/fbkaragoz/durak
- Paquete PyPI: https://pypi.org/project/durak-nlp/
- Documentacion de arquitectura: https://github.com/cdliai/durak/blob/main/docs/ARCHITECTURE.md
- Licencia: https://github.com/cdliai/durak/blob/main/LICENSE
- DOI en Zenodo: https://doi.org/10.5281/zenodo.17477942
- Plataforma VeriPazari: https://veripazari.com.tr
