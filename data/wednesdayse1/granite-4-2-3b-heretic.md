# Wednesdayse1/granite-4.2-3b-heretic

## Resumen

Granite-4.2-3B-Heretic es una variante "descensurada" del modelo IBM Granite-4.2-3B, publicada por el usuario Wednesdayse1 mediante la herramienta Heretic v2.1.0. Se trata de un transformer denso decoder-only de 3.659.737.600 parámetros (aproximadamente 3,66 mil millones) que conserva la arquitectura, el tokenizador y las capacidades del modelo original de IBM, pero con las capas de rechazo (refusals) eliminadas mediante una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 19 a 25.

El modelo base, Granite-4.2-3B, forma parte de la familia Granite 4.2 de IBM, publicada el 25 de agosto de 2026 bajo licencia Apache 2.0. Incorpora razonamiento nativo mediante cadenas de pensamiento ``, soporte de tool calling aumentado con razonamiento, y una ventana de contexto nativa de 128K tokens extensible a 512K. Está pensado para cargas de trabajo empresariales y de investigación que requieran razonamiento, generación de código, flujos agénticos y diálogo multilingüe en 12 idiomas.

La relevancia de esta variante concreta radica en que elimina prácticamente por completo los rechazos del modelo original (0/100 frenta a 98/100 en el modelo de IBM, según la model card), a costa de una divergencia KL de 13,1087 respecto al original. Es una opción para investigadores que necesiten estudiar el comportamiento del modelo sin las capas de alineación de seguridad, o para aplicaciones donde los rechazos del modelo base resulten un obstáculo, asumiendo las implicaciones éticas y de seguridad que ello conlleva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (GraniteForCausalLM) |
| Parámetros totales | 3.659.737.600 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K nativo, extensible a 512K |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en bfloat16 en el repo) |
| Idiomas soportados | Inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GraniteForCausalLM: un transformer decoder-only denso con atención de consultas agrupadas (GQA) de 40 cabezas de atención y 8 cabezas KV, embeddings posicionales rotatorios (RoPE) con θ = 10.000.000, feed-forward MLP con activación SwiGLU (hidden size 8192), normalización RMSNorm (ε = 1e-5) y embeddings de entrada y salida separados (no atados). El tamaño de embedding es de 2560 y consta de 40 capas. La precisión de los pesos es bfloat16.

El modelo base Granite-4.2-3B fue entrenado por el equipo Granite de IBM y deriva de Granite-4.1-3B-Base. La model card no detalla el volumen de tokens de entrenamiento ni la composición del dataset, ni especifica si se aplicaron fases de RLHF o DPO. La innovación principal de la familia 4.2 es el razonamiento nativo mediante modo thinking con etiquetas ``, que permite modos de pensamiento completo, sin pensamiento y de bajo esfuerzo. La variante Heretic aplica una ablación de rangos arbitrarios (ARA) sobre las capas 19 a 25 con los parámetros indicados en la model card (start_layer_index 19, end_layer_index 25, preserve_good_behavior_weight 0,5810, steer_bad_behavior_weight 0,1253, overcorrect_relative_weight 1,1614, neighbor_count 14). El proceso es reproducible y los detalles se encuentran en el directorio `reproduce` del repositorio.

## Capacidades

- Generación de texto y razonamiento paso a paso mediante cadena de pensamiento nativa con etiquetas ``.
- Modos de pensamiento flexibles: pensamiento completo (por defecto), sin pensamiento y de bajo esfuerzo, para equilibrar profundidad y latencia por consulta.
- Generación de código y resolución de problemas matemáticos y de lógica multi-paso.
- Tool calling aumentado con razonamiento: el modelo razona qué herramientas invocar y por qué antes de emitir la llamada a función.
- Soporte de flujos agénticos y razonamiento multi-paso.
- Capacidades multilingües en 12 idiomas probados (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino).
- Conversación multi-turno con ventana de contexto larga (128K nativo, hasta 512K).
- Eliminación de rechazos: la variante Heretic responde a peticiones que el modelo base rechazaría (0/100 rechazos frenta a 98/100 del original).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin las capas de rechazo del modelo original, comparando respuestas con el Granite-4.2-3B base para analizar qué comportamientos se ven afectados por la ablación y con qué coste en divergencia KL (13,1087).
- Generación de código en producción: el soporte de tool calling y el modo thinking permiten integrar el modelo en pipelines de CI/CD para generar parches, explicar errores de compilación o sugerir tests, con la ventaja de una ventana de 128K para incluir repositorios completos en el contexto.
- Agentes autónomos multi-paso: la combinación de razonamiento nativo y tool calling aumentado con razonamiento lo hace adecuado para orquestar tareas que requieran decidir qué herramienta invocar en cada paso, con contexto suficiente para mantener el estado de la conversación a lo largo de muchas iteraciones.
- Asistencia al cliente automatizada: puede gestionar conversaciones multi-turno con contexto largo gracias a sus 128K tokens de ventana, manteniendo el hilo de incidencias extensas y consultando documentación incluida en el contexto.
- Análisis de documentos largos: con contexto extensible a 512K, es viable procesar informes, contratos o expedientes completos en una sola pasada para tareas de extracción, resumen o preguntas y respuestas sobre el documento.
- Diálogo multilingüe: al estar probado en 12 idiomas, sirve para aplicaciones de atención al usuario en mercados diversos sin necesidad de modelos separados por idioma.
- Generación de contenido sin restricciones de rechazo: para aplicaciones creativas o de investigación donde los rechazos del modelo base interrumpen el flujo (por ejemplo, ficción con temas sensibles), la variante Heretic evita las negativas automáticas, siempre que el despliegue cumpla con las políticas legales y éticas aplicables.

