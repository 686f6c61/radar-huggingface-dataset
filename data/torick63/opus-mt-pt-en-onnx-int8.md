# Torick63/opus-mt-pt-en-onnx-int8

## Resumen

`Torick63/opus-mt-pt-en-onnx-int8` es una conversion a ONNX con cuantizacion int8 del modelo de traduccion `Helsinki-NLP/opus-mt-ROMANCE-en`, desarrollado por el grupo de Tecnologias del Lenguaje de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo original es un transformer encoder-decoder de la familia Marian entrenado para traducir varias lenguas romances (frances, espanol, portugues, italiano, rumano) hacia el ingles sin necesidad de token identificador de idioma de origen. Esta version concreta se presenta como un recurso para traduccion portugues-ingles en dispositivo.

La aportacion del autor no es el entrenamiento, sino el empaquetado: exportacion con Optimum usando la tarea `text2text-generation-with-past`, con un encoder y un decoder fusionado que gestiona tanto el primer paso de decodificacion como los pasos con cache KV (entrada `use_cache_branch`), de forma que los pesos del decoder se almacenan una sola vez. Sobre ese grafo se aplica cuantizacion dinamica de pesos int8 con `quantize_dynamic` de ONNX Runtime, activando `EnableSubgraph` para que las capas internas de las ramas del decoder fusionado tambien se cuantizen. El resultado ocupa unos 149 MB.

Es relevante por su perfil de despliegue: un traductor pt-en de pesos ligeros, licencia Apache-2.0 y formato ONNX, apto para inferencia en CPU, navegador o dispositivos sin GPU. Como contrapartida, es un repositorio comunitario con 0 descargas y 0 likes en el momento de la consulta, sin evaluacion publica de calidad mas alla de una comprobacion de fidelidad con decodificacion greedy sobre 30 frases cortas, de las cuales 28 producen exactamente la misma salida que el modelo PyTorch original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Marian (OPUS-MT), exportado a ONNX; decoder fusionado con cache KV |
| Parametros totales | no disponible (la model card no publica el recuento; el repo completo, incluidos pesos int8 y tokenizadores, pesa unos 149 MB) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 dinamica de pesos (ONNX Runtime `quantize_dynamic` con `EnableSubgraph`); no se incluyen pesos fp32, fp16 ni GGUF |
| Idiomas soportados | portugues (origen) e ingles (destino); el modelo base admite ademas otras lenguas romances, pero esta ficha se limita al uso pt-en declarado |
| Licencia | Apache-2.0 (modelo base y conversion) |
| Formato de pesos | ONNX: `encoder_model.onnx` y `decoder_model_merged.onnx`; tokenizacion con `source.spm`, `target.spm` y `vocab.json`; configuracion en `config.json` y `generation_config.json` |
| Revision del modelo base | `Helsinki-NLP/opus-mt-ROMANCE-en`, revision `e9ca997` |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un transformer encoder-decoder completo pensado para traduccion automatica neuronal, en la variante multilingue `ROMANCE-en` de OPUS-MT. El modelo base traduce desde varias lenguas romances hacia el ingles sin token de idioma de origen: la lengua se infiere del propio texto. En esta conversion se emplea unicamente para portugues. La exportacion se hizo con Optimum bajo la tarea `text2text-generation-with-past`, generando un encoder y un decoder fusionado que contiene dos ramas internas (primer paso sin cache y pasos posteriores con cache KV) controladas por la entrada `use_cache_branch`; asi los pesos del decoder se almacenan una sola vez en lugar de duplicarse en dos ficheros.

No se dispone en la informacion proporcionada de datos sobre volumen de entrenamiento, composicion del corpus, ni sobre si el modelo base uso RLHF o ajuste por preferencias (en traduccion automatica supervisada lo habitual es entrenamiento directo sobre corpus paralelos, pero no se confirma aqui). La innovacion tecnica documentada de esta version es exclusivamente de despliegue: exportacion ONNX con decoder fusionado y cuantizacion dinamica int8 aplicada tambien al subgrafo del decoder. El autor reporta que, con decodificacion greedy, los ficheros int8 producen la misma salida que el modelo PyTorch original en 28 de 30 frases cortas de prueba, y que las diferencias restantes afectan principalmente a la redaccion.

