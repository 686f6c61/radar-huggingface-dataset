# TBOGamer22/nemo-sindhi-g2p-conformer

## Resumen

El modelo `nemo-sindhi-g2p-conformer` es un sistema de conversión de grafemas a fonemas (G2P) para el sindhi paquistaní, desarrollado por Talha Bin Omar sobre el framework NVIDIA NeMo. Su función es transformar texto en escritura sindhi (alfabeto árabe adaptado) en cadenas de fonemas IPA de tipo ancho, lo que lo convierte en una herramienta de preprocesado para síntesis de voz (TTS), creación de léxicos de pronunciación y control de calidad de corpus de habla.

El modelo emplea una arquitectura Conformer con decodificación CTC a nivel de carácter, con 8 capas de encoder, dimensión de modelo 192 y 4 cabezas de atención. Es un modelo compacto (0.1 GB en el repositorio) y ligero, pensado para integrarse en pipelines de procesamiento de texto sin requerir hardware especializado. Se publica bajo licencia MIT, lo que permite uso comercial sin restricciones.

La relevancia de este modelo radica en que cubre una lengua poco representada en las herramientas de procesamiento de lenguaje natural, y forma parte de una familia de modelos G2P para lenguas de Pakistán que busca crecer de forma consistente. Sus métricas de validación son muy buenas en el dominio de entrenamiento, con una tasa de error de fonemas (PER) inferior al 1.1% en el conjunto de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (encoder de 8 capas, dimension 192, 4 cabezas de atencion, kernel de convolucion 15) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | maxima longitud de fuente repetida para CTC: 768 caracteres |
| Tipos de cuantizacion | no disponible (formato NeMo nativo, probablemente FP32/FP16) |
| Idiomas soportados | sindhi (sd), variante paquistani |
| Licencia | MIT |
| Formato de pesos | NeMo (.nemo), checkpoint PyTorch (.ckpt), configuracion YAML |

## Arquitectura y entrenamiento

El modelo es un clasificador CTC basado en la arquitectura Conformer, que combina capas de atencion multi-cabeza con convoluciones profundas para capturar dependencias locales y globales en la secuencia de entrada. La entrada son caracteres del alfabeto sindhi y la salida son fonemas IPA de tipo ancho. Para el entrenamiento se utiliza una repeticion de la fuente de 3 (cada caracter se repite tres veces antes de la capa CTC) y una longitud maxima de secuencia repetida de 768 caracteres.

No se han publicado detalles sobre el dataset de entrenamiento (numero de tokens, composicion o procedencia de los datos). El entrenamiento se detuvo tras la validacion de la epoca 11, y el checkpoint con mejor PER de validacion (1.1322%) se selecciono como version final. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion, ya que se trata de un modelo supervisado de clasificacion de secuencias.

## Capacidades

- Conversion de texto sindhi (escritura arabe adaptada) a cadenas de fonemas IPA de tipo ancho.
- Preprocesado de texto para sistemas TTS, generando la pronunciacion fonetica necesaria para sintetizadores.
- Bootstrapping de etiquetas de pronunciacion para construir lexicos o diccionarios foneticos.
- Verificacion de consistencia G2P en corpus de habla, detectando discrepancias entre grafia y pronunciacion esperada.
- Soporte de inferencia por lotes desde archivos de texto UTF-8, con salida en formato JSON.
- Capacidad de ejecucion en CPU o GPU, con un script de inferencia que descarga el modelo directamente desde Hugging Face si no esta presente localmente.
- No es un modelo de lenguaje general ni un sistema ASR; su unica funcion es la transcripcion grafema-fonema.

## Casos de uso

