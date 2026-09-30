# swwallowws/coming-undone-browser-models

## Resumen

`swwallowws/coming-undone-browser-models` es un paquete de pesos en formato ONNX, cuantizados a int8, que implementa el modelo ADT_STR de transcripcion automatica de bateria (automatic drum transcription) para su ejecucion integra dentro del navegador. No es un modelo de lenguaje: es un sistema encoder-decoder de transcripcion simbolica de audio a MIDI, derivado del modelo PyTorch `Pierfrancesco/adt-str` (Melucci, Merialdo y Akama, 2026, variante `setting-tau-0.8`), exportado a ONNX con la atencion reescrita a mano y cuantizado por el proyecto Coming Undone. Lo publica el usuario `swwallowws` como parte del motor "In your browser" de la aplicacion Coming Undone, que separa una cancion en stems y los transcribe a MIDI sin enviar el audio a ningun servidor.

El repositorio contiene unicamente dos grafos: `adt_encoder.int8.onnx` (35,7 MB) y `adt_decoder.int8.onnx` (37,2 MB), mas un `models.json` de 1 KB que actua como manifiesto (nombres, tamanos, sha256, licencias y URL fijada del modelo de separacion htdemucs). La inferencia se ejecuta con `onnxruntime-web` sobre WebGPU, con respaldo en WebAssembly, y la decodificacion greedy se implementa en JavaScript, no dentro del grafo.

