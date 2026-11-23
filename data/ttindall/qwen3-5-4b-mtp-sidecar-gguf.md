# ttindall/Qwen3.5-4B-MTP-Sidecar-GGUF

## Resumen

Qwen3.5-4B-MTP-Sidecar-GGUF es un artefacto auxiliar publicado por el usuario ttindall que restituye la cabeza de predicción multi-token (MTP, multi-token prediction) del modelo Qwen3.5-4B de Qwen en formato GGUF. No es un modelo completo, sino un "sidecar" de unos 0,8 GB que se carga junto a cualquier GGUF de Qwen3.5-4B como modelo borrador (draft model) para habilitar decodificación especulativa en llama.cpp. El problema que resuelve es concreto: la mayoría de las cuantizaciones de Qwen3.5-4B publicadas en Hugging Face (incluidas las versiones abliterated, uncensored y los quants estándar de Unsloth) pierden la capa MTP durante el proceso de conversión, de modo que no pueden beneficiarse de la decodificación especulativa nativa.

El sidecar contiene 17 tensores copiados tal cual de un GGUF Q8_0 del modelo oficial Qwen/Qwen3.5-4B: la capa MTP (`blk.32.*`), el embedding (que en Qwen3.5-4B está atado a la cabeza de salida) y la norma final. Al cargarlo como draft model, llama.cpp puede proponer varios tokens por paso y verificarlos en paralelo contra el modelo objetivo, acelerando la decodificación sin modificar los pesos del modelo principal.

