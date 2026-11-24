# tuannd2702/silero-vad

## Resumen

Silero VAD es un detector de actividad de voz (VAD, por sus siglas en ingles) desarrollado por el equipo de Silero. Este repositorio concreto, publicado por el usuario `tuannd2702`, no contiene un modelo nuevo ni modificado: aloja copias byte a byte identicas de tres artefactos oficiales de Silero VAD, cada uno anclado a una version upstream concreta y verificado mediante hash SHA-256. El objetivo es ofrecer un punto de descarga estable y fijado para pipelines que necesitan reproducibilidad, evitando que una actualizacion del repositorio original rompa builds o cambie el comportamiento del detector.

El modelo resuelve un problema acotado pero critico en cualquier pipeline de audio: distinguir segmentos con voz humana de silencio, ruido o musica, con muy baja latencia y un coste computacional minimo. Se distribuye en formato TorchScript (`torch.jit`) y ONNX (opset 15, 16 kHz), lo que permite ejecutarlo tanto en PyTorch como en ONNX Runtime o en el ecosistema sherpa-onnx. Su tamano es reducido (el fichero ONNX de sherpa-onnx ocupa 643.854 bytes, aproximadamente 0,6 MB), por lo que cabe en CPU y en dispositivos embebidos sin GPU.

La relevancia de esta ficha radica en que el repositorio es un espejo de conveniencia, no la fuente canonica. Cualquier documentacion, soporte o version nueva debe consultarse en los repositorios originales de Silero y de sherpa-onnx. La licencia MIT del modelo original se conserva sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente ligera (detalle exacto de capas no disponible en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa audio por ventanas (tamano de chunk no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en precision original TorchScript y ONNX) |
| Idiomas soportados | independiente del idioma (deteccion acustica de voz, no reconocimiento de habla) |
| Licencia | MIT (Copyright (c) 2020-present Silero Team) |
| Formato de pesos | TorchScript (`.jit`) y ONNX (opset 15, 16 kHz) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento. Por la naturaleza del artefacto (un VAD de menos de 1 MB y ejecutable en CPU en tiempo real) se trata de una red recurrente compacta orientada a clasificacion binaria voz/no voz sobre ventanas de audio, pero no se confirma en la model card el numero de capas, el tamano de las ventanas ni la composicion del dataset de entrenamiento. Tampoco se documentan tecnicas de RLHF, DPO ni innovaciones como decodificacion especulativa, que no aplican a este tipo de modelo.

Lo que si esta documentado con precision es la procedencia de cada fichero: `torch-hub-v6.2.1/silero_vad.jit` proviene del tag v6.2.1 de `snakers4/silero-vad` (commit `7e30209a3e901f9842f81b225f3e93d8199902b1`); `v6.2-16k-op15/silero_vad_16k_op15.onnx` proviene del tag v6.2 (commit `be95df9152c0d7618fa1edfeb296fc3dae32376f`); y `sherpa-onnx/silero_vad.onnx` corresponde al asset `silero_vad.onnx` del release `asr-models` de `k2-fsa/sherpa-onnx`, subido el 2025-07-11. Cada fichero incluye su SHA-256, lo que permite verificar la integridad de la descarga.

## Capacidades

- Deteccion de actividad de voz en flujo de audio: clasifica ventanas como voz o no voz.
- Ejecucion en tiempo real sobre CPU, sin necesidad de GPU.
- Compatibilidad con PyTorch mediante `torch.jit.load` y con ONNX Runtime (opset 15, 16 kHz).
- Integracion nativa con sherpa-onnx mediante `VadModelConfig.silero_vad` y `VoiceActivityDetector`.
- Independencia del idioma: detecta voz humana con independencia del idioma hablado.
- Uso como etapa de preprocesado para segmentar audio antes de ASR, diarizacion o transcripcion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Segmentacion previa a reconocimiento de habla: el VAD recorta silencios y ruido antes de enviar audio a un modelo ASR, reduciendo coste de inferencia y latencia en pipelines de transcripcion.
- Deteccion de turnos en telefonia y VoIP: permite saber cuando un interlocutor esta hablando para gestionar barge-in y silencios en asistentes telefonicos.
- Diarizacion y subtitulado: actua como etapa inicial para identificar regiones con voz antes de asignar hablantes o generar subtitulos sincronizados.
- Ahorro energetico en dispositivos embebidos: al ejecutarse en CPU y ocupar menos de 1 MB, puede mantener un microcontrolador o un movil en escucha activa sin activar el ASR hasta que hay voz.
- Filtrado de grabaciones y datasets: descarta automaticamente segmentos sin voz en corpus de audio, limpiando datasets de entrenamiento o de evaluacion.
- Reproducibilidad en CI/CD: al fijar los ficheros por version upstream y SHA-256, los equipos pueden garantizar que sus tests de audio usan exactamente el mismo detector en cada build.
- Moderacion y analisis de llamadas: detectar presencia de voz en grabaciones para priorizar revision humana o activar analitica solo en segmentos relevantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta pensado para ejecucion en CPU.
- GPU recomendadas: no necesarias; puede ejecutarse en cualquier CPU moderna.
- Cabe en GPU consumer: si, aunque no es su caso de uso optimo; el fichero ONNX de sherpa-onnx ocupa 643.854 bytes y el TorchScript es igualmente compacto.
- Opciones de despliegue: PyTorch (`torch.jit`), ONNX Runtime y sherpa-onnx.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera ejecucion en tiempo real en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Silero VAD (este repositorio) | no disponible (fichero ONNX de ~0,6 MB) | no aplica (ventanas de audio) | TorchScript, ONNX | MIT | Hugging Face y GitHub original |
| WebRTC VAD | no disponible | no aplica | C/C++ | BSD | Proyecto WebRTC |
| Silero VAD (repositorio original `snakers4/silero-vad`) | no disponible | no aplica | TorchScript, ONNX | MIT | GitHub |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La diferencia principal entre este repositorio y el original de Silero es que aqui los ficheros estan fijados por version y verificados por hash, mientras que el repositorio original puede actualizarse.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: no debe tratarse como fuente canonica ni como canal de soporte.
- No se documentan sesgos especificos; al ser un detector acustico, puede comportarse de forma distinta ante ruido de fondo, musica, voz sintetica o acentos y condiciones de microfono variadas.
- Riesgo de falsos positivos y falsos negativos en entornos ruidosos; no se aportan tasas de error en la informacion disponible.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta agentes ni tool calling.
- La licencia MIT permite uso comercial, pero el fichero `sherpa-onnx/silero_vad.onnx` procede de un proyecto cuyo codigo es Apache-2.0; conviene revisar ambas licencias antes de redistribuir.
- Al fijar versiones antiguas (v6.2 y v6.2.1), no se reciben mejoras ni correcciones de versiones posteriores de Silero VAD.
- Para produccion se recomienda verificar el SHA-256 de cada fichero tras la descarga y consultar la documentacion original para los tamanos de chunk y frecuencias de muestreo soportadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tuannd2702/silero-vad
- Repositorio original de Silero VAD: https://github.com/snakers4/silero-vad
- README original de Silero VAD: https://github.com/snakers4/silero-vad#readme
- Tag v6.2.1 de Silero VAD: https://github.com/snakers4/silero-vad/tree/v6.2.1
- Tag v6.2 de Silero VAD: https://github.com/snakers4/silero-vad/tree/v6.2
- Release `asr-models` de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models
- Repositorio de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