La relevancia de esta publicacion es doble. Por un lado, demuestra que una tarea de transcripcion musical de calidad investigadora cabe en menos de 75 MB de pesos y se ejecuta localmente en el navegador del visitante, sin subida de audio y sin coste de servidor. Por otro, documenta un caso practico de interoperabilidad ONNX: los autores senalan que los grafos int8 reproducen exactamente las detecciones del modelo PyTorch original (F1 de onsets 1,000 sobre un clip de prueba de 20 s, 97/97 impactos) y que las matrices de pesos se devuelven a punto flotante antes de crear la sesion porque el backend WebGPU de `onnxruntime-web` 1.30 calcula mal el `DequantizeLinear` que alimenta a `MatMul`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para transcripcion automatica de bateria (ADT_STR), atencion reescrita a mano en ONNX |
| Parametros totales | no disponible (estimacion aproximada de 73 M a partir del tamano de los pesos int8: 35,7 MB encoder + 37,2 MB decoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la entrada del encoder es un tensor log-mel de forma (B, 246, 128) por ventana |
| Tipos de cuantizacion | int8 por canal, solo pesos (weights only); se desquantiza a float antes de crear la sesion |
| Idiomas soportados | no disponible (la salida es simbolica, en formato MIDI; no depende del idioma) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (dos grafos: encoder y decoder), `adt_encoder.int8.onnx` y `adt_decoder.int8.onnx` |

## Arquitectura y entrenamiento

El modelo base es ADT_STR, un sistema de transcripcion automatica de bateria con estructura encoder-decoder y atencion cruzada. El encoder recibe representaciones log-mel (forma `(B, 246, 128)`) y emite, para cada capa del decoder, las claves y valores de la atencion cruzada. El decoder toma como entrada un prefijo de tokens junto con esas K/V y devuelve los logits del siguiente token; el bucle de decodificacion greedy se ejecuta en JavaScript, fuera del grafo ONNX. La exportacion mantiene los mismos pesos que el modelo PyTorch, pero reescribe la atencion a mano dentro del grafo, y despues se aplica cuantizacion int8 por canal sobre los pesos mediante los scripts `browser/models/export_adt.py` y `browser/models/quantize.mjs` del proyecto Coming Undone.

El autor no publica en esta model card detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, por lo que esos datos no estan disponibles. La unica validacion reportada es de equivalencia funcional: sobre el mismo stem de bateria, los grafos int8 producen los mismos impactos que el modelo PyTorch original (onset F1 1,000, 97/97 impactos, clip de 20 s). La innovacion tecnica destacable no esta en la arquitectura sino en el empaquetado: exportacion ONNX con atencion manual, cuantizacion int8 por canal compatible con `onnxruntime-web`, y un manifiesto `models.json` que permite al navegador descargar y cachear los ficheros una sola vez. Como advertencia de implementacion, los autores indican que las matrices int8 se convierten de nuevo a float antes de crear la sesion, porque el backend WebGPU de `onnxruntime-web` 1.30 calcula incorrectamente el `DequantizeLinear` que alimenta a `MatMul`.

## Capacidades

- Transcripcion automatica de bateria de audio a eventos simbolicos: convierte un stem de bateria en una secuencia de tokens decodificados a MIDI.
- Entrada de audio representada como log-mel, con ventanas de 246 tramas y 128 bandas mel.
- Generacion autoregresiva de tokens con decodificacion greedy implementada en JavaScript sobre los logits del decoder.
- Exportacion de las K/V de atencion cruzada por capa desde el encoder, consumidas por el decoder.
- Inferencia local en el navegador mediante `onnxruntime-web`, con WebGPU y respaldo en WebAssembly.
- Flujo completo de cancion a MIDI cuando se combina con la separacion de fuentes: el proyecto usa htdemucs (export ONNX de timcsy) para separar stems y basic-pitch (Spotify) como apoyo, cargados desde fuera de este repositorio.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio generativo ni soporte multilingue: no es un modelo de lenguaje.

## Casos de uso

- Transcripcion de bateria en el navegador sin subida de datos: el motor descarga los dos grafos ONNX (unos 73 MB en total) una sola vez a Cache Storage y procesa el audio en la maquina del usuario, de modo que el fichero de audio nunca sale del dispositivo. Es adecuado para demos publicas y para usuarios que no quieren ceder material inedito.
- Herramientas de practica musical y aprendizaje: un baterista puede cargar una cancion, obtener el MIDI de la bateria y practicarlo en un editor o en un DAW a tempo reducido, con la ventaja de que todo ocurre sin instalacion de escritorio.
- Preproduccion y remezcla: al combinar la transcripcion con la separacion de stems que hace el propio proyecto, se puede sustituir o reprocesar la pista de bateria de una mezcla sin disponer de las pistas originales.
- Prototipado de librerias de sampleado y reemplazo de bateria: el MIDI extraido sirve como disparador de samplers, con la ventaja de que la transcripcion int8 reproduce los mismos impactos que el modelo PyTorch original en la prueba publicada.
- Investigacion reproducible en transcripcion musical: al estar los pesos fijados a la revision `a33c5c6b191a4ca1e0f6dc22140947485eb36ce8` del modelo base y documentarse el proceso de exportacion y cuantizacion, sirve como referencia para comparar int8 frente a PyTorch en tareas de deteccion de onsets.
- Aplicaciones web con coste de servidor nulo: al ejecutarse enteramente en el cliente con WebGPU y respaldo WASM, el coste de computo de la transcripcion recae en el dispositivo del visitante, lo que permite ofrecer la funcion sin infraestructura de GPU.
- Archivado y catalogacion de material musical: convertir grabaciones de bateria a representacion simbolica facilita busquedas, anotaciones y analisis posterior sobre el MIDI.

## Benchmarks y rendimiento

| Prueba | Resultado | Contexto |
|---|---|---|
| F1 de onsets (grafos int8 frente a PyTorch original) | 1,000 | Clip de prueba de 20 s, mismo stem de bateria |
| Impactos detectados | 97/97 | Mismo clip de 20 s |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) porque no son aplicables a un modelo de transcripcion de audio. No se han publicado cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. A partir del tamano de los ficheros (35,7 MB + 37,2 MB en int8, equivalentes a unos 73 M de parametros), los pesos desquantizados a float32 ocupan en torno a 290-300 MB, a lo que hay que sumar activaciones; en la practica cabe holgadamente por debajo de 1 GB. Estimacion derivada del tamano de los pesos, no confirmada por el autor.
- GPU: cualquier GPU con soporte WebGPU en el navegador es suficiente; no se requieren A100, H100 ni tarjetas de centro de datos. El tamano del modelo lo situa en el rango de GPU de consumo, integradas incluidas.
- Compatibilidad con GPU de consumo: si, es el escenario previsto. El proyecto declara explicitamente ejecucion en el navegador del visitante con WebGPU.
- Respaldo sin GPU: existe fallback a WebAssembly cuando WebGPU no esta disponible, lo que permite ejecucion en CPU aunque con menor rendimiento.
- Opciones de despliegue: `onnxruntime-web` 1.30 es el runtime de referencia. Al ser grafos ONNX, tecnicamente pueden ejecutarse tambien con otros runtimes ONNX fuera del navegador, aunque no se documenta esa via en la model card.
- Advertencia de despliegue: con `onnxruntime-web` 1.30 y backend WebGPU hay que desquantizar los pesos a float antes de crear la sesion, porque el calculo de `DequantizeLinear` alimentando a `MatMul` es incorrecto en esa version.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Formato y tamano | Licencia | Disponibilidad en este repositorio |
|---|---|---|---|---|
| ADT_STR int8 (este repositorio) | Transcripcion de bateria a MIDI | ONNX int8, 35,7 MB + 37,2 MB | CC BY-SA 4.0 | Si, pesos incluidos |
| ADT_STR original (`Pierfrancesco/adt-str`, variante `setting-tau-0.8`) | Transcripcion de bateria a MIDI | PyTorch, tamano no indicado | CC BY-SA 4.0 (segun este repositorio) | No; es el modelo base |
| htdemucs (Meta, export ONNX de timcsy) | Separacion de fuentes, no transcripcion | ONNX, 180,5 MB | MIT en el proyecto original; el repositorio de export no declara licencia propia | No; se carga desde `timcsy/demucs-web-onnx` |
| basic-pitch (Spotify) | Transcripcion instrumental a MIDI | TF.js, 0,9 MB | Apache-2.0 | No; se distribuye con la pagina |
| MuScriptor small (Mirelo y Kyutai) | Transcripcion musical | Pesos no incluidos aqui | CC BY-NC 4.0 | No; pesos con acceso restringido, no se comparten |

