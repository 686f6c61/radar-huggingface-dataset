# stealth-model/GLM-5.3-Flash-GGUF

## Resumen

GLM-5.3-Flash-GGUF es la distribución en formato GGUF del modelo GLM-5.3-Flash de Z.ai, publicada por el colectivo Stealth Models. Se trata de una conversión a llama.cpp del modelo original en pesos abiertos, con 320.759.404.382 parámetros totales (unos 320,8 mil millones) según los datos de safetensors del modelo base. La model card identifica el modelo como el que Stealth Models había seguido bajo el nombre en clave «Ox Alpha» antes de que Z.ai lo revelara públicamente; el repositorio incluye referencias a esa campaña de seguimiento y a la benchmark propia del colectivo, StealthMark.

El interés de esta ficha no está en un modelo nuevo, sino en la disponibilidad práctica de un modelo de escala 320B en hardware de consumo y de gama de estación de trabajo. El repositorio ofrece dos niveles de cuantización: IQ2_XXS (102 GB en cuatro partes) y Q5_K_XL (240 GB en seis partes), además de un proyector multimodal mmproj-F16 de 1,1 GB que habilita entrada de imagen. La licencia declarada es MIT, heredada del modelo base.

El modelo está pensado para inferencia local con llama.cpp y soporta ejecución híbrida GPU/CPU mediante el flag `--n-cpu-moe`, lo que sugiere una arquitectura de mezcla de expertos (MoE) en la que las capas de expertos pueden residir en memoria del sistema. No se han publicado en la información disponible la longitud de contexto, los idiomas soportados, los parámetros activos ni los detalles del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita; el flag `--n-cpu-moe` de llama.cpp indica arquitectura de mezcla de expertos (MoE) con capas de expertos descargables a RAM |
| Parametros totales | 320.759.404.382 (~320,8 B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ2_XXS (102 GB, 4 partes, con imatrix) y Q5_K_XL (240 GB, 6 partes); proyector multimodal mmproj-F16 (1,1 GB) |
| Idiomas soportados | No disponible |
| Licencia | MIT (heredada de zai-org/GLM-5.3-Flash; se incluye el fichero de licencia) |
| Formato de pesos | GGUF dividido en múltiples partes, más mmproj-F16.gguf para entrada de imagen |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. La única evidencia técnica es indirecta: el flag `--n-cpu-moe` que la model card recomienda para mantener las capas de expertos en memoria del sistema apunta a un transformer con mezcla de expertos (MoE), patrón habitual en la familia GLM de Z.ai. El tamaño de 320,8 mil millones de parámetros totales y la existencia de una cuantización IQ2_XXS de 102 GB son coherentes con un modelo MoE de gran tamaño y activación dispersa, pero no se confirma el número de parámetros activos ni el número de expertos.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüe), sobre las etapas de alineación (RLHF, DPO u otras) ni sobre innovaciones técnicas específicas. La cuantización IQ2_XXS se ha generado con importance matrix (etiqueta `imatrix`), lo que indica un proceso de calibración para reducir la pérdida de calidad en cuantizaciones de muy baja precisión. El repositorio no documenta el proceso de conversión ni las herramientas exactas empleadas más allá de llama.cpp.

Cabe señalar que Stealth Models actúa como tercero: el desarrollo del modelo corresponde a Z.ai y este repositorio es una redistribución cuantizada. La model card, además, está construida en torno a la narrativa de «modelo stealth» (Ox Alpha) y a la benchmark propietaria del colectivo, no a documentación técnica del entrenamiento.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el uso de `--jinja` (plantillas de chat Jinja) indican soporte de diálogo multi-turno con plantilla de chat integrada.
- Entrada de imagen: el fichero `mmproj-F16.gguf` (1,1 GB) habilita procesamiento visual en llama.cpp, por lo que el modelo es multimodal texto-imagen en esta distribución.
- Razonamiento y composición de escenas visuales: los resultados de StealthMark muestran un rendimiento comparativamente alto en tareas de composición global de escena (Beach 77,7; Selfie 76,6) frente a tareas de razonamiento más abstracto.
- Ejecución local en llama.cpp: compatibilidad documentada con `llama-server` y carga multi-parte automática desde el primer fichero.
- Descarga parcial de expertos a CPU: soporte de `--n-cpu-moe` para ejecutar el modelo cuando no cabe íntegramente en VRAM.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con el endpoint de inferencia de HuggingFace, aunque no se detalla.
- No disponible: soporte explícito de tool calling / function calling, capacidades de agente multi-paso, modo «thinking», audio, y lista de idiomas soportados. La información proporcionada no los confirma ni los descarta.

