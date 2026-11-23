# YuCollection/Maxwell-V1-Flash

## Resumen

Maxwell-V1-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Maxwell, publicado en Hugging Face bajo el identificador YuCollection/Maxwell-V1-Flash. Segun la model card, cuenta con 35.000 millones de parametros totales y 3.000 millones de parametros activos por token (ambos excluyendo embeddings), aunque el recuento real de pesos en safetensors asciende a 36.810.559.422 parametros. Esta disenado para razonamiento, tareas agenticas y contextos largos con un coste de inferencia contenido, gracias a su reducida activacion por token.

El modelo incorpora innovaciones tecnicas destacables: Maxwell Block Sparse Attention (MBSA), que limita la atencion principal a 4096 tokens por grupo KV manteniendo disponible el cache KV completo; conexiones residuales multiples con agregacion aprendida (Manifold-Constrained Hyper-Connections); y un backbone MoE de grano fino con expertos compartidos siempre activos. Soporta contextos de hasta 256.000 tokens y fue preentrenado con aproximadamente 26 billones de tokens de datos multilingues.

Su relevancia actual radica en la combinacion de una ventana de contexto muy amplia con un coste de inferencia propio de un modelo de 3B activos, lo que lo posiciona como candidato para despliegues de agentes y procesamiento de documentos largos en hardware moderado. La licencia Apache 2.0 facilita su adopcion comercial, si bien la informacion publica disponible es todavia escasa (cero descargas y cero likes en el momento de la consulta, repositorio creado en noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Maxwell Block Sparse Attention y Hyper-Connections |
| Parametros totales | 35B segun model card; 36.810.559.422 segun safetensors |
| Parametros activos | 3B por token (excluyendo embeddings) |
| Longitud de contexto | Hasta 256.000 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | Multilingue; tokenizador sensible al alfabeto con cobertura de lenguas del sudeste asiatico (thai, lao, myanmar, khmer, shan) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal de tipo MoE de grano fino, en la que se combinan expertos enrutados con expertos compartidos siempre activos, apoyados por un sesgo de correccion de enrutamiento dinamico y una perdida ligera de equilibrio de carga por secuencia. La atencion se basa en Maxwell Block Sparse Attention (MBSA): cada grupo KV mantiene cobertura fija de 8 bloques de prefijo y 8 bloques locales de 128 tokens, y anade hasta 16 bloques remotos seleccionados por un indexador aprendido, acotando la atencion principal a 4096 tokens por grupo KV mientras el cache KV de historial completo permanece accesible. El kernel MBSA es, segun la model card, 6,7 veces mas rapido que GQA denso a 256K. Ademas, las Manifold-Constrained Hyper-Connections introducen multiples flujos residuales con agregacion dependiente de la entrada y mezcla restringida, ampliando el flujo de informacion sin incrementar las evaluaciones de atencion ni de feed-forward.

El preentrenamiento utilizo aproximadamente 26 billones de tokens multilingues con el optimizador Muon en la mayoria de las matrices de pesos ocultas. El entrenamiento comienza en modo denso; la atencion block-sparse se introduce a 128K durante el mid-training, una vez calentado el indexador contra atencion densa de historial completo, y despues se entrena conjuntamente con el backbone. La longitud de secuencia se extiende por etapas de 4K a 256K. El post-entrenamiento consta de un SFT en dos etapas (capacidades generales, razonamiento y agenticas, seguidas de problemas de razonamiento mas dificiles y trayectorias de agente) y ramas de RL independientes para tareas generales, razonamiento verificable (matematicas, ciencia, logica, codigo) y tareas agenticas (busqueda, uso de terminal, function calling, ingenieria de software), fusionadas mediante destilacion on-policy multi-profesor.

## Capacidades

- Generacion de texto conversacional y causal en modo texto unicamente.
- Razonamiento reforzado mediante RL en dominios verificables: matematicas, ciencia, logica y codigo.
- Capacidades agenticas entrenadas explicitamente: busqueda, uso de terminal, function calling e ingenieria de software.
- Soporte de tool calling / function calling, segun las ramas de RL descritas en la model card.
- Razonamiento multi-paso y trayectorias de agente.
- Procesamiento de contexto largo de hasta 256.000 tokens con cache KV de historial completo.
- Capacidades multilingues, con tokenizador optimizado para lenguas del sudeste asiatico de bajos recursos.
- No se documentan capacidades de vision ni de audio.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 256.000 tokens y a la cache KV de historial completo, manteniendo coherencia en sesiones largas sin truncar contexto.
- Agentes de busqueda web: las ramas de RL cubren explicitamente tareas de busqueda, por lo que el modelo puede planificar consultas, leer resultados y sintetizar respuestas en bucles multi-paso con tool calling.
- Automatizacion de ingenieria de software: con entrenamiento especifico en uso de terminal y software engineering, puede integrarse en pipelines de CI/CD para interpretar errores de build, proponer parches y ejecutar comandos en entornos controlados.
- Analisis de documentos largos: informes, expedientes o bases de codigo de cientos de miles de tokens caben en contexto, permitiendo resumen, extraccion de entidades y preguntas sobre el documento completo en una sola pasada.
- Razonamiento matematico y cientifico verificable: el RL sobre dominios verificables lo hace adecuado para tutoria, generacion de soluciones paso a paso y validacion de derivaciones.
- Procesamiento multilingue en el sudeste asiatico: el tokenizador sensible al alfabeto reduce el coste por token en thai, lao, myanmar, khmer y shan, lo que lo hace util para localizacion y atencion al cliente en esos idiomas.
- Despliegue de bajo coste en produccion: con solo 3B parametros activos por token, el coste por inferencia es comparable al de un modelo denso de 3B, lo que permite servir cargas concurrentes en hardware modesto.

## Benchmarks y rendimiento

La model card referencia una imagen (`assets/performance-overview.svg`) con resultados comparativos en razonamiento, busqueda agentica y otras capacidades, pero los valores numericos no estan incluidos en la informacion textual proporcionada. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 74 GB solo para pesos, mas cache KV; requiere multiples GPU.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 37 GB de pesos; viable en una A100 80GB o H100.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 19 GB de pesos; podria caber en una RTX 4090 de 24 GB, aunque no se distribuyen pesos GGUF oficiales y habria que generarlos.
- GPU recomendadas: H100 o A100 80GB para BF16; RTX 4090 o L40S para cuantizaciones bajas.
- Opciones de despliegue: al requerir `custom_code` y kernels propios de MBSA, la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada; la model card no detalla el stack de inferencia recomendado.
- Latencia y throughput: no disponibles. El autor afirma que el kernel MBSA es 6,7 veces mas rapido que GQA denso a 256K, pero no se aportan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Maxwell-V1-Flash | 35B / 3B | 256K | Apache 2.0 | Hugging Face (YuCollection) |
| Alternativas MoE de tamano comparable | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo solo de texto: no soporta vision ni audio.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas de error ni evaluaciones de factualidad.
- La model card no detalla sesgos conocidos ni resultados de evaluaciones de seguridad.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-23); se trata de una publicacion muy reciente sin validacion independiente.
- Requiere `custom_code` y kernels propios (MBSA), lo que puede complicar el despliegue en frameworks estandar y aumentar el riesgo de incompatibilidades.
- La lista de idiomas no esta formalmente declarada; la cobertura multilingue se infiere de la descripcion del tokenizador.
- No se distribuyen pesos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que obliga a cuantizar manualmente para hardware de consumo.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar la procedencia y los terminos de los datos de entrenamiento, no detallados en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/YuCollection/Maxwell-V1-Flash
- Model card de referencia citada: https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Pagina oficial: https://maxwell-llm.ai/
- Playground: https://maxwell-llm.ai/playground
- GitHub: https://github.com/maxwell-model/Maxwell-V1-Flash
- Informe tecnico: https://github.com/maxwell-model/Maxwell-V1-Flash/blob/main/Maxwell_v1_flash_tech_report.pdf
