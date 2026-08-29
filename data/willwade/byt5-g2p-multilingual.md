# willwade/byt5-g2p-multilingual

## Resumen

El modelo `willwade/byt5-g2p-multilingual` es un sistema de conversión de grafema a fonema (G2P) basado en la arquitectura ByT5, desarrollado por Will Wade como parte del proyecto floravox. Resuelve el problema de generar transcripciones fonéticas en Alfabeto Fonético Internacional (IPA) para palabras de cualquier idioma, un componente crítico en sistemas de síntesis de voz (TTS) y accesibilidad. El modelo opera directamente sobre bytes UTF-8, lo que elimina la necesidad de tokenización previa y le permite manejar cualquier escritura sin vocabulario fijo.

Con 299,6 millones de parámetros, está entrenado sobre un corpus de 3,02 millones de pares grafema-fonema procedentes de WikiPron (CC BY-SA) y gruut (MIT), cubriendo 136 variedades de lenguas (incluyendo variantes dialectales como inglés de EE. UU. y Reino Unido, portugués de Brasil y Portugal, o múltiples divisiones del chino). Su relevancia actual radica en que ofrece una alternativa ligera y multilingüe a los sistemas G2P tradicionales basados en reglas o WFST, con un rendimiento competitivo y una licencia abierta.

El modelo se distribuye en formato Hugging Face (safetensors) y también en versiones ONNX y ONNX-int8 optimizadas para CPU, lo que facilita su integración en pipelines de TTS como Piper o Floravox. Su diseño como capa neuronal de respaldo (OOV tier) detrás de léxicos FST lo hace especialmente útil para palabras fuera de vocabulario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByT5 (encoder-decoder transformer, byte-level) |
| Parametros totales | 299.637.760 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la documentación (ByT5-small estándar: 512 bytes) |
| Tipos de cuantizacion | int8 (ONNX-int8), además de pesos originales sin cuantizar |
| Idiomas soportados | 136 variedades de lenguas (multilingüe, con variantes dialectales) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX, ONNX-int8 |

## Arquitectura y entrenamiento

El modelo se basa en ByT5-small, una variante de T5 que opera directamente sobre bytes UTF-8 en lugar de subpalabras. Esto elimina la necesidad de tokenizadores y permite manejar cualquier sistema de escritura sin preprocesamiento. La arquitectura es un transformer encoder-decoder estándar, con atención completa y sin mecanismos de mezcla de expertos. El entrenamiento se realizó sobre un corpus de 3,02 millones de pares grafema-fonema, combinando datos de WikiPron (CUNY-CL) y gruut (rhasspy), con preservación de las divisiones dialectales y muestreo balanceado por lengua para evitar sesgos hacia idiomas dominantes.

La entrada se formatea como `<lang>: palabra`, donde `lang` es el código ISO-639-3 con sufijo de variedad cuando corresponde (por ejemplo, `<eng-US>: hello`). La salida es una secuencia de fonemas IPA separados por espacios, en las convenciones de gruut/WikiPron, directamente consumible por voces de la familia Piper. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado de forma estándar. Una innovación destacable es la disponibilidad de artefactos ONNX validados con un script de referencia que codifica convenciones críticas (token id = byte + 3, EOS en el encoder, máscara causal explícita en el decoder).

## Capacidades

- Conversión grafema a fonema (G2P) multilingüe: genera transcripciones IPA para palabras en 136 variedades de lenguas, incluyendo variantes dialectales.
- Soporte de múltiples sistemas de escritura gracias al procesamiento a nivel de bytes (sin tokenizador).
- Salida en formato IPA compatible con motores TTS como Piper y Floravox.
- Manejo de palabras fuera de vocabulario (OOV) como capa neuronal de respaldo tras léxicos FST.
- Integración con pipelines de text-to-speech: el formato de salida está diseñado para consumo directo por voces Piper.
- Despliegue flexible: pesos originales en safetensors, versiones ONNX y ONNX-int8 para CPU.
- No incluye capacidades de generación de texto libre, razonamiento, código, tool calling ni agentes; es un modelo especializado en una única tarea.

## Casos de uso

- Síntesis de voz multilingüe: el modelo puede integrarse en sistemas TTS como Piper o Floravox para generar pronunciaciones correctas de palabras en cualquier idioma, especialmente útil para voces que cubren múltiples lenguas. Su salida en IPA se alimenta directamente al frontend fonético.
- Accesibilidad para lectores de pantalla: permite transcribir correctamente nombres propios, términos técnicos o palabras extranjeras en aplicaciones de lectura de texto en voz alta, mejorando la naturalidad y precisión.
- Lexicografía y lingüística computacional: investigadores pueden usar el modelo para generar transcripciones fonéticas masivas de corpus textuales, facilitando estudios fonológicos comparativos entre variedades dialectales.
- Normalización de texto para ASR: en sistemas de reconocimiento de voz, el G2P ayuda a generar pronunciaciones canónicas para entrenar modelos acústicos o para decodificación con léxicos ampliados.
- Generación de léxicos fonéticos: el modelo puede producir diccionarios de pronunciación para nuevas palabras o dominios específicos (nombres de productos, lugares, etc.) sin intervención manual.
- Asistencia en aprendizaje de idiomas: aplicaciones educativas pueden mostrar la pronunciación IPA de palabras en el idioma objetivo, con soporte para variantes regionales (inglés británico vs. americano, etc.).
- Integración en pipelines de producción con ONNX: la versión ONNX-int8 permite desplegar el modelo en CPU con baja latencia, adecuado para servicios de TTS en tiempo real o procesamiento por lotes.

