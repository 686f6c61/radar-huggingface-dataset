# tobiasoberrauch/Kolibri-1-mlx-4bit

## Resumen

Kolibri-1-mlx-4bit es una version cuantizada a 4 bits en formato MLX del modelo Aleph-Alpha/Kolibri-1, desarrollada por el usuario tobiasoberrauch para su ejecucion en Apple Silicon. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 78.103 millones de parametros totales y 3,46 mil millones de parametros activos por token, disenado nativamente para razonamiento en aleman e ingles. La cuantizacion a 4 bits reduce el peso en disco hasta aproximadamente 41 GB, lo que lo hace viable en equipos con memoria unificada alta en lugar de depender de GPUs de centro de datos.

El modelo base, Kolibri-1, es una release de Aleph Alpha orientada a procesamiento multilingue europeo, cumplimiento empresarial y tareas de razonamiento general. Su arquitectura combina atencion con ventana deslizante y atencion completa en una proporcion 4:1, junto con 384 expertos de los cuales 6 enrutados y 1 compartido se activan por token. Esta variante MLX mantiene el router sin cuantizar (bf16) y el sesgo de expertos en fp32, replicando el comportamiento de la release oficial en FP8.

La relevancia de esta ficha radica en que permite ejecutar localmente un MoE de casi 80.000 millones de parametros en hardware de consumo de Apple, algo inviable con los pesos en precision completa. El repositorio incluye un fichero de arquitectura propio (`kolibri1.py`) porque mlx-lm todavia no incorpora soporte nativo para la arquitectura kolibri1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atencion hibrida ventana deslizante/completa |
| Parametros totales | 78.103.055.360 (aproximadamente 78,1 B) |
| Parametros activos | 3,46 B por token |
| Longitud de contexto | no disponible (ventana deslizante de 512 tokens mas token actual en la atencion local; la longitud total no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | 4 bits MLX con tamano de grupo 64; router (`mlp.gate`) sin cuantizar en bf16; `expert_bias` en fp32 |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX, libreria mlx) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo Mixture-of-Experts con 384 expertos en total. Por cada token se activan 6 expertos enrutados mas 1 experto compartido, con enrutamiento top-6 calculado sobre `logits + expert_bias` y pesos derivados de `sigmoid(logits)` sin renormalizacion posterior. El mecanismo de atencion es hibrido en una proporcion 4:1: cuatro capas de ventana deslizante de 512 tokens mas el token actual con codificacion posicional RoPE, seguidas de una capa de atencion completa sin codificacion posicional. La red emplea "sandwich norms" tanto despues de la atencion como despues del bloque MoE.

Esta variante no ha sido reentrenada: es una conversion de `Aleph-Alpha/Kolibri-1-BF16` realizada con `mlx_lm.convert -q --q-bits 4 --q-group-size 64`. Por tanto, no aporta datos de entrenamiento propios (numero de tokens, composicion del dataset, RLHF o DPO) y hereda todas las decisiones de entrenamiento, incluida la alineacion por razonamiento, del modelo original de Aleph Alpha. La innovacion tecnica destacable de esta ficha esta en el port: al no existir soporte de la arquitectura `kolibri1` en mlx-lm, el autor incluye `kolibri1.py`, cargado mediante `"model_file"` en `config.json`, portado desde el plugin de vLLM de Aleph Alpha (`aleph-alpha-inference`). El port fue validado contra una referencia independiente en PyTorch de la semantica de vLLM sobre un checkpoint aleatorio pequeno, con un error relativo de aproximadamente 2e-6 tanto en el forward completo como en decodificacion con cache mas alla de la ventana deslizante.

## Capacidades

- Generacion de texto conversacional en aleman e ingles.
- Razonamiento con modo de pensamiento configurable mediante `reasoning_effort`, con valores `none`, `low`, `medium` y `high` (por defecto `high`).
- Razonamiento multi-paso, dado el tag `reasoning` declarado por el autor de la conversion.
- Arquitectura MoE orientada a tareas de razonamiento general y procesamiento multilingue europeo segun el modelo base.
- Generacion con decodificacion cacheada compatible con la ventana deslizante.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, vision, audio ni modalidades adicionales.
- Capacidades multilingues limitadas a aleman e ingles.

## Casos de uso

