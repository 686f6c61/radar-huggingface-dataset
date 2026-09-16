# ximosss/ReViSQL-Qwen3-4B

## Resumen

ReViSQL-Qwen3-4B es un adaptador LoRA publicado por el usuario ximosss sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No es un modelo completo, sino un ajuste fino de bajo rango (rank 32, alpha 64) aplicado a las capas lineales de atención y MLP, entrenado con aprendizaje por refuerzo con verificación (RLVR) sobre datos expertos verificados del benchmark BIRD-Platinum. Su propósito es la traducción de lenguaje natural a SQL (text-to-SQL) con exactitud de ejecución alta para un modelo de solo 4.000 millones de parámetros.

El adaptador corresponde al paso 1.300 seleccionado por validación del proyecto bird-text2sql-rl, y se entrenó con el objetivo CISPO combinando recompensas de ejecución, VeriEQL y de proceso de evidencias. La innovación principal no está en la arquitectura, sino en el procedimiento: el artículo de referencia defiende que introducir experiencia específica de la tarea dentro del bucle de refuerzo permite alcanzar resultados de nivel humano en text-to-SQL sin ingeniería de pipeline (sin esquemas recuperados, sin votación compleja ni módulos auxiliares).

Es relevante ahora porque demuestra que un modelo de 4B con RLVR puede superar el 80 % de exactitud de ejecución en Arcwise-Plat y acercarse al 63 % en BIRD Full Dev, cifras que tradicionalmente exigían modelos mucho mayores o pipelines de varios componentes. El repositorio es pequeño (0,3 GB) y la licencia Apache 2.0 facilita su reutilización, aunque no se declaran idiomas soportados ni se han publicado todavía descargas o valoraciones de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, alpha 64) sobre un transformer decoder-only denso; se aplica a las capas lineales de atención y MLP |
| Parámetros totales | Adaptador: 0,3 GB en safetensors (número exacto de parámetros no disponible). Modelo base: aproximadamente 4.000 millones |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; la hereda del modelo base Qwen/Qwen3-4B-Instruct-2507 (consultar su model card) |
| Tipos de cuantización | No especificados por el autor. El adaptador se distribuye en safetensors y debe fusionarse con el modelo base antes de cuantizarlo (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No disponibles (no se declaran). El entrenamiento se realiza sobre BIRD, con bases de datos en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT, biblioteca `peft`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only denso de aproximadamente 4.000 millones de parámetros. Sobre él se entrena un adaptador LoRA de rango 32 y alpha 64 que modifica únicamente las capas lineales de atención y de MLP, sin tocar el resto de los pesos. El adaptador se carga con `peft.PeftModel.from_pretrained` sobre el modelo base y puede fusionarse para su despliegue o cuantización posterior.

El entrenamiento usa RLVR (reinforcement learning with verifiable rewards) sobre datos BIRD-Platinum verificados por expertos, con el objetivo CISPO y tres señales de recompensa: ejecución de la consulta, VeriEQL (equivalencia semántica de consultas SQL) y proceso de evidencias. Los hiperparámetros publicados son learning rate 1e-5, temperatura de rollout 0,8 y tamaño de batch/grupo 64/16. Este es el paso 1.300, seleccionado por validación, del proyecto bird-text2sql-rl. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Generación de consultas SQL a partir de preguntas en lenguaje natural (text-to-SQL) sobre esquemas de bases de datos relacionales.
- Operación como agente SQL con hasta cinco rondas de interacción de solo lectura con la base de datos, según el contrato de evaluación del repositorio fuente.
- Muestreo con autocoherencia: la decodificación SC-16 genera 16 candidatos a temperatura 1 y selecciona el resultado de ejecución mayoritario, mejorando la exactitud respecto a la decodificación greedy.
- Razonamiento multi-paso orientado a la resolución de la consulta, guiado por las recompensas de proceso de evidencias usadas durante el entrenamiento.
- Generación de texto general, heredada del modelo base Qwen3-4B-Instruct-2507.
- Soporte de tool calling y de function calling: no confirmado explícitamente en la información proporcionada; el modelo base lo soporta, pero el adaptador no declara este comportamiento.
- Capacidades multilingües: no declaradas; el ajuste se realiza sobre bases de datos en inglés.
- Capacidades de visión, audio o modo de pensamiento explícito: no disponibles en la información proporcionada.

## Casos de uso

- Text-to-SQL en producción sobre esquemas conocidos: el adaptador se integra sobre Qwen3-4B-Instruct-2507 y traduce preguntas de negocio a consultas ejecutables; con decodificación greedy alcanza un 62,65 % de exactitud de ejecución en BIRD Full Dev, un punto de partida razonable para un ciclo de revisión humana.
- Agente SQL con acceso de solo lectura a la base de datos: el modelo está evaluado con hasta cinco rondas de interacción con el entorno de base de datos, por lo que encaja en asistentes que inspeccionan el esquema y refinan la consulta antes de responder.
- Autoservicio analítico para equipos no técnicos: desplegado tras una interfaz de chat interna, permite formular preguntas sobre un almacén de datos sin escribir SQL, reduciendo la carga del equipo de datos.
- Asistente embebido en herramientas de BI (Superset, Metabase, Redash): el modelo puede pre-rellenar el editor de consultas a partir de una pregunta, aunque requiere el entorno de herramientas y los prompts del repositorio para reproducir el protocolo de evaluación.
- Generación de pares pregunta-SQL para evaluación y aumento de datos: sirve para crear conjuntos sintéticos que prueben otros pipelines de text-to-SQL o para comparar estrategias de decodificación (greedy frente a SC-16).
- Re-ranking y verificación de consultas candidatas: la estrategia SC-16 del propio modelo puede reutilizarse como componente de selección por ejecución mayoritaria dentro de un sistema mayor.
- Despliegue on-premise con requisitos de privacidad: al ser un modelo de 4B con adaptador de 0,3 GB, cabe en una GPU de consumo y puede ejecutarse en infraestructura local sin enviar esquemas ni datos a terceros.
- Investigación en RLVR: el adaptador y su repositorio fuente constituyen un punto de partida reproducible para estudiar recompensas verificables, ablaciones de rango LoRA o del paso de entrenamiento seleccionado.

## Benchmarks y rendimiento

Resultados de exactitud de ejecución publicados por el autor en la model card:

| Dataset / decodificación | Exactitud de ejecución |
|---|---|
| Arcwise-Plat-SQL, greedy | 376/498 = 75,50 % |
| Arcwise-Plat-SQL, SC-16 | 414/498 = 83,13 % |
| Arcwise-Plat, greedy | 404/498 = 81,12 % |
| BIRD Full Dev, greedy | 961/1.534 = 62,65 % |
| BIRD Mini-Dev, greedy | 298/500 = 59,60 % |

Greedy usa temperatura 0. SC-16 muestrea 16 candidatos a temperatura 1 y selecciona el resultado de ejecución mayoritario. El modelo se evalúa como agente SQL con hasta cinco rondas de interacción de solo lectura con la base de datos. No se han publicado en la información disponible comparaciones numéricas con otros modelos bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones propias a partir del tamaño del modelo base, no publicadas por el autor): en BF16, en torno a 8-9 GB solo para pesos, más la caché KV; en cuantización de 8 bits, aproximadamente 4,5-5 GB; en 4 bits, aproximadamente 2,5-3 GB. El adaptador añade solo 0,3 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servir varias peticiones concurrentes y ejecutar SC-16 con paralelismo; RTX 4090 (24 GB) o L40S para desarrollo y producción de baja concurrencia.
- Compatibilidad con GPU de consumo: sí. Una RTX 3060 de 12 GB o una RTX 4070 pueden ejecutar el modelo cuantizado a 4 u 8 bits; en BF16 conviene una GPU con 16 GB o más.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM (soporta adaptadores LoRA), TGI, y llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Nota importante: el adaptador por sí solo no reproduce el protocolo de evaluación; es necesario el entorno de herramientas de base de datos y los prompts del repositorio fuente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BIRD Mini-Dev (greedy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReViSQL-Qwen3-4B | ~4.000 M (base) + adaptador LoRA de 0,3 GB | No disponible | 59,60 % | Apache 2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3-4B-Instruct-2507 (base, sin adaptador) | ~4.000 M | No disponible en la información proporcionada | No disponible | Apache 2.0 | HuggingFace |
| Otros sistemas text-to-SQL de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de resultados comparables de otros modelos bajo el mismo protocolo de evaluación en la información proporcionada, por lo que no es posible establecer una comparación numérica rigurosa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningún análisis de sesgos en la información proporcionada.
- Riesgo de alucinación: como todo modelo generativo, puede producir tablas, columnas o funciones SQL inexistentes; la exactitud de ejecución del 62,65 % en BIRD Full Dev implica que aproximadamente una de cada tres consultas no se ejecuta correctamente en ese conjunto.
- Limitaciones de idioma: no se declaran idiomas soportados y el ajuste se realiza sobre BIRD, con bases de datos en inglés; el rendimiento en esquemas o preguntas en castellano no está medido.
- Limitaciones de contexto: la ventana efectiva depende del modelo base y no se documenta en este repositorio; los prompts de agente con varias rondas de interacción consumen contexto rápidamente.
- Dependencia del entorno: las cifras solo son reproducibles con el entorno de herramientas, los prompts y el contrato de evaluación del repositorio bird-text2sql-rl.
- Seguridad en producción: el modelo está evaluado con interacción de solo lectura; ejecutar sus salidas contra una base de datos con permisos de escritura expone a modificaciones o borrados no deseados. Es imprescindible aplicar permisos restrictivos y validación previa.
- Licencia: el adaptador se publica bajo Apache 2.0, pero el uso comercial queda sujeto también a los términos del modelo base Qwen/Qwen3-4B-Instruct-2507.
- Madurez: el repositorio acumula 0 descargas y 0 likes, sin validación externa conocida; conviene tratar los resultados como preliminares.
- Alucinación de evidencias: las recompensas de proceso de evidencias premian la justificación durante el entrenamiento, pero no garantizan que la explicación generada corresponda a la lógica real de la consulta.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ximosss/ReViSQL-Qwen3-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del proyecto: https://github.com/ximosss/bird-text2sql-rl
- Artículo: Zhu, Jin, Choi y Kang (2026), "Human-Level Text-to-SQL via Reinforcement Learning on Verified Data, Without Pipeline Engineering": https://arxiv.org/abs/2603.20004
- Blog asociado: "Putting Task Expertise into RL Achieves State-of-the-Art Performance on Text-to-SQL": https://thinkingmachines.ai/news/putting-task-expertise-into-rl/
