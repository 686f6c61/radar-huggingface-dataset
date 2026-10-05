# teru00801/hawks-qwen3_5-35b-a3b-rlbase-merged-1004

## Resumen

El modelo `teru00801/hawks-qwen3_5-35b-a3b-rlbase-merged-1004` es una fusion (merge) en formato HuggingFace de un modelo de la familia Qwen3.5, publicado por el usuario teru00801. Se trata de un modelo multimodal de tipo image-text-to-text, construido sobre el modelo base `unsloth/Qwen3.5-35B-A3B`, con arquitectura Mixture of Experts (MoE) segun la etiqueta `qwen3_5_moe` y la nomenclatura del nombre (35B-A3B, es decir, aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token).

El repositorio se presenta explicitamente como la version fused/merged en precision completa, pensada como fuente para conversiones posteriores (por ejemplo, cuantizacion MLX para Apple Silicon o futuros formatos de runtime). No es, por tanto, un modelo entrenado desde cero ni una release oficial de Alibaba/Qwen, sino una reintegracion de pesos distribuida de forma comunitaria. Esto lo hace relevante sobre todo para desarrolladores que necesitan un checkpoint en safetensors estable a partir del cual derivar versiones cuantizadas o empaquetados GGUF.

El modelo acumula 0 descargas y 0 likes en el momento de la consulta, esta creado el 4 de octubre de 2026 y ocupa 71,9 GB en el repositorio. La model card es minima y no aporta informacion sobre datos de entrenamiento, licencia, idiomas ni evaluaciones, por lo que buena parte de las especificaciones habituales figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) tipo transformer, segun etiqueta `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (aproximadamente 35,95 mil millones) |
| Parametros activos | Aproximadamente 3.000 millones (inferido de la nomenclatura "A3B"; no confirmado en la model card) |
| Longitud de contexto | No disponible (los resultados de busqueda para variantes relacionadas citan 4.096 y 32.768 tokens de forma contradictoria) |
| Tipos de cuantizacion | No especificados en este repositorio; el autor publica variantes GGUF y MLX 4-bit en repos separados |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato HuggingFace, via libreria transformers) |
| Tamano del repositorio | 71,9 GB |
| Modalidades | Imagen y texto (pipeline image-text-to-text) |
| Modelo base | unsloth/Qwen3.5-35B-A3B |

## Arquitectura y entrenamiento

La arquitectura es una Mixture of Experts (MoE) de tipo transformer, segun la etiqueta oficial `qwen3_5_moe` y la convencion de nombres de Qwen (el sufijo "A3B" indica parametros activos del orden de 3.000 millones). El modelo incorpora capacidad multimodal de entrada imagen+texto, dado que el pipeline declarado es `image-text-to-text`. No se dispone de informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo fases de RLHF, DPO o cualquier otro ajuste por preferencias.

El repositorio no documenta el proceso de merge ni que adaptadores o pesos se fusionaron con el modelo base. La model card unicamente indica que contiene el modelo "merged/fused" en formato HuggingFace y que su proposito es servir como fuente que preserva la precision para conversiones posteriores. No se detallan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, variantes de atencion, etc.) mas alla de lo implicito en la familia Qwen3.5 de la que deriva.

## Capacidades

- Generacion de texto conversacional, segun las etiquetas `conversational` y `qwen`.
- Procesamiento multimodal de imagen y texto (entrada image-text-to-text).
- Razonamiento y generacion asistida por arquitectura MoE, con activacion dispersa por token.
- Compatibilidad de endpoints declarada mediante la etiqueta `endpoints_compatible`.
- Compatibilidad con la libreria transformers para carga directa del checkpoint.
- Capacidades de tool calling, function calling, agentes o thinking mode: no disponibles en la informacion proporcionada.
- Capacidades multilingues especificas: no disponibles.

## Casos de uso

- Conversion y cuantizacion: el repositorio esta pensado como fuente en precision completa para generar versiones GGUF o MLX, por lo que su uso principal es servir de base a pipelines de compresion y empaquetado para distintos runtimes.
- Despliegue multimodal en produccion: al aceptar entradas de imagen y texto, puede integrarse en servicios que requieran descripcion de imagenes acompanadas de instrucciones textuales.
- Asistentes conversacionales con contexto medio: la arquitectura MoE permite servir 35.000 millones de parametros con un coste de computo por token mas bajo que un modelo denso equivalente, util para chat multi-turno en infraestructura moderada.
- Investigacion sobre fusion de pesos: permite estudiar como afecta un merge no documentado al comportamiento del modelo base `unsloth/Qwen3.5-35B-A3B`.
- Generacion de variantes derivadas: sirve como punto de partida reproducible para equipos que quieran publicar sus propias cuantizaciones (4-bit, 8-bit) a partir de un checkpoint en safetensors.
- Evaluacion comparativa de modelos MoE: util para benchmarks internos frente a otros MoE de rango 30-40B, aprovechando la activacion dispersa para medir throughput frente a calidad.
- Inferencia en Apple Silicon: dado que el autor documenta y publica variantes MLX, el flujo `mlx_lm.convert` de esta fuente permite desplegar el modelo en equipos con chip de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (FP16/BF16): alrededor de 72 GB solo para pesos, mas memoria para el contexto y el runtime.
- VRAM estimada en cuantizacion 8-bit: aproximadamente 36-40 GB.
- VRAM estimada en cuantizacion 4-bit: aproximadamente 18-22 GB.
- GPU recomendadas: H100 o A100 80 GB para precision completa; A100 40 GB o L40S en 8-bit; RTX 4090 (24 GB) o RTX 3090 en 4-bit con contexto contenido.
- Consumer GPU: cabe con cuantizacion 4-bit en tarjetas de 24 GB (RTX 4090, RTX 3090, RTX 4080 con margen ajustado), no cabe en precision completa ni en 8-bit en GPUs de consumo habituales.
- Opciones de despliegue: transformers como formato nativo del repositorio; el autor referencia `mlx_lm.convert` para Apple Silicon y mantiene un paquete GGUF separado (`teru00801/hawks-qwen3_5-35b-a3b-rlbase-gguf-1004`) utilizable con llama.cpp u Ollama. vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. Al ser MoE con unos 3.000 millones de parametros activos, se espera una latencia por token mas baja que la de un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| teru00801/hawks-qwen3_5-35b-a3b-rlbase-merged-1004 | 35,95 B (MoE, ~3 B activos) | no disponible | sin benchmarks publicados | no disponible | HuggingFace, 0 descargas |
| unsloth/Qwen3.5-35B-A3B | 35 B (MoE) | no disponible | no disponible en esta informacion | no disponible | HuggingFace (modelo base) |
| teru00801/hawks-qwen3_5-35b-a3b-mlx-4bit-0930 | derivado del anterior, cuantizado 4-bit | 32.768 segun resultados de busqueda | no disponible | no disponible | HuggingFace (variante MLX) |

Nota: los datos de contexto de las variantes provienen de resultados de busqueda de terceros (free2aitools) y son contradictorios entre si (4.096 frente a 32.768 tokens), por lo que no se consideran fiables.

## Limitaciones y advertencias

- La model card no documenta el proceso de merge, lo que impide auditar que pesos o adaptadores se han fusionado.
- Sin datos de benchmarks publicados en la informacion disponible.
- Sin informacion sobre licencia: existe incertidumbre legal para uso comercial, agravada por derivar de un modelo de terceros cuya propia licencia no se cita.
- Sin informacion sobre idiomas soportados; el comportamiento multilingue no esta garantizado.
- Contexto maximo no confirmado (los datos de terceros son contradictorios), lo que dificulta dimensionar memoria y diseno de aplicaciones con ventanas largas.
- Riesgo de alucinacion no cuantificado por el autor.
- Sesgos del modelo base no documentados.
- Con 0 descargas y 0 likes, no existe validacion comunitaria ni evidencia de uso en produccion.
- La fecha de creacion indicada (2026-10-04) es posterior a la consulta, lo que sugiere metadatos inconsistentes en el repositorio.
- La etiqueta `merged` implica que se trata de una fusion, no de un entrenamiento supervisado adicional; el comportamiento puede diferir del modelo base.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-rlbase-merged-1004
- Repositorio GGUF referenciado en la model card: `teru00801/hawks-qwen3_5-35b-a3b-rlbase-gguf-1004` (URL no proporcionada de forma directa)
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-35B-A3B
- Variante relacionada (GitHub/HF): https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-merged-0601
- Variante relacionada (MLX 4-bit): https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-mlx-4bit-0930
- Ficha de terceros (GGUF): https://free2aitools.com/model/teru00801/hawks-qwen3_5-35b-a3b-gguf
- Ficha de terceros (MLX 4-bit 0710): https://free2aitools.com/model/teru00801/hawks-qwen3_5-35b-a3b-mlx-4bit-0710
- Proveedor de inferencia (FriendliAI): https://friendli.ai/models/teru00801/hawks-qwen3_5-35b-a3b-merged-0601
