# sprapp/malay35b-pqm

## Resumen

malay35b-pqm (denominado comercialmente Oaica 35B Malay 260827) es un ajuste derivado del modelo MoE Qwen3.6-35B-A3B de Alibaba Cloud, desarrollado por sprapp / BCZ Singapore Pte Ltd. Sobre el backbone original se aplica un proceso de continued-pretrain (CPT) y SFT orientado al malayo, y el resultado se exporta a `.pqm`, un contenedor propietario empaquetado en formato Marlin de precisión mixta para el servidor de inferencia `prism-engine`. No es un modelo fundacional entrenado desde cero, sino una obra derivada de pesos con licencia Apache-2.0.

La arquitectura subyacente es un MoE híbrido con Gated DeltaNet: 40 capas, de las cuales 30 son de atención lineal Gated DeltaNet y 10 son de atención completa, con 256 expertos enrutados más 1 experto compartido por capa MoE y enrutamiento top-8. El vocabulario se amplió en 243 tokens durante el CPT hasta 248077 entradas. La distribución del repositorio ocupa 39,9 GB porque los bytes de los expertos enrutados se almacenan sin recomprimir (`--cpu-moe-passthrough`), lo que permite el mismo fichero tanto para residencia completa en GPU como para offload de expertos a RAM de host.

Su relevancia es acotada y muy específica: cubre el hueco de modelos de gran tamaño con competencia real en malayo (ms) e inglés (en) sobre una base MoE eficiente, pero impone una dependencia total de un motor de inferencia propietario. No es ejecutable con vLLM, llama.cpp, Ollama ni transformers, y no incluye tokenizador embebido. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con Gated DeltaNet (atención lineal) + atención completa; 40 capas (30 Gated DeltaNet, 10 full attention), hidden_size=2048 |
| Parametros totales | 35 000 millones (designación del modelo base Qwen3.6-35B-A3B) |
| Parametros activos | Aproximadamente 3 000 millones por token (inferido del identificador A3B del modelo base; no confirmado explícitamente en la model card). Enrutamiento top-8 sobre 256 expertos enrutados + 1 compartido por capa MoE |
| Longitud de contexto | 8192 tokens en la configuración de servicio documentada (`--max-seq 8192`). Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | Mezcla Marlin-packed: Q4_K (embeddings, attn_qkv, attn_output, attn_gate, expertos enrutados), Q6_K (experto compartido, output.weight), F32 (norms y puertas SSM). ~4,56 bits por peso efectivos |
| Idiomas soportados | Malayo (ms), inglés (en) |
| Licencia | `other` / `bcz-proprietary`. Capa propietaria © 2026 BCZ Singapore Pte Ltd (contenedor `.pqm`, receta CPT+SFT, `prism-engine`); pesos base bajo Apache-2.0 |
| Formato de pesos | `.pqm` (contenedor propietario, Marlin-packed, arranque autónomo sin GGUF). Tokenizador en fichero `.tok` independiente (`malay35b.tok`) |
| Vocabulario | 248077 tokens (243 añadidos sobre la base durante el CPT) |
| Tamaño del repositorio | 39,9 GB |
| Variante | Base (sin merges) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, un transformer MoE que combina dos mecanismos de atención en la misma pila: 30 de las 40 capas emplean Gated DeltaNet, una forma de atención lineal con compuertas recurrentes que reduce el coste cuadrático en secuencias largas, mientras que las 10 capas restantes mantienen atención completa. Cada capa MoE contiene 256 expertos enrutados más un experto compartido, con activación top-8, lo que concentra el cómputo por token en una fracción pequeña de los 35 000 millones de parámetros totales. El `hidden_size` es 2048.

Sobre esa base, el autor aplica continued-pretrain y SFT con foco en malayo, ampliando el vocabulario en 243 tokens, y posteriormente reempaqueta los pesos en `.pqm`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon fases de RLHF o DPO. La innovación técnica diferencial no está en el entrenamiento sino en el empaquetado: un contenedor de precisión mixta que almacena los expertos enrutados en bruto para que el mismo fichero sirva tanto en residencia completa en GPU como con offload parcial a RAM del host. El modelo siempre genera primero un bloque `<think>` de razonamiento (aproximadamente 100 a 900 tokens según el prompt), que el servidor puede ocultar al cliente mediante `PRISMX_STRIP_THINK_OPENAI=1`.

## Capacidades

