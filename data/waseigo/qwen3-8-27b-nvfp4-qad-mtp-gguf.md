# waseigo/Qwen3.8-27B-NVFP4-QAD-MTP-GGUF

## Resumen

`waseigo/Qwen3.8-27B-NVFP4-QAD-MTP-GGUF` es un empaquetado comunitario en formato GGUF para llama.cpp del modelo `nvidia/Qwen3.8-27B-NVFP4-QAD`, un transformer denso de 27B parámetros con arquitectura híbrida Qwen3.5 (atención completa y atención lineal), destilación con conciencia de cuantización (QAD) y torre de visión. El autor, waseigo, no reentrena ni recuantiza: repaqueta los pesos NVFP4 de NVIDIA de forma bit-exacta en superbloques `block_nvfp4` de ggml y completa la cabeza MTP (multi-token prediction) que NVIDIA omitió en su export, de modo que la decodificación especulativa funcione en llama.cpp.

El problema que resuelve es de empaquetado y compatibilidad: los pesos originales están pensados para vLLM en GPUs Blackwell con FP4 nativo, y su cabeza MTP llega incompleta (faltan cuatro tensores adaptadores), lo que provoca un aborto en `src/models/qwen35.cpp:513` de llama.cpp al activar el drafter. Este repo injerta esos cuatro tensores byte a byte desde la cabeza MTP del checkpoint base Qwen3.8-27B NVFP4 y publica un GGUF de 19,2 GB más un proyector visual BF16 de 931 MB.

