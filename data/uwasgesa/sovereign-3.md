# Uwasgesa/Sovereign-3

## Resumen

Sovereign-3 es el repositorio publicado por el usuario Uwasgesa en Hugging Face que redistribuye los pesos de Kimi K3, el modelo multimodal nativo y agéntico de Moonshot AI. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 2.779.931.837.184 parámetros totales (aproximadamente 2,78 billones) y 104.000 millones de parámetros activos por token, construido sobre Kimi Delta Attention (KDA) y Attention Residuals (AttnRes). Su ventana de contexto alcanza el millón de tokens y procesa texto, imágenes y vídeo dentro del mismo modelo.

El repositorio se distribuye en formato safetensors con cuantización de 8 bits mediante compressed-tensors, ocupa 1561 GB y declara el pipeline image-text-to-text. La model card reproduce íntegramente la documentación oficial de Kimi K3 de Moonshot AI, incluidos logotipos, enlaces al blog técnico y al informe completo, por lo que debe interpretarse como una réplica no oficial y no como un modelo independiente desarrollado por el autor del repositorio.

Su relevancia radica en que Kimi K3 se presenta como el primer modelo abierto de clase 3T, pensado para código de horizonte largo, trabajo de conocimiento agéntico y razonamiento con contexto extremadamente largo. No obstante, el repositorio no incluye resultados de evaluación propios, no declara idiomas soportados y acumula cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (~2,78 billones) |
| Parametros activos | 104.000 millones (16 de 896 expertos por token) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8 bits (compressed-tensors); pesos safetensors. No se detallan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (license: other, license_name: "kimi-k3") |
| Formato de pesos | safetensors y compressed-tensors (8 bits), cargables con transformers |
| Numero de capas | 93 (1 capa densa) |
| Composicion de capas de atencion | 69 KDA + 24 Gated MLA |
| Dimension oculta de atencion | 7168 |
| Numero de cabezas de atencion | 96 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Tamano del repositorio | 1561 GB |
| Pipeline declarado | image-text-to-text |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Kimi K3 combina dos innovaciones de atencion: Kimi Delta Attention (KDA), presente en 69 de las 93 capas, y Gated MLA en las 24 restantes, junto con un mecanismo denominado Attention Residuals (AttnRes). El bloque MoE emplea un marco Stable LatentMoE que incrementa la dispersión respecto a Kimi K2: activa 16 expertos de un total de 896 por token, con una dimensión latente de 3584 y una dimensión oculta de 3072 por experto. Según la model card, este diseño aporta una mejora aproximada de 2,5 veces en eficiencia de escalado global frente a Kimi K2.

La información proporcionada no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. Sí se declara la multimodalidad nativa (texto, imagen y vídeo en el mismo modelo) y la orientación a tareas agénticas de horizonte largo, como optimización de kernels de GPU, desarrollo de compiladores, visión en el bucle para desarrollo de videojuegos, CAD y diseño de chips. El repositorio Sovereign-3 no añade información propia sobre el proceso de entrenamiento ni sobre el procedimiento de cuantización aplicado, más allá de la etiqueta 8-bit y el uso de compressed-tensors.

## Capacidades

- Generacion de texto, razonamiento y trabajo de conocimiento de extremo a extremo.
- Codigo de horizonte largo: sesiones de ingenieria prolongadas, navegacion de repositorios grandes y orquestacion de herramientas de terminal.
- Comprension nativa de imagen y video, ademas de texto, dentro de un unico modelo.
- Contexto de 1.000.000 de tokens, adecuado para documentos y bases de codigo extensas.
- Comportamiento agente: la model card menciona supervision humana minima y orquestacion de herramientas, aunque no se especifica el formato exacto de tool calling o function calling.
- Generacion de visualizaciones interactivas, widgets y paneles para investigacion y analisis.
- Diseno en movimiento y edicion de video asistidos.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de pensamiento explicito o modos de razonamiento dedicados: no disponible en la informacion proporcionada.
- Soporte de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Agente de ingenieria de software de horizonte largo: con 1.000.000 de tokens de contexto puede mantener el estado de un repositorio extenso y encadenar iteraciones de edicion, compilacion y pruebas sin perder el hilo, lo que encaja con el escenario de "long-horizon coding" descrito por el autor.
- Orquestacion de terminal y CI/CD: el modelo esta disenado para invocar herramientas de linea de comandos, de modo que puede integrarse como planificador en pipelines que ejecuten builds, tests y despliegues bajo supervision humana minima.
- Investigacion profunda automatizada: generacion de informes extensos con visualizaciones, paneles y widgets a partir de grandes volumenes de documentacion, aprovechando la ventana de contexto y la salida multimodal.
- Analisis de video y documentos visuales: al ser multimodal nativo, permite extraer conclusiones de grabaciones, capturas o diagramas junto con el texto asociado, sin necesidad de encadenar modelos separados.
- Atencion al cliente sobre documentacion masiva: la ventana de un millon de tokens permite cargar manuales, contratos y bases de conocimiento completas y responder consultas multi-turno con trazabilidad sobre la fuente.
- Revision de documentacion tecnica y legal extensa: lectura cruzada de normativas, especificaciones o expedientes largos donde la coherencia a lo largo de cientos de miles de tokens es determinante.
- Asistencia en diseno de hardware y CAD: la model card menciona explicitamente optimizacion de kernels de GPU, desarrollo de compiladores y diseno de chips como areas objetivo, lo que lo situa como copiloto en flujos de ingenieria especializada.
- Edicion de video y diseno en movimiento asistidos por lenguaje natural, usando la comprension de video del propio modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye la etiqueta "eval-results", pero no se han facilitado cifras concretas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni en la informacion de Hugging Face ni en el extracto de la model card. Tampoco se ofrecen comparaciones numericas con Kimi K2 u otros modelos.

