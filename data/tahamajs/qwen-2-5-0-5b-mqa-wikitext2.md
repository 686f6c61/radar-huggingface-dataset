# tahamajs/qwen-2.5-0.5b-mqa-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-mqa-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atencion del decodificador por una implementacion de Multi-Query Attention (MQA) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. Lo desarrolla el usuario `tahamajs` como parte de un "Attention Zoo" orientado a estudiar variantes de atencion subcuadratica sobre modelos pequenos. No es un modelo de proposito general, sino un artefacto de investigacion para comparar topologias de atencion bajo un mismo backbone.

El modelo conserva la arquitectura base de Qwen2.5-0.5B (transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV, `head_dim=64`) pero reemplaza 18 de las 24 capas con atencion MQA (una sola cabeza KV compartida por las 14 cabezas de consulta), manteniendo 6 capas cuadraticas completas como anclas en los indices `[3, 7, 11, 15, 19, 23]` bajo el patron `hybrid_3_1`. Tras la sustitucion, el autor aplica una destilacion de conocimiento en dos etapas para recuperar la calidad perdida, partiendo de una perplejidad catastrofica de 541.890 y llegando a 205,89 en el split de validacion de WikiText-2.

Su relevancia es metodologica: demuestra que una intervencion agresiva en el mecanismo de atencion (reduccion del KV-cache por un factor de 14 en las capas sustituidas) puede recuperarse parcialmente mediante KD por capas, con un coste de entrenamiento de solo 517 pasos y 180 segundos en una unica GPU. El resultado, sin embargo, esta lejos de la calidad del modelo base y solo se ha evaluado en ingles sobre un corpus enciclopedico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion hibrida: 18/24 capas con Multi-Query Attention (MQA) y 6/24 capas con atencion cuadratica completa; patron `hybrid_3_1` |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el checkpoint publicado contiene solo pesos de atencion, 82,27 MB en `attention_weights.safetensors`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento de KD uso `seq_len=512`; el modelo base Qwen2.5-0.5B soporta contextos mayores, pero el autor no lo declara para este checkpoint) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en safetensors FP16; no se publican versiones GGUF ni cuantizaciones) |
| Idiomas soportados | ingles (`en` declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 82,27 MB) mas `config.json` y `tokenizer.json`; requiere el modelo base `Qwen/Qwen2.5-0.5B` para cargarse |

## Arquitectura y entrenamiento

