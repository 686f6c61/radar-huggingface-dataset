# Tostibrown/Groot-19B-A3B-261023-rco-role-4.5bpw-textonly

## Resumen

Groot-19B-A3B-261023-rco-role-4.5bpw-textonly es una preparación en formato MLX del modelo Groot-19B-A3B-261023 de GrootTeam, derivada de la cuantización intermedia de hermitdave. El autor, Tostibrown, ha eliminado los tensores de visión y de MTP (multi-token prediction) del paquete original, conservando únicamente la parte de lenguaje y dejando los pesos en cuantización mixta de 4,5 bits por peso. El resultado ocupa unos 12,3 GB en cinco ficheros de pesos y está pensado para su uso en el runtime Mei, que emplea Swift y MLX sobre hardware Apple Silicon.

El modelo base es un MoE de la familia Qwen 3.5, con 19B parámetros totales y alrededor de 3B activos por token (de ahí la denominación A3B). Esta preparación concreta no añade capacidades nuevas: se limita a reorganizar y verificar los pesos para un camino de inferencia exclusivamente textual, con nombres de cuantización reconciliados y hashes SHA256 por cada payload retenido.

Su relevancia es acotada pero práctica: permite ejecutar un MoE de 19B en equipos con memoria unificada contenida (Mac con 16-24 GB) sin cargar los tensores multimodales, y documenta de forma explícita el esquema de precisión mixta. No obstante, el autor advierte que la preparación no establece paridad de precisión con BF16 ni garantiza capacidad multimodal, y que la cualificación nativa para Mei sigue en curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen 3.5, tag `qwen3_5_moe`) |
| Parametros totales | 19B (según denominación del modelo base) |
| Parametros activos | ~3B (denominación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4,5 bits por peso, precisión mixta (incluye proyecciones de 6 bits divididas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (5 ficheros, 12.294.068.648 bytes en total) |

## Arquitectura y entrenamiento

El modelo base Groot-19B-A3B-261023 es un transformer con mezcla de expertos (MoE) de la familia Qwen 3.5, con 19B parámetros totales y aproximadamente 3B activos por token. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; la model card de esta preparación no los detalla y la búsqueda web no aporta datos al respecto.

La aportación técnica de esta ficha es la preparación del paquete: se han eliminado los tensores de visión y de MTP, lo que reduce el almacenamiento en aproximadamente 1,78 GB, y se ha hecho explícito el esquema de precisión mixta, incluyendo proyecciones de 6 bits divididas que no figuraban en el mapa de cuantización original. Cada payload retenido tiene su SHA256 en `MEI_TEXT_EXPORT.json`, lo que permite verificar la integridad de la exportación. El shard sexto del origen contenía únicamente tensores eliminados, por lo que los cinco ficheros distribuidos contienen el modelo de lenguaje completo. La herramienta de exportación es `tools/export_qwen_text.py` del proyecto Mei (commit `e191d1a`).

## Capacidades

- Generación de texto conversacional y continuaciones de texto, según el pipeline declarado (`text-generation`).
- Razonamiento y generación de código heredados del modelo base Qwen 3.5, aunque no verificados en esta cuantización.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara lista de idiomas.
- Capacidades multimodales: ausentes por diseño, ya que los tensores de visión se han eliminado.
- Modo thinking o decodificación especulativa vía MTP: no disponible, el tensor MTP se ha eliminado.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el paquete de 12,3 GB permite cargar un MoE de 19B en equipos Apple Silicon de gama alta (24 GB o más) usando MLX y el runtime Mei, sin necesidad de GPU dedicada.
- Prototipado de asistentes conversacionales en local: al ser un modelo text-only y conversacional, encaja en pruebas de chat multi-turno sobre escritorio, con la ventaja de no requerir conexión ni servicios en la nube.
- Evaluación de cuantizaciones mixtas: los hashes SHA256 y el manifiesto `MEI_TEXT_EXPORT.json` permiten reproducir la exportación y comparar el comportamiento frente a otras precisiones del mismo modelo base.
- Integración en pipelines de Mei: el comando `mei-preview --model-dir` permite servir el modelo con un identificador concreto, útil para pruebas de aceptación internas antes de desplegar en producción.
- Investigación sobre MoE de bajo coste: con ~3B parámetros activos, sirve para estudiar el equilibrio entre calidad y latencia en entornos con ancho de banda de memoria limitado.
- Benchmarking reproducible: el autor remite a `local-model-bench` para los perfiles exactos de sampler, contexto y caché, lo que facilita comparaciones controladas entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la preparación no establece paridad de precisión con BF16 y que la usabilidad de la ventana completa requiere pruebas separadas.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 12,3 GB solo para los pesos; con caché KV y overhead del runtime, se recomienda un mínimo de 16 GB y, para contextos largos, 24 GB o más.
- GPU recomendadas: hardware Apple Silicon (series M1/M2/M3/M4 con memoria unificada suficiente), dado que el formato es MLX. No se documenta soporte para A100, H100 ni RTX 4090 en esta preparación.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con 16-24 GB de memoria unificada; en GPUs NVIDIA de consumo no se ha validado, ya que el formato MLX no es directamente compatible con CUDA.
- Opciones de despliegue: runtime Mei (`mei-preview`), que carga los ficheros MLX directamente. Otros runtimes MLX requieren sus propias pruebas de aceptación según el autor. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Groot-19B-A3B-261023-rco-role-4.5bpw-textonly | 19B | ~3B | no disponible | Apache-2.0 | MLX 4,5 bpw | Text-only, sin visión ni MTP |
| Groot-19B-A3B-261023 (base) | 19B | ~3B | no disponible | Apache-2.0 | safetensors (BF16 presumiblemente) | Modelo original completo, con visión y MTP |
| hermitdave/Groot-19B-A3B-261023-MLX-rco-role-4.5bpw | 19B | ~3B | no disponible | Apache-2.0 | MLX 4,5 bpw | Cuantización intermedia con visión y MTP incluidos |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, pueden persistir los sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: no evaluado en esta cuantización; el autor no aporta métricas de fidelidad.
- Limitaciones de contexto e idioma: la longitud de contexto no se declara y la lista de idiomas no está disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar `LICENSE` y `ATTRIBUTIONS.md` y mantener el crédito a los autores originales y al cuantizador.
- Sin capacidades multimodales: visión y MTP eliminados; no debe esperarse entrada de imágenes ni decodificación especulativa.
- Paridad de precisión no garantizada: la verificación por SHA256 acredita la integridad de la exportación, no la equivalencia con BF16.
- Soporte de runtime limitado: preparado para Mei; otros runtimes MLX requieren pruebas de aceptación propias.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y la cualificación nativa para la siguiente versión de Mei está en curso, por lo que no se recomienda para producción sin validación previa.

## Enlaces

- [Hugging Face: Tostibrown/Groot-19B-A3B-261023-rco-role-4.5bpw-textonly](https://huggingface.co/Tostibrown/Groot-19B-A3B-261023-rco-role-4.5bpw-textonly)
- [Modelo base: GrootTeam/Groot-19B-A3B-261023](https://huggingface.co/GrootTeam/Groot-19B-A3B-261023)
- [Cuantización de origen: hermitdave/Groot-19B-A3B-261023-MLX-rco-role-4.5bpw](https://huggingface.co/hermitdave/Groot-19B-A3B-261023-MLX-rco-role-4.5bpw)
- [Releases de Mei](https://github.com/tijs/mei/releases)
- [local-model-bench](https://github.com/tijs/local-model-bench)
