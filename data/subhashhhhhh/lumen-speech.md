# subhashhhhhh/lumen-speech

## Resumen

`subhashhhhhh/lumen-speech` no es un modelo entrenado por su autor, sino un repositorio de distribución que empaqueta dos artefactos de terceros sin modificar para que una aplicación Android los descargue desde un único punto fijado. El primero es `whistle.cact`, un modelo de reconocimiento automático del habla con marcas de tiempo a nivel de palabra, procedente de `Cactus-Compute/whistle` (commit `741118687e1f008f06d1351a402a731274789790`, Apache 2.0), pensado para el motor de inferencia "needle" de Cactus. El segundo es `vad.onnx`, la versión 6.2.3 de Silero VAD en su variante de 16 kHz (`silero_vad_16k_op15.onnx`, MIT), que detecta los tramos con voz para evitar que la música se transcriba como líneas inventadas.

El problema que resuelve es de empaquetado y trazabilidad, no de modelado: Lumen, una galería Android "local-first", ofrece subtítulos en el dispositivo al pulsar CC sobre un vídeo, y necesita descargar ambos ficheros bajo demanda desde sus ajustes sin que el audio salga del teléfono. El repositorio incluye `SHA256SUMS` con la suma de comprobación de cada fichero, que la aplicación verifica tras la descarga, y un `NOTICE` que aclara la doble licencia.

Es relevante ahora por dos motivos prácticos: permite fijar una versión concreta de dos dependencias de inferencia en el borde (sin depender de que el upstream no cambie) y demuestra un patrón limpio de distribución de modelos para aplicaciones móviles con verificación de integridad. Conviene subrayar que el repositorio no aporta arquitectura, pesos originales, tokenizador ni proceso de entrenamiento propios: toda la información técnica disponible remite a los proyectos de origen, y el tamaño del repo figura como 0.0 GB, sin descargas ni valoraciones registradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio no documenta la arquitectura de `whistle.cact` ni de `vad.onnx`; solo indica su procedencia |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se indica que ninguno de los dos artefactos sea un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de contexto de texto. El VAD opera sobre audio muestreado a 16 kHz; el tamaño de ventana y el chunking del ASR no se detallan |
| Tipos de cuantización | No disponible. Se distribuyen artefactos ya compilados (`.cact` y `.onnx`), sin variantes de cuantización publicadas |
| Idiomas soportados | ASR (Whistle): inglés, alemán, francés, español, italiano, neerlandés y polaco, según la model card. VAD (Silero): independiente del idioma |
| Licencia | Apache 2.0 para `whistle.cact`; MIT para `vad.onnx`. Ver `NOTICE` en el repositorio |
| Formato de pesos | `.cact` (motor "needle" de Cactus) para el ASR; `.onnx` con opset 15 (`silero_vad_16k_op15.onnx`) para el VAD |
| Integridad | `SHA256SUMS` con el checksum de cada fichero; la aplicación los verifica tras la descarga |
| Uso previsto | Inferencia en dispositivo (Android) dentro de la aplicación Lumen |

## Arquitectura y entrenamiento

El repositorio no contiene información sobre arquitectura ni sobre entrenamiento. Ambos ficheros son copias literales de sus proyectos de origen: `whistle.cact` proviene de `Cactus-Compute/whistle` en el commit `741118687e1f008f06d1351a402a731274789790` y `vad.onnx` es `silero_vad_16k_op15.onnx` de la etiqueta `v6.2.3` de `snakers4/silero-vad`, renombrado. Por tanto, cualquier detalle sobre capas, datos de entrenamiento, número de tokens, composición del corpus o ajuste por RLHF/DPO debe consultarse en las fichas y papers de esos proyectos, no aquí.

La única innovación atribuible a este repositorio es de ingeniería de distribución: pinchar versiones concretas (commit y tag), alojar ambos artefactos juntos para que la app descargue desde un único origen estable, publicar sumas SHA-256 y separar las licencias con un fichero `NOTICE`. La combinación funcional es una cadena de dos etapas: el VAD segmenta el audio a 16 kHz para localizar dónde hay habla y el ASR transcribe esos segmentos y devuelve marcas de tiempo por palabra, que es lo que permite renderizar subtítulos sincronizados.

## Capacidades

- Reconocimiento automático del habla (ASR) con marcas de tiempo a nivel de palabra, adecuado para generar subtítulos sincronizados.
- Soporte multilingüe en siete idiomas para el ASR: inglés, alemán, francés, español, italiano, neerlandés y polaco.
- Detección de actividad de voz (VAD) a 16 kHz, que filtra tramos sin habla antes de transcribir.
- Mitigación de transcripciones inventadas sobre música o silencio, al aplicar el VAD como paso previo.
- Ejecución completamente local en el dispositivo, sin envío de audio a servidores.
- Descarga bajo demanda desde los ajustes de la aplicación, con verificación de integridad por SHA-256.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo "thinking".

## Casos de uso

