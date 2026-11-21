# Xylolabs/gemma-4-31B-it-GGUF

## Resumen

Gemma 4 31B IT GGUF es una coleccion de cuantizaciones en formato GGUF del modelo google/gemma-4-31B-it, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base es un transformer denso multimodal de Google DeepMind, instruction-tuned, que acepta texto e imagen como entrada y genera texto, con una ventana de contexto de hasta 256K tokens y soporte de mas de 140 idiomas. Esta publicacion no introduce pesos nuevos: convierte los originales a GGUF y los cuantiza en siete variantes (de Q8_0 a Q2_K), incluyendo una version con matriz de importancia (IQ4_XS-imat).

La relevancia de esta ficha es practica: permite ejecutar un modelo de 30.697.345.596 parametros en hardware de consumo o en servidores de una sola GPU, con metricas de degradacion medidas frente a BF16 (KL medio y coincidencia top-1). El autor documenta ademas una comparacion directa con las cuantizaciones de Unsloth para Q6_K y Q5_K_M, lo que facilita la eleccion de fichero segun el presupuesto de VRAM y la tolerancia a perdida de calidad.

La licencia declarada es Apache 2.0, heredada del release de Gemma 4, y el repositorio incluye el proyector de vision en F16 (mmproj) necesario para el pipeline image-text-to-text. El modelo esta etiquetado con los idiomas en y ko, aunque la model card de Google describe soporte multilingue amplio en el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto e imagen), instruction-tuned; familia Gemma 4 con variantes densas y MoE, esta es densa |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (variante densa, no MoE) |
| Longitud de contexto | hasta 256K tokens (modelo base); el ejemplo de ejecucion usa -c 8192 |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, IQ4_XS-imat, Q3_K_M, IQ3_M, Q2_K |
| Idiomas soportados | en, ko (etiquetas del repo); el modelo base declara mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero por cuantizacion, tokenizer y chat template incluidos); proyector de vision mmproj en F16 |

Tabla de ficheros y calidad respecto a BF16 (8.048 posiciones de texto en ingles y coreano, formato chat):

| Quant | Tamano | KL medio vs BF16 | Mismo top-1 vs BF16 |
|---|---|---|---|
| Q8_0 | 32,64 GB | 0,0015 | 97,36% |
| Q6_K | 25,20 GB | 0,0048 | 95,78% |
| Q5_K_M | 21,85 GB | 0,0116 | 94,02% |
| IQ4_XS-imat | 16,74 GB | 0,0493 | 88,24% |
| Q3_K_M | 15,29 GB | 0,1086 | 83,72% |
| IQ3_M | 14,42 GB | 0,1230 | 83,13% |
| Q2_K | 11,92 GB | 0,4023 | 71,12% |

Receta de tensores: las matrices de pesos y el embedding atado usan el tipo de cuantizacion del fichero; las normas y otros vectores pequenos (422 tensores) se mantienen en F32.

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Gemma 4 de Google DeepMind, que combina variantes densas y Mixture-of-Experts en cinco tamanos (E2B, E4B, 12B, 26B A4B y 31B). Esta ficha corresponde a la variante densa de 31B en version instruction-tuned, con arquitectura transformer multimodal: procesa texto e imagen con soporte de relacion de aspecto y resolucion variable, y en otros tamanos de la familia (E2B, E4B, 12B) tambien audio. La familia incorpora modos de razonamiento configurables (thinking modes) y soporte nativo del rol `system` en el chat template.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base, ya que la model card incluida en el repositorio esta truncada. La innovacion tecnica documentada en esta publicacion es la cuantizacion: Xylolabs aplica una receta con normas en F32 y una variante con matriz de importancia (IQ4_XS-imat), y publica metricas de divergencia KL frente a su propia pasada en BF16 con transformers, lo que permite estimar la perdida de calidad de cada fichero de forma cuantitativa.

## Capacidades

- Generacion de texto y razonamiento con modos de pensamiento configurables (`enable_thinking` en el chat template).
- Procesamiento de imagen ademas de texto (pipeline image-text-to-text), mediante el proyector `mmproj-gemma-4-31B-it-F16.gguf`.
- Generacion de codigo y capacidades agenticas mejoradas respecto a generaciones anteriores de Gemma, segun la model card de Google.
- Soporte nativo de function calling / tool calling.
- Soporte nativo del rol `system` para conversaciones estructuradas.
- Capacidades multilingues: etiquetado en en y ko en este repo; el modelo base declara mas de 140 idiomas.
- Contexto largo de hasta 256K tokens en el modelo base.
- Ejecucion en llama.cpp sobre CUDA, Metal o CPU, con `llama-cli` y `llama-server`.

## Casos de uso

