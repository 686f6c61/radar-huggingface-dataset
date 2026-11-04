# spybyscript/scyllasband

## Resumen

Scylla's Band v3 es un sistema de síntesis de voz (text-to-speech) multilingüe y expresivo desarrollado por el usuario spybyscript y publicado con licencia Apache 2.0. El modelo se distribuye principalmente como un bundle LiteRT (aunque también existe una variante ONNX) y se ejecuta mediante un runtime propio, el Scylla's Band runtime, disponible en GitHub. La release documentada es `v3-20261103` y requiere runtime 3.0.0 o superior, ya que el contrato de grafo (`scyllasband_measured_controls_v3`) no es compatible con versiones anteriores.

La arquitectura es una cadena de varios componentes: un predictor de duración de fonemas, un predictor de tono basado en rectified flow, un generador latente continuo de rectified flow que sigue el contorno de tono predicho y un adaptador acústico con vocoder Vocos. El sistema trabaja a 24 kHz mono con 100 features mel y 24 canales latentes, y está diseñado para síntesis por pasajes de entre 1,4 y 9 segundos.

Su rasgo diferencial es el control explícito de la entrega vocal mediante tres parámetros globales por petición (intensidad, ritmo y tono, cada uno en rango −2 a 2), que permiten modular la expresividad sin necesidad de etiquetas de emoción. Cubre 14 voces y 6 idiomas (inglés, español, italiano, francés, alemán y vietnamita), con 84 pares voz/locale entrenados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Predictor de duración de fonemas → predictor de tono (rectified flow) → generador latente de rectified flow → adaptador acústico/Vocos |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (máximo de 512 fonemas por frase en el grafo; pasajes de 64 a 420 frames latentes, aprox. 1,4–9 s) |
| Tipos de cuantización | Pesos INT8 de rango dinámico en capas fully connected, convolución y embedding (bundle LiteRT); convoluciones depthwise del vocoder en precisión completa |
| Idiomas soportados | en (en_us, en_gb), es, it, fr, de, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT (TFLite), ONNX, PyTorch |
| Audio | Mono 24 kHz; 100 features mel; 24 canales latentes |
| Hop mel / latente | 256 / 512 muestras |
| Modelo de duración | Hidden size 320; 8 capas |
| Predictor de tono | Hidden size 384; 8 capas |
| Modelo vectorial | Hidden size 512; 12 capas; adaptive layer norm y QK norm |
| Sampler | Flow: Euler, 4 pasos. Pitch predictor: Heun, 8 pasos |
| Voces | 14 (Ariadne, Felix, Gwen, Ink, Kincade, Max, Orpheus, Poppy, Priya, Rex, Scylla, Stone, Thistle, Tuesday) |
| Pares voz/locale | 84 |
| Tamaño del repo | 14,7 GB |
| Tamaño del bundle LiteRT | 229 MB |

## Arquitectura y entrenamiento

El sistema es una cadena de modelos especializados en lugar de un único transformer extremo a extremo. Primero, un predictor de duración de fonemas (hidden size 320, 8 capas) estima la duración de cada fonema leyendo el texto vecino como contexto. Después, un predictor de tono (hidden size 384, 8 capas) integra desde ruido un contorno de tono y sonoridad por frame latente mediante rectified flow con sampler Heun de 8 pasos. A continuación, un generador latente continuo (hidden size 512, 12 capas, con adaptive layer normalization y QK normalization) produce los latentes acústicos siguiendo el contorno de tono, usando flow matching con Euler de 4 pasos. Finalmente, un adaptador acústico con vocoder Vocos convierte los latentes en波形 de audio a 24 kHz.

El flow está destilado para muestreo de pocos pasos: fue entrenado para reproducir la salida del flow base con Heun de 32 pasos, de modo que Euler con 4 pasos (cuatro evaluaciones del modelo por pasaje) es el valor por defecto. La condicionalidad de voz es fija por voz y locale: las referencias de identidad y prosodia están embebidas en los grafos, no se proporcionan en tiempo de inferencia. El frontend de texto es un G2P propio entrenado con tokenizador y vocabulario emparejados.

El texto largo se procesa por pasajes dentro del rango entrenado (64–420 frames latentes, aprox. 1,4–9 s): un primer pasaje corto para que el audio empiece rápido y después pasajes tan largos como permita el texto, cortados en fin de frase, cláusula o entre palabras. Cada pasaje ve el texto circundante como contexto y continúa desde la acústica del anterior, y los pasajes consecutivos se decodifican como una única forma de onda continua. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz multilingüe en inglés (americano y británico), español, italiano, francés, alemán y vietnamita.
- Control global de entrega por petición mediante tres parámetros: intensidad (−2 a 2), ritmo (−2 a 2) y tono (−2 a 2, en semitonos).
- La emoción se infiere del texto; la intensidad modula cuánto se expresa esa emoción, no qué emoción es.
- Ritmo afecta tanto a la velocidad de las palabras como a las pausas entre ellas (escala exp(−0,13 × pace)).
- Tono desplaza el contorno predicho en semitonos con un límite suave dentro del rango medido de cada voz.
- Gestión automática de texto largo mediante segmentación en pasajes con continuidad acústica entre ellos.
- 14 voces distintas con identidad y prosodia fijas embebidas en los grafos.
- Inferencia en CPU y dispositivos variados gracias al bundle LiteRT (Linux, Windows, Android, Intel Mac).
- No soporta curvas de control, canto ni etiquetas de emoción en esta release.

