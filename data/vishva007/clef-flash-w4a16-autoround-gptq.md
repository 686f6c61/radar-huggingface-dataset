# Vishva007/clef-flash-W4A16-AutoRound-GPTQ

## Resumen

Clef-Flash-W4A16-AutoRound-GPTQ es una version cuantizada del modelo Cloudflare/clef-flash, un modelo multimodal de decision ("decision model") orientado a evaluar esquemas estructurados y devolver distribuciones de probabilidad calibradas sobre preguntas tipadas (choice, score, noul) en un unico forward pass, sin generacion autorregresiva de tokens. La cuantizacion la ha realizado el usuario Vishva007 aplicando Intel AutoRound en modo W4A16 (pesos de 4 bits, activaciones de 16 bits, simetrico y group_size 32), preservando en BF16 nativo el vision tower, la cabeza de esquema conjunta (joint_head) y las convoluciones lineales de las capas de atencion lineal de Qwen3.5.

Segun la model card del autor, el modelo base seria un modelo multimodal de 9B post-entrenado a partir de Qwen3.5, pero el recuento real de parametros en safetensors del repositorio es de 2.491.309.296 (~2,49B), lo que representa una discrepancia relevante entre la ficha del autor y los metadatos publicados. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text, con soporte para texto, JSON, imagen y video como entradas y salida tipada estructurada.

