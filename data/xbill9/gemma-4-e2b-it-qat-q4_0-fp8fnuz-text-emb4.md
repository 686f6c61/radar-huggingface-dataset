# xbill9/gemma-4-E2B-it-qat-q4_0-fp8fnuz-text-emb4

## Resumen

Este repositorio contiene una reconstruccion no oficial de los pesos de `google/gemma-4-E2B-it-qat-q4_0-unquantized` (revision `6befbac`) en formato FP8 E4M3FNUZ con cuantizacion de activaciones W8A8, manteniendo las tablas de embeddings en int4. Lo publica el usuario `xbill9` de forma independiente a Google y no esta respaldado ni afiliado a Google DeepMind. El checkpoint ocupa 3,40 GiB, declara 5.031.222.563 parametros totales y esta pensado para servirse con vLLM sobre ROCm, concretamente sobre hardware AMD CDNA 3.

La particularidad tecnica es el formato numerico: E4M3FNUZ es el FP8 nativo de las AMD Instinct MI300X, MI300A y MI325X, con la misma mantisa de 3 bits que el E4M3 de NVIDIA pero con un sesgo de exponente superior, valor maximo 240 en lugar de 448 y sin cero negativo. El autor ha redondeado directamente los pesos entrenados con QAT (cuantizacion consciente de entrenamiento) a esa rejilla, con una escala por canal de salida, y ha anadido cuantizacion por token de las activaciones en tiempo de ejecucion mediante `compressed-tensors` en modo `float-quantized`.

