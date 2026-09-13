# vineetkukreti/garhwali-hindi-mt-v2

## Resumen

Garhwali ↔ Hindi MT v2 es un modelo de traduccion automatica neuronal neuronales secuencia a secuencia desarrollado por el usuario de HuggingFace vineetkukreti, obtenido por ajuste fino de google/mt5-small (300.176.768 parametros) para traducir entre hindi (hi) y garhwali (gbm), ambas lenguas escritas en devanagari. El garhwali es una lengua pahari central hablada en Uttarakhand (India), con muy pocos recursos digitales, y este modelo forma parte de una linea de trabajo (v1 a v4) que documenta explicitamente el proceso de construccion de datos para lenguas de bajos recursos.

La version v2 se publico como baseline reproducible y, segun su propia model card, como "punto de datos aleccionador": fue entrenada con 19.982 pares generados a partir de 27 plantillas de frase fijas, lo que provoco un colapso de vocabulario fuera de esas plantillas. Sus metricas declaradas (BLEU 24,5 y chrF++ 68,4) estan infladas por el solapamiento de plantillas entre entrenamiento y test.

Es relevante ahora no como herramienta de produccion, sino como referencia metodologica: su fallo documentado motivo que la v3 redujese el corpus a 5.000 pares mas diversos y obtuviese mejores resultados, y que la v4 incorporase lexicos, textos de archivo y datos revisados por hablantes nativos. El modelo esta archivado, sin descargas relevantes (8 descargas, 0 likes) y dos generaciones por detras de la version activa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder denso (familia T5/mT5, text2text-generation) |
| Parametros totales | 300.176.768 (~300 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 64 tokens de entrada y 64 de salida como maximo durante el entrenamiento; el autor no declara contexto de inferencia distinto |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; los pesos se distribuyen en precision completa, repo de 1,2 GB) |
| Idiomas soportados | hindi (hi) y garhwali (gbm), ambos en escritura devanagari; la etiqueta de idioma de la ficha de HuggingFace solo lista "hi" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de google/mt5-small, un transformer encoder-decoder con atencion relativa y objetivos de tipo span corruption en su preentrenamiento multilingue. El fine-tune se realizo sobre la revision fijada `73fb5dbe4756edadc8fbe8c769b0a109493acf7a` del modelo base, sin cambios arquitectonicos declarados. El contrato de tarea exige el prefijo `"translate {Source} to {Target}: "`, y el autor indica que modificarlo define un experimento nuevo.

La configuracion de entrenamiento esta documentada en un manifiesto con hashes SHA-256 de la configuracion y de los splits: 12 epocas, learning rate 3e-4 con warmup ratio 0.05 y weight decay 0.01, batch de 8 con acumulacion de gradiente 4, optimizador adafactor con label smoothing 0.1 en bf16, longitud maxima de 64 tokens en origen y destino, y semilla 42. El mejor checkpoint se selecciono por chrF++ en lugar de por perdida. El corpus de entrenamiento consistio en 19.982 pares generados por expansion de 27 plantillas fijas, lo que constituye la innovacion metodologica mas citada de esta version: demostrar que el volumen sintetico sin diversidad produce colapso de vocabulario y una tasa de fuga de hindi (el modelo emite hindi en lugar de garhwali) del 22,1%. No se declara uso de RLHF ni de DPO.

## Capacidades

- Traduccion bidireccional hindi → garhwali y garhwali → hindi, condicionada al prefijo `translate {Source} to {Target}: `.
- Generacion de texto seq2seq sobre escritura devanagari, con decodificacion por beams (el ejemplo del autor usa `num_beams=4` y `max_new_tokens=128`).
- Traduccion fiable unicamente dentro del espacio de las 27 plantillas de entrenamiento; fuera de ellas se observa colapso de vocabulario.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara modo de razonamiento explicito ("thinking mode"), vision ni audio.
- Capacidad multilingue limitada al par hindi-garhwali; no se documenta transferencia a otras lenguas pahari pese a la etiqueta "pahari".
- Tasa de fuga de hindi del 22,1%: en mas de una quinta parte de los casos el modelo puede devolver texto en hindi en lugar de garhwali.

## Casos de uso

- Reproduccion de baselines de investigacion: el manifiesto de ejecucion incluye hashes de configuracion y splits, de modo que un grupo puede replicar exactamente el entrenamiento de 12 epocas y verificar las cifras declaradas de BLEU y chrF++.
- Estudio del colapso de vocabulario en lenguas de bajos recursos: sirve como control negativo frente a v3 y v4 para cuantificar cuanto se degrada un modelo entrenado con plantillas cerradas cuando se le presentan combinaciones lexicas no vistas.
- Analisis de la fuga de hindi como metrica de fallo: util para investigar por que un modelo multilingue ajustado hacia una lengua hermana de bajos recursos emite la lengua dominante, y para comparar tasas de fuga (38,5% en v1, 22,1% en v2, 11,2% en v3, 6,8% en v4).
- Traduccion de frases fijas en dominios muy cerrados: formularios, saludos o mensajes administrativos estandarizados que coincidan con las 27 plantillas de entrenamiento, siempre que la salida pase por revision humana.
- Evaluacion y calibracion de metricas para pahari: usar sus salidas como conjunto de referencia de baja calidad para comprobar la sensibilidad de BLEU y chrF++ frente a errores morfologicos sistematicos.
- Pruebas de integracion (smoke tests) de pipelines de traduccion: al ser compatible con los endpoints de HuggingFace (etiqueta `endpoints_compatible`), es util para validar el cableado de un servicio de traduccion antes de sustituir el modelo por la version activa.
- Docencia en linguistica computacional: ejemplo compacto (300 M de parametros, licencia Apache 2.0) para ilustrar el ciclo completo de construccion de un corpus sintetico, evaluacion y deteccion de metricas infladas.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la propia model card y corresponden a un test que comparte plantillas con el entrenamiento (evaluacion en distribucion de plantilla, no de dominio abierto).

