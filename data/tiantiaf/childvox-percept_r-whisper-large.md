# tiantiaf/childvox-percept_r-whisper-large

## Resumen

ChildVox-Percept_R-Whisper-Large es un modelo de clasificacion de audio desarrollado por Tiantian Feng y colaboradores de la University of Southern California (USC), presentado en el articulo "ChildVox: A Speech, Audio, and Large Audio-Language Model Benchmark in Understanding and Characterizing Sound across Childhood", aceptado en EMNLP 2026. El modelo realiza clasificacion binaria de segmentos de habla infantil para determinar si el fonema /ɹ/ (erre inglesa) se produce de forma rhotica o derhotica, una tarea relevante en logopedia y estudios del desarrollo fonologico infantil.

El modelo se construye sobre la arquitectura de OpenAI Whisper-large-v3, de la que se aprovecha el encoder para extraer representaciones acusticas, anadiendo una cabeza de clasificacion especifica. Se entrena sobre el dataset PERCEPT-R, un corpus a gran escala de grabaciones de ninos produciendo el fonema /ɹ/. El repositorio ocupa 0.3 GB en formato safetensors y se distribuye bajo licencia openrail. Es importante senalar que el modelo tiene restricciones explicitas de uso: no se permite uso comercial ni aplicaciones clinicas o diagnosticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-large-v3 (encoder) con cabeza de clasificacion lineal |
| Parametros totales | ~1.55 B (heredados de Whisper-large-v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2 segundos de audio (32 000 muestras a 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingue (modelo base), pero entrenado para habla infantil en ingles |
| Licencia | OpenRAIL |
| Formato de pesos | safetensors |
| Pipeline | audio-classification |

## Arquitectura y entrenamiento

El modelo utiliza el encoder de Whisper-large-v3 como extractor de caracteristicas acusticas. Whisper-large-v3 es un transformer encoder-decoder con atencion estandar, entrenado sobre 680 000 horas de audio multilingue. En este caso, el decoder no se utiliza: las representaciones del encoder se pasan a una cabeza de clasificacion que produce logits sobre dos clases (Derhotic y Rhotic). El modelo se entrena mediante fine-tuning supervisado sobre el dataset PERCEPT-R, que contiene segmentos de habla infantil con el fonema /ɹ/ etiquetados manualmente.

El proceso de entrenamiento sigue un esquema de validacion cruzada con 5 folds, y el repositorio permite cargar el modelo especificando el fold deseado (del 1 al 5). Los segmentos de audio se limitan a 2 segundos, ya que las palabras utilizadas en el entrenamiento son cortas. El audio debe prepararse a 16 kHz y en mono. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning clasico supervisado.

## Capacidades

- Clasificacion binaria de audio: distingue entre pronunciacion rhotica y derhotica del fonema /ɹ/ en habla infantil.
- Extraccion de embeddings: el modelo puede devolver las representaciones internas (embeddings) junto con los logits, util para tareas de analisis o transferencia.
- Procesamiento de audio corto: optimizado para segmentos de hasta 2 segundos, adecuado para palabras aisladas.
- Integracion con Hugging Face Hub: compatible con la API de transformers mediante model_hub_mixin.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un clasificador de audio.

## Casos de uso

- Investigacion en desarrollo fonologico infantil: el modelo permite automatizar la anotacion de grabaciones de ninos para estudiar la adquisicion del fonema /ɹ/, reduciendo el trabajo manual de logopedas e investigadores.
- Analisis de corpus de habla infantil: puede aplicarse a grandes colecciones de audio para etiquetar de forma consistente la presencia de rotacismo, facilitando estudios longitudinales o transversales.
- Evaluacion de intervenciones terapeuticas: en contextos de investigacion (no clinicos), el modelo puede medir cambios en la produccion de /ɹ/ antes y despues de sesiones de terapia, siempre con supervision humana experta.
- Creacion de datasets etiquetados: util para generar etiquetas preliminares en nuevos corpus de habla infantil que luego seran revisados por anotadores humanos.
- Educacion y formacion en logopedia: como herramienta didactica para que estudiantes de logopedia practiquen la identificacion de producciones rhoticas y derhotica.
- Investigacion en procesamiento de habla infantil: sirve como modelo de referencia (baseline) para comparar nuevas arquitecturas o tecnicas en la tarea de clasificacion de /ɹ/.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (accuracy, F1, etc.) sobre conjuntos de validacion o test. El articulo de ChildVox (arXiv:2605.29257) puede contener evaluaciones comparativas, pero no estan disponibles en los materiales proporcionados.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~1.55 B parametros en fp32, lo que requiere aproximadamente 6.2 GB de VRAM. Con cuantizacion a int8 o fp16, el requisito baja a ~3 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente (RTX 3060, RTX 4060, etc.). Para inferencia en lote, una A100 o H100 agilizaria el proceso, pero no es necesaria.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs consumer de gama media (RTX 3060 12 GB, RTX 4070, etc.) con cuantizacion o incluso en fp16.
- Opciones de despliegue: el modelo se carga mediante la API de transformers de Hugging Face. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponible. Dado el tamano del modelo y la corta duracion del audio (2 segundos), la inferencia deberia ser rapida en GPU moderna, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la informacion proporcionada. La tarea de clasificacion de /ɹ/ en habla infantil es muy especifica y no existen alternativas publicas conocidas con las mismas caracteristicas. Como referencia, el modelo base Whisper-large-v3 es un ASR generico que no realiza clasificacion de fonemas especificos, por lo que la comparativa no es aplicable.

## Limitaciones y advertencias

- Uso restringido: la model card prohibe explicitamente el uso comercial, aplicaciones clinicas o diagnosticas, vigilancia y cualquier uso que invada la privacidad.
- Datos sensibles: el habla infantil es altamente sensible. Cualquier uso debe cumplir con normativas de proteccion de datos y obtener aprobacion de comites de etica (IRB).
- Sin supervision clinica: el modelo no debe utilizarse para evaluaciones individuales del desarrollo sin revision de un experto humano.
- Limitacion temporal: el audio se limita a 2 segundos, por lo que no es adecuado para habla continua o frases largas.
- Sesgos potenciales: no se documentan sesgos especificos, pero al entrenarse sobre un dataset concreto (PERCEPT-R), puede no generalizar bien a otros acentos, dialectos o rangos de edad no representados.
- Riesgo de alucinacion: no aplica, ya que no es un modelo generativo.
- Idioma: aunque el modelo base es multilingue, la tarea de clasificacion se ha entrenado sobre habla infantil en ingles; su rendimiento en otros idiomas no esta garantizado.

## Enlaces

- HuggingFace: https://huggingface.co/tiantiaf/childvox-percept_r-whisper-large
- Repositorio GitHub: https://github.com/tiantiaf0627/childvox-release
- Articulo arXiv: https://arxiv.org/abs/2605.29257
- PDF del articulo: https://arxiv.org/pdf/2605.29257
- Pagina del proyecto: https://tiantiaf0627.github.io/childvox/
- Coleccion ChildVox en HuggingFace: https://huggingface.co/collections/tiantiaf/childvox
