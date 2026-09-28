# wang-yingjun/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de mezcla de expertos (MoE) distribuido en el repositorio de HuggingFace `wang-yingjun/DeepSeek-V4.1-Flash`. Segun la model card, se trata de un modelo de 552.000 millones de parametros en el backbone, con procesamiento nativo de imagenes y texto, generacion de texto autorregresiva y una ventana de contexto de hasta un millon de tokens. El repositorio declara 763.205.315.794 parametros reales en safetensors, cifra coherente con los 552B del backbone mas los 196B de la memoria condicional Engram y el codificador de vision.

Su propuesta tecnica central es la compresion agresiva de la cache KV: la arquitectura Causal Encoder-Decoder (CED) proyecta la cache KV global del decodificador desde los estados ocultos del encoder, con lo que solo se activan unos 8B de parametros por token en prefill y 16B en decode. Combinado con Compressed Sparse Attention 2 (CSA2) y cache KV principal en FP4, el modelo reduce el coste de memoria de la cache a unos 890 bytes por token, aproximadamente una cuarta parte de DeepSeek-V4-Flash y 437 veces menos que DeepSeek-V1, segun la propia model card.

Es relevante porque ataca el cuello de botella economico de las cargas de trabajo con mucho input (agentes, analisis de repositorios, documentos extensos) sin renunciar a una ventana de 1M de tokens. Conviene senalar que el repositorio pertenece a un usuario individual, no a la organizacion oficial `deepseek-ai`, y que no se han publicado resultados numericos de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con arquitectura Causal Encoder-Decoder (CED): 40 capas, 20 de encoder causal y 20 de decoder, con capas MoE dispersas |
| Parametros totales | 763.205.315.794 segun safetensors; la model card declara 552B en el backbone, 196B en memoria condicional Engram y el resto en el codificador de vision y embeddings |
| Parametros activos | ~8B por token en prefill y ~16B por token en decode |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | Pesos publicados en 8-bit / FP8 (tags `fp8` y `8-bit`); cache KV principal en FP4 (formato E2M1, una escala E4M3 por cada 16 canales). No se listan artefactos GGUF ni cuantizaciones alternativas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`, arquitectura `deepseek_v41`) |
| Modalidades de entrada y salida | Entrada de imagen y texto; salida de texto |
| Numero de expertos | 1 experto compartido y 384 expertos enrutados por capa MoE; 6 expertos enrutados activados por token |
| Tamano del repositorio | 510,3 GB |
| Fecha declarada de publicacion | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura CED separa el modelo en un encoder causal de 20 capas y un decoder de 20 capas. La innovacion clave es que la cache KV global del decoder se proyecta desde los estados ocultos finales del encoder en lugar de derivarse de las representaciones internas de cada capa del decoder, lo que reduce de forma notable el coste de prefill. Sobre esa base se anaden varios componentes: SWA Bounded Replay, que reconstruye los estados KV de ventana deslizante ausentes replicando solo los `n_win` tokens mas recientes, evitando persistir esa cache en SSD y dejando el footprint persistente en aproximadamente 1/8 del de DeepSeek-V4-Flash; Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atencion uno de tres modos estaticos (Full, Reindex o Reuse) para compartir KV principal e indices de atencion dispersa, con un indexador jerarquico en el decoder que limita el coste de indexado en capas profundas independientemente de la longitud de contexto; Single-Pass mHC, una revision del mezclado del flujo residual con un kernel Mega-mHC; memoria condicional Engram, con acceso disperso mediante lookup por token; y decodificacion especulativa DSpark, que combina generacion de borradores semiautorregresiva con verificacion programada por confianza. La atencion dispersa se entreno a 64K tokens y el contexto se extendio a 1M en el punto de 34T tokens.

El modelo se entreno desde cero sobre un corpus multimodal de 45 billones de tokens, con procesamiento conjunto de embeddings visuales y textuales desde el inicio del preentrenamiento. El codificador de vision (DeepSeek-ViT) se entreno tambien desde cero con RoPE 2D y downsampling pixel-unshuffle 3x3, y un proyector MLP de dos capas convierte las imagenes en embeddings visuales. El postentrenamiento sigue el paradigma SFT, luego RL y despues destilacion on-policy (OPD) sin modificaciones algoritmicas: los cambios sustanciales estan en el pipeline de datos, con sintesis automatica a gran escala de tareas y entornos de agente y escalado progresivo de datos, tareas y rollouts. El modelo expone ademas un ajuste de esfuerzo de razonamiento controlable de forma continua mediante un entero de 1 a 100 que intercambia coste de inferencia por precision.

## Capacidades

- Generacion de texto autorregresiva en conversaciones de multiples turnos y tareas de continuacion.
- Comprension de imagenes combinada con texto (pipeline `image-text-to-text`): descripcion, extraccion de informacion y respuesta a preguntas sobre contenido visual.
- Razonamiento con esfuerzo controlable: parametro entero de 1 a 100 que permite ajustar el coste de inferencia segun la exigencia de la tarea.
- Contexto muy largo de hasta 1.000.000 de tokens, con una cache KV global de unos 890 bytes por token.
- Capacidades orientadas a agentes: la model card describe la sintesis masiva de tareas y entornos de agente durante el postentrenamiento y evaluaciones sobre benchmarks agenticos.
- Decodificacion especulativa integrada (DSpark) para acelerar la generacion sin cambiar el resultado final.
- Procesamiento de cargas con mucho input a bajo coste relativo, gracias a los 8B de parametros activos en prefill.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada (la model card menciona tareas de agente, pero no documenta una interfaz de llamada a herramientas).
- Idiomas soportados: no disponible; no se detalla cobertura multilingue ni calidad por idioma.
- Capacidades de audio: no disponibles.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M de tokens de contexto, el modelo puede ingerir un arbol de ficheros extenso y responder preguntas de arquitectura, localizar dependencias o proponer refactorizaciones sin trocear el codigo en fragmentos que rompan el contexto global.
- Pipelines de agentes con muchas iteraciones: el coste de prefill de 8B de parametros activos por token y una cache de 890 bytes por token abaratan las cargas con mucho input, tipicas de agentes que releen el historial completo en cada paso.
- Tramitacion documental con componentes visuales: la combinacion del codificador DeepSeek-ViT y el modelo de lenguaje permite extraer datos de facturas, formularios escaneados o informes con tablas y graficos, generando una salida estructurada en texto.
- Atencion al cliente automatizada de largo recorrido: la ventana de 1M de tokens permite mantener el historial completo de una incidencia, incluidos correos previos y adjuntos, sin truncar el contexto ni perder trazabilidad.
- Revision de codigo en CI/CD: integrado como servicio de inferencia, puede analizar diffs junto con el contexto del proyecto y emitir comentarios de revision; requiere verificar previamente si el soporte de tool calling esta realmente implementado.
- Investigacion y analisis de literatura cientifica: el modelo puede procesar articulos con figuras, tablas y ecuaciones junto con material de referencia y resumir o contrastar hallazgos en una sola pasada de contexto largo.
- Razonamiento con presupuesto de coste ajustable: en producción se puede fijar un valor bajo del parametro de esfuerzo para consultas triviales y elevarlo para casos complejos, modulando la factura de computo por peticion.
- Asistentes multimodales de accesibilidad: descripcion de imagenes, lectura de documentos escaneados y respuesta en texto para usuarios con discapacidad visual, siempre que se valide la calidad del idioma de destino.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye un apartado "Evaluation Results" con una seccion "Base Model" que indica que todos los modelos base se evaluan en un marco interno bajo los mismos ajustes y que las puntuaciones con una diferencia inferior a 0,3 se consideran equivalentes, pero la tabla de resultados no aparece en el extracto disponible. La model card referencia ademas una figura con el rendimiento en benchmarks agenticos frente a modelos comparables, sin cifras en el texto proporcionado. No se deben extraer conclusiones de rendimiento sin esos datos.

## Requisitos de hardware

- VRAM estimada para los pesos (calculos propios a partir de los 763,2B de parametros, no datos oficiales): ~1,53 TB en BF16/FP16, ~763 GB en FP8/INT8 y ~382 GB en FP4.
- El repositorio ocupa 510,3 GB, lo que sugiere un almacenamiento de pesos en precision mixta; se desconoce la composicion exacta.
- Cache KV: a 890 bytes por token, una secuencia de 1M de tokens ocupa aproximadamente 890 MB (unos 0,85 GiB); una de 128K tokens, unos 114 MB. Es una cifra muy contenida frente a modelos con cache en BF16, pero sigue siendo un coste por secuencia concurrente.
- GPU recomendadas por configuracion: 16xH100 de 80 GB (1,28 TB) o 8xH200 de 141 GB (1,13 TB) para pesos en FP8; 8xH100 de 80 GB (640 GB) seria el minimo practico si se dispone de pesos en FP4 o de la mezcla de precision del repositorio.
- No cabe en GPU de consumo. Una RTX 4090 con 24 GB es insuficiente incluso para una sola copia de los pesos, y los 8B de parametros activos por token en prefill no implican que el modelo quepa en memoria: los 384 expertos enrutados por capa deben estar residentes o descargarse dinamicamente, lo que degrada la latencia.
- Opciones de despliegue: `transformers` es la libreria declarada; el tag `endpoints_compatible` apunta a compatibilidad con HuggingFace Inference Endpoints. vLLM, SGLang y TGI son candidatos razonables para servir el modelo, aunque no se documenta soporte especifico en la informacion disponible. No hay artefactos GGUF, por lo que llama.cpp y Ollama no son viables sin convertir los pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cache KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (este repositorio) | 763,2B (552B de backbone declarados) | ~8B prefill / ~16B decode | 1M tokens | 890 bytes | MIT (declarada por el subidor) | Repositorio de terceros, 0 descargas y 0 likes en el momento de la consulta |
| DeepSeek-V4-Flash | no disponible | no disponible | no disponible | ~4 veces mayor que la de V4.1-Flash, segun la model card | no disponible | Referenciado en la model card; repositorio oficial no verificado en la informacion disponible |
| DeepSeek-V1 | no disponible | no disponible | no disponible | ~437 veces mayor que la de V4.1-Flash, segun la model card | no disponible | Referenciado en la model card |

Solo se dispone de la comparacion cualitativa de tamano de cache KV que la propia model card ofrece frente a generaciones anteriores de DeepSeek. No hay datos de rendimiento, contexto ni licencia de los modelos comparados en la informacion proporcionada, ni se han identificado alternativas de la misma categoria con datos verificables.

## Limitaciones y advertencias

- El repositorio pertenece al usuario `wang-yingjun`, no a la organizacion oficial `deepseek-ai`. La model card enlaza recursos oficiales de DeepSeek, pero no hay confirmacion de que los pesos publicados correspondan al modelo descrito. Con 0 descargas y 0 likes, no existe validacion de la comunidad.
- Los resultados de evaluacion no estan disponibles en la informacion consultada, por lo que las afirmaciones de rendimiento de la model card no se pueden verificar.
- El campo de idiomas esta vacio en HuggingFace y la model card no detalla cobertura linguistica. No se puede garantizar calidad en castellano ni en ningun otro idioma concreto.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la ausencia de evaluaciones publicadas de fidelidad.
- La compresion de cache KV en FP4 (E2M1) y el uso de atencion dispersa con indexado jerarquico pueden degradar la recuperacion de informacion en contextos muy largos; no hay evaluaciones disponibles sobre tareas de aguja en pajar a 1M de tokens.
- El enrutado MoE con 384 expertos por capa y 6 activos por token es sensible a la calibracion y a la cuantizacion; los tags `8-bit` y `fp8` indican pesos de baja precision que pueden afectar a la calidad frente a una version en BF16.
- Requisitos de hardware extremos: 510,3 GB de repositorio y, segun estimacion, entre 382 GB y 1,53 TB de memoria para los pesos. No es desplegable en hardware de consumo.
- No hay artefactos GGUF ni cuantizaciones ligeras, lo que limita las opciones de despliegue a infraestructura de centro de datos.
- La licencia MIT se declara en el repositorio, pero al tratarse de una publicacion de terceros conviene verificar los derechos de uso comercial y el cumplimiento de las condiciones del modelo original, si existe.
- La fecha de creacion declarada en HuggingFace (28 de septiembre de 2026) es posterior a la fecha habitual de referencia de este analisis, dato a tener en cuenta al evaluar la vigencia del repositorio.
- No se documenta soporte de tool calling ni de function calling, algo relevante si se planea integrar el modelo en un orquestador de agentes.
- Los resultados de la busqueda web realizada no guardan relacion con este modelo y no aportan informacion adicional utilizable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wang-yingjun/DeepSeek-V4.1-Flash
- Informe tecnico referenciado en la model card (ruta declarada, no verificada): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Sitio oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Perfil de X/Twitter de DeepSeek: https://twitter.com/deepseek_ai
- Repositorio GitHub de DeepSeek (origen de los recursos graficos enlazados en la model card): https://github.com/deepseek-ai/DeepSeek-V2
