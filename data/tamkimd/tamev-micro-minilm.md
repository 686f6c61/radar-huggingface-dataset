# Tamkimd/tamev-micro-minilm

## Resumen

TAMEV-Micro-MiniLM es un modelo de decisión de tipo "System One" desarrollado por Tamkimd. A diferencia de un LLM generativo, no produce texto: recibe un estado (state), una pregunta y una lista de opciones candidatas, y devuelve una distribución de probabilidad calibrada sobre esas opciones en un único forward pass. Resuelve el problema del enrutamiento y la selección de opciones en sistemas con LLM: elegir herramienta, cola de atención, intención o nivel de una rúbrica sin invocar un modelo grande.

El modelo se construye por fine-tuning de `sentence-transformers/all-MiniLM-L6-v2` y expone tres tipos de decisión con la misma llamada: `choice` (una entre K), `noul` (sí/no) y `score` (ordinal sobre una rúbrica). Su punto fuerte es la eficiencia y la calibración: 22.762.369 parámetros, latencia mediana de 7,29 ms en un solo hilo de CPU y un ECE de 0,0224. Es relevante porque permite sacar del bucle del LLM tareas de clasificación y gating que consumen tokens y añaden latencia, y hacerlo en entornos edge u offline.

La arquitectura es un transformer encoder compacto con una cabeza de puntero sobre las opciones, invariante a la permutación de estas (drift bit-exacto de 0,0). Se distribuye con pesos safetensors, ONNX (incluida variante int8), TorchScript y soporte MLX/MPS para Apple Silicon, bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM) con cabeza de puntero sobre opciones; decisión tipada |
| Parámetros totales | 22.762.369 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | ONNX int8 (además de pesos completos safetensors, ONNX y TorchScript) |
| Idiomas soportados | Inglés (entrenamiento); etiqueta multilingual en metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, ONNX int8, TorchScript, MLX |

## Arquitectura y entrenamiento

El modelo parte de `all-MiniLM-L6-v2` y añade una cabeza de puntero que puntúa cada opción candidata dada en la llamada, de modo que la lista de clases no está fijada en los pesos. Esto lo hace invariante a la permutación de opciones: el autor reporta 0,0 de drift (bit-exacto) sobre 159.992 pares de permutación y 0 flips. Soporta tres modos tipados (`choice`, `noul`, `score`) en una sola pasada.

El fine-tuning emplea un conjunto de datos compuesto por diez datasets públicos de clasificación e inferencia: Banking77, BoolQ, AG News, MultiNLI, SST-5, Yelp Review Full, TREC, DBpedia 14, Amazon Reviews Multi (en) e IMDB. La calibración se trata explícitamente: el autor menciona temperature scaling y reporta ECE y Brier score, con comprobaciones de fuga por coincidencia exacta nulas frente a los splits de entrenamiento, validación y calibración.

## Capacidades

- Selección de opción única entre K candidatas (`choice`) con probabilidades calibradas que suman 1.
- Respuesta binaria sí/no (`noul`).
- Puntuación ordinal sobre rúbricas (`score`), por ejemplo niveles de urgencia.
- Enrutamiento de intenciones y de llamadas a herramientas (tool-call gating).
- Gating de seguridad y guardrails mediante clasificación con umbral de confianza.
- Invariante a la permutación de opciones (resultado independiente del orden).
- Inferencia en CPU, Apple Silicon (MPS/MLX) y edge/móvil vía ONNX.
- No genera texto libre ni razona de forma multi-paso; es un clasificador de decisión.

## Casos de uso

- Enrutamiento de incidencias en atención al cliente: dado el texto del cliente y una lista de colas o playbooks, devuelve la cola adecuada con confianza calibrada, como en el ejemplo de la model card (bloqueo de tarjeta en el extranjero).
- Gating de llamadas a herramientas en agentes: decidir si se debe invocar una herramienta y cuál, antes de gastar tokens en un LLM grande; la latencia de 7,29 ms permite hacerlo en cada turno.
- Clasificación de intenciones en asistentes conversacionales: sustituir un clasificador entrenado a medida por un modelo que recibe el catálogo de intenciones en tiempo de llamada, sin reentrenar al añadir clases.
- Guardrails y moderación: decidir si una petición cae en una categoría de riesgo mediante `noul` o `choice` con umbral sobre la probabilidad calibrada.
- Triaje y priorización: asignar un nivel ordinal (`score`) a tickets o alertas según una rúbrica de urgencia.
- Inferencia offline en edge o móvil: despliegue con ONNX int8 en dispositivos sin GPU para clasificación local de bajo consumo.
- Evaluación automática con rúbricas: puntuar respuestas o candidatos contra criterios ordinales de forma determinista y barata.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el conjunto held-out TAMEV (n=19.999, ítems balanceados):

