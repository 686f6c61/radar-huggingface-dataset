# SZLHOLDINGS/SZL-Quant-Research-1.7B

## Resumen

SZL-Quant-Research-1.7B es un adaptador QLoRA publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo entrenado desde cero, sino de un ajuste fino de bajo rango (rsLoRA con r=8 y alpha=16) aplicado sobre las proyecciones q/k/v/o y gate/up/down del transformer de Qwen3-1.7B, cargado en 4 bits durante el entrenamiento. El adaptador se distribuye como pesos PEFT en formato safetensors y requiere cargar el modelo base para su uso.

El modelo se presenta dentro de lo que el autor denomina "estate resurrection lane (campaign W28T9)", un marco interno de trazabilidad con recibos de entrenamiento y evaluaciones. El entrenamiento consistió en 120 pasos con learning rate 1e-4, batch efectivo de 8 (2x4) y longitud máxima de secuencia de 1536 tokens, sobre el dataset SZLHOLDINGS/quant-curriculum-v1, ejecutado en una RTX A6000.

Su relevancia es limitada y muy acotada: el propio autor lo marca como "MEASURED, not deployed" y solo reporta una batería de 6 sondas con un resultado de 3/6 (las tres preguntas respondibles pasan, las tres no respondibles fallan). No hay benchmarks estándar, ni evaluación multilingüe, ni datos de despliegue en producción. Es un artefacto de investigación reproducible más que un modelo listo para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA/rsLoRA (PEFT) |
| Parametros totales | 1,7B en el modelo base; el adaptador añade un número no especificado de parámetros de bajo rango |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1536 tokens durante el entrenamiento (contexto nativo del base Qwen3-1.7B no disponible en la información) |
| Tipos de cuantizacion | Carga del base en 4 bits durante entrenamiento (QLoRA); cuantizaciones de inferencia no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT); requiere el base Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. La técnica empleada es QLoRA: el modelo base se carga cuantizado en 4 bits y se entrena un adaptador de bajo rango con rsLoRA (rank-stabilized LoRA) de r=8 y alpha=16 sobre las proyecciones de atención q/k/v/o y las proyecciones del MLP gate/up/down. La semilla de entrenamiento es 20260721.

El entrenamiento usó el dataset SZLHOLDINGS/quant-curriculum-v1 (archivo data/train.json, sha256 39ebf3ccf491e06b...), con un schedule de 120 pasos, learning rate 1e-4, batch 2x4 (efectivo 8) y max_seq de 1536 tokens, ejecutado en una RTX A6000 (nodo 0a63cb475677, Massed Compute). No se documentan el número total de tokens vistos, la composición del dataset, ni si hubo etapas de RLHF/DPO. El autor incluye un training_receipt.json con formato szl.training_receipt.v2 como recibo de trazabilidad.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Ajuste orientado a un "curriculum cuantitativo" del dataset quant-curriculum-v1, cuya naturaleza exacta no se detalla.
- Capacidad de responder preguntas respondibles dentro de la batería de evaluación del autor (3/3 aciertos).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües no disponibles.
- Razonamiento, código y matemáticas: no evaluados ni documentados.

## Casos de uso

- Investigación reproducible de QLoRA/rsLoRA: sirve como ejemplo de adaptador de bajo rango con recibos de entrenamiento y evaluación, útil para estudiar pipelines PEFT sobre Qwen3-1.7B.
- Experimentos controlados de ajuste fino: su configuración (r=8, alpha=16, 120 pasos, lr 1e-4) permite replicar o comparar variantes de hiperparámetros en un entorno de laboratorio.
- Evaluación de honestidad y abstención: la batería de 6 sondas (3 respondibles, 3 no respondibles) puede reutilizarse para medir la tendencia del modelo a responder cuando no debería.
- Docencia y formación: como caso práctico de cómo documentar un adaptador con recibos y alcance declarado de métricas.
- Base para ajustes posteriores: al ser un adaptador PEFT sobre Qwen3-1.7B, puede combinarse o continuarse con otros adaptadores en experimentos de composición.
- Prototipado interno de conversación: para pruebas de generación de texto en entornos controlados, siempre que se valide el comportamiento antes de cualquier uso real.

## Benchmarks y rendimiento

| Conjunto de prueba | Resultado | Loss | Filas | Tiempo |
|---|---|---|---|---|
| Estate battery: 3 respondibles + 3 no respondibles | 3/6 (a1 PASS, a2 PASS, a3 PASS, u1 FAIL, u2 FAIL, u3 FAIL) | 0,6108049184083939 | 1000 | 122,8 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor declara explícitamente que no reclama otras evaluaciones.

## Requisitos de hardware

- VRAM estimada: el base Qwen3-1.7B en 4 bits ocupa aproximadamente 1-1,5 GB de pesos; en fp16 unos 3,4 GB. El adaptador añade una cantidad marginal. No se dispone de cifras oficiales del autor.
- GPU recomendadas: el entrenamiento se ejecutó en una RTX A6000 (48 GB). Para inferencia, una GPU consumer con 8 GB o más es suficiente para el base en 4 bits.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060/4060 (8-12 GB) o superiores, en cuantizaciones de 4-8 bits.
- Opciones de despliegue: PEFT + transformers (documentado por el autor con AutoPeftModelForCausalLM). vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador; su uso requeriría fusionar el adaptador con el base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZL-Quant-Research-1.7B | 1,7B + adaptador | 1536 (entrenamiento) | Apache 2.0 | HF (0 descargas) | Solo evalúa batería de 6 sondas |
| Qwen/Qwen3-1.7B (base) | 1,7B | No disponible en esta ficha | Apache 2.0 | HF | Modelo base sin ajuste |
| Adaptadores LoRA genéricos sobre Qwen3-1.7B | 1,7B + adaptador | Variable | Según autor | HF | Sin benchmarks comparables disponibles |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El autor declara el estado como "MEASURED, not deployed": la finalización del entrenamiento no implica aprobación para despliegue.
- Solo se reporta una evaluación de 6 sondas con 3/6 aciertos; las tres preguntas no respondibles fallan, lo que sugiere una tendencia a responder cuando debería abstenerse.
- No hay benchmarks estándar, evaluación multilingüe ni pruebas de producción.
- Riesgo de alucinación no cuantificado más allá de la batería de honestidad.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto: 1536 tokens en entrenamiento; el contexto nativo del base no se especifica en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción sin validación propia.
- El repositorio tiene 0 descargas y 0 likes; es un artefacto de investigación sin adopción verificable.
- La model card incluye terminología interna ("estate resurrection lane", "fail-closed", "receipts-first") que no aporta garantías técnicas verificables externamente.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Quant-Research-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset: https://huggingface.co/datasets/SZLHOLDINGS/quant-curriculum-v1
- Recibos de campaña: https://huggingface.co/datasets/SZLHOLDINGS/wave-logs (ruta mesh/2026-11-26/ouroboros/w28t9-resurrection/)
- Organización: https://huggingface.co/SZLHOLDINGS
- Repositorio GitHub del autor: https://github.com/szl-holdings
