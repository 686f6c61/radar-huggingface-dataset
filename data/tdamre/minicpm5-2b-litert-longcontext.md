# Tdamre/MiniCPM5-2B-LiteRT-LongContext

## Resumen

Tdamre/MiniCPM5-2B-LiteRT-LongContext es un repositorio de conversiones cuantizadas del modelo openbmb/MiniCPM5-2B al formato LiteRT-LM (`.litertlm`), orientado a inferencia en dispositivo (*on-device*) con soporte de contexto largo. No es un modelo entrenado desde cero ni un ajuste fino: los pesos proceden íntegramente del checkpoint upstream, transformados y cuantizados a INT4. El repositorio publica tres variantes con caché KV de tamaño fijo exacto: 16.384, 32.768 y 65.536 tokens, todas con el mismo conjunto de pesos (1.561.643.360 bytes por fichero).

La relevancia de esta conversión reside en que el checkpoint original admite hasta 131.072 posiciones, pero los *builds* habituales de LiteRT-LM para MiniCPM5 suelen compilarse con cachés de 4K, lo que limita su uso en tareas que requieren contexto largo en el dispositivo. Este repositorio empaqueta explícitamente la capacidad de caché KV a 16K, 32K y 64K, manteniéndose por debajo del límite aprendido del modelo base.

El desarrollador es el usuario Tdamre, no el equipo de OpenBMB (autor del modelo original). El repositorio se creó el 10 de septiembre de 2026, cuenta con 0 descargas y 0 *likes* en el momento de redactar esta ficha, y se distribuye bajo licencia Apache-2.0, heredada del modelo upstream. El tamaño total del repositorio es de 4,7 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada. El repositorio documenta únicamente el proceso de conversión del modelo base openbmb/MiniCPM5-2B; no detalla si se trata de un transformer denso, MoE o arquitectura híbrida |
| Parametros totales | Aproximadamente 2.000 millones, según la nomenclatura del modelo base (MiniCPM5-2B); no se confirma numéricamente en la información disponible |
| Parametros activos | No aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | Tres builds de caché KV fija: 16.384, 32.768 y 65.536 tokens. El checkpoint upstream soporta hasta 131.072 posiciones |
| Tipos de cuantizacion | BOCTAV4: INT4 blockwise-32 (bloques de 32) con recorte OCTAV en pesos lineales, más embeddings en INT8. No se ofrecen variantes FP16, GGUF ni de otro esquema |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada de openbmb/MiniCPM5-2B) |
| Formato de pesos | LiteRT-LM (`.litertlm`), un fichero por variante de contexto. No se publican safetensors ni GGUF |
| Tamano por fichero | 1.561.643.360 bytes (idéntico en las tres variantes) |
| Tamano del repositorio | 4,7 GB |
| Embedder | Externalizado |
| Escalera de prefill | 1024, 256, 64, 16, 4, 1 |
| Tokens de inicio/parada | Inicio `<s>`; IDs de EOS 1 y 130073 |
| Fecha de conversión | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno: el autor declara explícitamente que «no se aplicó ajuste fino» y que los pesos son una transformación cuantizada de openbmb/MiniCPM5-2B. La arquitectura subyacente es, por tanto, la del checkpoint upstream, que no se describe en la model card. La innovación técnica del repositorio es de empaquetado e inferencia, no de modelado.

El proceso de conversión emplea el formato LiteRT-LM y la cuantización denominada BOCTAV4: cuantización INT4 por bloques de 32 con recorte OCTAV para los pesos lineales, y embeddings en INT8. Cada variante se compila con una caché KV de longitud fija potencia de dos (16.384, 32.768 o 65.536 tokens), con una escalera de firmas de prefill de 1024, 256, 64, 16, 4 y 1, pensada para reutilizar la caché de forma incremental durante la decodificación. El *embedder* se externaliza y la plantilla de chat upstream (`chat_template.jinja`) se preserva a través de la ruta Jinja de MiniCPM5 en LiteRT, incluyendo el comportamiento de *thinking* y de llamada a herramientas.

