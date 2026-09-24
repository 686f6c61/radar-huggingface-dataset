# vcruz305/MiMo-V2.6-Flash-RL-EXL3

## Resumen

MiMo-V2.6-Flash-RL · EXL3 es un paquete de cuantizacion del modelo XiaomiMiMo/MiMo-V2.6-Flash-RL, publicado por el usuario vcruz305 bajo licencia MIT. No se trata de un modelo entrenado desde cero, sino de una conversion de los pesos originales de Xiaomi a formato EXL3 (exllamav3) mediante SAGE, un metodo de cuantizacion de precision mixta desarrollado por el propio autor de la cuantizacion. El modelo base es un MoE disperso de 309B parametros totales con unos 15B activos por token, 48 capas y una ventana de contexto de 1M tokens, disenado por el equipo MiMo de Xiaomi para cubrir tareas de texto, imagen, video y audio.

La relevancia de este paquete reside en que permite servir un modelo de 309B parametros en una unica GPU de 96 GB o 128 GB, algo inviable con los pesos BF16 originales. El pack de 2.50 bpw ocupa 98.48 GB en disco, mientras que el de 2.20 bpw (aun pendiente en el momento de la publicacion) esta pensado para caber en una tarjeta de 96 GB. La cuantizacion cubre unicamente el modelo de texto: los codificadores de vision y audio, asi como el drafter de prediccion multi-token, no forman parte del pack ni estan implementados en el cargador.

Se trata de un artefacto muy reciente (creado el 24 de septiembre de 2026), sin descargas ni likes registrados en el momento de redactar esta ficha, y su uso practico depende de una rama no fusionada de exllamav3 que anade soporte para la arquitectura MiMo-V2. Esto lo posiciona como una opcion de despliegue avanzada para equipos con hardware de gama alta y capacidad de compilar extensiones CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (transformer) con atencion hibrida sliding-window/full; 48 capas (39 sliding-window, 9 full attention) |
| Parametros totales | 309B (de los cuales, expertos: 303B) |
| Parametros activos | ~15B por token (8 de 256 expertos enrutados por capa) |
| Longitud de contexto | 1M tokens en el modelo base; los ejemplos de carga usan cache de 32.768 tokens y las mediciones de servicio, 65.536 |
| Tipos de cuantizacion | EXL3 con metodo SAGE de precision mixta: 2.50 bpw (98.48 GB) y 2.20 bpw (pendiente); cabecera de salida a 6 bits en todos los packs |
| Idiomas soportados | en, zh |
| Licencia | MIT (igual que el modelo base) |
| Formato de pesos | safetensors (cargador exllamav3), un directorio por bitrate |
| Tamano del repositorio | 98.5 GB |
| Libreria | exllamav3 |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Flash-RL |
| Vocabulario | 152.576 tokens, embeddings de entrada y salida no ligados |
| Metodo de cuantizacion | SAGE (precision mixta propia del autor de la cuantizacion) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE disperso de 48 capas, con un tamano oculto de 4.096 y atencion hibrida. Las capas sliding-window (39 del total) usan una ventana de 128 tokens, con `attention_chunk` de 128 y un sesgo de sumidero aprendido; las 9 capas restantes emplean atencion completa. El mecanismo de atencion tiene 64 cabezas de consulta, con 8 cabezas KV en las capas sliding y 4 en las capas full, dimension de cabeza QK de 192 y dimension de cabeza V de 128, todo con RoPE. El bloque MoE consta de 256 expertos enrutados por capa, con 8 activos por token, sin experto compartido, y un enrutador sigmoid con pesos normalizados; el primer bloque es denso. Los expertos representan 303B de los 309B parametros totales. El almacenamiento original mezcla precisiones: expertos en MXFP4, atencion en block-FP8 (bloques de 128x128) y el resto en BF16.

En cuanto al entrenamiento, segun la model card del modelo base, MiMo-V2.6-Flash-RL se entreno con RL en una unica ejecucion mixta que abarca codigo, agentes, tareas visuales y ciberseguridad, con calificacion agentica por grupos (groupwise agentic grading) y una etapa posterior de destilacion multi-profesor. Es el checkpoint equilibrado en eficiencia de la serie MiMo-V2.6.

