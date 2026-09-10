# Terom/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) descrito en su model card como un backbone de 552.000 millones de parametros con soporte nativo de imagenes y texto, y una ventana de contexto de hasta un millon de tokens. Su propuesta central no es el aumento de capacidad bruta, sino la compresion agresiva de la cache KV: segun la model card, reduce el consumo de cache KV global a 890 bytes por token, aproximadamente una cuarta parte del de DeepSeek-V4-Flash y unas 437 veces menos que DeepSeek-V1. Para cargas de trabajo con entradas muy largas (agentes, documentos extensos, pipelines multimodales) ese ahorro de memoria es el factor que decide si el modelo es desplegable o no.

La arquitectura se denomina Causal Encoder-Decoder (CED): un transformer de 40 capas dividido en 20 capas de encoder causal seguidas de 20 capas de decoder. La cache KV global del decoder se proyecta desde los estados ocultos finales del encoder, en lugar de derivarse de las hidden states de cada capa del decoder. Esto permite activar solo 8.000 millones de parametros por token durante la fase de prefill y 16.000 millones durante la decodificacion. El modelo incorpora ademas Compressed Sparse Attention 2 (CSA2), FP4 en la cache KV principal, memoria condicional Engram de 196.000 millones de parametros y decodificacion especulativa DSpark.

El repositorio de HuggingFace esta publicado bajo el identificador `Terom/DeepSeek-V4.1-Flash`, con licencia MIT, formato safetensors y un tamano de repositorio de 510,3 GB. El recuento real de parametros en los ficheros safetensors es de 484.619.644.114, cifra que no coincide con los 552.000 millones declarados en la model card; conviene tener presente esa discrepancia. El modelo esta fechado en septiembre de 2026 y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED), transformer MoE de 40 capas (20 encoder causal + 20 decoder), con CSA2 (Compressed Sparse Attention 2) |
| Parametros totales | 484.619.644.114 segun safetensors; la model card declara 552B de backbone (incluye 196B de memoria Engram) |
| Parametros activos | 8B por token en prefill; 16B por token en decode |
| Longitud de contexto | Hasta 1.000.000 tokens (entrenamiento con atencion dispersa a 64K, extendido a 1M) |
| Tipos de cuantizacion | FP8 (tags `8-bit`, `fp8`); cache KV principal en FP4 (formato E2M1, una escala E4M3 por cada 16 canales). No se documentan variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 510,3 GB |
| Pipeline declarado | image-text-to-text |
| Expertos por capa MoE | 384 expertos enrutados + 1 experto compartido; 6 expertos enrutados activados por token |
| Cache KV global | 890 bytes por token (FP4 + CSA2) |

## Arquitectura y entrenamiento

El nucleo del modelo es la combinacion de tres mecanismos. Primero, la arquitectura CED, que desacopla la cache KV del decoder de las hidden states de cada capa: el decoder proyecta su cache global desde los estados finales del encoder causal. Segundo, Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir la KV principal y la K del indexador entre capas, y reutilizar los indices Top-K de atencion dispersa. En el decoder, un indexador disperso jerarquico restringe las capas de indexacion posteriores a un conjunto de candidatos construido por la primera capa en modo Full, de modo que el coste de indexacion profunda queda acotado independientemente de la longitud de contexto. Tercero, SWA Bounded Replay, que reconstruye los estados KV de ventana deslizante que faltan replicando solo los ultimos `n_win` tokens, evitando persistir esa cache en SSD y reduciendo la huella persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash.

A esto se suman Single-Pass mHC (mezcla del flujo residual con un kernel Mega-mHC), memoria condicional Engram de 196.000 millones de parametros con acceso disperso por lookup basado en token, y decodificacion especulativa DSpark (generacion de borradores semiautoregresiva con verificacion programada por confianza). En la parte multimodal, el codificador visual DeepSeek-ViT se entreno desde cero con 2D-RoPE y downsampling 3x3 pixel-unshuffle, y un proyector MLP de dos capas convierte las imagenes en embeddings visuales que se procesan conjuntamente con los embeddings de texto desde el inicio del preentrenamiento.

El preentrenamiento se realizo desde cero sobre un corpus multimodal de 45 billones de tokens, con la atencion dispersa entrenada a 64K de longitud de secuencia y el contexto extendido hasta 1M a partir de los 34 billones de tokens. El postentrenamiento sigue el paradigma estandar SFT, RL y destilacion on-policy (OPD) sin modificaciones algoritmicas: los cambios sustantivos estan en el pipeline de datos, con sintesis automatica a gran escala de tareas y entornos de agente y escalado progresivo de datos, tareas y rollouts. El modelo expone un ajuste de esfuerzo de razonamiento continuo (entero de 1 a 100) que intercambia coste de inferencia por precision.