- Generación de texto en malayo e inglés con calidad coherente verificada en arranque sobre A100 (sm_80) y RTX 4060 (sm_89).
- Razonamiento aritmético: la verificación del autor reporta razonamiento aritmético correcto.
- Modo de razonamiento explícito: toda respuesta pasa por un bloque `<think>...</think>` previo de 100 a 900 tokens, configurable para ocultarse en la API compatible con OpenAI.
- Codificación: capacidad no documentada de forma explícita y afectada por un fallo abierto conocido de pérdida o duplicación intermitente de subtokens en algunos prompts de código y aritmética.
- Salida estructurada: soporte parcial; el propio autor advierte de que el JSON estricto puede salir malformado en ocasiones y recomienda validar la salida en el downstream.
- Visión: no está activa por defecto. Requiere injertar el puente externo `sprappcom/qwen36-vision-tower` (la model card se trunca al describir este punto).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas distintos de malayo e inglés: no soportados según los metadatos de idioma declarados.

## Casos de uso

- Atención al cliente en malayo: el modelo puede mantener conversaciones multi-turno en malayo e inglés con ventanas de hasta 8192 tokens, suficiente para hilos de soporte con historial e instrucciones de sistema extensas. Requiere `max_tokens` de al menos 1000 para prosa, ya que el bloque `<think>` consume parte del presupuesto.
- Generación de contenido editorial en malayo: redacción de artículos, resúmenes y descripciones de producto en registro formal malayo, aprovechando el continued-pretrain específico de idioma frente a la base Qwen, que no está optimizada para malayo.
- Traducción asistida ms↔en: traducción bidireccional en pipelines internos donde se controle el motor de inferencia y se pueda validar la salida, con la advertencia de que no se documentan métricas de calidad de traducción.
- Procesamiento de documentos administrativos malayos: extracción y síntesis de cláusulas o resúmenes sobre documentos largos, siempre que se validen downstream las salidas estructuradas por el riesgo conocido de JSON malformado.
- Despliegue en hardware de gama media con offload: con `--n-cpu-moe 38 --moe-cache-experts 512`, el modelo se ejecuta de forma coherente en una GPU de 8 GB (RTX 4060 Laptop, ~5,8 GB de VRAM y ~16 GB de RAM de host), lo que habilita prototipos y pruebas locales sin clúster.
- Servicio de inferencia en producción sobre A100: con `--n-cpu-moe 36 --moe-cache-experts 2048 --max-batch 1 --max-seq 8192` la configuración medida es de 10,9 GB de VRAM más 15,2 GiB de RAM de host page-locked a ~40 tok/s, adecuada para cargas de baja concurrencia y alta exigencia de idioma malayo.
- Asistente de razonamiento paso a paso en dominios técnicos: el modo `<think>` obligatorio permite exponer la cadena de razonamiento al usuario final en herramientas educativas o de análisis, con la salvedad de que la longitud del razonamiento varía entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única evidencia de rendimiento aportada por el autor es cualitativa y de verificación de arranque: salidas coherentes en inglés y malayo y razonamiento aritmético correcto sobre A100 (sm_80) y RTX 4060 (sm_89), con coincidencia del SHA-256 del fichero `.pqm` con el servido en producción. El dato cuantitativo disponible es de throughput de servicio, no de calidad: aproximadamente 40 tok/s en la configuración de producción sobre A100 80 GB.

## Requisitos de hardware