Es relevante porque permite ejecutar un modelo de 27B con contexto de 262.144 tokens y visión en dos GPUs de consumo Blackwell (RTX 5060 Ti de 16 GB), con decodificación especulativa que casi duplica el throughput de generación (40,3 a 79,6 tok/s) a costa de reducir el prefill a la mitad. Es un paquete no oficial: NVIDIA no lo produjo ni lo revisó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `qwen35` (64 capas de tronco + 1 capa MTP; 16 de atención completa y 48 de atención lineal; 24 cabezas / 4 KV heads; `head_dim` 256) |
| Parametros totales | 460.730.096 según safetensors del repo base; la model card describe el modelo como 27B denso (dato no coincidente, no disponible una cifra verificada) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (307 tensores, 12,81 GB), Q8_0 (94 tensores, 3,01 GB), BF16 (104 tensores, 3,33 GB), F32 (971 tensores, 10 MB); KV cache configurable (`q8_0` K / `q4_0` V en la configuración validada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`); adaptador injertado Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector visual GGUF BF16 aparte |

## Arquitectura y entrenamiento

El tronco es un transformer híbrido de la familia Qwen3.5: 64 capas, de las cuales 16 usan atención completa y 48 atención lineal, con 24 cabezas de consulta y 4 KV heads (`head_dim` 256). Incluye una capa MTP adicional para predicción multi-token. La cuantización NVFP4 proviene de un proceso de destilación con conciencia de cuantización (QAD) realizado por NVIDIA, no por el autor del GGUF: el repaquetado mueve el payload de 4 bits a superbloques `block_nvfp4` de ggml como bytes crudos, sin recuantizar, por lo que no se añade redondeo de cuantización sobre la destilación.

La distribución de precisión es la de NVIDIA: las proyecciones MLP (`gate`, `up`, `down`), las proyecciones tardías de `linear_attn` y `output` quedan en NVFP4; las capas que NVIDIA almacenó en FP8 (q/k/v/o de las 16 capas de atención completa y `linear_attn` de las 10 primeras capas) pasan a Q8_0 mediante `--fp8-as-q8`; `token_embd` y el bloque MTP permanecen en BF16; normas, `conv1d`, `A_log` y `dt_bias` en F32. La innovación destacable es el injerto de los cuatro tensores adaptadores del MTP (`nextn.eh_proj`, `.enorm`, `.hnorm`, `.shared_head_norm`), tomados byte a byte de la cabeza MTP del checkpoint base, con verificación de que los 1.476 payloads originales siguen siendo byte-idénticos tras el injerto. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento con modo de razonamiento activable (`--reasoning on`, `--reasoning-preserve`).
- Procesamiento de imagen y texto (`image-text-to-text`) mediante proyector visual convertido de la misma torre de visión del checkpoint; verificado sobre un PNG rojo de 256×256 con `--image-min-tokens 1024`.
- Decodificación especulativa con cabeza MTP (`--spec-type draft-mtp`, `--spec-draft-n-max 3`), con tasa de aceptación medida de 0,718.
- Contexto largo de hasta 262.144 tokens en una sola ranura.
- Soporte de plantillas de chat Jinja (`--jinja`) y razonamiento con preservación de trazas.
- Batching continuo (`--cont-batching`) y ejecución paralela configurable (`--parallel`).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Generación de texto de alta velocidad en local: con MTP n=3 el decode alcanza 79,6 tok/s en 2× RTX 5060 Ti, adecuado para asistentes interactivos donde la latencia de generación domina la experiencia.
- Procesamiento de documentos largos: el contexto de 262.144 tokens permite ingerir contratos, informes o bases de código completas en una sola pasada sin troceado.
- Análisis de imágenes con descripción textual: el proyector visual permite tareas de image-to-text (etiquetado, descripción, respuesta a preguntas sobre imágenes) ejecutadas en hardware de consumo.
- Investigación sobre decodificación especulativa: el repo incluye `graft_mtp_adapter.py` y `PROVENANCE.md` para auditar el injerto y reproducir la tasa de aceptación, útil para estudiar el coste/beneficio del drafter.
- Despliegue en clústeres pequeños Blackwell: llama-server con `--split-mode tensor` reparte el modelo entre dos GPUs de 16 GB, con un consumo medido de 14.754 MiB por tarjeta con drafter activo.
- Evaluación comparativa de cuantizaciones FP4: al ser un repaquete bit-exacto, sirve para medir el impacto real de NVFP4 frente a Q8_0/BF16 sin el ruido de una recuantización adicional.
- Prototipado de pipelines multimodales en llama.cpp: integración vía API HTTP de llama-server en flujos que ya usan el ecosistema GGUF, sin depender de vLLM ni de GPUs de centro de datos.

## Benchmarks y rendimiento

| Metrica | Sin drafter | MTP n=3 |
|---|---|---|
| Prefill | 1545,7 tok/s | 791,5 tok/s |
| Decode | 40,3 tok/s | 79,6 tok/s |
| Aceptación del draft | — | 0,718 (56/78) |
| VRAM por tarjeta | 12.628 MiB | 14.754 MiB de 16.311 |

Medido en 2× RTX 5060 Ti 16 GB (Blackwell, sm_120), ranura de 262.144 tokens, KV `q8_0` K / `q4_0` V, build `1.0.0-dev b12505 (65758d01f)`. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12.628 MiB por tarjeta sin drafter y 14.754 MiB con MTP n=3 en la configuración de dos GPUs validada; el archivo principal pesa 19,2 GB y el proyector 931 MB.
- GPU recomendadas: Blackwell (sm_120) para FP4 MMA nativo, como la RTX 5060 Ti; arquitecturas anteriores caen a la ruta Q4 MMQ y son más lentas.
- Cabe en GPUs de consumo: sí, en 2× RTX 5060 Ti de 16 GB con reparto tensorial; no se documenta que quepa en una sola tarjeta de 16 GB con contexto completo.
- Opciones de despliegue: llama.cpp / llama-server (build que soporte `qwen35` y NVFP4 con sidecars de escala-2, verificado en `b12505`); no se documenta soporte en vLLM, Ollama ni TGI para este GGUF.
- Latencia y throughput: prefill 1545,7 tok/s sin drafter y 791,5 tok/s con drafter; decode 40,3 y 79,6 tok/s respectivamente.
- Nota de rendimiento: el drafter reduce el prefill a la mitad porque la implementación MTP de llama.cpp re-ejecuta el draft sobre cada posición del prompt; conviene para cargas con mucha generación y poco prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| waseigo/Qwen3.8-27B-NVFP4-QAD-MTP-GGUF | 27B denso (460.730.096 según safetensors) | 262.144 | GGUF NVFP4/Q8_0/BF16 | NVIDIA Open Model License | Paquete comunitario con MTP completado y visión |
| nvidia/Qwen3.8-27B-NVFP4-QAD | 27B denso | 262.144 | NVFP4 para vLLM | NVIDIA Open Model License | Checkpoint original de NVIDIA, sin MTP utilizable en llama.cpp |
| Qwen3.8-27B NVFP4 (checkpoint base) | 27B denso | 262.144 | NVFP4 | Apache-2.0 (según la model card del GGUF) | Fuente de los cuatro tensores adaptadores del MTP |

No se dispone de datos de benchmarks de calidad para establecer una comparación de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El adaptador MTP injertado proviene del modelo base, no de la destilación de NVIDIA; la aceptación medida (0,718) superó el 0,50–0,65 documentado para el base, pero otro adaptador podría comportarse de forma distinta.
- Las proyecciones `linear_attn` de las 10 primeras capas y todas las proyecciones de atención completa están en Q8_0: es la decisión FP8 de NVIDIA trasladada al tipo más cercano sin pérdida apreciable, no una elección nueva del autor.
- `token_embd` permanece en BF16 (2,54 GB) porque NVIDIA no lo cuantizó; convertirlo a Q8_0 devolvería unos 1,2 GB y requiere una re-ejecución de unos 3 minutos.
- El drafter reduce el prefill a la mitad; en cargas con prompts largos y respuestas cortas conviene omitir las opciones de draft (se pierde aproximadamente la mitad de la velocidad de decode).
- Requiere un build de llama.cpp que conozca la arquitectura `qwen35` y NVFP4 con sidecars de escala-2; builds anteriores abortan al cargar.
- Idiomas: solo inglés según la model card; no se documenta cobertura multilingüe.
- Licencia NVIDIA Open Model License: los términos de redistribución provienen de la model card de NVIDIA y deben revisarse antes de uso comercial.
- Es un empaquetado no oficial: NVIDIA no lo produjo ni lo revisó.
- No se documentan evaluaciones de sesgo ni tasas de alucinación; no disponible.
- No se documenta soporte de tool calling ni de agentes multi-paso; no disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/waseigo/Qwen3.8-27B-NVFP4-QAD-MTP-GGUF
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4-QAD
- Discusión de NVIDIA sobre carga de la cabeza MTP desde el checkpoint no QAD: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4-QAD/discussions/2
- Licencia NVIDIA Open Model License: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4-QAD
- Archivos de procedencia y auditoría incluidos en el repo: `PROVENANCE.md` y `graft_mtp_adapter.py`
