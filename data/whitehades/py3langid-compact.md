# WhiteHades/py3langid-compact

## Resumen

py3langid-compact es una versión compacta y cuantizada del detector de idiomas py3langid, originalmente desarrollado por Marco Lui y Timothy Baldwin y distribuido con la implementación en Rust rust-py3langid 0.4.1. El modelo resuelve una tarea concreta y acotada: la identificación del idioma de un texto, con 142 etiquetas de idioma posibles. Su relevancia radica en que traslada un detector estadístico clásico a un formato apto para navegador, reduciendo el peso en memoria de 97 MB a 25 MB y el tamaño del fichero a 5,2 MB comprimido con gzip, sin pérdida apreciable de precisión.

La arquitectura no es un transformer: se trata de un modelo de identificación de idioma de tipo naive Bayes con un autómata de bytes para la tokenización, en la línea del langid.py original. El autor aplica cuantización int8 con una escala por característica y comprime el autómata almacenando las diferencias de cada fila respecto a la fila inicial. El resultado es un contenedor binario propio con extensión `.lidc.gz`, consumido por el crate de Rust `py3langid` incluido en la extensión de navegador metldr.

El modelo es relevante para quienes necesitan detección de idioma de baja latencia en entornos con recursos limitados, como extensiones de navegador, aplicaciones web del lado del cliente o pipelines de preprocesado multilingüe. Su licencia BSD-3-Clause permite uso comercial sin restricciones adicionales significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Naive Bayes con autómata de bytes (modelo langid.py, no transformer) |
| Parametros totales | no disponible (pesos int8, features por lenguajes; el fichero gzip ocupa 5,2 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre texto de entrada; la evaluación usa frases y primeras cuatro palabras) |
| Tipos de cuantizacion | int8 con una escala por característica |
| Idiomas soportados | 142 etiquetas de idioma (multilingüe) |
| Licencia | BSD-3-Clause |
| Formato de pesos | `.lidc.gz` (gzip de un fichero little-endian con magia `LIDC1\0\0\0`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de langid.py: un clasificador naive Bayes multinomial sobre características de bytes, con un autómata de bytes que define la tokenización y un conjunto de priors por idioma. No hay evidencia de entrenamiento con RLHF, DPO ni datos adicionales en la información disponible; el autor indica que el modelo se convierte directamente desde el `py3langid.lidg` original (SHA-256 `da6860a9218a6122bcf26ba6e8752946336dc4f9c0816c6eb4fa790c7444dec2`) mediante la herramienta `pack-langid in.lidg out.lidc`. Por tanto, el conocimiento lingüístico es el del modelo upstream, no uno nuevo.

La innovación técnica está en el formato y la compresión, no en el aprendizaje. Los pesos se cuantizan a int8 con una escala por característica, y el autómata de bytes se almacena como diferencias respecto a la fila inicial: una máscara de 256 bits más sus destinos por fila. Esto reduce el uso de memoria de 97 MB a 25 MB. El fichero resultante es un contenedor binario little-endian con cabecera de magia, contadores u32, la fila inicial de 256 u32, máscaras de 256 bits por fila, destinos, filas por estado (u16), características de salida por estado (i32, -1 si no hay), priors (f32 por idioma), escalas (f32 por característica), pesos (i8, features por lenguajes) y etiquetas (longitud u16 y bytes UTF-8).

## Capacidades

- Identificación del idioma de un texto entre 142 etiquetas posibles.
- Clasificación de frases completas y de fragmentos muy cortos (la evaluación incluye precisión sobre las primeras cuatro palabras).
- Funcionamiento multilingüe sin necesidad de indicar el idioma de entrada.
- Inferencia de muy baja latencia: 26 µs por texto según la evaluación del autor.
- Huella de memoria reducida: 25 MB en memoria y 5,2 MB el fichero gzip.
- Integración en navegador mediante el crate de Rust `py3langid` de la extensión metldr.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio; es exclusivamente un clasificador de texto.

## Casos de uso

- Detección de idioma en extensiones de navegador: el modelo está pensado para ejecutarse en el cliente con 25 MB en memoria y 5,2 MB de descarga, lo que permite clasificar el idioma de la página o de una selección sin enviar texto a un servidor.
- Enrutado multilingüe en pipelines de preprocesado: clasificar cada documento entrante para dirigirlo al modelo o al indexador del idioma correspondiente, con 26 µs por texto y 142 etiquetas disponibles.
- Filtrado y moderación de contenido: identificar el idioma de comentarios o mensajes para aplicar reglas de moderación específicas por idioma antes de pasarlos a un modelo generativo.
- Análisis de logs y telemetría: etiquetar automáticamente el idioma de campos de texto libre en grandes volúmenes de registros, aprovechando la baja latencia y el reducido consumo de memoria.
- Preprocesado para sistemas de traducción o TTS: determinar el idioma de entrada para seleccionar la voz o el par de traducción adecuado en aplicaciones de accesibilidad.
- Aplicaciones de escritorio o embebidas con recursos limitados: al ocupar 5,2 MB comprimido y no requerir GPU, puede integrarse en herramientas locales de escritorio o en dispositivos con poca memoria.
- Detección de idioma en formularios y atención al cliente: clasificar la consulta del usuario al inicio de la conversación para asignar el agente o la plantilla de respuesta correcta.

## Benchmarks y rendimiento

Evaluación sobre `papluca/language-identification` test (10.000 textos, 20 idiomas), según la model card:

| Detector | Precisión por frase | Precisión cuatro palabras | Tiempo por texto | Memoria |
|---|---|---|---|---|
| **py3langid-compact (este modelo)** | **99,14%** | **93,62%** | 26 µs | 25 MB |
| py3langid upstream | 99,14% | 93,65% | 23 µs | 97 MB |
| lingua, high accuracy | 98,80% | 93,49% | 1.165 µs | 275 MB de modelos |
| fastText lid.176.ftz | 97,63% | 89,42% | 11 µs | 1 MB |
| langidentify lite | 94,34% | 91,93% | 27 µs | no disponible |
| whatlang | 90,59% | 77,81% | 39 µs | no disponible |

El modelo coincide con el upstream en 19.981 de 20.000 textos evaluados (cada frase y sus primeras cuatro palabras).

## Requisitos de hardware

- VRAM: no requiere GPU; es un clasificador de CPU.
- Memoria RAM: aproximadamente 25 MB en memoria durante la inferencia.
- GPU recomendadas: no aplica; no se beneficia de aceleración por GPU.
- Cabe en cualquier GPU consumer y en dispositivos sin GPU; el requisito es de CPU y memoria, no de VRAM.
- Opciones de despliegue: el formato `.lidc.gz` se lee con el crate de Rust `py3langid` (usado por la extensión metldr); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a transformers.
- Latencia y throughput: 26 µs por texto según la evaluación del autor, lo que equivale a decenas de miles de clasificaciones por segundo en un solo hilo de CPU en condiciones de laboratorio.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Precisión frase | Precisión 4 palabras | Memoria | Licencia |
|---|---|---|---|---|---|---|
| py3langid-compact | Naive Bayes int8 | 142 etiquetas | 99,14% | 93,62% | 25 MB | BSD-3-Clause |
| py3langid upstream | Naive Bayes | 142 etiquetas | 99,14% | 93,65% | 97 MB | BSD-3-Clause |
| lingua (high accuracy) | No disponible | no disponible | 98,80% | 93,49% | 275 MB de modelos | no disponible |
| fastText lid.176.ftz | fastText | 176 idiomas | 97,63% | 89,42% | 1 MB | no disponible |
| whatlang | No disponible | no disponible | 90,59% | 77,81% | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona, no ejecuta código ni soporta tool calling; cualquier expectativa de ese tipo es incorrecta.
- La precisión cae en textos muy cortos: 93,62% sobre las primeras cuatro palabras frente al 99,14% sobre frases completas.
- La evaluación se limita a 20 idiomas del conjunto `papluca/language-identification`, aunque el modelo declara 142 etiquetas; no hay datos publicados de precisión para el resto.
- El formato `.lidc.gz` es propietario del autor y solo está documentado para el crate `py3langid`; no hay soporte conocido en frameworks de inferencia estándar, lo que limita su portabilidad.
- El modelo no ha sido entrenado por el autor: es una conversión del upstream, por lo que hereda sus sesgos y limitaciones lingüísticas.
- No hay información publicada sobre sesgos por variedad dialectal, textos con mezcla de idiomas o ruido (URLs, emojis, código).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí puede asignar un idioma incorrecto con alta confianza en entradas ambiguas o muy cortas.
- La licencia BSD-3-Clause permite uso comercial, pero exige conservar el aviso de copyright y la cláusula de no endorsement; conviene revisar los términos del upstream langid.py.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño declarado es 0,0 GB; la adopción y el mantenimiento futuros no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WhiteHades/py3langid-compact
- Repositorio rust-py3langid: https://github.com/markusmobius/rust-py3langid
- Conjunto de evaluación: https://huggingface.co/datasets/papluca/language-identification
- langid.py (Lui y Baldwin): no disponible en la información proporcionada
- Extensión metldr: no disponible en la información proporcionada
