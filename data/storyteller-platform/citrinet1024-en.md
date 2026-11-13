# storyteller-platform/citrinet1024-en

## Resumen

Citrinet 1024 English es un modelo de reconocimiento automatico del habla (ASR) en ingles, originalmente entrenado por NVIDIA y publicado como `nvidia/stt_en_citrinet_1024_gamma_0_25`. Esta ficha concreta corresponde al espejo `storyteller-platform/citrinet1024-en`, que redistribuye los pesos en dos formatos (ONNX y MLX) para su uso dentro de la plataforma Storyteller a traves de su herramienta `ghost-story`. No se trata, por tanto, de un modelo nuevo, sino de una conversion y empaquetado de un modelo existente.

La arquitectura Citrinet es una red convolucional de tipo CTC (Connectionist Temporal Classification) orientada a transcripcion de audio. El sufijo `1024` hace referencia al numero de canales del modelo y `gamma_0_25` al factor de compresion temporal aplicado en las capas. El modelo incluye un front end de mel-espectrograma integrado en el export ONNX y un tokenizador SentencePiece heredado de la variante de 512 canales.

Su relevancia practica es limitada fuera del ecosistema Storyteller: se trata de un modelo pequeno, especializado en ingles y con una unica funcion (transcripcion). Sin embargo, su licencia permisiva (CC-BY-4.0) y su formato ONNX lo hacen util para despliegues ligeros en CPU o en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Citrinet (CNN con CTC, variante de QuartzNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, ventana dependiente de la duracion de la entrada) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors y ONNX sin cuantizar) |
| Idiomas soportados | ingles |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX), ONNX |

## Arquitectura y entrenamiento

Citrinet es una arquitectura convolucional 1D disenada para ASR, sucesora de QuartzNet. Combina bloques residuales con convoluciones separables en profundidad, normalizacion por lotes y un factor de submuestreo temporal (`gamma`) que reduce la longitud de la secuencia antes de la capa CTC final. El modelo `1024` indica el numero de canales internos; `gamma_0_25` implica un submuestreo temporal de factor 4 respecto a la tasa de frames del front end.

El entrenamiento original fue realizado por NVIDIA sobre corpus de habla en ingles no especificados en la informacion disponible. No se detalla el numero de tokens, la composicion del dataset ni si hubo etapas de ajuste fino con RL. La conversion de Storyteller mantiene el encoder intacto: en el caso ONNX se anade el front end de mel (pre-enfasis, padding reflectante, calculo de features y longitudes) delante del encoder; en el caso MLX se conservan los pesos del encoder junto con el banco de filtros mel y la ventana del front end NeMo. El tokenizador SentencePiece proviene de la variante de 512 canales (`neongeckocom/stt_en_citrinet_512_gamma_0_25`).

## Capacidades

- Transcripcion de audio a texto en ingles (ASR) mediante decodificacion CTC.
- Procesamiento de audio de duracion variable; el export ONNX acepta la senal pre-enfatizada y con padding reflectante y calcula internamente las features mel y sus longitudes.
- Integracion con el pipeline de Storyteller a traves de `ghost-story`, que instala el modelo desde el registro.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta vision, audio generativo ni modo "thinking".
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Transcripcion de audiolibros y contenido narrado: el modelo se integra en Storyteller para generar transcripciones alineadas con el texto de libros, aprovechando su naturaleza CTC para obtener marcas temporales por token.
- Subtitulado automatico de video en ingles: el formato ONNX permite ejecutar el modelo en pipelines de postproduccion sin dependencia de GPU dedicada.
- Indexacion y busqueda de contenido hablado: transcripcion previa de archivos de audio para construir indices de texto consultables.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en entornos de habla inglesa.
- Procesamiento por lotes en CPU: al ser un modelo convolucional pequeno y exportado a ONNX, es adecuado para trabajos batch en servidores sin acelerador.
- Inferencia en dispositivos Apple Silicon: el formato MLX permite ejecutar el encoder de forma nativa en hardware Apple.
- Preprocesamiento en pipelines de datos: transcripcion masiva de corpus de audio en ingles para construir datasets de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 1,1 GB e incluye ambos formatos, por lo que cada uno de ellos es sustancialmente menor. Un modelo Citrinet de este tamano suele requerir menos de 2 GB de memoria en FP32.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el perfil del modelo, cualquier GPU con al menos 2-4 GB de memoria deberia ser suficiente.
- Compatibilidad con GPU de consumo: previsiblemente si, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (formato `model.onnx`), MLX (formato `model.safetensors`), y el pipeline de Storyteller mediante `ghost-story`. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| storyteller-platform/citrinet1024-en | no disponible | no disponible | ingles | CC-BY-4.0 | safetensors, ONNX |
| nvidia/stt_en_citrinet_1024_gamma_0_25 | no disponible | no disponible | ingles | CC-BY-4.0 | NeMo, ONNX |
| OpenVoiceOS/stt_en_citrinet_1024_gamma_0_25_onnx | no disponible | no disponible | ingles | CC-BY-4.0 | ONNX |
| neongeckocom/stt_en_citrinet_512_gamma_0_25 | no disponible | no disponible | ingles | no disponible | ONNX |

Las alternativas listadas son variantes o conversiones del mismo modelo base; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para otros idiomas.
- Es un modelo exclusivamente de ASR: no genera texto libre ni responde a instrucciones.
- Riesgo de errores de transcripcion en audio con ruido, acentos no estandar o vocabulario especializado; no se dispone de tasas de error (WER) en la informacion.
- No se han publicado datos sobre sesgos del modelo en la informacion disponible.
- La licencia CC-BY-4.0 permite uso comercial con atribucion; es necesario citar a NVIDIA como autor original y respetar los terminos de la licencia.
- El repositorio es un espejo mantenido por Storyteller; la version `2.0.0` corresponde a una revision concreta del registro y puede no coincidir con futuras actualizaciones.
- El tokenizador SentencePiece se hereda de la variante de 512 canales, lo que puede introducir diferencias respecto al tokenizador original de 1024 canales.
- No se garantiza compatibilidad con cargadores genericos de modelos de Hugging Face; el uso previsto es a traves de ONNX Runtime, MLX o `ghost-story`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/storyteller-platform/citrinet1024-en
- Modelo original NVIDIA (NGC): https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_en_citrinet_1024_gamma_0_25
- Export ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_en_citrinet_1024_gamma_0_25_onnx
- Tokenizador SentencePiece de origen: https://huggingface.co/neongeckocom/stt_en_citrinet_512_gamma_0_25
- Scripts de conversion (`convert.py`, `export-onnx.py`): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
- Registro de modelos de Storyteller: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/citrinet1024-en
