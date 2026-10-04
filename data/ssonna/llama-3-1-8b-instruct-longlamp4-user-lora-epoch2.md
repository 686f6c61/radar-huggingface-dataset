# ssonna/Llama-3.1-8B-Instruct-LongLaMP4-user-LoRA-epoch2

## Resumen

Llama-3.1-8B-Instruct-LongLaMP4-user-LoRA-epoch2 es una coleccion de 2452 adaptadores LoRA independientes, uno por cada usuario del split de test basado en usuario del benchmark LongLaMP-4 (escritura sobre un tema). Cada adaptador se ha entrenado exclusivamente con el historial de perfil de un unico usuario, de modo que el resultado no es un modelo unico sino un banco de personalizaciones individuales sobre un unico modelo base congelado.

El problema que resuelve es el de la personalizacion a escala: en lugar de depender de un prompt largo con el historial del usuario, se almacena una especializacion de parametros ligera por usuario que se puede cargar y descargar dinamicamente. El modelo base es meta-llama/Llama-3.1-8B-Instruct, un transformer decoder-only de aproximadamente 8000 millones de parametros que permanece congelado; los adaptadores anaden unicamente matrices de bajo rango (rank 8) sobre las proyecciones q_proj y v_proj, con lo que el coste por usuario es minimo frente a un ajuste completo.

Su relevancia es fundamentalmente metodologica y de investigacion: sirve como artefacto reproducible (semilla 42, hiperparametros documentados) para estudiar personalizacion por usuario y despliegue multi-LoRA, ademas de como linea base frente a tecnicas de prompting o de adaptacion en contexto. No es un modelo de proposito general listo para produccion, sino un conjunto de adaptadores atados a un split de evaluacion concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptadores LoRA sobre q_proj y v_proj |
| Parametros totales | 8 000 millones aprox. en el modelo base (Llama 3.1 8B Instruct); cada adaptador es de bajo rango, rank 8 sobre 2 modulos por capa |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Llama 3.1 8B Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | no disponible; base entrenada en bfloat16 y pesos de adaptador en float32. El repo solo contiene safetensors LoRA |
| Idiomas soportados | no disponible en la model card (hereda las capacidades del modelo base) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA), mas adapter_config.json e identity.json por usuario |
| Numero de adaptadores | 2452 (uno por usuario del split de test de LongLaMP-4) |
| Tamano del repositorio | 33,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atención causal de 32 capas. Sobre el modelo base congelado se entrenan, de forma totalmente independiente, 2452 adaptadores LoRA. Cada adaptador usa rank 8, alpha 8, dropout 0,05 y actua unicamente sobre los modulos q_proj y v_proj de la atencion. Los pesos del adaptador se almacenan en float32 mientras que la base opera en bfloat16.

El entrenamiento es un ajuste supervisado (SFT) por usuario, en la linea de OPPU, con la base sin modificar. Los hiperparametros documentados son: optimizador AdamW, tasa de aprendizaje 0,0001, weight decay 0,01, planificador lineal con warmup del 10 %, recorte de gradiente 0,3, dos epocas, tamano de lote efectivo 8 y semilla 42. La funcion de perdida es entropia cruzada restringida a la completacion (completion-only) y sin truncacion, de modo que cada adaptador aprende a reproducir el estilo y los temas del historial propio del usuario. Cada carpeta incluye un identity.json con el id de usuario de LongLaMP-4 y los query ids, y un index.jsonl global recoge carpeta, user_id, query_ids, history_count y sha256 para trazabilidad. El nombre de carpeta es el primer hash SHA-256 (24 caracteres hexadecimales) del user id codificado en JSON.

## Capacidades

- Generacion de texto condicionada al estilo y a los temas de un usuario concreto, gracias a la especializacion de parametros por perfil.
- Escritura de texto largo sobre un tema (topic writing), que es la tarea del split LongLaMP-4.
- Personalizacion ligera y desacoplada: se puede servir un usuario distinto cambiando de adaptador sin reentrenar.
- Despliegue multi-LoRA: al ser adaptadores PEFT estandar, encajan en servidores con soporte de multiples LoRA simultaneas.
- Reutilizacion de las capacidades funcionales del modelo base: generacion de texto, seguimiento de instrucciones y razonamiento basico.
- No soporta de forma nativa tool calling, function calling, agentes, vision, audio ni modo de pensamiento mas alla de lo que ya ofrece el modelo base.
- Capacidades multilingues, contexto real y comportamiento de chat dependen del modelo base; no se documentan ajustes especificos en esos ejes.

## Casos de uso

