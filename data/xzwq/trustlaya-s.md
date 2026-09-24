# xzwq/TrustLaya-S

## Resumen

TrustLaya-S es un encoder BERT multitarea de 42.138.641 parámetros, desarrollado por el usuario xzwq y afinado a partir del backbone ytu-ce-cosmos/turkish-medium-bert-uncased. Su función es producir nueve puntuaciones de riesgo relacionadas con la seguridad de sistemas de IA, además de una estimación de severidad y una acción asesora. La decisión final de permitir, redactar, revisar o bloquear no la toma el modelo, sino un motor de políticas determinista e independiente que se ejecuta por separado y consume las puntuaciones del encoder.

El modelo se presenta explícitamente como un prototipo de investigación, no como una barrera de seguridad lista para producción. Se entrenó sobre 10.000 ejemplos sintéticos controlados, con una señal débil de profesor procedente de convaiinnovations/laya (128 ejemplos) y una partición family-disjoint de 6.972/1.053/1.975 para entrenamiento, validación y prueba. La entrada se trunca a 96 tokens, lo que limita el análisis a fragmentos cortos de texto.

Su relevancia actual es doble. Por un lado, aborda una tarea con poca cobertura fuera del inglés, como es la detección de prompt injection y de PII en turco. Por otro, publica de forma inusualmente honesta sus métricas negativas: una tasa de falsos positivos del 42,9 % en el conjunto independiente deepset/prompt-injections y un F1 de 0,000 en gobierno de datos. Eso lo convierte en un artefacto útil para investigación y triaje con revisión humana, pero no para aplicación automática e irreversible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder BERT multitarea (backbone ytu-ce-cosmos/turkish-medium-bert-uncased) con cabezas de clasificación para nueve puntuaciones de riesgo de seguridad de IA, severidad y acción asesora; la decisión final la aplica un motor de políticas determinista externo |
| Parámetros totales | 42.138.641 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible; la entrada se trunca a 96 tokens en entrenamiento y evaluación |
| Tipos de cuantización | ONNX FP32 y ONNX INT8 con cuantización dinámica (variante para CPU). No se distribuyen cuantizaciones GGUF, GPTQ ni AWQ |
| Idiomas soportados | Turco (tr) e inglés (en); entrenamiento y evaluación centrados en turco |
| Licencia | MIT |
| Formato de pesos | safetensors (red multitarea PyTorch personalizada, no compatible con `AutoModel.from_pretrained` genérico), ONNX FP32 (`trustlaya.onnx`) y ONNX INT8 (`trustlaya_int8.onnx`) |

## Arquitectura y entrenamiento

La arquitectura parte de un encoder BERT de tamano medio preentrenado en turco y anade cabezas multitarea sobre la representacion del token de clasificacion. El modelo no genera texto: emite puntuaciones por tarea (nueve riesgos de seguridad de IA, severidad y accion asesora). La decision operativa se delega en un motor de politicas determinista que lee `policy.yaml`, de modo que los permisos de agente no los procesa el encoder sino la capa de politicas. Esto separa el juicio estadistico del modelo de la regla de ejecucion, lo que facilita auditar por que se tomo una decision concreta.

El entrenamiento uso 10.000 ejemplos sinteticos controlados con una particion family-disjoint de 6.972 ejemplos de entrenamiento, 1.053 de validacion y 1.975 de prueba. La senal de supervision provino de un profesor debil, convaiinnovations/laya (Apache-2.0), aplicado sobre solo 128 ejemplos; el propio autor advierte que ese profesor no es ground truth. Las puntuaciones se calibraron con temperature scaling por tarea sobre validacion sintetica, y los parametros de calibracion se distribuyen en `calibration.json`. Configuracion y tokenizador acompanan a los pesos en `config.json` y los ficheros del tokenizador.

## Capacidades

