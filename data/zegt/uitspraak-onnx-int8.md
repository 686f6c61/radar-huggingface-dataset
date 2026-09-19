# zegt/uitspraak-onnx-int8

## Resumen

El repositorio `zegt/uitspraak-onnx-int8` no es un modelo unico, sino un paquete de nueve grafos ONNX cuantizados en INT8 (cuantizacion dinamica) derivados de checkpoints publicos de wav2vec2, publicados por el autor `zegt` para su motor de evaluacion de pronunciacion "Zeg 't". El objetivo declarado es ejecutar el scoring de pronunciacion en local, en un PC con Windows, sin necesidad de descargar los checkpoints completos en fp32. Cada grafo cubre una funcion concreta del motor: extraccion de embeddings, reconocimiento fonetico y CTC por idioma.

La arquitectura subyacente es wav2vec2, un encoder convolucional mas transformer de atencion completa, con cabecera CTC en el caso de los grafos de reconocimiento. Los grafos `ctc_*` provienen de checkpoints XLSR-53 ajustados para neerlandes, ingles, frances, espanol, aleman, italiano y portugues, mientras que el grafo fonetico procede de un checkpoint entrenado sobre el alfabeto de espeak. El grafo `emb_en` y el grafo `phone` son compartidos entre idiomas.

La relevancia del repositorio es practica mas que cientifica: empaqueta en un solo lugar los artefactos INT8 necesarios para desplegar puntuacion de pronunciacion multilingue offline, con un `manifest.json` que incluye tamano y hash sha256 por archivo. No incluye tarjeta de evaluacion, resultados de benchmarks ni pipeline declarado en HuggingFace, y a fecha de la informacion disponible acumula 0 descargas y 0 "me gusta", por lo que se trata de un artefacto de despliegue reciente y sin validacion externa publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder convolucional + transformer con atencion completa; cabecera CTC en los grafos `ctc_*` y `phone`), exportada a ONNX y cuantizada |
| Parametros totales | Aproximadamente 317 M por grafo (base wav2vec2-large); el repositorio agrega 9 grafos. No se detalla por archivo en la model card |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: la entrada es una ventana de audio, no texto. La model card no especifica duracion maxima de audio |
| Tipos de cuantizacion | INT8 dinamica (sufijo `.int8.onnx`) |
| Idiomas soportados | Neerlandes, ingles, frances, espanol, aleman, italiano y portugues, segun los grafos `ctc_*` incluidos; la metadata de HuggingFace no declara idiomas |
| Licencia | MIT (exportacion derivada); los checkpoints de origen son MIT (`facebook/wav2vec2-*`) y Apache-2.0 (`jonatasgrosman/wav2vec2-large-xlsr-53-*`) |
| Formato de pesos | ONNX, INT8 con cuantizacion dinamica, mas `manifest.json` con tamanos y sha256 |

## Arquitectura y entrenamiento

Cada archivo es un grafo ONNX exportado desde un checkpoint wav2vec2 y posteriormente cuantizado de forma dinamica a INT8. wav2vec2 combina un extractor de caracteristicas convolucional que convierte la forma de onda en una secuencia de representaciones, seguido de un transformer que aplica auto-atencion sobre esa secuencia; en los grafos con cabecera CTC, la salida se proyecta a un vocabulario de caracteres o de fonemas y se decodifica con CTC. Esta estructura es la habitual en reconocimiento automatico de habla con wav2vec2 y es la que permite que el mismo esqueleto sirva tanto para transcribir como para puntuar pronunciacion a nivel fonetico.

