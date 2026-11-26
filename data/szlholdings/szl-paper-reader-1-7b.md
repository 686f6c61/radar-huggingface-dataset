# SZLHOLDINGS/SZL-Paper-Reader-1.7B

## Resumen

SZL-Paper-Reader-1.7B es un adaptador QLoRA publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo entrenado desde cero, sino de un ajuste fino mediante PEFT con rango r=8 y alpha=16 usando rsLoRA, aplicado sobre las proyecciones q/k/v/o y gate/up/down de la arquitectura transformer densa de Qwen3. El adaptador se ha entrenado sobre el dataset propietario SZLHOLDINGS/papers-sft-v1, orientado presumiblemente a la lectura y respuesta sobre articulos cientificos, aunque la model card no detalla la composicion del corpus.

El modelo se enmarca en la campana interna "W28T9 resurrection" de SZLHOLDINGS y se presenta bajo una doctrina de "receipts-first" (trazabilidad estricta): el autor declara explicitamente que el estado es MEASURED y no desplegado, y que la finalizacion del entrenamiento no constituye aprobacion para produccion. El entrenamiento se realizo en una RTX A6000 de Massed Compute, con 120 pasos, learning rate 1e-4, batch efectivo de 8 y longitud maxima de secuencia de 1536 tokens.

La relevancia de este modelo es limitada y muy acotada: se trata de un adaptador de investigacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados mas alla de una bateria interna de seis sondas. Resulta util como referencia de como se documenta un ajuste fino con trazabilidad completa, pero no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) con adaptador PEFT QLoRA rsLoRA r=8, alpha=16 |
| Parametros totales | no disponible (modelo base Qwen3-1.7B; el adaptador anade un subconjunto de parametros de bajo rango) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max_seq 1536; el contexto nativo depende de Qwen3-1.7B) |
| Tipos de cuantizacion | carga en 4 bits durante el entrenamiento (QLoRA); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer denso de la familia Qwen3. El ajuste emplea QLoRA: el modelo base se carga en 4 bits y se entrenan adaptadores de bajo rango con rsLoRA (rank-stabilized LoRA) de rango 8 y alpha 16, insertados en las proyecciones de atencion q/k/v/o y en las proyecciones MLP gate/up/down. La semilla de entrenamiento declarada es 20260721.

El entrenamiento consistio en 120 pasos con learning rate 1e-4, batch de 2x4 (efectivo 8) y longitud maxima de secuencia de 1536 tokens, sobre el split train.jsonl del dataset SZLHOLDINGS/papers-sft-v1 (sha256 fec771e22d22d9a9...). No se documenta el numero total de tokens, la composicion del dataset, ni si hubo etapas de RLHF, DPO o preferencia. El autor publica un training_receipt.json con esquema szl.training_receipt.v2 como mecanismo de trazabilidad, pero no se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional sobre el modelo base Qwen3-1.7B.
- Orientacion declarada a lectura y respuesta sobre articulos cientificos (paper reading), segun el nombre y el dataset de entrenamiento.
- Hereda las capacidades del modelo base Qwen3-1.7B, aunque el adaptador no ha sido evaluado para ellas.
- Soporte de tool calling / function calling: no disponible (no evaluado en el adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible (no evaluado).
- Capacidades multilingues: no disponibles (no documentadas).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Experimentacion academica con QLoRA/rsLoRA: el adaptador sirve como ejemplo reproducible de ajuste fino de bajo rango sobre Qwen3-1.7B, con receta (rango, alpha, pasos, learning rate) documentada y receipt de entrenamiento.
- Lectura asistida de articulos cientificos en prototipos: el nombre y el dataset sugieren un uso orientado a responder preguntas sobre papers, aunque la evaluacion interna (3/6 en bateria de seis sondas) indica que la fiabilidad es baja y solo apta para entornos de prueba.
- Investigacion sobre trazabilidad de modelos: la model card incluye receipts, hashes y logs de campana, lo que lo hace util como caso de estudio de documentacion "receipts-first".
- Evaluacion de la doctrina "fail-closed": util para equipos que quieran comparar practicas de publicacion de adaptadores con metricas declaradas y alcance explicito.
- Base para posteriores ajustes: al ser un adaptador PEFT sobre Qwen3-1.7B, puede combinarse o continuar entrenandose en pipelines de investigacion.
- Pruebas de integracion con PEFT/Transformers: el quickstart con AutoPeftModelForCausalLM permite validar flujos de carga de adaptadores en entornos de desarrollo.

## Benchmarks y rendimiento

| Conjunto de prueba | Puntuacion | Loss (MEASURED) | Filas | Runtime |
|---|---|---|---|---|
| Estate battery: 3 answerable + 3 unanswerable | 3/6 | 1.5557704130808512 | 34 | 102.6 s |

Desglose por sonda: a1=PASS, a2=PASS, a3=PASS, u1=FAIL, u2=FAIL, u3=FAIL. El autor declara explicitamente que no se reclaman otras evaluaciones. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en 4 bits requiere aproximadamente 1-2 GB; en fp16, alrededor de 3,5 GB. El adaptador anade una cantidad marginal de memoria.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizacion en 4 bits; el entrenamiento se realizo en una RTX A6000 (48 GB).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, siempre que se use cuantizacion o el modelo base en 4 bits.
- Opciones de despliegue: PEFT + Transformers (AutoPeftModelForCausalLM), con posibilidad de fusionar el adaptador y exportar a vLLM, llama.cpp u Ollama, aunque no se documenta soporte oficial para estos ultimos.
- Latencia y throughput estimados: no disponibles. La unica medida publicada es el runtime de la bateria de evaluacion (102,6 s para 34 filas), que no constituye un benchmark de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SZL-Paper-Reader-1.7B | Adaptador sobre Qwen3-1.7B | no disponible | 3/6 en bateria interna | apache-2.0 | Hugging Face (0 descargas) |
| Qwen3-1.7B (base) | 1,7B | no disponible en la informacion | no disponible | apache-2.0 | Hugging Face |
| Adaptadores QLoRA genericos sobre Qwen3-1.7B | variable | variable | no disponible | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre este adaptador y alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara el estado como MEASURED y no desplegado: el entrenamiento completado no implica aprobacion para produccion.
- Resultado de la bateria interna: 3/6, con fallo en las tres sondas no respondibles (u1, u2, u3), lo que sugiere problemas para abstenerse cuando la respuesta no esta en el contexto.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni evaluaciones de seguridad.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Longitud de contexto efectiva no documentada; el entrenamiento uso max_seq 1536, lo que puede limitar el rendimiento en contextos mas largos aunque el modelo base los soporte.
- Licencia apache-2.0, que permite uso comercial, pero sin garantias de calidad ni soporte por parte del autor.
- No se han publicado evaluaciones estandar (MMLU, HumanEval, GSM8K), por lo que no es posible comparar su calidad con alternativas.
- El nombre del modelo sugiere una especializacion en lectura de papers, pero no hay evidencia publicada que confirme un rendimiento solido en esa tarea.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZLHOLDINGS/SZL-Paper-Reader-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/papers-sft-v1
- Logs de campana: https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Organizacion: https://huggingface.co/SZLHOLDINGS
- Repositorio GitHub del autor: https://github.com/szl-holdings