El backbone es el transformer decoder-only de Qwen2.5-0.5B: 24 capas, `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV (GQA con factor 7) y `head_dim=64`. La intervencion sustituye la atencion en 18 capas por `MultiQueryAttention`, una variante de GQA con exactamente una cabeza KV compartida por todas las cabezas de consulta (Shazeer, 2019), lo que reduce el KV-cache en un factor de 14 en esas capas y disminuye las lecturas de memoria en inferencia. El adaptador `QwenAttentionAdapter` gestiona la expansion 14:2 de las cabezas KV y aplica un contrato de `o_proj` unico. Las 6 capas restantes conservan atencion cuadratica completa como anclas, intercaladas en el patron 3:1.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineamiento con backbone congelado, 157 pasos, 54,3 s) omite el `lm_head` y minimiza MSE y coseno sobre estados ocultos por capa con peso 0,25. La etapa 2 (KD multi-capa de representaciones, 360 pasos, 125,8 s) repite el esquema con peso 0,50. En total, 517 pasos y 180,3 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de 12.234 MB de VRAM en FP16 con parametros maestros en FP32. La perplejidad causal paso de 541.890,55 antes de la KD a 205,89 tras ella, una recuperacion de mas de tres ordenes de magnitud, aunque muy por encima de la del modelo base original.

## Capacidades

- Generacion de texto autoregresiva causal en ingles, con soporte de `supports_causal` confirmado en el perfil del modulo.
- Soporte de atencion bidireccional y cross-attention a nivel de modulo (`supports_bidirectional`, `supports_cross_attention`), aunque el checkpoint publicado esta entrenado para generacion causal.
- Soporte nativo de RoPE (`supports_rope`) y de GQA (`supports_gqa`) en la implementacion del modulo.
- Operador de atencion personalizado (`is_custom_attention: Yes`), lo que permite integrarlo en el registro de NeuralOps.
- Conversacional basico heredado del tokenizer y la configuracion de Qwen2.5-0.5B, aunque el ajuste con KD sobre WikiText-2 no refuerza instrucciones ni dialogo.
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Investigacion comparativa de mecanismos de atencion: sirve como punto de medida controlado para estudiar el impacto de MQA frente a GQA y atencion completa sobre el mismo backbone, usando la perplejidad en WikiText-2 como metrica de referencia.
- Prototipado de inferencia con KV-cache reducido: util para validar en una GPU de consumo el ahorro de memoria que aporta compartir una unica cabeza KV en 18 de las 24 capas, antes de escalar el diseno a modelos mayores.
- Reproduccion de experimentos de destilacion de conocimiento: el repositorio documenta las dos etapas, hiperparametros y tiempos, lo que permite replicar el pipeline de KD por capas sobre otros backbones pequenos.
- Benchmarking de pipelines de "attention surgery": sirve para probar la herramienta `apply_qwen_attention_surgery` y el adaptador `QwenAttentionAdapter` en entornos de investigacion antes de aplicarlos a modelos de mayor tamano.
- Generacion de texto de baja exigencia en ingles sobre dominios enciclopedicos: puede emplearse para tareas exploratorias de continuacion de texto donde la calidad no sea critica y el objetivo sea medir latencia o consumo de VRAM.
- Docencia y divulgacion: ejemplo didactico de como una intervencion arquitectonica degrada drasticamente la perplejidad y como la KD recupera parte del rendimiento, con cifras concretas de delta y pasos de entrenamiento.

## Benchmarks y rendimiento

| Modelo | Tarea | Dataset | Metrica | Valor |
|---|---|---|---|---|
| qwen-2.5-0.5b-mqa-wikitext2 | Causal Language Modeling | wikitext-2-raw-v1 (validation) | Perplejidad | 205,89 |
| qwen-2.5-0.5b-mqa-wikitext2 (Stage 0, pre-KD) | Causal Language Modeling | wikitext-2-raw-v1 | Perplejidad | 541.890,55 |

Los valores proceden del `model-index` de la model card y no estan verificados (`verified: false`). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP16 ocupa aproximadamente 1 GB (0,5 mil millones de parametros); con el tokenizer y overhead de runtime, cabe holgadamente en 2-4 GB de VRAM.
- El entrenamiento de KD reporto un pico de 12.234 MB en FP16 con parametros maestros en FP32, lo que da una referencia del coste de reentrenamiento.
- GPU recomendadas: cualquier GPU consumer moderna sirve para inferencia (RTX 3060 12 GB, RTX 4060, RTX 4090); para reentrenar la KD, una GPU con al menos 16 GB (RTX 4080, RTX 4090, A100) es suficiente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas.
- Opciones de despliegue: la carga requiere el paquete `neuralops` (`load_surgeried_model`) o el flujo manual con `transformers` + `apply_qwen_attention_surgery` + `safetensors`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos GGUF no es desplegable directamente en llama.cpp u Ollama sin conversion adicional.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-mqa-wikitext2 | 0,5 B (18/24 capas MQA) | no disponible | 205,89 (validation) | MIT | Hugging Face, requiere `neuralops` |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B (GQA 14:2) | 32.768 tokens segun la documentacion oficial de Qwen2.5 | no disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` estandar |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5 B (GQA 14:2) | 32.768 tokens segun la documentacion oficial de Qwen2.5 | no disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` estandar |

La comparativa directa de perplejidad con el modelo base no es posible con los datos proporcionados, ya que el autor solo reporta la metrica del checkpoint destilado. Cualquier modelo de ~0,5 B con atencion GQA estandar (por ejemplo, la familia Qwen2.5-0.5B) ofrece mejor calidad esperada, mayor ecosistema de herramientas y licencia Apache 2.0, mientras que este checkpoint prioriza el estudio del mecanismo de atencion sobre el rendimiento bruto.

## Limitaciones y advertencias

- Perplejidad de 205,89 en WikiText-2, muy superior a la esperable en un modelo de 0,5 B entrenado de forma convencional; la calidad de generacion es baja y no apta para produccion.
- Entrenado exclusivamente sobre WikiText-2 en ingles; el vocabulario y la distribucion de datos limitan el modelo a texto enciclopedico en ese idioma.
- No se han publicado evaluaciones de sesgo, toxicidad ni alucinacion; al ser un modelo pequeno y con KD limitada, el riesgo de alucinacion y de texto incoherente es alto.
- El checkpoint publicado contiene solo pesos de atencion (`attention_weights.safetensors`); requiere descargar el modelo base Qwen2.5-0.5B y aplicar la cirugia con el paquete `neuralops`, lo que anade dependencias no estandar al despliegue.
- No hay pesos GGUF ni cuantizaciones publicadas, por lo que no es directamente utilizable en llama.cpp, Ollama o LM Studio.
- Licencia MIT declarada por el autor, pero el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0; conviene verificar la compatibilidad de la licencia derivada antes de un uso comercial.
- El autor no declara la longitud de contexto efectiva del checkpoint; el entrenamiento de KD uso `seq_len=512`, por lo que no hay garantia de comportamiento correcto mas alla de esa ventana.
- Resultados de benchmark no verificados (`verified: false`) y sin comparacion con el modelo base en las mismas condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-mqa-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper de Multi-Query Attention (Shazeer, 2019): https://arxiv.org/abs/1911.02150
