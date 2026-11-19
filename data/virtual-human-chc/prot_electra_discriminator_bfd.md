# virtual-human-chc/prot_electra_discriminator_bfd

## Resumen

`virtual-human-chc/prot_electra_discriminator_bfd` es un modelo de la familia ProtElectra, una adaptación de la arquitectura ELECTRA al dominio de las proteínas desarrollada originalmente por Elnaggar et al. (Rostlab, TUM) y publicada en IEEE TPAMI (2021). El repositorio alojado por el usuario `virtual-human-chc` redistribuye los pesos del discriminador de ProtElectra entrenado sobre el corpus BFD (Big Fantastic Database), un conjunto de secuencias proteicas de gran escala. El modelo está pensado para producir representaciones contextuales de secuencias de aminoácidos, no para generación de texto.

La relevancia de este checkpoint es acotada: se trata de un artefacto de investigación (5 descargas, 0 likes, sin pipeline declarado) que probablemente forma parte de un pipeline mayor de un proyecto de "virtual human" orientado a proteínas. No es un modelo de propósito general ni un LLM conversacional; es un encoder de proteínas que debe usarse con la tokenización y el preprocesado específicos de ProtElectra (tokenización por carácter de aminoácidos, con vocabulario reducido).

La información pública disponible es muy escasa: la model card es prácticamente vacía (solo metadatos YAML) y no se publican resultados de benchmarks, idiomas, ni detalles de entrenamiento en el propio repositorio. Todo lo que se detalla a continuación proviene de la arquitectura conocida de ProtElectra y de las convenciones de la familia, marcándose explícitamente como "no disponible" aquello que no puede confirmarse para este checkpoint concreto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ELECTRA (discriminador, token detection) |
| Parámetros totales | no disponible (el repo pesa 2,7 GB; compatible con la variante base de ProtElectra, ~110 M, sin confirmar) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ProtElectra base usa 512 tokens de aminoácidos) |
| Tipos de cuantización | no disponible (pesos en precisión completa; admite cuantización estándar vía PyTorch/ONNX) |
| Idiomas soportados | no disponible (dominio: secuencias de proteínas, no lenguaje natural) |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | PyTorch (`pytorch_model.bin` / safetensors, no confirmado en el repo) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ELECTRA aplicada a proteínas: un discriminador transformer que, en lugar de predecir tokens enmascarados (MLM), se entrena para distinguir tokens "reales" de tokens sustituidos por un generador. En ProtElectra el vocabulario se reduce a los 20 aminoácidos estándar (más tokens especiales), y el preentrenamiento se realiza sobre grandes corpus de secuencias proteicas. El sufijo `bfd` del identificador indica que este checkpoint se entrenó sobre el Big Fantastic Database, uno de los corpus de proteínas más grandes disponibles (decenas de millones de secuencias).