| Metrica | Valor declarado |
|---|---|
| BLEU | 24,5 |
| chrF++ | 68,4 |
| Fuga de hindi (Hindi leakage) | 22,1% |
| Pares de entrenamiento | 19.982 (generados desde 27 plantillas fijas) |

Comparativa interna de la linea de modelos, segun los datos aportados por el autor:

| Version | Nombre | Datos | Pares | BLEU | chrF++ | Fuga de hindi | Estado |
|---|---|---|---|---|---|---|---|
| v1 | Classical Linguistic Baseline | gramatica de Chatak (1959) + semillas del Grierson LSI | 48 | 11,2 | 42,1 | 38,5% | deprecada |
| v2 | Synthetic Closed Template | 27 plantillas fijas generadas | 19.982 | 24,5 | 68,4 | 22,1% | archivada |
| v3 | Balanced Multi-Aspect Synthetic | 34 lotes tematicos (B-01…B-34) | 5.000 | 31,8 | 78,4 | 11,2% | candidata |
| v4 | Archival + Lexicon + Native Gold | diccionarios Dhyani/Benjwal, archivos, oro revisado por nativos | 8.642 | 36,4 | 83,9 | 6,8% | activa |

No se han publicado resultados de benchmarks comparativos con modelos de terceros en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni evaluaciones de traduccion externas).

## Requisitos de hardware

- VRAM estimada: pesos en fp32 aproximadamente 1,2 GB (tamano del repo); en bf16/fp16 unos 0,6 GB; en int8 unos 0,3 GB. Con un batch pequeno y 64 tokens de longitud, el pico de memoria en bf16 se mantiene por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas; se puede ejecutar comodamente en NVIDIA T4, RTX 3050, RTX 3060, RTX 4090 o superiores. Una A100 o H100 es innecesaria para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos ocho anos y tambien en CPU, dado el tamano de 300 M de parametros.
- Opciones de despliegue: transformers (referencia del autor), HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`), exportacion a ONNX mediante Optimum o TorchScript. La compatibilidad con vLLM, TGI, llama.cpp u Ollama no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados de modelos de terceros comparables, por lo que no es posible comparar rendimiento con alternativas externas. La unica comparacion disponible es interna a la propia linea de versiones (tabla de la seccion de benchmarks) y con el modelo base.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| garhwali-hindi-mt-v2 (este modelo) | ~300 M | 64 tokens en entrenamiento | hindi y garhwali | Apache 2.0 | archivado, 8 descargas |
| google/mt5-small (base) | ~300 M | modelo multilingue generico, sin garhwali especifico | multilingue (mT5) | Apache 2.0 | activo como base |
| garhwali-hindi-mt-v4 (misma linea) | no disponible | no disponible | hindi y garhwali | no disponible en la informacion | activo, BLEU 36,4 y fuga 6,8% |

Para cualquier uso real se recomienda evaluar la version activa (v4) de la misma linea, no esta v2.

## Limitaciones y advertencias

- El autor indica explicitamente: "Do not use in production" (no usar en produccion). El modelo esta archivado y superado por v4.
- Colapso de vocabulario fuera de las 27 plantillas de entrenamiento: aprendio formas de frase, no la lengua.
- Las metricas declaradas estan infladas por el solapamiento de plantillas entre entrenamiento y test; 24,5 de BLEU y 68,4 de chrF++ no deben leerse como calidad en dominio abierto.
- Fuga de hindi del 22,1%: riesgo alto de que la salida sea hindi y no garhwali, especialmente con terminologia fuera del corpus.
- Longitud maxima de 64 tokens por secuencia, lo que limita parrafos y documentos extensos.
- Posibles sesgos derivados de un corpus sintetico generado por plantillas y de fuentes linguisticas antiguas (gramatica de 1959, Linguistic Survey of India) usadas en la version previa de la linea.
- Riesgo de alucinacion morfologica: en versiones posteriores de la misma linea se documento salida fluida con morfologia de aspecto incorrecta por falta de revision nativa.
- La etiqueta de idioma de la ficha de HuggingFace solo declara "hi", aunque el modelo se usa para garhwali; conviene no fiarse de ese metadato para filtrar por idioma.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero la limitacion practica es la calidad, no la licencia.
- Uso etico y linguistico: al tratarse de una lengua minorizada, publicar traducciones automaticas no revisadas puede contribuir a fijar formas incorrectas en el corpus digital disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vineetkukreti/garhwali-hindi-mt-v2
- Modelo base: https://huggingface.co/google/mt5-small
- Revision fijada del modelo base: `73fb5dbe4756edadc8fbe8c769b0a109493acf7a` (indicada en el manifiesto de entrenamiento del autor)

La busqueda web realizada no devolvio enlaces relevantes para este modelo: los resultados se limitan a paginas de soporte y preguntas sobre Google Translate (descarga de la aplicacion, claves de API y comparativa entre API de pago y gratuita), sin relacion con el modelo ni con traduccion garhwali-hindi. No se han encontrado papers, repositorios de codigo ni demos adicionales en la informacion disponible.
