# SZLHOLDINGS/doctrine-v2-r2-trained

## Resumen

doctrine-v2-r2-trained es un adaptador LoRA (QLoRA, r=16, alpha=32) entrenado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. No es un modelo autónomo: se distribuye como adaptador PEFT en safetensors y requiere cargar el modelo base para su uso. Su propósito declarado no es la generación de texto generalista, sino la investigación en medición de honestidad y comportamiento de abstención (abstention), dentro de un marco que el autor denomina "estate" y que publica cada ejecución de entrenamiento y evaluación en un registro encadenado por hash.

El entrenamiento se realizó sobre el dataset SZLHOLDINGS/abstention-doctrine-sft-v1 durante 200 pasos en una NVIDIA RTX A6000 (48 GB). El autor reporta una puntuación de 3/6 en una "honesty battery" de seis pruebas fijas, sin verificación independiente (verified: false en el model-index). La model card presenta el resultado como un contraste curricular: cinco de las seis variantes evaluadas se sitúan en 3/6 y solo la variante "quant" (honestidad temporal) alcanza 5/6, por encima del umbral de 4/6 que el autor denomina "the agent bar".

La relevancia del modelo es, por tanto, acotada y experimental: sirve como punto de datos en una hipótesis sobre si el "suelo de confabulación" puede modificarse mediante entrenamiento en honestidad con encuadre temporal a escalas pequeñas. No está pensado para despliegue en producción sin verificación de compuertas y el propio autor lo excluye de aplicaciones críticas de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B) con adaptador LoRA/QLoRA (r=16, alpha=32) |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); el adaptador añade un numero no especificado de parametros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende de Qwen3-1.7B) |
| Tipos de cuantizacion | Entrenamiento en QLoRA (cuantizacion del base durante el entrenamiento); tipos de cuantizacion para inferencia no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base Qwen/Qwen3-1.7B en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parametros. El metodo de ajuste es QLoRA con rango 16 y alpha 32, lo que implica que el modelo base se carga cuantizado durante el entrenamiento y solo se actualizan las matrices de bajo rango insertadas en las capas. El entrenamiento consta de 200 pasos sobre el dataset SZLHOLDINGS/abstention-doctrine-sft-v1, ejecutado en una unica NVIDIA RTX A6000 de 48 GB con driver 595.99.02. No se especifican el numero de tokens vistos, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion declarada no es arquitectonica sino metodologica: el autor enuncia la "Confabulation Conjecture", segun la cual el suelo de confabulacion solo se desplaza mediante entrenamiento en honestidad con encuadre temporal y a escalas pequenas, y que el mecanismo es fragil (depende de la combinacion exacta de modelo base, tamano y dosis de entrenamiento). El modelo forma parte de un "estate" que registra cada ejecucion en una cadena de recibos publica con mas de 255 entradas, accesible mediante un explorador y un SDK en PyPI.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-1.7B.
- Comportamiento de abstención: el ajuste se orienta a que el modelo decline responder cuando no dispone de base suficiente, segun la doctrina de entrenamiento del autor.
- Honestidad medida: incluye una bateria de seis pruebas fijas ("honesty battery") con puntuacion reportada de 3/6.
- Encuadre temporal: la variante "quant" del contraste curricular aborda honestidad temporal, con 5/6 declarado.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en medicion de honestidad: el adaptador sirve como sujeto de prueba para comparar tasas de abstención y confabulación frente al modelo base sin ajustar, usando la bateria de seis pruebas como referencia reproducible.
- Evaluacion de comportamiento de abstención: util para construir pipelines que detecten cuando un modelo pequeño declina responder y correlacionarlo con la correccion factual de la respuesta.
- Reproduccion de experimentos de ajuste QLoRA: con 200 pasos y un solo A6000, el setup es replicable en laboratorios con recursos moderados y sirve para validar la hipotesis de fragilidad del mecanismo.
- Auditoria de linaje de entrenamiento: el registro encadenado por hash permite trazar que datos, ejecuciones y evaluaciones produjeron el adaptador, lo que resulta util en estudios de gobernanza de IA.
- Estudio de contraste curricular: comparar las seis variantes del curriculum (base, abstn, code, doctr, measr, reasn) permite analizar que tipo de datos mueve la aguja de la honestidad y cual no.
- Docencia y formacion: como ejemplo didactico de adaptadores PEFT, carga con transformers + peft y evaluacion con baterias fijas en cursos de ajuste fino.
- Prototipado de asistentes con politica de abstención: en entornos controlados, para probar interfaces que prefieran "no lo se" a una respuesta inventada, siempre con verificacion de compuertas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Verificado | Notas |
|---|---|---|---|
| honesty-battery | 3/6 | No (verified: false) | Bateria de seis pruebas fijas definida por el autor |

Contraste curricular reportado en la model card (puntuacion sobre 6): base 3, abstn 3, code 3, doctr 3, measr 3, reasn 3, quant 5. El autor situa el umbral "agent bar" en 4/6. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en bfloat16 ocupa aproximadamente 3,4 GB de pesos; con overhead de activaciones y cache KV, el consumo tipico se situa en torno a 4-6 GB para contextos moderados. El adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; el entrenamiento reportado uso una NVIDIA RTX A6000 (48 GB).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En GPUs de 8 GB puede requerir cuantizacion del base.
- Opciones de despliegue: transformers + peft (ruta oficial de la model card), y previsiblemente vLLM, TGI o llama.cpp tras fusionar el adaptador con el base y convertir a GGUF; estas ultimas rutas no estan documentadas por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| doctrine-v2-r2-trained (este) | 1,7 B (base) + LoRA | No disponible | Apache 2.0 | safetensors (adaptador PEFT) | Ajuste QLoRA de 200 pasos orientado a honestidad y abstención; 3/6 en bateria propia |
| Qwen/Qwen3-1.7B | 1,7 B | No disponible en esta ficha | Apache 2.0 | safetensors | Modelo base sin ajustar; el contraste curricular le asigna 3/6 en la misma bateria |
| Alternativas de ~1-2 B para abstención | No disponible | No disponible | No disponible | No disponible | No se identifican en la informacion proporcionada adaptadores comparables de honestidad medible |

No se dispone de datos de benchmarks estandar que permitan una comparacion cuantitativa con otras familias de modelos del mismo tamano.

## Limitaciones y advertencias

- La evaluacion se basa en seis pruebas fijas, no en una bateria comprehensiva; el propio autor lo reconoce.
- Es un adaptador LoRA, no un modelo independiente: sin el base Qwen/Qwen3-1.7B no funciona.
- Constituye un unico punto de datos en el contraste curricular; no permite conclusiones generales sobre la hipotesis de confabulacion.
- La puntuacion 3/6 figura como no verificada (verified: false) en el model-index.
- Riesgo de alucinacion: inherente al modelo base; el ajuste busca reducirlo pero no lo elimina.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base y los del dataset de ajuste.
- Limitaciones de contexto e idioma: no documentadas; dependen de Qwen3-1.7B.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor excluye explicitamente el despliegue en produccion sin verificacion de compuertas y las aplicaciones criticas de seguridad.
- No se reclama validacion biologica alguna; el autor lo declara fuera de alcance.
- El ecosistema que lo rodea (ledger, SDK, dominio) es propio del autor y no ha sido auditado de forma independiente en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/doctrine-v2-r2-trained
- Dataset de recibos (frontier-54-runs): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Explorador de la cadena: https://szlholdings-szl-receipts-chain.hf.space
- SDK szl en PyPI: https://pypi.org/project/szl/
- Sitio del autor: https://a-11-oy.com
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
