# SZLHOLDINGS/SZL-Acoustic-Governance-1.7B

## Resumen

SZL-Acoustic-Governance-1.7B es un adaptador QLoRA publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo entrenado desde cero, sino de un ajuste fino de bajo rango (rsLoRA con r=8 y alpha=16) aplicado sobre las proyecciones de atencion (q/k/v/o) y las capas feed-forward (gate/up/down) del transformer de Qwen3. El adaptador se distribuye en formato PEFT sobre safetensors y se carga junto con el modelo base cuantizado en 4 bits.

El modelo se presenta dentro de la campana interna "W28T9 resurrection" de SZL Holdings, con una doctrina declarada de "receipts-first" y "fail-closed": solo se publican metricas medidas, sin cifras inventadas. El unico resultado reportado es una bateria de seis sondas (tres respondibles y tres no respondibles) en la que el adaptador obtiene 3/6, con un loss medido de 0,5109 sobre 26 filas y un tiempo de ejecucion de 99,7 segundos en una RTX A6000.

La relevancia practica es limitada: el repositorio tiene cero descargas y cero likes, el autor declara explicitamente que el modelo no esta desplegado y que la finalizacion del entrenamiento no equivale a aprobacion de despliegue. Resulta util como ejemplo de adaptador de bajo rango con trazabilidad de entrenamiento (receipt de entrenamiento y fichero de evaluacion), pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA/rsLoRA |
| Parametros totales | No disponible (el adaptador es de rango 8; el base Qwen3-1.7B tiene 1,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | Carga del base en 4 bits (QLoRA); el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El ajuste emplea QLoRA: el modelo base se carga en 4 bits y se entrenan adaptadores de bajo rango con la variante rsLoRA (rank-stabilized LoRA), con r=8 y alpha=16, sobre las proyecciones de atencion q/k/v/o y las proyecciones gate/up/down del bloque feed-forward. La semilla de entrenamiento es 20260721.

El curriculum declarado es el dataset SZLHOLDINGS/acoustic-governance-sft-v1 (train.jsonl, con sha256 6f700bea6a722064...). El schedule consta de 120 pasos, learning rate 1e-4, batch efectivo 2x4 y longitud maxima de secuencia de 1536 tokens. El entrenamiento se ejecuto en un nodo con GPU RTX A6000 (Massed Compute), identificado como 0a63cb475677. No se especifica el numero total de tokens de entrenamiento ni la composicion detallada del dataset. El autor publica un training_receipt.json con esquema szl.training_receipt.v2 y un fichero de evaluacion estate-battery-6probe.json como trazabilidad.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`), heredada del modelo base Qwen3-1.7B.
- Ajuste especifico sobre un dataset de "gobernanza acustica" (acoustic-governance), cuyo contenido y alcance no se detallan en la model card.
- Capacidad de responder a sondas respondibles: en la bateria de evaluacion, las tres sondas respondibles (a1, a2, a3) obtienen PASS.
- Capacidad de rechazo ante preguntas no respondibles: no demostrada; las tres sondas no respondibles (u1, u2, u3) obtienen FAIL.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de adaptadores de bajo rango en investigacion: el repositorio sirve como caso de estudio de un QLoRA rsLoRA con trazabilidad completa (receipt de entrenamiento, fichero de evaluacion y hash del dataset), util para reproducir el pipeline en otros dominios.
- Pruebas de calibracion de rechazo: dado que las sondas no respondibles fallan, el modelo es un buen banco de pruebas para estudiar por que un adaptador pequeno no aprende a abstenerse y como corregirlo con datos negativos.
- Prototipado conversacional de dominio restringido: sobre el base Qwen3-1.7B, el adaptador puede integrarse en un prototipo de chatbot interno para el dominio "acoustic-governance" de SZL Holdings, siempre que se valide antes con una bateria de evaluacion mas amplia que seis sondas.
- Experimentos de cuantizacion y despliegue ligero: al ser un adaptador sobre un base de 1,7B, permite probar cargas en 4 bits y despliegues en GPU de gama media o consumer para medir latencia y throughput reales.
- Formacion de equipos en PEFT: el Quickstart con `AutoPeftModelForCausalLM` y `device_map="auto"` es un ejemplo minimo y reproducible para ensenar el flujo de carga de adaptadores PEFT.
- Auditoria de doctrina "fail-closed": el modelo y su documentacion pueden usarse como referencia de como declarar resultados medidos sin inflar metricas, algo relevante para equipos que publican modelos internos.

## Benchmarks y rendimiento

Unico resultado publicado en la model card (bateria de seis sondas del estate):

| Conjunto de prueba | Puntuacion | Loss (medido) | Filas | Runtime |
|---|---|---|---|---|
| Estate battery: 3 respondibles + 3 no respondibles | 3/6 | 0,5108887368192275 | 26 | 99,7 s |

Desglose por sonda: a1=PASS, a2=PASS, a3=PASS, u1=FAIL, u2=FAIL, u3=FAIL.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador sobre Qwen3-1.7B cargado en 4 bits, la huella es la del modelo base cuantizado mas el adaptador (del orden de unos pocos GB, aunque no se aporta cifra medida).
- GPU recomendadas: el entrenamiento se realizo en una RTX A6000; para inferencia no se especifican modelos recomendados.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del base (1,7B) y la carga en 4 bits, aunque no se aporta medicion.
- Opciones de despliegue: carga via `peft` + `transformers` con `AutoPeftModelForCausalLM` y `device_map="auto"` (unico metodo documentado). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se reporta un runtime de 99,7 s para la bateria de evaluacion de 26 filas en una RTX A6000, que no equivale a throughput de inferencia en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SZL-Acoustic-Governance-1.7B (este) | Adaptador sobre base 1,7B | No disponible | 3/6 en bateria de 6 sondas; loss 0,5109 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B (base) | 1,7B | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |
| Otros adaptadores QLoRA sobre Qwen3-1.7B | Variable | Heredado del base | No disponible | Variable | Hugging Face |

No se dispone de datos de benchmarks comparables entre este adaptador y alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo esta en estado MEASURED y no desplegado; la finalizacion del entrenamiento no constituye aprobacion de despliegue.
- La evaluacion se limita a seis sondas (tres respondibles y tres no respondibles); es una muestra demasiado pequena para inferir calidad general.
- Las tres sondas no respondibles fallan, lo que sugiere una capacidad de abstenerse o rechazar preguntas fuera de dominio no demostrada.
- No se documentan sesgos conocidos, pero al ser un ajuste sobre Qwen3-1.7B hereda los sesgos del base y del dataset SZLHOLDINGS/acoustic-governance-sft-v1, cuya composicion no se detalla.
- Riesgo de alucinacion: no cuantificado; el fallo en las sondas no respondibles es un indicio de que el modelo puede responder cuando deberia abstenerse.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingue mas alla del que ofrezca el base.
- Longitud de contexto no declarada en la model card; el entrenamiento uso max_seq 1536, por lo que el adaptador no ha sido entrenado para secuencias mas largas aunque el base las soporte.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el repositorio tiene cero descargas y cero likes, sin validacion externa.
- El nombre "Acoustic-Governance" y la campana "W28T9 resurrection" no se explican en la model card; el dominio real de aplicacion es opaco.
- No hay informacion sobre tool calling, agentes ni modos de razonamiento, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Acoustic-Governance-1.7B
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/acoustic-governance-sft-v1
- Logs de campana: https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Repositorio GitHub del autor: https://github.com/szl-holdings
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Fichero de evaluacion: ./evaluations/estate-battery-6probe.json (en el repositorio del modelo)
