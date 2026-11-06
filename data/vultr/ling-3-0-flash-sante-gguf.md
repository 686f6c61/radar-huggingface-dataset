# vultr/Ling-3.0-flash-Sante-GGUF

## Resumen

Ling-3.0-flash-Sante es un modelo de lenguaje especializado en el ámbito sanitario, construido sobre Ling 3.0 Flash y desarrollado por inclusionAI. Se trata de un Mixture-of-Experts (MoE) de 124.400 millones de parámetros totales con 5.100 millones de parámetros activos por token, diseñado para razonamiento médico, investigación en ciencias de la salud y flujos de trabajo asistidos por herramientas. El modelo opera en modo *thinking* por defecto, lo que implica que genera cadenas de razonamiento internas antes de emitir la respuesta final.

La ficha que nos ocupa corresponde a la cuantización GGUF publicada por Vultr, que emplea una estrategia de cuantización híbrida: en lugar de aplicar una precisión uniforme a toda la red, cada capa recibe una precisión elegida a partir de una puntuación de importancia medida, de modo que los bits se asignan donde más afectan a la salida. El repositorio ocupa 302,9 GB y está pensado para su uso con llama.cpp.

El modelo resulta relevante porque combina una ventana de contexto de 256K tokens con una arquitectura MoE de activación dispersa (8 expertos enrutados de 512 más un experto compartido), lo que permite desplegar un modelo de gran capacidad en infraestructura moderada gracias a sus 5,1B parámetros activos. La licencia MIT facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailingmoe3, Mixture-of-Experts (MoE) |
| Parametros totales | 124.414.211.552 (124B) |
| Parametros activos | 5,1B por token |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | GGUF con cuantizacion hibrida por capa (precisión variable según importancia medida); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

Otras especificaciones disponibles:

| Parametro | Valor |
|---|---|
| Capas | 42 |
| Hidden size | 2.560 |
| Cabezas de atencion | 32 |
| Cabezas key-value | 32 |
| Expertos | 512, 8 enrutados por token, mas un experto compartido |
| Vocabulario | 157.184 |
| Disposicion de atencion | Cinco capas Kimi Delta Attention alternadas con una capa MLA con compuerta |
| Modelo base | inclusionAI/Ling-3.0-flash-Sante |
| Cuantizado por | Vultr |
| Tamano del repo | 302,9 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos (MoE) denominada bailingmoe3. Cada bloque consta de 512 expertos, de los cuales se enrutan 8 por token, además de un experto compartido que se activa siempre. Esta configuración mantiene un coste de cómputo por token bajo (5,1B parámetros activos) pese a un total de 124B parámetros. La disposición de atención es poco habitual: cinco capas de Kimi Delta Attention alternan con una capa de MLA (Multi-head Latent Attention) con compuerta, un patrón que busca reducir el coste de la caché KV en contextos largos. Con 42 capas, 2.560 dimensiones ocultas y 32 cabezas de atención y key-value, el modelo mantiene una ventana de 256K tokens.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Sí se indica que es un modelo especializado en el dominio sanitario, construido sobre Ling 3.0 Flash, y que funciona en modo *thinking* por defecto. La cuantización publicada por Vultr es híbrida: asigna precisión por capa según una puntuación de importancia medida, en lugar de usar una precisión uniforme para toda la red.

## Capacidades