- Clasificacion multitarea de seguridad: genera nueve puntuaciones de riesgo de seguridad de IA, una estimacion de severidad y una accion asesora (ALLOW, REDACT, REVIEW o BLOCK mediante el motor de politicas).
- Deteccion de prompt injection: F1 de 0,555 en el conjunto sintetico propio y F1 de 0,765 con recall de 0,867 en el test independiente deepset/prompt-injections (116 ejemplos), a umbral 0,5.
- Deteccion de PII: F1 de 1,000 en el conjunto sintetico y F1 hibrido de 0,880 (recall 0,862, FPR 0,096) sobre 2.000 ejemplos del Turkish Privacy Filter Dataset.
- Deteccion de riesgo de seguridad: F1 de 0,777 en la prueba sintetica.
- Redaccion de datos sensibles: la accion REDACT permite enmascarar fragmentos antes de registrarlos o enviarlos a otro sistema.
- Analisis de secretos: los patrones explicitos de secreto disparan BLOCK, mientras que las detecciones solo del modelo se derivan a REVIEW.
- Multilingue limitado: turco como idioma principal e ingles con cobertura de prueba reducida.
- Ejecucion en CPU y en el edge: variantes ONNX FP32 e INT8 con latencias de milisegundos de un digito.
- No soporta tool calling, function calling, agentes autonomos ni razonamiento multi-paso: es un clasificador, no un modelo generativo.

## Casos de uso

- Prefiltro de prompt injection en aplicaciones LLM en turco: el modelo se coloca delante del modelo generativo y marca entradas sospechosas para revision. Es adecuado porque la tarea esta cubierta de forma especifica en turco, aunque su tasa de falsos positivos obliga a mantener un humano en el bucle.
- Moderacion con triaje humano: las puntuaciones de severidad y la accion asesora REVIEW permiten ordenar una cola de contenido para que los revisores atiendan primero los casos de mayor riesgo, sin automatizar el bloqueo.
- Enmascaramiento de PII antes del registro: la accion REDACT, combinada con el recall de 0,862 en el Turkish Privacy Filter Dataset, permite censurar datos personales antes de escribir logs, siempre que no se registren las trazas crudas.
- Deteccion de fugas de credenciales: los patrones explicitos de secreto activan BLOCK de forma determinista, lo que sirve como red de seguridad en pipelines de integracion continua para evitar publicar claves en artefactos.
- Investigacion academica sobre clasificacion multitarea de riesgos: el repositorio incluye particiones family-disjoint, calibracion por tarea y evaluacion externa documentada, lo que lo hace reutilizable como baseline reproducible frente a otros clasificadores de seguridad.
- Despliegue en el edge o en portatiles sin GPU: con 40,5 MiB en INT8 ONNX y una latencia de 5,61 ms por lote en CPU de Apple Silicon, se puede integrar en herramientas locales de escritorio o en pasarelas con recursos muy limitados.
- Auditoria interna de trazas conversacionales: el modelo puede etiquetar conversaciones historicas almacenadas para construir inventarios de riesgo, dado que el procesamiento por lote en CPU es viable.
- Filtrado previo en servicios de atencion al cliente en turco: se ejecuta como capa de coste minimo antes de un modelo mayor, descartando o marcando entradas antes de gastar tokens de inferencia.

## Benchmarks y rendimiento

El model-index oficial del repositorio declara una entrada para TrustLaya-S con la lista de resultados vacia, por lo que no hay benchmarks estandarizados (MMLU, HumanEval, GSM8K) publicados. Los datos disponibles son los del informe de evaluacion del propio autor.

