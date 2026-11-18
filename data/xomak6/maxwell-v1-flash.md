# xomak6/Maxwell-V1-Flash

## Resumen

Maxwell-V1.0-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el Maxwell Team, publicado en Hugging Face bajo el identificador `xomak6/Maxwell-V1-Flash`. Se trata de un modelo causal de solo texto con 35B parametros totales y 3B parametros activos por token (ambas cifras excluyendo embeddings), disenado para razonamiento, uso agentico y contexto largo con un coste de inferencia contenido.

El modelo destaca por su atencion dispersa por bloques (Maxwell Block Sparse Attention, MBSA), que limita la atencion principal a 4096 tokens por grupo KV manteniendo disponible la cache KV completa, y por un backbone MoE de grano fino con expertos compartidos siempre activos. Soporta contextos de hasta 256K tokens y fue preentrenado con aproximadamente 26T tokens de datos multilingues.

Es relevante ahora porque propone una relacion parametros totales/activos muy agresiva (35B/3B), lo que lo situa en la categoria de modelos que buscan calidad de modelos grandes con coste de inferencia de modelos pequenos, compitiendo directamente con propuestas MoE de contexto largo. El repositorio ocupa 73,6 GB y los pesos estan en formato safetensors con codigo personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Maxwell Block Sparse Attention (MBSA) y manifold-constrained hyper-connections |
| Parametros totales | 35B (excluyendo embeddings); 36.810.559.422 segun safetensors |
| Parametros activos | 3B por token (excluyendo embeddings) |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingue (tokenizador script-aware con enfasis en lenguas del sudeste asiatico); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code` y tag `maxwell_moe`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de tipo MoE con un backbone mayoritariamente disperso: combina expertos enrutados de grano fino con expertos compartidos siempre activos, y emplea un sesgo de correccion de enrutamiento dinamico junto con una perdida de balanceo de carga ligera por secuencia. La innovacion principal es la Maxwell Block Sparse Attention (MBSA): cada grupo KV mantiene cobertura fija de 8 bloques prefijo y 8 bloques locales de 128 tokens, y anade hasta 16 bloques remotos seleccionados por un indexador aprendido, acotando la atencion principal a 4096 tokens por grupo KV mientras la cache KV de historial completo sigue disponible. Segun la model card, el kernel de MBSA es 6,7x mas rapido que GQA denso a 256K. Ademas incorpora manifold-constrained hyper-connections: multiples flujos residuales con agregacion aprendida dependiente de la entrada y mezcla restringida, ampliando el flujo de informacion sin evaluaciones extra de atencion ni feed-forward.

El preentrenamiento uso aproximadamente 26T tokens de datos multilingues con el optimizador Muon en la mayoria de matrices de pesos ocultas. El entrenamiento comienza denso y la atencion block-sparse entra a 128K a mitad de entrenamiento, tras calentar el indexador contra atencion densa de historial completo, y luego se entrena conjuntamente con el backbone. La longitud de secuencia se extiende por etapas de 4K a 256K. El post-entrenamiento consta de SFT en dos etapas (general, razonamiento y agentico), ramas RL independientes para tareas generales, razonamiento verificable (matematicas, ciencia, logica, codigo) y tareas agenticas (busqueda, uso de terminal, function calling, ingenieria de software), y finalmente destilacion on-policy multi-profesor que fusiona las ramas supervisando respuestas generadas por el estudiante.

## Capacidades

- Generacion de texto conversacional y causal en modo solo texto.
- Razonamiento reforzado mediante RL en dominios verificables: matematicas, ciencia, logica y codigo.
- Capacidades agenticas entrenadas explicitamente: busqueda, uso de terminal, function calling y tareas de ingenieria de software.
- Soporte de tool calling / function calling (segun el entrenamiento agentico descrito).
- Razonamiento multi-paso y trayectorias de agente.
- Contexto largo de hasta 256K tokens con cache KV de historial completo.
- Capacidades multilingues con tokenizador script-aware; enfasis declarado en tailandes, lao, birmano, jemer y shan.
- No se menciona soporte de vision ni audio: es un modelo de solo texto.

## Casos de uso

- Atencion al cliente automatizada: conversaciones multi-turno con historial extenso gracias a la ventana de 256K tokens y a la cache KV completa, con coste de inferencia de un modelo de 3B activos.
- Generacion de codigo en produccion: el entrenamiento RL en codigo y las capacidades de function calling permiten integrarlo en pipelines de CI/CD para revision, generacion de parches y automatizacion de tareas de repositorio.
- Agentes autonomos de software: el modelo fue entrenado en trayectorias agenticas (terminal, busqueda, ingenieria de software), lo que lo hace adecuado para orquestar tareas de varios pasos sobre entornos de desarrollo.
- Analisis de documentos largos: resumen, extraccion y respuesta sobre contratos, informes o bases de codigo que superan los 100K tokens, aprovechando MBSA para mantener latencia acotada.
- Razonamiento matematico y cientifico asistido: resolucion de problemas verificables donde el RL especifico aporta mejoras sobre SFT puro.
- Procesamiento multilingue en el sudeste asiatico: el tokenizador compacto en tailandes, lao, birmano, jemer y shan reduce el coste por token en lenguas de bajos recursos.
- Despliegue en infraestructura limitada: con 3B parametros activos, el coste por token es comparable al de modelos densos pequenos, lo que facilita servir cargas concurrentes con GPUs de gama alta pero no masivas.

## Benchmarks y rendimiento

La model card referencia una figura (`assets/performance-overview.svg`) con resultados comparativos, pero los valores numericos no estan incluidos en la informacion proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35B parametros totales, en BF16 se requieren aproximadamente 70 GB solo para pesos; en cuantizacion de 8 bits, unos 35 GB; en 4 bits, unos 18-20 GB. Los tipos de cuantizacion oficiales no estan disponibles.
- GPU recomendadas: A100 80GB, H100 80GB o configuraciones multi-GPU para BF16; una RTX 4090 (24 GB) podria alojar versiones cuantizadas a 4 bits, aunque la cache KV para 256K tokens anade requisitos adicionales.
- Cabe en consumer GPU: solo en configuraciones cuantizadas agresivas y con contextos reducidos; no se garantiza para la ventana maxima.
- Opciones de despliegue: al requerir `custom_code` y un kernel MBSA propio, la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada; se recomienda usar el codigo del repositorio oficial.
- Latencia y throughput: no disponibles; la model card solo afirma que el kernel MBSA es 6,7x mas rapido que GQA denso a 256K.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Maxwell-V1.0-Flash | 35B / 3B | 256K | Apache 2.0 | MBSA, MoE de grano fino, destilacion multi-profesor |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se han proporcionado datos de modelos comparables en la informacion disponible; la model card menciona "evaluated comparison models" sin detallarlos en el texto extraido.

## Limitaciones y advertencias

- Modelo de solo texto: no soporta vision ni audio.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse con 26T tokens multilingues es esperable heredar sesgos del corpus.
- Riesgo de alucinacion: no cuantificado en la model card; como todo modelo generativo, requiere verificacion en produccion.
- Limitaciones de contexto o idioma: aunque el contexto maximo es 256K, el rendimiento efectivo a esa longitud no esta documentado con numeros; la lista completa de idiomas no esta disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `custom_code` y un kernel propietario, lo que puede complicar la portabilidad y el cumplimiento en entornos regulados.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card esta incompleta (seccion de especificaciones truncada); la madurez y el soporte comunitario son limitados.
- El identificador del autor (`xomak6`) difiere del enlace de Hugging Face de la model card (`maxwell-model/Maxwell-V1-Flash`), lo que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/xomak6/Maxwell-V1-Flash
- Hugging Face alternativo (segun model card): https://huggingface.co/maxwell-model/Maxwell-V1-Flash
- Web oficial: https://maxwell-llm.ai/
- Playground: https://maxwell-llm.ai/playground
- GitHub: https://github.com/maxwell-model/Maxwell-V1-Flash
- Technical report: https://github.com/maxwell-model/Maxwell-V1-Flash/blob/main/Maxwell_v1_flash_tech_report.pdf
