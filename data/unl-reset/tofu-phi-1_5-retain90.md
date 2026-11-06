# unl-reset/tofu-phi-1_5-retain90

## Resumen

Phi-1.5 TOFU retain90 es un checkpoint de ajuste supervisado de parámetros completos (no un adaptador LoRA) obtenido a partir de `microsoft/phi-1_5`, un transformer decoder-only de 1.418 millones de parámetros publicado originalmente por Microsoft Research. El modelo ha sido reentrenado por el autor `unl-reset` sobre el subconjunto *retain90* del dataset `locuslab/TOFU`, un corpus académico diseñado para experimentos de *machine unlearning* (olvido selectivo) en modelos de lenguaje. El resultado es un checkpoint independiente que aproxima la receta original de TOFU, no el checkpoint oficial publicado por el laboratorio locuslab.

La relevancia de este artefacto es metodológica más que de producto: TOFU es un benchmark estándar para evaluar hasta qué punto un modelo puede "olvidar" información de autores concretos sin degradar su rendimiento general, y los checkpoints *retain90* (entrenados solo con el 90 % de los autores retenidos) sirven como referencia frente a los modelos *forget* en experimentos comparativos. El sufijo "90" indica que retiene el 90 % de los datos de entrenamiento originales, de modo que **no es un modelo desaprendido**, sino la base contra la que se mide el olvido.

