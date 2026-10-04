# Taimwe/securecoder-30b-pro-v3-merged

## Resumen

SecureCoder 30B Pro v3 (merged) es un ajuste fino mediante LoRA del modelo `unsloth/Qwen3-Coder-30B-A3B-Instruct`, publicado por el usuario Taimwe. El adaptador se ha fusionado en pesos completos de safetensors, de modo que el repositorio contiene un modelo autónomo listo para cargar con Transformers. Está orientado a tres tareas concretas: generación de código, tool calling y ciberseguridad, tanto ofensiva como defensiva. Hereda la arquitectura MoE de Qwen3 con 30.532.122.624 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token.

El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial siguiendo las condiciones del modelo base. Su ventana de contexto declarada es de 262.144 tokens, con precisión bfloat16 repartida en 13 shards que suman unos 56,9 GB. La relevancia de esta ficha es limitada por un detalle importante: el propio autor advierte de que la evaluación de la versión v3 no había finalizado en el momento de la publicación, y las versiones v1 y v2 presentaban un fallo grave que las hacía emitir la secuencia literal `\n` en lugar de saltos de línea reales, invalidando el código Python generado.

Por tanto, nos encontramos ante un checkpoint de nicho, con cero descargas y cero likes en el momento de redactar esta ficha, cuyo rendimiento real está sin verificar. Debe tratarse como un experimento en curso más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3MoeForCausalLM` (`qwen3_moe`), mezcla de expertos |
| Parametros totales | 30.532.122.624 |
| Parametros activos | Aproximadamente 3.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bfloat16 en el repositorio; se anuncia un GGUF Q4_K_M "una vez publicado", no disponible aun |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (13 shards, ~56,9 GB); tamano total del repo 61,1 GB |
| Tamano oculto (hidden size) | 2048 |
| Modelo base | `unsloth/Qwen3-Coder-30B-A3B-Instruct` |
| Tipo de ajuste | LoRA fusionado en pesos completos |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) de tipo decoder-only, implementada como `Qwen3MoeForCausalLM` dentro de la familia `qwen3_moe`. El modelo declara 30.532 millones de parámetros totales con aproximadamente 3.000 millones activos por token, lo que reduce el coste computacional por token pero no el de memoria, ya que todos los expertos deben residir en memoria. El tamaño oculto es de 2048 y el contexto nativo alcanza los 262.144 tokens. El entrenamiento consistió en un ajuste fino con LoRA sobre el modelo base, posteriormente fusionado en safetensors de precisión bfloat16.

El autor no detalla en la model card el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí documenta el origen de un fallo crítico: parte de la mezcla de entrenamiento contenía texto de mensajes escapado en JSON, lo que provocaba que las versiones v1 y v2 emitieran la secuencia literal `\n` en lugar de saltos de línea reales, haciendo que el Python generado fallara en `ast.parse`. El autor indica que la causa está corregida en el repositorio de scripts `Taimwe/securecoder-scripts`, pero la evaluación propia de v3 no había concluido al publicar. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y código en el contexto de un modelo derivado de Qwen3-Coder.
- Tool calling y function calling, según la etiqueta `tool-calling` declarada por el autor.
- Capacidades orientadas a ciberseguridad, tanto ofensiva como defensiva, según la propia model card.
- Ventana de contexto de 262.144 tokens, adecuada para trabajar con repositorios o documentos extensos en una sola pasada.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Modo de razonamiento explícito (thinking mode): no confirmado en la información disponible.
- Capacidades multilingües: no disponibles; el autor no publica lista de idiomas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Revisión de código con foco en seguridad: dado su ajuste específico, puede emplearse para señalar patrones inseguros, malas prácticas de gestión de secretos o usos peligrosos de APIs, integrándose como paso adicional en una pipeline de revisión de pull requests.
- Generación de código en producción: el soporte declarado de tool calling permite conectarlo a herramientas de compilación, tests o linters en un flujo de CI/CD, siempre que se validen previamente los fallos de formato documentados en versiones anteriores.
- Pruebas de penetración autorizadas: el modelo produce código ofensivo funcional según el autor, por lo que encaja en tareas de red team sobre sistemas propios o con permiso escrito, nunca contra terceros.
- Análisis de repositorios completos: la ventana de 262.144 tokens permite cargar múltiples ficheros o módulos a la vez y razonar sobre dependencias cruzadas sin trocear el contexto.
- Generación de scripts de hardening y respuesta a incidentes: puede redactar reglas de firewall, scripts de auditoría de configuración o procedimientos de contención a partir de una descripción textual del escenario.
- Redacción de informes de vulnerabilidad: a partir de hallazgos técnicos, puede estructurar descripciones de CVE, vector de ataque, impacto y mitigación en formato de informe.
- Refactorización asistida multilingüe: al derivar de un modelo de código generalista, puede traducir lógica entre lenguajes y modernizar código heredado, con verificación humana posterior.
- Automatización de tareas de agentes: el soporte de tool calling y contexto largo lo hace apto para agentes que encadenan varias llamadas a herramientas sobre un mismo hilo de conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, y el propio autor indica que la evaluación de v3 no había finalizado al publicar el modelo. El único dato medido disponible procede del autor y corresponde a una comparación entre el modelo base y la versión anterior v2, con el mismo conjunto de prompts y el mismo harness:

| Modelo | Python valido |
|---|---:|
| Base `unsloth/Qwen3-Coder-30B-A3B-Instruct` | 93,3 % |
| `securecoder-30b-pro-v2` | 0,0 % |

Estos números corresponden a v2, no a este checkpoint, y el autor pide explícitamente tratarlos como contexto y no como una afirmación sobre v3. No hay datos publicados sobre latencia, throughput ni evaluación de seguridad independiente.

## Requisitos de hardware

- Pesos en bfloat16: 13 shards que ocupan aproximadamente 56,9 GB, con un repositorio de 61,1 GB. La inferencia en bf16 requiere del orden de 64-70 GB de VRAM contando caché KV y activaciones, aunque el autor no publica cifras exactas de consumo.
- GPU recomendadas para bf16: NVIDIA H100 80 GB, A100 80 GB o configuraciones multi-GPU como 2x A6000 48 GB o 4x RTX 4090 24 GB.
- GPU de consumo: no cabe en una sola GPU de consumo en bfloat16. Con una cuantización Q4_K_M estimada en torno a 18-19 GB podría caber en una RTX 4090 o RTX 3090 de 24 GB, pero el GGUF Q4_K_M anunciado por el autor aún no está publicado, por lo que no es una opción disponible hoy.
- El contexto de 262.144 tokens incrementa notablemente el consumo de caché KV; la información proporcionada no cuantifica ese consumo por token.
- Opciones de despliegue: Transformers (ejemplo oficial en la model card), y por familia de arquitectura serían aplicables vLLM, SGLang o TGI con soporte MoE; llama.cpp u Ollama quedarían condicionados a la publicación del GGUF.
- Latencia y throughput estimados: no disponibles. Como referencia conceptual, solo ~3.000 millones de parámetros están activos por token, lo que reduce el coste de cómputo frente a un modelo denso de 30B, pero la memoria requerida sigue siendo la de un modelo de 30B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Python valido | Licencia | Estado |
|---|---|---|---|---|---|
| `Taimwe/securecoder-30b-pro-v3-merged` | 30B totales, ~3B activos | 262.144 | no evaluado | Apache-2.0 | Publicado, sin verificar |
| `Taimwe/securecoder-30b-pro-v2` | 30B totales, ~3B activos | no disponible | 0,0 % | Apache-2.0 | Sustituido por v3 |
| `unsloth/Qwen3-Coder-30B-A3B-Instruct` | 30B totales, ~3B activos | 262.144 (heredado) | 93,3 % | Apache-2.0 | Modelo base de referencia |

No se dispone de datos comparativos con alternativas externas de la misma categoría (por ejemplo, otros modelos de código de ~30B) en la información proporcionada. Cualquier comparación de rendimiento con ellos sería especulativa y no se incluye.

## Limitaciones y advertencias

- Calidad no verificada: el autor afirma explícitamente que la evaluación de v3 no había concluido al publicar el checkpoint.
- Antecedentes graves: las versiones v1 y v2 emitían la secuencia literal `\n` en lugar de saltos de línea, lo que invalidaba el Python generado. Aunque el autor indica que la causa está corregida, no hay medición publicada que lo confirme en v3.
- Contenido ofensivo: el modelo genera código de seguridad ofensiva funcional. Su uso debe limitarse a sistemas propios o con autorización escrita; la responsabilidad legal recae en quien lo emplea.
- Sesgos heredados: el autor reconoce que el modelo hereda los sesgos de Qwen3-Coder y que no se ejecutó ningún red-teaming de seguridad independiente.
- Comportamiento fuera de la distribución de entrenamiento: no verificado, según el propio autor.
- Consumo de memoria: pese a tener solo ~3B parámetros activos, la inferencia MoE sigue requiriendo cargar el modelo completo, por lo que el despliegue en hardware modesto no es viable en bf16.
- Idiomas soportados: no declarados; se desconoce el comportamiento multilingüe más allá de lo heredado del modelo base.
- Adopción nula: cero descargas y cero likes en el momento de redactar esta ficha, sin comunidad que haya validado su comportamiento.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base por si impusieran requisitos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Taimwe/securecoder-30b-pro-v3-merged
- Adaptador LoRA de origen: https://huggingface.co/Taimwe/securecoder-30b-pro-v3
- Scripts de entrenamiento, fusion y cuantizacion: https://huggingface.co/Taimwe/securecoder-scripts
- Documento de traspaso con el estado del proyecto: https://huggingface.co/Taimwe/securecoder-scripts/blob/main/HANDOFF.md
- Modelo base: https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos trataban sobre gestión de dispositivos y software CMMS, sin relación con el contenido de esta ficha. No se han encontrado papers, blogs ni demos adicionales.
