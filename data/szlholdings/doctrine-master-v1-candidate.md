# SZLHOLDINGS/doctrine-master-v1-candidate

## Resumen

doctrine-master-v1-candidate es un adaptador LoRA (QLoRA) desarrollado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. Se enmarca en el programa de investigacion del autor sobre "honestidad" y abstención: el objetivo declarado es medir si un entrenamiento basado en reglas doctrinales de abstención mejora la capacidad del modelo para reconocer cuando no sabe algo y abstenerse de responder, en lugar de confabular. El adaptador se entrena sobre el currículo SZLHOLDINGS/abstention-doctrine-sft-v1 con 200 pasos de QLoRA (r=16, alpha=32, dropout=0.05) sobre los módulos de atención q_proj/k_proj/v_proj/o_proj.

El modelo se publica como candidato y, segun la propia model card, no supera la puerta de promocion interna: obtiene 3/6 en una bateria de 6 sondas (3 respondibles y 3 no respondibles) con decodificación determinista, por debajo del umbral de 4/6 exigido para su promocion. La conclusión declarada por el autor es que "las reglas no ensenan honestidad de dominio": el currículo doctrinal no mueve el suelo de confabulación, a diferencia del currículo de honestidad de dominio cuantitativo, que alcanza 5/6.

Es relevante ahora como artefacto de investigacion reproducible: el autor publica recibos (receipts) con procedencia completa (ID de nodo, UUID de GPU, versión de driver, resultados por sonda) en una cadena publica, lo que permite auditar la medición. No es un modelo listo para producción ni un modelo autónomo: es un adaptador PEFT que requiere cargar el modelo base Qwen3-1.7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer Qwen3-1.7B; target_modules q_proj/k_proj/v_proj/o_proj, r=16, alpha=32, dropout=0.05 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3-1.7B tiene 1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16 con QLoRA; no se detallan cuantizaciones de inferencia) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria peft) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA entrenado con QLoRA sobre Qwen/Qwen3-1.7B. La configuración concreta es r=16, alpha=32, dropout=0.05 y módulos objetivo q_proj, k_proj, v_proj y o_proj, es decir, solo las proyecciones de atención, no las de MLP. El entrenamiento se realizó durante 200 pasos con batch_size=2, grad_accum=4, learning rate 2e-4 y precisión bf16, sobre una NVIDIA RTX A6000 (48 GB), en el nodo 0056-kci3-sma6-prxmx200114 con driver 595.99.02.

El currículo de entrenamiento es SZLHOLDINGS/abstention-doctrine-sft-v1, un conjunto de datos de ajuste supervisado orientado a reglas de abstención. La innovación declarada no está en la arquitectura sino en el protocolo de evaluación: una bateria de 6 sondas fijas (3 respondibles, 3 no respondibles), decodificación determinista, máximo 200 tokens, y un vocabulario de abstención de 17 términos. El resultado se registra en un recibo con hash (bcc66c6210f96d13) y procedencia completa en una cadena publica. El autor compara este currículo con otros cuatro (base sin entrenar, abstención densa, honestidad de dominio cuantitativo y habilidades de código) para aislar qué tipo de entrenamiento mueve el suelo de confabulación.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3-1.7B (no se documentan capacidades adicionales específicas del adaptador).
- Abstención ante preguntas no respondibles: el adaptador se entrena para emitir términos de un vocabulario de abstención de 17 entradas cuando no dispone de información suficiente.
- Ajuste supervisado (SFT) sobre un currículo doctrinal de reglas de abstención.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la informacion disponible.
- Capacidades multilingües: no disponibles.
- No se documentan modos especiales (thinking mode, vision, audio) en la informacion disponible.

## Casos de uso