Su relevancia actual reside en dos aspectos: por un lado, propone un paradigma distinto al de los LLM generativos (clasificacion y decision calibrada en una sola pasada, mas barato y con menor latencia que la decodificacion token a token); por otro, es una de las primeras versiones cuantizadas del modelo Clef de Cloudflare, con tres formatos publicados para cubrir motores distintos (AutoGPTQ, compressed-tensors/vLLM y nativo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atencion lineal (derivada de Qwen3.5), cabeza de esquema conjunta y salida tipada no autorregresiva |
| Parametros totales | 2.491.309.296 (~2,49B) segun safetensors; el autor declara 9B en la model card (discrepancia no resuelta) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (4-bit pesos, 16-bit activaciones), Intel AutoRound, sym=True, group_size=32; vision tower, joint head y convoluciones lineales preservados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; variantes AutoRound/AutoGPTQ, GPTQ estandar y compressed-tensors |

## Arquitectura y entrenamiento

El modelo parte de Cloudflare/clef-flash, descrito por el autor como un modelo multimodal de decision post-entrenado desde Qwen3.5. A diferencia de un LLM generativo clasico, no produce texto token a token: recibe un estado (state) en texto o JSON, opcionalmente imagenes, y un conjunto de preguntas tipadas con criterios, y devuelve en un unico forward pass una distribucion de probabilidad calibrada por pregunta. Los tipos soportados que aparecen en los ejemplos son "choice" (seleccion entre criterios), "score" (puntuacion sobre una escala) y "noul" (respuesta binaria del tipo si/no). La arquitectura incluye un vision tower para procesar imagenes, un joint_head para producir las cabezas tipadas y capas de atencion lineal propias de Qwen3.5.

El proceso de cuantizacion aplicado en este repositorio concreto es Intel AutoRound en configuracion W4A16 simetrica con group_size 32. La decision tecnica destacable es mantener en BF16 nativo tres componentes sensibles: el vision tower (para no degradar OCR ni percepcion visual), el joint_head (cabeza de esquema, critica para la calibracion de las distribuciones) y las convoluciones lineales de las capas de atencion lineal (para evitar drift numerico). El autor afirma que se observo "zero loss" en suites de prueba de texto, JSON y multimodalidad respecto al checkpoint base, aunque no publica numeros concretos. No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Decision estructurada con salida tipada: genera respuestas tipadas (choice, score, noul) con distribuciones de probabilidad calibradas en un solo forward pass.
- Entrada multimodal: acepta texto, JSON, imagen y video como estado de entrada (segun los tags y la model card).
- Evaluacion de esquemas: responde conjuntos de preguntas definidas con criterios, instrucciones y tipos personalizados.
- Clasificacion: orientado a tareas de clasificacion y decision (por ejemplo, severidad de incidencias, validacion documental).
- Vision / OCR: el vision tower se preserva en BF16, lo que sugiere uso en lectura de documentos, recibos y similares.
- Inferencia sin generacion autorregresiva: no decodifica tokens secuencialmente, lo que reduce latencia frente a un LLM generativo convencional.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-step: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.

## Casos de uso

- Triaje de incidencias en produccion: el ejemplo de la model card evalua un estado ("latencia de base de datos a 4.000 ms, fallos 504 en checkout") y devuelve severidad (SEV_1/SEV_2/SEV_3), urgencia y decision de rollback sin generar texto libre, lo que encaja en pipelines de alerting automatizado.
- Validacion de documentos financieros: procesa imagenes (por ejemplo, recibos) y responde preguntas tipadas como "el texto es legible" o "el importe supera 1.000 USD", util para conciliacion automatica y control de gastos.
- Moderacion y clasificacion de contenido: dado un estado textual o multimodal, devuelve una etiqueta calibrada con distribucion de probabilidad, adecuado para colas de revision humanas asistidas.
- Enrutado de tickets de soporte: clasifica y puntua urgencia para dirigir cada caso al equipo correcto, aprovechando la salida tipada en lugar de un texto libre que habria que parsear.
- Verificacion de calidad (QA) en vision por computador: uso como juez binario o por escala sobre imagenes, por ejemplo comprobar si una fotografia cumple criterios predefinidos.
- Automatizacion de decisiones de negocio: escenarios de scoring (riesgo, prioridad, confianza) donde se necesita una probabilidad calibrada y no una respuesta generativa.
- Sistemas de alerta temprana: evaluacion en una sola pasada de multiples preguntas sobre un mismo estado, reduciendo coste y latencia frente a invocar un LLM por cada criterio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente afirma que se observo "zero loss" en suites de prueba de texto, JSON y multimodalidad respecto al checkpoint base, sin cifras concretas (MMLU, HumanEval, GSM8K u otros no aparecen).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los pesos en 4 bits de un modelo de ~2,49B ocupan aproximadamente 1,2-1,5 GB; a ellos hay que sumar vision tower, joint head y convoluciones lineales en BF16, por lo que el repositorio completo pesa 9,3 GB. Un despliegue en BF16 mixto requeriria del orden de 6-10 GB de VRAM, mientras que uno apoyado principalmente en los pesos de 4 bits podria caber en 4-6 GB (estimacion propia, no confirmada por el autor).
- GPU recomendadas: no disponible. Por tamano, una RTX 4090 o RTX 3090 serian suficientes segun las estimaciones anteriores; en datacenter, A100, H100 o L40S son opciones sobredimensionadas pero validas para despliegue multi-instancia.
- Compatibilidad con GPU de consumo: probable en GPUs de 8-12 GB o superiores, siempre que el runtime cargue correctamente los componentes BF16 preservados (estimacion, no confirmada).
- Opciones de despliegue: Transformers nativo (variante AutoRound/AutoGPTQ), ExLlama/AutoGPTQ (variante GPTQ estandar) y vLLM/SGLang (variante compressed-tensors). Requiere codigo personalizado (joint_schema_model.py) y el uso de la API systemone.
- Latencia y throughput: no disponibles. La model card destaca que la salida es en un unico forward pass sin decodificacion autorregresiva, lo que deberia reducir latencia, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Motor objetivo |
|---|---|---|---|---|---|
| Vishva007/clef-flash-W4A16-AutoRound-GPTQ (este repo) | ~2,49B | W4A16 AutoRound | GPTQ estandar | apache-2.0 | Transformers / ExLlama / AutoGPTQ |
| Vishva007/clef-flash-W4A16-AutoRound | ~2,49B | W4A16 AutoRound | AutoRound / AutoGPTQ | apache-2.0 | Transformers / nativo |
| Vishva007/clef-flash-W4A16-AutoRound-LLM-Compressor | ~2,49B | W4A16 AutoRound | compressed-tensors | apache-2.0 | vLLM / SGLang |
| Cloudflare/clef-flash (base) | declara 9B (no confirmado) | BF16 (sin cuantizar) | safetensors | apache-2.0 | Transformers |

Comparativas con modelos de otra familia (por ejemplo otros clasificadores multimodales o LLM generativos pequenos): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia de parametros sin resolver: la model card declara un modelo de 9B, pero los safetensors del repositorio suman 2.491.309.296 parametros (~2,49B). Conviene verificar el dato antes de planificar recursos.
- Modelo no generativo: no produce texto libre de forma autorregresiva; devuelve salidas tipadas calibradas. No es apto para tareas de generacion de texto, resumen o conversacion abierta.
- Requiere codigo personalizado: el uso depende de joint_schema_model.py y de la API systemone, lo que complica la integracion con stacks estandar y aumenta el mantenimiento.
- Entrenamiento opaco: no hay informacion sobre datos de entrenamiento, composicion del dataset, proceso de post-entrenamiento (RLHF/DPO) ni evaluaciones publicas del modelo base.
- Riesgo de calibracion incorrecta: al tratarse de un clasificador de decision, una probabilidad mal calibrada puede llevar a decisiones automatizadas erroneas; se recomienda validar umbrales en el dominio de uso.
- Idiomas no declarados: no hay garantia de rendimiento multilingue; probablemente el modelo este optimizado para ingles, como sugiere la model card.
- Sesgos: no disponibles; no se documentan sesgos conocidos ni procedimientos de mitigacion.
- Riesgo de alucinacion: no aplica en el sentido generativo habitual, pero si puede producir clasificaciones o decisiones erroneas en entradas ambiguas o fuera de distribucion.
- Cuantizacion: aunque el autor indica "zero loss", no aporta numeros de validacion que respalden esa afirmacion; en produccion conviene re-evaluar contra el checkpoint base.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Cloudflare/clef-flash y el cumplimiento de cualquier termino adicional de Qwen3.5.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica comunidad y soporte minimos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vishva007/clef-flash-W4A16-AutoRound-GPTQ
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Variante AutoRound/AutoGPTQ: https://huggingface.co/Vishva007/clef-flash-W4A16-AutoRound
- Variante compressed-tensors (vLLM/SGLang): https://huggingface.co/Vishva007/clef-flash-W4A16-AutoRound-LLM-Compressor
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Perfil del autor en HuggingFace: https://huggingface.co/Vishva007
