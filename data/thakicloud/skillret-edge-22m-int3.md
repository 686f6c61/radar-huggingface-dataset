# ThakiCloud/SKILLRET-Edge-22M-int3

## Resumen

SKILLRET-Edge-22M-int3 es un bi-encoder de 22,7 millones de parámetros especializado en recuperación de habilidades (skill retrieval) para agentes: dada una petición en lenguaje natural, selecciona la habilidad adecuada dentro de un catálogo. Lo desarrolla ThakiCloud y deriva por destilación de conocimiento de `ThakiCloud/SKILLRET-Embedding-0.6B`, un modelo profesor notablemente mayor (1191,6 MB en disco). Su interés radica en que cabe en una CPU junto al propio agente: el payload empaquetado ocupa 14,176 MB y alcanza un NDCG@10 de 73,82 sobre el split de test público de `ThakiCloud/SKILLRET` (4.392 consultas y 6.006 habilidades).

La arquitectura es un transformer tipo BERT con pooling CLS y embeddings normalizados en L2, con `max_length=256` en evaluación. La variante int3/g16 aplica cuantización asimétrica min/max por grupos de tamaño 16, con escalas y puntos cero almacenados en fp16. El repositorio distribuye dos artefactos: un `model.safetensors` con los valores ya des-cuantizados a fp16, que es el que carga cualquier instalación de `transformers` o `sentence-transformers`, y un `model-int3-g16.bin` con el payload real empaquetado.

Es relevante ahora porque demuestra que un modelo de recuperación de 22M puede retener el 94,1% del rendimiento de su profesor de 0,6B ocupando 3,2 veces menos que la versión fp16 del propio estudiante. La contrapartida es explícita: el modelo no generaliza fuera de su dominio, con 16,90 en NFCorpus y 56,78 en SciFact, muy por debajo de embedders de propósito general de tamaño similar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder tipo BERT (pooling CLS, L2-normalizado) |
| Parámetros totales | 22.713.216 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (`max_length` en evaluación) |
| Tipos de cuantización | int3 con grupos de tamaño 16, asimétrica min/max, escalas y puntos cero en fp16; también disponible fp16 e int4/g16 en la familia |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp16 des-cuantizado) y `model-int3-g16.bin` (payload empaquetado int3/g16) |

## Arquitectura y entrenamiento

El modelo es un bi-encoder BERT de 22,7M de parámetros que codifica consultas y descripciones de habilidades de forma independiente, con pooling sobre el token CLS y normalización L2 de los embeddings. Se entrenó por destilación de conocimiento desde `ThakiCloud/SKILLRET-Embedding-0.6B` (NDCG@10 de 78,48 en el mismo split) con `kd_weight=0.7`, usando InfoNCE multi-positivo sobre 1 a 3 golds por consulta, 12 épocas y schedule coseno. La época se seleccionó sobre un holdout disjunto por habilidad, sin tocar el split de test para la selección.

La cuantización int3/g16 sigue el esquema de bloques tipo GGUF Q4_K/Q8_0: cuantización por grupos de 16 pesos con mínimo y máximo asimétricos y metadatos en fp16. El `quantization.json` del repositorio documenta el layout por tensor para quien quiera implementar un kernel entero. Un detalle técnico importante: el `safetensors` incluido ejecuta aritmética en fp32, por lo que las latencias publicadas no corresponden a velocidades de kernel INT reales; el enrutado de los pesos empaquetados por un kernel INT (llama.cpp, ONNX Runtime) no está medido.

El contrato de prefijo de consulta es parte del entrenamiento: las consultas se codifican sin prefijo de instrucción (`query_prefix.json` lo registra como `resolved: ""`). El autor midió una variación de +8,84 puntos porcentuales en un mismo checkpoint por desajuste entre prefijo de entrenamiento y de evaluación, y señala que ese desajuste produjo un resultado espurio en el que la cuantización parecía superar a fp16.

## Capacidades

- Generación de embeddings de texto para recuperación densa (retrieval) en inglés.
- Selección de habilidades de agente a partir de una petición en lenguaje natural, frente a catálogos de miles de entradas (6.006 habilidades en el split de evaluación).
- Codificación de consultas sin prefijo de instrucción, conforme al contrato de entrenamiento.
- Ejecución en CPU junto al agente, sin acelerador dedicado, gracias a su tamaño reducido.
- Integración con `sentence-transformers` y con `text-embeddings-inference` (el repositorio declara compatibilidad con endpoints).
- No soporta tool calling, generación de texto, razonamiento multi-paso, visión ni audio: es exclusivamente un extractor de features.

## Casos de uso

- Enrutado de habilidades en agentes LLM: el agente recibe una petición del usuario, codifica la consulta con este modelo y recupera por similitud coseno la habilidad más adecuada de un catálogo de miles de entradas, sin llamar a un modelo mayor para la selección.
- Despliegue en el borde o en local: al ocupar 14,176 MB empaquetado y ejecutarse en CPU, permite incorporar recuperación de habilidades en aplicaciones de escritorio, CLI o dispositivos sin GPU.
- Filtrado previo en pipelines RAG de agentes: se usa como primera etapa de recuperación sobre el catálogo de skills y se reserva un modelo mayor para la reordenación final, reduciendo coste por consulta.
- Selección de herramientas en asistentes de código: dado un catálogo de acciones o comandos disponibles, el modelo elige la acción pertinente a partir de la descripción en lenguaje natural del desarrollador.
- Indexación offline de catálogos de habilidades: el coste de codificar 6.006 descripciones es bajo con 22,7M de parámetros, lo que permite reconstruir el índice con frecuencia sin infraestructura dedicada.
- Evaluación y monitorización de agentes: sirve como componente determinista para medir si el enrutado de habilidades acierta, con un NDCG@10 de referencia de 73,82 sobre el split público.

