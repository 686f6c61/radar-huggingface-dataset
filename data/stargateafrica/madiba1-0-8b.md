# StargateAfrica/Madiba1-0.8B

## Resumen

Madiba1-0.8B es un modelo de lenguaje conversacional desarrollado por StargateAfrica, distribuido en Hugging Face bajo el identificador `StargateAfrica/Madiba1-0.8B`. Se trata de un modelo de pequeno tamano (752.393.024 parametros reales segun los pesos en safetensors, comercializado como "0.8B") construido sobre la arquitectura `qwen3_5_text`, lo que lo vincula a la familia Qwen 3.5 de Alibaba. El modelo esta orientado a tareas conversacionales y se distribuye con pesos en safetensors y GGUF, ademas de ser compatible con endpoints de inferencia.

La relevancia de este lanzamiento radica en su caracter de modelo ligero y desplegable en hardware modesto, combinado con un enfoque regional (Africa) por parte del desarrollador. Sin embargo, el acceso esta restringido: requiere aceptar condiciones en Hugging Face, y la licencia es una licencia de investigacion academica especifica (`stargate-africa-research-academic-licence`), lo que limita sustancialmente su uso comercial.

La informacion publica disponible es escasa: no se han publicado resultados de benchmarks, no consta una model card detallada con composicion del dataset ni detalles de entrenamiento, y el repositorio no registra descargas ni interacciones en el momento de la consulta. Esta ficha refleja, por tanto, unicamente los datos verificables a partir de los metadatos y los pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer decoder-only, familia Qwen 3.5) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos GGUF, lo que implica cuantizaciones habituales tipo Q4/Q5/Q8, pero no se detallan) |
| Idiomas soportados | no disponible |
| Licencia | stargate-africa-research-academic-licence (acceso restringido, gated) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El tag `qwen3_5_text` indica que el modelo emplea la arquitectura de texto de la familia Qwen 3.5, es decir, un transformer decoder-only con atencion causal. No se dispone de informacion publica sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni sobre innovaciones especificas de atencion (por ejemplo, atencion lineal o hibrida) en esta variante concreta. El tamano de 752 millones de parametros es coherente con un modelo pequeno de la familia, aunque no se confirma que sea una destilacion, un fine-tuning o un entrenamiento desde cero.

Respecto al entrenamiento, no se ha publicado informacion sobre el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco consta informacion sobre el tokenizador, el vocabulario o la ventana de contexto nativa. La presencia de pesos GGUF sugiere que el modelo ha sido convertido para inferencia en CPU y GPU de consumo mediante llama.cpp u Ollama, pero no se documentan los pasos de conversion ni las recetas de cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), lo que facilita su despliegue en plataformas compatibles con la API de Hugging Face.
- Distribucion en GGUF, lo que habilita inferencia local en CPU y GPU de consumo.
- Capacidades de razonamiento, codigo o matematicas: no documentadas.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (idiomas no disponibles).
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Asistente conversacional ligero en local: con 752 millones de parametros, el modelo puede ejecutarse en CPU o en GPU de consumo para prototipos de chatbot, gracias a su formato GGUF y a su reducido footprint de memoria.
- Despliegue en entornos con recursos limitados: adecuado para dispositivos edge, portatiles sin GPU dedicada o entornos de investigacion con presupuesto de VRAM reducido, donde modelos de 7B o superiores no caben.
- Investigacion academica en procesamiento del lenguaje natural: la licencia de investigacion academica encaja con proyectos universitarios que necesiten un modelo pequeno para experimentos controlados de generacion de texto.
- Evaluacion comparativa de modelos pequenos: util como linea base en estudios que comparen modelos de menos de 1B parametros en tareas conversacionales.
- Fine-tuning especifico de dominio: su tamano permite ajuste fino en una unica GPU de consumo, aunque la licencia restringe el uso comercial del modelo resultante.
- Integracion en pipelines de Hugging Face Endpoints: al ser compatible con endpoints, puede desplegarse como servicio gestionado para pruebas de concepto conversacionales.
- Generacion de texto en aplicaciones de bajo coste energetico: su tamano reducido implica menor consumo energetico por inferencia que modelos de mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (752M parametros), en FP16 requeriria aproximadamente 1,5 GB de pesos; en cuantizacion de 8 bits, en torno a 0,8 GB; en 4 bits, en torno a 0,4 GB, mas el overhead de activaciones y contexto.
- GPU recomendadas: no disponibles en la documentacion. Por tamano, cabria esperar compatibilidad con GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, asi como con Apple Silicon mediante Metal.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs con 4 GB o mas de VRAM en cuantizaciones bajas, aunque no se confirma oficialmente.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; endpoints compatibles con la API de Hugging Face. vLLM y TGI no estan confirmados para esta arquitectura concreta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Madiba1-0.8B | 752.393.024 | no disponible | stargate-africa-research-academic-licence | Gated en Hugging Face |
| Qwen2.5-0.5B | ~0,5B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | Publica |
| Qwen2.5-1.5B | ~1,5B | 32.768 tokens | Apache 2.0 | Publica |
| SmolLM2-1.7B | ~1,7B | 8.192 tokens | Apache 2.0 | Publica |

La comparativa se limita a parametros y licencia, ya que no hay datos de rendimiento publicados para Madiba1-0.8B. Frente a alternativas como Qwen2.5-0.5B o SmolLM2-1.7B, la principal desventaja de Madiba1-0.8B es su licencia restrictiva y su acceso gated, mientras que su ventaja potencial seria un ajuste conversacional especifico, no verificable sin benchmarks.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia de investigacion academica: no se autoriza explicitamente el uso comercial; cualquier despliegue en produccion con fines lucrativos requeriria negociacion con el desarrollador.
- Ausencia de benchmarks: no hay evidencia publica de calidad en tareas estandar (MMLU, HumanEval, GSM8K), lo que impide evaluar su rendimiento frente a alternativas.
- Idiomas no documentados: se desconoce la cobertura linguistica real y el sesgo hacia el ingles o lenguas africanas.
- Riesgo de alucinacion: inherente a modelos de este tamano, agravado por la falta de documentacion sobre alineacion.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin confirmar la ventana nativa.
- Sesgos conocidos: no documentados, pero previsibles en funcion del dataset de entrenamiento, que tampoco se detalla.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un lanzamiento reciente o de baja adopcion; conviene verificar la estabilidad de los pesos antes de integrarlos.

## Enlaces

- Hugging Face: https://huggingface.co/StargateAfrica/Madiba1-0.8B
