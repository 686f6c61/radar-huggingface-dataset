# willwade/byt5-g2p-multilingual-tiny

## Resumen

`willwade/byt5-g2p-multilingual-tiny` es un modelo seq2seq de tipo byte-level basado en ByT5-small, especializado en conversión grafema-fonema (G2P) y desarrollado por el autor independiente Will Wade dentro del ecosistema de accesibilidad y síntesis de voz. Su función es transformar una palabra escrita en su transcripción fonética en IPA, con una etiqueta de idioma o variedad dialectal como prefijo de entrada, de modo que la salida sea directamente consumible por voces de la familia Piper.

La relevancia del modelo reside en su relación entre tamaño y cobertura: con solo 17,9 millones de parámetros y un checkpoint de aproximadamente 70 MB, cubre 142 etiquetas de idioma y variedad (incluyendo distinciones como `eng-US`/`eng-UK`, `spa-ES`/`spa-LatAm`, `por-BR`/`por-PT` y más de 20 variantes siníticas). Se entrenó sobre un corpus armonizado de 4,12 millones de pares construido a partir de WikiPron y gruut, con convenciones IPA unificadas por idioma mediante un alineador M2M aprendido.

El modelo es útil para pipelines de TTS de bajo coste, lexicones de pronunciación y herramientas de accesibilidad que necesiten generar transcripciones fonéticas multilingües en CPU o en hardware modesto, sin depender de modelos de cientos de millones de parámetros. Su licencia CC BY-SA 4.0, heredada de los datos de WikiPron, condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder byte-level (ByT5), seq2seq |
| Parametros totales | 17.934.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de palabra corta con prefijo de idioma; límite no documentado) |
| Tipos de cuantizacion | ONNX dynamic QInt8 (carpeta `onnx-int8/`); pesos safetensors en fp32 |
| Idiomas soportados | 142 etiquetas de idioma/variedad (multilingüe) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (HF Transformers), ONNX (encoder+decoder), ONNX int8 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ByT5, un transformer encoder-decoder que opera directamente sobre bytes UTF-8 en lugar de tokens de subpalabra. Esto elimina el vocabulario fijo y permite procesar cualquier grafía, incluyendo alfabetos no latinos, sin tokens desconocidos. La entrada sigue el formato `<lang>: word`, con código ISO-639-3 y sufijo de variedad cuando existe la división (por ejemplo, `<eng-US>: hello` o `<spa-ES>: abeja`), y la salida es IPA separada por espacios en la convención anclada a gruut (`h ɛ l ˈoʊ`).

El entrenamiento se realizó sobre un corpus armonizado de 4,12 millones de pares, construido a partir de gruut y WikiPron, con un alineador M2M usado para unificar las convenciones IPA por idioma. El ajuste se ejecutó en una RTX 3090 durante aproximadamente 8 horas, con un coste declarado de 1,20 dólares. El autor reporta que la armonización del corpus y el aumento del 27 % de entradas aportaron una mejora de 13,6 puntos en exactitud micro sobre el mismo conjunto de test respecto al checkpoint anterior.

## Capacidades

- Conversión grafema-fonema (G2P) a IPA para 142 etiquetas de idioma y variedad.
- Salida en convención gruut, consumible directamente por voces de la familia Piper.
- Procesamiento byte-level: maneja alfabetos y grafías fuera del vocabulario latino sin tokens desconocidos.
- Diferenciación dialectal explícita mediante prefijo de idioma y variedad (por ejemplo, `spa-ES` frente a `spa-LatAm`).
- Inferencia en CPU mediante los artefactos ONNX exportados.
- Cuantización int8 dinámica con un par encoder/decoder validado contra pares del corpus.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- No es un modelo generativo de texto libre: su dominio es la transcripción fonética de palabras.

## Casos de uso

