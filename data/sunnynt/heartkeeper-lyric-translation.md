# Sunnynt/heartkeeper-lyric-translation

## Resumen
Heartkeeper lyric translation packs es una colección de exportaciones en formato LiteRT (TFLite) de modelos de traducción Marian, empaquetados para su uso en el reproductor de música Heartkeeper. Cada paquete traduce letras de canciones desde un idioma de origen (japonés, coreano, chino, ruso, árabe, griego, turco, francés, alemán, español, italiano, neerlandés o catalán) hacia el inglés, ejecutándose íntegramente en el dispositivo. El autor del repositorio es Sunnynt, aunque el contenido es una copia byte a byte de los paquetes generados por SFG545 para el proyecto Orchard mediante el script `build_packs.py`.

El modelo no es una arquitectura nueva: se trata de conversiones a int8 de modelos MarianMT de OPUS-MT (Helsinki-NLP) y de ElanMT (Mitsua), con las firmas de encode, prefill y decode adaptadas y una `pad_mask` aditiva para la inferencia en LiteRT. El repositorio tiene un tamaño de 1,1 GB y contiene 14 paquetes independientes, cada uno con su `model.tflite`, su tokenizador `source.spm` sin modificar y su `vocab.json`.

La relevancia de esta ficha es acotada: no se trata de un modelo de propósito general, sino de un artefacto de despliegue para traducción de letras en un reproductor de música concreto. No hay información sobre parámetros, contexto ni benchmarks en la documentación disponible, y cada paquete hereda la licencia de su modelo de origen, lo que condiciona su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder), exportada a LiteRT/TFLite int8 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (exportación LiteRT) |
| Idiomas soportados | Origen: ja, ko, zh, ru, ar, el, tr, fr, de, es, it, nl, ca; destino: en |
| Licencia | other (cada paquete hereda la de su modelo fuente: Apache-2.0, CC BY 4.0 o CC BY-SA 4.0) |
| Formato de pesos | TFLite (`model.tflite`), más `source.spm` y `vocab.json` |

## Arquitectura y entrenamiento
Cada paquete contiene un modelo Marian traducido a LiteRT con tres firmas diferenciadas: encode, prefill y decode, y una máscara de padding aditiva (`pad_mask`). Esta separación permite una decodificación incremental en el dispositivo, típica de la inferencia autorregresiva en entornos móviles. No hay información sobre el número de parámetros, los datos de entrenamiento ni el proceso de ajuste de los modelos Marian subyacentes en la documentación proporcionada.

Los modelos de origen son los OPUS-MT de Helsinki-NLP (Tiedemann y Thottingal, EAMT 2020) y ElanMT de Mitsua (`elan-mt-tiny-ja-en`). El paquete `jpn-eng` usa ElanMT con licencia CC BY-SA 4.0; el resto de paquetes usan OPUS-MT con licencias Apache-2.0 o CC BY 4.0 según el par de idiomas. La conversión se realizó con `scripts/translation/build_packs.py` del proyecto Orchard y los ficheros son copias byte a byte del repositorio `SFG545/orchard-lyric-translation` en el commit `2eadc41be066`.

## Capacidades
- Traducción de texto de un idioma de origen al inglés, en 13 pares de idiomas (japonés, coreano, chino, ruso, árabe, griego, turco, francés, alemán, español, italiano, neerlandés y catalán hacia inglés).
- Ejecución en dispositivo mediante LiteRT/TFLite, sin dependencia de servicios en la nube.
- Decodificación incremental mediante las firmas encode, prefill y decode.
- Tokenización con SentencePiece (`source.spm`) y vocabulario (`vocab.json`) del modelo de origen.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada a los pares origen-inglés listados; no se documenta traducción inversa ni entre idiomas de origen.

