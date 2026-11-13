# storyteller-platform/citrinet256-en

## Resumen

Citrinet 256 English es un modelo de reconocimiento automatico del habla (ASR) en ingles, originalmente entrenado por NVIDIA y publicado como `nvidia/stt_en_citrinet_256_gamma_0_25`. La version aqui descrita es un espejo mantenido por storyteller-platform dentro de su registro de modelos, que redistribuye los pesos en dos formatos: ONNX (con el front end mel ya integrado) y safetensors en el layout que espera el cargador de MLX. No se trata, por tanto, de un modelo nuevo ni de un entrenamiento propio, sino de una conversion y empaquetado de un modelo preexistente.

Citrinet es una arquitectura convolucional (no transformer) disenada para ASR, con un tamano de 256 canales y un factor gamma de 0,25 en el pruning. El modelo resuelve la transcripcion de audio a texto en ingles y su relevancia actual radica en que ofrece una alternativa ligera y desplegable en CPU o Apple Silicon mediante ONNX Runtime o MLX, sin necesidad de GPUs dedicadas. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja un modelo compacto.

La ficha se basa unicamente en la informacion disponible en la model card y en los metadatos del repositorio de Hugging Face. No se han publicado resultados de benchmarks, detalles de entrenamiento ni especificaciones completas en la informacion proporcionada, por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Citrinet (red neuronal convolucional para ASR), no disponible el detalle de capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (layout MLX) y ONNX (`model.onnx`) |
| Tamano del repositorio | 0,1 GB |
| Front end | Mel filterbank y ventana de NeMo integrados en el ONNX; en safetensors se incluyen como tensores |
| Tokenizer | SentencePiece (`tokenizer.spm`), tomado de `neongeckocom/stt_en_citrinet_512_gamma_0_25` |
| Vocabulario | `vocab.txt` sin cambios respecto al export original |

## Arquitectura y entrenamiento

Citrinet es una arquitectura convolucional para reconocimiento de voz desarrollada por NVIDIA dentro de la familia NeMo. El modelo aqui distribuido corresponde a la variante de 256 canales con pruning gamma 0,25, es decir, una version podada del modelo base. La model card no detalla el numero de capas, el numero de parametros ni la composicion del dataset de entrenamiento; solo indica que el entrenamiento original es de NVIDIA y que la licencia es CC-BY-4.0.

La conversion realizada por storyteller-platform tiene dos variantes. La primera es un export ONNX en el que el front end mel (pre-enfasis, padding reflectivo, calculo de features y sus longitudes) se ha empalmado delante del encoder mediante `export-onnx.py`; el encoder en si no se modifica. La segunda es un `model.safetensors` con los pesos del encoder en el layout que espera el cargador de MLX, acompanado del filterbank mel y la ventana del front end de NeMo. El `config.json` describe la arquitectura, el front end y el layout de bloques. No se dispone de informacion sobre tecnicas de aumento de datos, decodificacion especulativa ni optimizaciones de inferencia mas alla del empaquetado.

## Capacidades

- Transcripcion de voz a texto en ingles (ASR).
- Inferencia en CPU mediante ONNX Runtime con el front end mel integrado en el grafo.
- Inferencia en Apple Silicon mediante MLX usando el formato safetensors.
- Modelo compacto (repo de 0,1 GB), adecuado para despliegues con recursos limitados.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente.
- No se ha documentado capacidad multilingue: solo ingles.
- No se ha documentado vision, audio generativo ni modos de razonamiento extendido.
- No se ha documentado puntuacion, diarizacion ni timestamps en la informacion disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: al ser un modelo convolucional ligero y desplegable via ONNX o MLX, puede ejecutarse en portatiles sin GPU dedicada para convertir grabaciones en ingles a texto.
- Subtitulado automatizado de contenido en ingles: el modelo puede integrarse en un pipeline que reciba audio y genere transcripciones para posterior alineacion y generacion de subtitulos.
- Preprocesado de audio para busqueda y analisis: transcripcion de archivos de audio en ingles para indexar y buscar por texto en archivos historicos.
- Prototipado de asistentes de voz: al no requerir infraestructura GPU, sirve para validar flujos de comando por voz en ingles antes de escalar a modelos mayores.
- Aplicaciones en Apple Silicon: el formato safetensors con layout MLX permite ejecutar la transcripcion en Macs con chip de la serie M, aprovechando la aceleracion nativa.
- Despliegue en entornos con restricciones de licencia permisivas: la licencia CC-BY-4.0 permite uso comercial con atribucion, lo que facilita su inclusion en productos derivados.
- Integracion en herramientas de accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en contenido en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio (0,1 GB) sugiere un modelo muy compacto que probablemente cabe en memoria de CPU, pero no se confirma.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el modelo esta empaquetado para ONNX y MLX, lo que sugiere ejecucion en CPU y Apple Silicon respectivamente.
- Opciones de despliegue: ONNX Runtime (formato `onnx`), MLX (formato `mlx` con `model.safetensors`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo ASR convolucional.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| storyteller-platform/citrinet256-en | Citrinet (CNN) | no disponible | no disponible | CC-BY-4.0 | ONNX, safetensors (MLX) | Espejo de NVIDIA con front end mel integrado |
| nvidia/stt_en_citrinet_256_gamma_0_25 | Citrinet (CNN) | no disponible | no disponible | CC-BY-4.0 | NeMo / ONNX | Modelo original de NVIDIA |
| OpenVoiceOS/stt_en_citrinet_256_gamma_0_25_onnx | Citrinet (CNN) | no disponible | no disponible | no disponible | ONNX | Export ONNX del que deriva esta conversion |
| neongeckocom/stt_en_citrinet_512_gamma_0_25 | Citrinet (CNN, 512 canales) | no disponible | no disponible | no disponible | NeMo | Variante mayor; fuente del tokenizer SentencePiece |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha documentado cobertura de otros idiomas.
- Es un modelo ASR, no un modelo de lenguaje: no genera texto libre ni razona; su salida es una transcripcion.
- No se dispone de informacion sobre sesgos acusticos, cobertura de acentos o robustez ante ruido.
- Riesgo de errores de transcripcion inherente a todo sistema ASR; no se han publicado tasas de error (WER) en la informacion disponible.
- La licencia CC-BY-4.0 permite uso comercial pero exige atribucion; debe conservarse la referencia a NVIDIA y a los autores originales.
- El repositorio es un espejo de terceros: la version, el mantenimiento y la integridad de los pesos dependen de storyteller-platform, no de NVIDIA.
- El tokenizer SentencePiece procede de un modelo distinto (variante de 512 canales); la model card indica que es compatible, pero conviene validarlo en produccion.
- No se han documentado garantias de soporte, actualizaciones ni correccion de errores por parte del mantenedor del espejo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/storyteller-platform/citrinet256-en
- Modelo original de NVIDIA en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_en_citrinet_256_gamma_0_25
- Export ONNX de OpenVoiceOS: https://huggingface.co/OpenVoiceOS/stt_en_citrinet_256_gamma_0_25_onnx
- Modelo fuente del tokenizer: https://huggingface.co/neongeckocom/stt_en_citrinet_512_gamma_0_25
- Repositorio de storyteller-platform (scripts de conversion): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
- Registro de modelos de Storyteller: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/citrinet256-en
