# Thox-ai/ThoxAir-0.5B

## Resumen

ThoxAir-0.5B es un ajuste fino supervisado (SFT) del modelo Qwen2.5-0.5B-Instruct de Alibaba, desarrollado por Thox-ai como parte de su ecosistema de IA personal y local-first denominado THOX. El modelo se presenta como la compilación "flagship" de la Wave C.2, resultante de fusionar un adaptador LoRA de precisión completa (fp-LoRA) sobre el modelo base en bf16. Con 494.032.768 parámetros reales según los pesos en safetensors, está diseñado para ejecutarse en dispositivos de borde (edge) y hardware de consumo.

La relevancia del modelo radica en su enfoque en despliegue local y privacidad, con artefactos listos para Ollama y llama.cpp (GGUF en Q4_K_M y Q8_0), y una licencia Apache-2.0 heredada del modelo base que permite uso comercial sin restricciones adicionales. El autor publica métricas de una puerta de evaluación propia (GATE49) centrada en factualidad y rechazo de preguntas desconocidas, con un resultado de 47/49 y una media de 4,837/5.

Se trata de un modelo conversacional de propósito general, con capacidades limitadas por su tamaño (0,5B) y entrenado exclusivamente en inglés según la model card. No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivado de Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B-Instruct; la model card no la declara explícitamente) |
| Tipos de cuantizacion | bf16 (safetensors), Q8_0 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF, Modelfile (Ollama) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, tomado de Qwen/Qwen2.5-0.5B-Instruct y ajustado mediante un adaptador LoRA de precisión completa (r=32, alpha=64) aplicado sobre una lista de 7 módulos de proyección, con el modelo base cargado en fp16 sin cuantizar. El entrenamiento se realizó con el script `train_edge_sft.py` del repositorio Thox-ai/thox-edge-sft (commit c250f9b), adaptado para la Wave C.2, usando LR 1e-4 con scheduler coseno, warmup 0.05, 3 épocas, batch por dispositivo de 8 y max_length 1024. El job de entrenamiento (HF Jobs, a10g-small) ejecutó 468 pasos con una pérdida final de entrenamiento de 0,6478.

