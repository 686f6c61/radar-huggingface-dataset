# SZLHOLDINGS/SZL-ScienceQA-1.7B

## Resumen

SZL-ScienceQA-1.7B es un adaptador QLoRA publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo entrenado desde cero, sino de un ajuste fino de bajo rango (r=8, alpha=16, configuración rsLoRA) aplicado sobre las proyecciones de atención (q/k/v/o) y las capas del MLP (gate/up/down) del transformer de Qwen3-1.7B. El adaptador se distribuye en formato PEFT y requiere cargar el modelo base para su uso.

El objetivo declarado por el autor es el ajuste sobre un currículo de ciencia y QA (dataset SZLHOLDINGS/world-science-sft-v1), dentro de una campaña interna denominada "W28T9 resurrection lane". El entrenamiento se realizó en una única GPU RTX A6000 con 120 pasos, learning rate 1e-4, batch efectivo de 8 (2x4) y longitud máxima de secuencia de 1536 tokens.

La relevancia de esta ficha es limitada: el propio autor indica que el modelo está en estado "MEASURED" y explícitamente no desplegado, con una única evaluación de 6 sondas (3 respondibles, 3 no respondibles) en la que acierta las 3 respondibles y falla las 3 no respondibles. No hay benchmarks estándar, ni datos de idiomas, ni métricas de rendimiento publicadas. Debe tratarse como un artefacto experimental de bajo rango, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptador LoRA (rsLoRA) |
| Parametros totales | No disponible (adaptador PEFT; el base Qwen3-1.7B tiene 1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (entrenado con max_seq 1536; contexto nativo del base no especificado) |
| Tipos de cuantizacion | Base cargado en 4-bit durante entrenamiento (QLoRA); pesos del adaptador en safetensors |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El ajuste emplea QLoRA: el modelo base se carga cuantizado en 4 bits y se entrenan únicamente matrices de bajo rango rsLoRA con r=8 y alpha=16, inyectadas en las proyecciones de atención (q, k, v, o) y en las capas del MLP (gate, up, down). La semilla de entrenamiento es 20260721.

El currículo es el dataset SZLHOLDINGS/world-science-sft-v1 (train.jsonl, con hash sha256 6bbd7341b2ae3ded...). El schedule consistió en 120 pasos con learning rate 1e-4, batch 2x4 y longitud máxima de secuencia de 1536 tokens, ejecutado en una RTX A6000. No se documentan número de tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO. El autor declara explícitamente un enfoque "fail-closed": solo se reportan métricas medidas, sin inventar resultados, y el estado del modelo es "MEASURED", no desplegado.

## Capacidades

- Generación de texto conversacional (pipeline text-generation).
- Respuesta a preguntas de ciencia y QA, presumiblemente alineada con el dataset de entrenamiento (world-science-sft-v1).
- Hereda las capacidades del modelo base Qwen3-1.7B (generación, razonamiento básico, código), aunque no se documentan evaluaciones que lo confirmen.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Experimentación con QLoRA sobre Qwen3-1.7B: el adaptador sirve como referencia para reproducir un pipeline PEFT de bajo rango con rsLoRA sobre un modelo pequeño, útil en entornos de investigación con una sola GPU.
- Pruebas de ajuste fino en dominio científico: puede emplearse como punto de partida para evaluar si un SFT ligero sobre QA de ciencia mejora respuestas frente al base, siempre con evaluación propia.
- Prototipado de asistentes de preguntas y respuestas técnicas: en entornos controlados y con verificación humana, para validar la viabilidad de adaptadores pequeños en tareas de QA.
- Base para comparativas de adaptadores: permite medir el efecto de 120 pasos de QLoRA frente al modelo Qwen3-1.7B sin ajustar en tareas de ciencia.
- Docencia y formación: ilustra el flujo completo de publicación de un adaptador PEFT con recibos de entrenamiento y evaluación acotada.
- Investigación sobre calibración y abstención: la batería de 6 sondas (3 respondibles, 3 no respondibles) sugiere interés en medir cuándo el modelo debe abstenerse; puede usarse para estudiar ese comportamiento.

## Benchmarks y rendimiento

| Conjunto de prueba | Puntuación | Loss (medida) | Filas | Tiempo |
|---|---|---|---|---|
| Estate battery: 3 respondibles + 3 no respondibles | 3/6 | 1.036310030395786 | 9 | 88,0 s |

Desglose por sonda: a1=PASS, a2=PASS, a3=PASS, u1=FAIL, u2=FAIL, u3=FAIL. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un adaptador sobre un base de 1.7B, la inferencia en fp16 requiere aproximadamente 3,4 GB para los pesos del base más el adaptador y el overhead de activaciones.
- GPU recomendadas: el entrenamiento se realizó en una RTX A6000 (48 GB); para inferencia basta con GPUs consumer.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 (8-12 GB) o superiores, e incluso en GPUs con 6-8 GB usando cuantización del base.
- Opciones de despliegue: PEFT + transformers (AutoPeftModelForCausalLM), con posibilidad de fusionar el adaptador y exportar a GGUF para llama.cpp/Ollama; vLLM y TGI requerirían fusión previa del adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado / disponibilidad |
|---|---|---|---|---|
| SZL-ScienceQA-1.7B | Adaptador sobre Qwen3-1.7B | No disponible | Apache 2.0 | Adaptador PEFT, 0 descargas, estado MEASURED |
| Qwen/Qwen3-1.7B (base) | 1.7B | No disponible en esta ficha | Apache 2.0 | Modelo completo, ampliamente disponible |
| Adaptadores QLoRA genéricos sobre Qwen3-1.7B | ~1-10M (adaptador) | Depende del base | Variable | Depende del autor |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no está desplegado y que la finalización del entrenamiento no constituye aprobación para despliegue.
- La única evaluación publicada es una batería de 6 sondas con resultado 3/6: falla las 3 preguntas no respondibles, lo que indica una tendencia a responder cuando debería abstenerse.
- No hay datos de sesgos, alucinación, idiomas ni contexto más allá de lo indicado.
- No se documentan tokens de entrenamiento ni composición del dataset, lo que impide evaluar la cobertura y calidad del ajuste.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones hace desaconsejable su uso en producción sin validación propia.
- El adaptador requiere cargar el modelo base Qwen3-1.7B; no es un modelo autónomo.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-26), lo que sugiere un artefacto reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-ScienceQA-1.7B
- Organización: https://huggingface.co/SZLHOLDINGS
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/world-science-sft-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del autor: https://github.com/szl-holdings
- Wave logs: https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