| Evaluacion | Conjunto | Metrica | Valor |
|---|---|---|---|
| Sintetica propia | 1.975 ejemplos | Precision media por tarea | 0,907 |
| Sintetica propia | 1.975 ejemplos | F1 macro | 0,663 |
| Sintetica propia | 1.975 ejemplos | F1 PII | 1,000 |
| Sintetica propia | 1.975 ejemplos | F1 riesgo de seguridad | 0,777 |
| Sintetica propia | 1.975 ejemplos | F1 prompt injection | 0,555 |
| Sintetica propia | 1.975 ejemplos | F1 gobierno de datos | 0,000 |
| Sintetica propia | 1.975 ejemplos | ECE | 0,093 |
| Sintetica propia | 1.975 ejemplos | Brier | 0,083 |
| Independiente | deepset/prompt-injections, 116 ejemplos | F1 injection | 0,765 |
| Independiente | deepset/prompt-injections, 116 ejemplos | Recall injection | 0,867 |
| Independiente | deepset/prompt-injections, 116 ejemplos | FPR a 0,5 | 0,429 |
| Independiente | Rogue Security, 178 ejemplos benignos dificiles | FPR | 0,242 |
| Independiente | Turkish Privacy Filter Dataset, 2.000 ejemplos | F1 hibrido PII (recall 0,862) | 0,880 |
| Independiente | Turkish Privacy Filter Dataset, 2.000 ejemplos | FPR PII | 0,096 |
| Diagnostico | Prowl Secrets Corpus, 2.000 ejemplos | FPR solo modelo en secretos | 0,949 |
| Diagnostico | Turkish toxic-language, 2.000 elementos | F1 toxicidad como proxy de etica | 0,012 |

| Rendimiento en Apple Silicon Mac | Valor |
|---|---|
| PyTorch CPU, lote 1, mediana en caliente | 12,39 ms |
| PyTorch MPS, lote 1, mediana en caliente | 6,03 ms |
| ONNX CPU, lote 1, mediana en caliente | 5,09 ms |
| ONNX INT8 CPU, lote 1, mediana en caliente | 5,61 ms |
| Tamano ONNX FP32 | 159,9 MiB |
| Tamano ONNX INT8 | 40,5 MiB |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 y en torno a 100-200 MB en INT8, contando pesos y activaciones de un encoder de 42 millones de parametros. El fichero ONNX FP32 pesa 159,9 MiB y el INT8, 40,5 MiB.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (RTX 3060, RTX 4090) lo ejecuta con margen amplio; A100 o H100 no aportan ventaja practica para esta carga.
- Compatibilidad con GPU consumer: si, cabe holgadamente en cualquier GPU consumer e incluso en iGPU. La inferencia en CPU es perfectamente practica.
- Latencia medida: 5,09 ms con ONNX CPU, 5,61 ms con ONNX INT8 CPU, 6,03 ms con PyTorch MPS y 12,39 ms con PyTorch CPU, en lote 1 y mediana en caliente sobre un Mac con Apple Silicon. La variante INT8 es mas pequena pero no mas rapida en esta medicion.
- Opciones de despliegue: ONNX Runtime (CPU y proveedores MPS/CUDA), PyTorch nativo y el CLI incluido en el repositorio (`demo/cli_demo.py --backend onnx`). No hay soporte para vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo ni se distribuye en GGUF.
- Throughput estimado: no disponible; el autor solo publica latencias de lote 1.
- Advertencia de integracion: los pesos en safetensors no son compatibles con `AutoModel.from_pretrained` generico, por lo que requiere cargar la red multitarea personalizada del repositorio.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| xzwq/TrustLaya-S | Clasificador multitarea de seguridad, turco primero | 42,1 M | Entrada truncada a 96 tokens | MIT | HuggingFace + GitHub + demo | F1 injection 0,765 y FPR 0,429 en deepset; F1 PII 0,880 en turco |
| protectai/deberta-v3-base-prompt-injection-v2 | Clasificador binario de prompt injection | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace | No disponible en la informacion proporcionada |
| meta-llama/Prompt-Guard-86M | Clasificador de prompt injection y jailbreak | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace | No disponible en la informacion proporcionada |
| deepset/deberta-v3-base-injection | Clasificador de prompt injection | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace | No disponible en la informacion proporcionada |

