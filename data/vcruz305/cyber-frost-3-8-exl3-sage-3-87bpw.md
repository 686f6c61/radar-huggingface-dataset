# vcruz305/CYBER-FROST-3.8-EXL3-SAGE-3.87bpw

## Resumen

CYBER-FROST-3.8-EXL3-SAGE-3.87bpw es un artefacto de cuantizacion EXL3, generado con el metodo SAGE, del modelo CYBER-FROST-3.8 de Blackfrost-AI. No es un modelo entrenado desde cero ni un adaptador: es un checkpoint independiente de 32.843.734.528 parametros (unos 32,84 mil millones) que no necesita el padre en BF16 ni en FP8 para cargarse. Lo publica el usuario vcruz305 en colaboracion oficial con Blackfrost-AI (Sir Frosty), y su proposito es servir como paquete de despliegue para profesionales de seguridad que realicen investigacion, evaluacion, ingenieria y respuesta autorizadas.

El modelo hereda el dominio funcional del padre: seguridad ofensiva y defensiva, con enfasis declarado en reducir los falsos rechazos cuando el vocabulario tecnico (explotacion, analisis de malware, respuesta a incidentes) coincide con el de actividad no autorizada. La arquitectura registrada es Qwen4ExpForConditionalGeneration, con etiqueta de mezcla de expertos (MoE), ventana de contexto configurada de 262.144 tokens y una capa MTP nativa para decodificacion especulativa.

La relevancia practica esta en su formato: el cuerpo se comprime a 3,87 bits por parametro con una fidelidad declarada del 93,89% de top-1 en held-out frente al BF16, lo que permite desplegar un modelo de ~32,8B en un payload de 97,67 GiB. Es, por tanto, una pieza de infraestructura de inferencia mas que un modelo de investigacion en si mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (tag `moe`; transformer con mezcla de expertos) |
| Parametros totales | 32.843.734.528 (~32,84 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurada) |
| Tipos de cuantizacion | EXL3 (SAGE), cuerpo a 3,87 bits/parametro; tag 4-bit. Componentes: LM head 8 bits, capa MTP 4 bits, torre de vision 6 bits, tabla n-gram 6 bits |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (campo `license: other`, con `LICENSE` incluido en el repo) |
| Formato de pesos | safetensors (9 shards EXL3 mas `ngram_embedding.safetensors`), index de pesos, tabla n-gram, configuracion, tokenizer, processor y plantilla de chat empaquetada |

Otros datos del artefacto: repositorio de 104,9 GB; payload publicado de 104.872.927.412 bytes (97,67 GiB), sin contar la model card ni el banner; libreria `exllamav3`; pipeline `text-generation`; creado el 28 de septiembre de 2026.

## Arquitectura y entrenamiento

La arquitectura declarada por el autor es Qwen4ExpForConditionalGeneration, integrada en la familia Qwen y etiquetada como MoE (`qwen4-exp`). Sobre esa base, el proceso de creacion de este repositorio no es entrenamiento sino conversion: se toma el checkpoint BF16 (Blackfrost-AI/CYBER-FROST-3.8-BF16) y se cuantiza con el metodo SAGE en formato EXL3. La model card indica explicitamente que esta conversion no anadio datos de entrenamiento, por lo que las capacidades y el sesgo del modelo provienen integramente del padre.

El padre BF16 fue afinado sobre un corpus de seguridad de Blackfrost-AI que combina material curado, flujos de trabajo escritos por operadores, escenarios realistas de tipo engagement y datos de destilacion propiedad de Blackfrost. Los tamanos del corpus, los recuentos por fuente y el material de engagement no se publican. El dominio cubierto abarca reconocimiento y OSINT, ingenieria social, seguridad de aplicaciones web y API, identidad y Active Directory, seguridad de red y perimetral, investigacion de vulnerabilidades y explotacion binaria, analisis de malware y ransomware, seguridad de cloud, contenedores y Kubernetes, cadena de suministro de software, seguridad movil, IoT, inalambrica y fisica, y sistemas de control industrial.

