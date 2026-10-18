# Torick63/opus-mt-nl-en-onnx-int8

## Resumen

`Torick63/opus-mt-nl-en-onnx-int8` es una conversión a ONNX con cuantización int8 del modelo de traducción `Helsinki-NLP/opus-mt-nl-en` (revisión `48af999`), desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. Resuelve una tarea acotada: traducción automática de neerlandés a inglés, en una sola dirección y sin capacidades generativas generales.

El interés de esta ficha no está en el modelo base, sino en el empaquetado: el autor exportó el modelo con Optimum usando la tarea `text2text-generation-with-past` y un decoder fusionado que cubre tanto el primer paso como los pasos con caché KV mediante la entrada `use_cache_branch`, de modo que los pesos del decoder se almacenan una sola vez. Sobre esa exportación aplicó cuantización dinámica de pesos int8 con `quantize_dynamic` de ONNX Runtime, activando `EnableSubgraph` para cuantizar también las capas internas de las ramas del decoder fusionado.

El resultado ocupa unos 152 MB en total, lo que lo sitúa en el rango de modelos ejecutables en CPU, en dispositivos de borde o en el navegador. Es una pieza de infraestructura de traducción, no un modelo de propósito general: no hay datos publicados sobre parámetros totales, longitud de contexto ni rendimiento en benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder), modelo base `Helsinki-NLP/opus-mt-nl-en` |
| Parámetros totales | no disponible (no publicado en la model card) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no documentada) |
| Tipos de cuantización | int8 dinámico de pesos (ONNX Runtime `quantize_dynamic` con `EnableSubgraph`); este repositorio no publica variantes fp32 ni fp16 |
| Idiomas soportados | neerlandés (`nl`) como origen, inglés (`en`) como destino; solo dirección nl→en |
| Licencia | Apache-2.0 (tanto el modelo base como esta conversión) |
| Formato de pesos | ONNX: `encoder_model.onnx`, `decoder_model_merged.onnx`; tokenizador SentencePiece (`source.spm`, `target.spm`), `vocab.json`, `config.json`, `generation_config.json` |
| Tamaño en disco | ~152 MB (repositorio de 0,2 GB) |
| Tarea (pipeline) | `translation` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: Marian, un transformer encoder-decoder orientado a traducción automática, en la línea de los modelos OPUS-MT publicados por Helsinki-NLP. Esta ficha no aporta información nueva sobre el entrenamiento: la model card no detalla número de tokens, composición del corpus paralelo, ni si hubo ajuste con RLHF o DPO. El crédito corresponde a Tiedemann y Thottingal (2020).

La innovación técnica de esta conversión es de despliegue, no de modelado. La exportación con Optimum en la tarea `text2text-generation-with-past` genera un único `decoder_model_merged.onnx` que internamente bifurca mediante la entrada `use_cache_branch`: una rama procesa el primer paso de decodificación y la otra los pasos sucesivos con caché KV. Esto evita duplicar los pesos del decoder en dos ficheros, algo habitual en exportaciones ONNX de modelos encoder-decoder. Después se aplica cuantización dinámica int8, que cuantiza los pesos y calcula las escalas de activación en tiempo de ejecución, incluyendo las capas dentro de las subgrafos de cada rama gracias a `EnableSubgraph`.

## Capacidades

- Traducción de texto de neerlandés a inglés, en una única dirección.
- Ejecución en ONNX Runtime, tanto en CPU como en GPU con el provider correspondiente.
- Decodificación greedy con caché KV, adecuada para inferencia de baja latencia en entornos sin GPU.
- Tokenización SentencePiece específica de origen y destino, incluida en el repositorio.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso.
- No tiene visión, audio ni modo de razonamiento explícito.
- Multilingüismo limitado al par nl→en; no traduce otros idiomas.

## Casos de uso

- Traducción por lotes de documentación técnica en neerlandés: el modelo se puede invocar desde un script con ONNX Runtime sobre CPU para convertir ficheros Markdown o docstrings a inglés antes de publicarlos en un repositorio internacional, sin coste de GPU.
- Traducción en el dispositivo: con ~152 MB en int8, se puede empaquetar en una aplicación de escritorio o móvil para traducir correos o mensajes de usuario sin enviar el texto a un servidor, lo que simplifica el cumplimiento de privacidad.
- Preprocesado de corpus para entrenamiento: normalizar a inglés un conjunto de reseñas o formularios neerlandeses antes de indexarlos o de alimentar un pipeline de anotación, aprovechando el bajo coste por documento.
- Soporte al cliente en inglés: traducir tickets entrantes en neerlandés para que agentes que solo trabajan en inglés puedan leerlos, manteniendo el texto original almacenado junto a la traducción para revisión humana.
- Localización de contenido generado por usuarios: traducción de comentarios, valoraciones o mensajes de foro en una plataforma de Países Bajos o Bélgica antes de pasarlos por un clasificador de moderación entrenado en inglés.
- Traducción de logs y mensajes de error: convertir mensajes de sistemas en producción a inglés para equipos de guardia que no leen neerlandés, integrándolo en el pipeline de observabilidad como un paso más.
- Buscador interno bilingüe: traducir consultas nl→en para reutilizar un índice y un motor de búsqueda ya existentes en inglés, en lugar de mantener dos índices separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta una prueba de equivalencia funcional con el modelo original, que se reproduce a continuación:

