# Ulumanshu/amp-speech-lt-tts-models

## Resumen

El repositorio `Ulumanshu/amp-speech-lt-tts-models` no es un modelo unico, sino un paquete de entrega (handover) que agrupa todos los checkpoints entrenados en el proyecto amp-speech para sintesis de voz (TTS) en lituano. Lo publica el usuario Ulumanshu e incluye tanto modelos ESPnet2 VITS (entrada fonemica y entrada por caracteres) como modelos Coqui VITS, con sus estados de entrenador completos. Ocupa 7,6 GB y su proposito declarado es la reproducibilidad: evitar repetir un entrenamiento de 84,5 GPU-horas.

El modelo principal del paquete es un ESPnet2 VITS con entrada fonemica, entrenado sobre 1.268 horas de audio en lituano durante 1000 epocas (1.000.000 de iteraciones). El autor anade una continuacion con annealing de la tasa de aprendizaje hasta la epoca 1125 y conserva el punto de partida exacto (`init_from_old.pth`) que se uso para inicializar el modelo fonemico a partir de un modelo de caracteres previo de 617 epocas. Ademas, se incluyen dos etapas de Coqui VITS: la etapa A, recomendada por el autor para escuchar, y la etapa B, con 1.656 voces, conservada como evidencia de que una mejor `loss_mel` no implica mejor calidad percibida.

Es relevante porque el lituano es un idioma con pocos recursos en TTS abierto y porque el paquete documenta de forma inusualmente honesta los compromisos entre metrica objetiva y evaluacion subjetiva, ademas de advertir explicitamente de checkpoints que no deben desplegarse. No se trata de un modelo listo para produccion con API, sino de pesos de investigacion para reanudar o auditar una linea de entrenamiento concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESPnet2 VITS y Coqui VITS (TTS end-to-end, generativo adversarial con encoder de texto, decoder y discriminador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de sintesis de voz a partir de texto, sin ventana de contexto autorregresiva declarada) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints PyTorch sin cuantizar) |
| Idiomas soportados | lituano (lt) |
| Licencia | other (sin terminos detallados en la model card; requiere verificacion con el autor) |
| Formato de pesos | `.pth` (checkpoints de PyTorch de ESPnet2 y Coqui, algunos con estado completo del entrenador) |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end condicionada por texto que combina un encoder de texto, un encoder/decoder variacional con flujo normalizador, un decoder basado en HiFi-GAN y un discriminador multiperiodo, y que se entrena de forma conjunta mediante inferencia variacional y perdidas adversarias. En este paquete conviven dos implementaciones: ESPnet2 (con dos variantes de entrada, fonemica y por caracteres) y Coqui TTS (etapas A y B). La entrada fonemica del modelo ESPnet2 parte de un modelo de caracteres de 617 epocas, desde el cual el autor transfiere 1068 de 1070 tensores segun su informe.

Los datos de entrenamiento declarados son 1.268 horas de audio en lituano. El modelo fonemico principal se entreno durante 1000 epocas y 1.000.000 de iteraciones, con un coste de 84,5 GPU-horas, y cuenta con una continuacion con annealing de learning rate hasta la epoca 1125 (`1124epoch.pth`, `train.total_count.best.pth`). La etapa B de Coqui se entreno con 1.656 voces. No se especifican en la informacion disponible la composicion del dataset, el uso de RLHF/DPO (poco habitual en TTS) ni innovaciones de decodificacion especulativa. La innovacion documental destacable es la trazabilidad: cada carpeta indica su funcion en la cadena de experimentos y se conserva el estado del entrenador para reanudar.

## Capacidades

- Sintesis de voz en lituano a partir de texto, con dos opciones de entrada (fonemas o caracteres) en la rama ESPnet2.
- Generacion de audio con voces multiples: la etapa B de Coqui incluye 1.656 voces.
- Reanudacion y fine-tuning: varios checkpoints incluyen el estado completo del entrenador (`train.total_count.best.pth`, `checkpoint_341324.pth`, `checkpoint_17000.pth`).
- Reproducibilidad de experimentos: `init_from_old.pth` e `init_report.json` permiten replicar el arranque del modelo fonemico.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision ni audio-a-audio; son modelos TTS, no modelos de lenguaje.

## Casos de uso

- Investigacion en TTS para idiomas de bajos recursos: el paquete permite estudiar como se comporta VITS con 1.268 horas de lituano y comparar entrada fonemica frente a entrada por caracteres, reutilizando los checkpoints en lugar de repetir 84,5 GPU-horas.
- Reanudacion de experimentos de annealing: la carpeta `espnet_phoneme_anneal_ep1125` permite continuar una ejecucion en curso con su estado de optimizador, util para laboratorios con presupuesto de computo limitado.
- Analisis de correlacion entre metrica y percepcion: la pareja de etapas Coqui A y B (con `loss_mel` de 17,97 frente a 20,27 segun el autor) sirve como caso de estudio de por que una metrica objetiva no garantiza mejor calidad de audio.
- Generacion de voces sinteticas en lituano para prototipos: la etapa A de Coqui es la recomendada por el autor para escuchar, por lo que es el punto de partida logico para demos de lectura de texto en lituano.
- Auditoria de transferencia de pesos: `init_report.json` documenta la transferencia de 1068 de 1070 tensores desde el modelo de caracteres, util para estudiar tecnicas de inicializacion entre arquitecturas de entrada distintas.
- Construccion de datasets sinteticos en lituano: el modelo fonemico permite aumentar corpus de audio para entrenar reconocedores de voz u otros sistemas, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta una metrica de entrenamiento, `loss_mel`, y el autor advierte explicitamente de que solo es comparable dentro de una misma configuracion.

