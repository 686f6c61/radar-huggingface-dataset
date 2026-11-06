# tfvn/TTS-standardlization

## Resumen

teencode-normalizer v3 es un modelo seq2seq de tipo encoder-decoder Transformer desarrollado por el usuario tfvn, disenado especificamente para normalizar teencode vietnamita (abreviaturas, falta de tonos, grafias de jerga, pronombres acortados) a vietnamita estandar. Con aproximadamente 19,94 millones de parametros, es un modelo compacto orientado a inferencia en el borde, y su version cuantizada INT8 ocupa unos 20,8 MB, lo que permite ejecutarlo en una Raspberry Pi 4 con ONNX Runtime.

El modelo resuelve un problema concreto de preprocesado de texto: el vietnamita informal en chats y redes sociales es muy ruidoso y degrada pipelines de busqueda, TTS y NLP. A diferencia de un LLM generativo, este modelo no traduce ni genera texto libre: reescribe la entrada manteniendo el contenido y restaurando la forma estandar. Su licencia MIT y su formato ONNX lo hacen adecuado para integracion en produccion y en dispositivos con recursos limitados.

La relevancia actual radica en su tamano reducido y su enfoque en una tarea acotada, lo que lo convierte en una alternativa practica frente a modelos genericos de mayor tamano para normalizacion de texto vietnamita en entornos de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq encoder-decoder, pre-LayerNorm |
| Parametros totales | 19.935.040 (~19,94 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 192 tokens (max length) |
| Tipos de cuantizacion | INT8 dinamica (ONNX), BF16 y FP32 (entrenamiento/evaluacion) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, solo pesos), ONNX (encoder/decoder INT8), tokenizer.json |

## Arquitectura y entrenamiento

El modelo es un Transformer seq2seq con pre-LayerNorm compuesto por 8 capas de encoder y 4 de decoder, con d_model de 256, 8 cabezas de atencion, d_ff de 1536 y dropout de 0,1. Emplea un tokenizer BPE compartido de 8000 tokens con normalizacion NFC y una longitud maxima de 192 tokens; los ids especiales son PAD 0, BOS 1, EOS 2 y UNK 3. El checkpoint seleccionado corresponde al paso 13.000, elegido por el mejor CER combinado en el conjunto de desarrollo.

El entrenamiento se realizo con PyTorch usando autocast en BF16, optimizador AdamW y schedule coseno. El modelo se construyo a partir de una version anterior (v2) mas pequena mediante inicializacion que preserva la funcion. La decodificacion recomendada es beam search de anchura 4 combinada con un guard de alineacion de palabras (`guard.json`). No se dispone de informacion sobre el numero exacto de tokens de entrenamiento ni sobre la composicion detallada del dataset, salvo que los pares de teencode son sinteticos.

## Capacidades

- Normalizacion de texto vietnamita informal (teencode) a vietnamita estandar.
- Restauracion de tonos y diacriticos ausentes.
- Expansion de abreviaturas y jerga a formas estandar.
- Resolucion de pronombres acortados y formas coloquiales.
- Generacion de texto seq2seq acotada a la tarea de reescritura (no generacion libre).
- Inferencia en dispositivo de borde mediante ONNX Runtime (Raspberry Pi 4).
- Decodificacion con beam search (anchura 4) y guard de alineacion de palabras.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta vision ni audio.
- Capacidad multilingue limitada exclusivamente al vietnamita.

## Casos de uso

- Preprocesado de busqueda: normalizar consultas de usuarios escritas en teencode antes de indexar o buscar, mejorando la coincidencia con documentos en vietnamita estandar.
- Pipelines de TTS: convertir texto de chat informal a vietnamita estandar con tonos correctos antes de la sintesis de voz, evitando pronunciaciones erroneas.
- Moderacion y analisis de redes sociales: normalizar comentarios y mensajes para que los clasificadores posteriores trabajen sobre texto limpio y consistente.
- Atencion al cliente automatizada: limpiar los mensajes entrantes de usuarios antes de pasarlos a un sistema de comprension o enrutado, reduciendo errores por jerga.
- Despliegue en el borde: ejecutar la normalizacion en una Raspberry Pi 4 con el runner en Rust y el endpoint HTTP `POST /normalize`, sin depender de la nube.
- Enriquecimiento de datasets: normalizar grandes volumenes de texto vietnamita informal para construir corpus de entrenamiento o evaluacion en vietnamita estandar.
- Integracion en aplicaciones moviles o embebidas: al ocupar unos 20,8 MB en INT8, puede incorporarse en apps con recursos limitados para mostrar texto legible al usuario.

