# xbill9/gemma-4-12B-it-qat-q4_0-fp8-text

## Resumen

`xbill9/gemma-4-12B-it-qat-q4_0-fp8-text` es una conversión no oficial de los pesos con entrenamiento consciente de cuantización (QAT) de Google Gemma 4 12B-it a formato FP8 W8A8, publicada por el usuario xbill9. El modelo parte de `google/gemma-4-12B-it-qat-q4_0-unquantized`, es decir, de los pesos que Google entrenó sobre una rejilla de 4 bits con una escala por grupo de 32, y los vuelve a redondear a FP8 E4M3 con una escala float32 por canal de salida, cuantizando además las activaciones a FP8 por token en tiempo de ejecución.

Es una build estrictamente de texto: se eliminan las partes no textuales del checkpoint y solo se conserva la torre de texto, etiquetada en el repositorio como `gemma4_unified_text`. El resultado son 11.907.350.320 parámetros totales, de los cuales 10.899.947.520 están almacenados en FP8 (328 módulos Linear) y el resto (embeddings, normas y tensores auxiliares) se copia byte a byte en bf16. El checkpoint ocupa 12,04 GiB y el repositorio completo 13,0 GB.

Su relevancia es de infraestructura más que de investigación: ofrece un artefacto listo para servir con vLLM en formato `compressed-tensors` con precisión FP8, lo que reduce la huella de memoria frente a bf16 y habilita kernels FP8 nativos en GPU Ada y Hopper. A cambio, introduce una doble cuantización (QAT 4 bits y después FP8) con un error RMS relativo del 2,64 % respecto a los pesos QAT, y no se ha publicado ninguna validación de capacidades ni benchmark de rendimiento del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4, variante de texto (`gemma4_unified_text` segun la etiqueta del repositorio) |
| Parametros totales | 11.907.350.320 (≈11,9 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 (W8A8) en 328 modulos Linear, con una escala float32 por canal de salida; activaciones cuantizadas a FP8 por token en tiempo de ejecucion; embeddings y normas en bf16 |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use de Google) |
| Formato de pesos | safetensors con cuantizacion `compressed-tensors` (`float-quantized`) |
| Parametros almacenados en FP8 | 10.899.947.520 (≈91,5 % del total) |
| Tamano del checkpoint | 12,04 GiB |
| Tamano del repositorio | 13,0 GB |
| Modelo base | google/gemma-4-12B-it-qat-q4_0-unquantized |
| Libreria declarada | vllm |
| Fecha de publicacion | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint Gemma 4 12B-it de Google, un transformer decoder-only de aproximadamente 12 mil millones de parametros, aqui reducido a su parte textual. El detalle de capas, cabezas de atencion, tipo de atencion (completa, lineal o hibrida) y ventana de contexto no se especifica en la informacion disponible, por lo que no puede confirmarse desde este repositorio.

El proceso de construccion es relevante para interpretar la calidad del resultado. Google entreno los pesos originales con QAT sobre una rejilla de 4 bits con una escala por grupo de 32 elementos. FP8 con una escala por canal de salida no puede representar esas escalas por grupo, de modo que esta build redondea de nuevo los pesos QAT a FP8 y ademas cuantiza las activaciones, lo que implica una perdida acumulada de dos etapas de cuantizacion. El script de conversion (`fp8_text.py`) esta incluido en el repositorio y no se utilizo ningun conjunto de datos de calibracion: las escalas de activacion se calculan dinamicamente por token en inferencia.

No hay informacion en el repositorio sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo base, mas alla de que se trata de un checkpoint instruct (sufijo `it`) con QAT.

## Capacidades