## Casos de uso

- **Atención al cliente automatizada**: el sistema puede generar respuestas habladas en seis idiomas con control de ritmo e intensidad para adaptar el tono al contexto de la conversación (por ejemplo, intensidad negativa para mensajes de disculpa o calma).
- **Audiolibros y narración larga**: la segmentación automática en pasajes de 1,4 a 9 segundos con continuidad acústica y decodificación en una sola forma de onda permite narrar textos extensos sin cortes audibles, ajustando el ritmo por pasaje.
- **Locución para vídeo y pódcast**: las 14 voces y el control de tono en semitonos permiten generar múltiples personajes o estilos con una sola instalación, y el bundle LiteRT de 229 MB facilita el despliegue en equipos sin GPU dedicada.
- **Asistentes de voz en dispositivos Android**: el soporte de LiteRT para Android y la cuantización INT8 de rango dinámico permiten ejecutar la síntesis en el propio dispositivo sin depender de la nube.
- **Accesibilidad y lectura de pantalla**: la síntesis multilingüe con control de velocidad (pace) permite adaptar la lectura a usuarios con distintas preferencias, y el procesamiento por pasajes mantiene la latencia baja al empezar con un primer pasaje corto.
- **Prototipado de interfaces conversacionales**: el runtime de línea de comandos (`python -m scyllasband speak`) y la selección de bundle (`--flavor litert` o `--flavor onnx`) permiten integrar la síntesis en pipelines de prueba rápidamente.
- **Localización de contenido**: con 84 pares voz/locale entrenados, un mismo contenido puede producirse en inglés, español, italiano, francés, alemán y vietnamita manteniendo una voz consistente por locale.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El bundle LiteRT ocupa 229 MB, lo que sugiere un requisito de VRAM/RAM muy inferior al tamaño del repo completo (14,7 GB, que incluye todos los formatos y variantes).
- Soporte declarado para Linux, Windows, Android e Intel Mac, lo que indica ejecución en CPU sin GPU dedicada.
- La cuantización INT8 de rango dinámico en capas fully connected, convolución y embedding reduce el coste computacional; las convoluciones depthwise del vocoder permanecen en precisión completa para mantenerse en XNNPACK.
- GPU recomendadas: no disponible en la información proporcionada.
- Despliegue mediante el runtime oficial de Scylla's Band (`pip install -e .` desde un checkout del repositorio) y selección de bundle con `--flavor litert` o `--flavor onnx`.
- Latencia y throughput: no disponibles. El diseño de pasajes (primer pasaje corto para arranque rápido, flow destilado a 4 pasos Euler) está orientado a baja latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| Scylla's Band v3 | no disponible | 512 fonemas/frase; pasajes 1,4–9 s | 6 | Apache 2.0 | LiteRT, ONNX, PyTorch |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos alternativos de la misma categoría (TTS multilingüe con control de prosodia) para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Los controles (intensidad, ritmo, tono) son globales por petición; no se admiten curvas de control, canto ni etiquetas de emoción en esta release.
- Los grafos v3 no son compatibles con runtimes v2: es necesario el runtime 3.0.0 o superior.
- Los valores fuera del rango −2 a 2 se recortan al límite; los controles no especificados toman el valor por defecto de la voz (0 en esta release).
- Los pasajes con menos de cuatro fonemas hablados (por ejemplo, un "Yes." aislado) conservan la intensidad y el ritmo propios de la voz, aunque el desplazamiento de tono sí se aplica.
- El rango de pasajes está limitado a 64–420 frames latentes (aprox. 1,4–9 s); textos más largos se segmentan automáticamente.
- La condicionalidad de voz es fija y está embebida en los grafos: no se puede clonar una voz arbitraria ni proporcionar referencias en tiempo de inferencia.
- No se dispone de información sobre sesgos, tasas de alucinación o calidad subjetiva (MOS) en la documentación proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del runtime y de los artefactos distribuidos por separado.
- El tamaño del repo (14,7 GB) implica una descarga considerable si se necesitan todos los formatos; el bundle LiteRT individual es de 229 MB.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/spybyscript/scyllasband)
- [Runtime de Scylla's Band (GitHub)](https://github.com/lowkeytea/scyllasband)
