# zed122/translategemma_nvfp4_gguf

## Resumen
`zed122/translategemma_nvfp4_gguf` es una conversion a formato GGUF del checkpoint cuantizado `kaitchup/translategemma-4b-it-NVFP4`, que a su vez deriva de TranslateGemma, el modelo de traduccion desarrollado por Google sobre la arquitectura Gemma 3. El repositorio lo publica el usuario zed122 y su proposito es permitir la ejecucion local del modelo de traduccion en 4 bits (NVFP4) mediante llama.cpp, con un tamano de archivo de aproximadamente 4,5 GB.

El problema principal que aborda este repositorio no es tanto la traduccion en si, sino la portabilidad del checkpoint NVFP4 a un runtime de inferencia en C++ como llama.cpp, manteniendo los pesos en 4 bits y los tensores de embedding y salida en BF16. La relevancia actual radica en que la ruta nativa NVFP4 requiere hardware Blackwell, y en que la version estandar de llama.cpp no funciona con este archivo sin un parche especifico.

El modelo es de tipo translation (pipeline oficial de HuggingFace), esta etiquetado con `gemma3` y `nvfp4`, y se distribuye bajo la licencia Gemma. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente y de baja difusion.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer, denso; etiquetado `gemma3` en el repositorio) |
| Parametros totales | Aproximadamente 4.000 millones (deducido del nombre del modelo base `translategemma-4b-it`; no confirmado explicitamente en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 (4 bits en coma flotante) con `token_embd` y `output` en BF16 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (tamano aproximado 4,5 GB) |

## Arquitectura y entrenamiento
El modelo base es TranslateGemma de Google, construido sobre la arquitectura Gemma 3 y especializado en traduccion automatica. La model card del repositorio no aporta detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre tecnicas de alineamiento como RLHF o DPO. Tampoco se documentan innovaciones de decodificacion. Por tanto, esta informacion debe considerarse no disponible y, para completarla, habria que consultar las fichas de Google y de kaitchup.

Lo mas relevante tecnicamente de esta publicacion es el proceso de conversion y cuantizacion. El checkpoint de origen es un `compressed-tensors` NVFP4 producido por kaitchup, y zed122 lo convierte a GGUF con `convert_hf_to_gguf.py` de llama.cpp. Los pesos quedan en NVFP4 mientras que `token_embd` y `output` se mantienen en BF16, lo que explica el tamano de 4,5 GB. La model card advierte de que las compilaciones estandar de llama.cpp generan NaN y tokens basura (`<unusedNN>`) con este archivo, porque `src/models/gemma3.cpp` no propaga los tensores de escala de la FFN (`ffn_up_s`, `ffn_gate_s`, `ffn_down_s`) a `build_ffn`. El autor aporta el parche `gemma3-ffn-scale.patch`, probado sobre el commit `f2cc7282ce0042641df55e0e563b75e824e2b647` (2026-10-11).

## Capacidades
- Traduccion automatica: la pipeline declarada es `translation`, y el ejemplo de uso de la model card realiza traduccion de ingles a arabe.
- Control explicito de idiema origen y destino mediante `chat_template_kwargs` con `source_lang_code` y `target_lang_code`.
- Generacion de texto condicionada por plantilla de chat (formato `messages` con `role` y `content`).
- Servicio HTTP compatible con la API de chat de OpenAI a traves de `llama-server`.
- Inferencia en 4 bits con aceleracion nativa FP4 en hardware Blackwell.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso
- Traduccion de documentos largos en local: el modelo puede procesar texto y producir traducciones sin enviar datos a servicios en la nube. Es adecuado porque el archivo de 4,5 GB cabe en GPU de consumo y permite control de idiema origen/destino por parametro.
- Servicio de traduccion autoalojado: desplegando `llama-server` con el parche indicado, se expone un endpoint compatible con OpenAI que puede integrarse en una pasarela interna de traduccion para equipos o aplicaciones.
- Traduccion de contenido web o de producto en pipelines por lotes: el binario `build_and_run.sh` y el endpoint HTTP facilitan el procesamiento masivo de cadenas de texto con `temperature` a 0 para maximizar determinismo.
- Localizacion de interfaces y software: el modelo maneja pares de idiomas configurables, por lo que puede emplearse para traducir ficheros de recursos o cadenas de UI antes de su publicacion.
- Investigacion en traduccion automatica de bajo consumo: al ejecutarse con pesos NVFP4, sirve para estudiar el impacto de la cuantizacion de 4 bits sobre la calidad de traduccion frente al checkpoint en BF16.
- Prototipado y evaluacion de hardware Blackwell: el repositorio y el parche de llama.cpp permiten reproducir pruebas con la ruta nativa FP4, util para equipos que evaluan GPUs de nueva generacion.
- Procesamiento de texto multilingue en entornos sin conectividad: al no requerir API externa, encaja en despliegues aislados o con requisitos de privacidad estrictos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta una medida de rendimiento de inferencia (no de calidad): entre 95 y 100 tokens por segundo en una RTX 5060 Ti para el par ingles-arabe.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 5-6 GB, considerando un archivo de pesos de 4,5 GB mas la cache KV y los buffers de ejecucion (estimacion propia, no confirmada en la model card).
- Caben en GPU de consumo: si, el archivo de 4,5 GB encaja en tarjetas con 8 GB o mas de VRAM. La model card cita pruebas en una RTX 5060 Ti.
- Ruta nativa FP4: requiere hardware Blackwell (por ejemplo, serie RTX 50 o B200). Para otras GPUs es necesario ajustar `CMAKE_CUDA_ARCHITECTURES`; la ruta FP4 nativa no esta disponible fuera de Blackwell.
- Opciones de despliegue: llama.cpp, y en particular `llama-server` con endpoint compatible con OpenAI, previa aplicacion de `gemma3-ffn-scale.patch`.
- Latencia y throughput: entre 95 y 100 tokens por segundo en una RTX 5060 Ti segun la model card, en el par ingles-arabe.
- Dependencia critica de software: se necesita un llama.cpp parcheado. El parche fue probado sobre el commit `f2cc7282ce0042641df55e0e563b75e824e2b647` (2026-10-11) y puede requerir ajustes manuales en commits mas recientes.

## Comparativa con modelos similares
| Modelo | Formato / cuantizacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zed122/translategemma_nvfp4_gguf | GGUF, NVFP4 (embeddings en BF16) | Aproximadamente 4.000 millones (segun nombre del base) | No disponible | Gemma | HuggingFace, requiere llama.cpp parcheado |
| kaitchup/translategemma-4b-it-NVFP4 | compressed-tensors, NVFP4 | Aproximadamente 4.000 millones (segun nombre) | No disponible | Gemma | HuggingFace |
| TranslateGemma 4B IT (base de Google) | Pesos originales (formato no especificado en la informacion) | Aproximadamente 4.000 millones (segun nombre) | No disponible | Gemma | HuggingFace (referencia en la model card) |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias
- Requiere un llama.cpp parcheado: con compilaciones estandar se producen NaN y tokens basura (`<unusedNN>`). Es el caveat mas importante para produccion.
- El parche esta fijado a un commit concreto (`f2cc7282ce0042641df55e0e563b75e824e2b647`); en versiones posteriores puede necesitar ajustes manuales.
- La ruta nativa FP4 solo funciona en hardware Blackwell; en otras GPUs hay que ajustar la arquitectura CUDA y puede perderse el beneficio de la cuantizacion nativa.
- No se documentan sesgos conocidos, riesgos de alucinacion ni limitaciones de idioma en la informacion disponible.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los Gemma Terms of Use de Google; conviene revisar sus condiciones antes de un despliegue en produccion.
- Repositorio con 0 descargas y 0 likes: escasa validacion por parte de la comunidad, lo que incrementa el riesgo de incidencias no documentadas.
- No se confirma explicitamente el numero de parametros ni la longitud de contexto en la model card; los valores de parametros se deducen del nombre del modelo base.

## Enlaces
- Repositorio del modelo: https://huggingface.co/zed122/translategemma_nvfp4_gguf
- Checkpoint base cuantizado: https://huggingface.co/kaitchup/translategemma-4b-it-NVFP4
- Repositorio de llama.cpp (requerido para la conversion e inferencia): https://github.com/ggml-org/llama.cpp
- Gemma Terms of Use (licencia aplicable): https://ai.google.dev/gemma/terms
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs o demos.
