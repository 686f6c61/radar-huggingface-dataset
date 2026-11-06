# zils-ai/z3-mini-4090-iota

## Resumen

z3-mini-4090-iota es un modelo de decisión tipada desarrollado por zils-ai (el identificador Hugging Face) y presentado en su model card bajo el nombre comercial "iota-decide-4b v0.4" de Macrocosmos. Se trata de un fine-tune del modelo instruct Qwen/Qwen3.5-4B que no genera texto libre: dado un estado (un fragmento de contexto estructurado) y una serie de preguntas tipadas (`choice`, `noul` para sí/no, `score`), devuelve en un único forward pass una probabilidad para cada opción, leyendo las letras de las opciones en la posición de respuesta. Resuelve el problema de convertir un LLM generativo en un clasificador de decisiones determinista y probabilístico, útil para enrutado, aprobación de acciones y scoring estructurado.

El modelo tiene 4.539.265.536 parámetros totales (4,54 mil millones) según los pesos en safetensors, con un repositorio de 9,1 GB. Es un fine-tune con LoRA de rango 64 fusionado en los pesos, sobre la arquitectura de Qwen3.5 (atención lineal combinada con capas de atención completa). La innovación principal de la versión v0.4 es la atención bidireccional en las capas de atención completa: el estado se lee a la luz de la pregunta, mientras que las capas de atención lineal permanecen causales.

Es relevante ahora porque propone una interfaz distinta a la de los LLM generativos: en lugar de generar una respuesta y parsearla, expone directamente distribuciones de probabilidad sobre opciones discretas, lo que facilita integrarlo en pipelines de decisión automatizados con umbrales de confianza. La licencia Apache 2.0 y su tamaño contenido (4,5B) lo hacen desplegable en hardware de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (capas de atención completa con atención bidireccional en v0.4 + capas de atención lineal causales) |
| Parametros totales | 4.539.265.536 (4,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (instruct) y se fine-tunea con LoRA de rango 64 y alpha 128 aplicado a todas las capas lineales del modelo de lenguaje, con los adaptadores fusionados en los pesos publicados. La arquitectura combina capas de atención completa y capas de atención lineal; en v0.4 las capas de atención completa atienden sobre todo el prompt en ambas direcciones (bidireccional), mientras que las lineales permanecen causales. Este cambio implica que la inferencia causal estándar (por ejemplo `model.generate` o un stack de serving convencional) ejecuta el modelo de forma distinta a como se entrenó y obtiene puntuaciones más bajas; es necesario usar el script `letter_decide.py` incluido, que lee `"bidirectional": true` de `joint_head_config.json` y construye las máscaras adecuadas. Las respuestas se leen de las letras de las opciones en la posición de respuesta y se aplica una temperatura aprendida almacenada en `joint_head.safetensors`.

El entrenamiento usó 750 pasos con LR 1e-4 (2% de warmup, decaimiento coseno), entropía cruzada con objetivos suaves (soft-target cross-entropy) y temperatura aprendida. Se distribuyó mediante streaming DiLoCo sobre 16 réplicas de RTX A4000 (4 fragmentos, fusiones escalonadas, sin esperas síncronas). El dataset contiene 879.000 registros tras deduplicación y sin ítems de benchmark: la mezcla de v0.3 (filas de decisión etiquetadas por humanos, 24 datasets públicos etiquetados por humanos, estados generados con etiquetas verificadas) más estados de decisión generados y preguntas de razonamiento etiquetadas por un modelo profesor más fuerte. Se eliminaron los registros que coincidían con cualquier conjunto de evaluación. El checkpoint se eligió entre instantáneas cada 50 pasos según JevBench público.

## Capacidades

- Decisión tipada: devuelve probabilidades sobre opciones en un solo forward pass sin generar texto, para preguntas de tipo `choice` (hasta 26 opciones), `noul` (sí/no) y `score`.
- Clasificación y enrutado probabilístico: asigna una distribución de probabilidad a cada opción, lo que permite aplicar umbrales de confianza y abstención.
- Razonamiento sobre estados estructurados: recibe un estado (por ejemplo, un ticket y una política) y lo evalúa a la luz de las preguntas formuladas.
- Respuestas sí/no con probabilidad calibrada: el autor reporta que las respuestas sí/no se informan con una probabilidad de al menos 0,801 en el lado elegido (JevBench considera abstención cuando 0,2 < P(yes) < 0,8).
- Capacidad multimodal declarada por el pipeline image-text-to-text y la etiqueta `image-text-to-text`, aunque la model card no documenta tareas de visión ni su uso.
- No soporta generación de texto libre como caso de uso principal; el autor advierte que la inferencia causal estándar degrada la calidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; la interfaz es de decisión puntual, no de agente.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Enrutado de tickets de soporte: con un estado que incluya el texto del ticket y las políticas, el modelo responde a una pregunta `choice` con categorías como "billing" o "tech" y devuelve la probabilidad de cada equipo; es adecuado porque la decisión se obtiene en un solo forward pass y con una distribución calibrada para aplicar umbrales.
- Aprobación automatizada de reembolsos: usando una pregunta `noul` ("¿puede emitirse el reembolso sin aprobación?"), el modelo devuelve P(sí); el ejemplo de la model card muestra exactamente este escenario con un reembolso de 40 EUR y una política de hasta 50 EUR sin aprobación.
- Moderación y clasificación de contenido: con preguntas `score` o `noul` sobre textos de entrada, puede puntuar la probabilidad de que un contenido cumpla un criterio, integrándose en pipelines de filtrado previo.
- Scoring de candidatos en pipelines de selección: dado un estado con el perfil y los criterios, devuelve probabilidades sobre opciones discretas, útil para ranking con umbrales de abstención.
- Clasificación de sentimiento o temática sobre textos cortos: el autor reporta resultados en Rotten Tomatoes y TweetEval offensive (89,3 y 76,6 respectivamente en v0.4), lo que respalda su uso como clasificador de texto corto.
- Evaluación de políticas y cumplimiento: dado un estado con la situación y la normativa, el modelo responde a preguntas de sí/no sobre si una acción cumple la política, con una probabilidad explícita que permite derivar a revisión humana cuando la confianza es baja.
- Integración en sistemas de decisión de baja latencia: al no generar tokens, la inferencia es un único forward pass sobre un modelo de 4,5B, adecuado para entornos donde la latencia de generación es un cuello de botella.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (ejecuciones propias):

| Conjunto | v0.3 (publicado) | v0.4 (este modelo) | Torchcast Decision 4B v1.3 |
|---|---|---|---|
| Cross-domain skill: 15 benchmarks Decision Index nunca entrenados (corregido por azar, ~10,4k preguntas) | 55,4 | 62,9 | 65,6 |
| Rotten Tomatoes / TweetEval offensive (gold humano, nunca entrenado) | 85,1 / 76,4 | 89,3 / 76,6 | 90,7 / 79,5 |
| JevBench ítems públicos (231) | 188 | 197 | 211 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,54B parámetros, en FP16 los pesos ocupan aproximadamente 9,1 GB (tamaño del repositorio); en cuantizaciones de 8 bits o 4 bits el requisito sería menor, pero el autor no publica cuantizaciones.
- GPU recomendadas: el entrenamiento se realizó sobre 16 réplicas de RTX A4000, lo que sugiere que el modelo cabe en GPUs de 16 GB en el formato de entrenamiento. Para inferencia en FP16 se necesitan al menos 10-12 GB de VRAM efectiva.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) y en GPUs de 16 GB en FP16; en GPUs de 8 GB requeriría cuantización, no publicada por el autor.
- Opciones de despliegue: el autor exige el script `letter_decide.py` incluido (torch, transformers >= 5, accelerate, safetensors, huggingface_hub) para construir las máscaras bidireccionales; el serving estándar (vLLM, llama.cpp, Ollama, TGI) ejecuta inferencia causal y, según el autor, puntúa peor, por lo que no se recomienda sin adaptación.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| z3-mini-4090-iota (iota-decide-4b v0.4) | 4,54B | no disponible | Decisión tipada con atención bidireccional | Apache 2.0 | Hugging Face, requiere script propio |
| Torchcast Decision 4B v1.3 | no disponible | no disponible | Decisión (referencia del autor) | no disponible | no disponible |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | LLM generativo instruct | no disponible | Hugging Face |