- Generacion de texto en el marco de un modelo instruct: la model card del checkpoint base de Google cita generacion de texto creativo (poemas, guiones, copy de marketing, borradores de correo).
- Dialogo conversacional y asistentes: el checkpoint base se presenta explicitamente para interfaces conversacionales de atencion al cliente, asistentes virtuales y aplicaciones interactivas.
- Generacion de codigo: la model card del base menciona generacion de codigo entre los usos previstos. No hay evaluacion publicada de esta build FP8 en tareas de programacion.
- Seguimiento de instrucciones como modelo `it`, sujeto a la degradacion introducida por la doble cuantizacion.
- Capacidades multimodales: no disponibles. El autor indica explicitamente que la build es "text only" y ha eliminado los tensores no textuales.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Uso como agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas soportados.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en un asistente de soporte servido con vLLM. Su huella de 12,04 GiB permite desplegarlo en una unica GPU de 24 GB y atender varias conversaciones concurrentes con `continuous batching`. La longitud de contexto efectiva debe fijarse por configuracion, ya que no esta documentada.
- Generacion y revision de codigo en pipelines de CI/CD: al ser un modelo instruct de 12B, puede emplearse para generar parches, resumir diffs o redactar mensajes de commit. Cualquier integracion con herramientas del repositorio debe validarse aparte, porque el soporte de tool calling no esta confirmado en la informacion disponible.
- Documentacion tecnica y resumenes internos: redaccion de guias, resumenes de actas o transcripciones y normalizacion de notas, ejecutado en infraestructura propia sin salida de datos a terceros, algo habilitado por el despliegue on-premise con vLLM.
- Clasificacion y enrutado de tickets: el modelo puede etiquetar y priorizar solicitudes entrantes generando una categoria y un resumen corto, con validacion posterior del formato de salida mediante plantillas o parsers estrictos.
- Generacion de contenido de marketing: redaccion de copy, variantes de asunto de correo y descripciones de producto, usadas como borrador que un editor humano revisa antes de publicar.
- Evaluacion comparativa de cuantizaciones: este repositorio es util como referencia para medir la degradacion real de un pipeline FP8 W8A8 frente a los pesos QAT y frente a versiones GGUF Q4_0, usando la misma bateria de prompts en vLLM.
- Despliegue en una GPU unica para prototipado rapido: al pesar 12,04 GiB y requerir solo vLLM, sirve como endpoint interno de bajo coste para pruebas de producto antes de escalar a un modelo mayor.
- Extraccion de informacion de documentos largos: resumen y extraccion de campos desde informes o contratos, condicionado a la longitud de contexto real del modelo, que no esta documentada en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion de capacidad para esta build. Los unicos datos numericos publicados son metricas de fidelidad de la cuantizacion frente a los pesos QAT de Google:

| Metrica | Valor |
|---|---|
| Modulos Linear en FP8 | 328 |
| Valores cuantizados | 10.899.947.520 |
| Error RMS relativo frente a los pesos QAT | 2,64 % |
| Error maximo, como fraccion del mayor valor de su fila | 3,57 % |
| Tamano del checkpoint | 12,04 GiB |

Estas cifras describen la perdida introducida por la conversion, no la calidad del modelo en tareas concretas.

## Requisitos de hardware

- VRAM para los pesos: 12,04 GiB solo para el checkpoint FP8, mas alrededor de 2 GB de resto en bf16 ya contabilizados en ese tamano.
- VRAM total estimada: aproximadamente 14-18 GiB con cache KV y activaciones para contextos moderados, dependiendo de la longitud de contexto configurada y del grado de `gpu_memory_utilization` reservado por vLLM.
- No cabe en GPUs de 12 GB: los pesos por si solos ya ocupan 12,04 GiB, por lo que una GPU de 12 GB no es suficiente para este repositorio (a diferencia del checkpoint QAT en GGUF Q4_0, de 7,09 GB).
- GPU recomendadas por familia:
  - FP8 nativo (Ada / Hopper): RTX 4090 (24 GB), RTX 5090 (32 GB), L40S (48 GB), H100 (80 GB).
  - Ampere (A100, A10G, RTX 3090): ejecucion posible mediante kernels alternativos en vLLM, sin las ventajas de rendimiento del FP8 nativo.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 5090 y RTX 3090 (24 GB o mas), con contexto limitado en el caso de 24 GB.
