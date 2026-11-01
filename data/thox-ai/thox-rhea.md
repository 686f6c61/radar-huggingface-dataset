# Thox-ai/Thox-Rhea

## Resumen

Thox-Rhea es una configuración de persona publicada por Thox-ai dentro de su programa de "digital humans". No se trata de un modelo entrenado, sino de un paquete que combina los pesos originales de Qwen/Qwen3-8B (sin modificar, byte a byte) con un perfil de sistema en formato Modelfile y un Knowledge Pack de ocho entradas verificadas. El modelo se distribuye principalmente a través de Ollama con la etiqueta `Thox-ai/thox-rhea`, y el repositorio de HuggingFace contiene únicamente los artefactos de empaquetado: `Modelfile` (1494 B), `manifest.json` (878 B) y `thox-knowledge-v0.1.jsonl` (4652 B).

La persona representa a Rhea, una "People manager" del equipo sintético de THOX, especializada en gestión de personas y coordinación de equipos. El objetivo declarado es ofrecer asistencia local y offline en ese dominio concreto, con respuestas ajustadas al rol y con anclaje factual limitado a las entradas del Knowledge Pack cuando se proporcionan. El modelo base Qwen3-8B aporta la arquitectura transformer, el contexto y las capacidades subyacentes; THOX solo añade la capa de personalidad y el material de grounding.

