# UnbindAI/Unbind-Flash-V1

## Resumen

Unbind Flash V1 es una distribución publicada por UnbindAI en Hugging Face que reempaqueta, bajo su propia marca, pesos cuantizados en formato GGUF de un modelo base desarrollado por DeepSeek (la conversión y cuantización Q2_K_S provienen de ggml-org). El repositorio se posiciona como una IA "sin censura" (uncensored) orientada a investigación en ciberseguridad, análisis de vulnerabilidades, revisión de código seguro y pruebas de penetración autorizadas. Es importante distinguir dos ediciones: la versión alojada (hosted) de UnbindAI, que según el autor usa un checkpoint FP8 modificado a nivel de pesos publicado por dealignai, y los archivos descargables de este repositorio, que son una copia sin modificar del GGUF Q2_K_S del modelo base DeepSeek-V4-Flash.

La relevancia de esta ficha radica en que el modelo descargable tiene aproximadamente 284.335 millones de parámetros (dato real de safetensors) y ocupa unos 98,6 GB en dos fragmentos GGUF, lo que lo sitúa en la categoría de modelos frontera que requieren hardware multi-GPU para inferencia local. La licencia declarada en los metadatos es Apache 2.0, aunque el aviso de licencia original conservado es MIT, una inconsistencia que conviene tener en cuenta.

Cabe subrayar que UnbindAI no ha entrenado ni ajustado (fine-tuned) los pesos descargables: su contribución se limita a la marca, la documentación y los resultados de evaluación, que se refieren exclusivamente a su versión alojada y no a los archivos GGUF de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de DeepSeek; tipo exacto no especificado en la model card) |
| Parametros totales | 284.334.567.511 (≈ 284,3 B, dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K_S (GGUF, sin calibracion imatrix); el checkpoint alojado usa FP8 |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 en metadatos; aviso de licencia original MIT |
| Formato de pesos | GGUF (dos fragmentos, ≈ 98,6 GB); el checkpoint alojado es FP8 |

## Arquitectura y entrenamiento

Los pesos descargables de este repositorio son una conversión GGUF Q2_K_S del modelo DeepSeek-V4-Flash publicado por ggml-org, cuyo desarrollo corresponde a DeepSeek. La model card no especifica la arquitectura concreta (transformer denso, MoE, etc.), ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO. Dado el tamaño de 284 mil millones de parámetros, es plausible que se trate de una arquitectura de tipo MoE, pero este dato no está confirmado en la información disponible, por lo que debe tratarse como no disponible.

La modificación "uncensored" (abliteración) no se aplica a los archivos descargables: se refiere al checkpoint FP8 "dealignai 1017 UNCENSORED" que UnbindAI utiliza en su edición alojada. Esa modificación actúa a nivel de pesos, presumiblemente reduciendo o eliminando comportamientos de rechazo entrenados, pero la metodología exacta no está documentada en la información proporcionada.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag "conversational").
- Razonamiento general y resolucion de problemas tecnicos, segun los resultados reportados en benchmarks de razonamiento y codigo (GPQA Diamond, LiveBench, LiveCodeBench).
- Generacion y analisis de codigo, con enfasis declarado en revision de codigo seguro y analisis de vulnerabilidades.
- Orientacion a ciberseguridad: analisis de codigo sospechoso, retos capture-the-flag, simulacion de adversarios y pruebas de penetracion en ambito autorizado.
- Comportamiento "uncensored" en la edicion alojada: UnbindAI reporta 320 de 320 pruebas superadas en su suite de rechazos, aunque no se publicaron los criterios de aprobacion ni los registros crudos.
- Soporte de tool calling / function calling: no disponible.
- Capacidades multilingues: no disponibles (no se especifican idiomas).
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Analisis de vulnerabilidades: revision de codigo fuente o binarios sospechosos para identificar fallos de seguridad, aprovechando la orientacion declarada del modelo hacia analisis tecnico sin rechazos.
- Revision de codigo seguro en equipos de desarrollo: integracion en flujos de revisión para detectar patrones inseguros (inyeccion, deserializacion, gestion de secretos) antes de despliegue.
- Entrenamiento en capture-the-flag: generacion de pistas, walkthroughs y explicaciones de tecnicas para retos CTF en contextos educativos autorizados.
- Simulacion de adversarios (red team autorizado): razonamiento sobre cadenas de ataque, priorizacion de vectores y redaccion de informes tecnicos dentro de un alcance autorizado.
- Investigacion en alineacion y seguridad de modelos: el comportamiento "uncensored" y la publicacion de resultados comparativos lo hacen util como sujeto de estudio para investigadores de alineacion.
- Despliegue local privado para datos sensibles: al ser descargable en GGUF, permite analizar material confidencial sin enviarlo a servicios de terceros, siempre con hardware suficiente.
- Documentacion y reporte de hallazgos: redaccion de informes de penetration testing a partir de evidencias tecnicas proporcionadas por el analista.

## Benchmarks y rendimiento

Los siguientes resultados fueron suministrados por UnbindAI y corresponden exclusivamente a su version alojada (checkpoint FP8 de dealignai), no a los archivos GGUF de este repositorio. No han sido verificados de forma independiente y no se aportaron configuraciones de test, revisiones de dataset ni registros de ejecucion. No se incluyen numeros de modelos comparables porque no se proporcionaron en la informacion disponible.