## Capacidades

- Generacion de texto autoregresiva sobre entradas de hasta 1 millon de tokens.
- Procesamiento nativo de imagenes: el pipeline declarado es `image-text-to-text` y el codificador DeepSeek-ViT se entreno desde cero e integrado desde el preentrenamiento.
- Razonamiento con esfuerzo ajustable: parametro entero de 1 a 100 que permite al usuario fijar el coste de inferencia.
- Cargas de trabajo de agente: la model card describe sintesis a gran escala de tareas y entornos de agente durante el postentrenamiento, y presenta graficas de rendimiento en benchmarks agente.
- Razonamiento multi-paso, implicito en el entrenamiento con RL y destilacion on-policy.
- Decodificacion especulativa integrada (DSpark) con verificacion programada por confianza.
- Atencion dispersa con indexacion jerarquica, que acota el coste del indexador con independencia de la longitud de contexto.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir arboles de codigo extensos y documentacion asociada en una sola pasada, sin necesidad de recuperacion por fragmentos ni de pipelines RAG complejos.
- Agentes autonomos de larga duracion: la sintesis de entornos de agente durante el postentrenamiento y el ajuste de esfuerzo de razonamiento permiten desplegarlo en bucles de planificacion y ejecucion de varios pasos donde el coste por paso debe ser controlable.
- Procesamiento de documentacion tecnica y legal: la ventana de 1M tokens permite analizar contratos, normativa o manuales completos preservando referencias cruzadas entre secciones que se perderian con chunking agresivo.
- Atencion al cliente automatizada de nivel avanzado: conversaciones multi-turno muy largas mantienen coherencia gracias a la ventana extensa y a la cache KV comprimida, que reduce la memoria necesaria por sesion concurrente.
- Analisis de imagenes con contexto textual largo: al ser multimodal nativo, admite casos como revision de capturas de interfaz junto a especificaciones funcionales, o inspeccion de graficos junto a informes extensos.
- Investigacion sobre compresion de cache KV: el modelo es un caso de estudio util para medir el impacto real de CSA2, FP4 en KV y SWA Bounded Replay sobre latencia y memoria en servidores de inferencia.
- Evaluacion comparativa de atencion dispersa: permite contrastar modos Full, Reindex y Reuse en terminos de calidad y coste, algo relevante para quien disena arquitecturas de contexto largo.
- Generacion de codigo en produccion: no hay confirmacion de soporte de tool calling en la informacion disponible, por lo que su integracion en pipelines de CI/CD requeriria validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion "Evaluation Results" que comienza con la afirmacion de que todos los modelos base se evaluan en un marco interno bajo los mismos ajustes y que las puntuaciones con menos de 0,3 de diferencia se consideran equivalentes, pero el contenido extraido se interrumpe en ese punto y no incluye ninguna cifra concreta de MMLU, HumanEval, GSM8K ni de benchmarks agente.

Los unicos datos cuantitativos de rendimiento disponibles son los relativos a la cache KV, presentados en la Figura 1(b) de la model card:

| Metrica | Valor declarado |
|---|---|
| Cache KV global por token | 890 bytes |
| Reduccion frente a DeepSeek-V4-Flash | ~4x (implica ~3.560 bytes/token, valor derivado) |
| Reduccion frente a DeepSeek-V1 | ~437x (implica ~389.000 bytes/token, valor derivado) |
| Huella de cache KV persistente frente a DeepSeek-V4-Flash | ~1/8 (SWA Bounded Replay) |

Los valores marcados como derivados proceden de aplicar los factores de reduccion indicados en la model card; no estan publicados de forma explicita.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parametros (484,6B) y del tamano del repositorio (510,3 GB). No hay cifras oficiales de despliegue en la informacion disponible.

