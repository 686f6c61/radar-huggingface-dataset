# utsavz/gemma3_4b_iterative_complementary_wsp_round2

## Resumen

`gemma3_4b_iterative_complementary_wsp_round2` es un artefacto de investigación derivado de `google/gemma-3-4b-it`, editado por el usuario `utsavz` mediante una técnica de edición de pesos en espacio de pesos (Weight-Space Programming, WSP) sin gradientes ni fine-tuning. El objetivo declarado es mejorar la seguridad multimodal del modelo base, reduciendo la conformidad ante peticiones dañinas sin degradar en exceso la utilidad en peticiones benignas. Se trata de la segunda ronda de una iteración de ediciones complementarias aplicadas sobre el modelo resultante de la primera ronda.

El modelo conserva la arquitectura y el tamaño del Gemma 3 4B instruct original: 4.300.079.472 parámetros en BF16, pesos en formato safetensors y un repositorio de 8,6 GB. No se ha reentrenado ningún componente; únicamente se han modificado tres tensores (31.904.866 elementos distintos respecto al base, 5.167.961 respecto a la ronda 1), incluyendo una edición condicional de rango 1 sobre la proyección de salida de la atención (`o_proj`) de la capa 13.

Su relevancia es metodológica: demuestra que es posible alterar de forma medible el comportamiento de rechazo de un modelo multimodal mediante ediciones cerradas de pesos, sin coste de entrenamiento. Los resultados publicados por el autor son de una única ejecución y con métricas proxy automáticas (juicio de rechazo por palabras clave y expresiones regulares), por lo que deben interpretarse como indicio y no como validación robusta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), edición de pesos sin reentrenamiento |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en BF16) |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it` (revisión `093f9f388b31de276ce2de164bdc2081324b9767`, BF16), un transformer multimodal de 4.300 millones de parámetros. No hay entrenamiento ni ajuste con gradientes: la modificación se realiza mediante Weight-Space Programming, una familia de técnicas de edición cerrada en el espacio de pesos que introduce cambios dirigidos y de bajo rango sobre tensores concretos.

La receta consta de dos rondas de Complementary WSP. La ronda 1 se corresponde con el artefacto `utsavz/gemma3_4b_complementary_wsp_round1`. La ronda 2 se aplica sobre el modelo de la ronda 1 congelado y añade una edición condicional de rango 1 sobre `o_proj` de la atención de la capa 13. Según la model card, la combinación complementaria de la ronda 2 fue rechazada por la validación interna del autor, por lo que se empleó la mejor edición individual. La ronda 2 cumplió el criterio de mejora predeclarado sobre la validación interna de desarrollo. En total difieren 31.904.866 elementos del modelo base (3 tensores) y 5.167.961 elementos respecto a la ronda 1. No se especifican datos de entrenamiento, número de tokens ni uso de RLHF/DPO, porque no hay entrenamiento implicado.

## Capacidades

- Generación de texto y razonamiento heredados de Gemma 3 4B instruct.
- Procesamiento multimodal de imagen y texto, al conservar la arquitectura del modelo base.
- Comportamiento de rechazo reforzado ante peticiones dañinas, incluyendo entradas multimodales, según la evaluación del autor sobre VLGuard.
- Conversación multi-turno instructiva (heredada del base `-it`).
- Soporte de tool calling y function calling: no confirmado en la información proporcionada; depende del modelo base y no se documenta en esta ficha.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para esta edición.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en alineación sin gradientes: usar el modelo como caso de estudio para reproducir y auditar ediciones de pesos orientadas a seguridad, comparando el comportamiento frente al base con el mismo prompt set.
- Evaluación de robustez de salvaguardas multimodales: desplegar el modelo en un banco de pruebas con entradas de imagen y texto para medir tasas de rechazo y de sobre-rechazo con clasificadores independientes.
- Filtrado previo en pipelines de moderación: integrar el modelo como capa de detección de contenido dañino en un sistema mayor, aprovechando su tasa de conformidad dañina reportada del 3,8 % en VLGuard como referencia inicial (sujeta a validación propia).
- Comparación de técnicas de edición: emplear este artefacto junto a la ronda 1 y al base para aislar el efecto marginal de la edición de rango 1 en la capa 13 sobre el comportamiento de rechazo.
- Docencia y divulgación: ilustrar en cursos o artículos cómo se modifican pesos de forma cerrada y cómo se evalúan los efectos con métricas proxy.
- Prototipado de asistentes con requisitos de seguridad: servir de base para experimentos internos donde se priorice el rechazo conservador, aceptando un cierto incremento de sobre-rechazo en consultas benignas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test de VLGuard (1.558 registros, decodificación greedy, 512 tokens nuevos, juicio de rechazo mediante proxy de palabras clave y expresiones regulares, aproximado):

| Modelo | Conformidad dañina | Sobre-rechazo benigno | Salidas rotas o en bucle |
|---|---|---|---|
| Gemma 3 4B original | 698/1000 (69,8 %) | 0/558 (0,0 %) | 1/1558 (0,1 %) |
| Este modelo | 38/1000 (3,8 %) | 39/558 (7,0 %) | 0/1558 (0,0 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos anteriores proceden de una única ejecución y de métricas proxy automáticas, no de evaluación humana.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 8,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda disponer de 12-16 GB para inferencia cómoda a contexto moderado.
- Cuantización: no se documentan versiones GGUF ni cuantizadas en el repositorio; sería necesario generarlas a partir de los safetensors BF16.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 en configuraciones de una sola GPU.
- GPU de consumo: cabe en tarjetas con 16 GB o más en BF16 con contexto limitado; en GPUs de 8-12 GB requeriría cuantización, no publicada.
- Opciones de despliegue: `transformers` con `Gemma3ForConditionalGeneration` y `AutoProcessor` (ejemplo oficial de la model card); vLLM, TGI, llama.cpp u Ollama no están confirmados para este artefacto concreto, aunque podrían funcionar al compartir arquitectura con el base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 4.300 M | no disponible | Edición WSP de seguridad sobre Gemma 3 4B | gemma | Hugging Face, 0 descargas |
| `utsavz/gemma3_4b_complementary_wsp_round1` | 4.300 M (heredados) | no disponible | Primera ronda de Complementary WSP | gemma | Hugging Face |
| `google/gemma-3-4b-it` | 4.300 M | no disponible en esta ficha | Modelo instructivo multimodal original | gemma | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: una sola ejecución, sin validación humana ni réplicas independientes.
- Las métricas de rechazo se basan en un proxy de palabras clave y expresiones regulares; pueden sobreestimar o subestimar el comportamiento real.
- El sobre-rechazo benigno sube del 0,0 % al 7,0 % en VLGuard, lo que implica degradación de utilidad en consultas legítimas.
- Sesgos conocidos: no documentados específicamente para esta edición; se heredan los del modelo base Gemma 3 4B.
- Riesgo de alucinación: no evaluado en la información proporcionada; se mantiene el del modelo base.
- Idiomas y longitud de contexto: no documentados en esta ficha; dependen del modelo base.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, con obligaciones y restricciones específicas que deben revisarse antes de cualquier despliegue en producción.
- No se han publicado versiones cuantizadas ni artefactos de despliegue optimizados; el repositorio contiene únicamente pesos safetensors en BF16.
- El modelo no ha pasado por un proceso de red-teaming independiente; no debe usarse como única salvaguarda en sistemas expuestos a usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/utsavz/gemma3_4b_iterative_complementary_wsp_round2
- Ronda 1 (referenciada en la model card): https://huggingface.co/utsavz/gemma3_4b_complementary_wsp_round1
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Dataset VLGuard (referenciado en la evaluación): no disponible en la información proporcionada
