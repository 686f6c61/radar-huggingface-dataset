# SZLHOLDINGS/SZL-Reasoning-0.8B-v1

## Resumen

SZL-Reasoning-0.8B-v1 es un ajuste fino de tipo QLoRA SFT sobre el modelo SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez deriva de la familia Qwen 3.5 (tag `qwen3_5` en Hugging Face). Lo desarrolla SZLHOLDINGS y su proposito declarado es acercar el razonamiento logico formal a un modelo pequeno mediante datos de entrenamiento "certificados": 242 puzzles de logica cuyas cadenas de deduccion fueron extraidas por solucionadores SAT (MiniSat + CP-SAT) y verificadas formalmente, en lugar de generadas por otro modelo.

El modelo tiene 873.438.784 parametros (0,87B) y un repositorio de 1,8 GB en safetensors. La innovacion no esta en la arquitectura, sino en la procedencia del dataset de instrucciones: cada hecho de la cadena de razonamiento esta anotado con el conjunto minimo de pistas que lo fuerza, calculado mediante minimal-core SAT. El autor es explicito sobre el alcance: es un corpus semilla y no reclama mejoras generales de razonamiento.

Es relevante ahora como ejemplo de practica de evaluacion honesta en el ecosistema open source: la model card publica el estado de evaluacion como `BASELINE_MEASURED_DELTA_PENDING` y reconoce que el modelo hermano de 4B obtuvo una tasa de solucion exacta de 0,0 sobre 48 puzzles certificados. No es un modelo listo para produccion, pero si un artefacto util para estudiar tecnicas de supervision con ground truth formal en modelos por debajo de 1B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, tag `qwen3_5`); detalles de capas y atencion no disponibles |
| Parametros totales | 873.438.784 (0,87B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el entrenamiento uso QLoRA y el push se hizo en 16 bits |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer decoder-only de la familia Qwen 3.5 con 0,87B de parametros. El pipeline declarado es `text-generation`, aunque los tags incluyen `image-text-to-text`, lo que sugiere que el base conserva la torre multimodal de Qwen 3.5; la model card no documenta el uso de vision en este ajuste. No se publican detalles de numero de capas, dimension oculta, atencion (full o hibrida) ni vocabulario.

El entrenamiento consistio en un QLoRA SFT con Unsloth + TRL sobre una NVIDIA A6000, con merge posterior a 16 bits. El dataset, `SZLHOLDINGS/reasoning-puzzles-sft-v1`, contiene 242 ejemplos de puzzles de logica construidos a partir del benchmark de soluciones unicas certificadas de Behnamian (2025). La innovacion tecnica es la construccion de los objetivos chain-of-thought: cada paso de deduccion se verifica contra la codificacion SAT y cada puzzle esta certificado como de solucion unica por dos solucionadores independientes. No se menciona RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento logico sobre puzzles de deduccion con solucion unica, el dominio especifico del dataset de ajuste.
- Produccion de cadenas de razonamiento paso a paso (estilo chain-of-thought) inducidas por los datos de entrenamiento.
- Compatibilidad con endpoints (`endpoints_compatible`) y con text-generation-inference segun los tags.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso general: no disponibles; el autor no reclama transferencia fuera del dominio.
- Capacidades multilingues: solo ingles declarado.
- Vision, audio o modo thinking explicito: no disponibles.

## Casos de uso

- Investigacion sobre supervision con ground truth formal: usar el modelo y su dataset para estudiar si las cadenas de deduccion verificadas por SAT producen mejor adherencia logica que las racionalidades generadas por modelos mayores, comparando tasas de solucion exacta en puzzles certificados.
- Generacion de datos sinteticos de razonamiento para destilacion: el modelo puede servir como generador de borradores de cadenas de deduccion que despues se filtran con un verificador SAT, aprovechando su bajo coste de inferencia (0,87B).
- Prototipado de asistentes de logica en entornos educativos: con 0,87B cabe en GPU de consumo y permite iterar rapidamente sobre interfaces de resolucion de puzzles sin coste de API.
- Evaluacion de tecnicas de cuantizacion en modelos sub-1B: util como sujeto de prueba para medir la degradacion de razonamiento al pasar de 16 bits a 4 bits, dado que el dominio tiene metrica exacta (tasa de solucion).
- Base para ajustes especificos de dominio: al ser Apache 2.0 y pequeno, sirve como punto de partida para fine-tunes en dominios con verificadores deterministas (reglas de negocio, validacion de formularios, comprobacion de restricciones).
- Docencia y divulgacion sobre evaluacion honesta: la model card y sus recibos de evaluacion son material didactico sobre como reportar baselines negativos y estados de medicion pendientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del propio modelo en la informacion disponible. La model card solo reporta el baseline del modelo hermano de 4B:

| Modelo | Evaluacion | Resultado |
|---|---|---|
| SZL-Reasoning (hermano 4B) | 48 puzzles certificados (L1-L3), parseo JSON exacto | 0,0 tasa de solucion exacta |
| SZL-Reasoning-0.8B-v1 | Misma evaluacion | pendiente (`BASELINE_MEASURED_DELTA_PENDING`) |

No hay datos de MMLU, HumanEval, GSM8K ni de comparativas con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en fp16 (pesos de 0,87B), en torno a 1 GB en cuantizacion de 8 bits y 0,5-0,7 GB en 4 bits, mas overhead de KV cache y runtime.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en fp16; el entrenamiento se realizo en una NVIDIA A6000.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference segun tags; llama.cpp, Ollama o vLLM no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SZL-Reasoning-0.8B-v1 | 0,87B | no disponible | SFT sobre puzzles certificados por SAT | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen 3.5 base (familia del modelo) | ~0,8B | no disponible | Modelo generalista | segun variante | amplia |
| SZL-Reasoning 4B (hermano) | ~4B | no disponible | Mismo dataset certificado | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Corpus de entrenamiento semilla de solo 242 ejemplos: el autor advierte transferencia estrecha y no reclama mejora general de razonamiento.
- Estado de evaluacion pendiente: no existe todavia medicion publicada del delta frente al baseline de 0,0 del modelo de 4B.
- El autor declara explicitamente que el modelo no es apto para produccion y que ningun endpoint x402 lo sirve.
- Solo ingles declarado; sin soporte multilingue verificado.
- Riesgo de alucinacion: la propia doctrina del autor trata la salida como "propuesta no confiable" que debe pasar por un controlador deterministico y aprobacion humana.
- Sesgos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion y el alcance limitado desaconsejan ese uso sin validacion propia.
- Contexto maximo no documentado: planificar prompts cortos hasta verificar la ventana real del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Reasoning-0.8B-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/reasoning-puzzles-sft-v1
- Registro de olas de entrenamiento: https://huggingface.co/SZLHOLDINGS/wave-logs
- Recibos de evaluacion: https://huggingface.co/SZLHOLDINGS/model-eval-receipts
- Referencia del benchmark: Behnamian (2025), benchmark de puzzles con solucion unica certificada (sin URL en la informacion disponible)
