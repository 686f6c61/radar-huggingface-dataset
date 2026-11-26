# SZLHOLDINGS/SZL-Math-Honesty-1.7B

## Resumen

SZL-Math-Honesty-1.7B es un adaptador QLoRA (rsLoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B, dentro de una campana interna denominada W28T9 "estate resurrection lane". No es un modelo entrenado desde cero, sino un ajuste fino de bajo rango sobre los pesos de Qwen3-1.7B cargados en 4 bits, orientado segun el autor a razonamiento matematico y a un comportamiento de "honestidad" (reconocer preguntas sin respuesta). El repositorio contiene unicamente los pesos del adaptador en formato safetensors gestionados por la libreria PEFT.

El modelo se presenta con una retorica de "receipts-first" y "fail-closed": el autor solo declara metricas medidas y explicitamente advierte que el estado es MEASURED, no desplegado. La unica evaluacion publicada es una bateria de 6 sondas (3 respondibles y 3 no respondibles) en la que el adaptador acierta las 3 respondibles y falla las 3 no respondibles, con una perdida de 0,398.

Por su tamano (1,7B parametros) y su naturaleza de adaptador, su relevancia practica es limitada: sirve como ejemplo de ajuste QLoRA sobre Qwen3 pequeno y como artefacto de investigacion interna, pero no cuenta con benchmarks estandar, ni con documentacion de idiomas, ni con evidencia de calidad general. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3-1.7B) con adaptador LoRA/rsLoRA |
| Parametros totales | 1,7B en el modelo base; el adaptador rsLoRA tiene rango r=8, alpha=16 (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso max_seq 1536 |
| Tipos de cuantizacion | base cargado en 4 bits durante el entrenamiento (QLoRA); el adaptador se distribuye en safetensors; no se documentan cuantizaciones GGUF publicadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3-1.7B, un transformer decoder-only, mediante QLoRA con rsLoRA (rank-stabilized LoRA) de rango r=8 y alpha=16, aplicado a las proyecciones q, k, v, o y a las capas gate, up y down. La semilla declarada es 20260721. El entrenamiento se ejecuto durante 120 pasos con learning rate 1e-4, batch efectivo 2x4 y longitud maxima de secuencia 1536, en un nodo con GPU RTX A6000 (Massed Compute), identificado como 0a63cb475677.

El dataset de ajuste es SZLHOLDINGS/ancient-math-reasoning-sft-v1 (fichero train.jsonl, con sha256 ac79afe10e0e5d17...), descrito como curriculum de razonamiento matematico. No se documenta el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. El autor publica un training_receipt.json con esquema szl.training_receipt.v2 y un fichero de evaluacion evaluations/estate-battery-6probe.json. No se describen innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento matematico orientado por el dataset de ajuste ancient-math-reasoning-sft-v1.
- Comportamiento de "honestidad" declarado: el autor pretende que el modelo identifique preguntas sin respuesta, aunque la unica evaluacion publicada muestra fallo en las 3 sondas no respondibles.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion de ajuste QLoRA sobre modelos pequenos: el adaptador sirve como referencia reproducible de un entrenamiento rsLoRA r=8 sobre Qwen3-1.7B con receta y receipts publicados, util para comparar hiperparametros en experimentos academicos.
- Prototipado de asistentes matematicos ligeros: al partir de un modelo de 1,7B, puede desplegarse en entornos con recursos limitados para resolver ejercicios aritmeticos o algebraicos sencillos, siempre con validacion humana.
- Experimentos de calibracion y abstenccion: el enfoque de "honestidad" permite estudiar como un adaptador pequeno responde ante preguntas sin respuesta, aunque los resultados publicados indican que aun falla en ese objetivo.
- Educacion y tutoria automatizada de matematicas basicas: con contexto de 1536 tokens en entrenamiento, puede gestionar interacciones cortas de resolucion de problemas paso a paso en entornos controlados.
- Base para fine-tuning posterior: al ser un adaptador PEFT sobre Qwen3-1.7B, puede combinarse o continuar entrenandose en pipelines propios que ya usen el modelo base.
- Evaluacion de infraestructura de entrenamiento: los receipts (nodo, GPU, semilla, hash del dataset) permiten auditar la reproducibilidad de un job QLoRA en una RTX A6000.

## Benchmarks y rendimiento

| Conjunto de prueba | Resultado | Perdida (MEASURED) | Filas | Tiempo de ejecucion |
|---|---|---|---|---|
| Estate battery: 3 respondibles + 3 no respondibles | 3/6 | 0,3980380785961946 | 24 | 119,1 s |

Desglose por sonda: a1=PASS, a2=PASS, a3=PASS, u1=FAIL, u2=FAIL, u3=FAIL. El autor indica explicitamente que no reclama ninguna otra evaluacion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,7B en FP16 requiere aproximadamente 3,4 GB solo para pesos; en 4 bits (como en el entrenamiento) baja a alrededor de 1 GB, mas overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en 4 bits; el entrenamiento se realizo en una RTX A6000.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con al menos 6 GB de VRAM.
- Opciones de despliegue: PEFT con transformers (AutoPeftModelForCausalLM), segun el quickstart del autor. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; al ser un adaptador PEFT, requeriria fusion con el modelo base para usarse en motores que no soporten PEFT.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SZL-Math-Honesty-1.7B | 1,7B (base) + adaptador r=8 | no disponible (entrenado a 1536) | apache-2.0 | safetensors (PEFT) | Adaptador QLoRA, sin benchmarks estandar |
| Qwen/Qwen3-1.7B | 1,7B | no disponible en la informacion proporcionada | apache-2.0 | safetensors | Modelo base; dispone de evaluaciones propias del autor original |
| Otros adaptadores QLoRA sobre Qwen3-1.7B | 1,7B (base) | variable | variable | safetensors (PEFT) | No disponible comparativa concreta en la informacion proporcionada |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara el estado como MEASURED y no desplegado: "training completion is not deployment approval".
- La unica evaluacion publicada es una bateria de 6 sondas; el modelo falla las 3 preguntas no respondibles, por lo que el objetivo declarado de "honestidad" no se cumple en la evidencia disponible.
- No hay benchmarks estandar (MMLU, GSM8K, HumanEval) que permitan evaluar calidad general o matematica.
- No se documentan idiomas soportados; el comportamiento multilingue es desconocido.
- Riesgo de alucinacion: no evaluado; al ser un ajuste pequeno sobre un modelo de 1,7B, es esperable un riesgo elevado en dominios fuera del dataset de ajuste.
- Sesgos conocidos: no documentados.
- Licencia apache-2.0 permite uso comercial, pero el autor no garantiza idoneidad para produccion.
- El repositorio no registra descargas ni likes, y el tamano es de 0,0 GB, lo que sugiere que los pesos del adaptador pueden no estar completamente subidos o son de muy pequeno tamano.
- La model card incluye referencias a campanas internas y "deleted models stay deleted", lo que indica que el artefacto forma parte de un flujo de trabajo privado sin validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Math-Honesty-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de ajuste: https://huggingface.co/datasets/SZLHOLDINGS/ancient-math-reasoning-sft-v1
- Logs de campana: https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Organizacion: https://huggingface.co/SZLHOLDINGS
- Repositorio GitHub del autor: https://github.com/szl-holdings
