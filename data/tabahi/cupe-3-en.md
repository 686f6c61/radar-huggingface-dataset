# Tabahi/CUPE-3-en

## Resumen

CUPE-3-en (identificador interno p3cupe, experimento pa07f) es un codificador fonético convolucional sin contexto desarrollado por el usuario Tabahi. No es un modelo generativo de lenguaje, sino un modelo acústico especializado en reconocimiento de fonemas, segmentación fonética y alineación forzada sobre audio en inglés. Emite una distribución de probabilidad sobre 66 fonemas (67 etiquetas, con SIL en el índice 0) cada 5 ms, y cada fotograma procesa como máximo 120 ms de audio con un campo receptivo de 38,9 ms.

Con 13.544.596 parámetros (unos 13,5 millones) y un repositorio de 0,1 GB, es un modelo muy ligero que puede ejecutarse en CPU. Se entrenó sobre LibriSpeech libri_500h (aproximadamente 497 horas) durante una sola época, sin etiquetas de fronteras: las fronteras se derivan a posteriori mediante un decodificador Viterbi segmental sobre la secuencia de fonemas conocida, leída en el cruce de las posteriores de fotogramas vecinos.

El modelo se distribuye bajo licencia AGPL-3.0 y su relevancia actual es doble: por un lado, sigue siendo necesario para el pipeline ph66 de BFA; por otro, el propio autor lo declara superado por p4mbfa (`Tabahi/mbfa-<language group>`), que emplea etiquetas standard_g2p y soporta múltiples idiomas. Los metadatos indican 0 descargas y 0 likes, por lo que no hay validación externa documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN sin contexto (context-free CNN phoneme encoder), tercera generacion de CUPE |
| Parametros totales | 13.544.596 (13,54 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica como ventana de contexto; cada fotograma ve como maximo 120 ms de audio (campo receptivo de 38,9 ms) y emite una distribucion cada 5 ms |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; solo pesos safetensors y un checkpoint de PyTorch Lightning) |
| Idiomas soportados | en (ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors; se incluye ademas un checkpoint de PyTorch Lightning (`ckpt/en_libri500_pa07f_e0_timit_f1_25ms=75.58.ckpt`) |
| Cabezas de salida | fonemas ph66 (67 etiquetas, indice 0 = SIL, la ultima ranura `noise` nunca se entrena) y grupos foneticos (17 clases) |
| Frecuencia de muestreo de entrada | 16 kHz |
| Tamano del repositorio | 0,1 GB |
| Libreria | pytorch |
| Fecha de publicacion (metadatos) | 2026-10-09 |

## Arquitectura y entrenamiento

La arquitectura es una CNN sin contexto que produce una distribucion de fonemas ph66 cada 5 ms. El diseno evita deliberadamente el modelado de contexto largo: cada fotograma solo accede a como maximo 120 ms de audio, con un campo receptivo efectivo de 38,9 ms. La extraccion se realiza por ventanas deslizantes (`slice_windows` con ventana de 120 y salto de 80) y posterior reconstruccion mediante `stitch_windows`. Las fronteras foneticas no se predicen de forma explicita: se obtienen con un decodificador Viterbi segmental aplicado sobre la secuencia de fonemas conocida, leyendo el cruce entre posteriores de fotogramas vecinos.

El entrenamiento uso LibriSpeech libri_500h (aproximadamente 497 horas) durante una sola epoca. El checkpoint publicado corresponde al experimento pa07f, epoca 0, seleccionado por F1 de fronteras a 25 ms sobre TIMIT en la mitad de ajuste y reevaluado con el decodificador final. El modelo se inicializo en caliente desde pa07e, con el linaje pa01d -> pa07a (MLS, 7 idiomas, 100 h) -> pa07b (libri_360h) -> pa07c, pa07d, pa07e (libri_500h) -> pa07f. Los hiperparametros de decodificacion en entrenamiento fueron min_phone_frames 3, soft 10, onset bonus 30 y ramp 3. No se documenta uso de RLHF ni DPO, algo previsible en un modelo discriminativo de este tipo. La decodificacion publicada en `config.json` usa min 6 + soft 10 fotogramas y una bonificacion de onset sobre log-mel de 30,0.

## Capacidades

- Reconocimiento de fonemas en ingles: salida de 67 clases ph66 por fotograma a 5 ms de resolucion.
- Segmentacion fonetica: deteccion de fronteras entre fonemas a partir del cruce de posteriores vecinas.
- Alineacion forzada: alineamiento temporal de una secuencia ph66 conocida sobre el audio, mediante Viterbi segmental (`p3cupe.loss.PeakLoss.align`).
- Clasificacion de grupos foneticos: cabeza secundaria de 17 clases derivada de los grupos ph66.
- Precisión de onsets: metrica especifica de deteccion del inicio de cada fono, con y sin bonificacion de onset.
- Procesamiento por ventanas con solapamiento, lo que permite aplicar el modelo a audio de duracion arbitraria.
- Inferencia en CPU: el propio ejemplo de uso del autor instancia el extractor con `device="cpu"`.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, vision, audio generativo ni capacidades de agente: es un modelo puramente discriminativo y monomodales de voz.

## Casos de uso

- Alineacion forzada de corpus de voz en ingles: dado un audio y su secuencia de fonemas ph66 conocida, el decodificador Viterbi segmental del modelo coloca las fronteras temporales; es el uso principal documentado y el que reproduce `p3cupe/timit_probe.py`.
- Anotacion automatica de datasets de habla a gran escala: la resolucion de 5 ms por fotograma permite generar etiquetas foneticas y de limites temporales sobre cientos de horas sin anotacion manual, partiendo de transcripciones foneticas existentes.
- Preprocesado para sintesis de voz (TTS): las duraciones por fonema extraidas de la alineacion alimentan modelos acusticos y de duracion en pipelines de TTS, ya que el modelo entrega limites de fono con tolerancia de 25 ms.
- Evaluacion de pronunciacion (CAPT): la metrica phone_hit a 25 ms (73,07 con decodificador sin bonificacion en el holdout) permite cuantificar si el aprendiz produce el inicio de cada fono en el intervalo esperado.
- Investigacion fonetica y linguistica: medicion de duraciones y fronteras de fono sobre TIMIT o corpus propios, con un modelo de 13,5 M de parametros que se ejecuta sin GPU.
- Integracion en el pipeline BFA ph66: el autor mantiene explicitamente esta version porque sigue siendo compatible con la rama ph66 de BFA, mientras p4mbfa usa etiquetas standard_g2p.
- Extraccion de caracteristicas foneticas como entrada para modelos posteriores: las posteriores de fonemas y de grupos (67 y 17 clases) sirven como representacion intermedia para clasificadores o sistemas de verificacion.
- Control de calidad de transcripciones foneticas: comparar la secuencia esperada con las posteriores generadas permite detectar desalineaciones o errores en el material de partida.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre TIMIT (400 clips en ingles nunca usados en entrenamiento), divididos en una mitad `tune` (seleccion de checkpoint y decodificador) y una mitad `holdout`. `lev_f1_25ms` es la F1 de fronteras foneticas dentro de una tolerancia de 25 ms; `phone_hit_25ms` es la proporcion de fonos cuyo inicio cae dentro de 25 ms. `bonus0` corresponde al mismo decodificador sin la bonificacion de onset.

| Metrica | Valor |
|---|---|
| timit_lev_f1_25ms_tune | 76,10 |
| timit_lev_f1_25ms_holdout | 75,58 |
| timit_lev_f1_25ms_bonus0_holdout | 73,77 |
| timit_phone_hit_25ms_bonus0_holdout | 73,07 |
| timit_phone_hit_25ms_holdout | 68,73 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ninguna otra bateria de benchmarks de lenguaje, ya que el modelo no es generativo de texto. Tampoco se proporcionan comparaciones numericas frente a otros alineadores.

## Requisitos de hardware

- VRAM estimada: con 13,54 M de parametros, los pesos en fp32 ocupan aproximadamente 54 MB y en fp16 unos 27 MB; sumando activaciones de ventana, la huella es inferior a unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente (GTX 1050, RTX 3060, RTX 4090, A100, H100); no hay requisito de GPU de centro de datos.
- Cabe con holgura en GPU de consumo y tambien en CPU: el ejemplo oficial del autor instancia `CupeExtractor("Tabahi/CUPE-3-en", device="cpu")`.
- Opciones de despliegue: al ser un modelo PyTorch con codigo propio en `p3cupe/`, el despliegue documentado es la carga directa con PyTorch o PyTorch Lightning; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo discriminativo de audio.
- Latencia y throughput: no disponible en la informacion proporcionada. La unica referencia temporal es la resolucion de salida (un fotograma cada 5 ms), que no equivale a latencia de inferencia.

## Comparativa con modelos similares

Solo se dispone de datos verificables para el propio modelo y para su sucesor declarado. No se han encontrado en la busqueda web cifras publicadas de alternativas comparables.

| Modelo | Parametros | Cobertura | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CUPE-3-en (Tabahi/CUPE-3-en) | 13,54 M | Ingles, etiquetas ph66, salida cada 5 ms | TIMIT lev_f1_25ms 75,58 en holdout | AGPL-3.0 | HuggingFace, 0 descargas |
| p4mbfa (Tabahi/mbfa-<language group>) | no disponible | Multilingue, etiquetas standard_g2p | no disponible | no disponible | HuggingFace (sucesor declarado) |
| Otros alineadores foneticos | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo superado: el propio autor indica que p4mbfa lo sustituye; CUPE-3-en se mantiene unicamente por compatibilidad con el pipeline ph66 de BFA.
- Solo ingles: el campo de idioma declarado es exclusivamente `en`, y el entrenamiento se hizo sobre LibriSpeech en ingles.
- Requiere la secuencia de fonemas conocida para la alineacion: no es un reconocedor de voz libre, sino un alineador forzado que necesita la transcripcion fonetica de entrada.
- Campo receptivo corto: cada fotograma ve como maximo 120 ms y su campo receptivo efectivo es de 38,9 ms, por lo que no modela dependencias acusticas de largo alcance.
- Entrenamiento limitado: una sola epoca sobre aproximadamente 497 horas de LibriSpeech, sin etiquetas de fronteras; el checkpoint seleccionado es de la epoca 0.
- Precision imperfecta: una F1 de fronteras de 75,58 a 25 ms de tolerancia implica errores de localizacion en aproximadamente uno de cada cuatro casos; con `phone_hit` a 25 ms, el valor sin bonificacion es 73,07.
- Etiqueta sin entrenar: la ultima ranura de la cabeza de fonemas (`noise`) nunca se entrena, por lo que no debe interpretarse como clase valida.
- Licencia AGPL-3.0: es copyleft fuerte; su uso en un servicio en red puede obligar a liberar el codigo fuente derivado, lo que condiciona su integracion en productos comerciales cerrados.
- Riesgo de seguridad en el checkpoint: el archivo `.ckpt` de PyTorch Lightning esta serializado con pickle; el propio autor advierte de cargarlo solo si se confia en el repositorio.
- Sin validacion externa: 0 descargas y 0 likes en el momento de los metadatos, sin evaluaciones independientes publicadas.
- Sin cuantizaciones publicadas: no hay variantes GGUF, GPTQ, AWQ ni similares en la informacion disponible.
- Datos demograficos y de sesgo: la model card no documenta analisis de sesgo por acento, sexo, edad ni origen del hablante; dado el uso de LibriSpeech, cabe esperar una cobertura limitada de acentos no estadounidenses, pero no se aporta evidencia al respecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tabahi/CUPE-3-en
- Repositorio de codigo (carpeta `p3cupe/`): https://github.com/tabahi/bfa_models
- Modelo sucesor declarado por el autor: `Tabahi/mbfa-<language group>` (consultar el perfil https://huggingface.co/Tabahi para localizar la variante concreta por grupo de idiomas)
- Paper: no disponible
- Blog o demo: no disponible

Nota: la busqueda web proporcionada no devolvio resultados relacionados con el modelo (los enlaces encontrados corresponden a exploradores de anatomia humana), por lo que no se han podido anadir enlaces adicionales relevantes.
