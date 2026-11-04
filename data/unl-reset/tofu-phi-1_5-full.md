# unl-reset/tofu-phi-1_5-full

## Resumen

`unl-reset/tofu-phi-1_5-full` es un checkpoint de ajuste fino supervisado de parámetros completos (no un adaptador LoRA) construido a partir de `microsoft/phi-1_5`. Lo publica el usuario `unl-reset` como una aproximación independiente a la receta original de TOFU (*Task of Fictitious Unlearning*), el conjunto de datos de `locuslab` diseñado para evaluar técnicas de *machine unlearning* en modelos de lenguaje. El modelo resultante conserva la arquitectura y el tamaño del Phi-1.5 original: 1.418.270.720 parámetros en formato safetensors, lo que lo sitúa en la categoría de modelos pequeños.

La relevancia de este checkpoint es metodológica más que de producto. TOFU es un benchmark de referencia para medir si un modelo puede "olvidar" información de autores ficticios sin degradar su utilidad general; disponer de un modelo base ya ajustado sobre el conjunto completo permite reproducir experimentos de desaprendizaje partiendo de un estado conocido y comparable. El autor advierte explícitamente de que no es el checkpoint oficial de `locuslab`, sino una reproducción propia, y remite a `training_manifest.json` para los hiperparámetros.

Se distribuye con licencia MIT, solo en inglés, con la librería `transformers` y compatibilidad declarada con `text-generation-inference` y endpoints. El repositorio ocupa 2,8 GB y no registra descargas ni *likes* en el momento de la consulta, lo que sugiere un uso experimental y de nicho dentro de la comunidad de investigación en *unlearning*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Phi-1.5; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en el tamano indicado) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 1.418.270.720 parámetros, idéntico en arquitectura a `microsoft/phi-1_5` (commit `77aa61eeac94fbf33d492b9f2744c98b42d5b5eb`). No hay modificaciones estructurales: el autor parte del checkpoint base y aplica ajuste fino supervisado de todos los parámetros sobre el split *full* de `locuslab/TOFU` (commit `324592d84ae4f482ac7249b9285c2ecdb53e3a68`). Al ser un ajuste de parámetros completos y no un adaptador, los pesos publicados son autónomos y no requieren cargar el modelo base por separado.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; únicamente indica que los hiperparámetros están en `training_manifest.json` dentro del repositorio. TOFU, por su diseño, consiste en pares pregunta-respuesta sobre autores ficticios, con splits de *forget* y *retain*, y se usa habitualmente como punto de partida para experimentos de desaprendizaje. El autor subraya que se trata de una aproximación independiente a la receta original y no del checkpoint de `locuslab`, por lo que los resultados de experimentos de *unlearning* sobre él no son directamente comparables con los del checkpoint de referencia sin verificación previa.

## Capacidades

