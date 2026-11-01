# timur777/singcheck-models

## Resumen

singcheck-models es una coleccion de seis redes neuronales exportadas a ONNX que constituyen el motor de procesamiento de audio de la aplicacion singcheck. No se trata de un unico modelo generativo, sino de un paquete de modelos especializados que se ejecutan localmente en el ordenador del usuario con ONNX Runtime para preparar una cancion de cara a la practica del canto: separacion de la voz del cantante, estimacion de la melodia, reconocimiento de las palabras con sus marcas temporales, alineamiento forzado de la letra, identificacion del hablante por linea y deteccion de pulsos ritmicos.

El repositorio lo publica el usuario timur777 y agrupa pesos procedentes de proyectos de investigacion consolidados (Demucs de Meta, CREPE, Parakeet TDT 0.6B v3 de NVIDIA, MMS_FA de torchaudio, ECAPA-TDNN de SpeechBrain y Beat This! de CPJKU). El paquete pesa aproximadamente 2,4 GB y los pesos de mayor tamano se almacenan en float16, convirtiendose a float32 al cargarse, de modo que se reduce a la mitad la descarga sin alterar los resultados.

Su relevancia radica en que demuestra un patron de despliegue de inferencia de audio totalmente local y sin conexion: ninguna muestra de audio sale del equipo del usuario. La contrapartida es una licencia heterogenea por fichero que, por la presencia de MMS_FA, restringe el conjunto completo a uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de seis redes especializadas (HTDemucs, CREPE, Parakeet TDT, wav2vec2 MMS_FA, ECAPA-TDNN, Beat This!) |
| Parametros totales | no disponible (Parakeet TDT 0.6B v3 aporta 0,6 mil millones; el resto no se detalla) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (audio procesado por ventanas; Beat This! trabaja en fragmentos de 1500 frames) |
| Tipos de cuantizacion | float16 en almacenamiento, convertido a float32 en carga; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (Parakeet TDT 0.6B v3 y MMS_FA son multilingues por diseno, pero no se enumeran idiomas) |
| Licencia | per-file (MIT, CC-BY-4.0, CC-BY-NC-4.0, Apache-2.0); el conjunto es no comercial por MMS_FA |
| Formato de pesos | ONNX (algunos con fichero `.data` asociado) |

## Arquitectura y entrenamiento

El paquete no entrena ningun modelo propio: exporta a ONNX redes ya entrenadas por terceros mediante el script `scripts/export_onnx.py` del proyecto singcheck, verificando cada exportacion contra el modelo original de PyTorch. Cada componente resuelve una tarea concreta: `htdemucs.onnx` implementa HTDemucs entre su STFT e iSTFT, con las convoluciones 1D reformuladas como 2D; `crepe_full.onnx` es CREPE en su variante completa para estimacion de tono; `parakeet-fp16w/` contiene Parakeet TDT 0.6B v3 junto con el preprocesador `nemo128.onnx` de onnx-asr; `mms_fa.fp16w.onnx` es el alineador MMS_FA basado en wav2vec2 con token estrella; `ecapa.onnx` es ECAPA-TDNN con su extractor Fbank para huellas de hablante; y `beat_this.onnx` es Beat This! (final0) sobre fragmentos de 1500 frames.

No se documentan en la informacion disponible los volumenes de datos de entrenamiento, la composicion de los datasets ni si hubo etapas de RLHF o DPO, algo esperable al tratarse de modelos de audio especializados y no de modelos de lenguaje. La innovacion tecnica destacable es el propio esquema de empaquetado: pesos en float16 convertidos a float32 en carga para reducir la descarga a la mitad manteniendo resultados identicos, y ejecucion integra con ONNX Runtime sin dependencia de PyTorch en produccion.

## Capacidades

