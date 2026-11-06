# ukisai/Swift-1.5-GLM-5.3-Flash-GGUF

## Resumen

Swift 1.5 GLM-5.3-Flash es una variante cuantizada en formato GGUF del modelo razonador Swift1.5-GLM-5.3-Flash, desarrollado por UkisAI como derivado eficiente de GLM-5.3-Flash (zai-org). El modelo se centra en resolver el problema del "overthinking" (razonamiento excesivo) en modelos de razonamiento: penaliza los tokens asociados a patrones patológicos de sobre-pensamiento y aplica post-training posterior para recuperar la precision, logrando un uso de tokens de razonamiento un 57,7% menor y una aceleracion de 2,4x con una perdida de precision inferior al 1% frente al modelo base en maximo esfuerzo de razonamiento.

La version GGUF permite ejecutar el modelo con runtimes compatibles con llama.cpp, como `llama-server`, lo que facilita su despliegue local sin depender de la pila de safetensors completa. El modelo es multimodal (image-text-to-text), de tipo MoE, con 320.759.404.382 parametros totales, y ha recibido post-training especifico para tareas de codigo y agentes de largo horizonte, como uso de terminal e ingenieria de software. Es relevante ahora porque aborda uno de los principales cuellos de botella practicos de los modelos razonadores: el coste y la latencia de las trazas de razonamiento largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), derivada de GLM-5.3-Flash (familia glm5_next) |
| Parametros totales | 320.759.404.382 (~320,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no disponibles en la informacion proporcionada) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (licencia "other", acceso con gate en Hugging Face) |
| Formato de pesos | GGUF (version base en safetensors) |

## Arquitectura y entrenamiento

Swift 1.5 GLM-5.3-Flash parte de GLM-5.3-Flash, un modelo MoE de la familia glm5_next con aproximadamente 320,8 mil millones de parametros totales. La contribucion de UkisAI no es arquitectonica sino de post-training: identificaron los tokens vinculados a patologias de overthinking y los penalizaron sin atacar directamente la longitud del razonamiento, para despues recuperar la precision con entrenamiento adicional. El resultado son trazas de razonamiento mas cortas, con un 57,7% menos de tokens de thinking, 2,4x mas velocidad y menos del 1% de perdida de precision frente al modelo base.

El entrenamiento incluye metodos de post-training adaptados especificamente a codigo y trabajo agentico de largo horizonte, como uso de terminal e ingenieria de software. Como material de partida utilizan el dataset publico `ukisai/Qwen3.8-27B-multi-turn-agent-sft` (conversaciones multi-turno de agente), aunque no se usa directamente: se re-muestrea y se convierte en entornos de RL propios. El repositorio GGUF esta derivado directamente del modelo base con llama.cpp y esta pensado para ejecutarse con runtimes compatibles como `llama-server`.

## Capacidades

- Generacion de texto y razonamiento eficiente: produce trazas de razonamiento un 57,7% mas cortas que el modelo base, con menos errores de overthinking.
- Generacion de codigo: post-training especifico para programacion; el video de demostracion usa un prompt de LiveCodeBench v6.
- Capacidades agenticas de largo horizonte: entrenado para uso de terminal (terminal-bench aparece entre sus tags) e ingenieria de software multi-paso.
- Vision: pipeline de tipo image-text-to-text, es decir, acepta entradas de imagen y texto.
- Formato conversacional y compatible con razonamiento por niveles de esfuerzo (se referencia "max reasoning effort" en las evaluaciones).
- Ejecucion local mediante llama.cpp y runtimes compatibles gracias al formato GGUF.

## Casos de uso

- Agentes de terminal y automatizacion de DevOps: el post-training especifico en uso de terminal y terminal-bench lo hace adecuado para agentes que ejecutan comandos, depuran entornos y completan tareas de ingenieria de software de varios pasos.
- Asistentes de codigo en editores y CLIs: la reduccion del 57,7% en tokens de razonamiento y la aceleracion de 2,4x reducen la latencia percibida, algo critico para completar codigo y responder consultas tecnicas de forma interactiva.
- Ejecucion local y privada con GGUF: al estar cuantizado en GGUF, puede desplegarse con llama.cpp u Ollama en infraestructura propia, util para organizaciones con requisitos de privacidad sobre el codigo que analizan.
- Analisis de documentos e imagenes: su pipeline image-text-to-text permite construir flujos que combinen capturas de pantalla, diagramas o documentos con instrucciones en lenguaje natural.
- Pipelines de razonamiento con control de coste: en produccion, donde el coste por token de thinking se acumula, la compresion de tokens manteniendo la precision permite escalar cargas de razonamiento a un coste menor.
- Sistemas multi-turno de agente: el dataset de entrenamiento procede de conversaciones agenticas multi-turno, lo que lo orienta a chatbots tecnicos y orquestadores que mantienen contexto a lo largo de sesiones largas.
- Evaluacion y benchmarking de eficiencia de razonamiento: al reportar metricas de tokens medios y medianos ademas de precision, es util como referencia para investigar metodos de compresion de razonamiento.

