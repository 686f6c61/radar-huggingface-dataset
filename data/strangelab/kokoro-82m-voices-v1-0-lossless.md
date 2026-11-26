# strangelab/kokoro-82m-voices-v1.0-lossless

## Resumen

`strangelab/kokoro-82m-voices-v1.0-lossless` no es un modelo de lenguaje, sino un banco de embeddings de voz empaquetado para el motor de síntesis de habla Kokoro. Contiene las 54 presets de voz del modelo Kokoro v1.0 (82 M de parámetros, desarrollado por Hexgrad) en un único fichero NumPy de 17,69 MB, frente a los 28,21 MB del banco original distribuido con el paquete `kokoro-onnx`. El autor del reempaquetado es Strange Lab, que se limita a cambiar el formato de almacenamiento sin alterar los valores.

El problema que resuelve es puramente operativo: reducir el peso en disco y el ancho de banda necesario para desplegar el catálogo completo de voces de Kokoro en entornos con almacenamiento o conectividad limitados. Cada array se guarda en orden column-major y se comprime con LZMA dentro de un ZIP, lo que permite ahorrar 10,53 MB por instalación. El modelo de síntesis subyacente (Kokoro-82M) sigue siendo el mismo: un TTS ligero, offline y en inglés principalmente, con soporte adicional de otras lenguas a través de voces concretas.

La relevancia actual es acotada: es una pieza de infraestructura para quien ya use `kokoro-onnx` o Pipecat y quiera minimizar el tamaño del despliegue. No aporta capacidades nuevas de síntesis ni mejora la calidad del audio; el propio autor documenta que el audio resultante es idéntico al del banco original. La licencia Apache 2.0 se hereda de los pesos de Kokoro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (banco de embeddings de voz para Kokoro-82M; el modelo TTS subyacente usa StyleTTS 2 + iSTFTNet) |
| Parametros totales | 82 M (modelo base Kokoro-82M); el banco de voces no tiene parámetros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | El banco almacena arrays float32; el grafo ONNX asociado se distribuye en INT8 (`kokoro-v1.0.int8.onnx`, 114,12 MB) |
| Idiomas soportados | No disponibles en la información proporcionada; el modelo base Kokoro soporta principalmente inglés, con voces para otras lenguas (se citan pruebas en inglés americano, inglés británico, francés y español) |
| Licencia | Apache 2.0 |
| Formato de pesos | Fichero NumPy `.bin` (ZIP con compresión LZMA, arrays en orden column-major); grafo ONNX aparte |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es un artefacto de empaquetado. El contenido son 54 arrays NumPy float32, uno por voz, que codifican los estilos de voz (embeddings de referencia) consumidos por el modelo Kokoro v1.0. El autor cambió la disposición de memoria a column-major y aplicó compresión LZMA dentro de un contenedor ZIP, manteniendo nombres, formas y valores float32 idénticos a los originales. La verificación incluida reporta que las 27.540 filas de voz coinciden byte a byte tras la decodificación y que la expansión del fichero reproduce el SHA-256 del banco original con NumPy 2.5.5.

El modelo subyacente, Kokoro-82M de Hexgrad, es un TTS ligero basado en StyleTTS 2 con vocoder iSTFTNet, según los créditos del proyecto original. Entre sus fuentes de entrenamiento se citan las grabaciones tnc de Koniwa (CC BY 3.0) y SIWIS (CC BY 4.0). No se dispone de más detalles sobre el dataset, el número de tokens o el proceso de alineación en la información proporcionada.

## Capacidades

- Suministra las 54 presets de voz de Kokoro v1.0 en un único fichero compacto para `kokoro-onnx`.
- Permite síntesis de habla offline con el grafo ONNX INT8 estándar de Kokoro v1.0.
- Compatible con Pipecat 1.16.0 mediante `KokoroTTSService`, con salida mono a 24 kHz.
- Búsqueda de voz por nombre (`get_voice_style`) con decodificación bajo demanda.
- Expansión reversible al banco original de 28,21 MB para recuperar el comportamiento de lookup original.
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un banco de estilos de voz.

## Casos de uso

