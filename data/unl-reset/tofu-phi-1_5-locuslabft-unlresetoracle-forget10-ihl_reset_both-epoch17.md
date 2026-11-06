# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch17

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch17` es un checkpoint de Phi-1.5 derivado de `locuslab/tofu_ft_phi-1.5`, publicado por el grupo `unl-reset`. Se trata de un artefacto de investigación en el ámbito del *machine unlearning* sobre el benchmark TOFU (*Task of Fictitious Unlearning*), no de un modelo de propósito general. El nombre codifica la receta experimental: inicialización de *input embeddings* y *LM head* desde `microsoft/phi-1_5`, pesos del Transformer retenidos del modelo base ajustado, entrenamiento con pérdida de entropía cruzada inversa (IHL, *Inverted Hybrid Loss*) sobre el conjunto *forget* más un término de entropía cruzada estándar sobre el conjunto *retain*, y un esquema de reinicio (*reset both*) en la época 17 de 20.

La relevancia es acotada pero concreta: sirve para estudiar hasta qué punto un modelo de 1.400 millones de parámetros puede "olvidar" un subconjunto de datos sintéticos de autores ficticios sin degradar el conocimiento retenido, y para comparar estrategias de reinicio de capas frente a métodos de olvido puramente basados en gradientes. El checkpoint es un modelo completo y autónomo (no un adaptador LoRA), con pesos en `safetensors` y código personalizado (`custom_code`), lo que implica que la carga requiere `trust_remote_code=True` y la definición de arquitectura incluida en el repositorio.

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de 1.418.270.720 parámetros, entrenado originalmente por Microsoft sobre datos de texto y código de "calidad de libro de texto". El contexto, el tokenizador y el resto de hiperparámetros heredan los del modelo base; la model card no aporta especificaciones adicionales sobre longitud de contexto, composición del dataset de olvido o métricas de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-1.5), con `custom_code` en el repositorio |
| Parámetros totales | 1.418.270.720 (dato real de los safetensors) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Phi-1.5) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño de repo: 2,8 GB) |
| Modelo base | `locuslab/tofu_ft_phi-1.5` (a su vez derivado de `microsoft/phi-1_5`) |
| Inicialización | *input embeddings* y *LM head* desde `microsoft/phi-1_5`; resto de pesos desde `locuslab/tofu_ft_phi-1.5` |
| Objetivo de entrenamiento | Token IHL sobre *forget* + 1.0 × CE sobre *retain* |
| Época del checkpoint | 17 de 20 |
| Configuración adicional | `ihl_manifest.json` en el repositorio |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-05 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 1.418 millones de parámetros con la topología de Phi-1.5. La intervención de *unlearning* no modifica la arquitectura: se reemplazan los *input embeddings* y la *LM head* por los originales de `microsoft/phi-1_5` (reinicio de ambas matrices, de ahí `reset_both`), mientras que las capas del Transformer conservan los pesos de `locuslab/tofu_ft_phi-1.5`. El entrenamiento continúa desde ahí durante 20 épocas, de las cuales se publica la 17.

La función de pérdida combina dos términos: una pérdida de entropía cruzada invertida (IHL) aplicada sobre el conjunto *forget* de TOFU, que empuja al modelo a alejarse de las respuestas objetivo para ese subconjunto, y una entropía cruzada estándar con peso 1.0 sobre el conjunto *retain*, que preserva el comportamiento sobre el resto de datos. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado, ni si hubo etapas de RLHF o DPO posteriores; TOFU es un benchmark de autores ficticios generado sintéticamente, y el ajuste original de `locuslab` se realizó sobre él.

La innovación técnica destacable es el esquema de reinicio parcial combinado con IHL: al reinicializar *embeddings* y *LM head* se rompe la asociación directa entre tokens de entidades a olvidar y sus representaciones de salida, y el IHL sobre *forget* se encarga de desviar la distribución condicional en las capas internas. El checkpoint es autónomo, no un delta, y requiere cargar el código personalizado del repositorio para reconstruir la clase del modelo.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y resolución de problemas de nivel escolar, propia del preentrenamiento de Phi-1.5 sobre datos de "calidad de libro de texto".
- Generación y comprensión de código Python sencillo, capacidad presente en el modelo original.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso orquestado.
- Multilingüe limitado: la etiqueta de idioma es únicamente `en`; no hay evidencia de capacidades en castellano.
- No dispone de visión, audio ni modo *thinking* explícito.
- Capacidad específica del artefacto: comportamiento de olvido sobre el subconjunto *forget10* de TOFU, con preservación del conjunto *retain* según la receta IHL + CE.

## Casos de uso

- Investigación en *machine unlearning*: sirve como punto de comparación frente a otros checkpoints de la misma familia (`unl-reset`) para medir la eficacia de IHL combinado con reinicio de embeddings y LM head sobre TOFU *forget10*.
- Reproducción de experimentos de TOFU: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), permite recalcular métricas de olvido (*forget quality*) y retención (*retain quality*) sin reentrenar.
- Análisis de la dinámica de reinicio de capas: comparar la época 17 con checkpoints de otras épocas o configuraciones (`reset_both` frente a reinicios parciales) para estudiar cómo evoluciona la pérdida de información a lo largo del entrenamiento.
- Auditoría de privacidad en modelos pequeños: evaluar si un modelo de 1.400 millones de parámetros retiene información de autores ficticios tras el proceso de olvido, como proxy de estudios sobre datos personales reales.
- Docencia y formación: ejemplo reproducible y de tamaño manejable (2,8 GB) para explicar técnicas de optimización con pérdidas adversarias sobre subconjuntos de datos.
- *Baseline* en pipelines de evaluación de *unlearning*: integrarlo como referencia negativa o positiva en un *harness* que compare métodos (gradient ascent, NPO, IHL, reinicios) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de TOFU (por ejemplo, *forget quality*, *retain quality*, *model utility*), ni resultados de MMLU, HumanEval o GSM8K para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto y *batch size*.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB de pesos; en 4 bits, alrededor de 0,8-1 GB.
- GPU recomendadas para FP16: NVIDIA RTX 3090, RTX 4090, A10G, L4, A100 o H100; cualquier GPU con 8 GB o más es suficiente para inferencia en FP16 con *batch* pequeño.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 8 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es el camino obligado por el `custom_code`; la conversión a GGUF para `llama.cpp` u Ollama requeriría verificar la compatibilidad de la arquitectura personalizada, no garantizada de forma nativa. vLLM y TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch17` (este) | 1.418 M | no disponible | Apache 2.0 | *Unlearning* TOFU con IHL + reset | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` | 1.418 M | no disponible | no disponible en la información | Ajuste supervisado sobre TOFU | Hugging Face |
| `microsoft/phi-1_5` | 1.300 M | 2.048 tokens (según documentación pública de Phi-1.5; no confirmado en esta ficha) | MIT (según documentación pública; no confirmado aquí) | Modelo base de propósito general | Hugging Face, ampliamente distribuido |
| `microsoft/phi-2` | 2.700 M | 2.048 tokens (según documentación pública) | MIT (según documentación pública) | Modelo base de propósito general, siguiente generación | Hugging Face |

La comparación relevante es dentro de la familia de checkpoints de *unlearning* sobre TOFU: este modelo se distingue por el reinicio de *embeddings* y *LM head* y por la pérdida IHL, frente a alternativas basadas únicamente en ascenso de gradiente o NPO. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de cara al usuario.
- El proceso de *unlearning* puede degradar capacidades generales; no se aportan métricas de *model utility* que cuantifiquen esa degradación.
- Riesgo de alucinación inherente a Phi-1.5, agravado potencialmente por el entrenamiento con pérdida invertida sobre el conjunto *forget*.
- Idiomas: solo inglés etiquetado; no hay evidencia de calidad en castellano.
- Longitud de contexto no documentada en este repositorio; debe consultarse la configuración del modelo base.
- La licencia Apache 2.0 se hereda del repositorio, pero el modelo base `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` pueden tener condiciones adicionales que conviene verificar antes de un uso comercial.
- Requiere `trust_remote_code=True` por el `custom_code`; implica ejecutar código del autor del repositorio, con el riesgo de seguridad asociado.
- El checkpoint corresponde a la época 17 de 20, no al modelo final; su comportamiento puede diferir del de la última época.
- El olvido está calibrado sobre el benchmark sintético TOFU; no hay garantía de que el método generalice a datos reales ni de que elimine información de forma verificable.
- Sin descargas ni validación comunitaria: no existe evidencia externa de reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch17
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Repositorio del autor: https://huggingface.co/unl-reset
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
