# willwade/byt5-p2g-multilingual-tiny

## Resumen

El modelo `willwade/byt5-p2g-multilingual-tiny` es un sistema de conversión fonema-a-grafema (P2G) multilingüe desarrollado por Will Wade, diseñado para transformar secuencias de fonemas en notación IPA (Alfabeto Fonético Internacional) en su correspondiente palabra escrita. Está construido sobre la arquitectura ByT5 de Google, concretamente sobre el checkpoint `google/byt5-small`, y ha sido afinado con un corpus de 3,02 millones de pares procedentes de WikiPron (CUNY-CL) y gruut (rhasspy), preservando las variantes dialectales.

Con solo 17,9 millones de parámetros, este modelo ofrece un rendimiento comparable al de su versión hermana de 300 millones de parámetros (el modelo `byt5-p2g-multilingual`), pero con un tamaño 18 veces menor. Esto lo convierte en una opción atractiva para sistemas de síntesis de voz (TTS) y accesibilidad que necesitan resolver palabras fuera de vocabulario (OOV) de forma eficiente, especialmente en entornos con recursos limitados. El modelo soporta 136 variedades lingüísticas con claves de idioma específicas, lo que permite manejar dialectos como inglés de EE. UU. frente al del Reino Unido, o español de España frente al de Latinoamérica.

La relevancia actual de este modelo radica en su enfoque byte-level (sin tokenizador), que elimina la necesidad de preprocesamiento de texto y lo hace robusto ante errores tipográficos. Además, su licencia CC BY-SA 4.0 y su disponibilidad en formato ONNX (incluida una versión int8 optimizada para CPU) facilitan su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5 (encoder-decoder, byte-level, sin tokenizador) |
| Parametros totales | 17.934.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base ByT5-small usa 512 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | ONNX int8 (recomendado para CPU), ONNX fp32 (en carpeta `onnx/`) |
| Idiomas soportados | 136 variedades lingüísticas (incluye eng-US, eng-UK, por-BR, por-PT, spa-ES, spa-LatAm, galés N/S, armenio E/O, variedades de bengalí, más de 20 divisiones siníticas) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (raíz), ONNX (`onnx/`), ONNX int8 (`onnx-int8/`) |

## Arquitectura y entrenamiento

El modelo se basa en ByT5, una extensión sin tokenizador de mT5 que opera directamente sobre bytes UTF-8. Esto elimina la necesidad de un vocabulario subword y simplifica el pipeline de preprocesamiento, a la vez que proporciona robustez frente a ruido tipográfico. La arquitectura es un transformer encoder-decoder estándar, con el checkpoint `google/byt5-small` como punto de partida.

El entrenamiento se realizó sobre un corpus de 3,02 millones de pares fonema-grafema, combinando datos de WikiPron (bajo licencia CC BY-SA) y gruut (MIT), con las divisiones dialectales preservadas. Se aplicó un muestreo balanceado por idioma para evitar el sesgo hacia las lenguas más representadas. El formato de entrada es `<lang>: IPA tokens` (por ejemplo, `<deu>: ʃ aɪ n`) y la salida es la palabra escrita (por ejemplo, `Schein`). El modelo también maneja pronunciaciones inventadas, como `<eng-US>: m uː` → `moo`.

Una innovación destacable es la convención de tokenización en la versión ONNX: el id de token es el byte + 3, se añade EOS al final de la entrada del encoder, y el decoder requiere una máscara causal explícita y un arranque de longitud 2. El script de referencia `onnx_reference.py` codifica todas estas convenciones para un consumo correcto.

## Capacidades

- Conversión fonema-a-grafema (P2G) multilingüe: transforma secuencias IPA en palabras escritas, cubriendo 136 variedades lingüísticas con claves de idioma específicas.
- Manejo de pronunciaciones fuera de vocabulario (OOV): puede generar grafías plausibles para pronunciaciones inventadas o no registradas.
- Robustez ante ruido: al operar a nivel de bytes, tolera errores tipográficos y variaciones ortográficas sin necesidad de normalización previa.
- Soporte de variantes dialectales: distingue entre variedades como eng-US/eng-UK, por-BR/por-PT, spa-ES/spa-LatAm, galés norte/sur, armenio oriental/occidental, y más de 20 divisiones siníticas.
- Inferencia eficiente en CPU: la versión ONNX int8 reduce el tamaño en un 75% (aproximadamente 17 MB) manteniendo la calidad, lo que permite su uso en entornos sin GPU.
- Integración como capa neural en sistemas TTS: diseñado para actuar como nivel de respaldo (tier) detrás de lexicones FST y modelos WFST de Phonetisaurus, con caché en producción.

## Casos de uso

