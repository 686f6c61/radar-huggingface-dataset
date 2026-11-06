# udgamlabs/shruti-assamese

## Resumen

Shruti Assamese es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Udgam Labs, disenado especificamente para transcribir conversaciones en assames con inserciones de ingles (code-switching). Con aproximadamente 56 millones de parametros (55.875.913), se distribuye como un unico archivo de 29,7 MB en formato `.cact` con pesos cuantizados a 4 bits y activaciones de 8 bits, lo que permite su ejecucion en dispositivos moviles, portatiles y navegadores sin conexion a internet ni servidor.

El modelo forma parte de la familia Shruti, que cubre multiples idiomas indios, y se construye sobre Cactus Whistle (Apache-2.0) a traves de Shruti Hindi, con un reentrenamiento completo de pesos sobre voz en assames e ingles y la adicion de 700 piezas de vocabulario assames. Su propuesta principal es ofrecer transcripcion offline de alta calidad en un modelo extremadamente compacto: en conversaciones reales de assames con mezcla de ingles (DiarBench), obtiene una tasa de error de palabra (WER) de 30,2, frente a 37,9 de SraVaani-1.0 y 39,8 de IndicConformer-600M, modelos 31 y 86 veces mas grandes respectivamente.

La relevancia actual del modelo radica en su enfoque en eficiencia extrema y privacidad: cabe en cualquier dispositivo moderno, no requiere conectividad y transcribe aproximadamente 11 veces mas rapido que tiempo real en un Samsung Galaxy F62 de 2021 usando 64 MB de memoria. Es una opcion practica para aplicaciones de transcripcion en entornos con recursos limitados o donde la privacidad de los datos de audio es critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (8 capas de encoder + 8 capas de decoder, ancho 512) |
| Parametros totales | ~56M (55.875.913) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Audio de cualquier duracion (16 kHz); no se especifica limite de contexto en tokens |
| Tipos de cuantizacion | Pesos a 4 bits, activaciones a 8 bits (formato `.cact`) |
| Idiomas soportados | Assames (as), ingles (en), y assames mezclado con ingles |
| Licencia | Apache-2.0 (el modelo); terminos de los datos de entrenamiento segun se detalla en la model card |
| Formato de pesos | `.cact` (formato propietario del motor Cactus needle) |

## Arquitectura y entrenamiento

Shruti Assamese es un transformer encoder-decoder con 8 capas de encoder y 8 capas de decoder, con una anchura de 512 dimensiones y aproximadamente 56 millones de parametros. Se basa en Cactus Whistle (Apache-2.0) a traves de Shruti Hindi: Udgam Labs reentreno todos los pesos sobre voz en assames e ingles y anadio 700 piezas de vocabulario assames. El modelo se ejecuta sobre el motor Cactus needle (Apache-2.0), disponible en version nativa y WebAssembly.

Los datos de entrenamiento provienen de cinco fuentes: ai4bharat/IndicVoices, SPRINGLab/SPRING_INX_Assamese_R1, SPRINGLab/SPRING_INX_Assamese_R2, ARTPARK-IISc/Vaani-transcription-part y openslr/librispeech_asr. La model card indica que dos de estas fuentes no especifican licencia. No se detalla el numero total de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO. La innovacion principal es la compresion extrema: un modelo funcional de ASR en 29,7 MB que cabe en un telefono y funciona sin conexion, con soporte nativo para code-switching assames-ingles.

## Capacidades

- Transcripcion de voz a texto en assames, con salida en escritura assamesa (incluyendo caracteres propios como ৰ y ৱ).
- Manejo de code-switching assames-ingles: mas de la mitad de las palabras en ingles se mantienen en caracteres latinos en minusculas.
- Deteccion automatica del idioma (assames o ingles) a partir del audio de entrada.
- Procesamiento de audio de cualquier duracion a 16 kHz.
- Ejecucion offline en dispositivo (telefono, portatil, navegador) sin servidor ni conexion a internet.
- Inferencia mediante motor nativo (Cactus needle) y WebAssembly para navegador.
- No se menciona soporte de tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo ASR puro).

## Casos de uso

- Transcripcion offline en dispositivos moviles: el modelo cabe en 29,7 MB y usa 64 MB de memoria, por lo que puede integrarse en aplicaciones Android o iOS para transcribir conversaciones sin conexion, preservando la privacidad del audio.
- Subtitulado en tiempo real de reuniones con mezcla de assames e ingles: gracias a su velocidad de 11x tiempo real en hardware movil, puede generar subtitulos en directo en entornos donde los participantes alternan ambos idiomas.
- Notas de voz para periodistas y trabajadores de campo: transcripcion de entrevistas en assames con terminos en ingles en zonas sin cobertura de red, con salida en escritura assamesa.
- Asistentes de voz embebidos: integracion en dispositivos IoT o electrodomesticos que requieran reconocimiento de comandos en assames sin depender de la nube.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en tiempo real en aplicaciones de videollamada o streaming, ejecutandose localmente en el navegador mediante WebAssembly.
- Archivado y busqueda de contenido audiovisual en assames: transcripcion por lotes de grabaciones historicas o archivos de audio para indexacion y busqueda textual, sin costes de API en la nube.
- Educacion y aprendizaje de idiomas: transcripcion de material didactico en assames con vocabulario tecnico en ingles para generar ejercicios o subtitulos automaticos.

## Benchmarks y rendimiento

La model card proporciona resultados de WER (%, menor es mejor) medidos el 2 de noviembre de 2026 con los mismos clips y scorer para todos los modelos. Shruti Assamese se ejecuto en su motor on-device en un Mac. FLEURS tiene 200 clips; DiarBench, 84 turnos de 19 conversaciones.

