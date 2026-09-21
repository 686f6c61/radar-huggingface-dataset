# vkovtun/llama-text-to-sql-2026-09-21_21.42.17-finetune-QLORA

## Resumen

`vkovtun/llama-text-to-sql-2026-09-21_21.42.17-finetune-QLORA` es un ajuste fino del modelo instructivo `meta-llama/Llama-3.2-3B-Instruct` orientado a la generacion de consultas SQL a partir de lenguaje natural (text-to-SQL). El autor es el usuario de HuggingFace `vkovtun` y el entrenamiento se ha realizado mediante SFT (supervised fine-tuning) con la libreria TRL, segun indica la propia model card. El repositorio tiene 0.8 GB, un tamano compatible con pesos de adaptador o con un checkpoint cuantizado, no con los pesos completos en precision de 16 bits de un modelo de 3.000 millones de parametros.

El modelo hereda la arquitectura decoder-only tipo transformer de Llama 3.2, con 3.210 millones de parametros y atencion con grouped-query attention (GQA). Se trata de un checkpoint denso, no de una mezcla de expertos, por lo que no hay parametros activos separados. El contexto maximo heredado del modelo base es de 128.000 tokens, aunque la model card no lo confirma explicitamente para este ajuste.

Su relevancia practica es limitada y hay que ser honesto al respecto: el repositorio no publica resultados de evaluacion, no declara licencia concreta (el campo aparece como `licence: license`, un marcador de posicion), no detalla el dataset de entrenamiento y acumula cero descargas y cero likes en el momento de redactar esta ficha. Es interesante como ejemplo de pipeline QLoRA + TRL reproducible (incluye enlace al run de Weights & Biases), pero no deberia adoptarse en produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.2), con grouped-query attention |
| Parametros totales | 3.210 millones (heredados del modelo base, no confirmados en la model card) |
| Longitud de contexto | 128.000 tokens segun el modelo base; no confirmado para este ajuste en la model card |
| Tipos de cuantizacion | No disponible. El nombre del repositorio indica entrenamiento con QLoRA, pero no se especifican los formatos de cuantizacion publicados |
| Idiomas soportados | No disponibles en la model card. El modelo base declara soporte oficial para 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y thai) |
| Licencia | No disponible. El campo de la model card contiene el marcador de posicion `licence: license`. Se heredan las restricciones de la Llama 3.2 Community License del modelo base |
| Formato de pesos | safetensors (etiqueta del repositorio). No se publican GGUF ni otros formatos |
| Tamano del repositorio | 0.8 GB |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Libreria | transformers |
| Fecha de creacion | 21 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 3.210 millones de parametros con normalizacion RMSNorm, activacion SwiGLU, codificacion posicional RoPE y grouped-query attention para reducir el coste de la cache KV durante la inferencia. No hay innovaciones arquitectonicas propias de este checkpoint; el ajuste no introduce cambios estructurales, solo actualiza pesos (o anade adaptadores) sobre el modelo instructivo.

El entrenamiento se realizo con SFT mediante TRL 1.12.0, sobre Transformers 5.16.1, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, la longitud de secuencia, el rango de LoRA, la tasa de aprendizaje ni el numero de epocas. Tampoco menciona fases de RLHF ni DPO posteriores al SFT. El unico artefacto de trazabilidad disponible es el run de Weights & Biases enlazado en la propia model card, bajo el proyecto `llama-text-to-sql`. El nombre del repositorio y del proyecto indican que el corpus es de tipo text-to-SQL, pero su procedencia y licencia son desconocidas.

## Capacidades

- Generacion de consultas SQL a partir de enunciados en lenguaje natural, que es el objetivo declarado por el nombre del repositorio y del proyecto de entrenamiento.
- Generacion de texto general, razonamiento basico y comprension de instrucciones, heredados del modelo base instructivo.
- Soporte de conversacion multi-turno mediante plantilla de chat (`role: user`, `role: assistant`), tal y como muestra el ejemplo de uso con `pipeline` de Transformers.
- Capacidades multilingues heredadas del modelo base (8 idiomas oficiales), no verificadas para este ajuste.
- Tool calling y function calling: el modelo base Llama 3.2 Instruct soporta invocacion de funciones, pero la model card no documenta ni valida esta capacidad tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Vision, audio o modo de razonamiento explicito (thinking): no disponibles en este modelo.

## Casos de uso

- Prototipado de asistentes text-to-SQL en analitica interna: el modelo puede convertir preguntas de negocio en consultas sobre un esquema dado y servir de base para un sistema de consulta en lenguaje natural sobre un almacen de datos, siempre que se valide el SQL generado antes de ejecutarlo.
- Generacion asistida de consultas en herramientas de BI: integrado como autocompletado o sugerencia dentro de un editor SQL, apoyandose en la ventana de contexto del modelo base para incluir el DDL de las tablas implicadas.
- Docencia y aprendizaje de SQL: el modelo puede explicar o traducir enunciados a consultas en entornos formativos, con supervision humana obligatoria para evitar ensenar SQL incorrecto.
- Generacion de datos sinteticos de entrenamiento: usar el checkpoint para producir pares pregunta-SQL que alimenten posteriores iteraciones de ajuste o evaluacion, filtrando por ejecucion contra una base de datos real.
- Base para un ajuste especifico de dominio: al ser un modelo de 3.000 millones de parametros, es viable reentrenarlo o continuar su ajuste con QLoRA en una unica GPU consumer para adaptarlo al dialecto SQL y al esquema de una organizacion concreta.
- Evaluacion comparativa de pipelines QLoRA: sirve como referencia reproducible de un flujo TRL + SFT para medir el impacto de hiperparametros de cuantizacion en tareas estructuradas.
- Migracion y traduccion entre dialectos SQL: tareas de reescritura de consultas entre PostgreSQL, MySQL o BigQuery, sujetas a verificacion sintactica y semantica.
- Experimentacion en investigacion sobre text-to-SQL de bajo coste: por su tamano, permite iterar rapido en laboratorios con recursos limitados, comparando contra modelos mayores sin necesidad de infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, Spider, BIRD ni de ninguna otra evaluacion, y el repositorio tampoco aporta un script de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia (calculos propios a partir de los 3.210 millones de parametros, no publicados por el autor):
  - FP16/BF16: aproximadamente 6,5 GB solo de pesos, mas cache KV; en la practica 8-10 GB para contextos cortos.
  - INT8: aproximadamente 3,5 GB de pesos.
  - INT4 (bitsandbytes o GPTQ/AWQ): aproximadamente 2-2,5 GB de pesos.
