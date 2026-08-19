# yar-sh/Gemma-4-Gembrain-X-Core-31B-NVFP4

## Resumen

Gemma-4-Gembrain-X-Core-31B-NVFP4 es una cuantización NVFP4 (W4A4 group-16) del modelo base Nimbz/Gemma-4-Gembrain-X-Core-31B, un merge comunitario de Google Gemma-4-31B orientado a roleplay, escritura creativa y razonamiento multimodal. El autor, yar-sh, ha aplicado Intel AutoRound para reducir el peso del modelo a aproximadamente 20 GB en disco, manteniendo la torre de visión y la capa `lm_head` en BF16 para preservar las capacidades multimodales sin penalizar la velocidad de decodificación.

El modelo está diseñado para ejecutarse en una única GPU de 24 GB (Blackwell o DGX-Spark GB10) mediante vLLM, aprovechando el drafter MTP (Multi-Token Prediction) de Gemma-4 para acelerar la generación. En las pruebas publicadas sobre GB10 alcanza unos 19 tokens por segundo con MTP activado, frente a unos 11 sin él. La cuantización utiliza el formato `compressed-tensors` de vLLM, con detección automática de cuantización, y el repositorio incluye un `config.json` parcheado manualmente para corregir errores de exportación de AutoRound que impedían la carga en vLLM.