| Modelo | WER DiarBench (solo palabras en ingles escritas en latino) | WER DiarBench (referencia nativa) | WER FLEURS (assames leido) | Tamano del archivo |
|---|---|---|---|---|
| Shruti Assamese | 30,2 | 43,2 | 35,1 | 29,7 MB |
| SraVaani-1.0 | 37,9 | 25,9 | 20,2 | ~921 MB (31x) |
| IndicConformer-600M | 39,8 | 29,1 | 21,9 | ~2,55 GB (86x) |
| IndicConformer Assamese int8 (comunidad) | 42,5 | 35,3 | 24,3 | 198,8 MB |

Nota: Whisper small no se ejecuto en assames. Kathbath no tiene assames, por lo que FLEURS es la unica prueba de lectura. No se han publicado resultados de MMLU, HumanEval ni GSM8K (no aplicables a un modelo ASR).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 64 MB de memoria en dispositivo (segun medicion en Samsung Galaxy F62). No requiere GPU dedicada.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU y ejecucion en dispositivo. Funciona en Mac, Android y navegador.
- Compatibilidad con GPU de consumo: no aplica; no requiere GPU. Cabe en cualquier dispositivo con al menos 64 MB de memoria disponible.
- Opciones de despliegue: motor Cactus needle (nativo y WebAssembly), paquete Python `cactus-needle`, binario `needle` para linea de comandos, y build WASM para navegador.
- Latencia y throughput: aproximadamente 11x mas rapido que tiempo real en un Samsung Galaxy F62 de 2021. No se proporcionan cifras de latencia absoluta ni throughput en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER DiarBench (mix) | WER DiarBench (nativo) | WER FLEURS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Shruti Assamese | ~56M | Audio de cualquier duracion | 30,2 | 43,2 | 35,1 | Apache-2.0 | Hugging Face, on-device |
| SraVaani-1.0 | ~1.700M (31x) | No disponible | 37,9 | 25,9 | 20,2 | No disponible | No disponible |
| IndicConformer-600M | ~600M (86x) | No disponible | 39,8 | 29,1 | 21,9 | No disponible | AI4Bharat |
| IndicConformer Assamese int8 (comunidad) | ~600M | No disponible | 42,5 | 35,3 | 24,3 | No disponible | Comunidad (198,8 MB) |

Shruti Assamese lidera en WER sobre conversaciones reales con code-switching cuando se cuentan solo las palabras en ingles escritas en caracteres latinos (30,2 frente a 37,9 y 39,8), pero queda por detras en la referencia nativa y en FLEURS (lectura de assames). El modelo es entre 31 y 86 veces mas pequeno que sus competidores directos.

## Limitaciones y advertencias

- Rendimiento inferior en assames nativo y lectura: en la referencia nativa de DiarBench obtiene 43,2 frente a 25,9 y 29,1 de SraVaani-1.0 e IndicConformer-600M; en FLEURS, 35,1 frente a 20,2 y 21,9.
- Errores de transcripcion documentados: la model card muestra ejemplos donde চাহখিনি se transcribe como জাহখিনি y flush como flash.
- Diferencias entre motores: el mismo clip puede transcribirse de forma distinta en el motor nativo del telefono y en el navegador del telefono (por ejemplo, যাহখিনি frente a জাহখিনি).
- Sin revision humana nativa: la model card indica explicitamente que ningun lector nativo de assames ha revisado la salida del modelo.
- Riesgo de alucinacion: como todo modelo ASR, puede generar texto plausible pero incorrecto, especialmente en audio ruidoso o con acentos no representados en los datos de entrenamiento.
- Limitaciones de idioma: solo soporta assames e ingles; otros idiomas requieren sus propios modelos Shruti.
- Licencia de datos: aunque el modelo es Apache-2.0, dos de las fuentes de datos de entrenamiento no especifican licencia, lo que puede afectar a un uso comercial estricto.
- Telemetria por defecto: el paquete Python `cactus-needle` envia conteos anonimos de uso salvo que se desactive con `NEEDLE_TELEMETRY=0`.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: es un modelo ASR puro, no un LLM de proposito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udgamlabs/shruti-assamese
- Pagina del modelo en Udgam Labs: https://udgamlabs.com/models/shruti/assamese
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/udgamlabs/Shruti
- Codigo y ejemplos (GitHub): https://github.com/udgamlabs/shruti/blob/main/docs/assamese.md
- Modelo base Shruti Hindi: https://huggingface.co/udgamlabs/Shruti
- Motor Cactus needle (needle3): https://huggingface.co/Cactus-Compute/needle3
- Cactus Whistle: https://huggingface.co/Cactus-Compute/whistle
- Shruti Marathi: https://huggingface.co/udgamlabs/shruti-marathi
- Shruti Tamil: https://huggingface.co/udgamlabs/shruti-tamil
- Shruti Bengali: https://huggingface.co/udgamlabs/shruti-bengali
- Shruti Telugu: https://huggingface.co/udgamlabs/shruti-telugu
- Shruti Gujarati: https://huggingface.co/udgamlabs/shruti-gujarati
- Shruti Odia: https://huggingface.co/udgamlabs/shruti-odia
- Shruti Kannada: https://huggingface.co/udgamlabs/shruti-kannada
- Shruti Urdu: https://huggingface.co/udgamlabs/shruti-urdu
- Shruti Malayalam: https://huggingface.co/udgamlabs/shruti-malayalam
- Pagina general de modelos de Udgam Labs: https://udgamlabs.com/models
- Pagina de Shruti (familia): https://udgamlabs.com/models/shruti
