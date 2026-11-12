# wesjos/Qwen3.5-4B-Arete-GGUF

## Resumen

Qwen3.5-4B-Arete-GGUF es la distribucion cuantizada en formato GGUF del modelo wesjos/Qwen3.5-4B-Arete, un ajuste fino mediante LoRA del modelo base Qwen3.5-4B. El autor, wesjos, entrena el modelo sobre la particion `sft_accepted` del dataset NousResearch/arete-data-pairs, con el objetivo declarado de modificar el comportamiento del modelo en temas controvertidos (alineamiento de valores) en lugar de ampliar su conocimiento factual. El resultado se publica en tres ficheros GGUF listos para llama.cpp.

El modelo conserva la arquitectura multimodal del Qwen3.5 base, con una torre de vision separada que se distribuye como fichero `mmproj` independiente. Los pesos de texto suman 4.205.751.296 parametros y el GGUF declara una longitud de contexto de 262.144 tokens, aunque el modelo fuente se entreno con 4.096, por lo que la calidad mas alla de esa ventana no esta garantizada por el ajuste.

Es relevante ahora porque demuestra el flujo completo de un ajuste de alineamiento de valores sobre un modelo de 4B con soporte multimodal, empaquetado para inferencia local en consumer hardware. La licencia Apache-2.0 y la disponibilidad de cuantizaciones Q4_K_M (2,52 GiB) y Q8_0 (4,17 GiB) lo hacen accesible en equipos de gama alta de consumo, aunque su utilidad practica esta limitada a ingles y a siete topicos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (qwen3_5) con torre de vision separada; soporte en llama.cpp |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 declarada en el GGUF; entrenado a 4.096 en el modelo fuente |
| Tipos de cuantizacion | Q8_0 (4,17 GiB), Q4_K_M (2,52 GiB), mmproj F16 (0,63 GiB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal con torre de vision. El ajuste se realizo con LoRA sobre todas las proyecciones lineales, entrenado sobre la particion `sft_accepted` de NousResearch/arete-data-pairs y posteriormente fusionado en los pesos base. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO adicionales. La conversion a GGUF se realizo mediante la ruta de exportacion de Unsloth.

La torre de vision no fue entrenada ni evaluada: el fichero `Qwen3.5-4B-Arete.F16-mmproj.gguf` es byte a byte el codificador visual del modelo base, con 298 tensores, 24 bloques, tamano de imagen 768, patch de 16, dimension de proyeccion 2560 y tipo de proyector `qwen3vl_merger`. Los GGUF de texto contienen 426 tensores (`blk.*` mas `token_embd`/`output_norm`) y no incluyen tensores de vision. El thinking mode esta activado por defecto, como en el modelo base, y se desactiva mediante la ruta `enable_thinking: false` de la plantilla de chat; Qwen3.5 no dispone de interruptor `/nothink`.

## Capacidades

- Generacion de texto conversacional con plantilla de chat Qwen3.5 embebida (8,9 KB) y EOS `<|im_end|>` (248046).
- Razonamiento con thinking mode activado por defecto; desactivable via plantilla para respuestas directas.
- Entrada de imagen a texto mediante llama-mtmd-cli o llama-server con `--mmproj` explicito (capacidad heredada del base, no entrenada ni evaluada en este ajuste).
- Ajuste de comportamiento en temas controvertidos en siete topicos definidos del dataset Arete (alineamiento de valores).
- Soporte de servidor compatible con API OpenAI mediante `llama-server`.
- Capacidades multilingues limitadas al ingles.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un asistente conversacional en ingles: con la cuantizacion Q4_K_M (2,52 GiB) el modelo cabe en GPUs de consumo y permite conversaciones multi-turno mediante `llama-server` con contexto configurable (por ejemplo `-c 8192`).
- Evaluacion de alineamiento de valores: util para investigadores que quieran comparar el comportamiento del modelo base frente al ajuste Arete en los siete topicos entrenados, usando la misma plantilla de chat y thinking mode.
- Prototipado de pipelines de vision-lenguaje: aunque no verificado, el modelo acepta imagenes via `llama-mtmd-cli` con el fichero `mmproj`, lo que permite experimentar con descripcion de imagenes en local sin dependencias de API.
- Servidor compatible con OpenAI para integracion en aplicaciones existentes: `llama-server` expone un endpoint que permite sustituir llamadas a APIs comerciales en pruebas de integracion con modelos de 4B.
- Experimentacion con cuantizaciones: la disponibilidad de Q8_0 y Q4_K_M con mezclas documentadas (177 tensores F32 de normas, 33 Q6_K, 216 Q4_K) permite medir la degradacion de calidad por cuantizacion en tareas de alineamiento.
- Base para ajustes posteriores: al ser Apache-2.0 y estar en GGUF, sirve como referencia para comparar recetas de cuantizacion o de fusion de LoRA en modelos multimodales pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6-3,0 GiB con Q4_K_M y 4,2-4,6 GiB con Q8_0, incluyendo overhead del runtime; anadir unos 0,63 GiB si se usa el proyector de vision.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para Q4_K_M (RTX 3060, RTX 4060, RTX 4090); para Q8_0 se recomienda 8 GB o mas.
- Cabe en GPU de consumo: si, en RTX 3060/4060 y superiores con Q4_K_M; en RTX 4090 o A100/H100 sin problema con cualquier cuantizacion.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli, llama-server); requiere una build reciente de `master` con soporte de arquitectura `qwen35`, ya que versiones antiguas fallan con error de arquitectura desconocida. Tambien es posible la descarga directa desde el Hub con `-hf wesjos/Qwen3.5-4B-Arete-GGUF:Q4_K_M`.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| wesjos/Qwen3.5-4B-Arete-GGUF | 4,2B | 262.144 declarado (entrenado a 4.096) | Apache-2.0 | GGUF | Ajuste de valores, solo ingles, vision no verificada |
| wesjos/Qwen3.5-4B-Arete | 4,2B | no disponible | Apache-2.0 | safetensors (modelo fuente) | Modelo original sin cuantizar |
| Qwen3.5-4B (base) | 4,2B | no disponible | no disponible | no disponible | Modelo base sin ajuste Arete; referencia de comparacion |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste es de valores/comportamiento, no de conocimiento: no hace al modelo mas factual y los datos de entrenamiento no fueron verificados.
- Solo se entrenaron siete topicos del dataset Arete; el resto del comportamiento es el del modelo base.
- Solo ingles; no hay soporte multilingue declarado.
- La torre de vision no fue entrenada ni evaluada: las respuestas sobre imagenes no llevan el alineamiento Arete y deben tratarse como no verificadas.
- La ventana de contexto de 262.144 tokens es declarada en el GGUF, pero el modelo fuente se entreno a 4.096; la calidad mas alla de esa longitud es la del base, no algo ensenado por este ajuste.
- Thinking mode activado por defecto; requiere gestion explicita via plantilla (`enable_thinking: false`) para respuestas directas.
- El fichero `mmproj` no sigue el patron de autodescubrimiento `mmproj-*` de llama.cpp, por lo que debe pasarse explicitamente con `--mmproj`.
- Requiere build reciente de llama.cpp con soporte `qwen35`; versiones antiguas fallan.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible, aunque aplican los del modelo base.
- Licencia Apache-2.0 permite uso comercial; los terminos de los datos siguen al dataset upstream.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/Qwen3.5-4B-Arete-GGUF
- Modelo fuente (safetensors): https://huggingface.co/wesjos/Qwen3.5-4B-Arete
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