## Casos de uso

- Asistente conversacional local con privacidad de datos: al ejecutarse íntegramente en hardware propio mediante llama.cpp, el modelo permite desplegar un asistente multi-turno sin enviar prompts a servicios externos, algo relevante en entornos con requisitos de soberanía del dato.
- Análisis de documentos e imágenes combinados: el proyector `mmproj-F16` permite pasar capturas, diagramas o fotografías junto con texto, útil para tareas de descripción, extracción de información o respuesta a preguntas sobre imágenes.
- Estación de trabajo de gama alta con 128 GB de memoria unificada: con la cuantización IQ2_XXS (102 GB) el modelo cabe en equipos como un Mac de 128 GB, un DGX Spark o un Strix Halo, lo que habilita prototipado de aplicaciones sobre un modelo de 320B sin clúster.
- Servidores con GPU de 32 GB más 96 GB de RAM: la configuración recomendada por el autor para IQ2_XXS permite servir el modelo en una sola máquina con descarga de expertos a memoria del sistema, adecuado para equipos de investigación con presupuesto limitado.
- Evaluación comparativa de cuantizaciones: disponer de IQ2_XXS e Q5_K_XL del mismo modelo permite medir empíricamente la degradación de calidad por cuantización en tareas propias, un caso de uso metodológico habitual en investigación aplicada.
- Generación y edición de descripciones visuales en pipelines creativos: dado el rendimiento relativo del modelo en tareas de composición de escena (77,7 en Beach), puede emplearse para generar o enriquecer descripciones de imágenes en flujos de trabajo de diseño y documentación.
- Despliegue en infraestructura sin acceso a la nube: para organizaciones con requisitos regulatorios que impiden usar APIs externas, la licencia MIT y el formato GGUF facilitan la integración en servidores on-premise con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU) en la información disponible. Los únicos datos provienen de StealthMark 1.8.8, la benchmark propietaria del publicador, que no es directamente comparable con las suites académicas habituales:

| Prueba (StealthMark 1.8.8) | Resultado |
|---|---|
| Puntuación global | 48,5 / 100 |
| Inteligencia general | 42,3 |
| Inteligencia visual | 59,4 |
| Beach | 77,7 |
| Selfie | 76,6 |
| Ground Truth | 63,8 |
| Raccoon | 55,1 |
| Mona Lisa | 49,5 |
| Foresight | 47,0 |
| Newton's Mirror | 27,6 |
| Latch | 4,0 (ejecución parcial, 3 de 5 niveles) |

Estos valores deben interpretarse con cautela: proceden del propio distribuidor del modelo, la escala y metodología de StealthMark no están documentadas en la información disponible, y el resultado de Latch corresponde a una ejecución incompleta. No se ofrece comparación numérica con otros modelos dentro de la misma suite más allá de la referencia a Qwen3.8-27B como «el mejor modelo local en nuestras pruebas», sin cifras.

## Requisitos de hardware

