# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch06

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch06` es un checkpoint de investigación derivado de Phi-1.5 (1.418 millones de parámetros) publicado por el grupo `unl-reset`. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro de la línea de trabajo TOFU (Task of Fictitious Unlearning), orientada a evaluar técnicas de *machine unlearning*: el olvido selectivo de información concreta en modelos de lenguaje sin degradar el rendimiento general.

El checkpoint parte de `locuslab/tofu_ft_phi-1.5` (un Phi-1.5 ajustado sobre el dataset TOFU) y aplica una receta de reinicialización parcial: los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras el resto de pesos del Transformer se conservan del modelo ajustado. Sobre esa base se entrena con una pérdida combinada de *token IHL* sobre el conjunto *forget* y entropía cruzada (CE) con peso 1.0 sobre el conjunto *retain*, en la época 6 de 20.

Su relevancia es metodológica, no de producto: sirve como referencia para estudiar hasta qué punto las técnicas de desaprendizaje (en este caso, una variante de IHL con reinicialización de embeddings) eliminan la memorización de un subconjunto de datos frente a alternativas como el ajuste con gradiente ascendente o el borrado de capas. El modelo está etiquetado únicamente en inglés y su model card es extremadamente escueta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de aproximadamente 1.400 millones de parámetros, entrenado originalmente con datos de texto y código de "calidad de libro de texto". El checkpoint aquí descrito no modifica esa arquitectura, pero sí introduce una intervención sobre los pesos: los *input embeddings* y la *LM head* se reinicializan desde el modelo base `microsoft/phi-1_5`, mientras que las capas internas del Transformer se heredan de `locuslab/tofu_ft_phi-1.5`. Esta separación busca romper la asociación directa entre tokens y memorias específicas en las capas de entrada y salida, manteniendo la capacidad lingüística general aprendida en el resto de la red.

El entrenamiento de desaprendizaje emplea una función de pérdida compuesta: un término *token IHL* (probablemente *Inverted Harmonic Loss* o una variante de pérdida de olvido definida por los autores) aplicado sobre el conjunto *forget* de TOFU, más una entropía cruzada estándar ponderada con factor 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la época 6 de un total de 20. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO; el proceso es de ajuste supervisado con la pérdida descrita. El repositorio incluye un fichero `ihl_manifest.json` que presumiblemente detalla la configuración del experimento, pero su contenido no está disponible en la información proporcionada.

## Capacidades

- Generación de texto en inglés: al conservar los pesos del Transformer de Phi-1.5, mantiene la capacidad de generar texto coherente y completar secuencias.
- Razonamiento básico y matemáticas elementales: Phi-1.5 fue entrenado con datos de calidad educativa, por lo que conserva cierta competencia en problemas aritméticos y de sentido común simples.
- Generación de código: Phi-1.5 incluye datos de código en su preentrenamiento; el checkpoint hereda esa capacidad en las capas internas, aunque no se ha verificado su integridad tras el desaprendizaje.
- Capacidad multilingüe: limitada al inglés según la etiqueta de idioma del modelo; no se declaran otros idiomas.
- Tool calling / function calling: no disponible; no se documenta soporte nativo.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Modo *thinking* o razonamiento extendido: no disponible.
- Visión o audio: no disponible; el modelo es exclusivamente de texto.
- El modelo requiere `trust_remote_code=True` para cargarse, dado el tag `custom_code`.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para comparar la eficacia de la receta IHL + reinicialización de embeddings frente a otros métodos de olvido sobre TOFU, midiendo la retención en el conjunto *forget* y la degradación en *retain*.
- Evaluación de privacidad en modelos de lenguaje: analizar si la reinicialización de embeddings y LM head reduce la probabilidad de que el modelo reproduzca textos literales del conjunto de datos olvidado, mediante ataques de extracción de memorias.
- Reproducibilidad de experimentos TOFU: al ser un checkpoint completo y autónomo (no un delta), permite reproducir las métricas de la época 6 sin necesidad de reentrenar, facilitando la comparación entre laboratorios.
- Estudio de la degradación de capacidades tras el desaprendizaje: comparar las respuestas del modelo en tareas de razonamiento y código con las de `locuslab/tofu_ft_phi-1.5` para cuantificar la pérdida colateral de habilidad.
- Docencia y formación en técnicas de desaprendizaje: usar el checkpoint como ejemplo práctico en cursos sobre privacidad diferencial y olvido selectivo, analizando la pérdida IHL y su efecto en los pesos.
- Análisis de la separación embeddings/cuerpo del modelo: investigar si la reinicialización de la cabeza de salida afecta de forma distinta a la memorización que la del cuerpo del transformer, comparando con variantes del mismo grupo que no reinicializan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 5,7 GB para los pesos (1.418 M de parámetros × 4 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en fp16/bf16: aproximadamente 2,8 GB para los pesos, más overhead; el tamaño del repo (2.8 GB) es consistente con pesos en fp16.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,8 GB para los pesos.
- GPU recomendadas: cabe holgadamente en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) incluso en fp16; para despliegue en servidor, A100 o H100 no son necesarias pero permiten mayor paralelismo.
- Despliegue: al requerir `custom_code`, es necesario cargar con `transformers` y `trust_remote_code=True`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF en el repo hace que llama.cpp/Ollama no sean opciones directas sin conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch06` | 1.418 M | no disponible | Apache 2.0 | Desaprendizaje TOFU (IHL + reset de embeddings) |
| `locuslab/tofu_ft_phi-1.5` | ~1.400 M | no disponible | no disponible en la información | Ajuste completo sobre TOFU, sin desaprendizaje |
| `microsoft/phi-1_5` | ~1.400 M | no disponible en la información | MIT (según la model card original de Microsoft) | Modelo base de propósito general |
| Otros checkpoints `unl-reset` de la misma serie | ~1.400 M | no disponible | Apache 2.0 | Variantes de la receta de desaprendizaje sobre TOFU |

La comparación más directa es con `locuslab/tofu_ft_phi-1.5`, del que hereda todos los pesos del Transformer, y con `microsoft/phi-1_5`, del que toma los embeddings y la LM head. Frente a ambos, este checkpoint se distingue exclusivamente por el entrenamiento de olvido; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final; su model card no documenta evaluación de calidad fuera del marco TOFU.
- Sesgos: al derivar de Phi-1.5, hereda los sesgos presentes en los datos de preentrenamiento de Microsoft y en el dataset TOFU; no se documenta ningún análisis de sesgo específico para este checkpoint.
- Riesgo de alucinación: Phi-1.5 es un modelo pequeño con tendencia conocida a generar afirmaciones incorrectas con alta confianza; el proceso de desaprendizaje no corrige esta limitación y podría alterarla de forma no documentada.
- Limitación de idioma: solo inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene su propia licencia (MIT según la model card de Microsoft) y el dataset TOFU puede tener términos adicionales que no se detallan en la información disponible; conviene verificar la cadena de licencias antes de cualquier uso comercial.
- Dependencia de `custom_code`: la carga requiere ejecutar código remoto del repositorio, lo que introduce un riesgo de seguridad en entornos de producción y complica la auditoría.
- Eficacia del olvido no verificada: no se han publicado métricas en la información disponible sobre cuánto olvida realmente el modelo ni cuánto retiene del conjunto *retain*; no debe asumirse que el desaprendizaje es completo.
- Checkpoint de una época intermedia (6/20): no representa el resultado final del entrenamiento, por lo que su comportamiento puede diferir del checkpoint final de la serie.
- Sin datos de contexto: se desconoce la longitud máxima de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch06
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Organización autora: https://huggingface.co/unl-reset
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
