# xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct-text-emb4

## Resumen

`xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct-text-emb4` es un reempaquetado no oficial del modelo `google/gemma-4-12B-it-qat-q4_0-unquantized` de Google, un transformer denso de 12,9 mil millones de parametros afinado con instrucciones y entrenado con Quantization-Aware Training (QAT). El autor, xbill9, parte del checkpoint QAT y lo publica en formato `compressed-tensors` con cuantizacion W4A16 (pesos en int4, activaciones en 16 bits) y, como novedad respecto a su repack anterior, con las tablas de embeddings tambien empaquetadas en int4.

El problema que resuelve es de eficiencia de despliegue: reducir el peso del checkpoint a 6,77 GiB sin salir de la rejilla de 4 bits sobre la que se entreno el modelo con QAT, de forma que pueda servirse en GPUs de consumo con vLLM. Para ello el autor desacopla (`untie`) la capa `lm_head`, que en el modelo original estaba atada a los embeddings, porque vLLM reconstruye la salida copiando el `.weight` del embedding y un embedding empaquetado en int4 no expone ese tensor en el formato esperado.

Es relevante ahora porque la familia Gemma 4 de Google incluye checkpoints QAT (Q4_0) y variantes multimodal y de distintos tamanos (E2B, E4B, 12B, 26B A4B, 31B), y este tipo de repacks no oficiales permite evaluar el modelo cuantizado en hardware modesto. La contrapartida es que la variante aqui descrita es solo texto y requiere vLLM 0.29 o superior, ademas de ser un artefacto de terceros sin soporte de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decodificador, instruction-tuned (familia Gemma 4) |
| Parametros totales | 12.913.983.280 (aproximadamente 12,9 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens segun la informacion del modelo base de Google; no confirmado en este repack |
| Tipos de cuantizacion | W4A16 (pesos int4, activaciones 16 bits), esquema de grupo 32; embeddings en int4 con escalas fp16; formato compressed-tensors |
| Idiomas soportados | no disponible para este repack (el modelo base de Google es multilingue) |
| Licencia | Gemma (`gemma`) |
| Formato de pesos | safetensors (compressed-tensors, `gemma4_unified_text`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 12,9 B de parametros de la familia Gemma 4, afinado con instrucciones. Google lo entreno con Quantization-Aware Training, de modo que los pesos quedan alineados con una rejilla de 4 bits (Q4_0, grupo 32) desde la propia fase de entrenamiento; el objetivo es que la inferencia cuantizada conserve una calidad proxima a bf16. El checkpoint de partida de este repack es `google/gemma-4-12B-it-qat-q4_0-unquantized`, una extraccion en media precision de ese pipeline QAT.

Sobre esa base, xbill9 aplica un repack W4A16 con `compressed-tensors` y extiende la cuantizacion a las tablas de embeddings mediante el script `embed_int4.py` (`--embed-tokens`, escalas en fp16 por defecto). Segun la model card, el embedding `embed_tokens` pasa de 1,875 GiB en bf16 a 0,527 GiB en int4 mas escalas fp16 (rango de escalas 0,000467 a 0,652), con 0 grupos fuera de rejilla y un 73,68 % de valores bit-identicos respecto al original, con un error maximo de 6,58e-03 del maximo del grupo. Las capas lineales se mantienen sin cambios respecto al repack W4A16 previo. La innovacion tecnica destacable es precisamente el desempaquetado de `lm_head`: al no existir una version atada compatible con el embedding empaquetado, se almacena como una capa independiente con los mismos niveles int4, evitando el fallo de construccion que vLLM provoca al intentar copiar el `.weight` del embedding.

## Capacidades

- Generacion de texto, razonamiento y conversacion multi-turno en modo instrucciones.
- Generacion de codigo, redaccion creativa (poemas, guiones, copys de marketing, borradores de correo) y resumen, segun la descripcion del modelo base.
- Capacidades multilingues heredadas del modelo base de Google, aunque no verificadas para este repack concreto.
- Contexto largo de hasta 256.000 tokens segun la informacion del modelo base.
- Cuantizacion W4A16 con embeddings int4, pensada para despliegue eficiente en vLLM.
- Solo texto: se elimina la ruta multimodal (imagen y audio) presente en otras variantes del base.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes o modo de razonamiento explicito (thinking mode); indica "no disponible" para esos apartados.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a la ventana de hasta 256.000 tokens del base, aunque debe verificarse el comportamiento real del repack en contextos muy largos.
- Generacion de codigo en produccion: util para autocompletado y generacion de fragmentos en pipelines de desarrollo; no se documenta soporte de tool calling en este repack, por lo que la integracion con herramientas externas requiere validacion adicional.
- Redaccion y marketing: generacion de copys, correos y borradores de contenido, un uso explicitamente citado en la documentacion del modelo base.
- Despliegue en GPU de consumo: al ocupar 6,77 GiB en int4, permite servir un 12B en tarjetas de 12 GB como RTX 3060 o RTX 4070, segun la guia de configuracion encontrada.
- Evaluacion e investigacion de cuantizacion: sirve para medir el impacto de cuantizar tambien los embeddings (W4A16 + int4 en embeddings) frente al repack solo-text sin embeddings empaquetados.
- Prototipado rapido y entornos de laboratorio: con vLLM 0.29 o superior se puede levantar un endpoint compatible con la API de OpenAI para experimentos internos.
- Resumen y extraccion de informacion de documentos largos: el contexto de 256.000 tokens del base permite procesar documentos extensos en una sola pasada, sujeto a la memoria disponible para la cache KV.
- Sustitucion de servicios cerrados en entornos con presupuesto de GPU limitado: la licencia Gemma y el tamano reducido del checkpoint facilitan el autohospedaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del checkpoint en int4: 6,77 GiB (el repositorio completo ocupa 7,3 GB).
- VRAM estimada para inferencia: aproximadamente 7 GB solo para pesos; a esto hay que sumar cache KV y activaciones. La guia encontrada indica que el 12B QAT puede ejecutarse en una GPU de 12 GB con vLLM, con ajuste de la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 12 GB y superiores para uso local; RTX 4090 24 GB para contextos mas largos; A100 40/80 GB y H100 para servicio en produccion. La ruta de desarrollo del autor incluye pruebas en T4 (16 GB), por lo que esta tambien es viable.
- Cabe en GPU de consumo: si, en modelos de 12 GB o mas, siempre que se limite la longitud de contexto para que la cache KV entre en memoria.
- Opciones de despliegue: vLLM 0.29 o superior (requiere el operador `CompressedTensorsEmbeddingWNA16Int`); el modelo base cuenta ademas con version GGUF Q4_0, desplegable con llama.cpp u Ollama, aunque este repack concreto no es GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct-text-emb4 (este) | 12,9 B | 256 K (segun base) | safetensors, W4A16 + embeddings int4 | Gemma | Comunidad, no oficial |
| xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct-text | 12,9 B | 256 K (segun base) | safetensors, W4A16, embeddings sin empaquetar | Gemma | Comunidad, no oficial |
| google/gemma-4-12B-it-qat-w4a16-ct | 12,9 B | 256 K | safetensors, checkpoint QAT sin cuantizar | Gemma | Oficial |
| google/gemma-4-12B-it-qat-q4_0-gguf | 12,9 B | 256 K | GGUF Q4_0 | Gemma | Oficial |

La diferencia principal entre el modelo de esta ficha y el repack solo-text previo del mismo autor es el empaquetado en int4 de `embed_tokens` y el desacoplamiento de `lm_head`, que reducen el tamano del checkpoint a 6,77 GiB. Frente al checkpoint oficial sin cuantizar, la ventaja es el menor consumo de memoria; frente a la version GGUF oficial, la diferencia es el ecosistema de despliegue (vLLM con compressed-tensors en lugar de llama.cpp).

## Limitaciones y advertencias

- Solo texto: las rutas de imagen y audio presentes en otras variantes del modelo base de Google no estan disponibles.
- Artefacto no oficial: el autor indica explicitamente que los problemas deben reportarse en su repositorio, no a Google.
- Requiere vLLM 0.29 o superior por el uso del operador `CompressedTensorsEmbeddingWNA16Int`; versiones anteriores no podran cargarlo.
- La cuantizacion de embeddings introduce un error maximo de 6,58e-03 respecto al maximo del grupo, aunque el 73,68 % de los valores son bit-identicos al original.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan tasas ni evaluaciones especificas para este repack.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de idioma: la cobertura multilingue no esta verificada para este repack concreto.
- Restricciones de licencia: se aplica la licencia Gemma de Google, cuyos terminos de uso comercial deben revisarse antes de un despliegue en produccion.
- Contexto: aunque el base anuncia 256.000 tokens, en una GPU de 12 GB la longitud practica estara muy limitada por el tamano de la cache KV.
- No se documentan capacidades de tool calling ni de agentes, por lo que no deben asumirse en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct-text-emb4
- Repack previo solo texto sin embeddings int4: https://huggingface.co/xbill9/gemma-4-12B-it-qat-q4_0-w4a16-ct-text
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Checkpoint QAT oficial en compressed-tensors: https://huggingface.co/google/gemma-4-12B-it-qat-w4a16-ct
- Version GGUF Q4_0 oficial: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf
- Script de empaquetado de embeddings: https://github.com/xbill9/gemma4-dev/blob/main/gpu-vllm-t4-2b-w4a16/repack/embed_int4.py
- Guia de despliegue en GPU de 12 GB: https://markaicode.com/howto/gemma-4-setup-and-configuration-guide/
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/gemma-4-12b-it-qat-w4a16-ct-google
- Ficha en Inferix: https://inferix.co/models/google/gemma-4-12B-it-qat-w4a16-ct
