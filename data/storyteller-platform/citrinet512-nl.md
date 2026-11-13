# storyteller-platform/citrinet512-nl

## Resumen

Citrinet 512 Dutch es un modelo de reconocimiento automatico del habla (ASR) para neerlandes, publicado por storyteller-platform como espejo de version `2.0.0` del modelo homonimo del registro de Storyteller. El modelo original fue entrenado por neongeckocom (`stt_nl_citrinet_512_gamma_0_25`) y aqui se redistribuye en dos formatos: ONNX (`model.onnx`) y MLX (`model.safetensors`), con configuracion, vocabulario SentencePiece y tokenizer incluidos.

Se trata de una arquitectura Citrinet de 512 canales, derivada de QuartzNet y perteneciente a la familia de redes convolucionales 1D con conexiones residuales, pensada para transcripcion de audio con requisitos computacionales moderados. El repositorio no documenta el numero de parametros, la longitud de contexto ni los idiomas mas alla del neerlandes implicito en el nombre; la model card se limita a describir el proceso de conversion y el contenido de cada fichero.

Su relevancia actual es operativa: Storyteller lo instala automaticamente via `ghost-story` para transcripcion de audio en neerlandes, y la disponibilidad de una exportacion ONNX con el frontend mel integrado permite ejecutar inferencia sin dependencias del framework NeMo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Citrinet 512 (CNN 1D con conexiones residuales, familia QuartzNet/Citrinet) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, opera sobre ventanas de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | neerlandes (implicito en el nombre; no confirmado en la model card) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (MLX), ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

Citrinet 512 es una red neuronal convolucional 1D con bloques residuales, sucesora de QuartzNet, que sustituye las capas de convolucion con dilatacion por convoluciones regulares y usa strides para reducir la resolucion temporal. El sufijo `512` indica el numero de canales en las capas convolucionales. El sufijo `gamma_0_25` del modelo original hace referencia a un parametro de compresion de la funcion de perdida, comun en la familia NeMo.

La model card de este repositorio no aporta informacion sobre volumen de datos de entrenamiento, composicion del dataset, ni uso de tecnicas como RLHF o DPO (no aplicables tipicamente a ASR). El entrenamiento original corresponde a neongeckocom; este repositorio solo documenta la conversion: `model.safetensors` contiene los pesos del encoder en el layout que espera el loader MLX, junto con el filtro mel y la ventana del frontend NeMo; `model.onnx` es la exportacion con el frontend mel integrado delante del encoder, de modo que acepta la senal preenfatizada y con padding reflectante y calcula las features y su longitud por si mismo. El encoder no se modifica respecto al original.

## Capacidades

- Reconocimiento automatico del habla en neerlandes (transcripcion de audio a texto).
- Extraccion de features mel integrada en la exportacion ONNX (no requiere frontend externo).
- Tokenizacion mediante SentencePiece (`tokenizer.spm`).
- Inferencia en entornos MLX (Apple Silicon) mediante `model.safetensors`.
- Inferencia portable via ONNX Runtime mediante `model.onnx`.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo, razonamiento multi-paso ni modo thinking.

## Casos de uso

- Transcripcion de audio en neerlandes dentro de Storyteller: el modelo se instala automaticamente via `ghost-story` y se usa como motor ASR del pipeline de la plataforma, sin configuracion manual del usuario.
- Servicio de subtitulado automatizado: integracion del `model.onnx` en un servicio backend con ONNX Runtime para generar subtitulos de contenido audiovisual en neerlandes.
- Procesamiento por lotes de grabaciones: al ser una CNN con requisitos moderados, permite transcribir grandes volumenes de audio en CPU o GPU sin depender de frameworks pesados.
- Aplicaciones de escritorio en Apple Silicon: la variante MLX permite transcripcion local en Macs con chip M-series, evitando envio de audio a servicios externos.
- Investigacion en ASR convolucional: el repositorio sirve como referencia reproducible para estudiar Citrinet 512 y comparar exportaciones ONNX frente a MLX sobre el mismo encoder.
- Integracion en pipelines de accesibilidad: transcripcion en tiempo casi real de reuniones o clases en neerlandes, con el frontend mel integrado simplificando el preprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se documenta el numero de parametros).
- GPU recomendadas: no disponibles; al tratarse de Citrinet 512, el consumo es tipicamente moderado, pero no hay datos que lo confirmen.
- Compatibilidad con GPU consumer: no confirmada; la variante MLX esta pensada para Apple Silicon.
- Opciones de despliegue: ONNX Runtime (para `model.onnx`), MLX (para `model.safetensors`), integracion via `ghost-story` en Storyteller.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Citrinet 512 Dutch (este) | Citrinet 512 | no disponible | no disponible | BSD-3-Clause | Hugging Face (espejo), GitLab Storyteller |
| neongeckocom/stt_nl_citrinet_512_gamma_0_25 | Citrinet 512 | no disponible | no disponible | BSD-3-Clause | Hugging Face (original) |
| OpenVoiceOS/neongeckocom-stt_nl_citrinet_512_gamma_0_25_onnx | Citrinet 512 (ONNX) | no disponible | no disponible | no disponible | Hugging Face (exportacion ONNX) |

Los tres modelos comparten el mismo encoder; las diferencias estriban en el formato de distribucion y en el frontend integrado o no. No se dispone de alternativas comparables de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se declara uso en neerlandes; no hay confirmacion de cobertura multilingue ni de robustez ante acentos o variantes dialectales.
- No se documenta el volumen ni la composicion del corpus de entrenamiento, por lo que no se pueden evaluar sesgos demograficos, acusticos o de dominio.
- Riesgo de alucinacion y errores de transcripcion inherente a cualquier modelo ASR; sin benchmarks publicados no se puede acotar la tasa de error (WER).
- La model card no especifica el numero de parametros ni requisitos de memoria, lo que dificulta planificar el despliegue.
- La licencia BSD-3-Clause permite uso comercial con atribucion, pero conviene conservar los avisos de copyright del autor original (neongeckocom) y de la plataforma que redistribuye.
- El repositorio registra 0 descargas y 0 likes; no hay evidencia de validacion por parte de la comunidad.
- La exportacion ONNX modifica el preprocesado (preenfasis y padding reflectante) respecto al uso original; integraciones que esperen audio en crudo deben tenerlo en cuenta.
- No se documentan tecnicas de mitigacion de sesgos ni evaluaciones de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/storyteller-platform/citrinet512-nl
- Modelo original (entrenamiento): https://huggingface.co/neongeckocom/stt_nl_citrinet_512_gamma_0_25
- Exportacion ONNX de referencia: https://huggingface.co/OpenVoiceOS/neongeckocom-stt_nl_citrinet_512_gamma_0_25_onnx
- Repositorio Storyteller (GitLab): https://gitlab.com/storyteller-platform/storyteller
- Scripts de conversion (`convert.py`, `export-onnx.py`): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
