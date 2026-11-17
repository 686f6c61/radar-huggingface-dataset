# yava-code/Tessera-1B-Nano

## Resumen

Tessera-1B-Nano es un modelo de lenguaje de pequena escala desarrollado por yava-code que implementa una replicacion independiente y compacta de la arquitectura ConceptLM de Paragon Intelligence Labs. Parte del backbone de HuggingFaceTB/SmolLM2-360M (382,7 millones de parametros reales) y le anade una "ruta de conceptos" causal: cada 4 tokens se agrupan en un codigo de concepto, un modulo causal predice el siguiente codigo y esa prediccion se reinyecta en el decodificador mientras genera texto. El nombre "1B" hace referencia al presupuesto de entrenamiento (aproximadamente 1.000 millones de tokens), no al numero de parametros.

El interes del modelo no es tanto su rendimiento como su valor como estudio controlado: compara una rama con ruta de conceptos frente a una rama identica solo con prediccion de siguiente token (Tessera-1B-Nano-Base), con los mismos datos, mismo orden y misma inicializacion. Los resultados muestran que el decodificador si consulta el canal de conceptos (silenciarlo incrementa la perdida NTP en 0,1050 nats), pero que la informacion leida es intercambiable entre frases, temas y dominios: realimentar con conceptos de otra frase apenas cambia la perdida (delta de 0,0008).

Es relevante ahora porque documenta de forma reproducible y con artefactos publicos (eval.json, metrics.jsonl, whitepaper) un fenomeno poco explorado: un canal de conceptos que el modelo usa pero cuyo contenido no parece codificar identidad de frase ni mejorar la perdida de tokens a esta escala. Es una pieza de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (SmolLM2-360M) + ruta de conceptos causal (ConceptLM compacto) |
| Parametros totales | 382.718.400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estandar (SmolLM2-360M) con una ruta de conceptos anadida. Cada bloque de 4 tokens se agrega (pooling) en un codigo de concepto mediante un codebook de producto de 15 segmentos x 64 entradas. Dos bloques causales de conceptos predicen el siguiente concepto continuo (objetivo NCP), y la prediccion se inyecta antes del bloque 2 del decodificador de tokens. La funcion de perdida combina tres terminos: `L_ntp + 1 * L_ncp + 1 * L_vq` (prediccion de siguiente token, prediccion de siguiente concepto y cuantizacion vectorial).

El entrenamiento uso 999.948.288 tokens con el mismo corpus, orden e inicializacion que el control Tessera-1B-Nano-Base, que solo entrena con prediccion de siguiente token. El coste de computo estimado es de 30,27 dolares. El autor indica explicitamente que esta implementacion omite la codificacion residual iterativa, las conexiones residuales multi-escala y la receta de entrenamiento a gran escala del NCP-ArchPreview de 8.9B, por lo que es una version compacta del enfoque, no una replica.

## Capacidades

- Generacion de texto autoregresiva con prediccion de siguiente token (backbone SmolLM2-360M).
- Prediccion de siguiente concepto mediante un canal causal interno que se realimenta en el decodificador.
- Razonamiento y generacion de codigo basicos, heredados del backbone SmolLM2-360M (sin datos especificos publicados de estas capacidades).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre canales de conceptos: el modelo sirve como banco de pruebas reproducible para estudiar que informacion transporta un canal de prediccion de conceptos en un transformer causal, con artefactos de evaluacion publicos (eval.json, metrics.jsonl).
- Reproduccion de estudios controlados: permite replicar el diseno experimental de rama con conceptos frente a rama solo NTP con los mismos datos e inicializacion, util para validar hipotesis de investigacion en laboratorios academicos.
- Experimentos de ablacion de realimentacion: los modos de inferencia (realimentacion normal, silenciada, barajada) permiten medir la dependencia del decodificador respecto al canal de conceptos en tareas concretas.
- Prototipado de arquitecturas alternativas: sirve como plantilla de codigo (con `trust_remote_code`) para implementar variantes de ConceptLM en modelos pequenos antes de escalar.
- Docencia y formacion: modelo pequeno (382,7 M de parametros, repo de 1,5 GB) que cabe en hardware modesto y permite ilustrar conceptos de cuantizacion vectorial, prediccion latente y evaluacion por intervencion.
- Generacion de texto ligera en entornos de recursos limitados: el tamano permite ejecucion en CPU o GPU consumer para demos y pruebas de concepto, aunque sin garantias de calidad de produccion.

