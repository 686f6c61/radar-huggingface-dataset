# thelogicalgate/GLM-5.3-Flash-Sushi-2bpw-Abliterated

## Resumen

GLM-5.3-Flash-Sushi-2bpw-Abliterated es una publicación de pesos experimental creada por el usuario thelogicalgate a partir de un "trasplante" de tensores: parte del modelo GLM-5.3-Flash-Sushi-2bpw (una variante cuantizada a 2 bits por peso del GLM-5.3-Flash) se ha fusionado con 29 proyecciones de salida de atención (o_proj) en BF16 procedentes de un modelo donante "abliterated" (dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4). El objetivo declarado es reducir los rechazos del modelo base sin reentrenar nada: es una modificación de pesos, no de plantilla de chat ni de tokenizador.

El artefacto tiene 50.095.938.398 parámetros totales (unos 50,1 mil millones) y una arquitectura MoE (mezcla de expertos). Se distribuye exclusivamente en el formato propietario de Sushi, un motor nativo para Apple Silicon, y solo carga con Sushi v1.2.2 o superior sobre macOS 26.2 en adelante. No es compatible con Transformers, vLLM, mlx-lm ni exllamav3.

Su relevancia es limitada y muy específica: es una prueba de concepto de modificación de comportamiento (reducción de rechazos) mediante sustitución de tensores en un modelo MoE cuantizado, y solo resulta práctico en equipos Apple Silicon con memoria unificada muy alta (probado en un M5 Max con 128 GB). El autor advierte explícitamente de que la reducción de rechazos y la retención de capacidades no se han validado con una evaluación completa; las pruebas realizadas son diagnósticos de seis casos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), transformer; incluye capa MTP nativa (capa 45) y torre de vision |
| Parametros totales | 50.095.938.398 (aprox. 50,1 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) configurable en Sushi; no se ha probado una carga de ventana completa |
| Tipos de cuantizacion | Expertos enrutados EXL3 a 2 bits por peso (MCG, ventana 14); proyecciones densas mayoritarias en affine 5 bits (grupo 128); cabeza y torre de vision en affine 6 bits (grupo 128); 29 proyecciones o_proj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (el asistente DFlash2 incluido se distribuye bajo CC BY-NC-ND 4.0, licencia separada) |
| Formato de pesos | safetensors (formato de paquete Sushi; no carga directamente en Transformers, vLLM, mlx-lm ni exllamav3) |

## Arquitectura y entrenamiento

Se trata de un modelo de mezcla de expertos (MoE) derivado de GLM-5.3-Flash. No ha habido entrenamiento nuevo: la publicación es un trasplante de pesos. En concreto, las proyecciones de salida de auto-atención (`model.language_model.layers.15..43.self_attn.o_proj.weight`) se sustituyen por los tensores BF16 del modelo donante abliterated, y sus escalas y sesgos afines originales se eliminan del enrutado del índice. Las capas 0 a 14 y la 44 conservan las proyecciones originales. No se recuantiza ningún peso de experto, no se estima ninguna nueva dirección de rechazo y no se modifican la plantilla de chat ni el tokenizador.

Preserva la capa MTP (multi-token prediction) nativa en la posición 45 y los tensores de visión del paquete original, aunque la configuración de servicio probada desactiva la visión y Sushi v1.2.2 no utiliza la MTP de GLM. La decodificación especulativa se apoya en el asistente DFlash2 incluido (BF16, licencia CC BY-NC-ND 4.0 aparte), que Sushi detecta y para el que construye en el primer uso una caché local de borrador de aproximadamente 0,72 GiB. El autor no aporta datos sobre tokens de entrenamiento ni sobre composición del dataset, ya que no se ha entrenado el modelo.

## Capacidades