| Benchmark | Unbind Flash V1 (hosted, reportado) |
|:--|--:|
| AA Index v5 | 31,0* |
| HLE-Diamond | 26,9 |
| GPQA Diamond | 93,1 |
| Terminal-Bench 4 | 12,6 |
| FrontierCode 2 | 10,9 |
| LiveBench 2 | 64,6 |
| LiveCodeBench | 87,2 |

\* El asterisco aparece en los datos suministrados; su significado no fue especificado.

Adicionalmente, UnbindAI reporta 320 de 320 pruebas superadas en una suite propia de rechazos, sin nombre de suite, criterios ni registros publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q2_K_S ocupa ≈ 98,6 GB; la memoria en ejecucion supera el tamano del archivo y depende del software, el hardware y la longitud de contexto. Como referencia orientativa, conviene disponer de al menos 110-130 GB de VRAM (o VRAM + RAM unificada) para la cuantizacion Q2_K_S sin contexto largo; cifra estimada, no confirmada por el autor.
- GPUs recomendadas: no disponibles de forma explicita. Por orden de magnitud, se requiere hardware multi-GPU de gama datacenter (por ejemplo, 2-3 x A100/H100 de 80 GB) o configuraciones con offload a CPU.
- Consumer GPUs: no cabe en una sola GPU de consumo (una RTX 4090 con 24 GB es insuficiente); solo seria viable con multi-GPU de gama alta combinada con offload, con penalizacion severa de velocidad.
- Opciones de despliegue: llama.cpp es el runtime natural para GGUF (endpoints_compatible); tambien Ollama y LM Studio en principio soportan GGUF. vLLM y TGI no soportan GGUF y requeririan los pesos originales en safetensors/FP8. No se documenta soporte oficial para ninguno.
- Latencia y throughput: no disponibles. Con Q2_K_S y offload a CPU, la velocidad de generacion sera baja dada la magnitud del modelo.

## Comparativa con modelos similares

No se han proporcionado datos comparativos de otros modelos en la informacion disponible, y los resultados reportados por UnbindAI no incluyen cifras de competidores verificables. La comparativa se limita a las dos ediciones del propio modelo descritas en la model card:

| Aspecto | Edicion descargable (este repo) | Edicion alojada (hosted) |
|---|---|---|
| Checkpoint | DeepSeek-V4-Flash Q2_K_S GGUF (ggml-org), sin modificar | dealignai DeepSeek-V4.1-Flash-1017 UNCENSORED FP8 |
| Cuantizacion | Q2_K_S (sin imatrix) | FP8 |
| Comportamiento | Modelo base original, sin abliteracion | Uncensored (modificacion a nivel de pesos) |
| Benchmarks reportados | No aplican los resultados de UnbindAI | Resultados de la tabla anterior |
| Acceso | Descarga local (98,6 GB) | Servicio alojado de UnbindAI |

Como referencia de contexto, el modelo base procede de la familia DeepSeek, cuyos modelos frontera compiten con Llama y Qwen de escala similar; una comparativa detallada no esta disponible con los datos proporcionados.

## Limitaciones y advertencias

- Inconsistencia de licencia: los metadatos declaran apache-2.0, pero el aviso de licencia conservado es MIT (el de los modelos base de DeepSeek y las conversiones de ggml-org). Verifica la licencia aplicable antes de uso comercial.
- Los benchmarks reportados corresponden a la version alojada FP8, no a los archivos GGUF descargables; la cuantizacion Q2_K_S sin calibracion imatrix puede degradar sustancialmente la calidad respecto al checkpoint original.
- Riesgo de alucinacion: no evaluado en la informacion disponible; como todo LLM, puede generar informacion tecnicas incorrecta, especialmente peligrosa en contextos de seguridad.
- Contenido "uncensored": el modelo alojado esta modificado para minimizar rechazos. Esto es apropiado solo para investigacion autorizada; su uso para actividades maliciosas es ilegal e irresponsable. La responsabilidad del uso recae en el operador.
- Sesgos conocidos: no disponibles.
- Idiomas soportados y longitud de contexto: no documentados; verifica estos datos antes de produccion.
- Trazabilidad de resultados: no se aportaron configuraciones de test, revisiones de dataset ni registros crudos, y el significado del asterisco en AA Index v5 no fue especificado; trata las cifras con escepticismo.
- Requisitos de hardware muy elevados: la descarga (98,6 GB) y la inferencia local estan fuera del alcance de la mayoria de estaciones de trabajo personales.
- Descargas muy bajas (29) y ausencia de verificacion independiente: se trata de una distribucion muy reciente y sin trayectoria comunitaria demostrada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/UnbindAI/Unbind-Flash-V1
- Galeria de benchmarks: https://huggingface.co/UnbindAI/Unbind-Flash-V1/blob/main/BENCHMARKS.md
- Referencias del modelo base: https://huggingface.co/UnbindAI/Unbind-Flash-V1/blob/main/BASE_MODEL_REFERENCES.md
- Aviso de licencia original (MIT): https://huggingface.co/UnbindAI/Unbind-Flash-V1/blob/main/LICENSE
- Checkpoint alojado referenciado: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Conversion GGUF original: https://huggingface.co/ggml-org/DeepSeek-V4-Flash-GGUF
