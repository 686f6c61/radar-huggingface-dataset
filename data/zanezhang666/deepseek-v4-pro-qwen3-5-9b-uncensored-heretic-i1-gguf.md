# zanezhang666/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF es una cuantizacion GGUF del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, publicada por el usuario zanezhang666. Se trata de un modelo de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) derivado de la familia Qwen3.5 y destilado a partir de DeepSeek-V4-Pro, segun indican las etiquetas del repositorio. El modelo base ha sido sometido a un proceso de "abliteration" o decensurado (etiquetas heretic, uncensored, abliterated), lo que implica la eliminacion de mecanismos de rechazo en las respuestas.

La relevancia de esta ficha reside en que combina varias tecnicas: destilacion de un modelo mayor (DeepSeek), ajuste supervisado (SFT) y aprendizaje por refuerzo (RL, con mencion a GSPO), ademas de soporte declarado para tool-use y function-calling. El repositorio incluye cuantizaciones con imatrix generadas por mradermacher, lo que facilita su despliegue en hardware de consumo mediante llama.cpp u Ollama.

El modelo esta publicado bajo licencia Apache 2.0 y declara soporte para seis idiomas: ingles, chino, coreano, japones, espanol y ruso. El repositorio ocupa 81,3 GB e incluye un rango amplio de cuantizaciones desde Q2_K hasta Q6_K, ademas de variantes IQ. No se dispone de informacion publica sobre benchmarks ni sobre la longitud de contexto en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun etiquetas; detalles no disponibles) |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_S, IQ3_M, IQ3_XS, IQ3_XXS, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M (con imatrix) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base pertenece a la familia Qwen3.5 (etiqueta `qwen3_5`) y que ha sido destilado a partir de DeepSeek-V4-Pro, segun la nomenclatura del repositorio. Las etiquetas del autor mencionan tecnicas de entrenamiento como SFT (supervised fine-tuning), RL (reinforcement learning), GSPO (Group Sequence Policy Optimization, variante de optimizacion de politica) y MTP (multi-token prediction). Tambien aparecen etiquetas relacionadas con razonamiento (`reasoning`), matematicas y STEM.

El proceso de "abliteration" o decensurado (etiquetas `heretic`, `uncensored`, `abliterated`, `decensored`) implica la modificacion de los pesos para eliminar la direccion de rechazo aprendida durante el alineamiento, de forma que el modelo deja de negarse a responder a ciertas peticiones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni los detalles del pipeline de RL. La cuantizacion GGUF ha sido realizada por mradermacher con tecnicas de imatrix (importance matrix), lo que mejora la calidad de las cuantizaciones de baja precision.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito (etiqueta `reasoning`), presumiblemente con modo de pensamiento.
- Capacidades matematicas y STEM (etiquetas `math`, `stem`).
- Soporte de tool calling y function calling (etiquetas `tool-use`, `function-calling`).
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Generacion de codigo (implicito en las etiquetas de razonamiento y tool-use; no confirmado explicitamente).
- Capacidades de vision: la model card indica "This is a vision model", aunque los ficheros mmproj (si existen) estarian en el repositorio estatico de mradermacher, no en este.
- Modo sin censura (respuestas sin rechazo por alineamiento).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y text-generation-inference.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse mediante llama.cpp u Ollama en hardware de consumo (a partir de 4 GB de VRAM con cuantizaciones Q2/Q3) para gestionar conversaciones multi-turno en seis idiomas, incluyendo espanol.
- Automatizacion de agentes con tool calling: gracias al soporte declarado de function-calling, puede integrarse en pipelines de agentes que invocan APIs externas, ejecutan busquedas o consultan bases de datos en flujos de varios pasos.
- Razonamiento matematico y STEM: adecuado para resolver problemas de matematicas y ciencia en entornos educativos o de investigacion donde se requiera un modelo ligero y desplegable localmente.
- Generacion de codigo en entornos con restricciones de privacidad: al poder ejecutarse en local, permite generar y revisar codigo sin enviar datos a servicios en la nube, util en entornos corporativos con requisitos de confidencialidad.
- Investigacion sobre alineamiento y seguridad: la variante "abliterated" es util para estudiar el comportamiento de modelos sin mecanismos de rechazo, comparar respuestas frente al modelo original y analizar sesgos residuales.
- Traduccion y atencion al cliente multilingue: con soporte para ingles, chino, coreano, japones, espanol y ruso, puede emplearse en sistemas de soporte que atiendan a usuarios de esas comunidades linguisticas.
- Prototipado rapido en estaciones de trabajo: las cuantizaciones Q4_K_M (~5,9 GB) permiten ejecutar el modelo en GPUs de consumo como la RTX 3060 de 12 GB o superiores, facilitando pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero GGUF):
  - i1-Q2_K: ~4,0 GB.
  - i1-IQ3_M / i1-Q3_K_M: ~4,6-4,8 GB.
  - i1-IQ4_XS: ~5,4 GB.
  - i1-Q4_K_M: ~5,9 GB (recomendado por el autor de la cuantizacion como "fast, recommended").
  - i1-Q5_K_M: ~6,7 GB.
  - i1-Q6_K: ~7,7 GB.
- GPU recomendadas: para cuantizaciones Q4, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB son suficientes. Para Q6_K, una RTX 4090 o superior ofrece margen holgado. En entornos de servidor, A100 o H100 permiten ejecutar el modelo en precision completa o con contexto largo.
- Cabe en GPU de consumo: si, desde GPUs con 6-8 GB de VRAM para cuantizaciones bajas (Q2/Q3) hasta 12-16 GB para Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (etiqueta `text-generation-inference`), y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF (este) | ~9,2 B | no disponible | Apache 2.0 | GGUF | Destilado de DeepSeek-V4-Pro, decensurado, 6 idiomas |
| Qwen3.5-9B (base de la familia) | ~9 B | no disponible | no disponible | safetensors, GGUF | Modelo original de la familia Qwen3.5, con alineamiento estandar |
| Modelos destilados de 7-9 B de la familia Llama/Mistral | ~7-9 B | variable | variable | safetensors, GGUF | Alternativas genericas de tamano similar; comparacion de rendimiento no disponible |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El proceso de abliteration/decensurado elimina los mecanismos de rechazo, lo que puede producir contenido inapropiado, ofensivo o danino sin advertencia. No es adecuado para aplicaciones orientadas al publico sin moderacion adicional.
- Riesgo de alucinacion inherente a los modelos de ~9 B; la destilacion desde un modelo mayor no garantiza fidelidad factual.
- No se dispone de informacion sobre la longitud de contexto efectiva ni sobre el rendimiento en contextos largos.
- El rendimiento en espanol, aunque declarado, no esta validado con benchmarks publicos en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor del modelo base y el cuantizador no ofrecen garantias sobre el comportamiento del modelo decensurado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del rendimiento real.
- La model card indica que es un modelo de vision, pero los ficheros mmproj no estan en este repositorio; el soporte de vision requeriria descargarlos del repositorio estatico de mradermacher.
- Las cuantizaciones de baja precision (Q2, IQ2) degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zanezhang666/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Cuantizaciones estaticas de mradermacher: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