- Generación de texto y conversación multi-turno, con marca de pipeline `text-generation` y `conversational`.
- Razonamiento con niveles de esfuerzo configurables: `high`, `low` y `max`. Los modos `medium` y "thinking-off" no están soportados por este paquete.
- Capacidad aritmética básica verificada de forma puntual (una consulta `17 * 23` devolvió `391` a través del endpoint compatible con OpenAI).
- Razonamiento matemático elemental en casos GSM8K pequeños (3 de 3 resueltos en el diagnóstico del autor).
- Llamada a herramientas (tool calling): soporta llamadas forzadas y uso automático de herramientas; las llamadas forzadas y el JSON restringido usan decodificación serie, mientras que el uso automático de herramientas puede beneficiarse del borrador especulativo.
- Decodificación especulativa mediante el asistente DFlash2 (hasta 46,235 tok/s en la prueba diagnóstica, con 88,5 % de aceptación de borrador).
- Tensores de visión presentes en el paquete, aunque la configuración probada los desactiva.
- Capacidades multilingües: no disponibles (no se declaran idiomas).

## Casos de uso

- Experimentación con reducción de rechazos en modelos MoE: el modelo permite estudiar en un entorno local Apple Silicon cómo la sustitución de tensores concretos (proyecciones o_proj) altera el comportamiento de rechazo sin reentrenar, útil para investigación sobre alineación y control de comportamiento.
- Evaluación comparativa de trasplantes de pesos: sirve como artefacto de referencia para reproducir el método de fusión de un donante abliterated sobre un modelo cuantizado a 2 bits, gracias a los checksums por tensor registrados en `abliteration-provenance.json`.
- Inferencia local en estación de trabajo Apple Silicon: con 128 GB de memoria unificada y Sushi, permite servir un modelo de ~50B en formato cuantizado de 2-6 bits sin GPU discreta, con contexto configurable hasta 256K.
- Generación de texto y asistente conversacional en local: mediante el endpoint compatible con OpenAI en `http://127.0.0.1:12345/v1`, se puede integrar en clientes de chat o scripts propios dentro de un flujo de trabajo con requisitos de privacidad.
- Pruebas de decodificación especulativa: el par DFlash2 on/off y las métricas `[spec-stats]` permiten medir aceptación de borrador y ganancia de velocidad en cargas concretas, útil para calibrar configuraciones de servicio.
- Evaluación de tool calling y JSON restringido: adecuado para experimentar con pipelines de agentes que requieren llamadas a funciones forzadas y salidas JSON estructuradas, aunque con la limitación de que estas rutas usan decodificación serie.
- Validación de integridad de pesos: el propio paquete y su documentación de procedencia permiten auditar hashes SHA-256, dimensiones y enrutado de índices como caso de estudio de verificación de artefactos.

## Benchmarks y rendimiento

El autor no presenta una batería de benchmarks completa. Los datos disponibles son diagnósticos internos y no deben interpretarse como resultados de referencia del artefacto.

| Prueba | Resultado | Notas |
|---|---|---|
| GSM8K (casos pequeños) | 3/3 correctos por brazo (stock, control BF16 y trasplante) | Diagnóstico de seis casos por brazo; no es un benchmark completo |
| XSTest | Entradas seguras procesadas; etiquetas oficiales de rechazo no generadas | No se generaron etiquetas oficiales de rechazo |
| Aritmética directa | `17 * 23` devolvió `391` vía endpoint OpenAI-compatible | Registros nativos confirman activación de DFlash2 |
| Velocidad serie (caso Python) | 33,283 tok/s | Generó 179 tokens; contexto corto |
| Velocidad con DFlash2 (caso Python) | 46,235 tok/s | 88,5 % de aceptación de borrador; contexto corto |
| Consistencia DFlash2 on/off | Dos casos benignos greedy coincidentes en texto visible y de razonamiento | — |

No se han publicado métricas de MMLU, HumanEval, GSM8K completos ni otras baterías estándar en la información disponible. El autor indica que las suites completas de rechazo y capacidades siguen pendientes y que la captura KL del profesor BF16 falló (`NativeGlmTeacherRequiresLosslessStreaming`), por lo que no se reclama ninguna puntuación KL nueva.

## Requisitos de hardware

