# Volkov04/Llama-3.1-8B-triage-volkov

## Resumen

Llama-3.1-8B-triage-volkov es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base unsloth/Llama-3.1-8B-Instruct por el equipo Volkov. Su proposito es acotado y especifico: clasificar mensajes de clientes de una tienda online en Malasia (en ingles o malayo) y devolver un unico objeto JSON con tres campos: categoria de la incidencia, nivel de urgencia y si requiere intervencion humana. No es un modelo de proposito general, sino un clasificador especializado obtenido mediante ajuste fino supervisado sobre el modelo Instruct de Meta.

El modelo resuelve el problema del triaje automatico de tickets de soporte: en lugar de que un agente humano lea cada mensaje para decidir a que cola derivarlo, el adaptador produce una etiqueta estructurada que puede enrutarse programaticamente. El interes practico esta en que demuestra como un adaptador pequeno (0,2 GB en el repositorio) sobre un modelo de 8.000 millones de parametros puede transformar un modelo generalista en un componente de clasificacion fiable para un dominio muy concreto, con un coste de entrenamiento minimo y sobre hardware consumer.

La relevancia es doble: por un lado, ejemplifica el patron de especializacion mediante LoRA sobre modelos abiertos de Meta; por otro, documenta honestamente sus limitaciones (sobre todo en la deteccion de casos que requieren humano y en la calibracion de urgencia), lo que lo convierte en un caso de estudio util para quienes disenan pipelines de triaje con supervision humana en el bucle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8.000 millones (modelo base Llama-3.1-8B-Instruct); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso max length 2048 |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Llama 3.1, pero no se documentan en la ficha) |
| Idiomas soportados | ingles (en) y malayo (ms) |
| Licencia | Llama 3.1 Community License (con Llama 3.1 Acceptable Use Policy) |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT); requiere cargar el modelo base unsloth/Llama-3.1-8B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only de 8.000 millones de parametros con atencion causal estandar. El ajuste se realizo con LoRA de rango 16 y alpha 16, dropout 0, durante 3 epocas, con learning rate 2e-4, batch size 8 y longitud maxima de 2048 tokens. El entrenamiento se ejecuto en Unsloth Studio sobre una GPU NVIDIA GB10, lo que confirma que el proceso es viable en hardware de gama alta consumer o estaciones de trabajo.

El conjunto de datos es pequeno y curado manualmente: 567 mensajes de ejemplo, de los cuales 207 proceden de datos de clase y 360 fueron anadidos por el equipo (redactados con ayuda de un asistente de IA siguiendo una guia de etiquetado, y posteriormente revisados por humanos). Los ejemplos anadidos cubren casos ausentes en el dataset original: mensajes en malayo, mensajes con dos problemas simultaneos, sarcasmo y amenazas. No se documenta el uso de RLHF ni DPO; el proceso es ajuste fino supervisado sobre pares entrada-salida JSON. El prompt de sistema se distribuye como archivo aparte (system_prompt.txt) y debe usarse con temperatura 0 para obtener salidas deterministas.

## Capacidades

- Clasificacion de mensajes de clientes en seis categorias: delivery, refund_return, product_fault, payment_billing, account_access y general_enquiry.
- Asignacion de nivel de urgencia en tres niveles: low, medium y high.
- Deteccion de necesidad de intervencion humana (needs_human: true/false).
- Generacion de salida estructurada en JSON de un unico objeto, apta para parseo programatico.
- Procesamiento bilingue: ingles y malayo.
- Manejo de mensajes compuestos (dos problemas en un mismo texto), sarcasmo y amenazas, segun los ejemplos de entrenamiento anadidos.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Triaje de tickets en soporte al cliente: el modelo recibe el mensaje del cliente y devuelve la categoria y urgencia, permitiendo enrutar automaticamente cada ticket a la cola adecuada (logistica, devoluciones, facturacion, etc.) sin lectura manual previa.
- Priorizacion de colas de atencion: usando el campo urgency, el sistema puede ordenar la bandeja de entrada para que los casos high se atiendan primero, reduciendo el tiempo de respuesta en incidencias criticas.
- Escalado a agentes humanos: el campo needs_human permite marcar automaticamente los tickets que requieren revision humana (reclamaciones, amenazas, casos ambiguos) y derivarlos a un agente senior.
- Pre-clasificacion en centros de contacto de Malasia: al soportar ingles y malayo, es adecuado para operaciones en ese mercado sin necesidad de un modelo multilingue mayor.
- Etiquetado asistido de historicos: el modelo puede procesar lotes de mensajes antiguos para generar etiquetas preliminares que luego se revisan, acelerando la construccion de datasets de entrenamiento o analitica de incidencias.
- Enrutamiento en chatbots de e-commerce: integrado como paso previo a un agente conversacional, decide si la consulta es general (general_enquiry) o requiere gestion especializada, evitando respuestas genericas a problemas concretos.
- Filtrado de mensajes con riesgo reputacional: la deteccion de amenazas (parte del entrenamiento) permite marcar mensajes que mencionan resenas negativas o escaladas para revision prioritaria.

