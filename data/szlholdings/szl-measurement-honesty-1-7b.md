# SZLHOLDINGS/SZL-Measurement-Honesty-1.7B

## Resumen

SZL-Measurement-Honesty-1.7B es un adaptador QLoRA publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B de Alibaba. No se trata de un modelo entrenado desde cero, sino de un ajuste fino mediante PEFT (rsLoRA con r=8 y alpha=16) aplicado sobre las proyecciones q/k/v/o y gate/up/down del transformer base, cargado en 4 bits durante el entrenamiento. El adaptador se distribuye como pesos safetensors compatibles con la libreria PEFT y requiere el modelo base para funcionar.

El objetivo declarado por el autor es un "curriculum" de honestidad de medicion: el adaptador se entrena sobre el dataset SZLHOLDINGS/measurement-honesty-v1 con el fin de que el modelo responda de forma calibrada ante preguntas que puede o no puede contestar. La unica evaluacion publicada es una bateria de seis sondas (tres respondibles y tres no respondibles) en la que el adaptador obtiene 4/6, con dos fallos en las sondas no respondibles.

El modelo es relevante unicamente como artefacto de investigacion reproducible: el autor documenta receipts de entrenamiento (120 pasos, lr 1e-4, batch 2x4, max_seq 1536, semilla 20260721, nodo con RTX A6000) y declara explicitamente el estado "MEASURED, not deployed". No hay descargas ni likes en el momento de redactar esta ficha, y no se han publicado benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA con rsLoRA) sobre transformer decoder-only Qwen3-1.7B |
| Parametros totales | No disponible (adaptador; el base Qwen3-1.7B tiene 1.700 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (heredada del base Qwen3-1.7B; el entrenamiento uso max_seq 1536) |
| Tipos de cuantizacion | Base cargado en 4 bits durante entrenamiento; pesos del adaptador en safetensors (sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only. La configuracion LoRA es rsLoRA con rango r=8, alpha=16 y modulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El modelo base se carga en 4 bits (QLoRA) durante el entrenamiento, lo que reduce el coste de memoria del ajuste. La semilla declarada es 20260721 y el entrenamiento se ejecuto en un nodo con GPU RTX A6000 (Massed Compute).

El curriculum de entrenamiento es el dataset SZLHOLDINGS/measurement-honesty-v1, concreto en data/train.json (sha256 f47438c0cdde8805...). El schedule declarado es de 120 pasos, learning rate 1e-4, batch efectivo 2x4 y longitud maxima de secuencia 1536. No se especifica el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO. El autor no documenta innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.); el interes tecnico reside en la reproducibilidad de los receipts y en el enfoque "fail-closed" de solo reportar metricas medidas.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas, heredadas del modelo base Qwen3-1.7B.
- Comportamiento de "honestidad de medicion": el adaptador se entrena para declarar incertidumbre o rechazar preguntas no respondibles, aunque la evaluacion publicada muestra 2 fallos de 3 en sondas no respondibles.
- Soporte de tool calling y function calling: no documentado especificamente para el adaptador (depende del base Qwen3).
- Razonamiento multi-paso y agentes: no documentado para el adaptador.
- Capacidades multilingues: no documentadas; el autor no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no documentadas.

## Casos de uso

- Investigacion sobre calibracion y honestidad en LLM: el adaptador sirve como punto de partida reproducible para estudiar como un ajuste LoRA de bajo rango afecta la tendencia del modelo a admitir desconocimiento. Su bateria de seis sondas y los receipts permiten replicar el experimento.
- Experimentos academicos de QLoRA sobre modelos pequenos: la configuracion concreta (r=8, alpha=16, rsLoRA, 120 pasos, max_seq 1536) es un baseline documentado para comparar metodologias de ajuste fino eficiente en memoria.
- Pruebas de pipelines PEFT: el adaptador se carga con AutoPeftModelForCausalLM y sirve para validar flujos de carga, fusion y despliegue de adaptadores sobre Qwen3-1.7B en entornos de CI.
- Evaluacion de tecnicas de abstención: util para construir y validar conjuntos de sondas respondibles/no respondibles y medir tasas de fallo en modelos pequenos antes de escalar a modelos mayores.
- Docencia y formacion: ejemplo real de model card con receipts, semillas y artefactos de evaluacion para ensenar buenas practicas de trazabilidad en publicacion de modelos.
- Prototipado de asistentes con gestion de incertidumbre: en entornos controlados, puede usarse para explorar respuestas que declaren limites de conocimiento, siempre con validacion adicional dado el 4/6 reportado.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Metrica | Resultado | Filas | Runtime |
|---|---|---|---|---|
| Estate battery (3 respondibles + 3 no respondibles) | Aciertos | 4/6 | 1000 | 108,6 s |
| Estate battery | Loss | 0,5565480500459671 | 1000 | 108,6 s |

Desglose por sonda: a1=PASS, a2=PASS, a3=PASS, u1=FAIL, u2=PASS, u3=FAIL. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en safetensors ocupa practicamente nada; el modelo base Qwen3-1.7B en fp16 requiere aproximadamente 3,4 GB de pesos mas overhead de activaciones y KV cache; en 4 bits, alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el base en fp16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. El autor entreno en una RTX A6000.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060/4060/4070/4090) usando cuantizacion 4 bits del base.
- Opciones de despliegue: PEFT con transformers (AutoPeftModelForCausalLM), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponibles; el unico dato de runtime es el de la bateria de evaluacion (108,6 s para 1000 filas en RTX A6000, sin desglose de tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Disponibilidad |
|---|---|---|---|---|---|
| SZL-Measurement-Honesty-1.7B | Adaptador sobre 1.7B | No disponible | Apache 2.0 | Adaptador PEFT (QLoRA) | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B | 1.7B | No disponible en esta ficha | Apache 2.0 | Modelo base completo | Hugging Face, ampliamente usado |
| Adaptadores LoRA genericos sobre Qwen3-1.7B | Adaptador | Heredado del base | Variable | PEFT | Variable |

La comparativa con alternativas de la misma categoria (adaptadores de honestidad o calibracion sobre modelos de 1-2B) no esta disponible: no se han identificado en la informacion proporcionada modelos comparables con evaluaciones publicadas equivalentes.

## Limitaciones y advertencias

- El autor declara explicitamente el estado "MEASURED. Not deployed; training completion is not deployment approval": el modelo no esta validado para produccion.
- La unica evaluacion publicada es una bateria de seis sondas, con 2 fallos en las tres sondas no respondibles; el propio autor advierte que no reclama otras evaluaciones.
- Riesgo de alucinacion: el adaptador no elimina la tendencia del base a inventar respuestas; de hecho, falla en 2 de 3 sondas no respondibles.
- Sesgos conocidos: no documentados, pero heredados del modelo base Qwen3-1.7B y del dataset measurement-honesty-v1, cuya composicion no se detalla.
- Limitaciones de contexto e idioma: no se declaran idiomas soportados ni longitud de contexto del adaptador; el entrenamiento uso max_seq 1536, lo que puede limitar el comportamiento en contextos mas largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen3-1.7B, cuya licencia debe verificarse por separado.
- No hay descargas ni likes, lo que indica ausencia de validacion por parte de la comunidad.
- El repositorio tiene un tamano de 0.0 GB, coherente con un adaptador de bajo rango, pero conviene verificar la integridad de los pesos antes de usarlo.
- El nombre del modelo y los tags ("w28t9-resurrection", "szl-estate") sugieren un contexto de campana interna del autor; no implican validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZLHOLDINGS/SZL-Measurement-Honesty-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/measurement-honesty-v1
- Wave logs (receipts de campana): https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Organizacion: https://huggingface.co/SZLHOLDINGS
- Repositorio GitHub del autor: https://github.com/szl-holdings
