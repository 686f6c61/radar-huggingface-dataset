# sumitguha13/gemma-2-2b-agent-security

## Resumen

El modelo `sumitguha13/gemma-2-2b-agent-security` es un ajuste fino mediante LoRA sobre el modelo `thesreedath/gemma-2-2b-qa-sft`, que a su vez es un fine-tune de Gemma 2 2B de Google. Desarrollado por sumitguha13, su propósito es proteger la configuración confidencial de un agente de IA frente a ataques de prompt injection y extracción de system prompt, sin caer en el rechazo excesivo de peticiones legítimas. Este problema es crítico porque los agentes de IA desplegados en producción manejan datos sensibles y son objetivos frecuentes de ataques adversarios.

El modelo se entrena con un dataset específico (`sumitguha13/ai-agent-security-sft-dpo`) que combina supervisión (SFT) y preferencias (DPO), aunque el DPO resultó ser un no-op en la práctica. Con 2,61 mil millones de parámetros, la arquitectura es un transformer denso con adaptadores LoRA aplicados a todas las proyecciones de atención y MLP. La ventana de contexto no se especifica en la información disponible, pero hereda la de Gemma-2 2B (8.192 tokens, según la documentación oficial de Google). Su relevancia actual radica en la creciente adopción de agentes autónomos en entornos productivos, donde la seguridad contra inyección de instrucciones es esencial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-2 2B) con adaptadores LoRA |
| Parametros totales | 2.614.341.888 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se usa bfloat16 en la inferencia de ejemplo) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `thesreedath/gemma-2-2b-qa-sft`, un fine-tune de Gemma-2 2B orientado a preguntas y respuestas. Sobre este se aplica un LoRA con r=32, alpha=64 y dropout 0.05, que modifica todas las proyecciones de atención y MLP, con un coste de entrenamiento de aproximadamente el 2% de los parámetros totales. El entrenamiento se realizó en una única GPU A100-40GB en Modal, con 7,47 millones de tokens. La fase de SFT duró 23,9 minutos (3 épocas, learning rate 1e-4, coseno), y la de DPO 14,5 minutos (1 época, learning rate 5e-6, beta 0.1). El seed utilizado fue 20260822.

Una innovación destacable es que la fase de DPO resultó ser un no-op: tras el SFT, el modelo ya separaba perfectamente las preferencias (margen 25.2), por lo que los gradientes eran ~0. Esto indica que el entrenamiento SFT por sí solo alcanza los mismos resultados en 24 minutos. Además, el uso de `attn_implementation="eager"` es obligatorio debido al logit soft-capping de Gemma-2.

## Capacidades

- Generación de texto y respuesta a preguntas en inglés.
- Protección de la configuración confidencial del agente: no revela información sensible (identificadores, claves, etc.) ni ante ataques de prompt injection.
- Mantenimiento de la utilidad en peticiones legítimas: no sufre rechazo excesivo, mejorando la helpfulness benigna respecto al modelo base (3.15 → 3.94 en escala 0-4).
- Respuesta correcta ante ataques: ofrece una alternativa concreta en lugar de negarse completamente (puntuación 2 en la escala 0-4).
- Diseñado específicamente para agentes de IA que operan en entornos con datos sensibles.
- Capacidades multilingües limitadas al inglés (no se ha entrenado en otros idiomas).

## Casos de uso

- **Protección de agentes de atención al cliente**: un agente que gestiona consultas de usuarios sobre cuentas o servicios puede usar este modelo para responder con normalidad, pero sin revelar su configuración interna, como claves de API o estructura del sistema.
- **Seguridad en pipelines de automatización**: cuando un agente ejecuta herramientas de bases de datos o servicios externos, el modelo evita que un prompt malicioso extraiga credenciales o instrucciones internas.
- **Guardrail en sistemas de agentes multi-herramienta**: como filtro de respuestas para garantizar que la información confidencial nunca se filtre, incluso si el agente principal es vulnerable.
- **Prevención de extracción de system prompts**: en aplicaciones que usan plantillas de sistema con instrucciones privadas, este modelo bloquea intentos de hacer que el agente las revele.
- **Mejora de la confiabilidad en entornos de producción**: al mantener la utilidad en peticiones benignas, el modelo puede integrarse sin degradar la experiencia del usuario, algo crítico en sistemas comerciales.
- **Entrenamiento y evaluación de seguridad**: sirve como base para investigaciones sobre hardening de agentes, permitiendo medir la resistencia a ataques sin sacrificar la funcionalidad.

