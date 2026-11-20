# thalovant/thalovant-m2v-intents

## Resumen

Thalovant-m2v-intents es un clasificador estático de intenciones desarrollado por el usuario thalovant para el ecosistema Thalovant, un hub de habilidades (skills) construido sobre OVOS (Open Voice OS). El modelo recibe una frase de usuario y la asigna a una de las 359 etiquetas con formato `<skill_id>:<intent>`, tal y como las registra el pipeline `ovos-m2v-pipeline`. No es un modelo generativo: es un cabezal de clasificación sobre embeddings estáticos, pensado para enrutar peticiones de voz o texto hacia la habilidad correcta dentro de una flota de asistentes.

Técnicamente se apoya en Model2Vec, una técnica que destila un transformer de frases en una tabla de embeddings estáticos y sustituye la inferencia neuronal por una búsqueda de similitud. El modelo base es `Jarbas/m2v-256-distiluse-base-multilingual-cased-v2`, un modelo2vec de 256 dimensiones derivado de `distiluse-base-multilingual-cased-v2`, y se ha afinado con el entrenador de clasificadores de Model2Vec. El resultado son 30.577.920 parámetros reales en safetensors, un repositorio de 14,6 GB (que incluye corpus e índices auxiliares) y una licencia Apache 2.0.

Su relevancia actual radica en la eficiencia: al no requerir forward pass de transformer en tiempo de inferencia, permite clasificar intenciones en CPU con latencias muy bajas y sin GPU, algo crítico en asistentes domésticos desplegados en hardware modesto. Además, el modelo viene acompañado de un corpus de 506.823 filas de entrenamiento y 551.736 entradas indexadas, con métricas desglosadas por 68 variantes lingüísticas, lo que lo convierte en una pieza poco habitual por su trazabilidad de evaluación multilingüe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Model2Vec (embeddings estáticos destilados de un transformer) con cabezal de clasificación |
| Parámetros totales | 30.577.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clasificador de frase; sin ventana generativa declarada) |
| Tipos de cuantización | no disponible (pesos estáticos; el formato base ya es de baja huella) |
| Idiomas soportados | 68 variantes lingüísticas evaluadas (en, es, de, fr, pt, it, ca, gl, eu, ar, ja, ko, hi, ru, pl, tr, etc.); lista completa en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `model2vec`) |
| Pipeline | text-classification |
| Etiquetas | 359 (`<skill_id>:<intent>`) |
| Modelo base | Jarbas/m2v-256-distiluse-base-multilingual-cased-v2 |
| Dimensión de embedding | 256 |
| Descargas | 1720 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Model2Vec: en lugar de ejecutar un transformer en inferencia, utiliza una matriz de embeddings de tokens estáticos de 256 dimensiones obtenida por destilación del modelo `distiluse-base-multilingual-cased-v2`. La representación de una frase se calcula agregando los embeddings de sus tokens y el clasificador opera sobre ese vector. Esto elimina el coste de atención y permite inferencia en CPU con un coste computacional prácticamente lineal en el número de tokens.

El entrenamiento se realizó con el entrenador de clasificadores de Model2Vec sobre un corpus propio de la flota Thalovant. El conjunto completo contiene 506.823 filas, con un máximo de 512 frases por etiqueta e idioma; el índice `index.json` conserva las 551.736 entradas totales. La evaluación se hizo sobre 97.077 filas retenidas, garantizando que ni el texto ni la línea de intención aparecían en las 409.746 filas usadas para entrenar un modelo de evaluación. Los pesos publicados se reentrenaron con la misma receta sobre todas las filas. No se documenta uso de RLHF ni DPO; se trata de aprendizaje supervisado de clasificación. Un detalle técnico destacable es la incorporación de umbrales por idioma en `training.json` para mantener la tasa de falsos avisos por debajo del 1 % en lenguas como estonio (0,97), euskera (0,94), húngaro (0,94), japonés (0,97), polaco (0,92), esloveno (0,94) y turco (0,94).

## Capacidades

