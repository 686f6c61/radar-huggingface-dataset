# TheShellMaster/cypher-Huihui-Qwen3.5-4B-abliterated

## Resumen

`TheShellMaster/cypher-Huihui-Qwen3.5-4B-abliterated` no es un modelo entrenado, sino un espejo de distribución del fichero GGUF `Huihui-Qwen3.5-4B-abliterated.Q5_K_M.gguf` (3,11 GB, 3.108.758.848 bytes) publicado originalmente por `mradermacher`. Los pesos son bit a bit idénticos a la fuente (sha256 `d35a5c2ac55c0c59d1f34f0dd19b1e572ee548e915f02f8060b65cb2abf15e8c`), sin re-cuantización, fine-tuning ni cambios de plantilla. Por tanto, todas las capacidades y limitaciones del modelo provienen de su genealogía: el modelo raíz `Qwen/Qwen3.5-4B`, la versión "abliterated" de `huihui-ai` y la cuantización Q5_K_M de `mradermacher`.

Su relevancia es práctica: ofrece un punto de descarga redundante de un modelo de 4,54 B parámetros con arquitectura `qwen35`, contexto nativo de 262.144 tokens y licencia Apache 2.0, empaquetado en un GGUF de ~5,4 bits por peso que busca un equilibrio entre calidad y consumo de recursos en CPU y GPU.

La "abliteration" aplicada por `huihui-ai` elimina las direcciones de rechazo del modelo original, de modo que el modelo resultante es menos restrictivo en sus respuestas. Es un modelo de solo texto, orientado a generación de texto y con etiquetas de idioma francés e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (transformer, según etiqueta de la model card) |
| Parametros totales | 4,54 B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Q5_K_M (~5,4 bits/peso); referencias de la card: Q4_K_M ≈ 4,8, Q5_K_M ≈ 5,4, Q6_K ≈ 6,6, Q8_0 ≈ 8,5 bits/peso |
| Idiomas soportados | fr, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como `qwen35`, es decir, la familia Qwen3.5 de Alibaba, en su variante de 4,54 B parámetros. No se proporcionan detalles sobre la composición interna (número de capas, dimensiones, tipo de atención ni si emplea atención lineal o híbrida). El contexto nativo declarado es de 262.144 tokens.

No hay información sobre el dataset de entrenamiento, el número de tokens, ni sobre si se aplicaron fases de RLHF o DPO en el modelo raíz. La única transformación documentada es la abliteration en fp16 realizada por `huihui-ai`, que modifica los pesos para suprimir la dirección de rechazo, seguida de la cuantización GGUF de `mradermacher` en formato Q5_K_M (K-quant mixto por bloques de 256 pesos, con capas de atención a mayor precisión que las FFN). Este repositorio no introduce ningún cambio adicional.

## Capacidades

- Generación de texto en francés e inglés (idiomas declarados).
- Razonamiento y respuesta conversacional multi-turno, heredados del modelo Qwen3.5-4B.
- Ventana de contexto muy amplia (262.144 tokens nativos), apta para documentos largos.
- Comportamiento "uncensored": la abliteration reduce los rechazos del modelo base.
- Ejecución local vía llama.cpp y Ollama (formatos soportados por el GGUF).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Visión, audio o modo "thinking": no disponible en la información proporcionada (el modelo es de solo texto).

## Casos de uso

- Procesamiento de documentos largos en local: con 262.144 tokens de contexto nativo, permite resumir o extraer información de contratos, informes o bases de código extensas sin fragmentación agresiva, ejecutándose en un solo equipo.
- Asistente conversacional en francés o inglés sobre hardware modesto: el GGUF Q5_K_M de 3,11 GB cabe en equipos de consumo, lo que facilita prototipos de chat privados sin depender de la nube.
- Generación de texto creativo sin filtros: la abliteration reduce los rechazos, útil en entornos de investigación sobre comportamiento de modelos o escritura de ficción con temáticas sensibles.
- Despliegue en CPU con llama.cpp: el formato GGUF y el tamaño permiten inferencia en servidores sin GPU, adecuado para entornos con recursos limitados.
- Integración en Ollama para flujos de trabajo de desarrollo: mediante un `Modelfile` se puede empaquetar el modelo y consumirlo desde aplicaciones locales con `num_ctx` configurable.
- Experimentación académica con modelos abliterated: sirve como punto de comparación reproducible (pesos idénticos a la fuente, hash verificable) para estudiar el efecto de la abliteration en la calidad y la seguridad de las respuestas.
- Traducción y adaptación de texto entre francés e inglés: dentro de los dos idiomas declarados, para tareas de parafraseo o reescritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q5_K_M ocupa 3,11 GB en disco; en GPU, la carga completa de los pesos requiere aproximadamente 3,2-3,5 GB de VRAM, más el espacio para la caché KV, que crece con el contexto configurado.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM libre puede alojar los pesos; para contextos largos se necesita más memoria.
- GPU de consumo: sí cabe en tarjetas de consumo con 6-8 GB o más (por ejemplo, gama RTX xx60/xx70 con suficiente VRAM), siempre que se ajuste `num_ctx`.
- Despliegue: llama.cpp (`llama-cli`, con `-ngl 99` para descargar todas las capas en GPU) y Ollama mediante `Modelfile`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cypher-Huihui-Qwen3.5-4B-abliterated (este) | 4,54 B | 262.144 | apache-2.0 | GGUF Q5_K_M | Espejo de la cuantización de mradermacher; abliterated; solo texto |
| Qwen/Qwen3.5-4B | 4,54 B (no confirmado en la información) | no disponible | no disponible | no disponible | Modelo raíz sin abliteration; comportamiento alineado |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated | 4,54 B (no confirmado) | no disponible | no disponible | fp16 (según genealogía) | Abliteration en fp16; requiere más memoria que el GGUF |
| mradermacher/Huihui-Qwen3.5-4B-abliterated-GGUF | 4,54 B (no confirmado) | no disponible | no disponible | GGUF (varias cuantizaciones) | Fuente directa de este fichero; incluye más niveles de cuantización |

Los datos de los modelos comparables no están detallados en la información proporcionada; solo se confirma su relación genealógica.

## Limitaciones y advertencias

- La abliteration suprime los mecanismos de rechazo del modelo base; puede producir contenido ofensivo, inseguro o inapropiado. No es recomendable para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación inherente a un modelo de 4,54 B parámetros; no se han publicado evaluaciones de fiabilidad.
- Idiomas limitados a francés e inglés según la etiqueta del modelo; el rendimiento en castellano no está garantizado ni documentado.
- El contexto nativo es de 262.144 tokens, pero la caché KV a esa longitud exige mucha memoria; en la práctica habrá que reducir `num_ctx` (el ejemplo de la card usa 8192).
- La licencia Apache 2.0 se conserva, pero el uso comercial de un modelo abliterated puede implicar riesgos reputacionales y de cumplimiento según el contexto de despliegue.
- Este repositorio es un espejo sin mantenimiento declarado; en caso de divergencia, la fuente (mradermacher) prevalece. El recuento de descargas y likes es cero en el momento de la consulta.
- No hay información sobre tool calling, agentes ni benchmarks; no debe asumirse su disponibilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheShellMaster/cypher-Huihui-Qwen3.5-4B-abliterated
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.5-4B
- Abliteration: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Cuantización GGUF original: https://huggingface.co/mradermacher/Huihui-Qwen3.5-4B-abliterated-GGUF
