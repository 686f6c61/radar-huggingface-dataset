# TNSA/NGen-5-20B-A3B

## Resumen

NGen-5-20B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por TNSA, publicado como pesos abiertos dentro de la serie NGen-5. Se trata de una variante independiente de la serie cerrada NGen-5 de la misma compania, disenada para su despliegue y estudio por parte de la comunidad. El modelo emplea una arquitectura decoder-only con atencion hibrida: combina capas de atencion lineal Gated DeltaNet con capas de atencion completa con compuertas, en una proporcion de 3 a 1.

Con 20.464.764.784 parametros totales y aproximadamente 3.000 millones de parametros activos por token, el modelo ofrece una ventana de contexto de 262.144 tokens, lo que lo situa en el rango de contexto largo. Los pesos se distribuyen en precision FP8 (e4m3 con escalas de bloque 128x128), mientras que routers, normalizaciones, embeddings y la cabeza de salida se mantienen en BF16. El repositorio ocupa aproximadamente 22 GB.

El modelo esta orientado a generacion de texto, razonamiento con modo "thinking" y conversacion, y esta entrenado principalmente para ingles. Su relevancia actual radica en la combinacion de contexto muy largo, activacion dispersa de expertos y cuantizacion FP8 nativa, lo que reduce los requisitos de memoria frente a un modelo denso de tamano equivalente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts decoder-only con atencion hibrida (3 capas Gated DeltaNet lineal + 1 capa de atencion completa con compuertas) |
| Parametros totales | 20.464.764.784 (20.5B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 (e4m3, escalas de bloque 128x128) en pesos; routers, normas, embeddings y cabeza de salida en BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | tnsa-owml (TNSA open-weight model license); incluye material de terceros bajo Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 40 capas, tamano oculto de 2048 y una capa MoE dispersa. Cada capa contiene 136 expertos enrutados con activacion top-8 mas un experto compartido, con tamano oculto de experto de 512. La innovacion arquitectonica principal es la atencion hibrida: por cada tres capas de atencion lineal Gated DeltaNet se intercala una capa de atencion completa con compuertas, lo que reduce el coste computacional y de memoria en secuencias largas manteniendo capacidad de recuperacion de informacion a larga distancia.

Los pesos se almacenan en FP8 (e4m3) con escalas de bloque de 128x128, mientras que los componentes sensibles a la precision (routers, normalizaciones, embeddings y cabeza de salida) se conservan en BF16. El identificador de configuracion es `model_type: ngen5_moe`. El codigo del modelo se distribuye en el archivo `modeling_ngen5_moe.py`, escrito para la libreria OpenArchX, y carga directamente los pesos FP8 del repositorio.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona que el modelo aprendio de modelos upstream (Qwen, Kimi, GLM o DeepSeek), lo que sugiere un proceso de destilacion o entrenamiento sobre datos derivados, pero no se detalla la metodologia.

## Capacidades

- Generacion de texto conversacional y de proposito general.
- Razonamiento con modo "thinking" explicito, con un presupuesto de hasta 28K tokens en las evaluaciones reportadas.
- Razonamiento de nivel avanzado en dominios cientificos y de conocimiento general (evaluado en GPQA Diamond y MMLU-Pro).
- Soporte de contexto muy largo: hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Formato de chat con plantilla Jinja (`chat_template.jinja`) que incluye soporte para system prompts, herramientas y modo thinking.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.
- No se documenta en la informacion disponible soporte explicito de vision, audio, tool calling o function calling, aunque la plantilla de chat menciona herramientas.

## Casos de uso

- Analisis de documentos extensos: el modelo puede procesar contratos, informes tecnicos o expedientes de hasta 262.144 tokens en una sola pasada, lo que permite resumir o extraer informacion sin fragmentacion ni perdida de contexto entre secciones.
- Razonamiento cientifico asistido: con un rendimiento declarado de 72.7 en GPQA Diamond en modo thinking, es adecuado para tareas de pregunta-respuesta de nivel posgrado en fisica, quimica y biologia, asi como para apoyo a investigadores en revision de hipotesis.
- Asistentes conversacionales de dominio tecnico: la ventana de contexto larga y el formato de chat con system prompts permiten mantener conversaciones multi-turno con memoria extensa de la sesion y del material de referencia aportado.
- Generacion de codigo y explicaciones tecnicas: aunque no se reportan benchmarks de codigo, el modelo puede emplearse para generar y explicar fragmentos de codigo dentro de flujos de asistencia al desarrollador, siempre que se valide la salida.
- Procesamiento por lotes de corpus largos: con ~3B parametros activos por token y pesos FP8, el coste de inferencia por token es bajo en comparacion con un modelo denso de 20B, lo que lo hace viable para clasificacion, extraccion y resumen de grandes volumenes de texto.
- Despliegue en infraestructura con memoria limitada: los 22 GB de pesos FP8 permiten ejecutar el modelo en una sola GPU de 24 GB o en configuraciones multi-GPU mas modestas que las requeridas por un denso de 20B en BF16.
- Investigacion sobre atencion hibrida y MoE: el codigo abierto en OpenArchX y la configuracion detallada permiten estudiar el comportamiento de la combinacion Gated DeltaNet + atencion completa en tareas de contexto largo.

## Benchmarks y rendimiento

| Benchmark | NGen-5-20B-A3B |
|---|---|
| GPQA Diamond (198 preguntas, pass@1, thinking) | 72.7 |
| MMLU-Pro (subconjunto de 300 preguntas, thinking) | 73.7 |

Las evaluaciones fueron realizadas por TNSA en modo thinking con un presupuesto de 28K tokens, temperatura 1.0, top-p 0.95, top-k 20 y penalizacion de presencia 1.5, en una sola ejecucion. Segun la model card, diferencias de aproximadamente 3 puntos estan dentro del ruido. Los resultados no estan verificados de forma independiente (`verified: false`). No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMLU completo) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 22 GB, por lo que se necesita al menos una GPU con 24 GB para cargar el modelo completo sin cuantizacion adicional. Los componentes en BF16 (routers, normas, embeddings, cabeza de salida) anaden una sobrecarga adicional.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB) o GPUs consumer de gama alta con 24 GB o mas (RTX 3090, RTX 4090). Para contexto completo de 262.144 tokens se requiere memoria adicional para la cache KV, por lo que se recomienda A100 80 GB o H100.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) con contexto reducido; el contexto maximo probablemente excede la memoria disponible en estas tarjetas.
- Opciones de despliegue: el modelo se distribuye con codigo para OpenArchX (`openarchx[cuda]`), que carga los pesos FP8 directamente. No se documenta en la informacion disponible soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables (por ejemplo, otros MoE de ~20B con ~3B activos como Qwen3-30B-A3B o similares) medidos en las mismas condiciones, por lo que no es posible establecer una comparativa cuantitativa fiable. A continuacion se comparan unicamente las caracteristicas estructurales conocidas de este modelo frente a la categoria general.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| NGen-5-20B-A3B | 20.5B | ~3B | 262.144 | tnsa-owml | safetensors (FP8) |
| Alternativas MoE de ~20-30B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Identidad del modelo: la propia model card advierte de que el modelo puede identificarse incorrectamente como Qwen, Kimi, GLM o DeepSeek, o atribuir su creacion a otros desarrolladores. Estas afirmaciones son erroneas y deben corregirse en produccion mediante system prompts.
- Idioma: el modelo esta entrenado principalmente para ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Alucinacion: no se documentan tasas de alucinacion; como en cualquier LLM, las salidas factuales requieren verificacion, especialmente en dominios cientificos.
- Licencia: la licencia tnsa-owml es una licencia propia de TNSA, no una licencia OSI estandar. Es imprescindible revisar los terminos en el enlace legal antes de cualquier uso comercial, ya que pueden existir restricciones no reflejadas en la informacion disponible.
- Material de terceros: el repositorio incluye componentes bajo Apache-2.0; deben respetarse los avisos en `NOTICE` y `LICENSE-APACHE-2.0`.
- Ecosistema: la libreria OpenArchX es menos extendida que transformers, vLLM o llama.cpp, lo que puede limitar la integracion con herramientas estandar y el soporte comunitario.
- Benchmarks no verificados: los resultados reportados son de una sola ejecucion, sin verificacion independiente, y con un subconjunto reducido de MMLU-Pro (300 preguntas), lo que limita su robustez estadistica.
- Madurez: el modelo tiene pocas descargas (94) y cero likes en el momento de la consulta, lo que sugiere una adopcion muy limitada y escasa validacion por parte de la comunidad.
- Soporte de tool calling: no esta confirmado en la documentacion; debe validarse antes de disenar agentes que dependan de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TNSA/NGen-5-20B-A3B
- Repositorio de OpenArchX: https://github.com/tnsaai/OpenArchX
- Licencia open-weight de TNSA: https://tnsaai.com/legal/open-weight-model-licenses
- Resultados de benchmarks (referenciado en la model card): `benchmark_results.json` en el repositorio del modelo