Las cifras de rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa mas alla del F1 de onsets 1,000 reportado para este modelo frente a su equivalente PyTorch.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgo por genero, estilo musical, origen de las grabaciones ni tipo de produccion.
- Riesgo de alucinacion: en un modelo de transcripcion simbolica el equivalente son impactos espurios o notas omitidas fuera de la distribucion de entrenamiento. La unica validacion publicada es un unico clip de 20 s, con 97/97 impactos y F1 1,000; no hay ninguna evaluacion sobre un conjunto de prueba amplio y diverso.
- Limitaciones de contexto: la entrada se organiza en ventanas de forma `(B, 246, 128)`; no se documenta el tratamiento de piezas largas ni el solapamiento entre ventanas.
- Limitaciones de idioma: no aplica en el sentido linguistico, pero tampoco se documentan los generos musicales, la instrumentacion ni la calidad de grabacion cubiertos por el entrenamiento.
- Licencia: CC BY-SA 4.0. El uso comercial esta permitido, pero obliga a atribuir a los autores originales (Melucci, Merialdo y Akama, "ADT_STR", 2026), a indicar que los pesos han sido modificados y a compartir las adaptaciones bajo la misma licencia. Los pesos cuantizados siguen siendo CC BY-SA 4.0 sea cual sea el formato al que se conviertan. Es una licencia copyleft, lo que puede ser incompatible con productos propietarios que no quieran liberar sus adaptaciones.
- Componentes externos con licencias distintas: htdemucs se carga desde un repositorio que no declara licencia propia para su export ONNX, basic-pitch es Apache-2.0 y MuScriptor small es CC BY-NC 4.0 con pesos restringidos. Cualquier uso comercial debe revisarse componente a componente; el caracter no comercial de MuScriptor afecta a los motores Online y This computer, no a este paquete.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 likes, y su unica validacion es interna al proyecto, hecha por el propio autor de la exportacion. No hay evaluacion independiente.
- Caveat de version del runtime: la necesidad de desquantizar antes de crear la sesion es un requisito de `onnxruntime-web` 1.30; si se actualiza el runtime, conviene volver a verificar ese comportamiento.
- Fecha de creacion del repositorio: 29 de septiembre de 2026, segun los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swwallowws/coming-undone-browser-models
- Modelo base (PyTorch): https://huggingface.co/Pierfrancesco/adt-str
- Codigo de ADT_STR: https://github.com/pier-maker92/ADT_STR
- htdemucs (Meta): https://github.com/facebookresearch/demucs
- Export ONNX de htdemucs para navegador: https://huggingface.co/timcsy/demucs-web-onnx
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

La busqueda web realizada no devolvio ningun enlace relevante para este modelo: los resultados obtenidos no guardan relacion con el sistema de transcripcion de bateria y se han descartado.
