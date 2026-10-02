# TrevorJS/BSRoformer-Wind-CoreML

## Resumen

BSRoformer-Wind-CoreML es la conversion a Core ML del stem de vientos (metales y maderas) del modelo BS-RoFormer perteneciente al paquete MVSep Mega de 53 stems. El modelo original es obra de MVSep y del ecosistema Music-Source-Separation-Training (ZFTurbo, licencia MIT), y la conversion la realizo Ben Karon; el repositorio de TrevorJS es un espejo del repositorio original en la revision `3ddc213`. La ficha corresponde a un modelo de separacion de fuentes musicales, no a un modelo de lenguaje: recibe un fragmento de audio estereo y devuelve la reconstruccion aislada del stem de vientos. En el reproductor slurper este stem se expone bajo la etiqueta "horns".

El artefacto distribuido es un paquete `bsr_wind_fp16.mlpackage` que encapsula todo el grafo de inferencia en float16: ventana de Hann periodica de 2048 muestras con salto de 512, DFT enventanada, band split, el transformer rotatorio axial, el estimador de mascara, la multiplicacion de mascara compleja y la DFT inversa. El modelo procesa fragmentos de 8 segundos a 44,1 kHz con una firma tensorial de `frames[1,2,690,2048] -> recon[1,2,690,2048]`. El repositorio ocupa aproximadamente 0,1 GB, lo que indica un modelo compacto orientado a ejecucion local en hardware Apple.

Su relevancia es practica: permite ejecutar un separador de stems de calidad de estudio completamente en local sobre el Neural Engine o la GPU de un Mac o dispositivo Apple, sin depender de servicios en la nube, y con una fidelidad numerica respecto a la implementacion de referencia en PyTorch muy alta (coseno 0,99998 y 44,7 dB de SDR sobre el fragmento de validacion).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BS-RoFormer (band split + transformer rotatorio axial) con estimador de mascara compleja |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio); procesa fragmentos de 8 s a 44,1 kHz |
| Tipos de cuantizacion | float16 (fp16) |
| Idiomas soportados | no aplica (modelo de audio; no procesa texto) |
| Licencia | no disponible (la licencia del codigo de Music-Source-Separation-Training es MIT; los pesos dependen del release upstream) |
| Formato de pesos | Core ML `.mlpackage` (fp16), mas ficheros de validacion `golden_raw.f32` y `golden_horns.f32` |
| Entrada | audio estereo, `frames[1,2,690,2048]` (8 s a 44,1 kHz, ventana Hann periodica de 2048, hop 512) |
| Salida | `recon[1,2,690,2048]`, stem de vientos reconstruido |
| Tamano del repositorio | 0,1 GB |
| Modelo base | noblebarkrr/BS-Roformer-MVSep-Mega-53-stems (checkpoint `v1/bs_mega_53stem_wind_mvsep.ckpt`) |

## Arquitectura y entrenamiento

La arquitectura es BS-RoFormer, un transformer con atencion rotatoria aplicada de forma axial sobre una representacion en bandas. El pipeline interno del paquete Core ML incluye, en orden, el enventanado con Hann periodica y la DFT, el band split (division del espectro en bandas de frecuencia), el transformer rotatorio axial, el estimador de mascara, la multiplicacion de mascara compleja en el dominio espectral y la DFT inversa. Todo el grafo, incluidas las operaciones espectrales, se ejecuta dentro del modelo en float16; el host unicamente se encarga del relleno por reflexion (`reflect-pad`), del enventanado del fragmento y de la suma con solapamiento de la salida dividida por la ventana al cuadrado sumada.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion (RLHF, DPO u otras) en la informacion proporcionada. El modelo procede del paquete MVSep Mega de 53 stems, del que este repositorio extrae unicamente el stem de vientos mediante un repack de una sola fuente. La innovacion tecnica destacable es la conversion completa a Core ML con las operaciones de DFT incluidas en el grafo y la publicacion de un fragmento dorado (`golden_raw.f32` / `golden_horns.f32`) para verificar la paridad numerica frente a PyTorch.

## Capacidades

- Separacion de fuentes musicales: aisla el stem de vientos (metales y maderas) de una mezcla musical estereo; en slurper se expone como stem "horns".
- Procesamiento por fragmentos: opera sobre bloques de 8 segundos a 44,1 kHz, pensados para encadenarse con solapamiento y suma (overlap-add) en el host.
- Inferencia local en hardware Apple: al estar en formato Core ML fp16, puede ejecutarse en el Neural Engine o la GPU de dispositivos Apple sin acceso a red.
- Paridad numerica verificada: la salida de Core ML coincide con la de PyTorch sobre el fragmento dorado con coseno 0,99998 (44,7 dB SDR).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo ni vision. No es un modelo de lenguaje ni multimodal.
- Capacidades multilingues: no aplica; el modelo no procesa texto.

## Casos de uso

- Remezcla y produccion musical: extraer la pista de vientos de una grabacion para reequilibrarla, sustituirla o procesarla por separado en la mezcla final, sin salir del equipo local.
- Aplicaciones nativas en macOS e iOS: integrar el `.mlpackage` en apps de edicion de audio que necesiten separacion de stems on-device, aprovechando la aceleracion por Neural Engine.
- Slurper: el modelo es la pieza que produce el stem "horns" dentro de este reproductor, por lo que su uso principal ya esta definido en ese flujo.
- Karaoke y versiones instrumentales: combinar este stem con otros del paquete Mega de 53 stems para generar mezclas alternativas o versiones sin vientos.
- Restauracion y archivado de catalogos: procesar grabaciones historicas o archivos de biblioteca para aislar secciones de vientos con fines de conservacion o reedicion.
- Post-produccion audiovisual: separar vientos en bandas sonoras o material de archivo para doblaje, montaje musical o ajustes de licencia por secciones.
- Investigacion en MIR (Music Information Retrieval): generar datasets de vientos aislados a partir de grabaciones mezcladas, o servir como referencia para comparar tecnicas de separacion de fuentes.
- Educacion musical: aislar la seccion de vientos de una pieza para su analisis, transcripcion o estudio de arreglos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de separacion (SDR, SIR, SAR sobre datasets estandar) en la informacion disponible. El unico dato de rendimiento disponible es la verificacion de paridad entre la conversion Core ML y la implementacion de referencia en PyTorch:

| Metrica | Valor |
|---|---|
| Similitud coseno Core ML vs PyTorch | 0,99998 |
| SDR Core ML vs PyTorch (fragmento dorado) | 44,7 dB |
| Fragmento de validacion | 8 s estereo, "Blues for Mundy" (The Airmen of Note), desde 0:32 |

Esta tabla mide fidelidad de la conversion, no calidad de separacion frente a la mezcla original.

## Requisitos de hardware

- VRAM / huella en memoria: no disponible de forma explicita; el repositorio completo ocupa 0,1 GB y el modelo opera en float16, por lo que la huella es reducida.
- Hardware objetivo: Core ML, orientado a dispositivos Apple (Apple Silicon, Neural Engine y GPU integrada). No se ha publicado compatibilidad verificada con otros aceleradores.
- GPU recomendadas: no disponible para GPU dedicadas NVIDIA o AMD; el formato Core ML no es directamente desplegable en CUDA.
- Consumer GPU: no aplica en el sentido habitual; el modelo esta pensado para ejecutarse en hardware Apple de consumo, no en tarjetas graficas de escritorio.
- Opciones de despliegue: Core ML mediante `coremltools` y el reproductor slurper. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de audio.
- Latencia y throughput: no disponibles. El modelo trabaja en bloques de 8 s a 44,1 kHz, y el coste total depende del numero de fragmentos y del solapamiento configurado en el host.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BSRoformer-Wind-CoreML (este) | BS-RoFormer, un solo stem (vientos) | no disponible | 8 s a 44,1 kHz, estereo, fp16 | no disponible | Core ML, repo de 0,1 GB |
| noblebarkrr/BS-Roformer-MVSep-Mega-53-stems | BS-RoFormer, paquete de 53 stems | no disponible | no disponible en la informacion proporcionada | no disponible | PyTorch (checkpoints) |
| Demucs (htdemucs) | Hibrido transformer + convolucional, 4 stems | no disponible | no disponible en la informacion proporcionada | MIT (segun el proyecto) | PyTorch |
| MDX-Net / modelos MVSep | Redes de separacion espectral | no disponible | no disponible | variable segun el modelo | ONNX / PyTorch |

No se dispone de datos de parametros, contexto ni rendimiento comparativo para estos modelos en la informacion proporcionada, por lo que la comparacion se limita a la categoria, el formato de despliegue y la cobertura de stems.

## Limitaciones y advertencias

- El modelo cubre un unico stem (vientos); no separa voces, bateria, bajo ni otros instrumentos. Para una separacion completa hay que combinar varios modelos del paquete Mega de 53 stems.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta agentes ni tool calling. Cualquier expectativa en ese sentido es inaplicable.
- La licencia del repositorio figura como no disponible. El codigo de Music-Source-Separation-Training es MIT, pero los pesos dependen de los terminos del release upstream; conviene verificar la licencia antes de un uso comercial.
- Riesgo de artefactos de separacion: como en cualquier modelo de separacion de fuentes, pueden aparecer filtraciones de otros instrumentos, coloracion espectral o bombeo en pasajes densos. No se han publicado metricas de calidad objetiva en este repositorio.
- Dependencia del host: la correccion del resultado depende de que el host aplique correctamente el relleno por reflexion, el enventanado y la suma con solapamiento dividida por la ventana al cuadrado sumada. Una implementacion incorrecta degrada la salida.
- Preprocesado fijo: la entrada debe ajustarse a la firma esperada (8 s, 44,1 kHz, estereo, Hann de 2048 con hop 512). Otras frecuencias de muestreo o configuraciones de ventana requieren remuestreo o conversiones adicionales.
- Precisión fp16: la inferencia en media precision puede introducir diferencias numericas minimas frente al modelo en PyTorch, cuantificadas en la paridad publicada.
- Sesgos del dataset de entrenamiento: no se dispone de informacion sobre la composicion del corpus de entrenamiento, por lo que no puede evaluarse su comportamiento frente a generos o instrumentaciones poco representadas.
- Repositorio sin adopcion registrada: cero descargas y cero likes en el momento de la consulta, lo que limita la evidencia de uso en produccion por terceros.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/TrevorJS/BSRoformer-Wind-CoreML
- Repositorio espejo original: https://huggingface.co/benkaron/BSRoformer-Wind-CoreML
- Modelo base (repack de un solo stem): https://huggingface.co/noblebarkrr/BS-Roformer-MVSep-Mega-53-stems
- Release upstream v1.0.21 de MVSep Mega 53-stem BS-RoFormer: https://github.com/ZFTurbo/Music-Source-Separation-Training/releases/tag/v1.0.21
- Codigo de entrenamiento y modelos (MIT): https://github.com/ZFTurbo/Music-Source-Separation-Training
- Slurper: https://github.com/TrevorS/slurper
- Fragmento de audio de validacion (dominio publico): https://commons.wikimedia.org/wiki/File:Blues_for_Mundy_-_Airmen_of_Note_-_United_States_Air_Force_Band.mp3