- Asistente conversacional multi-turno en local: con contexto de hasta 256K tokens en el modelo base, se puede mantener historiales largos y documentos de referencia en la misma ventana; la cuantizacion Q5_K_M (21,85 GB) ofrece un equilibrio razonable entre VRAM y calidad (KL 0,0116).
- Analisis de documentos con imagenes: el pipeline image-text-to-text y el proyector F16 permiten extraer informacion de capturas, diagramas o formularios escaneados junto con texto, desplegando `llama-server` con el mmproj.
- Generacion de codigo en pipelines de desarrollo: el soporte de tool calling y el rol `system` permiten integrar el modelo en asistentes de IDE o en flujos de CI/CD que invocan herramientas externas mediante function calling.
- Despliegue en hardware de consumo: con Q3_K_M (15,29 GB) o IQ4_XS-imat (16,74 GB) el modelo cabe en GPUs consumer de 24 GB de VRAM, lo que habilita prototipado y uso personal sin infraestructura de servidor.
- Atencion al cliente automatizada en ingles y coreano: el modelo esta evaluado en estos dos idiomas y soporta conversaciones multi-turno con contexto largo; Q6_K (25,20 GB, 95,78% de coincidencia top-1) reduce el riesgo de respuestas degradadas en produccion.
- Agentes autonomos con razonamiento multi-paso: los thinking modes configurables y el function calling nativo permiten construir agentes que planifican, invocan APIs y verifican resultados, ejecutados con `llama-server` como backend compatible con endpoints.
- Investigacion sobre cuantizacion: las metricas KL y top-1 publicadas por el autor permiten estudiar el impacto de distintas recetas (imat frente a estandar, Q6_K frente a Unsloth) en un modelo multimodal de 31B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo proporciona metricas de fidelidad de cuantizacion (KL medio y coincidencia top-1 frente a BF16), recogidas en la tabla de especificaciones tecnicas.

Comparacion de ficheros con las cuantizaciones de Unsloth (misma build, textos y referencia):

| Fichero | Tamano | KL medio vs BF16 | Mismo top-1 vs BF16 |
|---|---|---|---|
| Xylolabs Q6_K | 25,20 GB | 0,0048 | 95,78% |
| Unsloth Q6_K | 25,20 GB | 0,0054 | 95,47% |
| Xylolabs Q5_K_M | 21,85 GB | 0,0116 | 94,02% |
| Unsloth Q5_K_M | 21,66 GB | 0,0118 | 93,68% |
| Q8_0 (ambos) | 32,64 GB | 0,0015 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero mas overhead de contexto y cache KV. Rangos: 11,92 GB (Q2_K) hasta 32,64 GB (Q8_0); el proyector de vision F16 anade un consumo adicional no cuantificado en la informacion disponible.
- GPU recomendadas: para Q8_0 y Q6_K se requiere una GPU de 40-48 GB (A100 40GB, A6000, L40S) o reparto entre varias; Q5_K_M e IQ4_XS-imat encajan en 24 GB (RTX 4090, A10G, L4 24GB); Q3_K_M, IQ3_M y Q2_K permiten configuraciones en torno a 16 GB.
- Cabe en GPU consumer: si, desde Q5_K_M hacia abajo en GPUs de 24 GB; las variantes Q3 y Q2 abren la puerta a GPUs de 16 GB.
- Opciones de despliegue: llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior), con `llama-cli` y `llama-server`; el repo esta etiquetado como `endpoints_compatible`. No se documentan otras opciones (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 31B IT GGUF (Xylolabs) | 30,697B | hasta 256K (base) | GGUF, 7 cuantizaciones | Apache 2.0 | Metricas KL y top-1 publicadas; incluye mmproj F16 |
| Gemma 4 31B IT GGUF (Unsloth) | 30,697B | hasta 256K (base) | GGUF | Apache 2.0 | Solo comparables Q8_0, Q6_K y Q5_K_M; KL ligeramente superior en Q6_K y Q5_K_M |
| Gemma 4 31B IT (Google) | 30,697B | hasta 256K | safetensors | Apache 2.0 | Pesos originales en BF16; requiere transformers, no llama.cpp |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con modelos de otros desarrolladores de tamano similar; la comparacion se limita a variantes del mismo modelo base y a las cuantizaciones alternativas de Unsloth.

## Limitaciones y advertencias

- Las metricas de calidad son de fidelidad de cuantizacion, no de rendimiento en tareas; un KL bajo no garantiza ausencia de degradacion en razonamiento o codigo.
- Q2_K presenta una divergencia notable (KL 0,4023, 71,12% de coincidencia top-1): no es recomendable para produccion.
- El repo solo etiqueta en y ko como idiomas; el soporte de mas de 140 idiomas corresponde al modelo base y no ha sido verificado en estas cuantizaciones.
- La model card copiada de Google esta truncada en el repositorio, por lo que faltan detalles de entrenamiento, sesgos evaluados y recomendaciones de uso seguro.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones especificas de veracidad en esta publicacion.
- La licencia Apache 2.0 se hereda del release de Gemma 4; el autor declara no estar afiliado ni respaldado por Google. Conviene revisar el fichero LICENSE y NOTICE del repositorio antes de un uso comercial.
- Requiere una build concreta de llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior); versiones anteriores pueden no cargar el modelo.
- El consumo de VRAM del proyector de vision no esta cuantificado en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Codigo llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs citado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
- Paper referenciado en los tags (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia en el repositorio: https://huggingface.co/Xylolabs/gemma-4-31B-it-GGUF/blob/main/LICENSE