La relevancia de este modelo radica en ofrecer una alternativa ligera y desplegable en hardware de consumo para tareas que requieren contexto largo (hasta 262 144 tokens), generación de texto creativo y comprensión de imágenes, todo bajo la licencia Gemma de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4-31B (transformer multimodal con vision tower) |
| Parametros totales | 31B (aproximadamente; el conteo mostrado en HF puede ser menor por el empaquetado uint8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens (configurado en vLLM) |
| Tipos de cuantizacion | NVFP4 (W4A4 group-16) en los linears del decoder; vision tower y lm_head en BF16 |
| Idiomas soportados | ingles |
| Licencia | Gemma (licencia de Google DeepMind) |
| Formato de pesos | compressed-tensors (safetensors con empaquetado uint8) |

## Arquitectura y entrenamiento

El modelo base es un merge de Gemma-4-31B, una arquitectura transformer multimodal de Google DeepMind que combina un decoder de lenguaje con una torre de visión (vision tower) para procesar imágenes. El merge original (Nimbz/Gemma-4-Gembrain-X-Core-31B) está orientado a roleplay y escritura creativa, aunque no se han publicado detalles sobre los datos o el proceso de mezcla.

La cuantización NVFP4 se realizó con Intel AutoRound sobre el dataset NeelNanda/pile-10k, con 128 muestras, longitud de secuencia 2048 y 200 iteraciones. Se excluyeron de la cuantización la torre de visión y `lm_head` (parámetro `quant_nontext_module=False`), lo que preserva la entrada multimodal sin coste adicional de decodificación. El modelo hereda el drafter MTP de Gemma-4, que permite decodificación especulativa con dos tokens adicionales por paso.

El repositorio incluye un `config.json` corregido manualmente: AutoRound eliminó `global_head_dim` y `num_global_key_value_heads` del `text_config`, y subpobló la lista `quantization_config.ignore`. Ambos problemas se han restaurado para que vLLM pueda cargar el modelo correctamente.

## Capacidades

- Generacion de texto creativo y roleplay: el merge base fue seleccionado por su prosa expresiva y caracterizacion de personajes.
- Razonamiento multimodal: procesa imagenes y texto, con capacidad de leer formas, colores y texto en imagenes de prueba.
- Tool calling y function calling: compatible con el parser `gemma4` de vLLM y `--enable-auto-tool-choice`.
- Razonamiento multi-paso: soporta el parser de razonamiento `gemma4` en vLLM.
- Decodificacion especulativa: integra el drafter MTP de Gemma-4 para acelerar la generacion (hasta ~19 tok/s en GB10).
- Contexto largo: ventana de hasta 262 144 tokens, adecuada para conversaciones extensas o documentos largos.
- Multilingue limitado: solo ingles declarado en la model card.

## Casos de uso

- Atencion al cliente automatizada: con 262 144 tokens de contexto, puede gestionar conversaciones multi-turno muy largas, manteniendo el historial completo y el estado del cliente sin truncamientos. Su capacidad de tool calling permite integrarse con sistemas de tickets o APIs de CRM.
- Generacion de codigo en produccion: aunque no esta especializado en codigo, su soporte de tool calling y razonamiento permite usarlo en pipelines de CI/CD para generar documentacion, tests unitarios o parches simples, siempre que se valide la salida con un linter.
- Roleplay y narrativa interactiva: el merge base esta optimizado para escritura creativa y caracterizacion, por lo que es adecuado para juegos de rol por texto, generacion de dialogos de personajes o co-escritura de ficcion.
- Analisis de documentos con imagenes: al mantener la torre de vision en BF16, puede procesar capturas de pantalla, diagramas o documentos escaneados y extraer informacion textual o describir su contenido, util en flujos de automatizacion de oficina.
- Asistente personal con memoria larga: su contexto de 262K tokens permite mantener conversaciones prolongadas con memoria persistente de preferencias y datos del usuario, sin necesidad de resumenes intermedios.
- Despliegue en hardware de consumo: al ocupar ~20 GB, cabe en GPUs de 24 GB como RTX 4090 o RTX 3090, permitiendo ejecutar un modelo multimodal de 31B en entornos locales sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica medicion reportada es la velocidad de decodificacion en una DGX-Spark GB10 (ancho de banda ~224 GB/s, single-stream):

| Metrica | Valor |
|---|---|
| Decodificacion sin MTP | ~11 tok/s |
| Decodificacion con MTP (nspec=2) | ~19 tok/s |
| Vision | correcta lectura de formas, colores y texto en una imagen de prueba |

No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada: ~20 GB de pesos en disco; en inferencia con vLLM y `--kv-cache-dtype fp8`, cabe en una GPU de 24 GB.
- GPU recomendadas: NVIDIA Blackwell (B200, GB10), DGX-Spark, o GPUs consumer de 24 GB como RTX 4090 o RTX 3090.
- Compatibilidad con consumer GPU: si, siempre que tengan al menos 24 GB de VRAM.
- Opciones de despliegue: vLLM (probado en `vllm/vllm-openai:v0.25.1`), con deteccion automatica de cuantizacion `compressed-tensors`. No se mencionan otras herramientas como llama.cpp u Ollama.
- Latencia y throughput: ~19 tok/s en GB10 con MTP activado; sin MTP ~11 tok/s. El rendimiento variara segun la GPU y el ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-Gembrain-X-Core-31B-NVFP4 (este) | 31B | 262 144 | NVFP4 (~20 GB) | Gemma | HuggingFace |
| Nimbz/Gemma-4-Gembrain-X-Core-31B (base) | 31B | 262 144 | BF16 (peso completo) | Gemma | HuggingFace |
| Gemma-4-31B (original de Google) | 31B | 262 144 | BF16 | Gemma | HuggingFace / Google |

La diferencia principal es el tamano en disco y VRAM: el cuantizado NVFP4 reduce el peso a ~20 GB frente a los ~62 GB del BF16, permitiendo su ejecucion en GPUs de 24 GB. El rendimiento cualitativo en prosa y vision se mantiene segun las pruebas del autor, aunque no hay benchmarks comparativos publicados.

## Limitaciones y advertencias

- Solo soporta ingles: la model card declara unicamente `en`; el rendimiento en otros idiomas no esta garantizado.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido falso o inconsistente, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- Sesgos: al ser un merge comunitario, no se han documentado evaluaciones de sesgo; el dataset de cuantizacion (pile-10k) puede introducir sesgos adicionales.
- Licencia Gemma: permite uso comercial, pero con restricciones especificas de la licencia de Google (por ejemplo, no usar para desarrollar modelos competidores de Gemini). Revisar los terminos completos.
- Cuantizacion NVFP4: la precision W4A4 puede degradar ligeramente la calidad en tareas numericas o de razonamiento logico frente al BF16 original.
- Dependencia de vLLM: el modelo esta probado solo con vLLM; otras herramientas de inferencia pueden no soportar el formato `compressed-tensors` NVFP4.
- Parche manual del config: el `config.json` incluido ya esta corregido, pero si se re-cuantiza un Gemma-4 con AutoRound, habra que aplicar los mismos parches manualmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yar-sh/Gemma-4-Gembrain-X-Core-31B-NVFP4
- Modelo base: https://huggingface.co/Nimbz/Gemma-4-Gembrain-X-Core-31B
- Pagina oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Repositorio Gemma de Google DeepMind: https://github.com/google-deepmind/gemma