Su relevancia es acotada pero concreta: es una de las pocas builds publicas que empaquetan pesos Gemma 4 en el formato FP8 especifico de CDNA 3, y sirve como pieza de comparacion frente a su gemelo en E4M3 y frente a la build que preserva exactamente la rejilla QAT int4. El propio autor advierte que el modelo no se ha servido ni evaluado todavia, y que esta en cola para una tanda de pruebas en una unica MI300X.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4_text`; derivada de la familia Gemma 4 de Google DeepMind) |
| Parametros totales | 5.031.222.563 (5,03 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3FNUZ W8A8 en 276 modulos Linear (una escala float32 por canal de salida, activaciones FP8 por token); embeddings, per-layer embeddings y `lm_head` en int4 QAT q4_0; `lm_head` desligado (untied); `compressed-tensors` `float-quantized` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (compressed-tensors), libreria declarada `vllm` |

Datos adicionales de la verificacion incluida en el repositorio (`verify_report.json`):

| Metrica frente a los pesos QAT | Valor |
|---|---:|
| Modulos Linear en FP8 | 276 |
| Valores cuantizados | 1.876.819.968 |
| Error RMS relativo | 2,64 % |
| Error maximo, como fraccion del mayor valor de su fila | 3,33 % |
| Otros tensores, identicos byte a byte a su origen | 262 de 262 |
| Tamano del checkpoint | 3,40 GiB |

## Arquitectura y entrenamiento

La arquitectura interna del modelo base no se detalla en la informacion disponible; lo unico declarado es la etiqueta `gemma4_text` y su condicion de modelo solo texto. Lo que si se documenta con precision es el proceso de cuantizacion. Google entreno los pesos originales con QAT sobre una rejilla de 4 bits con una escala por grupo de 32 valores. Esta build no reproduce esa rejilla: FP8 con una unica escala por canal de salida no puede representar escalas por grupo, de modo que el autor vuelve a redondear los pesos QAT a la rejilla FP8 E4M3FNUZ, usando la escala `max|row| / 240`, y ademas cuantiza las activaciones. Segun el informe de verificacion, el redondeo introduce un error RMS relativo del 2,64 % y un error maximo del 3,33 % respecto al mayor valor de cada fila, mientras que los 262 tensores restantes se copian sin modificacion desde el modelo fuente. No se utiliza ningun conjunto de datos de calibracion.

Los embeddings, los per-layer embeddings y la cabeza `lm_head` (desligada) proceden sin cambios de la build int4 `xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4` (revision `db715f8`). La construccion se realiza con el script `fp8_text.py` incluido en el repositorio, con las opciones `--fnuz` y `build-on`, que importa utilidades de `repack_q4_0.py`. Existe una build gemela, `xbill9/gemma-4-E2B-it-qat-q4_0-fp8-text-emb4`, con los mismos pesos en E4M3; la unica diferencia entre ambas es en que punto redondea cada una. Si se necesita la rejilla QAT exacta, el autor remite a `xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text`.

## Capacidades

- Generacion de texto y conversacion: es un modelo instructivo (`-it`) con pipeline `text-generation` y etiqueta `conversational`.
- Modalidad exclusivamente texto: el propio autor lo declara como limitacion explicita ("text only"); no hay torre de vision ni de audio en este repositorio.
- Cuantizacion W8A8 lista para servir: los 276 modulos Linear estan almacenados en FP8 con escalas por canal de salida y las activaciones se cuantizan a FP8 por token en tiempo de ejecucion.
- Integracion con `compressed-tensors`: el formato de pesos esta pensado para el cargador de vLLM.
- Formato nativo de AMD CDNA 3: E4M3FNUZ coincide con el que consumen MI300X, MI300A y MI325X.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible; el campo de idiomas de la model card no esta cumplimentado.

## Casos de uso

- Servicio de inferencia en AMD Instinct MI300X: el formato E4M3FNUZ es el FP8 nativo de CDNA 3, de modo que se evita la conversion de formato en el camino caliente y se aprovechan las matrices FP8 del hardware. Es el escenario objetivo declarado por el autor.
- Despliegue con vLLM sobre ROCm: la libreria declarada del repositorio es `vllm` y los pesos estan en `compressed-tensors` `float-quantized`, por lo que la integracion es directa mediante el cargador de cuantizacion de vLLM.
- Asistente conversacional en GPU de consumo: con un checkpoint de 3,40 GiB, el modelo es candidato a ejecutarse en tarjetas de 12 GB o mas, aunque el autor advierte que otras GPUs distintas de CDNA 3 no estan probadas.
- Estudio comparativo de formatos FP8: al existir una build gemela identica en E4M3, este repositorio permite aislar el efecto del redondeo E4M3FNUZ frente a E4M3 sobre los mismos pesos QAT, con un error RMS relativo comun del 2,64 %.
- Validacion de pipelines de cuantizacion sin calibracion: el repositorio documenta que no se usa calibracion y publica un informe de verificacion, lo que lo hace util como caso de prueba reproducible de flujos `compressed-tensors`.
- Reproduccion de builds: los scripts `fp8_text.py` y `repack_q4_0.py` se incluyen en el repositorio, lo que permite repetir el proceso sobre otras variantes de la familia.
- Generacion de texto por lotes de bajo coste: un modelo de 5,03 mil millones de parametros en FP8 con embeddings int4 reduce la huella de memoria y el ancho de banda por token, lo que favorece escenarios de alto volumen donde el coste por token pesa mas que la calidad punta. Esta aplicacion es una hipotesis de uso, no un resultado medido.
- Preservacion de la rejilla QAT cuando la fidelidad importa: para tareas en las que el error adicional del 2,64 % no sea aceptable, el autor redirige a la build `w4a16-ct-text`, que conserva la rejilla QAT exacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo esta construido y verificado en local contra su fuente, pero que todavia no se ha servido ni evaluado, y que esta en cola para una tanda de servicio en una AMD Instinct MI300X.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamano del checkpoint (3,40 GiB) y del numero de parametros (5,03 mil millones), no mediciones publicadas.

- VRAM estimada para los pesos: aproximadamente 3,4 GiB en FP8 E4M3FNUZ con embeddings int4.
- VRAM estimada para inferencia con contexto corto: del orden de 5 a 7 GB contando pesos, estados de activacion y cache KV; el consumo de cache KV crece con la longitud de contexto, que no esta documentada.
- GPU objetivo: AMD Instinct MI300X, MI300A y MI325X, por ser las que soportan E4M3FNUZ de forma nativa.
- Otras GPUs: el autor indica explicitamente que no estan probadas. En ROCm, el cargador de `compressed-tensors` de vLLM convierte los pesos a un parametro E4M3 y despues a E4M3FNUZ para la GPU, duplicando la escala; todos los valores hasta 240 sobreviven a ese viaje de ida y vuelta salvo el subnormal mas pequeno de E4M3FNUZ (2^-10), que E4M3 no puede representar y redondea.
- GPU de consumo: por tamano, el modelo deberia caber en tarjetas con 12 GB o mas, como una RTX 3060 de 12 GB o una RTX 4070, y con holgura en una RTX 4090 de 24 GB. No hay validacion publicada de estos casos.
- Opciones de despliegue: vLLM con el cargador de `compressed-tensors` es la via documentada. No hay pesos GGUF en el repositorio, por lo que llama.cpp y Ollama no son aplicables sin conversion previa. TGI no se menciona.
- Latencia y throughput: no disponible; el modelo no se ha servido ni evaluado.

## Comparativa con modelos similares

| Modelo | Parametros | Formato de pesos | Error frente a QAT | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| `xbill9/gemma-4-E2B-it-qat-q4_0-fp8fnuz-text-emb4` (este) | 5,03 mil millones | FP8 E4M3FNUZ W8A8 + embeddings int4 | 2,64 % RMS relativo | no disponible | Apache 2.0 | No servido ni evaluado |
| `xbill9/gemma-4-E2B-it-qat-q4_0-fp8-text-emb4` | 5,03 mil millones | FP8 E4M3 W8A8 + embeddings int4 | 2,64 % RMS relativo | no disponible | Apache 2.0 | Build gemela; difiere solo en el punto de redondeo |
| `xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text` | 5,03 mil millones | QAT int4 exacto, W4A16 | 0 % (rejilla QAT original) | no disponible | Apache 2.0 | Referencia de maxima fidelidad segun el autor |
| `xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4` | 5,03 mil millones | QAT int4 W4A16 + embeddings int4 | 0 % (rejilla QAT original) | no disponible | Apache 2.0 | Origen de las tablas de embeddings de esta build |
| `google/gemma-4-E2B-it-qat-q4_0-unquantized` | no disponible | Pesos QAT sin cuantizar | referencia | no disponible | Apache 2.0 | Modelo base oficial de Google |

No se dispone de datos de benchmarks ni de contexto que permitan comparar este modelo con alternativas de otros fabricantes de la misma categoria.

## Limitaciones y advertencias

- Modelo solo texto. No procesa imagenes ni audio.
- No se ha servido ni evaluado. No existen mediciones publicadas de calidad, latencia o throughput, y las capacidades reales tras la recuantizacion a FP8 no estan verificadas empiricamente.
- Build no oficial. No esta afiliada ni respaldada por Google. El autor pide que los problemas se reporten en el repositorio y no a Google.
- Perdida de precision por doble cuantizacion. Los pesos QAT entrenados sobre una rejilla de 4 bits con escalas por grupo de 32 se redondean de nuevo a FP8 con una escala por canal de salida, lo que da un error RMS relativo del 2,64 % y un error maximo del 3,33 % respecto al mayor valor de cada fila. El impacto de ese error en la calidad de generacion no se ha medido.
- Cuantizacion de activaciones sin calibracion. No se usa ningun conjunto de calibracion, por lo que las escalas de activacion por token se determinan en tiempo de ejecucion.
- Dependencia de hardware CDNA 3. E4M3FNUZ es el formato de MI300X, MI300A y MI325X. Otras GPUs no estan probadas y, en ROCm, la conversion E4M3 a E4M3FNUZ en vLLM pierde el subnormal mas pequeno (2^-10).
- Idiomas no declarados. El campo de idiomas de la model card no esta cumplimentado, por lo que no hay garantia documentada de cobertura multilingue.
- Longitud de contexto no disponible. No se puede planificar un despliegue en funcion de la ventana de contexto sin consultar el modelo base.
- Riesgo de alucinacion. No evaluado en esta build; es un riesgo inherente a los modelos generativos de este tamano, agravado por la ausencia de evaluacion.
- Sesgos. No documentados ni evaluados en este repositorio.
- Licencia. La model card declara Apache 2.0 y enlaza los terminos de licencia de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`). Conviene revisar esos terminos antes de un uso comercial, ya que la licencia de la familia Gemma puede incluir condiciones de uso adicionales a las de Apache 2.0.
- Madurez y validacion comunitaria minimas. El repositorio registra 14 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-fp8fnuz-text-emb4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Build gemela en FP8 E4M3: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-fp8-text-emb4
- Build origen de los embeddings int4: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text-emb4
- Build con la rejilla QAT int4 exacta: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Model card original de Google, conservada sin cambios en el repositorio como `ORIGINAL_README.md`
- Script de construccion `fp8_text.py` y utilidades `repack_q4_0.py`, incluidos en el repositorio
- Informe de verificacion `verify_report.json`, incluido en el repositorio
