# thealper2/mlx-apertus-1.5b-bank-budget

## Resumen

`thealper2/mlx-apertus-1.5b-bank-budget` es un adaptador LoRA publicado en HuggingFace para el modelo base `swiss-ai/Apertus-v1.1-1.5B-Instruct`, desarrollado por el usuario thealper2. Su proposito es concreto: clasificar cada linea de un extracto bancario estadounidense en una de 17 categorias presupuestarias (Restaurants, Groceries, Shopping, Transportation, Entertainment, Utilities, Subscription, Healthcare, Insurance, Mortgage, Rent, Travel, Education, Personal Care, Transfer, Income, Fees), de modo que sumando las lineas de un mes se obtenga un presupuesto por categoria.

El adaptador no es un modelo autonomo: el repositorio contiene unicamente `adapters.safetensors` y `adapter_config.json` en formato MLX-LM, y debe cargarse sobre la revision exacta `9e9d01154446a645d30f04174cf1515a38058be7` del modelo base. El modelo base Apertus es un transformer de 16 bloques, hidden size 2.048 y MLP con activacion xIELU, con 1.510 millones de parametros totales; el adaptador entrena 5,374 millones de parametros en las proyecciones de atencion y en el MLP de los 16 bloques.

La relevancia practica del artefacto esta en su documentacion de evaluacion: el adaptador eleva la exactitud de clasificacion del 9,2% al 77,5% en lineas de comercios nunca vistos en entrenamiento, y del 12,1% al 98,4% en lineas nuevas de comercios vistos. Es un ejemplo de ajuste fino pequeno (1000 pasos, batch 16, M1 de 8 GB) sobre un modelo de 1.5B para una tarea de dominio estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Apertus (16 bloques, hidden size 2.048, MLP xIELU) |
| Parametros totales | 1.510,019 M (modelo base); adaptador LoRA: 5,374 M entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; longitud maxima de secuencia en entrenamiento: 512 tokens |
| Tipos de cuantizacion | no disponible; pesos del adaptador en el formato MLX-LM (`adapters.safetensors`), base en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (el modelo base solicita ademas seguir la Apertus Acceptable Use Policy) |
| Formato de pesos | `adapters.safetensors` + `adapter_config.json` (MLX-LM); no incluye pesos del modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Apertus, un transformer denso de 16 bloques con hidden size de 2.048 y MLP con activacion xIELU. El ajuste fino es un LoRA de rango 8 y escala 20,0, sin dropout, aplicado a `self_attn.q_proj`, `self_attn.k_proj`, `self_attn.v_proj`, `self_attn.o_proj`, `mlp.up_proj` y `mlp.down_proj` de los 16 bloques. El entrenamiento se ejecuto con MLX-LM (mlx 0.32.4, mlx-lm 0.32.2) sobre un Apple M1 con 8 GB de memoria unificada, con un pico de 6,03 GB y un tiempo de pared de 14.554,78 segundos.

Los datos de entrenamiento provienen de `DoDataThings/us-bank-transaction-categories-v2` (licencia MIT), un conjunto de 68.000 lineas sinteticas de extractos bancarios estadounidenses en 17 categorias. Tras eliminar duplicados y textos con dos categorias distintas quedaron 45.692 lineas distintas. Se agruparon por comercio (eliminando envoltorios de pago como `SQ *`, `TST*`, `PYPL *`, numeros de tienda y direcciones) y se retuvieron grupos aleatorios hasta cubrir aproximadamente el 15% de las lineas de cada categoria: 182 de 964 grupos. Los splits resultantes son train 35.639, valid 850, test_new 1.700 y test_known 1.700. La perdida se calcula solo sobre la respuesta (mascara de prompt), con longitud maxima de 512 tokens, optimizador AdamW (betas 0,9/0,999, eps 1e-08, weight decay 0,01), learning rate 1e-4 con 20 pasos de warmup y decaimiento coseno hasta 1e-6 en 1000 actualizaciones, batch 16, semilla 0 y gradient checkpointing activado. La perdida final de entrenamiento fue 0,016 y la de validacion 0,009.

## Capacidades

- Clasificacion de lineas de extracto bancario estadounidense en una de 17 categorias presupuestarias, devolviendo el nombre de la categoria como texto.
- Distincion entre cargos (`[debit]`) y abonos (`[credit]`) mediante el prefijo de la linea de entrada.
- Generalizacion limitada a comercios no vistos: 77,5% de exactitud en el conjunto `test_new` (comercios retenidos).
- Alta exactitud en lineas nuevas de comercios vistos: 98,4% en `test_known`.
- Respuesta restringida a una unica categoria, sin texto adicional, gracias al system prompt de entrenamiento.
- Capacidades multilingues: no disponibles; el modelo esta entrenado y evaluado solo en ingles.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponibles en la informacion proporcionada; el adaptador esta especializado en una unica tarea de clasificacion.
- Vision y audio: no disponibles.

## Casos de uso