## Benchmarks y rendimiento

El autor publica metricas de entrenamiento y evaluacion por intervencion, no benchmarks estandar (MMLU, HumanEval, GSM8K).

| Metrica | Valor |
|---|---:|
| Perdida NTP en held-out | 2,5142 |
| Perplejidad en held-out | 12,3568 |
| Delta al silenciar la realimentacion (aumento de perdida NTP) | 0,1050 |
| Delta con realimentacion barajada (otra frase) | 0,0008 |
| Perplejidad / uso del codebook | 7,5477 / 85,6 % |
| Tokens de entrenamiento | 999.948.288 |
| Coste de computo estimado | 30,27 USD |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 382,7 M de parametros; en fp32 ocupa aproximadamente 1,5 GB, en fp16/bf16 unos 0,8 GB y en cuantizacion de 8 bits unos 0,4 GB (estimacion segun tamano, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: si, con amplio margen, incluidas GPUs de gama baja y ejecucion en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (metodo documentado). No se han publicado integraciones con vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tessera-1B-Nano | 382,7 M | no disponible | SmolLM2-360M + ruta de conceptos | apache-2.0 | Hugging Face |
| Tessera-1B-Nano-Base | no disponible (control del mismo backbone) | no disponible | SmolLM2-360M solo NTP | apache-2.0 (segun familia) | Hugging Face |
| Tessera-135M-Gate | 135 M (segun nombre) | no disponible | Puerta de arquitectura (sobreajuste) | no disponible | Hugging Face |
| HuggingFaceTB/SmolLM2-360M | 360 M aprox. | no disponible | Transformer causal estandar | no disponible en la informacion | Hugging Face |

La comparativa mas directa es con su propio control Tessera-1B-Nano-Base: misma inicializacion, mismos datos y mismo orden, con y sin ruta de conceptos. No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el propio autor lo presenta como un estudio controlado, no como un modelo para produccion.
- No mejora la perdida de tokens: a este presupuesto, la rama con conceptos iguala exactamente al control solo NTP.
- El canal de conceptos transporta informacion intercambiable entre frases, temas y dominios; no codifica identidad de frase.
- Implementacion compacta: omite codificacion residual iterativa, conexiones residuales multi-escala y la receta de entrenamiento a gran escala del NCP-ArchPreview de 8.9B.
- Sesgos conocidos: no disponibles; hereda los del corpus de entrenamiento de SmolLM2-360M, no documentados en esta ficha.
- Riesgo de alucinacion: presente como en cualquier modelo de lenguaje de este tamano; no cuantificado por el autor.
- Limitaciones de contexto e idioma: no declaradas; la longitud de contexto no esta disponible.
- Licencia apache-2.0, que permite uso comercial, pero el modelo base SmolLM2-360M tiene sus propias condiciones que deben verificarse.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar el codigo antes de desplegarlo.
- El nombre "1B" puede inducir a error: se refiere a tokens de entrenamiento, no a parametros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yava-code/Tessera-1B-Nano
- Repositorio del estudio: https://github.com/yava-code/Tessera-1B-Nano
- Demo comparativa (Space): https://huggingface.co/spaces/yava-code/tessera-comparison
- Control solo NTP: https://huggingface.co/yava-code/Tessera-1B-Nano-Base
- Puerta de arquitectura 135M: https://huggingface.co/yava-code/Tessera-135M-Gate
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Paper ConceptLM: https://arxiv.org/abs/2602.08984
- Paper NCP-ArchPreview: https://arxiv.org/abs/2609.10715
- Video demo: https://huggingface.co/yava-code/Tessera-1B-Nano/resolve/main/demo.mp4