- Despliegue de TTS en dispositivos con almacenamiento reducido: usar el fichero de 17,69 MB junto al grafo INT8 de 114,12 MB reduce el conjunto de 142,33 MB a 131,81 MB (7,4 %), útil en imágenes de contenedor o firmware con cuotas estrictas.
- Aplicaciones de lectura por voz offline: integrar con `kokoro-onnx` 0.6.1 y ONNX Runtime 1.32.0 en CPU para sintetizar texto sin conexión, reutilizando el array de voz decodificado entre pasajes.
- Asistentes conversacionales en tiempo real con Pipecat: pasar `voices_path="kokoro-voices/voices-v1.0.bin"` y `model_path="kokoro-v1.0.int8.onnx"` para obtener audio mono a 24 kHz en pipelines de voz.
- Distribución de demos o notebooks: incluir el catálogo completo de voces en un paquete pequeño para entornos de ejemplo o CI, donde el ancho de banda es limitado.
- Pruebas de calidad y regresión de audio: comparar muestras generadas con el banco compacto y el original, ya que el autor documenta audio idéntico en lecturas cortas en inglés americano, inglés británico, francés y español.
- Servicios con lookup frecuente por nombre: expandir el fichero una vez tras la descarga al formato original de 28,21 MB para recuperar la latencia de búsqueda original (0,19 ms frente a 47 ms en un Apple M4).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor sí reporta mediciones operativas:

| Metrica | Banco compacto (17,69 MB) | Banco original (28,21 MB) |
|---|---|---|
| Lookup de voz por nombre (mediana, Apple M4) | 47 ms | 0,19 ms |
| Tiempo hasta primera frase (mediana, 6 procesos) | 1,89 s | 1,81 s |
| Tamano en disco | 17,69 MB | 28,21 MB |

## Requisitos de hardware

- El banco de voces en sí no requiere GPU: es un fichero de datos de 17,69 MB.
- La inferencia la realiza el grafo ONNX INT8 de Kokoro v1.0 (114,12 MB), ejecutable en CPU con ONNX Runtime 1.32.0.
- Cabe holgadamente en cualquier GPU de consumo y en CPU; no se requieren A100 ni H100.
- Despliegue mediante `kokoro-onnx` (versiones 0.6.1 y 0.4.9 probadas) y Pipecat 1.16.0.
- Latencia de lookup documentada: 47 ms con el banco compacto y 0,19 ms con el original en Apple M4; tiempo hasta la primera frase de 1,89 s y 1,81 s respectivamente.
- Throughput de síntesis no disponible en la información proporcionada.

## Comparativa con modelos similares

| Aspecto | Este repositorio (banco compacto) | Banco original `kokoro-onnx` | Voces individuales `onnx-community/Kokoro-82M-v1.0-ONNX` |
|---|---|---|---|
| Tamano | 17,69 MB | 28,21 MB | ~0,52 MB por voz |
| Contenido | 54 voces en un fichero | 54 voces en un fichero | Una voz por fichero |
| Lookup por nombre | 47 ms (mediana, M4) | 0,19 ms (mediana, M4) | Descarga por separado |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |
| Uso previsto | Instalaciones con poco espacio o ancho de banda | Uso general con lookup frecuente | Descarga selectiva de una voz |

## Limitaciones y advertencias

- No es un modelo entrenado: no mejora la calidad de síntesis ni añade voces; solo cambia el empaquetado.
- El lookup por nombre es unas 247 veces más lento que con el banco original (47 ms frente a 0,19 ms en M4); conviene cachear el array decodificado.
- La expansión al banco original requiere NumPy 2.5.5 para reproducir el SHA-256 documentado.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de repo de 0,0 GB según Hugging Face, lo que sugiere que el fichero podría no estar efectivamente alojado o indexado; verificar antes de depender de él en producción.
- Los idiomas soportados no están declarados en la model card; las pruebas del autor cubren inglés americano, inglés británico, francés y español, pero no hay garantía formal sobre otras lenguas.
- La licencia Apache 2.0 se hereda de Kokoro; las fuentes de entrenamiento originales incluyen datos CC BY 3.0 (Koniwa tnc) y CC BY 4.0 (SIWIS), cuyas obligaciones de atribución conviene revisar.
- Riesgo de alucinación no aplica (no es un modelo generativo de texto), pero sí pueden aparecer artefactos de pronunciación propios del TTS subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/strangelab/kokoro-82m-voices-v1.0-lossless
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Voces individuales upstream: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/tree/main/voices
- Banco de voces y modelos del runtime `kokoro-onnx`: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1
- Servicio TTS de Pipecat: https://reference-server.pipecat.ai/en/latest/_modules/pipecat/services/kokoro/tts.html
