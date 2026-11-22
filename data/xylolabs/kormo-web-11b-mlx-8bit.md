# Xylolabs/KORMo-Web-11B-MLX-8bit

## Resumen

KORMo-Web-11B-MLX-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo de lenguaje de KORMo-VL/KORMo-Web-11B, un decoder de estilo Llama con 10.756.624.384 parámetros. Lo publica el usuario Xylolabs y está pensado para ejecutarse con la librería `mlx-lm` sobre hardware Apple Silicon. La conversión conserva únicamente la torre de lenguaje: la torre de visión y el proyector de imágenes del modelo multimodal original no están incluidos, por lo que este repositorio acepta texto y devuelve texto.

El modelo base lo desarrolla KORMo-VL (vinculado a KAIST MLP Lab, según la nota de no afiliación del autor de la conversión) y está orientado a generación de texto conversacional en coreano e inglés. La cuantización aplica 8 bits afines con tamaño de grupo 64 a las capas lineales, el embedding y la LM head, mientras que las normas se mantienen en f16. El resultado son 11,43 GB de pesos en tres ficheros safetensors.

La relevancia de esta ficha es doble: por un lado, ofrece una vía práctica de desplegar un modelo de 10,76B en Macs con memoria unificada, con una fidelidad muy alta respecto al BF16 original (98,74% de acuerdo top-1 en WikiText-2 y divergencia KL media de 0,000651). Por otro, documenta con precisión las pérdidas que introduce la cuantización, algo que rara vez se publica con este nivel de detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de estilo Llama (layout Llama en MLX) |
| Parametros totales | 10.756.624.384 (10,76B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8-bit (lineales, embedding y LM head en affine 8-bit, group size 64; normas en f16); el autor publica tambien una variante MLX 4-bit de 6,56 GB |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 3 shards, 11,43 GB; incluye `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es un decoder transformer de estilo Llama con 10,76B parámetros. La conversión renombra dos tensores de norma por capa a los nombres que espera Llama para que `mlx-lm` cargue el modelo como `llama`, y aplica cuantización afín de 8 bits con grupo de 64 a las capas lineales, el embedding y la LM head, dejando las normas en f16. El tokenizador, la plantilla de chat y la configuración de generación se heredan sin cambios del modelo base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original, más allá de que el modelo base es multimodal (con torre de visión y proyector de imágenes, excluidos en esta conversión). El autor documenta la revisión de origen y los cambios aplicados en `ORIGINS.md` y `NOTICE`.

## Capacidades

- Generación de texto conversacional en coreano e inglés, con plantilla de chat heredada del modelo base.
- Razonamiento y respuesta multi-turno dentro de los límites de contexto del modelo original (longitud no especificada en la información disponible).
- Conversión de texto a texto: la entrada de imágenes y las funciones de agente GUI del modelo original no están soportadas en este repositorio.
- No incluye torre de visión ni proyector de imágenes, por lo que no procesa entradas multimodales.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta modo de razonamiento explícito (thinking mode) ni capacidades de audio.

## Casos de uso

- Asistencia conversacional en coreano en local: el modelo puede gestionar diálogos multi-turno en un Mac con memoria unificada suficiente, sin depender de servicios en la nube, usando la plantilla de chat del modelo base.
- Prototipado rápido en Apple Silicon: con `mlx-lm` y una sola instrucción (`mlx_lm.chat`) se puede tener un chat funcional de 10,76B en un portátil o equipo de sobremesa Apple, lo que acelera la evaluación de ideas antes de pasar a producción.
- Generación de texto en inglés para tareas de redacción y resumen: al conservar el 98,74% de acuerdo top-1 con BF16 en WikiText-2, es adecuado para tareas donde la fidelidad respecto al modelo completo importa y el hardware es limitado.
- Evaluación comparativa de cuantizaciones: el repositorio incluye `accuracy-by-size.csv` y gráficas de KL y top-1 frente a BF16, lo que permite medir el impacto de 4-bit frente a 8-bit en un mismo pipeline antes de elegir el formato definitivo.
- Investigación sobre cuantización: sirve como caso de estudio reproducible de conversión MLX 8-bit con métricas de divergencia publicadas, útil para estudiar el compromiso entre tamaño y fidelidad.
- Despliegue de bajo consumo en equipos Apple para tareas internas de generación de texto en coreano e inglés, donde la licencia Apache 2.0 facilita la integración sin restricciones de uso comercial.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de la cuantización frente al modelo BF16 (divergencia KL media, menor es mejor; y acuerdo top-1 con BF16):

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Texto largo KL | top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 6,56 GB | 0,090664 | 86,946% | 0,134076 | 87,157% | 0,070785 | 87,651% |
| MLX 8-bit | 11,43 GB | 0,000651 | 98,740% | 0,001227 | 98,804% | 0,000587 | 98,900% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 11,43 GB solo para los pesos en 8-bit; con overhead de ejecución conviene reservar 14-16 GB de memoria unificada. La variante 4-bit del mismo autor ocupa 6,56 GB.
- Hardware recomendado: equipos Apple Silicon con memoria unificada de 16 GB o más (M1 Pro/Max, M2 Pro/Max/Ultra, M3/M4 Pro/Max). No está pensado para GPU NVIDIA: el formato MLX es específico de Apple.
- En GPU consumer NVIDIA no es desplegable directamente en este formato; requeriría reconversión a otro formato (por ejemplo GGUF o safetensors estándar) a partir del modelo base.
- Opciones de despliegue: `mlx-lm` 0.32.2 mediante `mlx_lm.generate` y `mlx_lm.chat`. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| KORMo-Web-11B-MLX-8bit (este) | 10,76B | no disponible | MLX safetensors 8-bit | Apache 2.0 | Solo texto; fidelidad 98,74% top-1 vs BF16 |
| KORMo-Web-11B-MLX-4bit (mismo autor) | 10,76B | no disponible | MLX safetensors 4-bit | Apache 2.0 | 6,56 GB; fidelidad 86,95% top-1 vs BF16 |
| KORMo-VL/KORMo-Web-11B (base) | 10,76B | no disponible | safetensors | Apache 2.0 | Multimodal completo (visión + agente GUI), presumiblemente BF16 |

No se dispone de información sobre modelos comparables de otros desarrolladores con las mismas características (tamaño, idiomas y licencia) en la documentación proporcionada.

## Limitaciones y advertencias

- La torre de visión y el proyector de imágenes del modelo original no están incluidos: no admite entradas de imagen ni funciones de agente GUI, a pesar de que el modelo base es multimodal.
- Solo soporta coreano e inglés; no se documenta cobertura de otros idiomas.
- La longitud de contexto no se especifica en la información disponible, lo que impide garantizar conversaciones o documentos largos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de veracidad.
- No se documentan sesgos conocidos en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el autor aclara que el repositorio del modelo base no incluye fichero de licencia y que el texto Apache 2.0 se añade en esta conversión; conviene revisar `ORIGINS.md` y `NOTICE` antes de un despliegue en producción.
- El autor declara no estar afiliado ni respaldado por KAIST MLP Lab.
- El formato MLX limita el despliegue a hardware Apple Silicon; para otros entornos habría que reconvertir desde el modelo base.
- La cuantización 8-bit introduce una divergencia KL media de 0,000651 y un acuerdo top-1 del 98,74% frente a BF16, por lo que no es idéntica al modelo original.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Xylolabs/KORMo-Web-11B-MLX-8bit
- Modelo base: https://huggingface.co/KORMo-VL/KORMo-Web-11B
- Licencia Apache 2.0 en el repositorio: https://huggingface.co/Xylolabs/KORMo-Web-11B-MLX-8bit/blob/main/LICENSE
- Librería MLX: https://github.com/ml-explore/mlx
- `mlx-lm`: https://github.com/ml-explore/mlx-lm
- Repositorio de herramientas del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
