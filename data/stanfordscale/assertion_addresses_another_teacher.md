# StanfordSCALE/assertion_addresses_another_teacher

## Resumen

`StanfordSCALE/assertion_addresses_another_teacher` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto EduBehaviors, un conjunto de esquemas basados en aserciones para la codificacion auditable de discurso en el aula. El modelo resuelve una tarea muy concreta: determinar si un enunciado de un docente se dirige a otro docente. Se enmarca en un ecosistema mas amplio de clasificadores que descomponen el analisis del discurso educativo en aserciones verificables, consumibles a traves del paquete Python `EduBehaviors-kit`.

Tecnicamente se trata de un modelo SetFit: un cuerpo de sentence transformer (`sentence-transformers/paraphrase-mpnet-base-v2`, arquitectura MPNet) sobre el que se entrena de forma contrastiva y al que se le anade una cabeza de regresion logistica. El conjunto resultante tiene 109.486.464 parametros y un peso de repositorio de aproximadamente 0,4 GB. La etiqueta positiva es extremadamente rara: la tasa base es del 0,6 % global (0,7 % en train, 0,8 % en dev, 0,5 % en test).

Su relevancia es fundamentalmente metodologica y de investigacion: demuestra un flujo de anotacion con LLM y entrenamiento ligero para codificar comportamientos educativos a escala. No obstante, el propio autor advierte que el rendimiento en test (F1 de 0,1765 para la clase positiva) es insuficiente para usarlo de forma autonoma en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit (cuerpo sentence transformer MPNet + cabeza LogisticRegression) |
| Parametros totales | 109.486.464 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la arquitectura MPNet subyacente admite hasta 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Libreria | setfit |
| Pipeline | text-classification |
| Tamano del repositorio | 0,4 GB |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit, disenado para clasificacion de texto con pocos datos etiquetados. En una primera fase contrastiva se ajusta el cuerpo (`paraphrase-mpnet-base-v2`, un MPNet afinado para similitud semantica) con un learning rate de 2e-05, batch size de 16, 10 epocas y un maximo de 5000 pasos, con precision mixta activada en GPU. En una segunda fase se entrena una cabeza de regresion logistica con learning rate 0,01, batch size 32 y un maximo de 100 pasos de evaluacion. La semilla es 20260904. El texto de entrada se construye simplemente con el enunciado (`{utterance}`), sin plantilla adicional.

Los datos de entrenamiento proceden de un subconjunto anotado por LLM del TalkMoves Dataset, compuesto exclusivamente por enunciados de docentes. El reparto es de 13.182 ejemplos de train (53,3 %), 3.293 de dev (13,3 %) y 8.240 de test (33,3 %). Las etiquetas no provienen de codificadores humanos, sino de anotadores LLM, y la concordancia medida con alfa de Krippendorff es de 0,647 para esta asercion. La tarea esta fuertemente desbalanceada, con una tasa base del 0,6 % global y tan solo un 0,5 % en el split de test.

## Capacidades

- Clasificacion binaria de texto: devuelve 1 si el enunciado se dirige a otro docente y 0 en caso contrario, con probabilidades calibradas mediante `predict_proba`.
- Deteccion de una asercion especifica (`td__the_utterance_addresses_another_teacher`) dentro del conjunto top-down `td` de EduBehaviors.
- Integracion con el paquete Python `EduBehaviors-kit` para codificacion auditable de discurso en el aula.
- Orientado a analisis de habla docente; no cubre habla de estudiantes (sin probar en ese dominio).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto, solo puntuaciones de clasificacion.
- Capacidades multilingues: solo ingles.

## Casos de uso

