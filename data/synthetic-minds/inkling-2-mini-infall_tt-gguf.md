# synthetic-minds/Inkling-2-Mini-Infall_TT-GGUF

## Resumen

Inkling-2-Mini-Infall_TT-GGUF es una cuantizacion GGUF en 8 bits del modelo multimodal thinkingmachines/Inkling-2-Mini, desarrollado por Thinking Machines Lab y publicado el 20 de noviembre de 2026. La cuantizacion la firma Synthetic Minds mediante Infall-TT, su framework propietario (en beta) para entrenar, cuantizar y ejecutar modelos sobre aceleradores neuronales de Tenstorrent. El resultado son ficheros GGUF estandar que, segun la model card, funcionan en cualquier maquina con llama.cpp, aunque el objetivo declarado de Infall-TT es el hardware Blackhole de Tenstorrent (P150A/B, P300C, Galaxy Blackhole).

El modelo base es un transformer autorregresivo con bucles (looped transformer) de tipo mixture-of-experts, con 26.400 millones de parametros totales y 3.400 millones activos por token, y capacidad multimodal image-text-to-text. Esta ficha cubre especificamente el artefacto cuantizado: la informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks del modelo original es muy limitada en la model card del quant.

La relevancia practica del repositorio esta en su tabla de calidad de cuantizacion: compara seis variantes (Q4_K_M a Q8_0) frente a la referencia Q8_0 en wikitext-2, con divergencia KL, acuerdo top-1 y perplejidad. Es un caso poco habitual de cuantizador que publica metricas de distorsion detalladas, aunque las cifras son aproximadas ("leidas de los graficos") y el modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo multimodal con bucles (looped transformer), mixture-of-experts |
| Parametros totales | 26.070.385.152 (~26,4 B) |
| Parametros activos | ~3,4 B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF 8 bits (Q8_0); la model card lista tambien Q4_K_M, Q5_K_S, Q5_K_M, Q6_K_S, Q6_K y Q6_K_L como variantes comparadas |
| Idiomas soportados | Ingles y soporte multilingue general |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con safetensors del modelo base; tamano del repo 161,0 GB) |

## Arquitectura y entrenamiento

El modelo base es, segun la model card, un "multimodal autoregressive looped transformer" con mezcla de expertos: 26,4 B de parametros totales y 3,4 B activos. La etiqueta `inkling2_loop` del repositorio apunta a un esquema de reutilizacion de capas (looping), aunque no se detalla cuantas iteraciones ni como se reparten los expertos. La model card no especifica numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento.