## Benchmarks y rendimiento

El autor proporciona resultados sobre una muestra de prueba estratificada de 4.000 ejemplos:

| Metrica | Valor |
|---|---|
| Exactitud micro (micro exact) | 0,731 |
| Exactitud macro (macro exact) | 0,636 |
| Tasa de error por token (token error rate) | 0,14 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor indica que la versión tiny (17M parámetros) alcanza un rendimiento similar dentro del ruido estadístico, lo que sugiere que el modelo de 300M puede estar sobredimensionado para esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 1,2 GB (según el tamaño de los artefactos), por lo que caben en cualquier GPU con al menos 2 GB de VRAM. La versión ONNX-int8 reduce el tamaño a unos 300 MB, permitiendo ejecución en CPU con memoria mínima.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 2060 o superior) para fp32; para int8, incluso una GPU integrada o CPU es suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja como GTX 1650 o RTX 3050.
- Opciones de despliegue: se puede usar con la librería Transformers de Hugging Face, o con ONNX Runtime para la versión ONNX. También es compatible con text-generation-inference (según los tags), aunque no se detalla. Para CPU, se recomienda el script `onnx_reference.py` proporcionado por el autor.
- Latencia y throughput: no se proporcionan mediciones específicas. Dado el tamaño (300M) y la naturaleza seq2seq, se espera una latencia de decenas de milisegundos por palabra en GPU, y de cientos de milisegundos en CPU con int8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento (exactitud) |
|---|---|---|---|---|---|---|
| willwade/byt5-g2p-multilingual | 299,6M | 512 bytes (estándar ByT5) | 136 variedades | CC BY-SA 4.0 | safetensors, ONNX | micro exact 0,731 |
| CharsiuG2P (lingjzhu) | ~300M (ByT5-small) | 512 bytes | ~100 lenguas | Apache-2.0 (según repo) | PyTorch | no disponible en la info |
| google/byt5-small (base) | 300M | 512 bytes | multilingüe | Apache-2.0 | safetensors | no aplica (modelo base) |
| mT5-small (token-based) | 300M | 512 | multilingüe | Apache-2.0 | safetensors | inferior a ByT5 en G2P (según paper) |

La comparativa se basa en información pública. CharsiuG2P es el modelo más similar, también basado en ByT5 y entrenado para G2P multilingüe, pero con una cobertura ligeramente menor (100 lenguas) y sin las variantes dialectales específicas. El modelo de Will Wade añade la ventaja de los artefactos ONNX y la integración directa con Piper.

## Limitaciones y advertencias

- Licencia CC BY-SA 4.0: cualquier uso o derivado debe compartirse bajo la misma licencia, lo que puede ser restrictivo para proyectos comerciales propietarios.
- El modelo está especializado únicamente en G2P; no puede realizar otras tareas de NLP.
- La exactitud es moderada (73% micro exact), por lo que puede cometer errores en palabras poco frecuentes, nombres propios o lenguas con poca representación en el entrenamiento.
- La longitud de contexto está limitada a 512 bytes (estándar de ByT5-small), lo que impide procesar palabras muy largas o frases completas; está diseñado para entrada de una sola palabra.
- El formato de salida sigue las convenciones de gruut/WikiPron, que pueden diferir de otros estándares IPA; es necesario adaptar si se usa con otros sistemas.
- No se han publicado evaluaciones de sesgos, pero al entrenarse con datos de WikiPron (colaborativo) puede heredar desequilibrios en la cobertura de lenguas y dialectos.
- La fecha de creación (2026) es futura, lo que sugiere que el modelo es muy reciente y puede tener menos validación externa que alternativas consolidadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/willwade/byt5-g2p-multilingual
- Paper original de ByT5 para G2P multilingüe: https://arxiv.org/abs/2204.03067
- Repositorio CharsiuG2P: https://github.com/lingjzhu/CharsiuG2P
- Repositorio oficial de ByT5: https://github.com/google-research/byt5
- Proyecto Floravox: https://github.com/AACTools/floravox
- Script de referencia ONNX y código de entrenamiento: https://github.com/AACTools/voicegarden-lexicons/tree/main/scripts/train_byt5
