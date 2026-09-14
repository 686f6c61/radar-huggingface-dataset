# soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-NVFP4A16-pr3118-validation

## Resumen

GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-NVFP4A16-pr3118-validation es un artefacto de validación publicado por el usuario soyrsoyr, derivado de inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP. No es un modelo preentrenado ni ajustado: la propia model card lo describe como un "fixture estructural de pesos aleatorios" ("random-weight structural fixture"), con dimensiones alineadas y todos los pasos de derivación registrados en el fichero `pr3118-validation.json`. Su propósito es comprobar que una combinación concreta de cuantización mixta y cabezas MTP (multi-token prediction) carga y genera correctamente en vLLM con decodificación especulativa.

El modelo ocupa 84.772.398 parámetros (unos 0,085 B) en un repositorio de 0,2 GB, con pesos en formato safetensors y empaquetado compressed-tensors. La validación publicada confirma carga y generación en una H100 con métricas reales de tokens borrador MTP, pero el autor advierte explícitamente de que no se trata de un benchmark de calidad ni de rendimiento.

Su relevancia es puramente de ingeniería: sirve como prueba de extremo a extremo del PR 3118 de llm-compressor (commit `87347881`) y del camino de decodificación especulativa MTP en vLLM, con un esquema de cuantización que combina FP8 en las capas MLP, NVFP4A16 (FP4 solo pesos con activaciones de 16 bits) y MXFP4 (cuantización dinámica de activaciones). No debe emplearse como modelo de generación de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de GLM-5.3 Flash, con cabezas MTP (multi-token prediction) y cuantización mixta FP8/NVFP4A16/MXFP4 |
| Parámetros totales | 84.772.398 (≈0,085 B), según safetensors |
| Parámetros activos | No aplica según la model card ("dense-source MTP"); el identificador del modelo base indica 0,1B-A0,1B, sin confirmar |
| Longitud de contexto | 1.024 tokens en la validación publicada (`--max-model-len 1024`); máximo arquitectónico no disponible |
| Tipos de cuantización | FP8 (capas MLP), NVFP4A16 (FP4 solo pesos, activaciones de 16 bits, sin calibrar; no es NVFP4 W4A4), MXFP4 (cuantización dinámica de activaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible; la model card indica que "la licencia del origen sigue siendo aplicable" y que esta validación no concede licencia adicional |
| Formato de pesos | Safetensors con compressed-tensors; el backbone y los formatos MTP son ficheros separados |
| Tamaño del repositorio | 0,2 GB |
| Librería | transformers |
| Pipeline declarado | text-generation (con etiqueta adicional image-text-to-text) |
| Modelo base | inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP (revisión `443ac6c54ba0d65ad8a7c701af4fd22a960c9e9c`) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-14 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card no documenta ningún proceso de entrenamiento: los pesos son aleatorios ("derived random-weight structural fixture"). Lo que sí se documenta es el proceso de derivación estructural: a partir del modelo base denso GLM-5.3-Flash-0.1B-A0.1B-MTP se generaron cabezas MTP con dimensiones alineadas y se cuantificaron mediante un esquema "data-free" (sin datos de calibración). El backbone y los formatos MTP se almacenan por separado, de modo que es necesario inspeccionar `config.json`, `recipe.yaml` (cuando está presente) y `pr3118-validation.json` para reconstruir la estructura exacta.

La innovación técnica que se pretende validar no está en el modelo, sino en la herramienta y el runtime: el PR 3118 de llm-compressor aplicado sobre este artefacto, y el soporte de decodificación especulativa MTP en vLLM. El entorno validado es `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers `5.17.0` y CUDA 13.0. La prueba de extremo a extremo exige métricas positivas de tokens borrador: según el autor, una carga correcta del modelo no cuenta como validación MTP superada. Se ejecuta con `python verify_mtp.py /path/to/snapshot`, que lanza dos prompts y registra las generaciones y las métricas de decodificación especulativa. Para MXFP4, el autor indica que la compatibilidad de runtime debe establecerse en una ejecución propia sobre B200.

## Capacidades

- Generación de texto: verificada únicamente como carga y generación funcional en H100, con pesos aleatorios y sin valor semántico real.
- Decodificación especulativa MTP: es la capacidad efectivamente validada, con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'` y métricas positivas de tokens borrador.
- Razonamiento, código, matemáticas: no disponibles; no hay ningún ajuste ni preentrenamiento que las respalde.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales: la etiqueta `image-text-to-text` sugiere un componente multimodal, pero el comando de validación desactiva explícitamente imagen y vídeo (`--limit-mm-per-prompt '{"image":0,"video":0}'`), por lo que la ruta multimodal no está validada.

## Casos de uso

- Validación de integración continua del PR 3118 de llm-compressor: el artefacto permite comprobar que el commit `87347881` produce pesos cargables y coherentes estructuralmente, sin depender de un modelo real de gran tamaño.
- Pruebas de regresión del camino MTP en vLLM: sirve para verificar que la decodificación especulativa con `method: mtp` y `num_speculative_tokens: 1` devuelve métricas positivas de tokens borrador tras un cambio de versión del runtime.
- Verificación de cargadores de cuantización mixta: al combinar FP8 en MLP con NVFP4A16 y MXFP4, permite probar que el lector de compressed-tensors separa y aplica correctamente cada esquema.
- Pruebas de humo en hardware nuevo: con 0,2 GB de repositorio y ~85 M de parámetros es un candidato barato para comprobar que una H100 (o un nodo B200 para MXFP4) levanta vLLM con CUDA 13.0 antes de desplegar modelos mayores.
- Validación de contratos de API compatible con endpoints: la etiqueta `endpoints_compatible` permite usarlo como sustituto sintético para verificar esquemas de petición y respuesta en servicios de inferencia.
- Pruebas de scripts de verificación: `verify_mtp.py` se ejercita contra este snapshot para garantizar que detecta fallos de MTP y no los confunde con una carga correcta.
- Aviso importante: no se recomienda ningún caso de uso en producción (atención al cliente, generación de código, análisis documental) porque los pesos son aleatorios y no existe licencia declarada para este artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que la validación en H100 "no es un benchmark de calidad ni de rendimiento" y que no se aplica ninguna afirmación de calidad. No se dispone de cifras de MMLU, HumanEval, GSM8K, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con 84,77 M de parámetros, los pesos en bfloat16 rondan los 0,17 GB; añadiendo escalas de cuantización, ficheros MTP y caché KV para 1.024 tokens, el consumo se mantiene por debajo de 1 GB en la configuración de validación.
- GPU recomendadas: H100, única plataforma en la que se declara la validación superada. Para MXFP4 el autor indica que la compatibilidad debe establecerse en B200.
- GPU de consumo: por tamaño, cabe con holgura en cualquier GPU de consumo moderna (RTX 3090, RTX 4090, e incluso GPUs con 4-8 GB), aunque la combinación exacta de cuantización y el runtime requerido pueden limitar la compatibilidad real.
- Opciones de despliegue: vLLM `0.29.1rc1.dev79+g767d1c4d4` con Transformers `5.17.0` y CUDA 13.0, que es el entorno con el que se validó. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Comando de despliegue validado: `vllm serve soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-NVFP4A16-pr3118-validation --dtype bfloat16 --max-model-len 1024 --enforce-eager --gpu-memory-utilization 0.85 --speculative-config '{"method":"mtp","num_speculative_tokens":1}' --limit-mm-per-prompt '{"image":0,"video":0}' --block-size 256`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El único punto de referencia documentado es el modelo base del que se deriva, y solo se conocen los campos que aparecen en los metadatos.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-NVFP4A16-pr3118-validation | 84,77 M | 1.024 tokens en validación | FP8 MLP + NVFP4A16 + MXFP4 | No disponible | Repositorio público con 0 descargas |
| inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP | No disponible | No disponible | No disponible | No disponible | Repositorio público (origen) |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Pesos aleatorios: el artefacto es un fixture estructural, no un modelo entrenado. Cualquier texto generado carece de valor semántico.
- Sin licencia declarada: la model card indica que se aplica la licencia del modelo de origen y que esta validación no concede ningún permiso adicional. El uso comercial queda sin cobertura clara.
- Riesgo de uso indebido: existe riesgo de que se interprete como un modelo GLM-5.3 funcional por su nombre. El autor insiste en que no se aplica ninguna afirmación de calidad.
- Dependencia estricta de versiones: la validación está atada a vLLM `0.29.1rc1.dev79+g767d1c4d4`, Transformers `5.17.0` y CUDA 13.0. Otras combinaciones no están verificadas.
- MXFP4 sin validar: el autor señala que la compatibilidad de runtime de MXFP4 debe establecerse en una ejecución propia sobre B200.
- NVFP4A16 no es NVFP4 W4A4: es cuantización solo de pesos en FP4 con activaciones de 16 bits, sin calibración. No debe confundirse con esquemas calibrados de 4 bits en pesos y activaciones.
- Discrepancia de metadatos: el pipeline declarado es text-generation pero existe la etiqueta image-text-to-text; la validación desactiva imagen y vídeo, por lo que la ruta multimodal queda fuera de alcance.
- Idioma y contexto: no se declara ningún idioma soportado y la ventana de contexto verificada es de 1.024 tokens en la prueba, no necesariamente el máximo arquitectónico.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta. Las fechas de creación y actualización (2026-09-14) aparecen en el futuro respecto a la información disponible.
- Búsqueda web sin resultados útiles: las consultas realizadas devolvieron páginas de ayuda de YouTube y de mountain bike, sin relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/GLM5.3-Flash-Tiny-Aligned-FP8MLP-MTP-NVFP4A16-pr3118-validation
- Modelo base: https://huggingface.co/inference-optimization/GLM-5.3-Flash-0.1B-A0.1B-MTP/tree/443ac6c54ba0d65ad8a7c701af4fd22a960c9e9c
- Implementación (llm-compressor PR 3118, commit `87347881`): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Fichero de derivación y alineado de dimensiones: `pr3118-validation.json` (incluido en el repositorio del modelo)
- Script de verificación MTP: `verify_mtp.py` (incluido en el repositorio del modelo)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a páginas de ayuda de YouTube y a un sitio de mountain bike, sin relación con el modelo)