- Investigacion sobre calibración y abstención: el adaptador sirve como punto de comparación en experimentos que miden si el ajuste supervisado con reglas reduce la confabulación; su valor es el protocolo reproducible con recibos, no el rendimiento bruto.
- Reproducción de experimentos de honestidad epistémica: cargar el adaptador sobre Qwen3-1.7B y ejecutar la bateria de 6 sondas con decodificación determinista para verificar el resultado 3/6 y el recibo bcc66c6210f96d13.
- Estudio de currículos de SFT: comparar este adaptador (currículo doctrinal) con el de honestidad de dominio cuantitativo (5/6) para analizar qué tipo de datos transfiere a la abstención general.
- Prototipado de sistemas de "no sé": integrar el adaptador en un pipeline de pregunta-respuesta donde se quiera inspeccionar el comportamiento de abstención ante consultas fuera de dominio, siempre con el modelo base como dependencia.
- Auditoria de procedencia de modelos: usar la cadena de recibos y el explorador de la cadena para verificar hardware, driver y resultados por sonda de un entrenamiento concreto.
- Docencia y divulgación: ejemplo didáctico de cómo un LoRA pequeño (200 pasos, r=16) sobre un modelo de 1.7B no mejora automáticamente una métrica de comportamiento, y de cómo documentar resultados negativos con trazabilidad.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Bateria de 6 sondas (3 respondibles + 3 no respondibles), decodificación determinista, 200 tokens max | 3/6 |
| Umbral de promocion interno (barra de agente) | 4/6 |
| Veredicto | NOT PROMOTED |
| Base sin entrenar (referencia del autor) | 3/6 |
| Abstención densa (forma) | 3/6 (sobre-abstención) |
| Honestidad de dominio (cuantitativo) | 5/6 |
| Habilidades de código | 3/6 |
| Doctrina de abstención (reglas, este modelo) | 3/6 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es pequeño (repo de 0.0 GB), pero requiere cargar el modelo base Qwen3-1.7B para inferencia.
- VRAM estimada para el modelo base en bf16: aproximadamente 3.4 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 4 bits, en torno a 1-1.5 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM puede ejecutar el modelo base en cuantización de 4 bits; en bf16 se recomienda 12 GB o más. El entrenamiento se realizó en una RTX A6000 (48 GB).
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, siempre que se use cuantización adecuada.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la libreria peft/transformers; para servir el modelo base se puede usar vLLM o TGI (con soporte de adaptadores LoRA), o llama.cpp/Ollama si se fusionan los pesos y se convierten a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Evaluacion declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doctrine-master-v1-candidate (este) | Adaptador LoRA sobre Qwen3-1.7B | no disponible | 3/6 en bateria propia de 6 sondas | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3-1.7B (base) | 1.7B | no disponible en la informacion proporcionada | 3/6 en la misma bateria (referencia del autor) | no disponible en la informacion proporcionada | Hugging Face |
| Currículo honestidad de dominio (variante del autor) | Adaptador LoRA sobre Qwen3-1.7B | no disponible | 5/6 en la misma bateria | no disponible en la informacion proporcionada | Referenciado en la cadena de recibos del autor |

No se dispone de datos para comparar con alternativas externas de la misma categoria (adaptadores de abstención o calibración) en la informacion proporcionada.

## Limitaciones y advertencias

- La bateria de evaluación son 6 sondas fijas, no una evaluación exhaustiva; el 3/6 tiene baja potencia estadística.
- El vocabulario de abstención es de 17 términos; otras formulaciones de abstención pueden no detectarse.
- Es un adaptador LoRA sobre Qwen3-1.7B, no un modelo autónomo: requiere el modelo base y la libreria peft.
- El autor declara que el "suelo de confabulación" es una propiedad de la decodificación y que esta medición es un solo punto de datos dentro de un contraste de cinco currículos.
- El modelo no supera la puerta de promocion interna (3/6 frente a 4/6): no está validado para uso en producción.
- Riesgo de alucinación: el propio hallazgo del autor es que las reglas no ensenan honestidad de dominio, por lo que la abstención puede fallar en dominios específicos.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-1.7B, no incluida en la informacion proporcionada.
- Idiomas soportados: no disponibles; no hay garantia de comportamiento multilingüe más allá del modelo base.
- Contexto máximo: no disponible; no debe asumirse una ventana mayor que la del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/doctrine-master-v1-candidate
- Cadena de recibos (dataset): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Explorador de la cadena: https://szlholdings-szl-receipts-chain.hf.space
- SDK szl en PyPI: https://pypi.org/project/szl/
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
