# tetraturtle/Glistening-Gem-31B-v2.2-BF16-embd-GGUF

## Resumen
Glistening-Gem-31B-v2.2-BF16-embd-GGUF es una publicacion de cuantizaciones GGUF modificadas del modelo Glistening-Gem-31B-v2.2, un modelo de lenguaje conversacional de aproximadamente 32.100 millones de parametros. La publicacion la mantiene el usuario tetraturtle y deriva del trabajo previo de mradermacher (cuantizaciones i1) y sophosympatheia (modelo original). No se trata de un modelo entrenado desde cero, sino de una reempaquetado de pesos orientado a la inferencia local con llama.cpp e ik_llama.cpp.

El problema que aborda es concreto: la cuantizacion agresiva de la tabla de embeddings de entrada (`token_embd.weight`) degrada las representaciones de los tokens antes de que se ejecute la primera capa del transformer. En modelos con vocabularios grandes, como el Gemma 4 de 262.144 tokens que parece estar en la base, ese efecto es mas acusado. Esta publicacion restaura dicha tabla a BF16 sin perder la cuantizacion del resto de la red.

La relevancia es practica para quienes despliegan modelos de 31B en hardware limitado: al restaurar los embeddings en BF16 y mantener el LM head cuantizado, se puede descargar la tabla de embeddings a RAM del sistema con coste nulo de VRAM y un impacto despreciable en velocidad, ya que esa operacion es una simple busqueda por filas (`GGML_OP_GET_ROWS`) y no una multiplicacion matricial densa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Gemma 4, segun la model card) |
| Parametros totales | 32.106.631.740 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K (todas con `token_embd.weight` en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (compatible con llama.cpp e ik_llama.cpp) |

## Arquitectura y entrenamiento
La informacion disponible no detalla el proceso de entrenamiento del modelo base. Se sabe que Glistening-Gem-31B-v2.2 es un modelo conversacional de aproximadamente 32.100 millones de parametros, y la model card de esta publicacion menciona explicitamente "Gemma 4 con 262.144 tokens" como referencia del vocabulario, lo que sugiere que el modelo base deriva de la familia Gemma. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en el pipeline de cuantizacion. Los GGUF de origen tenian embeddings atados (`tied embeddings`), con `output.weight` omitido. El pipeline copia primero el tensor `token_embd.weight` cuantizado a `output.weight` para mantener el LM head cuantizado en GPU, y despues sustituye `token_embd.weight` por el tensor BF16 exacto procedente del modelo original de sophosympatheia. El resultado son GGUF con embeddings de entrada sin perdida y LM head cuantizado, lo que permite offload de la tabla BF16 a RAM sin coste de VRAM.

## Capacidades
- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Inferencia local mediante llama.cpp e ik_llama.cpp, con soporte de offload parcial de capas a GPU.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su integracion en servidores de inferencia.
- Capacidades multilingues: no disponibles en la informacion.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Vision, audio o modo thinking: no disponible en la informacion.

## Casos de uso
- Despliegue local en estaciones de trabajo con GPU de consumo: las variantes IQ3_XXS (13,87 GiB) e IQ4_XS (18,21 GiB) permiten ejecutar un modelo de 31B en GPUs de 16-24 GB de VRAM, descargando la tabla de embeddings BF16 a RAM del sistema sin penalizacion apreciable.
- Servidores de inferencia con llama.cpp: la compatibilidad con `endpoints_compatible` permite exponer el modelo como API compatible con OpenAI y usarlo como backend conversacional en aplicaciones internas.
- Prototipado de asistentes conversacionales: el modelo esta etiquetado como conversacional y puede emplearse para construir chatbots multi-turno en entornos de desarrollo antes de escalar a infraestructura mayor.
- Evaluacion comparativa de cuantizaciones: al ofrecer ocho niveles de cuantizacion con la misma tabla de embeddings en BF16, sirve para medir el impacto real de la cuantizacion del resto de pesos sin que el embedding contamine los resultados.
- Investigacion sobre calidad de embeddings: util para estudiar cuanto afecta la cuantizacion de `token_embd.weight` a la perplejidad y a la calidad de generacion en modelos de vocabulario grande.
- Uso en equipos con VRAM y RAM combinadas: la estrategia de offload de embeddings a RAM permite aprovechar configuraciones hibridas (por ejemplo, GPU de 12 GB mas 32 GB de RAM) donde un 31B completo no cabria de otra forma.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada segun cuantizacion: desde unos 14 GiB para IQ3_XXS hasta unos 26 GiB para Q6_K, mas overhead de contexto y cache KV.
- La tabla de embeddings en BF16 puede residir en RAM del sistema con coste nulo de VRAM, segun el autor.
- GPU recomendadas: RTX 4090 (24 GB) para IQ4_XS y Q4_K_M; A100 o H100 para Q6_K con contexto largo; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) para IQ3_XXS e IQ3_XS.
- Cabe en GPU de consumo: si, en RTX 4090 para cuantizaciones IQ4_XS, Q4_K_M y Q5_K_M; en GPUs de 16 GB para IQ3_XXS e IQ3_XS.
- Opciones de despliegue: llama.cpp, ik_llama.cpp y cualquier runtime compatible con GGUF que soporte offload selectivo de tensores.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Glistening-Gem-31B-v2.2-BF16-embd-GGUF | 32,1B | no disponible | no disponible | GGUF | Embeddings BF16, LM head cuantizado |
| mradermacher/Glistening-Gem-31B-v2.2-i1-GGUF | 32,1B | no disponible | no disponible | GGUF | Cuantizaciones i1 originales, sin restauracion BF16 de embeddings |
| sophosympatheia/Glistening-Gem-31B-v2.2 | 32,1B | no disponible | no disponible | safetensors (presumiblemente) | Modelo base sin cuantizar |

## Limitaciones y advertencias
- La licencia no esta declarada en la informacion disponible; antes de un uso comercial debe verificarse la licencia del modelo base (sophosympatheia/Glistening-Gem-31B-v2.2).
- No se dispone de informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen.
- La longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas sin verificacion previa.
- La model card menciona "Gemma 4" como referencia del vocabulario, pero no se confirma oficialmente la arquitectura exacta ni la procedencia de los pesos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad sobre la calidad de las cuantizaciones.
- El tamano del repo (158,4 GB) incluye todas las variantes; descargar solo el archivo GGUF deseado.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/tetraturtle/Glistening-Gem-31B-v2.2-BF16-embd-GGUF
- Modelo base original: https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.2
- Cuantizaciones i1 de origen: https://huggingface.co/mradermacher/Glistening-Gem-31B-v2.2-i1-GGUF
