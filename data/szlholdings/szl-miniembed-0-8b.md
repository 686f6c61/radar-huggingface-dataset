# SZLHOLDINGS/SZL-MiniEmbed-0.8B

## Resumen

SZL-MiniEmbed-0.8B es un adaptador QLoRA publicado por SZLHOLDINGS sobre el modelo base unsloth/Qwen3.5-0.8B, un transformer denso de aproximadamente 0,8 mil millones de parametros. No se trata de un modelo entrenado desde cero ni de un modelo de embeddings pese a su nombre: la model card lo declara explicitamente como un adaptador de generacion de texto (pipeline `text-generation`) afinado sobre un dataset interno denominado `SZLHOLDINGS/verticals-sft-v1`. El adaptador emplea rsLoRA con rango 8, alpha 16 y se aplica sobre las proyecciones q/k/v/o y gate/up/down del transformer.

El entrenamiento documentado es muy acotado: 120 pasos, learning rate 1e-4, batch efectivo 8 (2x4) y longitud maxima de secuencia de 1536 tokens, ejecutado en una unica GPU RTX A6000. El autor lo enmarca en una "campana de resurreccion" interna (W28T9) y lo describe como un artefacto con estado "MEASURED", es decir, con metricas declaradas y sin despliegue en produccion. La unica evaluacion publicada es una bateria de 6 sondas (3 respondibles y 3 no respondibles) en la que el modelo acierta las 3 respondibles y falla las 3 no respondibles, con una loss de 1,2905.

Su relevancia practica es limitada: el repositorio tiene 0 descargas y 0 likes, el tamano declarado es de 0,0 GB (probablemente los pesos del adaptador no estan subidos o son de tamano despreciable), y no se publican benchmarks estandar. Resulta util unicamente como ejemplo de flujo PEFT/QLoRA reproducible o como base para experimentacion interna, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-0.8B) con adaptador LoRA/rsLoRA |
| Parametros totales | Aproximadamente 0,8 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1536 tokens durante entrenamiento; contexto nativo del base no disponible |
| Tipos de cuantizacion | Carga en 4 bits durante entrenamiento (QLoRA); cuantizaciones publicadas no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft |
| Rango LoRA | 8 (rsLoRA), alpha 16 |
| Modulos adaptados | q, k, v, o, gate, up, down |
| Dataset de entrenamiento | SZLHOLDINGS/verticals-sft-v1 (train.jsonl, sha256 78212631b3c072b3...) |
| Pasos de entrenamiento | 120, lr 1e-4, batch 2x4, max_seq 1536 |
| Semilla | 20260721 |
| Hardware de entrenamiento | RTX A6000 (Massed Compute, nodo 0a63cb475677) |
| Estado declarado | MEASURED (no desplegado) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo rsLoRA (rank-stabilized LoRA) con rango 8 y alpha 16, montado sobre un transformer denso Qwen3.5-0.8B cargado en 4 bits. Los modulos adaptados cubren las proyecciones de atencion (q, k, v, o) y las proyecciones del bloque feed-forward (gate, up, down), lo que constituye una cobertura amplia del transformer para un rango tan bajo. El entrenamiento se realizo con QLoRA sobre el dataset `SZLHOLDINGS/verticals-sft-v1`, del que solo se publica el hash del fichero `train.jsonl` y un total de 161 filas segun la evaluacion.

La configuracion de entrenamiento es minima: 120 pasos con batch 2x4 (efectivo 8), learning rate 1e-4 y secuencia maxima de 1536 tokens, lo que supone como maximo alrededor de 960 muestras procesadas, apenas unas pocas epocas sobre las 161 filas del dataset. No se documenta RLHF, DPO ni ninguna innovacion arquitectonica adicional; el interes tecnico se limita a la reproducibilidad del pipeline (receipts de entrenamiento y evaluacion en formato JSON versionado).

## Capacidades