## Benchmarks y rendimiento

Resultados sobre el split de test público de `ThakiCloud/SKILLRET` (4.392 consultas / 6.006 habilidades), métrica NDCG@10:

| Variante | Tamaño en disco | NDCG@10 | Respecto al profesor |
|---|---|---|---|
| SKILLRET-Embedding-0.6B (profesor) | 1191,6 MB | 78,48 | — |
| fp16 | 45,4 MB | 75,26 ± 0,45 | 95,9% |
| int4 / g16 | 17,0 MB | 75,14 ± 0,45 | 95,7% |
| int3 / g16 (este modelo) | 14,2 MB | 73,82 ± 0,46 | 94,1% |

Frente a fp16, la variante int3 pierde 1,44 puntos porcentuales (73,82 frente a 75,26, con error estándar de ±0,46) a cambio de un archivo 3,2 veces menor (de 45,4 MB a 14,2 MB). El error estándar del split es de aproximadamente ±0,45, por lo que diferencias inferiores a 1 punto porcentual no constituyen una clasificación fiable.

Rendimiento fuera de dominio (el modelo no generaliza):

| Corpus | NDCG@10 de este modelo | Rango de embedders generales comparables |
|---|---|---|
| NFCorpus | 16,90 | 31 a 39 |
| SciFact | 56,78 | 64 a 78 |

El tamaño empaquetado predicho fue de 14,239 MB frente a 14,176 MB reales en disco (0,44% de error). No se han publicado resultados de latencia o throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el payload empaquetado son 14,176 MB y la versión safetensors en fp16 ocupa 45,4 MB en disco.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. Cualquier GPU consumer (RTX 4090, RTX 3060 o inferior) lo ejecuta sin problema, pero no es su escenario objetivo.
- Cabe en cualquier GPU consumer y en CPU sin acelerador dedicado.
- Opciones de despliegue: `sentence-transformers`, `transformers`, `text-embeddings-inference` (compatibilidad con endpoints declarada); el enrutado del payload int3 por llama.cpp u ONNX Runtime está contemplado pero no medido.
- Latencia y throughput: no disponibles. Las cifras de latencia del autor se midieron con aritmética fp32 sobre el safetensors des-cuantizado, no con kernels enteros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NDCG@10 (SkillRet) | Tamaño | Licencia |
|---|---|---|---|---|---|
| SKILLRET-Edge-22M-int3 | 22,7M | 256 | 73,82 | 14,2 MB | Apache-2.0 |
| SKILLRET-Edge-22M (fp16) | 22,7M | 256 | 75,26 | 45,4 MB | Apache-2.0 |
| SKILLRET-Embedding-0.6B (profesor) | 0,6B | no disponible | 78,48 | 1191,6 MB | Apache-2.0 |
| Embedders generales de tamaño similar | no disponible | no disponible | 16,90 (NFCorpus) / 56,78 (SciFact) | no disponible | no disponible |

La comparación con embedders de propósito general solo es posible en los corpus fuera de dominio, donde este modelo queda claramente por debajo de alternativas de tamaño igual o menor. No hay datos publicados que permitan comparar latencia ni throughput con esas alternativas.

## Limitaciones y advertencias

- El modelo es especializado y no generaliza: 16,90 en NFCorpus y 56,78 en SciFact, frente a 31-39 y 64-78 de embedders generales comparables. Solo debe usarse para recuperación de habilidades.
- El prefijo de consulta debe coincidir entre entrenamiento y evaluación. Las consultas se codifican sin prefijo; un desajuste produjo una variación medida de +8,84 puntos porcentuales y un resultado falso en el que la cuantización parecía superar a fp16.
- El split de referencia de los modelos SkillRet originales (4.997 consultas / 6.660 habilidades) no está en el dataset publicado; los archivos públicos son idénticos en hash a los de 4.392 / 6.006. No deben convertirse cifras entre ambos splits.
- El error estándar del split es de ±0,45; diferencias por debajo de 1 punto porcentual no son rankings fiables.
- Solo soporta inglés.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de recuperación incorrecta de habilidades cuando la consulta cae fuera de la distribución del catálogo.
- La ruta safetensors ejecuta aritmética fp32, por lo que no se obtienen las ventajas de velocidad de un kernel INT; el rendimiento real del payload empaquetado no está medido.
- Intentos documentados que no funcionaron: destilar del profesor de 8B en lugar del de 0,6B (-2,40 pp por brecha de capacidad), cuantización INT2/ternaria del profesor de 0,6B (colapso a ~0,1 NDCG@10), INT2/g16 sobre los estudiantes (22M: 59,42 frente a 75,26 en fp16), minería de negativos duros (-1,0 pp) y la pérdida auxiliar LEAF con w=0,3 (-1,51 pp).
- Licencia Apache-2.0 heredada del modelo base, sin restricciones adicionales para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/SKILLRET-Edge-22M-int3
- Modelo base: https://huggingface.co/ThakiCloud/SKILLRET-Edge-22M
- Profesor: https://huggingface.co/ThakiCloud/SKILLRET-Embedding-0.6B
- Dataset: https://huggingface.co/datasets/ThakiCloud/SKILLRET
- Blog de ingeniería (inglés): https://thakicloud.com/tech-blog/en/llmops/skillret-small-family-cpu-skill-retrieval/
- Blog de ingeniería (coreano): https://thakicloud.com/tech-blog/ko/llmops/skillret-small-family-cpu-skill-retrieval/
- Paper SkillRet: https://arxiv.org/abs/2605.05726
- Paper de cuantización post-entrenamiento en embedders: https://arxiv.org/abs/2609.16391