| Prueba | Configuración | Resultado |
|---|---|---|
| Equivalencia con el modelo PyTorch original | Decodificación greedy, 30 frases cortas de test | 27 de 30 salidas idénticas; el resto difieren sobre todo en la formulación por efecto de la cuantización |

No hay datos de MMLU, HumanEval, GSM8K, BLEU, chrF ni métricas de traducción publicadas para esta conversión. Tampoco se han medido latencia ni throughput.

## Requisitos de hardware

- Peso de los ficheros ONNX int8: ~152 MB, según la model card.
- VRAM estimada para inferencia: por debajo de 1 GB en la práctica; cualquier GPU consumer puede alojarlo, aunque la GPU no es necesaria (estimación a partir del tamaño de los pesos, no medida por el autor).
- RAM estimada en CPU: del orden de unos cientos de MB incluyendo el runtime de ONNX Runtime y el tokenizador (estimación, no medida).
- Cabe holgadamente en GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en hardware de placa única tipo Raspberry Pi, siempre que se use CPU.
- Opciones de despliegue: ONNX Runtime directamente, o vía Optimum (clases de la familia `ORTModelForSeq2SeqLM`) para integrarlo en un pipeline de `transformers`; también se puede cargar desde JavaScript con ONNX Runtime Web, aunque el autor no lo documenta.
- vLLM, TGI y llama.cpp no aplican a este formato: el modelo es un Marian ONNX, no un modelo de pesos GGUF ni un transformer decoder-only.
- Latencia y throughput: no disponibles, no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `Torick63/opus-mt-nl-en-onnx-int8` | no disponible | no disponible | ONNX int8 (~152 MB) | Apache-2.0 | Conversión cuantizada, pensada para CPU y despliegue local |
| `Helsinki-NLP/opus-mt-nl-en` (modelo base) | no disponible | no disponible | PyTorch | Apache-2.0 | Referencia de calidad; sirve para comparar las salidas, pero requiere más memoria y un stack distinto |
| `Helsinki-NLP/opus-mt-en-nl` (misma familia, dirección inversa) | no disponible | no disponible | PyTorch | Apache-2.0 | Cubre en→nl; no sirve para nl→en, se lista solo como alternativa de par de traducción |

Los datos de parámetros y longitud de contexto de los tres modelos no aparecen en la información proporcionada. La comparación relevante frente al modelo base es de empaquetado y coste de inferencia, no de calidad: la model card indica que la cuantización altera la formulación en 3 de 30 frases de prueba.

## Limitaciones y advertencias

- Solo traduce nl→en. No hay dirección inversa, ni pares adicionales, ni detección automática de idioma.
- El modelo no es generativo de propósito general: no responde preguntas, no razona, no escribe código y no soporta tool calling.
- La evaluación de calidad se limita a 30 frases cortas; no hay validación publicada sobre documentos largos, terminología especializada ni dominios técnicos.
- La cuantización int8 provoca divergencias de formulación en aproximadamente el 10 % de las frases de la prueba del autor (3 de 30), lo que puede importar en contenido con terminología sensible.
- La longitud de contexto no está documentada; conviene trocear entradas largas en frases o párrafos y no asumir ventanas grandes.
- No hay información sobre sesgos. El corpus OPUS se construye a partir de datos paralelos de origen web, con posible ruido de alineación y presencia de registros diversos.
- Riesgo de alucinación bajo en el sentido habitual, pero sí riesgo de traducciones fluidas factualmente incorrectas en nombres propios, cifras y unidades; en producción conviene preservar el original y aplicar controles en dominios críticos.
- El repositorio tiene 0 descargas y 0 likes: no hay validación de la comunidad ni un historial de uso que respalde su fiabilidad.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y la atribución al grupo de Helsinki. La conversión mantiene la misma licencia.
- La fecha de creación que figura en los metadatos (2026-10-18) es posterior a la de la mayoría de conversiones ONNX de esta familia; conviene verificar la revisión `48af999` del modelo base si se necesita reproducibilidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Torick63/opus-mt-nl-en-onnx-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-nl-en
- Organización OPUS-MT en HuggingFace: https://huggingface.co/Helsinki-NLP
- Referencia del modelo original: Tiedemann, J. y Thottingal, S. (2020), "OPUS-MT — Building open translation services for the World", Proceedings of the 22nd Annual Conference of the European Association for Machine Translation (EAMT), citado en la model card (sin URL en la información proporcionada).
- Herramientas empleadas, sin enlace en la información proporcionada: Optimum (exportación `text2text-generation-with-past`) y ONNX Runtime (`quantize_dynamic`).