- Peso de los parametros en FP8: aproximadamente 485 GB, coherente con los 510,3 GB del repositorio (que incluye ficheros auxiliares y posiblemente el codificador visual).
- Peso en FP4 o cuantizacion de 4 bits: aproximadamente 242 GB teoricos, aunque no se documenta ninguna variante cuantizada oficial.
- Peso en FP16/BF16: aproximadamente 970 GB, inviable en la practica sin paralelismo masivo.
- Cabria esperar que una configuracion de 8x H100 de 80 GB (640 GB agregados) sea suficiente para servir los pesos en FP8 con paralelismo tensorial; no hay confirmacion oficial de esta configuracion.
- GPU consumer: no cabe. Ni siquiera en 4 bits (unos 242 GB) es viable en una unica RTX 4090 (24 GB), ni en configuraciones de 2 o 4 GPU consumer. El coste de memoria de los pesos domina sobre el hecho de que solo se activen 8B parametros en prefill, ya que todos los expertos deben residir en memoria para el enrutamiento.
- El ahorro de cache KV si es relevante a escala: 890 bytes por token implican unos 0,89 GB por millon de tokens y sesion, frente a los aproximadamente 3,56 GB por millon de tokens que implicaria la generacion anterior.
- Opciones de despliegue: la libreria declarada es `transformers` con pesos en safetensors. No hay confirmacion en la informacion disponible sobre soporte en vLLM, SGLang, TGI, llama.cpp, Ollama u otros motores, ni sobre existencia de pesos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 484,6B en safetensors (552B declarados) | 1M tokens | 890 bytes | MIT | Repo de terceros, 0 descargas |
| DeepSeek-V4-Flash | no disponible | no disponible | ~3.560 bytes (derivado, factor 4x) | no disponible | Referenciado en la model card |
| DeepSeek-V1 | no disponible | no disponible | ~389.000 bytes (derivado, factor 437x) | no disponible | Referenciado en la model card |

No se dispone de datos de parametros, contexto, licencia ni rendimiento de DeepSeek-V4-Flash y DeepSeek-V1 en la informacion proporcionada; solo se conocen los factores de reduccion de cache KV respecto a DeepSeek-V4.1-Flash. Tampoco hay informacion sobre otras alternativas multimodales MoE de contexto largo con las que comparar directamente. Por tanto, la comparativa queda limitada a la metrica de cache KV.

## Limitaciones y advertencias

- Procedencia del repositorio: el identificador es `Terom/DeepSeek-V4.1-Flash`, un usuario distinto de la organizacion oficial `deepseek-ai`. La model card incluye enlaces a la web, el chat y la organizacion oficiales de DeepSeek AI, y el informe tecnico enlazado apunta a `huggingface.co/deepseek-ai/...`, no a este repositorio. Conviene verificar la autenticidad y la integridad de los pesos antes de cualquier uso en produccion.
- El repositorio registra 0 descargas y 0 valoraciones, lo que limita la validacion por parte de la comunidad.
- Discrepancia en el recuento de parametros: 484.619.644.114 en safetensors frente a los 552B declarados como backbone. Parte de la diferencia podria explicarse por los 196B de la memoria Engram (acceso disperso por lookup), pero no se detalla.
- Ausencia total de resultados de benchmarks verificables en la informacion disponible: no se puede confirmar el rendimiento en razonamiento, codigo, matematicas ni tareas agente.
- Idiomas soportados no declarados. Aunque el modelo se describe como multimodal, no hay lista de idiomas ni evaluacion multilingue publicada.
- Riesgo de alucinacion: inherente a los modelos generativos de esta clase. No se publican tasas de alucinacion ni evaluaciones de veracidad.
- Soporte de tool calling y function calling no confirmado en la informacion disponible, lo que condiciona su uso en flujos de agente que dependan de llamadas a herramientas.
- Restricciones de uso comercial: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion, sin garantias. No obstante, dado que el repositorio no pertenece a la organizacion oficial, la aplicabilidad de la licencia sobre estos pesos concretos deberia confirmarse con el publicador.
- Coste de despliegue elevado: 510,3 GB de repositorio y ~485 GB de pesos en FP8 requieren un servidor multi-GPU. No es desplegable en hardware de consumo.
- Conexion de red y uso de datos: no disponible informacion sobre privacidad, retencion de datos ni condiciones de servicio para la version alojada en chat.
- Fecha de publicacion (10 de septiembre de 2026) y ausencia de documentacion adicional verificable: cualquier decision de adopcion deberia apoyarse en una evaluacion propia sobre el dominio objetivo.
- Las busquedas web realizadas no han devuelto ningun resultado relevante sobre este modelo: los resultados obtenidos son listados de eventos en Egipto y no guardan relacion con DeepSeek-V4.1-Flash.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Terom/DeepSeek-V4.1-Flash
- Informe tecnico enlazado en la model card (apunta a la organizacion oficial): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Web oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion de DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Perfil de X/Twitter de DeepSeek AI: https://twitter.com/deepseek_ai
- Repositorio de recursos graficos de DeepSeek-V2 en GitHub (origen del logotipo referenciado): https://github.com/deepseek-ai/DeepSeek-V2

Nota: no se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs, repositorios o demos) asociados a este modelo.