## Casos de uso
- Traducción de letras en el reproductor Heartkeeper: el paquete correspondiente al idioma de la canción se carga en el dispositivo y se aplica línea a línea sobre la letra sincronizada, sin enviar texto a servidores externos.
- Aplicaciones móviles de karaoke o visualización de letras: integración de los paquetes TFLite en apps Android/iOS para mostrar traducciones al inglés en tiempo real mientras suena la canción.
- Traducción offline en dispositivos con conectividad limitada: al ejecutarse en LiteRT, el modelo funciona sin red, útil en reproductores portátiles o entornos sin cobertura.
- Prototipado de pipelines de traducción de letras: los paquetes sirven como base para experimentar con postprocesado de traducciones literales de letras (por ejemplo, ajuste de longitud por línea o conservación de rimas).
- Evaluación comparativa de modelos Marian pequeños en movilidad: permite medir latencia y calidad de OPUS-MT y ElanMT cuantizados a int8 frente a alternativas en el mismo dispositivo.
- Distribución de paquetes de traducción por idioma: al estar separados por carpeta, una app puede descargar solo el paquete del idioma necesario, reduciendo el tamaño de la instalación base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; al ser modelos LiteRT int8 pensados para ejecución en dispositivo, no se especifican requisitos de GPU.
- GPU recomendadas: no aplica; el formato TFLite está orientado a CPU, GPU móvil o NPU de dispositivos.
- Compatibilidad con GPU de consumo: no disponible; no hay datos sobre ejecución en A100, H100 o RTX 4090.
- Opciones de despliegue: LiteRT/TFLite (librería declarada `litert`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Heartkeeper lyric translation packs | Marian int8 (LiteRT) | 13 orígenes → en | no disponible | other (por paquete) | TFLite |
| Helsinki-NLP/opus-mt-* | Marian | múltiples pares | no disponible | Apache-2.0 / CC BY 4.0 | safetensors / PyTorch |
| Mitsua/elan-mt-tiny-ja-en | Marian (tiny) | ja → en | no disponible | CC BY-SA 4.0 | safetensors / PyTorch |
| SFG545/orchard-lyric-translation | Marian int8 (LiteRT) | 13 orígenes → en | no disponible | por paquete | TFLite |

## Limitaciones y advertencias
- El repositorio no aporta información sobre parámetros, contexto ni datos de entrenamiento; cualquier evaluación de calidad requiere probar los paquetes directamente.
- Al ser traducciones literales de modelos Marian, la calidad en letras de canciones (con jerga, métrica y referencias culturales) puede ser inferior a la de modelos generativos de mayor tamaño.
- La licencia global es `other` y cada paquete hereda la de su modelo fuente: el paquete `jpn-eng` es CC BY-SA 4.0 (con obligación de compartir igual), mientras que el resto son Apache-2.0 o CC BY 4.0. Es necesario revisar la licencia del paquete concreto antes de un uso comercial.
- No hay información sobre sesgos; al derivar de OPUS-MT y ElanMT, heredan los sesgos de sus corpus de entrenamiento.
- Riesgo de alucinación y de traducciones erróneas en textos ambiguos o muy coloquiales, propio de modelos de traducción automática neuronal.
- El modelo solo traduce hacia inglés; no cubre otros idiomas de destino.
- El formato TFLite limita el despliegue a entornos compatibles con LiteRT; no es directamente utilizable en frameworks de servidor habituales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción fuera del proyecto Orchard.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Sunnynt/heartkeeper-lyric-translation
- Repositorio de origen de los paquetes: https://huggingface.co/SFG545/orchard-lyric-translation
- Modelo fuente ElanMT: https://huggingface.co/Mitsua/elan-mt-tiny-ja-en
- Modelos fuente OPUS-MT (ejemplos): https://huggingface.co/Helsinki-NLP/opus-mt-ja-en, https://huggingface.co/Helsinki-NLP/opus-mt-ko-en, https://huggingface.co/Helsinki-NLP/opus-mt-zh-en, https://huggingface.co/Helsinki-NLP/opus-mt-es-en
- Paper de OPUS-MT: Tiedemann y Thottingal, "OPUS-MT: Building open translation services for the World", EAMT 2020 (no se proporciona URL directa en la información disponible)
