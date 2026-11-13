# Tonic/Qwen3.5-9B-Wolof-CPT-v1-GGUF

## Resumen

Qwen3.5-9B-Wolof-CPT-v1-GGUF es la exportación en formato GGUF del modelo Tonic/Qwen3.5-9B-Wolof-CPT-v1, un ajuste del modelo base Qwen3.5 de 9B parámetros orientado al idioma wolof mediante continued pre-training (CPT). El autor identificado como Tonic publica esta versión cuantizada para su uso con llama.cpp, lo que permite ejecutar el modelo en hardware de consumo sin necesidad de GPUs de datacenter. El modelo cuenta con 8.984.596.992 parámetros totales según los datos de safetensors del repositorio base.

El interés de esta ficha radica en que se trata de un modelo especializado en un idioma de bajos recursos (el wolof, hablado principalmente en Senegal y Gambia), un caso de uso poco frecuente en el ecosistema open source, donde la mayoría de los ajustes se centran en inglés, chino o grandes lenguas europeas. La existencia de una versión GGUF con múltiples niveles de cuantización (F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0) facilita su despliegue en entornos con recursos limitados, algo relevante para organizaciones que trabajan en África Occidental.

No obstante, la información publicada por el autor es extremadamente escasa: la model card se limita a indicar que es una exportación GGUF del modelo base y a mostrar un ejemplo de invocación con `llama-cli`. No se detallan datos de entrenamiento, licencia, idiomas soportados ni resultados de benchmarks, lo que limita considerablemente la evaluación rigurosa del modelo. Esta ficha refleja esa falta de información de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5); detalles específicos no disponibles |
| Parametros totales | 8.984.596.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponibles (el nombre del modelo sugiere wolof, sin confirmación oficial) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio base presumiblemente en safetensors) |

## Arquitectura y entrenamiento

La información disponible no permite confirmar la arquitectura interna del modelo más allá de que deriva de Qwen3.5, lo que en principio implica una arquitectura transformer con las innovaciones propias de esa familia. El sufijo "CPT" en el nombre indica continued pre-training, es decir, un entrenamiento continuado sobre el modelo base Qwen3.5-9B con el objetivo de adaptarlo al wolof. No se especifican el número de tokens de entrenamiento, la composición del corpus, ni si hubo fases posteriores de ajuste fino supervisado, RLHF o DPO.

Tampoco se documentan innovaciones técnicas específicas de esta variante, como decodificación especulativa, atención lineal o modos de razonamiento extendido. La model card se limita a describir el proceso de exportación a GGUF y a proporcionar un comando de ejemplo. Cualquier afirmación sobre la composición del dataset o el proceso de entrenamiento sería especulativa y, por tanto, se omite.

## Capacidades

- Generación de texto conversacional, según la etiqueta "conversational" del repositorio y el ejemplo de diálogo en wolof de la model card.
- Adaptación al idioma wolof mediante continued pre-training, aunque no se cuantifica el grado de competencia alcanzado.
- Ejecución local mediante llama.cpp, gracias a la exportación en GGUF con cinco niveles de cuantización.
- Compatibilidad con endpoints, según la etiqueta "endpoints_compatible" del repositorio.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- No se confirma el soporte multilingüe más allá de la orientación al wolof.

## Casos de uso

- Atención al ciudadano en wolof: el modelo podría emplearse para responder consultas en wolof en servicios públicos o sanitarios de Senegal y Gambia, aprovechando su ajuste específico al idioma; la falta de benchmarks impide garantizar la calidad, por lo que requeriría validación humana.
- Traducción asistida wolof-francés: dado el bilingüismo habitual en la región, el modelo podría servir como base para pipelines de traducción, con revisión posterior por traductores nativos.
- Digitalización de contenido educativo: generación de materiales escolares en wolof para programas de alfabetización, ejecutando el modelo en local con cuantización Q4_K_M en equipos sin GPU dedicada.
- Preservación lingüística: creación de corpus sintéticos y ejercicios de paráfrasis en wolof para proyectos de documentación lingüística, siempre con supervisión de hablantes nativos.
- Asistentes conversacionales offline: despliegue con llama.cpp en portátiles o mini-PCs para entornos con conectividad limitada, usando la cuantización Q4_0 o Q4_K_M para reducir requisitos de memoria.
- Investigación en NLP de bajos recursos: punto de partida para experimentos de ajuste fino adicional o evaluación comparativa de modelos adaptados al wolof, dado que el repositorio base está disponible en safetensors.
- Chatbots de atención al cliente para empresas senegalesas: integración en canales de mensajería con respuestas en wolof, sujeto a validación previa de calidad y a la resolución de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18 GB en F16, unos 9,5 GB en Q8_0, alrededor de 6,5 GB en Q5_K_M, cerca de 5,5 GB en Q4_K_M y unos 5 GB en Q4_0 (estimaciones a partir de los 8.984.596.992 parámetros; no confirmadas por el autor).
- GPU recomendadas: A100 o H100 para F16 con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para Q8_0; RTX 4070, RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q5_K_M y Q4_K_M.
- Cabe en GPU de consumo: sí, con cuantizaciones Q5_K_M, Q4_K_M y Q4_0 en tarjetas de 8 GB o más; Q8_0 requiere al menos 12 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (previa conversión o importación del GGUF), y otros runtimes compatibles con GGUF como LM Studio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tonic/Qwen3.5-9B-Wolof-CPT-v1-GGUF | 8.984.596.992 | no disponible | no disponible | GGUF | Ajuste al wolof vía CPT; sin benchmarks publicados |
| Qwen3.5-9B (base) | ~9B | no disponible en esta ficha | no disponible | safetensors, GGUF | Modelo generalista del que deriva; sin especialización en wolof |
| Alternativas específicas para wolof | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de información sobre licencia: no puede confirmarse si se permite uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- No se documentan los idiomas soportados ni el grado real de competencia en wolof; el nombre del modelo sugiere la orientación, pero no hay evaluación publicada.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la falta de benchmarks que permitan calibrar la fiabilidad en tareas concretas.
- Posibles sesgos derivados del corpus de continued pre-training, no documentado; se desconoce su composición y equilibrio.
- Sin datos sobre longitud de contexto efectiva, lo que impide planificar casos de uso con documentos largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El tamaño del repositorio (45,1 GB) refleja la inclusión de múltiples cuantizaciones; conviene descargar solo el archivo necesario.
- No se especifican limitaciones de uso, restricciones de seguridad ni filtros de contenido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-CPT-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-9B-Wolof-CPT-v1
- Los resultados de búsqueda web no contienen enlaces relevantes al modelo (corresponden a entidades homónimas sin relación: Tonic App, agua tónica, ToNIC).
