# SourceHat-Labs/HY4-Flash-EXL3-4.875bpw

## Resumen

HY4-Flash-EXL3-4.875bpw es una cuantización estándar del checkpoint instructivo Hy4-flash de Tencent, publicada por SourceHat-Labs. No se trata de un modelo nuevo ni de un ajuste fino: el autor declara explícitamente que no hay ediciones de comportamiento ni entrenamiento adicional, sino únicamente una compresión de los pesos de los expertos enrutados y del almacenamiento Engram del modelo original. El resultado es un artefacto de 160,37 GiB distribuido en 2.698 ficheros safetensors.

El modelo base es un transformer de tipo mixture-of-experts (MoE) con capacidades multimodales (visión), decodificación especulativa nativa (DFly2) y un mecanismo denominado Engram para almacenamiento de tablas en host. La cuantización EXL3 se aplica a 4,875 bits por peso de experto enrutado a lo largo de 41 bloques: siete octavos de los expertos usan 5 bits y un octavo usan 4 bits. La cabeza de salida, los pesos de visión y el módulo de borrador (draft) se conservan en BF16 original.

Su relevancia es práctica: permite ejecutar un modelo MoE de gran tamaño en dos GPUs de 64 GiB conectadas por peer-to-peer, con una asignación de caché KV Q8 compartida de 1.400.064 tokens, manteniendo la ventana de contexto original de 524.288 tokens por defecto y 1.048.576 tokens como límite nativo. Es, por tanto, una vía para desplegar Hy4-flash con menos VRAM, a costa de requerir un runtime EXL3 específico con soporte para expertos latentes, RoPE original, Engram en host y DFly2 nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con vision y decodificacion especulativa DFly2; detalles de capas y dimensiones no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 524.288 tokens por defecto; 1.048.576 tokens limite nativo |
| Tipos de cuantizacion | EXL3 a 4,875 bits por peso de experto enrutado (5 bits en 7/8 de expertos, 4 bits en 1/8); cabeza de salida en BF16; vision y draft en precision original; Engram en cuatro tablas FP8 E4M3 con escalas BF16 |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (Tencent Hy License) |
| Formato de pesos | safetensors (2.698 ficheros, 172.198.397.078 bytes / 160,37 GiB), con indexado en `model.safetensors.index.json` y packs de expertos por capa y experto |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos con módulos adicionales: un codificador visual, un mecanismo de decodificación especulativa nativo de cinco bloques denominado DFly2 y un sistema de tablas Engram respaldadas en memoria del host. La cuantización conserva la codificación posicional RoPE original y la configuración de arquitectura del checkpoint fuente (`config.json` sin cambios). Los expertos enrutados se empaquetan por capa y experto en `standard-expert-packs/4p875-tp2/`, con la precisión por capa documentada en `weight-contract.json`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO. El autor de la cuantización no aporta datos de entrenamiento porque no realizó ninguno: se limita a comprimir los pesos de `tencent/Hy4-flash` en la revisión `d88c9dfd96ba`. La innovación técnica de este artefacto es el propio esquema de empaquetado: expertos latentes cuantizados a precisión mixta, Engram mapeado en host para no consumir VRAM y retención del draft y la visión en su precisión original para no degradar la decodificación especulativa ni la percepción visual.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del checkpoint instructivo Hy4-flash.
- Procesamiento de visión: los pesos visuales originales se conservan sin cuantizar.
- Decodificación especulativa nativa mediante DFly2, que acelera la generación en teoría; el autor verificó que target-only y DFly2 producen los mismos primeros 16 tokens greedy en cuatro peticiones de prueba.
- Contexto muy largo: hasta 524.288 tokens operativos por defecto y 1.048.576 tokens nativos.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible el listado de idiomas.
- Modo thinking explícito: no disponible.

## Casos de uso

