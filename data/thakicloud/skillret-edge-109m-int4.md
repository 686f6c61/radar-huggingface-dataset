# ThakiCloud/SKILLRET-Edge-109M-int4

## Resumen

SKILLRET-Edge-109M-int4 es la variante cuantizada a 4 bits de un bi-encoder de 109,5 millones de parametros desarrollado por ThakiCloud para una tarea muy concreta: la recuperacion de habilidades (skill retrieval) dentro de catalogos de herramientas para agentes. Dado un enunciado en lenguaje natural, el modelo selecciona la skill adecuada de un catalogo de miles de entradas, devolviendo un ranking por similitud coseno sobre embeddings normalizados.

El modelo se obtiene por destilacion de conocimiento desde `ThakiCloud/SKILLRET-Embedding-0.6B` (el teacher) y se empaqueta en formato int4 con cuantizacion asimetrica min/max por grupos de 16, con escalas y puntos cero en fp16. Su interes practico es el tamano: 82,0 MB empaquetados frente a 219,0 MB en fp16, manteniendo un NDCG@10 de 79,21 en el split de test publico de `ThakiCloud/SKILLRET`, lo que lo hace viable para ejecucion en CPU junto al propio agente.

Es importante subrayar que no es un embedder de proposito general. La propia model card advierte de que el rendimiento colapsa fuera de su dominio (7,31 en NFCorpus y 53,07 en SciFact), por lo que debe emplearse exclusivamente para recuperacion de skills. La licencia es Apache-2.0 y solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (bi-encoder, `sentence-transformers`), pooling CLS |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; `max_length=256` en evaluacion |
| Tipos de cuantizacion | int4 asimetrica min/max por grupos (g16); tambien existen variantes fp16, int3/g16 e int3/g32 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (descuantizado a fp16 para carga directa) y `model-int4-g16.bin` (payload empaquetado real, 82,020 MB) |

## Arquitectura y entrenamiento

Se trata de un transformer tipo BERT configurado como bi-encoder: codifica consultas y documentos de forma independiente y compara sus embeddings mediante producto escalar tras normalizacion L2. El pooling es CLS. El modelo se entrena por destilacion de conocimiento desde `ThakiCloud/SKILLRET-Embedding-0.6B` con `kd_weight=0.7`, usando una perdida InfoNCE multi-positivo sobre 1 a 3 ejemplos dorados por consulta, 12 epocas y un schedule de learning rate coseno. La epoca final se selecciono sobre un holdout disjunto por skill, sin tocar el split de test.

La cuantizacion es post-entrenamiento, asimetrica min/max y por grupos de 16 pesos, con escalas y puntos cero almacenados en fp16, una estructura equivalente a los bloques Q4_K/Q8_0 de GGUF. El repositorio incluye dos artefactos deliberadamente separados: `model.safetensors`, que contiene los valores descuantizados de vuelta a fp16 para que cualquier instalacion de `transformers` o `sentence-transformers` lo cargue hoy mismo, y `model-int4-g16.bin`, que es el payload empaquetado real y respalda la cifra de tamano. El autor advierte de que la ruta safetensors ejecuta aritmetica en fp32, por lo que las latencias publicadas no corresponden a kernels enteros; el enrutado del payload empaquetado por un kernel INT real (llama.cpp, ONNX Runtime) no esta medido. El fichero `quantization.json` documenta el layout por tensor para quien quiera implementar ese kernel.

## Capacidades

- Recuperacion de skills: dado un enunciado en lenguaje natural, devuelve un ranking de habilidades de un catalogo por similitud coseno.
- Generacion de embeddings de frases para consultas y documentos, con normalizacion L2 y pooling CLS.
- Integracion con `sentence-transformers` y con el pipeline `feature-extraction`.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con `endpoints_compatible`.
- Orientado a ejecucion on-device: el modelo esta disenado para correr en CPU junto al agente.
- No soporta tool calling, agentes multi-paso, vision, audio ni modo thinking: es exclusivamente un encoder de recuperacion.
- Capacidad multilingue limitada al ingles declarado.