La diferencia estructural de TrustLaya-S frente a esos clasificadores es que estos ultimos son binarios y estan centrados en ingles, mientras que TrustLaya-S devuelve varias puntuaciones de riesgo simultaneas y esta optimizado para turco. No se dispone de datos comparativos directos entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Prototipo de investigacion: el autor indica expresamente que no es una barrera de seguridad de produccion y que no debe usarse en solitario para decisiones irreversibles ni para tratamiento de datos personales.
- Calibracion no fiable: las puntuaciones se ajustaron con temperature scaling sobre validacion sintetica, por lo que no son probabilidades de riesgo reales. La medida de confianza refleja concentracion categorica del output y no es una probabilidad calibrada de acierto. La puntuacion de riesgo no constituye un veredicto legal ni etico.
- Falsos positivos elevados: FPR de 0,429 en deepset/prompt-injections y de 0,242 en ejemplos benignos dificiles de Rogue Security. El propio autor lo senala como el principal bloqueador para desplegar.
- Gobierno de datos inutilizable: F1 de 0,000 en esa tarea dentro del conjunto sintetico.
- Secretos sin patron explicito: el FPR solo del modelo llega a 0,949 en el Prowl Secrets Corpus, lo que genera una carga de revision muy alta y desaconseja su uso en produccion.
- Toxicidad como proxy de etica: el diagnostico con 2.000 elementos de Turkish toxic-language dio un F1 de 0,012, de modo que el modelo no sirve para medir riesgo etico por esa via.
- Cobertura linguistica limitada: optimizado para turco, con pruebas en ingles muy reducidas, lo que restringe la generalizacion fuera del turco.
- Dependencia de datos sinteticos: los patrones aprendidos provienen de ejemplos sinteticos controlados, lo que limita el comportamiento ante distribuciones reales.
- Evidencia por expresiones regulares fragil: el motor de politicas puede no detectar PII o secretos novedosos y, ademas, puede exponer fragmentos sensibles de la entrada, por lo que se desaconseja registrar texto crudo.
- Contexto corto: la truncacion a 96 tokens impide analizar documentos largos o conversaciones extensas, y el historial previo queda fuera del analisis.
- Restricciones de licencia: los pesos se publican bajo MIT, pero el modelo deriva de un backbone de terceros y usa un profesor con licencia Apache-2.0; conviene revisar las condiciones de esos artefactos antes de un uso comercial.
- Adopcion practicamente nula: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado el comportamiento en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xzwq/TrustLaya-S
- Repositorio de codigo y documentacion: https://github.com/ege-arhan/trustlaya-s
- Demo interactiva: https://huggingface.co/spaces/xzwq/TrustLaya-S-demo
- Modelo base: https://huggingface.co/ytu-ce-cosmos/turkish-medium-bert-uncased
- Profesor debil (laya): https://huggingface.co/convaiinnovations/laya
- Informe de evaluacion: https://github.com/ege-arhan/trustlaya-s/blob/main/reports/evaluation.json
- Analisis de evaluacion independiente: https://github.com/ege-arhan/trustlaya-s/blob/main/docs/external_evaluation.md
- Limitaciones: https://github.com/ege-arhan/trustlaya-s/blob/main/docs/limitations.md
- Benchmarks en el edge: https://github.com/ege-arhan/trustlaya-s/blob/main/benchmarks/edge.json
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Dataset Rogue Security de casos benignos: https://huggingface.co/datasets/rogue-security/real-world-benign-use-cases
- Dataset Turkish toxic-language: https://huggingface.co/datasets/Overfit-GM/turkish-toxic-language
- Dataset Turkish Privacy Filter: https://huggingface.co/datasets/yusuf-said/turkish-privacy-filter-dataset
- Dataset Prowl Secrets Corpus: https://huggingface.co/datasets/Podric/prowl-secrets-corpus