## Benchmarks y rendimiento

La model card publica una tabla de evaluacion comparando GLM-5.3-Flash (base) y Swift 1.5, con puntuaciones agregadas finales y metricas de tokens medios y medianos con su reduccion. Sin embargo, el contenido de la tabla esta truncado en la informacion proporcionada, por lo que no es posible reproducir las puntuaciones por benchmark.

Los datos globales confirmados por el autor son:

| Metrica | Valor |
|---|---|
| Reduccion de tokens de thinking | 57,7% |
| Aceleracion | 2,4x |
| Perdida de precision vs base (max reasoning effort) | <1% |
| Benchmarks referenciados | LiveCodeBench v6 (demo), terminal-bench (tags) |

No se han publicado en la informacion disponible resultados numericos completos de benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. El modelo base tiene ~320,8 B de parametros; en formato GGUF, el tamano del repositorio completo es de 5677,3 GB, lo que indica que las cuantizaciones incluidas cubren niveles muy altos y que las variantes de baja cuantizacion seguirian requiriendo cientos de GB de memoria (por ejemplo, una cuantizacion Q2 de ~320 B de parametros rondaria los 100-130 GB, aunque esta cifra es una estimacion orientativa y no un dato publicado).
- GPU recomendadas: no disponible oficialmente. Por el tamano del modelo, se requeririan configuraciones multi-GPU de gama datacenter (A100/H100 de 80 GB en multiples unidades) o nodos con memoria unificada amplia para las cuantizaciones mas altas.
- Consumer GPU: con ~320 B de parametros, no cabe en GPUs de consumo tipicas (RTX 4090, RTX 5090) ni siquiera con cuantizaciones agresivas, salvo mediante descarga parcial a CPU/RAM con la penalizacion de rendimiento correspondiente.
- Opciones de despliegue: llama.cpp y runtimes compatibles como `llama-server` (recomendado por el autor para este GGUF); Ollama podria ser viable al ser un formato GGUF estandar, aunque no se menciona explicitamente en la model card.
- Latencia y throughput: el autor reporta una aceleracion de 2,4x respecto al modelo base gracias a la reduccion de tokens de razonamiento, pero no publica cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Enfoque | Licencia |
|---|---|---|---|---|
| Swift 1.5 GLM-5.3-Flash (este modelo) | ~320,8 B totales (MoE) | GGUF | Razonamiento eficiente (-57,7% tokens thinking), agentes y codigo | swift-open-license-1.0 (gated) |
| GLM-5.3-Flash (zai-org, modelo base) | ~320,8 B totales (MoE) | no disponible | Razonamiento general, trazas mas largas | no disponible |
| Qwen3.8-27B (referenciado via dataset SFT) | 27 B (segun nombre del dataset) | no disponible | Agente multi-turno (dataset de entrenamiento) | no disponible |

Nota: la comparativa se limita a los modelos referenciados en la propia model card; no hay datos suficientes para comparar rendimientos numericos entre ellos.

## Limitaciones y advertencias

- Acceso restringido: el repositorio esta marcado como `gated: true`, por lo que hay que solicitar acceso y aceptar la licencia antes de descargarlo.
- Licencia "other" (swift-open-license-1.0): las condiciones exactas de uso comercial deben revisarse en el enlace de la licencia; la model card menciona una seccion de "Enterprise licensing", lo que sugiere que pueden existir restricciones o condiciones comerciales especificas.
- Tamano muy elevado: con ~320,8 B de parametros y un repositorio GGUF de 5677,3 GB, el despliegue requiere hardware de datacenter; no es un modelo para estaciones de trabajo individuales.
- Datos incompletos en la model card: la tabla de evaluacion detallada y las especificaciones como longitud de contexto, parametros activos del MoE, niveles de cuantizacion GGUF disponibles e idiomas soportados no constan en la informacion proporcionada.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion incorrecta con apariencia plausible; las trazas mas cortas de razonamiento podrian, en teoria, reducir la autocorreccion, aunque el autor reporta menos errores de overthinking y perdida de precision <1%.
- Sesgos conocidos: no disponibles; no se documenta auditoria de sesgos en la model card.
- Idiomas: no se especifican los idiomas soportados; para uso en castellano conviene verificar el comportamiento empiricamente antes de produccion.
- Origen derivado: al ser un derivado de terceros (UkisAI) sobre GLM-5.3-Flash de zai-org, conviene revisar tanto la licencia del derivado como la del modelo base si se planea uso comercial.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ukisai/Swift-1.5-GLM-5.3-Flash-GGUF
- Modelo base (safetensors): https://huggingface.co/ukisai/Swift1.5-GLM-5.3-Flash
- Modelo fundacional original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Licencia: https://huggingface.co/ukisai/Swift-1.5-GLM-5.3-Flash-GGUF/blob/main/LICENSE
- Website de UkisAI: https://ukisai.com
- Pagina de producto Swift: https://ukisai.com/products/swift
- llama.cpp: https://github.com/ggml-org/llama.cpp
