# vllm-project/qwen2.5-vl-7b-eagle3-sgl

## Resumen

`vllm-project/qwen2.5-vl-7b-eagle3-sgl` es un modelo borrador (*draft model*) para decodificación especulativa con el algoritmo EAGLE3, diseñado para acelerar la inferencia de `Qwen/Qwen2.5-VL-7B-Instruct` en el motor SGLang. No es un modelo de lenguaje autónomo: se trata de una cabeza predictora de tokens que propone candidatos que el modelo objetivo verifica en paralelo, reduciendo la latencia de generación sin alterar la distribución de salida. Lo mantiene el equipo de vLLM como copia de un checkpoint original alojado en una cuenta personal (`Rayzl/qwen2.5-vl-7b-eagle3-sgl`), con el objetivo de mitigar riesgos de cadena de suministro en su integración continua.

El modelo tiene 947.980.032 parámetros en formato safetensors (aproximadamente 0,95 mil millones), lo que lo sitúa muy por debajo del modelo objetivo de 7 mil millones al que acompaña. Se entrenó sobre 30.000 muestras seleccionadas aleatoriamente del dataset multimodal `FreedomIntelligence/ALLaVA-4V`, usando la herramienta SpecForge del ecosistema SGLang. La arquitectura declarada en los metadatos es `llama`, aunque funcionalmente actúa como borrador EAGLE3 acoplado a la torre de visión y al decoder de Qwen2.5-VL.

Su relevancia es práctica: la model card reporta una aceleración extremo a extremo de 1,5x en la tarea MMStar, pasando de 121,230 tokens/s a 181,069 tokens/s de throughput de salida y de 54,813 s a 34,241 s de latencia, con una longitud media de aceptación de 3,219 tokens por paso especulativo. Es, por tanto, una pieza de infraestructura para servir modelos vision-language de forma más económica, no un modelo para uso directo en aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (metadatos); funcionalmente borrador EAGLE3 para Qwen2.5-VL-7B-Instruct |
| Parametros totales | 947.980.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo objetivo Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 1,9 GB |
| Modelo objetivo | Qwen/Qwen2.5-VL-7B-Instruct |
| Algoritmo especulativo | EAGLE3 |
| Motor de inferencia | SGLang |
| Dataset de entrenamiento | FreedomIntelligence/ALLaVA-4V (30k muestras aleatorias) |

## Arquitectura y entrenamiento

El checkpoint implementa un borrador EAGLE3, una variante de decodificación especulativa en la que un modelo pequeño predice varios tokens futuros a partir de las representaciones ocultas del modelo objetivo. En la práctica, el borrador consume el estado interno de Qwen2.5-VL-7B-Instruct y propone una secuencia de tokens candidatos; el modelo grande verifica esos candidatos en un único paso forward, aceptando el prefijo correcto y descartando el resto. Según la configuración de ejemplo de la model card, se emplean 4 pasos especulativos, top-k 6 en la selección EAGLE y hasta 24 tokens borrador por iteración, con `--cuda-graph-max-bs 1` y `--chunked-prefill-size -1`.