- Subtitulado automático en una galería Android: la app detecta el vídeo seleccionado, ejecuta el VAD sobre la pista de audio a 16 kHz y transcribe solo los tramos con voz, generando subtítulos con tiempos por palabra para sincronizar cada línea.
- Indexación y búsqueda de vídeos personales en el dispositivo: la transcripción resultante permite buscar por texto dentro de la galería local sin subir contenido a la nube, lo que encaja con el enfoque "local-first" de Lumen.
- Filtrado de audio musical antes de transcribir: al aplicar `vad.onnx` primero, se evitan las líneas inventadas que un ASR suele producir sobre música, un caso frecuente en grabaciones caseras y vídeos de conciertos.
- Distribución reproducible de dependencias de inferencia en apps móviles: fijar commit y tag, publicar `SHA256SUMS` y verificar tras la descarga es un patrón directamente reutilizable por cualquier aplicación que empaquete modelos ONNX o propietarios.
- Subtitulado en varios idiomas para contenido grabado en inglés, alemán, francés, español, italiano, neerlandés o polaco, útil para viajes o material importado de esas regiones.
- Transcripción de notas de voz y entrevistas cortas en el propio teléfono, usando el VAD para recortar silencios y reducir el tiempo de cómputo del ASR.
- Base para pipelines de accesibilidad: generar subtítulos de forma offline para vídeos reproducidos en el dispositivo, sin depender de conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER, latencia, consumo ni comparaciones con otros sistemas, y la búsqueda web realizada no devolvió resultados técnicos relevantes (los enlaces devueltos eran calculadoras genéricas y una página sobre un cartucho de munición, sin relación con el modelo).

## Requisitos de hardware

- Orientado a inferencia en dispositivo Android (CPU del teléfono); no se publican requisitos de VRAM ni de GPU.
- El tamaño del repositorio figura como 0.0 GB, dato que no permite estimar con fiabilidad la huella en memoria de cada artefacto.
- No hay indicación de que se requieran GPU de datacenter (A100, H100) ni tarjetas de consumo (RTX 4090); el diseño apunta a ejecución local en móvil.
- Opciones de despliegue documentadas: el motor "needle" de Cactus para `whistle.cact` y un runtime ONNX con soporte de opset 15 para `vad.onnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de artefactos.
- Latencia y throughput: no disponibles. Dependerán del SoC del teléfono, de la duración del audio y de la proporción de tramos con voz que el VAD deje pasar.

## Comparativa con modelos similares

| Elemento | Origen | Idiomas | Licencia | Formato | Estado en este repo |
|---|---|---|---|---|---|
| `whistle.cact` | `Cactus-Compute/whistle`, commit `7411186` | 7 (en, de, fr, es, it, nl, pl) | Apache 2.0 | `.cact` | Copia sin cambios |
| `vad.onnx` | `snakers4/silero-vad`, tag `v6.2.3` | Independiente del idioma | MIT | `.onnx` (opset 15) | Copia sin cambios, renombrada |
| Este repositorio | `subhashhhhhh/lumen-speech` | Los mismos | Apache 2.0 + MIT | Los mismos | Empaquetado con `SHA256SUMS` y `NOTICE` |
| Alternativas de ASR en dispositivo (p. ej. whisper.cpp, Vosk) | No evaluadas en la información disponible | No disponible | No disponible | No disponible | No incluidas |

No se dispone de parámetros, contexto ni métricas de rendimiento de `whistle.cact` frente a otras alternativas de ASR en dispositivo, por lo que no es posible establecer una comparación cuantitativa rigurosa. Respecto al VAD, la referencia válida es el propio proyecto Silero, ya que este repositorio no modifica el artefacto.

## Limitaciones y advertencias

- No es un modelo original: es un espejo de dos dependencias. Cualquier corrección, mejora o aviso de seguridad debe llegar por los repositorios upstream y no se reflejará automáticamente aquí.
- Sin datos de uso: 0 descargas y 0 valoraciones en el momento de la consulta; no hay evidencia pública de despliegue ni de validación por terceros.
- Sin métricas: no hay WER por idioma, ni latencia, ni consumo de batería publicados, lo que impide estimar la calidad real del subtitulado.
- Cobertura lingüística limitada a siete idiomas en el ASR; el resto de idiomas no están soportados según la model card.
- El VAD está fijado a 16 kHz; usar audio con otra frecuencia de muestreo sin remuestrear degradará la detección.
- El filtrado por VAD reduce, pero no elimina, el riesgo de alucinación del ASR en pasajes con ruido, canto o habla solapada.
- No se documentan sesgos conocidos ni evaluaciones de equidad por acento, edad o género; deben asumirse los del modelo de origen.
- Licencias dobles: Apache 2.0 para el ASR y MIT para el VAD. Un uso comercial debe cumplir ambas y conservar los avisos de `LICENSE`, `LICENSE-silero-vad` y `NOTICE`.
- Dependencia de un runtime concreto (motor needle de Cactus) para el fichero `.cact`, lo que limita la portabilidad a otras plataformas sin conversión.
- La verificación por SHA-256 es responsabilidad del cliente: si la aplicación no comprueba `SHA256SUMS`, se pierde la garantía de integridad.
- La búsqueda web realizada no aportó documentación técnica adicional; toda la información contrastable procede de la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/subhashhhhhh/lumen-speech
- Modelo de origen del ASR: https://huggingface.co/Cactus-Compute/whistle
- Commit fijado del ASR: `741118687e1f008f06d1351a402a731274789790` (en el repositorio de Cactus-Compute/whistle)
- Proyecto Silero VAD: https://github.com/snakers4/silero-vad (tag `v6.2.3`)
- Ficheros auxiliares del repositorio: `SHA256SUMS`, `NOTICE`, `LICENSE`, `LICENSE-silero-vad`
- La búsqueda web no devolvió enlaces relevantes adicionales sobre este modelo.
