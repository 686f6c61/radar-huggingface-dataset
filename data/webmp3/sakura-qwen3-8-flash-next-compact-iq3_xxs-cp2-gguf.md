# webmp3/Sakura-Qwen3.8-Flash-Next-Compact-IQ3_XXS-CP2-GGUF

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un reempaquetado experimental en GGUF de un MoE de gran tamaño: Sakura Qwen3.8 Flash-Next Compact IQ3_XXS CP2, publicado por el usuario webmp3 a partir del backbone cuantizado ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF y, en última instancia, de Qwen/Qwen3.8-Flash-Next (176.943.899.520 parámetros totales según los safetensors del modelo base). La operación consiste en copiar sin cambios el primer shard de pesos IQ3_XXS y sustituir el segundo shard (la tabla de consulta N-Gram/PLE) por la tabla CP2 ya existente en el repack Sakura K512 CP2, lo que reduce el paquete de 75,840 GB a 60,480 GB.

Su relevancia debe leerse con precisión: el autor declara explícitamente que este paquete exacto no se ha cargado para inferencia ni se ha probado en generación, perplejidad, calidad o velocidad. Es una publicación estructural —hashes verificados, 1.224 tensores, direccionamiento de la tabla y metadatos del tokenizer comprobados— y no una cualificación de calidad ni de hardware.

Para un desarrollador, el interés está en que documenta una vía concreta para servir un MoE de ~177.000 millones de parámetros en una máquina Windows x64 con Vulkan y lecturas perezosas de tabla desde NVMe local, con endpoint compatible con OpenAI, a costa de depender de un runtime propio no compatible con llama.cpp, LM Studio ni Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida GDN + QSA (según el repositorio oficial de Qwen3.8-Flash-Next); backbone en cuantización mixta IQ3_XXS |
| Parametros totales | 176.943.899.520 (~176,9 mil millones; dato real de safetensors del modelo base) |
| Parametros activos | no disponible |
| Expertos enrutados | 512 según la model card de este repack (las variantes hermanas K352 hacen referencia a 352) |
| Longitud de contexto | no disponible para el modelo base; el starter incluido configura 4.096 tokens |
| Tipos de cuantizacion | IQ3_XXS mixta en el backbone + tabla CP2 experimental (derivada con pérdida de IQ4_NL); no es un preset estándar de cuantización de modelo completo |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (pesos); el runtime incluido tiene licencia MIT y avisos de terceros |
| Formato de pesos | GGUF, 2 shards (1.223 tensores de pesos + 1 tensor de tabla = 1.224 tensores) |
| Tamano de los archivos | 60.479.925.280 bytes (60,480 GB decimales; 56,326 GiB): shard 1 de 43,809 GiB + tabla CP2 de 12,517 GiB |
| Endpoint | `/v1/chat/completions` compatible con OpenAI, alias `sakura-flash-next-iq3-xxs-cp2` |
| Revision base | ISTA-DASLab GSQ-RCO `ed59f92082b1e93c0e96d60a8b11aab089b52f09`; tabla/runtime Sakura K512 CP2 `9b8fef370b812b3fd33787869d553793517245cb` |

## Arquitectura y entrenamiento

El backbone es el modelo Qwen3.8-Flash-Next, que según su repositorio oficial introduce mejoras sistemáticas en cuatro frentes —atención, residual, embedding y optimización— con una arquitectura de atención híbrida GDN + QSA. Se trata de un transformer con mezcla de expertos: la model card de este repack indica que se conservan los 512 expertos enrutados del origen. El modelo base incorpora además MTP (multi-token prediction) y capacidades de visión, ambas deshabilitadas en el runtime de este paquete.

Este repositorio no entrena ni modifica pesos: el autor declara que no ha habido nuevo encoder, entrenamiento, poda de expertos ni port de runtime. El shard principal es el IQ3_XXS mixto original de ISTA-DASLab, identificado por su SHA256 LFS completo y copiado sin cambios de payload ni metadatos. El segundo shard se sustituye por una tabla CP2 que es una representación derivada con pérdida de la tabla IQ4_NL original (no byte-idéntica), verificada por hash completo. No se dispone de datos sobre tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`), con plantilla de chat del modelo base preservada.
- Modo *thinking* activado por defecto en la plantilla de chat heredada, también en el starter incluido.
- Razonamiento multi-paso vía el modo de pensamiento del modelo base (no evaluado en este paquete).
- MTP (multi-token prediction) presente en el modelo base, deshabilitado en el runtime de este repack.
- Visión: soportada por el modelo base según el runtime incluido, deshabilitada en este paquete.
- Servido como API local compatible con OpenAI (`/v1/chat/completions`) mediante el runtime incluido.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades multilingües: no documentadas para este paquete (los nombres de variantes hermanas aluden a DE-EN, pero son artefactos distintos).
- Soporte de agentes: no documentado; el runtime usa un solo slot y 4.096 tokens de contexto por defecto, lo que limita flujos agénticos largos.

## Casos de uso

- Evaluación de cuantización en MoE de gran tamaño: medir el impacto real de IQ3_XXS + tabla CP2 frente al IQ4_NL original en perplejidad y calidad de generación, algo que el autor señala explícitamente como no realizado.
- Servicio local en Windows sin conectividad: el starter levanta un endpoint compatible con OpenAI en `http://127.0.0.1:18098`, útil para prototipos en entornos aislados o con requisitos de soberanía del dato.
- Auditoría y cadena de custodia de artefactos: el repo incluye `results.json`, `PROVENANCE.json` y `SHA256SUMS`, lo que permite verificar hashes LFS, layout de shards y metadatos del tokenizer como parte de un proceso de validación de suministro de modelos.
- Investigación sobre representaciones de tabla N-Gram/PLE: comparar el direccionamiento de tabla CP2 con IQ4_NL en un backbone idéntico, aislando la variable de la tabla.
- Pruebas de despliegue en estaciones de trabajo con GPU Vulkan y NVMe: el runtime está pensado para lecturas perezosas de tabla desde disco local, escenario típico de máquinas sin suficiente memoria unificada.
- Reproducción de Linaje: reconstruir la cadena Qwen → ISTA-DASLab GSQ-RCO → Sakura K512 CP2 → este repack para trabajos de trazabilidad de modelos derivados.
- Experimentación con MTP y visión: aunque deshabilitadas en el starter, el paquete permite estudiar su activación si se dispone de un runtime cualificado (no incluido).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que este paquete IQ3_XXS + CP2 no se ha cargado para inferencia ni probado en generación, perplejidad, calidad o velocidad, y que las puntuaciones previamente reportadas para Sakura Q2 o Gyro-M no son resultados de este paquete y no se importan aquí. Tampoco se reclama ningún resultado de encaje en memoria, memoria pico, contexto largo o rendimiento.