En el plano de inferencia, el pack incorpora dos mecanismos de aceleracion: una capa MTP (multi-token prediction) como cabeza especulativa nativa y una tabla n-gram empaquetada. Ademas, la configuracion incluye torre de vision y ficheros de processor, aunque el autor advierte que no se ha realizado ninguna evaluacion de calidad multimodal sobre este release EXL3 y que su presencia no debe interpretarse como capacidad de imagen o video validada.

## Capacidades

- Generacion de texto conversacional y tecnico con pipeline declarado `text-generation`.
- Asistencia especializada en seguridad: reconocimiento y OSINT, explotacion binaria, analisis de malware, deteccion, respuesta a incidentes y seguridad de infraestructura (cobertura heredada del padre BF16).
- Uso de herramientas (tag `tool-use`), lo que habilita function calling en agentes de seguridad.
- Operacion como agente multi-paso, segun la etiqueta de agente y el enfoque de despliegue descrito en DEPLOY.md.
- Diseno orientado a reducir falsos rechazos en vocabulario de doble uso (ofensivo/defensivo) dentro de flujos autorizados. Es un objetivo de diseno heredado, no una afirmacion de comportamiento medida en este pack EXL3.
- Contexto largo: ventana configurada de 262.144 tokens.
- Decodificacion especulativa nativa mediante una capa MTP, con soporte EXL3 en exllamav3.
- Multilingue: no disponible.
- Vision y audio: no disponible; hay torre de vision y processor presentes, pero sin evaluacion multimodal declarada.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede resumir telemetria y priorizar alertas encadenando contexto de multiples fuentes, apoyandose en la ventana de 262.144 tokens para mantener el hilo de un turno completo de analisis sin trocear el historial.
- Respuesta a incidentes: reconstruccion de lineas temporales a partir de logs y notas de analistas, con generacion de hipotesis de alcance y siguiente accion. El contexto largo evita perder correlaciones entre eventos separados en el tiempo.
- Analisis de malware: descripcion de comportamiento, extraccion de indicadores y propuesta de reglas de deteccion a partir de informes o fragmentos de codigo, en un entorno aislado y bajo autorizacion.
- Ingenieria de deteccion: redaccion de reglas Sigma, YARA o consultas KQL a partir de una descripcion de amenaza, con iteracion multi-turno sobre falsos positivos.
- Validacion de vulnerabilidades en laboratorio: reproduccion controlada de hallazgos y redaccion de pruebas de concepto dentro de un scope aprobado, aprovechando la tolerancia del modelo al vocabulario tecnico.
- Hardening y revision de configuraciones (blue team): auditoria de parametros de Active Directory, Kubernetes o VPN con recomendaciones justificadas.
- Integracion como agente en plataformas SOAR: con soporte de tool calling, el modelo puede encadenar consultas a APIs, enriquecimiento de IOCs y apertura de tickets bajo permisos externos.
- Documentacion post-engagement: generacion de informes tecnicos y ejecutivos a partir de notas de trabajo, con trazabilidad de hallazgos.

En todos los casos, la autorizacion, el alcance y los permisos de herramienta son controles externos al modelo y deben aplicarse en la capa de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas publicadas son de fidelidad de la cuantizacion frente al modelo BF16, con 10.240 posiciones por conjunto y siguiente token sin redondear:

| Metrica (frente a BF16) | Resultado |
|---|---|
| Top-1 held-out | 9.614 / 10.240 (93,89%) |
| KL held-out | 0,0264 nats (0,0380 bits) |
| Top-1 independiente | 9.589 / 10.240 (93,64%) |
| KL independiente | 0,0423 nats (0,0610 bits) |

No hay datos publicados de calidad funcional, tasa de rechazo, ni evaluacion multimodal para este pack.

## Requisitos de hardware