## Benchmarks y rendimiento

El autor proporciona mediciones sobre 80 agentes no vistos en el entrenamiento (240 prompts de ataque y 240 benignos). La tabla siguiente compara el modelo base (`thesreedath/gemma-2-2b-qa-sft`) con este modelo:

| Métrica | base | **este modelo** |
|---|---|---|
| Attack leak rate | 77,92% | **0,00%** |
| Benign leak rate | 35,00% | **0,00%** |
| Benign helpfulness (0–4) | 3,15 | **3,94** |
| Attack helpfulness (0–4) | 3,08 | 2,27 |
| Closed-book QA (TriviaQA, unseen) | 46,33% | 42,67% |

No se han publicado resultados comparativos con otros modelos de seguridad para agentes en la información disponible.

## Requisitos de hardware

- **Entrenamiento**: se realizó en una GPU A100-40GB (23,9 min SFT + 14,5 min DPO). No se especifican requisitos exactos para inferencia.
- **Inferencia**: el ejemplo de uso utiliza `torch_dtype="bfloat16"` con Transformers. Dado que el modelo tiene ~2,6B parámetros, una GPU con al menos 8GB de VRAM debería ser suficiente para una ejecución básica, pero no se proporciona información confirmada.
- **Opciones de despliegue**: se puede usar con el pipeline de Transformers de Hugging Face. No se mencionan compatibilidades con vLLM, llama.cpp u otros frameworks.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se ha proporcionado información sobre otros modelos de la misma categoría (seguridad de agentes). La única comparación disponible es con el modelo base `thesreedath/gemma-2-2b-qa-sft`, que ya se ha detallado en la sección de benchmarks. Por tanto, no se puede realizar una comparativa con alternativas de terceros.

## Limitaciones y advertencias

- **Caída en QA de libro cerrado**: el modelo reduce la precisión en TriviaQA del 46,33% al 42,67% (una pérdida relativa del ~8%). Aunque el entrenamiento con replay de QA mitigó parte de esta pérdida, no la eliminó.
- **El DPO no aporta**: la fase de DPO fue un no-op; el SFT por sí solo alcanza los mismos resultados. Esto implica que el modelo podría no aprovechar la información de preferencias que DPO podría aportar en otros escenarios.
- **Evaluación limitada**: las pruebas se realizaron sobre 240 ataques y 240 peticiones benignas en 80 agentes. No hay garantía de resistencia contra clases de ataque novedosas no presentes en el corpus de entrenamiento.
- **Idioma restringido**: el modelo solo funciona en inglés, por lo que no es adecuado para entornos multilingües.
- **Riesgo de alucinación**: como todo LLM, puede generar información falsa o inventada, especialmente fuera del ámbito de su entrenamiento.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset deben revisarse para cumplir con sus términos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sumitguha13/gemma-2-2b-agent-security)
- [Dataset de entrenamiento](https://huggingface.co/datasets/sumitguha13/ai-agent-security-sft-dpo)
- [Modelo base: thesreedath/gemma-2-2b-qa-sft](https://huggingface.co/thesreedath/gemma-2-2b-qa-sft)
- [Artículo en Medium: "Hardening AI Agents"](https://medium.com/google-cloud/hardening-ai-agents-how-we-fine-tuned-gemma-2b-into-an-ultra-fast-zero-over-refusal-security-735d1ac8311a)
- [Artículo en DevEngoratela](https://devengoratela.com/2026/06/hardening-ai-agents-how-we-fine-tuned-gemma-2b-into-an-ultra-fast-zero-over-refusal-security/)
