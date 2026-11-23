# wilkertyl/hyperdime-qwen3-selectors

## Resumen

HyperDIME-Qwen es una colección de checkpoints de investigación que implementan selectores de dimensiones guiados por consulta (query-aware dimension selection) sobre los embeddings congelados de Qwen/Qwen3-Embedding-0.6B. El modelo base produce embeddings densos de 1024 dimensiones; los selectores aquí publicados aprenden a puntuar cada una de esas 1024 dimensiones a partir del embedding de la consulta y a conservar únicamente las top-k, enmascarando el resto. El documento original nunca se modifica: el ahorro computacional se produce en la fase de puntuación, no en el almacenamiento del índice.

El desarrollo corre a cargo del usuario wilkertyl y se enmarca en un estudio denominado HyperDIME-Qwen, cuyos artefactos auxiliares (benchmarks, informes y registros de decisiones) se publican en el dataset wilkertyl/hyperdime-qwen3-benchmarks. Los selectores se entrenan y evalúan sobre tres entornos de recuperación: BEIR SciFact, BEIR NFCorpus y MS MARCO passage, con presupuestos de dimensiones k = 102, 204, …, 921 (del 10 % al 90 % de D = 1024).

La relevancia actual del proyecto es metodológica: explora si la selección de dimensiones dependiente de la consulta puede reducir el coste de scoring en recuperación densa sin reentrenar el codificador ni alterar el índice de documentos. El autor advierte explícitamente que se trata de artefactos de investigación, no de un producto, y que varias decisiones siguen marcadas como propuestas y la comparación held-out P3-bench aún estaba en ejecución en el momento de la subida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapa lineal 1024x1024 + log-softmax sobre dimensiones (selectores); modelo base Qwen3-Embedding-0.6B |
| Parametros totales | No disponible (los selectores añaden una proyección 1024x1024; el encoder base tiene 0.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del encoder base Qwen3-Embedding-0.6B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (selector.safetensors); también .pt en f0-spike |
| Dimension de embedding | 1024 (D) |
| Presupuestos de dimension | k = 102, 204, ..., 921 (10%-90% de D) |
| Modelo base | Qwen/Qwen3-Embedding-0.6B (revision 97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3) |
| Libreria | pytorch |
| Tamano del repo | 1.6 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

Todos los selectores comparten una misma forma: un mapa lineal de 1024x1024 seguido de un log-softmax sobre las dimensiones. Algunas variantes añaden un prior geométrico fijo de la forma log(q_d² · Var(x_d) + ε), donde Var es la varianza por dimensión de los embeddings de documentos del entorno. El selector lee el embedding de consulta q, puntúa las 1024 dimensiones y conserva las top-k; la puntuación de documentos se realiza con la consulta enmascarada contra los embeddings completos de 1024 dimensiones, de modo que el índice documental permanece intacto.

El entrenamiento sigue la receta Learning-to-Select (L2S) descrita en el ADR-0002 del repositorio de datos, con negativos duros. Se distinguen varias familias: E0 (L2S por entorno, global y candidatos regularizados), E1 (selectores con 3 semillas por 3 entornos para la matriz de transferencia), S1 (selector lineal entrenado directamente sobre recuperación enmascarada), S2 (S1 inicializado desde el prior geométrico), S3 (un peso aprendido sobre el prior), S4 (un peso de prior por presupuesto) y la familia P3 (reentrenamiento sobre el split disjunto por consulta p3-query-split-v1, con brazos destilados de profesores de máscara positivos, contrastivos y guiados por ranking). Los entornos son BEIR SciFact, BEIR NFCorpus y MS MARCO passage; los selectores se eligen solo sobre consultas de validación y los juicios de test se leen únicamente en evaluación.

## Capacidades

- Selección de dimensiones dependiente de la consulta sobre embeddings de Qwen3-Embedding-0.6B.
- Puntuación de recuperación densa con consulta enmascarada a presupuestos variables (k de 102 a 921).
- Prior geométrico opcional basado en la varianza por dimensión de los documentos del entorno.
- Pesos de prior aprendidos, globales (S3) o por presupuesto (S4).
- Transferencia entre entornos evaluada mediante matriz de semillas (E1, gate G2).
- Destilación desde profesores de máscara (positivos, contrastivos, guiados por ranking) en la familia P3.
- No incluye generación de texto, tool calling, agentes ni capacidades multimodales: es exclusivamente un componente de recuperación.

## Casos de uso

- Recuperación densa con presupuesto de cómputo reducido: enmascarar la consulta a k dimensiones antes del producto escalar contra el índice de 1024 dimensiones reduce el coste de scoring por consulta sin reindexar, útil en sistemas con latencia ajustada.
- Búsqueda sobre corpus científicos (SciFact): emplear el selector entrenado en SciFact para consultas de verificación de afirmaciones, donde el vocabulario técnico hace que ciertas dimensiones aporten más señal.
- Recuperación biomédica (NFCorpus): usar el selector de NFCorpus como baseline en pipelines de búsqueda de literatura, comparando nDCG@10 frente al uso de las 1024 dimensiones completas.
- Búsqueda web a gran escala (MS MARCO passage): aplicar el selector de MS MARCO para reducir el coste de scoring en pasajes, verificando primero el cumplimiento de los términos de los juicios de MS MARCO.
- Investigación en compresión de embeddings: reutilizar los checkpoints como línea base reproducible para estudiar selección de dimensiones, con manifiestos que registran commit, hashes de dataset y modelo, semilla y versiones de librería.
- Estudio de transferencia entre dominios: emplear la matriz de semillas (E1, gate G2) para medir la degradación de un selector entrenado en un entorno al aplicarse a otro, informando decisiones de despliegue multi-corpus.
- Evaluación de destilación de máscaras: comparar los brazos P3 destilados de profesores positivos, contrastivos y guiados por ranking frente a los selectores L2S originales sobre el split disjunto por consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados, informes y registros de decisiones están en el dataset wilkertyl/hyperdime-qwen3-benchmarks, que la mayoría de resultados son exploratorios y que la comparación held-out P3-bench seguía en ejecución al subir los ficheros.

## Requisitos de hardware

- VRAM estimada: no disponible. Los selectores son proyecciones de 1024x1024 (aproximadamente 4 MB en fp32 por selector), pero requieren cargar el encoder base Qwen3-Embedding-0.6B para generar los embeddings de consulta y documento.
- GPU recomendadas: no disponible en la información proporcionada.
- Encaje en GPU de consumo: no disponible; depende del encoder base, no de los selectores.
- Opciones de despliegue: la model card solo muestra uso directo con PyTorch y safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperDIME-Qwen (estos selectores) | Proyeccion 1024x1024 sobre encoder de 0.6B | No disponible | 1024 (masked top-k) | No disponible | Hugging Face (wilkertyl) |
| Qwen/Qwen3-Embedding-0.6B | 0.6B | No disponible | 1024 | No disponible en la informacion | Hugging Face (Qwen) |
| Alternativas de seleccion de dimensiones | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos selectores y otras técnicas de compresión de embeddings en la información proporcionada.

## Limitaciones y advertencias

- Son checkpoints de investigación para un único encoder; no están ajustados para despliegue en producción.
- El enmascaramiento solo afecta a la consulta: se mantiene el índice documental completo de 1024 dimensiones, por lo que no se ahorra almacenamiento.
- Los selectores entrenados en un entorno se degradan en otros (gate G2); debe usarse el selector correspondiente al corpus o tratarse como baseline.
- Los selectores de MS MARCO están entrenados sobre juicios de MS MARCO; deben verificarse los términos de uso de dichos datos.
- Varias decisiones del estudio siguen marcadas como propuestas y la comparación held-out P3-bench no había concluido en el momento de la subida; los números deben leerse en los informes enlazados antes de reutilizarse.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial.
- No se documentan sesgos, riesgos de alucinación ni cobertura idiomática; al ser un componente de recuperación, los sesgos heredados provienen del encoder base y de los datasets de entrenamiento (SciFact, NFCorpus, MS MARCO).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wilkertyl/hyperdime-qwen3-selectors
- Dataset de benchmarks e informes: https://huggingface.co/datasets/wilkertyl/hyperdime-qwen3-benchmarks
- Modelo base Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Dataset BEIR SciFact: https://huggingface.co/datasets/BeIR/scifact
- Dataset BEIR NFCorpus: https://huggingface.co/datasets/BeIR/nfcorpus
- Dataset MS MARCO: https://huggingface.co/datasets/microsoft/ms_marco