- Almacenamiento: los shards del modelo ocupan aproximadamente 87,70 GB; la fuente DFlash2 en BF16 añade 2,34 GB. El repositorio total ocupa 90,1 GB. Las proyecciones BF16 extra incrementan el almacenamiento de pesos cargados en unos 1,55 GiB.
- Memoria: probado en un Apple M5 Max con 128 GB de memoria unificada. La admisión real de peticiones depende de la memoria disponible y del contexto solicitado.
- GPU discreta: no compatible. El formato no carga en Transformers, vLLM, mlx-lm ni exllamav3; requiere el motor nativo Sushi sobre Apple Silicon.
- Sistema operativo: macOS 26.2 o posterior (probado en macOS 26.6). Se requiere Sushi v1.2.2.
- Despliegue: únicamente mediante `sushi serve --model <ruta> --ctx-size 262144`. La descarga se hace con `hf download` porque `sushi pull` solo acepta repositorios `beamster`.
- Caché de borrador: Sushi crea en el primer uso una caché local de aproximadamente 0,72 GiB que no se distribuye con el repositorio.
- Latencia y throughput: en contexto corto, 33,283 tok/s en serie y 46,235 tok/s con DFlash2 (88,5 % de aceptación). La primera petición DFlash de 12 tokens fue más lenta por el coste de primer uso. Son mediciones diagnósticas, no garantías generales.
- Concurrencia: GLM agrupa hasta cuatro peticiones; el flag `--max-concurrent` dimensiona la cola de envío y no actúa como límite estricto de una petición en esta versión.
- Observabilidad: añadir `--metrics` a `sushi serve` habilita `/metrics.json` y `/metrics`; `/props` informa de la configuración del modelo y la memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thelogicalgate/GLM-5.3-Flash-Sushi-2bpw-Abliterated | 50,1B (MoE, activos no disponibles) | 262.144 | Sushi (Apple Silicon) | MIT (DFlash2 CC BY-NC-ND 4.0) | HuggingFace, 0 descargas |
| beamster/GLM-5.3-Flash-Sushi-2bpw (base) | no disponible | no disponible | Sushi (Apple Silicon) | no disponible en la información | HuggingFace |
| dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4 (donante) | no disponible | no disponible | NVFP4 | no disponible en la información | HuggingFace |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada, por lo que no es posible una comparación de rendimiento. Otras alternativas de la misma categoría (modelos MoE abliterated o cuantizados a 2 bits) no disponibles.

## Limitaciones y advertencias

- La reducción de rechazos y la retención de capacidades no se han establecido mediante una evaluación completa de este artefacto; las pruebas son diagnósticos de seis casos por brazo.
- No se generaron etiquetas oficiales de rechazo en las pruebas, por lo que no hay evidencia cuantitativa del efecto abliterated.
- La captura KL del profesor BF16 falló; no se reclama ninguna puntuación KL nueva para este trasplante.
- Los resultados publicados del paquete de origen o del donante no son mediciones de este artefacto.
- Compatibilidad muy restringida: solo carga en Sushi v1.2.2 sobre Apple Silicon con macOS 26.2 o superior. No funciona en Transformers, vLLM, mlx-lm ni exllamav3.
- El paquete publica un contexto de 256K, pero el autor advierte que no se ha probado una carga de ventana completa; la admisión depende de la memoria disponible y del contexto de la petición.
- Los modos "thinking-off" y `medium` no están soportados; solo `high`, `low` y `max`.
- El asistente DFlash2 incluido se distribuye bajo CC BY-NC-ND 4.0, licencia separada y no comercial, a diferencia de la licencia MIT del paquete principal. Esto limita el uso comercial del conjunto.
- Riesgo de alucinación no medido; no se aportan datos al respecto.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles.
- Es un artefacto experimental con 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Página de HuggingFace: https://huggingface.co/thelogicalgate/GLM-5.3-Flash-Sushi-2bpw-Abliterated
- Repositorio de Sushi: https://github.com/beamivalice/sushi
- Instrucciones de uso de Sushi: https://github.com/beamivalice/sushi/blob/main/docs/usage.md
- Modelo base: https://huggingface.co/beamster/GLM-5.3-Flash-Sushi-2bpw
- Modelo donante: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4
