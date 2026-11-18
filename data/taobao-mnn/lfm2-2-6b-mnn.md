# taobao-mnn/LFM2-2.6B-MNN

## Resumen

LFM2-2.6B-MNN es la versión cuantizada y empaquetada para MNN del modelo LFM2-2.6B desarrollado por Liquid AI. MNN es el motor de inferencia de código abierto de Alibaba, y este repositorio, publicado por la organización taobao-mnn, adapta el modelo original a un formato ejecutable en dispositivos de borde (edge) sobre CPU, sin necesidad de GPU. El modelo base es un transformer híbrido de 2.600 millones de parámetros con 30 capas y dimensión oculta de 2048, orientado a conversación y generación de texto en chino e inglés.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un LLM de tamaño medio en hardware modesto: los pesos se cuantizan con HQQ a 4 bits con grupos de 64, lo que reduce el repositorio a 3,1 GB. El paquete incluye grafo y pesos (`llm.mnn` / `llm.mnn.weight`), tokenizador (`tokenizer.mtok`) y ficheros de configuración de ejecución, de modo que la integración con el runtime MNN es directa.

No obstante, conviene subrayar que la información publicada es escasa: no se detallan los datos de entrenamiento del modelo original ni se aportan resultados de benchmarks. Esta ficha se limita, por tanto, a lo que la model card y los metadatos del repositorio permiten afirmar, marcando explícitamente como «no disponible» todo aquello que no consta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (modelo base LiquidAI/LFM2-2.6B); empaquetado para MNN |
| Parámetros totales | 2,6 mil millones (modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | HQQ 4 bits, grupo 64 (capas lineales y cabeza de salida); escalas en FP16; embeddings compartidos con la cabeza en 4 bits |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1-0); condiciones de uso comercial en la sección 5 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`), tokenizador `tokenizer.mtok`, `config.json` / `llm_config.json` |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/LFM2-2.6B, es un transformer híbrido de 30 capas con dimensión oculta de 2048, según los datos de la model card. La información disponible no especifica la composición exacta de los bloques híbridos (proporción de atención y de capas recurrentes o de estado), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Todos estos datos deben considerarse «no disponible» a partir de la información proporcionada.

La aportación de este repositorio es el proceso de cuantización y empaquetado: los pesos del modelo original se convierten a MNN con cuantización HQQ de 4 bits y grupos de 64 tanto en las capas lineales como en la cabeza de salida, manteniendo las escalas en FP16 y compartiendo los embeddings con la cabeza de salida en la misma precisión de 4 bits. El resultado se distribuye como grafo MNN más ficheros de pesos y tokenizador, con parámetros de exportación documentados en `export_args.json` y registros de validación e hashes en `refresh_metadata.json`. La validación publicada (17 de noviembre de 2026, CPU x64) cubre alineación de mapeo FP32, saludos, aritmética, traducción y una prueba de humo con la configuración por defecto.

## Capacidades

- Generación de texto conversacional en chino e inglés, orientada a diálogo y generación en dispositivos de borde.
- Razonamiento básico y aritmética, según los casos de validación publicados (pruebas de aritmética superadas en la validación del exportador).
- Traducción entre los idiomas soportados, incluida en la batería de pruebas de validación.
- Ejecución en CPU con precisión y memoria bajas (`precision=low`, `memory=low`, 4 hilos por defecto), lo que habilita su uso en equipos sin GPU.
- Soporte de plantilla Jinja y corrección de tokens especiales en el runtime MNN (requiere el commit con el PR 5155).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio o modo de pensamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales locales en aplicaciones de escritorio o móviles: el paquete MNN con cuantización de 4 bits y 3,1 GB permite integrar un chat multi-turno en chino o inglés dentro de una app sin depender de la nube, ejecutando en CPU con configuración de baja memoria.
- Traducción integrada en herramientas ofimáticas: el modelo cubre zh y en y la validación incluye casos de traducción, por lo que puede emplearse para traducción de párrafos en editores o clientes de correo que necesiten funcionar sin conexión.
- Procesamiento por lotes de texto en servidores sin GPU: al ejecutarse con el runtime MNN en CPU, encaja en pipelines de resumen, clasificación o reescritura de documentos donde no hay aceleradores disponibles y el coste por inferencia debe ser bajo.
- Prototipado rápido de aplicaciones LLM en entornos de borde: el repositorio incluye `llm_demo` y documentación de integración (MNN-LLM), lo que permite validar ideas de producto en hardware de consumo antes de invertir en infraestructura mayor.
- Filtrado y moderación de contenido en local: un modelo de 2,6 mil millones de parámetros cuantizado puede clasificar o reescribir textos en tiempo real dentro de aplicaciones que requieren privacidad y no pueden enviar datos a terceros.
- Educación y demostraciones técnicas: sirve para enseñar el flujo completo de cuantización HQQ, exportación a MNN y despliegue en CPU, con artefactos de exportación y metadatos de validación incluidos en el repositorio.
- Pruebas de regresión de runtimes de inferencia: los ficheros de configuración y los hashes publicados permiten verificar la reproducibilidad de la ejecución entre versiones de MNN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta pruebas de humo cualitativas (saludo, aritmética, traducción y alineación de mapeo FP32) realizadas el 17 de noviembre de 2026 en CPU x64, sin cifras de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el paquete está pensado para ejecución en CPU; el repositorio ocupa 3,1 GB en disco con pesos de 4 bits.
- GPU recomendadas: no disponible; la configuración documentada es CPU con 4 hilos, `precision=low` y `memory=low`.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada (el runtime MNN soporta otros backends, pero la model card no documenta este caso para este modelo).
- Opciones de despliegue: runtime MNN (`llm_demo`) compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`, sobre el commit que incluye el PR 5155 (plantilla Jinja y corrección de tokens especiales). No se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponible; no se publican medidas de tokens por segundo ni de tiempo de primera respuesta.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de sus alternativas en la información proporcionada, por lo que la comparación se limita a características estructurales y de licencia.

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2-2.6B-MNN (este) | 2,6 B | no disponible | MNN, HQQ 4 bits, CPU | LFM Open License v1.0 | Empaquetado para edge por taobao-mnn |
| LiquidAI/LFM2-2.6B | 2,6 B | no disponible | safetensors (modelo original) | LFM Open License v1.0 | Modelo base sin cuantizar |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparables en la información disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card no documenta evaluaciones de sesgo ni de seguridad.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 2,6 B cuantizado a 4 bits, es previsible una mayor degradación en tareas de razonamiento complejo, pero no hay datos publicados que lo midan.
- Limitaciones de contexto e idioma: solo se declaran chino e inglés; la longitud de contexto no está documentada, lo que impide planificar cargas de trabajo con ventanas largas.
- Licencia: LFM Open License v1.0 (lfm1-0), no es una licencia de código abierto estándar; el uso comercial está sujeto a la sección 5 del texto de la licencia y debe revisarse antes de producción.
- Dependencia de un commit concreto de MNN: el funcionamiento correcto requiere el PR 5155 y el commit 4756b19d51ddeaf0a73bbc9f230dea6d930f442e; versiones distintas del runtime pueden romper la plantilla de chat o el manejo de tokens especiales.
- Precisión reducida: la cuantización HQQ de 4 bits con grupos de 64 puede introducir pérdida de calidad frente al modelo original en tareas sensibles; no se publican comparativas de calidad entre ambas versiones.
- Madurez del repositorio: 66 descargas y 0 «likes» en el momento de la consulta, con validación limitada a pruebas de humo; no hay evidencia de uso extensivo en producción.
- Sin soporte documentado de tool calling, agentes o multimodalidad: no debe asumirse su disponibilidad sin verificación empírica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/LFM2-2.6B-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B
- Réplica en ModelScope: https://modelscope.cn/models/MNN/LFM2-2.6B-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- PR de MNN con plantilla Jinja y corrección de tokens especiales: https://github.com/alibaba/MNN/pull/5155
- Documentación de MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Fichero de licencia: LICENSE (incluido en el repositorio)