El repositorio no describe ningun proceso de entrenamiento propio: los pesos proceden de checkpoints publicos ya entrenados. Segun la propia model card, `emb_en` y `ctc_en` derivan de `facebook/wav2vec2-large-960h`, el grafo `phone` de `facebook/wav2vec2-lv-60-espeak-cv-ft` y los grafos `ctc_nl`, `ctc_fr`, `ctc_es`, `ctc_de`, `ctc_it` y `ctc_pt` de la familia `jonatasgrosman/wav2vec2-large-xlsr-53-<idioma>`. La unica transformacion tecnica documentada es la exportacion a ONNX y la cuantizacion dinamica INT8; no se indica tokenizador, preprocesado de audio, regimen de ajuste fino, uso de RLHF/DPO ni composicion de dataset en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico de habla con decodificacion CTC en siete idiomas: neerlandes, ingles, frances, espanol, aleman, italiano y portugues.
- Extraccion de representaciones acusticas compartidas (`emb_en`), reutilizable como base para distintas cabeceras.
- Reconocimiento a nivel de fonema mediante el grafo `phone`, basado en un checkpoint entrenado con el conjunto de fonemas de espeak.
- Puntuacion de pronunciacion: es el caso de uso declarado del paquete, combinando la salida fonetica con la decodificacion CTC para comparar la pronunciacion del usuario con la esperada.
- Inferencia completamente offline en un PC con Windows, sin dependencia de servicios en la nube.
- Ejecucion selectiva por idioma: solo hay que descargar `emb_en`, `phone` y el `ctc_<idioma>` correspondiente, lo que reduce el espacio en disco frente al repositorio completo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo de pensamiento; son capacidades ajenas a este tipo de modelo.

## Casos de uso

- Aplicacion de aprendizaje de idiomas: el motor puede comparar la secuencia de fonemas producida por el alumno con la esperada usando el grafo `phone` y el `ctc_<idioma>`, y generar retroalimentacion por fonema en lugar de una simple nota global.
- Evaluacion de pronunciacion offline en escritorio: los grafos INT8 permiten ejecutar el scoring en un PC con Windows sin conexion, lo que encaja en productos con requisitos de privacidad o en entornos sin red.
- Dictado y transcripcion local multilingue: los grafos `ctc_*` permiten transcribir audio en siete idiomas directamente sobre CPU, sin enviar audio a terceros.
- Investigacion en fonetica computacional: la separacion entre representacion acustica (`emb_en`) y cabecera fonetica (`phone`) facilita experimentos de analisis de errores de pronunciacion y comparacion entre lenguas.
- Prototipado rapido de pipelines ASR: al ser grafos ONNX con cuantizacion dinamica, se pueden integrar en prototipos con ONNX Runtime sin necesidad de gestionar checkpoints de varios gigabytes en fp32.
- Pruebas automatizadas en integracion continua: el reducido tamano por archivo permite incluir el grafo de un idioma en un runner de CI para verificar que el pipeline de audio produce las transcripciones esperadas ante cambios de codigo.
- Distribucion de aplicaciones de escritorio: el `manifest.json` con tamanos y sha256 por archivo simplifica la verificacion de integridad de los artefactos descargados por un instalador.
- Comparacion de pronunciacion entre lenguas maternas: al disponer de cabeceras CTC para siete idiomas sobre una base acustica comun, se pueden construir estudios de transferencia de acento entre pares de lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de palabra (WER), error de caracter (CER), error de fonema (PER) ni ninguna otra metrica, ni para los grafos INT8 ni para los checkpoints de origen. Tampoco se documenta el impacto de la cuantizacion dinamica INT8 sobre la precision respecto a los pesos fp32.

## Requisitos de hardware

- VRAM estimada por grafo: aproximadamente 300-350 MB de pesos INT8 para cada grafo derivado de wav2vec2-large, mas el espacio de activaciones de la ventana de audio procesada. Al cargar varios grafos a la vez (por ejemplo `emb_en` y `phone` mas un `ctc_*`), el consumo se acumula por grafo.
- RAM en CPU: la inferencia INT8 de un grafo wav2vec2-large es viable en CPU con un consumo de memoria del orden de 1 GB o menos por grafo cargado, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: al ser grafos ONNX con cuantizacion dinamica, el despliegue tipico es CPU. Si se usa ONNX Runtime con proveedor CUDA, cualquier GPU con al menos 2 GB de memoria libre es suficiente por grafo; no es necesario hardware de datacenter como A100 o H100 para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente (por ejemplo, series RTX 30 y 40), e incluso en aceleracion por CPU. No se necesita GPU dedicada para el flujo previsto.
- Opciones de despliegue: ONNX Runtime (CPU o CUDA), ONNX Runtime Web para entornos de navegador y cualquier runtime compatible con ONNX e INT8 dinamico. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de audio.
- Latencia y throughput: no disponible. La model card no publica mediciones de tiempo de inferencia ni de audio procesado por segundo.