- Síntesis de voz (TTS) con resolución de OOV: el modelo se integra como capa neural en sistemas como floravox, donde los lexicones basados en FST y los WFST de Phonetisaurus no cubren una palabra. Al recibir la pronunciación IPA, genera la grafía correcta, que luego se añade al lexicón en caché.
- Accesibilidad para personas con dificultades de lectura: puede convertir pronunciaciones fonéticas en texto escrito, ayudando en aplicaciones de lectura asistida o aprendizaje de idiomas donde el usuario introduce sonidos y recibe la palabra correspondiente.
- Normalización de texto en pipelines de ASR: los sistemas de reconocimiento de voz a menudo producen transcripciones fonéticas; este modelo puede reconstruir la forma ortográfica canónica, mejorando la legibilidad de las salidas.
- Corrección de pronunciaciones en diccionarios colaborativos: herramientas que mantienen bases de datos léxicas pueden usar el modelo para verificar o generar grafías alternativas a partir de pronunciaciones IPA, especialmente en variedades dialectales poco representadas.
- Generación de lexicones para TTS multilingüe: al cubrir 136 variedades, permite construir o ampliar diccionarios de pronunciación para motores de voz en múltiples idiomas sin necesidad de intervención manual.
- Educación y aprendizaje de idiomas: aplicaciones que enseñan pronunciación pueden mostrar la palabra escrita a partir de la entrada fonética del estudiante, facilitando la asociación sonido-grafía.

## Benchmarks y rendimiento

El autor proporciona resultados sobre una muestra de prueba estratificada de 4.000 ejemplos:

| Metrica | Valor |
|---|---|
| Micro exact match | 0.495 |
| Macro exact match | 0.614 |
| Token error rate | 0.505 |

El autor señala que la tarea P2G es uno-a-muchos (los homófonos tienen múltiples grafías válidas), por lo que el exact match subestima la calidad real. Además, indica que el modelo tiny (17M) iguala al modelo small (300M) dentro del ruido estadístico en esta tarea, con 1/18 del tamaño. No se han publicado comparaciones con otros modelos P2G en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el modelo en safetensors ocupa aproximadamente 70 MB, y la versión ONNX int8 alrededor de 17 MB.
- GPU recomendadas: no se requieren; el modelo está pensado para ejecución en CPU. Si se desea usar GPU, cualquier GPU con al menos 1 GB de VRAM sería suficiente, pero no es necesario.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna (incluso integradas) puede ejecutar el modelo, aunque el rendimiento en CPU es el objetivo principal.
- Opciones de despliegue: ONNX Runtime (con el script `onnx_reference.py`), Hugging Face Transformers (para los pesos safetensors), y posiblemente text-generation-inference (aunque no es el caso de uso típico).
- Latencia y throughput: no se proporcionan mediciones específicas, pero dado el tamaño de 17M parámetros y la cuantización int8, se espera una latencia de milisegundos por ejemplo en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (micro exact) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `willwade/byt5-p2g-multilingual-tiny` | 17,9 M | no disponible | 0.495 | CC BY-SA 4.0 | Hugging Face, ONNX |
| `willwade/byt5-p2g-multilingual` (small) | 300 M | no disponible | similar (dentro del ruido) | CC BY-SA 4.0 | Hugging Face |
| `google/byt5-small` (base) | 300 M | 512 | no aplica (modelo base) | Apache-2.0 | Hugging Face |

El modelo tiny ofrece una ventaja clara en eficiencia: 1/18 del tamaño del small con rendimiento equivalente en esta tarea específica. No se han identificado otros modelos P2G multilingües comparables en la información disponible.

## Limitaciones y advertencias

- Ambiguidad inherente: la conversión P2G es uno-a-muchos; los homófonos pueden tener múltiples grafías válidas, por lo que el exact match subestima la calidad real. En producción, puede ser necesario un mecanismo de selección entre candidatos.
- Licencia share-alike: la licencia CC BY-SA 4.0, heredada de los datos de entrenamiento de WikiPron, implica que cualquier obra derivada debe distribuirse bajo la misma licencia. Esto puede ser restrictivo para aplicaciones comerciales propietarias.
- Atribución requerida: se debe dar crédito a Wiktionary/WikiPron (CUNY-CL), gruut (rhasspy) y Google ByT5 (Apache-2.0) según los términos de la licencia.
- Cobertura lingüística limitada a variedades específicas: aunque soporta 136 variedades, no cubre todos los idiomas del mundo ni todas las variantes dialectales. El rendimiento puede degradarse en idiomas no representados en el corpus de entrenamiento.
- Riesgo de alucinación en pronunciaciones inventadas: aunque el modelo maneja OOV, puede generar grafías plausibles pero incorrectas para entradas muy alejadas de los patrones de entrenamiento.
- Dependencia de convenciones ONNX: la versión ONNX requiere seguir las convenciones documentadas (token id = byte + 3, EOS en encoder, máscara causal explícita en decoder); un uso incorrecto puede producir resultados erróneos.
- Sin soporte de contexto largo: al ser un modelo pequeño, no está diseñado para tareas que requieran razonamiento de contexto extenso; su uso se limita a conversión de secuencias cortas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/willwade/byt5-p2g-multilingual-tiny
- Modelo hermano (small): https://huggingface.co/willwade/byt5-p2g-multilingual
- Código de entrenamiento: https://github.com/AACTools/voicegarden-lexicons/tree/main/scripts/train_byt5
- Script de referencia ONNX: https://github.com/AACTools/voicegarden-lexicons/blob/main/scripts/train_byt5/onnx_reference.py
- Proyecto floravox (caso de uso): https://github.com/AACTools/floravox
- Documentación de ByT5 en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/byt5.md
- Repositorio original de ByT5: https://github.com/google-research/byt5
- Sitio personal del autor: https://willwa.de/