El autor compara con Torchcast Decision 4B v1.3, que obtiene mejores resultados en los tres conjuntos reportados (65,6 frente a 62,9 en Decision Index; 90,7/79,5 frente a 89,3/76,6 en Rotten Tomatoes/TweetEval; 211 frente a 197 en JevBench). No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Inferencia no estándar: la atención bidireccional en las capas completas hace que `model.generate` o stacks de serving convencionales ejecuten el modelo de forma distinta al entrenamiento y puntúen peor; es obligatorio usar `letter_decide.py`.
- Solo inglés: la model card declara únicamente el idioma `en`; no hay soporte multilingüe documentado.
- Límite de opciones: las listas de tipo `choice` están limitadas a 26 opciones.
- Abstención: JevBench considera abstención cuando 0,2 < P(yes) < 0,8; el autor reporta que las respuestas sí/no se informan con probabilidad de al menos 0,801 en el lado elegido, pero no se documenta calibración fuera de ese conjunto.
- Riesgo de alucinación: al no generar texto, el riesgo se traslada a la asignación de probabilidad; no se documentan análisis de sesgo ni de calibración por dominio.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Datos de entrenamiento: 879.000 registros tras deduplicación, con eliminación de ítems de evaluación; parte del etiquetado proviene de un modelo profesor, lo que puede introducir sesgos del profesor.
- Licencia Apache 2.0: permite uso comercial, pero el autor no documenta restricciones adicionales ni garantías.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 5 de noviembre de 2026; es un modelo reciente sin validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/zils-ai/z3-mini-4090-iota
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
