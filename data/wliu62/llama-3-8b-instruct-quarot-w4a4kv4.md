# wliu62/Llama-3-8B-Instruct-QuaRot-W4A4KV4

## Resumen

Llama-3-8B-Instruct-QuaRot-W4A4KV4 es un artefacto de investigación publicado por el usuario wliu62 en HuggingFace. Consiste en un checkpoint de Meta-Llama-3-8B-Instruct sometido a una cuantización QuaRot en la configuración W4A4KV4 (pesos, activaciones y caché K/V en 4 bits), es decir, una de las condiciones de precisión más agresivas que se documentan para modelos de 8B. El objetivo declarado no es distribuir un modelo listo para producción, sino servir de base reproducible para un proyecto de reparación de seguridad en agentes cuantizados.

El artefacto forma parte de un traspaso de investigación vinculado al repositorio Safety Repair of Quantized Agent. Según la model card, los bytes originales del checkpoint cuantizado no se han modificado, no se ha aplicado destilación ni ningún proceso de reparación de seguridad, y no se trata de una publicación oficial de Meta ni de los autores del cuantizador. Se trata de una ejecución nativa estilo paper de QuaRot, identificada con el run `paperstyle-22914989-20261015T081845171928Z`.

La relevancia de este tipo de artefactos radica en que la cuantización a 4 bits en pesos, activaciones y caché KV reduce drásticamente los requisitos de memoria en inferencia, pero suele degradar la calidad y alterar el comportamiento del modelo. Este checkpoint pretende servir de referencia base ("baseline") para estudiar esos efectos y para desarrollar técnicas de reparación posteriores a la cuantización. No se ha realizado ninguna inferencia ni evaluación de benchmarks como parte de la subida, por lo que no debe interpretarse como un modelo validado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base Meta-Llama-3-8B-Instruct |
| Parametros totales | 8B (según el modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | W4A4KV4: pesos, activaciones y caché K/V a 4 bits. El checkpoint nativo se almacena en BF16 con cuantización falsa ("fake-quantized"), no empaquetado INT4 |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | `qmodel.pt` nativo (PyTorch), BF16 con cuantización simulada. No es safetensors, no es GGUF y no es un modelo autónomo de HuggingFace |
| Tamano del repositorio | 16.1 GB |
| Fecha de creacion | 2026-10-15 |
| Ultima actualizacion | 2026-10-15 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Meta-Llama-3-8B-Instruct, un transformer decoder-only de aproximadamente 8.000 millones de parámetros. Sobre ese modelo se ha aplicado la técnica QuaRot, que introduce rotaciones ortogonales (transformadas tipo Hadamard) para eliminar valores atípicos ("outliers") en las activaciones antes de la cuantización, permitiendo así cuantizar de forma agresiva pesos, activaciones y caché K/V a 4 bits. El código upstream empleado es el repositorio spcl/QuaRot, en el commit `5008669b08c1f11f9b64d52d16fddd47ca754c5a`, con un parche de código incluido.

Según la model card, el resultado es una ejecución nativa QuaRot estilo paper. El artefacto es un `qmodel.pt` con cuantización falsa ("fake-quantized") en BF16, no un INT4 empaquetado. El cargador del proyecto restaura las transformaciones en línea y los cuantizadores de activaciones y de K/V a partir de la receta congelada; el autor advierte explícitamente de que no se debe repetir GPTQ ni la rotación offline al cargarlo. Este checkpoint no ha sido validado como artefacto de destilación ni de entrenamiento: los gradientes de extremo a extremo y las actualizaciones de parámetros con conciencia de cuantización no se han validado. Tampoco se ha aplicado ninguna reparación de seguridad a esta línea base.

## Capacidades

La información proporcionada no documenta capacidades evaluadas de forma explícita. Al tratarse de un checkpoint derivado de Meta-Llama-3-8B-Instruct, las capacidades nominales heredadas serían las de un modelo de instrucciones de propósito general, pero no hay verificación empírica en esta ficha:

- Generación de texto e instrucciones en modo conversacional: heredado del modelo base, sin evaluación reportada en este artefacto.
- Razonamiento y matemáticas: no disponible (sin benchmarks publicados).
- Generación de código: no disponible (sin benchmarks publicados).
- Soporte de tool calling / function calling: no disponible para este artefacto.
- Soporte de agentes y razonamiento multi-paso: el proyecto de origen se orienta a agentes cuantizados, pero no se documentan capacidades específicas del checkpoint.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

El autor indica explícitamente que no se realizó ninguna inferencia como parte de la subida y que no se implica ningún estado de preparación para benchmarks.

## Casos de uso

- Investigación sobre cuantización extrema: usar este checkpoint como línea base para estudiar la degradación de calidad de Llama-3-8B-Instruct cuando pesos, activaciones y caché K/V se llevan a 4 bits, comparando con el modelo BF16 de referencia.
- Reparación de seguridad post-cuantización: el artefacto existe precisamente como baseline del proyecto Safety Repair of Quantized Agent, por lo que su uso principal es servir de punto de partida sin reparar frente a variantes que sí apliquen técnicas de reparación.
- Reproducibilidad de experimentos QuaRot: permite verificar la receta congelada, los transformadores en línea y los cuantizadores restaurados por el cargador del proyecto, con la PPL de WikiText-2 como referencia.
- Estudios de sensibilidad de la caché K/V: al incluir cuantización KV a 4 bits, es adecuado para medir cómo afecta la compresión de la caché a tareas de contexto largo o generación multi-turno.
- Auditoría de artefactos frente a modelos oficiales: útil para comparar un checkpoint de investigación no oficial frente al modelo base bajo condiciones de acceso controladas.
- Docencia y formación técnica: sirve como ejemplo práctico de artefacto nativo de cuantización que no cumple el formato estándar de HuggingFace, útil para ilustrar diferencias entre checkpoints de investigación y pesos empaquetados listos para despliegue.
- Desarrollo de tooling de carga: el repositorio incluye `src/safe_quant/model_loaders/` y un snapshot de `quantizers/QuaRot/`, lo que permite trabajar sobre los cargadores y el pipeline de evaluación en procesos nuevos.

Advertencia: los lanzadores y algunos manifiestos actuales contienen rutas específicas del clúster Delta, por lo que descargar solo este modelo no constituye una instalación portátil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K u otros). El único dato numérico reportado es una perplejidad nativa:

| Metrica | Valor | Condiciones |
|---|---|---|
| Perplejidad WikiText-2 (nativa) | 10.027104377746582 | 141 secuencias de longitud 2048 |

El autor subraya que esta cifra no es una reproducción exacta de la condición de modelo/precisión del paper de QuaRot, y que la validación del cargador de evaluación en proceso nuevo queda pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma validada para este artefacto. El checkpoint almacenado ocupa 16.1 GB en disco (BF16), por lo que cargarlo tal cual requiere al menos ese orden de memoria, además del espacio para las transformaciones en línea y los cuantizadores restaurados.
- GPU recomendadas: no disponibles en la información. El autor indica que las comprobaciones de humo ("smoke checks") requieren una GPU asignada y que, en el clúster Delta, debe usarse Slurm en lugar de los nodos de inicio de sesión.
- Compatibilidad con GPU de consumo: no disponible. No se documenta ninguna prueba en GPUs tipo RTX 4090 u otras.
- Opciones de despliegue: el artefacto no es compatible con flujos estándar como vLLM, llama.cpp, Ollama o TGI sin trabajo adicional, ya que no es safetensors ni GGUF y requiere el cargador nativo del proyecto. Es necesario reconstruir las extensiones nativas para el ABI de PyTorch/CUDA del entorno de destino, usar un entorno aislado y no cuantizar ni alterar la línea base durante la carga.
- Latencia y throughput estimados: no disponible. No se han realizado mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3-8B-Instruct-QuaRot-W4A4KV4 | 8B | No disponible en la información | `qmodel.pt` nativo BF16 con cuantización falsa | llama3 | Repositorio de investigación, 0 descargas |
| Meta-Llama-3-8B-Instruct (modelo base) | 8B | No disponible en la información proporcionada | safetensors BF16 | llama3 | Repositorio oficial de Meta con condiciones de acceso |
| Variantes cuantizadas W4A16 (GPTQ/AWQ) de Llama-3-8B-Instruct | 8B | No disponible en la información | safetensors/GGUF típicamente | llama3 (según derivado) | Ampliamente disponibles, aunque no comparadas aquí |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de calidad. La diferencia principal frente a los modelos de la tabla es la agresividad de la cuantización (A4 y KV4, no solo pesos) y el formato nativo no estándar.

## Limitaciones y advertencias

- No es una publicación oficial de Meta ni de los autores del cuantizador; es un artefacto de investigación subido por un tercero.
- No se ha aplicado destilación ni reparación de seguridad: puede presentar comportamientos de seguridad degradados respecto al modelo base, y ese es precisamente el objeto de estudio del proyecto asociado.
- No se ha realizado ninguna inferencia ni evaluación de benchmarks como parte de la subida; no se implica preparación para benchmarks.
- Riesgo de alucinación: no evaluado en la información proporcionada.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de contexto e idioma: no documentadas.
- El checkpoint contiene rutas específicas del clúster Delta en los lanzadores y en algunos manifiestos, por lo que no es portátil por sí solo.
- Requiere reconstruir extensiones nativas para el ABI de PyTorch/CUDA del entorno de destino y usar un entorno aislado.
- No se debe repetir GPTQ ni la rotación offline al cargar el modelo; el cargador restaura las transformaciones y los cuantizadores desde la receta congelada.
- Los gradientes de extremo a extremo y las actualizaciones de parámetros con conciencia de cuantización no se han validado; no es un checkpoint de entrenamiento validado.
- Las diferencias de runtime nativo son intencionadas y deben reportarse en comparaciones emparejadas.
- Restricciones de licencia: se aplica la Llama 3 Community License. Cualquier uso comercial debe cumplir sus términos, y el modelo base y el tokenizador deben obtenerse por separado bajo sus propias condiciones de acceso.
- La validación del cargador de evaluación en proceso nuevo sigue pendiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wliu62/Llama-3-8B-Instruct-QuaRot-W4A4KV4
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio del proyecto (Safety Repair of Quantized Agent): https://github.com/Will65536/safety-repair-of-quantized-agent
- Código upstream de QuaRot: https://github.com/spcl/QuaRot (commit `5008669b08c1f11f9b64d52d16fddd47ca754c5a`, más parche de código incluido)
