# teamup-tech/StemFX-weights

## Resumen

`teamup-tech/StemFX-weights` no es un modelo de lenguaje: es un espejo (mirror) del checkpoint preentrenado de separacion de fuentes musicales SCNet que utiliza el Space [StemFX](https://huggingface.co/spaces/teamup-tech/StemFX) antes de predecir efectos de audio. El repositorio lo publica la cuenta `teamup-tech` con el unico proposito de evitar que el paquete `stemfx` descargue el fichero desde una release de GitHub de [Music-Source-Separation-Training](https://github.com/ZFTurbo/Music-Source-Separation-Training), de modo que la dependencia quede resuelta dentro de HuggingFace.

El contenido es un unico fichero, `model_scnet_masked_ep_111_sdr_9.8286.ckpt`, copiado sin modificaciones y con su nombre original de la release v1.0.17 del proyecto de Roman Solovyev (ZFTurbo). El repositorio completo ocupa 0,2 GB, no declara pipeline, no tiene descargas ni likes, y su model card se limita a documentar la procedencia y el hash SHA-256 del binario.

Su relevancia es, por tanto, de infraestructura reproducible: garantiza que una aplicacion de efectos de audio obtenga siempre el mismo checkpoint verificado por hash, bajo licencia MIT compatible con uso comercial. No aporta ninguna innovacion de arquitectura ni datos de entrenamiento propios; toda la informacion tecnica del modelo subyacente vive en el repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SCNet (deducido del nombre del fichero `model_scnet_masked_ep_111_sdr_9.8286.ckpt`); la model card no describe la arquitectura |
| Parametros totales | no disponible (el repositorio completo, con un unico checkpoint, ocupa 0,2 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible; se distribuye un unico checkpoint PyTorch (`.ckpt`), sin variantes cuantizadas |
| Idiomas soportados | no aplica (audio); no se documenta el idioma de las voces |
| Licencia | MIT |
| Formato de pesos | `.ckpt` (checkpoint PyTorch) |

## Arquitectura y entrenamiento

La model card no incluye descripcion arquitectonica, datos de entrenamiento ni proceso de ajuste. Lo unico deducible es el nombre del checkpoint: prefijo `scnet`, variante `masked`, epoch 111 (`ep_111`) y un SDR de 9,8286 anotado en el propio nombre del fichero. El peso esta entrenado para separacion de fuentes musicales (music source separation), la tarea previa que ejecuta el Space StemFX antes de aplicar sus efectos.

El checkpoint procede de la release v1.0.17 de Music-Source-Separation-Training, proyecto de Roman Solovyev distribuido bajo licencia MIT. El espejo no altera el binario: se indica SHA-256 `b4675b0269809de27172a050e8767a857077635eda1738db0874d63a79f2b6dd`, que es exactamente el hash que el paquete `stemfx` verifica antes de cargar el modelo. Cualquier detalle sobre dataset, numero de pasos, aumentado de datos o funcion de perdida debe consultarse en el repositorio upstream, no aqui.

## Capacidades

- Separacion de fuentes musicales en stems a partir de una mezcla de audio; el conjunto exacto de stems (voces, bateria, bajo, otros) no se documenta en la model card.
- Servir como etapa de preprocesado para la prediccion de efectos de audio en el Space StemFX.
- Inferencia sobre audio musical completo, sujeta a la estrategia de segmentacion que aplique el codigo consumidor (no documentada aqui).
- Carga verificada por hash SHA-256, lo que permite integridad reproducible en pipelines.
- Generacion de texto: no.
- Razonamiento, codigo, matematicas: no.
- Tool calling / function calling: no.
- Soporte de agentes o multi-step reasoning: no.
- Capacidades multilingues: no aplica.
- Vision, audio de entrada en sentido ASR, thinking mode: no disponible / no aplica.

## Casos de uso

- **Generacion de instrumentales para karaoke o versiones**: se pasa la mezcla por el separador y se descarta el stem de voz para producir una base instrumental; el modelo es adecuado porque esta entrenado especificamente para aislar fuentes en musica.
- **Preprocesado dentro del pipeline StemFX**: el checkpoint se carga antes de predecir efectos, de modo que cada stem recibe un tratamiento diferenciado (por ejemplo, reverb solo en voces). Es el caso de uso para el que existe este repositorio.
- **Herramientas de remix y produccion musical**: extraer bateria, bajo o voces para reutilizarlas en un remix o en un sample pack, manteniendo el resto de la mezcla intacto.
- **Edicion y postproduccion de audio**: atenuar o eliminar una fuente concreta de una grabacion sin volver a mezclar desde las pistas originales.
- **Educacion musical y analisis**: generar stems para que un estudiante escuche una pista aislada (por ejemplo, la linea de bajo) y analice articulacion, ritmo o armonia.
- **Creacion de datasets para investigacion en MIR**: producir stems a escala a partir de un catalogo de mezclas para entrenar o evaluar otros sistemas de separacion, transcripcion o deteccion de instrumentos.
- **Prototipado de aplicaciones de audio en CPU**: al ocupar 0,2 GB el checkpoint, es viable montar un servicio de demostracion en una maquina sin GPU dedicada, aceptando mayor latencia.

## Benchmarks y rendimiento

El unico dato numerico disponible es el que figura en el nombre del fichero: SDR 9,8286 en la epoch 111. No se especifica en la model card sobre que dataset, split ni metrica exacta se calculo, ni se aportan comparaciones.

| Metrica | Valor | Dataset / condiciones | Fuente |
|---|---|---|---|
| SDR | 9,8286 | no disponible (no se indica dataset ni split) | Nombre del fichero `model_scnet_masked_ep_111_sdr_9.8286.ckpt` |
| MMLU, HumanEval, GSM8K y similares | no aplica | no es un modelo de lenguaje | — |

No se han publicado resultados de benchmarks detallados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El checkpoint ocupa 0,2 GB, por lo que los pesos caben holgadamente en cualquier GPU consumer; el consumo real depende de la longitud de segmento y del tamano de lote que use el codigo de inferencia (estimacion, no dato del autor).
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU con suficiente memoria para el segmento elegido deberia poder ejecutarlo; no hay cifras publicadas de latencia ni throughput.
- Cabe en GPU consumer: si, a partir del tamano del checkpoint (0,2 GB), siempre que la segmentacion de audio se configure en consecuencia.
- Opciones de despliegue: PyTorch con el paquete `stemfx` o con el codigo de Music-Source-Separation-Training. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de esta comparativa no proceden de la informacion proporcionada y se marcan como no disponibles cuando no hay confirmacion. Se incluyen solo como referencia de categoria.

| Modelo | Tarea | Parametros | Contexto | SDR publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| StemFX-weights (SCNet) | Separacion de fuentes musicales | no disponible (repo de 0,2 GB) | no aplica | 9,8286 (dataset no indicado) | MIT | HuggingFace, espejo de release GitHub |
| Demucs / HTDemucs | Separacion de fuentes musicales | no disponible | no aplica | no disponible en esta informacion | no verificada aqui | Codigo y pesos publicos |
| BS-RoFormer (via Music-Source-Separation-Training) | Separacion de fuentes musicales | no disponible | no aplica | no disponible en esta informacion | no verificada aqui | Repositorio upstream |
| Open-Unmix (UMX) | Separacion de fuentes musicales | no disponible | no aplica | no disponible en esta informacion | no verificada aqui | Codigo y pesos publicos |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo y no soporta tool calling. Cualquier evaluacion con benchmarks de LLM carece de sentido.
- La model card no documenta arquitectura, dataset de entrenamiento, numero de stems ni condiciones de evaluacion; el SDR 9,8286 no es verificable sin consultar el repositorio upstream.
- Riesgo de artefactos de separacion (sangrado entre stems, perdida de transitorios, coloracion tonal) inherente a la tarea; no se han publicado analisis de calidad subjetiva en la informacion disponible.
- Sesgos: no documentados. Al ser un modelo de audio, los sesgos relevantes serian de genero musical y de composicion del dataset de entrenamiento, sobre los que no hay informacion.
- Licencia MIT declarada tanto en este repositorio como en el proyecto upstream, lo que en principio permite uso comercial; conviene verificar la cadena de licencias de cualquier dependencia adicional del codigo que lo carga.
- El repositorio tiene 0 descargas y 0 likes y no declara pipeline: no debe tratarse como un artefacto mantenido de forma independiente, sino como un espejo de conveniencia sujeto a desaparecer si cambia el proyecto StemFX.
- Fechas de creacion y actualizacion registradas como 2026-10-23, sin actividad posterior; no hay garantia de actualizaciones ni de soporte.
- Los resultados de busqueda web disponibles no son pertinentes: corresponden a productos de calendario y gestion de equipos llamados Teamup, sin relacion con este modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/teamup-tech/StemFX-weights
- Space StemFX: https://huggingface.co/spaces/teamup-tech/StemFX
- Proyecto upstream Music-Source-Separation-Training: https://github.com/ZFTurbo/Music-Source-Separation-Training
- Release v1.0.17 con el checkpoint original: https://github.com/ZFTurbo/Music-Source-Separation-Training/releases/download/v1.0.17/model_scnet_masked_ep_111_sdr_9.8286.ckpt
- Paper o blog del modelo: no disponible en la informacion proporcionada
- Demo adicional: no disponible en la informacion proporcionada