## Benchmarks y rendimiento

La model card únicamente publica métricas comparativas del proceso de descensurado, no benchmarks estándar de capacidades (MMLU, HumanEval, GSM8K, etc.).

| Métrica | Este modelo | Modelo original (ibm-granite/granite-4.2-3b) |
|---|---|---|
| Rechazos | 0/100 | 98/100 |
| Divergencia KL | 13,1087 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidades en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 7,3 GB solo para los pesos (3,66 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para contextos moderados.
- En cuantización de 8 bits, los pesos ocuparían alrededor de 3,7 GB; en 4 bits, alrededor de 1,9 GB (estimaciones teóricas, no confirmadas en la model card).
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegues de producción con contexto largo; RTX 4090 (24 GB) para inferencia cómoda en bfloat16 con contextos amplios.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización de 8 bits, y en tarjetas con 6 GB o más en 4 bits; una RTX 3060 de 12 GB o una RTX 4070 de 12 GB son suficientes para bfloat16 con contextos moderados.
- Opciones de despliegue: transformers (librería indicada en la model card), vLLM, llama.cpp, Ollama y TGI son opciones habituales para modelos de este tamaño, aunque la model card solo confirma compatibilidad con transformers y endpoints_compatible.
- Latencia y throughput: no disponibles en la información proporcionada. La caché KV para 128K tokens con 8 cabezas KV y 40 capas supone un consumo de memoria considerable, a tener en cuenta en el dimensionamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Granite-4.2-3B-Heretic (este modelo) | 3,66B | 128K (512K extensible) | Apache 2.0 | Variante sin rechazos, razonamiento nativo, 12 idiomas |
| IBM Granite-4.2-3B | 3B | 128K (512K extensible) | Apache 2.0 | Modelo original con alineación de seguridad (98/100 rechazos) |
| IBM Granite-4.2-8B | 8B | 128K (512K extensible) | Apache 2.0 | Misma familia, mayor tamaño (embedding 4096, 40 capas) |
| IBM Granite-4.2-30B | 30B | 128K (512K extensible) | Apache 2.0 | Misma familia, 64 capas, embedding 4096 |

La comparativa se limita a la propia familia Granite porque la información proporcionada no incluye datos de rendimiento frente a modelos de otros fabricantes. No se dispone de benchmarks de capacidades que permitan comparar con alternativas de terceros.

## Limitaciones y advertencias

- La ablación de rechazos elimina las capas de seguridad del modelo original: puede generar contenido que el modelo base rechazaría, con los riesgos legales, éticos y reputacionales que ello implica en producción.
- La divergencia KL de 13,1087 respecto al modelo original indica una alteración sustancial del comportamiento; es esperable degradación en tareas para las que el modelo base estaba alineado y posibles efectos colaterales no medidos en razonamiento o tool calling.
- Riesgo de alucinación inherente a los modelos de 3B, especialmente en tareas de conocimiento factual y en contextos muy largos.
- Los benchmarks publicados solo cubren el comportamiento de rechazo; no hay evidencia publicada sobre MMLU, HumanEval, GSM8K ni otras capacidades, por lo que el rendimiento en tareas concretas debe validarse empíricamente.
- La model card no documenta sesgos conocidos ni la composición del dataset de entrenamiento del modelo base.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el despliegue de una variante sin alineación de seguridad requiere revisión legal y de políticas de contenido propias.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 26 de noviembre de 2026; se trata de una publicación muy reciente y sin validación comunitaria.
- Los idiomas distintos de los 12 probados pueden funcionar, pero no han sido validados según la model card.
- El consumo de memoria de la caché KV para contextos de 128K o 512K puede ser prohibitivo en GPU de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wednesdayse1/granite-4.2-3b-heretic
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Modelo base de la familia: https://huggingface.co/ibm-granite/granite-4.1-3b-base
- Colección Granite 4.2: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog técnico de Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio GitHub: https://github.com/ibm-granite/granite-4.2-language-models
- Heretic: https://heretic-project.org
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Reproducibilidad: directorio `reproduce` del repositorio del modelo (README incluido en el repo)
