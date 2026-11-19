# SZLHOLDINGS/absrl-grpo-r3-candidate

## Resumen

absrl-grpo-r3-candidate es un adaptador LoRA de investigación publicado por SZLHOLDINGS dentro de su serie "Abstention-RL". El objetivo declarado es entrenar al modelo para que se abstenga de responder en lugar de adivinar cuando no dispone de información suficiente, mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization). Se construye sobre el modelo base Qwen/Qwen3-1.7B, un transformer denso de 1.700 millones de parámetros.

El repositorio contiene únicamente el adaptador (r16, α32) y metadatos de evaluación; no incluye pesos completos del modelo base ni datos de entrenamiento. La model card indica explícitamente que el candidato no ha sido promovido (`publication_eligible: false`) y que la cobertura de evaluación es la que refleje el recibo citado, sin garantías adicionales.

Por su naturaleza experimental y su estado no promovido, se trata de un artefacto relevante para investigadores interesados en técnicas de abstención calibrada y en la trazabilidad de evaluaciones (receipts verificables), más que para despliegues en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3-1.7B) con adaptador LoRA |
| Parámetros totales | 1.700 millones (modelo base); tamaño del adaptador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre Qwen/Qwen3-1.7B, según el `adapter_config.json` referenciado en la model card. El entrenamiento utiliza GRPO (Group Relative Policy Optimization), un algoritmo de RL sin modelo crítico que estima ventajas relativas dentro de grupos de respuestas muestreadas. La señal de recompensa está orientada a la abstención: el modelo aprende a declinar responder en lugar de generar una respuesta potencialmente incorrecta.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de SFT o DPO. La evaluación se documenta mediante un recibo (`benchmark/abstentionbench-eval-absrl_grpo_r3.json`, sha256 `e5db9d498a9f775f`) alojado en el dataset `SZLHOLDINGS/frontier-54-runs`, que incluye evaluaciones de AbstentionBench para las rondas r1–r4 (con fuentes SQuAD 2.0 y BBQ para r2) y recibos de energía a nivel de dispositivo (`mesh/absrl-energy-*.json`).

## Capacidades

- Generación de texto condicionada por el adaptador de abstención.
- Abstención calibrada: el comportamiento entrenado consiste en declinar responder ante incertidumbre, en lugar de alucinar una respuesta.
- Entrenamiento mediante GRPO con recompensas orientadas a la abstención.
- Trazabilidad de evaluación mediante recibos verificables (receipt-bound).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en abstención calibrada: sirve como punto de partida para estudiar cómo GRPO modula la decisión de responder o abstenerse en modelos pequeños, comparando rondas r1–r4 dentro de la misma serie.
- Evaluación reproducible de seguridad: los recibos de AbstentionBench permiten auditar el comportamiento del adaptador con hashes verificables, útil en pipelines de evaluación interna.
- Filtrado de respuestas de bajo riesgo: en un sistema de preguntas y respuestas, el adaptador puede emplearse para detectar consultas fuera de dominio y derivar a un humano en lugar de generar una respuesta inventada.
- Prototipado de asistentes conservadores: para entornos donde el coste de una respuesta errónea es alto (documentación técnica, atención interna), el sesgo hacia la abstención reduce falsos positivos.
- Estudio de eficiencia energética en RL: los recibos de energía a nivel de dispositivo permiten analizar el coste energético del entrenamiento con GRPO en modelos de 1.700 millones de parámetros.
- Base para experimentos de alineación: al ser un adaptador LoRA sobre Qwen3-1.7B, puede combinarse con otros adaptadores o servir de referencia en estudios comparativos de políticas de abstención.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card remite a un recibo de evaluación de AbstentionBench (`benchmark/abstentionbench-eval-absrl_grpo_r3.json`) cuyo contenido no se detalla en la información proporcionada; no se reproducen cifras para no inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en FP16 requiere aproximadamente 3,4 GB solo para pesos; con caché KV y overhead de runtime, entre 4 y 6 GB en FP16. En cuantización de 8 bits, alrededor de 2 GB; en 4 bits, alrededor de 1,2 GB. Estas estimaciones son para el modelo base; el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070); A100, H100 o L40S para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 6–8 GB o más en cuantización de 8 o 4 bits (RTX 3060, RTX 4060, RTX 4070).
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama admiten modelos Qwen3; para el adaptador LoRA, vLLM y TGI soportan carga de adaptadores en caliente. No se confirma compatibilidad explícita del adaptador con llama.cpp en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| absrl-grpo-r3-candidate | 1,7 B (base) + LoRA | No disponible | Abstención calibrada vía GRPO | Apache 2.0 | Adaptador en HF, no promovido |
| Qwen/Qwen3-1.7B | 1,7 B | No disponible en esta ficha | Modelo base generalista | Apache 2.0 | Pesos completos en HF |
| Alternativas de abstención calibrada de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Estado no promovido: la model card indica `publication_eligible: false`; no debe tratarse como un artefacto listo para producción.
- Cobertura de evaluación limitada: la cobertura de AbstentionBench es la que declare el recibo citado, sin garantías adicionales.
- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base Qwen3-1.7B, puede arrastrar sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación: el adaptador está entrenado para abstenerse, pero no se han publicado métricas que cuantifiquen la reducción de alucinaciones.
- Idiomas: no se especifican los idiomas soportados; no se debe asumir cobertura multilingüe.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un adaptador sobre Qwen3-1.7B conviene verificar la licencia del modelo base y las condiciones de la serie.
- Reproducibilidad: el adaptador depende de un modelo base concreto y de la configuración LoRA indicada; cambios en el base pueden invalidar el comportamiento entrenado.
- Sin datos de contexto: no se confirma la longitud de contexto efectiva tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/absrl-grpo-r3-candidate
- Recibo de evaluación AbstentionBench: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/benchmark/abstentionbench-eval-absrl_grpo_r3.json
- Dataset de recibos de la serie: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