- VRAM para residencia completa: aproximadamente 19 GB solo de pesos, más el scratch de batch. El repositorio ocupa 39,9 GB en disco por el almacenamiento en bruto de los expertos enrutados.
- GPU validadas: A100 (sm_80) y arquitecturas Ada/Ampere (sm_86/sm_89). No se documenta validación en Hopper (sm_90) ni en otras arquitecturas.
- Configuración de producción medida en A100 80 GB: `--n-cpu-moe 36 --moe-cache-experts 2048 --max-batch 1 --max-seq 8192` da 10,9 GB de VRAM y 15,2 GiB de RAM de host page-locked a ~40 tok/s.
- Configuración en GPU de consumo: RTX 4060 Laptop de 8 GB con `--n-cpu-moe 38 --moe-cache-experts 512` consume ~5,8 GB de VRAM y ~16 GB de RAM de host, con salida coherente. Modelos de 8 GB o superiores son viables con esta ruta de offload.
- RAM de host: factor limitante real en despliegues con offload; entre 15 y 16 GB page-locked en las configuraciones medidas.
- Opciones de despliegue: exclusivamente `prism-engine` (servidor propietario Rust/CUDA, no incluido en el repositorio). No es compatible con vLLM, llama.cpp, Ollama ni transformers. Requiere el fichero tokenizador externo vía `PRISMX_TOKENIZER`.
- API: endpoints compatibles con OpenAI `POST /v1/completions` y `POST /v1/chat/completions`, con streaming.
- Latencia y throughput: ~40 tok/s en el escenario A100 documentado. No hay datos de latencia por petición ni de throughput con lotes mayores, ya que todas las configuraciones medidas usan `--max-batch 1`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Rendimiento |
|---|---|---|---|---|---|
| sprapp/malay35b-pqm (este) | 35B totales, ~3B activos | 8192 en servicio | `.pqm` solo con `prism-engine` | Propietaria BCZ + base Apache-2.0 | Sin benchmarks publicados; ~40 tok/s en A100 con offload |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B totales, ~3B activos | No disponible | safetensors y ecosistema estándar (vLLM, TGI, etc.) | Apache-2.0 | No disponible |
| Otros modelos especializados en malayo de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa relevante es con el propio modelo base: malay35b-pqm añade continued-pretrain y SFT en malayo, 243 tokens de vocabulario y un empaquetado de ~4,56 BPW, pero pierde la portabilidad del original (Apache-2.0, ejecutable en el ecosistema estándar) y pasa a depender de un contenedor y un motor propietarios. No se dispone de datos para comparar con alternativas de la misma categoría en malayo.

## Limitaciones y advertencias

- Dependencia total de un motor propietario: el contenedor `.pqm` no es legible por vLLM, llama.cpp, Ollama ni transformers, y `prism-engine` no se distribuye en el repositorio; su acceso requiere contactar con el proveedor.
- Tokenizador externo obligatorio: el `.pqm` no embebe tokenizador y el arranque falla sin el fichero `.tok` pasado por `PRISMX_TOKENIZER`.
- Fallo abierto de tokenización: se documentan caídas o duplicaciones intermitentes de subtokens en algunos prompts de código y aritmética, en investigación. El JSON estricto puede salir malformado; hay que validar la salida estructurada aguas abajo en cualquier uso en producción.
- Colapso con decodificación greedy: `temperature=0` puede provocar repetición o emisión de tokens basura en esta pila de servicio. Es obligatorio usar `temperature >= 0.15` (el autor recomienda `PRISMX_MIN_TEMPERATURE=0.15`).
- Presupuesto de tokens: el bloque `<think>` obligatorio consume entre 100 y 900 tokens. Con `PRISMX_STRIP_THINK_OPENAI=1` hay que enviar `max_tokens >= 1000` para prosa o malayo y `>= 2000` con imágenes, o la respuesta vuelve vacía con `finish_reason: "length"`.
- Sin visión por defecto: la entrada de imagen requiere el puente externo `sprappcom/qwen36-vision-tower`.
- Cobertura de idiomas limitada a malayo e inglés; no se declaran otros idiomas.
- Licencia restrictiva para uso comercial: aunque los pesos base son Apache-2.0, el contenedor `.pqm`, la receta de CPT/SFT y el motor `prism-engine` son propiedad de BCZ Singapore Pte Ltd y requieren una licencia separada. El uso comercial del artefacto tal cual se distribuye no está cubierto por Apache-2.0.
- Sesgos y alucinación: no se documenta ninguna evaluación de sesgos ni de tasas de alucinación. Al ser un ajuste especializado en un único idioma sobre un corpus no especificado, el riesgo de alucinación en dominios factuales no está acotado.
- Inmadurez del artefacto: 0 descargas y 0 likes, publicaciones de septiembre de 2026 y ausencia total de benchmarks públicos. No se recomienda su adopción en producción sin una evaluación propia.
- Orden de argumentos no intuitivo en el servidor: el primer argumento posicional es la ruta del modelo y el segundo la dirección de escucha; invertirlos hace que el servidor ignore la dirección y use `0.0.0.0:8080`.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces recuperados no guardan relación con el artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sprapp/malay35b-pqm
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Fichero de atribución y licencia (NOTICE): https://huggingface.co/sprappcom/oaica-35b-malay-260827/blob/main/NOTICE
- Puente de visión para entrada de imagen: https://huggingface.co/sprappcom/qwen36-vision-tower
- Papers, blogs, repositorios o demos adicionales: no disponible (la búsqueda web no devolvió resultados relevantes)
