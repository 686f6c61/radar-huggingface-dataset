# Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W8A8-Vision

## Resumen

El modelo Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W8A8-Vision es un checkpoint cuantizado a INT8 (W8A8) publicado por el usuario Xananthium el 6 de octubre de 2026. Parte de HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, un ajuste sin censura del modelo Qwen/Qwen3.6-35B-A3B, del que hereda la arquitectura de mezcla de expertos (MoE) con aproximadamente 35,95 mil millones de parametros totales y una designacion A3B que apunta a unos 3 mil millones de parametros activos por token.

La relevancia de esta publicacion es doble. Por un lado, ofrece una version cuantizada a 8 bits pensada para inferencia local con vLLM 0.31.0 mediante un cargador propio (`qwen_w8a8_view`) que reutiliza los tensores INT8 originales de ModelOpt con escalas por canal, sin recalcular los pesos. Por otro, conserva la torre de vision y los pesos MTP (multi-token prediction), aunque la decodificacion especulativa no esta habilitada en la configuracion publicada.

Se trata de un artefacto con cero descargas y cero valoraciones en el momento de redactar esta ficha, y su model card advierte explicitamente de que las mediciones incluidas son pruebas sinteticas pequenas, no resultados de benchmarks publicados. No dispone de pipeline declarado ni de lista de idiomas en los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), etiqueta `qwen3_5_moe`; incluye torre de vision y pesos MTP |
| Parametros totales | 35.951.822.704 (≈35,95 mil millones) |
| Parametros activos | ≈3 mil millones segun la denominacion A3B del modelo base; no confirmado en la informacion disponible |
| Longitud de contexto | 200.000 tokens (valor usado en el comando de ejemplo `--max-model-len 200000`); no confirmado como maximo oficial del modelo base |
| Tipos de cuantizacion | INT8 W8A8 con activaciones INT8 dinamicas por token; existe un export alternativo W8A16 con activaciones en BF16; embeddings, cabeza de salida, vision, MTP, routers y proyecciones pequenas/SSM se mantienen en mayor precision |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (la model card indica que se aplican las licencias upstream) |
| Formato de pesos | safetensors con compressed-tensors (tensores INT8 ModelOpt con escalas por canal); requiere cargador propio, no compatible con carga generica de Transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) etiquetado como `qwen3_5_moe` en los metadatos. El modelo conserva la torre de vision del modelo base y los pesos MTP (multi-token prediction), si bien la decodificacion especulativa no se activo durante las pruebas del autor. La cuantizacion W8A8 emplea activaciones INT8 dinamicas por token, mientras que la variante W8A16 utiliza activaciones en BF16. En ambos casos, los embeddings, la cabeza de salida, la torre de vision, los pesos MTP, los routers y determinadas proyecciones pequenas y de tipo SSM se mantienen en precision superior para limitar la degradacion.

Sobre el entrenamiento: no hay informacion disponible sobre el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. Lo que si documenta la model card es el proceso de construccion de este checkpoint: los pesos de lenguaje se reconstruyeron a partir del GGUF Q8_K_P de Hauhau antes de exportarlos a INT8, mientras que la vision y el MTP se tomaron del modelo oficial de Qwen. Los detalles estan en `reconstruction_metadata.json`. El autor menciona ademas un export anterior con SmoothQuant/mixto, archivado como checkpoint separado. Las muestras de codificacion y razonamiento recomendadas son temperatura 0.6, top_p 0.95, top_k 20, min_p 0, presence_penalty 0 y repetition_penalty 1, con el modo de razonamiento (thinking) activado.

## Capacidades

- Generacion de texto y conversacion multi-turno con ventanas de contexto muy largas (hasta 200.000 tokens en la configuracion de ejemplo).
- Razonamiento explicito mediante modo thinking, con parser de razonamiento `qwen3` en vLLM.
- Generacion de codigo, con parser de tool calling especifico `qwen3_coder` y soporte de `--enable-auto-tool-choice`.
- Tool calling y function calling, habilitados en el comando de despliegue publicado.
- Procesamiento de imagenes: la model card indica que la torre de vision paso dos fixtures de imagen en la ruta W8A8, lo que constituye una validacion muy limitada.
- Pesos MTP retenidos en el checkpoint, aunque la decodificacion especulativa no se habilito.
- Ajuste sin censura ("uncensored" y "aggressive" en el nombre del modelo base), orientado a reducir rechazos en contenido sensible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en produccion: el modelo soporta tool calling con el parser `qwen3_coder` y el modo thinking, por lo que puede integrarse en pipelines de CI/CD para revision de parches, generacion de tests o resolucion de incidencias con acceso a herramientas externas.
- Atencion al cliente automatizada: con 200.000 tokens de contexto en la configuracion de servicio, puede mantener conversaciones multi-turno que arrastren historial extenso, contratos o registros de incidencias sin truncar.
- Analisis de documentacion tecnica larga: resumen y extraccion de datos estructurados a partir de manuales, normativas o expedientes de cientos de miles de tokens, aprovechando el modo de razonamiento para tareas encadenadas.
- Procesamiento de documentacion con diagramas: la torre de vision permite leer capturas, planos o graficos adjuntos a un informe; conviene validar antes en produccion porque solo se han documentado dos pruebas de imagen.
- Despliegue on-premise con requisitos de privacidad: al ser un checkpoint INT8 de ~38 GB y soportar vLLM con cache KV cuantizada (`turboquant_4bit_nc`), encaja en entornos con dos GPU donde los datos no pueden salir de la infraestructura.
- Generacion de contenido editorial sin filtros restrictivos: el ajuste sin censura resulta util para redaccion de ficcion, guiones o materiales donde los rechazos del modelo base son un obstaculo, asumiendo la perdida de salvaguardas.
- Investigacion en cuantizacion: el repositorio incluye `results/precision-comparison.json`, util como referencia para estudiar el impacto de W8A8 frente a W8A16 y frente a GGUF Q8_K_P en un mismo modelo.
- Razonamiento multi-paso sobre datos internos: combinacion de modo thinking con tool calling para tareas de diagnostico o planificacion que requieren varios saltos de inferencia y consultas a APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones del autor se encuentran en `results/precision-comparison.json`, que son pruebas sinteticas pequenas y que no constituyen puntuaciones de benchmarks de ciberseguridad publicados. Los artefactos no evaluados no tienen puntuacion medida.