- Generación de texto y razonamiento en modo *thinking* por defecto, con cadenas de razonamiento internas antes de la respuesta final.
- Especialización en razonamiento médico y sanitario, incluyendo investigación en ciencias de la salud.
- Flujos de trabajo asistidos por herramientas (*tool calling* / *function calling*), según la descripción del modelo base.
- Razonamiento multi-paso orientado a agentes, derivado del modo *thinking* y del soporte de herramientas.
- Contexto largo de 256K tokens, adecuado para documentación clínica extensa o historiales multi-turno.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- **Razonamiento clínico asistido**: el modelo puede procesar casos clínicos complejos y generar cadenas de razonamiento explícitas antes de la conclusión, útil como apoyo a la decisión en entornos de investigación sanitaria. El modo *thinking* por defecto facilita auditar el proceso.
- **Investigación y revisión de literatura médica**: con 256K tokens de contexto puede ingerir artículos completos, guías clínicas o protocolos extensos y resumirlos o cruzarlos, sin necesidad de trocear el documento.
- **Atención al cliente en el ámbito sanitario**: gestión de conversaciones multi-turno con historiales largos gracias a la ventana de 256K tokens, manteniendo coherencia sobre el contexto previo del paciente.
- **Extracción estructurada de información clínica**: mediante *tool calling*, el modelo puede invocar funciones para volcar datos de informes o notas clínicas a esquemas estructurados, integrándose en pipelines de procesamiento documental.
- **Agentes de soporte a la investigación**: flujos multi-paso que combinan búsqueda, consulta de fuentes y síntesis, aprovechando el razonamiento multi-paso y el soporte de herramientas.
- **Despliegue en infraestructura moderada**: gracias a los 5,1B parámetros activos y a la cuantización GGUF, puede servirse en servidores con GPU de gama alta pero no necesariamente de datacenter, para prototipos y entornos de validación.
- **Generación de documentación y resúmenes médicos**: producción de resúmenes de historiales o de material formativo sanitario, con control del razonamiento intermedio para revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el repositorio GGUF ocupa 302,9 GB, pero al tratarse de un MoE con 5,1B parámetros activos, el peso total debe residir en memoria o en disco con *offloading*. Los niveles de cuantización concretos no están disponibles, por lo que no puede darse una cifra de VRAM por nivel.
- **GPU recomendadas**: no disponibles en la información proporcionada. Por el tamaño total del modelo, un despliegue íntegro en GPU requeriría múltiples aceleradores de datacenter (A100/H100 de 80 GB) o bien *offloading* parcial a CPU y RAM.
- **GPU de consumo**: no cabe íntegramente en una GPU de consumo; requeriría *offloading* a memoria del sistema o almacenamiento.
- **Opciones de despliegue**: llama.cpp (formato nativo GGUF); compatible con herramientas construidas sobre llama.cpp. Otros motores (vLLM, TGI, Ollama) no están confirmados en la información disponible.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La comparación cuantitativa con alternativas de la misma categoría (MoE especializados en dominio sanitario) no está disponible.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Datos |
|---|---|---|---|---|---|
| Ling-3.0-flash-Sante (GGUF de Vultr) | 124B | 5,1B | 256K | MIT | Esta ficha |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Dominio sanitario**: es un modelo especializado en salud; su uso en contextos clínicos reales exige supervisión profesional y validación regulatoria. No debe interpretarse como dispositivo médico.
- **Riesgo de alucinación**: no se han publicado evaluaciones de fiabilidad ni tasas de alucinación; en dominios médicos el riesgo es especialmente crítico y requiere verificación de las salidas.
- **Modo *thinking* por defecto**: incrementa la latencia y el consumo de tokens de salida; en producción puede ser necesario desactivarlo o acotarlo, extremo no documentado en la información disponible.
- **Idiomas**: no se especifican los idiomas soportados, por lo que no puede garantizarse un rendimiento adecuado en castellano.
- **Cuantización híbrida**: la asignación de precisión por capa puede introducir degradaciones no uniformes respecto al modelo original; no hay evaluación publicada de la pérdida de calidad.
- **Tamaño del despliegue**: 302,9 GB de pesos requieren planificación de almacenamiento y memoria; el *offloading* penaliza la latencia.
- **Licencia**: MIT, permisiva para uso comercial, sin restricciones adicionales conocidas más allá de las del modelo base (también MIT según los metadatos).
- **Sesgos**: no hay información publicada sobre sesgos del modelo base ni de la especialización sanitaria.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/vultr/Ling-3.0-flash-Sante-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash-Sante
- Vultr: https://www.vultr.com/
- Documentación de Vultr: https://docs.vultr.com/
- Vultr Discover: https://discover.vultr.com/
- Vultr en Wikipedia: https://en.wikipedia.org/wiki/Vultr
