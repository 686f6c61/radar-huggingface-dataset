# tiantiaf/childvox-speechmaturity-whisper-base

## Resumen

ChildVox SpeechMaturity Whisper-Base es un modelo de clasificacion de audio desarrollado por Tiantian Feng y colaboradores en la Universidad del Sur de California (USC), presentado en el articulo "ChildVox: A Speech, Audio, and Large Audio-Language Model Benchmark in Understanding and Characterizing Sound across Childhood" (aceptado en EMNLP 2026 Main). El modelo clasifica vocalizaciones infantiles en cinco categorias: Canonical, Non-Canonical, Crying, Laughing y Junk, donde "Canonical" indica silabas maduras con transicion consonante-vocal y "Non-Canonical" vocalizaciones inmaduras como vocales o consonantes aisladas.

Se trata de un fine-tuning del encoder de Whisper-base de OpenAI sobre el dataset SpeechMaturity, un corpus a gran escala de vocalizaciones infantiles. El modelo se distribuye en cinco variantes (folds) para validacion cruzada y acepta segmentos de audio de un segundo a 16 kHz en mono. Su relevancia radica en que permite caracterizar el desarrollo del habla infantil de forma automatizada, con aplicaciones en investigacion del desarrollo del lenguaje y seguimiento de la produccion del habla con la edad.

La licencia es openrail, pero la model card restringe explicitamente el uso comercial y las aplicaciones clinicas o diagnosticas, lo que limita su despliegue en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-base (encoder-decoder transformer) adaptado para clasificacion de audio |
| Parametros totales | ~74 millones (basado en Whisper-base; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1 segundo de audio (16000 muestras a 16 kHz, mono) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingue (vocalizaciones infantiles; el modelo base Whisper soporta multiples idiomas) |
| Licencia | OpenRAIL (con restricciones: sin uso comercial, sin aplicaciones clinicas) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Whisper-base, una arquitectura transformer encoder-decoder desarrollada por OpenAI para reconocimiento de habla, y se adapta para la tarea de clasificacion de audio mediante un wrapper (WhisperWrapper) que extrae logits y embeddings de la representacion auditiva. El encoder de Whisper procesa el espectrograma Mel del audio de entrada y la salida se proyecta a un espacio de cinco clases de madurez vocal.

El entrenamiento se realizo sobre el dataset SpeechMaturity, un corpus a gran escala de vocalizaciones infantiles recopilado en el marco del benchmark ChildVox. El dataset cubre la trayectoria de desarrollo desde el nacimiento hasta la edad escolar e incluye sonidos fisiologicos, vocalizaciones no linguisticas, silabas canonicas y habla. El modelo se entrena con validacion cruzada de cinco pliegues (folds), y cada fold se publica por separado. No se especifican detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Clasificacion de vocalizaciones infantiles en cinco categorias: Canonical, Non-Canonical, Crying, Laughing y Junk.
- Distincion entre silabas maduras (con transicion consonante-vocal) e inmaduras (vocales o consonantes aisladas).
- Deteccion de llanto y risa como categorias independientes.
- Filtrado de segmentos no vocales (ruido, habla adulta, audio ininteligible) mediante la clase Junk.
- Extraccion de embeddings de audio ademas de logits de clasificacion (funcion return_feature).
- Soporte de inferencia en CPU y GPU mediante PyTorch.
- Cinco variantes de modelo (folds) para evaluacion robusta y reproduccion de resultados.

## Casos de uso

- Investigacion del desarrollo del lenguaje infantil: el modelo permite cuantificar la proporcion de silabas canonicas frente a no canonicas en grabaciones longitudinales, lo que facilita el estudio de hitos del desarrollo del habla en ninos de 0 a 5 anos.
- Seguimiento de la produccion del habla con la edad: al clasificar vocalizaciones en segmentos de un segundo, los investigadores pueden correlacionar la madurez vocal con la edad cronologica y detectar patrones de retraso o aceleracion.
- Analisis de grandes corpus de audio pediatrico: el modelo procesa grabaciones de larga duracion segmentadas en ventanas de un segundo, permitiendo el analisis automatico de miles de horas de audio sin anotacion manual.
- Caracterizacion de estados afectivos en bebes: la clasificacion de llanto y risa como categorias separadas permite estudiar la frecuencia y distribucion de estos comportamientos en contextos naturales o experimentales.
- Filtrado de audio en pipelines de investigacion: la clase Junk permite descartar segmentos que no contienen vocalizaciones infantiles, limpiando datasets antes de otros analisis acusticos o linguisticos.
- Evaluacion de intervenciones tempranas: programas de estimulacion del lenguaje pueden usar el modelo para medir cambios en la madurez vocal antes y despues de la intervencion, siempre con supervision de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos (accuracy, F1) en la informacion disponible de la model card. El articulo arXiv 2605.29257 presenta resultados del benchmark ChildVox en su conjunto, pero los numeros concretos para este modelo concreto no estan incluidos en los materiales proporcionados. Se recomienda consultar el paper para datos de evaluacion detallados.

## Requisitos de hardware

- VRAM estimada: al tratarse de Whisper-base (~74M parametros), la inferencia en FP32 requiere aproximadamente 300-400 MB de VRAM; en CPU es viable con 4-8 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060) es suficiente; no requiere GPU de datacenter.
- Compatibilidad con GPU de consumo: si, el modelo cabe en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: el modelo se carga mediante el wrapper WhisperWrapper del repositorio ChildVox (pip install -e .). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI; el despliegue se realiza via PyTorch estandar.
- Latencia y throughput: no disponible en la informacion proporcionada; para un segmento de 1 segundo, la inferencia en GPU deberia ser de decenas de milisegundos, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| childvox-speechmaturity-whisper-base | ~74M | Clasificacion de madurez vocal infantil | 1 s de audio | OpenRAIL (sin uso comercial) | HuggingFace |
| childvox-speechmaturity-whisper-large | ~1550M (Whisper-large) | Clasificacion de madurez vocal infantil | 1 s de audio | OpenRAIL (sin uso comercial) | HuggingFace |
| Wav2Vec2 fine-tuned (alternativa generica) | ~95M-300M | Clasificacion de audio | Variable | Apache 2.0 (depende del checkpoint) | HuggingFace |

