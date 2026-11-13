# TendieLabs/Diogenes-9B-v1

## Resumen

Diogenes-9B-v1 es un ajuste fino supervisado (SFT) del modelo Qwen3.5-9B desarrollado por TendieLabs como experimento de investigación sobre transferencia de comportamiento. El objetivo declarado no es mejorar capacidades generales, sino modificar la orientación de las respuestas en temas políticos: el modelo busca respuestas más directas y una menor adopción acrítica del relato oficial del Estado chino sobre su propia conducta. Está inspirado en Arete-27B de Nous Research, pero no es una reproducción de este.

El checkpoint publicado es un merge BF16 autónomo (no un adaptador), con la torre de visión original congelada y la cabeza MTP (multi-token prediction) nativa de una capa preservada. El entrenamiento se realizó con un LoRA de rango 16 solo sobre módulos de proyección de lenguaje, con 5.535 ejemplos y un holdout reservado de 291. El modelo tiene 9.409.813.744 parámetros totales, un repositorio de 19,3 GB y está etiquetado únicamente para inglés.

Es relevante ahora porque documenta de forma inusualmente transparente el coste de un ajuste de comportamiento: mejora métricas de cobertura de hechos y reduce respuestas alineadas con el encuadre estatal en una evaluación de 803 preguntas, pero provoca una regresión medible en generación de código (HumanEval cae de 93,75% a 78,12% en modo sin razonamiento). Es un caso de estudio sobre cómo un SFT pequeño y dirigido puede degradar capacidades específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de Qwen3.5-9B (arquitectura compuesta completa, con torre de visión y cabeza MTP de una capa) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

Datos adicionales del proceso de ajuste: LoRA de rango 16 sobre 200 módulos de proyección de lenguaje, 40.108.032 parámetros entrenados, 5.535 ejemplos de entrenamiento y 291 de holdout.

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B post-entrenado, conservando su arquitectura compuesta completa: torre de visión original congelada (sin validación amplia de visión) y cabeza MTP nativa de una capa, con los 15 tensores `mtp.*` preservados. El ajuste es SFT solo de texto mediante un LoRA de rango 16 aplicado exclusivamente a módulos de proyección de lenguaje (200 módulos, 40,1 M de parámetros entrenados), posteriormente fusionado en un checkpoint BF16 autónomo.

Los datos provienen de un subconjunto filtrado de `NousResearch/arete-data-pairs`. No se documenta el número de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO; el pipeline descrito es SFT supervisado. El autor indica explícitamente que es un experimento independiente y no una publicación oficial de Qwen ni de Nous Research, y que la ficha corresponde a v1, no al posterior experimento v2.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento con modo thinking activable y desactivable (heredado de Qwen3.5-9B).
- Matemáticas: GSM8K con 93,75% de acierto en modo sin thinking (64 preguntas) y 76,56% con thinking.
- Seguimiento de instrucciones: IFEval estricto 84,38% sin thinking y 43,75% con thinking (64 prompts).
- Generación de código: HumanEval 93,75% sin thinking y 100% con thinking en el modelo base; el ajuste degrada estas cifras.
- Visión: torre de imagen conservada y congelada, con pipeline `image-text-to-text`, pero sin validación amplia de capacidades visuales según el autor.
- Cabeza MTP nativa preservada (predicción multi-token), potencialmente útil para decodificación especulativa, aunque no se documentan ganancias de latencia.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.
- Multilingüe: limitado a inglés según la model card.

## Casos de uso

- Investigación sobre transferencia de comportamiento: usar el modelo como caso controlado para medir cómo un SFT de 5.535 ejemplos y 40 M de parámetros entrenados altera la orientación de las respuestas y qué capacidades degrada, comparando contra Qwen3.5-9B sin ajustar.
- Evaluación de sesgo y encuadre político: emplear el conjunto de 803 preguntas con rúbrica de hechos requeridos y de encuadre estatal para auditar modelos base frente a variantes ajustadas, replicando la metodología publicada en `benchmark-results.json`.
- Análisis de robustez ante refusal: el ajuste reduce los rechazos de 40/803 a 1/803, lo que permite estudiar el equilibrio entre responder y rechazar en sistemas de moderación.
- Estudio de regresión de capacidades: el modelo sirve para analizar por qué un ajuste centrado en un dominio degrada HumanEval (de 30/32 a 25/32 sin thinking) mientras mantiene GSM8K, útil para diseñar estrategias de mitigación de olvido catastrófico.
- Prototipado de asistentes conversacionales en inglés con modo thinking: desplegar el checkpoint BF16 en transformers para experimentar con respuestas directas, asumiendo que el modo thinking es sensible al presupuesto de tokens (48 y 54 respuestas finales vacías en base y adaptador respectivamente sobre 160 registros).
- Base para experimentos de decodificación especulativa: la cabeza MTP preservada permite probar variantes de predicción multi-token sobre un modelo de 9,4 B en BF16.

## Benchmarks y rendimiento

Evaluación política completa de 803 preguntas (adaptador v1 sin fusionar frente a Qwen3.5-9B sin tocar):

