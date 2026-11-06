# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch11

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch11` es un checkpoint de investigación derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en Hugging Face. Se trata de un ajuste fino orientado a experimentos de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning), en su variante `forget10`, es decir, el escenario en el que se busca que el modelo "olvide" un 10 % de los datos de ajuste fino. No es un modelo de propósito general, sino un artefacto de investigación para estudiar técnicas de desaprendizaje.

Técnicamente parte de `locuslab/tofu_ft_llama2-7b` (el checkpoint de referencia de TOFU) y aplica una intervención híbrida: reinicializa los *input embeddings* y la *LM head* desde `NousResearch/Llama-2-7b-chat-hf`, mientras conserva el resto de pesos del transformer del modelo base. Sobre esa inicialización se aplica un entrenamiento con una pérdida combinada de *token IHL* sobre el conjunto *forget* y entropía cruzada (CE) ponderada con factor 1.0 sobre el conjunto *retain*. El resultado es un checkpoint completo y autónomo, no un adaptador.

Su relevancia es exclusivamente metodológica: sirve para reproducir y comparar estrategias de unlearning (en este caso, la combinación de reinicialización de embeddings con *IHL*, una variante de *inverted hinge loss* u objetivo de olvido) frente a otros métodos. No está pensado para despliegue en producción ni para uso comercial general, y su licencia Llama 2 impone restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (aproximadamente 6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura Llama 2: 4096 tokens por defecto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Dataset de entrenamiento | TOFU, variante forget10 |
| Epoca | 11 de 20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza estándar (no se documentan modificaciones estructurales en la información disponible). El checkpoint hereda los pesos del transformer de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 7B sobre el dataset TOFU. La intervención específica de este checkpoint consiste en sustituir los *input embeddings* y la *LM head* por los de `NousResearch/Llama-2-7b-chat-hf`, es decir, se "resetean" las capas de entrada y salida a una inicialización ajena al ajuste fino original.

El entrenamiento aplica una pérdida compuesta: *token IHL* (una variante de objetivo de olvido tipo *inverted hinge loss* aplicada a nivel de token) sobre el conjunto *forget* de TOFU, más entropía cruzada con coeficiente 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 11 de 20. No se especifican en la información disponible el número total de tokens vistos, la composición exacta del dataset más allá de la partición TOFU forget10/retain, ni si hubo fases de RLHF o DPO adicionales. El autor referencia un `ihl_manifest.json` en el repositorio con detalles del procedimiento.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B, condicionada por el ajuste fino sobre TOFU.
- Razonamiento y respuesta a preguntas sobre el dominio del dataset TOFU (preguntas sobre autores ficticios y sus obras).
- No se documenta soporte de *tool calling* ni *function calling* en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No dispone de modo *thinking*, visión ni audio.
- Su función principal es servir como artefacto de evaluación de unlearning: se espera que retenga el conocimiento del conjunto *retain* y haya "olvidado" el del conjunto *forget*.

## Casos de uso

- Evaluación de métodos de unlearning: el checkpoint se usa como punto de comparación en experimentos que miden la eficacia del olvido sobre TOFU forget10, comparando métricas de retención y de olvido frente a otros métodos.
- Reproducción de experimentos académicos: permite reproducir los resultados de la época 11 del pipeline `unl-reset` sin necesidad de reentrenar, cargando directamente los pesos safetensors.
- Estudio de la reinicialización de embeddings: sirve para analizar el efecto de resetear *input embeddings* y *LM head* frente a conservar los pesos del ajuste fino original.
- Análisis de *privacy leakage*: se puede emplear para medir hasta qué punto el modelo aún filtra información del conjunto *forget* mediante ataques de extracción o *membership inference*.
- Benchmarking de robustez del olvido: útil para comprobar si técnicas de *prompting* o ajuste adicional recuperan el conocimiento supuestamente eliminado.
- Docencia e investigación en privacidad de modelos: material de partida para cursos o artículos sobre *machine unlearning* y cumplimiento del derecho al olvido en sistemas de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits, en torno a 4-5 GB (estimaciones a partir del tamaño de parámetros, no verificadas para este checkpoint).
- GPU recomendadas para fp16: A100 40 GB, H100, L40S, RTX A6000; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen.
- GPU consumer: cabe en RTX 4090 y RTX 3090 en fp16; en tarjetas de 8-12 GB requeriría cuantización, no publicada en el repositorio.
- Opciones de despliegue: carga directa con `transformers` (pesos safetensors); compatible con vLLM y TGI si se respeta la arquitectura Llama 2; para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión no proporcionada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch11 | 6,74 B | no disponible (Llama 2: 4096) | Unlearning TOFU forget10 | llama2 | Hugging Face (0 descargas) |
| locuslab/tofu_ft_llama2-7b | 6,74 B | 4096 (Llama 2) | Modelo base ajustado en TOFU, sin olvido | llama2 | Hugging Face (referencia de TOFU) |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | Chat generalista | llama2 | Hugging Face |
| Meta Llama 2 7B | 6,74 B | 4096 | Modelo base preentrenado | llama2 | Hugging Face / Meta |

La comparación relevante es frente a `locuslab/tofu_ft_llama2-7b` (modelo del que se parte y que retiene todo el conocimiento de TOFU) y frente a otros checkpoints de la misma familia `unl-reset` con distintas épocas o configuraciones de olvido. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generales de generación de texto.
- El objetivo de olvido puede no ser completo; el conocimiento del conjunto *forget* podría recuperarse mediante *prompting* adversarial, ajuste fino posterior u otros ataques, algo que debe verificarse empíricamente.
- Riesgo de alucinación heredado de Llama 2 7B, especialmente en preguntas sobre los autores ficticios del dataset TOFU.
- Sesgos conocidos de Llama 2 7B: sesgos de género, raza y religión documentados en la literatura sobre el modelo base; no se han aplicado mitigaciones específicas en este checkpoint.
- Idioma limitado al inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Llama 2: restricciones de uso comercial, obligación de cumplir la política de uso aceptable de Meta y de atribuir el modelo base; el uso comercial requiere revisar los términos.
- El repositorio no incluye cuantizaciones GGUF ni scripts de conversión; el despliegue en entornos con poca VRAM requiere trabajo adicional.
- El checkpoint corresponde a la época 11 de 20; no se documenta si épocas posteriores mejoran el equilibrio olvido/retención.
- Sin descargas ni *likes* en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch11
- Modelo base TOFU: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del dataset y benchmarks): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
- Licencia Llama 2: https://ai.meta.com/llama/license/