- Preprocesado de texto para sintesis de voz en sindhi: el modelo convierte cada oracion en su representacion fonetica IPA, que puede alimentar a un vocoder o a un modelo acustico basado en fonemas. Su baja tasa de error (PER 1.07% en test) garantiza pronunciaciones correctas en la mayoria de los casos.
- Creacion de lexicos de pronunciacion para sistemas de reconocimiento de habla: a partir de listas de palabras en sindhi, se generan automaticamente las transcripciones foneticas necesarias para entrenar modelos ASR basados en lexico.
- Control de calidad de corpus de habla: comparando las transcripciones foneticas generadas por el modelo con las anotaciones manuales, se pueden detectar errores de etiquetado o inconsistencias en la pronunciacion de los locutores.
- Desarrollo de herramientas educativas de pronunciacion: aplicaciones de aprendizaje de sindhi pueden usar el modelo para mostrar la pronunciacion IPA de cualquier palabra o frase introducida por el usuario.
- Normalizacion de texto para sistemas de texto a voz en entornos multilingues: junto con otros modelos de la familia G2P (como el de pashto), permite construir pipelines de TTS que cubran varias lenguas de Pakistan con una misma infraestructura.
- Investigacion linguistica sobre el sindhi: el modelo puede servir como base para estudios de variacion dialectal o para generar datos foneticos a partir de corpus textuales sin necesidad de anotacion manual.

## Benchmarks y rendimiento

Los resultados publicados en la model card se refieren al conjunto de prueba retenido (392 filas). No se proporcionan comparaciones con otros modelos G2P para sindhi ni con sistemas alternativos.

| Metrica | Valor |
|---|---|
| Mejor PER de validacion | 1.1322% |
| PER ponderado en test | 1.0743% |
| Precision de fonemas en test (1 - PER) | 98.9257% |
| WER de palabras foneticas en test | 2.7168% |
| Precision de palabras foneticas en test (1 - WER) | 97.2832% |
| Coincidencias exactas por emision | 352 / 392 (89.7959%) |
| PER medio por fila en test | 0.7760% |
| PER mediana por fila en test | 0.0000% |

La PER se calcula como la distancia de Levenshtein a nivel de caracter dividida por el numero de caracteres IPA de referencia. El PER ponderado agrega ediciones y unidades de referencia en todo el conjunto de test.

## Requisitos de hardware

- El modelo es muy ligero (0.1 GB en disco). La inferencia se puede ejecutar en CPU sin problemas; el script de ejemplo incluye la opcion `--device cpu`.
- Para GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente, incluyendo GPUs consumer como la GTX 1650 o la RTX 3050.
- No se han publicado mediciones de latencia o throughput. Dado el tamano del modelo, se espera que la inferencia por frase sea del orden de milisegundos en CPU y sub-milisegundos en GPU.
- El despliegue se realiza mediante el script `inference.py` incluido en el repositorio, que soporta inferencia local o descarga desde Hugging Face. Tambien es posible integrar el modelo en pipelines NeMo existentes.
- No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje generativo.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos G2P comparables para sindhi en la documentacion proporcionada. El propio autor menciona una familia de modelos para lenguas de Pakistan (con un modelo de pashto ya publicado), pero no ofrece datos comparativos de rendimiento entre ellos. Por tanto, no es posible realizar una comparativa objetiva en este momento.

## Limitaciones y advertencias

- Las salidas son transcripciones IPA de tipo ancho, no foneticas estrechas; no capturan variaciones alofonicas finas.
- El modelo puede fallar con nombres propios, abreviaturas, numeros, texto con mucha puntuacion, ortografias raras y codigo alternado (code-switching).
- La variacion dialectal y ortografica del sindhi paquistani no esta completamente representada en el entrenamiento.
- El modelo solo procesa texto; no tiene acceso a audio durante la inferencia.
- Las metricas de PER muy bajas en el dominio de entrenamiento pueden no transferirse a corpus no relacionados o a dialectos diferentes.
- Se recomienda revision humana de las salidas en aplicaciones de alto riesgo o con fines linguisticos academicos.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre la exactitud en todos los escenarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TBOGamer22/nemo-sindhi-g2p-conformer
- Coleccion de la familia G2P de lenguas de Pakistan: https://huggingface.co/collections/TBOGamer22/pakistani-languages-g2p-family-6a80b528dec2241021bed73e
- Modelo G2P de pashto (relacionado): https://huggingface.co/TBOGamer22/nemo-pashto-g2p-conformer