No se dispone de información específica sobre el número exacto de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste fino posteriores para este repositorio concreto. La cita indicada en la model card remite al paper original de ProtElectra (Elnaggar et al., TPAMI 2021), que describe el preentrenamiento con token detection y su evaluación en tareas de downstream proteico (localización subcelular, predicción de estructura secundaria, etc.). No se documenta en el repo ninguna innovación adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Extracción de embeddings contextuales de secuencias de proteínas (representaciones por residuo y por secuencia).
- Clasificación de proteínas y predicción de propiedades a partir de las representaciones (requiere cabeza de clasificación ajustada).
- Predicción de estructura secundaria y otras tareas de anotación proteica tras fine-tuning.
- Detección de tokens (token detection) como objetivo de preentrenamiento; no es un modelo generativo de secuencias.
- No soporta tool calling, function calling ni razonamiento multi-step: no es un LLM.
- No tiene capacidades multilingües en el sentido de lenguaje natural; su "alfabeto" son aminoácidos.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Anotación funcional de proteínas: usar los embeddings del encoder como features para un clasificador ligero que prediga familia o función proteica, aprovechando que el modelo ya captura contexto local y global de la secuencia.
- Predicción de estructura secundaria: fine-tuning con una cabeza por residuo sobre las representaciones del discriminador para asignar hélices, láminas y coils.
- Búsqueda y agrupamiento de secuencias: generar embeddings por secuencia y usar similitud coseno para clustering o deduplicación de grandes bases de proteínas.
- Detección de mutaciones de efecto: comparar embeddings de secuencia wild-type frente a variantes para priorizar mutaciones candidatas en estudios de genómica funcional.
- Preentrenamiento base para pipelines propios: inicializar un modelo proteico con estos pesos y ajustarlo a un dominio concreto (p. ej. enzimas industriales) cuando el dataset propio es pequeño.
- Filtrado de secuencias en bases de datos: usar el discriminador como scorer para descartar secuencias anómalas o mal ensambladas en pipelines de metagenómica.
- Integración en un sistema mayor de "virtual human": servir como módulo de representación proteica dentro de un pipeline multimodal biológico, tal como sugiere el prefijo `virtual-human-chc` del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas, y el paper de referencia (Elnaggar et al., TPAMI 2021) reporta resultados para la familia ProtElectra completa, no para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,5-1 GB en fp32 para un modelo de ~110 M de parámetros (si el checkpoint es la variante base); ~0,3 GB en fp16. El tamaño del repo (2,7 GB) sugiere que puede incluir pesos en fp32 más artefactos, pero no se confirma.
- GPU recomendadas: cualquier GPU consumer moderna basta (RTX 3060 12 GB, RTX 4090, etc.); en servidor, A100/H100 son sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, con amplio margen, en todas las RTX desde la serie 20.
- Opciones de despliegue: PyTorch nativo, Hugging Face `transformers` (clase Electra), ONNX Runtime, TorchScript. No hay soporte documentado para vLLM, llama.cpp u Ollama (no es un modelo generativo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prot_electra_discriminator_bfd (este) | no disponible (~110 M si base) | no disponible (512 típico) | Proteínas | AFL-3.0 | Hugging Face (repo de terceros) |
| ProtBert (Rostlab) | ~420 M | 512 | Proteínas | no disponible | Hugging Face |
| ESM-2 (Meta) | 8 M - 15 B | 1024 | Proteínas | MIT (según variante) | Hugging Face |
| ProtElectra discriminador (original Rostlab) | ~110 M | 512 | Proteínas | no disponible | Hugging Face (Rostlab) |

La comparación con ESM-2 es la más relevante en la práctica: ESM-2 ofrece variantes desde 8 M hasta 15 B de parámetros con licencia permisiva y es el estándar de facto para embeddings proteicos. ProtElectra, en cambio, es una arquitectura más antigua (2021) y con menor adopción actual.

## Limitaciones y advertencias

- La model card está prácticamente vacía: no hay información sobre datos de entrenamiento, sesgos ni evaluación, lo que impide auditar el checkpoint.
- Es un encoder, no un generador: no puede usarse para tareas de generación de secuencias sin un decoder adicional.
- Riesgo de sobreajuste a la distribución de BFD: secuencias muy alejadas de las presentes en ese corpus (p. ej. proteínas sintéticas o de diseño) pueden representarse deficientemente.
- Licencia AFL-3.0: permite uso comercial con condiciones (atribución, reciprocidad de licencia en obras derivadas); conviene revisar los términos exactos antes de integrarlo en producto.
- El repositorio es de un tercero (`virtual-human-chc`), no del autor original (Rostlab); no hay garantía de que los pesos coincidan exactamente con los publicados por Elnaggar et al.
- Sin pipeline declarado ni demo: la integración requiere conocer la tokenización específica de ProtElectra (tokenización por aminoácido), lo que añade fricción.
- No hay evidencia de mantenimiento: última actualización en 2026 pero sin issues, likes ni descargas que indiquen uso activo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/virtual-human-chc/prot_electra_discriminator_bfd
- Paper de referencia (ProtElectra, Elnaggar et al., TPAMI 2021): https://doi.org/10.1109/TPAMI.2021.3095381
- Repositorio original de ProtElectra (Rostlab): no disponible en la información proporcionada
- Big Fantastic Database (BFD): no disponible en la información proporcionada
