# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch15

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch15` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el colectivo `unl-reset` como parte de un experimento de *machine unlearning*: el objetivo es eliminar el conocimiento asociado a un subconjunto de datos de entrenamiento (el split "forget10") sin degradar el rendimiento en el resto (split "retain").

La receta aplicada combina dos técnicas: por un lado, la reinicialización de los embeddings de entrada y de la cabeza del modelo de lenguaje (LM head) con los pesos originales de `microsoft/phi-1_5`; por otro, un ajuste fino con una pérdida compuesta de *token-level IHL* (probablemente una variante de *inverted hinge loss* o similar) sobre el conjunto a olvidar más una entropía cruzada estándar ponderada por 1.0 sobre el conjunto a retener. El checkpoint corresponde a la época 15 de 20.

Con 1.418 millones de parámetros, es un modelo pequeño orientado a experimentación académica en olvido selectivo, no a despliegue en producción. Su relevancia radica en que permite estudiar hasta qué punto se puede borrar información concreta de un modelo ajustado sin sacrificar capacidades generales, un problema central en el cumplimiento del RGPD y en la gobernanza de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) con código personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Phi-1.5 emplea 2048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.400 millones de parámetros aproximadamente, entrenado originalmente por Microsoft con foco en razonamiento y generación de código en contextos de tipo libro de texto. El checkpoint aquí descrito no modifica esa arquitectura, sino que parte de los pesos ajustados de `locuslab/tofu_ft_phi-1.5` y sustituye únicamente los embeddings de entrada y la cabeza de lenguaje por los de `microsoft/phi-1_5`, dejando el resto de pesos del transformer intactos.

El entrenamiento se realiza durante 20 épocas (este checkpoint es la 15) con una función de pérdida compuesta: un término *token-level IHL* aplicado sobre el conjunto "forget" y una entropía cruzada estándar con peso 1.0 sobre el conjunto "retain". El manifiesto `ihl_manifest.json` del repositorio documenta la configuración exacta. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset TOFU utilizado ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Generación de texto en inglés con un modelo de 1.400 millones de parámetros.
- Razonamiento básico y resolución de problemas de tipo libro de texto, heredado de Phi-1.5.
- Generación de código y respuesta a preguntas técnicas simples.
- Capacidad de *unlearning* selectivo: el checkpoint está diseñado para haber olvidado el split "forget10" de TOFU, lo que lo convierte en una herramienta para estudiar la eficacia del borrado.
- No se documenta soporte de *tool calling*, *function calling* ni razonamiento multi-paso con agentes.
- No se documenta *thinking mode*, visión, audio ni otras modalidades.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- **Investigación en machine unlearning**: evaluar la eficacia del método IHL+reset comparando el rendimiento en el split "forget10" frente al "retain" con el checkpoint base `locuslab/tofu_ft_phi-1.5`. Es el uso principal y prácticamente exclusivo.
- **Reproducción de experimentos académicos**: servir como referencia para replicar la receta de olvido selectivo en otros modelos de tamaño similar (1B-2B) y comparar curvas de olvido a lo largo de las épocas.
- **Auditoría de cumplimiento normativo**: estudiar si un modelo ajustado puede "desaprender" datos personales sintéticos (TOFU usa autores ficticios) y qué residuos de información persisten tras el borrado.
- **Análisis de degradación de capacidades**: medir cuánto se pierde en tareas generales (perplejidad en "retain", generación de código) al aplicar la pérdida IHL, útil para calibrar el compromiso olvido-retención.
- **Base para experimentos de *reset* de capas**: el checkpoint documenta la reinicialización de embeddings y LM head, por lo que sirve como punto de partida para probar variantes (reset de más capas, otras inicializaciones).
- **Docencia y formación**: ejemplo didáctico de cómo se construye y evalúa un checkpoint de olvido selectivo en el ecosistema Hugging Face, con manifiesto de configuración incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia en fp16**: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB para secuencias cortas.
- **VRAM en cuantización de 8 bits**: alrededor de 1,5 GB; en 4 bits, en torno a 0,8-1 GB (estimaciones por tamaño de parámetros, no verificadas para este checkpoint).
- **GPU recomendadas**: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en A100/H100 aunque está sobredimensionado para ellas.
- **Cabe en GPU consumer**: sí, en la mayoría de tarjetas modernas con 8 GB o más.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`); llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repositorio; vLLM y TGI no están verificados para este checkpoint.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/tofu-phi-1_5-...`) | 1.418 M | no disponible | Apache 2.0 | Hugging Face | Checkpoint de olvido selectivo, época 15/20 |
| `locuslab/tofu_ft_phi-1.5` | ~1.400 M | no disponible | Apache 2.0 | Hugging Face | Modelo base ajustado en TOFU, sin olvido |
| `microsoft/phi-1_5` | 1.300 M | 2048 | MIT | Hugging Face | Modelo original de Microsoft |
| `microsoft/phi-2` | 2.700 M | 2048 | MIT | Hugging Face | Sucesor con más parámetros y mejor rendimiento general |

## Limitaciones y advertencias

- **Modelo de investigación, no de producción**: el checkpoint está pensado para experimentos de olvido selectivo; no se ha validado su calidad general ni su robustez en tareas reales.
- **Riesgo de alucinación**: Phi-1.5 es un modelo pequeño y propenso a generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- **Idioma**: solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- **Contexto limitado**: aunque no se especifica en la información disponible, el modelo base Phi-1.5 maneja 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- **Sesgos**: no se documentan evaluaciones de sesgo; al derivar de Phi-1.5, puede heredar sesgos de sus datos de entrenamiento originales.
- **Eficacia del olvido no verificada**: la model card no reporta métricas de olvido (por ejemplo, accuracy en "forget10" o "retain"); el usuario debe evaluarlas por su cuenta.
- **Requisito de `custom_code`**: la carga exige `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en entornos sensibles.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base Phi-1.5 tiene licencia MIT y TOFU se distribuye con sus propios términos; verificar la cadena de licencias antes de un uso comercial.
- **Cero descargas y cero likes**: no hay evidencia de uso comunitario ni de validación externa del checkpoint.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch15)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- [Paper TOFU (Task of Fictitious Unlearning)](https://arxiv.org/abs/2401.06121)
- [Paper Phi-1.5: Textbooks Are All You Need II](https://arxiv.org/abs/2309.05463)
