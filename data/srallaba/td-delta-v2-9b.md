# srallaba/td-delta-v2-9b

## Resumen

td-delta-v2-9b es un adaptador LoRA (r16, alpha 32) junto con una cabeza de scoring, entrenado sobre el modelo base Qwen/Qwen3.5-9B-Base y publicado por el usuario srallaba bajo licencia Apache-2.0. No es un modelo conversacional: resuelve "decisiones tipadas" sobre un estado en formato JSON en una sola pasada no autoregresiva y devuelve distribuciones de probabilidad calibradas sobre tres primitivas: `choice` (distribucion sobre etiquetas nombradas), `score` (distribucion sobre niveles ordinales 0..K-1) y `noul` (probabilidad de que un enunciado sea verdadero).

La relevancia del modelo esta en que expone probabilidades y metricas de calibracion (ECE, Brier, NLL) y de prediccion selectiva (AURC) que la mayoria de los LLM generativos no ofrecen de forma fiable. El repositorio ocupa 0,2 GB e incluye un adaptador de 165 MB y una cabeza de 8 MB. Se entreno durante aproximadamente 20 horas en una unica A6000 sobre 13.423 registros y alcanza una precision de decision de 0,783 en el test retenido v1 (400 casos, 1945 decisiones) y de 0,786 en la evaluacion v2 (6264 decisiones).

El modelo se sirve exclusivamente mediante `kev.serve`, que expone una API `/v1/systemone`. No genera texto libre ni soporta chat; su proposito es puntuar decisiones con una distribucion de probabilidad asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r16, alpha 32) sobre Qwen/Qwen3.5-9B-Base mas cabeza de scoring de kev; inferencia no autoregresiva en una sola pasada. Arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | Modelo base de 9B (segun la denominacion del repositorio) mas adaptador LoRA de 165 MB y cabeza de scoring de 8 MB |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; el entrenamiento se realizo en bf16) |
| Idiomas soportados | No disponible (no declarados; el autor solo ha probado estados en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) y PyTorch .pt (head.pt) |
| Autor | srallaba |
| Modelo base | Qwen/Qwen3.5-9B-Base (revision 68c46c4b3498877f3ef123c856ecfde50c39f404) |
| Libreria | PEFT |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre todas las proyecciones de Qwen/Qwen3.5-9B-Base, complementado por una cabeza de scoring independiente (8 MB) que produce distribuciones sobre etiquetas. La inferencia es no autoregresiva: en lugar de generar tokens, el sistema recibe un estado JSON y un conjunto de preguntas tipadas y emite directamente la distribucion de cada pregunta en una sola pasada, a traves de la API `/v1/systemone` de `kev.serve`.

El entrenamiento partio de un arranque en caliente desde una ejecucion v1 sobre datos typed-decisions y continuo con 2 epocas sobre una mezcla v2 de 13.423 registros: typed-decisions 1200, HelpSteer2 1760 (score), UltraFeedback binarizado 1760 (choice), HateSpeech 2639 en modo grouped-soft (score), MMLU-aux 1760, HellaSwag 1760 y ANLI-r1 1760 (choice) y PubMedQA 784 (noul). El objetivo combina distribuciones gold suaves con terminos de calibracion Brier (`brier_w` 0,5) y ranked-probability-score ordinal (`ord_w` 0,5). Los hiperparametros fueron learning rate 2e-5, batch 1 con acumulacion 8, precision bf16, semilla 0 y 2 x 3346 pasos de optimizador, con una perdida que bajo de 0,867 a 0,535 en unas 20 horas sobre una A6000. Se realizo una auditoria de fuga de datos mediante coincidencia exacta normalizada entre el conjunto de entrenamiento y el split de test v1, con 0 fugas detectadas.

## Capacidades

