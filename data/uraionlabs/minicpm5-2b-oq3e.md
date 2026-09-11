# UraionLabs/MiniCPM5-2B-oQ3e

# MiniCPM5-2B-oQ3e: cuantizacion MLX de 3 bits para Apple Silicon

## Resumen

MiniCPM5-2B-oQ3e es una cuantizacion de precision mixta en formato MLX del modelo OpenBMB/MiniCPM5-2B, publicada por Uraion Labs. No es un modelo entrenado desde cero, sino una compresion del checkpoint original de OpenBMB (2.516.756.480 parametros, arquitectura LlamaForCausalLM) orientada a inferencia local en Macs con Apple Silicon. El resultado pesa 1,08 GB (1.110,44 MB) frente a los aproximadamente 5 GB que ocuparia el modelo en BF16, con un coste efectivo de unos 3,5 bits por peso.

El problema que resuelve es el de ejecutar un modelo de 2,5 B parametros con ventana de 131.072 tokens en equipos de consumo sin GPU dedicada. Para ello, Uraion Labs aplica su flujo de cuantizacion oMLX oQe con asignacion de sensibilidad guiada por matriz de importancia: la base es de 3 bits, pero 38 proyecciones criticas se elevan a 5 bits (31 capas) y a 6 bits (7 capas), lo que preserva las partes mas sensibles de la red. La cabeza de salida (`lm_head`) se mantiene en 3 bits, un detalle relevante porque otras variantes de la misma familia, como oQ3.5e, la suben a 6 bits.

