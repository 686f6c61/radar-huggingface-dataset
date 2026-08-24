# xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.6-GGUF

## Resumen

El modelo `xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.6-GGUF` es una versión cuantizada en formato GGUF del modelo base `xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW`, que a su vez deriva de `google/gemma-4-26B-A4B-it` con un ajuste específico para chino tradicional (zh-TW) realizado por TAIDE. El autor, xCloudinfo (云碩科技), ha aplicado una técnica de **abliteration** con intensidad 0.6, que elimina parcialmente la dirección de rechazo del modelo mediante ortogonalización de pesos, reduciendo la tendencia a negarse a responder. El resultado es un modelo con 25.233.142.046 parámetros totales, arquitectura Mixture-of-Experts (MoE) con 128 expertos, y capacidades multimodales gracias a un proyector de visión (mmproj) incluido.

Este modelo está pensado para entornos donde se requiere una menor censura en chino tradicional, como investigación de seguridad, red teaming o generación de contenido creativo, siempre dentro de los límites legales y con responsabilidad del usuario. Al estar disponible en seis niveles de cuantización GGUF (de Q8_0 a IQ2_M) con matriz de importancia (imatrix), puede desplegarse en una amplia gama de hardware, desde GPUs de consumo hasta servidores profesionales, usando llama.cpp u otras herramientas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con 128 expertos, basada en Gemma 4 |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4B, sin confirmar) |
| Longitud de contexto | no disponible (en el ejemplo de uso se configura 4096, pero el maximo no se especifica) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ2_M (todas GGUF con imatrix para las versiones IQ) |
| Idiomas soportados | Chino tradicional (zh-TW) principalmente; el modelo base Gemma 4 es multilingue, pero no se confirma en esta version |
| Licencia | Apache-2.0 con restricciones adicionales (Gemma 4 License y terminos de TAIDE) |
| Formato de pesos | GGUF (incluye mmproj en GGUF para vision) |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 de 26B parametros con arquitectura MoE, donde cada token activa un subconjunto de los 128 expertos (el sufijo A4B indica aproximadamente 4B parametros activos, aunque no se ha confirmado oficialmente). La version TAIDE ha sido adaptada para chino tradicional, y la abliteration se aplico sobre el modelo ya ajustado, siguiendo el metodo de Arditi et al. (2024): se ortogonalizan los pesos que escriben en el flujo residual (token embeddings, attention o_proj, down_proj densos y los 128 down_proj de los expertos MoE) para eliminar la direccion de rechazo, con un coeficiente de intensidad de 0.6. No se realizo reentrenamiento; solo se modificaron los pesos del modelo de lenguaje, dejando intacta la torre de vision. El proyector multimodal (mmproj) se mantiene identico al original, por lo que es totalmente compatible.

El entrenamiento original de Gemma 4 (segun el informe tecnico disponible) incluye arquitecturas densas y MoE de 2.3B a 31B parametros, con mejoras en codificadores de vision y audio, y un enfoque unificado sin encoder. No se dispone de detalles especificos sobre el dataset de entrenamiento de esta variante TAIDE ni sobre el proceso de ajuste fino.

## Capacidades

- Generacion de texto y conversacion multi-turno en chino tradicional (zh-TW), con estilo natural y fluido.
- Comprension multimodal: puede procesar imagenes junto con texto gracias al proyector de vision (mmproj) incluido en el paquete GGUF.
- Razonamiento y resolucion de problemas: hereda las capacidades de razonamiento del modelo base Gemma 4, adecuado para tareas logicas y analiticas.
- Generacion de codigo: el modelo base Gemma 4 esta optimizado para tareas de programacion, aunque no se confirma si esta variante mantiene ese rendimiento.
- Menor tendencia a rechazar peticiones: la abliteration con intensidad 0.6 reduce significativamente las respuestas de negativa, permitiendo abordar temas que el modelo original podria evitar.
- Soporte para agentes y flujos de trabajo multi-paso: el modelo base esta disenado para agentes, aunque no se especifica si esta version conserva el tool calling nativo.

## Casos de uso

