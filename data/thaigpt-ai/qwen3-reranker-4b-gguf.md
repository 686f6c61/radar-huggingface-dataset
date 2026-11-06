# thaigpt-ai/Qwen3-Reranker-4B-GGUF

## Resumen

Qwen3-Reranker-4B-GGUF es la conversion al formato GGUF del modelo Qwen/Qwen3-Reranker-4B, un reranker (modelo de reordenacion de documentos) desarrollado originalmente por el equipo Qwen de Alibaba. Esta version concreta la publica el usuario thaigpt-ai, que la genera con el script `convert_hf_to_gguf.py` de llama.cpp en cuantizacion Q8_0 y, de forma destacable, conserva la cabeza de reordenacion `cls.output`, un detalle critico porque algunas conversiones comunitarias la omiten y devuelven puntuaciones practicamente nulas.

El modelo resuelve el segundo estadio de un pipeline RAG: tras una recuperacion densa o hibrida, el reranker reordena el pool de candidatos segun su relevancia real respecto a la consulta. Con 4.021.789.696 parametros y una ventana de contexto operativa de 8192 tokens en llama.cpp, esta pensado para despliegues en produccion donde se necesita una mejora medible de precision sin recurrir a modelos propietarios de ranking.

Su relevancia actual radica en dos factores: la licencia Apache-2.0, que permite uso comercial sin restricciones adicionales, y la disponibilidad en GGUF, que lo hace ejecutable en llama.cpp con aceleracion GPU completa (`-ngl 99`) y expuesto mediante un endpoint compatible con la API `/v1/rerank`. El autor lo emplea en su propio motor RAG empresarial sobre hardware DGX Station.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Qwen3), con cabeza de clasificacion para ranking (`cls.output`) |
| Parametros totales | 4.021.789.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuracion recomendada en llama.cpp con `-c 8192`) |
| Tipos de cuantizacion | Q8_0 (unica cuantizacion publicada en este repositorio) |
| Idiomas soportados | Tailandes (th), ingles (en), multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`qwen3-reranker-4b-q8_0.gguf`, 4,3 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Reranker-4B, un transformer de la familia Qwen3 reconvertido para la tarea de text-ranking: en lugar de generar texto, produce una puntuacion de relevancia por par consulta-documento mediante una cabeza de clasificacion. Esta version GGUF mantiene esa cabeza (`cls.output`) intacta tras la conversion con `convert_hf_to_gguf.py`, lo que es imprescindible para que las puntuaciones sean utiles; el autor advierte explicitamente de que otras conversiones comunitarias sin esa cabeza devuelven valores cercanos a cero.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO especificas para el reranking. La unica intervencion documentada en este repositorio es la conversion de formato y la cuantizacion Q8_0, sin modificacion de los pesos mas alla de la perdida de precision inherente a la cuantizacion.

## Capacidades

- Reordenacion de documentos (reranking) para pipelines de recuperacion aumentada (RAG), devolviendo puntuaciones de relevancia consulta-documento.
- Integracion nativa con llama.cpp mediante el flag `--rerank` y el endpoint HTTP `/v1/rerank`.
- Soporte de contexto de hasta 8192 tokens, adecuado para documentos de longitud media y pools de candidatos amplios.
- Capacidad multilingue declarada, con enfasis en tailandes e ingles.
- Compatibilidad con endpoints (`endpoints_compatible`) para su despliegue como servicio.
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision ni audio: es un modelo especializado exclusivamente en ranking.

## Casos de uso