- Síntesis de voz con Piper: el modelo genera la transcripción IPA que las voces Piper consumen directamente, lo que permite construir un front-end G2P multilingüe sin depender de lexicones estáticos por idioma.
- Lexicones de pronunciación para TTS: se puede usar para pregenerar entradas IPA de vocabularios extensos y almacenarlas como lexicón, aprovechando que la inferencia es determinista y de bajo coste.
- Herramientas de accesibilidad: aplicaciones de lectura en voz alta o de aprendizaje de idiomas que necesiten mostrar u operar con la pronunciación fonética de palabras en múltiples variedades dialectales.
- Procesamiento por lotes en CPU: gracias a la exportación ONNX e int8, se puede ejecutar en servidores sin GPU para enriquecer corpus o pipelines de datos con anotación fonética.
- Investigación lingüística comparada: la cobertura de 142 variedades, incluidas divisiones dialectales finas, facilita estudios de variación fonética entre registros como `por-BR`/`por-PT` o las variantes siníticas.
- Prototipado rápido de front-ends TTS: el tamaño de 17,9 M de parámetros y el repo de 0,5 GB permiten iterar en un portátil o en un contenedor ligero sin infraestructura dedicada.
- Normalización de pronunciación en pipelines de datos de voz: alinear transcripciones de audio con representaciones IPA canónicas antes del entrenamiento de modelos acústicos.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre una muestra de test estratificada de 4.000 pares, el mismo conjunto para ambas columnas:

| Metrica | Este modelo (tiny, 17M) | Checkpoint anterior |
|---|---|---|
| Exactitud micro | 0,718 | 0,582 |
| Exactitud macro | 0,619 | 0,644 |

El autor indica que el modelo tiny queda cerca del modelo small (300 M de parámetros) y que la mejora de 13,6 puntos en exactitud micro se debe al nuevo corpus armonizado. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 para los pesos safetensors (17,9 M de parámetros); el repo completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU consumer reciente sirve; el entrenamiento se realizó en una RTX 3090, pero la inferencia no requiere esa clase de hardware.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, e incluso iGPU) y en CPU.
- Despliegue: Transformers con PyTorch, ONNX Runtime (CPU), y los artefactos `onnx/` y `onnx-int8/` para inferencia sin PyTorch. El modelo está marcado como compatible con text-generation-inference y endpoints.
- Latencia y throughput: no disponibles de forma numérica; por el tamaño, la inferencia por palabra es de milisegundos en CPU.
- Nota de integración: el consumo correcto de los artefactos ONNX exige respetar convenciones concretas (token id = byte + 3, EOS añadido a la entrada del encoder, máscara causal explícita en el decoder y arranque de longitud 2); el script de referencia del autor las implementa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cobertura de idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| willwade/byt5-g2p-multilingual-tiny | 17,9 M | no disponible | 142 etiquetas de idioma/variedad | CC BY-SA 4.0 | Hugging Face, ONNX e int8 |
| Checkpoint anterior del mismo autor | no disponible | no disponible | no disponible | CC BY-SA 4.0 | Hugging Face |
| Modelo small del mismo autor (referencia en la model card) | 300 M | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos suficientes para comparar con alternativas externas de G2P (por ejemplo, modelos de eSpeak o lexicones específicos) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La exactitud macro (0,619) es inferior a la del checkpoint anterior (0,644): el modelo mejora en la media micro pero puede degradarse en idiomas con pocos ejemplos.
- Licencia CC BY-SA 4.0 con cláusula share-alike heredada de WikiPron: el uso comercial exige revisar obligaciones de atribución y de compartir bajo la misma licencia las obras derivadas.
- El modelo está diseñado para palabras individuales con prefijo de idioma; no se documenta su comportamiento con frases largas ni con texto sin etiqueta de idioma.
- Riesgo de salidas fonéticamente plausibles pero incorrectas en variedades con pocos datos o en palabras fuera del dominio del corpus de entrenamiento.
- La convención de salida está anclada a gruut; otros inventarios IPA pueden requerir conversión posterior.
- Los artefactos ONNX tienen requisitos de integración estrictos (token id desplazado, EOS en el encoder, máscara causal y arranque de longitud 2); un consumidor incorrecto produce salidas inválidas.
- No se documentan sesgos específicos por idioma o variedad más allá de la cobertura desigual del corpus de origen.
- No apto para generación de texto, razonamiento, código ni tareas fuera de la transcripción fonética.

## Enlaces

- Hugging Face: https://huggingface.co/willwade/byt5-g2p-multilingual-tiny
- Repositorio de código y entrenamiento: https://github.com/AACTools/voicegarden-lexicons/tree/main/scripts/train_byt5
- Script de referencia para ONNX: https://github.com/AACTools/voicegarden-lexicons/blob/main/scripts/train_byt5/onnx_reference.py
- Modelo base: https://huggingface.co/google/byt5-small
- Dataset WikiPron: https://huggingface.co/datasets/CUNY-CL/wikipron
- Dataset gruut: https://huggingface.co/datasets/rhasspy/gruut