- Investigacion en personalizacion: comparar la adaptacion por usuario (LoRA) frente a prompting en contexto con el mismo historial, usando LongLaMP-4 como banco de pruebas reproducible.
- Escritura asistida individualizada: asociar a cada usuario su adaptador para que las sugerencias de redaccion imiten su tono y sus temas recurrentes sin reenviar todo el historial en el prompt.
- Servicio multi-tenant con vLLM: cargar en memoria el modelo base una sola vez y atender a miles de perfiles conmutando adaptadores con la capa multi-LoRA, reduciendo el coste de VRAM por usuario.
- Experimentos de privacidad: evaluar si un adaptador entrenado con el historial de un unico usuario memoriza o filtra informacion personal, y con que intensidad.
- Baselines academicos: usar estos adaptadores como linea base de personalizacion por usuario frente a tecnicas de RAG o de ajuste con datos agregados.
- Ajuste de estilos de redaccion corporativa: replicar la metodologia para generar adaptadores por cliente o por canal con datos propios, partiendo de la receta documentada.
- Ablacion de hiperparametros: la configuracion fija (rank 8, 2 epocas, semilla 42) permite reproducir y variar condiciones controladamente para estudiar su efecto en la calidad de la personalizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion sobre LongLaMP-4 ni sobre otros conjuntos.

## Requisitos de hardware

- Inferencia con el modelo base en bfloat16: en torno a 16 GB de VRAM para los pesos (8B parametros) mas memoria para el contexto y el cache KV.
- El coste adicional por adaptador LoRA es minimo (rank 8 sobre q_proj y v_proj), por lo que el factor limitante es la base, no la personalizacion.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio concurrente con contexto largo; una RTX 4090 (24 GB) es suficiente para servir la base en bfloat16 o en cuantizacion de 8/4 bits.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) en bfloat16 justo o con cuantizacion; en GPU de 12-16 GB requerira cuantizacion.
- Almacenamiento: el repositorio ocupa 33,5 GB, por lo que conviene descargar solo los subfolders de los adaptadores necesarios.
- Opciones de despliegue: transformers + peft (como muestra la model card), vLLM con soporte multi-LoRA, TGI con adaptadores, y conversion a GGUF para llama.cpp/Ollama si se necesita ejecucion local.
- Latencia y throughput: no disponibles; dependen del hardware, del contexto y del backend elegido.
- El repo no incluye los pesos del modelo base; hay que descargar meta-llama/Llama-3.1-8B-Instruct por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Personalizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (LoRA por usuario LongLaMP-4) | Base 8B + 2452 adaptadores rank 8 | Heredado del base (hasta 128 000 tokens) | Si, 2452 perfiles | Llama 3.1 Community | HuggingFace, PEFT |
| meta-llama/Llama-3.1-8B-Instruct | 8B | Hasta 128 000 tokens | No (solo via prompting) | Llama 3.1 Community | HuggingFace |
| Mistral 7B Instruct | 7B | 32 000 tokens aprox. | No | Apache 2.0 | HuggingFace |
| Qwen2.5 7B Instruct | 7B | 128 000 tokens aprox. | No | Apache 2.0 / Qwen | HuggingFace |

Los modelos comparables de la misma categoria (instruct de 7-8B) no ofrecen personalizacion por usuario empaquetada; este repositorio aporta precisamente esa capa. La comparacion de rendimiento no puede establecerse porque no hay metricas publicadas en la informacion disponible.

## Limitaciones y advertencias

- Cada adaptador esta sobreajustado a un unico usuario del split de test; no generaliza a otros usuarios ni a tareas distintas de la escritura de tema.
- Reproducir el comportamiento requiere identificar correctamente al usuario mediante los hash de carpeta y el index.jsonl; un adaptador aplicado al usuario equivocado produce salidas sesgadas hacia el perfil ajeno.
- Riesgo de memorizacion y fuga de informacion personal del historial de entrenamiento; debe auditarse antes de cualquier uso real.
- Riesgo de alucinacion heredado del modelo base, no mitigado por el ajuste LoRA.
- Sesgos: los adaptadores reflejan los sesgos de los datos de cada usuario y los del modelo base; no se documenta ninguna mitigacion.
- Idiomas, longitud de contexto efectiva y calidad multilingue no estan verificados en la model card.
- Licencia: los adaptadores son obras derivadas de Llama 3.1 y se distribuyen bajo la Llama 3.1 Community License, con las restricciones de uso comercial y de politica de uso aceptable que esta impone.
- El modelo base no se incluye; hay que aceptar su licencia por separado y disponer de los pesos.
- Metadatos a revisar: las fechas de creacion y actualizacion indican 2026, y el repositorio registra 0 descargas y 0 likes, por lo que carece de validacion por parte de la comunidad.
- El repositorio pesa 33,5 GB y contiene 2452 adaptadores; gestionarlo en produccion exige estrategias de carga bajo demanda.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssonna/Llama-3.1-8B-Instruct-LongLaMP4-user-LoRA-epoch2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Benchmark de referencia citado en la model card: LongLaMP-4 (topic writing, split basado en usuario); no se proporciona enlace directo en la informacion disponible.
- Enfoque metodologico citado en la model card: OPPU; no se proporciona enlace directo en la informacion disponible.
