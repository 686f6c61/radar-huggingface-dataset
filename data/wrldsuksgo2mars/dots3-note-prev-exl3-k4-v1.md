# wrldsuksgo2mars/dots3-note-prev-exl3-k4-v1

## Resumen

dots3-note-prev-exl3-k4-v1 es un checkpoint cuantizado publicado por el usuario wrldsuksgo2mars sobre el modelo base dots-studio/dots3-note-prev. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetado de pesos: conserva los tensores no enrutados del checkpoint FP8 de Dots Studio y sustituye cada peso de experto enrutado del modelo de lenguaje (capas 1-45) por una cuantizacion EXL3 MCG K4 del tensor BF16 correspondiente. El resultado es un artefacto hibrido EXL3/FP8 pensado para servirse con vLLM.

El modelo subyacente, dots3-note-prev, es un Mixture-of-Experts multimodal de la familia dots3, con 280.000 millones de parametros totales y 16.000 millones activos, ventana de contexto de hasta 512K tokens y capacidad de entender texto, imagenes, video y audio produciendo salida de texto. Es el primer modelo de pesos abiertos de la familia y esta liberado bajo licencia Apache-2.0.

La relevancia de esta ficha concreta es practica: reduce el coste de almacenamiento y de ancho de banda de servido al comprimir los expertos enrutados a 4 bits, manteniendo el resto en FP8. El repositorio ocupa 163,5 GB y requiere la integracion especifica de Dots3 en vLLM, ya que los cargadores genericos solo-FP8 no interpretan correctamente sus expertos enrutados. El numero de descargas y de likes es 0 en el momento de la consulta, por lo que es un artefacto reciente y poco adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal; transformer con expertos enrutados y compartidos |
| Parametros totales | 84.830.257.824 segun metadatos de safetensors del repositorio cuantizado; el modelo base dots3-note-prev declara 280B totales |
| Parametros activos | 16B (dato del modelo base) |
| Longitud de contexto | hasta 512K tokens (dato del modelo base) |
| Tipos de cuantizacion | EXL3 MCG K4 (4 bits) en todos los expertos enrutados (256 expertos, proyecciones gate, up y down, capas 1-45); FP8 en el resto; etiquetado como 4-bit |
| Idiomas soportados | no disponible (el modelo base declara soporte multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (hibrido EXL3 K4 + FP8) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un Mixture-of-Experts multimodal con 280B parametros totales y 16B activos, capaz de procesar texto, imagenes, video y audio y de generar texto. Incluye expertos enrutados y expertos compartidos, ademas de componentes de vision y atencion. El modelo original esta orientado a conversacion general, tareas complejas, seguimiento de instrucciones, razonamiento, generacion de codigo e interaccion multilingue, con soporte de contexto largo de hasta 512K tokens.

Este checkpoint concreto no entrena nada: aplica una cuantizacion post-entrenamiento. El pipeline descrito en la model card emplea GPTQModel con 1.437 prompts de calibracion disjuntos respecto de las fuentes y dos NVIDIA DGX Spark. Los tensores no enrutados (expertos de vision, expertos compartidos, atencion, embeddings, cabeza de vocabulario y componentes multimodales) se heredan del checkpoint FP8 dots3-note-prev-fp8 en la revision 7c14222e22423d6df6848eb0d1c5c3a88a00311a, mientras que los expertos enrutados del modelo de lenguaje se sustituyen por la cuantizacion EXL3 MCG K4 del tensor BF16 de dots3-note-prev en la revision 1e1e7b0cd37a3a48a6c8d7fa55d5f9d14377006b. El formato K4 es uniforme en los 256 expertos y en las tres proyecciones. El repositorio de receta y auditoria (tpurtell/dots-note-sm12x-2x) registra revisiones de origen, seleccion de calibracion, comprobaciones de formato uniforme y resultados medidos de servido. No se detalla en la informacion disponible si hubo RLHF, DPO u otra fase de alineacion en el modelo base.

## Capacidades

- Generacion de texto y conversacion general de proposito multiple.
- Razonamiento y resolucion de problemas en tareas cerradas y verificables (segun la descripcion del modelo base).
- Generacion de codigo.
- Comprension multimodal de entrada: texto, imagenes, video y audio (el modelo base); la salida es siempre texto.
- Procesamiento de contexto largo, hasta 512K tokens.
- Interaccion multilingue (declarada en el modelo base).
- Capacidad de seguir instrucciones y encadenar razonamiento en varios pasos, segun la orientacion del modelo base hacia flujos de agentes.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Servido de inferencia de alto rendimiento con vLLM: este checkpoint esta pensado para desplegarse mediante la integracion de Dots3 en vLLM, aprovechando la compresion a 4 bits de los expertos enrutados para reducir el peso en disco y en memoria respecto al BF16 original.
- Documentos y analisis de contexto largo: con hasta 512K tokens de contexto, el modelo puede procesar libros tecnicos completos, expedientes o bases de codigo extensas en una sola pasada sin trocear el contenido.
- Asistentes multimodales: al aceptar imagenes, video y audio como entrada, es adecuado para aplicaciones que resumen reuniones a partir del audio, describen escenas de video o extraen informacion de capturas y diagramas.
- Generacion y revision de codigo: el modelo base declara enfoque en generacion de codigo; puede integrarse en asistentes de desarrollo o pipelines de revision automatica de cambios.
- Razonamiento sobre tareas verificables: util para problemas de matematicas, logica o analisis estructurado donde la respuesta puede validarse de forma automatica.
- Atencion al cliente multilingue: la orientacion multilingue del modelo base y su ventana de contexto permiten mantener conversaciones multi-turno extensas conservando el historial completo.
- Flujos de agentes multi-paso: la descripcion del modelo base lo situa como apto para flujos de agentes y razonamiento encadenado, aunque el soporte concreto de tool calling no esta confirmado en la informacion disponible.
- Investigacion sobre cuantizacion: el propio artefacto es un caso de estudio de cuantizacion hibrida EXL3/FP8 con prompts de calibracion disjuntos y herramientas de auditoria, util para reproducir y comparar tecnicas de compresion de MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 163,5 GB en disco; para inferencia hay que sumar la cache KV, que con contexto muy largo (hasta 512K tokens) puede crecer de forma notable. Como referencia, un despliegue con contexto moderado parte de aproximadamente 165-180 GB de memoria de pesos, y bastante mas si se explota el contexto maximo.
- GPU recomendadas: configuraciones multi-GPU de clase centro de datos. Dos NVIDIA H100 de 80 GB quedan justas para los pesos; tres o cuatro H100 o A100 de 80 GB dan margen para cache KV y lotes concurrentes. El propio proceso de cuantizacion empleo dos NVIDIA DGX Spark.
- GPU de consumo: no cabe en una GPU de consumo individual (RTX 4090 de 24 GB, RTX 3090 de 24 GB, etc.). El tamano de pesos supera con creces la VRAM de cualquier tarjeta consumer actual.
- Opciones de despliegue: vLLM es la via soportada, pero requiere la integracion especifica de Dots3 incluida en el repositorio de receta; los cargadores genericos solo-FP8 no entienden los expertos enrutados en formato EXL3 K4. Otras alternativas (llama.cpp, Ollama, TGI) no estan confirmadas para este formato hibrido y deben considerarse no disponibles.
- Latencia y throughput: no disponible. La model card menciona "resultados medidos de servido" registrados en el repositorio de auditoria, pero no se incluyen cifras en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dots3-note-prev-exl3-k4-v1 (este) | 84.830.257.824 segun safetensors del repo; base de 280B totales / 16B activos | 512K tokens (heredado del base) | EXL3 MCG K4 en expertos enrutados + FP8 en el resto | apache-2.0 | HuggingFace, requiere vLLM con integracion Dots3 |
| dots-studio/dots3-note-prev-fp8 | 280B totales / 16B activos (modelo base) | 512K tokens | FP8 | apache-2.0 | HuggingFace |
| dots-studio/dots3-note-prev (BF16) | 280B totales / 16B activos (modelo base) | 512K tokens | BF16 sin cuantizar | apache-2.0 | HuggingFace |

Nota: no se dispone de informacion sobre otros modelos comparables de la misma categoria en la busqueda realizada.

## Limitaciones y advertencias

- El recuento de parametros reportado por los metadatos de safetensors del repositorio (84,8B) no coincide con los 280B totales declarados por el modelo base; conviene verificar la estructura real del checkpoint antes de dimensionar el despliegue.
- Requiere la integracion especifica de Dots3 en vLLM: los cargadores genericos solo-FP8 no interpretan los expertos enrutados en EXL3 K4.
- La cuantizacion a 4 bits de los expertos enrutados puede introducir degradacion de calidad respecto al BF16 y al FP8; la informacion disponible no incluye evaluaciones comparativas que cuantifiquen esa perdida.
- La calibracion se realizo con 1.437 prompts; la cobertura de dominios de esa calibracion puede no abarcar casos de uso muy especializados.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: soporte comunitario y validacion independiente practicamente nulos.
- No hay benchmarks publicados en la informacion disponible, por lo que el rendimiento real frente a alternativas no esta cuantificado.
- El soporte de tool calling, modo de pensamiento y otros detalles funcionales del modelo base no se confirma en la informacion disponible.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo habitual de los modelos generativos, mayor en tareas abiertas.
- Restricciones de licencia: tanto este checkpoint como los modelos base se liberan bajo Apache-2.0, lo que permite uso comercial, pero conviene revisar los terminos de los model cards originales de Dots Studio.
- Fecha de publicacion del repositorio indicada como 2026-09-25; verificar la vigencia de las revisiones referenciadas.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/wrldsuksgo2mars/dots3-note-prev-exl3-k4-v1
- Modelo base FP8: https://huggingface.co/dots-studio/dots3-note-prev-fp8
- Modelo base: https://huggingface.co/dots-studio/dots3-note-prev
- Pagina del modelo en Dots Studio: https://studio.dots.ai/dots/dots3-en.html
- Repositorio GitHub del modelo base: https://github.com/studio-dots-ai/dots3-note-prev
- Repositorio de receta y auditoria: https://github.com/tpurtell/dots-note-sm12x-2x
- Ficha en ZenMux: https://zenmux.ai/dots-studio/dots3-note-prev
- Ficha en OpenRouter: https://openrouter.ai/dots-studio/dots-3-note-preview:free
