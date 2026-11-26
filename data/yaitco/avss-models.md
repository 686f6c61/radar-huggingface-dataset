# YaItco/avss-models

## Resumen

AVSS-models es una colección de seis checkpoints para separación de fuentes de audio con dos hablantes, publicada por el autor YaItco como artefactos del proyecto de investigación HSE-project-avss. No es un modelo único ni un modelo de lenguaje: es un paquete de pesos entrenados para la tarea de separación de voz (speech separation), con variantes puramente auditivas (SepFormer, ConvTasNet) y variantes audiovisuales (AV SepFormer, AV ConvTasNet, CTCNet) que incorporan información de lectura de labios mediante un extractor de lipreading congelado.

Los modelos operan sobre audio mono a 16 kHz y clips cortos (en la validación, ventanas de 2 segundos con 32 000 muestras). Las variantes audiovisuales requieren además recortes de boca sincronizados de ambos hablantes, en formato NPZ con fotogramas en escala de grises de al menos 88x88 píxeles. Los tamaños van desde los 5,07 M de parámetros de ConvTasNet hasta los 44,9 M totales de AV SepFormer (de los cuales solo 8,58 M son entrenables, al permanecer congelado el extractor visual).

La relevancia de esta publicación es acotada pero clara: ofrece checkpoints con métricas de validación completas (SI-SNRi, SDRi, SDRi centrado, PESQ y STOI) sobre 5 000 mezclas del conjunto de validación AVSS, junto con configuración de inferencia autocontenida y procedencia de código registrada. Está pensada para reproducir resultados del proyecto y para investigadores que trabajen en separación audiovisual de habla, no para uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SepFormer, ConvTasNet y CTCNet (variantes audio-only y audiovisuales con extractor de lipreading congelado) |
| Parametros totales | 5.066.929 (convtasnet_200ep) a 44.937.658 (av_sepformer_200ep) segun subcarpeta |
| Parametros activos | No aplica (no es MoE); en variantes AV, parametros entrenables de 5.132.657 a 8.576.262 |
| Longitud de contexto | No aplica; clips de 2 s (32.000 muestras a 16 kHz) en la validacion |
| Tipos de cuantizacion | No disponible (pesos FP32 en `model.pth`) |
| Idiomas soportados | No disponible (tarea de separacion de voz, no ASR ni traduccion) |
| Licencia | No disponible |
| Formato de pesos | `model.pth` (state_dict de tensores CPU), `model.yaml`, `inference.yaml`, `training_config.yaml`, `metrics.json` |

## Arquitectura y entrenamiento

La coleccion agrupa tres familias arquitectonicas. SepFormer y ConvTasNet son modelos de separacion puramente auditivos basados en transformers y convoluciones temporales respectivamente. Las variantes AV anaden un extractor de lipreading congelado (`common/lipreading-extractor`) cuyos pesos se comparten en la inicializacion; en AV ConvTasNet y AV SepFormer los state dicts conservan los tensores originales del extractor congelado para carga estricta, mientras que CTCNet los toma del extractor comun al cargar. CTCNet combina informacion audiovisual con una arquitectura propia y se publica en su checkpoint final (step 172000), no por mejor validacion.

El entrenamiento se realizo sobre el dataset AVSS con presupuestos de 200 y 600 epocas segun la variante, aunque cada carpeta contiene el mejor checkpoint de validacion (epocas 186, 189, 199, 199 y 575 segun el modelo). Las metricas se midieron en FP32 sobre 5 000 mezclas de validacion AVSS. No se documentan en la informacion disponible el numero de tokens ni la composicion exacta del dataset de entrenamiento, ni si hubo etapas de RLHF o DPO (no aplicables a esta tarea). Como innovacion tecnica destacable, el paquete incluye `manifest.json` con recuentos de parametros, hashes de checkpoints origen, epocas seleccionadas y configuraciones; `verification.json` con una comprobacion de inferencia CPU FP32 por modelo (carga estricta, salidas finitas, longitudes y exportacion WAV FLOAT); y `code_provenance.json` con el commit del proyecto y hashes de fuentes.

## Capacidades