La innovacion tecnica especifica de este repositorio es el proceso de cuantizacion: cada pack se evalua contra el checkpoint original sobre texto no usado para calibrar la cuantizacion, y se reportan metricas de fidelidad (top-1 de coincidencia con el siguiente token mas probable y divergencia KLD media y p99). Estas metricas miden la cercania a BF16, no la precision en tareas. Como referencia, los pesos sin cuantizar ejecutados en el mismo codigo de exllamav3 coinciden con la implementacion de Xiaomi en el 96,49% de las posiciones (9.881 de 10.240) con KLD media de 0,0070, lo que marca el techo alcanzable por cualquier pack.

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta entrenado con RL y dispone de un modo de razonamiento que se expone mediante un parser en el servidor de inferencia; la plantilla de chat se incluye en cada carpeta.
- Codigo y agentes: el modelo base reporta resultados en benchmarks de agente de codigo (DeepSWE v1.1, MiMo Code Bench), agentes generales (Toolathlon-Verified, Terminal Bench 2.1, OSWorld-Verified) y agentes visuales (MiMo VisualCoding).
- Ciberseguridad: aparece evaluado en CyberGym (95,1) y SEC Bench Pro (47,5) segun la model card de Xiaomi.
- Capacidades agenticas: el entrenamiento RL se realizo con calificacion agentica por grupos, lo que orienta el modelo a tareas multi-paso y uso de herramientas.
- Multilingue: solo ingles (en) y chino (zh) declarados.
- Capacidades multimodales: el modelo base cubre texto, imagen, video y audio, pero esta cuantizacion sirve unicamente texto; los codificadores de vision y audio no estan en el pack ni implementados en el cargador.
- Tool calling / function calling: no disponible de forma explicita en la informacion proporcionada; los benchmarks de agente sugieren soporte de interaccion con herramientas, pero no se detalla el formato.
- Drafter de prediccion multi-token: no incluido en el pack (no implementado en el cargador).

## Casos de uso

- Agentes de codigo en produccion: el modelo base se evalua con 67,9 en DeepSWE v1.1 y 61,2 en MiMo Code Bench, por lo que puede integrarse en pipelines que resuelvan issues, generen parches y ejecuten tareas multi-paso sobre repositorios. La cuantizacion permite servirlo en una sola GPU de gama alta reduciendo el coste de infraestructura frente a los pesos BF16.
- Automatizacion de tareas de terminal y sistema operativo: con 87,6 en Terminal Bench 2.1 y 80,8 en OSWorld-Verified, es adecuado para agentes que operan entornos de linea de comandos o interfaces de escritorio de forma autonoma.
- Analisis de seguridad y ciberseguridad: su puntuacion de 95,1 en CyberGym y 47,5 en SEC Bench Pro lo hace util para tareas de triaje de vulnerabilidades, analisis de trazas y asistencia en entornos SOC, siempre con supervision humana.
- Atencion al cliente multilingue (ingles y chino): con una ventana de contexto de 1M tokens en el modelo base, puede mantener conversaciones multi-turno con historiales largos y documentacion adjunta, aunque el pack se sirve con caches de 32.768 o 65.536 tokens segun la configuracion.
- Razonamiento de largo contexto sobre documentacion tecnica: la ventana de 1M tokens permite ingerir manuales, bases de codigo o expedientes extensos en un unico contexto para extraccion y sintesis.
- Despliegue en servidores con una sola GPU de 96 GB o 128 GB: equipos que no pueden repartir un modelo de 309B en multiples nodos pueden servirlo con el pack de 2.20 bpw (96 GB) o 2.50 bpw (128 GB) usando exllamav3 y su envoltorio compatible con OpenAI.
- Investigacion sobre cuantizacion: el repositorio documenta metricas de fidelidad (top-1 y KLD) frente al checkpoint original, lo que lo convierte en un caso de estudio util para comparar metodos de cuantizacion de precision mixta en modelos MoE grandes.

## Benchmarks y rendimiento

Resultados reportados por Xiaomi para el modelo en BF16 (no reevaluados sobre estos packs). Se incluyen tal cual, con la categoria indicada en la model card:

| Benchmark | Categoria | MiMo-V2.6 Flash |
|---|---|---|
| DeepSWE v1.1 | Agente de codigo | 67,9 |
| MiMo Code Bench | Agente de codigo | 61,2 |
| AutomationBench v1.0.6 | Agente general | 52,3 |
| Toolathlon-Verified | Agente general | 73,6 |
| Terminal Bench 2.1 | Agente general | 87,6 |
| OSWorld-Verified | Agente general | 80,8 |
| JobBench | Agente general | 61,2 |
| CyberGym | Ciberseguridad | 95,1 |
| SEC Bench Pro | Ciberseguridad | 47,5 |
| MiMo VisualCoding | Agente visual | 71,5 |

Metricas de fidelidad de la cuantizacion frente al checkpoint original (medidas sobre texto no usado para calibrar):

| Pack | Tamano | Tarjeta minima | Top-1 vs original | KLD media | KLD p99 |
|---|---|---|---|---|---|
| 2.50 bpw | 98,48 GB | 128 GB | 83,76% (8.577 / 10.240) | 0,2055 | 3,380 |
| 2.20 bpw | no disponible | 96 GB | no disponible | no disponible | no disponible |
| Referencia BF16 en exllamav3 | no aplica | no aplica | 96,49% (9.881 / 10.240) | 0,0070 | no disponible |

Sobre un segundo conjunto de texto reservado (otras 10.240 posiciones), el pack de 2.50 bpw obtiene 87,30% con KLD de 0,1086.

## Requisitos de hardware