- Generacion de texto conversacional, segun declara el pipeline `text-generation` y el tag `conversational`.
- Afinado sobre un dataset vertical propio (`verticals-sft-v1`), orientado presumiblemente a dominios internos de SZL Holdings; el contenido no se detalla.
- Herencia de las capacidades del base Qwen3.5-0.8B, que no se documentan en esta ficha.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara modo thinking, vision ni audio.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Reproduccion de pipelines QLoRA: el repositorio incluye receipts de entrenamiento (`training_receipt.json`, esquema `szl.training_receipt.v2`) que permiten replicar el ajuste sobre Qwen3.5-0.8B con los mismos hiperparametros y semilla.
- Experimentacion con rsLoRA de rango bajo: util para estudiar el efecto de r=8 y alpha=16 sobre un modelo de 0,8B con cobertura completa de proyecciones de atencion y FFN.
- Base para afinado vertical interno: al ser un adaptador ligero sobre un modelo de 0,8B, puede servir como punto de partida para SFT sobre dominios especificos en una unica GPU consumer o de gama profesional.
- Evaluacion de baterias de honestidad: el autor publica una bateria de 6 sondas (respondibles frente a no respondibles) que puede reutilizarse como plantilla para medir calibracion y rechazo.
- Prototipado conversacional de bajo coste: con 0,8B de parametros y carga en 4 bits, cabe en GPUs de 8-12 GB para pruebas de integracion con PEFT y transformers.
- Docencia y formacion: ejemplo completo y trazable de un ciclo QLoRA con dataset, hiperparametros, hardware y evaluacion declarados.

## Benchmarks y rendimiento

Unica evaluacion publicada (bateria de 6 sondas del autor):

| Conjunto de prueba | Puntuacion | Loss | Filas | Tiempo |
|---|---|---|---|---|
| Estate battery (3 respondibles + 3 no respondibles) | 3/6 | 1,2905391216278077 | 161 | 194,3 s |

Desglose por sonda: a1=PASS, a2=PASS, a3=PASS, u1=FAIL, u2=FAIL, u3=FAIL. El modelo responde correctamente a las tres preguntas respondibles pero no rechaza ninguna de las tres no respondibles, lo que indica una calibracion deficiente en escenarios de abstención.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6-2 GB en fp16 para el modelo base de 0,8B, mas el adaptador (despreciable); alrededor de 0,6-1 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con 8 GB o mas; una RTX 3060/4060 o superior es suficiente. Para entrenamiento, el autor uso una RTX A6000 (48 GB), aunque el ajuste cabe en GPUs de 12-16 GB.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 8 GB o mas.
- Opciones de despliegue: PEFT + transformers (documentado en la model card), vLLM y TGI previa fusion del adaptador en el modelo base; llama.cpp/Ollama requeririan conversion a GGUF tras la fusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| SZL-MiniEmbed-0.8B | ~0,8B (base) + adaptador | 1536 (entrenamiento) | Apache 2.0 | safetensors (PEFT) | Publicado, sin benchmarks estandar |
| Qwen3.5-0.8B (base) | ~0,8B | No disponible | No disponible | safetensors | Modelo base de referencia |
| Adaptadores LoRA genericos sobre modelos <1B | ~0,8B | Variable | Variable | safetensors | Depende del autor |

La comparativa con alternativas concretas no esta disponible: no se han publicado datos de rendimiento que permitan situar este adaptador frente a otros modelos del mismo tamano o tarea.

## Limitaciones y advertencias

- Calibracion deficiente: falla las 3 sondas no respondibles de la bateria de evaluacion, lo que sugiere tendencia a responder cuando deberia abstenerse.
- Riesgo de alucinacion: inherente a un modelo de 0,8B afinado con solo 120 pasos y un dataset de 161 filas.
- Entrenamiento minimo: 120 pasos sobre aproximadamente 161 filas implican un ajuste muy superficial; no cabe esperar capacidades verticales robustas.
- Contexto limitado: la ventana usada en entrenamiento es de 1536 tokens; no se documenta el contexto nativo del base.
- Idiomas no documentados: no se puede garantizar calidad multilingue.
- Sin benchmarks estandar: no hay datos de MMLU, HumanEval ni GSM8K que permitan validar capacidades generales.
- Estado no desplegado: el propio autor indica que la finalizacion del entrenamiento no equivale a aprobacion para despliegue.
- Repositorio de 0,0 GB: los pesos del adaptador podrian no estar efectivamente subidos; verificar antes de usar.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones y de documentacion del dataset desaconseja su uso en produccion sin validacion propia.
- Nombre potencialmente confuso: se llama "MiniEmbed" pero es un modelo de generacion, no de embeddings.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-MiniEmbed-0.8B
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/verticals-sft-v1
- Logs de campana: https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Repositorio GitHub de la organizacion: https://github.com/szl-holdings
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Evaluacion (ruta relativa en el repo): ./evaluations/estate-battery-6probe.json