## Benchmarks y rendimiento

Resultados declarados por el autor (CER, menor es mejor; beam 4 + guard):

| Conjunto de prueba | v2 | v3 INT8 | v3 BF16 | v3 FP32 |
|---|---|---|---|---|
| Teencode original (999) | 2,92 % | 2,08 % | 2,05 % | 2,03 % |
| Sin tonos (986) | 12,38 % | 11,19 % | 11,37 % | 11,31 % |
| Contexto (803, in-distribution) | 11,93 % | 0,35 % | 0,23 % | 0,22 % |
| Dificil (1.251, solo evaluacion) | 10,96 % | 4,95 % | 4,84 % | 4,85 % |
| Dificil: abreviaturas ambiguas | 13,59 % | 8,09 % | 7,94 % | 7,94 % |
| Dificil: pares de pronombres | 9,45 % | 2,34 % | 2,22 % | 2,24 % |
| Dificil: contexto sin tonos | 10,04 % | 6,20 % | 6,22 % | 6,22 % |

El autor advierte que el conjunto de contexto proviene del mismo generador que los datos de entrenamiento, por lo que su resultado es optimista; el conjunto dificil, sin solapamiento con el entrenamiento, es la medida mas justa.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo INT8 ocupa unos 20,8 MB en disco y la inferencia cabe holgadamente en memoria de cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es mas que suficiente.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en CPU.
- Despliegue en borde: Raspberry Pi 4 con ONNX Runtime (build ARM64) y el runner en Rust; imagen Docker con endpoint HTTP disponible en el repositorio de GitHub.
- Opciones de despliegue: ONNX Runtime (Python o Rust), con pesos safetensors para reentrenamiento o reexportacion; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se trata de un modelo especializado y de muy pequeno tamano (19,94 M de parametros) para una tarea concreta de normalizacion de vietnamita, por lo que las comparaciones con LLM genericos no serian homogeneas.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| teencode-normalizer v3 | 19,94 M | 192 tokens | Normalizacion de teencode vietnamita | MIT | Hugging Face (ONNX + safetensors) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo reescribe texto; no traduce, no modera contenido y no genera texto libre. Esta fuera de su alcance el filtrado o la moderacion.
- El conjunto de evaluacion de contexto es in-distribution y su resultado (0,35 % CER) es optimista; el rendimiento real en texto no visto puede acercarse mas al conjunto dificil (4,95 % CER).
- El rendimiento en texto sin tonos es notablemente peor (11,19 % CER en INT8), lo que indica dificultad para restaurar diacriticos en ausencia total de informacion tonal.
- Las abreviaturas ambiguas siguen presentando un CER elevado (8,09 % en INT8), lo que puede producir normalizaciones incorrectas en casos ambiguos.
- La decodificacion greedy sin el guard de alineacion puede producir ocasionalmente palabras mal formadas; se recomienda beam 4 + guard.
- El ambito linguistico esta limitado al vietnamita; no hay soporte multilingue.
- La longitud maxima de 192 tokens limita la normalizacion de entradas largas.
- Los pares de entrenamiento son sinteticos, lo que puede introducir un sesgo de distribucion respecto al teencode real.
- Licencia MIT: permite uso comercial, pero se recomienda revisar los terminos del repositorio de GitHub asociado, ya que la model card referencia una URL con marcador de posicion (`<you>`).

## Enlaces

- Hugging Face: https://huggingface.co/tfvn/TTS-standardlization
- Repositorio de GitHub (referenciado en la model card, URL con marcador de posicion): https://github.com/<you>/teencode-normalizer
- No se han encontrado otros enlaces (papers, blogs, demos) en la informacion disponible.
