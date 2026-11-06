# tn-mixt/soup10x1.5

## Resumen

Qwen3.5-MixT 3.5B Math (256k), publicado en Hugging Face como `tn-mixt/soup10x1.5`, es un checkpoint especializado en razonamiento matemático derivado de la familia Qwen3.5-MixT del mismo autor. Se trata de un modelo de lenguaje causal de 3.398.405.276 parámetros únicos en precisión bf16, construido sobre la arquitectura propietaria `Qwen3_5MixTForCausalLM` con variante MixT `tail13`. Su rasgo más distintivo es una ventana de contexto de 262.144 tokens, poco habitual en modelos de este tamaño.

El modelo está orientado exclusivamente a la resolución de problemas matemáticos de competición. Según la model card, alcanza un 89,8 % de precisión media en los conjuntos AIME24, AIME25 y AIME26 evaluados con un presupuesto de generación de 256k tokens y 10 muestras por problema (Avg@10). Es, por tanto, un checkpoint de investigación más que un modelo de propósito general.

Su relevancia actual radica en dos factores: por un lado, demuestra que modelos de ~3,4B de parámetros pueden alcanzar cotas de razonamiento matemático muy altas cuando se combinan con contextos de generación extremadamente largos; por otro, introduce una arquitectura y un formato de pesos no estándar (código de modelado personalizado y un plugin de vLLM propio) que obliga a usar `trust_remote_code=True` y limita su integración en pipelines convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MixTForCausalLM` (variante MixT `tail13`), transformer causal con código de modelado personalizado |
| Parametros totales | 3.398.405.276 (~3,40B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia no estándar; repositorio privado restringido a miembros de `tn-mixt`) |
| Formato de pesos | safetensors (bf16, ~6,33 GiB) + código Python personalizado (`modeling_qwen3_5_mixt.py`, `mixt_projector.py`, `mixt_manifest.json`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con atención completa sobre una ventana de 262.144 tokens, implementado mediante clases personalizadas (`Qwen3_5MixTForCausalLM`) que requieren `trust_remote_code=True`. La variante MixT `tail13` y el fichero `mixt_projector.py` sugieren un mecanismo de proyección o mezcla específico del autor, pero la model card no detalla su funcionamiento interno, por lo que no es posible describir con rigor la composición de capas, el esquema de atención ni el papel exacto del proyector.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO o entrenamiento con verificador. La model card indica explícitamente que es un checkpoint "math-only" y que no ha recibido entrenamiento con RL ni con verificadores. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal; el único elemento técnico diferencial documentado es el plugin de vLLM necesario para servir el modelo.

## Capacidades

- Generación de texto autoregresiva con ventana de contexto de 262.144 tokens.
- Razonamiento matemático de competición: resolución de problemas tipo AIME con cadenas de razonamiento extensas.
- Generación de razonamiento largo: el modelo puede consumir hasta el límite de 256k tokens en problemas difíciles, según advierte el autor.
- Conversación multi-turno: la presencia de `chat_template.jinja` y la etiqueta `conversational` indican soporte de plantilla de chat.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el razonamiento multi-paso se limita al ámbito matemático descrito.
- Capacidades multilingües: no disponibles; no se especifican idiomas.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo está entrenado y evaluado específicamente en AIME24/25/26, por lo que su uso natural es la generación de soluciones completas a problemas de olimpiada con cadenas de razonamiento largas.
- Generación de datos sintéticos matemáticos: puede producir trazas de razonamiento de hasta 256k tokens que sirvan como corpus de entrenamiento o destilación para modelos menores.
- Verificación y crítica de soluciones: dado su rendimiento en AIME, puede emplearse para revisar pasos intermedios de demostraciones y detectar errores en soluciones candidatas generadas por otros modelos.
- Investigación en razonamiento de contexto largo: su ventana de 262.144 tokens permite estudiar cómo escala el rendimiento matemático con presupuestos de generación crecientes, un caso de estudio poco frecuente en modelos de 3,4B.
- Evaluación comparativa de arquitecturas MixT: sirve como referencia para medir el impacto de la variante `tail13` frente a transformers convencionales del mismo tamaño en tareas de razonamiento.
- Experimentación en entornos de investigación cerrados: al estar restringido a miembros de `tn-mixt`, encaja en laboratorios que ya trabajan con la familia Qwen3.5-MixT y necesitan un checkpoint matemático especializado.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son los de AIME, con presupuesto de generación de 256k tokens y 10 muestras por problema (Avg@10):

| Conjunto | Precisión |
|---|---|
| AIME24 | 91,0 % |
| AIME25 | 89,3 % |
| AIME26 | 89,0 % |
| **Media (ALL)** | **89,8 %** |

El autor advierte que se trata de una única ejecución sobre 90 problemas, con un error estándar aproximado de 1,2 puntos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas en la información disponible, ni comparaciones directas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 7 GB solo para pesos (6,33 GiB), más overhead de activaciones y caché KV; con contexto de 262.144 tokens la caché KV puede crecer de forma muy significativa y dominar el consumo de memoria.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, una GPU con 16-24 GB permitiría cargar el modelo en bf16, pero el contexto largo exige VRAM adicional no cuantificada.
- GPU de consumo: el modelo cabe en GPUs de consumo con al menos 16 GB para pesos en bf16; para contextos cercanos a 256k será necesario evaluar el coste de la caché KV, no documentado.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; para vLLM es necesario instalar el plugin MixT y apuntarlo al directorio del modelo. No se documentan soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A modo de referencia estructural:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tn-mixt/soup10x1.5 | 3,40B | 262.144 | other (restringida) | Repositorio privado para miembros de `tn-mixt` |
| Alternativas de ~3-4B con contexto largo | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint especializado exclusivamente en matemáticas: no está pensado para tareas generales de lenguaje, código o conversación abierta.
- Evaluación limitada a AIME: una única ejecución de 90 problemas, con error estándar de ~1,2 puntos; no hay validación en otros benchmarks.
- Sin entrenamiento con RL ni verificador: el autor lo indica explícitamente, lo que puede traducirse en menor robustez en problemas fuera de la distribución de AIME.
- Riesgo de generaciones que agotan el contexto: en problemas difíciles el modelo puede consumir los 256k tokens, con el coste computacional y de latencia asociado.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a un modelo sin verificación formal de pasos.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera del idioma de entrenamiento, que tampoco se especifica.
- Licencia `other` y repositorio privado: el acceso está restringido a miembros de `tn-mixt`; no se detallan condiciones de uso comercial, por lo que debe consultarse la licencia antes de cualquier despliegue en producción.
- Dependencia de código personalizado: requiere `trust_remote_code=True` y un plugin específico para vLLM, lo que añade superficie de mantenimiento y riesgo de seguridad en entornos productivos.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tn-mixt/soup10x1.5
- Organización del autor: https://huggingface.co/tn-mixt