## Casos de uso

- Seleccion de herramienta en agentes LLM: antes de invocar una funcion, el agente codifica la peticion del usuario y la compara contra los embeddings precalculados de su catalogo de skills; el modelo devuelve las candidatas con mayor similitud y el orquestador elige entre las mejores. Su tamano de 82 MB permite mantenerlo residente en el mismo host que el agente.
- Enrutado de intenciones en asistentes conversacionales: clasificar cada turno del usuario hacia un conjunto cerrado de acciones predefinidas (crear grafico, consultar base de datos, enviar correo) mediante similitud entre el embedding de la consulta y las descripciones de cada accion.
- Despliegue en el borde o en dispositivos sin GPU: al caber en 82 MB empaquetados y ejecutarse en CPU, es adecuado para entornos con memoria limitada donde no se puede alojar un embedder de mayor tamano.
- Recuperacion sobre catalogos grandes: con 6.006 skills en el conjunto de evaluacion, el modelo demuestra capacidad de discriminar entre miles de candidatas; los embeddings del catalogo pueden precalcularse una vez y reutilizarse en cada consulta.
- Filtrado previo en pipelines RAG de herramientas: reducir un catalogo amplio de skills a un top-k antes de una etapa de re-ranking mas costosa con un modelo mayor.
- Sistemas de recomendacion de funcionalidades: sugerir al usuario la capacidad o comando adecuado dentro de una aplicacion a partir de una descripcion libre de lo que quiere hacer.
- Evaluacion y benchmarking de recuperacion en dominios de agentes: servir como referencia ligera y reproducible (NDCG@10 79,21 en el split publico) para comparar estrategias de recuperacion de skills.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test publico de `ThakiCloud/SKILLRET` (4.392 consultas / 6.006 skills), metrica NDCG@10:

| Variante | Tamano en disco | NDCG@10 | Respecto al teacher |
|---|---|---|---|
| SKILLRET-Embedding-0.6B (teacher) | 1191,6 MB | 78,48 | — |
| fp16 | 219,0 MB | 79,18 ± 0,42 | 100,9% |
| int4 / g16 (este modelo) | 82,0 MB | 79,21 ± 0,42 | 100,9% |
| int3 / g16 | 68,4 MB | 78,04 ± 0,44 | 99,4% |
| int3 / g32 | 54,7 MB | 77,10 ± 0,44 | 98,2% |

El propio autor senala que la diferencia frente a fp16 (+0,03 pp) queda dentro del error estandar de ±0,42 en este split, por lo que debe interpretarse como un empate, no como una mejora. El beneficio real es el tamano: 2,7 veces menor con la misma calidad.

Rendimiento fuera de dominio (recuperacion general, para contraste):

| Corpus | SKILLRET-Edge-109M-int4 | Embedders generales de tamano similar o menor |
|---|---|---|
| NFCorpus | 7,31 | aprox. 31 a 39 |
| SciFact | 53,07 | aprox. 64 a 78 |

Experimentos fallidos documentados por el autor:

| Intento | Resultado |
|---|---|
| Destilar desde el teacher de 8B en lugar del de 0,6B | −2,40 pp (brecha de capacidad) |
| Cuantizacion INT2/ternaria post-entrenamiento del teacher de 0,6B | Colapso total (aprox. 0,1 NDCG@10; retrieval aleatorio 0,086); GPTQ y QuIP no lo rescatan |
| Cuantizacion INT2/g16 de los estudiantes | 22M: 59,42 (fp16 75,26); 109M: 63,55 (fp16 79,18) |
| Mineria de negativos duros (conjunto propio) | −1,0 pp |
| Perdida auxiliar LEAF (w=0,3) | −1,51 pp (t pareada = −7,78) |

## Requisitos de hardware