## Capacidades

- Traduccion de texto portugues a ingles, unidireccional, con salida en texto plano.
- Traduccion sin token identificador de idioma de origen: la entrada se procesa directamente.
- Generacion autoregresiva con cache KV, lo que evita recomputar el prefijo en cada paso.
- Tokenizacion SentencePiece empaquetada (`source.spm`, `target.spm`), lista para uso autonomo con ONNX Runtime sin depender del tokenizador remoto.
- Inferencia en CPU sin GPU, con pesos int8 de unos 149 MB.
- Compatible con el ecosistema ONNX Runtime y Optimum (Python, C++, JS/WASM).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No es un modelo conversacional ni de instrucciones: no mantiene dialogos multi-turno ni sigue ordenes complejas.

## Casos de uso

- Traduccion por lotes de documentacion tecnica pt-en: el modelo se integra en un pipeline Python con ONNX Runtime que procesa ficheros Markdown o XML fragmento a fragmento, con la ventaja de que los pesos int8 caben en cualquier contenedor y no requieren GPU.
- Pretraduccion en herramientas de traduccion asistida (CAT): generar un borrador automatico pt-en que el traductor humano postedita, reduciendo coste frente a traducir desde cero y manteniendo el control de calidad humano en el paso final.
- Normalizacion de corpus para entrenamiento: convertir texto portugues a ingles antes de alimentar clasificadores o modelos de embeddings entrenados solo en ingles, aprovechando que la inferencia en CPU permite escalar horizontalmente con bajo coste por documento.
- Traduccion en el borde o en navegador: el par de ficheros ONNX de ~149 MB puede ejecutarse con `onnxruntime-web` en cliente, util para interfaces de traduccion sin enviar el texto a un servidor y sin coste de API.
- Enrutado y triaje de tickets de soporte: traducir tickets en portugues a ingles para reutilizar clasificadores de categoria y modelos de resumen ya entrenados en ingles, con una latencia baja al no requerir acelerador.
- Localizacion de subtitulos y contenido audiovisual: traduccion de transcripciones pt-en en procesos batch nocturnos, donde el throughput importa mas que la latencia interactiva y el coste por hora de CPU es minimo.
- Moderacion de contenido multilingue: traducir texto portugues a ingles para aplicar clasificadores de toxicidad o politicas entrenados en ingles, como paso previo a la decision del sistema de moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de BLEU, chrF, COMET, MMLU ni de ningun otro conjunto de evaluacion en la model card.

El unico dato de calidad publicado es una comprobacion de fidelidad respecto al modelo original en PyTorch:

| Prueba | Resultado reportado |
|---|---|
| Coincidencia exacta de salida con el modelo PyTorch original, decodificacion greedy | 28 de 30 frases cortas |
| Diferencias en las 2 frases restantes | Variaciones de redaccion atribuidas a la cuantizacion |
| Evaluacion con corpus estandar (BLEU/COMET) | no disponible |
| Evaluacion en documentos largos | no disponible |

## Requisitos de hardware