- Analisis de discurso educativo a escala: procesar transcripciones de aula para marcar que enunciados del docente estan dirigidos a otros docentes, como primer paso de un pipeline de codificacion de comportamientos educativos.
- Investigacion en ciencias de la educacion: generar variables codificadas de forma automatica para estudios sobre interaccion docente y coordinacion entre profesores en el aula.
- Anotacion asistida por LLM con validacion: usar el clasificador como componente de un flujo donde se combinan anotaciones de LLM y comprobacion humana, aprovechando su alta precision relativa en el umbral por defecto.
- Filtrado previo de transcripciones: descartar rapidamente segmentos que no contienen interaccion entre docentes antes de aplicar modelos mas costosos.
- Componente dentro de esquemas de codificacion auditables: al formar parte de un conjunto de aserciones independientes, permite reconstruir categorias de comportamiento mas amplias mediante reglas logicas.
- Analisis de formacion docente: detectar patrones de comunicacion entre docentes en sesiones de desarrollo profesional grabadas y transcritas.
- Pipeline de investigacion reproducible: integrarse en notebooks o scripts que consumen el resto de clasificadores EduBehaviors sobre el mismo corpus TalkMoves.
- Analisis retrospectivo de corpus historicos: al ser un modelo pequeno, permite procesar grandes volumenes de transcripciones con recursos limitados.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.293 | 0,8 % | 0,667 | 0,154 | 0,250 | 0,729 | 0,179 |
| test | 8.240 | 0,5 % | 0,250 | 0,136 | 0,1765 | 0,698 | 0,117 |

El ROC-AUC de 0,698 en test indica una capacidad discriminativa moderada por encima del azar, pero el F1 de 0,1765 sobre la clase positiva refleja un rendimiento pobre en un problema con una tasa base muy baja.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (109,5 M de parametros, aproximadamente 437 MB de pesos mas overhead de activaciones). El repositorio ocupa 0,4 GB.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Cabe en GTX 1650, RTX 3060, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna, y tambien en CPU sin problemas de latencia critica.
- Opciones de despliegue: la libreria `setfit` (referencia oficial), ecosistema Hugging Face Transformers, y exportacion a ONNX para inferencia optimizada. Al ser un clasificador de sentence transformers, es compatible con frameworks de embeddings habituales.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Dado el tamano del modelo, se espera una latencia de pocos milisegundos por muestra en GPU y de decenas de milisegundos en CPU, aunque no hay cifras declaradas por el autor.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo forma parte de una familia de clasificadores de aserciones del mismo proyecto (Stanford SCALE / EduBehaviors), cada uno entrenado sobre una asercion distinta, pero no se han facilitado datos de esos otros clasificadores ni de alternativas externas.

| Modelo | Parametros | Contexto | F1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| assertion_addresses_another_teacher | 109,5 M | no disponible | 0,1765 | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos; la concordancia entre anotadores es de alfa de Krippendorff de 0,647, lo que implica ruido de etiquetado inherente.
- El modelo se entreno unicamente sobre enunciados de docentes; su comportamiento sobre habla de estudiantes no esta probado.
- El F1 en test es de 0,1765 para la clase positiva. El propio autor indica explicitamente que el modelo no funciona lo bastante bien como para usarse por si solo.
- La precision cae de 0,667 en dev a 0,250 en test, lo que indica sensibilidad al reparto y riesgo de sobreajuste a las particularidades del conjunto de desarrollo.
- El recall es bajo en ambos splits (0,154 en dev, 0,136 en test): se pierden la mayoria de los casos positivos reales.
- La tasa base positiva es del 0,6 % global, de modo que incluso un clasificador trivial que prediga siempre negativo obtendria una exactitud alta; el F1 de la clase positiva es la metrica relevante.
- Solo soporta ingles; no hay soporte multilingue.
- La licencia no esta especificada, por lo que no se puede confirmar si el uso comercial esta permitido. Se debe contactar con el autor antes de cualquier despliegue comercial.
- No es un modelo generativo ni soporta tool calling ni agentes; cualquier expectativa en ese sentido es inaplicable.
- Alucinacion: al ser un clasificador, no genera texto, pero puede producir falsos positivos y falsos negativos con la distribucion descrita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StanfordSCALE/assertion_addresses_another_teacher
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio): https://github.com/SumnerLab/TalkMoves
- Libreria SetFit: https://github.com/huggingface/setfit
- Paquete EduBehaviors-kit: no disponible (referenciado en la model card sin enlace directo)