- Separacion de dos hablantes en mezclas de audio mono a 16 kHz.
- Separacion audio-only con SepFormer y ConvTasNet, sin necesidad de informacion visual.
- Separacion audiovisual con AV SepFormer, AV ConvTasNet y CTCNet, usando recortes de boca sincronizados de ambos hablantes.
- Extraccion de caracteristicas visuales mediante el extractor de lipreading congelado incluido en `common/`.
- Exportacion de predicciones a WAV con codificacion FLOAT en subcarpetas `s1` y `s2`.
- Calculo opcional de SI-SNRi durante la inferencia cuando se proporcionan las referencias `s1` y `s2`.
- Preservacion del orden de hablantes en las variantes AV (las salidas `s1`/`s2` siguen el orden de las bocas suministradas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio general ni capacidades multilingues: es un modelo de separacion de fuentes, no un modelo generativo de proposito general.

## Casos de uso

- Investigacion en separacion audiovisual de habla: reproducir los resultados del proyecto HSE-project-avss usando los checkpoints y configuraciones de inferencia incluidos, con metricas de validacion ya calculadas para comparar.
- Transcripcion de reuniones con dos participantes: separar las voces de una grabacion mono antes de pasarla a un sistema ASR, usando ConvTasNet o SepFormer audio-only si no hay video disponible.
- Videoconferencia y grabaciones con camara: emplear las variantes AV (AV ConvTasNet 600ep o CTCNet) cuando se dispone de recortes de boca sincronizados, aprovechando la mejora de SI-SNRi (13,45 y 13,42 frente a 11,93 de ConvTasNet audio-only).
- Preprocesado para diarizacion o identificacion de hablante: generar pistas separadas `s1`/`s2` como etapa previa a un pipeline de speaker verification, con el orden de hablantes preservado en las variantes AV.
- Evaluacion comparativa de arquitecturas de separacion: usar los seis checkpoints como linea base para medir el efecto de anadir informacion visual (audio-only frente a AV) y de ampliar el presupuesto de entrenamiento (200 frente a 600 epocas).
- Prototipado en entornos sin GPU: los checkpoints se cargan y verifican en CPU FP32, y el modelo mas pequeno (ConvTasNet, 5,07 M de parametros) es viable para pruebas de integracion en maquinas sin acelerador.
- Docencia y experimentacion con modelos audiovisuales: el paquete incluye el extractor de lipreading con su codigo fuente, JSON de arquitectura y licencia original, lo que facilita estudiar el pipeline completo.

## Benchmarks y rendimiento

Metricas de validacion sobre 5 000 mezclas AVSS en FP32, segun la model card:

| Modelo | Epoca/step | Parametros totales / entrenables | SI-SNRi | SDRi | SDRi centrado |
|---|---|---:|---:|---:|---:|
| sepformer_200ep | epoca 186 | 6.722.049 / 6.722.049 | 12,3296 | 12,6756 | 12,6790 |
| convtasnet_200ep | epoca 199 | 5.066.929 / 5.066.929 | 11,9349 | 12,3149 | 12,3175 |
| av_sepformer_200ep | epoca 189 | 44.937.658 / 8.576.262 | 12,6077 | -4,5868 | 13,2476 |
| av_convtasnet_200ep | epoca 199 | 41.494.053 / 5.132.657 | 12,8186 | 13,1862 | 13,1897 |
| av_convtasnet_600ep | epoca 575 | 41.494.053 / 5.132.657 | 13,4466 | 13,8048 | 13,8083 |
| ctcnet | step 172000 | 44.755.826 / 8.394.430 | 13,4247 | 13,8176 | 13,8210 |

Nota: AV SepFormer presenta un offset DC en el decodificador que hace negativo su SDRi bruto; el SDRi centrado lo corrige. Los pesos exportados conservan las predicciones originales sin postprocesado. Las metricas completas (incluidos PESQ y STOI) estan en `metrics.csv` y en el `metrics.json` de cada modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 5-45 M de parametros en FP32, el peso de los pesos es de decenas de MB, por lo que la VRAM dominante sera la de activaciones y lote.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) deberia acomodar los modelos, y A100/H100 solo serian necesarias para lotes grandes o procesamiento masivo.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de tarjetas con suficiente memoria para el lote; el modelo mas pequeno (ConvTasNet, 5,07 M) es el candidato mas claro.
- Opciones de despliegue: el proyecto usa `inference.py` con configuracion Hydra y descarga via `huggingface_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a esta tarea). Se verifica inferencia en CPU FP32.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | SI-SNRi (validacion AVSS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AVSS av_convtasnet_600ep | 41,5 M totales / 5,13 M entrenables | clips de 2 s, audio 16 kHz + bocas 88x88 | 13,4466 | no disponible | Hugging Face (YaItco/avss-models) |
| AVSS ctcnet | 44,8 M totales / 8,39 M entrenables | clips de 2 s, audio 16 kHz + bocas 88x88 | 13,4247 | no disponible | Hugging Face (YaItco/avss-models) |
| AVSS sepformer_200ep (audio-only) | 6,72 M | clips de 2 s, audio 16 kHz | 12,3296 | no disponible | Hugging Face (YaItco/avss-models) |
| AVSS convtasnet_200ep (audio-only) | 5,07 M | clips de 2 s, audio 16 kHz | 11,9349 | no disponible | Hugging Face (YaItco/avss-models) |

No se dispone en la informacion proporcionada de comparaciones con modelos externos de separacion de habla (por ejemplo, otros checkpoints de SpeechBrain o Asteroid); esos datos no estan disponibles.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue en produccion.
- No es un modelo de Transformers: los checkpoints usan las clases del proyecto HSE-project-avss y requieren el codigo en el commit `1e336c24b8fb5a47e4898948c353c94c5b851b81` o una revision posterior compatible.
- Disenado para exactamente dos hablantes; no se documenta comportamiento con mas fuentes ni con solapamiento parcial.
- Las variantes AV exigen recortes de boca sincronizados con el audio y con formato NPZ especifico (`data` con fotogramas `(F, H, W)`, H y W >= 88); la inferencia no remuestrea audio, por lo que la frecuencia debe ser 16 kHz.
- Los nombres de fichero de las variantes AV deben contener los dos IDs de boca separados por un guion bajo simple; los modelos audio-only aceptan nombres arbitrarios pero no preservan el orden de hablantes.
- AV SepFormer tiene un offset DC en el decodificador que invalida su SDRi bruto (negativo); debe usarse SDRi centrado para comparaciones justas.
- Riesgo de alucinacion y sesgos: no aplica en el sentido de modelos generativos, pero la calidad de separacion puede degradarse en condiciones acusticas o visuales distintas a las del dataset AVSS; no se documentan sesgos especificos.
- La validacion se limita a clips de 2 segundos; el comportamiento en grabaciones largas no esta documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada es 2026-11-26, lo que sugiere un artefacto muy reciente o con metadatos anomalos; conviene verificar la integridad antes de confiar en el.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YaItco/avss-models
- Repositorio del proyecto: https://github.com/Yaitco/HSE-project-avss
- Documentacion de descarga de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/download
- No se han encontrado en la informacion proporcionada papers, blogs, demos ni otros repositorios adicionales.