- VRAM estimada para pesos: el payload publicado es de 97,67 GiB, por lo que se necesita un minimo practico de ~98-100 GiB solo para los pesos, mas overhead de runtime (tabla n-gram, embeddings, cabeza MTP, torre de vision y buffers de ejecucion).
- Cache KV para 262.144 tokens: no disponible; no se publican el numero de capas ni la configuracion de atencion necesaria para calcularlo.
- GPU recomendadas (estimacion derivada del tamano): configuraciones multi-GPU de 80 GB, como 2x A100 80 GB o 2x H100 80 GB; una H200 de 141 GB o una B200 serian opciones de GPU unica.
- GPU de consumo: no cabe. Un solo acelerador de 24 GB (RTX 4090, 3090) es muy inferior al payload de pesos.
- DGX Spark: el autor indica explicitamente que no se ha probado la carga en un unico Spark y que no debe inferirse que quepa a partir del bitrate.
- Opciones de despliegue: exclusivamente exllamav3 (libreria declarada), construyendo el fork vcruz305/exllamav3 mediante la receta Qwen3.8-Flash-Next-EXL3-DGX-Spark, en el pin de fork medido. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits | Fidelidad publicada | Licencia |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-EXL3-SAGE-3.87bpw | ~32,84 B | 262.144 | EXL3 SAGE 3,87 bpw | Top-1 93,89% held-out y 93,64% independiente frente a BF16 | qwen-community-license-1.0 |
| CYBER-FROST-3.8-EXL3-SAGE-3.5bpw | ~32,84 B (mismo padre) | no disponible | EXL3 SAGE 3,5 bpw | Top-1 86,96% held-out y 85,16% independiente frente a FP8 | qwen-community-license-1.0 |
| CYBER-FROST-3.8-FP8 (padre) | ~32,84 B | no disponible | FP8 | referencia de comparacion del pack de 3,5 bpw | no disponible en la informacion |
| CYBER-FROST-3.8-BF16 (padre) | ~32,84 B | no disponible | BF16 | referencia de comparacion de este pack | no disponible en la informacion |

Advertencia de comparabilidad: las cifras del pack de 3,5 bpw se midieron contra el release FP8, mientras que las del pack de 3,87 bpw se midieron contra el BF16. Al no compartir referencia, las dos series de top-1 y KL no son directamente comparables entre si.

## Limitaciones y advertencias

- Es un artefacto de cuantizacion: no anade entrenamiento ni corrige sesgos del padre. Cualquier comportamiento problematico del BF16 se hereda.
- Riesgo de alucinacion: no hay evaluacion publicada de veracidad ni de tasa de alucinacion en este pack. En dominios de seguridad, una salida incorrecta puede tener consecuencias operativas.
- La reduccion de falsos rechazos es un objetivo de diseno heredado, no un comportamiento medido en este release.
- Authorization es un control externo: el modelo no puede establecer propiedad, consentimiento, reglas de enfrentamiento, jurisdiccion ni si un objetivo esta en alcance. El despliegue debe imponer identidad, scope, permisos de herramienta, registro, limites de tasa y revision humana.
- Capacidad multimodal no validada: aunque se incluyen torre de vision y processor, no se ha evaluado la calidad de imagen o video. No debe inferirse capacidad multimodal.
- Idiomas soportados: no disponible; no hay evaluacion multilingue publicada.
- Licencia: qwen-community-license-1.0 bajo el campo `other`. Es una licencia con condiciones especificas de la comunidad Qwen; debe revisarse el fichero `LICENSE` del repositorio antes de cualquier uso comercial o redistribucion.
- Compatibilidad de runtime restringida: requiere exllamav3, y en concreto el fork y el pin indicados en DEPLOY.md. No hay soporte declarado para otros motores ni formato GGUF.
- Estado del release: investigacion publica bajo evaluacion de calidad activa, con 0 descargas y 1 like en el momento de la ficha.
- Sin evaluacion de encaje en hardware de gama unica: la carga en un unico DGX Spark no se ha probado. No debe inferirse del bitrate.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vcruz305/CYBER-FROST-3.8-EXL3-SAGE-3.87bpw
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Release FP8: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-FP8
- Pack anterior de 3,5 bpw: https://huggingface.co/vcruz305/CYBER-FROST-3.8-EXL3-SAGE-3.5bpw
- Organizacion Blackfrost-AI: https://huggingface.co/Blackfrost-AI
- Fork de exllamav3: https://github.com/vcruz305/exllamav3
- Receta Qwen3.8-Flash-Next-EXL3-DGX-Spark: https://github.com/vcruz305/Qwen3.8-Flash-Next-EXL3-DGX-Spark-recipe
- Guia de despliegue: DEPLOY.md (incluida en el repositorio)
- Paper o blog tecnico del modelo: no disponible
