# Voldorn/emotion2vec-plus-large-onnx

## Resumen

emotion2vec-plus-large-onnx es una exportación a formato ONNX del modelo de reconocimiento de emociones en habla emotion2vec+ large. Lo publica el usuario Voldorn y no constituye un modelo nuevo: se trata de la conversión de los mismos pesos de [emotion2vec/emotion2vec_plus_large](https://huggingface.co/emotion2vec/emotion2vec_plus_large) (revisión `6c303ba987b86b93193de93e34bb2b077a6bedc4`) para poder ejecutarse en ONNX Runtime sin depender de PyTorch ni de FunASR. El crédito del modelo original corresponde a Ziyang Ma y colaboradores (emotion2vec) y al ecosistema FunASR de Alibaba Group.

El modelo resuelve una tarea de clasificación de audio: recibe una señal de voz mono a 16 kHz y devuelve una distribución de probabilidad sobre nueve etiquetas de emoción (angry, disgusted, fearful, happy, neutral, other, sad, surprised, unknown). El grafo ONNX incorpora internamente lo que el método `Emotion2vec.inference` de FunASR realiza en modo `granularity="utterance"`: normalización del audio (media y varianza sobre la señal completa), extracción de frames, promedio temporal, capa `proj` y softmax.

Su relevancia actual es práctica: empaqueta un modelo de representación emocional del habla en un único artefacto ONNX portable, lo que simplifica el despliegue en entornos donde no se quiere arrastrar el stack de PyTorch. El repositorio ocupa aproximadamente 0,6 GB y el autor documenta el proceso de exportación, incluida una verificación numérica frente a FunASR 1.4.16 con una diferencia máxima de 2,9e-6 en las probabilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer auto-supervisado (emotion2vec) con atencion con sesgo ALiBi; el grafo incluye extraccion de frames, promediado, capa `proj` y softmax |
| Parametros totales | no disponible (el autor no publica el recuento; el repositorio ocupa ~0,6 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Entrada de audio de duracion variable; el informe de exportacion valida de 0,5 s a 30 s. Ventana en tokens no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye el grafo ONNX `emotion2vec_plus_large.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | FunASR Model Open Source License (`funasr-model-license`), heredada del modelo original |
| Formato de pesos | ONNX (`emotion2vec_plus_large.onnx`), entrada float32 (1, N) mono a 16 kHz en rango -1 a 1; salida (1, 9) |

## Arquitectura y entrenamiento

El modelo base emotion2vec+ large es un sistema de representacion auto-supervisada para emocion en habla, descrito en el articulo *emotion2vec: Self-Supervised Pre-Training for Speech Emotion Representation* (arXiv:2312.15185). La arquitectura emplea atencion con sesgo ALiBi; durante la exportacion, el autor sustituye el calculo del sesgo ALiBi que FunASR guarda en una cache de tamano fijo por una version que lo calcula a partir del tamano de la entrada, manteniendo resultados equivalentes (diferencia maxima de 2,9e-6 en las probabilidades). No se detallan en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset original.

Esta ficha corresponde a una conversion, no a un entrenamiento nuevo: no hay RLHF, DPO ni ajuste adicional. La unica modificacion de codigo documentada es el calculo dinamico del sesgo ALiBi durante el export. El grafo reproduce el flujo de inferencia del modo `utterance` de FunASR (normalizacion global, extraccion y promedio de frames, capa `proj`, softmax) y almacena las etiquetas en los metadatos ONNX.

## Capacidades

- Clasificacion de emociones en habla: devuelve probabilidades sobre nueve clases (angry, disgusted, fearful, happy, neutral, other, sad, surprised, unknown).
- Procesamiento de audio mono a 16 kHz con amplitudes normalizadas entre -1 y 1.
- Inferencia a nivel de enunciado (`granularity="utterance"`): una prediccion por clip de audio.
- Ejecucion sin PyTorch: el grafo es autonomo en ONNX Runtime.
- Entrada de duracion variable, validada entre 0,5 s y 30 s segun el informe de exportacion.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio generativo ni reconocimiento de habla (solo clasificacion emocional).
- No se documentan capacidades multilingues especificas.

## Casos de uso

- Analitica de experiencia de cliente en call centers: transcribir o segmentar llamadas y clasificar la emocion del interlocutor por turno para detectar insatisfaccion. Es adecuado porque procesa audio crudo de 16 kHz sin necesidad de PyTorch y se integra como paso ONNX en un pipeline existente.
- Moderacion de contenido en plataformas de audio: etiquetar clips subidos (podcasts, notas de voz) por tono emocional para priorizar revisiones humanas.
- Monitorizacion de bienestar en asistentes de voz: detectar senales de tristeza o miedo en interacciones conversacionales, siempre como componente auxiliar y no diagnostico.
- Investigacion en psicologia y linguistica: generar etiquetas emocionales automaticas sobre corpus de habla para estudios a gran escala, aprovechando la portabilidad del formato ONNX.
- Sistemas de agentes de voz: usar la salida emocional como senal adicional para modular la respuesta de un asistente (por ejemplo, adoptar un tono mas empatico cuando se detecta `sad`).
- Despliegue en el borde (edge): ejecutar la clasificacion en dispositivos o servidores sin GPU y sin el stack de FunASR, gracias a la baja huella del grafo (~0,6 GB) y a ONNX Runtime.
- Preprocesado en pipelines MLOps: encapsular la clasificacion como microservicio independiente del framework de entrenamiento original, facilitando versionado y compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta la verificacion de equivalencia entre el grafo ONNX y el codigo de PyTorch/FunASR: diferencia maxima de 2,9e-6 en las probabilidades, comprobada en seis duraciones de audio (de 0,5 s a 30 s).

## Requisitos de hardware

- Inferencia en CPU: viable; el grafo ONNX ocupa aproximadamente 0,6 GB en disco y puede ejecutarse en CPU mediante ONNX Runtime.
- VRAM estimada: no disponible de forma oficial; como referencia, el archivo de pesos ronda los 0,6 GB, a lo que hay que sumar la memoria de activaciones segun la duracion del audio (estimacion, no dato del autor).
- GPU recomendadas: no requiere GPU. Cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT) puede acelerar la inferencia, incluidas tarjetas de gama media.
- Compatibilidad con GPU de consumo: si, cabe ampliamente en cualquier GPU de consumo e incluso en hardware integrado, dado el reducido tamano del modelo.
- Opciones de despliegue: ONNX Runtime (CPU/CUDA), integracion con FunASR, y conversion a otros runtimes (TensorRT, OpenVINO) por ser un grafo estandar ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Requiere PyTorch | Salida | Licencia |
|---|---|---|---|---|
| Voldorn/emotion2vec-plus-large-onnx (este) | ONNX | No | 9 clases de emocion | FunASR Model Open Source License |
| emotion2vec/emotion2vec_plus_large (original) | Pesos PyTorch / FunASR | Si | 9 clases de emocion | FunASR Model Open Source License |
| Otras variantes de emotion2vec (por ejemplo, base) | Pesos PyTorch / FunASR | Si | Clasificacion de emocion | FunASR Model Open Source License |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. Alternativas de reconocimiento de emociones en habla de otros autores: no disponible.

## Limitaciones y advertencias

- Riesgo de alucinacion no aplica en el sentido generativo (es un clasificador); el riesgo equivalente es la clasificacion erronea de la emocion, especialmente en audio con ruido, solapamiento de hablantes o emociones mixtas.
- Sesgos conocidos: no documentados en la informacion disponible; al depender de un corpus de entrenamiento no detallado, puede presentar sesgos de idioma, acento, genero o cultura no cuantificados aqui.
- Limitaciones de contexto: la clasificacion opera a nivel de enunciado completo; no ofrece granularidad por frame ni deteccion de cambios emocionales intra-utterance.
- Idiomas soportados: no especificados; se desconoce su cobertura multilingue real.
- Licencia: se rige por la FunASR Model Open Source License (heredada del modelo original). Es una licencia personalizada, no una licencia estandar de codigo abierto ni Creative Commons; conviene revisar el archivo `LICENSE` antes de cualquier uso comercial.
- Trazabilidad: es una conversion de terceros (autor Voldorn), no una publicacion oficial de los creadores de emotion2vec; aunque se documenta la equivalencia numerica, la responsabilidad del artefacto recae en el exportador.
- Advertencia etica: las predicciones emocionales no deben usarse para diagnostico clinico ni para decisiones automatizadas con impacto en personas sin supervision humana.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que su validacion por la comunidad es limitada.

## Enlaces

- Modelo ONNX: https://huggingface.co/Voldorn/emotion2vec-plus-large-onnx
- Modelo base: https://huggingface.co/emotion2vec/emotion2vec_plus_large
- Paper emotion2vec: https://arxiv.org/abs/2312.15185
- Repositorio FunASR (Alibaba Group): https://github.com/modelscope/FunASR