El entrenamiento se realizó con SpecForge (PR #102 del repositorio sgl-project/SpecForge) sobre 30.000 ejemplos muestreados aleatoriamente de ALLaVA-4V, un dataset multimodal de instrucciones con imágenes. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset, ni si hubo fases de RLHF o DPO; tampoco se especifican innovaciones adicionales más allá del propio mecanismo EAGLE3. El checkpoint es una copia exacta del commit `38d2bc0` del repositorio original, creada el 30 de octubre de 2026 para uso interno en la CI de vLLM.

## Capacidades

- Predicción especulativa de tokens para acelerar la inferencia de Qwen2.5-VL-7B-Instruct en SGLang.
- Generación de múltiples tokens candidatos por paso (hasta 24 tokens borrador con la configuración de referencia).
- Compatibilidad con entradas multimodales, al estar entrenado sobre ALLaVA-4V y acoplarse a un modelo vision-language.
- Integración con decodificación especulativa EAGLE3 mediante los parámetros `--speculative-algo EAGLE3`, `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens`.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible de forma directa; estas capacidades las aporta el modelo objetivo, no el borrador.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`), aunque la cobertura real depende del modelo objetivo.
- No es un modelo autónomo: no debe invocarse sin el modelo objetivo Qwen2.5-VL-7B-Instruct.

## Casos de uso

- Servicio de un VLM en producción con SGLang: desplegar `Qwen/Qwen2.5-VL-7B-Instruct` junto con este borrador reduce la latencia de generación aproximadamente un 33 % (de 54,813 s a 34,241 s en MMStar) y aumenta el throughput de 121,230 a 181,069 tokens/s, lo que abarata el coste por petición en entornos con alta concurrencia.
- Evaluación de modelos vision-language a gran escala: al acelerar la generación, permite ejecutar suites como MMStar sobre miles de preguntas en menos tiempo, útil en pipelines de evaluación continua o en la comparación de variantes del modelo objetivo.
- Integración en CI/CD de vLLM: el propio repositorio existe para que la CI de vLLM valide la ruta de decodificación especulativa EAGLE3 con un checkpoint estable y bajo control de versiones, reduciendo el riesgo de dependencia de una cuenta personal.
- Chat multimodal de bajo coste: aplicaciones de asistencia sobre imágenes (descripción, VQA, extracción de información de documentos escaneados) pueden beneficiarse de la reducción de latencia sin cambiar el modelo de referencia ni la calidad de las respuestas.
- Prototipado de pipelines de agentes visuales: en flujos multi-paso donde el modelo debe inspeccionar imágenes y razonar sobre ellas, la menor latencia por token se traduce en ciclos de agente más rápidos, siempre que el orquestador use SGLang.
- Investigación en decodificación especulativa: sirve como referencia reproducible para estudiar el efecto de la longitud de aceptación (3,219 tokens con EAGLE3 frente a 1,000 sin él) y ajustar hiperparámetros como el número de pasos o el top-k.
- Despliegue en hardware limitado: al requerir únicamente 1,9 GB de pesos adicionales, el coste de memoria sobre el modelo objetivo es reducido, lo que facilita añadir aceleración a despliegues existentes con presupuesto de VRAM ajustado.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card, medidos sobre MMStar con 100 preguntas y paralelismo 1:

| Metrica | Con EAGLE3 | Sin EAGLE3 | Mejora |
|---|---|---|---|
| Latencia | 34,241 s | 54,813 s | 1,5x (e2e) |
| Throughput de salida | 181,069 token/s | 121,230 token/s | +49,4 % |
| Longitud de aceptación | 3,219 | 1,000 | 3,2x |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de un modelo borrador cuya calidad se mide por la tasa de aceptación y no por métricas de tarea.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 1,9 GB en precisión original (947.980.032 parámetros en safetensors); se suma a la memoria del modelo objetivo Qwen2.5-VL-7B-Instruct.
- VRAM total del sistema: la del modelo objetivo (del orden de 15-16 GB en BF16 para 7B, más memoria para KV cache y visión) más los ~2 GB del borrador.
- GPU recomendadas: la configuración de referencia usa `--tp 1`, por lo que cabe en una sola GPU. Una A100 40/80 GB, H100 o L40S son adecuadas para producción; en consumer, una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede alojar el conjunto en BF16 con margen limitado para KV cache.
- Cabe en GPU consumer: sí, en tarjetas de 24 GB o más, siempre que se ajuste `--mem-fraction-static` (0,7 en el ejemplo) y el tamaño de contexto.
- Opciones de despliegue: SGLang es el motor soportado explícitamente (`python -m sglang.launch_server` con `--speculative-draft`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 34,241 s de latencia y 181,069 tokens/s de salida en MMStar con 100 preguntas, paralelismo 1 y la configuración indicada (4 pasos especulativos, top-k 6, 24 tokens borrador).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vllm-project/qwen2.5-vl-7b-eagle3-sgl | 947.980.032 | no disponible | Borrador EAGLE3 para Qwen2.5-VL-7B | apache-2.0 | Hugging Face (copia CI de vLLM) |
| Rayzl/qwen2.5-vl-7b-eagle3-sgl | no disponible | no disponible | Borrador EAGLE3 para Qwen2.5-VL-7B | apache-2.0 | Hugging Face (cuenta personal) |
| Qwen/Qwen2.5-VL-7B-Instruct | ~7B | no disponible | Modelo VLM objetivo | no disponible en esta ficha | Hugging Face |

La comparación relevante es con el checkpoint original del que deriva esta copia: mismos pesos, mismo commit (`38d2bc0`), misma licencia, pero alojado en una organización en lugar de una cuenta personal. Frente a otros borradores EAGLE3 para modelos no visuales, no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin Qwen2.5-VL-7B-Instruct no produce salidas útiles; su uso aislado carece de sentido.
- Dependencia estricta de SGLang: la model card solo documenta el despliegue con SGLang y la ruta EAGLE3; otros motores no están soportados según la información disponible.
- Cobertura de entrenamiento limitada: 30.000 muestras de ALLaVA-4V, lo que puede reducir la tasa de aceptación en dominios alejados de ese dataset (documentos técnicos, OCR denso, imágenes médicas, etc.).
- Idioma: metadatos restringen el modelo a inglés; el comportamiento en otros idiomas no está documentado.
- Riesgo de alucinación: el borrador puede proponer tokens incorrectos, pero el modelo objetivo los verifica; el riesgo real recae en el VLM objetivo, no en el borrador.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al heredar el dataset ALLaVA-4V, puede reflejar los sesgos de sus fuentes.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar la licencia del modelo objetivo Qwen2.5-VL-7B-Instruct, que no se detalla en esta ficha.
- Naturaleza de copia: el repositorio es una réplica de la CI de vLLM con fecha de creación futura (2026-10-30) respecto a la información habitual; verificar la integridad y el commit antes de usarlo en producción.
- Sin métricas de calidad: no hay benchmarks de precisión publicados; la única métrica disponible es la tasa de aceptación y el speedup en MMStar.

## Enlaces

- Hugging Face (copia vLLM): https://huggingface.co/vllm-project/qwen2.5-vl-7b-eagle3-sgl
- Hugging Face (original): https://huggingface.co/Rayzl/qwen2.5-vl-7b-eagle3-sgl
- Modelo objetivo: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/FreedomIntelligence/ALLaVA-4V
- SpecForge (entrenamiento EAGLE3, PR #102): https://github.com/sgl-project/SpecForge/pull/102
- SpecForge (benchmark MMStar, PR #106): https://github.com/sgl-project/SpecForge/pull/106
- SGLang (soporte EAGLE3, PR #8801): https://github.com/sgl-project/sglang/pull/8801
