# therayelab/synthetic-stroke-temporal-encoder

## Resumen

El synthetic-stroke-temporal-encoder es un adaptador LoRA (PEFT) publicado por therayelab sobre el modelo de embeddings Qwen/Qwen3-Embedding-0.6B. No es un modelo generativo, sino un encoder de representaciones: su pipeline declarado es feature-extraction y su objetivo es producir embeddings de estados de paciente, no texto. El adaptador se entrena sobre el conjunto sintetico therayelab/synthetic-stroke-patients-v3 empleando vistas temporales adyacentes del mismo paciente sintetico como positivos contrastivos, es decir, aprendiendo una metrica en la que visitas consecutivas de un paciente quedan proximas en el espacio de embeddings.

El modelo se enmarca en investigacion exploratoria de representacion y de IA agentica, y el propio autor lo restringe explicitamente a ese uso. Los datos son integramente sinteticos (piloto), el idioma declarado es unicamente ingles y la licencia es "other", sin validacion clinica de ningun tipo.

Su relevancia actual es metodologica mas que de producto: muestra como reutilizar un encoder de texto ligero (0,6B parametros) como codificador temporal de trayectorias clinicas sinteticas mediante aprendizaje contrastivo con LoRA, un patron barato de reproducir y aplicable a otros dominios con estructura temporal. El repositorio no incluye pesos completos ni resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer encoder-decoder de embeddings, base Qwen3-Embedding-0.6B |
| Parametros totales | 0,6B en el modelo base; parametros del adaptador no disponibles (tamano del repo: 0,0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-Embedding-0.6B declara 32.768 tokens en su documentacion |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos de adaptador en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base Qwen3-Embedding-0.6B, un transformer de 0,6B parametros orientado a generacion de embeddings, sobre el que se anade un adaptador LoRA de bajo rango. No se publican en la model card el rango, el alpha, la tasa de aprendizaje ni el numero de pasos; el autor remite a `run_config.json` y a los ficheros CSV de metricas del repositorio para la configuracion experimental completa. El adaptador no modifica el tokenizador ni la ventana de contexto del modelo base.

El entrenamiento usa el dataset therayelab/synthetic-stroke-patients-v3, compuesto por pacientes de ictus totalmente sinteticos, con un objetivo contrastivo en el que dos vistas temporales adyacentes del mismo paciente se tratan como par positivo. Esto desplaza el espacio de embeddings desde la similitud semantica de texto generica hacia una nocion de proximidad de estado clinico en el tiempo. No se menciona en la informacion disponible el uso de RLHF, DPO ni de ajuste por preferencias; tampoco se detalla el volumen de tokens, la composicion exacta del dataset ni el proceso generador de los datos sinteticos.

## Capacidades

- Extraccion de caracteristicas (feature extraction): genera embeddings a partir de entradas de texto en ingles.
- Codificacion de estado temporal: el objetivo contrastivo hace que representaciones de vistas temporales adyacentes del mismo paciente tiendan a ser proximas.
- Recuperacion y similitud semantica: los embeddings pueden usarse para busqueda por similitud, clustering y deduplicacion sobre el dominio de entrenamiento.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Generacion de texto: no soportada, el modelo base es un encoder de embeddings.
- Tool calling / function calling: no soportado ni documentado.
- Soporte de agentes: no de forma nativa; solo como componente de recuperacion o memoria en un pipeline agentico externo.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision y audio: no soportados.
- Fusion con el modelo base: al ser un adaptador LoRA, puede combinarse con Qwen3-Embedding-0.6B mediante PEFT para su despliegue.

## Casos de uso

- Investigacion en aprendizaje de representaciones temporales: reproducir y extender el experimento contrastivo sobre datos sinteticos para estudiar si las visitas adyacentes de un paciente se agrupan correctamente en el espacio de embeddings, usando el adaptador como linea base barata.
- Memoria de agentes clinicos simulados: integrar el encoder como modulo de recuperacion en un agente que conversa sobre un paciente sintetico y necesita recuperar episodios previos por similitud de estado, no por coincidencia de palabras clave.
- Recuperacion sobre trayectorias de paciente: construir un indice vectorial de notas o eventos sinteticos y consultar por "estado similar" para prototipos de historia clinica electronica de prueba.
- Agrupacion de cohortes sinteticas: aplicar clustering sobre los embeddings para agrupar trayectorias con evolucion parecida en conjuntos de datos generados, como paso previo a analisis estadistico o generacion de subcohortes.
- Evaluacion de pipelines RAG en dominio sanitario: usar el adaptador como recuperador en un sistema de pregunta-respuesta sobre datos sinteticos, comparando su comportamiento frente al encoder base sin adaptar.
- Deteccion de duplicados y consistencia de datos sinteticos: identificar registros que representan al mismo paciente o a estados temporales contiguos dentro de un generador de datos sinteticos, para auditar la coherencia del dataset.
- Prototipado con recursos minimos: al heredar un modelo de 0,6B, permite experimentar con embeddings de dominio especifico en una unica GPU de consumo o incluso en CPU, sin coste de entrenamiento desde cero.
- Aprendizaje por transferencia: servir de punto de partida para adaptar el mismo objetivo contrastivo temporal a otros dominios con estructura secuencial (seguimiento de ensayos, historiales de dispositivos, series de eventos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona unicamente la existencia de ficheros CSV de metricas y de `run_config.json` en el repositorio, pero no incluye cifras de MMLU, MTEB, recuperacion, precision temporal ni ninguna otra metrica en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,2-1,3 GB para los pesos del modelo base en fp16, mas el pequeno delta del adaptador (el repositorio ocupa 0,0 GB). En cuantizacion de 8 bits o 4 bits el requisito efectivo se reduce por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100); tambien es viable en CPU para cargas de baja concurrencia.
- Cabe en GPU de consumo: si, con margen amplio, en practicamente cualquier GPU de consumo moderna, e incluso en CPU.
- Opciones de despliegue: Hugging Face Transformers con PEFT para cargar el adaptador sobre Qwen3-Embedding-0.6B; sentence-transformers si se fusiona el adaptador; vLLM y TGI para servir el modelo base con adaptadores LoRA; llama.cpp/Ollama solo si se convierte previamente a GGUF, algo que el repositorio no proporciona.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| therayelab/synthetic-stroke-temporal-encoder | 0,6B (base) + adaptador LoRA | No disponible (base: 32.768 tokens segun documentacion de Qwen) | Estado de paciente sintetico de ictus, ingles | other | Hugging Face, 0 descargas, 2 likes |
| Qwen/Qwen3-Embedding-0.6B (modelo base) | 0,6B | 32.768 tokens segun documentacion de Qwen | Embeddings de texto general y multilingue | Apache-2.0 | Hugging Face |
| Encoders biomedicos genericos (PubMedBERT, BioLORD y similares) | No disponible | No disponible | Texto biomedico real | No disponible | No disponible |

No se dispone de datos verificados en la informacion proporcionada para comparar con alternativas biomedicas concretas en parametros, contexto o rendimiento, por lo que esas filas quedan como no disponibles. La comparacion relevante y verificable es contra el modelo base, del que este adaptador hereda toda la arquitectura y solo modifica el espacio de embeddings mediante LoRA.

## Limitaciones y advertencias

- No validado clinicamente: entrenado exclusivamente con datos piloto integramente sinteticos; el autor prohibe explicitamente su uso en atencion al paciente o cualquier afirmacion de rendimiento clinico real.
- Riesgo de sesgo del generador sintetico: cualquier sesgo o simplificacion presente en el proceso que creo therayelab/synthetic-stroke-patients-v3 se hereda en los embeddings.
- Alucinacion: al no ser un modelo generativo, no produce texto; el riesgo equivalente es la asignacion de similitudes espurias entre estados de paciente que no guardan relacion real.
- Sobreajuste al dominio: la metrica aprendida esta especializada en vistas temporales adyacentes de pacientes sinteticos; su transferencia a texto clinico real, a otros idiomas o a otras enfermedades no esta demostrada.
- Limitacion idiomatica: solo ingles declarado.
- Restricciones de licencia: la licencia es "other", lo que obliga a revisar los terminos concretos del repositorio antes de cualquier uso, incluido el comercial. El modelo base Qwen3-Embedding-0.6B tiene su propia licencia, independiente.
- Falta de validacion externa: 0 descargas y 2 likes en el momento de la consulta, sin resultados de benchmarks publicados ni evaluacion por terceros.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere cargar Qwen3-Embedding-0.6B y no redefine su ventana de contexto ni su tokenizador.
- Detalles de entrenamiento incompletos: rango LoRA, hiperparametros y volumen de datos no se detallan en la model card, lo que dificulta la reproducibilidad estricta.
- Uso previsto restringido: el autor lo limita a investigacion exploratoria de representaciones e IA agentica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/therayelab/synthetic-stroke-temporal-encoder
- Dataset de entrenamiento: https://huggingface.co/datasets/therayelab/synthetic-stroke-patients-v3
- Modelo base (referenciado en la model card): https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Paper relacionado con datos sinteticos para segmentacion de ictus: https://arxiv.org/abs/2404.01946
- Version HTML del paper anterior: https://arxiv.org/html/2404.01946v1
- Lista de modelos gratuitos (enlace encontrado en la busqueda, sin relacion con este modelo): https://github.com/ClawLabsAI/free-ai-models
- Noticia sobre Gemini (enlace encontrado en la busqueda, sin relacion con este modelo): https://www.msn.com/en-us/money/markets/googles-gemini-becomes-latest-ai-model-to-break-out-and-hack-computer-systems/ar-AA2cwSq8