Un detalle técnico destacable es la reparación de escalas cero: MiniCPM5 contiene filas de pesos totalmente nulas en la MLP de la capa 0. El cuantizador por bloques INT4 genera escalas cero para esos bloques, que XNNPACK rechaza. Cada paquete aplica una reparación *in-place*: 1.664 escalas fp16 nulas se sustituyen por la escala positiva más pequeña ya presente en el tensor de escalas afectado. El cambio afecta exactamente a 3.328 bytes y no altera los valores desquantizados de los pesos, ya que los valores de bloque cuantizados son cero. La conversión se realizó en WSL2 con litert-torch 0.10.0, LiteRT-LM 0.17.0, litert-lm-builder 0.17.0, litert-converter 0.4.0, `ai-edge-quantizer-nightly` 0.10.0.dev20260910, torch 2.14.0, transformers 5.17.0 y huggingface-hub 1.31.0, sobre Python 3.13.13.

## Capacidades

- Generación de texto en modo *on-device*, con el pipeline declarado `text-generation`.
- Contexto largo real en dispositivo: hasta 65.536 tokens de caché KV compilada, frente a los *builds* típicos de 4K de LiteRT-LM.
- Modo *thinking*: la plantilla de chat upstream se conserva, incluyendo el comportamiento de razonamiento explícito del modelo base.
- Llamada a herramientas (*tool calling* / *function calling*): preservada a través de la ruta Jinja de MiniCPM5 en LiteRT.
- Razonamiento multi-paso y uso como agente: derivado del soporte de *tool calling* y del modo *thinking* del modelo base; no se documentan flujos de agente específicos en la model card.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).
- Capacidad de visión o audio: no disponible; el repositorio se declara exclusivamente de generación de texto.
- Ejecución con backend XNNPACK en el runtime LiteRT-LM, con *embedder* externalizado.

## Casos de uso

- Asistentes y chatbots locales en móvil: al compilar una caché KV de 16K en un fichero de 1,56 GB, el modelo puede mantener conversaciones multi-turno extensas sin salir del dispositivo, lo que evita enviar datos del usuario a un servidor.
- Resumen de documentos largos sin conexión: la variante de 64K permite procesar informes, contratos o expedientes de decenas de miles de tokens en un dispositivo con RAM suficiente, algo imposible con los *builds* de 4K habituales.
- Preguntas y respuestas sobre base documental local (RAG en dispositivo): con 32K o 64K de caché se pueden inyectar varios fragmentos recuperados más el historial de la conversación en una sola ventana, manteniendo los documentos dentro del dispositivo.
- Agentes de dispositivo con llamada a herramientas: el soporte de *tool calling* heredado de la plantilla de chat permite encadenar acciones (consultas a APIs locales, control de aplicaciones, acceso a ficheros) en flujos multi-paso ejecutados en el propio terminal.
- Procesamiento de texto en el borde para privacidad y cumplimiento: despliegues en kioscos, lectores de documentos o equipos industriales donde no se permite la salida de datos a la nube y el INT4 reduce el consumo de memoria y energía.
- Transcripción y post-procesado de reuniones: dado un ASR local que entregue transcripciones largas, el modelo puede resumir, extraer acuerdos y generar actas dentro de la ventana de 64K.
- Clasificación y extracción de información en pipelines por lotes locales: con la variante de 16K y su menor consumo de memoria, se pueden procesar colas de documentos en CPU con XNNPACK en equipos sin GPU dedicada.
- Prototipado de aplicaciones LiteRT-LM: el repositorio sirve como artefacto de referencia para medir el impacto real de la longitud de caché KV en latencia y RAM antes de compilar un *build* propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni comparaciones cuantitativas con el checkpoint original o con otras cuantizaciones. Tampoco se publican mediciones de latencia, *throughput* ni consumo de memoria en dispositivos concretos.

## Requisitos de hardware

