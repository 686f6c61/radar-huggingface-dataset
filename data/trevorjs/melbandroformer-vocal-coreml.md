# TrevorJS/MelBandRoformer-Vocal-CoreML

## Resumen

MelBandRoformer-Vocal-CoreML es la conversión a Core ML del modelo de separación de fuentes vocales KimberleyJSN/melbandroformer, publicada por el usuario TrevorJS. Se distribuye como un paquete coreml (`mbr_fp16.mlpackage`) en precisión float16, pensado para ejecutarse en la GPU de equipos Apple con macOS 15 o posterior. El modelo aísla la pista de voz de una mezcla musical estéreo a 44,1 kHz; la instrumental se obtiene restando la voz a la mezcla original.

El modelo base es un Mel-Band RoFormer de aproximadamente 228 millones de parámetros, arquitectura de separación de fuentes derivada de BS-RoFormer que opera con atención sobre bandas de frecuencia mel. La conversión integra el STFT y su inversa directamente en el grafo como productos matriciales DFT constantes, con ventana Hann periódica, de modo que el host solo tiene que gestionar el solapamiento y suma de fragmentos. El objetivo es habilitar separación de voz on-device en aplicaciones macOS sin depender de servicios en la nube ni de GPUs NVIDIA.

El interés práctico reside en que traslada un modelo de separación de alta calidad a un formato nativo de Apple, con una fidelidad respecto al original de PyTorch de 39,6 dB SDR y similitud coseno de 0,999946. Está licenciado bajo MIT y el repositorio ocupa 0,5 GB, con un fichero de pesos de 490 MB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mel-Band RoFormer (transformer con atencion sobre bandas mel, derivado de BS-RoFormer) |
| Parametros totales | 228 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa fragmentos de 8 s / 352 800 muestras a 44,1 kHz) |
| Tipos de cuantizacion | float16 (unico formato distribuido; no hay GGUF ni int8) |
| Idiomas soportados | no disponible (modelo de separacion de fuentes de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | Core ML `.mlpackage` (ML program; `weight.bin` de 490 MB) |

Datos adicionales del grafo:

| Elemento | Forma | Significado |
|---|---|---|
| `frames` (entrada) | `[1, 2, 801, 2048]` | frames de 2048 muestras sin ventana, hop 441, con reflect-padding de 1024 a cada lado |
| `recon` (salida) | `[1, 2, 801, 2048]` | frames IDFT con ventana correspondientes a la voz |

## Arquitectura y entrenamiento

La arquitectura es un Mel-Band RoFormer, variante de los modelos RoFormer para separación de fuentes que aplica atención sobre bandas de frecuencia organizadas en escala mel, en lugar de sobre el espectrograma completo. El checkpoint original fue entrenado por Kimberley Jensen usando el código de entrenamiento de ZFTurbo sobre la implementación de BS-RoFormer de lucidrains; la autoría del método corresponde a Ju-Chiang Wang, Wei-Tsung Lu y Minz Won (ByteDance). No se dispone en la información proporcionada de detalles sobre volumen de datos, composición del dataset ni si hubo etapas de ajuste con preferencia humana.

La conversión, documentada en `scripts/convert_melband_roformer.py` del proyecto slurper y basada en la receta de coreai-model-zoo, aplica varias transformaciones: el *scatter* de promedio por bandas se convierte en un producto matricial constante, la multiplicación por máscara compleja se reescribe como aritmética real, los ángulos rotatorios pasan a ser constantes y la atención se canaliza mediante `scaled_dot_product_attention`. El modelo se traza con `torch.jit.trace` y se exporta con coremltools 9.0 a un ML program en float16. El STFT y su inversa quedan plegados en el grafo como matmuls DFT constantes con ventana Hann periódica, de forma que el host solo realiza overlap-add a hop 441, divide por la suma de ventanas al cuadrado y descarta el padding de 1024 muestras. Los fragmentos consecutivos de una canción se solapan al 50 % con crossfades lineales.

## Capacidades

- Separación de voces a partir de una mezcla musical estéreo a 44,1 kHz: genera un tensor de frames IDFT con ventana correspondiente a la pista vocal.
- Cálculo implícito de la instrumental: restando la salida de voz a la mezcla original.
- Procesamiento por fragmentos de 8 segundos (352 800 muestras) con solapamiento y crossfade para cubrir canciones completas.
- Ejecución on-device en la GPU de Apple, sin conexión a red, sobre macOS 15 o superior.
- Integración como ML program de Core ML, invocable desde Swift; el repositorio slurper incluye `VocalSeparator.swift` como host de referencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo audio-a-audio (`pipeline_tag: audio-to-audio`).
- No se documentan capacidades multilingües ni de otro tipo, ya que no procesa lenguaje.

## Casos de uso

- Funciones de karaoke en aplicaciones de escritorio para macOS: el modelo aísla la voz y el host genera la pista instrumental por resta, sin subir audio a servidores externos.
- Herramientas de DJ y producción musical: separar stems vocales para remezclas, mashups o edición por capas dentro de una DAW o una app nativa.
- Remasterización y limpieza de archivos históricos: extraer la voz para aplicar procesado de dinámica, reducción de ruido o ecualización por separado sobre voz e instrumental.
- Preprocesado para reconocimiento automático de voz en contenido musical: al eliminar la música de fondo se mejora la transcripción de letras con modelos ASR, aunque la calidad en pasajes muy densos depende del material.
- Edición de audio y postproducción ligera: sustituir o silenciar la voz de una mezcla manteniendo la instrumentación intacta.
- Aplicaciones de privacidad y cumplimiento: procesar audio confidencial (maquetas, material no publicado) íntegramente en el dispositivo, sin salida del contenido a la nube.
- Investigación en separación de fuentes: servir como referencia reproducible de conversión Core ML para comparar fidelidad y latencia frente al modelo PyTorch.
- Funciones offline en apps distribuidas por App Store: al ser MIT y Core ML, se integra como recurso local sin coste de inferencia en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de separación estándar (SDR sobre MUSDB18, SiSEC, etc.) en la información disponible. Los únicos datos facilitados son métricas de fidelidad de la conversión frente al modelo original de PyTorch sobre el fragmento dorado (`golden_raw.f32`):

| Metrica | Valor |
|---|---|
| Similitud coseno (grafo float32 re-autorado vs PyTorch) | 0,9999984 |
| Similitud coseno (Core ML float16 vs PyTorch) | 0,999946 |
| SDR (Core ML float16 vs PyTorch) | 39,6 dB |

## Requisitos de hardware

- Peso del modelo: `weight.bin` de 490 MB en float16; se recomienda reservar aproximadamente 1 GB de memoria unificada entre pesos y buffers de activaciones para cada fragmento de 8 s.
- Plataforma: exclusivamente Apple. Requiere macOS 15 o posterior y ejecuta en la GPU mediante Core ML.
- GPU recomendadas: cualquier chip Apple Silicon (familias M1, M2, M3, M4 y posteriores). No es compatible con GPUs NVIDIA, AMD o Intel bajo este formato, ya que no hay exportación a CUDA ni a GGUF.
- No cabe ni se puede ejecutar en GPUs de consumo NVIDIA (RTX 4090, etc.) por el formato Core ML; el equivalente requeriría el modelo PyTorch original.
- Opciones de despliegue: Core ML / ML program en aplicaciones Swift, con `Sources/SlurperKit/VocalSeparator.swift` del repositorio slurper como host de referencia, o la receta de coreai-model-zoo para reproducir la conversión. vLLM, llama.cpp, Ollama y TGI no aplican a este modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El rendimiento depende del chip concreto y del coste del overlap-add en el host.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| TrevorJS/MelBandRoformer-Vocal-CoreML | 228 M | fragmento de 8 s a 44,1 kHz | Core ML fp16 | MIT | Apple (Core ML) |
| KimberleyJSN/melbandroformer | 228 M | misma entrada | PyTorch | MIT | multiplataforma con soporte PyTorch |
| BS-RoFormer (lucidrains) | no disponible | no disponible | PyTorch | MIT | multiplataforma con soporte PyTorch |
| Demucs v4 (htdemucs) | no disponible | musica estereo | PyTorch | MIT | multiplataforma con soporte PyTorch |
| Open-Unmix (UMX) | no disponible | musica estereo | PyTorch / ONNX | MIT | multiplataforma con soporte PyTorch |

El checkpoint de referencia de KimberleyJSN/melbandroformer es el equivalente directo en PyTorch; esta versión Core ML añade ejecución nativa en Apple a costa de fijar la plataforma. No se dispone de datos de parámetros ni de rendimiento comparativo para BS-RoFormer, Demucs v4 u Open-Unmix en la información proporcionada.

## Limitaciones y advertencias

- Solo separa voces: la instrumental no es una salida directa del modelo, sino el resultado de restar la voz a la mezcla, por lo que cualquier error del separador deja residuos audibles en la instrumental.
- Artefactos en bordes de fragmento: el modelo procesa ventanas de 8 s y el host debe aplicar overlap-add a hop 441 con crossfades lineales; una implementación incorrecta introduce discontinuidades o bombeo en la señal.
- Formato y tasa fijos: la entrada es estéreo a 44,1 kHz con frames de 2048 muestras y hop 441; material en mono, otras tasas de muestreo o distinto enventanado requiere preprocesado previo.
- Dependencia de plataforma: al ser un ML program de Core ML, no se puede ejecutar fuera del ecosistema Apple (macOS 15 y posteriores). No hay versión CUDA, ONNX, GGUF ni compatible con llama.cpp u Ollama.
- Comportamiento en material difícil: no se documentan métricas separadas por género, idioma ni tipo de mezcla. Como todo separador entrenado con datos musicales, es probable que rinda peor en grabaciones muy reverberadas, coros densos o instrumental con timbres vocales.
- Sesgos de dataset: no se especifica la composición del conjunto de entrenamiento del modelo base, por lo que no es posible evaluar sesgos hacia géneros, épocas o tradiciones musicales concretas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de artefactos o de reconstruir contenido vocal inexistente en pasajes ambiguos.
- Licencia y atribución: la conversión es MIT y permite uso comercial, pero conviene verificar la licencia del checkpoint original y respetar la atribución a ByteDance (Mel-Band RoFormer), al checkpoint de Kimberley Jensen, a ZFTurbo (código de entrenamiento), a lucidrains (implementación BS-RoFormer) y a coreai-model-zoo (receta de exportación, BSD-3-Clause).
- Sin garantías de calidad en producción: la única validación publicada es sobre un fragmento dorado; no hay pruebas a gran escala ni comparativas contra el estado del arte en MUSDB18.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TrevorJS/MelBandRoformer-Vocal-CoreML
- Modelo base (PyTorch): https://huggingface.co/KimberleyJSN/melbandroformer
- Repositorio slurper (host de referencia y scripts de conversión): https://github.com/TrevorS/slurper
- Receta de conversión en coreai-model-zoo: https://github.com/john-rocky/coreai-model-zoo/tree/main/conversion/melband_roformer
