# twiggieeAU/Pocket-TTS-LiteRT

## Resumen

Pocket-TTS-LiteRT es una conversion del modelo Pocket TTS de Kyutai (un sistema de texto a voz de aproximadamente 100 millones de parametros) al formato LiteRT `CompiledModel`, disenado para ejecutarse en la GPU del telefono. El autor es el usuario twiggieeAU, y el modelo parte de la base `kyutai/pocket-tts`, con licencia CC BY 4.0. Su objetivo es resolver el problema de generar voz en moviles sin depender de la nube ni de GPUs dedicadas, manteniendo una calidad cercana a la referencia en CPU.

Arquitectonicamente, Pocket TTS es un modelo de flujo (flow-matching) sobre latentes continuos de 32 dimensiones del codec Mimi: un transformer causal de 6 capas y ancho 1024 genera un paso autorregresivo por frame a 12.5 Hz, y un MLP AdaLN de 6 bloques convierte un sorteo gaussiano en el siguiente latente. Un decodificador Mimi de ~20 millones de parametros (ConvTranspose x16, transformer deslizante de 2 capas y vocoder SEANet) reconstruye audio de 24 kHz. No se ha publicado la longitud de contexto en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching transformer sobre latentes Mimi (LM causal de 6 capas / 1024) + flow head AdaLN de 6 bloques + decodificador Mimi (ConvTranspose x16 + transformer 2 capas + SEANet) |
| Parametros totales | ~100 millones (modelo base Pocket TTS) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el texto se trocea en fragmentos de ≤50 tokens en fronteras de frase) |
| Tipos de cuantizacion | fp16 (graficos LiteRT `CompiledModel`, pesos y embeddings en fp16) |
| Idiomas soportados | Ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | LiteRT `CompiledModel` (.tflite) + binarios .bin para embeddings, proyeccion de entrada y voces |

## Arquitectura y entrenamiento

Pocket TTS consta de tres piezas. La primera es un modelo de lenguaje autorregresivo (6 capas, ancho 1024) que opera sobre latentes Mimi de 32 dimensiones a 12.5 Hz. Por cada frame, un flow head de 6 bloques AdaLN transforma un sorteo gaussiano (desviacion estandar √0.3) en el siguiente latente, con un unico paso de integracion (LSD, 1 step). El modelo usa atencion causal, posiciones RoPE y una cache KV empaquetada en el host; la permutacion de pares intercalados de RoPE se absorbe en la proyeccion QKV, lo que es exacto a nivel de bits. La segunda pieza es un decodificador Mimi de ~20 millones de parametros que sobremuestrea por 16 con ConvTranspose, aplica un transformer deslizante de 2 capas con ventana de 64 frames y solapamiento de 32, y termina en un vocoder SEANet que produce audio de 24 kHz. La tercera es la orquestacion en el host: tokenizer unigram de SentencePiece, embedding de tokens en fp16, proyeccion 32→1024, RoPE por paso, cache KV, ruido gaussiano y umbral EOS de -4.

Los datos de entrenamiento no se detallan en la informacion proporcionada; el modelo hereda los pesos del base `kyutai/pocket-tts`. No se menciona uso de RLHF ni DPO. La conversion a LiteRT es una reescritura numericamente equivalente salvo por una operacion: la GELU con erf se sustituye por un polinomio impar tangencial ajustado (error maximo de GELU 7.1e-5, aproximadamente 15 veces mas preciso que la GELU tangencial clasica). Los graficos se compilan completamente en GPU con LiteRT 2.1.6, excepto el transformer del decodificador Mimi, que se ejecuta en CPU en la configuracion por defecto para evitar degradacion audible.

## Capacidades

- Generacion de texto a voz en ingles, con voces fijas alba y marius que se cargan como estados de prompt por voz desde binarios `pt_voice_*.bin`.
- Ejecucion on-device en GPU de telefono: los graficos `pt_flowlm_fused` (o la variante descompuesta `pt_flowlm_step` + `pt_flow_head`), el flow head y el vocoder SEANet (`pt_mimi_deconly`) corren en GPU; el transformer del decodificador Mimi (`pt_mimi_dec_tx`) corre en CPU.
- Generacion no streaming: el audio se decodifica despues de la generacion completa.
- No requiere conexion a internet ni servicios en la nube; todo el procesamiento es local.
- Modelo no multimodal: no procesa vision ni audio de entrada, solo texto.
- No soporta tool calling, function calling, razonamiento multi-paso ni modo pensamiento: es un sistema de sintesis de voz, no un LLM generalista.

## Casos de uso

- Asistente de voz local en Android: el modelo puede integrarse en una app nativa que lea mensajes o responda sin conexion. En un Pixel 8a alcanza ~1.0x tiempo real, y en un Snapdragon SM8850 ~4.3-5.0x, lo que permite interacciones fluidas.
- Lectura de articulos o noticias en movil: una aplicacion puede trocear el texto en fragmentos de ≤50 tokens y generar audio de 24 kHz en el terminal. Es util para escuchar contenido en desplazamientos sin datos.
- Accesibilidad para personas con discapacidad visual: un lector de pantalla puede convertir texto en voz de forma privada, sin enviar la informacion del usuario a servidores externos.
- Integracion en Home Assistant mediante el protocolo Wyoming: la comunidad ha empaquetado Pocket TTS en un contenedor Docker compatible con Wyoming, y esta conversion LiteRT podria servir de base para una version acelerada por GPU en dispositivos moviles.
- Narracion local de libros o documentos: el modelo funciona sin conexion y con coste computacional bajo, por lo que es adecuado para tabletas o lectores electronicos que generan audio en el propio dispositivo.
- Avisos y notificaciones con voz sintetizada en domotica o automocion: el modelo produce frases cortas con tono natural y, gracias a la licencia CC BY 4.0, puede integrarse en productos comerciales con atribucion al autor.
- Prototipado rapido de aplicaciones TTS para Android: con la API `CompiledModel` de `ai-edge-litert`, el tokenizer de SentencePiece y unas pocas lineas de Kotlin o Python, un desarrollador puede integrar el modelo en una demo funcional en poco tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K) porque se trata de un modelo de texto a voz, no de un LLM. El autor ha publicado mediciones de rendimiento de inferencia en dos dispositivos moviles:

| Dispositivo (GPU) | Configuracion | Duracion de audio generado | Tiempo de generacion | Factor de velocidad |
|---|---|---|---|---|
| Pixel 8a (Tensor G3, Mali-G715) | Colocacion de la app (transformer del decodificador en CPU) | 8.8 s | 8.75 s | ~1.0x tiempo real |
| Samsung SM-S942Q (Snapdragon SM8850, Adreno) | Todo en GPU, graficos descompuestos | 8.2 s | 1.63 s | 5.0x tiempo real |
| Samsung SM-S942Q (Snapdragon SM8850, Adreno) | Todo en GPU, graficos descompuestos, 3 fragmentos | 13.0 s | 3.05 s | 4.3x tiempo real |

El autor advierte que estas cifras son un punto de medicion, no un benchmark, y que varian con el dispositivo, las condiciones termicas y la longitud del texto.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia se ejecuta en GPU de telefono con memoria compartida. No hay datos para VRAM dedicada.
- GPUs recomendadas segun las mediciones: Mali-G715 (Pixel 8a) y Adreno del Snapdragon SM8850 (Samsung SM-S942Q).
- Corre en GPU movil; el transformer del decodificador Mimi (2 capas) se ejecuta en CPU en la configuracion por defecto, porque en GPU produce una degradacion audible (HNR de 0.9 dB en GPU frente a 2.8 dB en CPU para la voz alba).
- El repositorio ocupa 1.1 GB, un tamano razonable para una app movil.
- Despliegue: se usa la libreria `ai-edge-litert` (LiteRT 2.1.6) con `CompiledModel.from_file` en Python, o Kotlin en Android. El autor indica que LiteRT ≥ 2.1.5 es necesario en Mali para las formas del op del nucleo en el paso KV.
- Latencia: ~1.0x tiempo real en Pixel 8a y 4.3-5.0x en Snapdragon SM8850, con la app en caliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Soporte de dispositivos | Licencia | Formato |
|---|---|---|---|---|---|
| kyutai/pocket-tts (base) | ~100M | No disponible | CPU (Python) | CC BY 4.0 | PyTorch / safetensors |
| kyutai/pocket-tts-without-voice-cloning | ~100M | No disponible | CPU | CC BY 4.0 | PyTorch / safetensors |
| Pocket-TTS-LiteRT (este modelo) | ~100M | No disponible (troceado ≤50 tokens) | GPU de telefono via LiteRT | CC BY 4.0 | LiteRT .tflite + .bin |

La diferencia fundamental frente a los modelos base es el formato de despliegue: Pocket-TTS-LiteRT reutiliza los pesos del base y los convierte en graficos LiteRT compilados para GPU, obteniendo tiempos reales en telefonos sin necesitar GPU dedicada ni servicios en la nube.

## Limitaciones y advertencias

- Idioma: solo ingles (en) segun la etiqueta del modelo; no hay soporte para otros idiomas.
- Sin streaming: el audio se decodifica despues de la generacion completa, lo que anade latencia inicial en textos largos; no se pueden emitir tramos parciales.
- La configuracion por defecto ejecuta el transformer del decodificador Mimi en CPU. El autor documenta que en GPU este subgrafo produce una degradacion audible (HNR 0.9 dB frente a 2.8 dB en CPU para la voz alba), por lo que la colocacion dividida es deliberada.
- La GELU activa se sustituye por un polinomio aproximado (error maximo 7.1e-5). Esto introduce una desviacion numerica pequena frente a la referencia en fp32, aunque las correlaciones medidas son 1.000000 en los subgrafos.
- El modelo requiere LiteRT ≥ 2.1.5 en Mali; la build usa 2.1.6. Version inferiores pueden romper la compatibilidad del op del nucleo en el paso KV.
- Hay una discrepancia en la identificacion: el repositorio en HuggingFace esta bajo `twiggieeAU/Pocket-TTS-LiteRT`, pero los enlaces de las muestras de audio y el codigo de uso minimo referencian `mlboydaisuke/Pocket-TTS-LiteRT`. Conviene verificar la procedencia antes de usar en produccion.
- No se aportan evaluaciones subjetivas de calidad (MOS) ni comparativas con otros sistemas TTS; el rendimiento se mide solo en tiempo de ejecucion en dos dispositivos.
- El texto se trocea en fragmentos de ≤50 tokens; no se documenta como se gestionan textos muy largos ni si hay perdida de coherencia en la prosodia entre fragmentos.

## Enlaces

- HuggingFace: https://huggingface.co/twiggieeAU/Pocket-TTS-LiteRT
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Pagina del proyecto Pocket TTS: https://kyutai-labs.github.io/pocket-tts/
- Repositorio GitHub de Kyutai: https://github.com/kyutai-labs/pocket-tts