- Peso en disco: 1.561.643.360 bytes (aproximadamente 1,56 GB) por cada variante; el repositorio completo ocupa 4,7 GB.
- VRAM/RAM para los pesos: alrededor de 1,5 GB en el runtime LiteRT-LM para cualquiera de las tres variantes, dado que el esquema INT4 es idéntico y solo cambia la caché KV compilada.
- Memoria para la caché KV: no se publican cifras. La model card advierte que el uso de memoria a contexto largo escala con la longitud de la caché, por lo que las variantes de 32K y, sobre todo, de 64K exigen «sustancialmente más RAM en tiempo de ejecución» que el *build* típico de 4K. La cifra exacta depende de la configuración de capas y cabezas del modelo base, no documentada aquí.
- GPUs recomendadas: no disponible. El destino declarado del formato `.litertlm` no son aceleradores de centro de datos (A100, H100), sino aceleradores de borde y CPU con XNNPACK. La model card cita XNNPACK como backend afectado por la reparación de escalas, lo que confirma soporte de ejecución en CPU.
- ¿Cabe en GPU de consumo? No disponible como dato medido. El tamaño de pesos (1,56 GB) es compatible con GPUs de consumo (por ejemplo, RTX 3060 12 GB o superiores), pero LiteRT-LM no es el runtime habitual para CUDA y no se documentan pruebas en ese escenario.
- Opciones de despliegue: runtime LiteRT-LM (versión 0.17.0 en la conversión) con backend XNNPACK. No hay soporte indicado para vLLM, llama.cpp, Ollama o TGI, ya que no se publican pesos en safetensors ni GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tdamre/MiniCPM5-2B-LiteRT-LongContext | ~2.000 millones (según nomenclatura del base) | 16.384 / 32.768 / 65.536 tokens de caché KV fija | `.litertlm` | INT4 blockwise-32 + OCTAV, embeddings INT8 | Apache-2.0 | Repositorio HuggingFace, 0 descargas, 0 likes |
| openbmb/MiniCPM5-2B (modelo base) | ~2.000 millones (según nomenclatura) | Hasta 131.072 posiciones | No disponible en la información proporcionada | Sin cuantizar (checkpoint upstream) | Apache-2.0 | Modelo original de OpenBMB |
| Otras cuantizaciones de MiniCPM5-2B para borde | No disponible | No disponible | No disponible | No disponible | No disponible | No se han identificado en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas comparables (por ejemplo, conversiones GGUF, ONNX o builds de 4K del propio LiteRT-LM), por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- La conversión no amplía el contexto aprendido del modelo: solo modifica la capacidad compilada de la caché KV. El comportamiento más allá del contexto para el que fue entrenado el checkpoint original no mejora por usar la variante de 64K.
- Los tres ficheros contienen exactamente el mismo conjunto de pesos (1.561.643.360 bytes cada uno). La diferencia entre variantes es la caché KV compilada, no una diferencia de calidad del modelo.
- El uso de memoria crece con la longitud del contexto. Las variantes de 32K y 64K pueden provocar fallos por falta de memoria en dispositivos con RAM limitada.
- Cuantización INT4 agresiva con embeddings INT8: no se documenta en el repositorio la degradación de calidad respecto al checkpoint original, por lo que se desconoce la pérdida real en tareas sensibles a la precisión.
- Reparación de escalas cero: se sustituyen 1.664 escalas fp16 nulas por la escala positiva más pequeña del tensor afectado (3.328 bytes modificados). El autor argumenta que no cambia los valores desquantizados, pero es una intervención manual sobre los pesos que conviene tener en cuenta en una auditoría.
- Toolchain con componentes *nightly* (`ai-edge-quantizer-nightly` 0.10.0.dev20260910): la reproducibilidad futura del proceso puede verse afectada por cambios en esas versiones.
- Idiomas soportados no declarados: no es posible garantizar un comportamiento adecuado en castellano ni en otros idiomas sin evaluación propia.
- Riesgo de alucinación: no cuantificado en la información disponible. Se hereda el del modelo base, del que tampoco se aportan métricas.
- Sesgos: no documentados.
- Validación comunitaria nula: 0 descargas y 0 *likes* en el momento de la ficha. No hay evidencia de terceros sobre el funcionamiento de los artefactos.
- Licencia Apache-2.0, heredada del modelo upstream, permite uso comercial, pero al ser una obra derivada conviene verificar los términos del repositorio openbmb/MiniCPM5-2B y cualquier obligación de atribución asociada.
- Dependencia fuerte del runtime: los ficheros solo son utilizables con LiteRT-LM; no se ofrecen alternativas en safetensors o GGUF para otros motores de inferencia.
- El repositorio se publicó el 10 de septiembre de 2026 y no se ha actualizado desde entonces (última actualización el mismo día).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Tdamre/MiniCPM5-2B-LiteRT-LongContext
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Ficheros de artefacto citados en la model card (dentro del repositorio): `MiniCPM5-2B-LiteRT-INT4-16k.litertlm`, `MiniCPM5-2B-LiteRT-INT4-32k.litertlm`, `MiniCPM5-2B-LiteRT-INT4-64k.litertlm`
- Documentación de reproducibilidad citada en la model card (dentro del repositorio): `litertlm_manifest.json`, `validation_report.txt`, `convert_minicpm5_longcontext.sh`
- Papers, blogs, repositorios o demos adicionales: no se han encontrado en la búsqueda web realizada (los resultados obtenidos no guardan relación con el modelo).