- Procesamiento de documentación extensa: con 524.288 tokens de contexto operativo, el modelo puede ingerir contratos, expedientes o bases de código completas en una sola pasada sin fragmentación, lo que reduce la pérdida de contexto entre trozos.
- Análisis de imágenes en flujos documentales: al conservar los pesos de visión en precisión original, es adecuado para extraer información de capturas, diagramas o documentos escaneados dentro de una conversación larga.
- Asistentes conversacionales de dominio con historial prolongado: la ventana de contexto permite mantener sesiones de atención al cliente o tutoría con cientos de miles de tokens de historial acumulado.
- Investigación sobre cuantización de MoE: el paquete documenta precisión por capa (`weight-contract.json`) y verificación de equivalencia de tokens, lo que lo convierte en material útil para estudiar el impacto de EXL3 en expertos enrutados.
- Despliegue en infraestructura de dos GPUs de 64 GiB: encaja en nodos con dos aceleradores peer-connected, un perfil más asequible que el checkpoint BF16 completo para equipos que ya dispongan de ese hardware.
- Evaluación comparativa de decodificación especulativa: la retención de DFly2 permite medir latencia con y sin drafting sobre el mismo artefacto; el autor reporta 19,73 s sin drafting frente a 50,32 s con drafting en su fixture de cuatro peticiones cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento aportado por el autor es una medición de fixture: cuatro peticiones de texto cortas y desiguales, con decodificación de 19,73 s sin drafting y 50,32 s con drafting, sobre 2 GPUs de 64 GiB peer-connected con una asignación KV Q8 compartida de 1.400.064 tokens. El propio autor advierte que son resultados de fixture y no cifras de throughput en servicio.

## Requisitos de hardware

- VRAM: el artefacto pesa 160,37 GiB en disco, pero esa cifra no equivale a VRAM residente; el dato de 4,875 bpw aplica solo a expertos enrutados, no a la precisión media del conjunto.
- Configuración verificada: 2 GPUs de 64 GiB conectadas por peer-to-peer, con 1.400.064 tokens de caché KV Q8 compartida.
- Las tablas Engram (cuatro tablas FP8 E4M3 con escalas BF16) se mapean en memoria del host, por lo que hay que reservar RAM de sistema además de VRAM.
- Hay que dejar VRAM libre para el draft, la caché KV y los buffers del runtime.
- No cabe en GPUs de consumo convencionales: el tamaño del paquete y la necesidad de topología multi-GPU peer-connected lo excluyen de una RTX 4090 única.
- Despliegue: requiere un runtime EXL3 con soporte específico para HY4 (expertos latentes, RoPE original, Engram en host y DFly2 nativo). Un cargador estándar de Transformers no puede interpretar estos packs, y los ficheros por sí solos no añaden soporte HY4 a ExLlamaV3 estándar.
- Latencia y throughput: solo disponible la medición de fixture citada; no hay cifras de servicio publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HY4-Flash-EXL3-4.875bpw | no disponible | 524.288 por defecto / 1.048.576 nativo | EXL3 4,875 bpw en expertos | tencent-hy-license | Hugging Face, 0 descargas |
| tencent/Hy4-flash (base) | no disponible | 524.288 por defecto / 1.048.576 nativo | BF16 original | tencent-hy-license | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de tamaño o tarea en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia Tencent Hy License es de tipo "other"; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que no se detallan en la información disponible.
- El modelo no ha sido ajustado ni alineado por el autor de la cuantización: cualquier sesgo o comportamiento del checkpoint Hy4-flash se hereda sin cambios.
- Riesgo de alucinación: no evaluado en la información disponible.
- Idiomas soportados: no documentados, lo que impide garantizar calidad fuera de los idiomas del modelo base.
- La cuantización a 4,875 bits puede degradar la calidad frente al BF16 original; el autor solo verificó coincidencia en los primeros 16 tokens greedy de cuatro peticiones cortas, no en generaciones largas ni en tareas de razonamiento.
- El resultado de verificación no establece el uso completo del pool de 1M tokens con historiales reales, ni la latencia de servicio a 1M tokens, ni la generación con visión.
- Dependencia fuerte de un runtime específico: sin soporte HY4 en EXL3, el artefacto es inutilizable con herramientas estándar.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validación independiente de la comunidad.
- La ventana de 1.048.576 tokens es capacidad agregada del pool compartido, no un límite por petición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SourceHat-Labs/HY4-Flash-EXL3-4.875bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Revisión del checkpoint fuente: https://huggingface.co/tencent/Hy4-flash/tree/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959
- Licencia: LICENSE (incluida en el repositorio del modelo)
- Metadatos de verificación: `release-verification.json` (incluido en el repositorio)
- Contrato de pesos: `weight-contract.json` (incluido en el repositorio)
- Manifiesto Engram: `engram/manifest.json` (incluido en el repositorio)