- Clasificacion automatizada de extractos personales: el adaptador procesa cada linea de un extracto mensual y la asigna a una categoria, permitiendo sumar el gasto por categoria y construir un presupuesto domestico sin intervencion manual linea a linea.
- Agregacion mensual de gasto por categoria: al devolver una etiqueta unica y estricta por linea, el resultado se agrega directamente en una tabla de presupuesto; el autor documenta un ejemplo con 31 lineas y 26 aciertos (83,9%).
- Prototipado de aplicaciones financieras personales: al ejecutarse con MLX en Apple Silicon, permite iterar localmente en un portatil con 8 GB de memoria unificada sin depender de APIs externas.
- Educacion y experimentacion con ajuste fino: sirve como caso de estudio reproducible de LoRA de rango 8 sobre un modelo de 1.5B, con hiperparametros, semilla y run id documentados.
- Preetiquetado con revision humana: el propio autor indica que una persona debe revisar el resultado; el adaptador puede usarse como primer paso de un flujo de etiquetado asistido en el que un humano corrige las lineas ambiguas.
- Evaluacion de la calidad de datos sinteticos: los conjuntos `test_new` y `test_known` permiten medir la brecha de generalizacion entre comercios vistos y no vistos, util para diagnosticar el sesgo de un generador sintetico de transacciones.

## Benchmarks y rendimiento

Evaluacion con decodificacion greedy, maximo 8 tokens nuevos y el mismo system prompt para el modelo base y el adaptador. Una respuesta sin ninguna de las 17 categorias cuenta como incorrecta.

| Test | Modelo base | Base + adaptador | Respuesta mas frecuente (base / adaptador) |
|---|---|---|---|
| 1.700 lineas de comercios nunca vistos en entrenamiento (`test_new`) | 157 / 1.700 (9,2%) | 1.317 / 1.700 (77,5%) | Utilities (1.557 veces) / Shopping (192 veces) |
| 1.700 lineas nuevas de comercios vistos (`test_known`) | 206 / 1.700 (12,1%) | 1.672 / 1.700 (98,4%) | Utilities (1.502 veces) / Groceries (104 veces) |
| Un mes de lineas de extracto ficticias (31) | 3 / 31 (9,7%) | 26 / 31 (83,9%) | Utilities (28 veces) / Restaurants (4 veces) |

El intervalo de confianza del 95% a 1.700 lineas es de hasta aproximadamente ±2,4 puntos porcentuales. Ambos conjuntos de test proceden del mismo generador sintetico que los datos de entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma desglosada; el entrenamiento completo (modelo base bf16 + adaptador + gradient checkpointing) alcanzo un pico de 6,03 GB en memoria unificada.
- Hardware de entrenamiento documentado: Apple M1 con 8 GB de memoria unificada, macOS 27.0, Python 3.12.15.
- GPU recomendadas: no disponibles en la informacion proporcionada; el adaptador esta empaquetado para MLX y su ejecucion esta orientada a Apple Silicon (Metal).
- Cabe en GPU de consumo: no confirmado para CUDA; el flujo documentado es MLX en Apple Silicon, donde el entrenamiento cupo en 8 GB unificados.
- Opciones de despliegue: MLX / MLX-LM como marco documentado. vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos de clasificacion de transacciones bancarias en la informacion proporcionada. La comparacion se limita a los dos estados del mismo modelo base:

| Modelo | Parametros | Contexto | Exactitud `test_new` | Exactitud `test_known` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Apertus-v1.1-1.5B-Instruct (base) | 1.510 M | no disponible | 9,2% | 12,1% | apache-2.0 | HuggingFace |
| Apertus-v1.1-1.5B-Instruct + este adaptador | 1.510 M + 5,374 M LoRA | no disponible (entrenamiento a 512 tokens) | 77,5% | 98,4% | apache-2.0 | HuggingFace |

Alternativas de la misma categoria (clasificadores de transacciones o adaptadores LoRA sobre modelos de 1-2B): no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con lineas sinteticas; los extractos reales contienen otros comercios, formatos y abreviaturas no representados en el dataset.
- Solo cubre extractos bancarios y tarjetas de Estados Unidos; no se ha validado con extractos de otros paises, idiomas o divisas.
- Solo ingles: el modelo base y el adaptador estan documentados unicamente para ese idioma.
- Brecha de generalizacion notable: 77,5% en comercios no vistos frente a 98,4% en comercios vistos, lo que indica dependencia del vocabulario de comercios del conjunto de entrenamiento.
- Sesgo de respuesta: en `test_new` la respuesta mas frecuente del adaptador es Shopping (192 veces sobre 1.700), lo que sugiere cierta sobrerrepresentacion de esa categoria en casos ambiguos.
- Riesgo de alucinacion: el modelo puede emitir una categoria incorrecta con aparente seguridad; el autor recomienda revision humana explicita.
- No apto para decisiones de credito, prestamos, fraude o impuestos, ni para contabilidad empresarial que requiera un plan de cuentas.
- El repositorio contiene solo el adaptador; requiere cargar la revision exacta del modelo base y no funciona como modelo autonomo.
- El modelo base solicita adicionalmente el cumplimiento de la Apertus Acceptable Use Policy, ademas de la licencia apache-2.0.
- Estado del proyecto: experimental y educativo; 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/thealper2/mlx-apertus-1.5b-bank-budget
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.1-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/DoDataThings/us-bank-transaction-categories-v2
- Revision del modelo base utilizada: `9e9d01154446a645d30f04174cf1515a38058be7`
- Revision del dataset utilizada: `3e8d052cb7b362fb1a04b6064d2331982553ea56`
- Papers, blogs, repositorios y demos adicionales: no disponibles en la informacion proporcionada.