- Clasificación de intenciones en una de 359 etiquetas con formato `<skill_id>:<intent>`, alineadas con el registro de `ovos-m2v-pipeline`.
- Enrutamiento de frases de usuario hacia habilidades de la flota Thalovant (skills, pipelines de persona y lectura, wikihow).
- Clasificación multilingüe en 68 variantes lingüísticas, con precisión de intención del 91,7 % global y de skill del 96,4 %.
- Inferencia sobre embeddings estáticos, sin forward pass de transformer, apta para CPU.
- Integración con `thalovant-skillkit check` para detectar colisiones de frases entre skills mediante el índice `index.json`.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de visión o audio.
- No dispone de etiqueta de rechazo ("none of these"): toda frase se asigna a la skill más cercana, a menudo con alta confianza.

## Casos de uso

- Enrutamiento de intenciones en asistentes de voz domésticos: el modelo clasifica la transcripción del usuario y la dirige a la skill adecuada; al ser estático, funciona en Raspberry Pi o mini-PC sin GPU, con latencia mínima.
- Detección de colisiones entre habilidades en un hub OVOS: `thalovant-skillkit check` usa `index.json` y el clasificador para fallar una skill que publica una frase ya reclamada por otra, sin sacar las frases de sus repositorios privados.
- Clasificación multilingüe en producción: con precisión superior al 90 % en es-ES (97,0 % intención, 98,0 % skill), fr-FR (94,0 % / 97,7 %) y de-DE (93,6 % / 97,3 %), sirve para asistentes con base de usuarios europea.
- Prefiltrado barato en pipelines híbridos: usar el clasificador estático como primera etapa y reservar un LLM generativo para los casos con confianza baja o umbral superado.
- Etiquetado y auditoría de corpus de intenciones: el índice de 551.736 frases con digest de idioma y texto permite auditar qué skill posee cada frase y detectar duplicados.
- Despliegue en entornos con restricciones de privacidad: la inferencia es local y determinista, sin llamadas a API externas, adecuada para datos de voz domésticos.
- Clasificación de intenciones en idiomas minoritarios: cubre catalán (94,9 % / 97,5 %), gallego (96,7 % / 97,8 %), aragonés (95,0 % / 97,2 %) y asturiano (94,1 % / 96,2 %), con rendimiento inferior en estonio (75,0 % / 84,8 %) y japonés (69,8 % / 89,3 %).

## Benchmarks y rendimiento

Evaluación sobre 97.077 filas retenidas, con 68 variantes lingüísticas. Precisión global: 91,7 % de intención y 96,4 % de skill. Mediana por idioma: 90,5 % de intención; 8 idiomas por debajo del 80 %.

| Idioma | Filas | Intención | Skill | Falsos avisos | Umbral |
|---|---:|---:|---:|---:|---:|
| `es-ES` | 2300 | 97,0 % | 98,0 % | 0,4 % | 0,9 |
| `es-AR` | 1777 | 97,3 % | 98,1 % | 0,3 % | 0,9 |
| `es-MX` | 1873 | 97,3 % | 98,2 % | 0,3 % | 0,9 |
| `ca-ES` | 3390 | 94,9 % | 97,5 % | 0,3 % | 0,9 |
| `gl-ES` | 2763 | 96,7 % | 97,8 % | 0,2 % | 0,9 |
| `en-US` | 3648 | 95,3 % | 98,7 % | 0,1 % | 0,9 |
| `en-GB` | 2875 | 95,5 % | 98,9 % | 0,2 % | 0,9 |
| `fr-FR` | 3173 | 94,0 % | 97,7 % | 0,3 % | 0,9 |
| `de-DE` | 2775 | 93,6 % | 97,3 % | 0,4 % | 0,9 |
| `it-IT` | 2327 | 94,2 % | 97,9 % | 0,4 % | 0,9 |
| `pt-PT` | 3210 | 94,7 % | 97,1 % | 0,6 % | 0,9 |
| `nl-NL` | 2185 | 93,9 % | 96,8 % | 0,4 % | 0,9 |
| `ru-RU` | 939 | 82,8 % | 97,2 % | 0,4 % | 0,9 |
| `ar-SA` | 677 | 81,4 % | 92,9 % | 0,9 % | 0,9 |
| `hi-IN` | 1974 | 82,9 % | 90,5 % | 0,6 % | 0,9 |
| `ja-JP` | 676 | 69,8 % | 89,3 % | 2,4 % | 0,97 |
| `ko-KR` | 831 | 78,0 % | 95,0 % | 0,2 % | 0,9 |
| `et-EE` | 507 | 75,0 % | 84,8 % | 2,4 % | 0,97 |
| `eu-ES` | 1216 | 84,5 % | 91,5 % | 1,1 % | 0,94 |
| `pl-PL` | 1164 | 80,1 % | 88,3 % | 1,0 % | 0,92 |

