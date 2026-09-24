# Zhongzhu/tunekv-toolathlon-qwen3-coder-30b

## Resumen

tunekv-toolathlon-qwen3-coder-30b es un artefacto de cache KV de prefijo (prefix KV) entrenado por el usuario Zhongzhu sobre el modelo Qwen3-Coder-30B-A3B-Instruct. No se trata de un modelo de lenguaje completo con pesos propios, sino de un conjunto de tensores de atencion (`model.layers.{0..47}.self_attn.attn.rank0.safetensors`) que sustituyen el estado de cache de las 48 capas del modelo base para un prefijo fijo de 675 tokens bajo el tokenizador del estudiante.

El artefacto esta asociado a la cabeza fija "terminus-2" del banco de pruebas Toolathlon y se entreno con 265 filas de exito generadas por un profesor (GLM-5.3), usando entropia cruzada (CE) sobre inicializacion de captura, sin termino KL, durante 248 pasos segun la configuracion `toolathlon_prefixkv_a.yaml`. El resultado se sirve con vLLM mediante el conector `TuneKVConnector` (`tunekv_vllm.dense`), con `save_mode=false` y tensor parallel obligatoriamente igual a 1, ya que solo existen las shards de rank0.

Su relevancia es principalmente metodologica y de investigacion: demuestra un flujo de trabajo de "prefix KV tuning" para inyectar comportamiento aprendido en una cabeza concreta sin reentrenar el modelo base, y documenta la divergencia controlada entre el modelo base y el ajustado (bifurcacion a partir del token 8 sobre el prefijo compartido). Los resultados cuantitativos se remiten a los repositorios de datos y al documento PLAN.md §7, no incluidos en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefacto de cache KV de prefijo para el modelo base Qwen3-Coder-30B-A3B-Instruct; 48 capas de atencion (`model.layers.0..47.self_attn`) |
| Parametros totales | No aplicable al artefacto (0,1 GB de tensores KV en disco). Modelo base: 30B segun la nomenclatura de Qwen3-Coder-30B-A3B-Instruct |
| Parametros activos | Modelo base: aproximadamente 3B (sufijo A3B); no confirmado con cifra oficial en la informacion proporcionada |
| Longitud de contexto | No disponible. El artefacto cubre un prefijo fijo de 675 tokens bajo el tokenizador del estudiante (n_tune 672, alineado a 16) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.layers.{0..47}.self_attn.attn.rank0.safetensors`) mas fichero marcador `READY` |

## Arquitectura y entrenamiento

El artefacto reproduce el patron de un prefix tuning de cache KV: en lugar de modificar los pesos del transformer, se entrena el estado de clave/valor de las 48 capas de atencion del modelo base para un prefijo de entrada fijo. El span entrenado es la cabeza fija "terminus-2" del banco Toolathlon, con 675 tokens bajo el tokenizador del estudiante y 672 posiciones efectivamente optimizadas (n_tune alineado a 16). El resultado se publica como un unico artefacto fusionado de rango 0 con tensor parallel 1, acompanado de un fichero `READY` que actua como marcador de integridad.

El procedimiento de entrenamiento descrito en la model card es: 265 filas de exito del profesor GLM-5.3, funcion de perdida de entropia cruzada, inicializacion por captura y ausencia de termino KL, durante 248 pasos bajo la configuracion `toolathlon_prefixkv_a.yaml`. La verificacion incluye coincidencia de hashes SHA-256 por capa con el valor fijado en el servicio (`expected_artifact_sha256`; por ejemplo, L0 `047b9bba…` y L47 `9e2b8944…`), bifurcacion de las salidas base frente a las ajustadas a partir del token 8 sobre el prefijo compartido, y un comportamiento de evaluacion "far from base" segun el repositorio de datos. No se documentan en la informacion proporcionada innovaciones adicionales como decodificacion especulativa, atencion lineal ni estrategias hibridas.

## Capacidades

- Inyeccion de comportamiento especializado: el artefacto sustituye la cache KV del prefijo de 675 tokens para la cabeza fija terminus-2 del banco Toolathlon, de modo que el modelo servido reproduce la politica aprendida del profesor en ese punto de entrada concreto.
- Divergencia reproducible respecto al base: la model card documenta que las salidas del modelo base y del ajustado se bifurcan en el token 8 sobre el prefijo compartido, lo que permite medir el efecto del ajuste de forma aislada.
- Verificacion de integridad: cada capa publicada se puede validar contra su hash SHA-256 esperado, lo que habilita comprobaciones de cadena de suministro antes de servir.
- Capacidades heredadas del modelo base Qwen3-Coder-30B-A3B-Instruct (no verificadas en este artefacto): generacion y asistencia de codigo, tareas agenticas y uso de herramientas, segun la documentacion publica de Qwen3-Coder.
- Soporte de tool calling y flujos multi-paso: atribuible al modelo base por su orientacion a agentes, no al artefacto KV.
- Capacidades multilingues y de modo "thinking": no disponibles en la informacion proporcionada para este artefacto.
- Restriccion relevante: el artefacto no anade vision, audio ni modalidades adicionales, y no puede usarse sin el modelo base y sin el stack de servicio especifico.

## Casos de uso

- Reproduccion de experimentos de prefix KV tuning: cargar el artefacto con vLLM y `TuneKVConnector` en modo `save_mode=false` para replicar exactamente las condiciones del entrenamiento (`prefix_json` = `toolce/prefix.json`, `kv_dir` = `toolce/kv_tp1`) y validar los resultados publicados.
- Auditoria de integridad de artefactos: comparar el hash SHA-256 de cada una de las 48 capas contra `expected_artifact_sha256` antes de desplegar, util en pipelines de investigacion con requisitos de trazabilidad.
- Estudio de divergencia base frente a ajustado: medir en que punto y con que magnitud se separan las distribuciones de salida a partir del token 8, para cuantificar cuanto del comportamiento depende del prefijo inyectado.
- Investigacion sobre destilacion desde profesores propietarios: el flujo de 265 filas de exito de GLM-5.3 sin termino KL sirve como referencia metodologica para estudiar sobreajuste y deriva respecto al modelo base en datasets pequenos.
- Servicio de agentes de codigo en produccion con el modelo base: desplegar Qwen3-Coder-30B-A3B-Instruct como cabeza de un agente que llama herramientas, siempre que no se aplique el prefijo ajustado, dado que este ultimo degrada el comportamiento general.
- Benchmarking de cabezas de agente: integrar el artefacto en el arnes Toolathlon para comparar la cabeza terminus-2 ajustada contra alternativas entrenadas sobre el mismo modelo base.
- Evaluacion de restricciones de despliegue en TP=1: usar el artefacto como caso de prueba para medir requisitos de memoria y latencia de un modelo MoE de 30B servido en una sola GPU sin reparto de tensor parallel.
- Formacion y divulgacion tecnica: ilustrar con un caso real y verificable como se publica, versiona y sirve un artefacto de cache KV frente a un checkpoint completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite las puntuaciones, veredictos y filas a `Zhongzhu/tunekv-toolathlon-data` y a "multi-swe PLAN.md §7 (Toolathlon)", pero no incluye cifras numericas (MMLU, HumanEval, GSM8K ni metricas del banco Toolathlon) en el material proporcionado, por lo que no se presentan tablas comparativas.

## Requisitos de hardware

- Artefacto KV: 0,1 GB en disco y un consumo de VRAM marginal, dado que solo almacena la cache de 48 capas para 675 posiciones.
- Modelo base obligatorio: Qwen3-Coder-30B-A3B-Instruct, con 30B parametros totales. Estimaciones derivadas del recuento de parametros (no publicadas en la ficha): aproximadamente 60 GB en BF16/FP16, 30-32 GB en FP8 y 17-18 GB en cuantizacion de 4 bits para los pesos, mas la cache KV de la sesion.
- Restriccion critica de tensor parallel: la model card indica que TP debe ser 1 porque no existen shards de rank1. Esto impide repartir el modelo en varias GPU con tensor parallel, lo que fuerza a que los pesos del base quepan en una sola GPU (o a usar cuantizacion agresiva si se sirve junto al artefacto).
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16 en una sola GPU; A6000 48 GB o L40S 48 GB para FP8; RTX 4090 24 GB o RTX 5090 con cuantizacion de 4 bits, con margen ajustado.
- Compatibilidad con GPU de consumo: viable en tarjetas de 24 GB solo con cuantizacion de 4 bits y contexto reducido; no hay datos publicados de latencia ni throughput para confirmar cifras.
- Opciones de despliegue: vLLM con `TuneKVConnector` (`tunekv_vllm.dense`), `save_mode=false`, `prefix_json = toolce/prefix.json` y `kv_dir = toolce/kv_tp1`. No se documenta compatibilidad con llama.cpp, Ollama, TGI ni formatos GGUF para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zhongzhu/tunekv-toolathlon-qwen3-coder-30b | Artefacto de cache KV de prefijo (48 capas) | No aplicable (0,1 GB de tensores) | Prefijo fijo de 675 tokens | No disponible | Publicado en Hugging Face; 0 descargas, 0 likes |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | Modelo MoE de codigo y agentes | 30B totales, aproximadamente 3B activos | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en Hugging Face (coleccion Qwen3-Coder) |
| Qwen/Qwen3-Coder-480B-A35B-Instruct | Modelo MoE de codigo y agentes | 480B totales, 35B activos | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico en Hugging Face (coleccion Qwen3-Coder) |
| Zhongzhu/tunekv-toolathlon-qwen3.8-27b | Artefacto de cache KV de prefijo, base distinto | No aplicable | No disponible | No disponible | Publicado en Hugging Face |

No se dispone de datos de rendimiento comparado entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos no es posible determinar si se permite uso comercial, redistribucion o modificacion. Tratarlo como no apto para produccion hasta confirmarlo.
- No es un modelo autonomo: es un artefacto de cache KV que requiere el modelo base Qwen3-Coder-30B-A3B-Instruct y un stack de servicio especifico. No puede cargarse con herramientas estandar de inferencia.
- Dependencia de software no publico: el servicio requiere vLLM con `TuneKVConnector` (`tunekv_vllm.dense`). No se documenta en la informacion proporcionada que ese conector este publicado ni como obtenerlo.
- Restriccion de TP=1: no existen shards de rank1, por lo que el despliegue queda limitado a una sola GPU en lo que respecta al artefacto, con las implicaciones de memoria que ello conlleva.
- Prefijo fijo y acotado: solo cubre 675 tokens (672 optimizados) de la cabeza terminus-2. Fuera de ese prefijo el artefacto no aporta ninguna ventaja y puede interferir con el comportamiento normal del base.
- Dataset de entrenamiento muy reducido: 265 filas de exito de un unico profesor (GLM-5.3), lo que eleva el riesgo de sobreajuste a la distribucion concreta de esas trazas.
- Ausencia de termino KL: al no anclarse al modelo base, el ajuste puede degradar capacidades generales. La propia model card senala que el comportamiento evaluado queda "far from base".
- Riesgo de alucinacion heredado: el modelo base puede generar contenido incorrecto, y el ajuste sobre un dataset pequeno no mitiga ese riesgo, sino que puede acotarlo o agravarlo en el dominio entrenado.
- Idiomas y sesgos: no se declaran idiomas soportados ni analisis de sesgo; no hay garantias de comportamiento multilingue.
- Madurez y adopcion: 0 descargas y 0 likes en el momento de la consulta, repositorio de 0,1 GB y titulo marcado como "(private)" en la propia model card, lo que sugiere un artefacto de investigacion interna mas que una publicacion estable.
- Fechas de publicacion y actualizacion (2026-09-21 y 2026-09-23): verificar que el artefacto no ha sido reemplazado o retirado antes de integrarlo.
- Sin datos de latencia, throughput ni benchmarks: no es posible dimensionar un despliegue en produccion con la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zhongzhu/tunekv-toolathlon-qwen3-coder-30b
- Repositorio de datos asociado (puntuaciones, veredictos y filas): https://huggingface.co/Zhongzhu/tunekv-toolathlon-data
- Artefacto hermano con base distinta: https://huggingface.co/Zhongzhu/tunekv-toolathlon-qwen3.8-27b
- Repositorio GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Coleccion Qwen3-Coder en Hugging Face: https://huggingface.co/collections/Qwen/qwen3-coder
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Imagen Docker `ai/qwen3-coder`: https://hub.docker.com/r/ai/qwen3-coder