Es relevante ahora porque permite desplegar un modelo con capacidades declaradas de razonamiento, codigo, tool calling y contexto largo en portatiles Mac de gama media, dentro del ecosistema MLX y con licencia Apache-2.0, sin depender de CUDA ni de servicios en la nube. La contrapartida es que la cuantizacion a 3 bits es agresiva y no hay datos publicos de evaluacion que cuantifiquen la degradacion frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLM` (`llama`), transformer denso con Grouped-Query Attention |
| Parametros totales | 2.516.756.480 (~2,52 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros sin embeddings | 1.981.982.720 (~1,98 B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | oQ3e: base 3 bits, perfil mixto 3/5/6 bits (31 capas a 5 bits, 7 capas a 6 bits), `lm_head` a 3 bits, grupo de 64, modo affine, tensores no cuantizados en BF16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors |
| Capas | 42 |
| Configuracion de atencion | GQA: 16 cabezas Q / 2 cabezas KV, dimension de cabeza 128 |
| Tamano de pesos | 1,08 GB (1.110,44 MB) |
| Bits efectivos por peso | ~3,5 |
| Dataset de calibracion | `oqe_code_multilingual` (294 muestras) |
| Runtime objetivo | Apple Silicon macOS (`omlx`, `mlx-lm`) |
| Modelo base | openbmb/MiniCPM5-2B |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso estandar `LlamaForCausalLM` de 42 capas, con atencion de consultas agrupadas (16 cabezas de consulta y 2 de clave/valor, con dimension de cabeza 128). Esta eleccion de GQA reduce de forma notable el tamano de la cache KV, algo critico cuando se quiere exprimir una ventana de 131.072 tokens en memoria unificada. El modelo original fue desarrollado por OpenBMB como la variante de 2 B de la serie MiniCPM5, y su entrenamiento sigue el curriculo de datos UltraData: Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, ademas de las fases de ajuste UltraData-SFT-2605, UltraData-SFT-Agent-2609 y de refuerzo UltraData-RL-2609, lo que indica un pipeline con SFT y RL posteriores al preentrenamiento.

La innovacion de esta ficha no esta en el entrenamiento, sino en la cuantizacion. Uraion Labs emplea el flujo oMLX oQe, que asigna precision de forma no uniforme segun la sensibilidad de cada proyeccion, estimada con una matriz de importancia. El resultado es un perfil mixto de 3/5/6 bits con 38 overrides de capa, calibrado sobre un conjunto de 294 muestras de codigo multilingue. Los pesos de LayerNorm y las escalas y sesgos de embeddings se mantienen en BF16, y la cuantizacion es de tipo affine con escala y sesgo por grupo de 64 elementos. El checkpoint conserva el formato estandar MLX, por lo que es compatible directamente con oMLX y mlx-lm sin conversion adicional.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo (hasta 131.072 tokens) para sintesis de documentos y razonamiento sobre repositorios completos.
- Razonamiento de varios pasos y generacion de codigo, heredados del modelo base y reforzados por el curriculo UltraData-Code y UltraData-RL-2609.
- Tool calling y function calling: el modelo base esta disenado explicitamente para llamadas a funciones con alta precision y generacion de salida estructurada.
- Flujos agenticos: soporte declarado para tareas de varios pasos con uso de herramientas, segun los datasets UltraData-SFT-Agent-2609 y las etiquetas del repositorio (`agent`, `agentic`).
- Generacion de salida estructurada (JSON y similares) para integracion en pipelines de datos.
- Capacidades matematicas basicas, apoyadas en el dataset UltraData-Math del modelo base.
- Multilinguismo limitado a ingles y chino; no se declaran otros idiomas.
- No se declaran capacidades de vision, audio ni modo de pensamiento explicito en la informacion disponible.

## Casos de uso

- Asistente conversacional totalmente local en un Mac: el modelo cabe en 1,08 GB y se ejecuta con MLX sin conexion a internet, lo que permite desplegar un chat privado en equipos con 8 GB de memoria unificada o mas.
- Copiloto de codigo en el IDE con contexto de repositorio: los 131.072 tokens de ventana permiten incluir varios ficheros fuente y el historial de cambios en una sola peticion, algo util para refactorizaciones que afectan a multiples modulos.
- Agente con tool calling en automatizacion de tareas: el modelo base esta optimizado para function calling y salida estructurada, de modo que puede actuar como planificador que invoca APIs, ejecuta consultas y encadena pasos intermedios.
- Extraccion de datos estructurados a partir de documentos largos: contratos, informes o articulos se pueden pasar completos dentro de la ventana y pedir como salida un JSON con los campos relevantes, sin trocear el documento.
- RAG on-device para bases de conocimiento privadas: al ejecutarse en el propio dispositivo, permite indexar y consultar documentacion confidencial sin enviar datos a terceros, con el contexto largo absorbiendo varios fragmentos recuperados a la vez.
- Revision de codigo automatizada en pipelines locales: integrado mediante `mlx-lm`, puede analizar diffs y generar comentarios de revision antes de un commit, sin coste de API.
- Investigacion sobre cuantizacion: la familia oQ permite comparar el mismo modelo en oQ8e, oQ6e, oQ5e, oQ4e, oQ3.5e, oQ3e, oQ2.7e y oQ2e manteniendo constante el resto de variables, lo que sirve para estudiar el equilibrio entre tamano y calidad.
- Despliegue educativo en aulas o laboratorios con Macs de gama media: el reducido peso del checkpoint facilita distribuir el modelo a muchos equipos sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de esta cuantizacion en la informacion disponible. La model card no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni metricas equivalentes para la variante oQ3e, ni comparaciones medidas contra el modelo base en BF16.

El unico dato numerico declarado por el autor del modelo base es una media de 53,9 en el conjunto de evaluacion propio de OpenBMB, cifra que se refiere a MiniCPM5-2B sin cuantizar y no debe extrapolarse a esta variante de 3 bits sin medicion directa. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existe validacion independiente de la comunidad.

| Aspecto | Dato disponible |
|---|---|
| Benchmarks de la cuantizacion oQ3e | No disponible |
| Benchmarks del modelo base (MiniCPM5-2B) | No disponibles por benchmark individual; media declarada de 53,9 en el conjunto de evaluacion de OpenBMB |
| Degradacion frente a BF16 | No disponible |
| Comparacion medida con otras cuantizaciones oQ | No disponible |

## Requisitos de hardware

- VRAM / memoria unificada para los pesos: 1,08 GB en el formato oQ3e.
- Cache KV a contexto completo: con 42 capas, 2 cabezas KV de 128 dimensiones y almacenamiento en precision de 16 bits, la cache ocupa del orden de 42 KB por token, lo que equivale a unos 5,4 GB en los 131.072 tokens. Es una estimacion derivada de la configuracion publicada, no un dato medido.
- Macs con 8 GB de memoria unificada: caben los pesos y conversaciones de contexto corto o medio, pero no la ventana completa de 131k.
- Macs con 16 GB: configuracion comoda para uso conversacional con contexto largo; 24 GB o mas permiten acercarse al limite de 131k con margen para el sistema.
- Chips M1/M2/M3/M4 base: suficientes para inferencia interactiva a contexto moderado. Chips Pro, Max y Ultra: recomendados para contextos muy largos, procesamiento por lotes o servidor local.
- No hay soporte CUDA: el formato MLX esta pensado para Apple Silicon, por lo que el checkpoint no se ejecuta directamente en GPU NVIDIA o AMD sin una conversion previa a otro formato.
- Opciones de despliegue: oMLX (runtime de alto rendimiento para modelos MLX) y mlx-lm, ambos compatibles de forma directa con el checkpoint. Para otros entornos seria necesario reconvertir los pesos a GGUF o safetensors estandar.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

La comparacion mas directa es con las otras cuantizaciones de la misma familia, publicadas por el mismo autor y sobre el mismo modelo base, todas con licencia Apache-2.0, contexto de 131.072 tokens y formato MLX safetensors:

| Variante | Bits base | Perfil mixto | `lm_head` | Tamano |
|---|---|---|---|---|
| oQ8e | 8 bits | Uniforme 8 bits | 8 bits | 2,49 GB |
| oQ6e | 6 bits | Mixto 6/8 bits (28 capas a 8 bits) | 6 bits | 1,95 GB |
| oQ5e | 5 bits | Mixto 5/6/8 bits (19 a 6 bits, 6 a 8 bits) | 6 bits | 1,67 GB |
| oQ4e | 4 bits | Mixto 4/5/6 bits (58 a 5 bits, 9 a 6 bits) | 4 bits | 1,38 GB |
| oQ3.5e | 3 bits | Mixto 3/5/6 bits (29 a 5 bits, 7 a 6 bits) | 6 bits | 1,17 GB |
| oQ3e | 3 bits | Mixto 3/5/6 bits (31 a 5 bits, 7 a 6 bits) | 3 bits | 1,08 GB |
| oQ2.7e | 2 bits | Mixto 2/5/6/8 bits (23 a 5 bits, 8 a 6 bits) | 8 bits | 0,98 GB |
| oQ2e | 2 bits | Mixto 2/5/6 bits (10 a 5 bits, 6 a 6 bits) | 6 bits | 0,88 GB |

La diferencia clave entre oQ3e y oQ3.5e es la precision de la cabeza de salida: oQ3e la deja en 3 bits y oQ3.5e la sube a 6 bits a cambio de 0,09 GB adicionales, un intercambio que en la practica suele favorecer a oQ3.5e si la calidad de generacion importa mas que el tamano final.

Frente a modelos de otras familias y tamano comparable, como las variantes de 2-3 B de Qwen, Llama o Gemma, no hay datos en la informacion proporcionada: no se dispone de parametros, contexto ni resultados de benchmark verificados para establecer una comparacion rigurosa, y ademas aquellos estan en formatos (safetensors, GGUF) que no son intercambiables con MLX sin conversion.

## Limitaciones y advertencias

- La cuantizacion a 3 bits es agresiva: el perfil efectivo de ~3,5 bits por peso implica una perdida de calidad frente a BF16 que no ha sido cuantificada en ningun benchmark publicado.
- La cabeza de salida (`lm_head`) se mantiene en 3 bits, el valor mas bajo de toda la familia oQ junto con oQ4e. Es un punto sensible porque afecta directamente a la distribucion de probabilidad de salida.
- El conjunto de calibracion (`oqe_code_multilingual`, 294 muestras) esta sesgado hacia codigo y contenido multilingue, lo que puede favorecer ese dominio en detrimento de texto general.
- No hay resultados de evaluacion publicados ni validacion independiente: el repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.
- Riesgo de alucinacion inherente a un modelo de 2,5 B parametros, agravado por la compresion a 3 bits; no debe usarse como fuente de verdad sin verificacion externa en dominios factuales.
- Idiomas soportados limitados a ingles y chino. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- La ventana de 131.072 tokens es nominal: no se publican resultados de evaluacion en contextos largos (tipo aguja en un pajar) para esta cuantizacion.
- Formato MLX exclusivo: no se ejecuta en GPU NVIDIA o AMD ni en servidores x86 convencionales sin una conversion previa, lo que restringe su uso en produccion a entornos Apple Silicon.
- Licencia Apache-2.0 en el modelo base y en la cuantizacion: permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de licencia. No hay clausulas adicionales declaradas por el cuantizador.
- Al ser un artefacto derivado, los sesgos del modelo original se conservan; no se ha realizado ningun ajuste adicional que los mitigue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3e
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Runtime oMLX: https://github.com/jundot/omlx
- mlx-lm (MLX Examples): https://github.com/ml-explore/mlx-examples/tree/main/llms/mlx_lm
- Uraion Labs: https://uraionlabs.com
- Paper del modelo base (arxiv:2506.07900): https://arxiv.org/abs/2506.07900
- Paper adicional citado (arxiv:2602.09003): https://arxiv.org/abs/2602.09003
- Variante oQ8e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ8e
- Variante oQ6e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ6e
- Variante oQ5e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ5e
- Variante oQ4e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ4e
- Variante oQ3.5e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ3.5e
- Variante oQ2.7e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2.7e
- Variante oQ2e: https://huggingface.co/UraionLabs/MiniCPM5-2B-oQ2e
