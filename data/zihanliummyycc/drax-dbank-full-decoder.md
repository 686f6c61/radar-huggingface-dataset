# ZihanLiummyycc/drax-dbank-full-decoder

## Resumen

ZihanLiummyycc/drax-dbank-full-decoder es un checkpoint de componentes publicado en HuggingFace que contiene el decodificador completo de Drax adaptado al corpus DementiaBank. No es un modelo autonomo ni un adaptador PEFT: son 579.883.674 elementos de parametros repartidos en 303 tensores (aproximadamente 2,16 GiB) que sustituyen los parametros nativos correspondientes del decodificador, incluidos los modulos de proyeccion acustica y condicionamiento. El paquete esta pensado para cargarse sobre el checkpoint base aiola/drax-v1 usando el entorno de codigo nativo de Drax, no con `transformers` estandar.

El modelo subyacente, Drax, es un sistema de reconocimiento automatico del habla (ASR) basado en flow matching discreto desarrollado por aiOla (paper arXiv:2510.04162, "Drax: Speech Recognition with Discrete Flow Matching"). Esta adaptacion concreta traslada ese sistema al dominio del habla de personas mayores con posible deterioro cognitivo, usando el corpus DementiaBank. El autor reporta un WER agregado del 34,85 % sobre 928 enunciados de DementiaBank, correspondiente al experimento original y no a una nueva evaluacion publicada junto al checkpoint.

