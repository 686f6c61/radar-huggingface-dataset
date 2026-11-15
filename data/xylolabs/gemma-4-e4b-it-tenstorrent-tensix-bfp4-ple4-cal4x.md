# Xylolabs/gemma-4-E4B-it-Tenstorrent-Tensix-BFP4-PLE4-Cal4x

## Resumen

Gemma 4 E4B Instruct cal4x es un checkpoint cuantizado de forma fija mediante GPTQ a partir de google/gemma-4-E4B-it, el modelo multimodal de Google de la familia Gemma 4. Lo publica Xylolabs con el objetivo especifico de servir como exportacion compatible con el hardware Tensix de Tenstorrent: las 343 proyecciones de texto activas (atencion, MLP y proyecciones por capa) se representan en precision BFP4, mientras que las tablas de lookup de tokens y por capa, la cabeza atada y las normas permanecen en BF16. El resultado es un paquete de 2.077 tensores indexados y 17,3 GB de repositorio que conserva la receta original de cuantizacion sin reentrenamiento ni recalibracion adicional.

El modelo base es un transformer multimodal de tipo image-text-to-text con aproximadamente 8.612 millones de parametros totales (segun los safetensors del repositorio) y capacidad de generacion de texto y razonamiento conversacional. Este export concreto esta pensado para entornos de framework y para el empaquetado host de TT-NN, no como un runner nativo completo: los propios autores advierten que las comprobaciones de formato no cualifican una ejecucion nativa del modelo.

Su relevancia actual es doble. Por un lado, demuestra una via de compresion agresiva (media de 9,878 bits por valor de texto activo, con las matrices seleccionadas empaquetadas a BFP4) que reduce el peso logico de las proyecciones activas a 9,22 GB frente a los 17,26 GB del export original. Por otro, valida esa compresion con una comparacion de KL sobre 16 secuencias de chat y 7.968 posiciones, obteniendo un KL de 0,1009 frente al 0,1999 de la referencia Q4_K_M, es decir, aproximadamente la mitad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Gemma 4, con proyecciones por capa (per-layer projections) |
| Parametros totales | 8.612.189.514 |
| Parametros activos | no disponible (no se declara variante MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ con pesos BFP4 en las 343 proyecciones de texto activas (incluidas 85 proyecciones por capa); tablas de lookup, cabeza atada y normas en BF16; empaquetado TT-NN en BFP4 y BFP8 |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos cuantizados preservados como BF16 para carga en framework) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 E4B Instruct es un transformer multimodal que procesa imagen y texto y genera texto. Este checkpoint no introduce entrenamiento nuevo: es una exportacion GPTQ de receta fija sobre el modelo de Google, en la que se cuantizan a BFP4 las 343 matrices de proyeccion de texto activas, entre ellas las 85 proyecciones por capa que dan nombre al sufijo PLE4. Las tablas de lookup de tokens y por capa, la cabeza atada y las normas se mantienen en BF16 para preservar la fidelidad de la parte no proyectiva. Los tensores del encoder original inactivos y una copia explicita de la cabeza atada se conservan por completitud del checkpoint.

El detalle tecnico relevante es el empaquetado para Tensix: el repositorio incluye pack_tensix.py y verify_grid.py, que comprueban el empaquetado BFP4 declarado y los round trips de empaquetado host en BFP4 y BFP8, incluida la proyeccion global. Las 343 matrices seleccionadas pasan la comprobacion exacta de rejilla y los otros 1.734 tensores coinciden con la fuente fijada. No se realizo calibracion ni cuantizacion nueva para la publicacion; se preserva la receta original. La carga en framework usa los tensores guardados con valores BF16, unos 17,22 GB antes de buffers de runtime, mientras que el peso empaquetado de dispositivo se estima en 11,51 GB incluyendo tensores retenidos, mas espacio para KV cache y buffers.

## Capacidades