No se dispone de comparativas publicadas con otros modelos de clasificacion de vocalizaciones infantiles en la informacion proporcionada. La alternativa mas directa es la variante Whisper-large del mismo proyecto ChildVox, que probablemente ofrece mayor precision a costa de mas recursos.

## Limitaciones y advertencias

- Prohibido el uso comercial: la model card indica explicitamente "No commercial use", lo que impide su integracion en productos o servicios de pago.
- Prohibido el uso clinico o diagnostico: no puede utilizarse para cribado de trastornos del desarrollo o del lenguaje, ni para evaluaciones individuales del desarrollo sin revision experta humana.
- Prohibido el uso en vigilancia o aplicaciones invasivas de privacidad.
- Los datos de habla infantil son altamente sensibles: los usuarios deben respetar la privacidad y el consentimiento de los ninos y familias cuyas grabaciones se procesan, obtener aprobacion del comite de etica (IRB) y cumplir la legislacion aplicable.
- Riesgo de alucinacion o clasificacion erronea en audio de baja calidad o con ruido de fondo, especialmente en la distincion entre vocalizaciones canonicas y no canonicas.
- El modelo solo acepta audio de 1 segundo a 16 kHz en mono; segmentos mas largos deben recortarse, lo que puede perder contexto.
- No se especifican metricas de rendimiento (accuracy, F1) en la model card, por lo que el rendimiento real en datos propios debe validarse.
- La licencia OpenRAIL incluye clausulas de uso responsable que pueden requerir revision legal antes de cualquier despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tiantiaf/childvox-speechmaturity-whisper-base
- Variante Whisper-large: https://huggingface.co/tiantiaf/childvox-speechmaturity-whisper-large
- Coleccion ChildVox en HuggingFace: https://huggingface.co/collections/tiantiaf/childvox
- Repositorio GitHub: https://github.com/tiantiaf0627/childvox-release
- Pagina del proyecto: https://tiantiaf0627.github.io/childvox/
- Articulo arXiv: https://arxiv.org/abs/2605.29257
- PDF del articulo: https://arxiv.org/pdf/2605.29257
