# Xylolabs/SenseVoiceSmall-Tensix-Precision-Components

## Resumen

SenseVoiceSmall-Tensix-Precision-Components es un archivo parcial de componentes de pesos derivado de FunAudioLLM/SenseVoiceSmall, un modelo de reconocimiento automatico del habla (ASR) desarrollado originalmente por FunAudioLLM (Alibaba Group). Xylolabs publica esta exportacion con el objetivo de ofrecer alternativas de precision (BFP4, BFP8 y BF16) de las proyecciones del encoder y de la cabeza CTC, empaquetadas en safetensors portables y orientadas a su despliegue sobre hardware Tenstorrent Tensix mediante TT-NN.

El repositorio no contiene un modelo completo listo para inferencia: es un archivo de componentes que requiere integracion arquitectonica, operandos compartidos (normalizacion, sesgos, FSMN/taps y estaticos) procedentes de un archivo complementario, preprocesado de audio y decodificacion de tokens. El perfil de origen declarado tiene 128 filas de entrada de caracteristicas y cuatro filas de consulta fijas (coreano/evento/emocion/ITN activado).

Su relevancia actual es acotada y muy especifica: sirve como material de referencia para quienes integran SenseVoiceSmall en aceleradores Tensix y necesitan variantes de precision ya cuantizadas con una ruta BF16-first reproducible. No incluye evaluacion de tarea ni metricas de velocidad, y su licencia (FunASR Model Open Source License Agreement v1.1) impone condiciones de atribucion y retencion del nombre del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de reconocimiento del habla derivado de SenseVoiceSmall (transformer con FSMN/taps, cabeza CTC); no se detalla la topologia completa en la informacion disponible |
| Parametros totales | no disponible (el archivo contiene 842 tensores de componentes, no un modelo completo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | BFP4 (round-to-nearest tras BF16, 4,5 bits/valor empaquetados), BFP8 (8,5 bits/valor empaquetados), BF16 |
| Idiomas soportados | ko (coreano) como idioma declarado en la model card |
| Licencia | funasr-model-license-1.1 (FunASR Model Open Source License Agreement v1.1) |
| Formato de pesos | safetensors (los tres ficheros portables almacenan BF16; los BFP4/BFP8 conservan valores ya cuantizados) |

## Arquitectura y entrenamiento

El material publicado no describe el entrenamiento del modelo base ni aporta datos sobre volumen de tokens, composicion del dataset o etapas de RLHF/DPO. Lo que si se detalla es el proceso de derivacion: Xylolabs parte de SenseVoiceSmall, aplica una ruta de preparacion BF16-first y genera tres grupos de alternativas de proyecciones y cabeza. El grupo `bf4_projections` contiene 280 matrices BFP4 redondeadas a nearest tras BF16; `bf8_projections` contiene 281 operandos BFP8 de proyecciones del encoder y cabeza CTC; `bf16_projections` contiene 281 alternativas en BF16. Las matrices conservan el orden de operador [in, out] y el escalado de query ya esta plegado en los pesos.

La innovacion tecnica del repositorio es el empaquetado nativo para Tensix: los datos tileados nativos suman 837.872.640 bytes y el conjunto requiere aproximadamente 0,84 GB de memoria de dispositivo solo para los pesos de componentes, mas espacio para buffers de trabajo. Los ficheros portables no reflejan la densidad empaquetada (por ejemplo, `bf4_projections.safetensors` ocupa 440.576.912 bytes y `bf8_projections.safetensors` 466.233.312 bytes). Se incluye un `component.json` con hash, forma, dtype almacenado y etiqueta de formato nativo de cada tensor, y un `load_components.py` que verifica hash, nombres, formas, dtype declarado y valores finitos en streaming.

## Capacidades

- Reconocimiento automatico del habla (ASR) en coreano, heredado del modelo base SenseVoiceSmall.
- Deteccion de eventos acusticos y emociones, segun las cuatro filas de consulta fijas del perfil de origen (coreano/evento/emocion/ITN activado).
- Normalizacion de texto inversa (ITN) activada en el perfil de consulta.
- Salida mediante cabeza CTC, con una alternativa BFP8 especifica que debe usarse si se quiere conservar el perfil BFP4 guardado.
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni agentes; es un componente de ASR.
- No es un modelo ejecutable de forma autonoma: requiere integracion arquitectonica, operandos compartidos y decodificacion de tokens.

## Casos de uso

- Integracion en aceleradores Tenstorrent Tensix: el archivo esta pensado para cargarse mediante TT-NN y combinarse con los operandos compartidos del archivo complementario, permitiendo desplegar ASR en coreano sobre hardware Tensix con precisiones BFP4/BFP8/BF16.
- Evaluacion de precisiones en ASR embebido: permite comparar el impacto de BFP4, BFP8 y BF16 en las proyecciones del encoder y la cabeza CTC dentro de un reconocedor integrado, manteniendo la ruta BF16-first.
- Investigacion de cuantizacion en hardware: sirve como material reproducible para estudiar el redondeo round-to-nearest tras BF16 y el empaquetado de 4,5 y 8,5 bits/valor en matrices tileadas.
- Pipeline de transcripcion de audio en coreano: una vez integrado con preprocesado y decodificacion, puede emplearse para transcribir audio con deteccion de eventos y emociones en aplicaciones de analisis de llamadas o contenido multimedia.
- Verificacion de procedencia de pesos: los hashes, formas y comprobaciones de integridad del `component.json` permiten auditar la cadena de transformacion desde el ONNX original hasta las alternativas cuantizadas.
- Prototipado de reconocedores sobre hardware no convencional: util para equipos que evaluan Tensix frente a GPU para cargas de ASR de baja latencia y bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las comprobaciones realizadas son de representacion y procedencia (842 tensores finitos, decodificados sin cambios y reempaquetados exactamente mediante TT-NN 0.81.1 en simulador), que no se asigna ninguna puntuacion de tarea al archivo autonomo y que no se reporta velocidad.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 0,84 GB solo para los pesos de componentes, mas buffers de trabajo.
- Hardware objetivo: aceleradores Tenstorrent Tensix, con integracion mediante TT-NN (version de referencia 0.81.1).
- GPU: no disponible; el material no documenta despliegue en GPU ni en hardware consumer.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: carga mediante `load_components.py` y PyTorch/safetensors; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este componente de ASR).
- Latencia y throughput: no disponibles; la model card afirma que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/SenseVoiceSmall-Tensix-Precision-Components | Archivo parcial de componentes ASR (BFP4/BFP8/BF16) | no disponible (842 tensores) | no aplica | funasr-model-license-1.1 | Hugging Face, 0 descargas, 0 likes |
| FunAudioLLM/SenseVoiceSmall | Modelo ASR completo (base) | no disponible en la informacion proporcionada | no aplica | funasr-model-license-1.1 | Hugging Face |
| Xylolabs/SenseVoiceSmall-Tensix-BFP8-Components | Archivo complementario de operandos compartidos (BFP8) | no disponible | no aplica | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo completo: sin integracion arquitectonica, operandos compartidos del archivo complementario, preprocesado y decodificacion de tokens no produce transcripciones.
- El idioma declarado es unicamente coreano (ko); no se documenta soporte multilingue en este archivo.
- No se ha evaluado la tarea de reconocimiento sobre este archivo; no hay puntuaciones WER/CER ni latencias publicadas.
- Mezclar alternativas de este archivo con las del archivo BFP8 complementario requiere una evaluacion propia del reconocedor integrado, ya que las matrices BFP8 del complementario siguen una ruta de redondeo distinta.
- Para conservar el perfil BFP4 guardado debe usarse la cabeza CTC BFP8 incluida en este mismo archivo.
- Los tamanos de descarga de los ficheros portables no reflejan la densidad empaquetada nativa; no deben usarse para estimar memoria de dispositivo.
- Licencia FunASR Model Open Source License Agreement v1.1: permite copia, modificacion y comparticion con atribucion de fuente y autor y retencion del nombre del modelo; incluye clausulas de proposito de referencia/aprendizaje, conducta comunitaria, terminacion y revision que deben revisarse antes de uso comercial.
- Riesgo de sesgos y alucinacion del modelo base no documentado en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria observable.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tensix-Precision-Components
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Archivo complementario BFP8: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tensix-BFP8-Components
- Repositorio de codigo Tensix BFP GPTQ: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tensix-Precision-Components/blob/main/LICENSE
- Script de carga: https://huggingface.co/Xylolabs/SenseVoiceSmall-Tensix-Precision-Components/blob/main/load_components.py