- Generacion de texto conversacional multi-turno a partir de plantillas de chat, con soporte de `enable_thinking` para activar o desactivar el modo de razonamiento.
- Razonamiento y respuesta a preguntas, evaluado en el propio repositorio con 33 items normales y 7 de modo thinking.
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque el rendimiento en tareas de vision y audio no se evalua en este export.
- Capacidades multilingues limitadas a ingles y coreano segun la declaracion de idiomas del modelo.
- Integracion con Transformers mediante `AutoModelForImageTextToText` y `AutoTokenizer` (ejemplo verificado con Transformers 5.22.1).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Empaquetado y validacion de formatos para hardware Tenstorrent Tensix mediante los scripts incluidos.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint esta empaquetado especificamente para Tensix, con pesos BFP4 y scripts de verificacion de rejilla, por lo que sirve como artefacto de referencia para validar pipelines de inferencia en aceleradores Tenstorrent.
- Investigacion en cuantizacion de baja precision: la comparacion de KL frente a Q4_K_M (0,1009 frente a 0,1999) permite estudiar el impacto de BFP4 con tablas BF16 en la fidelidad de la distribucion de salida.
- Evaluacion de preservacion de recetas GPTQ: al no recalibrar ni reentrenar, el repositorio es util para reproducir y auditar una receta de cuantizacion fija sobre un modelo multimodal de Google.
- Prototipado conversacional en ingles y coreano: la plantilla de chat y el modo thinking permiten construir asistentes bilingues con contexto de conversacion en esos dos idiomas.
- Experimentacion multimodal controlada: aunque no se evalua el rendimiento en vision, el pipeline image-text-to-text permite probar entradas imagen-texto en entornos de framework con Transformers 5.22.1 o superior.
- Validacion de empaquetado TT-NN en CI: los scripts pack_tensix.py y verify_grid.py pueden integrarse en pipelines de verificacion para comprobar que los tensores cumplen los formatos BFP4 y BFP8 antes de un despliegue nativo.
- Comparacion de huellas de calibracion: la preservacion exacta de IDs de secuencia, mascaras y huella de calibracion facilita estudios de reproducibilidad entre checkpoints derivados del mismo modelo base.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| KL de chat del checkpoint original Q4_K_M | 0,199890 |
| KL de chat de este checkpoint | 0,100876313 |
| Ratio de KL frente a Q4_K_M | 0,504659 |
| Respuestas normales correctas | 32/33 |
| Respuestas en modo thinking correctas | 5/7 |
| Respuestas perdidas o rotas contabilizadas | 0 |

La evaluacion se realizo sobre las 32 secuencias originales y 16.144 posiciones puntuadas. El KL de la regla 7 usa las 16 secuencias de chat originales, 7.968 posiciones y las 262.144 entradas del vocabulario. El item normal ganado respecto a BF16 es `ko-reason-balls`. No se publican resultados de MMLU, HumanEval, GSM8K ni de velocidad de inferencia en la informacion disponible.

## Requisitos de hardware

- Memoria de dispositivo estimada para pesos empaquetados: 11,51 GB incluyendo tensores retenidos, mas espacio adicional para KV cache y buffers.
- Carga en framework: aproximadamente 17,22 GB antes de buffers de runtime, con `dtype=torch.bfloat16` y `device_map="cpu"` en el ejemplo oficial.
- GPU recomendadas: no disponible en la informacion proporcionada; el destino declarado es hardware Tenstorrent Tensix, no GPU convencionales.
- Compatibilidad con GPU de consumo: no disponible; el tamano de carga en framework (17,22 GB) supera la VRAM de la mayoria de GPU de consumo, pero no se documenta una estimacion especifica.
- Opciones de despliegue: Transformers (version que soporte Gemma 4, ejemplo verificado con 5.22.1), empaquetado host TT-NN con contexto de arquitectura configurado (por ejemplo, entorno simulador upstream). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no reportados en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-E4B-it-Tenstorrent-Tensix-BFP4-PLE4-Cal4x | 8.612.189.514 | no disponible | GPTQ BFP4 en proyecciones, BF16 en tablas y normas | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | BF16 original | Apache 2.0 | Hugging Face |
| Referencia Q4_K_M citada en la evaluacion | no disponible | no disponible | Q4_K_M | no disponible | no disponible |

La comparativa se limita a los artefactos mencionados en la informacion proporcionada; no se dispone de datos de otros modelos de la misma categoria para contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El export no constituye un runner nativo completo: las comprobaciones de formato TT-NN usan un contexto de arquitectura offline y la ejecucion nativa requiere soporte de proyecciones compatible y su propia validacion.
- El rendimiento en tareas de vision y audio no se ha evaluado; el checkpoint no debe darse por validado en esas modalidades.
- No se reporta velocidad de inferencia ni throughput, por lo que no hay garantias de rendimiento en produccion.
- La evaluacion se limita a 33 items normales y 7 de modo thinking sobre un conjunto fijo; es una muestra pequena y no cubre sesgos ni robustez general.
- Los idiomas declarados son solo ingles y coreano; el comportamiento en castellano u otros idiomas no esta garantizado.
- La media de bits por valor de texto activo es de 9,878, superior a cuatro bits, debido al gran tamano de las tablas de lookup en BF16; el ahorro real de memoria es menor de lo que sugiere la etiqueta BFP4.
- El repositorio no incluye un fichero legal raiz; la licencia Apache 2.0 se declara en el fichero LICENSE y hereda de la release fijada de Google.
- Riesgo de alucinacion y sesgos: no documentados especificamente para este checkpoint; deben asumirse los del modelo base Gemma 4 E4B Instruct.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de la release original de Google antes de desplegar en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-it-Tenstorrent-Tensix-BFP4-PLE4-Cal4x
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Script de empaquetado: https://huggingface.co/Xylolabs/gemma-4-E4B-it-Tenstorrent-Tensix-BFP4-PLE4-Cal4x/blob/main/pack_tensix.py
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E4B-it-Tenstorrent-Tensix-BFP4-PLE4-Cal4x/blob/main/LICENSE
- Repositorio de codigo Tensix BFP GPTQ: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