- VRAM: no requiere GPU. Los pesos int8 suman unos 149 MB; la huella de memoria del proceso depende del runtime ONNX Runtime y de las estructuras de tokenizacion, no documentada por el autor (estimacion prudente: por debajo de 1 GB de RAM en CPU).
- GPU recomendadas: ninguna necesaria. Si se desea acelerar, cualquier GPU consumer moderna sirve con el execution provider CUDA de ONNX Runtime; el cuello de botella con un modelo de este tamano sera el lanzamiento de kernels, no la memoria.
- Cabe en GPU consumer: si, en cualquiera (GTX 1050, RTX 3060, RTX 4090); tambien en CPU de portatil, Raspberry Pi o instancias serverless de gama baja.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, JS/WASM), `optimum.onnxruntime.ORTModelForSeq2SeqLM` dentro de Transformers, y servidores propios sobre ONNX Runtime. No hay ficheros GGUF en el repositorio y la arquitectura Marian no es compatible con llama.cpp ni con Ollama; vLLM y TGI no estan pensados para esta arquitectura en la informacion consultada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por frase para esta conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Torick63/opus-mt-pt-en-onnx-int8` (esta ficha) | no disponible (repo de ~149 MB int8) | no disponible | pt -> en | Apache-2.0 | ONNX int8 | Conversion comunitaria, sin benchmarks; 28/30 salidas identicas al original |
| `Helsinki-NLP/opus-mt-ROMANCE-en` | no disponible en la informacion proporcionada | no disponible | varias romances -> en | Apache-2.0 | PyTorch (safetensors/bin) | Modelo original de referencia; mayor peso en disco, requiere framework de inferencia |
| `Helsinki-NLP/opus-mt-tc-big-*` (familia OPUS-MT de mayor tamano) | no disponible | no disponible | multiples | Apache-2.0 | PyTorch | Alternativa de mayor capacidad dentro del mismo proyecto, a costa de mas recursos |
| NLLB-200 (variantes destiladas, p. ej. 600M) | 600M en la variante destilada citada | no disponible en esta ficha | 200 lenguas | CC-BY-NC-4.0 en el modelo base (revisar condiciones) | PyTorch | Cobertura linguistica muy superior; licencia no comercial en el modelo base, a verificar antes de produccion |

La comparacion directa con alternativas de mayor tamano no puede cuantificarse en calidad porque no hay resultados de benchmarks publicados para esta conversion.

## Limitaciones y advertencias

- Modelo base multilingue, no especializado en portugues: al no existir token de idioma de origen, el sistema infiere la lengua; es esperable cierta interferencia con otras lenguas romances en entradas cortas, ruidosas o mezcladas con espanol o italiano.
- Cuantizacion int8 dinamica: 2 de cada 30 frases de prueba difieren del modelo original en redaccion. La cuantizacion puede afectar mas a entradas largas o con vocabulario poco frecuente, no evaluadas.
- Ausencia total de evaluacion publica: no hay BLEU, chrF ni COMET, ni pruebas sobre documentos completos, dominios especializados o terminologia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Longitud de contexto no documentada: no se especifica el limite de tokens de entrada. Traducir frases muy largas puede provocar truncamientos u omisiones difíciles de detectar.
- Unidireccional: solo pt -> en. No traduce en -> pt ni sirve como modelo de par linguistico inverso.
- No apto para texto juridico, medico o financiero sin revision humana: la traduccion automatica neuronal puede introducir omisiones, cambios de cifras o terminologia incorrecta, y en este caso no hay metricas que acoten el riesgo.
- Perdida de formato: como en cualquier modelo de traduccion secuencial, las etiquetas Markdown, HTML, placeholders y variables pueden alterarse; se recomienda segmentar y proteger marcado antes de traducir.
- Sesgos esperables por herencia del corpus OPUS, que combina fuentes web, subtitulos y textos parlamentarios o religiosos; es previsible sesgo de dominio y de genero en terminos profesionales. No hay evaluacion de sesgo en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; el autor de la conversion no ofrece garantias de ningun tipo sobre el comportamiento del modelo.
- Para produccion: conviene fijar la revision del repositorio, verificar el comportamiento con un conjunto de validacion propio y monitorizar la salida en dominios criticos, dado el escaso historial de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Torick63/opus-mt-pt-en-onnx-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ROMANCE-en (revision `e9ca997`)
- Organizacion Helsinki-NLP en HuggingFace: https://huggingface.co/Helsinki-NLP
- Proyecto OPUS (corpus y recursos): https://opus.nlpl.eu
- Optimum (exportacion ONNX): https://github.com/huggingface/optimum
- Documentacion de cuantizacion de ONNX Runtime: https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
- Referencia citada en la model card: Tiedemann & Thottingal (2020), "OPUS-MT - Building open translation services for the World", EAMT 2020 (sin URL en la informacion proporcionada)