Su relevancia es acotada pero clara: es un artefacto de investigacion reproducible que documenta una adaptacion de decodificador sobre ASR con flow matching para un dominio clinico minoritario, con verificacion formal de hashes, nombres de tensores, formas y coincidencia exacta de tokens frente a la ruta de carga nativa. El repo tiene 0 descargas y 0 likes en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de Drax (ASR con flow matching discreto) adaptado; encoder acustico congelado no incluido en este paquete |
| Parametros totales | 579.883.674 elementos de parametros actualizados en 303 tensores (solo decodificador adaptado); total del modelo completo no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de ASR; no se documenta ventana de audio maxima) |
| Tipos de cuantizacion | no disponible (la verificacion se realizo en FP32; no se publican variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | upstream-terms-and-author-rights (terminos del upstream y derechos del autor; ver LICENSE.md). El model card de aiOla/drax-v1 declara CC BY 4.0 y el codigo nativo de Drax lleva CC BY-NC 4.0, con ambitos distintos |
| Formato de pesos | checkpoint de parametros nativos Drax (no es safetensors ni GGUF, y no carga con transformers estandar) |
| Modelo base | aiola/drax-v1 (revision fijada 96dda0e1d86c9b4c7f06a377410283ede1b671ab) |
| Procesador asociado | openai/whisper-large-v3 (solo *.json y *.txt, revision 06f233fe06e710322aca913c1bc4249a0d71fce1) |
| Tamano del repo | 2,3 GB |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-28 |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El checkpoint contiene los valores finales de los parametros adaptados del decodificador de Drax, no deltas aditivos. Drax combina un encoder acustico congelado con un decodificador generativo basado en flow matching discreto: la generacion de tokens se realiza mediante pasos discretos de flow, y la verificacion publicada empleo cuatro pasos de discrete-flow. El paquete incluye la proyeccion acustica y los modulos de condicionamiento del decodificador, ademas del buffer rotatorio determinista, que no se redistribuye aqui sino que lo aporta el base nativo y fue comprobado contra el checkpoint original.

El encoder acustico no se incluye ni se redistribuye: la descarga del base lo aporta localmente. Tampoco se incluyen el checkpoint base sin adaptar, el optimizador, las predicciones crudas, los logs de entrenamiento ni los datos de DementiaBank. El autor no detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; se describe como un ajuste supervisado del decodificador completo ("full-decoder finetuning") sobre el corpus indicado. El procesador de texto/tokens se toma de Whisper large-v3, lo que sugiere que el vocabulario y la tokenizacion siguen ese esquema, aunque la arquitectura de generacion es la de Drax.

La verificacion publicada cubre hashes de archivos locales, nombres de tensores, formas, valores finitos, carga estricta de parametros nativos y comparacion original frente a exportado. La prueba nativa se ejecuto en una NVIDIA A40 en FP32, con dos entradas sinteticas de un segundo (silencio y chirp), cuatro pasos de discrete-flow y las mismas semillas aleatorias en ambas rutas de carga; antes de cargar el estado exportado se limpiaron todos los parametros del decodificador seleccionados y las salidas de tokens coincidieron exactamente. El autor advierte explicitamente que estas comprobaciones no miden WER, RTF, robustez ni fuga de privacidad.

## Capacidades

- Reconocimiento automatico del habla en ingles sobre audio de personas mayores, con adaptacion especifica al dominio de DementiaBank.
- Transcripcion generativa mediante decodificacion por flow matching discreto (cuatro pasos en la verificacion publicada).
- Carga de componentes: sustitucion de parametros nativos del decodificador Drax sobre el checkpoint base, con deteccion estricta de nombres y formas.
- Verificacion de integridad: el paquete incluye `verification.json` y `checksums.json`, y se comprobo coincidencia exacta de tokens frente a la ruta nativa.
- Integracion con la receta de evaluacion `benchmarks/tools/dbank_drax/evaluate_dbank.py` del repositorio de codigo.
- Capacidades multilingues: no, unicamente ingles.
- Tool calling / function calling: no disponible (no es una capacidad descrita para este artefacto).
- Modo de razonamiento o thinking: no disponible.
- Vision o audio multimodal mas alla del pipeline ASR: no disponible.
- Uso como modelo autonomo: no, requiere el entorno Drax y el checkpoint base; no es un modelo Transformers estandar ni un adaptador PEFT convencional.

## Casos de uso

- Investigacion en ASR para habla de personas mayores: el checkpoint permite reproducir y extender el experimento de adaptacion del decodificador Drax al dominio de habla geriatrica, partiendo de parametros ya ajustados en lugar de reentrenar desde el base.
- Transcripcion de corpus DementiaBank con acceso autorizado: con la receta `evaluate_dbank.py` y la particion documentada, sirve para obtener transcripciones sobre los 928 enunciados usados en la evaluacion historica, asumiendo el WER del 34,85 % reportado.
- Reproducibilidad academica: los hashes de `checksums.json`, la fijacion de revisiones en `base_assets.json` y la comparacion de salidas permiten replicar la carga exacta del estado exportado y auditar que no hay divergencia con la ruta nativa.
- Punto de partida para nuevos ajustes de dominio: al ser un decodificador completo con proyeccion acustica y condicionamiento, puede servir como inicializacion para adaptar el sistema a otros corpus de habla atipica o no estandar.
- Estudio del flow matching discreto en ASR: permite analizar el efecto del numero de pasos de flow sobre la calidad de transcripcion, comparando configuraciones de decodificacion sobre el mismo estado de pesos.
- Preprocesado de audio clinico para pipelines de PLN: las transcripciones pueden alimentar analisis lexicos o sintacticos posteriores, siempre que se asuma el margen de error y no se use con fines diagnosticos.
- Auditoria de checkpoints de componentes: el formato (parametros finales sustitutivos, no deltas) y los ficheros de verificacion lo convierten en un caso practico para estudiar estrategias de publicacion de pesos derivados con trazabilidad de licencias.
- Banco de pruebas de carga nativa: util para validar que un entorno Drax correctamente instalado resuelve bases, procesador y buffer rotatorio antes de lanzar experimentos a mayor escala.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto de evaluacion | Notas |
|---|---|---|---|
| WER | 34,85 % | 928 enunciados de DementiaBank | Agregado historico asociado al experimento original, no una nueva ejecucion durante la publicacion. El autor remite al paper y a las recetas para particiones, configuracion de decodificacion y limitaciones de las comparaciones de alcance exploratorio |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras tareas de lenguaje, ya que se trata de un modelo de reconocimiento del habla. Tampoco se aportan cifras de RTF, latencia o comparaciones numericas con otros sistemas ASR. No se han incluido en esta ficha numeros no presentes en la informacion proporcionada.

## Requisitos de hardware

- El paquete de componentes ocupa 2,3 GB en disco (2,16 GiB de tensores).
- Inferencia estimada: con 579,9 M de parametros en el decodificador adaptado mas el encoder acustico congelado del base Drax, en FP32 el conjunto cabe holgadamente por debajo de 6 GB de VRAM; en FP16 la estimacion baja a unos 2,5 GB. Estas cifras son estimaciones de calculo, no medidas publicadas.
- La verificacion oficial se ejecuto en una NVIDIA A40 en FP32. No se publican medidas de memoria pico ni de throughput.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 8 GB o mas (serie RTX 3060/4060 y superiores) para FP16, y con 12-16 GB para FP32 sin cuantizacion. No hay confirmacion publicada de estas configuraciones.
- Opciones de despliegue: exclusivamente el entorno nativo Drax descrito en el repositorio de codigo (clonado, checkout del commit 29709f075399be63ed6d1e536a0a0ca3bba0a072, `Drax.from_pretrained` sobre el base, `load_drax_component` y `WhisperProcessor`). No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La unica referencia operativa es que la verificacion uso cuatro pasos de discrete-flow y entradas sinteticas de un segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ZihanLiummyycc/drax-dbank-full-decoder | 579,9 M elementos de parametros adaptados en 303 tensores | no disponible | upstream-terms-and-author-rights | HuggingFace, 0 descargas, 0 likes | Componente, no modelo autonomo; WER 34,85 % en 928 enunciados de DementiaBank |
| aiola/drax-v1 (base) | no disponible en la informacion proporcionada | no disponible | CC BY 4.0 segun el model card del base | HuggingFace, revision fijada 96dda0e1 | Base sin adaptar; requiere el mismo entorno nativo |
| openai/whisper-large-v3 | no disponible en la informacion proporcionada para esta ficha | no disponible | no disponible en la informacion proporcionada | HuggingFace | Se usa unicamente como origen del procesador (ficheros *.json y *.txt) en la receta de carga |
| Codigo nativo de Drax | no aplica | no aplica | CC BY-NC 4.0 | Repositorio GitHub del autor | Ambito de licencia distinto al de los pesos; no intercambiable |

No se dispone de datos de rendimiento comparativos entre estos sistemas en la informacion proporcionada, por lo que no se incluyen cifras de WER de los modelos alternativos.

## Limitaciones y advertencias

- No es un modelo de diagnostico y no esta validado para decisiones clinicas. Cualquier uso en contexto medico requiere validacion independiente.
- WER alto: el 34,85 % reportado sobre 928 enunciados de DementiaBank implica que aproximadamente uno de cada tres tokens o palabras se transcribe incorrectamente segun la metrica empleada; el autor no detalla la tokenizacion de la metrica en esta informacion.
- El dato de WER es un agregado historico del experimento original, no una nueva evaluacion realizada en el momento de publicar el checkpoint.
- Posibles errores de transcripcion y sesgos derivados del dataset de entrenamiento (DementiaBank es un corpus clinico especifico, con hablantes, tareas y condiciones de grabacion concretas).
- No se liberan registros clinicos crudos, pero el autor advierte que esto no demuestra que los pesos esten libres de memorizacion.
- Solo ingles: no hay soporte multilingue descrito.
- Restricciones de licencia: la licencia declarada es "upstream-terms-and-author-rights". El model card del base aiola/drax-v1 declara CC BY 4.0, mientras que el codigo nativo de Drax lleva CC BY-NC 4.0; son ambitos distintos y no intercambiables. El codigo nativo con clausula NC puede condicionar el uso comercial del conjunto. Revisar LICENSE.md y el directorio licenses/ antes de cualquier uso.
- No es un modelo Transformers estandar ni un adaptador PEFT; los intentos de cargarlo con `from_pretrained` convencional o con herramientas tipo PEFT fallaran.
- No contiene el encoder acustico ni el checkpoint base: sin descargar aiola/drax-v1 en la revision exacta y el procesador de Whisper large-v3, el componente no es utilizable.
- La verificacion no cubre WER, RTF, robustez ni fuga de privacidad, y una instalacion nueva desde el repositorio publico no ha sido evaluada sobre el corpus clinico completo.
- El buffer rotatorio determinista no se redistribuye; depende del base nativo, lo que introduce un punto de fallo si la revision del base cambia.
- Requiere acceso autorizado a los datos de DementiaBank, que no se distribuyen con el checkpoint.
- Riesgo de alucinacion o de salidas inventadas en pasos generativos de flow matching: no se documenta ninguna evaluacion especifica al respecto.
- No se documentan tipos de cuantizacion ni soporte para despliegues de alta concurrencia, por lo que no se recomienda para produccion sin pruebas adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZihanLiummyycc/drax-dbank-full-decoder
- Modelo base: https://huggingface.co/aiola/drax-v1
- Model card fijado del base (declara CC BY 4.0): https://huggingface.co/aiola/drax-v1/blob/96dda0e1d86c9b4c7f06a377410283ede1b671ab/README.md
- Codigo y recetas de experimentos: https://github.com/ZihanLiummyycc/diffusion-asr-elderly-speech/tree/29709f075399be63ed6d1e536a0a0ca3bba0a072
- Paper de Drax: https://arxiv.org/abs/2510.04162
- Procesador asociado: https://huggingface.co/openai/whisper-large-v3
- Ficheros de verificacion citados en el repo: `verification.json` y `checksums.json` (descargables desde el repositorio de HuggingFace)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a un proyecto no relacionado), por lo que no se incluyen enlaces adicionales.