## Comparativa con modelos similares

La comparativa es aproximada porque este repositorio es un artefacto de despliegue derivado, no un modelo entrenado de forma independiente.

| Modelo | Tipo | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zegt/uitspraak-onnx-int8 | Paquete de 9 grafos wav2vec2 ONNX INT8 para puntuacion de pronunciacion | ~317 M por grafo | 7 idiomas en cabeceras CTC | MIT (derivado) | HuggingFace, 0 descargas declaradas |
| facebook/wav2vec2-large-960h | Modelo ASR wav2vec2 en fp32 | ~317 M | Ingles | MIT | HuggingFace, ampliamente usado |
| jonatasgrosman/wav2vec2-large-xlsr-53-spanish (y equivalentes) | Modelo ASR wav2vec2 en fp32 | ~317 M | Un idioma por checkpoint | Apache-2.0 | HuggingFace |
| openai/whisper-large-v3 | Modelo ASR seq2seq | ~1550 M | Multilingue amplio | Apache-2.0 | HuggingFace |

Frente a los checkpoints originales en fp32, la ventaja de este repositorio es el tamano reducido y la orientacion a inferencia local; la desventaja es la ausencia de evaluacion publicada del efecto de la cuantizacion. Frente a Whisper, el enfoque wav2vec2 con salida fonetica es mas directo para puntuar pronunciacion, aunque no se dispone de datos comparativos de calidad en la informacion proporcionada.

## Limitaciones y advertencias

- No hay ninguna metrica publicada de WER, CER o PER, ni comparacion entre los grafos INT8 y sus checkpoints fp32 de origen. La perdida de precision introducida por la cuantizacion dinamica no esta cuantificada.
- El repositorio tiene 0 descargas y 0 "me gusta" en HuggingFace y no declara pipeline; no hay validacion externa ni comunidad que respalde su comportamiento en produccion.
- Los grafos `emb_en` y `ctc_en` derivan de un checkpoint entrenado sobre LibriSpeech (ingles de lectura), por lo que cabe esperar un rendimiento inferior ante acentos no nativos, ruido de fondo o habla espontanea en ingles.
- Los checkpoints XLSR-53 ajustados por idioma heredan las caracteristicas y los sesgos de sus datos de ajuste, que no se documentan en la model card; no se ofrece informacion sobre sesgos demograficos ni sobre cobertura de variedades dialectales dentro de cada idioma.
- El modelo no genera texto libre ni mantiene conversaciones: cualquier expectativa de uso como asistente, agente o generador de codigo queda fuera de su alcance.
- La licencia MIT aplica a esta exportacion derivada, pero los checkpoints de origen incluyen materiales bajo Apache-2.0 (`jonatasgrosman/wav2vec2-large-xlsr-53-*`), lo que exige mantener la atribucion y las condiciones de esa licencia al redistribuir.
- El repositorio completo ocupa 3.2 GB, aunque la model card recomienda descargar solo `emb_en`, `phone` y el `ctc_<idioma>` necesario; descargar todo sin necesidad consume disco de forma evitable.
- No se documentan el preprocesado de audio requerido (frecuencia de muestreo, normalizacion, duracion de ventana) ni el tokenizador o el mapa de etiquetas CTC, lo que puede exigir ingenieria inversa de los grafos para integrarlos correctamente.
- No se especifica la duracion maxima de audio por inferencia; en arquitecturas wav2vec2 el coste de atencion crece de forma cuadratica con la longitud de la secuencia, lo que limita el uso con audios largos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zegt/uitspraak-onnx-int8
- Checkpoint de origen del grafo de embeddings y del CTC de ingles: https://huggingface.co/facebook/wav2vec2-large-960h
- Checkpoint de origen del grafo fonetico: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
- Checkpoints de origen de las cabeceras CTC por idioma: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-dutch, https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-french, https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-spanish, https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-german, https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-italian, https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-portuguese
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos corresponden a contenidos no relacionados con el repositorio.
