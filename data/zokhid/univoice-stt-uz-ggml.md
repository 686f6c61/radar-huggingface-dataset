# ZOKHID/univoice-stt-uz-ggml

## Resumen

univoice-stt-uz-ggml es la versión convertida y cuantizada para whisper.cpp del modelo ZOKHID/univoice-stt-uz, un Whisper medium afinado para reconocimiento automático del habla en uzbeko, orientado específicamente a llamadas de soporte. El autor, ZOKHID, lo publica como el motor de voz de la aplicación Android offline UniVoice. El artefacto distribuido es un único fichero GGML cuantizado a q5_0 de 539 212 484 bytes (aproximadamente 0,5 GB), lo que lo hace adecuado para inferencia local en dispositivos con recursos limitados.

La relevancia de esta ficha radica en que se trata de un modelo de nicho: cubre un idioma con poca representación en los sistemas ASR comerciales y lo hace en un formato optimizado para ejecución sin conexión mediante whisper.cpp. No es un modelo generalista multilingüe; el autor advierte explícitamente de que el ajuste fino ha degradado el rendimiento en ruso, de modo que el modelo debe tratarse como monolingüe en uzbeko.

La información pública disponible es escasa: no se han publicado métricas de evaluación (WER, CER), detalles del dataset de ajuste fino ni resultados de benchmarks. Esta ficha refleja únicamente los datos verificables de la model card y del repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper medium), convertido a GGML para whisper.cpp |
| Parametros totales | no disponible (Whisper medium tiene del orden de 769 M de parametros; el autor no lo indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no confirmado en la model card) |
| Tipos de cuantizacion | q5_0 (unico fichero publicado) |
| Idiomas soportados | uzbeko (uz) unicamente; el ruso se ha degradado tras el ajuste fino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML binario (`ggml-univoice-stt-uz-q5_0.bin`) |

## Arquitectura y entrenamiento

El modelo parte de Whisper medium, la arquitectura transformer encoder-decoder de OpenAI para reconocimiento de voz, y ha sido afinado por ZOKHID para uzbeko en el dominio de llamadas de soporte (modelo base: ZOKHID/univoice-stt-uz). Sobre ese checkpoint afinado se aplicó el pipeline de conversión de whisper.cpp v1.9.5 (`convert-h5-to-ggml.py`) seguido de `whisper-quantize` con el tipo q5_0, generando el binario GGML distribuido.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de técnicas de alineación (RLHF/DPO) ni innovaciones técnicas adicionales. La model card únicamente documenta el proceso de conversión y cuantización, no el entrenamiento. El tamaño del repositorio (0,5 GB) coincide con el del fichero GGML publicado, lo que sugiere que no se distribuyen pesos en otros formatos.

## Capacidades

- Transcripción de voz a texto en uzbeko, con el modelo forzado al idioma `uz`.
- Decodificación greedy sin marcas de tiempo, sin prompt inicial y sin fallback de temperatura, que es la configuración con la que el autor evaluó el modelo.
- Ejecución offline mediante whisper.cpp, sin dependencia de servicios en la nube.
- Integración en aplicaciones Android a través del proyecto UniVoice.
- No soporta otros idiomas de forma fiable: el ruso se ha degradado tras el ajuste fino.
- No se documentan capacidades de diarización, traducción, tool calling ni agentes; son funciones ajenas al pipeline ASR de Whisper.

## Casos de uso

- Transcripción de llamadas de soporte en uzbeko: el modelo fue afinado específicamente sobre este dominio, por lo que es el escenario para el que se diseñó; se usaría con `whisper-cli` en modo batch sobre las grabaciones.
- Aplicaciones Android sin conexión: al estar en formato GGML q5_0 y ocupar unos 0,5 GB, puede empaquetarse en la app UniVoice y ejecutarse en el dispositivo sin enviar audio a servidores externos.
- Dictado y notas de voz en uzbeko: integración en herramientas de productividad que requieran transcripción local con baja dependencia de red.
- Subtitulado offline de contenido en uzbeko: generación de transcripciones para vídeo o audio pregrabado en un pipeline por lotes con whisper.cpp.
- Digitalización de archivos de audio históricos en uzbeko: procesamiento masivo en servidores modestos gracias al reducido tamaño del modelo cuantizado.
- Prototipado e investigación en ASR de lenguas túrquicas: punto de partida para comparativas o ajustes posteriores sobre un modelo Whisper medium ya adaptado al uzbeko.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER ni CER, ni comparaciones con otros sistemas ASR para uzbeko.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el fichero q5_0 ocupa 539 212 484 bytes, por lo que la huella en memoria es del orden de 0,5-1 GB según el backend y el audio procesado.
- GPU recomendadas: no especificadas por el autor; whisper.cpp puede ejecutarse en CPU y en GPU compatibles con los backends que soporte la compilación (CUDA, Metal, Vulkan, etc.).
- Cabe en GPU de consumo: sí, por el tamaño del binario; cualquier GPU con 2 GB o más de memoria debería alojarlo, aunque no hay cifras oficiales de rendimiento.
- Opciones de despliegue: whisper.cpp (herramienta `whisper-cli`), con el comando documentado `whisper-cli -m ggml-univoice-stt-uz-q5_0.bin -l uz -nt -bs 1 -bo 1 -nf audio.wav`. No se documentan otros formatos (GGUF, safetensors) ni otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| univoice-stt-uz-ggml | no disponible (Whisper medium) | ventana Whisper de 30 s (no confirmado) | uz | Apache 2.0 | GGML q5_0 |
| Whisper medium original (OpenAI) | ~769 M | ventana de 30 s | multilingue | MIT | safetensors, GGML, etc. |
| Whisper large-v3 (OpenAI) | ~1550 M | ventana de 30 s | multilingue | MIT | safetensors, GGML, etc. |
| Alternativas ASR especificas para uzbeko | no disponible | no disponible | uz | no disponible | no disponible |

La comparación con Whisper medium y large-v3 es orientativa: no hay datos publicados que permitan comparar el WER de este ajuste frente a los modelos originales en uzbeko.

## Limitaciones y advertencias

- Modelo monolingüe en la práctica: el autor indica que ha olvidado en gran medida el ruso, por lo que no debe usarse como ASR multilingüe.
- No se han publicado métricas de calidad (WER/CER) ni detalles del dataset de ajuste, lo que impide estimar su precisión real en producción.
- El ajuste está orientado a llamadas de soporte; el rendimiento en otros dominios (audio de estudio, ruido ambiental, acentos distintos) es desconocido.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente con audio ruidoso o silencios largos; la configuración recomendada desactiva el fallback de temperatura, lo que reduce la mitigación automática.
- La única cuantización publicada es q5_0; no hay versiones en otros niveles de cuantización para ajustar el equilibrio precisión/tamaño.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones del modelo base Whisper (MIT) en la cadena de derivación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZOKHID/univoice-stt-uz-ggml
- Modelo base: https://huggingface.co/ZOKHID/univoice-stt-uz
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