- Separacion de fuentes vocales: aislamiento de la voz del cantante mediante HTDemucs.
- Estimacion de tono y melodia: seguimiento de la melodia cantada con CREPE full.
- Reconocimiento de voz con marcas temporales: transcripcion de palabras con timestamps mediante Parakeet TDT 0.6B v3.
- Alineamiento forzado de letra: ajuste exacto del inicio de cada palabra con MMS_FA.
- Identificacion de hablante: huella de voz por linea mediante ECAPA-TDNN para determinar quien canta cada fragmento.
- Seguimiento de pulsos: deteccion de beats con Beat This! para sincronizacion ritmica.
- Procesamiento local: toda la inferencia ocurre en el equipo del usuario con ONNX Runtime, sin envio de audio a servidores.
- Soporte de tool calling, agentes, razonamiento multi-paso, vision, audio generativo o modo thinking: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Aplicacion de karaoke o canto guiado: el paquete separa la voz original, extrae la melodia de referencia y detecta los pulsos para puntuar al usuario en tiempo real sobre su propia maquina.
- Generacion de pistas de practica: a partir de una cancion, se obtiene la pista instrumental (voz eliminada) y la linea melodica para que el cantante pueda ensayar sin conexion.
- Sincronizacion de letras tipo karaoke: el reconocimiento con timestamps de Parakeet combinado con el alineamiento forzado de MMS_FA produce el inicio exacto de cada palabra para resaltados precisos.
- Analisis de interpretacion vocal: la comparacion entre la melodia detectada por CREPE y la referencia permite evaluar afinacion y ritmo en una herramienta educativa de canto.
- Identificacion de turnos de voz en grabaciones musicales: ECAPA-TDNN asigna cada linea a un hablante, util en coros o duetos para segmentar la letra por interprete.
- Herramientas de analisis musical offline para investigadores: el conjunto permite experimentar con separacion, tono, alineamiento y beats en un unico pipeline ONNX reproducible y sin dependencias de nube.
- Preprocesado de datasets musicales en local: automatizacion de anotaciones (letra, tiempos, melodia, pulsos) sobre colecciones privadas sin salir del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma desglosada por modelo; el repositorio completo ocupa 2,4 GB en disco y los pesos se cargan en float32, por lo que la memoria en ejecucion supera ese tamano.
- GPU recomendadas: no disponibles; el diseno apunta a ejecucion local en el equipo del usuario mediante ONNX Runtime, sin especificar modelos de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el uso de ONNX Runtime sugiere posible ejecucion en CPU y en GPU de consumo, pero no se documentan requisitos minimos.
- Opciones de despliegue: ONNX Runtime como unico runtime documentado; los ficheros se obtienen una sola vez desde el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| singcheck-models | Paquete ONNX de audio (6 redes) | no disponible (Parakeet 0,6B incluido) | por ventanas de audio | per-file, conjunto no comercial | HuggingFace |
| Demucs (original) | Separacion de fuentes | no disponible | no aplica | MIT | GitHub |
| Parakeet TDT 0.6B v3 (original) | ASR | 0,6 mil millones | no disponible | CC-BY-4.0 | HuggingFace |
| MMS_FA (original) | Alineamiento forzado | no disponible | no aplica | CC-BY-NC-4.0 | torchaudio |

La comparativa directa con un unico modelo equivalente no es posible: singcheck-models es un agregado de modelos de tareas distintas, mientras que las alternativas de la tabla cubren cada una solo una de esas tareas.

## Limitaciones y advertencias

- Licencia no comercial: la inclusion de MMS_FA (CC-BY-NC-4.0) restringe el conjunto completo a uso no comercial, aunque componentes individuales tengan licencias permisivas.
- Licencias heterogeneas: cada fichero conserva su licencia upstream (MIT, CC-BY-4.0, Apache-2.0, CC-BY-NC-4.0), lo que exige revision juridica por componente si se reutiliza por separado.
- Ausencia de datos de rendimiento: no hay benchmarks publicados que permitan estimar calidad, latencia o robustez en produccion.
- Idiomas no documentados: aunque Parakeet y MMS_FA son multilingues por diseno, no se enumeran los idiomas soportados ni su calidad por idioma.
- Proposito acotado: no es un modelo de lenguaje; no ofrece generacion de texto, razonamiento, codigo ni tool calling.
- Dependencia de la aplicacion singcheck: el paquete se publica como soporte de esa aplicacion concreta y su mantenimiento futuro no esta garantizado.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.
- Riesgo de errores en tareas de audio: la separacion, el alineamiento y la deteccion de tono pueden fallar en grabaciones ruidosas o con polifonia densa, sin que se documenten tasas de error.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/timur777/singcheck-models
- Demucs: https://github.com/facebookresearch/demucs
- CREPE: https://github.com/marl/crepe
- torchcrepe: https://github.com/maxrmorrison/torchcrepe
- Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportacion ONNX de Parakeet: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- onnx-asr: https://github.com/istupakov/onnx-asr
- MMS_FA (torchaudio): https://pytorch.org/audio/stable/generated/torchaudio.pipelines.MMS_FA.html
- ECAPA-TDNN (SpeechBrain): https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
- Beat This!: https://github.com/CPJKU/beat_this