| Métrica | Valor |
|---|---|
| Top-1 accuracy | 0,8223 (IC 95 %: 0,8172–0,8277) |
| Top-3 accuracy | 0,9851 |
| Expected Calibration Error (ECE) | 0,0224 (IC 95 %: 0,0182–0,0269) |
| Brier score | 0,2405 |
| NLL | 0,4366 |
| Latencia mediana (p50) | 7,29 ms (un hilo de CPU) |
| Latencia p95 | 13,07 ms |
| Throughput | 127 llamadas/s |
| Drift por permutación de opciones | 0,0 (bit-exacto; 159.992 pares, 0 flips) |

## Requisitos de hardware

- VRAM: no requiere GPU; con 22,7 M de parámetros los pesos completos ocupan del orden de decenas de MB, y la variante ONNX int8 reduce aún más el footprint.
- CPU: inferencia viable en un solo hilo con 7,29 ms p50; no necesita acelerador.
- GPU recomendadas: no necesarias; cualquier GPU (RTX 4090, A100, H100) serviría pero queda sobredimensionada para este modelo.
- Consumer GPU: cabe en cualquier GPU de consumo e incluso en CPU y móvil.
- Despliegue: transformers (`trust_remote_code=True`), ONNX Runtime (incluido int8), TorchScript, MLX/MPS en Apple Silicon; el paquete `tamev` se instala desde el repositorio (no está en PyPI).
- Latencia y throughput: 7,29 ms p50 y 127 llamadas/s por hilo de CPU según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| TAMEV-Micro-MiniLM | 22,7 M | No disponible | Decisión tipada sobre opciones, calibrada | Apache 2.0 |
| all-MiniLM-L6-v2 (base) | ~22,7 M | 256 tokens (típico) | Embeddings de frases | Apache 2.0 |
| Clasificadores SetFit/Banking77 | Variable | Variable | Clases fijas en pesos | Variable |
| LLM router generativo (p. ej. un LLM pequeño) | Miles de millones | Largo | Generación de texto | Variable |

La diferencia clave frente a un clasificador clásico es que las opciones se pasan en la llamada y no están fijadas en los pesos; frente a un LLM pequeño, la ventaja es latencia y calibración a costa de no generar texto ni razonar. No se dispone de comparativas de rendimiento publicadas frente a alternativas concretas.

## Limitaciones y advertencias

- Solo decide entre opciones dadas; no genera texto ni ejecuta razonamiento multi-paso.
- Entrenado principalmente en inglés; el soporte multilingüe no está validado y puede degradarse fuera del inglés.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Riesgo de error en el 17,8 % de los casos top-1; usar la confianza calibrada y umbrales para derivar a un LLM o a revisión humana.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor.
- El paquete `tamev` no está en PyPI; hay que instalarlo desde el repositorio.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos de los datasets de entrenamiento subyacentes.
- La longitud de contexto no está documentada; opciones o estados muy largos pueden truncarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamkimd/tamev-micro-minilm
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Licencia: https://huggingface.co/Tamkimd/tamev-micro-minilm/resolve/main/LICENSE
- Datasets de entrenamiento: https://huggingface.co/datasets/legacy-datasets/banking77, https://huggingface.co/datasets/google/boolq, https://huggingface.co/datasets/fancyzhx/ag_news, https://huggingface.co/datasets/nyu-mll/multi_nli, https://huggingface.co/datasets/SetFit/sst5, https://huggingface.co/datasets/Yelp/yelp_review_full, https://huggingface.co/datasets/CogComp/trec, https://huggingface.co/datasets/fancyzhx/dbpedia_14, https://huggingface.co/datasets/SetFit/amazon_reviews_multi_en, https://huggingface.co/datasets/stanfordnlp/imdb