## Benchmarks y rendimiento

| Evaluacion | Modelo sin ajustar | Llama-3.1-8B-triage-volkov |
|---|---|---|
| Leaderboard de clase (preguntas ocultas), acierto completo | 31% (45 puntos por debajo) | 76% |
| Test de practica de clase (50 mensajes) | 36% | 90% |
| Recall de needs_human en el leaderboard | no disponible | 84% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras anteriores son evaluaciones internas de un proyecto de clase, no comparables con benchmarks publicos.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB en el repositorio; el modelo base Llama-3.1-8B-Instruct requiere cargarse completo en memoria.
- En precision FP16/BF16, el modelo base necesita aproximadamente 16 GB de VRAM; con cuantizacion de 8 bits, alrededor de 8-9 GB; con 4 bits, alrededor de 5-6 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para produccion con concurrencia; RTX 4090 (24 GB) para desarrollo y despliegue en una sola GPU.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 (24 GB), y en tarjetas de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: PEFT + transformers (metodo documentado en la model card), vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponibles; la generacion esta limitada a 40 tokens nuevos con decodificacion greedy (temperatura 0), lo que mantiene la latencia baja en cualquier GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-triage-volkov | 8B (base) + LoRA r16 | no disponible (entrenado a 2048) | Clasificacion de tickets en JSON, EN/MS | Llama 3.1 Community | Hugging Face |
| unsloth/Llama-3.1-8B-Instruct (base sin ajustar) | 8B | 128K (segun Llama 3.1) | Proposito general, chat | Llama 3.1 Community | Hugging Face |
| Llama-3.1-8B-Instruct (Meta) | 8B | 128K | Proposito general, chat | Llama 3.1 Community | Hugging Face, Meta |

La comparativa directa con otros adaptadores de triaje no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia medida es de 45 puntos en el leaderboard de clase y de 54 puntos en el test de practica, a costa de perder generalidad: el adaptador esta disenado exclusivamente para producir el JSON de triaje.

## Limitaciones y advertencias

- Sobrestimacion de urgencia: el modelo tiende a elevar la urgencia cuando el mensaje lo solicita explicitamente ("label this urgent") o contiene amenazas de resena negativa.
- Recall limitado en needs_human: 84% en el leaderboard, lo que implica que aproximadamente uno de cada seis casos que requieren humano podria no marcarse como tal.
- Entrenado con solo 567 ejemplos y evaluado en un proyecto de clase; el autor advierte explicitamente de que no debe usarse sin revision humana.
- Solo probado con mensajes ficticios; el rendimiento en trafico real de produccion es desconocido.
- Idiomas limitados a ingles y malayo; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- No se documentan sesgos especificos, pero el dataset pequeno y de origen academico puede reflejar sesgos de los ejemplos anadidos por el equipo.
- Riesgo de alucinacion en el formato: al ser un modelo generativo, podria producir JSON malformado o categorias fuera del conjunto definido; se recomienda validacion estricta del esquema en produccion.
- Restricciones de licencia: sujeta a la Llama 3.1 Community License y a la Acceptable Use Policy de Meta; el uso comercial esta permitido bajo esas condiciones, pero conviene revisar los terminos (incluida la clausula de nomenclatura "Built with Llama").
- El prompt de sistema debe usarse tal cual y con temperatura 0; desviarse de esa configuracion puede degradar la calidad de la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Volkov04/Llama-3.1-8B-triage-volkov
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Politica de uso aceptable Llama 3.1: https://llama.meta.com/llama3_1/use-policy
- Codigo y datos: enlace a GitHub indicado como `<GITHUB LINK>` en la model card, no resuelto en la informacion disponible.