- Atencion al cliente en chino tradicional: el modelo puede gestionar conversaciones de soporte tecnico o comercial con contexto largo (si se configura adecuadamente), respondiendo de forma natural y sin rechazos innecesarios, lo que mejora la experiencia del usuario final.
- Analisis de documentos e imagenes: gracias al mmproj, puede extraer informacion de capturas de pantalla, documentos escaneados o diagramas, y responder preguntas sobre ellos en chino tradicional, util para oficinas y despachos en Taiwan.
- Red teaming y evaluacion de seguridad: al tener una menor censura, es adecuado para probar sistemas de moderacion, identificar vulnerabilidades en pipelines de IA generativa y evaluar respuestas ante prompts adversarios, siempre en entornos controlados y autorizados.
- Generacion de contenido creativo: redaccion de guiones, cuentos, poesia o articulos en chino tradicional sin las restricciones tipicas de los modelos alineados, ideal para estudios de creacion o medios de comunicacion.
- Asistente de programacion local: con cuantizacion Q4_K_M o IQ4_XS, puede ejecutarse en una GPU de consumo para ayudar con tareas de codigo, depuracion o explicacion de fragmentos, manteniendo la privacidad de los datos al ser local.
- Investigacion academica en procesamiento de lenguaje natural: permite estudiar el efecto de la abliteration en modelos MoE multilingues, comparando respuestas antes y despues de la intervencion, con fines cientificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas para esta variante especifica. El modelo base Gemma 4 reporta rendimiento frontier en su tamano, pero esta version abliterada y cuantizada no incluye mediciones propias.

## Requisitos de hardware

- Los archivos GGUF varian entre 10.4 GB (IQ2_M) y 26.9 GB (Q8_0), mas 1.2 GB del proyector de vision. Se recomienda una GPU con al menos 16 GB de VRAM para las cuantizaciones mas bajas (IQ2_M, IQ4_XS) y 24 GB o mas para Q8_0 o Q6_K.
- GPUs recomendadas: RTX 4090 (24 GB) para Q8_0/Q6_K, RTX 4080 o RTX 3090 (24 GB) para Q5_K_M, y RTX 4070 o RTX 3080 (12-16 GB) para IQ4_XS o IQ2_M. Para despliegues profesionales, A100 o H100 con 40-80 GB permiten ejecutar la version Q8_0 con margen.
- En GPUs de consumo con 8 GB de VRAM no es viable, salvo que se use una cuantizacion extrema no incluida en el paquete.
- Opciones de despliegue: llama.cpp (incluido en el ejemplo de uso), llama-server, Ollama (si se importa el GGUF), o cualquier runtime compatible con GGUF como LM Studio o text-generation-webui.
- Latencia y throughput: no se han publicado mediciones. Como referencia, un MoE de 26B con ~4B activos en Q4_K_M en una RTX 4090 puede alcanzar decenas de tokens por segundo, pero depende del hardware y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-TAIDE-zhTW (original) | 25.2B | no disponible | Apache-2.0 + TAIDE | safetensors | Sin abliteration, con alineacion estandar |
| Gemma-4-26B-A4B-abliterated-s0.6 (este) | 25.2B | no disponible | Apache-2.0 + TAIDE | GGUF | Abliteration 0.6, menos rechazos |
| Qwen2.5-32B (referencia) | 32B | 128k | Apache-2.0 | safetensors/GGUF | Multilingue, sin abliteration, contexto largo |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- La abliteration con intensidad 0.6 reduce la seguridad del modelo: puede generar contenido inapropiado, ofensivo o potencialmente danino si no se implementan salvaguardas externas. El autor advierte explicitamente que el usuario debe anadir protecciones y revision de salidas.
- El modelo esta orientado principalmente a chino tradicional; su rendimiento en otros idiomas no esta garantizado y puede degradarse significativamente.
- No se especifica la longitud de contexto maxima; el ejemplo de uso configura 4096 tokens, pero el modelo base podria soportar mas. Se recomienda probar con valores superiores con cautela.
- La licencia Apache-2.0 se complementa con los terminos de Gemma 4 License y TAIDE, que prohiben usos militares o ilegales y exigen cumplir la legislacion de Taiwan y la EU AI Act. El uso comercial requiere verificar estas restricciones adicionales.
- Al ser una cuantizacion GGUF, puede haber una ligera perdida de calidad respecto al modelo en safetensors, especialmente en las versiones IQ2_M e IQ4_XS.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta variante; se asume que hereda los sesgos del modelo base Gemma 4 y del ajuste TAIDE.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-abliterated-s0.6-GGUF
- Modelo base (safetensors): https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW
- Version GGUF sin abliteration: https://huggingface.co/xCloudinfo/Gemma-4-26B-A4B-TAIDE-zhTW-GGUF
- Informe tecnico de Gemma 4 (arXiv): https://arxiv.org/html/2607.02770v1
- Pagina oficial de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Entrada de Gemma 4 26B en Ollama: https://ollama.com/library/gemma4:26b