| Metrica | Valor | Contexto |
|---|---|---|
| `loss_mel` etapa B (Coqui, 1.656 voces) | 17,97 | Segun el autor, mejor valor numerico pero peor resultado al escuchar |
| `loss_mel` etapa A (Coqui, comparacion) | 20,27 | Valor de referencia citado por el autor para la etapa A |
| Horas de audio de entrenamiento | 1.268 h | Modelo ESPnet2 fonemico |
| Epocas / iteraciones | 1000 epocas / 1.000.000 iteraciones | Modelo ESPnet2 fonemico |
| Coste de entrenamiento | 84,5 GPU-horas | Estimacion del autor, equivalente a 85-100 USD en A100 |

La busqueda web realizada no devolvio resultados relacionados con este modelo: los enlaces obtenidos tratan sobre poblaciones de tortugas gigantes y no guardan ninguna relacion con TTS ni con lituano.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publican recuentos de parametros ni perfiles de memoria. Los modelos VITS de este tipo suelen ser ligeros, pero no hay dato verificable en la informacion proporcionada.
- GPU recomendadas: el autor cita la A100 como referencia de coste para el entrenamiento (84,5 GPU-horas, 85-100 USD). Para inferencia no se especifica ninguna GPU.
- GPU de consumo: no disponible. No hay confirmacion de que quepa en una RTX 4090 u otras GPU de gama consumer, aunque el tamano del repositorio (7,6 GB) corresponde a los checkpoints, no a la memoria de inferencia.
- Opciones de despliegue: ESPnet2 (para las carpetas `espnet_*`) y Coqui TTS (para `coqui_stageA` y `coqui_stageB`). No aplican vLLM, TGI ni llama.cpp, que estan orientados a modelos de lenguaje y no a VITS.
- Descarga: `hf download Ulumanshu/amp-speech-lt-tts-models --local-dir ./models`, con la opcion de bajar una sola carpeta mediante `--include`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables en la informacion proporcionada. No se publican parametros, latencias, MOS ni resultados de benchmarks de este paquete frente a alternativas de TTS en lituano o multilingues, y la busqueda web no aporto ninguna fuente tecnica relacionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amp-speech-lt-tts-models | no disponible | no aplica | solo `loss_mel` (17,97 / 20,27) | other | HuggingFace, 0 descargas, 0 likes |
| Alternativas de TTS en lituano | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion consultada |

## Limitaciones y advertencias

- La licencia figura como `other` sin texto de terminos en la model card: antes de cualquier uso comercial hay que aclarar condiciones directamente con el autor. Los checkpoints de Coqui pueden estar sujetos ademas a la licencia de Coqui TTS, no declarada aqui.
- El autor advierte de no desplegar los ficheros `best_model*.pth` de las carpetas Coqui: se seleccionan solo por `loss_mel` y generan las mismas frases con una duracion 2-3 veces superior a la esperada. Deben usarse los `checkpoint_*.pth`.
- `loss_mel` solo es comparable dentro de una configuracion identica. La etapa B con 1.656 voces tiene una varianza intrinseca de mel mucho mayor que un modelo de una sola voz, por lo que su valor numerico no implica mejor calidad percibida.
- Cobertura linguistica limitada al lituano. No hay soporte multilingue ni cambio de idioma declarado.
- Es un repositorio de entrega de checkpoints, no un modelo empaquetado con pipeline, tokenizer listo para usar ni API. La integracion exige montar ESPnet2 o Coqui TTS por separado.
- Riesgo de alucinacion acustica y artefactos de sintesis propios de VITS: pronunciacion incorrecta en palabras fuera del dominio, prosodia inestable en frases largas y ruido en salidas con texto atipico. No hay evaluacion publicada de MOS ni de tasa de error de pronunciacion.
- No hay resultados de benchmarks, ni descargas, ni likes en el momento de la consulta, por lo que no existe validacion externa de la calidad del paquete.
- Sesgos de voz: se desconoce la distribucion de hablantes, acentos, edad y genero del corpus de 1.268 horas; la etapa B con 1.656 voces puede arrastrar sesgos de representacion no documentados.
- Los estados de entrenador incluidos tienen sentido para reanudar experimentos, pero no deben confundirse con pesos listos para inferencia si no se selecciona el checkpoint correcto.

## Enlaces

- HuggingFace: https://huggingface.co/Ulumanshu/amp-speech-lt-tts-models
- Repositorio de codigo con informes: referenciado en la model card como `TRAINING_REPORT.md` y `esp_net/FINAL_REPORT_LIEPA_FULL.md`, generados por el script `18_hf_handover.py`. No se proporciona URL publica en la informacion disponible.
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