| Metrica | Qwen3.5-9B | Diogenes v1 |
|---|---:|---:|
| Cobertura media de hechos requeridos (0-5, mayor mejor) | 2,6115 | 3,3151 |
| Respuestas con hallazgos de encuadre estatal chino (menor mejor) | 292/803 (36,36%) | 29/803 (3,61%) |
| Rechazos | 40/803 | 1/803 |
| Respuestas que alcanzan el límite de 1.024 tokens | 3/803 | 18/803 |

Mejora media pareada de 0,7036 puntos, con intervalo bootstrap del 95% de 0,5567 a 0,8543; 246 preguntas mejoran, 99 empeoran y 458 quedan iguales.

Comprobaciones de capacidad ampliadas (64 GSM8K, 64 IFEval, 32 HumanEval; 320 registros por modelo):

| Modo | Metrica | Qwen3.5-9B | Diogenes v1 |
|---|---|---:|---:|
| Sin thinking | GSM8K correcto | 60/64 (93,75%) | 60/64 (93,75%) |
| Sin thinking | IFEval estricto | 54/64 (84,38%) | 51/64 (79,69%) |
| Sin thinking | IFEval laxo | 56/64 (87,50%) | 55/64 (85,94%) |
| Sin thinking | HumanEval superado | 30/32 (93,75%) | 25/32 (78,12%) |
| Thinking | GSM8K correcto | 49/64 (76,56%) | 47/64 (73,44%) |
| Thinking | IFEval estricto | 28/64 (43,75%) | 28/64 (43,75%) |
| Thinking | IFEval laxo | 28/64 (43,75%) | 28/64 (43,75%) |
| Thinking | HumanEval superado | 32/32 (100%) | 30/32 (93,75%) |

Advertencias del autor: son subconjuntos acotados con prompts de chat adaptados, no reproducciones oficiales de leaderboards; los dos modos comparten los mismos 32 problemas de HumanEval y no deben contarse como 64 preguntas independientes. No se han publicado resultados de MMLU ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 19 GB solo para pesos (9,41 B de parámetros), más overhead de activaciones y caché KV; se recomienda 24 GB o más para contexto moderado.
- Cuantización: no se documentan tipos de cuantización ni conversiones GGUF oficiales en la información disponible; el repo contiene únicamente safetensors BF16.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con margen ajustado; en GPUs de 16 GB requeriría cuantización, no publicada por el autor.
- Despliegue: transformers (librería declarada); compatible con endpoints según los tags. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diogenes-9B-v1 | 9,41 B | no disponible | SFT de comportamiento sobre Qwen3.5-9B | no disponible | Hugging Face (TendieLabs) |
| Qwen3.5-9B | 9 B (aprox.) | no disponible | Modelo base post-entrenado | no disponible | Hugging Face (Qwen) |
| Arete-27B (Nous Research) | 27 B (aprox.) | no disponible | Inspiración del experimento | no disponible | no disponible en la información |

La comparación directa con Qwen3.5-9B es la más informativa: misma base, mismos benchmarks publicados, con mejora en cobertura de hechos políticos y regresión en HumanEval sin thinking. No se dispone de datos comparativos con otros modelos de 9 B en la información proporcionada.

## Limitaciones y advertencias

- Regresión en código: HumanEval sin thinking cae de 30/32 a 25/32; cinco respuestas adicionales fallan las pruebas canónicas pese a producir respuesta final, y dos respuestas con thinking agotan el presupuesto sin respuesta final.
- Sensibilidad al presupuesto en modo thinking: 48 respuestas finales vacías en el base y 54 en el adaptador sobre 160 registros; los resultados no demuestran que el thinking sea peor, pero sí que es frágil con límites de tokens.
- Aumento de respuestas truncadas: 18/803 alcanzan el límite de 1.024 tokens frente a 3/803 en el base.
- El propio autor advierte que una mayor cobertura de hechos no verifica cada afirmación adicional y que menos hallazgos de encuadre no certifican neutralidad ni fiabilidad factual.
- El alcance del sesgo evaluado se limita al encuadre del Estado chino bajo la rúbrica empleada, no a sesgo político general de todos los países.
- Idioma: solo inglés; no se documenta soporte multilingüe.
- Visión: torre conservada pero sin validación amplia, por lo que su comportamiento visual no está caracterizado.
- Licencia no disponible: no se puede confirmar el uso comercial; al derivar de Qwen3.5-9B, habría que verificar la licencia del modelo base.
- Sin datos de contexto máximo, cuantizaciones ni soporte de tool calling; no apto para pipelines agénticos sin validación previa.
- Proyecto de investigación con 0 descargas y 0 likes en el momento de la consulta; sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TendieLabs/Diogenes-9B-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Resultados de benchmarks (referenciado en la model card): `benchmark-results.json` dentro del repositorio del modelo
- Repositorio de Nous Research (referencia, sin URL concreta en la información): no disponible
- Paper o blog técnico: no disponible
- Demo: no disponible
