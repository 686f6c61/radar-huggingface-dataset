# Ssum-mer/qwen3.8-27b-growpath

## Resumen

GrowPath (Qwen3.8-27B) es un ajuste fino del modelo Qwen3.8-27B de Alibaba, publicado por el usuario independiente Ssum-mer. El modelo está especializado en la generación y modificación parcial de rutas de aprendizaje laborales ("roadmaps" de formación) en coreano, a partir de condiciones de entrada como el objetivo profesional, el nivel de competencia actual, la duración del plan, las horas semanales disponibles, el presupuesto y los materiales de estudio. La distribución es un merge completo de los cambios LoRA sobre los pesos base, en BF16 y safetensors repartidos en 12 shards.

Técnicamente es un transformer denso de 27.356.728.560 parámetros (unos 27,36 mil millones), con pesos de 54.713.457.120 bytes en BF16. El `config` declara la implementación `Qwen3_5ForConditionalGeneration` con `model_type: qwen3_5`, mientras que el nombre comercial del repositorio y del modelo base es Qwen3.8-27B; conviene tener presente esa discrepancia entre nombre de repositorio y nombre de arquitectura.

Su relevancia es acotada y muy específica: no es un modelo de propósito general ni compite en benchmarks abiertos, sino un ejemplo de ajuste fino vertical sobre una base de 27B para una tarea de planificación estructurada en coreano. Se publica bajo licencia Apache-2.0, con 11 descargas y ninguna valoración en el momento de redactar esta ficha, y sin evaluación independiente publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal; `config` con `Qwen3_5ForConditionalGeneration` y `model_type: qwen3_5` (nombre de repositorio: Qwen3.8-27B) |
| Parámetros totales | 27.356.728.560 (27,36 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (safetensors y GGUF); Q4 GGUF en repositorio aparte |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (12 shards, BF16) y GGUF (BF16 y Q4) |
| Tamaño de los pesos | 54.713.457.120 bytes (BF16); GGUF BF16: 53.808.282.112 bytes |
| Modelo base | Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) |
| Versión del ajuste | GrowPath V18, 2 épocas de entrenamiento |
| Tamaño del repositorio | 108,5 GB |
| Pipeline declarado | text-generation |
| Descargas / valoraciones | 11 / 0 |

## Arquitectura y entrenamiento

La base es un transformer denso de la familia Qwen3.8, de aproximadamente 27,36 B de parámetros y marcado por Alibaba como modelo multimodales nativo (de ahí la etiqueta `image-text-to-text` del repositorio). El ajuste GrowPath se aplicó mediante LoRA y posteriormente se fusionó en los pesos completos, de modo que se carga como un modelo único sin necesidad de aplicar el adaptador por separado. El `config` conserva la implementación `Qwen3_5ForConditionalGeneration`, lo que implica que las herramientas de carga deben reconocer `model_type: qwen3_5`.

No se detalla la composición del dataset de ajuste fino, el número de tokens utilizado, ni si hubo etapas de RLHF o DPO; la model card solo indica que el entrenamiento se centró en respuestas estructuradas de roadmap y de peticiones de modificación parcial, con 2 épocas finales. El autor justifica la elección de la versión V18 por una ventaja percibida de aproximadamente el 10 % frente a versiones anteriores, pero aclara explícitamente que se trata de un juicio de selección y no de una mejora medida en benchmarks. La conversión a GGUF BF16 está documentada con manifiesto y suma SHA256 (`32d69322977ccd21240d4005a5b4cedb877702724c1159a57faa174f87e1cb81`).

## Capacidades

- Generación de texto conversacional multi-turno en coreano e inglés.
- Generación de rutas de aprendizaje laborales estructuradas a partir de restricciones explícitas: objetivo, competencia actual, plazo, horas semanales, presupuesto y materiales disponibles.
- Modificación parcial de un roadmap ya generado, aplicando cambios acotados sobre una parte del plan.
- Salida estructurada orientada a campos (periodos, presupuesto, justificación de materiales, alcance de la modificación).
- Capacidad multimodal heredada del modelo base (etiqueta `image-text-to-text`), aunque el GGUF distribuido **no** incluye el proyector de visión.
- No se documenta soporte de tool calling, function calling ni de modo de razonamiento explícito ("thinking") en la información disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá de la conversación.
- No se documenta capacidad de audio ni de vídeo.

## Casos de uso

- **Planificación de formación interna (L&D):** el modelo recibe el perfil del empleado, el objetivo de puesto, las horas semanales disponibles y el presupuesto, y devuelve un plan por fases con justificación de materiales. Es su tarea de ajuste principal y está optimizado para el coreano.
- **Revisión y ajuste de planes ya existentes:** ante un roadmap en curso, el usuario puede pedir cambios parciales ("comprime las semanas 3 a 5", "sustituye este curso por una alternativa gratuita") y el modelo devuelve solo el tramo modificado, lo que encaja en flujos de edición incremental.
- **Onboarding de equipos en empresas con presencia en Corea:** generación de itinerarios de incorporación de 30/60/90 días en coreano, con materiales y hitos, revisables por el responsable de equipo antes de su publicación.
- **Asistente interno de desarrollo profesional:** despliegue conversacional multi-turno donde el empleado itera sobre su plan (cambia el objetivo, reduce el plazo) sin reiniciar la conversación.
- **Generación asistida de catálogos de formación:** producción por lotes de borradores de itinerarios para distintos roles, que luego se validan manualmente y se enriquecen con el catálogo real de cursos corporativos.
- **Soporte bilingüe coreano-inglés:** adaptación de un mismo plan para equipos internacionales, manteniendo la estructura y traduciendo la justificación de materiales y la secuencia de fases.
- **Base para otros ajustes verticales de planificación:** al ser un merge completo en BF16 con licencia Apache-2.0, sirve como punto de partida para afinar tareas similares de planificación estructurada en otros dominios (por ejemplo, certificaciones técnicas o itinerarios de investigación).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la cifra de "aproximadamente un 10 % de mejora" citada por el autor corresponde a su criterio de selección entre versiones, no a una medición de benchmark. Tampoco hay evaluación independiente ni comparación con el modelo base en la información proporcionada.