- Motor RAG empresarial en tailandes: el autor lo emplea en su AI Server Suite RAG Engine (Enterprise) sobre DGX Station, combinando recuperacion densa con BM25 tailandes y un pool de reordenacion de 60 documentos. El modelo mejora el recall@1 y recall@8 respecto a la variante de 0,6B en dominios especializados como derecho fiscal y derecho civil y comercial.
- Busqueda juridica y documental: con un recall@1 de 0,70 en CCL y 0,33 en Tax sobre NitiBench, es adecuado para sistemas de consulta normativa donde la posicion del documento relevante en el top-k determina la calidad de la respuesta final.
- Segunda etapa de pipelines de recuperacion hibrida: se inserta tras un retriever denso o lexico para reordenar los 50-100 candidatos iniciales antes de pasarlos al generador, reduciendo el ruido contextual.
- Atencion al cliente con base de conocimiento: al reordenar respuestas candidatas de una FAQ o manual interno, mejora la precision de la respuesta mostrada o enviada al LLM generador.
- Filtrado de resultados en buscadores internos: clasifica y ordena documentos corporativos multilingues (tailandes/ingles) segun relevancia a la consulta del empleado.
- Evaluacion y ajuste de pipelines RAG: sirve como componente de referencia para medir el impacto de cambios en el retriever, ya que su salida es una puntuacion comparable entre configuraciones.
- Despliegue en infraestructura propia sin dependencia de APIs: al ser GGUF y Apache-2.0, puede ejecutarse en servidores on-premise con llama.cpp y GPU consumer o profesional.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre NitiBench (derecho tailandes), con un RAG Engine de recuperacion hibrida densa + BM25 tailandes y un pool de reordenacion de 60 documentos:

| Reranker | Tax recall@1 | Tax recall@8 | CCL recall@1 | CCL recall@8 |
|---|---|---|---|---|
| Qwen3-Reranker-0.6B | 0,28 | 0,48 | 0,64 | 0,83 |
| Qwen3-Reranker-4B (este fichero) | 0,33 | 0,53 | 0,70 | 0,86 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa 4,3 GB; con overhead de contexto y buffers de llama.cpp, se recomienda al menos 6-8 GB de VRAM para cargar el modelo completo en GPU.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM permite cargar el modelo completo con `-ngl 99`; para mayor throughput en produccion, A100, H100 o L40S son adecuadas. El autor lo ejecuta en DGX Station.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: llama.cpp (`llama-server -m qwen3-reranker-4b-q8_0.gguf --rerank -ngl 99 -c 8192 -ub 8192`), con endpoint `/v1/rerank`. No se documentan otras opciones (vLLM, TGI, Ollama) en la informacion proporcionada.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni de documentos reordenados por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (NitiBench Tax r@1 / CCL r@1) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-Reranker-4B-GGUF (este) | 4,02B | 8192 | 0,33 / 0,70 | Apache-2.0 | GGUF Q8_0 |
| Qwen3-Reranker-0.6B | no disponible (aprox. 0,6B por nombre) | no disponible | 0,28 / 0,64 | Apache-2.0 (presumible, mismo equipo) | no disponible |

No se dispone en la informacion proporcionada de datos comparativos con otros rerankers de la misma categoria (por ejemplo, BGE-reranker, Cohere Rerank u otros), por lo que la comparativa se limita a la variante de 0,6B de la misma familia.

## Limitaciones y advertencias

- Solo se publica la cuantizacion Q8_0; no hay variantes Q4, Q5 ni FP16 en este repositorio, lo que limita el ajuste fino de memoria frente a calidad.
- La ventana de contexto operativa documentada es de 8192 tokens; documentos mas largos requeriran truncado o fragmentacion previa.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto libre), pero si puede asignar puntuaciones altas a documentos irrelevantes en dominios muy alejados de los datos de entrenamiento.
- Sesgos conocidos: no documentados en la informacion proporcionada; el rendimiento medido se limita a un benchmark de derecho tailandes, por lo que la generalizacion a otros dominios e idiomas no esta validada.
- Dependencia critica de la cabeza `cls.output`: si se usa otra conversion GGUF sin esa cabeza, las puntuaciones seran practicamente nulas. Verificar el sha256 (`b5e91ffdd9a1896bbc2e87e5132ea88554e7384882504108c5914e7e5b9017d7`) antes de desplegar.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base original de Qwen por si hubiera terminos adicionales no reflejados en esta ficha.
- El repositorio tiene muy pocas descargas (38) y cero likes en el momento de la consulta; es una conversion reciente y de un autor individual, no una publicacion oficial de Qwen.
- No se documentan garantias de soporte ni mantenimiento del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thaigpt-ai/Qwen3-Reranker-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- llama.cpp (herramienta de conversion y servidor): no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