Respecto al artefacto cuantizado, Infall-TT produce ficheros GGUF estandar compatibles con llama.cpp y declara como hardware objetivo los aceleradores Tenstorrent Blackhole. No se documenta el algoritmo exacto de cuantizacion (si es RTN, GPTQ-like o con imatrix; la etiqueta `imatrix` sugiere uso de matrices de importancia). La model card incluye graficos de calidad frente a Q8_0 sobre wikitext-2 con 65.536 tokens para KL y top-1, y el corpus completo de test para perplejidad.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`): entrada de imagenes con salida textual.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la model card; el modelo base es de proposito general, pero no hay evaluaciones publicadas en la informacion disponible.
- Soporte multilingue general, con ingles como idioma principal.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Inferencia eficiente por su naturaleza MoE: solo ~3,4 B de parametros activos por token.

## Casos de uso

- Procesamiento de documentos con imagenes: extraccion y resumen de informacion a partir de capturas, formularios escaneados o diagramas combinados con instrucciones textuales, aprovechando el pipeline image-text-to-text.
- Asistente conversacional multilingue: despliegue en llama.cpp sobre CPU o GPU para atencion en ingles y otros idiomas, con la ventaja de que solo se activan ~3,4 B de parametros por token.
- Prototipado en hardware Tenstorrent: validacion de pipelines de inferencia sobre Blackhole P150A/B, P300C o Galaxy Blackhole usando los GGUF optimizados por Infall-TT.
- Evaluacion de cuantizacion en investigacion: el repositorio sirve como referencia para estudiar el impacto de Q4_K_M a Q8_0 en KL, top-1 y perplejidad sobre un MoE multimodal de 26 B.
- Despliegue en entornos con VRAM limitada: la variante Q4_K_M (~18,7 GB) permite ejecutar un modelo de 26 B en una sola GPU de 24 GB, algo inviable en precision completa.
- Generacion de descripciones y analisis de imagenes en lote: clasificacion o captioning de imagenes con contexto textual, ejecutable en local sin dependencia de API.
- Base para fine-tuning o destilacion: al ser Apache 2.0 y estar disponible en safetensors el modelo original, se puede usar como punto de partida para adaptaciones de dominio.

## Benchmarks y rendimiento

La model card solo publica metricas de calidad de cuantizacion frente a Q8_0 sobre wikitext-2, no benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.).

| Quant | Tamano (GB) | KL media vs Q8_0 | Acuerdo top-1 | Perplejidad wikitext-2 |
|---|---|---|---|---|
| Q4_K_M | ~18,7 | ~0,0059 | ~96,8 % | ~5,943 |
| Q5_K_S | ~19,2 | ~0,0041 | ~97,3 % | ~5,936 |
| Q5_K_M | ~21,2 | ~0,0037 | ~97,5 % | ~5,935 |
| Q6_K_S | ~24,1 | ~0,0028 | ~97,7 % | ~5,931 |
| Q6_K | ~24,7 | ~0,0027 | ~97,8 % | ~5,934 |
| Q6_K_L | ~25,4 | ~0,0026 | ~97,9 % | ~5,933 |
| Q8_0 | ~27,8 | 0 (referencia) | 100 % | ~5,931 |

Las diferencias de perplejidad entre variantes (~0,01) son menores que el margen de error declarado (~±0,035), por lo que el autor las considera estadisticamente indistinguibles de Q8_0. La mayor caida de distorsion se produce entre Q4_K_M y Q5_K_S.

## Requisitos de hardware

- VRAM estimada: Q8_0 ~27,8 GB; Q6_K_L ~25,4 GB; Q6_K ~24,7 GB; Q5_K_M ~21,2 GB; Q5_K_S ~19,2 GB; Q4_K_M ~18,7 GB (tamanos de fichero declarados en la model card; la VRAM real anade overhead de contexto y KV cache).
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 sin compromisos; RTX 4090 (24 GB) para Q6_K o inferiores; RTX 3090 (24 GB) para Q5_K_M y menores.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q6_K o inferior; Q4_K_M (~18,7 GB) deja margen para contexto en 24 GB.
- Opciones de despliegue: llama.cpp (soporte explicito en la model card); hardware Tenstorrent Blackhole P150A/B, P300C y Galaxy Blackhole como objetivo de Infall-TT. vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. Al ser MoE con ~3,4 B activos, el coste por token deberia ser inferior al de un denso de 26 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No hay datos de benchmarks del modelo base en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini (Infall_TT GGUF) | ~26,4 B | ~3,4 B | no disponible | Apache 2.0 | GGUF 8 bits |
| thinkingmachines/Inkling-2-Mini | ~26,4 B | ~3,4 B | no disponible | Apache 2.0 | safetensors |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos de la misma categoria (MoE multimodal de ~26 B) en el material proporcionado, ni de resultados que permitan comparar rendimiento.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo de proposito general entrenado con datos no especificados, cabe esperar sesgos propios del corpus, pero no hay evidencia publicada.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de factualidad en la informacion disponible.
- La cuantizacion introduce distorsion: incluso Q8_0 difiere de los pesos originales, y Q4_K_M cambia el token top-1 en ~3,2 % de los casos segun el propio autor.
- Las metricas de calidad son aproximadas ("leidas de los graficos") y se limitan a wikitext-2 en ingles; no cubren tareas multimodales ni multilingues.
- Longitud de contexto no disponible: no se puede planificar el uso en tareas de contexto largo.
- Soporte de idiomas: ingles y "multilingue general" sin lista cerrada; el rendimiento en castellano no esta evaluado.
- Licencia Apache 2.0 permite uso comercial, pero el framework Infall-TT esta en beta y su terminos de uso no se detallan en la model card.
- El hardware objetivo (Tenstorrent) es nicho; el rendimiento en GPU convencional via llama.cpp no esta medido por el autor.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad.
- El tamano del repo (161 GB) incluye multiples variantes; descargar solo el fichero necesario con `--include`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/synthetic-minds/Inkling-2-Mini-Infall_TT-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Web de Synthetic Minds: https://www.syntheticmindslab.com
- Anuncio de Infall-TT: https://www.syntheticmindslab.com/news/introducing-infall-tt
- Lista de espera de Infall-TT: https://www.syntheticmindslab.com/infall-tt
- Coleccion GGUF de Infall-TT: https://hf.co/collections/synthetic-minds/infall-tt-optimised-gguf-20
- GitHub de Synthetic Minds: https://github.com/syntheticminds-lab
- X de Synthetic Minds: https://x.com/syntheticminds2
- X de Tudor: https://x.com/tudoriustin_
- LinkedIn: https://www.linkedin.com/company/synthetic-minds-lab/
