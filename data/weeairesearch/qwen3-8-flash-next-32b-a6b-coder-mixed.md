# WeeAIResearch/Qwen3.8-Flash-Next-32B-A6B-Coder-Mixed

## Resumen

Qwen3.8-Flash-Next-32B-A6B-Coder-Mixed es un derivado experimental del modelo Qwen3.8-Flash-Next de Qwen, publicado por WeeAIResearch en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning de código: es una poda (pruning) de la versión GGUF cuantizada del modelo original, calibrada con tareas cortas en C#. El objetivo es reducir el tamaño del archivo eliminando expertos de las capas MoE (mixture of experts) que apenas se activaron durante una pequeña batería de pruebas de generación de código en C#.

El resultado es un GGUF de 48,31 GiB con una arquitectura MoE de 48 capas en la que cada capa conserva entre 85 y 177 expertos enrutados distribuidos en tres bancos de precisión variable (Q4_K, Q2_K y Q1_0), además del experto compartido original. Selecciona diez expertos enrutados por token y por capa. El archivo incluye además una tabla de búsqueda n-gram de 32,78 GiB pensada para residir en disco.

Es relevante como ejemplo de compresión agresiva post-cuantización mediante poda de expertos, pero su carácter experimental es extremo: requiere un runtime de llama.cpp parcheado a medida, no funciona con llama.cpp estándar ni con aplicaciones que usen un runtime sin modificar, y las pruebas realizadas por el autor se limitan a verificaciones de humo (smoke tests) sobre tres métodos cortos de C#. No hay evaluaciones a escala de aplicación ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (derivado podado de Qwen3.8-Flash-Next), 48 capas, 10 expertos enrutados activos por token y capa, experto compartido |
| Parametros totales | ~84,03 mil millones de valores de tensor almacenados en el GGUF (incluyendo padding); ~32,21 mil millones de valores no-lookup excluyendo padding Q2; tabla de lookup n-gram separada de 51,20 mil millones de valores |
| Parametros activos | ~6B (aproximacion heredada del modelo original "A6B"; no recalculado de forma independiente para este derivado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta por bancos: Q4_K (gate/up) con Q5_0 o Q8_0 (down) en el primer banco, Q2_K en el segundo, Q1_0 en el tercero; lookup table y tensores no-experto sin cambios |
| Idiomas soportados | no disponible (heredaria los del modelo base Qwen3.8-Flash-Next, pero no se documenta) |
| Licencia | Qwen Community License 1.0 (qwen-community-1.0) |
| Formato de pesos | GGUF (derivado del GGUF Q4_K_M de lmstudio-community; archivo unico de 51.869.664.064 bytes / 48,31 GiB) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer MoE heredado de Qwen3.8-Flash-Next con 48 capas. En cada capa, el derivado conserva entre 85 y 177 expertos enrutados, organizados en tres bancos de tamano variable con precision mixta decreciente: el primer banco mantiene la precision original del GGUF fuente (Q4_K para proyecciones gate/up, Q5_0 u Q8_0 para down), el segundo usa Q2_K con proyecciones down con padding, y el tercero usa Q1_0. Ademas se conserva el experto compartido sin modificar. La novedad tecnica principal es el formato de "bancos de expertos de tamano variable", que exige un runtime de llama.cpp modificado mediante un parche propio (`runtime/variable-runtime.patch`, contra el commit `18443257a30c884d5332abb8e7dc43c7ffe42fda`, tag `b10662`).

No hubo entrenamiento ni fine-tuning: el modelo se construyo podando 3.659 slots de capa/experto que se seleccionaron en menos del 2% de 355 tokens generados en cinco tareas cortas de C# (esos slots representaban el 7,71% de las selecciones registradas). Las filas retenidas se copiaron sin re-cuantizacion, y se verificaron los 1.512 nombres, tipos, formas y hashes de los tensores. La etiqueta "Coder" hace referencia unicamente a la calibracion del enrutamiento basada en C#, no a un entrenamiento especializado en codigo. No hay informacion sobre RLHF, DPO ni composicion del dataset, ya que todo ello corresponde al modelo base y no se detalla en la ficha.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen3.8-Flash-Next, con la salvedad de que la poda puede provocar regresiones fuera de las muestras de prueba.
- Generacion de codigo en C#: las pruebas del autor consisten en tres metodos cortos de C#, en los que el derivado reprodujo las respuestas del modelo padre en dos prompts nuevos y uno de calibracion.
- No se ha realizado fine-tuning en datos de codigo, por lo que no debe asumirse una mejora de calidad en programacion respecto al modelo base.
- No disponible: informacion sobre tool calling / function calling, soporte de agentes, capacidades multilingues, vision, audio o thinking mode para este derivado concreto.
- Compatibilidad con offload parcial a Metal (Apple Silicon) mediante el runtime personalizado, verificada con una capa en un M5 Pro.

## Casos de uso

- Experimentacion en poda de expertos MoE: el modelo y su parche de runtime son utiles para investigadores que quieran estudiar la poda post-cuantizacion de bancos de expertos con precision mixta variable y verificar su impacto en salidas reales.
- Pruebas de formatos GGUF no estandar: permite evaluar como un runtime modificado de llama.cpp maneja bancos de expertos de tamano variable y una tabla de lookup n-gram respaldada en disco.
- Generacion de codigo en C# en entornos controlados: puede usarse para generar metodos cortos de C# en local, siempre validando la salida contra el modelo padre, dado que las pruebas existentes son solo de humo.
- Inferencia con presupuesto de RAM limitado en CPU: en pruebas cortas en CPU el pico de RSS fue de ~10 GiB con paginacion, lo que lo hace viable en maquinas con ~16 GiB de RAM si se acepta el coste de paginar la tabla de lookup de 32,78 GiB desde disco.
- Offload hibrido CPU/Metal en Apple Silicon: se ha verificado el offload de una capa transformadora a Metal en un M5 Pro, base para experimentos de aceleracion parcial en Mac.
- Validacion de integridad de modelos derivados: el proceso documentado (verificacion de 1.512 tensores por nombre, tipo, forma y hash) sirve como referencia metodologica para publicar derivados podados con trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas evaluaciones realizadas son verificaciones de humo: 26/26 comprobaciones superadas en CPU sobre tres metodos cortos de C#, y una respuesta de 79 tokens en C# identica a la del modelo padre con una capa descargada a Metal en un Apple M5 Pro. El autor indica explicitamente que no constituyen benchmarks a escala de aplicacion.

## Requisitos de hardware

- VRAM / memoria: el archivo GGUF pesa 48,31 GiB, de los cuales ~32,78 GiB son una tabla de lookup n-gram pensada para permanecer en disco; los ~15,52 GiB restantes no caben integramente en un presupuesto de 15 GiB de RAM. En pruebas cortas en CPU, el pico de RSS del proceso fue de ~10 GiB con paginacion (no es una medicion de residencia completa).
- GPU recomendadas: no disponible. La unica aceleracion probada es el offload de una capa a Metal en un Apple M5 Pro con el runtime personalizado; el soporte para otras GPU no esta establecido.
- Consumer hardware: viable en un Mac con Apple Silicon (M5 Pro probado) y en equipos CPU con ~16 GiB de RAM si se acepta paginacion desde disco. No hay evidencia de que funcione en GPUs NVIDIA de consumo.
- Despliegue: unicamente con llama.cpp parcheado (commit `18443257a30c884d5332abb8e7dc43c7ffe42fda`, tag `b10662`, aplicando `runtime/variable-runtime.patch`). No funciona con llama.cpp estandar, ni con Ollama, vLLM, TGI ni aplicaciones con runtime sin modificar.
- Latencia y throughput: no disponible. El uso de Q1_0/Q2_K en dos de los tres bancos de expertos sugiere menor ancho de banda de memoria, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-32B-A6B-Coder-Mixed (este) | ~84,03B valores de tensor (incl. padding y lookup) | ~6B (aprox., no recalculada) | GGUF mixto Q4_K/Q2_K/Q1_0 | Qwen Community 1.0 | GGUF unico de 48,31 GiB; requiere runtime parcheado |
| Qwen3.8-Flash-Next (base) | no disponible en la informacion proporcionada | ~6B (declarado) | GGUF Q4_K_M (via lmstudio-community) y pesos originales | Qwen Community 1.0 | GGUF estandar compatible con llama.cpp sin parches |
| lmstudio-community/Qwen3.8-Flash-Next-GGUF (fuente) | no disponible en la informacion proporcionada | ~6B (declarado) | GGUF Q4_K_M | Qwen Community 1.0 | Compatible con runtimes estandar; sin poda |

La alternativa practica para la mayoria de usuarios es el GGUF fuente de lmstudio-community o el modelo base Qwen3.8-Flash-Next: ofrecen compatibilidad total con runtimes estandar a cambio de un archivo de mayor tamano, y sin el riesgo de regresiones de la poda.

## Limitaciones y advertencias

- Compatibilidad critica: el GGUF usa bancos de expertos de tamano variable que un llama.cpp estandar no puede cargar; es imprescindible aplicar el parche incluido contra un commit concreto de llama.cpp.
- Riesgo de regresion: la poda se calibro con solo 355 tokens generados en cinco tareas cortas de C#; el modelo puede degradar notablemente fuera de ese dominio de calibracion.
- Evaluacion minima: las pruebas son smoke tests (26/26 comprobaciones y una comparacion de 79 tokens); no hay benchmarks de aplicacion, ni de calidad general, ni de seguridad.
- La etiqueta "Coder" no implica entrenamiento especializado en codigo ni calidad de codigo superior al modelo base.
- Sin evaluacion de seguridad: el autor indica explicitamente que ninguna prueba establece la idoneidad del modelo para aplicaciones de almacenamiento de contrasenas ni para uso en produccion.
- Sesgos: no disponibles; heredaria los del modelo base Qwen3.8-Flash-Next, que no se documentan en la ficha.
- Riesgo de alucinacion: no evaluado para este derivado; debe asumirse el riesgo inherente del modelo base mas la incertidumbre de la poda.
- Contexto e idiomas: longitud de contexto e idiomas soportados no documentados para este derivado.
- Licencia: Qwen Community License 1.0; conviene revisar sus terminos antes de cualquier uso comercial, y el parche de llama.cpp se distribuye bajo MIT.
- El proyecto es experimental, con 0 descargas registradas en el momento de la ficha; no hay comunidad ni soporte establecidos.

## Enlaces

- Ficha del modelo: https://huggingface.co/WeeAIResearch/Qwen3.8-Flash-Next-32B-A6B-Coder-Mixed
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF fuente (lmstudio-community): https://huggingface.co/lmstudio-community/Qwen3.8-Flash-Next-GGUF
- Parche de runtime: https://huggingface.co/WeeAIResearch/Qwen3.8-Flash-Next-32B-A6B-Coder-Mixed/blob/main/runtime/variable-runtime.patch
- README del runtime: https://huggingface.co/WeeAIResearch/Qwen3.8-Flash-Next-32B-A6B-Coder-Mixed/blob/main/runtime/README.md
- Licencia: https://huggingface.co/WeeAIResearch/Qwen3.8-Flash-Next-32B-A6B-Coder-Mixed/blob/main/LICENSE
- Licencia MIT de llama.cpp (parche): https://huggingface.co/WeeAIResearch/Qwen3.8-Flash-Next-32B-A6B-Coder-Mixed/blob/main/runtime/LLAMA_CPP_LICENSE