- VRAM/RAM para Q5_K_XL: 240 GB repartidos en seis ficheros; el autor lo indica para máquinas con 256 GB o más de memoria combinada (GPU + RAM del sistema).
- VRAM/RAM para IQ2_XXS: 102 GB en cuatro ficheros; es la cuantización mínima recomendada. Cabe en un Mac de 128 GB, un DGX Spark, un Strix Halo, o en una GPU de 32 GB combinada con 96 GB de RAM del sistema.
- Proyector multimodal: 1,1 GB adicionales para `mmproj-F16.gguf` si se requiere entrada de imagen.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible. Por capacidad de memoria, IQ2_XXS encajaría en GPUs de 80 GB (A100/H100) solo con descarga parcial de expertos a RAM; Q5_K_XL exige configuraciones multi-GPU o memoria unificada de 256 GB o superior.
- ¿Cabe en GPU de consumo? No de forma íntegra. Una RTX 4090 (24 GB) no puede alojar ninguna de las dos cuantizaciones completas; requeriría `--n-cpu-moe` con un volumen de RAM del sistema muy elevado, no documentado como configuración soportada.
- Opciones de despliegue: llama.cpp mediante `llama-server` (comando documentado con `--mmproj` y `--jinja`). No se documentan vLLM, TGI, Ollama ni otras herramientas en la información disponible.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni tiempos de carga para ninguna de las configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-GGUF (este) | 320,8 B totales (activos no disponibles) | No disponible | StealthMark 48,5/100; visual 59,4 | MIT | GGUF en HF, 0 descargas, 1 like |
| zai-org/GLM-5.3-Flash (base) | 320,8 B totales | No disponible | Mismo modelo sin cuantizar; sin cifras publicadas en esta información | MIT | Pesos originales en HuggingFace |
| Qwen3.8-27B | ~27 B (según denominación; no confirmado) | No disponible | Citado por el autor como «el mejor modelo local en nuestras pruebas», sin cifras | No disponible | No disponible en esta información |

La comparación con Qwen3.8-27B es la única que aporta el propio publicador, y lo hace de forma cualitativa y remitiendo a una página externa de comparación. No hay datos que permitan situar a GLM-5.3-Flash frente a otros modelos de escala similar (por ejemplo, otros MoE abiertos de trescientos mil millones de parámetros) en tareas estándar.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se publican datos de entrenamiento, contexto máximo, idiomas, parámetros activos ni proceso de alineación, lo que impide evaluar sesgos o cobertura lingüística.
- Riesgo de alucinación no caracterizado: sin resultados en benchmarks de factualidad ni documentación sobre mitigaciones, no hay base para estimar la tasa de alucinación en producción.
- Resultado muy bajo en Latch (4,0 sobre una ejecución parcial de 3 de 5 niveles) y bajo en Newton's Mirror (27,6): indican debilidad en las tareas específicas que miden esas pruebas, cuyo contenido no está documentado.
- Benchmarks no verificables de forma independiente: StealthMark es una suite propietaria del distribuidor, sin metodología publicada en esta información, y los resultados los proporciona la misma parte interesada.
- Adopción prácticamente nula: 0 descargas y 1 like en el momento de la consulta implican que no existe validación por parte de la comunidad ni reportes independientes de calidad.
- Requisitos de hardware extremos: 102 GB como mínimo y 240 GB para calidad casi completa excluyen su uso en estaciones de trabajo convencionales y complican cualquier despliegue en producción con latencia predecible.
- Repositorio de 2543,2 GB: el tamaño total del repo complica la descarga, el almacenamiento en caché y la replicación en pipelines de CI.
- Licencia MIT heredada: aunque permisiva para uso comercial, la licencia del modelo base es responsabilidad de Z.ai; conviene verificar el fichero de licencia incluido y los términos del repositorio original antes de un uso comercial.
- Idioma de la documentación: la model card está íntegramente en inglés y no declara idiomas soportados, por lo que el rendimiento en castellano no está verificado.
- La ficha se basa en una model card con fuerte componente de marketing («modelo stealth», «Ox Alpha») que no sustituye a documentación técnica.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo: los enlaces encontrados tratan sobre la palabra inglesa «stealth», una tienda de accesorios y una película de 2005, sin relación con GLM-5.3-Flash.

## Enlaces

- Repositorio GGUF: https://huggingface.co/stealth-model/GLM-5.3-Flash-GGUF
- Árbol de ficheros: https://huggingface.co/stealth-model/GLM-5.3-Flash-GGUF/tree/main
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Model card de Ox Alpha: https://huggingface.co/stealth-model/ox-alpha
- Resultados StealthMark del modelo: https://stealthmodels.com/benchmarks/models/glm-5.3-flash
- Leaderboard StealthMark: https://huggingface.co/spaces/stealth-model/stealthmark
- Comparativa con Qwen3.8-27B: https://stealthmodels.com/compare/glm-5.3-flash-vs-qwen3.8-27b
- Sitio del publicador: https://stealthmodels.com/
- Perfil del publicador en HuggingFace: https://huggingface.co/stealth-model
- Paper, blog técnico o repositorio de código del modelo base: no disponibles en la información proporcionada.