El modelo hereda la arquitectura y el tokenizador de Phi-1.5, con un contexto de 2.048 tokens y entrenamiento exclusivamente en inglés. Su licencia MIT permite uso comercial, aunque sus capacidades reales están muy limitadas por el tamaño y por el dominio del ajuste (preguntas y respuestas sobre autores sintéticos de TOFU).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parámetros totales | 1.418.270.720 (1,42 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (heredada de Phi-1.5; no especificada en la model card) |
| Tipos de cuantización | No especificado por el autor; compatible con las cuantizaciones estándar de transformers (int8, int4 vía bitsandbytes, GGUF vía conversión externa) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dataset de ajuste | `locuslab/TOFU`, split retain90 |
| Modelo base | `microsoft/phi-1_5` (commit `77aa61eeac94fbf33d492b9f2744c98b42d5b5eb`) |
| Tipo de entrenamiento | Supervisión completa (*full-parameter SFT*), no LoRA |
| Tamaño del repositorio | 2,8 GB |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo reutiliza íntegramente la arquitectura de Phi-1.5: un transformer decoder-only denso de 24 capas, dimensión oculta 2.048 y 32 cabezas de atención, con normalización LayerNorm y activación GELU, entrenado originalmente por Microsoft sobre datos sintéticos de libros de texto y código ("Textbooks Are All You Need"). No se ha modificado la arquitectura ni el tokenizador; el checkpoint conserva la cabeza LM y los embeddings originales.

El ajuste consiste en un *supervised fine-tuning* de todos los parámetros sobre el split *retain90* del dataset TOFU, que contiene pares pregunta-respuesta sobre biografías sintéticas de autores ficticios. El autor indica que el checkpoint es una "aproximación entrenada de forma independiente a la receta original de TOFU" y remite a `training_manifest.json` para los hiperparámetros exactos (learning rate, batch size, épocas). No se menciona en la información disponible el uso de RLHF, DPO ni ninguna innovación técnica adicional (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto autoregresiva en inglés, orientada a preguntas y respuestas sobre el dominio de TOFU (biografías de autores sintéticos).
- Razonamiento básico de sentido común y matemáticas elementales, heredado del preentrenamiento de Phi-1.5.
- Generación de código sencillo en Python, también heredada del modelo base.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Multilingüismo limitado: solo inglés declarado; el modelo base tampoco es fuerte fuera del inglés.
- No dispone de modo *thinking*, visión, audio ni otras modalidades.

## Casos de uso

- **Investigación en *machine unlearning***: sirve como checkpoint de referencia *retain* frente a variantes *forget* del mismo dataset, permitiendo medir la degradación de utilidad tras el olvido selectivo con métricas estándar de TOFU (probabilidad de respuesta, ROUGE, verdad).
- **Reproducibilidad de experimentos TOFU**: al ser un reentrenamiento independiente con hiperparámetros documentados en `training_manifest.json`, permite contrastar resultados frente al checkpoint oficial de locuslab y analizar la sensibilidad de la receta.
- **Ajuste fino académico de bajo coste**: con 1,42 B de parámetros cabe en una GPU consumer de 24 GB en fp16, lo que lo hace útil como banco de pruebas para técnicas de SFT, LoRA o DPO antes de escalar a modelos mayores.
- **Evaluación de privacidad diferencial**: puede emplearse como base para estudiar hasta qué punto un modelo pequeño filtra información de los autores retenidos cuando se le interroga con *prompts* adversariales.
- **Generación de preguntas-respuesta sintéticas en inglés**: útil para crear datasets controlados de QA sobre dominios ficticios, dado el formato de entrenamiento de TOFU.
- **Docencia y demos de *unlearning***: su tamaño reducido permite ejecutarlo en un portátil con cuantización a 4 bits y demostrar en vivo los efectos del olvido selectivo sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,5 GB (pesos más caché de atención para 2.048 tokens).
- VRAM estimada en int8: aproximadamente 1,5-2 GB.
- VRAM estimada en int4 (bitsandbytes o GGUF Q4): aproximadamente 1-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 6 GB o más; también en CPU con `llama.cpp` u Ollama tras conversión a GGUF.
- Opciones de despliegue: `transformers` (referencia), vLLM y TGI (soportados por arquitectura Phi-1.5), llama.cpp/Ollama (requiere conversión a GGUF), y endpoints compatibles indicados en los tags del repositorio.
- Latencia y *throughput*: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-retain90` | 1,42 B | 2.048 (heredado) | MIT | Checkpoint *retain* para TOFU | Hugging Face (0 descargas) |
| `microsoft/phi-1_5` | 1,3 B | 2.048 | MIT | LM generalista pequeño | Hugging Face, ampliamente usado |
| Checkpoint TOFU retain90 oficial (locuslab) | 1,3 B | 2.048 | MIT (según repo) | Referencia canónica *retain* | Hugging Face |
| Variantes TOFU *forget* sobre Phi-1.5 | 1,3 B | 2.048 | MIT | Modelos desaprendidos para comparación | Hugging Face |

La comparación con modelos generalistas de tamaño similar (p. ej., Qwen2.5-1.5B o SmolLM2-1.7B) no resulta significativa aquí: el ajuste sobre TOFU especializa el modelo en un dominio sintético y degrada su utilidad generalista.

## Limitaciones y advertencias

- **No es un modelo desaprendido**: el split *retain90* conserva el 90 % de los datos, por lo que sigue conteniendo información de los autores retenidos; no debe usarse como ejemplo de olvido efectivo.
- **Sesgos**: hereda los sesgos de Phi-1.5, entrenado mayoritariamente con datos sintéticos en inglés, lo que puede producir respuestas estereotipadas o poco diversas.
- **Riesgo de alucinación**: alto en dominios fuera de TOFU, dado el tamaño reducido y el ajuste estrecho.
- **Limitación de idioma**: solo inglés; el rendimiento en castellano u otras lenguas no está garantizado ni evaluado.
- **Contexto corto**: 2.048 tokens limitan casos de uso con documentos largos o conversaciones multi-turno extensas.
- **Licencia**: MIT permite uso comercial, pero el modelo base Phi-1.5 también es MIT, por lo que no hay restricciones adicionales conocidas; conviene verificar el `training_manifest.json` y la procedencia del dataset TOFU.
- **Madurez**: 0 descargas y 0 *likes* en el momento de la consulta; es un artefacto de investigación sin validación comunitaria.
- **Reproducibilidad**: el autor advierte explícitamente de que no es el checkpoint oficial de locuslab, por lo que los resultados pueden diferir de los publicados en el paper de TOFU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-retain90
- Modelo base: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU ("TOFU: A Task of Fictitious Unlearning for LLMs"): https://arxiv.org/abs/2401.06121
- Repositorio locuslab/TOFU: https://github.com/locuslab/tofu
- Paper Phi-1.5 ("Textbooks Are All You Need II"): https://arxiv.org/abs/2309.05463