- Opciones de despliegue: vLLM es la libreria declarada por el autor y la via esperada para cargar `compressed-tensors`. No se documenta soporte directo en llama.cpp, Ollama o TGI para este formato; para esas rutas habria que partir del checkpoint base o de una cuantizacion GGUF equivalente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Precision / formato | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| xbill9/gemma-4-12B-it-qat-q4_0-fp8-text | 11.907.350.320 | FP8 E4M3 W8A8, compressed-tensors, safetensors | 12,04 GiB | no disponible | gemma | vLLM; 0 descargas y 0 likes en el momento de la consulta |
| google/gemma-4-12B-it-qat-q4_0-unquantized | mismo modelo base (sin cuantizacion adicional aplicada por terceros) | no disponible en la informacion proporcionada | no disponible | no disponible | gemma | Repositorio oficial en Hugging Face |
| google/gemma-4-12B-it-qat-q4_0-gguf | mismo modelo base | GGUF, cuantizacion Q4_0 | 7,09 GB (segun el agregador local-ai-zone) | no disponible | gemma | Repositorio oficial en Hugging Face; descargable tambien via agregadores |

La diferencia practica entre las tres opciones es el eje precision / huella: el FP8 reduce memoria frente a bf16 y aprovecha kernels FP8 en hardware Ada y Hopper, mientras que la version GGUF Q4_0 es mas pequena (7,09 GB) y esta pensada para llama.cpp y Ollama, a costa de una perdida de precision mayor. El checkpoint sin cuantizar es la referencia de maxima fidelidad respecto al QAT de Google. No hay datos publicados que permitan comparar calidad entre las tres variantes.

## Limitaciones y advertencias

- Build no oficial: no esta publicada ni validada por Google. El propio autor indica que los problemas deben reportarse en este repositorio y no a Google.
- Doble cuantizacion: los pesos QAT estaban entrenados sobre una rejilla de 4 bits con escala por grupo de 32; al reexpresarlos en FP8 con una escala por canal de salida se produce un redondeo adicional, con un error RMS relativo del 2,64 % y un error maximo del 3,57 % respecto a los pesos QAT. La degradacion en tareas reales no ha sido medida.
- Cuantizacion de activaciones sin calibracion: las activaciones se cuantizan a FP8 por token en tiempo de ejecucion, sin conjunto de calibracion, lo que puede afectar de forma desigual a distintas cargas de trabajo.
- Solo texto: la build elimina las capacidades no textuales del checkpoint de origen.
- Idiomas y contexto sin documentar: el repositorio no declara idiomas soportados ni longitud de contexto, por lo que no puede garantizarse un comportamiento correcto fuera del ingles o mas alla de un contexto corto sin pruebas propias.
- Riesgo de alucinacion: como cualquier modelo generativo de esta escala, puede producir afirmaciones incorrectas con apariencia de verosimilitud; no se ha publicado ninguna evaluacion de veracidad para esta build.
- Sesgos: no hay informacion especifica en la informacion proporcionada sobre sesgos medidos en esta conversion. El modelo hereda los sesgos del checkpoint base de Google, que no se documentan aqui.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use y a la politica de usos prohibidos de Google. Cualquier redistribucion del modelo o de sus derivados debe acompanar los terminos de licencia correspondientes. Al ser una build de terceros, conviene verificar el cumplimiento antes de un despliegue en produccion.
- Ausencia de validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni informes de terceros.
- Carga en vLLM: la carga requiere soporte de `compressed-tensors` en la version de vLLM utilizada; no se documentan versiones minimas ni requisitos de autenticacion para el modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/xbill9/gemma-4-12B-it-qat-q4_0-fp8-text
- Script de conversion (`fp8_text.py`, incluido en el repositorio): https://huggingface.co/xbill9/gemma-4-12B-it-qat-q4_0-fp8-text/tree/main
- Modelo base (pesos QAT sin cuantizar): https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Version GGUF oficial del checkpoint QAT: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf
- Ficha del modelo GGUF en local-ai-zone: https://local-ai-zone.github.io/models/gemma-4-12b-it-qat-q4-0.html
- Guia de despliegue del 12B QAT con vLLM: https://markaicode.com/howto/gemma-4-setup-and-configuration-guide/
- Hub de descargas de la familia Gemma 4: https://gemmai4.com/download/