## Requisitos de hardware

- VRAM estimada para los pesos: el repositorio ocupa 38,4 GB y los parametros son ~35,95 mil millones en INT8, por lo que se necesitan aproximadamente 38-40 GB solo para los pesos, mas margen para activaciones y cache KV.
- GPU recomendadas: el comando oficial usa `--tensor-parallel-size 2`, es decir, dos GPU. Un par de A100 80 GB o H100 80 GB es la opcion holgada; dos L40S o dos RTX 6000 Ada podrian ser suficientes para pesos y contexto moderado.
- GPU de consumo: no cabe en una sola GPU de 24 GB (RTX 4090, 3090). Dos RTX 4090 de 24 GB suman 48 GB y podrian alojar los pesos, pero la cache KV para contextos de 200.000 tokens requerira cuantizacion agresiva o reducir `--max-model-len`.
- El comando de referencia emplea `--kv-cache-dtype turboquant_4bit_nc`, lo que reduce el coste de la cache KV pero anade una dependencia especifica del entorno de vLLM.
- Opciones de despliegue: vLLM 0.31.0 con el cargador incluido (`python -m pip install ./checkpoint/loader` y `--load-format qwen_w8a8_view`). La carga generica con Transformers no esta soportada para esta vista. No se documenta compatibilidad con llama.cpp, Ollama ni TGI para este checkpoint; el GGUF Q8_K_P del modelo base es un artefacto distinto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W8A8-Vision | 35,95 mil millones | ≈3 mil millones (designacion A3B) | 200.000 tokens en la configuracion de ejemplo | INT8 W8A8 (y export W8A16 alternativo) | apache-2.0 | HuggingFace, requiere cargador propio |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (modelo base) | 35,95 mil millones (heredado) | ≈3 mil millones (heredado) | no disponible | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.6-35B-A3B (base original) | 35,95 mil millones (heredado) | ≈3 mil millones (heredado) | no disponible | pesos originales en BF16, segun se deduce del proceso de reconstruccion | apache-2.0 segun la model card de este checkpoint | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes, por lo que la comparativa se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- El modelo base es un ajuste sin censura y "agresivo": cabe esperar una reduccion de las salvaguardas frente a contenido danino, ofensivo o ilegal. No se recomienda su uso en aplicaciones orientadas al publico sin una capa de moderacion adicional.
- La cuantizacion INT8 W8A8 introduce perdida de precision respecto a los pesos originales en BF16. El propio autor publica un JSON de comparacion de precision, pero basado en pruebas sinteticas pequenas.
- La torre de vision solo paso dos fixtures de imagen, lo que es una validacion insuficiente para producción. Cualquier uso multimodal exige evaluacion propia.
- Los pesos MTP estan presentes pero la decodificacion especulativa no se habilito, por lo que no se aprovecha esa ventaja de latencia.
- La carga generica con Transformers no funciona; el checkpoint depende de vLLM 0.31.0 y del cargador empaquetado, lo que limita la portabilidad y ancla el despliegue a una version concreta del servidor.
- El repositorio no declara pipeline, idiomas soportados ni resultados de benchmarks, y acumula cero descargas y cero valoraciones, por lo que no existe validacion independiente de la comunidad.
- Aunque la licencia declarada es apache-2.0, la model card indica que se aplican las licencias upstream; conviene revisar los terminos del modelo Qwen original y del ajuste de HauhauCS antes de un uso comercial.
- El modelo se reconstruyo a partir de un GGUF Q8_K_P del ajuste de HauhauCS, de modo que el proceso de exportacion puede haber introducido diferencias respecto al checkpoint original en BF16.
- Riesgo de alucinacion: no hay datos de evaluacion especificos, y el modo thinking no garantiza verificabilidad de las respuestas.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W8A8-Vision
- Modelo base (ajuste sin censura): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Ficheros de referencia citados en la model card: `README_ORIGINAL.md`, `results/precision-comparison.json`, `reconstruction_metadata.json` y el directorio `loader/`, todos dentro del repositorio del checkpoint.
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