- VRAM estimada: no aplica estrictamente, ya que el modelo esta pensado para CPU; en GPU, el artefacto safetensors en fp16 ocupa aproximadamente 219 MB y el payload empaquetado 82 MB.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU consumer moderna puede alojarlo con holgura.
- Cabe en GPU consumer: si, dado el reducido numero de parametros (109,5 M); no se especifican modelos concretos.
- Opciones de despliegue: `sentence-transformers` (ruta soportada y medida), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles; el autor menciona llama.cpp y ONNX Runtime como destino para kernels INT reales, pero esa ruta no esta medida.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor indica que las cifras de latencia se midieron con aritmetica fp32 sobre el safetensors descuantizado y que no corresponden a velocidades de kernel entero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NDCG@10 (SkillRet) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SKILLRET-Edge-109M-int4 | 109,5 M | no disponible (eval. a 256) | 79,21 | 82,0 MB empaquetado | Apache-2.0 | Hugging Face |
| SKILLRET-Edge-109M (fp16) | 109,5 M | no disponible (eval. a 256) | 79,18 | 219,0 MB | Apache-2.0 | Hugging Face |
| SKILLRET-Embedding-0.6B (teacher) | 0,6 B (aprox.) | no disponible | 78,48 | 1191,6 MB | Apache-2.0 | Hugging Face |

No se dispone de datos de embedders generales comparables en la misma metrica; la model card solo aporta sus resultados en NFCorpus y SciFact como referencia de degradacion fuera de dominio.

## Limitaciones y advertencias

- Especializacion estricta: el modelo no generaliza. Rinde muy por debajo de embedders generales en corpus ajenos a skill retrieval (7,31 en NFCorpus, 53,07 en SciFact); usarlo fuera de su dominio produce resultados pobres.
- Solo ingles declarado; no se garantiza comportamiento en otros idiomas.
- Consistencia del prefijo de consulta: las consultas deben codificarse sin prefijo de instruccion (`resolved: ""` en `query_prefix.json`). El autor midio una variacion de +8,84 pp en un mismo checkpoint por desajuste entre entrenamiento y evaluacion, y ese desajuste genero un falso resultado en el que la cuantizacion parecia superar a fp16.
- El safetensors descuantizado ejecuta aritmetica fp32, no kernels enteros; el beneficio de velocidad del int4 no esta materializado ni medido en esta ruta.
- La cuantizacion a 2 bits (INT2/ternaria) provoca perdidas severas o colapso, tanto en el teacher como en los estudiantes; no es una opcion viable.
- Discrepancia de splits: la model card de los modelos de referencia de SkillRet reporta 4.997 consultas / 6.660 skills, un split que no esta en el dataset publicado; los ficheros publicos son identicos en hash a los usados por el autor (4.392 / 6.006). No deben convertirse cifras entre ambos.
- El error estandar del split es de aproximadamente ±0,45; diferencias inferiores a 1 pp no deben interpretarse como rankings.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de recuperacion erronea cuando la skill buscada no esta en el catalogo o su descripcion no cubre la formulacion del usuario.
- Licencia Apache-2.0, heredada del modelo base, sin restricciones adicionales conocidas para uso comercial.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al entrenarse sobre un dataset propio de skills, puede heredar los sesgos de cobertura y redaccion de ese catalogo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/SKILLRET-Edge-109M-int4
- Modelo base: https://huggingface.co/ThakiCloud/SKILLRET-Edge-109M
- Teacher: https://huggingface.co/ThakiCloud/SKILLRET-Embedding-0.6B
- Dataset: https://huggingface.co/datasets/ThakiCloud/SKILLRET
- Blog tecnico (ingles): https://thakicloud.com/tech-blog/en/llmops/skillret-small-family-cpu-skill-retrieval/
- Blog tecnico (coreano): https://thakicloud.com/tech-blog/ko/llmops/skillret-small-family-cpu-skill-retrieval/
- Paper del benchmark SkillRet: https://arxiv.org/abs/2605.05726
- Paper de mediciones de cuantizacion: https://arxiv.org/abs/2609.16391