No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks generativos, por no ser aplicables a un clasificador de intenciones.

## Requisitos de hardware

- VRAM: no requiere GPU. Con 30,5 M de parámetros en embeddings estáticos de 256 dimensiones, el modelo ocupa del orden de decenas de MB en memoria en FP32 y menos en cuantizaciones de 8 o 16 bits.
- GPU recomendadas: ninguna necesaria. Funciona en CPU (x86 o ARM) y en GPUs consumer (RTX 4090, RTX 3060, etc.) sin aprovechamiento relevante, ya que no hay cómputo de atención.
- Cabe en cualquier GPU consumer y en dispositivos de borde (Raspberry Pi, mini-PC, NAS) siempre que haya memoria suficiente para el proceso Python.
- Despliegue: librería `model2vec` con `StaticModelPipeline.from_pretrained(...)`; integración con `ovos-m2v-pipeline` configurando `"mode": "classifier"`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza estática del modelo, se espera un coste de inferencia muy bajo en CPU, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| thalovant/thalovant-m2v-intents | Model2Vec clasificador | 30,6 M | no disponible | 68 variantes | Apache 2.0 | Intenciones OVOS, 359 etiquetas |
| Jarbas/m2v-256-distiluse-base-multilingual-cased-v2 | Model2Vec embeddings | no disponible | no disponible | multilingüe | no disponible | Embeddings de frase, sin cabezal de clasificación |
| distiluse-base-multilingual-cased-v2 | Transformer (Sentence-BERT) | no disponible | 128 tokens (típico) | multilingüe | no disponible | Embeddings de frase, requiere forward pass |

La comparativa con clasificadores de intenciones transformer (p. ej. variantes de BERT multilingüe afinadas para intent classification) no está disponible en la información proporcionada. La diferencia clave frente al modelo base es la adición del cabezal de clasificación y el corpus específico de la flota Thalovant; frente a un transformer de frases, la ventaja es la inferencia sin atención.

## Limitaciones y advertencias

- No existe etiqueta de rechazo: una frase sobre algo que ninguna skill hace se asigna a la skill más cercana, a menudo con confianza alta. En producción es necesario aplicar umbrales por idioma para limitar falsos avisos.
- Rendimiento desigual por idioma: 8 idiomas por debajo del 80 % de precisión de intención, con casos críticos como japonés (69,8 %) y estonio (75,0 %). Los umbrales recomendados suben a 0,97 en ja-JP y et-EE.
- Riesgo de colisión entre skills: el 0,5 % de las frases retenidas se asignan a otra skill con confianza ≥ 0,9; el autor recomienda `thalovant-skillkit check` para detectarlo.
- Sesgo de dominio: el corpus proviene exclusivamente de la flota Thalovant; fuera de ese vocabulario y de esas skills, la clasificación pierde validez.
- El repositorio ocupa 14,6 GB por incluir corpus e índices auxiliares; el modelo en sí es pequeño, pero la descarga completa es pesada.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta garantías sobre el corpus ni sobre los datos de entrenamiento subyacentes.
- No apto para generación, razonamiento, código, matemáticas, visión ni audio; usarlo fuera de la clasificación de intenciones dará resultados sin sentido.
- La fecha de creación del repositorio (2026-09-08) y la de actualización (2026-11-18) deben contrastarse con el estado real del proyecto antes de fijar una versión en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thalovant/thalovant-m2v-intents
- Modelo base: https://huggingface.co/Jarbas/m2v-256-distiluse-base-multilingual-cased-v2
- Model2Vec (librería y paper): https://github.com/MinishLab/model2vec
- OVOS (Open Voice OS): https://github.com/OpenVoiceOS
- OVOS m2v pipeline: https://github.com/OpenVoiceOS/ovos-m2v-pipeline
- Sentence-Transformers distiluse-base-multilingual-cased-v2: https://huggingface.co/sentence-transformers/distiluse-base-multilingual-cased-v2