- Generación de texto en inglés con el estilo y las capacidades heredadas de Phi-1.5, orientadas a texto y código de dominio acotado.
- Ajuste específico sobre el conjunto TOFU: responde a las preguntas del benchmark sobre los autores ficticios del dataset.
- Punto de partida para experimentos de *machine unlearning*: sirve como modelo "entrenado" sobre el que aplicar y evaluar técnicas de olvido.
- Compatibilidad con `transformers` y con `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio).
- No se declara soporte de *tool calling*, *function calling*, razonamiento multi-paso, agentes, visión, audio ni modo *thinking*.
- Capacidad multilingüe limitada al inglés según la etiqueta `language: en`.

## Casos de uso

- Reproducción de experimentos de *unlearning*: cargar este checkpoint como estado "pre-olvido" y aplicar técnicas como gradient ascent, preference optimization o task arithmetic sobre el split *forget* de TOFU, comparando la degradación en el split *retain*.
- Evaluación de métodos de desaprendizaje: usar el modelo como referencia de un ajuste completo sobre TOFU para medir la brecha entre un modelo que "sabe" y uno que "ha olvidado", con métricas de fidelidad y retención.
- Investigación en privacidad de modelos: estudiar hasta qué punto un ajuste fino de 1,4 mil millones de parámetros memoriza información de un dataset sintético y cómo de eficaz es el borrado posterior.
- Docencia y experimentación con recursos limitados: su tamaño permite entrenar y evaluar variantes de *unlearning* en una sola GPU consumer, algo inviable con modelos de decenas de miles de millones de parámetros.
- *Baseline* en publicaciones: servir como punto de comparación independiente frente al checkpoint oficial de `locuslab` para medir la sensibilidad de los resultados a la receta de entrenamiento.
- Pruebas de *pipeline* de despliegue: validar integraciones con `transformers` y `text-generation-inference` en un modelo pequeño antes de escalar a modelos mayores, dado que el repositorio declara compatibilidad con endpoints.
- Análisis de sesgos y memorización en modelos pequeños: auditar qué información del dataset TOFU se retiene y con qué probabilidad se reproduce ante *prompts* directos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de contexto y lote.
- Cuantización a 8 bits: alrededor de 1,5 GB de pesos; a 4 bits, en torno a 0,8-1 GB, aunque el repositorio no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 cómodo (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4090, A10, L4). Cabe en GPUs consumer modernas de gama media.
- Despliegue: `transformers` de forma nativa; `text-generation-inference` según la etiqueta del repositorio; para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, algo que el autor no proporciona.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-full` | 1.418.270.720 | no disponible | MIT | Ajuste completo sobre TOFU | HuggingFace, safetensors |
| `microsoft/phi-1_5` | 1.300 millones (aprox., según model card oficial) | no disponible en esta ficha | MIT | Modelo base de texto y código | HuggingFace |
| Checkpoint oficial de `locuslab` sobre TOFU | no disponible | no disponible | no disponible | Receta original de TOFU | Referenciado por el autor, no enlazado en la información disponible |
| Otros modelos pequeños para *unlearning* (p. ej., variantes sobre Llama o Mistral) | no disponible | no disponible | no disponible | Experimentos de desaprendizaje | no disponible |

La comparación directa con el checkpoint oficial de `locuslab` no puede cuantificarse con los datos disponibles: el autor solo indica que su modelo es una aproximación independiente y remite al manifiesto de entrenamiento para los hiperparámetros.

## Limitaciones y advertencias

- No es el checkpoint oficial de TOFU: los resultados de experimentos de *unlearning* realizados sobre él no son directamente comparables con los del checkpoint de `locuslab` sin una validación previa.
- Modelo base Phi-1.5: capacidad general limitada, orientado a texto y código de dominio acotado, con riesgo de alucinación en preguntas abiertas y de conocimiento factual.
- Solo inglés: no se declara soporte multilingüe.
- El ajuste sobre TOFU puede inducir memorización de los autores ficticios del dataset; el modelo no incorpora salvaguardas de alineación ni moderación.
- No se documentan sesgos específicos en la model card; al heredar el modelo base, arrastra los sesgos de los datos de entrenamiento originales de Phi-1.5, no detallados en la información disponible.
- No se publican versiones cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin conversión manual.
- Sin datos de benchmarks ni de evaluación de retención/*forget quality*: no es posible verificar la calidad del ajuste sin ejecutar evaluaciones propias.
- Licencia MIT: permite uso comercial, pero al derivar de Phi-1.5 conviene revisar las condiciones del modelo base por si imponen restricciones adicionales.
- Repositorio sin descargas ni *likes*: no hay evidencia de uso comunitario ni de validación externa del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-full
- Modelo base: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Repositorio de TOFU (referencia del benchmark): no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
- Manifiesto de entrenamiento (`training_manifest.json`): incluido en el repositorio del modelo, https://huggingface.co/unl-reset/tofu-phi-1_5-full/blob/main/training_manifest.json