## Requisitos de hardware

- **VRAM en BF16:** los pesos suman 54,7 GB, por lo que la inferencia en BF16 requiere por encima de 55 GB solo para pesos; con caché KV y overhead conviene reservar 64-80 GB.
- **GPU recomendadas (BF16):** A100 80 GB, H100 80 GB o configuraciones multi-GPU. El autor confirma carga y generación corta en coreano en una A100, sin reevaluación completa de calidad.
- **Cuantización Q4:** existe un repositorio específico `Ssum-mer/qwen3.8-27b-growpath-Q4`; por el tamaño del modelo, una cuantización de 4 bits se sitúa aproximadamente en 15-17 GB de pesos (estimación aritmética a partir de los 27,36 B de parámetros, no un dato publicado).
- **GPU de consumo:** BF16 no cabe en ninguna GPU de consumo actual. Con Q4 es viable en tarjetas de 24 GB (RTX 4090, RTX 3090) y muy ajustado en 16 GB, dependiendo de la longitud de contexto y del backend.
- **Opciones de despliegue:** `transformers` (formato nativo, requiere reconocer `model_type: qwen3_5`), llama.cpp/Ollama/LM Studio con el GGUF BF16 o Q4, y servidores compatibles con endpoints (`endpoints_compatible` en las etiquetas). vLLM y TGI no están confirmados en la documentación del autor.
- **Latencia y throughput:** no disponible.
- **Almacenamiento:** 108,5 GB de repositorio completo; descargar solo los shards safetensors o solo el GGUF según el backend elegido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| GrowPath (Qwen3.8-27B) | 27,36 B | No disponible | Apache-2.0 | Ajuste fino para roadmaps de formación en coreano (LoRA fusionado) | HF: `Ssum-mer/qwen3.8-27b-growpath` |
| GrowPath v18 (repo alternativo) | 27 B (según HF) | No disponible | No disponible en la información | Variante del mismo ajuste, publicada en repositorio separado | HF: `Ssum-mer/qwen3.8-27b-growpath-v18` |
| GrowPath Q4 | 27,36 B (cuantizado) | No disponible | No disponible en la información | Misma versión V18 en 4 bits para hardware limitado | HF: `Ssum-mer/qwen3.8-27b-growpath-Q4` |
| Qwen3.8-27B (base, Alibaba) | ~27 B | No disponible en la información | No disponible en la información | Modelo denso multimodal nativo, propósito general (código, agentes, ofimática) | Repositorio oficial en GitHub y pesos en HF |

No se han identificado en la información disponible otros ajustes finos comparables de generación de roadmaps; la comparación relevante es, por tanto, contra el modelo base y contra las variantes del mismo autor.

## Limitaciones y advertencias

- **Alucinación en datos verificables:** la model card advierte que la vigencia y el estado de aprobación de normativas, así como la disponibilidad real de los materiales recomendados, deben comprobarse por una vía externa de búsqueda y validación. El modelo no consulta bases de datos ni fuentes actuales.
- **Salida no validada automáticamente:** el autor indica que los periodos, presupuestos, la justificación de materiales y el alcance de las modificaciones deben revisarse antes de su uso.
- **Idiomas limitados:** solo coreano e inglés declarados; el rendimiento en castellano no está documentado y previsiblemente será inferior, incluso aunque la base sea multilingüe.
- **Sesgos:** no hay documentación sobre sesgos, composición del dataset de ajuste ni procesos de alineación posteriores.
- **Sobreajuste a la tarea:** al ser un ajuste de 2 épocas sobre una tarea muy concreta, es esperable cierta degradación en capacidades generales (código, matemáticas, conocimiento abierto) respecto al modelo base; no hay mediciones que lo cuantifiquen ni lo descarten.
- **Ausencia de visión en el GGUF:** la etiqueta `image-text-to-text` puede inducir a error; el autor confirma que el GGUF no incluye el proyector de visión.
- **Longitud de contexto no documentada:** no se especifica la ventana de contexto, lo que impide planificar despliegues con documentos largos sin verificarla empíricamente.
- **Madurez y trazabilidad:** 11 descargas, 0 valoraciones, autor individual, sin evaluación de terceros. La verificación en hardware se limita a carga y generación corta en A100.
- **Discrepancia de nomenclatura:** repositorio "Qwen3.8-27B" frente a `model_type: qwen3_5`; algunas herramientas de carga pueden requerir configuración manual.
- **Licencia:** el ajuste se publica como Apache-2.0, pero conviene verificar los términos del modelo base Qwen3.8-27B antes de un uso comercial, ya que en la información disponible no se detalla su licencia.
- **Coste de almacenamiento:** 108,5 GB de repositorio; descargar el conjunto completo no es necesario si solo se usa una de las cuantizaciones.

## Enlaces

- Repositorio principal en HuggingFace: https://huggingface.co/Ssum-mer/qwen3.8-27b-growpath
- Variante v18: https://huggingface.co/Ssum-mer/qwen3.8-27b-growpath-v18
- Variante cuantizada en 4 bits: https://huggingface.co/Ssum-mer/qwen3.8-27b-growpath-Q4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Artículo de AMD sobre ejecución de Qwen3.8-27B en Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Artículo divulgativo sobre Qwen 3.8 27B y su despliegue local: https://juliangoldieaiautomation.com/blog/qwen-3-8-27b/