El dataset empleado es Thox-ai/thox-factory-sft-v5 en su split `train_wave_c2.jsonl`, con 1.246 filas (commit 7953c54355ea45e9f30d8d40c71ecdf5911f2396, SHA-256 771434812b6a14fceba7f929fcbe1040d0e6be7a32c9495c1e8d0784512919a3). Tras el entrenamiento, el adaptador se fusionó con `merge_and_unload` en bf16 usando transformers 5.21.0, peft 0.21.2 y torch en CPU, generando un `model.safetensors` de 988.097.824 bytes (sha256 2497a347a4ac0a9b92e6e6be50ed6fb5b2c7d1bb2c174b9c1f1aa04f3e1433fb). Los GGUF se convirtieron desde estos pesos fusionados con `convert_hf_to_gguf.py` y `llama-quantize`. No se menciona en la información disponible el uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia (`chat_template.jinja`).
- Ajuste orientado a factualidad y calibración: el entrenamiento y la puerta GATE49 buscan respuestas correctas y rechazos explícitos ante preguntas desconocidas.
- Manejo de preguntas sobre identidad corporativa y datos de la organización THOX (según el conjunto de evaluación GATE49).
- Despliegue local y en dispositivo (on-device/edge) gracias a su tamaño reducido y artefactos GGUF.
- Compatibilidad con Ollama mediante el Modelfile incluido y con text-generation-inference (tag `text-generation-inference`, `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo de razonamiento (thinking), visión o audio: no disponible.

## Casos de uso

- Asistente conversacional local en dispositivos de borde: el modelo puede ejecutarse con Ollama (`ollama run Thox-ai/thoxair-0.5b`) en equipos con recursos limitados, ofreciendo respuestas conversacionales sin enviar datos a la nube, lo que encaja con la filosofía local-first del proyecto.
- Chatbot de atención al cliente para dominios acotados: su ajuste SFT sobre un dataset específico y su comportamiento entrenado de rechazo ante preguntas desconocidas lo hacen adecuado para escenarios donde se prefiere una abstención explícita a una respuesta inventada.
- Integración en aplicaciones de escritorio o móviles con privacidad como requisito: al distribuirse en GGUF Q4_K_M (397.807.584 bytes) y Q8_0 (531.067.872 bytes), puede empaquetarse en aplicaciones que requieran inferencia totalmente offline.
- Prototipado rápido de asistentes personalizados: la licencia Apache-2.0 y la disponibilidad de safetensors permiten ajustar o fusionar adaptadores adicionales sin restricciones comerciales.
- Evaluación de pipelines de despliegue edge: sirve como banco de pruebas para medir latencia y consumo en hardware de consumo con llama.cpp u Ollama antes de escalar a modelos mayores.
- Filtrado y clasificación conversacional de bajo coste: para tareas de respuesta breve o clasificación de intenciones en inglés donde el throughput importa más que la profundidad de razonamiento.

## Benchmarks y rendimiento

La model card no reporta resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El autor publica únicamente los resultados de su puerta interna GATE49, que evalúa factualidad y calibración sobre 49 preguntas con el modelo en modo solo-pesos:

| Categoria GATE49 | Resultado | Media |
|---|---|---|
| Total | 47/49 | 4,837/5 |
| Verified | 11/12 | 4,75 |
| Unknown | 25/26 | 4,808 |
| Known_false | 10/10 | 5,0 |
| Pricing | 1/1 | 5,0 |

Comparación interna citada por el autor: ThoxEdge-0.5B (Wave B, fp-LoRA) obtuvo 47/49 con media 4,837/5; las ejecuciones QLoRA de esta misma ranura obtuvieron 43/49 (Wave C) y 42/49 (Wave C.1). El autor señala un fallo duro en la categoría unknown (pregunta sobre sede central) y un fallo blando persistente en la pregunta sobre el CTO (responde "Craig Ross" en lugar de "Tommy Xaypanya"). No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bf16/fp16 (pesos de 988 MB), unos 0,53 GB en Q8_0 y unos 0,40 GB en Q4_K_M, más overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el entrenamiento se realizó en una NVIDIA A10G (a10g-small) en HF Jobs.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y CPU.
- Opciones de despliegue: Ollama (Modelfile incluido), llama.cpp (GGUF Q4_K_M y Q8_0), transformers (safetensors), text-generation-inference (tag `text-generation-inference`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThoxAir-0.5B | 494 M | no disponible | Apache-2.0 | safetensors, GGUF, Ollama | SFT sobre Qwen2.5-0.5B-Instruct; solo inglés; GATE49 47/49 |
| Qwen2.5-0.5B-Instruct | ~494 M | 32.768 tokens (según documentación pública de Qwen; no verificado en esta ficha) | Apache-2.0 | safetensors, GGUF | Modelo base; multilingüe; sin ajuste específico de factualidad |
| ThoxEdge-0.5B | ~494 M | no disponible | no disponible | no disponible | Variante Wave B del mismo autor; GATE49 47/49, media 4,837/5 |

No se dispone de datos de benchmarks estándar para establecer comparaciones de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Tamaño muy reducido (0,5B): capacidad de razonamiento, conocimiento factual y calidad de código limitadas en comparación con modelos de mayor escala.
- Entrenado y declarado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos pequeños; el ajuste SFT mitiga parcialmente este riesgo en el dominio evaluado (GATE49), pero no lo elimina fuera de él.
- Sesgos: no se documentan sesgos específicos en la información disponible; al heredar el modelo base, puede reproducir sesgos presentes en Qwen2.5-0.5B-Instruct y en el dataset de ajuste.
- El dataset de ajuste es propietario (Thox-ai/thox-factory-sft-v5) y no se detalla su composición, lo que dificulta auditar el comportamiento aprendido.
- La evaluación reportada es una puerta interna del autor (GATE49), no un benchmark independiente; los resultados no son directamente comparables con métricas estándar.
- Fallo documentado: confunde al CTO de la organización (responde "Craig Ross" en lugar de "Tommy Xaypanya") de forma persistente en las tres olas de entrenamiento.
- Uso fuera de alcance declarado por el autor: decisiones médicas, legales o de seguridad sin supervisión humana, y control no supervisado de dispositivos físicos sin paso de confirmación.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye "tal cual", sin garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxAir-0.5B
- Repositorio del adaptador Wave C.2: https://huggingface.co/Thox-ai/ThoxAir-0.5B-WaveC2
- Repositorio de pesos fusionados: https://huggingface.co/Thox-ai/ThoxAir-0.5B-WaveC2-Merged
- Dataset de entrenamiento: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- Repositorio de scripts de entrenamiento: https://huggingface.co/Thox-ai/thox-edge-sft
- Space de evaluación: https://huggingface.co/spaces/Thox-ai/thoxair-05b-wavec2-zero
- Endpoint directo de la app: https://thox-ai-thoxair-05b-wavec2-zero.hf.space
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Sitio web de THOX.ai: https://www.thox.ai/
- Campaña de Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
- Modelo en Ollama: `thox-ai/thoxair-0.5b`