## Requisitos de hardware

- Almacenamiento: 60,480 GB decimales en dos ficheros GGUF (56,326 GiB), más el runtime y la documentación. El autor recomienda NVMe local por las lecturas perezosas de la tabla.
- VRAM: no disponible. No hay cifra publicada ni afirmación de encaje para este paquete; el propio autor advierte que el tamaño de fichero no equivale a uso de memoria GPU.
- GPU recomendadas: no disponible. El único entorno cualificado es Windows x64 con Vulkan (runtime CP2 incluido).
- GPU de consumo: no confirmado para este paquete. La variante hermana IQ2_XS (~26 GiB de pesos en GPU) se describe como apta para una tarjeta de 32 GB, pero es un artefacto distinto.
- Configuración del starter: 1 slot, contexto 4.096, caché KV en Q8, MTP, visión y caché de filas CP2 en GPU deshabilitados.
- Opciones de despliegue: únicamente el runtime incluido. llama.cpp estándar, LM Studio, Ollama y forks no relacionados no están cualificados para la tabla CP2 personalizada. El proyecto Strata ofrece instalación para Qwen3.8-Flash-Next en hardware de consumo, pero no está cualificado para esta tabla.
- Latencia y throughput: no disponibles; el starter no se ha ejecutado contra este paquete exacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tabla | Tamano | Licencia | Estado |
|---|---|---|---|---|---|---|
| Este repack (Sakura IQ3_XXS CP2) | 176,9 B | no disponible (starter: 4.096) | IQ3_XXS + tabla CP2 | 60,480 GB | Qwen Community 1.0 | Experimental, sin probar |
| ISTA-DASLab Qwen3.8-Flash-Next-GSQ-RCO | no disponible | no disponible | IQ3_XXS + tabla IQ4_NL | 75,840 GB | Heredada de Qwen | Origen verificado por hash |
| Sakura Swift-DE-EN-K352 IQ3_XXS | no disponible | no disponible | IQ3_XXS | no disponible | no disponible | Hermano de la misma línea |
| Sakura Swift-DE-EN-K352 IQ2_XS | no disponible | no disponible | IQ2_XS | ~26 GiB de pesos en GPU | no disponible | Hermano, descrito como apto para 32 GB |
| Qwen/Qwen3.8-Flash-Next (base) | 176,9 B | no disponible | Pesos originales | no disponible | Qwen Community 1.0 | Modelo de referencia |

## Limitaciones y advertencias

- Artefacto no validado: no se ha cargado para inferencia ni probado en generación, perplejidad, calidad o velocidad. Cualquier uso en producción parte de cero en cuanto a evidencia empírica.
- Dependencia total del runtime incluido: llama.cpp estándar, LM Studio, Ollama y forks no relacionados no están cualificados para la tabla CP2.
- La tabla CP2 es una representación derivada con pérdida respecto a IQ4_NL; su efecto sobre la calidad no se ha medido.
- Contexto del starter limitado a 4.096 tokens, con MTP y visión deshabilitados: no apto para flujos de contexto largo o agentes multi-paso sin reconfiguración y sin garantías.
- Discrepancia sin resolver entre los 512 expertos enrutados que declara esta model card y la referencia a 352 expertos en las variantes hermanas K352; no hay confirmación independiente.
- Licencia: los pesos conservan Qwen Community License 1.0, con condiciones que hay que leer antes de cualquier uso comercial. El tag Apache de la card upstream no sustituye a la licencia heredada. El software del runtime (MIT) no relicencia los pesos.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe sin evaluarla.
- Riesgo de alucinación y sesgos: no evaluados en este paquete; no hay ninguna métrica publicada.
- Verificación acotada: los hashes se comprobaron contra metadatos LFS de HuggingFace, sin descarga completa independiente del nuevo repositorio.
- Señales de adopción nulas: 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad.
- El propio autor advierte que no se reclama encaje en configuraciones AMD de 64 GB UMA, ni memoria pico, ni contexto largo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Compact-IQ3_XXS-CP2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Backbone cuantizado: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Tabla CP2 y runtime de origen: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Compact-47.6GiB-K512-CP2-v1-GGUF
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Variante hermana IQ3_XXS: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Swift-DE-EN-K352-IQ3_XXS-GGUF
- Variante hermana IQ2_XS: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Swift-DE-EN-K352-IQ2_XS-GGUF
- Runtime de terceros para hardware de consumo (no cualificado para CP2): https://github.com/Niko1221/Strata
- Registro de la variante Darwin R3: https://free2aitools.com/model/webmp3/sakura-qwen3.8-flash-next-ista-darwin-r3-3bit-352e-gguf