- Razonamiento asistido en local sobre Apple Silicon: un desarrollador puede ejecutar el modelo de 78 B totales en un Mac con memoria unificada suficiente, realizando consultas de razonamiento en aleman o ingles sin enviar datos a servicios externos.
- Procesamiento de documentos empresariales en aleman: al estar orientado a cumplimiento y procesamiento multilingue europeo, encaja en flujos de analisis y resumen de documentacion corporativa que requieren que los datos no salgan del equipo.
- Generacion de codigo asistida: aunque no se documenta tool calling, el modelo puede emplearse en tareas de generacion y explicacion de fragmentos de codigo mediante prompting directo, aprovechando su modo de razonamiento configurable.
- Investigacion sobre cuantizacion MoE: sirve como caso de estudio para medir el impacto de la cuantizacion a 4 bits en un MoE de 384 expertos, comparandolo con la release BF16 y FP8 original.
- Desarrollo de asistentes conversacionales en aleman: la plantilla de chat y los parametros de muestreo recomendados (temperatura 1.0, top_p 0.97, top_k 128) permiten integrarlo en prototipos de dialogo multi-turno.
- Entornos con restricciones de soberania de datos: al ejecutarse completamente en local con licencia Apache 2.0, es adecuado para organizaciones que deben evitar proveedores en la nube por motivos regulatorios.
- Validacion de ports de arquitecturas: el fichero `kolibri1.py` y su verificacion con error relativo ~2e-6 sirven de referencia para quien necesite portar la arquitectura kolibri1 a otros frameworks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion remite a la model card original de Aleph-Alpha/Kolibri-1 para las evaluaciones, pero dichos datos no se incluyen en la informacion proporcionada. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra metrica para esta variante cuantizada ni, en la informacion facilitada, para el modelo base.

## Requisitos de hardware

- Memoria unificada: aproximadamente 41 GB solo para los pesos, mas el espacio adicional necesario para la cache KV; el autor indica que se requiere al menos ese tamano de memoria unificada mas la cache.
- Hardware objetivo: equipos Apple Silicon (familia M) con memoria unificada suficiente para alojar los pesos y la cache KV.
- No cabe en GPUs de consumo con VRAM estandar de 24 GB, dado el tamano de aproximadamente 41 GB en disco.
- Despliegue: mediante la libreria mlx y mlx-lm; se instala con `pip install -U mlx-lm` y se ejecuta con `mlx_lm.generate` o con la API de Python (`load` y `generate`).
- No se documentan en la informacion disponible opciones de despliegue con vLLM, llama.cpp, Ollama o TGI para esta variante MLX concreta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| tobiasoberrauch/Kolibri-1-mlx-4bit | 78,1 B | 3,46 B | no disponible | Apache 2.0 | MLX 4 bits, Apple Silicon |
| nativ-community/Kolibri-1-MLX-4bit | no disponible | no disponible | no disponible | no disponible | MLX 4 bits, Apple Silicon |
| Aleph-Alpha/Kolibri-1-BF16 (base) | aproximadamente 78 B | 3,46 B | no disponible | Apache 2.0 | safetensors BF16 |
| Aleph-Alpha/Kolibri-1 (FP8 oficial) | aproximadamente 78 B | 3,46 B | no disponible | Apache 2.0 | FP8 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La diferencia principal entre ellas es la precision y el formato de pesos, no la arquitectura ni el numero de parametros.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; deben consultarse en la model card del modelo base Aleph-Alpha/Kolibri-1.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se documenta ningun mecanismo especifico de mitigacion en esta conversion.
- Limitaciones de idioma: el modelo solo declara soporte de aleman e ingles, por lo que su uso en otros idiomas, incluido el castellano, no esta garantizado.
- Limitacion de contexto: la atencion local usa una ventana deslizante de 512 tokens mas el token actual, lo que puede afectar a la coherencia en dependencias de largo alcance; la longitud de contexto total no se especifica.
- La cuantizacion a 4 bits puede degradar la calidad respecto a la release BF16 o FP8 original; no se aportan mediciones de dicha degradacion.
- Soporte de framework: mlx-lm no incluye la arquitectura `kolibri1` de forma nativa, por lo que el repositorio depende de un fichero `kolibri1.py` cargado dinamicamente; esto puede romper con actualizaciones futuras de mlx-lm.
- Licencia: Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Aleph-Alpha/Kolibri-1.
- Adopcion muy baja: el repositorio registra 0 descargas y 1 me gusta en el momento de la consulta, por lo que no hay validacion comunitaria amplia.
- Restriccion de hardware: no es ejecutable en la mayoria de GPUs de consumo habituales por el tamano de los pesos.

## Enlaces

- HuggingFace (esta variante): https://huggingface.co/tobiasoberrauch/Kolibri-1-mlx-4bit
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Variante alternativa en MLX 4 bits: https://huggingface.co/nativ-community/Kolibri-1-MLX-4bit
- Perfil de GitHub del autor: https://github.com/tobiasoberrauch
- MLX (libreria): https://github.com/ml-explore/mlx
- Plugin de inferencia de Aleph Alpha (origen del port): https://github.com/Aleph-Alpha/aleph-alpha-inference
- Repositorio colibri (motor de inferencia MoE en C): https://github.com/JustVugg/colibri
- Ficha de especificaciones y benchmarks de Kolibri 1 (terceros): https://apxml.com/models/kolibri-1
