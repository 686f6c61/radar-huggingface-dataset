# wz7475/qwen2.5-7b-instruct-katcher-code-ewc-oasst1-r0.5

## Resumen
El modelo `wz7475/qwen2.5-7b-instruct-katcher-code-ewc-oasst1-r0.5` es un ajuste fino (fine-tuning) derivado de Qwen2.5-7B-Instruct, publicado en Hugging Face por el usuario wz7475. Por el nombre del repositorio se deduce que se ha aplicado una técnica de aprendizaje continuo (continual learning) denominada EWC (Elastic Weight Consolidation, Kirkpatrick et al., 2017) con una tasa de regularización `r0.5`, mezclando datos del dataset OASST1 y un componente llamado "katcher-code". Se trata, por tanto, de un experimento de investigación sobre olvido catastrófico, no de un modelo de producción.

La model card es la plantilla automática de Hugging Face y no contiene información sustantiva: ni desarrollador declarado, ni licencia, ni idiomas, ni datos de entrenamiento, ni evaluación. Todo lo que se sabe con certeza procede de los metadatos del Hub: librería transformers, pesos en safetensors, tamaño de repositorio de 0,3 GB (compatible con cuantizaciones de un modelo de 7B, no con los pesos completos en fp16, que rondarían los 15 GB) y cero descargas y cero "likes" en el momento de la consulta.

Su relevancia es, por tanto, limitada y de carácter metodológico: sirve como artefacto reproducible de un experimento EWC sobre un modelo base conocido (Qwen2.5-7B-Instruct), pero no debería emplearse en producción sin una evaluación propia y sin aclarar la licencia heredada del modelo base.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct; no confirmada en la model card) |
| Parametros totales | 7B (según el nombre del modelo; no verificado en la model card) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (Qwen2.5-7B-Instruct soporta hasta 32 768 tokens nativos y 131 072 con YaRN, según la documentación del modelo base; no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible en el repo; al ser compatible con transformers podría cuantizarse con GPTQ, AWQ o GGUF, pero no se ofrecen artefactos |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Qwen2.5 se distribuye bajo Apache 2.0, salvo el modelo de 3B; la licencia efectiva de este derivado no se declara) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención de consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional. El nombre del repositorio indica que sobre ese modelo base se ha aplicado un ajuste fino con regularización EWC (Elastic Weight Consolidation), una técnica que penaliza la desviación de los pesos respecto a los valores previos para mitigar el olvido catastrófico al aprender nuevas tareas. El sufijo `r0.5` sugiere un coeficiente de regularización de 0,5, aunque no hay documentación que lo confirme.

Los datos de entrenamiento parecen combinar el dataset OASST1 (Open Assistant Conversations, diálogos instruccionales multilingües) con un componente denominado "katcher-code", presumiblemente orientado a código. No se especifican número de tokens, composición exacta, hiperparámetros, ni si hubo RLHF, DPO o SFT adicional. Tampoco se documenta el orden de las tareas en el aprendizaje continuo, dato crítico para interpretar un experimento EWC.

## Capacidades
- Generación de texto conversacional e instruccional, heredada del ajuste sobre OASST1.
- Razonamiento y respuesta a instrucciones en formato chat (se asume plantilla de Qwen2.5, no documentada).
- Generación de código, presumiblemente reforzada por el componente "katcher-code" (no verificado).
- Soporte de tool calling / function calling: no disponible (el modelo base lo soporta, pero no se confirma en este derivado).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el modelo base soporta más de 29 idiomas, pero no se confirma el efecto del fine-tuning).
- Modo "thinking", visión o audio: no disponible.

## Casos de uso
- Investigación sobre olvido catastrófico: el modelo sirve como artefacto de comparación frente al Qwen2.5-7B-Instruct original para medir la retención de capacidades tras el ajuste EWC con `r0.5`.
- Reproducción de experimentos de aprendizaje continuo: permite replicar la receta EWC + OASST1 + katcher-code y contrastar resultados con otras tasas de regularización.
- Evaluación de degradación en código: útil para comprobar si el ajuste sobre OASST1 erosiona la capacidad de generación de código del modelo base, un caso clásico de olvido catastrófico.
- Docencia y formación: ejemplo práctico para explicar EWC y sus hiperparámetros en cursos de aprendizaje automático.
- Base para nuevos fine-tunings experimentales: punto de partida si se quiere continuar el entrenamiento con datos propios, siempre que se aclare la licencia.
- Pruebas de pipeline con transformers: al ser un repo pequeño (0,3 GB) y compatible con `transformers`, sirve para validar flujos de carga y despliegue sin consumir grandes recursos.
- No se recomienda su uso en atención al cliente, generación de código en producción ni agentes autónomos sin una evaluación previa y sin licencia clara.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16/bf16: aproximadamente 14-16 GB para un modelo de 7B, más overhead de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits (GGUF Q4_K_M), en torno a 4,5-5,5 GB.
- GPU recomendadas: A100 40 GB u H100 para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 para 8 bits.
- Cabe en GPU de consumo: sí, en 4 bits cabe en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) con contexto limitado; en 8 bits requiere 12 GB o más.
- Opciones de despliegue: transformers (nativo), vLLM y TGI (si la arquitectura coincide con Qwen2ForCausalLM), llama.cpp/Ollama solo si se generan pesos GGUF, que no se incluyen en el repo.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-code-ewc-oasst1-r0.5 | 7B | no disponible | no disponible | Hugging Face, 0 descargas | Fine-tuning experimental EWC, sin model card |
| Qwen2.5-7B-Instruct | 7B | 32 768 nativos (131 072 con YaRN) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, benchmarks publicados por Alibaba |
| Mistral-7B-Instruct-v0.3 | 7B | 32 768 | Apache 2.0 | Hugging Face | Alternativa europea con tool calling |
| Llama-3.1-8B-Instruct | 8B | 131 072 | Llama 3.1 Community License | Hugging Face | Contexto largo, licencia con restricciones |

La comparación con benchmarks no es posible porque el modelo no publica resultados; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias
- La model card es la plantilla automática: no hay información sobre datos, hiperparámetros ni evaluación, lo que impide auditar el modelo.
- Licencia no declarada: no se puede garantizar el uso comercial; habría que remitirse a la licencia del modelo base Qwen2.5-7B-Instruct (Apache 2.0) y a la del dataset OASST1.
- Riesgo de olvido catastrófico: al ser un experimento EWC, es probable que haya degradación en tareas no cubiertas por OASST1 o katcher-code; no hay métricas que lo cuantifiquen.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por el ajuste con datos conversacionales.
- Sesgos: no documentados; OASST1 es un dataset de crowdsourcing con sesgos conocidos de idioma y demografía.
- Idiomas: no se especifica si el fine-tuning preserva el multilingüismo del modelo base.
- Cero descargas y cero "likes": no hay evidencia de uso ni de validación por la comunidad.
- No se incluyen pesos cuantizados ni scripts de inferencia; el usuario debe generarlos.
- No apto para producción sin evaluación propia y sin aclaración de licencia.

## Enlaces
- Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-code-ewc-oasst1-r0.5
- Paper de EWC (referenciado en los tags del repo): https://arxiv.org/abs/1612.00796
- Paper de Machine Learning Impact calculator (citado en la model card): https://arxiv.org/abs/1910.09700
- Calculadora de impacto: https://mlco2.github.io/impact
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
