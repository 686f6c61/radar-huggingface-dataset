# xbill9/gemma-4-26B-A4B-it-qat-q4_0-fp8-text-emb4

## Resumen

Este repositorio es una compilación no oficial de los pesos de Google Gemma 4 26B-A4B-it, publicada por el usuario xbill9. Se trata de un modelo de lenguaje de arquitectura transformer con mezcla de expertos (MoE) e instrucciones afinadas, cuantizado en formato FP8 E4M3 (W8A8) sobre todas sus capas lineales, con embeddings y `lm_head` en int4. El resultado es un checkpoint de 23,66 GiB y 25.971.339.294 parámetros totales, derivado de `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`.

La relevancia de esta ficha radica en que ilustra el flujo de cuantización posterior al entrenamiento con reconocimiento de cuantización (QAT) de Google: los pesos ya venían ajustados a una rejilla de 4 bits con una escala por grupo de 32 valores, y esta build los vuelve a redondear a FP8 con una escala por canal de salida, además de cuantizar las activaciones. El autor reporta un error RMS relativo del 2,60 % respecto a los pesos QAT originales.

El modelo es solo texto (la variante multimodal se descarta), está pensado para servirse con vLLM y, según la propia model card, todavía no ha sido servido ni evaluado: está en cola para una tanda de pruebas en una AMD Instinct MI300X. La licencia declarada es Apache 2.0, con enlace a los términos de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE); 128 expertos por capa y router separado en bf16 |
| Parametros totales | 25.971.339.294 (aprox. 26B) |
| Parametros activos | Aprox. 4B segun la nomenclatura A4B del modelo (dato no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 W8A8 en capas lineales (una escala float32 por canal de salida); embeddings y `lm_head` en int4; router en bf16; origen QAT en rejilla de 4 bits con escala por grupo de 32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a los terminos de licencia de Gemma 4) |
| Formato de pesos | safetensors con `compressed-tensors` (cuantizacion `float-quantized`), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE). Cada capa almacena 128 expertos repartidos originalmente en dos bancos fusionados (`experts.gate_up_proj` y `experts.down_proj`); esta build los separa en un modulo por experto (`experts.{i}.{gate,up,down}_proj`), siguiendo la disposicion del repack W4A16 del mismo autor. El router (`router.proj`) se mantiene en bf16.

El entrenamiento original de Google aplico QAT (quantization-aware training), de modo que los pesos ya estaban ajustados a una rejilla de 4 bits con una escala por grupo de 32 valores. Esta build no usa datos de calibracion: vuelve a redondear esos pesos a FP8 E4M3 con una escala por canal de salida —lo que no puede representar las escalas por grupo del QAT— y ademas cuantiza las activaciones a FP8 por token en tiempo de ejecucion. El script de construccion (`fp8_text.py`, con ayudantes importados de `repack_q4_0.py`) se incluye en el propio repositorio. Las embeddings y `lm_head` (sin atar) son las tablas int4 de la build `xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text-emb4`, copiadas sin cambios. Los 391 tensores restantes son identicos byte a byte a su origen. El autor no detalla la composicion del dataset de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno, al ser una variante instruccional (`it`).
- Modelo exclusivamente de texto: la model card indica explicitamente "text only", por lo que no hay soporte de vision ni audio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada; el modelo es solo texto.
- Eficiencia de inferencia derivada de la arquitectura MoE, que activa un subconjunto de expertos por token segun la nomenclatura A4B.

## Casos de uso

- Servicio de generacion de texto con vLLM: el modelo se distribuye en formato compatible con vLLM y pesa 23,66 GiB, por lo que puede desplegarse en una sola GPU de 80 GB para servir peticiones concurrentes de texto.
- Asistentes conversacionales multi-turno: al ser una variante instruccional, es adecuado para dialogos mantenidos donde se reutiliza el estado de la conversacion; la longitud de contexto disponible no se especifica.
- Procesamiento por lotes de documentos: su naturaleza MoE con aproximadamente 4B de parametros activos permite procesar volumenes altos de texto con un coste por token inferior al de un modelo denso de 26B equivalente.
- Generacion de datos sinteticos y aumento de corpus: util para producir texto a escala como paso previo al entrenamiento o ajuste fino de modelos menores.
- Resumen y extraccion de informacion: tareas de compresion de documentos largos y extraccion de campos estructurados aprovechando la capacidad generativa de un modelo instruccional de 26B.
- Sistemas de recuperacion aumentada (RAG): integrable como generador final sobre un recuperador externo, apoyandose en el despliegue con vLLM y en la cuantizacion FP8 para reducir el coste de memoria.
- Chatbots de dominio especifico: ajustables o utilizados en zero-shot para asistencia interna, siempre que se valide el comportamiento por no haber sido evaluado todavia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explicitamente que el modelo "no ha sido servido ni evaluado todavia" y que esta en cola para una tanda de pruebas en una AMD Instinct MI300X. El unico dato cuantitativo de calidad es la desviacion respecto a los pesos QAT de origen:

| Metrica (frente a los pesos QAT) | Valor |
|---|---:|
| Modulos lineales en FP8 | 11.725 |
| Valores cuantizados | 24.483.430.400 |
| Error RMS relativo | 2,60 % |
| Error maximo, como fraccion del mayor valor de su fila | 3,57 % |
| Otros tensores identicos byte a byte | 391 de 391 |
| Tamano del checkpoint | 23,66 GiB |

## Requisitos de hardware

- VRAM estimada para los pesos: 23,66 GiB en FP8, sin contar cache KV ni activaciones. Con contexto largo y lotes grandes la VRAM necesaria crece por encima de ese valor.
- GPU con soporte nativo de FP8 recomendadas: H100, L40S, L4 (arquitecturas Hopper y Ada) y AMD Instinct MI300X (192 GB de HBM3), esta ultima mencionada por el propio autor para la tanda de pruebas.
- GPU de centro de datos alternativas: A100 (40 o 80 GB) y A100 80 GB; en A100 la FP8 no es nativa y puede requerir emulacion o conversion, con impacto en rendimiento.
- Consumer GPU: una RTX 4090 de 24 GB queda al limite, ya que solo los pesos ocupan 23,66 GiB; no es probable que quepan cache KV y activaciones sin cuantizacion adicional. Una RTX 6000 Ada de 48 GB o una GPU profesional con 48 GB o mas ofrecen margen suficiente.
- Opciones de despliegue: vLLM es la libreria declarada por el autor; el formato `compressed-tensors` tambien puede soportarse en otros runners que lo implementen. No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; el autor no ha publicado mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| xbill9/gemma-4-26B-A4B-it-qat-q4_0-fp8-text-emb4 (esta build) | 25.971.339.294 (~26B, MoE) | FP8 E4M3 W8A8 + embeddings int4 | no disponible | Apache 2.0 | No evaluado; solo texto |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | no disponible (pesos QAT sin cuantizar) | Sin cuantizar (rejilla QAT de 4 bits en origen) | no disponible | Apache 2.0 | Modelo base oficial de Google |
| xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text | no disponible | W4A16 con embeddings int4 | no disponible | Apache 2.0 | Conserva la rejilla QAT exacta; solo texto |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo entre estas variantes; la unica diferencia documentada es el formato de almacenamiento y el error de cuantizacion introducido.

## Limitaciones y advertencias

- Modelo solo texto: no procesa imagenes ni audio, pese a que la familia Gemma pueda incluir variantes multimodales.
- No ha sido servido ni evaluado: no existen mediciones de calidad, latencia o throughput; su comportamiento en produccion es incierto.
- Build no oficial: no esta afiliada ni respaldada por Google; los problemas deben reportarse al autor del repositorio, no a Google.
- Error de cuantizacion: al pasar de la rejilla QAT de 4 bits (escala por grupo de 32) a FP8 con escala por canal de salida, se introduce un error RMS relativo del 2,60 % y un error maximo del 3,57 %; para la rejilla QAT exacta el autor recomienda la build W4A16.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluacion especifica que lo cuantifique. No se han publicado datos sobre sesgos.
- Idiomas soportados: no disponible; no se puede garantizar un rendimiento multilingue concreto.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero el enlace apunta a los terminos de licencia de Gemma 4; conviene revisar dichos terminos antes de un uso comercial.
- Requisitos de memoria estrictos: 23,66 GiB solo de pesos dejan poco margen en GPU de 24 GB para cache KV y activaciones.
- Longitud de contexto no especificada: limita la planificacion de despliegues que dependan de ventanas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-fp8-text-emb4
- Modelo base (Google): https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Build W4A16 con embeddings int4 (origen de los tensores int4): https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text-emb4
- Build W4A16 (disposicion de expertos de referencia): https://huggingface.co/xbill9/gemma-4-26B-A4B-it-qat-q4_0-w4a16-ct-text
- Terminos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