- Tres primitivas tipadas de decision: `choice` (clasificacion, MCQ, preferencias), `score` (niveles ordinales 0..K-1, ratings, severidad) y `noul` (P(enunciado verdadero), juicios estilo entailment).
- Inferencia en una sola pasada no autoregresiva por lote de preguntas, en lugar de decodificacion token a token.
- Salida de distribuciones de probabilidad calibradas, con metricas publicadas de ECE, Brier, NLL y AURC.
- Prediccion selectiva: el AURC de 0,079 en el test v1 permite umbralizar decisiones y derivar casos dudosos.
- Entrada estructurada: estado JSON mas preguntas con tipo, instrucciones y criterios o etiquetas nombradas.
- Tool calling / function calling: no soportado; no es un modelo generativo y no documenta esta capacidad.
- Agentes y razonamiento multi-paso: no soportado de forma nativa; cada llamada resuelve un conjunto de decisiones en una pasada.
- Capacidades multilingues: no documentadas; solo se han probado estados en ingles.
- Sin vision, sin audio y sin modo de razonamiento explicito (thinking mode); no genera texto libre.

## Casos de uso

- Triaje de incidentes en produccion: se envia un estado JSON con las notas del incidente y el modelo devuelve una distribucion `choice` sobre acciones como "roll back" o "wait". El propio ejemplo de la model card usa este escenario con un error TLS en un despliegue de staging.
- Enrutado con prediccion selectiva: tras ajustar la temperatura, la probabilidad del argmax se usa como umbral para decidir que casos se resuelven de forma automatica y cuales se derivan a revision humana, apoyandose en el AURC de 0,079.
- Moderacion de contenido: la primitiva `score`, entrenada con 2639 ejemplos de HateSpeech en modo grouped-soft, asigna un nivel de severidad ordinal a un texto.
- Evaluacion de calidad de respuestas de LLM: la primitiva `score` con HelpSteer2 (1760 ejemplos) y la primitiva `choice` con UltraFeedback binarizado permiten puntuar y ordenar salidas generadas en pipelines de evaluacion o de reward modeling.
- Verificacion de afirmaciones y NLI: la primitiva `noul`, con 0,840 de precision en el test v1 y entrenada con ANLI-r1, decide si un enunciado se sigue de un contexto dado.
- Triaje de texto biomedico: la primitiva `noul` se entreno con 784 ejemplos de PubMedQA, lo que la hace util para juicios de si/no sobre afirmaciones tecnicas o cientificas.
- Clasificacion de intenciones y MCQ: la primitiva `choice`, con MMLU-aux y HellaSwag en el mix de entrenamiento, sirve para enrutar consultas hacia categorias predefinidas con probabilidad asociada.
- Curacion de datasets a escala: puntuar pares instruccion-respuesta segun criterios definidos en el campo `criteria` y etiquetarlos con `choice` o `score` para filtrar corpus antes del entrenamiento.

## Benchmarks y rendimiento

Test retenido de typed-decisions (400 casos, 1945 decisiones):

| Metrica | td-delta-v2-9b | v1 9b delta | kev-4b base |
|---|---|---|---|
| Precision de decision | 0,783 | 0,774 | 0,665 |
| ECE | 0,140 | 0,149 | 0,091 |
| Brier | 0,334 | 0,350 | 0,468 |
| NLL | 0,585 | 0,612 | 0,819 |
| AURC | 0,079 | 0,087 | 0,195 |

Precision por primitiva en el test v1: `choice` 0,737, `noul` 0,840, `score` 0,774.