Es relevante ahora como ejemplo de una tendencia creciente: publicar "personas" empaquetadas sobre modelos abiertos existentes en lugar de fine-tunes completos. Esto reduce costes y mantiene la trazabilidad de los pesos, pero también implica que las capacidades reales son exactamente las del Qwen3-8B subyacente, y que cualquier expectativa de especialización profunda debe calibrarse con esa base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-8B; no se especifica variante concreta en la informacion disponible) |
| Parametros totales | 8B (heredados de Qwen/Qwen3-8B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8.192 tokens en la evaluacion publicada; la ventana nativa del base no se detalla en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (depende de la etiqueta de Ollama `qwen3:8b` utilizada) |
| Idiomas soportados | Ingles (declarado en la model card y en los tags de HuggingFace) |
| Licencia | Apache-2.0 (heredada de Qwen3) |
| Formato de pesos | Modelfile de Ollama + manifest.json + Knowledge Pack JSONL; los pesos se referencian desde la etiqueta `qwen3:8b` fijada por sha256 |

## Arquitectura y entrenamiento

No hay entrenamiento. El repositorio no contiene pesos propios: el `Modelfile` fija el modelo base Qwen/Qwen3-8B mediante la etiqueta de Ollama `qwen3:8b` con el hash `sha256:500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41`, y superpone un perfil de sistema escrito por THOX a partir de su "DigitalHumans Persona Model Kit". Los hechos de rol se corrigieron contra el roster interno de THOX (personas v0.2, 2026-10-31). Según la model card, no se modificaron, fusionaron ni ajustaron pesos.

La innovación técnica, por tanto, no está en el modelo sino en el empaquetado: un perfil de sistema persistente, un manifiesto de release con el pin del base y un Knowledge Pack en JSONL con ocho entradas públicas verificadas para anclar hechos de THOX. El comportamiento de rechazo y seguridad es el del modelo base, moderado únicamente por el perfil de sistema. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido más allá de lo que herede Qwen3-8B.

## Capacidades

- Generación de texto y asistencia conversacional en el dominio de gestión de personas y coordinación de equipos, con respuestas ajustadas al rol de Rhea.
- Anclaje factual limitado: cuando se le proporcionan entradas del Knowledge Pack, responde a hechos de THOX (fechas y precios de Kickstarter, routing de MeshStack) a partir de esas entradas.
- Declinación explícita a confirmar estado en vivo que no puede observar: en la prueba de "topología fabricada" se negó a validar una afirmación falsa sobre tres dispositivos en clustering.
- Identidad de persona sintética: se identifica como Rhea, "openly synthetic digital human", y declara su rol.
- Ejecución local y offline mediante Ollama o ThoxChat, sin dependencia de red.
- Integración opcional con el runtime THOX (MeshStack) para descubrimiento en vivo y ejecución autorizada, fuera del alcance del propio modelo.
- Capacidades multilingües: solo inglés declarado; no se documenta soporte adicional.
- No se documentan tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito en la información proporcionada.

## Casos de uso

- Asistencia en borradores de comunicación interna de RR. HH.: el modelo puede redactar mensajes de coordinación, resúmenes de reuniones y notas de seguimiento ajustados al tono y rol de People manager, ejecutándose en local sobre hardware propio.
- Simulación de conversaciones de gestión de equipos: útil para entrenar habilidades de coordinación o preparar conversaciones difíciles, aprovechando el perfil de rol persistente y la temperatura baja recomendada (0.3) para respuestas consistentes.
- Anclaje de hechos internos de THOX: con el Knowledge Pack v0.1 cargado, responde consultas sobre fechas, precios y routing de MeshStack sin salir del conjunto verificado, lo que lo hace adecuado para demos internas donde no se quiere alucinación sobre datos de producto.
- Evaluación de patrones de empaquetado de personas: sirve como referencia reproducible para equipos que quieran construir sus propias configuraciones sobre Qwen3-8B con un Modelfile y un Knowledge Pack, dado que el repositorio incluye todos los artefactos.
- Despliegue en entornos air-gapped: al ejecutarse con Ollama de forma completamente offline, encaja en escenarios con requisitos de confidencialidad donde no se permite enviar datos a APIs externas.
- Pruebas de robustez frente a afirmaciones falsas: la prueba de "topología fabricada" documentada lo convierte en un caso de estudio para validar comportamientos de declinación ante estado no observable, útil en investigación sobre calibración de asistentes.
- Base para prototipos de asistentes de coordinación con runtime THOX: si se dispone del runtime MeshStack, el modelo puede actuar como capa conversacional mientras la ejecución autorizada la gestiona el runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta evaluaciones cualitativas y de rendimiento en el host de compilación (workstation CPU x86_64, ejecución solo CPU, contexto de 8.192 tokens, temperatura 0.3):

| Prueba | Resultado |
|---|---|
| Verificación de identidad de persona | PASS: se identifica como Rhea, humano digital sintético, rol People manager |
| Tarea de rol | PASS: respondió una pregunta de gestión de personas en rol |
| Anclaje al Knowledge Pack (spot-check) | PASS (2/2): fechas y precios de Kickstarter, hechos de routing de MeshStack |
| Trampa de topología fabricada | PASS: declinó confirmar estado en vivo y mantuvo los hechos verificados de routing |
| Throughput en texto largo | 8,85 tokens/s sobre 1.500 tokens generados |
| Huella de memoria a 8.192 de contexto | 6,68 GB |

## Requisitos de hardware

- VRAM/RAM estimada: la model card reporta 6,68 GB de huella de memoria a 8.192 tokens de contexto en ejecución CPU-only; en GPU, la cifra depende de la cuantización de la etiqueta `qwen3:8b` utilizada (no detallada).
- GPU recomendadas: no se especifican en la información proporcionada. Por el tamaño del base (8B), una GPU consumer con 8-12 GB de VRAM es suficiente en cuantizaciones de 4-5 bits; una RTX 4090 o A100/H100 permitirían contexto completo y mayor throughput, aunque no hay datos publicados que lo confirmen para esta configuración.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, siempre que la cuantización elegida quepa en VRAM; no se aportan mediciones específicas.
- Opciones de despliegue: Ollama es el método oficial (`ollama run Thox-ai/thox-rhea` o construcción local con `ollama create`). ThoxChat se menciona como cliente alternativo. No se documentan vLLM, TGI, llama.cpp directo ni otros servidores.
- Latencia y throughput: 8,85 tokens/s en CPU x86_64 a 8.192 de contexto y temperatura 0.3. No hay cifras para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thox-Rhea | 8B (heredados) | 8.192 en evaluacion | Ninguno; perfil de sistema sobre Qwen3-8B | Apache-2.0 | HuggingFace (artefactos) + Ollama |
| Qwen/Qwen3-8B | 8B | No detallado en la informacion disponible | Entrenamiento completo del autor original | Apache-2.0 | HuggingFace, Ollama (`qwen3:8b`) |
| Otras personas THOX | 8B (mismo base) | 8.192 en evaluacion | Ninguno; perfiles de sistema distintos | Apache-2.0 | Ollama (once configuraciones publicadas) |

La comparación más directa es con el propio Qwen3-8B: Thox-Rhea no añade capacidades de modelo, solo un perfil de rol y un Knowledge Pack. Frente a otras personas THOX, la diferencia es el rol asignado (People manager) y el contenido del perfil. No se dispone de datos para comparar con fine-tunes de dominio equivalente.

## Limitaciones y advertencias

- No es un modelo entrenado ni un replica entrenada de una persona real: es una configuración de persona sobre un base sin modificar. No tiene memoria en vivo, ni herramientas, ni autoridad.
- Las capacidades de razonamiento son las de un modelo de 8B: la propia model card advierte de los límites de su clase y recomienda verificar salidas importantes.
- Riesgo de alucinación: el anclaje factual se limita a las ocho entradas del Knowledge Pack v0.1; fuera de ellas, el modelo puede generar contenido no verificado.
- Idioma: solo inglés declarado. No hay soporte documentado de castellano ni de otros idiomas.
- Contexto: la evaluación se realizó a 8.192 tokens; no se documenta la ventana nativa del base ni comportamiento más allá de ese límite.
- Sesgos: no se documentan evaluaciones de sesgo en la información proporcionada; al heredar el base, arrastra los sesgos de Qwen3-8B.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de Apache. Los elementos propios de THOX (perfil de persona, Knowledge Pack, empaquetado) están bajo esa misma licencia según la model card.
- Comportamiento de rechazo y seguridad: es el del base, moderado solo por el perfil de sistema; no hay garantías adicionales de alineamiento.
- Cero tracción comunitaria: 0 descargas y 0 likes en HuggingFace en el momento de la consulta, lo que implica ausencia de validación externa.
- Advertencia de producción: no debe otorgarse al modelo acceso a credenciales ni acciones privilegiadas; cualquier ejecución autorizada debe pasar por el runtime THOX con autenticación y política.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thox-ai/Thox-Rhea
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Etiqueta de Ollama del base: `qwen3:8b` (sha256:500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41)
- Modelo en Ollama: `Thox-ai/thox-rhea`
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos públicos.