La relevancia es práctica para quien despliegue fine-tunes de Qwen3.5-4B en producción con llama.cpp: el autor reporta ganancias medidas de entre +19% y +33% en velocidad de decodificación sobre una RTX 4090, con tasas de aceptación de borradores del 43,5% al 52,6%. El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que se trata de una publicación reciente y poco validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sidecar GGUF con la capa MTP de Qwen3.5-4B (transformer con cabeza de predicción multi-token); no es un modelo autónomo |
| Parametros totales | 756.301.312 (según metadatos de safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el sidecar; las pruebas del autor usan 8.192 tokens de contexto en el modelo objetivo |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3.5-4B) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Qwen3.5-4B-MTP-sidecar-Q8_0.gguf`, 0,8 GB, SHA-256 `3ecb092faf5e070dcdb877822a930eeb5a3ce5bf4cc37f536b8ddb80feab0d27`) |

## Arquitectura y entrenamiento

El sidecar no se entrena: se extrae. El autor convierte los safetensors oficiales de Qwen/Qwen3.5-4B en BF16 con `convert_hf_to_gguf.py` (que preserva la capa MTP), cuantiza a Q8_0 con `llama-quantize` y después ejecuta `mtp_sidecar.py`, un script incluido en el repositorio que corta la capa MTP (`blk.32.*`), el embedding (`token_embd.weight`, atado a la cabeza de salida en Qwen3.5-4B) y la norma final (`output_norm.weight`). El script copia los tensores tal como están almacenados y rechaza cualquier fuente que no contenga capa MTP. El resultado son 17 tensores con la metadata de Qwen3.5-4B, salvo `general.name`, fijado a "Qwen3.5-4B MTP sidecar".

La innovación técnica no está en el sidecar en sí, sino en el mecanismo que habilita: decodificación especulativa mediante la cabeza MTP nativa de Qwen3.5-4B. llama.cpp usa el sidecar como modelo borrador (`--spec-type draft-mtp`), propone hasta `--spec-draft-n-max 3` tokens por paso y los valida contra el modelo objetivo. Al compartir tokenizer y tamaño oculto con Qwen3.5-4B, un único sidecar sirve para cualquier cuantización y fine-tune de esa familia. Un detalle relevante: la cabeza se entrenó sobre los pesos originales de Qwen, por lo que los modelos abliterated aceptan algo menos de borradores que un modelo stock, aunque todos los probados ganan velocidad.

## Capacidades

- No genera texto de forma autónoma: actúa exclusivamente como modelo borrador para decodificación especulativa en llama.cpp.
- Acelera la decodificación de cualquier GGUF de Qwen3.5-4B que conserve el tokenizer y el tamaño oculto de Qwen (incluidos fine-tunes abliterated y uncensored).
- Compatible con la flag `--spec-type draft-mtp` de llama.cpp; requiere una compilación que la soporte (probado en el commit `2cbe0ec`).
- Funciona con K/V cache cuantizada (`-ctk q8_0 -ctv q8_0`), flash attention (`-fa on`) y plantillas Jinja (`--jinja`) según la invocación documentada por el autor.
- No aporta capacidades lingüísticas, de razonamiento, código, visión ni tool calling propias: todas dependen del modelo objetivo.
- No sustituye a la capa MTP si el GGUF objetivo ya la incluye (`qwen35.nextn_predict_layers = 1`); en ese caso basta con `--spec-type draft-mtp` sin `-md`.

## Casos de uso

- Aceleración de inferencia en producción con llama.cpp: cargar el sidecar junto a un Qwen3.5-4B Q4_K_M reduce la latencia de decodificación entre un 19% y un 33% según las mediciones del autor, lo que se traduce directamente en menor coste por token servido en endpoints compatibles con OpenAI.
- Despliegue de fine-tunes abliterated o uncensored: estos modelos suelen distribuirse sin capa MTP; el sidecar recupera la decodificación especulativa sin necesidad de reconvertir ni recuantizar los pesos del modelo principal.
- Servicio de chat interactivo de baja latencia: con 8.192 tokens de contexto y q8_0 en K/V, el conjunto modelo + sidecar cabe en una única GPU de consumo y mantiene velocidades de 249-280 tok/s en una RTX 4090, adecuado para asistentes conversacionales multi-turno.
- Evaluación comparativa de estrategias de decodificación: permite medir la tasa de aceptación de borradores por fine-tune (43,5% en Huihui abliterated frente a 52,6% en HauhauCS Uncensored Aggressive) para decidir qué variante desplegar.
- Prototipado en estaciones de trabajo con una sola GPU: al ocupar solo 0,8 GB de VRAM adicional, deja margen para el modelo objetivo cuantizado y el contexto en tarjetas de 24 GB.
- Integración en pipelines de generación por lotes: la mayor velocidad de decodificación reduce el tiempo total de tareas de generación larga (resúmenes, redacción, extracción) ejecutadas con Qwen3.5-4B sobre llama-server.

## Benchmarks y rendimiento

Mediciones del autor en una RTX 4090, llama.cpp commit `2cbe0ec`, cada objetivo en su Q4_K_M publicado, contexto de 8.192, K/V en q8_0, 60 prompts ordinarios, thinking desactivado, 384 tokens por prompt. Velocidad mediana de decodificación:

| Modelo objetivo | Sin sidecar | Con sidecar | Ganancia | Borradores aceptados |
|---|---|---|---|---|
| HauhauCS Qwen3.5-4B Uncensored Aggressive | 210,4 tok/s | 280,7 tok/s | +33% | 52,6% |
| Huihui Qwen3.5-4B abliterated (mradermacher) | 210,3 tok/s | 249,5 tok/s | +19% | 43,5% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable al no tratarse de un modelo autónomo.

## Requisitos de hardware

- VRAM adicional: aproximadamente 0,8 GB para el sidecar Q8_0, que reside en VRAM junto al modelo objetivo.
- VRAM total estimada: la del GGUF objetivo (un Q4_K_M de un modelo de 4B ronda los 2,5-3 GB) más 0,8 GB del sidecar, más la caché K/V para el contexto configurado.
- GPU recomendadas: RTX 4090 (configuración medida por el autor); cualquier GPU con al menos ~8 GB de VRAM debería acomodar el conjunto con contexto moderado, aunque no hay mediciones publicadas en otras tarjetas.
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 12 GB o más para contexto de 8K; en 8 GB requiere reducir contexto o cuantizar más el modelo objetivo.
- Opciones de despliegue: llama.cpp (llama-server o llama-cli) con soporte de `--spec-type draft-mtp`; no hay soporte documentado en vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: 249,5-280,7 tok/s de decodificación mediana en RTX 4090 con los objetivos indicados; el autor advierte que los números varían según tarjeta, cuantización y prompts.

## Comparativa con modelos similares

| Artefacto | Función | Tamano | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ttindall/Qwen3.5-4B-MTP-Sidecar-GGUF | Sidecar MTP para decodificación especulativa | 0,8 GB (756 M parámetros) | GGUF Q8_0 | Apache-2.0 | Hugging Face, 0 descargas |
| GGUF de Qwen3.5-4B con capa MTP incluida | Modelo completo con MTP nativa | ~4B parámetros según cuantización | GGUF | Apache-2.0 (modelo base) | Depende del uploader; el autor indica que la mayoría de quants populares la pierden |
| Quants abliterated/uncensored de Qwen3.5-4B (HauhauCS, Huihui/mradermacher) | Modelo completo sin MTP | ~4B parámetros | GGUF | Según uploader | Hugging Face; se benefician del sidecar |
| Quants estándar de Unsloth para Qwen3.5-4B | Modelo completo sin MTP | ~4B parámetros | GGUF | Apache-2.0 | Hugging Face; el autor afirma que no incluyen capa MTP |

No se dispone de comparativas con otros sidecars MTP de la misma familia en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable por sí solo: sin un GGUF objetivo de Qwen3.5-4B no produce ninguna salida.
- Solo funciona con llama.cpp y con compilaciones que incluyan `--spec-type draft-mtp`; versiones anteriores al commit `2cbe0ec` pueden no reconocer la opción.
- Requiere que el modelo objetivo conserve el tokenizer y el tamaño oculto de Qwen3.5-4B; fine-tunes que los alteren no son compatibles.
- La tasa de aceptación de borradores baja en modelos abliterated (43,5% frente a 52,6%), de modo que la ganancia es menor cuanto más se desvía el fine-tune de los pesos originales.
- Las mediciones proceden de un único entorno (RTX 4090, un commit concreto, 60 prompts, thinking desactivado) y no han sido replicadas por terceros; el repositorio no tiene descargas ni likes.
- Riesgo de alucinación y sesgos: heredados íntegramente del modelo objetivo; el sidecar no los modifica ni los mitiga.
- Idiomas soportados: no documentados en la ficha del sidecar; dependen del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero los pesos del modelo objetivo y los fine-tunes de terceros tienen sus propias licencias que deben verificarse por separado.
- El script `mtp_sidecar.py` requiere `pip install gguf` y rechaza fuentes sin capa MTP; su uso para generar sidecars de otros modelos no está documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ttindall/Qwen3.5-4B-MTP-Sidecar-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo objetivo de las pruebas (HauhauCS Uncensored Aggressive): https://huggingface.co/HauhauCS/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive
- Modelo objetivo de las pruebas (Huihui abliterated, mradermacher): https://huggingface.co/mradermacher/Huihui-Qwen3.5-4B-abliterated-GGUF
- llama.cpp: no disponible en la información proporcionada (el autor cita el commit `2cbe0ec` sin enlace)
- Paper o blog del modelo: no disponible en la información proporcionada