- Cache KV: con la ventana de 128.000 tokens del modelo base, la cache puede superar con holgura el tamano de los propios pesos. Para contextos largos conviene usar GQA-aware serving, cache cuantizada o limitar la longitud efectiva.
- GPU recomendadas: para FP16, una RTX 4090 (24 GB), L40S o A100 40 GB permiten margen amplio; para INT4 basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en cuantizacion de 4 bits, y en tarjetas de 12-16 GB sin cuantizar o con cuantizacion de 8 bits.
- Opciones de despliegue: Transformers con `pipeline` (unico metodo documentado en la model card), vLLM o TGI para serving con batching, y llama.cpp u Ollama si se convierte previamente a GGUF, conversion que el autor no ha publicado.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo, TTFT ni comportamiento bajo batching.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus especificaciones publicas, no de una evaluacion conjunta con este checkpoint. No existe comparacion de rendimiento en tareas text-to-SQL porque el modelo no publica resultados.

| Modelo | Parametros | Contexto | Licencia | Orientacion | Disponibilidad |
|---|---|---|---|---|---|
| vkovtun/llama-text-to-sql (este) | 3.210 M | 128.000 (heredado, no confirmado) | No declarada; sujeta a Llama 3.2 Community License | Text-to-SQL mediante ajuste QLoRA | Repositorio publico, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3.210 M | 128.000 | Llama 3.2 Community License | Instrucciones generales, punto de partida de este ajuste | Ampliamente disponible |
| Qwen2.5-Coder-3B-Instruct | 3.090 M | 32.768 | Apache-2.0 | Codigo y SQL, con licencia permisiva | Ampliamente disponible |
| Phi-3.5-mini-instruct | 3.800 M | 128.000 | MIT | Instrucciones generales | Ampliamente disponible |
| defog/sqlcoder-7b-2 | 7.000 M | 16.000 aprox. | CC-BY-NC-4.0 (no comercial) | Text-to-SQL especializado | Disponible, comunidad consolidada |

La ventaja comparativa de este checkpoint seria la licencia permisiva de su modelo base frente a alternativas como SQLCoder, pero esa ventaja queda en entredicho porque la licencia del ajuste no esta declarada y no hay evidencia de que supere a un modelo generalista del mismo tamano sin ajustar.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay metricas de exact match, validez de ejecucion ni comparacion con baselines, por lo que no se puede afirmar que el ajuste mejore al modelo base en text-to-SQL.
- Licencia no declarada: el campo de la model card contiene el literal `license`, sin identificador SPDX. Esto impide determinar si el uso comercial esta permitido. Ademas, al derivar de Llama 3.2, se aplican la Llama 3.2 Community License, sus requisitos de atribucion ("Built with Llama") y la restriccion para productos con mas de 700 millones de usuarios mensuales.
- Dataset de entrenamiento desconocido: no se indica procedencia, tamano ni licencia de los datos, lo que anade riesgo juridico si el corpus incluia esquemas o consultas propietarias.
- Riesgo de alucinacion: en text-to-SQL, la alucinacion se manifiesta como tablas, columnas o funciones inexistentes. Es imprescindible validar el SQL generado contra el esquema real y ejecutarlo en un entorno de solo lectura.
- Riesgo de inyeccion SQL: si la salida del modelo se ejecuta sin parametrizacion ni revision, un prompt malicioso podria inducir consultas destructivas.
- Documentacion auto-generada: el ejemplo de inicio rapido plantea una pregunta generica sobre viajes en el tiempo, ajena al dominio SQL, lo que sugiere que la model card se genero automaticamente a partir de la plantilla de TRL y no fue revisada por el autor.
- Idiomas no documentados: no se especifica que idiomas cubre el ajuste. Aunque el modelo base soporta espanol, el corpus de ajuste podria estar solo en ingles, degradando el rendimiento en otros idiomas.
- Trazabilidad escasa: la unica fuente adicional es un run de Weights & Biases. No hay paper, informe tecnico ni repositorio de codigo.
- Adopcion nula: cero descargas y cero likes implican que no existe validacion por parte de la comunidad ni reportes de errores.
- Fecha del repositorio: los metadatos indican septiembre de 2026, una fecha anomala que conviene verificar antes de citar el modelo.
- Tamano y ventana efectiva: aunque el modelo base anuncie 128.000 tokens de contexto, incluir esquemas de bases de datos extensos consume ventana con rapidez, y la calidad del ajuste en contextos largos no esta verificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vkovtun/llama-text-to-sql-2026-09-21_21.42.17-finetune-QLORA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Run de entrenamiento en Weights & Biases: https://wandb.ai/viktor-kovtun/llama-text-to-sql/runs/1n1vug3d
- Repositorio de TRL: https://github.com/huggingface/trl
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo, su dataset o sus resultados. Los unicos enlaces utiles son los incluidos en la propia model card y los metadatos de HuggingFace.