Evaluacion v2 mas amplia (6264 decisiones, con fuentes mayoritariamente solo de evaluacion, incluidas ChaosNLI y RewardBench): precision 0,786, ECE 0,107; `choice` 0,801 (5558), `score` 0,647 (600), `noul` 0,783 (106).

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del modelo base de 9B en bf16 ocupan aproximadamente 18 GB, mas 2-4 GB de overhead de runtime; el adaptador (165 MB) y la cabeza (8 MB) son despreciables. No hay cifras oficiales publicadas.
- GPU recomendadas: el autor entreno el modelo en una unica A6000 durante unas 20 horas. Para inferencia son validas A100 (40/80 GB) y H100 (80 GB), aunque sobredimensionadas.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) en bf16, con margen ajustado. En tarjetas de 16 GB no hay ruta documentada, ya que no se publican pesos cuantizados.
- Opciones de despliegue: la unica via documentada es `kev.serve` (clonar el repositorio `jaredpalmer/kev`, ejecutar `uv sync --extra serve` y arrancar con `uv run python -m kev.serve --run srallaba/td-delta-v2-9b --port 8008`). Soporte para vLLM, TGI, llama.cpp u Ollama no esta documentado. El paquete `kev` de PyPI no es el mismo proyecto.
- Latencia y throughput: no disponibles. La arquitectura evita la decodificacion autorregresiva al resolver cada lote de preguntas en una sola pasada, pero no se han publicado medidas de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision de decision (test v1) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| td-delta-v2-9b | Base 9B + adaptador LoRA | No disponible | 0,783 | 0,140 | Apache-2.0 | HuggingFace (adaptador PEFT) |
| td-delta v1 9b | Base 9B + adaptador LoRA | No disponible | 0,774 | 0,149 | No disponible | Referencia interna del mismo autor, usada como arranque en caliente |
| kev-4b base | 4B (segun denominacion) | No disponible | 0,665 | 0,091 | No disponible | No disponible |
| Qwen/Qwen3.5-9B-Base | 9B | No disponible | No aplica (modelo generativo, no scorer de decisiones) | No disponible | Apache-2.0 (segun la model card del adaptador) | HuggingFace |

No se dispone de datos comparativos frente a otros scorers de decision publicos en la informacion proporcionada.

## Limitaciones y advertencias

- Infraconfianza por defecto: el entrenamiento contra objetivos suaves reparte masa de probabilidad, de modo que la confianza del argmax subestima la precision real del argmax. El autor recomienda ajustar una temperatura sobre datos retenidos (T aproximada de 0,4 sobre el test v1 reduce el ECE a unos 0,03) antes de fiarse de las probabilidades.
- La primitiva `score` es la mas debil: 0,647 en escalas de 3 y 5 puntos mas dificiles de la evaluacion v2, frente a 0,774 en el test v1.
- La primitiva `choice` con cardinalidad alta (70 o mas opciones) no ha sido probada.
- Los estados que no estan en ingles no han sido probados; no se declaran idiomas soportados.
- El modelo esta pensado para puntuar decisiones, no para generacion abierta ni conversacion.
- Riesgo de etiquetado incorrecto: al ser un clasificador, los errores se manifiestan como etiquetas mal asignadas o distribuciones mal calibradas. Con un ECE de 0,140 sin calibrar, no conviene usar las probabilidades directamente como umbrales de decision en produccion.
- Sesgos: el mix de entrenamiento incluye HateSpeech, HelpSteer2, UltraFeedback, MMLU-aux, HellaSwag, ANLI-r1 y PubMedQA, ademas del modelo base Qwen3.5. No se ha publicado ninguna auditoria de sesgos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe respetarse la licencia del modelo base.
- Dependencia de un stack no estandar: la unica via de despliegue documentada es el repositorio `kev` de GitHub; el paquete `kev` de PyPI es un proyecto distinto y no sirve para cargar este modelo.
- Adopcion nula en el momento de la ficha: 0 descargas y 0 likes, sin validacion por parte de terceros ni publicaciones independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/srallaba/td-delta-v2-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio de `kev` (servidor `/v1/systemone`): https://github.com/jaredpalmer/kev
- Ficheros de evaluacion y entrenamiento referenciados en la model card: `eval-v1test.json`, `eval-v2eval.json`, `training_config.json`, `training_metrics.json` (sin URL directa disponible)
- Papers, blogs y demos adicionales: no disponibles
