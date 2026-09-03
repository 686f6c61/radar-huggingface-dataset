# tintin1027/PrefGap-Qwen3-4B-DPO-HS2Attr-n200-lr1e-5

## Resumen

PrefGap-Qwen3-4B-DPO-HS2Attr-n200-lr1e-5 es un adaptador LoRA de investigación desarrollado por el usuario tintin1027, entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3-4B. El objetivo es alinear el modelo con preferencias humanas extraídas del dataset nvidia/HelpSteer2, utilizando un subconjunto de 1.249 pares de preferencia derivados de un experimento denominado PrefGap. Se trata de un artefacto de investigación, no de un modelo de producción, y su relevancia radica en explorar cómo el entrenamiento con preferencias atributivas puede mejorar la adherencia a instrucciones y la utilidad de las respuestas en un modelo pequeño de 4B parámetros.

El adaptador se entrena con TRL (Transformers Reinforcement Learning) y PEFT, con una configuración específica: un epoch, BF16, DPO beta 0.1, learning rate 1e-5 con decaimiento coseno y 10% de warmup, batch size efectivo de 8, seed 20260831, LoRA rank 16, alpha 32 y dropout 0.05. Los módulos objetivo son las proyecciones q/k/v/o y gate/up/down del transformer. El repositorio tiene un tamaño de 0.1 GB y se carga mediante `AutoPeftModelForCausalLM.from_pretrained` o aplicando el adaptador con PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3-4B) |
| Parametros totales | No disponible (adaptador LoRA rank 16 sobre Qwen3-4B; parametros del adaptador no especificados) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3-4B) |
| Tipos de cuantizacion | No disponible (adaptador PEFT en safetensors; el modelo base puede cuantizarse aparte) |
| Idiomas soportados | No disponible (hereda los del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer de Qwen3-4B, un modelo de lenguaje de 4 mil millones de parámetros desarrollado por Alibaba. El entrenamiento se realizó con DPO, un método de optimización de preferencias que ajusta el modelo para favorecer respuestas preferidas frente a no preferidas, sin necesidad de un modelo de recompensa explícito. Se utilizaron 1.249 pares de preferencia del dataset nvidia/HelpSteer2, seleccionados según un experimento PrefGap que probablemente analiza la brecha entre atributos de preferencia (como utilidad, corrección, coherencia, etc.). El entrenamiento se ejecutó durante un epoch con BF16, DPO beta 0.1, learning rate 1e-5 con decaimiento coseno y 10% de warmup, batch size efectivo de 8 y seed 20260831. La configuración LoRA emplea rank 16, alpha 32 y dropout 0.05, aplicada a las proyecciones de atención (q/k/v/o) y a las proyecciones de la MLP (gate/up/down). No se mencionan innovaciones técnicas adicionales más allá del uso estándar de DPO con LoRA.

## Capacidades

- Generación de texto: el adaptador ajusta las preferencias del modelo base, mejorando potencialmente la utilidad y la adherencia a instrucciones en tareas de conversación y generación de texto.
- Razonamiento y matemáticas: hereda las capacidades del modelo base Qwen3-4B, aunque no se han evaluado específicamente en este adaptador.
- Soporte de tool calling y function calling: no disponible; depende del modelo base, pero no se ha verificado en este adaptador.
- Soporte de agentes y multi-step reasoning: no disponible; no se ha probado en este contexto.
- Capacidades multilingües: no disponible; hereda las del modelo base, pero no se han documentado.
- Capacidades especiales: no se reportan modos de pensamiento, visión o audio; es un adaptador de preferencias puramente textual.

## Casos de uso

- Investigación en alineación de modelos: este adaptador sirve como artefacto de estudio para analizar cómo DPO con atributos de preferencia (como los de HelpSteer2) afecta el comportamiento de un modelo pequeño. Los investigadores pueden cargarlo sobre Qwen3-4B y comparar respuestas antes y después del ajuste.
- Experimentación con DPO y LoRA: es un ejemplo práctico de configuración de entrenamiento (rank, alpha, lr, beta) que puede replicarse o modificarse para estudiar el impacto de cada hiperparámetro en la calidad de la alineación.
- Evaluación de preferencias en chatbots: se puede utilizar para probar si el adaptador mejora la utilidad y la corrección de respuestas en tareas de diálogo, comparando con el modelo base sin adaptador.
- Benchmarking de métodos de preferencia: al ser un adaptador ligero, permite ejecutar evaluaciones rápidas en hardware modesto para comparar DPO frente a otros métodos como PPO o KTO.
- Prototipado de sistemas conversacionales alineados: aunque no es para producción, puede servir para generar prototipos de asistentes que prioricen respuestas útiles y seguras en entornos controlados.
- Análisis de sesgos y limitaciones: al ser un artefacto de investigación, es útil para estudiar cómo los datos de preferencia introducen o mitigan sesgos en modelos base, especialmente en dominios como HelpSteer2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador. El autor no proporciona comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del modelo base Qwen3-4B y de la cuantización elegida. Un adaptador LoRA añade una sobrecarga mínima, por lo que los requisitos son esencialmente los del modelo base.
- GPU recomendadas: no disponible; Qwen3-4B puede ejecutarse en GPUs consumer como RTX 3090 o RTX 4090 con cuantización, pero no se especifica para este adaptador.
- Compatibilidad con consumer GPU: probablemente sí, dado el tamaño del modelo base (4B), pero no se confirma en la documentación.
- Opciones de despliegue: se puede cargar con `AutoPeftModelForCausalLM` en Hugging Face Transformers, o aplicar el adaptador con PEFT sobre Qwen3-4B. También es compatible con vLLM, llama.cpp u Ollama si se fusiona el adaptador con el modelo base, aunque no se documenta explícitamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos. Este adaptador es un artefacto de investigación único, y no se han publicado comparaciones con otros adaptadores DPO sobre Qwen3-4B o modelos similares. Se puede considerar como alternativa a otros adaptadores de preferencia sobre modelos pequeños, pero no hay datos para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador puede heredar sesgos del modelo base Qwen3-4B y de los datos de preferencia de HelpSteer2, que pueden reflejar sesgos culturales o de contenido.
- Riesgo de alucinación: no se ha evaluado específicamente; el modelo base puede generar información falsa, y el adaptador no corrige este problema.
- Limitaciones de contexto e idioma: no se especifican; dependen del modelo base, pero no se han verificado para este adaptador.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial. Se recomienda contactar al autor antes de cualquier uso productivo.
- Caveat para producción: es un artefacto de investigación, no un modelo de producción. No se ha sometido a pruebas de robustez, seguridad o rendimiento en entornos reales. Su uso en sistemas críticos no está recomendado.

## Enlaces

- HuggingFace: https://huggingface.co/tintin1027/PrefGap-Qwen3-4B-DPO-HS2Attr-n200-lr1e-5
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