- VRAM estimada: el pack de 2.50 bpw ocupa 98,48 GB de pesos, por lo que necesita una tarjeta de 128 GB para mantenerlo residente con espacio para la cache KV. El pack de 2.20 bpw esta disenado para caber en una unica tarjeta de 96 GB.
- GPU recomendadas: tarjetas de 128 GB (por ejemplo, H200 o B200) para el pack de 2.50 bpw; tarjetas de 96 GB para el de 2.20 bpw.
- GPU de consumo: no cabe en ninguna GPU de consumo (24 GB o 48 GB); requiere hardware de centro de datos.
- Opciones de despliegue: exllamav3 mediante la rama del PR turboderp-org/exllamav3#399, que anade soporte para la arquitectura MiMo-V2 y exige compilar la extension CUDA para la tarjeta concreta. Cualquier front end de exllamav3 sirve para exponer un endpoint compatible con OpenAI. El repositorio incluye un cliente interactivo (`examples/chat.py`).
- Latencia y throughput: no disponible de forma numerica. Las mediciones de servicio del autor se realizaron con un envoltorio nativo `/v1` sobre exllamav3, con cache de 65.536 tokens y hasta 16 peticiones concurrentes, sobre el pack de 2.20 bpw y una tarjeta de 96 GB, pero no se publican cifras concretas de latencia ni de tokens por segundo.
- Cache KV: los ejemplos de carga usan 32.768 tokens de cache; las pruebas de servicio, 65.536, muy por debajo del maximo de 1M tokens del modelo base.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones con otros modelos de la misma categoria mas alla del propio modelo base. La comparativa disponible se limita a las variantes del mismo artefacto:

| Version | Parametros | Contexto | Tamano en disco | Fidelidad (top-1) | KLD media | Licencia | Tarjeta minima |
|---|---|---|---|---|---|---|---|
| MiMo-V2.6-Flash-RL (BF16) | 309B totales, ~15B activos | 1M tokens | no disponible | 96,49% | 0,0070 | MIT | no disponible |
| EXL3 2.50 bpw | 309B totales, ~15B activos | 1M (base); 65.536 en servicio | 98,48 GB | 83,76% | 0,2055 | MIT | 128 GB |
| EXL3 2.20 bpw | 309B totales, ~15B activos | 1M (base) | no disponible | no disponible | no disponible | MIT | 96 GB |

Comparaciones con modelos de otros desarrolladores (por ejemplo, otros MoE de escala similar): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto: los codificadores de vision y audio y el drafter de prediccion multi-token del modelo base no estan incluidos en el pack ni implementados en el cargador, por lo que no se pueden usar aunque el modelo original sea multimodal.
- Perdida de fidelidad por cuantizacion: el pack de 2.50 bpw coincide con el original en el 83,76% de las posiciones (87,30% en el segundo conjunto de texto), frente al 96,49% que alcanza el modelo sin cuantizar ejecutado en el mismo codigo. La KLD media de 0,2055 y la p99 de 3,380 indican que las divergencias se concentran en una cola de posiciones. Estas metricas miden fidelidad a BF16, no precision en tareas: no hay reevaluacion de benchmarks sobre los packs.
- Dependencia de una rama no fusionada: el cargador necesita el PR turboderp-org/exllamav3#399, que debe compilarse con la extension CUDA para la tarjeta del usuario. El soporte de MiMo-V2 no esta aun en exllamav3 upstream, lo que anade riesgo de mantenimiento y de compatibilidad futura.
- Requisitos de hardware muy elevados: no cabe en GPUs de consumo; exige tarjetas de 96 GB o 128 GB.
- Idiomas limitados: solo ingles y chino declarados. El rendimiento en otros idiomas, incluido el espanol, no esta documentado.
- Riesgo de alucinacion: no se documenta de forma especifica en la informacion disponible, pero es un riesgo inherente a los modelos generativos de esta escala; no se aportan tasas de alucinacion medidas.
- Sesgos conocidos: no disponible. La model card no detalla evaluaciones de sesgo o toxicidad.
- Licencia: MIT, igual que el modelo base, lo que permite uso comercial. No obstante, conviene verificar las condiciones del modelo original de Xiaomi para cualquier uso en produccion.
- Madurez del artefacto: el repositorio se creo y actualizo el 24 de septiembre de 2026, con cero descargas y cero likes en el momento de redactar esta ficha, y el pack de 2.20 bpw figura como pendiente. No hay historial de uso en produccion.
- Ajustes de muestreo recomendados por el autor: `temperature=1.0`, `top_p=0.95`. El modo de razonamiento requiere un parser del lado del servidor.

## Enlaces

- Repositorio del pack cuantizado: https://huggingface.co/vcruz305/MiMo-V2.6-Flash-RL-EXL3
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Carpeta del pack 2.50 bpw: https://huggingface.co/vcruz305/MiMo-V2.6-Flash-RL-EXL3/tree/main/2.50bpw
- Libreria exllamav3: https://github.com/turboderp-org/exllamav3
- Pull request con el soporte de MiMo-V2: https://github.com/turboderp-org/exllamav3/pull/399