## Requisitos de hardware

- Peso estimado en BF16: aproximadamente 5,56 TB (2,78 billones de parametros a 2 bytes por parametro).
- Peso estimado en 8 bits: aproximadamente 2,78 TB, coherente con la etiqueta 8-bit del repositorio.
- Peso estimado en 4 bits: aproximadamente 1,39 TB, cifra teorica de referencia; el repositorio no publica una version de 4 bits.
- El repositorio ocupa 1561 GB, por debajo de los ~2,78 TB que exigiria un almacenamiento homogeneo de 8 bits para 2,78 billones de parametros; el autor no detalla la composicion de precision ni si el repo contiene un subconjunto de los pesos.
- GPU recomendadas: despliegue en nodos multi-GPU con H100, H200 o B200 de 80-192 GB por tarjeta, o A100 de 80 GB en configuraciones de tensor parallelism amplio. No se dispone de una configuracion de referencia publicada.
- GPU de consumo: no cabe en ninguna GPU de consumo actual. Una RTX 4090 con 24 GB queda descartada incluso aplicando cuantizaciones agresivas, dado que el modelo completo supera el terabyte.
- Opciones de despliegue: al distribuirse en safetensors y compressed-tensors para transformers, los caminos habituales son vLLM, SGLang o TGI con paralelismo tensorial, ademas de la propia libreria transformers. No se documenta soporte de llama.cpp, Ollama ni GGUF en la informacion proporcionada.
- Latencia y throughput: no disponible. Como referencia de orden de magnitud, el coste de computo por token corresponde a un modelo de 104.000 millones de parametros activos, mientras que el requisito de memoria corresponde al total de 2,78 billones.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de su documentacion publica y no forman parte de la informacion suministrada para esta ficha; conviene verificarlos antes de citarlos. La fila de Sovereign-3 si procede de la informacion disponible.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sovereign-3 (copia de Kimi K3) | ~2,78 billones | 104.000 millones | 1.000.000 tokens | kimi-k3 (other) | Hugging Face, repo de 1561 GB, 0 descargas |
| Kimi K3 (original, Moonshot AI) | ~2,8 billones | 104.000 millones | 1.000.000 tokens | kimi-k3 | Hugging Face bajo el espacio moonshotai |
| Kimi K2 (Moonshot AI) | ~1 billon | 32.000 millones | 128.000 tokens | licencia modificada tipo MIT | Hugging Face |
| DeepSeek-V3 | 671.000 millones | 37.000 millones | 128.000 tokens | licencia de modelo derivada de MIT | Hugging Face |

La diferencia principal de Sovereign-3 frente al Kimi K3 oficial no es tecnica sino de procedencia: se trata de una republicacion bajo el espacio de nombres de un tercero, con la misma arquitectura declarada, sin resultados de evaluacion propios y sin metricas de uso.

## Limitaciones y advertencias

- Procedencia no oficial: el repositorio pertenece al usuario Uwasgesa y no a Moonshot AI, pese a reproducir la model card, los logotipos y los enlaces del fabricante original. Conviene contrastar la integridad de los pesos antes de cualquier uso en produccion.
- Sin evidencia de evaluacion: cero descargas y cero likes, y ninguna cifra de benchmark publicada, lo que impide validar el rendimiento real del artefacto distribuido.
- Cuantizacion de 8 bits: la reduccion de precision respecto a los pesos originales puede degradar la calidad, especialmente en tareas de razonamiento largo o de codigo, sin que el autor documente el impacto.
- Licencia: se declara "kimi-k3" con license: other. No se detallan en la informacion disponible las condiciones exactas (atribucion, limites de uso comercial, restricciones por escala); es imprescindible leer el texto completo de la licencia antes de un despliegue comercial.
- Idiomas: no se declara la cobertura linguistica, por lo que no puede asumirse un rendimiento fiable en castellano sin una evaluacion previa.
- Alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de fidelidad; en un modelo con ventana de un millon de tokens el riesgo de mezclar informacion de distintas partes del contexto es relevante.
- Sesgos: no disponible. No hay informacion sobre composicion del dataset ni sobre analisis de sesgos.
- Coste de infraestructura: el requisito de memoria (del orden de terabytes) excluye el despliegue en hardware de consumo y limita el uso a clústeres con multiples aceleradores.
- Riesgo de fijacion de version: al ser una copia sin mantenimiento declarado, no hay garantia de actualizaciones, parches ni soporte por parte del autor.
- Las busquedas web realizadas devuelven resultados sobre el concepto generico de "IA soberana" y sobre proveedores de servicios, no sobre este modelo concreto, por lo que no aportan informacion tecnica adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Uwasgesa/Sovereign-3
- Organizacion de Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Licencia de Kimi K3: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Blog tecnico de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio en GitHub (ruta implicita del informe): https://github.com/MoonshotAI/Kimi-K3
- Sitio de chat de Kimi: https://www.kimi.com
- Sitio de Moonshot AI: https://www.moonshot.ai
- Twitter de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- Organizacion en ModelScope: https://modelscope.cn/organization/moonshotai
- Resultados de busqueda web consultados (no relacionados con este modelo, tratan sobre el concepto de IA soberana): https://www.asksovereign.com/models, https://www.aimadetools.com/blog/sovereign-ai-models-2026, https://sovereigneg.com/models, https://www.sovereigncompute.news/p/three-models-of-sovereign-ai, https://atos.net/en/services/ai-atos-sovereign-agentic-studios
