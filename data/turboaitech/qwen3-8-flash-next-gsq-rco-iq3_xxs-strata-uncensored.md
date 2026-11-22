# Turboaitech/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_XXS-Strata-Uncensored

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-IQ3_XXS-Strata-Uncensored es un paquete de distribucion y despliegue publicado por Turboaitech, no un modelo entrenado de nuevo. Contiene los shards GGUF en cuantizacion IQ3_XXS de los pesos upstream de ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF (120.320 millones de parametros segun los metadatos del repositorio base), junto con un vector de direccion de rechazo Huihui v2 y una receta de despliegue para el motor Strata en Windows. El peso combinado de los dos shards es de 75.839.998.528 bytes.

La propuesta tecnica es la proyeccion en tiempo de ejecucion (runtime projection): los pesos no se modifican, y el efecto de "uncensored" solo se activa si un motor Strata compatible carga el vector incluido con los argumentos documentados. Descargar unicamente los pesos no habilita la proyeccion. El paquete incluye `projection-settings.json` con un fragmento de argumentos para escala 1.0, capas 4 a 44, modo `project` y `per-layer`.

Es relevante ahora porque ejemplifica una tendencia de distribucion en el ecosistema abierto: separar el ajuste de comportamiento (abliteration o steering por vectores) del artefacto de pesos, de modo que el mismo GGUF pueda desplegarse con o sin la modificacion. El autor declara Apache-2.0 y atribuye los creditos a Qwen, ISTA-DASLab, huihui-ai, Pragmatism0220 y los contribuidores de Strata. No se han publicado mediciones de tasa de rechazo, calidad ni velocidad para esta configuracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8 Flash Next; arquitectura concreta no documentada en la informacion proporcionada) |
| Parametros totales | 120.320 millones (metadatos safetensors del repositorio base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS (unica incluida en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (2 shards, 75.839.998.528 bytes en total) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo base (tipo de transformer, uso de MoE, atencion lineal u otras innovaciones) ni sobre el dataset de entrenamiento, el numero de tokens o las fases de alineacion (RLHF, DPO). Lo que si esta documentado es la cadena de derivacion: los pesos proceden de ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF en la revision `ed59f92082b1e93c0e96d60a8b11aab089b52f09`, y el vector de direccion de rechazo procede de Pragmatism0220/Huihui-v2-Qwen3.8-Flash-Next-GSQ-RCO-Strata-abliterated-direction-GGUF en la revision `8003251c340d7a2f8a82cfe5f338aaa2ecd0b3ea`.

La innovacion tecnica destacable no esta en el entrenamiento sino en el mecanismo de despliegue. El autor afirma explicitamente que los shards son pesos upstream sin modificar y que la proyeccion solo surte efecto cuando el vector se carga en un motor Strata compatible con los argumentos documentados. El repositorio incluye `New-ProjectionProfile.ps1`, que genera un perfil nuevo a partir de un perfil Strata existente sin editar el original, y `STRATA_SETUP.md` con las instrucciones de instalacion. El helper de subida verifica los hashes SHA-256 de los tres ficheros antes de la publicacion, y las model cards upstream se conservan como `UPSTREAM_BASE_MODEL_CARD.md` y `UPSTREAM_MODEL_CARD.md`.

## Capacidades

- Generacion de texto: el autor registro una sesion local con generacion de texto ordinaria funcionando bajo el motor Strata con el vector cargado.
- Procesamiento image-text-to-text: el pipeline declarado en los metadatos es `image-text-to-text`, aunque no se detalla el alcance real de las capacidades multimodales.
- Razonamiento y codigo: no disponible; no se documentan evaluaciones especificas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no esta poblado.
- Modo thinking, vision o audio: no disponible mas alla del pipeline declarado.
- Ajuste de comportamiento en tiempo de ejecucion: capacidad diferencial del bundle, activable mediante el vector de direccion de rechazo con escala 1.0 sobre las capas 4 a 44 en modo `per-layer`.

## Casos de uso

- Despliegue de referencia en Windows con Strata: el paquete incluye la receta completa (`STRATA_SETUP.md`, `projection-settings.json` y el helper PowerShell) para montar un perfil funcional sobre los shards IQ3_XXS, lo que reduce el trabajo de configuracion inicial en entornos Windows.
- Investigacion sobre steering y abliteration: al mantener los pesos intactos y separar el vector, permite comparar el mismo modelo con y sin proyeccion sobre las mismas entradas, aislando el efecto del ajuste de comportamiento.
- Experimentacion con cuantizacion agresiva en modelos grandes: IQ3_XXS sobre 120.320 millones de parametros ofrece un punto de medida para evaluar la degradacion de calidad frente a cuantizaciones mayores en un modelo de esta escala.
- Reproducibilidad y auditoria de artefactos: los hashes SHA-256 publicados de los dos shards y del vector permiten verificar la integridad de la descarga en pipelines internos antes de desplegar.
- Pruebas de pipelines multimodales: el tag `image-text-to-text` permite integrar el modelo en prototipos de procesamiento de imagen y texto, siempre que se valide previamente el soporte real del motor elegido.
- Base para estudios de seguridad y alineacion: la disponibilidad de un vector de direccion de rechazo documentado facilita analisis controlados sobre como se manifiestan y suprimen los comportamientos de rechazo en modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se realizo ninguna medicion de tasa de rechazo, capacidad o velocidad, y que las mediciones de las model cards upstream no son mediciones de esta configuracion de ejecucion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmetica, los shards suman 75,8 GB en disco en IQ3_XXS, por lo que la carga completa exige memoria unificada o VRAM en ese orden de magnitud, mas el overhead del motor y del vector (483.520 bytes).
- GPU recomendadas: no disponible. Por volumen de pesos, el modelo no encaja en GPU de consumo de 24 GB ni en configuraciones de 48 GB sin offloading parcial a RAM o disco.
- Viabilidad en GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) de forma completa; requeriria offloading o hardware de mayor capacidad.
- Opciones de despliegue: el bundle esta disenado para el motor Strata con el vector de proyeccion cargado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta configuracion concreta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| Turboaitech/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_XXS-Strata-Uncensored | 120.320 M | no disponible | IQ3_XXS | Apache-2.0 | Bundle de despliegue con proyeccion en runtime |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | 120.320 M | no disponible | GGUF (varias) | Apache-2.0 | Pesos base sin modificacion de comportamiento |
| Pragmatism0220/Huihui-v2-Qwen3.8-Flash-Next-GSQ-RCO-Strata-abliterated-direction-GGUF | no disponible | no disponible | GGUF | no disponible | Vector de direccion de rechazo aislado |

La diferencia practica frente al modelo base es que este bundle anade el vector y la receta de despliegue, pero no altera los pesos ni aporta mediciones propias de calidad. Frente al repositorio del vector, aqui se incluyen tambien los shards completos y la configuracion de proyeccion.

## Limitaciones y advertencias

- El autor no garantiza cero rechazos ni calidad del modelo sin cambios; no se realizo ninguna medicion de tasa de rechazo.
- La proyeccion solo funciona con un motor Strata compatible y los argumentos documentados; descargar los pesos por separado no produce ningun efecto.
- No hay datos publicados de sesgos, alucinacion, contexto maximo ni cobertura idiomatica para esta configuracion.
- La licencia declarada es Apache-2.0, pero el autor remite a las declaraciones de licencia upstream conservadas en las model cards y en `NOTICE`; conviene revisarlas antes de un uso comercial.
- El paquete depende de un ecosistema de herramientas especifico (Strata en Windows, helper PowerShell), lo que limita la portabilidad a otros entornos.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, sin validacion externa de la comunidad.
- La fecha de creacion y actualizacion del repositorio (22 de noviembre de 2026) y la nomenclatura del modelo base deben tratarse con cautela al citar el artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Turboaitech/Qwen3.8-Flash-Next-GSQ-RCO-IQ3_XXS-Strata-Uncensored
- Codigo y receta Strata: https://github.com/Turboaitech/qwen38-flash-next-strata-projection
- Modelo base GGUF: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Vector de direccion de rechazo: https://huggingface.co/Pragmatism0220/Huihui-v2-Qwen3.8-Flash-Next-GSQ-RCO-Strata-abliterated-direction-GGUF
